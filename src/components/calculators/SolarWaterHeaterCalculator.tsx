import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Users, Thermometer, Droplets, Battery, Zap, DollarSign, Calculator, Settings, AlertCircle, Info } from 'lucide-react';
import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';

type UnitSystem = 'metric' | 'imperial';

interface CalculationResult {
  totalDemand: number;
  collectorArea: number;
  tankCapacity: number;
  annualSavings: number;
}

export function SolarWaterHeaterCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  
  // Inputs
  const [occupants, setOccupants] = useState<number>(4);
  const [usagePerPerson, setUsagePerPerson] = useState<number>(40); // LPD
  const [solarRadiation, setSolarRadiation] = useState<number>(5.0); // Medium
  const [targetTemp, setTargetTemp] = useState<number>(60); // C
  const [inletTemp, setInletTemp] = useState<number>(15); // C
  const [efficiency, setEfficiency] = useState<number>(50); // %
  const [energyCost, setEnergyCost] = useState<number>(0.15); // $ / kWh

  const [result, setResult] = useState<CalculationResult>({
    totalDemand: 0,
    collectorArea: 0,
    tankCapacity: 0,
    annualSavings: 0,
  });

  useEffect(() => {
    // Math
    const demandLPD = occupants * usagePerPerson;
    
    // Q = m * c * dT
    // m = demandLPD (since 1L water = 1kg)
    // c = 4.184 kJ/kgC
    // dT = targetTemp - inletTemp
    const deltaT = targetTemp - inletTemp;
    const energyRequiredKJ = demandLPD * 4.184 * deltaT;
    const energyRequiredKWh = energyRequiredKJ / 3600;
    
    // Collector Area = Q / (Irradiance * Efficiency)
    const effFactor = efficiency / 100;
    const areaM2 = energyRequiredKWh / (solarRadiation * effFactor);
    
    // Tank Capacity (Rule of thumb: 1.5x daily demand)
    const tankLiters = demandLPD * 1.5;
    
    // Annual Savings
    const dailySavings = energyRequiredKWh * energyCost;
    const annualSavings = dailySavings * 365;

    setResult({
      totalDemand: demandLPD,
      collectorArea: areaM2 > 0 ? areaM2 : 0,
      tankCapacity: tankLiters > 0 ? tankLiters : 0,
      annualSavings: annualSavings > 0 ? annualSavings : 0
    });
  }, [occupants, usagePerPerson, solarRadiation, targetTemp, inletTemp, efficiency, energyCost]);

  const convertLtoGal = (l: number) => l * 0.264172;
  const convertM2toSqFt = (m: number) => m * 10.7639;
  const convertCtoF = (c: number) => (c * 9/5) + 32;

  const displayTemp = (c: number) => unitSystem === 'metric' ? `${c.toFixed(1)}°C` : `${convertCtoF(c).toFixed(1)}°F`;
  const displayVolume = (l: number) => unitSystem === 'metric' ? `${l.toLocaleString(undefined, {maximumFractionDigits: 0})} L` : `${convertLtoGal(l).toLocaleString(undefined, {maximumFractionDigits: 0})} Gal`;
  const displayArea = (m: number) => unitSystem === 'metric' ? `${m.toFixed(2)} m²` : `${convertM2toSqFt(m).toFixed(2)} sq ft`;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600 mb-4">
              <Sun size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Solar Water Heater Sizing</h1>
            <p className="text-slate-600">Calculate recommended collector area and tank capacity based on hot water demand.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Metric
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Imperial
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings size={20} className="text-blue-500" />
              Basic Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Occupants */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users size={16} className="text-slate-400" />
                  Number of Occupants
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={occupants}
                    onChange={(e) => setOccupants(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Usage per person */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Droplets size={16} className="text-slate-400" />
                  Usage per Person (Liters/day)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    value={usagePerPerson}
                    onChange={(e) => setUsagePerPerson(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 text-sm">
                    LPD
                  </div>
                </div>
                <p className="text-xs text-slate-500">Typical: 30-50 LPD per person</p>
              </div>

              {/* Solar Radiation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Sun size={16} className="text-slate-400" />
                  Solar Radiation (kWh/m²/day)
                </label>
                <select
                  value={solarRadiation}
                  onChange={(e) => setSolarRadiation(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                >
                  <option value={3.5}>Low Exposure (3.5 kWh/m²/day)</option>
                  <option value={5.0}>Medium Exposure (5.0 kWh/m²/day)</option>
                  <option value={6.5}>High Exposure (6.5 kWh/m²/day)</option>
                </select>
              </div>

              {/* Target Temp */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Thermometer size={16} className="text-slate-400" />
                  Target Water Temp (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="40"
                    max="90"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 text-sm">
                    °C
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Parameters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap size={20} className="text-amber-500" />
              Advanced & Economics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inlet Temp */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cold Inlet Temp (°C)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={inletTemp}
                    onChange={(e) => setInletTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Efficiency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">System Efficiency (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={efficiency}
                    onChange={(e) => setEfficiency(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Energy Cost */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Energy Cost ($/kWh)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={energyCost}
                    onChange={(e) => setEnergyCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-lg text-white space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calculator size={24} className="text-blue-200" />
              Sizing Results
            </h2>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-1">
                  <Droplets size={18} className="text-blue-200" />
                  <span className="text-blue-100 font-medium">Daily Hot Water Demand</span>
                </div>
                <div className="text-3xl font-bold">
                  {displayVolume(result.totalDemand)}
                  <span className="text-lg font-normal text-blue-200 ml-1">/ day</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-1">
                  <Sun size={18} className="text-orange-200" />
                  <span className="text-blue-100 font-medium">Req. Collector Area</span>
                </div>
                <div className="text-3xl font-bold text-orange-50">
                  {displayArea(result.collectorArea)}
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-1">
                  <Battery size={18} className="text-indigo-200" />
                  <span className="text-blue-100 font-medium">Recommended Tank</span>
                </div>
                <div className="text-3xl font-bold text-indigo-50">
                  {displayVolume(result.tankCapacity)}
                </div>
              </div>
            </div>
          </div>

          {/* Economics Card */}
          <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900 mb-1">Estimated Savings</h3>
                <p className="text-sm text-emerald-700 mb-3">Annual energy savings based on your inputs and energy cost.</p>
                <div className="text-3xl font-bold text-emerald-600">
                  ${result.annualSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  <span className="text-lg text-emerald-500 font-normal"> / year</span>
                </div>
              </div>
            </div>
          </div>

          
          <FormulaAccordion 
            steps={[
              {
                id: 1,
                label: "1. Daily Hot Water Demand (Volume)",
                theoretical: "Demand (LPD) = Occupants × Usage per Person",
                applied: `Demand = ${occupants} × ${usagePerPerson} = ${result.totalDemand.toLocaleString()} L/day`
              },
              {
                id: 2,
                label: "2. Energy Required (Q)",
                theoretical: "Q (kJ) = m × c × ΔT\nQ (kWh) = Q (kJ) / 3600\nWhere:\nm = Mass of water (Demand in kg, 1L ≈ 1kg)\nc = Specific heat capacity (4.184 kJ/kg°C)\nΔT = Target Temp - Cold Inlet Temp",
                applied: `ΔT = ${targetTemp}°C - ${inletTemp}°C = ${targetTemp - inletTemp}°C\nQ = ${result.totalDemand} kg × 4.184 × ${targetTemp - inletTemp}\nQ = ${(result.totalDemand * 4.184 * (targetTemp - inletTemp)).toLocaleString(undefined, {maximumFractionDigits: 1})} kJ\nQ = ${((result.totalDemand * 4.184 * (targetTemp - inletTemp)) / 3600).toLocaleString(undefined, {maximumFractionDigits: 2})} kWh`
              },
              {
                id: 3,
                label: "3. Solar Collector Area",
                theoretical: "Area (m²) = Q (kWh) / (Solar Radiation × System Efficiency)",
                applied: `Area = ${((result.totalDemand * 4.184 * (targetTemp - inletTemp)) / 3600).toLocaleString(undefined, {maximumFractionDigits: 2})} / (${solarRadiation} × ${efficiency / 100})\nArea = ${result.collectorArea.toFixed(2)} m²`
              },
              {
                id: 4,
                label: "4. Recommended Tank Capacity",
                theoretical: "Tank Size = Daily Demand × 1.5\n(Rule of thumb for thermal storage)",
                applied: `Tank Size = ${result.totalDemand} × 1.5 = ${result.tankCapacity.toLocaleString()} L`
              }
            ]} 
          />

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex gap-3 text-sm text-slate-600">
            <Info size={20} className="text-slate-400 flex-shrink-0" />
            <p>
              Calculations assume a standard specific heat of water (4.184 kJ/kg°C) and generic flat-plate/evacuated tube solar collector efficiencies. Actual sizing may vary based on specific manufacturer specs and local climate nuances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
