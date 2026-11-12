import { Button } from './/Button';
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
    <div className="mt-8 bg-surface-default border border-ui-borderSubtle dark:border-ink rounded-xl overflow-hidden shadow-brand-sm">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-surface-default dark:bg-ink hover:bg-surface-hover dark:hover:bg-ink-700 transition-colors"
      >
        <div className="flex items-center gap-2 text-txt-primary dark:text-txt-primary font-semibold text-sm">
          <Calculator size={18} className="text-accent-800" />
          {title}
        </div>
        {isOpen ? <ChevronUp size={18} className="text-txt-tertiary" /> : <ChevronDown size={18} className="text-txt-tertiary" />}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-ui-borderSubtle dark:border-ink"
          >
            <div className="p-5 space-y-6">
              <p className="text-sm text-txt-secondary dark:text-txt-tertiary">
                {description}
              </p>

              {constants && constants.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-txt-primary dark:text-txt-primary mb-3 uppercase tracking-wider">
                    <Beaker size={14} className="text-ui-successText" />
                    Standard Constants & Assumptions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {constants.map((c, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-surface-default dark:bg-ink rounded border border-border-color dark:border-ink-600">
                        <span className="text-xs text-txt-tertiary dark:text-txt-tertiary font-medium">{c.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-txt-primary dark:text-txt-primary">{c.value}</span>
                          <span className="text-xs text-txt-tertiary ml-1">{c.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formulas && formulas.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-txt-primary dark:text-txt-primary mb-3 uppercase tracking-wider">
                    <BookOpen size={14} className="text-accent-800" />
                    Step-by-Step Mathematical Derivation
                  </h4>
                  <div className="space-y-3">
                    {formulas.map((f, i) => (
                      <div key={i} className="p-4 bg-surface-hover dark:bg-ink-900 rounded-lg font-mono text-sm border border-ui-borderSubtle dark:border-ink">
                        <div className="text-txt-tertiary dark:text-txt-tertiary text-xs mb-1 uppercase font-sans font-bold">{f.name}</div>
                        <div className="text-accent-800 dark:text-accent-400 mb-2 font-semibold">Formula: {f.formula}</div>
                        <div className="text-txt-secondary dark:text-txt-tertiary text-xs mb-2">
                          Values: {Object.entries(f.variables).map(([k, v]) => `${k} = ${v}`).join(', ')}
                        </div>
                        <div className="border-t border-ui-borderSubtle dark:border-ink pt-2 mt-2 text-txt-primary dark:text-txt-primary font-bold">
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
