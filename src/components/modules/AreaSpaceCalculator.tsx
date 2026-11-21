import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import {
  calcShape, calcPlot, calcProperty, calcPlasterDeduction, calcRoof, convertArea,
  type ShapeKind,
} from "../../lib/areaSpaceCalc";
import { useBOQ } from "../../context/BOQContext";
import { Ruler, Check, Copy, Download, Printer, Share2, Plus, Trash2 } from "lucide-react";

type Unit = "m" | "ft";
const FT = 3.28084;
const inputCls = "w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none";
const labelCls = "text-sm font-medium text-txt-secondary";


type Tab = "shape" | "plot" | "property" | "plaster" | "roof";
const TABS: { id: Tab; label: string }[] = [
  { id: "shape", label: "2D Shapes" },
  { id: "plot", label: "Triangulation" },
  { id: "property", label: "RERA Areas" },
  { id: "plaster", label: "Plaster / Paint Deductions" },
  { id: "roof", label: "Roof Pitch" },
];

export default function AreaSpaceCalculator() {
  const { addItem } = useBOQ();
  const [unit, setUnit] = useState<Unit>("m");
  const [activeTab, setActiveTab] = useState<Tab>("shape");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Shape tab
  const [shapeType, setShapeType] = useState<ShapeKind>("rectangle");
  const [sLen, setSLen] = useState("5");
  const [sWid, setSWid] = useState("4");
  const [sRad, setSRad] = useState("3");
  const [sA, setSA] = useState("5");
  const [sB, setSB] = useState("7");
  const [sC, setSC] = useState("4");
  const [sH, setSH] = useState("3");
  const [lOverallL, setLOverallL] = useState("5");
  const [lOverallW, setLOverallW] = useState("3");
  const [lArm1, setLArm1] = useState("2");
  const [lArm2, setLArm2] = useState("2");
  const [tTop, setTTop] = useState("6");
  const [tThick, setTThick] = useState("1");
  const [tLeg, setTLeg] = useState("2");
  const [tHeight, setTHeight] = useState("5");
  const [polygon, setPolygon] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 4, y: 4 }, { x: 1, y: 3 },
  ]);
  // Plot tab
  const [plotN, setPlotN] = useState("30");
  const [plotS, setPlotS] = useState("30");
  const [plotE, setPlotE] = useState("40");
  const [plotW, setPlotW] = useState("40");
  const [plotD, setPlotD] = useState("50");
  // Property tab
  const [propCarpet, setPropCarpet] = useState("100");
  const [propInt, setPropInt] = useState("10");
  const [propExt, setPropExt] = useState("5");
  const [propBalcony, setPropBalcony] = useState("10");
  const [propCommon, setPropCommon] = useState("20");
  // Plaster tab
  const [wallLen, setWallLen] = useState("5");
  const [wallHt, setWallHt] = useState("3");
  const [faces, setFaces] = useState<1 | 2>(1);
  const [jambDepth, setJambDepth] = useState("0.2");
  const [openings, setOpenings] = useState<{ id: string; w: string; h: string; count: string }[]>([
    { id: "o1", w: "1", h: "2", count: "1" },
  ]);
  // Roof tab
  const [roofFloor, setRoofFloor] = useState("150");
  const [roofPitch, setRoofPitch] = useState("30");
  const [roofOverhang, setRoofOverhang] = useState("0.6");
  const [roofPerim, setRoofPerim] = useState("50");

  const toM = (v: number) => (unit === "ft" ? v * 0.3048 : v);
  const toM2 = (v: number) => (unit === "ft" ? v * 0.092903 : v);
  const areaOut = (m2: number) => (unit === "ft" ? m2 * 10.7639 : m2);
  // Lengths (including perimeters) convert with FT; the old code showed the
  // metre perimeter with an "ft" label (18 m displayed as "18 ft").
  const lenOut = (m: number) => (unit === "ft" ? m * FT : m);
  const uLen = unit === "m" ? "m" : "ft";
  const uArea = unit === "m" ? "m²" : "sq ft";

  const shape = useMemo(() => calcShape(shapeType, {
    lengthM: toM(parseFloat(sLen) || 0), widthM: toM(parseFloat(sWid) || 0),
    radiusM: toM(parseFloat(sRad) || 0), sideAM: toM(parseFloat(sA) || 0),
    sideBM: toM(parseFloat(sB) || 0), sideCM: toM(parseFloat(sC) || 0),
    heightM: toM(parseFloat(sH) || 0),
    overallLengthM: toM(parseFloat(lOverallL) || 0), overallWidthM: toM(parseFloat(lOverallW) || 0),
    arm1M: toM(parseFloat(lArm1) || 0), arm2M: toM(parseFloat(lArm2) || 0),
    topWidthM: toM(parseFloat(tTop) || 0), topThicknessM: toM(parseFloat(tThick) || 0),
    legWidthM: toM(parseFloat(tLeg) || 0), totalHeightM: toM(parseFloat(tHeight) || 0),
    polygon: polygon.map((p) => ({ x: toM(p.x), y: toM(p.y) })),
  }), [shapeType, sLen, sWid, sRad, sA, sB, sC, sH, lOverallL, lOverallW, lArm1, lArm2, tTop, tThick, tLeg, tHeight, polygon, unit]);

  const plot = useMemo(() => calcPlot({
    northM: toM(parseFloat(plotN) || 0), southM: toM(parseFloat(plotS) || 0),
    eastM: toM(parseFloat(plotE) || 0), westM: toM(parseFloat(plotW) || 0),
    diagonalM: toM(parseFloat(plotD) || 0),
  }), [plotN, plotS, plotE, plotW, plotD, unit]);

  const property = useMemo(() => calcProperty({
    carpetM2: toM2(parseFloat(propCarpet) || 0),
    internalWallsPct: parseFloat(propInt) || 0,
    externalWallsPct: parseFloat(propExt) || 0,
    balconyM2: toM2(parseFloat(propBalcony) || 0),
    commonAreaPct: parseFloat(propCommon) || 0,
  }), [propCarpet, propInt, propExt, propBalcony, propCommon, unit]);

  const plaster = useMemo(() => calcPlasterDeduction({
    wallLengthM: toM(parseFloat(wallLen) || 0), wallHeightM: toM(parseFloat(wallHt) || 0),
    faces,
    openings: openings.map((o, i) => ({
      id: o.id, kind: "door" as const,
      widthM: toM(parseFloat(o.w) || 0), heightM: toM(parseFloat(o.h) || 0),
      count: parseInt(o.count, 10) || 0,
    })),
    jambDepthM: toM(parseFloat(jambDepth) || 0), lengthUnit: unit,
  }), [wallLen, wallHt, faces, openings, jambDepth, unit]);

  const roof = useMemo(() => calcRoof({
    floorAreaM2: toM2(parseFloat(roofFloor) || 0),
    pitchDegrees: parseFloat(roofPitch) || 0,
    overhangM: toM(parseFloat(roofOverhang) || 0),
    perimeterM: toM(parseFloat(roofPerim) || 0),
  }), [roofFloor, roofPitch, roofOverhang, roofPerim, unit]);
  const roofErrors = parseFloat(roofPitch) < 0 || parseFloat(roofPitch) >= 90 ? ["Roof pitch must be between 0° and 89°."] : [];

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const f = u === "ft" ? FT : 1 / FT;
    const conv = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f).toFixed(3)));
    };
    const convA = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f * f).toFixed(2)));
    };
    [setSLen, setSWid, setSRad, setSA, setSB, setSC, setSH, setLOverallL, setLOverallW, setLArm1, setLArm2, setTTop, setTThick, setTLeg, setTHeight, setPlotN, setPlotS, setPlotE, setPlotW, setPlotD, setWallLen, setWallHt, setJambDepth, setRoofOverhang, setRoofPerim].forEach((s, i) => {
      const vals = [sLen, sWid, sRad, sA, sB, sC, sH, lOverallL, lOverallW, lArm1, lArm2, tTop, tThick, tLeg, tHeight, plotN, plotS, plotE, plotW, plotD, wallLen, wallHt, jambDepth, roofOverhang, roofPerim];
      conv(s, vals[i]);
    });
    convA(setRoofFloor, roofFloor); convA(setPropCarpet, propCarpet); convA(setPropBalcony, propBalcony);
    setPolygon(polygon.map((p) => ({ x: +(p.x * f).toFixed(2), y: +(p.y * f).toFixed(2) })));
    setOpenings(openings.map((o) => ({ ...o, w: String(+(parseFloat(o.w) * f).toFixed(2)), h: String(+(parseFloat(o.h) * f).toFixed(2)) })));
    setUnit(u);
  };

  const currentAreaM2 =
    activeTab === "shape" ? shape.areaM2
    : activeTab === "plot" ? plot.totalM2 ?? 0
    : activeTab === "property" ? property.superBuiltUpM2
    : activeTab === "plaster" ? plaster.netAreaM2
    : roof.trueAreaM2;
  const conv = convertArea(currentAreaM2);

  const summaryText = () => [
    "Area calculation — Civil Estimation Pro",
    activeTab === "shape" ? `Shape ${shapeType}: area ${shape.areaM2.toFixed(2)} m², perimeter ${shape.perimeterM.toFixed(2)} m` : "",
    activeTab === "plot" ? `Plot: ${plot.totalM2 != null ? plot.totalM2.toFixed(2) : "—"} m² (triangles ${plot.area1M2?.toFixed(2) ?? "—"} + ${plot.area2M2?.toFixed(2) ?? "—"}), perimeter ${plot.perimeterM.toFixed(2)} m` : "",
    activeTab === "property" ? `RERA: carpet ${property.traditionalCarpetM2.toFixed(2)} → RERA ${property.reraCarpetM2.toFixed(2)} → plinth ${property.plinthM2.toFixed(2)} → built-up ${property.builtUpM2.toFixed(2)} → super built-up ${property.superBuiltUpM2.toFixed(2)} m²` : "",
    activeTab === "plaster" ? `Plaster area: gross ${plaster.grossAreaM2.toFixed(2)} − deductions ${plaster.totalDeductionM2.toFixed(2)} + jambs ${plaster.jambsM2.toFixed(2)} = net ${plaster.netAreaM2.toFixed(2)} m²` : "",
    activeTab === "roof" ? `Roof: horizontal ${roof.horizontalAreaM2.toFixed(2)} m², true ${roof.trueAreaM2.toFixed(2)} m² (multiplier ${roof.pitchMultiplier.toFixed(3)}, pitch ${roof.pitchRatio})` : "",
    `Conversions: ${conv.sqft.toFixed(2)} sq ft · ${conv.sqyd.toFixed(2)} sq yd · ${conv.marla.toFixed(3)} marla · ${conv.kanal.toFixed(4)} kanal`,
  ].filter(Boolean).join("\n");

  const handleCopy = async () => { try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) { try { await navigator.share({ title: "Area calculation — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ } }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Area Calculation — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")}`, 14, 26);
    let y = 38; doc.setFontSize(11);
    for (const line of summaryText().split("\n")) { doc.text(line, 14, y, { maxWidth: 180 }); y += 8; }
    doc.save("area-calculation-civil-estimation-pro.pdf");
  };
  const handleGenerateBOQ = () => {
    addItem({ name: `Plaster / paint area (${activeTab})`, quantity: +currentAreaM2.toFixed(2), unit: "m²", rate: 0, category: "Finishes" });
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "Shape", theoretical: "Rectangle L×W; circle πr²; triangle Heron; trapezoid (a+b)/2×h (perimeter assumes an isosceles trapezoid); L-shape = overall L×arm1 + (overall W−arm1)×arm2, perimeter 2×(overall L+overall W); polygon shoelace", applied: `Area = ${shape.areaM2.toFixed(2)} m²; perimeter = ${shape.perimeterM.toFixed(2)} m` },
    { id: 2, label: "Plot triangulation", theoretical: "Split the plot on the diagonal into two triangles; Heron: s=(a+b+c)/2, area=√(s(s−a)(s−b)(s−c))", applied: plot.totalM2 != null ? `Triangles ${plot.area1M2!.toFixed(2)} + ${plot.area2M2!.toFixed(2)} = ${plot.totalM2.toFixed(2)} m²` : (plot.error ?? "Invalid diagonal") },
    { id: 3, label: "Plaster deductions (IS 1200)", theoretical: "<0.5 m²: no deduction; 0.5–3 m²: deduct the FULL opening area once (one face); >3 m²: deduct both faces + jambs (2h+w)×jamb depth", applied: `Gross ${plaster.grossAreaM2.toFixed(2)} − ${plaster.totalDeductionM2.toFixed(2)} + ${plaster.jambsM2.toFixed(2)} = net ${plaster.netAreaM2.toFixed(2)} m²` },
    { id: 4, label: "Roof pitch", theoretical: "True area = (floor area + perimeter × overhang) ÷ cos(pitch)", applied: `Horizontal ${roof.horizontalAreaM2.toFixed(2)} m² ÷ cos(${roofPitch}°) = ${roof.trueAreaM2.toFixed(2)} m² (×${roof.pitchMultiplier.toFixed(3)}, pitch ${roof.pitchRatio})` },
  ];

  const NumField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2"><label className={labelCls}>{label}</label><input type="number" min="0" step="any" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>
  );
  const ConvTable = () => (
    <div className="bg-surface-default rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
      <h3 className="text-lg font-bold mb-4">Conversions</h3>
      {[
        ["m²", conv.m2.toFixed(2)],
        ["sq ft", conv.sqft.toFixed(2)],
        ["sq yd", conv.sqyd.toFixed(2)],
        ["marla", conv.marla.toFixed(3)],
        ["kanal", conv.kanal.toFixed(4)],
      ].map(([u, v]) => (
        <div key={u} className="flex justify-between py-2 border-b border-ui-borderSubtle last:border-0 text-sm">
          <span className="text-txt-secondary">{u}</span><span className="font-bold">{v}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6 px-4 md:px-0">
      <p className="text-base text-txt-secondary leading-relaxed px-4 md:px-0">Geometric triangulation, the RERA area ladder, roof pitch multipliers and IS 1200 opening deductions — with marla and kanal conversions on every tab and a BOQ handoff for the result.</p>
      <div className="w-full bg-surface-default/80 rounded-2xl border border-white/20 p-4 sm:p-6 shadow-brand-sm">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-txt-primary"><div className="p-3 bg-accent-50 text-accent-800 rounded-2xl"><Ruler className="w-8 h-8" /></div> Plot Area Calculator — Irregular Land, RERA &amp; IS Code Compliant</h2>
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
            <Button onClick={handleGenerateBOQ} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> Generate BOQ</Button>
          </div>
        </div>
        <p className="mt-2 text-base text-txt-secondary leading-relaxed">Geometric triangulation, RERA area ladder, roof pitch multiplier and IS 1200 opening deductions — with marla/kanal conversions on every tab.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === t.id ? "bg-ink text-white" : "bg-surface-default border border-ui-borderSubtle text-txt-secondary"}`}>{t.label}</Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="flex-1 min-w-[min(100%,380px)] space-y-6">
          {activeTab === "shape" && (
            <div className="bg-surface-default/80 rounded-2xl border border-white/20 p-6 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-medium">2D Shape Calculator</h3>
              <div><label className={labelCls}>Shape</label>
                <select value={shapeType} onChange={(e) => setShapeType(e.target.value as ShapeKind)} className={inputCls}>
                  <option value="rectangle">Rectangle</option><option value="square">Square</option><option value="circle">Circle</option>
                  <option value="triangle">Triangle (Heron)</option><option value="trapezoid">Trapezoid</option>
                  <option value="l-shape">L-shape</option><option value="t-shape">T-shape</option><option value="polygon">Polygon (vertices)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {shapeType === "rectangle" && (<><NumField label={`Length (${uLen})`} value={sLen} onChange={setSLen} /><NumField label={`Width (${uLen})`} value={sWid} onChange={setSWid} /></>)}
                {shapeType === "square" && <NumField label={`Side (${uLen})`} value={sLen} onChange={setSLen} />}
                {shapeType === "circle" && <NumField label={`Radius (${uLen})`} value={sRad} onChange={setSRad} />}
                {shapeType === "triangle" && (<><NumField label={`Side A (${uLen})`} value={sA} onChange={setSA} /><NumField label={`Side B (${uLen})`} value={sB} onChange={setSB} /><NumField label={`Side C (${uLen})`} value={sC} onChange={setSC} /></>)}
                {shapeType === "trapezoid" && (<><NumField label={`Top base (${uLen})`} value={sA} onChange={setSA} /><NumField label={`Bottom base (${uLen})`} value={sB} onChange={setSB} /><NumField label={`Height (${uLen})`} value={sH} onChange={setSH} /></>)}
                {shapeType === "l-shape" && (<>
                  <NumField label={`Overall length (${uLen})`} value={lOverallL} onChange={setLOverallL} />
                  <NumField label={`Overall width (${uLen})`} value={lOverallW} onChange={setLOverallW} />
                  <NumField label={`Arm 1 width (${uLen})`} value={lArm1} onChange={setLArm1} />
                  <NumField label={`Arm 2 width (${uLen})`} value={lArm2} onChange={setLArm2} />
                </>)}
                {shapeType === "t-shape" && (<>
                  <NumField label={`Top width (${uLen})`} value={tTop} onChange={setTTop} />
                  <NumField label={`Top thickness (${uLen})`} value={tThick} onChange={setTThick} />
                  <NumField label={`Leg width (${uLen})`} value={tLeg} onChange={setTLeg} />
                  <NumField label={`Total height (${uLen})`} value={tHeight} onChange={setTHeight} />
                </>)}
                {shapeType === "polygon" && (
                  <div className="col-span-2 space-y-2">
                    <label className={labelCls}>Vertices (x, y in {uLen})</label>
                    {polygon.map((p, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="number" step="any" value={p.x} onChange={(e) => setPolygon(polygon.map((q, j) => j === i ? { ...q, x: parseFloat(e.target.value) || 0 } : q))} className={inputCls} aria-label={`Vertex ${i + 1} x`} />
                        <input type="number" step="any" value={p.y} onChange={(e) => setPolygon(polygon.map((q, j) => j === i ? { ...q, y: parseFloat(e.target.value) || 0 } : q))} className={inputCls} aria-label={`Vertex ${i + 1} y`} />
                        <Button onClick={() => setPolygon(polygon.filter((_, j) => j !== i))} className="text-ui-errorText px-2"><Trash2 size={16} /></Button>
                      </div>
                    ))}
                    <Button onClick={() => setPolygon([...polygon, { x: 0, y: 0 }])} className="flex items-center gap-1 text-accent-800 text-sm font-semibold"><Plus size={16} /> Add vertex</Button>
                  </div>
                )}
              </div>
              <p className="text-lg font-bold">Area: {areaOut(shape.areaM2).toFixed(2)} {uArea} · Perimeter: {lenOut(shape.perimeterM).toFixed(2)} {uLen === "m" ? "m" : "ft"}</p>
            </div>
          )}

          {activeTab === "plot" && (
            <div className="bg-surface-default/80 rounded-2xl border border-white/20 p-6 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-medium">Plot Triangulation (Heron)</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumField label={`North boundary (${uLen})`} value={plotN} onChange={setPlotN} />
                <NumField label={`South boundary (${uLen})`} value={plotS} onChange={setPlotS} />
                <NumField label={`East boundary (${uLen})`} value={plotE} onChange={setPlotE} />
                <NumField label={`West boundary (${uLen})`} value={plotW} onChange={setPlotW} />
                <NumField label={`Diagonal (${uLen})`} value={plotD} onChange={setPlotD} />
              </div>
              {plot.error ? (
                <p className="text-sm text-ui-errorText bg-ui-error border border-ui-errorBorder rounded-xl px-4 py-2">{plot.error}</p>
              ) : (
                <p className="text-lg font-bold">Plot area: {areaOut(plot.totalM2 ?? 0).toFixed(2)} {uArea} (triangles {areaOut(plot.area1M2 ?? 0).toFixed(2)} + {areaOut(plot.area2M2 ?? 0).toFixed(2)}) · Perimeter: {lenOut(plot.perimeterM).toFixed(2)} {uLen}</p>
              )}
            </div>
          )}

          {activeTab === "property" && (
            <div className="bg-surface-default/80 rounded-2xl border border-white/20 p-6 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-medium">RERA Area Ladder</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumField label={`Carpet area (${uArea})`} value={propCarpet} onChange={setPropCarpet} />
                <NumField label="Internal walls (%)" value={propInt} onChange={setPropInt} />
                <NumField label="External walls (%)" value={propExt} onChange={setPropExt} />
                <NumField label={`Balcony area (${uArea})`} value={propBalcony} onChange={setPropBalcony} />
                <NumField label="Common area (%)" value={propCommon} onChange={setPropCommon} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>RERA carpet</span><strong>{areaOut(property.reraCarpetM2).toFixed(2)} {uArea}</strong></div>
                <div className="flex justify-between"><span>Plinth</span><strong>{areaOut(property.plinthM2).toFixed(2)} {uArea}</strong></div>
                <div className="flex justify-between"><span>Built-up</span><strong>{areaOut(property.builtUpM2).toFixed(2)} {uArea}</strong></div>
                <div className="flex justify-between"><span>Super built-up (loading {property.loadingFactorPct.toFixed(1)}%)</span><strong>{areaOut(property.superBuiltUpM2).toFixed(2)} {uArea}</strong></div>
              </div>
            </div>
          )}

          {activeTab === "plaster" && (
            <div className="bg-surface-default/80 rounded-2xl border border-white/20 p-6 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-medium">Plaster / Paint Deductions (IS 1200)</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumField label={`Wall length (${uLen})`} value={wallLen} onChange={setWallLen} />
                <NumField label={`Wall height (${uLen})`} value={wallHt} onChange={setWallHt} />
                <div><label className={labelCls}>Faces</label>
                  <select value={faces} onChange={(e) => setFaces(Number(e.target.value) as 1 | 2)} className={inputCls}>
                    <option value={1}>Single face</option><option value={2}>Both faces</option>
                  </select>
                </div>
                <NumField label={`Jamb depth (${uLen})`} value={jambDepth} onChange={setJambDepth} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Openings</label>
                {openings.map((o) => (
                  <div key={o.id} className="flex gap-2 items-center">
                    <input type="number" min="0" step="any" value={o.w} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, w: e.target.value } : x))} className={inputCls} aria-label="Opening width" />
                    <span>×</span>
                    <input type="number" min="0" step="any" value={o.h} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, h: e.target.value } : x))} className={inputCls} aria-label="Opening height" />
                    <input type="number" min="1" step="1" value={o.count} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, count: e.target.value } : x))} className="w-16 bg-surface-hover border border-ui-borderSubtle px-2 py-2 rounded-xl" aria-label="Opening count" />
                    <span className="text-sm text-txt-tertiary">{plaster.perOpening[openings.indexOf(o)]?.rule ?? ""}</span>
                    <Button onClick={() => setOpenings(openings.filter((x) => x.id !== o.id))} className="text-ui-errorText px-2"><Trash2 size={16} /></Button>
                  </div>
                ))}
                <Button onClick={() => setOpenings([...openings, { id: `o${Date.now()}`, w: "1", h: "2", count: "1" }])} className="flex items-center gap-1 text-accent-800 text-sm font-semibold"><Plus size={16} /> Add opening</Button>
              </div>
              <p className="text-lg font-bold">Net plaster area: {areaOut(plaster.netAreaM2).toFixed(2)} {uArea} (gross {areaOut(plaster.grossAreaM2).toFixed(2)} − deductions {areaOut(plaster.totalDeductionM2).toFixed(2)} + jambs {areaOut(plaster.jambsM2).toFixed(2)})</p>
              <p className="text-xs text-txt-tertiary">Fixed bug: a single-face 0.5–3 m² opening now deducts the FULL opening area (the old code deducted half — e.g. 13.05 m² instead of the correct 11.10 m² on the worked example).</p>
            </div>
          )}

          {activeTab === "roof" && (
            <div className="bg-surface-default/80 rounded-2xl border border-white/20 p-6 shadow-brand-sm space-y-6">
              <h3 className="text-lg font-medium">Roof Pitch Area</h3>
              {roofErrors.map((e) => <p key={e} className="text-sm text-ui-errorText bg-ui-error border border-ui-errorBorder rounded-xl px-4 py-2">{e}</p>)}
              <div className="grid grid-cols-2 gap-4">
                <NumField label={`Floor area (${uArea})`} value={roofFloor} onChange={setRoofFloor} />
                <NumField label="Pitch angle (°)" value={roofPitch} onChange={setRoofPitch} />
                <NumField label={`Overhang (${uLen})`} value={roofOverhang} onChange={setRoofOverhang} />
                <NumField label={`Eaves perimeter (${uLen})`} value={roofPerim} onChange={setRoofPerim} />
              </div>
              <p className="text-lg font-bold">True roof area: {areaOut(roof.trueAreaM2).toFixed(2)} {uArea} (horizontal {areaOut(roof.horizontalAreaM2).toFixed(2)} · multiplier {roof.pitchMultiplier.toFixed(3)} · pitch {roof.pitchRatio})</p>
            </div>
          )}
        </div>
        <div className="w-full lg:w-80 shrink-0"><ConvTable /></div>
      </div>

      <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Five tabs, one area</h2>
          <p>
            The calculator has five tabs. Shapes covers rectangles, squares, circles, triangles by Heron&rsquo;s
            formula, trapezoids, L-shapes, T-shapes and polygons by the shoelace formula — with visible inputs for
            the L-shape arms and the T-shape top and leg, so you never have to guess which dimension goes where.
            Triangulation measures an irregular plot from its four sides and a diagonal. RERA walks the carpet to
            super built-up ladder. Plaster deductions applies IS 1200 opening rules. Roof pitch turns a floor area
            and a pitch angle into a true sloped area. Every tab shows the result in m², sq ft, sq yd, marla and kanal.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">The plaster deduction that was wrong</h2>
          <p>
            The old version of this tool deducted half the opening area for a single-face opening in the 0.5–3 m²
            band. IS 1200 says the full opening area is deducted on one face. On the worked example — a 15 m² wall
            with 2.1 m² and 1.8 m² of openings, single face — the old code returned 13.05 m² and the correct net area
            is 11.10 m², a 17.6% overstatement. The fix is in the engine and in this calculator: the middle band
            deducts the full opening, once.
          </p>
        </section>
      </article>
      <FormulaAccordion steps={steps} />
    </div>
  );
}
