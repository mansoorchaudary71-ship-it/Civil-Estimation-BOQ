import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/modules/Calculators.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /<div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-sm flex flex-col gap-6">/g,
  '<div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-6">'
);

fs.writeFileSync(filePath, content, 'utf-8');
