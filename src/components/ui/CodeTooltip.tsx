import { Button } from './/Button';
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
    if (std.includes('IS')) return 'bg-accent-50 text-accent-800 border-accent-200';
    if (std.includes('ACI')) return 'bg-accent-100 text-accent-800 border-accent-200';
    if (std.includes('NBC')) return 'bg-ui-success text-ui-successText border-ui-successBorder';
    if (std.includes('MORTH')) return 'bg-accent-50 text-accent-800 border-accent-200';
    return 'bg-surface-hover text-txt-secondary border-border-color';
  };

  return (
    <div 
      className="relative inline-flex items-center ml-2 z-50 group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <Button type="button" className="text-txt-tertiary hover:text-accent-800 transition-colors focus:outline-none focus:text-accent-800">
        <Info className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-surface-default dark:bg-ink rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-ui-borderSubtle dark:border-ink-600 z-[100] text-left pointer-events-none"
          >
            <div className="flex flex-col gap-2">
              <span className={`inline-flex w-max px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md border ${getStandardColor(standard)}`}>
                {standard} {code}
              </span>
              <p className="text-xs text-txt-secondary dark:text-txt-tertiary font-normal leading-relaxed">
                {description}
              </p>
            </div>
            
            {/* Arrow */}
            <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-surface-default dark:bg-ink border-b border-r border-ui-borderSubtle dark:border-ink-600 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
