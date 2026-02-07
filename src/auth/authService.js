/**
 * Auto-Login Service (TESTING ONLY)
 * 
 * This file contains hardcoded credentials for automatic authentication.
 * DO NOT USE IN PRODUCTION.
 * 
 * To remove this later:
 * 1. Delete this file
 * 2. Delete AutoLoginProvider.jsx
 * 3. Remove <AutoLoginProvider> wrapper from main.jsx
 */

import axios from 'axios';

import { setAuthTokens, getStoredAccessToken, getStoredRefreshToken, clearAuthTokens } from '../services/authSession.js';

// ============================================
// HARDCODED CREDENTIALS (TESTING ONLY)
// ============================================
const TEST_CREDENTIALS = {
    email: 'support@appstorys.com',
    password: '1234'
};

/**
 * Set axios default Authorization header
 */
const setAxiosAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

/**
 * Perform auto-login with hardcoded credentials
 * 
 * @returns {Promise<string>} - Access token
 * @throws {Error} - If login fails
 */
export const performAutoLogin = async () => {
    console.log('[AutoLogin] Attempting auto-login...');

    try {
        const response = await axios.post(
            `https://backend.appstorys.co/api/v1/auth/token/`,
            TEST_CREDENTIALS,
            {
                // Skip auth interceptor for login request
                skipAuth: true
            }
        );

        const { access, refresh } = response.data;

        if (!access) {
            throw new Error('No access token received from server');
        }

        // Store tokens using existing authSession utility
        setAuthTokens({
            accessToken: access,
            refreshToken: refresh,
            accessExpiresAtMs: null // Will be derived from JWT
        });

        // Set axios header
        setAxiosAuthHeader(access);

        console.log('[AutoLogin] ✅ Auto-login successful');
        return access;

    } catch (error) {
        console.error('[AutoLogin] ❌ Auto-login failed:', error);
        throw new Error(`Auto-login failed: ${error.message}`);
    }
};

/**
 * Initialize authentication
 * - Checks if token exists in localStorage
 * - If yes, sets axios header and returns immediately
 * - If no, performs auto-login
 * 
 * @returns {Promise<string>} - Access token
 */
export const initializeAuth = async () => {
    const existingToken = getStoredAccessToken();

    if (existingToken) {
        console.log('[AutoLogin] ✅ Token found in localStorage, skipping login');
        setAxiosAuthHeader(existingToken);
        return existingToken;
    }

    console.log('[AutoLogin] No token found, performing auto-login...');
    return await performAutoLogin();
};

// Re-export for convenience
export { getStoredAccessToken, getStoredRefreshToken, clearAuthTokens };
