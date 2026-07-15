import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { UniversalTabs } from "../ui/UniversalTabs";
import { Layers, Info, CheckCircle2, ChevronRight, Calculator, Ruler, Hash, Cylinder, ArrowRight } from "lucide-react";
import { useGlobalSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { DetailedCalculationDisplay } from "../ui/DetailedCalculationDisplay";
import { NumberInput } from "../ui/NumberInput";
import { SEO } from "../SEO";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import { parseNum } from "../../utils/mathHelpers";

const StaircaseVisualizer = ({ rise, tread, numSteps, uLen }: { rise: number, tread: number, numSteps: number, uLen: string }) => {
  const r = rise > 0 ? rise : 0.15;
  const t = tread > 0 ? tread : 0.25;
  const stepsCount = numSteps > 0 ? Math.min(Math.floor(numSteps), 20) : 10;
  
  const totalW = stepsCount * t;
  const totalH = stepsCount * r;
  
  const viewBoxW = totalW * 100;
  const viewBoxH = totalH * 100;
  const waistThickness = 0.15 * 100;
  
  let d = `M 0 ${viewBoxH} `;
  let currX = 0;
  let currY = viewBoxH;
  
  const rPx = r * 100;
  const tPx = t * 100;
  
  for(let i=0; i<stepsCount; i++) {
     currY -= rPx; 
     d += `L ${currX} ${currY} `;
     currX += tPx; 
     d += `L ${currX} ${currY} `;
  }
  
  d += `L ${viewBoxW} ${waistThickness} `;
  d += `L 0 ${viewBoxH + waistThickness} Z`;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-200 dark:border-slate-700/50 p-4 sm:p-6 flex flex-col relative overflow-hidden mt-6 shadow-sm group">
        <div className="flex items-center justify-between mb-4">
           <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Live Layout Schematic
           </h4>
           <div className="flex gap-4 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500"><span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalH.toFixed(2)}{uLen}</span> Rise</span>
              <span className="text-[11px] font-semibold text-slate-500"><span className="text-indigo-600 dark:text-indigo-400 font-bold">{totalW.toFixed(2)}{uLen}</span> Run</span>
           </div>
        </div>
        
        <div className="w-full aspect-[4/3] sm:aspect-[16/9] bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 relative flex items-center justify-center p-4 sm:p-10 overflow-hidden shadow-inner">
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
           
           <svg viewBox={`-30 -30 ${viewBoxW + 60} ${viewBoxH + 60 + waistThickness}`} className="w-full h-full overflow-visible drop-shadow-xl z-10 transition-all duration-300 transform group-hover:scale-[1.02]">
              <path d={d} fill="currentColor" className="text-indigo-50 dark:text-indigo-900/20 transition-all duration-500" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d={d} fill="none" className="text-indigo-500 dark:text-indigo-400" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              
              {stepsCount > 1 && (
                  <g className="animate-in fade-in duration-500">
                      <path d={`M ${tPx} ${viewBoxH - rPx} L ${tPx} ${viewBoxH - 2*rPx} L ${2*tPx} ${viewBoxH - 2*rPx}`} fill="none" stroke="#f59e0b" strokeWidth="3.5" />
                      
                      <line x1={tPx - (viewBoxW*0.02)} y1={viewBoxH - rPx} x2={tPx - (viewBoxW*0.02)} y2={viewBoxH - 2*rPx} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" />
                      <text x={tPx - (viewBoxW*0.03)} y={viewBoxH - 1.5*rPx} fontSize={Math.max(12, viewBoxW * 0.05)} fill="#d97706" textAnchor="end" dominantBaseline="middle" fontWeight="bold">{r.toFixed(2)}</text>
                      
                      <line x1={tPx} y1={viewBoxH - 2*rPx - (viewBoxH*0.04)} x2={2*tPx} y2={viewBoxH - 2*rPx - (viewBoxH*0.04)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" />
                      <text x={1.5*tPx} y={viewBoxH - 2*rPx - (viewBoxH*0.05)} fontSize={Math.max(12, viewBoxW * 0.05)} fill="#d97706" textAnchor="middle" fontWeight="bold">{t.toFixed(2)}</text>
                  </g>
              )}
           </svg>
        </div>
    </div>
  )
}

export default function StaircaseCalculator() {
  const { currentUnit } = useGlobalSettings();
  const isSI = currentUnit === "Metric";
  const uLen = isSI ? "m" : "ft";
  const uMm = isSI ? "mm" : "in";
  const uVol = isSI ? "m³" : "CFT";
  
  const [stairShape, setStairShape] = useState(() => localStorage.getItem("stair_stairShape") || "Straight");
  const [numSteps, setNumSteps] = useState(() => localStorage.getItem("stair_numSteps") || "10");
  const [flight1Steps, setFlight1Steps] = useState(() => localStorage.getItem("stair_flight1Steps") || "5");
  const [flight2Steps, setFlight2Steps] = useState(() => localStorage.getItem("stair_flight2Steps") || "5");
  const [rise, setRise] = useState(() => localStorage.getItem("stair_rise") || "0.15");
  const [tread, setTread] = useState(() => localStorage.getItem("stair_tread") || "0.25");
  const [stairWidth, setStairWidth] = useState(() => localStorage.getItem("stair_stairWidth") || "1.2");
  const [waistThickness, setWaistThickness] = useState(() => localStorage.getItem("stair_waistThickness") || "0.15");
  const [landingLength, setLandingLength] = useState(() => localStorage.getItem("stair_landingLength") || "1.2");
  const [landingWidth, setLandingWidth] = useState(() => localStorage.getItem("stair_landingWidth") || "1.2");
  
  const [mainBarDia, setMainBarDia] = useState(() => localStorage.getItem("stair_mainBarDia") || "12");
  const [mainBarSpacing, setMainBarSpacing] = useState(() => localStorage.getItem("stair_mainBarSpacing") || "150");
  const [distBarDia, setDistBarDia] = useState(() => localStorage.getItem("stair_distBarDia") || "10");
  const [distBarSpacing, setDistBarSpacing] = useState(() => localStorage.getItem("stair_distBarSpacing") || "200");
  const [clearCover, setClearCover] = useState(() => localStorage.getItem("stair_clearCover") || "20");
  const [concreteGrade, setConcreteGrade] = useState(() => localStorage.getItem("stair_concreteGrade") || "M20");
  const [wastage, setWastage] = useState(() => localStorage.getItem("stair_wastage") || "5");
  const [landings, setLandings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("stair_landings");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("stair_stairShape", stairShape);
    localStorage.setItem("stair_numSteps", numSteps);
    localStorage.setItem("stair_flight1Steps", flight1Steps);
    localStorage.setItem("stair_flight2Steps", flight2Steps);
    localStorage.setItem("stair_rise", rise);
    localStorage.setItem("stair_tread", tread);
    localStorage.setItem("stair_stairWidth", stairWidth);
    localStorage.setItem("stair_waistThickness", waistThickness);
    localStorage.setItem("stair_landingLength", landingLength);
    localStorage.setItem("stair_landingWidth", landingWidth);
    localStorage.setItem("stair_mainBarDia", mainBarDia);
    localStorage.setItem("stair_mainBarSpacing", mainBarSpacing);
    localStorage.setItem("stair_distBarDia", distBarDia);
    localStorage.setItem("stair_distBarSpacing", distBarSpacing);
    localStorage.setItem("stair_clearCover", clearCover);
    localStorage.setItem("stair_concreteGrade", concreteGrade);
    localStorage.setItem("stair_wastage", wastage);
    localStorage.setItem("stair_landings", JSON.stringify(landings));
  }, [stairShape, numSteps, flight1Steps, flight2Steps, rise, tread, stairWidth, waistThickness, landingLength, landingWidth, mainBarDia, mainBarSpacing, distBarDia, distBarSpacing, clearCover, concreteGrade, wastage, landings]);

  const { res, calcSteps } = useMemo(() => {
    let wetVol = 0;
    let cementBags = 0;
    let sandCft = 0;
    let aggCft = 0;
    let steelKg = 0;
    
    const steps: any[] = [];
    
    const isStraight = stairShape === "Straight";
    const stepsCount = isStraight ? (parseNum(numSteps) || 0) : ((parseNum(flight1Steps) || 0) + (parseNum(flight2Steps) || 0));
    let r = parseNum(rise) || 0;
    let t = parseNum(tread) || 0;
    let w = parseNum(stairWidth) || 0;
    let waist = parseNum(waistThickness) || 0;
    let lLength = parseNum(landingLength) || 0;
    let lWidth = parseNum(landingWidth) || 0;
    const was = parseNum(wastage) || 0;

    if (r > 0 && t > 0 && w > 0 && stepsCount > 0) {
      if (!isSI && uLen === "ft") {
        r = r * 0.3048;
        t = t * 0.3048;
        w = w * 0.3048;
        waist = waist * 0.3048;
        lLength = lLength * 0.3048;
        lWidth = lWidth * 0.3048;
      }

      // Step 1: Volume of Steps (Triangular portion)
      const volOneStep = (r * t * w) / 2;
      const totalStepVol = volOneStep * stepsCount;
      steps.push({
        stepName: "1. Volume of Steps (Triangular Portion)",
        equation: "V_steps = [(Rise × Tread × Width) / 2] × Total Steps",
        insight: "Calculates the total concrete required for the treads and risers.",
        variables: [
          { name: "Rise", value: r.toFixed(3), unit: "m" },
          { name: "Tread", value: t.toFixed(3), unit: "m" },
          { name: "Width", value: w.toFixed(3), unit: "m" },
          { name: "Total Steps", value: stepsCount }
        ],
        substitution: `V_steps = [(${r.toFixed(3)} × ${t.toFixed(3)} × ${w.toFixed(3)}) / 2] × ${stepsCount}`,
        result: parseFloat(totalStepVol.toFixed(4)),
        resultUnit: "m³",
        resultColor: "emerald"
      });

      // Step 2: Volume of Waist Slab
      const inclinedLen = Math.sqrt(r * r + t * t);
      const totalInclinedLen = inclinedLen * stepsCount;
      const waistVol = totalInclinedLen * w * waist;
      steps.push({
        stepName: "2. Waist Slab Volume",
        equation: "V_waist = (√(Rise² + Tread²) × Steps) × Width × Waist_Thickness",
        variables: [
          { name: "Inclined Length", value: totalInclinedLen.toFixed(3), unit: "m" },
          { name: "Waist Thickness", value: waist.toFixed(3), unit: "m" }
        ],
        substitution: `V_waist = ${totalInclinedLen.toFixed(3)} × ${w.toFixed(3)} × ${waist.toFixed(3)}`,
        result: parseFloat(waistVol.toFixed(4)),
        resultUnit: "m³",
        resultColor: "emerald"
      });

      // Step 3: Volume of Landing
      let landingVol = 0;
      if (!isStraight) {
         landingVol = lLength * lWidth * waist;
         steps.push({
           stepName: "3. Landing Volume",
           equation: "V_landing = Length × Width × Thickness",
           variables: [
             { name: "Length", value: lLength.toFixed(3), unit: "m" },
             { name: "Width", value: lWidth.toFixed(3), unit: "m" },
             { name: "Thickness", value: waist.toFixed(3), unit: "m" }
           ],
           substitution: `V_landing = ${lLength.toFixed(3)} × ${lWidth.toFixed(3)} × ${waist.toFixed(3)}`,
           result: parseFloat(landingVol.toFixed(4)),
           resultUnit: "m³",
           resultColor: "emerald"
         });
      }

      // Step 4: Total Volume
      const totalConcreteVol = totalStepVol + waistVol + landingVol;
      steps.push({
        stepName: !isStraight ? "4. Total Wet Concrete Volume" : "3. Total Wet Concrete Volume",
        equation: "V_total_wet = V_steps + V_waist" + (!isStraight ? " + V_landing" : ""),
        variables: [
          { name: "V_steps", value: totalStepVol.toFixed(4), unit: "m³" },
          { name: "V_waist", value: waistVol.toFixed(4), unit: "m³" },
          ...( !isStraight ? [{ name: "V_landing", value: landingVol.toFixed(4), unit: "m³" }] : [])
        ],
        substitution: `V_total_wet = ${totalStepVol.toFixed(4)} + ${waistVol.toFixed(4)}` + (!isStraight ? ` + ${landingVol.toFixed(4)}` : ""),
        result: parseFloat(totalConcreteVol.toFixed(4)),
        resultUnit: "m³",
        resultColor: "emerald"
      });

      // Step 5: With wastage
      const totalWithWastage = totalConcreteVol * (1 + (was / 100));
      steps.push({
        stepName: !isStraight ? "5. With Wastage" : "4. With Wastage",
        equation: "V_wastage = V_total_wet × (1 + wastage%)",
        variables: [
          { name: "Total", value: totalConcreteVol.toFixed(4), unit: "m³" },
          { name: "Wastage", value: was, unit: "%" }
        ],
        substitution: `V_wastage = ${totalConcreteVol.toFixed(4)} × 1.${was.toString().padStart(2, '0')}`,
        result: parseFloat(totalWithWastage.toFixed(4)),
        resultUnit: "m³",
        resultColor: "emerald"
      });

      // Step 5.5: Dry Volume conversion
      const dryVol = totalWithWastage * 1.54;
      wetVol = totalWithWastage;
      
      const parts = concreteGrade.match(/\(([\d.]+):([\d.]+):([\d.]+)\)/);
      let cPart = 1, sPart = 1.5, aPart = 3;
      if (parts) {
        cPart = parseFloat(parts[1]);
        sPart = parseFloat(parts[2]);
        aPart = parseFloat(parts[3]);
      }
      const sum = cPart + sPart + aPart;

      // Cement bags
      cementBags = Math.ceil((dryVol * (cPart / sum)) / 0.0347);
      steps.push({
        stepName: !isStraight ? "6. Cement Bags" : "5. Cement Bags",
        equation: "Bags = (Dry Volume × cement_ratio / total_ratio) / 0.0347",
        insight: "System Rule: V_dry = V_wet * 1.54. Then 1 bag = 50kg = 0.0347 m³. Rule Enforcement Active.",
        variables: [
          { name: "Dry Volume", value: dryVol.toFixed(4), unit: "m³" },
          { name: "Ratio (C:S:A)", value: `${cPart}:${sPart}:${aPart}` }
        ],
        substitution: `Bags = (${dryVol.toFixed(4)} × ${cPart} / ${sum}) / 0.0347`,
        result: cementBags,
        resultUnit: "bags",
        resultColor: "purple"
      });

      // Sand CFT
      sandCft = (dryVol * (sPart / sum)) * 35.3147;
      steps.push({
        stepName: !isStraight ? "7. Sand Volume" : "6. Sand Volume",
        equation: "Sand (CFT) = Dry Volume × (sand_ratio / total_ratio) × 35.3147",
        variables: [
          { name: "Dry Volume", value: dryVol.toFixed(4), unit: "m³" }
        ],
        substitution: `Sand = ${dryVol.toFixed(4)} × (${sPart} / ${sum}) × 35.3147`,
        result: parseFloat(sandCft.toFixed(2)),
        resultUnit: "CFT",
        resultColor: "blue"
      });

      // Aggregate CFT
      aggCft = (dryVol * (aPart / sum)) * 35.3147;
      steps.push({
        stepName: !isStraight ? "8. Aggregate Volume" : "7. Aggregate Volume",
        equation: "Aggregate (CFT) = Dry Volume × (aggregate_ratio / total_ratio) × 35.3147",
        variables: [
          { name: "Dry Volume", value: dryVol.toFixed(4), unit: "m³" }
        ],
        substitution: `Aggregate = ${dryVol.toFixed(4)} × (${aPart} / ${sum}) × 35.3147`,
        result: parseFloat(aggCft.toFixed(2)),
        resultUnit: "CFT",
        resultColor: "orange"
      });

      // Steel = Total concrete volume × 1% × 7850 kg/m³
      // Rebar steel estimation is typically 0.8% - 1.2% for stairs. Let's use 1% on total volume including landing.
      steelKg = totalConcreteVol * 0.01 * 7850;
      steps.push({
        stepName: !isStraight ? "9. Steel Requirement" : "8. Steel Requirement",
        equation: "Steel (kg) = Total Wet Volume × 1% × 7850",
        insight: "Assuming roughly 1% reinforcement weight per cubic meter of concrete by volume.",
        variables: [
          { name: "Total Wet Vol", value: totalConcreteVol.toFixed(4), unit: "m³" }
        ],
        substitution: `Steel = ${totalConcreteVol.toFixed(4)} × 0.01 × 7850`,
        result: parseFloat(steelKg.toFixed(2)),
        resultUnit: "kg",
        resultColor: "emerald"
      });
    }
    
    return {
      res: {
        cementBags,
        sandCft: parseFloat(sandCft.toFixed(2)),
        aggCft: parseFloat(aggCft.toFixed(2)),
        totalWetVolume: wetVol,
        totalSteelWeight: steelKg + (steelKg * was) / 100
      },
      calcSteps: steps
    };
  }, [stairShape, numSteps, flight1Steps, flight2Steps, rise, tread, stairWidth, waistThickness, landingLength, landingWidth, mainBarDia, mainBarSpacing, distBarDia, distBarSpacing, clearCover, concreteGrade, wastage, isSI, uLen]);

  const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
      <label className="block text-base font-medium uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );

  const rVal = parseFloat(rise) || 0;
  const tVal = parseFloat(tread) || 0;
  let warningText = "";
  if (rVal > 0 && tVal > 0) {
    const rMm = isSI ? rVal * 1000 : rVal * 304.8;
    const tMm = isSI ? tVal * 1000 : tVal * 304.8;
    const formula = (2 * rMm) + tMm;
    if (formula < 600 || formula > 640) {
      warningText = `Warning: 2R + T = ${Math.round(formula)}mm — outside 600-640mm ideal range. Suggest R=150mm, T=300mm.`;
    }
  }

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('tool-header-extra-controls'));
  }, []);

  const dropdownElement = (
    <div className="flex justify-start w-full sm:w-auto">
      <select 
        value={stairShape}
        onChange={(e) => {
          setStairShape(e.target.value);
          if (e.target.value === "U-Shape") {
            setLandingLength(stairWidth);
            setLandingWidth((parseFloat(stairWidth) * 2).toString());
          } else if (e.target.value === "L-Shape") {
            setLandingLength(stairWidth);
            setLandingWidth(stairWidth);
          }
        }}
        className="px-6 py-3 bg-white border border-slate-200/60 text-slate-700 text-base font-medium tracking-wide rounded-full shadow-[0_2px_14px_rgba(0,0,0,0.02)] hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/20 transition-all cursor-pointer w-full sm:w-auto min-w-[200px] overflow-hidden"
      >
        <option value="Straight">Straight Flight</option>
        <option value="L-Shape">L-Shape (Quarter Turn)</option>
        <option value="U-Shape">U-Shape (Half Turn)</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6 mt-4">
      <SEO title="Staircase Calculator" description="Calculate concrete and steel for stairs." />
      {portalTarget && createPortal(dropdownElement, portalTarget)}
      <div className="w-full bg-slate-50/50 rounded-[32px] overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-start">
            <div className="space-y-6">
              {stairShape === "Straight" ? (
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Total Steps">
                    <NumberInput value={numSteps} onChange={(val) => setNumSteps(val.toString())} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                  <InputGroup label={`Stair Width (${uLen})`}>
                    <NumberInput value={stairWidth} onChange={(val) => setStairWidth(val.toString())} placeholder="e.g. 1.2" step="0.1" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InputGroup label="Flight 1 Steps">
                    <NumberInput value={flight1Steps} onChange={(val) => setFlight1Steps(val.toString())} className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                  <InputGroup label="Flight 2 Steps">
                    <NumberInput value={flight2Steps} onChange={(val) => setFlight2Steps(val.toString())} className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                  <InputGroup label={`Stair Width (${uLen})`}>
                    <NumberInput value={stairWidth} onChange={(val) => setStairWidth(val.toString())} placeholder="e.g. 1.2" step="0.1" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InputGroup label={`Rise (${uLen})`}>
                  <NumberInput value={rise} onChange={(val) => setRise(val.toString())} placeholder="e.g. 0.15" step="0.01" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                </InputGroup>
                <InputGroup label={`Tread (${uLen})`}>
                  <NumberInput value={tread} onChange={(val) => setTread(val.toString())} placeholder="e.g. 0.25" step="0.01" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                </InputGroup>
                <InputGroup label={`Waist Thick (${uLen})`}>
                  <NumberInput value={waistThickness} onChange={(val) => setWaistThickness(val.toString())} placeholder="e.g. 0.15" step="0.01" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                </InputGroup>
              </div>

              {stairShape !== "Straight" && (
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label={`Landing Length (${uLen})`}>
                    <NumberInput value={landingLength} onChange={(val) => setLandingLength(val.toString())} placeholder="e.g. 1.2" step="0.1" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                  <InputGroup label={`Landing Width (${uLen})`}>
                    <NumberInput value={landingWidth} onChange={(val) => setLandingWidth(val.toString())} placeholder="e.g. 2.4" step="0.1" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                  </InputGroup>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Mix Ratio">
                  <select value={concreteGrade} onChange={e => setConcreteGrade(e.target.value)} className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] px-5 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 hover:border-indigo-300 shadow-sm transition-all overflow-hidden">
                    <option value="M10 (1:3:6)">M10 (1:3:6)</option>
                    <option value="M15 (1:2:4)">M15 (1:2:4)</option>
                    <option value="M20 (1:1.5:3)">M20 (1:1.5:3)</option>
                    <option value="M25 (1:1:2)">M25 (1:1:2)</option>
                  </select>
                </InputGroup>
                <InputGroup label="Wastage (%)">
                  <NumberInput value={wastage} onChange={(val) => setWastage(val.toString())} placeholder="e.g. 5" className="w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] font-semibold shadow-sm transition-all overflow-hidden" />
                </InputGroup>
              </div>
              
              {warningText && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-[24px] text-base font-normal flex items-start gap-3 overflow-hidden">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{warningText}</p>
                </div>
              )}
              
              <StaircaseVisualizer rise={parseFloat(rise) || 0} tread={parseFloat(tread) || 0} numSteps={stairShape === "Straight" ? (parseFloat(numSteps) || 0) : ((parseFloat(flight1Steps) || 0) + (parseFloat(flight2Steps) || 0))} uLen={uLen} />
            </div>
            
            <div className="flex flex-col h-full mt-4 lg:mt-0">
              <MaterialSummary
                 title="Quantity Summary"
                 totalLabel="Total Steel Required"
                 totalValue={res.totalSteelWeight.toFixed(1)}
                 totalUnit="kg"
               >
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                   <ResultCard
                     title="Cement"
                     value={res.cementBags}
                     unit="bags"
                     variant="secondary"
                   />
                   <ResultCard
                     title="Sand"
                     value={res.sandCft}
                     unit="CFT"
                     variant="warning"
                   />
                   <ResultCard
                     title="Aggregate"
                     value={res.aggCft}
                     unit="CFT"
                     variant="neutral"
                   />
                 </div>
               </MaterialSummary>
            </div>
          </div>
        </div>
      </div>
      
      <DetailedCalculationDisplay steps={calcSteps} />
      <CalculationHistory
        calculatorId="staircase_calculator_v1"
        currentInputs={{ stairShape, numSteps, flight1Steps, flight2Steps, rise, tread, stairWidth, waistThickness, landingLength, landingWidth, mainBarDia, mainBarSpacing, distBarDia, distBarSpacing, clearCover, concreteGrade, wastage, landings }}
        currentResults={res}
        summaryGeneration={(inputs, results) => `${inputs.stairShape} Staircase: ${results?.totalWetVolume?.toFixed(2) || 0} m³ concrete`}
        onRestore={(inputs) => {
          if (inputs.stairShape) setStairShape(inputs.stairShape);
          if (inputs.numSteps !== undefined) setNumSteps(inputs.numSteps);
          if (inputs.flight1Steps !== undefined) setFlight1Steps(inputs.flight1Steps);
          if (inputs.flight2Steps !== undefined) setFlight2Steps(inputs.flight2Steps);
          if (inputs.landingLength !== undefined) setLandingLength(inputs.landingLength);
          if (inputs.landingWidth !== undefined) setLandingWidth(inputs.landingWidth);
          if (inputs.rise !== undefined) setRise(inputs.rise);
          if (inputs.tread !== undefined) setTread(inputs.tread);
          if (inputs.stairWidth !== undefined) setStairWidth(inputs.stairWidth);
          if (inputs.waistThickness !== undefined) setWaistThickness(inputs.waistThickness);
          if (inputs.mainBarDia !== undefined) setMainBarDia(inputs.mainBarDia);
          if (inputs.mainBarSpacing !== undefined) setMainBarSpacing(inputs.mainBarSpacing);
          if (inputs.distBarDia !== undefined) setDistBarDia(inputs.distBarDia);
          if (inputs.distBarSpacing !== undefined) setDistBarSpacing(inputs.distBarSpacing);
          if (inputs.clearCover !== undefined) setClearCover(inputs.clearCover);
          if (inputs.concreteGrade !== undefined) setConcreteGrade(inputs.concreteGrade);
          if (inputs.wastage !== undefined) setWastage(inputs.wastage);
          if (inputs.landings !== undefined) setLandings(inputs.landings);
        }}
      />
    </div>
  );
}
