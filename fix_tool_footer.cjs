const fs = require('fs');
let file = '/app/applet/src/components/ToolPageFooter.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-white/g, 'bg-[#1d2f3d]');
  content = content.replace(/text-slate-800/g, 'text-white');
  content = content.replace(/text-slate-700/g, 'text-white');
  content = content.replace(/bg-\[#FFFFFF\]/g, 'bg-white/10');
  fs.writeFileSync(file, content);
}
let file2 = '/app/applet/src/components/ui/FooterDisclaimer.tsx';
if (fs.existsSync(file2)) {
  let content2 = fs.readFileSync(file2, 'utf8');
  content2 = content2.replace(/bg-white/g, 'bg-[#1d2f3d]');
  content2 = content2.replace(/text-slate-500/g, 'text-[#f3f4f6]');
  fs.writeFileSync(file2, content2);
}
