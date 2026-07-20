import React, { useState, useEffect } from 'react';
import { ClipboardList, Info, Printer, Save, Download, Share2, BookOpen, Menu, Search, ChevronDown, Copy, FileText, Mail, MessageCircle, Smartphone } from 'lucide-react';
import { useSettings, Currency } from '../../context/SettingsContext';
import { CodeReferences } from './CodeReferences';
import { FormulaModal } from './FormulaModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export type ThemeType = 'default' | 'earth' | 'steel' | 'ocean' | 'emerald' | 'sunset';

interface ToolHeaderProps {
  id: string;
  title: string;
  themeType?: ThemeType;
  subtitle?: string;
  icon?: React.ElementType;
  onNavigate?: (id: string) => void;
}

export function ToolHeader({ id, title, subtitle, icon: Icon, onNavigate }: ToolHeaderProps) {
  const { settings, updateSettings } = useSettings();
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isMetric = settings.measurement === 'SI';

  const currencies = [
    { code: 'USD', label: 'USA' },
    { code: 'AED', label: 'UAE' },
    { code: 'SAR', label: 'KSA' },
    { code: 'INR', label: 'India' },
    { code: 'PKR', label: 'Pakistan' },
    { code: 'EUR', label: 'Europe' },
    { code: 'GBP', label: 'UK' },
  ];

  useEffect(() => {
    setCurrentUrl(typeof window !== 'undefined' ? window.location.href : '');
  }, []);

  const handlePrint = () => {
    window.dispatchEvent(new Event('global-print-action'));
  };

  const handleSaveDraft = () => {
    window.dispatchEvent(new Event('action-save-draft'));
  };

  const handleLoadDraft = () => {
    window.dispatchEvent(new Event('action-load-draft'));
  };

  
  // Advanced Share Logic
  const getCalculationSummary = () => {
    let summary = `Estimation Report: ${title}\n`;
    summary += `---------------------------------\n`;
    
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    if (inputs.length > 0) {
      summary += `Inputs:\n`;
      inputs.forEach(input => {
        const label = input.previousElementSibling?.textContent || input.getAttribute('aria-label') || input.id;
        if (label && (input as HTMLInputElement).value) {
          summary += `- ${label.trim()}: ${(input as HTMLInputElement).value}\n`;
        }
      });
      summary += `\n`;
    }

    const resultCard = document.querySelector('.tool-card') || document.getElementById('tool-content');
    if (resultCard) {
      summary += `URL: ${currentUrl}\n`;
      summary += `Generated via Civil Estimation Pro`;
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
      const element = (document.querySelector('.tool-card') || document.body) as HTMLElement;
      const opt = {
        margin: 10,
        filename: `${title.replace(/\s+/g, '_')}_Estimate.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: "portrait" as const }
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
      const element = (document.querySelector('.tool-card') || document.body) as HTMLElement;
      const opt = {
        margin: 10,
        filename: `${title.replace(/\s+/g, '_')}_Estimate.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: "portrait" as const }
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
          const file = new File([pdfBlob], `${title.replace(/\s+/g, '_')}_Estimate.pdf`, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: title,
              text: `Check out this estimation for ${title}:`,
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
    
    const text = encodeURIComponent(`Check out this estimation calculation for ${title}: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleEmailShare = async () => {
    setIsShareDropdownOpen(false);
    if (navigator.share) {
      try {
        setIsProcessing(true);
        toast.loading('Preparing email...', { id: 'email-toast', position: 'bottom-center' });
        const pdfBlob = await generatePDFBlob();
        if (pdfBlob) {
          const file = new File([pdfBlob], `${title.replace(/\s+/g, '_')}_Estimate.pdf`, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: title,
              text: `Estimation for ${title}`,
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
    
    const subject = encodeURIComponent(`${title} - Estimation Report`);
    const body = encodeURIComponent(`Here is the calculation report for ${title}.\n\nView it here: ${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    setIsShareDropdownOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this civil engineering calculation tool: ${title}`,
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


  return (
    <div id="tool-header-top" className="relative -mx-2 sm:-mx-4 md:-mx-8 px-2 sm:px-4 md:px-8 bg-transparent pb-8 flex flex-col gap-6 pt-6">
      {/* PRINT-ONLY BRANDING HEADER */}
      <div className="hidden print:flex flex-col w-full border-b-2 border-slate-800 pb-4 mb-4">
         <h1 className="text-2xl font-bold text-slate-900 m-0 p-0 leading-tight">Civil Estimation Pro</h1>
         <h2 className="text-lg font-semibold text-slate-700 m-0 mt-1 p-0 leading-tight">{title}</h2>
         {subtitle && <p className="text-sm text-slate-500 m-0 mt-1 p-0 italic">{subtitle}</p>}
      </div>

      <div className="w-full flex flex-col gap-8">
        
        {/* Title Header */}
        <div className="w-full flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-2 print:hidden">
          <div className="flex items-start gap-4 relative z-10 w-full lg:w-auto">
            <motion.div layoutId={`icon-${id}`} className="w-14 h-14 bg-white flex items-center justify-center shrink-0 text-indigo-700 rounded-[18px] border border-slate-200/60 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              {Icon ? <Icon className="w-7 h-7" strokeWidth={1.5} /> : <ClipboardList className="w-7 h-7" strokeWidth={1.5} />}
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <motion.h1 layoutId={`title-${id}`} className="text-[22px] md:text-2xl font-semibold text-slate-900 tracking-tight leading-none pt-1">
                  {title}
                </motion.h1>
                <div className="group relative flex items-center pt-1">
                  <button 
                    onClick={() => setIsFormulaModalOpen(true)}
                    className="text-slate-300 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label="View Engineering Formulas"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-64 bg-slate-900 text-white text-xs rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-sm hidden md:block">
                    <div className="font-medium text-sm mb-1 text-slate-100">Formulas</div>
                    <p className="text-slate-400 leading-relaxed font-light">View standardized engineering equations, parameters, and design codes.</p>
                  </div>
                </div>
              </div>
              <p className="text-[14px] font-normal text-slate-500 mt-1.5 max-w-xl leading-relaxed">
                {subtitle || "Standard Engineering Tool"}
              </p>
              
              {/* Toggles (Horizontal Row beneath description) */}
              <div className="flex flex-row items-center gap-2 sm:gap-3 print:hidden w-full mt-4">
                {/* Unit Toggle */}
                <div className="flex items-center p-1 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-inner">
                  <button
                    onClick={() => updateSettings({ measurement: 'SI' })}
                    className={`relative px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all rounded-full ${
                      isMetric ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-700'
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    onClick={() => updateSettings({ measurement: 'FPS' })}
                    className={`relative px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all rounded-full ${
                      !isMetric ? 'bg-indigo-700 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-700'
                    }`}
                  >
                    Imperial
                  </button>
                </div>
                
                {/* Currency Dropdown (One UI 8.5 style) */}
                <div className="relative flex items-center p-1 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-inner">
                  <button
                    onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all rounded-full text-slate-700 hover:text-indigo-700 hover:bg-slate-50"
                  >
                    <span className="min-w-[28px] text-center">{settings.currency || 'PKR'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCurrencyDropdownOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isCurrencyDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCurrencyDropdownOpen(false)}
                      />
                      <div className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-44 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.12)] rounded-[20px] p-1.5 z-50 overflow-hidden transform origin-top-left sm:origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-0.5 max-h-[260px] overflow-y-auto no-scrollbar">
                          {currencies.map((currency) => {
                            const isActive = settings.currency === currency.code;
                            return (
                              <button
                                key={currency.code}
                                onClick={() => {
                                  updateSettings({ currency: currency.code as Currency });
                                  setIsCurrencyDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-[13px] rounded-xl flex items-center justify-between transition-all duration-200 ${
                                  isActive 
                                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold' 
                                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                                }`}
                              >
                                <span>{currency.code}</span>
                                <span className={`text-[11px] ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>{currency.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Print Only QR Code */}
          {currentUrl && (
            <div className="hidden print:flex flex-col items-center justify-center gap-1 shrink-0">
              <QRCodeSVG value={currentUrl} size={64} level="M" />
              <span className="text-[10px] text-slate-400 font-medium max-w-[100px] text-center leading-tight">Scan to verify</span>
            </div>
          )}
        </div>

        <div id="tool-header-extra-controls" className="relative z-10 print:hidden empty:hidden"></div>

        {/* Action Button Grid */}
        <div className="print:hidden grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 border-b border-slate-100 pb-6 mt-4 w-full">
           {/* Row 1 */}
           <button 
             onClick={() => setIsFormulaModalOpen(true)}
             className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
           >
             <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Formulas</span>
           </button>
           
           <button onClick={handlePrint}
             className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
           >
             <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Print</span>
           </button>
           
           
           <div className="relative flex items-center justify-center">
             <button onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
               className="flex w-full items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
             >
               <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
               <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Share</span>
               <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isShareDropdownOpen ? 'rotate-180 text-indigo-600' : 'text-indigo-700'}`} />
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
           </div>

           {/* Row 2 */}
           <button onClick={handleSaveDraft}
             className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
           >
             <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Save Draft</span>
           </button>
           
           <button onClick={handleLoadDraft}
             className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border border-indigo-700 text-indigo-700 hover:bg-indigo-50 transition-colors group"
           >
             <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">Load Draft</span>
           </button>
           
           <button 
             onClick={() => setShowReferences(!showReferences)}
             className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-full border transition-colors group ${showReferences ? 'bg-indigo-700 text-white border-indigo-700' : 'border-indigo-700 text-indigo-700 hover:bg-indigo-50'}`}
           >
             <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">References</span>
           </button>
        </div>
        
        {showReferences && (
          <div className="relative z-10 w-full animate-in fade-in slide-in-from-top-4 duration-300">
            <CodeReferences moduleId={id} />
          </div>
        )}

      </div>
      
      <FormulaModal 
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        title={title}
        formulaDescription="Calculations follow standardized civil engineering guidelines for material density and proportioning. Specific details can be referenced from structural design codes."
      />
    </div>
  );
}

