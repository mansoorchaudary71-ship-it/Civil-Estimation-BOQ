import { Button } from "../ui/Button";
import React, { useMemo, useState, useRef } from "react";
import { CalculationHistory } from "../ui/CalculationHistory";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  LayoutTemplate,
  FileImage,
  Copy,
  Printer,
  RotateCw,
  Ruler,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { CodeTooltip } from "../ui/CodeTooltip";
import { useAutoSave } from "../../hooks/useAutoSave";
import CageEstimator from "./CageEstimator";
import {
  calcReinforcement,
  defaultReinforcementInputs,
  defaultSlabInputs,
  validateReinforcement,
  type ReinfElementType,
  type ReinforcementInputs,
} from "../../lib/reinforcementCalc";
import {
  BAR_GRADES,
  STEEL_RATE_DEFAULTS,
  STEEL_RATE_LABEL,
  formatSteelMoney,
  type SteelCurrency,
} from "../../lib/steelCalc";
import { exportBOQToPDF } from "../../lib/pdfExport";

type ElementType = ReinfElementType;
type Tab = "detailing" | "cage";

const inputCls =
  "w-full px-3 py-2 bg-surface-default border border-ui-borderDefault rounded-full outline-none focus:ring-2 focus:ring-accent-500";
const inputErrCls =
  "w-full px-3 py-2 bg-surface-default border border-ui-errorBorder rounded-full outline-none focus:ring-2 focus:ring-ui-errorText";
const selectCls =
  "w-full px-3 py-2 bg-surface-default border border-ui-borderDefault rounded-2xl outline-none focus:ring-2 focus:ring-accent-500";
const labelCls = "block text-xs font-bold text-txt-secondary mb-1";
const CURRENCIES: SteelCurrency[] = ["PKR", "INR", "AED", "USD"];

export default function ReinforcementVisualizer() {
  const [tab, setTab] = useState<Tab>("detailing");
  const [type, setType] = useState<ElementType>("Beam");
  const [width, setWidth] = useState(300); // mm
  const [depth, setDepth] = useState(450); // mm
  const [cover, setCover] = useState(25); // mm
  const [lengthM, setLengthM] = useState(3);
  const [slabWidthM, setSlabWidthM] = useState(3);

  const [topBarsCount, setTopBarsCount] = useState(2);
  const [topBarsDia, setTopBarsDia] = useState(16);
  const [bottomBarsCount, setBottomBarsCount] = useState(3);
  const [bottomBarsDia, setBottomBarsDia] = useState(20);
  const [stirrupDia, setStirrupDia] = useState(8);
  const [stirrupSpacing, setStirrupSpacing] = useState(150);
  const [mainSpacing, setMainSpacing] = useState(150);
  const [distDia, setDistDia] = useState(8);
  const [distSpacing, setDistSpacing] = useState(200);
  const [grade, setGrade] = useState("grade60");
  const [concreteGrade, setConcreteGrade] = useState("M20");
  const [wastage, setWastage] = useState("5");
  const [rate, setRate] = useState("270");
  const [currency, setCurrency] = useState<SteelCurrency>("PKR");
  const [notice, setNotice] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  useAutoSave(
    "reinforcement_visualizer_v2",
    { type, width, depth, cover, lengthM, slabWidthM, topBarsCount, topBarsDia, bottomBarsCount, bottomBarsDia, stirrupDia, stirrupSpacing, mainSpacing, distDia, distSpacing, grade, concreteGrade, wastage, rate, currency },
    {
      type: (v) => setType(v as ElementType), width: setWidth, depth: setDepth, cover: setCover,
      lengthM: setLengthM, slabWidthM: setSlabWidthM, topBarsCount: setTopBarsCount, topBarsDia: setTopBarsDia,
      bottomBarsCount: setBottomBarsCount, bottomBarsDia: setBottomBarsDia, stirrupDia: setStirrupDia,
      stirrupSpacing: setStirrupSpacing, mainSpacing: setMainSpacing, distDia: setDistDia, distSpacing: setDistSpacing,
      grade: setGrade, concreteGrade: setConcreteGrade, wastage: setWastage, rate: setRate,
      currency: (v) => setCurrency(v as SteelCurrency),
    },
  );

  const onTypeChange = (t: ElementType) => {
    setType(t);
    setCover(t === "Slab" ? 20 : t === "Column" ? 40 : 25);
    if (t === "Slab") {
      setDepth(150);
      setWidth(3000);
      setLengthM(4);
      setSlabWidthM(3);
      setBottomBarsDia(12);
    } else {
      setDepth(450);
      setWidth(300);
      setLengthM(3);
      setBottomBarsDia(20);
    }
  };

  const inputs: ReinforcementInputs = {
    type,
    lengthM,
    widthM: slabWidthM,
    widthMm: width,
    depthMm: depth,
    coverMm: cover,
    topCount: topBarsCount,
    topDiaMm: topBarsDia,
    bottomCount: bottomBarsCount,
    bottomDiaMm: bottomBarsDia,
    stirrupDiaMm: stirrupDia,
    stirrupSpacingMm: stirrupSpacing,
    mainDiaMm: bottomBarsDia,
    mainSpacingMm: mainSpacing,
    distDiaMm: distDia,
    distSpacingMm: distSpacing,
    wastagePct: Number(wastage) || 0,
    ratePerKg: rate.trim() === "" ? null : Number(rate),
  };

  const errors = useMemo(() => validateReinforcement(inputs), [type, width, depth, cover, lengthM, slabWidthM, topBarsCount, topBarsDia, bottomBarsCount, bottomBarsDia, stirrupDia, stirrupSpacing, mainSpacing, distDia, distSpacing, wastage, rate]);
  const results = errors.length === 0 ? calcReinforcement(inputs) : null;

  const onCurrencyChange = (c: SteelCurrency) => {
    setCurrency(c);
    const v = STEEL_RATE_DEFAULTS[c].perKg;
    setRate(v == null ? "" : String(v));
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reinforcement_${type.toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const scale = 3;
    const paddingX = 100;
    const paddingY = 80;
    const vWidth = width + paddingX * 2;
    const vHeight = depth + paddingY * 2;
    canvas.width = vWidth * scale;
    canvas.height = vHeight * scale;
    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `reinforcement_${type.toLowerCase()}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const summaryText = () => {
    if (!results) return "Reinforcement — fix the errors above to see quantities.";
    const lines = results.layers.map((l) => `${l.label}: ${l.count} × Ø${l.diaMm}, ${l.totalLengthM.toFixed(2)} m, ${l.weightKg.toFixed(2)} kg`);
    return [
      `${type} ${type === "Slab" ? `${lengthM} × ${slabWidthM} m, ${depth} mm thick` : `${width} × ${depth} mm, ${lengthM} m long`}, cover ${cover} mm`,
      `Effective depth d = ${results.effectiveDepthMm} mm`,
      ...lines,
      `Total: ${results.totalNetKg.toFixed(2)} kg net, ${results.orderWeightKg.toFixed(2)} kg with ${wastage}% wastage (${results.tonnes.toFixed(3)} t)`,
      `Cost: ${results.cost == null ? "— (enter a steel rate)" : formatSteelMoney(results.cost, currency)}`,
      results.formula,
    ].join("\n");
  };

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setNotice("Results copied.");
    } catch {
      setNotice("Copy failed — your browser blocked clipboard access.");
    }
  };

  const downloadPdf = () => {
    if (!results) return;
    exportBOQToPDF({
      projectName: `Reinforcement ${type}`,
      date: new Date().toLocaleDateString("en-GB"),
      items: results.layers.map((l) => ({
        description: `${l.label} — ${l.count} × Ø${l.diaMm} mm`,
        quantity: l.weightKg,
        unit: "kg",
        rate: inputs.ratePerKg ?? 0,
        amount: inputs.ratePerKg == null ? 0 : l.weightKg * inputs.ratePerKg,
      })),
      totalAmount: results.cost ?? 0,
    });
    setNotice("PDF downloaded.");
  };

  const loadBeamExample = () => {
    const ex = defaultReinforcementInputs();
    onTypeChange("Beam");
    setLengthM(ex.lengthM);
    setWidth(ex.widthMm);
    setDepth(ex.depthMm);
    setCover(ex.coverMm);
    setTopBarsCount(ex.topCount ?? 2);
    setTopBarsDia(ex.topDiaMm ?? 16);
    setBottomBarsCount(ex.bottomCount ?? 3);
    setBottomBarsDia(ex.bottomDiaMm ?? 20);
    setStirrupDia(ex.stirrupDiaMm ?? 8);
    setStirrupSpacing(ex.stirrupSpacingMm ?? 150);
    setWastage(String(ex.wastagePct));
    setRate("270");
    setCurrency("PKR");
    setNotice("Worked example loaded: 300 × 450 beam, 3 m, 2×Ø16 top, 3×Ø20 bottom, Ø8 stirrups @150.");
  };

  const loadSlabExample = () => {
    const ex = defaultSlabInputs();
    onTypeChange("Slab");
    setLengthM(ex.lengthM);
    setSlabWidthM(ex.widthM ?? 3);
    setDepth(ex.depthMm);
    setCover(ex.coverMm);
    setBottomBarsDia(ex.mainDiaMm ?? 12);
    setMainSpacing(ex.mainSpacingMm ?? 150);
    setDistDia(ex.distDiaMm ?? 8);
    setDistSpacing(ex.distSpacingMm ?? 200);
    setNotice("Worked example loaded: 4 × 3 m slab, 150 mm thick, Ø12 @150 main, Ø8 @200 distribution.");
  };

  // SVG geometry (cross-section)
  const paddingX = 100;
  const paddingY = 80;
  const svgWidthMm = type === "Slab" ? Math.min(width, 1200) : width;
  const vWidth = svgWidthMm + paddingX * 2;
  const vHeight = depth + paddingY * 2;
  const startX = paddingX;
  const startY = paddingY;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Tabs: Detailing | Pile Cage (cage lives here — no separate route yet) */}
      <div className="flex bg-surface-hover p-1 rounded-2xl w-full max-w-xl overflow-hidden print:hidden">
        <Button onClick={() => setTab("detailing")} className={`flex-1 py-3 rounded-2xl text-base font-medium transition-all ${tab === "detailing" ? "bg-surface-default text-accent-800 shadow-brand-sm" : "text-txt-tertiary hover:text-txt-secondary"}`}>
          <Ruler className="w-4 h-4" /> Beam / Column / Slab
        </Button>
        <Button onClick={() => setTab("cage")} className={`flex-1 py-3 rounded-2xl text-base font-medium transition-all ${tab === "cage" ? "bg-surface-default text-accent-800 shadow-brand-sm" : "text-txt-tertiary hover:text-txt-secondary"}`}>
          <RotateCw className="w-4 h-4" /> Pile Cage
        </Button>
      </div>
      {tab === "cage" && (
        <div>
          <p className="text-sm text-txt-secondary mb-4">
            The pile cage estimator lives here as a tab of the Reinforcement tool. A standalone
            <code className="mx-1">/cage-estimator</code> route is ready to wire (one registry line — see the
            delivery report); until then this tab is the way to reach it.
          </p>
          <CageEstimator />
        </div>
      )}
      {tab === "detailing" && (
        <>
          <p className="text-base text-txt-secondary leading-relaxed max-w-3xl print:hidden">
            Draw the cross-section, enter the bars, and get the quantities: main bars, stirrups,
            slab grids, effective depth, spacing checks and total steel weight with cost — plus the
            pile cage estimator on its own tab.
          </p>
          {notice && (
            <div className="flex items-start gap-2 bg-ui-success border border-ui-successBorder text-ui-successText rounded-2xl px-4 py-3 print:hidden">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{notice}</p>
            </div>
          )}
          {errors.length > 0 && (
            <div className="bg-ui-error border border-ui-errorBorder text-ui-errorText rounded-2xl px-4 py-3 print:hidden">
              <p className="font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Fix these — quantities show “—” until they are fixed:</p>
              <ul className="list-disc ml-5 mt-1 text-sm">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          )}

          <MaterialSummary
            title="Reinforcement Detailing"
            icon={<LayoutTemplate className="w-5 h-5" />}
            totalLabel="Total Steel (net)"
            totalValue={results ? results.totalNetKg.toFixed(2) : "—"}
            totalUnit="kg"
            subtitle={results ? `${results.orderWeightKg.toFixed(2)} kg to order (+${wastage}% wastage) · ${results.cost == null ? "cost — (enter a steel rate)" : formatSteelMoney(results.cost, currency)}` : ""}
          >
            <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
              <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
                <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary p-4 sm:p-6 overflow-hidden">
                  <h3 className="text-lg font-bold text-txt-primary mb-4">Geometry Inputs</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-txt-secondary mb-1" htmlFor="reinf-type">Element Type</label>
                      <select id="reinf-type" value={type} onChange={(e) => onTypeChange(e.target.value as ElementType)} className={selectCls}>
                        <option value="Beam">Beam</option>
                        <option value="Column">Column</option>
                        <option value="Slab">Slab</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {type === "Slab" ? (
                        <>
                          <div>
                            <label className={labelCls} htmlFor="reinf-len">Slab Length (m)</label>
                            <input id="reinf-len" type="number" inputMode="decimal" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} className={errors.some((x) => x.includes("length")) ? inputErrCls : inputCls} />
                          </div>
                          <div>
                            <label className={labelCls} htmlFor="reinf-slabw">Slab Width (m)</label>
                            <input id="reinf-slabw" type="number" inputMode="decimal" value={slabWidthM} onChange={(e) => setSlabWidthM(Number(e.target.value))} className={errors.some((x) => x.includes("width")) ? inputErrCls : inputCls} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className={labelCls} htmlFor="reinf-width">Width (mm)</label>
                            <input id="reinf-width" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(Number(e.target.value))} className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls} htmlFor="reinf-len">Member Length (m)</label>
                            <input id="reinf-len" type="number" inputMode="decimal" value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} className={errors.some((x) => x.includes("length")) ? inputErrCls : inputCls} />
                          </div>
                        </>
                      )}
                      <div>
                        <label className={labelCls} htmlFor="reinf-depth">{type === "Slab" ? "Slab Thickness (mm)" : "Depth (mm)"}</label>
                        <input id="reinf-depth" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="reinf-cover"><span className="flex items-center">Clear Cover (mm) <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span></label>
                        <input id="reinf-cover" type="number" inputMode="decimal" value={cover} onChange={(e) => setCover(Number(e.target.value))} className={inputCls} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={loadBeamExample} className="px-4 py-2 bg-accent-50 text-accent-800 rounded-full text-sm font-semibold">Load Beam Example</Button>
                      <Button onClick={loadSlabExample} className="px-4 py-2 bg-accent-50 text-accent-800 rounded-full text-sm font-semibold">Load Slab Example</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary p-4 sm:p-6 overflow-hidden">
                  <h3 className="text-lg font-bold text-txt-primary mb-4">Reinforcement</h3>
                  <div className="space-y-4">
                    {type !== "Slab" && (
                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-ui-borderSubtle">
                        <div>
                          <label className={labelCls} htmlFor="reinf-topn">Top Bars Count</label>
                          <input id="reinf-topn" type="number" inputMode="decimal" value={topBarsCount} onChange={(e) => setTopBarsCount(Number(e.target.value))} className={inputCls} min={2} />
                        </div>
                        <div>
                          <label className={labelCls} htmlFor="reinf-topd">Top Bar Dia (mm)</label>
                          <select id="reinf-topd" value={topBarsDia} onChange={(e) => setTopBarsDia(Number(e.target.value))} className={selectCls}>
                            {[8, 10, 12, 16, 20, 25, 32].map((d) => <option key={d} value={d}>{d} mm</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-ui-borderSubtle">
                      <div>
                        <label className={labelCls} htmlFor="reinf-botn">{type === "Slab" ? "Main Bars (grid — count is calculated)" : "Bottom Bars Count"}</label>
                        {type === "Slab" ? (
                          <input id="reinf-botn" type="text" value={results ? `${results.slabMainCount} bars @ ${mainSpacing} mm` : "—"} readOnly className={inputCls} />
                        ) : (
                          <input id="reinf-botn" type="number" inputMode="decimal" value={bottomBarsCount} onChange={(e) => setBottomBarsCount(Number(e.target.value))} className={inputCls} min={2} />
                        )}
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="reinf-botd">{type === "Slab" ? "Main Bar Dia (mm)" : "Bottom Bar Dia (mm)"}</label>
                        <select id="reinf-botd" value={bottomBarsDia} onChange={(e) => setBottomBarsDia(Number(e.target.value))} className={selectCls}>
                          {[8, 10, 12, 16, 20, 25, 32].map((d) => <option key={d} value={d}>{d} mm</option>)}
                        </select>
                      </div>
                    </div>
                    {type === "Slab" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls} htmlFor="reinf-mainsp">Main Spacing c/c (mm)</label>
                          <input id="reinf-mainsp" type="number" inputMode="decimal" value={mainSpacing} onChange={(e) => setMainSpacing(Number(e.target.value))} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls} htmlFor="reinf-distsp">Distribution Spacing c/c (mm)</label>
                          <input id="reinf-distsp" type="number" inputMode="decimal" value={distSpacing} onChange={(e) => setDistSpacing(Number(e.target.value))} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls} htmlFor="reinf-distd">Distribution Bar Dia (mm)</label>
                          <select id="reinf-distd" value={distDia} onChange={(e) => setDistDia(Number(e.target.value))} className={selectCls}>
                            {[8, 10, 12, 16].map((d) => <option key={d} value={d}>{d} mm</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls} htmlFor="reinf-stird">Stirrup Dia (mm)</label>
                          <select id="reinf-stird" value={stirrupDia} onChange={(e) => setStirrupDia(Number(e.target.value))} className={selectCls}>
                            {[8, 10, 12].map((d) => <option key={d} value={d}>{d} mm</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls} htmlFor="reinf-stirsp">Stirrup Spacing c/c (mm)</label>
                          <input id="reinf-stirsp" type="number" inputMode="decimal" value={stirrupSpacing} onChange={(e) => setStirrupSpacing(Number(e.target.value))} className={inputCls} />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls} htmlFor="reinf-grade">Steel Grade</label>
                        <select id="reinf-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={selectCls}>
                          {BAR_GRADES.map((g) => <option key={g.id} value={g.id}>{g.label} — {g.standard}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="reinf-conc">Concrete Grade</label>
                        <select id="reinf-conc" value={concreteGrade} onChange={(e) => setConcreteGrade(e.target.value)} className={selectCls}>
                          {["M15", "M20", "M25", "M30"].map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <p className="text-xs text-txt-secondary mt-1">Display only — the quantity maths does not use it.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls} htmlFor="reinf-wastage">Wastage %</label>
                        <input id="reinf-wastage" type="number" inputMode="decimal" value={wastage} onChange={(e) => setWastage(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="reinf-rate">Steel Rate / kg</label>
                        <input id="reinf-rate" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
                        <p className="text-xs text-txt-secondary mt-1">{STEEL_RATE_LABEL}.</p>
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="reinf-currency">Currency</label>
                        <select id="reinf-currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value as SteelCurrency)} className={selectCls}>
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {results && (
                    <>
                      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${results.coverPass ? "bg-ui-success border-ui-successBorder text-ui-successText" : "bg-ui-error border-ui-errorBorder text-ui-errorText"}`}>
                        {results.coverPass ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                        <div>
                          <h4 className="font-bold text-sm">Cover Compliance (IS 456)</h4>
                          <p className="text-xs mt-1 opacity-90">{results.coverMsg}</p>
                        </div>
                      </div>
                      {type !== "Slab" && (
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${results.spacingPass ? "bg-ui-success border-ui-successBorder text-ui-successText" : "bg-ui-error border-ui-errorBorder text-ui-errorText"}`}>
                          {results.spacingPass ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                          <div>
                            <h4 className="font-bold text-sm">Spacing Compliance</h4>
                            <p className="text-xs mt-1 opacity-90">{results.spacingMsg}</p>
                          </div>
                        </div>
                      )}
                      <div className="p-4 rounded-2xl border bg-accent-50 border-accent-100 text-txt-primary">
                        <h4 className="font-bold text-sm">Steel Ratio</h4>
                        <p className="text-xs mt-1 opacity-90">{results.rhoNote}</p>
                        <p className="text-xs mt-1 opacity-90">Quantities only — this tool does not design the member. Verify against engineer-approved drawings.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Visualisation + quantities */}
              <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-txt-primary px-2">
                    {type === "Slab" ? "Slab Grid Plan" : "Cross Section Preview"}
                  </h3>
                  <div className="flex gap-2 print:hidden">
                    <Button onClick={downloadSvg} className="px-3 py-1.5 bg-surface-default text-accent-800 text-sm font-bold border border-ui-borderSubtle rounded-full hover:bg-surface-hover transition flex items-center gap-2">
                      <FileImage className="w-4 h-4" /> SVG
                    </Button>
                    <Button onClick={handleDownloadPng} className="px-3 py-1.5 bg-ink text-white text-sm font-bold rounded-full hover:bg-ink-700 transition flex items-center gap-2 shadow-brand-sm">
                      <Download className="w-4 h-4" /> PNG
                    </Button>
                  </div>
                </div>

                <div className="flex-1 bg-surface-default border border-ui-borderSubtle rounded-2xl overflow-hidden relative min-h-[400px] flex items-center justify-center p-4">
                  <div className="absolute inset-0 pattern-grid-lg text-txt-inverse pointer-events-none" style={{ backgroundSize: "20px 20px", backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)" }} />
                  {type === "Slab" ? (
                    <SlabGridSvg lengthM={lengthM} widthM={slabWidthM} mainCount={results?.slabMainCount ?? 0} distCount={results?.slabDistCount ?? 0} mainDia={bottomBarsDia} distDia={distDia} />
                  ) : (
                    <svg ref={svgRef} viewBox={`0 0 ${vWidth} ${vHeight}`} className="max-w-full max-h-[600px] drop-shadow-md relative z-10" xmlns="http://www.w3.org/2000/svg" style={{ backgroundColor: "white" }}>
                      <defs>
                        <pattern id="concrete-hatch" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          <path d="M 0 0 L 0 40 M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40" stroke="#6B6862" strokeWidth="0.5" strokeDasharray="3 3" />
                        </pattern>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B6862" />
                        </marker>
                      </defs>
                      <rect x={startX} y={startY} width={svgWidthMm} height={depth} fill="#F4F2EE" stroke="#6B6862" strokeWidth="2" />
                      <rect x={startX} y={startY} width={svgWidthMm} height={depth} fill="url(#concrete-hatch)" />
                      <rect x={startX + cover} y={startY + cover} width={Math.max(10, svgWidthMm - 2 * cover)} height={Math.max(10, depth - 2 * cover)} fill="none" stroke="#F2A413" strokeWidth={stirrupDia} rx={stirrupDia * 1.5} />
                      <path d={`M ${startX + cover + stirrupDia * 1.5} ${startY + cover} L ${startX + cover + stirrupDia * 3 + 10} ${startY + cover + stirrupDia * 3 + 10} M ${startX + cover} ${startY + cover + stirrupDia * 1.5} L ${startX + cover + stirrupDia * 3 + 10} ${startY + cover + stirrupDia * 3 + 10}`} stroke="#F2A413" strokeWidth={stirrupDia} fill="none" />
                      {Array.from({ length: topBarsCount }).map((_, i) => {
                        const barSpacing = topBarsCount > 1 ? (svgWidthMm - 2 * cover - 2 * stirrupDia - topBarsDia) / (topBarsCount - 1) : 0;
                        const cx = startX + cover + stirrupDia + topBarsDia / 2 + i * barSpacing;
                        const cy = startY + cover + stirrupDia + topBarsDia / 2;
                        return <circle key={`t-${i}`} cx={cx} cy={cy} r={topBarsDia / 2} fill="#F2A413" stroke="#855307" strokeWidth="1" />;
                      })}
                      {Array.from({ length: bottomBarsCount }).map((_, i) => {
                        const actualWidthForBars = svgWidthMm - 2 * cover - 2 * stirrupDia;
                        const barSpacing = bottomBarsCount > 1 ? (actualWidthForBars - bottomBarsDia) / (bottomBarsCount - 1) : 0;
                        const cx = startX + cover + stirrupDia + bottomBarsDia / 2 + i * barSpacing;
                        const cy = startY + depth - cover - stirrupDia - bottomBarsDia / 2;
                        return <circle key={`b-${i}`} cx={cx} cy={cy} r={bottomBarsDia / 2} fill="#F2A413" stroke="#855307" strokeWidth="1" />;
                      })}
                      <line x1={startX} y1={startY - 30} x2={startX + svgWidthMm} y2={startY - 30} stroke="#6B6862" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                      <text x={startX + svgWidthMm / 2} y={startY - 38} textAnchor="middle" fill="#1F1D1A" fontSize="14" fontWeight="bold" fontFamily="sans-serif">{svgWidthMm} mm</text>
                      <line x1={startX + svgWidthMm + 30} y1={startY} x2={startX + svgWidthMm + 30} y2={startY + depth} stroke="#6B6862" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                      <text x={startX + svgWidthMm + 38} y={startY + depth / 2} dominantBaseline="middle" fill="#1F1D1A" fontSize="14" fontWeight="bold" fontFamily="sans-serif">{depth} mm</text>
                      <line x1={startX - 30} y1={startY + depth - cover} x2={startX - 30} y2={startY + depth} stroke="#F2A413" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                      <text x={startX - 38} y={startY + depth - cover / 2} dominantBaseline="middle" textAnchor="end" fill="#F2A413" fontSize="14" fontWeight="bold" fontFamily="sans-serif">C: {cover}</text>
                      <text x="20" y="30" fill="#1F1D1A" fontSize="16" fontWeight="bold" fontFamily="sans-serif">{type} Cross Section</text>
                      <text x="20" y="55" fill="#6B6862" fontSize="12" fontFamily="sans-serif">Main Bottom: {bottomBarsCount} - Ø{bottomBarsDia}</text>
                      <text x="20" y="75" fill="#6B6862" fontSize="12" fontFamily="sans-serif">Main Top: {topBarsCount} - Ø{topBarsDia}</text>
                      <text x="20" y="95" fill="#6B6862" fontSize="12" fontFamily="sans-serif">Stirrups: Ø{stirrupDia} @ {stirrupSpacing} c/c</text>
                      {results && (
                        <text x="20" y="115" fill="#6B6862" fontSize="12" fontFamily="sans-serif">
                          Effective depth d = {results.effectiveDepthMm} mm · Stirrup {results.stirrupLengthSimpleMm} mm
                        </text>
                      )}
                    </svg>
                  )}
                </div>

                {results && (
                  <div className="mt-6 bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 sm:p-6 shadow-brand-sm overflow-hidden">
                    <h3 className="font-bold text-lg mb-3">Steel Quantities</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-surface-hover rounded-2xl p-3"><p className="text-txt-secondary">Effective depth d</p><p className="font-bold text-base">{results.effectiveDepthMm} mm</p></div>
                      <div className="bg-surface-hover rounded-2xl p-3"><p className="text-txt-secondary">Steel area (bottom / main)</p><p className="font-bold text-base">{results.asBottomMm2} mm²{results.rhoBottomPct != null ? ` · ρ ${results.rhoBottomPct.toFixed(2)}%` : ""}</p></div>
                      {type !== "Slab" && (
                        <>
                          <div className="bg-surface-hover rounded-2xl p-3"><p className="text-txt-secondary">Stirrups</p><p className="font-bold text-base">{results.stirrupCount} × {(results.stirrupLengthSimpleMm! / 1000).toFixed(3)} m = {results.stirrupTotalLengthM?.toFixed(2)} m</p></div>
                          <div className="bg-surface-hover rounded-2xl p-3"><p className="text-txt-secondary">Stirrup weight</p><p className="font-bold text-base">{results.stirrupWeightKg?.toFixed(2)} kg</p></div>
                        </>
                      )}
                      {type === "Slab" && (
                        <>
                          <div className="bg-surface-hover rounded-2xl p-3"><p className="text-txt-secondary">Grid</p><p className="font-bold text-base">{results.slabGridLengthM?.toFixed(2)} × {results.slabGridWidthM?.toFixed(2)} m</p></div>
                          <div className="bg-surface-hover rounded-2xl p-3"><p className="text-txt-secondary">Bars</p><p className="font-bold text-base">{results.slabMainCount} main · {results.slabDistCount} dist.</p></div>
                        </>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-ui-borderSubtle">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                          <tr><th className="px-4 py-2">Layer</th><th className="px-4 py-2 text-center">Bars</th><th className="px-4 py-2">Dia</th><th className="px-4 py-2 text-right">Bar L (m)</th><th className="px-4 py-2 text-right">Total L (m)</th><th className="px-4 py-2 text-right">kg</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                          {results.layers.map((l) => (
                            <tr key={l.label}>
                              <td className="px-4 py-2 font-medium">{l.label}</td>
                              <td className="px-4 py-2 text-center">{l.count}</td>
                              <td className="px-4 py-2">Ø{l.diaMm}</td>
                              <td className="px-4 py-2 text-right">{l.barLengthM.toFixed(3)}</td>
                              <td className="px-4 py-2 text-right">{l.totalLengthM.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right font-bold text-accent-800">{l.weightKg.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-surface-hover rounded-2xl p-4"><p className="text-txt-secondary">Net steel</p><p className="font-bold text-lg">{results.totalNetKg.toFixed(2)} kg</p></div>
                      <div className="bg-surface-hover rounded-2xl p-4"><p className="text-txt-secondary">To order (+{wastage}%)</p><p className="font-bold text-lg">{results.orderWeightKg.toFixed(2)} kg · {results.tonnes.toFixed(3)} t</p></div>
                      <div className="bg-accent-50 rounded-2xl p-4 col-span-2"><p className="text-txt-secondary">Cost</p><p className="font-bold text-lg">{results.cost == null ? "— (enter a steel rate)" : formatSteelMoney(results.cost, currency)}</p></div>
                    </div>
                    {results.slabRemainderWarn && <p className="text-sm text-txt-secondary mt-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-accent-800" />{results.slabRemainderWarn}</p>}
                    <details className="mt-4 text-sm text-txt-secondary">
                      <summary className="cursor-pointer font-medium text-accent-800">How it was calculated</summary>
                      <p className="mt-2">{results.formula}</p>
                      {type !== "Slab" && <p className="mt-2">Stirrup length uses the field rule 2(A+B)+24φ = {results.stirrupLengthSimpleMm} mm for the take-off; the IS 2502 detailed form gives {results.stirrupLengthDetailedMm} mm (about 10% lower, because it deducts bend shortening). Both are shown so the difference is never hidden.</p>}
                    </details>
                    <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                      <Button onClick={copyResults} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><Copy className="w-4 h-4" /> Copy results</Button>
                      <Button onClick={downloadPdf} className="px-4 py-2 bg-ink text-white rounded-full text-sm font-semibold"><Download className="w-4 h-4" /> PDF</Button>
                      <Button onClick={() => window.dispatchEvent(new CustomEvent("global-print-action"))} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><Printer className="w-4 h-4" /> Print</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </MaterialSummary>

          {/* Formula + FAQ — live here in the module (no CalculatorPageShell page is wired for this tool) */}
          <section aria-labelledby="reinf-formula-heading" className="mt-12 bg-surface-default border border-border-color rounded-2xl p-6 md:p-8 shadow-brand-sm print:hidden">
            <h2 id="reinf-formula-heading" className="text-2xl font-bold text-txt-primary mb-4">How the quantities are calculated</h2>
            <p className="text-txt-secondary leading-relaxed">
              Effective depth d = D − (cover + φ/2). For a 450 mm beam with 25 mm cover and Ø20 bottom
              bars, d = 415 mm. Steel area As = n × π × φ²/4 — 3 × Ø20 gives 942 mm², a steel ratio of
              0.76% for a 300 mm wide beam. Stirrups are counted as N = ⌊L/S⌋ + 1 (21 for a 3 m beam at
              150 mm), each 1.492 m long by the field rule 2(A+B)+24φ, giving 31.33 m and about 12.34 kg;
              the IS 2502 detailed length (1.364 m) is shown alongside. Slab steel is a grid:
              bars = ⌊grid ÷ spacing⌋ + 1 in each direction. Quantities only — this tool does not
              design the member.
            </p>
          </section>

          <CalculationHistory
            calculatorId="reinforcementvisualizer"
            currentInputs={{}}
            currentResults={results ? { totalKg: results.totalNetKg } : {}}
            estimationName="Reinforcement Visualizer"
          />
        </>
      )}
    </div>
  );
}

function SlabGridSvg({ lengthM, widthM, mainCount, distCount, mainDia, distDia }: { lengthM: number; widthM: number; mainCount: number; distCount: number; mainDia: number; distDia: number }) {
  const W = 460;
  const H = 340;
  const pad = 40;
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  const nMain = Math.max(0, Math.min(mainCount, 30));
  const nDist = Math.max(0, Math.min(distCount, 30));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="max-w-full max-h-[600px] relative z-10" style={{ backgroundColor: "white" }} role="img" aria-label="Slab reinforcement grid plan">
      <rect x={pad} y={pad} width={iw} height={ih} fill="#F4F2EE" stroke="#6B6862" strokeWidth="2" />
      {Array.from({ length: nMain }).map((_, i) => {
        const x = nMain === 1 ? pad + iw / 2 : pad + (iw * i) / (nMain - 1);
        return <line key={`m-${i}`} x1={x} y1={pad} x2={x} y2={pad + ih} stroke="#F2A413" strokeWidth={Math.max(1.5, mainDia / 6)} />;
      })}
      {Array.from({ length: nDist }).map((_, i) => {
        const y = nDist === 1 ? pad + ih / 2 : pad + (ih * i) / (nDist - 1);
        return <line key={`d-${i}`} x1={pad} y1={y} x2={pad + iw} y2={y} stroke="#0D0C22" strokeWidth={Math.max(1, distDia / 6)} opacity="0.7" />;
      })}
      <text x={pad + iw / 2} y={pad - 10} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1F1D1A">{lengthM} m</text>
      <text x={pad - 8} y={pad + ih / 2} textAnchor="end" fontSize="13" fontWeight="bold" fill="#1F1D1A" transform={`rotate(-90 ${pad - 8} ${pad + ih / 2})`}>{widthM} m</text>
      <text x={pad} y={H - 8} fontSize="12" fill="#6B6862">Main Ø{mainDia} (vertical) · Distribution Ø{distDia} (horizontal) — {nMain} × {nDist} bars</text>
    </svg>
  );
}
