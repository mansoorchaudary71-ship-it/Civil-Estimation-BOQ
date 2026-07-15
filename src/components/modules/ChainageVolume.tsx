import React, { useState, useMemo } from "react";
import {
  Truck,
  Calculator,
  Ruler,
  Hash,
  Plus,
  Layers,
  ArrowRight,
  Trash2,
  Map,
  LayoutTemplate,
  Mountain,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { v4 as uuidv4 } from "uuid";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

import { FieldTooltip } from "../ui/FieldTooltip";

interface Station {
  id: string;
  chainage: string;
  ngl: string;
  fl: string;
  areaCut?: number;
  areaFill?: number;
}

export default function ChainageVolumeEstimator() {
  const { settings } = useSettings();
  const isMetric = settings.measurement === "SI";
  const unitL = isMetric ? "m" : "ft";
  const unitA = isMetric ? "m²" : "ft²";
  const unitV = isMetric ? "m³" : "ft³";
  
  const [formationWidth, setFormationWidth] = useState<number | "">(10);
  const [cutSlope, setCutSlope] = useState<number | "">(1.5);
  const [fillSlope, setFillSlope] = useState<number | "">(2.0);
  
  const [method, setMethod] = useState<"trapezoidal" | "simpson">("trapezoidal");
  const [swellFactor, setSwellFactor] = useState<number | "">(15); // Bulking
  const [shrinkFactor, setShrinkFactor] = useState<number | "">(10); // Shrinkage

  const [stations, setStations] = useState<Station[]>([
    { id: uuidv4(), chainage: "0", ngl: "100", fl: "100" },
    { id: uuidv4(), chainage: "30", ngl: "102", fl: "100" },
    { id: uuidv4(), chainage: "60", ngl: "98", fl: "100" },
    { id: uuidv4(), chainage: "90", ngl: "99", fl: "100" },
  ]);

  const parseChainage = (val: string) => {
    const clean = val.replace(/\s/g, "");
    if (clean.includes("+")) {
      const parts = clean.split("+");
      return parseFloat(parts.join("")) || 0;
    }
    return parseFloat(clean) || 0;
  };

  const handleUpdateStation = (id: string, field: keyof Station, value: string) => {
    setStations(stations.map((st) => (st.id === id ? { ...st, [field]: value } : st)));
  };

  const addStation = () => {
    setStations([...stations, { id: uuidv4(), chainage: "", ngl: "", fl: "" }]);
  };

  const removeStation = (id: string) => {
    if (stations.length > 1) {
      setStations(stations.filter((st) => st.id !== id));
    }
  };

  const results = useMemo(() => {
    const B = Number(formationWidth) || 0;
    const sc = Number(cutSlope) || 0;
    const sf = Number(fillSlope) || 0;
    const swell = Number(swellFactor) || 0;
    const shrink = Number(shrinkFactor) || 0;

    let sortedStations = [...stations].sort((a, b) => parseChainage(a.chainage) - parseChainage(b.chainage));
    
    // First pass: Calculate areas for each station
    const processedStations = sortedStations.map((station) => {
      const ch = parseChainage(station.chainage);
      const ngl = parseFloat(station.ngl) || 0;
      const fl = parseFloat(station.fl) || 0;
      const d = ngl - fl;
      const d_cut = d > 0 ? d : 0;
      const d_fill = d < 0 ? -d : 0;
      const cutArea = B * d_cut + sc * d_cut * d_cut;
      const fillArea = B * d_fill + sf * d_fill * d_fill;
      return { ...station, ch, d_cut, d_fill, cutArea, fillArea };
    });

    let totalCut = 0;
    let totalFill = 0;
    let cumCut = 0;
    let cumFill = 0;

    let segments = [];

    if (method === "trapezoidal") {
        segments = processedStations.map((station, index) => {
            let intCut = 0;
            let intFill = 0;
            let length = 0;
            if (index > 0) {
                const prev = processedStations[index - 1];
                length = Math.max(0, station.ch - prev.ch);
                intCut = (length / 2) * (station.cutArea + prev.cutArea);
                intFill = (length / 2) * (station.fillArea + prev.fillArea);
                cumCut += intCut;
                cumFill += intFill;
            }
            return {
                ...station,
                length,
                intCut,
                intFill,
                cumCut,
                cumFill,
                netVolume: cumCut - cumFill
            };
        });
    } else {
        // Simpson's Rule 
        let localCumCut = 0;
        let localCumFill = 0;
        const out = [];

        for (let i = 0; i < processedStations.length; i++) {
            const st = processedStations[i];
            let intCut = 0;
            let intFill = 0;
            let length = 0;

            if (i > 0) {
                const prev = processedStations[i - 1];
                length = Math.max(0, st.ch - prev.ch);
                
                if (i % 2 === 0) {
                    const st0 = processedStations[i - 2];
                    const st1 = processedStations[i - 1];
                    const st2 = processedStations[i];
                    
                    const totalL = Math.max(0, st2.ch - st0.ch);
                    const d = totalL / 2;

                    const blockCut = (d / 3) * (st0.cutArea + 4 * st1.cutArea + st2.cutArea);
                    const blockFill = (d / 3) * (st0.fillArea + 4 * st1.fillArea + st2.fillArea);

                    intCut = blockCut;
                    intFill = blockFill;
                    
                    if (out.length > 0) {
                        out[i-1].intCut = 0;
                        out[i-1].intFill = 0;
                    }
                } else {
                    if (i === processedStations.length - 1) {
                        intCut = (length / 2) * (st.cutArea + prev.cutArea);
                        intFill = (length / 2) * (st.fillArea + prev.fillArea);
                    } else {
                        intCut = 0;
                        intFill = 0; 
                    }
                }
            }

            localCumCut += intCut;
            localCumFill += intFill;
            out.push({
                ...st,
                length,
                intCut,
                intFill,
                cumCut: localCumCut,
                cumFill: localCumFill,
                netVolume: localCumCut - localCumFill
            });
        }
        
        // Distribute visual intermediates
        for(let i=1; i < out.length-1; i+=2) {
             if(out[i].intCut === 0 && out[i].intFill === 0 && i+1 < out.length) {
                  const blockC = out[i+1].intCut;
                  const blockF = out[i+1].intFill;
                  out[i].intCut = blockC / 2;
                  out[i].intFill = blockF / 2;
                  out[i+1].intCut = blockC / 2;
                  out[i+1].intFill = blockF / 2;
             }
        }
        
        let cCut = 0, cFill = 0;
        segments = out.map(o => {
            cCut += o.intCut;
            cFill += o.intFill;
            return {
                ...o,
                cumCut: cCut,
                cumFill: cFill,
                netVolume: cCut - cFill
            }
        });
    }

    if (segments.length > 0) {
        totalCut = segments[segments.length - 1].cumCut;
        totalFill = segments[segments.length - 1].cumFill;
    }

    // Apply Factors
    const bulkedCut = totalCut * (1 + swell / 100);
    const shrunkenFill = totalFill * (1 - shrink / 100);
    const finalNet = bulkedCut - shrunkenFill;

    return {
      segments,
      totalCut,
      totalFill,
      bulkedCut,
      shrunkenFill,
      finalNet
    };
  }, [stations, formationWidth, cutSlope, fillSlope, method, swellFactor, shrinkFactor]);

  return (
    <div className="w-full flex justify-center animate-in fade-in py-6">
      <div className="w-full max-w-6xl space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            
            <div className="w-full bg-white px-6 py-5 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <Mountain className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                  Cross-Sectional Earthworks Engine
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block uppercase tracking-wider mb-2 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Formation Width ({unitL})
                  </label>
                  <><label htmlFor="a11y-input-176" className="sr-only">Input</label>
<input id="a11y-input-176" type="number" inputMode="decimal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px] text-base font-normal"
                    value={formationWidth}
                    onChange={(e) => setFormationWidth(e.target.value === "" ? "" : Number(e.target.value))}
                  /></>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-2 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Cut Slope (H:1V)
                  </label>
                  <><label htmlFor="a11y-input-177" className="sr-only">Input</label>
<input id="a11y-input-177" type="number" inputMode="decimal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px] text-base font-normal"
                    value={cutSlope}
                    onChange={(e) => setCutSlope(e.target.value === "" ? "" : Number(e.target.value))}
                  /></>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-2 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Fill Slope (H:1V)
                  </label>
                  <><label htmlFor="a11y-input-178" className="sr-only">Input</label>
<input id="a11y-input-178" type="number" inputMode="decimal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px] text-base font-normal"
                    value={fillSlope}
                    onChange={(e) => setFillSlope(e.target.value === "" ? "" : Number(e.target.value))}
                  /></>
                </div>
              </div>
            </div>

            <div className="w-full bg-white px-6 py-5 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 border-b border-slate-100 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                    Station Survey Data
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-[12px] text-base font-medium focus:outline-none"
                    >
                        <option value="trapezoidal">Trapezoidal Rule</option>
                        <option value="simpson">Simpson's (1/3) Rule</option>
                    </select>
                    <button onClick={addStation}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-full transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Station
                    </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-sm uppercase tracking-widest text-slate-500 font-bold">
                      <th className="pb-3 pr-4 min-w-[120px]">
                        Chainage
                        <FieldTooltip content="The linear distance along the center line of the road, railway, or pipeline project." />
                      </th>
                      <th className="pb-3 px-4 min-w-[100px]">NGL ({unitL})</th>
                      <th className="pb-3 px-4 min-w-[100px]">FL ({unitL})</th>
                      <th className="pb-3 px-4 min-w-[100px]">Section Depth</th>
                      <th className="pb-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.segments.map((st) => (
                      <tr key={st.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 pr-4">
                          <><label htmlFor="a11y-input-179" className="sr-only">e.g. 1+200</label>
<input id="a11y-input-179" type="text"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-3 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px] text-base font-normal"
                            value={st.chainage}
                            onChange={(e) => handleUpdateStation(st.id, "chainage", e.target.value)}
                            placeholder="e.g. 1+200"
                          /></>
                        </td>
                        <td className="py-2.5 px-4">
                          <><label htmlFor="a11y-input-180" className="sr-only">Input</label>
<input id="a11y-input-180" type="number" inputMode="decimal"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-3 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px] text-base font-normal"
                            value={st.ngl}
                            onChange={(e) => handleUpdateStation(st.id, "ngl", e.target.value)}
                          /></>
                        </td>
                        <td className="py-2.5 px-4">
                          <><label htmlFor="a11y-input-181" className="sr-only">Input</label>
<input id="a11y-input-181" type="number" inputMode="decimal"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 text-slate-800 rounded-full px-3 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px] text-base font-normal"
                            value={st.fl}
                            onChange={(e) => handleUpdateStation(st.id, "fl", e.target.value)}
                          /></>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="font-mono text-base font-medium flex flex-col items-start bg-slate-100 rounded-[8px] px-2.5 py-1 min-w-[70px]">
                            {st.d_cut > 0 && <span className="text-amber-600">C: {st.d_cut.toFixed(2)}</span>}
                            {st.d_fill > 0 && <span className="text-indigo-600">F: {st.d_fill.toFixed(2)}</span>}
                            {st.d_cut === 0 && st.d_fill === 0 && <span className="text-slate-500">0.00</span>}
                          </div>
                        </td>
                        <td className="py-2.5 pl-4 text-right">
                          <button aria-label="Delete"
                            onClick={() => removeStation(st.id)}
                            disabled={stations.length <= 2}
                            className={`p-2 rounded-full ${stations.length <= 2 ? "text-slate-700 cursor-not-allowed" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`}
                          >
                            <Trash2 className="w-4 h-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="w-full bg-white px-6 py-5 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight">
                <LayoutTemplate className="w-5 h-5 text-slate-700" /> 
                {method === "simpson" ? "Simpson's Rule Output" : "Trapezoidal Rule Output"}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-base font-medium uppercase tracking-widest text-slate-600 bg-slate-50">
                      <th className="py-3 px-4 rounded-tl-lg">Stn</th>
                      <th className="py-3 px-4 text-amber-700">Area C ({unitA})</th>
                      <th className="py-3 px-4 text-indigo-700">Area F ({unitA})</th>
                      <th className="py-3 px-4 text-amber-700">Vol C ({unitV})</th>
                      <th className="py-3 px-4 text-indigo-700">Vol F ({unitV})</th>
                      <th className="py-3 px-4 text-amber-900 bg-amber-50/50">Cum C</th>
                      <th className="py-3 px-4 text-indigo-900 bg-indigo-50/50">Cum F</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-sm">
                    {results.segments.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{r.chainage || "0"}</td>
                        <td className="py-3 px-4 text-amber-600/70">{r.cutArea > 0 ? r.cutArea.toFixed(2) : "-"}</td>
                        <td className="py-3 px-4 text-indigo-600/70">{r.fillArea > 0 ? r.fillArea.toFixed(2) : "-"}</td>
                        <td className="py-3 px-4 text-amber-600 font-bold bg-amber-50/20">{r.intCut > 0 ? r.intCut.toFixed(2) : "-"}</td>
                        <td className="py-3 px-4 text-indigo-600 font-bold bg-indigo-50/20">{r.intFill > 0 ? r.intFill.toFixed(2) : "-"}</td>
                        <td className="py-3 px-4 text-amber-800 bg-amber-50/50 font-bold">{r.cumCut.toFixed(2)}</td>
                        <td className="py-3 px-4 text-indigo-800 bg-indigo-50/50 font-bold">{r.cumFill.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="w-full bg-white px-6 py-6 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <LayoutTemplate className="w-5 h-5 text-indigo-600" /> Mass Haul Curve
              </h2>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.segments} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis dataKey="chainage" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={12} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={12} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      formatter={(value: any) => [`${value.toFixed(2)} ${unitV}`, "Net Volume"]}
                      labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="netVolume" stroke="#4f46e5" strokeWidth={3} fill="url(#splitColor)" activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </section>
          
          <section className="lg:col-span-4 space-y-6">
            <div className="flex flex-col h-full sticky top-6 gap-6">
              
              <div className="w-full bg-white px-5 py-5 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="uppercase st mb-4 text-lg font-medium text-slate-800">Material Behaviors</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1.5 flex justify-between text-sm font-medium text-slate-700 mb-1">
                       <span>Swell / Bulking Factor</span>
                       <span className="text-amber-600">%</span>
                    </label>
                    <><label htmlFor="a11y-input-182" className="sr-only">Input</label>
<input id="a11y-input-182" type="number" inputMode="decimal"
                      className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-full px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500/50 min-h-[44px] text-base font-normal"
                      value={swellFactor}
                      onChange={(e) => setSwellFactor(e.target.value === "" ? "" : Number(e.target.value))}
                    /></>
                    <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">Increases cut volume (loose volume)</p>
                  </div>
                  <div>
                    <label className="block mb-1.5 flex justify-between text-sm font-medium text-slate-700 mb-1">
                       <span>Shrinkage Factor</span>
                       <span className="text-indigo-600">%</span>
                    </label>
                    <><label htmlFor="a11y-input-183" className="sr-only">Input</label>
<input id="a11y-input-183" type="number" inputMode="decimal"
                      className="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-full px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 min-h-[44px] text-base font-normal"
                      value={shrinkFactor}
                      onChange={(e) => setShrinkFactor(e.target.value === "" ? "" : Number(e.target.value))}
                    /></>
                    <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">Decreases fill volume (compacted)</p>
                  </div>
                </div>
              </div>

              <MaterialSummary
                title="Mass Haul Summary"
                totalLabel={`Final Net Balance`}
                totalValue={Math.abs(results.finalNet).toFixed(2)}
                totalUnit={`${unitV} ${results.finalNet > 0 ? '(Haul Away)' : '(Import)'}`}
              >
                <div className="grid grid-cols-1 gap-4 mt-6">
                  <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center overflow-hidden">
                      <span className="text-base font-medium text-amber-800 uppercase tracking-widest mb-1">Bulked Cut (Loose)</span>
                      <span className="text-2xl font-mono font-bold text-amber-600">{results.bulkedCut.toFixed(1)} <span className="text-sm">{unitV}</span></span>
                      <span className="text-sm text-amber-700/60 mt-1 font-bold">Bank: {results.totalCut.toFixed(1)}</span>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center overflow-hidden">
                      <span className="text-base font-medium text-indigo-800 uppercase tracking-widest mb-1">Shrunken Fill</span>
                      <span className="text-2xl font-mono font-bold text-indigo-600">{results.shrunkenFill.toFixed(1)} <span className="text-sm">{unitV}</span></span>
                      <span className="text-sm text-indigo-700/60 mt-1 font-bold">Bank: {results.totalFill.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <button className="w-full bg-white hover:bg-slate-700 text-slate-900 py-3 rounded-full transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden"
                        onClick={() => {
                            const items = [
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                division: "02 - Site Work & Earthwork",
                                description: `Excavation (Cut to Spoil) - Bulked`,
                                unit: unitV,
                                quantity: results.bulkedCut,
                                rate: 0
                            },
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                division: "02 - Site Work & Earthwork",
                                description: `Earthwork (Fill & Compaction)`,
                                unit: unitV,
                                quantity: results.shrunkenFill,
                                rate: 0
                            }
                            ];
                            window.dispatchEvent(new CustomEvent('fill-boq', { detail: items }));
                            alert("Earthwork BOQ generated!");
                        }}
                    >
                        Send to BOQ
                    </button>
                </div>
              </MaterialSummary>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
