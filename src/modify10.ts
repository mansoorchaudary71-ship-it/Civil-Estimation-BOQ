import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/components/modules/Calculators.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Table styling
content = content.replace(
  /<div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">/g,
  '<div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">'
);

content = content.replace(
  /<thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-\[10px\] tracking-wider">/g,
  '<thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 uppercase text-[10px] tracking-wider">'
);

content = content.replace(
  /<tbody className="text-slate-800 divide-y divide-slate-100">/g,
  '<tbody className="text-slate-800 divide-y divide-slate-50">'
);

content = content.replace(
  /bg-slate-100 border-l border-slate-200/g,
  'bg-slate-50/50 border-l border-slate-100'
);

content = content.replace(
  /bg-slate-50 border-l border-slate-200/g,
  'bg-slate-50/50 border-l border-slate-100'
);

fs.writeFileSync(filePath, content, 'utf-8');
