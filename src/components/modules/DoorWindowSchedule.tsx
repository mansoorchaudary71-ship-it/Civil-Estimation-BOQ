import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import {
  calcDoorWindowSchedule, validateDoorWindowRow, DOOR_WINDOW_PRESETS,
  DEFAULT_DOOR_WINDOW_ROWS, type DoorWindowRowInput, type DoorWindowKind,
} from "../../lib/doorWindowCalc";
import { formatFinishesMoney, type FinishesCurrency } from "../../lib/finishesCalc";
import { useSettings } from "../../context/SettingsContext";
import { Columns, Check, Copy, Download, Printer, Share2, Plus } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";

type Unit = "m" | "ft" | "mm";
const inputCls = "w-full bg-surface-hover border border-ui-borderSubtle px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-accent-500 outline-none";
const money = (v: number | null, c: FinishesCurrency) => formatFinishesMoney(v, c);


export default function DoorWindowSchedule() {
  const [unit, setUnit] = useState<Unit>("m");
  // Currency defaults to the global setting; the picker still lets the user
  // override it per tool. Default rows carry no rates (null), so no rate
  // defaults need clearing for other currencies.
  const { settings } = useSettings();
  const initialCurrency: FinishesCurrency = (["PKR", "INR", "AED", "USD"] as string[]).includes(settings.currency) ? (settings.currency as FinishesCurrency) : "PKR";
  const [currency, setCurrency] = useState<FinishesCurrency>(initialCurrency);
  const [rows, setRows] = useState<DoorWindowRowInput[]>(DEFAULT_DOOR_WINDOW_ROWS);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const toM = (v: number) => (unit === "ft" ? v * 0.3048 : unit === "mm" ? v / 1000 : v);
  const fromM = (v: number) => (unit === "ft" ? v / 0.3048 : unit === "mm" ? v * 1000 : v);
  const fmt = (m: number) => fromM(m).toFixed(unit === "mm" ? 0 : 2);

  const errors = rows.flatMap(validateDoorWindowRow);
  const totals = useMemo(() => calcDoorWindowSchedule(rows), [rows]);
  const warnings = totals.rows.flatMap((r) => r.warnings);

  const update = (id: string, patch: Partial<DoorWindowRowInput>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  // Marks must stay unique — the old "Add row" used D + row count, so
  // deleting a row and adding another produced a duplicate mark.
  const nextMark = (kind: DoorWindowKind) => {
    const prefix = kind === "door" ? "D" : kind === "window" ? "W" : "V";
    const max = rows.reduce((m, r) => {
      const n = r.mark.startsWith(prefix) ? parseInt(r.mark.slice(prefix.length), 10) : NaN;
      return Number.isInteger(n) && n > m ? n : m;
    }, 0);
    return `${prefix}${max + 1}`;
  };
  const addPreset = (presetId: string) => {
    const p = DOOR_WINDOW_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setRows([...rows, {
      id: `row-${Date.now()}`, mark: rows.some((r) => r.mark === p.mark) ? nextMark(p.kind) : p.mark, kind: p.kind, room: p.room,
      leafWidthM: p.leafWidthM, leafHeightM: p.leafHeightM, frameMaterial: p.frameMaterial,
      shutterType: p.shutterType, glass: p.glass, frameSectionMm: 100,
      sillHeightM: p.sillHeightM, qty: 1, wallThicknessM: 0.23,
      frameRatePerM: null, leafRatePerM2: null, hardwareRatePerSet: null,
    }]);
  };

  const summaryText = () => [
    "Door & window schedule — Civil Estimation Pro",
    ...rows.map((r, i) => {
      const res = totals.rows[i];
      return `${r.mark} (${r.kind}, ${r.room}): leaf ${fmt(r.leafWidthM)} × ${fmt(r.leafHeightM)} ${unit} × ${r.qty} = ${res.totalLeafAreaM2.toFixed(2)} m²; frame-outer ${res.frameOuterWidthM.toFixed(2)} × ${res.frameOuterHeightM.toFixed(2)} m; opening ${res.openingWidthM.toFixed(2)} × ${res.openingHeightM.toFixed(2)} m; lintel ${res.lintelLengthM.toFixed(2)} m; frame ${(res.frameLengthM * r.qty).toFixed(2)} r.m; glass ${(res.glassAreaM2 * r.qty).toFixed(2)} m²`;
    }),
    `Totals: leaf area ${totals.totalLeafAreaM2.toFixed(2)} m² · frame ${totals.totalFrameLengthM.toFixed(2)} r.m · glass ${totals.totalGlassAreaM2.toFixed(2)} m² · lintel concrete ${totals.totalLintelVolumeM3.toFixed(2)} m³ · hardware sets ${totals.totalHardwareSets}`,
    totals.totalCost != null ? `Estimated cost: ${money(totals.totalCost, currency)}` : "Cost incomplete — enter frame, leaf and hardware rates.",
    "Sizes are typical — confirm on the drawing. Rates are indicative.",
  ].join("\n");

  const downloadCSV = () => {
    let csv = "Mark,Kind,Room,Leaf Width (m),Leaf Height (m),Area per Unit (m2),Qty,Total Leaf Area (m2),Frame Outer W (m),Frame Outer H (m),Masonry Opening W (m),Clear Width (m),Sill (m),Lintel (m),Frame total (r.m),Glass total (m2),Hardware Sets,Frame Material,Shutter,Glass Type,Rate Amount\n";
    rows.forEach((r, i) => {
      const res = totals.rows[i];
      csv += `"${r.mark}","${r.kind}","${r.room}",${r.leafWidthM},${r.leafHeightM},${res.leafAreaM2.toFixed(2)},${r.qty},${res.totalLeafAreaM2.toFixed(2)},${res.frameOuterWidthM.toFixed(2)},${res.frameOuterHeightM.toFixed(2)},${res.openingWidthM.toFixed(2)},${res.clearWidthM.toFixed(2)},${r.sillHeightM},${res.lintelLengthM.toFixed(2)},${(res.frameLengthM * r.qty).toFixed(2)},${(res.glassAreaM2 * r.qty).toFixed(2)},${res.hardwareSets},"${r.frameMaterial}","${r.shutterType}","${r.glass}",${res.rowCost ?? ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Door_Window_Schedule.csv"; a.click();
    window.URL.revokeObjectURL(url);
  };
  const handleCopy = async () => { try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) { try { await navigator.share({ title: "Door & window schedule — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ } }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Door & Window Schedule — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · Typical sizes — confirm on the drawing.`, 14, 26);
    let y = 38; doc.setFontSize(10);
    for (const line of summaryText().split("\n")) { doc.text(line, 14, y, { maxWidth: 180 }); y += 7; if (y > 280) { doc.addPage(); y = 20; } }
    doc.save("door-window-schedule-civil-estimation-pro.pdf");
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "Leaf, frame and opening", theoretical: "Frame-outer W = leaf W + 2×frame section; frame-outer H = leaf H + 1×section (door) or 2×section (window)\nMasonry opening = frame-outer + 10 mm clearance per side (door height: head only, +10 mm)\nClear width = leaf W − 2×25 mm stop allowance", applied: rows.map((r, i) => `${r.mark}: frame-outer ${totals.rows[i].frameOuterWidthM.toFixed(2)} × ${totals.rows[i].frameOuterHeightM.toFixed(2)} m; opening ${totals.rows[i].openingWidthM.toFixed(2)} × ${totals.rows[i].openingHeightM.toFixed(2)} m; clear ${totals.rows[i].clearWidthM.toFixed(2)} m`).join("\n") },
    { id: 2, label: "Lintel and frame", theoretical: "Lintel length = masonry opening W + 0.30 m (150 mm bearing each side)\nLintel volume = lintel length × 0.15 m × wall thickness\nFrame length = 2 × frame-outer H + frame-outer W (door, no sill) or 2 × (H + W) (window/ventilator)", applied: rows.map((r, i) => `${r.mark}: lintel ${totals.rows[i].lintelLengthM.toFixed(2)} m (${totals.rows[i].lintelVolumeM3.toFixed(3)} m³); frame ${totals.rows[i].frameLengthM.toFixed(2)} r.m`).join("\n") },
    { id: 3, label: "Glass and cost", theoretical: "Glass = (leaf W − 2×frame section) × (leaf H − frame section − 50 mm sill rail), glazed shutters only\nCost = frame length × rate/m + leaf area × rate/m² + hardware sets × rate/set", applied: `Total glass ${totals.totalGlassAreaM2.toFixed(2)} m²; hardware sets ${totals.totalHardwareSets}\nTotal cost ${money(totals.totalCost, currency)}` },
  ];

  return (
    <div className="w-full space-y-6">
      <p className="text-base text-txt-secondary leading-relaxed">Every door and window in the house, scheduled. Leaf, frame and masonry opening sizes, lintel lengths, glass area, hardware sets and cost — with standard presets and CSV and PDF export.</p>
      <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-txt-primary"><Columns className="w-6 h-6 text-accent-800" /> Door &amp; Window Schedule Generator</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-surface-hover p-1 rounded-xl">
              {(["m", "ft", "mm"] as const).map((u) => (
                <Button key={u} onClick={() => setUnit(u)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unit === u ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary"}`}>{u}</Button>
              ))}
            </div>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as FinishesCurrency)} className="bg-surface-hover border border-ui-borderSubtle rounded-xl px-3 py-2 text-sm font-semibold" aria-label="Currency">
              {(["PKR", "INR", "AED", "USD"] as const).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}</Button>
            <Button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Share2 size={16} /> {shared ? "Shared / copied" : "Share"}</Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Printer size={16} /> Print</Button>
            <Button onClick={handlePdf} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> PDF</Button>
            <Button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> Export CSV</Button>
          </div>
        </div>
        <p className="text-sm text-txt-secondary mb-4">Sizes are typical — confirm on the drawing. Lintel = masonry opening + 300 mm (150 mm bearing each side). Glass uses a 50 mm sill-rail allowance.</p>
        {errors.length > 0 && (
          <div className="rounded-xl border border-ui-errorBorder bg-ui-error p-4 text-sm text-ui-errorText mb-4" role="alert">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {warnings.map((w) => <p key={w} className="text-sm text-accent-800 bg-accent-50 border border-accent-100 rounded-xl px-4 py-2 mb-2">{w}</p>)}

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-sm font-medium text-txt-secondary">Add preset:</span>
          <select onChange={(e) => { if (e.target.value) { addPreset(e.target.value); e.target.value = ""; } }} className={inputCls} defaultValue="" aria-label="Add preset size">
            <option value="" disabled>Choose a standard size…</option>
            {DOOR_WINDOW_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.mark} — {p.room} {p.leafWidthM} × {p.leafHeightM} m ({p.kind})</option>)}
          </select>
          <Button onClick={() => setRows([...rows, { id: `row-${Date.now()}`, mark: nextMark("door"), kind: "door" as DoorWindowKind, room: "", leafWidthM: 0.9, leafHeightM: 2.1, frameMaterial: "timber", shutterType: "flush", glass: "none", frameSectionMm: 100, sillHeightM: 0, qty: 1, wallThicknessM: 0.23, frameRatePerM: null, leafRatePerM2: null, hardwareRatePerSet: null }])} className="flex items-center gap-1 text-accent-800 bg-accent-50 px-3 py-2 rounded-full text-sm font-semibold"><Plus size={16} /> Add row</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-hover text-txt-primary border-y border-ui-borderSubtle">
                <th className="p-2">Mark</th><th className="p-2">Kind</th><th className="p-2">Room</th>
                <th className="p-2">Leaf W ({unit})</th><th className="p-2">Leaf H ({unit})</th><th className="p-2">Qty</th>
                <th className="p-2">Leaf area (m²)</th><th className="p-2">Frame-outer (m)</th><th className="p-2">Opening (m)</th>
                <th className="p-2">Clear W (m)</th><th className="p-2">Sill (m)</th><th className="p-2">Lintel (m)</th>
                <th className="p-2">Frame (r.m)</th><th className="p-2">Glass (m²)</th><th className="p-2">Frame</th><th className="p-2">Shutter</th><th className="p-2">Glass</th>
                <th className="p-2">Frame rate/m</th><th className="p-2">Leaf rate/m²</th><th className="p-2">Hardware/set</th><th className="p-2">Amount</th><th className="p-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {rows.map((r, i) => {
                const res = totals.rows[i];
                return (
                  <tr key={r.id}>
                    <td className="p-2"><input value={r.mark} onChange={(e) => update(r.id, { mark: e.target.value })} className="w-16 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Mark" /></td>
                    <td className="p-2"><select value={r.kind} onChange={(e) => update(r.id, { kind: e.target.value as DoorWindowKind })} className="bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm"><option value="door">Door</option><option value="window">Window</option><option value="ventilator">Ventilator</option></select></td>
                    <td className="p-2"><input value={r.room} onChange={(e) => update(r.id, { room: e.target.value })} className="w-24 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Room" /></td>
                    <td className="p-2"><input type="number" min="0" step="any" value={fmt(r.leafWidthM)} onChange={(e) => update(r.id, { leafWidthM: toM(parseFloat(e.target.value) || 0) })} className="w-20 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Leaf width" /></td>
                    <td className="p-2"><input type="number" min="0" step="any" value={fmt(r.leafHeightM)} onChange={(e) => update(r.id, { leafHeightM: toM(parseFloat(e.target.value) || 0) })} className="w-20 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Leaf height" /></td>
                    <td className="p-2"><input type="number" min="1" max="99" step="1" value={r.qty} onChange={(e) => update(r.id, { qty: parseInt(e.target.value, 10) || 0 })} className="w-14 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Quantity" /></td>
                    <td className="p-2 font-medium">{res.totalLeafAreaM2.toFixed(2)}</td>
                    <td className="p-2 font-mono text-xs">{res.frameOuterWidthM.toFixed(2)} × {res.frameOuterHeightM.toFixed(2)}</td>
                    <td className="p-2 font-mono text-xs">{res.openingWidthM.toFixed(2)} × {res.openingHeightM.toFixed(2)}</td>
                    <td className="p-2">{res.clearWidthM.toFixed(2)}</td>
                    <td className="p-2"><input type="number" min="0" max="1.8" step="any" value={r.sillHeightM} onChange={(e) => update(r.id, { sillHeightM: parseFloat(e.target.value) || 0 })} className="w-16 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Sill height" /></td>
                    <td className="p-2 font-mono">{res.lintelLengthM.toFixed(2)}</td>
                    <td className="p-2">{(res.frameLengthM * r.qty).toFixed(2)}</td>
                    <td className="p-2">{(res.glassAreaM2 * r.qty).toFixed(2)}</td>
                    <td className="p-2"><select value={r.frameMaterial} onChange={(e) => update(r.id, { frameMaterial: e.target.value })} className="bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm"><option value="timber">Timber</option><option value="UPVC">UPVC</option><option value="aluminium">Aluminium</option><option value="steel">Steel</option><option value="GI">GI</option></select></td>
                    <td className="p-2"><select value={r.shutterType} onChange={(e) => update(r.id, { shutterType: e.target.value })} className="bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm"><option value="flush">Flush</option><option value="solid">Solid</option><option value="panelled">Panelled</option><option value="sliding">Sliding</option><option value="fixed">Fixed</option><option value="louvred">Louvred</option></select></td>
                    <td className="p-2"><select value={r.glass} onChange={(e) => update(r.id, { glass: e.target.value })} className="bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm"><option value="none">None</option><option value="clear-5mm">Clear 5 mm</option><option value="tempered">Tempered</option><option value="frosted">Frosted</option></select></td>
                    <td className="p-2"><input type="number" min="0" value={r.frameRatePerM ?? ""} onChange={(e) => update(r.id, { frameRatePerM: e.target.value === "" ? null : parseFloat(e.target.value) || 0 })} className="w-20 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Frame rate" placeholder="—" /></td>
                    <td className="p-2"><input type="number" min="0" value={r.leafRatePerM2 ?? ""} onChange={(e) => update(r.id, { leafRatePerM2: e.target.value === "" ? null : parseFloat(e.target.value) || 0 })} className="w-20 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Leaf rate" placeholder="—" /></td>
                    <td className="p-2"><input type="number" min="0" value={r.hardwareRatePerSet ?? ""} onChange={(e) => update(r.id, { hardwareRatePerSet: e.target.value === "" ? null : parseFloat(e.target.value) || 0 })} className="w-20 bg-surface-hover border border-ui-borderSubtle px-2 py-1.5 rounded-lg text-sm" aria-label="Hardware rate" placeholder="—" /></td>
                    <td className="p-2 font-medium">{money(res.rowCost, currency)}</td>
                    <td className="p-2"><Button onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="text-ui-errorText px-2 py-1">✕</Button></td>
                  </tr>
                );
              })}
              <tr className="font-bold bg-surface-hover">
                <td className="p-2" colSpan={6}>Totals</td>
                <td className="p-2">{totals.totalLeafAreaM2.toFixed(2)}</td>
                <td className="p-2" colSpan={4} />
                <td className="p-2">{totals.totalLintelVolumeM3.toFixed(2)} m³ lintel concrete</td>
                <td className="p-2">{totals.totalFrameLengthM.toFixed(2)}</td>
                <td className="p-2">{totals.totalGlassAreaM2.toFixed(2)}</td>
                <td className="p-2" colSpan={4}>{totals.totalHardwareSets} hardware sets</td>
                <td className="p-2">{money(totals.totalCost, currency)}</td>
                <td className="p-2" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Leaf, frame and opening — three different sizes</h2>
          <p>
            A door has three sizes, and confusing them is the most common scheduling error. The leaf is the moving
            shutter. The frame-outer size is the leaf plus the frame section on each side — and a head section for
            doors, two sections for windows. The masonry opening is the frame-outer size plus about 10 mm clearance
            per side so the frame can be fixed and packed. The lintel sits over the masonry opening, not over the
            leaf: lintel length is the opening width plus 300 mm of bearing. This schedule works all three sizes out
            from the leaf you enter, so the mason, the carpenter and the supplier are all reading the same numbers.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Glass, hardware and cost</h2>
          <p>
            Glass is the leaf width minus two frame sections, times the leaf height minus the frame section and a
            50 mm sill rail — for glazed shutters only. Hardware is one set per unit: hinges, lockset, tower bolt and
            stopper for a door; rollers and a latch for a sliding window. Cost is frame length times the rate per
            metre, plus leaf area times the rate per square metre, plus hardware sets times the rate per set. Enter
            your rates and the schedule totals the cost; leave them blank and the quantities still stand on their own.
          </p>
        </section>
      </article>
      <CalculationHistory calculatorId="door_window_schedule" currentInputs={{unit, currency, rows}} currentResults={{ totalLeafAreaM2: totals.totalLeafAreaM2, totalFrameLengthM: totals.totalFrameLengthM, totalGlassAreaM2: totals.totalGlassAreaM2, totalLintelVolumeM3: totals.totalLintelVolumeM3, totalHardwareSets: totals.totalHardwareSets, totalCost: totals.totalCost }} onRestore={(ins) => {
          if (ins.unit != null) setUnit(ins.unit as typeof unit);
          if (ins.currency != null) setCurrency(ins.currency as typeof currency);
          if (ins.rows != null) setRows(ins.rows as typeof rows);
        }} />
      <FormulaAccordion steps={steps} />
    </div>
  );
}
