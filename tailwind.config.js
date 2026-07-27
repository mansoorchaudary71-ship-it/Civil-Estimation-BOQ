/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-800)',
        },
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
          DEFAULT: 'var(--color-accent-500)',
        },
        secondary: {
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
          DEFAULT: 'var(--color-secondary-500)',
        },
        surface: {
          base: 'var(--color-bg-base)',
          default: 'var(--color-bg-surface)',
          hover: 'var(--color-bg-surface-hover)',
          active: 'var(--color-bg-surface-active)',
        },
        txt: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
        },
        ui: {
          success: 'var(--color-success-bg)',
          successText: 'var(--color-success-text)',
          successBorder: 'var(--color-success-border)',
          warning: 'var(--color-warning-bg)',
          warningText: 'var(--color-warning-text)',
          warningBorder: 'var(--color-warning-border)',
          error: 'var(--color-error-bg)',
          errorText: 'var(--color-error-text)',
          errorBorder: 'var(--color-error-border)',
          info: 'var(--color-info-bg)',
          infoText: 'var(--color-info-text)',
          infoBorder: 'var(--color-info-border)',
          borderSubtle: 'var(--color-border-subtle)',
          borderDefault: 'var(--color-border-default)',
          borderStrong: 'var(--color-border-strong)',
        }
      },

      fontSize: {
        'xs': ['var(--text-caption-size)', { lineHeight: 'var(--text-caption-lh)', letterSpacing: 'var(--text-caption-ls)' }],
        'sm': ['var(--text-body-sm-size)', { lineHeight: 'var(--text-body-sm-lh)', letterSpacing: 'var(--text-body-sm-ls)' }],
        'base': ['var(--text-body-size)', { lineHeight: 'var(--text-body-lh)', letterSpacing: 'var(--text-body-ls)' }],
        'lg': ['var(--text-body-lg-size)', { lineHeight: 'var(--text-body-lg-lh)', letterSpacing: 'var(--text-body-lg-ls)' }],
        'xl': ['var(--text-h6-size)', { lineHeight: 'var(--text-h6-lh)', letterSpacing: 'var(--text-h6-ls)' }],
        '2xl': ['var(--text-h5-size)', { lineHeight: 'var(--text-h5-lh)', letterSpacing: 'var(--text-h5-ls)' }],
        '3xl': ['var(--text-h4-size)', { lineHeight: 'var(--text-h4-lh)', letterSpacing: 'var(--text-h4-ls)' }],
        '4xl': ['var(--text-h3-size)', { lineHeight: 'var(--text-h3-lh)', letterSpacing: 'var(--text-h3-ls)' }],
        '5xl': ['var(--text-h2-size)', { lineHeight: 'var(--text-h2-lh)', letterSpacing: 'var(--text-h2-ls)' }],
        '6xl': ['var(--text-h1-size)', { lineHeight: 'var(--text-h1-lh)', letterSpacing: 'var(--text-h1-ls)' }],
        '7xl': ['var(--text-display-lg-size)', { lineHeight: 'var(--text-display-lg-lh)', letterSpacing: 'var(--text-display-lg-ls)' }],
        '8xl': ['var(--text-display-xl-size)', { lineHeight: 'var(--text-display-xl-lh)', letterSpacing: 'var(--text-display-xl-ls)' }],
        '9xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        ripple: {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(4)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-lg': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },

      
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        ripple: 'ripple 0.6s linear',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.4s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.4s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.4s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        'float-lg': 'float-lg 4s ease-in-out infinite',
        'gradient-x': 'gradient-x 5s ease infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }

    },
  },
  plugins: [],
}
