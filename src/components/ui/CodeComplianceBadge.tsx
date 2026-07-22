import React, { useState } from 'react';
import { ShieldCheck, TestTube, Settings2, Info } from 'lucide-react';

interface CodeComplianceBadgeProps {
  standard: string; // e.g., "IS 2720 / ASTM D1883"
  title?: string;
  description?: string;
}

export function CodeComplianceBadge({ standard, title = "Standard Compliant", description }: CodeComplianceBadgeProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
      <ShieldCheck className="text-emerald-500 mt-0.5" size={18} />
      <div>
        <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{title}</div>
        <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{standard}</div>
        {description && <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{description}</div>}
      </div>
    </div>
  );
}

interface ApparatusHelperBoxProps {
  items: string[];
}

export function ApparatusHelperBox({ items }: ApparatusHelperBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <TestTube size={16} className="text-blue-500" />
        Required Lab Apparatus & Scientific Equipment
        <Info size={14} className="ml-auto text-slate-400" />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Settings2 size={14} className="text-slate-400 mt-1 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
