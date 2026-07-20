const fs = require('fs');
const file = '/app/applet/src/components/Footer.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace all "h-[1px]" or "h-[1.5px]" inside spans with "origin-left scale-x-0" to "h-[2px]" to make them consistent and slightly bolder
content = content.replace(/h-\[1(\.5)?px\]( bg-gradient-to-r.*origin-left scale-x-0)/g, 'h-[2px]$2');

fs.writeFileSync(file, content);
console.log('Fixed Footer.tsx hover effects to consistent h-[2px]');
