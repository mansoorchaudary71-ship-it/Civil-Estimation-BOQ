const fs = require('fs');
let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

content = content.replace(
  /Recalculate Values\s*<\/button>/,
  'Recalculate Values\n              <span className="ml-1 text-[10px] font-medium opacity-70 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded px-1.5 py-0.5 hidden sm:inline-block pointer-events-none">Ctrl+Enter</span>\n            </button>'
);

fs.writeFileSync('src/components/ui/MaterialSummary.tsx', content);
