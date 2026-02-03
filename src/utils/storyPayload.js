import { storyAPI } from '../services/api.js';
import { analyticsApi } from '../services/api.js';

/**
 * Personalization Helpers
 */

let cachedMeta = null;
let inflight = null;

const deriveMetaFromValue = (key, value) => {
    const defaultMeta = { source: "user", field: key };

    if (typeof value === "string") {
        return { source: "user", field: value };
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
        const source =
            typeof value.source === "string" && value.source.trim() !== ""
                ? value.source
                : "user";

        const fieldCandidate =
            (typeof value.field === "string" && value.field) ||
            (typeof value.attribute === "string" && value.attribute) ||
            (typeof value.key === "string" && value.key) ||
            key;

        return { source, field: fieldCandidate };
    }

    return defaultMeta;
};

export const getPersonalisationAttributeMeta = async () => {
    if (cachedMeta) return cachedMeta;
    if (inflight) return inflight;

    inflight = (async () => {
        try {
            const response = await analyticsApi.get('/list-attributes');
            const data = response?.data ?? {};
            const meta = {};

            if (data && typeof data === "object" && !Array.isArray(data)) {
                for (const [key, value] of Object.entries(data)) {
                    meta[key] = deriveMetaFromValue(key, value);
                }
            }

            cachedMeta = meta;
            return meta;
        } catch (e) {
            console.error('Error fetching personalization attributes:', e);
            return {};
        } finally {
            inflight = null;
        }
    })();

    return inflight;
};

const normalizePersonalisationKey = (raw) => {
    const trimmed = (raw ?? '').trim();
    if (!trimmed) return '';
    if (/\s/.test(trimmed)) {
        return trimmed.toLowerCase().replace(/\s+/g, '_');
    }
    return trimmed;
};

const getMetaForKey = (meta, rawKey) => {
    const trimmed = (rawKey ?? '').trim();
    const normalized = normalizePersonalisationKey(trimmed);
    return meta?.[trimmed] || meta?.[normalized] || null;
};

const extractPersonalisationFromText = (text, meta) => {
    if (!text) return {};

    const regex = /\{\{([^}]+)\}\}/g;
    const result = {};

    let match;
    while ((match = regex.exec(text)) !== null) {
        const inner = (match[1] ?? '').trim();
        if (!inner) continue;

        const pipeIndex = inner.indexOf('|');
        const brokenBarIndex = inner.indexOf('¦');
        const commaIndex = inner.indexOf(',');
        const separatorIndex = [pipeIndex, brokenBarIndex, commaIndex]
            .filter((i) => i !== -1)
            .reduce((min, i) => Math.min(min, i), Number.POSITIVE_INFINITY);
        const effectiveSeparatorIndex = Number.isFinite(separatorIndex) ? separatorIndex : -1;

        const parsedKey = (effectiveSeparatorIndex === -1 ? inner : inner.slice(0, effectiveSeparatorIndex)).trim();
        const key = normalizePersonalisationKey(parsedKey);
        if (!key) continue;

        const fallbackValue = effectiveSeparatorIndex === -1 ? '' : inner.slice(effectiveSeparatorIndex + 1).trim();
        const resolvedMeta = getMetaForKey(meta, parsedKey);

        result[key] = {
            source: resolvedMeta?.source || 'user',
            field: resolvedMeta?.field || parsedKey,
            fallback: fallbackValue ? fallbackValue : null,
        };
    }

    return result;
};

const mergePersonalisation = (target, addition) => {
    if (!addition) return;
    for (const [k, v] of Object.entries(addition)) {
        if (v && typeof v === 'object') {
            target[k] = v;
        }
    }
};

export const buildStoryPersonalisationConfigFromCampaignDetails = async (campaignDetails) => {
    const meta = await getPersonalisationAttributeMeta();

    const aggregated = {};
    const groups = campaignDetails?.data?.details || campaignDetails?.details || [];

    if (Array.isArray(groups)) {
        for (const group of groups) {
            const groupName = group?.name || group?.groupName || group?.title || '';
            mergePersonalisation(aggregated, extractPersonalisationFromText(groupName, meta));

            const slides = group?.storygroups || group?.slides || group?.stories || [];
            if (Array.isArray(slides)) {
                for (const slide of slides) {
                    mergePersonalisation(
                        aggregated,
                        extractPersonalisationFromText(slide?.button_text || slide?.ctaText || '', meta)
                    );
                    mergePersonalisation(
                        aggregated,
                        extractPersonalisationFromText(slide?.description || '', meta)
                    );
                }
            }
        }
    }

    return Object.keys(aggregated).length > 0 ? aggregated : null;
};

/**
 * Helper to upload images
 */
export const uploadCampaignImageLink = async (file) => {
    if (!(file instanceof File)) return null;

    try {
        const response = await storyAPI.uploadImageLink(file);
        return response.data?.url || null;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

/**
 * Builds the payload for creating/updating a base campaign.
 */
export const buildCampaignPayload = (campaignData, initialFormData = {}) => {
    const resolveId = (value) => {
        if (!value) return value;
        if (typeof value === 'object') {
            return value.screen_id ?? value.id ?? value.value ?? value;
        }
        return value;
    };

    const resolvedRdtPageName =
        campaignData?.rdtPageName ??
        initialFormData?.rdtPageName ??
        initialFormData?.rdt_page_name;

    const resolvedRdtCustomKeyValuePairs =
        campaignData?.rdtCustomKeyValuePairs ??
        initialFormData?.rdtCustomKeyValuePairs ??
        initialFormData?.rdt_custom_key_value_pairs;

    return {
        ...initialFormData,
        name: campaignData.name || initialFormData.name || "Story Campaign",
        endTime: initialFormData.endTime || null,
        isTimeBound: initialFormData.isTimeBound || false,
        campaign_type: "STR",
        screen: resolveId(campaignData.screen || initialFormData.screen),
        audience: initialFormData.audience || "",
        ...(resolvedRdtPageName !== undefined ? { rdtPageName: resolvedRdtPageName } : {}),
        ...(resolvedRdtCustomKeyValuePairs !== undefined
            ? { rdtCustomKeyValuePairs: resolvedRdtCustomKeyValuePairs }
            : {}),
    };
};

/**
 * Builds the FormData for creating/updating a Story Group.
 */
export const buildStoryGroupFormData = async (campaignId, contentStyling, formData = {}, groupOrder = 0, groupId = null) => {
    const apiFormData = new FormData();
    const groupName = contentStyling.storyGroupText || contentStyling.name || '';

    apiFormData.append("name", groupName);
    apiFormData.append("Campaign", campaignId);
    apiFormData.append("ringColor", contentStyling.ringColor || "#FF6633");
    apiFormData.append("nameColor", contentStyling.textColor || contentStyling.nameColor || "#FF9933");
    apiFormData.append("order", String(groupOrder));
    apiFormData.append("isActive", "true");

    // Clean styling object construction
    const cleanStyling = {
        size: parseInt(contentStyling.width || contentStyling.size || 60),
        cornerRadius: {
            topLeft: parseInt(contentStyling.topLeftRadius ?? contentStyling.cornerRadius?.topLeft ?? 30),
            topRight: parseInt(contentStyling.topRightRadius ?? contentStyling.cornerRadius?.topRight ?? 30),
            bottomLeft: parseInt(contentStyling.bottomLeftRadius ?? contentStyling.cornerRadius?.bottomLeft ?? 30),
            bottomRight: parseInt(contentStyling.bottomRightRadius ?? contentStyling.cornerRadius?.bottomRight ?? 30)
        },
        name: {
            font: contentStyling.fontFamily || contentStyling.name?.font || 'Medium',
            size: parseInt(contentStyling.fontSize || contentStyling.name?.size || 12)
        },
        ringWidth: parseInt(contentStyling.ringStroke || contentStyling.ringWidth || 3),
        slideShowTime: parseInt(contentStyling.slideShowTime) || 5
    };

    // If button styling overrides were provided from the UI
    if (formData && formData.buttonStyling) {
        const { crossButton, soundToggle, share } = formData.buttonStyling;
        if (crossButton) {
            cleanStyling.crossButton = crossButton;
        }
        if (soundToggle) {
            const { option, ...soundToggleWithoutOption } = soundToggle;
            cleanStyling.soundToggle = soundToggleWithoutOption;
        }
        if (share) {
            const { option, ...shareWithoutOption } = share;
            cleanStyling.share = shareWithoutOption;
        }
    }

    // Upload button images (if provided)
    const [crossButtonUrl, muteUrl, unmuteUrl, shareUrl] = await Promise.all([
        formData?.crossButtonFile instanceof File
            ? uploadCampaignImageLink(formData.crossButtonFile).catch((e) => {
                console.error("Failed to upload cross button image:", e);
                return null;
            })
            : Promise.resolve(null),
        formData?.muteButtonFile instanceof File
            ? uploadCampaignImageLink(formData.muteButtonFile).catch((e) => {
                console.error("Failed to upload mute button image:", e);
                return null;
            })
            : Promise.resolve(null),
        formData?.unmuteButtonFile instanceof File
            ? uploadCampaignImageLink(formData.unmuteButtonFile).catch((e) => {
                console.error("Failed to upload unmute button image:", e);
                return null;
            })
            : Promise.resolve(null),
        formData?.shareButtonFile instanceof File
            ? uploadCampaignImageLink(formData.shareButtonFile).catch((e) => {
                console.error("Failed to upload share button image:", e);
                return null;
            })
            : Promise.resolve(null),
    ]);

    // Apply uploaded URLs to styling
    if (crossButtonUrl) {
        cleanStyling.crossButton = {
            ...(cleanStyling.crossButton || {}),
            image: crossButtonUrl
        };
    }

    if (shareUrl) {
        cleanStyling.share = {
            ...(cleanStyling.share || {}),
            image: shareUrl
        };
    }

    if (muteUrl) {
        cleanStyling.soundToggle = {
            ...(cleanStyling.soundToggle || {}),
            mute: {
                ...((cleanStyling.soundToggle || {}).mute || {}),
                image: muteUrl
            }
        };
    }

    if (unmuteUrl) {
        cleanStyling.soundToggle = {
            ...(cleanStyling.soundToggle || {}),
            unmute: {
                ...((cleanStyling.soundToggle || {}).unmute || {}),
                image: unmuteUrl
            }
        };
    }

    apiFormData.append("styling", JSON.stringify(cleanStyling));

    // Handle thumbnail image (including Lottie animations)
    if (contentStyling.thumbnailImage) {
        if (contentStyling.thumbnailImage instanceof File) {
            apiFormData.append("thumbnail", contentStyling.thumbnailImage);
        } else if (contentStyling.thumbnailImage?.file instanceof File) {
            apiFormData.append("thumbnail", contentStyling.thumbnailImage.file);
        }
    }

    // Append button images if provided (legacy/redundant but kept for compatibility)
    if (!crossButtonUrl && formData.crossButtonFile instanceof File) {
        apiFormData.append("crossButtonImage", formData.crossButtonFile);
    }
    if (!muteUrl && formData.muteButtonFile instanceof File) {
        apiFormData.append("muteImage", formData.muteButtonFile);
    }
    if (!unmuteUrl && formData.unmuteButtonFile instanceof File) {
        apiFormData.append("unmuteImage", formData.unmuteButtonFile);
    }
    if (!shareUrl && formData.shareButtonFile instanceof File) {
        apiFormData.append("shareImage", formData.shareButtonFile);
    }

    if (groupId) {
        apiFormData.append("id", groupId);
    }

    return apiFormData;
};

/**
 * Validates if a slide has content to be created.
 */
export const shouldCreateSlide = (slide) => {
    const hasImageFile = slide.image instanceof File;
    const hasVideoFile = slide.video instanceof File;
    const hasImageUrl = slide.image && typeof slide.image === 'string' && slide.image.length > 0;
    const hasPreview = slide.preview || slide.imagePreview;

    return hasImageFile || hasVideoFile || hasImageUrl || hasPreview;
};

/**
 * Builds the FormData for creating a single Story Slide.
 */
export const buildStorySlideFormData = (slide, storyGroupId, index) => {
    const slideFormData = new FormData();

    slideFormData.append("parent", String(storyGroupId));
    slideFormData.append("order", (index + 1).toString());
    slideFormData.append("link", slide.redirectValue || slide.link || "");
    slideFormData.append("button_text", slide.ctaText || slide.button_text || "");
    slideFormData.append("description", slide.description || "");
    slideFormData.append("themes", slide.themes || "");
    slideFormData.append("isActive", slide.isActive !== false ? "1" : "0");
    slideFormData.append("enableCrossButton", slide.enableCrossButton ? "1" : "0");
    slideFormData.append("enableMuteButton", slide.enableMuteButton ? "1" : "0");
    slideFormData.append("enableCTA", slide.enableCTA ? "1" : "0");

    const toNumber = (value, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };

    let slideStyle = slide.styling || {};
    if (typeof slideStyle === 'string') {
        try {
            slideStyle = JSON.parse(slideStyle);
        } catch (e) {
            slideStyle = {};
        }
    }

    const fullWidthCtaResolved = !!(
        slideStyle.fullWidthCta ??
        slideStyle.cta_full_width ??
        slide.cta_full_width ??
        slide.ctaFullWidth ??
        slide.fullWidthCta ??
        false
    );
    slideFormData.append("fullWidthCta", fullWidthCtaResolved ? "1" : "0");

    // Append styling
    let resolvedCorner =
        slideStyle.ctaCornerRadius ??
        slideStyle.cta_corner_radius ??
        slide.ctaCornerRadius ??
        slide.cta_corner_radius;

    if (typeof resolvedCorner === 'string') {
        try {
            resolvedCorner = JSON.parse(resolvedCorner);
        } catch (e) {
            resolvedCorner = {};
        }
    }
    const ctaCornerRadius = {
        topLeft: toNumber(resolvedCorner?.topLeft, 8),
        topRight: toNumber(resolvedCorner?.topRight, 8),
        bottomLeft: toNumber(resolvedCorner?.bottomLeft, 8),
        bottomRight: toNumber(resolvedCorner?.bottomRight, 8),
    };

    const formattedStyling = {
        cta: {
            text: {
                color: slideStyle.cta?.text?.color || slideStyle.ctaText?.fontColor || slideStyle.cta_text_color || "#FFFFFF",
                fontSize: parseInt(slideStyle.cta?.text?.fontSize || slideStyle.ctaText?.fontSize || slideStyle.cta_font_size || 12),
                fontFamily: slideStyle.cta?.text?.fontFamily || slideStyle.ctaText?.font || slideStyle.cta_text_style || "Arial",
                fontDecoration: slideStyle.cta?.text?.fontDecoration || slideStyle.ctaText?.fontDecoration || []
            },
            margin: {
                top: parseInt(slideStyle.cta?.margin?.top || slideStyle.ctaMargins?.top || slideStyle.cta_margin_top || 12),
                left: parseInt(slideStyle.cta?.margin?.left || slideStyle.ctaMargins?.left || slideStyle.cta_margin_left || 12),
                right: parseInt(slideStyle.cta?.margin?.right || slideStyle.ctaMargins?.right || slideStyle.cta_margin_right || 12),
                bottom: parseInt(slideStyle.cta?.margin?.bottom || slideStyle.ctaMargins?.bottom || slideStyle.cta_margin_bottom || 12)
            },
            container: {
                height: parseInt(slideStyle.cta?.container?.height || slideStyle.ctaHeight || slideStyle.cta_height || 32),
                ctaWidth: (slide.enableCTA && !fullWidthCtaResolved) ? toNumber(
                    slideStyle.cta?.container?.ctaWidth ??
                    slideStyle.ctaWidth ??
                    slideStyle.cta_width ??
                    slide.ctaWidth ??
                    slide.cta_width,
                    180
                ) : undefined,
                alignment: slideStyle.cta?.container?.alignment || slideStyle.ctaAlignment || slideStyle.cta_alignment || "center",
                borderColor: slideStyle.cta?.container?.borderColor || slideStyle.ctaBackground?.borderColor || slideStyle.cta_border_color || "#FFFFFF",
                borderWidth: parseInt(slideStyle.cta?.container?.borderWidth || slideStyle.borderWidth || slideStyle.cta_border_stroke || 2),
                ctaFullWidth: fullWidthCtaResolved,
                backgroundColor: slideStyle.cta?.container?.backgroundColor || slideStyle.ctaBackground?.backgroundColor || slideStyle.cta_background || "#F97316"
            },
            cornerRadius: ctaCornerRadius
        }
    };
    slideFormData.append("styling", JSON.stringify(formattedStyling));

    // Handle image/video
    if (slide.image instanceof File) {
        const isVideo = slide.image.type.startsWith('video/');
        if (isVideo) {
            slideFormData.append("video", slide.image);
            slideFormData.append("image", "");
        } else {
            slideFormData.append("image", slide.image);
            slideFormData.append("video", "");
        }
    } else if (slide.video instanceof File) {
        slideFormData.append("video", slide.video);
        slideFormData.append("image", "");
    }

    return slideFormData;
};
