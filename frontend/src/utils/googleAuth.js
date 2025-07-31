/**
 * Google OAuth Integration Utility
 * Uses Google Identity Services for secure OAuth authentication
 */

// Configuration
const GOOGLE_CONFIG = {
  client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  scope: 'email profile',
  callback: 'handleGoogleCallback',
  auto_select: false,
  cancel_on_tap_outside: true,
};

// Initialize Google Identity Services
let googleInitialized = false;
let googleScript = null;

/**
 * Initialize Google Identity Services
 * @returns {Promise<boolean>} - True if initialized successfully
 */
export const initializeGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (googleInitialized) {
      resolve(true);
      return;
    }

    if (!GOOGLE_CONFIG.client_id) {
      console.error('Google OAuth: Missing REACT_APP_GOOGLE_CLIENT_ID environment variable');
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
        if (window.google && window.google.accounts) {
          // Initialize Google Identity Services
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CONFIG.client_id,
            callback: window.handleGoogleCallback || (() => {}),
            auto_select: false,
            cancel_on_tap_outside: true,
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
 * @returns {Promise<Object>} - Promise that resolves with user credentials or rejects with error
 */
export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (!googleInitialized || !window.google) {
      reject(new Error('Google OAuth not initialized. Please try again.'));
      return;
    }

    // Set up callback for this specific sign-in attempt
    window.handleGoogleCallback = (response) => {
      try {
        if (response.credential) {
          // Decode the JWT token to get user info
          const userInfo = parseJWT(response.credential);
          resolve({
            success: true,
            credential: response.credential,
            userInfo: userInfo,
          });
        } else {
          reject(new Error('No credential received from Google'));
        }
      } catch (error) {
        reject(new Error(`Failed to process Google response: ${error.message}`));
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
      reject(new Error(`Failed to trigger Google sign-in: ${error.message}`));
    }
  });
};

/**
 * Show Google One Tap sign-in as fallback
 */
const showGoogleOneTap = () => {
  if (window.google && window.google.accounts) {
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
      const googleButton = tempButton.querySelector('[role="button"]');
      if (googleButton) {
        googleButton.click();
      }
      document.body.removeChild(tempButton);
    }, 100);
  }
};

/**
 * Parse JWT token to extract user information
 * @param {string} token - JWT token from Google
 * @returns {Object} - Parsed user information
 */
const parseJWT = (token) => {
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
 * @returns {Promise<void>}
 */
export const signOutFromGoogle = async () => {
  try {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
      console.log('Signed out from Google');
    }
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Check if Google OAuth is available
 * @returns {boolean}
 */
export const isGoogleAuthAvailable = () => {
  return googleInitialized && window.google && window.google.accounts && !!GOOGLE_CONFIG.client_id;
};

/**
 * Get Google client configuration
 * @returns {Object}
 */
export const getGoogleConfig = () => {
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