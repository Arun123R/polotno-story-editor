/// <reference types="vite/client" />
import { setAuthTokens } from './services/authSession';

/**
 * editorBootstrap.ts
 *
 * Handles the secure initialization of the editor.
 * 
 * CORE RESPONSIBILITIES:
 * 1. Read strict environment variables / query params:
 *    - storyGroupId (Required)
 *    - slideId (Optional - if present, we are updating. If missing, we are creating)
 *    - accessToken (Short-lived, for API)
 *    - refreshToken (For updating accessToken)
 * 2. Initialize the Auth Session with these tokens immediately.
 * 3. Validate context (warn in DEV if running in fallback mode).
 */

const isDev = import.meta.env.DEV;

// --- Helper Functions ---

const getQueryParam = (param: string): string | null => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
};

const warnInDev = (message: string) => {
    if (isDev) {
        console.warn(`[Editor Bootstrap] ${message}`);
    }
};

// --- Resolution Logic ---

/**
 * Story Group ID is REQUIRED.
 * Used to link the slide to its parent group.
 */
const resolveStoryGroupId = (): string | null => {
    const fromUrl = getQueryParam('storyGroupId') || getQueryParam('parentId'); // Support both for backward comapt if needed, but prefer storyGroupId
    if (fromUrl) return fromUrl;

    if (isDev) {
        const fromEnv = import.meta.env.VITE_STORY_GROUP_ID || import.meta.env.VITE_PARENT_ID;
        if (fromEnv) {
            warnInDev('Using fallback STORY_GROUP_ID from .env');
            return fromEnv;
        }
    }
    return null;
};

/**
 * Slide ID is OPTIONAL.
 * If present: Editor is in UPDATE mode.
 * If missing: Editor is in CREATE mode.
 */
const resolveSlideId = (): string | null => {
    const fromUrl = getQueryParam('slideId');
    if (fromUrl) return fromUrl;

    if (isDev) {
        const fromEnv = import.meta.env.VITE_SLIDE_ID;
        if (fromEnv) {
            warnInDev('Using fallback SLIDE_ID from .env');
            return fromEnv;
        }
    }
    return null;
};

/**
 * Resolves Auth Tokens.
 * In PROD: Expected to be removed from URL after bootstrap (or passed via specialized flow).
 * In DEV: Can be in .env.
 */
const resolveTokens = () => {
    let access = getQueryParam('accessToken');
    let refresh = getQueryParam('refreshToken');

    // Fallback for DEV logic using old 'token' param or .env
    if (isDev && !access) {
        // Check for old single token param
        const oldToken = getQueryParam('token');
        if (oldToken) {
            warnInDev('Using legacy "token" param as accessToken');
            access = oldToken;
        }

        // Env fallback
        if (!access) access = import.meta.env.VITE_ACCESS_TOKEN || import.meta.env.VITE_AUTH_TOKEN;
        if (!refresh) refresh = import.meta.env.VITE_REFRESH_TOKEN;
    }

    return { accessToken: access, refreshToken: refresh };
};

/**
 * Campaign ID is OPTIONAL (but helpful for full context).
 * Used to fetch campaign-level details if needed.
 */
const resolveCampaignId = (): string | null => {
    const fromUrl = getQueryParam('campaignId');
    if (fromUrl) return fromUrl;

    if (isDev) {
        const fromEnv = import.meta.env.VITE_CAMPAIGN_ID;
        if (fromEnv) {
            warnInDev('Using fallback CAMPAIGN_ID from .env');
            return fromEnv;
        }
    }
    return null;
};

// --- Execution ---

export const campaignId = resolveCampaignId();
export const storyGroupId = resolveStoryGroupId();
export const slideId = resolveSlideId();
const { accessToken, refreshToken } = resolveTokens();

// IMMEDIATE ACTION: Initialize Auth Session
// This ensures any subsequent API calls (even during app mount) have valid credentials.
if (accessToken) {
    setAuthTokens({
        accessToken,
        refreshToken: refreshToken || undefined,
        accessExpiresAtMs: undefined // Will be derived lazily if needed
    });
    if (isDev) {
        console.log('[Editor Bootstrap] Tokens initialized in session storage.');
    }
} else {
    // If no token found, we might rely on existing local storage session,
    // but in a strict iframe/bootstrap context, this might be an error state.
    if (isDev) warnInDev('No access token found in bootstrap args.');
}
