const fs = require('fs');

const files = [
  '/app/applet/src/components/Footer.tsx',
  '/app/applet/src/components/ToolPageFooter.tsx',
  '/app/applet/src/components/ui/FooterDisclaimer.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the previous dark slate color with a true Navy Blue
  content = content.replace(/#1d2f3d/g, '#0A2540');
  
  // Update off-white text to a blue-tinted off-white for better harmony with Navy
  content = content.replace(/text-\[#f3f4f6\]/g, 'text-blue-100');
  
  // Also make sure borders are tinted well
  content = content.replace(/border-white\/10/g, 'border-blue-400/20');
  content = content.replace(/border-white\/20/g, 'border-blue-400/30');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
