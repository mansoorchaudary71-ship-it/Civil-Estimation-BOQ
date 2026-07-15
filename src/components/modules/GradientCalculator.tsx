import React, { useState, useMemo } from "react";
import { ArrowRight, Triangle, Activity, CheckCircle2, AlertTriangle, Route } from "lucide-react";
import { SEO } from "../SEO";
import { CalculationHistory } from "../ui/CalculationHistory";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";

export default function GradientCalculator() {
  const [activeTab, setActiveTab] = useState<"longitudinal" | "camber" | "vertical_curve">("longitudinal");

  // Longitudinal Profile States
  const [startChainage, setStartChainage] = useState<number | "">(0);
  const [endChainage, setEndChainage] = useState<number | "">(100);
  const [startElevation, setStartElevation] = useState<number | "">(100.0);
  const [longGradient, setLongGradient] = useState<number | "">(-2.5); // %

  // Camber States
  const [centerElevation, setCenterElevation] = useState<number | "">(100.0);
  const [roadWidth, setRoadWidth] = useState<number | "">(3.5); // m (half-width)
  const [camberSlope, setCamberSlope] = useState<number | "">(-2.0); // %

  // Vertical Curve States
  const [g1, setG1] = useState<number | "">(3.0); // %
  const [g2, setG2] = useState<number | "">(-2.0); // %
  const [designSpeed, setDesignSpeed] = useState<number | "">(80); // km/h

  const longitudinalResults = useMemo(() => {
    const ch1 = Number(startChainage) || 0;
    const ch2 = Number(endChainage) || 0;
    const elev1 = Number(startElevation) || 0;
    const grad = Number(longGradient) || 0;

    const length = Math.abs(ch2 - ch1);
    const rise = length * (grad / 100);
    const endElev = elev1 + rise;

    const ratio = grad !== 0 ? Math.abs(100 / grad) : 0;
    const ratioStr = grad !== 0 ? `1:${ratio.toFixed(2)}` : "Flat";

    // Intermediate points check
    const midElev = elev1 + (length / 2) * (grad / 100);

    return { length, endElev, rise, ratioStr, midElev };
  }, [startChainage, endChainage, startElevation, longGradient]);

  const camberResults = useMemo(() => {
    const cl = Number(centerElevation) || 0;
    const w = Number(roadWidth) || 0;
    const slope = Number(camberSlope) || 0;

    const drop = w * (Math.abs(slope) / 100);
    const edgeElev = cl - drop;

    const ratio = slope !== 0 ? Math.abs(100 / slope) : 0;
    const ratioStr = slope !== 0 ? `1:${ratio.toFixed(1)}` : "Flat";

    return { edgeElev, drop, ratioStr };
  }, [centerElevation, roadWidth, camberSlope]);

  const vcResults = useMemo(() => {
    const grade1 = Number(g1) || 0;
    const grade2 = Number(g2) || 0;
    const v = Number(designSpeed) || 0;

    const A = Math.abs(grade1 - grade2); // Algebraic difference
    const type = grade1 > grade2 ? "Crest" : "Sag";

    // simplified K-values based on standard highway design (AASHTO approximations)
    // Crest: K = V^2 / 395 approx
    // Sag: K = V^2 / 120 approx
    
    let K = 0;
    if (v <= 0) K = 0;
    else if (type === "Crest") K = Math.max(1, (v * v) / (100 * 2.8)); // Basic approximation for Crest stopping sight distance
    else K = Math.max(1, (v * v) / (120 * 1.5)); // Basic approximation for Sag headlight sight distance

    let Lm = K * A;
    if (A < 0.5) Lm = 0; // minimal grade change doesn't strictly need a curve
    
    // Check minimum length (often V or 0.6V)
    const minLengthAesthetic = 0.6 * v;
    let actualL = Math.max(Lm, minLengthAesthetic, 20); // enforce absolute min 20m

    return { A, type, K, requiredLength: actualL };
  }, [g1, g2, designSpeed]);


  return (
    <div className="flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto animate-in fade-in px-4 md:px-0">
      <SEO 
        title="Gradient & Slope Interpolation | Civil Estimation Pro" 
        description="Dynamic slope calculator for road cambers, longitudinal gradients, and vertical curve profiles."
      />
      <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
         <h2 className="flex items-center gap-2 mb-6 text-xl font-semibold text-slate-900 tracking-tight mb-4">
          <Route className="w-6 h-6 text-emerald-600" />
          Highway Gradient & Slope Engineering
        </h2>

        <div className="flex bg-slate-100 p-1 rounded-[16px] mb-6 overflow-x-auto hide-scrollbar">
            <button 
                onClick={() => setActiveTab("longitudinal")}
                className={`flex-1 min-w-[120px] py-2.5 text-base font-medium rounded-[12px] transition-all ${activeTab === "longitudinal" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Longitudinal Profile
            </button>
            <button 
                onClick={() => setActiveTab("camber")}
                className={`flex-1 min-w-[120px] py-2.5 text-base font-medium rounded-[12px] transition-all ${activeTab === "camber" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Crossfall / Camber
            </button>
            <button 
                onClick={() => setActiveTab("vertical_curve")}
                className={`flex-1 min-w-[120px] py-2.5 text-base font-medium rounded-[12px] transition-all ${activeTab === "vertical_curve" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Vertical Curve Checks
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <div className="lg:col-span-5 space-y-6">
                
                {activeTab === "longitudinal" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Profile Inputs</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Start Chainage" unit="m" value={startChainage} onChange={setStartChainage} />
                            <NumberInput label="End Chainage" unit="m" value={endChainage} onChange={setEndChainage} />
                            <NumberInput label="Start Elevation" unit="m" value={startElevation} onChange={setStartElevation} />
                            <NumberInput label="Gradient (+/-)" unit="%" value={longGradient} onChange={setLongGradient} />
                        </div>
                        <p className="mt-4 text-base font-normal text-slate-600 leading-relaxed">
                            Positive gradient indicates an uphill slope. Negative indicates downhill. Output is interpolated linearly.
                        </p>
                    </div>
                )}

                {activeTab === "camber" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Road Cross-Section</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Centerline Elev (CL)" unit="m" value={centerElevation} onChange={setCenterElevation} />
                            <NumberInput label="Lane Width (Half)" unit="m" value={roadWidth} onChange={setRoadWidth} />
                            <div className="col-span-2">
                               <NumberInput label="Normal Crossfall / Camber" unit="%" value={camberSlope} onChange={setCamberSlope} />
                            </div>
                        </div>
                        <p className="mt-4 text-base font-normal text-slate-600 leading-relaxed">
                            Camber is usually negative falling away from the centerline for drainage purposes.
                        </p>
                    </div>
                )}

                {activeTab === "vertical_curve" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Vertical Alignment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Grade 1 (g1)" unit="%" value={g1} onChange={setG1} />
                            <NumberInput label="Grade 2 (g2)" unit="%" value={g2} onChange={setG2} />
                            <div className="col-span-2">
                               <NumberInput label="Design Speed (V)" unit="km/h" value={designSpeed} onChange={setDesignSpeed} />
                            </div>
                        </div>
                        <p className="mt-4 text-base font-normal text-slate-600 leading-relaxed">
                            Basic check for minimum curve length based on K-Value approximations for stopping/headlight sight distance.
                        </p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
                
                {activeTab === "longitudinal" && (
                    <MaterialSummary 
                        title="Longitudinal Outputs"
                        totalLabel="Final Invert / Surface Elevation"
                        totalValue={longitudinalResults.endElev.toFixed(3)}
                        totalUnit="m"
                        relatedToolIds={[]}
                        className="mb-0 animate-in fade-in"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            <ResultCard title="Segment Length" value={longitudinalResults.length.toFixed(2)} unit="m" variant="neutral" />
                            <ResultCard title="Total Rise/Fall" value={longitudinalResults.rise.toFixed(3)} unit="m" variant={longitudinalResults.rise > 0 ? "info" : "warning"} />
                            <ResultCard title="Slope Ratio" value={longitudinalResults.ratioStr} unit="1:N" variant="neutral" />
                        </div>
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                             <h4 className="text-sm mb-2 text-lg font-medium text-slate-800 mb-4">Midpoint Interpolation</h4>
                             <div className="flex justify-between items-end">
                                 <div>
                                     <p className="text-base font-normal text-slate-600 leading-relaxed">Chainage: {((Number(startChainage) + Number(endChainage)) / 2).toFixed(2)}</p>
                                     <p className="font-mono text-base font-normal text-slate-600 leading-relaxed">{longitudinalResults.midElev.toFixed(3)} m</p>
                                 </div>
                                 <ArrowRight className="text-slate-700 w-4 h-4 mb-1" />
                             </div>
                        </div>
                    </MaterialSummary>
                )}

                {activeTab === "camber" && (
                    <MaterialSummary 
                        title="Crossfall Outputs"
                        totalLabel="Edge of Pavement Elevation"
                        totalValue={camberResults.edgeElev.toFixed(3)}
                        totalUnit="m"
                        relatedToolIds={[]}
                        className="mb-0 animate-in fade-in"
                    >
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <ResultCard title="Vertical Drop" value={camberResults.drop.toFixed(3)} unit="m" variant="warning" />
                            <ResultCard title="Slope Ratio" value={camberResults.ratioStr} unit="1:N" variant="neutral" />
                        </div>
                        <div className="mt-6 bg-slate-50 h-24 rounded-2xl border border-slate-200 flex items-center justify-center relative overflow-hidden">
                             <div className="absolute w-full h-[2px] bg-slate-300" style={{ transform: `rotate(${Math.min(10, Math.max(-10, Number(camberSlope)))}deg)` }}></div>
                             <div className="absolute top-2 left-1/2 -translate-x-1/2 text-base font-medium bg-slate-50 px-2 rounded-full">CL: {Number(centerElevation).toFixed(3)}</div>
                             <div className="absolute bottom-2 text-rose-500 font-bold text-sm bg-rose-50 px-2 rounded-full">Edge: {camberResults.edgeElev.toFixed(3)}</div>
                        </div>
                    </MaterialSummary>
                )}

                {activeTab === "vertical_curve" && (
                    <MaterialSummary 
                        title="Vertical Curve Analytics"
                        totalLabel="Minimum Curve Length (L)"
                        totalValue={vcResults.requiredLength.toFixed(1)}
                        totalUnit="m"
                        relatedToolIds={[]}
                        className="mb-0 animate-in fade-in"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            <ResultCard title="Curve Type" value={vcResults.type} unit="Curve" variant={vcResults.type === "Crest" ? "info" : "primary"} />
                            <ResultCard title="Algebraic Diff (A)" value={vcResults.A.toFixed(1)} unit="%" variant="neutral" />
                            <ResultCard title="K-Value (Approx)" value={vcResults.K.toFixed(1)} unit="" variant="neutral" />
                        </div>
                        
                        <div className="mt-6 flex flex-col gap-3">
                             <div className={`p-4 rounded-2xl border flex items-start justify-between ${vcResults.A > 0.5 ? "bg-teal-50 border-teal-200" : "bg-slate-50 border-slate-200"}`}>
                                 <div>
                                     <h4 className={`text-base font-medium ${vcResults.A > 0.5 ? "text-teal-900" : "text-slate-800"}`}>Curve Requirement</h4>
                                     <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">Based on grade difference and comfort standard.</p>
                                 </div>
                                 {vcResults.A > 0.5 ? (
                                    <span className="bg-teal-200 text-teal-800 text-base font-medium px-2 py-1 rounded-full uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Required</span>
                                 ) : (
                                    <span className="bg-slate-200 text-slate-600 text-base font-medium px-2 py-1 rounded-full uppercase">Not Strictly Required</span>
                                 )}
                             </div>
                        </div>
                    </MaterialSummary>
                )}

            </div>
        </div>
       </div>
    
      <CalculationHistory 
        calculatorId="gradient_slope_calculator" 
        currentInputs={{ activeTab, startChainage, endChainage, startElevation, longGradient, centerElevation, roadWidth, camberSlope, g1, g2, designSpeed }} 
      />
    </div>
  );
}
