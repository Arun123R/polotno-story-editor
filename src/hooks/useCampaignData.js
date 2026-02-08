/**
 * Campaign Data Hook
 * 
 * Fetches campaign details ONCE and provides:
 * - Campaign data
 * - Story groups
 * - Slides extraction helpers
 * 
 * This hook ensures only ONE network request per session.
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
 * Hook to fetch and cache campaign data
 * 
 * @param {string} campaignId - The campaign ID to fetch
 * @returns {Object} - { campaign, storyGroups, isLoading, error, findSlide, findGroup }
 */
export const useCampaignData = (campaignId, storyGroupId = null) => {
    const [campaign, setCampaign] = useState(null);
    const [storyGroups, setStoryGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref to track if we've already fetched (prevents duplicate requests)
    const hasFetchedRef = useRef(false);
    const fetchedCampaignIdRef = useRef(null);

    const fetchCampaign = useCallback(async (force = false) => {
        let targetCampaignId = campaignId;

        // If no campaignId, try to resolve from storyGroupId
        const validGroupId = storyGroupId && storyGroupId !== 'null' ? storyGroupId : null;
        if (!targetCampaignId && validGroupId) {
            console.log(`[useCampaignData] No campaignId, resolving from group: ${validGroupId}`);
            try {
                const groupResponse = await storyAPI.getStoryGroup(validGroupId);
                if (groupResponse?.data) {
                    // Handle if campaign is ID or object
                    const camp = groupResponse.data?.campaign;
                    const campId = groupResponse.data?.campaign_id;
                    const campName = groupResponse.data?.campaign_name;
                    targetCampaignId = campId || ((typeof camp === 'object' && camp?.id) ? camp.id : camp);

                    if (targetCampaignId) {
                        console.log(`[useCampaignData] Resolved campaignId: ${targetCampaignId}`);
                    }
                }
            } catch (err) {
                console.error('[useCampaignData] Failed to resolve campaign from group:', err);
                // Don't error out yet, maybe we can't load campaign but can load something else? 
                // But this hook is specifically for campaign data.
            }
        }

        if (!targetCampaignId) {
            console.log('[useCampaignData] No campaignId provided (and resolution failed), skipping fetch.');
            return;
        }

        if (!force && hasFetchedRef.current && fetchedCampaignIdRef.current === targetCampaignId) {
            console.log('[useCampaignData] Campaign already fetched, skipping.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log(`[useCampaignData] Fetching campaign: ${targetCampaignId}`);
            const response = await storyAPI.getCampaignDetails(targetCampaignId);

            if (response?.data) {
                console.log('[useCampaignData] Campaign loaded:', response.data);

                setCampaign(response.data);

                // Extract story groups from response
                const groups = response.data.details || response.data.storyGroups || [];
                setStoryGroups(groups);

                // Mark as fetched
                hasFetchedRef.current = true;
                fetchedCampaignIdRef.current = targetCampaignId;
            }
        } catch (err) {
            console.error('[useCampaignData] Failed to fetch campaign:', err);
            setError(err.message || 'Failed to load campaign');
        } finally {
            setIsLoading(false);
        }
    }, [campaignId, storyGroupId]);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

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

    return {
        campaign,
        storyGroups,
        isLoading,
        error,
        refetch: () => fetchCampaign(true),
        findSlide,
        findGroup,
        getSlidesForGroup,
    };
};

export default useCampaignData;
