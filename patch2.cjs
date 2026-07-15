const fs = require('fs');
const content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');
let newContent = content.replace(
  /"rounded-\[28px\] rounded-tl-\[64px\]"/g,
  '"rounded-[32px]"'
);

// Fix the OPEN button styling
newContent = newContent.replace(
  /style=\{\{\s*backgroundColor: colorToUse\.startsWith\('rgba'\)\s*\?\s*colorToUse\.replace\(\/\[\\d\.\]\+\\\)\$\/, '0\.3\)'\)\s*:\s*colorToUse === '#F4F1EA' \? '#EAE0CD'\s*:\s*colorToUse === '#F0F5FF' \? '#D9E4FF'\s*:\s*colorToUse === '#EFF6F1' \? '#D4EBD9'\s*:\s*colorToUse === '#f8fafc' \? '#e2e8f0'\s*:\s*colorToUse\s*\}\}/g,
  `style={{ backgroundColor: colorToUse.startsWith('rgba') ? colorToUse.replace('0.15)', '0.3)') : colorToUse === '#F4F1EA' ? '#EBE4D5' : colorToUse === '#F0F5FF' ? '#DFE9FC' : colorToUse === '#EFF6F1' ? '#E1EFE4' : colorToUse === '#f8fafc' ? '#f1f5f9' : colorToUse }}`
);

// Ensure OPEN button text is dark
newContent = newContent.replace(
  /className="text-slate-800 rounded-full px-7 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-300 hover:opacity-90 active:scale-95"/g,
  'className="text-slate-900 rounded-full px-8 py-3 text-[13px] font-bold tracking-wider uppercase transition-all duration-300 hover:opacity-90 active:scale-95"'
);

fs.writeFileSync('src/components/ToolCard.tsx', newContent);
