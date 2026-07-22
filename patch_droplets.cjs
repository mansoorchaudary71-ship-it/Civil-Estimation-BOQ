const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!file.includes('Droplets,') && !file.includes(', Droplets')) {
  file = file.replace(
    'import { Calculator,',
    'import { Calculator, Droplets,'
  );
  fs.writeFileSync('src/components/Dashboard.tsx', file);
  console.log("Patched Droplets import");
}
