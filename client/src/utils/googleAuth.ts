/**
 * Fixed Google OAuth Integration Utility
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
let currentResolve: ((value: GoogleAuthResponse) => void) | null = null;
let currentReject: ((reason?: unknown) => void) | null = null;
let currentCleanup: (() => void) | null = null;

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
          prompt: (notificationCallback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason?: () => string;
            getSkippedReason?: () => string;
          }) => void) => void;
          renderButton: (
            element: HTMLElement,
            options: { 
              theme: string; 
              size: string; 
              type?: string;
              text?: string;
              click_listener?: () => void 
            }
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
    if (googleInitialized && window.google?.accounts?.id) {
      resolve(true);
      return;
    }

    if (!GOOGLE_CONFIG.client_id) {
      console.error('Google OAuth: Missing VITE_GOOGLE_CLIENT_ID environment variable');
      resolve(false);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('#google-identity-services');
    if (existingScript) {
      // Wait for script to load if it exists
      if (window.google?.accounts?.id) {
        googleInitialized = true;
        setupGoogleCallback();
        resolve(true);
      } else {
        existingScript.addEventListener('load', () => {
          googleInitialized = true;
          setupGoogleCallback();
          resolve(true);
        });
      }
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
          setupGoogleCallback();
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
 * Setup Google callback function
 */
const setupGoogleCallback = () => {
  if (!window.google?.accounts?.id) return;

  // Initialize Google Identity Services
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CONFIG.client_id,
    callback: handleGoogleResponse,
    auto_select: GOOGLE_CONFIG.auto_select,
    cancel_on_tap_outside: GOOGLE_CONFIG.cancel_on_tap_outside,
  });

  // Set global callback
  window.handleGoogleCallback = handleGoogleResponse;
};

/**
 * Handle Google OAuth response
 */
const handleGoogleResponse = (response: { credential: string }) => {
  try {
    if (response.credential) {
      const userInfo = parseJWT(response.credential);
      const result: GoogleAuthResponse = {
        success: true,
        credential: response.credential,
        userInfo,
      };

      if (currentResolve) {
        currentResolve(result);
        currentResolve = null;
        currentReject = null;
      }
    } else {
      const error = 'No credential received from Google';
      console.error(error);
      if (currentReject) {
        currentReject(new Error(error));
        currentResolve = null;
        currentReject = null;
      }
    }
  } catch (error) {
    console.error('Failed to process Google response:', error);
    if (currentReject) {
      currentReject(error);
      currentResolve = null;
      currentReject = null;
    }
  }
};

/**
 * Trigger Google OAuth sign-in
 * @returns Promise<GoogleAuthResponse> - Promise that resolves with user credentials or error
 */
export const signInWithGoogle = (): Promise<GoogleAuthResponse> => {
  return new Promise((resolve, reject) => {
    if (!googleInitialized || !window.google?.accounts?.id) {
      reject(new Error('Google OAuth not initialized. Please try again.'));
      return;
    }

    // Clean up any previous state
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }

    // Store resolve/reject for callback
    currentResolve = resolve;
    currentReject = reject;

    // Set up shorter timeout for better UX
    const timeout = setTimeout(() => {
      if (currentReject) {
        currentReject(new Error('Google sign-in timed out'));
        currentResolve = null;
        currentReject = null;
      }
    }, 10000); // Reduced to 10 seconds

    // Add window focus listener to detect popup cancellation
    let focusHandler: (() => void) | null = null;
    let focusTimeout: ReturnType<typeof setTimeout> | null = null;

    const setupFocusHandler = () => {
      focusHandler = () => {
        // When window regains focus, wait a short time to see if we get a response
        if (focusTimeout) clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          if (currentReject) {
            currentReject(new Error('Google sign-in was cancelled'));
            currentResolve = null;
            currentReject = null;
            if (focusHandler) {
              window.removeEventListener('focus', focusHandler);
            }
          }
        }, 1000); // 1 second after focus returns
      };
      window.addEventListener('focus', focusHandler);
    };

    try {
      // Try using prompt first
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('Google prompt not displayed:', notification.getNotDisplayedReason?.());
          setupFocusHandler();
          showManualSignIn();
        } else if (notification.isSkippedMoment()) {
          console.log('Google prompt skipped:', notification.getSkippedReason?.());
          setupFocusHandler();
          showManualSignIn();
        }
      });
    } catch (error) {
      clearTimeout(timeout);
      console.error('Error triggering Google sign-in:', error);
      
      setupFocusHandler();
      showManualSignIn();
    }

    // Clear timeout and focus handler when promise resolves/rejects
    const originalResolve = currentResolve;
    const originalReject = currentReject;
    
    if (originalResolve) {
      currentResolve = (value) => {
        clearTimeout(timeout);
        if (focusTimeout) clearTimeout(focusTimeout);
        if (focusHandler) window.removeEventListener('focus', focusHandler);
        if (currentCleanup) {
          currentCleanup();
          currentCleanup = null;
        }
        originalResolve(value);
      };
    }
    
    if (originalReject) {
      currentReject = (reason) => {
        clearTimeout(timeout);
        if (focusTimeout) clearTimeout(focusTimeout);
        if (focusHandler) window.removeEventListener('focus', focusHandler);
        if (currentCleanup) {
          currentCleanup();
          currentCleanup = null;
        }
        originalReject(reason);
      };
    }
  });
};

/**
 * Show manual Google sign-in button as fallback
 */
const showManualSignIn = (): void => {
  if (!window.google?.accounts?.id) return;

  // Create a hidden container for the Google button to automatically trigger it
  const hiddenContainer = document.createElement('div');
  hiddenContainer.style.cssText = `
    position: fixed;
    top: -1000px;
    left: -1000px;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  `;
  
  document.body.appendChild(hiddenContainer);

  // Track if button was clicked to avoid multiple attempts
  let buttonClicked = false;

  // Render Google button and automatically click it
  try {
    window.google.accounts.id.renderButton(hiddenContainer, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      click_listener: () => {
        buttonClicked = true;
        // The callback will handle the response, cleanup container quickly
        setTimeout(() => {
          if (document.body.contains(hiddenContainer)) {
            document.body.removeChild(hiddenContainer);
          }
        }, 500);
      }
    });

    // Automatically click the Google button after a short delay
    const clickTimeout = setTimeout(() => {
      if (buttonClicked) return; // Avoid double clicking
      
      const googleButton = hiddenContainer.querySelector('[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
        buttonClicked = true;
      } else {
        // Fallback: trigger click on any button in the container
        const anyButton = hiddenContainer.querySelector('div[role="button"]') as HTMLElement;
        if (anyButton) {
          anyButton.click();
          buttonClicked = true;
        } else {
          // If we can't find the button, reject the promise quickly
          if (currentReject) {
            currentReject(new Error('Could not automatically trigger Google sign-in'));
            currentResolve = null;
            currentReject = null;
          }
          if (document.body.contains(hiddenContainer)) {
            document.body.removeChild(hiddenContainer);
          }
        }
      }
    }, 100);

    // Faster cleanup in case something goes wrong
    const cleanupTimeout = setTimeout(() => {
      if (document.body.contains(hiddenContainer)) {
        document.body.removeChild(hiddenContainer);
      }
      // If button wasn't clicked and no response received, reject faster
      if (!buttonClicked && currentReject) {
        currentReject(new Error('Google sign-in initialization failed'));
        currentResolve = null;
        currentReject = null;
      }
    }, 3000); // Reduced from 5 seconds to 3 seconds

    // Store timeouts for cleanup
    const cleanupTimeouts = () => {
      clearTimeout(clickTimeout);
      clearTimeout(cleanupTimeout);
    };

    // Store cleanup function globally so it can be called from main auth flow
    currentCleanup = cleanupTimeouts;

  } catch (error) {
    console.error('Error rendering Google button:', error);
    if (document.body.contains(hiddenContainer)) {
      document.body.removeChild(hiddenContainer);
    }
    if (currentReject) {
      currentReject(new Error('Failed to render Google sign-in button'));
      currentResolve = null;
      currentReject = null;
    }
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
    console.error('Error parsing Google JWT token:', error);
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
    document.addEventListener('DOMContentLoaded', () => {
      initializeGoogleAuth();
    });
  } else {
    // Small delay to ensure environment variables are loaded
    setTimeout(() => {
      initializeGoogleAuth();
    }, 100);
  }
}

export default {
  initializeGoogleAuth,
  signInWithGoogle,
  signOutFromGoogle,
  isGoogleAuthAvailable,
  getGoogleConfig,
};