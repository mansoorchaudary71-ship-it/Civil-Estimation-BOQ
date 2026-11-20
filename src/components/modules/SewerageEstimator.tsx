import { Button } from '../ui/Button';
import React, { useMemo, useState } from "react";
import {
  Waves,
  Ruler,
  CircleDashed,
  ArrowDownRight,
  AlignVerticalJustifyStart,
  ChevronDown,
  Droplet,
  AlertTriangle,
  Layers,
  Copy,
  Printer,
  Download,
  Check,
} from "lucide-react";
import { useTakeoff } from "../../context/TakeoffContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { NumberInput } from "../ui/NumberInput";
import { FormulaAccordion } from "../ui/FormulaAccordion";
import { GlobalFAQ } from "../ui/GlobalFAQ";
import ManholeModule, { ManholeResults } from "./ManholeModule";
import {
  calcBeddingVolume,
  calcDesignFlow,
  calcManning,
  calcSeptic,
  calcTrenchVolume,
  selectSewerPipe,
  type SewerPipeMaterial,
} from "../../lib/sewerageCalc";
import { MANNING_N } from "../../lib/mepConstants";

export const SEWERAGE_FAQS = [
  { question: "What is self-cleansing velocity?", answer: "The minimum flow velocity that keeps solids moving instead of settling in the pipe — 0.6 m/s for sanitary sewers. This calculator reports the minimum slope that achieves 0.6 m/s for your pipe size and material (for a 300 mm concrete pipe at 1:200 the velocity is 0.97 m/s, and the minimum slope is about 1 in 520)." },
  { question: "How is a sewer pipe sized?", answer: "Design flow first: population × wastewater per person (default 120 L/day) × peak factor (3.0 under 1,000 people). Then pick the smallest standard diameter whose full-bore Manning capacity carries that flow at a velocity of 0.6–2.5 m/s. Capacity alone is not enough — a pipe that is too flat will silt up." },
  { question: "What is the minimum septic tank size?", answer: "IS 2470 minimums: 1,000 litres liquid volume, 0.75 m minimum width, 1.0 m minimum liquid depth, plus 0.3 m freeboard, with length about twice the width. A 5-person house calculates to 900 L, so the 1,000 L minimum applies — this calculator enforces it." },
  { question: "Soak pit vs dispersion trench?", answer: "Both dispose of septic effluent into the soil. A soak pit is a 1.2–1.5 m diameter pit 3–4 m deep (deeper pits are split into several); a dispersion trench is a long shallow trench (about 1.0 m deep × 0.6 m wide). Trenches suit high water tables and flat sites; pits suit deep, permeable soil. This calculator sizes both." },
  { question: "When does sewerage design need a licensed engineer?", answer: "Always for a real installation. Pipe gradients, invert levels, manhole spacing, structural bedding class and septic/soak-pit siting depend on ground conditions, water table and local by-laws. This tool is a planning estimate — get the design checked and approved before building." },
  { question: "What is Manning's n?", answer: "The roughness coefficient in Manning's equation. Typical values: uPVC/HDPE 0.009, concrete 0.013, cast iron 0.014, clay 0.015. A rougher pipe (higher n) flows slower at the same slope, so it needs a steeper gradient or a larger diameter." },
];

const CUR_SYMBOLS: Record<string, string> = { PKR: "Rs", INR: "₹", AED: "AED" };

export default function SewerageEstimator() {
  const { addBoqItems } = useTakeoff();
  const [openSection, setOpenSection] = useState<string>("hydraulics");
  const [mhResults, setMhResults] = useState<ManholeResults | null>(null);
  const [copied, setCopied] = useState(false);
  const [boqAdded, setBoqAdded] = useState(false);

  // Design flow + hydraulics
  const [population, setPopulation] = useState<number | "">(100);
  const [litresPerPerson, setLitresPerPerson] = useState<number | "">(120);
  const [flowDia, setFlowDia] = useState<number | "">(0.3);
  const [flowGradient, setFlowGradient] = useState<number | "">(200);
  const [flowMaterial, setFlowMaterial] = useState<SewerPipeMaterial>("concrete");
  // Trench
  const [trenchLength, setTrenchLength] = useState<number | "">(100);
  const [trenchWidth, setTrenchWidth] = useState<number | "">(1.5);
  const [trenchDepth, setTrenchDepth] = useState<number | "">(2.5);
  const [trenchSloped, setTrenchSloped] = useState(false);
  const [trenchSlopeRatio, setTrenchSlopeRatio] = useState<number | "">(0.5);
  const [pipeOuterDia, setPipeOuterDia] = useState<number | "">(0.4);
  const [beddingDepth, setBeddingDepth] = useState<number | "">(0.2);
  // Invert levels
  const [startIL, setStartIL] = useState<number | "">(100);
  const [ilLength, setIlLength] = useState<number | "">(50);
  const [ilGradient, setIlGradient] = useState<number | "">(200);
  // Pipe sections
  const [pipeLength, setPipeLength] = useState<number | "">(100);
  const [pipeSectionLen, setPipeSectionLen] = useState<number | "">(2.5);
  // Bedding
  const [beddingType, setBeddingType] = useState<"classA" | "classB" | "classC">("classB");
  const [beddingUnderPipe, setBeddingUnderPipe] = useState<number | "">(0.15);
  const [beddingHaunch, setBeddingHaunch] = useState<number | "">(0.2);
  // Septic
  const [septicUsers, setSepticUsers] = useState<number | "">(5);
  const [septicDemand, setSepticDemand] = useState<number | "">(120);
  const [septicPercolation, setSepticPercolation] = useState<number | "">(30);
  // Cost rates
  const [currency, setCurrency] = useState("PKR");
  const [excavationRate, setExcavationRate] = useState<number | "">("");
  const [pipeRatePerM, setPipeRatePerM] = useState<number | "">("");
  const [manholeRate, setManholeRate] = useState<number | "">("");
  const [septicRatePerM3, setSepticRatePerM3] = useState<number | "">("");
  const [soakPitRate, setSoakPitRate] = useState<number | "">("");

  const calc = useMemo(() => {
    try {
      const manning = calcManning({ diameterM: Number(flowDia), gradient1InX: Number(flowGradient), material: flowMaterial });
      const designFlow = calcDesignFlow({ population: Number(population), litresPerPersonPerDay: Number(litresPerPerson) });
      const selection = selectSewerPipe({ population: Number(population), litresPerPersonPerDay: Number(litresPerPerson), gradient1InX: Number(flowGradient), material: flowMaterial });
      const trench = calcTrenchVolume(Number(trenchLength), Number(trenchWidth), Number(trenchDepth), trenchSloped, Number(trenchSlopeRatio) || 0.5);
      const pipeVol = Math.PI * Math.pow(Number(pipeOuterDia) / 2, 2) * Number(trenchLength);
      const beddingVol = calcBeddingVolume(Number(trenchLength), Number(trenchWidth), Number(pipeOuterDia), Number(beddingUnderPipe), Number(beddingHaunch));
      const netBackfill = Math.max(0, trench.volumeM3 - pipeVol - beddingVol);
      const drop = Number(ilGradient) > 0 ? Number(ilLength) / Number(ilGradient) : 0;
      const pipeCount = Number(pipeSectionLen) > 0 ? Math.ceil(Number(pipeLength) / Number(pipeSectionLen)) : 0;
      const septic = calcSeptic({
        users: Number(septicUsers),
        litresPerPersonPerDay: Number(septicDemand),
        percolationLoadingRate: Number(septicPercolation),
      });
      return { manning, designFlow, selection, trench, pipeVol, beddingVol, netBackfill, endIL: Number(startIL) - drop, drop, pipeCount, septic, errors: [] as string[] };
    } catch (e) {
      return { manning: null, designFlow: null, selection: null, trench: null, pipeVol: 0, beddingVol: 0, netBackfill: 0, endIL: 0, drop: 0, pipeCount: 0, septic: null, errors: [(e as Error).message] };
    }
  }, [population, litresPerPerson, flowDia, flowGradient, flowMaterial, trenchLength, trenchWidth, trenchDepth, trenchSloped, trenchSlopeRatio, pipeOuterDia, beddingUnderPipe, beddingHaunch, startIL, ilLength, ilGradient, pipeLength, pipeSectionLen, septicUsers, septicDemand, septicPercolation]);

  const sym = CUR_SYMBOLS[currency] ?? "Rs";
  const fmt = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`);
  const r = (v: number | "" | null | undefined) => (v == null || v === "" ? null : Number(v));

  const costLines = useMemo(() => {
    if (!calc.septic) return [];
    const exc = r(excavationRate);
    const pipe = r(pipeRatePerM);
    const mh = r(manholeRate);
    const sep = r(septicRatePerM3);
    const soak = r(soakPitRate);
    const lines = [
      { desc: "Trench excavation", unit: "m³", rate: exc, qty: calc.trench?.volumeM3 ?? 0 },
      { desc: `Sewer pipe (${calc.selection?.selectedDiameterMm ?? "—"} mm)`, unit: "m", rate: pipe, qty: Number(pipeLength) || 0 },
      { desc: "Septic tank (RCC)", unit: "m³", rate: sep, qty: (calc.septic.liquidVolumeL / 1000) },
      { desc: "Soak pit", unit: "nos", rate: soak, qty: calc.septic.soakPits },
      ...(mhResults ? [{ desc: "Manhole", unit: "nos", rate: mh, qty: 1 }] : []),
    ];
    return lines.map((l) => ({ ...l, amount: l.rate != null ? l.rate * l.qty : null }));
  }, [calc, excavationRate, pipeRatePerM, manholeRate, septicRatePerM3, soakPitRate, pipeLength, mhResults]);
  const costTotal = costLines.some((l) => l.amount != null) ? costLines.reduce((s, l) => s + (l.amount ?? 0), 0) : null;

  const summaryText = calc.manning && calc.septic
    ? `Sewerage design\nDesign flow ${calc.designFlow?.designFlowLPerS.toFixed(2)} L/s (population ${population})\nPipe ${calc.selection?.selectedDiameterMm ?? "—"} mm — capacity ${calc.selection?.capacityLPerS?.toFixed(1) ?? "—"} L/s, velocity ${calc.manning.velocityMs.toFixed(3)} m/s, min slope 1 in ${calc.manning.minSlopeForSelfCleansing1InX.toFixed(0)}\nSeptic tank ${calc.septic.lengthM.toFixed(2)} m x ${calc.septic.widthM.toFixed(2)} m x ${calc.septic.totalDepthM.toFixed(2)} m (${calc.septic.liquidVolumeL.toFixed(0)} L liquid)${calc.septic.minimumApplied ? " — IS 2470 minimum applied" : ""}\nSoak pits: ${calc.septic.soakPits} x ${calc.septic.soakPitDiameterM} m dia x ${calc.septic.soakPitDepthPerPitM.toFixed(2)} m deep\nTrench ${calc.trench?.volumeM3.toFixed(1)} m³; pipes ${calc.pipeCount} nos\n${costTotal != null ? `Estimated cost ${fmt(costTotal)}` : "Cost: enter rates to price this job."}`
    : "";
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handleExport = () => {
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sewerage-results.txt"; a.click();
    URL.revokeObjectURL(url);
  };
  const handleAddAllToBoq = () => {
    const items = costLines
      .filter((l) => l.rate != null && l.qty > 0)
      .map((l) => ({ desc: l.desc, unit: l.unit, rate: l.rate as number, qtyOverride: l.qty }));
    if (calc.pipeCount > 0) items.push({ desc: `Sewerage RCC Pipe (${pipeSectionLen}m sections)`, unit: "nos", rate: 2500, qtyOverride: calc.pipeCount });
    if (items.length === 0) return;
    addBoqItems(items);
    setBoqAdded(true);
    setTimeout(() => setBoqAdded(false), 3000);
  };

  const toggleSection = (id: string) => setOpenSection(openSection === id ? "" : id);
  const Section = ({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="w-full bg-surface-default rounded-[1.5rem] shadow-brand-sm border border-border-color overflow-hidden">
      <Button onClick={() => toggleSection(id)} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-surface-default/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-50 text-accent-800 rounded-2xl overflow-hidden">{icon}</div>
          <h2 className="text-xl font-bold text-txt-primary">{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-txt-secondary transition-transform duration-300 ${openSection === id ? "rotate-180" : ""}`} />
      </Button>
      {openSection === id && <div className="px-6 pb-6 border-t border-border-color pt-4">{children}</div>}
    </div>
  );

  return (
    <div className="w-full text-txt-primary font-sans md:p-4">
      <div className="w-full md:max-w-7xl md:mx-auto space-y-6 px-4 md:px-0">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}</Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><Printer size={16} /> Print</Button>
          <Button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><Download size={16} /> Export</Button>
          <Button onClick={handleAddAllToBoq} disabled={costLines.filter((l) => l.rate != null).length === 0 && calc.pipeCount === 0} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700">{boqAdded ? "Added to BOQ ✓" : "Add all to BOQ"}</Button>
        </div>
        <p className="text-sm text-txt-secondary">Nothing is added to the BOQ automatically — use “Add all to BOQ” when you are happy with the sizing. Enter rates below to price the job; lines without a rate show “—”, never 0.</p>

        {calc.errors.length > 0 && (
          <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4 text-sm text-ui-errorText flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><div>{calc.errors.map((e) => <p key={e}>{e}</p>)}</div></div>
        )}

        <Section id="hydraulics" title="Design Flow & Pipe Sizing (Manning)" icon={<Waves className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 gap-4 h-fit">
              <NumberInput label="Population Served" value={population} onChange={setPopulation} requirePositive />
              <NumberInput label="Wastewater per Person" unit="L/day" value={litresPerPerson} onChange={setLitresPerPerson} />
              <NumberInput label="Pipe Diameter" unit="m" value={flowDia} onChange={setFlowDia} />
              <NumberInput label="Gradient" unit="1 in X" value={flowGradient} onChange={setFlowGradient} />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-txt-secondary mb-1.5">Pipe Material (Manning&apos;s n)</label>
                <select value={flowMaterial} onChange={(e) => setFlowMaterial(e.target.value as SewerPipeMaterial)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                  {Object.entries(MANNING_N).map(([k, v]) => <option key={k} value={k}>{k} — n = {v}</option>)}
                </select>
              </div>
            </div>
            <div>
              {calc.manning && calc.designFlow && calc.selection && (
                <MaterialSummary title="Hydraulic Results" totalLabel="Design Flow" totalValue={calc.designFlow.designFlowLPerS.toFixed(2)} totalUnit="L/s" relatedToolIds={[]}>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ResultCard title="Velocity (full bore)" value={calc.manning.velocityMs.toFixed(3)} unit="m/s" variant={calc.manning.selfCleansing ? "success" : "warning"} />
                    <ResultCard title="Capacity (this pipe)" value={calc.manning.dischargeLPerS.toFixed(1)} unit="L/s" variant="neutral" />
                    <ResultCard title="Min Slope (self-cleansing)" value={`1 in ${calc.manning.minSlopeForSelfCleansing1InX.toFixed(0)}`} unit="" variant="info" />
                    <ResultCard title="Selected Pipe" value={calc.selection.selectedDiameterMm ?? "—"} unit="mm" variant={calc.selection.adequate ? "primary" : "warning"} />
                  </div>
                  <p className="text-xs text-txt-tertiary mt-3">{calc.selection.note}</p>
                  <FormulaAccordion steps={calc.manning.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "Manning: V = (1/n) × R^(2/3) × S^(1/2)", applied: s }))} />
                </MaterialSummary>
              )}
            </div>
          </div>
        </Section>

        <Section id="septic" title="Septic Tank & Soak Pit (IS 2470)" icon={<Droplet className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 gap-4 h-fit">
              <NumberInput label="Users" value={septicUsers} onChange={setSepticUsers} requirePositive />
              <NumberInput label="Wastewater per Person" unit="L/day" value={septicDemand} onChange={setSepticDemand} />
              <NumberInput label="Soil Loading Rate" unit="L/m²/day" value={septicPercolation} onChange={setSepticPercolation} />
            </div>
            <div>
              {calc.septic && (
                <MaterialSummary title="Septic & Soak Pit" totalLabel="Liquid Volume Provided" totalValue={calc.septic.liquidVolumeL.toFixed(0)} totalUnit="Liters" relatedToolIds={[]}>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ResultCard title="Tank Size (L × W × D)" value={`${calc.septic.lengthM.toFixed(2)} × ${calc.septic.widthM.toFixed(2)} × ${calc.septic.totalDepthM.toFixed(2)}`} unit="m" variant="primary" />
                    <ResultCard title="IS 2470 Minimum Applied" value={calc.septic.minimumApplied ? "Yes — 1,000 L" : "No"} unit="" variant={calc.septic.minimumApplied ? "warning" : "success"} />
                    <ResultCard title="Soak Pits" value={calc.septic.soakPits} unit={`× ${calc.septic.soakPitDepthPerPitM.toFixed(2)} m deep`} variant="neutral" />
                    <ResultCard title="Dispersion Trench (alt.)" value={calc.septic.dispersionTrenchLengthM.toFixed(1)} unit="m" variant="info" />
                  </div>
                  <FormulaAccordion steps={calc.septic.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "V = P×q×T + P×S×N (IS 2470)", applied: s }))} />
                </MaterialSummary>
              )}
            </div>
          </div>
        </Section>

        <Section id="trench" title="Trench Excavation, Invert Levels & Pipe Count" icon={<AlignVerticalJustifyStart className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 gap-4 h-fit">
              <NumberInput label="Trench Length" unit="m" value={trenchLength} onChange={setTrenchLength} />
              <NumberInput label="Trench Width" unit="m" value={trenchWidth} onChange={setTrenchWidth} />
              <NumberInput label="Trench Depth" unit="m" value={trenchDepth} onChange={setTrenchDepth} />
              <NumberInput label="Pipe Outer Diameter" unit="m" value={pipeOuterDia} onChange={setPipeOuterDia} />
              <NumberInput label="Bedding Depth" unit="m" value={beddingDepth} onChange={setBeddingDepth} />
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-txt-secondary col-span-2">
                <input type="checkbox" checked={trenchSloped} onChange={(e) => setTrenchSloped(e.target.checked)} className="w-4 h-4 text-accent-800 rounded" /> Sloped trench sides
              </label>
              {trenchSloped && <NumberInput label="Slope Ratio (H per V)" value={trenchSlopeRatio} onChange={setTrenchSlopeRatio} />}
              <NumberInput label="Start Invert Level" unit="m" value={startIL} onChange={setStartIL} />
              <NumberInput label="Invert Length" unit="m" value={ilLength} onChange={setIlLength} />
              <NumberInput label="Invert Gradient" unit="1 in X" value={ilGradient} onChange={setIlGradient} />
              <NumberInput label="Pipe Run Length" unit="m" value={pipeLength} onChange={setPipeLength} />
              <NumberInput label="Pipe Section Length" unit="m" value={pipeSectionLen} onChange={setPipeSectionLen} />
            </div>
            <div>
              {calc.trench && (
                <MaterialSummary title="Trench & Pipe Quantities" totalLabel="Excavation Volume" totalValue={calc.trench.volumeM3.toFixed(1)} totalUnit="m³" relatedToolIds={[]}>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ResultCard title="Top Width" value={calc.trench.topWidthM.toFixed(2)} unit="m" variant="neutral" />
                    <ResultCard title="Net Backfill" value={calc.netBackfill.toFixed(1)} unit="m³" variant="neutral" />
                    <ResultCard title="Bedding Volume" value={calc.beddingVol.toFixed(2)} unit="m³" variant="info" />
                    <ResultCard title="End Invert Level" value={calc.endIL.toFixed(2)} unit="m" variant="primary" />
                    <ResultCard title="Pipes Required" value={calc.pipeCount} unit="nos" variant="primary" />
                    <ResultCard title="Invert Drop" value={calc.drop.toFixed(2)} unit="m" variant="neutral" />
                  </div>
                </MaterialSummary>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Bedding Class</label>
              <select value={beddingType} onChange={(e) => setBeddingType(e.target.value as "classA" | "classB" | "classC")} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                <option value="classA">Class A (concrete)</option><option value="classB">Class B (granular)</option><option value="classC">Class C (granular)</option>
              </select>
            </div>
            <NumberInput label="Bedding Under Pipe" unit="m" value={beddingUnderPipe} onChange={setBeddingUnderPipe} />
            <NumberInput label="Haunch Height" unit="m" value={beddingHaunch} onChange={setBeddingHaunch} />
          </div>
        </Section>

        <Section id="manhole" title="Manhole Calculator" icon={<CircleDashed className="w-5 h-5" />}>
          <ManholeModule onStateChange={setMhResults} />
          {mhResults && <p className="text-sm text-txt-secondary mt-3">Manhole calculated — its quantities are included in the cost table below when you enter a manhole rate.</p>}
        </Section>

        <Section id="cost" title="Cost Estimate (enter your rates)" icon={<Layers className="w-5 h-5" />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                <option value="PKR">PKR</option><option value="INR">INR</option><option value="AED">AED</option>
              </select>
            </div>
            <NumberInput label={`Excavation (${sym}/m³)`} value={excavationRate} onChange={setExcavationRate} />
            <NumberInput label={`Pipe (${sym}/m)`} value={pipeRatePerM} onChange={setPipeRatePerM} />
            <NumberInput label={`Manhole (${sym} each)`} value={manholeRate} onChange={setManholeRate} />
            <NumberInput label={`Septic RCC (${sym}/m³)`} value={septicRatePerM3} onChange={setSepticRatePerM3} />
            <NumberInput label={`Soak Pit (${sym} each)`} value={soakPitRate} onChange={setSoakPitRate} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-txt-secondary border-b border-border-color"><th className="py-2 pr-4">Item</th><th className="py-2 pr-4 text-right">Qty</th><th className="py-2 pr-4">Unit</th><th className="py-2 pr-4 text-right">Rate</th><th className="py-2 text-right">Amount</th></tr></thead>
              <tbody>
                {costLines.map((l) => (
                  <tr key={l.desc} className="border-b border-border-color">
                    <td className="py-2 pr-4">{l.desc}</td>
                    <td className="py-2 pr-4 text-right font-mono">{l.qty.toFixed(2)}</td>
                    <td className="py-2 pr-4">{l.unit}</td>
                    <td className="py-2 pr-4 text-right font-mono">{l.rate != null ? fmt(l.rate) : "—"}</td>
                    <td className="py-2 text-right font-mono font-bold">{l.amount != null ? fmt(l.amount) : "—"}</td>
                  </tr>
                ))}
                <tr><td colSpan={4} className="py-2 pr-4 text-right font-bold">Total</td><td className="py-2 text-right font-mono font-bold">{fmt(costTotal)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-txt-tertiary mt-3">No sourced PK/IN/AE sewerage rates were in the audit spec, so no rates are pre-filled — enter your supplier&apos;s rates. Lines without a rate show “—”, never 0.</p>
        </Section>

        <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 text-sm text-txt-secondary flex gap-2">
          <Ruler className="w-4 h-4 shrink-0 text-accent-800" />
          <span>Planning estimate only — not a substitute for a licensed engineer. Check gradients, invert levels, manhole spacing and septic siting against local by-laws and ground conditions before building.</span>
        </div>

        <GlobalFAQ faqs={SEWERAGE_FAQS} moduleId="wastewater-calculator" />
        <CalculationHistory calculatorId="sewerage_estimator" currentInputs={{ population, flowDia, flowGradient, septicUsers }} currentResults={calc.manning ? { velocityMs: calc.manning.velocityMs, dischargeLPerS: calc.manning.dischargeLPerS } : {}} />
      </div>
    </div>
  );
}
