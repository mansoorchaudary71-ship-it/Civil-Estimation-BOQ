const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const colorSystem = `
@layer base {
  :root {
    /* Navy (Primary) - Engineering SaaS feel */
    --color-primary-50: #f0f4f8;
    --color-primary-100: #d9e2ec;
    --color-primary-200: #bcccdc;
    --color-primary-300: #9fb3c8;
    --color-primary-400: #829ab1;
    --color-primary-500: #627d98;
    --color-primary-600: #486581;
    --color-primary-700: #334e68;
    --color-primary-800: #243b53; /* Navy base */
    --color-primary-900: #102a43;

    /* Orange (Accent) */
    --color-accent-50: #fff3e0;
    --color-accent-100: #ffe0b2;
    --color-accent-200: #ffcc80;
    --color-accent-300: #ffb74d;
    --color-accent-400: #ffa726;
    --color-accent-500: #f97316; /* Base orange */
    --color-accent-600: #ea580c;
    --color-accent-700: #c2410c;
    --color-accent-800: #9a3412;
    --color-accent-900: #7c2d12;

    /* Secondary (Slate/Grey) */
    --color-secondary-50: #f8fafc;
    --color-secondary-100: #f1f5f9;
    --color-secondary-200: #e2e8f0;
    --color-secondary-300: #cbd5e1;
    --color-secondary-400: #94a3b8;
    --color-secondary-500: #64748b;
    --color-secondary-600: #475569;
    --color-secondary-700: #334155;
    --color-secondary-800: #1e293b;
    --color-secondary-900: #0f172a;

    /* Semantic */
    --color-success-bg: #d1fae5;
    --color-success-text: #065f46;
    --color-success-border: #34d399;

    --color-warning-bg: #fef3c7;
    --color-warning-text: #92400e;
    --color-warning-border: #fbbf24;

    --color-error-bg: #fee2e2;
    --color-error-text: #b91c1c;
    --color-error-border: #f87171;

    --color-info-bg: #e0f2fe;
    --color-info-text: #0369a1;
    --color-info-border: #38bdf8;

    /* Backgrounds & Surfaces (Light Mode) */
    --color-bg-base: #f8fafc;
    --color-bg-surface: #ffffff;
    --color-bg-surface-hover: #f1f5f9;
    --color-bg-surface-active: #e2e8f0;
    
    /* Borders */
    --color-border-subtle: #e2e8f0;
    --color-border-default: #cbd5e1;
    --color-border-strong: #94a3b8;

    /* Typography (Light Mode) */
    --color-text-primary: #0f172a; /* Improved dark text readability */
    --color-text-secondary: #475569;
    --color-text-tertiary: #64748b;
    --color-text-inverse: #ffffff;

    /* Buttons */
    --color-btn-primary-bg: var(--color-primary-800);
    --color-btn-primary-hover: var(--color-primary-900);
    --color-btn-primary-text: var(--color-text-inverse);
    
    --color-btn-secondary-bg: var(--color-bg-surface);
    --color-btn-secondary-hover: var(--color-bg-surface-hover);
    --color-btn-secondary-border: var(--color-border-default);
    --color-btn-secondary-text: var(--color-text-primary);

    --color-btn-accent-bg: var(--color-accent-600);
    --color-btn-accent-hover: var(--color-accent-700);
    --color-btn-accent-text: var(--color-text-inverse);

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-900) 100%);
    --gradient-accent: linear-gradient(135deg, var(--color-accent-500) 0%, var(--color-accent-700) 100%);
    --gradient-surface: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%);
  }

  .dark {
    /* Backgrounds & Surfaces (Dark Mode) */
    --color-bg-base: #020617;
    --color-bg-surface: #0f172a;
    --color-bg-surface-hover: #1e293b;
    --color-bg-surface-active: #334155;
    
    /* Borders (Dark Mode) */
    --color-border-subtle: #1e293b;
    --color-border-default: #334155;
    --color-border-strong: #475569;

    /* Typography (Dark Mode) */
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-text-tertiary: #94a3b8;
    --color-text-inverse: #020617;

    /* Semantic (Dark Mode adjusted for contrast) */
    --color-success-bg: rgba(5, 150, 105, 0.2);
    --color-success-text: #34d399;
    --color-success-border: rgba(5, 150, 105, 0.3);

    --color-warning-bg: rgba(217, 119, 6, 0.2);
    --color-warning-text: #fbbf24;
    --color-warning-border: rgba(217, 119, 6, 0.3);

    --color-error-bg: rgba(220, 38, 38, 0.2);
    --color-error-text: #f87171;
    --color-error-border: rgba(220, 38, 38, 0.3);

    --color-info-bg: rgba(2, 132, 199, 0.2);
    --color-info-text: #38bdf8;
    --color-info-border: rgba(2, 132, 199, 0.3);

    /* Buttons (Dark Mode) */
    --color-btn-primary-bg: var(--color-primary-600);
    --color-btn-primary-hover: var(--color-primary-500);
    --color-btn-primary-text: var(--color-text-inverse);
    
    --color-btn-secondary-bg: var(--color-bg-surface);
    --color-btn-secondary-hover: var(--color-bg-surface-hover);
    --color-btn-secondary-border: var(--color-border-default);
    --color-btn-secondary-text: var(--color-text-primary);

    --color-btn-accent-bg: var(--color-accent-600);
    --color-btn-accent-hover: var(--color-accent-500);
    --color-btn-accent-text: var(--color-text-inverse);

    /* Gradients (Dark Mode) */
    --gradient-surface: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%);
  }
}
`;

// Insert it right after the tailwind imports
css = css.replace(/@tailwind utilities;/, "@tailwind utilities;\n" + colorSystem);

fs.writeFileSync('src/index.css', css, 'utf8');
