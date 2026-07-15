import React, { useState } from 'react';
import { Home, ArrowLeftRight, ArrowDownUp } from 'lucide-react';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function BuildingSetbackCalculator() {
  const [plotArea, setPlotArea] = useState<number>(300);
  const [plotFrontage, setPlotFrontage] = useState<number>(15);
  const [plotDepth, setPlotDepth] = useState<number>(20);
  const [buildingType, setBuildingType] = useState<string>('residential');
  const [roadWidth, setRoadWidth] = useState<number>(9);

  let frontSetback = 0;
  let rearSetback = 0;
  let sideMargin = 0;

  // Simplified typical bylaws (based loosely on NBC/Local guidelines)
  if (plotArea <= 100) {
     frontSetback = 1.5; rearSetback = 0; sideMargin = 0;
  } else if (plotArea <= 250) {
     frontSetback = 2.0; rearSetback = 1.5; sideMargin = 1.0;
  } else if (plotArea <= 500) {
     frontSetback = 3.0; rearSetback = 2.0; sideMargin = 1.5;
  } else if (plotArea <= 1000) {
     frontSetback = 4.5; rearSetback = 3.0; sideMargin = 3.0;
  } else {
     frontSetback = 6.0; rearSetback = 4.5; sideMargin = 3.0;
  }

  // Adjust for building type or road width
  if (buildingType === 'commercial') {
     frontSetback = Math.max(frontSetback, 4.5); // Commercial needs more parking space
     if (roadWidth > 18) frontSetback = Math.max(frontSetback, 6.0);
  }

  const buildableFrontage = Math.max(0, plotFrontage - (2 * sideMargin));
  const buildableDepth = Math.max(0, plotDepth - frontSetback - rearSetback);
  const buildableArea = buildableFrontage * buildableDepth;
  const groundCoverage = (buildableArea / plotArea) * 100;

  const results = [
    { division: "Margins", description: "Front Setback", unit: "m", quantity: frontSetback, rate: 0 },
    { division: "Margins", description: "Rear Setback", unit: "m", quantity: rearSetback, rate: 0 },
    { division: "Margins", description: "Side Margins (Each)", unit: "m", quantity: sideMargin, rate: 0 },
    { division: "Buildable Metrics", description: "Max Ground Coverage", unit: "%", quantity: groundCoverage, rate: 0 },
    { division: "Buildable Metrics", description: "Max Buildable Footprint", unit: "m²", quantity: buildableArea, rate: 0 },
  ];

  return (
    <div className="w-full md:max-w-4xl md:mx-auto space-y-6 px-4 md:px-0">
      <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
        <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-slate-900 tracking-tight mb-4">
          <ArrowLeftRight className="w-6 h-6 text-purple-500" />
          Building Setback Calculator
        </h2>
        <p className="mb-6 text-base font-normal text-slate-600 leading-relaxed">Estimate minimum required boundary margins per typical NBC guidelines based on plot size.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Plot Frontage (m)</label>
            <><label htmlFor="a11y-input-128" className="sr-only">Input</label>
<input id="a11y-input-128" type="number" inputMode="decimal" value={plotFrontage} onChange={(e) => { setPlotFrontage(parseFloat(e.target.value) || 0); setPlotArea((parseFloat(e.target.value) || 0) * plotDepth); }} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full" /></>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Plot Depth (m)</label>
            <><label htmlFor="a11y-input-129" className="sr-only">Input</label>
<input id="a11y-input-129" type="number" inputMode="decimal" value={plotDepth} onChange={(e) => { setPlotDepth(parseFloat(e.target.value) || 0); setPlotArea(plotFrontage * (parseFloat(e.target.value) || 0)); }} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full" /></>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Total Plot Area (m²)</label>
            <><label htmlFor="a11y-input-130" className="sr-only">Input</label>
<input id="a11y-input-130" type="number" inputMode="decimal" value={plotArea} className="w-full bg-slate-100 border border-transparent px-4 py-3 rounded-full min-h-[44px] text-base font-normal" disabled /></>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Building Type</label>
            <select value={buildingType} onChange={(e) => setBuildingType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-[24px] overflow-hidden">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial/Public</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Approach Road Width (m)</label>
            <><label htmlFor="a11y-input-131" className="sr-only">Input</label>
<input id="a11y-input-131" type="number" inputMode="decimal" value={roadWidth} onChange={(e) => setRoadWidth(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-full" /></>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="relative w-full h-64 bg-slate-100 border border-slate-200 mb-8 flex items-center justify-center rounded-[24px] overflow-hidden">
           <div className="absolute top-2 text-base font-medium">Rear Setback: {rearSetback}m</div>
           <div className="absolute bottom-2 text-base font-medium">Front Setback: {frontSetback}m &darr; Road {roadWidth}m Wide</div>
           <div className="absolute left-2 text-base font-medium" style={{writingMode: 'vertical-rl'}}>Side: {sideMargin}m</div>
           <div className="absolute right-2 text-base font-medium" style={{writingMode: 'vertical-rl'}}>Side: {sideMargin}m</div>
           
           <div className="bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center text-indigo-700 font-bold text-center" style={{ 
               width: `\${Math.max(20, (buildableFrontage/plotFrontage)*100)}%`, 
               height: `\${Math.max(20, (buildableDepth/plotDepth)*100)}%` 
           }}>
              Buildable Area<br/>{buildableArea.toFixed(1)} m²
           </div>
        </div>

        <MaterialSummary items={results} onUpdateRate={() => {}} showRates={false} totalValue={0} />
      </div>
    
      <CalculationHistory calculatorId="buildingsetbackcalculator_tool" currentInputs={{}} />
</div>
  );
}
