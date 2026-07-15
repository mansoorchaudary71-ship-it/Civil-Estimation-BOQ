import React, { useState } from "react";
import { CopySlash, Settings2, Columns, ArrowUp, AlertTriangle } from "lucide-react";
import { SEO } from "../SEO";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { FieldTooltip } from "../ui/FieldTooltip";

export default function BeamCalculator() {
  const [isPrecast, setIsPrecast] = useState(false);
  const [concreteDensity, setConcreteDensity] = useState("2400");
  const [riggingRadius, setRiggingRadius] = useState("5");

  const [beamWidth, setBeamWidth] = useState("300"); // mm
  const [beamDepth, setBeamDepth] = useState("450"); // mm
  const [beamSpan, setBeamSpan] = useState("5"); // meters
  const [clearCover, setClearCover] = useState("30"); // mm
  
  const [longitudinalBarsCount, setLongitudinalBarsCount] = useState("4"); // 4, 6, 8, 10
  const [longitudinalBarDia, setLongitudinalBarDia] = useState("16"); // mm
  
  const [tensionBarsCount, setTensionBarsCount] = useState("3");
  const [compressionBarsCount, setCompressionBarsCount] = useState("3");
  const [tensionBarDia, setTensionBarDia] = useState("16");
  const [compressionBarDia, setCompressionBarDia] = useState("12");

  React.useEffect(() => {
    const total = parseInt(longitudinalBarsCount);
    if (total > 4) {
      setTensionBarsCount(Math.ceil(total / 2).toString());
      setCompressionBarsCount(Math.floor(total / 2).toString());
    }
  }, [longitudinalBarsCount]);

  const handleTensionBarsChange = (val: string) => {
    const t = parseInt(val);
    const total = parseInt(longitudinalBarsCount);
    setTensionBarsCount(val);
    if (!isNaN(t) && t > 0 && t < total) {
      setCompressionBarsCount((total - t).toString());
    }
  };

  const handleCompressionBarsChange = (val: string) => {
    const c = parseInt(val);
    const total = parseInt(longitudinalBarsCount);
    setCompressionBarsCount(val);
    if (!isNaN(c) && c > 0 && c < total) {
      setTensionBarsCount((total - c).toString());
    }
  };

  const [stirrupDia, setStirrupDia] = useState("8"); // mm
  const [stirrupSpacing, setStirrupSpacing] = useState("150"); // mm
  const [stirrupLegs, setStirrupLegs] = useState("2"); // 2, 4

  const [results, setResults] = useState<{
    concreteVolumeDry: number;
    concreteVolumeWet: number;
    longitudinalSteelWeight: number;
    stirrupSteelWeight: number;
    totalSteelWeight: number;
    stirrupsCount: number;
    stirrupTypes: { name: string; length: number; countPerSet: number }[];
    elementWeightKg: number;
    craneCapacityTonnes: number;
  } | null>(null);

  const calculateBeam = () => {
    const w = parseFloat(beamWidth);
    const d = parseFloat(beamDepth);
    const span = parseFloat(beamSpan);
    const c = parseFloat(clearCover);
    const barsCount = parseInt(longitudinalBarsCount);
    const mainDia = parseFloat(longitudinalBarDia);
    const sDia = parseFloat(stirrupDia);
    const spacing = parseFloat(stirrupSpacing);
    const legs = parseInt(stirrupLegs);
    const density = parseFloat(concreteDensity) || 2400;
    const radius = parseFloat(riggingRadius) || 5;

    if (
      isNaN(w) || isNaN(d) || isNaN(span) || isNaN(c) ||
      isNaN(barsCount) || isNaN(mainDia) || isNaN(sDia) || isNaN(spacing) || isNaN(legs) ||
      w <= 0 || d <= 0 || span <= 0 || spacing <= 0
    ) {
      return;
    }

    // Concrete Volume
    const concreteVolumeWet = (w / 1000) * (d / 1000) * span;
    const concreteVolumeDry = concreteVolumeWet * 1.54; // RULE: CONCRETE_DRY_VOLUME

    // Precast Calculations
    const elementWeightKg = concreteVolumeWet * density;
    const craneCapacityTonnes = (elementWeightKg * 1.5 * radius) / 1000;

    // Core dimensions for stirrups
    const A = w - 2 * c;
    const B = d - 2 * c;

    // Number of stirrups
    const stirrupsCount = Math.ceil((span * 1000) / spacing) + 1; // RULE: REBAR_SPACING_COUNT

    const stirrupTypes: { name: string; length: number; countPerSet: number }[] = [];

    // Outer Stirrup (2-Legged)
    const outerStirrupLength = 2 * (A + B) + 24 * sDia; // RULE: RECTANGULAR_STIRRUP_LENGTH
    stirrupTypes.push({ name: "Outer Rectangular Stirrup (2-Legged)", length: outerStirrupLength, countPerSet: 1 });

    if (legs === 4) {
      // Assuming 4-legged stirrup means 1 outer + 1 inner rectangular stirrup
      // Inner stirrup width could be roughly A/3 if there are multiple bars, but for beam usually smaller.
      const innerA = A / 2;
      const innerB = B;
      const innerStirrupLength = 2 * (innerA + innerB) + 24 * sDia;
      stirrupTypes.push({ name: "Inner Rectangular Stirrup (2-Legged)", length: innerStirrupLength, countPerSet: 1 });
    }

    // Longitudinal Bars Weight
    const totalBars = parseInt(longitudinalBarsCount);
    let topBars = 2;
    let bottomBars = 2;
    let topDia = parseFloat(longitudinalBarDia);
    let bottomDia = parseFloat(longitudinalBarDia);

    if (totalBars > 4) {
      topBars = parseInt(compressionBarsCount);
      bottomBars = parseInt(tensionBarsCount);
      topDia = parseFloat(compressionBarDia);
      bottomDia = parseFloat(tensionBarDia);

      if (topBars + bottomBars !== totalBars || isNaN(topBars) || isNaN(bottomBars) || isNaN(topDia) || isNaN(bottomDia)) {
         return; // Invalid distribution or diameter
      }
    } else {
      topBars = totalBars / 2;
      bottomBars = totalBars / 2;
    }

    const LdTop = 50 * topDia; // Assuming standard 50d Ld each side
    const LdBottom = 50 * bottomDia;

    const topTotalLengthPerBar = (span * 1000) + 2 * LdTop; // Total length in mm
    const bottomTotalLengthPerBar = (span * 1000) + 2 * LdBottom; // Total length in mm
    
    // Weight calculations
    const topUnitWeight = Math.pow(topDia, 2) / 162.28; // RULE: STEEL_WEIGHT_ESTIMATION
    const bottomUnitWeight = Math.pow(bottomDia, 2) / 162.28; 

    const topSteelWeight = (topTotalLengthPerBar / 1000) * topBars * topUnitWeight;
    const bottomSteelWeight = (bottomTotalLengthPerBar / 1000) * bottomBars * bottomUnitWeight;

    const longitudinalSteelWeight = topSteelWeight + bottomSteelWeight;

    // Stirrups Weight
    const stirrupUnitWeight = Math.pow(sDia, 2) / 162.28;
    let stirrupSteelWeight = 0;
    
    stirrupTypes.forEach(tie => {
      const totalLengthM = (tie.length / 1000) * tie.countPerSet * stirrupsCount;
      stirrupSteelWeight += totalLengthM * stirrupUnitWeight;
    });

    const totalSteelWeight = longitudinalSteelWeight + stirrupSteelWeight;

    setResults({
      concreteVolumeDry,
      concreteVolumeWet,
      longitudinalSteelWeight,
      stirrupSteelWeight,
      totalSteelWeight,
      stirrupsCount,
      stirrupTypes,
      elementWeightKg,
      craneCapacityTonnes,
    });
  };

  return (
    <div className="w-full md:max-w-4xl md:mx-auto pb-20 px-4 md:px-0">
      <SEO 
        title="Comprehensive Beam Calculator | EstiPro"
        description="Calculate concrete volume and longitudinal/stirrup steel weights for reinforced concrete beams."
      />
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="tool-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">Beam Dimensions</h2>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-2 rounded-[24px] border border-slate-200 overflow-hidden">
               <span className="text-base font-medium">Precast Mode</span>
               <button 
                onClick={() => setIsPrecast(!isPrecast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPrecast ? 'bg-indigo-600' : 'bg-slate-300 '}`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrecast ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
            </div>
          </div>

          <div className="space-y-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Width (b) (mm)">
                <><label htmlFor="a11y-input-113" className="sr-only">Input</label>
<input id="a11y-input-113"
                  type="number" inputMode="decimal"
                  min="0"
                  value={beamWidth}
                  onChange={(e) => setBeamWidth(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                /></>
              </InputGroup>
              <InputGroup label="Depth (D) (mm)">
                <><label htmlFor="a11y-input-114" className="sr-only">Input</label>
<input id="a11y-input-114"
                  type="number" inputMode="decimal"
                  min="0"
                  value={beamDepth}
                  onChange={(e) => setBeamDepth(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                /></>
              </InputGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Clear Span (L) (m)">
                <><label htmlFor="a11y-input-115" className="sr-only">Input</label>
<input id="a11y-input-115"
                  type="number" inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={beamSpan}
                  onChange={(e) => setBeamSpan(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                /></>
              </InputGroup>
              <InputGroup label={
                <span className="flex items-center">
                  Clear Cover (mm)
                  <FieldTooltip content="Minimum concrete cover to protect reinforcement from corrosion. IS 456:2000 Table 16: Mild exposure = 20mm, Moderate = 30mm, Severe = 45mm, Very Severe = 50mm" />
                </span>
              }>
                <><label htmlFor="a11y-input-116" className="sr-only">Input</label>
<input id="a11y-input-116"
                  type="number" inputMode="decimal"
                  min="0"
                  value={clearCover}
                  onChange={(e) => setClearCover(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                /></>
              </InputGroup>
            </div>

            {isPrecast && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-[24px] border border-indigo-100 mt-4 overflow-hidden">
                <InputGroup label="Concrete Density (kg/m³)">
                  <><label htmlFor="a11y-input-117" className="sr-only">Input</label>
<input id="a11y-input-117" type="number" inputMode="decimal" value={concreteDensity} onChange={(e) => setConcreteDensity(e.target.value)} className="w-full h-11 bg-white rounded-full border border-slate-200 shadow-sm text-slate-800 border border-indigo-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none transition-all shadow-sm overflow-hidden" /></>
                </InputGroup>
                <InputGroup label="Lifting Radius (m)">
                  <><label htmlFor="a11y-input-118" className="sr-only">Input</label>
<input id="a11y-input-118" type="number" inputMode="decimal" value={riggingRadius} onChange={(e) => setRiggingRadius(e.target.value)} className="w-full h-11 bg-white rounded-full border border-slate-200 shadow-sm text-slate-800 border border-indigo-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none transition-all shadow-sm overflow-hidden" /></>
                </InputGroup>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6 mt-8">
            <CopySlash className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">Reinforcement</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 mb-4 overflow-hidden">
              <h3 className="uppercase r mb-3 text-lg font-medium text-slate-800 mb-4">Longitudinal Bars</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Total Num of Bars">
                  <select
                    value={longitudinalBarsCount}
                    onChange={(e) => setLongitudinalBarsCount(e.target.value)}
                    className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="4">4 Bars</option>
                    <option value="6">6 Bars</option>
                    <option value="8">8 Bars</option>
                    <option value="10">10 Bars</option>
                  </select>
                </InputGroup>
                
                {parseInt(longitudinalBarsCount) <= 4 && (
                  <InputGroup label="Bar Diameter (mm)">
                    <select
                      value={longitudinalBarDia}
                      onChange={(e) => setLongitudinalBarDia(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                    >
                      {[12, 16, 20, 25, 32].map(d => (
                        <option key={d} value={d}>{d} mm</option>
                      ))}
                    </select>
                  </InputGroup>
                )}
              </div>

              {parseInt(longitudinalBarsCount) > 4 && (
                <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-slate-200/60">
                  <InputGroup label="Bottom (Tension) Bars">
                    <><label htmlFor="a11y-input-119" className="sr-only">Input</label>
<input id="a11y-input-119" 
                      type="number" inputMode="decimal"
                      value={tensionBarsCount}
                      min="1"
                      max={parseInt(longitudinalBarsCount) - 1}
                      onChange={e => handleTensionBarsChange(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all rounded-full"
                    /></>
                  </InputGroup>
                  <InputGroup label="Bottom Bar Dia (mm)">
                    <select
                      value={tensionBarDia}
                      onChange={e => setTensionBarDia(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                    >
                      {[12, 16, 20, 25, 32].map(d => (
                        <option key={d} value={d}>{d} mm</option>
                      ))}
                    </select>
                  </InputGroup>
                  <InputGroup label="Top (Compression) Bars">
                    <><label htmlFor="a11y-input-120" className="sr-only">Input</label>
<input id="a11y-input-120" 
                      type="number" inputMode="decimal"
                      value={compressionBarsCount}
                      min="1"
                      max={parseInt(longitudinalBarsCount) - 1}
                      onChange={e => handleCompressionBarsChange(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all rounded-full"
                    /></>
                  </InputGroup>
                  <InputGroup label="Top Bar Dia (mm)">
                    <select
                      value={compressionBarDia}
                      onChange={e => setCompressionBarDia(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                    >
                      {[12, 16, 20, 25, 32].map(d => (
                        <option key={d} value={d}>{d} mm</option>
                      ))}
                    </select>
                  </InputGroup>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 overflow-hidden">
              <h3 className="uppercase r mb-3 text-lg font-medium text-slate-800 mb-4">Shear Reinforcement (Stirrups)</h3>
              <div className="space-y-4">
                <InputGroup label="Stirrup Legs">
                  <select
                    value={stirrupLegs}
                    onChange={(e) => setStirrupLegs(e.target.value)}
                    className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="2">2-Legged Stirrup</option>
                    <option value="4">4-Legged Stirrups</option>
                  </select>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Diameter (mm)">
                    <select
                      value={stirrupDia}
                      onChange={(e) => setStirrupDia(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all"
                    >
                      {[8, 10, 12, 16].map(d => (
                        <option key={d} value={d}>{d} mm</option>
                      ))}
                    </select>
                  </InputGroup>
                  <InputGroup label="Spacing c/c (mm)">
                    <><label htmlFor="a11y-input-121" className="sr-only">Input</label>
<input id="a11y-input-121"
                      type="number" inputMode="decimal"
                      min="0"
                      value={stirrupSpacing}
                      onChange={(e) => setStirrupSpacing(e.target.value)}
                      className="w-full h-11 calc-input px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all rounded-full"
                    /></>
                  </InputGroup>
                </div>
              </div>
            </div>
          </div>

          <button onClick={calculateBeam}
            className="w-full mt-6 bg-indigo-600 hover:bg-blue-700 text-white py-4 rounded-full transition-colors mt-8 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
          >
            Calculate Beam Quantities
          </button>
        </div>

        <div className="flex-1 flex flex-col">
          {results ? (
            <div className="flex flex-col h-full w-full">
              {isPrecast && (
                <div className="mb-6 p-4 md:p-6 rounded-[24px] bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                    <ArrowUp className="w-32 h-32 text-indigo-900" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="uppercase st text-indigo-600 mb-1 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                        <AlertTriangle className="w-4 h-4" /> Precast Safety & Lifting
                      </h4>
                      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
                        Based on {riggingRadius}m rig radius and 1.5x dynamic multi.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 p-4 rounded-[24px] border border-indigo-100 overflow-hidden">
                          <span className="text-sm sm:text-base font-medium uppercase tracking-wider block mb-1">Single Element Wt</span>
                          <span className="text-xl md:text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-800">{(results.elementWeightKg / 1000).toFixed(2)}<span className="text-sm font-medium ml-1 text-slate-500">Tons</span></span>
                        </div>
                        <div className="w-full bg-white/80 p-4 rounded-[24px] border border-indigo-200 shadow-sm overflow-hidden">
                          <span className="text-sm sm:text-base font-medium uppercase tracking-wider block mb-1">Min. Crane Capacity</span>
                          <span className="text-xl md:text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-indigo-700">{results.craneCapacityTonnes.toFixed(2)}<span className="text-sm font-medium ml-1 text-indigo-600/80">Tons</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <MaterialSummary
                title="Calculation Results"
              totalLabel="Concrete Dry Volume"
              totalValue={results.concreteVolumeDry.toFixed(3)}
              totalUnit="m³"
              subtitle={`Wet Volume: ${results.concreteVolumeWet.toFixed(3)} m³`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard
                  title="Total Steel Weight"
                  value={results.totalSteelWeight.toFixed(2)}
                  unit="kg"
                  variant="secondary"
                />
                <ResultCard
                  title={`Longitudinal (${longitudinalBarsCount} Bars)`}
                  value={results.longitudinalSteelWeight.toFixed(2)}
                  unit="kg"
                  variant="neutral"
                />
                <ResultCard
                  title="Stirrups"
                  value={results.stirrupSteelWeight.toFixed(2)}
                  unit="kg"
                  variant="neutral"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/50">
                <p className="sm: tracking-tight uppercase tracking-[0.15em] mb-4 text-base font-normal text-slate-600 leading-relaxed">Stirrup Cut Length Breakdown ({results.stirrupsCount} sets)</p>
                <ul className="w-full space-y-3 bg-white/50 rounded-[24px] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-200/50 backdrop-blur-md overflow-hidden">
                  {results.stirrupTypes.map((tie, index) => (
                    <li key={index} className="flex justify-between items-end border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-base font-normal text-slate-600 leading-relaxed">{tie.name}</p>
                        <p className="text-base font-normal text-slate-600 leading-relaxed">{tie.countPerSet} per set</p>
                      </div>
                      <p className="text-base font-normal text-slate-600 leading-relaxed">{tie.length.toFixed(0)} mm</p>
                    </li>
                  ))}
                </ul>
              </div>
            </MaterialSummary>
            </div>
          ) : (
            <div className="bg-slate-50/80 [#1A1C24]/80 backdrop-blur-3xl border border-slate-200/50 rounded-[32px] p-4 sm:p-6 lg:p-12 text-center flex items-center justify-center h-full shadow-[0_8px_30px_rgba(15,23,42,0.04)] [0_8px_30px_rgba(15,23,42,0.2)] overflow-hidden">
              <span className="text-slate-600 font-medium tracking-wide">Enter beam dimensions and reinforcement details to calculate material requirements.</span>
            </div>
          )}
        </div>
      </div>
      
      <CalculationHistory
        calculatorId="beam_calculator"
        currentInputs={{ beamWidth, beamDepth, beamSpan, clearCover, longitudinalBarsCount, longitudinalBarDia, tensionBarsCount, compressionBarsCount, tensionBarDia, compressionBarDia }}
        currentResults={results ? {
          "Concrete Dry Vol": `${results.concreteVolumeDry.toFixed(2)} m³`,
          "Total Steel Wt": `${results.totalSteelWeight.toFixed(2)} kg`
        } : undefined}
        onRestore={(inputs) => {
          setBeamWidth(inputs.beamWidth || "300");
          setBeamDepth(inputs.beamDepth || "450");
          setBeamSpan(inputs.beamSpan || "5");
          setClearCover(inputs.clearCover || "30");
          setLongitudinalBarsCount(inputs.longitudinalBarsCount || "4");
          setLongitudinalBarDia(inputs.longitudinalBarDia || "16");
          setTensionBarsCount(inputs.tensionBarsCount || "3");
          setCompressionBarsCount(inputs.compressionBarsCount || "3");
          setTensionBarDia(inputs.tensionBarDia || "16");
          setCompressionBarDia(inputs.compressionBarDia || "12");
        }}
        estimationName="Beam"
      />
    </div>
  );
}

function InputGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
