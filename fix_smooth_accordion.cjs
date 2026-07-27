const fs = require('fs');

let content = fs.readFileSync('src/components/ui/SmoothAccordion.tsx', 'utf8');

content = content.replace(/ease: 'easeInOut'/g, 'ease: [0.16, 1, 0.3, 1]');

fs.writeFileSync('src/components/ui/SmoothAccordion.tsx', content);

