const fs = require('fs');

let content = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

content = content.replace(
  'onSelectModule: (id: ModuleId) => void;',
  'onSelectModule: (id: ModuleId, layoutId?: string) => void;'
);

const oldClick = 'onClick={() => onSelectModule(est.type)}';
const newClick = 'onClick={() => onSelectModule(est.type, `recent-${est.id}`)}';
content = content.replace(oldClick, newClick);

const oldDiv = '<div\n                key={est.id}';
const newDiv = '<motion.div\n                layoutId={`recent-${est.id}`}\n                key={est.id}';
content = content.replace(oldDiv, newDiv);

const oldEndDiv = '              </div>\n            ))}';
const newEndDiv = '              </motion.div>\n            ))}';
// Wait, I need to know how the div ends.
