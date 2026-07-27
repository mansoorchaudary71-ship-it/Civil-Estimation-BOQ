const fs = require('fs');
let content = fs.readFileSync('src/components/ui/Button.tsx', 'utf8');

content = content.replace(
  /primary: "bg-slate-900.*?",/,
  `primary: "bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-400 shadow-sm hover:shadow-md hover:-translate-y-0.5",`
);

content = content.replace(
  /secondary: "bg-slate-100.*?",/,
  `secondary: "bg-secondary-100 hover:bg-secondary-200 text-primary-800 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-white shadow-sm hover:-translate-y-0.5",`
);

content = content.replace(
  /outline: "bg-transparent border-2 border-slate-200.*?",/,
  `outline: "bg-transparent border-2 border-ui-borderDefault hover:border-ui-borderStrong text-txt-primary shadow-sm hover:-translate-y-0.5",`
);

content = content.replace(
  /ghost: "bg-transparent hover:bg-slate-100.*?",/,
  `ghost: "bg-transparent hover:bg-surface-hover text-txt-secondary hover:text-txt-primary",`
);

content = content.replace(
  /danger: "bg-rose-500.*?",/,
  `danger: "bg-ui-error hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5",`
);

content = content.replace(
  /premium: "bg-gradient-to-r.*?",/,
  `premium: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 border-none transition-all",`
);

fs.writeFileSync('src/components/ui/Button.tsx', content);

