const fs = require('fs');
let code = fs.readFileSync('src/components/pages/PricingPage.tsx', 'utf8');

code = code.replace(
  /<h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">How much time will you save\?<\/h3>/,
  '<h3 id="section-roi-calculator" className="text-xl font-semibold text-slate-800 dark:text-white mb-2">How much time will you save?</h3>'
);

fs.writeFileSync('src/components/pages/PricingPage.tsx', code);
