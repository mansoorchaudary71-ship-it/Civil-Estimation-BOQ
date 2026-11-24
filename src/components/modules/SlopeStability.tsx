import React, { useState } from "react";
import { ShieldAlert, Calculator, Layers, Search } from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { CalculationHistory } from '../ui/CalculationHistory';
import { CodeTooltip } from "../ui/CodeTooltip";

export default function SlopeStability() {
  const [cohesion, setCohesion] = useState("20");
  const [frictionAngle, setFrictionAngle] = useState("25");
  const [unitWeight, setUnitWeight] = useState("18");
  const [slopeHeight, setSlopeHeight] = useState("10");
  const [slopeAngle, setSlopeAngle] = useState("30");
  const [slipDepth, setSlipDepth] = useState("10"); // z, m (defaults to slope height)
  const [porePressureRatio, setPorePressureRatio] = useState("0"); // ru
  
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

    // Infinite-slope (planar) screening ONLY — this is NOT Bishop's method
    // (true Bishop needs slip-circle slicing + iteration). No invented factor:
    // FoS = [c + gamma*z*cos^2(beta)*(1-ru)*tan(phi)] / [gamma*z*sin(beta)*cos(beta)]
    // Worked defaults (c=20, phi=25, gamma=18, z=H=10, beta=30, ru=0): FoS = 1.06, not 1.44.
    const z = parseFloat(slipDepth);
    const ru = parseFloat(porePressureRatio);
    if (isNaN(z) || z <= 0 || isNaN(ru) || ru < 0 || ru >= 1) return null;
    const drivingForce = gamma * z * Math.sin(betaRad) * Math.cos(betaRad);
    if (drivingForce === 0) return { fos: "99.99", status: "Stable", color: "text-ui-successText" };
    const resistingForce = c + gamma * z * Math.pow(Math.cos(betaRad), 2) * (1 - ru) * Math.tan(phiRad);
    const fos = Math.max(0, resistingForce / drivingForce);
    
    let status = "Stable";
    let color = "text-ui-successText";
    if (fos < 1.0) {
      status = "Failure Likely";
      color = "text-ui-errorText";
    } else if (fos < 1.5) {
      status = "Marginal";
      color = "text-accent-700";
    }

    return { fos: fos.toFixed(2), status, color };
  };

  const results = calculateFOS();

  return (
    <div className="w-full text-txt-primary font-sans p-6 md:p-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tabular-nums tracking-tight text-txt-primary flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-accent-700" />
          Infinite Slope Stability — Screening Only (not Bishop)
        </h2>
        <p className="text-txt-secondary font-medium max-w-2xl">
          Screening-only infinite-slope Factor of Safety. This is NOT a Bishop circular-slip analysis — use slope-stability software for design.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
        {/* Inputs */}
        <div className="w-full bg-surface-default p-4 sm:p-6 rounded-2xl shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-txt-primary">
            <Layers className="w-5 h-5 text-accent-700" /> Soil & Geometry
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase">Cohesion (c) [kPa]</label>
                <><label htmlFor="a11y-input-498" className="sr-only">Input</label>
<input id="a11y-input-498"
                  type="number" inputMode="decimal"
                  value={cohesion}
                  onChange={(e) => setCohesion(e.target.value)}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                /></>
              </div>
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase"><span className="flex items-center gap-1">Friction Angle (φ) [°] <CodeTooltip standard="IS" code="1904:1986" description="Coefficient of friction for sliding resistance of foundations." /></span></label>
                <><label htmlFor="a11y-input-499" className="sr-only">Input</label>
<input id="a11y-input-499"
                  type="number" inputMode="decimal"
                  value={frictionAngle}
                  onChange={(e) => setFrictionAngle(e.target.value)}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                /></>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase"><span className="flex items-center gap-1">Unit Weight (γ) [kN/m³] <CodeTooltip standard="IS" code="875 (Part 1)" description="Unit weights of building materials and stored materials." /></span></label>
                <><label htmlFor="a11y-input-500" className="sr-only">Input</label>
<input id="a11y-input-500"
                  type="number" inputMode="decimal"
                  value={unitWeight}
                  onChange={(e) => setUnitWeight(e.target.value)}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                /></>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-color mt-4">
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase">Slope Height (H) [m]</label>
                <><label htmlFor="a11y-input-501" className="sr-only">Input</label>
<input id="a11y-input-501"
                  type="number" inputMode="decimal"
                  value={slopeHeight}
                  // In this infinite-slope screening the slip plane is at the
                  // toe, so z = H: changing H moves the slip depth with it
                  // (the old code kept H as a dead input — only z was used).
                  onChange={(e) => { setSlopeHeight(e.target.value); setSlipDepth(e.target.value); }}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                /></>
              </div>
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase">Slope Angle (β) [°]</label>
                <><label htmlFor="a11y-input-502" className="sr-only">Input</label>
<input id="a11y-input-502"
                  type="number" inputMode="decimal"
                  value={slopeAngle}
                  onChange={(e) => setSlopeAngle(e.target.value)}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                /></>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-color mt-4">
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase">Slip-plane depth (z) [m]</label>
                <input id="a11y-input-503" type="number" inputMode="decimal" value={slipDepth}
                  onChange={(e) => setSlipDepth(e.target.value)}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-txt-tertiary uppercase">Pore-pressure ratio (ru) [0–0.9]</label>
                <input id="a11y-input-504" type="number" inputMode="decimal" value={porePressureRatio}
                  onChange={(e) => setPorePressureRatio(e.target.value)}
                  className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-mono"
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-txt-secondary">Infinite-slope screening only: FoS = [c + γ·z·cos²β·(1−ru)·tanφ] / [γ·z·sinβ·cosβ]. The slip plane is taken at the toe (z = H), so changing Slope Height moves the slip depth with it; edit Slip-plane depth separately for a shallower slip surface. No Bishop analysis — use slope-stability software for design. Defaults give FoS 1.06 (Marginal).</p>
          </div>
        </div>

        {/* Results */}
        <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary p-4 sm:p-6 rounded-2xl border border-ui-borderSubtle flex flex-col justify-center relative overflow-hidden">
           <Calculator className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-accent-700/5 pointer-events-none" />
           <div className="relative z-10 text-center">
             <h4 className="text-sm font-bold tabular-nums tracking-tight text-txt-tertiary uppercase tracking-widest mb-2">Factor of Safety (FOS)</h4>
             <div className="text-7xl font-bold tabular-nums tracking-tight tracking-tighter mb-4 text-txt-primary">
                {results ? results.fos : "---"}
             </div>
             
             {results && (
               <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold bg-surface-default  shadow-brand-sm ${results.color}`}>
                 {results.status}
               </div>
             )}
             
             {results && parseFloat(results.fos) < 1.5 && (
               <div className="mt-8 bg-accent-50 border border-accent-200 text-accent-800 p-4 rounded-2xl text-sm font-medium text-left flex gap-3 overflow-hidden">
                 <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                 <p>
                   A minimum FOS of 1.5 is typically required for permanent slopes under static loads. Consider flattening the slope, reducing height, or adding soil reinforcement.
                 </p>
               </div>
             )}
           </div>
        </div>
      </div>
    
      <CalculationHistory calculatorId="slopestability_tool" currentInputs={{ cohesion, frictionAngle, unitWeight, slopeHeight, slopeAngle, slipDepth, porePressureRatio }} currentResults={results ? { fos: results.fos, status: results.status } : {}} onRestore={(ins) => {
        if (ins.cohesion != null) setCohesion(ins.cohesion as typeof cohesion);
        if (ins.frictionAngle != null) setFrictionAngle(ins.frictionAngle as typeof frictionAngle);
        if (ins.unitWeight != null) setUnitWeight(ins.unitWeight as typeof unitWeight);
        if (ins.slopeHeight != null) setSlopeHeight(ins.slopeHeight as typeof slopeHeight);
        if (ins.slopeAngle != null) setSlopeAngle(ins.slopeAngle as typeof slopeAngle);
        if (ins.slipDepth != null) setSlipDepth(ins.slipDepth as typeof slipDepth);
        if (ins.porePressureRatio != null) setPorePressureRatio(ins.porePressureRatio as typeof porePressureRatio);
      }} />
</div>
  );
}
