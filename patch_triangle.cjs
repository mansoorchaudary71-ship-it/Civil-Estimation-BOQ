const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('Triangle,') && !file.includes(', Triangle')) {
  file = file.replace(
    'import { Calculator,',
    'import { Calculator, Triangle,'
  );
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched Triangle import");
}
