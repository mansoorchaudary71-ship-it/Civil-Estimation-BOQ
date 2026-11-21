import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import {
  calcVolume, validateVolume, horizontalCylinderFillVolume, familyTankSize,
  DENSITY_PRESETS, DEFAULT_VOLUME_DIMS,
  type VolumeShape, type VolumeDims,
} from "../../lib/volumeCalc";
import { useBOQ } from "../../context/BOQContext";
import { Box, Check, Copy, Download, Printer, Share2 } from "lucide-react";

type Unit = "m" | "ft";
const FT = 3.28084;
const inputCls = "w-full bg-surface-hover border border-ui-borderSubtle px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500 outline-none";
const labelCls = "block text-sm font-semibold mb-2";

const SHAPE_LABELS: { id: VolumeShape; label: string }[] = [
  { id: "rect-prism", label: "Rectangular prism / box" },
  { id: "cube", label: "Cube" },
  { id: "cylinder", label: "Cylinder" },
  { id: "sphere", label: "Sphere" },
  { id: "half-sphere", label: "Half sphere (dome)" },
  { id: "cone", label: "Cone" },
  { id: "frustum-cone", label: "Frustum (truncated cone)" },
  { id: "parabolic-cone", label: "Parabolic cone" },
  { id: "triangular-prism", label: "Triangular prism / dumper" },
  { id: "trapezoidal-prism", label: "Trapezoidal prism" },
  { id: "hollow-cylinder", label: "Hollow cylinder (pipe)" },
  { id: "prism", label: "Prism (regular n-sided)" },
  { id: "rect-tank", label: "Rectangular water tank" },
  { id: "commercial-tank", label: "Commercial tank" },
];


export default function VolumeEstimator() {
  const { addItem } = useBOQ();
  const [unit, setUnit] = useState<Unit>("m");
  const [shape, setShape] = useState<VolumeShape>("cylinder");
  const [gallon, setGallon] = useState<"us" | "imp">("us");
  const [radiusMode, setRadiusMode] = useState<"r" | "d">("r");
  const [length, setLength] = useState("4");
  const [width, setWidth] = useState("3");
  const [height, setHeight] = useState("5");
  const [radius, setRadius] = useState("1");
  const [radius2, setRadius2] = useState("0.5");
  const [innerRadius, setInnerRadius] = useState("0.3");
  const [base, setBase] = useState("3");
  const [slopeHeight, setSlopeHeight] = useState("0.5");
  const [outletArea, setOutletArea] = useState("0.09");
  const [sides, setSides] = useState("6");
  const [sideLen, setSideLen] = useState("1");
  const [family, setFamily] = useState("6");
  const [perPerson, setPerPerson] = useState("100");
  const [days, setDays] = useState("2");
  const [freeboard, setFreeboard] = useState("200");
  const [freeboardUnit, setFreeboardUnit] = useState<"mm" | "pct">("mm");
  const [deadDepth, setDeadDepth] = useState("200");
  const [fillPct, setFillPct] = useState("50");
  const [tankBase, setTankBase] = useState<"rect" | "cyl">("rect");
  const [densitySel, setDensitySel] = useState<string>("water");
  const [densityCustom, setDensityCustom] = useState("1000");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const toM = (v: number) => (unit === "ft" ? v * 0.3048 : v);
  const density =
    densitySel === "custom"
      ? parseFloat(densityCustom) || 0
      : DENSITY_PRESETS.find((p) => p.id === densitySel)?.kgM3 ?? 1000;

  const radiusM = radiusMode === "r" ? toM(parseFloat(radius) || 0) : toM(parseFloat(radius) || 0) / 2;
  const heightM = toM(parseFloat(height) || 0);
  const lengthM = toM(parseFloat(length) || 0);
  const widthM = toM(parseFloat(width) || 0);
  const slopeHeightM = toM(parseFloat(slopeHeight) || 0);
  const polySides = parseInt(sides, 10) || 0;
  const polySideM = toM(parseFloat(sideLen) || 0);
  const polyPerimeterM = polySides * polySideM;
  const polyAreaM2 = polySides >= 3 && polySideM > 0
    ? (polySides * polySideM * polySideM) / (4 * Math.tan(Math.PI / polySides))
    : 0;

  const dims: VolumeDims = {
    ...DEFAULT_VOLUME_DIMS,
    lengthM,
    widthM,
    heightM,
    sideM: lengthM,
    radiusM,
    topRadiusM: toM(parseFloat(radius2) || 0),
    bottomRadiusM: radiusM,
    baseM: toM(parseFloat(base) || 0),
    topWidthM: toM(parseFloat(radius2) || 0),
    bottomWidthM: widthM,
    depthM: heightM,
    baseAreaM2: polyAreaM2,
    basePerimeterM: polyPerimeterM,
    outerDiameterM: 2 * radiusM,
    innerDiameterM: 2 * toM(parseFloat(innerRadius) || 0),
    densityKgM3: density,
    tankBase,
    slopedBase: slopeHeightM > 0,
    slopedHeightM: slopeHeightM,
    freeboardM: freeboardUnit === "mm" ? (parseFloat(freeboard) || 0) / 1000 : ((parseFloat(freeboard) || 0) / 100) * heightM,
    deadStorageM: (parseFloat(deadDepth) || 0) / 1000,
    outletAreaM2: parseFloat(outletArea) || 0,
    fillPct: parseFloat(fillPct) || 0,
  };
  const errors = validateVolume(shape, dims);
  const result = useMemo(() => calcVolume(shape, dims), [shape, JSON.stringify(dims)]);
  const fillVol = useMemo(
    () => shape === "cylinder" ? horizontalCylinderFillVolume(radiusM, lengthM, parseFloat(fillPct) || 0) : null,
    [shape, radiusM, lengthM, fillPct],
  );
  const tankSize = useMemo(
    () => familyTankSize(parseInt(family, 10) || 0, parseFloat(perPerson) || 0, parseFloat(days) || 0),
    [family, perPerson, days],
  );

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const f = u === "ft" ? FT : 1 / FT;
    const conv = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f).toFixed(3)));
    };
    conv(setLength, length); conv(setWidth, width); conv(setHeight, height);
    conv(setRadius, radius); conv(setRadius2, radius2); conv(setInnerRadius, innerRadius);
    conv(setBase, base); conv(setSlopeHeight, slopeHeight); conv(setSideLen, sideLen);
    setUnit(u);
  };

  const gal = gallon === "us" ? result.usGallons : result.impGallons;
  const summaryText = () => [
    "Volume calculation — Civil Estimation Pro",
    `Shape: ${SHAPE_LABELS.find((s) => s.id === shape)?.label}`,
    `Volume: ${result.volumeM3.toFixed(3)} m³ = ${result.litres.toFixed(0)} L = ${result.cuFt.toFixed(2)} cu ft = ${gal.toFixed(0)} ${gallon === "us" ? "US" : "imperial"} gal`,
    `Surface area: ${result.surfaceAreaM2.toFixed(2)} m²`,
    result.usableVolumeM3 != null ? `Usable capacity: ${result.usableVolumeM3.toFixed(3)} m³ = ${(result.usableVolumeM3 * 1000).toFixed(0)} L (${result.usablePct?.toFixed(0)}% of gross ${result.grossVolumeM3?.toFixed(3)} m³)` : "",
    fillVol != null ? `Fill at ${fillPct}% (horizontal cylinder): ${fillVol.toFixed(3)} m³ = ${(fillVol * 1000).toFixed(0)} L` : "",
    `Weight at ${density} kg/m³: ${result.weightKg.toFixed(1)} kg (${(result.weightKg / 1000).toFixed(2)} t)`,
    shape === "commercial-tank" || shape === "rect-tank" ? `Family sizing: ${family} people × ${perPerson} L × ${days} days = ${tankSize.requiredLitres.toFixed(0)} L → standard size ${tankSize.nextSizeL} L` : "",
    ...result.warnings,
  ].filter(Boolean).join("\n");

  // Copy/Share/PDF are gated on valid inputs: with invalid dimensions the
  // computed surface area can be Infinity (e.g. parabolic cone, height 0)
  // and that literal "Infinity" used to be written into the PDF/copy text.
  const handleCopy = async () => { if (errors.length > 0) return; try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } };
  const handleShare = async () => {
    if (errors.length > 0) return;
    const text = summaryText();
    if (navigator.share) { try { await navigator.share({ title: "Volume calculation — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ } }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    if (errors.length > 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Volume Calculation — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")}`, 14, 26);
    let y = 38; doc.setFontSize(11);
    for (const line of summaryText().split("\n")) { doc.text(line, 14, y, { maxWidth: 180 }); y += 8; }
    doc.save("volume-calculation-civil-estimation-pro.pdf");
  };
  const handleBOQ = () => {
    if (errors.length > 0) return;
    addItem({ name: `Volume — ${SHAPE_LABELS.find((s) => s.id === shape)?.label}`, quantity: +result.volumeM3.toFixed(3), unit: "m³", rate: 0, category: "Concrete" });
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "Volume", theoretical: "Box L×W×H; cylinder πr²h; sphere 4/3πr³; cone ⅓πr²h; paraboloid ½πr²h; triangular prism ½·b·h·L; frustum ⅓πh(R²+Rr+r²); hollow cylinder π(R²−r²)L", applied: `Volume = ${result.volumeM3.toFixed(3)} m³` },
    { id: 2, label: "Tank usable capacity", theoretical: "Usable = gross − freeboard volume − dead storage\nFreeboard = base area × freeboard depth; dead = outlet area × depth (sloped base) or base area × depth (flat base)", applied: result.usableVolumeM3 != null ? `Usable = ${result.usableVolumeM3.toFixed(3)} m³ (${result.usablePct?.toFixed(0)}% of gross ${result.grossVolumeM3?.toFixed(3)} m³)` : "Not a commercial tank" },
    { id: 3, label: "Weight and conversions", theoretical: "Weight = volume × density\n1 m³ = 1,000 L = 35.3147 cu ft; 1 cu ft = 7.48052 US gal = 6.22884 imp gal", applied: `Weight = ${result.weightKg.toFixed(1)} kg at ${density} kg/m³` },
  ];

  const NumField = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) => (
    <div><label className={labelCls}>{label}</label><input type="number" min="0" step="any" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />{hint && <p className="text-xs text-txt-tertiary mt-1">{hint}</p>}</div>
  );
  const isTank = shape === "rect-tank" || shape === "commercial-tank";
  const showResults = errors.length === 0 && result.volumeM3 > 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <p className="text-base text-txt-secondary leading-relaxed">Fourteen shapes, tank sizing by family, freeboard and dead storage, fill levels for horizontal cylinders, and weight for every shape — in cubic metres, litres, US or imperial gallons and cubic feet.</p>
      <div className="bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-txt-primary"><Box className="w-6 h-6 text-accent-800" /> Volume Calculator</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-surface-hover p-1 rounded-xl">
              {(["m", "ft"] as const).map((u) => (
                <Button key={u} onClick={() => switchUnit(u)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unit === u ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary"}`}>{u === "m" ? "Metric (m)" : "Feet (ft)"}</Button>
              ))}
            </div>
            <div className="flex bg-surface-hover p-1 rounded-xl">
              {(["us", "imp"] as const).map((g) => (
                <Button key={g} onClick={() => setGallon(g)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${gallon === g ? "bg-surface-default text-txt-primary shadow-brand-sm" : ""}`}>{g === "us" ? "US gal" : "Imp gal"}</Button>
              ))}
            </div>
            <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}</Button>
            <Button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Share2 size={16} /> {shared ? "Shared / copied" : "Share"}</Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Printer size={16} /> Print</Button>
            <Button onClick={handlePdf} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> PDF</Button>
            <Button onClick={handleBOQ} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> Add to BOQ</Button>
          </div>
        </div>
        {errors.length > 0 && (
          <div className="rounded-xl border border-ui-errorBorder bg-ui-error p-4 text-sm text-ui-errorText mb-4" role="alert">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}
        {result.warnings.map((w) => <p key={w} className="text-sm text-accent-800 bg-accent-50 border border-accent-100 rounded-xl px-4 py-2 mb-2">{w}</p>)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className={labelCls}>Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value as VolumeShape)} className={inputCls}>
              {SHAPE_LABELS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Material (for weight)</label>
            <select value={densitySel} onChange={(e) => setDensitySel(e.target.value)} className={inputCls}>
              {DENSITY_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label} — {p.kgM3.toLocaleString()} kg/m³</option>)}
              <option value="custom">Custom density</option>
            </select>
          </div>
          {densitySel === "custom" && <NumField label="Custom density (kg/m³)" value={densityCustom} onChange={setDensityCustom} hint="e.g. cement 1,440 kg/m³, aggregate 1,500 kg/m³." />}
          {(shape === "rect-prism" || shape === "trapezoidal-prism" || shape === "prism" || isTank) && <NumField label={`Length (${unit})`} value={length} onChange={setLength} />}
          {(shape === "rect-prism" || shape === "trapezoidal-prism" || isTank) && <NumField label={`Width / base (${unit})`} value={width} onChange={setWidth} />}
          {shape === "triangular-prism" && <NumField label={`Triangle base (${unit})`} value={base} onChange={setBase} />}
          {shape !== "cube" && shape !== "sphere" && shape !== "half-sphere" && <NumField label={`Height (${unit})`} value={height} onChange={setHeight} />}
          {shape === "cube" && <NumField label={`Side (${unit})`} value={length} onChange={setLength} />}
          {(shape === "cylinder" || shape === "sphere" || shape === "half-sphere" || shape === "cone" || shape === "frustum-cone" || shape === "parabolic-cone" || shape === "hollow-cylinder" || (shape === "commercial-tank" && tankBase === "cyl")) && (
            <div>
              <label className={labelCls}>{radiusMode === "r" ? `Radius (${unit})` : `Diameter (${unit})`}</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="any" value={radius} onChange={(e) => setRadius(e.target.value)} className={inputCls} />
                <div className="flex bg-surface-hover p-1 rounded-xl shrink-0">
                  <Button onClick={() => setRadiusMode("r")} className={`px-2 py-1 rounded-lg text-xs ${radiusMode === "r" ? "bg-surface-default shadow-brand-sm" : ""}`}>Radius</Button>
                  <Button onClick={() => setRadiusMode("d")} className={`px-2 py-1 rounded-lg text-xs ${radiusMode === "d" ? "bg-surface-default shadow-brand-sm" : ""}`}>Diameter</Button>
                </div>
              </div>
            </div>
          )}
          {shape === "frustum-cone" && <NumField label={`Top radius (${unit})`} value={radius2} onChange={setRadius2} />}
          {shape === "hollow-cylinder" && <NumField label={`Inner radius (${unit})`} value={innerRadius} onChange={setInnerRadius} />}
          {shape === "trapezoidal-prism" && <NumField label={`Top width (${unit})`} value={radius2} onChange={setRadius2} hint="Top width of the trapezoid cross-section" />}
          {shape === "commercial-tank" && (
            <>
              <NumField label={`Sloped-base height (${unit})`} value={slopeHeight} onChange={setSlopeHeight} hint="Enter 0 for a flat base." />
              {slopeHeightM > 0 && <NumField label="Outlet / sump area (m²)" value={outletArea} onChange={setOutletArea} hint="Dead storage on a sloped base = outlet area × dead depth." />}
            </>
          )}
          {shape === "prism" && (<>
            <NumField label="Number of sides" value={sides} onChange={setSides} hint="Regular polygon: base area and perimeter are worked out from the side length." />
            <NumField label={`Side length (${unit})`} value={sideLen} onChange={setSideLen} />
          </>)}
          {shape === "cylinder" && <NumField label="Fill level (%) — horizontal cylinder" value={fillPct} onChange={setFillPct} hint="Circular-segment fill volume for a horizontal cylinder." />}
          {isTank && (<>
            <div>
              <label className={labelCls}>Freeboard</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="any" value={freeboard} onChange={(e) => setFreeboard(e.target.value)} className={inputCls} />
                <select value={freeboardUnit} onChange={(e) => setFreeboardUnit(e.target.value as "mm" | "pct")} className="bg-surface-hover border border-ui-borderSubtle px-2 rounded-xl text-sm">
                  <option value="mm">mm</option><option value="pct">% of height</option>
                </select>
              </div>
            </div>
            <NumField label="Dead storage depth (mm)" value={deadDepth} onChange={setDeadDepth} />
          </>)}
          {shape === "commercial-tank" && (
            <div>
              <label className={labelCls}>Tank base</label>
              <select value={tankBase} onChange={(e) => setTankBase(e.target.value as "rect" | "cyl")} className={inputCls}>
                <option value="rect">Rectangular</option><option value="cyl">Cylindrical</option>
              </select>
            </div>
          )}
          {isTank && (<>
            <NumField label="Family size (people)" value={family} onChange={setFamily} />
            <NumField label="Per-person demand (L/day)" value={perPerson} onChange={setPerPerson} />
            <NumField label="Days of storage" value={days} onChange={setDays} />
          </>)}
        </div>

        {showResults ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-hover rounded-xl p-4"><p className="text-sm text-txt-secondary">Volume</p><p className="text-xl font-bold">{result.volumeM3.toFixed(3)} m³</p><p className="text-xs text-txt-tertiary">{result.cuFt.toFixed(2)} cu ft · {result.litres.toFixed(0)} L · {gal.toFixed(0)} {gallon === "us" ? "US" : "imp"} gal</p></div>
            <div className="bg-surface-hover rounded-xl p-4"><p className="text-sm text-txt-secondary">Surface area</p><p className="text-xl font-bold">{result.surfaceAreaM2.toFixed(2)} m²</p></div>
            <div className="bg-surface-hover rounded-xl p-4"><p className="text-sm text-txt-secondary">Usable capacity</p><p className="text-xl font-bold">{result.usableVolumeM3 != null ? `${result.usableVolumeM3.toFixed(3)} m³ (${(result.usableVolumeM3 * 1000).toFixed(0)} L, ${result.usablePct?.toFixed(0)}%)` : "—"}</p></div>
            <div className="bg-surface-hover rounded-xl p-4"><p className="text-sm text-txt-secondary">Weight ({density} kg/m³)</p><p className="text-xl font-bold">{result.weightKg.toFixed(1)} kg</p></div>
          </div>
        ) : (
          <p className="text-sm text-txt-secondary">Enter valid dimensions to calculate.</p>
        )}
        {fillVol != null && errors.length === 0 && <p className="text-sm text-txt-secondary mt-3">Fill at {fillPct}% (horizontal cylinder): <strong>{fillVol.toFixed(3)} m³ = {(fillVol * 1000).toFixed(0)} L</strong>.</p>}
        {isTank && <p className="text-sm text-txt-secondary mt-3">Family sizing: {family} people × {perPerson} L × {days} days = {tankSize.requiredLitres.toFixed(0)} L → next standard size <strong>{tankSize.nextSizeL} L</strong>.</p>}
        <p className="text-xs text-txt-tertiary mt-4">Fixed bug: the old code had a commented-out &ldquo;Parabolic Cone&rdquo; branch that swallowed the &ldquo;Triangular Dumper&rdquo; header, so triangular dumper returned 0 and parabolic cone used the wrong surface area. Both now compute correctly.</p>
      </div>
      <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Volume, surface area and weight together</h2>
          <p>
            Volume alone is rarely the whole answer. A tank needs its usable capacity, not just its gross volume. A
            pipe needs its weight, not just its hollow volume. A dome needs its surface area for the finish. This
            calculator gives volume, surface area and weight for all fourteen shapes, with a material selector — water,
            concrete, steel, dry sand, soil or a custom density — so the weight is right for the material you are
            actually moving or buying.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">Tanks — gross, usable and family sizing</h2>
          <p>
            A tank&rsquo;s gross volume is its full internal volume. Its usable volume subtracts the freeboard at the
            top and the dead storage below the outlet. For a commercial tank with a sloped base, the gross volume is
            the main volume plus the frustum of the sloped base — h/3 × (A1 + A2 + √(A1·A2)) — and the dead storage
            is the outlet area times the depth. The calculator warns you if the usable percentage falls outside
            75–95%, which usually means the freeboard or the dead storage has been entered wrong. Family sizing works
            the other way round: people × litres per person × days of storage, rounded up to the next standard tank size.
          </p>
        </section>
      </article>
      <FormulaAccordion steps={steps} />
    </div>
  );
}
