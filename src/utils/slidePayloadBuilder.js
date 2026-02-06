/**
 * Slide Payload Builder
 * 
 * CRITICAL ARCHITECTURE:
 * - Reads ONLY from editor semantic state
 * - NEVER reads from canvas export
 * - NEVER uses image as data source
 * - Canvas = pixels, Editor State = meaning
 * 
 * This module builds backend-ready payloads from:
 * 1. ctaState (from EditorContext)
 * 2. Element custom data (semantic properties stored on canvas elements)
 * 3. Page custom data (slide metadata)
 * 
 * Canvas export is ONLY used for:
 * - Thumbnail generation (optional)
 * - Preview image (optional)
 * NEVER for business data.
 */

import { extractCtasPayload, generateCtaId } from './ctaSchema';

// ============================================
// EXTRACT TEXT ELEMENTS FROM POLOTNO PAGE
// (Reads from element.custom, NOT from canvas pixels)
// ============================================
const extractTextFromPage = (page) => {
    if (!page || !page.children) return null;

    const textElements = page.children.filter(el => el.type === 'text');
    if (textElements.length === 0) return null;

    // Extract semantic text data from element custom properties
    return textElements.map(el => ({
        id: el.id,
        value: el.text || '', // Polotno stores text in element.text
        position: { x: el.x || 0, y: el.y || 0 },
        rotation: el.rotation || 0,
        size: { width: el.width || 0, height: el.height || 0 },
        font: {
            fontFamily: el.fontFamily || 'Arial',
            fontSize: el.fontSize || 16,
            fontStyle: el.fontStyle || 'normal',
            fontWeight: el.fontWeight || 'normal',
        },
        color: el.fill || '#000000',
        // Duration from custom if set
        duration: el.custom?.duration || null,
    }));
};

// ============================================
// EXTRACT CTA ELEMENTS FROM POLOTNO PAGE
// (Reads from element.custom, NOT from canvas pixels)
// ============================================
const extractCtasFromPage = (page) => {
    if (!page || !page.children) return [];

    // CTA elements have custom.ctaType set
    const ctaElements = page.children.filter(el => el.custom?.ctaType);

    return ctaElements.map(el => {
        const custom = el.custom || {};
        const ctaType = custom.ctaType || 'classic';

        return {
            id: el.id,
            type: ctaType,
            content: {
                text: custom.text || '',
                redirectUrl: custom.redirectUrl || '',
                // Product card fields
                productTitle: custom.title || '',
                description: custom.description || '',
                price: custom.price || '',
                originalPrice: custom.originalPrice || '',
                imageUrl: custom.imageUrl || '',
            },
            styling: {
                position: { x: el.x || 0, y: el.y || 0 },
                size: { width: el.width || 0, height: el.height || 0 },
                rotation: el.rotation || 0,
                opacity: el.opacity ?? 1,
                background: custom.bgColor || '',
                textColor: custom.textColor || '',
                fontSize: custom.fontSize || 16,
                borderRadius: custom.borderRadius || 0,
                borderWidth: custom.borderWidth || 0,
                borderColor: custom.borderColor || '',
                arrowSize: custom.arrowSize || 24,
                arrowColor: custom.arrowColor || '',
                arrowAnimation: custom.arrowAnimation !== false,
                transparent: custom.transparent || false,
            },
        };
    });
};

// ============================================
// EXTRACT POLL ELEMENTS FROM PAGE\n// ============================================
const extractPollContent = (page) => {
    if (!page || !page.children) return null;

    const el = page.children.find(el => el.custom?.interactiveType === 'poll');
    if (!el) return null;

    const data = el.custom?.data || {};

    return {
        type: 'poll',
        question: data.question || '',
        options: (data.options || []).map(opt => ({
            id: opt.id || `option_${Math.random().toString(36).substr(2, 9)}`,
            text: opt.text || opt.label || ''
        })),
        layout: {
            type: data.layout || 'horizontal',
            columns: 2
        },
        showResults: !!data.showResults,
        duration: {
            start: 0,
            end: 5
        }
    };
};

const extractPollStyling = (page) => {
    if (!page || !page.children) return null;

    const el = page.children.find(el => el.custom?.interactiveType === 'poll');
    if (!el) return null;

    const style = el.custom?.style || {};

    return {
        position: { x: el.x || 0, y: el.y || 0 },
        size: { width: el.width || 0, height: el.height || 0 },
        rotation: el.rotation || 0,
        opacity: el.opacity !== undefined ? el.opacity : 1,
        radius: style.containerBorderRadius || 12,
        padding: style.containerPadding || 16,
        background: style.containerBgColor || '#FFFFFF',
        question: {
            color: style.questionColor || '#000000',
            fontSize: style.questionFontSize || 16
        },
        options: {
            background: style.optionBgColor || '#FFFFFF',
            textColor: style.optionTextColor || '#000000',
            radius: style.optionBorderRadius || 8
        },
        resultBarColor: style.resultBarColor || '#F97316'
    };
};

// ============================================
// BUILD CONTENT PAYLOAD
// (Semantic/business data - NEVER from canvas pixels)
// ============================================
const buildContentPayload = (editorState, page) => {
    // RULE: Never use defaults silently
    // RULE: Return null for missing fields

    const content = {};

    // 1. Legacy flat fields (optional/fallback)
    if (editorState.link) content.link = editorState.link;
    if (editorState.buttonText) content.button_text = editorState.buttonText;

    // 2. Text elements
    const textElements = extractTextFromPage(page);
    if (textElements && textElements.length > 0) {
        content.text = textElements;
    }

    // 3. CTAs - Map array to keyed objects (cta1, cta2, etc.)
    // SOURCE: editorState.ctas (Array)
    let ctas = [];
    if (Array.isArray(editorState.ctas) && editorState.ctas.length > 0) {
        ctas = editorState.ctas;
    } else if (page) {
        ctas = extractCtasFromPage(page);
    }

    // Map each CTA to cta1, cta2, etc. keys
    ctas.forEach((cta, index) => {
        const key = `cta${index + 1}`;
        const payload = extractCtasPayload([cta])[0]; // Use helper for single CTA

        // Start with state-based content
        let contentData = payload?.content ? { ...payload.content } : {};
        let type = cta.type;

        // SYNC FROM CANVAS (Source of Truth)
        const element = page?.children?.find(el => el.id === cta.id);
        if (element && element.custom) {
            // Content fields
            if (element.custom.text) contentData.text = element.custom.text;
            if (element.custom.redirectUrl) contentData.redirectUrl = element.custom.redirectUrl;
            if (element.custom.title) contentData.productTitle = element.custom.title;
            if (element.custom.price) contentData.price = element.custom.price;
            if (element.custom.originalPrice) contentData.originalPrice = element.custom.originalPrice;
            if (element.custom.description) contentData.description = element.custom.description;
            if (element.custom.imageUrl) contentData.imageUrl = element.custom.imageUrl;

            // Type from canvas overrides state
            if (element.custom.ctaType) type = element.custom.ctaType;
        }

        content[key] = {
            ...contentData,
            type: type
        };
    });

    // 4. Poll section
    const poll = extractPollContent(page);
    if (poll) {
        content.poll = poll;
    }

    return content;
};

// ============================================
// BUILD STYLING PAYLOAD
// (UI/presentation data - NEVER from canvas pixels)
// ============================================
const buildStylingPayload = (editorState, page) => {
    const styling = {};

    // 1. CTA styling - Map to keys cta1, cta2...
    let ctas = [];
    if (Array.isArray(editorState.ctas) && editorState.ctas.length > 0) {
        ctas = editorState.ctas;
    } else if (page) {
        ctas = extractCtasFromPage(page);
    }

    ctas.forEach((cta, index) => {
        const key = `cta${index + 1}`;
        const payload = extractCtasPayload([cta])[0];

        if (payload && payload.styling) {
            // Start with state-based styling (colors, fonts, etc.)
            const mergedStyling = { ...payload.styling };

            // CRITICAL: Sync geometry from Canvas Elements (Source of Truth for Layout)
            // The user interacts with the canvas (drag/resize), so canvas element has the authoritative values.
            const element = page?.children?.find(el => el.id === cta.id);

            if (element) {
                // Geometry
                mergedStyling.position = { x: element.x, y: element.y };
                mergedStyling.size = { width: element.width, height: element.height };
                mergedStyling.rotation = element.rotation || 0;

                // Styling from Custom (Sidebar writes here)
                const custom = element.custom || {};

                // Colors & Appearance
                if (custom.bgColor) mergedStyling.background = custom.bgColor;
                if (custom.textColor) mergedStyling.textColor = custom.textColor;
                if (custom.fontSize) mergedStyling.fontSize = custom.fontSize;
                if (custom.borderRadius !== undefined) mergedStyling.borderRadius = custom.borderRadius;
                if (custom.borderWidth !== undefined) mergedStyling.borderWidth = custom.borderWidth;
                if (custom.borderColor) mergedStyling.borderColor = custom.borderColor;

                // Opacity
                if (custom.opacity !== undefined) mergedStyling.opacity = custom.opacity;
                else if (element.opacity !== undefined) mergedStyling.opacity = element.opacity;

                // Arrow specific
                if (custom.arrowSize) mergedStyling.arrowSize = custom.arrowSize;
                if (custom.arrowColor) mergedStyling.arrowColor = custom.arrowColor;
                if (custom.arrowAnimation !== undefined) mergedStyling.arrowAnimation = custom.arrowAnimation;
                if (custom.transparent !== undefined) mergedStyling.transparent = custom.transparent;
            }

            styling[key] = mergedStyling;
        }
    });

    // 2. Legacy/Global styling
    if (editorState.fullWidthCta !== undefined) {
        styling.fullWidthCta = editorState.fullWidthCta ? 1 : 0;
    }
    if (editorState.rdrType) styling.rdrType = editorState.rdrType;
    if (editorState.pc_redirect_type) styling.pc_redirect_type = editorState.pc_redirect_type;

    // 3. Page-level styling
    if (page?.custom?.background) {
        styling.background = page.custom.background;
    }

    // 4. Poll styling
    const pollStyling = extractPollStyling(page);
    if (pollStyling) {
        styling.poll = pollStyling;
    }

    return styling;
};

// ============================================
// MAIN: BUILD SLIDE PAYLOAD
// ============================================
/**
 * Builds the complete slide payload from editor state.
 * 
 * CRITICAL: This function NEVER reads from canvas export.
 * Canvas export is pixels. This function reads meaning.
 * 
 * @param {Object} options
 * @param {Object} options.editorState - CTA state from EditorContext (ctaState)
 * @param {Object} options.page - Current Polotno page (for element extraction)
 * @param {string} options.groupId - Parent story group ID
 * @param {string|null} options.slideId - Slide ID (for updates)
 * @param {number} options.order - Slide order
 * @returns {Object} - { content, styling, metadata }
 */
export const buildSlidePayload = ({
    editorState = {},
    page = null,
    groupId,
    slideId = null,
    order = 1,
}) => {
    // VALIDATION: groupId is required
    if (!groupId) {
        throw new Error('[buildSlidePayload] groupId is required');
    }

    console.log('[buildSlidePayload] Building payload from editor state...');
    console.log('[buildSlidePayload] Editor state:', editorState);
    console.log('[buildSlidePayload] Page:', page?.id);

    // Build content (semantic data)
    const content = buildContentPayload(editorState, page);

    // Build styling (UI data)
    const styling = buildStylingPayload(editorState, page);

    // Build metadata
    const metadata = {
        parent: groupId,
        order: order,
        ...(slideId ? { id: slideId } : {}),
        originalSlideId: page?.custom?.originalSlideId || slideId || null,
    };

    const payload = {
        content,
        styling,
        metadata,
    };

    console.log('[buildSlidePayload] Final payload:', payload);

    return payload;
};

// ============================================
// CREATE FORM DATA FROM PAYLOAD
// ============================================
/**
 * Converts payload to FormData for backend API.
 * 
 * CRITICAL: Image is OPTIONAL, not primary.
 * Image is appended last, after all semantic data.
 * 
 * @param {Object} payload - From buildSlidePayload
 * @param {File|Blob|null} imageFile - Optional image file (for thumbnail/preview)
 * @returns {FormData}
 */
/**
 * Builds FormData for creating a NEW slide.
 * Appends media if present (since it's new).
 * 
 * @param {Object} payload 
 * @param {Object} media { image, video }
 */
export const buildCreateSlideFormData = (payload, { image, video } = {}) => {
    const formData = new FormData();

    // 1. Metadata
    formData.append('parent', String(payload.metadata.parent));
    formData.append('order', String(payload.metadata.order));

    // 2. Content & Styling
    formData.append('content', JSON.stringify(payload.content));
    formData.append('styling', JSON.stringify(payload.styling));

    // 3. Media (Blind append for Create)
    if (image instanceof File) {
        formData.append('image', image);
    }
    if (video instanceof File) {
        formData.append('video', video);
    } else {
        // Legacy: some endpoints might expect video field
        formData.append('video', '');
    }

    return formData;
};

/**
 * Builds FormData for UPDATING an existing slide.
 * Strictly checks dirty flags.
 * 
 * @param {Object} payload 
 * @param {Object} media { image, video, imageChanged, videoChanged }
 */
export const buildUpdateSlideFormData = (payload, { image, video, imageChanged, videoChanged } = {}) => {
    const formData = new FormData();

    // 1. Metadata
    formData.append('id', String(payload.metadata.id)); // Required for update
    formData.append('parent', String(payload.metadata.parent));
    formData.append('order', String(payload.metadata.order));

    // 2. Content & Styling
    formData.append('content', JSON.stringify(payload.content));
    formData.append('styling', JSON.stringify(payload.styling));

    // 3. Media (CONDITIONAL)
    if (imageChanged && image instanceof File) {
        formData.append('image', image);
        console.log('[buildUpdateSlideFormData] Appending changed IMAGE');
    }

    if (videoChanged && video instanceof File) {
        formData.append('video', video);
        console.log('[buildUpdateSlideFormData] Appending changed VIDEO');
    }

    // CRITICAL: DO NOT APPEND if not changed.

    return formData;
};

// Maintain alias for backward compatibility locally
export const createSlideFormData = buildCreateSlideFormData;

// ============================================
// HYDRATION: Rebuild editor state from backend
// ============================================
/**
 * Rebuilds editor state from backend slide data.
 * 
 * CRITICAL: Never inject backend data directly into canvas.
 * This function produces editor state, not canvas state.
 * 
 * @param {Object} slideData - Slide data from backend
 * @returns {Object} - Editor state ready for context
 */
export const hydrateEditorStateFromSlide = (slideData) => {
    if (!slideData) {
        return {
            link: '',
            buttonText: '',
            ctas: [],
            styling: {},
            fullWidthCta: false,
            rdrType: 'url',
            pc_redirect_type: 'url',
            cta: {},
        };
    }

    // Parse content
    let content = slideData.content || {};
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content);
        } catch (e) {
            content = {};
        }
    }

    // Parse styling
    let styling = slideData.styling || {};
    if (typeof styling === 'string') {
        try {
            styling = JSON.parse(styling);
        } catch (e) {
            styling = {};
        }
    }

    // RECONSTRUCT CTAs ARRAY
    let ctas = [];

    // METHOD A: Legacy array in 'content.ctas'
    if (Array.isArray(content.ctas)) {
        ctas = content.ctas;
    }

    // METHOD B: Keyed properties (cta1, cta2...) - NEW FORMAT
    // Iterate keys cta1 to cta5
    for (let i = 1; i <= 5; i++) {
        const key = `cta${i}`;
        if (content[key]) {
            const ctaContent = content[key];
            const ctaStyling = styling[key] || {};
            const type = ctaContent.type || 'classic'; // Default to classic if type missing

            // CRITICAL: ID must match the one generated in slideToCanvas.js
            // Format: cta-{slideId}-{key}
            const ctaId = slideData.id ? `cta-${slideData.id}-${key}` : generateCtaId();

            ctas.push({
                id: ctaId,
                type: type,
                content: ctaContent,
                styling: ctaStyling
            });
        }
    }

    // Build editor state (NOT canvas state)
    return {
        // Legacy flat fields
        link: content.link || slideData.link || '',
        buttonText: content.button_text || slideData.button_text || '',

        // CTAs array
        ctas: ctas,

        // Text elements (if present)
        text: content.text || null,

        // Interactive
        interactive: content.interactive || null,

        // Styling
        styling: styling,
        fullWidthCta: styling.fullWidthCta === 1 || styling.fullWidthCta === '1',
        rdrType: styling.rdrType || 'url',
        pc_redirect_type: styling.pc_redirect_type || 'url',
        cta: styling.cta || {},
    };
};

// ============================================
// ORDER MANAGEMENT UTILITIES (CRITICAL)
// ============================================

/**
 * Calculate the next order for a new slide.
 * 
 * @param {Array} slides - Array of existing slides (from store or context)
 * @returns {number} - Next unique sequential order
 */
export const calculateNextSlideOrder = (slides = []) => {
    if (!Array.isArray(slides) || slides.length === 0) {
        return 1;
    }

    // Get all valid order numbers
    const orders = slides
        .map(s => parseInt(s.order || s.custom?.order, 10))
        .filter(n => !isNaN(n) && n > 0);

    // If no valid orders, start at length + 1 (safe fallback)
    if (orders.length === 0) {
        return slides.length + 1;
    }

    // Return max + 1
    return Math.max(...orders) + 1;
};

/**
 * Normalize slide orders to be sequential (1, 2, 3...)
 * Used on load/hydrate to fix broken/duplicate orders.
 * 
 * @param {Array} slides - Array of slides to normalize
 * @returns {Array} - New array of slides with corrected orders
 */
export const normalizeSlideOrders = (slides = []) => {
    if (!Array.isArray(slides) || slides.length === 0) return [];

    // Sort by existing order where possible, or ID as fallback deterministic sort
    const sorted = [...slides].sort((a, b) => {
        const orderA = parseInt(a.order || a.custom?.order || 0, 10);
        const orderB = parseInt(b.order || b.custom?.order || 0, 10);

        if (orderA !== orderB) return orderA - orderB;
        if (a.updated_at && b.updated_at) return new Date(a.updated_at) - new Date(b.updated_at);
        return String(a.id || '').localeCompare(String(b.id || ''));
    });

    // Re-assign sequential order
    return sorted.map((slide, index) => ({
        ...slide,
        order: index + 1, // 1-based index
        custom: {
            ...(slide.custom || {}),
            order: index + 1,
        }
    }));
};

export default {
    buildSlidePayload,
    createSlideFormData,
    hydrateEditorStateFromSlide,
    extractTextFromPage,
    extractCtasFromPage,
    calculateNextSlideOrder,
    normalizeSlideOrders,
};
