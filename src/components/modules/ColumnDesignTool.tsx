import React, { useState, useMemo } from 'react';
import { Columns, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Scatter, ResponsiveContainer, Legend } from 'recharts';

type EndCondition = "fixed-fixed" | "fixed-pinned" | "pinned-pinned" | "fixed-free";

const END_CONDITIONS: Record<EndCondition, { label: string; k: number }> = {
  "fixed-fixed": { label: "Both Ends Fixed (0.65L)", k: 0.65 },
  "fixed-pinned": { label: "One Fixed, One Pinned (0.8L)", k: 0.8 },
  "pinned-pinned": { label: "Both Ends Pinned (1.0L)", k: 1.0 },
  "fixed-free": { label: "One Fixed, One Free (2.0L)", k: 2.0 },
};

function generateInteractionCurve(B: number, D: number, fck: number, fy: number, Asc: number, cover: number) {
  const points = [];
  const As1 = Asc / 2; 
  const As2 = Asc / 2; 
  const d_prime = cover;
  const d = D - d_prime;

  const fyd = 0.87 * fy; 
  const Es = 200000;
  
  points.push({ M: 0, P: -fyd * Asc / 1000 });

  const xValues = [];
  for (let i = 0.05; i <= 2.5; i += 0.05) xValues.push(i * D);

  xValues.forEach(x => {
    let Cc = 0;
    let y_cc = D/2;

    if (x <= D) {
       Cc = 0.36 * fck * B * x;
       y_cc = D / 2 - 0.416 * x;
    } else {
       Cc = 0.45 * fck * B * D;
       y_cc = 0;
    }

    const esc = 0.0035 * (x - d_prime) / x;
    const est = 0.0035 * (x - d) / x; 

    const strain_c_top = 0.0035;
    const strain_s_top = strain_c_top * (x - d_prime) / x;
    const strain_s_bot = strain_c_top * (x - d) / x; 

    let f_s_top = strain_s_top * Es;
    if (f_s_top > fyd) f_s_top = fyd;
    if (f_s_top < -fyd) f_s_top = -fyd;

    let f_s_bot = strain_s_bot * Es;
    if (f_s_bot > fyd) f_s_bot = fyd;
    if (f_s_bot < -fyd) f_s_bot = -fyd;

    const Cs = (f_s_top - 0.45 * fck) * As1; 
    const Cb = (f_s_bot - (strain_s_bot > 0 ? 0.45 * fck : 0)) * As2; 

    const P = Cc + Cs + Cb; 
    const M = Cc * y_cc + Cs * (D / 2 - d_prime) + Cb * -(D / 2 - d_prime); 

    if (P > -fyd * Asc && P < (0.45 * fck * B * D + fyd * Asc)) {
        points.push({ M: Math.abs(M / 1e6), P: P / 1000 });
    }
  });

  const Puz = 0.45 * fck * (B * D - Asc) + 0.75 * fy * Asc;
  points.push({ M: 0, P: Puz / 1000 });

  return points.sort((a,b) => a.P - b.P);
}

export default function ColumnDesignTool() {
  const { settings } = useSettings();
  const [workingLoad, setWorkingLoad] = useState<number | "">(1000);
  const [safetyFactor, setSafetyFactor] = useState<number | "">(1.5);
  const [workingMoment, setWorkingMoment] = useState<number | "">(66.67);
  const [length, setLength] = useState<number | "">(3.0);
  const [endCondition, setEndCondition] = useState<EndCondition>("fixed-fixed");
  
  const [width, setWidth] = useState<number | "">(300);
  const [depth, setDepth] = useState<number | "">(450);
  const [fck, setFck] = useState<number | "">(25);
  const [fy, setFy] = useState<number | "">(500);
  
  const [rebarDia, setRebarDia] = useState<number | "">(20);
  const [rebarCount, setRebarCount] = useState<number | "">(8);
  const [cover, setCover] = useState<number | "">(40);

  const results = useMemo(() => {
    const w_load = Number(workingLoad) || 0;
    const w_mom = Number(workingMoment) || 0;
    const sf = Number(safetyFactor) || 1.5;
    const P = w_load * sf;
    const M = w_mom * sf;
    const L = Number(length) || 0;
    const B = Number(width) || 300;
    const D = Number(depth) || 450;
    const fc = Number(fck) || 25;
    const fsteel = Number(fy) || 500;
    const dia = Number(rebarDia) || 20;
    const nBars = Number(rebarCount) || 8;
    const c = Number(cover) || 40;

    const Asc = nBars * Math.PI * Math.pow(dia, 2) / 4;
    const pSteel = (Asc / (B * D)) * 100;

    const k = END_CONDITIONS[endCondition].k;
    const le = L * k;

    const ratioX = (le * 1000) / D;
    const isSlender = ratioX > 12;

    const ex_min = Math.max((L * 1000) / 500 + D / 30, 20);
    let designMoment = Math.max(M, P * ex_min / 1000);

    let additionalMoment = 0;
    if (isSlender) {
      const e_add = (Math.pow(le * 1000, 2) / (2000 * D));
      additionalMoment = P * e_add / 1000;
      designMoment += additionalMoment;
    }

    const curve = generateInteractionCurve(B, D, fc, fsteel, Asc, c);

    let maxCapacityM = 0;
    for(let i=0; i<curve.length-1; i++) {
        if(curve[i].P <= P && curve[i+1].P >= P) {
            maxCapacityM = curve[i].M + (curve[i+1].M - curve[i].M) * ((P - curve[i].P)/(curve[i+1].P - curve[i].P));
            break;
        }
    }
    
    // Check if outside top of curve
    if(P > curve[curve.length-1].P) maxCapacityM = 0;
    
    const isSafe = designMoment <= maxCapacityM && maxCapacityM > 0;

    return {
      le,
      ratioX,
      isSlender,
      ex_min,
      designMoment,
      additionalMoment,
      curve,
      Asc,
      pSteel,
      isSafe,
      maxCapacityM
    };
  }, [workingLoad, workingMoment, safetyFactor, length, endCondition, width, depth, fck, fy, rebarDia, rebarCount, cover]);

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
            <Columns className="text-rose-600" /> Column Design & P-M Interaction
         </h2>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Loads & Boundary</h3>
                  <div className="space-y-4">
                    <NumberInput label="Working Load (P)" unit="kN" value={workingLoad} onChange={setWorkingLoad} />
                    <NumberInput label="Working Moment (M)" unit="kNm" value={workingMoment} onChange={setWorkingMoment} />
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
                    <NumberInput label="Unsupported Length (L)" unit="m" value={length} onChange={setLength} />
                    
                    <div>
                        <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">End Condition</label>
                        <select 
                            value={endCondition}
                            onChange={(e) => setEndCondition(e.target.value as EndCondition)}
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-sm font-medium focus:outline-none"
                        >
                            {Object.entries(END_CONDITIONS).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Section & Materials</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Width (B)" unit="mm" value={width} onChange={setWidth} />
                    <NumberInput label="Depth (D)" unit="mm" value={depth} onChange={setDepth} />
                    <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} />
                    <NumberInput label="Steel (fy)" unit="MPa" value={fy} onChange={setFy} />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Reinforcement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Bar Dia" unit="mm" value={rebarDia} onChange={setRebarDia} />
                    <NumberInput label="No. of Bars" value={rebarCount} onChange={setRebarCount} />
                    <div className="col-span-2">
                        <NumberInput label="Clear Cover" unit="mm" value={cover} onChange={setCover} />
                    </div>
                  </div>
                </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
                <MaterialSummary 
                    title="Capacity & Verification"
                    totalLabel="Reinforcement Area"
                    totalValue={results.Asc.toFixed(0)}
                    totalUnit="mm²"
                    relatedToolIds={[]}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <ResultCard title="Effective Length" value={results.le.toFixed(2)} unit="m" variant="neutral" />
                        <ResultCard title="Ratio (le/D)" value={results.ratioX.toFixed(1)} unit={results.isSlender ? "Slender" : "Short"} variant={results.isSlender ? "primary" : "neutral"} />
                        <ResultCard title="Design Moment" value={results.designMoment.toFixed(1)} unit="kNm" variant="neutral" />
                        <ResultCard title="Steel %" value={results.pSteel.toFixed(2)} unit="%" variant={results.pSteel > 4 || results.pSteel < 0.8 ? "warning" : "neutral"} />
                    </div>

                    <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between border ${results.isSafe ? "bg-teal-50 border-teal-200" : "bg-rose-50 border-rose-200"}`}>
                        <div className="flex items-center gap-3">
                            {results.isSafe ? <CheckCircle2 className="text-teal-600 w-6 h-6" /> : <AlertTriangle className="text-rose-600 w-6 h-6" />}
                            <div>
                                <h4 className={`font-bold ${results.isSafe ? "text-teal-900" : "text-rose-900"}`}>
                                    {results.isSafe ? "Section is Safe" : "Section Fails"}
                                </h4>
                                <p className={`text-sm ${results.isSafe ? "text-teal-700" : "text-rose-700"}`}>
                                    Applied M: {results.designMoment.toFixed(1)} kNm | Capacity M: {results.maxCapacityM.toFixed(1)} kNm
                                </p>
                            </div>
                        </div>
                    </div>
                </MaterialSummary>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-6 flex-1 min-h-[400px] overflow-hidden">
                    <h3 className="mb-4 text-lg font-medium text-slate-800">P-M Interaction Diagram (IS 456)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                type="number" 
                                dataKey="M" 
                                name="Moment" 
                                label={{ value: 'Moment (kNm)', position: 'insideBottom', offset: -10 }} 
                            />
                            <YAxis 
                                type="number" 
                                dataKey="P" 
                                name="Axial Load" 
                                label={{ value: 'Axial Load (kN)', angle: -90, position: 'insideLeft' }} 
                            />
                            <RechartsTooltip cursor={{strokeDasharray: '3 3'}} formatter={(value: any) => value.toFixed(1)} />
                            <Legend verticalAlign="top" height={36} />
                            
                            <Line 
                                data={results.curve} 
                                type="monotone" 
                                dataKey="P" 
                                stroke="#e11d48" 
                                strokeWidth={3} 
                                dot={false} 
                                name="Capacity Envelope" 
                                isAnimationActive={false}
                            />
                            
                            <Scatter 
                                name="Applied Load (Pu, Mu)" 
                                data={[{ M: results.designMoment, P: (Number(workingLoad) * Number(safetyFactor)) || 0 }]} 
                                fill={results.isSafe ? "#FFFFFF" : "#e11d48"} 
                                shape="circle"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </div>
      </div>
    
      <CalculationHistory 
        calculatorId="column_interaction" 
        currentInputs={{ workingLoad, workingMoment, safetyFactor, length, endCondition, width, depth, fck, fy, rebarDia, rebarCount }} 
      />
    </div>
  );
}
