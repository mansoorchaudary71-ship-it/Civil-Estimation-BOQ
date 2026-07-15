import React from 'react';
import { Pickaxe } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function PileFoundationCalculator() {
  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl md:mx-auto px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Pickaxe className="text-pink-600" /> Pile Foundation (IS 2911)
         </h2>
         <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] text-center overflow-hidden">
            <p className="text-slate-700 dark:text-slate-300 font-medium">Calculation of skin friction, end bearing capacity, and group efficiency for bored and driven piles.</p>
         </div>
      </div>
    
      <CalculationHistory calculatorId="pilefoundationcalculator_tool" currentInputs={{}} />
</div>
  );
}
