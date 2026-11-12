import { Button } from './/Button';
import React from 'react';
import { X, Calculator, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormulaVisualizer } from './FormulaVisualizer';


export function FormulaModal({
  isOpen,
  onClose,
  title,
  formulaDescription,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formulaDescription: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[85vh] bg-surface-default dark:bg-ink rounded-2xl shadow-2xl z-[201] overflow-hidden border border-border-color dark:border-ink flex flex-col"
          >
            <div className="p-4 sm:p-6 border-b border-border-color dark:border-ink shrink-0 flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-txt-primary dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-accent-800" />
                Formula & Variables
              </h3>
              <Button
                onClick={onClose}
                className="p-2 -mr-2 text-txt-tertiary hover:text-txt-secondary dark:hover:text-txt-primary transition-colors rounded-full hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <div className="flex items-start gap-3 mb-6 bg-accent-50 dark:bg-accent-500/10 p-4 rounded-2xl border border-accent-100/50 dark:border-accent-800/20 overflow-hidden">
                <Info className="w-5 h-5 text-accent-800 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-accent-800 dark:text-accent-400 leading-relaxed">
                  The {title} uses internationally recognized civil engineering methodologies. Here is a breakdown of the core formulas and variables used to arrive at your results.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-surface-default/50 rounded-2xl p-5 border border-border-color dark:border-ink-600/50 overflow-hidden">
                  <h4 className="text-sm font-semibold text-txt-primary dark:text-txt-primary mb-3 uppercase tracking-wider">Methodology Description</h4>
                  <div className="text-txt-secondary dark:text-txt-tertiary text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {formulaDescription}
                  </div>
                </div>
              </div>

              <FormulaVisualizer title={title} />
            </div>
            
            <div className="p-6 pt-0 shrink-0 mt-2">
              <Button
                onClick={onClose}
                className="w-full py-3.5 bg-ink hover:bg-ink dark:bg-ink dark:hover:bg-ink-700 text-white rounded-xl font-semibold transition-colors"
              >
                Understood
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
