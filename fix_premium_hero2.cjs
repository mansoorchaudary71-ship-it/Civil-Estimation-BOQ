const fs = require('fs');

let content = fs.readFileSync('src/components/PremiumHero.tsx', 'utf8');

content = content.replace(
  /10,000\+ Engineers Trust Us/g,
  '<AnimatedCounter end={10000} suffix="+" duration={2.5} className="inline-block" /> Engineers Trust Us'
);

fs.writeFileSync('src/components/PremiumHero.tsx', content);

