import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "../ui/Button";
import { FormulaAccordion, type FormulaStep } from "../ui/FormulaAccordion";
import {
  calcRoomGeometry, calcMasonry, calcPlaster, calcPaint, calcFlooring,
  calcCountertop, calcCarpentry, calcCarpetArea, formatFinishesMoney,
  costLine, sumCosts, validateRoom, TILE_PATTERN_WASTAGE,
  type FinishesCurrency, type OpeningInput, type TilePattern, type CounterShape,
} from "../../lib/finishesCalc";
import { BRICK_PRESETS, THICKNESS_PRESETS, type BrickPreset } from "../../lib/brickCalc";
import { getRates } from "../../lib/rates";
import { useBOQ } from "../../context/BOQContext";
import { Calculator, Check, Copy, Download, Printer, Share2 } from "lucide-react";

type Unit = "m" | "ft";
const FT = 3.28084;
const inputCls = "w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-accent-800 outline-none";
const labelCls = "text-sm font-medium text-txt-secondary";
const money = (v: number | null, c: FinishesCurrency) => formatFinishesMoney(v, c);


type Tab = "masonry" | "plaster" | "paint" | "flooring" | "countertop" | "carpentry" | "carpet";
const TABS: { id: Tab; label: string }[] = [
  { id: "masonry", label: "Masonry" },
  { id: "plaster", label: "Plaster" },
  { id: "paint", label: "Paint" },
  { id: "flooring", label: "Flooring" },
  { id: "countertop", label: "Countertop" },
  { id: "carpentry", label: "Carpentry" },
  { id: "carpet", label: "Carpet Area" },
];

let opSeq = 0;
const newOpening = (kind: OpeningInput["kind"]): OpeningInput => ({
  id: `op-${++opSeq}-${Date.now()}`,
  kind,
  widthM: kind === "door" ? 0.9 : 1.2,
  heightM: kind === "door" ? 2.1 : 1.2,
  count: 1,
});

export default function FinishesEstimator() {
  const { addItem } = useBOQ();
  const [unit, setUnit] = useState<Unit>("m");
  const [currency, setCurrency] = useState<FinishesCurrency>("PKR");
  const pk = getRates("PK").rates;
  const [activeTab, setActiveTab] = useState<Tab>("masonry");
  const [touched, setTouched] = useState<Set<Tab>>(new Set(["masonry"]));

  const [roomL, setRoomL] = useState("5");
  const [roomW, setRoomW] = useState("4");
  const [roomH, setRoomH] = useState("3");
  const [faces, setFaces] = useState<1 | 2>(1);
  const [openings, setOpenings] = useState<OpeningInput[]>([newOpening("door"), newOpening("window")]);
  const [jambDepth, setJambDepth] = useState("0.23");

  const [brickId, setBrickId] = useState("pk-awwal");
  const [thicknessId, setThicknessId] = useState("t230");
  const [thicknessMm, setThicknessMm] = useState("230");
  const [jointMm, setJointMm] = useState("10");
  const [mWastage, setMWastage] = useState("5");
  const [mMix, setMMix] = useState("1:4");
  const [pIntThick, setPIntThick] = useState("12");
  const [pExtThick, setPExtThick] = useState("20");
  const [pMix, setPMix] = useState("1:4");
  const [pUneven, setPUneven] = useState(true);
  const [pWastage, setPWastage] = useState("5");
  const [pCeiling, setPCeiling] = useState(true);
  const [paintPreset, setPaintPreset] = useState("standard");
  const [coverage, setCoverage] = useState("11");
  const [primerCoverage, setPrimerCoverage] = useState("7");
  const [coats, setCoats] = useState("2");
  const [primerCoats, setPrimerCoats] = useState("1");
  const [puttyCoats, setPuttyCoats] = useState("2");
  const [paintWastage, setPaintWastage] = useState("10");
  const [ceilingPaint, setCeilingPaint] = useState(true);
  const [skirtingDeduct, setSkirtingDeduct] = useState(true);
  const [tileL, setTileL] = useState("0.6");
  const [tileW, setTileW] = useState("0.6");
  const [groutMm, setGroutMm] = useState("3");
  const [pattern, setPattern] = useState<TilePattern>("straight");
  const [tilesPerBox, setTilesPerBox] = useState("4");
  const [skirtH, setSkirtH] = useState("0.1");
  const [bedThick, setBedThick] = useState("50");
  const [cShape, setCShape] = useState<CounterShape>("straight");
  const [cLA, setCLA] = useState("3");
  const [cLB, setCLB] = useState("2");
  const [cLC, setCLC] = useState("2");
  const [cDepth, setCDepth] = useState("0.6");
  const [cThick, setCThick] = useState("20");
  const [sinkOn, setSinkOn] = useState(true);
  const [hobOn, setHobOn] = useState(true);
  const [cWastage, setCWastage] = useState("5");
  const [studSpacing, setStudSpacing] = useState("0.4");
  const [purpose, setPurpose] = useState<"panelling" | "formwork">("panelling");
  const [reuse, setReuse] = useState("4");
  const [openRun, setOpenRun] = useState(false);
  const [woodWastage, setWoodWastage] = useState("5");
  const [wallDeductPct, setWallDeductPct] = useState("15");
  const [superAddPct, setSuperAddPct] = useState("20");

  const [rBrick, setRBrick] = useState(String(pk.bricksPer1000 ?? ""));
  const [rCement, setRCement] = useState(String(pk.cementPerBag ?? ""));
  const [rSand, setRSand] = useState(String(pk.sandPerCft ?? ""));
  const [rPaint, setRPaint] = useState("1200");
  const [rPrimer, setRPrimer] = useState("800");
  const [rTileBox, setRTileBox] = useState(String(pk.tilesPerBox ?? ""));
  const [rCounter, setRCounter] = useState("5000");
  const [rEdge, setREdge] = useState("200");
  const [rStud, setRStud] = useState("500");
  const [rPly, setRPly] = useState("4500");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const num = (s: string) => parseFloat(s);
  const toM = (v: number) => (unit === "ft" ? v * 0.3048 : v);
  const fromM = (v: number) => (unit === "ft" ? v / 0.3048 : v);

  const geometry = useMemo(() => {
    return calcRoomGeometry(toM(num(roomL) || 0), toM(num(roomW) || 0), toM(num(roomH) || 0), openings, faces, toM(num(jambDepth) || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomL, roomW, roomH, openings, faces, jambDepth, unit]);
  const roomErrors = validateRoom(toM(num(roomL) || 0), toM(num(roomW) || 0), toM(num(roomH) || 0), openings);

  const brick: BrickPreset = BRICK_PRESETS.find((p) => p.id === brickId) ?? BRICK_PRESETS[0];
  const mixParts = (s: string): [number, number] => {
    const [a, b] = s.split(":").map((x) => parseFloat(x) || 0);
    return [a || 1, b || 4];
  };

  const masonry = useMemo(() => calcMasonry({
    netWallM2: geometry.netWallM2, thicknessMm: num(thicknessMm) || 0, brick,
    jointMm: num(jointMm) || 0, wastagePct: num(mWastage) || 0, mix: mixParts(mMix),
    // The brick engine has no USD mode (Currency = PKR | INR | AED). USD
    // falls back to PKR, which only selects the sand unit (cft — matching
    // the "Sand / cft" input). The rates themselves are user-entered
    // numbers, so a USD rate prices in USD; and switching currency clears
    // the PKR defaults, so no Rs rate is ever silently priced as USD.
    currency: currency === "USD" ? "PKR" : currency,
    rates: {
      brickPer1000: rBrick === "" ? null : num(rBrick),
      cementPerBag: rCement === "" ? null : num(rCement),
      sandPerUnit: rSand === "" ? null : num(rSand),
    },
  }), [geometry, thicknessMm, brick, jointMm, mWastage, mMix, currency, rBrick, rCement, rSand]);

  // External plaster is ONE face of the outside of the same walls, with the
  // same IS 1200 opening deductions — it must NOT inherit the "faces"
  // multiplier (old code passed geometry.grossWallM2, i.e. gross × faces
  // with no deductions at all, overstating external plaster by the
  // deductions and doubling it when faces = 2).
  const externalGeometry = useMemo(() => {
    return calcRoomGeometry(toM(num(roomL) || 0), toM(num(roomW) || 0), toM(num(roomH) || 0), openings, 1, toM(num(jambDepth) || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomL, roomW, roomH, openings, jambDepth, unit]);

  const plaster = useMemo(() => calcPlaster({
    internalAreaM2: geometry.netWallM2, externalAreaM2: externalGeometry.netWallM2,
    ceilingAreaM2: geometry.ceilingM2, ceilingIncluded: pCeiling,
    internalThicknessMm: num(pIntThick) || 0, externalThicknessMm: num(pExtThick) || 0,
    mix: mixParts(pMix), unevenFactor: pUneven ? 1.1 : 1, wastagePct: num(pWastage) || 0,
  }), [geometry, externalGeometry, pIntThick, pExtThick, pMix, pUneven, pWastage, pCeiling]);

  // Door areas and widths come from the openings list above — the old
  // code hardcoded 0. The door opening itself is already deducted from
  // the net wall area by the IS 1200 rules; doorAreaM2 is the door faces
  // to paint, which the engine ADDS to the paintable area (one face per
  // door), and doorWidthsTotalM is the skirting length the doors replace.
  const doorAreaM2 = openings.filter((o) => o.kind === "door").reduce((s, o) => s + o.widthM * o.heightM * o.count, 0);
  const doorWidthsTotalM = openings.filter((o) => o.kind === "door").reduce((s, o) => s + o.widthM * o.count, 0);
  const paint = useMemo(() => calcPaint({
    netWallM2: geometry.netWallM2, ceilingM2: geometry.ceilingM2, ceilingIncluded: ceilingPaint,
    doorAreaM2, skirtingHeightM: 0.1, perimeterM: geometry.perimeterM, skirtingDeducted: skirtingDeduct,
    coverageM2PerL: num(coverage) || 10, primerCoverageM2PerL: num(primerCoverage) || 7,
    coats: num(coats) || 0, primerCoats: num(primerCoats) || 0,
    puttyCoverageM2PerKg: 1.1, puttyCoats: num(puttyCoats) || 0, wastagePct: num(paintWastage) || 0,
  }), [geometry, doorAreaM2, coverage, primerCoverage, coats, primerCoats, puttyCoats, paintWastage, ceilingPaint, skirtingDeduct]);

  const flooring = useMemo(() => calcFlooring({
    floorAreaM2: geometry.floorM2, perimeterM: geometry.perimeterM,
    tileLengthM: toM(num(tileL) || 0), tileWidthM: toM(num(tileW) || 0), groutMm: num(groutMm) || 0,
    pattern, tilesPerBox: num(tilesPerBox) || 1, skirtingHeightM: toM(num(skirtH) || 0),
    skirtingIncluded: true, doorWidthsTotalM, bedThicknessMm: num(bedThick) || 0, mix: [1, 4],
  }), [geometry, doorWidthsTotalM, tileL, tileW, groutMm, pattern, tilesPerBox, skirtH, bedThick, unit]);

  const counter = useMemo(() => calcCountertop({
    shape: cShape, lengthAM: toM(num(cLA) || 0), lengthBM: toM(num(cLB) || 0), lengthCM: toM(num(cLC) || 0),
    depthM: toM(num(cDepth) || 0), slabThicknessMm: num(cThick) || 0,
    sinkOn, sinkLengthM: 0.6, sinkWidthM: 0.45, hobOn, hobLengthM: 0.6, hobWidthM: 0.5,
    skirtingHeightM: 0.1, wastagePct: num(cWastage) || 0,
  }), [cShape, cLA, cLB, cLC, cDepth, cThick, sinkOn, hobOn, cWastage, unit]);

  const carpentry = useMemo(() => calcCarpentry({
    perimeterM: geometry.perimeterM, netWallAreaM2: geometry.netWallM2,
    studSpacingM: toM(num(studSpacing) || 0.4), openRun,
    sheetLengthM: 2.44, sheetWidthM: 1.22, wastagePct: num(woodWastage) || 0,
    purpose, reuseFactor: num(reuse) || 1,
  }), [geometry, studSpacing, openRun, woodWastage, purpose, reuse, unit]);

  const carpet = useMemo(() => calcCarpetArea({
    floorAreaM2: geometry.floorM2,
    internalWallDeductionPct: num(wallDeductPct) || 0,
    superBuiltUpAddPct: num(superAddPct) || 0,
  }), [geometry, wallDeductPct, superAddPct]);

  const rate = (s: string) => (s === "" ? null : num(s));
  // Sand rate unit follows the currency: PKR/INR/USD rates are entered
  // per cft, AED per m³ (the brick engine prices sand per m³ for AED).
  // The old code labelled the input "Sand / cft" for every currency and
  // multiplied by 35.3147 in the plaster cost, overstating AED sand cost
  // 35× when the rate was really per m³.
  const sandPerCft = currency !== "AED";
  const sandRatePerM3 = rate(rSand) != null ? (sandPerCft ? rate(rSand)! * 35.3147 : rate(rSand)) : null;
  const masonryCost = sumCosts([masonry.brickCost, masonry.cementCost, masonry.sandCost]);
  const plasterCost = sumCosts([
    costLine(plaster.cementBags, rate(rCement)),
    costLine(plaster.sandM3, sandRatePerM3),
  ]);
  const paintCost = sumCosts([
    costLine(paint.paintLitres, rate(rPaint)),
    costLine(paint.primerLitres, rate(rPrimer)),
  ]);
  const flooringCost = sumCosts([
    costLine(flooring.boxes, rate(rTileBox)),
    costLine(flooring.bedCementBags, rate(rCement)),
  ]);
  const counterCost = sumCosts([
    costLine(counter.orderAreaM2, rate(rCounter)),
    costLine(counter.edgePolishM, rate(rEdge)),
  ]);
  const carpentryCost = sumCosts([
    costLine(carpentry.studs, rate(rStud)),
    costLine(carpentry.sheets, rate(rPly)),
  ]);
  // Grand total covers only the tabs the user has opened (the label says
  // so). The old code summed all six costed tabs from first load, so the
  // "total" included plaster, paint, flooring, countertop and carpentry
  // the user had never looked at. Carpet has no cost line, so it is not
  // part of the total.
  const tabCosts = { masonry: masonryCost, plaster: plasterCost, paint: paintCost, flooring: flooringCost, countertop: counterCost, carpentry: carpentryCost } as const;
  const grandCost = sumCosts((Object.keys(tabCosts) as (keyof typeof tabCosts)[]).filter((t) => touched.has(t)).map((t) => tabCosts[t]));

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const f = u === "ft" ? FT : 1 / FT;
    const conv = (setter: (v: string) => void, v: string) => {
      const n = parseFloat(v);
      if (isFinite(n)) setter(String(+(n * f).toFixed(3)));
    };
    conv(setRoomL, roomL); conv(setRoomW, roomW); conv(setRoomH, roomH);
    conv(setTileL, tileL); conv(setTileW, tileW); conv(setSkirtH, skirtH);
    conv(setCLA, cLA); conv(setCLB, cLB); conv(setCLC, cLC); conv(setCDepth, cDepth);
    conv(setStudSpacing, studSpacing);
    setUnit(u);
  };
  const onCurrencyChange = (c: FinishesCurrency) => {
    setCurrency(c);
    if (c === "PKR") {
      setRBrick(String(pk.bricksPer1000 ?? "")); setRCement(String(pk.cementPerBag ?? ""));
      setRSand(String(pk.sandPerCft ?? "")); setRTileBox(String(pk.tilesPerBox ?? ""));
    } else { setRBrick(""); setRCement(""); setRSand(""); setRTileBox(""); }
  };
  const goTab = (t: Tab) => { setActiveTab(t); setTouched((prev) => new Set(prev).add(t)); };

  const summaryText = () => [
    "Finishes estimate — Civil Estimation Pro",
    `Room: ${roomL} × ${roomW} × ${roomH} ${unit}; net wall ${geometry.netWallM2.toFixed(2)} m²; floor ${geometry.floorM2.toFixed(2)} m²`,
    `Masonry: ${masonry.bricks.toLocaleString()} bricks/blocks (${Math.round(masonry.bricksBeforeWastage).toLocaleString()} before ${mWastage}% wastage), ${masonry.cementBags} cement bags, ${masonry.sandM3.toFixed(2)} m³ sand`,
    `Plaster: ${plaster.cementBags} cement bags, ${plaster.sandM3.toFixed(2)} m³ sand (dry ${plaster.dryM3.toFixed(2)} m³)`,
    `Paint: ${paint.paintLitres} L paint, ${paint.primerLitres} L primer, ${paint.puttyKg} kg putty (${paint.paintableAreaM2.toFixed(1)} m²)`,
    `Flooring: ${flooring.totalTiles} tiles (${flooring.boxes} boxes), ${flooring.bedCementBags} cement bags`,
    `Countertop: ${counter.netAreaM2.toFixed(2)} m² net, ${counter.orderAreaM2.toFixed(2)} m² to order, edge ${counter.edgePolishM.toFixed(2)} m`,
    `Carpentry: ${carpentry.studs} studs, ${carpentry.sheets} plywood sheets`,
    `Carpet ${carpet.carpetAreaM2.toFixed(2)} m² · Built-up ${carpet.builtUpAreaM2.toFixed(2)} m² · Super built-up ${carpet.superBuiltUpAreaM2.toFixed(2)} m²`,
    grandCost != null ? `Estimated material cost: ${money(grandCost, currency)}` : "Cost incomplete — enter all rates.",
    "Rates are indicative — confirm with your supplier. Brick rates are per 1,000.",
  ].join("\n");

  const handleCopy = async () => { try { await navigator.clipboard.writeText(summaryText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ } };
  const handleShare = async () => {
    const text = summaryText();
    if (navigator.share) { try { await navigator.share({ title: "Finishes estimate — Civil Estimation Pro", text }); setShared(true); setTimeout(() => setShared(false), 2000); return; } catch { /* cancelled */ } }
    await handleCopy(); setShared(true); setTimeout(() => setShared(false), 2000);
  };
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Finishes Estimate — Civil Estimation Pro", 14, 18);
    doc.setFontSize(10); doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · Indicative rates — confirm with your supplier.`, 14, 26);
    let y = 38; doc.setFontSize(11);
    for (const line of summaryText().split("\n").slice(1)) { doc.text(line, 14, y); y += 8; }
    doc.setFontSize(9); doc.text("Disclaimer: planning estimate only — confirm the final order with your quantity surveyor or contractor.", 14, y + 8, { maxWidth: 180 });
    doc.save("finishes-estimate-civil-estimation-pro.pdf");
  };
  const handleExportBOQ = () => {
    if (touched.has("masonry")) {
      addItem({ name: `${brick.label} (bricks/blocks)`, quantity: masonry.bricks, unit: "Nos", rate: rate(rBrick) != null ? rate(rBrick)! / 1000 : 0, category: "Masonry & Finishes" });
      addItem({ name: "Cement — masonry", quantity: masonry.cementBags, unit: "Bags", rate: rate(rCement) ?? 0, category: "Masonry & Finishes" });
    }
    if (touched.has("plaster")) addItem({ name: "Cement — plaster", quantity: plaster.cementBags, unit: "Bags", rate: rate(rCement) ?? 0, category: "Masonry & Finishes" });
    if (touched.has("paint")) addItem({ name: "Wall paint", quantity: paint.paintLitres, unit: "Liters", rate: rate(rPaint) ?? 0, category: "Masonry & Finishes" });
    if (touched.has("flooring")) addItem({ name: "Floor tiles", quantity: flooring.boxes, unit: "Boxes", rate: rate(rTileBox) ?? 0, category: "Masonry & Finishes" });
    if (touched.has("countertop")) addItem({ name: "Countertop slab", quantity: counter.orderAreaM2, unit: "m²", rate: rate(rCounter) ?? 0, category: "Masonry & Finishes" });
    if (touched.has("carpentry")) addItem({ name: "Plywood sheets", quantity: carpentry.sheets, unit: "Sheets", rate: rate(rPly) ?? 0, category: "Masonry & Finishes" });
  };

  const steps: FormulaStep[] = [
    { id: 1, label: "Room geometry (IS 1200 openings)", theoretical: "Gross wall = 2(L+W)×H × faces; openings <0.5 m²: no deduction; 0.5–3 m²: one face; >3 m²: both faces + jambs (2h+w)×jamb depth", applied: `Gross = ${geometry.grossWallM2.toFixed(2)} m²; deductions = ${geometry.deductionsM2.toFixed(2)} m²; jambs = ${geometry.jambsM2.toFixed(2)} m²\nNet wall = ${geometry.netWallM2.toFixed(2)} m²; floor = ${geometry.floorM2.toFixed(2)} m²; perimeter = ${geometry.perimeterM.toFixed(2)} m` },
    { id: 2, label: "Masonry", theoretical: "Bricks = wall volume ÷ brick-with-mortar volume; wet mortar = (wall vol − brick vol) × 1.15; dry = wet × 1.33 × (1+wastage); bags = ceil(cement ÷ 0.0347)", applied: `Bricks ${Math.round(masonry.bricksBeforeWastage).toLocaleString()} → ${masonry.bricks.toLocaleString()} @ ${mWastage}%; cement ${masonry.cementBags} bags; sand ${masonry.sandM3.toFixed(2)} m³` },
    { id: 3, label: "Plaster", theoretical: "Wet = area × thickness (×1.10 if uneven); dry = wet × 1.33 × (1+wastage); cement = dry ÷ (1+sand parts); bags = ceil(cement ÷ 0.0347)", applied: `Wet ${plaster.wetM3.toFixed(3)} m³; dry ${plaster.dryM3.toFixed(3)} m³; cement ${plaster.cementBags} bags; sand ${plaster.sandM3.toFixed(2)} m³` },
    { id: 4, label: "Paint", theoretical: "Paintable = net wall + ceiling − skirting; paint L = ceil(area × coats ÷ coverage × (1+wastage)); primer L = ceil(area × primer coats ÷ primer coverage)", applied: `Paintable ${paint.paintableAreaM2.toFixed(2)} m²; paint ${paint.paintLitres} L (${paint.packs.map((p) => `${p.count}×${p.sizeL} L`).join(" + ") || "—"}); primer ${paint.primerLitres} L; putty ${paint.puttyKg} kg` },
    { id: 5, label: "Flooring", theoretical: "Effective tile = (L+grout)×(W+grout); floor tiles = ceil(floor ÷ tile × (1+waste)); skirting tiles counted separately as cut strips; boxes = ceil(total ÷ per box)", applied: `Floor ${flooring.floorTiles} + skirting ${flooring.skirtingTiles} = ${flooring.totalTiles} tiles; ${flooring.boxes} boxes (${flooring.spares} spares); bed cement ${flooring.bedCementBags} bags; grout ${flooring.groutKg.toFixed(1)} kg` },
  ];

  const Row = ({ label, value, unit: u }: { label: string; value: string; unit: string }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-ui-borderSubtle last:border-0">
      <span className="text-txt-secondary text-sm font-medium">{label}</span>
      <span className="text-right"><span className="text-lg font-bold text-txt-primary">{value}</span> <span className="text-accent-800 text-xs font-semibold">{u}</span></span>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-txt-primary">Complete Finishes &amp; Surfaces</h2>
          <p className="text-txt-tertiary font-medium mt-1">Masonry, plaster, paint, flooring, countertops, carpentry and carpet area — one room, IS 1200 opening rules, costs in PKR, INR, AED or USD.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-surface-hover p-1 rounded-xl">
            {(["m", "ft"] as const).map((u) => (
              <Button key={u} onClick={() => switchUnit(u)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unit === u ? "bg-surface-default text-txt-primary shadow-brand-sm" : "text-txt-secondary"}`}>{u === "m" ? "Metric (m)" : "Feet (ft)"}</Button>
            ))}
          </div>
          <select value={currency} onChange={(e) => onCurrencyChange(e.target.value as FinishesCurrency)} className="bg-surface-hover border border-ui-borderSubtle rounded-xl px-3 py-2 text-sm font-semibold" aria-label="Currency">
            {(["PKR", "INR", "AED", "USD"] as const).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}</Button>
          <Button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Share2 size={16} /> {shared ? "Shared / copied" : "Share"}</Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-ui-borderSubtle rounded-lg"><Printer size={16} /> Print</Button>
          <Button onClick={handlePdf} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> PDF</Button>
          <Button onClick={handleExportBOQ} className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-ink rounded-lg"><Download size={16} /> Export BOQ</Button>
        </div>
      </div>

      {roomErrors.length > 0 && (
        <div className="rounded-xl border border-ui-errorBorder bg-ui-error p-4 text-sm text-ui-errorText" role="alert">
          {roomErrors.map((e) => <p key={e}>{e}</p>)}
        </div>
      )}

      <div className="bg-ink rounded-2xl p-5 text-white shadow-brand-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Room / zone dimensions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div><label className="text-xs text-[#948D82]">Length ({unit})</label><input type="number" min="0" value={roomL} onChange={(e) => setRoomL(e.target.value)} className="w-full bg-ink border border-ink-600 rounded-lg px-3 py-2 text-white font-mono" /></div>
          <div><label className="text-xs text-[#948D82]">Width ({unit})</label><input type="number" min="0" value={roomW} onChange={(e) => setRoomW(e.target.value)} className="w-full bg-ink border border-ink-600 rounded-lg px-3 py-2 text-white font-mono" /></div>
          <div><label className="text-xs text-[#948D82]">Height ({unit})</label><input type="number" min="0" value={roomH} onChange={(e) => setRoomH(e.target.value)} className="w-full bg-ink border border-ink-600 rounded-lg px-3 py-2 text-white font-mono" /></div>
          <div><label className="text-xs text-[#948D82]">Faces plastered</label>
            <select value={faces} onChange={(e) => setFaces(Number(e.target.value) as 1 | 2)} className="w-full bg-ink border border-ink-600 rounded-lg px-3 py-2 text-white">
              <option value={1}>1 face</option>
              <option value={2}>2 faces</option>
            </select>
          </div>
          <div className="bg-ink p-3 rounded-xl border border-ink-600 flex justify-between items-center"><span className="text-[#948D82] text-sm">Net wall</span><span className="text-2xl font-bold text-accent-400">{geometry.netWallM2.toFixed(2)} <span className="text-sm">m²</span></span></div>
        </div>
        <div className="mt-4">
          <h4 className="text-xs uppercase tracking-wider text-[#948D82] mb-2">Openings (IS 1200 deductions applied per opening)</h4>
          {openings.map((o) => (
            <div key={o.id} className="flex flex-wrap gap-2 items-center mb-2">
              <select value={o.kind} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, kind: e.target.value as OpeningInput["kind"] } : x))} className="bg-ink border border-ink-600 rounded-lg px-2 py-2 text-white text-sm">
                <option value="door">Door</option><option value="window">Window</option><option value="other">Other</option>
              </select>
              <input type="number" min="0" step="any" value={fromM(o.widthM).toFixed(2)} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, widthM: toM(parseFloat(e.target.value) || 0) } : x))} className="w-20 bg-ink border border-ink-600 rounded-lg px-2 py-2 text-white font-mono text-sm" aria-label="Opening width" />
              <span className="text-[#948D82]">×</span>
              <input type="number" min="0" step="any" value={fromM(o.heightM).toFixed(2)} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, heightM: toM(parseFloat(e.target.value) || 0) } : x))} className="w-20 bg-ink border border-ink-600 rounded-lg px-2 py-2 text-white font-mono text-sm" aria-label="Opening height" />
              <span className="text-[#948D82] text-sm">{unit}</span>
              <input type="number" min="1" step="1" value={o.count} onChange={(e) => setOpenings(openings.map((x) => x.id === o.id ? { ...x, count: parseInt(e.target.value, 10) || 0 } : x))} className="w-16 bg-ink border border-ink-600 rounded-lg px-2 py-2 text-white font-mono text-sm" aria-label="Opening count" />
              <span className="text-[#948D82] text-sm">× {(o.widthM * o.heightM).toFixed(2)} m² each — {geometry.openings.find((d) => d.id === o.id)?.rule ?? ""}</span>
              <Button onClick={() => setOpenings(openings.filter((x) => x.id !== o.id))} className="text-ui-errorText px-2 py-1 text-sm">✕</Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Button onClick={() => setOpenings([...openings, newOpening("door")])} className="text-accent-400 text-sm font-semibold">+ Add door</Button>
            <Button onClick={() => setOpenings([...openings, newOpening("window")])} className="text-accent-400 text-sm font-semibold">+ Add window</Button>
            <label className="text-xs text-[#948D82] ml-2">Jamb depth (m)<input type="number" min="0" step="any" value={jambDepth} onChange={(e) => setJambDepth(e.target.value)} className="w-20 bg-ink border border-ink-600 rounded-lg px-2 py-1 text-white font-mono text-sm ml-1" /></label>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button key={t.id} onClick={() => goTab(t.id)} className={`px-4 py-2.5 rounded-lg text-sm font-semibold ${activeTab === t.id ? "bg-ink text-white" : "bg-surface-default border border-ui-borderSubtle text-txt-secondary"}`}>{t.label}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-default rounded-2xl border border-ui-borderSubtle p-6">
        {activeTab === "masonry" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Masonry — bricks / blocks</h3>
              <div><label className={labelCls}>Unit</label>
                <select value={brickId} onChange={(e) => setBrickId(e.target.value)} className={inputCls}>
                  {BRICK_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label} — {p.note}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Wall thickness</label>
                  <select value={thicknessId} onChange={(e) => { setThicknessId(e.target.value); const t = THICKNESS_PRESETS.find((x) => x.id === e.target.value); if (t && e.target.value !== "tcustom") setThicknessMm(String(t.mm)); }} className={inputCls}>
                    {THICKNESS_PRESETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                {thicknessId === "tcustom" && <div><label className={labelCls}>Custom thickness (mm)</label><input type="number" min="0" value={thicknessMm} onChange={(e) => setThicknessMm(e.target.value)} className={inputCls} /></div>}
                <div><label className={labelCls}>Mortar joint (mm)</label><input type="number" min="0" max="25" value={jointMm} onChange={(e) => setJointMm(e.target.value)} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Wastage (%)</label><input type="number" min="0" max="50" value={mWastage} onChange={(e) => setMWastage(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Mortar mix</label>
                  <select value={mMix} onChange={(e) => setMMix(e.target.value)} className={inputCls}>
                    <option value="1:3">1:3 — load-bearing</option><option value="1:4">1:4 — general</option><option value="1:6">1:6 — partitions</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Brick rate / 1,000</label><input type="number" min="0" value={rBrick} onChange={(e) => setRBrick(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
                <div><label className={labelCls}>Cement / bag</label><input type="number" min="0" value={rCement} onChange={(e) => setRCement(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
                <div><label className={labelCls}>Sand / {sandPerCft ? "cft" : "m³"}</label><input type="number" min="0" value={rSand} onChange={(e) => setRSand(e.target.value)} className={inputCls} placeholder="Enter rate" /></div>
              </div>
              <p className="text-xs text-txt-tertiary">Brick rate is per 1,000 — the cost divides by 1,000. (An earlier version multiplied pieces by the per-1,000 rate and overstated brick cost 1,000×.)</p>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Masonry takeoff</h3>
              <Row label="Bricks / blocks before wastage" value={Math.round(masonry.bricksBeforeWastage).toLocaleString()} unit="Nos" />
              <Row label="Bricks / blocks to order" value={masonry.bricks.toLocaleString()} unit="Nos" />
              <Row label="Per sq ft" value={masonry.bricksPerSqFt.toFixed(2)} unit="Nos/sq ft" />
              <Row label="Wet mortar" value={masonry.wetMortarM3.toFixed(2)} unit="m³" />
              <Row label="Dry mortar" value={masonry.dryMortarM3.toFixed(2)} unit="m³" />
              <Row label="Cement" value={String(masonry.cementBags)} unit="Bags (50 kg)" />
              <Row label="Sand" value={masonry.sandM3.toFixed(2)} unit={`m³ (${masonry.sandCft.toFixed(1)} cft)`} />
              <Row label="Material cost" value={money(masonryCost, currency)} unit="" />
            </div>
          </>
        )}

        {activeTab === "plaster" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Plaster</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Internal thickness (mm)</label><input type="number" min="6" max="25" value={pIntThick} onChange={(e) => setPIntThick(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>External thickness (mm)</label><input type="number" min="6" max="25" value={pExtThick} onChange={(e) => setPExtThick(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Mix</label>
                  <select value={pMix} onChange={(e) => setPMix(e.target.value)} className={inputCls}>
                    <option value="1:3">1:3</option><option value="1:4">1:4</option><option value="1:6">1:6</option>
                  </select>
                </div>
                <div><label className={labelCls}>Wastage (%)</label><input type="number" min="0" max="50" value={pWastage} onChange={(e) => setPWastage(e.target.value)} className={inputCls} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pUneven} onChange={(e) => setPUneven(e.target.checked)} /> Uneven surface +10%</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pCeiling} onChange={(e) => setPCeiling(e.target.checked)} /> Plaster ceiling (at internal thickness)</label>
              <p className="text-xs text-txt-tertiary">Internal plaster uses the net wall area (gross × faces, minus IS 1200 opening deductions); external plaster uses the net area of one external face, with the same opening deductions.</p>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Plaster material</h3>
              <Row label="Wet volume" value={plaster.wetM3.toFixed(3)} unit="m³" />
              <Row label="Dry volume" value={plaster.dryM3.toFixed(3)} unit="m³" />
              <Row label="Cement" value={String(plaster.cementBags)} unit="Bags (50 kg)" />
              <Row label="Sand" value={plaster.sandM3.toFixed(2)} unit={`m³ (${plaster.sandCft.toFixed(1)} cft)`} />
              <Row label="Material cost" value={money(plasterCost, currency)} unit="" />
            </div>
          </>
        )}

        {activeTab === "paint" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Paint</h3>
              <div><label className={labelCls}>Paint preset (coverage is editable)</label>
                <select value={paintPreset} onChange={(e) => { setPaintPreset(e.target.value); const cov: Record<string, string> = { economy: "9.5", standard: "11", premium: "12.5", exterior: "9" }; setCoverage(cov[e.target.value] ?? "11"); }} className={inputCls}>
                  <option value="economy">Economy — 9.5 m²/L</option><option value="standard">Standard — 11 m²/L</option><option value="premium">Premium — 12.5 m²/L</option><option value="exterior">Exterior — 9 m²/L</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Coverage (m²/L/coat)</label><input type="number" min="5" max="20" step="any" value={coverage} onChange={(e) => setCoverage(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Primer coverage (m²/L)</label><input type="number" min="1" step="any" value={primerCoverage} onChange={(e) => setPrimerCoverage(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Paint coats (1–3)</label><input type="number" min="1" max="3" step="1" value={coats} onChange={(e) => setCoats(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Primer coats</label><input type="number" min="0" max="3" step="1" value={primerCoats} onChange={(e) => setPrimerCoats(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Putty coats</label><input type="number" min="0" max="3" step="1" value={puttyCoats} onChange={(e) => setPuttyCoats(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Wastage (%)</label><input type="number" min="0" max="50" value={paintWastage} onChange={(e) => setPaintWastage(e.target.value)} className={inputCls} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ceilingPaint} onChange={(e) => setCeilingPaint(e.target.checked)} /> Paint ceiling</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={skirtingDeduct} onChange={(e) => setSkirtingDeduct(e.target.checked)} /> Deduct skirting (perimeter × 0.1 m)</label>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Paint rate / L</label><input type="number" min="0" value={rPaint} onChange={(e) => setRPaint(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Primer rate / L</label><input type="number" min="0" value={rPrimer} onChange={(e) => setRPrimer(e.target.value)} className={inputCls} /></div>
              </div>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Paint quantities</h3>
              <Row label="Paintable area" value={paint.paintableAreaM2.toFixed(2)} unit="m²" />
              <Row label="Paint" value={String(paint.paintLitres)} unit="Litres" />
              <Row label="Packs to buy" value={paint.packs.map((p) => `${p.count} × ${p.sizeL} L`).join(" + ") || "—"} unit="" />
              <Row label="Primer" value={String(paint.primerLitres)} unit="Litres" />
              <Row label="Putty (indicative, 1.1 m²/kg)" value={String(paint.puttyKg)} unit="kg" />
              <Row label="Material cost" value={money(paintCost, currency)} unit="" />
            </div>
          </>
        )}

        {activeTab === "flooring" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Flooring &amp; skirting</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Tile length ({unit})</label><input type="number" min="0" step="any" value={tileL} onChange={(e) => setTileL(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Tile width ({unit})</label><input type="number" min="0" step="any" value={tileW} onChange={(e) => setTileW(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Grout gap (mm)</label><input type="number" min="0" value={groutMm} onChange={(e) => setGroutMm(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Tiles per box</label><input type="number" min="1" step="1" value={tilesPerBox} onChange={(e) => setTilesPerBox(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Laying pattern</label>
                  <select value={pattern} onChange={(e) => setPattern(e.target.value as TilePattern)} className={inputCls}>
                    {(Object.keys(TILE_PATTERN_WASTAGE) as TilePattern[]).map((p) => <option key={p} value={p}>{p} — {TILE_PATTERN_WASTAGE[p]}% waste</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Skirting height ({unit})</label><input type="number" min="0" step="any" value={skirtH} onChange={(e) => setSkirtH(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Mortar bed (mm)</label><input type="number" min="0" value={bedThick} onChange={(e) => setBedThick(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Tile rate / box</label><input type="number" min="0" value={rTileBox} onChange={(e) => setRTileBox(e.target.value)} className={inputCls} /></div>
              </div>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Flooring takeoff</h3>
              <Row label="Floor tiles" value={String(flooring.floorTiles)} unit="Nos" />
              <Row label="Skirting tiles (cut strips)" value={String(flooring.skirtingTiles)} unit="Nos" />
              <Row label="Total tiles" value={String(flooring.totalTiles)} unit="Nos" />
              <Row label="Boxes" value={String(flooring.boxes)} unit={`Boxes (${flooring.spares} spares)`} />
              <Row label="Grout (0.3 kg/m²)" value={flooring.groutKg.toFixed(1)} unit="kg" />
              <Row label="Bed cement (1:4)" value={String(flooring.bedCementBags)} unit="Bags" />
              <Row label="Bed sand" value={flooring.bedSandM3.toFixed(2)} unit={`m³ (${flooring.bedSandCft.toFixed(1)} cft)`} />
              <Row label="Material cost" value={money(flooringCost, currency)} unit="" />
            </div>
          </>
        )}

        {activeTab === "countertop" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Countertop</h3>
              <div><label className={labelCls}>Shape</label>
                <select value={cShape} onChange={(e) => setCShape(e.target.value as CounterShape)} className={inputCls}>
                  <option value="straight">Straight</option><option value="l-shape">L-shape</option><option value="u-shape">U-shape</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelCls}>Length A ({unit})</label><input type="number" min="0" step="any" value={cLA} onChange={(e) => setCLA(e.target.value)} className={inputCls} /></div>
                {cShape !== "straight" && <div><label className={labelCls}>Length B ({unit})</label><input type="number" min="0" step="any" value={cLB} onChange={(e) => setCLB(e.target.value)} className={inputCls} /></div>}
                {cShape === "u-shape" && <div><label className={labelCls}>Length C ({unit})</label><input type="number" min="0" step="any" value={cLC} onChange={(e) => setCLC(e.target.value)} className={inputCls} /></div>}
                <div><label className={labelCls}>Depth ({unit})</label><input type="number" min="0" step="any" value={cDepth} onChange={(e) => setCDepth(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Slab thickness (mm)</label><input type="number" min="0" value={cThick} onChange={(e) => setCThick(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Wastage (%)</label><input type="number" min="0" max="50" value={cWastage} onChange={(e) => setCWastage(e.target.value)} className={inputCls} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sinkOn} onChange={(e) => setSinkOn(e.target.checked)} /> Sink cutout (0.6 × 0.45 m)</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hobOn} onChange={(e) => setHobOn(e.target.checked)} /> Hob cutout (0.6 × 0.5 m)</label>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Slab rate / m²</label><input type="number" min="0" value={rCounter} onChange={(e) => setRCounter(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Edge polish rate / m</label><input type="number" min="0" value={rEdge} onChange={(e) => setREdge(e.target.value)} className={inputCls} /></div>
              </div>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Countertop takeoff</h3>
              <Row label="Gross area" value={counter.grossAreaM2.toFixed(2)} unit="m²" />
              <Row label="Net area (after cutouts)" value={counter.netAreaM2.toFixed(2)} unit="m²" />
              <Row label="Skirting area" value={counter.skirtingAreaM2.toFixed(2)} unit="m²" />
              <Row label="Area to order" value={counter.orderAreaM2.toFixed(2)} unit="m²" />
              <Row label="Slab volume" value={counter.slabVolumeM3.toFixed(3)} unit="m³" />
              <Row label="Edge polishing" value={counter.edgePolishM.toFixed(2)} unit="m" />
              <Row label="Material cost" value={money(counterCost, currency)} unit="" />
            </div>
          </>
        )}

        {activeTab === "carpentry" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Carpentry / woodwork</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Stud spacing ({unit})</label><input type="number" min="0" step="any" value={studSpacing} onChange={(e) => setStudSpacing(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Wastage (%)</label><input type="number" min="0" max="50" value={woodWastage} onChange={(e) => setWoodWastage(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Purpose</label>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value as "panelling" | "formwork")} className={inputCls}>
                    <option value="panelling">Wall panelling (fixed — no reuse)</option>
                    <option value="formwork">Formwork / shuttering (reuse applies)</option>
                  </select>
                </div>
                {purpose === "formwork" && <div><label className={labelCls}>Reuse factor (1–8)</label><input type="number" min="1" max="8" step="1" value={reuse} onChange={(e) => setReuse(e.target.value)} className={inputCls} /></div>}
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={openRun} onChange={(e) => setOpenRun(e.target.checked)} /> Open run (add 1 stud — closed rooms do not need it)</label>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Stud rate / Nos</label><input type="number" min="0" value={rStud} onChange={(e) => setRStud(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Plywood rate / sheet</label><input type="number" min="0" value={rPly} onChange={(e) => setRPly(e.target.value)} className={inputCls} /></div>
              </div>
              <p className="text-xs text-txt-tertiary">Reuse divides formwork sheets only. Dividing fixed panelling by a reuse factor was an old bug — panelling sheets are bought once.</p>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Carpentry takeoff</h3>
              <Row label="Vertical studs" value={String(carpentry.studs)} unit="Nos" />
              <Row label="Plywood sheets (2.44 × 1.22 m)" value={String(carpentry.sheets)} unit="Nos" />
              <Row label="Material cost" value={money(carpentryCost, currency)} unit="" />
            </div>
          </>
        )}

        {activeTab === "carpet" && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Carpet &amp; built-up area</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Internal-wall deduction (%)</label><input type="number" min="0" max="90" value={wallDeductPct} onChange={(e) => setWallDeductPct(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Super built-up addition (%)</label><input type="number" min="0" value={superAddPct} onChange={(e) => setSuperAddPct(e.target.value)} className={inputCls} /></div>
              </div>
              <p className="text-xs text-txt-tertiary">Built-up = carpet ÷ (1 − deduction%) is an assumption-based conversion, labelled as such — it is not a measurement. For a measured built-up area, add the internal-wall area and common-area share instead (see the Room Area Calculator).</p>
            </div>
            <div className="space-y-3 bg-surface-hover/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Area breakdown</h3>
              <Row label="Carpet area (net)" value={carpet.carpetAreaM2.toFixed(2)} unit="m²" />
              <Row label="Built-up area (assumption-based)" value={carpet.builtUpAreaM2.toFixed(2)} unit="m²" />
              <Row label="Super built-up area" value={carpet.superBuiltUpAreaM2.toFixed(2)} unit="m²" />
            </div>
          </>
        )}
      </div>

      <div className="bg-ink rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm text-gray-200">Estimated material cost (tabs you have opened)</p>
          <p className="text-3xl font-bold">{money(grandCost, currency)}</p>
          {grandCost == null && <p className="text-sm text-accent-400">Enter all rates to see a total — unknown rates show as “—”, never as 0.</p>}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-200">
          <Calculator size={18} /> Rates are indicative — confirm with your supplier.
        </div>
      </div>

      <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">How the room is measured</h2>
          <p>
            You enter the room once — length, width, height, wall faces and a list of openings — and all seven tabs
            work from the same geometry. The net wall area is the gross wall area minus the openings, deducted under
            IS 1200: openings under 0.5 m² are not deducted, openings from 0.5 to 3 m² are deducted on one face at the
            full area, and openings over 3 m² are deducted on both faces with the jambs added back. Because every tab
            shares that net area, the plaster, paint and flooring quantities can never disagree with each other.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-txt-primary">What each tab gives you</h2>
          <p>
            Masonry gives bricks, blocks, mortar, cement bags and sand. Plaster gives wet and dry mortar, cement and
            sand for internal, external and ceiling plaster. Paint gives primer, paint in 20/10/4/1-litre packs and
            putty, by coverage and coats. Flooring gives floor tiles, skirting tiles, boxes and bedding mortar.
            Countertops give net and order area, edge polish and slab volume — thickness included. Carpentry gives
            studs, panelling sheets and formwork sheets, with reuse applied only to formwork. Carpet gives carpet,
            built-up and super built-up area with the loading factor labelled as an assumption.
          </p>
        </section>
      </article>

      <FormulaAccordion steps={steps} />
    </div>
  );
}
