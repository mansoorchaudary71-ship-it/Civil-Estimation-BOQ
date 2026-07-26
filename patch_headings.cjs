const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace Recent Tools heading
code = code.replace(
  /<h2 className="md: flex items-center gap-3 text-xl font-semibold text-slate-900 tracking-tight mb-4">/,
  '<h2 id="section-recent-tools" className="md: flex items-center gap-3 text-xl font-semibold text-slate-900 tracking-tight mb-4">'
);

// Replace Personalized Shortcuts heading
code = code.replace(
  /<h2 className="flex items-center gap-3 text-xl font-semibold text-slate-800 tracking-tight mb-4">\s*<Bookmark/,
  '<h2 id="section-personalized-shortcuts" className="flex items-center gap-3 text-xl font-semibold text-slate-800 tracking-tight mb-4">\n                                      <Bookmark'
);

// Replace category group headings
code = code.replace(
  /<h2 className="px-2 flex items-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-4">/g,
  '<h2 id={`section-${groupName.toLowerCase().replace(/[^a-z0-9]+/g, \'-\')}`} className="px-2 flex items-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-4">'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
