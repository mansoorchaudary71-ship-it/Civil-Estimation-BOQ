import React, { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { NumberInput } from "../ui/NumberInput";

interface RccElement {
  id: string;
  type: "slab" | "column" | "beam" | "staircase";
  name: string;
  count: number;
  
  // Dimensions
  l: string; // m or mm
  w: string; // m or mm
  h: string; // m or mm

  // Staircase specific
  steps: string;
  tread: string; // mm
  riser: string; // mm
  waistThickness: string; // mm

  // Steel
  steelMode: "thumb" | "exact";
  thumbPercentage: string;
  mainDia: string;
  mainSpacing: string;
  longLength: string; // m
}

export default function MasterRccCore() {
  const [elements, setElements] = useState<RccElement[]>([]);
  const [results, setResults] = useState<{
    concreteVol: number;
    shutteringArea: number;
    steelWeight: number;
    elementsOutputs: any[];
  } | null>(null);

  const addElement = (type: RccElement['type']) => {
    let thumb = "1";
    if (type === "column") thumb = "2";
    if (type === "beam") thumb = "1.5";
    
    setElements([...elements, {
      id: Math.random().toString(36).substring(7),
      type,
      name: `New ${type}`,
      count: 1,
      l: type === 'column' ? "300" : "4",
      w: type === 'column' ? "300" : type === 'beam' ? "230" : "3",
      h: type === 'column' ? "3" : type === 'beam' ? "450" : "150",
      steps: type === 'staircase' ? "10" : "",
      tread: type === 'staircase' ? "250" : "",
      riser: type === 'staircase' ? "150" : "",
      waistThickness: type === 'staircase' ? "150" : "",
      steelMode: "thumb",
      thumbPercentage: thumb,
      mainDia: "12",
      mainSpacing: "150",
      longLength: "4",
    }]);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
  };

  const updateElement = (id: string, field: keyof RccElement, value: any) => {
    setElements(elements.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const calculateMaster = () => {
    let totalConcrete = 0;
    let totalShuttering = 0;
    let totalSteel = 0;
    const elementsOutputs = [];

    for (const el of elements) {
      let conc = 0;
      let shut = 0;
      let steel = 0;
      const count = Math.max(1, parseInt(el.count.toString()) || 1);

      if (el.type === "slab") {
        const spanL = parseFloat(el.l) || 0;
        const spanW = parseFloat(el.w) || 0;
        const thick = parseFloat(el.h) || 0;

        conc = spanL * spanW * (thick / 1000) * count;
        shut = spanL * spanW * count; // rough bottom area
      } else if (el.type === "column") {
        const c_l = parseFloat(el.l) || 0; // mm
        const c_w = parseFloat(el.w) || 0; // mm
        const c_h = parseFloat(el.h) || 0; // m

        conc = (c_l / 1000) * (c_w / 1000) * c_h * count;
        shut = 2 * ((c_l / 1000) + (c_w / 1000)) * c_h * count; // perimeter * height
      } else if (el.type === "beam") {
        const b_l = parseFloat(el.l) || 0; // m
        const b_w = parseFloat(el.w) || 0; // mm
        const b_h = parseFloat(el.h) || 0; // mm
        
        conc = b_l * (b_w / 1000) * (b_h / 1000) * count;
        shut = b_l * 2 * (b_h / 1000) + b_l * (b_w / 1000); // 2 sides + bottom
        shut = shut * count;
      } else if (el.type === "staircase") {
        const width = parseFloat(el.w) || 0; // m
        const steps = parseFloat(el.steps) || 0;
        const tread = parseFloat(el.tread) / 1000 || 0; // m
        const riser = parseFloat(el.riser) / 1000 || 0; // m
        const waist = parseFloat(el.waistThickness) / 1000 || 0; // m
        
        const horizSpan = steps * tread;
        const vertHeight = steps * riser;
        const length = Math.sqrt(horizSpan**2 + vertHeight**2);
        
        const slabVol = length * width * waist;
        const stepsVol = steps * (0.5 * tread * riser * width);
        conc = (slabVol + stepsVol) * count;

        const bottomShut = length * width;
        const sideShut = length * waist * 2 + steps * (0.5 * tread * riser * 2);
        const riserShut = steps * riser * width;
        shut = (bottomShut + sideShut + riserShut) * count;
      }

      // Steel Calculation
      if (el.steelMode === "thumb") {
        // Density of steel = 7850 kg/m3. 
        const pct = parseFloat(el.thumbPercentage) || 1;
        steel = conc * (pct / 100) * 7850;
      } else {
        // Exact simplified BBS
        const dia = parseFloat(el.mainDia) || 12;
        const space = parseFloat(el.mainSpacing) || 150;
        const barL = parseFloat(el.longLength) || 4;
        
        // Count bars approx based on width/space
        let widthSpan = parseFloat(el.w) || 1;
        if (el.type === "column" || el.type === "beam") {
          widthSpan = parseFloat(el.l) || 1;
        }

        const noOfBars = Math.ceil((widthSpan * 1000) / space) + 1;
        const totalLen = noOfBars * barL * count;
        
        // Standard steel density D²/162.2 kg/m
        const unitWt = (dia * dia) / 162.2;
        steel = totalLen * unitWt;
      }

      totalConcrete += conc;
      totalShuttering += shut;
      totalSteel += steel;
      
      elementsOutputs.push({
        name: el.name,
        conc,
        shut,
        steel
      });
    }

    // DRY VOLUME CALCULATION FOR CONCRETE (+54%)
    const dryVolumeFactor = 1.54;
    const finalConcreteWet = totalConcrete;
    const finalConcreteDry = totalConcrete * dryVolumeFactor;

    setResults({
      concreteVol: finalConcreteDry,
      shutteringArea: totalShuttering,
      steelWeight: totalSteel,
      elementsOutputs
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => addElement("slab")} className="text-base font-medium px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 flex items-center gap-1 border border-indigo-100 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Plus className="w-4 h-4"/> Add Slab</button>
        <button onClick={() => addElement("column")} className="text-base font-medium px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 flex items-center gap-1 border border-indigo-100 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Plus className="w-4 h-4"/> Add Column</button>
        <button onClick={() => addElement("beam")} className="text-base font-medium px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 flex items-center gap-1 border border-indigo-100 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Plus className="w-4 h-4"/> Add Beam</button>
        <button onClick={() => addElement("staircase")} className="text-base font-medium px-3 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 flex items-center gap-1 border border-indigo-100 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><Plus className="w-4 h-4"/> Add Staircase</button>
      </div>

      <div className="space-y-4">
        {elements.length === 0 && (
          <div className="p-4 sm:p-8 md:p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-[24px]">
            Add structural elements to begin the master calculation.
          </div>
        )}

        {elements.map((el, i) => (
          <div key={el.id} className="p-4 tool-card">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 capitalize flex items-center gap-2">
                <span className="bg-slate-100 text-slate-500 w-6 h-6 rounded-full flex items-center justify-center text-sm">{i + 1}</span>
                {el.type}
              </h3>
              <button aria-label="Delete" onClick={() => removeElement(el.id)} className="text-rose-500 hover:text-rose-600 p-1 bg-rose-50 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-base font-medium mb-1 block">Description</label>
                <><label htmlFor="a11y-input-331" className="sr-only">Input</label>
<input id="a11y-input-331" value={el.name} onChange={(e) => updateElement(el.id, 'name', e.target.value)} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none" /></>
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="text-base font-medium mb-1 block">Multiplier (Count)</label>
                <NumberInput value={el.count.toString()} onChange={(v) => updateElement(el.id, 'count', v)} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-[12px] text-sm focus:outline-none" />
              </div>

              {el.type === 'slab' && (
                <>
                  <div>
                    <label className="text-base font-medium mb-1 block">Length (m)</label>
                    <NumberInput value={el.l} onChange={(v) => updateElement(el.id, 'l', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Width (m)</label>
                    <NumberInput value={el.w} onChange={(v) => updateElement(el.id, 'w', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Thickness (mm)</label>
                    <NumberInput value={el.h} onChange={(v) => updateElement(el.id, 'h', v)} className="w-full" />
                  </div>
                </>
              )}

              {el.type === 'column' && (
                <>
                  <div>
                    <label className="text-base font-medium mb-1 block">Height (m)</label>
                    <NumberInput value={el.h} onChange={(v) => updateElement(el.id, 'h', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Length (mm)</label>
                    <NumberInput value={el.l} onChange={(v) => updateElement(el.id, 'l', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Width (mm)</label>
                    <NumberInput value={el.w} onChange={(v) => updateElement(el.id, 'w', v)} className="w-full" />
                  </div>
                </>
              )}

              {el.type === 'beam' && (
                <>
                  <div>
                    <label className="text-base font-medium mb-1 block">Clear Span (m)</label>
                    <NumberInput value={el.l} onChange={(v) => updateElement(el.id, 'l', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Width (mm)</label>
                    <NumberInput value={el.w} onChange={(v) => updateElement(el.id, 'w', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Depth (mm)</label>
                    <NumberInput value={el.h} onChange={(v) => updateElement(el.id, 'h', v)} className="w-full" />
                  </div>
                </>
              )}

              {el.type === 'staircase' && (
                <>
                  <div>
                    <label className="text-base font-medium mb-1 block">Flight Width (m)</label>
                    <NumberInput value={el.w} onChange={(v) => updateElement(el.id, 'w', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Number of Steps</label>
                    <NumberInput value={el.steps} onChange={(v) => updateElement(el.id, 'steps', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Tread (mm)</label>
                    <NumberInput value={el.tread} onChange={(v) => updateElement(el.id, 'tread', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Riser (mm)</label>
                    <NumberInput value={el.riser} onChange={(v) => updateElement(el.id, 'riser', v)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Waist Thick (mm)</label>
                    <NumberInput value={el.waistThickness} onChange={(v) => updateElement(el.id, 'waistThickness', v)} className="w-full" />
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-[16px] border border-slate-100">
              <div className="flex gap-4 mb-3 flex-wrap">
                <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                  <><label htmlFor="a11y-input-332" className="sr-only">Input</label>
<input id="a11y-input-332" type="radio" checked={el.steelMode === "thumb"} onChange={() => updateElement(el.id, 'steelMode', 'thumb')} className="w-4 h-4 text-indigo-600" /></>
                  Thumb Rule (Vol %)
                </label>
                <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                  <><label htmlFor="a11y-input-333" className="sr-only">Input</label>
<input id="a11y-input-333" type="radio" checked={el.steelMode === "exact"} onChange={() => updateElement(el.id, 'steelMode', 'exact')} className="w-4 h-4 text-indigo-600" /></>
                  Exact Basic BBS
                </label>
              </div>

              {el.steelMode === "thumb" ? (
                <div>
                  <label className="text-base font-medium mb-1 block">Steel % of Concrete Volume</label>
                  <p className="text-[10px] text-slate-400 mb-2">Typical reinforcement ratios: slabs (1%), columns (2.0-2.5%), beams (1-2%), stairs (1%).</p>
                  <><label htmlFor="a11y-input-334" className="sr-only">Input</label>
<input id="a11y-input-334" value={el.thumbPercentage} onChange={(e) => updateElement(el.id, 'thumbPercentage', e.target.value)} type="number" inputMode="decimal" step="0.1" className="w-32 h-10 px-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none" /></>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-medium mb-1 block">Bar Dia (mm)</label>
                    <><label htmlFor="a11y-input-335" className="sr-only">Input</label>
<input id="a11y-input-335" value={el.mainDia} onChange={(e) => updateElement(el.id, 'mainDia', e.target.value)} type="number" inputMode="decimal" className="w-full h-10 px-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none" /></>
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Spacing / c/c (mm)</label>
                    <><label htmlFor="a11y-input-336" className="sr-only">Input</label>
<input id="a11y-input-336" value={el.mainSpacing} onChange={(e) => updateElement(el.id, 'mainSpacing', e.target.value)} type="number" inputMode="decimal" className="w-full h-10 px-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none" /></>
                  </div>
                  <div>
                    <label className="text-base font-medium mb-1 block">Bar Length (m)</label>
                    <><label htmlFor="a11y-input-337" className="sr-only">Input</label>
<input id="a11y-input-337" value={el.longLength} onChange={(e) => updateElement(el.id, 'longLength', e.target.value)} type="number" inputMode="decimal" className="w-full h-10 px-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none" /></>
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}
        
        {elements.length > 0 && (
          <button onClick={calculateMaster} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-sm transition-colors flex items-center justify-center gap-2 mt-6 active:scale-95 hover:-translate-y-0.5">
            <Calculator className="w-5 h-5" /> Calculate Master Output
          </button>
        )}

        {results && (
          <div className="mt-8">
            <MaterialSummary title="Master Structural Summary" totalLabel="Total Concrete Dry Vol" totalValue={results.concreteVol.toFixed(2)} totalUnit="m³" relatedToolIds={['concrete-mix']}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ResultCard title="Total Steel Weight" value={results.steelWeight.toFixed(2)} unit="kg" variant="primary" />
                 <ResultCard title="Total Shuttering Area" value={results.shutteringArea.toFixed(2)} unit="m²" variant="neutral" />
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-base font-medium mb-4">Element Breakdown</h4>
                <div className="space-y-2">
                  {results.elementsOutputs.map((out, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 border border-slate-100 rounded-[16px]">
                       <span className="font-bold text-slate-700">{out.name}</span>
                       <div className="flex gap-4 text-slate-500 flex-wrap">
                         <span><strong className="text-slate-800">{out.conc.toFixed(2)}</strong> m³ conc</span>
                         <span><strong className="text-slate-800">{out.shut.toFixed(2)}</strong> m² shut</span>
                         <span><strong className="text-slate-800">{out.steel.toFixed(2)}</strong> kg stl</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </MaterialSummary>
          </div>
        )}

      </div>
    </div>
  );
}
