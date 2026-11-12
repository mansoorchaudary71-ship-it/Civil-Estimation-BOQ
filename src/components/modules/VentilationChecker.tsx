import React, { useState, useMemo } from 'react';
import { Wind, Sun, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ResultCard } from '../ui/ResultCard';
import { NumberInput } from '../ui/NumberInput';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CodeTooltip } from "../ui/CodeTooltip";

type RoomType = "Habitable" | "Kitchen" | "Bathroom";
type ClimateZone = "Dry Hot" | "Intermediate" | "Wet Hot";

const RATIOS: Record<ClimateZone, number> = {
  "Dry Hot": 10,
  "Intermediate": 8,
  "Wet Hot": 6
};

export default function VentilationChecker() {
  const [roomType, setRoomType] = useState<RoomType>("Habitable");
  const [climate, setClimate] = useState<ClimateZone>("Intermediate");
  const [floorArea, setFloorArea] = useState<number | "">(20);
  const [windowArea, setWindowArea] = useState<number | "">(3);
  const [openableFraction, setOpenableFraction] = useState<number | "">(50); // %

  const results = useMemo(() => {
    const Area = Number(floorArea) || 0;
    const W_Area = Number(windowArea) || 0;
    const Open_Pct = Number(openableFraction) || 0;
    
    const ratio = RATIOS[climate];
    let reqLightArea = Area / ratio;

    if (roomType === "Kitchen") {
      reqLightArea = Math.max(1.0, reqLightArea);
    } else if (roomType === "Bathroom") {
      reqLightArea = Math.max(0.3, reqLightArea); // Generally 0.3 sq.m is min for bath/WC
    }

    // NBC requires openable area to be typically 50% of the required window area for ventilation
    const reqVentArea = reqLightArea * 0.5;

    const actualLightArea = W_Area;
    const actualVentArea = W_Area * (Open_Pct / 100);

    const lightSafe = actualLightArea >= reqLightArea;
    const ventSafe = actualVentArea >= reqVentArea;

    return {
      Area,
      ratio,
      reqLightArea,
      reqVentArea,
      actualLightArea,
      actualVentArea,
      lightSafe,
      ventSafe,
      safe: lightSafe && ventSafe
    };
  }, [roomType, climate, floorArea, windowArea, openableFraction]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-surface-default dark:bg-ink rounded-2xl p-4 sm:p-4 sm:p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle dark:border-ink overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-txt-primary dark:text-txt-primary flex items-center gap-2">
            <Wind className="text-accent-700" /> Ventilation & Lighting Checker (NBC)
         </h2>

         <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
            <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-txt-primary mb-3 border-b border-border-color pb-2">Room Details</h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1.5 ml-1">Room Type</label>
                        <select 
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value as RoomType)}
                            className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none"
                        >
                            <option value="Habitable">Habitable Room (Living/Bed)</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Bathroom">Bathroom / WC</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1.5 ml-1">Climate Zone</label>
                        <select 
                            value={climate}
                            onChange={(e) => setClimate(e.target.value as ClimateZone)}
                            className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none"
                        >
                            <option value="Dry Hot">Dry & Hot (1/10)</option>
                            <option value="Intermediate">Intermediate (1/8)</option>
                            <option value="Wet Hot">Wet & Hot (1/6)</option>
                        </select>
                    </div>
                    
                    <NumberInput label="Floor Area" unit="m²" value={floorArea} onChange={setFloorArea} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-txt-primary mb-3 border-b border-border-color pb-2">Glazing & Openings</h3>
                  <div className="space-y-4">
                    <NumberInput label={<span className="flex items-center gap-1">Total Window Area <CodeTooltip standard="IS" code="875 (Part 3)" description="Basic wind speed map for structural design." /></span>} unit="m²" value={windowArea} onChange={setWindowArea} />
                    <NumberInput label="Openable Fraction" unit="%" value={openableFraction} onChange={setOpenableFraction} />
                  </div>
                </div>
            </div>

            <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col flex flex-col gap-6">
                <MaterialSummary 
                    title="Compliance Verification"
                    totalLabel="Required Window Area"
                    totalValue={results.reqLightArea.toFixed(2)}
                    totalUnit="m²"
                    relatedToolIds={[]}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <ResultCard title="Floor Area" value={results.Area.toFixed(1)} unit="m²" variant="neutral" />
                        <ResultCard title="Required Ratio" value={`1/${results.ratio}`} unit="of Floor" variant="neutral" />
                        <ResultCard title="Provided Glazing" value={results.actualLightArea.toFixed(2)} unit="m²" variant="neutral" />
                        <ResultCard title="Openable Area" value={results.actualVentArea.toFixed(2)} unit="m²" variant="neutral" />
                    </div>

                    <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between border ${results.safe ? "bg-accent-50 border-accent-200" : "bg-ui-error border-ui-errorBorder"}`}>
                        <div className="flex items-center gap-3">
                            {results.safe ? <CheckCircle2 className="text-ui-successText w-6 h-6" /> : <AlertTriangle className="text-ui-errorText w-6 h-6" />}
                            <div>
                                <h4 className={`font-bold ${results.safe ? "text-ui-successText" : "text-ui-errorText"}`}>
                                    {results.safe ? "Compliant with NBC" : "Fails NBC Guidelines"}
                                </h4>
                                <p className={`text-sm ${results.safe ? "text-ui-successText" : "text-ui-errorText"}`}>
                                    Minimum required window area is {results.reqLightArea.toFixed(2)} m².
                                </p>
                            </div>
                        </div>
                    </div>
                </MaterialSummary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 responsive-tool-grid">
                    {/* Lighting Check */}
                    <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${results.lightSafe ? "bg-surface-hover border-ui-borderSubtle" : "bg-ui-error border-ui-errorBorder"}`}>
                       <div className="flex items-center gap-2">
                          <Sun className={`w-5 h-5 ${results.lightSafe ? "text-accent-800" : "text-ui-errorText"}`}/>
                          <h3 className={`font-bold ${results.lightSafe ? "text-txt-primary" : "text-ui-errorText"}`}>Natural Lighting</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.lightSafe ? "text-txt-secondary" : "text-ui-errorText"}>Required Glazing</span>
                            <span className={`font-mono font-bold ${results.lightSafe ? "text-txt-primary" : "text-ui-errorText"}`}>{results.reqLightArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.lightSafe ? "text-txt-secondary" : "text-ui-errorText"}>Provided Glazing</span>
                            <span className={`font-mono font-bold ${results.lightSafe ? "text-txt-primary" : "text-ui-errorText"}`}>{results.actualLightArea.toFixed(2)} m²</span>
                          </div>
                          {!results.lightSafe && (
                             <p className="text-xs text-ui-errorText mt-2 font-medium">
                                Increase total window area by {(results.reqLightArea - results.actualLightArea).toFixed(2)} m².
                             </p>
                          )}
                       </div>
                    </div>

                    {/* Ventilation Check */}
                    <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${results.ventSafe ? "bg-surface-hover border-ui-borderSubtle" : "bg-ui-error border-ui-errorBorder"}`}>
                       <div className="flex items-center gap-2">
                          <Wind className={`w-5 h-5 ${results.ventSafe ? "text-ui-successText" : "text-ui-errorText"}`}/>
                          <h3 className={`font-bold ${results.ventSafe ? "text-txt-primary" : "text-ui-errorText"}`}>Natural Ventilation</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.ventSafe ? "text-txt-secondary" : "text-ui-errorText"}>Required Openable</span>
                            <span className={`font-mono font-bold ${results.ventSafe ? "text-txt-primary" : "text-ui-errorText"}`}>{results.reqVentArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.ventSafe ? "text-txt-secondary" : "text-ui-errorText"}>Provided Openable</span>
                            <span className={`font-mono font-bold ${results.ventSafe ? "text-txt-primary" : "text-ui-errorText"}`}>{results.actualVentArea.toFixed(2)} m²</span>
                          </div>
                          {!results.ventSafe && (
                             <p className="text-xs text-ui-errorText mt-2 font-medium">
                                Increase openable fraction or window area.
                             </p>
                          )}
                       </div>
                    </div>
                </div>
            </div>
         </div>
      </div>
    
      <CalculationHistory 
        calculatorId="ventilation_checker" 
        currentInputs={{ roomType, climate, floorArea, windowArea, openableFraction }} 
      />
    </div>
  );
}
