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
    'bg-accent-50 text-accent-800 dark:bg-accent-500/10 dark:text-accent-400',
    'bg-ui-success text-ui-successText dark:bg-ui-successText/10 dark:text-ui-successText',
    'bg-surface-hover text-txt-secondary dark:bg-secondary-500/10 dark:text-txt-tertiary',
    'bg-accent-50 text-accent-800 dark:bg-accent-500/10 dark:text-accent-300',
    'bg-accent-50 text-accent-800 dark:bg-accent-500/10 dark:text-accent-400',
  ];

  const matureDotColors = [
    'bg-ink dark:bg-accent-400',
    'bg-ui-successText dark:bg-ui-successText',
    'bg-ink-500 dark:bg-secondary-400',
    'bg-accent-700 dark:bg-accent-400',
    'bg-ink dark:bg-accent-500'
  ];

  return (
    <div className="font-sans h-fit space-y-6">
      {!hasInputs ? (
        <div className="space-y-4">
          <p className="text-sm text-txt-tertiary dark:text-txt-tertiary mb-2">
            Enter your dimensions to see the step-by-step calculation. Here are the formulas we use:
          </p>
          {genericFormula.map((item, idx) => (
            <div key={idx} className="bg-surface-default/90 dark:bg-ink/80 backdrop-blur-md rounded-2xl p-4 shadow-brand-sm overflow-hidden">
              <span className="text-[13px] sm:text-base font-semibold text-txt-secondary dark:text-txt-tertiary block mb-2">
                {item.label}
              </span>
              <div className="font-mono text-sm text-txt-secondary dark:text-txt-tertiary overflow-x-auto pb-1">
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
                  <div className={`absolute left-[5px] top-2.5 w-3 h-3 rounded-full ${dotColorClass} shadow-brand-sm z-10`} />
                  {idx !== activeBreakdown.length - 1 && (
                    <div className="absolute left-[10px] top-5 w-[2px] h-full bg-surface-active/50 -z-0" />
                  )}
                  <span className="text-[13px] font-bold uppercase tracking-widest text-txt-tertiary dark:text-txt-tertiary block mb-2">
                    {step.label}
                  </span>
                  <div className="bg-surface-default/90 dark:bg-ink/80 backdrop-blur-md rounded-2xl p-4 shadow-brand-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
                    <div className="font-mono text-[13px] sm:text-sm text-txt-secondary dark:text-txt-tertiary overflow-x-auto whitespace-nowrap scrollbar-hide flex-1">
                      {step.formula !== "Derived from calculation" ? step.formula : ""}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="text-txt-tertiary dark:text-txt-secondary font-mono text-lg">=</span>
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
            <div className="mt-8 bg-surface-default/60 dark:bg-ink/40 backdrop-blur-md rounded-2xl p-5 flex gap-4 shadow-brand-sm border border-white/50 dark:border-white/5 overflow-hidden">
              <Lightbulb className="w-5 h-5 text-txt-secondary dark:text-txt-tertiary shrink-0 mt-0.5" />
              <div className="space-y-3">
                <span className="text-sm font-bold text-txt-primary dark:text-txt-primary block tracking-wide">
                  RULES OF THUMB / NOTES
                </span>
                <ul className="space-y-2">
                  {notes.map((note, idx) => (
                    <li key={idx} className="text-sm text-txt-secondary dark:text-txt-tertiary flex gap-3">
                      <span className="text-txt-tertiary dark:text-txt-secondary shrink-0 mt-0.5" aria-hidden="true">•</span>
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
