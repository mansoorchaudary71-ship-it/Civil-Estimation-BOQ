import React, { useMemo, useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { Zap, Droplet, Wind, Plug, Droplets, Copy, Printer, Download, Check, AlertTriangle } from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { NumberInput } from "../ui/NumberInput";
import { CalculationHistory } from "../ui/CalculationHistory";
import { FormulaAccordion } from "../ui/FormulaAccordion";
import { Button } from "../ui/Button";
import { exportBOQToPDF } from "../../lib/pdfExport";
import { calcSolarRoof, defaultSolarRoofInputs, SOLAR_CITY_PRESETS } from "../../lib/solarRoofCalc";
import { calcSolarWaterHeater } from "../../lib/solarWaterHeaterCalc";
import { calcAcSizing, acBreakerNote } from "../../lib/acSizing";
import { DEFAULT_APPLIANCES, calcElectricalLoad, type ElectricalAppliance } from "../../lib/electricalLoad";
import { PLUMBING_FIXTURE_WSFU, calcPlumbing, type PlumbingFixtureKind } from "../../lib/plumbingFixture";
import type { MepCity } from "../../lib/mepConstants";


type Tab = "solar" | "water" | "ac" | "electrical" | "plumbing";
const CUR_SYMBOLS: Record<string, string> = { PKR: "Rs", INR: "₹", AED: "AED" };

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  return { copied, copy };
}

function ToolActions({ summary, onPdf }: { summary: string; onPdf?: () => void }) {
  const { copied, copy } = useCopy(summary);
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button onClick={copy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}</Button>
      <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><Printer size={16} /> Print</Button>
      {onPdf && <Button onClick={onPdf} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700"><Download size={16} /> Download PDF</Button>}
    </div>
  );
}

export default function EnergyMepCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("solar");
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <p className="text-base font-normal text-txt-secondary leading-relaxed mb-6">One hub for the whole MEP estimate: how big a solar system you need, how much hot water a solar heater gives, which AC fits the room, what breaker and cable your load needs, and what pipe your fixtures need — with the maths shown at every step.</p>
      <div className="mb-6">
        <UniversalTabs
          tabs={[
            { id: "solar", label: "Solar Rooftop", icon: <Zap className="w-5 h-5" /> },
            { id: "water", label: "Solar Water Heater", icon: <Droplet className="w-5 h-5" /> },
            { id: "ac", label: "AC Sizing", icon: <Wind className="w-5 h-5" /> },
            { id: "electrical", label: "Electrical Load", icon: <Plug className="w-5 h-5" /> },
            { id: "plumbing", label: "Plumbing Fixtures", icon: <Droplets className="w-5 h-5" /> },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as Tab)}
        />
      </div>
      <div className="tool-card overflow-hidden mb-6">
        <div className="p-6 md:p-8">
          {activeTab === "solar" && <SolarCalculator />}
          {activeTab === "water" && <WaterHeaterCalculator />}
          {activeTab === "ac" && <AcCalculator />}
          {activeTab === "electrical" && <ElectricalCalculator />}
          {activeTab === "plumbing" && <PlumbingCalculator />}
        </div>
      </div>
      <div className="mt-6">
        <CalculationHistory calculatorId="mep_calculator" currentInputs={{ tab: activeTab }} currentResults={{}} onRestore={() => {}} />
      </div>
    </div>
  );
}

function SolarCalculator() {
  const [city, setCity] = useState<MepCity>("Lahore");
  const [monthlyUnits, setMonthlyUnits] = useState<number | "">(600);
  const [gridType, setGridType] = useState<"On-Grid" | "Hybrid" | "Off-Grid">("Hybrid");
  const [roofArea, setRoofArea] = useState<number | "">(100);

  const result = useMemo(() => {
    try {
      const base = defaultSolarRoofInputs(city);
      return calcSolarRoof({ ...base, monthlyUnitsKwh: Number(monthlyUnits) || 0, gridType, roofAreaM2: Number(roofArea) || 0 });
    } catch {
      return null;
    }
  }, [city, monthlyUnits, gridType, roofArea]);

  const sym = SOLAR_CITY_PRESETS[city].currency === "PKR" ? "Rs" : SOLAR_CITY_PRESETS[city].currency === "INR" ? "₹" : "AED";
  const fmt = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`);
  const summary = result ? `MEP solar (simplified) — ${city}, ${monthlyUnits} kWh/month, ${gridType}\nSystem ${result.actualKw.toFixed(2)} kWp (${result.panels} panels); inverter ${result.inverterKva} kVA; cost ${fmt(result.totalCost)}; payback ${result.simplePaybackYears?.toFixed(1) ?? "—"} years` : "";
  const pdf = () => {
    if (!result) return;
    exportBOQToPDF({
      projectName: "MEP Solar Rooftop",
      date: new Date().toLocaleDateString(),
      items: [
        { description: `Solar panels (${result.panels} x 545 W)`, quantity: result.actualKw, unit: "kWp", rate: result.panelsCost / (result.actualKw || 1), amount: result.panelsCost },
        // Per-city rates from the engine (the old PDF hardcoded PKR
        // 25,000/kVA and 65,000/kWh even for Dubai/Mumbai).
        { description: `Inverter (${result.inverterKva} kVA)`, quantity: result.inverterKva, unit: "kVA", rate: result.inverterCost / (result.inverterKva || 1), amount: result.inverterCost },
        ...(result.hasBattery ? [{ description: "Battery", quantity: result.batteryActualKwh, unit: "kWh", rate: result.batteryCost / (result.batteryActualKwh || 1), amount: result.batteryCost }] : []),
      ],
      totalAmount: result.totalCost,
    });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <ToolActions summary={summary} onPdf={pdf} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value as MepCity)} className="w-full h-[46px] bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-txt-secondary font-medium outline-none">
              {(Object.keys(SOLAR_CITY_PRESETS) as MepCity[]).map((c) => <option key={c} value={c}>{c} — {SOLAR_CITY_PRESETS[c].psh} PSH</option>)}
            </select>
          </div>
          <NumberInput label="Monthly Units Consumed" unit="kWh" value={monthlyUnits} onChange={setMonthlyUnits} requirePositive />
          <NumberInput label="Available Roof Area" unit="m²" value={roofArea} onChange={setRoofArea} />
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">Grid Type</label>
            <select value={gridType} onChange={(e) => setGridType(e.target.value as "On-Grid" | "Hybrid" | "Off-Grid")} className="w-full h-[46px] bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-txt-secondary font-medium outline-none">
              <option value="On-Grid">On-Grid</option><option value="Hybrid">Hybrid</option><option value="Off-Grid">Off-Grid</option>
            </select>
          </div>
          <p className="text-xs text-txt-tertiary">Simplified mode of the full solar-roof calculator (same engine, city defaults for PSH, tariff and rates). For loan, tilt and cash-flow detail use the Solar Roof Calculator.</p>
        </div>
        <div>
          {result ? (
            <MaterialSummary title="Solar Estimate" totalLabel="Total System Cost" totalValue={fmt(result.totalCost)} totalUnit="" relatedToolIds={["solar-roof"]}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <ResultCard title="System Size" value={result.actualKw.toFixed(2)} unit="kWp" variant="primary" />
                <ResultCard title="Panels" value={result.panels} unit="panels" variant="neutral" />
                <ResultCard title="Inverter" value={result.inverterKva} unit="kVA" variant="neutral" />
                <ResultCard title="Year-1 Savings" value={fmt(result.annualSavingsYear1)} unit="/ year" variant="success" />
                <ResultCard title="Simple Payback" value={result.simplePaybackYears?.toFixed(1) ?? "—"} unit="years" variant="primary" />
                <ResultCard title="NPV (10%)" value={fmt(result.npv)} unit="" variant="info" />
              </div>
              <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "req kW = (daily demand / PSH) / derate", applied: s }))} />
            </MaterialSummary>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm h-full flex items-center justify-center">Enter valid inputs to see the estimate.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function WaterHeaterCalculator() {
  const [people, setPeople] = useState<number | "">(4);
  const [energyCost, setEnergyCost] = useState<number | "">(50);
  const [currency, setCurrency] = useState("PKR");
  const result = useMemo(() => {
    try { return calcSolarWaterHeater({ people: Number(people) || 0, energyCostPerKwh: Number(energyCost) || 0 }); } catch { return null; }
  }, [people, energyCost]);
  const sym = CUR_SYMBOLS[currency];
  const fmt = (v: number | null | undefined) => (v == null ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`);
  const summary = result ? `MEP solar water heater — ${people} people\nDemand ${result.demandLPerDay} L/day; collector ${result.collectorAreaM2.toFixed(2)} m² (${result.panels} panels); tank ${result.tankL} L\nSystem cost ${fmt(result.systemCost)}; payback ${result.paybackYears?.toFixed(1) ?? "—"} years` : "";
  return (
    <div className="animate-in fade-in duration-300">
      <ToolActions summary={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <NumberInput label="Number of People in Household" value={people} onChange={setPeople} requirePositive />
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-[46px] bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-txt-secondary font-medium outline-none">
              <option value="PKR">PKR</option><option value="INR">INR</option><option value="AED">AED</option>
            </select>
          </div>
          <NumberInput label={`Energy Cost per kWh (${sym})`} unit={sym} value={energyCost} onChange={setEnergyCost} />
          <p className="text-xs text-txt-tertiary">Hot-water demand is 50 L/person/day (shared MEP constant). For collector types, solar fraction and full cost detail use the Solar Water Heater Calculator.</p>
        </div>
        <div>
          {result ? (
            <MaterialSummary title="Water Heater Estimate" totalLabel="Recommended Tank" totalValue={result.tankL.toString()} totalUnit="Liters" relatedToolIds={["solar-water-heater"]}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <ResultCard title="Daily Demand" value={result.demandLPerDay} unit="L/day" variant="neutral" />
                <ResultCard title="Collector Area" value={result.collectorAreaM2.toFixed(2)} unit="m²" variant="primary" />
                <ResultCard title="Panels (2 m²)" value={result.panels} unit="panels" variant="neutral" />
                <ResultCard title="Annual Saving" value={fmt(result.annualSavings)} unit="/ year" variant="success" />
                <ResultCard title="System Cost" value={fmt(result.systemCost)} unit="" variant="primary" />
                <ResultCard title="Payback" value={result.paybackYears?.toFixed(1) ?? "—"} unit="years" variant="primary" />
              </div>
            </MaterialSummary>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm h-full flex items-center justify-center">Enter valid inputs to see the estimate.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AcCalculator() {
  const [length, setLength] = useState<number | "">(12);
  const [width, setWidth] = useState<number | "">(10);
  const [height, setHeight] = useState<number | "">(10);
  const [occupants, setOccupants] = useState<number | "">(2);
  const [sunlight, setSunlight] = useState<"shaded" | "normal" | "sunny">("normal");
  const [isKitchen, setIsKitchen] = useState<boolean>(false);
  const [tariff, setTariff] = useState<number | "">(50);
  const result = useMemo(() => {
    try {
      return calcAcSizing({
        areaSqFt: (Number(length) || 0) * (Number(width) || 0),
        ceilingHeightFt: Number(height) || 8,
        occupants: Number(occupants) || 0,
        sun: sunlight,
        isKitchen,
        tariffPerKwh: Number(tariff) || 0,
      });
    } catch { return null; }
  }, [length, width, height, occupants, sunlight, isKitchen, tariff]);
  const summary = result ? `MEP AC sizing — ${length} x ${width} ft, ${height} ft ceiling, ${occupants} people\nRequired ${result.requiredBtuPerHour.toLocaleString("en-US")} BTU/h (${result.tons.toFixed(2)} tons); nearest standard ${result.standardBtuPerHour.toLocaleString("en-US")} BTU/h\nRunning ${result.runningWatts.toFixed(0)} W; monthly cost ${result.monthlyRunningCost != null ? `Rs ${Math.round(result.monthlyRunningCost).toLocaleString("en-US")}` : "—"}` : "";
  return (
    <div className="animate-in fade-in duration-300">
      <ToolActions summary={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <NumberInput label="Length (ft)" value={length} onChange={setLength} requirePositive />
            <NumberInput label="Width (ft)" value={width} onChange={setWidth} requirePositive />
            <NumberInput label="Height (ft)" value={height} onChange={setHeight} requirePositive />
          </div>
          <NumberInput label="Occupants" value={occupants} onChange={setOccupants} />
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">Sunlight Exposure</label>
            <select value={sunlight} onChange={(e) => setSunlight(e.target.value as "shaded" | "normal" | "sunny")} className="w-full h-[46px] bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-txt-secondary font-medium outline-none">
              <option value="shaded">Shaded (-10% BTU)</option><option value="normal">Normal</option><option value="sunny">Heavy Sun (+10% BTU)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-txt-secondary">
            <input type="checkbox" checked={isKitchen} onChange={(e) => setIsKitchen(e.target.checked)} className="w-4 h-4 text-accent-800 rounded" /> Is this a kitchen? (+4000 BTU)
          </label>
          <NumberInput label="Electricity Tariff (Rs/kWh)" unit="Rs" value={tariff} onChange={setTariff} />
          <p className="text-xs text-txt-tertiary">Sized from the ENERGY STAR chart — the old 5 BTU/ft³ rule is retired. A 12 × 10 ft room with a 10 ft ceiling needs 6,250 BTU/h and rounds up to an 8,000 BTU/h unit.</p>
        </div>
        <div>
          {result ? (
            <MaterialSummary title="AC Sizing Output" totalLabel="Recommended AC Capacity" totalValue={result.standardBtuPerHour.toLocaleString("en-US")} totalUnit="BTU/hr" relatedToolIds={[]}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <ResultCard title="Required Cooling" value={result.requiredBtuPerHour.toLocaleString("en-US")} unit="BTU/hr" variant="primary" />
                <ResultCard title="Tonnage" value={result.tons.toFixed(2)} unit="tons" variant="neutral" />
                <ResultCard title="Running Watts" value={result.runningWatts.toFixed(0)} unit="W" variant="neutral" />
                <ResultCard title="Monthly Running Cost" value={result.monthlyRunningCost != null ? `Rs ${Math.round(result.monthlyRunningCost).toLocaleString("en-US")}` : "—"} unit="" variant="info" />
              </div>
              <p className="text-xs text-txt-secondary mt-4">{acBreakerNote(result.runningWatts)}</p>
              <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "ENERGY STAR chart + adjustments", applied: s }))} />
            </MaterialSummary>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm h-full flex items-center justify-center">Enter room dimensions to calculate required AC tonnage.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ElectricalCalculator() {
  const [appliances, setAppliances] = useState<ElectricalAppliance[]>(DEFAULT_APPLIANCES);
  const [phase, setPhase] = useState<"single" | "three">("single");
  const [cableLength, setCableLength] = useState<number | "">(20);
  const [ambient, setAmbient] = useState<number | "">(40);
  const [currency, setCurrency] = useState("PKR");

  const result = useMemo(() => {
    try { return calcElectricalLoad({ appliances, phase, cableLengthM: Number(cableLength) || 20, ambientC: Number(ambient) || 40 }); } catch { return null; }
  }, [appliances, phase, cableLength, ambient]);

  const updateAppliance = (i: number, patch: Partial<ElectricalAppliance>) =>
    setAppliances((prev) => prev.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  const summary = result ? `MEP electrical load — ${phase === "single" ? "single-phase 230 V" : "three-phase 400 V"}\nConnected ${result.connectedKw.toFixed(2)} kW; demand ${result.demandKw.toFixed(2)} kW (${result.demandKva.toFixed(2)} kVA)\nCurrent ${result.currentA.toFixed(1)} A; design ${result.designCurrentA.toFixed(1)} A; breaker ${result.breakerA} A; cable ${result.cableMm2 ?? "—"} mm²; voltage drop ${result.voltageDropPct.toFixed(2)}%` : "";
  return (
    <div className="animate-in fade-in duration-300">
      <ToolActions summary={summary} />
      {result == null && <p className="flex gap-2 text-sm text-ui-errorText bg-ui-error border border-ui-errorBorder rounded-xl p-3 mb-4"><AlertTriangle size={16} className="shrink-0 mt-0.5" /> Check the appliance list — watts, quantities and diversity must be valid.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Supply</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value as "single" | "three")} className="w-full h-[46px] bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-txt-secondary font-medium outline-none">
                <option value="single">Single-phase 230 V</option><option value="three">Three-phase 400 V</option>
              </select>
            </div>
            <NumberInput label="Cable Run Length" unit="m" value={cableLength} onChange={setCableLength} />
            <NumberInput label="Ambient Temperature" unit="°C" value={ambient} onChange={setAmbient} />
          </div>
          <div className="space-y-3">
            {appliances.map((a, i) => (
              <div key={a.name} className="grid grid-cols-12 gap-2 items-center bg-surface-hover rounded-xl p-3">
                <span className="col-span-4 text-sm font-medium">{a.name}</span>
                <input type="number" aria-label={`${a.name} watts`} value={a.watts} onChange={(e) => updateAppliance(i, { watts: Number(e.target.value) })} className="col-span-2 h-10 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 text-sm" />
                <span className="text-xs text-txt-tertiary">W ×</span>
                <input type="number" aria-label={`${a.name} quantity`} value={a.quantity} onChange={(e) => updateAppliance(i, { quantity: Number(e.target.value) })} className="col-span-2 h-10 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 text-sm" />
                <input type="number" step="0.1" min={0} max={1} aria-label={`${a.name} diversity`} value={a.diversity} onChange={(e) => updateAppliance(i, { diversity: Number(e.target.value) })} className="col-span-2 h-10 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 text-sm" />
                <span className="text-xs text-txt-tertiary">DF</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-txt-tertiary">Diversity factor (DF) is the share of each load expected on at once. Breaker = next standard size above design current (× 1.25); cable is the smallest copper size passing ampacity and the 3% voltage-drop limit (IEC 60364-5-52).</p>
        </div>
        <div>
          {result ? (
            <MaterialSummary title="Electrical Load Results" totalLabel="Demand Load" totalValue={result.demandKw.toFixed(2)} totalUnit="kW" relatedToolIds={[]}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <ResultCard title="Connected Load" value={result.connectedKw.toFixed(2)} unit="kW" variant="neutral" />
                <ResultCard title="Demand (kVA)" value={result.demandKva.toFixed(2)} unit="kVA" variant="neutral" />
                <ResultCard title="Current" value={result.currentA.toFixed(1)} unit="A" variant="neutral" />
                <ResultCard title="Main Breaker" value={result.breakerA} unit="A" variant="primary" />
                <ResultCard title="Main Cable" value={result.cableMm2 ?? "—"} unit="mm² Cu" variant="primary" />
                <ResultCard title="Voltage Drop" value={result.voltageDropPct.toFixed(2)} unit="%" variant={result.voltageDropOk ? "success" : "warning"} />
              </div>
              <p className="text-xs text-txt-secondary mt-4">{result.cableDecidedBy}</p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-txt-secondary border-b border-border-color"><th className="py-2 pr-3">Circuit</th><th className="py-2 pr-3 text-right">Load</th><th className="py-2 pr-3 text-right">Breaker</th><th className="py-2 text-right">Cable</th></tr></thead>
                  <tbody>
                    {result.dbSchedule.map((row) => (
                      <tr key={row.circuit} className="border-b border-border-color">
                        <td className="py-2 pr-3">{row.circuit}</td>
                        <td className="py-2 pr-3 text-right font-mono">{row.loadW} W</td>
                        <td className="py-2 pr-3 text-right font-mono">{row.breakerA} A</td>
                        <td className="py-2 text-right font-mono">{row.cableMm2 ?? "—"} mm²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "I = P / (V × pf); Id = I × 1.25", applied: s }))} />
            </MaterialSummary>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm h-full flex items-center justify-center">Enter valid loads to see the electrical sizing.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlumbingCalculator() {
  const [counts, setCounts] = useState<Record<PlumbingFixtureKind, number>>({
    wcTank: 2, wcValve: 0, basin: 2, bathShower: 2, kitchenSink: 1, washingMachine: 1, dishwasher: 0,
  });
  const [tankLitres, setTankLitres] = useState<number | "">(3785);
  const [staticHead, setStaticHead] = useState<number | "">(10);
  const [frictionHead, setFrictionHead] = useState<number | "">(5);

  const result = useMemo(() => {
    try {
      return calcPlumbing({
        fixtures: (Object.keys(counts) as PlumbingFixtureKind[]).map((kind) => ({ kind, count: counts[kind] })),
        tankLitres: Number(tankLitres) || 3785,
        staticHeadM: Number(staticHead) || 0,
        frictionHeadM: Number(frictionHead) || 0,
      });
    } catch { return null; }
  }, [counts, tankLitres, staticHead, frictionHead]);

  const summary = result ? `MEP plumbing — ${result.totalWsfu} WSFU\nDesign flow ${result.designFlowLs.toFixed(2)} L/s; cold-water main ${result.mainDiameterMm} mm (${result.mainDiameterInch} inch); branch ${result.branchDiameterMm} mm\nTank ${result.tankLitres.toFixed(0)} L (${result.tankGallons.toFixed(0)} gal); pump ${result.pumpKw.toFixed(2)} kW (${result.pumpHp.toFixed(2)} HP) at ${result.pumpHeadM.toFixed(1)} m head` : "";
  return (
    <div className="animate-in fade-in duration-300">
      <ToolActions summary={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {(Object.keys(PLUMBING_FIXTURE_WSFU) as PlumbingFixtureKind[]).map((kind) => (
            <div key={kind} className="flex items-center justify-between gap-4 bg-surface-hover rounded-xl p-3">
              <span className="text-sm font-medium">{PLUMBING_FIXTURE_WSFU[kind].label} <span className="text-txt-tertiary">({PLUMBING_FIXTURE_WSFU[kind].wsfu} WSFU each)</span></span>
              <input type="number" min={0} aria-label={PLUMBING_FIXTURE_WSFU[kind].label} value={counts[kind]} onChange={(e) => setCounts((prev) => ({ ...prev, [kind]: Math.max(0, Number(e.target.value) || 0) }))} className="w-20 h-10 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 text-sm text-center" />
            </div>
          ))}
          <NumberInput label="Overhead Tank Size" unit="L" value={tankLitres} onChange={setTankLitres} />
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label="Static Head" unit="m" value={staticHead} onChange={setStaticHead} />
            <NumberInput label="Friction Head" unit="m" value={frictionHead} onChange={setFrictionHead} />
          </div>
          <p className="text-xs text-txt-tertiary">Design flow uses Hunter&apos;s-curve approximation Q = 0.25 × √WSFU for small systems. For large systems use the full Hunter&apos;s curve table.</p>
        </div>
        <div>
          {result ? (
            <MaterialSummary title="Plumbing Results" totalLabel="Total Fixture Units" totalValue={result.totalWsfu.toString()} totalUnit="WSFU" relatedToolIds={[]}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <ResultCard title="Design Flow" value={result.designFlowLs.toFixed(2)} unit="L/s" variant="primary" />
                <ResultCard title="Cold-Water Main" value={result.mainDiameterMm} unit={`mm (${result.mainDiameterInch}″)`} variant="primary" />
                <ResultCard title="Branch Pipe" value={result.branchDiameterMm} unit="mm" variant="neutral" />
                <ResultCard title="Tank" value={result.tankLitres.toFixed(0)} unit={`L (${result.tankGallons.toFixed(0)} gal)`} variant="neutral" />
                <ResultCard title="Pump Head" value={result.pumpHeadM.toFixed(1)} unit="m" variant="info" />
                <ResultCard title="Pump Power" value={result.pumpKw.toFixed(2)} unit={`kW (${result.pumpHp.toFixed(2)} HP)`} variant="primary" />
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-txt-secondary border-b border-border-color"><th className="py-2 pr-3">Fixture</th><th className="py-2 pr-3 text-right">Count</th><th className="py-2 text-right">WSFU</th></tr></thead>
                  <tbody>
                    {result.lines.map((l) => (
                      <tr key={l.label} className="border-b border-border-color">
                        <td className="py-2 pr-3">{l.label}</td>
                        <td className="py-2 pr-3 text-right font-mono">{l.count}</td>
                        <td className="py-2 text-right font-mono">{l.wsfuTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "Q = 0.25 × √WSFU; D = √(4Q / πv)", applied: s }))} />
            </MaterialSummary>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm h-full flex items-center justify-center">Add at least one fixture to see the plumbing sizing.</div>
          )}
        </div>
      </div>
    </div>
  );
}
