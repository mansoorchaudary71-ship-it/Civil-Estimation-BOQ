import React, { useState } from "react";
import { Accordion } from "../ui/Accordion";
import { UniversalTabs } from "../ui/UniversalTabs";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
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
  const [spacingX, setSpacingX] = useState("150");
  const [diaY, setDiaY] = useState("12");
  const [spacingY, setSpacingY] = useState("150");

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

  const dryVol = concreteVol * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR; // RULE: CONCRETE_DRY_VOLUME

  // Materials
  const ratio = mixRatios[mix];
  const totalRatio = ratio ? ratio.c + ratio.s + ratio.a : 1;
  const cementM3 = (dryVol * ratio.c) / totalRatio;
  const cementBags = Math.ceil(cementM3 / CIVIL_CONSTANTS.CEMENT_BAG_VOLUME_M3);
  const sandCft = ((dryVol * ratio.s) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;
  const aggCft = ((dryVol * ratio.a) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;

  // Excavation & Backfilling
  const exL = fL + 2 * ws;
  const exW = fW + 2 * ws;
  const excavationVol = exL * exW * exD;
  const backfillVol = Math.max(
    0,
    excavationVol - concreteVol - cL * cW * Math.max(0, exD - totalD),
  );

  // Steel Reinforcement
  // Length Direction (bars placed along Width)
  const dX = parseFloat(diaX) || 0;
  const sX = parseFloat(spacingX) || 150;
  const barsX = Math.ceil((fW * 1000 - 2 * cover) / sX) + 1; // RULE: REBAR_SPACING_COUNT

  // hook length based on bottom step depth for sloped/stepped, or total depth for rect
  const edgeD = footingType === "rectangular" ? fD : Math.max(fD1, 0.15);
  const hookL = edgeD * 1000 - 2 * cover;
  const cutLengthX = fL * 1000 - 2 * cover + 2 * hookL;
  const wtX = (Math.pow(dX, 2) / 162.28) * (cutLengthX / 1000) * barsX; // RULE: STEEL_WEIGHT_ESTIMATION

  // Width Direction (bars placed along Length)
  const dY = parseFloat(diaY) || 0;
  const sY = parseFloat(spacingY) || 150;
  const barsY = Math.ceil((fL * 1000 - 2 * cover) / sY) + 1;
  const cutLengthY = fW * 1000 - 2 * cover + 2 * hookL;
  const wtY = (Math.pow(dY, 2) / 162.28) * (cutLengthY / 1000) * barsY;

  // Top Mesh
  let wtXTop = 0;
  let wtYTop = 0;
  let barsXTop = 0;
  let barsYTop = 0;
  let cutLengthXTop = 0;
  let cutLengthYTop = 0;
  if (hasTopMesh) {
    const topEdgeD = footingType === "rectangular" ? fD : fD1 + fD2;
    const topHookL = topEdgeD * 1000 - 2 * cover;

    const dXT = parseFloat(diaXTop) || 0;
    const sXT = parseFloat(spacingXTop) || 150;
    barsXTop = Math.ceil((fW * 1000 - 2 * cover) / sXT) + 1;
    cutLengthXTop = fL * 1000 - 2 * cover + 2 * topHookL;
    wtXTop = (Math.pow(dXT, 2) / 162.28) * (cutLengthXTop / 1000) * barsXTop;

    const dYT = parseFloat(diaYTop) || 0;
    const sYT = parseFloat(spacingYTop) || 150;
    barsYTop = Math.ceil((fL * 1000 - 2 * cover) / sYT) + 1;
    cutLengthYTop = fW * 1000 - 2 * cover + 2 * topHookL;
    wtYTop = (Math.pow(dYT, 2) / 162.28) * (cutLengthYTop / 1000) * barsYTop;
  }

  const totalSteel = wtX + wtY + wtXTop + wtYTop;

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
        description: `RCC Isolated Footing (${footingL}x${footingW}m, D=${totalD.toFixed(2)}m) - ${footingType}`,
        unit: "m³",
        quantity: concreteVol,
        rate: 0,
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement for Footing`,
        unit: "kg",
        quantity: totalSteel,
        rate: 0,
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
          : "w-full h-full bg-transparent text-slate-900 dark:text-white p-6 md:p-8"
      }
    >
      <div className="w-full md:max-w-5xl md:mx-auto space-y-6 px-4 md:px-0">
        {!isEmbedded && (
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex flex-col items-end gap-2">
              <GlobalSettingsToggle align="left" showCurrency={false} />
              <div className="flex gap-2">
                <button
                  onClick={sendToBOQ}
                  className="text-base font-medium px-3 py-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  Send to BOQ
                </button>
                <button
                  onClick={loadExample}
                  className="text-base font-medium px-3 py-2 bg-[#E55A2B]/10 text-[#E55A2B] rounded-full hover:bg-[#E55A2B]/20 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  Load Example
                </button>
                <button
                  onClick={resetDefault}
                  className="text-base font-medium px-3 py-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-card rounded-[24px] shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <Accordion title="Dimensions & Load" defaultOpen={true}>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-md mb-4 text-slate-700 dark:text-slate-200 pb-2">
                        Load & SBC Check
                      </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Working Load (P)">
                      <NumberInput
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
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
                          className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                          value={safetyFactor}
                          onChange={(val) => setSafetyFactor(val.toString())}
                        />
                        <button
                          onClick={handleAiSafetyFactor}
                          className="h-full min-h-[48px] px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors shadow-sm whitespace-nowrap text-sm font-medium active:scale-95 hover:-translate-y-0.5"
                        >
                          <Sparkles className="w-4 h-4 mr-1.5" /> AI Suggest
                        </button>
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
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                        value={sbc}
                        onChange={(val) => setSbc(val.toString())}
                      />
                    </InputGroup>
                  </div>
                </div>

                <div>
                      <h4 className="font-bold text-md mb-4 text-slate-700 dark:text-slate-200 pb-2">
                        Footing Details
                      </h4>
                  <InputGroup label="Footing Type" colSpan={3}>
                    <div
                      className="flex bg-slate-100 p-1 rounded-[24px] mb-4 overflow-x-auto whitespace-nowrap hide-scrollbar"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <button
                        onClick={() => setFootingType("rectangular")}
                        aria-label="Select Rectangular Footing"
                        className={`flex-none px-6 py-2 text-base font-medium rounded-[20px] transition-all ${footingType === "rectangular" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                      >
                        Rectangular
                      </button>
                      <button
                        onClick={() => setFootingType("sloped")}
                        aria-label="Select Sloped or Trapezoidal Footing"
                        className={`flex-none px-6 py-2 text-base font-medium rounded-[20px] transition-all ${footingType === "sloped" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                      >
                        Sloped/Trapezoidal
                      </button>
                      <button
                        onClick={() => setFootingType("stepped")}
                        aria-label="Select Stepped Footing"
                        className={`flex-none px-6 py-2 text-base font-medium rounded-[20px] transition-all ${footingType === "stepped" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"}`}
                      >
                        Stepped
                      </button>
                    </div>
                  </InputGroup>
                  <div className="grid grid-cols-2 gap-4 mt-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                    <InputGroup label="Base Length (m)">
                      <NumberInput
                        step="0.1"
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                        value={footingL}
                        onChange={(val) => setFootingL(val.toString())}
                      />
                    </InputGroup>
                    <InputGroup label="Base Width (m)">
                      <NumberInput
                        step="0.1"
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                        value={footingW}
                        onChange={(val) => setFootingW(val.toString())}
                      />
                    </InputGroup>

                    {footingType === "rectangular" ? (
                      <InputGroup label="Depth (m)">
                        <NumberInput
                          step="0.1"
                          className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                          value={footingD}
                          onChange={(val) => setFootingD(val.toString())}
                        />
                      </InputGroup>
                    ) : (
                      <>
                        <InputGroup label="Base Depth, D1 (m)">
                          <NumberInput
                            step="0.1"
                            className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
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
                            className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                            value={footingD2}
                            onChange={(val) => setFootingD2(val.toString())}
                          />
                        </InputGroup>

                        <InputGroup label="Top Length, A2 (m)">
                          <NumberInput
                            step="0.1"
                            className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                            value={topL}
                            onChange={(val) => setTopL(val.toString())}
                          />
                        </InputGroup>
                        <InputGroup label="Top Width, B2 (m)">
                          <NumberInput
                            step="0.1"
                            className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
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
                          className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 text-center shadow-sm transition-all overflow-hidden"
                          value={columnL}
                          onChange={(val) => setColumnL(val.toString())}
                          placeholder="L"
                        />
                        <span className="text-slate-600 self-center">×</span>
                        <NumberInput
                          step="0.1"
                          className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 text-center shadow-sm transition-all overflow-hidden"
                          value={columnW}
                          onChange={(val) => setColumnW(val.toString())}
                          placeholder="W"
                        />
                      </div>
                    </InputGroup>
                    <InputGroup label="Concrete Mix">
                      <select
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#E55A2B]/50 outline-none transition-all appearance-none shadow-sm overflow-hidden"
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
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                        value={workingSpace}
                        onChange={(val) => setWorkingSpace(val.toString())}
                      />
                    </InputGroup>
                    <InputGroup label="Excavation Depth (m)">
                      <NumberInput
                        step="0.1"
                        className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
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
                          className="w-full bg-white rounded-[24px] border border-slate-200 text-slate-800 px-4 py-3 shadow-sm transition-all overflow-hidden"
                          value={clearCover}
                          onChange={(val) => setClearCover(val.toString())}
                        />
                      </InputGroup>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                      <p className="text-base font-medium uppercase text-slate-500 mb-3 ml-1 tracking-wider">
                        Bottom Mesh: X-Axis
                      </p>
                      <div className="space-y-4">
                        <InputGroup label="Bar Dia (mm)">
                          <select
                            className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 shadow-sm"
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
                        <InputGroup label="Spacing c/c (mm)">
                          <NumberInput
                            className="w-full calc-input px-3 py-2 text-sm shadow-sm transition-all"
                            value={spacingX}
                            onChange={(val) => setSpacingX(val.toString())}
                          />
                        </InputGroup>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                      <p className="text-base font-medium uppercase text-slate-500 mb-3 ml-1 tracking-wider">
                        Bottom Mesh: Y-Axis
                      </p>
                      <div className="space-y-4">
                        <InputGroup label="Bar Dia (mm)">
                          <select
                            className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 shadow-sm"
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
                        <InputGroup label="Spacing c/c (mm)">
                          <NumberInput
                            className="w-full calc-input px-3 py-2 text-sm shadow-sm transition-all"
                            value={spacingY}
                            onChange={(val) => setSpacingY(val.toString())}
                          />
                        </InputGroup>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-100 border border-slate-200 rounded-[24px] overflow-hidden">
                      <>
                        <label htmlFor="a11y-input-309" className="sr-only">
                          Input
                        </label>
                        <input
                          id="a11y-input-309"
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={hasTopMesh}
                          onChange={(e) => setHasTopMesh(e.target.checked)}
                        />
                      </>
                      <span className="font-bold text-slate-800">
                        Include Top Mesh
                      </span>
                    </label>
                  </div>

                  {hasTopMesh && (
                    <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-indigo-50/50 rounded-[24px] border border-indigo-100 overflow-hidden">
                        <p className="text-base font-medium uppercase text-indigo-700 mb-3 ml-1 tracking-wider">
                          Top Mesh: X-Axis
                        </p>
                        <div className="space-y-4">
                          <InputGroup label="Bar Dia (mm)">
                            <select
                              className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 shadow-sm"
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
                          <InputGroup label="Spacing c/c (mm)">
                            <NumberInput
                              className="w-full calc-input px-3 py-2 text-sm shadow-sm transition-all"
                              value={spacingXTop}
                              onChange={(val) => setSpacingXTop(val.toString())}
                            />
                          </InputGroup>
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-50/50 rounded-[24px] border border-indigo-100 overflow-hidden">
                        <p className="text-base font-medium uppercase text-indigo-700 mb-3 ml-1 tracking-wider">
                          Top Mesh: Y-Axis
                        </p>
                        <div className="space-y-4">
                          <InputGroup label="Bar Dia (mm)">
                            <select
                              className="w-full calc-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 shadow-sm"
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
                          <InputGroup label="Spacing c/c (mm)">
                            <NumberInput
                              className="w-full calc-input px-3 py-2 text-sm shadow-sm transition-all"
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
              {/* Drawing & SBC Status */}
              <div>
                <div
                  className={`p-4 rounded-[24px] border ${isSafe ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"} flex items-start gap-4 mb-6 shadow-sm`}
                >
                  {isSafe ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-600 mt-1" />
                  )}
                  <div>
                    <h4
                      className={`font-bold ${isSafe ? "text-emerald-800" : "text-rose-800"}`}
                    >
                      {isSafe
                        ? "Safe Bearing Capacity OK"
                        : "Bearing Capacity Exceeded"}
                    </h4>
                    <p
                      className={`text-sm mt-1 font-medium ${isSafe ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      Required Area: {reqArea.toFixed(2)} m² | Provided Area:{" "}
                      {actualArea.toFixed(2)} m²
                    </p>
                    {!isSafe && (
                      <p className="text-base font-medium text-rose-600 mt-2">
                        Increase footing dimensions to prevent settlement
                        failures.
                      </p>
                    )}
                  </div>
                </div>

                <div className="calc-input p-6 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-sm mb-8">
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
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="10,5,2,5"
                    />

                    {/* Column */}
                    <rect
                      x="135"
                      y="30"
                      width="30"
                      height="130"
                      fill="#e2e8f0"
                      stroke="#64748b"
                      strokeWidth="2"
                    />

                    {/* Footing Form */}
                    {footingType === "rectangular" && (
                      <rect
                        x="70"
                        y="160"
                        width="160"
                        height="40"
                        fill="#cbd5e1"
                        stroke="#475569"
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
                          fill="#cbd5e1"
                          stroke="#475569"
                          strokeWidth="2"
                        />
                        <rect
                          x="70"
                          y="160"
                          width="160"
                          height="40"
                          fill="#cbd5e1"
                          stroke="#475569"
                          strokeWidth="2"
                        />
                      </>
                    )}
                    {footingType === "sloped" && (
                      <>
                        <polygon
                          points="110,140 190,140 230,160 70,160"
                          fill="#cbd5e1"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <rect
                          x="70"
                          y="160"
                          width="160"
                          height="40"
                          fill="#cbd5e1"
                          stroke="#475569"
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
                      stroke="#f43f5e"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="75"
                      y1="190"
                      x2="75"
                      y2="170"
                      stroke="#f43f5e"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="225"
                      y1="190"
                      x2="225"
                      y2="170"
                      stroke="#f43f5e"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Dots for cross bars */}
                    <circle cx="85" cy="190" r="2.5" fill="#1e1b4b" />
                    <circle cx="115" cy="190" r="2.5" fill="#1e1b4b" />
                    <circle cx="150" cy="190" r="2.5" fill="#1e1b4b" />
                    <circle cx="185" cy="190" r="2.5" fill="#1e1b4b" />
                    <circle cx="215" cy="190" r="2.5" fill="#1e1b4b" />

                    {hasTopMesh && (
                      <>
                        <line
                          x1="75"
                          y1="170"
                          x2="225"
                          y2="170"
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="75"
                          y1="170"
                          x2="75"
                          y2="190"
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="225"
                          y1="170"
                          x2="225"
                          y2="190"
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <circle cx="85" cy="170" r="2.5" fill="#312e81" />
                        <circle cx="115" cy="170" r="2.5" fill="#312e81" />
                        <circle cx="150" cy="170" r="2.5" fill="#312e81" />
                        <circle cx="185" cy="170" r="2.5" fill="#312e81" />
                        <circle cx="215" cy="170" r="2.5" fill="#312e81" />
                      </>
                    )}

                    {/* Dimension Lines */}
                    {/* Width */}
                    <path
                      d="M 70 215 L 230 215"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <line
                      x1="70"
                      y1="210"
                      x2="70"
                      y2="220"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <line
                      x1="230"
                      y1="210"
                      x2="230"
                      y2="220"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x="150"
                      y="230"
                      fill="#64748b"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {fL}m (L)
                    </text>

                    {/* Depth */}
                    <path
                      d="M 55 140 L 55 200"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <line
                      x1="50"
                      y1="140"
                      x2="60"
                      y2="140"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <line
                      x1="50"
                      y1="200"
                      x2="60"
                      y2="200"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x="45"
                      y="174"
                      fill="#64748b"
                      fontSize="12"
                      textAnchor="end"
                    >
                      {totalD.toFixed(2)}m
                    </text>

                    {/* Working Space */}
                    <path
                      d="M 30 215 L 70 215"
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x="50"
                      y="230"
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {ws}m WS
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700 mt-6">
              <MaterialSummary
                title="Output Quantities"
                totalLabel="Total Concrete Vol"
                totalValue={concreteVol.toFixed(2)}
                totalUnit="m³"
                relatedToolIds={[
                  "column-estimator",
                  "beam-calc",
                  "concrete-mix",
                ]}
                onRecalculate={() => {
                  // This is a minimal demo trigger for the recalculate visual feedback
                  // Since React state instantly updates, we don't 'actually' need to do anything here for this tool
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <Spade className="w-5 h-5 text-amber-600" />
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

                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mt-8 mb-4">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      Concrete Materials ({mix})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ResultCard
                        title="Cement"
                        value={cementBags}
                        unit="bags"
                        variant="primary"
                      />
                      <ResultCard
                        title="Sand"
                        value={sandCft.toFixed(1)}
                        unit="cft"
                        variant="neutral"
                      />
                      <ResultCard
                        title="Aggregate"
                        value={aggCft.toFixed(1)}
                        unit="cft"
                        variant="neutral"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <ArrowDownToLine className="w-5 h-5 text-[#f43f5e]" />
                      Steel Reinforcement Check
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
                      <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-slate-700">
                          Total Steel Required
                        </span>
                        <span className="text-xl font-semibold tabular-nums tracking-tight text-rose-600">
                          {totalSteel.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="text-base font-medium uppercase tracking-wider mb-2">
                          Bottom Mesh
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <div>
                            <p className="font-semibold text-sm text-slate-800">
                              X-Axis Bars
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {barsX} bars • Cut Length:{" "}
                              {(cutLengthX / 1000).toFixed(2)}m
                            </p>
                          </div>
                          <p className="font-bold text-slate-700">
                            {wtX.toFixed(2)} kg
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <div>
                            <p className="font-semibold text-sm text-slate-800">
                              Y-Axis Bars
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {barsY} bars • Cut Length:{" "}
                              {(cutLengthY / 1000).toFixed(2)}m
                            </p>
                          </div>
                          <p className="font-bold text-slate-700">
                            {wtY.toFixed(2)} kg
                          </p>
                        </div>

                        {hasTopMesh && (
                          <>
                            <div className="text-base font-medium text-indigo-500 uppercase tracking-wider mt-4 mb-2">
                              Top Mesh
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                              <div>
                                <p className="font-semibold text-sm text-slate-800">
                                  X-Axis Bars
                                </p>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  {barsXTop} bars • Cut Length:{" "}
                                  {(cutLengthXTop / 1000).toFixed(2)}m
                                </p>
                              </div>
                              <p className="font-bold text-slate-700">
                                {wtXTop.toFixed(2)} kg
                              </p>
                            </div>
                            <div className="flex justify-between items-center pb-1">
                              <div>
                                <p className="font-semibold text-sm text-slate-800">
                                  Y-Axis Bars
                                </p>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  {barsYTop} bars • Cut Length:{" "}
                                  {(cutLengthYTop / 1000).toFixed(2)}m
                                </p>
                              </div>
                              <p className="font-bold text-slate-700">
                                {wtYTop.toFixed(2)} kg
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-indigo-50 rounded-[24px] border border-indigo-100 overflow-hidden">
                      <p className="text-sm font-medium text-indigo-800">
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
