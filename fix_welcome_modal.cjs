const fs = require('fs');
let content = fs.readFileSync('src/components/ui/WelcomeModal.tsx', 'utf8');

content = content.replace(
  /className="bg-surface-default border border-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col min-h-\[500px\]"/,
  'className="bg-surface-default border border-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in zoom-in-95 duration-200 ease-out transform-gpu"'
);

fs.writeFileSync('src/components/ui/WelcomeModal.tsx', content);

