import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiCall, authenticatedApiCall, tokenManager } from './api';
import { signInWithGoogle, initializeGoogleAuth, signOutFromGoogle } from './googleAuth';

// Define types for your auth system
type User = {
  id: string;
  email: string;
  role: string;
  sme_id?: string;
  sme_name?: string;
  auth_provider?: 'google' | 'email';
  // Add other user properties as needed
};

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

type AuthApiResponse = {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  errors?: Record<string, string>;
};

type LoginResponse = {
  success: boolean;
  data?: AuthApiResponse;
  message?: string;
  errors?: Record<string, string>;
};

type RegistrationData = {
  sme_name?: string;
  user_name?: string;
  email: string;
  password: string;
  confirmPassword: string;
  business_type?: string;
  phone?: string;
  city?: string;
  country?: string;
};

// Context type
interface AuthContextType {
  // State
  user: User | null;
  authState: AuthState;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
  hasError: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<LoginResponse>;
  registerSme: (registrationData: RegistrationData) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshUser: () => Promise<boolean>;
  updateUser: (updatedUserData: Partial<User>) => void;
  clearError: () => void;
  
  // OAuth Actions
  loginWithGoogle: () => Promise<LoginResponse>;
  registerWithGoogle: (additionalData?: Partial<RegistrationData>) => Promise<LoginResponse>;
  
  // Utilities
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  getSmeInfo: () => { id: string; name: string } | null;
  
  // Deprecated (for backward compatibility)
  token: string | null;
  loading: boolean;
}

// Create context with initial undefined value but proper type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear error when needed
  const clearError = useCallback(() => setError(null), []);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState('loading');
      setError(null);

      const token = tokenManager.get();
      if (!token) {
        setAuthState('unauthenticated');
        setUser(null);
        return false;
      }

      // Verify token with backend
      const response = await authenticatedApiCall('/api/user') as AuthApiResponse;

      if (response.success && response.user) {
        setUser(response.user);
        setAuthState('authenticated');
        return true;
      } else {
        // Token is invalid
        tokenManager.remove();
        setUser(null);
        setAuthState('unauthenticated');
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.remove();
      setUser(null);
      setAuthState('error');
      setError('Failed to verify authentication. Please try logging in again.');
      return false;
    }
  }, []);

  // Initialize auth state on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setError(null);
      
      const response = await apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      }) as AuthApiResponse;

      if (response.success && response.user && response.token) {
        // Store token securely
        tokenManager.set(response.token);
        
        // Update auth state
        setUser(response.user);
        setAuthState('authenticated');
        
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
  const registerSme = useCallback(async (registrationData: RegistrationData): Promise<LoginResponse> => {
    try {
      setError(null);
      
      // Prepare data for API
      const apiData = {
        sme_name: registrationData.sme_name?.trim(),
        user_name: registrationData.user_name?.trim(),
        email: registrationData.email?.trim(),
        password: registrationData.password,
        password_confirmation: registrationData.confirmPassword,
        business_type: registrationData.business_type?.trim(),
        phone: registrationData.phone?.trim(),
        city: registrationData.city?.trim(),
        country: registrationData.country?.trim(),
      };

      // Remove empty optional fields
      Object.keys(apiData).forEach(key => {
        if (!apiData[key as keyof typeof apiData] && !['password', 'password_confirmation'].includes(key)) {
          delete apiData[key as keyof typeof apiData];
        }
      });

      const response = await apiCall('/api/register-sme', {
        method: 'POST',
        body: JSON.stringify(apiData),
      }) as AuthApiResponse;

      if (response.success && response.user && response.token) {
        // Store token securely
        tokenManager.set(response.token);
        
        // Update auth state
        setUser(response.user);
        setAuthState('authenticated');
        
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
  const logout = useCallback(async (): Promise<void> => {
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
      setAuthState('unauthenticated');
      setError(null);
    }
  }, []);

  // Google OAuth login function
  const loginWithGoogle = useCallback(async (): Promise<LoginResponse> => {
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

      // Send Google credential to backend
      const response = await apiCall('/api/oauth/google/login', {
        method: 'POST',
        body: JSON.stringify({
          credential: googleResponse.credential,
          user_info: googleResponse.userInfo,
        }),
      }) as AuthApiResponse;

      if (response.success && response.user && response.token) {
        tokenManager.set(response.token);
        setUser(response.user);
        setAuthState('authenticated');
        
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
      
      let errorMessage = 'An unexpected error occurred during Google login. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (error.message.includes('popup_blocked')) {
          errorMessage = 'Popup blocked. Please allow popups for this site and try again.';
        } else if (error.message.includes('not initialized')) {
          errorMessage = 'Google sign-in is not available. Please try regular login.';
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Google OAuth registration function
  const registerWithGoogle = useCallback(async (additionalData: Partial<RegistrationData> = {}): Promise<LoginResponse> => {
    try {
      setError(null);
      
      await initializeGoogleAuth();
      const googleResponse = await signInWithGoogle();
      
      if (!googleResponse.success || !googleResponse.credential) {
        return {
          success: false,
          message: 'Failed to authenticate with Google. Please try again.'
        };
      }

      const response = await apiCall('/api/oauth/google/register', {
        method: 'POST',
        body: JSON.stringify({
          credential: googleResponse.credential,
          user_info: googleResponse.userInfo,
          ...additionalData,
        }),
      }) as AuthApiResponse;

      if (response.success && response.user && response.token) {
        tokenManager.set(response.token);
        setUser(response.user);
        setAuthState('authenticated');
        
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
      
      let errorMessage = 'An unexpected error occurred during Google registration. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (error.message.includes('popup_blocked')) {
          errorMessage = 'Popup blocked. Please allow popups for this site and try again.';
        } else if (error.message.includes('not initialized')) {
          errorMessage = 'Google sign-in is not available. Please try regular registration.';
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  // Enhanced logout function
  const logoutEnhanced = useCallback(async (): Promise<void> => {
    try {
      if (user?.auth_provider === 'google') {
        await signOutFromGoogle();
      }
      await logout();
    } catch (error) {
      console.error('Enhanced logout error:', error);
      await logout();
    }
  }, [user, logout]);

  // Refresh user data
  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (authState !== 'authenticated') return false;
    
    try {
      const response = await authenticatedApiCall('/api/user') as AuthApiResponse;
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        await checkAuth();
        return false;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      await checkAuth();
      return false;
    }
  }, [authState, checkAuth]);

  // Update user data
  const updateUser = useCallback((updatedUserData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedUserData } : null);
  }, []);

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  // Get user's SME information
  const getSmeInfo = useCallback(() => {
    if (!user) return null;
    return {
      id: user.sme_id || '',
      name: user.sme_name || '',
    };
  }, [user]);

  // Computed values
  const isLoading = authState === 'loading';
  const isAuthenticated = authState === 'authenticated' && !!user;
  const isUnauthenticated = authState === 'unauthenticated';
  const hasError = authState === 'error' || !!error;

  // Context value
  const value: AuthContextType = {
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
    
    // Deprecated
    token: tokenManager.get(),
    loading: isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};