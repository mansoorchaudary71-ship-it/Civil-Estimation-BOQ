const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/components/Footer.tsx', 'utf8');

content = content.replace(
  /className="h-11 px-6 bg-white text-white hover:bg-\[#d4af37\] hover:bg-\[#d4af37\] text-white/g, 
  'className="h-11 px-6 bg-[#d4af37] text-[#1d2f3d] hover:bg-white'
);

fs.writeFileSync('/app/applet/src/components/Footer.tsx', content);
