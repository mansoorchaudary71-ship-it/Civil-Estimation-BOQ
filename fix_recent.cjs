const fs = require('fs');

let content = fs.readFileSync('src/components/RecentEstimates.tsx', 'utf8');

content = content.replace(
  /bg-bg-card/g,
  `bg-surface-default`
);

content = content.replace(
  /shadow-sm hover:shadow-xl/g,
  `shadow-sm hover:shadow-lg border-ui-borderSubtle hover:border-ui-borderDefault`
);

content = content.replace(/text-slate-900/g, 'text-txt-primary');
content = content.replace(/text-slate-800/g, 'text-txt-primary');
content = content.replace(/text-slate-700/g, 'text-txt-secondary');
content = content.replace(/text-slate-600/g, 'text-txt-secondary');
content = content.replace(/text-slate-500/g, 'text-txt-tertiary');
content = content.replace(/text-slate-400/g, 'text-txt-tertiary');

fs.writeFileSync('src/components/RecentEstimates.tsx', content);

