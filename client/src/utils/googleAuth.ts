/**
 * Google OAuth Integration Utility
 * Uses Google Identity Services for secure OAuth authentication
 */

interface GoogleConfig {
  client_id: string;
  scope: string;
  callback: string;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
  sub: string; // Google user ID
}

interface GoogleAuthResponse {
  success: boolean;
  credential?: string;
  userInfo?: GoogleUserInfo;
  error?: string;
}

// Configuration
const GOOGLE_CONFIG: GoogleConfig = {
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  scope: 'email profile',
  callback: 'handleGoogleCallback',
  auto_select: false,
  cancel_on_tap_outside: true,
};

// Global state
let googleInitialized = false;
let googleScript: HTMLScriptElement | null = null;

// Extend Window interface to include Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notificationCallback: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
          }) => void) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: string; size: string; click_listener: () => void }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
    handleGoogleCallback?: (response: { credential: string }) => void;
  }
}

/**
 * Initialize Google Identity Services
 * @returns Promise<boolean> - True if initialized successfully
 */
export const initializeGoogleAuth = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (googleInitialized) {
      resolve(true);
      return;
    }

    if (!GOOGLE_CONFIG.client_id) {
      console.error('Google OAuth: Missing VITE_GOOGLE_CLIENT_ID environment variable');
      resolve(false);
      return;
    }

    // Check if script already exists
    if (document.querySelector('#google-identity-services')) {
      googleInitialized = true;
      resolve(true);
      return;
    }

    // Load Google Identity Services script
    googleScript = document.createElement('script');
    googleScript.id = 'google-identity-services';
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;

    googleScript.onload = () => {
      try {
        if (window.google?.accounts?.id) {
          // Initialize Google Identity Services
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CONFIG.client_id,
            callback: window.handleGoogleCallback || (() => {}),
            auto_select: GOOGLE_CONFIG.auto_select,
            cancel_on_tap_outside: GOOGLE_CONFIG.cancel_on_tap_outside,
          });
          
          googleInitialized = true;
          console.log('Google OAuth initialized successfully');
          resolve(true);
        } else {
          console.error('Google Identity Services failed to load properly');
          resolve(false);
        }
      } catch (error) {
        console.error('Error initializing Google OAuth:', error);
        resolve(false);
      }
    };

    googleScript.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      resolve(false);
    };

    document.head.appendChild(googleScript);
  });
};

/**
 * Trigger Google OAuth popup
 * @returns Promise<GoogleAuthResponse> - Promise that resolves with user credentials or error
 */
export const signInWithGoogle = (): Promise<GoogleAuthResponse> => {
  return new Promise((resolve, reject) => {
    if (!googleInitialized || !window.google?.accounts?.id) {
      reject(new Error('Google OAuth not initialized. Please try again.'));
      return;
    }

    // Set up callback for this specific sign-in attempt
    window.handleGoogleCallback = (response: { credential: string }) => {
      try {
        if (response.credential) {
          // Decode the JWT token to get user info
          const userInfo = parseJWT(response.credential);
          resolve({
            success: true,
            credential: response.credential,
            userInfo,
          });
        } else {
          reject(new Error('No credential received from Google'));
        }
      } catch (error) {
        reject(new Error(`Failed to process Google response: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    try {
      // Trigger the Google sign-in popup
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to manual sign-in if prompt fails
          showGoogleOneTap();
        }
      });
    } catch (error) {
      reject(new Error(`Failed to trigger Google sign-in: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
};

/**
 * Show Google One Tap sign-in as fallback
 */
const showGoogleOneTap = (): void => {
  if (window.google?.accounts?.id) {
    // Create a temporary button element for manual sign-in
    const tempButton = document.createElement('div');
    tempButton.style.display = 'none';
    document.body.appendChild(tempButton);

    window.google.accounts.id.renderButton(tempButton, {
      theme: 'outline',
      size: 'large',
      click_listener: () => {
        // This will be handled by the callback
      }
    });

    // Programmatically click the button
    setTimeout(() => {
      const googleButton = tempButton.querySelector<HTMLElement>('[role="button"]');
      if (googleButton) {
        googleButton.click();
      }
      document.body.removeChild(tempButton);
    }, 100);
  }
};

/**
 * Parse JWT token to extract user information
 * @param token - JWT token from Google
 * @returns GoogleUserInfo - Parsed user information
 */
const parseJWT = (token: string): GoogleUserInfo => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      email_verified: payload.email_verified,
      sub: payload.sub, // Google user ID
    };
  } catch (error) {
    throw new Error('Failed to parse Google JWT token');
  }
};

/**
 * Sign out from Google
 * @returns Promise<void>
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
      console.log('Signed out from Google');
    }
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Check if Google OAuth is available
 * @returns boolean
 */
export const isGoogleAuthAvailable = (): boolean => {
  return googleInitialized && !!window.google?.accounts?.id && !!GOOGLE_CONFIG.client_id;
};

/**
 * Get Google client configuration
 * @returns { clientId: string, isConfigured: boolean }
 */
export const getGoogleConfig = (): { clientId: string; isConfigured: boolean } => {
  return {
    clientId: GOOGLE_CONFIG.client_id,
    isConfigured: !!GOOGLE_CONFIG.client_id,
  };
};

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGoogleAuth);
  } else {
    initializeGoogleAuth();
  }
}

export default {
  initializeGoogleAuth,
  signInWithGoogle,
  signOutFromGoogle,
  isGoogleAuthAvailable,
  getGoogleConfig,
};