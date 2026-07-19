const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const target = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    overflow-x: hidden;
  }
  body {
    @apply antialiased text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 transition-colors duration-300;
  }
}

@layer components {
  /* High contrast inputs */
  input:not([type="checkbox"]):not([type="radio"]), 
  select, 
  textarea {
    @apply text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all;
  }
  /* Clear labels */
  label {
    @apply text-slate-700 dark:text-slate-300 font-semibold;
  }
  /* Headings readability */
  h1, h2, h3, h4, h5, h6 {
    @apply text-slate-900 dark:text-slate-50 font-bold tracking-tight;
  }
}`;

const replacement = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    overflow-x: hidden;
  }
  body {
    @apply antialiased subpixel-antialiased text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans;
  }
}

@layer components {
  /* Universal Surface Contrast Rules */
  .surface-light {
    @apply bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800;
  }
  
  .surface-dark {
    @apply bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900;
  }

  /* High contrast inputs */
  input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), 
  select, 
  textarea {
    @apply bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm rounded-md px-3 py-2;
  }
  
  /* Clear labels & Technical units */
  label, .technical-label {
    @apply text-slate-700 dark:text-slate-300 font-semibold text-sm tracking-wide block mb-1;
  }

  .technical-unit {
    @apply text-slate-600 dark:text-slate-400 font-medium text-xs ml-1 uppercase tracking-wider;
  }

  /* Headings readability */
  h1, h2, h3, h4, h5, h6 {
    @apply text-slate-900 dark:text-slate-50 font-bold tracking-tight;
  }

  /* Dynamic Result Badges and Metrics */
  .result-metric {
    @apply text-slate-900 dark:text-slate-50 font-bold tabular-nums tracking-tight;
  }
  
  .result-badge {
    @apply bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1 rounded-full text-sm tabular-nums inline-flex items-center;
  }
}`;

if (css.includes(target)) {
  css = css.replace(target, replacement);
  fs.writeFileSync('src/index.css', css);
  console.log("Replaced using exact match");
} else {
  // Try regex or more lenient match
  console.log("Could not find exact match. Writing manually.");
  // Let's just output the whole thing and replace it by splitting at the first @layer utilities
  let parts = css.split('@layer utilities {');
  if(parts.length > 1) {
    fs.writeFileSync('src/index.css', replacement + '\n\n@layer utilities {' + parts.slice(1).join('@layer utilities {'));
    console.log("Replaced using split");
  } else {
    console.log("Failed completely.");
  }
}
