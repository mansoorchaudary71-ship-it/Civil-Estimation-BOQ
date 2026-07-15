import React, { useState, useRef } from "react";
import { Printer, Plus, Trash2, LayoutList, GripHorizontal, FileSpreadsheet } from "lucide-react";
import { SEO } from "../SEO";
import { CalculationHistory } from "../ui/CalculationHistory";

type ShapeType = "straight" | "u-hook" | "cranked" | "rect-stirrup" | "l-hook" | "u-stirrup" | "spiral";

interface BBSRow {
  id: string;
  member: string;
  shape: ShapeType;
  dia: number;
  noOfBars: number;
  cover: number;
  inputs: Record<string, number>;
  cutLengthM: number;
  totalLengthM: number;
  totalWeightKg: number;
}

export default function BarBendingSchedule() {
  const [rows, setRows] = useState<BBSRow[]>([
    {
      id: "demo-example",
      member: "Beam B1 (Demo)",
      shape: "rect-stirrup",
      dia: 8,
      noOfBars: 1,
      cover: 40,
      inputs: { W: 300, D: 450, A: 220, B: 370 },
      cutLengthM: 1.244,
      totalLengthM: 1.244,
      totalWeightKg: 0.49
    }
  ]);

  // Input states
  const [member, setMember] = useState("");
  const [shape, setShape] = useState<ShapeType>("rect-stirrup");
  const [dia, setDia] = useState<string>("8");
  const [noOfBars, setNoOfBars] = useState<string>("1");
  const [cover, setCover] = useState<string>("40");

  // Shape specific states
  const [span, setSpan] = useState<string>("3000"); // for straight, u-hook, cranked
  const [width, setWidth] = useState<string>("300"); // for stirrup
  const [depth, setDepth] = useState<string>("450"); // for stirrup
  const [slabThick, setSlabThick] = useState<string>("150"); // for cranked
  const [cranks, setCranks] = useState<string>("2"); // for cranked

  const [spiralDia, setSpiralDia] = useState<string>("300"); // for spiral
  const [spiralPitch, setSpiralPitch] = useState<string>("150"); // for spiral
  const [spiralHeight, setSpiralHeight] = useState<string>("3000"); // for spiral

  const printRef = useRef<HTMLDivElement>(null);

  const calculateBBS = () => {
    const d = parseFloat(dia) || 0;
    const n = parseInt(noOfBars) || 0;
    const c = parseFloat(cover) || 0;

    let cutLengthMm = 0;
    const inputsUsed: Record<string, number> = {};

    // Exact rules: hook = 10d, 45 deg = 1d, 90 deg = 2d, 135 deg = 3d deduction
    const hookLength = 10 * d;
    const bend90 = 2 * d;
    const bend45 = 1 * d;
    const bend135 = 3 * d;

    if (shape === "rect-stirrup") {
      const W = parseFloat(width) || 0;
      const D = parseFloat(depth) || 0;
      const A = W - 2 * c;
      const B = D - 2 * c;
      // Perimeter + 2 hooks - 3*90deg bends - 2*135deg bends
      cutLengthMm = 2 * (A + B) + (2 * hookLength) - (3 * bend90 + 2 * bend135);
      inputsUsed.W = W;
      inputsUsed.D = D;
      inputsUsed.A = A;
      inputsUsed.B = B;
    } else if (shape === "u-stirrup") {
      const W = parseFloat(width) || 0;
      const D = parseFloat(depth) || 0;
      const A = W - 2 * c;
      const B = D - 2 * c;
      // 1 horizontal, 2 vertical + 2 hooks - 2*90deg bends
      cutLengthMm = A + 2 * B + (2 * hookLength) - (2 * bend90);
      inputsUsed.W = W;
      inputsUsed.D = D;
      inputsUsed.A = A;
      inputsUsed.B = B;
    } else if (shape === "straight") {
      const S = parseFloat(span) || 0;
      cutLengthMm = S;
      inputsUsed.Span = S;
    } else if (shape === "u-hook") {
      const S = parseFloat(span) || 0;
      // 2 U-hooks. A U-hook is a 180 bend. Wait, standard hook addition is 10d.
      // 180 bend deduction is 4d.
      const bend180 = 4 * d;
      cutLengthMm = S + (2 * hookLength) - (2 * bend180);
      inputsUsed.Span = S;
    } else if (shape === "l-hook") {
      const S = parseFloat(span) || 0;
      // L-bar with 2 hooks (90 deg). Addition 10d, minus 90 deg bend.
      cutLengthMm = S + (2 * hookLength) - (2 * bend90);
      inputsUsed.Span = S;
    } else if (shape === "cranked") {
      const S = parseFloat(span) || 0;
      const T = parseFloat(slabThick) || 0;
      const C = parseInt(cranks) || 1;
      const h = T - 2 * c - d;
      // Crank adds 0.42h. Each crank introduces two 45deg bends.
      const crankAdd = 0.42 * h;
      const crankBendDeduct = 2 * bend45; // 45 deg up, 45 deg level
      // Assuming hooks at both ends
      cutLengthMm = S + C * (crankAdd - crankBendDeduct) + (2 * hookLength) - (2 * bend90); // 90 deg bends at ends for hooks
      inputsUsed.Span = S;
      inputsUsed.Thick = T;
      inputsUsed.Cranks = C;
    } else if (shape === "spiral") {
      const sDia = parseFloat(spiralDia) || 0;
      const p = parseFloat(spiralPitch) || 0;
      const H = parseFloat(spiralHeight) || 0;
      
      const coreD = sDia - 2 * c - d;
      const nTurns = Math.floor(H / p) + 1;
      const turnLength = Math.sqrt(Math.pow(Math.PI * coreD, 2) + Math.pow(p, 2));
      
      cutLengthMm = nTurns * turnLength + (2 * hookLength); // No discrete bends
      inputsUsed.ColDia = sDia;
      inputsUsed.Pitch = p;
      inputsUsed.Height = H;
    }

    const cutLengthM = cutLengthMm / 1000;
    const totalLengthM = cutLengthM * n;
    // W = d^2 / 162.28
    const unitWt = (d * d) / 162.28;
    const totalWeightKg = totalLengthM * unitWt;

    const newRow: BBSRow = {
      id: Math.random().toString(36).substr(2, 9),
      member: member || `Item ${rows.length + 1}`,
      shape,
      dia: d,
      noOfBars: n,
      cover: c,
      inputs: inputsUsed,
      cutLengthM,
      totalLengthM,
      totalWeightKg,
    };

    // Sort output by bar diameter for standard scrap minimization
    const updatedRows = [...rows, newRow].sort((a, b) => a.dia - b.dia);
    setRows(updatedRows);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };
  
  const handlePrint = () => {
    window.dispatchEvent(new CustomEvent('global-print-action'));
  };

  const loadExample = () => {
    setMember("B1 — Main Beam");
    setShape("rect-stirrup");
    setDia("8");
    setNoOfBars("25");
    setCover("40");
    setWidth("300");
    setDepth("450");
  };

  const resetDefault = () => {
    if (!window.confirm("Are you sure you want to reset all inputs? This action cannot be undone.")) return;
    setMember("");
    setShape("rect-stirrup");
    setDia("8");
    setNoOfBars("1");
    setCover("40");
    setWidth("300");
    setDepth("450");
  };

  const totalProjectWeight = rows.reduce((sum, r) => sum + r.totalWeightKg, 0);

  const sendToBOQ = () => {
    if (rows.length === 0) return;
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement (BBS Total - ${rows.length} items)`,
        unit: "kg",
        quantity: totalProjectWeight,
        rate: 0
      }
    ];
    window.dispatchEvent(new CustomEvent('fill-boq', { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  return (
    <div className="w-full h-full bg-transparent text-slate-900 font-sans p-6 md:p-8">
      <SEO 
        title="Bar Bending Schedule Generator | Civil Estimation Pro" 
        description="Generate precise Bar Bending Schedules (BBS) for reinforcement detailing with exact concrete cover and hook deductions."
      />
      <div className="w-full md:max-w-6xl md:mx-auto space-y-6 px-4 md:px-0">
        
        {/* Header - Hidden in Print */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-4 sm:p-6 rounded-[2rem] shadow-sm border border-slate-200 print:hidden overflow-hidden">
          <div>
            
          </div>
          <div className="mt-6 flex flex-wrap gap-2 items-center">
             <button onClick={sendToBOQ}
               disabled={rows.length === 0}
               className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors disabled:opacity-50 border border-emerald-200 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
             >
               Send to BOQ
             </button>
             <button onClick={loadExample} className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
               Load Example
             </button>
             <button onClick={resetDefault} className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
               Reset
             </button>
             <button onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all text-base font-semibold active:scale-95 hover:-translate-y-0.5"
             >
                <Printer className="w-4 h-4" />
                Print Schedule
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
          
          {/* Input Form */}
          <section className="lg:col-span-4 space-y-6">
            <div className="w-full bg-white px-6 py-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
               <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                 <Plus className="w-5 h-5 text-blue-500" /> Add Bar
               </h2>
               
               <div className="space-y-4">
                 <div>
                   <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Member Name / Mark</label>
                   <><label htmlFor="a11y-input-102" className="sr-only">e.g. B1, C2, Main Bar</label>
<input id="a11y-input-102" type="text"
                     placeholder="e.g. B1, C2, Main Bar"
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                     value={member}
                     onChange={(e) => setMember(e.target.value)}
                   /></>
                 </div>
                 
                 <div>
                   <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Shape Code</label>
                   <select
                     className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-[24px] px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all text-base font-normal overflow-hidden"
                     value={shape}
                     onChange={(e) => setShape(e.target.value as ShapeType)}
                   >
                     <option value="straight">Straight Bar</option>
                     <option value="l-hook">L-Hook Bar (90°)</option>
                     <option value="u-hook">U-Hook Bar (180°)</option>
                     <option value="cranked">Cranked Slab Bar</option>
                     <option value="rect-stirrup">Rectangular Stirrup</option>
                     <option value="u-stirrup">U-Stirrup</option>
                     <option value="spiral">Spiral Reinforcement</option>
                   </select>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Bar Dia (mm)</label>
                     <select
                       className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-[24px] px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all text-base font-normal overflow-hidden"
                       value={dia}
                       onChange={(e) => setDia(e.target.value)}
                     >
                       <option value="6">6mm</option>
                       <option value="8">8mm</option>
                       <option value="10">10mm</option>
                       <option value="12">12mm</option>
                       <option value="16">16mm</option>
                       <option value="20">20mm</option>
                       <option value="25">25mm</option>
                       <option value="32">32mm</option>
                     </select>
                   </div>
                   <div>
                     <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">No. of Bars</label>
                     <><label htmlFor="a11y-input-103" className="sr-only">Input</label>
<input id="a11y-input-103" type="number" inputMode="decimal"
                       className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                       value={noOfBars}
                       onChange={(e) => setNoOfBars(e.target.value)}
                     /></>
                   </div>
                 </div>
                 
                 <div>
                   <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Cover (mm)</label>
                   <><label htmlFor="a11y-input-104" className="sr-only">Input</label>
<input id="a11y-input-104" type="number" inputMode="decimal"
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                     value={cover}
                     onChange={(e) => setCover(e.target.value)}
                   /></>
                 </div>
                 
                 {/* Conditional Inputs */}
                 {(shape === "rect-stirrup" || shape === "u-stirrup") && (
                   <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-[24px] border border-blue-100 overflow-hidden">
                     <div>
                       <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Sect Width (mm)</label>
                       <><label htmlFor="a11y-input-105" className="sr-only">Input</label>
<input id="a11y-input-105" type="number" inputMode="decimal"
                         className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                         value={width}
                         onChange={(e) => setWidth(e.target.value)}
                       /></>
                     </div>
                     <div>
                       <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Sect Depth (mm)</label>
                       <><label htmlFor="a11y-input-106" className="sr-only">Input</label>
<input id="a11y-input-106" type="number" inputMode="decimal"
                         className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                         value={depth}
                         onChange={(e) => setDepth(e.target.value)}
                       /></>
                     </div>
                   </div>
                 )}

                 {shape === "spiral" && (
                   <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-[24px] border border-blue-100 overflow-hidden">
                     <div className="col-span-2">
                       <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Col Dia (mm)</label>
                       <><label htmlFor="a11y-input-107" className="sr-only">Input</label>
<input id="a11y-input-107" type="number" inputMode="decimal"
                         className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                         value={spiralDia}
                         onChange={(e) => setSpiralDia(e.target.value)}
                       /></>
                     </div>
                     <div>
                       <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Pitch (mm)</label>
                       <><label htmlFor="a11y-input-108" className="sr-only">Input</label>
<input id="a11y-input-108" type="number" inputMode="decimal"
                         className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                         value={spiralPitch}
                         onChange={(e) => setSpiralPitch(e.target.value)}
                       /></>
                     </div>
                     <div>
                       <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Height (mm)</label>
                       <><label htmlFor="a11y-input-109" className="sr-only">Input</label>
<input id="a11y-input-109" type="number" inputMode="decimal"
                         className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                         value={spiralHeight}
                         onChange={(e) => setSpiralHeight(e.target.value)}
                       /></>
                     </div>
                   </div>
                 )}
                 
                 {(shape === "straight" || shape === "u-hook" || shape === "l-hook" || shape === "cranked") && (
                   <div className="space-y-4 p-4 bg-blue-50 rounded-[24px] border border-blue-100 overflow-hidden">
                     <div>
                       <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Length/Span (mm)</label>
                       <><label htmlFor="a11y-input-110" className="sr-only">Input</label>
<input id="a11y-input-110" type="number" inputMode="decimal"
                         className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                         value={span}
                         onChange={(e) => setSpan(e.target.value)}
                       /></>
                     </div>
                     {shape === "cranked" && (
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Slab Thk (mm)</label>
                           <><label htmlFor="a11y-input-111" className="sr-only">Input</label>
<input id="a11y-input-111" type="number" inputMode="decimal"
                             className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                             value={slabThick}
                             onChange={(e) => setSlabThick(e.target.value)}
                           /></>
                         </div>
                         <div>
                           <label className="block text-blue-800 uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">No. Cranks</label>
                           <><label htmlFor="a11y-input-112" className="sr-only">Input</label>
<input id="a11y-input-112" type="number" inputMode="decimal"
                             className="w-full bg-white dark:bg-slate-800 border border-blue-200 text-slate-800 rounded-full px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 outline-none transition-all min-h-[44px] text-base font-normal"
                             value={cranks}
                             onChange={(e) => setCranks(e.target.value)}
                           /></>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
                 
                 <button onClick={calculateBBS}
                   className="w-full py-3.5 bg-white hover:bg-indigo-600 text-white rounded-full transition-all shadow-md mt-4 text-base font-semibold active:scale-95 hover:-translate-y-0.5 overflow-hidden"
                 >
                   Calculate & Add
                 </button>
               </div>
            </div>
          </section>

          {/* Schedule Summary (Screen only, mirrored below for print) */}
          <section className="lg:col-span-8 space-y-6">
             <div className="w-full bg-white px-6 py-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 min-h-[500px] overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                     <LayoutList className="w-5 h-5 text-blue-500" /> Current Schedule
                   </h2>
                   <div className="bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full font-bold text-sm">
                      Total: {totalProjectWeight.toFixed(2)} Kg
                   </div>
                </div>
                
                {rows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-600">
                    <GripHorizontal className="w-12 h-12 mb-4 opacity-50" />
                    <p>No bars added yet. Add a bar from the panel.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[24px] border border-slate-200">
                     <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-sm">
                         <tr>
                           <th className="px-4 py-3 border-b">Member</th>
                           <th className="px-4 py-3 border-b">Shape</th>
                           <th className="px-4 py-3 border-b">Dia</th>
                           <th className="px-4 py-3 border-b text-center">Nos.</th>
                           <th className="px-4 py-3 border-b text-right">Cut L. (m)</th>
                           <th className="px-4 py-3 border-b text-right">Tot. L (m)</th>
                           <th className="px-4 py-3 border-b text-right">Wgt (kg)</th>
                           <th className="px-4 py-3 border-b text-center">Act</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {rows.map((r, i) => (
                           <tr key={r.id} className="hover:bg-slate-50/50">
                             <td className="px-4 py-3 font-semibold text-slate-800">{r.member}</td>
                             <td className="px-4 py-3 text-slate-600">
                                <div className="capitalize">{r.shape.replace('-', ' ')}</div>
                                <div className="text-sm text-slate-600">
                                   {(r.shape === 'rect-stirrup' || r.shape === 'u-stirrup') && `A:${r.inputs.A} B:${r.inputs.B}`}
                                   {r.shape === 'cranked' && `S:${r.inputs.Span} T:${r.inputs.Thick}`}
                                   {r.shape === 'spiral' && `D:${r.inputs.ColDia} P:${r.inputs.Pitch} H:${r.inputs.Height}`}
                                </div>
                             </td>
                             <td className="px-4 py-3 font-medium">Ø{r.dia}</td>
                             <td className="px-4 py-3 text-center font-bold text-slate-700">{r.noOfBars}</td>
                             <td className="px-4 py-3 text-right font-medium">{r.cutLengthM.toFixed(3)}</td>
                             <td className="px-4 py-3 text-right">{r.totalLengthM.toFixed(2)}</td>
                             <td className="px-4 py-3 text-right font-bold text-blue-700">{r.totalWeightKg.toFixed(2)}</td>
                             <td className="px-4 py-3 text-center">
                               <button aria-label="Delete" onClick={() => removeRow(r.id)} className="text-red-400 hover:text-red-600 p-1 rounded-full">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                  </div>
                )}
             </div>
          </section>
        </div>
      </div>
      
      {/* Print-Only Layout */}
      <div className="hidden print:block p-4 sm:p-8 md:p-8 bg-white text-slate-900" ref={printRef}>
         
         
         <table className="w-full text-sm text-left border-collapse border border-slate-300">
           <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-sm">
             <tr>
               <th className="px-3 py-2 border border-slate-300">SN.</th>
               <th className="px-3 py-2 border border-slate-300">Member Description</th>
               <th className="px-3 py-2 border border-slate-300">Shape / Schematic</th>
               <th className="px-3 py-2 border border-slate-300">Bar Dia (Ø)</th>
               <th className="px-3 py-2 border border-slate-300 text-center">No. of Bars</th>
               <th className="px-3 py-2 border border-slate-300 text-right">Cut Length (m)</th>
               <th className="px-3 py-2 border border-slate-300 text-right">Total Length (m)</th>
               <th className="px-3 py-2 border border-slate-300 text-right">Total Weight (kg)</th>
             </tr>
           </thead>
           <tbody>
             {rows.map((r, i) => (
               <tr key={r.id}>
                 <td className="px-3 py-2 border border-slate-300 text-center">{i + 1}</td>
                 <td className="px-3 py-2 border border-slate-300 font-semibold">{r.member}</td>
                 <td className="px-3 py-2 border border-slate-300">
                    <div className="capitalize font-medium">{r.shape.replace('-', ' ')}</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                       {(r.shape === 'rect-stirrup' || r.shape === 'u-stirrup') && `Inner Dim: A=${r.inputs.A}mm, B=${r.inputs.B}mm`}
                       {r.shape === 'cranked' && `Span=${r.inputs.Span}mm, Slab=${r.inputs.Thick}mm`}
                       {(r.shape === 'u-hook' || r.shape === 'l-hook') && `Clear Span=${r.inputs.Span}mm`}
                       {r.shape === 'straight' && `Length=${r.inputs.Span}mm`}
                       {r.shape === 'spiral' && `Col Dia=${r.inputs.ColDia}mm, Pitch=${r.inputs.Pitch}mm, Height=${r.inputs.Height}mm`}
                    </div>
                 </td>
                 <td className="px-3 py-2 border border-slate-300 text-center font-medium">Ø{r.dia}</td>
                 <td className="px-3 py-2 border border-slate-300 text-center">{r.noOfBars}</td>
                 <td className="px-3 py-2 border border-slate-300 text-right">{r.cutLengthM.toFixed(3)}</td>
                 <td className="px-3 py-2 border border-slate-300 text-right">{r.totalLengthM.toFixed(2)}</td>
                 <td className="px-3 py-2 border border-slate-300 text-right font-bold">{r.totalWeightKg.toFixed(2)}</td>
               </tr>
             ))}
             <tr className="bg-slate-50">
               <td colSpan={7} className="px-3 py-3 border border-slate-300 text-right font-bold uppercase">Grand Total Weight</td>
               <td className="px-3 py-3 border border-slate-300 text-right font-semibold tabular-nums tracking-tight text-lg">{totalProjectWeight.toFixed(2)} kg</td>
             </tr>
           </tbody>
         </table>
      </div>
      
      <CalculationHistory
        calculatorId="bbs_generator_v1"
        estimationName="Bar Bending Schedule"
        savePayload={{ rows, totalProjectWeight }}
        currentInputs={{}}
        onRestore={(savedInputs) => {
          if (savedInputs.rows) setRows(savedInputs.rows);
        }}
      />
    </div>
  );
}
