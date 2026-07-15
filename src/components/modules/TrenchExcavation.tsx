import React, { useState } from "react";
import {
  Truck,
  Calculator,
  Ruler,
  Hash,
  Plus,
  Layers,
  ArrowRight,
  Activity,
  ChevronDown,
  Info,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";

import { useSettings } from "../../context/SettingsContext";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { CalculationHistory } from "../ui/CalculationHistory";

const Tooltip = ({ content }: { content: string }) => (
  <div className="relative group inline-flex ml-1.5 align-middle">
    <Info className="w-4 h-4 text-slate-500 dark:text-gray-400 hover:text-teal-500 transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 bg-gray-900 text-slate-900 dark:text-white text-[11px] font-normal rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[5px] border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

export default function TrenchExcavationEstimator() {
  const { settings, formatCurrency, convertAmount, convertAmountToRaw } =
    useSettings();
  const isMetric = settings.measurement === "SI";
  const unitL = isMetric ? "m" : "ft";
  const unitA = isMetric ? "m²" : "ft²";
  const unitV = isMetric ? "m³" : "ft³";
  
  const [length, setLength] = useState<string>("100");
  const [bottomWidth, setBottomWidth] = useState<string>("1");
  const [sideSlope, setSideSlope] = useState<string>("0.5");
  const [depth, setDepth] = useState<string>("1.5");
  const [pipeDiameter, setPipeDiameter] = useState<string>("");
  const [beddingDepth, setBeddingDepth] = useState<string>("");
  
  const [isDimensionsOpen, setIsDimensionsOpen] = useState<boolean>(true);
  const [isBeddingOpen, setIsBeddingOpen] = useState<boolean>(true);

  const L = parseFloat(length) || 0;
  const W_b = parseFloat(bottomWidth) || 0;
  const X = parseFloat(sideSlope) || 0;
  const D = parseFloat(depth) || 0;
  
  // Calculate top width based on side slope
  const W_t = W_b + 2 * X * D;
  const crossSectionArea = ((W_b + W_t) / 2) * D;
  const totalExcavationVolume = crossSectionArea * L;
  const D_pipe = parseFloat(pipeDiameter) || 0;
  const D_bedding = parseFloat(beddingDepth) || 0;
  
  let beddingMaterialVolume = 0;
  if (D_bedding > 0 || D_pipe > 0) {
    const pipeVolume = Math.PI * Math.pow(D_pipe / 2, 2) * L;
    const beddingBoxVolume = W_b * D_bedding * L;
    beddingMaterialVolume = Math.max(0, beddingBoxVolume - pipeVolume);
  }

  return (
    <div className="w-full bg-transparent text-slate-900 font-sans mt-4">
      <div className="space-y-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-800 bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent pb-1">
            Trench Excavation
          </h2>
          <GlobalSettingsToggle align="left" showCurrency={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <button
                onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">
                    Trench Dimensions
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-700 dark:text-gray-300 transition-transform duration-300 ${isDimensionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${isDimensionsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 pt-2 space-y-5 border-t border-gray-50 bg-gray-50/30">
                    <div>
                      <label className="text-base font-medium dark:text-gray-300 uppercase tracking-wider mb-2 ml-1 flex items-center">
                        Trench Length (L) [{unitL}]
                        <Tooltip content="The total linear distance of the trench along its centerline." />
                      </label>
                      <><label htmlFor="a11y-input-523" className="sr-only">Input</label>
<input id="a11y-input-523"
                        type="number" inputMode="decimal"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 focus:border-teal-500 transition-shadow min-h-[44px]"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                      /></>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-base font-medium dark:text-gray-300 uppercase tracking-wider mb-2 ml-1 flex items-center">
                          Bottom Width [{unitL}]
                          <Tooltip content="The width of the trench at its flat base." />
                        </label>
                        <><label htmlFor="a11y-input-524" className="sr-only">Input</label>
<input id="a11y-input-524"
                          type="number" inputMode="decimal"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 focus:border-teal-500 transition-shadow min-h-[44px]"
                          value={bottomWidth}
                          onChange={(e) => setBottomWidth(e.target.value)}
                        /></>
                      </div>
                      <div>
                        <label className="text-base font-medium dark:text-gray-300 uppercase tracking-wider mb-2 ml-1 flex items-center">
                          Side Slope (1V : XH)
                          <Tooltip content="Ratio of horizontal run to 1 unit of vertical drop. For example, 0.5 means a 1:0.5 slope (steep), while 2 means a 1:2 slope (gentle)." />
                        </label>
                        <div className="flex items-center gap-3 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/50 transition-shadow">
                          <span className="text-slate-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">1 V :</span>
                          <><label htmlFor="a11y-input-525" className="sr-only">e.g. 0.5</label>
<input id="a11y-input-525"
                            type="number" inputMode="decimal"
                            step="0.1"
                            className="w-full bg-transparent text-slate-800 focus:outline-none -ml-1 text-sm md:text-base font-semibold min-h-[44px]"
                            value={sideSlope}
                            placeholder="e.g. 0.5"
                            onChange={(e) => setSideSlope(e.target.value)}
                          /></>
                          <span className="text-slate-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">H</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-base font-medium dark:text-gray-300 uppercase tracking-wider mb-2 ml-1 flex items-center">
                        Depth [{unitL}]
                        <Tooltip content="The vertical distance from the ground surface to the bottom of the trench." />
                      </label>
                      <><label htmlFor="a11y-input-526" className="sr-only">Input</label>
<input id="a11y-input-526"
                        type="number" inputMode="decimal"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 focus:border-teal-500 transition-shadow min-h-[44px]"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                      /></>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <button
                onClick={() => setIsBeddingOpen(!isBeddingOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">
                    Pipe & Bedding Details
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-700 dark:text-gray-300 transition-transform duration-300 ${isBeddingOpen ? "rotate-180" : ""}`}
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${isBeddingOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 pt-2 space-y-5 border-t border-gray-50 bg-gray-50/30">
                    <div>
                      <label className="block text-base font-medium dark:text-gray-300 uppercase tracking-wider mb-2 ml-1 flex items-center">
                        Pipe Diameter [{unitL}]
                        <Tooltip content="The outer diameter of the pipe. Used to deduct pipe volume from bedding material." />
                      </label>
                      <><label htmlFor="a11y-input-527" className="sr-only">Input</label>
<input id="a11y-input-527"
                        type="number" inputMode="decimal"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow min-h-[44px]"
                        value={pipeDiameter}
                        onChange={(e) => setPipeDiameter(e.target.value)}
                        placeholder={`e.g. 0.3`}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium dark:text-gray-300 uppercase tracking-wider mb-2 ml-1 flex items-center">
                        Bedding Depth [{unitL}]
                        <Tooltip content="The thickness of bedding material placed below and around the pipe inside the trench." />
                      </label>
                      <><label htmlFor="a11y-input-528" className="sr-only">Input</label>
<input id="a11y-input-528"
                        type="number" inputMode="decimal"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow min-h-[44px]"
                        value={beddingDepth}
                        onChange={(e) => setBeddingDepth(e.target.value)}
                        placeholder={`e.g. 0.5`}
                      /></>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-gray-300 font-medium px-1">
                      Leave empty if bedding calculation is not required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[1.5rem] p-4 sm:p-8 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
              <div className="relative z-10">
                <div className="flex flex-col h-full">
                 <MaterialSummary
                   title="Results"
                   totalLabel={`Total Excavated Volume`}
                   totalValue={totalExcavationVolume.toFixed(2)}
                   totalUnit={unitV || ""}
                 >
                   <div className="grid grid-cols-1 gap-4 mt-6">
                     {(D_bedding > 0 || D_pipe > 0) && (
                       <ResultCard
                         title="Bedding Material Volume"
                         value={beddingMaterialVolume.toFixed(2)}
                         unit={unitV || ""}
                         variant="primary"
                       />
                     )}
                     <ResultCard
                       title="Trapezoidal Area"
                       value={crossSectionArea.toFixed(2)}
                       unit={unitA || ""}
                       variant="neutral"
                     />
                     {D_pipe > 0 && (
                       <ResultCard
                         title="Pipe Volume"
                         value={(Math.PI * Math.pow(D_pipe / 2, 2) * L).toFixed(2)}
                         unit={unitV || ""}
                         variant="neutral"
                       />
                     )}
                   </div>
                  </MaterialSummary>
              </div>
             </div>
            </div>
          </section>
        </div>
      </div>
      <CalculationHistory
        calculatorId="trench_excavation_v1"
        estimationName="Trench Excavation"
        currentInputs={{ length, bottomWidth, sideSlope, depth, pipeDiameter, beddingDepth }}
        currentResults={{ totalExcavationVolume: totalExcavationVolume.toFixed(2), crossSectionArea: crossSectionArea.toFixed(2) }}
        summaryGeneration={(inputs, res) => `Excavated Vol: ${res.totalExcavationVolume} ${unitV}`}
        onRestore={(inputs) => {
          if(inputs.length) setLength(inputs.length);
          if(inputs.bottomWidth) setBottomWidth(inputs.bottomWidth);
          if(inputs.sideSlope) setSideSlope(inputs.sideSlope);
          if(inputs.depth) setDepth(inputs.depth);
          if(inputs.pipeDiameter) setPipeDiameter(inputs.pipeDiameter);
          if(inputs.beddingDepth) setBeddingDepth(inputs.beddingDepth);
        }}
      />
    </div>
  );
}
