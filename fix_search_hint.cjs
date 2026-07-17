const fs = require('fs');
let content = fs.readFileSync('src/components/SearchAndFilterBar.tsx', 'utf8');

content = content.replace(
  'className="relative w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm text-[15px] sm:text-base font-medium"',
  'className="relative w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl py-3.5 pl-12 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm text-[15px] sm:text-base font-medium"'
);

content = content.replace(
  /<\/div>\s*<>\s*<label htmlFor="a11y-input-\d+" className="sr-only">Input<\/label>/,
  `</div>
            <>
            <label htmlFor="a11y-input-search" className="sr-only">Input</label>`
);

content = content.replace(
  /<\/div>\s*\{\/\* Suggestions Dropdown \*\/\}/,
  `<div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center h-6 px-2 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-md pointer-events-none shadow-sm">
              /
            </div>
          </div>
          {/* Suggestions Dropdown */}`
);

fs.writeFileSync('src/components/SearchAndFilterBar.tsx', content);
