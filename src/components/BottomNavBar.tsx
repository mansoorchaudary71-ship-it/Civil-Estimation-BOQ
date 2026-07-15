import { useState, useEffect } from "react";
import { Home, Clock, Save, Share2, Printer, X, MessageCircle, Mail, Copy, FileDown } from "lucide-react";
import toast from "react-hot-toast";

export default function BottomNavBar({
  activeModule,
  onNavigate,
  onOpenHistory,
}: {
  activeModule: string;
  onNavigate: (module: string) => void;
  onOpenHistory: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Do NOT appear on the home/landing page or other non-tool static pages
  const isStaticPage = [
    "home",
    "about",
    "careers",
    "contact",
    "blog",
    "pricing",
    "privacy",
    "terms",
    "cookies",
  ].includes(activeModule || "home");

  if (isStaticPage) {
    return null;
  }

  const handlePrint = () => {
    // Adding no-print class handling if needed, or rely on global CSS
    window.dispatchEvent(new CustomEvent('global-print-action'));
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-toast" });
      const { generateProfessionalPDF } = await import('../utils/pdfGenerator');
      
      const inputs: any = { "Generated At": new Date().toLocaleString() };
      const tableData: any[][] = [];
      let totalCost = 0;
      
      const resultCards = document.querySelectorAll('h4');
      resultCards.forEach(h4 => {
         const title = h4.textContent?.trim() || "";
         const titleLower = title.toLowerCase();
         if (titleLower.includes('visual breakdown') || titleLower.includes('quick facts')) return;
         
         const parent = h4.closest('div.relative');
         if(parent) {
             const valueEl = parent.querySelector('span.text-\\[clamp\\(1\\.75rem\\,5vw\\,2\\.5rem\\)\\]');
             if(valueEl) {
                 let val = valueEl.textContent?.trim() || "";
                 const unitEl = parent.querySelector('span.shrink-0');
                 if(unitEl && unitEl.textContent) {
                     val += " " + unitEl.textContent.trim();
                 }
                 if((titleLower.includes('total') && titleLower.includes('cost')) || titleLower.includes('estimated cost')) {
                    const extractedNum = parseFloat(val.replace(/[^0-9.]/g, ''));
                    if(!isNaN(extractedNum)) totalCost = extractedNum;
                 } else {
                     tableData.push([title, "", "", val]);
                 }
             }
         }
      });
      // Try resolving custom event data if tools provide it overrides
      const customPayload = (window as any).__GLOBAL_PDF_PAYLOAD;
      if(customPayload && customPayload.tableData) {
          const doc = await generateProfessionalPDF(customPayload);
          doc.save(customPayload.filename || `Estimate_${activeModule}.pdf`);
          toast.success("PDF Downloaded Successfully", { id: "pdf-toast" });
          setIsShareOpen(false);
          return;
      }

      if(tableData.length === 0) {
          toast.error("No estimation data found to print.", { id: "pdf-toast" });
          return;
      }

      const doc = await generateProfessionalPDF({
        title: document.title || "Estimation Report",
        toolId: activeModule,
        inputs,
        tableData,
        grandTotal: totalCost
      });
      doc.save(`Estimate_${activeModule}.pdf`);
      toast.success("PDF Downloaded", { id: "pdf-toast" });
      setIsShareOpen(false);
    } catch(err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    }
  };

  const handleSave = async () => {
    try {
      toast.loading("Saving estimate...", { id: "save-toast" });
      const { saveEstimate } = await import('../lib/estimates');
      
      const tableData: any[][] = [];
      let totalCost = 0;
      
      const resultCards = document.querySelectorAll('h4');
      resultCards.forEach(h4 => {
         const title = h4.textContent?.trim() || "";
         const parent = h4.closest('div.relative');
         if(parent) {
             const valueEl = parent.querySelector('span.text-\\[clamp\\(1\\.75rem\\,5vw\\,2\\.5rem\\)\\]');
             if(valueEl) {
                 let val = valueEl.textContent?.trim() || "";
                 const unitEl = parent.querySelector('span.shrink-0');
                 if(unitEl && unitEl.textContent) val += " " + unitEl.textContent.trim();
                 
                 if(title.toLowerCase().includes('cost')) {
                    totalCost = parseFloat(val.replace(/[^0-9.]/g, '')) || totalCost;
                 } else {
                     tableData.push([title, "", "", val]);
                 }
             }
         }
      });

      const payloadUrlData = (window as any).__GLOBAL_PDF_PAYLOAD;
      
      const payloadToSave = payloadUrlData || {
        calculatorId: activeModule,
        tableData,
        grandTotal: totalCost
      };

      await saveEstimate(`Estimate for ${activeModule}`, payloadToSave, "material_calculation");
      toast.success("Saved to My Estimates", { id: "save-toast" });
    } catch(err) {
      console.error(err);
      toast.error("Failed to save estimate", { id: "save-toast" });
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
      setIsShareOpen(false);
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home", action: () => onNavigate("home"), color: "text-blue-600" },
    { id: "history", icon: Clock, label: "History", action: onOpenHistory, color: "text-blue-600" },
    { id: "save", icon: Save, label: "Save", action: handleSave, color: "text-emerald-600" },
    { id: "share", icon: Share2, label: "Share", action: handleShare, color: "text-purple-600" },
    { id: "print", icon: Printer, label: "Print", action: handlePrint, color: "text-slate-600" },
  ];

  return (
    <>
      <div
        className="w-full fixed z-50 md:hidden flex justify-around items-center h-[60px] left-0 right-0 bottom-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-8px_32px_rgba(15,23,42,0.12)] overflow-hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive ? "bg-slate-50/5 " : "hover:bg-slate-50/5 "
              }`}
            >
              <item.icon 
                className={`w-[22px] h-[22px] ${item.color} ${isActive ? "opacity-100 scale-110" : "opacity-80"}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className={`text-base font-medium tracking-tight ${isActive ? "text-slate-900 " : "text-slate-600 "}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {isShareOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans px-4 sm:px-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
          <div 
            className="absolute inset-0 bg-slate-50/60 backdrop-blur-[4px]"
            onClick={() => setIsShareOpen(false)}
          />
          <div
            className="relative w-full max-w-[340px] bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.2)] z-10 overflow-hidden font-sans border border-white/50"
            style={{ animation: "modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            <style>{` @keyframes modalPop { 0% { opacity: 0; transform: scale(0.92) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } } `}</style>
            
            <div className="pt-7 pb-5 px-7 flex flex-col items-center text-center relative">
              <button 
                onClick={() => setIsShareOpen(false)} 
                className="absolute right-5 top-5 p-2 bg-slate-100/80 hover:bg-slate-200 rounded-full transition-colors text-slate-500 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                <X className="w-4 h-4"/>
              </button>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                <Share2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">Share Result</h3>
              <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">Send this calculation to yourself or others</p>
            </div>

            <div className="px-6 pb-7 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  let resultText = "Check out this calculation tool: ";
                  const resultCards = document.querySelectorAll('h4');
                  if (resultCards.length > 0) {
                      let breakdown = "";
                      resultCards.forEach((h4, idx) => {
                          if (idx > 4) return;
                          const title = h4.textContent?.trim() || "";
                          const parent = h4.closest('div.relative');
                          if(parent) {
                              const valueEl = parent.querySelector('span.text-\\[clamp\\(1\\.75rem\\,5vw\\,2\\.5rem\\)\\]');
                              if (valueEl) {
                                  let val = valueEl.textContent?.trim() || "";
                                  const unitEl = parent.querySelector('span.shrink-0');
                                  if(unitEl && unitEl.textContent) val += " " + unitEl.textContent.trim();
                                  breakdown += `${title}: ${val}\n`;
                              }
                          }
                      });
                      if (breakdown) resultText = encodeURIComponent(`Check out my calculation result:\n\n${breakdown}\n\nLink: `);
                  }
                  window.open(`https://wa.me/?text=${resultText}${url}`, "_blank");
                  setIsShareOpen(false);
                }}
                className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#F0FDF4] hover:shadow-[0_8px_20px_rgba(22,101,52,0.08)] border border-transparent hover:border-[#BBF7D0] active:scale-95 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-[20px] h-[20px] fill-current" strokeWidth={1} />
                </div>
                <span className="text-base font-medium group-hover:text-emerald-700">WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  const titleStr = encodeURIComponent(document.title);
                  let resultText = encodeURIComponent(`Check out this calculation tool: ${window.location.href}`);
                  // ... logic ...
                  // omitted to keep small but wait I should put the same logic
                  const resultCards = document.querySelectorAll('h4');
                  if (resultCards.length > 0) {
                      let breakdown = "";
                      resultCards.forEach((h4, idx) => {
                          if (idx > 4) return;
                          const title = h4.textContent?.trim() || "";
                          const parent = h4.closest('div.relative');
                          if(parent) {
                              const valueEl = parent.querySelector('span.text-\\[clamp\\(1\\.75rem\\,5vw\\,2\\.5rem\\)\\]');
                              if (valueEl) {
                                  let val = valueEl.textContent?.trim() || "";
                                  const unitEl = parent.querySelector('span.shrink-0');
                                  if(unitEl && unitEl.textContent) val += " " + unitEl.textContent.trim();
                                  breakdown += `${title}: ${val}\n`;
                              }
                          }
                      });
                      if (breakdown) resultText = encodeURIComponent(`Check out my calculation result:\n\n${breakdown}\n\nLink: ${window.location.href}`);
                  }
                  window.open(`mailto:?subject=${titleStr}&body=${resultText}`, "_self");
                  setIsShareOpen(false);
                }}
                className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#EFF6FF] hover:shadow-[0_8px_20px_rgba(30,64,175,0.08)] border border-transparent hover:border-[#BFDBFE] active:scale-95 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-[20px] h-[20px]" strokeWidth={2.5} />
                </div>
                <span className="text-base font-medium group-hover:text-blue-700">Email</span>
              </button>

              <button onClick={handleDownloadPDF}
                className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-[#FEF2F2] hover:shadow-[0_8px_20px_rgba(153,27,27,0.08)] border border-transparent hover:border-[#FECACA] active:scale-95 text-base font-semibold hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileDown className="w-[20px] h-[20px]" strokeWidth={2.5} />
                </div>
                <span className="text-base font-medium group-hover:text-rose-700">PDF Report</span>
              </button>

              <button onClick={copyToClipboard}
                className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 bg-slate-50 hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)] border border-transparent hover:border-slate-200 active:scale-95 text-base font-semibold hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Copy className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </div>
                <span className="text-base font-medium">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
