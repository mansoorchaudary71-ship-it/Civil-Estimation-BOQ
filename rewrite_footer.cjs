const fs = require('fs');

const files = [
  '/app/applet/src/components/Footer.tsx',
  '/app/applet/src/components/ToolPageFooter.tsx',
  '/app/applet/src/components/ui/FooterDisclaimer.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Backgrounds
  content = content.replace(/bg-slate-50/g, 'bg-[#1d2f3d]');
  content = content.replace(/bg-slate-900/g, 'bg-white text-slate-900 hover:bg-[#d4af37]');
  
  // Indigo / accents to Golden #d4af37
  content = content.replace(/text-indigo-600/g, 'text-[#d4af37]');
  content = content.replace(/bg-indigo-600/g, 'bg-[#d4af37]');
  content = content.replace(/shadow-indigo-600\/20/g, 'shadow-[#d4af37]/20');
  content = content.replace(/focus-within:ring-indigo-500\/15/g, 'focus-within:ring-[#d4af37]/30');
  content = content.replace(/focus-within:border-indigo-200/g, 'focus-within:border-[#d4af37]');
  content = content.replace(/border-indigo-100/g, 'border-[#d4af37]');
  content = content.replace(/hover:text-indigo-600/g, 'hover:text-[#d4af37]');
  
  // Text colors
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-500/g, 'text-[#f3f4f6]');
  content = content.replace(/text-slate-400/g, 'text-[#f3f4f6]');
  content = content.replace(/text-slate-600/g, 'text-[#f3f4f6]');
  
  // Borders
  content = content.replace(/border-slate-200\/50/g, 'border-white/10');
  content = content.replace(/border-slate-200\/60/g, 'border-white/10');
  content = content.replace(/border-slate-200/g, 'border-white/20');
  content = content.replace(/border-slate-100/g, 'border-white/20');
  
  // Input wrapper
  content = content.replace(/bg-white rounded-3xl/g, 'bg-white/5 rounded-3xl');
  content = content.replace(/bg-white border/g, 'bg-white/5 border');
  
  fs.writeFileSync(file, content);
  console.log('Updated', file);
});
