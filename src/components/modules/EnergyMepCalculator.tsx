import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { Zap, Droplet, Wind } from "lucide-react";
import { cn } from "../../lib/utils";
import { useSettings } from "../../context/SettingsContext";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { NumberInput } from "../ui/NumberInput";
import { CalculationHistory } from "../ui/CalculationHistory";

type Tab = "solar" | "water" | "ac";

export default function EnergyMepCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("solar");
  
  // Minimal calculation state for save capability 
  // (We could persist actual state if we lifted it, but for now we just give a fallback)
  const inputs: any = {};
  const results: any = {};

  return (
    <div className="w-full md:max-w-4xl md:mx-auto pb-20 px-4 md:px-0">
      

      <div className="flex overflow-x-auto pb-4 gap-2 mb-8 p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <UniversalTabs tabs={[{id: "solar", label: "Solar Rooftop", icon: <Zap className="w-5 h-5" />}]} activeTab={activeTab === "solar" ? "solar" : ""} onTabChange={() => setActiveTab("solar")} />
        <UniversalTabs tabs={[{id: "water", label: "Solar Water Heater", icon: <Droplet className="w-5 h-5" />}]} activeTab={activeTab === "water" ? "water" : ""} onTabChange={() => setActiveTab("water")} />
        <UniversalTabs tabs={[{id: "ac", label: "AC Initial Sizing", icon: <Wind className="w-5 h-5" />}]} activeTab={activeTab === "ac" ? "ac" : ""} onTabChange={() => setActiveTab("ac")} />
      </div>

      <div className="tool-card overflow-hidden mb-6">
        <div className="p-6 md:p-8">
          {activeTab === "solar" && <SolarCalculator />}
          {activeTab === "water" && <WaterHeaterCalculator />}
          {activeTab === "ac" && <AcCalculator />}
        </div>
      </div>
      
      <CalculationHistory
        calculatorId="mep_calculator"
        currentInputs={inputs}
        currentResults={results}
        onRestore={() => {}}
      />
    </div>
  );
}

// --- Specific Calculators ---

function SolarCalculator() {
  const { formatCurrency, convertAmount } = useSettings();
  const [area, setArea] = useState<number | "">("");
  const [areaUnit, setAreaUnit] = useState<"sqft" | "sqm">("sqft");
  const [dailyPower, setDailyPower] = useState<number | "">("");

  // Calculation Logic
  const calculateSolar = () => {
    if (!dailyPower) return null;

    const requiredKwByPower = Number(dailyPower) / 4;
    
    let requiredArea = 0;
    if (areaUnit === "sqft") {
      requiredArea = requiredKwByPower * 100;
    } else {
      requiredArea = requiredKwByPower * 9.29; // approx 10 sqm
    }

    let maxKwByArea = null;
    if (area) {
      if (areaUnit === "sqft") {
        maxKwByArea = Number(area) / 100;
      } else {
        maxKwByArea = Number(area) / 9.29;
      }
    }

    const panelCount = Math.ceil(requiredKwByPower / 0.4);
    // Estimated cost: ~ $1000 per kW, just for demonstration
    const estCost = requiredKwByPower * 1000;
    const estCostConverted = convertAmount(estCost);

    return {
      requiredKw: requiredKwByPower.toFixed(2),
      panelCount,
      requiredArea: Math.ceil(requiredArea),
      maxKwByArea: maxKwByArea ? maxKwByArea.toFixed(2) : null,
      estCostConverted
    };
  };

  const results = calculateSolar();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <NumberInput
            label="Daily Power Requirement"
            unit="kWh"
            value={dailyPower}
            onChange={setDailyPower}
            placeholder="e.g. 20"
          />

          <div className="w-full">
            <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
              Available Roof Area (Optional)
            </label>
            <div className="relative flex items-center">
              <NumberInput
                value={area}
                onChange={setArea}
                placeholder="e.g. 500"
                containerClassName="flex-1"
                className="rounded-r-none border-r-0 focus:ring-opacity-50"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as "sqft" | "sqm")}
                className="h-[46px] bg-slate-100 border border-slate-200 rounded-r-xl px-4 text-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50"
              >
                <option value="sqft">Sq Ft</option>
                <option value="sqm">Sq M</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full">
          {results ? (
            <MaterialSummary
               title="Estimate Results"
               totalLabel="Required System Capacity"
               totalValue={results.requiredKw.toString()}
               totalUnit="kW"
             >
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                 <ResultCard
                   title="Total Panels (~400W)"
                   value={results.panelCount}
                   unit="panels"
                   variant="neutral"
                 />
                 <ResultCard
                   title="Estimated Cost"
                   value={formatCurrency(results.estCostConverted)}
                   unit=""
                   variant="primary"
                 />
               </div>
             </MaterialSummary>
          ) : (
            <div className="w-full relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm h-full flex items-center justify-center text-slate-500 text-sm overflow-hidden">
              Enter specifications to see estimation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WaterHeaterCalculator() {
  const [people, setPeople] = useState<number | "">("");

  const calculateWaterHeater = () => {
    if (!people) return null;
    const lpd = Number(people) * 50; // 50 liters per person per day
    let recommendedSize = 100;
    if (lpd > 100) recommendedSize = 200;
    if (lpd > 200) recommendedSize = 300;
    if (lpd > 300) recommendedSize = 500;
    return { lpd, recommendedSize };
  };

  const results = calculateWaterHeater();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <NumberInput
            label="Number of People in Household"
            value={people}
            onChange={setPeople}
            placeholder="e.g. 4"
          />
        </div>
        <div className="flex flex-col h-full">
          {results ? (
             <MaterialSummary
               title="Estimate Results"
               totalLabel="Recommended System Size"
               totalValue={results.recommendedSize.toString()}
               totalUnit="Liters per Day (LPD)"
             />
          ) : (
            <div className="w-full relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm h-full flex items-center justify-center text-slate-500 text-sm overflow-hidden">
              Enter specifications to see estimation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AcCalculator() {
  const [length, setLength] = useState<number | "">("");
  const [width, setWidth] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">(10); // Default 10 ft
  const [occupants, setOccupants] = useState<number | "">(2);
  const [sunlight, setSunlight] = useState<"shaded" | "normal" | "sunny">("normal");
  const [isKitchen, setIsKitchen] = useState<boolean>(false);
  
  const calculateAc = () => {
    if (!length || !width || !height) return null;
    
    const cubicFeet = Number(length) * Number(width) * Number(height);
    
    // Base BTU from cubic footage (approx 5 BTU per cubic foot)
    let baseBtu = cubicFeet * 5;
    
    // Solar heat gain (Sunlight exposure)
    if (sunlight === "sunny") baseBtu *= 1.1;
    else if (sunlight === "shaded") baseBtu *= 0.9;
    
    const occ = Number(occupants);
    if (occ > 2) {
      baseBtu += (occ - 2) * 600;
    }
    
    if (isKitchen) {
      baseBtu += 4000;
    }
    
    const tonnage = baseBtu / 12000;
    const roundedTonnage = Math.max(0.5, Math.ceil(tonnage * 2) / 2); // nearest 0.5 ton
    
    return {
      cubicFeet,
      baseBtu: Math.round(baseBtu),
      tonnage: roundedTonnage
    };
  };

  const results = calculateAc();

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Length (ft)"
              value={length}
              onChange={setLength}
            />
            <NumberInput
              label="Width (ft)"
              value={width}
              onChange={setWidth}
            />
            <NumberInput
              label="Height (ft)"
              value={height}
              onChange={setHeight}
            />
          </div>
          
          <NumberInput
            label="Occupants"
            value={occupants}
            onChange={setOccupants}
          />
          
          <div>
            <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
              Sunlight Exposure
            </label>
            <select
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value as any)}
              className="w-full h-[46px] bg-slate-50 border border-slate-200 rounded-[16px] px-4 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50"
            >
              <option value="shaded">Shaded (-10% BTU)</option>
              <option value="normal">Normal</option>
              <option value="sunny">Heavy Sun (+10% BTU)</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer pt-2 text-sm font-medium text-slate-700 mb-1 block">
            <><label htmlFor="a11y-input-227" className="sr-only">Input</label>
<input id="a11y-input-227" 
              type="checkbox" 
              checked={isKitchen} 
              onChange={(e) => setIsKitchen(e.target.checked)} 
              className="w-4 h-4 text-blue-600 rounded" 
            /></>
            Is this a kitchen? (+4000 BTU)
          </label>
        </div>
        
        <div className="flex flex-col h-full">
          {results ? (
             <MaterialSummary
               title="AC Sizing Output"
               totalLabel="Recommended AC Capacity"
               totalValue={results.tonnage.toFixed(1)}
               totalUnit="Tons"
             >
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                 <ResultCard
                   title="Room Volume"
                   value={Math.round(results.cubicFeet).toString()}
                   unit="cu.ft"
                   variant="neutral"
                 />
                 <ResultCard
                   title="Required Cooling"
                   value={results.baseBtu.toString()}
                   unit="BTU/hr"
                   variant="primary"
                 />
               </div>
             </MaterialSummary>
          ) : (
            <div className="w-full relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm h-full flex items-center justify-center text-slate-500 text-sm overflow-hidden">
              Enter room dimensions to calculate required AC tonnage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}