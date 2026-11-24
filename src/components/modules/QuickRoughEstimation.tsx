import { Button } from '../ui/Button';
import React, { useState, useMemo } from "react";
import { Calculator, MapPin, Building, Home, ArrowRight, AlertTriangle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useSettings } from "../../context/SettingsContext";
import { useRecentTools } from "../../hooks/useRecentTools";
import { CalculationHistory } from '../ui/CalculationHistory';
import ThumbRuleDistributionEngine from '../ui/ThumbRuleDistributionEngine';
import FormulaTransparencyCard from '../ui/FormulaTransparencyCard';
import { quickEstimate, QUICK_RATES, CITY_MULTIPLIERS, RATES_LAST_UPDATED, RATE_SOURCE, type QuickType, type QuickCity, type MarlaStandard } from "../../lib/quickEstimate";
import { useRates } from "../../lib/useRates";


type ConstructionType = QuickType;
type LocationType = QuickCity;

export default function QuickRoughEstimation({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const { settings, formatCurrency } = useSettings();
  const { addRecentTool } = useRecentTools();
  
  const [areaInput, setAreaInput] = useState<number>(5);
  const [areaUnit, setAreaUnit] = useState<"marla" | "sqft">("marla");
  const [marlaStandard, setMarlaStandard] = useState<MarlaStandard>("society225");
  const [floors, setFloors] = useState<number>(1);
  const [constType, setConstType] = useState<ConstructionType>("standard");
  const [location, setLocation] = useState<LocationType>("lahore");
  const [basement, setBasement] = useState<boolean>(false);
  const { table: rateTable } = useRates("PK");
  const validationError = !isFinite(areaInput) || areaInput <= 0 ? "Area must be greater than 0." : floors < 1 || floors > 10 ? "Floors must be between 1 and 10." : null;

  // Engine (src/lib/quickEstimate): rates re-sourced to 2026 (grey Rs 3,000/sqft
  // Lahore base; the old 2,200 was stale/low). The chart split sums to 100% —
  // the old code added labour (25% of total) on top of grey + finish (125%).
  const results = useMemo(() => {
    if (validationError) return null;
    return quickEstimate({
      area: areaInput,
      unit: areaUnit,
      marla: marlaStandard,
      floors,
      type: constType,
      city: location,
      basement,
    });
  }, [areaInput, areaUnit, marlaStandard, floors, constType, location, basement, validationError]);
  const totalSqft = results ? results.coveredSqft : 0;
  const sqftArea = results ? results.plotSqft : 0;

  // Chart comes from the engine: grey + finishing + labour shares sum to 100% of the total.
  const chartData = results ? results.chart : [];

  const CHART_COLORS = ['#1F1D1A', '#0F766E', '#F2A413'];

  return (
    <div className="w-full mx-auto space-y-6">
      
      {/* Header */}
      <div className="w-full bg-surface-default p-4 sm:p-6 md:p-4 sm:p-8 rounded-2xl border border-ui-borderSubtle shadow-brand-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tabular-nums tracking-tight text-txt-primary uppercase tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-accent-800" />
              Quick Rough Estimation
            </h2>
            <p className="text-txt-tertiary mt-2 font-medium">
              Get a lightning-fast preliminary budget in under 5 seconds.
            </p>
          </div>
          
          {onNavigate && (
            <Button
              onClick={() => onNavigate("boq")}
              className="flex items-center gap-2 bg-accent-100 hover:bg-accent-200 text-accent-800 px-5 py-2.5 rounded-full font-bold transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
            >
              Get Detailed BOQ <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
        
        {/* Input Panel */}
        <div className="w-full flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 bg-surface-default rounded-2xl p-4 sm:p-6 border border-ui-borderSubtle shadow-brand-sm space-y-6 overflow-hidden">
          <h3 className="text-lg font-bold border-b border-border-color pb-3 text-txt-primary">
            Project Specs
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-txt-secondary mb-2">
                <span>Total Area</span>
                <div className="flex bg-surface-hover rounded-2xl p-0.5">
                  <Button onClick={() => setAreaUnit("marla")} className={`px-2 py-1 space-x-1 rounded-md text-xs font-bold transition-all ${areaUnit === "marla" ? 'bg-surface-default  shadow-brand-sm text-txt-primary  ' : 'text-txt-tertiary'}`}>Marla</Button>
                  <Button onClick={() => setAreaUnit("sqft")} className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${areaUnit === "sqft" ? 'bg-surface-default  shadow-brand-sm text-txt-primary  ' : 'text-txt-tertiary'}`}>Sq.ft</Button>
                </div>
              </label>
              <div className="relative rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
                <><label htmlFor="a11y-input-404" className="sr-only">Input</label>
<input id="a11y-input-404"
                  type="number" inputMode="decimal"
                  min="1"
                  value={areaInput}
                  onChange={(e) => setAreaInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-hover rounded-full border border-ui-borderSubtle shadow-brand-sm text-txt-primary border border-ui-borderSubtle rounded-full px-4 py-3 pl-10 text-lg font-bold text-txt-primary outline-none focus:ring-2 focus:ring-accent-500"
                /></>
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-tertiary" />
              </div>
            </div>

            {areaUnit === "marla" && (
              <div>
                <label className="block text-sm font-semibold text-txt-secondary mb-2">Marla standard</label>
                <div className="flex gap-2">
                  <Button onClick={() => setMarlaStandard("society225")} className={`px-3 py-2 rounded-full text-xs font-bold ${marlaStandard === "society225" ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>225 sqft — society / DHA / Bahria</Button>
                  <Button onClick={() => setMarlaStandard("revenue272")} className={`px-3 py-2 rounded-full text-xs font-bold ${marlaStandard === "revenue272" ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>272.25 sqft — Punjab revenue</Button>
                </div>
                <p className="text-xs text-txt-tertiary mt-1">Same plot, different marla = ~17% cost swing. Check your plot papers.</p>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm font-semibold text-txt-secondary">
              <input type="checkbox" checked={basement} onChange={(e) => setBasement(e.target.checked)} /> Include basement (one extra floor of area)
            </label>
            <div>
              <label className="block text-sm font-semibold text-txt-secondary mb-2">Number of Floors</label>
              <div className="relative">
                <><label htmlFor="a11y-input-405" className="sr-only">Input</label>
<input id="a11y-input-405"
                  type="number" inputMode="decimal"
                  min="1"
                  max="10"
                  value={floors}
                  onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface-hover rounded-full border border-ui-borderSubtle shadow-brand-sm text-txt-primary border border-ui-borderSubtle rounded-full px-4 py-3 pl-10 text-lg font-bold text-txt-primary outline-none focus:ring-2 focus:ring-accent-500"
                /></>
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-tertiary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-txt-secondary mb-2">Construction Type</label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => setConstType("grey")}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${constType === "grey" ? 'border-ink bg-accent-50  text-accent-800 ' : 'border-ui-borderSubtle text-txt-secondary  hover:border-ui-borderDefault'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Grey Structure Only</div>
                  <div className="text-xs opacity-70 mt-0.5">Foundations, walls, slabs, plaster</div>
                </Button>
                <Button
                  onClick={() => setConstType("standard")}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${constType === "standard" ? 'border-ink bg-accent-50  text-accent-800 ' : 'border-ui-borderSubtle text-txt-secondary  hover:border-ui-borderDefault'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Standard Finishing</div>
                  <div className="text-xs opacity-70 mt-0.5">Grey + standard tiles, doors, paint</div>
                </Button>
                <Button
                  onClick={() => setConstType("premium")}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${constType === "premium" ? 'border-ink bg-accent-50  text-accent-800 ' : 'border-ui-borderSubtle text-txt-secondary  hover:border-ui-borderDefault'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Premium</div>
                  <div className="text-xs opacity-70 mt-0.5">High-end imported finishes</div>
                </Button>
                <Button
                  onClick={() => setConstType("luxury")}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${constType === "luxury" ? 'border-ink bg-accent-50  text-accent-800 ' : 'border-ui-borderSubtle text-txt-secondary  hover:border-ui-borderDefault'}`}
                >
                  <div className="font-bold text-sm rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Luxury</div>
                  <div className="text-xs opacity-70 mt-0.5">Imported stone, smart home, premium MEP</div>
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-txt-secondary mb-2">Location (Rate Adj.)</label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as LocationType)}
                  className="w-full bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary border border-ui-borderSubtle rounded-2xl px-4 py-3 pl-10 text-lg font-bold text-txt-primary outline-none focus:ring-2 focus:ring-accent-500 appearance-none overflow-hidden"
                >
                  <option value="lahore">Lahore</option>
                  <option value="karachi">Karachi (+5%)</option>
                  <option value="islamabad">Islamabad (+10%)</option>
                  <option value="faisalabad">Faisalabad (−5%)</option>
                  <option value="multan">Multan (−5%)</option>
                  <option value="rawalpindi">Rawalpindi (+5%)</option>
                  <option value="other">Other</option>
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-txt-tertiary" />
              </div>
            </div>

          </div>
        </div>

        {/* Results Panel */}
        <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col space-y-6">
          {results ? (
            <>
              {/* Grand Total Highlight */}
              <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-8 rounded-2xl shadow-brand-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Calculator className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-txt-tertiary font-bold mb-2 uppercase tracking-widest text-sm">Estimated Project Budget Range</h3>
                  <div className="flex items-baseline gap-2 text-txt-primary">
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
                    <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary px-3 py-1.5 rounded-2xl text-txt-secondary overflow-hidden">
                      Total: {totalSqft.toLocaleString()} sq.ft
                    </div>
                    <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary px-3 py-1.5 rounded-2xl text-txt-secondary overflow-hidden">
                      {settings.currency} {results.ratePerSqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} / sq.ft
                    </div>
                  </div>
                </div>

                <div className="relative z-10 bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4 text-txt-primary border border-border-color flex-wrap">
                  <div className="bg-accent-100 p-3 rounded-full text-accent-800"><Clock className="w-6 h-6" /></div>
                  <div>
                    <div className="text-xs text-accent-800 uppercase tracking-wider font-semibold">Rough Timeline</div>
                    <div className="text-xl font-bold">{results.timeline}</div>
                  </div>
                </div>
              </div>

              {/* Data Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 responsive-tool-grid">
                
                {/* Cost Distribution Chart */}
                <div className="calc-input p-6 shadow-brand-sm">
                  <h3 className="text-base font-bold text-txt-primary mb-6">Phase Breakdown</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E4DE" />
                        <XAxis type="number" fontSize={12} tickFormatter={(val) => `${val/1000000}M`} stroke="#6B6862" />
                        <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#6B6862" fontWeight="600" />
                        <Tooltip 
                          formatter={(value: any) => settings.currency + " " + value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          cursor={{fill: 'rgba(31,29,26,0.05)'}}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                          {chartData.map((entry: { name: string; value: number }, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Material Highlights */}
                <div className="calc-input p-6 shadow-brand-sm">
                  <h3 className="text-base font-bold text-txt-primary mb-6">Major Material Budgets</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                      <div className="flex items-center gap-3"><div className="w-full w-3 h-3 rounded-full bg-surface-default/70 backdrop-blur-md border border-white/20 shadow-brand-sm overflow-hidden" /> <span className="font-semibold text-txt-secondary">Steel / Rebar</span></div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-bold text-txt-primary">{results.materials.steelKgMin.toLocaleString()}–{results.materials.steelKgMax.toLocaleString()} kg</div>
                        <Button onClick={() => onNavigate && onNavigate("metal-weight")} className="text-xs text-accent-800 hover:text-accent-800 underline flex items-center gap-1">Calculate exact weight <ArrowRight size={10} /></Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                      <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-secondary-400" /> <span className="font-semibold text-txt-secondary">Cement</span></div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-bold text-txt-primary">{results.materials.cementBagsMin.toLocaleString()}–{results.materials.cementBagsMax.toLocaleString()} bags</div>
                        <Button onClick={() => onNavigate && onNavigate("volume-estimator")} className="text-xs text-accent-800 hover:text-accent-800 underline flex items-center gap-1">Calculate exact bags <ArrowRight size={10} /></Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                      <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-ink" /> <span className="font-semibold text-txt-secondary">Bricks / Blocks</span></div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-bold text-txt-primary">{results.materials.bricksMin.toLocaleString()}–{results.materials.bricksMax.toLocaleString()} nos</div>
                        <Button onClick={() => onNavigate && onNavigate("brick-calculator")} className="text-xs text-accent-800 hover:text-accent-800 underline flex items-center gap-1">Calculate exact bricks <ArrowRight size={10} /></Button>
                      </div>
                    </div>
                    {constType !== "grey" && (
                      <div className="flex justify-between items-center p-3 rounded-2xl bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-ink" /> <span className="font-semibold text-txt-secondary">Tiles, Paint & Finishes</span></div>
                        <div className="font-bold text-txt-primary">{formatCurrency(results.finishCost)}</div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Disclaimer */}
              <div className="bg-accent-50 border border-accent-200 p-4 rounded-2xl flex items-start gap-4 overflow-hidden flex-wrap">
                <AlertTriangle className="w-6 h-6 text-accent-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-accent-800 mb-1">Rough Estimation Disclaimer</h4>
                  <p className="text-sm text-accent-800 leading-relaxed">
                    Disclaimer: This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.
                  </p>
                </div>
              </div>
              <ThumbRuleDistributionEngine totalCost={(results.minCost + results.maxCost) / 2} />
              <FormulaTransparencyCard 
                title="Thumb-Rule Calculation Logic"
                formulas={[
                  { name: "Total Built-Up Area", formula: "Area x Floors", variables: { Area: sqftArea, Floors: floors }, result: `${totalSqft} sq.ft` },
                  { name: "Min Budget", formula: "Total Area x Min Rate / sq.ft", variables: { Area: totalSqft, Rate: results.ratePerSqft - (results.ratePerSqft * 0.05) }, result: formatCurrency(results.minCost) },
                  { name: "Max Budget", formula: "Total Area x Max Rate / sq.ft", variables: { Area: totalSqft, Rate: results.ratePerSqft + (results.ratePerSqft * 0.05) }, result: formatCurrency(results.maxCost) }
                ]}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-ui-borderSubtle rounded-2xl">
              <div className="text-center text-txt-tertiary">Enter area and floors to see rough estimation...</div>
            </div>
          )}
        </div>

      </div>
    
      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 text-sm text-txt-secondary">
        Rates: grey Rs {QUICK_RATES[constType].grey.toLocaleString()}/sqft + finish Rs {QUICK_RATES[constType].finish.toLocaleString()}/sqft (Lahore base, {RATES_LAST_UPDATED}; {RATE_SOURCE}). City multiplier {CITY_MULTIPLIERS[location].label} ×{CITY_MULTIPLIERS[location].multiplier}. Covered area uses 100% plot coverage per floor — the Pakistan Cost Calculator uses 75%, so the same plot gives a larger area and total here. {areaUnit === "marla" ? `Marla standard: ${marlaStandard === "society225" ? "225 sqft (society/DHA/Bahria)" : "272.25 sqft (Punjab revenue)"} — the other standard changes this estimate by ~17%.` : ""}
        {validationError && <span className="block text-red-600 font-semibold mt-1">{validationError}</span>}
      </div>
      <CalculationHistory calculatorId="quickroughestimation_tool" currentInputs={{ areaInput, areaUnit, marlaStandard, floors, constType, location, basement }} currentResults={results ? { totalCost: results.totalCost } : undefined}
        onRestore={(ins) => {
          if (ins.areaInput != null) setAreaInput(ins.areaInput as typeof areaInput);
          if (ins.areaUnit != null) setAreaUnit(ins.areaUnit as typeof areaUnit);
          if (ins.marlaStandard != null) setMarlaStandard(ins.marlaStandard as typeof marlaStandard);
          if (ins.floors != null) setFloors(ins.floors as typeof floors);
          if (ins.constType != null) setConstType(ins.constType as typeof constType);
          if (ins.location != null) setLocation(ins.location as typeof location);
          if (ins.basement != null) setBasement(ins.basement as typeof basement);
        }}
      />
</div>
  );
}
