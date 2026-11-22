import React, { useMemo, useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { UniversalTabs } from "../ui/UniversalTabs";
import {
  Circle,
  Square,
  CircleDashed,
  Hexagon,
  SquareDashed,
  RectangleHorizontal,
  Type,
  Columns,
  CornerDownRight,
  Minus,
  Layers,
  Copy,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { CalculationHistory } from "../ui/CalculationHistory";
import { CodeTooltip } from "../ui/CodeTooltip";
import { Button } from "../ui/Button";
import { useAutoSave } from "../../hooks/useAutoSave";
import {
  calcMetalWeight,
  validateMetal,
  METAL_PROFILES,
  PROFILE_DEFAULTS,
  PROFILE_DIMS,
  MATERIALS,
  STANDARD_SECTIONS,
  type MetalProfile,
  type MetalInputs,
} from "../../lib/metalWeightCalc";
import {
  BAR_WEIGHT_TABLE,
  STEEL_RATE_DEFAULTS,
  STEEL_RATE_LABEL,
  formatSteelMoney,
  type SteelCurrency,
} from "../../lib/steelCalc";
import { exportBOQToPDF } from "../../lib/pdfExport";

const inputCls =
  "w-full bg-transparent bg-surface-default border border-ui-borderSubtle p-4 rounded-full mt-1.5 font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none";
const inputErrCls =
  "w-full bg-transparent bg-surface-default border border-ui-errorBorder p-4 rounded-full mt-1.5 font-bold focus:ring-2 focus:ring-ui-errorText focus:outline-none";
const selectCls =
  "w-full bg-surface-default border border-ui-borderSubtle p-3 rounded-2xl font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none";
const labelCls = "text-base font-medium uppercase";
const errTextCls = "text-sm text-ui-errorText mt-1";

const CURRENCIES: SteelCurrency[] = ["PKR", "INR", "AED", "USD"];

const PROFILE_ICONS: Record<MetalProfile, React.ComponentType<{ className?: string }>> = {
  round: Circle,
  square: Square,
  pipe: CircleDashed,
  hex: Hexagon,
  "square-tube": SquareDashed,
  "rect-tube": RectangleHorizontal,
  tee: RectangleHorizontal,
  beam: Type,
  channel: Columns,
  angle: CornerDownRight,
  flat: Minus,
  sheet: Layers,
  rebar: Circle,
};

interface ListLine {
  id: number;
  label: string;
  qty: number;
  pieceLengthM: number;
  weightPerM: number;
  totalKg: number;
}

let lineSeq = 0;

const dimsToStrings = (profile: MetalProfile): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(PROFILE_DEFAULTS[profile])) out[k] = String(v);
  return out;
};

export default function MetalWeightCalculator() {
  const [activeProfile, setActiveProfile] = useState<MetalProfile>("round");
  const [dims, setDims] = useState<Record<string, string>>(() => dimsToStrings("round"));
  const [materialId, setMaterialId] = useState("mild-steel");
  const [customDensity, setCustomDensity] = useState("7850");
  const [pieceLength, setPieceLength] = useState("12");
  const [qty, setQty] = useState("1");
  const [wastage, setWastage] = useState("5");
  // Currency defaults to the global setting; the picker still lets the user
  // override it per tool. The 270/kg default is a PKR steel rate, so it is
  // only prefilled when the starting currency is PKR.
  const { settings } = useSettings();
  const initialCurrency: SteelCurrency = (["PKR", "INR", "AED", "USD"] as string[]).includes(settings.currency) ? (settings.currency as SteelCurrency) : "PKR";
  const [rate, setRate] = useState(initialCurrency === "PKR" ? "270" : "");
  const [currency, setCurrency] = useState<SteelCurrency>(initialCurrency);
  const [standardId, setStandardId] = useState("");
  const [list, setList] = useState<ListLine[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useAutoSave(
    "metal_weight_calculator_v2",
    { activeProfile, dims, materialId, customDensity, pieceLength, qty, wastage, rate, currency, standardId, list },
    {
      activeProfile: (v) => setActiveProfile(v as MetalProfile),
      dims: (v) => setDims(v as Record<string, string>),
      materialId: setMaterialId, customDensity: setCustomDensity, pieceLength: setPieceLength,
      qty: setQty, wastage: setWastage, rate: setRate, currency: (v) => setCurrency(v as SteelCurrency),
      standardId: setStandardId, list: (v) => Array.isArray(v) && setList(v as ListLine[]),
    },
  );

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];
  const density = materialId === "custom" ? Number(customDensity) || 0 : material.density;
  const parsedDims: Record<string, number> = {};
  for (const [k, v] of Object.entries(dims)) parsedDims[k] = Number(v);

  const standard = STANDARD_SECTIONS.find((s) => s.id === standardId) ?? null;

  const inputs: MetalInputs = {
    profile: activeProfile,
    dims: parsedDims,
    density,
    pieceLengthM: Number(pieceLength),
    qty: Number(qty),
    wastagePct: Number(wastage) || 0,
    ratePerKg: rate.trim() === "" ? null : Number(rate),
    tabulatedKgPerM: standard?.kgPerM ?? null,
  };

  const errors = useMemo(() => validateMetal(inputs), [activeProfile, dims, materialId, customDensity, pieceLength, qty, wastage, rate, standardId]);
  const results = errors.length === 0 ? calcMetalWeight(inputs) : null;
  const rateNum = inputs.ratePerKg;
  const listTotalKg = list.reduce((s, l) => s + l.totalKg, 0);
  const listOrderKg = listTotalKg * (1 + (Number(wastage) || 0) / 100);

  const switchProfile = (p: MetalProfile) => {
    setActiveProfile(p);
    setDims(dimsToStrings(p)); // reset dimension state — fixes the stale-state bug
    setStandardId("");
  };

  const applyStandard = (id: string) => {
    setStandardId(id);
    const s = STANDARD_SECTIONS.find((x) => x.id === id);
    if (s) {
      setActiveProfile(s.profile);
      const d: Record<string, string> = {};
      for (const [k, v] of Object.entries(s.dims)) d[k] = String(v);
      setDims(d);
    }
  };

  const onCurrencyChange = (c: SteelCurrency) => {
    setCurrency(c);
    const v = STEEL_RATE_DEFAULTS[c].perKg;
    setRate(v == null ? "" : String(v));
  };

  const dimsLabel = () =>
    PROFILE_DIMS[activeProfile].map((d) => `${d.label.replace(" (mm)", "")} ${dims[d.key] ?? ""}`).join(" × ");

  const addToList = () => {
    if (!results) return;
    lineSeq += 1;
    setList((prev) => [
      ...prev,
      {
        id: lineSeq,
        label: `${METAL_PROFILES.find((p) => p.id === activeProfile)?.label} — ${dimsLabel()} mm`,
        qty: Number(qty),
        pieceLengthM: Number(pieceLength),
        weightPerM: results.weightPerM,
        totalKg: results.totalKg,
      },
    ]);
    setNotice("Added to the list. Keep adding lines, then export the whole list.");
  };

  const summaryText = () => {
    if (!results) return "Metal weight — fix the errors above to see a result.";
    return [
      `${METAL_PROFILES.find((p) => p.id === activeProfile)?.label}: ${dimsLabel()} mm, ${material.label} (${density} kg/m³)`,
      results.formula,
      `Weight: ${results.weightPerM.toFixed(3)} kg/m (${results.weightLbPerFt.toFixed(3)} lb/ft)`,
      `Per piece (${inputs.pieceLengthM} m): ${results.weightPerPieceKg.toFixed(2)} kg`,
      `Total (${inputs.qty} pc): ${results.totalKg.toFixed(2)} kg; with ${inputs.wastagePct}% wastage: ${results.orderKg.toFixed(2)} kg (${results.tonnes.toFixed(3)} t)`,
      `Cost: ${results.cost == null ? "— (enter a steel rate)" : formatSteelMoney(results.cost, currency)}`,
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

  const downloadCsv = () => {
    const head = "Line,Profile,Qty,Piece length (m),Weight per m (kg/m),Total (kg)";
    const lines = (list.length > 0 ? list : []).map((l, i) => `${i + 1},"${l.label}",${l.qty},${l.pieceLengthM},${l.weightPerM.toFixed(3)},${l.totalKg.toFixed(2)}`);
    if (list.length === 0 && results) {
      lines.push(`1,"${METAL_PROFILES.find((p) => p.id === activeProfile)?.label} — ${dimsLabel()}",${qty},${pieceLength},${results.weightPerM.toFixed(3)},${results.totalKg.toFixed(2)}`);
    }
    lines.push(`Total (kg),,,,${(list.length > 0 ? listTotalKg : results?.totalKg ?? 0).toFixed(2)}`);
    const blob = new Blob([[head, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metal-weight-list.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotice("CSV downloaded.");
  };

  const downloadPdf = () => {
    const items =
      list.length > 0
        ? list.map((l) => ({ description: `${l.label} — ${l.qty} × ${l.pieceLengthM} m`, quantity: l.totalKg, unit: "kg", rate: rateNum ?? 0, amount: rateNum == null ? 0 : l.totalKg * rateNum }))
        : results
          ? [{ description: `${METAL_PROFILES.find((p) => p.id === activeProfile)?.label} — ${dimsLabel()} mm, ${qty} × ${pieceLength} m`, quantity: results.totalKg, unit: "kg", rate: rateNum ?? 0, amount: results.cost ?? 0 }]
          : [];
    if (items.length === 0) return;
    exportBOQToPDF({
      projectName: "Metal Weight List",
      date: new Date().toLocaleDateString("en-GB"),
      items,
      totalAmount: rateNum == null ? 0 : (list.length > 0 ? listOrderKg : results?.orderKg ?? 0) * rateNum,
    });
    setNotice("PDF downloaded.");
  };

  const dimError = (key: string) => errors.find((e) => e.includes(PROFILE_DIMS[activeProfile].find((d) => d.key === key)?.label ?? key));

  return (
    <div className="w-full h-full bg-surface-hover text-txt-primary p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-base text-txt-secondary leading-relaxed max-w-3xl mb-6 print:hidden">
          Weight per metre, per piece and in total for 13 steel profiles — round and square bar,
          pipe, tube, angle, channel, I-beam, plate and sheet — with material densities, wastage,
          cost and a multi-line list you can export.
        </p>
        {notice && (
          <div className="flex items-start gap-2 bg-ui-success border border-ui-successBorder text-ui-successText rounded-2xl px-4 py-3 mb-6 print:hidden">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{notice}</p>
          </div>
        )}
        <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle mb-8 overflow-hidden">
          <div className="mb-8">
            <UniversalTabs
              tabs={METAL_PROFILES.map((p) => ({ id: p.id, label: p.label, icon: (() => { const I = PROFILE_ICONS[p.id]; return <I className="w-5 h-5" />; })() }))}
              activeTab={activeProfile}
              onTabChange={(id) => switchProfile(id as MetalProfile)}
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-ui-error border border-ui-errorBorder text-ui-errorText rounded-2xl px-4 py-3 mb-6 print:hidden">
              <p className="font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Fix these — the result shows “—” until they are fixed:</p>
              <ul className="list-disc ml-5 mt-1 text-sm">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          )}

          <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
            <div className="w-full flex-1 min-w-[min(100%,380px)] flex flex-col bg-surface-default p-4 sm:p-6 md:p-8 rounded-2xl border border-ui-borderSubtle shadow-brand-sm overflow-hidden">
              <h3 className="font-bold text-xl mb-6">{METAL_PROFILES.find((p) => p.id === activeProfile)?.label} Dimensions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {PROFILE_DIMS[activeProfile].map((d) => (
                  <div key={d.key}>
                    <label className={labelCls} htmlFor={`metal-${d.key}`}>
                      <span className="flex items-center gap-1">{d.label} {activeProfile === "round" && <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." />}</span>
                    </label>
                    <input
                      id={`metal-${d.key}`}
                      type="number"
                      inputMode="decimal"
                      value={dims[d.key] ?? ""}
                      onChange={(e) => setDims((prev) => ({ ...prev, [d.key]: e.target.value }))}
                      className={dimError(d.key) ? inputErrCls : inputCls}
                      placeholder={String(PROFILE_DEFAULTS[activeProfile][d.key] ?? "")}
                    />
                    {dimError(d.key) && <p className={errTextCls}>{dimError(d.key)}</p>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className={labelCls} htmlFor="metal-material">Material</label>
                  <select id="metal-material" value={materialId} onChange={(e) => setMaterialId(e.target.value)} className={selectCls}>
                    {MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label} — {m.density} kg/m³</option>
                    ))}
                  </select>
                </div>
                {materialId === "custom" && (
                  <div>
                    <label className={labelCls} htmlFor="metal-density">Custom Density (kg/m³)</label>
                    <input id="metal-density" type="number" inputMode="decimal" value={customDensity} onChange={(e) => setCustomDensity(e.target.value)} className={inputCls} />
                  </div>
                )}
                <div>
                  <label className={labelCls} htmlFor="metal-length">Piece Length (m)</label>
                  <input id="metal-length" type="number" inputMode="decimal" value={pieceLength} onChange={(e) => setPieceLength(e.target.value)} className={inputCls} />
                  <p className="text-xs text-txt-secondary mt-1">Length of one piece. 12 m is one stock length.</p>
                </div>
                <div>
                  <label className={labelCls} htmlFor="metal-qty">Quantity (pieces)</label>
                  <input id="metal-qty" type="number" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="metal-wastage">Wastage %</label>
                  <input id="metal-wastage" type="number" inputMode="decimal" value={wastage} onChange={(e) => setWastage(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="metal-rate">Steel Rate / kg</label>
                  <input id="metal-rate" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
                  <p className="text-xs text-txt-secondary mt-1">{STEEL_RATE_LABEL}.</p>
                </div>
                <div>
                  <label className={labelCls} htmlFor="metal-currency">Currency</label>
                  <select id="metal-currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value as SteelCurrency)} className={selectCls}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="metal-standard">Standard Section (IS 808)</label>
                  <select id="metal-standard" value={standardId} onChange={(e) => applyStandard(e.target.value)} className={selectCls}>
                    <option value="">Rectangle maths (no standard section)</option>
                    {STANDARD_SECTIONS.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-txt-secondary mt-1">Tabulated kg/m (approx. — confirm with the supplier). Rolled sections should be priced from the table, not from rectangle maths.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6 print:hidden">
                <Button onClick={addToList} disabled={!results} className="px-4 py-2.5 bg-ink text-white rounded-full text-base font-semibold disabled:opacity-50"><Plus className="w-4 h-4" /> Add to List</Button>
                <Button onClick={copyResults} className="px-4 py-2.5 bg-surface-hover text-txt-primary rounded-full text-base font-semibold"><Copy className="w-4 h-4" /> Copy Results</Button>
                <Button onClick={downloadCsv} className="px-4 py-2.5 bg-surface-hover text-txt-primary rounded-full text-base font-semibold"><Download className="w-4 h-4" /> CSV</Button>
                <Button onClick={downloadPdf} disabled={!results && list.length === 0} className="px-4 py-2.5 bg-ink text-white rounded-full text-base font-semibold disabled:opacity-50"><Download className="w-4 h-4" /> PDF</Button>
              </div>
            </div>

            <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 flex flex-col items-stretch h-full">
              <MaterialSummary title="Calculated Results" totalLabel="Total Weight" totalValue={results ? results.totalKg.toFixed(2) : "—"} totalUnit="kg" subtitle="">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <ResultCard title="Weight per Unit Length" value={results ? results.weightPerM.toFixed(3) : "—"} unit="kg/m" variant="neutral" />
                  <ResultCard title="Weight per Piece" value={results ? results.weightPerPieceKg.toFixed(2) : "—"} unit="kg" variant="neutral" />
                  <ResultCard title="Weight (lb/ft)" value={results ? results.weightLbPerFt.toFixed(3) : "—"} unit="lb/ft" variant="neutral" />
                  <ResultCard title="Material Density" value={String(density)} unit="kg/m³" variant="neutral" />
                  <ResultCard title="With Wastage" value={results ? results.orderKg.toFixed(2) : "—"} unit="kg" variant="neutral" />
                  <ResultCard title="Cost" value={results ? (results.cost == null ? "—" : formatSteelMoney(results.cost, currency)) : "—"} unit="" variant="neutral" />
                </div>
                {results && (
                  <div className="mt-4 text-sm text-txt-secondary space-y-1">
                    <p>{results.formula}</p>
                    {results.sheetAreaM2 != null && <p>Sheet area: {results.sheetAreaM2.toFixed(3)} m² · {results.plateKgPerM2?.toFixed(2)} kg/m²</p>}
                    {results.note && <p className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-accent-800" />{results.note}</p>}
                  </div>
                )}
              </MaterialSummary>

              {list.length > 0 && (
                <div className="mt-6 bg-surface-default rounded-2xl border border-ui-borderSubtle p-4 sm:p-6 shadow-brand-sm overflow-hidden print:hidden">
                  <h3 className="font-bold text-lg mb-3">Your List — running total {listTotalKg.toFixed(2)} kg</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                        <tr><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-right">kg/m</th><th className="px-3 py-2 text-right">Total kg</th><th className="px-3 py-2" /></tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {list.map((l) => (
                          <tr key={l.id}>
                            <td className="px-3 py-2">{l.label}</td>
                            <td className="px-3 py-2 text-center">{l.qty} × {l.pieceLengthM} m</td>
                            <td className="px-3 py-2 text-right">{l.weightPerM.toFixed(3)}</td>
                            <td className="px-3 py-2 text-right font-bold">{l.totalKg.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right">
                              <Button aria-label="Remove line" onClick={() => setList((prev) => prev.filter((x) => x.id !== l.id))} className="text-ui-errorText p-1 rounded-full"><Trash2 className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-txt-secondary mt-3">With {wastage}% wastage: {listOrderKg.toFixed(2)} kg ({(listOrderKg / 1000).toFixed(3)} t){rateNum != null ? ` · cost ${formatSteelMoney(listOrderKg * rateNum, currency)}` : " · cost — (enter a steel rate)"}.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface-default rounded-2xl border border-ui-borderSubtle p-4 sm:p-6 shadow-brand-sm overflow-hidden">
            <h3 className="font-bold text-lg mb-3">Rebar weight table (d²/162.28)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                  <tr><th className="px-3 py-2">Dia (mm)</th><th className="px-3 py-2 text-right">kg/m</th><th className="px-3 py-2 text-right">kg / 12 m bar</th><th className="px-3 py-2 text-right">kg / 40 ft bar</th></tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {BAR_WEIGHT_TABLE.map((r) => (
                    <tr key={r.diaMm}>
                      <td className="px-3 py-2 font-medium">Ø{r.diaMm}</td>
                      <td className="px-3 py-2 text-right">{r.kgPerM.toFixed(3)}</td>
                      <td className="px-3 py-2 text-right">{r.kgPer12m.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{r.kgPer40ft.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-surface-default rounded-2xl border border-ui-borderSubtle p-4 sm:p-6 shadow-brand-sm overflow-hidden">
            <h3 className="font-bold text-lg mb-3">Plate weight per m² (steel, 7.85 kg/m² per mm)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                  <tr><th className="px-3 py-2">Thickness (mm)</th><th className="px-3 py-2 text-right">kg/m²</th><th className="px-3 py-2">Thickness (mm)</th><th className="px-3 py-2 text-right">kg/m²</th></tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {[2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25].reduce<[number, number][]>((rows, t, i) => {
                    if (i % 2 === 0) rows.push([t, 0]);
                    else rows[rows.length - 1][1] = t;
                    return rows;
                  }, []).map(([a, b]) => (
                    <tr key={a}>
                      <td className="px-3 py-2 font-medium">{a}</td>
                      <td className="px-3 py-2 text-right">{(a * 7.85).toFixed(2)}</td>
                      <td className="px-3 py-2 font-medium">{b || "—"}</td>
                      <td className="px-3 py-2 text-right">{b ? (b * 7.85).toFixed(2) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Formula + FAQ — live here in the module (no CalculatorPageShell page is wired for this tool) */}
        <section aria-labelledby="metal-formula-heading" className="mt-12 bg-surface-default border border-border-color rounded-2xl p-6 md:p-8 shadow-brand-sm print:hidden">
          <h2 id="metal-formula-heading" className="text-2xl font-bold text-txt-primary mb-4">How metal weight is calculated</h2>
          <p className="text-txt-secondary leading-relaxed">
            Weight = area × length × density. A Ø20 round bar has an area of π×20²/4 = 314.16 mm²,
            so it weighs 314.16 ÷ 1,000,000 × 7,850 = 2.466 kg/m. A Ø100 × 5 mm pipe is
            (100 − 5) × 5 × 0.02466 = 11.71 kg/m. A 10 mm plate weighs 78.5 kg/m², so a
            2.5 × 1.25 m sheet weighs 245.31 kg. Rebar uses d²/162.28 kg/m. For rolled sections
            (I-beam, channel) the rectangle formula ignores fillets and root radii, so it
            under-reads — use the IS 808 tabulated kg/m from the standard-size picker for priced work.
          </p>
        </section>

        <CalculationHistory
          calculatorId="metal_weight_calculator_v1"
          currentInputs={{ activeProfile, pieceLength, qty, density }}
          currentResults={results ? { weight: `${results.weightPerM.toFixed(3)} kg/m`, totalWeight: `${results.totalKg.toFixed(2)} kg` } : {}}
          summaryGeneration={(inputs, res) => `${inputs.activeProfile} Weight: ${res.totalWeight}`}
          onRestore={(inputs) => {
            if (inputs.activeProfile) switchProfile(inputs.activeProfile as MetalProfile);
            if (inputs.pieceLength !== undefined) setPieceLength(String(inputs.pieceLength));
            if (inputs.qty !== undefined) setQty(String(inputs.qty));
          }}
        />
      </div>
    </div>
  );
}
