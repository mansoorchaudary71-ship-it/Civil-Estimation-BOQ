const fs = require('fs');
const file = '/app/applet/src/components/modules/UnitConverter.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
const importStatement = 'import { GenericExportButtons } from "../ui/GenericExportButtons";\n';
const lastImportIndex = content.lastIndexOf('import ');
if (lastImportIndex !== -1) {
  const endOfImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
} else {
  content = importStatement + content;
}

// Replace batch result rendering
const oldBatchResultStr = `{isBatchMode ? (
                <div className="w-full bg-white/50  border border-slate-300  rounded-[20px] p-4 text-center font-mono text-sm min-h-[120px] max-h-[200px] overflow-y-auto hide-scrollbar shadow-sm  z-10 flex flex-col gap-1 overflow-hidden">
                   {batchResults.length === 0 ? (
                     <div className="text-slate-500 italic my-auto">Results will appear here</div>
                   ) : (
                     batchResults.map((res, i) => (
                       <div key={i} className="flex justify-between items-center text-slate-700  border-b border-slate-200  pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">
                         <span className="opacity-70">{res.in} <span className="text-[10px] uppercase">{fromUnit}</span></span>
                         <span className="font-bold text-fuchsia-600">{res.out} <span className="text-[10px] uppercase text-fuchsia-600/70">{toUnit}</span></span>
                       </div>
                     ))
                   )}
                </div>
              ) : isCompareMode ? (`

const newBatchResultStr = `{isBatchMode ? (
                <div className="w-full bg-white/50 border border-slate-300 rounded-[20px] p-4 font-mono text-sm min-h-[120px] max-h-[300px] overflow-y-auto hide-scrollbar shadow-sm z-10 flex flex-col gap-2 overflow-hidden relative group">
                   {batchResults.length === 0 ? (
                     <div className="text-slate-500 italic my-auto text-center">Results will appear here</div>
                   ) : (
                     <>
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm border border-slate-200 z-20">
                          <GenericExportButtons tableId="batch-conversion-table" filename="Batch_Conversions" />
                       </div>
                       <table id="batch-conversion-table" className="w-full text-left border-collapse text-xs sm:text-sm">
                         <thead>
                           <tr className="border-b border-slate-200 text-slate-500">
                             <th className="py-2 px-1 font-semibold">Input ({fromUnit})</th>
                             <th className="py-2 px-1 font-semibold text-right">Result ({toUnit})</th>
                           </tr>
                         </thead>
                         <tbody>
                           {batchResults.map((res, i) => (
                             <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                               <td className="py-2 px-1 text-slate-600">{res.in}</td>
                               <td className="py-2 px-1 font-bold text-fuchsia-600 text-right">{res.out}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </>
                   )}
                </div>
              ) : isCompareMode ? (`

content = content.replace(oldBatchResultStr, newBatchResultStr);

fs.writeFileSync(file, content);
console.log('Updated UnitConverter.tsx');
