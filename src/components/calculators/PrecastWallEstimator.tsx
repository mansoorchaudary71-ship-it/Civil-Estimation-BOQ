import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import { calcPrecastWall, validatePrecast, type FootingType, type PrecastLayout } from "../../lib/precastWallCalc";
import PrecastWallContent from "./PrecastWallContent";
import { useBOQ } from "../../context/BOQContext";
import { Calculator, Check, Copy, Download, Layers, Printer, Share2, Box, Hash, DollarSign, Ruler } from "lucide-react";

type UnitSystem = "metric" | "imperial";
type Currency = "PKR" | "INR" | "AED" | "USD";
const SYM: Record<Currency, string> = { PKR: "Rs", INR: "₹", AED: "AED", USD: "$" };
const FT = 3.28084;
const FT3 = 35.3147;

const inputCls =
  "w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-accent-800 outline-none transition-all";
const labelCls = "text-sm font-medium text-txt-secondary";
const money = (v: number | null, c: Currency) =>
  v == null ? "—" : `${SYM[c]} ${Math.round(v).toLocaleString("en-US")}`;

export function PrecastWallEstimator() {
  const { addItem } = useBOQ();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [currency, setCurrency] = useState<Currency>("PKR");

  const [wallLength, setWallLength] = useState("30");
  const [wallHeight, setWallHeight] = useState("2.4");
  const [layout, setLayout] = useState<PrecastLayout>("open");
  const [gateDeduction, setGateDeduction] = useState("0");
  const [panelWidth, setPanelWidth] = useState("2");
  const [panelHeight, setPanelHeight] = useState("0.3");
  const [panelThickness, setPanelThickness] = useState("50");
  const [footingType, setFootingType] = useState<FootingType>("isolated");
  const [footingL, setFootingL] = useState("0.45");
  const [footingW, setFootingW] = useState("0.45");
  const [footingD, setFootingD] = useState("0.6");
  const [stripW, setStripW] = useState("0.45");
  const [mix, setMix] = useState("1:2:4");
  const [wastage, setWastage] = useState("5");
  const [postRate, setPostRate] = useState("1500"); // indicative default (unverified — see note below)
  const [panelRate, setPanelRate] = useState("800");
  const [concreteRate, setConcreteRate] = useState("12000");
  const [labourRate, setLabourRate] = useState("150");
  const [transport, setTransport] = useState("0");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const num = (s: string) => parseFloat(s);
  const toM = (v: number) => (unitSystem === "imperial" ? v / FT : v);
  const toM3 = (v: number) => (unitSystem === "imperial" ? v / FT3 : v);

  const inputs = useMemo(() => {
    const [c, s, a] = mix.split(":").map((x) => parseFloat(x) || 0);
    return {
      wallLengthM: toM(num(wallLength) || 0),
      wallHeightM: toM(num(wallHeight) || 0),
      layout,
      gateDeductionM: toM(num(gateDeduction) || 0),
      panelWidthM: toM(num(panelWidth) || 0),
      panelHeightM: toM(num(panelHeight) || 0),
      panelThicknessMm: num(panelThickness) || 0,
      footingType,
      footingLengthM: toM(num(footingL) || 0),
      footingWidthM: toM(num(footingW) || 0),
      footingDepthM: toM(num(footingD) || 0),
      stripWidthM: toM(num(stripW) || 0),
      mix: [c || 1, s || 2, a || 4] as [number, number, number],
      wastagePct: num(wastage) || 0,
      rates: {
        postPerNos: postRate === "" ? null : num(postRate),
        panelPerNos: panelRate === "" ? null : num(panelRate),
        concretePerM3: concreteRate === "" ? null : toM3(num(concreteRate)),
        labourPerM: labourRate === "" ? null : (unitSystem === "imperial" ? num(labourRate) / FT : num(labourRate)),
        transportFlat: transport === "" ? null : num(transport),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallLength, wallHeight, layout, gateDeduction, panelWidth, panelHeight, panelThickness, footingType, footingL, footingW, footingD, stripW, mix, wastage, postRate, panelRate, concreteRate, labourRate, transport, unitSystem]);

  const errors = validatePrecast(inputs);
  const result = useMemo(() => calcPrecastWall(inputs), [inputs]);

  const unitL = unitSystem === "metric" ? "m" : "ft";
  const unitV = unitSystem === "metric" ? "m³" : "ft³";
  const vol = (m3: number) => (unitSystem === "metric" ? m3 : m3 * FT3);

  const switchUnit = (u: UnitSystem) => {
    if (u === unitSystem) return;
    const f = u === "imperial" ? FT : 1 / FT;
    const conv = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f).toFixed(3)));
    };
    conv(setWallLength, wallLength); conv(setWallHeight, wallHeight);
    conv(setGateDeduction, gateDeduction); conv(setPanelWidth, panelWidth);
    conv(setPanelHeight, panelHeight); conv(setFootingL, footingL);
    conv(setFootingW, footingW); conv(setFootingD, footingD); conv(setStripW, stripW);
    const cr = parseFloat(concreteRate);
    if (isFinite(cr)) setConcreteRate(String(+(cr * (u === "imperial" ? 1 / FT3 : FT3)).toFixed(2)));
    const lr = parseFloat(labourRate);
    if (isFinite(lr)) setLabourRate(String(+(lr * f).toFixed(2)));
    setUnitSystem(u);
  };

  const onCurrencyChange = (c: Currency) => {
    setCurrency(c);
    if (c === "PKR") {
      setPostRate("1500"); setPanelRate("800");
      setConcreteRate(unitSystem === "metric" ? "12000" : "340");
      setLabourRate(unitSystem === "metric" ? "150" : "46");
    } else {
      setPostRate(""); setPanelRate(""); setConcreteRate(""); setLabourRate("");
    }
  };

  const summaryText = () => [
    "Precast compound wall estimate — Civil Estimation Pro",
    `Wall: ${wallLength} × ${wallHeight} ${unitL} (${layout === "open" ? "open run" : "closed rectangle"})`,
    `Posts: ${result.posts} · Panels: ${result.panels} (${result.orderPanels} to order @ ${wastage}% wastage)`,
    `Footing concrete: ${vol(result.footingWetM3).toFixed(2)} ${unitV} wet (${result.footingDryM3.toFixed(2)} m³ dry)`,
    `Cement: ${result.cementBags} bags · Sand: ${vol(result.sandM3).toFixed(2)} ${unitV} · Aggregate: ${vol(result.aggregateM3).toFixed(2)} ${unitV}`,
    result.totalCost != null ? `Estimated cost: ${money(result.totalCost, currency)} (${money(result.costPerRunningM, currency)} per running ${unitL})` : "Cost incomplete — enter all rates.",
    "Rates are indicative — confirm with your supplier.",
  ].join("\n");

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) {
      try { await navigator.share({ title: "Precast wall estimate — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ }
    }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Precast Compound Wall Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · Indicative rates — confirm with your supplier.`, 14, 26);
    let y = 38; doc.setFontSize(11);
    for (const line of summaryText().split("\n").slice(1)) { doc.text(line, 14, y); y += 8; }
    doc.setFontSize(9);
    doc.text("Disclaimer: planning estimate only — confirm the final order with your quantity surveyor or contractor.", 14, y + 8, { maxWidth: 180 });
    doc.save("precast-wall-estimate-civil-estimation-pro.pdf");
  };
  const handleExportBOQ = () => {
    addItem({ name: "Precast posts (H-columns)", quantity: result.posts, unit: "Nos", rate: inputs.rates.postPerNos ?? 0, category: "Masonry" });
    addItem({ name: "Precast wall panels", quantity: result.orderPanels, unit: "Nos", rate: inputs.rates.panelPerNos ?? 0, category: "Masonry" });
    addItem({ name: "Footing cement (1:2:4)", quantity: result.cementBags, unit: "Bags", rate: 0, category: "Masonry" });
    addItem({ name: "Footing concrete", quantity: result.footingWetM3, unit: "m³", rate: inputs.rates.concretePerM3 ?? 0, category: "Concrete" });
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "1. Posts", theoretical: "Spans = ceil(Effective length / Panel width)\nPosts = Spans + 1 (open) or Spans (closed)", applied: `Spans = ceil(${result.effectiveLengthM.toFixed(2)} / ${inputs.panelWidthM}) = ${result.spans}\nPosts = ${result.posts}` },
    { id: 2, label: "2. Panels", theoretical: "Panels per span = ceil(Wall height / Panel height)\nTotal panels = Spans × Panels per span; to order = ceil(total × (1 + wastage))", applied: `Panels per span = ceil(${inputs.wallHeightM} / ${inputs.panelHeightM}) = ${result.panelsPerSpan}\nPanels = ${result.spans} × ${result.panelsPerSpan} = ${result.panels}; to order = ${result.orderPanels}` },
    { id: 3, label: "3. Footing concrete (1:2:4)", theoretical: "Wet vol = Posts × L × W × D (isolated) or Length × Width × Depth (strip)\nDry = Wet × 1.54; cement = Dry ÷ 7; bags = ceil(cement ÷ 0.0347)", applied: `Wet = ${vol(result.footingWetM3).toFixed(2)} ${unitV}; dry = ${result.footingDryM3.toFixed(2)} m³\nCement = ${result.cementBags} bags; sand = ${vol(result.sandM3).toFixed(2)} ${unitV}; aggregate = ${vol(result.aggregateM3).toFixed(2)} ${unitV}` },
    { id: 4, label: "4. Total cost", theoretical: "Cost = Posts × post rate + Order panels × panel rate + Footing wet vol × concrete rate + Labour + Transport", applied: `Posts ${money(result.postCost, currency)} + Panels ${money(result.panelCost, currency)} + Concrete ${money(result.footingCost, currency)} + Labour ${money(result.labourCost, currency)} + Transport ${money(result.transportCost, currency)}\nTotal = ${money(result.totalCost, currency)}` },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-100 text-accent-800"><Layers size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-txt-primary">Precast Compound Wall</h1>
              <p className="text-txt-secondary text-sm">Panels, posts, footing concrete and total cost — with wastage, labour and closed-loop layouts.</p>
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
        {result.warnings.map((w) => (
          <p key={w} className="mt-3 text-sm text-accent-800 bg-accent-50 border border-accent-100 rounded-xl px-4 py-2">{w}</p>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-default/80 rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
            <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2"><Ruler size={20} className="text-accent-800" /> Dimensions &amp; Specs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className={labelCls}>Total wall length ({unitL})</label><input type="number" min="0" value={wallLength} onChange={(e) => setWallLength(e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Wall height ({unitL})</label><input type="number" min="0" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Layout</label>
                <select value={layout} onChange={(e) => setLayout(e.target.value as PrecastLayout)} className={inputCls}>
                  <option value="open">Open run (posts = spans + 1)</option>
                  <option value="closed">Closed rectangle (posts = spans)</option>
                </select>
              </div>
              <div className="space-y-2"><label className={labelCls}>Gate / return deduction ({unitL})</label><input type="number" min="0" value={gateDeduction} onChange={(e) => setGateDeduction(e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Panel width = post spacing ({unitL})</label><input type="number" min="0" value={panelWidth} onChange={(e) => setPanelWidth(e.target.value)} className={inputCls} /><p className="text-xs text-txt-tertiary">Standard precast panel 2.13 × 0.30 × 0.05 m; column 150 × 150 mm.</p></div>
              <div className="space-y-2"><label className={labelCls}>Panel height ({unitL})</label><input type="number" min="0" value={panelHeight} onChange={(e) => setPanelHeight(e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Panel thickness (mm)</label><input type="number" min="0" value={panelThickness} onChange={(e) => setPanelThickness(e.target.value)} className={inputCls} /></div>
              <div className="space-y-2"><label className={labelCls}>Wastage — panels &amp; posts (%)</label><input type="number" min="0" max="50" value={wastage} onChange={(e) => setWastage(e.target.value)} className={inputCls} /></div>
            </div>
            <div className="pt-4 border-t border-border-color">
              <h3 className="text-sm font-bold text-txt-secondary mb-4">Footing</h3>
              <div className="space-y-2 mb-4"><label className={labelCls}>Footing type</label>
                <select value={footingType} onChange={(e) => setFootingType(e.target.value as FootingType)} className={inputCls}>
                  <option value="isolated">Isolated pad per post</option>
                  <option value="strip">Strip footing (continuous)</option>
                  <option value="pcc-bed">PCC bed (pad volume as blinding allowance)</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-xs text-txt-tertiary">Length ({unitL})</label><input type="number" min="0" value={footingL} onChange={(e) => setFootingL(e.target.value)} className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs text-txt-tertiary">Width ({unitL})</label><input type="number" min="0" value={footingW} onChange={(e) => setFootingW(e.target.value)} className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs text-txt-tertiary">Depth ({unitL})</label><input type="number" min="0" value={footingD} onChange={(e) => setFootingD(e.target.value)} className={inputCls} /></div>
              </div>
              {footingType === "strip" && (
                <div className="space-y-1 mt-4"><label className="text-xs text-txt-tertiary">Strip width ({unitL})</label><input type="number" min="0" value={stripW} onChange={(e) => setStripW(e.target.value)} className={inputCls} /></div>
              )}
              <div className="space-y-2 mt-4"><label className={labelCls}>Concrete mix</label>
                <select value={mix} onChange={(e) => setMix(e.target.value)} className={inputCls}>
                  <option value="1:2:4">1:2:4 — standard footing</option>
                  <option value="1:1.5:3">1:1.5:3 — richer</option>
                  <option value="1:3:6">1:3:6 — lean / PCC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface-default/80 rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
            <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2"><DollarSign size={20} className="text-ui-successText" /> Unit rates ({SYM[currency]}) — indicative, editable</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><label className={labelCls}>Cost per post</label><input type="number" min="0" value={postRate} onChange={(e) => setPostRate(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
              <div className="space-y-2"><label className={labelCls}>Cost per panel</label><input type="number" min="0" value={panelRate} onChange={(e) => setPanelRate(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
              <div className="space-y-2"><label className={labelCls}>Concrete per {unitV}</label><input type="number" min="0" value={concreteRate} onChange={(e) => setConcreteRate(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
              <div className="space-y-2"><label className={labelCls}>Labour per running {unitL}</label><input type="number" min="0" value={labourRate} onChange={(e) => setLabourRate(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
              <div className="space-y-2"><label className={labelCls}>Transport (flat)</label><input type="number" min="0" value={transport} onChange={(e) => setTransport(e.target.value)} className={inputCls} /></div>
            </div>
            <p className="text-xs text-txt-tertiary">Post/panel rates are unverified indicative defaults (Rs 1,500 per post, Rs 800 per panel). Confirm with your supplier before ordering.</p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ink rounded-2xl p-6 shadow-brand-lg text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Box size={120} /></div>
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10"><Calculator size={24} className="text-accent-400" /> Material Quantities</h2>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10"><div className="text-accent-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Hash size={14} /> Posts</div><div className="text-3xl font-bold">{result.posts}</div><div className="text-xs text-gray-200 mt-1">{result.orderPosts} to order @ {wastage}%</div></div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10"><div className="text-accent-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Layers size={14} /> Panels</div><div className="text-3xl font-bold">{result.panels}</div><div className="text-xs text-gray-200 mt-1">{result.orderPanels} to order @ {wastage}%</div></div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 col-span-2"><div className="text-accent-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Box size={14} /> Footing concrete</div><div className="text-3xl font-bold">{vol(result.footingWetM3).toFixed(2)} <span className="text-lg font-normal text-gray-200">{unitV}</span></div><div className="text-xs text-gray-200 mt-1">Dry {result.footingDryM3.toFixed(2)} m³ · Cement {result.cementBags} bags · Sand {vol(result.sandM3).toFixed(2)} {unitV} · Aggregate {vol(result.aggregateM3).toFixed(2)} {unitV}</div></div>
              <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 col-span-2"><div className="text-accent-200 text-sm font-medium mb-1">Covered length</div><div className="text-2xl font-bold">{result.coveredLengthM.toFixed(2)} m</div><div className="text-xs text-gray-200 mt-1">Effective length {result.effectiveLengthM.toFixed(2)} m · Panel concrete {result.panelConcreteM3.toFixed(2)} m³</div></div>
            </div>
          </div>

          <div className="bg-surface-default rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
            <h3 className="text-lg font-bold text-txt-primary mb-4 border-b border-border-color pb-3">Cost Breakdown</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Posts ({result.posts} @ {postRate || "—"})</span><span className="font-medium">{money(result.postCost, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Panels ({result.orderPanels} @ {panelRate || "—"})</span><span className="font-medium">{money(result.panelCost, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Footing concrete ({vol(result.footingWetM3).toFixed(2)} {unitV})</span><span className="font-medium">{money(result.footingCost, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Labour ({result.effectiveLengthM.toFixed(1)} {unitL})</span><span className="font-medium">{money(result.labourCost, currency)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-txt-secondary">Transport</span><span className="font-medium">{money(result.transportCost, currency)}</span></div>
            </div>
            <div className="pt-4 border-t border-ui-borderSubtle flex justify-between items-center"><span className="text-base font-bold">Total estimate</span><span className="text-2xl font-bold text-accent-800">{money(result.totalCost, currency)}</span></div>
            <p className="text-sm text-txt-secondary mt-2">{money(result.costPerRunningM, currency)} per running {unitL} · {money(result.costPerM2Wall, currency)} per m² of wall</p>
          </div>
          <FormulaAccordion steps={steps} />
        </div>
      </div>
      <PrecastWallContent />
    </div>
  );
}
