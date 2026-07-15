const fs = require('fs');
let content = fs.readFileSync('src/context/ProjectContext.tsx', 'utf8');

content = content.replace(/\\\`/g, '\`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/context/ProjectContext.tsx', content);
