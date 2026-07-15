const fs = require('fs');

// Patch App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '<AnimatePresence>',
  '<AnimatePresence mode="wait">'
);
fs.writeFileSync('src/App.tsx', appContent);
console.log("Restored mode=wait");
