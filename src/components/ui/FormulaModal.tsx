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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[201] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col"
          >
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Formula & Variables
              </h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <div className="flex items-start gap-3 mb-6 bg-indigo-50/50 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 overflow-hidden">
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  The {title} uses internationally recognized civil engineering methodologies. Here is a breakdown of the core formulas and variables used to arrive at your results.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Methodology Description</h4>
                  <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {formulaDescription}
                  </div>
                </div>
              </div>

              <FormulaVisualizer title={title} />
            </div>
            
            <div className="p-6 pt-0 shrink-0 mt-2">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
