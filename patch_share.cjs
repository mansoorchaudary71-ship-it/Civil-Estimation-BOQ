const fs = require('fs');

let fileStr = fs.readFileSync('src/components/ui/ToolHeader.tsx', 'utf8');

// 1. Add new icons to lucide-react import
fileStr = fileStr.replace(
  "import { ClipboardList, Info, Printer, Save, Download, Share2, BookOpen, Menu, Search, ChevronDown } from 'lucide-react';",
  "import { ClipboardList, Info, Printer, Save, Download, Share2, BookOpen, Menu, Search, ChevronDown, Copy, FileText, Mail, MessageCircle, Smartphone } from 'lucide-react';"
);

// 2. Add states for Share dropdown and processing
const statesToAdd = `
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
`;
fileStr = fileStr.replace(
  "const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);",
  "const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);\n" + statesToAdd
);

// 3. Replace handleShare
const newHandleShare = `
  // Advanced Share Logic
  const getCalculationSummary = () => {
    let summary = \`Estimation Report: \${title}\\n\`;
    summary += \`---------------------------------\\n\`;
    
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    if (inputs.length > 0) {
      summary += \`Inputs:\\n\`;
      inputs.forEach(input => {
        const label = input.previousElementSibling?.textContent || input.getAttribute('aria-label') || input.id;
        if (label && input.value) {
          summary += \`- \${label.trim()}: \${input.value}\\n\`;
        }
      });
      summary += \`\\n\`;
    }

    const resultCard = document.querySelector('.tool-card') || document.getElementById('tool-content');
    if (resultCard) {
      summary += \`URL: \${currentUrl}\\n\`;
      summary += \`Generated via Civil Estimation Pro\`;
    }
    return summary;
  };

  const handleCopyResults = () => {
    setIsShareDropdownOpen(false);
    const summary = getCalculationSummary();
    navigator.clipboard.writeText(summary);
    toast.success('Copied calculation summary to clipboard', {
      position: 'bottom-center',
      style: { borderRadius: '100px', background: '#333', color: '#fff' }
    });
  };

  const generatePDFBlob = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.querySelector('.tool-card') || document.body;
      const opt = {
        margin: 10,
        filename: \`\${title.replace(/\\s+/g, '_')}_Estimate.pdf\`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
      return pdf;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSavePDF = async () => {
    setIsShareDropdownOpen(false);
    setIsProcessing(true);
    toast.loading('Generating PDF...', { id: 'pdf-toast', position: 'bottom-center' });
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.querySelector('.tool-card') || document.body;
      const opt = {
        margin: 10,
        filename: \`\${title.replace(/\\s+/g, '_')}_Estimate.pdf\`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF saved successfully!', { id: 'pdf-toast', position: 'bottom-center' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF', { id: 'pdf-toast', position: 'bottom-center' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppShare = async () => {
    setIsShareDropdownOpen(false);
    if (navigator.share) {
      try {
        setIsProcessing(true);
        toast.loading('Preparing to share...', { id: 'share-toast', position: 'bottom-center' });
        const pdfBlob = await generatePDFBlob();
        if (pdfBlob) {
          const file = new File([pdfBlob], \`\${title.replace(/\\s+/g, '_')}_Estimate.pdf\`, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: title,
              text: \`Check out this estimation for \${title}:\`,
              url: currentUrl,
              files: [file]
            });
            toast.success('Shared successfully', { id: 'share-toast' });
            return;
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsProcessing(false);
        toast.dismiss('share-toast');
      }
    }
    
    const text = encodeURIComponent(\`Check out this estimation calculation for \${title}: \${currentUrl}\`);
    window.open(\`https://api.whatsapp.com/send?text=\${text}\`, '_blank');
  };

  const handleEmailShare = async () => {
    setIsShareDropdownOpen(false);
    if (navigator.share) {
      try {
        setIsProcessing(true);
        toast.loading('Preparing email...', { id: 'email-toast', position: 'bottom-center' });
        const pdfBlob = await generatePDFBlob();
        if (pdfBlob) {
          const file = new File([pdfBlob], \`\${title.replace(/\\s+/g, '_')}_Estimate.pdf\`, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: title,
              text: \`Estimation for \${title}\`,
              files: [file]
            });
            toast.dismiss('email-toast');
            return;
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsProcessing(false);
        toast.dismiss('email-toast');
      }
    }
    
    const subject = encodeURIComponent(\`\${title} - Estimation Report\`);
    const body = encodeURIComponent(\`Here is the calculation report for \${title}.\\n\\nView it here: \${currentUrl}\`);
    window.location.href = \`mailto:?subject=\${subject}&body=\${body}\`;
  };

  const handleNativeShare = async () => {
    setIsShareDropdownOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: \`Check out this civil engineering calculation tool: \${title}\`,
          url: currentUrl
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard', { position: 'bottom-center' });
    }
  };
`;

const oldHandleShareRegex = /const handleShare = \(\) => \{[\s\S]*?\};/;
fileStr = fileStr.replace(oldHandleShareRegex, newHandleShare);

// 4. Replace the Share button HTML
const oldShareButton = `<button onClick={handleShare}
             className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
           >
             <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Share</span>
           </button>`;

const newShareButtonHTML = `
           <div className="relative flex items-center justify-center">
             <button onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
               className="flex w-full items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
             >
               <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
               <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Share</span>
               <ChevronDown className={\`w-3.5 h-3.5 transition-transform duration-300 \${isShareDropdownOpen ? 'rotate-180 text-indigo-600' : 'text-indigo-700'}\`} />
             </button>
             
             {isShareDropdownOpen && (
               <>
                 <div 
                   className="fixed inset-0 z-40"
                   onClick={() => setIsShareDropdownOpen(false)}
                 />
                 <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-64 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.12)] rounded-[20px] p-2 z-50 overflow-hidden transform origin-top animate-in fade-in zoom-in-95 duration-200">
                   <div className="flex flex-col gap-1">
                     <button
                       onClick={handleWhatsAppShare}
                       className="w-full text-left px-3 py-2.5 text-[13px] rounded-xl flex items-center gap-3 transition-all duration-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 font-medium group"
                     >
                       <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                         <MessageCircle className="w-4 h-4" />
                       </div>
                       <span>Share via WhatsApp</span>
                     </button>
                     
                     <button
                       onClick={handleEmailShare}
                       className="w-full text-left px-3 py-2.5 text-[13px] rounded-xl flex items-center gap-3 transition-all duration-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium group"
                     >
                       <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-100 transition-colors">
                         <Mail className="w-4 h-4" />
                       </div>
                       <span>Share via Email</span>
                     </button>
                     
                     <button
                       onClick={handleSavePDF}
                       className="w-full text-left px-3 py-2.5 text-[13px] rounded-xl flex items-center gap-3 transition-all duration-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 font-medium group"
                     >
                       <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg group-hover:bg-rose-100 transition-colors">
                         <FileText className="w-4 h-4" />
                       </div>
                       <span>Save PDF Report</span>
                     </button>
                     
                     <div className="h-px w-full bg-slate-100 my-1"></div>
                     
                     <button
                       onClick={handleCopyResults}
                       className="w-full text-left px-3 py-2.5 text-[13px] rounded-xl flex items-center gap-3 transition-all duration-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium group"
                     >
                       <div className="bg-slate-100 text-slate-600 p-1.5 rounded-lg group-hover:bg-slate-200 transition-colors">
                         <Copy className="w-4 h-4" />
                       </div>
                       <span>Copy Calculations</span>
                     </button>
                     
                     <button
                       onClick={handleNativeShare}
                       className="w-full text-left px-3 py-2.5 text-[13px] rounded-xl flex items-center gap-3 transition-all duration-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-medium group"
                     >
                       <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                         <Smartphone className="w-4 h-4" />
                       </div>
                       <span>More Options...</span>
                     </button>
                   </div>
                 </div>
               </>
             )}
           </div>`;

fileStr = fileStr.replace(oldShareButton, newShareButtonHTML);

fs.writeFileSync('src/components/ui/ToolHeader.tsx', fileStr);
console.log("Successfully patched ToolHeader.tsx");
