import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import {
  Share2,
  FileText,
  FileSpreadsheet,
  MessageCircle,
  Mail,
  ChevronDown,
  X,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { GlobalReportEngine } from '../../utils/GlobalReportEngine';
import { formatTitleCase, formatCapitalize, filterValidParameters } from '../../utils/pdfGenerator';
import { CopyButton } from '../ui/CopyButton';

export interface ShareMenuProps {
  activeTab: string;
  data: Record<string, any>;
  title: string;
  triggerClassName?: string;
  triggerContent?: React.ReactNode;
  containerClassName?: string;
  popupPosition?: "top" | "bottom";
  exportFormat?: {
    inputs: Record<string, string>;
    breakdown: Record<string, string>;
    rates?: any;
    cartItem?: any;
    customTableData?: {
      item: string;
      quantityStr: string | number;
      unitStr: string;
      rate?: number | string;
      cost: number;
      color?: string;
    }[];
  };
}
export default function ShareButtonWithPopup({
  activeTab,
  data,
  title,
  triggerClassName,
  triggerContent,
  containerClassName,
  popupPosition = "top",
  exportFormat,
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleOpenShare = () => setIsOpen(true);
    window.addEventListener("open-share-menu", handleOpenShare);
    return () => window.removeEventListener("open-share-menu", handleOpenShare);
  }, []);
  
  const getFileNamePrefix = () => {
    const dateObj = new Date();
    const d = dateObj.getDate().toString().padStart(2, "0");
    const m = dateObj.toLocaleString("en-US", { month: "short" });
    const y = dateObj.getFullYear();
    let hr = dateObj.getHours();
    const min = dateObj.getMinutes().toString().padStart(2, "0");
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12;
    hr = hr ? hr : 12;
    const hrStr = hr.toString().padStart(2, "0");
    const dateStr = `${d}-${m}-${y}`;
    const timeStr = `${hrStr}${min}${ampm}`;
    const prefix = user?.displayName
      ? user.displayName.replace(/\s+/g, "_")
      : "Civil";
    return `${prefix}_Estimate_${dateStr}_${timeStr}`;
  };
  /* Close menu when clicking outside could be added, but a simple toggle is okay for now. */ const formatText =
    () => {
      let txt = `${title}\n\n`;
      Object.entries(filterValidParameters(exportFormat?.inputs || data)).forEach(([key, val]) => {
        txt += `${formatTitleCase(key)}: ${val}\n`;
      });
      txt += `\nBreakdown:\n`;
      Object.entries(exportFormat?.breakdown || data).forEach(([key, val]) => {
         txt += `${formatCapitalize(key.replace(/\*/g, ''))}: ${val}\n`;
      });
      txt += `\nGenerated via Civil Estimation Pro`;
      return txt;
    };
  const handleWhatsAppHTML = () => {
    const text = encodeURIComponent(formatText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setIsOpen(false);
    toast.success("Opened WhatsApp");
  };
  const handleDownloadText = () => {
    const fileName = `${getFileNamePrefix()}.txt`;
    const textBlob = new Blob([formatText()], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(textBlob, fileName);
    setIsOpen(false);
    toast.success(`✅ File saved as ${fileName}`);
  };
  const handleEmailHTML = () => {
    let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f0f0f0; font-family: Helvetica, Arial, sans-serif;"> <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(15,23,42,0.1); overflow: hidden;"> <div style="background-color: #282A65; color: #ffffff; padding: 20px; text-align: center;"> <h1 style="margin: 0; font-size: 24px;">${title}</h1> </div> <div style="padding: 20px;"> <p style="color: #333333; font-size: 16px;">Hello,</p> <p style="color: #333333; font-size: 16px;">Here is the requested estimate for <strong>${title}</strong>.</p> <table style="width: 100%; border-collapse: collapse; margin-top: 20px;"> <thead> <tr> <th style="background-color: #282A65; color: #ffffff; padding: 12px; text-align: left; border: 1px solid #ddd;">Material / Item</th> <th style="background-color: #282A65; color: #ffffff; padding: 12px; text-align: right; border: 1px solid #ddd;">Quantity</th> <th style="background-color: #282A65; color: #ffffff; padding: 12px; text-align: right; border: 1px solid #ddd;">Amount (Rs)</th> </tr> </thead> <tbody>`;
    const cItem = exportFormat?.cartItem as any;
    const customTableData = exportFormat?.customTableData;
    const rates: any = (exportFormat as any)?.rates || {};
    let grandTotal = 0;
    let isEven = false;
    const addRow = (
      item: string,
      qty: number,
      unitLabel: string,
      typeRateId: string,
    ) => {
      if (qty > 0) {
        const cost = qty * (rates[typeRateId] || 0);
        grandTotal += cost;
        const bg = isEven ? "#f9f9f9" : "#ffffff";
        html += ` <tr style="background-color: ${bg};"> <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${item}</td> <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">${qty.toFixed(2)} ${unitLabel}</td> <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">${cost.toFixed(2)}</td> </tr>`;
        isEven = !isEven;
      }
    };
    if (customTableData) {
      customTableData.forEach((row) => {
        const bg = isEven ? "#f9f9f9" : "#ffffff";
        html += ` <tr style="background-color: ${bg};"> <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${row.item}</td> <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">${row.quantityStr} ${row.unitStr}</td> <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">${row.cost.toFixed(2)}</td> </tr>`;
        grandTotal += row.cost;
        isEven = !isEven;
      });
    } else if (cItem) {
      const isSI = cItem.unitVol === "m³";
      addRow("Cement", cItem.cementBags || 0, "Bag", "cement");
      addRow("Sand", cItem.sandVol || 0, cItem.unitVol, "sand");
      addRow("Aggregate", cItem.aggregateVol || 0, cItem.unitVol, "aggregate");
      addRow("Water", isSI ? (cItem.waterLiters || 0) : ((cItem.waterLiters / 3.78541) || 0), isSI ? "L" : "Gal", "water");
      if (cItem.steelKg) addRow("Steel", cItem.steelKg, "kg", "steel");
      if (cItem.bricksCount)
        addRow("Bricks", cItem.bricksCount, "nos", "bricks");
      if (cItem.blocksCount)
        addRow("Blocks", cItem.blocksCount, "nos", "blocks");
    } else {
      Object.entries(exportFormat?.breakdown || data).forEach(([k, v]) => {
        const vLower = String(v).toLowerCase();
        let cost = 0;
        let inferredKey = k.toLowerCase();
        
        if (inferredKey.includes("cement")) inferredKey = "cement";
        else if (inferredKey.includes("sand")) inferredKey = "sand";
        else if (inferredKey.includes("aggregate") || inferredKey.includes("crush")) inferredKey = "aggregate";
        else if (inferredKey.includes("water")) inferredKey = "water";
        else if (inferredKey.includes("steel")) inferredKey = "steel";
        else if (inferredKey.includes("brick")) inferredKey = "bricks";
        else if (inferredKey.includes("block")) inferredKey = "blocks";

        if (rates && rates[inferredKey]) {
          const rawNum = parseFloat(vLower.replace(/[^0-9.-]+/g, "")) || 0;
          cost = rawNum * rates[inferredKey];
        }

        const bg = isEven ? "#f9f9f9" : "#ffffff";
        html += ` <tr style="background-color: ${bg};"> <td style="padding: 10px; border: 1px solid #ddd; color: #333;">${formatCapitalize(k.replace(/\*/g, ''))}</td> <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">${v}</td> <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #333;">${cost > 0 ? cost.toFixed(2) : "-"}</td> </tr>`;
        if (cost > 0) grandTotal += cost;
        isEven = !isEven;
      });
    }
    html += ` <tr> <td colspan="2" style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #E6F0FA; color: #282A65;">Grand Total</td> <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #E6F0FA; color: #282A65;">Rs ${grandTotal.toFixed(2)}</td> </tr> </tbody> </table> <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;"> <a href="#" style="background-color: #282A65; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download Full PDF Report</a> </div> <p style="color: #888888; font-size: 12px; text-align: center; margin-top: 20px;">* This is a system-generated estimate. Actual prices may vary based on market conditions.</p> </div> </div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const fileName = `${getFileNamePrefix()}.html`;
    saveAs(blob, fileName);
    setIsOpen(false);
    toast.success(`✅ File saved as ${fileName}`);
  };
    const getBoqData = () => {
    const boqData: any[] = [];
    let chartData: any[] = [];
    let grandTotal = 0;
    
    const rates: any = (exportFormat as any)?.rates || {};
    const customTableData = exportFormat?.customTableData;
    const cItem = exportFormat?.cartItem as any;
    
    if (customTableData) {
      customTableData.forEach((row) => {
        boqData.push({
          category: "",
          itemDescription: row.item,
          quantity: typeof row.quantityStr === 'string' ? parseFloat(row.quantityStr) || 0 : row.quantityStr,
          unit: row.unitStr,
          rate: typeof row.rate === 'string' ? parseFloat(row.rate) || 0 : (row.rate || 0),
          amount: row.cost
        });
        grandTotal += row.cost;
        chartData.push({ label: row.item, value: row.cost, color: row.color || "#3B82F6" });
      });
    } else if (cItem) {
      const isSI = cItem.unitVol === "m³";
      
      const addRow = (item: string, qty: number, unitLabel: string, typeRateId: string) => {
        if (qty > 0) {
          const rate = rates[typeRateId] || 0;
          const cost = qty * rate;
          boqData.push({
            category: "",
            itemDescription: item,
            quantity: qty,
            unit: unitLabel,
            rate: rate,
            amount: cost
          });
          grandTotal += cost;
          let color = "#cbd5e1";
          if (item.includes("Cement")) color = "#60a5fa";
          else if (item.includes("Sand")) color = "#fbbf24";
          else if (item.includes("Aggregate")) color = "#94a3b8";
          else if (item.includes("Water")) color = "#22d3ee";
          else if (item.includes("Steel")) color = "#818cf8";
          else if (item.includes("Brick")) color = "#f43f5e";
          else if (item.includes("Block")) color = "#fb923c";
          chartData.push({ label: item, value: cost, color });
        }
      };
      
      addRow("Cement", cItem.cementBags || 0, "Bag", "cement");
      addRow("Sand", cItem.sandVol || 0, cItem.unitVol, "sand");
      addRow("Aggregate", cItem.aggregateVol || 0, cItem.unitVol, "aggregate");
      addRow("Water", isSI ? (cItem.waterLiters || 0) : ((cItem.waterLiters / 3.78541) || 0), isSI ? "L" : "Gal", "water");
      if (cItem.steelKg) addRow("Steel", cItem.steelKg, "kg", "steel");
      if (cItem.bricksCount) addRow("Bricks", cItem.bricksCount, "nos", "bricks");
      if (cItem.blocksCount) addRow("Blocks", cItem.blocksCount, "nos", "blocks");
    } else {
      Object.entries(exportFormat?.breakdown || data).forEach(([k, v]) => {
        const vLower = String(v).toLowerCase();
        let cost = 0;
        let rate = 0;
        let inferredKey = k.toLowerCase();
        
        if (inferredKey.includes("cement")) inferredKey = "cement";
        else if (inferredKey.includes("sand")) inferredKey = "sand";
        else if (inferredKey.includes("aggregate") || inferredKey.includes("crush")) inferredKey = "aggregate";
        else if (inferredKey.includes("water")) inferredKey = "water";
        else if (inferredKey.includes("steel")) inferredKey = "steel";
        else if (inferredKey.includes("brick")) inferredKey = "bricks";
        else if (inferredKey.includes("block")) inferredKey = "blocks";

        if (rates && rates[inferredKey]) {
          const rawNum = parseFloat(vLower.replace(/[^0-9.-]+/g, "")) || 0;
          rate = rates[inferredKey];
          cost = rawNum * rate;
        }

        const qty = parseFloat(String(v)) || 0;
        boqData.push({
          category: "",
          itemDescription: k,
          quantity: qty,
          unit: "",
          rate: rate,
          amount: cost
        });
        
        if (cost > 0) {
          grandTotal += cost;
          chartData.push({ label: k, value: cost });
        }
      });
    }

    const barData = [...chartData].sort((a,b) => b.value - a.value).slice(0, 5);
    return { boqData, chartData, barData, grandTotal };
  };

  const getReportPayload = () => {
    const { boqData, chartData, barData, grandTotal } = getBoqData();
    const cleanInputs = filterValidParameters(exportFormat?.inputs || {});
    const coveredAreaObj = cleanInputs["Covered Area"] || cleanInputs["Plot Area"];
    const coveredArea = typeof coveredAreaObj === 'string' ? parseFloat(coveredAreaObj.replace(/[^\d.-]/g, '')) : (coveredAreaObj || 0);
    
    return {
      toolName: title,
      metadata: {
        totalEstimatedCost: grandTotal,
        costPerSqFt: coveredArea > 0 ? (grandTotal / coveredArea) : undefined,
        totalCoveredArea: coveredArea > 0 ? coveredArea : undefined,
        structureType: cleanInputs["Structure Type"] || "Standard",
        ...cleanInputs
      },
      chartData: {
        donut: chartData,
        bar: barData
      },
      boqData
    };
  };

  const generatePDF = async (
    exportType: "pdf" | "whatsapp" | "email" = "pdf",
  ) => {
    try {
      const payload = getReportPayload();
      const doc = await GlobalReportEngine.generatePDF(payload);

      const fileName = `${getFileNamePrefix()}.pdf`;
      if (exportType === "whatsapp" || exportType === "email") {
        const pdfBlob = doc.output("blob");
        const file = new File([pdfBlob], fileName, { type: "application/pdf" });
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              title: title,
              text: "Here is the estimation PDF generated via Civil Estimation Pro.",
              files: [file],
            });
            toast.success("Shared successfully");
            setIsOpen(false);
          } catch (err: any) {
            console.log("Share canceled or failed", err);
          }
        } else {
          toast(
            `Direct file sharing via ${exportType} is not supported. The PDF will be downloaded.`,
            { icon: "ℹ️" },
          );
          doc.save(fileName);
          setIsOpen(false);
          toast.success(`✅ File saved as ${fileName}`);
        }
      } else {
        doc.save(fileName);
        setIsOpen(false);
        toast.success(`✅ File saved as ${fileName}`);
      }
    } catch(e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  };

  const generateExcel = async () => {
    try {
      const payload = getReportPayload();
      const workbook = await GlobalReportEngine.generateExcel(payload);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `${getFileNamePrefix()}.xlsx`;
      saveAs(blob, fileName);
      setIsOpen(false);
      toast.success(`✅ File saved as ${fileName}`);
    } catch(e) {
      console.error(e);
      toast.error('Failed to generate Excel file');
    }
  };
  const handleNativeShareOrMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={containerClassName || "relative inline-flex items-center gap-3 z-[100] font-sans"} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={triggerClassName || "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-900  px-5 py-2.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-teal-500/30 shadow-md flex items-center justify-center gap-2 text-sm"}
        title="Share Results"
      >
        {triggerContent || (
          <>
            <Share2 className="w-4 h-4 group-hover:-translate-y-[1px] transition-transform rounded-full transition-all duration-300 active:scale-95 hover:shadow-lg shadow-sm" />
            <span>Share Results</span>
          </>
        )}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-end sm:justify-center p-4 font-sans pointer-events-auto px-4 sm:px-6">
            <div 
              className="absolute inset-0 bg-slate-50/60 backdrop-blur-[4px]"
              onClick={() => setIsOpen(false)}
            />
            
            <div
              className="relative w-full max-w-[340px] bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.2)] z-10 overflow-hidden font-sans border border-white/50"
              style={{ animation: "modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            >
              <style>{` @keyframes modalPop { 0% { opacity: 0; transform: scale(0.92) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } } `}</style>
              
              <div className="pt-7 pb-5 px-7 flex flex-col items-center text-center relative">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="absolute right-5 top-5 p-2 bg-slate-100/80 hover:bg-slate-200 rounded-full transition-colors text-slate-500 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  <X className="w-4 h-4"/>
                </button>
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                  <Share2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">Export & Share</h3>
                <p className="text-[13px] text-slate-500 font-medium mt-1">Select a format to save or send</p>
              </div>

              <div className="px-6 pb-7 max-h-[70vh] overflow-y-auto hide-scrollbar">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button onClick={handleWhatsAppHTML}
                    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#F0FDF4] hover:shadow-[0_8px_20px_rgba(22,101,52,0.08)] border border-transparent hover:border-[#BBF7D0] active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-[20px] h-[20px]" strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 group-hover:text-emerald-700">WhatsApp</span>
                  </button>

                  <button onClick={handleEmailHTML}
                    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#EFF6FF] hover:shadow-[0_8px_20px_rgba(30,64,175,0.08)] border border-transparent hover:border-[#BFDBFE] active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-[20px] h-[20px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-700">Email</span>
                  </button>

                  <button
                    onClick={() => generatePDF("pdf")}
                    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#FEF2F2] hover:shadow-[0_8px_20px_rgba(153,27,27,0.08)] border border-transparent hover:border-[#FECACA] active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-[20px] h-[20px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 group-hover:text-rose-700 whitespace-nowrap">PDF Report</span>
                  </button>
                  
                  <button onClick={generateExcel}
                    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#ECFCCB] hover:shadow-[0_8px_20px_rgba(63,98,18,0.08)] border border-transparent hover:border-[#D9F99D] active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileSpreadsheet className="w-[20px] h-[20px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 group-hover:text-lime-700 whitespace-nowrap">Excel BOQ</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
                      setIsOpen(false);
                      toast.success("Opened LinkedIn");
                    }}
                    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#F0F9FF] hover:shadow-[0_8px_20px_rgba(3,105,161,0.08)] border border-transparent hover:border-[#BAE6FD] active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Share2 className="w-[20px] h-[20px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700 group-hover:text-sky-700">LinkedIn</span>
                  </button>

                  <button onClick={handleDownloadText}
                    className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)] border border-transparent hover:border-slate-200 active:scale-95 hover:-translate-y-0.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Download className="w-[20px] h-[20px]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-700">Text File</span>
                  </button>
                </div>
                
                <div className="bg-slate-50 p-2 rounded-[20px] border border-slate-200/60">
                  <CopyButton textToCopy={typeof window !== 'undefined' ? window.location.href : 'https://civilestimationpro.com'} />
                </div>
              </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
