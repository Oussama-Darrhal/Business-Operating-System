import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/utils/AuthContext';


interface LocationState {
  from?: {
    pathname: string;
  };
}

// Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

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
    visible: (i: number) => ({
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
  const redirectPath = (location.state as LocationState)?.from?.pathname || '/dashboard';

  // Clear any existing auth errors when component mounts
  useEffect(() => {
    clearError();
    setAuthError('');
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError('');

    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Success is handled by the AuthContext and useEffect above
        console.log('Login successful');
      } else {
        setAuthError(result.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    if (provider === 'google') {
      setIsSubmitting(true);
      setAuthError('');
      
      try {
        const result = await loginWithGoogle();
        
        if (result.success) {
          console.log('Google login successful');
        } else {
          setAuthError(result.message || 'Google login failed. Please try again.');
        }
      } catch (error) {
        console.error('Google login error:', error);
        setAuthError('An unexpected error occurred with Google login. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log(`Social login with ${provider} - To be implemented`);
    }
  };

  const renderInput = (
    name: keyof Pick<LoginFormData, 'email'>,
    label: string,
    type: string = 'text',
    index: number = 0,
    additionalProps?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
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
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <motion.input
              {...field}
              id={name}
              type={type}
              onFocus={() => handleFocus(name)}
              onBlur={() => {
                handleBlur();
                field.onBlur();
              }}
              disabled={isSubmitting}
              className={`w-full px-5 py-4 bg-white/20 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
                errors[name] 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/20 shadow-lg' 
                  : focusedField === name
                    ? 'border-purple-500 focus:border-purple-600 ring-4 ring-purple-500/20 bg-white/30 shadow-md'
                    : watchedValues[name] 
                      ? 'border-purple-300 hover:border-purple-400 bg-white/25 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white/25 shadow-sm hover:shadow-md'
              } focus:outline-none disabled:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 text-gray-900 placeholder-gray-500 text-base font-medium`}
              placeholder={`Enter your ${label.toLowerCase()}`}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              aria-invalid={errors[name] ? "true" : "false"}
              whileFocus={{ 
                scale: 1.002,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              {...additionalProps}
            />
          )}
        />
        
        {/* Glass inner highlight */}
        <motion.div 
          className="absolute inset-px rounded-2xl pointer-events-none"
          animate={{
            background: focusedField === name 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : watchedValues[name]
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)'
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Success indicator */}
        <AnimatePresence>
          {watchedValues[name] && !errors[name] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm border border-green-400/20">
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
            className="flex items-center space-x-2 text-red-600 px-3 mt-3"
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
            <span className="text-sm font-medium">{errors[name]?.message}</span>
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
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <motion.input
              {...field}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              onFocus={() => handleFocus('password')}
              onBlur={() => {
                handleBlur();
                field.onBlur();
              }}
              disabled={isSubmitting}
              className={`w-full px-5 py-4 pr-16 bg-white/20 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
                errors.password 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/20 shadow-lg' 
                  : focusedField === 'password'
                    ? 'border-purple-500 focus:border-purple-600 ring-4 ring-purple-500/20 bg-white/30 shadow-md'
                    : watchedValues.password 
                      ? 'border-purple-300 hover:border-purple-400 bg-white/25 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white/25 shadow-sm hover:shadow-md'
              } focus:outline-none disabled:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 text-gray-900 placeholder-gray-500 text-base font-medium`}
              placeholder="Enter your password"
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={errors.password ? "true" : "false"}
              whileFocus={{ 
                scale: 1.002,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            />
          )}
        />

        {/* Password toggle button */}
        <motion.button
          type="button"
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 p-2 rounded-xl transition-all duration-200 z-20 flex items-center justify-center ${
            focusedField === 'password' 
              ? 'bg-white/30 backdrop-blur-md border border-purple-300 shadow-sm' 
              : 'bg-white/20 backdrop-blur-sm border border-gray-200 hover:bg-white/30 hover:border-gray-300 shadow-sm'
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
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.div>
        </motion.button>
        
        {/* Success indicator */}
        <AnimatePresence>
          {watchedValues.password && !errors.password && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm border border-green-400/20">
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
            className="flex items-center space-x-2 text-red-600 px-3 mt-3"
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
            <span className="text-sm font-medium">{errors.password?.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-purple-50 to-blue-100">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-purple-600/20 rounded-full"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-purple-300/30 rounded-full"
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
        
        {/* Glass Overlay Layers */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" />
      </div>

      <motion.div 
        className="max-w-md w-full relative z-10 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Glass Card */}
        <motion.div 
          className="bg-white/25 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-10 space-y-10 relative overflow-hidden"
          variants={cardVariants}
          whileHover="hover"
        >
          {/* Glass Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none" />
          <div className="absolute inset-px bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div 
                className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-purple-500/20 backdrop-blur-lg border border-purple-300/30 shadow-lg mb-8 relative overflow-hidden"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                <svg 
                  className="h-8 w-8 text-purple-700 relative z-10" 
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
                className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Welcome back
              </motion.h2>
              <motion.p 
                className="text-gray-700 text-sm mb-4 font-medium"
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
                {(['google', 'apple', 'facebook'] as const).map((provider, index) => (
                  <motion.button
                    key={provider}
                    type="button"
                    onClick={() => handleSocialLogin(provider)}
                    className={`group relative flex items-center justify-center px-4 py-4 backdrop-blur-md border rounded-md transition-all duration-200 overflow-hidden ${
                      provider === 'google' ? 'hover:bg-purple-500/10 hover:border-purple-500/30' :
                      provider === 'apple' ? 'hover:bg-gray-500/10 hover:border-gray-500/30' :
                      'hover:bg-blue-500/10 hover:border-blue-500/30'
                    }`}
                    disabled={isSubmitting}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    custom={index}
                  >
                    <div className="absolute inset-0 border-none rounded-md" />
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
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      )}
                      {provider === 'facebook' && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Divider */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white/30 backdrop-blur-md px-4 py-2 text-gray-600 font-medium rounded-xl border border-white/30">
                    Or continue with email
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
              {/* Email Input */}
              {renderInput('email', 'Email', 'email', 0, {
                autoComplete: 'email',
                'aria-required': 'true'
              })}

              {/* Password Input */}
              {renderPasswordInput()}

              {/* Remember Me & Forgot Password */}
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <motion.label 
                      className="flex items-center group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.input
                        {...field}
                        type="checkbox"
                        className="sr-only"
                        disabled={isSubmitting}
                      />
                      <motion.div 
                        className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                          field.value 
                            ? 'bg-purple-500 border-purple-500 shadow-md' 
                            : 'bg-white/30 border-gray-300 backdrop-blur-md hover:border-purple-400 hover:bg-white/40'
                        }`}
                        animate={{ 
                          backgroundColor: field.value ? '#8b5cf6' : 'rgba(255,255,255,0.3)',
                          borderColor: field.value ? '#8b5cf6' : '#d1d5db'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <AnimatePresence>
                          {field.value && (
                            <motion.svg
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors duration-200">
                        Remember me
                      </span>
                    </motion.label>
                  )}
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200 relative group"
                  >
                    Forgot password?
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Auth Error Display */}
              <AnimatePresence>
                {authError && (
                  <motion.div
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
                    className="bg-red-50/80 backdrop-blur-md border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{authError}</p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => setAuthError('')}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.button
                  type="submit"
                  className={`w-full relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg ${
                    isValid && !isSubmitting
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-gray-300/50 text-gray-500 cursor-not-allowed shadow-gray-200/25'
                  } disabled:opacity-60`}
                  disabled={!isValid || isSubmitting}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={isValid && !isSubmitting ? "hover" : "idle"}
                  whileTap={isValid && !isSubmitting ? "tap" : "idle"}
                >
                  {/* Button Background Effects */}
                  <div className="absolute inset-0 rounded-2xl" />
                  
                  {/* Loading Spinner */}
                  <AnimatePresence>
                    {isSubmitting && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <motion.div
                          className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Button Text */}
                  <motion.span
                    className="relative z-10 flex items-center justify-center space-x-2"
                    animate={{ opacity: isSubmitting ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>Sign in</span>
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: isValid && !isSubmitting ? [0, 4, 0] : 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                  </motion.span>
                </motion.button>
              </motion.div>
            </form>

            {/* Sign Up Link */}
            <motion.div 
              className="text-center pt-6 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    to="/signup"
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200 relative group"
                  >
                    Sign up
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.span>
              </p>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full pointer-events-none"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0] 
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full pointer-events-none"
            animate={{ 
              scale: [1.1, 1, 1.1],
              rotate: [0, -90, 0] 
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-purple-600 hover:text-purple-700 transition-colors duration-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-purple-600 hover:text-purple-700 transition-colors duration-200">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;