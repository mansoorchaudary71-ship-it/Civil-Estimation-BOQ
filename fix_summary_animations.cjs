const fs = require('fs');

let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

// Replace the chart container with a motion.div
content = content.replace(
  /<div className="bg-slate-50 dark:bg-slate-800\/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-hidden">/g,
  '<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-hidden">'
);

content = content.replace(
  /<\/div>\s*\}\)\}\s*<\/div>\s*\{\/\* Visual Summary Column/g,
  '</motion.div>\n              )}\n            </div>\n          {/* Visual Summary Column'
);
// Wait, the regex for the closing div might be tricky. It's better to just replace the opening tags and matching closing tags if possible, or just the opening tag since motion.div needs </motion.div>.
