import React, { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { useAutoSave } from "../../hooks/useAutoSave";
import {
  Printer,
  Plus,
  Trash2,
  LayoutList,
  Copy,
  Download,
  FileSpreadsheet,
  Send,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { CodeTooltip } from "../ui/CodeTooltip";
import {
  calcBbsRow,
  calcBbsTotals,
  validateBbsRow,
  bbsWorkedExample,
  BBS_SHAPES,
  HOOK_STANDARDS,
  COVER_PRESETS,
  STANDARD_DIAS,
  type BbsRowInput,
  type BbsRowResult,
  type BbsShape,
  type HookStandard,
} from "../../lib/bbsCalc";
import {
  BAR_GRADES,
  STEEL_RATE_DEFAULTS,
  STEEL_RATE_LABEL,
  formatSteelMoney,
  STOCK_BAR_FT_WARNING,
  type SteelCurrency,
} from "../../lib/steelCalc";
import { exportBOQToPDF } from "../../lib/pdfExport";
const inputCls =
  "w-full bg-surface-default border border-ui-borderSubtle text-txt-primary rounded-full px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:outline-none transition-all min-h-[44px] text-base font-normal";
const inputErrCls =
  "w-full bg-surface-default border border-ui-errorBorder text-txt-primary rounded-full px-4 py-3 focus:ring-2 focus:ring-ui-errorText focus:outline-none transition-all min-h-[44px] text-base font-normal";
const selectCls =
  "w-full bg-surface-hover border border-ui-borderSubtle text-txt-primary rounded-2xl px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:outline-none transition-all text-base font-normal";
const labelCls = "block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary";
const errTextCls = "text-sm text-ui-errorText mt-1 ml-1";

const CURRENCIES: SteelCurrency[] = ["PKR", "INR", "AED", "USD"];

let rowSeq = 0;

export default function BarBendingSchedule() {
  const [rows, setRows] = useState<BbsRowResult[]>([]);
  const [member, setMember] = useState("Item 1");
  const [shape, setShape] = useState<BbsShape>("rect-stirrup");
  const [dia, setDia] = useState("8");
  const [members, setMembers] = useState("25");
  const [barsPerMember, setBarsPerMember] = useState("1");
  const [cover, setCover] = useState("40");
  const [coverPreset, setCoverPreset] = useState("column");
  const [hookStandard, setHookStandard] = useState<HookStandard>("IS 2502");
  const [lapX, setLapX] = useState("50");
  const [span, setSpan] = useState("3000");
  const [width, setWidth] = useState("300");
  const [depth, setDepth] = useState("450");
  const [slabThick, setSlabThick] = useState("150");
  const [cranks, setCranks] = useState("2");
  const [spiralDia, setSpiralDia] = useState("300");
  const [spiralPitch, setSpiralPitch] = useState("150");
  const [spiralHeight, setSpiralHeight] = useState("3000");
  const [grade, setGrade] = useState("grade60");

  const [wastagePct, setWastagePct] = useState("5");
  const [rate, setRate] = useState("270");
  const [currency, setCurrency] = useState<SteelCurrency>("PKR");
  const [stock, setStock] = useState<"12" | "40">("12");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useAutoSave(
    "bbs_generator_v2",
    { rows, member, shape, dia, members, barsPerMember, cover, hookStandard, lapX, span, width, depth, slabThick, cranks, spiralDia, spiralPitch, spiralHeight, grade, wastagePct, rate, currency, stock },
    {
      rows: (v) => Array.isArray(v) && setRows(v.filter((r: unknown) => r && typeof r === "object" && "cutLengthM" in (r as object))),
      member: setMember, shape: (v) => setShape(v as BbsShape), dia: setDia, members: setMembers,
      barsPerMember: setBarsPerMember, cover: setCover, hookStandard: (v) => setHookStandard(v as HookStandard),
      lapX: setLapX, span: setSpan, width: setWidth, depth: setDepth, slabThick: setSlabThick,
      cranks: setCranks, spiralDia: setSpiralDia, spiralPitch: setSpiralPitch, spiralHeight: setSpiralHeight,
      grade: setGrade, wastagePct: setWastagePct, rate: setRate, currency: (v) => setCurrency(v as SteelCurrency),
      stock: (v) => setStock(v as "12" | "40"),
    },
  );

  const stockLengthM = stock === "40" ? 12.192 : 12;
  const rateNum = rate.trim() === "" ? null : Number(rate);
  const wastageNum = Number(wastagePct) || 0;

  const currentInput: BbsRowInput = {
    member: member.trim(),
    shape,
    diaMm: Number(dia),
    members: Number(members),
    barsPerMember: Number(barsPerMember),
    coverMm: Number(cover),
    hookStandard,
    lapX: Number(lapX) || 0,
    spanMm: Number(span),
    widthMm: Number(width),
    depthMm: Number(depth),
    slabThicknessMm: Number(slabThick),
    cranks: Number(cranks),
    colDiaMm: Number(spiralDia),
    pitchMm: Number(spiralPitch),
    heightMm: Number(spiralHeight),
  };

  const liveErrors = useMemo(() => validateBbsRow(currentInput), [member, shape, dia, members, barsPerMember, cover, hookStandard, lapX, span, width, depth, slabThick, cranks, spiralDia, spiralPitch, spiralHeight]);
  const preview = useMemo(() => {
    if (liveErrors.length > 0) return null;
    const r = calcBbsRow(currentInput, stockLengthM);
    return "errors" in r ? null : r;
  }, [liveErrors, stockLengthM]);

  const totals = useMemo(
    () => calcBbsTotals(rows, wastageNum, rateNum, stockLengthM),
    [rows, wastageNum, rateNum, stockLengthM],
  );

  const fieldError = (test: (e: string) => boolean) =>
    formErrors.find(test) ?? liveErrors.find(test);

  const addRow = () => {
    const errors = validateBbsRow(currentInput);
    setFormErrors(errors);
    if (errors.length > 0) return;
    const r = calcBbsRow(currentInput, stockLengthM);
    if ("errors" in r) {
      setFormErrors(r.errors);
      return;
    }
    setRows((prev) => [...prev, r].sort((a, b) => a.diaMm - b.diaMm));
    setFormErrors([]);
    setNotice(`Added ${r.member} — ${r.cutLengthM.toFixed(3)} m cut, ${r.weightKg.toFixed(2)} kg.`);
    rowSeq += 1;
    setMember(`Item ${rows.length + 2}`);
  };

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const loadExample = () => {
    const ex = bbsWorkedExample();
    setMember(ex.member);
    setShape(ex.shape);
    setDia(String(ex.diaMm));
    setMembers(String(ex.members));
    setBarsPerMember(String(ex.barsPerMember));
    setCover(String(ex.coverMm));
    setCoverPreset("column");
    setWidth(String(ex.widthMm));
    setDepth(String(ex.depthMm));
    const r = calcBbsRow(ex, stockLengthM);
    if ("errors" in r) return;
    setRows((prev) => (prev.some((p) => p.member === ex.member) ? prev : [...prev, r]));
    setNotice("Worked example loaded: Beam B1, 25 × Ø8 rectangular stirrups (300 × 450, cover 40).");
  };

  const resetAll = () => {
    if (!window.confirm("Reset all inputs and clear the schedule? This cannot be undone.")) return;
    setRows([]);
    setMember("Item 1");
    setShape("rect-stirrup");
    setDia("8");
    setMembers("1");
    setBarsPerMember("1");
    setCover("40");
    setCoverPreset("column");
    setHookStandard("IS 2502");
    setLapX("50");
    setSpan("3000");
    setWidth("300");
    setDepth("450");
    setSlabThick("150");
    setCranks("2");
    setSpiralDia("300");
    setSpiralPitch("150");
    setSpiralHeight("3000");
    setFormErrors([]);
    setNotice(null);
  };

  const onCurrencyChange = (c: SteelCurrency) => {
    setCurrency(c);
    const d = STEEL_RATE_DEFAULTS[c].perKg;
    setRate(d == null ? "" : String(d));
  };

  const tsv = () => {
    const head = ["SN", "Member", "Shape", "Dia (mm)", "Members", "Bars/Member", "Cut L (m)", "Total L (m)", "Bars to order", "Weight (kg)"];
    const lines = rows.map((r, i) =>
      [i + 1, r.member, r.shape, r.diaMm, r.members, r.barsPerMember, r.cutLengthM.toFixed(3), r.totalLengthM.toFixed(2), r.barsToOrderCount, r.weightKg.toFixed(2)].join("\t"),
    );
    return [head.join("\t"), ...lines, `Net weight (kg)\t${totals.netWeightKg}`, `Order weight +${wastageNum}% (kg)\t${totals.orderWeightKg}`, `Cost\t${totals.cost == null ? "—" : formatSteelMoney(totals.cost, currency)}`].join("\n");
  };

  const download = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyTable = async () => {
    try {
      await navigator.clipboard.writeText(tsv());
      setNotice("Schedule copied as tab-separated text — paste it into Excel or Sheets.");
    } catch {
      setNotice("Copy failed — your browser blocked clipboard access. Use Download CSV instead.");
    }
  };

  const downloadCsv = () => {
    const csv = tsv().replace(/\t/g, ",");
    download("bar-bending-schedule.csv", csv, "text/csv");
    setNotice("CSV downloaded.");
  };

  const downloadExcel = async () => {
    const XLSX = await import("xlsx");
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((r, i) => ({
        SN: i + 1,
        Member: r.member,
        Shape: r.shape,
        "Dia (mm)": r.diaMm,
        Members: r.members,
        "Bars / Member": r.barsPerMember,
        "Cut Length (m)": Number(r.cutLengthM.toFixed(3)),
        "Total Length (m)": Number(r.totalLengthM.toFixed(2)),
        "Bars to order": r.barsToOrderCount,
        "Weight (kg)": r.weightKg,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "BBS");
    XLSX.writeFile(wb, "bar-bending-schedule.xlsx");
    setNotice("Excel file downloaded.");
  };

  const downloadPdf = () => {
    exportBOQToPDF({
      projectName: "Bar Bending Schedule",
      date: new Date().toLocaleDateString("en-GB"),
      items: rows.map((r) => ({
        description: `${r.member} — ${r.shape}, Ø${r.diaMm} mm × ${r.barsPerMember} bars × ${r.members} members`,
        quantity: r.weightKg,
        unit: "kg",
        rate: rateNum ?? 0,
        amount: rateNum == null ? 0 : r.weightKg * rateNum,
      })),
      totalAmount: totals.cost ?? 0,
    });
    setNotice("PDF downloaded.");
  };

  const sendToBOQ = () => {
    if (rows.length === 0) return;
    if (rateNum == null || !isFinite(rateNum) || rateNum <= 0) {
      setNotice("Enter a steel rate per kg first — the BOQ line cannot be sent at Rs 0.");
      return;
    }
    window.dispatchEvent(
      new CustomEvent("fill-boq", {
        detail: [
          {
            id: `bbs-${Date.now()}`,
            division: "05 - Metals",
            description: `Steel Reinforcement (BBS Total - ${rows.length} items, +${wastageNum}% wastage)`,
            unit: "kg",
            quantity: totals.orderWeightKg,
            rate: rateNum,
          },
        ],
      }),
    );
    setNotice(`Sent to BOQ Generator: ${totals.orderWeightKg.toFixed(2)} kg at ${formatSteelMoney(rateNum, currency)}/kg.`);
  };

  const handlePrint = () => window.dispatchEvent(new CustomEvent("global-print-action"));

  const shapeNeeds = (k: "span" | "section" | "cranked" | "spiral") =>
    (k === "span" && ["straight", "l-hook", "u-hook", "cranked"].includes(shape)) ||
    (k === "section" && ["rect-stirrup", "u-stirrup"].includes(shape)) ||
    (k === "cranked" && shape === "cranked") ||
    (k === "spiral" && shape === "spiral");

  return (
    <div className="w-full h-full bg-transparent text-txt-primary font-sans p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface-default p-4 sm:p-6 rounded-2xl shadow-brand-sm border border-ui-borderSubtle print:hidden overflow-hidden">
          <div>
            <p className="text-base text-txt-secondary leading-relaxed max-w-2xl">
              Build a bar bending schedule the way a quantity surveyor does: cutting length per bar,
              bend deductions, laps, stock-bar counts, wastage and cost — for straight bars, hooks,
              cranked bars, stirrups, spirals and rings. The field shortcut 2(A+B)+24d reads about
              10% higher; this schedule uses the IS 2502 detailed form.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 items-center">
            <Button onClick={sendToBOQ} disabled={rows.length === 0} className="px-4 py-2.5 bg-ink text-white rounded-full hover:bg-ink-700 transition-colors disabled:opacity-50 text-base font-semibold active:scale-95 shadow-brand-sm">
              <Send className="w-4 h-4" /> Send to BOQ
            </Button>
            <Button onClick={loadExample} className="px-4 py-2.5 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100 transition-colors text-base font-semibold active:scale-95 shadow-brand-sm">
              Load Example
            </Button>
            <Button onClick={resetAll} className="px-4 py-2.5 bg-surface-hover text-txt-tertiary rounded-full hover:bg-surface-active transition-colors text-base font-semibold active:scale-95 shadow-brand-sm">
              Reset
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink hover:bg-ink-700 text-white shadow-brand-md transition-all text-base font-semibold active:scale-95">
              <Printer className="w-4 h-4" /> Print Schedule
            </Button>
          </div>
        </div>

        {notice && (
          <div className="flex items-start gap-2 bg-ui-success border border-ui-successBorder text-ui-successText rounded-2xl px-4 py-3 print:hidden">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{notice}</p>
          </div>
        )}

        {/* Global header: wastage / rate / currency / stock */}
        <div className="bg-surface-default rounded-2xl border border-border-color shadow-brand-sm p-4 sm:p-6 print:hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls} htmlFor="bbs-wastage">Wastage %</label>
              <input id="bbs-wastage" type="number" inputMode="decimal" value={wastagePct} onChange={(e) => setWastagePct(e.target.value)} className={inputCls} />
              <p className="text-xs text-txt-secondary mt-1 ml-1">3% straight bars, 5% bent shapes.</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="bbs-rate">Steel rate / kg</label>
              <input id="bbs-rate" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={rateNum == null ? "Enter rate" : undefined} className={inputCls} />
              <p className="text-xs text-txt-secondary mt-1 ml-1">{STEEL_RATE_LABEL}.</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="bbs-currency">Currency</label>
              <select id="bbs-currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value as SteelCurrency)} className={selectCls}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-xs text-txt-secondary mt-1 ml-1">{rateNum == null ? "No verified rate — cost shows — until you enter one." : `Rate in ${currency}.`}</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="bbs-stock">Stock bar length</label>
              <select id="bbs-stock" value={stock} onChange={(e) => setStock(e.target.value as "12" | "40")} className={selectCls}>
                <option value="12">12 m</option>
                <option value="40">40 ft (12.192 m)</option>
              </select>
              {stock === "40" && <p className="text-xs text-txt-secondary mt-1 ml-1">{STOCK_BAR_FT_WARNING}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
          {/* Input form */}
          <section className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6 print:hidden">
            <div className="w-full bg-surface-default px-6 py-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-color overflow-hidden">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight">
                <Plus className="w-5 h-5 text-accent-800" /> Add Bar
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} htmlFor="bbs-member">Member Name / Mark</label>
                  <input id="bbs-member" type="text" placeholder="e.g. B1, C2, Main Bar" value={member} onChange={(e) => setMember(e.target.value)} className={fieldError((e) => e.includes("Member")) ? inputErrCls : inputCls} />
                  {fieldError((e) => e.includes("Member")) && <p className={errTextCls}>{fieldError((e) => e.includes("Member"))}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="bbs-shape">Shape Code</label>
                  <select id="bbs-shape" value={shape} onChange={(e) => setShape(e.target.value as BbsShape)} className={selectCls}>
                    {BBS_SHAPES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="bbs-dia"><span className="flex items-center gap-1">Bar Dia (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span></label>
                    <select id="bbs-dia" value={dia} onChange={(e) => setDia(e.target.value)} className={selectCls}>
                      {STANDARD_DIAS.map((d) => (
                        <option key={d} value={d}>{d} mm</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="bbs-grade">Bar Grade</label>
                    <select id="bbs-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={selectCls}>
                      {BAR_GRADES.map((g) => (
                        <option key={g.id} value={g.id}>{g.label} — {g.standard}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="bbs-members">No. of Members</label>
                    <input id="bbs-members" type="number" inputMode="decimal" value={members} onChange={(e) => setMembers(e.target.value)} className={fieldError((e) => e.includes("members")) ? inputErrCls : inputCls} />
                    {fieldError((e) => e.includes("members")) && <p className={errTextCls}>{fieldError((e) => e.includes("members"))}</p>}
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="bbs-per-member">Bars / Member</label>
                    <input id="bbs-per-member" type="number" inputMode="decimal" value={barsPerMember} onChange={(e) => setBarsPerMember(e.target.value)} className={fieldError((e) => e.includes("Bars per member")) ? inputErrCls : inputCls} />
                    {fieldError((e) => e.includes("Bars per member")) && <p className={errTextCls}>{fieldError((e) => e.includes("Bars per member"))}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="bbs-cover-preset">Cover Preset</label>
                    <select id="bbs-cover-preset" value={coverPreset} onChange={(e) => { setCoverPreset(e.target.value); const p = COVER_PRESETS.find((x) => x.id === e.target.value); if (p) setCover(String(p.coverMm)); }} className={selectCls}>
                      {COVER_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="bbs-cover"><span className="flex items-center gap-1">Cover (mm) <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span></label>
                    <input id="bbs-cover" type="number" inputMode="decimal" value={cover} onChange={(e) => setCover(e.target.value)} className={fieldError((e) => e.includes("Cover")) ? inputErrCls : inputCls} />
                    {fieldError((e) => e.includes("Cover")) && <p className={errTextCls}>{fieldError((e) => e.includes("Cover"))}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="bbs-hook">Hook Standard</label>
                    <select id="bbs-hook" value={hookStandard} onChange={(e) => setHookStandard(e.target.value as HookStandard)} className={selectCls}>
                      {HOOK_STANDARDS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="bbs-lap">Lap Length (× dia)</label>
                    <input id="bbs-lap" type="number" inputMode="decimal" value={lapX} onChange={(e) => setLapX(e.target.value)} className={inputCls} />
                    <p className="text-xs text-txt-secondary mt-1 ml-1">50d standard, 0 = none.</p>
                  </div>
                </div>

                {shapeNeeds("section") && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-accent-50 rounded-2xl border border-accent-100 overflow-hidden">
                    <div>
                      <label className={labelCls} htmlFor="bbs-width">Sect Width (mm)</label>
                      <input id="bbs-width" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bbs-depth">Sect Depth (mm)</label>
                      <input id="bbs-depth" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}
                {shapeNeeds("spiral") && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-accent-50 rounded-2xl border border-accent-100 overflow-hidden">
                    <div className="col-span-2">
                      <label className={labelCls} htmlFor="bbs-coldia">Col Dia (mm)</label>
                      <input id="bbs-coldia" type="number" inputMode="decimal" value={spiralDia} onChange={(e) => setSpiralDia(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bbs-pitch">Pitch (mm)</label>
                      <input id="bbs-pitch" type="number" inputMode="decimal" value={spiralPitch} onChange={(e) => setSpiralPitch(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="bbs-height">Height (mm)</label>
                      <input id="bbs-height" type="number" inputMode="decimal" value={spiralHeight} onChange={(e) => setSpiralHeight(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                )}
                {shapeNeeds("span") && (
                  <div className="space-y-4 p-4 bg-accent-50 rounded-2xl border border-accent-100 overflow-hidden">
                    <div>
                      <label className={labelCls} htmlFor="bbs-span">Length / Span (mm)</label>
                      <input id="bbs-span" type="number" inputMode="decimal" value={span} onChange={(e) => setSpan(e.target.value)} className={inputCls} />
                    </div>
                    {shapeNeeds("cranked") && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls} htmlFor="bbs-thick">Slab Thk (mm)</label>
                          <input id="bbs-thick" type="number" inputMode="decimal" value={slabThick} onChange={(e) => setSlabThick(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls} htmlFor="bbs-cranks">No. Cranks</label>
                          <input id="bbs-cranks" type="number" inputMode="decimal" value={cranks} onChange={(e) => setCranks(e.target.value)} className={inputCls} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formErrors.length > 0 && (
                  <div className="bg-ui-error border border-ui-errorBorder text-ui-errorText rounded-2xl px-4 py-3">
                    <p className="font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Fix these before adding the bar:</p>
                    <ul className="list-disc ml-5 mt-1 text-sm">{formErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                  </div>
                )}

                {preview && (
                  <div className="bg-accent-50 border border-accent-100 rounded-2xl px-4 py-3 text-sm text-txt-primary">
                    <p><strong>Preview:</strong> cut length {preview.cutLengthM.toFixed(3)} m · total {preview.totalLengthM.toFixed(2)} m · {preview.weightKg.toFixed(2)} kg · {preview.barsToOrderCount} stock bar{preview.barsToOrderCount === 1 ? "" : "s"}{preview.lapsPerBar > 0 ? ` · ${preview.lapsPerBar} lap${preview.lapsPerBar === 1 ? "" : "s"}` : ""}</p>
                    <p className="text-txt-secondary mt-1">{preview.formula}</p>
                  </div>
                )}

                <Button onClick={addRow} disabled={liveErrors.length > 0} className="w-full py-3.5 bg-ink hover:bg-ink-700 text-white rounded-full transition-all shadow-brand-md mt-4 text-base font-semibold active:scale-95 disabled:opacity-50 overflow-hidden">
                  Calculate &amp; Add
                </Button>
                {liveErrors.length > 0 && <p className="text-xs text-txt-secondary text-center">Add is disabled until the errors above are fixed.</p>}
              </div>
            </div>
          </section>

          {/* Schedule summary */}
          <section className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col space-y-6">
            <div className="w-full bg-surface-default px-6 py-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-color min-h-[500px] overflow-hidden">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight">
                  <LayoutList className="w-5 h-5 text-accent-800" /> Current Schedule
                </h2>
                <div className="bg-accent-50 text-accent-800 px-4 py-1.5 rounded-full font-bold text-sm">
                  Net: {totals.netWeightKg.toFixed(2)} kg
                </div>
              </div>

              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-txt-secondary print:hidden">
                  <LayoutList className="w-12 h-12 mb-4 opacity-50" />
                  <p>No bars added yet. Add a bar from the panel, or load the worked example.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-ui-borderSubtle">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                        <tr>
                          <th className="px-4 py-3 border-b">Member</th>
                          <th className="px-4 py-3 border-b">Shape</th>
                          <th className="px-4 py-3 border-b">Dia</th>
                          <th className="px-4 py-3 border-b text-center">Nos.</th>
                          <th className="px-4 py-3 border-b text-right">Cut L. (m)</th>
                          <th className="px-4 py-3 border-b text-right">Tot. L (m)</th>
                          <th className="px-4 py-3 border-b text-right">Bars</th>
                          <th className="px-4 py-3 border-b text-right">Wgt (kg)</th>
                          <th className="px-4 py-3 border-b text-center print:hidden">Act</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-color">
                        {rows.map((r, i) => (
                          <React.Fragment key={`${r.member}-${i}`}>
                            <tr className="hover:bg-surface-hover/50">
                              <td className="px-4 py-3 font-semibold text-txt-primary">{r.member}</td>
                              <td className="px-4 py-3 text-txt-secondary capitalize">{r.shape.replace(/-/g, " ")}</td>
                              <td className="px-4 py-3 font-medium">Ø{r.diaMm}</td>
                              <td className="px-4 py-3 text-center font-bold text-txt-secondary">{r.members}×{r.barsPerMember}</td>
                              <td className="px-4 py-3 text-right font-medium">{r.cutLengthM.toFixed(3)}</td>
                              <td className="px-4 py-3 text-right">{r.totalLengthM.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">{r.barsToOrderCount}</td>
                              <td className="px-4 py-3 text-right font-bold text-accent-800">{r.weightKg.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center print:hidden">
                                <Button aria-label="Delete row" onClick={() => removeRow(i)} className="text-ui-errorText hover:text-ui-errorText p-1 rounded-full">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={9} className="px-4 pb-3 text-xs text-txt-secondary">
                                <details>
                                  <summary className="cursor-pointer font-medium text-accent-800">How it was calculated</summary>
                                  <p className="mt-1">{r.formula}{r.lapsPerBar > 0 ? ` Laps: ${r.lapsPerBar} × ${r.lapX}d = ${r.lapLengthPerBarMm} mm per bar.` : ""}</p>
                                  {r.fieldApproxNote && <p className="mt-1">{r.fieldApproxNote}</p>}
                                </details>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totals.perDia.length > 0 && (
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-ui-borderSubtle">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-surface-hover text-txt-secondary font-bold uppercase text-sm">
                          <tr><th className="px-4 py-2">Dia</th><th className="px-4 py-2 text-right">Total length (m)</th><th className="px-4 py-2 text-right">Weight (kg)</th><th className="px-4 py-2 text-right">Bars to order</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                          {totals.perDia.map((p) => (
                            <tr key={p.diaMm}>
                              <td className="px-4 py-2 font-medium">Ø{p.diaMm}</td>
                              <td className="px-4 py-2 text-right">{p.totalLengthM.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right">{p.weightKg.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right">{p.bars}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-surface-hover rounded-2xl p-4"><p className="text-txt-secondary">Net weight</p><p className="font-bold text-lg">{totals.netWeightKg.toFixed(2)} kg</p></div>
                    <div className="bg-surface-hover rounded-2xl p-4"><p className="text-txt-secondary">To order (+{wastageNum}%)</p><p className="font-bold text-lg">{totals.orderWeightKg.toFixed(2)} kg</p></div>
                    <div className="bg-surface-hover rounded-2xl p-4"><p className="text-txt-secondary">Tonnes / Maunds</p><p className="font-bold text-lg">{totals.tonnes.toFixed(3)} t · {totals.maunds.toFixed(1)} md</p></div>
                    <div className="bg-accent-50 rounded-2xl p-4"><p className="text-txt-secondary">Cost</p><p className="font-bold text-lg">{totals.cost == null ? "—" : formatSteelMoney(totals.cost, currency)}</p></div>
                  </div>
                  <p className="text-xs text-txt-secondary mt-2">Stock bars to order: {totals.totalBarsToOrder} × {stockLengthM} m. {stock === "40" ? STOCK_BAR_FT_WARNING : ""}</p>

                  <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                    <Button onClick={copyTable} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><Copy className="w-4 h-4" /> Copy table</Button>
                    <Button onClick={downloadCsv} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><Download className="w-4 h-4" /> CSV</Button>
                    <Button onClick={downloadExcel} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
                    <Button onClick={downloadPdf} className="px-4 py-2 bg-ink text-white rounded-full text-sm font-semibold"><Download className="w-4 h-4" /> PDF</Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Formula + FAQ — live here in the module (no CalculatorPageShell page is wired for this tool) */}
      <section aria-labelledby="bbs-formula-heading" className="mt-12 bg-surface-default border border-border-color rounded-2xl p-6 md:p-8 shadow-brand-sm print:hidden">
        <h2 id="bbs-formula-heading" className="text-2xl font-bold text-txt-primary mb-4">How cutting length is calculated</h2>
        <p className="text-txt-secondary leading-relaxed">
          The weight of one metre of bar is d² ÷ 162.28 kg/m. A rectangular stirrup uses the IS 2502
          detailed form: L = 2(A+B) + 2×10d − (3×2d + 2×3d), where A and B are the inner dimensions
          (section minus twice the cover). For a 300 × 450 mm beam with 40 mm cover and Ø8 bars,
          A = 220 mm and B = 370 mm, so L = 1,244 mm = 1.244 m, weighing 0.49 kg. The field shortcut
          2(A+B)+24d gives 1.372 m — 10.3% higher — because it counts the full hook allowance
          without deducting bend shortening; this calculator uses the detailed form and shows the
          shortcut only as a labelled comparison.
        </p>
        <p className="text-txt-secondary leading-relaxed mt-3">
          Bars longer than one 12 m stock bar get laps of 50d, and bars to order are
          ⌈total length ÷ 12⌉ (or ÷ 12.192 m for 40 ft stock). Wastage defaults to 5% for bent
          shapes and 3% for straight bars. The steel rate defaults to Rs 270/kg (indicative
          November 2026 — confirm with your dealer); rates for India, the UAE and USD are left
          blank until you enter your dealer&apos;s rate.
        </p>
      </section>

      {/* Print-only layout */}
      <div className="hidden print:block p-4 sm:p-8 bg-surface-default text-txt-primary">
        <h2 className="text-xl font-bold mb-4">Bar Bending Schedule</h2>
        <table className="w-full text-sm text-left border-collapse border border-ui-borderDefault">
          <thead className="bg-surface-hover font-bold uppercase text-sm">
            <tr>
              <th className="px-3 py-2 border">SN.</th>
              <th className="px-3 py-2 border">Member</th>
              <th className="px-3 py-2 border">Shape</th>
              <th className="px-3 py-2 border text-center">Dia</th>
              <th className="px-3 py-2 border text-center">Nos.</th>
              <th className="px-3 py-2 border text-right">Cut L (m)</th>
              <th className="px-3 py-2 border text-right">Total L (m)</th>
              <th className="px-3 py-2 border text-right">Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="px-3 py-2 border text-center">{i + 1}</td>
                <td className="px-3 py-2 border font-semibold">{r.member}</td>
                <td className="px-3 py-2 border capitalize">{r.shape.replace(/-/g, " ")}</td>
                <td className="px-3 py-2 border text-center">Ø{r.diaMm}</td>
                <td className="px-3 py-2 border text-center">{r.members}×{r.barsPerMember}</td>
                <td className="px-3 py-2 border text-right">{r.cutLengthM.toFixed(3)}</td>
                <td className="px-3 py-2 border text-right">{r.totalLengthM.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right font-bold">{r.weightKg.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-surface-hover">
              <td colSpan={7} className="px-3 py-3 border text-right font-bold uppercase">Net weight</td>
              <td className="px-3 py-3 border text-right font-bold text-lg">{totals.netWeightKg.toFixed(2)} kg</td>
            </tr>
            <tr className="bg-surface-hover">
              <td colSpan={7} className="px-3 py-3 border text-right font-bold uppercase">To order (+{wastageNum}%)</td>
              <td className="px-3 py-3 border text-right font-bold">{totals.orderWeightKg.toFixed(2)} kg</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CalculationHistory
        calculatorId="bbs_generator_v1"
        estimationName="Bar Bending Schedule"
        savePayload={{ rows, netWeightKg: totals.netWeightKg }}
        currentInputs={{}}
        onRestore={(savedInputs) => {
          if (savedInputs.rows) setRows(savedInputs.rows);
        }}
      />
    </div>
  );
}
