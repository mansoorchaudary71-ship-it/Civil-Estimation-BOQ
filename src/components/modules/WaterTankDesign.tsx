import React from 'react';
import { Waves } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function WaterTankDesign() {
  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl md:mx-auto px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-4 sm:p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Waves className="text-pink-600" /> Water Tank Design (IS 3370)
         </h2>
         <div className="p-4 sm:p-6 bg-pink-50 dark:bg-pink-900/20 rounded-2xl border border-pink-100 dark:border-pink-900 text-center overflow-hidden">
            <p className="text-pink-800 dark:text-pink-200 font-medium mb-2">This module assists with crack width checks and minimum steel requirements for liquid retaining structures.</p>
            <p className="text-pink-600 dark:text-pink-400 text-sm">Supports Rectangular and Circular overhead and underground scenarios.</p>
         </div>
      </div>
    
      <CalculationHistory calculatorId="watertankdesign_tool" currentInputs={{}} />
</div>
  );
}
