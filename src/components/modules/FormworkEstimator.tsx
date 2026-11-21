import { Button } from '../ui/Button';
import React, { useState, useMemo, useCallback, memo } from "react";
import { useSettings, useGlobalSettings } from "../../context/SettingsContext";
import {
  Grid,
  Trash2,
  RefreshCw,
  LayoutTemplate,
  SquareStack,
  ChevronDown,
  Copy,
  Printer,
  FileText,
  Share2,
  Check,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { ListInput } from "../ui/ListInput";
import { jsPDF } from "jspdf";
import {
  calcFormwork,
  DEFAULT_FORMWORK_CONSTANTS,
  type FormworkElementInput,
  type FormworkType,
} from "../../lib/formworkCalc";

const FT_TO_M = 0.3048;

interface FormworkElement {
  id: string;
  name: string;
  type: FormworkType;
  length: string;
  width: string;
  height: string;
  count: string;
}

const MemoizedFormworkRow = memo(({
  el,
  index,
  updateElement,
  removeElement,
  unitStr
}: {
  el: FormworkElement,
  index: number,
  updateElement: (index: number, updates: Partial<FormworkElement>) => void,
  removeElement: (index: number) => void,
  unitStr: string
}) => {
  return (
    <div className="w-full group bg-surface-default/50 hover:bg-surface-default border border-border-color hover:border-accent-200 p-5 rounded-2xl transition-all shadow-brand-sm hover:shadow-brand-md relative overflow-hidden flex flex-col md:flex-row gap-4 md:items-center">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary-300 group-hover:bg-accent-400 transition-colors" />
      <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 items-end pl-0 md:pl-2">
        <div className="col-span-2 md:col-span-2 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-txt-secondary mb-1 truncate">
            Type &amp; Name
          </label>
          <div className="flex gap-2">
            <select
              className="bg-surface-hover border border-ui-borderSubtle rounded-2xl px-3 py-2.5 text-txt-secondary outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] min-w-[44px] text-base font-normal overflow-hidden truncate"
              value={el.type}
              onChange={(e) => updateElement(index, { type: e.target.value as FormworkType })}
            >
              <option value="column">Col</option>
              <option value="beam">Beam</option>
              <option value="slab">Slab</option>
              <option value="footing">Footing</option>
            </select>
            <input type="text"
              className="bg-surface-default border border-border-color rounded-full px-3 py-2.5 text-txt-primary w-full outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
              value={el.name}
              onChange={(e) => updateElement(index, { name: e.target.value })}
            />
          </div>
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-txt-secondary mb-1 truncate">
            L ({unitStr})
          </label>
          <input type="number" inputMode="decimal" min="0" step="0.1"
            className="bg-surface-default border border-border-color rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.length}
            onChange={(e) => updateElement(index, { length: e.target.value })}
          />
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-txt-secondary mb-1 truncate">
            W ({unitStr})
          </label>
          <input type="number" inputMode="decimal" min="0" step="0.1"
            className="bg-surface-default border border-border-color rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.width}
            onChange={(e) => updateElement(index, { width: e.target.value })}
          />
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-txt-secondary mb-1 truncate">
            H/D ({unitStr})
          </label>
          <input type="number" inputMode="decimal" min="0" step="0.1"
            className="bg-surface-default border border-border-color rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.height}
            onChange={(e) => updateElement(index, { height: e.target.value })}
          />
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-txt-secondary mb-1 truncate">
            Qty
          </label>
          <input type="number" inputMode="decimal" min="0"
            className="bg-surface-default border border-border-color rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.count}
            onChange={(e) => updateElement(index, { count: e.target.value })}
          />
        </div>
      </div>
      <Button
        aria-label="Delete"
        onClick={() => removeElement(index)}
        className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-ui-error text-ui-errorText hover:bg-ui-errorText hover:text-white rounded-full transition-colors ml-auto md:ml-0 self-end md:self-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-ui-errorText"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
});

export default function FormworkEstimator() {
  const { settings } = useSettings();
  const { formatCurrency, currentCurrency } = useGlobalSettings();
  const isMetric = settings.measurement === "SI";
  const unitStr = isMetric ? "m" : "ft";

  const [elements, setElements] = useState<FormworkElement[]>([
    {
      id: "1",
      name: "Column C1",
      type: "column",
      length: isMetric ? "0.3" : "1",
      width: isMetric ? "0.4" : "1.3",
      height: isMetric ? "3.0" : "10.0",
      count: "10",
    },
    {
      id: "2",
      name: "Slab Roof",
      type: "slab",
      length: isMetric ? "12.0" : "40",
      width: isMetric ? "10.0" : "33",
      height: isMetric ? "0.15" : "0.5",
      count: "1",
    },
  ]);
  const [repetitionFactor, setRepetitionFactor] = useState<number>(4);
  const [customRep, setCustomRep] = useState<string>("");
  const [wastagePct, setWastagePct] = useState<number>(5);
  const [propSpacing, setPropSpacing] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(true);
  const [showCost, setShowCost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  // Rates are null (empty) until entered — no invented market prices.
  const [rates, setRates] = useState({
    plywood: "", batten: "", prop: "", nails: "", wire: "", oil: "", labour: "",
  });

  const handleAddElement = useCallback(() => {
    setElements((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: "New Item",
        type: "beam",
        length: isMetric ? "4.0" : "13.0",
        width: isMetric ? "0.3" : "1.0",
        height: isMetric ? "0.45" : "1.5",
        count: "1",
      },
    ]);
  }, [isMetric]);

  const renderItem = useCallback((
    el: FormworkElement,
    index: number,
    updateElement: (idx: number, updates: Partial<FormworkElement>) => void,
    removeElement: (idx: number) => void
  ) => {
    return (
      <MemoizedFormworkRow
        key={el.id}
        el={el}
        index={index}
        updateElement={updateElement}
        removeElement={removeElement}
        unitStr={unitStr}
      />
    );
  }, [unitStr]);

  // ---- Engine (src/lib/formworkCalc.ts) — metric internally; convert ft→m.
  const results = useMemo(() => {
    const conv = isMetric ? 1 : FT_TO_M;
    const engineEls: FormworkElementInput[] = elements.map((el) => ({
      type: el.type,
      lengthM: (parseFloat(el.length) || 0) * conv,
      widthM: (parseFloat(el.width) || 0) * conv,
      heightM: (parseFloat(el.height) || 0) * conv,
      count: parseFloat(el.count) || 0,
    }));
    const spacing = parseFloat(propSpacing);
    // Prop spacing is entered in the display unit (ft in imperial mode),
    // like the element dimensions — convert it too. The old code used the
    // raw value, so a 3 ft spacing gave 1/9 = 0.11 props/m² instead of
    // 1/(0.914 m)² = 1.20 props/m² — an 11x understatement of props.
    const spacingM = spacing > 0 ? spacing * conv : 0;
    const constants = {
      ...DEFAULT_FORMWORK_CONSTANTS,
      propsPerM2: spacingM > 0 ? 1 / (spacingM * spacingM) : DEFAULT_FORMWORK_CONSTANTS.propsPerM2,
    };
    return calcFormwork(engineEls, repetitionFactor, wastagePct, constants);
  }, [elements, repetitionFactor, wastagePct, propSpacing, isMetric]);

  // Plywood reuse IS the repetition factor above (one set of sheets serves
  // several pours). There is no separate plywood-reuse divisor: dividing
  // again told users to buy 8 sheets for a 15-sheet set, which cannot
  // shutter even one pour.
  const plywoodToBuy = results.plywoodSheets;

  const rateNum = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const costLines = [
    { label: "Plywood sheets", amount: rateNum(rates.plywood) != null ? plywoodToBuy * (rateNum(rates.plywood) as number) : null },
    { label: "Wooden battens", amount: rateNum(rates.batten) != null ? results.battensRft * (rateNum(rates.batten) as number) : null },
    { label: "Steel props (hire)", amount: rateNum(rates.prop) != null ? results.steelProps * (rateNum(rates.prop) as number) : null },
    { label: "Nails", amount: rateNum(rates.nails) != null ? results.nailsKg * (rateNum(rates.nails) as number) : null },
    { label: "Binding wire", amount: rateNum(rates.wire) != null ? results.bindingWireKg * (rateNum(rates.wire) as number) : null },
    { label: "Shuttering oil", amount: rateNum(rates.oil) != null ? results.shutteringOilL * (rateNum(rates.oil) as number) : null },
    { label: `Labour (${results.effectiveAreaM2.toFixed(1)} m²)`, amount: rateNum(rates.labour) != null ? results.effectiveAreaM2 * (rateNum(rates.labour) as number) : null },
  ];
  const costTotal = costLines.reduce((s, l) => s + (l.amount ?? 0), 0);

  const summaryText = () => [
    "Formwork / Shuttering Estimate — Civil Estimation Pro",
    `Total formwork area: ${results.totalAreaM2.toFixed(2)} m² (${results.totalAreaSqFt.toFixed(1)} sq ft)`,
    `Effective area (÷${repetitionFactor} reuse, +${wastagePct}% wastage): ${results.effectiveAreaM2.toFixed(2)} m² (${results.effectiveAreaSqFt.toFixed(1)} sq ft)`,
    `Plywood sheets (4'x8'): ${results.plywoodSheets} (buy ${plywoodToBuy}; reuse is already in the repetition factor)`,
    `Wooden battens: ${results.battensRft} Rft`,
    `Steel props: ${results.steelProps} pcs`,
    `Nails: ${results.nailsKg.toFixed(2)} kg · Binding wire: ${results.bindingWireKg.toFixed(2)} kg · Shuttering oil: ${results.shutteringOilL.toFixed(2)} L`,
    `Beam bottom planks: ${results.beamBottomPlanksRft.toFixed(1)} Rft · Centering plates: ${results.centeringPlates} pcs`,
    showCost && costTotal > 0 ? `Estimated cost: ${formatCurrency(costTotal, false)}` : "",
    "Disclaimer: planning estimate only — confirm with your quantity surveyor or structural engineer.",
  ].filter(Boolean).join("\n");

  const copyResults = async () => {
    try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const shareResults = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Formwork Estimate", text: summaryText() }); } catch { /* dismissed */ } }
    else { await copyResults(); setShared(true); setTimeout(() => setShared(false), 2000); }
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    const lines = summaryText().split("\n");
    doc.setFontSize(16);
    doc.text("Formwork / Shuttering Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")}`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of lines.slice(1)) {
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 8;
    }
    doc.save("formwork-estimate-civil-estimation-pro.pdf");
  };
  const sendToBOQ = () => {
    const items = [
      { id: Math.random().toString(36).substr(2, 9), division: "03 - Concrete", description: "Plywood shuttering sheets 4'x8'", unit: "sheets", quantity: plywoodToBuy, rate: rateNum(rates.plywood) ?? 0 },
      { id: Math.random().toString(36).substr(2, 9), division: "03 - Concrete", description: "Wooden battens", unit: "Rft", quantity: results.battensRft, rate: rateNum(rates.batten) ?? 0 },
      { id: Math.random().toString(36).substr(2, 9), division: "03 - Concrete", description: "Steel props / scaffolding", unit: "pcs", quantity: results.steelProps, rate: rateNum(rates.prop) ?? 0 },
      { id: Math.random().toString(36).substr(2, 9), division: "03 - Concrete", description: "Formwork / shuttering labour", unit: "m²", quantity: Number(results.effectiveAreaM2.toFixed(2)), rate: rateNum(rates.labour) ?? 0 },
    ];
    window.dispatchEvent(new CustomEvent("fill-boq", { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  const breakdownData = useMemo(() => {
    return [
      { name: "Columns", value: results.perTypeM2.column, color: "#F2A413" },
      { name: "Slabs", value: results.perTypeM2.slab, color: "#1F1D1A" },
      { name: "Beams", value: results.perTypeM2.beam, color: "#6B6862" },
      { name: "Footings", value: results.perTypeM2.footing, color: "#8A7D6B" },
    ].filter((d: any) => d.value > 0);
  }, [results]);
  return (
    <div className="w-full h-full bg-transparent text-txt-primary font-sans p-6 md:p-8">

      <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-24 px-4 md:px-0">


        <p className="text-base text-txt-secondary leading-relaxed max-w-3xl">
          Estimate shuttering material for columns, beams, slabs and footings: plywood sheets, wooden battens, steel props and consumables, with a repetition factor for reuse, wastage, and a thumb-rule cross-check. Areas follow the standard rules — column 2(L+W)×H, beam (2D+W)×L, slab soffit plus edges — and the 0.24 Rft/sq ft batten (top of the cited competitor range) and 1.5 props/m² figures are labelled, editable assumptions rather than code values.
        </p>

        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">

          {/* Elements Config Section */}
          <section className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col space-y-6">

            <div className="w-full bg-surface-default/90 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(31,29,26,0.06)] border border-border-color backdrop-blur-xl overflow-hidden">

              <div className="flex items-center justify-between mb-8">

                <div className="flex items-center gap-3">

                  <div className="p-3 bg-accent-50 rounded-2xl overflow-hidden">

                    <Grid className="w-6 h-6 text-accent-700" />
                  </div>
                  <div>

                    <h2 className="text-xl font-semibold text-txt-primary tracking-tight mb-4">
                      Shuttering Elements
                    </h2>
                    <p className="text-base font-normal text-txt-secondary leading-relaxed">
                      Add columns, beams, slabs or footings
                    </p>
                  </div>
                </div>
              </div>
              <ListInput
                items={elements}
                onChange={setElements}
                onAdd={handleAddElement}
                renderItem={renderItem}
                addLabel="Add Item"
                emptyMessage="No formwork elements added."
              />
            </div>

            <div className="w-full bg-surface-default/90 p-4 sm:p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(31,29,26,0.06)] border border-border-color backdrop-blur-xl overflow-hidden">
              <Button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex items-center justify-between gap-3 relative z-10 text-left focus:outline-none min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-accent-400" />
                  <h3 className="text-lg font-medium text-white">
                    Settings &amp; Repetition
                  </h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-200 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isSettingsOpen && (
                <div className="mt-6 pt-6 border-t border-border-color flex flex-col gap-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div>
                    <p className="text-base font-normal text-txt-secondary leading-relaxed">
                      How many times will the shuttering be reused? This drastically
                      reduces material required.
                    </p>
                    <div className="flex gap-2 mt-3 flex-wrap items-center">
                      {[1, 2, 4, 6].map((factor) => (
                        <Button
                          key={factor}
                          onClick={() => { setRepetitionFactor(factor); setCustomRep(""); }}
                          className={`w-12 h-12 min-h-[44px] min-w-[44px] rounded-2xl font-semibold tabular-nums tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 ${repetitionFactor === factor && customRep === "" ? "bg-ink text-white shadow-brand-lg shadow-accent-500/30 scale-110" : "bg-surface-hover text-txt-secondary hover:bg-surface-active"}`}
                        >
                          x{factor}
                        </Button>
                      ))}
                      <input
                        type="number" inputMode="decimal" min="1" step="1"
                        placeholder="Custom ×"
                        aria-label="Custom repetition factor"
                        value={customRep}
                        onChange={(e) => {
                          setCustomRep(e.target.value);
                          const n = parseInt(e.target.value, 10);
                          if (n >= 1) setRepetitionFactor(n);
                        }}
                        className="w-24 bg-surface-default border border-ui-borderSubtle rounded-2xl px-3 py-2.5 text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-txt-secondary block mb-2">
                      Wastage: {wastagePct}% (0–15%)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="range" min="0" max="15" step="1"
                        value={wastagePct}
                        onChange={(e) => setWastagePct(Number(e.target.value))}
                        className="flex-1 accent-accent-600"
                        aria-label="Wastage percent"
                      />
                      <input
                        type="number" inputMode="decimal" min="0" max="15" step="1"
                        value={wastagePct}
                        onChange={(e) => setWastagePct(Math.min(15, Math.max(0, Number(e.target.value) || 0)))}
                        className="w-20 bg-surface-default border border-ui-borderSubtle rounded-2xl px-3 py-2 text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-txt-secondary block mb-2">
                      Prop spacing ({unitStr}) — optional
                    </label>
                    <input
                      type="number" inputMode="decimal" min="0.3" step="0.05"
                      placeholder="e.g. 0.9"
                      value={propSpacing}
                      onChange={(e) => setPropSpacing(e.target.value)}
                      className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl px-3 py-2.5 text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 text-base"
                    />
                    <p className="text-xs text-txt-tertiary mt-1">Blank = 1.5 props/m² (unsourced assumption — edit it).</p>
                  </div>
                </div>
              )}
            </div>
          </section>
          {/* Results Summary Interface */}
          <section className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
            <MaterialSummary
              title="Material Summary"
              totalLabel="Total Formwork Area"
              totalValue={isMetric ? results.totalAreaM2.toFixed(1) : results.totalAreaSqFt.toFixed(1)}
              totalUnit={isMetric ? "m²" : "sq ft"}
              subtitle={`${results.totalAreaSqFt.toFixed(1)} sq.ft · effective ${isMetric ? `${results.effectiveAreaM2.toFixed(1)} m²` : `${results.effectiveAreaSqFt.toFixed(1)} sq ft`} (÷${repetitionFactor}, +${wastagePct}%)`}
              icon={<SquareStack className="w-5 h-5 flex-shrink-0" />}
            >
              {results.errors.length > 0 && (
                <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4 mb-4" role="alert">
                  <p className="font-bold text-ui-errorText">Check your inputs</p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-ui-errorText space-y-1">
                    {results.errors.map((e, i) => (<li key={i}>{e}</li>))}
                  </ul>
                </div>
              )}

              <ResultCard
                title="Plywood Sheets"
                value={plywoodToBuy}
                badge="4'x8' standard"
                variant="warning"
              />
              <p className="text-xs text-txt-tertiary -mt-2 mb-2">
                1 sheet = 32 sq ft. Reuse is already in the repetition factor above — buy the full set.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="Wooden Battens"
                  value={results.battensRft}
                  unit="Rft"
                  variant="success"
                />
                <ResultCard
                  title="Steel Props / Scaffold"
                  value={results.steelProps}
                  unit="Pcs"
                  variant="primary"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-ui-borderSubtle/50">
                <div className="mb-3 text-sm font-bold tracking-tight text-txt-tertiary uppercase tracking-[0.15em]">
                  Consumables
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard title="Nails" value={results.nailsKg.toFixed(2)} unit="kg" variant="neutral" />
                  <ResultCard title="Binding Wire" value={results.bindingWireKg.toFixed(2)} unit="kg" variant="neutral" />
                  <ResultCard title="Shuttering Oil" value={results.shutteringOilL.toFixed(2)} unit="L" variant="neutral" />
                  <ResultCard title="Beam Bottom Planks" value={results.beamBottomPlanksRft.toFixed(1)} unit="Rft" variant="neutral" />
                  <ResultCard title="Centering Plates" value={results.centeringPlates} unit="pcs" variant="neutral" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-ui-borderSubtle/50">
                <div className="mb-3 text-sm font-bold tracking-tight text-txt-tertiary uppercase tracking-[0.15em]">
                  Thumb-rule cross-check
                </div>
                <p className="text-xs text-txt-tertiary mb-3">
                  Covered area {results.thumbCheck.coveredSqFt.toFixed(1)} sq ft (slab soffits). Plywood, battens, nails and oil use the same constants as the main calculation above; beam planks, ballies and clamps are per-covered-sq-ft thumb rules — a rough site check, not a substitute for the area calculation.
                </p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-txt-secondary">Plywood</dt><dd className="font-semibold">{results.thumbCheck.plywoodSheets.toFixed(1)} sheets</dd></div>
                  <div className="flex justify-between"><dt className="text-txt-secondary">Battens</dt><dd className="font-semibold">{results.thumbCheck.battensRft.toFixed(1)} Rft</dd></div>
                  <div className="flex justify-between"><dt className="text-txt-secondary">Nails</dt><dd className="font-semibold">{results.thumbCheck.nailsKg.toFixed(2)} kg</dd></div>
                  <div className="flex justify-between"><dt className="text-txt-secondary">Beam planks</dt><dd className="font-semibold">{results.thumbCheck.beamBottomPlanksRft.toFixed(1)} Rft</dd></div>
                  <div className="flex justify-between"><dt className="text-txt-secondary">Ballies</dt><dd className="font-semibold">{results.thumbCheck.balliesNos} nos</dd></div>
                  <div className="flex justify-between"><dt className="text-txt-secondary">Clamps</dt><dd className="font-semibold">{results.thumbCheck.clampsNos} nos</dd></div>
                  <div className="flex justify-between"><dt className="text-txt-secondary">Oil</dt><dd className="font-semibold">{results.thumbCheck.oilL.toFixed(2)} L</dd></div>
                </dl>
              </div>

              <div className="mt-6 pt-6 border-t border-ui-borderSubtle/50">
                <div className="mb-3 text-sm font-bold tracking-tight text-txt-tertiary uppercase tracking-[0.15em]">
                  How it&apos;s calculated
                </div>
                <ul className="text-sm text-txt-secondary space-y-1.5 list-disc pl-5">
                  <li>Column: 2 × (L + W) × H · Beam: (2 × D + W) × L · Slab: L × W + 2 × (L + W) × thickness · Footing: 2 × (L + W) × depth.</li>
                  <li>Effective area = total area ÷ repetition factor × (1 + wastage%).</li>
                  <li>Plywood: ⌈effective sq ft ÷ 32⌉ (4&apos;×8&apos; sheet) — one set serves all repetitions, no separate plywood-reuse divisor. Battens: effective sq ft × 0.24 Rft — <b>top of the cited competitor range (0.79 Rmt/m²), editable</b>. Props: ⌈effective m² × 1.5⌉ — <b>unsourced assumption, editable</b> (or 1 ÷ spacing² when you enter a prop spacing).</li>
                  <li>Consumables: nails 0.075 kg/m², binding wire 0.075 kg/m², shuttering oil 0.065 L/m²; beam bottom planks 1 Rft per Rft of beam; centering plates ⌈slab/footing perimeter (ft) ÷ 4⌉. Consumables are priced on the TOTAL contact area — every reuse consumes fresh nails and oil — while plywood, battens and props are bought once for the effective area (÷ repetitions). That split is deliberate, not an oversight.</li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-ui-borderSubtle/50">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={copyResults} className="flex items-center gap-2 px-4 py-2 bg-txt-primary text-surface-default text-sm font-semibold rounded-full hover:opacity-90">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button onClick={shareResults} className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 text-sm font-semibold rounded-full hover:bg-accent-100">
                    <Share2 className="w-4 h-4" /> {shared ? "Copied (share unavailable)" : "Share"}
                  </Button>
                  <Button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 text-sm font-semibold rounded-full hover:bg-accent-100">
                    <Printer className="w-4 h-4" /> Print
                  </Button>
                  <Button onClick={handlePdf} className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 text-sm font-semibold rounded-full hover:bg-accent-100">
                    <FileText className="w-4 h-4" /> PDF
                  </Button>
                  <Button onClick={sendToBOQ} className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 text-sm font-semibold rounded-full hover:bg-accent-100">
                    <LayoutTemplate className="w-4 h-4" /> Send to BOQ
                  </Button>
                  <Button onClick={() => setShowCost((v) => !v)} className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 text-sm font-semibold rounded-full hover:bg-accent-100">
                    {showCost ? "Hide cost" : "Show cost"}
                  </Button>
                </div>

                {showCost && (
                  <div className="mt-5">
                    <p className="text-xs text-txt-tertiary mb-3">
                      Enter your rates ({currentCurrency}) — no rates are pre-filled, so nothing is shown as a price until you type one. Plywood /sheet, battens /Rft, props hire /pc, nails &amp; wire /kg, oil /L, labour /m² of effective area.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {([
                        ["plywood", "Plywood /sheet"],
                        ["batten", "Batten /Rft"],
                        ["prop", "Prop hire /pc"],
                        ["nails", "Nails /kg"],
                        ["wire", "Wire /kg"],
                        ["oil", "Oil /L"],
                        ["labour", "Labour /m²"],
                      ] as const).map(([key, label]) => (
                        <label key={key} className="text-xs font-bold text-txt-secondary block">
                          {label}
                          <input
                            type="number" inputMode="decimal" min="0"
                            placeholder="—"
                            value={rates[key]}
                            onChange={(e) => setRates({ ...rates, [key]: e.target.value })}
                            className="mt-1 w-full bg-transparent border border-ui-borderSubtle text-txt-primary rounded-2xl px-3 py-2 font-medium text-sm"
                          />
                        </label>
                      ))}
                    </div>
                    <dl className="mt-4 space-y-1.5">
                      {costLines.map((l) => (
                        <div key={l.label} className="flex justify-between text-sm">
                          <dt className="text-txt-secondary">{l.label}</dt>
                          <dd className="font-semibold text-txt-primary">{l.amount != null ? formatCurrency(l.amount, false) : "—"}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between text-base font-bold border-t border-ui-borderSubtle pt-2">
                        <dt>Estimated cost</dt>
                        <dd>{costTotal > 0 ? formatCurrency(costTotal, false) : "—"}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-ui-borderSubtle/50">
                  <div className="mb-4 text-sm sm:text-base font-medium tracking-tight text-txt-tertiary uppercase tracking-[0.15em]">
                    Area Breakdown
                  </div>
                  <div className="h-48 w-full relative">

                    <ResponsiveContainer width="100%" height="100%">

                      <PieChart>

                        <Pie
                          data={breakdownData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1000}
                        >

                          {breakdownData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) =>
                            `${value.toFixed(1)} m²`
                          }
                          contentStyle={{
                            backgroundColor: "#1F1D1A",
                            borderColor: "#3A3630",
                            color: "#F5F2EC",
                            borderRadius: "12px",
                          }}
                          itemStyle={{ color: "#F5F2EC" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-base font-medium uppercase tracking-wider flex-wrap">

                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
                      Columns
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-ui-errorText" />
                      Slabs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-ink" />
                      Beams
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#8A7D6B" }} />
                      Footings
                    </span>
                  </div>
                </div>
            </MaterialSummary>
          </section>
        </div>
      </div>
      <CalculationHistory
        calculatorId="formwork_estimator_v1"
        estimationName="Formwork Calculation"
        currentInputs={{
          elements, repetitionFactor, wastagePct, propSpacing, rates
        }}
        currentResults={{
          totalArea: results.totalAreaM2.toFixed(2),
          plywoodSheets: plywoodToBuy,
          battensRft: results.battensRft,
          steelProps: results.steelProps
        }}
        summaryGeneration={(inputs, res) => `Area: ${res.totalArea}m² | Plywood: ${res.plywoodSheets} sheets`}
        onRestore={(inputs) => {
          if (inputs.elements && Array.isArray(inputs.elements)) setElements(inputs.elements);
          if (inputs.repetitionFactor !== undefined) setRepetitionFactor(inputs.repetitionFactor);
          if (inputs.wastagePct !== undefined) setWastagePct(inputs.wastagePct);
          if (inputs.propSpacing !== undefined) setPropSpacing(String(inputs.propSpacing));
          if (inputs.rates) setRates(inputs.rates);
        }}
      />
    </div>
  );
}
