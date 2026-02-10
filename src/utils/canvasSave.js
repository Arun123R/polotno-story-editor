/**
 * Canvas Serialization & Save Flow
 * Converts Polotno editor state to backend-compatible JSON payload
 */

import { store } from '../store/polotnoStore.js';
import { storyService } from '../services/storyService.js';
import { getStoreExportScale, getStorePresetName } from './scale.js';

/**
 * Serialize a single element to backend JSON format
 * Captures ALL element properties including position, size, styling, and interactions
 */
const serializeElement = (element) => {
    if (!element) return null;

    const baseElement = {
        // Core identification
        id: element.id,
        type: element.type,
        name: element.name || '',

        // Position & Transform
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || 0,
        height: element.height || 0,
        rotation: element.rotation || 0,

        // Z-index / Layer order
        zIndex: element.zIndex,

        // Visibility & Opacity
        visible: element.visible !== false,
        opacity: element.opacity !== undefined ? element.opacity : 1,

        // Locking
        locked: element.locked || false,
        selectable: element.selectable !== false,
        draggable: element.draggable !== false,

        // Timing (for animations/visibility control)
        custom: element.custom || {},
    };

    // Type-specific properties
    switch (element.type) {
        case 'text':
            return {
                ...baseElement,
                text: element.text || '',
                fontSize: element.fontSize || 14,
                fontFamily: element.fontFamily || 'Arial',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                fill: element.fill || '#000000',
                align: element.align || 'left',
                verticalAlign: element.verticalAlign || 'top',
                lineHeight: element.lineHeight || 1.2,
                letterSpacing: element.letterSpacing || 0,
                strokeWidth: element.strokeWidth || 0,
                stroke: element.stroke || '#000000',
                backgroundColor: element.backgroundColor || '',
                padding: element.padding || 0,
                paddingX: element.paddingX,
                paddingY: element.paddingY,
                cornerRadius: element.cornerRadius || 0,
                backgroundCornerRadius: element.backgroundCornerRadius,
                shadowEnabled: element.shadowEnabled || false,
                shadowBlur: element.shadowBlur || 0,
                shadowOffsetX: element.shadowOffsetX || 0,
                shadowOffsetY: element.shadowOffsetY || 0,
                shadowColor: element.shadowColor || '#000000',
                shadowOpacity: element.shadowOpacity || 1,
            };

        case 'image':
            return {
                ...baseElement,
                src: element.src || '',
                cropX: element.cropX || 0,
                cropY: element.cropY || 0,
                cropWidth: element.cropWidth || 1,
                cropHeight: element.cropHeight || 1,
                flipX: element.flipX || false,
                flipY: element.flipY || false,
                borderColor: element.borderColor || '',
                borderSize: element.borderSize || 0,
                cornerRadius: element.cornerRadius || 0,
                shadowEnabled: element.shadowEnabled || false,
                shadowBlur: element.shadowBlur || 0,
                shadowOffsetX: element.shadowOffsetX || 0,
                shadowOffsetY: element.shadowOffsetY || 0,
                shadowColor: element.shadowColor || '#000000',
                shadowOpacity: element.shadowOpacity || 1,
                filters: element.filters || [],
                brightness: element.brightness,
                contrast: element.contrast,
                saturation: element.saturation,
                blur: element.blur,
            };

        case 'svg':
            return {
                ...baseElement,
                src: element.src || '',
                colors: element.colors || [],
                keepRatio: element.keepRatio !== false,
            };

        case 'video':
            return {
                ...baseElement,
                src: element.src || '',
                preview: element.preview || '',
                duration: element.duration,
                volume: element.volume !== undefined ? element.volume : 1,
                loop: element.loop || false,
                autoplay: element.autoplay || false,
                cropX: element.cropX || 0,
                cropY: element.cropY || 0,
                cropWidth: element.cropWidth || 1,
                cropHeight: element.cropHeight || 1,
                cornerRadius: element.cornerRadius || 0,
            };

        case 'figure':
            return {
                ...baseElement,
                fill: element.fill || '#000000',
                stroke: element.stroke || '',
                strokeWidth: element.strokeWidth || 0,
                cornerRadius: element.cornerRadius || 0,
                shadowEnabled: element.shadowEnabled || false,
                shadowBlur: element.shadowBlur || 0,
                shadowOffsetX: element.shadowOffsetX || 0,
                shadowOffsetY: element.shadowOffsetY || 0,
                shadowColor: element.shadowColor || '#000000',
                shadowOpacity: element.shadowOpacity || 1,
            };

        case 'line':
            return {
                ...baseElement,
                stroke: element.stroke || '#000000',
                strokeWidth: element.strokeWidth || 2,
                dash: element.dash || [],
                points: element.points || [],
            };

        case 'group':
            return {
                ...baseElement,
                children: (element.children || []).map(serializeElement).filter(Boolean),
            };

        default:
            // Generic element - capture all known properties
            return baseElement;
    }
};

/**
 * Serialize a single page/slide to backend JSON format
 */
const serializePage = (page) => {
    if (!page) return null;

    const bg = typeof page.background === 'string' ? page.background : '#ffffff';
    const isUrlLike = /^(data:|blob:|https?:\/\/)/i.test(String(bg).trim());
    const isGradient = String(bg).includes('linear-gradient');

    return {
        id: page.id,

        // Page dimensions (usually 'auto' to follow store size)
        width: page.width,
        height: page.height,

        // Background
        background: bg || '#ffffff',
        // Backward-compatible field for older payload consumers.
        backgroundImage: isUrlLike && !isGradient ? bg : '',

        // Duration (in milliseconds)
        duration: page.duration || 5000,

        // Custom metadata (includes timing, mute state, etc.)
        custom: page.custom || {},

        // All elements on this page
        children: (page.children || []).map(serializeElement).filter(Boolean),
    };
};

/**
 * Build complete canvas payload from Polotno store
 * This is the SINGLE SOURCE OF TRUTH for canvas state
 */
export const buildCanvasPayload = (targetStore = store) => {
    // Canvas/Store level properties
    const canvasPayload = {
        // Canvas dimensions (1080px-based resolution)
        width: targetStore.width || 1080,
        height: targetStore.height || 1920,

        // Preset information (exportScale is now always 1)
        preset: getStorePresetName(targetStore),
        exportScale: getStoreExportScale(targetStore),

        // Custom store metadata
        custom: targetStore.custom || {},

        // All pages/slides
        pages: (targetStore.pages || []).map(serializePage).filter(Boolean),

        // Metadata
        version: '1.0',
        createdAt: new Date().toISOString(),
    };

    return canvasPayload;
};

/**
 * Validate canvas payload before sending to backend
 */
export const validateCanvasPayload = (payload) => {
    const errors = [];

    if (!payload) {
        errors.push('Payload is null or undefined');
        return { isValid: false, errors };
    }

    if (!payload.width || !payload.height) {
        errors.push('Canvas dimensions are required');
    }

    if (!Array.isArray(payload.pages) || payload.pages.length === 0) {
        errors.push('At least one page is required');
    }

    // Validate each page
    payload.pages?.forEach((page, index) => {
        if (!page.id) {
            errors.push(`Page ${index} is missing an ID`);
        }

        if (!Array.isArray(page.children)) {
            errors.push(`Page ${index} has invalid children array`);
        }

        // Validate each element
        page.children?.forEach((element, elemIndex) => {
            if (!element.id) {
                errors.push(`Page ${index}, Element ${elemIndex} is missing an ID`);
            }
            if (!element.type) {
                errors.push(`Page ${index}, Element ${elemIndex} is missing a type`);
            }
            if (element.x === undefined || element.y === undefined) {
                errors.push(`Page ${index}, Element ${elemIndex} is missing position`);
            }
            if (element.width === undefined || element.height === undefined) {
                errors.push(`Page ${index}, Element ${elemIndex} is missing dimensions`);
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Convert canvas payload to Story Slide format for backend
 * Maps Polotno canvas structure to Story Campaign API schema
 */
export const convertCanvasToStorySlide = (canvasPayload, slideMetadata = {}) => {
    if (!canvasPayload || !canvasPayload.pages || canvasPayload.pages.length === 0) {
        throw new Error('Invalid canvas payload: no pages found');
    }

    // For now, we'll use the first page as the slide content
    // In a multi-page scenario, you'd create multiple slides
    const page = canvasPayload.pages[0];

    return {
        // Slide metadata
        order: slideMetadata.order || 1,
        isActive: slideMetadata.isActive !== false,

        // Canvas data (stored as JSON in backend)
        canvasData: canvasPayload,

        // Page-level properties
        duration: page.duration || 5000,
        background: page.background || '#ffffff',

        // CTA/Button configuration (if any CTA elements exist)
        enableCTA: slideMetadata.enableCTA || false,
        button_text: slideMetadata.button_text || '',
        link: slideMetadata.link || '',

        // Feature toggles
        enableCrossButton: slideMetadata.enableCrossButton || false,
        enableMuteButton: slideMetadata.enableMuteButton || false,

        // Styling (CTA button styling)
        styling: slideMetadata.styling || {},

        // Description
        description: slideMetadata.description || '',
        themes: slideMetadata.themes || '',
    };
};

/**
 * Main Save Handler
 * 
 * BACKEND CONTRACT (STRICT):
 * - Uses multipart/form-data
 * - Splits data into: content (semantic) vs styling (presentation)
 * - Does NOT send canvasData to backend
 * - Matches dashboard behavior exactly
 */
export const handleSave = async (options = {}) => {
    try {
        console.log('🔄 Starting save flow...');

        // Extract options
        const {
            store: passedStore,
            groupId,
            slideId,
            contentData = {},  // Semantic/business data
            stylingData = {},  // UI/presentation data
            onSuccess,
            onError,
        } = options;

        // Use passed store or fallback to global store
        const storeToUse = passedStore || window.store || store;

        if (!storeToUse) {
            throw new Error('No store available - cannot build canvas payload');
        }

        // Step 1: Prepare for backend
        if (!groupId) {
            throw new Error('groupId is required for saving');
        }

        // Step 2: Build FormData following STRICT backend contract
        const formData = new FormData();

        // REQUIRED: Core fields
        formData.append("parent", String(groupId));
        formData.append("order", String(contentData.order || 1));

        // CONTENT (semantic/business data) - sent as JSON string
        // Contains: link, button_text, image (URL), video (URL), ctas (array)
        const content = {
            link: contentData.link || "",
            button_text: contentData.buttonText || contentData.button_text || "",
            image: null,  // Will be uploaded as binary, not URL
            video: null,  // Will be uploaded as binary, not URL
            // NEW: Include CTAs array
            ctas: contentData.ctas || [],
        };
        formData.append("content", JSON.stringify(content));
        console.log('📝 Content payload:', content);

        // STYLING (UI/presentation data) - sent as JSON string
        // Contains: fullWidthCta, rdrType, pc_redirect_type, cta (styling object)
        const styling = {
            fullWidthCta: stylingData.fullWidthCta ? 1 : 0,
            rdrType: stylingData.rdrType || "url",
            pc_redirect_type: stylingData.pc_redirect_type || "url",
            cta: stylingData.cta || {},
        };
        formData.append("styling", JSON.stringify(styling));
        console.log('🎨 Styling payload:', styling);

        // Step 3: Export canvas as image and add to formData
        console.log('📸 Exporting canvas as image...');
        try {
            const store = window.store || storeToUse;
            if (store && store.pages && store.pages.length > 0) {
                const firstPage = store.pages[0];
                const dataURL = await store.toDataURL({ pageId: firstPage.id, pixelRatio: 2 });

                // Convert dataURL to Blob
                const response = await fetch(dataURL);
                const blob = await response.blob();

                // Create File from Blob
                const imageFile = new File([blob], 'slide-image.png', { type: 'image/png' });

                // MEDIA: Binary upload (not in content JSON)
                formData.append("image", imageFile);
                console.log('✅ Canvas image exported and added to payload');
            } else {
                console.warn('⚠️ No store or pages found, sending without image');
            }
        } catch (error) {
            console.error('❌ Error exporting canvas image:', error);
        }

        // Video field (empty for now, can be populated if video upload is needed)
        if (!formData.has("video")) {
            formData.append("video", "");
        }

        // If updating existing slide, add ID
        if (slideId) {
            formData.append("id", String(slideId));
        }

        console.log('📤 Sending to backend:', {
            endpoint: slideId ? 'UPDATE /api/v1/slides/:id' : 'CREATE /api/v1/slides',
            groupId,
            slideId,
            hasContent: true,
            hasStyling: true,
        });

        // Step 4: Import storyAPI and send to backend
        const { storyAPI } = await import('../services/api.js');

        let response;
        if (slideId) {
            // Update existing slide
            console.log('📝 Updating existing slide...');
            response = await storyAPI.updateStorySlide(formData);
        } else {
            // Create new slide
            console.log('➕ Creating new slide...');
            response = await storyAPI.createStorySlide(formData);
        }

        // Step 5: Handle response
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Save successful:', response.data);
            onSuccess?.(response.data);
            return {
                success: true,
                data: response.data,
            };
        } else {
            console.error('❌ Save failed:', response.statusText);
            onError?.(response.statusText);
            return {
                success: false,
                error: response.statusText,
            };
        }

    } catch (error) {
        console.error('❌ Save error:', error);
        console.error('❌ Error response data:', error.response?.data);
        console.error('❌ Error response status:', error.response?.status);
        console.error('❌ Full error:', JSON.stringify(error.response?.data, null, 2));

        const errorMessage = error.response?.data?.error
            || error.response?.data?.message
            || JSON.stringify(error.response?.data)
            || error.message;

        options.onError?.(errorMessage);
        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Save current canvas as a new slide in a story group
 */
export const saveAsNewSlide = async (groupId, slideMetadata = {}) => {
    return handleSave({
        groupId,
        slideMetadata: {
            ...slideMetadata,
            id: undefined, // Force creation of new slide
        },
        onSuccess: (data) => {
            console.log('New slide created:', data);
        },
        onError: (error) => {
            console.error('Failed to create slide:', error);
        },
    });
};

/**
 * Update an existing slide with current canvas state
 */
export const updateExistingSlide = async (slideId, groupId, slideMetadata = {}) => {
    return handleSave({
        groupId,
        slideMetadata: {
            ...slideMetadata,
            id: slideId,
        },
        onSuccess: (data) => {
            console.log('Slide updated:', data);
        },
        onError: (error) => {
            console.error('Failed to update slide:', error);
        },
    });
};

/**
 * Export canvas payload as JSON (for debugging or manual inspection)
 */
export const exportCanvasJSON = () => {
    const payload = buildCanvasPayload(store);
    const json = JSON.stringify(payload, null, 2);

    // Create downloadable file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvas-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return payload;
};

/**
 * Load canvas from JSON payload (restore canvas state)
 */
export const loadCanvasFromPayload = (payload, targetStore = store) => {
    if (!payload || !payload.pages) {
        throw new Error('Invalid payload: missing pages');
    }

    try {
        // Clear existing pages
        while (targetStore.pages.length > 0) {
            targetStore.deletePage(targetStore.pages[0].id);
        }

        // Set canvas dimensions
        if (payload.width && payload.height) {
            targetStore.setSize(payload.width, payload.height);
        }

        // Restore custom metadata
        if (payload.custom) {
            targetStore.set({ custom: payload.custom });
        }

        // Load each page
        payload.pages.forEach((pageData) => {
            const page = targetStore.addPage();

            // Set page properties
            const incomingBackground = pageData.background || '';
            const incomingBackgroundImage = pageData.backgroundImage || '';
            const resolvedBackground = incomingBackground || incomingBackgroundImage;
            if (resolvedBackground) {
                page.set({ background: resolvedBackground });
            }
            if (pageData.duration) {
                page.set({ duration: pageData.duration });
            }
            if (pageData.custom) {
                page.set({ custom: pageData.custom });
            }

            // Add elements
            pageData.children?.forEach((elementData) => {
                page.addElement(elementData);
            });
        });

        console.log('✅ Canvas loaded from payload');
        return true;
    } catch (error) {
        console.error('❌ Failed to load canvas:', error);
        throw error;
    }
};

/**
 * Converts a backend Slide object (without canvasData) into a Polotno Canvas Payload.
 * Maps legacy fields (image, buttons, styling) to a reconstructred visual state.
 */
/**
 * Converts a single backend Slide object into a Polotno Page object.
 */
const convertSlideToPage = (slide) => {
    // Default canvas dimensions (1080px-based)
    const width = 1080;
    const height = 1920;

    // 1. Resolve Background
    let background = '#ffffff';
    if (slide.image && typeof slide.image === 'string') {
        background = slide.image;
    } else if (slide.video && typeof slide.video === 'string') {
        background = slide.videoPreview || '#000000';
    }

    // 2. Resolve Elements (CTA)
    const children = [];

    // Video Element
    if (slide.video && typeof slide.video === 'string') {
        children.push({
            id: 'video-' + slide.id,
            type: 'video',
            x: 0,
            y: 0,
            width: width,
            height: height,
            src: slide.video,
            locked: true,
        });
    }

    // CTA Button
    if (slide.button_text) {
        let styling = slide.styling || {};
        if (typeof styling === 'string') {
            try { styling = JSON.parse(styling); } catch (e) { }
        }

        // Handle flattened styling structure seen in screenshot (font, size, etc might be at top level or nested)
        // Adjusting strategy to be defensive
        const ctaStyle = styling.cta || {}; // Try standard path
        const containerStyle = ctaStyle.container || {};
        const textStyle = ctaStyle.text || styling.font || {}; // Fallback to 'font' key if present

        const ctaWidth = parseInt(containerStyle.ctaWidth) || 180;
        const ctaHeight = parseInt(containerStyle.height) || 40;
        const ctaX = (width - ctaWidth) / 2;
        const ctaY = height - ctaHeight - 50;

        children.push({
            id: 'cta-bg-' + slide.id,
            type: 'figure',
            name: 'cta-background',
            x: ctaX,
            y: ctaY,
            width: ctaWidth,
            height: ctaHeight,
            fill: containerStyle.backgroundColor || '#F97316',
            stroke: containerStyle.borderColor || '',
            strokeWidth: parseInt(containerStyle.borderWidth) || 0,
            cornerRadius: parseInt(containerStyle.cornerRadius?.topLeft) || 8,
        });

        children.push({
            id: 'cta-text-' + slide.id,
            type: 'text',
            name: 'cta-text',
            text: slide.button_text,
            fontSize: parseInt(textStyle.size || textStyle.fontSize) || 14,
            fontFamily: textStyle.family || textStyle.fontFamily || 'Arial',
            fill: textStyle.color || '#FFFFFF',
            align: 'center',
            verticalAlign: 'middle',
            width: ctaWidth,
            x: ctaX,
            y: ctaY + (ctaHeight / 2) - ((parseInt(textStyle.size || textStyle.fontSize) || 14) / 2),
        });
    }

    return {
        id: slide.id || Math.random().toString(36).substr(2, 9),
        width,
        height,
        background,
        duration: slide.duration || 5000,
        custom: {
            isActive: slide.isActive !== false,
            originalSlideId: slide.id,
            order: slide.order
        },
        children
    };
};

/**
 * Converts a backend Slide object (without canvasData) into a Polotno Canvas Payload.
 * Maps legacy fields to a reconstructed visual state.
 * [Kept for backward compatibility with single-slide calls]
 */
export const convertBackendSlideToCanvasPayload = (slide) => {
    if (!slide) return null;
    const page = convertSlideToPage(slide);
    return {
        width: 1080,
        height: 1920,
        pages: [page],
        custom: { reconstructed: true }
    };
};

/**
 * Converts an array of slides (a Story Group) into a full multi-page Polotno Payload.
 */
export const convertStoryGroupToCanvasPayload = (slides) => {
    if (!Array.isArray(slides) || slides.length === 0) return null;

    // Sort by order
    const sortedSlides = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));

    const pages = sortedSlides.map(slide => {
        // If the slide has rich canvasData, use it!
        if (slide.canvasData) {
            try {
                const payload = typeof slide.canvasData === 'string'
                    ? JSON.parse(slide.canvasData)
                    : slide.canvasData;
                // We only need the page object from this payload
                // Assuming payload.pages[0] is the relevant one
                if (payload.pages && payload.pages.length > 0) {
                    const richPage = payload.pages[0];
                    richPage.id = slide.id; // Ensure ID matches
                    return richPage;
                }
            } catch (e) { /* ignore */ }
        }
        // Fallback: Map from legacy fields
        return convertSlideToPage(slide);
    });

    return {
        width: 1080,
        height: 1920,
        pages: pages,
        custom: { reconstructedGroup: true }
    };
};
