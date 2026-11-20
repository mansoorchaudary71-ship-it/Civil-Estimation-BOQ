import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import {
  calcRoomArea, calcCarpetFromSuperBuiltUp, validateRoomArea, COMPLIANCE_NOTE,
  type RoomType,
} from "../../lib/roomAreaCalc";
import { Layout, Check, Copy, Download, Printer, Share2 } from "lucide-react";

type Unit = "m" | "ft";
const FT = 3.28084;
const inputCls = "w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none";
const labelCls = "block text-sm font-semibold mb-2";


export default function RoomAreaCalculator() {
  const [unit, setUnit] = useState<Unit>("m");
  const [roomType, setRoomType] = useState<RoomType>("bedroom");
  const [length, setLength] = useState("4");
  const [width, setWidth] = useState("3");
  const [wallThickness, setWallThickness] = useState("0.23");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [loadingFactor, setLoadingFactor] = useState("25");
  const [mode, setMode] = useState<"forward" | "reverse">("forward");
  const [superBuiltUp, setSuperBuiltUp] = useState("19.29");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const toM = (v: number) => (unit === "ft" ? v * 0.3048 : v);
  const inp = {
    roomType,
    lengthM: toM(parseFloat(length) || 0),
    widthM: toM(parseFloat(width) || 0),
    wallThicknessM: toM(parseFloat(wallThickness) || 0),
    ceilingHeightM: ceilingHeight === "" ? null : toM(parseFloat(ceilingHeight) || 0),
    loadingFactorPct: parseFloat(loadingFactor) || 0,
  };
  const errors = validateRoomArea(inp);
  const result = useMemo(() => calcRoomArea(inp), [inp.roomType, inp.lengthM, inp.widthM, inp.wallThicknessM, inp.ceilingHeightM, inp.loadingFactorPct]);
  const reverse = useMemo(
    () => calcCarpetFromSuperBuiltUp(toM(toM(1) * 0) + (unit === "ft" ? parseFloat(superBuiltUp) || 0 : parseFloat(superBuiltUp) || 0) * (unit === "ft" ? 0.092903 : 1), inp.wallThicknessM, inp.lengthM, inp.widthM, inp.loadingFactorPct),
    [superBuiltUp, inp.wallThicknessM, inp.lengthM, inp.widthM, inp.loadingFactorPct, unit],
  );

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const f = u === "ft" ? FT : 1 / FT;
    const conv = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f).toFixed(3)));
    };
    conv(setLength, length); conv(setWidth, width); conv(setWallThickness, wallThickness);
    if (ceilingHeight) conv(setCeilingHeight, ceilingHeight);
    setUnit(u);
  };

  const summaryText = () => [
    "Room area — Civil Estimation Pro",
    `Room: ${roomType}, ${length} × ${width} ${unit}, wall thickness ${wallThickness} ${unit}`,
    `Carpet: ${result.carpetAreaM2.toFixed(2)} m² (${result.carpet.sqft.toFixed(2)} sq ft, ${result.carpet.marla.toFixed(3)} marla)`,
    `Built-up: ${result.builtUpAreaM2.toFixed(2)} m² (${result.builtUp.sqft.toFixed(2)} sq ft)`,
    `Super built-up: ${result.superBuiltUpAreaM2.toFixed(2)} m² (${result.superBuiltUp.sqft.toFixed(2)} sq ft)`,
    result.volumeM3 != null ? `Volume: ${result.volumeM3.toFixed(2)} m³` : "",
    `Compliance (${result.standard}): ${result.passes ? "PASS" : `FAIL — short by ${result.failByAreaM2.toFixed(2)} m² area and ${result.failByWidthM.toFixed(2)} m width`}`,
    COMPLIANCE_NOTE,
  ].filter(Boolean).join("\n");

  const handleCopy = async () => { try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) { try { await navigator.share({ title: "Room area — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ } }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Room Area — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")}`, 14, 26);
    let y = 38; doc.setFontSize(11);
    for (const line of summaryText().split("\n")) { doc.text(line, 14, y, { maxWidth: 180 }); y += 8; }
    doc.save("room-area-civil-estimation-pro.pdf");
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "Carpet and built-up area", theoretical: "Carpet = L × W (internal dimensions)\nBuilt-up = (L + 2t) × (W + 2t), where t = wall thickness\nSuper built-up = Built-up × (1 + loading factor)", applied: `Carpet = ${result.carpetAreaM2.toFixed(2)} m²\nBuilt-up = ${result.builtUpAreaM2.toFixed(2)} m²\nSuper built-up = ${result.superBuiltUpAreaM2.toFixed(2)} m² (loading ${loadingFactor}%)` },
    { id: 2, label: "Unit conversions", theoretical: "1 m² = 10.7639 sq ft; 1 sq yd = 9 sq ft\n1 marla = 272.25 sq ft = 25.293 m²; 1 kanal = 20 marla = 5,445 sq ft", applied: `Carpet: ${result.carpet.sqft.toFixed(2)} sq ft = ${result.carpet.sqyd.toFixed(2)} sq yd = ${result.carpet.marla.toFixed(3)} marla = ${result.carpet.kanal.toFixed(4)} kanal` },
    { id: 3, label: "Compliance check", theoretical: "PASS requires carpet area ≥ minimum area AND room width ≥ minimum width (NBC 2016 Pt 3 — see the NBCS 2026 warning below)", applied: `Required: ${result.minAreaM2} m² and ${result.minWidthM} m width\nProvided: ${result.carpetAreaM2.toFixed(2)} m² and ${result.widthM.toFixed(2)} m width → ${result.passes ? "PASS" : "FAIL"}` },
  ];

  const AreaTable = ({ title, conv }: { title: string; conv: { m2: number; sqft: number; sqyd: number; marla: number; kanal: number } }) => (
    <div className="space-y-2">
      <h4 className="font-bold text-txt-primary">{title}</h4>
      {[
        ["m²", conv.m2.toFixed(2)],
        ["sq ft", conv.sqft.toFixed(2)],
        ["sq yd", conv.sqyd.toFixed(2)],
        ["marla", conv.marla.toFixed(3)],
        ["kanal", conv.kanal.toFixed(4)],
      ].map(([u, v]) => (
        <div key={u} className="flex justify-between py-1.5 border-b border-ui-borderSubtle last:border-0 text-sm">
          <span className="text-txt-secondary">{u}</span><span className="font-bold">{v}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <p className="text-base text-txt-secondary leading-relaxed">Carpet, built-up and super built-up area for any room — in m², sq ft, sq yd, marla and kanal — with an NBC 2016 minimum-size compliance check and a reverse mode that recovers carpet area from a super built-up figure.</p>
      <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Layout className="w-6 h-6 text-accent-800" /> Room Area Calculator (NBC / RERA)</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-surface-hover p-1 rounded-xl">
              {(["m", "ft"] as const).map((u) => (
                <Button key={u} onClick={() => switchUnit(u)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unit === u ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary"}`}>{u === "m" ? "Metric (m)" : "Feet (ft)"}</Button>
              ))}
            </div>
            <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}</Button>
            <Button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Share2 size={16} /> {shared ? "Shared / copied" : "Share"}</Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Printer size={16} /> Print</Button>
            <Button onClick={handlePdf} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> PDF</Button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-xl border border-ui-errorBorder bg-ui-error p-4 text-sm text-ui-errorText mb-4" role="alert">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <Button onClick={() => setMode("forward")} className={`px-4 py-2 rounded-full text-sm font-semibold ${mode === "forward" ? "bg-ink text-white" : "bg-surface-hover text-txt-secondary"}`}>Room → areas</Button>
          <Button onClick={() => setMode("reverse")} className={`px-4 py-2 rounded-full text-sm font-semibold ${mode === "reverse" ? "bg-ink text-white" : "bg-surface-hover text-txt-secondary"}`}>Super built-up → carpet</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelCls}>Room type</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value as RoomType)} className={inputCls}>
              <option value="bedroom">Bedroom</option><option value="living">Living room</option>
              <option value="dining">Dining room</option><option value="study">Study</option>
              <option value="kitchen">Kitchen</option><option value="bathroom">Bathroom (+WC)</option>
              <option value="wc">WC alone</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Wall thickness ({unit})</label>
            <input type="number" min="0" step="any" value={wallThickness} onChange={(e) => setWallThickness(e.target.value)} className={inputCls} />
            <p className="text-xs text-txt-tertiary mt-1">Presets: 115 mm external partition, 230 mm external wall, 345 mm foundation wall.</p>
          </div>
          <div>
            <label className={labelCls}>Internal length ({unit})</label>
            <input type="number" min="0" step="any" value={length} onChange={(e) => setLength(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Internal width ({unit})</label>
            <input type="number" min="0" step="any" value={width} onChange={(e) => setWidth(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Ceiling height ({unit}) — optional, for volume</label>
            <input type="number" min="0" step="any" value={ceilingHeight} onChange={(e) => setCeilingHeight(e.target.value)} className={inputCls} placeholder="e.g. 3" />
          </div>
          <div>
            <label className={labelCls}>Loading factor — super built-up (%)</label>
            <input type="number" min="0" step="any" value={loadingFactor} onChange={(e) => setLoadingFactor(e.target.value)} className={inputCls} />
          </div>
          {mode === "reverse" && (
            <div>
              <label className={labelCls}>Super built-up area ({unit === "ft" ? "sq ft" : "m²"})</label>
              <input type="number" min="0" step="any" value={superBuiltUp} onChange={(e) => setSuperBuiltUp(e.target.value)} className={inputCls} />
              <p className="text-sm text-txt-secondary mt-2">Recovered carpet area: <strong>{reverse.carpetAreaM2.toFixed(2)} m²</strong> (built-up {reverse.builtUpAreaM2.toFixed(2)} m²).</p>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-4 ${result.passes ? "bg-ui-success border-ui-successBorder" : "bg-ui-error border-ui-errorBorder"}`}>
          <div className="flex-1">
            <p className="font-bold mb-1 text-txt-primary">{result.standard} compliance check</p>
            <p className="text-sm text-txt-secondary">
              Required min. area: <strong>{result.minAreaM2} m²</strong>, min. width: <strong>{result.minWidthM} m</strong>. Provided: <strong>{result.carpetAreaM2.toFixed(2)} m²</strong>, width <strong>{result.widthM.toFixed(2)} m</strong>.
              {!result.passes && ` Short by ${result.failByAreaM2.toFixed(2)} m² area and ${result.failByWidthM.toFixed(2)} m width.`}
            </p>
            <p className="text-xs text-txt-tertiary mt-2">{COMPLIANCE_NOTE}</p>
          </div>
          <div className="font-bold text-xl">{result.passes ? <span className="text-ui-successText">PASS</span> : <span className="text-ui-errorText">FAIL</span>}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AreaTable title="Carpet area" conv={result.carpet} />
          <AreaTable title="Built-up area" conv={result.builtUp} />
          <AreaTable title="Super built-up area" conv={result.superBuiltUp} />
        </div>
        {result.volumeM3 != null && (
          <p className="text-sm text-txt-secondary mt-4">Room volume: <strong>{result.volumeM3.toFixed(2)} m³</strong> (carpet area × ceiling height).</p>
        )}
      </div>
      <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Three areas, one room</h2>
          <p>
            A room has three areas and they are not interchangeable. Carpet area is the net usable area inside the
            walls — length times width. Built-up area adds the wall thickness on both sides: (L + 2t) × (W + 2t). A
            4 × 3 m room with 230 mm walls is 12 m² of carpet and 15.43 m² built-up. Super built-up area adds a share
            of the common areas through a loading factor: at 25% the same room is 19.29 m². The loading factor is an
            assumption, so it is shown as one — ask the builder for the exact factor in the sale agreement before you
            rely on a super built-up figure.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Compliance — and the NBCS 2026 warning</h2>
          <p>
            The compliance check uses NBC 2016 Part 3 minima, and it requires both the area and the width: a room
            that is large enough but too narrow still fails. A bathroom of 1.5 × 1.2 m is 1.80 m², below the 2.8 m²
            minimum, so it fails by 1.00 m² — an earlier version of this tool wrongly passed it. One warning: BIS
            replaced NBC 2016 with NBCS 2026 (SP 7:2026) on 30 April 2026, and the NBCS 2026 minima have not been
            verified against SP 7:2026, so the calculator shows the NBC 2016 check and flags the new code as
            unverified rather than shipping minima it cannot confirm.
          </p>
        </section>
      </article>
      <FormulaAccordion steps={steps} />
    </div>
  );
}
