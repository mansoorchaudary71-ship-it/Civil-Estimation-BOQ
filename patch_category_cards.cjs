const fs = require('fs');
const file = 'src/components/ui/ToolCategoryCards.tsx';
let content = fs.readFileSync(file, 'utf8');

const importMotion = `import { motion } from 'framer-motion';\nimport { Blocks, MountainSnow, Box, Hammer } from 'lucide-react';`;
content = content.replace(`import { Blocks, MountainSnow, Box, Hammer } from 'lucide-react';`, importMotion);

const oldCard = `<div className="w-full group relative flex flex-col justify-between w-56 h-56 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer shrink-0 overflow-hidden">`;
const newCard = `<motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} className="w-full group relative flex flex-col justify-between w-56 h-56 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 cursor-pointer shrink-0 overflow-hidden hover:shadow-md">`;

content = content.replace(oldCard, newCard);
content = content.replace(`</div>\n  );\n}\n\nconst CATEGORIES`, `</motion.div>\n  );\n}\n\nconst CATEGORIES`);

fs.writeFileSync(file, content);
console.log('Category cards patched');
