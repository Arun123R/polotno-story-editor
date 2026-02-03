import axios from 'axios';
import { API_BASE_URL } from '../config/global.js';

const STORAGE_KEYS = {
    access: 'access',
    refresh: 'refresh',
    accessExpiresAt: 'access_expires_at',
};

const DEFAULT_REFRESH_BUFFER_MS = 90 * 1000;

let refreshPromise = null;
let lastActivityAtMs = Date.now();

export function markUserActivity() {
    lastActivityAtMs = Date.now();
}

function isTabActive() {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible' && !document.hidden;
}

function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

function getExpiryFromJwtMs(accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const expSeconds = payload?.exp;
    if (!expSeconds || typeof expSeconds !== 'number') return null;
    return expSeconds * 1000;
}

function coerceExpiresAtMs(tokenResponse, accessToken) {
    const now = Date.now();

    const candidates = [
        tokenResponse?.access_token_expires_at,
        tokenResponse?.accessTokenExpiresAt,
        tokenResponse?.expires_at,
        tokenResponse?.expiresAt,
    ].filter(Boolean);

    if (candidates.length > 0) {
        const v = candidates[0];
        if (typeof v === 'number') {
            return v < 10_000_000_000 ? v * 1000 : v;
        }
        if (typeof v === 'string') {
            const num = Number(v);
            if (!Number.isNaN(num)) return num < 10_000_000_000 ? num * 1000 : num;
            const parsed = Date.parse(v);
            if (!Number.isNaN(parsed)) return parsed;
        }
    }

    const expiresInCandidates = [
        tokenResponse?.access_token_expires_in,
        tokenResponse?.accessTokenExpiresIn,
        tokenResponse?.expires_in,
        tokenResponse?.expiresIn,
    ].filter((x) => x !== undefined && x !== null);

    if (expiresInCandidates.length > 0) {
        const v = expiresInCandidates[0];
        const seconds = typeof v === 'string' ? Number(v) : v;
        if (typeof seconds === 'number' && Number.isFinite(seconds)) {
            return now + seconds * 1000;
        }
    }

    const fromJwt = accessToken ? getExpiryFromJwtMs(accessToken) : null;
    return fromJwt;
}

export function getStoredAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.access);
}

export function getStoredRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.refresh);
}

export function getStoredAccessExpiresAtMs() {
    const raw = localStorage.getItem(STORAGE_KEYS.accessExpiresAt);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export function setAuthTokens({ accessToken, refreshToken, accessExpiresAtMs }) {
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
    if (accessToken) localStorage.setItem(STORAGE_KEYS.access, accessToken);
    if (accessExpiresAtMs) localStorage.setItem(STORAGE_KEYS.accessExpiresAt, String(accessExpiresAtMs));
}

export function clearAuthTokens() {
    localStorage.removeItem(STORAGE_KEYS.access);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    localStorage.removeItem(STORAGE_KEYS.accessExpiresAt);
}

export function syncExpiryFromAccessTokenIfMissing() {
    const accessToken = getStoredAccessToken();
    if (!accessToken) return;
    const existing = getStoredAccessExpiresAtMs();
    if (existing) return;
    const expiresAtMs = getExpiryFromJwtMs(accessToken);
    if (expiresAtMs) {
        localStorage.setItem(STORAGE_KEYS.accessExpiresAt, String(expiresAtMs));
    }
}

export function isAccessTokenValid({ bufferMs = 0 } = {}) {
    const accessToken = getStoredAccessToken();
    if (!accessToken) return false;
    const expiresAtMs = getStoredAccessExpiresAtMs();
    if (!expiresAtMs) return true;
    return Date.now() + bufferMs < expiresAtMs;
}

export async function refreshAccessToken() {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const refreshAxios = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
    });

    const response = await refreshAxios.post('/api/v1/auth/token/refresh/', { refresh: refreshToken });

    const newAccess = response?.data?.access;
    if (!newAccess) throw new Error('No access token in refresh response');

    const expiresAtMs = coerceExpiresAtMs(response.data, newAccess);

    setAuthTokens({
        accessToken: newAccess,
        refreshToken: response?.data?.refresh,
        accessExpiresAtMs: expiresAtMs,
    });

    return newAccess;
}

export async function ensureValidAccessToken({
    bufferMs = DEFAULT_REFRESH_BUFFER_MS,
    requireActiveTab = true,
    maxIdleMs = 10 * 60 * 1000,
} = {}) {
    markUserActivity();
    syncExpiryFromAccessTokenIfMissing();

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    const accessToken = getStoredAccessToken();
    const expiresAtMs = getStoredAccessExpiresAtMs();

    if (accessToken && expiresAtMs && Date.now() < expiresAtMs - bufferMs) {
        return accessToken;
    }
    if (accessToken && !expiresAtMs) {
        return accessToken;
    }

    if (requireActiveTab) {
        const idleTooLong = Date.now() - lastActivityAtMs > maxIdleMs;
        if (!isTabActive() || idleTooLong) {
            return accessToken;
        }
    }

    if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

export function shouldRefreshSoon({ bufferMs = DEFAULT_REFRESH_BUFFER_MS } = {}) {
    const expiresAtMs = getStoredAccessExpiresAtMs();
    if (!expiresAtMs) return false;
    return Date.now() >= expiresAtMs - bufferMs;
}

export function deriveExpiresAtAndStore(tokenResponse) {
    const accessToken = tokenResponse?.access;
    const refreshToken = tokenResponse?.refresh;
    const expiresAtMs = coerceExpiresAtMs(tokenResponse, accessToken);
    setAuthTokens({ accessToken, refreshToken, accessExpiresAtMs: expiresAtMs });
    return { accessToken, refreshToken, expiresAtMs };
}
