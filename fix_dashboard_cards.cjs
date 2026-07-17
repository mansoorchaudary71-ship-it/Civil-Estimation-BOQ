const fs = require('fs');

let fileStr = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

fileStr = fileStr.replace(
  /<div key=\{mod\.id\} id=\{\`module-card-\$\{mod\.id\}\`\}>/g,
  '<div key={mod.id} id={`module-card-${mod.id}`} className="flex flex-col h-full">'
);

fileStr = fileStr.replace(
  /<div key=\{\`fav-\$\{mod\.id\}\`\} id=\{\`module-card-\$\{mod\.id\}\`\}>/g,
  '<div key={`fav-${mod.id}`} id={`module-card-${mod.id}`} className="flex flex-col h-full">'
);

fs.writeFileSync('src/components/Dashboard.tsx', fileStr);
