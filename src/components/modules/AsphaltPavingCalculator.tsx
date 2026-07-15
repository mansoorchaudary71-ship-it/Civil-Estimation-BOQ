import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { Route, Droplet, ArrowRight, Layers, Calculator } from "lucide-react";
import { cn } from "../../lib/utils";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";

type Tab = "asphalt" | "prime" | "tack";

export default function AsphaltPavingCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("asphalt");

  return (
    <div className="w-full text-slate-900 font-sans md:p-4">
      <div className="w-full md:max-w-7xl md:mx-auto pb-4 px-4 md:px-0">
      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <UniversalTabs tabs={[{id: "asphalt", label: "Asphalt", icon: <Layers className="w-5 h-5" />}]} activeTab={activeTab === "asphalt" ? "asphalt" : ""} onTabChange={() => setActiveTab("asphalt")} />
        <UniversalTabs tabs={[{id: "prime", label: "Prime Coat", icon: <Droplet className="w-5 h-5" />}]} activeTab={activeTab === "prime" ? "prime" : ""} onTabChange={() => setActiveTab("prime")} />
        <UniversalTabs tabs={[{id: "tack", label: "Tack Coat", icon: <Droplet className="w-5 h-5" />}]} activeTab={activeTab === "tack" ? "tack" : ""} onTabChange={() => setActiveTab("tack")} />
      </div>

      <div className="tool-card overflow-hidden">
        <div className="p-6 md:p-8">
          {activeTab === "asphalt" && <AsphaltCalculator />}
          {activeTab === "prime" && <PrimeCoatCalculator />}
          {activeTab === "tack" && <TackCoatCalculator />}
        </div>
      </div>
      </div>
    </div>
  );
}

// --- Calculators ---

function AsphaltCalculator() {
  const [length, setLength] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [thickness, setThickness] = useState<number | "">("");
  
  // Use meters/cm by default for calculations
  const [lengthUnit, setLengthUnit] = useState<"m" | "ft">("m");
  const [thicknessUnit, setThicknessUnit] = useState<"mm" | "inch">("mm");

  const calculateAsphalt = () => {
    if (!length || !width || !thickness) return null;
    if (Number(length) <= 0 || Number(width) <= 0 || Number(thickness) <= 0) return null;

    let l = Number(length);
    let w = Number(width);
    let t = Number(thickness);

    if (lengthUnit === "ft") {
      l = l * 0.3048; // to meters
      w = w * 0.3048;
    }

    if (thicknessUnit === "inch") {
      t = t * 25.4; // to mm
    }

    // Volume in cubic meters = length(m) * width(m) * thickness(m)
    const volume = l * w * (t / 1000);
    
    // Standard asphalt compacted density is approx 2320 kg/m³ or 2.32 tons/m³
    const density = 2320; 
    const kg = volume * density;
    const tons = kg / 1000;

    return {
      tons: tons.toFixed(2),
      volume: volume.toFixed(2),
      area: (l * w).toFixed(2)
    };
  };

  const results = calculateAsphalt();

  React.useEffect(() => {
    if (results) {
      (window as any).__currentRoadBOQItems = [
        {
          id: Math.random().toString(),
          division: "09 - Finishes (Plaster, Flooring, Paint)",
          description: "Asphalt Concrete Wearing Course",
          unit: "Tons",
          quantity: Number(results.tons),
          rate: 0
        }
      ];
    } else {
      (window as any).__currentRoadBOQItems = [];
    }
  }, [results?.tons]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
             <select
                value={lengthUnit}
                onChange={(e) => setLengthUnit(e.target.value as any)}
                className="h-10 bg-slate-100 border border-slate-200 rounded-[16px] px-3 text-sm text-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400"
              >
                <option value="m">Meters (m)</option>
                <option value="ft">Feet (ft)</option>
              </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label={`Length (${lengthUnit})`}>
              <><label htmlFor="a11y-input-83" className="sr-only">Input</label>
<input id="a11y-input-83"
                type="number" inputMode="decimal"
                min="0"
                value={length}
                onChange={(e) => setLength(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              /></>
            </InputGroup>
            <InputGroup label={`Width (${lengthUnit})`}>
              <><label htmlFor="a11y-input-84" className="sr-only">Input</label>
<input id="a11y-input-84"
                type="number" inputMode="decimal"
                min="0"
                value={width}
                onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : "")}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              /></>
            </InputGroup>
          </div>
          <InputGroup label={`Thickness (${thicknessUnit})`}>
             <div className="flex">
              <><label htmlFor="a11y-input-85" className="sr-only">Input</label>
<input id="a11y-input-85"
                type="number" inputMode="decimal"
                min="0"
                value={thickness}
                onChange={(e) => setThickness(e.target.value ? Number(e.target.value) : "")}
                className="flex-1 h-12 bg-slate-50 border border-slate-200 border-r-0 rounded-l-xl px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              /></>
              <select
                value={thicknessUnit}
                onChange={(e) => setThicknessUnit(e.target.value as any)}
                className="h-12 bg-slate-100 border border-slate-200 rounded-r-xl px-4 text-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400"
              >
                <option value="mm">mm</option>
                <option value="inch">Inch</option>
              </select>
             </div>
          </InputGroup>
        </div>

        <div className="flex-1 flex flex-col">
          {results ? (
            <MaterialSummary
              title="Estimate Results"
              totalLabel="Required Asphalt"
              totalValue={results.tons}
              totalUnit="Metric Tons"
            >
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="Volume"
                  value={results.volume}
                  unit="m³"
                  variant="neutral"
                />
                <ResultCard
                  title="Surface Area"
                  value={results.area}
                  unit="m²"
                  variant="neutral"
                />
              </div>
            </MaterialSummary>
          ) : (
            <div className="bg-slate-50/80 [#1A1C24]/80 backdrop-blur-3xl border border-slate-200/50 rounded-[32px] p-4 sm:p-6 lg:p-12 text-center flex items-center justify-center h-full shadow-[0_8px_30px_rgba(15,23,42,0.04)] [0_8px_30px_rgba(15,23,42,0.2)] overflow-hidden">
              <span className="text-slate-600 font-medium tracking-wide">Enter length, width, and thickness to calculate asphalt tonnage.</span>
            </div>
          )}
        </div>
      </div>
      
      <CalculationHistory
        calculatorId="asphalt_calc_v1"
        currentInputs={{ length, width, thickness, thicknessUnit }}
        onRestore={(ins) => {
          if (ins.length) setLength(ins.length);
          if (ins.width) setWidth(ins.width);
          if (ins.thickness) setThickness(ins.thickness);
          if (ins.thicknessUnit) setThicknessUnit(ins.thicknessUnit);
        }}
      />
    </div>
  );
}

function PrimeCoatCalculator() {
  const [area, setArea] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">(1.0);
  
  const calculateCoat = () => {
    if (!area || !rate) return null;
    if (Number(area) <= 0 || Number(rate) <= 0) return null;

    const liters = Number(area) * Number(rate);
    const drums = Math.ceil(liters / 200); // Standard 200L drum

    return {
      liters: liters.toFixed(1),
      drums
    };
  };

  const results = calculateCoat();

  React.useEffect(() => {
    if (results) {
      (window as any).__currentRoadBOQItems = [
        {
          id: Math.random().toString(),
          division: "09 - Finishes (Plaster, Flooring, Paint)",
          description: "Bitumen Prime Coat",
          unit: "Liters",
          quantity: Number(results.liters),
          rate: 0
        }
      ];
    } else {
      (window as any).__currentRoadBOQItems = [];
    }
  }, [results?.liters]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <InputGroup label="Surface Area (sq meters)">
            <><label htmlFor="a11y-input-86" className="sr-only">e.g. 500</label>
<input id="a11y-input-86"
              type="number" inputMode="decimal"
              min="0"
              value={area}
              onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              placeholder="e.g. 500"
            /></>
          </InputGroup>

          <InputGroup label="Application Rate (Liters/m²)">
            <><label htmlFor="a11y-input-87" className="sr-only">Standard: 0.8 - 1.2</label>
<input id="a11y-input-87"
              type="number" inputMode="decimal"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              placeholder="Standard: 0.8 - 1.2"
            /></>
            <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">Default is ~1.0 L/m² for WBM/WMM surfaces.</p>
          </InputGroup>
        </div>

        <div className="flex-1 flex flex-col">
          {results ? (
             <MaterialSummary
               title="Estimate Results"
               totalLabel="Total Prime Coat"
               totalValue={results.liters}
               totalUnit="Liters"
               subtitle={`Standard Drums: ${results.drums} approx (200L)`}
             >
             </MaterialSummary>
          ) : (
            <div className="bg-slate-50/80 [#1A1C24]/80 backdrop-blur-3xl border border-slate-200/50 rounded-[32px] p-4 sm:p-6 lg:p-12 text-center flex items-center justify-center h-full shadow-[0_8px_30px_rgba(15,23,42,0.04)] [0_8px_30px_rgba(15,23,42,0.2)] overflow-hidden">
              <span className="text-slate-600 font-medium tracking-wide">Enter area and application rate to calculate prime coat.</span>
            </div>
          )}
        </div>
      </div>
      <CalculationHistory
        calculatorId="prime_coat_calc_v1"
        currentInputs={{ area, rate }}
        onRestore={(ins) => {
          if (ins.area) setArea(ins.area);
          if (ins.rate) setRate(ins.rate);
        }}
      />
    </div>
  );
}

function TackCoatCalculator() {
  const [area, setArea] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">(0.25);
  
  const calculateCoat = () => {
    if (!area || !rate) return null;
    if (Number(area) <= 0 || Number(rate) <= 0) return null;

    const liters = Number(area) * Number(rate);
    const drums = Math.ceil(liters / 200);

    return {
      liters: liters.toFixed(1),
      drums
    };
  };

  const results = calculateCoat();

  React.useEffect(() => {
    if (results) {
      (window as any).__currentRoadBOQItems = [
        {
          id: Math.random().toString(),
          division: "09 - Finishes (Plaster, Flooring, Paint)",
          description: "Bitumen Tack Coat",
          unit: "Liters",
          quantity: Number(results.liters),
          rate: 0
        }
      ];
    } else {
      (window as any).__currentRoadBOQItems = [];
    }
  }, [results?.liters]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <InputGroup label="Surface Area (sq meters)">
            <><label htmlFor="a11y-input-88" className="sr-only">e.g. 500</label>
<input id="a11y-input-88"
              type="number" inputMode="decimal"
              min="0"
              value={area}
              onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              placeholder="e.g. 500"
            /></>
          </InputGroup>

          <InputGroup label="Application Rate (Liters/m²)">
            <><label htmlFor="a11y-input-89" className="sr-only">Standard: 0.2 - 0.3</label>
<input id="a11y-input-89"
              type="number" inputMode="decimal"
              min="0"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:border-slate-400 outline-none transition-all"
              placeholder="Standard: 0.2 - 0.3"
            /></>
            <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">Default is ~0.25 L/m² for bituminous surfaces.</p>
          </InputGroup>
        </div>

        <div className="flex-1 flex flex-col">
          {results ? (
            <MaterialSummary
               title="Estimate Results"
               totalLabel="Total Tack Coat"
               totalValue={results.liters}
               totalUnit="Liters"
               subtitle={`Standard Drums: ${results.drums} approx (200L)`}
             >
             </MaterialSummary>
          ) : (
            <div className="bg-slate-50/80 [#1A1C24]/80 backdrop-blur-3xl border border-slate-200/50 rounded-[32px] p-4 sm:p-6 lg:p-12 text-center flex items-center justify-center h-full shadow-[0_8px_30px_rgba(15,23,42,0.04)] [0_8px_30px_rgba(15,23,42,0.2)] overflow-hidden">
              <span className="text-slate-600 font-medium tracking-wide">Enter area and application rate to calculate tack coat.</span>
            </div>
          )}
        </div>
      </div>
      <CalculationHistory
        calculatorId="tack_coat_calc_v1"
        currentInputs={{ area, rate }}
        onRestore={(ins) => {
          if (ins.area) setArea(ins.area);
          if (ins.rate) setRate(ins.rate);
        }}
      />
    </div>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
