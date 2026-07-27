const fs = require('fs');

let content = fs.readFileSync('src/components/modules/ProjectManager.tsx', 'utf8');
content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');
content = content.replace(/border-white\/60/g, 'border-ui-borderSubtle');
content = content.replace(/bg-surface-default\/40/g, 'bg-surface-default');

fs.writeFileSync('src/components/modules/ProjectManager.tsx', content);

