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
import { analyseMix, MIXES } from "../../lib/rateAnalysis";
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

import { saveEstimate } from "../../lib/estimates";
import { CalculationHistory } from "../ui/CalculationHistory";
import { useAuth } from "../../contexts/AuthContext";
export default function RateAnalysis() {
  const { rates, updateRate } = useMarketRates();
  const [mixId, setMixId] = useState("pcc124");
  const [steelKgPerM3, setSteelKgPerM3] = useState(100);
  const { settings, convertAmount, convertAmountToRaw, formatCurrency } =
    useSettings();
  const { user } = useAuth();
  
  
  const handleRateChange = (key: keyof MarketRates, valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      updateRate(key, val);
    }
  };
  /* CPWD rate analysis via the shared engine (src/lib/rateAnalysis).
     The old crush default of 250/cft was ~3x market; rates now come from
     rates.ts via MarketRatesContext (crush 90/cft). The 1:2:4 path has no
     steel — it is PCC, not RCC; RCC mixes add steel at an editable kg/m³.
     CPWD: +1% water charges, then +15% CPOH on (prime + water). */
  const selectedMix = MIXES.find((m) => m.id === mixId) ?? MIXES[0];
  const compositeCalc = useMemo(() => {
    const r = analyseMix(selectedMix, {
      cementPerBag: rates.cement,
      sandPerCft: rates.sand,
      crushPerCft: rates.crush,
      steelPerKg: rates.steel,
      labour: 1500,
      equipment: 800,
      steelKgPerM3,
      waterPct: 1,
      cpohPct: rates.overheadMarkup,
    });
    return {
      cementBags: r.cementBags,
      costCement: r.cementCost,
      sandCft: r.sandCft,
      costSand: r.sandCost,
      crushCft: r.crushCft,
      costCrush: r.crushCost,
      steelKg: r.steelKg,
      costSteel: r.steelCost,
      costLabor: 1500,
      costEquipment: 800,
      primeCost: r.primeCost,
      waterCost: r.waterCost,
      overheadCost: r.cpohCost,
      finalRate: r.finalRate,
      notes: r.notes,
    };
  }, [rates, selectedMix, steelKgPerM3]);
  return (
    <div className="w-full h-full bg-transparent text-txt-primary font-sans p-6 md:p-8">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
        
        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
          {/* Rate Inputs */}
          <section className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col space-y-6">
            <div className="bg-surface-default hover:bg-surface-hover transition-colors duration-500/80 p-4 sm:p-8 md:p-8 rounded-2xl shadow-[0_8px_32px_rgba(31,29,26,0.06)] border border-border-color backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-ui-success text-ui-successText rounded-2xl shadow-brand-sm border border-ui-successBorder overflow-hidden">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-txt-primary">
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
                  <h3 className="text-base font-medium uppercase tracking-widest border-b border-border-color pb-2">
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
                <div className="col-span-1 sm:col-span-2 bg-transparent px-4 py-3 rounded-2xl border border-border-color flex items-center justify-between overflow-hidden">
                  <div>
                    <div className="font-bold text-txt-secondary">
                      Contractor Overhead & Profit
                    </div>
                    <div className="text-sm text-txt-tertiary font-medium">
                      Applied to composite items
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <><label htmlFor="a11y-input-412" className="sr-only">Input</label>
<input id="a11y-input-412" type="number" inputMode="decimal"
                      className="w-24 bg-surface-default hover:bg-surface-hover transition-colors duration-500 border border-ui-borderSubtle rounded-full px-3 py-2 text-center text-lg font-bold text-ui-successText focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]"
                      value={rates.overheadMarkup}
                      onChange={(e) =>
                        handleRateChange("overheadMarkup", e.target.value)
                      }
                    /></>
                    <span className="text-lg font-bold tabular-nums tracking-tight text-txt-secondary">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Composite Rate Analyzer */}
          <section className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
            <div className="bg-gradient-to-b from-ink to-ink p-4 sm:p-8 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden text-txt-primary">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary rounded-2xl backdrop-blur border border-border-color overflow-hidden">
                      <Activity className="w-5 h-5 text-accent-400" />
                    </div>
                    <h3 className="text-lg font-bold">
                      Composite Item Analysis
                    </h3>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-txt-primary tabular-nums tracking-tight text-txt-primary leading-tight">
                    1.0 m³ Concrete
                  </h4>
                  <p className="text-accent-400/80 font-mono text-sm mt-1 mb-4 border-b border-border-color pb-4">
                    {selectedMix.label} — CPWD sheet (dry vol ×{selectedMix.dryFactor})
                  </p>
                  <div className="mb-4 flex flex-wrap gap-3 items-center">
                    <label className="text-sm font-semibold text-txt-primary">Item
                      <select value={mixId} onChange={(e) => setMixId(e.target.value)} className="ml-2 bg-surface-default text-txt-primary rounded-full px-3 py-2 text-sm font-bold">
                        {MIXES.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
                      </select>
                    </label>
                    {mixId.startsWith("rcc") && (
                      <label className="text-sm font-semibold text-txt-primary">Steel kg/m³
                        <input type="number" min={80} max={120} value={steelKgPerM3} onChange={(e) => setSteelKgPerM3(Math.max(80, Math.min(120, Number(e.target.value) || 100)))} className="ml-2 w-20 bg-surface-default text-txt-primary rounded-full px-3 py-2 text-sm font-bold" />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-txt-tertiary mb-4">{selectedMix.id.startsWith("rcc") ? "RCC — steel included at the editable kg/m³ above (default 100, range 80–120)." : "No steel in this item — this is PCC / mortar, not RCC. CPWD reference for 1:2:4: 6.4 bags cement, 0.445 m³ sand, 0.89 m³ aggregate per m³."}</p>
                  <p className="text-xs text-txt-tertiary mb-4">Crush is Rs {rates.crush}/cft from the dated rate table — the old 250/cft default was ~3× market and inflated this rate by ~35%.</p>
                  <div className="h-48 w-full mb-6 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: "Cement",
                            value: compositeCalc.costCement,
                            color: "rgb(107, 104, 98)",
                          },
                          {
                            name: "Sand",
                            value: compositeCalc.costSand,
                            color: "rgb(242, 164, 19)",
                          },
                          {
                            name: "Crush",
                            value: compositeCalc.costCrush,
                            color: "rgb(107, 104, 98)",
                          },
                          {
                            name: "Labor/Eq",
                            value:
                              compositeCalc.costLabor +
                              compositeCalc.costEquipment,
                            color: "rgb(15, 118, 110)",
                          },
                          {
                            name: "Overhead",
                            value: compositeCalc.overheadCost,
                            color: "rgb(15, 118, 110)",
                          },
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "rgb(107, 104, 98)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "rgb(107, 104, 98)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            `${(convertAmount(value) / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{
                            backgroundColor: "rgb(31, 29, 26)",
                            borderColor: "rgb(107, 104, 98)",
                            borderRadius: "12px",
                            color: "rgb(255, 255, 255)",
                          }}
                          formatter={(value: any) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            {
                              name: "Cement",
                              value: compositeCalc.costCement,
                              color: "rgb(107, 104, 98)",
                            },
                            {
                              name: "Sand",
                              value: compositeCalc.costSand,
                              color: "rgb(242, 164, 19)",
                            },
                            {
                              name: "Crush",
                              value: compositeCalc.costCrush,
                              color: "rgb(107, 104, 98)",
                            },
                            {
                              name: "Labor/Eq",
                              value:
                                compositeCalc.costLabor +
                                compositeCalc.costEquipment,
                              color: "rgb(15, 118, 110)",
                            },
                            {
                              name: "Overhead",
                              value: compositeCalc.overheadCost,
                              color: "rgb(15, 118, 110)",
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
                      <span className="text-txt-secondary group-hover:text-txt-tertiary transition-colors">
                        Cement ({compositeCalc.cementBags.toFixed(2)} Bags)
                      </span>
                      <span className="font-bold text-txt-inverse">
                        {formatCurrency(compositeCalc.costCement)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-txt-secondary group-hover:text-txt-tertiary transition-colors">
                        Sand ({compositeCalc.sandCft.toFixed(2)} cft)
                      </span>
                      <span className="font-bold text-txt-inverse">
                        {formatCurrency(compositeCalc.costSand)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-txt-secondary group-hover:text-txt-tertiary transition-colors">
                        Crush ({compositeCalc.crushCft.toFixed(2)} cft)
                      </span>
                      <span className="font-bold text-txt-inverse">
                        {formatCurrency(compositeCalc.costCrush)}
                      </span>
                    </div>
                    {compositeCalc.steelKg > 0 && (
                      <div className="flex justify-between items-center group">
                        <span className="text-txt-secondary group-hover:text-txt-tertiary transition-colors">Steel ({compositeCalc.steelKg.toFixed(1)} kg @ {steelKgPerM3} kg/m³)</span>
                        <span className="font-bold text-txt-inverse">{formatCurrency(compositeCalc.costSteel)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-txt-secondary pt-2 border-t border-white/5">
                      <span>Labor & Equipment</span>
                      <span>
                        {formatCurrency(
                          compositeCalc.costLabor + compositeCalc.costEquipment,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-border-color space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-txt-tertiary">
                    <span>Subtotal</span>
                    <span className="font-mono">
                      {formatCurrency(compositeCalc.primeCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-txt-tertiary">
                    <span>Water charges (CPWD 1% of prime)</span>
                    <span className="font-mono">+{formatCurrency(compositeCalc.waterCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-txt-tertiary">
                    <span>Overhead &amp; Profit / CPOH ({rates.overheadMarkup}%)</span>
                    <span className="font-mono text-ui-successText">+{formatCurrency(compositeCalc.overheadCost)}</span>
                  </div>
                  <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary backdrop-blur-md rounded-2xl px-4 py-3 border border-border-color mt-4 flex items-center justify-between overflow-hidden">
                    <span className="text-xs sm:text-base font-medium tracking-tight uppercase tracking-[0.15em] text-txt-tertiary">
                      Analyzed Rate
                    </span>
                    <div className="flex items-end gap-1">
                      <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all sm:text-[clamp(1.75rem,5vw,2.5rem)] break-all tracking-tight font-bold tabular-nums tracking-tight text-txt-primary dark:text-white leading-none whitespace-nowrap">
                        {formatCurrency(compositeCalc.finalRate)}
                      </span>
                      <span className="text-sm font-medium text-accent-400 pb-0.5">
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
        {/* The 6-month trend chart was removed: its series (crush 220–250/cft,
            bricks 15–18/pc, steel 280/kg) contradict the live rate table on
            this page (crush 90, bricks 23.355, steel 270) and the IN/AE
            trend lines were unsourced (rates.ts has IN/AE null). The chart
            component and its data live in files this wave may not edit, so
            the mount is removed here; re-add it only with sourced series. */}
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
        onRestore={(ins) => {
          if (ins.rates && typeof ins.rates === "object") {
            Object.entries(ins.rates as Record<string, unknown>).forEach(([k, v]) => {
              if (typeof v === "number") updateRate(k as keyof MarketRates, v);
            });
          }
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
    <div className="group bg-surface-default/50 hover:bg-surface-default hover:bg-surface-hover transition-colors duration-500 border border-border-color hover:border-ui-successBorder px-4 py-3 rounded-2xl transition-all shadow-brand-sm hover:shadow-brand-md flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <label className="text-base font-medium tracking-wide">
          {label}
        </label>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-secondary font-bold mb-0.5 pointer-events-none">
              {symbol}
            </span>
            <><label htmlFor="a11y-input-413" className="sr-only">Input</label>
<input id="a11y-input-413"
              type="number" inputMode="decimal"
              min="0"
              step="any"
              className={`w-full bg-surface-default hover:bg-surface-hover transition-colors duration-500 border border-border-color rounded-2xl py-2.5 text-lg font-bold text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-500 transition-shadow ${symbol.length > 1 ? "pl-10" : "pl-7"}`}
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
