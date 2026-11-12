import { Button } from './/Button';
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
    <div className="bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink rounded-2xl overflow-hidden shadow-brand-sm">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-colors hover:bg-surface-hover/50"
        aria-expanded={isExpanded}
        aria-controls="accordion-content"
      >
        <div className="font-semibold text-txt-primary dark:text-txt-primary text-left">
          {title}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-txt-tertiary p-1"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </Button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="accordion-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border-color mt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
