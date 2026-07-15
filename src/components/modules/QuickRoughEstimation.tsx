import React, { useState, useMemo } from "react";
import { Calculator, MapPin, Building, Home, ArrowRight, AlertTriangle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from '../ui/CalculationHistory';

type ConstructionType = "grey" | "standard" | "premium";
type LocationType = "lahore" | "karachi" | "islamabad" | "other";

export default function QuickRoughEstimation({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const { settings, formatCurrency } = useSettings();
  
  const [areaInput, setAreaInput] = useState<number>(5);
  const [areaUnit, setAreaUnit] = useState<"marla" | "sqft">("marla");
  const [floors, setFloors] = useState<number>(1);
  const [constType, setConstType] = useState<ConstructionType>("standard");
  const [location, setLocation] = useState<LocationType>("lahore");

  // Conversions & calculations
  // 1 Marla = 225 sqft (standard in Pakistan)
  const sqftArea = areaUnit === "marla" ? areaInput * 225 : areaInput;
  const totalSqft = sqftArea * floors;

  // Base rates per sqft (PKR usually)
  const greyRate = 2200;
  const finishStandardRate = 1800;
  const finishPremiumRate = 3000;

  const locMultiplier = useMemo(() => {
    switch (location) {
      case "islamabad": return 1.10;
      case "karachi": return 1.05;
      case "lahore": return 1.00;
      default: return 1.00;
    }
  }, [location]);

  const results = useMemo(() => {
    if (totalSqft <= 0) return null;

    let totalRate = greyRate;
    let greyCost = totalSqft * greyRate * locMultiplier;
    let finishCost = 0;

    if (constType === "standard") {
      totalRate += finishStandardRate;
      finishCost = totalSqft * finishStandardRate * locMultiplier;
    } else if (constType === "premium") {
      totalRate += finishPremiumRate;
      finishCost = totalSqft * finishPremiumRate * locMultiplier;
    }

    const totalCost = totalSqft * totalRate * locMultiplier;
    
    // Ranges
    const minCost = totalCost * 0.95;
    const maxCost = totalCost * 1.05;

    // Timeline estimate
    let timelineMin = 4;
    let timelineMax = 6;
    if (totalSqft > 2000 && totalSqft <= 4000) { timelineMin = 5; timelineMax = 8; }
    else if (totalSqft > 4000 && totalSqft <= 8000) { timelineMin = 7; timelineMax = 12; }
    else if (totalSqft > 8000) { timelineMin = 10; timelineMax = 18; }
    if (floors > 1) { timelineMin += (floors - 1); timelineMax += (floors - 1); }

    // Rough material breakdown based on grey cost + some finishing
    // 25% steel, 15% cement, 20% bricks, 25% labour roughly for structural
    const labourCost = totalCost * 0.25; 
    const matTotal = totalCost - labourCost;
    
    const cementCost = greyCost * 0.15 + (finishCost * 0.05);
    const steelCost = greyCost * 0.25;
    const bricksCost = greyCost * 0.20;
    const sandAggCost = greyCost * 0.15;
    const tilesPaintCost = finishCost * 0.40;

    return {
      minCost, maxCost, totalCost, greyCost, finishCost, labourCost,
      cementCost, steelCost, bricksCost, sandAggCost, tilesPaintCost,
      timeline: `${timelineMin} - ${timelineMax} months`,
      costPerSqft: totalRate * locMultiplier
    };
  }, [totalSqft, constType, locMultiplier]);

  const chartData = results ? [
    { name: 'Grey Structure', value: results.greyCost },
    { name: 'Finishing', value: results.finishCost },
    { name: 'Labour', value: results.labourCost },
  ] : [];

  const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b'];

  return (
    <div className="w-full mx-auto space-y-6">
      
      {/* Header */}
      <div className="w-full bg-white p-4 sm:p-6 md:p-4 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tabular-nums tracking-tight text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              Quick Rough Estimation
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Get a lightning-fast preliminary budget in under 5 seconds.
            </p>
          </div>
          
          {onNavigate && (
            <button
              onClick={() => onNavigate("boq")}
              className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-5 py-2.5 rounded-full font-bold transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              Get Detailed BOQ <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Panel */}
        <div className="w-full lg:col-span-4 bg-white rounded-[24px] p-4 sm:p-6 border border-slate-200 shadow-sm space-y-6 overflow-hidden">
          <h3 className="text-lg font-bold border-b border-slate-100 pb-3 text-slate-800">
            Project Specs
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>Total Area</span>
                <div className="flex bg-slate-100 rounded-[16px] p-0.5">
                  <button onClick={() => setAreaUnit("marla")} className={`px-2 py-1 space-x-1 rounded-md text-xs font-bold transition-all ${areaUnit === "marla" ? 'bg-white  shadow-sm text-slate-800  ' : 'text-slate-500'}`}>Marla</button>
                  <button onClick={() => setAreaUnit("sqft")} className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${areaUnit === "sqft" ? 'bg-white  shadow-sm text-slate-800  ' : 'text-slate-500'}`}>Sq.ft</button>
                </div>
              </label>
              <div className="relative rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                <><label htmlFor="a11y-input-404" className="sr-only">Input</label>
<input id="a11y-input-404"
                  type="number" inputMode="decimal"
                  min="1"
                  value={areaInput}
                  onChange={(e) => setAreaInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 rounded-full px-4 py-3 pl-10 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500"
                /></>
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Floors</label>
              <div className="relative">
                <><label htmlFor="a11y-input-405" className="sr-only">Input</label>
<input id="a11y-input-405"
                  type="number" inputMode="decimal"
                  min="1"
                  max="10"
                  value={floors}
                  onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 rounded-full px-4 py-3 pl-10 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500"
                /></>
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Construction Type</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setConstType("grey")}
                  className={`p-3 rounded-[24px] border-2 text-left transition-all ${constType === "grey" ? 'border-indigo-500 bg-indigo-50  text-indigo-700 ' : 'border-slate-200 text-slate-600  hover:border-slate-300'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Grey Structure Only</div>
                  <div className="text-xs opacity-70 mt-0.5">Foundations, walls, slabs, plaster</div>
                </button>
                <button
                  onClick={() => setConstType("standard")}
                  className={`p-3 rounded-[24px] border-2 text-left transition-all ${constType === "standard" ? 'border-blue-500 bg-blue-50  text-blue-700 ' : 'border-slate-200 text-slate-600  hover:border-slate-300'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Standard Finishing</div>
                  <div className="text-xs opacity-70 mt-0.5">Grey + standard tiles, doors, paint</div>
                </button>
                <button
                  onClick={() => setConstType("premium")}
                  className={`p-3 rounded-[24px] border-2 text-left transition-all ${constType === "premium" ? 'border-purple-500 bg-purple-50  text-purple-700 ' : 'border-slate-200 text-slate-600  hover:border-slate-300'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Premium / Luxury</div>
                  <div className="text-xs opacity-70 mt-0.5">High-end imported finishes</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location (Rate Adj.)</label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationType)}
                  className="w-full bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-200 rounded-[24px] px-4 py-3 pl-10 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 appearance-none overflow-hidden"
                >
                  <option value="lahore">Lahore</option>
                  <option value="karachi">Karachi (+5%)</option>
                  <option value="islamabad">Islamabad (+10%)</option>
                  <option value="other">Other</option>
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          {results ? (
            <>
              {/* Grand Total Highlight */}
              <div className="w-full bg-white border border-slate-200 p-4 sm:p-8 rounded-[24px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Calculator className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-sm">Estimated Project Budget Range</h3>
                  <div className="flex items-baseline gap-2 text-slate-900">
                    <span className="text-3xl font-medium opacity-80">{settings.currency}</span>
                    <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all lg:text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight tracking-tight">
                      {results.minCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xl font-bold opacity-80 px-2">—</span>
                    <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all lg:text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight tracking-tight">
                      {results.maxCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium">
                    <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 px-3 py-1.5 rounded-[16px] text-slate-600 overflow-hidden">
                      Total: {totalSqft.toLocaleString()} sq.ft
                    </div>
                    <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 px-3 py-1.5 rounded-[16px] text-slate-600 overflow-hidden">
                      {settings.currency} {results.costPerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} / sq.ft
                    </div>
                  </div>
                </div>

                <div className="relative z-10 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 backdrop-blur-sm p-4 rounded-[24px] flex items-center gap-4 text-slate-900 border border-slate-100 flex-wrap">
                  <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><Clock className="w-6 h-6" /></div>
                  <div>
                    <div className="text-xs text-indigo-600 uppercase tracking-wider font-semibold">Rough Timeline</div>
                    <div className="text-xl font-bold">{results.timeline}</div>
                  </div>
                </div>
              </div>

              {/* Data Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cost Distribution Chart */}
                <div className="calc-input p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-6">Phase Breakdown</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" fontSize={12} tickFormatter={(val) => `${val/1000000}M`} stroke="#94a3b8" />
                        <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#64748b" fontWeight="600" />
                        <Tooltip 
                          formatter={(value: any) => settings.currency + " " + value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          cursor={{fill: 'rgba(15,23,42,0.05)'}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Material Highlights */}
                <div className="calc-input p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-6">Major Material Budgets</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-[24px] bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                      <div className="flex items-center gap-3"><div className="w-full w-3 h-3 rounded-full bg-white/70 backdrop-blur-md border border-white/20 shadow-sm overflow-hidden" /> <span className="font-semibold text-slate-700">Steel / Rebar</span></div>
                      <div className="font-bold text-slate-900">{formatCurrency(results.steelCost)}</div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-[24px] bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                      <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-400" /> <span className="font-semibold text-slate-700">Cement</span></div>
                      <div className="font-bold text-slate-900">{formatCurrency(results.cementCost)}</div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-[24px] bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                      <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-700" /> <span className="font-semibold text-slate-700">Bricks / Blocks</span></div>
                      <div className="font-bold text-slate-900">{formatCurrency(results.bricksCost)}</div>
                    </div>
                    {constType !== "grey" && (
                      <div className="flex justify-between items-center p-3 rounded-[24px] bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500" /> <span className="font-semibold text-slate-700">Tiles, Paint & Finishes</span></div>
                        <div className="font-bold text-slate-900">{formatCurrency(results.tilesPaintCost)}</div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-[24px] flex items-start gap-4 overflow-hidden flex-wrap">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">Rough Estimation Disclaimer</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    This is a highly simplified thumb-rule estimate designed for rapid preliminary budgeting under standard soil and foundation conditions. Variations in foundation depth, structural design (spans), and imported finishes will alter actual costs. Use the detailed BOQ Generator for formal project estimates.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[24px]">
              <div className="text-center text-slate-500">Enter area and floors to see rough estimation...</div>
            </div>
          )}
        </div>

      </div>
    
      <CalculationHistory calculatorId="quickroughestimation_tool" currentInputs={{}} />
</div>
  );
}
