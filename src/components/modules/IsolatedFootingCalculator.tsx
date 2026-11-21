import { Button } from '../ui/Button';
import React, { useState } from "react";
import { Accordion } from "../ui/Accordion";
import { UniversalTabs } from "../ui/UniversalTabs";
import {
  Maximize,
  Box,
  Layers,
  ArrowDownToLine,
  Spade,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { FieldTooltip } from "../ui/FieldTooltip";
import { NumberInput } from "../ui/NumberInput";
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from "../../lib/useRates";
import { formatRate } from "../../lib/rates";
import { designFooting } from "../../lib/footingCalc";
import { CalcSteps, EngineNotices, StructuralExportBar } from "../ui/StructuralExportBar";


const mixRatios: Record<string, { c: number; s: number; a: number }> = {
  "M10 (1:3:6)": { c: 1, s: 3, a: 6 },
  "M15 (1:2:4)": { c: 1, s: 2, a: 4 },
  "M20 (1:1.5:3)": { c: 1, s: 1.5, a: 3 },
  "M25 (1:1:2)": { c: 1, s: 1, a: 2 },
};

function InputGroup({
  label,
  children,
  colSpan = 1,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${colSpan > 1 ? `md:col-span-${colSpan}` : ""}`}
    >
      <label className="text-base font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function IsolatedFootingCalculator({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  const { settings } = useSettings();
  const [footingType, setFootingType] = useState<
    "rectangular" | "sloped" | "stepped"
  >("sloped");
  const [footingL, setFootingL] = useState("2.2");
  const [footingW, setFootingW] = useState("2.2");
  const [footingD, setFootingD] = useState("0.5"); // For rectangular

  const [footingD1, setFootingD1] = useState("0.2"); // Base thickness
  const [footingD2, setFootingD2] = useState("0.3"); // Sloped or step thickness

  const [topL, setTopL] = useState("0.6"); // Top dimensions for sloped/stepped
  const [topW, setTopW] = useState("0.6");

  const [columnL, setColumnL] = useState("0.4");
  const [columnW, setColumnW] = useState("0.4");

  const [workingSpace, setWorkingSpace] = useState("0.3"); // 300mm standard working space
  const [excavationDepth, setExcavationDepth] = useState("1.5");

  const [workingLoad, setWorkingLoad] = useState("666.67");
  const [safetyFactor, setSafetyFactor] = useState("1.5");

  const load = (parseFloat(workingLoad) * parseFloat(safetyFactor)).toString();
  const [sbc, setSbc] = useState("250"); // kN/m2

  const [mix, setMix] = useState("M20 (1:1.5:3)");

  // Reinforcement
  const [clearCover, setClearCover] = useState("50");
  const [hasTopMesh, setHasTopMesh] = useState(false);
  const [diaX, setDiaX] = useState("12");
  const [spacingX, setSpacingX] = useState("115");
  const [diaY, setDiaY] = useState("12");
  const [spacingY, setSpacingY] = useState("115");
  const [fck, setFck] = useState("25");
  const [fy, setFy] = useState("500");
  const [momentX, setMomentX] = useState("0");
  const [momentY, setMomentY] = useState("0");
  const [autoDesign, setAutoDesign] = useState(true);
  const [wastage, setWastage] = useState("5");

  const [diaXTop, setDiaXTop] = useState("10");
  const [spacingXTop, setSpacingXTop] = useState("200");
  const [diaYTop, setDiaYTop] = useState("10");
  const [spacingYTop, setSpacingYTop] = useState("200");

  const fL = parseFloat(footingL) || 0;
  const fW = parseFloat(footingW) || 0;
  const fD = parseFloat(footingD) || 0;

  const fD1 = parseFloat(footingD1) || 0;
  const fD2 = parseFloat(footingD2) || 0;
  const tL = parseFloat(topL) || 0;
  const tW = parseFloat(topW) || 0;

  const totalD = footingType === "rectangular" ? fD : fD1 + fD2;

  const cL = parseFloat(columnL) || 0;
  const cW = parseFloat(columnW) || 0;
  const ws = parseFloat(workingSpace) || 0;
  const exD = parseFloat(excavationDepth) || 0;
  const P = parseFloat(load) || 0;
  const q_allow = parseFloat(sbc) || 0;
  const cover = parseFloat(clearCover) || 0;

  // Design Check
  const reqArea = q_allow > 0 ? (P * 1.1) / q_allow : 0; // 10% extra for self weight
  const actualArea = fL * fW;
  const isSafe = actualArea >= reqArea;

  // Concrete Volume
  let concreteVol = 0;
  if (footingType === "rectangular") {
    concreteVol = fL * fW * fD;
  } else if (footingType === "stepped") {
    concreteVol = fL * fW * fD1 + tL * tW * fD2;
  } else if (footingType === "sloped") {
    // TRAPEZOIDAL_FOOTING_VOLUME rule: V = h/3 * (A1 + A2 + sqrt(A1*A2)) + Rectangular base
    const vBase = fL * fW * fD1;
    const A1 = fL * fW;
    const A2 = tL * tW;
    const vSloped = (fD2 / 3) * (A1 + A2 + Math.sqrt(A1 * A2));
    concreteVol = vBase + vSloped;
  }

  // Materials come from the engine (design.materials) — the local
  // recompute below used to ignore wastage, so this page showed sand
  // 24.0 cft while the engine cost lines / BOQ showed 25.2 cft. The wet
  // concrete volume above is still local: it feeds backfill, and it is
  // the same frustum formula the engine uses (design.concreteVolM3).

  // Excavation & Backfilling
  const exL = fL + 2 * ws;
  const exW = fW + 2 * ws;
  const excavationVol = exL * exW * exD;
  const backfillVol = Math.max(
    0,
    excavationVol - concreteVol - cL * cW * Math.max(0, exD - totalD),
  );

  const { rates, setRate, table } = useRates();

  // Structural design (IS 456) — punching / one-way shear / flexure / Ast.
  const design = designFooting({
    footingLengthM: fL, footingWidthM: fW, totalDepthM: totalD,
    baseDepthM: footingType === "rectangular" ? totalD : fD1,
    topLengthM: parseFloat(topL) || 0, topWidthM: parseFloat(topW) || 0, footingType: footingType as "rectangular" | "sloped" | "stepped",
    columnLengthM: cL, columnWidthM: cW,
    workingLoadKN: parseFloat(workingLoad) || 0,
    safetyFactor: parseFloat(safetyFactor) || 1.5,
    sbcKNm2: parseFloat(sbc) || 0,
    fck: parseFloat(fck) || 25, fy: parseFloat(fy) || 500,
    momentXKNm: parseFloat(momentX) || 0, momentYKNm: parseFloat(momentY) || 0,
    coverMm: cover, barDiaMm: parseFloat(diaX) || 12, barDiaYMm: parseFloat(diaY) || 12,
    autoDesign, manualSpacingMm: parseFloat(spacingX) || 115, manualSpacingYMm: parseFloat(spacingY) || 115,
    topMesh: hasTopMesh,
    topMeshDiaXMm: parseFloat(diaXTop) || 10, topMeshDiaYMm: parseFloat(diaYTop) || 10,
    topMeshSpacingXMm: parseFloat(spacingXTop) || 200, topMeshSpacingYMm: parseFloat(spacingYTop) || 200,
    mix: mixRatios[mix] ?? { c: 1, s: 1.5, a: 3 },
    wastagePct: parseFloat(wastage) || 0,
    workingSpaceM: ws, excavationDepthM: parseFloat(excavationDepth) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  });
  const effSpacingX = design.spacingXMm;
  const effSpacingY = design.spacingYMm;

  // Steel comes from the engine (single source of truth) — the old code
  // recomputed bars, cut lengths and weights locally, ignoring diaY and
  // the top-mesh inputs the engine now handles. Bar-schedule figures
  // below are design.barsX / design.cutLengthXMm etc.
  const barsX = design.barsX;
  const barsY = design.barsY;
  const cutLengthX = design.cutLengthXMm;
  const cutLengthY = design.cutLengthYMm;
  const wtX = design.bottomSteelXKg;
  const wtY = design.bottomSteelYKg;
  const barsXTop = design.topBarsX;
  const barsYTop = design.topBarsY;
  const cutLengthXTop = design.topCutLengthXMm;
  const cutLengthYTop = design.topCutLengthYMm;
  const wtXTop = design.topSteelXKg;
  const wtYTop = design.topSteelYKg;
  const totalSteel = design.steelKg;

  const handleAiSafetyFactor = () => {
    let sf = 1.5;
    if (
      settings.projectType === "Commercial" ||
      settings.projectType === "Industrial"
    ) {
      sf = 1.6;
    } else if (settings.projectType === "Residential") {
      sf = 1.5;
    }
    setSafetyFactor(sf.toString());
  };

  const loadExample = () => {
    setFootingType("sloped");
    setWorkingLoad("533.33");
    setSafetyFactor("1.5");
    setSbc("150");
    setFootingL("2.5");
    setFootingW("2.5");
    setFootingD1("0.2");
    setFootingD2("0.3");
    setTopL("0.6");
    setTopW("0.6");
  };

  const resetDefault = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all inputs? This action cannot be undone.",
      )
    )
      return;
    setFootingType("sloped");
    setWorkingLoad("666.67");
    setSafetyFactor("1.5");
    setSbc("250");
    setFootingL("2.2");
    setFootingW("2.2");
    setFootingD("0.5");
    setFootingD1("0.2");
    setFootingD2("0.3");
    setTopL("0.6");
    setTopW("0.6");
  };

  const sendToBOQ = () => {
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Cement for isolated footing (${footingL}x${footingW}m, ${mix})`,
        unit: "bags",
        quantity: design.materials.cementBags,
        rate: rates.cementPerBag ?? 0,
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Sand for isolated footing concrete`,
        unit: "cft",
        quantity: design.materials.sandCft,
        rate: rates.sandPerCft ?? 0,
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Aggregate for isolated footing concrete`,
        unit: "cft",
        quantity: design.materials.aggCft,
        rate: rates.crushPerCft ?? 0,
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement for Footing (${diaX} mm @ ${effSpacingX} mm c/c)`,
        unit: "kg",
        quantity: totalSteel,
        rate: rates.steelPerKg ?? 0,
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "02 - Site Work & Earthwork",
        description: `Excavation for Footing (WS=${ws}m)`,
        unit: "m³",
        quantity: excavationVol,
        rate: 0,
      },
    ];
    window.dispatchEvent(new CustomEvent("fill-boq", { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  return (
    <div
      className={
        isEmbedded
          ? "w-full space-y-6"
          : "w-full h-full bg-transparent text-txt-primary dark:text-white p-6 md:p-8"
      }
    >
      <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 px-4 md:px-0">
        {!isEmbedded && (
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex flex-col items-end gap-2">
              <GlobalSettingsToggle align="left" showCurrency={false} />
              <div className="flex gap-2">
                <Button
                  onClick={sendToBOQ}
                  className="text-base font-medium px-3 py-2 bg-ui-success text-ui-successText rounded-full hover:bg-ui-success transition-colors border border-ui-successBorder active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                >
                  Send to BOQ
                </Button>
                <Button
                  onClick={loadExample}
                  className="text-base font-medium px-3 py-2 bg-accent-500/10 text-accent-800 rounded-full hover:bg-accent-500/20 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                >
                  Load Example
                </Button>
                <Button
                  onClick={resetDefault}
                  className="text-base font-medium px-3 py-2 bg-surface-hover text-txt-tertiary rounded-full hover:bg-surface-active transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-card rounded-2xl shadow-brand-md border border-ui-borderSubtle dark:border-ink-600 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            <p className="text-sm text-txt-secondary leading-relaxed">
              Design and estimate an isolated footing to IS 456:2000 — bearing check, two-way
              (punching) shear at d/2 from the column face, one-way shear at d, and flexural
              steel at the column face. Enter the working column load and moments; the tool
              factors the load (Pu = 1.5 × working load), checks shear, and sizes the bottom
              mesh. Formulae: qᵤ = Pu / A · Mu = qᵤ·B·(projection)²/2 · Ast from the limit-state
              moment equation with Ast,min = 0.12% of b·D. Rates are Pakistan market rates
              (editable below); India / UAE rates are shown as — until you enter them.
            </p>
            <EngineNotices errors={design.errors} warnings={design.warnings} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
              {/* Inputs */}
              <div className="space-y-6">
                <Accordion title="Dimensions & Load" defaultOpen={true}>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-md mb-4 text-txt-secondary dark:text-txt-primary pb-2">
                        Load & SBC Check
                      </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Working Load (P)">
                      <NumberInput
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                        value={workingLoad}
                        onChange={(val) => setWorkingLoad(val.toString())}
                      />
                    </InputGroup>
                    <div className="flex flex-col">
                      <label className="text-base font-medium uppercase tracking-wider mb-2 px-1">
                        Safety Factor (γf)
                      </label>
                      <div className="flex items-center gap-2 h-full">
                        <NumberInput
                          className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                          value={safetyFactor}
                          onChange={(val) => setSafetyFactor(val.toString())}
                        />
                        <Button
                          onClick={handleAiSafetyFactor}
                          className="h-full min-h-[48px] px-4 bg-accent-50 hover:bg-accent-100 text-accent-800 rounded-full flex items-center justify-center transition-colors shadow-brand-sm whitespace-nowrap text-sm font-medium active:scale-95 hover:-translate-y-0.5"
                        >
                          <Sparkles className="w-4 h-4 mr-1.5" /> AI Suggest
                        </Button>
                      </div>
                    </div>
                    <InputGroup
                      label={
                        <span className="flex items-center">
                          Safe Bearing Cap. (kN/m²)
                          <FieldTooltip content="IS 1904:1986: Soft clay = 50-100, Stiff clay = 100-200, Dense sand = 200-400, Rock = 1000-4000 kN/m²" />
                        </span>
                      }
                    >
                      <NumberInput
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                        value={sbc}
                        onChange={(val) => setSbc(val.toString())}
                      />
                    </InputGroup>
                  </div>
                </div>

                <div>
                      <h4 className="font-bold text-md mb-4 text-txt-secondary dark:text-txt-primary pb-2">
                        Footing Details
                      </h4>
                  <InputGroup label="Footing Type" colSpan={3}>
                    <div
                      className="flex bg-surface-hover p-1 rounded-2xl mb-4 overflow-x-auto whitespace-nowrap hide-scrollbar"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <Button
                        onClick={() => setFootingType("rectangular")}
                        aria-label="Select Rectangular Footing"
                        className={`flex-none px-6 py-2 text-base font-medium rounded-2xl transition-all ${footingType === "rectangular" ? "bg-surface-default shadow-brand-sm text-accent-800" : "text-txt-tertiary"}`}
                      >
                        Rectangular
                      </Button>
                      <Button
                        onClick={() => setFootingType("sloped")}
                        aria-label="Select Sloped or Trapezoidal Footing"
                        className={`flex-none px-6 py-2 text-base font-medium rounded-2xl transition-all ${footingType === "sloped" ? "bg-surface-default shadow-brand-sm text-accent-800" : "text-txt-tertiary"}`}
                      >
                        Sloped/Trapezoidal
                      </Button>
                      <Button
                        onClick={() => setFootingType("stepped")}
                        aria-label="Select Stepped Footing"
                        className={`flex-none px-6 py-2 text-base font-medium rounded-2xl transition-all ${footingType === "stepped" ? "bg-surface-default shadow-brand-sm text-accent-800" : "text-txt-tertiary"}`}
                      >
                        Stepped
                      </Button>
                    </div>
                  </InputGroup>
                  <div className="grid grid-cols-2 gap-4 mt-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
                    <InputGroup label="Base Length (m)">
                      <NumberInput
                        step="0.1"
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                        value={footingL}
                        onChange={(val) => setFootingL(val.toString())}
                      />
                    </InputGroup>
                    <InputGroup label="Base Width (m)">
                      <NumberInput
                        step="0.1"
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                        value={footingW}
                        onChange={(val) => setFootingW(val.toString())}
                      />
                    </InputGroup>

                    {footingType === "rectangular" ? (
                      <InputGroup label="Depth (m)">
                        <NumberInput
                          step="0.1"
                          className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                          value={footingD}
                          onChange={(val) => setFootingD(val.toString())}
                        />
                      </InputGroup>
                    ) : (
                      <>
                        <InputGroup label="Base Depth, D1 (m)">
                          <NumberInput
                            step="0.1"
                            className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                            value={footingD1}
                            onChange={(val) => setFootingD1(val.toString())}
                          />
                        </InputGroup>
                        <InputGroup
                          label={
                            footingType === "sloped"
                              ? "Sloped Depth, D2 (m)"
                              : "Step 2 Depth, D2 (m)"
                          }
                        >
                          <NumberInput
                            step="0.1"
                            className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                            value={footingD2}
                            onChange={(val) => setFootingD2(val.toString())}
                          />
                        </InputGroup>

                        <InputGroup label="Top Length, A2 (m)">
                          <NumberInput
                            step="0.1"
                            className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                            value={topL}
                            onChange={(val) => setTopL(val.toString())}
                          />
                        </InputGroup>
                        <InputGroup label="Top Width, B2 (m)">
                          <NumberInput
                            step="0.1"
                            className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                            value={topW}
                            onChange={(val) => setTopW(val.toString())}
                          />
                        </InputGroup>
                      </>
                    )}
                  </div>
                </div>

                  </div>
                                </Accordion>

                <Accordion title="Column & Earthworks">
                  <div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Column L×W (m)">
                      <div className="flex gap-2">
                        <NumberInput
                          step="0.1"
                          className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary text-center shadow-brand-sm transition-all overflow-hidden"
                          value={columnL}
                          onChange={(val) => setColumnL(val.toString())}
                          placeholder="L"
                        />
                        <span className="text-txt-secondary self-center">×</span>
                        <NumberInput
                          step="0.1"
                          className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary text-center shadow-brand-sm transition-all overflow-hidden"
                          value={columnW}
                          onChange={(val) => setColumnW(val.toString())}
                          placeholder="W"
                        />
                      </div>
                    </InputGroup>
                    <InputGroup label={<span className="flex items-center gap-1">Concrete Mix <CodeTooltip standard="IS" code="456:2000" description="Nominal mix proportions and minimum grade of concrete (Table 5)." /></span>}>
                      <select
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 outline-none transition-all appearance-none shadow-brand-sm overflow-hidden"
                        value={mix}
                        onChange={(e) => setMix(e.target.value)}
                      >
                        {Object.keys(mixRatios).map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </InputGroup>
                    <InputGroup
                      label={
                        <span className="flex items-center">
                          Working Space (m)
                          <FieldTooltip content="Typical allowance 0.3m to 0.6m on all sides for shuttering and labor access." />
                        </span>
                      }
                    >
                      <NumberInput
                        step="0.1"
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                        value={workingSpace}
                        onChange={(val) => setWorkingSpace(val.toString())}
                      />
                    </InputGroup>
                    <InputGroup label="Excavation Depth (m)">
                      <NumberInput
                        step="0.1"
                        className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                        value={excavationDepth}
                        onChange={(val) => setExcavationDepth(val.toString())}
                      />
                    </InputGroup>
                  </div>
                </div>

                                </Accordion>

                <Accordion title="Reinforcement Mesh">
                  <div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="col-span-3">
                      <InputGroup
                        label={
                          <span className="flex items-center">
                            Clear Cover (mm)
                            <FieldTooltip content="Minimum concrete cover to protect reinforcement from corrosion. IS 456:2000 Table 16: Mild exposure = 20mm, Moderate = 30mm, Severe = 45mm, Very Severe = 50mm" />
                          </span>
                        }
                      >
                        <NumberInput
                          className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm transition-all overflow-hidden"
                          value={clearCover}
                          onChange={(val) => setClearCover(val.toString())}
                        />
                      </InputGroup>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                      <p className="text-base font-medium uppercase text-txt-tertiary mb-3 ml-1 tracking-wider">
                        Bottom Mesh: X-Axis
                      </p>
                      <div className="space-y-4">
                        <InputGroup label={<span className="flex items-center gap-1">Bar Dia (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                          <select
                            className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 shadow-brand-sm"
                            value={diaX}
                            onChange={(e) => setDiaX(e.target.value)}
                          >
                            {[8, 10, 12, 16, 20].map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </InputGroup>
                        <InputGroup label={<span className="flex items-center gap-1">Spacing c/c (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span>}>
                          <NumberInput
                            className="w-full calc-input px-3 py-2 text-sm shadow-brand-sm transition-all"
                            value={spacingX}
                            onChange={(val) => setSpacingX(val.toString())}
                          />
                        </InputGroup>
                      </div>
                    </div>
                    <div className="p-4 bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                      <p className="text-base font-medium uppercase text-txt-tertiary mb-3 ml-1 tracking-wider">
                        Bottom Mesh: Y-Axis
                      </p>
                      <div className="space-y-4">
                        <InputGroup label={<span className="flex items-center gap-1">Bar Dia (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                          <select
                            className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 shadow-brand-sm"
                            value={diaY}
                            onChange={(e) => setDiaY(e.target.value)}
                          >
                            {[8, 10, 12, 16, 20].map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </InputGroup>
                        <InputGroup label={<span className="flex items-center gap-1">Spacing c/c (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span>}>
                          <NumberInput
                            className="w-full calc-input px-3 py-2 text-sm shadow-brand-sm transition-all"
                            value={spacingY}
                            onChange={(val) => setSpacingY(val.toString())}
                          />
                        </InputGroup>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-surface-hover border border-ui-borderSubtle rounded-2xl overflow-hidden">
                      <>
                        <label htmlFor="a11y-input-309" className="sr-only">
                          Input
                        </label>
                        <input
                          id="a11y-input-309"
                          type="checkbox"
                          className="w-5 h-5 rounded border-ui-borderDefault text-accent-800 focus:ring-accent-500"
                          checked={hasTopMesh}
                          onChange={(e) => setHasTopMesh(e.target.checked)}
                        />
                      </>
                      <span className="font-bold text-txt-primary">
                        Include Top Mesh
                      </span>
                    </label>
                  </div>

                  {hasTopMesh && (
                    <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-accent-50 rounded-2xl border border-accent-100 overflow-hidden">
                        <p className="text-base font-medium uppercase text-accent-800 mb-3 ml-1 tracking-wider">
                          Top Mesh: X-Axis
                        </p>
                        <div className="space-y-4">
                          <InputGroup label={<span className="flex items-center gap-1">Bar Dia (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                            <select
                              className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 shadow-brand-sm"
                              value={diaXTop}
                              onChange={(e) => setDiaXTop(e.target.value)}
                            >
                              {[8, 10, 12, 16, 20].map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </InputGroup>
                          <InputGroup label={<span className="flex items-center gap-1">Spacing c/c (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span>}>
                            <NumberInput
                              className="w-full calc-input px-3 py-2 text-sm shadow-brand-sm transition-all"
                              value={spacingXTop}
                              onChange={(val) => setSpacingXTop(val.toString())}
                            />
                          </InputGroup>
                        </div>
                      </div>
                      <div className="p-4 bg-accent-50 rounded-2xl border border-accent-100 overflow-hidden">
                        <p className="text-base font-medium uppercase text-accent-800 mb-3 ml-1 tracking-wider">
                          Top Mesh: Y-Axis
                        </p>
                        <div className="space-y-4">
                          <InputGroup label={<span className="flex items-center gap-1">Bar Dia (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                            <select
                              className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 shadow-brand-sm"
                              value={diaYTop}
                              onChange={(e) => setDiaYTop(e.target.value)}
                            >
                              {[8, 10, 12, 16, 20].map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </InputGroup>
                          <InputGroup label={<span className="flex items-center gap-1">Spacing c/c (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span>}>
                            <NumberInput
                              className="w-full calc-input px-3 py-2 text-sm shadow-brand-sm transition-all"
                              value={spacingYTop}
                              onChange={(val) => setSpacingYTop(val.toString())}
                            />
                          </InputGroup>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Accordion>
            </div>
                <Accordion title="Structural Design (IS 456)">
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="Concrete grade (fck) — MPa">
                        <select className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={fck} onChange={(e) => setFck(e.target.value)}>
                          {[20, 25, 30, 35, 40].map((g) => (<option key={g} value={g}>M{g}</option>))}
                        </select>
                      </InputGroup>
                      <InputGroup label="Steel grade (fy) — MPa">
                        <select className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={fy} onChange={(e) => setFy(e.target.value)}>
                          {[250, 415, 500].map((g) => (<option key={g} value={g}>Fe{g}</option>))}
                        </select>
                      </InputGroup>
                      <InputGroup label="Moment about X (kNm)">
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={momentX} onChange={(val) => setMomentX(val.toString())} />
                      </InputGroup>
                      <InputGroup label="Moment about Y (kNm)">
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={momentY} onChange={(val) => setMomentY(val.toString())} />
                      </InputGroup>
                      <InputGroup label="Wastage (%)">
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={wastage} onChange={(val) => setWastage(val.toString())} />
                      </InputGroup>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-txt-primary">
                          <input type="checkbox" checked={autoDesign} onChange={(e) => setAutoDesign(e.target.checked)} className="w-5 h-5 rounded border-ui-borderDefault text-accent-800 focus:ring-accent-500" />
                          Auto-design spacing from required Ast
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <InputGroup label={`Cement (${table.currency}/bag)`}>
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                      </InputGroup>
                      <InputGroup label={`Steel (${table.currency}/kg)`}>
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
                      </InputGroup>
                      <InputGroup label={`Sand (${table.currency}/cft)`}>
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={rates.sandPerCft ?? ""} onChange={(v) => setRate("sandPerCft", v === "" ? null : Number(v))} />
                      </InputGroup>
                      <InputGroup label={`Aggregate (${table.currency}/cft)`}>
                        <NumberInput className="w-full bg-surface-default rounded-2xl border border-ui-borderSubtle text-txt-primary px-4 py-3 shadow-brand-sm" value={rates.crushPerCft ?? ""} onChange={(v) => setRate("crushPerCft", v === "" ? null : Number(v))} />
                      </InputGroup>
                    </div>
                    <p className="text-xs text-txt-tertiary mt-3">Effective depth d = {design.dMm} mm (D − cover − φ/2). Auto-design derives spacing from Ast,req so the mesh can never be under-designed by a stale default — the spacing shown in the design results ({design.spacingXMm} / {design.spacingYMm} mm) is computed from the required steel, not from a fixed default.</p>
                  </div>
                </Accordion>
              {/* Drawing & SBC Status */}
              <div>
                <div
                  className={`p-4 rounded-2xl border ${isSafe ? "bg-ui-success border-ui-successBorder" : "bg-ui-error border-ui-errorBorder"} flex items-start gap-4 mb-6 shadow-brand-sm`}
                >
                  {isSafe ? (
                    <CheckCircle className="w-6 h-6 text-ui-successText mt-1" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-ui-errorText mt-1" />
                  )}
                  <div>
                    <h4
                      className={`font-bold ${isSafe ? "text-ui-successText" : "text-ui-errorText"}`}
                    >
                      {isSafe
                        ? "Safe Bearing Capacity OK"
                        : "Bearing Capacity Exceeded"}
                    </h4>
                    <p
                      className={`text-sm mt-1 font-medium ${isSafe ? "text-ui-successText" : "text-ui-errorText"}`}
                    >
                      Required Area: {reqArea.toFixed(2)} m² | Provided Area:{" "}
                      {actualArea.toFixed(2)} m²
                    </p>
                    {!isSafe && (
                      <p className="text-base font-medium text-ui-errorText mt-2">
                        Increase footing dimensions to prevent settlement
                        failures.
                      </p>
                    )}
                  </div>
                </div>

                <div className="calc-input p-6 flex flex-col items-center justify-center min-h-[400px] shadow-brand-sm">
                  <h4 className="font-bold text-txt-tertiary uppercase tracking-wider text-sm mb-8">
                    Cross-Section Profile
                  </h4>

                  {/* Schematic SVG */}
                  <svg
                    width="100%"
                    height="280"
                    viewBox="0 0 300 240"
                    className="max-w-full overflow-visible"
                  >
                    {/* Ground line */}
                    <line
                      x1="10"
                      y1="50"
                      x2="290"
                      y2="50"
                      stroke="#8b5a2b"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <text
                      x="15"
                      y="45"
                      fill="#8b5a2b"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      G.L
                    </text>

                    {/* Excavation Pit Outline */}
                    <rect
                      x="30"
                      y="50"
                      width="240"
                      height="150"
                      fill="rgba(139, 90, 43, 0.05)"
                      stroke="#d2b48c"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />

                    {/* Centerline */}
                    <line
                      x1="150"
                      y1="20"
                      x2="150"
                      y2="220"
                      stroke="#6B6862"
                      strokeWidth="1"
                      strokeDasharray="10,5,2,5"
                    />

                    {/* Column */}
                    <rect
                      x="135"
                      y="30"
                      width="30"
                      height="130"
                      fill="#F4F2EE"
                      stroke="#6B6862"
                      strokeWidth="2"
                    />

                    {/* Footing Form */}
                    {footingType === "rectangular" && (
                      <rect
                        x="70"
                        y="160"
                        width="160"
                        height="40"
                        fill="#E7E4DE"
                        stroke="#6B6862"
                        strokeWidth="2"
                      />
                    )}
                    {footingType === "stepped" && (
                      <>
                        <rect
                          x="110"
                          y="140"
                          width="80"
                          height="20"
                          fill="#E7E4DE"
                          stroke="#6B6862"
                          strokeWidth="2"
                        />
                        <rect
                          x="70"
                          y="160"
                          width="160"
                          height="40"
                          fill="#E7E4DE"
                          stroke="#6B6862"
                          strokeWidth="2"
                        />
                      </>
                    )}
                    {footingType === "sloped" && (
                      <>
                        <polygon
                          points="110,140 190,140 230,160 70,160"
                          fill="#E7E4DE"
                          stroke="#6B6862"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="70"
                          y="160"
                          width="160"
                          height="40"
                          fill="#E7E4DE"
                          stroke="#6B6862"
                          strokeWidth="2"
                        />
                      </>
                    )}

                    {/* Rebar Mesh Line */}
                    <line
                      x1="75"
                      y1="190"
                      x2="225"
                      y2="190"
                      stroke="#F2A413"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="75"
                      y1="190"
                      x2="75"
                      y2="170"
                      stroke="#F2A413"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="225"
                      y1="190"
                      x2="225"
                      y2="170"
                      stroke="#F2A413"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Dots for cross bars */}
                    <circle cx="85" cy="190" r="2.5" fill="#855307" />
                    <circle cx="115" cy="190" r="2.5" fill="#855307" />
                    <circle cx="150" cy="190" r="2.5" fill="#855307" />
                    <circle cx="185" cy="190" r="2.5" fill="#855307" />
                    <circle cx="215" cy="190" r="2.5" fill="#855307" />

                    {hasTopMesh && (
                      <>
                        <line
                          x1="75"
                          y1="170"
                          x2="225"
                          y2="170"
                          stroke="#1F1D1A"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="75"
                          y1="170"
                          x2="75"
                          y2="190"
                          stroke="#1F1D1A"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="225"
                          y1="170"
                          x2="225"
                          y2="190"
                          stroke="#1F1D1A"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="85" cy="170" r="2.5" fill="#6B6862" />
                        <circle cx="115" cy="170" r="2.5" fill="#6B6862" />
                        <circle cx="150" cy="170" r="2.5" fill="#6B6862" />
                        <circle cx="185" cy="170" r="2.5" fill="#6B6862" />
                        <circle cx="215" cy="170" r="2.5" fill="#6B6862" />
                      </>
                    )}

                    {/* Dimension Lines */}
                    {/* Width */}
                    <path
                      d="M 70 215 L 230 215"
                      stroke="#6B6862"
                      strokeWidth="1"
                    />
                    <line
                      x1="70"
                      y1="210"
                      x2="70"
                      y2="220"
                      stroke="#6B6862"
                      strokeWidth="1"
                    />
                    <line
                      x1="230"
                      y1="210"
                      x2="230"
                      y2="220"
                      stroke="#6B6862"
                      strokeWidth="1"
                    />
                    <text
                      x="150"
                      y="230"
                      fill="#6B6862"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {fL}m (L)
                    </text>

                    {/* Depth */}
                    <path
                      d="M 55 140 L 55 200"
                      stroke="#6B6862"
                      strokeWidth="1"
                    />
                    <line
                      x1="50"
                      y1="140"
                      x2="60"
                      y2="140"
                      stroke="#6B6862"
                      strokeWidth="1"
                    />
                    <line
                      x1="50"
                      y1="200"
                      x2="60"
                      y2="200"
                      stroke="#6B6862"
                      strokeWidth="1"
                    />
                    <text
                      x="45"
                      y="174"
                      fill="#6B6862"
                      fontSize="12"
                      textAnchor="end"
                    >
                      {totalD.toFixed(2)}m
                    </text>

                    {/* Working Space */}
                    <path
                      d="M 30 215 L 70 215"
                      stroke="#6B6862"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x="50"
                      y="230"
                      fill="#6B6862"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {ws}m WS
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Structural design results */}
            <div className="pt-8 border-t border-ui-borderSubtle dark:border-ink-600 mt-6">
              <MaterialSummary title="Structural Design (IS 456)" totalLabel="Design cost (materials)" totalValue={design.totalCost == null ? "—" : design.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <ResultCard title="Factored load Pu" value={design.puKN.toFixed(0)} unit="kN" variant="neutral" />
                  <ResultCard title="Bearing pressure qu" value={design.quKNm2.toFixed(0)} unit="kN/m²" variant="neutral" />
                  <ResultCard title="Peak pressure qmax" value={design.qMaxKNm2.toFixed(0)} unit="kN/m²" variant={design.bearingOk ? "neutral" : "warning"} />
                  <ResultCard title="Punching τv" value={design.punchingTauVMpa.toFixed(2)} unit="MPa" variant={design.punchingOk ? "neutral" : "warning"} />
                  <ResultCard title="Punching allowable" value={design.punchingAllowMpa.toFixed(2)} unit="MPa" variant="neutral" />
                  <ResultCard title="One-way τv" value={design.oneWayTauVMpa.toFixed(2)} unit="MPa" variant={design.oneWayOk ? "neutral" : "warning"} />
                  <ResultCard title="One-way allowable" value={design.oneWayAllowMpa.toFixed(2)} unit="MPa" variant="neutral" />
                  <ResultCard title="Mu (X / Y)" value={`${design.muXKNm.toFixed(0)} / ${design.muYKNm.toFixed(0)}`} unit="kNm" variant="neutral" />
                  <ResultCard title="Ast req (X / Y)" value={`${Number.isFinite(design.astXReqMm2) ? design.astXReqMm2.toFixed(0) : "—"} / ${Number.isFinite(design.astYReqMm2) ? design.astYReqMm2.toFixed(0) : "—"}`} unit="mm²" variant="neutral" />
                  <ResultCard title="Ast provided (X)" value={design.astXProvidedMm2.toFixed(0)} unit="mm²" variant={design.flexureOk ? "neutral" : "warning"} />
                  <ResultCard title="Spacing X / Y" value={`${design.spacingXMm} / ${design.spacingYMm}`} unit="mm" variant="neutral" />
                  <ResultCard title="Development length Ld" value={design.ldMm.toFixed(0)} unit="mm" variant="neutral" />
                  <ResultCard title="Verdict" value={design.punchingOk && design.oneWayOk && design.flexureOk && design.bearingOk ? "SAFE" : "CHECK"} unit="" variant={design.punchingOk && design.oneWayOk && design.flexureOk && design.bearingOk ? "primary" : "warning"} />
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  {design.costLines.map((l) => (
                    <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                  ))}
                </div>
              </MaterialSummary>
              <StructuralExportBar title="Isolated Footing (IS 456)" summaryText={`Isolated footing ${fL}×${fW} m, D=${totalD.toFixed(2)} m (${footingType}); Pu=${design.puKN.toFixed(0)} kN, qu=${design.quKNm2.toFixed(0)} kN/m², qmax=${design.qMaxKNm2.toFixed(0)} kN/m² ≤ SBC ${parseFloat(sbc) || 0} (${design.bearingOk ? "PASS" : "FAIL"}); punching τv=${design.punchingTauVMpa.toFixed(2)} MPa ≤ ${design.punchingAllowMpa.toFixed(2)} (${design.punchingOk ? "PASS" : "FAIL"}); one-way τv=${design.oneWayTauVMpa.toFixed(2)} MPa (${design.oneWayOk ? "PASS" : "FAIL"}); Ast req ${Number.isFinite(design.astXReqMm2) ? design.astXReqMm2.toFixed(0) : "—"} mm², provided ${design.astXProvidedMm2.toFixed(0)} mm² @ ${design.spacingXMm} mm (${design.flexureOk ? "PASS" : "FAIL"}); concrete ${concreteVol.toFixed(2)} m³, steel ${totalSteel.toFixed(1)} kg.`}
                boqItems={[
                  { description: `Cement for isolated footing (${mix})`, quantity: design.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                  { description: "Sand for footing concrete", quantity: design.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                  { description: "Aggregate for footing concrete", quantity: design.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                  { description: `Steel reinforcement (${diaX} mm @ ${effSpacingX} mm c/c)`, quantity: totalSteel, unit: "kg", rate: rates.steelPerKg ?? 0 },
                ]}
                totalAmount={design.totalCost} />
              <CalcSteps steps={design.steps} />
            </div>

            {/* Results */}
            <div className="pt-8 border-t border-ui-borderSubtle dark:border-ink-600 mt-6">
              <MaterialSummary
                title="Output Quantities"
                totalLabel="Total Concrete Vol"
                totalValue={concreteVol.toFixed(2)}
                totalUnit="m³"
                relatedToolIds={[
                  "column-design",
                  "beam-design",
                ]}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 responsive-tool-grid">
                  <div>
                    <h4 className="font-bold text-txt-primary flex items-center gap-2 mb-4">
                      <Spade className="w-5 h-5 text-accent-700" />
                      Earthworks
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ResultCard
                        title="Excavation"
                        value={excavationVol.toFixed(2)}
                        unit="m³"
                        variant="neutral"
                      />
                      <ResultCard
                        title="Backfilling"
                        value={backfillVol.toFixed(2)}
                        unit="m³"
                        variant="neutral"
                      />
                    </div>

                    <h4 className="font-bold text-txt-primary flex items-center gap-2 mt-8 mb-4">
                      <Layers className="w-5 h-5 text-accent-800" />
                      Concrete Materials ({mix})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ResultCard
                        title="Cement"
                        value={design.materials.cementBags}
                        unit="bags"
                        variant="primary"
                      />
                      <ResultCard
                        title="Sand"
                        value={design.materials.sandCft.toFixed(1)}
                        unit="cft"
                        variant="neutral"
                      />
                      <ResultCard
                        title="Aggregate"
                        value={design.materials.aggCft.toFixed(1)}
                        unit="cft"
                        variant="neutral"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-txt-primary flex items-center gap-2 mb-4">
                      <ArrowDownToLine className="w-5 h-5 text-accent-700" />
                      Steel Reinforcement Check
                    </h4>
                    <div className="bg-surface-hover border border-ui-borderSubtle rounded-2xl overflow-hidden shadow-brand-sm">
                      <div className="p-4 bg-surface-hover border-b border-ui-borderSubtle flex justify-between items-center">
                        <span className="font-bold text-txt-secondary">
                          Total Steel Required
                        </span>
                        <span className="text-xl font-semibold tabular-nums tracking-tight text-ui-errorText">
                          {totalSteel.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="text-base font-medium uppercase tracking-wider mb-2">
                          Bottom Mesh
                        </div>
                        <div className="flex justify-between items-center border-b border-ui-borderSubtle pb-3">
                          <div>
                            <p className="font-semibold text-sm text-txt-primary">
                              X-Axis Bars
                            </p>
                            <p className="text-sm text-txt-tertiary mt-0.5">
                              {barsX} bars • Cut Length:{" "}
                              {(cutLengthX / 1000).toFixed(2)}m
                            </p>
                          </div>
                          <p className="font-bold text-txt-secondary">
                            {wtX.toFixed(2)} kg
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-b border-ui-borderSubtle pb-3">
                          <div>
                            <p className="font-semibold text-sm text-txt-primary">
                              Y-Axis Bars
                            </p>
                            <p className="text-sm text-txt-tertiary mt-0.5">
                              {barsY} bars • Cut Length:{" "}
                              {(cutLengthY / 1000).toFixed(2)}m
                            </p>
                          </div>
                          <p className="font-bold text-txt-secondary">
                            {wtY.toFixed(2)} kg
                          </p>
                        </div>

                        {hasTopMesh && (
                          <>
                            <div className="text-base font-medium text-accent-800 uppercase tracking-wider mt-4 mb-2">
                              Top Mesh
                            </div>
                            <div className="flex justify-between items-center border-b border-ui-borderSubtle pb-3">
                              <div>
                                <p className="font-semibold text-sm text-txt-primary">
                                  X-Axis Bars
                                </p>
                                <p className="text-sm text-txt-tertiary mt-0.5">
                                  {barsXTop} bars • Cut Length:{" "}
                                  {(cutLengthXTop / 1000).toFixed(2)}m
                                </p>
                              </div>
                              <p className="font-bold text-txt-secondary">
                                {wtXTop.toFixed(2)} kg
                              </p>
                            </div>
                            <div className="flex justify-between items-center pb-1">
                              <div>
                                <p className="font-semibold text-sm text-txt-primary">
                                  Y-Axis Bars
                                </p>
                                <p className="text-sm text-txt-tertiary mt-0.5">
                                  {barsYTop} bars • Cut Length:{" "}
                                  {(cutLengthYTop / 1000).toFixed(2)}m
                                </p>
                              </div>
                              <p className="font-bold text-txt-secondary">
                                {wtYTop.toFixed(2)} kg
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-accent-50 rounded-2xl border border-accent-100 overflow-hidden">
                      <p className="text-sm font-medium text-accent-800">
                        * Steel weight derived using D²/162.28. Hook lengths
                        added based on footing depths minus clear covers.
                      </p>
                    </div>
                  </div>
                </div>
              </MaterialSummary>
            </div>
          </div>
        </div>
      </div>
      <CalculationHistory
        calculatorId="isolated_footing_calc"
        estimationName={`Isolated Footing (${footingType}) Estimate`}
        currentInputs={{
          footingType,
          footingL,
          footingW,
          footingD,
          footingD1,
          footingD2,
          topL,
          topW,
          columnL,
          columnW,
          workingLoad,
          safetyFactor,
          sbc,
          mix,
          diaX,
          spacingX,
          clearCover,
          workingSpace,
          excavationDepth,
        }}
        currentResults={{
          concreteVol: concreteVol.toFixed(2),
          steelKg: totalSteel.toFixed(2),
          excavationVol: excavationVol.toFixed(2),
        }}
        summaryGeneration={(inputs, res) =>
          `Vol: ${res.concreteVol} m³ - Steel: ${res.steelKg} kg - Exc: ${res.excavationVol} m³`
        }
        onRestore={(savedInputs) => {
          if (savedInputs.footingType)
            setFootingType(savedInputs.footingType as any);
          if (savedInputs.footingL) setFootingL(savedInputs.footingL);
          if (savedInputs.footingW) setFootingW(savedInputs.footingW);
          if (savedInputs.footingD) setFootingD(savedInputs.footingD);
          if (savedInputs.footingD1) setFootingD1(savedInputs.footingD1);
          if (savedInputs.footingD2) setFootingD2(savedInputs.footingD2);
          if (savedInputs.topL) setTopL(savedInputs.topL);
          if (savedInputs.topW) setTopW(savedInputs.topW);
          if (savedInputs.columnL) setColumnL(savedInputs.columnL);
          if (savedInputs.columnW) setColumnW(savedInputs.columnW);
          if (savedInputs.workingLoad) setWorkingLoad(savedInputs.workingLoad);
          if (savedInputs.safetyFactor)
            setSafetyFactor(savedInputs.safetyFactor);
          if (savedInputs.load && !savedInputs.workingLoad) {
            setWorkingLoad((parseFloat(savedInputs.load) / 1.5).toString());
          }
          if (savedInputs.sbc) setSbc(savedInputs.sbc);
          if (savedInputs.mix) setMix(savedInputs.mix);
          if (savedInputs.diaX) setDiaX(savedInputs.diaX);
          if (savedInputs.spacingX) setSpacingX(savedInputs.spacingX);
          if (savedInputs.clearCover) setClearCover(savedInputs.clearCover);
          if (savedInputs.workingSpace)
            setWorkingSpace(savedInputs.workingSpace);
          if (savedInputs.excavationDepth)
            setExcavationDepth(savedInputs.excavationDepth);
        }}
      />
    </div>
  );
}
