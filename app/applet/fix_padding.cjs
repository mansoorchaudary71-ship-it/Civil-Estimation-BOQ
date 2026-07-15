const fs = require('fs');
let code = fs.readFileSync('/app/applet/src/components/Dashboard.tsx', 'utf8');
code = code.replace(/pb-32 tools-section/g, 'pb-12 tools-section');
fs.writeFileSync('/app/applet/src/components/Dashboard.tsx', code, 'utf8');
console.log("Updated padding in Dashboard.tsx");
