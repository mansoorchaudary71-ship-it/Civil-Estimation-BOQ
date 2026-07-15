const fs = require('fs');
const file = 'src/components/HeroSection.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/bg-\[\#FAF9F6\]/g, 'bg-[#EFE7E8]');
content = content.replace(/from-\[\#FAF9F6\]/g, 'from-[#EFE7E8]');

content = content.replace(/text-blue-600 flex/g, 'text-slate-800 flex');
content = content.replace(/text-emerald-600 flex/g, 'text-slate-800 flex');
content = content.replace(/text-purple-600 flex/g, 'text-slate-800 flex');
content = content.replace(/text-orange-500 flex/g, 'text-slate-800 flex');
content = content.replace(/text-teal-600 flex/g, 'text-slate-800 flex');
content = content.replace(/text-rose-600 flex/g, 'text-slate-800 flex');

fs.writeFileSync(file, content);
