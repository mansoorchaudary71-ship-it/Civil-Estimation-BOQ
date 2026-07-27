const fs = require('fs');

let content = fs.readFileSync('src/components/HeroSection.tsx', 'utf8');

content = content.replace(
  /className="w-full h-full object-cover"/g,
  'className="w-full h-full object-cover animate-fade-in"'
);

fs.writeFileSync('src/components/HeroSection.tsx', content);

