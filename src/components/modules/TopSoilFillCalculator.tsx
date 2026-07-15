import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Calculator, ArrowRight, Save, Printer, Share2, Mountain, Clock, HelpCircle, Truck, Layers } from "lucide-react";
import { useEstimateProcessing } from "../../hooks/useEstimateProcessing";
import { ProcessingSkeleton } from "../ui/ProcessingSkeleton";
import { useGlobalSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { GlobalFAQ } from "../ui/GlobalFAQ";

export default function TopSoilFillCalculator() {
  const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing();
  const { currentUnit } = useGlobalSettings();
  const isMetric = currentUnit === "metric";

  const [area, setArea] = useState("100");
  const [depth, setDepth] = useState("0.15");

  const soilTypes = [
    { name: "Topsoil", factor: 1.25 },
    { name: "Sand", factor: 1.15 },
    { name: "Gravel", factor: 1.12 },
    { name: "Clay", factor: 1.4 },
    { name: "Custom", factor: 1.3 },
  ];

  const [selectedSoilIndex, setSelectedSoilIndex] = useState(0);
  const [customFactor, setCustomFactor] = useState("1.3");
  const [truckCapacity, setTruckCapacity] = useState("10");

  const handleDataChange = () => {
    if (hasData) resetEstimate();
  };

  const estimateData = useMemo(() => {
    if (!hasData) return null;

    const parseNum = (val: string) => Math.max(0, parseFloat(val) || 0);

    const a = parseNum(area);
    const d = parseNum(depth);
    
    // Bank volume
    const bankVolume = a * d; // either cubic meters or cubic feet
    
    const factorNum = selectedSoilIndex === soilTypes.length - 1 
      ? parseNum(customFactor) 
      : soilTypes[selectedSoilIndex].factor;

    const safeFactor = factorNum > 0 ? factorNum : 1;
    const looseVolume = bankVolume * safeFactor;
    
    // Truck capacity in cubic user-units
    const capacity = parseNum(truckCapacity);
    const safeCapacity = capacity > 0 ? capacity : 10;
    
    const truckLoads = Math.ceil(looseVolume / safeCapacity);

    // Units
    const areaUnit = isMetric ? "sq m" : "sq ft";
    const depthUnit = isMetric ? "m" : "ft";
    const volumeUnit = isMetric ? "cu m" : "cu ft";

    return {
      bankVolume,
      looseVolume,
      truckLoads,
      factor: safeFactor,
      capacity: safeCapacity,
      areaUnit,
      depthUnit,
      volumeUnit
    };
  }, [hasData, area, depth, selectedSoilIndex, customFactor, truckCapacity, isMetric, soilTypes]);

  const handlePrint = () => window.dispatchEvent(new CustomEvent('global-print-action'));

  return (
    <div className="w-full h-full bg-transparent text-slate-900 pb-[120px]">
      <Helmet>
        <title>Top Soil & Fill Calculator</title>
        <meta name="description" content="Calculate loose volume and truck loads required for top soil and fill earthworks." />
      </Helmet>
      
      <div className="mx-auto pt-4 md:pt-8 w-full">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Layers className="w-8 h-8 text-amber-600" />
              Top Soil & Fill Estimate
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wide uppercase ml-2 border border-emerald-200">
              Beginner
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wide flex items-center gap-1 border border-slate-200">
              <Clock className="w-3.5 h-3.5" /> 2 MIN
            </span>
          </div>
          <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
            Estimate the expanded (loose) volume of soil needed for fills or topsoil cover, and determine how many truck loads are required for transport.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Input Panel */}
          <div className="w-full md:w-[45%] flex flex-col gap-6">
            <div className="w-full bg-white p-4 sm:p-4 sm:p-4 sm:p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-bold text-lg text-slate-800">Earthwork Area</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Area to Cover</label>
                  <div className="relative">
                    <><label htmlFor="a11y-input-519" className="sr-only">Input</label>
<input id="a11y-input-519"
                      type="number" inputMode="decimal"
                      value={area}
                      onChange={(e) => { setArea(e.target.value); handleDataChange(); }}
                      className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-semibold"
                    /></>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{isMetric ? "sq m" : "sq ft"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Average Depth</label>
                  <div className="relative">
                    <><label htmlFor="a11y-input-520" className="sr-only">Input</label>
<input id="a11y-input-520"
                      type="number" inputMode="decimal"
                      value={depth}
                      onChange={(e) => { setDepth(e.target.value); handleDataChange(); }}
                      className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-semibold"
                    /></>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{isMetric ? "m" : "ft"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 mt-8">
                <h3 className="font-bold text-lg text-slate-800">Material & Transport</h3>
              </div>

              <div className="mb-4">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Soil Type (Bulking Factor)</label>
                <select
                  value={selectedSoilIndex}
                  onChange={(e) => {
                    setSelectedSoilIndex(parseInt(e.target.value));
                    handleDataChange();
                  }}
                  className="w-full bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-[24px] px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-semibold appearance-none overflow-hidden"
                >
                  {soilTypes.map((t, idx) => (
                    <option key={idx} value={idx}>{t.name} (×{t.factor})</option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-slate-500 font-medium">Controls expansion from compacted bank state to loose state.</div>
              </div>

              {selectedSoilIndex === soilTypes.length - 1 && (
                <div className="mb-4 fade-in">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Custom Bulking Factor (e.g. 1.2)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold font-mono">× </span>
                    <><label htmlFor="a11y-input-521" className="sr-only">Input</label>
<input id="a11y-input-521"
                      type="number" inputMode="decimal"
                      step="0.01"
                      value={customFactor}
                      onChange={(e) => { setCustomFactor(e.target.value); handleDataChange(); }}
                      className="flex-1 bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500"
                    /></>
                  </div>
                </div>
              )}

              <div className="mb-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Truck Capacity</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold"><Truck className="w-4 h-4"/></span>
                  <><label htmlFor="a11y-input-522" className="sr-only">Input</label>
<input id="a11y-input-522"
                    type="number" inputMode="decimal"
                    value={truckCapacity}
                    onChange={(e) => { setTruckCapacity(e.target.value); handleDataChange(); }}
                    className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full pl-10 pr-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-semibold"
                  /></>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">{isMetric ? "cu m" : "cu ft"}</span>
                </div>
              </div>

              <button
                onClick={() => processEstimate(() => {})}
                disabled={isProcessing}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold py-3.5 px-6 rounded-full shadow-md shadow-amber-200 transition-all flex justify-center items-center gap-2 group border border-amber-500 active:scale-95 hover:-translate-y-0.5"
              >
                {isProcessing ? "Calculating..." : "Calculate Loose Volume"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="p-5 rounded-[24px] border border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
              <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Math Logic & Formulas
              </h4>
              <ul className="text-[11px] text-amber-800/80 space-y-2 list-disc list-inside leading-relaxed uppercase tracking-wider font-semibold">
                <li><strong className="lowercase">Bank Volume</strong> = Area × Depth</li>
                <li><strong className="lowercase">Loose Volume</strong> = Bank Volume × Bulking Factor</li>
                <li><strong className="lowercase">Truck Loads</strong> = Ceil(Loose Volume ÷ Truck Capacity)</li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-[55%]">
            {isProcessing ? (
              <ProcessingSkeleton count={5} />
            ) : hasData && estimateData ? (
              <div className="space-y-6">
                <div className="w-full bg-white p-4 sm:p-4 sm:p-4 sm:p-6 md:p-4 sm:p-4 sm:p-4 sm:p-8 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden">
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Truck Loads Required</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight tracking-tight text-slate-900">
                          {estimateData.truckLoads}
                        </span>
                        <span className="text-slate-500 text-lg font-bold">trips</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Truck className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-amber-50 p-5 rounded-[24px] border border-amber-100 relative overflow-hidden">
                      <span className="text-amber-600/80 text-xs font-bold uppercase tracking-widest block mb-2 relative z-10 w-full">Loose Volume</span>
                      <div className="text-3xl md:text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight text-amber-700 relative z-10 flex items-baseline gap-1">
                        {estimateData.looseVolume.toLocaleString(undefined, {maximumFractionDigits: 1})}
                        <span className="text-lg font-bold">{estimateData.volumeUnit}</span>
                      </div>
                      <span className="text-[10px] text-amber-500/70 font-bold mt-1 block relative z-10 uppercase tracking-widest">Excavated / Fill State</span>
                    </div>
                    
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-200 relative overflow-hidden">
                      <span className="text-slate-600 text-xs font-bold uppercase tracking-widest block mb-2 relative z-10 w-full">Bank Volume</span>
                      <div className="text-3xl md:text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight text-slate-700 relative z-10 flex items-baseline gap-1">
                        {estimateData.bankVolume.toLocaleString(undefined, {maximumFractionDigits: 1})}
                        <span className="text-lg font-bold">{estimateData.volumeUnit}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold mt-1 block relative z-10 uppercase tracking-widest">Compacted In-Ground</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-300/5 pb-2">Calculation Breakdown</h4>
                  
                  <div className="space-y-3 mb-6">
                     <div className="bg-white border border-slate-100 p-4 rounded-[24px] flex justify-between items-center group hover:border-amber-200 transition-colors overflow-hidden">
                       <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Expansion Amount</span>
                       <span className="text-sm font-bold tabular-nums tracking-tight text-slate-800 font-mono">+{(estimateData.looseVolume - estimateData.bankVolume).toFixed(1)} {estimateData.volumeUnit}</span>
                     </div>
                     <div className="bg-white border border-slate-100 p-4 rounded-[24px] flex justify-between items-center group hover:border-amber-200 transition-colors overflow-hidden">
                       <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Swell Factor</span>
                       <span className="text-sm font-bold tabular-nums tracking-tight text-slate-800 font-mono">{(estimateData.factor * 100 - 100).toFixed(0)}% ({estimateData.factor}x)</span>
                     </div>
                     <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-200 p-4 rounded-[24px] flex justify-between items-center overflow-hidden">
                       <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Est. Trucks (Capacity {estimateData.capacity} {estimateData.volumeUnit})</span>
                       <span className="text-sm font-bold tabular-nums tracking-tight text-slate-800 font-mono">{estimateData.truckLoads} Loads</span>
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 p-4 sm:p-8 md:p-8 text-center opacity-80 overflow-hidden">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-highlight">
                  <Layers className="w-10 h-10 text-amber-600 opacity-80" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Estimate Fill Volumes</h3>
                <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-6">
                  Input the area and desired coverage thickness. We'll automatically expand the volume by the material swell factor to calculate the truck loads needed.
                </p>
              </div>
            )}
            
            <CalculationHistory
              calculatorId="topsoil_fill_calculator"
              currentInputs={{ area, depth, selectedSoilIndex, customFactor, truckCapacity }}
              currentResults={estimateData ? {
                "Earth Bank Volume": `${estimateData.bankVolume.toLocaleString(undefined, {maximumFractionDigits: 1})} ${estimateData.volumeUnit}`,
                "Loose / Delivery Volume": `${estimateData.looseVolume.toLocaleString(undefined, {maximumFractionDigits: 1})} ${estimateData.volumeUnit}`,
                "Total Truck Loads": `${estimateData.truckLoads} Loads`
              } : undefined}
              estimationName="Topsoil / Fill Estimator"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
