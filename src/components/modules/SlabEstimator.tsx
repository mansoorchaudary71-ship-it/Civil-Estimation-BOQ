import React, { useState } from "react";
import { Grid2X2, Settings2, Replace, ArrowUp, AlertTriangle } from "lucide-react";
import { SEO } from "../SEO";
import { CalculationHistory } from "../ui/CalculationHistory";
import { StyledChart } from "../ui/EstimateVisualizer";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";

import { FieldTooltip } from "../ui/FieldTooltip";
import { NumberInput } from "../ui/NumberInput";
import { ToolGuidedTour, TourStep } from "../ui/ToolGuidedTour";

const SLAB_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '#tour-slab-type',
    title: 'Slab Type',
    content: 'Toggle between One-Way and Two-Way slab calculations. This affects the reinforcement distribution formulas.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-slab-dimensions',
    title: 'Slab Dimensions',
    content: 'Enter the long span (ly) and short span (lx) of your slab in meters.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-slab-thickness',
    title: 'Slab Thickness',
    content: 'Enter the slab thickness in millimeters. This is used to compute the total concrete volume.',
    placement: 'bottom'
  }
];

export default function SlabEstimator() {
  const [slabType, setSlabType] = useState<"one-way" | "two-way">("two-way");
  const [isPrecast, setIsPrecast] = useState(false);
  const [concreteDensity, setConcreteDensity] = useState("2400");
  const [riggingRadius, setRiggingRadius] = useState("5");
  
  const [ly, setLy] = useState("5"); // Long Span (meters)
  const [lx, setLx] = useState("4"); // Short Span (meters)
  const [thickness, setThickness] = useState("150"); // mm
  const [clearCover, setClearCover] = useState("20"); // mm
  
  const [mainDia, setMainDia] = useState("12"); // mm (Short Span/Main)
  const [distDia, setDistDia] = useState("10"); // mm (Long Span/Distribution)
  const [mainSpacing, setMainSpacing] = useState("150"); // mm
  const [distSpacing, setDistSpacing] = useState("150"); // mm

  const [results, setResults] = useState<{
    type: "one-way" | "two-way";
    concreteVolumeWet: number;
    concreteVolumeDry: number;
    shortBarsCount: number;
    shortBarsTotalLength: number;
    longBarsCount: number;
    longBarsTotalLength: number;
    totalSteelWeight: number;
    elementWeightKg: number;
    craneCapacityTonnes: number;
  } | null>(null);

  const calculateSlab = () => {
    const l_y = parseFloat(ly);
    const l_x = parseFloat(lx);
    const t = parseFloat(thickness);
    const ds = parseFloat(mainDia);
    const dl = parseFloat(distDia);
    const ss = parseFloat(mainSpacing);
    const sl = parseFloat(distSpacing);
    const c = parseFloat(clearCover);
    const density = parseFloat(concreteDensity) || 2400;
    const radius = parseFloat(riggingRadius) || 5;

    if (
      isNaN(l_y) || isNaN(l_x) || isNaN(t) || isNaN(ds) || 
      isNaN(dl) || isNaN(ss) || isNaN(sl) || isNaN(c) ||
      l_y <= 0 || l_x <= 0 || t <= 0 || ss <= 0 || sl <= 0
    ) {
      return;
    }

    // Concrete Volume
    const concreteVolumeWet = l_x * l_y * (t / 1000);
    const concreteVolumeDry = concreteVolumeWet * 1.54; // RULE: CONCRETE_DRY_VOLUME

    // Precast Calculations
    const elementWeightKg = concreteVolumeWet * density;
    const craneCapacityTonnes = (elementWeightKg * 1.5 * radius) / 1000;

    // Dimensions in mm
    const lx_mm = l_x * 1000;
    const ly_mm = l_y * 1000;

    let shortBarsCount = 0;
    let shortBarsTotalLength = 0;
    let longBarsCount = 0;
    let longBarsTotalLength = 0;

    if (slabType === "two-way") {
      const h_short = t - 2 * c;
      const h_long = t - 2 * c - ds; 

      // Short Span Bars (Parallel to lx, spread along ly)
      shortBarsCount = Math.ceil(ly_mm / ss) + 1; 
      const shortBarCutLength = lx_mm - 2 * c + 0.42 * h_short;
      shortBarsTotalLength = (shortBarsCount * shortBarCutLength) / 1000; 

      // Long Span Bars (Parallel to ly, spread along lx)
      longBarsCount = Math.ceil(lx_mm / sl) + 1; 
      const longBarCutLength = ly_mm - 2 * c + 0.42 * Math.max(0, h_long);
      longBarsTotalLength = (longBarsCount * longBarCutLength) / 1000;
    } else {
      // One-Way Slab
      // Main Bars (Parallel to lx, spread along ly)
      shortBarsCount = Math.ceil(ly_mm / ss) + 1; 
      const mainBarCutLength = lx_mm - 2 * c;
      shortBarsTotalLength = (shortBarsCount * mainBarCutLength) / 1000;

      // Distribution Bars (Parallel to ly, spread along lx)
      longBarsCount = Math.ceil(lx_mm / sl) + 1; 
      const distBarCutLength = ly_mm - 2 * c;
      longBarsTotalLength = (longBarsCount * distBarCutLength) / 1000;
    }

    // Steel Weight Calculation
    const shortUnitWeight = Math.pow(ds, 2) / 162.28;
    const longUnitWeight = Math.pow(dl, 2) / 162.28;

    const shortTotalWeight = shortUnitWeight * shortBarsTotalLength;
    const longTotalWeight = longUnitWeight * longBarsTotalLength;
    const totalSteelWeight = shortTotalWeight + longTotalWeight;

    setResults({
      type: slabType,
      concreteVolumeWet,
      concreteVolumeDry,
      shortBarsCount,
      shortBarsTotalLength,
      longBarsCount,
      longBarsTotalLength,
      totalSteelWeight,
      elementWeightKg,
      craneCapacityTonnes,
    });
  };

  const loadExample = () => {
    setSlabType("two-way");
    setIsPrecast(false);
    setLy("5");
    setLx("4");
    setThickness("150");
    setClearCover("20");
    setMainDia("12");
    setDistDia("10");
    setMainSpacing("150");
    setDistSpacing("150");
  };

  const resetDefault = () => {
    if (!window.confirm("Are you sure you want to reset all inputs? This action cannot be undone.")) return;
    setLy("");
    setLx("");
    setThickness("");
    setClearCover("");
    setMainDia("12");
    setDistDia("12");
    setMainSpacing("150");
    setDistSpacing("150");
    setResults(null);
  };

  const sendToBOQ = () => {
    if (!results) return;
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `RCC Slab ${isPrecast ? '(Precast)' : ''} (Thickness: ${thickness}mm)`,
        unit: "m³",
        quantity: results.concreteVolumeWet,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement for Slab`,
        unit: "kg",
        quantity: results.totalSteelWeight,
        rate: 0
      }
    ];
    window.dispatchEvent(new CustomEvent('fill-boq', { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  return (
    <div className="w-full md:max-w-4xl md:mx-auto pb-20 px-4 md:px-0">
      <SEO 
        title="Slab Estimator | EstiPro"
        description="Calculate concrete volume and steel reinforcement for one-way and two-way reinforced concrete slabs."
      />
      <ToolGuidedTour steps={SLAB_TOUR_STEPS} tourId="slab-estimator" />
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        <div className="flex gap-2">
          {results && (
            <button onClick={sendToBOQ} className="text-xs font-bold px-3 py-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              Send to BOQ
            </button>
          )}
          <button onClick={loadExample} className="text-xs font-bold px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            Load Example
          </button>
          <button onClick={resetDefault} className="text-xs font-bold px-3 py-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 sm:p-6 md:p-4 sm:p-8 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div id="tour-slab-type" className="p-1 bg-slate-100 rounded-[24px] flex gap-1 w-full sm:w-auto flex-1 overflow-hidden">
              <button
                onClick={() => setSlabType("one-way")}
                className={`flex-1 py-2 px-4 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${slabType === "one-way" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
              >
                One-Way Slab
              </button>
              <button
                onClick={() => setSlabType("two-way")}
                className={`flex-1 py-2 px-4 rounded-[24px] text-sm font-bold transition-all whitespace-nowrap ${slabType === "two-way" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
              >
                Two-Way Slab
              </button>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 p-2 rounded-full border border-slate-200 w-full sm:w-auto min-w-max transition-all duration-300 active:scale-95 hover:-translate-y-0.5">
               <span className="text-sm font-bold text-slate-700">Precast Mode</span>
               <button 
                onClick={() => setIsPrecast(!isPrecast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPrecast ? 'bg-indigo-600' : 'bg-slate-300 '}`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrecast ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Slab Dimensions</h2>
          </div>

          <div className="space-y-4">
            <div id="tour-slab-dimensions" className="grid grid-cols-2 gap-4">
              <InputGroup label="Long Span (ly) (m)">
                <NumberInput 
                  value={ly} 
                  onChange={(v) => setLy(v.toString())} 
                  unit="m" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm transition-all text-slate-800 overflow-hidden" 
                />
              </InputGroup>
              <InputGroup label="Short Span (lx) (m)">
                <NumberInput 
                  value={lx} 
                  onChange={(v) => setLx(v.toString())} 
                  unit="m" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm transition-all text-slate-800 overflow-hidden" 
                />
              </InputGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Thickness (mm)">
                <div id="tour-slab-thickness">
                  <NumberInput 
                    value={thickness} 
                    onChange={(v) => setThickness(v.toString())} 
                    unit="mm" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm transition-all text-slate-800 overflow-hidden" 
                  />
                </div>
              </InputGroup>
              <InputGroup label={
                <span className="flex items-center">
                  Clear Cover (mm)
                  <FieldTooltip content="Minimum concrete cover to protect reinforcement from corrosion. IS 456:2000 Table 16: Mild exposure = 20mm, Moderate = 30mm, Severe = 45mm, Very Severe = 50mm" />
                </span>
              }>
                <NumberInput 
                  value={clearCover} 
                  onChange={(v) => setClearCover(v.toString())} 
                  unit="mm" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm transition-all text-slate-800 overflow-hidden" 
                />
              </InputGroup>
            </div>

            {isPrecast && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-teal-50/50 p-4 rounded-[24px] border border-teal-100 mt-4 overflow-hidden">
                <InputGroup label="Concrete Density (kg/m³)">
                  <NumberInput 
                    value={concreteDensity} 
                    onChange={(v) => setConcreteDensity(v.toString())} 
                    unit="kg/m³"
                    className="w-full bg-white rounded-[24px] border shadow-sm text-slate-800 border-teal-200 overflow-hidden" 
                  />
                </InputGroup>
                <InputGroup label="Lifting Radius (m)">
                  <NumberInput 
                    value={riggingRadius} 
                    onChange={(v) => setRiggingRadius(v.toString())} 
                    unit="m"
                    className="w-full bg-white rounded-[24px] border shadow-sm text-slate-800 border-teal-200 overflow-hidden" 
                  />
                </InputGroup>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6 mt-8">
            <Grid2X2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Reinforcement Details</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 overflow-hidden">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
                {slabType === "one-way" ? "Main Bars (Short Span)" : "Short Span Bars (Main)"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Diameter (mm)">
                  <select
                    value={mainDia}
                    onChange={(e) => setMainDia(e.target.value)}
                    className="w-full h-11 bg-white border border-slate-200 rounded-[24px] px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all overflow-hidden"
                  >
                    {[8, 10, 12, 16, 20, 25].map(d => (
                      <option key={d} value={d}>{d} mm</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label="Spacing (c/c) (mm)">
                  <NumberInput 
                    value={mainSpacing} 
                    onChange={(v) => setMainSpacing(v.toString())} 
                    unit="mm" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm transition-all text-slate-800 overflow-hidden" 
                  />
                </InputGroup>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 overflow-hidden">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
                {slabType === "one-way" ? "Distribution Bars (Long Span)" : "Long Span Bars"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Diameter (mm)">
                  <select
                    value={distDia}
                    onChange={(e) => setDistDia(e.target.value)}
                    className="w-full h-11 bg-white border border-slate-200 rounded-[24px] px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all overflow-hidden"
                  >
                    {[8, 10, 12, 16, 20, 25].map(d => (
                      <option key={d} value={d}>{d} mm</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label="Spacing (c/c) (mm)">
                  <NumberInput 
                    value={distSpacing} 
                    onChange={(v) => setDistSpacing(v.toString())} 
                    unit="mm" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm transition-all text-slate-800 overflow-hidden" 
                  />
                </InputGroup>
              </div>
            </div>
          </div>

          <button onClick={calculateSlab}
            className="w-full mt-6 bg-indigo-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full transition-colors mt-8 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
          >
            Calculate Slab Quantities
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {results ? (
            <div className="flex flex-col h-full w-full">
              {isPrecast && (
                <div className="mb-6 p-4 md:p-6 rounded-[24px] bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                    <ArrowUp className="w-32 h-32 text-teal-900" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Precast Safety & Lifting
                      </h4>
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                        Based on {riggingRadius}m rig radius and 1.5x dynamic multi.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 p-4 rounded-[24px] border border-teal-100 overflow-hidden">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Single Element Wt</span>
                          <span className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-slate-800">{(results.elementWeightKg / 1000).toFixed(2)}<span className="text-sm font-medium ml-1 text-slate-500">Tons</span></span>
                        </div>
                        <div className="w-full bg-white/80 p-4 rounded-[24px] border border-teal-200 shadow-sm overflow-hidden">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Min. Crane Capacity</span>
                          <span className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-teal-700">{results.craneCapacityTonnes.toFixed(2)}<span className="text-sm font-medium ml-1 text-teal-600/80">Tons</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <MaterialSummary
                title="Material Summary"
              totalLabel="Total Concrete Dry Volume"
              totalValue={results.concreteVolumeDry.toFixed(2)}
              totalUnit="m³"
              subtitle={`Wet Volume: ${results.concreteVolumeWet.toFixed(2)} m³`}
              relatedToolIds={['concrete-mix', 'beam-calc']}
              onRecalculate={() => {}}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard
                  title="Total Steel Weight"
                  value={results.totalSteelWeight.toFixed(2)}
                  unit="kg"
                  variant="primary"
                  badge={results.type === "one-way" ? "One-Way Slab" : "Two-Way Slab"}
                />
                <ResultCard
                  title={results.type === "one-way" ? "Main Bars" : "Short Span Bars"}
                  value={results.shortBarsCount}
                  unit="bars"
                  description={`${results.shortBarsTotalLength.toFixed(1)}m total length`}
                  variant="neutral"
                />
                <ResultCard
                  title={results.type === "one-way" ? "Dist Bars" : "Long Span Bars"}
                  value={results.longBarsCount}
                  unit="bars"
                  description={`${results.longBarsTotalLength.toFixed(1)}m total length`}
                  variant="neutral"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/50">
                <div className="mb-4 text-[10px] sm:text-xs font-bold tracking-tight text-slate-500 uppercase tracking-[0.15em]">
                  Rebar Breakdown
                </div>
                <div className="w-full bg-white/50 rounded-[24px] p-4 shadow-sm text-slate-900 border border-slate-200/50 backdrop-blur-md overflow-hidden">
                  <StyledChart 
                    data={[
                      { name: results.type === "one-way" ? "Main Bars" : "Short Span", value: Math.round(results.shortBarsTotalLength), fill: '#6366f1' },
                      { name: results.type === "one-way" ? "Dist Bars" : "Long Span", value: Math.round(results.longBarsTotalLength), fill: '#14b8a6' }
                    ]}
                    type="bar"
                    title="Length Breakdown"
                    valueFormatter={(val) => `${val} m`}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-[24px] overflow-hidden">
                 <p className="text-xs flex gap-2">
                    <span className="text-amber-600 font-bold">ℹ</span>
                    <span className="text-slate-600 leading-relaxed">
                      {results.type === "two-way" 
                        ? "Includes an assumption for alternate bent-up (cranked) bars contributing an additional average of 0.42d extra length per bar."
                        : "Main bars span across the shorter dimension (lx). Distribution bars span across the longer dimension (ly)."}
                    </span>
                 </p>
              </div>
            </MaterialSummary>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-[32px] p-4 sm:p-6 lg:p-12 text-center flex items-center justify-center h-full shadow-sm overflow-hidden">
              <span className="text-slate-500 font-medium tracking-wide">Enter dimensions to calculate</span>
            </div>
          )}
        </div>
      </div>
      
      <CalculationHistory
        calculatorId="slab_estimator"
        currentInputs={{ type: slabType, ly, lx, thickness, clearCover, mainDia, distDia, mainSpacing, distSpacing }}
        currentResults={results ? {
          "Concrete Dry Vol": `${results.concreteVolumeDry.toFixed(2)} m³`,
          "Total Steel Wt": `${results.totalSteelWeight.toFixed(2)} kg`
        } : undefined}
        onRestore={(inputs) => {
          setSlabType(inputs.type || "two-way");
          setLy(inputs.ly || "5");
          setLx(inputs.lx || "4");
          setThickness(inputs.thickness || "150");
          setClearCover(inputs.clearCover || "20");
          setMainDia(inputs.mainDia || "12");
          setDistDia(inputs.distDia || "10");
          setMainSpacing(inputs.mainSpacing || "150");
          setDistSpacing(inputs.distSpacing || "150");
        }}
        estimationName="Slab"
      />
    </div>
  );
}

function InputGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
