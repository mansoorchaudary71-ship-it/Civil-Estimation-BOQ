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
    <div className={`bg-surface-default/80 dark:bg-[#151821]/80 backdrop-blur-md rounded-2xl sm:rounded-2xl shadow-[0_4px_24px_-8px_rgba(31,29,26,0.06)] border-0 p-6 sm:p-8 w-full min-w-0 ${className}`}>
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
    blue: "text-accent-800 dark:text-accent-400",
    purple: "text-accent-700 dark:text-accent-400",
    orange: "text-accent-800 dark:text-accent-400",
    teal: "text-accent-800 dark:text-accent-400",
    emerald: "text-ui-successText dark:text-ui-successText",
    amber: "text-accent-700 dark:text-accent-400",
    rose: "text-ui-errorText dark:text-ui-errorText",
    indigo: "text-accent-800 dark:text-accent-400",
  };
  
  return (
    <div className="bg-surface-default dark:bg-[#151821] rounded-xl sm:rounded-2xl shadow-brand-sm border border-ui-borderSubtle/60 dark:border-ink/60 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-brand-md overflow-hidden">
      <div className="text-xs text-txt-tertiary dark:text-txt-tertiary font-semibold tracking-wide uppercase mb-4">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${colorMap[colorTheme] || colorMap.blue}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-txt-tertiary dark:text-txt-tertiary">{unit}</span>}
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
      bg: 'bg-ui-success/50 dark:bg-ui-success/20', 
      border: 'border-ui-successBorder/50 dark:border-ui-successText/30', 
      text: 'text-ui-successText dark:text-ui-successText', 
      icon: (
        <div className="w-5 h-5 rounded-full bg-ui-successText flex items-center justify-center text-white shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) 
    },
    fail: { 
      bg: 'bg-ui-error/50 dark:bg-ui-error/20', 
      border: 'border-ui-errorBorder/50 dark:border-ui-errorText/30', 
      text: 'text-ui-errorText dark:text-ui-errorText', 
      icon: (
        <div className="w-5 h-5 rounded-full bg-ui-errorText flex items-center justify-center text-white shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ) 
    },
    warn: { 
      bg: 'bg-accent-50/50 dark:bg-accent-900/30', 
      border: 'border-accent-200/50 dark:border-accent-800/30', 
      text: 'text-accent-800 dark:text-accent-400', 
      icon: (
        <div className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center text-ink shrink-0 mt-0.5">
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
           {desc && <div className="text-[13px] text-txt-tertiary dark:text-txt-tertiary mt-1 leading-relaxed">{desc}</div>}
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
  accentColor = "bg-ink" 
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
        <label className="text-sm font-semibold text-txt-secondary dark:text-txt-tertiary">
          {label}
        </label>
        <div className="text-sm font-bold text-white dark:text-txt-primary bg-surface-hover px-3 py-1 rounded-lg">
          {value} {unit && <span className="text-txt-tertiary font-medium">{unit}</span>}
        </div>
      </div>
      
      <div className="relative w-full h-1.5 bg-surface-active dark:bg-ink rounded-full">
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
          className="absolute top-1/2 -mt-2.5 -ml-2.5 w-5 h-5 bg-surface-default border-2 border-ui-borderDefault dark:border-ink-600 rounded-full shadow-brand-sm pointer-events-none transition-transform duration-100 shadow-ink/10"
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
    <div className="flex flex-wrap gap-6 sm:gap-8 mt-6 w-full items-start justify-center">
      <div className={`flex-1 min-w-[min(100%,380px)] w-full space-y-6 sm:space-y-8 flex flex-col`}>
        {children}
      </div>
      {sidebar && (
        <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full space-y-6 sm:space-y-8 shrink-0">
          <div className="lg:sticky top-24 space-y-6 flex flex-col w-full">
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper for the result cards inside the sidebar or main content
export function ResultCardsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 sm:gap-5 w-full">
      {children}
    </div>
  );
}
