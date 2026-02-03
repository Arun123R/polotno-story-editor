/**
 * Auth Token Initializer
 * Ensures auth tokens are available before the editor loads
 */

import { useEffect, useState } from 'react';
import {
    setAuthTokens,
    getStoredAccessToken,
    getStoredRefreshToken
} from '../services/authSession.js';

/**
 * Hook to initialize and verify auth tokens
 * @returns {Object} { isAuthenticated, isLoading, error }
 */
export const useAuthInit = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('🔐 Initializing authentication...');

                // Check if tokens already exist in localStorage
                const existingAccessToken = getStoredAccessToken();
                const existingRefreshToken = getStoredRefreshToken();

                if (existingAccessToken && existingRefreshToken) {
                    console.log('✅ Auth tokens found in localStorage');
                    setIsAuthenticated(true);
                    setIsLoading(false);
                    return;
                }

                // Try to get tokens from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const urlToken = urlParams.get('token');
                const urlRefresh = urlParams.get('refresh');

                if (urlToken) {
                    console.log('✅ Auth tokens found in URL parameters');
                    setAuthTokens({
                        accessToken: urlToken,
                        refreshToken: urlRefresh || undefined,
                        accessExpiresAtMs: Date.now() + 3600000, // 1 hour
                    });
                    setIsAuthenticated(true);
                    setIsLoading(false);

                    // Clean URL (remove tokens from address bar)
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }

                // Try to get tokens from parent window (if in iframe)
                if (window.parent !== window) {
                    console.log('📡 Requesting auth tokens from parent window...');

                    // Request tokens from parent
                    window.parent.postMessage({ type: 'REQUEST_AUTH_TOKENS' }, '*');

                    // Wait for response
                    const timeout = setTimeout(() => {
                        console.error('❌ Timeout waiting for auth tokens from parent');
                        setError('Authentication timeout. Please login.');
                        setIsLoading(false);
                    }, 5000);

                    const handleMessage = (event) => {
                        if (event.data.type === 'AUTH_TOKENS') {
                            clearTimeout(timeout);
                            console.log('✅ Received auth tokens from parent window');

                            setAuthTokens({
                                accessToken: event.data.accessToken,
                                refreshToken: event.data.refreshToken,
                                accessExpiresAtMs: event.data.accessExpiresAtMs || Date.now() + 3600000,
                            });

                            setIsAuthenticated(true);
                            setIsLoading(false);
                            window.removeEventListener('message', handleMessage);
                        }
                    };

                    window.addEventListener('message', handleMessage);
                    return;
                }

                // No tokens found anywhere
                console.error('❌ No auth tokens found');
                setError('Not authenticated. Please login.');
                setIsLoading(false);

            } catch (err) {
                console.error('❌ Auth initialization error:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    return { isAuthenticated, isLoading, error };
};

/**
 * Auth Guard Component
 * Wraps the editor and ensures authentication before rendering
 */
export const AuthGuard = ({ children, onAuthError }) => {
    const { isAuthenticated, isLoading, error } = useAuthInit();

    useEffect(() => {
        if (error && onAuthError) {
            onAuthError(error);
        }
    }, [error, onAuthError]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #333',
                        borderTopColor: '#F97316',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px',
                    }} />
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>
                        Initializing authentication...
                    </div>
                    <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
                </div>
            </div>
        );
    }

    if (error || !isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '32px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    maxWidth: '400px',
                }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                    }}>🔒</div>
                    <h2 style={{
                        margin: '0 0 8px 0',
                        fontSize: '20px',
                        fontWeight: '600',
                    }}>Authentication Required</h2>
                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: '14px',
                        opacity: 0.7,
                        lineHeight: '1.5',
                    }}>
                        {error || 'Please login to access the editor.'}
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#F97316',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

/**
 * Manual token setter for testing
 * Use this in browser console for quick testing
 */
export const setTestTokens = (accessToken, refreshToken) => {
    console.log('🧪 Setting test auth tokens...');
    setAuthTokens({
        accessToken,
        refreshToken,
        accessExpiresAtMs: Date.now() + 3600000,
    });
    console.log('✅ Test tokens set. Refresh the page.');
};

// Expose to window for console access
if (typeof window !== 'undefined') {
    window.setTestTokens = setTestTokens;
}
