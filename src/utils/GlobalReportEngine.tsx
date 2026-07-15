import React from "react";
import { createRoot } from "react-dom/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { PieChart, Pie, Cell, Legend } from "recharts";

const createDonutBase64React = async (data: any[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement("div");
      container.style.width = "350px";
      container.style.height = "300px";
      container.style.position = "fixed";
      container.style.top = "-9999px";
      container.style.background = "#ffffff";
      document.body.appendChild(container);

      const root = createRoot(container);
      const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

      const mappedData = data.map((d, i) => ({
        ...d,
        name: d.label || d.name || `Item ${i + 1}`
      }));

      const ChartComponent = () => (
        <PieChart width={350} height={300}>
          <Pie
            data={mappedData}
            cx={175}
            cy={130}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            isAnimationActive={false}
          >
            {mappedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend 
            wrapperStyle={{ fontSize: "12px", fontFamily: "helvetica, sans-serif", color: "#1e293b" }}
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
          />
        </PieChart>
      );

      root.render(<ChartComponent />);

      setTimeout(async () => {
        try {
          const canvas = await html2canvas(container, {
            backgroundColor: null,
            scale: 2
          });
          const base64 = canvas.toDataURL("image/png");
          root.unmount();
          document.body.removeChild(container);
          resolve(base64);
        } catch (e) {
          root.unmount();
          if (document.body.contains(container)) document.body.removeChild(container);
          reject(e);
        }
      }, 100);
    } catch (e) {
      reject(e);
    }
  });
};

export interface ReportData {
  toolName: string;
  reportId?: string;
  metadata: {
    totalEstimatedCost: number;
    costPerSqFt?: number;
    totalCoveredArea?: number;
    structureType?: string;
    [key: string]: any;
  };
  chartData: {
    donut: { label: string; value: number; color?: string }[];
    bar: { label: string; value: number; color?: string }[];
  };
  boqData: {
    category?: string;
    itemDescription: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number; // We'll compute this in Excel with formula =Qty*Rate
  }[];
  branding?: {
    logoBase64?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  paperSize?: "a4" | "legal" | "letter";
  theme?: "Professional" | "Minimalist" | "Condensed";
  watermark?: "DRAFT" | "CONFIDENTIAL" | "NONE";
  customHeader?: string;
  showLogo?: boolean;
}

const DEFAULT_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"
];

const generateBarChartBase64 = async (data: { label: string; value: number; color?: string }[]): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!data || data.length === 0) return resolve(null);
    let svg = `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.1" />
        </filter>
      </defs>
      <rect width="800" height="400" fill="#ffffff" />
      <text x="400" y="40" text-anchor="middle" font-family="helvetica, sans-serif" font-size="24" fill="#1e293b" font-weight="bold">Top Costs Breakdown</text>
      <g transform="translate(250, 80)">`;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barHeight = 40;
    const barSpacing = 20;

    data.slice(0, 5).forEach((d, i) => {
      const y = i * (barHeight + barSpacing);
      const width = Math.max(10, (d.value / maxValue) * 450);
      const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

      svg += `<text x="-20" y="${y + barHeight / 2 + 6}" text-anchor="end" font-family="helvetica, sans-serif" font-size="16" fill="#475569" font-weight="bold">${d.label}</text>`;
      svg += `<rect x="0" y="${y}" width="${width}" height="${barHeight}" fill="${color}" rx="6" filter="url(#shadow)" />`;
      svg += `<text x="${width + 15}" y="${y + barHeight / 2 + 6}" font-family="helvetica, sans-serif" font-size="16" fill="#1e293b" font-weight="bold">Rs ${Math.round(d.value).toLocaleString('en-US')}</text>`;
    });

    svg += `</g></svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 400);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export const createDonutChartBase64New = (
  data: { label: string; value: number; color?: string }[],
  totalText: string
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!data || data.length === 0) return resolve(null);
    let svg = `<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.15" />
        </filter>
      </defs>
      <rect width="1200" height="800" fill="#ffffff" />
      <g filter="url(#shadow)">`;
    let total = data.reduce((sum, d) => sum + d.value, 0);
    if (total <= 0) return resolve(null);

    let currentAngle = -Math.PI / 2;
    const center = 400;
    const radius = 320;
    const innerRadius = 200;

    data.forEach((d, i) => {
      if (d.value <= 0) return;
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      const gap = 0.02;
      const drawAngle = Math.max(0, sliceAngle - gap);
      const nextAngle = currentAngle + sliceAngle;

      const x1 = center + radius * Math.cos(currentAngle + gap / 2);
      const y1 = center + radius * Math.sin(currentAngle + gap / 2);
      const x2 = center + radius * Math.cos(currentAngle + gap / 2 + drawAngle);
      const y2 = center + radius * Math.sin(currentAngle + gap / 2 + drawAngle);

      const ix1 = center + innerRadius * Math.cos(currentAngle + gap / 2);
      const iy1 = center + innerRadius * Math.sin(currentAngle + gap / 2);
      const ix2 = center + innerRadius * Math.cos(currentAngle + gap / 2 + drawAngle);
      const iy2 = center + innerRadius * Math.sin(currentAngle + gap / 2 + drawAngle);

      const largeArc = drawAngle > Math.PI ? 1 : 0;
      const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

      if (sliceAngle > 2 * Math.PI - 0.01) {
        svg += `<circle cx="${center}" cy="400" r="${(radius + innerRadius) / 2}" fill="none" stroke="${color}" stroke-width="${radius - innerRadius}" />`;
      } else {
        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
        svg += `<path d="${path}" fill="${color}" />`;
      }
      currentAngle = nextAngle;
    });

    svg += `</g>
      <text x="${center}" y="380" text-anchor="middle" font-family="helvetica, sans-serif" font-size="40" fill="#64748b" font-weight="bold">Total Cost</text>
      <text x="${center}" y="440" text-anchor="middle" font-family="helvetica, sans-serif" font-size="56" fill="#1e293b" font-weight="bold">${totalText}</text>
      
      <g transform="translate(800, 150)">`;

    data.slice(0, 8).forEach((d, i) => {
      if (d.value <= 0) return;
      const y = i * 60;
      const pct = ((d.value / total) * 100).toFixed(1);
      const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

      svg += `<rect x="0" y="${y - 20}" width="24" height="24" rx="6" fill="${color}" />`;
      svg += `<text x="40" y="${y}" font-family="helvetica, sans-serif" font-size="28" fill="#1e293b" font-weight="bold">${d.label}</text>`;
      svg += `<text x="40" y="${y + 30}" font-family="helvetica, sans-serif" font-size="22" fill="#64748b" font-weight="normal">Rs ${Math.round(d.value).toLocaleString('en-US')} (${pct}%)</text>`;
    });

    if (data.length > 8) {
       svg += `<text x="40" y="${8 * 60}" font-family="helvetica, sans-serif" font-size="24" fill="#94a3b8" font-style="italic">...and others</text>`;
    }

    svg += `</g></svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1200, 800);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

export const GlobalReportEngine = {
  
  generatePDF: async (data: ReportData): Promise<jsPDF> => {
    const safeData = data || {} as ReportData;
    const doc = new jsPDF({ format: safeData.paperSize || "a4" });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // 1. Premium Header
    if (safeData.theme === "Minimalist") {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, 45, "F");
      doc.setDrawColor(226, 232, 240);
      doc.line(0, 45, pageWidth, 45);
    } else {
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, pageWidth, 45, "F");
    }

    let qrCodeDataURL = "";
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev.web.app/';
      qrCodeDataURL = await QRCode.toDataURL(currentUrl, {
        margin: 1,
        color: { dark: '#0F172A', light: '#ffffff' }
      });
    } catch (err) {
      console.error(err);
    }

    // Company & Report Title
    doc.setTextColor(safeData.theme === "Minimalist" ? 15 : 255, safeData.theme === "Minimalist" ? 23 : 255, safeData.theme === "Minimalist" ? 42 : 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    let rawTitle = safeData.toolName?.toUpperCase() || 'EXECUTIVE ESTIMATION REPORT';
    rawTitle = rawTitle.replace(/\s*\|\s*CIVIL ESTIMATION PRO/i, "");
    if(rawTitle.length > 35) rawTitle = rawTitle.substring(0, 32) + "...";

    if (safeData.branding) {
       let textX = 14;
       if (safeData.branding.logoBase64 && (safeData.showLogo !== false)) {
         try {
           doc.addImage(safeData.branding.logoBase64, "PNG", 14, 7, 30, 30);
           textX = 50;
         } catch(e) {}
       }
       doc.text(rawTitle, textX, 20);
       doc.setFont("helvetica", "normal");
       doc.setFontSize(10);
       doc.setTextColor(148, 163, 184); 
       doc.text(safeData.branding.name ? `Prepared by: ${safeData.branding.name}` : "Professional Estimator", textX, 28);
       if (safeData.branding.email) {
         doc.text(safeData.branding.email, textX, 34);
       }
    } else {
       doc.text(rawTitle, 14, 20);
       doc.setFont("helvetica", "normal");
       doc.setFontSize(10);
       doc.setTextColor(148, 163, 184); 
       doc.text("Civil Estimation Pro", 14, 28);
    }
    
    doc.setFontSize(9);
    doc.setTextColor(safeData.theme === "Minimalist" ? 100 : 255, safeData.theme === "Minimalist" ? 116 : 255, safeData.theme === "Minimalist" ? 139 : 255);
    doc.text(`Report ID: ${safeData.reportId || 'EST-' + Math.floor(Math.random()*10000)}`, pageWidth - 45, 18, { align: "right" });
    const dateStr = safeData.metadata.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    doc.text(`Date: ${dateStr}`, pageWidth - 45, 26, { align: "right" });

    
    if (safeData.customHeader) {
       doc.setFont("helvetica", "bold");
       doc.setFontSize(14);
       doc.setTextColor(255, 255, 255); // White for dark backgrounds
       doc.text(safeData.customHeader, pageWidth / 2, 40, { align: "center" });
    }
    
    if (qrCodeDataURL) {
      doc.addImage(qrCodeDataURL, "PNG", pageWidth - 36, 7, 30, 30);
    }

    let currentY = 55;

    // 2. 3D Hero Graphic Placeholder & Project Parameters
    currentY = 55;

    // Live Hero Graphic (Donut Chart)
    if (safeData.chartData?.donut?.length > 0) {
      try {
        const donutBase64 = await createDonutBase64React(safeData.chartData.donut);
        if (donutBase64) {
          doc.addImage(donutBase64, 'PNG', 14, currentY, 70, 60);
        }
      } catch (e) {
        console.error("Failed to generate donut chart for PDF hero:", e);
        doc.setFillColor(241, 245, 249); 
        doc.roundedRect(14, currentY, 70, 60, 2, 2, "F");
      }
    } else {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(14, currentY, 70, 60, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("No Cost Data", 49, currentY + 30, { align: "center" });
    }

    // Project Parameters Grid (Right-Aligned next to Hero)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Project Parameters", 90, currentY + 4);

    const ignoreKeys = ['totalEstimatedCost', 'costPerSqFt', 'totalCoveredArea', 'structureType', 'projectName', 'date', 'contingency', 'gst', 'totalCost', 'location', 'preparedBy'];
    const paramsMap = [];
    
    if (safeData.metadata.projectName) paramsMap.push({ label: "Project Name", value: safeData.metadata.projectName });
    if (safeData.metadata.clientName) paramsMap.push({ label: "Client Name", value: safeData.metadata.clientName });
    if (safeData.metadata.location) paramsMap.push({ label: "Location", value: safeData.metadata.location });
    if (safeData.metadata.preparedBy) paramsMap.push({ label: "Prepared By", value: safeData.metadata.preparedBy });
    if (safeData.metadata.structureType) paramsMap.push({ label: "Structure Type", value: safeData.metadata.structureType });
    if (safeData.metadata.totalCoveredArea) paramsMap.push({ label: "Covered Area", value: safeData.metadata.totalCoveredArea + " sq.ft" });
    
    Object.keys(safeData.metadata).forEach(k => {
      if (!ignoreKeys.includes(k) && safeData.metadata[k] !== undefined) {
         const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
         paramsMap.push({ label, value: safeData.metadata[k] });
      }
    });

    const paramColWidth = (pageWidth - 90 - 14) / 2;
    let paramGridY = currentY + 12;
    paramsMap.forEach((param, index) => {
       const col = index % 2;
       const row = Math.floor(index / 2);
       const yPos = paramGridY + (row * 12);
       if (yPos > currentY + 55) return; // limit rows safely
       
       doc.setFont("helvetica", "bold");
       doc.setFontSize(8);
       doc.setTextColor(100, 116, 139); // slate-500
       doc.text(param.label.toUpperCase(), 90 + (col * paramColWidth), yPos);
       
       doc.setFont("helvetica", "bold");
       doc.setFontSize(10);
       doc.setTextColor(15, 23, 42); // slate-900
       
       // Handle long strings
       let strVal = String(param.value);
       if (strVal.length > 25) strVal = strVal.substring(0, 22) + "...";
       doc.text(strVal, 90 + (col * paramColWidth), yPos + 5);
    });

    currentY += 70;

    // 3. Executive Summary text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Executive Summary", 14, currentY);
    currentY += 6;

    let highestDriver = "materials";
    let highestPct = "0.0";
    if (safeData.chartData?.donut?.length > 0) {
      const sorted = [...safeData.chartData.donut].sort((a,b) => b.value - a.value);
      highestDriver = sorted[0].label;
      const total = safeData.metadata.totalEstimatedCost || sorted.reduce((sum, d) => sum + d.value, 0);
      if (total > 0) highestPct = ((sorted[0].value / total) * 100).toFixed(1);
    }
    
    let structureStr = safeData.metadata.structureType || safeData.toolName.replace(/\s*\|\s*Civil Estimation Pro/i, "");
    const areaStr = safeData.metadata.totalCoveredArea ? `${safeData.metadata.totalCoveredArea} sq.ft ` : "";
    const totalEstParams = safeData.metadata.totalEstimatedCost || 0;
    
    let summaryText = `This estimate is prepared for the ${areaStr}${structureStr.trim()}. The total estimated budget is Rs ${Math.round(totalEstParams).toLocaleString()}.`;
    if (totalEstParams > 0 && highestPct !== "0.0") {
       summaryText += ` The primary cost driver is ${highestDriver}, accounting for ${highestPct}% of the overall budget.`;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    
    const splitText = doc.splitTextToSize(summaryText, pageWidth - 28);
    doc.text(splitText, 14, currentY);
    currentY += (splitText.length * 4) + 6;

    // 4 Premium KPI Cards
    const numCards = 4;
    const cardGap = 4;
    const availableWidth = pageWidth - 28;
    const cardWidth = (availableWidth - (cardGap * (numCards - 1))) / numCards;
    
    const drawKpiCard = (idx: number, title: string, value: any) => {
      const x = 14 + (idx * (cardWidth + cardGap));
      
      // Shadow layer
      doc.setFillColor(226, 232, 240); // slate-200
      doc.roundedRect(x + 1, currentY + 1, cardWidth, 20, 1.5, 1.5, "F");
      
      // Card body
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(x, currentY, cardWidth, 20, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(title, x + (cardWidth / 2), currentY + 7, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      
      let finalVal = value;
      if (finalVal.length > 15) finalVal = finalVal.substring(0, 14) + "..";
      doc.text(finalVal, x + (cardWidth / 2), currentY + 14, { align: "center" });
    };

    const formatCapitalize = (str: string) => {
       if (!str) return "";
       return str.charAt(0).toUpperCase() + str.slice(1);
    };

    drawKpiCard(0, "GRAND TOTAL", `Rs ${Math.round(safeData.metadata.totalEstimatedCost || 0).toLocaleString()}`);
    drawKpiCard(1, "COST PER SQ.FT", safeData.metadata.costPerSqFt ? `Rs ${Math.round(safeData.metadata.costPerSqFt).toLocaleString()}` : "N/A");
    drawKpiCard(2, "BUILT-UP AREA", safeData.metadata.totalCoveredArea ? `${safeData.metadata.totalCoveredArea} sq.ft` : "N/A");
    drawKpiCard(3, "MAIN COST DRIVER", formatCapitalize(highestDriver));

    currentY += 28;

    // 4. Data Visualizations
    if (safeData.chartData?.donut?.length > 0 || safeData.chartData?.bar?.length > 0) {
      if (currentY + 50 > pageHeight) {
        doc.addPage();
        currentY = 20;
      }
      
      const totalTxt = `Rs ${Math.round(safeData.metadata.totalEstimatedCost || 0).toLocaleString()}`;
      let donutBase64 = null;
      let barBase64 = null;
      
      if (safeData.chartData?.donut?.length > 0) {
        donutBase64 = await createDonutChartBase64New(safeData.chartData.donut, totalTxt);
      }
      if (safeData.chartData?.bar?.length > 0) {
        barBase64 = await generateBarChartBase64(safeData.chartData.bar);
      }
      
      if (donutBase64 && barBase64) {
         doc.addImage(donutBase64, "PNG", 14, currentY, 85, 56);
         doc.addImage(barBase64, "PNG", 105, currentY, 90, 45);
         currentY += 65;
      } else if (donutBase64) {
         doc.addImage(donutBase64, "PNG", 50, currentY, 110, 73);
         currentY += 80;
      } else if (barBase64) {
         doc.addImage(barBase64, "PNG", 40, currentY, 130, 65);
         currentY += 70;
      }
    }

    // Wrap Table
    const tableBody = (safeData.boqData || []).map((row, index) => {
      const q = row.quantity || 0;
      const r = row.rate || 0;
      const amount = q * r;
      return [
        index + 1,
        row.itemDescription || "",
        q > 0 ? q.toLocaleString(undefined, {maximumFractionDigits: 2}) : "-",
        row.unit || "-",
        r > 0 ? r.toLocaleString() : "-",
        amount > 0 ? amount.toLocaleString() : "-"
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["S.No", "Item Description", "Qty", "Unit", "Rate (Rs)", "Amount (Rs)"]],
      body: tableBody,
      theme: safeData.theme === "Minimalist" ? "plain" : "grid",
      headStyles: {
        fillColor: safeData.theme === "Minimalist" ? [255, 255, 255] : [249, 250, 251],
        textColor: [17, 24, 39],
        font: "helvetica",
        fontStyle: "bold",
        lineWidth: safeData.theme === "Minimalist" ? 0 : 0.1,
        lineColor: [229, 231, 235],
      },
      alternateRowStyles: safeData.theme === "Minimalist" ? undefined : { fillColor: [250, 250, 250] },
      styles: {
        font: "helvetica",
        fontSize: safeData.theme === "Condensed" ? 8 : 9,
        cellPadding: safeData.theme === "Condensed" ? 2 : 4,
        lineColor: [229, 231, 235],
        lineWidth: safeData.theme === "Minimalist" ? 0 : 0.1,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "right", cellWidth: 25 },
        5: { halign: "right", cellWidth: 35, fontStyle: "bold", textColor: [15, 23, 42] },
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || currentY + 10;
    
    const subtotal = safeData.metadata.subtotal || 0;
    const contingency = safeData.metadata.contingency || 0;
    const profit = safeData.metadata.profit || 0;
    const overheads = safeData.metadata.overheads || 0;
    const totalCost = safeData.metadata.totalEstimatedCost || 0;
    
    // Format helpers
    const fAmt = (amt: number) => amt > 0 ? `Rs ${Math.round(amt).toLocaleString()}` : "-";

    const summaryBody = [];
    if (subtotal > 0 && (contingency > 0 || profit > 0 || overheads > 0)) {
       summaryBody.push(["SUBTOTAL", fAmt(subtotal)]);
       if (contingency > 0) summaryBody.push(["CONTINGENCY", fAmt(contingency)]);
       if (overheads > 0) summaryBody.push(["OVERHEADS", fAmt(overheads)]);
       if (profit > 0) summaryBody.push(["CONTRACTOR PROFIT", fAmt(profit)]);
    }
    summaryBody.push(["GRAND TOTAL", fAmt(totalCost)]);

    autoTable(doc, {
      startY: finalY,
      body: summaryBody,
      theme: "plain",
      styles: { font: "helvetica", fontSize: 11, cellPadding: 4 },
      willDrawCell: function(data: any) {
        if (data.row.index === summaryBody.length - 1) {
           doc.setFont("helvetica", "bold");
           doc.setFontSize(13);
           doc.setTextColor(232, 84, 26);
        } else {
           doc.setFont("helvetica", "normal");
           doc.setTextColor(15, 23, 42);
        }
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [15, 23, 42], halign: "right" },
        1: { halign: "right", fontStyle: "bold", cellWidth: 45 },
      },
      margin: { left: 14, right: 14 },
    });

    let disclaimerY = (doc as any).lastAutoTable.finalY + 15;
    if (disclaimerY + 30 > pageHeight) {
      doc.addPage();
      disclaimerY = 20;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Terms & Conditions / Disclaimer", 14, disclaimerY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const textLines = [
      "1. This is a system-generated estimation report and is provided for informational and planning purposes only.",
      "2. Estimated costs are based on average current market rates and standard construction assumptions. Actual local market rates may vary.",
      "3. This estimate is exclusive of hidden ground conditions, architectural specialized finishes, and unforeseen structural changes.",
      "4. Always verify structural designs, loads, and final BOQ with a certified professional Structural Engineer before execution."
    ];
    doc.text(textLines, 14, disclaimerY + 6);
    
    // Add page numbers and dynamic footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      
      const proTipPool = [
        "Pro Tip: Ensure a water-cement ratio of 0.45-0.55 to prevent shrinkage cracks.",
        "Pro Tip: Proper curing for 7-14 days significantly increases concrete strength.",
        "Pro Tip: Always account for 3-5% wastage when estimating steel reinforcement.",
        "Pro Tip: Apply a dry materials multiplier of 1.54 for concrete and 1.33 for mortar.",
        "Pro Tip: Ensure proper soil compaction before laying raft foundations or footings."
      ];
      const randomTip = proTipPool[Math.floor(Math.random() * proTipPool.length)];
      
      doc.text(randomTip, 14, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    
    if (safeData.watermark && safeData.watermark !== "NONE") {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(80);
        doc.setTextColor(230, 230, 230);
        doc.setFont("helvetica", "bold");
        doc.text(safeData.watermark, pageWidth / 2, pageHeight / 2, {
          angle: 45,
          align: "center",
          baseline: "middle",
        });
      }
    }
    return doc;
  },

  generateExcel: async (data: ReportData): Promise<ExcelJS.Workbook> => {
     const safeData = data || {} as ReportData;
     const workbook = new ExcelJS.Workbook();
     workbook.creator = 'Civil Estimation Pro';
     workbook.lastModifiedBy = 'Civil Estimation Pro';
     workbook.created = new Date();
     workbook.modified = new Date();

     // Tab 1: Executive Dashboard
     const dashSheet = workbook.addWorksheet('Executive Dashboard', { views: [{ showGridLines: false }] });
     
     dashSheet.getColumn("B").width = 30;
     dashSheet.getColumn("C").width = 25;

     // Header
     dashSheet.mergeCells("B2:E3");
     const titleCell = dashSheet.getCell("B2");
     let rawTitle = safeData.toolName?.toUpperCase() || 'EXECUTIVE ESTIMATION REPORT';
     rawTitle = rawTitle.replace(/\s*\|\s*CIVIL ESTIMATION PRO/i, "");
     titleCell.value = rawTitle;
     titleCell.font = { name: 'Arial', size: 24, bold: true, color: { argb: 'FFFFFFFF' } };
     titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
     titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
     
     const headerRight = dashSheet.getCell("D2");
     // style merge background
     for(let col = 2; col <= 6; col++) {
        dashSheet.getCell(2, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
        dashSheet.getCell(3, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
     }
     
     const dateCell = dashSheet.getCell("B5");
     dateCell.value = `Generated: ${safeData.metadata.date || new Date().toLocaleDateString()}`;
     dateCell.font = { italic: true, color: { argb: 'FF64748B' } };

     dashSheet.getCell("B7").value = "Executive Summary";
     dashSheet.getCell("B7").font = { bold: true, size: 14, color: { argb: 'FF0F172A' } };
     
     // Project Parameters
     const ignoreKeys = ['totalEstimatedCost', 'costPerSqFt', 'subtotal', 'totalCoveredArea', 'structureType', 'projectName', 'date', 'contingency', 'gst', 'profit', 'overheads', 'totalCost', 'location', 'preparedBy'];
     const paramsMap: {label: string; value: any}[] = [];
     
     if (safeData.metadata.projectName) paramsMap.push({ label: "Project Name", value: safeData.metadata.projectName });
     if (safeData.metadata.clientName) paramsMap.push({ label: "Client Name", value: safeData.metadata.clientName });
     if (safeData.metadata.location) paramsMap.push({ label: "Location", value: safeData.metadata.location });
     if (safeData.metadata.preparedBy) paramsMap.push({ label: "Prepared By", value: safeData.metadata.preparedBy });
     if (safeData.metadata.structureType) paramsMap.push({ label: "Structure Type", value: safeData.metadata.structureType });
     if (safeData.metadata.totalCoveredArea) paramsMap.push({ label: "Covered Area", value: safeData.metadata.totalCoveredArea + " sq.ft" });
     
     Object.keys(safeData.metadata).forEach(k => {
       if (!ignoreKeys.includes(k) && safeData.metadata[k] !== undefined) {
          const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          paramsMap.push({ label, value: safeData.metadata[k] });
       }
     });

     let startRow = 9;
     paramsMap.forEach((p, idx) => {
         const row = startRow + idx;
         dashSheet.getCell(`B${row}`).value = p.label;
         dashSheet.getCell(`B${row}`).font = { bold: true, color: { argb: 'FF64748B' } };
         dashSheet.getCell(`C${row}`).value = p.value;
         dashSheet.getCell(`C${row}`).font = { bold: true, color: { argb: 'FF0F172A' } };
     });
     
     startRow = startRow + paramsMap.length + 1;

     let highestDriver = "Materials";
     if (safeData.chartData?.donut?.length > 0) {
       const sorted = [...safeData.chartData.donut].sort((a,b) => b.value - a.value);
       highestDriver = sorted[0].label;
     }

     const subtotalOffset = safeData.metadata.subtotal > 0 && (safeData.metadata.contingency > 0 || safeData.metadata.profit > 0 || safeData.metadata.overheads > 0);
     if (subtotalOffset) {
        dashSheet.getCell(`B${startRow}`).value = "Subtotal";
        dashSheet.getCell(`C${startRow}`).value = safeData.metadata.subtotal;
        dashSheet.getCell(`C${startRow}`).numFmt = '"Rs "#,##0';
        startRow++;
        
        if (safeData.metadata.contingency > 0) {
           dashSheet.getCell(`B${startRow}`).value = "Contingency";
           dashSheet.getCell(`C${startRow}`).value = safeData.metadata.contingency;
           dashSheet.getCell(`C${startRow}`).numFmt = '"Rs "#,##0';
           startRow++;
        }
        if (safeData.metadata.overheads > 0) {
           dashSheet.getCell(`B${startRow}`).value = "Overheads";
           dashSheet.getCell(`C${startRow}`).value = safeData.metadata.overheads;
           dashSheet.getCell(`C${startRow}`).numFmt = '"Rs "#,##0';
           startRow++;
        }
        if (safeData.metadata.profit > 0) {
           dashSheet.getCell(`B${startRow}`).value = "Contractor Profit";
           dashSheet.getCell(`C${startRow}`).value = safeData.metadata.profit;
           dashSheet.getCell(`C${startRow}`).numFmt = '"Rs "#,##0';
           startRow++;
        }
     }

     const grandTotalStart = startRow;
     dashSheet.getCell(`B${grandTotalStart}`).value = "Grand Total";
     
     if ((safeData.metadata.totalEstimatedCost || 0) > 0) {
       dashSheet.getCell(`C${grandTotalStart}`).value = safeData.metadata.totalEstimatedCost;
       dashSheet.getCell(`C${grandTotalStart}`).numFmt = '"Rs "#,##0';
     } else {
       dashSheet.getCell(`C${grandTotalStart}`).value = "N/A";
     }
     dashSheet.getCell(`C${grandTotalStart}`).font = { bold: true, size: 12, color: { argb: 'FFE8541A' } };

     dashSheet.getCell(`B${grandTotalStart+1}`).value = "Cost per Sq.Ft";
     if ((safeData.metadata.costPerSqFt || 0) > 0) {
       dashSheet.getCell(`C${grandTotalStart+1}`).value = safeData.metadata.costPerSqFt;
       dashSheet.getCell(`C${grandTotalStart+1}`).numFmt = '"Rs "#,##0';
     } else {
       dashSheet.getCell(`C${grandTotalStart+1}`).value = "N/A";
     }
     dashSheet.getCell(`C${grandTotalStart+1}`).font = { bold: true, size: 12 };

     dashSheet.getCell(`B${grandTotalStart+2}`).value = "Built-Up Area";
     dashSheet.getCell(`C${grandTotalStart+2}`).value = safeData.metadata.totalCoveredArea ? `${safeData.metadata.totalCoveredArea} sq.ft` : "N/A";
     dashSheet.getCell(`C${grandTotalStart+2}`).font = { bold: true, size: 12 };

     dashSheet.getCell(`B${grandTotalStart+3}`).value = "Primary Cost Driver";
     dashSheet.getCell(`C${grandTotalStart+3}`).value = highestDriver;
     dashSheet.getCell(`C${grandTotalStart+3}`).font = { bold: true, size: 12 };

     // For formatting borders and backgrounds
     for(let r=9; r<=grandTotalStart+3; r++) {
         const cellB = dashSheet.getCell(`B${r}`);
         const cellC = dashSheet.getCell(`C${r}`);
         cellB.border = { bottom: {style:'thin', color:{argb:'FFE2E8F0'}} };
         cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFF8FAFC'} };
         cellC.border = { bottom: {style:'thin', color:{argb:'FFE2E8F0'}} };
     }

     const discRowStart = grandTotalStart + 6;
     dashSheet.getCell(`B${discRowStart}`).value = "Terms & Conditions / Disclaimer";
     dashSheet.getCell(`B${discRowStart}`).font = { bold: true, size: 12, color: { argb: 'FF0F172A' } };
     
     const terms = [
       "1. This is a system-generated estimation report and is provided for informational and planning purposes only.",
       "2. Estimated costs are based on average current market rates and standard construction assumptions.",
       "3. This estimate is exclusive of hidden ground conditions, specialized finishes, and structural changes.",
       "4. Always verify designs and BOQ with a certified professional Structural Engineer before execution."
     ];
     terms.forEach((term, idx) => {
         dashSheet.getCell(`B${discRowStart + 1 + idx}`).value = term;
         dashSheet.getCell(`B${discRowStart + 1 + idx}`).font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
     });

     // If charts exist, embed the donut chart dynamically on the right
     if (safeData.chartData?.donut?.length > 0) {
       try {
         const donutBase64 = await createDonutChartBase64New(safeData.chartData.donut, `Rs ${Math.round(safeData.metadata.totalEstimatedCost || 0).toLocaleString()}`);
         if (donutBase64) {
           const imageId = workbook.addImage({
             base64: donutBase64.replace(/^data:image\/png;base64,/, ""),
             extension: 'png',
           });
           dashSheet.addImage(imageId, {
             tl: { col: 4, row: 7 },
             ext: { width: 550, height: 366 }
           });
         }
       } catch (e) { console.error("Could not append image to excel", e); }
     }

     // Tab 2: Detailed BOQ
     const boqSheet = workbook.addWorksheet('Detailed BOQ', { views: [{ state: 'frozen', ySplit: 1 }] });
     
     boqSheet.columns = [
       { header: 'S.No', key: 'sno', width: 10 },
       { header: 'Item Description', key: 'desc', width: 45 },
       { header: 'Unit', key: 'unit', width: 12 },
       { header: 'Quantity', key: 'qty', width: 15 },
       { header: 'Rate (Rs)', key: 'rate', width: 18 },
       { header: 'Amount (Rs)', key: 'amt', width: 22 }
     ];

     const headerRow = boqSheet.getRow(1);
     headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
     headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Deep blue/slate
     headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
     headerRow.height = 30;

     (safeData.boqData || []).forEach((row, index) => {
       const rowNum = index + 2;
       const excelRow = boqSheet.addRow({
         sno: index + 1,
         desc: row.itemDescription,
         unit: row.unit,
         qty: row.quantity,
         rate: row.rate,
       });

       const amtCell = excelRow.getCell(6);
       amtCell.value = { formula: `D${rowNum}*E${rowNum}`, result: (row.quantity || 0) * (row.rate || 0) } as any;
       
       excelRow.getCell(4).numFmt = '#,##0.00';
       excelRow.getCell(5).numFmt = '"Rs "#,##0';
       amtCell.numFmt = '"Rs "#,##0';

       if (index % 2 === 1) {
         excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
       }
     });

           const lastRow = (safeData.boqData?.length || 0) + 1;
      
      const addFooterRow = (title: string, value: any, isGrandTotal = false) => {
         const row = boqSheet.addRow({
           cat: '',
           desc: title,
           unit: '',
           qty: '',
           rate: '',
         });
         row.font = { bold: true, size: isGrandTotal ? 12 : 11, color: { argb: 'FF0F172A' } };
         const cellAmt = row.getCell(6);
         cellAmt.value = value;
         cellAmt.numFmt = '"Rs "#,##0';
         if (isGrandTotal) cellAmt.font = { bold: true, color: { argb: 'FFE8541A' } };
      };

      if (subtotalOffset) {
         addFooterRow('SUBTOTAL', { formula: `SUM(F2:F${lastRow})` });
         if (safeData.metadata.contingency > 0) addFooterRow('CONTINGENCY', safeData.metadata.contingency);
         if (safeData.metadata.overheads > 0) addFooterRow('OVERHEADS', safeData.metadata.overheads);
         if (safeData.metadata.profit > 0) addFooterRow('CONTRACTOR PROFIT', safeData.metadata.profit);
         addFooterRow('GRAND TOTAL', safeData.metadata.totalEstimatedCost, true);
      } else {
         addFooterRow('GRAND TOTAL', { formula: `SUM(F2:F${lastRow})` }, true);
      }

      return workbook;
  }
};
