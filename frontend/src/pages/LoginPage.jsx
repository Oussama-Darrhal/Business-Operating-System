import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { validateForm, loginValidationRules } from '../utils/validation';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.645, 0.045, 0.355, 1.000]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -2,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { scale: 0.98 }
  };

  // Get redirect path from location state or default to dashboard
  const redirectPath = location.state?.from?.pathname || '/dashboard';

  // Clear any existing auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error when user modifies form
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData, loginValidationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Success is handled by the AuthContext and useEffect above
      } else {
        setErrors({ 
          general: result.message || 'Login failed. Please check your credentials and try again.' 
        });
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'google') {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        const result = await loginWithGoogle();
        
        if (result.success) {
          // Success is handled by the AuthContext and useEffect above
        } else {
          setErrors({ 
            general: result.message || 'Google login failed. Please try again.' 
          });
        }
      } catch (error) {
        console.error('Google login error:', error);
        setErrors({ 
          general: 'An unexpected error occurred with Google login. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log(`Social login with ${provider} - To be implemented`);
    }
  };

  const renderInput = (name, label, type = 'text', index = 0, ...props) => (
    <motion.div 
      custom={index}
      variants={inputVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <motion.label 
        htmlFor={name} 
        className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          focusedField === name ? 'text-primary-700' : 'text-secondary-800'
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
      >
        {label}
      </motion.label>
      <motion.div className="relative group">
        <motion.input
          id={name}
          name={name}
          type={type}
          required
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className={`w-full px-5 py-4 bg-glass-white-light backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
            errors[name] 
              ? 'border-error-400 focus:border-error-500 focus:ring-4 focus:ring-error-500/20 bg-glass-error shadow-lg' 
              : focusedField === name
                ? 'border-primary-500 focus:border-primary-600 ring-4 ring-primary-500/20 bg-glass-white-medium shadow-glass-medium'
                : formData[name] 
                  ? 'border-glass-primary hover:border-primary-400 bg-glass-white-medium shadow-glass-soft'
                  : 'border-glass-light hover:border-glass-medium hover:bg-glass-white-medium shadow-glass-soft hover:shadow-glass-medium'
          } focus:outline-none disabled:bg-glass-white-ultra disabled:cursor-not-allowed disabled:opacity-60 text-secondary-900 placeholder-secondary-500 text-base font-medium`}
          placeholder={`Enter your ${label.toLowerCase()}`}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          aria-invalid={errors[name] ? "true" : "false"}
          whileFocus={{ 
            scale: 1.002,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          {...props}
        />
        
        {/* Glass inner highlight - enhanced based on state */}
        <motion.div 
          className="absolute inset-px rounded-2xl pointer-events-none"
          animate={{
            background: focusedField === name 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : formData[name]
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)'
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Enhanced focus indicator */}
        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={false}
          animate={{
            boxShadow: focusedField === name 
              ? '0 0 0 1px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)' 
              : '0 0 0 0px rgba(168, 85, 247, 0), 0 0 0px rgba(168, 85, 247, 0)'
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Success indicator */}
        <AnimatePresence>
          {formData[name] && !errors[name] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-glass-soft border border-success-400/20">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {errors[name] && (
          <motion.div 
            key={`${name}-error`}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: 'auto',
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0, 
              y: -10, 
              height: 0,
              transition: { duration: 0.2, ease: "easeIn" }
            }}
            className="flex items-center space-x-2 text-error-600 px-3 mt-3"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <span className="text-sm font-medium">{errors[name]}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderPasswordInput = () => (
    <motion.div 
      custom={1}
      variants={inputVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <motion.label 
        htmlFor="password" 
        className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          focusedField === 'password' ? 'text-primary-700' : 'text-secondary-800'
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        Password
      </motion.label>
      <motion.div className="relative group">
        <motion.input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
          onFocus={() => handleFocus('password')}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className={`w-full px-5 py-4 pr-16 bg-glass-white-light backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
            errors.password 
              ? 'border-error-400 focus:border-error-500 focus:ring-4 focus:ring-error-500/20 bg-glass-error shadow-lg' 
              : focusedField === 'password'
                ? 'border-primary-500 focus:border-primary-600 ring-4 ring-primary-500/20 bg-glass-white-medium shadow-glass-medium'
                : formData.password 
                  ? 'border-glass-primary hover:border-primary-400 bg-glass-white-medium shadow-glass-soft'
                  : 'border-glass-light hover:border-glass-medium hover:bg-glass-white-medium shadow-glass-soft hover:shadow-glass-medium'
          } focus:outline-none disabled:bg-glass-white-ultra disabled:cursor-not-allowed disabled:opacity-60 text-secondary-900 placeholder-secondary-500 text-base font-medium`}
          placeholder="Enter your password"
          aria-describedby={errors.password ? "password-error" : undefined}
          aria-invalid={errors.password ? "true" : "false"}
          whileFocus={{ 
            scale: 1.002,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
        />

        {/* Glass inner highlight - enhanced based on state */}
        <motion.div 
          className="absolute inset-px rounded-2xl pointer-events-none"
          animate={{
            background: focusedField === 'password' 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : formData.password
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)'
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Password toggle button - enhanced styling */}
        <motion.button
          type="button"
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 p-2 rounded-xl transition-all duration-200 z-20 flex items-center justify-center ${
            focusedField === 'password' 
              ? 'bg-glass-white-medium backdrop-blur-md border border-glass-primary shadow-glass-soft' 
              : 'bg-glass-white-light backdrop-blur-sm border border-glass-light hover:bg-glass-white-medium hover:border-glass-medium shadow-glass-soft'
          }`}
          onClick={togglePasswordVisibility}
          disabled={isSubmitting}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <motion.div
            animate={{ rotateY: showPassword ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-5 h-5 flex items-center justify-center"
          >
            {showPassword ? (
              <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.div>
        </motion.button>
        
        {/* Enhanced focus indicator */}
        <motion.div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={false}
          animate={{
            boxShadow: focusedField === 'password' 
              ? '0 0 0 1px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)' 
              : '0 0 0 0px rgba(168, 85, 247, 0), 0 0 0px rgba(168, 85, 247, 0)'
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Success indicator */}
        <AnimatePresence>
          {formData.password && !errors.password && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-glass-soft border border-success-400/20">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence>
        {errors.password && (
          <motion.div 
            key="password-error"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              height: 'auto',
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0, 
              y: -10, 
              height: 0,
              transition: { duration: 0.2, ease: "easeIn" }
            }}
            className="flex items-center space-x-2 text-error-600 px-3 mt-3"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <span className="text-sm font-medium">{errors.password}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-primary-600/20 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary-400/20 to-primary-300/30 rounded-full"
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-primary-200/40 to-secondary-200/30 rounded-full"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 90, 180],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Glass Overlay Layers */}
        <div className="absolute inset-0 bg-glass-white-ultra backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-glass-white-light via-transparent to-glass-white-ultra" />
      </div>

      {/* Floating Glass Panels for Depth */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-glass-white-light backdrop-blur-lg rounded-3xl border border-glass-light shadow-glass-soft"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-16 w-24 h-24 bg-glass-primary-light backdrop-blur-md rounded-2xl border border-glass-primary shadow-glass-soft"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-10 w-16 h-16 bg-glass-secondary-light backdrop-blur-sm rounded-xl border border-glass-light shadow-glass-soft"
          animate={{ 
            y: [0, -10, 0],
            x: [0, 5, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="max-w-md w-full relative z-10 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Glass Card */}
        <motion.div 
          className="bg-glass-white-medium backdrop-blur-xl border border-glass-medium rounded-3xl shadow-glass-strong p-10 space-y-10 relative overflow-hidden"
          variants={cardVariants}
          whileHover="hover"
        >
          {/* Glass Inner Glow Effect */}
          <div className="absolute inset-0 bg-glass-gradient-light rounded-3xl pointer-events-none" />
          <div className="absolute inset-px bg-gradient-to-br from-glass-white-light/50 via-transparent to-transparent rounded-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div 
                className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-glass-primary-medium backdrop-blur-lg border border-glass-primary shadow-glass-medium mb-8 relative overflow-hidden"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Icon Inner Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-glass-white-light/30 to-transparent rounded-2xl" />
                <svg 
                  className="h-8 w-8 text-primary-700 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold text-secondary-900 mb-3 bg-gradient-to-r from-secondary-900 to-primary-700 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Welcome back
              </motion.h2>
              <motion.p 
                className="text-secondary-700 text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Please enter your details to sign in
              </motion.p>
            </motion.div>

            {/* Glass Social Login Buttons */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-3 gap-4">
                {['google', 'apple', 'facebook'].map((provider, index) => (
                  <motion.button
                    key={provider}
                    type="button"
                    onClick={() => handleSocialLogin(provider)}
                    className={`group relative flex items-center justify-center px-4 py-4 bg-glass-white-light backdrop-blur-md border border-glass-light rounded-xl transition-all duration-200 overflow-hidden ${
                      provider === 'google' ? 'hover:bg-glass-primary-light hover:border-glass-primary' :
                      provider === 'apple' ? 'hover:bg-glass-secondary-light hover:border-glass-medium' :
                      'hover:bg-blue-500/10 hover:border-blue-500/30'
                    }`}
                    disabled={isSubmitting}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    custom={index}
                  >
                    {/* Button Inner Glass Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-glass-white-light/40 via-transparent to-transparent rounded-xl" />
                    <div className="relative z-10">
                      {provider === 'google' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {provider === 'apple' && (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      )}
                      {provider === 'facebook' && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-glass-medium to-transparent"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-6 py-2 bg-glass-white-medium backdrop-blur-sm text-secondary-600 font-medium rounded-full border border-glass-light">or</span>
                </div>
              </div>
            </motion.div>
            
            {/* Login Form */}
            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20, x: 0 }}
                    animate={{ opacity: 1, y: 0, x: [-10, 10, -10, 10, 0] }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      opacity: { duration: 0.3 },
                      y: { duration: 0.3 },
                      x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                    }}
                    className="rounded-xl bg-glass-error backdrop-blur-md p-5 border border-error-300/30 relative overflow-hidden" 
                    role="alert"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-error-50/50 to-transparent rounded-xl" />
                    <div className="relative z-10 flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-error-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-error-700 font-medium">
                          {errors.general}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* Email Field */}
                {renderInput('email', 'Email address', 'email', 0, { autoComplete: 'email' })}
                
                {/* Password Field */}
                {renderPasswordInput()}
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div 
                className="flex items-center justify-between pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center group/check">
                  <motion.input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-glass-medium rounded transition-all duration-200 hover:border-primary-400 disabled:opacity-50 bg-glass-white-light backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-secondary-700 transition-colors duration-200 group-hover/check:text-secondary-900 cursor-pointer font-medium">
                    Remember for 30 days
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition-all duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              {/* Glass Submit Button */}
              <motion.div
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-4 px-6 text-sm font-semibold rounded-xl text-white bg-glass-gradient-primary backdrop-blur-lg border border-glass-primary hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-glass-focus disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glass-medium hover:shadow-glass-strong overflow-hidden"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {/* Button Inner Glass Effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-glass-white-light/20 via-transparent to-transparent rounded-xl" />
                  <div className="absolute inset-px bg-gradient-to-t from-transparent to-glass-white-light/10 rounded-xl" />
                  
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3 relative z-10">
                    {isSubmitting ? (
                      <motion.svg 
                        className="h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </motion.svg>
                    ) : (
                      <svg className="h-5 w-5 text-white/80 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    )}
                  </span>
                  <span className="relative z-10">
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </span>
                </motion.button>
              </motion.div>

              {/* Sign up link */}
              <motion.div 
                className="text-center pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-sm text-secondary-700">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition-all duration-200"
                  >
                    Create account
                  </Link>
                </span>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 