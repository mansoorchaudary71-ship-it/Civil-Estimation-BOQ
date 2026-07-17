const fs = require('fs');
let fileStr = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

fileStr = fileStr.replace(
  /"w-full flex flex-col font-sans cursor-pointer transition-all duration-300",/g,
  '"w-full h-full flex flex-col font-sans cursor-pointer transition-all duration-300",'
);

fileStr = fileStr.replace(
  /<h3 className="text-xl font-bold text-slate-900 leading-tight">/g,
  '<h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 min-h-[3.5rem]">'
);

fs.writeFileSync('src/components/ToolCard.tsx', fileStr);
