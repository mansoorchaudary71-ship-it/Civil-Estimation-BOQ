const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ScrollToTop.tsx', 'utf8');

code = code.replace(
  /aria-label="Scroll to top"/g,
  'aria-label="Scroll to top of section" title="Scroll to Top of Section"'
);

fs.writeFileSync('src/components/ui/ScrollToTop.tsx', code);
