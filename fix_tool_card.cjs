const fs = require('fs');

let content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

// The favorite button
content = content.replace(
  /<Button onClick=\{toggleFavorite\}[\s\S]*?aria-label=\{saved \? "Remove from favorites" : "Add to favorites"\}\s*>/,
  '<button onClick={toggleFavorite} className="flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors active:scale-95" aria-label={saved ? "Remove from favorites" : "Add to favorites"}>'
);
content = content.replace(/<\/motion\.div>\s*<\/Button>/, '</motion.div>\n            </button>');

// The OPEN button
content = content.replace(
  /<Button\s*className=\{cn\([\s\S]*?bg-\[#E6DFEB\]"\s*\)\}\s*onClick=\{handleSelect\}\s*>/,
  `<Button
            variant="outline"
            size="sm"
            onClick={handleSelect}
            className="rounded-full px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-transparent"
          >`
);

// The Close quick view button
content = content.replace(
  /<Button\s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setShowQuickView\(false\);\s*\}\}\s*className="p-2 bg-surface-default\/50 hover:bg-surface-default rounded-full transition-colors"\s*>/,
  `<button onClick={(e) => { e.stopPropagation(); setShowQuickView(false); }} className="p-2 bg-surface-default/50 hover:bg-surface-default rounded-full transition-colors">`
);
content = content.replace(/<X size=\{20\} className="text-txt-tertiary" \/>\s*<\/Button>/, '<X size={20} className="text-txt-tertiary" />\n                </button>');

// The Open Tool button in quick view
content = content.replace(
  /<Button\s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*setShowQuickView\(false\);\s*onSelect\(mod\.id\);\s*\}\}\s*className="flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all active:scale-95"\s*style=\{\{\s*backgroundColor: cfg\.c,\s*boxShadow: `0 4px 14px \$\{cfg\.c\}40`\s*\}\}\s*>/,
  `<Button onClick={(e) => { e.stopPropagation(); setShowQuickView(false); onSelect(mod.id); }} variant="premium" className="flex-1" rightIcon={<ArrowRight size={16} />}>`
);
content = content.replace(/Open Tool <ArrowRight size=\{16\} \/>\s*<\/Button>/, 'Open Tool\n                  </Button>');

// The second favorite button in quick view
content = content.replace(
  /<Button\s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*toggleFavorite\(e\);\s*\}\}\s*className="p-3 rounded-xl border border-ui-borderSubtle hover:bg-slate-50 transition-colors flex items-center justify-center text-txt-secondary"\s*>/,
  `<button onClick={(e) => { e.stopPropagation(); toggleFavorite(e); }} className="p-3 rounded-xl border border-ui-borderSubtle hover:bg-slate-50 transition-colors flex items-center justify-center text-txt-secondary">`
);
content = content.replace(/\{saved \? <BookmarkCheck size=\{20\} color=\{cfg\.c\} \/> : <Bookmark size=\{20\} \/>\}\s*<\/Button>/, '{saved ? <BookmarkCheck size={20} color={cfg.c} /> : <Bookmark size={20} />}\n                  </button>');

fs.writeFileSync('src/components/ToolCard.tsx', content);
