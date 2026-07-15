import React, { useState, useRef } from "react";
import { Upload, Plus, Trash2, Calculator } from "lucide-react";

export interface BatchColumn {
  id: string;
  label: string;
  type: "number" | "text" | "select";
  options?: string[];
  defaultValue?: any;
}

interface BatchInputModeProps {
  columns: BatchColumn[];
  onCalculateTotal: (rows: any[]) => void;
  title?: string;
}

export function BatchInputMode({ columns, onCalculateTotal, title = "Batch Input Mode" }: BatchInputModeProps) {
  const [rows, setRows] = useState<any[]>([{ id: Date.now().toString(), _isValid: false }]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), _isValid: false }]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, colId: string, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [colId]: value } : r));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return; // Needs header + at least 1 row

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newRows = lines.slice(1).map(line => {
        const values = line.split(',');
        const rowData: any = { id: Math.random().toString() };
        
        columns.forEach((col, cIdx) => {
          // Find by matching id or label
          let val = "";
          const idx = headers.findIndex(h => h.includes(col.id.toLowerCase()) || h.includes(col.label.toLowerCase()));
          if (idx !== -1 && values[idx]) {
             val = values[idx];
          } else if (values[cIdx]) {
              // fallback to positional order mapping
             val = values[cIdx];
          }
           
          if (val) {
             if (col.type === 'number') {
               rowData[col.id] = parseFloat(val);
             } else {
               rowData[col.id] = val.trim();
             }
          } else {
             rowData[col.id] = col.defaultValue || '';
          }
        });
        return rowData;
      });

      setRows(newRows);
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-4 sm:p-6 w-full animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h4 className="font-bold text-lg text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">Add multiple rows manualy or upload a CSV template</p>
        </div>
        <div className="flex gap-2">
           <><label htmlFor="a11y-input-579" className="sr-only">Input</label>
<input id="a11y-input-579" type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} /></>
           <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Upload className="w-4 h-4 text-indigo-500" /> Upload CSV
           </button>
           <button onClick={addRow} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-slate-800 border border-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Add Row
           </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600">
              <th className="py-3 px-4 font-semibold w-12text-center">#</th>
              {columns.map(col => (
                <th key={col.id} className="py-3 px-4 font-semibold uppercase text-xs tracking-wider">{col.label}</th>
              ))}
              <th className="py-3 px-4 font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 text-slate-400 font-bold text-xs">{idx + 1}</td>
                {columns.map(col => (
                  <td key={col.id} className="py-2 px-2">
                     {col.type === 'select' ? (
                        <select 
                          value={row[col.id] || ''} 
                          onChange={(e) => updateRow(row.id, col.id, e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors font-medium text-slate-700"
                        >
                          <option value="" disabled>Select...</option>
                          {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     ) : (
                       <><label htmlFor="a11y-input-580" className="sr-only">Input</label>
<input id="a11y-input-580" 
                         type={col.type}
                         value={row[col.id] || ''}
                         placeholder={col.label}
                         onChange={(e) => updateRow(row.id, col.id, e.target.value)}
                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors font-medium text-slate-700"
                       /></>
                     )}
                  </td>
                ))}
                <td className="py-2 px-2 text-right">
                  <button onClick={() => removeRow(row.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50" title="Remove row">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
           onClick={() => onCalculateTotal(rows)}
           className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Calculator className="w-4 h-4" /> Calculate Batch Totals
        </button>
      </div>
    </div>
  );
}
