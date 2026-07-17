const fs = require('fs');

let fileStr = fs.readFileSync('src/components/ui/ToolHeader.tsx', 'utf8');

// The Title Header block starts with <div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2">
fileStr = fileStr.replace(
  '<div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2">',
  '<div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2 print:hidden">'
);

fs.writeFileSync('src/components/ui/ToolHeader.tsx', fileStr);
console.log("Patched normal title header to hide on print");
