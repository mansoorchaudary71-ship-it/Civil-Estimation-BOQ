import { Button } from '../ui/Button';
import React, { useState, useMemo } from 'react';
import { Layers, Activity, AlertTriangle, CheckCircle, SlidersHorizontal, Download, Printer, FileText, Copy, Check, Wand2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";
import {
  SIEVE_SIZES,
  PRESET_LABELS,
  PRESET_BITUMEN,
  DEFAULT_STOCKPILES,
  DEFAULT_PROPORTIONS,
  blend,
  checkAgainstSpec,
  overallPass,
  rmseVsBandMid,
  solveProportions,
  JMF_TOLERANCE,
  calcMixQuantities,
  validateStockpiles,
  validateProportions,
  type MixPreset,
  type Proportions,
  type Stockpiles,
} from '../../lib/pavementMixCalc';
import { CalculationHistory } from '../ui/CalculationHistory';

// Client-side only: the old component POSTed to /api/tools/pavement-gradation,
// which does not exist on static GitHub Pages — the chart was always 0% and
// the table still said PASS. All blending now runs in this file via the
// engine (src/lib/pavementMixCalc.ts). Envelopes are MoRTH, verbatim.

const PRESET_IDS = Object.keys(PRESET_LABELS) as MixPreset[];
const PILE_KEYS = ["aggA", "aggB", "aggC", "filler"] as const;
const PILE_LABELS: Record<typeof PILE_KEYS[number], string> = {
  aggA: "Agg A (Coarse)",
  aggB: "Agg B (Intermediate)",
  aggC: "Agg C (Fine/Dust)",
  filler: "Filler",
};

export function PavementMixGradation() {
  const [preset, setPreset] = useState<MixPreset>('dbm-1');
  const [props, setProps] = useState<Proportions>({ ...DEFAULT_PROPORTIONS });
  const [stockpiles, setStockpiles] = useState<Stockpiles>({
    aggA: [...DEFAULT_STOCKPILES.aggA],
    aggB: [...DEFAULT_STOCKPILES.aggB],
    aggC: [...DEFAULT_STOCKPILES.aggC],
    filler: [...DEFAULT_STOCKPILES.filler],
  });
  const [bitumenPct, setBitumenPct] = useState<string>(String(PRESET_BITUMEN["dbm-1"].typical));
  const [bitumenEdited, setBitumenEdited] = useState(false);
  const [areaM2, setAreaM2] = useState<string>("");
  const [thicknessMm, setThicknessMm] = useState<string>("50");
  const [copied, setCopied] = useState(false);

  // ---- Engine (one source of truth; same rows feed chart + table) ----
  const blended = useMemo(() => blend(props, stockpiles), [props, stockpiles]);
  const checks = useMemo(() => checkAgainstSpec(blended, preset), [blended, preset]);
  const allPass = useMemo(() => overallPass(checks), [checks]);
  const rmse = useMemo(() => rmseVsBandMid(blended, preset), [blended, preset]);
  const errors = useMemo(
    () => [...validateStockpiles(stockpiles), ...validateProportions(props)],
    [stockpiles, props],
  );
  const quantities = useMemo(() => {
    const area = parseFloat(areaM2);
    const thick = parseFloat(thicknessMm);
    const bit = parseFloat(bitumenPct);
    if (!(area > 0) || !(thick > 0)) return null;
    return calcMixQuantities(area, thick, Number.isFinite(bit) ? bit : 0, props);
  }, [areaM2, thicknessMm, bitumenPct, props]);

  // Proportions always sum to 100: A and B are sliders, filler is a slider,
  // C is the remainder (shown, not a slider).
  const setPropA = (v: number) => {
    const a = Math.min(Math.max(0, v), 100 - props.filler);
    const b = Math.min(props.aggB, 100 - props.filler - a);
    setProps({ ...props, aggA: a, aggB: b, aggC: 100 - props.filler - a - b });
  };
  const setPropB = (v: number) => {
    const b = Math.min(Math.max(0, v), 100 - props.filler - props.aggA);
    setProps({ ...props, aggB: b, aggC: 100 - props.filler - props.aggA - b });
  };
  const setFiller = (v: number) => {
    const f = Math.min(Math.max(0, v), 10);
    const a = Math.min(props.aggA, 100 - f);
    const b = Math.min(props.aggB, 100 - f - a);
    setProps({ ...props, filler: f, aggA: a, aggB: b, aggC: 100 - f - a - b });
  };
  const setPresetAndBitumen = (p: MixPreset) => {
    setPreset(p);
    if (!bitumenEdited) setBitumenPct(String(PRESET_BITUMEN[p].typical));
  };
  const autoBlend = () => {
    const solved = solveProportions(stockpiles, preset, props.filler);
    setProps(solved.proportions);
  };
  const updateStockpile = (key: typeof PILE_KEYS[number], i: number, v: string) => {
    const n = parseFloat(v);
    setStockpiles((prev) => {
      const next = { ...prev, [key]: [...prev[key]] };
      next[key][i] = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
      return next;
    });
  };

  // One canonical row order (descending sieve size) for chart AND table.
  const chartData = checks.map((c) => ({
    sieve: c.sieve,
    blended: c.blended,
    min: c.min,
    max: c.max,
    status: c.status,
  }));

  const summaryText = () => [
    `Pavement Mix & Aggregate Gradation — ${PRESET_LABELS[preset]}`,
    `Proportions: A ${props.aggA}% · B ${props.aggB}% · C ${props.aggC}% · Filler ${props.filler}%`,
    `Overall: ${allPass ? "PASS" : "FAIL"} · RMSE vs band mid: ${rmse.toFixed(2)} percentage points`,
    ...checks.map((c) =>
      `${c.sieve} mm: ${c.blended.toFixed(1)}% (spec ${c.min ?? "—"}–${c.max ?? "—"}) ${c.status === null ? "—" : c.status.toUpperCase()}`,
    ),
    preset !== "gsb-i" ? `Bitumen content: ${bitumenPct}% (MoRTH minimum ${PRESET_BITUMEN[preset].min}%)` : "GSB — unbound, no bitumen.",
    quantities
      ? `Mix for ${areaM2} m² × ${thicknessMm} mm: ${quantities.totalTonnes.toFixed(1)} t total · bitumen ${quantities.bitumenKg.toFixed(0)} kg · filler ${quantities.fillerKg.toFixed(0)} kg · A ${quantities.aggTonnes.aggA.toFixed(1)} t · B ${quantities.aggTonnes.aggB.toFixed(1)} t · C ${quantities.aggTonnes.aggC.toFixed(1)} t`
      : "",
    "Disclaimer: planning estimate only — confirm the job mix formula with your laboratory and the project specifications.",
  ].filter(Boolean).join("\n");

  const copyResults = async () => {
    try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const downloadCsv = () => {
    const header = "Sieve (mm),Blended % passing,Lower bound,Upper bound,Status\n";
    const body = checks.map((c) => `${c.sieve},${c.blended.toFixed(1)},${c.min ?? ""},${c.max ?? ""},${c.status ?? "—"}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pavement-mix-${preset}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const downloadPdf = () => {
    const doc = new jsPDF();
    const lines = summaryText().split("\n");
    doc.setFontSize(16);
    doc.text("Pavement Mix & Aggregate Gradation", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · Civil Estimation Pro`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of lines.slice(1)) {
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 8;
    }
    doc.save(`pavement-mix-${preset}.pdf`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-default border border-ui-borderSubtle p-3 shadow-brand-lg rounded-xl">
          <p className="font-bold text-txt-primary text-sm mb-1">Sieve: {label} mm</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value !== null ? entry.value.toFixed(1) + '%' : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-100 text-accent-800">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-txt-primary">Pavement Mix &amp; Aggregate Gradation Calculator (MoRTH GSB / DBM / SMA)</h2>
              <p className="text-txt-secondary text-sm">Blend aggregate proportions and verify against MoRTH specification envelopes. All blending runs in your browser — no server.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={preset}
              onChange={(e) => setPresetAndBitumen(e.target.value as MixPreset)}
              className="bg-surface-hover border border-ui-borderSubtle text-txt-primary text-sm rounded-lg focus:ring-accent-500 focus:border-ink block px-4 py-2 font-medium"
            >
              {PRESET_IDS.map((p) => (
                <option key={p} value={p}>{PRESET_LABELS[p]}</option>
              ))}
            </select>

            <div className="h-8 w-px bg-surface-active mx-1 hidden sm:block"></div>

            <Button onClick={downloadCsv} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700 transition-colors shadow-brand-sm">
              <Download size={16} /> Export CSV
            </Button>
            <Button onClick={downloadPdf} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700 transition-colors shadow-brand-sm">
              <FileText size={16} /> PDF
            </Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-primary bg-surface-hover border border-ui-borderSubtle rounded-lg hover:bg-surface-active transition-colors shadow-brand-sm">
              <Printer size={16} /> Print
            </Button>
            <Button onClick={copyResults} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-primary bg-surface-hover border border-ui-borderSubtle rounded-lg hover:bg-surface-active transition-colors shadow-brand-sm">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4" role="alert">
          <p className="font-bold text-ui-errorText">Check your inputs</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-ui-errorText space-y-1">
            {errors.map((e, i) => (<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
            <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-accent-800" />
              Blending Proportions
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-txt-secondary">
                  <span>Aggregate A (Coarse)</span>
                  <span>{props.aggA}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={props.aggA}
                  onChange={(e) => setPropA(Number(e.target.value))}
                  className="w-full h-2 bg-surface-active rounded-lg appearance-none cursor-pointer accent-accent-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-txt-secondary">
                  <span>Aggregate B (Intermediate)</span>
                  <span>{props.aggB}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={props.aggB}
                  onChange={(e) => setPropB(Number(e.target.value))}
                  className="w-full h-2 bg-surface-active rounded-lg appearance-none cursor-pointer accent-accent-600"
                />
              </div>

              <div className="space-y-2 opacity-70">
                <div className="flex justify-between text-sm font-medium text-txt-secondary">
                  <span>Aggregate C (Fine/Dust) — remainder</span>
                  <span>{props.aggC}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={props.aggC}
                  readOnly
                  className="w-full h-2 bg-surface-active rounded-lg appearance-none cursor-not-allowed accent-accent-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-txt-secondary">
                  <span>Filler (mineral)</span>
                  <span>{props.filler}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="10" step="1"
                  value={props.filler}
                  onChange={(e) => setFiller(Number(e.target.value))}
                  className="w-full h-2 bg-surface-active rounded-lg appearance-none cursor-pointer accent-accent-600"
                />
                <p className="text-xs text-txt-tertiary">Filler is the 4th bin (0–10%). Proportions always sum to 100%.</p>
              </div>
            </div>

            <Button onClick={autoBlend} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-50 text-accent-800 text-sm font-semibold rounded-full hover:bg-accent-100">
              <Wand2 size={16} /> Auto-blend (best fit to the spec envelope)
            </Button>

            {/* Status Display */}
            <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 ${allPass ? 'bg-ui-success border-ui-successBorder' : 'bg-ui-error border-ui-errorBorder'}`}>
              {allPass ? <CheckCircle size={24} className="text-ui-successText flex-shrink-0" /> : <AlertTriangle size={24} className="text-ui-errorText flex-shrink-0" />}
              <div>
                <h3 className={`text-sm font-bold ${allPass ? 'text-ui-successText' : 'text-ui-errorText'}`}>
                  {allPass ? 'Mix Passes Specifications' : 'Mix Fails Specifications'}
                </h3>
                <p className={`text-xs mt-1 ${allPass ? 'text-ui-successText' : 'text-ui-errorText'}`}>
                  {allPass
                    ? 'The blended aggregate falls within the upper and lower bounds for all specified sieve sizes.'
                    : 'Adjust the proportions. The blend is outside the specification envelope for one or more sieve sizes.'}
                </p>
                <p className="text-xs mt-2 text-txt-secondary">RMSE vs band mid: {rmse.toFixed(2)} percentage points (lower is closer to the middle of every band).</p>
              </div>
            </div>

            {/* Bitumen + quantities */}
            {preset !== "gsb-i" ? (
              <div className="space-y-4 pt-2 border-t border-ui-borderSubtle">
                <div>
                  <label className="text-sm font-bold text-txt-secondary block mb-1">Bitumen content (% of mix)</label>
                  <input
                    type="number" inputMode="decimal" min="0" step="0.1"
                    value={bitumenPct}
                    onChange={(e) => { setBitumenPct(e.target.value); setBitumenEdited(true); }}
                    className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl px-3 py-2.5 text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 text-base"
                  />
                  <p className="text-xs text-txt-tertiary mt-1">MoRTH minimum {PRESET_BITUMEN[preset].min}% · typical {PRESET_BITUMEN[preset].typical}% for {PRESET_LABELS[preset].split(" (")[0]}.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-bold text-txt-secondary block mb-1">Area (m²)</label>
                    <input
                      type="number" inputMode="decimal" min="0"
                      placeholder="e.g. 1000"
                      value={areaM2}
                      onChange={(e) => setAreaM2(e.target.value)}
                      className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl px-3 py-2.5 text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-txt-secondary block mb-1">Layer thickness (mm)</label>
                    <input
                      type="number" inputMode="decimal" min="0"
                      value={thicknessMm}
                      onChange={(e) => setThicknessMm(e.target.value)}
                      className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl px-3 py-2.5 text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 text-base"
                    />
                  </div>
                </div>
                {quantities && (
                  <dl className="text-sm space-y-1.5">
                    <div className="flex justify-between"><dt className="text-txt-secondary">Total mix</dt><dd className="font-bold">{quantities.totalTonnes.toFixed(1)} t</dd></div>
                    <div className="flex justify-between"><dt className="text-txt-secondary">Bitumen</dt><dd className="font-bold">{quantities.bitumenKg.toFixed(0)} kg</dd></div>
                    <div className="flex justify-between"><dt className="text-txt-secondary">Filler</dt><dd className="font-bold">{quantities.fillerKg.toFixed(0)} kg</dd></div>
                    <div className="flex justify-between"><dt className="text-txt-secondary">Agg A</dt><dd className="font-bold">{quantities.aggTonnes.aggA.toFixed(1)} t</dd></div>
                    <div className="flex justify-between"><dt className="text-txt-secondary">Agg B</dt><dd className="font-bold">{quantities.aggTonnes.aggB.toFixed(1)} t</dd></div>
                    <div className="flex justify-between"><dt className="text-txt-secondary">Agg C</dt><dd className="font-bold">{quantities.aggTonnes.aggC.toFixed(1)} t</dd></div>
                    <p className="text-xs text-txt-tertiary pt-1">Density 2.35 t/m³ (compacted). Enter an area to see quantities.</p>
                  </dl>
                )}
              </div>
            ) : (
              <p className="text-sm text-txt-secondary pt-2 border-t border-ui-borderSubtle">GSB is an unbound granular base — no bitumen content applies.</p>
            )}
          </div>

          <div className="bg-surface-hover border border-ui-borderSubtle p-4 rounded-2xl flex gap-3 text-sm text-txt-secondary">
            <Activity size={20} className="text-txt-tertiary flex-shrink-0" />
            <p>
              The chart uses a logarithmic sieve axis, as in standard highway gradation charts. Sieve sizes are the fixed MoRTH set — no custom sieves, so the stockpile grid, the spec envelope and the table can never drift out of alignment.
            </p>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-default rounded-2xl p-6 shadow-brand-sm border border-ui-borderSubtle h-[500px] flex flex-col relative">
            <h2 className="text-lg font-bold text-txt-primary mb-6 flex items-center gap-2">
              <Activity size={20} className="text-accent-800" />
              Gradation Curve
            </h2>

            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" vertical={true} horizontal={true} />
                  <XAxis
                    dataKey="sieve"
                    type="number"
                    scale="log"
                    domain={[0.075, 75]}
                    tickFormatter={(val) => val.toString()}
                    label={{ value: 'Sieve Size (mm) [Log Scale]', position: 'insideBottom', offset: -10 }}
                    stroke="#6B6862"
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Percent Passing (%)', angle: -90, position: 'insideLeft' }}
                    stroke="#6B6862"
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />

                  {/* Min Spec Line */}
                  <Line
                    type="monotone"
                    dataKey="min"
                    name="Lower Spec"
                    stroke="#1F1D1A"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    connectNulls
                    dot={false}
                  />
                  {/* Max Spec Line */}
                  <Line
                    type="monotone"
                    dataKey="max"
                    name="Upper Spec"
                    stroke="#B07006"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    connectNulls
                    dot={false}
                  />
                  {/* Blended Line */}
                  <Line
                    type="monotone"
                    dataKey="blended"
                    name="Blended Mix"
                    stroke="#F2A413"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stockpile gradings */}
          <div className="bg-surface-default rounded-2xl p-6 shadow-brand-sm border border-ui-borderSubtle">
            <h3 className="text-lg font-bold text-txt-primary mb-1">Stockpile gradings — % passing each sieve</h3>
            <p className="text-sm text-txt-secondary mb-4">Edit any cell. % passing must not rise as the sieve gets finer (the validator flags it above).</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-ui-borderSubtle text-txt-tertiary">
                    <th className="pb-3 px-2 font-medium">Sieve (mm)</th>
                    {PILE_KEYS.map((k) => (
                      <th key={k} className="pb-3 px-2 font-medium">{PILE_LABELS[k]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIEVE_SIZES.map((sieve, i) => (
                    <tr key={sieve} className="border-b border-ui-borderSubtle/50 last:border-0">
                      <td className="py-2 px-2 font-medium text-txt-primary">{sieve}</td>
                      {PILE_KEYS.map((k) => (
                        <td key={k} className="py-2 px-2">
                          <input
                            type="number" inputMode="decimal" min="0" max="100" step="1"
                            aria-label={`${PILE_LABELS[k]} % passing ${sieve} mm`}
                            value={stockpiles[k][i]}
                            onChange={(e) => updateStockpile(k, i, e.target.value)}
                            className="w-20 bg-surface-hover border border-ui-borderSubtle rounded-lg px-2 py-1.5 text-txt-primary text-sm outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-ink rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-sm font-bold text-[#948D82] mb-4 uppercase tracking-wider">Calculation Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-[#948D82]">
                    <th className="pb-3 px-2 font-medium">Sieve (mm)</th>
                    <th className="pb-3 px-2 font-medium">Lower Bound</th>
                    <th className="pb-3 px-2 font-medium">Combined Mix</th>
                    <th className="pb-3 px-2 font-medium">Upper Bound</th>
                    <th className="pb-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.sieve} className="border-b border-white/5 last:border-0 hover:bg-surface-default/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-txt-inverse">{row.sieve}</td>
                      <td className="py-3 px-2 text-[#948D82]">
                        {row.min !== null ? row.min : '-'}
                      </td>
                      <td className="py-3 px-2 font-bold text-accent-400">{row.blended.toFixed(1)}%</td>
                      <td className="py-3 px-2 text-[#948D82]">
                        {row.max !== null ? row.max : '-'}
                      </td>
                      <td className="py-3 px-2">
                        {row.status === null ? (
                          <span className="text-[#948D82]">—</span>
                        ) : row.status === 'pass' ? (
                          <span className="inline-flex items-center gap-1 text-[#6EE7B7] bg-ui-successText/10 px-2 py-0.5 rounded text-xs font-bold">
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#FCA5A5] bg-ui-errorText/10 px-2 py-0.5 rounded text-xs font-bold">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* JMF tolerances */}
          <div className="bg-surface-default rounded-2xl p-6 shadow-brand-sm border border-ui-borderSubtle">
            <h3 className="text-lg font-bold text-txt-primary mb-1">Job Mix Formula (JMF) — target &amp; tolerance</h3>
            <p className="text-sm text-txt-secondary mb-4">The blended curve is the JMF target. MoRTH tolerances are the allowed deviation from it during production.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-ui-borderSubtle text-txt-tertiary">
                    <th className="pb-3 px-2 font-medium">Sieve (mm)</th>
                    <th className="pb-3 px-2 font-medium">JMF target</th>
                    <th className="pb-3 px-2 font-medium">Tolerance (±pp)</th>
                    <th className="pb-3 px-2 font-medium">Allowed range</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => {
                    const tol = JMF_TOLERANCE[row.sieve];
                    return (
                      <tr key={row.sieve} className="border-b border-ui-borderSubtle/50 last:border-0">
                        <td className="py-2 px-2 font-medium text-txt-primary">{row.sieve}</td>
                        <td className="py-2 px-2 font-bold text-txt-primary">{row.blended.toFixed(1)}%</td>
                        <td className="py-2 px-2 text-txt-secondary">{tol != null ? `±${tol}` : "—"}</td>
                        <td className="py-2 px-2 text-txt-secondary">
                          {tol != null ? `${Math.max(0, row.blended - tol).toFixed(1)}% – ${Math.min(100, row.blended + tol).toFixed(1)}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="pavement_mix" currentInputs={{preset, props, stockpiles, bitumenPct, bitumenEdited, areaM2, thicknessMm}} currentResults={{ allPass, rmse, totalTonnes: quantities?.totalTonnes, bitumenKg: quantities?.bitumenKg }} onRestore={(ins) => {
          if (ins.preset != null) setPreset(ins.preset as typeof preset);
          if (ins.props != null) setProps(ins.props as typeof props);
          if (ins.stockpiles != null) setStockpiles(ins.stockpiles as typeof stockpiles);
          if (ins.bitumenPct != null) setBitumenPct(ins.bitumenPct as typeof bitumenPct);
          if (ins.bitumenEdited != null) setBitumenEdited(ins.bitumenEdited as typeof bitumenEdited);
          if (ins.areaM2 != null) setAreaM2(ins.areaM2 as typeof areaM2);
          if (ins.thicknessMm != null) setThicknessMm(ins.thicknessMm as typeof thicknessMm);
        }} />
    </div>
  );
}
