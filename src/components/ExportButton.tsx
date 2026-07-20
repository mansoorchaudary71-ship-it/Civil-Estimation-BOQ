import React from 'react';
import { Download } from 'lucide-react';
import { exportToCSV, exportTableToCSV } from '../utils/exportUtils';

interface ExportButtonProps {
  filename: string;
  data?: { headers: string[]; rows: any[][] };
  tableId?: string;
  className?: string;
  label?: string;
}

export function ExportButton({ filename, data, tableId, className = '', label = 'Export CSV' }: ExportButtonProps) {
  const handleExport = () => {
    if (data) {
      exportToCSV(filename, data.headers, data.rows);
    } else if (tableId) {
      exportTableToCSV(tableId, filename);
    } else {
      console.error('ExportButton requires either "data" or "tableId" props.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-200 shadow-sm active:scale-95 ${className}`}
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
