import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  AREA_UNIT_TO_M2,
  BOND_PATTERNS,
  BRICK_PRESETS,
  THICKNESS_PRESETS,
  arcLengthM,
  bricksPerArea,
  budgetMode,
  calcBrickProject,
  calcBrickwork,
  calcBrickworkFromArea,
  calcLabourCost,
  convertLength,
  courseCount,
  DEFAULT_CEMENT_BAG_KG,
  formatInt,
  formatMoney,
  gableTriangleAreaM2,
  CURRENCY_META,
  INDICATIVE_LABOUR_PER_1000,
  INDICATIVE_RATES,
  LENGTH_UNITS,
  LENGTH_UNIT_TO_M,
  packingFor,
  parseLengthValue,
  rateStrip,
  reverseBricksToArea,
  defaultBrickInputs,
  type BondPattern,
  type BrickInputs,
  type BrickPreset,
  type BrickResults,
  type BrickWallInput,
  type BudgetResult,
  type Currency,
  type LabourBasis,
  type LengthUnit,
  type OpeningInput,
} from "../../lib/brickCalc";
import BrickWallVisualizer, { type VisualizerOpening } from "./BrickWallVisualizer";
import { ResultCard } from "../ui/ResultCard";
import { GenericExportButtons } from "../ui/GenericExportButtons";
import {
  Calculator,
  Check,
  ChevronDown,
  Copy,
  Download,
  Info,
  Layers,
  Plus,
  Printer,
  RotateCcw,
  Save,
  History,
  Share2,
  Trash2,
} from "lucide-react";
import { CalculationHistory } from '../ui/CalculationHistory';

const MIX_PRESETS: { id: string; label: string; mix: [number, number] }[] = [
  { id: "1:3", label: "1:3 — load-bearing", mix: [1, 3] },
  { id: "1:4", label: "1:4 — general (standard)", mix: [1, 4] },
  { id: "1:5", label: "1:5 — general (lean)", mix: [1, 5] },
  { id: "1:6", label: "1:6 — partitions / lean", mix: [1, 6] },
  { id: "custom", label: "Custom mix", mix: [1, 4] },
];

const WASTAGE_PILLS = [0, 5, 10, 15];

/** Generic indicative defaults per currency (Nov 2026, sourced in brickCalc.ts). City pages override these. */
export const DEFAULT_RATES = INDICATIVE_RATES;

export const DEFAULT_PACK_SIZE = 500;
export const DEFAULT_PALLET_SIZE = 500;

type RatesState = Record<Currency, { brick: string; cement: string; sand: string }>;

function ratesToStrings(r: {
  brickPer1000: number | null;
  cementPerBag: number | null;
  sandPerUnit: number | null;
}): { brick: string; cement: string; sand: string } {
  return {
    brick: r.brickPer1000 != null ? String(r.brickPer1000) : "",
    cement: r.cementPerBag != null ? String(r.cementPerBag) : "",
    sand: r.sandPerUnit != null ? String(r.sandPerUnit) : "",
  };
}

export interface BrickCalculatorProps {
  /** Prefill from a programmatic variant (city / type / size page). */
  initial?: Partial<BrickInputs> & { ratesNote?: string };
  /** Note shown under the rates (source + date). */
  ratesNote?: string;
}

const inputCls =
  "w-full bg-bg-card/80 border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500 hover:border-accent-300 shadow-brand-sm transition-all";
const labelCls =
  "block uppercase tracking-widest text-sm font-medium text-txt-secondary mb-2";
const selectCls =
  "w-full appearance-none bg-bg-card/80 border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-2xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-accent-500 hover:border-accent-300 shadow-brand-sm transition-all cursor-pointer font-semibold";

type CalcMode = "single" | "multi" | "area" | "reverse" | "budget";
type WallShape = "rect" | "gable" | "curved";
type OpeningsMode = "list" | "total";
type AreaUnit = "sqft" | "m2";

let openingSeq = 0;
const newOpening = (kind: OpeningInput["kind"]): OpeningInput => ({
  id: `op-${++openingSeq}-${Date.now()}`,
  kind,
  length: kind === "door" ? 3 : 4,
  height: kind === "door" ? 7 : 4,
  count: 1,
});

let wallSeq = 0;
const newWall = (n: number): WallState => ({
  id: `wall-${++wallSeq}-${Date.now()}`,
  name: `Wall ${n}`,
  length: "10",
  height: "10",
  thicknessId: "t230",
  thicknessMm: "230",
  openings: [],
  openingsMode: "list",
  openingsTotal: "",
});

interface WallState {
  id: string;
  name: string;
  length: string;
  height: string;
  thicknessId: string;
  thicknessMm: string;
  openings: OpeningInput[];
  openingsMode: OpeningsMode;
  openingsTotal: string;
}

/**
 * Format a unit-converted value written back into input state. Keeps full
 * precision (6 dp only cleans up float noise) — rounding here used to
 * inflate quantities on a round trip (10 ft -> 3.05 m -> 10.01 ft, so a
 * 10x10 ft wall went from 917 to 919 bricks). Round only for display,
 * at the point of rendering.
 */
const fmtConverted = (v: number): string => {
  if (!isFinite(v)) return "0";
  return String(Math.round(v * 1e6) / 1e6);
};

/** Display-only 2 dp formatting for an input echo, never fed back into the engine. */
const fmtDisplay2dp = (v: number): string => {
  if (!isFinite(v)) return "0";
  return String(Math.round(v * 100) / 100);
};

const num = (s: string): number => {
  const v = parseFloat(s);
  return isFinite(v) ? v : 0;
};

function OpeningsEditor({
  openings,
  setOpenings,
  openingsMode,
  setOpeningsMode,
  openingsTotal,
  setOpeningsTotal,
  lengthUnit,
  idPrefix,
}: {
  openings: OpeningInput[];
  setOpenings: (next: OpeningInput[]) => void;
  openingsMode: OpeningsMode;
  setOpeningsMode: (m: OpeningsMode) => void;
  openingsTotal: string;
  setOpeningsTotal: (v: string) => void;
  lengthUnit: LengthUnit;
  idPrefix: string;
}) {
  const areaLabel = lengthUnit === "ft" ? "sq ft" : lengthUnit === "m" ? "m²" : `${lengthUnit}²`;
  return (
    <div>
      <div
        className="grid grid-cols-2 gap-1 p-1 mb-3 rounded-full border border-ui-borderSubtle bg-accent-50 dark:bg-accent-900/20 pill-grid-2"
        role="group"
        aria-label="Openings entry mode"
      >
        <button
          type="button"
          onClick={() => setOpeningsMode("list")}
          aria-pressed={openingsMode === "list"}
          className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
            openingsMode === "list"
              ? "bg-ink text-white shadow-sm"
              : "text-txt-secondary hover:text-txt-primary"
          }`}
        >
          Per opening
        </button>
        <button
          type="button"
          onClick={() => setOpeningsMode("total")}
          aria-pressed={openingsMode === "total"}
          className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
            openingsMode === "total"
              ? "bg-ink text-white shadow-sm"
              : "text-txt-secondary hover:text-txt-primary"
          }`}
        >
          Total area
        </button>
      </div>
      {openingsMode === "total" ? (
        <div>
          <label htmlFor={`${idPrefix}-openings-total`} className={labelCls}>
            Total openings area ({areaLabel})
          </label>
          <input
            id={`${idPrefix}-openings-total`}
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={openingsTotal}
            onChange={(e) => setOpeningsTotal(e.target.value)}
            className={inputCls}
            placeholder="e.g. 21"
          />
          <p className="text-sm text-txt-tertiary mt-2">
            One total for all doors and windows. Switching to per-opening uses the list
            instead of this total.
          </p>
        </div>
      ) : (
        <>
          {openings.length === 0 && (
            <p className="text-sm text-txt-secondary bg-accent-50 dark:bg-accent-900/20 rounded-2xl px-4 py-3">
              No openings yet — the full wall is counted as brickwork.
            </p>
          )}
          <div className="space-y-3">
            {openings.map((op, i) => (
              <div
                key={op.id}
                className="grid grid-cols-12 gap-2 items-end bg-bg-card/60 border border-ui-borderSubtle rounded-2xl p-3"
              >
                <div className="col-span-3">
                  <label className={labelCls} htmlFor={`${idPrefix}-op-kind-${op.id}`}>
                    Type
                  </label>
                  <select
                    id={`${idPrefix}-op-kind-${op.id}`}
                    value={op.kind}
                    onChange={(e) =>
                      setOpenings(
                        openings.map((p, j) =>
                          j === i ? { ...p, kind: e.target.value as OpeningInput["kind"] } : p,
                        ),
                      )
                    }
                    className={selectCls}
                  >
                    <option value="door">Door</option>
                    <option value="window">Window</option>
                    <option value="other">Opening</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className={labelCls} htmlFor={`${idPrefix}-op-len-${op.id}`}>
                    Length ({lengthUnit})
                  </label>
                  <input
                    id={`${idPrefix}-op-len-${op.id}`}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={op.length}
                    onChange={(e) =>
                      setOpenings(
                        openings.map((p, j) =>
                          j === i ? { ...p, length: parseFloat(e.target.value) || 0 } : p,
                        ),
                      )
                    }
                    className={inputCls}
                  />
                </div>
                <div className="col-span-3">
                  <label className={labelCls} htmlFor={`${idPrefix}-op-h-${op.id}`}>
                    Height ({lengthUnit})
                  </label>
                  <input
                    id={`${idPrefix}-op-h-${op.id}`}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={op.height}
                    onChange={(e) =>
                      setOpenings(
                        openings.map((p, j) =>
                          j === i ? { ...p, height: parseFloat(e.target.value) || 0 } : p,
                        ),
                      )
                    }
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls} htmlFor={`${idPrefix}-op-n-${op.id}`}>
                    Count
                  </label>
                  <input
                    id={`${idPrefix}-op-n-${op.id}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={op.count}
                    onChange={(e) =>
                      setOpenings(
                        openings.map((p, j) =>
                          j === i ? { ...p, count: parseInt(e.target.value, 10) || 1 } : p,
                        ),
                      )
                    }
                    className={inputCls}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenings(openings.filter((_, j) => j !== i))}
                    aria-label="Remove opening"
                    className="p-2.5 rounded-full text-ui-errorText hover:bg-ui-error dark:hover:bg-ui-error/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => setOpenings([...openings, newOpening("door")])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add door (3 × 7 {lengthUnit})
            </button>
            <button
              type="button"
              onClick={() => setOpenings([...openings, newOpening("window")])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add window (4 × 4 {lengthUnit})
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Section through the wall (Avenir-style): how many brick leaves the
 * thickness holds, drawn to scale from the real brick width + joint.
 * Pure inline SVG — no images, no deps.
 */
function WallSectionDiagram({
  thicknessMm,
  brick,
  jointMm,
}: {
  thicknessMm: number;
  brick: { l: number; w: number; h: number };
  jointMm: number;
}) {
  const leafW = Math.max(1, brick.w + jointMm);
  const leaves = Math.max(1, Math.round(thicknessMm / leafW));
  const shownThickness = leaves * leafW;
  const scale = 200 / Math.max(shownThickness, 1);
  const leafPx = leafW * scale;
  const heightPx = 64;
  return (
    <div
      className="bg-bg-card border border-ui-borderSubtle dark:border-ink-600 rounded-2xl px-4 py-3"
      role="img"
      aria-label={`Section through the wall: ${leaves} brick ${leaves === 1 ? "leaf" : "leaves"}, ${thicknessMm} mm thick`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-txt-secondary mb-2">
        Section through the wall
      </p>
      <svg viewBox="0 0 260 84" className="w-full h-auto" aria-hidden="true">
        {Array.from({ length: leaves }, (_, i) => (
          <g key={i}>
            <rect
              x={30 + i * leafPx}
              y={10}
              width={leafPx}
              height={heightPx}
              fill="#F2A413"
              fillOpacity="0.12"
              stroke="#F2A413"
              strokeWidth="1.5"
            />
            <line
              x1={30 + i * leafPx + leafPx / 2}
              y1={10}
              x2={30 + i * leafPx + leafPx / 2}
              y2={10 + heightPx}
              stroke="#F2A413"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </g>
        ))}
        <line x1={30} y1={78} x2={30 + leaves * leafPx} y2={78} stroke="currentColor" strokeWidth="1" />
        <text x={30 + (leaves * leafPx) / 2} y={78} textAnchor="middle" fontSize="9" fill="currentColor" dy="-4">
          {thicknessMm} mm · {leaves} {leaves === 1 ? "leaf" : "leaves"}
        </text>
      </svg>
      <p className="text-xs text-txt-tertiary mt-1">
        {leaves === 1
          ? "Single leaf — a partition wall. One brick wide, no cavity."
          : `${leaves} leaves bonded together — the leaves share the load, so the count is the same whatever the bond.`}
      </p>
    </div>
  );
}

export default function BrickCalculator({ initial, ratesNote }: BrickCalculatorProps) {
  const initialCurrency: Currency = initial?.currency ?? "PKR";
  const initialRates: RatesState = {
    PKR: ratesToStrings(INDICATIVE_RATES.PKR),
    INR: ratesToStrings(INDICATIVE_RATES.INR),
    AED: ratesToStrings(INDICATIVE_RATES.AED),
    GBP: ratesToStrings(INDICATIVE_RATES.GBP),
    USD: ratesToStrings(INDICATIVE_RATES.USD),
  };
  if (initial?.rates) {
    initialRates[initialCurrency] = {
      brick: initial.rates.brickPer1000 != null ? String(initial.rates.brickPer1000) : "",
      cement: initial.rates.cementPerBag != null ? String(initial.rates.cementPerBag) : "",
      sand: initial.rates.sandPerUnit != null ? String(initial.rates.sandPerUnit) : "",
    };
  }

  // --- quick mode (Enviraj shape: three inputs, bricks only) ---
  const [quickLength, setQuickLength] = useState<string>("10");
  const [quickHeight, setQuickHeight] = useState<string>("10");
  const [quickThicknessId, setQuickThicknessId] = useState<string>("t230");

  // --- wall shape (single mode): rectangular / gable end / curved ---
  const [shape, setShape] = useState<WallShape>("rect");
  const [gableRise, setGableRise] = useState<string>("3");
  const [curveRadius, setCurveRadius] = useState<string>("6");
  const [curveAngle, setCurveAngle] = useState<string>("90");

  // --- reverse / budget modes ---
  const [reverseBricks, setReverseBricks] = useState<string>("1000");
  const [budgetArea, setBudgetArea] = useState<string>("100");
  const [budgetAreaUnit, setBudgetAreaUnit] = useState<AreaUnit>("sqft");
  const [budgetAmount, setBudgetAmount] = useState<string>("20000");

  // --- ordering: packs / pallets / trucks ---
  const [packSize, setPackSize] = useState<string>(String(DEFAULT_PACK_SIZE));
  const [palletSize, setPalletSize] = useState<string>(String(DEFAULT_PALLET_SIZE));
  const [truckCapacity, setTruckCapacity] = useState<string>("");

  // --- optional labour cost (off by default; materials total is unchanged) ---
  const [labourOn, setLabourOn] = useState<boolean>(false);
  const [labourBasis, setLabourBasis] = useState<LabourBasis>("per1000");
  const [labourRate, setLabourRate] = useState<string>(
    INDICATIVE_LABOUR_PER_1000[initialCurrency] != null
      ? String(INDICATIVE_LABOUR_PER_1000[initialCurrency])
      : "",
  );
  const [labourDays, setLabourDays] = useState<string>("5");

  // --- mortar & bond details: collapsed on small screens (Omni-style gate) ---
  const [mortarOpen, setMortarOpen] = useState<boolean>(
    () => typeof window === "undefined" || window.innerWidth >= 1024,
  );

  // --- mode ---
  const [mode, setMode] = useState<CalcMode>("single");

  // --- single-wall state (preserved when switching modes) ---
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>(initial?.lengthUnit ?? "ft");
  const [length, setLength] = useState<string>(String(initial?.length ?? 10));
  const [height, setHeight] = useState<string>(String(initial?.height ?? 10));
  const [thicknessId, setThicknessId] = useState<string>("t230");
  const [thicknessMm, setThicknessMm] = useState<string>(String(initial?.thicknessMm ?? 230));
  const [openings, setOpenings] = useState<OpeningInput[]>(initial?.openings ?? []);
  const [openingsMode, setOpeningsMode] = useState<OpeningsMode>("list");
  const [openingsTotal, setOpeningsTotal] = useState<string>("");

  // --- multi-wall state ---
  const [walls, setWalls] = useState<WallState[]>([newWall(1)]);
  const [previewWallId, setPreviewWallId] = useState<string>(walls[0].id);

  // --- total-area state ---
  const [area, setArea] = useState<string>("100");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("sqft");
  const [areaOpenings, setAreaOpenings] = useState<string>("");
  const [areaThicknessId, setAreaThicknessId] = useState<string>("t230");
  const [areaThicknessMm, setAreaThicknessMm] = useState<string>("230");

  // --- shared settings ---
  const [brickId, setBrickId] = useState<string>(initial?.brick?.id ?? "pk-awwal");
  const [customBrickMm, setCustomBrickMm] = useState({ l: 230, w: 110, h: 75 });
  const [customBrickUnit, setCustomBrickUnit] = useState<"mm" | "in">("mm");
  const [jointMm, setJointMm] = useState<string>("10");
  const [bond, setBond] = useState<BondPattern>("english");
  const [wastagePreset, setWastagePreset] = useState<number | "custom">(5);
  const [wastageCustom, setWastageCustom] = useState<string>("7");
  const [mixId, setMixId] = useState<string>("1:4");
  const [cementParts, setCementParts] = useState<string>("1");
  const [sandParts, setSandParts] = useState<string>("4");
  const [cementBagKg, setCementBagKg] = useState<string>(
    String(initial?.cementBagKg ?? DEFAULT_CEMENT_BAG_KG[initialCurrency]),
  );
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [ratesByCurrency, setRatesByCurrency] = useState<RatesState>(initialRates);
  const [costOpen, setCostOpen] = useState<boolean>(
    () => typeof window === "undefined" || window.innerWidth >= 1024,
  );
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const brick: BrickPreset = BRICK_PRESETS.find((p) => p.id === brickId) ?? BRICK_PRESETS[0];
  const wastagePct = wastagePreset === "custom" ? num(wastageCustom) : wastagePreset;
  const rates = ratesByCurrency[currency];
  const brickPrice = rates.brick;
  const cementPrice = rates.cement;
  const sandPrice = rates.sand;

  const setRate = (key: "brick" | "cement" | "sand", value: string) =>
    setRatesByCurrency((prev) => ({ ...prev, [currency]: { ...prev[currency], [key]: value } }));

  const sharedSettings = useMemo(
    () => ({
      brick,
      customBrick: brickId === "custom" ? customBrickMm : undefined,
      jointMm: num(jointMm),
      wastagePct,
      mix: [num(cementParts) || 1, num(sandParts) || 4] as [number, number],
      cementBagKg: num(cementBagKg) || 50,
      currency,
      rates: {
        brickPer1000: brickPrice === "" ? null : parseFloat(brickPrice) || null,
        cementPerBag: cementPrice === "" ? null : parseFloat(cementPrice) || null,
        sandPerUnit: sandPrice === "" ? null : parseFloat(sandPrice) || null,
      },
    }),
    [brick, brickId, customBrickMm, jointMm, wastagePct, cementParts, sandParts, cementBagKg, currency, brickPrice, cementPrice, sandPrice],
  );

  /** Convert every length value when the unit switcher changes — values are converted, never relabelled. */
  const onLengthUnitChange = (u: LengthUnit) => {
    if (u === lengthUnit) return;
    // parseLengthValue understands ft+in notation (10'6"), so a composite
    // entry converts as a whole instead of losing the inches.
    const conv = (s: string) => fmtConverted(convertLength(parseLengthValue(s, lengthUnit), lengthUnit, u));
    const areaFactor = Math.pow(LENGTH_UNIT_TO_M[lengthUnit] / LENGTH_UNIT_TO_M[u], 2);
    const convOpenings = (ops: OpeningInput[]) =>
      ops.map((o) => ({
        ...o,
        length: parseFloat(fmtConverted(convertLength(o.length, lengthUnit, u))) || 0,
        height: parseFloat(fmtConverted(convertLength(o.height, lengthUnit, u))) || 0,
      }));
    setLength(conv(length));
    setHeight(conv(height));
    setOpenings(convOpenings(openings));
    setOpeningsTotal(fmtConverted(num(openingsTotal) * areaFactor));
    setWalls((prev) =>
      prev.map((w) => ({
        ...w,
        length: conv(w.length),
        height: conv(w.height),
        openings: convOpenings(w.openings),
        openingsTotal: fmtConverted(num(w.openingsTotal) * areaFactor),
      })),
    );
    setLengthUnit(u);
  };

  const onThicknessChange = (id: string) => {
    setThicknessId(id);
    const preset = THICKNESS_PRESETS.find((t) => t.id === id);
    if (preset && id !== "tcustom") setThicknessMm(String(preset.mm));
  };

  const onAreaThicknessChange = (id: string) => {
    setAreaThicknessId(id);
    const preset = THICKNESS_PRESETS.find((t) => t.id === id);
    if (preset && id !== "tcustom") setAreaThicknessMm(String(preset.mm));
  };

  const onWallThicknessChange = (wallId: string, id: string) => {
    const preset = THICKNESS_PRESETS.find((t) => t.id === id);
    setWalls((prev) =>
      prev.map((w) =>
        w.id === wallId
          ? { ...w, thicknessId: id, thicknessMm: preset && id !== "tcustom" ? String(preset.mm) : w.thicknessMm }
          : w,
      ),
    );
  };

  const updateWall = (wallId: string, patch: Partial<WallState>) =>
    setWalls((prev) => prev.map((w) => (w.id === wallId ? { ...w, ...patch } : w)));

  const wallToInput = (w: WallState): BrickWallInput => ({
    id: w.id,
    name: w.name || "Wall",
    length: parseLengthValue(w.length, lengthUnit),
    height: parseLengthValue(w.height, lengthUnit),
    lengthUnit,
    thicknessMm: num(w.thicknessMm),
    openings: w.openingsMode === "list" ? w.openings : [],
    openingsTotalAreaM2:
      w.openingsMode === "total"
        ? num(w.openingsTotal) * Math.pow(LENGTH_UNIT_TO_M[lengthUnit], 2)
        : null,
  });

  type Computed =
    | { ok: false; error: string }
    | {
        ok: true;
        results: BrickResults;
        perWall?: { wall: BrickWallInput; results: BrickResults }[];
        reverse?: { bricks: number; areaM2: number; areaSqFt: number };
        budget?: BudgetResult;
        visualizer: {
          lengthM: number;
          heightM: number;
          thicknessMm: number;
          openings: VisualizerOpening[];
          ariaLabel: string;
        };
      };

  const computed: Computed = useMemo(() => {
    const toM = LENGTH_UNIT_TO_M[lengthUnit];
    const brickDims =
      brickId === "custom" ? customBrickMm : { l: brick.l, w: brick.w, h: brick.h };
    if (!(brickDims.l > 0 && brickDims.w > 0 && brickDims.h > 0))
      return { ok: false, error: "Enter a brick size greater than zero in every dimension." };
    if (!(num(jointMm) >= 0))
      return { ok: false, error: "Enter a mortar joint thickness of zero or more." };
    if (!(num(cementParts) > 0 && num(sandParts) > 0))
      return { ok: false, error: "Enter a mortar mix with both parts greater than zero." };
    if (!(num(cementBagKg) > 0))
      return { ok: false, error: "Enter a cement bag size greater than zero." };

    if (mode === "single") {
      // Length/height accept ft+in notation (10'6") as well as plain numbers.
      const lenL = parseLengthValue(length, lengthUnit);
      const lenH = parseLengthValue(height, lengthUnit);
      // Curved wall: the length is the centre-line arc, not a straight run.
      const effLength =
        shape === "curved"
          ? arcLengthM(num(curveRadius) * toM, num(curveAngle)) / toM
          : lenL;
      if (!(effLength > 0 && lenH > 0))
        return { ok: false, error: "Enter a wall length and height greater than zero." };
      if (!(num(thicknessMm) > 0))
        return { ok: false, error: "Enter a wall thickness greater than zero." };
      // Gable end: the triangle (base × rise ÷ 2) is extra wall area.
      const extraAreaM2 =
        shape === "gable"
          ? gableTriangleAreaM2(lenL * toM, num(gableRise) * toM)
          : null;
      const inputs: BrickInputs = {
        length: effLength,
        height: lenH,
        lengthUnit,
        thicknessMm: num(thicknessMm),
        openings: openingsMode === "list" ? openings : [],
        openingsTotalAreaM2:
          openingsMode === "total"
            ? num(openingsTotal) * Math.pow(toM, 2)
            : null,
        extraAreaM2,
        brick,
        customBrick: brickId === "custom" ? customBrickMm : undefined,
        jointMm: num(jointMm),
        wastagePct,
        mix: [num(cementParts) || 1, num(sandParts) || 4],
        cementBagKg: num(cementBagKg) || 50,
        currency,
        rates: sharedSettings.rates,
      };
      const results = calcBrickwork(inputs);
      if (results.openingsExceedWall)
        return {
          ok: false,
          error: `Openings (${results.openingsAreaSqFt.toFixed(1)} sq ft) are larger than the wall (${results.grossAreaSqFt.toFixed(1)} sq ft) — reduce the openings or enlarge the wall.`,
        };
      const vizOpenings: VisualizerOpening[] =
        openingsMode === "list"
          ? openings.map((o) => ({ kind: o.kind, lengthM: o.length * toM, heightM: o.height * toM, count: o.count }))
          : num(openingsTotal) > 0
            ? [
                {
                  kind: "other" as const,
                  lengthM: Math.min(Math.sqrt(num(openingsTotal) * toM * toM), effLength * toM * 0.9),
                  heightM: Math.min(
                    (num(openingsTotal) * toM * toM) /
                      Math.min(Math.sqrt(num(openingsTotal) * toM * toM), effLength * toM * 0.9),
                    lenH * toM * 0.9,
                  ),
                  count: 1,
                },
              ]
            : [];
      const openingCount =
        openingsMode === "list"
          ? openings.reduce((a, o) => a + Math.max(0, o.count), 0)
          : num(openingsTotal) > 0
            ? 1
            : 0;
      const shapeNote =
        shape === "gable"
          ? `, gable triangle ${length} ${lengthUnit} base × ${gableRise} ${lengthUnit} rise`
          : shape === "curved"
            ? `, curved wall, radius ${curveRadius} ${lengthUnit}, ${curveAngle}°`
            : "";
      return {
        ok: true,
        results,
        visualizer: {
          lengthM: effLength * toM,
          heightM: lenH * toM,
          thicknessMm: num(thicknessMm),
          openings: vizOpenings,
          ariaLabel: `Wall elevation, ${effLength.toFixed(2)} ${lengthUnit} by ${lenH} ${lengthUnit}, ${thicknessMm} mm thick, ${bond} bond, ${openingCount} opening${openingCount === 1 ? "" : "s"}${shapeNote}`,
        },
      };
    }

    if (mode === "multi") {
      const inputs = walls.map(wallToInput);
      for (const w of inputs) {
        if (!(w.length > 0 && w.height > 0))
          return { ok: false, error: `Enter a length and height greater than zero for ${w.name}.` };
        if (!(w.thicknessMm > 0))
          return { ok: false, error: `Enter a thickness greater than zero for ${w.name}.` };
      }
      const project = calcBrickProject(inputs, sharedSettings);
      if (project.anyOpeningsExceed) {
        const bad = project.walls.find((w) => w.results.openingsExceedWall);
        return {
          ok: false,
          error: `Openings on ${bad?.wall.name ?? "a wall"} are larger than that wall — reduce the openings or enlarge the wall.`,
        };
      }
      const preview = project.walls.find((w) => w.wall.id === previewWallId) ?? project.walls[0];
      const pw = preview.wall;
      const openingCount = pw.openings.reduce((a, o) => a + Math.max(0, o.count), 0);
      return {
        ok: true,
        results: project.totals,
        perWall: project.walls,
        visualizer: {
          lengthM: pw.length * toM,
          heightM: pw.height * toM,
          thicknessMm: pw.thicknessMm,
          openings: pw.openings.map((o) => ({ kind: o.kind, lengthM: o.length * toM, heightM: o.height * toM, count: o.count })),
          ariaLabel: `Wall elevation, ${pw.name}, ${pw.length} ${lengthUnit} by ${pw.height} ${lengthUnit}, ${pw.thicknessMm} mm thick, ${bond} bond, ${openingCount} opening${openingCount === 1 ? "" : "s"}`,
        },
      };
    }

    if (mode === "reverse") {
      if (!(num(reverseBricks) > 0))
        return { ok: false, error: "Enter a number of bricks greater than zero." };
      if (!(num(thicknessMm) > 0))
        return { ok: false, error: "Enter a wall thickness greater than zero." };
      const rev = reverseBricksToArea(num(reverseBricks), num(thicknessMm), brick, {
        customBrick: brickId === "custom" ? customBrickMm : undefined,
        jointMm: num(jointMm),
      });
      const results = calcBrickworkFromArea(rev.areaM2, num(thicknessMm), brick, {
        customBrick: brickId === "custom" ? customBrickMm : undefined,
        jointMm: num(jointMm),
        wastagePct,
        mix: [num(cementParts) || 1, num(sandParts) || 4],
        cementBagKg: num(cementBagKg) || 50,
        currency,
        rates: sharedSettings.rates,
      });
      const sideM = Math.sqrt(Math.max(0, rev.areaM2));
      return {
        ok: true,
        results,
        reverse: { bricks: num(reverseBricks), areaM2: rev.areaM2, areaSqFt: rev.areaSqFt },
        visualizer: {
          lengthM: sideM,
          heightM: sideM,
          thicknessMm: num(thicknessMm),
          openings: [],
          ariaLabel: `Wall elevation (schematic square from reverse mode), ${sideM.toFixed(2)} m by ${sideM.toFixed(2)} m, ${thicknessMm} mm thick, ${bond} bond`,
        },
      };
    }

    if (mode === "budget") {
      if (!(num(budgetArea) > 0))
        return { ok: false, error: "Enter a wall area greater than zero." };
      if (!(num(budgetAmount) > 0))
        return { ok: false, error: "Enter a budget greater than zero." };
      if (!(num(areaThicknessMm) > 0))
        return { ok: false, error: "Enter a wall thickness greater than zero." };
      const areaM2 = num(budgetArea) * AREA_UNIT_TO_M2[budgetAreaUnit];
      const bud = budgetMode(areaM2, num(budgetAmount), num(areaThicknessMm), brick, {
        customBrick: brickId === "custom" ? customBrickMm : undefined,
        jointMm: num(jointMm),
        wastagePct,
        mix: [num(cementParts) || 1, num(sandParts) || 4],
        currency,
        rates: sharedSettings.rates,
      });
      const results = calcBrickworkFromArea(areaM2, num(areaThicknessMm), brick, {
        customBrick: brickId === "custom" ? customBrickMm : undefined,
        jointMm: num(jointMm),
        wastagePct,
        mix: [num(cementParts) || 1, num(sandParts) || 4],
        cementBagKg: num(cementBagKg) || 50,
        currency,
        rates: sharedSettings.rates,
      });
      const sideM = Math.sqrt(Math.max(0, areaM2));
      return {
        ok: true,
        results,
        budget: bud,
        visualizer: {
          lengthM: sideM,
          heightM: sideM,
          thicknessMm: num(areaThicknessMm),
          openings: [],
          ariaLabel: `Wall elevation (schematic square from budget mode), ${sideM.toFixed(2)} m by ${sideM.toFixed(2)} m, ${areaThicknessMm} mm thick, ${bond} bond`,
        },
      };
    }

    // area mode
    if (!(num(area) > 0))
      return { ok: false, error: "Enter a total wall area greater than zero." };
    if (!(num(areaThicknessMm) > 0))
      return { ok: false, error: "Enter a wall thickness greater than zero." };
    const grossAreaM2 = num(area) * AREA_UNIT_TO_M2[areaUnit];
    const openingsM2 = num(areaOpenings) * AREA_UNIT_TO_M2[areaUnit];
    if (openingsM2 > grossAreaM2)
      return {
        ok: false,
        error: `Openings (${openingsM2.toFixed(2)} m²) are larger than the wall area (${grossAreaM2.toFixed(2)} m²) — reduce the openings or enlarge the area.`,
      };
    const results = calcBrickworkFromArea(Math.max(0, grossAreaM2 - openingsM2), num(areaThicknessMm), brick, {
      customBrick: brickId === "custom" ? customBrickMm : undefined,
      jointMm: num(jointMm),
      wastagePct,
      mix: [num(cementParts) || 1, num(sandParts) || 4],
      cementBagKg: num(cementBagKg) || 50,
      currency,
      rates: sharedSettings.rates,
    });
    const sideM = Math.sqrt(Math.max(0, grossAreaM2 - openingsM2));
    return {
      ok: true,
      results,
      visualizer: {
        lengthM: sideM,
        heightM: sideM,
        thicknessMm: num(areaThicknessMm),
        openings: [],
        ariaLabel: `Wall elevation (schematic square from area), ${sideM.toFixed(2)} m by ${sideM.toFixed(2)} m, ${areaThicknessMm} mm thick, ${bond} bond`,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode, length, height, lengthUnit, thicknessMm, openings, openingsMode, openingsTotal,
    walls, previewWallId, area, areaUnit, areaOpenings, areaThicknessMm,
    shape, gableRise, curveRadius, curveAngle,
    reverseBricks, budgetArea, budgetAreaUnit, budgetAmount,
    brick, brickId, customBrickMm, jointMm, bond, wastagePct, cementParts, sandParts,
    cementBagKg, currency, sharedSettings,
  ]);

  const results = computed.ok ? computed.results : null;
  const sandUnit = CURRENCY_META[currency].sandUnit;
  const thicknessPreset = THICKNESS_PRESETS.find((t) => t.id === thicknessId);
  const areaThicknessPreset = THICKNESS_PRESETS.find((t) => t.id === areaThicknessId);
  const bondInfo = BOND_PATTERNS.find((b) => b.id === bond) ?? BOND_PATTERNS[1];
  const activeBrickDims = brickId === "custom" ? customBrickMm : { l: brick.l, w: brick.w, h: brick.h };

  const modeLabel =
    mode === "single"
      ? "Single wall"
      : mode === "multi"
        ? "Multi-wall room project"
        : mode === "reverse"
          ? "Reverse — bricks to area"
          : mode === "budget"
            ? "Budget — area and budget to price"
            : "Total wall area";

  /** Switch currency, moving the cement bag size to the new market's standard
   * (25 kg in the UK, 94 lb / 42.6 kg in the US) only when the user has not
   * changed the bag size from the old market's standard. */
  const onCurrencyChange = (c: Currency) => {
    if (c === currency) return;
    if (num(cementBagKg) === DEFAULT_CEMENT_BAG_KG[currency])
      setCementBagKg(String(DEFAULT_CEMENT_BAG_KG[c]));
    if (!labourOn && INDICATIVE_LABOUR_PER_1000[c] != null)
      setLabourRate(String(INDICATIVE_LABOUR_PER_1000[c]));
    setCurrency(c);
  };

  const labourCost =
    labourOn && computed.ok && results
      ? calcLabourCost({
          netAreaSqFt: results.netAreaSqFt,
          bricks: results.bricks,
          basis: labourBasis,
          rate: labourRate === "" ? null : parseFloat(labourRate) || null,
          days: num(labourDays),
        })
      : null;
  const grandTotal =
    results?.totalCost != null || labourCost != null
      ? (results?.totalCost ?? 0) + (labourCost ?? 0)
      : null;
  const packing =
    computed.ok && results
      ? packingFor(results.bricks, {
          packSize: num(packSize) || DEFAULT_PACK_SIZE,
          palletSize: num(palletSize) || DEFAULT_PALLET_SIZE,
          truckCapacity: truckCapacity === "" ? null : num(truckCapacity) || null,
        })
      : null;
  const strip = results ? rateStrip(results) : null;
  const quickThickness =
    THICKNESS_PRESETS.find((t) => t.id === quickThicknessId)?.mm ?? 230;
  const quickBricks = useMemo(() => {
    const q = calcBrickwork({
      ...defaultBrickInputs(currency),
      length: parseLengthValue(quickLength, lengthUnit),
      height: parseLengthValue(quickHeight, lengthUnit),
      lengthUnit,
      thicknessMm: quickThickness,
      brick,
      customBrick: brickId === "custom" ? customBrickMm : undefined,
      jointMm: num(jointMm),
      wastagePct,
      mix: [num(cementParts) || 1, num(sandParts) || 4],
      currency,
      rates: sharedSettings.rates,
    });
    return q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickLength, quickHeight, quickThickness, lengthUnit, brick, brickId, customBrickMm, jointMm, wastagePct, cementParts, sandParts, currency, sharedSettings]);
  const quickBrickCoverage = bricksPerArea(quickThickness, brick, {
    customBrick: brickId === "custom" ? customBrickMm : undefined,
    jointMm: num(jointMm),
  });
  /** Coverage rate on every preset (Glen-Gery style): pcs/sq ft + pcs/m² at
   * the current wall thickness, so the consequence of the choice is visible
   * before calculating. */
  const coverageThickness =
    mode === "area" || mode === "budget" ? num(areaThicknessMm) : num(thicknessMm);
  const coverageRows = BRICK_PRESETS.filter((p) => p.id !== "custom").map((p) => ({
    preset: p,
    ...bricksPerArea(coverageThickness, p, { jointMm: num(jointMm) }),
  }));

  const summaryText = (): string => {
    if (!computed.ok || !results) return "";
    const wallSpec =
      mode === "single"
        ? `Wall: ${length} × ${height} ${lengthUnit}, ${thicknessMm} mm thick${shape === "gable" ? ` + gable triangle ${length} × ${gableRise} ${lengthUnit}` : shape === "curved" ? `, curved (radius ${curveRadius} ${lengthUnit}, ${curveAngle}°)` : ""}`
        : mode === "multi"
          ? `Project: ${walls.map((w) => `${w.name || "Wall"} ${w.length} × ${w.height} ${lengthUnit}, ${w.thicknessMm} mm`).join("; ")}`
          : mode === "reverse"
            ? `Reverse: ${reverseBricks} bricks, ${thicknessMm} mm thick`
            : mode === "budget"
              ? `Budget: ${budgetArea} ${budgetAreaUnit === "sqft" ? "sq ft" : "m²"} wall area, ${formatMoney(num(budgetAmount) || null, currency)} budget, ${areaThicknessMm} mm thick`
              : `Wall area: ${area} ${areaUnit === "sqft" ? "sq ft" : "m²"}, ${areaThicknessMm} mm thick`;
    const lines = [
      `Brick estimate — Civil Estimation Pro`,
      `${modeLabel} — ${wallSpec}`,
      `Brick: ${brick.label}; joint ${jointMm} mm (≈ ${(num(jointMm) / 25.4).toFixed(2)} in); bond ${bondInfo.label}; mix ${cementParts}:${sandParts}; wastage ${wastagePct}%`,
      ``,
      `Bricks: ${formatInt(results.bricks)} pcs to order (${formatInt(results.bricksBeforeWastage)} before wastage + ${formatInt(results.wastageBricks)} wastage)`,
      `Bricks per sq ft: ${results.bricksPerSqFt.toFixed(1)} (${results.bricksPerM2.toFixed(1)} per m²) · ${results.bricksPerCft.toFixed(1)} per cft`,
      ...(packing
        ? [
            `Order: ${packing.packs} packs of ${packing.packSize} (${packing.spareBricks} spare) · ${packing.pallets} pallets of ${packing.palletSize}${packing.trucks != null ? ` · ${packing.trucks} truckloads` : ""}`,
          ]
        : []),
      ...(computed.reverse
        ? [
            `Reverse: ${formatInt(computed.reverse.bricks)} bricks cover ${computed.reverse.areaSqFt.toFixed(1)} sq ft (${computed.reverse.areaM2.toFixed(2)} m²) of ${thicknessMm} mm wall before wastage`,
          ]
        : []),
      ...(computed.budget
        ? [
            `Budget: ${formatMoney(computed.budget.pricePerSqFt, currency)} per sq ft · ${formatMoney(computed.budget.pricePer1000, currency)} per 1,000 bricks${computed.budget.bricksAffordable != null ? ` · budget buys ${formatInt(computed.budget.bricksAffordable)} bricks at the entered rate` : ""}`,
          ]
        : []),
      `Net wall area: ${results.netAreaM2.toFixed(2)} m² (${results.netAreaSqFt.toFixed(1)} sq ft); gross ${results.grossAreaM2.toFixed(2)} m² − openings ${results.openingsAreaM2.toFixed(2)} m²`,
      `Masonry volume: ${results.wallVolumeM3.toFixed(2)} m³ (${results.wallVolumeCft.toFixed(1)} cft)`,
      `Mortar: ${results.wetMortarM3.toFixed(2)} m³ wet (${results.wetMortarCft.toFixed(1)} cft) / ${results.dryMortarM3.toFixed(2)} m³ dry (${results.dryMortarCft.toFixed(1)} cft)`,
      `Cement: ${results.cementBags} bags (${results.cementBagKg} kg each) = ${formatInt(results.cementKg)} kg`,
      `Sand: ${results.sandCft.toFixed(1)} cft (${results.sandM3.toFixed(2)} m³)`,
    ];
    if (computed.perWall) {
      lines.push(``);
      for (const pw of computed.perWall)
        lines.push(`${pw.wall.name}: ${formatInt(pw.results.bricks)} bricks, ${pw.results.cementBags} bags cement, ${pw.results.sandCft.toFixed(1)} cft sand`);
    }
    lines.push(``);
    if (results.totalCost != null || labourCost != null) {
      lines.push(`Cost (${currency}): bricks ${formatMoney(results.brickCost, currency)}; cement ${formatMoney(results.cementCost, currency)}; sand ${formatMoney(results.sandCost, currency)}`);
      if (labourCost != null)
        lines.push(`Labour (${labourBasis === "perSqFt" ? "per sq ft" : labourBasis === "per1000" ? "per 1,000 bricks" : "per day"}): ${formatMoney(labourCost, currency)}`);
      lines.push(
        labourCost != null
          ? `Total (materials + labour): ${formatMoney(grandTotal, currency)}`
          : `Total (materials only): ${formatMoney(results.totalCost, currency)}`,
      );
    } else {
      lines.push(`Cost: enter brick / cement / sand rates to see the material cost.`);
    }
    lines.push(`Rates are indicative — confirm with your supplier.`);
    lines.push(`Planning estimate only — confirm the final order with your quantity surveyor or contractor.`);
    return lines.join("\n");
  };

  const handleCopy = async () => {
    if (!computed.ok) return;
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can use the share button instead */
    }
  };

  const handleShare = async () => {
    if (!computed.ok) return;
    const text = summaryText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Brick estimate — Civil Estimation Pro", text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        /* user cancelled the share sheet — fall through to copy */
      }
    }
    await handleCopy();
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handlePrint = () => window.print();

  const handlePdf = () => {
    if (!computed.ok) return;
    const doc = new jsPDF();
    const lines = summaryText().split("\n");
    doc.setFontSize(16);
    doc.text("Brick Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · ${ratesNote ?? "Indicative rates — confirm with your supplier."}`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of lines.slice(1)) {
      if (line === "") {
        y += 4;
        continue;
      }
      const wrapped = doc.splitTextToSize(line, 180);
      for (const part of wrapped) {
        if (y > 275) {
          doc.addPage();
          y = 18;
        }
        doc.text(part, 14, y);
        y += 7;
      }
    }
    doc.setFontSize(9);
    if (y > 265) {
      doc.addPage();
      y = 18;
    }
    doc.text(
      "Disclaimer: planning estimate only — confirm the final order with your quantity surveyor or contractor.",
      14,
      y + 8,
      { maxWidth: 180 },
    );
    doc.save("brick-estimate-civil-estimation-pro.pdf");
  };

  const handleReset = () => {
    const d = defaultBrickInputs("PKR");
    setMode("single");
    setQuickLength("10");
    setQuickHeight("10");
    setQuickThicknessId("t230");
    setShape("rect");
    setGableRise("3");
    setCurveRadius("6");
    setCurveAngle("90");
    setReverseBricks("1000");
    setBudgetArea("100");
    setBudgetAreaUnit("sqft");
    setBudgetAmount("20000");
    setPackSize(String(DEFAULT_PACK_SIZE));
    setPalletSize(String(DEFAULT_PALLET_SIZE));
    setTruckCapacity("");
    setLabourOn(false);
    setLabourBasis("per1000");
    setLabourRate("");
    setLabourDays("5");
    setLengthUnit(d.lengthUnit);
    setLength(String(d.length));
    setHeight(String(d.height));
    setThicknessId("t230");
    setThicknessMm(String(d.thicknessMm));
    setOpenings([]);
    setOpeningsMode("list");
    setOpeningsTotal("");
    setWalls([newWall(1)]);
    setArea("100");
    setAreaUnit("sqft");
    setAreaOpenings("");
    setAreaThicknessId("t230");
    setAreaThicknessMm("230");
    setBrickId(d.brick.id);
    setCustomBrickMm({ l: 230, w: 110, h: 75 });
    setCustomBrickUnit("mm");
    setJointMm(String(d.jointMm));
    setBond("english");
    setWastagePreset(5);
    setWastageCustom("7");
    setMixId("1:4");
    setCementParts("1");
    setSandParts("4");
    setCementBagKg("50");
    setCurrency("PKR");
    setRatesByCurrency({
      PKR: ratesToStrings(INDICATIVE_RATES.PKR),
      INR: ratesToStrings(INDICATIVE_RATES.INR),
      AED: ratesToStrings(INDICATIVE_RATES.AED),
      GBP: ratesToStrings(INDICATIVE_RATES.GBP),
      USD: ratesToStrings(INDICATIVE_RATES.USD),
    });
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  const customBrickDisplay = (dim: "l" | "w" | "h"): string =>
    customBrickUnit === "mm" ? String(customBrickMm[dim]) : fmtDisplay2dp(customBrickMm[dim] / 25.4);
  const onCustomBrickDisplay = (dim: "l" | "w" | "h", value: string) => {
    const v = parseFloat(value) || 0;
    const mm = customBrickUnit === "mm" ? v : v * 25.4;
    setCustomBrickMm((prev) => ({ ...prev, [dim]: Math.round(mm * 10) / 10 }));
  };

  return (
    <div className="w-full" data-local-units="true">
      {/* Quick mode — three inputs, bricks only (Enviraj shape). Uses the same
          brick, joint, wastage and mix as the full calculator below. */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border border-ui-borderSubtle rounded-2xl px-5 py-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-txt-secondary">
            Quick answer — just bricks
          </h3>
          <span className="text-xs text-txt-tertiary">
            {quickBrickCoverage.perSqFt.toFixed(1)} bricks / sq ft ·{" "}
            {quickBrickCoverage.perM2.toFixed(1)} / m² at {quickThickness} mm
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label htmlFor="brick-quick-length" className={labelCls}>
              Length ({lengthUnit})
            </label>
            <input
              id="brick-quick-length"
              type="text"
              inputMode="decimal"
              value={quickLength}
              onChange={(e) => setQuickLength(e.target.value)}
              className={inputCls}
              placeholder="10"
            />
          </div>
          <div>
            <label htmlFor="brick-quick-height" className={labelCls}>
              Height ({lengthUnit})
            </label>
            <input
              id="brick-quick-height"
              type="text"
              inputMode="decimal"
              value={quickHeight}
              onChange={(e) => setQuickHeight(e.target.value)}
              className={inputCls}
              placeholder="10"
            />
          </div>
          <div>
            <label htmlFor="brick-quick-thickness" className={labelCls}>
              Thickness
            </label>
            <select
              id="brick-quick-thickness"
              value={quickThicknessId}
              onChange={(e) => setQuickThicknessId(e.target.value)}
              className={selectCls}
            >
              {THICKNESS_PRESETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-base">
          <strong className="text-txt-primary dark:text-white">
            {formatInt(quickBricks.bricks)} bricks to order
          </strong>{" "}
          <span className="text-txt-secondary">
            ({formatInt(quickBricks.bricksBeforeWastage)} + {wastagePct}% wastage) for a{" "}
            {quickLength} × {quickHeight} {lengthUnit} wall, {quickThickness} mm thick.
          </span>{" "}
          <button
            type="button"
            onClick={() => {
              setLength(quickLength);
              setHeight(quickHeight);
              setThicknessId(quickThicknessId);
              const preset = THICKNESS_PRESETS.find((t) => t.id === quickThicknessId);
              if (preset && quickThicknessId !== "tcustom") setThicknessMm(String(preset.mm));
              setMode("single");
            }}
            className="font-semibold text-accent-800 hover:underline"
          >
            Use in the full calculator →
          </button>
        </p>
      </div>

      {/* Calculation mode */}
      <div className="flex flex-col gap-2 mb-8" role="group" aria-label="Calculation mode">
        {(
          [
            ["single", "Single wall"],
            ["multi", "Multi-wall room project"],
            ["area", "Total wall area"],
            ["reverse", "Reverse: bricks → area"],
            ["budget", "Budget: area + budget → price"],
          ] as [CalcMode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`w-full min-h-[44px] px-4 py-3 rounded-full text-sm font-semibold border text-center whitespace-nowrap transition-all ${
              mode === m
                ? "bg-ink text-white border-ink"
                : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-sm text-txt-tertiary -mt-5 mb-8">
        {mode === "single"
          ? "One wall: length × height × thickness, with doors and windows deducted."
          : mode === "multi"
            ? "A whole room: add every wall, each with its own size, thickness and openings. Brick, joint, wastage, mix and rates are shared across the project."
            : mode === "reverse"
              ? "Already have bricks? Enter how many and the thickness to see how much wall they cover."
              : mode === "budget"
                ? "Enter the wall area and your budget to see the price per square foot and per 1,000 bricks it allows."
                : "Already know the total wall area? Enter it directly — no length and height needed."}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-start">
        {/* Inputs */}
        <div className="space-y-8">
          {mode === "reverse" ? (
            <section aria-label="Reverse: bricks to area">
              <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-ink" />
                Bricks you have
              </h3>
              <div>
                <label htmlFor="brick-reverse-count" className={labelCls}>
                  Number of bricks
                </label>
                <input
                  id="brick-reverse-count"
                  type="number"
                  inputMode="numeric"
                  step="any"
                  min="0"
                  value={reverseBricks}
                  onChange={(e) => setReverseBricks(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 1000"
                />
                <p className="text-sm text-txt-tertiary mt-2">
                  The wall thickness below (in Brick &amp; mortar) decides the area — 1,000
                  bricks cover about 115 sq ft of 9-inch wall, or about 229 sq ft of 4½-inch
                  wall, before wastage.
                </p>
              </div>
              <div className="mt-4">
                <label htmlFor="brick-reverse-thickness" className={labelCls}>
                  Wall thickness
                </label>
                <select
                  id="brick-reverse-thickness"
                  value={thicknessId}
                  onChange={(e) => onThicknessChange(e.target.value)}
                  className={selectCls}
                >
                  {THICKNESS_PRESETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.use}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          ) : mode === "budget" ? (
            <section aria-label="Budget: area and budget to price">
              <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-ink" />
                Wall area &amp; budget
              </h3>
              <div
                className="grid grid-cols-2 gap-1 p-1 mb-4 rounded-full border border-ui-borderSubtle bg-accent-50 dark:bg-accent-900/20 pill-grid-2"
                role="group"
                aria-label="Budget area unit"
              >
                {(
                  [
                    ["sqft", "Square feet (sq ft)"],
                    ["m2", "Square metres (m²)"],
                  ] as [AreaUnit, string][]
                ).map(([u, label]) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setBudgetAreaUnit(u)}
                    aria-pressed={budgetAreaUnit === u}
                    className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                      budgetAreaUnit === u
                        ? "bg-ink text-white shadow-sm"
                        : "text-txt-secondary hover:text-txt-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brick-budget-area" className={labelCls}>
                    Wall area ({budgetAreaUnit === "sqft" ? "sq ft" : "m²"})
                  </label>
                  <input
                    id="brick-budget-area"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={budgetArea}
                    onChange={(e) => setBudgetArea(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label htmlFor="brick-budget-amount" className={labelCls}>
                    Budget ({currency})
                  </label>
                  <input
                    id="brick-budget-amount"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 20000"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="brick-budget-thickness" className={labelCls}>
                  Wall thickness
                </label>
                <select
                  id="brick-budget-thickness"
                  value={areaThicknessId}
                  onChange={(e) => onAreaThicknessChange(e.target.value)}
                  className={selectCls}
                >
                  {THICKNESS_PRESETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.use}
                    </option>
                  ))}
                </select>
                {areaThicknessId === "tcustom" && (
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={areaThicknessMm}
                    onChange={(e) => setAreaThicknessMm(e.target.value)}
                    className={`${inputCls} mt-3`}
                    aria-label="Custom wall thickness in millimetres"
                    placeholder="Thickness in mm, e.g. 230"
                  />
                )}
              </div>
              <p className="text-sm text-txt-tertiary mt-2">
                The brick count still comes from the wall area. The budget only divides up
                the money — price per sq ft, price per 1,000 bricks, and how many bricks the
                budget buys at your entered brick rate.
              </p>
            </section>
          ) : mode === "area" ? (
            <section aria-label="Total wall area">
              <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-ink" />
                Wall area
              </h3>
              <div
                className="grid grid-cols-2 gap-1 p-1 mb-4 rounded-full border border-ui-borderSubtle bg-accent-50 dark:bg-accent-900/20 pill-grid-2"
                role="group"
                aria-label="Area unit"
              >
                {(
                  [
                    ["sqft", "Square feet (sq ft)"],
                    ["m2", "Square metres (m²)"],
                  ] as [AreaUnit, string][]
                ).map(([u, label]) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setAreaUnit(u)}
                    aria-pressed={areaUnit === u}
                    className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                      areaUnit === u
                        ? "bg-ink text-white shadow-sm"
                        : "text-txt-secondary hover:text-txt-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brick-total-area" className={labelCls}>
                    Total wall area ({areaUnit === "sqft" ? "sq ft" : "m²"})
                  </label>
                  <input
                    id="brick-total-area"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 100"
                  />
                </div>
                <div>
                  <label htmlFor="brick-area-openings" className={labelCls}>
                    Openings area ({areaUnit === "sqft" ? "sq ft" : "m²"})
                  </label>
                  <input
                    id="brick-area-openings"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={areaOpenings}
                    onChange={(e) => setAreaOpenings(e.target.value)}
                    className={inputCls}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="brick-area-thickness" className={labelCls}>
                  Wall thickness
                </label>
                <select
                  id="brick-area-thickness"
                  value={areaThicknessId}
                  onChange={(e) => onAreaThicknessChange(e.target.value)}
                  className={selectCls}
                >
                  {THICKNESS_PRESETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.use}
                    </option>
                  ))}
                </select>
                {areaThicknessId === "tcustom" && (
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={areaThicknessMm}
                    onChange={(e) => setAreaThicknessMm(e.target.value)}
                    className={`${inputCls} mt-3`}
                    aria-label="Custom wall thickness in millimetres"
                    placeholder="Thickness in mm, e.g. 230"
                  />
                )}
                {areaThicknessPreset && areaThicknessId !== "tcustom" && (
                  <p className="text-sm text-txt-tertiary mt-2">
                    {areaThicknessPreset.mm} mm thick — {areaThicknessPreset.use}.
                  </p>
                )}
              </div>
            </section>
          ) : mode === "multi" ? (
            <section aria-label="Walls">
              <h3 className="text-txt-primary dark:text-white mb-2 flex items-center gap-2 text-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-ink" />
                Walls
              </h3>
              <p className="text-sm text-txt-tertiary mb-4">
                Each wall has its own size, thickness and openings. Dimensions use the unit
                switcher below — switching converts every wall's values.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4 pill-grid-3" role="group" aria-label="Length unit">
                {LENGTH_UNITS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onLengthUnitChange(u.id)}
                    aria-pressed={lengthUnit === u.id}
                    className={`min-h-[44px] rounded-full px-2 py-2 text-xs font-semibold border whitespace-nowrap transition-all ${
                      lengthUnit === u.id
                        ? "bg-ink text-white border-ink"
                        : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                    }`}
                  >
                    {u.short}
                  </button>
                ))}
              </div>
              <div className="space-y-5">
                {walls.map((w, wi) => (
                  <div
                    key={w.id}
                    className="border border-ui-borderSubtle dark:border-ink-600 rounded-2xl p-4 bg-bg-card/40 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={w.name}
                        onChange={(e) => updateWall(w.id, { name: e.target.value })}
                        aria-label={`Name of wall ${wi + 1}`}
                        className="flex-1 min-w-0 bg-transparent border-b border-ui-borderSubtle focus:outline-none focus:border-accent-500 font-semibold text-txt-primary dark:text-white px-1 py-1"
                      />
                      {walls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setWalls((prev) => prev.filter((x) => x.id !== w.id));
                            if (previewWallId === w.id) setPreviewWallId(walls[0].id);
                          }}
                          aria-label={`Remove ${w.name}`}
                          className="p-2 rounded-full text-ui-errorText hover:bg-ui-error dark:hover:bg-ui-error/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`${w.id}-len`} className={labelCls}>
                          Length ({lengthUnit})
                        </label>
                        <input
                          id={`${w.id}-len`}
                          type="text"
                          inputMode="decimal"
                          value={w.length}
                          onChange={(e) => updateWall(w.id, { length: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label htmlFor={`${w.id}-h`} className={labelCls}>
                          Height ({lengthUnit})
                        </label>
                        <input
                          id={`${w.id}-h`}
                          type="text"
                          inputMode="decimal"
                          value={w.height}
                          onChange={(e) => updateWall(w.id, { height: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`${w.id}-thick`} className={labelCls}>
                        Wall thickness
                      </label>
                      <select
                        id={`${w.id}-thick`}
                        value={w.thicknessId}
                        onChange={(e) => onWallThicknessChange(w.id, e.target.value)}
                        className={selectCls}
                      >
                        {THICKNESS_PRESETS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label} — {t.use}
                          </option>
                        ))}
                      </select>
                      {w.thicknessId === "tcustom" && (
                        <input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          value={w.thicknessMm}
                          onChange={(e) => updateWall(w.id, { thicknessMm: e.target.value })}
                          className={`${inputCls} mt-3`}
                          aria-label="Custom wall thickness in millimetres"
                          placeholder="Thickness in mm, e.g. 230"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-txt-primary dark:text-white mb-2">
                        Openings — doors &amp; windows
                      </h4>
                      <OpeningsEditor
                        openings={w.openings}
                        setOpenings={(next) => updateWall(w.id, { openings: next })}
                        openingsMode={w.openingsMode}
                        setOpeningsMode={(m) => updateWall(w.id, { openingsMode: m })}
                        openingsTotal={w.openingsTotal}
                        setOpeningsTotal={(v) => updateWall(w.id, { openingsTotal: v })}
                        lengthUnit={lengthUnit}
                        idPrefix={w.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const nw = newWall(walls.length + 1);
                  setWalls((prev) => [...prev, nw]);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add wall
              </button>
            </section>
          ) : (
            <>
              <section aria-label="Wall dimensions">
                <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
                  <span className="w-2 h-2 rounded-full bg-ink" />
                  Wall dimensions
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4 pill-grid-3" role="group" aria-label="Length unit">
                  {LENGTH_UNITS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onLengthUnitChange(u.id)}
                      aria-pressed={lengthUnit === u.id}
                      className={`min-h-[44px] rounded-full px-2 py-2 text-xs font-semibold border whitespace-nowrap transition-all ${
                        lengthUnit === u.id
                          ? "bg-ink text-white border-ink"
                          : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-txt-tertiary -mt-2 mb-3">
                  Switching units converts the numbers you already entered — nothing is lost.
                  In feet you can also type ft+in, e.g. <code>10&apos;6&quot;</code>.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="brick-wall-length" className={labelCls}>
                      Length ({lengthUnit})
                    </label>
                    <input
                      id="brick-wall-length"
                      type="text"
                      inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className={inputCls}
                      placeholder={lengthUnit === "ft" ? "e.g. 10 or 10'6\"" : "e.g. 3"}
                    />
                  </div>
                  <div>
                    <label htmlFor="brick-wall-height" className={labelCls}>
                      Height ({lengthUnit})
                    </label>
                    <input
                      id="brick-wall-height"
                      type="text"
                      inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={inputCls}
                      placeholder={lengthUnit === "ft" ? "e.g. 10 or 10'6\"" : "e.g. 3"}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="brick-thickness" className={labelCls}>
                    Wall thickness
                  </label>
                  <select
                    id="brick-thickness"
                    value={thicknessId}
                    onChange={(e) => onThicknessChange(e.target.value)}
                    className={selectCls}
                  >
                    {THICKNESS_PRESETS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} — {t.use}
                      </option>
                    ))}
                  </select>
                  {thicknessId === "tcustom" && (
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={thicknessMm}
                      onChange={(e) => setThicknessMm(e.target.value)}
                      className={`${inputCls} mt-3`}
                      aria-label="Custom wall thickness in millimetres"
                      placeholder="Thickness in mm, e.g. 230"
                    />
                  )}
                  {thicknessPreset && thicknessId !== "tcustom" && (
                    <p className="text-sm text-txt-tertiary mt-2">
                      {thicknessPreset.mm} mm thick — {thicknessPreset.use}.
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <span className={labelCls}>Wall shape</span>
                  <div className="flex flex-col gap-2" role="group" aria-label="Wall shape">
                    {(
                      [
                        ["rect", "Rectangular wall"],
                        ["gable", "Gable end (rectangle + triangle)"],
                        ["curved", "Curved wall (centre-line length)"],
                      ] as [WallShape, string][]
                    ).map(([s, label]) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setShape(s);
                          // Cut work breaks more bricks: suggest the higher wastage
                          // only when the user is still on the 5% default.
                          if (s === "curved" && wastagePreset === 5) {
                            setWastagePreset("custom");
                            setWastageCustom("12");
                          } else if (s === "gable" && wastagePreset === 5) {
                            setWastagePreset("custom");
                            setWastageCustom("10");
                          }
                        }}
                        aria-pressed={shape === s}
                        className={`w-full min-h-[44px] px-4 py-3 rounded-full text-sm font-semibold border text-center whitespace-nowrap transition-all ${
                          shape === s
                            ? "bg-ink text-white border-ink"
                            : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {shape === "gable" && (
                    <div className="mt-3">
                      <label htmlFor="brick-gable-rise" className={labelCls}>
                        Gable rise ({lengthUnit}) — base is the wall length above
                      </label>
                      <input
                        id="brick-gable-rise"
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={gableRise}
                        onChange={(e) => setGableRise(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. 3"
                      />
                      <p className="text-sm text-txt-tertiary mt-2">
                        The triangle adds base × rise ÷ 2 to the wall area — a 10 ft base with
                        a 3 ft rise adds 15 sq ft. Wastage is suggested at 10% for the cut
                        bricks; change it below if your bricks are better.
                      </p>
                    </div>
                  )}
                  {shape === "curved" && (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label htmlFor="brick-curve-radius" className={labelCls}>
                          Average radius ({lengthUnit})
                        </label>
                        <input
                          id="brick-curve-radius"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          value={curveRadius}
                          onChange={(e) => setCurveRadius(e.target.value)}
                          className={inputCls}
                          placeholder="e.g. 6"
                        />
                      </div>
                      <div>
                        <label htmlFor="brick-curve-angle" className={labelCls}>
                          Sweep angle (degrees)
                        </label>
                        <input
                          id="brick-curve-angle"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min="0"
                          max="360"
                          value={curveAngle}
                          onChange={(e) => setCurveAngle(e.target.value)}
                          className={inputCls}
                          placeholder="e.g. 90"
                        />
                      </div>
                      <p className="text-sm text-txt-tertiary col-span-2">
                        Centre-line length = radius × angle — a 6 {lengthUnit} radius over 90°
                        is about {(arcLengthM(num(curveRadius) * LENGTH_UNIT_TO_M[lengthUnit], num(curveAngle)) / LENGTH_UNIT_TO_M[lengthUnit]).toFixed(2)} {lengthUnit} of wall.
                        Wastage is suggested at 12% for curved work.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section aria-label="Openings">
                <h3 className="text-txt-primary dark:text-white mb-2 flex items-center gap-2 text-lg font-medium">
                  <span className="w-2 h-2 rounded-full bg-ink" />
                  Openings — doors &amp; windows
                </h3>
                <p className="text-sm text-txt-tertiary mb-4">
                  Deducted from the wall area. A door or window is a hole, not brickwork.
                </p>
                <OpeningsEditor
                  openings={openings}
                  setOpenings={setOpenings}
                  openingsMode={openingsMode}
                  setOpeningsMode={setOpeningsMode}
                  openingsTotal={openingsTotal}
                  setOpeningsTotal={setOpeningsTotal}
                  lengthUnit={lengthUnit}
                  idPrefix="single"
                />
              </section>
            </>
          )}

          <section aria-label="Brick and mortar">
            <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-ink" />
              Brick &amp; mortar
            </h3>
            <label htmlFor="brick-preset" className={labelCls}>
              Brick size
            </label>
            <select
              id="brick-preset"
              value={brickId}
              onChange={(e) => setBrickId(e.target.value)}
              className={selectCls}
            >
              {BRICK_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-txt-tertiary mt-2">
              {brick.standard}. {brick.note}
            </p>
            {/* Coverage on every preset: pcs/sq ft + pcs/m² at the current
                thickness, with a schematic face drawn from the real size. */}
            <div className="mt-3 border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-txt-secondary px-4 py-2.5 bg-surface-default">
                Coverage at {coverageThickness} mm thick (before wastage) — tap to select
              </p>
              <ul className="divide-y divide-ui-borderSubtle dark:divide-ink-600">
                {coverageRows.map(({ preset, perSqFt, perM2 }) => (
                  <li key={preset.id}>
                    <button
                      type="button"
                      onClick={() => setBrickId(preset.id)}
                      aria-pressed={brickId === preset.id}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        brickId === preset.id
                          ? "bg-accent-50 dark:bg-accent-900/20"
                          : "hover:bg-surface-hover"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 rounded-[3px] border-2 border-accent-500 bg-accent-100 dark:bg-accent-900/40"
                        style={{
                          width: `${Math.max(14, Math.min(34, (preset.l / preset.h) * 10))}px`,
                          height: "12px",
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-txt-primary dark:text-white truncate">
                          {preset.label}
                        </span>
                        <span className="block text-xs text-txt-tertiary">{preset.standard}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-semibold">{perSqFt.toFixed(1)} / sq ft</span>
                        <span className="block text-xs text-txt-tertiary">{perM2.toFixed(1)} / m²</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {brickId === "custom" && (
              <>
                <div
                  className="grid grid-cols-2 gap-1 p-1 mt-3 rounded-full border border-ui-borderSubtle bg-accent-50 dark:bg-accent-900/20 pill-grid-2"
                  role="group"
                  aria-label="Custom brick size unit"
                >
                  {(["mm", "in"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setCustomBrickUnit(u)}
                      aria-pressed={customBrickUnit === u}
                      className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                        customBrickUnit === u
                          ? "bg-ink text-white shadow-sm"
                          : "text-txt-secondary hover:text-txt-primary"
                      }`}
                    >
                      {u === "mm" ? "Millimetres (mm)" : "Inches (in)"}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {(["l", "w", "h"] as const).map((dim) => (
                    <div key={dim}>
                      <label htmlFor={`brick-custom-${dim}`} className={labelCls}>
                        {dim === "l" ? "Length" : dim === "w" ? "Width" : "Height"} ({customBrickUnit})
                      </label>
                      <input
                        id={`brick-custom-${dim}`}
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min="0"
                        value={customBrickDisplay(dim)}
                        onChange={(e) => onCustomBrickDisplay(dim, e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="brick-joint" className={labelCls}>
                  Mortar joint (mm)
                </label>
                <input
                  id="brick-joint"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={jointMm}
                  onChange={(e) => setJointMm(e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-txt-tertiary mt-1">10 mm ≈ 3/8″.</p>
              </div>
              <div>
                <label htmlFor="brick-bag" className={labelCls}>
                  Cement bag size (kg)
                </label>
                <input
                  id="brick-bag"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={cementBagKg}
                  onChange={(e) => setCementBagKg(e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-txt-tertiary mt-1">
                  {DEFAULT_CEMENT_BAG_KG[currency]} kg is the{" "}
                  {currency === "GBP"
                    ? "UK standard (25 kg bags)"
                    : currency === "USD"
                      ? "US standard (94 lb bags)"
                      : "PK / IN / AE standard"}
                  . Change it if your bags differ.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <span className={labelCls}>Wastage</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pill-grid-3 pill-grid-5-sm" role="group" aria-label="Wastage percent">
                {WASTAGE_PILLS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setWastagePreset(p)}
                    aria-pressed={wastagePreset === p}
                    className={`min-h-[44px] rounded-full px-2 py-2 text-sm font-semibold border whitespace-nowrap transition-all ${
                      wastagePreset === p
                        ? "bg-ink text-white border-ink"
                        : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWastagePreset("custom")}
                  aria-pressed={wastagePreset === "custom"}
                  className={`min-h-[44px] rounded-full px-2 py-2 text-sm font-semibold border whitespace-nowrap transition-all ${
                    wastagePreset === "custom"
                      ? "bg-ink text-white border-ink"
                      : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                  }`}
                >
                  Custom
                </button>
              </div>
              {wastagePreset === "custom" && (
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  max="50"
                  value={wastageCustom}
                  onChange={(e) => setWastageCustom(e.target.value)}
                  aria-label="Custom wastage percent"
                  className="w-full mt-2 bg-bg-card/80 border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              )}
              <p className="text-sm text-txt-tertiary mt-2">
                5% — good Awwal / machine-made bricks, straight wall. 10% — kiln bricks, cut work,
                many openings. 15% — curved walls. Wastage applies to bricks and to mortar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMortarOpen((v) => !v)}
              aria-expanded={mortarOpen}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors"
            >
              {mortarOpen ? "Hide mortar & bond details" : "Show mortar & bond details (mix, bond)"}
              <ChevronDown className={`w-4 h-4 transition-transform ${mortarOpen ? "rotate-180" : ""}`} />
            </button>
            {mortarOpen && (
              <>
            <div className="mt-4">
              <label htmlFor="brick-mix" className={labelCls}>
                Mortar mix (cement : sand)
              </label>
              <select
                id="brick-mix"
                value={mixId}
                onChange={(e) => {
                  const id = e.target.value;
                  setMixId(id);
                  const preset = MIX_PRESETS.find((m) => m.id === id);
                  if (preset && id !== "custom") {
                    setCementParts(String(preset.mix[0]));
                    setSandParts(String(preset.mix[1]));
                  }
                }}
                className={selectCls}
              >
                {MIX_PRESETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              {mixId === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label htmlFor="brick-cement-parts" className={labelCls}>
                      Cement parts
                    </label>
                    <input
                      id="brick-cement-parts"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={cementParts}
                      onChange={(e) => setCementParts(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="brick-sand-parts" className={labelCls}>
                      Sand parts
                    </label>
                    <input
                      id="brick-sand-parts"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={sandParts}
                      onChange={(e) => setSandParts(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <span className={labelCls}>Bond pattern</span>
              <div className="flex flex-col gap-2" role="group" aria-label="Bond pattern">
                {BOND_PATTERNS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBond(b.id)}
                    aria-pressed={bond === b.id}
                    className={`w-full min-h-[44px] px-4 py-3 rounded-full text-sm font-semibold border text-center whitespace-nowrap transition-all ${
                      bond === b.id
                        ? "bg-ink text-white border-ink"
                        : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-txt-tertiary mt-2">
                {bondInfo.note} Bond changes the look and the drawing, not the brick count.
              </p>
            </div>
              </>
            )}
          </section>

          <section aria-label="Currency and rates">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-txt-primary dark:text-white flex items-center gap-2 text-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-accent-500" />
                Currency &amp; rates
              </h3>
              <button
                type="button"
                onClick={() => setCostOpen((v) => !v)}
                aria-expanded={costOpen}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors"
              >
                {costOpen ? "Hide cost" : "Show cost"}
                <ChevronDown className={`w-4 h-4 transition-transform ${costOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
            {costOpen && (
              <>
                <div
                  className="grid grid-cols-3 gap-1 p-1 mb-4 rounded-full border border-ui-borderSubtle bg-accent-50 dark:bg-accent-900/20 pill-grid-3"
                  role="group"
                  aria-label="Currency"
                >
                  {(["PKR", "INR", "AED", "GBP", "USD"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onCurrencyChange(c)}
                      aria-pressed={currency === c}
                      className={`min-h-[44px] rounded-full px-2 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                        currency === c
                          ? "bg-ink text-white shadow-sm"
                          : "text-txt-secondary hover:text-txt-primary"
                      }`}
                    >
                      {c} ({CURRENCY_META[c].symbol})
                    </button>
                  ))}
                </div>
                <p className="text-xs text-txt-tertiary -mt-2 mb-3">
                  Your rates are kept separately per currency — switching currency never overwrites
                  them.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="brick-price" className={labelCls}>
                      Brick ({currency} / 1,000)
                    </label>
                    <input
                      id="brick-price"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={brickPrice}
                      onChange={(e) => setRate("brick", e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 20000"
                    />
                  </div>
                  <div>
                    <label htmlFor="cement-price" className={labelCls}>
                      Cement ({currency} / bag)
                    </label>
                    <input
                      id="cement-price"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={cementPrice}
                      onChange={(e) => setRate("cement", e.target.value)}
                      className={inputCls}
                      placeholder="e.g. 1550"
                    />
                  </div>
                  <div>
                    <label htmlFor="sand-price" className={labelCls}>
                      Sand ({currency} / {sandUnit})
                    </label>
                    <input
                      id="sand-price"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={sandPrice}
                      onChange={(e) => setRate("sand", e.target.value)}
                      className={inputCls}
                      placeholder={sandUnit === "cft" ? "e.g. 50" : "e.g. 1800"}
                    />
                  </div>
                </div>
                <p className="text-sm text-txt-tertiary mt-3 flex gap-1.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {ratesNote ??
                      "Rates are indicative November 2026 defaults. Enter your supplier's actual rates for an exact cost — leave a field blank to skip that cost."}
                  </span>
                </p>
                <div className="mt-5 border-t border-ui-borderSubtle dark:border-ink-600 pt-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-txt-primary dark:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={labourOn}
                      onChange={(e) => setLabourOn(e.target.checked)}
                      className="w-5 h-5 accent-[#F2A413]"
                    />
                    Include labour cost (optional — off by default)
                  </label>
                  {labourOn && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-full border border-ui-borderSubtle bg-accent-50 dark:bg-accent-900/20 pill-grid-3" role="group" aria-label="Labour basis">
                        {(
                          [
                            ["perSqFt", `Per sq ft (${currency})`],
                            ["per1000", `Per 1,000 bricks (${currency})`],
                            ["perDay", `Per day (${currency})`],
                          ] as [LabourBasis, string][]
                        ).map(([b, label]) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setLabourBasis(b)}
                            aria-pressed={labourBasis === b}
                            className={`min-h-[44px] rounded-full px-2 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                              labourBasis === b
                                ? "bg-ink text-white shadow-sm"
                                : "text-txt-secondary hover:text-txt-primary"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="brick-labour-rate" className={labelCls}>
                            Labour rate ({currency} /{" "}
                            {labourBasis === "perSqFt" ? "sq ft" : labourBasis === "per1000" ? "1,000 bricks" : "day"})
                          </label>
                          <input
                            id="brick-labour-rate"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min="0"
                            value={labourRate}
                            onChange={(e) => setLabourRate(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. 550"
                          />
                        </div>
                        {labourBasis === "perDay" && (
                          <div>
                            <label htmlFor="brick-labour-days" className={labelCls}>
                              Days on site
                            </label>
                            <input
                              id="brick-labour-days"
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min="0"
                              value={labourDays}
                              onChange={(e) => setLabourDays(e.target.value)}
                              className={inputCls}
                              placeholder="e.g. 5"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-txt-tertiary">
                        Indicative (Nov 2026): UK about £400–700 labour per 1,000 bricks laid;
                        US about $1,500–2,000 per 1,000. No verified per-1,000 labour rate was
                        found for Pakistan, India or the UAE — enter your mason&apos;s rate.
                        The total below then reads materials + labour.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Results */}
        <div className="relative flex flex-col h-full">
          <div className="sticky top-6 flex flex-col flex-1 space-y-4">
            {mode === "multi" && walls.length > 1 && (
              <div className="flex items-center gap-3">
                <label htmlFor="brick-preview-wall" className="text-sm font-semibold text-txt-secondary shrink-0">
                  Drawing shows:
                </label>
                <select
                  id="brick-preview-wall"
                  value={previewWallId}
                  onChange={(e) => setPreviewWallId(e.target.value)}
                  className={selectCls}
                >
                  {walls.map((w, i) => (
                    <option key={w.id} value={w.id}>
                      {w.name || `Wall ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {computed.ok ? (
              <BrickWallVisualizer
                lengthM={computed.visualizer.lengthM}
                heightM={computed.visualizer.heightM}
                thicknessMm={computed.visualizer.thicknessMm}
                brick={activeBrickDims}
                jointMm={num(jointMm)}
                bond={bond}
                openings={computed.visualizer.openings}
                ariaLabel={computed.visualizer.ariaLabel}
              />
            ) : (
              <BrickWallVisualizer
                lengthM={0}
                heightM={0}
                thicknessMm={num(thicknessMm)}
                brick={activeBrickDims}
                jointMm={num(jointMm)}
                bond={bond}
                openings={[]}
                ariaLabel="Wall elevation preview"
              />
            )}
            {computed.ok && (
              <WallSectionDiagram
                thicknessMm={computed.visualizer.thicknessMm}
                brick={activeBrickDims}
                jointMm={num(jointMm)}
              />
            )}

            <div className="bg-bg-card border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden shadow-brand-md">
              <div className="px-6 md:px-8 py-5 border-b border-ui-borderSubtle dark:border-ink-600 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent-100 text-accent-800 rounded-2xl">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-txt-primary dark:text-white text-lg font-medium">
                      Your brick estimate
                    </h3>
                    <p className="text-sm text-txt-secondary">
                      {modeLabel} · Instant results — updates as you type.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 border border-ui-borderSubtle text-txt-secondary text-xs font-medium uppercase tracking-wider rounded-full">
                  {currency}
                </span>
              </div>

              {!computed.ok || !results ? (
                <div className="p-6 md:p-8">
                  <p className="text-sm font-semibold text-ui-errorText bg-ui-error/10 border border-ui-error/30 rounded-2xl px-4 py-3">
                    {computed.ok ? "Enter your wall details to see the estimate." : computed.error}
                  </p>
                  <p className="text-sm text-txt-tertiary mt-3">
                    No results are shown until the inputs are valid — a wrong number is worse than
                    no number.
                  </p>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-4">
                  {/* Persistent rate strip — bricks / cement / sand per cubic
                      foot for the current thickness and mix (engine-computed). */}
                  {strip && (
                    <div
                      className="flex flex-wrap gap-2"
                      aria-label="Rates per cubic foot of wall"
                    >
                      <span className="px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/20 border border-ui-borderSubtle text-xs font-semibold">
                        {strip.bricksPerCft.toFixed(1)} bricks / cft
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/20 border border-ui-borderSubtle text-xs font-semibold">
                        {strip.cementBagsPerCft.toFixed(3)} bags / cft
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/20 border border-ui-borderSubtle text-xs font-semibold">
                        {strip.sandCftPerCft.toFixed(2)} sand cft / cft
                      </span>
                    </div>
                  )}
                  {computed.reverse && (
                    <div className="border border-accent-500/50 bg-accent-50 dark:bg-accent-900/20 rounded-2xl px-4 py-3 text-sm">
                      <strong className="text-txt-primary dark:text-white">
                        {formatInt(computed.reverse.bricks)} bricks cover{" "}
                        {computed.reverse.areaSqFt.toFixed(1)} sq ft
                      </strong>{" "}
                      <span className="text-txt-secondary">
                        ({computed.reverse.areaM2.toFixed(2)} m²) of {thicknessMm} mm wall
                        before wastage — about{" "}
                        {results.bricksPerSqFt.toFixed(1)} bricks per sq ft. Ordering for
                        that area with {wastagePct}% wastage is {formatInt(results.bricks)}{" "}
                        bricks, below.
                      </span>
                    </div>
                  )}
                  {computed.budget && (
                    <div className="border border-accent-500/50 bg-accent-50 dark:bg-accent-900/20 rounded-2xl px-4 py-3 text-sm">
                      <strong className="text-txt-primary dark:text-white">
                        {formatMoney(computed.budget.pricePerSqFt, currency)} per sq ft ·{" "}
                        {formatMoney(computed.budget.pricePer1000, currency)} per 1,000
                      </strong>{" "}
                      <span className="text-txt-secondary">
                        for {formatInt(computed.budget.bricks)} bricks to order
                        {computed.budget.bricksAffordable != null
                          ? ` — your budget buys ${formatInt(computed.budget.bricksAffordable)} bricks at the entered brick rate`
                          : " — enter a brick rate above to see how many bricks the budget buys"}
                        .
                      </span>
                    </div>
                  )}
                  <ResultCard
                    title="Total bricks to order"
                    value={formatInt(results.bricks)}
                    unit="pcs"
                    variant="primary"
                    icon={<Layers className="w-5 h-5 text-accent-800" />}
                    description={`${formatInt(results.bricksBeforeWastage)} before wastage + ${formatInt(results.wastageBricks)} wastage (${wastagePct}%) · ${results.bricksPerSqFt.toFixed(1)} per sq ft · ${results.bricksPerM2.toFixed(1)} per m²`}
                  />
                  {packing && (
                    <div className="border border-ui-borderSubtle dark:border-ink-600 rounded-2xl px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <span className="text-txt-secondary">Order as packs</span>
                          <p className="font-semibold text-txt-primary dark:text-white">
                            {packing.packs} packs of {packing.packSize}
                            {packing.spareBricks > 0
                              ? ` (${packing.spareBricks} spare in the last pack)`
                              : ""}
                          </p>
                          <p className="text-txt-secondary">
                            {packing.pallets} pallets of {packing.palletSize}
                            {packing.trucks != null ? ` · ${packing.trucks} truckloads` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label htmlFor="brick-pack-size" className="text-xs text-txt-tertiary">
                            Pack size
                          </label>
                          <input
                            id="brick-pack-size"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={packSize}
                            onChange={(e) => setPackSize(e.target.value)}
                            className="w-20 bg-bg-card border border-ui-borderSubtle dark:border-ink-600 rounded-full px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                          <label htmlFor="brick-pallet-size" className="text-xs text-txt-tertiary">
                            Pallet
                          </label>
                          <input
                            id="brick-pallet-size"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            value={palletSize}
                            onChange={(e) => setPalletSize(e.target.value)}
                            className="w-20 bg-bg-card border border-ui-borderSubtle dark:border-ink-600 rounded-full px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                          <label htmlFor="brick-truck-capacity" className="text-xs text-txt-tertiary">
                            Truck
                          </label>
                          <input
                            id="brick-truck-capacity"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={truckCapacity}
                            onChange={(e) => setTruckCapacity(e.target.value)}
                            placeholder="e.g. 10000"
                            className="w-24 bg-bg-card border border-ui-borderSubtle dark:border-ink-600 rounded-full px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-txt-tertiary mt-2">
                        Pack and pallet sizes vary by supplier (commonly 400–520 per pack in
                        the UK and US) — edit them to match your quote. Truckloads appear
                        only when you enter a truck capacity.
                      </p>
                    </div>
                  )}
                  {computed.perWall && (
                    <div className="border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-txt-secondary px-4 py-3 bg-surface-default">
                        Per-wall subtotals
                      </h4>
                      <dl className="divide-y divide-ui-borderSubtle dark:divide-ink-600 text-sm">
                        {computed.perWall.map((pw) => (
                          <div key={pw.wall.id} className="flex justify-between gap-3 px-4 py-2.5">
                            <dt className="text-txt-secondary">
                              {pw.wall.name} ({pw.wall.length} × {pw.wall.height} {lengthUnit})
                            </dt>
                            <dd className="font-semibold text-right">
                              {formatInt(pw.results.bricks)} bricks · {pw.results.cementBags} bags ·{" "}
                              {pw.results.sandCft.toFixed(1)} cft sand
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <ResultCard
                      title="Cement"
                      value={results.cementBags}
                      unit={`bags (${results.cementBagKg} kg)`}
                      variant="secondary"
                      description={`${formatInt(results.cementKg)} kg · ${results.dryMortarM3.toFixed(2)} m³ dry mortar`}
                    />
                    <ResultCard
                      title="Sand"
                      value={results.sandCft.toFixed(1)}
                      unit="cft"
                      variant="warning"
                      description={`${results.sandM3.toFixed(2)} m³`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ResultCard
                      title="Net wall area"
                      value={results.netAreaM2.toFixed(2)}
                      unit="m²"
                      variant="neutral"
                      description={`${results.netAreaSqFt.toFixed(1)} sq ft · gross ${results.grossAreaM2.toFixed(2)} m² − openings ${results.openingsAreaM2.toFixed(2)} m²`}
                    />
                    <ResultCard
                      title="Wall volume"
                      value={results.wallVolumeM3.toFixed(2)}
                      unit="m³"
                      variant="neutral"
                      description={`${results.wallVolumeCft.toFixed(1)} cft · wet mortar ${results.wetMortarM3.toFixed(2)} m³ (${results.wetMortarCft.toFixed(1)} cft)`}
                    />
                  </div>
                  <div className="border border-ui-borderSubtle dark:border-ink-600 rounded-2xl px-4 py-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-txt-secondary">Dry mortar (× 1.33)</span>
                      <span className="font-semibold">
                        {results.dryMortarM3.toFixed(2)} m³ · {results.dryMortarCft.toFixed(1)} cft
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 mt-1.5">
                      <span className="text-txt-secondary">Wet mortar (× 1.15 frog)</span>
                      <span className="font-semibold">
                        {results.wetMortarM3.toFixed(2)} m³ · {results.wetMortarCft.toFixed(1)} cft
                      </span>
                    </div>
                  </div>

                  {costOpen && (
                    <div className="border-t border-ui-borderSubtle dark:border-ink-600 pt-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-txt-secondary mb-3">
                        Estimated material cost ({currency})
                      </h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-txt-secondary">Bricks ({formatInt(results.bricks)} pcs)</dt>
                          <dd className="font-semibold">{formatMoney(results.brickCost, currency)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-txt-secondary">Cement ({results.cementBags} bags)</dt>
                          <dd className="font-semibold">{formatMoney(results.cementCost, currency)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-txt-secondary">Sand ({results.sandCft.toFixed(1)} cft)</dt>
                          <dd className="font-semibold">{formatMoney(results.sandCost, currency)}</dd>
                        </div>
                        {labourCost != null && (
                          <div className="flex justify-between">
                            <dt className="text-txt-secondary">
                              Labour (
                              {labourBasis === "perSqFt"
                                ? "per sq ft"
                                : labourBasis === "per1000"
                                  ? "per 1,000 bricks"
                                  : "per day"}
                              )
                            </dt>
                            <dd className="font-semibold">{formatMoney(labourCost, currency)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-ui-borderSubtle dark:border-ink-600 pt-2 text-base">
                          <dt className="font-semibold">
                            Total ({labourCost != null ? "materials + labour" : "materials only"})
                          </dt>
                          <dd className="font-bold">
                            {formatMoney(labourCost != null ? grandTotal : results.totalCost, currency)}
                          </dd>
                        </div>
                      </dl>
                      {!results.costComplete && (
                        <p className="text-xs text-txt-tertiary mt-2">
                          Enter the missing rate above to complete the cost. Labour, transport and
                          taxes are not included.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border-t border-ui-borderSubtle dark:border-ink-600 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-txt-secondary mb-2">
                      How this was calculated
                    </h4>
                    <ul className="text-sm text-txt-secondary space-y-1">
                      <li>
                        Gross area ={" "}
                        {mode === "single"
                          ? `${length} × ${height} ${lengthUnit} = ${results.grossAreaM2.toFixed(2)} m² (${results.grossAreaSqFt.toFixed(1)} sq ft)`
                          : mode === "multi"
                            ? `sum of ${walls.length} walls = ${results.grossAreaM2.toFixed(2)} m² (${results.grossAreaSqFt.toFixed(1)} sq ft)`
                            : `${area} ${areaUnit === "sqft" ? "sq ft" : "m²"} = ${results.grossAreaM2.toFixed(2)} m²`}
                      </li>
                      <li>
                        Net area = gross − openings = {results.grossAreaM2.toFixed(2)} −{" "}
                        {results.openingsAreaM2.toFixed(2)} = {results.netAreaM2.toFixed(2)} m²
                      </li>
                      <li>
                        Wall volume = net area × thickness = {results.netAreaM2.toFixed(2)} m² ×{" "}
                        {mode === "area" ? areaThicknessMm : mode === "multi" ? "per-wall thickness" : thicknessMm} mm ={" "}
                        {results.wallVolumeM3.toFixed(2)} m³ ({results.wallVolumeCft.toFixed(1)} cft)
                      </li>
                      <li>
                        One brick with {jointMm} mm joint = {activeBrickDims.l} × {activeBrickDims.w} ×{" "}
                        {activeBrickDims.h} mm + joint
                      </li>
                      <li>
                        Bricks = wall volume ÷ brick-with-mortar volume ={" "}
                        {formatInt(results.bricksBeforeWastage)} before wastage
                      </li>
                      <li>
                        To order = {formatInt(results.bricksBeforeWastage)} × (1 + {wastagePct}%) ={" "}
                        {formatInt(results.bricks)} bricks
                      </li>
                      <li>
                        Dry mortar = wet mortar × 1.33 (× 1.15 frog allowance), split {cementParts}:
                        {sandParts}; cement bags = cement volume ÷{" "}
                        {(num(cementBagKg) * 0.0347 / 50).toFixed(4)} m³ per {num(cementBagKg)} kg bag
                      </li>
                      <li>
                        Bricks per cubic foot = {results.bricksPerCft.toFixed(1)} · cement per
                        1,000 bricks = {formatInt(results.cementKgPer1000)} kg · sand per 1,000
                        bricks = {results.sandCftPer1000.toFixed(1)} cft
                      </li>
                      {mode === "single" && (
                        <li>
                          Courses = wall height ÷ course height (
                          {activeBrickDims.h} mm brick + {jointMm} mm joint) ={" "}
                          {courseCount(
                            parseLengthValue(height, lengthUnit) * LENGTH_UNIT_TO_M[lengthUnit],
                            activeBrickDims.h,
                            num(jointMm),
                          )}{" "}
                          courses{shape === "gable" ? " in the rectangular part (the triangle tapers)" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 print:hidden">
              <button
                type="button"
                onClick={handlePdf}
                disabled={!computed.ok}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink-700 transition-colors disabled:opacity-40"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("trigger-global-save"))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink-700 transition-colors"
              >
                <Save className="w-4 h-4" /> Save calculation
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("trigger-global-history"))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors"
              >
                <History className="w-4 h-4" /> Saved calculations
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={!computed.ok}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors disabled:opacity-40"
              >
                {shared ? <Check className="w-4 h-4 text-ui-successText" /> : <Share2 className="w-4 h-4" />}
                {shared ? "Shared / copied" : "Share"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!computed.ok}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-4 h-4 text-ui-successText" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy BOQ"}
              </button>
              {computed.ok && results && (
                <GenericExportButtons
                  filename="brick-estimate"
                  data={{
                    headers: ["Item", "Quantity", "Unit"],
                    rows: [
                      ["Bricks to order", formatInt(results.bricks), "pcs"],
                      ["Bricks before wastage", formatInt(results.bricksBeforeWastage), "pcs"],
                      ["Wastage bricks", formatInt(results.wastageBricks), "pcs"],
                      ["Bricks per sq ft", results.bricksPerSqFt.toFixed(1), "pcs/sq ft"],
                      ["Net wall area", results.netAreaSqFt.toFixed(1), "sq ft"],
                      ["Net wall area", results.netAreaM2.toFixed(2), "m²"],
                      ["Masonry volume", results.wallVolumeM3.toFixed(2), "m³"],
                      ["Wet mortar", results.wetMortarM3.toFixed(2), "m³"],
                      ["Dry mortar", results.dryMortarM3.toFixed(2), "m³"],
                      ["Cement", String(results.cementBags), "bags"],
                      ["Cement", formatInt(results.cementKg), "kg"],
                      ["Sand", results.sandCft.toFixed(1), "cft"],
                      ["Sand", results.sandM3.toFixed(2), "m³"],
                      ["Bricks per cft", results.bricksPerCft.toFixed(1), "pcs/cft"],
                      ["Cement per 1,000 bricks", formatInt(results.cementKgPer1000), "kg"],
                      ["Sand per 1,000 bricks", results.sandCftPer1000.toFixed(1), "cft"],
                      ...(packing
                        ? [
                            ["Packs to order", String(packing.packs), `packs of ${packing.packSize}`],
                            ["Pallets to order", String(packing.pallets), `pallets of ${packing.palletSize}`],
                            ...(packing.trucks != null
                              ? [["Truckloads", String(packing.trucks), "loads"] as (string | number)[]]
                              : []),
                          ]
                        : []),
                      ...(labourCost != null
                        ? [["Labour cost", formatMoney(labourCost, currency), currency] as (string | number)[]]
                        : []),
                      ...(results.totalCost != null
                        ? [["Total material cost", formatMoney(results.totalCost, currency), currency] as (string | number)[]]
                        : []),
                    ],
                  }}
                />
              )}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-accent-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {resetDone ? "Reset to defaults ✓" : "Reset to defaults"}
              </button>
            </div>
            <p className="text-xs text-txt-tertiary mt-3">
              Planning estimate only — confirm the final order with your quantity surveyor or
              contractor. Rates are indicative; verify with your supplier.
            </p>
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="brick_calculator" currentInputs={{mode, lengthUnit, length, height, thicknessId, thicknessMm, openings, openingsMode, openingsTotal, walls, area, areaUnit, areaOpenings, areaThicknessId, areaThicknessMm, brickId, customBrickMm, customBrickUnit, jointMm, bond, wastagePreset, wastageCustom, mixId, cementParts, sandParts, cementBagKg, currency, ratesByCurrency, quickLength, quickHeight, quickThicknessId, shape, gableRise, curveRadius, curveAngle, reverseBricks, budgetArea, budgetAreaUnit, budgetAmount, packSize, palletSize, truckCapacity, labourOn, labourBasis, labourRate, labourDays, mortarOpen}} currentResults={results ? { bricks: results.bricks, cementBags: results.cementBags, sandCft: results.sandCft, wallVolumeM3: results.wallVolumeM3, totalCost: results.totalCost } : {}} onRestore={(ins) => {
          if (ins.mode != null) setMode(ins.mode as typeof mode);
          if (ins.lengthUnit != null) setLengthUnit(ins.lengthUnit as typeof lengthUnit);
          if (ins.length != null) setLength(ins.length as typeof length);
          if (ins.height != null) setHeight(ins.height as typeof height);
          if (ins.thicknessId != null) setThicknessId(ins.thicknessId as typeof thicknessId);
          if (ins.thicknessMm != null) setThicknessMm(ins.thicknessMm as typeof thicknessMm);
          if (ins.openings != null) setOpenings(ins.openings as typeof openings);
          if (ins.openingsMode != null) setOpeningsMode(ins.openingsMode as typeof openingsMode);
          if (ins.openingsTotal != null) setOpeningsTotal(ins.openingsTotal as typeof openingsTotal);
          if (ins.walls != null) setWalls(ins.walls as typeof walls);
          if (ins.area != null) setArea(ins.area as typeof area);
          if (ins.areaUnit != null) setAreaUnit(ins.areaUnit as typeof areaUnit);
          if (ins.areaOpenings != null) setAreaOpenings(ins.areaOpenings as typeof areaOpenings);
          if (ins.areaThicknessId != null) setAreaThicknessId(ins.areaThicknessId as typeof areaThicknessId);
          if (ins.areaThicknessMm != null) setAreaThicknessMm(ins.areaThicknessMm as typeof areaThicknessMm);
          if (ins.brickId != null) setBrickId(ins.brickId as typeof brickId);
          if (ins.customBrickMm != null) setCustomBrickMm(ins.customBrickMm as typeof customBrickMm);
          if (ins.customBrickUnit != null) setCustomBrickUnit(ins.customBrickUnit as typeof customBrickUnit);
          if (ins.jointMm != null) setJointMm(ins.jointMm as typeof jointMm);
          if (ins.bond != null) setBond(ins.bond as typeof bond);
          if (ins.wastagePreset != null) setWastagePreset(ins.wastagePreset as typeof wastagePreset);
          if (ins.wastageCustom != null) setWastageCustom(ins.wastageCustom as typeof wastageCustom);
          if (ins.mixId != null) setMixId(ins.mixId as typeof mixId);
          if (ins.cementParts != null) setCementParts(ins.cementParts as typeof cementParts);
          if (ins.sandParts != null) setSandParts(ins.sandParts as typeof sandParts);
          if (ins.cementBagKg != null) setCementBagKg(ins.cementBagKg as typeof cementBagKg);
          if (ins.currency != null) setCurrency(ins.currency as typeof currency);
          if (ins.ratesByCurrency != null) setRatesByCurrency(ins.ratesByCurrency as typeof ratesByCurrency);
          if (ins.quickLength != null) setQuickLength(ins.quickLength as typeof quickLength);
          if (ins.quickHeight != null) setQuickHeight(ins.quickHeight as typeof quickHeight);
          if (ins.quickThicknessId != null) setQuickThicknessId(ins.quickThicknessId as typeof quickThicknessId);
          if (ins.shape != null) setShape(ins.shape as typeof shape);
          if (ins.gableRise != null) setGableRise(ins.gableRise as typeof gableRise);
          if (ins.curveRadius != null) setCurveRadius(ins.curveRadius as typeof curveRadius);
          if (ins.curveAngle != null) setCurveAngle(ins.curveAngle as typeof curveAngle);
          if (ins.reverseBricks != null) setReverseBricks(ins.reverseBricks as typeof reverseBricks);
          if (ins.budgetArea != null) setBudgetArea(ins.budgetArea as typeof budgetArea);
          if (ins.budgetAreaUnit != null) setBudgetAreaUnit(ins.budgetAreaUnit as typeof budgetAreaUnit);
          if (ins.budgetAmount != null) setBudgetAmount(ins.budgetAmount as typeof budgetAmount);
          if (ins.packSize != null) setPackSize(ins.packSize as typeof packSize);
          if (ins.palletSize != null) setPalletSize(ins.palletSize as typeof palletSize);
          if (ins.truckCapacity != null) setTruckCapacity(ins.truckCapacity as typeof truckCapacity);
          if (ins.labourOn != null) setLabourOn(ins.labourOn as typeof labourOn);
          if (ins.labourBasis != null) setLabourBasis(ins.labourBasis as typeof labourBasis);
          if (ins.labourRate != null) setLabourRate(ins.labourRate as typeof labourRate);
          if (ins.labourDays != null) setLabourDays(ins.labourDays as typeof labourDays);
          if (ins.mortarOpen != null) setMortarOpen(ins.mortarOpen as typeof mortarOpen);
        }} />
    </div>
  );
}
