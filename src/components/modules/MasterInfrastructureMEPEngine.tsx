import { Button } from '../ui/Button';
import React, { useMemo, useState } from 'react';
import { Zap, Sun, CloudRain, ThermometerSnowflake, Save, AlertTriangle } from 'lucide-react';
import { useBOQ } from '../../context/BOQContext';
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { calcSolarRoof, defaultSolarRoofInputs } from "../../lib/solarRoofCalc";
import { calcSolarWaterHeater } from "../../lib/solarWaterHeaterCalc";
import { calcAcSizing } from "../../lib/acSizing";
import { calcRainwater } from "../../lib/rainwaterCalc";

/**
 * Master Infrastructure & MEP Engine — MEP tab only (coordinator
 * fallback, G6 spec §4.2).
 *
 * The earthworks and roads/infrastructure tabs are REMOVED: they
 * duplicated the Earthworks and Road tools. The four MEP cards below
 * are thin wrappers over the shared engines (solarRoofCalc,
 * solarWaterHeaterCalc, acSizing, rainwaterCalc) — they contain NO
 * independent formulas. The old inline formulas (solar /4.5 PSH with
 * no DoD, AC 337 BTU/m² ~35–50% oversized, rainwater tank 5% of
 * yield with no demand, ROI in hardcoded USD) are all retired.
 *
 * Retirement of this route (redirect /infra-mep-engine → /mep-calculator)
 * is a parent decision — this file keeps the route working as MEP-only.
 */


export default function MasterInfrastructureMEPEngine() {
  const { addItem } = useBOQ();
  const [added, setAdded] = useState<string | null>(null);

  const addToBoq = (key: string, name: string, quantity: number, unit: string, rate: number) => {
    addItem({ name, quantity, unit, rate, category: "MEP & Green Energy" });
    setAdded(key);
    setTimeout(() => setAdded(null), 3000);
  };

  // NOTE: no per-component SEO here on purpose — ModuleWrapper's Helmet
  // SEOHead owns this route's title/description/canonical. The old
  // seo/SEOHead usage set document.title directly and raced Helmet.
  return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-txt-primary tracking-tight">Master Infrastructure &amp; MEP Engine</h2>
            <p className="text-txt-tertiary mt-1 mb-4">MEP &amp; Green Energy — solar, water heating, AC and rainwater, all on the shared MEP engines. Earthworks and roads live in their own dedicated tools.</p>
            <p className="text-xs text-txt-tertiary flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> The earthworks and roads tabs were removed (they duplicated other tools). Retiring this route entirely is a separate decision for the project owner.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SolarCard onAdd={(name, qty, unit, rate) => addToBoq("solar", name, qty, unit, rate)} added={added === "solar"} />
          <WaterHeaterCard onAdd={(name, qty, unit, rate) => addToBoq("swh", name, qty, unit, rate)} added={added === "swh"} />
          <AcCard onAdd={(name, qty, unit, rate) => addToBoq("ac", name, qty, unit, rate)} added={added === "ac"} />
          <RainwaterCard onAdd={(name, qty, unit, rate) => addToBoq("rain", name, qty, unit, rate)} added={added === "rain"} />
        </div>

      </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-6 shadow-brand-sm">
      <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2 mb-4">{icon} {title}</h2>
      {children}
    </div>
  );
}

function BoqButton({ onClick, added, label, disabled }: { onClick: () => void; added: boolean; label: string; disabled?: boolean }) {
  return (
    <Button onClick={onClick} disabled={disabled} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700 disabled:opacity-50">
      <Save size={16} /> {added ? "Added to BOQ ✓" : label}
    </Button>
  );
}

function SolarCard({ onAdd, added }: { onAdd: (name: string, qty: number, unit: string, rate: number) => void; added: boolean }) {
  const [monthlyUnits, setMonthlyUnits] = useState<number | "">(500);
  const result = useMemo(() => {
    try { return calcSolarRoof({ ...defaultSolarRoofInputs("Lahore"), monthlyUnitsKwh: Number(monthlyUnits) || 0 }); } catch { return null; }
  }, [monthlyUnits]);
  return (
    <Card title="Solar Rooftop (shared engine)" icon={<Sun className="w-5 h-5 text-accent-800" />}>
      <NumberInput label="Monthly Units" unit="kWh" value={monthlyUnits} onChange={setMonthlyUnits} />
      {result && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ResultCard title="System Size" value={result.actualKw.toFixed(2)} unit="kWp" variant="primary" />
          <ResultCard title="Panels" value={result.panels} unit="panels" variant="neutral" />
          <ResultCard title="Total Cost" value={`Rs ${Math.round(result.totalCost).toLocaleString("en-US")}`} unit="" variant="primary" />
          <ResultCard title="Payback" value={result.simplePaybackYears?.toFixed(1) ?? "—"} unit="years" variant="success" />
        </div>
      )}
      <BoqButton added={added} label="Add Solar System to BOQ" onClick={() => result && onAdd("Solar PV system", result.actualKw, "kWp", result.totalCost / (result.actualKw || 1))} />
    </Card>
  );
}

function WaterHeaterCard({ onAdd, added }: { onAdd: (name: string, qty: number, unit: string, rate: number) => void; added: boolean }) {
  const [people, setPeople] = useState<number | "">(4);
  const result = useMemo(() => {
    try { return calcSolarWaterHeater({ people: Number(people) || 0 }); } catch { return null; }
  }, [people]);
  return (
    <Card title="Solar Water Heater (shared engine)" icon={<ThermometerSnowflake className="w-5 h-5 text-accent-800" />}>
      <NumberInput label="People in Household" value={people} onChange={setPeople} />
      {result && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ResultCard title="Collector Area" value={result.collectorAreaM2.toFixed(2)} unit="m²" variant="primary" />
          <ResultCard title="Tank" value={result.tankL} unit="L" variant="neutral" />
          <ResultCard title="System Cost" value={`Rs ${Math.round(result.systemCost).toLocaleString("en-US")}`} unit="" variant="primary" />
          <ResultCard title="Payback" value={result.paybackYears?.toFixed(1) ?? "—"} unit="years" variant="success" />
        </div>
      )}
      <BoqButton added={added} label="Add Water Heater to BOQ" onClick={() => result && onAdd("Solar water heater system", result.collectorAreaM2, "m²", result.systemCost / (result.collectorAreaM2 || 1))} />
    </Card>
  );
}

function AcCard({ onAdd, added }: { onAdd: (name: string, qty: number, unit: string, rate: number) => void; added: boolean }) {
  const [length, setLength] = useState<number | "">(12);
  const [width, setWidth] = useState<number | "">(10);
  const [height, setHeight] = useState<number | "">(10);
  // No AC price is invented: the BOQ button stays disabled until the user
  // enters a unit rate (the old code added the unit at rate 0).
  const [acRate, setAcRate] = useState<number | "">("");
  const result = useMemo(() => {
    try {
      return calcAcSizing({ areaSqFt: (Number(length) || 0) * (Number(width) || 0), ceilingHeightFt: Number(height) || 8 });
    } catch { return null; }
  }, [length, width, height]);
  return (
    <Card title="AC Sizing — ENERGY STAR (shared engine)" icon={<Zap className="w-5 h-5 text-accent-800" />}>
      <div className="grid grid-cols-3 gap-4">
        <NumberInput label="Length (ft)" value={length} onChange={setLength} />
        <NumberInput label="Width (ft)" value={width} onChange={setWidth} />
        <NumberInput label="Height (ft)" value={height} onChange={setHeight} />
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ResultCard title="Required Cooling" value={result.requiredBtuPerHour.toLocaleString("en-US")} unit="BTU/h" variant="primary" />
          <ResultCard title="Standard Unit" value={result.standardBtuPerHour.toLocaleString("en-US")} unit="BTU/h" variant="primary" />
          <ResultCard title="Tonnage" value={result.tons.toFixed(2)} unit="tons" variant="neutral" />
          <ResultCard title="Running Watts" value={result.runningWatts.toFixed(0)} unit="W" variant="info" />
        </div>
      )}
      <NumberInput label="AC Unit Rate (Rs each)" value={acRate} onChange={setAcRate} />
      <BoqButton added={added} label="Add AC Unit to BOQ" disabled={acRate === "" || Number(acRate) <= 0} onClick={() => result && onAdd(`Split AC ${result.standardBtuPerHour} BTU/h`, 1, "nos", Number(acRate))} />
      {(acRate === "" || Number(acRate) <= 0) && <p className="text-xs text-txt-tertiary mt-2">Enter a unit rate to enable the BOQ button — no price is assumed (rates vary by brand and tonnage).</p>}
    </Card>
  );
}

function RainwaterCard({ onAdd, added }: { onAdd: (name: string, qty: number, unit: string, rate: number) => void; added: boolean }) {
  const [roofArea, setRoofArea] = useState<number | "">(150);
  const result = useMemo(() => {
    try { return calcRainwater({ roofAreaM2: Number(roofArea) || 0, city: "Lahore", roofType: "concreteTiles" }); } catch { return null; }
  }, [roofArea]);
  return (
    <Card title="Rainwater Harvesting (shared engine)" icon={<CloudRain className="w-5 h-5 text-accent-800" />}>
      <NumberInput label="Roof Area" unit="m²" value={roofArea} onChange={setRoofArea} />
      {result && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <ResultCard title="Annual Yield" value={result.yieldLPerYear.toFixed(0)} unit="L/yr" variant="primary" />
          <ResultCard title="Tank Size" value={result.tankL.toLocaleString("en-US")} unit="L" variant="primary" />
          <ResultCard title="Coverage" value={result.coveragePct.toFixed(0)} unit="%" variant="success" />
          <ResultCard title="System Cost" value={`Rs ${Math.round(result.systemCost).toLocaleString("en-US")}`} unit="" variant="neutral" />
        </div>
      )}
      <BoqButton added={added} label="Add Rainwater Tank to BOQ" onClick={() => result && onAdd(`Rainwater storage tank ${result.tankL} L`, result.tankL, "L", result.systemCost / (result.tankL || 1))} />
    </Card>
  );
}
