import React, { useState, useMemo } from "react";
import { Bug, Droplets, FlaskConical, AlertTriangle, Route } from "lucide-react";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SEO } from "../SEO";

export default function AntiTermiteCalculator() {
  const [floorArea, setFloorArea] = useState<number | "">(100);
  const [perimeter, setPerimeter] = useState<number | "">(40);
  const [trenchDepth, setTrenchDepth] = useState<number | "">(0.5);

  const chemicals = [
    { name: "Chlorpyrifos 20% EC", ratio: 19 },
    { name: "Bifenthrin 2.5% EC", ratio: 19 },
    { name: "Imidacloprid 30.5% SC", ratio: 475 },
    { name: "Custom Mix", ratio: 0 },
  ];

  const [selectedChemical, setSelectedChemical] = useState(chemicals[0]);
  const [customRatio, setCustomRatio] = useState<number | "">(19);

  const results = useMemo(() => {
    const fArea = Number(floorArea) || 0;
    const p = Number(perimeter) || 0;
    const d = Number(trenchDepth) || 0;

    // Rules:
    // Floor Area: 5 Liters of emulsion per square meter
    // Perimeter Trench: 7.5 Liters of emulsion per linear meter per meter of depth -> perimeter * depth * 7.5
    const emulsionFloorL = fArea * 5;
    const wallArea = p * d;
    const emulsionTrenchL = wallArea * 7.5;
    const totalEmulsionL = emulsionFloorL + emulsionTrenchL;

    const dilutionParts = selectedChemical.ratio === 0 ? (Number(customRatio) || 19) : selectedChemical.ratio;
    
    // The total mixed solution consists of 1 part chemical + N parts water.
    // Total Emulsion = Chemical Volume + Water Volume
    // Total Parts = 1 + dilutionParts
    const totalParts = 1 + dilutionParts;
    
    const chemicalConcentrateL = totalEmulsionL / totalParts;
    const waterL = totalEmulsionL - chemicalConcentrateL;

    return {
      fArea,
      wallArea,
      emulsionFloor: emulsionFloorL,
      emulsionTrench: emulsionTrenchL,
      totalEmulsion: totalEmulsionL,
      chemicalConcentrate: chemicalConcentrateL,
      water: waterL,
      totalParts,
      dilutionParts
    };
  }, [floorArea, perimeter, trenchDepth, selectedChemical, customRatio]);

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto animate-in fade-in px-4 md:px-0">
      <SEO 
        title="Anti-Termite Treatment Estimator | Civil Estimation Pro" 
        description="Calculate exact chemical emulsion and water dilution rates for pre-construction treatment of foundations, floors, and perimeters."
      />

      <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
         <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-slate-900 tracking-tight mb-4">
          <Bug className="w-6 h-6 text-indigo-600" />
          Anti-Termite Treatment & Emulsion Engine
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Surface Dimensions</h3>
                  <div className="space-y-4">
                    <NumberInput label="Total Ground Floor Area" unit="m²" value={floorArea} onChange={setFloorArea} />
                    <NumberInput label="Total Outer Perimeter" unit="m" value={perimeter} onChange={setPerimeter} />
                    <NumberInput label="Perimeter Trench Depth" unit="m" value={trenchDepth} onChange={setTrenchDepth} />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Chemical Configuration</h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Treatment Chemical</label>
                        <select 
                            value={selectedChemical.name}
                            onChange={(e) => setSelectedChemical(chemicals.find(c => c.name === e.target.value) || chemicals[0])}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-sm font-medium focus:outline-none"
                        >
                            {chemicals.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={selectedChemical.ratio === 0 ? "block" : "opacity-50 pointer-events-none"}>
                         <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Water Parts (1:X)</label>
                         <div className="flex items-center gap-3">
                             <div className="text-slate-600 font-bold font-mono">1 : </div>
                             <div className="flex-1">
                                 <NumberInput label="" unit="parts water" value={customRatio} onChange={setCustomRatio} />
                             </div>
                         </div>
                    </div>
                  </div>
                </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
                <MaterialSummary 
                    title="Volume Analytics & Mixed Emulsion"
                    totalLabel="Required Emulsion (Mixed Solution)"
                    totalValue={results.totalEmulsion.toFixed(1)}
                    totalUnit="Liters"
                    relatedToolIds={[]}
                    className="mb-0"
                >
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <ResultCard title="Floor Treatment (5 L/m²)" value={results.emulsionFloor.toFixed(1)} unit="Liters" variant="info" />
                        <ResultCard title="Trench Treatment (7.5 L/m²)" value={results.emulsionTrench.toFixed(1)} unit="Liters" variant="warning" />
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl overflow-hidden">
                            <h4 className="text-indigo-900 mb-4 flex items-center justify-between text-lg font-medium text-slate-800">
                                <span>Pure Chemical Needed</span>
                                <span className="text-sm bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full uppercase tracking-wider">Dilution 1:{results.dilutionParts.toFixed(1)}</span>
                            </h4>
                            
                            <div className="flex items-end gap-2">
                                <span className="font-mono text-xl font-bold text-indigo-700 tracking-tight">{results.chemicalConcentrate.toFixed(2)}</span>
                                <span className="font-bold text-indigo-600/70 mb-1">Liters</span>
                            </div>
                        </div>

                        <div className="bg-cyan-50 border border-cyan-200 p-5 rounded-2xl overflow-hidden">
                            <h4 className="text-cyan-900 mb-4 flex items-center justify-between text-lg font-medium text-slate-800">
                                <span>Water Needed For Mixing</span>
                                <Droplets className="w-4 h-4 text-cyan-500" />
                            </h4>
                            
                            <div className="flex items-end gap-2">
                                <span className="font-mono text-xl font-bold text-cyan-700 tracking-tight">{results.water.toFixed(1)}</span>
                                <span className="font-bold text-cyan-600/70 mb-1">Liters</span>
                            </div>
                        </div>
                    </div>
                </MaterialSummary>
            </div>
        </div>
       </div>
    
      <CalculationHistory 
        calculatorId="anti_termite_calculator" 
        currentInputs={{ floorArea, perimeter, trenchDepth, "Chemical": selectedChemical.name, "Custom Ratio": customRatio }} 
      />
    </div>
  );
}
