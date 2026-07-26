const fs = require('fs');

const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const typographyScale = `
@layer base {
  :root {
    --font-primary: 'Inter', sans-serif;
    
    /* Typography Scale Variables */
    
    /* Display */
    --text-display-xl-size: 4.5rem; /* 72px */
    --text-display-xl-lh: 1.05;
    --text-display-xl-weight: 800;
    --text-display-xl-ls: -0.04em;

    --text-display-lg-size: 3.75rem; /* 60px */
    --text-display-lg-lh: 1.1;
    --text-display-lg-weight: 800;
    --text-display-lg-ls: -0.03em;

    /* Headings */
    --text-h1-size: 3rem; /* 48px */
    --text-h1-lh: 1.15;
    --text-h1-weight: 800;
    --text-h1-ls: -0.02em;

    --text-h2-size: 2.25rem; /* 36px */
    --text-h2-lh: 1.2;
    --text-h2-weight: 700;
    --text-h2-ls: -0.02em;

    --text-h3-size: 1.875rem; /* 30px */
    --text-h3-lh: 1.3;
    --text-h3-weight: 700;
    --text-h3-ls: -0.01em;

    --text-h4-size: 1.5rem; /* 24px */
    --text-h4-lh: 1.4;
    --text-h4-weight: 600;
    --text-h4-ls: -0.01em;

    --text-h5-size: 1.25rem; /* 20px */
    --text-h5-lh: 1.4;
    --text-h5-weight: 600;
    --text-h5-ls: 0;

    --text-h6-size: 1.125rem; /* 18px */
    --text-h6-lh: 1.5;
    --text-h6-weight: 600;
    --text-h6-ls: 0;

    /* Body Text */
    --text-body-lg-size: 1.125rem; /* 18px */
    --text-body-lg-lh: 1.6;
    --text-body-lg-weight: 400;
    --text-body-lg-ls: 0;

    --text-body-size: 1rem; /* 16px */
    --text-body-lh: 1.6;
    --text-body-weight: 400;
    --text-body-ls: 0;

    --text-body-sm-size: 0.875rem; /* 14px */
    --text-body-sm-lh: 1.5;
    --text-body-sm-weight: 400;
    --text-body-sm-ls: 0;

    --text-caption-size: 0.75rem; /* 12px */
    --text-caption-lh: 1.5;
    --text-caption-weight: 400;
    --text-caption-ls: 0.01em;

    /* UI Elements */
    --text-button-size: 0.9375rem; /* 15px */
    --text-button-lh: 1.2;
    --text-button-weight: 600;
    --text-button-ls: 0.01em;

    --text-nav-size: 0.9375rem; /* 15px */
    --text-nav-lh: 1.5;
    --text-nav-weight: 500;
    --text-nav-ls: 0;

    --text-card-title-size: 1.125rem; /* 18px */
    --text-card-title-lh: 1.4;
    --text-card-title-weight: 600;
    --text-card-title-ls: 0;

    --text-card-desc-size: 0.875rem; /* 14px */
    --text-card-desc-lh: 1.5;
    --text-card-desc-weight: 400;
    --text-card-desc-ls: 0;

    --text-footer-size: 0.875rem; /* 14px */
    --text-footer-lh: 1.6;
    --text-footer-weight: 400;
    --text-footer-ls: 0;

    --text-label-size: 0.875rem; /* 14px */
    --text-label-lh: 1.2;
    --text-label-weight: 500;
    --text-label-ls: 0.01em;

    --text-placeholder-size: 1rem; /* 16px */
    --text-placeholder-lh: 1.2;
    --text-placeholder-weight: 400;
    --text-placeholder-ls: 0;

    --text-badge-size: 0.75rem; /* 12px */
    --text-badge-lh: 1;
    --text-badge-weight: 600;
    --text-badge-ls: 0.02em;

    --text-chip-size: 0.875rem; /* 14px */
    --text-chip-lh: 1.2;
    --text-chip-weight: 500;
    --text-chip-ls: 0.01em;
  }

  /* Responsive Adjustments for Mobile */
  @media (max-width: 768px) {
    :root {
      --text-display-xl-size: 3rem; /* 48px */
      --text-display-lg-size: 2.5rem; /* 40px */
      --text-h1-size: 2.25rem; /* 36px */
      --text-h2-size: 1.875rem; /* 30px */
      --text-h3-size: 1.5rem; /* 24px */
      --text-h4-size: 1.25rem; /* 20px */
      --text-h5-size: 1.125rem; /* 18px */
      --text-h6-size: 1rem; /* 16px */
    }
  }

  /* Core Body Reset */
  body {
    font-family: var(--font-primary);
    font-size: var(--text-body-size);
    line-height: var(--text-body-lh);
    font-weight: var(--text-body-weight);
    letter-spacing: var(--text-body-ls);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Global Heading Settings */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-primary);
    color: inherit;
    margin-top: 0;
    margin-bottom: 0.5em; /* consistent spacing */
  }

  p {
    margin-top: 0;
    margin-bottom: 1rem;
    max-width: 70ch; /* Optimal reading width */
  }

  h1 { font-size: var(--text-h1-size); line-height: var(--text-h1-lh); font-weight: var(--text-h1-weight); letter-spacing: var(--text-h1-ls); }
  h2 { font-size: var(--text-h2-size); line-height: var(--text-h2-lh); font-weight: var(--text-h2-weight); letter-spacing: var(--text-h2-ls); }
  h3 { font-size: var(--text-h3-size); line-height: var(--text-h3-lh); font-weight: var(--text-h3-weight); letter-spacing: var(--text-h3-ls); }
  h4 { font-size: var(--text-h4-size); line-height: var(--text-h4-lh); font-weight: var(--text-h4-weight); letter-spacing: var(--text-h4-ls); }
  h5 { font-size: var(--text-h5-size); line-height: var(--text-h5-lh); font-weight: var(--text-h5-weight); letter-spacing: var(--text-h5-ls); }
  h6 { font-size: var(--text-h6-size); line-height: var(--text-h6-lh); font-weight: var(--text-h6-weight); letter-spacing: var(--text-h6-ls); }
}

@layer utilities {
  /* Typography Scale Classes */
  .text-display-xl {
    font-family: var(--font-primary);
    font-size: var(--text-display-xl-size);
    line-height: var(--text-display-xl-lh);
    font-weight: var(--text-display-xl-weight);
    letter-spacing: var(--text-display-xl-ls);
  }

  .text-display-lg {
    font-family: var(--font-primary);
    font-size: var(--text-display-lg-size);
    line-height: var(--text-display-lg-lh);
    font-weight: var(--text-display-lg-weight);
    letter-spacing: var(--text-display-lg-ls);
  }

  .text-body-lg {
    font-family: var(--font-primary);
    font-size: var(--text-body-lg-size);
    line-height: var(--text-body-lg-lh);
    font-weight: var(--text-body-lg-weight);
    letter-spacing: var(--text-body-lg-ls);
    max-width: 70ch;
  }

  .text-body {
    font-family: var(--font-primary);
    font-size: var(--text-body-size);
    line-height: var(--text-body-lh);
    font-weight: var(--text-body-weight);
    letter-spacing: var(--text-body-ls);
    max-width: 70ch;
  }

  .text-body-sm {
    font-family: var(--font-primary);
    font-size: var(--text-body-sm-size);
    line-height: var(--text-body-sm-lh);
    font-weight: var(--text-body-sm-weight);
    letter-spacing: var(--text-body-sm-ls);
    max-width: 65ch;
  }

  .text-caption {
    font-family: var(--font-primary);
    font-size: var(--text-caption-size);
    line-height: var(--text-caption-lh);
    font-weight: var(--text-caption-weight);
    letter-spacing: var(--text-caption-ls);
  }

  .text-btn {
    font-family: var(--font-primary);
    font-size: var(--text-button-size);
    line-height: var(--text-button-lh);
    font-weight: var(--text-button-weight);
    letter-spacing: var(--text-button-ls);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .text-nav {
    font-family: var(--font-primary);
    font-size: var(--text-nav-size);
    line-height: var(--text-nav-lh);
    font-weight: var(--text-nav-weight);
    letter-spacing: var(--text-nav-ls);
  }

  .text-card-title {
    font-family: var(--font-primary);
    font-size: var(--text-card-title-size);
    line-height: var(--text-card-title-lh);
    font-weight: var(--text-card-title-weight);
    letter-spacing: var(--text-card-title-ls);
  }

  .text-card-desc {
    font-family: var(--font-primary);
    font-size: var(--text-card-desc-size);
    line-height: var(--text-card-desc-lh);
    font-weight: var(--text-card-desc-weight);
    letter-spacing: var(--text-card-desc-ls);
    @apply text-slate-500 dark:text-slate-400; /* Semantic Color */
  }

  .text-footer-text {
    font-family: var(--font-primary);
    font-size: var(--text-footer-size);
    line-height: var(--text-footer-lh);
    font-weight: var(--text-footer-weight);
    letter-spacing: var(--text-footer-ls);
    @apply text-slate-500 dark:text-slate-400; /* Semantic Color */
  }

  .text-input-label {
    font-family: var(--font-primary);
    font-size: var(--text-label-size);
    line-height: var(--text-label-lh);
    font-weight: var(--text-label-weight);
    letter-spacing: var(--text-label-ls);
    @apply text-slate-700 dark:text-slate-300;
  }

  .text-input-placeholder {
    font-family: var(--font-primary);
    font-size: var(--text-placeholder-size);
    line-height: var(--text-placeholder-lh);
    font-weight: var(--text-placeholder-weight);
    letter-spacing: var(--text-placeholder-ls);
    @apply text-slate-400 dark:text-slate-500;
  }

  .text-badge {
    font-family: var(--font-primary);
    font-size: var(--text-badge-size);
    line-height: var(--text-badge-lh);
    font-weight: var(--text-badge-weight);
    letter-spacing: var(--text-badge-ls);
    text-transform: uppercase;
  }

  .text-chip {
    font-family: var(--font-primary);
    font-size: var(--text-chip-size);
    line-height: var(--text-chip-lh);
    font-weight: var(--text-chip-weight);
    letter-spacing: var(--text-chip-ls);
  }
}
`;

if (!css.includes('--text-display-xl-size')) {
  css = css + '\n\n' + typographyScale;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log("Typography scale added successfully.");
} else {
  console.log("Typography scale already exists.");
}

