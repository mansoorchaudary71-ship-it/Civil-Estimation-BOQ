import React, { useState } from "react";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import {
  ShieldCheck,
  TrendingDown,
  Layers,
  ArrowDownToLine,
  Minimize,
  CheckCircle,
  AlertTriangle,
  MoveRight
} from "lucide-react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { FieldTooltip } from "../ui/FieldTooltip";

import { ToolLayout, ToolLayoutInputs, ToolLayoutResults, ToolSection } from "../ui/ToolLayout";

function InputGroup({ label, children, colSpan = 1 }: { label: React.ReactNode; children: React.ReactNode, colSpan?: number }) {
  return (
    <div className={`flex flex-col gap-2 ${colSpan > 1 ? `md:col-span-${colSpan}` : ''}`}>
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}

const mixRatios: Record<string, { c: number; s: number; a: number }> = {
  "M15 (1:2:4)": { c: 1, s: 2, a: 4 },
  "M20 (1:1.5:3)": { c: 1, s: 1.5, a: 3 },
  "M25 (1:1:2)": { c: 1, s: 1, a: 2 },
  "M30 (1:0.75:1.5)": { c: 1, s: 0.75, a: 1.5 }
};

export default function RetainingWallCalculator({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const { settings } = useSettings();
  
  // Dimensions
  const [wallH, setWallH] = useState("3.0"); // Height of stem
  const [wallL, setWallL] = useState("10.0"); // Length of wall
  const [baseW, setBaseW] = useState("2.5"); // Base width
  const [baseD, setBaseD] = useState("0.4"); // Base thickness
  
  const [stemWTop, setStemWTop] = useState("0.2"); // Stem width top
  const [stemWBot, setStemWBot] = useState("0.4"); // Stem width bottom
  const [toeProj, setToeProj] = useState("0.7"); // Toe projection

  // Soil Properties
  const [soilDens, setSoilDens] = useState("18"); // gamma kN/m3
  const [phiAngle, setPhiAngle] = useState("30"); // Internal friction angle (deg)
  const [surcharge, setSurcharge] = useState("10"); // Surcharge load kN/m2
  const [frictionCoeff, setFrictionCoeff] = useState("0.5"); // Base friction (mu)
  const [sbc, setSbc] = useState("200"); // kN/m2
  
  // Materials
  const [mix, setMix] = useState("M20 (1:1.5:3)");
  
  // Rebar
  const [vertDia, setVertDia] = useState("16");
  const [vertSpace, setVertSpace] = useState("150");
  const [horizDia, setHorizDia] = useState("10");
  const [horizSpace, setHorizSpace] = useState("200");
  
  const h = parseFloat(wallH) || 0;
  const l = parseFloat(wallL) || 0;
  const b = parseFloat(baseW) || 0;
  const bd = parseFloat(baseD) || 0;
  const st = parseFloat(stemWTop) || 0;
  const sb = parseFloat(stemWBot) || 0;
  const tp = parseFloat(toeProj) || 0;
  
  const gamma = parseFloat(soilDens) || 0;
  const phi = parseFloat(phiAngle) || 0;
  const q = parseFloat(surcharge) || 0;
  const mu = parseFloat(frictionCoeff) || 0;
  
  const heelProj = b - tp - sb; 
  
  // Stability Check
  const totalH = h + bd;
  const phiRad = (phi * Math.PI) / 180;
  const Ka = (1 - Math.sin(phiRad)) / (1 + Math.sin(phiRad));
  
  // Forces per meter run
  const Pa_soil = 0.5 * Ka * gamma * Math.pow(totalH, 2);
  const Pa_sur = Ka * q * totalH;
  const F_driving = Pa_soil + Pa_sur;
  
  const M_overturning = (Pa_soil * (totalH / 3)) + (Pa_sur * (totalH / 2));
  
  // Weights (kN/m run)
  const W_stem_rect = st * h * 25; // concrete = 25
  const W_stem_tri = 0.5 * (sb - st) * h * 25;
  const W_base = b * bd * 25;
  const W_soil = heelProj * h * gamma;
  const W_sur = heelProj * q;
  
  const sumW = W_stem_rect + W_stem_tri + W_base + W_soil + W_sur;
  const F_resisting = sumW * mu;
  
  // Lever arms from toe
  const x_stem_rect = tp + sb - (st / 2);
  const x_stem_tri = tp + (2/3)*(sb - st);
  const x_base = b / 2;
  const x_soil = b - (heelProj / 2);
  const x_sur = b - (heelProj / 2);
  
  const M_resisting = (W_stem_rect * x_stem_rect) + 
                      (W_stem_tri * x_stem_tri) + 
                      (W_base * x_base) + 
                      (W_soil * x_soil) + 
                      (W_sur * x_sur);
                      
  const FS_sliding = F_driving > 0 ? F_resisting / F_driving : 0;
  const FS_overturn = M_overturning > 0 ? M_resisting / M_overturning : 0;
  
  // Bearing Pressure
  const x_bar = sumW > 0 ? (M_resisting - M_overturning) / sumW : 0;
  const e = Math.abs((b / 2) - x_bar);
  const q_max = sumW > 0 ? (sumW / b) * (1 + (6 * e) / b) : 0;
  const q_min = sumW > 0 ? (sumW / b) * (1 - (6 * e) / b) : 0;
  const max_sbc = parseFloat(sbc) || 0;
  
  const isSlidingSafe = FS_sliding >= 1.5;
  const isOverturnSafe = FS_overturn >= 2.0;
  const isBearingSafe = q_max <= max_sbc && q_min >= 0 && e <= b / 6;

  // Concrete BOQ
  const stemVol = (0.5 * (st + sb) * h) * l;
  const baseVol = (b * bd) * l;
  const totalConcrete = stemVol + baseVol;
  const dryVol = totalConcrete * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
  
  const ratio = mixRatios[mix];
  const totalRatio = ratio ? (ratio.c + ratio.s + ratio.a) : 1;
  const cementM3 = (dryVol * ratio.c) / totalRatio;
  const cementBags = Math.ceil(cementM3 / CIVIL_CONSTANTS.CEMENT_BAG_VOLUME_M3);
  const sandCft = ((dryVol * ratio.s) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;
  const aggCft = ((dryVol * ratio.a) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;

  // Steel BOQ
  // Verticals in stem
  const vD = parseFloat(vertDia) || 0;
  const vS = parseFloat(vertSpace) || 0;
  const vBars = vS > 0 ? Math.ceil((l * 1000) / vS) + 1 : 0;
  const vLen = h + bd + 0.3; // embedded in base + Ld approx
  const vWeight = (Math.pow(vD, 2) / 162.28) * vLen * vBars * 2; // Assuming two faces

  // Horizontals in stem
  const hD = parseFloat(horizDia) || 0;
  const hS = parseFloat(horizSpace) || 0;
  const hBars = hS > 0 ? Math.ceil((h * 1000) / hS) + 1 : 0;
  const hLen = l;
  const hWeight = (Math.pow(hD, 2) / 162.28) * hLen * hBars * 2; 
  
  const totalSteel = vWeight + hWeight; // Rough approx for stem only. Base added later.

  const sendToBOQ = () => {
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `RCC Retaining Wall (Length: ${wallL}m, Height: ${wallH}m)`,
        unit: "m³",
        quantity: totalConcrete,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement for Retaining Wall`,
        unit: "kg",
        quantity: totalSteel,
        rate: 0
      },
    ];
    window.dispatchEvent(new CustomEvent('fill-boq', { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  return (
    <div className={isEmbedded ? "w-full space-y-6" : "w-full space-y-6"}>
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1"></div>
          <div className="flex flex-col items-end gap-2">
            <GlobalSettingsToggle align="left" showCurrency={false} />
            <button onClick={sendToBOQ} className="text-xs font-bold px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              Send to BOQ
            </button>
          </div>
        </div>
      )}
      
      {/* Structural Layout Wrapper - Reusable across tools */}
      <ToolLayout>
        {/* Left Column - Inputs */}
        <ToolLayoutInputs>
          {/* Dimensions Section */}
          <ToolSection title="Wall Dimensions" number={1} color="blue">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InputGroup label="Wall Height (m)">
                <><label htmlFor="a11y-input-420" className="sr-only">Input</label>
<input id="a11y-input-420" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={wallH} onChange={(e) => setWallH(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Wall Length (m)">
                <><label htmlFor="a11y-input-421" className="sr-only">Input</label>
<input id="a11y-input-421" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={wallL} onChange={(e) => setWallL(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Base Width (m)">
                <><label htmlFor="a11y-input-422" className="sr-only">Input</label>
<input id="a11y-input-422" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={baseW} onChange={(e) => setBaseW(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Base Thk (m)">
                <><label htmlFor="a11y-input-423" className="sr-only">Input</label>
<input id="a11y-input-423" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={baseD} onChange={(e) => setBaseD(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Stem Top (m)">
                <><label htmlFor="a11y-input-424" className="sr-only">Input</label>
<input id="a11y-input-424" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={stemWTop} onChange={(e) => setStemWTop(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Stem Bot (m)">
                <><label htmlFor="a11y-input-425" className="sr-only">Input</label>
<input id="a11y-input-425" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={stemWBot} onChange={(e) => setStemWBot(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Toe Proj (m)">
                <><label htmlFor="a11y-input-426" className="sr-only">Input</label>
<input id="a11y-input-426" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50" value={toeProj} onChange={(e) => setToeProj(e.target.value)} /></>
              </InputGroup>
            </div>
          </ToolSection>

          {/* Soil & Loads Section */}
          <ToolSection title="Soil & Loads" number={2} color="indigo">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              <InputGroup label={
                <span className="flex items-center">
                  Soil Density (kN/m³)
                  <FieldTooltip content="Unit weight of retained soil. Typical values: Loose soil = 14-16, Compacted soil = 18-20, Gravel/Rock = 20-22" />
                </span>
              }>
                <><label htmlFor="a11y-input-427" className="sr-only">Input</label>
<input id="a11y-input-427" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" value={soilDens} onChange={(e) => setSoilDens(e.target.value)} /></>
              </InputGroup>
              <InputGroup label={
                <span className="flex items-center">
                  Friction Angle (deg)
                  <FieldTooltip content="Angle of internal friction of soil (Φ). Typical values: Clay = 0-20°, Silt = 26-30°, Sand = 30-40°, Gravel = 35-45°" />
                </span>
              }>
                <><label htmlFor="a11y-input-428" className="sr-only">Input</label>
<input id="a11y-input-428" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" value={phiAngle} onChange={(e) => setPhiAngle(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Base Friction (μ)">
                <><label htmlFor="a11y-input-429" className="sr-only">Input</label>
<input id="a11y-input-429" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" value={frictionCoeff} onChange={(e) => setFrictionCoeff(e.target.value)} step="0.1" /></>
              </InputGroup>
              <InputGroup label="Surcharge (kN/m²)">
                <><label htmlFor="a11y-input-430" className="sr-only">Input</label>
<input id="a11y-input-430" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" value={surcharge} onChange={(e) => setSurcharge(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Safe Bearing (kN/m²)">
                <><label htmlFor="a11y-input-431" className="sr-only">Input</label>
<input id="a11y-input-431" type="number" inputMode="decimal" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" value={sbc} onChange={(e) => setSbc(e.target.value)} /></>
              </InputGroup>
            </div>
          </ToolSection>
          
          {/* Materials Section */}
          <ToolSection title="Materials" number={3} color="violet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Concrete Mix">
                <select className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm text-slate-800 dark:text-slate-200 rounded-[16px] px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-violet-500/50" value={mix} onChange={(e) => setMix(e.target.value)}>
                  {Object.keys(mixRatios).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </InputGroup>
            </div>
          </ToolSection>

        </ToolLayoutInputs>

        {/* Right Column - Results & Visuals */}
        <ToolLayoutResults>
          
          {/* Visual Profile */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-[24px] p-5 flex flex-col items-center justify-center min-h-[300px] shadow-inner relative overflow-hidden">
              <h4 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs mb-4 w-full text-center">Cross-Section Profile</h4>
              
              <svg width="100%" height="280" viewBox="-50 -50 400 350" className="max-w-full overflow-visible">
                <defs>
                  <pattern id="soil" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="#d2b48c" opacity="0.6" />
                    <circle cx="7" cy="8" r="1.0" fill="#d2b48c" opacity="0.6" />
                  </pattern>
                </defs>
                <g transform="translate(0, 50)">
                  <rect x={tp*40 + sb*40} y={-h*40} width={heelProj*40 + 50} height={h*40} fill="url(#soil)" />
                  <line x1={tp*40 + sb*40} y1={-h*40} x2={350} y2={-h*40} stroke="#8b5a2b" strokeWidth="2" />
                   <rect x={-30} y={-20} width={tp*40 + 30} height={20} fill="url(#soil)" />
                   <line x1={-30} y1={-20} x2={tp*40} y2={-20} stroke="#8b5a2b" strokeWidth="2" />
                  <rect x={0} y={0} width={b*40} height={bd*40} fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                  <polygon points={`${tp*40},0 ${(tp + sb - st)*40},${-h*40} ${(tp + sb)*40},${-h*40} ${(tp + sb)*40},0`} fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
                  <line x1={-15} y1={0} x2={-15} y2={-h*40} stroke="#64748b" strokeWidth="1" />
                  <line x1={-20} y1={0} x2={-10} y2={0} stroke="#64748b" strokeWidth="1" />
                  <line x1={-20} y1={-h*40} x2={-10} y2={-h*40} stroke="#64748b" strokeWidth="1" />
                  <text x="-25" y={-h*20} fill="#64748b" fontSize="12" textAnchor="end">H={h}m</text>
                  <line x1={0} y1={bd*40 + 15} x2={b*40} y2={bd*40 + 15} stroke="#64748b" strokeWidth="1" />
                  <line x1={0} y1={bd*40 + 10} x2={0} y2={bd*40 + 20} stroke="#64748b" strokeWidth="1" />
                  <line x1={b*40} y1={bd*40 + 10} x2={b*40} y2={bd*40 + 20} stroke="#64748b" strokeWidth="1" />
                  <text x={b*20} y={bd*40 + 30} fill="#64748b" fontSize="12" textAnchor="middle">B={b}m</text>
                </g>
              </svg>
            </div>

            {/* Stability Check */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
              <div className={`p-4 rounded-[20px] border ${isSlidingSafe ? 'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-900/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-200/60 dark:bg-rose-900/10 dark:border-rose-500/20'}`}>
                <h4 className="font-bold text-xs text-slate-600 dark:text-slate-400 mb-1 leading-tight uppercase">Sliding FS</h4>
                <p className={`text-xl font-bold tabular-nums tracking-tight ${isSlidingSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{FS_sliding.toFixed(2)}</p>
              </div>
              <div className={`p-4 rounded-[20px] border ${isOverturnSafe ? 'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-900/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-200/60 dark:bg-rose-900/10 dark:border-rose-500/20'}`}>
                <h4 className="font-bold text-xs text-slate-600 dark:text-slate-400 mb-1 leading-tight uppercase">Overturn FS</h4>
                <p className={`text-xl font-bold tabular-nums tracking-tight ${isOverturnSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{FS_overturn.toFixed(2)}</p>
              </div>
              <div className={`col-span-2 md:col-span-1 lg:col-span-2 p-4 rounded-[20px] border ${isBearingSafe ? 'bg-emerald-50 border-emerald-200/60 dark:bg-emerald-900/10 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-200/60 dark:bg-rose-900/10 dark:border-rose-500/20'}`}>
                <h4 className="font-bold text-xs text-slate-600 dark:text-slate-400 mb-1 leading-tight uppercase">Bearing Pressure (Max / SBC)</h4>
                <p className={`text-xl font-bold tabular-nums tracking-tight ${isBearingSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{q_max.toFixed(1)} / {max_sbc}</p>
              </div>
            </div>
            
            {(!isSlidingSafe || !isOverturnSafe || !isBearingSafe) && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 rounded-[20px] text-sm font-semibold flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {!isSlidingSafe && <p>Sliding FS ({FS_sliding.toFixed(2)}) &lt; 1.5</p>}
                  {!isOverturnSafe && <p>Overturning FS ({FS_overturn.toFixed(2)}) &lt; 2.0</p>}
                  {!isBearingSafe && (
                    <p>
                      {e > b / 6 ? `Resultant outside middle third. ` : ''}
                      {q_max > max_sbc ? `Max Pressure exceeds SBC. ` : ''}
                      {q_min < 0 ? `Tension exists under base.` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Results */}
            <div className="flex-1 min-h-[300px] mt-4 flex flex-col">
              <MaterialSummary
                title="Material Quantities"
                totalLabel="Total Concrete"
                totalValue={totalConcrete.toFixed(2)}
                totalUnit="m³"
              >
                <div className="grid grid-cols-1 gap-6 mt-5">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Concrete Breakdown
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard title="Stem Volume" value={stemVol.toFixed(2)} unit="m³" variant="neutral" />
                      <ResultCard title="Base Volume" value={baseVol.toFixed(2)} unit="m³" variant="neutral" />
                      <ResultCard title="Cement Bags" value={cementBags} unit="bags" variant="primary" />
                      <ResultCard title="Sand/Agg" value={`${sandCft.toFixed(0)} / ${aggCft.toFixed(0)}`} unit="cft" variant="neutral" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                      <ArrowDownToLine className="w-4 h-4 text-rose-500" />
                      Steel (Stem Only)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <InputGroup label="V. Dia/Spc">
                        <div className="flex gap-1">
                           <><label htmlFor="a11y-input-432" className="sr-only">Input</label>
<input id="a11y-input-432" type="number" inputMode="decimal" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={vertDia} onChange={e => setVertDia(e.target.value)} /></>
                           <><label htmlFor="a11y-input-433" className="sr-only">Input</label>
<input id="a11y-input-433" type="number" inputMode="decimal" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={vertSpace} onChange={e => setVertSpace(e.target.value)} /></>
                        </div>
                      </InputGroup>
                      <InputGroup label="H. Dia/Spc">
                        <div className="flex gap-1">
                           <><label htmlFor="a11y-input-434" className="sr-only">Input</label>
<input id="a11y-input-434" type="number" inputMode="decimal" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={horizDia} onChange={e => setHorizDia(e.target.value)} /></>
                           <><label htmlFor="a11y-input-435" className="sr-only">Input</label>
<input id="a11y-input-435" type="number" inputMode="decimal" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={horizSpace} onChange={e => setHorizSpace(e.target.value)} /></>
                        </div>
                      </InputGroup>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-[16px] overflow-hidden shadow-sm">
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Stem Steel Weight</span>
                        <span className="text-xl font-bold tabular-nums tracking-tight text-rose-600 dark:text-rose-400">{totalSteel.toFixed(1)} kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </MaterialSummary>
            </div>
            
        </ToolLayoutResults>
      </ToolLayout>
      
      <CalculationHistory
        calculatorId="retaining_wall"
        estimationName="Retaining Wall Estimate"
        currentInputs={{ wallH, wallL, baseW, baseD }}
        currentResults={{ concreteVol: totalConcrete.toFixed(2), steelKg: totalSteel.toFixed(1) }}
        summaryGeneration={(inputs, res) => `Concrete: ${res.concreteVol}m³ - Steel: ${res.steelKg}kg`}
        onRestore={(savedInputs) => {
          if (savedInputs.wallH) setWallH(savedInputs.wallH);
          if (savedInputs.wallL) setWallL(savedInputs.wallL);
          if (savedInputs.baseW) setBaseW(savedInputs.baseW);
          if (savedInputs.baseD) setBaseD(savedInputs.baseD);
        }}
      />
    </div>
  );
}