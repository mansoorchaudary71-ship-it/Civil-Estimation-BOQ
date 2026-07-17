const fs = require('fs');
const path = require('path');

const dir = 'src/components/modules';
const files = fs.readdirSync(dir);

let totalReplacedMaxW = 0;
let totalReplacedGrid = 0;

files.forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;

  // 1. Remove restrictive max-width classes and replace with max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8
  // Look for md:max-w-4xl, md:max-w-5xl, md:max-w-6xl, max-w-4xl, etc.
  const maxWidthRegex = /md:max-w-[456]xl|max-w-[456]xl/g;
  if (maxWidthRegex.test(content)) {
    // Only replace it if it's likely a container wrapper (i.e. contains w-full and mx-auto)
    // Actually, it's safer to just replace all `md:max-w-[456]xl md:mx-auto` or similar.
    content = content.replace(/(?:md:)?max-w-[456]xl\s+(?:md:)?mx-auto/g, 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8');
    changed = true;
    totalReplacedMaxW++;
  }

  // 2. Add responsive-tool-grid to the main grid.
  // The main grid is usually `grid grid-cols-1 md:grid-cols-2 gap-8`
  const gridRegex = /className="([^"]*?)grid grid-cols-1 (md|lg):grid-cols-2([^"]*?gap-(6|8|10|12)[^"]*?)"/g;
  if (gridRegex.test(content)) {
    // We already ran this script once, but let's make sure it's applied correctly.
    // If it already has responsive-tool-grid, don't duplicate.
    content = content.replace(/className="([^"]*?)grid grid-cols-1 (md|lg):grid-cols-2([^"]*?gap-(6|8|10|12)[^"]*?)"/g, (match, p1, p2, p3, p4) => {
      if (match.includes('responsive-tool-grid')) return match;
      return `className="${p1}grid grid-cols-1 ${p2}:grid-cols-2${p3} responsive-tool-grid"`;
    });
    changed = true;
    totalReplacedGrid++;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
});

console.log(`Replaced max-w in ${totalReplacedMaxW} files.`);
console.log(`Replaced grid in ${totalReplacedGrid} files.`);
