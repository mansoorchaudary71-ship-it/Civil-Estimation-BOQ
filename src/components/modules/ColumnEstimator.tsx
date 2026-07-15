import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import {
  Columns,
  CircleDashed,
  Square,
  Layers,
  Droplets,
  Settings2,
  CopySlash,
  AlertTriangle,
  ArrowUp
} from "lucide-react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { FieldTooltip } from "../ui/FieldTooltip";

const mixRatios: Record<string, { c: number; s: number; a: number }> = {
  "M10 (1:3:6)": { c: 1, s: 3, a: 6 },
  "M15 (1:2:4)": { c: 1, s: 2, a: 4 },
  "M20 (1:1.5:3)": { c: 1, s: 1.5, a: 3 },
  "M25 (1:1:2)": { c: 1, s: 1, a: 2 },
};

function InputGroup({ label, children, info }: { label: React.ReactNode; children: React.ReactNode; info?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 relative group">
      <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1 block">
        {label}
        {info && (
          <span className="text-sm text-slate-600 font-normal uppercase tracking-wider">{info}</span>
        )}
      </label>
      {children}
    </div>
  );
}

function CircularColumnInputs({
  diameter,
  setDiameter,
}: {
  diameter: string;
  setDiameter: (val: string) => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
        Diameter (m)
      </label>
      <><label htmlFor="a11y-input-184" className="sr-only">e.g. 0.4</label>
<input id="a11y-input-184" type="number" inputMode="decimal"
        className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 transition-all shadow-sm min-h-[44px] text-base font-normal overflow-hidden"
        value={diameter}
        onChange={(e) => setDiameter(e.target.value)}
        placeholder="e.g. 0.4"
      /></>
    </div>
  );
}
function RectangularColumnInputs({
  length,
  width,
  setLength,
  setWidth,
  isSquare,
}: {
  length: string;
  width: string;
  setLength: (val: string) => void;
  setWidth: (val: string) => void;
  isSquare: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div>
        <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
          {isSquare ? "Side Length (m)" : "Length (m)"}
        </label>
        <><label htmlFor="a11y-input-185" className="sr-only">e.g. 0.3</label>
<input id="a11y-input-185" type="number" inputMode="decimal"
          className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 transition-all shadow-sm min-h-[44px] text-base font-normal overflow-hidden"
          value={length}
          onChange={(e) => {
            setLength(e.target.value);
            if (isSquare) setWidth(e.target.value);
          }}
          placeholder="e.g. 0.3"
        /></>
      </div>
      {!isSquare && (
        <div>
          <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
            Width (m)
          </label>
          <><label htmlFor="a11y-input-186" className="sr-only">e.g. 0.3</label>
<input id="a11y-input-186" type="number" inputMode="decimal"
            className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 transition-all shadow-sm min-h-[44px] text-base font-normal overflow-hidden"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g. 0.3"
          /></>
        </div>
      )}
    </div>
  );
}
export default function ColumnEstimator() {
  const { settings } = useSettings();
  const [shape, setShape] = useState<"rectangular" | "square" | "circular">("rectangular");
  const [isPrecast, setIsPrecast] = useState(false);
  
  const [length, setLength] = useState("0.4");
  const [width, setWidth] = useState("0.6");
  const [diameter, setDiameter] = useState("0.4");
  const [height, setHeight] = useState("3.0");
  const [count, setCount] = useState("1");
  const [mix, setMix] = useState("M20 (1:1.5:3)");

  const [concreteDensity, setConcreteDensity] = useState("2400");
  const [riggingRadius, setRiggingRadius] = useState("5");

  // Reinforcement States
  const [mainBarsCount, setMainBarsCount] = useState("8"); 
  const [mainDia, setMainDia] = useState("16");
  const [clearCover, setClearCover] = useState("40");
  const [tieDia, setTieDia] = useState("8");
  const [tieSpacing, setTieSpacing] = useState("150");
  const [variation8, setVariation8] = useState("1");
  const [variation10, setVariation10] = useState("1");

  const l = parseFloat(length) || 0;
  const w = shape === "square" ? l : parseFloat(width) || 0;
  const d = parseFloat(diameter) || 0;
  const h = parseFloat(height) || 0;
  const n = parseFloat(count) || 1;
  const c = parseFloat(clearCover) || 0;
  const dMain = parseFloat(mainDia) || 0;
  const dTie = parseFloat(tieDia) || 0;
  const sTie = parseFloat(tieSpacing) || 1;
  const numBars = parseInt(mainBarsCount) || 4;
  const density = parseFloat(concreteDensity) || 2400;
  const radius = parseFloat(riggingRadius) || 5;

  let vol = 0;
  if (shape === "circular") {
    vol = Math.PI * Math.pow(d / 2, 2) * h * n;
  } else {
    vol = l * w * h * n;
  }
  const dryVol = vol * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
  const ratio = mixRatios[mix];
  const totalRatio = ratio.c + ratio.s + ratio.a;
  const cementM3 = (dryVol * ratio.c) / totalRatio;
  const cementBags = Math.ceil(cementM3 / CIVIL_CONSTANTS.CEMENT_BAG_VOLUME_M3);
  const sandCft = ((dryVol * ratio.s) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;
  const aggCft = ((dryVol * ratio.a) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;

  // Precast Calculations
  const singleElementVolume = vol / n;
  const elementWeightKg = singleElementVolume * density;
  const craneCapacityTonnes = (elementWeightKg * 1.5 * radius) / 1000;

  // Reinforcement Calculations
  let totalTieWeight = 0;
  let mainSteelWeight = 0;
  let totalSteelWeight = 0;
  const tieTypes: { name: string; length: number; countPerSet: number }[] = [];
  let tieSetsCount = 0;

  if (h > 0 && sTie > 0 && dTie > 0 && dMain > 0) {
    const l_mm = l * 1000;
    const w_mm = w * 1000;
    const d_mm = d * 1000;

    tieSetsCount = Math.ceil((h * 1000) / sTie) + 1; // RULE: REBAR_SPACING_COUNT

    if (shape === "circular") {
      const coreDia = d_mm - 2 * c;
      const hoopLength = Math.PI * coreDia + 24 * dTie; // Outer circular hoop + hooks
      tieTypes.push({ name: "Circular Hoop", length: hoopLength, countPerSet: 1 });
    } else {
      const a = w_mm - 2 * c; // Note: w is width
      const b = l_mm - 2 * c; // l is length

      const outerTieLength = 2 * (a + b) + 24 * dTie; // RULE: RECTANGULAR_STIRRUP_LENGTH
      tieTypes.push({ name: "Outer Rectangular Tie", length: outerTieLength, countPerSet: 1 });

      if (numBars === 8) {
        if (variation8 === "1") {
          const diamondSide = Math.sqrt(Math.pow(a / 2, 2) + Math.pow(b / 2, 2));
          const diamondCutLength = 4 * diamondSide + 24 * dTie;
          tieTypes.push({ name: "Inner Diamond Tie", length: diamondCutLength, countPerSet: 1 });
        } else if (variation8 === "2") {
          const aMax = Math.max(a, b);
          const aMin = Math.min(a, b);
          const innerA = aMax / 3;
          const innerB = aMin;
          const innerRectLength = 2 * (innerA + innerB) + 24 * dTie;
          tieTypes.push({ name: "Inner Rectangular Tie", length: innerRectLength, countPerSet: 1 });
        } else if (variation8 === "3") {
          tieTypes.push({ name: "Link Tie (Parallel to Width)", length: a + 24 * dTie, countPerSet: 1 });
          tieTypes.push({ name: "Link Tie (Parallel to Length)", length: b + 24 * dTie, countPerSet: 1 });
        }
      } else if (numBars === 10) {
        if (variation10 === "1") {
          // Assuming 4 on long face, 3 on short face (which adds up to 10 if overlapping correctly but outer tie covers all. Standard is 4x3)
          // Based off our ten bar implementation
          tieTypes.push({ name: "Link/Cross Tie (Parallel to Width)", length: a + 24 * dTie, countPerSet: 2 });
          tieTypes.push({ name: "Link/Cross Tie (Parallel to Length)", length: b + 24 * dTie, countPerSet: 1 });
        } else if (variation10 === "2") {
          const innerA = a;
          const innerB = b / 2;
          const innerRectLength = 2 * (innerA + innerB) + 24 * dTie;
          tieTypes.push({ name: "Inner Rectangular Tie", length: innerRectLength, countPerSet: 1 });
          tieTypes.push({ name: "Link/Cross Tie (Parallel to Length)", length: b + 24 * dTie, countPerSet: 1 });
        }
      }
      // For 4 bars and 6 bars, we can just supply the outer rectangular tie as default
      // 6 bars usually requires one middle link tie
      if (numBars === 6) {
        const longestSide = Math.max(a, b);
        const shortestSide = Math.min(a, b);
        tieTypes.push({ name: "Link Tie (Mid)", length: shortestSide + 24 * dTie, countPerSet: 1 });
      }
    }

    const totalMainBarLength = numBars * h; 
    const mainUnitWeight = Math.pow(dMain, 2) / 162.28; // RULE: STEEL_WEIGHT_ESTIMATION
    mainSteelWeight = mainUnitWeight * totalMainBarLength * n; // multiply by n columns

    const tieUnitWeight = Math.pow(dTie, 2) / 162.28;
    tieTypes.forEach(tie => {
      const totalLengthM = (tie.length / 1000) * tie.countPerSet * tieSetsCount * n; // multiply by n columns
      totalTieWeight += totalLengthM * tieUnitWeight;
    });

    totalSteelWeight = mainSteelWeight + totalTieWeight;
  }
  return (
    <div className="w-full h-full bg-transparent text-slate-900 dark:text-white p-6 md:p-8">
      <div className="w-full md:max-w-4xl md:mx-auto space-y-6 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <GlobalSettingsToggle align="left" showCurrency={false} />
        </div>
                <div className="bg-bg-card rounded-[24px] shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <div>
                <label className="block mb-3 text-sm font-medium text-slate-700 mb-1">
                  Column Shape
                </label>
                <div className="mb-6">
                  <UniversalTabs 
                    tabs={(["rectangular", "square", "circular"] as const).map(s => ({ 
                      id: s, 
                      label: s.charAt(0).toUpperCase() + s.slice(1), 
                      icon: s === 'circular' ? <CircleDashed className="w-4 h-4" /> : <Square className="w-4 h-4" /> 
                    }))}
                    activeTab={shape}
                    onTabChange={(id) => setShape(id as any)}
                  />
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <div className="space-y-6">
                {/* Dynamically Render Inputs */}
                {shape === "circular" ? (
                  <CircularColumnInputs
                    diameter={diameter}
                    setDiameter={setDiameter}
                  />
                ) : (
                  <RectangularColumnInputs
                    length={length}
                    width={width}
                    setLength={setLength}
                    setWidth={setWidth}
                    isSquare={shape === "square"}
                  />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                      Height (m)
                    </label>
                    <><label htmlFor="a11y-input-187" className="sr-only">Input</label>
<input id="a11y-input-187" type="number" inputMode="decimal"
                      className="w-full bg-transparent rounded-full border border-slate-200 shadow-sm text-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 transition-all min-h-[44px] text-base font-normal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    /></>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                      Number of Columns
                    </label>
                    <><label htmlFor="a11y-input-188" className="sr-only">Input</label>
<input id="a11y-input-188" type="number" inputMode="decimal"
                      className="w-full bg-transparent rounded-full border border-slate-200 shadow-sm text-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 transition-all min-h-[44px] text-base font-normal"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                    /></>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Concrete Mix
                  </label>
                  <select
                    className="w-full bg-transparent rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 transition-all appearance-none text-base font-normal overflow-hidden"
                    value={mix}
                    onChange={(e) => setMix(e.target.value)}
                  >
                    {Object.keys(mixRatios).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {isPrecast && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-[24px] border border-indigo-100 overflow-hidden">
                    <InputGroup label="Concrete Density" info="kg/m³">
                      <><label htmlFor="a11y-input-189" className="sr-only">Input</label>
<input id="a11y-input-189" type="number" inputMode="decimal" value={concreteDensity} onChange={(e) => setConcreteDensity(e.target.value)} className="w-full h-11 bg-white rounded-full border border-slate-200 shadow-sm text-slate-800 border border-indigo-200 rounded-full px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none transition-all shadow-sm overflow-hidden" /></>
                    </InputGroup>
                    <InputGroup label="Lifting Radius" info="m">
                      <><label htmlFor="a11y-input-190" className="sr-only">Input</label>
<input id="a11y-input-190" type="number" inputMode="decimal" value={riggingRadius} onChange={(e) => setRiggingRadius(e.target.value)} className="w-full h-11 bg-white rounded-full border border-slate-200 shadow-sm text-slate-800 border border-indigo-200 rounded-full px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none transition-all shadow-sm overflow-hidden" /></>
                    </InputGroup>
                  </div>
                )}
              </div>
              {/* Visual Aid */}
              <div className="bg-transparent rounded-[24px] flex flex-col items-center justify-center px-4 py-3 border border-slate-200 dark:border-slate-700/50 min-h-[300px] overflow-hidden">
                <div
                  className="w-40 h-40 relative flex items-center justify-center text-blue-200 border-[8px] mb-6 shadow-inner transition-all duration-500 ease-in-out"
                  style={{
                    borderRadius:
                      shape === "circular"
                        ? "50%"
                        : shape === "square"
                          ? "1rem"
                          : "1rem",
                    borderColor: "currentColor",
                    width: shape === "rectangular" ? "160px" : "140px",
                    height: shape === "rectangular" ? "120px" : "140px",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <div className="absolute top-2 w-1 h-3 rounded-full bg-blue-300" />
                    <div className="absolute bottom-2 w-1 h-3 rounded-full bg-blue-300" />
                    <div className="absolute left-2 w-3 h-1 rounded-full bg-blue-300" />
                    <div className="absolute right-2 w-3 h-1 rounded-full bg-blue-300" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-slate-900 dark:text-white capitalize text-lg font-medium text-slate-800 mb-4">
                    {shape} Column Cross-Section
                  </h4>
                  <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
                    {shape === "circular"
                      ? `Ø ${d}m`
                      : shape === "square"
                        ? `${l} × ${l}m`
                        : `${l} × ${w}m`}
                    <span className="mx-2">•</span> Height: {h}m
                  </p>
                </div>
              </div>
            </div>
            
            {/* Reinforcement Configuration */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <CopySlash className="w-5 h-5 text-indigo-600" />
                <h2 className="text-slate-900 dark:text-white text-xl font-semibold text-slate-900 tracking-tight mb-4">Reinforcement Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label={
                      <span className="flex items-center">
                        Clear Cover (mm)
                        <FieldTooltip content="Minimum concrete cover to protect reinforcement from corrosion. IS 456:2000 Table 16: Mild exposure = 20mm, Moderate = 30mm, Severe = 45mm, Very Severe = 50mm" />
                      </span>
                    }>
                      <><label htmlFor="a11y-input-191" className="sr-only">Input</label>
<input id="a11y-input-191"
                        type="number" inputMode="decimal"
                        min="0"
                        value={clearCover}
                        onChange={(e) => setClearCover(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-full px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                      /></>
                    </InputGroup>
                    <InputGroup label="Number of Main Bars">
                      <select
                        value={mainBarsCount}
                        onChange={(e) => setMainBarsCount(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-[24px] px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                      >
                        <option value="4">4 Bars</option>
                        <option value="6">6 Bars</option>
                        <option value="8">8 Bars</option>
                        <option value="10">10 Bars</option>
                      </select>
                    </InputGroup>
                  </div>
                  <InputGroup label="Main Bar Diameter (mm)">
                    <select
                      value={mainDia}
                      onChange={(e) => setMainDia(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-[24px] px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                    >
                      {[12, 16, 20, 25, 32].map(d => (
                        <option key={d} value={d}>{d} mm</option>
                      ))}
                    </select>
                  </InputGroup>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Tie Diameter (mm)">
                      <select
                        value={tieDia}
                        onChange={(e) => setTieDia(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-[24px] px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                      >
                        {[8, 10, 12, 16].map(d => (
                          <option key={d} value={d}>{d} mm</option>
                        ))}
                      </select>
                    </InputGroup>
                    <InputGroup label="Tie Spacing c/c (mm)">
                      <><label htmlFor="a11y-input-192" className="sr-only">Input</label>
<input id="a11y-input-192"
                        type="number" inputMode="decimal"
                        min="0"
                        value={tieSpacing}
                        onChange={(e) => setTieSpacing(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-full px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                      /></>
                    </InputGroup>
                  </div>

                  {shape !== "circular" && mainBarsCount === "8" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <InputGroup label="8-Bar Tie Variation">
                        <select
                          value={variation8}
                          onChange={(e) => setVariation8(e.target.value)}
                          className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-[24px] px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                        >
                          <option value="1">Outer Rect + Inner Diamond</option>
                          <option value="2">Outer Rect + Inner Rect (4x2 layout)</option>
                          <option value="3">Outer Rect + 2 Cross/Link Ties</option>
                        </select>
                      </InputGroup>
                    </div>
                  )}

                  {shape !== "circular" && mainBarsCount === "10" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <InputGroup label="10-Bar Tie Variation">
                        <select
                          value={variation10}
                          onChange={(e) => setVariation10(e.target.value)}
                          className="w-full h-11 bg-white border border-slate-200 dark:border-slate-700 rounded-[24px] px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none transition-all shadow-sm overflow-hidden"
                        >
                          <option value="1">Outer Rect + 3 Link/Cross Ties</option>
                          <option value="2">Outer Rect + Inner Rect + 1 Link Tie</option>
                        </select>
                      </InputGroup>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex flex-col h-full pt-6 border-t border-slate-200 dark:border-slate-700 w-full mt-4">
              {isPrecast && (
                <div className="mb-6 p-4 md:p-6 rounded-[24px] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                    <ArrowUp className="w-32 h-32 text-amber-900" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="uppercase st text-amber-600 mb-1 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                        <AlertTriangle className="w-4 h-4" /> Precast Safety & Lifting
                      </h4>
                      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
                        Based on {radius}m rig radius and 1.5x dynamic multi.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 p-4 rounded-[24px] border border-amber-100 overflow-hidden">
                          <span className="text-sm sm:text-base font-medium uppercase tracking-wider block mb-1">Single Element Wt</span>
                          <span className="text-xl md:text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-800">{(elementWeightKg / 1000).toFixed(2)}<span className="text-sm font-medium ml-1 text-slate-500">Tons</span></span>
                        </div>
                        <div className="w-full bg-white/80 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-4 rounded-[24px] border border-amber-200 shadow-sm overflow-hidden">
                          <span className="text-sm sm:text-base font-medium uppercase tracking-wider block mb-1">Min. Crane Capacity</span>
                          <span className="text-xl md:text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-amber-700">{craneCapacityTonnes.toFixed(2)}<span className="text-sm font-medium ml-1 text-amber-600/80">Tons</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <MaterialSummary
                title="Estimate Results"
                totalLabel="Total Steel Weight"
                totalValue={totalSteelWeight.toFixed(2)}
                totalUnit="kg"
              >
                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResultCard
                      title="Concrete Volume (Wet)"
                      value={vol.toFixed(3)}
                      unit="m³"
                      variant="primary"
                    />
                    <ResultCard
                      title="Dry Concrete Volume"
                      value={dryVol.toFixed(3)}
                      unit="m³"
                      variant="neutral"
                    />
                  </div>
                  
                  <h4 className="text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                    <Layers className="w-5 h-5 text-slate-700" />
                    Material Breakdown ({mix})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <ResultCard title="Cement" value={cementBags} unit="bags" variant="neutral" />
                    <ResultCard title="Sand" value={sandCft.toFixed(1)} unit="cft" variant="neutral" />
                    <ResultCard title="Aggregate" value={aggCft.toFixed(1)} unit="cft" variant="neutral" />
                  </div>
                  
                  <div className="w-full bg-white border border-slate-200 border-l-[4px] border-l-[#6B46C1] rounded-[24px] p-4 sm:p-6 shadow-sm mt-4 overflow-hidden">
                    <h4 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
                      <CopySlash className="w-5 h-5 text-[#6B46C1]" />
                      Steel Reinforcement Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
                            <span className="text-slate-500 text-sm uppercase tracking-wider block mb-0.5">Main ({numBars} Bars)</span>
                            <span className="font-semibold text-lg text-slate-800">{mainSteelWeight.toFixed(2)} kg</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
                            <span className="text-slate-500 text-sm uppercase tracking-wider block mb-0.5">Ties</span>
                            <span className="font-semibold text-lg text-slate-800">{totalTieWeight.toFixed(2)} kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[24px] p-4 border border-slate-200 overflow-hidden">
                        <p className="uppercase tracking-wider mb-3 text-base font-normal text-slate-600 leading-relaxed">Tie Cut Length Breakdown ({tieSetsCount} sets per col)</p>
                        <ul className="space-y-2">
                          {tieTypes.map((tie, idx) => (
                            <li key={idx} className="w-full flex justify-between items-center bg-white border border-slate-100 px-3 py-2 rounded-[16px] text-sm shadow-sm overflow-hidden">
                              <div>
                                <p className="text-base font-normal text-slate-600 leading-relaxed">{tie.name}</p>
                                <p className="text-base font-normal text-slate-600 leading-relaxed">{tie.countPerSet} per set</p>
                              </div>
                              <p className="text-base font-normal text-slate-600 leading-relaxed">{tie.length.toFixed(0)} mm</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </MaterialSummary>
            </div>
          </div>
        </div>
      </div>
      <CalculationHistory
          calculatorId="column_v1"
          estimationName="Column Estimate"
          currentInputs={{ shape, diameter, length, width, height, mix, count }}
          currentResults={{ vol: vol.toFixed(2), cementBags, sandCft: sandCft.toFixed(2), aggCft: aggCft.toFixed(2) }}
          summaryGeneration={(inputs, res) => `Vol: ${res.vol} cft - Cement: ${res.cementBags} bags`}
          onRestore={(inputs) => {
            if (inputs.shape) setShape(inputs.shape);
            if (inputs.diameter) setDiameter(inputs.diameter);
            if (inputs.length) setLength(inputs.length);
            if (inputs.width) setWidth(inputs.width);
            if (inputs.height) setHeight(inputs.height);
            if (inputs.mix) setMix(inputs.mix);
            if (inputs.count) setCount(inputs.count);
          }}
      />
    </div>
  );
}
