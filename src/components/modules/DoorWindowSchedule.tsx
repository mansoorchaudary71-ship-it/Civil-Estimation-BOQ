import React, { useState } from 'react';
import { Columns, Save } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';

interface Entry {
  id: string;
  type: string;
  w: number;
  h: number;
  qty: number;
  notes: string;
}

export default function DoorWindowSchedule() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: '1', type: 'D1 (Main)', w: 1.2, h: 2.1, qty: 1, notes: 'Solid Wood' },
    { id: '2', type: 'D2 (Room)', w: 0.9, h: 2.1, qty: 3, notes: 'Flush Door' },
    { id: '3', type: 'W1 (Living)', w: 1.5, h: 1.2, qty: 2, notes: 'UPVC Sliding' }
  ]);

  const addEntry = () => {
    setEntries([...entries, { id: Date.now().toString(), type: 'New', w: 1, h: 1, qty: 1, notes: '' }]);
  };

  const updateEntry = (id: string, field: keyof Entry, val: any) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  // Convert to CSV for export
  const downloadCSV = () => {
    let csv = "ID,Type/Mark,Width (m),Height (m),Area (sqm),Quantity,Total Area (sqm),Lintel Length (m),Notes\n";
    entries.forEach((e, idx) => {
       const area = e.w * e.h;
       const lintelLength = e.w + 0.3; // minimum bearing 150mm each side
       csv += `\${idx+1},"\${e.type}",\${e.w},\${e.h},\${area.toFixed(2)},\${e.qty},\${(area*e.qty).toFixed(2)},\${lintelLength.toFixed(2)},"\${e.notes}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Door_Window_Schedule.csv';
    a.click();
  };

  return (
    <div className="w-full md:max-w-5xl md:mx-auto space-y-6 px-4 md:px-0">
       <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
         <div className="flex justify-between items-center mb-6">
           <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
             <Columns className="w-6 h-6 text-teal-500" />
             Door & Window Schedule Generator
           </h2>
           <button onClick={downloadCSV} className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 px-4 py-2 rounded-full transition flex items-center gap-2 text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
             <Save className="w-4 h-4"/> Export CSV
           </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border-y border-slate-200 overflow-hidden">
                   <th className="p-3 text-base font-medium">Mark</th>
                   <th className="p-3 text-base font-medium">Width (m)</th>
                   <th className="p-3 text-base font-medium">Height (m)</th>
                   <th className="p-3 text-base font-medium">Qty</th>
                   <th className="p-3 text-base font-medium">Area (sqm)</th>
                   <th className="p-3 text-base font-medium">Req. Lintel (m)</th>
                   <th className="p-3 text-base font-medium">Notes</th>
                   <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(e => (
                   <tr key={e.id}>
                     <td className="p-2">
                        <><label htmlFor="a11y-input-212" className="sr-only">Input</label>
<input id="a11y-input-212" type="text" value={e.type} onChange={(ev)=>updateEntry(e.id, 'type', ev.target.value)} className="w-[120px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-full text-sm" /></>
                     </td>
                     <td className="p-2">
                        <><label htmlFor="a11y-input-213" className="sr-only">Input</label>
<input id="a11y-input-213" type="number" inputMode="decimal" step="0.1" value={e.w} onChange={(ev)=>updateEntry(e.id, 'w', parseFloat(ev.target.value)||0)} className="w-[80px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-full text-sm" /></>
                     </td>
                     <td className="p-2">
                        <><label htmlFor="a11y-input-214" className="sr-only">Input</label>
<input id="a11y-input-214" type="number" inputMode="decimal" step="0.1" value={e.h} onChange={(ev)=>updateEntry(e.id, 'h', parseFloat(ev.target.value)||0)} className="w-[80px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-full text-sm" /></>
                     </td>
                     <td className="p-2">
                        <><label htmlFor="a11y-input-215" className="sr-only">Input</label>
<input id="a11y-input-215" type="number" inputMode="decimal" value={e.qty} onChange={(ev)=>updateEntry(e.id, 'qty', parseInt(ev.target.value)||0)} className="w-[60px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-full text-sm" /></>
                     </td>
                     <td className="p-2 text-base font-medium">
                        {((e.w * e.h) * e.qty).toFixed(2)}
                     </td>
                     <td className="p-2 text-sm font-mono text-slate-500">
                        {(e.w + 0.3).toFixed(2)}
                     </td>
                     <td className="p-2">
                        <><label htmlFor="a11y-input-216" className="sr-only">Input</label>
<input id="a11y-input-216" type="text" value={e.notes} onChange={(ev)=>updateEntry(e.id, 'notes', ev.target.value)} className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-full text-sm" /></>
                     </td>
                     <td className="p-2">
                        <button onClick={()=>setEntries(entries.filter(x=>x.id!==e.id))} className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">✕</button>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
         </div>
         <div className="mt-4">
            <button onClick={addEntry} className="text-teal-600 bg-teal-50 px-4 py-2 rounded-full hover:bg-teal-100 transition text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              + Add Item
            </button>
         </div>
       </div>
    
      <CalculationHistory calculatorId="doorwindowschedule_tool" currentInputs={{}} />
</div>
  );
}
