import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CodeTooltipProps {
  standard: 'IS' | 'ACI' | 'NBC' | 'MORTH' | 'GENERAL' | string;
  code: string;
  description: string;
}

export function CodeTooltip({ standard, code, description }: CodeTooltipProps) {
  const [show, setShow] = useState(false);

  const getStandardColor = (std: string) => {
    if (std.includes('IS')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (std.includes('ACI')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (std.includes('NBC')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (std.includes('MORTH')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div 
      className="relative inline-flex items-center ml-2 z-50 group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <button type="button" className="text-slate-400 hover:text-blue-500 transition-colors focus:outline-none focus:text-blue-500">
        <Info className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 z-[100] text-left pointer-events-none"
          >
            <div className="flex flex-col gap-2">
              <span className={`inline-flex w-max px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStandardColor(standard)}`}>
                {standard} {code}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                {description}
              </p>
            </div>
            
            {/* Arrow */}
            <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
