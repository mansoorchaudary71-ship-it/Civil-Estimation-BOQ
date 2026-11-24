import { Button } from '../ui/Button';
import React, { useMemo, useState } from 'react';
import { Sun, AlertCircle, Copy, Printer, Download, Check } from 'lucide-react';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CalculationHistory } from '../ui/CalculationHistory';
import { exportBOQToPDF } from '../../lib/pdfExport';
import {
  SOLAR_COLLECTOR_TYPES,
  calcSolarWaterHeater,
  validateSolarWaterHeaterInputs,
  type SolarCollectorType,
} from '../../lib/solarWaterHeaterCalc';
import { useSettings } from "../../context/SettingsContext";


type UnitSystem = 'metric' | 'imperial';
const CUR_SYMBOLS: Record<string, string> = { PKR: "Rs", INR: "₹", AED: "AED" };
const INLET_PRESETS: Record<string, number> = { Lahore: 18, Karachi: 22, Islamabad: 12, Dubai: 24, Delhi: 16 };
const RADIATION_PRESETS: Record<string, number> = { Lahore: 5.0, Karachi: 5.6, Islamabad: 5.0, Dubai: 6.2, Delhi: 5.2 };

export function SolarWaterHeaterCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [occupants, setOccupants] = useState<number>(4);
  const [usagePerPerson, setUsagePerPerson] = useState<number>(50);
  const [solarRadiation, setSolarRadiation] = useState<number>(5.0);
  const [targetTemp, setTargetTemp] = useState<number>(60);
  const [inletTemp, setInletTemp] = useState<number>(18); // Lahore preset (default city)
  const [collectorType, setCollectorType] = useState<SolarCollectorType>('flatPlate');
  const [efficiency, setEfficiency] = useState<number>(50);
  const [solarFraction, setSolarFraction] = useState<number>(0.6);
  const [energyCost, setEnergyCost] = useState<number>(50);
  // Currency defaults to the global setting (PKR/INR/AED); the picker
  // still lets the user override it per tool. Rates are user-entered
  // (blank by default), so no rate defaults need clearing.
  const { settings } = useSettings();
  const initialCurrency: string = ["PKR", "INR", "AED"].includes(settings.currency) ? settings.currency : "PKR";
  const [currency, setCurrency] = useState(initialCurrency);
  const [ratePerM2, setRatePerM2] = useState<number | "">("");
  const [tankCostPerLitre, setTankCostPerLitre] = useState<number | "">("");
  const [copied, setCopied] = useState(false);

  const { result, errors } = useMemo(() => {
    try {
      const inp = {
        people: Number(occupants),
        usePerPersonL: Number(usagePerPerson),
        targetTempC: Number(targetTemp),
        inletTempC: Number(inletTemp),
        radiationKwhPerM2PerDay: Number(solarRadiation),
        collectorType,
        efficiencyPct: Number(efficiency),
        solarFraction: Number(solarFraction),
        energyCostPerKwh: Number(energyCost),
        ratePerM2Collector: ratePerM2 === "" ? undefined : Number(ratePerM2),
        tankCostPerLitre: tankCostPerLitre === "" ? undefined : Number(tankCostPerLitre),
      };
      const errs = validateSolarWaterHeaterInputs(inp);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcSolarWaterHeater(inp), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [occupants, usagePerPerson, targetTemp, inletTemp, solarRadiation, collectorType, efficiency, solarFraction, energyCost, ratePerM2, tankCostPerLitre]);

  const sym = CUR_SYMBOLS[currency] ?? "Rs";
  const fmt = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`);
  const collector = SOLAR_COLLECTOR_TYPES[collectorType];

  const summaryText = result
    ? `Solar water heater — ${occupants} people, ${result.demandLPerDay} L/day\nCollector area ${result.collectorAreaM2.toFixed(2)} m² (${result.panels} x 2 m² panels, ${result.installedAreaM2} m² installed)\nTank ${result.tankL} L; backup energy ${result.backupKwhPerDay.toFixed(2)} kWh/day\nAnnual saving ${fmt(result.annualSavings)}; system cost ${fmt(result.systemCost)}; payback ${result.paybackYears?.toFixed(1) ?? "—"} years`
    : "";
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handlePdf = () => {
    if (!result) return;
    exportBOQToPDF({
      projectName: "Solar Water Heater",
      date: new Date().toLocaleDateString(),
      items: [
        { description: `Collector (${collector.label})`, quantity: result.collectorAreaM2, unit: "m²", rate: ratePerM2 === "" ? collector.ratePerM2 : Number(ratePerM2), amount: result.collectorCost },
        { description: "Storage tank", quantity: result.tankL, unit: "L", rate: tankCostPerLitre === "" ? 800 : Number(tankCostPerLitre), amount: result.tankCost },
        { description: "Installation", quantity: 1, unit: "lot", rate: result.installationCost, amount: result.installationCost },
      ],
      totalAmount: result.systemCost,
    });
  };
  const applyCity = (city: string) => {
    if (INLET_PRESETS[city] != null) setInletTemp(INLET_PRESETS[city]);
    if (RADIATION_PRESETS[city] != null) setSolarRadiation(RADIATION_PRESETS[city]);
  };
  const applyCollector = (t: SolarCollectorType) => {
    setCollectorType(t);
    setEfficiency(SOLAR_COLLECTOR_TYPES[t].efficiencyPct);
  };

  // House gallon = Imperial gallon: 1 L = 0.219969 Imp gal (1 Imp gal =
  // 4.546 L). The old factor 0.264172 was the US gallon.
  const demandL = unitSystem === 'imperial' && result ? result.demandLPerDay * 0.219969 : result?.demandLPerDay;
  const tankL = unitSystem === 'imperial' && result ? result.tankL * 0.219969 : result?.tankL;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-6 shadow-brand-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2"><Sun className="text-accent-700" /> Solar Water Heater Calculator</h2>
            <p className="text-sm text-txt-secondary mt-1">Collector area, tank size, system cost and payback — in {currency}, not hardcoded USD. Hot-water demand is 50 L/person/day.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setUnitSystem('metric')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unitSystem === 'metric' ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>Metric</Button>
            <Button onClick={() => setUnitSystem('imperial')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${unitSystem === 'imperial' ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>Imperial</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}</Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><Printer size={16} /> Print</Button>
          <Button onClick={handlePdf} disabled={!result} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700"><Download size={16} /> Download PDF</Button>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 bg-ui-error border border-ui-errorBorder rounded-2xl p-4 text-sm text-ui-errorText flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><div>{errors.map((e) => <p key={e}>{e}</p>)}</div></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">City preset (sets inlet temperature &amp; radiation)</label>
              <select onChange={(e) => applyCity(e.target.value)} defaultValue="" className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                <option value="" disabled>Choose a city…</option>
                {Object.keys(INLET_PRESETS).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <NumberInput label="Number of People" value={occupants} onChange={(v) => setOccupants(v === "" ? 0 : v)} />
            <NumberInput label="Hot Water Use per Person" unit="L/day" value={usagePerPerson} onChange={(v) => setUsagePerPerson(v === "" ? 0 : v)} />
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Target Temperature" unit="°C" value={targetTemp} onChange={(v) => setTargetTemp(v === "" ? 0 : v)} />
              <NumberInput label="Inlet Water Temperature" unit="°C" value={inletTemp} onChange={(v) => setInletTemp(v === "" ? 0 : v)} />
            </div>
            <NumberInput label="Solar Radiation" unit="kWh/m²/day" value={solarRadiation} onChange={(v) => setSolarRadiation(v === "" ? 0 : v)} />
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Collector Type</label>
              <select value={collectorType} onChange={(e) => applyCollector(e.target.value as SolarCollectorType)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                <option value="flatPlate">Flat-plate (selective) — ~50% efficiency</option>
                <option value="evacuatedTube">Evacuated tube — ~65% efficiency</option>
              </select>
              <p className="text-xs text-txt-tertiary mt-2">{collector.note}</p>
            </div>
            <NumberInput label="Collector Efficiency" unit="%" value={efficiency} onChange={(v) => setEfficiency(v === "" ? 0 : v)} />
            <NumberInput label="Solar Fraction" unit="0.3–0.9" value={solarFraction} onChange={(v) => setSolarFraction(v === "" ? 0 : v)} />
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                <option value="PKR">PKR</option><option value="INR">INR</option><option value="AED">AED</option>
              </select>
            </div>
            <NumberInput label={`Energy Cost per kWh (${sym})`} unit={sym} value={energyCost} onChange={(v) => setEnergyCost(v === "" ? 0 : v)} />
            <NumberInput label={`Collector Rate per m² (${sym}) — blank = ${collector.ratePerM2}`} unit={sym} value={ratePerM2} onChange={setRatePerM2} />
            <NumberInput label={`Tank Cost per Litre (${sym}) — blank = 800`} unit={sym} value={tankCostPerLitre} onChange={setTankCostPerLitre} />
          </div>

          <div className="space-y-6">
            {result ? (
              <MaterialSummary title="Solar Water Heater Results" totalLabel="System Cost" totalValue={fmt(result.systemCost)} totalUnit="" relatedToolIds={[]}>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ResultCard title="Daily Demand" value={demandL?.toFixed(0) ?? "—"} unit={unitSystem === 'imperial' ? "Imp gal/day" : "L/day"} variant="neutral" />
                  <ResultCard title="Collector Area" value={result.collectorAreaM2.toFixed(2)} unit="m²" variant="primary" />
                  <ResultCard title="Panels (2 m² each)" value={result.panels} unit={`= ${result.installedAreaM2} m²`} variant="neutral" />
                  <ResultCard title="Tank Size" value={tankL?.toFixed(0) ?? "—"} unit={unitSystem === 'imperial' ? "Imp gal" : "L"} variant="primary" />
                  <ResultCard title="Heat Needed" value={result.energyKwhPerDay.toFixed(2)} unit="kWh/day" variant="info" />
                  <ResultCard title="Backup Energy" value={result.backupKwhPerDay.toFixed(2)} unit="kWh/day" variant="warning" />
                  <ResultCard title="Annual Saving" value={fmt(result.annualSavings)} unit="/ year" variant="success" />
                  <ResultCard title="Payback" value={result.paybackYears?.toFixed(1) ?? "—"} unit="years" variant="primary" />
                </div>
                <div className="mt-4 bg-accent-50 border border-accent-200 p-4 rounded-2xl text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-txt-secondary">Collector cost</span><span className="font-mono font-bold">{fmt(result.collectorCost)}</span></div>
                  <div className="flex justify-between"><span className="text-txt-secondary">Tank cost ({result.tankL} L)</span><span className="font-mono font-bold">{fmt(result.tankCost)}</span></div>
                  <div className="flex justify-between"><span className="text-txt-secondary">Installation (10%)</span><span className="font-mono font-bold">{fmt(result.installationCost)}</span></div>
                  <div className="flex justify-between"><span className="text-txt-secondary">Solar energy per year</span><span className="font-mono font-bold">{result.annualSolarKwh.toFixed(0)} kWh</span></div>
                </div>
              </MaterialSummary>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm">Enter valid inputs to see the sizing.</div>
            )}
            {result && <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "Q = m·c·ΔT", applied: s }))} />}
          </div>
        </div>
      </div>

      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 text-sm text-txt-secondary">
        Planning estimate only — not a substitute for a licensed engineer. Rates are indicative (Nov 2026) — confirm collector and tank prices with your supplier. On freezing nights and in hard-water areas, follow the manufacturer&apos;s freeze and scaling guidance.
      </div>
      <CalculationHistory calculatorId="solar_water_heater" currentInputs={{ unitSystem, occupants, usagePerPerson, targetTemp, inletTemp, solarRadiation, collectorType, efficiency, solarFraction, energyCost, currency, ratePerM2, tankCostPerLitre }} currentResults={result ? { collectorAreaM2: result.collectorAreaM2, tankL: result.tankL, systemCost: result.systemCost } : {}} onRestore={(ins) => {
          if (ins.unitSystem != null) setUnitSystem(ins.unitSystem as typeof unitSystem);
          if (ins.occupants != null) setOccupants(ins.occupants as typeof occupants);
          if (ins.usagePerPerson != null) setUsagePerPerson(ins.usagePerPerson as typeof usagePerPerson);
          if (ins.targetTemp != null) setTargetTemp(ins.targetTemp as typeof targetTemp);
          if (ins.inletTemp != null) setInletTemp(ins.inletTemp as typeof inletTemp);
          if (ins.solarRadiation != null) setSolarRadiation(ins.solarRadiation as typeof solarRadiation);
          if (ins.collectorType != null) setCollectorType(ins.collectorType as typeof collectorType);
          if (ins.efficiency != null) setEfficiency(ins.efficiency as typeof efficiency);
          if (ins.solarFraction != null) setSolarFraction(ins.solarFraction as typeof solarFraction);
          if (ins.energyCost != null) setEnergyCost(ins.energyCost as typeof energyCost);
          if (typeof ins.currency === "string") setCurrency(ins.currency);
          if (ins.ratePerM2 != null) setRatePerM2(ins.ratePerM2 as typeof ratePerM2);
          if (ins.tankCostPerLitre != null) setTankCostPerLitre(ins.tankCostPerLitre as typeof tankCostPerLitre);
        }} />
    </div>
  );
}

export default SolarWaterHeaterCalculator;
