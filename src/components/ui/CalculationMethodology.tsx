import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';

export interface CalculationStep {
  title: string;
  formula: string;
  variables: { name: string; value: string | number; unit?: string }[];
  substitution: string;
  result: { value: string | number; unit: string };
  justification?: string;
}

export interface CalculationMethodologyProps {
  steps: CalculationStep[];
  className?: string;
}

export function CalculationMethodology({ steps, className = '' }: CalculationMethodologyProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className={`w-full max-w-4xl mx-auto mt-8 mb-4 font-sans ${className}`}>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-200/80 dark:border-slate-700/50 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 focus:outline-none"
        >
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.1rem] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
              <Calculator className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                Calculation Logic
              </h3>
              <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1">
                Transparent breakdown of mathematical formulas
              </p>
            </div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 shrink-0">
            {isOpen ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />}
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-6 md:px-8 pb-8 pt-2 space-y-6 md:space-y-8">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/50 dark:bg-slate-800/20 rounded-[1.5rem] p-5 md:p-6 border border-slate-200/60 dark:border-slate-700/50 relative"
                >
                  <h4 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-3">
                    <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm md:text-base font-black text-slate-600 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    {step.title}
                  </h4>

                  <div className="space-y-5">
                    {/* Formula */}
                    <div>
                      <span className="text-sm md:text-base font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
                        Core Formula
                      </span>
                      <div className="font-mono text-sm md:text-base px-4 py-3 rounded-xl bg-bg-card border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold overflow-x-auto shadow-sm">
                        {step.formula}
                      </div>
                    </div>

                    {/* Variables */}
                    {step.variables && step.variables.length > 0 && (
                      <div>
                        <span className="text-sm md:text-base font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
                          Variable Breakdown
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                          {step.variables.map((v, vIdx) => (
                            <div
                              key={vIdx}
                              className="flex justify-between items-center px-4 py-2.5 bg-bg-card rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm"
                            >
                              <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">
                                {v.name}
                              </span>
                              <div className="text-sm md:text-base">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {v.value}
                                </span>
                                {v.unit && (
                                  <span className="text-slate-500 dark:text-slate-400 font-bold ml-1">
                                    {v.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Substitution & Result */}
                    <div>
                      <span className="text-sm md:text-base font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
                        Step-by-Step Substitution
                      </span>
                      <div className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="font-mono text-sm md:text-base text-slate-600 dark:text-slate-400 mb-3 whitespace-nowrap overflow-x-auto pb-1">
                          {step.substitution}
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Yields
                          </span>
                          <div className="font-mono text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            = {step.result.value}{' '}
                            <span className="text-base md:text-lg font-bold">
                              {step.result.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Justification */}
                    {step.justification && (
                      <div className="flex gap-3 p-4 md:p-5 rounded-xl bg-blue-50 dark:bg-orange-950/20 border border-blue-100 dark:border-orange-900/30">
                        <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-500 dark:text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-sm md:text-base font-semibold text-orange-800 dark:text-orange-300 leading-relaxed">
                          {step.justification}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
