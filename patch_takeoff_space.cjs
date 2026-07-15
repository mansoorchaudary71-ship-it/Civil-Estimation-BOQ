const fs = require('fs');
let content = fs.readFileSync('src/components/modules/Takeoff.tsx', 'utf8');

content = content.replace(
  `if (e.code === "Space" && e.target === document.body)`,
  `if (e.code === "Space" && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')`
);

fs.writeFileSync('src/components/modules/Takeoff.tsx', content);
