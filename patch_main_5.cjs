const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');
if (!code.includes('initReactivity')) {
  code = code.replace(
    "import { HashRouter } from 'react-router-dom'",
    "import { HashRouter } from 'react-router-dom'\nimport { initReactivity } from './lib/ReactivityEngine'\n\ninitReactivity();"
  );
  fs.writeFileSync('src/main.tsx', code);
}
