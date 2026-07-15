import React, { useState, useMemo } from 'react';
import { Spline, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CalculationHistory } from '../ui/CalculationHistory';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';

type OccupancyType = "Residential" | "Commercial" | "Assembly" | "Educational" | "Hospital";

const OCCUPANCY_SPECS: Record<OccupancyType, { minWidth: number; maxRiser: number; minGoing: number }> = {
  "Residential": { minWidth: 1.0, maxRiser: 190, minGoing: 250 },
  "Educational": { minWidth: 1.5, maxRiser: 150, minGoing: 300 },
  "Commercial": { minWidth: 1.5, maxRiser: 150, minGoing: 300 },
  "Assembly": { minWidth: 2.0, maxRiser: 150, minGoing: 300 },
  "Hospital": { minWidth: 2.0, maxRiser: 150, minGoing: 300 }
};

export default function StaircaseDesignReference() {
  const [totalHeight, setTotalHeight] = useState<number | "">(3.0); // m
  const [riser, setRiser] = useState<number | "">(150); // mm
  const [going, setGoing] = useState<number | "">(300); // mm
  const [width, setWidth] = useState<number | "">(1.5); // m
  const [headroom, setHeadroom] = useState<number | "">(2.2); // m
  const [landingDepth, setLandingDepth] = useState<number | "">(1.5); // m
  const [occupancy, setOccupancy] = useState<OccupancyType>("Commercial");

  const results = useMemo(() => {
    const H = Number(totalHeight) || 0;
    const R_target = Number(riser) || 0;
    const G = Number(going) || 0;
    const W = Number(width) || 0;
    const Hd = Number(headroom) || 0;
    const Ld = Number(landingDepth) || 0;

    const specs = OCCUPANCY_SPECS[occupancy];

    const numberOfRisers = R_target > 0 ? Math.ceil((H * 1000) / R_target) : 0;
    const actualRiser = numberOfRisers > 0 ? (H * 1000) / numberOfRisers : 0;
    const numberOfTreads = Math.max(0, numberOfRisers - 1);

    // Ergonomics Check: 2R + G = 600-640mm
    const ergoValue = (2 * actualRiser) + G;
    const isErgonomic = ergoValue >= 600 && ergoValue <= 640;

    // Code Compliance Checks
    const widthSafe = W >= specs.minWidth;
    const riserSafe = actualRiser <= specs.maxRiser;
    const goingSafe = G >= specs.minGoing;
    
    // Fire Safety / Egress strict checks
    const headroomSafe = Hd >= 2.1;
    const landingSafe = Ld >= W; // Landing depth must at least be equal to stair width

    const isFullyCompliant = widthSafe && riserSafe && goingSafe && headroomSafe && landingSafe;

    return {
      numberOfRisers,
      actualRiser,
      numberOfTreads,
      ergoValue,
      isErgonomic,
      widthSafe, reqWidth: specs.minWidth,
      riserSafe, reqMaxRiser: specs.maxRiser,
      goingSafe, reqMinGoing: specs.minGoing,
      headroomSafe,
      landingSafe,
      isFullyCompliant,
      specs
    };
  }, [totalHeight, riser, going, width, headroom, landingDepth, occupancy]);

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
         <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
          <Spline className="w-6 h-6 text-indigo-600" />
          Staircase & Exit Clearance Reference
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Space & Classification</h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Occupancy Type</label>
                        <select 
                            value={occupancy}
                            onChange={(e) => setOccupancy(e.target.value as OccupancyType)}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-sm font-medium focus:outline-none"
                        >
                            {Object.keys(OCCUPANCY_SPECS).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <NumberInput label="Total Height / Fall" unit="m" value={totalHeight} onChange={setTotalHeight} />
                    <NumberInput label="Clear Headroom" unit="m" value={headroom} onChange={setHeadroom} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Step Dimensions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Target Riser" unit="mm" value={riser} onChange={setRiser} />
                    <NumberInput label="Target Going" unit="mm" value={going} onChange={setGoing} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Flight Parameters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Stair Width" unit="m" value={width} onChange={setWidth} />
                    <NumberInput label="Landing Depth" unit="m" value={landingDepth} onChange={setLandingDepth} />
                  </div>
                </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
                <MaterialSummary 
                    title="Design Summary"
                    totalLabel="Total Number of Risers (Target)"
                    totalValue={results.numberOfRisers}
                    totalUnit="nos"
                    relatedToolIds={[]}
                    className="mb-0"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <ResultCard title="Actual Riser" value={results.actualRiser.toFixed(1)} unit="mm" variant="neutral" />
                        <ResultCard title="Number of Treads" value={results.numberOfTreads} unit="nos" variant="neutral" />
                        <ResultCard 
                            title="Ergonomics (2R+G)" 
                            value={results.ergoValue.toFixed(0)} 
                            unit={results.isErgonomic ? "Ideal" : "Poor"} 
                            variant={results.isErgonomic ? "neutral" : "warning"} 
                        />
                        <ResultCard 
                            title="Compliance Status" 
                            value={results.isFullyCompliant ? "PASS" : "FAIL"} 
                            unit="NBC Specs" 
                            variant={results.isFullyCompliant ? "primary" : "warning"} 
                        />
                    </div>
                </MaterialSummary>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-6 overflow-hidden">
                    <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
                        <span>Code Compliance Matrix</span>
                        {results.isFullyCompliant 
                            ? <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full flex items-center gap-1.5 font-bold"><ShieldCheck className="w-3.5 h-3.5"/> All Clear</span>
                            : <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full flex items-center gap-1.5 font-bold"><ShieldAlert className="w-3.5 h-3.5"/> Action Required</span>
                        }
                    </h3>
                    
                    <div className="space-y-3">
                        {/* Minimum Width */}
                        <div className={`p-3 rounded-xl border flex items-start justify-between ${results.widthSafe ? "bg-white border-slate-200" : "bg-rose-50 border-rose-200"}`}>
                            <div>
                                <h4 className={`text-sm font-bold ${results.widthSafe ? "text-slate-700" : "text-rose-800"}`}>1. Minimum Egress Width</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Required for {occupancy}: {results.reqWidth.toFixed(2)}m</p>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono text-sm font-bold ${results.widthSafe ? "text-slate-800" : "text-rose-600"}`}>{Number(width).toFixed(2)} m</span>
                                <p className="text-xs mt-0.5">{results.widthSafe ? <span className="text-teal-600">✓ Pass</span> : <span className="text-rose-600 font-bold">✗ Fail (Violates Fire Code)</span>}</p>
                            </div>
                        </div>

                        {/* Headroom Clearance */}
                        <div className={`p-3 rounded-xl border flex items-start justify-between ${results.headroomSafe ? "bg-white border-slate-200" : "bg-rose-50 border-rose-600 border-2"}`}>
                            <div>
                                <h4 className={`text-sm font-bold ${results.headroomSafe ? "text-slate-700" : "text-rose-800"}`}>2. Life Safety: Clear Headroom</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Absolute minimum: 2.10m vertically from nosing</p>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono text-sm font-bold ${results.headroomSafe ? "text-slate-800" : "text-rose-700"}`}>{Number(headroom).toFixed(2)} m</span>
                                <p className="text-xs mt-0.5 whitespace-nowrap">{results.headroomSafe ? <span className="text-teal-600">✓ Pass</span> : <span className="text-rose-600 font-bold">✗ CRITICAL FAIL</span>}</p>
                            </div>
                        </div>

                        {/* Landing Depth */}
                        <div className={`p-3 rounded-xl border flex items-start justify-between ${results.landingSafe ? "bg-white border-slate-200" : "bg-rose-50 border-rose-200"}`}>
                            <div>
                                <h4 className={`text-sm font-bold ${results.landingSafe ? "text-slate-700" : "text-rose-800"}`}>3. Landing Clearance</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Landing depth must be ≥ Stair Width ({Number(width).toFixed(2)}m)</p>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono text-sm font-bold ${results.landingSafe ? "text-slate-800" : "text-rose-700"}`}>{Number(landingDepth).toFixed(2)} m</span>
                                <p className="text-xs mt-0.5">{results.landingSafe ? <span className="text-teal-600">✓ Pass</span> : <span className="text-rose-600 font-bold">✗ Obstruction Hazard</span>}</p>
                            </div>
                        </div>

                        {/* Riser / Going */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`p-3 rounded-xl border flex flex-col justify-between ${results.riserSafe ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200"}`}>
                                <div>
                                    <h4 className={`text-xs font-bold leading-tight ${results.riserSafe ? "text-slate-700" : "text-orange-900"}`}>Maximum Riser Check</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Required limit: {results.reqMaxRiser}mm</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className={`font-mono text-sm font-bold ${results.riserSafe ? "text-slate-800" : "text-blue-700"}`}>{results.actualRiser.toFixed(1)} mm</span>
                                    <span>{results.riserSafe ? <CheckCircle2 className="w-4 h-4 text-teal-600"/> : <AlertTriangle className="w-4 h-4 text-blue-500"/>}</span>
                                </div>
                            </div>
                            
                            <div className={`p-3 rounded-xl border flex flex-col justify-between ${results.goingSafe ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200"}`}>
                                <div>
                                    <h4 className={`text-xs font-bold leading-tight ${results.goingSafe ? "text-slate-700" : "text-orange-900"}`}>Minimum Going Check</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Required min: {results.reqMinGoing}mm</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className={`font-mono text-sm font-bold ${results.goingSafe ? "text-slate-800" : "text-blue-700"}`}>{Number(going).toFixed(1)} mm</span>
                                    <span>{results.goingSafe ? <CheckCircle2 className="w-4 h-4 text-teal-600"/> : <AlertTriangle className="w-4 h-4 text-blue-500"/>}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
       </div>
    
      <CalculationHistory 
        calculatorId="staircase_design_reference" 
        currentInputs={{ totalHeight, riser, going, width, headroom, landingDepth, occupancy }} 
      />
    </div>
  );
}