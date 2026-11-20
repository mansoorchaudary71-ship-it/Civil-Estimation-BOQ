import { Button } from '../ui/Button';
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
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from "../../lib/useRates";
import { formatRate } from "../../lib/rates";
import { designRetainingWall } from "../../lib/retainingWallCalc";
import { CalcSteps, EngineNotices, StructuralExportBar } from "../ui/StructuralExportBar";


function InputGroup({ label, children, colSpan = 1 }: { label: React.ReactNode; children: React.ReactNode, colSpan?: number }) {
  return (
    <div className={`flex flex-col gap-2 ${colSpan > 1 ? `md:col-span-${colSpan}` : ''}`}>
      <label className="text-sm font-bold text-txt-secondary dark:text-txt-tertiary">{label}</label>
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
  const [baseW, setBaseW] = useState("3.0"); // Base width
  const [baseD, setBaseD] = useState("0.4"); // Base thickness
  
  const [stemWTop, setStemWTop] = useState("0.2"); // Stem width top
  const [stemWBot, setStemWBot] = useState("0.4"); // Stem width bottom
  const [toeProj, setToeProj] = useState("0.9"); // Toe projection

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
  const [fck, setFck] = useState("25");
  const [fy, setFy] = useState("500");
  const [cover, setCover] = useState("40");
  const [passive, setPassive] = useState(false);
  const [passiveDepth, setPassiveDepth] = useState("1.0");
  const [shearKey, setShearKey] = useState(false);
  const [shearKeyDepth, setShearKeyDepth] = useState("0.5");
  const [backfillSlope, setBackfillSlope] = useState("0");
  const [seismicKh, setSeismicKh] = useState("0");
  const [wastage, setWastage] = useState("5");
  
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

  const { rates, setRate, table } = useRates();
  // Engine design (IS 456) — stability + stem/base flexural steel + cost.
  const design = designRetainingWall({
    stemHeightM: h, wallLengthM: l, baseWidthM: b, baseDepthM: bd,
    stemTopM: st, stemBottomM: sb, toeM: tp,
    gammaKNm3: parseFloat(soilDens) || 0, phiDeg: parseFloat(phiAngle) || 0,
    surchargeKNm2: parseFloat(surcharge) || 0, mu: parseFloat(frictionCoeff) || 0,
    sbcKNm2: max_sbc, fck: parseFloat(fck) || 25, fy: parseFloat(fy) || 500,
    coverMm: parseFloat(cover) || 40,
    vertDiaMm: parseFloat(vertDia) || 0, vertSpacingMm: parseFloat(vertSpace) || 0,
    horizDiaMm: parseFloat(horizDia) || 0, horizSpacingMm: parseFloat(horizSpace) || 0,
    mix: mixRatios[mix] ?? { c: 1, s: 1.5, a: 3 },
    passivePressure: passive, passiveDepthM: parseFloat(passiveDepth) || 0,
    shearKey, shearKeyDepthM: parseFloat(shearKeyDepth) || 0,
    backfillSlopeDeg: parseFloat(backfillSlope) || 0,
    seismicKh: parseFloat(seismicKh) || 0,
    wastagePct: parseFloat(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  });

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
  
  const stemSteelKg = vWeight + hWeight;
  const totalSteel = design.totalSteelKg; // Engine: stem + base steel, both designed.

  const sendToBOQ = () => {
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Cement for retaining wall (${mix})`,
        unit: "bags",
        quantity: design.materials.cementBags,
        rate: rates.cementPerBag ?? 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Sand for retaining wall concrete`,
        unit: "cft",
        quantity: design.materials.sandCft,
        rate: rates.sandPerCft ?? 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Aggregate for retaining wall concrete`,
        unit: "cft",
        quantity: design.materials.aggCft,
        rate: rates.crushPerCft ?? 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement for Retaining Wall (stem ${design.stemSteelKg.toFixed(0)} kg + base ${design.baseSteelKg.toFixed(0)} kg)`,
        unit: "kg",
        quantity: totalSteel,
        rate: rates.steelPerKg ?? 0
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
            <Button onClick={sendToBOQ} className="text-xs font-bold px-4 py-2.5 bg-ui-success text-ui-successText rounded-full hover:bg-ui-success transition-colors border border-ui-successBorder active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
              Send to BOQ
            </Button>
          </div>
        </div>
      )}
      
      {/* Structural Layout Wrapper - Reusable across tools */}
      <p className="text-sm text-txt-secondary leading-relaxed max-w-4xl">
        Cantilever retaining wall to IS 456:2000 — Rankine active pressure Ka = (1 − sin φ)/(1 + sin φ),
        sliding FS ≥ 1.5, overturning FS ≥ 2.0, bearing within the middle third. The old defaults
        (base 2.5 m, toe 0.7 m) failed sliding at FS 1.49 with no remedy; the defaults are now base
        3.0 m and toe 0.9 m, and the tool solves for the minimum base width that passes sliding.
        Stem and base steel are both designed — the base is no longer "added later".
      </p>
      <EngineNotices errors={design.errors} warnings={design.warnings} />
      <ToolLayout>
        {/* Left Column - Inputs */}
        <ToolLayoutInputs>
          {/* Dimensions Section */}
          <ToolSection title="Wall Dimensions" number={1} color="blue">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <InputGroup label="Wall Height (m)">
                <><label htmlFor="a11y-input-420" className="sr-only">Input</label>
<input id="a11y-input-420" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={wallH} onChange={(e) => setWallH(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Wall Length (m)">
                <><label htmlFor="a11y-input-421" className="sr-only">Input</label>
<input id="a11y-input-421" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={wallL} onChange={(e) => setWallL(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Base Width (m)">
                <><label htmlFor="a11y-input-422" className="sr-only">Input</label>
<input id="a11y-input-422" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={baseW} onChange={(e) => setBaseW(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Base Thk (m)">
                <><label htmlFor="a11y-input-423" className="sr-only">Input</label>
<input id="a11y-input-423" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={baseD} onChange={(e) => setBaseD(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Stem Top (m)">
                <><label htmlFor="a11y-input-424" className="sr-only">Input</label>
<input id="a11y-input-424" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={stemWTop} onChange={(e) => setStemWTop(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Stem Bot (m)">
                <><label htmlFor="a11y-input-425" className="sr-only">Input</label>
<input id="a11y-input-425" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={stemWBot} onChange={(e) => setStemWBot(e.target.value)} /></>
              </InputGroup>
              <InputGroup label="Toe Proj (m)">
                <><label htmlFor="a11y-input-426" className="sr-only">Input</label>
<input id="a11y-input-426" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={toeProj} onChange={(e) => setToeProj(e.target.value)} /></>
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
<input id="a11y-input-427" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={soilDens} onChange={(e) => setSoilDens(e.target.value)} /></>
              </InputGroup>
              <InputGroup label={
                <span className="flex items-center">
                  Friction Angle (deg)
                  <FieldTooltip content="Angle of internal friction of soil (Φ). Typical values: Clay = 0-20°, Silt = 26-30°, Sand = 30-40°, Gravel = 35-45°" />
                </span>
              }>
                <><label htmlFor="a11y-input-428" className="sr-only">Input</label>
<input id="a11y-input-428" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={phiAngle} onChange={(e) => setPhiAngle(e.target.value)} /></>
              </InputGroup>
              <InputGroup label={<span className="flex items-center gap-1">Base Friction (μ) <CodeTooltip standard="IS" code="1904:1986" description="Coefficient of friction for sliding resistance of foundations." /></span>}>
                <><label htmlFor="a11y-input-429" className="sr-only">Input</label>
<input id="a11y-input-429" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={frictionCoeff} onChange={(e) => setFrictionCoeff(e.target.value)} step="0.1" /></>
              </InputGroup>
              <InputGroup label={<span className="flex items-center gap-1">Surcharge (kN/m²) <CodeTooltip standard="IS" code="875 (Part 2)" description="Imposed loads for residential and commercial buildings." /></span>}>
                <><label htmlFor="a11y-input-430" className="sr-only">Input</label>
<input id="a11y-input-430" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={surcharge} onChange={(e) => setSurcharge(e.target.value)} /></>
              </InputGroup>
              <InputGroup label={<span className="flex items-center gap-1">Safe Bearing (kN/m²) <CodeTooltip standard="IS" code="1904:1986" description="Design and construction of foundations in soils: General requirements." /></span>}>
                <><label htmlFor="a11y-input-431" className="sr-only">Input</label>
<input id="a11y-input-431" type="number" inputMode="decimal" className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-full px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50" value={sbc} onChange={(e) => setSbc(e.target.value)} /></>
              </InputGroup>
            </div>
          </ToolSection>
          
          {/* Materials Section */}
          <ToolSection title="Materials" number={3} color="violet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label={<span className="flex items-center gap-1">Concrete Mix <CodeTooltip standard="IS" code="456:2000" description="Nominal mix proportions and minimum grade of concrete (Table 5)." /></span>}>
                <select className="w-full bg-surface-default dark:bg-ink border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm text-txt-primary dark:text-txt-primary rounded-2xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-accent-500 focus:outline-none" value={mix} onChange={(e) => setMix(e.target.value)}>
                  {Object.keys(mixRatios).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </InputGroup>
            </div>
          </ToolSection>

          {/* Stability Options Section */}
          <ToolSection title="Stability Options & Design" number={4} color="amber">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              <InputGroup label="Concrete grade (fck) — MPa">
                <select className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle px-4 py-3" value={fck} onChange={(e) => setFck(e.target.value)}>
                  {[20, 25, 30, 35, 40].map((g) => (<option key={g} value={g}>M{g}</option>))}
                </select>
              </InputGroup>
              <InputGroup label="Steel grade (fy) — MPa">
                <select className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle px-4 py-3" value={fy} onChange={(e) => setFy(e.target.value)}>
                  {[250, 415, 500].map((g) => (<option key={g} value={g}>Fe{g}</option>))}
                </select>
              </InputGroup>
              <InputGroup label="Clear cover (mm)">
                <input type="number" inputMode="decimal" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={cover} onChange={(e) => setCover(e.target.value)} />
              </InputGroup>
              <InputGroup label="Backfill slope (deg)">
                <input type="number" inputMode="decimal" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={backfillSlope} onChange={(e) => setBackfillSlope(e.target.value)} />
              </InputGroup>
              <InputGroup label="Seismic kh (IS 1893)">
                <input type="number" inputMode="decimal" step="0.01" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={seismicKh} onChange={(e) => setSeismicKh(e.target.value)} />
              </InputGroup>
              <InputGroup label="Wastage (%)">
                <input type="number" inputMode="decimal" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={wastage} onChange={(e) => setWastage(e.target.value)} />
              </InputGroup>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={passive} onChange={(e) => setPassive(e.target.checked)} className="w-5 h-5 rounded border-ui-borderDefault text-accent-800 focus:ring-accent-500" />
                Include passive pressure in front of toe
              </label>
              {passive && (
                <InputGroup label="Passive depth (m)">
                  <input type="number" inputMode="decimal" step="0.1" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={passiveDepth} onChange={(e) => setPassiveDepth(e.target.value)} />
                </InputGroup>
              )}
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={shearKey} onChange={(e) => setShearKey(e.target.checked)} className="w-5 h-5 rounded border-ui-borderDefault text-accent-800 focus:ring-accent-500" />
                Add shear key under base
              </label>
              {shearKey && (
                <InputGroup label="Shear key depth (m)">
                  <input type="number" inputMode="decimal" step="0.1" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={shearKeyDepth} onChange={(e) => setShearKeyDepth(e.target.value)} />
                </InputGroup>
              )}
              <InputGroup label={`Cement (${table.currency}/bag)`}>
                <input type="number" inputMode="decimal" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={rates.cementPerBag ?? ""} onChange={(e) => setRate("cementPerBag", e.target.value === "" ? null : Number(e.target.value))} />
              </InputGroup>
              <InputGroup label={`Steel (${table.currency}/kg)`}>
                <input type="number" inputMode="decimal" className="w-full bg-surface-default rounded-full border border-ui-borderSubtle px-4 py-3" value={rates.steelPerKg ?? ""} onChange={(e) => setRate("steelPerKg", e.target.value === "" ? null : Number(e.target.value))} />
              </InputGroup>
            </div>
            {design.suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                {design.suggestions.map((sg, i) => (
                  <p key={i} className="text-sm text-txt-secondary bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 py-2">{sg}</p>
                ))}
                <p className="text-sm text-txt-secondary">Minimum base width for FS_slide ≥ 1.5: <strong>{design.minBaseWidthM.toFixed(2)} m</strong> (current {b.toFixed(2)} m).</p>
                <Button onClick={() => setBaseW(design.minBaseWidthM.toFixed(2))} className="text-sm font-medium px-4 py-2 bg-ink text-white rounded-full hover:opacity-90">Apply minimum base width</Button>
              </div>
            )}
          </ToolSection>

        </ToolLayoutInputs>

        {/* Right Column - Results & Visuals */}
        <ToolLayoutResults>
          
          {/* Visual Profile */}
            <div className="bg-surface-default/40 border border-border-color rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px] shadow-inner relative overflow-hidden">
              <h4 className="font-bold text-txt-tertiary dark:text-txt-tertiary uppercase tracking-wider text-xs mb-4 w-full text-center">Cross-Section Profile</h4>
              
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
                  <rect x={0} y={0} width={b*40} height={bd*40} fill="#E7E4DE" stroke="#6B6862" strokeWidth="2" />
                  <polygon points={`${tp*40},0 ${(tp + sb - st)*40},${-h*40} ${(tp + sb)*40},${-h*40} ${(tp + sb)*40},0`} fill="#E7E4DE" stroke="#6B6862" strokeWidth="2" />
                  <line x1={-15} y1={0} x2={-15} y2={-h*40} stroke="#6B6862" strokeWidth="1" />
                  <line x1={-20} y1={0} x2={-10} y2={0} stroke="#6B6862" strokeWidth="1" />
                  <line x1={-20} y1={-h*40} x2={-10} y2={-h*40} stroke="#6B6862" strokeWidth="1" />
                  <text x="-25" y={-h*20} fill="#6B6862" fontSize="12" textAnchor="end">H={h}m</text>
                  <line x1={0} y1={bd*40 + 15} x2={b*40} y2={bd*40 + 15} stroke="#6B6862" strokeWidth="1" />
                  <line x1={0} y1={bd*40 + 10} x2={0} y2={bd*40 + 20} stroke="#6B6862" strokeWidth="1" />
                  <line x1={b*40} y1={bd*40 + 10} x2={b*40} y2={bd*40 + 20} stroke="#6B6862" strokeWidth="1" />
                  <text x={b*20} y={bd*40 + 30} fill="#6B6862" fontSize="12" textAnchor="middle">B={b}m</text>
                </g>
              </svg>
            </div>

            {/* Stability Check */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border ${isSlidingSafe ? 'bg-ui-success border-ui-successBorder/60 dark:bg-ui-success/20 dark:border-ui-successBorder/20' : 'bg-ui-error border-ui-errorBorder/60 dark:bg-ui-error/20 dark:border-ui-errorBorder/20'}`}>
                <h4 className="font-bold text-xs text-txt-secondary dark:text-txt-tertiary mb-1 leading-tight uppercase">Sliding FS</h4>
                <p className={`text-xl font-bold tabular-nums tracking-tight ${isSlidingSafe ? 'text-ui-successText dark:text-ui-successText' : 'text-ui-errorText dark:text-ui-errorText'}`}>{FS_sliding.toFixed(2)}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isOverturnSafe ? 'bg-ui-success border-ui-successBorder/60 dark:bg-ui-success/20 dark:border-ui-successBorder/20' : 'bg-ui-error border-ui-errorBorder/60 dark:bg-ui-error/20 dark:border-ui-errorBorder/20'}`}>
                <h4 className="font-bold text-xs text-txt-secondary dark:text-txt-tertiary mb-1 leading-tight uppercase">Overturn FS</h4>
                <p className={`text-xl font-bold tabular-nums tracking-tight ${isOverturnSafe ? 'text-ui-successText dark:text-ui-successText' : 'text-ui-errorText dark:text-ui-errorText'}`}>{FS_overturn.toFixed(2)}</p>
              </div>
              <div className={`col-span-2 md:col-span-1 lg:col-span-2 p-4 rounded-2xl border ${isBearingSafe ? 'bg-ui-success border-ui-successBorder/60 dark:bg-ui-success/20 dark:border-ui-successBorder/20' : 'bg-ui-error border-ui-errorBorder/60 dark:bg-ui-error/20 dark:border-ui-errorBorder/20'}`}>
                <h4 className="font-bold text-xs text-txt-secondary dark:text-txt-tertiary mb-1 leading-tight uppercase">Bearing Pressure (Max / SBC)</h4>
                <p className={`text-xl font-bold tabular-nums tracking-tight ${isBearingSafe ? 'text-ui-successText dark:text-ui-successText' : 'text-ui-errorText dark:text-ui-errorText'}`}>{q_max.toFixed(1)} / {max_sbc}</p>
              </div>
            </div>
            
            {(!isSlidingSafe || !isOverturnSafe || !isBearingSafe) && (
              <div className="p-4 bg-ui-error dark:bg-ui-error/20 border border-ui-errorBorder dark:border-ui-errorBorder/50 text-ui-errorText dark:text-ui-errorBorder rounded-2xl text-sm font-semibold flex items-start gap-3 shadow-brand-sm">
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
                    <h4 className="font-bold text-txt-primary dark:text-txt-primary flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-accent-800" />
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
                    <h4 className="font-bold text-txt-primary dark:text-txt-primary flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                      <ArrowDownToLine className="w-4 h-4 text-ui-errorText" />
                      Steel — Stem + Base (Designed)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <InputGroup label={<span className="flex items-center gap-1">V. Dia/Spc <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                        <div className="flex gap-1">
                           <><label htmlFor="a11y-input-432" className="sr-only">Input</label>
<input id="a11y-input-432" type="number" inputMode="decimal" className="w-full bg-surface-default border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={vertDia} onChange={e => setVertDia(e.target.value)} /></>
                           <><label htmlFor="a11y-input-433" className="sr-only">Input</label>
<input id="a11y-input-433" type="number" inputMode="decimal" className="w-full bg-surface-default border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={vertSpace} onChange={e => setVertSpace(e.target.value)} /></>
                        </div>
                      </InputGroup>
                      <InputGroup label={<span className="flex items-center gap-1">H. Dia/Spc <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                        <div className="flex gap-1">
                           <><label htmlFor="a11y-input-434" className="sr-only">Input</label>
<input id="a11y-input-434" type="number" inputMode="decimal" className="w-full bg-surface-default border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={horizDia} onChange={e => setHorizDia(e.target.value)} /></>
                           <><label htmlFor="a11y-input-435" className="sr-only">Input</label>
<input id="a11y-input-435" type="number" inputMode="decimal" className="w-full bg-surface-default border-none rounded-full px-2 py-2 min-h-[40px] text-sm font-semibold" value={horizSpace} onChange={e => setHorizSpace(e.target.value)} /></>
                        </div>
                      </InputGroup>
                    </div>

                    <div className="bg-surface-hover border border-ui-borderSubtle rounded-2xl overflow-hidden shadow-brand-sm">
                      <div className="p-4 flex justify-between items-center border-b border-ui-borderSubtle">
                        <span className="font-bold text-txt-secondary">Stem Steel</span>
                        <span className="text-xl font-bold tabular-nums tracking-tight text-txt-primary">{stemSteelKg.toFixed(1)} kg</span>
                      </div>
                      <div className="p-4 flex justify-between items-center border-b border-ui-borderSubtle">
                        <span className="font-bold text-txt-secondary">Base Steel (designed)</span>
                        <span className="text-xl font-bold tabular-nums tracking-tight text-txt-primary">{design.baseSteelKg.toFixed(1)} kg</span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-bold text-txt-secondary">Total Steel</span>
                        <span className="text-xl font-bold tabular-nums tracking-tight text-txt-primary">{totalSteel.toFixed(1)} kg</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <ResultCard title="Stem Mu (factored)" value={design.stemMuKNmPerM.toFixed(1)} unit="kNm/m" variant="neutral" />
                      <ResultCard title="Stem Ast" value={design.stemAstMm2PerM.toFixed(0)} unit="mm²/m" variant={design.stemOk ? "neutral" : "warning"} />
                      <ResultCard title="Toe Mu / Ast" value={`${design.toeMuKNmPerM.toFixed(1)} / ${design.toeAstMm2PerM.toFixed(0)}`} unit="kNm/m · mm²/m" variant="neutral" />
                      <ResultCard title="Heel Mu / Ast" value={`${design.heelMuKNmPerM.toFixed(1)} / ${design.heelAstMm2PerM.toFixed(0)}`} unit="kNm/m · mm²/m" variant="neutral" />
                      <ResultCard title="Total cost" value={design.totalCost == null ? "—" : design.totalCost.toLocaleString("en-US")} unit={table.currency} variant="neutral" />
                      <ResultCard title="Ka / Kp" value={`${design.ka.toFixed(3)} / ${design.kp.toFixed(2)}`} unit="" variant="neutral" />
                    </div>
                    <div className="mt-3 space-y-1 text-sm">
                      {design.costLines.map((l) => (
                        <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </MaterialSummary>
            </div>
            <StructuralExportBar title="Retaining Wall (IS 456)" summaryText={`Retaining wall H=${h} m, L=${l} m, base ${b} m; FS sliding ${design.fsSliding.toFixed(2)} (≥1.5 ${design.slidingOk ? "PASS" : "FAIL"}), FS overturning ${design.fsOverturning.toFixed(2)} (≥2.0), qmax ${design.qMaxKPa.toFixed(1)} kPa; stem Ast ${design.stemAstMm2PerM.toFixed(0)} mm²/m; concrete ${totalConcrete.toFixed(2)} m³, steel ${totalSteel.toFixed(1)} kg (stem ${design.stemSteelKg.toFixed(0)} + base ${design.baseSteelKg.toFixed(0)}).`}
              boqItems={[
                { description: `Cement for retaining wall (${mix})`, quantity: design.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for retaining wall concrete", quantity: design.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for retaining wall concrete", quantity: design.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Steel reinforcement (stem + base)", quantity: totalSteel, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={design.totalCost} />
            <CalcSteps steps={design.steps} />

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