import React, { useState, useEffect } from 'react';
import { ClipboardList, Info, Printer, Save, Download, Share2, BookOpen, Menu, Search } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { CodeReferences } from './CodeReferences';
import { FormulaModal } from './FormulaModal';
import { motion } from 'motion/react';
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
    <div id="tool-header-top" className="relative -mx-4 md:-mx-8 px-4 md:px-8 bg-transparent pb-10 flex flex-col gap-6 pt-8">
      <div className="md:max-w-7xl md:mx-auto w-full flex flex-col gap-8 px-4 md:px-0">
        
        {/* Main Header Card - Glassmorphism & Soft Depth */}
        <div className="w-full bg-white/70 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)]">
          {/* Ambient Inner Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-slate-100/40 to-transparent rounded-full blur-[80px] pointer-events-none transform translate-x-1/2 -translate-y-1/2 z-0" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
            {/* High-end Icon Container */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/80 backdrop-blur-md rounded-[28px] flex items-center justify-center border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] shrink-0 text-slate-800 transition-transform duration-500 hover:scale-105">
              {Icon ? <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-800/90" strokeWidth={1.5} /> : <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-slate-800/90" strokeWidth={1.5} />}
            </div>
            
            {/* Title & Description */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-base sm:text-lg font-medium text-slate-500 leading-relaxed mt-2 max-w-xl">
                {subtitle || "Standard Engineering Tool"}
              </p>
            </div>
          </div>

          {/* Tactile Unit Toggle */}
          <div className="relative z-10 shrink-0 print:hidden mt-4 lg:mt-0">
            <div className="flex bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 shadow-inner w-full sm:w-[260px] backdrop-blur-sm">
              <div className="relative flex w-full">
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-1/2 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100"
                  animate={{ x: isMetric ? '0%' : '100%' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <button
                  onClick={() => updateSettings({ measurement: 'SI' })}
                  className={`relative z-10 flex-1 py-3.5 text-[13px] font-bold tracking-widest rounded-full transition-colors duration-300 ${isMetric ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  METRIC
                </button>
                <button
                  onClick={() => updateSettings({ measurement: 'FPS' })}
                  className={`relative z-10 flex-1 py-3.5 text-[13px] font-bold tracking-widest rounded-full transition-colors duration-300 ${!isMetric ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  IMPERIAL
                </button>
              </div>
            </div>
          </div>

          {/* Print Only QR Code */}
          {currentUrl && (
            <div className="hidden print:flex flex-col items-center justify-center gap-2">
              <div className="p-2 bg-white border border-slate-200 rounded-2xl">
                <QRCodeSVG value={currentUrl} size={80} level="M" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium max-w-[120px] text-center leading-tight">Scan to verify session data</span>
            </div>
          )}
        </div>

        <div id="tool-header-extra-controls" className="relative z-10 print:hidden empty:hidden"></div>

        {/* Action Button Grid - Sleek & Monochromatic Accent */}
        <div className="print:hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
           {[
             { label: 'Formulas', icon: Info, onClick: () => setIsFormulaModalOpen(true) },
             { label: 'Print', icon: Printer, onClick: handlePrint },
             { label: 'Save Draft', icon: Save, onClick: handleSaveDraft },
             { label: 'Load Draft', icon: Download, onClick: handleLoadDraft },
             { label: 'Share', icon: Share2, onClick: handleShare },
             { label: 'References', icon: BookOpen, onClick: () => setShowReferences(!showReferences), active: showReferences },
           ].map((action, idx) => (
             <button 
               key={idx}
               onClick={action.onClick}
               className={`flex flex-col items-center justify-center gap-3 py-5 px-4 rounded-[24px] font-medium transition-all duration-300 border ${
                 action.active 
                   ? 'bg-slate-800 text-white border-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.15)]' 
                   : 'bg-white/70 backdrop-blur-md hover:bg-white text-slate-700 border-white/60 shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:scale-95'
               }`}
             >
               <action.icon className={`w-6 h-6 ${action.active ? 'text-white' : 'text-slate-800/70'}`} strokeWidth={1.5} />
               <span className="text-[13px] font-bold tracking-wide">{action.label}</span>
             </button>
           ))}
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
