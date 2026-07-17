const fs = require('fs');

let fileStr = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

fileStr = fileStr.replace(/h-\[180px\]/g, 'h-[280px]');

fs.writeFileSync('src/components/Dashboard.tsx', fileStr);
