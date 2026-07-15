const fs = require('fs');
const file = '/app/applet/src/components/modules/HouseEstimator.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/after:content-\["'\]/g, "after:content-['']");
fs.writeFileSync(file, code, 'utf8');
console.log("Fixed syntax error");
