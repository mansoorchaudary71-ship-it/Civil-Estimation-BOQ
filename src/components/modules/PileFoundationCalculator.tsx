import React from 'react';
import { Pickaxe } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function PileFoundationCalculator() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 px-4 md:px-0">
      <div className="w-full bg-surface-default dark:bg-ink rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle dark:border-ink overflow-hidden">
         <h2 className="text-xl font-semibold mb-6 text-txt-primary dark:text-txt-primary flex items-center gap-2">
            <Pickaxe className="text-accent-700" /> Pile Foundation (IS 2911)
         </h2>
         <div className="p-4 sm:p-6 bg-surface-default rounded-2xl text-center overflow-hidden">
            <p className="text-txt-secondary dark:text-txt-tertiary font-medium">Calculation of skin friction, end bearing capacity, and group efficiency for bored and driven piles.</p>
         </div>
      </div>
    
      <CalculationHistory calculatorId="pilefoundationcalculator_tool" currentInputs={{}} />
</div>
  );
}
