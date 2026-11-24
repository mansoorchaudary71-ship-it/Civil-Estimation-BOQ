import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
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
  DEFAULT_FLOOR_HEIGHT_M,
  KANAL_M2,
  M2_PER_SQFT,
  MARLA_M2,
  PLANNING_NOTE,
  calcFar,
  convertAreaM2,
  getRegionPresets,
  type AreaUnit,
  type Region,
} from "../../lib/architecturalCalc";

const AREA_FACTORS: Record<AreaUnit, number> = {
  m2: 1,
  sqft: M2_PER_SQFT,
  marla: MARLA_M2,
  kanal: KANAL_M2,
};

export default function FarFsiCalculator() {
  const [region, setRegion] = useState<Region>("PK");
  const [presetId, setPresetId] = useState<string>("");
  const [plotArea, setPlotArea] = useState<number>(500);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [far, setFar] = useState<string>("2.0");
  const [coverage, setCoverage] = useState<string>("50");
  const [maxHeight, setMaxHeight] = useState<string>("");
  const [maxStoreys, setMaxStoreys] = useState<string>("");
  const [floorHeight, setFloorHeight] = useState<string>("3.05");
  const [copied, setCopied] = useState(false);

  const presets = useMemo(
    () => getRegionPresets(region).filter((p) => p.id !== "general-planning"),
    [region],
  );
  const preset = presets.find((p) => p.id === presetId) ?? null;

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    // Clear a field when the preset has no value for it, so a stale figure
    // from the previous preset is not carried over.
    setFar(p.maxFar != null ? String(p.maxFar) : "");
    setCoverage(p.maxCoveragePct != null ? String(p.maxCoveragePct) : "");
    setMaxHeight(p.maxHeightM != null ? p.maxHeightM.toFixed(2) : "");
    setMaxStoreys(p.maxStoreys != null ? String(p.maxStoreys) : "");
  };

  const changeRegion = (r: Region) => {
    setRegion(r);
    setPresetId("");
  };

  const plotAreaM2 = plotArea * AREA_FACTORS[areaUnit];
  const farNum = parseFloat(far);
  const coverageNum = parseFloat(coverage);
  const maxHeightNum = maxHeight.trim() === "" ? undefined : parseFloat(maxHeight);
  const maxStoreysNum = maxStoreys.trim() === "" ? undefined : parseFloat(maxStoreys);
  const floorHeightNum = parseFloat(floorHeight) || DEFAULT_FLOOR_HEIGHT_M;

  const result = useMemo(
    () =>
      calcFar({
        region,
        presetId: presetId || undefined,
        plotAreaM2,
        far: Number.isFinite(farNum) ? farNum : undefined,
        coveragePct: Number.isFinite(coverageNum) ? coverageNum : undefined,
        maxHeightM: maxHeightNum,
        maxStoreys: maxStoreysNum,
        floorHeightM: floorHeightNum,
      }),
    [region, presetId, plotAreaM2, farNum, coverageNum, maxHeightNum, maxStoreysNum, floorHeightNum],
  );

  const summaryText = () => {
    const lines = [
      "FAR / FSI estimate — Civil Estimation Pro",
      `Region: ${region === "PK" ? "Pakistan (LDA)" : region === "IN" ? "India (MBBL)" : "UAE (Dubai DBC)"}${preset ? ` · Preset: ${preset.label}` : ""}`,
      `Plot: ${plotAreaM2.toFixed(1)} m² (${convertAreaM2(plotAreaM2, "marla").toFixed(2)} marla)`,
      `Max built-up area: ${result.maxBuiltUpM2.toFixed(1)} m² (plot × FAR ${Number.isFinite(farNum) ? farNum : "—"})`,
      `Max ground footprint: ${result.maxFootprintM2.toFixed(1)} m² (${Number.isFinite(coverageNum) ? coverageNum : "—"}% coverage)`,
      `Max floors: ${result.maxFloors} (by FAR: ${result.floorsByFar}${result.floorsByHeight != null ? `, by height: ${result.floorsByHeight}` : ""}${maxStoreysNum != null ? `, storey cap: ${maxStoreysNum}` : ""}) — binding: ${result.binding ?? "—"}`,
      result.gfaNote,
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
      projectName: "FAR FSI Estimate",
      date: new Date().toLocaleDateString("en-GB"),
      items: [
        { description: "Max permissible built-up area", quantity: result.maxBuiltUpM2, unit: "m²", rate: 0, amount: 0 },
        { description: "Max ground footprint", quantity: result.maxFootprintM2, unit: "m²", rate: 0, amount: 0 },
        { description: "Estimated max floors", quantity: result.maxFloors, unit: "nos", rate: 0, amount: 0 },
      ],
      totalAmount: 0,
    });
  };

  const formulaSteps: FormulaStep[] = [
    {
      id: 1,
      label: "1. Maximum built-up area",
      theoretical: "Max built-up area = plot area × FAR (FSI)",
      applied: `Max built-up area = ${plotAreaM2.toFixed(1)} × ${Number.isFinite(farNum) ? farNum : "—"} = ${result.maxBuiltUpM2.toFixed(1)} m²`,
    },
    {
      id: 2,
      label: "2. Maximum ground footprint",
      theoretical: "Max footprint = plot area × ground coverage %",
      applied: `Max footprint = ${plotAreaM2.toFixed(1)} × ${Number.isFinite(coverageNum) ? coverageNum : "—"}% = ${result.maxFootprintM2.toFixed(1)} m²`,
    },
    {
      id: 3,
      label: "3. Floors allowed by FAR",
      theoretical: "Floors by FAR = floor(max built-up ÷ max footprint) = floor(FAR ÷ coverage)",
      applied: `Floors by FAR = floor(${result.maxBuiltUpM2.toFixed(1)} ÷ ${result.maxFootprintM2.toFixed(1)}) = ${result.floorsByFar}`,
    },
    {
      id: 4,
      label: "4. The binding constraint",
      theoretical: "Max floors = min(floors by FAR, floors by height, storey cap)\nFloors by height = floor(max height ÷ floor-to-floor height)",
      applied:
        `Floors by height = ${result.floorsByHeight != null ? result.floorsByHeight : "— (no height limit entered)"}` +
        `${maxStoreysNum != null ? `\nStorey cap = ${maxStoreysNum}` : "\nNo storey cap entered"}` +
        `\nMax floors = ${result.maxFloors} — binding constraint: ${result.binding ?? "—"}`,
    },
  ];

  const materialItems = [
    { division: "Regulatory", description: "Max permissible built-up area", unit: "m²", quantity: result.maxBuiltUpM2, rate: 0 },
    { division: "Regulatory", description: "Max ground footprint", unit: "m²", quantity: result.maxFootprintM2, rate: 0 },
    { division: "Regulatory", description: "Floors allowed by FAR", unit: "nos", quantity: result.floorsByFar, rate: 0 },
    ...(result.floorsByHeight != null
      ? [{ division: "Regulatory", description: "Floors allowed by height", unit: "nos", quantity: result.floorsByHeight, rate: 0 }]
      : []),
    { division: "Regulatory", description: "Estimated max floors (binding limit)", unit: "nos", quantity: result.maxFloors, rate: 0 },
  ];

  const currentInputs = {
    region,
    presetId,
    plotArea,
    areaUnit,
    far,
    coverage,
    maxHeight,
    maxStoreys,
    floorHeight,
  };
  const currentResults = {
    maxBuiltUpM2: result.maxBuiltUpM2,
    maxFootprintM2: result.maxFootprintM2,
    floorsByFar: result.floorsByFar,
    floorsByHeight: result.floorsByHeight,
    maxFloors: result.maxFloors,
    binding: result.binding,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden">
        <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-txt-primary tracking-tight mb-4">
          <ArrowUpRight className="w-6 h-6 text-accent-700" />
          FAR/FSI Calculator
        </h2>

        <div className="text-base font-normal text-txt-secondary leading-relaxed space-y-3 mb-6">
          <p>
            FAR — Floor Area Ratio, also called FSI (Floor Space Index) — is the single number
            that caps how much you may build on a plot. Multiply your plot area by the FAR and
            you get the maximum built-up area: a 500 m² plot at FSI 2.0 may carry 1,000 m² of
            floors in total. Divide that built-up area by the ground footprint your coverage
            allows and you get the number of floors the FAR permits — but that is only one of
            three limits. The height limit and the storey cap can both bind first: a 9.15 m
            height limit with 3.05 m floor-to-floor height allows only 3 storeys, however generous
            the FAR. This calculator works out all three and tells you which one binds.
          </p>
          <p>
            The presets come from LDA 2019 for Lahore, the India Model Building Bye-Laws 2016,
            and the Dubai Building Code — all secondary summaries, not the regulation text, and
            Dubai has no DM-wide residential FAR table at all: the Dubai figures here are one
            Al Barari villa-community example (FAR 0.60, 40% coverage), and a real Dubai plot
            takes its FAR from its own Affection Plan. Where a preset has no sourced value the
            field is left blank for your own figures. Worked example: 500 m² at FSI 2.0 with
            50% coverage gives 1,000 m² built-up, a 250 m² footprint and 4 floors. Note what
            counts in the floor area differs by authority — under LDA 2019 basements count
            toward FAR. This tool is a planning screen, not a building permission: confirm the
            figures with your local authority before building.
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
              Preset (plot band) — fills FAR, coverage, height and storey cap
            </label>
            <select
              value={presetId}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-2xl"
            >
              <option value="">Custom — enter your own figures</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.plotBand}
                </option>
              ))}
            </select>
            {preset && (
              <p className="text-xs text-txt-tertiary mt-1 flex items-start gap-1">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>
                  Secondary — verify with your authority. {preset.source}
                  {preset.note ? ` ${preset.note}` : ""}
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Plot area</label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={plotArea || ""}
              onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
            />
            <p className="text-xs text-txt-tertiary mt-1">
              {plotAreaM2.toFixed(1)} m² · {convertAreaM2(plotAreaM2, "marla").toFixed(2)} marla
            </p>
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
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
              Permissible FAR / FSI
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0.1}
              max={15}
              step={0.05}
              value={far}
              onChange={(e) => setFar(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
            />
            <p className="text-xs text-txt-tertiary mt-1">0.1 – 15 (Dubai allows 12+). FSI 2.0 = FAR 200%.</p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
              Max ground coverage (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={1}
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
            />
            <p className="text-xs text-txt-tertiary mt-1">0 – 100%. At 0% no floor can be built.</p>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
              Max height (m) — optional
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={maxHeight}
              placeholder="No height limit"
              onChange={(e) => setMaxHeight(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
              Max storeys — optional
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step={1}
              value={maxStoreys}
              placeholder="No storey cap"
              onChange={(e) => setMaxStoreys(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">
              Floor-to-floor height (m)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={2}
              step={0.05}
              value={floorHeight}
              onChange={(e) => setFloorHeight(e.target.value)}
              className="w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-full"
            />
            <p className="text-xs text-txt-tertiary mt-1">Default 3.05 m (10 ft).</p>
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
          <h3 className="text-xl font-bold">FAR / FSI results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
              <div className="text-accent-200 text-xs font-medium mb-1">Max built-up area</div>
              <div className="text-xl font-bold">{result.maxBuiltUpM2.toFixed(1)} <span className="text-xs">m²</span></div>
              <div className="text-xs text-white/60">plot × FAR</div>
            </div>
            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
              <div className="text-accent-200 text-xs font-medium mb-1">Max ground footprint</div>
              <div className="text-xl font-bold">{result.maxFootprintM2.toFixed(1)} <span className="text-xs">m²</span></div>
              <div className="text-xs text-white/60">plot × coverage</div>
            </div>
            <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10">
              <div className="text-accent-200 text-xs font-medium mb-1">Floors by FAR</div>
              <div className="text-xl font-bold">{result.floorsByFar}</div>
              <div className="text-xs text-white/60">
                {result.floorsByHeight != null ? `by height: ${result.floorsByHeight}` : "no height limit entered"}
              </div>
            </div>
            <div className="bg-accent-500/20 rounded-2xl p-4 border border-accent-500/30">
              <div className="text-accent-200 text-xs font-medium mb-1">Max floors</div>
              <div className="text-xl font-bold text-accent-400">{result.maxFloors}</div>
              <div className="text-xs text-white/60">binding: {result.binding ?? "—"}</div>
            </div>
          </div>
          <p className="text-sm text-white/70">{result.gfaNote}</p>
          <p className="text-sm text-white/70">
            Find your FAR and coverage in your plot&apos;s approval letter, the LDA / municipal
            bye-laws, or — in Dubai — your Affection Plan. This tool never guesses them for you.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-hover border border-ui-borderSubtle shadow-brand-sm text-txt-primary mb-8 overflow-hidden">
          <h3 className="mb-3 text-lg font-medium text-txt-primary mb-4">What is FAR/FSI?</h3>
          <p className="mb-2 text-base font-normal text-txt-secondary leading-relaxed">
            Floor Area Ratio (FAR) or Floor Space Index (FSI) is the ratio of a building&apos;s
            total floor area (gross floor area) to the size of the piece of land upon which it is
            built.
          </p>
          <p className="font-mono bg-surface-default p-2 rounded border border-ui-borderSubtle inline-block text-base font-normal text-txt-secondary leading-relaxed">
            Total Built Area = Plot Area × FSI
          </p>
        </div>

        <MaterialSummary
          items={materialItems}
          onUpdateRate={() => {}}
          showRates={false}
          totalValue={result.maxBuiltUpM2}
          totalUnit="m²"
          totalLabel="Max built-up area"
        />

        <FormulaAccordion steps={formulaSteps} />

        <p className="text-sm text-txt-tertiary mt-6 leading-relaxed">{PLANNING_NOTE}</p>
        <p className="text-sm text-txt-tertiary leading-relaxed">{ARCHITECTURAL_DISCLAIMER}</p>

        <div className="flex flex-wrap gap-2 mt-8">
          <span className="text-sm text-txt-tertiary mr-1">Related:</span>
          <Link to="/building-setback-calculator" className="text-sm font-medium text-accent-800 hover:underline">Building Setback Calculator</Link>
          <Link to="/roof-calculator" className="text-sm font-medium text-accent-800 hover:underline">Roof Pitch Calculator</Link>
          <Link to="/brick-calculator" className="text-sm font-medium text-accent-800 hover:underline">Brick Calculator</Link>
          <Link to="/marla-converter" className="text-sm font-medium text-accent-800 hover:underline">Marla Converter</Link>
        </div>
      </div>

      <CalculationHistory
        calculatorId="farfsicalculator_tool"
        currentInputs={currentInputs}
        currentResults={currentResults}
        onRestore={(ins) => {
          if (ins.region != null) setRegion(ins.region as typeof region);
          if (ins.presetId != null) setPresetId(ins.presetId as typeof presetId);
          if (ins.plotArea != null) setPlotArea(ins.plotArea as typeof plotArea);
          if (ins.areaUnit != null) setAreaUnit(ins.areaUnit as typeof areaUnit);
          if (ins.far != null) setFar(ins.far as typeof far);
          if (ins.coverage != null) setCoverage(ins.coverage as typeof coverage);
          if (ins.maxHeight != null) setMaxHeight(ins.maxHeight as typeof maxHeight);
          if (ins.maxStoreys != null) setMaxStoreys(ins.maxStoreys as typeof maxStoreys);
          if (ins.floorHeight != null) setFloorHeight(ins.floorHeight as typeof floorHeight);
        }}
      />
    </div>
  );
}
