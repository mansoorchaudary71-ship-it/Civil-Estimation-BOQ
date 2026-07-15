const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  '    const helmetContext = {};<HelmetProvider context={helmetContext}>',
  '    <HelmetProvider context={helmetContext}>'
);

content = `const helmetContext = {};\n` + content;

fs.writeFileSync('src/main.tsx', content);
