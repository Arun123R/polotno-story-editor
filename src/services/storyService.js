import { storyAPI } from './api.js';
import {
    buildCampaignPayload,
    buildStoryGroupFormData,
    buildStorySlideFormData,
    shouldCreateSlide,
    buildStoryPersonalisationConfigFromCampaignDetails
} from '../utils/storyPayload.js';
import { prepareConditionsForSubmission } from '../utils/conditions.js';

/**
 * Story Campaign Service
 * High-level service for managing story campaigns, groups, and slides
 */

class StoryService {
    /**
     * Fetch all story campaigns
     */
    async getCampaigns(params = {}) {
        try {
            const response = await storyAPI.getStoryCampaigns({
                campaign_type: 'STR',
                ...params
            });
            return {
                success: true,
                data: response.data || [],
                count: response.data?.length || 0
            };
        } catch (error) {
            console.error('Error fetching story campaigns:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch campaigns',
                data: []
            };
        }
    }

    /**
     * Get campaign details including all groups and slides
     */
    async getCampaignDetails(campaignId) {
        try {
            const response = await storyAPI.getCampaignDetails(campaignId);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching campaign details:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch campaign details'
            };
        }
    }

    /**
     * Create a new story campaign
     */
    async createCampaign(campaignData, initialFormData = {}) {
        try {
            const payload = buildCampaignPayload(campaignData, initialFormData);
            const response = await storyAPI.createCampaign(payload);

            return {
                success: true,
                data: response.data,
                campaignId: response.data.id || response.data
            };
        } catch (error) {
            console.error('Error creating campaign:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create campaign'
            };
        }
    }

    /**
     * Update an existing campaign
     */
    async updateCampaign(campaignId, updates) {
        try {
            const payload = {
                id: campaignId,
                ...updates
            };
            const response = await storyAPI.updateCampaign(payload);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error updating campaign:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update campaign'
            };
        }
    }

    /**
     * Toggle campaign active status
     */
    async toggleCampaignStatus(campaignId) {
        try {
            const response = await storyAPI.toggleCampaignStatus(campaignId);
            return {
                success: response.status === 200 || response.statusText === "OK",
                data: response.data
            };
        } catch (error) {
            console.error('Error toggling campaign status:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to toggle campaign status'
            };
        }
    }

    /**
     * Archive a campaign
     */
    async archiveCampaign(campaignId) {
        try {
            const response = await storyAPI.archiveCampaign(campaignId);
            return {
                success: response.statusText === "OK",
                data: response.data
            };
        } catch (error) {
            console.error('Error archiving campaign:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to archive campaign'
            };
        }
    }

    /**
     * Delete a campaign
     */
    async deleteCampaign(campaignId) {
        try {
            const response = await storyAPI.deleteCampaign(campaignId);
            return {
                success: response.status === 200,
                data: response.data
            };
        } catch (error) {
            console.error('Error deleting campaign:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete campaign'
            };
        }
    }

    /**
     * Duplicate a campaign
     */
    async duplicateCampaign(campaignId) {
        try {
            const response = await storyAPI.duplicateCampaign(campaignId);
            return {
                success: response.status === 201,
                data: response.data
            };
        } catch (error) {
            console.error('Error duplicating campaign:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to duplicate campaign'
            };
        }
    }

    /**
     * Create a story group with slides
     */
    async createStoryGroup(campaignId, contentStyling, slides = [], formData = {}, conditions = {}) {
        try {
            // Determine group order
            let groupOrder = 0;
            try {
                const campaignDetails = await storyAPI.getCampaignDetails(campaignId);
                const existingGroups = campaignDetails.data?.details || [];
                groupOrder = existingGroups.length;
            } catch (error) {
                console.error('Error fetching campaign details for order:', error);
            }

            // Build and send group FormData
            const groupFormData = await buildStoryGroupFormData(
                campaignId,
                contentStyling,
                formData,
                groupOrder,
                null
            );

            const groupResponse = await storyAPI.createStoryGroup(groupFormData);
            const storyGroupId = groupResponse.data?.storyGroupId || groupResponse.data?.id || groupResponse.data;

            // Create slides
            const slideResults = [];
            for (let index = 0; index < slides.length; index++) {
                const slide = slides[index];

                if (!shouldCreateSlide(slide)) {
                    console.log('Skipping slide without content:', slide);
                    continue;
                }

                const slideFormData = buildStorySlideFormData(slide, storyGroupId, index);
                const slideResponse = await storyAPI.createStorySlide(slideFormData);
                slideResults.push(slideResponse.data);
            }

            // Update campaign with conditions and personalization
            if (conditions && Object.keys(conditions).length > 0) {
                const campaignUpdatePayload = { id: campaignId };
                campaignUpdatePayload.conditions = conditions;

                try {
                    const campaignDetails = await storyAPI.getCampaignDetails(campaignId);
                    campaignUpdatePayload.personalisationConfig =
                        await buildStoryPersonalisationConfigFromCampaignDetails(campaignDetails?.data);
                } catch (e) {
                    console.error('Error building personalization config:', e);
                }

                await storyAPI.updateCampaign(campaignUpdatePayload);
            }

            return {
                success: true,
                groupId: storyGroupId,
                slides: slideResults
            };
        } catch (error) {
            console.error('Error creating story group:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create story group'
            };
        }
    }

    /**
     * Update a story group
     */
    async updateStoryGroup(groupId, campaignId, contentStyling, slides = [], formData = {}) {
        try {
            const groupFormData = await buildStoryGroupFormData(
                campaignId,
                contentStyling,
                formData,
                0,
                groupId
            );

            // Add slides data for update
            slides.forEach((slide, index) => {
                if (slide.id) {
                    groupFormData.append(`storygroups[${index}].id`, slide.id);
                }
                groupFormData.append(`storygroups[${index}].order`, slide.order || (index + 1));
                groupFormData.append(`storygroups[${index}].description`, slide.description || "");
                groupFormData.append(`storygroups[${index}].button_text`, slide.button_text || slide.ctaText || "");
                groupFormData.append(`storygroups[${index}].link`, slide.link || slide.redirectValue || "");
                groupFormData.append(`storygroups[${index}].enableCrossButton`, slide.enableCrossButton ? "1" : "0");
                groupFormData.append(`storygroups[${index}].enableMuteButton`, slide.enableMuteButton ? "1" : "0");
                groupFormData.append(`storygroups[${index}].enableCTA`, slide.enableCTA ? "1" : "0");
                groupFormData.append(`storygroups[${index}].fullWidthCta`, slide.fullWidthCta ? "1" : "0");

                if (slide.image instanceof File) {
                    groupFormData.append(`storygroups[${index}].thumbnail`, slide.image);
                }
                if (slide.video instanceof File) {
                    groupFormData.append(`storygroups[${index}].video`, slide.video);
                }

                if (slide.styling) {
                    groupFormData.append(`storygroups[${index}].styling`, JSON.stringify(slide.styling));
                }
            });

            const response = await storyAPI.updateStoryGroup(groupFormData, campaignId);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error updating story group:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update story group'
            };
        }
    }

    /**
     * Delete a story group
     */
    async deleteStoryGroup(groupId) {
        try {
            const response = await storyAPI.deleteStoryGroup(groupId);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error deleting story group:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete story group'
            };
        }
    }

    /**
     * Toggle story group status
     */
    async toggleStoryGroup(groupId) {
        try {
            const response = await storyAPI.toggleStoryGroup(groupId);
            return {
                success: response.status === 200 || response.statusText === "OK",
                data: response.data
            };
        } catch (error) {
            console.error('Error toggling story group:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to toggle story group'
            };
        }
    }

    /**
     * Create a story slide
     */
    async createSlide(groupId, slideData, order) {
        try {
            const slideFormData = buildStorySlideFormData(slideData, groupId, order);
            const response = await storyAPI.createStorySlide(slideFormData);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error creating story slide:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to create story slide'
            };
        }
    }

    /**
     * Update a story slide
     */
    async updateSlide(slideData) {
        try {
            const formData = new FormData();

            formData.append('id', slideData.id);
            formData.append('order', slideData.order || 1);
            formData.append('isActive', slideData.isActive !== false ? 'true' : 'false');
            formData.append('link', slideData.link || slideData.redirectValue || '');
            formData.append('button_text', slideData.button_text || slideData.ctaText || '');
            formData.append('description', slideData.description || '');
            formData.append('themes', slideData.themes || '');
            formData.append('enableCrossButton', slideData.enableCrossButton ? '1' : '0');
            formData.append('enableMuteButton', slideData.enableMuteButton ? '1' : '0');
            formData.append('enableCTA', slideData.enableCTA ? '1' : '0');
            formData.append('fullWidthCta', slideData.fullWidthCta ? '1' : '0');

            if (slideData.styling) {
                formData.append('styling', JSON.stringify(slideData.styling));
            }

            if (slideData.image instanceof File) {
                const isVideo = slideData.image.type.startsWith('video/');
                if (isVideo) {
                    formData.append('video', slideData.image);
                    formData.append('image', '');
                } else {
                    formData.append('image', slideData.image);
                    formData.append('video', '');
                }
            } else if (slideData.video instanceof File) {
                formData.append('video', slideData.video);
                formData.append('image', '');
            }

            const response = await storyAPI.updateStorySlide(formData);

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error updating story slide:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update story slide'
            };
        }
    }

    /**
     * Delete a story slide
     */
    async deleteSlide(slideId) {
        try {
            const response = await storyAPI.deleteStorySlide(slideId);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error deleting story slide:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete story slide'
            };
        }
    }

    /**
     * Get campaign analytics
     */
    async getCampaignAnalytics(campaignId, startDate = null, endDate = null) {
        try {
            const response = await storyAPI.getCampaignAnalytics(campaignId, startDate, endDate);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching campaign analytics:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch campaign analytics'
            };
        }
    }
}

// Export singleton instance
export const storyService = new StoryService();
export default storyService;
