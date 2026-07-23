const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

content = content.replace(/bg-\[#051120\]\/95/g, 'bg-[#051120]/90');
content = content.replace(/bg-\[#0A1A2F\]\/90\/50/g, 'bg-[#0A1A2F]/40');
content = content.replace(/bg-\[#0A1A2F\]\/90\/80/g, 'bg-[#0A1A2F]/70');
content = content.replace(/bg-\[#0A1A2F\]\/90/g, 'bg-[#0A1A2F]/80');

fs.writeFileSync('src/components/Footer.tsx', content);
