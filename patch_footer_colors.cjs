const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

// Replacements
content = content.replace(/bg-\[#051120\]\/80/g, 'bg-slate-950');
content = content.replace(/border-blue-900\/50/g, 'border-slate-800/60');
content = content.replace(/via-blue-400\/30/g, 'via-slate-400/20');
content = content.replace(/via-blue-400\/20/g, 'via-slate-400/10');
content = content.replace(/bg-blue-600\/10/g, 'bg-slate-800/20');
content = content.replace(/group-hover:to-blue-200/g, 'group-hover:to-slate-300');
content = content.replace(/text-blue-100\/80/g, 'text-slate-300');
content = content.replace(/text-blue-100\/70/g, 'text-slate-400');
content = content.replace(/text-blue-100\/60/g, 'text-slate-400');
content = content.replace(/text-blue-100\/50/g, 'text-slate-500');
content = content.replace(/text-blue-200\/50/g, 'text-slate-500');
content = content.replace(/text-blue-200\/40/g, 'text-slate-500');
content = content.replace(/placeholder-blue-200\/30/g, 'placeholder-slate-600');
content = content.replace(/bg-\[#0A1A2F\]\/60/g, 'bg-slate-900');
content = content.replace(/bg-\[#0A1A2F\]\/40/g, 'bg-slate-900/60');
content = content.replace(/hover:bg-\[#0A1A2F\]\/70/g, 'hover:bg-slate-800/80');
content = content.replace(/focus-within:bg-\[#0A1A2F\]\/60/g, 'focus-within:bg-slate-800');
content = content.replace(/text-\[#051120\]/g, 'text-slate-950');
content = content.replace(/from-blue-400/g, 'from-slate-400');
content = content.replace(/text-blue-400/g, 'text-slate-400');
content = content.replace(/bg-blue-400/g, 'bg-slate-400');
content = content.replace(/border-blue-400\/20/g, 'border-slate-800');
content = content.replace(/border-blue-400\/10/g, 'border-slate-800/50');
content = content.replace(/border-blue-400\/30/g, 'border-slate-700');
content = content.replace(/border-blue-400\/40/g, 'border-slate-600');
content = content.replace(/bg-blue-400\/5/g, 'bg-slate-800/30');
content = content.replace(/bg-blue-400\/10/g, 'bg-slate-800/60');
content = content.replace(/text-blue-300\/80/g, 'text-slate-300');
content = content.replace(/text-blue-300/g, 'text-slate-300');
content = content.replace(/text-blue-200/g, 'text-slate-200');
content = content.replace(/bg-blue-500\/10/g, 'bg-slate-800');

fs.writeFileSync('src/components/Footer.tsx', content);
