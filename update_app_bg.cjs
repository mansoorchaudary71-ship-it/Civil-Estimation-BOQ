const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-\[#f8fafc\] to-blue-50\/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500"/,
  'className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-[#f8fafc] to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 bg-[length:200%_200%] animate-gradient-x font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500"'
);

// We should also replace standard transitions with PageTransition where applicable.
// But first, let's fix the background.
fs.writeFileSync('src/App.tsx', content);
