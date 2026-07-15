const fs = require('fs');

let content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

content = content.replace(
  'onSelect: (id: string) => void;',
  'onSelect: (id: string, layoutId?: string) => void;\n  layoutId?: string;'
);

content = content.replace(
  '<motion.div\n      layoutId={`module-${mod.id}`}\n      onClick={() => onSelect(mod.id)}',
  '<motion.div\n      layoutId={layoutId || `module-${mod.id}`}\n      onClick={() => onSelect(mod.id, layoutId || `module-${mod.id}`)}'
);
// In case the previous patch didn't add layoutId
content = content.replace(
  '<motion.div\n      onClick={() => onSelect(mod.id)}',
  '<motion.div\n      layoutId={layoutId || `module-${mod.id}`}\n      onClick={() => onSelect(mod.id, layoutId || `module-${mod.id}`)}'
);

fs.writeFileSync('src/components/ToolCard.tsx', content);
console.log("Patched ToolCard.tsx");
