import React from 'react';
import { Calculator, Info, Lightbulb, CheckCircle2 } from 'lucide-react';

export interface CalculationExplanationOptions {
  hasInputs: boolean;
  genericFormula?: { label: string; formula: string }[];
  activeBreakdown?: { label: string; formula: string; result: string }[];
  notes?: string[];
}

export function CalculationExplanation({
  hasInputs,
  genericFormula = [],
  activeBreakdown = [],
  notes = []
}: CalculationExplanationOptions) {
  if (!genericFormula.length && !activeBreakdown.length && !notes.length) {
    return null;
  }

  const matureColors = [
    'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
    'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-orange-300',
  ];

  const matureDotColors = [
    'bg-indigo-600 dark:bg-indigo-400',
    'bg-emerald-600 dark:bg-emerald-400',
    'bg-slate-600 dark:bg-slate-400',
    'bg-sky-600 dark:bg-sky-400',
    'bg-blue-700 dark:bg-orange-400'
  ];

  return (
    <div className="font-sans h-fit space-y-6">
      {!hasInputs ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Enter your dimensions to see the step-by-step calculation. Here are the formulas we use:
          </p>
          {genericFormula.map((item, idx) => (
            <div key={idx} className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-sm overflow-hidden">
              <span className="text-[13px] sm:text-base font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                {item.label}
              </span>
              <div className="font-mono text-sm text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                {item.formula}
              </div>
            </div>
          ))}
        </div>
      ) : (
            <div className="space-y-1">
              {activeBreakdown.map((step, idx) => {
                const colorClass = matureColors[idx % matureColors.length];
                const dotColorClass = matureDotColors[idx % matureDotColors.length];
                
                return (
                 <div key={idx} className="relative pl-8 pb-5">
                  <div className={`absolute left-[5px] top-2.5 w-3 h-3 rounded-full ${dotColorClass} shadow-sm z-10`} />
                  {idx !== activeBreakdown.length - 1 && (
                    <div className="absolute left-[10px] top-5 w-[2px] h-full bg-slate-200 dark:bg-slate-700/50 -z-0" />
                  )}
                  <span className="text-[13px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">
                    {step.label}
                  </span>
                  <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
                    <div className="font-mono text-[13px] sm:text-sm text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1">
                      {step.formula !== "Derived from calculation" ? step.formula : ""}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="text-slate-300 dark:text-slate-600 font-mono text-lg">=</span>
                      <div className={`px-4 py-1.5 rounded-full text-sm font-mono font-bold ${colorClass}`}>
                        {step.result}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {notes && notes.length > 0 && (
            <div className="mt-8 bg-white/60 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 flex gap-4 shadow-sm border border-white/50 dark:border-white/5 overflow-hidden">
              <Lightbulb className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block tracking-wide">
                  RULES OF THUMB / NOTES
                </span>
                <ul className="space-y-2">
                  {notes.map((note, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex gap-3">
                      <span className="text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" aria-hidden="true">•</span>
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
    </div>
  );
}
