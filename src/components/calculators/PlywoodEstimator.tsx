import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import { calcPlywood, validatePlywood, type PlywoodElement, type PlywoodGrade, type PlywoodInputMode } from "../../lib/plywoodCalc";
import PlywoodContent from "./PlywoodContent";
import { useBOQ } from "../../context/BOQContext";
import { Calculator, Check, Copy, Download, Layers, Printer, Share2, Box, DollarSign, Ruler } from "lucide-react";

type UnitSystem = "metric" | "imperial";
type Currency = "PKR" | "INR" | "AED" | "USD";
const SYM: Record<Currency, string> = { PKR: "Rs", INR: "₹", AED: "AED", USD: "$" };
const FT = 3.28084;

const inputCls =
  "w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-ink outline-none transition-all";
const labelCls = "text-sm font-medium text-txt-secondary";
const money = (v: number | null, c: Currency) =>
  v == null ? "—" : `${SYM[c]} ${Math.round(v).toLocaleString("en-US")}`;

export function PlywoodEstimator() {
  const { addItem } = useBOQ();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [inputMode, setInputMode] = useState<PlywoodInputMode>("dimensions");
  const [element, setElement] = useState<PlywoodElement>("general");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("5");
  const [totalArea, setTotalArea] = useState("50");
  const [faces, setFaces] = useState<1 | 2>(1);
  const [beamWidth, setBeamWidth] = useState("0.3");
  const [beamDepth, setBeamDepth] = useState("0.5");
  const [openings, setOpenings] = useState("0");
  const [sheetSize, setSheetSize] = useState("2.44x1.22");
  const [customSheetL, setCustomSheetL] = useState("2.44");
  const [customSheetW, setCustomSheetW] = useState("1.22");
  const [thickness, setThickness] = useState("18");
  const [grade, setGrade] = useState<PlywoodGrade>("commercial");
  const [wastage, setWastage] = useState("5");
  const [reuse, setReuse] = useState("1");
  const [costPerSheet, setCostPerSheet] = useState("2500");
  const [secSpacing, setSecSpacing] = useState("0.4");
  const [primSpacing, setPrimSpacing] = useState("1.2");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const num = (s: string) => parseFloat(s);
  const toM = (v: number) => (unitSystem === "imperial" ? v / FT : v);
  const toM2 = (v: number) => (unitSystem === "imperial" ? v / (FT * FT) : v);

  // Element change presets wastage (formwork 10%, general 5%) — user can edit after.
  const onElementChange = (el: PlywoodElement) => {
    setElement(el);
    setWastage(el === "general" ? "5" : "10");
    if (el === "general") setReuse("1");
    if (el === "wall") setFaces(2);
  };

  const inputs = useMemo(() => {
    // Sheet size is stored in metric (2.44x1.22 / 1.83x0.91) or its imperial
    // label (8x4 / 6x3); the engine always works in metres.
    const stdSheet =
      sheetSize === "1.83x0.91" || sheetSize === "6x3"
        ? { l: 1.83, w: 0.91 }
        : { l: 2.44, w: 1.22 };
    const sheetL = sheetSize === "custom" ? toM(num(customSheetL) || 0) : stdSheet.l;
    const sheetW = sheetSize === "custom" ? toM(num(customSheetW) || 0) : stdSheet.w;
    return {
      mode: inputMode,
      lengthM: toM(num(length) || 0),
      widthM: toM(num(width) || 0),
      areaM2: toM2(num(totalArea) || 0),
      element,
      faces,
      beamWidthM: toM(num(beamWidth) || 0),
      beamDepthM: toM(num(beamDepth) || 0),
      openingsM2: toM2(num(openings) || 0),
      sheetLengthM: sheetL,
      sheetWidthM: sheetW,
      thicknessMm: num(thickness) || 0,
      grade,
      wastagePct: num(wastage) || 0,
      reuseFactor: parseInt(reuse, 10) || 1,
      costPerSheet: costPerSheet === "" ? null : num(costPerSheet),
      secondaryBeamSpacingM: toM(num(secSpacing) || 0.4),
      primaryBeamSpacingM: toM(num(primSpacing) || 1.2),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode, length, width, totalArea, element, faces, beamWidth, beamDepth, openings, sheetSize, customSheetL, customSheetW, thickness, grade, wastage, reuse, costPerSheet, secSpacing, primSpacing, unitSystem]);

  const errors = validatePlywood(inputs);
  const result = useMemo(() => calcPlywood(inputs), [inputs]);

  const unitL = unitSystem === "metric" ? "m" : "ft";
  const unitA = unitSystem === "metric" ? "m²" : "sq ft";
  const area = (m2: number) => (unitSystem === "metric" ? m2 : m2 * FT * FT);

  const switchUnit = (u: UnitSystem) => {
    if (u === unitSystem) return;
    const f = u === "imperial" ? FT : 1 / FT;
    const conv = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f).toFixed(3)));
    };
    conv(setLength, length); conv(setWidth, width); conv(setBeamWidth, beamWidth);
    conv(setBeamDepth, beamDepth); conv(setSecSpacing, secSpacing); conv(setPrimSpacing, primSpacing);
    const a = parseFloat(totalArea);
    if (isFinite(a)) setTotalArea(String(+(a * f * f).toFixed(2)));
    const o = parseFloat(openings);
    if (isFinite(o)) setOpenings(String(+(o * f * f).toFixed(2)));
    if (sheetSize === "custom") { conv(setCustomSheetL, customSheetL); conv(setCustomSheetW, customSheetW); }
    else if (u === "imperial") setSheetSize("8x4");
    else setSheetSize("2.44x1.22");
    setUnitSystem(u);
  };

  const onCurrencyChange = (c: Currency) => {
    setCurrency(c);
    setCostPerSheet(c === "PKR" ? "2500" : "");
  };

  const summaryText = () => [
    "Plywood estimate — Civil Estimation Pro",
    `Surface: ${inputMode === "dimensions" ? `${length} × ${width} ${unitL}` : `${totalArea} ${unitA}`} (${element}${element === "wall" ? `, ${faces} face(s)` : ""})`,
    `Net area: ${area(result.netAreaM2).toFixed(2)} ${unitA} · Gross (inc. ${wastage}% waste): ${area(result.grossAreaM2).toFixed(2)} ${unitA}`,
    `Sheets: ${result.sheetsToBuy} to buy (exact ${result.exactSheets.toFixed(2)}; reuse ${inputs.reuseFactor}) · Sheet ${inputs.sheetLengthM.toFixed(2)} × ${inputs.sheetWidthM.toFixed(2)} m, ${thickness} mm ${grade}`,
    `Total order volume: ${result.totalOrderVolumeM3.toFixed(2)} m³ (one sheet ${result.sheetVolumeM3.toFixed(4)} m³)`,
    result.totalCost != null ? `Estimated cost: ${money(result.totalCost, currency)} (${money(result.costPerM2, currency)} per m²)` : "Cost incomplete — enter a cost per sheet.",
    "Rates are indicative — confirm with your supplier.",
  ].join("\n");

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) {
      try { await navigator.share({ title: "Plywood estimate — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ }
    }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Plywood Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · Indicative rates — confirm with your supplier.`, 14, 26);
    let y = 38; doc.setFontSize(11);
    for (const line of summaryText().split("\n").slice(1)) { doc.text(line, 14, y); y += 8; }
    doc.setFontSize(9);
    doc.text("Disclaimer: planning estimate only — confirm the final order with your quantity surveyor or contractor.", 14, y + 8, { maxWidth: 180 });
    doc.save("plywood-estimate-civil-estimation-pro.pdf");
  };
  const handleExportBOQ = () => {
    addItem({ name: `Plywood sheets ${thickness} mm (${grade})`, quantity: result.sheetsToBuy, unit: "Sheets", rate: inputs.costPerSheet ?? 0, category: "Woodwork" });
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "1. Net surface area", theoretical: element === "wall" ? "Contact area = Length × Height × Faces; openings deducted once per face" : element === "slab" ? "Contact area = Length × Width" : element === "beam" ? "Contact area = (2 × Depth + Width) × Length" : element === "column" ? "Contact area = 2 × (Side A + Side B) × Height" : "Net area = Length × Width (or your direct area)", applied: `Contact area = ${area(result.contactAreaM2).toFixed(2)} ${unitA}\nNet = contact − openings = ${area(result.netAreaM2).toFixed(2)} ${unitA}` },
    { id: 2, label: "2. Gross area (incl. wastage)", theoretical: "Gross = Net × (1 + Wastage% / 100)", applied: `Gross = ${area(result.netAreaM2).toFixed(2)} × (1 + ${wastage}/100) = ${area(result.grossAreaM2).toFixed(2)} ${unitA}` },
    { id: 3, label: "3. Sheets", theoretical: "Sheet area = Sheet L × Sheet W\nExact sheets = Gross / Sheet area\nTo buy = ceil(Exact / Reuse) for formwork, else ceil(Exact)", applied: `Sheet area = ${result.sheetAreaM2.toFixed(2)} m²\nExact = ${result.exactSheets.toFixed(2)} → ${result.sheetsToBuy} sheets to buy (reuse ${inputs.reuseFactor})` },
    { id: 4, label: "4. Cost & volume", theoretical: "Total cost = Sheets to buy × Cost per sheet\nOne-sheet volume = Sheet area × Thickness; order volume = Sheets × One-sheet volume", applied: `Cost = ${result.sheetsToBuy} × ${costPerSheet || "—"} = ${money(result.totalCost, currency)}\nOrder volume = ${result.totalOrderVolumeM3.toFixed(2)} m³` },
  ];

  // Coverage grid: distinct colours — net (accent), cut/waste (amber-ish via accent-300), extra (red).
  const tiles = Math.min(result.sheetsToBuy, 200);
  const tileClass = (i: number) => {
    const start = i * result.sheetAreaM2;
    if (start >= result.netAreaM2) return "bg-ui-errorText/50";
    if ((i + 1) * result.sheetAreaM2 > result.netAreaM2) return "bg-accent-300";
    return "bg-accent-500/80";
  };

  const sheetOptions = unitSystem === "metric"
    ? [{ value: "2.44x1.22", label: "2.44 m × 1.22 m (Standard)" }, { value: "1.83x0.91", label: "1.83 m × 0.91 m (6×3 ft)" }, { value: "custom", label: "Custom size" }]
    : [{ value: "8x4", label: "8 ft × 4 ft (Standard)" }, { value: "6x3", label: "6 ft × 3 ft" }, { value: "custom", label: "Custom size" }];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-50 text-accent-700"><Layers size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-txt-primary">Formwork &amp; Plywood Estimator</h1>
              <p className="text-txt-secondary text-sm">Sheets, wastage, reuse and cost — calculated in your browser, no server needed.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-surface-hover p-1 rounded-xl">
              {(["metric", "imperial"] as const).map((u) => (
                <Button key={u} onClick={() => switchUnit(u)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unitSystem === u ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary"}`}>{u === "metric" ? "Metric (m)" : "Imperial (ft)"}</Button>
              ))}
            </div>
            <select value={currency} onChange={(e) => onCurrencyChange(e.target.value as Currency)} className="bg-surface-hover border border-ui-borderSubtle rounded-xl px-3 py-2 text-sm font-semibold" aria-label="Currency">
              {(["PKR", "INR", "AED", "USD"] as const).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}</Button>
            <Button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg"><Share2 size={16} /> {shared ? "Shared / copied" : "Share"}</Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg"><Printer size={16} /> Print</Button>
            <Button onClick={handlePdf} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-ink rounded-lg"><Download size={16} /> PDF</Button>
            <Button onClick={handleExportBOQ} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-ink rounded-lg"><Download size={16} /> Export BOQ</Button>
          </div>
        </div>
        {errors.length > 0 && (
          <div className="mt-4 rounded-xl border border-ui-errorBorder bg-ui-error p-4 text-sm text-ui-errorText" role="alert">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-default/80 rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2"><Ruler size={20} className="text-accent-700" /> Target surface area</h2>
              <div className="flex bg-surface-hover p-1 rounded-xl">
                {(["dimensions", "area"] as const).map((m) => (
                  <Button key={m} onClick={() => setInputMode(m)} className={`px-3 py-1 rounded-lg text-xs font-medium ${inputMode === m ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary"}`}>{m === "dimensions" ? "Dimensions (L × W)" : "Direct area"}</Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className={labelCls}>Element type</label>
                <select value={element} onChange={(e) => onElementChange(e.target.value as PlywoodElement)} className={inputCls}>
                  <option value="general">General surface (flooring / panelling)</option>
                  <option value="slab">Slab formwork</option>
                  <option value="wall">Wall formwork</option>
                  <option value="beam">Beam formwork</option>
                  <option value="column">Column formwork</option>
                </select>
              </div>
              {element === "wall" && (
                <div className="space-y-2"><label className={labelCls}>Faces formed</label>
                  <select value={faces} onChange={(e) => setFaces(Number(e.target.value) as 1 | 2)} className={inputCls}>
                    <option value={1}>One face</option>
                    <option value={2}>Both faces</option>
                  </select>
                </div>
              )}
            </div>
            {inputMode === "dimensions" ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className={labelCls}>Length ({unitL})</label><input type="number" min="0" value={length} onChange={(e) => setLength(e.target.value)} className={inputCls} /></div>
                <div className="space-y-2"><label className={labelCls}>{element === "wall" || element === "column" ? "Height" : "Width"} ({unitL})</label><input type="number" min="0" value={width} onChange={(e) => setWidth(e.target.value)} className={inputCls} /></div>
                {element === "beam" && (
                  <>
                    <div className="space-y-2"><label className={labelCls}>Beam width ({unitL})</label><input type="number" min="0" value={beamWidth} onChange={(e) => setBeamWidth(e.target.value)} className={inputCls} /></div>
                    <div className="space-y-2"><label className={labelCls}>Beam depth ({unitL})</label><input type="number" min="0" value={beamDepth} onChange={(e) => setBeamDepth(e.target.value)} className={inputCls} /></div>
                  </>
                )}
                {element === "column" && (
                  <div className="space-y-2"><label className={labelCls}>Second side ({unitL})</label><input type="number" min="0" value={beamWidth} onChange={(e) => setBeamWidth(e.target.value)} className={inputCls} /></div>
                )}
              </div>
            ) : (
              <div className="space-y-2"><label className={labelCls}>Total net area ({unitA})</label><input type="number" min="0" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} className={inputCls} /></div>
            )}
            <div className="space-y-2"><label className={labelCls}>Opening deductions ({unitA})</label><input type="number" min="0" value={openings} onChange={(e) => setOpenings(e.target.value)} className={inputCls} /></div>

            <div className="pt-4 border-t border-border-color">
              <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2 mb-4"><Box size={20} className="text-accent-700" /> Sheet specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-2 md:col-span-2"><label className={labelCls}>Standard sheet size</label>
                  <select value={sheetSize} onChange={(e) => setSheetSize(e.target.value)} className={inputCls}>
                    {sheetOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {sheetSize === "custom" && (
                  <>
                    <div className="space-y-2"><label className={labelCls}>Custom length ({unitL})</label><input type="number" min="0" value={customSheetL} onChange={(e) => setCustomSheetL(e.target.value)} className={inputCls} /></div>
                    <div className="space-y-2"><label className={labelCls}>Custom width ({unitL})</label><input type="number" min="0" value={customSheetW} onChange={(e) => setCustomSheetW(e.target.value)} className={inputCls} /></div>
                  </>
                )}
                <div className="space-y-2"><label className={labelCls}>Thickness (mm) — display &amp; volume only</label>
                  <select value={thickness} onChange={(e) => setThickness(e.target.value)} className={inputCls}>
                    {[9, 12, 16, 18, 21].map((t) => <option key={t} value={t}>{t} mm{t === 18 ? " (Standard)" : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><label className={labelCls}>Grade</label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value as PlywoodGrade)} className={inputCls}>
                    <option value="commercial">Commercial</option>
                    <option value="bwr">BWR (boiling-water resistant)</option>
                    <option value="marine">Marine</option>
                    <option value="shuttering">Shuttering / film-faced (HDO/MDO)</option>
                  </select>
                  <p className="text-xs text-txt-tertiary">Grade labels the order only — the sheet count does not depend on it. Enter the rate for your grade below.</p>
                </div>
                <div className="space-y-2"><label className={labelCls}>Wastage &amp; overlap (%)</label><input type="number" min="0" max="30" value={wastage} onChange={(e) => setWastage(e.target.value)} className={inputCls} /><p className="text-xs text-txt-tertiary">5% simple rectangular · 10% standard · 15% diagonal/complex.</p></div>
                {element !== "general" && (
                  <div className="space-y-2"><label className={labelCls}>Reuse factor (formwork, 1–8)</label><input type="number" min="1" max="8" step="1" value={reuse} onChange={(e) => setReuse(e.target.value)} className={inputCls} /><p className="text-xs text-txt-tertiary">How many pours one set of sheets serves. Fixed panelling/flooring always uses 1.</p></div>
                )}
              </div>
              {element === "slab" && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className={labelCls}>Secondary beam spacing ({unitL})</label><input type="number" min="0" value={secSpacing} onChange={(e) => setSecSpacing(e.target.value)} className={inputCls} /></div>
                  <div className="space-y-2"><label className={labelCls}>Primary beam spacing ({unitL})</label><input type="number" min="0" value={primSpacing} onChange={(e) => setPrimSpacing(e.target.value)} className={inputCls} /></div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-default/80 rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
            <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2 mb-4"><DollarSign size={20} className="text-ui-successText" /> Economics</h2>
            <div className="space-y-2"><label className={labelCls}>Cost per plywood sheet ({SYM[currency]}) — indicative, editable</label><input type="number" min="0" value={costPerSheet} onChange={(e) => setCostPerSheet(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
            <p className="text-xs text-txt-tertiary mt-2">PKR 2,500 per sheet is an unverified placeholder — confirm your grade and thickness price with a supplier.</p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ink rounded-2xl p-6 shadow-brand-lg text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Layers size={120} /></div>
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10"><Calculator size={24} className="text-accent-400" /> Material Takeoff</h2>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10"><div className="text-accent-200 text-sm font-medium mb-1">Total sheets</div><div className="text-4xl font-black">{result.sheetsToBuy}</div><div className="text-xs text-gray-200 mt-1">Exact {result.exactSheets.toFixed(2)} · reuse {inputs.reuseFactor}</div></div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10"><div className="text-accent-200 text-sm font-medium mb-1">Gross area</div><div className="text-2xl font-bold">{area(result.grossAreaM2).toFixed(2)} <span className="text-sm font-normal text-gray-200">{unitA}</span></div><div className="text-xs text-gray-200 mt-1">Inc. {wastage}% waste</div></div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 col-span-2"><div className="text-accent-200 text-sm font-medium mb-1">Order volume</div><div className="text-2xl font-bold">{result.totalOrderVolumeM3.toFixed(2)} m³</div><div className="text-xs text-gray-200 mt-1">One sheet {result.sheetVolumeM3.toFixed(4)} m³ ({thickness} mm) · Cost per m² {money(result.costPerM2, currency)}</div></div>
              {element === "slab" && (
                <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 col-span-2"><div className="text-accent-200 text-sm font-medium mb-1">Slab beams</div><div className="text-2xl font-bold">{result.secondaryBeamM.toFixed(0)} m secondary · {result.primaryBeamM.toFixed(0)} m primary</div></div>
              )}
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 col-span-2">
                <div className="text-accent-200 text-sm font-medium mb-2">Coverage grid</div>
                <div className="w-full bg-black/30 rounded-xl border border-white/5 overflow-hidden p-2">
                  <div className="relative w-full flex flex-wrap content-start gap-[1px]">
                    {Array.from({ length: tiles }).map((_, i) => (
                      <div key={i} className={`rounded-sm border border-black/40 ${tileClass(i)}`} style={{ width: "12%", height: 18, minWidth: 8 }} title={`Sheet ${i + 1}`} />
                    ))}
                    {result.sheetsToBuy > 200 && <div className="text-xs text-white/50 w-full text-center mt-1">…and {result.sheetsToBuy - 200} more</div>}
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-200 justify-center">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-500/80 rounded-sm" /> Net</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-300 rounded-sm" /> Cut / waste</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-ui-errorText/50 rounded-sm" /> Extra sheets</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-default rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
            <h3 className="text-lg font-bold text-txt-primary mb-4 border-b border-border-color pb-3">Cost Breakdown</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Plywood sheets ({result.sheetsToBuy} @ {costPerSheet || "—"})</span><span className="font-medium">{money(result.totalCost, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Total wastage area</span><span className="font-medium text-ui-errorText">{area(result.wastageAreaM2).toFixed(2)} {unitA}</span></div>
            </div>
            <div className="pt-4 border-t border-ui-borderSubtle flex justify-between items-center"><span className="text-base font-bold">Total estimate</span><span className="text-2xl font-bold text-accent-700">{money(result.totalCost, currency)}</span></div>
          </div>
          <FormulaAccordion steps={steps} />
        </div>
      </div>
      <PlywoodContent />
    </div>
  );
}
