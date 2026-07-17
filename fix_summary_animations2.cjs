const fs = require('fs');

let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

// Replace line 256
content = content.replace(
  /<div className="bg-slate-50 dark:bg-slate-800\/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-hidden">/,
  '<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-hidden">'
);

// Replace line 339
// We need to carefully replace the closing tag. 
// It's `</div>\n              )}`
content = content.replace(
  /<\/div>\s*\}\)\}\s*\{relatedModules/g,
  '</motion.div>\n              )}\n\n              {relatedModules'
);

fs.writeFileSync('src/components/ui/MaterialSummary.tsx', content);
