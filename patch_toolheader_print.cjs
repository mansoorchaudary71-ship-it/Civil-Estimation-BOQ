const fs = require('fs');

let fileStr = fs.readFileSync('src/components/ui/ToolHeader.tsx', 'utf8');

const newHeaderStr = `return (
    <div id="tool-header-top" className="relative -mx-2 sm:-mx-4 md:-mx-8 px-2 sm:px-4 md:px-8 bg-transparent pb-8 flex flex-col gap-6 pt-6">
      {/* PRINT-ONLY BRANDING HEADER */}
      <div className="hidden print:flex flex-col w-full border-b-2 border-slate-800 pb-4 mb-4">
         <h1 className="text-2xl font-bold text-slate-900 m-0 p-0 leading-tight">Civil Estimation Pro</h1>
         <h2 className="text-lg font-semibold text-slate-700 m-0 mt-1 p-0 leading-tight">{title}</h2>
         {subtitle && <p className="text-sm text-slate-500 m-0 mt-1 p-0 italic">{subtitle}</p>}
      </div>

      <div className="md:max-w-7xl md:mx-auto w-full flex flex-col gap-8 px-4 md:px-0">
        
        {/* Title Header */}
        <div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2 print:hidden">`;

fileStr = fileStr.replace(/return \(\s*<div id="tool-header-top" className="relative -mx-2 sm:-mx-4 md:-mx-8 px-2 sm:px-4 md:px-8 bg-transparent pb-8 flex flex-col gap-6 pt-6">\s*<div className="md:max-w-7xl md:mx-auto w-full flex flex-col gap-8 px-4 md:px-0">\s*\{\/\* Title Header \*\/\}\s*<div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2">/m, newHeaderStr);

fs.writeFileSync('src/components/ui/ToolHeader.tsx', fileStr);
console.log("Patched ToolHeader.tsx");
