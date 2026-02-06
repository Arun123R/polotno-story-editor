import axios from 'axios';
import { API_BASE_URL, ANALYTICS_BASE_URL } from '../config/global.js';
import {
    ensureValidAccessToken,
    getStoredAccessToken,
    clearAuthTokens,
    syncExpiryFromAccessTokenIfMissing,
} from './authSession.js';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

const analyticsApi = axios.create({
    baseURL: ANALYTICS_BASE_URL,
    timeout: 30000,
});

const AUTH_PATHS = [
    '/api/v1/auth/token/',
    '/api/v1/auth/token/refresh/',
];

const shouldSkipAuth = (config) => {
    const url = config?.url || '';
    return AUTH_PATHS.some((p) => url.includes(p)) || config?.skipAuth === true;
};

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        if (shouldSkipAuth(config)) return config;

        syncExpiryFromAccessTokenIfMissing();
        const token = await ensureValidAccessToken();
        const accessToken = token || getStoredAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

analyticsApi.interceptors.request.use(
    async (config) => {
        if (shouldSkipAuth(config)) return config;

        syncExpiryFromAccessTokenIfMissing();
        const token = await ensureValidAccessToken();
        const accessToken = token || getStoredAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
analyticsApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            clearAuthTokens();
            console.warn("Unauthorized access - clearing tokens");
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            clearAuthTokens();
            console.warn("Unauthorized access - clearing tokens");
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Story Campaign API endpoints
 */
export const storyAPI = {
    // Campaign Management
    getStoryCampaigns: (params = {}) => {
        const queryParams = new URLSearchParams(params);
        return api.get(`/api/v1/campaigns/list-story-campaigns/?${queryParams}`);
    },

    getCampaignDetails: (campaignId) => {
        return api.get(`/api/v1/campaigns/campaign-details/?id=${campaignId}`);
    },

    createCampaign: (campaignData) => {
        return api.post('/api/v1/campaigns/create-campaign/', campaignData);
    },

    updateCampaign: (campaignData) => {
        return api.put('/api/v1/campaigns/create-campaign/', campaignData);
    },

    archiveCampaign: (campaignId) => {
        return api.post(`/api/v1/campaigns/archive-campaign/?id=${campaignId}`);
    },

    toggleCampaignStatus: (campaignId) => {
        return api.post('/api/v1/campaigns/campaign-status/', { id: campaignId });
    },

    deleteCampaign: (campaignId) => {
        return api.delete(`/api/v1/campaigns/delete-campaign/?campaign_id=${campaignId}`);
    },

    duplicateCampaign: (campaignId) => {
        return api.post(`/api/v1/campaigns/duplicate-campaign/?campaign_id=${campaignId}`, {});
    },

    // Story Group Management
    getStoryGroups: (params = {}) => {
        const queryParams = new URLSearchParams(params);
        return api.get(`/api/v1/campaigns/list-story-groups/?${queryParams}`);
    },

    getStoryGroup: (groupId) => {
        return api.get(`/api/v1/campaigns/story-group-details/?id=${groupId}`);
    },

    createStoryGroup: (formData) => {
        return api.post('/api/v1/campaigns/create-story-group/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateStoryGroup: (formData, storyGroupId) => {
        return api.put(`/api/v1/campaigns/update-story-group/?campaign_id=${storyGroupId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteStoryGroup: (storyGroupId) => {
        return api.delete(`/api/v1/campaigns/delete-story-group/?id=${storyGroupId}`);
    },

    toggleStoryGroup: (storyGroupId) => {
        return api.post(`/api/v1/campaigns/toggle-story-group/?id=${storyGroupId}`);
    },

    updateStoryGroupOrder: (orderData) => {
        return api.put('/api/v1/campaigns/create-story-group/', orderData);
    },

    // Story Slide Management
    createStorySlide: (formData) => {
        return api.post('/api/v1/campaigns/create-story-slide/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateStorySlide: (formData) => {
        return api.put('/api/v1/campaigns/update-story-slide/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteStorySlide: (slideId) => {
        const formData = new FormData();
        formData.append('id', slideId);

        return api.delete(`/api/v1/campaigns/delete-story-slide/?id=${slideId}`, {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    listSlides: (groupId) => {
        return api.get(`/api/v1/campaigns/list-slides/?id=${groupId}`);
    },

    // Image Upload
    uploadImageLink: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return api.post('/api/v1/campaigns/image-link/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Analytics
    getCampaignAnalytics: (campaignId, startDate = null, endDate = null) => {
        let url = `${ANALYTICS_BASE_URL}/campaigns/${campaignId}`;
        if (startDate && endDate) {
            url += `?start=${startDate}T00:00:00&end=${endDate}T23:59:59`;
        }
        return api.get(url);
    },

    // Authentication
    refreshToken: (refreshToken) => {
        return api.post('/api/v1/auth/token/refresh/', { refresh: refreshToken });
    }
};

/**
 * Personalization API
 */
export const personalizationAPI = {
    listAttributes: () => {
        return analyticsApi.get('/list-attributes');
    }
};

export { analyticsApi };
export default api;
