/**
 * Auto-Login Provider (TESTING ONLY)
 * 
 * Higher-Order Component that automatically authenticates the user
 * before rendering the application.
 * 
 * USAGE:
 * Wrap your main App component:
 * 
 * <AutoLoginProvider>
 *   <App />
 * </AutoLoginProvider>
 * 
 * TO REMOVE LATER:
 * 1. Delete this file
 * 2. Delete authService.js
 * 3. Remove wrapper from main.jsx
 * 4. Implement proper login UI
 */

import React, { useState, useEffect } from 'react';
import { initializeAuth } from './authService';

/**
 * Loading screen component
 */
const LoadingScreen = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '24px'
        }} />
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            Initializing Editor...
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
            Authenticating
        </p>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

/**
 * Error screen component
 */
const ErrorScreen = ({ error, onRetry }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px'
    }}>
        <div style={{
            fontSize: '48px',
            marginBottom: '24px'
        }}>⚠️</div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
            Authentication Failed
        </h2>
        <p style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#999',
            maxWidth: '400px',
            textAlign: 'center'
        }}>
            {error}
        </p>
        <button
            onClick={onRetry}
            style={{
                padding: '12px 24px',
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
        >
            Retry
        </button>
    </div>
);

/**
 * Auto-Login Provider Component
 * 
 * This HOC handles automatic authentication before rendering children.
 * It will:
 * 1. Check for existing token in localStorage
 * 2. If found, set axios header and render immediately
 * 3. If not found, call login endpoint with hardcoded credentials
 * 4. Show loading screen during authentication
 * 5. Show error screen if authentication fails
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - App components to render after auth
 */
export const AutoLoginProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isLoading: true,
        error: null
    });

    const authenticate = async () => {
        setAuthState({ isAuthenticated: false, isLoading: true, error: null });

        try {
            await initializeAuth();
            setAuthState({ isAuthenticated: true, isLoading: false, error: null });
        } catch (error) {
            console.error('[AutoLoginProvider] Authentication failed:', error);
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                error: error.message || 'Failed to authenticate. Please check your connection.'
            });
        }
    };

    useEffect(() => {
        authenticate();
    }, []);

    // Show loading screen
    if (authState.isLoading) {
        return <LoadingScreen />;
    }

    // Show error screen
    if (authState.error) {
        return <ErrorScreen error={authState.error} onRetry={authenticate} />;
    }

    // Render app
    return <>{children}</>;
};

/**
 * HOC version (alternative usage)
 * 
 * Usage:
 * export default withAutoLogin(App);
 */
export const withAutoLogin = (Component) => {
    return (props) => (
        <AutoLoginProvider>
            <Component {...props} />
        </AutoLoginProvider>
    );
};
