/**
 * Campaign Data Hook
 * 
 * Fetches campaign details ONCE and provides:
 * - Campaign data
 * - Story groups
 * - Slides extraction helpers
 * 
 * PRODUCTION-SAFE IMPLEMENTATION:
 * - campaignId is stored in React state (not read directly from localStorage in render)
 * - useEffect that calls the campaign API depends on resolvedCampaignId
 * - If campaignId is missing but storyGroupId exists, resolve campaignId first
 * - Works identically in dev and production (no StrictMode dependencies)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storyAPI } from '../services/api';
// Import order normalizer to fix duplicate/broken orders on load
import { normalizeSlideOrders } from '../utils/slidePayloadBuilder';

/**
 * Extract slides from a story group
 * @param {Object} storyGroup - The story group object
 * @returns {Array} - Array of slides, sorted by order
 */
const extractSlidesFromGroup = (storyGroup) => {
    if (!storyGroup) return [];

    // Backend might use different keys for slides array
    const slides = storyGroup.slides || storyGroup.storygroups || storyGroup.stories || [];

    // Normalize orders (fix 1,1,1 duplicates)
    // This ensures unique, sequential ordering (1,2,3...)
    return normalizeSlideOrders(slides);
};

/**
 * Find a story group by ID
 * @param {Array} groups - Array of story groups
 * @param {string} groupId - Target group ID
 * @returns {Object|null} - The found group or null
 */
const findStoryGroupById = (groups, groupId) => {
    if (!groups || !groupId) return null;
    return groups.find(g => String(g.id) === String(groupId)) || null;
};

/**
 * Find a story group that contains a specific slide
 * @param {Array} groups - Array of story groups
 * @param {string} slideId - Target slide ID
 * @returns {Object|null} - The found group or null
 */
const findGroupContainingSlide = (groups, slideId) => {
    if (!groups || !slideId) return null;

    for (const group of groups) {
        const slides = extractSlidesFromGroup(group);
        const found = slides.find(s => String(s.id) === String(slideId));
        if (found) {
            return { ...group, slides }; // Return with normalized slides key
        }
    }
    return null;
};

/**
 * Find a specific slide by ID within groups
 * @param {Array} groups - Array of story groups
 * @param {string} slideId - Target slide ID
 * @returns {Object|null} - The found slide or null
 */
const findSlideById = (groups, slideId) => {
    if (!groups || !slideId) return null;

    for (const group of groups) {
        const slides = extractSlidesFromGroup(group);
        const found = slides.find(s => String(s.id) === String(slideId));
        if (found) return found;
    }
    return null;
};

/**
 * Validate a string ID (not null, not 'null', not empty)
 * @param {string|null} id - The ID to validate
 * @returns {string|null} - The ID if valid, null otherwise
 */
const validateId = (id) => {
    if (!id || id === 'null' || id === 'undefined' || id.trim() === '') {
        return null;
    }
    return id;
};

/**
 * Hook to fetch and cache campaign data
 * 
 * REQUIREMENTS SATISFIED:
 * 1. campaignId is stored in React state (resolvedCampaignId)
 * 2. useEffect that calls campaign API depends on resolvedCampaignId
 * 3. If campaignId missing but storyGroupId exists, resolve campaignId first
 * 4. No useEffect has empty dependency array
 * 5. No React StrictMode or dev-only guards
 * 6. Campaign API is ALWAYS called once campaignId becomes available
 * 
 * @param {string|null} initialCampaignId - The initial campaign ID (may be null)
 * @param {string|null} storyGroupId - The story group ID (always available)
 * @returns {Object} - { campaign, storyGroups, isLoading, error, findSlide, findGroup }
 */
export const useCampaignData = (initialCampaignId, storyGroupId = null) => {
    // === STATE ===
    // Store campaignId in React state - this is the KEY FIX
    // This allows the effect to re-run when campaignId is resolved
    const [resolvedCampaignId, setResolvedCampaignId] = useState(() => validateId(initialCampaignId));
    const [isResolvingCampaignId, setIsResolvingCampaignId] = useState(false);

    const [campaign, setCampaign] = useState(null);
    const [storyGroups, setStoryGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref to track if we've already fetched (prevents duplicate requests)
    const hasFetchedRef = useRef(false);
    const fetchedCampaignIdRef = useRef(null);

    // Validated storyGroupId
    const validStoryGroupId = validateId(storyGroupId);

    // === EFFECT 1: Resolve campaignId from storyGroupId if missing ===
    // This effect handles the case where campaignId is not in URL but storyGroupId is
    useEffect(() => {
        // Skip if we already have a campaignId
        if (resolvedCampaignId) {
            console.log('[useCampaignData] Already have campaignId:', resolvedCampaignId);
            return;
        }

        // Skip if no storyGroupId to resolve from
        if (!validStoryGroupId) {
            console.log('[useCampaignData] No campaignId and no storyGroupId - cannot resolve');
            return;
        }

        // Skip if already resolving
        if (isResolvingCampaignId) {
            return;
        }

        const resolveCampaignIdFromGroup = async () => {
            setIsResolvingCampaignId(true);
            console.log(`[useCampaignData] Resolving campaignId from storyGroupId: ${validStoryGroupId}`);

            try {
                const groupResponse = await storyAPI.getStoryGroup(validStoryGroupId);

                if (groupResponse?.data) {
                    // Handle if campaign is ID or object
                    const camp = groupResponse.data?.campaign;
                    const campId = groupResponse.data?.campaign_id;
                    const resolvedId = campId || ((typeof camp === 'object' && camp?.id) ? camp.id : camp);

                    if (resolvedId) {
                        console.log(`[useCampaignData] ✓ Resolved campaignId: ${resolvedId}`);
                        setResolvedCampaignId(String(resolvedId));
                    } else {
                        console.error('[useCampaignData] ✗ Could not extract campaignId from group response');
                        setError('Could not resolve campaign ID from story group');
                    }
                } else {
                    console.error('[useCampaignData] ✗ Empty response from getStoryGroup');
                    setError('Empty response when resolving campaign');
                }
            } catch (err) {
                console.error('[useCampaignData] ✗ Failed to resolve campaignId from group:', err);
                setError(err.message || 'Failed to resolve campaign ID');
            } finally {
                setIsResolvingCampaignId(false);
            }
        };

        resolveCampaignIdFromGroup();
    }, [resolvedCampaignId, validStoryGroupId, isResolvingCampaignId]);

    // === EFFECT 2: Fetch campaign details once campaignId is available ===
    // This effect ONLY runs when resolvedCampaignId changes (not empty dependency)
    useEffect(() => {
        // Guard: Do nothing until we have a valid campaignId
        if (!resolvedCampaignId) {
            console.log('[useCampaignData] Waiting for campaignId to be resolved...');
            return;
        }

        // Guard: Prevent duplicate fetches for the same campaignId
        if (hasFetchedRef.current && fetchedCampaignIdRef.current === resolvedCampaignId) {
            console.log('[useCampaignData] Campaign already fetched, skipping:', resolvedCampaignId);
            return;
        }

        const fetchCampaignDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log(`[useCampaignData] ➤ Fetching campaign: ${resolvedCampaignId}`);
                const response = await storyAPI.getCampaignDetails(resolvedCampaignId);

                if (response?.data) {
                    console.log('[useCampaignData] ✓ Campaign loaded:', response.data);

                    setCampaign(response.data);

                    // Extract story groups from response
                    const groups = response.data.details || response.data.storyGroups || [];
                    setStoryGroups(groups);

                    // Mark as fetched to prevent duplicates
                    hasFetchedRef.current = true;
                    fetchedCampaignIdRef.current = resolvedCampaignId;
                } else {
                    console.error('[useCampaignData] ✗ Empty campaign response');
                    setError('Empty campaign response');
                }
            } catch (err) {
                console.error('[useCampaignData] ✗ Failed to fetch campaign:', err);
                setError(err.message || 'Failed to load campaign');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaignDetails();
    }, [resolvedCampaignId]); // This effect depends on resolvedCampaignId STATE

    // === REFETCH FUNCTION ===
    const refetch = useCallback(async () => {
        if (!resolvedCampaignId) {
            console.warn('[useCampaignData] Cannot refetch - no campaignId available');
            return;
        }

        // Reset fetch guard to allow re-fetch
        hasFetchedRef.current = false;
        fetchedCampaignIdRef.current = null;

        setIsLoading(true);
        setError(null);

        try {
            console.log(`[useCampaignData] ➤ Refetching campaign: ${resolvedCampaignId}`);
            const response = await storyAPI.getCampaignDetails(resolvedCampaignId);

            if (response?.data) {
                console.log('[useCampaignData] ✓ Campaign reloaded:', response.data);
                setCampaign(response.data);
                const groups = response.data.details || response.data.storyGroups || [];
                setStoryGroups(groups);
                hasFetchedRef.current = true;
                fetchedCampaignIdRef.current = resolvedCampaignId;
            }
        } catch (err) {
            console.error('[useCampaignData] ✗ Refetch failed:', err);
            setError(err.message || 'Failed to reload campaign');
        } finally {
            setIsLoading(false);
        }
    }, [resolvedCampaignId]);

    // === HELPER FUNCTIONS ===

    // Helper to find a slide by ID
    const findSlide = useCallback((slideId) => {
        return findSlideById(storyGroups, slideId);
    }, [storyGroups]);

    // Helper to find a group by ID or by slide containment
    const findGroup = useCallback((groupId, slideId = null) => {
        if (groupId) {
            return findStoryGroupById(storyGroups, groupId);
        }
        if (slideId) {
            return findGroupContainingSlide(storyGroups, slideId);
        }
        return null;
    }, [storyGroups]);

    // Helper to get slides for a specific group
    const getSlidesForGroup = useCallback((groupId) => {
        const group = findStoryGroupById(storyGroups, groupId);
        return extractSlidesFromGroup(group);
    }, [storyGroups]);

    // === RETURN ===
    return {
        campaign,
        storyGroups,
        isLoading: isLoading || isResolvingCampaignId, // Include resolution in loading state
        error,
        refetch,
        findSlide,
        findGroup,
        getSlidesForGroup,
        // Expose resolved ID for debugging/context
        resolvedCampaignId,
    };
};

export default useCampaignData;
