const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const helperFunction = `\nexport const formatToolTitle = (title) => title.toLowerCase().endsWith('calculator') ? title : \`\${title} Calculator\`;\n`;

if (!content.includes('const formatToolTitle')) {
  // It's a tsx file, so add type
  const tsHelper = helperFunction.replace('(title)', '(title: string)');
  const importsEnd = content.indexOf('export function App');
  if (importsEnd === -1) {
    const backupIndex = content.indexOf('function App');
    content = content.slice(0, backupIndex) + tsHelper + content.slice(backupIndex);
  } else {
    content = content.slice(0, importsEnd) + tsHelper + content.slice(importsEnd);
  }
}

content = content.replace(/\$\{moduleDef\.title\}\s+Calculator/gi, '${formatToolTitle(moduleDef.title)}');
content = content.replace(/\{moduleDef\.title\}\s+Calculator/gi, '{formatToolTitle(moduleDef.title)}');

fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
