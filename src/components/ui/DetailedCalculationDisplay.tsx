import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Lightbulb, Beaker } from 'lucide-react';

export interface CalcVariable {
  name: string;
  value: string | number;
  unit?: string;
}

export interface CalcStep {
  stepName: string;
  equation: string;
  variables: CalcVariable[];
  substitution: string;
  result: string | number;
  resultUnit?: string;
  insight?: string;
  resultColor?: "emerald" | "purple" | "blue" | "orange";
}

export interface DetailedCalculationDisplayProps {
  title?: string;
  subtitle?: string;
  steps: CalcStep[];
  className?: string;
}

function StepCard({ step, idx }: { step: CalcStep; idx: number }) {
  const [showInsight, setShowInsight] = useState(false);

  return (
    <div className="w-full bg-white/80 dark:bg-slate-800/80 rounded-[20px] p-5 sm:p-4 sm:p-4 sm:p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
      <h4 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-black">
          {idx + 1}
        </span>
        {step.stepName}
      </h4>

      <div className="space-y-6">
        {/* Scientific Derivation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-base font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Beaker className="w-4 h-4" /> Core Equation
            </h5>
            {step.insight && (
              <button
                onClick={() => setShowInsight(!showInsight)}
                className="text-sm flex items-center gap-1.5 font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                title="View Scientific Justification"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showInsight ? 'Hide Insights' : 'Why this formula?'}
              </button>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 overflow-x-auto text-sm sm:text-base font-mono font-semibold text-slate-700 dark:text-slate-300">
            {step.equation}
          </div>
        </div>

        {/* Variable Breakdown */}
        {step.variables && step.variables.length > 0 && (
          <div>
            <h5 className="text-base font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Input Variables
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {step.variables.map((v, vIdx) => (
                <div
                  key={vIdx}
                  className="flex justify-between items-center px-4 py-3 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {v.name}
                  </span>
                  <div className="text-sm">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {v.value}
                    </span>
                    {v.unit && (
                      <span className="text-slate-400 dark:text-slate-500 font-bold ml-1">
                        {v.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Insight (Toggled) */}
        {step.insight && showInsight && (
          <div className="flex gap-3 p-4 sm:p-5 rounded-[16px] bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <Lightbulb className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
               <h5 className="text-base font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                 Engineering Justification
               </h5>
               <p className="text-sm sm:text-base font-semibold text-indigo-900 dark:text-indigo-100 leading-relaxed">
                 {step.insight}
               </p>
            </div>
          </div>
        )}

        {/* Step-by-Step Substitution */}
        <div className="bg-slate-800 dark:bg-slate-900/40 rounded-[16px] p-4 sm:p-5 text-white">
          <h5 className="text-base font-medium uppercase tracking-wider text-slate-400 mb-3">
            Computation
          </h5>
          <div className="font-mono text-sm sm:text-base text-slate-300 mb-4 whitespace-nowrap overflow-x-auto pb-2 border-b border-slate-700/50">
            {step.substitution}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
             <span className="text-sm font-medium text-slate-400">Result Yields</span>
             <div className={`px-5 py-2 rounded-full inline-flex items-baseline gap-1.5 w-fit border ${
               step.resultColor === "purple" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
               step.resultColor === "blue" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
               step.resultColor === "orange" ? "bg-blue-500/20 text-orange-400 border-blue-600/30" :
               "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
             }`}>
               <span className="font-mono text-xl sm:text-2xl font-black whitespace-nowrap">{step.result}</span>
               {step.resultUnit && <span className="font-bold text-sm sm:text-base">{step.resultUnit}</span>}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function DetailedCalculationDisplay({ 
  title = "Calculation Methodology", 
  subtitle = "Step-by-step rigorous engineering derivation", 
  steps, 
  className = '' 
}: DetailedCalculationDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className={`w-full max-w-4xl mx-auto mt-8 mb-4 font-sans ${className}`}>
      <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/40 dark:border-slate-800/60 overflow-hidden transition-all duration-300">
        
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40 focus:outline-none rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
              <Calculator className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 shrink-0">
            {isOpen ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-5 sm:px-8 pb-8 pt-2 space-y-6">
              {steps.map((step, idx) => (
                <StepCard key={idx} step={step} idx={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
