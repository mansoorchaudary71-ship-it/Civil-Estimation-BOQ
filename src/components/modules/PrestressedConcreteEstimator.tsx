import React, { useState } from 'react';
import { Layers, Calculator } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { MaterialSummary } from '../ui/MaterialSummary';

export default function PrestressedConcreteEstimator() {
  const [spanL, setSpanL] = useState<number | "">(20); // m
  const [area, setArea] = useState<number | "">(150000); // mm2
  const [inertia, setInertia] = useState<number | "">(2.8e9); // mm4
  const [eccentricity, setEccentricity] = useState<number | "">(250); // mm

  const [ptForce, setPtForce] = useState<number | "">(1000); // kN
  const [areaSteel, setAreaSteel] = useState<number | "">(800); // mm2
  const [es, setEs] = useState<number | "">(210000); // MPa
  const [ec, setEc] = useState<number | "">(35000); // MPa

  const [type, setType] = useState<"Pre-tensioned" | "Post-tensioned">("Post-tensioned");
  const [slip, setSlip] = useState<number | "">(2); // mm
  const [mu, setMu] = useState<number | "">(0.3); // per rad
  const [k, setK] = useState<number | "">(0.0015); // per m
  
  const [creep, setCreep] = useState<number | "">(1.6);
  const [shrinkage, setShrinkage] = useState<number | "">(0.0003); // 3x10^-4
  const [relaxationPct, setRelaxationPct] = useState<number | "">(3); // %

  const calculateLosses = () => {
    const L = Number(spanL);
    const A = Number(area);
    const I = Number(inertia);
    const e = Number(eccentricity);
    const P0 = Number(ptForce) * 1000; // N
    const Ap = Number(areaSteel);
    const Es = Number(es);
    const Ec = Number(ec);
    
    if (!L || !A || !I || !P0 || !Ap || !Es || !Ec) return null;

    const initialStress = P0 / Ap; // MPa

    let lossFriction = 0;
    let lossSlip = 0;
    
    if (type === "Post-tensioned") {
      // Parabolic tendon, jacked from one end
      // alpha = 8 * e / L (total angle change over length L)
      const alpha = 8 * (e / 1000) / L; // radians
      const px = P0 * Math.exp(-(Number(mu) * alpha + Number(k) * L));
      lossFriction = (P0 - px) / Ap; 

      // Anchorage slip
      // Simple uniform assumption: Delta = PL / AE => stress loss = Delta E / L
      lossSlip = (Number(slip) * Es) / (L * 1000);
    }

    const piAfterImmediate = P0 - (lossFriction * Ap) - (lossSlip * Ap);

    // Elastic Shortening
    // stress in concrete at steel level
    const fc = piAfterImmediate / A + (piAfterImmediate * e * e) / I;
    const modularRatio = Es / Ec;
    
    let lossElastic = 0;
    if (type === "Pre-tensioned") {
      lossElastic = modularRatio * fc;
    } else {
      // Post-tensioned: assuming sequential tensioning of multiple wires (average loss is half)
      lossElastic = 0.5 * modularRatio * fc; 
    }

    // Time-dependent losses
    const lossCreep = Number(creep) * modularRatio * fc;
    const lossShrinkage = Number(shrinkage) * Es;
    const lossRelaxation = (Number(relaxationPct) / 100) * initialStress;

    const totalLoss = lossFriction + lossSlip + lossElastic + lossCreep + lossShrinkage + lossRelaxation;
    const finalStress = initialStress - totalLoss;
    const pctLoss = (totalLoss / initialStress) * 100;

    return {
      initialStress,
      lossFriction,
      lossSlip,
      lossElastic,
      lossCreep,
      lossShrinkage,
      lossRelaxation,
      totalLoss,
      finalStress,
      pctLoss
    };
  };

  const results = calculateLosses();

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-4xl md:mx-auto px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
         <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="text-pink-600" /> Pre-stressed Concrete Estimator
         </h2>
         <div className="p-4 sm:p-6 bg-pink-50 dark:bg-pink-900/20 rounded-[24px] border border-pink-100 dark:border-pink-900 text-center mb-6 overflow-hidden">
            <p className="text-pink-800 dark:text-pink-200 font-medium">Evaluate tendon profiles, compute prestress losses (friction, anchorage slip, elastic shortening), and design sections per IS 1343:2012.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
             <div>
               <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Geometry</h3>
               <div className="grid grid-cols-2 gap-4">
                 <NumberInput label="Span Length" unit="m" value={spanL} onChange={setSpanL} />
                 <NumberInput label="Eccentricity (Mid)" unit="mm" value={eccentricity} onChange={setEccentricity} />
                 <NumberInput label="Section Area" unit="mm²" value={area} onChange={setArea} />
                 <NumberInput label="Moment of Inertia" unit="mm⁴" value={inertia} onChange={setInertia} />
               </div>
             </div>

             <div>
               <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Material & Force</h3>
               <div className="grid grid-cols-2 gap-4">
                 <NumberInput label="Jacking Force (P0)" unit="kN" value={ptForce} onChange={setPtForce} />
                 <NumberInput label="Tendon Area (Ap)" unit="mm²" value={areaSteel} onChange={setAreaSteel} />
                 <NumberInput label="Steel Modulus (Es)" unit="MPa" value={es} onChange={setEs} />
                 <NumberInput label="Concrete Modulus (Ec)" unit="MPa" value={ec} onChange={setEc} />
               </div>
             </div>

             <div>
               <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Loss Parameters</h3>
               
               <div className="mb-4">
                 <label className="text-base font-medium uppercase tracking-wider mb-2 block">System Type</label>
                 <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                      <><label htmlFor="a11y-input-376" className="sr-only">Input</label>
<input id="a11y-input-376" type="radio" checked={type === "Pre-tensioned"} onChange={() => setType("Pre-tensioned")} className="w-4 h-4 text-pink-600" /></>
                      Pre-tensioned
                    </label>
                    <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                      <><label htmlFor="a11y-input-377" className="sr-only">Input</label>
<input id="a11y-input-377" type="radio" checked={type === "Post-tensioned"} onChange={() => setType("Post-tensioned")} className="w-4 h-4 text-pink-600" /></>
                      Post-tensioned
                    </label>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 {type === "Post-tensioned" && (
                   <>
                     <NumberInput label="Anchorage Slip" unit="mm" value={slip} onChange={setSlip} />
                     <NumberInput label="Friction Coeff (μ)" unit="/rad" value={mu} onChange={setMu} />
                     <NumberInput label="Wobble (K)" unit="/m" value={k} onChange={setK} />
                   </>
                 )}
                 <NumberInput label="Creep Coeff (φ)" value={creep} onChange={setCreep} />
                 <NumberInput label="Shrinkage Strain" value={shrinkage} onChange={setShrinkage} />
                 <NumberInput label="Relaxation" unit="%" value={relaxationPct} onChange={setRelaxationPct} />
               </div>
             </div>
           </div>

           <div>
             {results && (
              <MaterialSummary 
                title="Prestress Loss Estimation" 
                totalLabel="Total Prestress Loss"
                totalValue={results.totalLoss.toFixed(1)}
                totalUnit="MPa"
                relatedToolIds={[]}
              >
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                    <p className="text-base font-medium mb-1">Initial Stress</p>
                    <p className="text-xl font-bold text-slate-800">{results.initialStress.toFixed(1)} MPa</p>
                  </div>
                  <div className="p-4 bg-pink-50 border border-pink-100 rounded-2xl overflow-hidden">
                    <p className="text-base font-medium text-pink-500 mb-1">Final Effective Stress</p>
                    <p className="text-xl font-bold text-pink-700">{results.finalStress.toFixed(1)} MPa</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Losses Breakdown</h4>
                  
                  {type === "Post-tensioned" && (
                    <>
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-600">Friction Loss</span>
                        <span className="font-mono font-bold text-slate-800">{results.lossFriction.toFixed(2)} MPa</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-600">Anchorage Slip</span>
                        <span className="font-mono font-bold text-slate-800">{results.lossSlip.toFixed(2)} MPa</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600">Elastic Shortening</span>
                    <span className="font-mono font-bold text-slate-800">{results.lossElastic.toFixed(2)} MPa</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600">Creep (Concrete)</span>
                    <span className="font-mono font-bold text-slate-800">{results.lossCreep.toFixed(2)} MPa</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600">Shrinkage (Concrete)</span>
                    <span className="font-mono font-bold text-slate-800">{results.lossShrinkage.toFixed(2)} MPa</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600">Steel Relaxation</span>
                    <span className="font-mono font-bold text-slate-800">{results.lossRelaxation.toFixed(2)} MPa</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total Prestress Loss</span>
                    <div className="text-right">
                       <span className="font-mono font-bold text-xl text-rose-600 block">{results.totalLoss.toFixed(1)} MPa</span>
                       <span className="text-base font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full block mt-1">
                         {results.pctLoss.toFixed(1)}% of Initial
                       </span>
                    </div>
                  </div>
                </div>
              </MaterialSummary>
             )}
           </div>
         </div>
      </div>
    
      <CalculationHistory 
        calculatorId="prestressed_concrete" 
        currentInputs={{
          spanL, area, inertia, eccentricity, ptForce, areaSteel, es, ec,
          type, slip, mu, k, creep, shrinkage, relaxationPct
        }} 
      />
    </div>
  );
}

