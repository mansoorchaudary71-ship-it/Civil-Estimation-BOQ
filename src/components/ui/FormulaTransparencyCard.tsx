import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Beaker, Calculator, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormulaProp {
  name: string;
  formula: string;
  variables: { [key: string]: string | number };
  result: string | number;
}

interface FormulaTransparencyCardProps {
  title?: string;
  constants?: { name: string; value: string; unit: string }[];
  formulas?: FormulaProp[];
  description?: string;
}

export default function FormulaTransparencyCard({ 
  title = "Calculation Logic & Formulas", 
  constants = [
    { name: "Sand Density", value: "1,600", unit: "kg/m³" },
    { name: "Aggregate Density", value: "1,600", unit: "kg/m³" },
    { name: "Cement Bag Weight", value: "50", unit: "kg (0.035 m³)" },
    { name: "Steel Thumb-Rule", value: "4", unit: "kg / sq.ft" },
    { name: "Brick Thumb-Rule", value: "8", unit: "Bricks / sq.ft" }
  ],
  formulas = [],
  description = "This calculation uses standard civil engineering practices and empirical thumb-rules."
}: FormulaTransparencyCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
          <Calculator size={18} className="text-indigo-500" />
          {title}
        </div>
        {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200 dark:border-slate-800"
          >
            <div className="p-5 space-y-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>

              {constants && constants.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                    <Beaker size={14} className="text-emerald-500" />
                    Standard Constants & Assumptions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {constants.map((c, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{c.value}</span>
                          <span className="text-[10px] text-slate-400 ml-1">{c.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formulas && formulas.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">
                    <BookOpen size={14} className="text-blue-500" />
                    Step-by-Step Mathematical Derivation
                  </h4>
                  <div className="space-y-3">
                    {formulas.map((f, i) => (
                      <div key={i} className="p-4 bg-slate-100 dark:bg-slate-950 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-800">
                        <div className="text-slate-500 dark:text-slate-400 text-xs mb-1 uppercase font-sans font-bold">{f.name}</div>
                        <div className="text-indigo-600 dark:text-indigo-400 mb-2 font-semibold">Formula: {f.formula}</div>
                        <div className="text-slate-600 dark:text-slate-300 text-xs mb-2">
                          Values: {Object.entries(f.variables).map(([k, v]) => `${k} = ${v}`).join(', ')}
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 text-slate-800 dark:text-slate-200 font-bold">
                          Result: {f.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
