const fs = require('fs');
const file = 'vite.config.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('base:')) {
  content = content.replace('plugins: [react()],', 'plugins: [react()],\n  base: "./",');
  fs.writeFileSync(file, content);
  console.log("Patched vite.config.ts");
}
