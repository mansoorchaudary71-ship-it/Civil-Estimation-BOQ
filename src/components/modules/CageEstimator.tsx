import React, { useMemo, useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { Button } from "../ui/Button";
import { Calculator, Copy, Download, RotateCw, CheckCircle, AlertTriangle, Printer } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { CodeTooltip } from "../ui/CodeTooltip";
import { useAutoSave } from "../../hooks/useAutoSave";
import {
  calcCage,
  defaultCageInputs,
  validateCage,
  suggestedStiffenerCount,
  CAGE_FAQS,
  type CageInputs,
  type CageType,
} from "../../lib/cageCalc";
import {
  BAR_GRADES,
  STEEL_RATE_DEFAULTS,
  STEEL_RATE_LABEL,
  formatSteelMoney,
  type SteelCurrency,
} from "../../lib/steelCalc";
import { exportBOQToPDF } from "../../lib/pdfExport";
import { GlobalFAQ } from "../ui/GlobalFAQ";

const inputCls =
  "w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-full font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none transition-all";
const inputErrCls =
  "w-full mt-1 bg-surface-hover border border-ui-errorBorder p-3 rounded-full font-bold focus:ring-2 focus:ring-ui-errorText focus:outline-none transition-all";
const selectCls =
  "w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-2xl font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none transition-all";
const labelCls = "uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block";
const errTextCls = "text-sm text-ui-errorText mt-1";

const CURRENCIES: SteelCurrency[] = ["PKR", "INR", "AED", "USD"];

export default function CageEstimator() {
  const d = defaultCageInputs();
  const [cageType, setCageType] = useState<CageType>(d.cageType);
  const [piles, setPiles] = useState(String(d.piles));
  const [mainCount, setMainCount] = useState(String(d.mainCount));
  const [mainDia, setMainDia] = useState(String(d.mainDiaMm));
  const [anchorage, setAnchorage] = useState(String(d.anchorageMm));
  const [lapX, setLapX] = useState(String(d.lapX));
  const [pileDia, setPileDia] = useState(String(d.pileDiaMm));
  const [cageLength, setCageLength] = useState(String(d.cageLengthM));
  const [lengthUnit, setLengthUnit] = useState<"m" | "ft">("m");
  const [cover, setCover] = useState(String(d.coverMm));
  const [spiralDia, setSpiralDia] = useState(String(d.spiralDiaMm));
  const [pitch, setPitch] = useState(String(d.pitchMm));
  const [spiralLapX, setSpiralLapX] = useState(String(d.spiralLapX));
  const [stiffenerCount, setStiffenerCount] = useState(String(d.stiffenerCount));
  const [stiffenerDia, setStiffenerDia] = useState(String(d.stiffenerDiaMm));
  const [grade, setGrade] = useState("grade60");
  const [wastage, setWastage] = useState(String(d.wastagePct));
  // Currency defaults to the global setting; the picker still lets the user
  // override it per tool. The 270/kg default is a PKR steel rate, so it is
  // only prefilled when the starting currency is PKR.
  const { settings } = useSettings();
  const initialCurrency: SteelCurrency = (["PKR", "INR", "AED", "USD"] as string[]).includes(settings.currency) ? (settings.currency as SteelCurrency) : "PKR";
  const [rate, setRate] = useState(initialCurrency === "PKR" ? "270" : "");
  const [currency, setCurrency] = useState<SteelCurrency>(initialCurrency);
  const [notice, setNotice] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useAutoSave(
    "cage_estimator_v2",
    { cageType, piles, mainCount, mainDia, anchorage, lapX, pileDia, cageLength, lengthUnit, cover, spiralDia, pitch, spiralLapX, stiffenerCount, stiffenerDia, grade, wastage, rate, currency },
    {
      cageType: (v) => setCageType(v as CageType), piles: setPiles, mainCount: setMainCount, mainDia: setMainDia,
      anchorage: setAnchorage, lapX: setLapX, pileDia: setPileDia, cageLength: setCageLength,
      lengthUnit: (v) => setLengthUnit(v as "m" | "ft"), cover: setCover, spiralDia: setSpiralDia,
      pitch: setPitch, spiralLapX: setSpiralLapX, stiffenerCount: setStiffenerCount, stiffenerDia: setStiffenerDia,
      grade: setGrade, wastage: setWastage, rate: setRate, currency: (v) => setCurrency(v as SteelCurrency),
    },
  );

  const inputs: CageInputs = {
    cageType,
    piles: Number(piles),
    mainCount: Number(mainCount),
    mainDiaMm: Number(mainDia),
    anchorageMm: Number(anchorage),
    lapX: Number(lapX) || 0,
    pileDiaMm: Number(pileDia),
    cageLengthM: Number(cageLength),
    lengthUnit,
    coverMm: Number(cover),
    spiralDiaMm: Number(spiralDia),
    pitchMm: Number(pitch),
    spiralLapX: Number(spiralLapX) || 0,
    stiffenerCount: Number(stiffenerCount) || 0,
    stiffenerDiaMm: Number(stiffenerDia),
    wastagePct: Number(wastage) || 0,
    ratePerKg: rate.trim() === "" ? null : Number(rate),
  };

  const errors = useMemo(() => validateCage(inputs), [cageType, piles, mainCount, mainDia, anchorage, lapX, pileDia, cageLength, lengthUnit, cover, spiralDia, pitch, spiralLapX, stiffenerCount, stiffenerDia, wastage, rate]);
  const results = errors.length === 0 ? calcCage(inputs) : null;
  const suggestedRings = suggestedStiffenerCount(inputs.cageLengthM);
  const rateNum = inputs.ratePerKg;

  const onCurrencyChange = (c: SteelCurrency) => {
    setCurrency(c);
    const v = STEEL_RATE_DEFAULTS[c].perKg;
    setRate(v == null ? "" : String(v));
  };

  const summaryText = () => {
    if (!results) return "Pile cage — fix the errors above to see quantities.";
    const rows = results.components.map((c) => `${c.label}: ${c.count} × Ø${c.diaMm}, ${c.totalLengthM.toFixed(2)} m, ${c.weightKg.toFixed(2)} kg`).join("\n");
    return [
      `Pile cage — Ø${inputs.pileDiaMm} mm × ${inputs.cageLengthM} ${inputs.lengthUnit}, ${inputs.piles} pile(s), ${cageType === "spiral" ? "continuous spiral" : "circular hoops"}`,
      rows,
      `Concrete per pile: ${results.concreteVolumeM3.toFixed(2)} m³`,
      `Per pile: ${results.netKgPerPile.toFixed(2)} kg net, ${results.orderKgPerPile.toFixed(2)} kg with ${inputs.wastagePct}% wastage`,
      `Project: ${results.netKgTotal.toFixed(2)} kg net, ${results.orderKgTotal.toFixed(2)} kg to order (${results.tonnesTotal.toFixed(3)} t)`,
      `Cost: ${results.costTotal == null ? "— (enter a steel rate)" : formatSteelMoney(results.costTotal, currency)}`,
    ].join("\n");
  };

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setNotice("Results copied — paste them into your BOQ or notes.");
    } catch {
      setNotice("Copy failed — your browser blocked clipboard access.");
    }
  };

  const downloadCsv = () => {
    if (!results) return;
    const head = "Component,Dia (mm),Count,Cut length (m),Total length (m),Weight (kg)";
    const lines = results.components.map((c) => `${c.label},${c.diaMm},${c.count},${c.cutLengthM.toFixed(3)},${c.totalLengthM.toFixed(2)},${c.weightKg.toFixed(2)}`);
    lines.push(`Per pile net (kg),,,,${results.netKgPerPile.toFixed(2)}`);
    lines.push(`Project net (kg),,,,${results.netKgTotal.toFixed(2)}`);
    lines.push(`Project to order +${inputs.wastagePct}% (kg),,,,${results.orderKgTotal.toFixed(2)}`);
    const blob = new Blob([[head, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pile-cage-quantities.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice("CSV downloaded.");
  };

  const downloadPdf = () => {
    if (!results) return;
    exportBOQToPDF({
      projectName: "Pile Cage Quantities",
      date: new Date().toLocaleDateString("en-GB"),
      items: [
        ...results.components.map((c) => ({
          description: `${c.label} — ${c.count} × Ø${c.diaMm} mm`,
          quantity: c.weightKg,
          unit: "kg",
          rate: rateNum ?? 0,
          amount: rateNum == null ? 0 : c.weightKg * rateNum,
        })),
        {
          description: `Pile concrete — Ø${inputs.pileDiaMm} mm × ${inputs.cageLengthM} ${inputs.lengthUnit} × ${inputs.piles} pile(s)`,
          quantity: results.concreteVolumeM3 * inputs.piles,
          unit: "m3",
          rate: 0,
          amount: 0,
        },
      ],
      totalAmount: results.costTotal ?? 0,
    });
    setNotice("PDF downloaded.");
  };

  const loadExample = () => {
    const ex = defaultCageInputs();
    setCageType(ex.cageType);
    setPiles(String(ex.piles));
    setMainCount(String(ex.mainCount));
    setMainDia(String(ex.mainDiaMm));
    setAnchorage(String(ex.anchorageMm));
    setLapX(String(ex.lapX));
    setPileDia(String(ex.pileDiaMm));
    setCageLength(String(ex.cageLengthM));
    setLengthUnit(ex.lengthUnit);
    setCover(String(ex.coverMm));
    setSpiralDia(String(ex.spiralDiaMm));
    setPitch(String(ex.pitchMm));
    setSpiralLapX(String(ex.spiralLapX));
    setStiffenerCount(String(ex.stiffenerCount));
    setStiffenerDia(String(ex.stiffenerDiaMm));
    setWastage(String(ex.wastagePct));
    setRate("270");
    setCurrency("PKR");
    setTouched(false);
    setNotice("Worked example loaded: Ø600 pile, 10 m, 8×Ø16 main, Ø8 spiral @150 — 10 piles.");
  };

  const fieldErr = (test: (e: string) => boolean) => (touched ? errors.find(test) : undefined);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="tabular-nums flex items-center gap-2 mb-2 text-xl font-semibold text-txt-primary tracking-tight">
          <RotateCw className="w-6 h-6 text-accent-800" />
          Cage / Spiral Estimator
        </h2>
        <p className="text-base font-normal text-txt-secondary leading-relaxed">
          Work out a bored pile or column cage in full: longitudinal bars, helical spiral or
          circular rings, laps, stiffener rings, concrete volume and cost — per pile and for the
          whole project. Dia, cover and pitch stay in mm — only the cage length can be entered
          in feet.
        </p>
      </div>

      {notice && (
        <div className="flex items-start gap-2 bg-ui-success border border-ui-successBorder text-ui-successText rounded-2xl px-4 py-3 mb-6">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{notice}</p>
        </div>
      )}
      {touched && errors.length > 0 && (
        <div className="bg-ui-error border border-ui-errorBorder text-ui-errorText rounded-2xl px-4 py-3 mb-6">
          <p className="font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Fix these before the quantities can be shown:</p>
          <ul className="list-disc ml-5 mt-1 text-sm">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
        <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-medium text-txt-primary">
            <Calculator className="w-5 h-5 text-accent-800" />
            Cage Parameters
          </h3>
          <div className="space-y-4" onBlur={() => setTouched(true)}>
            <div className="flex bg-surface-hover p-1 rounded-2xl w-full overflow-hidden">
              <Button onClick={() => setCageType("spiral")} className={`flex-1 py-3 rounded-2xl text-base font-medium transition-all ${cageType === "spiral" ? "bg-surface-default text-accent-800 shadow-brand-sm" : "text-txt-tertiary hover:text-txt-secondary"}`}>
                Continuous Spiral
              </Button>
              <Button onClick={() => setCageType("hoop")} className={`flex-1 py-3 rounded-2xl text-base font-medium transition-all ${cageType === "hoop" ? "bg-surface-default text-accent-800 shadow-brand-sm" : "text-txt-tertiary hover:text-txt-secondary"}`}>
                Circular Hoops / Rings
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-dia"><span className="flex items-center gap-1">Pile/Col Diameter (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span></label>
                <input id="cage-dia" type="number" inputMode="decimal" value={pileDia} onChange={(e) => setPileDia(e.target.value)} className={fieldErr((e) => e.includes("dia must be") || e.includes("exceeds the pile")) ? inputErrCls : inputCls} />
                {fieldErr((e) => e.includes("dia must be") || e.includes("exceeds the pile")) && <p className={errTextCls}>{fieldErr((e) => e.includes("dia must be") || e.includes("exceeds the pile"))}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-len">Length ({lengthUnit})</label>
                <div className="flex gap-2">
                  <input id="cage-len" type="number" inputMode="decimal" value={cageLength} onChange={(e) => setCageLength(e.target.value)} className={fieldErr((e) => e.includes("Cage length")) ? inputErrCls : inputCls} />
                  <select aria-label="Length unit" value={lengthUnit} onChange={(e) => setLengthUnit(e.target.value as "m" | "ft")} className="mt-1 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-3 font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none">
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
                {fieldErr((e) => e.includes("Cage length")) && <p className={errTextCls}>{fieldErr((e) => e.includes("Cage length"))}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-cover"><span className="flex items-center gap-1">Clear Cover (mm) <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span></label>
                <input id="cage-cover" type="number" inputMode="decimal" value={cover} onChange={(e) => setCover(e.target.value)} className={fieldErr((e) => e.includes("cover")) ? inputErrCls : inputCls} />
                <p className="text-xs text-txt-secondary mt-1">75 mm for bored piles against soil, 50 mm for columns.</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-piles">No. of Piles</label>
                <input id="cage-piles" type="number" inputMode="decimal" value={piles} onChange={(e) => setPiles(e.target.value)} className={fieldErr((e) => e.includes("piles")) ? inputErrCls : inputCls} />
                {fieldErr((e) => e.includes("piles")) && <p className={errTextCls}>{fieldErr((e) => e.includes("piles"))}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-main-count">Main Bars</label>
                <input id="cage-main-count" type="number" inputMode="decimal" value={mainCount} onChange={(e) => setMainCount(e.target.value)} className={fieldErr((e) => e.includes("Main bars")) ? inputErrCls : inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-main-dia">Main Dia (mm)</label>
                <select id="cage-main-dia" value={mainDia} onChange={(e) => setMainDia(e.target.value)} className={selectCls}>
                  {[10, 12, 16, 20, 25, 28, 32].map((d) => <option key={d} value={d}>Ø{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-anch">Anchorage (mm)</label>
                <input id="cage-anch" type="number" inputMode="decimal" value={anchorage} onChange={(e) => setAnchorage(e.target.value)} className={inputCls} />
              </div>
            </div>
            {fieldErr((e) => e.includes("Main bars") || e.includes("at least as large")) && <p className={errTextCls}>{fieldErr((e) => e.includes("Main bars") || e.includes("at least as large"))}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-lapx">Main Lap (× dia)</label>
                <input id="cage-lapx" type="number" inputMode="decimal" value={lapX} onChange={(e) => setLapX(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-grade">Bar Grade</label>
                <select id="cage-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={selectCls}>
                  {BAR_GRADES.map((g) => <option key={g.id} value={g.id}>{g.label} — {g.standard}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-spiral-dia">Spiral Dia (mm)</label>
                <select id="cage-spiral-dia" value={spiralDia} onChange={(e) => setSpiralDia(e.target.value)} className={selectCls}>
                  {[6, 8, 10, 12, 16].map((d) => <option key={d} value={d}>Ø{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-pitch"><span className="flex items-center gap-1">Pitch (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span></label>
                <input id="cage-pitch" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} className={fieldErr((e) => e.includes("Pitch")) ? inputErrCls : inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-spiral-lap">Spiral Lap (× dia)</label>
                <input id="cage-spiral-lap" type="number" inputMode="decimal" value={spiralLapX} onChange={(e) => setSpiralLapX(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-rings">Stiffener Rings</label>
                <input id="cage-rings" type="number" inputMode="decimal" value={stiffenerCount} onChange={(e) => setStiffenerCount(e.target.value)} className={inputCls} />
                <p className="text-xs text-txt-secondary mt-1">0 = none. Typically {suggestedRings} rings (one every ~1.5 m).</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-ring-dia">Ring Dia (mm)</label>
                <select id="cage-ring-dia" value={stiffenerDia} onChange={(e) => setStiffenerDia(e.target.value)} className={selectCls}>
                  {[10, 12, 16].map((d) => <option key={d} value={d}>Ø{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="cage-wastage">Wastage %</label>
                <input id="cage-wastage" type="number" inputMode="decimal" value={wastage} onChange={(e) => setWastage(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-rate">Steel Rate / kg</label>
                <input id="cage-rate" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
                <p className="text-xs text-txt-secondary mt-1">{STEEL_RATE_LABEL}.</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="cage-currency">Currency</label>
                <select id="cage-currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value as SteelCurrency)} className={selectCls}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={loadExample} className="px-4 py-2.5 bg-accent-50 text-accent-800 rounded-full text-base font-semibold">Load Example</Button>
              <Button onClick={() => window.dispatchEvent(new CustomEvent("global-print-action"))} className="px-4 py-2.5 bg-ink text-white rounded-full text-base font-semibold"><Printer className="w-4 h-4" /> Print</Button>
            </div>
          </div>
        </div>

        <div className="bg-surface-hover space-y-6">
          <div className="bg-ink rounded-2xl p-4 sm:p-6 text-white shadow-brand-lg relative overflow-hidden">
            <h3 className="text-accent-100 uppercase relative z-10 text-lg font-medium mb-4">Total Steel — Project</h3>
            <div className="flex items-end gap-2 relative z-10">
              <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight">{results ? results.orderKgTotal.toFixed(1) : "—"}</span>
              <span className="text-xl text-white/80 mb-1 font-bold">kg to order</span>
            </div>
            <p className="relative z-10 text-sm text-white/80 mt-2">
              {results ? `${results.netKgTotal.toFixed(1)} kg net · ${results.netKgPerPile.toFixed(2)} kg per pile · ${results.tonnesTotal.toFixed(3)} tonnes · ${results.costTotal == null ? "cost — (enter a steel rate)" : formatSteelMoney(results.costTotal, currency)}` : "Enter valid cage details to see quantities — never 0.00 kg on an error."}
            </p>
          </div>

          {results && (
            <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
              <h3 className="tabular-nums uppercase mb-4 text-lg font-medium text-txt-primary">Detailed Breakdown — Per Pile</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-txt-secondary font-medium">Core / Mean Dia</span>
                  <span className="font-bold text-txt-primary">{results.coreDiaMm} mm</span>
                </div>
                {results.turns != null && (
                  <>
                    <div className="flex justify-between items-center border-b border-border-color pb-3">
                      <span className="text-txt-secondary font-medium">Loop Length</span>
                      <span className="font-bold text-txt-primary">{results.turnLengthM?.toFixed(3)} m</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-color pb-3">
                      <span className="text-txt-secondary font-medium">No. of Turns</span>
                      <span className="font-bold text-txt-primary">{results.turns} nos</span>
                    </div>
                  </>
                )}
                {results.hoopCount != null && (
                  <>
                    <div className="flex justify-between items-center border-b border-border-color pb-3">
                      <span className="text-txt-secondary font-medium">Ring Length</span>
                      <span className="font-bold text-txt-primary">{results.ringLengthM?.toFixed(3)} m</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-color pb-3">
                      <span className="text-txt-secondary font-medium">No. of Rings</span>
                      <span className="font-bold text-txt-primary">{results.hoopCount} nos</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-txt-secondary font-medium">Lap Allowance</span>
                  <span className="font-bold text-txt-primary">{results.spiralLapLengthM.toFixed(2)} m (×{results.spiralLaps})</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-txt-secondary font-medium">Spiral / Hoop Length</span>
                  <span className="font-bold text-txt-primary">{results.spiralLengthM.toFixed(2)} m — {results.spiralWeightKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-txt-secondary font-medium">Main Bars</span>
                  <span className="font-bold text-txt-primary">{inputs.mainCount} × Ø{inputs.mainDiaMm} × {results.mainBarLengthM.toFixed(3)} m = {results.mainTotalLengthM.toFixed(2)} m — {results.mainWeightKg.toFixed(2)} kg</span>
                </div>
                {results.stiffenerWeightKg > 0 && (
                  <div className="flex justify-between items-center border-b border-border-color pb-3">
                    <span className="text-txt-secondary font-medium">Stiffener Rings</span>
                    <span className="font-bold text-txt-primary">{inputs.stiffenerCount} × Ø{inputs.stiffenerDiaMm} — {results.stiffenerWeightKg.toFixed(2)} kg</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <span className="text-txt-secondary font-medium">Concrete per Pile</span>
                  <span className="font-bold text-txt-primary">{results.concreteVolumeM3.toFixed(2)} m³ (wet volume as placed)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-txt-secondary font-medium">Bars to Order (per pile)</span>
                  <span className="font-bold text-txt-primary">{results.barsToOrder} × 12 m bars</span>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-ui-borderSubtle">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                    <tr><th className="px-4 py-2">Component</th><th className="px-4 py-2">Dia</th><th className="px-4 py-2 text-center">Count</th><th className="px-4 py-2 text-right">Cut L (m)</th><th className="px-4 py-2 text-right">Total L (m)</th><th className="px-4 py-2 text-right">kg</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {results.components.map((c) => (
                      <tr key={c.label}>
                        <td className="px-4 py-2 font-medium">{c.label}</td>
                        <td className="px-4 py-2">Ø{c.diaMm}</td>
                        <td className="px-4 py-2 text-center">{c.count}</td>
                        <td className="px-4 py-2 text-right">{c.cutLengthM.toFixed(3)}</td>
                        <td className="px-4 py-2 text-right">{c.totalLengthM.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-bold text-accent-800">{c.weightKg.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <details className="mt-4 text-sm text-txt-secondary">
                <summary className="cursor-pointer font-medium text-accent-800">How it was calculated</summary>
                <p className="mt-2">{results.formula}</p>
                <p className="mt-2">The spiral and the BBS spiral shape use the same helix function, so they can never diverge: turns = ⌊length ÷ pitch⌋ + 1, one turn = √((π × core dia)² + pitch²). The cage adds 2 flat end turns (2π × core dia); a BBS spiral adds 2 × 10d hooks instead.</p>
              </details>

              {results.warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {results.warnings.map((w) => (
                    <p key={w} className="flex items-start gap-2 text-sm text-txt-secondary"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-accent-800" />{w}</p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={copyResults} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><Copy className="w-4 h-4" /> Copy results</Button>
                <Button onClick={downloadCsv} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><Download className="w-4 h-4" /> CSV</Button>
                <Button onClick={downloadPdf} disabled={!results} className="px-4 py-2 bg-ink text-white rounded-full text-sm font-semibold"><Download className="w-4 h-4" /> PDF</Button>
              </div>
            </div>
          )}

          <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
            <h3 className="text-lg font-medium text-txt-primary mb-3">Cage elevation (to scale)</h3>
            <CageSvg pileDiaMm={inputs.pileDiaMm} lengthM={inputs.lengthUnit === "ft" ? inputs.cageLengthM * 0.3048 : inputs.cageLengthM} coreDiaMm={results?.coreDiaMm ?? 0} turns={results?.turns ?? 0} mainCount={inputs.mainCount} />
            <p className="text-xs text-txt-secondary mt-2">Spiral shown schematically — one line per {inputs.pitchMm} mm pitch. Main bars run the full cage length.</p>
          </div>
        </div>
      </div>

      {/* Formula + FAQ — live here in the module (no CalculatorPageShell page is wired for this tool) */}
      <section aria-labelledby="cage-formula-heading" className="mt-12 bg-surface-default border border-border-color rounded-2xl p-6 md:p-8 shadow-brand-sm print:hidden">
        <h2 id="cage-formula-heading" className="text-2xl font-bold text-txt-primary mb-4">How spiral length is calculated</h2>
        <p className="text-txt-secondary leading-relaxed">
          One turn of the helix is √((π × core dia)² + pitch²), where the core dia is the pile dia
          minus twice the cover minus the spiral dia. Turns = ⌊length ÷ pitch⌋ + 1, plus two flat
          end turns (2π × core dia). For a Ø600 pile, 10 m long, cover 50, Ø8 spiral at 150 mm:
          core 492 mm, one turn 1.553 m, 67 turns → 107.14 m, plus 8 laps of 50d (3.20 m) = 110.34 m,
          about 43.5 kg. Main bars are L + anchorage − cover − 3d each: 8 × Ø16 at 10.452 m =
          131.95 kg. One pile is 175.46 kg; ten piles are 1,754.6 kg net, 1,842.3 kg with 5%
          wastage. The same helix function drives the BBS spiral shape, so the two can never diverge.
        </p>
      </section>
      <div className="mt-12 print:hidden">
        <GlobalFAQ faqs={CAGE_FAQS.map((f) => ({ question: f.q, answer: f.a }))} />
      </div>

      <CalculationHistory calculatorId="cageestimator_tool" currentInputs={{ cageType, piles, mainCount, mainDia, anchorage, lapX, pileDia, cageLength, lengthUnit, cover, spiralDia, pitch, spiralLapX, stiffenerCount, stiffenerDia, grade, wastage, rate, currency }} currentResults={results ? { weightKg: results.netKgTotal } : {}} estimationName="Pile Cage Estimator" onRestore={(ins) => {
        if (ins.cageType != null) setCageType(ins.cageType as typeof cageType);
        if (ins.piles != null) setPiles(ins.piles as typeof piles);
        if (ins.mainCount != null) setMainCount(ins.mainCount as typeof mainCount);
        if (ins.mainDia != null) setMainDia(ins.mainDia as typeof mainDia);
        if (ins.anchorage != null) setAnchorage(ins.anchorage as typeof anchorage);
        if (ins.lapX != null) setLapX(ins.lapX as typeof lapX);
        if (ins.pileDia != null) setPileDia(ins.pileDia as typeof pileDia);
        if (ins.cageLength != null) setCageLength(ins.cageLength as typeof cageLength);
        if (ins.lengthUnit != null) setLengthUnit(ins.lengthUnit as typeof lengthUnit);
        if (ins.cover != null) setCover(ins.cover as typeof cover);
        if (ins.spiralDia != null) setSpiralDia(ins.spiralDia as typeof spiralDia);
        if (ins.pitch != null) setPitch(ins.pitch as typeof pitch);
        if (ins.spiralLapX != null) setSpiralLapX(ins.spiralLapX as typeof spiralLapX);
        if (ins.stiffenerCount != null) setStiffenerCount(ins.stiffenerCount as typeof stiffenerCount);
        if (ins.stiffenerDia != null) setStiffenerDia(ins.stiffenerDia as typeof stiffenerDia);
        if (ins.grade != null) setGrade(ins.grade as typeof grade);
        if (ins.wastage != null) setWastage(ins.wastage as typeof wastage);
        if (ins.rate != null) setRate(ins.rate as typeof rate);
        if (typeof ins.currency === "string") setCurrency(ins.currency as typeof currency);
      }} />
    </div>
  );
}

function CageSvg({ pileDiaMm, lengthM, coreDiaMm, turns, mainCount }: { pileDiaMm: number; lengthM: number; coreDiaMm: number; turns: number; mainCount: number }) {
  const W = 220;
  const H = 300;
  const cx = W / 2;
  const top = 20;
  const bottom = H - 20;
  const halfW = 70;
  const shownTurns = Math.max(0, Math.min(turns, 40));
  const pts: string[] = [];
  for (let i = 0; i <= shownTurns * 2; i++) {
    const y = top + ((bottom - top) * i) / (shownTurns * 2 || 1);
    const x = cx + (i % 2 === 0 ? -halfW : halfW);
    pts.push(`${x},${y}`);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px] mx-auto" role="img" aria-label="Pile cage elevation">
      <rect x={cx - halfW - 14} y={top} width={(halfW + 14) * 2} height={bottom - top} fill="none" stroke="#6B6862" strokeWidth="1.5" strokeDasharray="5 4" />
      {Array.from({ length: mainCount }).map((_, i) => {
        const angle = (i / Math.max(1, mainCount)) * Math.PI * 2;
        const x = cx + Math.cos(angle) * halfW * 0.92;
        return <line key={i} x1={x} y1={top} x2={x} y2={bottom} stroke="#F2A413" strokeWidth="3" />;
      })}
      <polyline points={pts.join(" ")} fill="none" stroke="#0D0C22" strokeWidth="2" />
      <text x={cx} y={H - 4} textAnchor="middle" fontSize="11" fill="#6B6862">
        Ø{pileDiaMm} mm · {lengthM.toFixed(1)} m · core {coreDiaMm} mm
      </text>
    </svg>
  );
}
