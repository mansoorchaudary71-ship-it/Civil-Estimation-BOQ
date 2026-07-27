const fs = require('fs');

let content = fs.readFileSync('src/components/modules/ProjectManager.tsx', 'utf8');

content = content.replace(/border-slate-200/g, 'border-ui-borderSubtle');
content = content.replace(/bg-white/g, 'bg-surface-default');
content = content.replace(/text-gray-800/g, 'text-txt-primary');
content = content.replace(/text-gray-600/g, 'text-txt-secondary');
content = content.replace(/text-gray-900/g, 'text-txt-primary');

fs.writeFileSync('src/components/modules/ProjectManager.tsx', content);

