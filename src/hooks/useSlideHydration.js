/**
 * Slide Hydration Hook
 * 
 * Hydrates the Polotno editor when slides are loaded:
 * - Converts backend slides into Polotno canvas pages
 * - Uses adapter when canvasData is missing
 * - Extracts content/styling into separate state
 * - Provides hydration guard to prevent save during hydration
 * 
 * CRITICAL: This hook NEVER triggers saves. It only reads/hydrates.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { slidesToCanvasStore, slideToCanvasPage } from '../utils/slideToCanvas';
import { migrateLegacyCta, DEFAULT_CTAS_STATE } from '../utils/ctaSchema';
import { hydrateEditorStateFromSlide } from '../utils/slidePayloadBuilder';

/**
 * Parse styling safely
 */
const parseStyling = (styling) => {
    if (!styling) return {};
    if (typeof styling === 'object') return styling;
    try {
        return JSON.parse(styling);
    } catch (e) {
        console.error('[useSlideHydration] Failed to parse styling:', e);
        return {};
    }
};

/**
 * Parse content safely
 */
const parseContent = (content) => {
    if (!content) return {};
    if (typeof content === 'object') return content;
    try {
        return JSON.parse(content);
    } catch (e) {
        console.error('[useSlideHydration] Failed to parse content:', e);
        return {};
    }
};

/**
 * Default CTA state
 * Now supports array of CTAs for multiple CTAs per slide
 */
const DEFAULT_CTA_STATE = {
    // Legacy flat fields (for backward compatibility)
    link: '',
    buttonText: '',
    image: null,
    video: null,
    styling: {},
    fullWidthCta: false,
    rdrType: 'url',
    pc_redirect_type: 'url',
    cta: {},
    // NEW: Array of CTAs
    ctas: DEFAULT_CTAS_STATE,
    // DIRTY TRACKING
    imageChanged: false,
    videoChanged: false,
};



/**
 * Hook to hydrate editor with slides
 * 
 * @param {Object} store - Polotno store instance
 * @param {Array} slides - All slides from the story group
 * @param {Object|null} currentSlide - The current active slide
 * @param {Object} options - Optional configuration
 * @returns {Object} - { ctaState, isHydrating, setCtaField, ... }
 */
export const useSlideHydration = (store, slides, currentSlide = null, options = {}) => {
    const { onHydrationComplete } = options;

    // CTA state (not stored in Polotno, managed separately)
    const [ctaState, setCtaState] = useState(DEFAULT_CTA_STATE);

    // Hydration guard - CRITICAL to prevent save loops
    const isHydratingRef = useRef(false);
    const [isHydrating, setIsHydrating] = useState(false);

    // Track what we've hydrated to avoid re-hydrating
    const hydratedGroupRef = useRef(null);
    const hydratedSlideIdRef = useRef(null);

    /**
     * Hydrate all slides into Polotno pages
     * This converts ALL slides in the group to canvas pages
     */
    const hydrateAllSlides = useCallback(async (slidesArray) => {
        if (!store || !slidesArray || slidesArray.length === 0) {
            console.log('[useSlideHydration] Missing store or slides, skipping hydration.');
            return false;
        }

        // Generate a hash to identify this group of slides
        const groupHash = slidesArray.map(s => s.id).sort().join('-');

        // Already hydrated this exact group
        if (hydratedGroupRef.current === groupHash) {
            console.log('[useSlideHydration] Slides already hydrated, skipping.');
            return true;
        }

        console.log(`[useSlideHydration] Hydrating ${slidesArray.length} slides...`);

        // SET HYDRATION GUARD - prevents autosave from triggering
        isHydratingRef.current = true;
        setIsHydrating(true);

        try {
            // Convert all slides to Polotno canvas store JSON
            // CRITICAL: This now hydrates ALL JSON data:
            // - Image/video → background elements
            // - content.text → text elements
            // - content.ctas → CTA elements
            // - styling → element properties
            const canvasStore = slidesToCanvasStore(slidesArray);

            console.log('[useSlideHydration] Generated canvas store:', {
                width: canvasStore.width,
                height: canvasStore.height,
                pageCount: canvasStore.pages.length,
                pages: canvasStore.pages.map(p => ({
                    id: p.id,
                    childrenCount: p.children?.length || 0,
                    hasMedia: p.custom?.hasMedia,
                    hasText: p.custom?.hasText,
                    hasCtas: p.custom?.hasCtas,
                })),
            });

            // Load into Polotno
            await store.loadJSON(canvasStore);

            console.log(`[useSlideHydration] Successfully loaded ${canvasStore.pages.length} pages into Polotno.`);

            // Mark as hydrated
            hydratedGroupRef.current = groupHash;

            return true;
        } catch (error) {
            console.error('[useSlideHydration] Hydration failed:', error);
            return false;
        } finally {
            // CLEAR HYDRATION GUARD (with delay for MobX reactions)
            setTimeout(() => {
                isHydratingRef.current = false;
                setIsHydrating(false);
                console.log('[useSlideHydration] Hydration guard cleared.');
            }, 200);
        }
    }, [store]);

    /**
     * Hydrate CTA state from current slide
     * Now supports both legacy flat format and new array format
     * CRITICAL: Never inject backend data directly into canvas.
     * This rebuilds editor state, not canvas state.
     */
    const hydrateCTAState = useCallback((slideData) => {
        // Use centralized hydration function
        // CRITICAL: This reads from backend JSON, never from canvas/image
        const editorState = hydrateEditorStateFromSlide(slideData);

        setCtaState({
            ...DEFAULT_CTA_STATE,
            ...editorState,
        });

        console.log('[useSlideHydration] Editor state hydrated from slide:', slideData?.id);
        console.log('[useSlideHydration] Hydrated state:', editorState);
    }, []);

    /**
     * Navigate to a specific slide/page in Polotno
     */
    const selectSlide = useCallback((slideId) => {
        if (!store || !slideId) return;

        const page = store.pages.find(p => p.id === slideId || p.custom?.originalSlideId === slideId);
        if (page) {
            store.selectPage(page.id);
            console.log(`[useSlideHydration] Selected page: ${page.id}`);
        } else {
            console.warn(`[useSlideHydration] Page not found for slide: ${slideId}`);
        }
    }, [store]);

    // Effect: Hydrate all slides when they change
    useEffect(() => {
        if (slides && slides.length > 0) {
            hydrateAllSlides(slides);
        }
    }, [slides, hydrateAllSlides]);

    // Effect: Hydrate CTA state when current slide changes
    useEffect(() => {
        if (currentSlide && currentSlide.id !== hydratedSlideIdRef.current) {
            hydrateCTAState(currentSlide);
            selectSlide(currentSlide.id);
            hydratedSlideIdRef.current = currentSlide.id;
            onHydrationComplete?.(currentSlide);
        }
    }, [currentSlide, hydrateCTAState, selectSlide, onHydrationComplete]);

    /**
     * Update a single CTA field
     */
    const setCtaField = useCallback((field, value) => {
        setCtaState(prev => {
            const updates = { [field]: value };

            // Auto-detect media changes
            if (field === 'image' || field === 'imageFile') {
                updates.imageChanged = true;
            }
            if (field === 'video' || field === 'videoFile') {
                updates.videoChanged = true;
            }

            return {
                ...prev,
                ...updates,
            };
        });
    }, []);

    /**
     * Reset CTA state to defaults
     */
    const resetCtaState = useCallback(() => {
        setCtaState(DEFAULT_CTA_STATE);
    }, []);

    /**
     * Check if currently hydrating (for save guards)
     */
    const checkIsHydrating = useCallback(() => {
        return isHydratingRef.current;
    }, []);

    return {
        ctaState,
        setCtaState,
        setCtaField,
        resetCtaState,
        isHydrating,
        checkIsHydrating,
        isHydratingRef,
        selectSlide,
        hydrateAllSlides,
    };
};

export default useSlideHydration;
