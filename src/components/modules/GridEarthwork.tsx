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
import { gridCellVolumes } from "../../lib/gridEarthworkCalc";
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
  // Multi-cell grid (borrow-pit): cut and fill are summed SEPARATELY per cell,
  // so a grid straddling zero no longer cancels cut against fill (old bug).
  const [multiSpacing, setMultiSpacing] = useState<string>("10");
  const [multiExisting, setMultiExisting] = useState<string>("101 101 99 99\n101 101 99 99\n101 101 99 99");
  const [multiProposed, setMultiProposed] = useState<string>("100 100 100 100\n100 100 100 100\n100 100 100 100");
  const parseGrid = (text: string): number[][] | null => {
    const rows = text.trim().split("\n").map((r) => r.trim().split(/\s+/).map(Number));
    if (rows.length < 2 || rows.some((r) => r.length < 2 || r.some((v) => !isFinite(v)))) return null;
    if (rows.some((r) => r.length !== rows[0].length)) return null;
    return rows;
  };
  const multiExistingGrid = parseGrid(multiExisting);
  const multiProposedGrid = parseGrid(multiProposed);
  const multiResult = multiExistingGrid && multiProposedGrid && multiExistingGrid.length === multiProposedGrid.length && multiExistingGrid[0].length === multiProposedGrid[0].length
    ? gridCellVolumes(multiExistingGrid, multiProposedGrid, parseFloat(multiSpacing) || 0)
    : null;
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
  // Cut and fill are summed SEPARATELY per corner (each corner covers a
  // quarter of the cell): the old |mean depth| × area cancelled cut
  // against fill — a +1/+1/−1/−1 m cell showed 0 m³ instead of 50 m³ cut
  // and 50 m³ fill. Same per-corner split the multi-cell engine uses.
  const cornerCutM3 = [tlDiff, trDiff, blDiff, brDiff].reduce((s, d) => s + (d > 0 ? d : 0) * (area / 4), 0);
  const cornerFillM3 = [tlDiff, trDiff, blDiff, brDiff].reduce((s, d) => s + (d < 0 ? -d : 0) * (area / 4), 0);
  const totalVolume = cornerCutM3 + cornerFillM3;
  const isCut = cornerCutM3 > 0 && cornerFillM3 === 0;
  const isFill = cornerFillM3 > 0 && cornerCutM3 === 0;
  return (
    <div className="w-full bg-transparent text-txt-primary font-sans mt-4">
      <div className="space-y-8">
        <div className="mb-4">
          <h2 className="bg-gradient-to-r bg-clip-text text-transparent pb-1 text-xl font-semibold text-txt-primary tracking-tight mb-4">
            Grid Method Volume
          </h2>
          <GlobalSettingsToggle align="left" showCurrency={false} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
          <section className="space-y-6">
            <div className="w-full bg-surface-default px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-color transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-border-color pb-4">
                <div className="p-2.5 bg-accent-50 text-accent-800 rounded-2xl overflow-hidden">
                  <Grid2X2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-txt-primary tracking-tight mb-4">
                  Grid Dimensions
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary mb-1">
                    Length [{unitL}]
                  </label>
                  <><label htmlFor="a11y-input-251" className="sr-only">Input</label>
<input id="a11y-input-251" type="number" inputMode="decimal"
                    className="w-full bg-surface-default/50 border border-border-color text-txt-primary rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 focus:border-accent-800 transition-shadow min-h-[44px] text-base font-normal"
                    value={gridLength}
                    onChange={(e) => setGridLength(e.target.value)}
                  /></>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary mb-1">
                    Width [{unitL}]
                  </label>
                  <><label htmlFor="a11y-input-252" className="sr-only">Input</label>
<input id="a11y-input-252" type="number" inputMode="decimal"
                    className="w-full bg-surface-default/50 border border-border-color text-txt-primary rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 focus:border-accent-800 transition-shadow min-h-[44px] text-base font-normal"
                    value={gridWidth}
                    onChange={(e) => setGridWidth(e.target.value)}
                  /></>
                </div>
              </div>
              <div className="mt-4 p-3 bg-surface-hover rounded-2xl font-medium text-txt-secondary flex justify-between overflow-hidden">
                <span>Grid Area:</span>
                <span className="font-bold text-txt-primary">
                  {area.toFixed(2)} {unitA}
                </span>
              </div>
            </div>
            <div className="w-full bg-surface-default px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-color transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-border-color pb-4">
                <div className="p-2.5 bg-accent-50 text-accent-800 rounded-2xl overflow-hidden">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-txt-primary tracking-tight mb-4">
                  Corner Elevations
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6 relative">
                {/* Visual Connector Lines */}
                <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-surface-hover -translate-y-1/2" />
                <div className="absolute left-1/2 top-6 bottom-6 w-0.5 bg-surface-hover -translate-x-1/2" />
                {/* Top Left */}
                <div className="w-full bg-surface-default border-2 border-border-color px-4 py-3 rounded-2xl relative z-10 shadow-brand-sm hover:border-accent-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-txt-primary mb-4">
                    Top Left
                    <span className="text-sm uppercase bg-surface-hover px-2 py-1 rounded-2xl text-txt-secondary">
                      Corner 1
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-253" className="sr-only">Input</label>
<input id="a11y-input-253" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTL.existing}
                        onChange={(e) =>
                          setCornerTL({ ...cornerTL, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-254" className="sr-only">Input</label>
<input id="a11y-input-254" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTL.proposed}
                        onChange={(e) =>
                          setCornerTL({ ...cornerTL, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
                {/* Top Right */}
                <div className="w-full bg-surface-default border-2 border-border-color px-4 py-3 rounded-2xl relative z-10 shadow-brand-sm hover:border-accent-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-txt-primary mb-4">
                    Top Right
                    <span className="text-sm uppercase bg-surface-hover px-2 py-1 rounded-2xl text-txt-secondary">
                      Corner 2
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-255" className="sr-only">Input</label>
<input id="a11y-input-255" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTR.existing}
                        onChange={(e) =>
                          setCornerTR({ ...cornerTR, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-256" className="sr-only">Input</label>
<input id="a11y-input-256" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerTR.proposed}
                        onChange={(e) =>
                          setCornerTR({ ...cornerTR, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
                {/* Bottom Left */}
                <div className="w-full bg-surface-default border-2 border-border-color px-4 py-3 rounded-2xl relative z-10 shadow-brand-sm hover:border-accent-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-txt-primary mb-4">
                    Bottom Left
                    <span className="text-sm uppercase bg-surface-hover px-2 py-1 rounded-2xl text-txt-secondary">
                      Corner 3
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-257" className="sr-only">Input</label>
<input id="a11y-input-257" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBL.existing}
                        onChange={(e) =>
                          setCornerBL({ ...cornerBL, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-258" className="sr-only">Input</label>
<input id="a11y-input-258" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBL.proposed}
                        onChange={(e) =>
                          setCornerBL({ ...cornerBL, proposed: e.target.value })
                        }
                      /></>
                    </div>
                  </div>
                </div>
                {/* Bottom Right */}
                <div className="w-full bg-surface-default border-2 border-border-color px-4 py-3 rounded-2xl relative z-10 shadow-brand-sm hover:border-accent-200 transition-colors overflow-hidden">
                  <h3 className="mb-3 flex items-center justify-between text-lg font-medium text-txt-primary mb-4">
                    Bottom Right
                    <span className="text-sm uppercase bg-surface-hover px-2 py-1 rounded-2xl text-txt-secondary">
                      Corner 4
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Existing
                      </label>
                      <><label htmlFor="a11y-input-259" className="sr-only">Input</label>
<input id="a11y-input-259" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
                        value={cornerBR.existing}
                        onChange={(e) =>
                          setCornerBR({ ...cornerBR, existing: e.target.value })
                        }
                      /></>
                    </div>
                    <div>
                      <label className="block uppercase tracking-wider mb-1 text-sm font-medium text-txt-secondary">
                        Proposed
                      </label>
                      <><label htmlFor="a11y-input-260" className="sr-only">Input</label>
<input id="a11y-input-260" type="number" inputMode="decimal"
                        className="w-full bg-surface-hover border border-border-color rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500/50 min-h-[44px] text-base font-normal"
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
                   totalLabel={`Total ${isCut ? "Cut" : isFill ? "Fill" : "Cut + Fill"} Volume`}
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
                       title="Cut Volume"
                       value={cornerCutM3.toFixed(2)}
                       unit={unitV || ""}
                       variant="neutral"
                     />
                     <ResultCard
                       title="Fill Volume"
                       value={cornerFillM3.toFixed(2)}
                       unit={unitV || ""}
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
      <div className="w-full bg-surface-default p-4 sm:p-6 rounded-2xl border border-ui-borderSubtle shadow-brand-sm mt-8">
        <h3 className="text-xl font-bold text-txt-primary mb-2">Multi-cell grid (borrow-pit method)</h3>
        <p className="text-sm text-txt-secondary mb-4">Paste elevations as rows of space-separated numbers (existing and proposed must have the same shape). Cut and fill are summed separately per cell — corners straddling zero no longer cancel each other out.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block text-sm font-medium text-txt-secondary">Grid spacing (m)
            <input type="number" inputMode="decimal" value={multiSpacing} onChange={(e) => setMultiSpacing(e.target.value)} className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-2xl font-bold" />
          </label>
          <label className="block text-sm font-medium text-txt-secondary">Existing elevations (m)
            <textarea rows={3} value={multiExisting} onChange={(e) => setMultiExisting(e.target.value)} className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-2xl font-mono" />
          </label>
          <label className="block text-sm font-medium text-txt-secondary">Proposed elevations (m)
            <textarea rows={3} value={multiProposed} onChange={(e) => setMultiProposed(e.target.value)} className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-2xl font-mono" />
          </label>
        </div>
        {multiResult ? (
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div><div className="text-xs uppercase font-bold text-txt-tertiary">Cut</div><div className="text-2xl font-bold">{multiResult.cutM3.toFixed(1)} m³</div></div>
            <div><div className="text-xs uppercase font-bold text-txt-tertiary">Fill</div><div className="text-2xl font-bold">{multiResult.fillM3.toFixed(1)} m³</div></div>
            <div><div className="text-xs uppercase font-bold text-txt-tertiary">Net (cut − fill)</div><div className="text-2xl font-bold">{multiResult.netM3.toFixed(1)} m³</div></div>
          </div>
        ) : (<p className="text-sm text-ui-errorText mt-4">Enter two grids of the same shape (at least 2×2, numbers only).</p>)}
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
