const fs = require('fs');
const file = 'src/components/ui/PremiumToolCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const importMotion = `import { motion } from 'framer-motion';\nimport { Compass, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';`;
content = content.replace(`import { Compass, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';`, importMotion);

const oldContainer = `<div className="relative w-full md:max-w-3xl md:mx-auto p-6 md:p-8 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">`;
const newContainer = `<motion.div whileHover={{ scale: 1.01 }} className="relative w-full md:max-w-3xl md:mx-auto p-6 md:p-8 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden transition-shadow hover:shadow-[0_32px_70px_rgba(15,23,42,0.12)] cursor-default">`;
content = content.replace(oldContainer, newContainer);
content = content.replace(/<\/div>\n    <\/div>\n  \);\n}/, `</div>\n    </motion.div>\n  );\n}`);

const oldStatusRing = `<div className="w-full p-6 md:p-8 rounded-[24px] bg-white/80 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex items-center gap-6 group hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all overflow-hidden">`;
const newStatusRing = `<motion.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} className="w-full p-6 md:p-8 rounded-[24px] bg-white/80 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex items-center gap-6 group hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all overflow-hidden cursor-pointer">`;
content = content.replace(oldStatusRing, newStatusRing);
content = content.replace(`          <div className="grid grid-cols-2 gap-4">`, `          </motion.div>\n          <div className="grid grid-cols-2 gap-4">`);
content = content.replace(`            </div>\n          <div className="grid grid-cols-2 gap-4">`, `            </motion.div>\n          <div className="grid grid-cols-2 gap-4">`); // need to fix this properly


fs.writeFileSync(file, content);
console.log('patched preliminary');
