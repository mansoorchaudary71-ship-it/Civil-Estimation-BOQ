import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calculator } from 'lucide-react';

export interface FormulaStep {
  id?: string | number;
  label?: string;
  theoretical: string;
  applied: string;
}

interface FormulaAccordionProps {
  title?: string;
  steps: FormulaStep[];
  defaultExpanded?: boolean;
}

export function FormulaAccordion({ 
  title = "Calculation Steps & Formulas Used", 
  steps,
  defaultExpanded = false
}: FormulaAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Helper to render math with monospace style for variables/numbers
  const renderMath = (text: string) => {
    // Basic parser to wrap things that look like variables or numbers in a monospace tag
    // For this simple version, we'll just assume the user passes pre-formatted strings,
    // or we can just apply a global monospace style to the whole block to make it look like code.
    return text;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-slate-50 hover:bg-slate-100 transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
            <Calculator size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-slate-500"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-4 sm:p-6 border-t border-slate-200 space-y-6">
              {steps.map((step, index) => (
                <div key={step.id || index} className="space-y-3">
                  {step.label && (
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                      {step.label}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Theoretical Formula */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                      <span className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                        Theoretical Formula
                      </span>
                      <div className="mt-2 font-mono text-sm text-slate-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {renderMath(step.theoretical)}
                      </div>
                    </div>
                    
                    {/* Applied Formula */}
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 relative">
                      <span className="absolute top-0 right-0 bg-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                        Applied Values
                      </span>
                      <div className="mt-2 font-mono text-sm text-indigo-900 overflow-x-auto whitespace-pre-wrap leading-relaxed font-semibold">
                        {renderMath(step.applied)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
