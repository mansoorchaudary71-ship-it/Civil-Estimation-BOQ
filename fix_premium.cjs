const fs = require('fs');

let content = fs.readFileSync('src/components/ui/PremiumToolCard.tsx', 'utf8');

// replace some hardcoded shadow rules with tokens if present, or just leave as is, since standardizing means using standard tokens.
content = content.replace(/border-slate-100/g, 'border-ui-borderSubtle');

fs.writeFileSync('src/components/ui/PremiumToolCard.tsx', content);

