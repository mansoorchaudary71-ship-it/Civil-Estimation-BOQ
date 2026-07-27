const fs = require('fs');

const configPath = 'tailwind.config.js';
let config = fs.readFileSync(configPath, 'utf8');

const colorsConfig = `
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
`;

config = config.replace('extend: {', 'extend: {' + colorsConfig);
fs.writeFileSync(configPath, config);
