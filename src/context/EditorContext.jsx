/**
 * Editor Context
 * 
 * Provides centralized state management for:
 * - Campaign data (fetched ONCE)
 * - Current slide info
 * - CTA state
 * - Hydration status
 * 
 * This context ensures all editor components have access to the same
 * campaign data without re-fetching.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { reaction } from 'mobx';
import { useCampaignData } from '../hooks/useCampaignData';
import { useSlideHydration } from '../hooks/useSlideHydration';
import { store } from '../store/polotnoStore';
import { storyAPI } from '../services/api';
import { campaignId as bootstrapCampaignId, storyGroupId as bootstrapGroupId, slideId as bootstrapSlideId } from '../editorBootstrap';
import {
    createCta,
    updateCtaInArray,
    removeCtaFromArray,
    addCtaToArray,
    extractCtasPayload
} from '../utils/ctaSchema';

/**
 * Context shape
 */
const EditorContext = createContext(null);

/**
 * Editor Context Provider
 */
export const EditorContextProvider = ({ children }) => {
    // Current slide ID (can change during editing session)
    const [currentSlideId, setCurrentSlideId] = useState(bootstrapSlideId);
    const [currentGroupId, setCurrentGroupId] = useState(bootstrapGroupId);

    // Fetch campaign data ONCE
    const {
        campaign,
        storyGroups,
        isLoading: isCampaignLoading,
        error: campaignError,
        refetch: refetchCampaign,
        findSlide,
        findGroup,
        getSlidesForGroup,
    } = useCampaignData(bootstrapCampaignId, bootstrapGroupId);

    // Get current slide data from cached campaign
    const currentSlide = useMemo(() => {
        if (!currentSlideId) return null;
        return findSlide(currentSlideId);
    }, [currentSlideId, findSlide]);

    // Get current group data
    const currentGroup = useMemo(() => {
        if (currentGroupId) {
            return findGroup(currentGroupId);
        }
        if (currentSlideId) {
            return findGroup(null, currentSlideId);
        }
        return null;
    }, [currentGroupId, currentSlideId, findGroup]);

    // Get all slides for current group
    const groupSlides = useMemo(() => {
        if (!currentGroup?.id) return [];
        return getSlidesForGroup(currentGroup.id);
    }, [currentGroup, getSlidesForGroup]);

    // Hydrate editor with ALL slides from the group
    // The hook converts slides to Polotno pages using the adapter
    const {
        ctaState,
        setCtaState,
        setCtaField,
        isHydrating,
        checkIsHydrating,
        isHydratingRef,
        selectSlide,
    } = useSlideHydration(store, groupSlides, currentSlide);

    /**
     * Switch to a different slide
     * This triggers re-hydration
     */
    const switchToSlide = useCallback((slideId) => {
        if (slideId === currentSlideId) return;
        console.log(`[EditorContext] Switching to slide: ${slideId}`);
        setCurrentSlideId(slideId);
    }, [currentSlideId]);

    /**
     * Switch to a different group
     */
    const switchToGroup = useCallback((groupId) => {
        if (groupId === currentGroupId) return;
        console.log(`[EditorContext] Switching to group: ${groupId}`);

        // Pick a valid slide in the next group so hydration/selectSlide works.
        const nextSlides = getSlidesForGroup?.(groupId) || [];
        const nextFirstSlideId = nextSlides[0]?.id ? String(nextSlides[0].id) : null;

        setCurrentGroupId(groupId);
        setCurrentSlideId(nextFirstSlideId);
    }, [currentGroupId, getSlidesForGroup]);

    // Sync Polotno active page to Context currentSlideId
    useEffect(() => {
        // React to store.activePageId changes
        const disposer = reaction(
            () => store.activePageId,
            (activePageId) => {
                if (!activePageId) return;

                const page = store.pages.find(p => p.id === activePageId);
                if (!page) return;

                // Prefer original slide ID if available (hydrated), otherwise usage page ID
                const slideId = page.custom?.originalSlideId || page.id;

                // Only update if changed (prevents loops)
                if (slideId && slideId !== currentSlideId) {
                    console.log(`[EditorContext] Syncing active page to slide: ${slideId}`);
                    setCurrentSlideId(slideId);
                }
            },
            { fireImmediately: true }
        );

        return () => disposer();
    }, [currentSlideId]); // Only dependency needed from closure

    /**
     * Safe wrapper for deleting pages that handles backend deletion
     * IMPORTANT: This does NOT mutate store.deletePages (which would violate MobX proxy rules)
     * Instead, components should call this function directly
     * 
     * @param {string[]} pageIds - Array of page IDs to delete
     */
    const deletePages = useCallback(async (pageIds) => {
        if (!pageIds || pageIds.length === 0) return;

        // 1. Identify which slides have backend IDs
        const backendDeletions = [];
        store.pages.forEach(page => {
            if (pageIds.includes(page.id) && page.custom?.originalSlideId) {
                backendDeletions.push(page.custom.originalSlideId);
            }
        });

        // 2. Call backend API for each
        if (backendDeletions.length > 0) {
            const confirmDelete = window.confirm(
                `Are you sure you want to delete ${backendDeletions.length > 1 ? 'these slides' : 'this slide'}? This action cannot be undone.`
            );
            if (!confirmDelete) return; // Abort entirely if user cancels

            try {
                await Promise.all(backendDeletions.map(id => storyAPI.deleteStorySlide(id)));
                console.log('[EditorContext] Deleted slides from backend:', backendDeletions);
            } catch (error) {
                console.error('[EditorContext] Failed to delete slides from backend:', error);
                alert('Failed to delete some slides. Please try again.');
                return; // Don't remove from UI if backend fails
            }
        }

        // 3. Proceed with UI removal using official Polotno API
        // This is the CORRECT way - call the method, don't reassign it
        store.deletePages(pageIds);
    }, []);

    // ============================================
    // CTA ARRAY MANIPULATION HELPERS
    // ============================================

    /**
     * Add a new CTA to the current slide
     * @param {string} type - CTA type ('classic', 'swipeUp', 'imageCTA', 'visit', 'describe')
     * @param {Object} overrides - Optional overrides for content/styling
     * @returns {Object} - The newly created CTA
     */
    const addCta = useCallback((type, overrides = {}) => {
        const newCta = createCta(type, overrides);
        if (!newCta) return null;

        setCtaState(prev => ({
            ...prev,
            ctas: addCtaToArray(prev.ctas || [], newCta),
        }));

        console.log('[EditorContext] Added new CTA:', newCta.id, 'type:', type);
        return newCta;
    }, [setCtaState]);

    /**
     * Update an existing CTA by ID
     * @param {string} ctaId - The CTA ID to update
     * @param {Object} updates - { content?: {...}, styling?: {...} }
     */
    const updateCta = useCallback((ctaId, updates) => {
        setCtaState(prev => ({
            ...prev,
            ctas: updateCtaInArray(prev.ctas || [], ctaId, updates),
        }));

        console.log('[EditorContext] Updated CTA:', ctaId);
    }, [setCtaState]);

    /**
     * Remove a CTA by ID
     * @param {string} ctaId - The CTA ID to remove
     */
    const removeCta = useCallback((ctaId) => {
        setCtaState(prev => ({
            ...prev,
            ctas: removeCtaFromArray(prev.ctas || [], ctaId),
        }));

        console.log('[EditorContext] Removed CTA:', ctaId);
    }, [setCtaState]);

    /**
     * Get extracted CTAs payload for backend (only required fields)
     * @returns {Array} - Array of CTAs with only required fields
     */
    const getCtasPayload = useCallback(() => {
        return extractCtasPayload(ctaState.ctas || []);
    }, [ctaState.ctas]);

    // Context value
    const value = useMemo(() => ({
        // Bootstrap IDs
        bootstrapCampaignId,
        bootstrapGroupId,
        bootstrapSlideId,

        // Campaign data (cached)
        campaign,
        storyGroups,
        isCampaignLoading,
        campaignError,
        refetchCampaign,

        // Current context
        currentSlideId,
        currentGroupId,
        currentSlide,
        currentGroup,
        groupSlides,

        // CTA state (not in Polotno)
        ctaState,
        setCtaState,
        setCtaField,

        // CTA array manipulation (NEW)
        addCta,
        updateCta,
        removeCta,
        getCtasPayload,

        // Hydration status
        isHydrating,
        checkIsHydrating,
        isHydratingRef,

        // Actions
        switchToSlide,
        switchToGroup,
        selectSlide,
        deletePages,

        // Helpers
        findSlide,
        findGroup,
        getSlidesForGroup,
    }), [
        campaign,
        storyGroups,
        isCampaignLoading,
        campaignError,
        refetchCampaign,
        currentSlideId,
        currentGroupId,
        currentSlide,
        currentGroup,
        groupSlides,
        ctaState,
        setCtaState,
        setCtaField,
        addCta,
        updateCta,
        removeCta,
        getCtasPayload,
        isHydrating,
        checkIsHydrating,
        isHydratingRef,
        switchToSlide,
        switchToGroup,
        selectSlide,
        deletePages,
        findSlide,
        findGroup,
        getSlidesForGroup,
    ]);

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

/**
 * Hook to access editor context
 */
export const useEditorContext = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditorContext must be used within EditorContextProvider');
    }
    return context;
};

export default EditorContext;
