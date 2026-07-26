const fs = require('fs');
let code = fs.readFileSync('src/components/pages/AboutUs.tsx', 'utf8');

code = code.replace(
  /<h2 className="text-2xl md:text-xl font-bold text-slate-900 dark:text-white mb-6">Our Story<\/h2>/,
  '<h2 id="section-our-story" className="text-2xl md:text-xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>'
);

fs.writeFileSync('src/components/pages/AboutUs.tsx', code);
