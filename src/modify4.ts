import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src', 'components', 'modules', 'Calculators.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/divide-\[\#27272a\]/g, 'divide-slate-200');

content = content.replace(/bg-slate-50 border border-slate-200 rounded-lg p-5/g, 'bg-slate-50 border border-slate-200 rounded-xl p-6');

content = content.replace(/"border-transparent text-slate-500 hover:text-slate-400"/g, '"border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"');

// Fix overlaps text which might have wrong padding in the 'd' section
const oldD = 'px-2 py-2 text-xs text-slate-500 bg-slate-50 border-l border-slate-200';
const newD = 'flex items-center justify-center px-4 font-bold text-sm text-slate-500 bg-slate-100 border-l border-slate-200';
content = content.replace(new RegExp(oldD.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newD);

fs.writeFileSync(filePath, content, 'utf-8');
