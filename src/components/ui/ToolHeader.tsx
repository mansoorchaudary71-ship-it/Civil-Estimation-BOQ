import React, { useState, useEffect } from 'react';
import { ClipboardList, Info, Printer, Save, Download, Share2, BookOpen, Menu, Search } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
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
  const isMetric = settings.measurement === 'SI';

  useEffect(() => {
    setCurrentUrl(typeof window !== 'undefined' ? window.location.href : '');
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDraft = () => {
    window.dispatchEvent(new Event('action-save-draft'));
  };

  const handleLoadDraft = () => {
    window.dispatchEvent(new Event('action-load-draft'));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - Civil Estimation Pro`,
        url: window.location.href,
      }).catch((err) => console.log('Share canceled or failed', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div id="tool-header-top" className="relative -mx-2 sm:-mx-4 md:-mx-8 px-2 sm:px-4 md:px-8 bg-slate-50/30 pb-8 flex flex-col gap-6 pt-6">
      <div className="md:max-w-7xl md:mx-auto w-full flex flex-col gap-6 px-4 md:px-0">
        
        {/* Title Header */}
        <div className="w-full bg-white rounded-[32px] p-4 sm:p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-4 sm:p-4 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-slate-100/50 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50/80 backdrop-blur-sm rounded-[24px] flex items-center justify-center border border-slate-200/80 shadow-sm shrink-0 text-purple-600 overflow-hidden">
              {Icon ? <Icon className="w-8 h-8 sm:w-10 sm:h-10" /> : <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-slate-700" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-800">
                  {title}
                </h1>
                <div className="group relative flex items-center">
                  <button 
                    onClick={() => setIsFormulaModalOpen(true)}
                    className="text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                    aria-label="View Engineering Formulas"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-72 bg-slate-800 text-white text-xs rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-xl border border-slate-700 hidden md:block">
                    <div className="font-semibold text-sm mb-1.5 text-slate-100">Engineering Formulas</div>
                    <p className="text-slate-300 leading-relaxed mb-2">Click to view the standardized civil engineering equations, parameters, and design codes used for this calculation.</p>
                    <div className="text-[10px] text-blue-300 font-medium">Click icon to open full guide</div>
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 border-[8px] border-transparent border-r-slate-800"></div>
                  </div>
                </div>
              </div>
              <p className="text-base font-normal text-slate-600 leading-relaxed mt-1.5">
                {subtitle || "Standard Engineering Tool"}
              </p>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="relative z-10 shrink-0 print:hidden">
            <div className="flex bg-slate-100/60 p-1.5 rounded-full border border-slate-200/60 shadow-inner w-full sm:w-auto">
              <div className="relative flex w-full sm:w-[240px]">
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-1/2 bg-blue-100/60 backdrop-blur-md rounded-full shadow-[0_2px_12px_rgba(59,130,246,0.12)] border border-blue-200/50"
                  animate={{ x: isMetric ? '0%' : '100%' }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
                <button
                  onClick={() => updateSettings({ measurement: 'SI' })}
                  className={`relative z-10 flex-1 py-3 text-base font-medium rounded-full transition-colors ${isMetric ? 'text-blue-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  METRIC
                </button>
                <button
                  onClick={() => updateSettings({ measurement: 'FPS' })}
                  className={`relative z-10 flex-1 py-3 text-base font-medium rounded-full transition-colors ${!isMetric ? 'text-blue-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  IMPERIAL
                </button>
              </div>
            </div>
          </div>

          {/* Print Only QR Code */}
          {currentUrl && (
            <div className="hidden print:flex flex-col items-center justify-center gap-1 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <QRCodeSVG value={currentUrl} size={80} level="M" />
              <span className="text-[10px] text-slate-500 font-medium max-w-[120px] text-center leading-tight">Scan to verify session data</span>
            </div>
          )}
        </div>

        <div id="tool-header-extra-controls" className="relative z-10 print:hidden empty:hidden"></div>

        {/* Action Button Grid */}
        <div className="print:hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
           <button 
             onClick={() => setIsFormulaModalOpen(true)}
             className="flex items-center justify-center gap-2.5 py-4 px-4 bg-green-50/80 hover:bg-green-100 text-green-700 rounded-full font-medium transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-green-100/50 active:scale-95 hover:-translate-y-0.5"
           >
             <Info className="w-5 h-5 opacity-80" />
             <span className="text-base font-medium">Formulas</span>
           </button>
           
           <button onClick={handlePrint}
             className="flex items-center justify-center gap-2.5 py-4 px-4 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-full font-medium transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-blue-100/50 active:scale-95 hover:-translate-y-0.5"
           >
             <Printer className="w-5 h-5 opacity-80" />
             <span className="text-base font-medium">Print</span>
           </button>
           
           <button onClick={handleSaveDraft}
             className="flex items-center justify-center gap-2.5 py-4 px-4 bg-teal-50/80 hover:bg-teal-100 text-teal-700 rounded-full font-medium transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-teal-100/50 active:scale-95 hover:-translate-y-0.5"
           >
             <Save className="w-5 h-5 opacity-80" />
             <span className="text-base font-medium">Save Draft</span>
           </button>
           
           <button onClick={handleLoadDraft}
             className="flex items-center justify-center gap-2.5 py-4 px-4 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-full font-medium transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-blue-100/50 active:scale-95 hover:-translate-y-0.5"
           >
             <Download className="w-5 h-5 opacity-80" />
             <span className="text-base font-medium">Load Draft</span>
           </button>
           
           <button onClick={handleShare}
             className="flex items-center justify-center gap-2.5 py-4 px-4 bg-purple-50/80 hover:bg-purple-100 text-purple-700 rounded-full font-medium transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.03)] border border-purple-100/50 active:scale-95 hover:-translate-y-0.5"
           >
             <Share2 className="w-5 h-5 opacity-80" />
             <span className="text-base font-medium">Share</span>
           </button>

           <button 
             onClick={() => setShowReferences(!showReferences)}
             className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-full font-medium transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.03)] border ${showReferences ? 'bg-slate-800 text-white border-slate-700' : 'bg-rose-50/80 hover:bg-rose-100 text-rose-700 border-rose-100/50'}`}
           >
             <BookOpen className="w-5 h-5 opacity-80 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
             <span className="text-base font-medium">References</span>
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

