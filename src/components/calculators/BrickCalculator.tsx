import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  BRICK_PRESETS,
  THICKNESS_PRESETS,
  calcBrickwork,
  formatInt,
  formatMoney,
  CURRENCY_META,
  type BrickInputs,
  type BrickPreset,
  type Currency,
  type OpeningInput,
} from "../../lib/brickCalc";
import { ResultCard } from "../ui/ResultCard";
import {
  Calculator,
  Check,
  Copy,
  Download,
  Info,
  Layers,
  Plus,
  Printer,
  Share2,
  Trash2,
} from "lucide-react";

const MIX_PRESETS: { id: string; label: string; mix: [number, number] }[] = [
  { id: "1:3", label: "1:3 — load-bearing", mix: [1, 3] },
  { id: "1:4", label: "1:4 — general (standard)", mix: [1, 4] },
  { id: "1:6", label: "1:6 — partitions / lean", mix: [1, 6] },
  { id: "custom", label: "Custom mix", mix: [1, 4] },
];

/** Generic indicative defaults per currency (Nov 2026). City pages override these. */
export const DEFAULT_RATES: Record<
  Currency,
  { brickPer1000: number | null; cementPerBag: number | null; sandPerUnit: number | null }
> = {
  PKR: { brickPer1000: 20000, cementPerBag: 1550, sandPerUnit: 50 },
  INR: { brickPer1000: 10000, cementPerBag: 400, sandPerUnit: 80 },
  AED: { brickPer1000: null, cementPerBag: 25, sandPerUnit: null },
};

export interface BrickCalculatorProps {
  /** Prefill from a programmatic variant (city / type / size page). */
  initial?: Partial<BrickInputs> & { ratesNote?: string };
  /** Note shown under the rates (source + date). */
  ratesNote?: string;
}

const inputCls =
  "w-full bg-bg-card/80 border border-ui-borderSubtle dark:border-slate-700 text-txt-primary dark:text-white rounded-full px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-orange-300 shadow-sm transition-all";
const labelCls =
  "block uppercase tracking-widest text-sm font-medium text-txt-secondary mb-2";
const selectCls =
  "w-full appearance-none bg-bg-card/80 border border-ui-borderSubtle dark:border-slate-700 text-txt-primary dark:text-white rounded-2xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-orange-300 shadow-sm transition-all cursor-pointer font-semibold";

let openingSeq = 0;
const newOpening = (kind: OpeningInput["kind"]): OpeningInput => ({
  id: `op-${++openingSeq}-${Date.now()}`,
  kind,
  length: kind === "door" ? 3 : 4,
  height: kind === "door" ? 7 : 4,
  count: 1,
});

export default function BrickCalculator({ initial, ratesNote }: BrickCalculatorProps) {
  const [lengthUnit, setLengthUnit] = useState<"m" | "ft">(initial?.lengthUnit ?? "ft");
  const [length, setLength] = useState<string>(String(initial?.length ?? 10));
  const [height, setHeight] = useState<string>(String(initial?.height ?? 10));
  const [thicknessId, setThicknessId] = useState<string>("t230");
  const [thicknessMm, setThicknessMm] = useState<string>(
    String(initial?.thicknessMm ?? 230),
  );
  const [openings, setOpenings] = useState<OpeningInput[]>(initial?.openings ?? []);
  const [brickId, setBrickId] = useState<string>(initial?.brick?.id ?? "pk-awwal");
  const [customBrick, setCustomBrick] = useState({ l: 230, w: 110, h: 75 });
  const [jointMm, setJointMm] = useState<string>("10");
  const [wastagePct, setWastagePct] = useState<string>("5");
  const [mixId, setMixId] = useState<string>("1:4");
  const [cementParts, setCementParts] = useState<string>("1");
  const [sandParts, setSandParts] = useState<string>("4");
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? "PKR");
  const [brickPrice, setBrickPrice] = useState<string>(
    initial?.rates?.brickPer1000 != null ? String(initial.rates.brickPer1000) : "",
  );
  const [cementPrice, setCementPrice] = useState<string>(
    initial?.rates?.cementPerBag != null ? String(initial.rates.cementPerBag) : "",
  );
  const [sandPrice, setSandPrice] = useState<string>(
    initial?.rates?.sandPerUnit != null ? String(initial.rates.sandPerUnit) : "",
  );
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const brick: BrickPreset =
    BRICK_PRESETS.find((p) => p.id === brickId) ?? BRICK_PRESETS[0];

  const results = useMemo(() => {
    const inputs: BrickInputs = {
      length: parseFloat(length) || 0,
      height: parseFloat(height) || 0,
      lengthUnit,
      thicknessMm: parseFloat(thicknessMm) || 0,
      openings,
      brick,
      customBrick: brickId === "custom" ? customBrick : undefined,
      jointMm: parseFloat(jointMm) || 0,
      wastagePct: parseFloat(wastagePct) || 0,
      mix: [parseFloat(cementParts) || 1, parseFloat(sandParts) || 4],
      currency,
      rates: {
        brickPer1000: brickPrice === "" ? null : parseFloat(brickPrice) || null,
        cementPerBag: cementPrice === "" ? null : parseFloat(cementPrice) || null,
        sandPerUnit: sandPrice === "" ? null : parseFloat(sandPrice) || null,
      },
    };
    return calcBrickwork(inputs);
  }, [
    length,
    height,
    lengthUnit,
    thicknessMm,
    openings,
    brick,
    brickId,
    customBrick,
    jointMm,
    wastagePct,
    cementParts,
    sandParts,
    currency,
    brickPrice,
    cementPrice,
    sandPrice,
  ]);

  const onCurrencyChange = (c: Currency) => {
    setCurrency(c);
    const d = DEFAULT_RATES[c];
    setBrickPrice(d.brickPer1000 != null ? String(d.brickPer1000) : "");
    setCementPrice(d.cementPerBag != null ? String(d.cementPerBag) : "");
    setSandPrice(d.sandPerUnit != null ? String(d.sandPerUnit) : "");
  };

  const onThicknessChange = (id: string) => {
    setThicknessId(id);
    const preset = THICKNESS_PRESETS.find((t) => t.id === id);
    if (preset && id !== "tcustom") setThicknessMm(String(preset.mm));
  };

  const summaryText = () => {
    const unit = lengthUnit === "ft" ? "ft" : "m";
    const lines = [
      `Brick estimate — Civil Estimation Pro`,
      `Wall: ${length} × ${height} ${unit}, ${thicknessMm} mm thick (${brick.label})`,
      `Bricks: ${formatInt(results.bricks)} pcs (${formatInt(results.bricksBeforeWastage)} before ${wastagePct}% wastage)`,
      `Cement: ${results.cementBags} bags (50 kg)`,
      `Sand: ${results.sandCft.toFixed(1)} cft (${results.sandM3.toFixed(2)} m³)`,
      `Mortar: ${results.dryMortarM3.toFixed(2)} m³ dry (${mixId} mix)`,
    ];
    if (results.totalCost != null)
      lines.push(`Estimated material cost: ${formatMoney(results.totalCost, currency)}`);
    lines.push(`Rates are indicative — confirm with your supplier.`);
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can use the share button instead */
    }
  };

  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Brick estimate — Civil Estimation Pro", text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        /* user cancelled the share sheet — fall through to copy */
      }
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
    doc.text("Brick Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · ${ratesNote ?? "Indicative rates — confirm with your supplier."}`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of lines.slice(1)) {
      doc.text(line, 14, y);
      y += 8;
    }
    doc.setFontSize(9);
    doc.text(
      "Disclaimer: planning estimate only — confirm the final order with your quantity surveyor or contractor.",
      14,
      y + 8,
      { maxWidth: 180 },
    );
    doc.save("brick-estimate-civil-estimation-pro.pdf");
  };

  const sandUnit = CURRENCY_META[currency].sandUnit;
  const thicknessPreset = THICKNESS_PRESETS.find((t) => t.id === thicknessId);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-start">
        {/* Inputs */}
        <div className="space-y-8">
          <section aria-label="Wall dimensions">
            <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Wall dimensions
            </h3>
            <div className="flex gap-2 mb-4" role="group" aria-label="Length unit">
              {(["m", "ft"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setLengthUnit(u)}
                  aria-pressed={lengthUnit === u}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    lengthUnit === u
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-blue-300"
                  }`}
                >
                  {u === "m" ? "Metres (m)" : "Feet (ft)"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="brick-wall-length" className={labelCls}>
                  Length ({lengthUnit})
                </label>
                <input
                  id="brick-wall-length"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={inputCls}
                  placeholder={lengthUnit === "ft" ? "e.g. 10" : "e.g. 3"}
                />
              </div>
              <div>
                <label htmlFor="brick-wall-height" className={labelCls}>
                  Height ({lengthUnit})
                </label>
                <input
                  id="brick-wall-height"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputCls}
                  placeholder={lengthUnit === "ft" ? "e.g. 10" : "e.g. 3"}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="brick-thickness" className={labelCls}>
                Wall thickness
              </label>
              <select
                id="brick-thickness"
                value={thicknessId}
                onChange={(e) => onThicknessChange(e.target.value)}
                className={selectCls}
              >
                {THICKNESS_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.use}
                  </option>
                ))}
              </select>
              {thicknessId === "tcustom" && (
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={thicknessMm}
                  onChange={(e) => setThicknessMm(e.target.value)}
                  className={`${inputCls} mt-3`}
                  aria-label="Custom wall thickness in millimetres"
                  placeholder="Thickness in mm, e.g. 230"
                />
              )}
              {thicknessPreset && thicknessId !== "tcustom" && (
                <p className="text-sm text-txt-tertiary mt-2">
                  {thicknessPreset.mm} mm thick — {thicknessPreset.use}.
                </p>
              )}
            </div>
          </section>

          <section aria-label="Openings">
            <h3 className="text-txt-primary dark:text-white mb-2 flex items-center gap-2 text-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Openings — doors &amp; windows
            </h3>
            <p className="text-sm text-txt-tertiary mb-4">
              Deducted from the wall area. A door or window is a hole, not brickwork.
            </p>
            {openings.length === 0 && (
              <p className="text-sm text-txt-secondary bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-3">
                No openings yet — the full wall is counted as brickwork.
              </p>
            )}
            <div className="space-y-3">
              {openings.map((op, i) => (
                <div
                  key={op.id}
                  className="grid grid-cols-12 gap-2 items-end bg-bg-card/60 border border-ui-borderSubtle rounded-2xl p-3"
                >
                  <div className="col-span-3">
                    <label className={labelCls} htmlFor={`op-kind-${op.id}`}>
                      Type
                    </label>
                    <select
                      id={`op-kind-${op.id}`}
                      value={op.kind}
                      onChange={(e) =>
                        setOpenings((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, kind: e.target.value as OpeningInput["kind"] } : p,
                          ),
                        )
                      }
                      className={selectCls}
                    >
                      <option value="door">Door</option>
                      <option value="window">Window</option>
                      <option value="other">Opening</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className={labelCls} htmlFor={`op-len-${op.id}`}>
                      Length ({lengthUnit})
                    </label>
                    <input
                      id={`op-len-${op.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={op.length}
                      onChange={(e) =>
                        setOpenings((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, length: parseFloat(e.target.value) || 0 } : p,
                          ),
                        )
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className={labelCls} htmlFor={`op-h-${op.id}`}>
                      Height ({lengthUnit})
                    </label>
                    <input
                      id={`op-h-${op.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={op.height}
                      onChange={(e) =>
                        setOpenings((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, height: parseFloat(e.target.value) || 0 } : p,
                          ),
                        )
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls} htmlFor={`op-n-${op.id}`}>
                      Count
                    </label>
                    <input
                      id={`op-n-${op.id}`}
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={op.count}
                      onChange={(e) =>
                        setOpenings((prev) =>
                          prev.map((p, j) =>
                            j === i ? { ...p, count: parseInt(e.target.value, 10) || 1 } : p,
                          ),
                        )
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenings((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove opening"
                      className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => setOpenings((prev) => [...prev, newOpening("door")])}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add door (3 × 7 {lengthUnit})
              </button>
              <button
                type="button"
                onClick={() => setOpenings((prev) => [...prev, newOpening("window")])}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-blue-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add window (4 × 4 {lengthUnit})
              </button>
            </div>
          </section>

          <section aria-label="Brick and mortar">
            <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Brick &amp; mortar
            </h3>
            <label htmlFor="brick-preset" className={labelCls}>
              Brick size
            </label>
            <select
              id="brick-preset"
              value={brickId}
              onChange={(e) => setBrickId(e.target.value)}
              className={selectCls}
            >
              {BRICK_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-txt-tertiary mt-2">
              {brick.standard}. {brick.note}
            </p>
            {brickId === "custom" && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {(["l", "w", "h"] as const).map((dim) => (
                  <div key={dim}>
                    <label htmlFor={`brick-custom-${dim}`} className={labelCls}>
                      {dim === "l" ? "Length" : dim === "w" ? "Width" : "Height"} (mm)
                    </label>
                    <input
                      id={`brick-custom-${dim}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={customBrick[dim]}
                      onChange={(e) =>
                        setCustomBrick((prev) => ({
                          ...prev,
                          [dim]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="brick-joint" className={labelCls}>
                  Mortar joint (mm)
                </label>
                <input
                  id="brick-joint"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={jointMm}
                  onChange={(e) => setJointMm(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="brick-wastage" className={labelCls}>
                  Wastage (%)
                </label>
                <input
                  id="brick-wastage"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="50"
                  value={wastagePct}
                  onChange={(e) => setWastagePct(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="brick-mix" className={labelCls}>
                Mortar mix (cement : sand)
              </label>
              <select
                id="brick-mix"
                value={mixId}
                onChange={(e) => {
                  const id = e.target.value;
                  setMixId(id);
                  const preset = MIX_PRESETS.find((m) => m.id === id);
                  if (preset && id !== "custom") {
                    setCementParts(String(preset.mix[0]));
                    setSandParts(String(preset.mix[1]));
                  }
                }}
                className={selectCls}
              >
                {MIX_PRESETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              {mixId === "custom" && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label htmlFor="brick-cement-parts" className={labelCls}>
                      Cement parts
                    </label>
                    <input
                      id="brick-cement-parts"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={cementParts}
                      onChange={(e) => setCementParts(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="brick-sand-parts" className={labelCls}>
                      Sand parts
                    </label>
                    <input
                      id="brick-sand-parts"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={sandParts}
                      onChange={(e) => setSandParts(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <section aria-label="Currency and rates">
            <h3 className="text-txt-primary dark:text-white mb-4 flex items-center gap-2 text-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Currency &amp; rates
            </h3>
            <div className="flex gap-2 mb-4" role="group" aria-label="Currency">
              {(["PKR", "INR", "AED"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCurrencyChange(c)}
                  aria-pressed={currency === c}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    currency === c
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-bg-card border-ui-borderSubtle text-txt-secondary hover:border-amber-400"
                  }`}
                >
                  {c} ({CURRENCY_META[c].symbol})
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="brick-price" className={labelCls}>
                  Brick ({currency} / 1,000)
                </label>
                <input
                  id="brick-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={brickPrice}
                  onChange={(e) => setBrickPrice(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 20000"
                />
              </div>
              <div>
                <label htmlFor="cement-price" className={labelCls}>
                  Cement ({currency} / bag)
                </label>
                <input
                  id="cement-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={cementPrice}
                  onChange={(e) => setCementPrice(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 1550"
                />
              </div>
              <div>
                <label htmlFor="sand-price" className={labelCls}>
                  Sand ({currency} / {sandUnit})
                </label>
                <input
                  id="sand-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={sandPrice}
                  onChange={(e) => setSandPrice(e.target.value)}
                  className={inputCls}
                  placeholder={sandUnit === "cft" ? "e.g. 50" : "e.g. 1800"}
                />
              </div>
            </div>
            <p className="text-sm text-txt-tertiary mt-3 flex gap-1.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {ratesNote ??
                  "Rates are indicative November 2026 defaults. Enter your supplier's actual rates for an exact cost — leave a field blank to skip that cost."}
              </span>
            </p>
          </section>
        </div>

        {/* Results */}
        <div className="relative flex flex-col h-full">
          <div className="sticky top-6 flex flex-col flex-1">
            <div className="bg-bg-card border border-ui-borderSubtle dark:border-slate-700 rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 md:px-8 py-5 border-b border-ui-borderSubtle dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-txt-primary dark:text-white text-lg font-medium">
                      Your brick estimate
                    </h3>
                    <p className="text-sm text-txt-secondary">
                      Instant results — updates as you type.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 border border-ui-borderSubtle text-txt-secondary text-xs font-medium uppercase tracking-wider rounded-full">
                  {currency}
                </span>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <ResultCard
                  title="Total bricks to order"
                  value={formatInt(results.bricks)}
                  unit="pcs"
                  variant="primary"
                  icon={<Layers className="w-5 h-5 text-blue-500" />}
                  description={`${formatInt(results.bricksBeforeWastage)} before ${wastagePct}% wastage · ${results.bricksPerSqFt.toFixed(1)} per sq ft of wall`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard
                    title="Cement"
                    value={results.cementBags}
                    unit="bags (50 kg)"
                    variant="secondary"
                    description={`${results.dryMortarM3.toFixed(2)} m³ dry mortar`}
                  />
                  <ResultCard
                    title="Sand"
                    value={results.sandCft.toFixed(1)}
                    unit="cft"
                    variant="warning"
                    description={`${results.sandM3.toFixed(2)} m³`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard
                    title="Net wall area"
                    value={results.netAreaM2.toFixed(2)}
                    unit="m²"
                    variant="neutral"
                    description={`Gross ${results.grossAreaM2.toFixed(2)} m² − openings ${results.openingsAreaM2.toFixed(2)} m²`}
                  />
                  <ResultCard
                    title="Wall volume"
                    value={results.wallVolumeM3.toFixed(2)}
                    unit="m³"
                    variant="neutral"
                    description={`Wet mortar ${results.wetMortarM3.toFixed(2)} m³`}
                  />
                </div>

                <div className="border-t border-ui-borderSubtle dark:border-slate-700 pt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-txt-secondary mb-3">
                    Estimated material cost ({currency})
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-txt-secondary">Bricks ({formatInt(results.bricks)} pcs)</dt>
                      <dd className="font-semibold">{formatMoney(results.brickCost, currency)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-txt-secondary">Cement ({results.cementBags} bags)</dt>
                      <dd className="font-semibold">{formatMoney(results.cementCost, currency)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-txt-secondary">Sand ({results.sandCft.toFixed(1)} cft)</dt>
                      <dd className="font-semibold">{formatMoney(results.sandCost, currency)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-ui-borderSubtle dark:border-slate-700 pt-2 text-base">
                      <dt className="font-semibold">Total (materials only)</dt>
                      <dd className="font-bold">{formatMoney(results.totalCost, currency)}</dd>
                    </div>
                  </dl>
                  {!results.costComplete && (
                    <p className="text-xs text-txt-tertiary mt-2">
                      Enter the missing rate above to complete the cost. Labour, transport and
                      taxes are not included.
                    </p>
                  )}
                </div>

                <div className="border-t border-ui-borderSubtle dark:border-slate-700 pt-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-txt-secondary mb-2">
                    How this was calculated
                  </h4>
                  <ul className="text-sm text-txt-secondary space-y-1">
                    <li>
                      Wall volume = {length} × {height} {lengthUnit} × {thicknessMm} mm ={" "}
                      {results.wallVolumeM3.toFixed(2)} m³
                    </li>
                    <li>
                      One brick with {jointMm} mm joint ={" "}
                      {brick.id === "custom"
                        ? `${customBrick.l} × ${customBrick.w} × ${customBrick.h} mm`
                        : `${brick.l} × ${brick.w} × ${brick.h} mm`}{" "}
                      + joint
                    </li>
                    <li>
                      Bricks = wall volume ÷ brick-with-mortar volume, + {wastagePct}% wastage
                    </li>
                    <li>
                      Dry mortar = wet mortar × 1.33 (× 1.15 frog allowance), split {cementParts}:
                      {sandParts}; cement bags = cement volume ÷ 0.0347 m³
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 print:hidden">
              <button
                type="button"
                onClick={handlePdf}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-blue-300 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-blue-300 transition-colors"
              >
                {shared ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                {shared ? "Shared / copied" : "Share"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-bg-card border border-ui-borderSubtle text-txt-secondary hover:border-blue-300 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy result"}
              </button>
            </div>
            <p className="text-xs text-txt-tertiary mt-3">
              Planning estimate only — confirm the final order with your quantity surveyor or
              contractor. Rates are indicative; verify with your supplier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
