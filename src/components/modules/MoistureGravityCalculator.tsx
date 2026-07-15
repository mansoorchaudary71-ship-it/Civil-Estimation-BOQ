import React, { useState, useMemo } from "react";
import { Calculator, Activity, Droplet, Hash, RefreshCcw, FlaskConical } from "lucide-react";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SEO } from "../SEO";

export default function MoistureGravityCalculator() {
  // Moisture Content Inputs
  const [mcW1, setMcW1] = useState<number | "">(50); // Empty container
  const [mcW2, setMcW2] = useState<number | "">(150); // Container + wet soil
  const [mcW3, setMcW3] = useState<number | "">(120); // Container + dry soil

  // Pycnometer Inputs
  const [pycW1, setPycW1] = useState<number | "">(500); // Empty Pycnometer
  const [pycW2, setPycW2] = useState<number | "">(900); // Pyc + Dry Soil
  const [pycW3, setPycW3] = useState<number | "">(1640); // Pyc + Soil + Water
  const [pycW4, setPycW4] = useState<number | "">(1390); // Pyc + Water

  const [bulkDensity, setBulkDensity] = useState<number | "">(1.8); // g/cm3

  const results = useMemo(() => {
    // 1. Natural Moisture Content (w)
    const W1 = Number(mcW1);
    const W2 = Number(mcW2);
    const W3 = Number(mcW3);
    
    let moistureContent = 0;
    if (W3 - W1 > 0 && W2 >= W3) {
      moistureContent = ((W2 - W3) / (W3 - W1));
    }

    // 2. Specific Gravity (Gs) - Pycnometer
    const pW1 = Number(pycW1);
    const pW2 = Number(pycW2);
    const pW3 = Number(pycW3);
    const pW4 = Number(pycW4);
    
    let Gs = 0;
    const denominator = (pW2 - pW1) - (pW3 - pW4);
    if (denominator > 0) {
      Gs = (pW2 - pW1) / denominator;
    }

    // 3. Dry Density (rho_d)
    const gammaBulk = Number(bulkDensity);
    let dryDensity = 0;
    if (moistureContent >= 0) {
      dryDensity = gammaBulk / (1 + moistureContent);
    }

    // 4. Void Ratio (e)
    // Formula: rho_d = (G_s * rho_w) / (1 + e) => e = (G_s * rho_w / rho_d) - 1
    // Assuming rho_w = 1 g/cm3
    let voidRatio = 0;
    if (dryDensity > 0 && Gs > 0) {
      voidRatio = (Gs / dryDensity) - 1;
    }

    // 5. Degree of Saturation (S)
    // Formula: S * e = w * Gs => S = (w * Gs) / e
    let degreeSaturation = 0;
    if (voidRatio > 0 && Gs > 0) {
      degreeSaturation = (moistureContent * Gs) / voidRatio;
    }

    return {
      moistureContent,
      mcPercent: moistureContent * 100,
      Gs,
      dryDensity,
      voidRatio,
      degreeSaturation,
      SPercent: degreeSaturation * 100
    };
  }, [mcW1, mcW2, mcW3, pycW1, pycW2, pycW3, pycW4, bulkDensity]);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in">
        <SEO 
            title="Moisture & Gravity Test Tool | Geotechnical Estimator" 
            description="Process raw pycnometer and oven-dry weights to calculate natural moisture content, specific gravity, dry density, void ratio, and degree of saturation."
        />

        <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
                <FlaskConical className="w-6 h-6 text-blue-600" />
                Moisture & Gravity Data Flow
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-8">
                    <div>
                        <h3 className="text-base font-medium mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                           <Droplet className="w-4 h-4 text-blue-500" /> Oven-Dry Weights (Moisture)
                        </h3>
                        <div className="space-y-4">
                            <NumberInput label="Empty Container (W1)" unit="g" value={mcW1} onChange={setMcW1} />
                            <NumberInput label="Container + Wet Soil (W2)" unit="g" value={mcW2} onChange={setMcW2} />
                            <NumberInput label="Container + Dry Soil (W3)" unit="g" value={mcW3} onChange={setMcW3} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-medium mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-amber-500" /> Pycnometer Weights (Gravity)
                        </h3>
                        <div className="space-y-4">
                            <NumberInput label="Empty Pycnometer (W1)" unit="g" value={pycW1} onChange={setPycW1} />
                            <NumberInput label="Pyc + Dry Soil (W2)" unit="g" value={pycW2} onChange={setPycW2} />
                            <NumberInput label="Pyc + Soil + Water (W3)" unit="g" value={pycW3} onChange={setPycW3} />
                            <NumberInput label="Pyc + Full Water (W4)" unit="g" value={pycW4} onChange={setPycW4} />
                        </div>
                    </div>

                    <div>
                         <h3 className="text-base font-medium mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-emerald-500" /> Field Density
                        </h3>
                        <NumberInput label="Bulk Density (\u03b3_bulk)" unit="g/cm³" value={bulkDensity} onChange={setBulkDensity} />
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                    <MaterialSummary 
                        title="Phase Relationships & Soil Matrix"
                        totalLabel="Specific Gravity (Gs)"
                        totalValue={results.Gs > 0 ? results.Gs.toFixed(3) : "0.000"}
                        totalUnit=""
                    >
                        <div className="mt-6 flex flex-col gap-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="bg-white border border-slate-200 p-4 rounded-2xl overflow-hidden">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Natural Moisture Content (w)</span>
                                     <span className="text-xl font-mono font-bold text-blue-600">{results.mcPercent.toFixed(2)} %</span>
                                 </div>
                                 <div className="bg-white border border-slate-200 p-4 rounded-2xl overflow-hidden">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Dry Density (\u03b3_d)</span>
                                     <span className="text-xl font-mono font-bold text-amber-600">{results.dryDensity > 0 ? results.dryDensity.toFixed(3) : "0.000"} <span className="text-sm">g/cm³</span></span>
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="bg-white border border-slate-200 p-4 rounded-2xl overflow-hidden">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Void Ratio (e)</span>
                                     <span className="text-xl font-mono font-bold text-slate-800">{results.voidRatio > 0 ? results.voidRatio.toFixed(3) : "0.000"}</span>
                                 </div>
                                 <div className="bg-white border border-slate-200 p-4 rounded-2xl relative overflow-hidden">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 relative z-10">Degree of Saturation (S)</span>
                                     <span className="text-xl font-mono font-bold text-emerald-600 relative z-10">{results.SPercent > 0 ? Math.min(100, results.SPercent).toFixed(1) : "0.0"} %</span>
                                     
                                     {/* Simple saturation visualizer */}
                                     {results.SPercent > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/10 z-0 transition-all duration-1000" style={{ height: `${Math.min(100, results.SPercent)}%` }}></div>
                                     )}
                                 </div>
                             </div>

                             {results.Gs > 0 && (results.Gs < 2.5 || results.Gs > 2.9) && (
                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl mt-2 text-rose-700 text-base font-medium flex items-center justify-center">
                                    Note: Specific Gravity is outside the typical range of 2.5 - 2.9.
                                </div>
                             )}
                        </div>

                        <div className="mt-8 border-t border-slate-100 pt-6">
                             <h4 className="text-base font-medium flex items-center gap-2 mb-4">
                                 <Calculator className="w-4 h-4" /> Math Logic & Linkages
                             </h4>
                             <div className="text-[11px] font-medium text-slate-600 space-y-3">
                                  <div>
                                    <span className="font-bold text-slate-700 block mb-1">Specific Gravity (Gs):</span>
                                    <div className="font-mono bg-slate-50 border border-slate-100 p-2 rounded block">G_s = (W2 - W1) / ((W2 - W1) - (W3 - W4))</div>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-700 block mb-1">Moisture Content (w) & Dry Density (\u03b3_d):</span>
                                    <div className="font-mono bg-slate-50 border border-slate-100 p-2 rounded block">w = (M_wet - M_dry) / M_dry | \u03b3_d = \u03b3_bulk / (1 + w)</div>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-700 block mb-1">Phase Linkages:</span>
                                    <div className="font-mono bg-slate-50 border border-slate-100 p-2 rounded block">e = (G_s * \u03b3_w / \u03b3_d) - 1   |   S = (w * G_s) / e</div>
                                  </div>
                             </div>
                        </div>
                    </MaterialSummary>
                </div>
            </div>
        </div>
        
        <CalculationHistory 
            calculatorId="moisture_gravity_tool" 
            currentInputs={{ mcW1, mcW2, mcW3, pycW1, pycW2, pycW3, pycW4, bulkDensity }} 
            currentResults={{
                "Moisture Content": `${results.mcPercent.toFixed(2)}%`,
                "Specific Gravity (Gs)": results.Gs.toFixed(3),
                "Dry Density": `${results.dryDensity.toFixed(3)} g/cm³`,
                "Void Ratio (e)": results.voidRatio.toFixed(3),
                "Degree of Saturation (S)": `${results.SPercent.toFixed(1)}%`
            }}
        />
    </div>
  );
}
