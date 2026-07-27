const fs = require('fs');

let content = fs.readFileSync('src/components/PremiumHero.tsx', 'utf8');

if (!content.includes('AnimatedCounter')) {
  content = content.replace(
    /import React from "react";/,
    'import React from "react";\nimport { AnimatedCounter } from "./ui/AnimatedCounter";'
  );
}

// Replace the stats rendering logic
content = content.replace(
  /<h3 className="tabular-nums mb-1 text-lg font-medium text-txt-primary mb-4">\{stat.val\}<\/h3>/g,
  `<h3 className="tabular-nums mb-1 text-lg font-medium text-txt-primary mb-4">
              {stat.val === "40+" ? <AnimatedCounter end={40} suffix="+" duration={2} /> :
               stat.val === "100%" ? <AnimatedCounter end={100} suffix="%" duration={2} /> :
               stat.val === "15+" ? <AnimatedCounter end={15} suffix="+" duration={2} /> :
               stat.val}
            </h3>`
);

// Make the cards animate on hover
content = content.replace(
  /className="w-full flex flex-col items-center p-4 sm:p-6 bg-surface-default rounded-2xl border border-ui-borderSubtle shadow-sm text-center overflow-hidden"/g,
  'className="w-full flex flex-col items-center p-4 sm:p-6 bg-surface-default rounded-2xl border border-ui-borderSubtle shadow-sm hover:shadow-md hover:-translate-y-1 transform-gpu transition-all duration-300 ease-out text-center overflow-hidden"'
);

fs.writeFileSync('src/components/PremiumHero.tsx', content);

