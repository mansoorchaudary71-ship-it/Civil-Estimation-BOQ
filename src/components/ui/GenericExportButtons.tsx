import { Button } from './/Button';
import React from 'react';
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { exportToCSV, exportTableToCSV } from '../../utils/exportUtils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


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

  const handlePDF = () => {
    try {
      // Same data source as CSV/Excel: the `data` prop, or the DOM table
      // when only a tableId was given. Uses the jsPDF + jspdf-autotable
      // stack already used by lib/pdfExport.ts and the calculators.
      let headers: string[] = [];
      let rows: any[][] = [];
      if (data) {
        headers = data.headers;
        rows = data.rows;
      } else if (tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;
        headers = Array.from(table.querySelectorAll("thead th")).map((th) => (th.textContent ?? "").trim());
        rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
          Array.from(tr.querySelectorAll("td")).map((td) => (td.textContent ?? "").trim()),
        );
      } else {
        return;
      }
      const title = filename.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(title, 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Civil Estimation Pro — ${new Date().toLocaleDateString("en-GB")}`, 14, 26);
      autoTable(doc, {
        startY: 34,
        head: [headers.map(String)],
        body: rows.map((r) => r.map((v) => String(v ?? ""))),
        theme: "striped",
        headStyles: { fillColor: [31, 29, 26], textColor: 255, halign: "center" },
        styles: { fontSize: 9 },
      });
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF export failed", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleCSV}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-hover hover:bg-surface-active text-txt-secondary text-sm font-semibold rounded-lg transition-colors border border-ui-borderSubtle active:scale-95"
      >
        <FileText className="w-4 h-4" /> CSV
      </Button>
      <Button 
        onClick={handleExcel}
        className="flex items-center gap-2 px-3 py-1.5 bg-ui-success hover:bg-ui-success text-ui-successText text-sm font-semibold rounded-lg transition-colors border border-ui-successBorder active:scale-95"
      >
        <FileSpreadsheet className="w-4 h-4" /> Excel
      </Button>
      <Button
        onClick={handlePDF}
        className="flex items-center gap-2 px-3 py-1.5 bg-ink hover:bg-ink-700 text-white text-sm font-semibold rounded-lg transition-colors border border-ink active:scale-95"
      >
        <FileDown className="w-4 h-4" /> PDF
      </Button>
    </div>
  );
}
