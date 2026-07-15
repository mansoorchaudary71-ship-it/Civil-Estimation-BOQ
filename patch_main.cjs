const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  '<HelmetProvider>',
  'const helmetContext = {};\n<HelmetProvider context={helmetContext}>'
);

// wait we need to put `const helmetContext = {};` before the render.
fs.writeFileSync('src/main.tsx', content);
