import React, { useState, useMemo } from 'react';
import { Columns, Triangle, Building, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';

export default function LintelDesignTool() {
  // Inputs
  const [clearSpan, setClearSpan] = useState<number | "">(2.0); // m
  const [wallThickness, setWallThickness] = useState<number | "">(230); // mm
  const [wallHeightAbove, setWallHeightAbove] = useState<number | "">(2.5); // m
  const [masonryDensity, setMasonryDensity] = useState<number | "">(20); // kN/m3
  const [floorLoad, setFloorLoad] = useState<number | "">(0); // kN/m (additional load if floor falls in triangle)
  
  // Lintel Section
  const [lintelDepth, setLintelDepth] = useState<number | "">(200); // mm
  const [bearingLength, setBearingLength] = useState<number | "">(200); // mm per side
  
  // Materials
  const [fck, setFck] = useState<number | "">(20); // MPa
  const [fy, setFy] = useState<number | "">(500); // MPa
  const [cover, setCover] = useState<number | "">(25); // mm
  const [barDia, setBarDia] = useState<number | "">(10); // mm

  const results = useMemo(() => {
    const Lc = Number(clearSpan) || 0;
    const t = Number(wallThickness) || 0;
    const Hw = Number(wallHeightAbove) || 0;
    const rho_m = Number(masonryDensity) || 0;
    const W_floor = Number(floorLoad) || 0;
    
    const D = Number(lintelDepth) || 0;
    const Lb = Number(bearingLength) || 0;
    const fc = Number(fck) || 20;
    const fsteel = Number(fy) || 500;
    const c = Number(cover) || 25;
    const dia = Number(barDia) || 10;

    // Minimum bearing check
    const minBearing = Math.max(150, (Lc * 1000) / 10, D);
    const bearingSafe = Lb >= minBearing;

    // Effective span
    // L_eff = clear span + effective depth OR clear span + center to center of bearings
    const d = D - c - dia / 2;
    const Leff = Math.min(Lc + d / 1000, Lc + Lb / 1000);

    // Arch action height (Equilateral triangle 60 degree dispersion)
    const H_triangle = (Leff / 2) * Math.tan(60 * Math.PI / 180); // ~ 0.866 * Leff

    let isArchAction = false;
    let masonryLoad = 0; // Total masonry load (W)
    let maxMoment = 0; // kN.m
    let maxShear = 0; // kN
    let loadDistributionType = "Rectangular";

    const lintelSelfWeight = (t / 1000) * (D / 1000) * 25; // kN/m (Assuming concrete 25 kN/m3)

    if (Hw >= H_triangle && W_floor === 0) {
      // Arch action holds: triangular load
      isArchAction = true;
      loadDistributionType = "Triangular (Arch Action)";
      
      const W_triangle = 0.5 * Leff * H_triangle * (t / 1000) * rho_m; // Total kN for triangle
      const W_total_masonry = W_triangle;
      
      const w_self = lintelSelfWeight; // kN/m
      
      // Moment from triangular load: W*L/6
      // Moment from uniform self weight: w*L^2/8
      maxMoment = (W_triangle * Leff) / 6 + (w_self * Leff * Leff) / 8;
      maxShear = (W_triangle) / 2 + (w_self * Leff) / 2;
    } else {
      // Rectangular load
      loadDistributionType = "Rectangular (Uniform)";
      const w_masonry = Hw * (t / 1000) * rho_m; // kN/m
      const w_total = w_masonry + lintelSelfWeight + W_floor; // kN/m
      
      maxMoment = (w_total * Leff * Leff) / 8;
      maxShear = (w_total * Leff) / 2;
    }

    // Factored forces (Approx using standard partial safety factor 1.5)
    // Sometimes dead load factor 1.5, we'll apply it across.
    const Mu = maxMoment * 1.5;
    const Vu = maxShear * 1.5;

    // Flexural Design (Singly reinforced check)
    let Ast = 0;
    let requiredDepth = 0;
    
    // Check Depth
    let xu_max_ratio = 0.46; // for Fe500
    if (fsteel <= 250) xu_max_ratio = 0.53;
    else if (fsteel <= 415) xu_max_ratio = 0.48;
    else if (fsteel <= 500) xu_max_ratio = 0.46;
    else xu_max_ratio = 0.44;

    const R_lim = 0.36 * fc * xu_max_ratio * (1 - 0.416 * xu_max_ratio);
    requiredDepth = Math.sqrt((Mu * 1e6) / (R_lim * t)) + c + dia / 2;
    const depthSafe = D >= requiredDepth;

    if (depthSafe && d > 0) {
      const sqrtTerm = Math.max(0, 1 - (4.6 * Mu * 1e6) / (fc * t * d * d));
      Ast = (0.5 * fc / fsteel) * (1 - Math.sqrt(sqrtTerm)) * t * d;
    }
    
    const min_Ast = (0.85 * t * d) / fsteel;
    if (Ast < min_Ast) Ast = min_Ast;

    const noOfBars = Math.max(2, Math.ceil(Ast / (Math.PI * Math.pow(dia, 2) / 4)));
    const Ast_provided = noOfBars * Math.PI * Math.pow(dia, 2) / 4;

    return {
      Leff,
      H_triangle,
      isArchAction,
      loadDistributionType,
      Mu,
      Vu,
      Ast,
      Ast_provided,
      noOfBars,
      minBearing,
      bearingSafe,
      requiredDepth,
      depthSafe,
      d
    };

  }, [clearSpan, wallThickness, wallHeightAbove, masonryDensity, floorLoad, lintelDepth, bearingLength, fck, fy, cover, barDia]);

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Columns className="text-indigo-600" /> Lintel Scheduler & Design Tool
         </h2>
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-3 border-b border-slate-100 pb-2">Opening & Wall</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Clear Span" unit="m" value={clearSpan} onChange={setClearSpan} />
                    <NumberInput label="Wall Thickness" unit="mm" value={wallThickness} onChange={setWallThickness} />
                    <NumberInput label="Wall Ht Above" unit="m" value={wallHeightAbove} onChange={setWallHeightAbove} />
                    <NumberInput label="Masonry Density" unit="kN/m³" value={masonryDensity} onChange={setMasonryDensity} />
                    <div className="col-span-2">
                        <NumberInput label="Floor Load (Uniform)" unit="kN/m" value={floorLoad} onChange={setFloorLoad} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium mb-3 border-b border-slate-100 pb-2">Proposed Section</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Lintel Depth (D)" unit="mm" value={lintelDepth} onChange={setLintelDepth} />
                    <NumberInput label="Bearing Provided" unit="mm" value={bearingLength} onChange={setBearingLength} />
                    <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} />
                    <NumberInput label="Steel (fy)" unit="MPa" value={fy} onChange={setFy} />
                    <NumberInput label="Main Bar Dia" unit="mm" value={barDia} onChange={setBarDia} />
                    <NumberInput label="Cover" unit="mm" value={cover} onChange={setCover} />
                  </div>
                </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
                <MaterialSummary 
                    title="Load Analysis & Capacity"
                    totalLabel="Required Main Tension Steel"
                    totalValue={results.Ast.toFixed(0)}
                    totalUnit="mm²"
                    relatedToolIds={[]}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                        <ResultCard title="Effective Span" value={results.Leff.toFixed(2)} unit="m" variant="neutral" />
                        <ResultCard 
                            title="Load Type" 
                            value={results.loadDistributionType.split(" ")[0]} 
                            unit={results.isArchAction ? "Arch" : "Uniform"} 
                            variant={results.isArchAction ? "primary" : "warning"} 
                        />
                        <ResultCard title="Factored Moment" value={results.Mu.toFixed(1)} unit="kNm" variant="neutral" />
                    </div>

                    {!results.depthSafe && (
                        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 overflow-hidden">
                            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-base font-medium text-rose-900 mb-1">Section Depth Unsafe</p>
                                <p className="text-sm text-rose-700">Minimum required depth: <strong className="font-mono">{results.requiredDepth.toFixed(0)} mm</strong>. Consider increasing depth or using a doubly reinforced section.</p>
                            </div>
                        </div>
                    )}
                </MaterialSummary>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Bearing Constraint */}
                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${results.bearingSafe ? "bg-teal-50 border-teal-200" : "bg-rose-50 border-rose-200"}`}>
                       <div className="flex items-center gap-2">
                          {results.bearingSafe ? <CheckCircle2 className="text-teal-600 w-5 h-5" /> : <AlertTriangle className="text-rose-600 w-5 h-5" />}
                          <h3 className={`font-bold ${results.bearingSafe ? "text-teal-900" : "text-rose-900"}`}>Bearing Check</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.bearingSafe ? "text-teal-700" : "text-rose-700"}>Provided Bearing</span>
                            <span className={`font-mono font-bold ${results.bearingSafe ? "text-teal-900" : "text-rose-900"}`}>{Number(bearingLength)} mm</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.bearingSafe ? "text-teal-700" : "text-rose-700"}>Minimum Allowed</span>
                            <span className={`font-mono font-bold ${results.bearingSafe ? "text-teal-900" : "text-rose-900"}`}>{results.minBearing.toFixed(0)} mm</span>
                          </div>
                       </div>
                    </div>
                    
                    {/* Rebar Suggestion */}
                    <div className="p-4 sm:p-6 rounded-3xl border bg-slate-50 border-slate-200 flex flex-col gap-4 overflow-hidden">
                       <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-slate-600 w-5 h-5" />
                          <h3 className="font-bold text-slate-900">Provision Summary</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Suggested Reinforcement</span>
                            <span className="font-mono font-bold text-slate-800">{results.noOfBars} - {Number(barDia)}mm Ø</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Provided Area (Ast)</span>
                            <span className="font-mono font-bold text-slate-800">{results.Ast_provided.toFixed(0)} mm²</span>
                          </div>
                          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                             <span className="text-slate-600">Factored Shear (Vu)</span>
                             <span className="font-mono font-bold text-slate-800">{results.Vu.toFixed(1)} kN</span>
                          </div>
                       </div>
                    </div>
                </div>

                {/* Diagram visual guide */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-6 relative overflow-hidden h-40 flex items-end justify-center mt-2 group">
                   <div className="absolute inset-x-0 bottom-0 border-b-8 border-slate-300 w-3/4 mx-auto rounded"></div>
                   <div className="absolute bottom-2 inset-x-0 flex justify-between px-10 text-base font-medium">
                      <span>Support ({Number(bearingLength)}mm)</span>
                      <span>Span ({Number(clearSpan)}m)</span>
                      <span>Support ({Number(bearingLength)}mm)</span>
                   </div>
                   
                   {results.isArchAction ? (
                     <div className="absolute bottom-2 w-[60%] flex flex-col items-center">
                        <Triangle className="w-full text-indigo-200 mb-[-10%]" strokeWidth={1} fill="currentColor" />
                        <span className="absolute top-1/2 text-indigo-900 font-bold text-sm">60° Dispersion</span>
                     </div>
                   ) : (
                     <div className="absolute bottom-2 w-[60%] h-24 bg-blue-100 border-x border-t border-blue-200 border-dashed rounded-t flex items-center justify-center">
                         <span className="text-orange-800 font-bold text-sm opacity-60">Rectangular Load Zone</span>
                     </div>
                   )}
                </div>
            </div>
         </div>
      </div>
    
      <CalculationHistory 
        calculatorId="lintel_design" 
        currentInputs={{ clearSpan, wallThickness, wallHeightAbove, masonryDensity, floorLoad, lintelDepth, bearingLength, fck, fy, cover, barDia }} 
      />
    </div>
  );
}
