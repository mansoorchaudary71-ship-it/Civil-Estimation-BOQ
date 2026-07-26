const fs = require('fs');

const path = 'src/components/TopNavbar.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure that close button works correctly
content = content.replace('className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 z-[115] shadow-2xl md:hidden overflow-y-auto"', 'className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 z-[115] shadow-2xl md:hidden overflow-y-auto"');

fs.writeFileSync(path, content, 'utf8');
