import React, { useState } from 'react';
import { Columns, ArrowUpRight } from 'lucide-react';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CalculationHistory } from '../ui/CalculationHistory';
import { FieldTooltip } from '../ui/FieldTooltip';

export default function FarFsiCalculator() {
  const [plotArea, setPlotArea] = useState<number>(500);
  const [fsiAllowed, setFsiAllowed] = useState<number>(2.0);
  const [groundCoveragePerc, setGroundCoveragePerc] = useState<number>(50);

  const totalBuiltUpAllowed = plotArea * fsiAllowed;
  const maxFootprint = plotArea * (groundCoveragePerc / 100);
  const maxFloors = Math.floor(totalBuiltUpAllowed / maxFootprint);

  const results = [
    { division: "Regulatory", description: "Max Permissible Built-up Area", unit: "m²", quantity: totalBuiltUpAllowed, rate: 0 },
    { division: "Regulatory", description: "Max Ground Footprint", unit: "m²", quantity: maxFootprint, rate: 0 },
    { division: "Regulatory", description: "Estimated Max Floors", unit: "nos", quantity: maxFloors, rate: 0 },
  ];

  return (
    <div className="w-full md:max-w-4xl md:mx-auto space-y-6 px-4 md:px-0">
      <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
        <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-slate-900 tracking-tight mb-4">
          <ArrowUpRight className="w-6 h-6 text-amber-500" />
          FAR/FSI Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">
              Plot Area (m²)
              <FieldTooltip content="The total designated area of the land parcel or plot." />
            </label>
            <><label htmlFor="a11y-input-228" className="sr-only">Input</label>
<input id="a11y-input-228" type="number" inputMode="decimal" value={plotArea || ''} onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500" /></>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">
              Permissible FSI/FAR
              <FieldTooltip content="Floor Space Index (FSI) or Floor Area Ratio (FAR) is the maximum allowed ratio of built-up area to the plot area. Eg: FSI of 2 means you can build twice the plot area." />
            </label>
            <><label htmlFor="a11y-input-229" className="sr-only">Input</label>
<input id="a11y-input-229" type="number" inputMode="decimal" step="0.1" value={fsiAllowed || ''} onChange={(e) => setFsiAllowed(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500" /></>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">
              Max Ground Coverage (%)
              <FieldTooltip content="The maximum percentage of the plot area that can be covered by the building's footprint on the ground floor." />
            </label>
            <><label htmlFor="a11y-input-230" className="sr-only">Input</label>
<input id="a11y-input-230" type="number" inputMode="decimal" max="100" value={groundCoveragePerc || ''} onChange={(e) => setGroundCoveragePerc(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500" /></>
          </div>
        </div>

        <div className="p-5 rounded-[24px] bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-200 mb-8 overflow-hidden">
           <h3 className="mb-3 text-lg font-medium text-slate-800 mb-4">What is FAR/FSI?</h3>
           <p className="mb-2 text-base font-normal text-slate-600 leading-relaxed">
             Floor Area Ratio (FAR) or Floor Space Index (FSI) is the ratio of a building's total floor area (gross floor area) to the size of the piece of land upon which it is built.
           </p>
           <p className="font-mono bg-white p-2 rounded border border-slate-200 inline-block text-base font-normal text-slate-600 leading-relaxed">
             Total Built Area = Plot Area × FSI
           </p>
        </div>

        <MaterialSummary items={results} onUpdateRate={() => {}} showRates={false} totalValue={0} />
      </div>
    
      <CalculationHistory calculatorId="farfsicalculator_tool" currentInputs={{}} />
</div>
  );
}
