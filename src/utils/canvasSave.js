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
        // Canvas dimensions (working size)
        width: targetStore.width || 360,
        height: targetStore.height || 640,

        // Preset information for export scaling
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
 * Sends canvas JSON payload directly to backend API endpoint
 */
export const handleSave = async (options = {}) => {
    try {
        console.log('🔄 Starting save flow...');

        // Extract options
        const {
            store: passedStore,
            groupId,
            slideId,
            slideMetadata = {},
            onSuccess,
            onError,
        } = options;

        // Use passed store or fallback to global store
        const storeToUse = passedStore || window.store || store;

        if (!storeToUse) {
            throw new Error('No store available - cannot build canvas payload');
        }

        // Step 1: Build canvas payload from editor state
        const canvasPayload = buildCanvasPayload(storeToUse);
        console.log('📦 Canvas payload built:', canvasPayload);

        // Step 2: Validate payload
        const validation = validateCanvasPayload(canvasPayload);
        if (!validation.isValid) {
            console.error('❌ Validation failed:', validation.errors);
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        console.log('✅ Payload validated');

        // Step 3: Prepare for backend
        if (!groupId) {
            throw new Error('groupId is required for saving');
        }

        // Step 4: Build FormData with canvas JSON
        const formData = new FormData();

        // Add parent group ID
        formData.append("parent", String(groupId));

        // Add slide metadata (matching dashboard format)
        formData.append("order", String(slideMetadata.order || 1));
        formData.append("isActive", slideMetadata.isActive !== false ? "true" : "false"); // Changed to "true"/"false"
        formData.append("link", slideMetadata.link || "");
        formData.append("button_text", slideMetadata.button_text || "");
        formData.append("fullWidthCta", slideMetadata.fullWidthCta ? "1" : "0");

        // Add styling if provided, otherwise use empty object
        formData.append("styling", JSON.stringify(slideMetadata.styling || {}));

        // Add canvas JSON payload as a custom field
        formData.append("canvasData", JSON.stringify(canvasPayload));

        // Export canvas as image and add to formData
        console.log('📸 Exporting canvas as image...');
        try {
            const store = window.store; // Get store from window
            if (store && store.pages && store.pages.length > 0) {
                const firstPage = store.pages[0];
                const dataURL = await store.toDataURL({ pageId: firstPage.id, pixelRatio: 2 });

                // Convert dataURL to Blob
                const response = await fetch(dataURL);
                const blob = await response.blob();

                // Create File from Blob
                const imageFile = new File([blob], 'slide-image.png', { type: 'image/png' });

                formData.append("image", imageFile);
                formData.append("video", ""); // Empty video field
                console.log('✅ Canvas image exported and added to payload');
            } else {
                console.warn('⚠️ No store or pages found, sending without image');
                formData.append("image", "");
                formData.append("video", "");
            }
        } catch (error) {
            console.error('❌ Error exporting canvas image:', error);
            formData.append("image", "");
            formData.append("video", "");
        }

        // If updating existing slide, add ID
        if (slideId) {
            formData.append("id", String(slideId));
        }

        console.log('📤 Sending to backend:', {
            endpoint: slideId ? 'UPDATE /api/v1/campaigns/update-story-slide/' : 'CREATE /api/v1/campaigns/create-story-slide/',
            groupId,
            slideId,
            hasCanvasData: true,
        });

        // Step 5: Import storyAPI and send to backend
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

        // Step 6: Handle response
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Save successful:', response.data);
            onSuccess?.(response.data);
            return {
                success: true,
                data: response.data,
                payload: canvasPayload,
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
export const loadCanvasFromPayload = (payload) => {
    if (!payload || !payload.pages) {
        throw new Error('Invalid payload: missing pages');
    }

    try {
        // Clear existing pages
        while (store.pages.length > 0) {
            store.deletePage(store.pages[0].id);
        }

        // Set canvas dimensions
        if (payload.width && payload.height) {
            store.setSize(payload.width, payload.height);
        }

        // Restore custom metadata
        if (payload.custom) {
            store.set({ custom: payload.custom });
        }

        // Load each page
        payload.pages.forEach((pageData) => {
            const page = store.addPage();

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
