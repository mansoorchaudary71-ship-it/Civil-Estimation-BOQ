import fs from 'fs';
const file = 'src/components/modules/HouseEstimator.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/after:content-\["'\]/g, "after:content-['']");
fs.writeFileSync(file, code, 'utf8');
console.log("Fixed syntax error");
