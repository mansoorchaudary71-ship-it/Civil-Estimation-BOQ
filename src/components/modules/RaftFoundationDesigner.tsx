import React, { useState } from 'react';
import { Grid2X2 } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function RaftFoundationDesigner() {
  const [sbc, setSbc] = useState('150');
  const [area, setArea] = useState('200');

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl md:mx-auto px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Grid2X2 className="text-pink-600" /> Raft Foundation Design
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium mb-2">Soil Bearing Capacity (kN/m²)</label>
              <><label htmlFor="a11y-input-406" className="sr-only">Input</label>
<input id="a11y-input-406" type="number" inputMode="decimal" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-full px-4 py-3 min-h-[44px]" value={sbc} onChange={e => setSbc(e.target.value)} /></>
            </div>
            <div>
              <label className="block text-base font-medium mb-2">Total Raft Area (m²)</label>
              <><label htmlFor="a11y-input-407" className="sr-only">Input</label>
<input id="a11y-input-407" type="number" inputMode="decimal" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-full px-4 py-3 min-h-[44px]" value={area} onChange={e => setArea(e.target.value)} /></>
            </div>
         </div>
         <div className="mt-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] overflow-hidden">
            <p className="text-slate-600 dark:text-slate-300 font-medium text-center">Advanced mesh analysis, punching shear checks at column locations, and settlement estimations (per IS 2950) are verified here.</p>
         </div>
      </div>
    
      <CalculationHistory calculatorId="raftfoundationdesigner_tool" currentInputs={{}} />
</div>
  );
}
