import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  AREA_UNIT_TO_M2,
  BOND_PATTERNS,
  BRICK_PRESETS,
  THICKNESS_PRESETS,
  calcBrickProject,
  calcBrickwork,
  calcBrickworkFromArea,
  convertLength,
  formatInt,
  formatMoney,
  CURRENCY_META,
  LENGTH_UNITS,
  LENGTH_UNIT_TO_M,
  defaultBrickInputs,
  type BondPattern,
  type BrickInputs,
  type BrickPreset,
  type BrickResults,
  type BrickWallInput,
  type Currency,
  type LengthUnit,
  type OpeningInput,
} from "../../lib/brickCalc";
import BrickWallVisualizer, { type VisualizerOpening } from "./BrickWallVisualizer";
import { ResultCard } from "../ui/ResultCard";
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
  Share2,
  Trash2,
} from "lucide-react";

const MIX_PRESETS: { id: string; label: string; mix: [number, number] }[] = [
  { id: "1:3", label: "1:3 — load-bearing", mix: [1, 3] },
  { id: "1:4", label: "1:4 — general (standard)", mix: [1, 4] },
  { id: "1:5", label: "1:5 — general (lean)", mix: [1, 5] },
  { id: "1:6", label: "1:6 — partitions / lean", mix: [1, 6] },
  { id: "custom", label: "Custom mix", mix: [1, 4] },
];

const WASTAGE_PILLS = [0, 5, 10, 15];

/** Generic indicative defaults per currency (Nov 2026). City pages override these. */
export const DEFAULT_RATES: Record<
  Currency,
  { brickPer1000: number | null; cementPerBag: number | null; sandPerUnit: number | null }
> = {
  PKR: { brickPer1000: 20000, cementPerBag: 1550, sandPerUnit: 50 },
  INR: { brickPer1000: 10000, cementPerBag: 400, sandPerUnit: 80 },
  AED: { brickPer1000: null, cementPerBag: 25, sandPerUnit: null },
};

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

type CalcMode = "single" | "multi" | "area";
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

const fmtConverted = (v: number): string => {
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
      <div className="flex gap-2 mb-3" role="group" aria-label="Openings entry mode">
        <button
          type="button"
          onClick={() => setOpeningsMode("list")}
          aria-pressed={openingsMode === "list"}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            openingsMode === "list"
              ? "bg-ink text-white border-ink"
              : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
          }`}
        >
          Per opening
        </button>
        <button
          type="button"
          onClick={() => setOpeningsMode("total")}
          aria-pressed={openingsMode === "total"}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            openingsMode === "total"
              ? "bg-ink text-white border-ink"
              : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
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

export default function BrickCalculator({ initial, ratesNote }: BrickCalculatorProps) {
  const initialCurrency: Currency = initial?.currency ?? "PKR";
  const initialRates: RatesState = {
    PKR: ratesToStrings(DEFAULT_RATES.PKR),
    INR: ratesToStrings(DEFAULT_RATES.INR),
    AED: ratesToStrings(DEFAULT_RATES.AED),
  };
  if (initial?.rates) {
    initialRates[initialCurrency] = {
      brick: initial.rates.brickPer1000 != null ? String(initial.rates.brickPer1000) : "",
      cement: initial.rates.cementPerBag != null ? String(initial.rates.cementPerBag) : "",
      sand: initial.rates.sandPerUnit != null ? String(initial.rates.sandPerUnit) : "",
    };
  }

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
  const [cementBagKg, setCementBagKg] = useState<string>("50");
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
    const conv = (s: string) => fmtConverted(convertLength(num(s), lengthUnit, u));
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
    length: num(w.length),
    height: num(w.height),
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
      if (!(num(length) > 0 && num(height) > 0))
        return { ok: false, error: "Enter a wall length and height greater than zero." };
      if (!(num(thicknessMm) > 0))
        return { ok: false, error: "Enter a wall thickness greater than zero." };
      const inputs: BrickInputs = {
        length: num(length),
        height: num(height),
        lengthUnit,
        thicknessMm: num(thicknessMm),
        openings: openingsMode === "list" ? openings : [],
        openingsTotalAreaM2:
          openingsMode === "total"
            ? num(openingsTotal) * Math.pow(toM, 2)
            : null,
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
                  lengthM: Math.min(Math.sqrt(num(openingsTotal) * toM * toM), num(length) * toM * 0.9),
                  heightM: Math.min(
                    (num(openingsTotal) * toM * toM) /
                      Math.min(Math.sqrt(num(openingsTotal) * toM * toM), num(length) * toM * 0.9),
                    num(height) * toM * 0.9,
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
      return {
        ok: true,
        results,
        visualizer: {
          lengthM: num(length) * toM,
          heightM: num(height) * toM,
          thicknessMm: num(thicknessMm),
          openings: vizOpenings,
          ariaLabel: `Wall elevation, ${length} ${lengthUnit} by ${height} ${lengthUnit}, ${thicknessMm} mm thick, ${bond} bond, ${openingCount} opening${openingCount === 1 ? "" : "s"}`,
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
    brick, brickId, customBrickMm, jointMm, bond, wastagePct, cementParts, sandParts,
    cementBagKg, currency, sharedSettings,
  ]);

  const results = computed.ok ? computed.results : null;
  const sandUnit = CURRENCY_META[currency].sandUnit;
  const thicknessPreset = THICKNESS_PRESETS.find((t) => t.id === thicknessId);
  const areaThicknessPreset = THICKNESS_PRESETS.find((t) => t.id === areaThicknessId);
  const bondInfo = BOND_PATTERNS.find((b) => b.id === bond) ?? BOND_PATTERNS[1];
  const activeBrickDims = brickId === "custom" ? customBrickMm : { l: brick.l, w: brick.w, h: brick.h };

  const modeLabel = mode === "single" ? "Single wall" : mode === "multi" ? "Multi-wall room project" : "Total wall area";

  const summaryText = (): string => {
    if (!computed.ok || !results) return "";
    const wallSpec =
      mode === "single"
        ? `Wall: ${length} × ${height} ${lengthUnit}, ${thicknessMm} mm thick`
        : mode === "multi"
          ? `Project: ${walls.map((w) => `${w.name || "Wall"} ${w.length} × ${w.height} ${lengthUnit}, ${w.thicknessMm} mm`).join("; ")}`
          : `Wall area: ${area} ${areaUnit === "sqft" ? "sq ft" : "m²"}, ${areaThicknessMm} mm thick`;
    const lines = [
      `Brick estimate — Civil Estimation Pro`,
      `${modeLabel} — ${wallSpec}`,
      `Brick: ${brick.label}; joint ${jointMm} mm (≈ ${(num(jointMm) / 25.4).toFixed(2)} in); bond ${bondInfo.label}; mix ${cementParts}:${sandParts}; wastage ${wastagePct}%`,
      ``,
      `Bricks: ${formatInt(results.bricks)} pcs to order (${formatInt(results.bricksBeforeWastage)} before wastage + ${formatInt(results.wastageBricks)} wastage)`,
      `Bricks per sq ft: ${results.bricksPerSqFt.toFixed(1)} (${results.bricksPerM2.toFixed(1)} per m²)`,
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
    if (results.totalCost != null) {
      lines.push(`Cost (${currency}): bricks ${formatMoney(results.brickCost, currency)}; cement ${formatMoney(results.cementCost, currency)}; sand ${formatMoney(results.sandCost, currency)}`);
      lines.push(`Total (materials only): ${formatMoney(results.totalCost, currency)}`);
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
      PKR: ratesToStrings(DEFAULT_RATES.PKR),
      INR: ratesToStrings(DEFAULT_RATES.INR),
      AED: ratesToStrings(DEFAULT_RATES.AED),
    });
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  const customBrickDisplay = (dim: "l" | "w" | "h"): string =>
    customBrickUnit === "mm" ? String(customBrickMm[dim]) : fmtConverted(customBrickMm[dim] / 25.4);
  const onCustomBrickDisplay = (dim: "l" | "w" | "h", value: string) => {
    const v = parseFloat(value) || 0;
    const mm = customBrickUnit === "mm" ? v : v * 25.4;
    setCustomBrickMm((prev) => ({ ...prev, [dim]: Math.round(mm * 10) / 10 }));
  };

  return (
    <div className="w-full">
      {/* Calculation mode */}
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Calculation mode">
        {(
          [
            ["single", "Single wall"],
            ["multi", "Multi-wall room project"],
            ["area", "Total wall area"],
          ] as [CalcMode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
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
            : "Already know the total wall area? Enter it directly — no length and height needed."}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-start">
        {/* Inputs */}
        <div className="space-y-8">
          {mode === "area" ? (
            <section aria-label="Total wall area">
              <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
                <span className="w-2 h-2 rounded-full bg-ink" />
                Wall area
              </h3>
              <div className="flex gap-2 mb-4" role="group" aria-label="Area unit">
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
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      areaUnit === u
                        ? "bg-ink text-white border-accent-800"
                        : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
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
              <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Length unit">
                {LENGTH_UNITS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onLengthUnitChange(u.id)}
                    aria-pressed={lengthUnit === u.id}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      lengthUnit === u.id
                        ? "bg-ink text-white border-accent-800"
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
                          type="number"
                          inputMode="decimal"
                          min="0"
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
                          type="number"
                          inputMode="decimal"
                          min="0"
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
                <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Length unit">
                  {LENGTH_UNITS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onLengthUnitChange(u.id)}
                      aria-pressed={lengthUnit === u.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        lengthUnit === u.id
                          ? "bg-ink text-white border-accent-800"
                          : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-txt-tertiary -mt-2 mb-3">
                  Switching units converts the numbers you already entered — nothing is lost.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="brick-wall-length" className={labelCls}>
                      Length ({lengthUnit})
                    </label>
                    <input
                      id="brick-wall-length"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className={inputCls}
                      placeholder={lengthUnit === "ft" ? "e.g. 10" : "e.g. 3"}
                    />
                  </div>
                  <div>
                    <label htmlFor="brick-wall-height" className={labelCls}>
                      Height ({lengthUnit})
                    </label>
                    <input
                      id="brick-wall-height"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={inputCls}
                      placeholder={lengthUnit === "ft" ? "e.g. 10" : "e.g. 3"}
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
            {brickId === "custom" && (
              <>
                <div className="flex gap-2 mt-3" role="group" aria-label="Custom brick size unit">
                  {(["mm", "in"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setCustomBrickUnit(u)}
                      aria-pressed={customBrickUnit === u}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        customBrickUnit === u
                          ? "bg-ink text-white border-ink"
                          : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
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
                  min="0"
                  value={cementBagKg}
                  onChange={(e) => setCementBagKg(e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-txt-tertiary mt-1">50 kg is the PK/IN/AE standard.</p>
              </div>
            </div>

            <div className="mt-4">
              <span className={labelCls}>Wastage</span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Wastage percent">
                {WASTAGE_PILLS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setWastagePreset(p)}
                    aria-pressed={wastagePreset === p}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
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
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    wastagePreset === "custom"
                      ? "bg-ink text-white border-ink"
                      : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-300"
                  }`}
                >
                  Custom
                </button>
                {wastagePreset === "custom" && (
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="50"
                    value={wastageCustom}
                    onChange={(e) => setWastageCustom(e.target.value)}
                    aria-label="Custom wastage percent"
                    className="w-24 bg-bg-card/80 border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                )}
              </div>
              <p className="text-sm text-txt-tertiary mt-2">
                5% — good Awwal / machine-made bricks, straight wall. 10% — kiln bricks, cut work,
                many openings. 15% — curved walls. Wastage applies to bricks and to mortar.
              </p>
            </div>

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
              <div className="flex flex-wrap gap-2" role="group" aria-label="Bond pattern">
                {BOND_PATTERNS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBond(b.id)}
                    aria-pressed={bond === b.id}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
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
                <div className="flex gap-2 mb-4" role="group" aria-label="Currency">
                  {(["PKR", "INR", "AED"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      aria-pressed={currency === c}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        currency === c
                          ? "bg-ink text-white border-ink"
                          : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-accent-400"
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
                  <ResultCard
                    title="Total bricks to order"
                    value={formatInt(results.bricks)}
                    unit="pcs"
                    variant="primary"
                    icon={<Layers className="w-5 h-5 text-accent-800" />}
                    description={`${formatInt(results.bricksBeforeWastage)} before wastage + ${formatInt(results.wastageBricks)} wastage (${wastagePct}%) · ${results.bricksPerSqFt.toFixed(1)} per sq ft · ${results.bricksPerM2.toFixed(1)} per m²`}
                  />
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
                        <div className="flex justify-between border-t border-ui-borderSubtle dark:border-ink-600 pt-2 text-base">
                          <dt className="font-semibold">Total (materials only)</dt>
                          <dd className="font-bold">{formatMoney(results.totalCost, currency)}</dd>
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
    </div>
  );
}
