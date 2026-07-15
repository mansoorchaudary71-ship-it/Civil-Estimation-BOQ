import React from "react";

// --- 1. Universal Card Wrapper ---
export function Card({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`bg-white dark:bg-[#151821] rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// --- 2. Metric / Data Summary Card ---
export function MetricCard({ 
  label, 
  value, 
  unit = "", 
  colorTheme = "blue" 
}: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  colorTheme?: 'blue' | 'purple' | 'orange' | 'teal' | 'emerald' | 'amber' | 'rose' | 'indigo';
}) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-blue-600 dark:text-orange-400",
    teal: "text-teal-600 dark:text-teal-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-500 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  };
  
  return (
    <div className="bg-white dark:bg-[#151821] rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md overflow-hidden">
      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase mb-4">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${colorMap[colorTheme] || colorMap.blue}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

// --- 3. Status & Durability Compliance Banner ---
export function StatusBanner({ 
  status, 
  title, 
  desc 
}: { 
  status: 'pass' | 'fail' | 'warn'; 
  title: string; 
  desc?: string; 
}) {
  const styles = {
    pass: { 
      bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', 
      border: 'border-emerald-200/50 dark:border-emerald-800/30', 
      text: 'text-emerald-800 dark:text-emerald-400', 
      icon: (
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) 
    },
    fail: { 
      bg: 'bg-red-50/50 dark:bg-red-900/10', 
      border: 'border-red-200/50 dark:border-red-800/30', 
      text: 'text-red-800 dark:text-red-400', 
      icon: (
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ) 
    },
    warn: { 
      bg: 'bg-amber-50/50 dark:bg-amber-900/10', 
      border: 'border-amber-200/50 dark:border-amber-800/30', 
      text: 'text-amber-800 dark:text-amber-400', 
      icon: (
        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      ) 
    }
  };
  const theme = styles[status];
  return (
     <div className={`flex items-start gap-3 p-4 rounded-xl border ${theme.bg} ${theme.border}`}>
        {theme.icon}
        <div>
           <div className={`font-bold text-[15px] leading-tight ${theme.text}`}>{title}</div>
           {desc && <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{desc}</div>}
        </div>
     </div>
  );
}

// --- 4. Input Range / Slider (Universal Style) ---
export function RangeSlider({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  unit = "", 
  accentColor = "bg-blue-500" 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step?: number; 
  onChange: (val: number) => void;
  unit?: string;
  accentColor?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="text-sm font-bold text-white dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
          {value} {unit && <span className="text-slate-500 font-medium">{unit}</span>}
        </div>
      </div>
      
      <div className="relative w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full">
        {/* Progress Fill */}
        <div 
          className={`absolute h-full rounded-full ${accentColor}`} 
          style={{ width: `${percentage}%` }}
        />
        {/* Invisible Range Input for interaction */}
        <><label htmlFor="a11y-input-596" className="sr-only">Input</label>
<input id="a11y-input-596" 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        /></>
        {/* Custom Handle Visual */}
        <div 
          className="absolute top-1/2 -mt-2.5 -ml-2.5 w-5 h-5 bg-white border-2 border-slate-300 dark:border-slate-600 rounded-full shadow-sm pointer-events-none transition-transform duration-100 shadow-slate-900/10"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


// Use this to wrap the inner content of calculators (below the tab navigation)
export function ToolLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode; // Optional right sidebar for results/charts
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 mt-6">
      <div className={`col-span-1 ${sidebar ? 'xl:col-span-8 space-y-6 sm:space-y-8' : 'xl:col-span-12 space-y-6 sm:space-y-8'}`}>
        {children}
      </div>
      {sidebar && (
        <div className="col-span-1 xl:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
