const fs = require('fs');

let content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

// Use tokens: 
// rounded-2xl (1rem)
// border-ui-borderSubtle
// shadow-sm
// hover effects
content = content.replace(
  /"bg-white relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm",/g,
  `"bg-surface-default relative overflow-hidden rounded-2xl border border-ui-borderSubtle shadow-sm",`
);

content = content.replace(
  /hov \? "shadow-xl border-slate-300 -translate-y-1" : ""/g,
  `hov ? "shadow-lg border-ui-borderDefault -translate-y-1" : ""`
);

content = content.replace(/text-slate-900/g, 'text-txt-primary');
content = content.replace(/text-gray-500/g, 'text-txt-secondary');
content = content.replace(/text-slate-600/g, 'text-txt-secondary');
content = content.replace(/text-gray-400/g, 'text-txt-tertiary');
content = content.replace(/text-slate-400/g, 'text-txt-tertiary');

fs.writeFileSync('src/components/ToolCard.tsx', content);

let premiumContent = fs.readFileSync('src/components/ui/PremiumToolCard.tsx', 'utf8');
premiumContent = premiumContent.replace(/bg-white\/70/g, 'bg-surface-default/90');
premiumContent = premiumContent.replace(/border-white\/60/g, 'border-ui-borderDefault');
premiumContent = premiumContent.replace(/text-slate-900/g, 'text-txt-primary');
premiumContent = premiumContent.replace(/text-slate-500/g, 'text-txt-secondary');
premiumContent = premiumContent.replace(/text-slate-400/g, 'text-txt-tertiary');

fs.writeFileSync('src/components/ui/PremiumToolCard.tsx', premiumContent);

