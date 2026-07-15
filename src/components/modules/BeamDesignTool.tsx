import React, { useState, useMemo } from 'react';
import { Layers, Activity, ShieldCheck, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';

type SupportCondition = "simply-supported" | "continuous" | "cantilever";

const SUPPORT_CONDITIONS: Record<SupportCondition, { label: string; basicLd: number }> = {
  "simply-supported": { label: "Simply Supported", basicLd: 20 },
  "continuous": { label: "Continuous", basicLd: 26 },
  "cantilever": { label: "Cantilever", basicLd: 7 },
};

const TAU_C_MAX: Record<number, number> = {
  20: 2.8,
  25: 3.1,
  30: 3.5,
  35: 3.7,
  40: 4.0,
};

const TAU_BD_BASIC: Record<number, number> = {
  20: 1.2,
  25: 1.4,
  30: 1.5,
  35: 1.7,
  40: 1.9,
};

function getTauCMax(fck: number) {
  if (fck <= 20) return 2.8;
  if (fck >= 40) return 4.0;
  return TAU_C_MAX[fck] || (2.8 + (fck - 20) * (4.0 - 2.8) / 20); // linear interp fallback
}

function getTauBdBasic(fck: number) {
  if (fck <= 20) return 1.2;
  if (fck >= 40) return 1.9;
  return TAU_BD_BASIC[fck] || (1.2 + (fck - 20) * (1.9 - 1.2) / 20); 
}

function calculateTauC(pt: number, fck: number) {
  const p = Math.min(Math.max(pt, 0.15), 3.0);
  const beta = (0.8 * fck) / (6.89 * p);
  const tau_c = (0.85 * Math.sqrt(0.8 * fck) * (Math.sqrt(1 + 5 * beta) - 1)) / (6 * beta);
  return tau_c;
}

export default function BeamDesignTool() {
  const { settings } = useSettings();
  const [span, setSpan] = useState<number | "">(5);
  const [workingLoad, setWorkingLoad] = useState<number | "">(16.67);
  const [safetyFactor, setSafetyFactor] = useState<number | "">(1.5);
  const [width, setWidth] = useState<number | "">(250);
  const [depth, setDepth] = useState<number | "">(450);
  const [cover, setCover] = useState<number | "">(40); // Nominal cover
  
  const [fck, setFck] = useState<number | "">(25);
  const [fy, setFy] = useState<number | "">(500);
  const [supportCondition, setSupportCondition] = useState<SupportCondition>("simply-supported");

  const [mainDia, setMainDia] = useState<number | "">(16);
  const [stirrupDia, setStirrupDia] = useState<number | "">(8);
  const [stirrupLegs, setStirrupLegs] = useState<number | "">(2);

  const results = useMemo(() => {
    const L = Number(span) || 0;
    const w_working = Number(workingLoad) || 0;
    const sf = Number(safetyFactor) || 1.5;
    const W = w_working * sf;
    const B = Number(width) || 250;
    const D = Number(depth) || 500;
    const c = Number(cover) || 40;
    const fc = Number(fck) || 25;
    const fsteel = Number(fy) || 500;
    const d_main = Number(mainDia) || 16;
    const d_stirrup = Number(stirrupDia) || 8;
    const legs = Number(stirrupLegs) || 2;

    const d = D - c - d_main / 2; // Effective depth

    let Mu = 0;
    let Vu = 0;
    if (supportCondition === "simply-supported" || supportCondition === "continuous") {
      Mu = (W * L * L) / 8;
      Vu = (W * L) / 2;
    } else {
      Mu = (W * L * L) / 2;
      Vu = W * L;
    }

    let xu_max_ratio = 0.46; // for Fe500
    if (fsteel <= 250) xu_max_ratio = 0.53;
    else if (fsteel <= 415) xu_max_ratio = 0.48;
    else if (fsteel <= 500) xu_max_ratio = 0.46;
    else xu_max_ratio = 0.44;

    const R_lim = 0.36 * fc * xu_max_ratio * (1 - 0.416 * xu_max_ratio);
    const Mu_lim = R_lim * B * d * d / 1e6; // kNm

    let isDoublyReinforced = Mu > Mu_lim;
    let Ast = 0;
    let Asc = 0;

    let Mu1 = Math.min(Mu, Mu_lim);
    const sqrtTerm = Math.max(0, 1 - (4.6 * Mu1 * 1e6) / (fc * B * d * d));
    let Ast1 = (0.5 * fc / fsteel) * (1 - Math.sqrt(sqrtTerm)) * B * d;

    if (isDoublyReinforced) {
       const Mu2 = Mu - Mu_lim;
       const d_prime = c + d_main/2; // assuming same cover for compression steel
       // Approx fsc = 0.87 * fy 
       const fsc = 0.87 * fsteel;
       const Ast2 = (Mu2 * 1e6) / (0.87 * fsteel * (d - d_prime));
       Asc = (Mu2 * 1e6) / ((fsc - 0.45 * fc) * (d - d_prime));
       Ast = Ast1 + Ast2;
    } else {
       Ast = Ast1;
    }

    const pt_req = (Ast / (B * d)) * 100;
    const min_Ast = (0.85 * B * d) / fsteel;
    if (Ast < min_Ast) Ast = min_Ast;

    // We will assume provided Ast is close to required for deflection and shear calculations
    // But realistically it is in multiples of bar area.
    const a_st_bar = Math.PI * Math.pow(d_main, 2) / 4;
    const numBars = Math.ceil(Ast / a_st_bar);
    const Ast_prov = numBars * a_st_bar;
    const pt_prov = (Ast_prov / (B * d)) * 100;

    // Deflection Check
    const fs = 0.58 * fsteel * (Ast / Ast_prov);
    let kt = 1 / (0.225 + 0.0032 * fs + 0.625 * Math.log10(Math.max(pt_prov, 0.001)));
    kt = Math.min(Math.max(kt, 0.0), 2.0); // limits
    
    // basic ratio
    let basicLdRatio = SUPPORT_CONDITIONS[supportCondition].basicLd;
    const allowable_L_d = basicLdRatio * kt;
    const actual_L_d = (L * 1000) / d;
    const deflectionSafe = actual_L_d <= allowable_L_d;

    // Shear Check
    const tau_v = (Vu * 1000) / (B * d);
    const tau_c_max = getTauCMax(fc);
    const tau_c = calculateTauC(pt_prov, fc);
    
    let shearSafe = tau_v <= tau_c_max;
    let reqSv = 0;
    let providedSvStr = "";
    
    const Asv = legs * Math.PI * Math.pow(d_stirrup, 2) / 4;
    const max_sv = Math.min(0.75 * d, 300);

    if (!shearSafe) {
        providedSvStr = "Section unsafe in shear (Redesign)";
    } else {
        if (tau_v <= tau_c) {
            // Minimum shear reinforcement
            reqSv = (0.87 * fsteel * Asv) / (0.4 * B);
            reqSv = Math.min(reqSv, max_sv);
            providedSvStr = `Nominal: ${legs}-L ${d_stirrup}mm @ ${Math.floor(reqSv/10)*10} c/c`;
        } else {
            // Design for shear
            const Vus = Vu * 1000 - tau_c * B * d;
            reqSv = (0.87 * fsteel * Asv * d) / Vus;
            reqSv = Math.min(reqSv, max_sv);
            // Minimum check
            const minSv = (0.87 * fsteel * Asv) / (0.4 * B);
            reqSv = Math.min(reqSv, minSv);
            
            providedSvStr = `${legs}-L ${d_stirrup}mm @ ${Math.floor(reqSv/10)*10} c/c`;
        }
    }

    // Development Length Ld
    let tau_bd = getTauBdBasic(fc);
    // 60% increase for deformed bars (Fe415/500/550)
    if (fsteel > 250) tau_bd *= 1.6;
    const Ld = (0.87 * fsteel * d_main) / (4 * tau_bd);

    return {
      Mu, Vu,
      Mu_lim,
      isDoublyReinforced,
      Ast, Asc,
      Ast_prov, numBars,
      deflectionSafe, actual_L_d, allowable_L_d,
      tau_v, tau_c, tau_c_max, shearSafe, providedSvStr,
      Ld
    };

  }, [span, workingLoad, safetyFactor, width, depth, cover, fck, fy, supportCondition, mainDia, stirrupDia, stirrupLegs]);

  const handleAiSafetyFactor = () => {
    let sf = 1.5;
    if (settings.projectType === 'Commercial' || settings.projectType === 'Industrial') {
        sf = 1.6;
    } else if (settings.projectType === 'Residential') {
        sf = 1.5;
    }
    setSafetyFactor(sf);
  };

  return (
    <div className="flex flex-col gap-8 w-full md:max-w-5xl md:mx-auto animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
         <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
            <Layers className="text-rose-600" /> Beam Design (Limit State - IS 456)
         </h2>
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Geometry & Loading</h3>
                  <div className="space-y-4">
                    <NumberInput label="Effective Span (L)" unit="m" value={span} onChange={setSpan} />
                    <NumberInput label="Working Load (w)" unit="kN/m" value={workingLoad} onChange={setWorkingLoad} />
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <NumberInput label="Safety Factor (γf)" value={safetyFactor} onChange={setSafetyFactor} />
                      </div>
                      <button onClick={handleAiSafetyFactor}
                        className="h-11 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors shadow-sm text-base font-semibold active:scale-95 hover:-translate-y-0.5"
                        title="AI-Suggested Safety Factor based on Project Settings"
                      >
                        <Sparkles className="w-4 h-4 mr-1.5" /> AI Suggest
                      </button>
                    </div>
                    <NumberInput label="Width (b)" unit="mm" value={width} onChange={setWidth} />
                    <NumberInput label="Overall Depth (D)" unit="mm" value={depth} onChange={setDepth} />
                    
                    <div>
                        <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">Support Condition</label>
                        <select 
                            value={supportCondition}
                            onChange={(e) => setSupportCondition(e.target.value as SupportCondition)}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-sm font-medium focus:outline-none"
                        >
                            {Object.entries(SUPPORT_CONDITIONS).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Materials & Reinforcement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} />
                    <NumberInput label="Steel (fy)" unit="MPa" value={fy} onChange={setFy} />
                    <NumberInput label="Main Bar Dia" unit="mm" value={mainDia} onChange={setMainDia} />
                    <NumberInput label="Cover" unit="mm" value={cover} onChange={setCover} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <NumberInput label="Stirrup Dia" unit="mm" value={stirrupDia} onChange={setStirrupDia} />
                    <NumberInput label="Stirrup Legs" value={stirrupLegs} onChange={setStirrupLegs} />
                  </div>
                </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
                <MaterialSummary 
                    title="Design Forces & Flexure"
                    totalLabel="Required Main Tension Steel (Ast)"
                    totalValue={results.Ast.toFixed(0)}
                    totalUnit="mm²"
                    relatedToolIds={[]}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <ResultCard title="Design Moment" value={results.Mu.toFixed(1)} unit="kNm" variant="neutral" />
                        <ResultCard title="Limiting Moment" value={results.Mu_lim.toFixed(1)} unit="kNm" variant="neutral" />
                        <ResultCard title="Design Shear" value={results.Vu.toFixed(1)} unit="kN" variant="neutral" />
                        <ResultCard 
                            title="Section Type" 
                            value={results.isDoublyReinforced ? "Doubly" : "Singly"} 
                            unit="Reinforced" 
                            variant={results.isDoublyReinforced ? "warning" : "primary"} 
                        />
                    </div>
                    
                    {results.isDoublyReinforced && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 overflow-hidden">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-orange-900 mb-1 text-base font-normal text-slate-600 leading-relaxed">Doubly Reinforced Section</p>
                          <p className="text-blue-700 text-base font-normal text-slate-600 leading-relaxed">Moment exceeds limiting moment capacity. Compression steel (Asc) required: <strong className="font-mono">{results.Asc.toFixed(0)} mm²</strong>.</p>
                        </div>
                      </div>
                    )}
                </MaterialSummary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Deflection Check */}
                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${results.deflectionSafe ? "bg-teal-50 border-teal-200" : "bg-rose-50 border-rose-200"}`}>
                       <div className="flex items-center gap-2">
                          {results.deflectionSafe ? <CheckCircle2 className="text-teal-600 w-5 h-5" /> : <AlertTriangle className="text-rose-600 w-5 h-5" />}
                          <h3 className={`font-bold ${results.deflectionSafe ? "text-teal-900" : "text-rose-900"}`}>Deflection Control</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.deflectionSafe ? "text-teal-700" : "text-rose-700"}>Actual (L/d)</span>
                            <span className={`font-mono font-bold ${results.deflectionSafe ? "text-teal-900" : "text-rose-900"}`}>{results.actual_L_d.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.deflectionSafe ? "text-teal-700" : "text-rose-700"}>Allowable (L/d)</span>
                            <span className={`font-mono font-bold ${results.deflectionSafe ? "text-teal-900" : "text-rose-900"}`}>{results.allowable_L_d.toFixed(2)}</span>
                          </div>
                          <p className={`text-sm mt-2 ${results.deflectionSafe ? "text-teal-600" : "text-rose-600"}`}>
                             *Allowable ratio incorporates modification factor for tension steel.
                          </p>
                       </div>
                    </div>

                    {/* Shear & Dev Length */}
                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${results.shearSafe ? "bg-slate-50 border-slate-200" : "bg-rose-50 border-rose-200"}`}>
                       <div className="flex items-center gap-2">
                          {results.shearSafe ? <ShieldCheck className="text-slate-600 w-5 h-5" /> : <AlertTriangle className="text-rose-600 w-5 h-5" />}
                          <h3 className={`font-bold ${results.shearSafe ? "text-slate-900" : "text-rose-900"}`}>Shear & Anchorage</h3>
                       </div>
                       <div className="space-y-3 flex-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.shearSafe ? "text-slate-600" : "text-rose-700"}>Nominal Shear (τv)</span>
                            <span className={`font-mono font-bold ${results.shearSafe ? "text-slate-900" : "text-rose-900"}`}>{results.tau_v.toFixed(2)} MPa</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className={results.shearSafe ? "text-slate-600" : "text-rose-700"}>Concrete Capacity (τc)</span>
                            <span className={`font-mono font-bold ${results.shearSafe ? "text-slate-900" : "text-rose-900"}`}>{results.tau_c.toFixed(2)} MPa</span>
                          </div>
                          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                            <span className={results.shearSafe ? "text-slate-800 font-medium" : "text-rose-800 font-medium"}>Stirrup Spacing</span>
                            <span className={`text-sm font-mono font-bold px-2 py-1 rounded bg-white border ${results.shearSafe ? "border-slate-200 text-slate-800" : "border-rose-200 text-rose-800"}`}>{results.providedSvStr}</span>
                          </div>
                           <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 mt-2">
                            <span className={results.shearSafe ? "text-slate-800 font-medium" : "text-rose-800 font-medium"}>Dev. Length (Ld)</span>
                            <span className={`text-sm font-mono font-bold ${results.shearSafe ? "text-slate-800" : "text-rose-800"}`}>{Math.ceil(results.Ld)} mm</span>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
         </div>
      </div>
    
      <CalculationHistory 
        calculatorId="beam_design" 
        currentInputs={{ span, workingLoad, safetyFactor, width, depth, cover, fck, fy, supportCondition, mainDia, stirrupDia, stirrupLegs }} 
      />
    </div>
  );
}

