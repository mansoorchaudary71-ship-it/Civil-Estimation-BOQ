const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

// Nav buttons
content = content.replace(/hover:text-white hover:underline decoration-2 hover:underline-offset-4/g, 'hover:text-white hover:translate-x-1');

// Version badge
const targetBadge = `<span className="px-2 py-0.5 rounded border border-blue-400/20 bg-blue-400/5 text-blue-300/80 text-[11px] font-mono font-semibold tracking-wider">
              v1.0.0
            </span>`;
const replacementBadge = `<span className="px-2 py-0.5 rounded border border-blue-400/20 bg-blue-400/5 text-blue-300/80 text-[11px] font-mono font-semibold tracking-wider hover:bg-blue-400/10 hover:border-blue-400/40 hover:text-blue-200 transition-all duration-300 cursor-pointer hover:scale-105 inline-block">
              v1.0.0
            </span>`;

content = content.replace(targetBadge, replacementBadge);

fs.writeFileSync('src/components/Footer.tsx', content);
