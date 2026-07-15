const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let list = fs.readdirSync(dir);
  let results = [];
  list.forEach((file) => {
    let filePath = path.join(dir, file);
    let stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
};

const files = walk('./src/components').filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (content.includes('<ColorfulTab')) {
    let idx = 0;
    // For hardcoded tabs that are not in a map, assign manual indices if we find multiple
    content = content.replace(/<ColorfulTab\s*([^>]*?)>/gs, (match, props) => {
      // If it already has an index, skip
      if (props.includes('index=')) return match;
      
      // We will assign an index and counter++
      let result = `<ColorfulTab index={${idx}} ${props}>`;
      idx++;
      return result;
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', file);
    }
  }
});
