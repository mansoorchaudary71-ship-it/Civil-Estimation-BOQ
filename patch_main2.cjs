const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  'ReactDOM.createRoot(document.getElementById(\'root\')!).render(\n  <React.StrictMode>\n    const helmetContext = {};<HelmetProvider context={helmetContext}>',
  'const helmetContext = {};\n\nReactDOM.createRoot(document.getElementById(\'root\')!).render(\n  <React.StrictMode>\n    <HelmetProvider context={helmetContext}>'
);

fs.writeFileSync('src/main.tsx', content);
