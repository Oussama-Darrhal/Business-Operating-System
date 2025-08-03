import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../utils/AuthContext';

// Zod validation schemas for each step
const step1Schema = z.object({
  sme_name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name too long'),
  user_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Please enter a valid email address'),
});

const step2Schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const step3Schema = z.object({
  business_type: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Combined schema for final validation
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

const SignupPage = () => {
  const navigate = useNavigate();
  const { registerSme, registerWithGoogle, isAuthenticated, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Form setup with React Hook Form and Zod
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
  } = useForm({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      sme_name: '',
      user_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      business_type: '',
      phone: '',
      city: '',
      country: '',
    },
  });

  const watchedPassword = watch('password');

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: 'No password', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    if (password.length >= 12) score++;

    const levels = [
      { score: 0, text: 'No password', color: 'gray' },
      { score: 1, text: 'Very weak', color: 'red' },
      { score: 2, text: 'Weak', color: 'red' },
      { score: 3, text: 'Fair', color: 'orange' },
      { score: 4, text: 'Good', color: 'blue' },
      { score: 5, text: 'Strong', color: 'green' },
      { score: 6, text: 'Very strong', color: 'green' },
    ];

    return levels.find(level => level.score === score) || levels[0];
  };

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'No password', color: 'gray' });

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

  const stepVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -30,
      transition: { duration: 0.3, ease: "easeIn" }
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

  // Clear any existing auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(watchedPassword));
  }, [watchedPassword]);

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const validateStep = async (stepNumber) => {
    let fieldsToValidate = [];
    
    switch (stepNumber) {
      case 1:
        fieldsToValidate = ['sme_name', 'user_name', 'email'];
        break;
      case 2:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 3:
        fieldsToValidate = ['business_type', 'phone', 'city', 'country'];
        break;
      default:
        return true;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
    clearErrors();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      const result = await registerSme(data);

      console.log(result)
      
      if (result.success) {
        // Success is handled by the AuthContext
      } else {
        // Set server errors
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, message]) => {
            setError(field, { type: 'server', message });
          });
          
          // Navigate to appropriate step based on errors
          const errorFields = Object.keys(result.errors);
          if (errorFields.some(field => ['sme_name', 'user_name', 'email'].includes(field))) {
            setStep(1);
          } else if (errorFields.some(field => ['password', 'confirmPassword'].includes(field))) {
            setStep(2);
          } else {
            setStep(3);
          }
        }
        
        setError('root', { 
          type: 'server', 
          message: result.message || 'Registration failed. Please check your information and try again.' 
        });
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setError('root', { 
        type: 'server', 
        message: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(prev => !prev);
    }
  };

  const handleSocialSignup = async (provider) => {
    if (provider === 'google') {
      setIsSubmitting(true);
      clearErrors();
      
      try {
        const formData = getValues();
        const result = await registerWithGoogle({
          ...(formData.sme_name && { sme_name: formData.sme_name }),
          ...(formData.business_type && { business_type: formData.business_type }),
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.city && { city: formData.city }),
          ...(formData.country && { country: formData.country }),
        });
        
        if (result.success) {
          // Success is handled by the AuthContext and useEffect above
        } else {
          setError('root', { 
            type: 'server', 
            message: result.message || 'Google signup failed. Please try again.' 
          });
        }
      } catch (error) {
        console.error('Google signup error:', error);
        setError('root', { 
          type: 'server', 
          message: 'An unexpected error occurred with Google signup. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log(`Social signup with ${provider} - To be implemented`);
    }
  };

  const renderPasswordStrengthIndicator = () => {
    if (!watchedPassword) return null;

    const colorMap = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      gray: 'bg-gray-300'
    };

    const textColorMap = {
      red: 'text-red-600',
      orange: 'text-orange-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      gray: 'text-gray-600'
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="mt-4 p-4 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl border border-gray-200 relative overflow-hidden"
      >
        <div className="absolute inset-px bg-gradient-to-t from-transparent to-white/30 rounded-xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-700 font-medium">Password strength:</span>
            <motion.span 
              key={passwordStrength.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`font-semibold ${textColorMap[passwordStrength.color]}`}
            >
              {passwordStrength.text}
            </motion.span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden border border-gray-300">
            <motion.div 
              className={`h-2.5 rounded-full ${colorMap[passwordStrength.color]}`}
              initial={{ width: 0 }}
              animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStepIndicator = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex justify-center">
        <div className="flex space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <motion.div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  ${step >= stepNumber 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={step >= stepNumber ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {stepNumber}
              </motion.div>
              {stepNumber < 3 && (
                <motion.div 
                  className={`
                    w-16 h-1 ml-4 rounded-full
                    ${step > stepNumber ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gray-200'}
                  `}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: step > stepNumber ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ originX: 0 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-gray-600 font-medium">
          Step {step} of 3: <span className="text-purple-600">{
            step === 1 ? 'Business & Admin Info' :
            step === 2 ? 'Security Setup' :
            'Additional Details'
          }</span>
        </p>
      </motion.div>
    </motion.div>
  );

  const renderInput = (name, label, type = 'text', required = false, index = 0, placeholder = '') => (
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
          focusedField === name ? 'text-purple-700' : 'text-gray-800'
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>
      <motion.div className="relative group">
        <Controller
          name={name}
          control={control}
          rules={{ required: required ? `${label} is required` : false }}
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
              className={`w-full px-5 py-4 bg-white bg-opacity-50 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
                errors[name] 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50 shadow-lg' 
                  : focusedField === name
                    ? 'border-purple-500 focus:border-purple-600 ring-4 ring-purple-500/20 bg-white bg-opacity-75 shadow-md'
                    : field.value 
                      ? 'border-purple-300 hover:border-purple-400 bg-white bg-opacity-75 shadow-sm'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-white hover:bg-opacity-75 shadow-sm hover:shadow-md'
              } focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 text-gray-900 placeholder-gray-500 text-base font-medium`}
              placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              aria-invalid={errors[name] ? "true" : "false"}
              whileFocus={{ 
                scale: 1.002,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            />
          )}
        />
        
        {/* Glass inner highlight */}
        <motion.div 
          className="absolute inset-px rounded-2xl pointer-events-none"
          animate={{
            background: focusedField === name 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : getValues(name)
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)'
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Success indicator */}
        <AnimatePresence>
          {getValues(name) && !errors[name] && required && (
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

  const renderPasswordInput = (name, label, showPassword, toggleFunction, index = 0) => (
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
          focusedField === name ? 'text-purple-700' : 'text-gray-800'
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
      >
        {label} <span className="text-red-500">*</span>
      </motion.label>
      <motion.div className="relative group">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <motion.input
              {...field}
              id={name}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              onFocus={() => handleFocus(name)}
              onBlur={() => {
                handleBlur();
                field.onBlur();
              }}
              disabled={isSubmitting}
              className={`w-full px-5 py-4 pr-16 bg-white bg-opacity-50 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
                errors[name] 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50 shadow-lg' 
                  : focusedField === name
                    ? 'border-purple-500 focus:border-purple-600 ring-4 ring-purple-500/20 bg-white bg-opacity-75 shadow-md'
                    : field.value 
                      ? 'border-purple-300 hover:border-purple-400 bg-white bg-opacity-75 shadow-sm'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-white hover:bg-opacity-75 shadow-sm hover:shadow-md'
              } focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 text-gray-900 placeholder-gray-500 text-base font-medium`}
              placeholder={`Enter your ${label.toLowerCase()}`}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              aria-invalid={errors[name] ? "true" : "false"}
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
            focusedField === name 
              ? 'bg-white bg-opacity-75 backdrop-blur-md border border-purple-300 shadow-sm' 
              : 'bg-white bg-opacity-50 backdrop-blur-sm border border-gray-300 hover:bg-white hover:bg-opacity-75 hover:border-gray-400 shadow-sm'
          }`}
          onClick={toggleFunction}
          disabled={isSubmitting}
          aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
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
          {getValues(name) && !errors[name] && (
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

  const renderSelect = (name, label, options, required = false, index = 0) => (
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
          focusedField === name ? 'text-purple-700' : 'text-gray-800'
        }`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>
      <motion.div className="relative group">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <motion.select
              {...field}
              id={name}
              onFocus={() => handleFocus(name)}
              onBlur={() => {
                handleBlur();
                field.onBlur();
              }}
              disabled={isSubmitting}
              className={`w-full px-5 py-4 bg-white bg-opacity-50 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ease-out ${
                errors[name] 
                  ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50 shadow-lg' 
                  : focusedField === name
                    ? 'border-purple-500 focus:border-purple-600 ring-4 ring-purple-500/20 bg-white bg-opacity-75 shadow-md'
                    : field.value 
                      ? 'border-purple-300 hover:border-purple-400 bg-white bg-opacity-75 shadow-sm'
                      : 'border-gray-300 hover:border-gray-100 hover:bg-white hover:bg-opacity-75 shadow-sm hover:shadow-md'
              } focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 text-gray-900 text-base font-medium appearance-none cursor-pointer`}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              aria-invalid={errors[name] ? "true" : "false"}
              whileFocus={{ 
                scale: 1.002,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
            >
              <option value="">{`Select ${label.toLowerCase()}`}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </motion.select>
          )}
        />
        
        {/* Custom dropdown arrow */}
        <motion.div 
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          animate={{ 
            rotate: focusedField === name ? 180 : 0,
            color: focusedField === name ? '#8b5cf6' : '#6b7280'
          }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
        
        {/* Glass inner highlight */}
        <motion.div 
          className="absolute inset-px rounded-2xl pointer-events-none"
          animate={{
            background: focusedField === name 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : getValues(name)
                ? 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)'
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Success indicator */}
        <AnimatePresence>
          {getValues(name) && !errors[name] && required && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-12 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
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

  const businessTypeOptions = [
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'service', label: 'Service Provider' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'finance', label: 'Finance' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'construction', label: 'Construction' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'non_profit', label: 'Non-Profit' },
    { value: 'other', label: 'Other' }
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'SE', label: 'Sweden' },
    { value: 'NO', label: 'Norway' },
    { value: 'DK', label: 'Denmark' },
    { value: 'FI', label: 'Finland' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'AT', label: 'Austria' },
    { value: 'BE', label: 'Belgium' },
    { value: 'IE', label: 'Ireland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'GR', label: 'Greece' },
    { value: 'PL', label: 'Poland' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'HU', label: 'Hungary' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'SI', label: 'Slovenia' },
    { value: 'HR', label: 'Croatia' },
    { value: 'RO', label: 'Romania' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'LT', label: 'Lithuania' },
    { value: 'LV', label: 'Latvia' },
    { value: 'EE', label: 'Estonia' },
    { value: 'MT', label: 'Malta' },
    { value: 'CY', label: 'Cyprus' },
    { value: 'LU', label: 'Luxembourg' },
    { value: 'IS', label: 'Iceland' },
    { value: 'LI', label: 'Liechtenstein' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'South Korea' },
    { value: 'CN', label: 'China' },
    { value: 'IN', label: 'India' },
    { value: 'SG', label: 'Singapore' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'TW', label: 'Taiwan' },
    { value: 'MY', label: 'Malaysia' },
    { value: 'TH', label: 'Thailand' },
    { value: 'PH', label: 'Philippines' },
    { value: 'ID', label: 'Indonesia' },
    { value: 'VN', label: 'Vietnam' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
    { value: 'CO', label: 'Colombia' },
    { value: 'PE', label: 'Peru' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'BO', label: 'Bolivia' },
    { value: 'PY', label: 'Paraguay' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'EG', label: 'Egypt' },
    { value: 'MA', label: 'Morocco' },
    { value: 'KE', label: 'Kenya' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'GH', label: 'Ghana' },
    { value: 'TN', label: 'Tunisia' },
    { value: 'DZ', label: 'Algeria' },
    { value: 'IL', label: 'Israel' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'TR', label: 'Turkey' },
    { value: 'RU', label: 'Russia' },
    { value: 'UA', label: 'Ukraine' },
    { value: 'NZ', label: 'New Zealand' }
  ];

  const renderSocialButtons = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gradient-to-r from-purple-50 to-blue-50 text-gray-600 font-medium rounded-full">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleSocialSignup('google')}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-2xl bg-white bg-opacity-70 backdrop-blur-md text-gray-700 font-semibold hover:bg-white hover:bg-opacity-90 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <motion.div
            animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0, ease: "linear" }}
            className="mr-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
          </motion.div>
          Continue with Google
        </motion.button>
      </div>
    </motion.div>
  );

  const renderStep1 = () => (
    <motion.div
      key="step1"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Create Your Business Account
        </h2>
        <p className="text-gray-600 text-lg">
          Let's start with your business and admin information
        </p>
      </motion.div>

      <div className="space-y-6">
        {renderInput('sme_name', 'Business Name', 'text', true, 0, 'e.g., Acme Restaurant')}
        {renderInput('user_name', 'Your Full Name', 'text', true, 1, 'e.g., John Smith')}
        {renderInput('email', 'Email Address', 'email', true, 2, 'e.g., john@acmerestaurant.com')}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end mt-8"
      >
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center">
            Next Step
            <motion.svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </span>
        </motion.button>
      </motion.div>

      {renderSocialButtons()}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Secure Your Account
        </h2>
        <p className="text-gray-600 text-lg">
          Create a strong password to protect your business data
        </p>
      </motion.div>

      <div className="space-y-6">
        {renderPasswordInput('password', 'Password', showPassword, () => togglePasswordVisibility('password'), 0)}
        {renderPasswordStrengthIndicator()}
        {renderPasswordInput('confirmPassword', 'Confirm Password', showConfirmPassword, () => togglePasswordVisibility('confirmPassword'), 1)}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-between mt-8"
      >
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={handlePrevious}
          disabled={isSubmitting}
          className="px-8 py-4 bg-white bg-opacity-70 backdrop-blur-md border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-white hover:bg-opacity-90 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <span className="flex items-center">
            <motion.svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </motion.svg>
            Previous
          </span>
        </motion.button>
        
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center">
            Next Step
            <motion.svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Additional Information
        </h2>
        <p className="text-gray-600 text-lg">
          Help us personalize your experience (optional)
        </p>
      </motion.div>

      <div className="space-y-6">
        {renderSelect('business_type', 'Business Type', businessTypeOptions, false, 0)}
        {renderInput('phone', 'Phone Number', 'tel', false, 1, 'e.g., +1 (555) 123-4567')}
        {renderInput('city', 'City', 'text', false, 2, 'e.g., New York')}
        {renderSelect('country', 'Country', countryOptions, false, 3)}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-between mt-8"
      >
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          onClick={handlePrevious}
          disabled={isSubmitting}
          className="px-8 py-4 bg-white bg-opacity-70 backdrop-blur-md border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-white hover:bg-opacity-90 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <span className="flex items-center">
            <motion.svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </motion.svg>
            Previous
          </span>
        </motion.button>
        
        <motion.button
          type="submit"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          disabled={isSubmitting}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-w-[140px]"
        >
          <span className="flex items-center justify-center">
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <motion.svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-50"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto relative z-10"
      >
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="bg-white bg-opacity-60 backdrop-blur-lg shadow-xl rounded-3xl p-8 border border-white border-opacity-20 relative overflow-hidden"
        >
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Logo or branding area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </motion.div>
            </motion.div>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </AnimatePresence>

              {/* Global error message */}
              <AnimatePresence>
                {errors.root && (
                  <motion.div 
                    key="global-error"
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      height: 'auto',
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -20, 
                      height: 0,
                      transition: { duration: 0.3, ease: "easeIn" }
                    }}
                    className="bg-red-50 bg-opacity-70 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-px bg-gradient-to-t from-transparent to-white/20 rounded-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-center space-x-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800 mb-1">Registration Error</p>
                        <p className="text-sm text-red-700">{errors.root?.message}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Sign in link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200 underline decoration-purple-300 hover:decoration-purple-500"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>

            {/* Terms and privacy notice */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-gray-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                  Privacy Policy
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;