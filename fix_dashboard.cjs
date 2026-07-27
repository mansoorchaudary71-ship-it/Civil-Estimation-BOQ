const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace text-slate-900 with text-txt-primary etc
content = content.replace(/text-slate-900/g, 'text-txt-primary');
content = content.replace(/text-gray-900/g, 'text-txt-primary');
content = content.replace(/text-gray-500/g, 'text-txt-secondary');
content = content.replace(/text-slate-600/g, 'text-txt-secondary');
content = content.replace(/text-gray-400/g, 'text-txt-tertiary');
content = content.replace(/bg-white/g, 'bg-surface-default');
content = content.replace(/border-slate-200/g, 'border-ui-borderSubtle');

fs.writeFileSync('src/components/Dashboard.tsx', content);
