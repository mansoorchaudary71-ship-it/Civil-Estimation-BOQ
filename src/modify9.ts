import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/modules/Calculators.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Change card borders
content = content.replace(/border-slate-200 bg-white shadow-sm rounded-xl/g, 'border-slate-100 bg-white shadow-sm rounded-2xl');

content = content.replace(/rounded-xl/g, 'rounded-xl'); // inputs are fine as xl
// But output boxes are now rounded-2xl

fs.writeFileSync(filePath, content, 'utf-8');
