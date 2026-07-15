import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/modules/Calculators.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/font-medium font-medium/g, 'font-medium');

fs.writeFileSync(filePath, content, 'utf-8');
