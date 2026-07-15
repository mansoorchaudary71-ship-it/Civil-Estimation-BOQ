import React, { useState, useMemo } from "react";
import { useGlobalSettings, MeasurementSystem } from "../../context/SettingsContext";
import { useUnitChange, useConvertedState } from "../../hooks/useUnitChange";
import {
  Square, Triangle, Circle, Layers, Ruler, Map as MapIcon, Home, Compass, RectangleHorizontal, Hexagon, Type, CornerDownRight, Calculator, PaintBucket, Plus, Trash2, ShieldCheck
} from "lucide-react";
import { GlobalFAQ } from "../ui/GlobalFAQ";
import { UniversalTabs } from "../ui/UniversalTabs";
import { DetailedCalculationDisplay } from "../ui/DetailedCalculationDisplay";
import toast from 'react-hot-toast';

export default function AreaSpaceCalculator() {
  const { currentUnit } = useGlobalSettings();
  
  useUnitChange((newUnit: MeasurementSystem) => {
    toast.success(`Automatically recalculated area inputs to ${newUnit === 'SI' ? 'Metric' : 'Imperial'} format.`, { icon: '🔄', id: 'area_recalc_toast' });
  });

  const isMetric = currentUnit === "Metric";
  const uLen = isMetric ? "m" : "ft";
  const uArea = isMetric ? "m²" : "sq.ft";

  const [activeTab, setActiveTab] = useState<"shape" | "property" | "plot" | "roof" | "plaster">("shape");

  // --- Tab 1: Shape Calculator ---
  const [shapeType, setShapeType] = useState("rectangle");
  const [shapeParams, setShapeParams] = useConvertedState<Record<string, number>>({
    length: 5, width: 4, radius: 3, base: 4, height: 3, sideA: 5, sideB: 7, sideC: 4,
    l1: 5, l2: 3, w1: 2, w2: 2, tTop: 6, tLegWidth: 2, tTotalHeight: 5, tTopThickness: 1,
  }, 'length');
  const [polygonCoords, setPolygonCoords] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 4, y: 4 }, { x: 1, y: 3 },
  ]);

  const handleShapeParam = (key: string, val: number) => setShapeParams((prev) => ({ ...prev, [key]: val }));

  const calculateShape = () => {
    let area = 0, perimeter = 0;
    const p = shapeParams;
    switch (shapeType) {
      case "rectangle":
        area = p.length * p.width;
        perimeter = 2 * (p.length + p.width);
        break;
      case "square":
        area = p.length * p.length;
        perimeter = 4 * p.length;
        break;
      case "circle":
        area = Math.PI * p.radius * p.radius;
        perimeter = 2 * Math.PI * p.radius;
        break;
      case "triangle":
        const s = (p.sideA + p.sideB + p.sideC) / 2;
        area = Math.sqrt(Math.max(0, s * (s - p.sideA) * (s - p.sideB) * (s - p.sideC)));
        perimeter = p.sideA + p.sideB + p.sideC;
        break;
      case "trapezoid":
        area = ((p.sideA + p.sideB) / 2) * p.height;
        const leg = Math.sqrt(Math.pow(Math.abs(p.sideB - p.sideA) / 2, 2) + Math.pow(p.height, 2));
        perimeter = p.sideA + p.sideB + 2 * leg;
        break;
      case "l-shape":
        area = p.l1 * p.w1 + (p.l2 - p.w1) * p.w2;
        perimeter = 2 * p.l1 + 2 * p.l2;
        break;
      case "t-shape":
        area = p.tTop * p.tTopThickness + (p.tTotalHeight - p.tTopThickness) * p.tLegWidth;
        perimeter = 2 * p.tTop + 2 * p.tTotalHeight;
        break;
      case "polygon":
        let sum = 0, perim = 0;
        const n = polygonCoords.length;
        if (n >= 3) {
          for (let i = 0; i < n; i++) {
            const current = polygonCoords[i];
            const next = polygonCoords[(i + 1) % n];
            sum += current.x * next.y - next.x * current.y;
            perim += Math.hypot(next.x - current.x, next.y - current.y);
          }
          area = Math.abs(sum) / 2;
          perimeter = perim;
        }
        break;
    }
    return { area, perimeter };
  };
  const shapeData = calculateShape();

  // --- Tab 2: Property Area ---
  const [propParams, setPropParams] = useConvertedState({
    carpetReq: 100, internalWallsPerc: 10, externalWallsPerc: 5, balconyArea: 10, commonAreaPerc: 20,
  });
  const handlePropParam = (key: string, val: number) => setPropParams((prev) => ({ ...prev, [key]: val }));

  const propertyCalc = useMemo(() => {
    const traditionalCarpet = propParams.carpetReq;
    const reraCarpetArea = traditionalCarpet + traditionalCarpet * (propParams.internalWallsPerc / 100);
    const plinthArea = reraCarpetArea + traditionalCarpet * (propParams.externalWallsPerc / 100);
    const builtUpArea = plinthArea + propParams.balconyArea;
    const superBuiltUpArea = builtUpArea + builtUpArea * (propParams.commonAreaPerc / 100);
    return { traditionalCarpet, reraCarpetArea, plinthArea, builtUpArea, superBuiltUpArea };
  }, [propParams]);

  // --- Tab 3: Plot Measurement ---
  const [plotBounds, setPlotBounds] = useConvertedState({ n: 30, s: 30, e: 40, w: 40, d: 50 }, "length");
  const boundsArea = useMemo(() => {
    const { n, s, e, w, d } = plotBounds;
    const s1 = (n + e + d) / 2;
    const area1 = Math.sqrt(Math.max(0, s1 * (s1 - n) * (s1 - e) * (s1 - d)));
    const s2 = (s + w + d) / 2;
    const area2 = Math.sqrt(Math.max(0, s2 * (s2 - s) * (s2 - w) * (s2 - d)));
    return { area1, area2, total: area1 + area2, perimeter: n + s + e + w };
  }, [plotBounds]);

  // --- Tab 4: Roof Area ---
  const [roofParams, setRoofParams] = useConvertedState({ floorArea: 150, pitchAngle: 30, overhang: 0.6, perimeterLength: 50 }, { floorArea: "area", pitchAngle: "none", overhang: "length", perimeterLength: "length" });
  const roofCalc = useMemo(() => {
    const overhangArea = roofParams.perimeterLength * roofParams.overhang;
    const totalHorizontalArea = roofParams.floorArea + overhangArea;
    const pitchRad = (roofParams.pitchAngle * Math.PI) / 180;
    const trueRoofArea = totalHorizontalArea / Math.cos(pitchRad);
    return { totalHorizontalArea, trueRoofArea };
  }, [roofParams]);

  // --- Tab 5: Plaster & Paint Deductions ---
  const [wallLen, setWallLen] = useConvertedState(5, "length");
  const [wallHt, setWallHt] = useConvertedState(3, "length");
  const [bothFaces, setBothFaces] = useState(false);
  const [jambDepth, setJambDepth] = useConvertedState(0.2, "length");
  const [openings, setOpenings] = useConvertedState([{ w: 1, h: 2, count: 1 }], { w: "length", h: "length", count: "none" });

  const plasterCalc = useMemo(() => {
    let grossArea = wallLen * wallHt;
    if (bothFaces) grossArea *= 2;

    let totalDeduction = 0;
    let jambAddition = 0;

    let steps = [];

    steps.push({
      stepName: "1. Gross Wall Area",
      equation: bothFaces ? "A_gross = (Length × Height) × 2" : "A_gross = Length × Height",
      variables: [ { name: "Length", value: wallLen, unit: uLen }, { name: "Height", value: wallHt, unit: uLen } ],
// Replace them all using exact exact string.
      substitution: bothFaces ? `A_gross = (${wallLen} × ${wallHt}) × 2` : `A_gross = ${wallLen} × ${wallHt}`,
      result: parseFloat(grossArea.toFixed(4)),
      resultUnit: uArea,
      resultColor: "slate"
    });

    openings.forEach((op, idx) => {
      const area = op.w * op.h;
      const totalOpArea = area * op.count;
      let deduct = 0;
      let add = 0;
      let ruleApplied = "";

      if (area < 0.5) {
        deduct = 0;
        ruleApplied = "< 0.5 sq.m (No deduction)";
      } else if (area <= 3.0) {
        deduct = bothFaces ? totalOpArea : (totalOpArea / 2);
        ruleApplied = bothFaces ? "0.5 to 3 sq.m (Deduct 1 face only for both side plaster)" : "0.5 to 3 sq.m (Deduct 50% for single side plaster measurement)";
      } else {
        deduct = bothFaces ? totalOpArea * 2 : totalOpArea;
        ruleApplied = "> 3 sq.m (Deduct entirely, add jambs)";
        add = (2 * op.h + op.w) * jambDepth * op.count;
      }
      totalDeduction += deduct;
      jambAddition += add;

      steps.push({
        stepName: `Opening ${idx + 1} Deduction`,
        equation: ruleApplied,
        insight: `Width: ${op.w}${uLen}, Height: ${op.h}${uLen}, Count: ${op.count}`,
        variables: [ { name: "Total Op Area", value: totalOpArea, unit: uArea } ],
        substitution: `Deduct: ${deduct.toFixed(2)} ${uArea}` + (add > 0 ? `, Add Jambs: ${add.toFixed(2)} ${uArea}` : ""),
        result: parseFloat((add - deduct).toFixed(4)),
        resultUnit: uArea,
        resultColor: "rose"
      });
    });

    const netArea = grossArea - totalDeduction + jambAddition;

    steps.push({
      stepName: "Net Plastering/Paint Area",
      equation: "A_net = A_gross - Deductions + Jambs",
      variables: [
        { name: "Gross", value: grossArea.toFixed(2), unit: uArea },
        { name: "Deductions", value: totalDeduction.toFixed(2), unit: uArea },
        { name: "Jambs", value: jambAddition.toFixed(2), unit: uArea }
      ],
      substitution: `A_net = ${grossArea.toFixed(2)} - ${totalDeduction.toFixed(2)} + ${jambAddition.toFixed(2)}`,
      result: parseFloat(netArea.toFixed(4)),
      resultUnit: uArea,
      resultColor: "emerald"
    });

    return { grossArea, totalDeduction, jambAddition, netArea, steps };
  }, [wallLen, wallHt, bothFaces, openings, jambDepth, uLen, uArea]);

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6 animate-in fade-in duration-500 pb-[120px] px-4 md:px-0">
      <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] shadow-sm overflow-hidden">
        <h1 className="tabular-nums flex items-center gap-3 mb-2 text-xl font-semibold text-slate-800 tracking-tight mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-[24px] overflow-hidden">
            <Ruler className="w-8 h-8" />
          </div>
          Plot Area Calculator — Irregular Land, RERA & IS Code Compliant
        </h1>
        <p className="mt-2 text-base font-normal text-slate-600 leading-relaxed">
          Professional standard area computation with geometric triangulation, RERA matrices, roof pitch multi-factor, and IS Code opening deductions.
        </p>
      </div>

      {/* TABS */}
      <div className="-mx-2 sm:-mx-4 px-2 sm:px-4 pb-4 md:mx-0 md:px-0">
        <UniversalTabs
          tabs={[
            { id: "shape", label: "2D Shapes", icon: <Square className="w-5 h-5" /> },
            { id: "plot", label: "Triangulation", icon: <MapIcon className="w-5 h-5" /> },
            { id: "property", label: "RERA Areas", icon: <Home className="w-5 h-5" /> },
            { id: "plaster", label: "Plaster / Paint Deductions", icon: <PaintBucket className="w-5 h-5" /> },
            { id: "roof", label: "Roof Pitch", icon: <Layers className="w-5 h-5" /> }
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as any)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: SHAPES */}
          {activeTab === "shape" && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                <Square className="w-5 h-5 text-indigo-500" /> 2D Shape Calculator
              </h3>
              <div className="mb-6 overflow-x-auto pb-2 flex gap-2">
                <select value={shapeType} onChange={(e) => setShapeType(e.target.value)} className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500">
                  <option value="rectangle">Rectangle</option>
                  <option value="square">Square</option>
                  <option value="triangle">Triangle</option>
                  <option value="circle">Circle</option>
                  <option value="trapezoid">Trapezoid</option>
                  <option value="l-shape">L-Shape</option>
                  <option value="t-shape">T-Shape</option>
                  <option value="polygon">Irregular Polygon</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {shapeType === "rectangle" && (
                  <>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Length ({uLen})</label><><label htmlFor="a11y-input-51" className="sr-only">Input</label>
<input id="a11y-input-51" type="number" inputMode="decimal" value={shapeParams.length} onChange={(e) => handleShapeParam("length", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Width ({uLen})</label><><label htmlFor="a11y-input-52" className="sr-only">Input</label>
<input id="a11y-input-52" type="number" inputMode="decimal" value={shapeParams.width} onChange={(e) => handleShapeParam("width", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                  </>
                )}
                {shapeType === "square" && (
                  <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Side Length ({uLen})</label><><label htmlFor="a11y-input-53" className="sr-only">Input</label>
<input id="a11y-input-53" type="number" inputMode="decimal" value={shapeParams.length} onChange={(e) => handleShapeParam("length", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                )}
                {shapeType === "circle" && (
                  <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Radius ({uLen})</label><><label htmlFor="a11y-input-54" className="sr-only">Input</label>
<input id="a11y-input-54" type="number" inputMode="decimal" value={shapeParams.radius} onChange={(e) => handleShapeParam("radius", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                )}
                {shapeType === "triangle" && (
                  <>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Side A ({uLen})</label><><label htmlFor="a11y-input-55" className="sr-only">Input</label>
<input id="a11y-input-55" type="number" inputMode="decimal" value={shapeParams.sideA} onChange={(e) => handleShapeParam("sideA", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Side B ({uLen})</label><><label htmlFor="a11y-input-56" className="sr-only">Input</label>
<input id="a11y-input-56" type="number" inputMode="decimal" value={shapeParams.sideB} onChange={(e) => handleShapeParam("sideB", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Side C ({uLen})</label><><label htmlFor="a11y-input-57" className="sr-only">Input</label>
<input id="a11y-input-57" type="number" inputMode="decimal" value={shapeParams.sideC} onChange={(e) => handleShapeParam("sideC", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                  </>
                )}
                {shapeType === "trapezoid" && (
                  <>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Parallel Side A ({uLen})</label><><label htmlFor="a11y-input-58" className="sr-only">Input</label>
<input id="a11y-input-58" type="number" inputMode="decimal" value={shapeParams.sideA} onChange={(e) => handleShapeParam("sideA", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Parallel Side B ({uLen})</label><><label htmlFor="a11y-input-59" className="sr-only">Input</label>
<input id="a11y-input-59" type="number" inputMode="decimal" value={shapeParams.sideB} onChange={(e) => handleShapeParam("sideB", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                    <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Height distance ({uLen})</label><><label htmlFor="a11y-input-60" className="sr-only">Input</label>
<input id="a11y-input-60" type="number" inputMode="decimal" value={shapeParams.height} onChange={(e) => handleShapeParam("height", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                  </>
                )}
                {shapeType === "polygon" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Polygon Coordinates (x,y in {uLen})</label>
                    <div className="space-y-2">
                      {polygonCoords.map((coord, idx) => (
                        <div key={idx} className="flex gap-2">
                          <><label htmlFor="a11y-input-61" className="sr-only">X</label>
<input id="a11y-input-61" type="number" inputMode="decimal" value={coord.x} onChange={(e) => { const newC = [...polygonCoords]; newC[idx].x = +e.target.value; setPolygonCoords(newC); }} className="w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full" placeholder="X" /></>
                          <><label htmlFor="a11y-input-62" className="sr-only">Y</label>
<input id="a11y-input-62" type="number" inputMode="decimal" value={coord.y} onChange={(e) => { const newC = [...polygonCoords]; newC[idx].y = +e.target.value; setPolygonCoords(newC); }} className="w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full" placeholder="Y" /></>
                          <button aria-label="Delete" onClick={() => setPolygonCoords(polygonCoords.filter((_, i) => i !== idx))} className="px-3 bg-rose-50 text-rose-500 rounded-full font-bold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => setPolygonCoords([...polygonCoords, { x: 0, y: 0 }])} className="w-full py-3 bg-indigo-50 text-indigo-600 font-bold rounded-full mt-2 flex justify-center items-center gap-2 border border-indigo-200 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Plus className="w-4 h-4" /> Add Vertex</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PLOT MEASUREMENT */}
          {activeTab === "plot" && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <MapIcon className="w-5 h-5 text-emerald-500" /> Calculate Irregular Plot Area Using Geometric Triangulation
              </h2>
              <p className="mb-6 text-base font-normal text-slate-600 leading-relaxed">
                Calculates the exact area of irregular plots by dividing them into two triangles with a measured diagonal.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div><label className="block uppercase mb-2 text-sm font-medium text-slate-700 mb-1">North Side ({uLen})</label><><label htmlFor="a11y-input-63" className="sr-only">Input</label>
<input id="a11y-input-63" type="number" inputMode="decimal" value={plotBounds.n} onChange={(e) => setPlotBounds({ ...plotBounds, n: +e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-emerald-500" /></></div>
                <div><label className="block uppercase mb-2 text-sm font-medium text-slate-700 mb-1">South Side ({uLen})</label><><label htmlFor="a11y-input-64" className="sr-only">Input</label>
<input id="a11y-input-64" type="number" inputMode="decimal" value={plotBounds.s} onChange={(e) => setPlotBounds({ ...plotBounds, s: +e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-emerald-500" /></></div>
                <div><label className="block uppercase mb-2 text-sm font-medium text-slate-700 mb-1">East Side ({uLen})</label><><label htmlFor="a11y-input-65" className="sr-only">Input</label>
<input id="a11y-input-65" type="number" inputMode="decimal" value={plotBounds.e} onChange={(e) => setPlotBounds({ ...plotBounds, e: +e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-emerald-500" /></></div>
                <div><label className="block uppercase mb-2 text-sm font-medium text-slate-700 mb-1">West Side ({uLen})</label><><label htmlFor="a11y-input-66" className="sr-only">Input</label>
<input id="a11y-input-66" type="number" inputMode="decimal" value={plotBounds.w} onChange={(e) => setPlotBounds({ ...plotBounds, w: +e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-emerald-500" /></></div>
                <div className="col-span-2 md:col-span-1"><label className="block uppercase mb-2 text-indigo-500 text-sm font-medium text-slate-700 mb-1">Diagonal NW-SE ({uLen})</label><><label htmlFor="a11y-input-67" className="sr-only">Input</label>
<input id="a11y-input-67" type="number" inputMode="decimal" value={plotBounds.d} onChange={(e) => setPlotBounds({ ...plotBounds, d: +e.target.value })} className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-900 focus:ring-indigo-500" /></></div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPERTY RERA */}
          {activeTab === "property" && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <Home className="w-5 h-5 text-purple-500" /> RERA Carpet Area Calculator (NBC/RERA Compliant)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Net Carpet Area ({uArea})</label><><label htmlFor="a11y-input-68" className="sr-only">Input</label>
<input id="a11y-input-68" type="number" inputMode="decimal" value={propParams.carpetReq} onChange={(e) => handlePropParam("carpetReq", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Internal Partition Walls (%)</label><><label htmlFor="a11y-input-69" className="sr-only">Input</label>
<input id="a11y-input-69" type="number" inputMode="decimal" value={propParams.internalWallsPerc} onChange={(e) => handlePropParam("internalWallsPerc", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">External Walls (%)</label><><label htmlFor="a11y-input-70" className="sr-only">Input</label>
<input id="a11y-input-70" type="number" inputMode="decimal" value={propParams.externalWallsPerc} onChange={(e) => handlePropParam("externalWallsPerc", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Balcony/Terrace ({uArea})</label><><label htmlFor="a11y-input-71" className="sr-only">Input</label>
<input id="a11y-input-71" type="number" inputMode="decimal" value={propParams.balconyArea} onChange={(e) => handlePropParam("balconyArea", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Common Spaces Share (%)</label><><label htmlFor="a11y-input-72" className="sr-only">Input</label>
<input id="a11y-input-72" type="number" inputMode="decimal" value={propParams.commonAreaPerc} onChange={(e) => handlePropParam("commonAreaPerc", +e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
              </div>
            </div>
          )}

          {/* TAB 4: PLASTER DEDUCTIONS */}
          {activeTab === "plaster" && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <PaintBucket className="w-5 h-5 text-rose-500" /> IS Code Opening Deductions for Accurate Net Area
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Wall Length ({uLen})</label><><label htmlFor="a11y-input-73" className="sr-only">Input</label>
<input id="a11y-input-73" type="number" inputMode="decimal" value={wallLen} onChange={(e) => setWallLen(+e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Wall Height ({uLen})</label><><label htmlFor="a11y-input-74" className="sr-only">Input</label>
<input id="a11y-input-74" type="number" inputMode="decimal" value={wallHt} onChange={(e) => setWallHt(+e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div className="col-span-2 md:col-span-1 flex flex-col justify-center">
                  <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Faces Plastered</label>
                  <select value={bothFaces ? "2" : "1"} onChange={(e) => setBothFaces(e.target.value === "2")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[16px] text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-rose-500">
                    <option value="1">Single Face</option>
                    <option value="2">Both Faces</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Jamb Depth ({uLen}) <span className="font-normal text-slate-500">(For large openings {'>3'}sq.m)</span></label>
                <><label htmlFor="a11y-input-75" className="sr-only">Input</label>
<input id="a11y-input-75" type="number" inputMode="decimal" value={jambDepth} onChange={(e) => setJambDepth(+e.target.value)} className="w-full md:w-1/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></>
              </div>

              <hr className="my-6 border-slate-200" />
              
              <h4 className="mb-4 text-lg font-medium text-slate-800">Openings (Doors / Windows)</h4>
              <div className="space-y-3">
                {openings.map((op, idx) => (
                  <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-end">
                    <div className="w-[45%] md:w-auto flex-1"><label className="block mb-1 text-sm font-medium text-slate-700">Width ({uLen})</label><><label htmlFor="a11y-input-76" className="sr-only">Input</label>
<input id="a11y-input-76" type="number" inputMode="decimal" value={op.w} onChange={(e) => { const newOp = [...openings]; newOp[idx].w = +e.target.value; setOpenings(newOp); }} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-rose-500" /></></div>
                    <div className="w-[45%] md:w-auto flex-1"><label className="block mb-1 text-sm font-medium text-slate-700">Height ({uLen})</label><><label htmlFor="a11y-input-77" className="sr-only">Input</label>
<input id="a11y-input-77" type="number" inputMode="decimal" value={op.h} onChange={(e) => { const newOp = [...openings]; newOp[idx].h = +e.target.value; setOpenings(newOp); }} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-rose-500" /></></div>
                    <div className="w-auto flex-1"><label className="block mb-1 text-sm font-medium text-slate-700">Count</label><><label htmlFor="a11y-input-78" className="sr-only">Input</label>
<input id="a11y-input-78" type="number" inputMode="decimal" value={op.count} onChange={(e) => { const newOp = [...openings]; newOp[idx].count = Math.max(1, parseInt(e.target.value) || 1); setOpenings(newOp); }} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 focus:ring-rose-500" /></></div>
                    <button aria-label="Delete" onClick={() => setOpenings(openings.filter((_, i) => i !== idx))} className="px-3 py-3 bg-rose-50 text-rose-500 rounded-full font-bold hover:bg-rose-100 transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
                <button onClick={() => setOpenings([...openings, { w: 1, h: 2, count: 1 }])} className="w-full py-3 bg-rose-50 text-rose-600 font-bold rounded-full mt-2 flex justify-center items-center gap-2 hover:bg-rose-100 transition border border-rose-200 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Plus className="w-5 h-5" /> Add Opening</button>
              </div>
            </div>
          )}

          {/* TAB 5: ROOF PITCH */}
          {activeTab === "roof" && (
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <Layers className="w-5 h-5 text-amber-500" /> Roof Pitch Area with Multi-Factor Correction
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Horizontal Area ({uArea})</label><><label htmlFor="a11y-input-79" className="sr-only">Input</label>
<input id="a11y-input-79" type="number" inputMode="decimal" value={roofParams.floorArea} onChange={(e) => setRoofParams({ ...roofParams, floorArea: +e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Roof Pitch Angle (°)</label><><label htmlFor="a11y-input-80" className="sr-only">Input</label>
<input id="a11y-input-80" type="number" inputMode="decimal" value={roofParams.pitchAngle} onChange={(e) => setRoofParams({ ...roofParams, pitchAngle: +e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Roof Overhang ({uLen})</label><><label htmlFor="a11y-input-81" className="sr-only">Input</label>
<input id="a11y-input-81" type="number" inputMode="decimal" value={roofParams.overhang} onChange={(e) => setRoofParams({ ...roofParams, overhang: +e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
                <div><label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Eaves Perimeter / Length ({uLen})</label><><label htmlFor="a11y-input-82" className="sr-only">Input</label>
<input id="a11y-input-82" type="number" inputMode="decimal" value={roofParams.perimeterLength} onChange={(e) => setRoofParams({ ...roofParams, perimeterLength: +e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-slate-900" /></></div>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS PANEL (RIGHT) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="w-full bg-white/90 backdrop-blur-xl border border-white/20 p-4 sm:p-8 rounded-[2rem] shadow-sm sticky top-6 overflow-hidden">
            <h3 className="tabular-nums mb-6 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
              <Calculator className="w-5 h-5 text-indigo-600" /> Calculation Results
            </h3>

            {activeTab === "shape" && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-[24px] border border-indigo-100 shadow-sm text-indigo-900 overflow-hidden">
                  <p className="text-indigo-600 uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">Total Net Area</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight text-base font-normal text-slate-600 leading-relaxed">
                    {shapeData.area.toFixed(2)} <span className="text-xl font-medium opacity-60">{uArea}</span>
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 shadow-sm text-slate-800 overflow-hidden">
                  <p className="uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">Perimeter</p>
                  <p className="text-base font-normal text-slate-600 leading-relaxed">
                    {shapeData.perimeter.toFixed(2)} <span className="text-base opacity-50">{uLen}</span>
                  </p>
                </div>
              </div>
            )}

            {activeTab === "plot" && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-[24px] border border-emerald-100 text-emerald-900 shadow-sm overflow-hidden">
                  <p className="text-emerald-600 uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">Triangulated Land Area</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight text-base font-normal text-slate-600 leading-relaxed">
                    {Number.isNaN(boundsArea.total) ? "Invalid" : boundsArea.total.toFixed(2)} <span className="text-xl opacity-60 font-medium">{uArea}</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-emerald-200/50 text-sm font-medium opacity-80 grid gap-2">
                    <p className="flex justify-between text-base font-normal text-slate-600 leading-relaxed"><span>Sub-triangle 1 (North):</span> <span>{Number.isNaN(boundsArea.area1) ? "-" : boundsArea.area1.toFixed(2)} {uArea}</span></p>
                    <p className="flex justify-between text-base font-normal text-slate-600 leading-relaxed"><span>Sub-triangle 2 (South):</span> <span>{Number.isNaN(boundsArea.area2) ? "-" : boundsArea.area2.toFixed(2)} {uArea}</span></p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 text-slate-800 shadow-sm overflow-hidden">
                  <p className="uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">Outer Perimeter</p>
                  <p className="text-base font-normal text-slate-600 leading-relaxed">{boundsArea.perimeter.toFixed(2)} <span className="text-base opacity-50">{uLen}</span></p>
                </div>
              </div>
            )}

            {activeTab === "property" && (
              <div className="space-y-3">
                <div className="p-5 bg-purple-50 rounded-[24px] border border-purple-100 mb-4 shadow-sm overflow-hidden">
                  <p className="text-purple-600 uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">RERA Carpet Area</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight text-purple-700 text-base font-normal text-slate-600 leading-relaxed">
                    {propertyCalc.reraCarpetArea.toFixed(2)} <span className="text-xl font-medium opacity-60">{uArea}</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-purple-200/50 text-sm text-purple-800 font-semibold leading-relaxed">
                    Legally defined space encompassing net usable area + internal partition walls (Excludes balconies/external walls).
                  </div>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-slate-800 font-medium">
                  <span className="text-sm text-slate-600">Trad. Carpet Area</span>
                  <span className="font-bold">{propertyCalc.traditionalCarpet.toFixed(2)} {uArea}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-slate-800 font-medium">
                  <span className="text-sm text-slate-600 flex flex-col"><span>Plinth Area</span><span className="text-sm text-slate-600">IS 3861 bounds</span></span>
                  <span className="font-bold">{propertyCalc.plinthArea.toFixed(2)} {uArea}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-slate-800 font-medium">
                  <span className="text-sm text-slate-600">Built-Up Area</span>
                  <span className="font-bold text-sky-600">{propertyCalc.builtUpArea.toFixed(2)} {uArea}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 text-slate-800 font-medium">
                  <span className="text-sm text-slate-600">Super Built-Up</span>
                  <span className="font-bold text-emerald-600">{propertyCalc.superBuiltUpArea.toFixed(2)} {uArea}</span>
                </div>
              </div>
            )}

            {activeTab === "roof" && (
              <div className="space-y-4">
                <div className="p-5 bg-amber-50 rounded-[24px] border border-amber-100 text-amber-900 shadow-sm overflow-hidden">
                  <p className="text-amber-600 uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">True Sloped Roof Area</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight text-base font-normal text-slate-600 leading-relaxed">
                    {roofCalc.trueRoofArea.toFixed(2)} <span className="text-xl opacity-60 font-medium">{uArea}</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-amber-200/50 text-sm opacity-80 grid gap-2 font-medium">
                    <p className="flex justify-between text-base font-normal text-slate-600 leading-relaxed"><span>Base + Overhangs:</span> <span>{roofCalc.totalHorizontalArea.toFixed(2)} {uArea}</span></p>
                    <p className="flex justify-between text-amber-600 text-base font-normal text-slate-600 leading-relaxed"><span>Pitch Multiplier (Secant):</span> <span>{(1 / Math.cos((roofParams.pitchAngle * Math.PI) / 180)).toFixed(3)}x</span></p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "plaster" && (
              <div className="space-y-4">
                <div className="p-5 bg-rose-50 rounded-[24px] border border-rose-100 text-rose-900 shadow-sm overflow-hidden">
                  <p className="text-rose-600 uppercase tracking-widest mb-1 text-base font-normal text-slate-600 leading-relaxed">Net Plastering Area</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight text-base font-normal text-slate-600 leading-relaxed">
                    {plasterCalc.netArea.toFixed(2)} <span className="text-xl opacity-60 font-medium">{uArea}</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-rose-200/50 text-sm font-medium grid gap-2 text-rose-800/80">
                      <p className="flex justify-between text-base font-normal text-slate-600 leading-relaxed"><span>Wall Gross Area:</span> <span>{plasterCalc.grossArea.toFixed(2)} {uArea}</span></p>
                      <p className="flex justify-between text-rose-600 text-base font-normal text-slate-600 leading-relaxed"><span>Opening Deductions:</span> <span>- {plasterCalc.totalDeduction.toFixed(2)} {uArea}</span></p>
                      <p className="flex justify-between text-base font-normal text-slate-600 leading-relaxed"><span>Jambs Added:</span> <span>+ {plasterCalc.jambAddition.toFixed(2)} {uArea}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA BOQ Banner */}
            <div className="mt-6 p-5 rounded-[20px] bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md text-slate-900">
              <h4 className="flex items-center gap-2 mb-2 text-lg font-medium text-slate-800 mb-4">
                📄 Turn this calculation into a full BOQ
              </h4>
              <p className="text-indigo-100 mb-4 text-base font-normal text-slate-600 leading-relaxed">
                Your area is ready. Generate material quantities and cost summary in 3 clicks.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="w-full flex-1 px-4 py-2 bg-white text-indigo-600 hover:bg-slate-50 rounded-full transition duration-200 shadow-sm truncate text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden">
                  Generate BOQ Now →
                </button>
                <button className="px-4 py-2 bg-indigo-600 border border-indigo-400 hover:bg-indigo-700 text-white rounded-full transition duration-200 flex items-center justify-center text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                  Save Result
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {activeTab === "plaster" && plasterCalc.steps.length > 0 && (
        <div className="mt-8">
            <h3 className="mb-4 text-lg font-medium text-slate-800">IS 1200 Deduction Proof</h3>
            <DetailedCalculationDisplay steps={plasterCalc.steps as any} />
        </div>
      )}

      {/* SEO SECTIONS */}
      <div className="mt-16 space-y-12">
        <section className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] shadow-sm overflow-hidden">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 tracking-tight">How to Use the Plot Area Calculator</h2>
          <div className="text-slate-600 space-y-4">
            <p>1. <strong>Select your module:</strong> Choose between Triangulation, RERA Property Area, or Roof Pitch.</p>
            <p>2. <strong>Input dimensions:</strong> Enter values in your preferred unit system (Metric or Imperial) which can be set in the global settings.</p>
            <p>3. <strong>For Irregular Plots:</strong> Input all 4 edges and 1 diagonal length. The calculator uses geometric triangulation automatically.</p>
            <p>4. <strong>Review results:</strong> Instantly check Net Area, Built-Up calculations, and Deductions dynamically generated on the side panel.</p>
          </div>
        </section>

        <section className="w-full bg-white/80 backdrop-blur-xl border border-white/20 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] shadow-sm overflow-hidden">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 tracking-tight">Methodology & Engineering Standards</h2>
          <div className="text-slate-600 space-y-4">
            <p>Our <strong>Plot Area Calculator</strong> strictly adheres to the following industry guidelines:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>IS 1200 (Part 1, 4, 12):</strong> Rules for deduction of openings in plastering and masonry work. For plastering, no deductions are made for openings under 0.5 sq.m.</li>
              <li><strong>IS 3861:</strong> Method of measurement for plinth, carpet, and rentable areas of buildings.</li>
              <li><strong>RERA / NBC:</strong> Standard matrix computation for deriving Carpet, Built-Up, and Super Built-Up areas based on proportional allocations of common spaces.</li>
              <li><strong>Geometric Surveying:</strong> Triangulation calculation based on Heron’s principle ensures 100% mathematical validity for non-orthogonal property boundaries.</li>
            </ul>
          </div>
        </section>
        <section className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-medium text-slate-800 mb-4">Expert Reviewed</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Reviewed by:</strong> Civil Estimation Pro Engineering Team</p>
                <p><strong>Qualifications:</strong> B.Tech Civil Engineering · 8 years in QS practice</p>
                <p><strong>Last reviewed:</strong> June 2025</p>
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
