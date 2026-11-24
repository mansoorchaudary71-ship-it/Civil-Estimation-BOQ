/**
 * Master RCC Estimator — thin UI over src/lib/rccCalc.ts.
 * Multi-element list (slab / column / beam / staircase / round column /
 * footing), thumb-rule steel OR a real per-element BBS (main bars +
 * distribution / stirrups, cut lengths with hooks, d²/162.28 via
 * steelCalc.ts). The old "Exact BBS" mode was deleted: it counted one
 * direction only and produced 2,001 bars / 7,105.89 kg for one 300×300
 * column (unit mix-up). Material breakdown + cost + copy/print/PDF +
 * Send-to-BOQ are new.
 *
 * Shuttering rules (shown in-UI): slab = soffit + edges 2(L+W)×t (IS 1200);
 * beam = (2h+w)×L; column = 2(l+w)×h; footing = 2(L+W)×depth.
 * Nominal mixes (IS 456 Table 9) only up to M20 — for M25+ use /mix-design.
 */
import { Button } from "../ui/Button";
import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Plus, Trash2, Calculator, Copy, Check, Share2, Printer, FileText } from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { NumberInput } from "../ui/NumberInput";
import { CodeTooltip } from "../ui/CodeTooltip";
import { useGlobalSettings } from "../../context/SettingsContext";
import { useRates } from "../../lib/useRates";
import MasterRccStructure from "./MasterRccStructure";
import {
  calcRccElement,
  calcRccMaterials,
  defaultRccElement,
  THUMB_STEEL_PCT,
  type RccElementInput,
  type RccElementType,
} from "../../lib/rccCalc";
import { CalculationHistory } from '../ui/CalculationHistory';

const ELEMENT_TYPES: Array<{ id: RccElementType; label: string }> = [
  { id: "slab", label: "Slab" },
  { id: "column", label: "Column" },
  { id: "beam", label: "Beam" },
  { id: "staircase", label: "Staircase" },
  { id: "round-column", label: "Round Column" },
  { id: "footing", label: "Footing" },
];

interface ElState extends RccElementInput {
  id: string;
  name: string;
  l: number;
  w: number;
  h: number;
  extra1: number;
  extra2: number;
  extra3: number;
  coverMm: number;
  thumbPct: number;
  mainDia: number;
  mainSpacing: number;
  distDia: number;
  distSpacing: number;
  mainBars: number;
  stirrupDia: number;
  stirrupSpacing: number;
}

const toNum = (v: string | number, fallback: number) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return isFinite(n) ? n : fallback;
};

function elStateFrom(type: RccElementType, id: string): ElState {
  const d = defaultRccElement(type);
  return {
    ...d,
    id,
    name: `New ${type}`,
    l: d.l,
    w: d.w,
    h: d.h,
    extra1: d.extra1,
    extra2: d.extra2,
    extra3: d.extra3,
    coverMm: d.coverMm,
    thumbPct: d.thumbPct,
    mainDia: d.mainDia,
    mainSpacing: d.mainSpacing,
    distDia: d.distDia,
    distSpacing: d.distSpacing,
    mainBars: d.mainBars,
    stirrupDia: d.stirrupDia,
    stirrupSpacing: d.stirrupSpacing,
  };
}

/** The example set — the same slab 4×3 m / column 300×300 / beam 4 m
 *  the "Load example" button loads. Used as the first-render initial
 *  state so Master RCC shows a live calculation out of the box instead
 *  of an empty state; "Load example" re-applies it as a reset. */
function exampleElements(): ElState[] {
  return [
    { ...elStateFrom("slab", "ex-slab"), name: "Slab 4×3 m", l: 4, w: 3, h: 150 },
    { ...elStateFrom("column", "ex-col"), name: "Column 300×300", l: 300, w: 300, h: 3 },
    { ...elStateFrom("beam", "ex-beam"), name: "Beam 4 m", l: 4, w: 230, h: 450 },
  ];
}

function toEngineInput(el: ElState): RccElementInput {
  return {
    type: el.type,
    count: Math.max(1, Math.floor(toNum(el.count as unknown as string, 1)) || 1),
    l: toNum(el.l, 0),
    w: toNum(el.w, 0),
    h: toNum(el.h, 0),
    extra1: toNum(el.extra1, 0),
    extra2: toNum(el.extra2, 0),
    extra3: toNum(el.extra3, 0),
    coverMm: toNum(el.coverMm, 25),
    steelMode: el.steelMode,
    thumbPct: toNum(el.thumbPct, THUMB_STEEL_PCT[el.type]),
    mainDia: toNum(el.mainDia, 12),
    mainSpacing: toNum(el.mainSpacing, 150),
    distDia: toNum(el.distDia, 10),
    distSpacing: toNum(el.distSpacing, 150),
    mainBars: Math.max(1, Math.floor(toNum(el.mainBars, 4)) || 4),
    stirrupDia: toNum(el.stirrupDia, 8),
    stirrupSpacing: toNum(el.stirrupSpacing, 150),
  };
}

export function MasterRccCoreBody() {
  const { formatCurrency, currentCurrency } = useGlobalSettings();
  const { rates: tableRates, table } = useRates();
  const [elements, setElements] = useState<ElState[]>(exampleElements);
  const [grade, setGrade] = useState<"M10" | "M15" | "M20">("M20");
  const [wastage, setWastage] = useState("5");
  const [cementRate, setCementRate] = useState("");
  const [steelRate, setSteelRate] = useState("");
  const [sandRate, setSandRate] = useState("");
  const [aggRate, setAggRate] = useState("");
  const [formworkRate, setFormworkRate] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Effective rates: table defaults (PK: cement 1,450/bag, steel 270/kg,
  // sand/crush 90/cft) with the user's edits on top; IN/AE are null until entered.
  const effCement = cementRate.trim() !== "" ? toNum(cementRate, NaN) : tableRates.cementPerBag;
  const effSteel = steelRate.trim() !== "" ? toNum(steelRate, NaN) : tableRates.steelPerKg;
  const effSand = sandRate.trim() !== "" ? toNum(sandRate, NaN) : tableRates.sandPerCft;
  const effAgg = aggRate.trim() !== "" ? toNum(aggRate, NaN) : tableRates.crushPerCft;
  const effFormwork = formworkRate.trim() !== "" ? toNum(formworkRate, NaN) : null;

  const addElement = (type: RccElementType) => {
    setElements([...elements, elStateFrom(type, Math.random().toString(36).substring(7))]);
  };
  const removeElement = (id: string) => setElements(elements.filter((e) => e.id !== id));
  const updateElement = (id: string, field: keyof ElState, value: string | number) => {
    setElements(elements.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const loadExample = () => {
    setElements(exampleElements());
    setGrade("M20");
    setWastage("5");
  };

  const results = useMemo(() => {
    if (elements.length === 0) return null;
    const per = elements.map((el) => ({ el, res: calcRccElement(toEngineInput(el)) }));
    const totalWet = per.reduce((s, p) => s + p.res.wetVolumeM3, 0);
    const totalShut = per.reduce((s, p) => s + p.res.shutteringM2, 0);
    const totalSteel = per.reduce((s, p) => s + p.res.steelKg, 0);
    const materials = calcRccMaterials(totalWet, grade, toNum(wastage, 5));
    const errors = per.flatMap((p) => p.res.errors.map((e) => `${p.el.name}: ${e}`));
    return { per, totalWet, totalShut, totalSteel, materials, errors };
  }, [elements, grade, wastage]);

  const money = (v: number | null) => (v == null || !isFinite(v) ? "—" : formatCurrency(v, false));
  const costLines = useMemo(() => {
    if (!results) return null;
    const m = results.materials;
    const sandM3Rate = effSand != null ? effSand * 35.3147 : null; // per cft -> per m³
    const aggM3Rate = effAgg != null ? effAgg * 35.3147 : null;
    const lines = [
      { label: "Cement", qty: `${m.cementBagsOrder} bags`, amount: effCement != null ? m.cementBagsOrder * effCement : null },
      { label: "Sand", qty: `${m.sandM3.toFixed(2)} m³`, amount: sandM3Rate != null ? m.sandM3 * sandM3Rate : null },
      { label: "Aggregate", qty: `${m.aggregateM3.toFixed(2)} m³`, amount: aggM3Rate != null ? m.aggregateM3 * aggM3Rate : null },
      { label: "Steel", qty: `${results.totalSteel.toFixed(1)} kg`, amount: effSteel != null ? results.totalSteel * effSteel : null },
      { label: "Formwork", qty: `${results.totalShut.toFixed(1)} m²`, amount: effFormwork != null ? results.totalShut * effFormwork : null },
    ];
    const total = lines.reduce<number | null>((acc, l) => (l.amount == null ? acc : (acc ?? 0) + l.amount), null);
    return { lines, total };
  }, [results, effCement, effSteel, effSand, effAgg, effFormwork]);

  const summaryText = () => {
    if (!results) return "";
    const lines = [
      `Master RCC Estimate — ${currentCurrency}`,
      `Wet concrete: ${results.totalWet.toFixed(2)} m³ | Dry volume: ${results.materials.dryVolumeM3.toFixed(2)} m³ (${results.materials.mixLabel}, ${wastage}% wastage)`,
      `Shuttering: ${results.totalShut.toFixed(2)} m² | Steel: ${results.totalSteel.toFixed(1)} kg`,
      `Cement: ${results.materials.cementBagsOrder} bags (${results.materials.cementBagsExact.toFixed(2)} exact) | Sand: ${results.materials.sandM3.toFixed(2)} m³ | Aggregate: ${results.materials.aggregateM3.toFixed(2)} m³ | Water: ${results.materials.waterLiters.toFixed(0)} L`,
      ...results.per.map((p) => `${p.el.name} (${p.el.type} x${p.el.count}): ${p.res.wetVolumeM3.toFixed(2)} m³, ${p.res.shutteringM2.toFixed(2)} m², ${p.res.steelKg.toFixed(1)} kg steel`),
    ];
    if (costLines?.total != null) lines.push(`Estimated cost: ${money(costLines.total)} (rates entered by you)`);
    lines.push("Planning estimate only — confirm the final order with your quantity surveyor or structural engineer.");
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Master RCC estimate — Civil Estimation Pro", text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch { /* cancelled — fall through to copy */ }
    }
    await handleCopy();
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };
  const handlePrint = () => window.print();
  const handlePdf = () => {
    const doc = new jsPDF();
    const lines = summaryText().split("\n");
    doc.setFontSize(16);
    doc.text("Master RCC Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")}`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of lines.slice(1)) {
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 8;
    }
    doc.setFontSize(9);
    doc.text("Disclaimer: planning estimate only — confirm with your quantity surveyor or structural engineer.", 14, y + 8, { maxWidth: 180 });
    doc.save("master-rcc-estimate-civil-estimation-pro.pdf");
  };

  const sendToBOQ = () => {
    if (!results) return;
    const m = results.materials;
    // Concrete rate = material cost per m³ (cement + sand + aggregate),
    // so the BOQ line is priced from the same rates as the cost summary —
    // the old code sent rate 0 for all three lines, pricing everything at
    // zero in the BOQ. Steel uses the entered steel rate; formwork uses
    // the entered formwork rate (0 only when no rate was entered).
    const concRate = results.totalWet > 0 && effCement != null && effSand != null && effAgg != null
      ? (m.cementBagsOrder * effCement + m.sandM3 * effSand * 35.3147 + m.aggregateM3 * effAgg * 35.3147) / results.totalWet
      : 0;
    const items = [
      { id: Math.random().toString(36).substr(2, 9), division: "03 - Concrete", description: `RCC concrete (${m.mixLabel})`, unit: "m³", quantity: results.totalWet, rate: concRate },
      { id: Math.random().toString(36).substr(2, 9), division: "05 - Metals", description: "Steel reinforcement", unit: "kg", quantity: results.totalSteel, rate: effSteel ?? 0 },
      { id: Math.random().toString(36).substr(2, 9), division: "03 - Concrete", description: "Formwork / shuttering", unit: "m²", quantity: results.totalShut, rate: effFormwork ?? 0 },
    ];
    window.dispatchEvent(new CustomEvent("fill-boq", { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {ELEMENT_TYPES.map((t) => (
          <Button key={t.id} onClick={() => addElement(t.id)} className="text-base font-medium px-3 py-2 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100 flex items-center gap-1 border border-accent-100 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add {t.label}
          </Button>
        ))}
        <Button onClick={loadExample} className="text-base font-medium px-3 py-2 bg-surface-hover text-txt-secondary rounded-full hover:bg-surface-active border border-ui-borderSubtle whitespace-nowrap">Load example</Button>
      </div>

      {/* Global settings: grade, wastage, rates */}
      <div className="p-4 tool-card space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="rcc-grade" className="text-base font-medium mb-1 block">Nominal mix (IS 456 Table 9)</label>
            <select id="rcc-grade" value={grade} onChange={(e) => setGrade(e.target.value as "M10" | "M15" | "M20")} className="w-full h-10 px-3 bg-surface-hover border border-ui-borderSubtle rounded-2xl text-sm focus:outline-none">
              <option value="M10">M10 — 1:3:6</option>
              <option value="M15">M15 — 1:2:4</option>
              <option value="M20">M20 — 1:1.5:3</option>
            </select>
            <p className="text-xs text-txt-tertiary mt-1">Nominal mixes (IS 456 Table 9) only up to M20. For M25+ use the <a href="/mix-design" className="text-accent-800 underline">mix-design calculator</a>.</p>
          </div>
          <div>
            <label htmlFor="rcc-wastage" className="text-base font-medium mb-1 block">Wastage % (0–15)</label>
            <NumberInput value={wastage} onChange={(v) => setWastage(v.toString())} className="w-full" />
          </div>
          <div className="col-span-2">
            <span className="text-base font-medium mb-1 block">Rates ({currentCurrency}) — {table.source}</span>
            <p className="text-xs text-txt-tertiary">PK defaults are dated/sourced; IN/AE show “—” until you enter a rate.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {([
            ["Cement / bag", cementRate, setCementRate, tableRates.cementPerBag],
            ["Steel / kg", steelRate, setSteelRate, tableRates.steelPerKg],
            ["Sand / cft", sandRate, setSandRate, tableRates.sandPerCft],
            ["Aggregate / cft", aggRate, setAggRate, tableRates.crushPerCft],
            ["Formwork / m²", formworkRate, setFormworkRate, null],
          ] as const).map(([label, value, setter, def]) => (
            <div key={label}>
              <label className="text-sm font-medium mb-1 block">{label}</label>
              <input
                type="number" inputMode="decimal" min="0" value={value}
                placeholder={def != null ? String(def) : "Enter rate"}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                className="w-full h-10 px-3 bg-surface-hover border border-ui-borderSubtle rounded-2xl text-sm focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {elements.length === 0 && (
          <div className="p-4 sm:p-8 text-center text-txt-tertiary border border-dashed border-ui-borderDefault rounded-2xl">
            Add structural elements to begin the master calculation.
          </div>
        )}

        {elements.map((el, i) => (
          <div key={el.id} className="p-4 tool-card">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-color">
              <h3 className="font-bold text-txt-primary capitalize flex items-center gap-2">
                <span className="bg-surface-hover text-txt-tertiary w-6 h-6 rounded-full flex items-center justify-center text-sm">{i + 1}</span>
                {el.type}
              </h3>
              <Button aria-label="Delete" onClick={() => removeElement(el.id)} className="text-ui-errorText hover:text-ui-errorText p-1 bg-ui-error rounded-full transition-all duration-300 active:scale-95">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-base font-medium mb-1 block">Description</label>
                <input value={el.name} onChange={(e) => updateElement(el.id, "name", e.target.value)} className="w-full h-10 px-3 bg-surface-hover border border-ui-borderSubtle rounded-full text-sm focus:outline-none" />
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="text-base font-medium mb-1 block">Multiplier (Count)</label>
                <NumberInput value={String(el.count)} onChange={(v) => updateElement(el.id, "count", v)} className="w-full h-10 px-3 bg-surface-hover border border-ui-borderSubtle rounded-2xl text-sm focus:outline-none" />
              </div>

              {el.type === "slab" && (
                <>
                  <div><label className="text-base font-medium mb-1 block">Length (m)</label><NumberInput value={el.l} onChange={(v) => updateElement(el.id, "l", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Width (m)</label><NumberInput value={el.w} onChange={(v) => updateElement(el.id, "w", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Thickness (mm)</label><NumberInput value={el.h} onChange={(v) => updateElement(el.id, "h", v)} className="w-full" /></div>
                </>
              )}
              {el.type === "column" && (
                <>
                  <div><label className="text-base font-medium mb-1 block">Height (m)</label><NumberInput value={el.h} onChange={(v) => updateElement(el.id, "h", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Length (mm)</label><NumberInput value={el.l} onChange={(v) => updateElement(el.id, "l", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Width (mm)</label><NumberInput value={el.w} onChange={(v) => updateElement(el.id, "w", v)} className="w-full" /></div>
                </>
              )}
              {el.type === "beam" && (
                <>
                  <div><label className="text-base font-medium mb-1 block">Clear Span (m)</label><NumberInput value={el.l} onChange={(v) => updateElement(el.id, "l", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Width (mm)</label><NumberInput value={el.w} onChange={(v) => updateElement(el.id, "w", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Depth (mm)</label><NumberInput value={el.h} onChange={(v) => updateElement(el.id, "h", v)} className="w-full" /></div>
                </>
              )}
              {el.type === "round-column" && (
                <>
                  <div><label className="text-base font-medium mb-1 block">Height (m)</label><NumberInput value={el.h} onChange={(v) => updateElement(el.id, "h", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Diameter (mm)</label><NumberInput value={el.l} onChange={(v) => updateElement(el.id, "l", v)} className="w-full" /></div>
                </>
              )}
              {el.type === "footing" && (
                <>
                  <div><label className="text-base font-medium mb-1 block">Length (m)</label><NumberInput value={el.l} onChange={(v) => updateElement(el.id, "l", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Width (m)</label><NumberInput value={el.w} onChange={(v) => updateElement(el.id, "w", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Base depth (m)</label><NumberInput value={el.h} onChange={(v) => updateElement(el.id, "h", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Frustum top L (m, 0 = none)</label><NumberInput value={el.extra1} onChange={(v) => updateElement(el.id, "extra1", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Frustum top W (m)</label><NumberInput value={el.extra2} onChange={(v) => updateElement(el.id, "extra2", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Frustum height (m)</label><NumberInput value={el.extra3} onChange={(v) => updateElement(el.id, "extra3", v)} className="w-full" /></div>
                </>
              )}
              {el.type === "staircase" && (
                <>
                  <div><label className="text-base font-medium mb-1 block">Flight Width (m)</label><NumberInput value={el.l} onChange={(v) => updateElement(el.id, "l", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Number of Steps</label><NumberInput value={el.w} onChange={(v) => updateElement(el.id, "w", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Tread (mm)</label><NumberInput value={el.h} onChange={(v) => updateElement(el.id, "h", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Riser (mm)</label><NumberInput value={el.extra1} onChange={(v) => updateElement(el.id, "extra1", v)} className="w-full" /></div>
                  <div><label className="text-base font-medium mb-1 block">Waist Thick (mm)</label><NumberInput value={el.extra2} onChange={(v) => updateElement(el.id, "extra2", v)} className="w-full" /></div>
                </>
              )}
              <div>
                <label className="text-base font-medium mb-1 block">Clear cover (mm)</label>
                <NumberInput value={el.coverMm} onChange={(v) => updateElement(el.id, "coverMm", v)} className="w-full" />
                <p className="text-xs text-txt-tertiary mt-1">IS 456 Table 16: slab 20, beam 25, column 40 mm.</p>
              </div>
            </div>

            <div className="bg-surface-hover p-3 rounded-2xl border border-border-color">
              <div className="flex gap-4 mb-3 flex-wrap">
                <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                  <input type="radio" checked={el.steelMode === "thumb"} onChange={() => updateElement(el.id, "steelMode", "thumb")} className="w-4 h-4 text-accent-800" />
                  Thumb Rule (Vol %)
                </label>
                <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                  <input type="radio" checked={el.steelMode === "bbs"} onChange={() => updateElement(el.id, "steelMode", "bbs")} className="w-4 h-4 text-accent-800" />
                  Bar Bending Schedule (BBS)
                </label>
              </div>

              {el.steelMode === "thumb" ? (
                <div>
                  <label className="text-base font-medium mb-1 block">Steel % of concrete volume</label>
                  <p className="text-xs text-txt-tertiary mb-2">Slab 1.0% (≈78 kg/m³), beam 1.5% (≈118 kg/m³), column 2.0% (≈157 kg/m³), footing 0.8% (≈63 kg/m³).</p>
                  <input value={el.thumbPct} onChange={(e) => updateElement(el.id, "thumbPct", e.target.value)} type="number" inputMode="decimal" step="0.1" className="w-32 h-10 px-3 bg-surface-default border border-ui-borderSubtle rounded-full text-sm focus:outline-none" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-base font-medium mb-1 block"><span className="flex items-center gap-1">Main bar dia (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span></label>
                    <select value={el.mainDia} onChange={(e) => updateElement(el.id, "mainDia", e.target.value)} className="w-full h-10 px-3 bg-surface-default border border-ui-borderSubtle rounded-full text-sm focus:outline-none">
                      {[8, 10, 12, 16, 20, 25, 32].map((d) => (<option key={d} value={d}>{d} mm</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Main spacing (mm)</label>
                    <NumberInput value={el.mainSpacing} onChange={(v) => updateElement(el.id, "mainSpacing", v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Dist. bar dia (mm)</label>
                    <select value={el.distDia} onChange={(e) => updateElement(el.id, "distDia", e.target.value)} className="w-full h-10 px-3 bg-surface-default border border-ui-borderSubtle rounded-full text-sm focus:outline-none">
                      {[8, 10, 12, 16, 20, 25, 32].map((d) => (<option key={d} value={d}>{d} mm</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Dist. spacing (mm)</label>
                    <NumberInput value={el.distSpacing} onChange={(v) => updateElement(el.id, "distSpacing", v)} className="w-full" />
                  </div>
                  {(el.type === "column" || el.type === "beam" || el.type === "round-column") && (
                    <div>
                      <label className="text-base font-medium mb-1 block">Main bars (nos)</label>
                      <NumberInput value={el.mainBars} onChange={(v) => updateElement(el.id, "mainBars", v)} className="w-full" />
                    </div>
                  )}
                  {(el.type === "column" || el.type === "beam") && (
                    <>
                      <div>
                        <label className="text-base font-medium mb-1 block">Stirrup dia (mm)</label>
                        <select value={el.stirrupDia} onChange={(e) => updateElement(el.id, "stirrupDia", e.target.value)} className="w-full h-10 px-3 bg-surface-default border border-ui-borderSubtle rounded-full text-sm focus:outline-none">
                          {[6, 8, 10, 12].map((d) => (<option key={d} value={d}>{d} mm</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-base font-medium mb-1 block">Stirrup spacing (mm)</label>
                        <NumberInput value={el.stirrupSpacing} onChange={(v) => updateElement(el.id, "stirrupSpacing", v)} className="w-full" />
                      </div>
                    </>
                  )}
                  <p className="text-xs text-txt-tertiary col-span-2 md:col-span-4">
                    Cut lengths use clear span − 2 × cover + 2 × 9φ hooks; slab bars are cranked (0.42 × d) on alternate
                    bars only, with effective depth d = D − (cover + φ/2). Stirrups use the IS 2502 detailed length.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {results && (
          <div className="mt-8 space-y-6">
            {results.errors.length > 0 && (
              <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4" role="alert">
                <p className="font-bold text-ui-errorText">Check your inputs</p>
                <ul className="list-disc pl-5 mt-2 text-sm text-ui-errorText space-y-1">
                  {results.errors.map((e, i) => (<li key={i}>{e}</li>))}
                </ul>
              </div>
            )}
            <MaterialSummary title="Master Structural Summary" totalLabel="Total Concrete (Wet)" totalValue={results.totalWet.toFixed(2)} totalUnit="m³" relatedToolIds={["mix-design"]}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ResultCard title="Total Steel Weight" value={results.totalSteel.toFixed(2)} unit="kg" variant="primary" />
                <ResultCard title="Total Shuttering Area" value={results.totalShut.toFixed(2)} unit="m²" variant="neutral" />
                <ResultCard title="Dry Concrete Volume" value={results.materials.dryVolumeM3.toFixed(2)} unit="m³" variant="neutral" description={`Wet ${results.totalWet.toFixed(2)} m³ × 1.54 × (1 + ${wastage}% wastage)`} />
              </div>

              <div className="mt-6 pt-4 border-t border-border-color">
                <h4 className="text-base font-medium mb-4">Element Breakdown</h4>
                <div className="space-y-2">
                  {results.per.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-3 bg-surface-hover border border-border-color rounded-2xl">
                      <span className="font-bold text-txt-secondary">{p.el.name}</span>
                      <div className="flex gap-4 text-txt-tertiary flex-wrap">
                        <span><strong className="text-txt-primary">{p.res.wetVolumeM3.toFixed(2)}</strong> m³ conc (wet)</span>
                        <span><strong className="text-txt-primary">{p.res.shutteringM2.toFixed(2)}</strong> m² shut</span>
                        <span><strong className="text-txt-primary">{p.res.steelKg.toFixed(2)}</strong> kg stl</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {results.per.some((p) => p.res.bbs.length > 0) && (
                <div className="mt-6 pt-4 border-t border-border-color">
                  <h4 className="text-base font-medium mb-4">Bar Bending Schedule</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-txt-tertiary border-b border-ui-borderSubtle"><th className="py-2 pr-2">Bar</th><th className="py-2 pr-2 text-right">Dia</th><th className="py-2 pr-2 text-right">Nos</th><th className="py-2 pr-2 text-right">Cut length</th><th className="py-2 pr-2 text-right">Total length</th><th className="py-2 text-right">Weight</th></tr></thead>
                      <tbody>
                        {results.per.flatMap((p) => p.res.bbs.map((b, bi) => (
                          <tr key={`${p.el.id}-${bi}`} className="border-b border-ui-borderSubtle/50">
                            <td className="py-2 pr-2 text-txt-secondary">{p.el.name} — {b.description}</td>
                            <td className="py-2 pr-2 text-right">{b.diaMm} mm</td>
                            <td className="py-2 pr-2 text-right">{b.count}</td>
                            <td className="py-2 pr-2 text-right">{b.cutLengthM.toFixed(2)} m</td>
                            <td className="py-2 pr-2 text-right">{b.totalLengthM.toFixed(1)} m</td>
                            <td className="py-2 text-right font-bold">{b.weightKg.toFixed(1)} kg</td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                  {results.per.some((p) => p.res.stirrupLengthDetailedMm != null) && (
                    <p className="text-xs text-txt-tertiary mt-2">
                      Stirrup lengths use the IS 2502 detailed form (canonical). Field-rule length 2(A+B)+24φ is about
                      10% higher and is shown in the engine as a labelled approximation only.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border-color">
                <h4 className="text-base font-medium mb-4">Material Breakdown ({results.materials.mixLabel}, {wastage}% wastage)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultCard title="Cement" value={String(results.materials.cementBagsOrder)} unit="bags" variant="neutral" description={`${results.materials.cementBagsExact.toFixed(2)} exact · ${results.materials.cementKgExact.toFixed(0)} kg`} />
                  <ResultCard title="Sand" value={results.materials.sandM3.toFixed(2)} unit="m³" variant="neutral" />
                  <ResultCard title="Aggregate" value={results.materials.aggregateM3.toFixed(2)} unit="m³" variant="neutral" />
                  <ResultCard title="Water" value={results.materials.waterLiters.toFixed(0)} unit="L" variant="neutral" description="From unrounded cement mass × w/c" />
                </div>
              </div>

              {costLines && (
                <div className="mt-6 pt-4 border-t border-border-color">
                  <h4 className="text-base font-medium mb-4">Cost ({currentCurrency})</h4>
                  <dl className="divide-y divide-ui-borderSubtle">
                    {costLines.lines.map((l) => (
                      <div key={l.label} className="flex justify-between py-1.5 text-sm"><dt className="text-txt-secondary">{l.label} <span className="text-xs text-txt-tertiary">({l.qty})</span></dt><dd className="font-bold text-txt-primary">{money(l.amount)}</dd></div>
                    ))}
                    <div className="flex justify-between py-2 text-sm"><dt className="font-bold text-txt-primary">Total (priced lines only)</dt><dd className="font-bold text-txt-primary">{money(costLines.total)}</dd></div>
                  </dl>
                  <p className="text-xs text-txt-tertiary mt-2">Rates: {table.source}. A line with no rate shows “—” instead of a made-up price.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-6">
                <Button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-sm font-bold rounded-full hover:bg-ink-700">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copied" : "Copy results"}
                </Button>
                <Button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-txt-primary text-sm font-bold rounded-full border border-ui-borderSubtle hover:bg-surface-active">
                  <Share2 className="w-4 h-4" /> {shared ? "Shared / copied" : "Share"}
                </Button>
                <Button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-txt-primary text-sm font-bold rounded-full border border-ui-borderSubtle hover:bg-surface-active">
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button onClick={handlePdf} className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-txt-primary text-sm font-bold rounded-full border border-ui-borderSubtle hover:bg-surface-active">
                  <FileText className="w-4 h-4" /> Download PDF
                </Button>
                <Button onClick={sendToBOQ} className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 text-sm font-bold rounded-full hover:bg-accent-100">
                  <Calculator className="w-4 h-4" /> Send to BOQ
                </Button>
              </div>

              <div className="mt-6">
                <Button onClick={() => setShowFormula(!showFormula)} className="text-sm font-bold text-accent-800 underline">
                  {showFormula ? "Hide the working" : "How it’s calculated — show the working"}
                </Button>
                {showFormula && (
                  <div className="mt-3 text-sm text-txt-secondary leading-relaxed space-y-2 bg-surface-hover rounded-2xl p-4 border border-border-color">
                    <p><strong className="text-txt-primary">Concrete:</strong> slab V = L × W × t; column V = l × w × h; beam V = L × w × d; round column V = πr²h; footing = rectangular base + frustum h/3 × (A1 + A2 + √(A1×A2)). Wet volume × 1.54 = dry volume, split by the nominal mix ratio; cement bags = V<sub>cem</sub> ÷ 0.0347 (50 kg bag); water = unrounded cement mass × w/c.</p>
                    <p><strong className="text-txt-primary">Shuttering:</strong> slab = soffit L×W + edges 2(L+W)×t; beam = (2h+w)×L; column = 2(l+w)×h; footing = 2(L+W)×depth.</p>
                    <p><strong className="text-txt-primary">Steel (thumb):</strong> wet volume × % × 7850 kg/m³ (slab 1.0%, beam 1.5%, column 2.0%, footing 0.8%).</p>
                    <p><strong className="text-txt-primary">Steel (BBS):</strong> bars = ⌈span/spacing⌉ + 1; cut length = clear span − 2×cover + 2×9φ hooks; slab bars cranked 0.42×d on alternate bars only, d = D − (cover + φ/2); stirrups by IS 2502 detailed length; weight = length × d²/162.28 kg/m.</p>
                  </div>
                )}
              </div>
            </MaterialSummary>
          </div>
        )}
      <CalculationHistory calculatorId="master_rcc_engine" currentInputs={{elements, grade, wastage, cementRate, steelRate, sandRate, aggRate, formworkRate}} currentResults={results ? { totalWet: results.totalWet, totalShut: results.totalShut, totalSteel: results.totalSteel, cementBagsOrder: results.materials.cementBagsOrder, sandM3: results.materials.sandM3, aggregateM3: results.materials.aggregateM3 } : {}} onRestore={(ins) => {
          if (ins.elements != null) setElements(ins.elements as typeof elements);
          if (ins.grade != null) setGrade(ins.grade as typeof grade);
          if (ins.wastage != null) setWastage(ins.wastage as typeof wastage);
          if (ins.cementRate != null) setCementRate(ins.cementRate as typeof cementRate);
          if (ins.steelRate != null) setSteelRate(ins.steelRate as typeof steelRate);
          if (ins.sandRate != null) setSandRate(ins.sandRate as typeof sandRate);
          if (ins.aggRate != null) setAggRate(ins.aggRate as typeof aggRate);
          if (ins.formworkRate != null) setFormworkRate(ins.formworkRate as typeof formworkRate);
        }} />
      </div>
    </div>
  );
}

/**
 * Default export — what App.tsx renders for /master-rcc.
 *
 * The tabbed shell (Master Engine + Slab + Column + Beam + Staircase +
 * BBS) lives in MasterRccStructure, whose "Master Engine" tab renders
 * MasterRccCoreBody above. Wiring the shell here — instead of changing
 * the App.tsx case body — keeps the App.tsx change to the single appended
 * mix-design case. (Circular import with MasterRccStructure is safe: both
 * modules only reference each other inside render functions.)
 */
export default function MasterRccCore() {
  return <MasterRccStructure />;
}
