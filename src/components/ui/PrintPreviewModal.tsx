import React, { useEffect, useRef } from "react";
import { X, Printer } from "lucide-react";
import { createPortal } from "react-dom";

export default function PrintPreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              ${styles}
              <style>
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
              </style>
            </head>
            <body>
              ${rootHtml}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-100 dark:bg-slate-800 w-full max-w-5xl h-full max-h-[90vh] rounded-2xl sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
            <Printer className="w-5 h-5 text-indigo-500" />
            Print Preview
          </h2>
          <div className="flex items-center gap-3">
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
               className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
             >
               <Printer className="w-4 h-4" />
               Confirm Print
             </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content (Paper simulation) */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-950/50 overflow-hidden relative p-4 sm:p-8 flex justify-center items-start overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm overflow-hidden shrink-0 transition-transform duration-300 mx-auto">
            <iframe
              ref={iframeRef}
              id="print-iframe"
              className="w-full h-full min-h-[297mm] border-none bg-white"
              title="Print Preview PDF"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
