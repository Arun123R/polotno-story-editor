/**
 * Story Campaign Backend Integration
 * Main export file for all backend services and utilities
 */

// Services
export { default as api, storyAPI, personalizationAPI, analyticsApi } from './services/api.js';
export { default as storyService } from './services/storyService.js';
export {
    setAuthTokens,
    getStoredAccessToken,
    getStoredRefreshToken,
    clearAuthTokens,
    ensureValidAccessToken,
    isAccessTokenValid,
    syncExpiryFromAccessTokenIfMissing,
    markUserActivity
} from './services/authSession.js';

// Schemas
export {
    CampaignSchema,
    StoryGroupSchema,
    StorySlideSchema,
    RedirectTypes,
    ConditionsSchema,
    ConditionItemSchema,
    PersonalizationConfigSchema,
    createDefaultCampaign,
    createDefaultStoryGroup,
    createDefaultStorySlide,
    validateCampaign,
    validateStoryGroup,
    validateStorySlide
} from './schemas/storySchemas.js';

// Utilities
export {
    buildCampaignPayload,
    buildStoryGroupFormData,
    buildStorySlideFormData,
    shouldCreateSlide,
    uploadCampaignImageLink,
    getPersonalisationAttributeMeta,
    buildStoryPersonalisationConfigFromCampaignDetails
} from './utils/storyPayload.js';

export {
    mapConditionData,
    prepareConditionsForSubmission
} from './utils/conditions.js';

// Configuration
export { API_BASE_URL, ANALYTICS_BASE_URL, COHORTS_BASE_URL } from './config/global.js';
