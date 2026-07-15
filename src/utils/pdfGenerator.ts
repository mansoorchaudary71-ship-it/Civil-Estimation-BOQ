import QRCode from "qrcode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CIVIL_CONSTANTS } from './unitConverter';

// PRO-TIPS DATABASE
const PRO_TIPS = [
  "Pro Tip: Always ensure a water-cement ratio of 0.45 to 0.55 for standard residential slabs to prevent shrinkage cracks.",
  "Pro Tip: Curing concrete for at least 7-14 days significantly increases its final compressive strength.",
  "Pro Tip: When estimating steel, always account for 3-5% wastage due to cutting and overlapping.",
  "Pro Tip: Verify the standard dimensions of local bricks as they form the baseline for mortar calculations.",
  "Pro Tip: For plastering, a dry materials multiplier of 1.33 is essential to compensate for wet shrinkage.",
  "Pro Tip: When performing earthworks, soil bulking can increase excavated volume by 15-20%.",
  "Pro Tip: Proper cover blocks are crucial to prevent reinforcement corrosion in concrete structures."
];

export const formatSpacedText = (str: string): string => {
  if (!str) return "";
  return String(str)
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
    .replace(/([a-zA-Z])(\d)/g, "$1 $2") // split letters from numbers
    .replace(/(\d)([a-zA-Z])/g, "$1 $2") // split numbers from letters
    .replace(/_/g, " ") // replace underscores with spaces
    .replace(/-/g, " ") // replace hyphens with spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim();
};

export const formatCapitalize = (str: string): string => {
  if (!str) return "";
  const spaced = formatSpacedText(String(str));
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const formatTitleCase = (str: string): string => {
  if (!str) return "";
  const spaced = formatSpacedText(String(str));
  return spaced
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const filterValidParameters = (
  params: Record<string, any>
): Record<string, any> => {
  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    // Basic valid check
    if (
      value !== null &&
      value !== undefined &&
      value !== "NaN" &&
      value !== "Infinity"
    ) {
      const isStringAndEmpty = typeof value === "string" && value.trim() === "";
      const isObjectAndEmpty = typeof value === "object" && Object.keys(value).length === 0;
      if (!isStringAndEmpty && !isObjectAndEmpty) {
        filtered[formatCapitalize(key)] = value;
      }
    }
  }
  return filtered;
};

// SVG to Base64 Image string generator for generic charts
export const createDonutChartBase64 = (
  data: { label: string; value: number; color: string }[],
  totalText: string
): Promise<string | null> => {
  return new Promise((resolve) => {
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
    const center = 400,
      radius = 320,
      innerRadius = 200;

    data.forEach((d) => {
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

      if (sliceAngle > 2 * Math.PI - 0.01) {
        svg += `<circle cx="${center}" cy="400" r="${(radius + innerRadius) / 2}" fill="none" stroke="${d.color}" stroke-width="${radius - innerRadius}" />`;
      } else {
        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
        svg += `<path d="${path}" fill="${d.color}" />`;
      }
      currentAngle = nextAngle;
    });

    svg += `</g>
      <text x="${center}" y="380" text-anchor="middle" font-family="helvetica, sans-serif" font-size="40" fill="#64748b" font-weight="bold">Grand Total</text>
      <text x="${center}" y="440" text-anchor="middle" font-family="helvetica, sans-serif" font-size="56" fill="#1e293b" font-weight="bold">${totalText}</text>`;
      
    // Legend drawing
    const legendX = 800;
    let legendY = 400 - (data.length * 25);
    data.forEach(d => {
       if(d.value <= 0) return;
       const pct = ((d.value / total) * 100).toFixed(1);
       svg += `<rect x="${legendX}" y="${legendY - 20}" width="24" height="24" rx="4" fill="${d.color}" />`;
       const formattedLabel = d.label ? formatCapitalize(d.label.replace(/\*/g, '')) : '';
       svg += `<text x="${legendX + 40}" y="${legendY}" font-family="helvetica, sans-serif" font-size="28" fill="#334155" font-weight="bold">${formattedLabel}</text>`;
       svg += `<text x="${legendX + 40 + formattedLabel.length * 16 + 20}" y="${legendY}" font-family="helvetica, sans-serif" font-size="24" fill="#64748b">${pct}%</text>`;
       legendY += 50;
    });

    svg += `</svg>`;

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

export const getDiagramBase64ForTool = (toolId: string): Promise<string | null> => {
  return new Promise((resolve) => {
    // Generate an educational tool specific SVG diagram base64 
    let svg = "";
    if (toolId === "house_estimator_v1") {
       svg = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
         <rect x="100" y="50" width="200" height="120" fill="#f1f5f9" stroke="#6366f1" stroke-width="4"/>
         <polygon points="100,50 200,10 300,50" fill="#indigo" stroke="#6366f1" stroke-width="4" stroke-linejoin="round"/>
         <text x="200" y="110" font-family="sans-serif" font-size="14" fill="#334155" text-anchor="middle">Structure</text>
         <text x="200" y="130" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Covered Area = W × L</text>
       </svg>`;
    } else if (toolId === "concrete_calculator") {
       svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
         <rect x="40" y="40" width="120" height="120" fill="#f1f5f9" stroke="#64748b" stroke-width="3"/>
         <path d="M40 40 L60 20 L180 20 L160 40 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="3"/>
         <path d="M160 40 L180 20 L180 140 L160 160 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="3"/>
         <text x="100" y="100" font-family="sans-serif" font-size="14" fill="#334155" text-anchor="middle">Volume</text>
         <text x="100" y="115" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">L × W × D</text>
       </svg>`;
    } else if (toolId === "bricks_calculator") {
       svg = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
         <rect x="50" y="30" width="100" height="40" fill="#fca5a5" stroke="#b91c1c" stroke-width="3"/>
         <line x1="100" y1="30" x2="100" y2="70" stroke="#b91c1c" stroke-width="3"/>
         <text x="100" y="20" font-family="sans-serif" font-size="12" fill="#7f1d1d" text-anchor="middle">Brick Size</text>
       </svg>`;
    } else {
       return resolve(null); // No specialized diagram
    }

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 200);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

import { GlobalReportEngine } from "./GlobalReportEngine";

export const generateProfessionalPDF = async ({
  title,
  toolId,
  inputs,
  tableData,
  chartData,
  grandTotal,
  branding,
  paperSize,
  theme = "Professional",
}: {
  title: string;
  toolId?: string;
  inputs?: Record<string, any>;
  tableData: any[][];
  chartData?: { label: string; value: number; color: string }[];
  grandTotal: number;
  branding?: { logoBase64?: string; name?: string; email?: string; phone?: string; };
  paperSize?: "a4" | "legal" | "letter";
  theme?: "Professional" | "Minimalist" | "Condensed";
  watermark?: "DRAFT" | "CONFIDENTIAL" | "NONE";
}): Promise<jsPDF> => {
  const cleanInputs = filterValidParameters(inputs || {});
  const boqData = tableData.map(row => {
     let qty = 1;
     let amount = 0;
     let unit = "";
     let itemDesc = String(row[0] || "");
     let rate = 0;
     
     // Detect if it's the 4-element generic scraped array from BottomNavBar: [title, "", "", val]
     if (row.length === 4 && (!row[1] || row[1] === "") && (!row[2] || row[2] === "") && typeof row[3] === 'string') {
        const val = row[3].trim();
        
        let extractedNum = parseFloat(val.replace(/[^0-9.-]+/g, ""));
        let stringParts = val.replace(/[0-9.,-]+/g, "").trim();

        // If it looks like a currency format, it's an amount, not qty.
        if (val.toLowerCase().includes('rs') || val.toLowerCase().includes('₹') || val.toLowerCase().includes('cost') || itemDesc.toLowerCase().includes('cost') || itemDesc.toLowerCase().includes('amount')) {
            amount = isNaN(extractedNum) ? 0 : extractedNum;
            qty = 1;
            unit = "LS";
            rate = amount;
        } else {
            qty = isNaN(extractedNum) ? 0 : extractedNum;
            unit = stringParts;
            amount = 0;
            rate = 0;
        }
     } else {
        // Standard BOQ parsing
        let costStr = String(row[row.length - 1] || "0").replace(/[^0-9.-]+/g, "");
        amount = parseFloat(costStr) || 0;
        let qStr = String(row[1] || "").split('\n')[0];
        let extractedQty = parseFloat(qStr.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(extractedQty) && extractedQty > 0) qty = extractedQty;
        else if (amount > 0) qty = 1;
        
        unit = String(row[2] || "");
        rate = (qty > 0 && amount > 0) ? (amount / qty) : 0;
     }
     
     return {
       category: "",
       itemDescription: itemDesc,
       quantity: qty,
       unit: unit,
       rate: rate,
       amount: amount
     };
  });
  
  const barData = [...(chartData || [])].sort((a, b) => b.value - a.value).slice(0, 5);
  
  const payload = {
    toolName: title,
    metadata: {
      totalEstimatedCost: grandTotal,
      structureType: cleanInputs["Structure Type"] || title,
      ...cleanInputs
    },
    chartData: {
      donut: chartData || [],
      bar: barData
    },
    boqData,
    branding,
    paperSize,
    theme
  };
  
  return await GlobalReportEngine.generatePDF(payload);
};

