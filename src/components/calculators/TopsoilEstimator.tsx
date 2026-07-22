import React, { useState, useEffect } from 'react';
import { Shovel, Ruler, Box, Package, Truck, Scale, Download, Printer } from 'lucide-react';
import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';

type UnitSystem = 'metric' | 'imperial';
type InputMode = 'area' | 'dimensions';

interface TopsoilResult {
  volumeNet: number;
  volumeGross: number;
  weightKg: number;
  weightTons: number;
}

const soilTypes = {
  topsoil: { label: 'Topsoil', density: 1200 }, // kg/m3
  compost: { label: 'Compost', density: 600 },
  sand: { label: 'Sand', density: 1600 },
  gravel: { label: 'Gravel', density: 1700 }
};

export function TopsoilEstimator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [inputMode, setInputMode] = useState<InputMode>('dimensions');

  // Metric defaults
  const [length, setLength] = useState<number>(10); // m
  const [width, setWidth] = useState<number>(5); // m
  const [totalArea, setTotalArea] = useState<number>(50); // m2
  const [depth, setDepth] = useState<number>(15); // cm

  const [soilType, setSoilType] = useState<keyof typeof soilTypes>('topsoil');
  const [customDensity, setCustomDensity] = useState<number>(1200);
  const [compactionFactor, setCompactionFactor] = useState<number>(15); // %

  const [result, setResult] = useState<TopsoilResult | null>(null);

  // Sync custom density with selected preset
  useEffect(() => {
    setCustomDensity(soilTypes[soilType].density);
  }, [soilType]);

  // Handle unit system toggle logic
  useEffect(() => {
    if (unitSystem === 'metric') {
      setLength(10);
      setWidth(5);
      setTotalArea(50);
      setDepth(15); // cm
    } else {
      setLength(30); // ft
      setWidth(15); // ft
      setTotalArea(450); // sq ft
      setDepth(6); // inches
    }
  }, [unitSystem]);

  useEffect(() => {
    const fetchResults = async () => {
      // Convert to metric before sending to API
      let areaInM2 = 0;
      let depthInM = 0;

      if (unitSystem === 'metric') {
        areaInM2 = inputMode === 'dimensions' ? length * width : totalArea;
        depthInM = depth / 100; // cm to m
      } else {
        const areaInSqFt = inputMode === 'dimensions' ? length * width : totalArea;
        areaInM2 = areaInSqFt * 0.092903; // sq ft to m2
        depthInM = depth * 0.0254; // inches to m
      }

      try {
        const res = await fetch('/api/tools/topsoil-calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            area: areaInM2,
            depth: depthInM,
            density: customDensity,
            compactionFactor
          })
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Calculation failed", err);
      }
    };
    fetchResults();
  }, [inputMode, length, width, totalArea, depth, customDensity, compactionFactor, unitSystem]);

  const unitL = unitSystem === 'metric' ? 'm' : 'ft';
  const unitA = unitSystem === 'metric' ? 'm²' : 'sq ft';
  const unitD = unitSystem === 'metric' ? 'cm' : 'in';
  
  // Formatters
  const displayVolume = (volM3: number) => {
    if (unitSystem === 'metric') return `${volM3.toFixed(2)} m³`;
    const cubicYards = volM3 * 1.30795;
    return `${cubicYards.toFixed(2)} yd³`;
  };

  const displayWeight = (tonsM: number) => {
    if (unitSystem === 'metric') return `${tonsM.toFixed(2)} Tons`;
    const usTons = tonsM * 1.10231;
    return `${usTons.toFixed(2)} US Tons`;
  };

  const formulaSteps: FormulaStep[] = result ? [
    {
      id: 1,
      label: "1. Net Volume",
      theoretical: "Volume = Area × Depth",
      applied: `Net Volume = ${result.volumeNet.toFixed(2)} m³`
    },
    {
      id: 2,
      label: "2. Gross Volume (with Compaction)",
      theoretical: "Gross Volume = Net Volume × (1 + Compaction Factor / 100)",
      applied: `Gross Volume = ${result.volumeNet.toFixed(2)} × (1 + ${compactionFactor}/100) = ${result.volumeGross.toFixed(2)} m³`
    },
    {
      id: 3,
      label: "3. Total Weight",
      theoretical: "Weight = Gross Volume × Bulk Density",
      applied: `Weight = ${result.volumeGross.toFixed(2)} m³ × ${customDensity} kg/m³ = ${result.weightKg.toLocaleString(undefined, {maximumFractionDigits: 0})} kg (${result.weightTons.toFixed(2)} Metric Tons)`
    }
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600">
              <Shovel size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Topsoil & Landscaping Estimator</h1>
              <p className="text-slate-600 text-sm">Calculate soil volume, weight, bags, and truckloads.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Metric
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Imperial
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 border border-orange-700 rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ruler size={20} className="text-orange-500" />
                Target Area
              </h2>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('dimensions')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${inputMode === 'dimensions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Length × Width
                </button>
                <button
                  onClick={() => setInputMode('area')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${inputMode === 'area' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Total Area
                </button>
              </div>
            </div>

            {inputMode === 'dimensions' ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Length ({unitL})</label>
                  <input
                    type="number"
                    min="0.1"
                    value={length}
                    onChange={(e) => setLength(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Width ({unitL})</label>
                  <input
                    type="number"
                    min="0.1"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Total Surface Area ({unitA})</label>
                <input
                  type="number"
                  min="0.1"
                  value={totalArea}
                  onChange={(e) => setTotalArea(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Desired Depth ({unitD})</label>
                  <input
                    type="number"
                    min="0.1"
                    value={depth}
                    onChange={(e) => setDepth(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Compaction Factor (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={compactionFactor}
                    onChange={(e) => setCompactionFactor(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-orange-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Extra material needed due to settling.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Box size={20} className="text-emerald-500" />
              Material Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Material Type</label>
                <select 
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as keyof typeof soilTypes)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                  {Object.entries(soilTypes).map(([key, data]) => (
                    <option key={key} value={key}>{data.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bulk Density (kg/m³)</label>
                <input 
                  type="number" 
                  min="100" 
                  value={customDensity} 
                  onChange={(e) => setCustomDensity(Math.max(100, Number(e.target.value)))} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Shovel size={120} />
            </div>
            
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Box size={24} className="text-orange-400" />
              Required Volume
            </h2>

            {result && (
              <div className="space-y-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="text-orange-200 text-sm font-medium mb-1">Total Loose Volume</div>
                  <div className="text-4xl font-black">{displayVolume(result.volumeGross)}</div>
                  <div className="text-xs text-slate-400 mt-1">Includes {compactionFactor}% compaction allowance</div>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale size={16} className="text-blue-300" />
                    <div className="text-blue-200 text-sm font-medium">Estimated Weight</div>
                  </div>
                  <div className="text-2xl font-bold text-white">{displayWeight(result.weightTons)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-300">
                      <Package size={14} />
                      <span className="text-xs font-medium">Standard Bags</span>
                    </div>
                    {/* Assuming a standard bag is ~25kg for metric, or ~50lb for imperial. 1 lb = 0.453592 kg */}
                    <div className="text-lg font-bold">
                      {unitSystem === 'metric' 
                        ? `${Math.ceil(result.weightKg / 25)} ` 
                        : `${Math.ceil(result.weightKg / (50 * 0.453592))} `}
                    </div>
                    <div className="text-[10px] text-slate-400">{unitSystem === 'metric' ? '25 kg bags' : '50 lb bags'}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1 text-amber-300">
                      <Truck size={14} />
                      <span className="text-xs font-medium">Truckloads</span>
                    </div>
                    {/* Assuming 10 m3 per truck, or ~12 yd3 */}
                    <div className="text-lg font-bold">
                      {unitSystem === 'metric' 
                        ? Math.ceil(result.volumeGross / 10) 
                        : Math.ceil((result.volumeGross * 1.30795) / 12)}
                    </div>
                    <div className="text-[10px] text-slate-400">{unitSystem === 'metric' ? '10 m³ trucks' : '12 yd³ trucks'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {result && <FormulaAccordion steps={formulaSteps} />}
        </div>
      </div>
    </div>
  );
}
