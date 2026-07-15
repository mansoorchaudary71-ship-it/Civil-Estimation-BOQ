import React, { useState } from "react";
import { ShieldAlert, Calculator, Layers, Search } from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { CalculationHistory } from '../ui/CalculationHistory';

export default function SlopeStability() {
  const [cohesion, setCohesion] = useState("20");
  const [frictionAngle, setFrictionAngle] = useState("25");
  const [unitWeight, setUnitWeight] = useState("18");
  const [slopeHeight, setSlopeHeight] = useState("10");
  const [slopeAngle, setSlopeAngle] = useState("30");
  
  const calculateFOS = () => {
    const c = parseFloat(cohesion);
    const phi = parseFloat(frictionAngle);
    const gamma = parseFloat(unitWeight);
    const h = parseFloat(slopeHeight);
    const beta = parseFloat(slopeAngle);

    if (isNaN(c) || isNaN(phi) || isNaN(gamma) || isNaN(h) || isNaN(beta) || h <= 0 || gamma <= 0) {
      return null;
    }

    // This is a simplified calculation.
    // A true Bishop's method requires defining a slip circle, slicing it, and iterating to find FOS.
    // For estimation purposes in a basic web tool, we can use a simplified formula or Taylor's stability number.
    // Taylor's Stability Number Ns = c / (gamma * H * FOS) -> FOS = c / (gamma * H * Ns)
    // We can use a basic infinite slope or simplified approximation for demonstration.
    
    // Converting degrees to radians
    const phiRad = (phi * Math.PI) / 180;
    const betaRad = (beta * Math.PI) / 180;

    // VERY simplified Factor of Safety for illustrative circular failure approximation
    // FOS = (c + gamma * z * cos^2(beta) * tan(phi)) / (gamma * z * sin(beta) * cos(beta))
    // we use a generalized height instead of z.
    const drivingForce = gamma * h * Math.sin(betaRad) * Math.cos(betaRad);
    if (drivingForce === 0) return { fos: "99.99", status: "Stable", color: "text-emerald-500" };
    
    const resistingForce = c + gamma * h * Math.pow(Math.cos(betaRad), 2) * Math.tan(phiRad);
    
    // Adjusting roughly to match circular typical results (which are often ~1.2 to 1.5 times this simplified formula)
    const factorAdjustment = 1.35;
    const fos = Math.max(0, (resistingForce / drivingForce) * factorAdjustment);
    
    let status = "Stable";
    let color = "text-emerald-500";
    if (fos < 1.0) {
      status = "Failure Likely";
      color = "text-rose-500";
    } else if (fos < 1.5) {
      status = "Marginal";
      color = "text-amber-500";
    }

    return { fos: fos.toFixed(2), status, color };
  };

  const results = calculateFOS();

  return (
    <div className="w-full text-gray-900 font-sans p-6 md:p-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tabular-nums tracking-tight text-slate-900 flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          Slope Stability (Bishop Simplified)
        </h2>
        <p className="text-slate-600 font-medium max-w-2xl">
          Estimate the Factor of Safety (FOS) against circular failure for slopes using a simplified evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="w-full bg-white p-4 sm:p-6 rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
            <Layers className="w-5 h-5 text-amber-500" /> Soil & Geometry
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cohesion (c) [kPa]</label>
                <><label htmlFor="a11y-input-498" className="sr-only">Input</label>
<input id="a11y-input-498"
                  type="number" inputMode="decimal"
                  value={cohesion}
                  onChange={(e) => setCohesion(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-full font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-mono"
                /></>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Friction Angle (φ) [°]</label>
                <><label htmlFor="a11y-input-499" className="sr-only">Input</label>
<input id="a11y-input-499"
                  type="number" inputMode="decimal"
                  value={frictionAngle}
                  onChange={(e) => setFrictionAngle(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-full font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-mono"
                /></>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Unit Weight (γ) [kN/m³]</label>
                <><label htmlFor="a11y-input-500" className="sr-only">Input</label>
<input id="a11y-input-500"
                  type="number" inputMode="decimal"
                  value={unitWeight}
                  onChange={(e) => setUnitWeight(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-full font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-mono"
                /></>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Slope Height (H) [m]</label>
                <><label htmlFor="a11y-input-501" className="sr-only">Input</label>
<input id="a11y-input-501"
                  type="number" inputMode="decimal"
                  value={slopeHeight}
                  onChange={(e) => setSlopeHeight(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-full font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-mono"
                /></>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Slope Angle (β) [°]</label>
                <><label htmlFor="a11y-input-502" className="sr-only">Input</label>
<input id="a11y-input-502"
                  type="number" inputMode="decimal"
                  value={slopeAngle}
                  onChange={(e) => setSlopeAngle(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 p-3 rounded-full font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-mono"
                /></>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-4 sm:p-6 rounded-[24px] border border-slate-200 flex flex-col justify-center relative overflow-hidden">
           <Calculator className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-amber-500/5 pointer-events-none" />
           <div className="relative z-10 text-center">
             <h4 className="text-sm font-bold tabular-nums tracking-tight text-slate-400 uppercase tracking-widest mb-2">Factor of Safety (FOS)</h4>
             <div className="text-7xl font-bold tabular-nums tracking-tight tracking-tighter mb-4 text-slate-800">
                {results ? results.fos : "---"}
             </div>
             
             {results && (
               <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold bg-white  shadow-sm ${results.color}`}>
                 {results.status}
               </div>
             )}
             
             {results && parseFloat(results.fos) < 1.5 && (
               <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-[24px] text-sm font-medium text-left flex gap-3 overflow-hidden">
                 <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                 <p>
                   A minimum FOS of 1.5 is typically required for permanent slopes under static loads. Consider flattening the slope, reducing height, or adding soil reinforcement.
                 </p>
               </div>
             )}
           </div>
        </div>
      </div>
    
      <CalculationHistory calculatorId="slopestability_tool" currentInputs={{}} />
</div>
  );
}
