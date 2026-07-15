import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { BOQItem } from '../context/TakeoffContext';
import { Measurement, calculateLength, calculateArea, convertLength, convertArea } from './measurements';

interface ReportDetails {
  projectName: string;
  projectId: string;
  clientName: string;
  siteLocation: string;
  date: string;
}

const cleanUnit = (u: string) => u.replace(/[²³]/g, '').replace(/sq\.?/g, '').trim().toLowerCase();

export const getMappedQty = (item: BOQItem, measurements: Measurement[], scalePxPerUnit: number, globalUnitName: string) => {
  if (item.isManualOverride) return item.qtyOverride || 0;
  
  if (item.linkedMeasurementIds && item.linkedMeasurementIds.length > 0) {
    let totalVal = 0;
    const fromBase = cleanUnit(globalUnitName);
    const toBase = cleanUnit(item.unit);
    
    item.linkedMeasurementIds.forEach(mId => {
      const m = measurements.find(m => m.id === mId);
      if (m) {
        let val = 0;
        if (m.type === 'line') {
          val = calculateLength(m.points, scalePxPerUnit);
          val = convertLength(val, fromBase, toBase);
        } else if (m.type === 'area') {
          val = calculateArea(m.points, scalePxPerUnit);
          val = convertArea(val, fromBase, toBase);
        }
        totalVal += val;
      }
    });
    return totalVal;
  }
  return item.qtyOverride || 0;
};

import { generateProfessionalPDF, formatCapitalize } from './pdfGenerator';

export const generatePDFReport = async (boqItems: BOQItem[], measurements: Measurement[], scalePxPerUnit: number, globalUnitName: string, details: ReportDetails, currencySymbol: string = "$") => {
  const tableRows: any[] = [];
  let grandTotal = 0;
  const chartData: { label: string; value: number; color: string }[] = [];

  const colors = ["#8b5cf6", "#ec4899", "#0ea5e9", "#10b981", "#f59e0b", "#64748b", "#3b82f6"];

  boqItems.forEach((item, index) => {
    const qty = getMappedQty(item, measurements, scalePxPerUnit, globalUnitName);
    const amount = qty * item.rate;
    grandTotal += amount;
    
    tableRows.push([
      `${item.id} - ${item.desc}`,
      `${qty.toFixed(2)} (@ ${currencySymbol}${item.rate.toFixed(2)})`,
      item.unit,
      amount.toFixed(2)           
    ]);

    if (amount > 0) {
       chartData.push({
          label: formatCapitalize(item.desc),
          value: amount,
          color: colors[index % colors.length]
       });
    }
  });

  const doc = await generateProfessionalPDF({
    title: "Bill of Quantities (BOQ)",
    inputs: {
      "Project Name": details.projectName,
      "Project ID": details.projectId,
      "Client Name": details.clientName,
      "Site Location": details.siteLocation,
      "Date": details.date
    },
    tableData: tableRows,
    chartData: chartData.length > 0 ? chartData : undefined,
    grandTotal
  });

  doc.save(`BOQ_Report_${details.projectId}.pdf`);
};

import { GlobalReportEngine } from "./GlobalReportEngine";

export const generateExcelReport = async (boqItems: BOQItem[], measurements: Measurement[], scalePxPerUnit: number, globalUnitName: string, details: ReportDetails, currencySymbol: string = "$") => {
  let grandTotal = 0;
  const boqData = boqItems.map(item => {
    const qty = getMappedQty(item, measurements, scalePxPerUnit, globalUnitName);
    const amount = qty * item.rate;
    grandTotal += amount;
    return {
      category: "",
      itemDescription: `${item.id} - ${item.desc}`,
      quantity: qty,
      unit: item.unit,
      rate: item.rate,
      amount: amount
    };
  });
  
  const payload = {
    toolName: "Bill of Quantities (BOQ)",
    reportId: details.projectId,
    metadata: {
      totalEstimatedCost: grandTotal,
      projectName: details.projectName,
      clientName: details.clientName,
      siteLocation: details.siteLocation,
      date: details.date
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
  const fileName = `BOQ_Report_${details.projectId}.xlsx`;
  
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
