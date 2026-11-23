/**
 * Concrete Mix Design calculator UI — thin UI over src/lib/mixDesignCalc.ts.
 * IS 10262:2019 (default) + ACI 211.1 toggle, one absolute-volume engine.
 *
 * Trial-batch disclaimer (mandatory, IS 10262 Cl 5.8 / IS 456 Cl 16):
 * design mixes must be confirmed by trial batches (three batches
 * >=0.5 m3, 7- and 28-day cubes). This calculator is a proportioning
 * aid, not a substitute for a licensed engineer's design.
 */
import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Calculator, Copy, Check, Share2, Printer, FileText, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { GenericExportButtons } from "../ui/GenericExportButtons";
import { useGlobalSettings } from "../../context/SettingsContext";
import {
  calcMixDesign,
  defaultMixDesignInputs,
  validateMixDesign,
  sdForGrade,
  DURABILITY,
  CEMENT_LABEL,
  type MixDesignInputs,
  type Exposure,
  type FaZone,
  type AggType,
  type CementType,
  type AciExposure,
} from "../../lib/mixDesignCalc";

const labelCls = "text-sm font-bold text-txt-secondary mb-1 block";
const inputCls =
  "w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-txt-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent-500";
const selectCls = inputCls;
const sectionCls = "bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 sm:p-6";
const num = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return isFinite(n) ? n : fallback;
};

const GRADES = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
const EXPOSURES: Exposure[] = ["Mild", "Moderate", "Severe", "Very severe", "Extreme"];
const ZONES: FaZone[] = ["I", "II", "III", "IV"];
const ACI_EXPOSURES: Array<{ id: AciExposure; label: string }> = [
  { id: "none", label: "None — strength governs" },
  { id: "F1", label: "F1 — moderate freezing (max w/c 0.45)" },
  { id: "F2", label: "F2 — severe freezing (max w/c 0.45)" },
  { id: "F3", label: "F3 — very severe freezing (max w/c 0.40)" },
  { id: "C1", label: "C1 — chloride exposure (max w/c 0.40)" },
  { id: "C2", label: "C2 — severe chloride (max w/c 0.40)" },
];

interface RateState {
  cementPerBag: string;
  faPerM3: string;
  caPerM3: string;
  waterPerL: string;
  admixturePerKg: string;
}

export default function MixDesignCalculator() {
  const { currentCurrency, formatCurrency, getCurrencySymbol } = useGlobalSettings();
  const symbol = getCurrencySymbol(currentCurrency);

  const [method, setMethod] = useState<"IS" | "ACI">("IS");
  const [fck, setFck] = useState("25");
  const [sdMode, setSdMode] = useState<"table" | "custom">("table");
  const [sdCustom, setSdCustom] = useState("4.0");
  const [exposure, setExposure] = useState<Exposure>("Moderate");
  const [aciExposure, setAciExposure] = useState<AciExposure>("none");
  const [maxAggMm, setMaxAggMm] = useState<"10" | "20" | "40">("20");
  const [aggType, setAggType] = useState<AggType>("angular");
  const [slumpMm, setSlumpMm] = useState("50");
  const [cementType, setCementType] = useState<CementType>("OPC53");
  const [sgCem, setSgCem] = useState("3.15");
  const [sgFA, setSgFA] = useState("2.65");
  const [sgCA, setSgCA] = useState("2.70");
  const [faZone, setFaZone] = useState<FaZone>("II");
  const [caOverride, setCaOverride] = useState("");
  const [fm, setFm] = useState("2.60");
  const [dryRodded, setDryRodded] = useState("1600");
  const [wcMode, setWcMode] = useState<"auto" | "manual">("auto");
  const [wcManual, setWcManual] = useState("0.50");
  const [pceReduction, setPceReduction] = useState("0");
  const [pceDose, setPceDose] = useState("0");
  const [moistureFA, setMoistureFA] = useState("0");
  const [moistureCA, setMoistureCA] = useState("0");
  const [batchVolume, setBatchVolume] = useState("1");
  const [airPct, setAirPct] = useState("1.5");
  const [pumped, setPumped] = useState(false);
  const [rates, setRates] = useState<RateState>({
    cementPerBag: "1200",
    faPerM3: "",
    caPerM3: "",
    waterPerL: "",
    admixturePerKg: "",
  });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const inputs: MixDesignInputs = useMemo(
    () => ({
      ...defaultMixDesignInputs(),
      method,
      fck: num(fck, 25),
      sdMode,
      sdCustom: num(sdCustom, 4),
      exposure,
      aciExposure,
      maxAggMm: num(maxAggMm, 20) as 10 | 20 | 40,
      aggType,
      slumpMm: num(slumpMm, 50),
      cementType,
      sgCem: num(sgCem, 3.15),
      sgFA: num(sgFA, 2.65),
      sgCA: num(sgCA, 2.7),
      faZone,
      caFractionOverride: caOverride.trim() === "" ? null : num(caOverride, 0.62),
      fm: num(fm, 2.6),
      dryRoddedKgM3: num(dryRodded, 1600),
      wcMode,
      wcManual: num(wcManual, 0.5),
      pceReductionPct: num(pceReduction, 0),
      pceDosePct: num(pceDose, 0),
      moistureFA: num(moistureFA, 0) / 100,
      moistureCA: num(moistureCA, 0) / 100,
      batchVolumeM3: num(batchVolume, 1),
      airPct: num(airPct, 1.5),
      pumped,
    }),
    [method, fck, sdMode, sdCustom, exposure, aciExposure, maxAggMm, aggType, slumpMm, cementType, sgCem, sgFA, sgCA, faZone, caOverride, fm, dryRodded, wcMode, wcManual, pceReduction, pceDose, moistureFA, moistureCA, batchVolume, airPct, pumped],
  );

  const validationErrors = useMemo(() => validateMixDesign(inputs), [inputs]);
  const result = useMemo(() => calcMixDesign(inputs), [inputs]);

  const loadPreset = (name: "m25" | "slump75" | "aci" | "m30") => {
    setMethod("IS");
    setSdMode("table");
    setExposure("Moderate");
    setMaxAggMm("20");
    setAggType("angular");
    setCementType("OPC53");
    setSgCem("3.15");
    setSgFA("2.65");
    setSgCA("2.70");
    setFaZone("II");
    setCaOverride("");
    setWcMode("auto");
    setPceReduction("0");
    setPceDose("0");
    setMoistureFA("0");
    setMoistureCA("0");
    setBatchVolume("1");
    setAirPct("1.5");
    setPumped(false);
    if (name === "m25") {
      setFck("25");
      setSlumpMm("50");
    } else if (name === "slump75") {
      setFck("25");
      setSlumpMm("75");
    } else if (name === "aci") {
      setMethod("ACI");
      setFck("25");
      setSlumpMm("75");
      setFm("2.60");
      setDryRodded("1600");
      setAciExposure("none");
    } else {
      setFck("30");
      setSlumpMm("100");
    }
  };

  const money = (v: number | null) =>
    v == null ? "—" : formatCurrency(v, false);

  const costLines = useMemo(() => {
    const cementRate = rates.cementPerBag.trim() === "" ? null : num(rates.cementPerBag, NaN);
    const faRate = rates.faPerM3.trim() === "" ? null : num(rates.faPerM3, NaN);
    const caRate = rates.caPerM3.trim() === "" ? null : num(rates.caPerM3, NaN);
    const waterRate = rates.waterPerL.trim() === "" ? null : num(rates.waterPerL, NaN);
    const admRate = rates.admixturePerKg.trim() === "" ? null : num(rates.admixturePerKg, NaN);
    const lines: Array<{ label: string; qty: string; amount: number | null }> = [
      { label: "Cement", qty: `${result.cementBagsOrder} bags`, amount: cementRate != null && isFinite(cementRate) ? result.cementBagsOrder * cementRate : null },
      { label: "Fine aggregate", qty: `${(result.faKg / (inputs.sgFA * 1000)).toFixed(3)} m³`, amount: faRate != null && isFinite(faRate) ? (result.faKg / (inputs.sgFA * 1000)) * faRate : null },
      { label: "Coarse aggregate", qty: `${(result.caKg / (inputs.sgCA * 1000)).toFixed(3)} m³`, amount: caRate != null && isFinite(caRate) ? (result.caKg / (inputs.sgCA * 1000)) * caRate : null },
      { label: "Water", qty: `${result.waterKg} L`, amount: waterRate != null && isFinite(waterRate) ? result.waterKg * waterRate : null },
      { label: "Superplasticiser", qty: `${result.admixtureKg.toFixed(2)} kg`, amount: result.admixtureKg > 0 && admRate != null && isFinite(admRate) ? result.admixtureKg * admRate : result.admixtureKg > 0 ? null : 0 },
    ];
    const total = lines.reduce<number | null>((acc, l) => (l.amount == null ? acc : (acc ?? 0) + l.amount), null);
    return { lines, total };
  }, [rates, result, inputs]);

  const summaryText = () => {
    const lines = [
      `Concrete Mix Design — ${method === "IS" ? "IS 10262:2019" : "ACI 211.1"} (${currentCurrency})`,
      `Grade: M${inputs.fck} | Target strength: ${result.targetStrength.toFixed(1)} MPa (display ${result.targetStrengthDisplay.toFixed(1)} MPa)`,
      `Water: ${result.waterKg} kg/m³ | w/c governing: ${result.wcGoverning.toFixed(2)} (${result.governedBy}) | Actual w/c: ${result.wcActual.toFixed(2)}`,
      `Cement: ${result.cementKg} kg/m³ (${result.cementBagsExact.toFixed(2)} bags exact → order ${result.cementBagsOrder} bags)`,
      `Fine aggregate: ${result.faKg} kg/m³ | Coarse aggregate: ${result.caKg} kg/m³`,
      `Ratio (by mass): 1 : ${result.ratioFA.toFixed(2)} : ${result.ratioCA.toFixed(2)} : ${result.wcActual.toFixed(2)}`,
      `Fresh density: ${result.densityKgM3.toLocaleString()} kg/m³`,
      `Batch 0.5 m³: cement ${result.batchHalf.cementKg} kg (${result.batchHalf.cementBagsOrder} bags), water ${result.batchHalf.waterL} L, FA ${result.batchHalf.faKg} kg, CA ${result.batchHalf.caKg} kg`,
      `Batch ${result.batch.volumeM3} m³: cement ${result.batch.cementKg} kg (${result.batch.cementBagsOrder} bags), water ${result.batch.waterL} L, FA ${result.batch.faKg} kg, CA ${result.batch.caKg} kg`,
    ];
    if (costLines.total != null) lines.push(`Estimated cost: ${money(costLines.total)}/m³ (rates entered by you)`);
    lines.push("Trial batches required (IS 10262 Cl 5.8) — this is a proportioning aid, not a substitute for a licensed engineer's design.");
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
        await navigator.share({ title: "Concrete mix design — Civil Estimation Pro", text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch { /* user cancelled — fall through to copy */ }
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
    doc.text("Concrete Mix Design — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · ${method === "IS" ? "IS 10262:2019" : "ACI 211.1"}`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of lines.slice(1)) {
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 8;
    }
    doc.setFontSize(9);
    doc.text("Disclaimer: proportioning aid only — confirm by trial batches (IS 10262 Cl 5.8) and a licensed engineer's design.", 14, y + 8, { maxWidth: 180 });
    doc.save("concrete-mix-design-civil-estimation-pro.pdf");
  };

  const setRate = (key: keyof RateState, v: string) => setRates((p) => ({ ...p, [key]: v }));

  return (
    <div className="w-full space-y-6">
      {/* Method + presets */}
      <div className={sectionCls}>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-2" role="group" aria-label="Design method">
            {(["IS", "ACI"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                aria-pressed={method === m}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${method === m ? "bg-ink text-white border-ink" : "bg-surface-hover border-ui-borderSubtle text-txt-secondary hover:border-accent-300"}`}
              >
                {m === "IS" ? "IS 10262:2019 (PK / IN)" : "ACI 211.1 (UAE / international)"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => loadPreset("m25")} className="text-xs font-bold px-3 py-2 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100">M25 worked example</Button>
            <Button onClick={() => loadPreset("slump75")} className="text-xs font-bold px-3 py-2 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100">Slump 75 mm</Button>
            <Button onClick={() => loadPreset("aci")} className="text-xs font-bold px-3 py-2 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100">ACI M25</Button>
            <Button onClick={() => loadPreset("m30")} className="text-xs font-bold px-3 py-2 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100">M30</Button>
          </div>
        </div>
        <p className="text-sm text-txt-secondary mt-3 leading-relaxed">
          {method === "IS"
            ? "IS 10262:2019 — target strength, water from Table 4, w/c from Fig. 1 vs IS 456 Table 5 durability, aggregates by absolute volume (Table 5)."
            : "ACI 211.1 — required average strength f'cr, water from Table 6.3.3, w/c from Table 6.3.4(a) keyed to f'cr (not f'c), coarse aggregate from Table 6.3.6."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Inputs */}
        <div className="space-y-6">
          <section className={sectionCls} aria-label="Grade and exposure">
            <h3 className="text-lg font-bold text-txt-primary mb-4">Grade &amp; exposure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="md-grade" className={labelCls}>{method === "IS" ? "Grade fck" : "Specified f'c (MPa)"}</label>
                <select id="md-grade" value={fck} onChange={(e) => setFck(e.target.value)} className={selectCls}>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>M{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="md-sd-mode" className={labelCls}>Standard deviation</label>
                <select id="md-sd-mode" value={sdMode} onChange={(e) => setSdMode(e.target.value as "table" | "custom")} className={selectCls}>
                  <option value="table">Table value ({sdForGrade(num(fck, 25))} MPa)</option>
                  <option value="custom">My plant SD (≥30 tests)</option>
                </select>
              </div>
              {sdMode === "custom" && (
                <div>
                  <label htmlFor="md-sd" className={labelCls}>Plant SD (MPa, 2–8)</label>
                  <input id="md-sd" type="number" inputMode="decimal" min="2" max="8" step="0.1" value={sdCustom} onChange={(e) => setSdCustom(e.target.value)} className={inputCls} />
                </div>
              )}
              {method === "IS" ? (
                <div>
                  <label htmlFor="md-exposure" className={labelCls}>Exposure (IS 456 Table 5)</label>
                  <select id="md-exposure" value={exposure} onChange={(e) => setExposure(e.target.value as Exposure)} className={selectCls}>
                    {EXPOSURES.map((x) => (
                      <option key={x} value={x}>{x} — min cement {DURABILITY[x].minCementKg} kg, max w/c {DURABILITY[x].maxWc.toFixed(2)}, min M{DURABILITY[x].minGrade}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label htmlFor="md-aci-exp" className={labelCls}>ACI exposure class</label>
                  <select id="md-aci-exp" value={aciExposure} onChange={(e) => setAciExposure(e.target.value as AciExposure)} className={selectCls}>
                    {ACI_EXPOSURES.map((x) => (
                      <option key={x.id} value={x.id}>{x.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className={sectionCls} aria-label="Aggregates and workability">
            <h3 className="text-lg font-bold text-txt-primary mb-4">Aggregates &amp; workability</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="md-maxagg" className={labelCls}>Max aggregate size</label>
                <select id="md-maxagg" value={maxAggMm} onChange={(e) => setMaxAggMm(e.target.value as "10" | "20" | "40")} className={selectCls}>
                  <option value="10">10 mm</option>
                  <option value="20">20 mm</option>
                  <option value="40">40 mm</option>
                </select>
              </div>
              <div>
                <label htmlFor="md-aggtype" className={labelCls}>Aggregate type</label>
                <select id="md-aggtype" value={aggType} onChange={(e) => setAggType(e.target.value as AggType)} className={selectCls}>
                  <option value="angular">Angular crushed</option>
                  <option value="rounded">Rounded gravel</option>
                </select>
              </div>
              <div>
                <label htmlFor="md-slump" className={labelCls}>Slump (mm, 25–175)</label>
                <input id="md-slump" type="number" inputMode="decimal" min="25" max="175" value={slumpMm} onChange={(e) => setSlumpMm(e.target.value)} className={inputCls} />
                <input type="range" min="25" max="175" step="5" value={num(slumpMm, 50)} onChange={(e) => setSlumpMm(e.target.value)} className="w-full mt-2 accent-accent-600" aria-label="Slump slider" />
              </div>
              {method === "IS" ? (
                <div>
                  <label htmlFor="md-zone" className={labelCls}>Fine aggregate zone (IS 383)</label>
                  <select id="md-zone" value={faZone} onChange={(e) => setFaZone(e.target.value as FaZone)} className={selectCls}>
                    {ZONES.map((z) => (
                      <option key={z} value={z}>Zone {z}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label htmlFor="md-fm" className={labelCls}>Fineness modulus FM (2.3–3.2)</label>
                  <input id="md-fm" type="number" inputMode="decimal" min="2.3" max="3.2" step="0.05" value={fm} onChange={(e) => setFm(e.target.value)} className={inputCls} />
                </div>
              )}
              {method === "IS" && (
                <div>
                  <label htmlFor="md-ca-override" className={labelCls}>CA fraction override (optional)</label>
                  <input id="md-ca-override" type="number" inputMode="decimal" min="0.25" max="0.75" step="0.01" value={caOverride} onChange={(e) => setCaOverride(e.target.value)} placeholder={`Table 5: ${result.caFractionTable?.toFixed(2) ?? "—"}`} className={inputCls} />
                </div>
              )}
              {method === "ACI" && (
                <div>
                  <label htmlFor="md-dryrodded" className={labelCls}>Dry-rodded CA unit weight (kg/m³)</label>
                  <input id="md-dryrodded" type="number" inputMode="decimal" min="1400" max="1800" step="10" value={dryRodded} onChange={(e) => setDryRodded(e.target.value)} className={inputCls} />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm font-bold text-txt-secondary col-span-2">
                <input type="checkbox" checked={pumped} onChange={(e) => setPumped(e.target.checked)} className="w-4 h-4 accent-accent-600" />
                Pumped concrete (IS: CA fraction −10% relative)
              </label>
            </div>
          </section>

          <section className={sectionCls} aria-label="Cement and specific gravities">
            <h3 className="text-lg font-bold text-txt-primary mb-4">Cement &amp; specific gravities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="md-cement" className={labelCls}>Cement type</label>
                <select id="md-cement" value={cementType} onChange={(e) => { setCementType(e.target.value as CementType); setSgCem({ OPC43: "3.15", OPC53: "3.15", PPC: "2.90", SRPC: "3.20" }[e.target.value as CementType]); }} className={selectCls}>
                  {(Object.keys(CEMENT_LABEL) as CementType[]).map((c) => (
                    <option key={c} value={c}>{CEMENT_LABEL[c]} (SG {c === "PPC" ? "2.90" : c === "SRPC" ? "3.20" : "3.15"})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="md-air" className={labelCls}>Entrapped air % (0–3)</label>
                <input id="md-air" type="number" inputMode="decimal" min="0" max="3" step="0.1" value={airPct} onChange={(e) => setAirPct(e.target.value)} className={inputCls} disabled={method === "ACI"} />
                {method === "ACI" && <p className="text-xs text-txt-tertiary mt-1">ACI Table 6.3.3 sets air from the aggregate size.</p>}
              </div>
              <div>
                <label htmlFor="md-sg-cem" className={labelCls}>Cement SG (2.5–3.3)</label>
                <input id="md-sg-cem" type="number" inputMode="decimal" step="0.01" value={sgCem} onChange={(e) => setSgCem(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-sg-fa" className={labelCls}>Fine aggregate SG (2.5–2.8)</label>
                <input id="md-sg-fa" type="number" inputMode="decimal" step="0.01" value={sgFA} onChange={(e) => setSgFA(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-sg-ca" className={labelCls}>Coarse aggregate SG (2.5–2.9)</label>
                <input id="md-sg-ca" type="number" inputMode="decimal" step="0.01" value={sgCA} onChange={(e) => setSgCA(e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          <section className={sectionCls} aria-label="Water-cement ratio, admixture and moisture">
            <h3 className="text-lg font-bold text-txt-primary mb-4">w/c, admixture &amp; moisture</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="md-wc-mode" className={labelCls}>w/c mode</label>
                <select id="md-wc-mode" value={wcMode} onChange={(e) => setWcMode(e.target.value as "auto" | "manual")} className={selectCls}>
                  <option value="auto">Auto — min(strength, durability)</option>
                  <option value="manual">Manual w/c</option>
                </select>
              </div>
              {wcMode === "manual" && (
                <div>
                  <label htmlFor="md-wc" className={labelCls}>Manual w/c (0.25–0.80)</label>
                  <input id="md-wc" type="number" inputMode="decimal" min="0.25" max="0.8" step="0.01" value={wcManual} onChange={(e) => setWcManual(e.target.value)} className={inputCls} />
                </div>
              )}
              <div>
                <label htmlFor="md-pce-red" className={labelCls}>Superplasticiser water reduction % (0–30)</label>
                <input id="md-pce-red" type="number" inputMode="decimal" min="0" max="30" step="1" value={pceReduction} onChange={(e) => setPceReduction(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-pce-dose" className={labelCls}>Superplasticiser dose % of cement (0–1.5)</label>
                <input id="md-pce-dose" type="number" inputMode="decimal" min="0" max="1.5" step="0.1" value={pceDose} onChange={(e) => setPceDose(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-moist-fa" className={labelCls}>FA moisture % (0–10)</label>
                <input id="md-moist-fa" type="number" inputMode="decimal" min="0" max="10" step="0.5" value={moistureFA} onChange={(e) => setMoistureFA(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-moist-ca" className={labelCls}>CA moisture % (0–10)</label>
                <input id="md-moist-ca" type="number" inputMode="decimal" min="0" max="10" step="0.5" value={moistureCA} onChange={(e) => setMoistureCA(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-batch" className={labelCls}>Batch volume (m³)</label>
                <input id="md-batch" type="number" inputMode="decimal" min="0.1" step="0.5" value={batchVolume} onChange={(e) => setBatchVolume(e.target.value)} className={inputCls} />
              </div>
            </div>
            <p className="text-xs text-txt-tertiary mt-3">
              Slump above 100 mm needs an admixture note: high slump without a superplasticiser usually means too much water, which lowers strength.
            </p>
          </section>

          <section className={sectionCls} aria-label="Rates and cost">
            <h3 className="text-lg font-bold text-txt-primary mb-2">Rates &amp; cost ({currentCurrency})</h3>
            <p className="text-xs text-txt-tertiary mb-4">Enter your local rates — a line with no rate shows “—” instead of a made-up price. The cement rate below is an example rate from the in-repo placeholder; enter your own.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="md-rate-cem" className={labelCls}>Cement ({symbol}/bag)</label>
                <input id="md-rate-cem" type="number" inputMode="decimal" min="0" value={rates.cementPerBag} onChange={(e) => setRate("cementPerBag", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-rate-fa" className={labelCls}>Fine aggregate ({symbol}/m³)</label>
                <input id="md-rate-fa" type="number" inputMode="decimal" min="0" value={rates.faPerM3} onChange={(e) => setRate("faPerM3", e.target.value)} placeholder="Enter your rate" className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-rate-ca" className={labelCls}>Coarse aggregate ({symbol}/m³)</label>
                <input id="md-rate-ca" type="number" inputMode="decimal" min="0" value={rates.caPerM3} onChange={(e) => setRate("caPerM3", e.target.value)} placeholder="Enter your rate" className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-rate-water" className={labelCls}>Water ({symbol}/L)</label>
                <input id="md-rate-water" type="number" inputMode="decimal" min="0" value={rates.waterPerL} onChange={(e) => setRate("waterPerL", e.target.value)} placeholder="Enter your rate" className={inputCls} />
              </div>
              <div>
                <label htmlFor="md-rate-adm" className={labelCls}>Superplasticiser ({symbol}/kg)</label>
                <input id="md-rate-adm" type="number" inputMode="decimal" min="0" value={rates.admixturePerKg} onChange={(e) => setRate("admixturePerKg", e.target.value)} placeholder="Enter your rate" className={inputCls} />
              </div>
            </div>
          </section>
        </div>

        {/* Results */}
        <div className="space-y-6 lg:sticky lg:top-4">
          {validationErrors.length > 0 && (
            <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4" role="alert">
              <p className="font-bold text-ui-errorText flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Check your inputs</p>
              <ul className="list-disc pl-5 mt-2 text-sm text-ui-errorText space-y-1">
                {validationErrors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}
          {result.errors.map((e, i) => (
            <div key={i} className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4" role="alert">
              <p className="font-bold text-ui-errorText flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {e}</p>
            </div>
          ))}
          {result.warnings.map((w, i) => (
            <div key={i} className="bg-accent-50 border border-accent-200 rounded-2xl p-4">
              <p className="text-sm text-accent-800">{w}</p>
            </div>
          ))}

          <section className={sectionCls} aria-label="Mix design results">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-accent-800" />
              <h3 className="text-lg font-bold text-txt-primary">Mix proportions — per m³</h3>
            </div>
            <dl className="divide-y divide-ui-borderSubtle">
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Target strength</dt><dd className="font-bold text-txt-primary">{result.targetStrength.toFixed(1)} MPa <span className="text-xs font-normal text-txt-tertiary">(display {result.targetStrengthDisplay.toFixed(1)} MPa)</span></dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Water</dt><dd className="font-bold text-txt-primary">{result.waterKg} kg/m³ <span className="text-xs font-normal text-txt-tertiary">(Table: {result.waterBaseKg} kg/m³)</span></dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">w/c — strength / durability</dt><dd className="font-bold text-txt-primary">{result.wcStrength.toFixed(2)} / {result.wcDurability != null ? result.wcDurability.toFixed(2) : "—"}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Governing w/c</dt><dd className="font-bold text-txt-primary">{result.wcGoverning.toFixed(2)} <span className="text-xs font-normal text-txt-tertiary">({result.governedBy === "durability" ? "governed by durability, not strength" : result.governedBy === "cement-minimum" ? "cement governed by Cmin — actual w/c lower" : result.governedBy === "manual" ? "manual" : "governed by strength"})</span></dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Actual w/c</dt><dd className="font-bold text-txt-primary">{result.wcActual.toFixed(2)}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Cement</dt><dd className="font-bold text-txt-primary">{result.cementKg} kg/m³ <span className="text-xs font-normal text-txt-tertiary">({result.cementBagsExact.toFixed(2)} bags exact → order {result.cementBagsOrder})</span></dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Fine aggregate (CA fraction {result.caFraction.toFixed(2)})</dt><dd className="font-bold text-txt-primary">{result.faKg} kg/m³</dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Coarse aggregate</dt><dd className="font-bold text-txt-primary">{result.caKg} kg/m³</dd></div>
              {result.admixtureKg > 0 && (
                <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Superplasticiser</dt><dd className="font-bold text-txt-primary">{result.admixtureKg.toFixed(2)} kg/m³</dd></div>
              )}
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Ratio (by mass)</dt><dd className="font-bold text-txt-primary">1 : {result.ratioFA.toFixed(2)} : {result.ratioCA.toFixed(2)} : {result.wcActual.toFixed(2)}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-sm text-txt-secondary">Fresh density</dt><dd className={`font-bold ${result.densityOk ? "text-txt-primary" : "text-ui-errorText"}`}>{result.densityKgM3.toLocaleString()} kg/m³ <span className="text-xs font-normal text-txt-tertiary">(normal 2,300–2,500)</span></dd></div>
            </dl>

            <h4 className="font-bold text-txt-primary mt-6 mb-2">Absolute volumes (must sum to 1.000 m³)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-txt-tertiary border-b border-ui-borderSubtle"><th className="py-1 pr-2">Component</th><th className="py-1 text-right">Volume (m³)</th></tr></thead>
                <tbody>
                  {[["Cement", result.vCem], ["Water", result.vWater], ["Entrapped air", result.vAir], ["Admixture", result.vAdmix], ["Fine aggregate", result.vFA], ["Coarse aggregate", result.vCA]].map(([label, v]) => (
                    <tr key={label as string} className="border-b border-ui-borderSubtle/50"><td className="py-1 pr-2 text-txt-secondary">{label}</td><td className="py-1 text-right font-mono text-txt-primary">{(v as number).toFixed(4)}</td></tr>
                  ))}
                  <tr><td className="py-1 pr-2 font-bold text-txt-primary">Total</td><td className="py-1 text-right font-mono font-bold text-txt-primary">{(result.vCem + result.vWater + result.vAir + result.vAdmix + result.vFA + result.vCA).toFixed(4)}</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-bold text-txt-primary mt-6 mb-2">Batch weights {result.moistureCorrected ? "(SSD-corrected)" : ""}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-txt-tertiary border-b border-ui-borderSubtle"><th className="py-1 pr-2"></th><th className="py-1 text-right">0.5 m³</th><th className="py-1 text-right">1 m³</th><th className="py-1 text-right">{result.batch.volumeM3} m³</th></tr></thead>
                <tbody>
                  <tr className="border-b border-ui-borderSubtle/50"><td className="py-1 pr-2 text-txt-secondary">Cement</td><td className="py-1 text-right font-mono">{result.batchHalf.cementKg} kg ({result.batchHalf.cementBagsOrder} bags)</td><td className="py-1 text-right font-mono">{result.cementKg} kg ({result.cementBagsOrder} bags)</td><td className="py-1 text-right font-mono">{result.batch.cementKg.toFixed(0)} kg ({result.batch.cementBagsOrder} bags)</td></tr>
                  <tr className="border-b border-ui-borderSubtle/50"><td className="py-1 pr-2 text-txt-secondary">Water</td><td className="py-1 text-right font-mono">{result.batchHalf.waterL} L</td><td className="py-1 text-right font-mono">{result.waterBatchedKg} L</td><td className="py-1 text-right font-mono">{result.batch.waterL.toFixed(0)} L</td></tr>
                  <tr className="border-b border-ui-borderSubtle/50"><td className="py-1 pr-2 text-txt-secondary">Fine aggregate</td><td className="py-1 text-right font-mono">{result.batchHalf.faKg} kg</td><td className="py-1 text-right font-mono">{result.faKg} kg</td><td className="py-1 text-right font-mono">{result.batch.faKg.toFixed(0)} kg</td></tr>
                  <tr><td className="py-1 pr-2 text-txt-secondary">Coarse aggregate</td><td className="py-1 text-right font-mono">{result.batchHalf.caKg} kg</td><td className="py-1 text-right font-mono">{result.caKg} kg</td><td className="py-1 text-right font-mono">{result.batch.caKg.toFixed(0)} kg</td></tr>
                </tbody>
              </table>
            </div>
            {result.moistureCorrected && <p className="text-xs text-txt-tertiary mt-2">Batch weights are corrected for aggregate moisture (SSD basis): batch water is reduced by the free water in the aggregates.</p>}

            {costLines.total != null && (
              <>
                <h4 className="font-bold text-txt-primary mt-6 mb-2">Cost per m³ ({currentCurrency})</h4>
                <dl className="divide-y divide-ui-borderSubtle">
                  {costLines.lines.map((l) => (
                    <div key={l.label} className="flex justify-between py-1.5"><dt className="text-sm text-txt-secondary">{l.label} <span className="text-xs text-txt-tertiary">({l.qty})</span></dt><dd className="font-bold text-txt-primary">{money(l.amount)}</dd></div>
                  ))}
                  <div className="flex justify-between py-2"><dt className="font-bold text-txt-primary">Total (priced lines only)</dt><dd className="font-bold text-txt-primary">{money(costLines.total)}</dd></div>
                </dl>
              </>
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
              <GenericExportButtons
                filename="concrete-mix-design"
                data={{
                  headers: ["Item", "Quantity", "Unit"],
                  rows: [
                    ["Method", method === "IS" ? "IS 10262:2019" : "ACI 211.1", ""],
                    ["Grade", `M${inputs.fck}`, ""],
                    ["Target strength", result.targetStrength.toFixed(1), "MPa"],
                    ["Water", String(result.waterKg), "kg/m³"],
                    ["Governing w/c", result.wcGoverning.toFixed(2), ""],
                    ["Actual w/c", result.wcActual.toFixed(2), ""],
                    ["Cement", String(result.cementKg), "kg/m³"],
                    ["Cement bags (exact)", result.cementBagsExact.toFixed(2), "bags/m³"],
                    ["Cement bags (order)", String(result.cementBagsOrder), "bags/m³"],
                    ["Fine aggregate", String(result.faKg), "kg/m³"],
                    ["Coarse aggregate", String(result.caKg), "kg/m³"],
                    ["Ratio by mass", `1 : ${result.ratioFA.toFixed(2)} : ${result.ratioCA.toFixed(2)} : ${result.wcActual.toFixed(2)}`, ""],
                    ["Fresh density", String(result.densityKgM3), "kg/m³"],
                    ["Batch 0.5 m³ — cement", String(result.batchHalf.cementKg), "kg"],
                    ["Batch 0.5 m³ — water", String(result.batchHalf.waterL), "L"],
                    ["Batch 0.5 m³ — fine aggregate", String(result.batchHalf.faKg), "kg"],
                    ["Batch 0.5 m³ — coarse aggregate", String(result.batchHalf.caKg), "kg"],
                    ["Batch 1 m³ — cement", String(result.cementKg), "kg"],
                    ["Batch 1 m³ — water", String(result.waterBatchedKg), "L"],
                    ["Batch 1 m³ — fine aggregate", String(result.faKg), "kg"],
                    ["Batch 1 m³ — coarse aggregate", String(result.caKg), "kg"],
                    ...(costLines.total != null
                      ? [[`Estimated cost (${currentCurrency})`, money(costLines.total), "per m³"] as (string | number)[]]
                      : []),
                  ],
                }}
              />
            </div>
          </section>

          <section className={sectionCls} aria-label="How it is calculated">
            <Button onClick={() => setShowSteps(!showSteps)} className="w-full flex items-center justify-between text-left font-bold text-txt-primary">
              <span>How it&rsquo;s calculated — step by step</span>
              <span className="text-accent-800">{showSteps ? "Hide" : "Show"}</span>
            </Button>
            {showSteps && (
              <ol className="list-decimal pl-5 mt-4 space-y-2 text-sm text-txt-secondary leading-relaxed">
                {result.steps.map((s, i) => (<li key={i}>{s}</li>))}
                <li>Cement bags/m³ = {result.cementKg} ÷ 50 = {result.cementBagsExact.toFixed(2)} exact → order {result.cementBagsOrder} bags.</li>
                <li>Absolute volumes: V = mass ÷ (SG × 1000); V<sub>cem</sub> {result.vCem.toFixed(4)} + V<sub>water</sub> {result.vWater.toFixed(4)} + V<sub>air</sub> {result.vAir.toFixed(4)} + V<sub>admix</sub> {result.vAdmix.toFixed(4)} + V<sub>FA</sub> {result.vFA.toFixed(4)} + V<sub>CA</sub> {result.vCA.toFixed(4)} = 1.000 m³.</li>
                <li>Ratio by mass: 1 : {result.ratioFA.toFixed(2)} : {result.ratioCA.toFixed(2)} : {result.wcActual.toFixed(2)}; fresh density {result.densityKgM3.toLocaleString()} kg/m³.</li>
                {result.moistureCorrected && <li>SSD correction: batch FA = FA × (1 + moisture), batch CA = CA × (1 + moisture), batch water = design water − free water in the aggregates (floored at 80% of design water).</li>}
              </ol>
            )}
          </section>

          <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4">
            <p className="text-sm text-accent-800 leading-relaxed">
              <strong>Trial batches required.</strong> Design mixes must be confirmed by trial batches (IS 10262 Cl 5.8: three batches ≥0.5 m³, 7- and 28-day cubes) and production acceptance per IS 456 Cl 16 / Table 11. This calculator is a proportioning aid, not a substitute for a licensed engineer&rsquo;s design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
