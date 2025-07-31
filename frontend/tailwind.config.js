/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Glassmorphism colors
        glass: {
          'white-ultra': 'rgba(255, 255, 255, 0.05)',
          'white-light': 'rgba(255, 255, 255, 0.1)',
          'white-medium': 'rgba(255, 255, 255, 0.15)',
          'white-strong': 'rgba(255, 255, 255, 0.25)',
          'white-solid': 'rgba(255, 255, 255, 0.4)',
          'primary-light': 'rgba(168, 85, 247, 0.1)',
          'primary-medium': 'rgba(168, 85, 247, 0.15)',
          'primary-strong': 'rgba(168, 85, 247, 0.25)',
          'secondary-light': 'rgba(100, 116, 139, 0.1)',
          'secondary-medium': 'rgba(100, 116, 139, 0.15)',
          'secondary-dark': 'rgba(15, 23, 42, 0.1)',
          'success': 'rgba(34, 197, 94, 0.1)',
          'warning': 'rgba(245, 158, 11, 0.1)',
          'error': 'rgba(239, 68, 68, 0.1)',
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
        'glass-gradient-light': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'glass-gradient-medium': 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
        'glass-gradient-primary': 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        // Glassmorphism shadows
        'glass-soft': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-medium': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'glass-strong': '0 16px 48px rgba(0, 0, 0, 0.16)',
        'glass-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'glass-border': '0 0 0 1px rgba(255, 255, 255, 0.2)',
        'glass-focus': '0 0 0 4px rgba(168, 85, 247, 0.1)',
      },
      borderColor: {
        'glass-light': 'rgba(255, 255, 255, 0.2)',
        'glass-medium': 'rgba(255, 255, 255, 0.3)',
        'glass-strong': 'rgba(255, 255, 255, 0.5)',
        'glass-primary': 'rgba(168, 85, 247, 0.3)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
} 