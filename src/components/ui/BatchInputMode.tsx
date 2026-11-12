import { Button } from './/Button';
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
    <div className="bg-surface-hover border border-ui-borderSubtle rounded-2xl p-4 sm:p-6 w-full animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h4 className="font-bold text-lg text-txt-primary">{title}</h4>
          <p className="text-sm text-txt-tertiary">Add multiple rows manualy or upload a CSV template</p>
        </div>
        <div className="flex gap-2">
           <><label htmlFor="a11y-input-579" className="sr-only">Input</label>
<input id="a11y-input-579" type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} /></>
           <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-surface-default border border-ui-borderSubtle text-txt-secondary rounded-xl hover:bg-surface-hover hover:border-ui-borderDefault transition-all shadow-brand-sm">
              <Upload className="w-4 h-4 text-accent-800" /> Upload CSV
           </Button>
           <Button onClick={addRow} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-ink border border-ink text-white rounded-xl hover:bg-ink-600 transition-all shadow-brand-sm">
              <Plus className="w-4 h-4" /> Add Row
           </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-surface-default border border-ui-borderSubtle rounded-xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-ui-borderSubtle bg-surface-hover/50 text-txt-secondary">
              <th className="py-3 px-4 font-semibold w-12text-center">#</th>
              {columns.map(col => (
                <th key={col.id} className="py-3 px-4 font-semibold uppercase text-xs tracking-wider">{col.label}</th>
              ))}
              <th className="py-3 px-4 font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-border-color last:border-0 hover:bg-surface-hover/50 transition-colors">
                <td className="py-3 px-4 text-txt-tertiary font-bold text-xs">{idx + 1}</td>
                {columns.map(col => (
                  <td key={col.id} className="py-2 px-2">
                     {col.type === 'select' ? (
                        <select 
                          value={row[col.id] || ''} 
                          onChange={(e) => updateRow(row.id, col.id, e.target.value)}
                         className="w-full bg-surface-hover border border-ui-borderSubtle rounded-lg px-3 py-2 outline-none focus:border-accent-800 transition-colors font-medium text-txt-secondary"
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
                         className="w-full bg-surface-default border border-ui-borderSubtle rounded-lg px-3 py-2 outline-none focus:border-accent-800 transition-colors font-medium text-txt-secondary"
                       /></>
                     )}
                  </td>
                ))}
                <td className="py-2 px-2 text-right">
                  <Button onClick={() => removeRow(row.id)} className="text-txt-tertiary hover:text-ui-errorText transition-colors p-2 rounded-lg hover:bg-ui-error" title="Remove row">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
           onClick={() => onCalculateTotal(rows)}
           className="flex items-center gap-2 bg-ink text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-brand-sm hover:bg-ink-700 hover:shadow-brand-md transition-all active:scale-[0.98]"
        >
          <Calculator className="w-4 h-4" /> Calculate Batch Totals
        </Button>
      </div>
    </div>
  );
}
