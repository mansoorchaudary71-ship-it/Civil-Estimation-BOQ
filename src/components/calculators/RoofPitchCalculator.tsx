import { Button } from "../ui/Button";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Triangle,
  Ruler,
  Calculator,
  Download,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { exportBOQToPDF } from "../../lib/pdfExport";
import {
  ARCHITECTURAL_DISCLAIMER,
  CURRENCY_META,
  EMPTY_ROOF_RATES,
  calcRoof,
  calcRoofCost,
  type Currency,
  type RoofMaterialRates,
  type RoofType,
} from "../../lib/architecturalCalc";
import { formatMoney } from "../../lib/brickCalc";
import { useSettings } from "../../context/SettingsContext";

type UnitSystem = "metric" | "imperial";
type PitchMode = "rise" | "x12" | "deg" | "pct";

const FT_TO_M = 0.3048;
const FT_PER_M = 1 / FT_TO_M;

function toM(v: number, unit: UnitSystem): number {
  return unit === "metric" ? v : v * FT_TO_M;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

/** Two-field ft + in input that stores one decimal-ft value. */
function FtInInput({
  label,
  valueFt,
  onChange,
  hint,
}: {
  label: string;
  valueFt: number;
  onChange: (decimalFt: number) => void;
  hint?: string;
}) {
  const ft = Math.floor(valueFt || 0);
  const inch = Math.round(((valueFt || 0) - ft) * 12 * 10) / 10;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-txt-secondary">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={ft}
            aria-label={`${label} (feet)`}
            onChange={(e) => {
              const f = Math.max(0, parseFloat(e.target.value) || 0);
              onChange(f + inch / 12);
            }}
            className="w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all"
          />
          <span className="text-sm text-txt-tertiary">ft</span>
        </div>
        <div className="flex-1 flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={11.9}
            step={0.5}
            value={inch}
            aria-label={`${label} (inches)`}
            onChange={(e) => {
              const i = Math.max(0, Math.min(11.9, parseFloat(e.target.value) || 0));
              onChange(ft + i / 12);
            }}
            className="w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all"
          />
          <span className="text-sm text-txt-tertiary">in</span>
        </div>
      </div>
      {hint && <p className="text-xs text-txt-tertiary">{hint}</p>}
    </div>
  );
}

function DimInput({
  label,
  value,
  unit,
  onChange,
  hint,
  min = 0,
  step = 0.1,
}: {
  label: string;
  value: number;
  unit: UnitSystem;
  onChange: (v: number) => void;
  hint?: string;
  min?: number;
  step?: number;
}) {
  if (unit === "imperial") {
    return <FtInInput label={label} valueFt={value} onChange={onChange} hint={hint} />;
  }
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-txt-secondary">{label}</label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all"
      />
      {hint && <p className="text-xs text-txt-tertiary">{hint}</p>}
    </div>
  );
}

const ROOF_FAQS: { q: string; a: string }[] = [
  {
    q: "What does roof pitch in X:12 mean, and how does it relate to degrees?",
    a: "X:12 is the rise over a 12-unit run: 6:12 means the roof rises 6 units for every 12 units of horizontal run. In degrees that is arctan(6/12) = 26.6°, and in percent it is 50%. All three describe the same slope — this calculator keeps them live-synced, so you can enter whichever one your drawings give you.",
  },
  {
    q: "How many bundles of shingles are in one square?",
    a: "One roofing square covers 100 sq ft, and a square of composition shingles is normally 3 bundles (about 33 ft² per bundle). So 22 squares need 66 bundles. This calculator rounds squares up — you cannot buy part of a square — and applies your wastage percentage before rounding.",
  },
  {
    q: "How many felt rolls do I need?",
    a: "One roll of #15 felt covers about 432 sq ft (36 in × 144 ft) and one roll of #30 felt about 216 sq ft (36 in × 72 ft). Divide the roof area by the coverage and round up. #30 is thicker and used under heavier shingles or on low slopes; most homes use #15.",
  },
  {
    q: "How is a hip roof area different from a gable roof?",
    a: "A gable roof is two rectangles: 2 × rafter length × building length. A hip roof slopes on all four sides, so its area is the horizontal projection (including the overhangs on all sides) divided by cos θ — the same pitch multiplier, applied to a bigger footprint. The hip and valley rafters are longer than common rafters; this calculator approximates them at 1.5 × the common run and says so, because the exact length depends on the hip geometry.",
  },
  {
    q: "My roof in Pakistan is flat — can I use this calculator?",
    a: "No — this calculator is for pitched roofs. Most houses in Pakistan have a flat RCC slab roof, and a pitch of 0 gives a flat result on purpose. For a flat roof, use the Concrete / Slab tools on this site to estimate the slab, and use this calculator only if you are adding a pitched roof, a pergola, or a sloped sheet roof.",
  },
];

const RATE_FIELDS: {
  key: keyof RoofMaterialRates;
  label: string;
  unit: string;
}[] = [
  { key: "shinglePerSquare", label: "Shingles", unit: "per square" },
  { key: "felt15PerRoll", label: "#15 felt", unit: "per roll" },
  { key: "felt30PerRoll", label: "#30 felt", unit: "per roll" },
  { key: "ridgeCapPerBundle", label: "Ridge cap", unit: "per bundle" },
  { key: "dripEdgePerM", label: "Drip edge", unit: "per m" },
  { key: "rafterPerM", label: "Rafter timber", unit: "per m of rafter" },
];

export function RoofPitchCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  const [span, setSpan] = useState<number>(10);
  const [rise, setRise] = useState<number>(3);
  const [overhang, setOverhang] = useState<number>(0.5);
  const [buildingLength, setBuildingLength] = useState<number>(15);
  const [rakeOverhang, setRakeOverhang] = useState<number>(0);
  const [pitchMode, setPitchMode] = useState<PitchMode>("rise");
  const [pitchVal, setPitchVal] = useState<number>(0);
  const [roofType, setRoofType] = useState<RoofType>("gable");
  const [wastePct, setWastePct] = useState<number>(10);
  const [spacing, setSpacing] = useState<number>(0.4);
  // Currency defaults to the global setting (PKR/INR/AED); the picker
  // still lets the user override it per tool. Rates start empty, so no
  // rate defaults need clearing for other currencies.
  const { settings } = useSettings();
  const initialCurrency: Currency = (["PKR", "INR", "AED"] as string[]).includes(settings.currency) ? (settings.currency as Currency) : "PKR";
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [rates, setRates] = useState<RoofMaterialRates>(EMPTY_ROOF_RATES);
  const [copied, setCopied] = useState(false);

  // Switching units CONVERTS the values (the old code reset them to defaults).
  const switchUnits = (next: UnitSystem) => {
    if (next === unitSystem) return;
    const f = next === "imperial" ? FT_PER_M : FT_TO_M;
    setSpan((v) => round2(v * f));
    setRise((v) => round2(v * f));
    setOverhang((v) => round2(v * f));
    setBuildingLength((v) => round2(v * f));
    setRakeOverhang((v) => round2(v * f));
    setSpacing((v) => round2(v * f));
    setUnitSystem(next);
  };

  const roofInput = useMemo(() => {
    const base = {
      spanM: toM(span, unitSystem),
      overhangHM: toM(overhang, unitSystem),
      lengthM: toM(buildingLength, unitSystem),
      rakeOverhangM: toM(rakeOverhang, unitSystem),
      roofType,
      wastePct,
      rafterSpacingM: toM(spacing, unitSystem),
    };
    if (pitchMode === "rise") return { ...base, riseM: toM(rise, unitSystem) };
    if (pitchMode === "x12") return { ...base, pitchX12: pitchVal };
    if (pitchMode === "deg") return { ...base, angleDeg: pitchVal };
    return { ...base, pitchPct: pitchVal };
  }, [span, rise, overhang, buildingLength, rakeOverhang, roofType, wastePct, spacing, pitchMode, pitchVal, unitSystem]);

  const result = useMemo(() => calcRoof(roofInput), [roofInput]);
  const cost = useMemo(() => calcRoofCost(result, rates), [result, rates]);

  const switchPitchMode = (mode: PitchMode) => {
    if (mode === pitchMode) return;
    if (mode === "rise") {
      // Derive the rise from the current pitch input so nothing is lost.
      const r = calcRoof({ ...roofInput, riseM: undefined });
      setRise(round2(unitSystem === "metric" ? r.riseM : r.riseM * FT_PER_M));
    } else {
      const r = calcRoof({
        spanM: toM(span, unitSystem),
        riseM: toM(rise, unitSystem),
        overhangHM: toM(overhang, unitSystem),
        lengthM: toM(buildingLength, unitSystem),
        roofType,
      });
      if (mode === "x12") setPitchVal(round1(r.pitchX12));
      else if (mode === "deg") setPitchVal(round1(r.angleDeg));
      else setPitchVal(round1(r.pitchPct));
    }
    setPitchMode(mode);
  };

  const unitL = unitSystem === "metric" ? "m" : "ft";
  const unitA = unitSystem === "metric" ? "m²" : "sq ft";
  const fmtL = (m: number) =>
    unitSystem === "metric" ? `${m.toFixed(2)} m` : `${(m * FT_PER_M).toFixed(2)} ft`;
  const fmtA = (m2: number) =>
    unitSystem === "metric" ? `${m2.toFixed(2)} m²` : `${(m2 * 10.7639).toFixed(2)} sq ft`;
  const sym = CURRENCY_META[currency].symbol;

  const summaryText = () => {
    const lines = [
      "Roof pitch & area estimate — Civil Estimation Pro",
      `Roof: ${roofType}, span ${span} ${unitL}, length ${buildingLength} ${unitL}, overhang ${overhang} ${unitL}`,
      `Pitch: ${result.pitchX12.toFixed(1)}:12 (${result.angleDeg.toFixed(1)}°, ${result.pitchPct.toFixed(1)}%) — ${result.pitchBand}`,
      `Rafter: ${fmtL(result.rafterM)} (run ${fmtL(result.runM)}, rise ${fmtL(result.riseM)}, multiplier ${result.multiplier.toFixed(3)})`,
      `Roof area: ${fmtA(result.roofAreaM2)} (footprint ${fmtA(result.footprintM2)})`,
      `Materials (${wastePct}% waste): ${result.squares} squares, ${result.bundles} bundles, ${result.felt15Rolls} rolls #15 felt, ${result.felt30Rolls} rolls #30 felt, ${result.ridgeCapBundles} ridge-cap bundles, ${result.dripEdgeM.toFixed(1)} m drip edge, ${result.rafterCount} rafters`,
      cost.totalCost != null
        ? `Estimated material cost: ${formatMoney(cost.totalCost, currency)}`
        : "Material cost: — (no rates entered — see the rate fields)",
      "For a flat RCC roof use the Concrete / Slab tools — this calculator is for pitched roofs.",
    ];
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };
  const handlePrint = () => window.print();
  const handlePdf = () => {
    exportBOQToPDF({
      projectName: "Roof Pitch Estimate",
      date: new Date().toLocaleDateString("en-GB"),
      items: cost.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        rate: l.rate ?? 0,
        amount: l.amount ?? 0,
      })),
      totalAmount: cost.totalCost ?? 0,
    });
  };

  const formulaSteps: FormulaStep[] =
    result.errors.length === 0
      ? [
          {
            id: 1,
            label: "1. Run calculation",
            theoretical: roofType === "mono" ? "Run = Span (mono-pitch: one slope spans the full width)" : "Run = Span / 2 (gable/hip: ridge at mid-span)",
            applied: roofType === "mono" ? `Run = ${span} = ${result.runM.toFixed(2)} ${unitL}` : `Run = ${span} / 2 = ${result.runM.toFixed(2)} ${unitL}`,
          },
          {
            id: 2,
            label: "2. Slope angle (θ) and pitch",
            theoretical: "θ = arctan(Rise / Run)\nPitch X:12 = (Rise / Run) × 12\nPitch % = (Rise / Run) × 100\nMultiplier = 1 / cos θ = √(1 + (Rise/Run)²)",
            applied: `θ = arctan(${result.riseM.toFixed(2)} / ${result.runM.toFixed(2)}) = ${result.angleDeg.toFixed(2)}°\nPitch = ${result.pitchX12.toFixed(1)}:12 = ${result.pitchPct.toFixed(1)}%\nMultiplier = ${result.multiplier.toFixed(3)}`,
          },
          {
            id: 3,
            label: "3. Rafter length (corrected)",
            theoretical:
              "Hypotenuse = √(Rise² + Run²)\nOverhang is HORIZONTAL: sloped overhang = overhang / cos θ\nTotal rafter = hypotenuse + sloped overhang",
            applied: `Hypotenuse = √(${result.riseM.toFixed(2)}² + ${result.runM.toFixed(2)}²) = ${result.hypotenuseM.toFixed(2)} ${unitL}\nSloped overhang = ${overhang} / cos θ = ${result.slopedOverhangM.toFixed(2)} ${unitL}\nTotal rafter = ${result.hypotenuseM.toFixed(2)} + ${result.slopedOverhangM.toFixed(2)} = ${result.rafterM.toFixed(2)} ${unitL}`,
          },
          {
            id: 4,
            label: "4. Total roof area",
            theoretical:
              "Gable: area = 2 × (rafter × building length)\nHip: area = footprint incl. overhangs × multiplier\nMono: area = rafter × building length",
            applied: `Area = ${fmtA(result.roofAreaM2)} (footprint ${fmtA(result.footprintM2)} × multiplier ${result.multiplier.toFixed(3)})`,
          },
          {
            id: 5,
            label: "5. Materials",
            theoretical:
              "Squares = ceil(area × (1 + waste%) / 9.2903 m²)\nBundles = squares × 3\n#15 felt rolls = ceil(area / 40.13 m²); #30 = ceil(area / 20.07 m²)\nRidge-cap bundles = ceil(ridge / 9.14 m)\nRafters = (ceil(length / spacing) + 1) per slope",
            applied: `Squares = ${result.squares} · Bundles = ${result.bundles} · #15 felt = ${result.felt15Rolls} rolls · #30 felt = ${result.felt30Rolls} rolls\nRidge-cap bundles = ${result.ridgeCapBundles} · Drip edge = ${result.dripEdgeM.toFixed(1)} m (${result.dripEdgePieces} × 3.05 m pieces) · Rafters = ${result.rafterCount}`,
          },
        ]
      : [];

  // SVG drawing math (same geometry as before, accent tokens only).
  // Rise shown is the DERIVED rise, so the drawing stays correct when the
  // pitch was entered as X:12 / degrees / percent instead of a rise.
  const dispRise = unitSystem === "metric" ? result.riseM : result.riseM * FT_PER_M;
  const svgWidth = 600;
  const svgHeight = 250;
  const p = 40;
  const w = svgWidth - 2 * p;
  const h = svgHeight - 2 * p;
  const totalWidth = span + 2 * overhang;
  const safeTotalWidth = totalWidth > 0 ? totalWidth : 1;
  const safeRise = dispRise > 0 ? dispRise : 1;
  const scale = Math.min(w / safeTotalWidth, h / safeRise);
  const scaledSpan = span * scale;
  const scaledRise = dispRise * scale;
  const scaledOverhang = overhang * scale;
  const cx = svgWidth / 2;
  const bottomY = svgHeight - p - 10;
  const topY = bottomY - scaledRise;
  const leftWall = cx - scaledSpan / 2;
  const rightWall = cx + scaledSpan / 2;
  const drop = span > 0 ? (dispRise / (span / 2)) * overhang * scale : 0;
  const leftEaveX = leftWall - scaledOverhang;
  const leftEaveY = bottomY + drop;
  const rightEaveX = rightWall + scaledOverhang;
  const rightEaveY = bottomY + drop;

  const materialItems = cost.lines
    .filter((l) => l.description !== "Shingle bundles (3 per square)")
    .map((l) => ({
      division: "Roofing",
      description: l.description,
      unit: l.unit,
      quantity: l.quantity,
      rate: l.rate ?? 0,
    }));

  const currentInputs = {
    unitSystem,
    span,
    rise,
    pitchMode,
    pitchVal,
    overhang,
    buildingLength,
    rakeOverhang,
    roofType,
    wastePct,
    spacing,
    currency,
    rates,
  };
  const currentResults = {
    runM: result.runM,
    riseM: result.riseM,
    angleDeg: result.angleDeg,
    pitchX12: result.pitchX12,
    pitchPct: result.pitchPct,
    multiplier: result.multiplier,
    rafterM: result.rafterM,
    roofAreaM2: result.roofAreaM2,
    squares: result.squares,
    bundles: result.bundles,
    felt15Rolls: result.felt15Rolls,
    felt30Rolls: result.felt30Rolls,
    ridgeCapBundles: result.ridgeCapBundles,
    dripEdgeM: result.dripEdgeM,
    rafterCount: result.rafterCount,
    totalCost: cost.totalCost,
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Toolbar */}
      <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-100 text-accent-800">
              <Triangle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-txt-primary">Roof Pitch &amp; Area Calculator</h2>
              <p className="text-txt-secondary text-sm">
                Calculate slope, rafter length, and total roof surface area — plus shingles, felt and cost.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-surface-hover p-1 rounded-xl">
              <Button
                onClick={() => switchUnits("metric")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === "metric" ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary hover:text-txt-primary"}`}
              >
                Metric (m)
              </Button>
              <Button
                onClick={() => switchUnits("imperial")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === "imperial" ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary hover:text-txt-primary"}`}
              >
                Imperial (ft)
              </Button>
            </div>

            <div className="h-8 w-px bg-surface-active mx-1 hidden sm:block" />

            <Button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover transition-colors"
            >
              <Printer size={16} /> Print
            </Button>
            <Button
              onClick={handlePdf}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700 transition-colors shadow-brand-sm"
            >
              <Download size={16} /> Export BOQ
            </Button>
          </div>
        </div>

        <div className="text-sm font-normal text-txt-secondary leading-relaxed space-y-3 mt-6">
          <p>
            A pitched roof is a triangle: half the span is the run, the vertical rise sets the
            slope, and the rafter is the hypotenuse — plus the eave overhang. The overhang is
            measured horizontally, so the sloped length it adds is the overhang divided by cos θ,
            not the overhang itself; adding it directly understates the rafter by about 1.3% on a
            typical roof, which is material you would be short. This calculator does the geometry
            entirely in your browser (no server call), gives the pitch in X:12, degrees and
            percent at once, and turns the roof area into a material takeoff: roofing squares,
            shingle bundles, felt rolls, ridge caps, drip edge and rafter count, with a cost
            total once you enter your supplier&apos;s rates.
          </p>
          <p>
            Worked example: a 10 m span with a 3 m rise, 0.5 m overhang and 15 m length gives a
            5 m run, a 30.96° slope (7.2:12, 60%), a 6.414 m rafter and 192.42 m² of roof — with
            10% waste that is 23 squares and 69 bundles. In imperial the same roof at 30 ft span,
            10 ft rise, 1.5 ft overhang and 50 ft length gives a 19.831 ft rafter, 1,983.1 sq ft,
            22 squares and 66 bundles. Enter the pitch however your drawings give it — rise,
            X:12, degrees or percent — and the other three follow. This calculator is for pitched
            roofs only: for a flat RCC roof, use the Concrete / Slab tools.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
            <h3 className="text-lg font-bold text-txt-primary flex items-center gap-2 mb-4">
              <Ruler size={20} className="text-accent-800" />
              Dimensions
            </h3>

            <div>
              <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Roof type</label>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as RoofType)}
                className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
              >
                <option value="gable">Gable (two slopes)</option>
                <option value="hip">Hip (four slopes)</option>
                <option value="mono">Mono / single slope</option>
              </select>
              {roofType === "hip" && (
                <p className="text-xs text-txt-tertiary mt-1">
                  Hip area assumes a uniform pitch on all slopes; hip/valley rafter ≈ 1.5 × run (approximation).
                </p>
              )}
            </div>

            <DimInput label={`Building span (${unitL})`} value={span} unit={unitSystem} onChange={setSpan} hint="Total width of the building" />
            <DimInput label={`Building length (${unitL})`} value={buildingLength} unit={unitSystem} onChange={setBuildingLength} hint="Length along the ridge" />
            <DimInput label={`Overhang — horizontal eaves (${unitL})`} value={overhang} unit={unitSystem} onChange={setOverhang} hint="Horizontal eave extension on each side" />
            <DimInput label={`Rake overhang, gable/hip ends (${unitL})`} value={rakeOverhang} unit={unitSystem} onChange={setRakeOverhang} hint="Eave overhang on the ends (hip roofs); 0 = none" />

            <div>
              <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Pitch input</label>
              <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Pitch input mode">
                {(
                  [
                    ["rise", "Rise"],
                    ["x12", "X:12"],
                    ["deg", "Degrees"],
                    ["pct", "Percent"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => switchPitchMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pitchMode === mode ? "bg-ink text-white" : "bg-surface-hover text-txt-secondary hover:text-txt-primary"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {pitchMode === "rise" ? (
                <DimInput label={`Roof rise (${unitL})`} value={rise} unit={unitSystem} onChange={setRise} hint="Vertical height from eave to ridge" />
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-txt-secondary">
                    {pitchMode === "x12" ? "Pitch (X : 12)" : pitchMode === "deg" ? "Pitch angle (°)" : "Pitch (%)"}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={pitchVal}
                    onChange={(e) => setPitchVal(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all"
                  />
                  <p className="text-xs text-txt-tertiary">
                    Derived rise: {fmtL(result.riseM)} · {result.pitchX12.toFixed(1)}:12 · {result.angleDeg.toFixed(1)}° · {result.pitchPct.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-txt-secondary">Wastage (%)</label>
              <input
                type="number"
                min={0}
                max={25}
                step={1}
                value={wastePct}
                onChange={(e) => setWastePct(Math.max(0, Math.min(25, Number(e.target.value) || 0)))}
                className="w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all"
              />
              <p className="text-xs text-txt-tertiary">Default 10%, editable 0–25%.</p>
            </div>

            <DimInput
              label={`Rafter spacing (${unitL})`}
              value={spacing}
              unit={unitSystem}
              onChange={setSpacing}
              hint="Default 0.4 m (400 mm) in Pakistan / 16 in (1.33 ft)"
              min={0.05}
              step={0.05}
            />

            <div>
              <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
              >
                {(["PKR", "INR", "AED"] as const).map((c) => (
                  <option key={c} value={c}>
                    {c} ({CURRENCY_META[c].symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-medium text-txt-secondary mb-2">Material rates — enter your supplier&apos;s prices</p>
              <p className="text-xs text-txt-tertiary mb-3 flex items-start gap-1">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>
                  No Pakistan / India / UAE shingle, felt or ridge-cap price was found, so rates start blank — never
                  invented. Costs stay blank until you enter a rate.
                </span>
              </p>
              <div className="space-y-3">
                {RATE_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <label className="flex-1 text-sm text-txt-secondary">
                      {f.label} <span className="text-txt-tertiary">({f.unit})</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-txt-tertiary">{sym}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={1}
                        value={rates[f.key] ?? ""}
                        placeholder="—"
                        aria-label={`${f.label} rate ${f.unit}`}
                        onChange={(e) => {
                          const v = e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0);
                          setRates((prev) => ({ ...prev, [f.key]: v }));
                        }}
                        className="w-28 bg-surface-hover border border-ui-borderSubtle rounded-xl px-3 py-2 text-txt-primary text-right focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {result.errors.length > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2" role="alert">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <ul className="list-disc pl-4">
                {result.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-accent-50 border border-accent-200 text-accent-900 text-sm flex items-start gap-2">
              <Info size={18} className="mt-0.5 shrink-0" />
              <ul className="list-disc pl-4">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-ink rounded-2xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
            <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Calculator size={24} className="text-accent-400" />
              Roof Geometry Results
            </h3>

            {/* SVG Visualizer */}
            <div className="w-full bg-surface-default/5 rounded-2xl border border-white/10 p-4 mb-4 relative z-10">
              <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto drop-shadow-md">
                <line x1={leftWall} y1={bottomY} x2={rightWall} y2={bottomY} className="stroke-white/40" strokeWidth="3" strokeDasharray="4,4" />
                <line x1={leftWall} y1={bottomY} x2={leftWall} y2={bottomY + 30} className="stroke-white/40" strokeWidth="6" />
                <line x1={rightWall} y1={bottomY} x2={rightWall} y2={bottomY + 30} className="stroke-white/40" strokeWidth="6" />
                <line x1={leftEaveX} y1={leftEaveY} x2={leftWall} y2={bottomY} className="stroke-accent-500" strokeWidth="6" strokeLinecap="round" />
                <line x1={rightEaveX} y1={rightEaveY} x2={rightWall} y2={bottomY} className="stroke-accent-500" strokeWidth="6" strokeLinecap="round" />
                <line x1={leftWall} y1={bottomY} x2={cx} y2={topY} className="stroke-accent-500" strokeWidth="6" strokeLinecap="round" />
                <line x1={rightWall} y1={bottomY} x2={cx} y2={topY} className="stroke-accent-500" strokeWidth="6" strokeLinecap="round" />
                <line x1={cx} y1={bottomY} x2={cx} y2={topY} className="stroke-accent-300" strokeWidth="2" strokeDasharray="4,4" />
                <path
                  d={`M ${leftWall + 25} ${bottomY} A 25 25 0 0 0 ${leftWall + 20} ${bottomY - 12}`}
                  fill="none"
                  className="stroke-accent-400"
                  strokeWidth="2"
                />
                <text x={leftWall + 35} y={bottomY - 8} className="fill-accent-300" fontSize="12" fontWeight="bold">
                  {result.angleDeg.toFixed(1)}°
                </text>
                <text x={cx} y={bottomY + 20} textAnchor="middle" className="fill-white/60" fontSize="14" fontWeight="bold">
                  Span: {span} {unitL}
                </text>
                <text x={cx + 10} y={bottomY - scaledRise / 2} className="fill-accent-300" fontSize="14" fontWeight="bold">
                  Rise: {dispRise.toFixed(2)} {unitL}
                </text>
                <text x={leftWall - scaledOverhang / 2} y={bottomY + 20} textAnchor="middle" className="fill-accent-300" fontSize="12">
                  OH: {overhang}
                </text>
                <text x={cx - scaledSpan / 4} y={bottomY - scaledRise / 2 - 10} textAnchor="middle" className="fill-accent-300" fontSize="14" fontWeight="bold">
                  Rafter
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="text-accent-200 text-xs font-medium mb-1">Slope Angle</div>
                <div className="text-xl font-bold">{result.angleDeg.toFixed(2)}°</div>
                <div className="text-xs text-white/60">{result.pitchBand}</div>
              </div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="text-accent-200 text-xs font-medium mb-1">Pitch</div>
                <div className="text-xl font-bold">{result.pitchPct.toFixed(1)}%</div>
                <div className="text-xs text-white/60">{result.pitchX12.toFixed(1)}:12 · ×{result.multiplier.toFixed(3)}</div>
              </div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="text-accent-200 text-xs font-medium mb-1">Rafter Length</div>
                <div className="text-xl font-bold">
                  {result.rafterM.toFixed(2)} <span className="text-xs">{unitL}</span>
                </div>
                <div className="text-xs text-white/60">
                  run {fmtL(result.runM)} · rise {fmtL(result.riseM)}
                </div>
              </div>
              <div className="bg-accent-500/20 rounded-2xl p-4 border border-accent-500/30 backdrop-blur-md">
                <div className="text-accent-200 text-xs font-medium mb-1">Total Roof Area</div>
                <div className="text-xl font-bold text-accent-400">
                  {result.roofAreaM2.toFixed(2)} <span className="text-xs">{unitA}</span>
                </div>
                <div className="text-xs text-white/60">footprint {fmtA(result.footprintM2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
                <div className="text-accent-200 text-xs font-medium mb-1">Squares / Bundles</div>
                <div className="text-xl font-bold">{result.squares} / {result.bundles}</div>
                <div className="text-xs text-white/60">{wastePct}% waste included</div>
              </div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
                <div className="text-accent-200 text-xs font-medium mb-1">Felt rolls</div>
                <div className="text-xl font-bold">#15: {result.felt15Rolls} · #30: {result.felt30Rolls}</div>
              </div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
                <div className="text-accent-200 text-xs font-medium mb-1">Ridge / Drip edge</div>
                <div className="text-xl font-bold">{result.ridgeCapBundles} bundles</div>
                <div className="text-xs text-white/60">{result.dripEdgeM.toFixed(1)} m drip edge ({result.dripEdgePieces} pcs)</div>
              </div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
                <div className="text-accent-200 text-xs font-medium mb-1">Rafters</div>
                <div className="text-xl font-bold">{result.rafterCount}</div>
                <div className="text-xs text-white/60">
                  {roofType === "hip" && result.hipRafterM != null ? `hip rafter ≈ ${fmtL(result.hipRafterM)}` : `ridge ${fmtL(result.ridgeM)}`}
                </div>
              </div>
            </div>

            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 relative z-10">
              <div className="text-accent-200 text-xs font-medium mb-1">Estimated material cost</div>
              <div className="text-xl font-bold">
                {cost.totalCost != null ? formatMoney(cost.totalCost, currency) : "— enter rates to price this roof"}
              </div>
              {!cost.costComplete && cost.totalCost != null && (
                <div className="text-xs text-white/60">Partial total — some lines have no rate yet.</div>
              )}
            </div>
          </div>

          <FormulaAccordion steps={formulaSteps} />

          <MaterialSummary
            items={materialItems}
            onUpdateRate={() => {}}
            showRates={false}
            totalValue={cost.totalCost != null ? formatMoney(cost.totalCost, currency) : 0}
            totalLabel={
              cost.totalCost != null
                ? "Estimated material cost"
                : "Estimated material cost — enter rates to price"
            }
          />

          <p className="text-sm text-txt-tertiary leading-relaxed">{ARCHITECTURAL_DISCLAIMER}</p>

          <section aria-labelledby="roof-faq-heading">
            <h3 id="roof-faq-heading" className="text-lg font-semibold text-txt-primary mb-3">
              Frequently asked questions
            </h3>
            <div className="space-y-2">
              {ROOF_FAQS.map((f) => (
                <details key={f.q} className="bg-surface-default border border-ui-borderSubtle rounded-2xl px-4 py-3 shadow-brand-sm">
                  <summary className="font-medium text-txt-primary cursor-pointer">{f.q}</summary>
                  <p className="text-sm text-txt-secondary leading-relaxed mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-txt-tertiary mr-1">Related:</span>
            <Link to="/building-setback-calculator" className="text-sm font-medium text-accent-800 hover:underline">Building Setback Calculator</Link>
            <Link to="/far-fsi-calculator" className="text-sm font-medium text-accent-800 hover:underline">FAR / FSI Calculator</Link>
            <Link to="/brick-calculator" className="text-sm font-medium text-accent-800 hover:underline">Brick Calculator</Link>
            <Link to="/marla-converter" className="text-sm font-medium text-accent-800 hover:underline">Marla Converter</Link>
          </div>
        </div>
      </div>

      <CalculationHistory
        calculatorId="roofcalculator_tool"
        currentInputs={currentInputs}
        currentResults={currentResults}
      />
    </div>
  );
}
