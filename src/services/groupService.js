/**
 * Story Group Management
 * Functions to create and manage story groups
 */

import { storyAPI } from './api.js';

/**
 * Create a new Story Group
 * @param {Object} groupData - Group configuration
 * @returns {Promise<Object>} Created group data with ID
 */
export const createStoryGroup = async (groupData = {}) => {
    try {
        console.log('📁 Creating new story group...');

        const formData = new FormData();

        // Required fields
        formData.append('name', groupData.name || 'New Story Campaign');
        formData.append('isActive', groupData.isActive !== false ? '1' : '0');

        // Optional fields
        if (groupData.description) {
            formData.append('description', groupData.description);
        }
        if (groupData.campaignId) {
            formData.append('campaign', String(groupData.campaignId));
        }
        if (groupData.aspectRatio) {
            formData.append('aspect_ratio', groupData.aspectRatio);
        }
        if (groupData.themes) {
            formData.append('themes', groupData.themes);
        }
        if (groupData.tags) {
            formData.append('tags', groupData.tags);
        }

        console.log('📤 Sending group creation request...');
        const response = await storyAPI.createStoryGroup(formData);

        if (response.status === 200 || response.status === 201) {
            console.log('✅ Story group created:', response.data);
            return {
                success: true,
                data: response.data,
                groupId: response.data?.id || response.data?.group_id,
            };
        } else {
            console.error('❌ Failed to create group:', response.statusText);
            return {
                success: false,
                error: response.statusText,
            };
        }
    } catch (error) {
        console.error('❌ Error creating story group:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

/**
 * Get all Story Groups
 * @returns {Promise<Object>} List of groups
 */
export const getStoryGroups = async () => {
    try {
        console.log('📁 Fetching story groups...');
        const response = await storyAPI.getStoryGroups();

        if (response.status === 200) {
            console.log('✅ Story groups fetched:', response.data);
            return {
                success: true,
                data: response.data,
                groups: response.data?.results || response.data?.groups || [],
            };
        } else {
            return {
                success: false,
                error: response.statusText,
            };
        }
    } catch (error) {
        console.error('❌ Error fetching story groups:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

/**
 * Get a specific Story Group by ID
 * @param {string|number} groupId - Group ID
 * @returns {Promise<Object>} Group data
 */
export const getStoryGroup = async (groupId) => {
    try {
        console.log('📁 Fetching story group:', groupId);
        const response = await storyAPI.getStoryGroup(groupId);

        if (response.status === 200) {
            console.log('✅ Story group fetched:', response.data);
            return {
                success: true,
                data: response.data,
            };
        } else {
            return {
                success: false,
                error: response.statusText,
            };
        }
    } catch (error) {
        console.error('❌ Error fetching story group:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

/**
 * Update a Story Group
 * @param {string|number} groupId - Group ID
 * @param {Object} groupData - Updated group data
 * @returns {Promise<Object>} Updated group data
 */
export const updateStoryGroup = async (groupId, groupData) => {
    try {
        console.log('📁 Updating story group:', groupId);

        const formData = new FormData();
        formData.append('id', String(groupId));

        if (groupData.name) formData.append('name', groupData.name);
        if (groupData.description) formData.append('description', groupData.description);
        if (groupData.isActive !== undefined) {
            formData.append('isActive', groupData.isActive ? '1' : '0');
        }
        if (groupData.aspectRatio) formData.append('aspect_ratio', groupData.aspectRatio);
        if (groupData.themes) formData.append('themes', groupData.themes);
        if (groupData.tags) formData.append('tags', groupData.tags);

        const response = await storyAPI.updateStoryGroup(formData);

        if (response.status === 200) {
            console.log('✅ Story group updated:', response.data);
            return {
                success: true,
                data: response.data,
            };
        } else {
            return {
                success: false,
                error: response.statusText,
            };
        }
    } catch (error) {
        console.error('❌ Error updating story group:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

/**
 * Delete a Story Group
 * @param {string|number} groupId - Group ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteStoryGroup = async (groupId) => {
    try {
        console.log('📁 Deleting story group:', groupId);
        const response = await storyAPI.deleteStoryGroup(groupId);

        if (response.status === 200 || response.status === 204) {
            console.log('✅ Story group deleted');
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                error: response.statusText,
            };
        }
    } catch (error) {
        console.error('❌ Error deleting story group:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

/**
 * Create a new group and return its ID
 * Convenience function for quick group creation
 */
export const createGroupAndGetId = async (name = 'New Story Campaign') => {
    const result = await createStoryGroup({ name });
    if (result.success) {
        return result.groupId;
    }
    throw new Error(result.error || 'Failed to create group');
};
