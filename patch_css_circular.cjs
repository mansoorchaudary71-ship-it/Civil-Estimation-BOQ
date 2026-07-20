const fs = require('fs');
const file = 'src/index.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'html.theme-modern .surface-light, html.theme-modern .bg-white, html.theme-modern .bg-slate-50 {\n  @apply bg-white border-zinc-200 text-zinc-900 !important;',
  'html.theme-modern .surface-light, html.theme-modern .bg-white, html.theme-modern .bg-slate-50 {\n  background-color: #ffffff !important;\n  @apply border-zinc-200 text-zinc-900 !important;'
);

fs.writeFileSync(file, content);
console.log('Patched circular dep');
