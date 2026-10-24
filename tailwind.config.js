import plugin from 'tailwindcss/plugin';

/**
 * Colour helper: tokens are stored as RGB channels in src/styles/tokens.css so
 * opacity modifiers (`bg-surface-default/80`) work. Before this change the
 * variables were never defined, so ~190 files rendered transparent surfaces.
 */
const c = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;
const scale = (name) =>
  Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [n, c(`${name}-${n}`)]));

/** Brand blue, used to unify the legacy `indigo-*` and `blue-*` utilities (1,000+ usages). */
const brandBlue = scale('primary');

/**
 * Minimal, dependency-free replacement for `tailwindcss-animate`.
 * ~230 usages of `animate-in fade-in zoom-in-95 slide-in-from-bottom-4` existed
 * but the plugin was never installed, so none of those animations ran.
 */
const enterExitPlugin = plugin(({ addUtilities, matchUtilities, theme }) => {
  addUtilities({
    '@keyframes enter': {
      from: {
        opacity: 'var(--tw-enter-opacity, 1)',
        transform:
          'translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))',
      },
    },
    '@keyframes exit': {
      to: {
        opacity: 'var(--tw-exit-opacity, 1)',
        transform:
          'translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0))',
      },
    },
    '.animate-in': {
      animationName: 'enter',
      animationDuration: theme('animationDuration.DEFAULT', '150ms'),
      '--tw-enter-opacity': 'initial',
      '--tw-enter-scale': 'initial',
      '--tw-enter-rotate': 'initial',
      '--tw-enter-translate-x': 'initial',
      '--tw-enter-translate-y': 'initial',
    },
    '.animate-out': {
      animationName: 'exit',
      animationDuration: theme('animationDuration.DEFAULT', '150ms'),
      '--tw-exit-opacity': 'initial',
      '--tw-exit-scale': 'initial',
      '--tw-exit-rotate': 'initial',
      '--tw-exit-translate-x': 'initial',
      '--tw-exit-translate-y': 'initial',
    },
  });

  const pct = { values: { DEFAULT: '0', 0: '0', 5: '.05', 10: '.1', 20: '.2', 25: '.25', 30: '.3', 40: '.4', 50: '.5', 60: '.6', 70: '.7', 75: '.75', 80: '.8', 90: '.9', 95: '.95', 100: '1' } };
  matchUtilities({ 'fade-in': (v) => ({ '--tw-enter-opacity': v }) }, pct);
  matchUtilities({ 'fade-out': (v) => ({ '--tw-exit-opacity': v }) }, pct);
  const zoom = { values: { DEFAULT: '0', 0: '0', 50: '.5', 75: '.75', 90: '.9', 95: '.95', 100: '1' } };
  matchUtilities({ 'zoom-in': (v) => ({ '--tw-enter-scale': v }) }, zoom);
  matchUtilities({ 'zoom-out': (v) => ({ '--tw-exit-scale': v }) }, zoom);
  matchUtilities({ 'spin-in': (v) => ({ '--tw-enter-rotate': v }) }, { values: { DEFAULT: '30deg', 12: '12deg', 45: '45deg', 90: '90deg', 180: '180deg' } });

  const spacing = theme('spacing');
  const neg = (v) => (v.startsWith('-') ? v.slice(1) : `-${v}`);
  matchUtilities({ 'slide-in-from-top': (v) => ({ '--tw-enter-translate-y': neg(v) }) }, { values: spacing });
  matchUtilities({ 'slide-in-from-bottom': (v) => ({ '--tw-enter-translate-y': v }) }, { values: spacing });
  matchUtilities({ 'slide-in-from-left': (v) => ({ '--tw-enter-translate-x': neg(v) }) }, { values: spacing });
  matchUtilities({ 'slide-in-from-right': (v) => ({ '--tw-enter-translate-x': v }) }, { values: spacing });
  matchUtilities({ 'slide-out-to-top': (v) => ({ '--tw-exit-translate-y': neg(v) }) }, { values: spacing });
  matchUtilities({ 'slide-out-to-bottom': (v) => ({ '--tw-exit-translate-y': v }) }, { values: spacing });
});

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { ...brandBlue, DEFAULT: c('primary-600') },
        accent: { ...scale('accent'), DEFAULT: c('accent-500') },
        secondary: { ...scale('secondary'), DEFAULT: c('secondary-600') },

        // Legacy palettes unified with the brand blue so the 1,000+ `indigo-*`
        // usages and the Coursera-style primary CTA are one colour.
        indigo: brandBlue,
        blue: brandBlue,

        surface: {
          base: c('bg-base'),
          default: c('bg-surface'),
          hover: c('bg-surface-hover'),
          active: c('bg-surface-active'),
        },
        // `bg-bg-card` (66 usages) and `bg-card` (2) were previously undefined.
        bg: { card: c('bg-card'), base: c('bg-base'), surface: c('bg-surface') },
        card: c('bg-card'),
        'border-color': c('border-color'),

        txt: {
          primary: c('text-primary'),
          secondary: c('text-secondary'),
          tertiary: c('text-tertiary'),
          inverse: c('text-inverse'),
        },
        ui: {
          success: c('success-bg'),
          successText: c('success-text'),
          successBorder: c('success-border'),
          warning: c('warning-bg'),
          warningText: c('warning-text'),
          warningBorder: c('warning-border'),
          error: c('error-bg'),
          errorText: c('error-text'),
          errorBorder: c('error-border'),
          info: c('info-bg'),
          infoText: c('info-text'),
          infoBorder: c('info-border'),
          borderSubtle: c('border-subtle'),
          borderDefault: c('border-default'),
          borderStrong: c('border-strong'),
        },
      },

      fontSize: {
        xs: ['var(--text-caption-size)', { lineHeight: 'var(--text-caption-lh)', letterSpacing: 'var(--text-caption-ls)' }],
        sm: ['var(--text-body-sm-size)', { lineHeight: 'var(--text-body-sm-lh)', letterSpacing: 'var(--text-body-sm-ls)' }],
        base: ['var(--text-body-size)', { lineHeight: 'var(--text-body-lh)', letterSpacing: 'var(--text-body-ls)' }],
        lg: ['var(--text-body-lg-size)', { lineHeight: 'var(--text-body-lg-lh)', letterSpacing: 'var(--text-body-lg-ls)' }],
        xl: ['var(--text-h6-size)', { lineHeight: 'var(--text-h6-lh)', letterSpacing: 'var(--text-h6-ls)' }],
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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        brand: 'var(--radius-md)',
      },
      boxShadow: {
        'brand-sm': 'var(--shadow-sm)',
        'brand-md': 'var(--shadow-md)',
        'brand-lg': 'var(--shadow-lg)',
      },

      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        ripple: {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(4)', opacity: '0' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-down': { '0%': { opacity: '0', transform: 'translateY(-20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-right': { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'fade-in-left': { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'float-lg': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '.5' } },
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
      },
    },
  },
  plugins: [enterExitPlugin],
};
