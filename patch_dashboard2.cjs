const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'onSelectModule(id);\n  };',
  'onSelectModule(id, layoutId);\n  };'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Patched Dashboard handleSelect");
