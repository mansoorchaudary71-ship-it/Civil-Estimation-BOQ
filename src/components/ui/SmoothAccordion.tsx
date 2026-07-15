import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SmoothAccordionProps {
  title: React.ReactNode | string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function SmoothAccordion({ title, children, defaultExpanded = false }: SmoothAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        aria-expanded={isExpanded}
        aria-controls="accordion-content"
      >
        <div className="font-semibold text-slate-800 dark:text-slate-200 text-left">
          {title}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-slate-400 p-1"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: 'easeInOut' },
              opacity: { duration: 0.25, ease: 'easeInOut' }
            }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
