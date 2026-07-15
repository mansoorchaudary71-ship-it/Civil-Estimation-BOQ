import React, { useEffect, useState, useRef } from "react";
import { X, Printer, Download, User as UserIcon, Image as ImageIcon, Briefcase, Settings2 } from "lucide-react";
import { generateProfessionalPDF } from "../../utils/pdfGenerator";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | undefined> => {
  if (!imageUrl) return undefined;
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(undefined);
      }
    };
    img.onerror = () => resolve(undefined);
    img.src = imageUrl;
  });
};

const handleLogoUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function PrintPreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [useBranding, setUseBranding] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLogo, setCustomLogo] = useState<string | undefined>(undefined);
  const [paperSize, setPaperSize] = useState<"a4" | "legal" | "letter">("a4");
  const [theme, setTheme] = useState<"Professional" | "Minimalist" | "Condensed">("Professional");
  const [customHeader, setCustomHeader] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [watermark, setWatermark] = useState<"DRAFT" | "CONFIDENTIAL" | "NONE">("NONE");
  const { user } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !customName) {
      setCustomName(user.displayName || "My Company");
    }
  }, [user]);
  
  const renderPdf = async (brandState: boolean, currentSize: "a4" | "legal" | "letter", currentTheme: "Professional" | "Minimalist" | "Condensed", currentWatermark: "DRAFT" | "CONFIDENTIAL" | "NONE", currentHeader: string, currentShowLogo: boolean) => {
      setLoading(true);
      try {
        const getter = (window as any).__GLOBAL_PDF_GETTER;
        if (getter) {
          const payload = getter();
          if (payload) {
            let brandingData = undefined;
            if (brandState) {
               let logoBase64 = customLogo;
               if (!logoBase64 && user?.photoURL) {
                  logoBase64 = await getBase64ImageFromUrl(user.photoURL);
               }
               brandingData = {
                  name: customName || (user?.displayName || undefined),
                  email: user?.email || undefined,
                  logoBase64
               };
            }
            
            // Assuming `payload` is the arg object for generateProfessionalPDF. 
            // We can mutate it to add branding
            payload.branding = brandingData;
            payload.customHeader = currentHeader;
            payload.showLogo = currentShowLogo;
            payload.paperSize = currentSize;
            payload.theme = currentTheme;
            payload.watermark = currentWatermark;

            generateProfessionalPDF(payload)
              .then((doc) => {
                setPdfUrl(doc.output("bloburl").toString());
                setLoading(false);
              })
              .catch(() => {
                setLoading(false);
                window.print();
                onClose();
              });
            return;
          }
        }
      } catch(e) {}
      
      // Fallback
      setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      renderPdf(useBranding, paperSize, theme, watermark, customHeader, showLogo);
    } else {
      setPdfUrl("");
    }
  }, [isOpen]);

  useEffect(() => {
     if (isOpen) renderPdf(useBranding, paperSize, theme, watermark, customHeader, showLogo);
  }, [useBranding, paperSize, customName, customLogo, theme, watermark, customHeader, showLogo]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-sm p-4 sm:p-8">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative border border-[#E8E4D9]">
        {/* Header */}
        <div className="flex flex-col border-b border-[#E8E4D9] bg-[#FAF8F5]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-[#4A443B]">Print Preview</h2>
              <div className="flex items-center gap-2 ml-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useBranding ? 'bg-[#D7BA89]' : 'bg-[#E8E4D9]'}`}>
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useBranding ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <><label htmlFor="a11y-input-585" className="sr-only">Input</label>
<input id="a11y-input-585" 
                    type="checkbox" 
                    className="hidden" 
                    checked={useBranding} 
                    onChange={(e) => {
                      setUseBranding(e.target.checked);
                      if (e.target.checked) setShowOptions(true);
                      else setShowOptions(false);
                    }} 
                  /></>
                  <span className="text-sm font-semibold text-[#8B8476] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4"/> Custom Branding
                  </span>
                </label>
                {useBranding && (
                  <button aria-label="Settings2" 
                    onClick={() => setShowOptions(!showOptions)}
                    className={`p-1.5 rounded-lg transition-colors ${showOptions ? 'bg-[#D7BA89] text-white' : 'text-[#8B8476] hover:bg-[#E8E4D9]'}`}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
               <select
                 value={watermark}
                 onChange={(e) => setWatermark(e.target.value as "DRAFT" | "CONFIDENTIAL" | "NONE")}
                 className="bg-white border border-[#E8E4D9] text-[#4A443B] text-sm font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
               >
                 <option value="NONE">No Watermark</option>
                 <option value="DRAFT">Draft</option>
                 <option value="CONFIDENTIAL">Confidential</option>
               </select>

               <select
                 value={theme}
                 onChange={(e) => setTheme(e.target.value as "Professional" | "Minimalist" | "Condensed")}
                 className="bg-white border border-[#E8E4D9] text-[#4A443B] text-sm font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
               >
                 <option value="Professional">Professional Theme</option>
                 <option value="Minimalist">Minimalist</option>
                 <option value="Condensed">Condensed</option>
               </select>
               <select
                 value={paperSize}
                 onChange={(e) => setPaperSize(e.target.value as "a4" | "legal" | "letter")}
                 className="bg-white border border-[#E8E4D9] text-[#4A443B] text-sm font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
               >
                 <option value="a4">A4 Size</option>
                 <option value="legal">Legal Size</option>
                 <option value="letter">Letter Size</option>
               </select>
               <button
                  onClick={() => {
                     if (pdfUrl) {
                        const d = document.createElement("a");
                        d.href = pdfUrl;
                        const date = new Date().toISOString().split('T')[0];
                         d.download = `Report_${date}.pdf`;
                        d.click();
                     }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E4D9] text-[#4A443B] hover:bg-[#F2EFE9] font-semibold rounded-xl transition-colors hidden sm:flex"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                
              <button
                onClick={onClose}
                className="p-2 text-[#A39D93] hover:text-[#4A443B] hover:bg-[#E8E4D9]/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Expanded Branding Options */}
          {useBranding && showOptions && (
            <div className="px-6 py-4 bg-white border-t border-[#E8E4D9] flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 flex-1 min-w-[250px]">
                <label className="text-sm font-semibold text-[#8B8476]">Company / Name Details</label>
                <><label htmlFor="a11y-input-586" className="sr-only">e.g. Acme Construction</label>
<input id="a11y-input-586" 
                  type="text" 
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Acme Construction"
                  className="flex-1 border border-[#E8E4D9] text-[#4A443B] px-3 py-1.5 rounded-lg text-sm bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#D7BA89]/50"
                /></>
              </div>
              <div className="flex items-center gap-3">
                <><label htmlFor="a11y-input-587" className="sr-only">Input</label>
<input id="a11y-input-587" 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const base64 = await handleLogoUpload(e.target.files[0]);
                        setCustomLogo(base64);
                      } catch (err) {}
                    }
                  }}
                /></>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm font-semibold text-[#8B8476] border border-[#E8E4D9] px-3 py-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  {customLogo ? "Change Logo" : "Upload Logo"}
                </button>
                {customLogo && (
                  <button 
                    onClick={() => setCustomLogo(undefined)}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#F2EFE9] overflow-hidden relative">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-[#D7BA89] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : pdfUrl ? (
            <iframe
              id="print-iframe"
              src={pdfUrl}
              className="w-full h-full border-none"
              title="Print Preview PDF"
            />
          ) : (
            <div className="p-8 text-center text-[#8B8476]">Preview not available for this tool.</div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8E4D9] flex justify-end">
           <button
             onClick={() => {
                const iframe = document.getElementById("print-iframe") as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                   iframe.contentWindow.print();
                } else {
                   window.print();
                }
             }}
             className="flex items-center gap-2 px-6 py-2.5 bg-[#4A443B] hover:bg-[#322E27] text-[#FAF8F5] font-bold rounded-xl transition-colors"
           >
             <Printer className="w-5 h-5" />
             Confirm Print
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
}