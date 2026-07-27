const fs = require('fs');
const path = require('path');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('./src/components', /\.[jt]sx?$/);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // match import { Button } from '...';
  const importRegex = /import\s+\{\s*Button\s*\}\s+from\s+['"][^'"]+['"];?\n?/g;
  
  const matches = content.match(importRegex);
  if (matches && matches.length > 0) {
    const importStmt = matches[0].trim();
    // remove all occurrences
    content = content.replace(importRegex, '');
    // add to top
    content = importStmt + '\n' + content;
    fs.writeFileSync(file, content, 'utf8');
  }
}
