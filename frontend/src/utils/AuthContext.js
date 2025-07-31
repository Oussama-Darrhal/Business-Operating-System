import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiCall, authenticatedApiCall, tokenManager } from './api';
import { signInWithGoogle, initializeGoogleAuth, signOutFromGoogle } from './googleAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth states
const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Clear error when needed
  const clearError = useCallback(() => setError(null), []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(AUTH_STATES.LOADING);
      setError(null);

      const token = tokenManager.get();
      if (!token) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        setUser(null);
        return false;
      }

      // Verify token with backend
      const response = await authenticatedApiCall('/api/user');

      if (response.success && response.user) {
        setUser(response.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        return true;
      } else {
        // Token is invalid
        tokenManager.remove();
        setUser(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.remove();
      setUser(null);
      setAuthState(AUTH_STATES.ERROR);
      setError('Failed to verify authentication. Please try logging in again.');
      return false;
    }
  }, []);

  // Initialize auth state on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      
      const response = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      if (response.success && response.user && response.token) {
        // Store token securely
        tokenManager.set(response.token);
        
        // Update auth state
        setUser(response.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        return {
          success: true,
          data: response,
          message: response.message || 'Login successful'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
          errors: response.errors
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during login. Please try again.'
      };
    }
  }, []);

  // Registration function
  const registerSme = useCallback(async (registrationData) => {
    try {
      setError(null);
      
      // Prepare data for API - ensure password_confirmation is properly named
      const apiData = {
        sme_name: registrationData.sme_name?.trim(),
        user_name: registrationData.user_name?.trim(),
        email: registrationData.email?.trim(),
        password: registrationData.password,
        password_confirmation: registrationData.confirmPassword, // Fix naming issue
        business_type: registrationData.business_type?.trim(),
        phone: registrationData.phone?.trim(),
        city: registrationData.city?.trim(),
        country: registrationData.country?.trim(),
      };

      // Remove empty optional fields
      Object.keys(apiData).forEach(key => {
        if (!apiData[key] && !['password', 'password_confirmation'].includes(key)) {
          delete apiData[key];
        }
      });

      const response = await apiCall('/api/register-sme', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });

      if (response.success && response.user && response.token) {
        // Store token securely
        tokenManager.set(response.token);
        
        // Update auth state
        setUser(response.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        return {
          success: true,
          data: response,
          message: response.message || 'Registration successful'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Registration failed',
          errors: response.errors
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during registration. Please try again.'
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Attempt to logout on server
      const token = tokenManager.get();
      if (token) {
        await authenticatedApiCall('/api/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server request fails
    } finally {
      // Always clean up local state
      tokenManager.remove();
      setUser(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setError(null);
    }
  }, []);

  // Google OAuth login function
  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      
      // Ensure Google OAuth is initialized
      await initializeGoogleAuth();
      
      // Get Google credentials
      const googleResponse = await signInWithGoogle();
      
      if (!googleResponse.success || !googleResponse.credential) {
        return {
          success: false,
          message: 'Failed to authenticate with Google. Please try again.'
        };
      }

      // Send Google credential to backend for verification and user creation/login
      const response = await apiCall('/api/oauth/google/login', {
        method: 'POST',
        body: JSON.stringify({
          credential: googleResponse.credential,
          user_info: googleResponse.userInfo,
        }),
      });

      if (response.success && response.user && response.token) {
        // Store token securely
        tokenManager.set(response.token);
        
        // Update auth state
        setUser(response.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        return {
          success: true,
          data: response,
          message: response.message || 'Google login successful'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Google authentication failed',
          errors: response.errors
        };
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      // Handle specific Google OAuth errors
      let errorMessage = 'An unexpected error occurred during Google login. Please try again.';
      
      if (error.message.includes('popup_closed_by_user')) {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (error.message.includes('popup_blocked')) {
        errorMessage = 'Popup blocked. Please allow popups for this site and try again.';
      } else if (error.message.includes('not initialized')) {
        errorMessage = 'Google sign-in is not available. Please try regular login.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Google OAuth registration function
  const registerWithGoogle = useCallback(async (additionalData = {}) => {
    try {
      setError(null);
      
      // Ensure Google OAuth is initialized
      await initializeGoogleAuth();
      
      // Get Google credentials
      const googleResponse = await signInWithGoogle();
      
      if (!googleResponse.success || !googleResponse.credential) {
        return {
          success: false,
          message: 'Failed to authenticate with Google. Please try again.'
        };
      }

      // Send Google credential to backend for registration
      const response = await apiCall('/api/oauth/google/register', {
        method: 'POST',
        body: JSON.stringify({
          credential: googleResponse.credential,
          user_info: googleResponse.userInfo,
          ...additionalData, // Additional SME data like business name, etc.
        }),
      });

      if (response.success && response.user && response.token) {
        // Store token securely
        tokenManager.set(response.token);
        
        // Update auth state
        setUser(response.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        
        return {
          success: true,
          data: response,
          message: response.message || 'Google registration successful'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Google registration failed',
          errors: response.errors
        };
      }
    } catch (error) {
      console.error('Google registration error:', error);
      
      // Handle specific Google OAuth errors
      let errorMessage = 'An unexpected error occurred during Google registration. Please try again.';
      
      if (error.message.includes('popup_closed_by_user')) {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (error.message.includes('popup_blocked')) {
        errorMessage = 'Popup blocked. Please allow popups for this site and try again.';
      } else if (error.message.includes('not initialized')) {
        errorMessage = 'Google sign-in is not available. Please try regular registration.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Enhanced logout function that includes Google logout
  const logoutEnhanced = useCallback(async () => {
    try {
      // Sign out from Google if user was authenticated via Google
      if (user?.auth_provider === 'google') {
        await signOutFromGoogle();
      }
      
      // Continue with regular logout
      await logout();
    } catch (error) {
      console.error('Enhanced logout error:', error);
      // Continue with regular logout even if Google logout fails
      await logout();
    }
  }, [user, logout]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (authState !== AUTH_STATES.AUTHENTICATED) return false;
    
    try {
      const response = await authenticatedApiCall('/api/user');
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        // Token might be invalid, trigger full auth check
        await checkAuth();
        return false;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Trigger full auth check on error
      await checkAuth();
      return false;
    }
  }, [authState, checkAuth]);

  // Update user data (for profile updates)
  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Get user's SME information
  const getSmeInfo = useCallback(() => {
    if (!user) return null;
    return {
      id: user.sme_id,
      name: user.sme_name,
    };
  }, [user]);

  // Computed values
  const isLoading = authState === AUTH_STATES.LOADING;
  const isAuthenticated = authState === AUTH_STATES.AUTHENTICATED && !!user;
  const isUnauthenticated = authState === AUTH_STATES.UNAUTHENTICATED;
  const hasError = authState === AUTH_STATES.ERROR || !!error;

  // Context value
  const value = {
    // State
    user,
    authState,
    error,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    hasError,
    
    // Actions
    login,
    registerSme,
    logout: logoutEnhanced,
    checkAuth,
    refreshUser,
    updateUser,
    clearError,
    
    // OAuth Actions
    loginWithGoogle,
    registerWithGoogle,
    
    // Utilities
    hasRole,
    isAdmin,
    getSmeInfo,
    
    // Deprecated (for backward compatibility)
    token: tokenManager.get(),
    loading: isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 