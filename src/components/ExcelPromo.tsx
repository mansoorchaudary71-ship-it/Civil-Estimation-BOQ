import { Button } from './ui/Button';
import React, { useState } from "react";
import { FileSpreadsheet, CheckCircle2, Gift, Download, Smartphone, Mail, User, ShieldCheck, Check } from "lucide-react";


export default function ExcelPromo() {
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="w-full md:max-w-[1400px] md:mx-auto px-4 lg:px-8 mb-20 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-ui-warningText to-ink rounded-2xl p-8 md:p-16 text-center text-txt-primary shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full w-24 h-24 bg-surface-default rounded-full flex items-center justify-center mb-6 shadow-xl overflow-hidden">
              <Check className="w-12 h-12 text-ui-successText" />
            </div>
            <h2 className="md: tabular-nums mb-4 uppercase drop-shadow-md text-xl font-semibold text-txt-primary tracking-tight">
              Success! Check your Email
            </h2>
            <p className="w-full md: text-accent-900 mb-8 md:max-w-xl md:mx-auto text-base font-normal text-txt-secondary leading-relaxed px-4 md:px-0">
              Your free Excel Estimation Pack has been sent to your email and WhatsApp. Happy Estimating!
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2 bg-surface-hover/10 hover:bg-surface-hover/20 text-txt-primary font-bold rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
            >
              Back to Form
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-[1400px] md:mx-auto px-4 lg:px-8 mb-20">
      <div className="bg-gradient-to-br from-[#ffd700] via-[#ffb900] to-[#ffaa00] rounded-[2.5rem] p-1 md:p-2 shadow-[0_20px_50px_rgba(255,170,0,0.3)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
          <FileSpreadsheet className="w-64 h-64 text-txt-primary" />
        </div>
        
        {/* Golden Border Wrapper */}
        <div className="bg-surface-default/95 backdrop-blur-2xl rounded-[2.2rem] p-6 md:p-10 lg:p-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-ink to-ink text-txt-primary font-semibold tabular-nums tracking-tight uppercase tracking-wider text-sm px-4 py-1.5 rounded-full mb-6 shadow-brand-md shadow-accent-500/20">
                <Gift className="w-4 h-4" /> 100% Free Download
              </div>
              <h2 className="md: tabular-nums leading-tight mb-4 drop-shadow-sm text-xl font-semibold text-txt-primary tracking-tight">
                Get the Ultimate <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink to-ink">
                  Excel Estimation Pack
                </span>
              </h2>
              <p className="drop-shadow-sm text-base font-normal text-txt-secondary leading-relaxed">
                The most comprehensive construction calculation templates, pre-formatted and ready to use in Excel.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Measurement Sheets (6 trades)",
                "Auto BOQ Generator",
                "Material Takeoff Sheet",
                "Cost Summary Sheet",
                "Bar Bending Schedule",
                "Rate Analysis Templates"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-ui-success border border-ui-successBorder flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-ui-successText" />
                  </div>
                  <span className="font-bold text-txt-secondary">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-ui-borderSubtle">
              <div className="flex items-center gap-2 text-base font-medium">
                <FileSpreadsheet className="w-4 h-4" /> Excel-Based
              </div>
              <div className="flex items-center gap-2 text-base font-medium">
                <ShieldCheck className="w-4 h-4" /> Fully Editable
              </div>
              <div className="flex items-center gap-2 text-base font-medium">
                <Download className="w-4 h-4" /> Lifetime Use
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="bg-surface-hover/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-ui-borderSubtle shadow-xl relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-ui-successText rounded-full flex items-center justify-center border-4 border-white shadow-brand-lg z-10 animate-pulse">
               <Smartphone className="w-5 h-5 text-txt-primary" />
            </div>

            <div className="mb-6 text-center">
              <h3 className="mb-2 text-lg font-medium text-txt-primary mb-4">Where should we send it?</h3>
              <p className="text-base font-normal text-txt-secondary leading-relaxed">Delivered instantly via Email & WhatsApp.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="excel-name" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary">Full Name <span className="text-ui-errorText" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-txt-tertiary" />
                  </div>
                  <input id="excel-name" 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-ink focus:ring-4 focus:ring-accent-500/10 transition-all font-medium text-txt-primary placeholder:text-txt-tertiary"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="excel-email" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary">Work Email Address <span className="text-ui-errorText" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-txt-tertiary" />
                  </div>
                  <input id="excel-email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@company.com"
                    className="w-full bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-ink focus:ring-4 focus:ring-accent-500/10 transition-all font-medium text-txt-primary placeholder:text-txt-tertiary"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                variant="premium"
                size="lg"
                fullWidth
                isLoading={status === 'loading'}
                loadingText="Sending Templates..."
                className="mt-2 text-base shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)] bg-gradient-to-r from-ink to-ink hover:from-accent-400 hover:to-ink text-white"
              >
                Send Me Free Templates
              </Button>
              <p className="text-xs text-center text-txt-secondary dark:text-txt-tertiary mt-3 font-medium">
                No spam. 100% free forever. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
