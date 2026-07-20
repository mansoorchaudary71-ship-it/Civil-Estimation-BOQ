import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportTableToCSV } from '../../utils/exportUtils';
import * as XLSX from 'xlsx';

interface GenericExportButtonsProps {
  filename?: string;
  tableId?: string;
  data?: { headers: string[]; rows: any[][] };
}

export function GenericExportButtons({ filename = "Export", tableId, data }: GenericExportButtonsProps) {
  
  const handleCSV = () => {
    if (data) {
      exportToCSV(filename, data.headers, data.rows);
    } else if (tableId) {
      exportTableToCSV(tableId, filename);
    } else {
      console.error("Provide data or tableId to export");
    }
  };

  const handleExcel = () => {
    try {
      let wb = XLSX.utils.book_new();
      let ws: XLSX.WorkSheet;

      if (data) {
        const sheetData = [data.headers, ...data.rows];
        ws = XLSX.utils.aoa_to_sheet(sheetData);
      } else if (tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;
        ws = XLSX.utils.table_to_sheet(table);
      } else {
        return;
      }
      
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
      console.error("Excel export failed", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleCSV}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200 active:scale-95"
      >
        <FileText className="w-4 h-4" /> CSV
      </button>
      <button 
        onClick={handleExcel}
        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg transition-colors border border-emerald-200 active:scale-95"
      >
        <FileSpreadsheet className="w-4 h-4" /> Excel
      </button>
    </div>
  );
}
