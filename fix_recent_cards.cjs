const fs = require('fs');
let fileStr = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Use less strict regex, capture the content inside className
fileStr = fileStr.replace(
  /className="relative group bg-\[\#F0F4F8\] rounded-2xl p-4 hover:-translate-y-1\.5 hover:scale-\[1\.02\] transition-all flex flex-col gap-3(.*)"/g,
  'className="relative group bg-[#F0F4F8] rounded-2xl p-4 hover:-translate-y-1.5 hover:scale-[1.02] transition-all flex flex-col gap-3 h-full$1"'
);

fileStr = fileStr.replace(
  /className="w-full mt-2 bg-white\/70 backdrop-blur-md/g,
  'className="w-full mt-auto bg-white/70 backdrop-blur-md'
);

fileStr = fileStr.replace(
  /<h3 className="line-clamp-2 group-hover:text-indigo-900 transition-colors text-lg font-medium text-slate-800 mb-4">/g,
  '<h3 className="line-clamp-2 min-h-[3rem] group-hover:text-indigo-900 transition-colors text-lg font-medium text-slate-800 mb-4">'
);

fs.writeFileSync('src/components/Dashboard.tsx', fileStr);
