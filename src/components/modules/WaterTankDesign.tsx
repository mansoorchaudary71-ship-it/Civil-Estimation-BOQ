import React from 'react';
import { Waves } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function WaterTankDesign() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 px-4 md:px-0">
      <div className="w-full bg-surface-default dark:bg-ink rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle dark:border-ink overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-txt-primary dark:text-txt-primary flex items-center gap-2">
            <Waves className="text-accent-700" /> Water Tank Design (IS 3370)
         </h2>
         <div className="p-4 sm:p-6 bg-accent-50 dark:bg-accent-500/10 rounded-2xl border border-accent-200 dark:border-accent-700/40 text-center overflow-hidden">
            <p className="text-accent-800 dark:text-accent-300 font-medium mb-2">This module assists with crack width checks and minimum steel requirements for liquid retaining structures.</p>
            <p className="text-accent-700 dark:text-accent-400 text-sm">Supports Rectangular and Circular overhead and underground scenarios.</p>
         </div>
      </div>
    
      <CalculationHistory calculatorId="watertankdesign_tool" currentInputs={{}} />
</div>
  );
}
