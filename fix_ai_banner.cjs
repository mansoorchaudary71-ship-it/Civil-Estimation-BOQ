const fs = require('fs');

let content = fs.readFileSync('src/components/AIEstimatorBanner.tsx', 'utf8');

content = content.replace(
  /<h2 className="text-\[36px\] sm:text-\[44px\] md:text-\[52px\] leading-\[1.05\] font-extrabold text-\[#0a0f25\] dark:text-white tracking-tight mb-6 relative z-10 max-w-2xl mx-auto">/,
  '<h2 className="text-[36px] sm:text-[44px] md:text-[52px] leading-[1.05] font-extrabold text-[#0a0f25] dark:text-white tracking-tight mb-6 relative z-10 max-w-2xl mx-auto animate-float">'
);

fs.writeFileSync('src/components/AIEstimatorBanner.tsx', content);

