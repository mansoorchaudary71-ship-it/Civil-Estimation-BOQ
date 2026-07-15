import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatNumberMask } from './formatUtils';

export interface BOQData {
  projectName: string;
  date: string;
  items: {
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }[];
  totalAmount: number;
}

export function exportBOQToPDF(data: BOQData) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text('Bill of Quantities (BOQ)', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Project: ${data.projectName}`, 14, 32);
  doc.text(`Date: ${data.date}`, 14, 38);

  // Table
  const tableData = data.items.map(item => [
    item.description,
    formatNumberMask(item.quantity),
    item.unit,
    formatNumberMask(item.rate),
    formatNumberMask(item.amount)
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Description', 'Quantity', 'Unit', 'Rate (PKR)', 'Amount (PKR)']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    foot: [['', '', '', 'Grand Total', formatNumberMask(data.totalAmount)]],
    footStyles: {
      fillColor: [243, 244, 246], // Slate 100
      textColor: [17, 24, 39], // Slate 900
      fontStyle: 'bold',
      halign: 'right'
    }
  });

  doc.save(`${data.projectName.replace(/\s+/g, '_')}_BOQ.pdf`);
}
