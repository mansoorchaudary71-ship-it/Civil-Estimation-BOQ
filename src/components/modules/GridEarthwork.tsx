import React, { useState } from "react";
import {
  Truck,
  Calculator,
  Ruler,
  Hash,
  Plus,
  Layers,
  ArrowRight,
  Grid2X2,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";

import { useSettings } from "../../context/SettingsContext";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { CalculationHistory } from "../ui/CalculationHistory";
export default function GridEarthworkEstimator() {
  const { settings, formatCurrency, convertAmount, convertAmountToRaw } =
    useSettings();
  const isMetric = settings.measurement === "SI";
  const unitL = isMetric ? "m" : "ft";
  const unitA = isMetric ? "m²" : "ft²";
  const unitV = isMetric ? "m³" : "ft³";
  const [gridLength, setGridLength] = useState<string>("10");
  const [gridWidth, setGridWidth] = useState<string>("10");
  const [cornerTL, setCornerTL] = useState({
    existing: "100.5",
    proposed: "100.0",
  });
  const [cornerTR, setCornerTR] = useState({
    existing: "100.8",
    proposed: "100.0",
  });
  const [cornerBL, setCornerBL] = useState({
    existing: "100.2",
    proposed: "100.0",
  });
  const [cornerBR, setCornerBR] = useState({
    existing: "100.4",
    proposed: "100.0",
  });
  const L = parseFloat(gridLength) || 0;
  const W = parseFloat(gridWidth) || 0;
  const area = L * W;
  const tlE = parseFloat(cornerTL.existing) || 0;
  const tlP = parseFloat(cornerTL.proposed) || 0;
  const trE = parseFloat(cornerTR.existing) || 0;
  const trP = parseFloat(cornerTR.proposed) || 0;
  const blE = parseFloat(cornerBL.existing) || 0;
  const blP = parseFloat(cornerBL.proposed) || 0;
  const brE = parseFloat(cornerBR.existing) || 0;
  const brP = parseFloat(cornerBR.proposed) || 0;
  const tlDiff = tlE - tlP;
  const trDiff = trE - trP;
  const blDiff = blE - blP;
  const brDiff = brE - brP;
  const avgExisting = (tlE + trE + blE + brE) / 4;
  const avgProposed = (tlP + trP + blP + brP) / 4;
  const avgDepth = (tlDiff + trDiff + blDiff + brDiff) / 4;
  const totalVolume = Math.abs(avgDepth) * area;
  const isCut = avgDepth > 0;
  const isFill = avgDepth < 0;
  return (
    <div className="w-full bg-transparent text-slate-900 font-sans mt-4">
      <div className="space-y-8">
        <div className="mb-4">
          <h2 className="bg-gradient-to-r bg-clip-text text-transparent pb-1 text-xl font-semibold text-slate-900 tracking-tight mb-4">
            Grid Method Volume
          </h2>
          <GlobalSettingsToggle align="left" showCurrency={false} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="w-full bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                <div className="p-2.5 bg-blue-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <Grid2X2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                  Grid Dimensions
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Length [{unitL}]
                  </label>
                  <><label htmlFor="a11y-input-251" className="sr-only">Input</label>
<input id="a11y-input-251" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 transition-shadow min-h-[44px] text-base font-normal"
                    value={gridLength}
                    onChange={(e) => setGridLength(e.target.value)}
                  /></>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Width [{unitL}]
                  </label>
                  <><label htmlFor="a11y-input-252" className="sr-only">Input</label>
<input id="a11y-input-252" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 transition-shadow min-h-[44px] text-base font-normal"
                    value={gridWidth}
                    onChange={(e) => setGridWidth(e.target.value)}
                  /></>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-[24px] font-medium text-slate-600 flex justify-between overflow-hidden">
                <span>Grid Area:</span>
                <span className="font-bold text-slate-800">
                  {area.toFixed(2)} {unitA}
                </span>
              </div>
            </div>
            <div className="w-full bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                  Corner Elevations
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6 relative">
                {/* Visual Connector Lines */}
                <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-100 -translate-y-1/2" />
                <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-gray-100 -translate-x-1/2" />
                {/* Top Left */}
                <div className="w-full bg-white border-2 border-gray-100 px-4 py-3 rounded-[24px] relative z-10 shadow-sm hover:border-blue-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-slate-800 mb-4">
                    Top Left
                    <span className="text-sm uppercase bg-gray-100 px-2 py-1 rounded-[16px] text-slate-700">
                      Corner 1
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-253" className="sr-only">Input</label>
<input id="a11y-input-253" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTL.existing}
                        onChange={(e) =>
                          setCornerTL({ ...cornerTL, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-254" className="sr-only">Input</label>
<input id="a11y-input-254" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTL.proposed}
                        onChange={(e) =>
                          setCornerTL({ ...cornerTL, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
                {/* Top Right */}
                <div className="w-full bg-white border-2 border-gray-100 px-4 py-3 rounded-[24px] relative z-10 shadow-sm hover:border-blue-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-slate-800 mb-4">
                    Top Right
                    <span className="text-sm uppercase bg-gray-100 px-2 py-1 rounded-[16px] text-slate-700">
                      Corner 2
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-255" className="sr-only">Input</label>
<input id="a11y-input-255" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTR.existing}
                        onChange={(e) =>
                          setCornerTR({ ...cornerTR, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-256" className="sr-only">Input</label>
<input id="a11y-input-256" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTR.proposed}
                        onChange={(e) =>
                          setCornerTR({ ...cornerTR, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
                {/* Bottom Left */}
                <div className="w-full bg-white border-2 border-gray-100 px-4 py-3 rounded-[24px] relative z-10 shadow-sm hover:border-blue-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-slate-800 mb-4">
                    Bottom Left
                    <span className="text-sm uppercase bg-gray-100 px-2 py-1 rounded-[16px] text-slate-700">
                      Corner 3
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-257" className="sr-only">Input</label>
<input id="a11y-input-257" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBL.existing}
                        onChange={(e) =>
                          setCornerBL({ ...cornerBL, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-258" className="sr-only">Input</label>
<input id="a11y-input-258" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBL.proposed}
                        onChange={(e) =>
                          setCornerBL({ ...cornerBL, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
                {/* Bottom Right */}
                <div className="w-full bg-white border-2 border-gray-100 px-4 py-3 rounded-[24px] relative z-10 shadow-sm hover:border-blue-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-slate-800 mb-4">
                    Bottom Right
                    <span className="text-sm uppercase bg-gray-100 px-2 py-1 rounded-[16px] text-slate-700">
                      Corner 4
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-259" className="sr-only">Input</label>
<input id="a11y-input-259" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBR.existing}
                        onChange={(e) =>
                          setCornerBR({ ...cornerBR, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-slate-700">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-260" className="sr-only">Input</label>
<input id="a11y-input-260" type="number" inputMode="decimal"
                        className="w-full bg-gray-50 border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBR.proposed}
                        onChange={(e) =>
                          setCornerBR({ ...cornerBR, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="space-y-6 flex-1 flex flex-col mt-6">
                 <MaterialSummary
                   title="Results (Grid Leveling)"
                   totalLabel={`Total ${isCut ? "Cut" : isFill ? "Fill" : ""} Volume`}
                   totalValue={totalVolume.toFixed(2)}
                   totalUnit={unitV || ""}
                 >
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                     <ResultCard
                       title="Avg Existing Elev."
                       value={avgExisting.toFixed(3)}
                       unit={unitL || ""}
                       variant="neutral"
                     />
                     <ResultCard
                       title="Avg Proposed Elev."
                       value={avgProposed.toFixed(3)}
                       unit={unitL || ""}
                       variant="neutral"
                     />
                     <ResultCard
                       title={isCut ? "Average Cut Depth" : isFill ? "Average Fill Depth" : "Average Depth"}
                       value={Math.abs(avgDepth).toFixed(3)}
                       unit={unitL || ""}
                       variant="neutral"
                     />
                   </div>
                 </MaterialSummary>
          </section>
        </div>
      </div>
      <CalculationHistory
        calculatorId="grid_earthwork_v1"
        estimationName="Grid Earthwork"
        currentInputs={{ gridLength, gridWidth, cornerTL, cornerTR, cornerBL, cornerBR }}
        currentResults={{ totalVolume: totalVolume.toFixed(2), avgDepth: avgDepth.toFixed(3) }}
        summaryGeneration={(inputs, res) => `Volume: ${res.totalVolume} ${unitV}`}
        onRestore={(inputs) => {
          if (inputs.gridLength) setGridLength(inputs.gridLength);
          if (inputs.gridWidth) setGridWidth(inputs.gridWidth);
          if (inputs.cornerTL) setCornerTL(inputs.cornerTL);
          if (inputs.cornerTR) setCornerTR(inputs.cornerTR);
          if (inputs.cornerBL) setCornerBL(inputs.cornerBL);
          if (inputs.cornerBR) setCornerBR(inputs.cornerBR);
        }}
      />
    </div>
  );
}
