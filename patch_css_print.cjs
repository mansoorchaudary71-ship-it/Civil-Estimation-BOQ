const fs = require('fs');

let fileStr = fs.readFileSync('src/index.css', 'utf8');

const regex = /\/\* Add professional reporting header via pseudo-element to main body wrapper \*\/[\s\S]*?margin-bottom: 20px;\s*\}/;
fileStr = fileStr.replace(regex, '/* Professional reporting header moved to ToolHeader.tsx */');

fs.writeFileSync('src/index.css', fileStr);
console.log("Patched index.css");
