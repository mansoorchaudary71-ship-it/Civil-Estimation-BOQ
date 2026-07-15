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

// Because we replaced <div with <motion.div, we have to find the matching closing tag.
// It's the closing tag inside `))} ` block. Let's find it.
// The easiest way is to use regex or just replace 'onClick={() => onSelectModule(est.type)}' and then manually replace the div.

fs.writeFileSync('src/components/RecentEstimates.tsx', content);
