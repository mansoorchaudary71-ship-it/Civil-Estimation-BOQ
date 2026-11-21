import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Printer,
  AlertTriangle,
  Info,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import { Button } from "../ui/Button";
import { exportBOQToPDF } from "../../lib/pdfExport";
import {
  ARCHITECTURAL_DISCLAIMER,
  FT_TO_M,
  KANAL_M2,
  M2_PER_SQFT,
  MARLA_M2,
  PLANNING_NOTE,
  calcSetback,
  convertAreaM2,
  formatLength,
  getRegionPresets,
  type AreaUnit,
  type Region,
} from "../../lib/architecturalCalc";

type UnitSystem = "m" | "ft";

const FT_PER_M = 1 / FT_TO_M;

function toDisplay(m: number, unit: UnitSystem): number {
  return unit === "m" ? m : m * FT_PER_M;
}
function toMetres(v: number, unit: UnitSystem): number {
  return unit === "m" ? v : v * FT_TO_M;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Two-field ft + in input that stores one decimal-ft value. */
function FtInInput({
  label,
  valueFt,
  onChange,
}: {
  label: string;
  valueFt: number;
  onChange: (decimalFt: number) => void;
}) {
  const ft = Math.floor(valueFt || 0);
  const inch = Math.round(((valueFt || 0) - ft) * 12 * 10) / 10;
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
        {label}
      </label>
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
            className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
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
            className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
          />
          <span className="text-sm text-txt-tertiary">in</span>
        </div>
      </div>
    </div>
  );
}

function LengthInput({
  label,
  value,
  unit,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  unit: UnitSystem;
  onChange: (v: number) => void;
  hint?: string;
}) {
  if (unit === "ft") {
    return (
      <div>
        <FtInInput label={label} valueFt={value} onChange={onChange} />
        {hint && <p className="text-xs text-txt-tertiary mt-1">{hint}</p>}
      </div>
    );
  }
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={0.1}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
      />
      {hint && <p className="text-xs text-txt-tertiary mt-1">{hint}</p>}
    </div>
  );
}

const AREA_FACTORS: Record<AreaUnit, number> = {
  m2: 1,
  sqft: M2_PER_SQFT,
  marla: MARLA_M2,
  kanal: KANAL_M2,
};

const SETBACK_FAQS: { q: string; a: string }[] = [
  {
    q: "What is a building setback?",
    a: "A setback is the minimum distance a building must sit back from the plot boundary — front (towards the road), rear, and sides. Setbacks keep light and air reaching the building, leave room for access and services, and stop buildings crowding the street. The area left after all setbacks is the buildable footprint.",
  },
  {
    q: "Do I need side setbacks on a 5 marla plot in Lahore?",
    a: "Under the LDA figures used here, a plot under 5 marla typically has 5 ft front and 5 ft rear setbacks and no side setback — houses are built continuously along the sides. This comes from society-practice summaries, not from a verified LDA setback table, so confirm it with LDA or your housing society before building.",
  },
  {
    q: "What changes on a corner plot?",
    a: "A corner plot faces a road on two sides, so the side facing the second road needs an extra setback on top of the normal side margin. No sourced value for that extra setback was found, so this calculator leaves it for you to enter from your authority's figures — the buildable frontage shrinks by exactly the amount you enter.",
  },
  {
    q: "Setback footprint vs ground coverage — what is the difference?",
    a: "They are two different limits. The setback footprint is the area left after front, rear and side setbacks — pure geometry. Ground coverage is a separate regulatory cap (for example 70% of the plot for a 10 marla LDA plot). Your real buildable footprint is whichever is smaller. A plot can pass its setbacks yet breach coverage, or pass coverage yet fail its setbacks — this calculator reports both numbers separately so you can see which one binds.",
  },
  {
    q: "Who approves setbacks, and is this calculator a permission?",
    a: "In Lahore the Lahore Development Authority (LDA) approves building plans; in India your municipal corporation or development authority applies the state bye-laws; in Dubai the plot's Affection Plan and the master developer's rules govern. This tool is a planning screen only — it is not a building permission, and its preset figures are secondary summaries that must be confirmed with the approving authority.",
  },
];

export default function BuildingSetbackCalculator() {
  const [region, setRegion] = useState<Region>("PK");
  const [presetId, setPresetId] = useState<string>("general-planning");
  const [unit, setUnit] = useState<UnitSystem>("m");
  const [plotMode, setPlotMode] = useState<"dims" | "area">("dims");
  const [frontage, setFrontage] = useState<number>(15);
  const [depth, setDepth] = useState<number>(20);
  const [areaValue, setAreaValue] = useState<number>(300);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [buildingType, setBuildingType] = useState<"residential" | "commercial">("residential");
  const [roadWidth, setRoadWidth] = useState<number>(9);
  const [front, setFront] = useState<number>(3);
  const [rear, setRear] = useState<number>(2);
  const [side, setSide] = useState<number>(1.5);
  const [sideBoth, setSideBoth] = useState<boolean>(true);
  const [cornerPlot, setCornerPlot] = useState<boolean>(false);
  const [cornerExtra, setCornerExtra] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const presets = useMemo(() => getRegionPresets(region), [region]);
  const preset = presets.find((p) => p.id === presetId) ?? presets[0];

  const convertAllLengths = (next: UnitSystem) => {
    const f = next === "ft" ? FT_PER_M : FT_TO_M;
    setFrontage((v) => round2(v * f));
    setDepth((v) => round2(v * f));
    setRoadWidth((v) => round2(v * f));
    setFront((v) => round2(v * f));
    setRear((v) => round2(v * f));
    setSide((v) => round2(v * f));
    setCornerExtra((s) => {
      const n = parseFloat(s);
      return Number.isFinite(n) ? String(round2(n * f)) : s;
    });
    // Area converts through the m² pivot using the CURRENT area unit
    // (marla × 25.293 m², kanal × 505.86 m²). The old code assumed the
    // value was always in m²/sq ft, so 10 marla became 107.64 "sq ft"
    // instead of 2,722.5 sq ft.
    setAreaValue((v) => {
      const m2 = v * AREA_FACTORS[areaUnit];
      return round2(next === "ft" ? m2 * 10.7639 : m2);
    });
    setAreaUnit(next === "ft" ? "sqft" : "m2");
    setUnit(next);
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    // Clear a field when the preset has no value for it, so the engine's
    // null-path warnings fire — the old code left the previous preset's
    // value in place (stale setback).
    setFront(p.frontM != null ? round2(toDisplay(p.frontM, unit)) : 0);
    setRear(p.rearM != null ? round2(toDisplay(p.rearM, unit)) : 0);
    setSide(p.sideM != null ? round2(toDisplay(p.sideM, unit)) : 0);
    setSideBoth(p.sideBoth);
  };

  const changeRegion = (r: Region) => {
    setRegion(r);
    setPresetId("general-planning");
    setFront(round2(toDisplay(3.0, unit)));
    setRear(round2(toDisplay(2.0, unit)));
    setSide(round2(toDisplay(1.5, unit)));
    setSideBoth(true);
  };

  const result = useMemo(() => {
    const cornerExtraM =
      cornerExtra.trim() === "" ? undefined : toMetres(parseFloat(cornerExtra) || 0, unit);
    // A field cleared by applyPreset (preset has no value for it) is 0 —
    // pass undefined to the engine so its "no verified setback" warnings
    // fire instead of silently computing with a 0 setback. (The engine
    // type is `number | undefined`; undefined falls through its ?? chain
    // to the preset, then to null — the same no-value sentinel as before.)
    // A user-typed 0 on a preset that DOES source the value still passes
    // through as 0.
    const frontM = preset.frontM == null && front === 0 ? undefined : toMetres(front, unit);
    const rearM = preset.rearM == null && rear === 0 ? undefined : toMetres(rear, unit);
    const sideM = preset.sideM == null && side === 0 ? undefined : toMetres(side, unit);
    if (plotMode === "area") {
      return calcSetback({
        region,
        presetId,
        areaM2: areaValue * AREA_FACTORS[areaUnit],
        frontM,
        rearM,
        sideM,
        sideBoth,
        cornerPlot,
        cornerExtraM,
        buildingType,
        roadWidthM: toMetres(roadWidth, unit),
      });
    }
    return calcSetback({
      region,
      presetId,
      frontageM: toMetres(frontage, unit),
      depthM: toMetres(depth, unit),
      frontM,
      rearM,
      sideM,
      sideBoth,
      cornerPlot,
      cornerExtraM,
      buildingType,
      roadWidthM: toMetres(roadWidth, unit),
    });
  }, [region, presetId, plotMode, frontage, depth, areaValue, areaUnit, buildingType, roadWidth, front, rear, side, sideBoth, cornerPlot, cornerExtra, unit]);

  const unitL = unit === "m" ? "m" : "ft";
  const unitA = unit === "m" ? "m²" : "sq ft";
  const fmtL = (m: number | null) =>
    m == null ? "—" : unit === "m" ? `${m.toFixed(2)} m` : `${(m * FT_PER_M).toFixed(2)} ft`;
  const fmtA = (m2: number | null) =>
    m2 == null
      ? "—"
      : unit === "m"
        ? `${m2.toFixed(1)} m²`
        : `${(m2 * 10.7639).toFixed(1)} sq ft`;

  const summaryText = () => {
    const lines = [
      "Building setback estimate — Civil Estimation Pro",
      `Region: ${region === "PK" ? "Pakistan (LDA)" : region === "IN" ? "India (MBBL)" : "UAE (Dubai DBC)"} · Preset: ${preset.label}`,
      `Plot: ${result.plotAreaM2.toFixed(1)} m² (${convertAreaM2(result.plotAreaM2, "marla").toFixed(2)} marla)`,
      `Setbacks — front ${fmtL(result.frontM)}, rear ${fmtL(result.rearM)}, side ${fmtL(result.sideM)}${result.sideBoth ? " (both sides)" : " (one side)"}`,
      `Setback-constrained footprint: ${fmtA(result.buildableAreaM2)} (${result.setbackFootprintPct?.toFixed(1) ?? "—"}% of plot)`,
      `Regulatory coverage cap: ${result.coverageCapM2 != null ? `${fmtA(result.coverageCapM2)} (${result.coverageCapPct}%)` : "— (no verified cap for this preset)"}`,
      `Buildable footprint: ${fmtA(result.buildableFootprintM2)} — binding constraint: ${result.binding ?? "—"}`,
      PLANNING_NOTE,
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
      projectName: "Building Setback Estimate",
      date: new Date().toLocaleDateString("en-GB"),
      items: [
        { description: "Front setback", quantity: result.frontM ?? 0, unit: "m", rate: 0, amount: 0 },
        { description: "Rear setback", quantity: result.rearM ?? 0, unit: "m", rate: 0, amount: 0 },
        { description: "Side setback", quantity: result.sideM ?? 0, unit: "m", rate: 0, amount: 0 },
        { description: "Buildable footprint", quantity: result.buildableFootprintM2 ?? 0, unit: "m²", rate: 0, amount: 0 },
      ],
      totalAmount: 0,
    });
  };

  const formulaSteps: FormulaStep[] = [
    {
      id: 1,
      label: "1. Plot area",
      theoretical: "Plot area = frontage × depth",
      applied:
        plotMode === "area"
          ? `Plot area = ${areaValue} ${areaUnit} = ${result.plotAreaM2.toFixed(1)} m²`
          : `Plot area = ${frontage} × ${depth} ${unitL} = ${result.plotAreaM2.toFixed(1)} m² (${convertAreaM2(result.plotAreaM2, "marla").toFixed(2)} marla)`,
    },
    {
      id: 2,
      label: "2. Buildable frontage and depth",
      theoretical: "Buildable frontage = frontage − side × (1 or 2 sides) − corner extra\nBuildable depth = depth − front − rear",
      applied: `Buildable frontage = ${fmtL(result.buildableFrontageM)}\nBuildable depth = ${fmtL(result.buildableDepthM)}`,
    },
    {
      id: 3,
      label: "3. Setback-constrained footprint",
      theoretical: "Setback footprint = buildable frontage × buildable depth\nSetback share = footprint ÷ plot area × 100",
      applied: `Setback footprint = ${fmtA(result.buildableAreaM2)} (${result.setbackFootprintPct?.toFixed(1) ?? "—"}% of plot)`,
    },
    {
      id: 4,
      label: "4. Regulatory coverage cap — the second, separate limit",
      theoretical: "Coverage cap = plot area × max coverage %\nBuildable footprint = min(setback footprint, coverage cap)",
      applied:
        result.coverageCapM2 != null
          ? `Coverage cap = ${result.plotAreaM2.toFixed(1)} × ${result.coverageCapPct}% = ${fmtA(result.coverageCapM2)}\nBuildable footprint = min(${fmtA(result.buildableAreaM2)}, ${fmtA(result.coverageCapM2)}) = ${fmtA(result.buildableFootprintM2)} — binding: ${result.binding}`
          : "No verified coverage cap for this preset — the setback footprint is the only limit shown. Pick an LDA / MBBL / DBC preset for the regulatory cap.",
    },
  ];

  const materialItems = [
    { division: "Setbacks", description: "Front setback", unit: "m", quantity: result.frontM ?? 0, rate: 0 },
    { division: "Setbacks", description: "Rear setback", unit: "m", quantity: result.rearM ?? 0, rate: 0 },
    { division: "Setbacks", description: `Side setback (${result.sideBoth ? "each side" : "one side"})`, unit: "m", quantity: result.sideM ?? 0, rate: 0 },
    { division: "Buildable metrics", description: "Setback-constrained footprint", unit: "m²", quantity: result.buildableAreaM2 ?? 0, rate: 0 },
    { division: "Buildable metrics", description: "Regulatory coverage cap", unit: "m²", quantity: result.coverageCapM2 ?? 0, rate: 0 },
    { division: "Buildable metrics", description: "Buildable footprint (binding limit)", unit: "m²", quantity: result.buildableFootprintM2 ?? 0, rate: 0 },
  ];

  const currentInputs = {
    region,
    presetId,
    plotMode,
    frontage,
    depth,
    areaValue,
    areaUnit,
    buildingType,
    roadWidth,
    front,
    rear,
    side,
    sideBoth,
    cornerPlot,
    cornerExtra,
    unit,
  };
  const currentResults = {
    frontM: result.frontM,
    rearM: result.rearM,
    sideM: result.sideM,
    buildableAreaM2: result.buildableAreaM2,
    setbackFootprintPct: result.setbackFootprintPct,
    coverageCapM2: result.coverageCapM2,
    buildableFootprintM2: result.buildableFootprintM2,
    binding: result.binding,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight mb-4">
          <ArrowLeftRight className="w-6 h-6 text-accent-700" />
          Building Setback Calculator
        </h2>
        <div className="text-base font-normal text-txt-secondary leading-relaxed space-y-3 mb-6">
          <p>
            A setback is the strip of your plot that must stay empty between the building and the
            boundary — front towards the road, rear, and sides. Setbacks are what decide how much
            of your plot you can actually build on: take the plot, subtract the setbacks on every
            side, and the rectangle left over is your setback-constrained footprint. This
            calculator works that rectangle out for plots in Pakistan, India and the UAE, and then
            checks it against a second, separate limit — the regulatory ground-coverage cap — so
            you can see which of the two actually binds your design.
          </p>
          <p>
            Pick your region first, then a preset. The presets come from LDA 2019 for Lahore,
            the India Model Building Bye-Laws 2016, and the Dubai Building Code — but be aware
            that every one of them is a secondary summary, not the regulation text itself: no
            verified LDA setback table was found, so the LDA setback feet are society-practice
            figures and the coverage, FAR, height and storey figures are blog summaries of LDA
            2019. Where a preset has no sourced value, the field is left blank for you to fill
            from your own authority&apos;s figures — nothing is invented to fill the gap. A
            worked example: a 15 m × 20 m residential plot with 3.0 m front, 2.0 m rear and
            1.5 m side setbacks leaves a 12.0 m × 15.0 m buildable rectangle of 180.0 m², which
            is 60% of the plot — that 60% is the setback-constrained share, not the regulatory
            coverage. This tool is a planning screen, not a building permission: confirm the
            figures with LDA or your local authority before building.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy result"}
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
            <Download size={16} /> Download PDF
          </Button>
          <div className="flex bg-surface-hover p-1 rounded-xl ml-auto">
            <Button
              onClick={() => unit !== "m" && convertAllLengths("m")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unit === "m" ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary hover:text-txt-primary"}`}
            >
              Metric (m)
            </Button>
            <Button
              onClick={() => unit !== "ft" && convertAllLengths("ft")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unit === "ft" ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary hover:text-txt-primary"}`}
            >
              Imperial (ft)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => changeRegion(e.target.value as Region)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
            >
              <option value="PK">Pakistan — LDA Lahore</option>
              <option value="IN">India — Model Bye-Laws 2016</option>
              <option value="AE">UAE — Dubai DBC</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
              Preset (plot band)
            </label>
            <select
              value={presetId}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.plotBand}
                </option>
              ))}
            </select>
            <p className="text-xs text-txt-tertiary mt-1 flex items-start gap-1">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>
                {preset.verified ? preset.source : `Secondary — verify with your authority. ${preset.source}`}
                {preset.note ? ` ${preset.note}` : ""}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4" role="group" aria-label="Plot input mode">
          {(
            [
              ["dims", "Frontage × depth"],
              ["area", "Plot area"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPlotMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${plotMode === mode ? "bg-ink text-white" : "bg-surface-hover text-txt-secondary hover:text-txt-primary"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {plotMode === "dims" ? (
            <>
              <LengthInput label={`Plot frontage (${unitL})`} value={frontage} unit={unit} onChange={setFrontage} hint="Width along the road" />
              <LengthInput label={`Plot depth (${unitL})`} value={depth} unit={unit} onChange={setDepth} hint="Front boundary to rear boundary" />
              <div>
                <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Plot area</label>
                <p className="px-4 py-3 rounded-full bg-surface-hover text-txt-primary">
                  {result.plotAreaM2.toFixed(1)} m² · {convertAreaM2(result.plotAreaM2, "marla").toFixed(2)} marla · {convertAreaM2(result.plotAreaM2, "kanal").toFixed(2)} kanal
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Plot area</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={areaValue || ""}
                  onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Area unit</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                  className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
                >
                  <option value="m2">Square metres (m²)</option>
                  <option value="sqft">Square feet</option>
                  <option value="marla">Marla</option>
                  <option value="kanal">Kanal</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Plot area in m²</label>
                <p className="px-4 py-3 rounded-full bg-surface-hover text-txt-primary">
                  {result.plotAreaM2.toFixed(1)} m²
                </p>
              </div>
            </>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Building type</label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value as "residential" | "commercial")}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial / public</option>
            </select>
          </div>
          <LengthInput label={`Approach road width (${unitL})`} value={roadWidth} unit={unit} onChange={setRoadWidth} hint="Commercial: front ≥ 6.0 m where the road is over 18 m wide" />
          <LengthInput label={`Front setback (${unitL})`} value={front} unit={unit} onChange={setFront} hint={preset.frontM == null ? "Not sourced for this preset — enter your authority's figure" : undefined} />
          <LengthInput label={`Rear setback (${unitL})`} value={rear} unit={unit} onChange={setRear} hint={preset.rearM == null ? "Not sourced for this preset — enter your authority's figure" : undefined} />
          <LengthInput label={`Side setback (${unitL})`} value={side} unit={unit} onChange={setSide} hint={preset.sideM == null ? "Not sourced for this preset — enter your authority's figure" : undefined} />
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Side setback applies to</label>
            <select
              value={sideBoth ? "both" : "one"}
              onChange={(e) => setSideBoth(e.target.value === "both")}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
            >
              <option value="both">Both sides</option>
              <option value="one">One side only</option>
            </select>
          </div>
          <div className="flex items-end gap-3 pb-1">
            <label className="flex items-center gap-2 text-sm font-medium text-txt-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={cornerPlot}
                onChange={(e) => setCornerPlot(e.target.checked)}
                className="w-5 h-5 accent-accent-700"
              />
              Corner plot
            </label>
            {cornerPlot && (
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
                  Extra setback, road-facing side ({unitL})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={cornerExtra}
                  placeholder="Enter authority's figure"
                  onChange={(e) => setCornerExtra(e.target.value)}
                  className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2" role="alert">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <ul className="list-disc pl-4">
              {result.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {result.warnings.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-accent-50 border border-accent-200 text-accent-900 text-sm flex items-start gap-2">
            <Info size={18} className="mt-0.5 shrink-0" />
            <ul className="list-disc pl-4">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        <div className="bg-ink rounded-2xl p-6 shadow-xl text-white space-y-4 mb-6">
          <h3 className="text-xl font-bold">Setback results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
              <div className="text-accent-200 text-xs font-medium mb-1">Front / Rear / Side</div>
              <div className="text-lg font-bold">
                {fmtL(result.frontM)} / {fmtL(result.rearM)} / {fmtL(result.sideM)}
              </div>
              <div className="text-xs text-white/60">{result.sideBoth ? "side on both sides" : "side on one side"}</div>
            </div>
            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
              <div className="text-accent-200 text-xs font-medium mb-1">Buildable rectangle</div>
              <div className="text-lg font-bold">
                {fmtL(result.buildableFrontageM)} × {fmtL(result.buildableDepthM)}
              </div>
            </div>
            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
              <div className="text-accent-200 text-xs font-medium mb-1">Setback-constrained footprint</div>
              <div className="text-lg font-bold">{fmtA(result.buildableAreaM2)}</div>
              <div className="text-xs text-white/60">{result.setbackFootprintPct?.toFixed(1) ?? "—"}% of plot</div>
            </div>
            <div className="bg-accent-500/20 rounded-2xl p-4 border border-accent-500/30">
              <div className="text-accent-200 text-xs font-medium mb-1">Buildable footprint</div>
              <div className="text-lg font-bold text-accent-400">{fmtA(result.buildableFootprintM2)}</div>
              <div className="text-xs text-white/60">
                binding: {result.binding ?? "—"}
                {result.coverageCapM2 != null && ` · coverage cap ${fmtA(result.coverageCapM2)}`}
              </div>
            </div>
          </div>
          <p className="text-sm text-white/70">
            The setback footprint ({fmtA(result.buildableAreaM2)}) and the regulatory coverage cap (
            {result.coverageCapM2 != null ? fmtA(result.coverageCapM2) : "not available for this preset"}) are
            two separate numbers — the buildable footprint is the smaller of the two.
          </p>
        </div>

        {/* Visual diagram */}
        {result.buildableFrontageM != null && result.buildableDepthM != null && result.plotAreaM2 > 0 && (
          <div className="relative w-full h-64 bg-surface-hover border border-ui-borderSubtle mb-8 flex items-center justify-center rounded-2xl overflow-hidden">
            <div className="absolute top-2 text-base font-medium">Rear setback: {fmtL(result.rearM)}</div>
            <div className="absolute bottom-2 text-base font-medium">
              Front setback: {fmtL(result.frontM)} ↓ Road {formatLength(toMetres(roadWidth, unit), "m")} wide
            </div>
            <div className="absolute left-2 text-base font-medium" style={{ writingMode: "vertical-rl" }}>
              Side: {fmtL(result.sideM)}
            </div>
            <div className="absolute right-2 text-base font-medium" style={{ writingMode: "vertical-rl" }}>
              Side: {result.sideBoth ? fmtL(result.sideM) : "—"}
            </div>
            <div
              className="bg-accent-500/20 border-2 border-accent-800 flex items-center justify-center text-accent-800 font-bold text-center"
              style={{
                width: `${Math.max(20, ((result.buildableFrontageM ?? 0) / (plotMode === "dims" ? toMetres(frontage, unit) : Math.sqrt(result.plotAreaM2))) * 100)}%`,
                height: `${Math.max(20, ((result.buildableDepthM ?? 0) / (plotMode === "dims" ? toMetres(depth, unit) : Math.sqrt(result.plotAreaM2))) * 100)}%`,
              }}
            >
              Buildable area
              <br />
              {fmtA(result.buildableAreaM2)}
            </div>
          </div>
        )}

        <MaterialSummary
          items={materialItems}
          onUpdateRate={() => {}}
          showRates={false}
          totalValue={result.buildableFootprintM2 ?? 0}
          totalUnit="m²"
          totalLabel="Buildable footprint"
        />

        <FormulaAccordion steps={formulaSteps} />

        <p className="text-sm text-txt-tertiary mt-6 leading-relaxed">{PLANNING_NOTE}</p>
        <p className="text-sm text-txt-tertiary leading-relaxed">{ARCHITECTURAL_DISCLAIMER}</p>

        <section aria-labelledby="setback-faq-heading" className="mt-8">
          <h3 id="setback-faq-heading" className="text-lg font-semibold text-txt-primary mb-3">
            Frequently asked questions
          </h3>
          <div className="space-y-2">
            {SETBACK_FAQS.map((f) => (
              <details key={f.q} className="bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 py-3">
                <summary className="font-medium text-txt-primary cursor-pointer">{f.q}</summary>
                <p className="text-sm text-txt-secondary leading-relaxed mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2 mt-8">
          <span className="text-sm text-txt-tertiary mr-1">Related:</span>
          <Link to="/far-fsi-calculator" className="text-sm font-medium text-accent-800 hover:underline">FAR / FSI Calculator</Link>
          <Link to="/roof-calculator" className="text-sm font-medium text-accent-800 hover:underline">Roof Pitch Calculator</Link>
          <Link to="/brick-calculator" className="text-sm font-medium text-accent-800 hover:underline">Brick Calculator</Link>
          <Link to="/marla-converter" className="text-sm font-medium text-accent-800 hover:underline">Marla Converter</Link>
        </div>
      </div>

      <CalculationHistory
        calculatorId="buildingsetbackcalculator_tool"
        currentInputs={currentInputs}
        currentResults={currentResults}
      />
    </div>
  );
}
