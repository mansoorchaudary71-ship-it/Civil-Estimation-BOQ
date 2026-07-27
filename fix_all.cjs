const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/components', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/bg-white/g, 'bg-surface-default');
    content = content.replace(/border-slate-200/g, 'border-ui-borderSubtle');
    content = content.replace(/border-slate-300/g, 'border-ui-borderDefault');
    content = content.replace(/text-slate-900/g, 'text-txt-primary');
    content = content.replace(/text-gray-900/g, 'text-txt-primary');
    content = content.replace(/text-slate-800/g, 'text-txt-primary');
    content = content.replace(/text-gray-800/g, 'text-txt-primary');
    content = content.replace(/text-slate-700/g, 'text-txt-secondary');
    content = content.replace(/text-gray-700/g, 'text-txt-secondary');
    content = content.replace(/text-slate-600/g, 'text-txt-secondary');
    content = content.replace(/text-gray-600/g, 'text-txt-secondary');
    content = content.replace(/text-slate-500/g, 'text-txt-tertiary');
    content = content.replace(/text-gray-500/g, 'text-txt-tertiary');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
