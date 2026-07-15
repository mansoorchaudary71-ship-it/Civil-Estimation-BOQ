import React, { useState } from "react";
import { Calculator, Square } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import { CalculationHistory } from "../ui/CalculationHistory";

export default function CountertopModule() {
  const { settings } = useSettings();
  const isMetric = settings.measurement === "SI";

  const [shape, setShape] = useState<"L-Shape" | "U-Shape" | "Straight">("Straight");
  const [lengthA, setLengthA] = useState<string>("3");
  const [lengthB, setLengthB] = useState<string>("2");
  const [lengthC, setLengthC] = useState<string>("2");
  const [depth, setDepth] = useState<string>("0.6");
  
  const [hasSink, setHasSink] = useState(true);
  const [sinkLength, setSinkLength] = useState<string>("0.6");
  const [sinkWidth, setSinkWidth] = useState<string>("0.45");

  const [hasHob, setHasHob] = useState(true);
  const [hobLength, setHobLength] = useState<string>("0.6");
  const [hobWidth, setHobWidth] = useState<string>("0.5");

  const [skirtingHeight, setSkirtingHeight] = useState<string>("0.1");
  const [slabThickness, setSlabThickness] = useState<string>("0.02");

  const parse = (v: string) => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
  const lA = parse(lengthA);
  const lB = parse(lengthB);
  const lC = parse(lengthC);
  const d = parse(depth);
  const sL = parse(sinkLength);
  const sW = parse(sinkWidth);
  const hL = parse(hobLength);
  const hW = parse(hobWidth);
  const skH = parse(skirtingHeight);
  const sT = parse(slabThickness);

  let grossArea = 0;
  let skirtingLength = 0;
  let frontEdgePolish = 0;

  if (shape === "Straight") {
    grossArea = lA * d;
    skirtingLength = lA + (d * 2);
    frontEdgePolish = lA + (d * 2);
  } else if (shape === "L-Shape") {
    grossArea = (lA * d) + ((lB - d) * d);
    skirtingLength = lA + lB + d;
    frontEdgePolish = lA + lB;
  } else if (shape === "U-Shape") {
    grossArea = (lA * d) + ((lB - d) * d) + ((lC - d) * d);
    skirtingLength = lA + lB + lC;
    frontEdgePolish = lA + lB + lC;
  }

  let deductions = 0;
  if (hasSink) deductions += (sL * sW);
  if (hasHob) deductions += (hL * hW);

  const netArea = Math.max(0, grossArea - deductions);
  const skirtingArea = skirtingLength * skH;
  const totalMaterialArea = grossArea + skirtingArea; // we usually buy stock for gross before cutout, plus skirting

  const uL = isMetric ? "m" : "ft";
  const uA = isMetric ? "m²" : "sq.ft";

  return (
    <div className="bg-bg-card border border-slate-200 dark:border-slate-700 rounded-[24px] p-4 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Square className="w-6 h-6 text-indigo-600" />
        <h2 className="text-slate-900 dark:text-white text-xl font-semibold text-slate-900 tracking-tight mb-4">Countertop (Platform) Estimator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="uppercase mb-2 block text-sm font-medium text-slate-700 mb-1">Layout Shape</label>
            <div className="flex gap-2">
              {(["Straight", "L-Shape", "U-Shape"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`px-4 py-2 rounded-[24px] text-base font-medium transition-all border ${shape === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600  hover:bg-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <div>
              <label className="uppercase block mb-1 text-sm font-medium text-slate-700">
                Main Length ({uL})
              </label>
              <><label htmlFor="a11y-input-199" className="sr-only">Input</label>
<input id="a11y-input-199"
                type="number" inputMode="decimal"
                value={lengthA}
                onChange={(e) => setLengthA(e.target.value)}
                className="w-full bg-white border border-slate-200 dark:border-slate-700 p-3 rounded-full font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none"
              /></>
            </div>
            {(shape === "L-Shape" || shape === "U-Shape") && (
              <div>
                <label className="uppercase block mb-1 text-sm font-medium text-slate-700">
                  Side Length B ({uL})
                </label>
                <><label htmlFor="a11y-input-200" className="sr-only">Input</label>
<input id="a11y-input-200"
                  type="number" inputMode="decimal"
                  value={lengthB}
                  onChange={(e) => setLengthB(e.target.value)}
                  className="w-full bg-white border border-slate-200 dark:border-slate-700 p-3 rounded-full font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none"
                /></>
              </div>
            )}
            {shape === "U-Shape" && (
              <div>
                <label className="uppercase block mb-1 text-sm font-medium text-slate-700">
                  Side Length C ({uL})
                </label>
                <><label htmlFor="a11y-input-201" className="sr-only">Input</label>
<input id="a11y-input-201"
                  type="number" inputMode="decimal"
                  value={lengthC}
                  onChange={(e) => setLengthC(e.target.value)}
                  className="w-full bg-white border border-slate-200 dark:border-slate-700 p-3 rounded-full font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none"
                /></>
              </div>
            )}
            <div>
              <label className="uppercase block mb-1 text-sm font-medium text-slate-700">
                Platform Depth ({uL})
              </label>
              <><label htmlFor="a11y-input-202" className="sr-only">Input</label>
<input id="a11y-input-202"
                type="number" inputMode="decimal"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full bg-white border border-slate-200 dark:border-slate-700 p-3 rounded-full font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none"
              /></>
            </div>
            <div>
              <label className="uppercase block mb-1 text-sm font-medium text-slate-700">
                Skirting Height ({uL})
              </label>
              <><label htmlFor="a11y-input-203" className="sr-only">Input</label>
<input id="a11y-input-203"
                type="number" inputMode="decimal"
                value={skirtingHeight}
                onChange={(e) => setSkirtingHeight(e.target.value)}
                className="w-full bg-white border border-slate-200 dark:border-slate-700 p-3 rounded-full font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none"
              /></>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-slate-900 dark:text-white text-lg font-medium text-slate-800 mb-4">Cutout Deductions</h4>
            <div className="flex items-center justify-between gap-3 w-full relative z-10">
              <input type="checkbox" id="hasSink" checked={hasSink} onChange={e => setHasSink(e.target.checked)} className="rounded text-indigo-600 w-4 h-4" />
              <label htmlFor="hasSink" className="text-sm font-medium text-slate-700 mb-1 block">Include Sink Cutout</label>
            </div>
            {hasSink && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase block mb-1 text-sm font-medium text-slate-700">Length ({uL})</label>
                  <><label htmlFor="a11y-input-204" className="sr-only">Input</label>
<input id="a11y-input-204" type="number" inputMode="decimal" value={sinkLength} onChange={e => setSinkLength(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-full text-sm" /></>
                </div>
                <div>
                  <label className="uppercase block mb-1 text-sm font-medium text-slate-700">Width ({uL})</label>
                  <><label htmlFor="a11y-input-205" className="sr-only">Input</label>
<input id="a11y-input-205" type="number" inputMode="decimal" value={sinkWidth} onChange={e => setSinkWidth(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-full text-sm" /></>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2 mt-4">
              <input type="checkbox" id="hasHob" checked={hasHob} onChange={e => setHasHob(e.target.checked)} className="rounded text-indigo-600 w-4 h-4" />
              <label htmlFor="hasHob" className="text-sm font-medium text-slate-700 mb-1 block">Include Stove/Hob Cutout</label>
            </div>
            {hasHob && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase block mb-1 text-sm font-medium text-slate-700">Length ({uL})</label>
                  <><label htmlFor="a11y-input-206" className="sr-only">Input</label>
<input id="a11y-input-206" type="number" inputMode="decimal" value={hobLength} onChange={e => setHobLength(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-full text-sm" /></>
                </div>
                <div>
                  <label className="uppercase block mb-1 text-sm font-medium text-slate-700">Width ({uL})</label>
                  <><label htmlFor="a11y-input-207" className="sr-only">Input</label>
<input id="a11y-input-207" type="number" inputMode="decimal" value={hobWidth} onChange={e => setHobWidth(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-full text-sm" /></>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <MaterialSummary
            title="Quantity Summary"
            totalLabel="Total Material Required (Slab/Granite)"
            totalValue={totalMaterialArea.toFixed(2)}
            totalUnit={uA}
            subtitle="Platform gross area + Skirting area"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <ResultCard
                title="Net Usable Area"
                value={netArea.toFixed(2)}
                unit={uA}
                variant="neutral"
                description="Gross minus deductions"
              />
              <ResultCard
                title="Edge Polishing"
                value={frontEdgePolish.toFixed(2)}
                unit={uL}
                variant="neutral"
                description="Front edges"
              />
            </div>
          </MaterialSummary>
        </div>
      </div>
      <CalculationHistory
        calculatorId="countertop_module_v1"
        currentInputs={{ shape, lengthA, lengthB, lengthC, depth, skirtingHeight, hasSink, sinkLength, sinkWidth, hasHob, hobLength, hobWidth }}
        currentResults={{ totalMaterialArea, netArea, frontEdgePolish }}
        summaryGeneration={(ins, res) => `Countertop: ${ins.shape} - ${res.totalMaterialArea.toFixed(2)} ${uA}`}
        onRestore={(ins) => {
          if (ins.shape) setShape(ins.shape);
          if (ins.lengthA) setLengthA(ins.lengthA);
          if (ins.lengthB) setLengthB(ins.lengthB);
          if (ins.lengthC) setLengthC(ins.lengthC);
          if (ins.depth) setDepth(ins.depth);
          if (ins.skirtingHeight) setSkirtingHeight(ins.skirtingHeight);
          if (ins.hasSink !== undefined) setHasSink(ins.hasSink);
          if (ins.sinkLength) setSinkLength(ins.sinkLength);
          if (ins.sinkWidth) setSinkWidth(ins.sinkWidth);
          if (ins.hasHob !== undefined) setHasHob(ins.hasHob);
          if (ins.hobLength) setHobLength(ins.hobLength);
          if (ins.hobWidth) setHobWidth(ins.hobWidth);
        }}
      />
    </div>
  );
}
