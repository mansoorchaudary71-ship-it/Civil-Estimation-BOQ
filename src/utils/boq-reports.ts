import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { GlobalReportEngine } from "./GlobalReportEngine";

interface BOQItem {
  id: string;
  division: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

export const generateBOQPDF = async (items: BOQItem[], projectName: string, subtotal: number, contingencyAmt: number, profitAmt: number, overheadsAmt: number, grandTotal: number, currency: string, clientName?: string, preparedBy?: string) => {
  const boqData = items.map(item => {
    return {
      category: item.division,
      itemDescription: item.description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.quantity * item.rate
    };
  });
  
  const payload = {
    toolName: "Bill of Quantities (BOQ)",
    metadata: {
      totalEstimatedCost: grandTotal,
      projectName: projectName,
      clientName: clientName,
      preparedBy: preparedBy,
      subtotal: subtotal,
      contingency: contingencyAmt,
      profit: profitAmt,
      overheads: overheadsAmt,
      date: new Date().toLocaleDateString()
    },
    chartData: {
      donut: boqData.map(d => ({ label: d.itemDescription, value: d.amount })),
      bar: [...boqData].sort((a,b) => b.amount - a.amount).slice(0, 5).map(d => ({ label: d.itemDescription, value: d.amount }))
    },
    boqData
  };

  const doc = await GlobalReportEngine.generatePDF(payload);
  doc.save(`${projectName.replace(/\s+/g, '_')}_BOQ.pdf`);
};

export const generateBOQExcel = async (items: BOQItem[], projectName: string, subtotal: number, contingencyAmt: number, profitAmt: number, overheadsAmt: number, grandTotal: number, currency: string) => {
  const boqData = items.map(item => {
    return {
      category: item.division,
      itemDescription: item.description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.quantity * item.rate
    };
  });
  
  const payload = {
    toolName: "Bill of Quantities (BOQ)",
    metadata: {
      totalEstimatedCost: grandTotal,
      projectName: projectName,
      subtotal: subtotal,
      contingency: contingencyAmt,
      profit: profitAmt,
      overheads: overheadsAmt,
      date: new Date().toLocaleDateString()
    },
    chartData: {
      donut: boqData.map(d => ({ label: d.itemDescription, value: d.amount })),
      bar: [...boqData].sort((a,b) => b.amount - a.amount).slice(0, 5).map(d => ({ label: d.itemDescription, value: d.amount }))
    },
    boqData
  };
  
  const workbook = await GlobalReportEngine.generateExcel(payload);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `${projectName.replace(/\s+/g, '_')}_BOQ.xlsx`;
  
  // @ts-ignore
  if (typeof window !== 'undefined' && typeof window.saveAs !== 'undefined') {
    // @ts-ignore
    window.saveAs(blob, fileName);
  } else {
    // Basic download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
};
