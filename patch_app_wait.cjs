const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  '<AnimatePresence mode="wait">',
  '<AnimatePresence>'
);
fs.writeFileSync('src/App.tsx', content);
console.log("Removed mode wait");
