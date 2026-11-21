import React, { useMemo, useState } from "react";
import { CloudRain, Droplet, AlertTriangle, Copy, Printer, Download, Check } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { NumberInput } from "../ui/NumberInput";
import { FormulaAccordion } from "../ui/FormulaAccordion";
import { Button } from "../ui/Button";
import { exportBOQToPDF } from "../../lib/pdfExport";
import {
  RAINWATER_ROOF_LABELS,
  calcRainwater,
  validateRainwaterInputs,
  type RainwaterRoofType,
} from "../../lib/rainwaterCalc";
import { RAINFALL_MM_BY_CITY, type MepCity } from "../../lib/mepConstants";


const CUR_SYMBOLS: Record<string, string> = { PKR: "Rs", INR: "₹", AED: "AED" };
const CITIES = Object.keys(RAINFALL_MM_BY_CITY) as MepCity[];

export default function RainwaterHarvesting() {
  const [roofArea, setRoofArea] = useState<number | "">(100);
  const [areaUnit, setAreaUnit] = useState<"sqm" | "sqft">("sqm");
  const [city, setCity] = useState<MepCity>("Lahore");
  const [rainfall, setRainfall] = useState<number | "">(628);
  const [roofType, setRoofType] = useState<RainwaterRoofType>("concreteTiles");
  const [people, setPeople] = useState<number | "">(4);
  const [usePerPerson, setUsePerPerson] = useState<number | "">(50);
  const [dryDays, setDryDays] = useState<number | "">(21);
  const [filterEff, setFilterEff] = useState<number | "">(90);
  const [firstFlushEvents, setFirstFlushEvents] = useState<number | "">(0);
  const [waterCost, setWaterCost] = useState<number | "">(150);
  const [tankRate, setTankRate] = useState<number | "">(35);
  const [fixedCost, setFixedCost] = useState<number | "">(75000);
  const [currency, setCurrency] = useState("PKR");
  const [copied, setCopied] = useState(false);

  const { result, errors } = useMemo(() => {
    try {
      const areaM2 = areaUnit === "sqft" ? Number(roofArea) * 0.092903 : Number(roofArea);
      const inp = {
        roofAreaM2: areaM2,
        rainfallMm: Number(rainfall),
        city,
        roofType,
        // Empty means "use the 90% default"; an explicit 0% is a real input
        // (no filter) — the old `Number(filterEff) || 90` turned 0 into 90.
        filterEfficiency: (filterEff === "" ? 90 : Number(filterEff)) / 100,
        firstFlushEventsPerYear: Number(firstFlushEvents) || 0,
        people: Number(people),
        usePerPersonLPerDay: Number(usePerPerson),
        dryDays: Number(dryDays),
        waterCostPerM3: Number(waterCost),
        tankRatePerLitre: Number(tankRate),
        fixedSystemCost: Number(fixedCost),
      };
      const errs = validateRainwaterInputs(inp);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcRainwater(inp), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [roofArea, areaUnit, city, rainfall, roofType, people, usePerPerson, dryDays, filterEff, firstFlushEvents, waterCost, tankRate, fixedCost]);

  const sym = CUR_SYMBOLS[currency] ?? "Rs";
  const fmt = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`);

  const summaryText = result
    ? `Rainwater harvesting — ${roofArea} ${areaUnit}, ${city} ${result.rainfallMm} mm\nAnnual yield ${result.yieldLPerYear.toFixed(0)} L; demand ${result.demandLPerYear.toFixed(0)} L; coverage ${result.coveragePct.toFixed(0)}%\nTank ${result.tankL.toLocaleString("en-US")} L (${result.tankLengthM.toFixed(2)} m x ${result.tankWidthM.toFixed(2)} m x ${result.tankDepthM} m); days of supply ${result.daysOfSupply.toFixed(0)}\nAnnual saving ${fmt(result.annualSavings)}; system cost ${fmt(result.systemCost)}; payback ${result.paybackYears?.toFixed(1) ?? "—"} years`
    : "";
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handlePdf = () => {
    if (!result) return;
    exportBOQToPDF({
      projectName: "Rainwater Harvesting",
      date: new Date().toLocaleDateString(),
      items: [
        { description: `Storage tank (${result.tankL} L)`, quantity: result.tankL, unit: "L", rate: Number(tankRate), amount: result.tankCost },
        { description: "Gutter, filter and pump (lump sum)", quantity: 1, unit: "lot", rate: Number(fixedCost), amount: Number(fixedCost) },
      ],
      totalAmount: result.systemCost,
    });
  };
  const applyCity = (c: MepCity) => { setCity(c); setRainfall(RAINFALL_MM_BY_CITY[c]); };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-6 shadow-brand-sm">
        <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2 mb-2"><CloudRain className="text-accent-700" /> Rainwater Harvesting Calculator</h2>
        <p className="text-sm text-txt-secondary mb-6">Roof yield, demand, and tank size by the BS 8515 5% rule plus dry-spell cover — with city rainfall presets, first-flush, gutter sizing and tank dimensions.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}</Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover"><Printer size={16} /> Print</Button>
          <Button onClick={handlePdf} disabled={!result} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700"><Download size={16} /> Download PDF</Button>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 bg-ui-error border border-ui-errorBorder rounded-2xl p-4 text-sm text-ui-errorText">{errors.map((e) => <p key={e}>{e}</p>)}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="flex gap-4 items-end">
              <div className="flex-1"><NumberInput label="Roof Area" value={roofArea} onChange={setRoofArea} requirePositive /></div>
              <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as "sqm" | "sqft")} className="h-[46px] bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 text-txt-secondary font-bold outline-none">
                <option value="sqm">m²</option><option value="sqft">sq ft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">City (rainfall preset)</label>
              <select value={city} onChange={(e) => applyCity(e.target.value as MepCity)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                {CITIES.map((c) => <option key={c} value={c}>{c} — {RAINFALL_MM_BY_CITY[c]} mm/yr</option>)}
              </select>
            </div>
            <NumberInput label="Annual Rainfall" unit="mm/yr" value={rainfall} onChange={setRainfall} />
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Roof Type (runoff coefficient)</label>
              <select value={roofType} onChange={(e) => setRoofType(e.target.value as RainwaterRoofType)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                {(Object.keys(RAINWATER_ROOF_LABELS) as RainwaterRoofType[]).map((k) => <option key={k} value={k}>{RAINWATER_ROOF_LABELS[k]}</option>)}
              </select>
            </div>
            <NumberInput label="People Using the Water" value={people} onChange={setPeople} />
            <NumberInput label="Non-Potable Use per Person" unit="L/day" value={usePerPerson} onChange={setUsePerPerson} />
            <NumberInput label="Dry-Spell Days to Cover" unit="days" value={dryDays} onChange={setDryDays} />
            <NumberInput label="Filter Efficiency" unit="%" value={filterEff} onChange={setFilterEff} />
            <NumberInput label="First-Flush Events per Year (0 = no deduction)" value={firstFlushEvents} onChange={setFirstFlushEvents} />
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-1.5">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                <option value="PKR">PKR</option><option value="INR">INR</option><option value="AED">AED</option>
              </select>
            </div>
            <NumberInput label={`Water Cost per m³ (${sym})`} unit={sym} value={waterCost} onChange={setWaterCost} />
            <NumberInput label={`Tank Rate per Litre (${sym})`} unit={sym} value={tankRate} onChange={setTankRate} />
            <NumberInput label={`Gutter / Filter / Pump Lump Sum (${sym})`} unit={sym} value={fixedCost} onChange={setFixedCost} />
          </div>

          <div className="space-y-6">
            {result ? (
              <MaterialSummary title="Rainwater Harvesting Results" totalLabel="Recommended Tank" totalValue={result.tankL.toLocaleString("en-US")} totalUnit="Liters" relatedToolIds={[]}>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ResultCard title="Annual Yield" value={result.yieldLPerYear.toFixed(0)} unit="L/yr" variant="primary" />
                  <ResultCard title="Annual Demand" value={result.demandLPerYear.toFixed(0)} unit="L/yr" variant="neutral" />
                  <ResultCard title="Demand Coverage" value={result.coveragePct.toFixed(0)} unit="%" variant="success" />
                  <ResultCard title="Days of Supply" value={result.daysOfSupply.toFixed(0)} unit="days" variant="info" />
                  <ResultCard title="Tank by 5% Rule" value={result.tankBy5PctRuleL.toFixed(0)} unit="L" variant="neutral" />
                  <ResultCard title="Tank by Dry Spell" value={result.tankByDrySpellL.toFixed(0)} unit="L" variant="neutral" />
                  <ResultCard title="Annual Saving" value={fmt(result.annualSavings)} unit="/ year" variant="success" />
                  <ResultCard title="Payback" value={result.paybackYears?.toFixed(1) ?? "—"} unit="years" variant="warning" />
                </div>
                <div className="mt-4 bg-accent-50 border border-accent-200 p-4 rounded-2xl text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-txt-secondary">Tank dimensions (L × W × D)</span><span className="font-mono font-bold">{result.tankLengthM.toFixed(2)} × {result.tankWidthM.toFixed(2)} × {result.tankDepthM} m</span></div>
                  <div className="flex justify-between"><span className="text-txt-secondary">Gutter / downpipes</span><span className="font-mono font-bold">{result.gutterSizeMm} mm, {result.downpipes} downpipe(s)</span></div>
                  {result.firstFlushLPerYear > 0 && <div className="flex justify-between"><span className="text-txt-secondary">First-flush loss</span><span className="font-mono font-bold">{result.firstFlushLPerYear.toFixed(0)} L/yr</span></div>}
                  <div className="flex justify-between"><span className="text-txt-secondary">System cost</span><span className="font-mono font-bold">{fmt(result.systemCost)}</span></div>
                  <div className="flex justify-between"><span className="text-txt-secondary">Monthly yield (even spread — see note)</span><span className="font-mono font-bold">{result.monthlyYieldL[0].toFixed(0)} L/mo</span></div>
                </div>
                {result.warnings.map((w) => (
                  <p key={w.slice(0, 40)} className="mt-3 flex gap-2 text-xs leading-relaxed bg-accent-50 border border-accent-200 rounded-xl p-3 text-txt-secondary">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-accent-800" /> {w}
                  </p>
                ))}
              </MaterialSummary>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm">Enter valid inputs to see the rainwater sizing.</div>
            )}
            {result && <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "V = area × rainfall × coefficient", applied: s }))} />}
            <p className="text-xs text-txt-tertiary">Monthly balance assumes rainfall spread evenly over the year. For a real monthly balance, replace it with monthly PMD/IMD rainfall for your district — monsoon months will overflow and dry months will run short.</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 text-sm text-txt-secondary">
        Planning estimate only — not a substitute for a licensed engineer. Rainfall figures are long-term city averages; verify with PMD/IMD before sizing a tank.
      </div>
      <CalculationHistory calculatorId="rainwater_harvesting" currentInputs={{ roofArea, rainfall, roofType, people, dryDays }} currentResults={result ? { yieldLPerYear: result.yieldLPerYear, tankL: result.tankL, systemCost: result.systemCost } : {}} />
    </div>
  );
}
