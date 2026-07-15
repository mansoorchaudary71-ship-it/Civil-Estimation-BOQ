import React, { useState } from 'react';
import { Calculator, X, ArrowRight, Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const RATES: Record<string, { currency: string, rates: Record<string, number> }> = {
  Pakistan: { currency: 'PKR', rates: { Basic: 3000, Standard: 4500, Premium: 6000 } },
  India: { currency: 'INR', rates: { Basic: 1200, Standard: 1800, Premium: 2500 } },
  UAE: { currency: 'AED', rates: { Basic: 250, Standard: 400, Premium: 650 } },
};

const MULTIPLIERS: Record<string, number> = {
  Residential: 1,
  Commercial: 1.2,
  Road: 0.5,
  Industrial: 0.8,
};

export default function QuickEstimatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectType, setProjectType] = useState('Residential');
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState('sq.ft');
  const [location, setLocation] = useState('Pakistan');
  const [quality, setQuality] = useState('Standard');
  const [result, setResult] = useState<{ min: number, max: number, currency: string } | null>(null);

  const calculateEstimate = () => {
    if (!area || isNaN(Number(area))) return;
    
    let areaInSqFt = Number(area);
    if (unit === 'sq.m') {
      areaInSqFt = areaInSqFt * 10.7639;
    }

    const baseRate = RATES[location].rates[quality];
    const multiplier = MULTIPLIERS[projectType];
    const currency = RATES[location].currency;

    const estimatedCost = areaInSqFt * baseRate * multiplier;
    
    // Add a -10% to +15% range for rough estimation
    setResult({
      min: estimatedCost * 0.9,
      max: estimatedCost * 1.15,
      currency
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-[320px] max-w-[85vw] sm:w-[380px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-[#FFFFFF] border-b border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-bold text-[#F1F5F9]">Quick Estimator</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#94A3B8] text-xs font-medium uppercase">Project Type</label>
                <select 
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg py-2.5 px-3 text-[#F1F5F9] text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-[3px] focus:ring-[rgba(245,158,11,0.15)] appearance-none"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Road">Road / Infra</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[#94A3B8] text-xs font-medium uppercase">Built-up Area</label>
                  <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded p-0.5 border border-[rgba(255,255,255,0.08)]">
                    <button 
                      onClick={() => setUnit('sq.ft')}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm transition-colors ${unit === 'sq.ft' ? 'bg-[#F59E0B] text-slate-900' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}
                    >
                      sq.ft
                    </button>
                    <button 
                      onClick={() => setUnit('sq.m')}
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm transition-colors ${unit === 'sq.m' ? 'bg-[#F59E0B] text-slate-900' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}
                    >
                      sq.m
                    </button>
                  </div>
                </div>
                <><label htmlFor="a11y-input-588" className="sr-only">e.g. 2500</label>
<input id="a11y-input-588"
                  type="number" inputMode="decimal"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg py-2.5 px-3 text-[#F1F5F9] text-sm placeholder:text-[#475569] focus:outline-none focus:border-[#F59E0B] focus:ring-[3px] focus:ring-[rgba(245,158,11,0.15)]"
                /></>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#94A3B8] text-xs font-medium uppercase">Location</label>
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg py-2.5 px-3 text-[#F1F5F9] text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-[3px] focus:ring-[rgba(245,158,11,0.15)] appearance-none"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="UAE">UAE</option>
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[#94A3B8] text-xs font-medium uppercase">Quality</label>
                  <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-lg py-2.5 px-3 text-[#F1F5F9] text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-[3px] focus:ring-[rgba(245,158,11,0.15)] appearance-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>

              {result ? (
                <div className="mt-2 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#F59E0B] uppercase tracking-wide">Rough Estimate</span>
                  <div className="text-xl font-bold text-[#F1F5F9] flex items-baseline gap-1.5 break-all">
                    <span className="text-base text-[#F59E0B]">{result.currency}</span>
                    {formatCurrency(result.min)} - {formatCurrency(result.max)}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] mt-1 line-clamp-1">
                    *Excludes land cost & taxes. Based on current market rates.
                  </span>
                </div>
              ) : (
                <button
                  onClick={calculateEstimate}
                  className="mt-2 w-full bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Estimate Cost
                </button>
              )}
            </div>

            <div className="bg-[#FFFFFF] border-t border-slate-200 p-3">
              <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] transition-colors py-2">
                Open Full Estimator
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.3)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        aria-label="Quick Estimator"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
      </button>
    </div>
  );
}
