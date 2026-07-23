import React, { useState, useEffect } from 'react';
import { Layers, Activity, AlertTriangle, CheckCircle, SlidersHorizontal, Download, Printer, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

type MixPreset = 'gsb-i' | 'dbm-1' | 'sma';

// Standard sieve sizes (mm)
const sieveSizes = [75, 53, 26.5, 19, 9.5, 4.75, 2.36, 0.3, 0.075];

// Example specification envelopes
const specifications = {
  'gsb-i': [
    { sieve: 75, min: 100, max: 100 },
    { sieve: 53, min: 80, max: 100 },
    { sieve: 26.5, min: 55, max: 90 },
    { sieve: 19, min: null, max: null },
    { sieve: 9.5, min: 35, max: 65 },
    { sieve: 4.75, min: 25, max: 50 },
    { sieve: 2.36, min: null, max: null },
    { sieve: 0.3, min: null, max: null },
    { sieve: 0.075, min: 0, max: 10 }, // 75µm
  ],
  'dbm-1': [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: 100, max: 100 },
    { sieve: 19, min: 90, max: 100 },
    { sieve: 9.5, min: 56, max: 80 },
    { sieve: 4.75, min: 29, max: 59 },
    { sieve: 2.36, min: 19, max: 45 },
    { sieve: 0.3, min: 5, max: 17 },
    { sieve: 0.075, min: 1, max: 7 },
  ],
  'sma': [
    { sieve: 75, min: null, max: null },
    { sieve: 53, min: null, max: null },
    { sieve: 26.5, min: null, max: null },
    { sieve: 19, min: 100, max: 100 },
    { sieve: 9.5, min: 50, max: 75 },
    { sieve: 4.75, min: 20, max: 28 },
    { sieve: 2.36, min: 16, max: 24 },
    { sieve: 0.3, min: 12, max: 16 },
    { sieve: 0.075, min: 8, max: 12 },
  ]
};

// Initial aggregate data (mock)
const initialAggregates = {
  aggA: [100, 100, 100, 85, 30, 5, 0, 0, 0], // Coarse
  aggB: [100, 100, 100, 100, 95, 45, 10, 0, 0], // Intermediate
  aggC: [100, 100, 100, 100, 100, 100, 95, 45, 15], // Fine/Dust
};

export function PavementMixGradation() {
  const [preset, setPreset] = useState<MixPreset>('dbm-1');
  
  // Proportions in %
  const [propA, setPropA] = useState<number>(40);
  const [propB, setPropB] = useState<number>(30);
  // propC is implicitly 100 - (propA + propB)
  const propC = Math.max(0, 100 - (propA + propB));
  
  const [dynamicSieves, setDynamicSieves] = useState<number[]>([...sieveSizes]);
  const [dynamicSpecs, setDynamicSpecs] = useState<any>(JSON.parse(JSON.stringify(specifications)));
  const [newSieve, setNewSieve] = useState<string>('');

  const handleAddSieve = () => {
    const val = parseFloat(newSieve);
    if (!isNaN(val) && val > 0 && !dynamicSieves.includes(val)) {
      setDynamicSieves([...dynamicSieves, val]);
      
      // Add default 100% passing for new sieve
      setAggA([...aggA, 100]);
      setAggB([...aggB, 100]);
      setAggC([...aggC, 100]);
      
      // Add default null specs
      const newSpecs = { ...dynamicSpecs };
      Object.keys(newSpecs).forEach(p => {
        newSpecs[p as MixPreset] = [...newSpecs[p as MixPreset], { sieve: val, min: null, max: null }];
      });
      setDynamicSpecs(newSpecs);
      setNewSieve('');
    }
  };

  const [aggA, setAggA] = useState<number[]>([...initialAggregates.aggA]);
  const [aggB, setAggB] = useState<number[]>([...initialAggregates.aggB]);
  const [aggC, setAggC] = useState<number[]>([...initialAggregates.aggC]);

  const [result, setResult] = useState<any>(null);

  // Re-adjust slider if sum exceeds 100
  const handlePropAChange = (val: number) => {
    if (val + propB > 100) {
      setPropB(100 - val);
    }
    setPropA(val);
  };
  
  const handlePropBChange = (val: number) => {
    if (val + propA > 100) {
      setPropA(100 - val);
    }
    setPropB(val);
  };

  useEffect(() => {
    const fetchGradation = async () => {
      try {
        const specs = dynamicSpecs[preset];
        const res = await fetch('/api/tools/pavement-gradation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propA: propA / 100,
            propB: propB / 100,
            propC: propC / 100,
            aggA,
            aggB,
            aggC,
            specs
          })
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Gradation API failed", err);
      }
    };
    
    fetchGradation();
  }, [preset, propA, propB, propC, aggA, aggB, aggC]);

  // Format data for Recharts
  const chartData = dynamicSieves.map((sieve, index) => {
    const spec = dynamicSpecs[preset][index];
    const blended = result?.blended[index]?.blendedValue ?? 0;
    
    // For semi-log plotting, recharts handles scale='log' natively on XAxis
    // if domain is properly set and all values are > 0.
    // Sieve size 0 is not allowed for log scale, our min is 0.075.
    
    return {
      sieve,
      sieveLog: Math.log10(sieve), // Alternative if native log is buggy
      blended,
      min: spec.min !== null ? spec.min : null,
      max: spec.max !== null ? spec.max : null,
      status: result?.blended[index]?.status || 'pass'
    };
  }).filter(d => d.sieve > 0).sort((a, b) => a.sieve - b.sieve); // Sort ascending for line chart

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 shadow-lg rounded-xl">
          <p className="font-bold text-slate-800 text-sm mb-1">Sieve: {label} mm</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value !== null ? entry.value.toFixed(1) + '%' : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-600">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Aggregate Blending Suite</h1>
              <p className="text-slate-600 text-sm">Blend aggregate proportions and verify against standard specifications.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={preset} 
              onChange={(e) => setPreset(e.target.value as MixPreset)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block px-4 py-2 font-medium"
            >
              <option value="gsb-i">GSB Grade I</option>
              <option value="dbm-1">DBM Grade 1</option>
              <option value="sma">Stone Matrix Asphalt (SMA)</option>
            </select>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 border border-purple-700 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal size={20} className="text-purple-500" />
              Blending Proportions
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Aggregate A (Coarse)</span>
                  <span>{propA}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={propA} 
                  onChange={(e) => handlePropAChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Aggregate B (Intermediate)</span>
                  <span>{propB}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={propB} 
                  onChange={(e) => handlePropBChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2 opacity-70">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Aggregate C (Fine/Dust)</span>
                  <span>{propC}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={propC} 
                  readOnly
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-not-allowed accent-sky-500"
                />
              </div>
            </div>

            {/* Status Display */}
            {result && (
              <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 ${result.allPass ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                {result.allPass ? <CheckCircle size={24} className="text-emerald-500 flex-shrink-0" /> : <AlertTriangle size={24} className="text-rose-500 flex-shrink-0" />}
                <div>
                  <h3 className={`text-sm font-bold ${result.allPass ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {result.allPass ? 'Mix Passes Specifications' : 'Mix Fails Specifications'}
                  </h3>
                  <p className={`text-xs mt-1 ${result.allPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.allPass 
                      ? 'The blended aggregate falls within the upper and lower bounds for all specified sieve sizes.' 
                      : 'Adjust the proportions. The blend is outside the specification envelope for one or more sieve sizes.'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex gap-3 text-sm text-slate-600">
            <Activity size={20} className="text-slate-400 flex-shrink-0" />
            <p>
              Chart uses a logarithmic scale for sieve sizes as per standard highway engineering practices (0.45 power curve approximate viewing).
            </p>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[500px] flex flex-col relative">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-purple-500" />
              Gradation Curve
            </h2>
            
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} horizontal={true} />
                  <XAxis 
                    dataKey="sieve" 
                    type="number" 
                    scale="log" 
                    domain={[0.075, 75]} 
                    tickFormatter={(val) => val.toString()}
                    label={{ value: 'Sieve Size (mm) [Log Scale]', position: 'insideBottom', offset: -10 }}
                    stroke="#64748b"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    label={{ value: 'Percent Passing (%)', angle: -90, position: 'insideLeft' }}
                    stroke="#64748b"
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  
                  {/* Min Spec Line */}
                  <Line 
                    type="monotone" 
                    dataKey="min" 
                    name="Lower Spec" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    connectNulls
                    dot={false}
                  />
                  {/* Max Spec Line */}
                  <Line 
                    type="monotone" 
                    dataKey="max" 
                    name="Upper Spec" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    connectNulls
                    dot={false}
                  />
                  {/* Blended Line */}
                  <Line 
                    type="monotone" 
                    dataKey="blended" 
                    name="Blended Mix" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Calculation Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 px-2 font-medium">Sieve (mm)</th>
                    <th className="pb-3 px-2 font-medium">Lower Bound</th>
                    <th className="pb-3 px-2 font-medium">Combined Mix</th>
                    <th className="pb-3 px-2 font-medium">Upper Bound</th>
                    <th className="pb-3 px-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.sort((a, b) => b.sieve - a.sieve).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-200">{row.sieve}</td>
                      <td className="py-3 px-2 text-slate-400">
                        {row.min !== null ? row.min : '-'}
                      </td>
                      <td className="py-3 px-2 font-bold text-purple-300">{row.blended.toFixed(1)}%</td>
                      <td className="py-3 px-2 text-slate-400">
                        {row.max !== null ? row.max : '-'}
                      </td>
                      <td className="py-3 px-2">
                        {row.min === null ? (
                          <span className="text-slate-500">-</span>
                        ) : row.status === 'pass' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold">
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded text-xs font-bold">
                            FAIL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex items-end gap-3 max-w-sm">
               <div className="flex-1">
                 <label className="block text-xs font-medium text-slate-400 mb-1">Add Custom Sieve (mm)</label>
                 <input 
                   type="number"
                   value={newSieve}
                   onChange={(e) => setNewSieve(e.target.value)}
                   placeholder="e.g. 12.5"
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
               </div>
               <button 
                 onClick={handleAddSieve}
                 className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors h-[38px]"
               >
                 <Plus size={16} /> Add Sieve
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
