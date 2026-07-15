import React, { useState, useMemo } from "react";
import { Droplets, Activity, Calculator, Filter } from "lucide-react";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SEO } from "../SEO";

export default function PermeabilityCalculator() {
  const [testMethod, setTestMethod] = useState<"constant" | "falling">("constant");

  // Common Inputs
  const [lengthSample, setLengthSample] = useState<number | "">(10); // cm
  const [areaSample, setAreaSample] = useState<number | "">(50); // cm²
  const [temperature, setTemperature] = useState<number | "">(20); // °C

  // Constant Head Inputs
  const [qVolume, setQVolume] = useState<number | "">(500); // cm³
  const [constantHead, setConstantHead] = useState<number | "">(50); // cm
  const [timeConstant, setTimeConstant] = useState<number | "">(60); // sec

  // Falling Head Inputs
  const [areaStandpipe, setAreaStandpipe] = useState<number | "">(5); // cm²
  const [headInitial, setHeadInitial] = useState<number | "">(100); // cm
  const [headFinal, setHeadFinal] = useState<number | "">(50); // cm
  const [timeFalling, setTimeFalling] = useState<number | "">(120); // sec

  // Approximate viscosity of water relative to 20°C. 
  // R_t = Viscosity at T / Viscosity at 20°C
  // An empirical formula for viscosity ratio of water: 
  // R_t ≈ 2.24 / (1 + 0.033 * T + 0.00022 * T^2)  [very rough approx]
  // A better simpler widely used table fit for 10-30C:
  // Rt(T) = exp(-0.024 * (T - 20)) as a generic approximation, 
  // or let's use a standard lookup table interpolated.
  const getTemperatureCorrectionFactor = (T: number) => {
    // Dynamic Viscosity of water at 20C is ~1.002 mPa.s
    // Simple interpolation formula for viscosity correction factor Rt:
    // Rt = viscosity_T / viscosity_20
    // Using an approximation: Rt = 1 - 0.023*(T - 20) + 0.0002*(T - 20)^2
    const deltaT = T - 20;
    return 1 - 0.023 * deltaT + 0.0002 * Math.pow(deltaT, 2);
  };

  const results = useMemo(() => {
    let k = 0;
    
    const L = Number(lengthSample) || 0;
    const A = Number(areaSample) || 0;
    const T = Number(temperature) || 20;

    if (testMethod === "constant") {
      const Q = Number(qVolume) || 0;
      const h = Number(constantHead) || 0;
      const t = Number(timeConstant) || 0;
      
      if (A * h * t > 0) {
        k = (Q * L) / (A * h * t);
      }
    } else {
      const a = Number(areaStandpipe) || 0;
      const t = Number(timeFalling) || 0;
      const h1 = Number(headInitial) || 0;
      const h2 = Number(headFinal) || 0;
      
      if (A * t > 0 && h1 > 0 && h2 > 0 && h1 >= h2) {
        k = 2.303 * ((a * L) / (A * t)) * Math.log10(h1 / h2);
      }
    }

    const Rt = getTemperatureCorrectionFactor(T);
    const k20 = k * Rt;

    let soilClass = "Unknown";
    if (k20 > 1e-1) soilClass = "Clean Gravel (High Permeability)";
    else if (k20 > 1e-3) soilClass = "Clean Sands, Clean Sand and Gravel Mixtures (Medium)";
    else if (k20 > 1e-5) soilClass = "Very Fine Sands, Organic and Inorganic Silts (Low)";
    else if (k20 > 1e-7) soilClass = "Homogeneous Clays below zone of weathering (Very Low)";
    else if (k20 > 0) soilClass = "Practically Impervious";

    return {
      k,
      k20,
      Rt,
      soilClass
    };
  }, [testMethod, qVolume, lengthSample, areaSample, constantHead, timeConstant, areaStandpipe, timeFalling, headInitial, headFinal, temperature]);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in">
        <SEO 
            title="Permeability Coefficient Calculator (k) | Geotechnical Estimator" 
            description="Process constant head and falling head laboratory data to compute soil permeability with temperature corrections (Darcy's Law)."
        />

        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
                <Droplets className="w-6 h-6 text-blue-600" />
                Permeability Coefficient Engine
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                    <div>
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setTestMethod("constant")}
                                className={`flex-1 px-3 py-2 rounded-lg text-base font-medium transition-all ${
                                    testMethod === "constant" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Constant Head
                            </button>
                            <button
                                onClick={() => setTestMethod("falling")}
                                className={`flex-1 px-3 py-2 rounded-lg text-base font-medium transition-all ${
                                    testMethod === "falling" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                Falling Head
                            </button>
                        </div>

                        <h3 className="text-base font-medium mb-3 border-b border-slate-100 pb-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Sample Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Sample Length (L)" unit="cm" value={lengthSample} onChange={setLengthSample} />
                            <NumberInput label="Sample Area (A)" unit="cm²" value={areaSample} onChange={setAreaSample} />
                            <div className="col-span-2">
                                <NumberInput label="Test Temperature (T)" unit="°C" value={temperature} onChange={setTemperature} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-medium mb-3 border-b border-slate-100 pb-2">
                            {testMethod === "constant" ? "Constant Head Data" : "Falling Head Data"}
                        </h3>
                        <div className="space-y-4">
                            {testMethod === "constant" ? (
                                <>
                                    <NumberInput label="Volume Collected (Q)" unit="cm³" value={qVolume} onChange={setQVolume} />
                                    <NumberInput label="Constant Head (h)" unit="cm" value={constantHead} onChange={setConstantHead} />
                                    <NumberInput label="Time Duration (t)" unit="sec" value={timeConstant} onChange={setTimeConstant} />
                                </>
                            ) : (
                                <>
                                    <NumberInput label="Standpipe Area (a)" unit="cm²" value={areaStandpipe} onChange={setAreaStandpipe} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <NumberInput label="Initial Head (h₁)" unit="cm" value={headInitial} onChange={setHeadInitial} />
                                        <NumberInput label="Final Head (h₂)" unit="cm" value={headFinal} onChange={setHeadFinal} />
                                    </div>
                                    <NumberInput label="Time Interval (t)" unit="sec" value={timeFalling} onChange={setTimeFalling} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                    <MaterialSummary 
                        title="Permeability Analysis (k)"
                        totalLabel="Standard Permeability (k₂₀)"
                        totalValue={results.k20 > 0 ? results.k20.toExponential(3) : "0"}
                        totalUnit="cm/s"
                    >
                        <div className="mt-6 flex flex-col gap-4">
                             <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between overflow-hidden">
                                 <div>
                                     <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Soil Classification</span>
                                     <span className="text-base font-medium">{results.soilClass}</span>
                                 </div>
                                 <Filter className="w-8 h-8 text-blue-500/50" />
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="bg-white border border-slate-200 p-4 rounded-2xl overflow-hidden">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Raw Permeability (k_T)</span>
                                     <span className="text-lg font-mono font-bold text-slate-700">{results.k > 0 ? results.k.toExponential(3) : "0"} cm/s</span>
                                 </div>
                                 <div className="bg-white border border-slate-200 p-4 rounded-2xl overflow-hidden">
                                     <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Viscosity Correction (Rt)</span>
                                     <span className="text-lg font-mono font-bold text-slate-700">{results.Rt.toFixed(3)}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="mt-8 border-t border-blue-100 pt-6">
                             <h4 className="text-base font-medium text-blue-900 flex items-center gap-2 mb-4">
                                 <Calculator className="w-4 h-4" /> Darcy's Law Application
                             </h4>
                             {testMethod === "constant" ? (
                                <div className="text-[11px] font-medium text-blue-800/80 space-y-2">
                                  <p>The constant head test relies on a steady continuous flow through the sample.</p>
                                  <div className="font-mono bg-blue-100/50 p-2 rounded block">k = (Q × L) / (A × h × t)</div>
                                  <p>Where <strong>Q</strong> = Volume collected, <strong>L</strong> = Sample length, <strong>A</strong> = Sample area, <strong>h</strong> = Hydraulic head.</p>
                                </div>
                             ) : (
                                <div className="text-[11px] font-medium text-blue-800/80 space-y-2">
                                  <p>The falling head test tracks the drop of hydraulic head in a standpipe over time for fine-grained soils.</p>
                                  <div className="font-mono bg-blue-100/50 p-2 rounded block">k = 2.303 × (a × L) / (A × t) × log₁₀(h₁ / h₂)</div>
                                  <p>Where <strong>a</strong> = Standpipe area, <strong>L</strong> = Sample length, <strong>A</strong> = Sample area, <strong>h₁</strong>, <strong>h₂</strong> = Heads.</p>
                                </div>
                             )}
                             <p className="text-[10px] text-blue-600/70 mt-3 font-semibold uppercase tracking-wider">Note: Final k is corrected to equivalent water viscosity at 20°C (k₂₀ = k_T × R_T).</p>
                        </div>
                    </MaterialSummary>
                </div>
            </div>
        </div>
        
        <CalculationHistory 
            calculatorId="permeability_calculator" 
            currentInputs={{ testMethod, lengthSample, areaSample, temperature, ...(testMethod === 'constant' ? { qVolume, constantHead, timeConstant } : { areaStandpipe, headInitial, headFinal, timeFalling }) }} 
            currentResults={{
                "Standard Permeability (k20)": results.k20 > 0 ? `${results.k20.toExponential(3)} cm/s` : "0 cm/s",
                "Raw Permeability (kT)": results.k > 0 ? `${results.k.toExponential(3)} cm/s` : "0 cm/s",
                "Viscosity Correction": results.Rt.toFixed(3),
                "Soil Classification": results.soilClass
            }}
        />
    </div>
  );
}

