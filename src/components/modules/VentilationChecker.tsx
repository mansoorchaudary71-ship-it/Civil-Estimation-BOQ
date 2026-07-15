import React, { useState, useMemo } from 'react';
import { Wind, Sun, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ResultCard } from '../ui/ResultCard';
import { NumberInput } from '../ui/NumberInput';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';

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
    <div className="flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 rounded-[24px] p-4 sm:p-4 sm:p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Wind className="text-cyan-600" /> Ventilation & Lighting Checker (NBC)
         </h2>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Room Details</h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Room Type</label>
                        <select 
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value as RoomType)}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-cyan-500"
                        >
                            <option value="Habitable">Habitable Room (Living/Bed)</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Bathroom">Bathroom / WC</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Climate Zone</label>
                        <select 
                            value={climate}
                            onChange={(e) => setClimate(e.target.value as ClimateZone)}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-cyan-500"
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
                  <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Glazing & Openings</h3>
                  <div className="space-y-4">
                    <NumberInput label="Total Window Area" unit="m²" value={windowArea} onChange={setWindowArea} />
                    <NumberInput label="Openable Fraction" unit="%" value={openableFraction} onChange={setOpenableFraction} />
                  </div>
                </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
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

                    <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between border ${results.safe ? "bg-teal-50 border-teal-200" : "bg-rose-50 border-rose-200"}`}>
                        <div className="flex items-center gap-3">
                            {results.safe ? <CheckCircle2 className="text-teal-600 w-6 h-6" /> : <AlertTriangle className="text-rose-600 w-6 h-6" />}
                            <div>
                                <h4 className={`font-bold ${results.safe ? "text-teal-900" : "text-rose-900"}`}>
                                    {results.safe ? "Compliant with NBC" : "Fails NBC Guidelines"}
                                </h4>
                                <p className={`text-sm ${results.safe ? "text-teal-700" : "text-rose-700"}`}>
                                    Minimum required window area is {results.reqLightArea.toFixed(2)} m².
                                </p>
                            </div>
                        </div>
                    </div>
                </MaterialSummary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lighting Check */}
                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${results.lightSafe ? "bg-slate-50 border-slate-200" : "bg-rose-50 border-rose-200"}`}>
                       <div className="flex items-center gap-2">
                          <Sun className={`w-5 h-5 ${results.lightSafe ? "text-amber-500" : "text-rose-500"}`}/>
                          <h3 className={`font-bold ${results.lightSafe ? "text-slate-900" : "text-rose-900"}`}>Natural Lighting</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.lightSafe ? "text-slate-600" : "text-rose-700"}>Required Glazing</span>
                            <span className={`font-mono font-bold ${results.lightSafe ? "text-slate-900" : "text-rose-900"}`}>{results.reqLightArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.lightSafe ? "text-slate-600" : "text-rose-700"}>Provided Glazing</span>
                            <span className={`font-mono font-bold ${results.lightSafe ? "text-slate-900" : "text-rose-900"}`}>{results.actualLightArea.toFixed(2)} m²</span>
                          </div>
                          {!results.lightSafe && (
                             <p className="text-xs text-rose-600 mt-2 font-medium">
                                Increase total window area by {(results.reqLightArea - results.actualLightArea).toFixed(2)} m².
                             </p>
                          )}
                       </div>
                    </div>

                    {/* Ventilation Check */}
                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${results.ventSafe ? "bg-slate-50 border-slate-200" : "bg-rose-50 border-rose-200"}`}>
                       <div className="flex items-center gap-2">
                          <Wind className={`w-5 h-5 ${results.ventSafe ? "text-cyan-500" : "text-rose-500"}`}/>
                          <h3 className={`font-bold ${results.ventSafe ? "text-slate-900" : "text-rose-900"}`}>Natural Ventilation</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.ventSafe ? "text-slate-600" : "text-rose-700"}>Required Openable</span>
                            <span className={`font-mono font-bold ${results.ventSafe ? "text-slate-900" : "text-rose-900"}`}>{results.reqVentArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.ventSafe ? "text-slate-600" : "text-rose-700"}>Provided Openable</span>
                            <span className={`font-mono font-bold ${results.ventSafe ? "text-slate-900" : "text-rose-900"}`}>{results.actualVentArea.toFixed(2)} m²</span>
                          </div>
                          {!results.ventSafe && (
                             <p className="text-xs text-rose-600 mt-2 font-medium">
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
