// Validation utility functions for forms

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (typeof email !== 'string') return 'Email must be a string';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  
  if (email.length > 255) return 'Email is too long (maximum 255 characters)';
  
  return null;
};

/**
 * Password validation with strength checking
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSymbols = false
  } = options;

  if (!password) return 'Password is required';
  if (typeof password !== 'string') return 'Password must be a string';
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  
  if (password.length > 128) {
    return 'Password is too long (maximum 128 characters)';
  }
  
  const errors = [];
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('one number');
  }
  
  if (requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('one special character');
  }
  
  if (errors.length > 0) {
    return `Password must contain ${errors.join(', ')}`;
  }
  
  return null;
};

/**
 * Password confirmation validation
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

/**
 * Name validation (for user names, SME names, etc.)
 */
export const validateName = (name, fieldName = 'Name', options = {}) => {
  const { minLength = 2, maxLength = 255, required = true } = options;

  if (!name && required) return `${fieldName} is required`;
  if (!name && !required) return null;
  
  if (typeof name !== 'string') return `${fieldName} must be a string`;
  
  const trimmedName = name.trim();
  if (trimmedName.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  
  if (trimmedName.length > maxLength) {
    return `${fieldName} is too long (maximum ${maxLength} characters)`;
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
};

/**
 * Phone number validation
 */
export const validatePhone = (phone, required = false) => {
  if (!phone && !required) return null;
  if (!phone && required) return 'Phone number is required';
  
  if (typeof phone !== 'string') return 'Phone number must be a string';
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
  if (cleanPhone.length > 15) return 'Phone number is too long (maximum 15 digits)';
  
  return null;
};

/**
 * Business type validation
 */
export const validateBusinessType = (businessType, required = false) => {
  if (!businessType && !required) return null;
  if (!businessType && required) return 'Business type is required';
  
  if (typeof businessType !== 'string') return 'Business type must be a string';
  
  const trimmed = businessType.trim();
  if (trimmed.length > 100) return 'Business type is too long (maximum 100 characters)';
  
  // Allow letters, numbers, spaces, and common business punctuation
  if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(trimmed)) {
    return 'Business type contains invalid characters';
  }
  
  return null;
};

/**
 * Generic text field validation
 */
export const validateTextField = (value, fieldName, options = {}) => {
  const { 
    required = false, 
    minLength = 0, 
    maxLength = 255,
    pattern = null,
    patternMessage = 'Invalid format'
  } = options;

  if (!value && !required) return null;
  if (!value && required) return `${fieldName} is required`;
  
  if (typeof value !== 'string') return `${fieldName} must be a string`;
  
  const trimmed = value.trim();
  
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  
  if (trimmed.length > maxLength) {
    return `${fieldName} is too long (maximum ${maxLength} characters)`;
  }
  
  if (pattern && !pattern.test(trimmed)) {
    return patternMessage;
  }
  
  return null;
};

/**
 * Validate an entire form object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) {
        errors[fieldName] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validation rules for login form
 */
export const loginValidationRules = {
  email: [validateEmail],
  password: [(password) => !password ? 'Password is required' : null]
};

/**
 * Validation rules for signup form
 */
export const signupValidationRules = {
  sme_name: [(name) => validateName(name, 'SME name', { required: true })],
  user_name: [(name) => validateName(name, 'User name', { required: true })],
  email: [validateEmail],
  password: [validatePassword],
  confirmPassword: [(confirmPassword, formData) => 
    validatePasswordConfirmation(formData.password, confirmPassword)
  ],
  business_type: [(type) => validateBusinessType(type, false)],
  phone: [(phone) => validatePhone(phone, false)],
  city: [(city) => validateTextField(city, 'City', { required: false, maxLength: 100 })],
  country: [(country) => validateTextField(country, 'Country', { required: false, maxLength: 100 })]
};

/**
 * Real-time validation helper for individual fields
 */
export const validateField = (fieldName, value, formData = {}, validationRules = {}) => {
  const rules = validationRules[fieldName];
  if (!rules) return null;
  
  for (const rule of rules) {
    const error = rule(value, formData);
    if (error) return error;
  }
  
  return null;
};

/**
 * Password strength indicator
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: 'No password', color: 'gray' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    longEnough: password.length >= 12
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  if (score <= 2) return { score, text: 'Weak', color: 'red' };
  if (score <= 4) return { score, text: 'Fair', color: 'orange' };
  if (score <= 5) return { score, text: 'Good', color: 'blue' };
  return { score, text: 'Strong', color: 'green' };
}; 