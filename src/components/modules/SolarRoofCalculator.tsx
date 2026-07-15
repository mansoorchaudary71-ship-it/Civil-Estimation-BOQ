import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from "framer-motion";
import { 
  Sun, Battery, Zap, DollarSign, Home, AlertCircle, 
  Calculator, ChevronRight, BarChart3, Settings, Info, Download, RotateCcw, Plug, Grid
} from "lucide-react";

type GridType = "On-Grid" | "Off-Grid" | "Hybrid";

const CITIES = {
  "Lahore": { psh: 4.8, cur: "PKR", tariff: 50, panelC: 90, invC: 25000, batC: 80000 },
  "Karachi": { psh: 5.5, cur: "PKR", tariff: 50, panelC: 90, invC: 25000, batC: 80000 },
  "Islamabad": { psh: 4.6, cur: "PKR", tariff: 50, panelC: 90, invC: 25000, batC: 80000 },
  "Multan": { psh: 5.2, cur: "PKR", tariff: 50, panelC: 90, invC: 25000, batC: 80000 },
  "Quetta": { psh: 5.8, cur: "PKR", tariff: 50, panelC: 90, invC: 25000, batC: 80000 },
  "Dubai": { psh: 6.2, cur: "AED", tariff: 0.3, panelC: 1.2, invC: 350, batC: 1500 },
  "Mumbai": { psh: 4.5, cur: "INR", tariff: 8, panelC: 28, invC: 7000, batC: 25000 },
  "Delhi": { psh: 4.8, cur: "INR", tariff: 8, panelC: 28, invC: 7000, batC: 25000 },
};

const MODULES = [
  { id: 1, name: "Site & Load", icon: Home },
  { id: 2, name: "Solar Potential", icon: Sun },
  { id: 3, name: "Inverter & Battery", icon: Battery },
  { id: 4, name: "System Cost", icon: DollarSign },
  { id: 5, name: "Production & Savings", icon: Zap },
  { id: 6, name: "Financial Analysis", icon: BarChart3 },
  { id: 7, name: "Report Card", icon: Calculator },
];

export default function SolarRoofCalculator() {
  const [activeTab, setActiveTab] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // M1
  const [city, setCity] = useState<keyof typeof CITIES>("Lahore");
  const [currency, setCurrency] = useState("PKR");
  const [monthlyBill, setMonthlyBill] = useState<number>(30000);
  const [monthlyUnits, setMonthlyUnits] = useState<number>(600);
  const [peakLoad, setPeakLoad] = useState<number>(4.5);
  const [gridType, setGridType] = useState<GridType>("Hybrid");

  // M2
  const [psh, setPsh] = useState(4.8);
  const [tilt, setTilt] = useState(30);
  const [sysLosses, setSysLosses] = useState(14);
  const [panelWattage, setPanelWattage] = useState(545);
  const [panelEfficiency, setPanelEfficiency] = useState(21);
  const [availableRoofArea, setAvailableRoofArea] = useState(100);

  // M3
  const [inverterEfficiency, setInverterEfficiency] = useState(97);
  const [batteryAutonomy, setBatteryAutonomy] = useState(1);
  const [dod, setDod] = useState(80);
  const [batteryType, setBatteryType] = useState("Lithium-Ion");
  const [batteryVoltage, setBatteryVoltage] = useState(48);

  // M4
  const [panelCostPerW, setPanelCostPerW] = useState(90);
  const [inverterCostPerKva, setInverterCostPerKva] = useState(25000);
  const [batteryCostPerKwh, setBatteryCostPerKwh] = useState(80000);
  const [structureCostPerPanel, setStructureCostPerPanel] = useState(4500);
  const [wiringPercent, setWiringPercent] = useState(8);
  const [labourPercent, setLabourPercent] = useState(10);
  const [netMeteringFee, setNetMeteringFee] = useState(100000);
  const [contingencyPercent, setContingencyPercent] = useState(5);

  // M5
  const [gridTariff, setGridTariff] = useState(50);
  const [exportRate, setExportRate] = useState(100);
  const [degradation, setDegradation] = useState(0.5);

  // M6
  const [maintenancePercent, setMaintenancePercent] = useState(0.5);
  const [tariffEscalation, setTariffEscalation] = useState(10);
  const [lifespan, setLifespan] = useState(25);
  const [loanFinancing, setLoanFinancing] = useState(false);

  // Apply City Defaults
  useEffect(() => {
    const d = CITIES[city];
    if (d) {
      setPsh(d.psh);
      setCurrency(d.cur);
      setGridTariff(d.tariff);
      setPanelCostPerW(d.panelC);
      setInverterCostPerKva(d.invC);
      setBatteryCostPerKwh(d.batC);
    }
  }, [city]);

  // Derived Values
  const dailyDemand = monthlyUnits / 30.4;
  const sysDerate = 1 - (sysLosses / 100);
  const reqKw = (dailyDemand / psh) / sysDerate;
  const numPanels = Math.ceil((reqKw * 1000) / panelWattage);
  const actualKw = (numPanels * panelWattage) / 1000;
  const panelAreaM2 = 2.58; 
  const totalArea = numPanels * panelAreaM2;
  const roofAreaRequired = totalArea * 1.3;
  const maxPanels = Math.floor(availableRoofArea / (panelAreaM2 * 1.3));
  const maxKw = (maxPanels * panelWattage) / 1000;

  const invEff = inverterEfficiency / 100;
  const recInverterKva = Math.ceil(Math.max(actualKw, peakLoad) / invEff);
  
  const hasBattery = gridType !== "On-Grid";
  const battReqKwh = hasBattery ? (dailyDemand * batteryAutonomy) / (dod / 100) : 0;
  const battAhRequired = hasBattery ? (battReqKwh * 1000) / batteryVoltage : 0;
  const numBatteries = hasBattery ? Math.ceil(battAhRequired / 200) : 0; // assuming 200Ah modules
  const actualBattKwh = hasBattery ? (numBatteries * 200 * batteryVoltage) / 1000 : 0;

  const panelsCost = actualKw * 1000 * panelCostPerW;
  const inverterCost = recInverterKva * inverterCostPerKva;
  const batteryCost = hasBattery ? actualBattKwh * batteryCostPerKwh : 0;
  const mountingCost = numPanels * structureCostPerPanel;
  const wiringCost = panelsCost * (wiringPercent / 100);
  
  const hardwareTotal = panelsCost + inverterCost + batteryCost + mountingCost + wiringCost;
  const nmFee = gridType !== "Off-Grid" ? netMeteringFee : 0;
  const laborCost = hardwareTotal * (labourPercent / 100);
  const preContingency = hardwareTotal + nmFee + laborCost;
  const contingencyCost = preContingency * (contingencyPercent / 100);
  const totalSystemCost = preContingency + contingencyCost;
  const costPerKwp = totalSystemCost / actualKw;

  const dailyGen = actualKw * psh * sysDerate;
  const monthlyGen = dailyGen * 30.4;
  const annualGen = dailyGen * 365;
  const gridExportPrice = gridTariff * (exportRate / 100);
  const annualUsage = monthlyUnits * 12;

  let annualSavingsAmount = 0;
  if (annualGen > annualUsage) {
    annualSavingsAmount = (annualUsage * gridTariff) + ((annualGen - annualUsage) * gridExportPrice);
  } else {
    annualSavingsAmount = annualGen * gridTariff;
  }
  const maintCostTotal = totalSystemCost * (maintenancePercent / 100);
  const netAnnualSavingsYear1 = annualSavingsAmount - maintCostTotal;

  // ROI calculations
  let cumulativeCashFlow = -totalSystemCost;
  let currentTariff = gridTariff;
  let currentGen = annualGen;
  
  const cashFlows: any[] = [];
  let lifetimeSavings = 0;
  
  for (let year = 1; year <= lifespan; year++) {
    let sav = 0;
    if (currentGen > annualUsage) {
      sav = (annualUsage * currentTariff) + ((currentGen - annualUsage) * (currentTariff * (exportRate/100)));
    } else {
      sav = currentGen * currentTariff;
    }
    const mCost = totalSystemCost * (maintenancePercent / 100);
    const netYear = sav - mCost;
    lifetimeSavings += netYear;
    cumulativeCashFlow += netYear;
    
    cashFlows.push({ year, generation: currentGen, netSavings: netYear, cumProfit: cumulativeCashFlow });
    currentGen = currentGen * (1 - (degradation / 100));
    currentTariff = currentTariff * (1 + (tariffEscalation / 100));
  }

  const simplePayback = netAnnualSavingsYear1 > 0 ? totalSystemCost / netAnnualSavingsYear1 : 0;
  const lifetimeROI = ((lifetimeSavings - totalSystemCost) / totalSystemCost) * 100;
  const annualCo2 = annualGen * 0.5;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);

  const resetCalc = () => {
    setActiveTab(1);
    setCity("Lahore");
    setMonthlyBill(30000);
    setMonthlyUnits(600);
    setGridType("Hybrid");
  };

  const InputField = ({ label, value, onChange, type="number", step, unit, tooltip }: any) => {
    const tooltipText = tooltip || `Specify the ${label?.toLowerCase()} in the given unit.`;
    return (
      <div className="flex flex-col relative group/hint">
        {tooltipText && (
           <div className="absolute z-[100] invisible opacity-0 group-hover/hint:visible group-hover/hint:opacity-100 transition-all duration-200 bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max max-w-[220px] bg-slate-800 text-white text-[11px] p-2 rounded-lg shadow-xl pointer-events-none whitespace-normal text-center font-medium after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
             {tooltipText}
           </div>
        )}
        <label className="text-sm text-slate-700 font-medium mb-1.5 flex items-center justify-between cursor-help">
          <span className="flex items-center gap-1.5">
            {label}
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </label>
        <div className="relative">
          <><label htmlFor="a11y-input-514" className="sr-only">Input</label>
<input id="a11y-input-514" type={type} step={step} value={value} onChange={onChange}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 font-medium min-h-[44px]"
          /></>
          {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white text-slate-800 min-h-screen rounded-[32px] overflow-hidden shadow-sm border border-slate-200 font-sans" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6 md:p-8">
        <div className="w-full md:max-w-7xl md:mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
               <Sun className="w-4 h-4 text-indigo-600" />
               <span className="text-base font-medium text-indigo-600 uppercase tracking-wider">Pro Solar Evaluator</span>
            </div>
            <h1 className="text-xl md:text-xl font-semibold text-slate-800 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Solar Energy System Calculator
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">Complete end-to-end solar array, inverter, and financial payback analysis for PK, IN, and UAE markets.</p>
          </div>
          <button onClick={resetCalc} className="w-full flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-full transition-all font-medium text-sm border border-slate-200 shadow-sm active:scale-95 hover:-translate-y-0.5 overflow-hidden">
            <RotateCcw className="w-4 h-4" /> Reset Data
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="w-full flex flex-col xl:flex-row gap-6 p-4 md:p-8 md:max-w-[1400px] md:mx-auto">
        
        <div className="xl:w-2/3 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-2 pb-4 pt-1 border-b border-slate-200 mb-6" ref={scrollRef} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
            {MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;
              return (
                <button 
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium whitespace-nowrap transition-all border ${
                    isActive ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
                  <span className="hidden sm:inline">{mod.id}.</span> {mod.name}
                </button>
              )
            })}
          </div>

          {/* Module Content */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-4 sm:p-8 shadow-sm overflow-hidden">
            
            {activeTab === 1 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Home className="text-indigo-600"/> Site & Load Assessment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-slate-700 font-medium mb-1.5 min-w-[200px]">Location / City</label>
                    <select value={city} onChange={(e: any) => setCity(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                      {Object.keys(CITIES).map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
                    </select>
                  </div>
                  <InputField label="Avg. Monthly Electricity Bill" value={monthlyBill} onChange={(e:any) => setMonthlyBill(Number(e.target.value))} unit={currency} />
                  <InputField label="Avg. Monthly Units Consumed" value={monthlyUnits} onChange={(e:any) => setMonthlyUnits(Number(e.target.value))} unit="kWh" />
                  <InputField label="Peak Daily Load" value={peakLoad} onChange={(e:any) => setPeakLoad(Number(e.target.value))} unit="kW" tooltip="Maximum concurrent power draw" />
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-sm text-slate-700 font-medium mb-1.5">Grid System Type</label>
                    <div className="flex gap-4 flex-wrap">
                      {["On-Grid", "Off-Grid", "Hybrid"].map(t => (
                        <button key={t} onClick={() => setGridType(t as GridType)} className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${gridType === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="animate-in fade-in zoom-in-95 duration-300 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Sun className="text-indigo-600"/> Solar Potential & Sizing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Peak Sun Hours (PSH)" value={psh} onChange={(e:any) => setPsh(Number(e.target.value))} step="0.1" unit="hrs/day" />
                  <InputField label="Available Roof Area" value={availableRoofArea} onChange={(e:any) => setAvailableRoofArea(Number(e.target.value))} unit="m²" />
                  <InputField label="System Losses" value={sysLosses} onChange={(e:any) => setSysLosses(Number(e.target.value))} unit="%" tooltip="Wiring, soiling, mismatch etc." />
                  <InputField label="Panel Wattage" value={panelWattage} onChange={(e:any) => setPanelWattage(Number(e.target.value))} step="5" unit="W" />
                  <InputField label="Panel Efficiency" value={panelEfficiency} onChange={(e:any) => setPanelEfficiency(Number(e.target.value))} step="0.1" unit="%" />
                  <InputField label="Panel Tilt Angle" value={tilt} onChange={(e:any) => setTilt(Number(e.target.value))} unit="°" />
                </div>
                <div className="mt-8 p-4 sm:p-6 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
                  <div>
                    <p className="text-indigo-700/80 font-medium text-sm mb-1 uppercase tracking-wider">Required Array Size</p>
                    <p className="text-xl font-bold text-indigo-600">{actualKw.toFixed(2)} kWp</p>
                  </div>
                  <div className="hidden md:block w-px h-12 bg-indigo-200"></div>
                  <div>
                    <p className="text-indigo-700/80 font-medium text-sm mb-1 uppercase tracking-wider">Number of Panels</p>
                    <p className="text-xl font-bold text-indigo-600">{numPanels} <span className="text-lg">units</span></p>
                    {numPanels > maxPanels && (
                      <p className="text-rose-600 text-base font-medium mt-1.5 flex items-center justify-center md:justify-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5"/> Exceeds max {maxPanels} panels
                      </p>
                    )}
                  </div>
                  <div className="hidden md:block w-px h-12 bg-indigo-200"></div>
                  <div>
                    <p className="text-indigo-700/80 font-medium text-sm mb-1 uppercase tracking-wider">Roof Spacing Needed</p>
                    <p className="text-xl font-bold text-indigo-600">{roofAreaRequired.toFixed(0)} <span className="text-lg">m²</span></p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <Home className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-base font-medium">Maximum Installable Capacity</p>
                      <p className="text-sm text-slate-500">Based on {availableRoofArea} m² available area</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{maxPanels} Panels</p>
                    <p className="text-base font-medium">{maxKw.toFixed(2)} kWp Limit</p>
                  </div>
                </div>
                
                {/* Visual Grid */}
                <div className="mt-4 w-full bg-white border border-slate-200 rounded-xl p-4 min-h-[160px] flex flex-wrap gap-1.5 content-start justify-center relative overflow-hidden">
                  <div className="w-full flex justify-between items-center mb-4">
                    <p className="text-base font-medium flex items-center gap-2">
                      <Grid className="w-4 h-4 text-indigo-500" /> Roof Layout Visualization
                    </p>
                    <div className="flex gap-4 flex-wrap">
                       <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                         <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Valid Panel
                       </p>
                       <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                         <span className="w-2 h-2 rounded-full bg-rose-500"></span> Exceeds Limit
                       </p>
                    </div>
                  </div>
                  {Array.from({ length: Math.min(numPanels, 150) }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                      className={`w-6 h-10 rounded-[3px] border relative transition-all ${
                        i < maxPanels 
                          ? 'bg-indigo-500/10 border-indigo-500/30' 
                          : 'bg-rose-500/10 border-rose-500/30'
                      } z-10 flex flex-col items-center justify-center`}
                      title={i < maxPanels ? `Panel ${i+1}` : `Panel ${i+1} (Exceeds capacity)`}
                    >
                       <div className={`w-full h-px ${i < maxPanels ? 'bg-indigo-500/20' : 'bg-rose-500/20'} absolute top-1/3`}></div>
                       <div className={`w-full h-px ${i < maxPanels ? 'bg-indigo-500/20' : 'bg-rose-500/20'} absolute top-2/3`}></div>
                    </motion.div>
                  ))}
                  {numPanels > 150 && (
                     <div className="w-full mt-4 py-2 text-center text-base font-medium bg-slate-50 rounded-lg">
                        + {numPanels - 150} more panels not shown due to performance limits
                     </div>
                  )}
                  {numPanels === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400">
                       No panels required
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Battery className="text-indigo-600"/> Inverter & Battery Size</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Inverter Efficiency" value={inverterEfficiency} onChange={(e:any) => setInverterEfficiency(Number(e.target.value))} unit="%" />
                  {gridType !== "On-Grid" ? (
                    <>
                      <InputField label="Battery Autonomy Days" value={batteryAutonomy} onChange={(e:any) => setBatteryAutonomy(Number(e.target.value))} step="0.5" unit="days" />
                      <InputField label="Depth of Discharge (DoD)" value={dod} onChange={(e:any) => setDod(Number(e.target.value))} unit="%" />
                      <div className="flex flex-col">
                        <label className="text-sm text-slate-700 font-medium mb-1.5 min-w-[200px]">Battery Chemistry</label>
                        <select value={batteryType} onChange={(e: any) => setBatteryType(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                          <option value="Lithium-Ion" className="bg-white">Lithium-Ion / LiFePO4</option>
                          <option value="Lead-Acid" className="bg-white">Tubular / Lead-Acid</option>
                        </select>
                      </div>
                      <InputField label="System DC Voltage" value={batteryVoltage} onChange={(e:any) => setBatteryVoltage(Number(e.target.value))} step="12" unit="V" />
                    </>
                  ) : (
             <div className="md:col-span-2 p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4 text-slate-500 flex-wrap">
               <Plug className="w-6 h-6" /> Battery bank sizing is skipped for On-Grid purely net-metered systems.
             </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><DollarSign className="text-indigo-600"/> Cost Estimations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-slate-700 font-medium mb-1.5 min-w-[200px]">Currency</label>
                    <select value={currency} onChange={(e: any) => setCurrency(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                      {["PKR", "INR", "AED", "USD"].map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
                    </select>
                  </div>
                  <InputField label="Panel Cost" value={panelCostPerW} onChange={(e:any) => setPanelCostPerW(Number(e.target.value))} unit={`${currency} / W`} />
                  <InputField label="Inverter Cost" value={inverterCostPerKva} onChange={(e:any) => setInverterCostPerKva(Number(e.target.value))} unit={`${currency} / kVA`} />
                  <InputField label="Structure/Mounting (per panel)" value={structureCostPerPanel} onChange={(e:any) => setStructureCostPerPanel(Number(e.target.value))} unit={currency} />
                  {gridType !== "On-Grid" && <InputField label="Battery Cost" value={batteryCostPerKwh} onChange={(e:any) => setBatteryCostPerKwh(Number(e.target.value))} unit={`${currency} / kWh`} />}
                  <InputField label="Wiring & Accessories" value={wiringPercent} onChange={(e:any) => setWiringPercent(Number(e.target.value))} unit="% of Panels" />
                  <InputField label="Installation & Labour" value={labourPercent} onChange={(e:any) => setLabourPercent(Number(e.target.value))} unit="% of Hardware" />
                  {gridType !== "Off-Grid" && <InputField label="Net Metering Fee" value={netMeteringFee} onChange={(e:any) => setNetMeteringFee(Number(e.target.value))} unit={`flat ${currency}`} />}
                  <InputField label="Contingency" value={contingencyPercent} onChange={(e:any) => setContingencyPercent(Number(e.target.value))} unit="%" />
                </div>
              </div>
            )}

            {activeTab === 5 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Zap className="text-indigo-600"/> Production & Savings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Grid Tariff / Unit Rate" value={gridTariff} onChange={(e:any) => setGridTariff(Number(e.target.value))} unit={`${currency} / kWh`} />
                  {gridType !== "Off-Grid" && <InputField label="Net Metering Export Rate" value={exportRate} onChange={(e:any) => setExportRate(Number(e.target.value))} unit="% of Import Tariff" />}
                  <InputField label="Annual Panel Degradation" value={degradation} onChange={(e:any) => setDegradation(Number(e.target.value))} step="0.1" unit="% / year" />
                </div>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                     <p className="text-slate-500 text-base font-medium uppercase tracking-wider mb-2">Daily Generation</p>
                     <p className="text-xl font-semibold text-slate-800">{dailyGen.toFixed(1)} <span className="text-sm font-medium text-slate-500">kWh</span></p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                     <p className="text-slate-500 text-base font-medium uppercase tracking-wider mb-2">Monthly Gen.</p>
                     <p className="text-xl font-semibold text-slate-800">{monthlyGen.toFixed(0)} <span className="text-sm font-medium text-slate-500">kWh</span></p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                     <p className="text-slate-500 text-base font-medium uppercase tracking-wider mb-2">Year 1 Savings</p>
                     <p className="text-xl font-semibold text-slate-800 text-emerald-600">{formatCurrency(annualSavingsAmount).replace(/[^\d\.,]/g,'')} <span className="text-sm font-medium text-emerald-600/50">{currency}</span></p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                     <p className="text-slate-500 text-base font-medium uppercase tracking-wider mb-2">CO₂ Offsets (Yr)</p>
                     <p className="text-xl font-semibold text-slate-800 text-indigo-500">{annualCo2.toFixed(0)} <span className="text-sm font-medium text-indigo-500/50">kg</span></p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 6 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-600"/> Financial Analysis & ROI</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Maintenance Cost" value={maintenancePercent} onChange={(e:any) => setMaintenancePercent(Number(e.target.value))} step="0.1" unit="% of system / yr" />
                  <InputField label="Tariff Escalation Rate" value={tariffEscalation} onChange={(e:any) => setTariffEscalation(Number(e.target.value))} unit="% / yr" />
                  <InputField label="Project Lifespan" value={lifespan} onChange={(e:any) => setLifespan(Number(e.target.value))} unit="years" />
                </div>
                
                <h3 className="font-bold text-lg mt-10 mb-4 border-b border-slate-200 pb-2 text-slate-900">25-Year Cumulative Net Profit</h3>
                <div className="h-64 w-full flex items-end gap-1 select-none">
                  {cashFlows.map((cf, i) => {
                    const maxProfit = cashFlows[cashFlows.length-1].cumProfit;
                    const minProfit = cashFlows[0].cumProfit;
                    const range = maxProfit - Math.min(minProfit, 0);
                    // simple normalizing
                    const heightPrc = Math.max(0, (cf.cumProfit + Math.abs(minProfit)) / range) * 100;
                    const isPositive = cf.cumProfit >= 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full relative group">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-500 ${isPositive ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-400 hover:bg-rose-300'}`} 
                          style={{ height: `${heightPrc}%`, minHeight: '4px' }}
                        />
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap z-10 border border-slate-700 shadow-xl pointer-events-none transition-opacity">
                          Yr {cf.year}: {formatCurrency(cf.cumProfit)}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-2 font-medium">
                  <span>Year 1</span>
                  <span>Year 10</span>
                  <span>Year {lifespan}</span>
                </div>
              </div>
            )}

            {activeTab === 7 && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2"><Calculator className="text-indigo-600"/> Final Report Summary</h2>
                <div className="w-full bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                   
                   <div className="flex justify-between items-start mb-10 relative z-10">
                     <div>
                       <h3 className="text-xl font-bold font-heading mb-1 text-slate-900">{actualKw.toFixed(2)} kWp Solar {gridType}</h3>
                       <p className="text-slate-500">{city} Base Design • {numPanels} Panels • {recInverterKva} kVA Inverter</p>
                     </div>
                     <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-200">
                        ROI: {lifetimeROI.toFixed(0)}%
                     </span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6 relative z-10 border-b border-slate-200 pb-10">
                     <div>
                       <p className="text-slate-500 text-sm font-medium mb-1">Total Turnkey Cost</p>
                       <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSystemCost)}</p>
                     </div>
                     <div>
                       <p className="text-slate-500 text-sm font-medium mb-1">Payback Period</p>
                       <p className="text-xl font-bold text-indigo-600">{simplePayback.toFixed(1)} <span className="text-xl">Years</span></p>
                     </div>
                     <div>
                       <p className="text-slate-500 text-sm font-medium mb-1">Year 1 Savings</p>
                       <p className="text-xl font-bold text-emerald-600">{formatCurrency(netAnnualSavingsYear1)}</p>
                     </div>
                     <div>
                       <p className="text-slate-500 text-sm font-medium mb-1">Lifetime Savings</p>
                       <p className="text-xl font-bold text-emerald-600">{formatCurrency(lifetimeSavings)}</p>
                     </div>
                     {hasBattery && (
                     <div>
                       <p className="text-slate-500 text-sm font-medium mb-1">Battery Storage</p>
                       <p className="text-xl font-bold text-slate-900">{actualBattKwh.toFixed(1)} <span className="text-xl">kWh</span></p>
                     </div>
                     )}
                     <div>
                       <p className="text-slate-500 text-sm font-medium mb-1">CO₂ Offset</p>
                       <p className="text-xl font-bold text-indigo-500">{(annualCo2 * lifespan / 1000).toFixed(1)} <span className="text-xl">Tons</span></p>
                     </div>
                   </div>
                   
                   <div className="mt-8 flex justify-end relative z-10">
                     <button onClick={() => console.log("Download PDF triggered")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 hover:-translate-y-0.5">
                        <Download className="w-5 h-5"/> Download PDF Proposal
                     </button>
                   </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => setActiveTab(Math.max(1, activeTab - 1))} 
                disabled={activeTab === 1}
                className="w-full px-6 py-2.5 rounded-full font-bold text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden"
              >
                Previous
              </button>
              <div className="flex gap-1.5 hidden md:flex">
                {[1,2,3,4,5,6,7].map(n => (
                  <div key={n} className={`w-2 h-2 rounded-full ${n === activeTab ? 'bg-indigo-600' : n < activeTab ? 'bg-slate-300' : 'bg-slate-200'}`}></div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab(Math.min(7, activeTab + 1))}
                disabled={activeTab === 7}
                className="px-6 py-2.5 rounded-full font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 transition-all shadow-sm active:scale-95 hover:-translate-y-0.5"
              >
                {activeTab === 6 ? "View Summary" : "Next Step"} <ChevronRight className="w-4 h-4"/>
              </button>
            </div>

          </div>
        </div>

        {/* Right Sidebar Sticky Summary */}
        <div className="xl:w-1/3">
          <div className="sticky top-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
               <Settings className="text-slate-400 w-5 h-5" /> Live System Snapshot
             </h3>
             
             <div className="space-y-5">
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">System Size</span>
                  <span className="text-slate-900 font-bold text-lg">{actualKw.toFixed(1)} kWp</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Req. Inverter</span>
                  <span className="text-slate-900 font-bold text-lg">{recInverterKva} kVA</span>
               </div>
               {hasBattery && (
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Battery Bank</span>
                  <span className="text-slate-900 font-bold text-lg">{actualBattKwh.toFixed(1)} kWh</span>
               </div>
               )}
               <div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Total Project Cost</span>
                  <span className="text-indigo-600 font-bold text-xl">{formatCurrency(totalSystemCost)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Cost / Watt</span>
                  <span className="text-slate-700 font-bold text-sm">{(totalSystemCost / (actualKw*1000)).toFixed(2)} {currency}/W</span>
               </div>
               <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">First Year Savings</span>
                  <span className="text-emerald-600 font-bold text-lg">{formatCurrency(netAnnualSavingsYear1)}</span>
               </div>
             </div>

             <div className="w-full mt-8 bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Est. Payback</span>
                  <div className="text-right">
                    <span className="text-indigo-600 font-bold text-2xl">{simplePayback.toFixed(1)}</span>
                    <span className="text-slate-500 text-sm ml-1">Years</span>
                  </div>
               </div>
             </div>
             
             {/* Cost Breakdown Mini Bar */}
             <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm text-slate-500 font-medium px-1">
                   <span>Hardware</span>
                   <span>Labor/Misc</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200">
                  <div className="bg-indigo-600 h-full" style={{ width: `${(hardwareTotal/totalSystemCost)*100}%` }}></div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
