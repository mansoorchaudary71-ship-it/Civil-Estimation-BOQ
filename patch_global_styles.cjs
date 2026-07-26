const fs = require('fs');

const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

const globalEnhancements = `
@layer base {
  /* Enforce paragraph width and readability */
  p, li, dd {
    max-width: 70ch;
  }

  /* Improve Spacing */
  section, main, article {
    /* Base section spacing for better breathing room */
  }

  /* Forms Standardization */
  label {
    font-weight: var(--text-label-weight);
    letter-spacing: var(--text-label-ls);
    font-size: var(--text-label-size);
    margin-bottom: 0.375rem;
    display: inline-block;
  }
  
  /* Inputs */
  input[type="text"], input[type="email"], input[type="number"], input[type="password"], textarea, select {
    font-size: var(--text-body-size);
    line-height: var(--text-body-lh);
    border-radius: 0.5rem; /* Standardizing radius */
  }
}

@layer components {
  /* Button Standardization */
  button, .btn {
    font-weight: var(--text-button-weight) !important;
    letter-spacing: var(--text-button-ls) !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* Vertically center the text */
  }

  /* Card Typography Enhancements */
  .card h3, .card h4, [class*="card"] h3, [class*="card"] h4 {
    font-weight: 700 !important;
    letter-spacing: -0.01em !important;
    margin-bottom: 0.5rem;
  }

  .card p, [class*="card"] p {
    color: #64748b; /* slate-500 */
    line-height: 1.5;
  }
  .dark .card p, .dark [class*="card"] p {
    color: #94a3b8; /* slate-400 */
  }
  
  /* Footer Typography */
  footer h3, footer h4, [class*="footer"] h3, [class*="footer"] h4 {
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
    text-transform: uppercase;
    font-size: 0.875rem !important; /* text-sm */
    color: #0f172a; /* slate-900 */
    margin-bottom: 1rem;
  }
  .dark footer h3, .dark footer h4, .dark [class*="footer"] h3, .dark [class*="footer"] h4 {
    color: #f8fafc; /* slate-50 */
  }

  footer a, [class*="footer"] a {
    color: #64748b; /* slate-500 */
    font-size: 0.875rem !important; /* text-sm */
    transition: color 0.2s ease;
  }
  .dark footer a, .dark [class*="footer"] a {
    color: #94a3b8; /* slate-400 */
  }
  footer a:hover, [class*="footer"] a:hover {
    color: #0f172a; /* slate-900 */
  }
  .dark footer a:hover, .dark [class*="footer"] a:hover {
    color: #f8fafc; /* slate-50 */
  }

  /* Navigation Typography */
  nav a, [class*="nav"] a, header a {
    font-weight: 500;
    font-size: 0.9375rem; /* 15px */
    letter-spacing: 0;
  }
}
`;

if (!css.includes('/* Enforce paragraph width and readability */')) {
  css = css + '\n\n' + globalEnhancements;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log("Global style enhancements added.");
} else {
  console.log("Global styles already exist.");
}
