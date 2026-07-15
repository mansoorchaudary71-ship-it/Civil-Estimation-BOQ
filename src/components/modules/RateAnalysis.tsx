import React, { useMemo, useState } from "react";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import {
  TrendingUp,
  Settings,
  DollarSign,
  Database,
  Activity,
  Layers,
  PenTool,
  Save,
} from "lucide-react";
import { useMarketRates, MarketRates } from "../../context/MarketRatesContext";
import { useSettings } from "../../context/SettingsContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MarketRatesTrendChart } from "../ui/MarketRatesTrendChart";

import { saveEstimate } from "../../lib/estimates";
import { CalculationHistory } from "../ui/CalculationHistory";
import { useAuth } from "../../contexts/AuthContext";
export default function RateAnalysis() {
  const { rates, updateRate } = useMarketRates();
  const { settings, convertAmount, convertAmountToRaw, formatCurrency } =
    useSettings();
  const { user } = useAuth();
  
  
  const handleRateChange = (key: keyof MarketRates, valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      updateRate(key, val);
    }
  };
  /* Composite Calculation: 1 m3 of 1:2:4 Concrete */ const compositeCalc =
    useMemo(() => {
      const dryVol = CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
      /* m3 */ const sumRatio = 1 + 2 + 4;
      /* Cement Component (1 part) */ const cementVol = (1 / sumRatio) * dryVol;
      /* m3 */ const cementBags = cementVol / CIVIL_CONSTANTS.CEMENT_BAG_VOLUME_M3;
      /* approx 6.34 // Sand Component (2 parts) */ const sandVol =
        (2 / sumRatio) * dryVol;
      /* m3 */ const sandCft = sandVol * CIVIL_CONSTANTS.M3_TO_CFT;
      /* approx 15.54 cft // Crush Component (4 parts) */ const crushVol =
        (4 / sumRatio) * dryVol;
      /* m3 */ const crushCft = crushVol * CIVIL_CONSTANTS.M3_TO_CFT;
      /* approx 31.08 cft */ const costCement = cementBags * rates.cement;
      const costSand = sandCft * rates.sand;
      const costCrush = crushCft * rates.crush;
      /* Assumed fixed rates for labor and tools for mixing/pouring 1m3 */ const costLabor = 1500;
      const costEquipment = 800;
      const primeCost =
        costCement + costSand + costCrush + costLabor + costEquipment;
      const overheadCost = primeCost * (rates.overheadMarkup / 100);
      const finalRate = primeCost + overheadCost;
      return {
        cementBags,
        costCement,
        sandCft,
        costSand,
        crushCft,
        costCrush,
        costLabor,
        costEquipment,
        primeCost,
        overheadCost,
        finalRate,
      };
    }, [rates]);
  return (
    <div className="w-full h-full bg-transparent text-slate-900 font-sans p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Rate Inputs */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-[#FAFAF8] hover:bg-[#FDFCF9] transition-colors duration-500/80 p-4 sm:p-8 md:p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(15,23,42,0.06)] border border-gray-100 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[24px] shadow-sm border border-emerald-100 overflow-hidden">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">
                    Global Material Rates
                  </h2>
                  <p className="text-base font-medium mt-1 uppercase tracking-wider">
                    Updates globally in real-time
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Material Input Cards */}
                <InputCard
                  label="Cement (per Bag)"
                  value={parseFloat(convertAmount(rates.cement).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "cement",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Steel (per kg)"
                  value={parseFloat(convertAmount(rates.steel).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "steel",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Sand (per cft)"
                  value={parseFloat(convertAmount(rates.sand).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "sand",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Crush (per cft)"
                  value={parseFloat(convertAmount(rates.crush).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "crush",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Bricks (per Piece)"
                  value={parseFloat(convertAmount(rates.bricks).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "bricks",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <div className="col-span-1 sm:col-span-2 pt-4 pb-2">
                  <h3 className="text-base font-medium uppercase tracking-widest border-b border-gray-100 pb-2">
                    Finishing & Labor
                  </h3>
                </div>
                <InputCard
                  label="Tiles (per Box)"
                  value={parseFloat(convertAmount(rates.tiles).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "tiles",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Paint (per Liter)"
                  value={parseFloat(convertAmount(rates.paint).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "paint",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Labour (Grey / sqft)"
                  value={parseFloat(convertAmount(rates.laborGrey).toFixed(2))}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "laborGrey",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <InputCard
                  label="Finish Multiplier Base"
                  value={parseFloat(
                    convertAmount(rates.laborFinish).toFixed(2),
                  )}
                  unit={settings.currency}
                  onChange={(v) =>
                    handleRateChange(
                      "laborFinish",
                      convertAmountToRaw(parseFloat(v)).toString(),
                    )
                  }
                />
                <div className="col-span-1 sm:col-span-2 bg-transparent px-4 py-3 rounded-[24px] border border-slate-100 flex items-center justify-between overflow-hidden">
                  <div>
                    <div className="font-bold text-slate-700">
                      Contractor Overhead & Profit
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      Applied to composite items
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <><label htmlFor="a11y-input-412" className="sr-only">Input</label>
<input id="a11y-input-412" type="number" inputMode="decimal"
                      className="w-24 bg-[#FAFAF8] hover:bg-[#FDFCF9] transition-colors duration-500 border border-slate-200 rounded-full px-3 py-2 text-center text-lg font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/30 min-h-[44px]"
                      value={rates.overheadMarkup}
                      onChange={(e) =>
                        handleRateChange("overheadMarkup", e.target.value)
                      }
                    /></>
                    <span className="text-lg font-bold tabular-nums tracking-tight text-slate-700">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Composite Rate Analyzer */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-4 sm:p-8 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden text-slate-900">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[24px] backdrop-blur border border-slate-100 overflow-hidden">
                      <Activity className="w-5 h-5 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold">
                      Composite Item Analysis
                    </h3>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-900 leading-tight">
                    1.0 m³ Concrete
                  </h4>
                  <p className="text-teal-400/80 font-mono text-sm mt-1 mb-4 border-b border-slate-100 pb-4">
                    Mix Ratio 1:2:4 | 1.54 Dry Vol
                  </p>
                  <div className="h-48 w-full mb-6 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Cement",
                            value: compositeCalc.costCement,
                            color: "#94a3b8",
                          },
                          {
                            name: "Sand",
                            value: compositeCalc.costSand,
                            color: "#fcd34d",
                          },
                          {
                            name: "Crush",
                            value: compositeCalc.costCrush,
                            color: "#a3a3a3",
                          },
                          {
                            name: "Labor/Eq",
                            value:
                              compositeCalc.costLabor +
                              compositeCalc.costEquipment,
                            color: "#0ea5e9",
                          },
                          {
                            name: "Overhead",
                            value: compositeCalc.overheadCost,
                            color: "#10b981",
                          },
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            `${(convertAmount(value) / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#1e293b",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            {
                              name: "Cement",
                              value: compositeCalc.costCement,
                              color: "#94a3b8",
                            },
                            {
                              name: "Sand",
                              value: compositeCalc.costSand,
                              color: "#fcd34d",
                            },
                            {
                              name: "Crush",
                              value: compositeCalc.costCrush,
                              color: "#a3a3a3",
                            },
                            {
                              name: "Labor/Eq",
                              value:
                                compositeCalc.costLabor +
                                compositeCalc.costEquipment,
                              color: "#0ea5e9",
                            },
                            {
                              name: "Overhead",
                              value: compositeCalc.overheadCost,
                              color: "#10b981",
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-700 group-hover:text-slate-300 transition-colors">
                        Cement ({compositeCalc.cementBags.toFixed(2)} Bags)
                      </span>
                      <span className="font-bold text-slate-200">
                        {formatCurrency(compositeCalc.costCement)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-700 group-hover:text-slate-300 transition-colors">
                        Sand ({compositeCalc.sandCft.toFixed(2)} cft)
                      </span>
                      <span className="font-bold text-slate-200">
                        {formatCurrency(compositeCalc.costSand)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-700 group-hover:text-slate-300 transition-colors">
                        Crush ({compositeCalc.crushCft.toFixed(2)} cft)
                      </span>
                      <span className="font-bold text-slate-200">
                        {formatCurrency(compositeCalc.costCrush)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-white/5">
                      <span>Labor & Equipment</span>
                      <span>
                        {formatCurrency(
                          compositeCalc.costLabor + compositeCalc.costEquipment,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-mono">
                      {formatCurrency(compositeCalc.primeCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                    <span>
                      Overhead & Profit ({rates.overheadMarkup}%)
                    </span>
                    <span className="font-mono text-emerald-400">
                      +{formatCurrency(compositeCalc.overheadCost)}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 backdrop-blur-md rounded-[24px] px-4 py-3 border border-slate-100 mt-4 flex items-center justify-between overflow-hidden">
                    <span className="text-[10px] sm:text-base font-medium tracking-tight uppercase tracking-[0.15em] text-slate-300">
                      Analyzed Rate
                    </span>
                    <div className="flex items-end gap-1">
                      <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all sm:text-[clamp(1.75rem,5vw,2.5rem)] break-all tracking-tight font-bold tabular-nums tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                        {formatCurrency(compositeCalc.finalRate)}
                      </span>
                      <span className="text-sm font-medium text-teal-400 pb-0.5">
                        / m³
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4 items-center">
                    
                    
                    
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <MarketRatesTrendChart />
      </div>
      <CalculationHistory
        calculatorId="rate_analysis_v1"
        estimationName="Rate Analysis"
        currentInputs={{ rates }}
        currentResults={{ 
          finalRate: compositeCalc.finalRate.toFixed(2),
          primeCost: compositeCalc.primeCost.toFixed(2),
          overheadCost: compositeCalc.overheadCost.toFixed(2),
        }}
        summaryGeneration={(inputs, res) => `Analyzed Rate: ${res.finalRate}/m³`}
        onRestore={(inputs) => {
          // Complex state - rates context handles values, might not be fully restorable
        }}
      />
    </div>
  );
}
function InputCard({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: string) => void;
}) {
  const symbol = unit === "PKR" ? "Rs" : unit === "USD" ? "$" : unit;
  return (
    <div className="group bg-gray-50/50 hover:bg-[#FAFAF8] hover:bg-[#FDFCF9] transition-colors duration-500 border border-gray-100 hover:border-emerald-200 px-4 py-3 rounded-[24px] transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <label className="text-base font-medium tracking-wide">
          {label}
        </label>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-bold mb-0.5 pointer-events-none">
              {symbol}
            </span>
            <><label htmlFor="a11y-input-413" className="sr-only">Input</label>
<input id="a11y-input-413"
              type="number" inputMode="decimal"
              min="0"
              step="any"
              className={`w-full bg-[#FAFAF8] hover:bg-[#FDFCF9] transition-colors duration-500 border border-gray-200 rounded-[24px] py-2.5 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/30 transition-shadow ${symbol.length > 1 ? "pl-10" : "pl-7"}`}
              value={value}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                if (!isNaN(num) && num < 0) return;
                onChange(e.target.value);
              }}
            /></>
          </div>
          <span className="text-base font-medium uppercase w-10 text-right rounded-full">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
