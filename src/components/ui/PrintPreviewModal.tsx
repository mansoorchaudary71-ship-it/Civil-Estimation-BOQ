import React, { useEffect, useRef, useState } from "react";
import { X, Printer, Download, Loader2, LayoutTemplate } from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PrintPreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'modern' | 'minimalist' | 'detailed'>('modern');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [watermark, setWatermark] = useState<'none' | 'draft' | 'confidential'>('none');
  const [showVersionStamp, setShowVersionStamp] = useState(false);
  const [revision, setRevision] = useState(() => localStorage.getItem('pdf_revision') || '1.0');
  const [author, setAuthor] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeBreakdowns, setIncludeBreakdowns] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(true);

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        
        // Extract all styles to apply inside the iframe
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(el => {
            if (el.tagName.toLowerCase() === 'style') {
              // Replace @media print with @media all to force print-specific styles (like Tailwind's print:*) on screen
              const css = el.innerHTML.replace(/@media\s+print/g, '@media all');
              return `<style>${css}</style>`;
            }
            return el.outerHTML;
          }).join('\n');
          
        // Clone the root container which has all the tool content
        const rootHtml = document.getElementById("root")?.innerHTML || "";
        
        
        let themeStyles = '';
        if (pdfTheme === 'minimalist') {
          themeStyles = `
            body { font-family: 'Inter', sans-serif !important; color: #333 !important; }
            * { border-color: #ddd !important; border-radius: 0 !important; box-shadow: none !important; background-color: transparent !important; }
            h1, h2, h3, h4, h5, h6 { color: #111 !important; font-weight: 400 !important; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
            .bg-slate-50, .bg-white, .bg-indigo-50, .bg-blue-50 { background-color: transparent !important; }
            .shadow-sm, .shadow-md, .shadow-lg { shadow: none !important; }
            .text-indigo-600, .text-blue-600, .text-emerald-600, .text-amber-500, .text-rose-600 { color: #333 !important; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-full { border-radius: 0 !important; }
          `;
        } else if (pdfTheme === 'detailed') {
          themeStyles = `
            body { font-family: 'JetBrains Mono', monospace !important; font-size: 10px !important; line-height: 1.3 !important; color: #000 !important; }
            h1, h2, h3, h4, h5, h6 { font-size: 14px !important; font-weight: bold !important; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000; padding-bottom: 2px; }
            * { border-color: #999 !important; border-radius: 0 !important; box-shadow: none !important; }
            .p-4, .p-5, .p-6, .p-8 { padding: 8px !important; }
            .gap-4, .gap-6, .gap-8 { gap: 8px !important; }
            .mb-4, .mb-6, .mb-8 { margin-bottom: 8px !important; }
            .mt-4, .mt-6, .mt-8 { margin-top: 8px !important; }
            .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-[clamp(1.25rem,4cqw,2.5rem)] { font-size: 16px !important; }
            .text-sm { font-size: 10px !important; }
            .text-xs { font-size: 9px !important; }
            .rounded-xl, .rounded-2xl, .rounded-3xl, .rounded-full { border-radius: 0 !important; border: 1px solid #ccc !important; }
          `;
        } else {
          // modern
          themeStyles = `
            body { font-family: 'Inter', sans-serif !important; }
            .tool-card { border-top: 4px solid #4f46e5 !important; }
            h1, h2 { color: #1e293b !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
          `;
        }
        
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              ${styles}
              <style>
                @page { size: A4 ${orientation}; }
                
                /* Watermark Styling */
                ${watermark !== 'none' ? `
                body::before {
                  content: "";
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  pointer-events: none;
                  z-index: 9999;
                  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='120' fill='rgba(0,0,0,0.04)' transform='rotate(-45, 400, 500)'>${watermark.toUpperCase()}</text></svg>");
                  background-repeat: repeat;
                  background-position: center center;
                }
                ` : ''}
                
                /* Force a consistent paper-like base styling */
                html, body {
                  background-color: white !important;
                  color: black !important;
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: auto;
                  min-height: 100%;
                }
                
                /* Ensure print utilities are forced actively */
                .print\\:hidden, .no-print {
                  display: none !important;
                }
                .print\\:block {
                  display: block !important;
                }
                .print\\:flex {
                  display: flex !important;
                }
                
                /* Override any dark mode classes inside the iframe */
                .dark {
                  background-color: white !important;
                  color: black !important;
                }
                
                /* Disable scrolling traps from the app layout */
                body, #root, main, .overflow-y-auto, .overflow-hidden {
                  overflow: visible !important;
                  height: auto !important;
                  max-height: none !important;
                }
                
                /* Add some breathing room simulating page margins */
                body {
                  padding: 2rem !important;
                  box-sizing: border-box;
                }
                
                
                /* Visibility Toggles */
                ${!includeCharts ? `
                .recharts-wrapper, .chart-container, [class*="recharts"], canvas, .echarts-for-react, svg.recharts-surface {
                  display: none !important;
                }
                ` : ''}
                ${!includeBreakdowns ? `
                table, .boq-table-print-breaks, .itemized-breakdown {
                  display: none !important;
                }
                ` : ''}
                ${!includeLogo ? `
                img[alt*="logo"], .company-logo {
                  display: none !important;
                }
                ` : ''}
                
                ${themeStyles}
  
              </style>
            </head>
            <body>
              ${showVersionStamp ? `
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; font-family: sans-serif; font-size: 11px; color: #555; display: flex; justify-content: space-between;" class="no-print-override">
                  <span><strong>Rev:</strong> ${revision}</span>
                  <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
                  <span><strong>Author:</strong> ${author || 'System'}</span>
                </div>
              ` : ''}
              ${rootHtml}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [isOpen, pdfTheme, orientation, watermark, showVersionStamp, revision, author, includeCharts, includeBreakdowns, includeLogo]);

  // Handle escape key to close modal
  useEffect(() => {
    localStorage.setItem('pdf_revision', revision);
  }, [revision]);
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  
  const handleDownloadPDF = async () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    
    setIsGenerating(true);
    toast.loading('Generating high-quality PDF...', { id: 'pdf-toast', position: 'bottom-center' });
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = iframeRef.current.contentDocument.body;
      
      // Try to get a meaningful title for the file name
      const titleElement = document.querySelector('h1') || document.querySelector('h2.text-xl');
      const title = titleElement ? (titleElement.textContent || '').trim().replace(/\s+/g, '_') : 'Project_Estimate';
      
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number], // top, left, bottom, right
        filename: `${title}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
      };
      
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded successfully!', { id: 'pdf-toast', position: 'bottom-center' });
      
      // Auto-increment revision if it's a number-like string (e.g. 1.0 -> 1.1 or 1 -> 2)
      setRevision(prev => {
        const numMatch = prev.match(/(\d+)(\.\d+)?$/);
        if (numMatch) {
          const fullMatch = numMatch[0];
          const isDecimal = !!numMatch[2];
          if (isDecimal) {
             const parts = fullMatch.split('.');
             parts[1] = (parseInt(parts[1], 10) + 1).toString();
             return prev.substring(0, numMatch.index) + parts.join('.');
          } else {
             return prev.substring(0, numMatch.index) + (parseInt(fullMatch, 10) + 1).toString();
          }
        }
        return prev;
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF', { id: 'pdf-toast', position: 'bottom-center' });
    } finally {
      setIsGenerating(false);
    }
  };

  
  // Render null if not in browser to avoid SSR issues
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 sm:p-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="bg-slate-100 dark:bg-slate-800 w-full max-w-5xl h-full max-h-[90vh] rounded-2xl sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 relative"
          >
            {/* Animated shimmer effect on modal load */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '100%', opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-50"
            />

        
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
            <Printer className="w-5 h-5 text-indigo-500" />
            Print Preview
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center group hidden xl:flex gap-2 mr-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={showVersionStamp} onChange={e => setShowVersionStamp(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Stamp
              </label>
              {showVersionStamp && (
                <>
                  <input type="text" value={revision} onChange={e => setRevision(e.target.value)} placeholder="Rev" className="w-12 px-2 py-1 text-xs border rounded bg-white border-slate-200" title="Revision Number" />
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="w-20 px-2 py-1 text-xs border rounded bg-white border-slate-200" title="Author Name" />
                </>
              )}
            </div>
            <div className="relative flex items-center group hidden lg:flex">
              <select
                value={watermark}
                onChange={(e) => setWatermark(e.target.value as any)}
                className="block w-full pl-4 pr-8 py-2.5 text-sm border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors appearance-none cursor-pointer"
              >
                <option value="none">No Watermark</option>
                <option value="draft">DRAFT</option>
                <option value="confidential">CONFIDENTIAL</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <div className="relative flex items-center group hidden md:flex">
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="block w-full pl-4 pr-8 py-2.5 text-sm border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors appearance-none cursor-pointer"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <div className="relative flex items-center group hidden sm:flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LayoutTemplate className="w-4 h-4 text-slate-400" />
              </div>
              <select
                value={pdfTheme}
                onChange={(e) => setPdfTheme(e.target.value as any)}
                className="block w-full pl-9 pr-8 py-2.5 text-sm border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors appearance-none cursor-pointer"
              >
                <option value="modern">Modern Theme</option>
                <option value="minimalist">Minimalist</option>
                <option value="detailed">Detailed (Tech)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
             <button
               onClick={handleDownloadPDF}
               disabled={isGenerating}
               className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
             >
               {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
               <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download PDF'}</span>
               <span className="sm:hidden">PDF</span>
             </button>
             
             <button
               onClick={() => {
                  const iframe = iframeRef.current;
                  if (iframe && iframe.contentWindow) {
                     // Trigger the print dialog inside the iframe
                     iframe.contentWindow.print();
                  } else {
                     window.print();
                  }
               }}
               className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
             >
               <Printer className="w-4 h-4" />
               <span className="hidden sm:inline">Print Report</span>
               <span className="sm:hidden">Print</span>
             </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-6 overflow-y-auto flex-shrink-0 flex flex-col gap-6 hidden md:flex">
            <div>
               <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Print Settings</h3>
               <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-slate-700 font-medium">Include Charts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeBreakdowns} onChange={e => setIncludeBreakdowns(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-slate-700 font-medium">Itemized Breakdowns</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeLogo} onChange={e => setIncludeLogo(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-slate-700 font-medium">Company Logo</span>
                  </label>
               </div>
            </div>
          </div>
  
{/* Content (Paper simulation) */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-950/50 overflow-hidden relative p-4 sm:p-8 flex justify-center items-start overflow-y-auto hide-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
            className={`w-full bg-white shadow-xl rounded-sm overflow-hidden shrink-0 transition-all duration-500 mx-auto ${orientation === 'portrait' ? 'max-w-[210mm] min-h-[297mm]' : 'max-w-[297mm] min-h-[210mm]'}`}
          >
            <iframe
              ref={iframeRef}
              id="print-iframe"
              className={`w-full h-full border-none bg-white ${orientation === 'portrait' ? 'min-h-[297mm]' : 'min-h-[210mm]'}`}
              title="Print Preview PDF"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  </motion.div>
  )}
  </AnimatePresence>,
  document.body
);
}
