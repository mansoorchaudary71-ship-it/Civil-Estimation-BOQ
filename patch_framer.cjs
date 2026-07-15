const fs = require('fs');

// Patch App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '<AnimatePresence mode="wait">',
  '<AnimatePresence>'
);
appContent = appContent.replace(
  'key={activeModule}',
  'key={activeModule}\n                              layoutId={`module-${activeModule}`}'
);
fs.writeFileSync('src/App.tsx', appContent);

// Patch ToolCard.tsx
let toolCardContent = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');
toolCardContent = toolCardContent.replace(
  '<motion.div\n      onClick={() => onSelect(mod.id)}',
  '<motion.div\n      layoutId={`module-${mod.id}`}\n      onClick={() => onSelect(mod.id)}'
);
fs.writeFileSync('src/components/ToolCard.tsx', toolCardContent);
console.log("Patched!");
