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

let migratedFilesCount = 0;

for (const file of files) {
  if (file.includes('ui/Button.tsx') || file.includes('ui/Button.jsx')) {
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;

  if (content.includes('<button ') || content.includes('<button>') || content.includes('</button>')) {
    content = content.replace(/<button /g, '<Button ');
    content = content.replace(/<button>/g, '<Button>');
    content = content.replace(/<\/button>/g, '</Button>');
    
    if (!content.includes('import { Button }') && !content.includes('import {Button}')) {
      const fileDir = path.dirname(file);
      const targetDir = path.resolve('./src/components/ui');
      let relativePath = path.relative(fileDir, targetDir);
      
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      const importStatement = `import { Button } from '${relativePath}/Button';\n`;
      
      if (content.includes('import ')) {
        const lines = content.split('\n');
        const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
        lines.splice(lastImportIndex + 1, 0, importStatement);
        content = lines.join('\n');
      } else {
        content = importStatement + content;
      }
    }
    
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    migratedFilesCount++;
    console.log(`Migrated: ${file}`);
  }
}

console.log(`Total files migrated: ${migratedFilesCount}`);
