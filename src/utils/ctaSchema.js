/**
 * CTA Schema Utilities
 * 
 * Provides:
 * - CTA type definitions
 * - Default values per type
 * - Payload extraction for backend
 * - Validation helpers
 * 
 * Schema Structure:
 * {
 *   id: string,
 *   type: 'classic' | 'swipeUp' | 'imageCTA' | 'visit' | 'describe',
 *   content: { ... type-specific data },
 *   styling: { ... type-specific styling }
 * }
 */

// ============================================
// CTA TYPES
// ============================================
export const CTA_TYPES = {
    CLASSIC: 'classic',
    SWIPE_UP: 'swipeUp',
    IMAGE_CTA: 'imageCTA',
    VISIT: 'visit',
    DESCRIBE: 'describe',
};

// ============================================
// DEFAULT VALUES PER CTA TYPE
// ============================================
export const CTA_DEFAULTS = {
    classic: {
        content: {
            text: 'Shop Now',
            redirectUrl: '',
        },
        styling: {
            position: { x: 300, y: 1500 },
            size: { width: 480, height: 144 },
            rotation: 0,
            opacity: 1,
            background: '#F97316',
            textColor: '#FFFFFF',
            fontSize: 48,
            borderRadius: 24,
            borderWidth: 0,
            borderColor: '#FFFFFF',
            animation: {},
        },
    },

    swipeUp: {
        content: {
            text: 'Swipe Up',
            redirectUrl: '',
        },
        styling: {
            position: { x: 420, y: 1680 },
            size: { width: 240, height: 300 },
            arrowSize: 72,
            rotation: 0,
            opacity: 1,
            background: '#000000',
            transparent: true,
            textColor: '#FFFFFF',
            arrowColor: '#FFFFFF',
            arrowAnimation: true,
            fontSize: 42,
            borderRadius: 60,
            animation: {},
        },
    },

    imageCTA: {
        content: {
            redirectUrl: '',
            imageUrl: '',
            altText: '',
        },
        styling: {
            position: { x: 300, y: 1200 },
            size: { width: 480, height: 480 },
            rotation: 0,
            opacity: 1,
            cornerRadius: 36,
            borderWidth: 0,
            borderColor: '#FFFFFF',
            animation: {},
        },
    },

    visit: {
        content: {
            redirectUrl: '',
            productTitle: 'Product Name',
            description: '',
            price: '$0',
            originalPrice: '',
            showPrice: true,
        },
        styling: {
            position: { x: 60, y: 1200 },
            size: { width: 960, height: 540 },
            rotation: 0,
            opacity: 1,
            background: '#FFFFFF',
            radius: 48,
            shadow: true,
            textColor: '#1a1a2e',
            fontSize: 42,
            fontWeight: '600',
            arrowColor: '#1a1a2e',
            priceBackground: '#334155',
            priceRadius: 24,
            priceColor: '#FFFFFF',
            animation: {},
        },
    },

    describe: {
        content: {
            redirectUrl: '',
            productUrl: '',
            productTitle: 'Product Name',
            price: '$0',
        },
        styling: {
            position: { x: 60, y: 1200 },
            size: { width: 960, height: 480 },
            rotation: 0,
            opacity: 1,
            background: '#FFFFFF',
            radius: 48,
            shadow: true,
            textColor: '#1a1a2e',
            fontSize: 42,
            fontWeight: '600',
            arrowColor: '#1a1a2e',
            priceBackground: '#e67e22',
            priceRadius: 24,
            priceColor: '#FFFFFF',
            animation: {},
        },
    },
};

// ============================================
// REQUIRED FIELDS PER CTA TYPE (for payload extraction)
// ============================================
const REQUIRED_FIELDS = {
    classic: {
        content: ['text', 'redirectUrl'],
        styling: ['position', 'size', 'background', 'textColor', 'fontSize', 'borderRadius'],
    },
    swipeUp: {
        content: ['text', 'redirectUrl'],
        styling: ['position', 'arrowSize', 'arrowAnimation', 'background', 'textColor'],
    },
    imageCTA: {
        content: ['redirectUrl', 'imageUrl', 'altText'],
        styling: ['position', 'size', 'cornerRadius'],
    },
    visit: {
        content: ['redirectUrl', 'productTitle', 'price', 'originalPrice', 'showPrice'],
        styling: ['position', 'background', 'textColor', 'priceBackground', 'priceColor'],
    },
    describe: {
        content: ['redirectUrl', 'productUrl', 'productTitle', 'price'],
        styling: ['position', 'background', 'textColor'],
    },
};

// ============================================
// UTILITY: Generate unique CTA ID
// ============================================
export const generateCtaId = () => {
    return `cta_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

// ============================================
// UTILITY: Create new CTA instance with defaults
// ============================================
export const createCta = (type, overrides = {}) => {
    const defaults = CTA_DEFAULTS[type];
    if (!defaults) {
        console.warn(`[ctaSchema] Unknown CTA type: ${type}`);
        return null;
    }

    return {
        id: generateCtaId(),
        type,
        content: {
            ...defaults.content,
            ...(overrides.content || {}),
        },
        styling: {
            ...defaults.styling,
            ...(overrides.styling || {}),
        },
    };
};

// ============================================
// UTILITY: Extract required payload for a single CTA
// ============================================
export const extractCtaPayload = (cta) => {
    if (!cta || !cta.type) return null;

    const requiredFields = REQUIRED_FIELDS[cta.type];
    if (!requiredFields) {
        // Unknown type, return as-is
        return {
            id: cta.id,
            type: cta.type,
            content: cta.content || {},
            styling: cta.styling || {},
        };
    }

    // Extract only required content fields
    const content = {};
    for (const field of requiredFields.content) {
        if (cta.content && cta.content[field] !== undefined) {
            content[field] = cta.content[field];
        }
    }

    // Extract only required styling fields
    const styling = {};
    for (const field of requiredFields.styling) {
        if (cta.styling && cta.styling[field] !== undefined) {
            styling[field] = cta.styling[field];
        }
    }

    return {
        id: cta.id,
        type: cta.type,
        content,
        styling,
    };
};

// ============================================
// UTILITY: Extract payload for all CTAs
// ============================================
export const extractCtasPayload = (ctas) => {
    if (!Array.isArray(ctas)) return [];
    return ctas.map(extractCtaPayload).filter(Boolean);
};

// ============================================
// UTILITY: Validate CTA structure
// ============================================
export const validateCta = (cta) => {
    if (!cta) return { valid: false, errors: ['CTA is null or undefined'] };

    const errors = [];

    if (!cta.id) errors.push('Missing id');
    if (!cta.type) errors.push('Missing type');
    if (!CTA_TYPES[cta.type.toUpperCase().replace(/-/g, '_')] && !Object.values(CTA_TYPES).includes(cta.type)) {
        errors.push(`Unknown type: ${cta.type}`);
    }
    if (!cta.content || typeof cta.content !== 'object') {
        errors.push('Missing or invalid content object');
    }
    if (!cta.styling || typeof cta.styling !== 'object') {
        errors.push('Missing or invalid styling object');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

// ============================================
// UTILITY: Migrate legacy single CTA to array format
// ============================================
export const migrateLegacyCta = (legacyCta) => {
    if (!legacyCta) return [];

    // If already an array, return as-is
    if (Array.isArray(legacyCta)) return legacyCta;

    // Convert legacy flat object to array with one CTA
    const type = legacyCta.ctaType || legacyCta.type || 'classic';

    return [
        {
            id: legacyCta.id || generateCtaId(),
            type,
            content: {
                text: legacyCta.text || legacyCta.buttonText || '',
                redirectUrl: legacyCta.redirectUrl || legacyCta.link || '',
                ...(type === 'visit' || type === 'describe' ? {
                    productTitle: legacyCta.title || legacyCta.productTitle || '',
                    price: legacyCta.price || '',
                    description: legacyCta.description || '',
                } : {}),
            },
            styling: {
                position: legacyCta.position || { x: 100, y: 500 },
                size: legacyCta.size || { width: 160, height: 48 },
                background: legacyCta.bgColor || legacyCta.background || '#F97316',
                textColor: legacyCta.textColor || '#FFFFFF',
                fontSize: legacyCta.fontSize || 16,
                borderRadius: legacyCta.borderRadius || 8,
                ...(legacyCta.styling || {}),
            },
        },
    ];
};

// ============================================
// UTILITY: Find CTA by ID in array
// ============================================
export const findCtaById = (ctas, ctaId) => {
    if (!Array.isArray(ctas)) return null;
    return ctas.find(c => c.id === ctaId) || null;
};

// ============================================
// UTILITY: Update CTA in array (immutable)
// ============================================
export const updateCtaInArray = (ctas, ctaId, updates) => {
    if (!Array.isArray(ctas)) return ctas;

    return ctas.map(cta => {
        if (cta.id !== ctaId) return cta;

        return {
            ...cta,
            content: {
                ...cta.content,
                ...(updates.content || {}),
            },
            styling: {
                ...cta.styling,
                ...(updates.styling || {}),
            },
        };
    });
};

// ============================================
// UTILITY: Remove CTA from array (immutable)
// ============================================
export const removeCtaFromArray = (ctas, ctaId) => {
    if (!Array.isArray(ctas)) return ctas;
    return ctas.filter(cta => cta.id !== ctaId);
};

// ============================================
// UTILITY: Add CTA to array (immutable)
// ============================================
export const addCtaToArray = (ctas, newCta) => {
    if (!Array.isArray(ctas)) return [newCta];
    return [...ctas, newCta];
};

// ============================================
// DEFAULT EMPTY CTA STATE
// ============================================
export const DEFAULT_CTAS_STATE = [];

export default {
    CTA_TYPES,
    CTA_DEFAULTS,
    generateCtaId,
    createCta,
    extractCtaPayload,
    extractCtasPayload,
    validateCta,
    migrateLegacyCta,
    findCtaById,
    updateCtaInArray,
    removeCtaFromArray,
    addCtaToArray,
    DEFAULT_CTAS_STATE,
};
