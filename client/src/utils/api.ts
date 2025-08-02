// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';


// Token management utilities
export const tokenManager = {
  get: () => localStorage.getItem('auth-token'),
  set: (token) => localStorage.setItem('auth-token', token),
  remove: () => localStorage.removeItem('auth-token'),
  isExpired: (token) => {
    if (!token) return true;
    try {
      // Basic JWT expiry check (if you're using JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      // If token parsing fails, consider it expired
      return false; // For Sanctum tokens, we'll rely on backend validation
    }
  }
};

// Standardized API response structure
const createResponse = (success, data = null, message = '', errors = null) => ({
  success,
  data,
  message,
  errors,
  timestamp: new Date().toISOString()
});

// Error handler that creates consistent error responses
const handleApiError = (error, response = null) => {
  console.error('API Error:', error);
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createResponse(false, null, 'Network error. Please check your connection and try again.');
  }
  
  // Handle different HTTP status codes
  if (response) {
    switch (response.status) {
      case 400:
        return createResponse(false, null, 'Bad request. Please check your input.');
      case 401:
        return createResponse(false, null, 'Authentication failed. Please log in again.');
      case 403:
        return createResponse(false, null, 'Access denied. You don\'t have permission to perform this action.');
      case 404:
        return createResponse(false, null, 'Resource not found.');
      case 422:
        return createResponse(false, null, 'Validation failed. Please check your input.');
      case 429:
        return createResponse(false, null, 'Too many requests. Please try again later.');
      case 500:
        return createResponse(false, null, 'Server error. Please try again later.');
      default:
        return createResponse(false, null, `Request failed with status ${response.status}.`);
    }
  }
  
  return createResponse(false, null, error.message || 'An unexpected error occurred.');
};

/**
 * Enhanced API call function with better error handling and token management
 * @param {string} endpoint - The API endpoint (e.g., '/api/login')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @param {boolean} requiresAuth - Whether this endpoint requires authentication
 * @returns {Promise<object>} - Standardized response object
 */
export const apiCall = async (endpoint, options = {}, requiresAuth = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps Laravel identify AJAX requests
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = tokenManager.get();
    if (!token) {
      return createResponse(false, null, 'Authentication required. Please log in.');
    }
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned non-JSON response: ${response.statusText}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 (Unauthorized) - remove invalid token
      if (response.status === 401) {
        tokenManager.remove();
      }
      
      // Return the server's error response if it follows our standard structure
      if (data.success === false) {
        return data;
      }
      
      // Create standardized error response for non-standard server responses
      return createResponse(
        false, 
        null, 
        data.message || `Request failed with status ${response.status}`,
        data.errors || null
      );
    }

    // Ensure response has our standard structure
    if (typeof data.success === 'undefined') {
      return createResponse(true, data, 'Request completed successfully.');
    }

    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Convenient wrapper for authenticated API calls
 */
export const authenticatedApiCall = (endpoint, options = {}) => {
  return apiCall(endpoint, options, true);
};

/**
 * Upload file with progress tracking
 */
export const uploadFile = async (endpoint, file, onProgress = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.get();
  
  const formData = new FormData();
  formData.append('file', file);

  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        tokenManager.remove();
      }
      return createResponse(false, null, data.message || 'Upload failed', data.errors);
    }

    return data;
  } catch (error) {
    return handleApiError(error);
  }
}; 