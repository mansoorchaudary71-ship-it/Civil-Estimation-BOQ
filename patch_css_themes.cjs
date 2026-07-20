const fs = require('fs');
const file = 'src/index.css';
let content = fs.readFileSync(file, 'utf8');

const themeCss = `
/* Theme Overrides */
html.theme-blueprint body {
  @apply bg-blue-900 text-blue-50;
  /* Add blueprint grid background */
  background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
  linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
}
html.theme-blueprint .surface-light, html.theme-blueprint .bg-white, html.theme-blueprint .bg-slate-50, html.theme-blueprint .bg-slate-100 {
  @apply bg-blue-800/80 border-blue-400 text-white !important;
}
html.theme-blueprint .text-slate-900, html.theme-blueprint .text-slate-800, html.theme-blueprint .text-slate-700, html.theme-blueprint .text-slate-600 {
  @apply text-blue-50 !important;
}
html.theme-blueprint .text-indigo-600, html.theme-blueprint .text-indigo-700 {
  @apply text-cyan-300 !important;
}
html.theme-blueprint .bg-indigo-50, html.theme-blueprint .bg-indigo-100 {
  @apply bg-blue-700 !important;
}
html.theme-blueprint .border-slate-200, html.theme-blueprint .border-slate-300 {
  @apply border-blue-600 !important;
}
html.theme-blueprint input, html.theme-blueprint select, html.theme-blueprint textarea {
  @apply bg-blue-950 border-blue-500 text-white placeholder-blue-300 !important;
}

html.theme-modern body {
  @apply bg-zinc-50 text-zinc-900;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
}
html.theme-modern .surface-light, html.theme-modern .bg-white, html.theme-modern .bg-slate-50 {
  @apply bg-white border-zinc-200 text-zinc-900 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
html.theme-modern .rounded-xl, html.theme-modern .rounded-2xl, html.theme-modern .rounded-3xl {
  border-radius: 0 !important;
}
html.theme-modern .text-indigo-600, html.theme-modern .text-indigo-700 {
  @apply text-zinc-900 !important;
}
html.theme-modern .bg-indigo-600, html.theme-modern .bg-indigo-700 {
  @apply bg-zinc-900 text-white !important;
}
html.theme-modern .border-slate-200, html.theme-modern .border-slate-300 {
  @apply border-zinc-300 !important;
}

html.high-contrast body {
  @apply bg-black text-yellow-400;
}
html.high-contrast .surface-light, html.high-contrast .bg-white, html.high-contrast .bg-slate-50, html.high-contrast .bg-slate-100, html.high-contrast .bg-slate-800, html.high-contrast .bg-slate-900 {
  @apply bg-black border-2 border-yellow-400 text-yellow-400 !important;
}
html.high-contrast .text-slate-900, html.high-contrast .text-slate-800, html.high-contrast .text-slate-700, html.high-contrast .text-slate-600, html.high-contrast .text-slate-500 {
  @apply text-yellow-400 !important;
}
html.high-contrast .text-indigo-600, html.high-contrast .text-indigo-700, html.high-contrast .text-blue-600, html.high-contrast .text-purple-600 {
  @apply text-cyan-300 !important;
}
html.high-contrast .bg-indigo-600, html.high-contrast .bg-indigo-700, html.high-contrast .bg-blue-600 {
  @apply bg-yellow-400 text-black border-none !important;
}
html.high-contrast .bg-indigo-50, html.high-contrast .bg-indigo-100 {
  @apply bg-black border-yellow-400 border text-yellow-400 !important;
}
html.high-contrast .border-slate-200, html.high-contrast .border-slate-300 {
  @apply border-yellow-400 !important;
}
html.high-contrast input, html.high-contrast select, html.high-contrast textarea {
  @apply bg-black border-2 border-yellow-400 text-yellow-400 placeholder-yellow-600 !important;
}
html.high-contrast .shadow-sm, html.high-contrast .shadow-md, html.high-contrast .shadow-lg, html.high-contrast .shadow-xl {
  box-shadow: none !important;
}
`;

if (!content.includes('/* Theme Overrides */')) {
    content = content + '\n' + themeCss;
}

fs.writeFileSync(file, content);
console.log('Patched index.css with themes');
