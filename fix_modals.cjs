const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  // Just inject animate-in zoom-in-95 duration-200 ease-out transform-gpu into the main modal dialog container if it exists.
  c = c.replace(/className="bg-surface-default([^"]*) shadow-xl([^"]*)"/g, 'className="bg-surface-default$1 shadow-xl$2 animate-in zoom-in-95 duration-200 ease-out transform-gpu"');
  fs.writeFileSync(file, c);
}

fix('src/components/ui/ShareModal.tsx');
fix('src/components/ui/HelpGuideModal.tsx');
fix('src/components/ui/FormulaModal.tsx');

