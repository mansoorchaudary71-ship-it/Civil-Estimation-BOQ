import { Button } from '../ui/Button';
import React, { useMemo, useState } from 'react';
import {
  Sun, Battery, Zap, DollarSign, Home, AlertCircle,
  BarChart3, Settings, Download, RotateCcw, Copy, Printer, Check,
} from "lucide-react";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { FormulaAccordion } from "../ui/FormulaAccordion";
import { exportBOQToPDF } from "../../lib/pdfExport";
import {
  SOLAR_CITY_PRESETS,
  SOLAR_CURRENCY_SYMBOL,
  calcSolarRoof,
  defaultSolarRoofInputs,
  validateSolarRoofInputs,
  type SolarBatteryType,
  type SolarGridType,
} from "../../lib/solarRoofCalc";
import type { MepCity as MepCityType } from "../../lib/mepConstants";


type CityKey = MepCityType;

export default function SolarRoofCalculator() {
  const [city, setCity] = useState<CityKey>("Lahore");
  const [inputs, setInputs] = useState(() => defaultSolarRoofInputs("Lahore"));
  const [copied, setCopied] = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);

  const set = <K extends keyof typeof inputs>(key: K, value: (typeof inputs)[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const applyCity = (c: CityKey) => {
    const p = SOLAR_CITY_PRESETS[c];
    setCity(c);
    setInputs((prev) => ({
      ...prev,
      psh: p.psh,
      tariffPerKwh: p.tariff,
      panelCostPerW: p.panelCostPerW,
      inverterCostPerKva: p.inverterCostPerKva,
      batteryCostPerKwh: p.batteryCostPerKwh,
      currency: p.currency,
    }));
  };

  const { result, errors } = useMemo(() => {
    try {
      const errs = validateSolarRoofInputs(inputs);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcSolarRoof(inputs), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [inputs]);

  const sym = SOLAR_CURRENCY_SYMBOL[inputs.currency ?? "PKR"];
  const fmt = (v: number | null | undefined) =>
    v == null || !isFinite(v) ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`;
  const derivedPanelArea =
    (inputs.panelWattage ?? 545) / (1000 * ((inputs.panelEfficiencyPct ?? 21) / 100));

  const summaryText = result
    ? `Solar roof — ${city}, ${inputs.monthlyUnitsKwh} kWh/month\nSystem ${result.actualKw.toFixed(2)} kWp (${result.panels} x ${inputs.panelWattage} W panels); inverter ${result.inverterKva} kVA${result.hasBattery ? `; battery ${result.batteryActualKwh.toFixed(1)} kWh (${result.batteryModules} modules, +${result.batteryOversizePct.toFixed(1)}% oversize from module rounding)` : "; no battery"}\nRoof needed ${result.roofAreaRequiredM2.toFixed(1)} m² of ${inputs.roofAreaM2} m² available\nTotal cost ${fmt(result.totalCost)} (${fmt(result.costPerKwp)} / kWp); year-1 savings ${fmt(result.annualSavingsYear1)}\nSimple payback ${result.simplePaybackYears?.toFixed(1) ?? "—"} years; NPV (10%) ${fmt(result.npv)}; IRR ${result.irrPct?.toFixed(1) ?? "—"}%; LCOE ${result.lcoePerKwh.toFixed(2)} / kWh`
    : "";

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handlePdf = () => {
    if (!result) return;
    exportBOQToPDF({
      projectName: "Solar Roof System",
      date: new Date().toLocaleDateString(),
      items: [
        { description: `Solar panels (${result.panels} x ${inputs.panelWattage} W)`, quantity: result.actualKw, unit: "kWp", rate: result.panelsCost / (result.actualKw || 1), amount: result.panelsCost },
        { description: `Inverter (${result.inverterKva} kVA)`, quantity: result.inverterKva, unit: "kVA", rate: inputs.inverterCostPerKva ?? 0, amount: result.inverterCost },
        ...(result.hasBattery ? [{ description: `Battery (${result.batteryActualKwh.toFixed(1)} kWh)`, quantity: result.batteryActualKwh, unit: "kWh", rate: inputs.batteryCostPerKwh ?? 0, amount: result.batteryCost }] : []),
        { description: "Mounting structure", quantity: result.panels, unit: "panels", rate: inputs.structureCostPerPanel ?? 0, amount: result.mountingCost },
        { description: "Wiring", quantity: 1, unit: "lot", rate: result.wiringCost, amount: result.wiringCost },
        { description: "Net metering fee", quantity: 1, unit: "lot", rate: result.netMeteringFee, amount: result.netMeteringFee },
        { description: "Labour", quantity: 1, unit: "lot", rate: result.labourCost, amount: result.labourCost },
        { description: "Contingency", quantity: 1, unit: "lot", rate: result.contingencyCost, amount: result.contingencyCost },
      ],
      totalAmount: result.totalCost,
    });
  };
  const handleCsv = () => {
    if (!result) return;
    const rows = ["Year,Generation (kWh),Tariff, Gross Savings,Maintenance,Inverter Replacement,Net Savings,Cumulative"];
    for (const c of result.cashFlows) {
      rows.push(`${c.year},${c.generationKwh.toFixed(0)},${c.tariffPerKwh.toFixed(2)},${c.grossSavings.toFixed(0)},${c.maintenance.toFixed(0)},${c.inverterReplacement.toFixed(0)},${c.netSavings.toFixed(0)},${c.cumulative.toFixed(0)}`);
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "solar-cashflow.csv"; a.click();
    URL.revokeObjectURL(url);
    setCsvCopied(true); setTimeout(() => setCsvCopied(false), 2000);
  };
  const resetCalc = () => { setCity("Lahore"); setInputs(defaultSolarRoofInputs("Lahore")); };

  const inputCls = "w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none";

  return (
    <div className="w-full bg-surface-default text-txt-primary rounded-2xl overflow-hidden shadow-brand-sm border border-ui-borderSubtle">
      <div className="bg-surface-hover border-b border-ui-borderSubtle p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-100 mb-3">
              <Sun className="w-4 h-4 text-accent-800" />
              <span className="text-base font-medium text-accent-800 uppercase tracking-wider">Pro Solar Evaluator</span>
            </div>
            <h2 className="text-xl md:text-xl font-semibold text-txt-primary tracking-tight">Solar Energy System Calculator</h2>
            <p className="text-txt-tertiary mt-2 max-w-2xl text-sm">Complete solar array, inverter, battery and financial payback analysis for PK, IN and UAE markets. Export credit defaults to 20% of the import tariff (NEPRA buyback).</p>
          </div>
          <Button onClick={resetCalc} className="flex items-center gap-2 px-4 py-2 bg-surface-default hover:bg-surface-hover text-txt-secondary rounded-full transition-all font-medium text-sm border border-ui-borderSubtle shadow-brand-sm">
            <RotateCcw className="w-4 h-4" /> Reset Data
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-8">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}</Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><Printer size={16} /> Print</Button>
          <Button onClick={handlePdf} disabled={!result} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700"><Download size={16} /> Download PDF</Button>
          <Button onClick={handleCsv} disabled={!result} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><BarChart3 size={16} /> {csvCopied ? "CSV downloaded" : "Download cash-flow CSV"}</Button>
        </div>

        {errors.length > 0 && (
          <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4 text-sm text-ui-errorText flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><div>{errors.map((e) => <p key={e}>{e}</p>)}</div></div>
        )}
        {result?.billCrossCheckWarning && (
          <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4 text-sm text-txt-secondary flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-accent-800" /><p>{result.billCrossCheckWarning}</p></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Home className="text-accent-800" /> Site &amp; Load</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5">Location / City</label>
                  <select value={city} onChange={(e) => applyCity(e.target.value as CityKey)} className={inputCls}>
                    {(Object.keys(SOLAR_CITY_PRESETS) as CityKey[]).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <NumberInput label="Avg. Monthly Electricity Bill" unit={sym} value={inputs.monthlyBill ?? ""} onChange={(v) => set("monthlyBill", v === "" ? null : v)} />
                <NumberInput label="Avg. Monthly Units Consumed" unit="kWh" value={inputs.monthlyUnitsKwh} onChange={(v) => set("monthlyUnitsKwh", v === "" ? 0 : v)} requirePositive />
                <NumberInput label="Peak Daily Load" unit="kW" value={inputs.peakLoadKw ?? 0} onChange={(v) => set("peakLoadKw", v === "" ? 0 : v)} />
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5">Grid Type</label>
                  <select value={inputs.gridType} onChange={(e) => set("gridType", e.target.value as SolarGridType)} className={inputCls}>
                    <option value="On-Grid">On-Grid</option><option value="Hybrid">Hybrid</option><option value="Off-Grid">Off-Grid</option>
                  </select>
                </div>
                <NumberInput label="Available Roof Area" unit="m²" value={inputs.roofAreaM2 ?? 0} onChange={(v) => set("roofAreaM2", v === "" ? 0 : v)} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Sun className="text-accent-800" /> Solar Potential</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput label="Peak Sun Hours (PSH)" unit="h/day" value={inputs.psh} onChange={(v) => set("psh", v === "" ? 0 : v)} error={errors.find((e) => e.includes("Peak sun"))} />
                <NumberInput label="System Losses" unit="%" value={inputs.systemLossesPct ?? 14} onChange={(v) => set("systemLossesPct", v === "" ? 0 : v)} error={errors.find((e) => e.includes("System losses"))} />
                <NumberInput label="Panel Wattage" unit="W" value={inputs.panelWattage ?? 545} onChange={(v) => set("panelWattage", v === "" ? 0 : v)} />
                <NumberInput label="Panel Efficiency" unit="%" value={inputs.panelEfficiencyPct ?? 21} onChange={(v) => set("panelEfficiencyPct", v === "" ? 0 : v)} />
                <NumberInput label="Tilt" unit="°" value={inputs.tiltDeg ?? 31} onChange={(v) => set("tiltDeg", v === "" ? 0 : v)} />
                <NumberInput label="Panel Area (each)" unit="m²" value={inputs.panelAreaM2 ?? 2.58} onChange={(v) => set("panelAreaM2", v === "" ? 0 : v)} />
              </div>
              <p className="text-xs text-txt-tertiary mt-2">Panel efficiency implies a panel area of {derivedPanelArea.toFixed(2)} m² (panel W ÷ (1000 × efficiency)). {result?.optimalTiltHint}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Battery className="text-accent-800" /> Inverter &amp; Battery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput label="Inverter Efficiency" unit="%" value={inputs.inverterEfficiencyPct ?? 97} onChange={(v) => set("inverterEfficiencyPct", v === "" ? 0 : v)} />
                <NumberInput label="Battery Autonomy" unit="days" value={inputs.batteryAutonomyDays ?? 1} onChange={(v) => set("batteryAutonomyDays", v === "" ? 0 : v)} />
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5">Battery Type (sets depth of discharge)</label>
                  <select value={inputs.batteryType} onChange={(e) => set("batteryType", e.target.value as SolarBatteryType)} className={inputCls}>
                    <option value="lifepo4">LiFePO4 — 80% DoD</option><option value="leadAcid">Lead-acid — 50% DoD</option>
                  </select>
                </div>
                <NumberInput label="Battery Voltage" unit="V" value={inputs.batteryVoltage ?? 48} onChange={(v) => set("batteryVoltage", v === "" ? 0 : v)} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign className="text-accent-800" /> System Cost ({sym})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput label="Panel Cost per Watt" unit={sym} value={inputs.panelCostPerW ?? 0} onChange={(v) => set("panelCostPerW", v === "" ? 0 : v)} />
                <NumberInput label="Inverter Cost per kVA" unit={sym} value={inputs.inverterCostPerKva ?? 0} onChange={(v) => set("inverterCostPerKva", v === "" ? 0 : v)} />
                <NumberInput label="Battery Cost per kWh" unit={sym} value={inputs.batteryCostPerKwh ?? 0} onChange={(v) => set("batteryCostPerKwh", v === "" ? 0 : v)} />
                <NumberInput label="Structure Cost per Panel" unit={sym} value={inputs.structureCostPerPanel ?? 0} onChange={(v) => set("structureCostPerPanel", v === "" ? 0 : v)} />
                <NumberInput label="Wiring" unit="%" value={inputs.wiringPct ?? 8} onChange={(v) => set("wiringPct", v === "" ? 0 : v)} />
                <NumberInput label="Labour" unit="%" value={inputs.labourPct ?? 10} onChange={(v) => set("labourPct", v === "" ? 0 : v)} />
                <NumberInput label="Net Metering Fee" unit={sym} value={inputs.netMeteringFee ?? 0} onChange={(v) => set("netMeteringFee", v === "" ? 0 : v)} />
                <NumberInput label="Contingency" unit="%" value={inputs.contingencyPct ?? 5} onChange={(v) => set("contingencyPct", v === "" ? 0 : v)} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Zap className="text-accent-800" /> Production, Savings &amp; Finance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput label="Grid Tariff" unit={sym + "/kWh"} value={inputs.tariffPerKwh ?? 0} onChange={(v) => set("tariffPerKwh", v === "" ? 0 : v)} />
                <NumberInput label="Export Rate (% of import tariff)" unit="%" value={inputs.exportRatePct ?? 20} onChange={(v) => set("exportRatePct", v === "" ? 0 : v)} error={errors.find((e) => e.includes("Export rate"))} />
                <NumberInput label="Panel Degradation" unit="%/yr" value={inputs.degradationPctPerYear ?? 0.5} onChange={(v) => set("degradationPctPerYear", v === "" ? 0 : v)} />
                <NumberInput label="Maintenance" unit="%/yr" value={inputs.maintenancePctPerYear ?? 0.5} onChange={(v) => set("maintenancePctPerYear", v === "" ? 0 : v)} />
                <NumberInput label="Tariff Escalation" unit="%/yr" value={inputs.tariffEscalationPctPerYear ?? 10} onChange={(v) => set("tariffEscalationPctPerYear", v === "" ? 0 : v)} />
                <NumberInput label="System Lifespan" unit="years" value={inputs.lifespanYears ?? 25} onChange={(v) => set("lifespanYears", v === "" ? 0 : v)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-txt-secondary mt-4">
                <input type="checkbox" checked={inputs.loanEnabled ?? false} onChange={(e) => set("loanEnabled", e.target.checked)} className="w-4 h-4 text-accent-800 rounded" /> Finance part of the cost with a loan
              </label>
              {inputs.loanEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <NumberInput label="Loan Share" unit="%" value={inputs.loanPctOfCost ?? 70} onChange={(v) => set("loanPctOfCost", v === "" ? 0 : v)} />
                  <NumberInput label="Interest" unit="%/yr" value={inputs.loanInterestPctPerYear ?? 18} onChange={(v) => set("loanInterestPctPerYear", v === "" ? 0 : v)} />
                  <NumberInput label="Tenure" unit="years" value={inputs.loanTenureYears ?? 5} onChange={(v) => set("loanTenureYears", v === "" ? 0 : v)} />
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {result ? (
              <>
                <MaterialSummary title="Solar System Results" totalLabel="Total System Cost" totalValue={fmt(result.totalCost)} totalUnit="" relatedToolIds={[]}>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ResultCard title="System Size" value={result.actualKw.toFixed(2)} unit="kWp" variant="primary" />
                    <ResultCard title="Panels" value={result.panels} unit={`× ${inputs.panelWattage} W`} variant="neutral" />
                    <ResultCard title="Inverter" value={result.inverterKva} unit="kVA" variant="neutral" />
                    <ResultCard title="Battery" value={result.hasBattery ? result.batteryActualKwh.toFixed(1) : "—"} unit={result.hasBattery ? `kWh (+${result.batteryOversizePct.toFixed(0)}%)` : "On-grid"} variant="info" />
                    <ResultCard title="Annual Generation" value={result.annualGenerationKwh.toFixed(0)} unit="kWh/yr" variant="neutral" />
                    <ResultCard title="Year-1 Savings" value={fmt(result.annualSavingsYear1)} unit="/ year" variant="success" />
                    <ResultCard title="Simple Payback" value={result.simplePaybackYears?.toFixed(1) ?? "—"} unit="years" variant="primary" />
                    <ResultCard title="Cost per kWp" value={fmt(result.costPerKwp)} unit="" variant="neutral" />
                    <ResultCard title="NPV (10% discount)" value={fmt(result.npv)} unit="" variant="primary" />
                    <ResultCard title="IRR" value={result.irrPct?.toFixed(1) ?? "—"} unit="%" variant="primary" />
                    <ResultCard title="LCOE" value={result.lcoePerKwh.toFixed(2)} unit={`${sym}/kWh`} variant="info" />
                    <ResultCard title="CO₂ Avoided" value={result.annualCo2Kg.toFixed(0)} unit="kg/yr (est.)" variant="success" />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-txt-secondary mb-1"><span>Roof used: {result.roofAreaRequiredM2.toFixed(1)} m² of {inputs.roofAreaM2} m²</span><span>{result.roofFits ? "Fits" : "Does not fit — reduce system size"}</span></div>
                    <div className="h-3 bg-surface-hover rounded-full overflow-hidden">
                      <div className={`h-full ${result.roofFits ? "bg-accent-500" : "bg-ui-errorText"}`} style={{ width: `${Math.min(100, (result.roofAreaRequiredM2 / (inputs.roofAreaM2 || 1)) * 100)}%` }} />
                    </div>
                    {result.hasBattery && <p className="text-xs text-txt-tertiary mt-2">Roof fits up to {result.maxPanelsOnRoof} panels ({result.maxKwOnRoof.toFixed(2)} kWp). Battery note: rounding up to {result.batteryModules} × 200 Ah × {inputs.batteryVoltage} V modules oversizes the battery by {result.batteryOversizePct.toFixed(1)}% — that is why the battery dominates the cost.</p>}
                    {!result.hasBattery && <p className="text-xs text-txt-tertiary mt-2">Roof fits up to {result.maxPanelsOnRoof} panels ({result.maxKwOnRoof.toFixed(2)} kWp). On-grid system — no battery.</p>}
                    {result.loanMonthlyInstalment != null && <p className="text-xs text-txt-secondary mt-2">Loan: {fmt(result.loanMonthlyInstalment)} / month; total interest {fmt(result.loanTotalInterest)} over {inputs.loanTenureYears} years.</p>}
                  </div>
                </MaterialSummary>
                <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 overflow-x-auto">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent-800" /> Cash Flow (first 10 years; inverter replaced in year 12)</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-txt-secondary border-b border-border-color"><th className="py-2 pr-3">Year</th><th className="py-2 pr-3 text-right">Generation</th><th className="py-2 pr-3 text-right">Net saving</th><th className="py-2 text-right">Cumulative</th></tr></thead>
                    <tbody>
                      {result.cashFlows.slice(0, 10).map((c) => (
                        <tr key={c.year} className="border-b border-border-color">
                          <td className="py-2 pr-3">{c.year}</td>
                          <td className="py-2 pr-3 text-right font-mono">{c.generationKwh.toFixed(0)} kWh</td>
                          <td className="py-2 pr-3 text-right font-mono">{fmt(c.netSavings)}</td>
                          <td className="py-2 text-right font-mono font-bold">{fmt(c.cumulative)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-txt-tertiary mt-2">Lifetime net savings over {inputs.lifespanYears} years: {fmt(result.lifetimeNetSavings)}. CO₂ factor 0.5 kg/kWh is a grid-average estimate.</p>
                </div>
                <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "req kW = (daily demand / PSH) / derate", applied: s }))} />
              </>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm">Enter valid inputs to see the solar sizing.</div>
            )}
          </div>
        </div>

        <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 text-sm text-txt-secondary flex gap-2">
          <Settings className="w-4 h-4 shrink-0 text-accent-800" />
          <span>Planning estimate only — not a substitute for a licensed solar designer or structural engineer. Rates are indicative (Nov 2026) — confirm panel, inverter and battery prices with your supplier, and confirm the NEPRA export rate before signing a net-metering agreement.</span>
        </div>
      </div>
      <div className="p-4 md:p-8 pt-0">
        <div className="mt-6">
          <CalculationHistory calculatorId="solar_roof" currentInputs={{ city, monthlyUnits: inputs.monthlyUnitsKwh, psh: inputs.psh, gridType: inputs.gridType }} currentResults={result ? { actualKw: result.actualKw, panels: result.panels, totalCost: result.totalCost, paybackYears: result.simplePaybackYears } : {}} />
        </div>
      </div>
    </div>
  );
}
