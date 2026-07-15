import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UniversalTabs } from "../ui/UniversalTabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import {
  Ruler,
  Square,
  Box,
  Scale,
  Gauge,
  Compass,
  Zap,
  Hammer,
  Wrench,
  Thermometer,
  GaugeCircle,
  Clock,
  Fuel,
  Battery,
  Database,
  ArrowRightLeft,
  RefreshCcw,
  Activity,
  Radio,
  Waves,
  Rocket,
  RotateCcw,
  Droplets,
  Wind,
  AlignEndHorizontal,
  FlaskConical,
  Type,
  Monitor,
  Banknote, History,
} from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { Category, unitsData, convertValue } from "../../utils/unitConverter";
import { useSettings } from "../../context/SettingsContext";
import { useUnitChange } from "../../hooks/useUnitChange";

const categories: { id: Category; label: string; icon: any; color: string }[] = [
  { id: "Length", label: "Length", icon: Ruler, color: "text-emerald-500 bg-emerald-100/50 " },
  { id: "Area", label: "Area", icon: Square, color: "text-blue-500 bg-blue-100/50 " },
  { id: "Volume", label: "Volume", icon: Box, color: "text-purple-500 bg-purple-100/50 " },
  { id: "Mass", label: "Mass (Weignt)", icon: Scale, color: "text-rose-500 bg-rose-100/50 " },
  { id: "Density", label: "Density", icon: Droplets, color: "text-teal-500 bg-teal-100/50 " },
  { id: "Force", label: "Force", icon: Hammer, color: "text-blue-500 bg-blue-100/50 " },
  { id: "Pressure & Stress", label: "Pressure / Stress", icon: Gauge, color: "text-red-500 bg-red-100/50 " },
  { id: "Torque & Moment", label: "Torque / Moment", icon: RotateCcw, color: "text-indigo-600 bg-indigo-50/50 " },
  { id: "Velocity", label: "Velocity", icon: GaugeCircle, color: "text-sky-500 bg-sky-100/50 " },
  { id: "Angle", label: "Angle", icon: Compass, color: "text-yellow-500 bg-yellow-100/50 " },
  { id: "Temperature", label: "Temperature", icon: Thermometer, color: "text-pink-500 bg-pink-100/50 " },
  { id: "Energy & Work", label: "Energy & Work", icon: Wrench, color: "text-fuchsia-500 bg-fuchsia-100/50 " },
  { id: "Power", label: "Power", icon: Zap, color: "text-amber-500 bg-amber-100/50 " },
  { id: "Volumetric Flow", label: "Volumetric Flow", icon: Wind, color: "text-cyan-500 bg-cyan-100/50 " },
  { id: "Dynamic Viscosity", label: "Dynamic Viscosity", icon: FlaskConical, color: "text-violet-500 bg-violet-100/50 " }
];

const presets: Partial<Record<Category, { label: string, value: string, unit: string }[]>> = {
  Length: [
    { label: "Standard Rebar (12m)", value: "12", unit: "m" },
    { label: "Standard Rebar (40ft)", value: "40", unit: "ft" },
    { label: "Door Height (2.1m)", value: "2.1", unit: "m" },
    { label: "Story Height (3m)", value: "3", unit: "m" },
  ],
  Area: [
    { label: "1 Marla (225 sq ft)", value: "225", unit: "sft" },
    { label: "1 Marla (272.25 sq ft)", value: "272.25", unit: "sft" },
    { label: "1 Kanal", value: "5445", unit: "sft" },
    { label: "Standard Parking (11.5m²)", value: "11.5", unit: "sm" },
  ],
  Volume: [
    { label: "Concrete Mixer Truck (6m³)", value: "6", unit: "cm" },
    { label: "Standard Cement Bag", value: "1.226", unit: "cf" },
  ],
  Mass: [
    { label: "Cement Bag", value: "50", unit: "kg" },
    { label: "Steel Rebar Bundle", value: "1000", unit: "kg" },
  ],
  "Pressure & Stress": [
    { label: "Concrete M20", value: "20", unit: "mpa" },
    { label: "Steel Fe500", value: "500", unit: "mpa" },
    { label: "Atmospheric (1 atm)", value: "1", unit: "atm" },
  ],
  Density: [
    { label: "Water", value: "1000", unit: "kg_m3" },
    { label: "Steel", value: "7850", unit: "kg_m3" },
    { label: "Concrete (Plain)", value: "2400", unit: "kg_m3" },
  ]
};

const QUICK_PAIRS: Partial<Record<Category, { label: string, from: string, to: string }[]>> = {
  Length: [
    { label: "m ↔ ft", from: "m", to: "ft" },
    { label: "mm ↔ in", from: "mm", to: "in" },
    { label: "km ↔ mi", from: "km", to: "mi" },
  ],
  Area: [
    { label: "m² ↔ sq ft", from: "sm", to: "sft" },
    { label: "Acre ↔ Hectare", from: "ac", to: "ha" },
  ],
  Volume: [
    { label: "m³ ↔ cu ft", from: "cm", to: "cf" },
    { label: "Liter ↔ Gal", from: "l", to: "us_gal" },
  ],
  Mass: [
    { label: "kg ↔ lb", from: "kg", to: "lb" },
    { label: "Ton ↔ lb", from: "t", to: "lb" },
  ],
  "Pressure & Stress": [
    { label: "MPa ↔ psi", from: "mpa", to: "psi" },
    { label: "Pa ↔ psf", from: "pa", to: "psf" },
  ],
  Velocity: [
    { label: "km/h ↔ mph", from: "km_h", to: "mph" },
    { label: "m/s ↔ ft/s", from: "m_s", to: "ft_s" },
  ],
  Temperature: [
    { label: "°C ↔ °F", from: "c", to: "f" }
  ]
};

export default function UnitConverter() {
  const { settings, updateSettings } = useSettings();
  const [activeCategory, setActiveCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState<string>(unitsData["Length"][0].id);
  const [toUnit, setToUnit] = useState<string>(unitsData["Length"][1].id);
  const [fromValue, setFromValue] = useState<string>("1");
  const [toValue, setToValue] = useState<string>("");
  
  const [viewMode, setViewMode] = useState<"standard" | "batch" | "compare">("standard");
  const isBatchMode = viewMode === "batch";
  const isCompareMode = viewMode === "compare";
  const [batchInput, setBatchInput] = useState<string>("");
  const [batchResults, setBatchResults] = useState<{in: string, out: string}[]>([]);
  const [recentConversions, setRecentConversions] = useState<{
    id: string;
    timestamp: number;
    fromValue: string;
    fromUnit: string;
    toValue: string;
    toUnit: string;
    category: Category;
  }[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("unit_converter_recent") : null;
    if (saved) {
      try {
        setRecentConversions(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (!fromValue || isNaN(parseFloat(fromValue)) || !toValue || viewMode !== "standard") return;
    
    const timeout = setTimeout(() => {
      setRecentConversions(prev => {
        if (prev.length > 0) {
          const last = prev[0];
          if (last.fromValue === fromValue && last.fromUnit === fromUnit && last.toUnit === toUnit) {
            return prev;
          }
        }
        
        const newRecent = [
          {
            id: Date.now().toString(),
            timestamp: Date.now(),
            fromValue,
            fromUnit,
            toValue,
            toUnit,
            category: activeCategory
          },
          ...prev
        ].slice(0, 5);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("unit_converter_recent", JSON.stringify(newRecent));
        }
        return newRecent;
      });
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [fromValue, fromUnit, toUnit, toValue, activeCategory, viewMode]);

  useEffect(() => {
    if (isBatchMode) {
      const values = batchInput.split(/[\n,]+/).map(v => v.trim()).filter(v => v !== "" && !isNaN(parseFloat(v)));
      setBatchResults(values.map(v => ({ in: v, out: convertValue(v, fromUnit, toUnit, activeCategory) })));
    }
  }, [batchInput, fromUnit, toUnit, activeCategory, isBatchMode]);

  // Listen for global unit changes
  useUnitChange((newUnit) => {
    // When global units change, automatically adjust the target 'toUnit' for basic categories
    if (activeCategory === "Length") {
      setToUnit(newUnit === "SI" ? "m" : "ft");
    } else if (activeCategory === "Area") {
      setToUnit(newUnit === "SI" ? "m²" : "ft²");
    } else if (activeCategory === "Volume") {
      setToUnit(newUnit === "SI" ? "m³" : "ft³");
    } else if (activeCategory === "Mass") {
      setToUnit(newUnit === "SI" ? "kg" : "lb");
    }
  });

  // Re-run conversion when target unit changes via hook
  useEffect(() => {
    if (!isBatchMode) {
      setToValue(convertValue(fromValue, fromUnit, toUnit, activeCategory));
    }
  }, [toUnit, fromValue, fromUnit, activeCategory, isBatchMode]);

  const handleFromValueChange = (valStr: string) => {
    let currentFromUnit = fromUnit;

    // Detect if user typed a unit at the end
    const match = valStr.trim().match(/^([-+]?[0-9]*\.?[0-9]+)\s*([a-zA-Z²³\s/23]+)$/);
    if (match && match[2]) {
      const unitStr = match[2].trim().toLowerCase();
      const uData = unitsData[activeCategory] || [];
      
      const foundUnit = uData.find((u) => {
        const idLower = u.id.toLowerCase();
        const labelAbbrMatch = u.label.match(/\(([^)]+)\)/);
        const abbr = labelAbbrMatch ? labelAbbrMatch[1].toLowerCase() : "";
        
        const unitWithSuperscripts = unitStr.replace(/2$/, '²').replace(/3$/, '³');
        
        return idLower === unitStr || 
               abbr === unitStr || 
               idLower === unitWithSuperscripts || 
               abbr === unitWithSuperscripts;
      });

      if (foundUnit && foundUnit.id !== fromUnit) {
        currentFromUnit = foundUnit.id;
        setFromUnit(foundUnit.id);
      }
    }

    setFromValue(valStr);
    setToValue(convertValue(valStr, currentFromUnit, toUnit, activeCategory));
  };

  const handleFromUnitChange = (fUnit: string) => {
    setFromUnit(fUnit);
    setToValue(convertValue(fromValue, fUnit, toUnit, activeCategory));
  };

  const handleToUnitChange = (tUnit: string) => {
    setToUnit(tUnit);
    setToValue(convertValue(fromValue, fromUnit, tUnit, activeCategory));
  };

  useEffect(() => {
    /* Reset units when category changes */ const units =
      unitsData[activeCategory];
    if (units.length > 0) {
      const initFromUnit = units[0].id;
      const initToUnit = units.length > 1 ? units[1].id : units[0].id;
      setFromUnit(initFromUnit);
      setToUnit(initToUnit);
      setFromValue("1");
      setToValue(convertValue("1", initFromUnit, initToUnit, activeCategory));
    }
  }, [activeCategory]);

  const handleSwap = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setToValue(convertValue(fromValue, toUnit, tempUnit, activeCategory));
  };
  const currentUnits = unitsData[activeCategory] || [];
  
  const fromUnitLabel = currentUnits.find((u) => u.id === fromUnit)?.label || fromUnit;
  const toUnitLabel = currentUnits.find((u) => u.id === toUnit)?.label || toUnit;
  const conversionRate = convertValue("1", fromUnit, toUnit, activeCategory);

  const generateChartData = () => {
    // Determine reasonable scale points based on category
    const points = [1, 5, 10, 50, 100];
    return points.map(p => ({
      from: p,
      to: parseFloat(convertValue(p.toString(), fromUnit, toUnit, activeCategory)) || 0
    }));
  };
  
  const chartData = generateChartData();

  return (
    <div className="w-full h-full bg-transparent text-slate-900  p-6 md:p-8">
      {" "}
      <div className="w-full md:max-w-6xl md:mx-auto px-4 md:px-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="flex-1 min-w-0">
        {" "}
        {" "}
        {" "}
        {/* Categories Tabs */}
        <div className="mb-10">
          <div className="w-full bg-white/70 backdrop-blur-3xl rounded-none p-4 sm:p-4 sm:p-4 sm:p-6 mb-8 border-y border-slate-200/50 shadow-sm overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-fuchsia-500" />
                  Global Measurement System
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Automatically scale input fields across all calculators based on your preference.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-md border border-slate-200/50 relative z-10 w-full md:w-auto">
                <button
                  onClick={() => updateSettings({ measurement: "SI" })}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded text-sm font-bold transition-all ${
                    settings.measurement === "SI"
                      ? "bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Metric (m, kg)
                </button>
                <button
                  onClick={() => updateSettings({ measurement: "FPS" })}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded text-sm font-bold transition-all ${
                    settings.measurement === "FPS"
                      ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Imperial (ft, lb)
                </button>
              </div>
            </div>
          </div>

          <UniversalTabs 
            tabs={categories.map(c => ({ id: c.id, label: c.label, icon: <c.icon className="w-5 h-5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" /> }))}
            activeTab={activeCategory}
            onTabChange={(id) => setActiveCategory(id as Category)}
          />
        </div>
        {/* Conversion UI */}{" "}
        <div className="w-full bg-white/70  backdrop-blur-3xl rounded-[2.5rem] p-4 sm:p-4 sm:p-4 sm:p-8 md:p-5 sm:p-5 sm:p-5 sm:p-12 border border-slate-200/50  shadow-sm  overflow-hidden relative">
          {" "}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-center sm:text-left text-slate-900  uppercase tracking-widest">
              {activeCategory} Conversion
            </h2>
            <div className="flex items-center justify-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200 shadow-inner">
               <button 
                 onClick={() => setViewMode("standard")}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "standard" ? 'bg-fuchsia-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
               >
                 Standard
               </button>
               <button 
                 onClick={() => setViewMode("batch")}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "batch" ? 'bg-fuchsia-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
               >
                 Batch
               </button>
               <button 
                 onClick={() => setViewMode("compare")}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === "compare" ? 'bg-fuchsia-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
               >
                 Compare
               </button>
            </div>
          </div>

          {/* Quick Pair Toggle */}
          {QUICK_PAIRS[activeCategory] && QUICK_PAIRS[activeCategory]!.length > 0 && !isBatchMode && !isCompareMode && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-300 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest mr-2 hidden sm:block">
                Quick Pairs
              </span>
              {QUICK_PAIRS[activeCategory]!.map((pair, idx) => {
                const isActive = (fromUnit === pair.from && toUnit === pair.to) || (fromUnit === pair.to && toUnit === pair.from);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (fromUnit === pair.from && toUnit === pair.to) {
                        setFromUnit(pair.to);
                        setToUnit(pair.from);
                      } else if (fromUnit === pair.to && toUnit === pair.from) {
                        setFromUnit(pair.from);
                        setToUnit(pair.to);
                      } else {
                        setFromUnit(pair.from);
                        setToUnit(pair.to);
                      }
                    }}
                    className={`px-4 py-2 rounded-[16px] text-xs sm:text-sm font-bold transition-all border shadow-sm active:scale-95 ${
                      isActive
                        ? "bg-fuchsia-500 text-white border-fuchsia-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {pair.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            {" "}
            {/* FROM PANE */}{" "}
            <div className={`w-full bg-slate-100/50  backdrop-blur-xl rounded-[2rem] border border-slate-200  shadow-inner p-6 md:p-8 transition-all hover:border-fuchsia-500/50 hover:bg-slate-100/80  flex flex-col items-center justify-center relative ${isBatchMode ? 'flex-none md:w-[45%]' : 'flex-1'}`}>
              {" "}
              <label className="block text-xs font-bold text-fuchsia-600  uppercase tracking-widest mb-4 drop-shadow-sm  z-10">
                From
              </label>{" "}
              <select
                value={fromUnit}
                onChange={(e) => handleFromUnitChange(e.target.value)}
                className="w-full bg-white/70  border border-slate-300  text-slate-800  px-4 py-3 rounded-[24px] font-bold text-sm mb-6 focus:ring-4 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all outline-none shadow-sm  z-10 overflow-hidden"
              >
                {" "}
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}{" "}
              </select>{" "}
              {isBatchMode ? (
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="Paste comma-separated values (e.g., 5, 10, 15)"
                  className="w-full bg-white/50  border border-slate-300  text-slate-900  rounded-[20px] p-4 text-center font-mono text-sm min-h-[120px] focus:outline-none focus:border-fuchsia-500 transition-colors z-10 resize-none shadow-sm  overflow-hidden"
                />
              ) : (
                <><label htmlFor="a11y-input-529" className="sr-only">0</label>
<input id="a11y-input-529"
                  type="text"
                  value={fromValue}
                  onChange={(e) => handleFromValueChange(e.target.value)}
                  className="w-full bg-transparent border-0 text-[clamp(1.75rem,5vw,2.5rem)] font-bold tabular-nums tracking-tight text-slate-900  placeholder-slate-500  focus:ring-0 focus:outline-none p-0 text-center drop-shadow-sm  z-10 rounded-full"
                  placeholder="0"
                  autoComplete="off"
                /></>
              )}{" "}
            </div>{" "}
            {/* SWAP BUTTON */}{" "}
            {!isCompareMode ? (
              <button onClick={handleSwap}
                className="p-5 rounded-full bg-fuchsia-100 text-fuchsia-600 hover:bg-fuchsia-600 hover:text-slate-900 transition-all shadow-lg hover:rotate-180 duration-500 flex-shrink-0 active:scale-95 hover:-translate-y-0.5"
                title="Swap Units"
              >
                {" "}
                <ArrowRightLeft className="w-6 h-6" strokeWidth={2.5} />{" "}
              </button>
            ) : (
              <div className="hidden md:flex p-5 rounded-full bg-fuchsia-50 text-fuchsia-300 shadow-sm flex-shrink-0">
                <ArrowRightLeft className="w-6 h-6 opacity-50" strokeWidth={2.5} />
              </div>
            )}{" "}
            {/* TO PANE */}{" "}
            <div className={`w-full bg-slate-100/50  backdrop-blur-xl rounded-[2rem] border border-slate-200  shadow-inner p-6 md:p-8 transition-all hover:border-fuchsia-500/50 hover:bg-slate-100/80  flex flex-col items-center justify-center relative ${isBatchMode || isCompareMode ? 'flex-none md:w-[45%]' : 'flex-1'}`}>
              {" "}
              <label className="block text-xs font-bold text-fuchsia-600  uppercase tracking-widest mb-4 drop-shadow-sm  z-10">
                To {isCompareMode && "(Comparison)"}
              </label>{" "}
              {!isCompareMode && (
              <select
                value={toUnit}
                onChange={(e) => handleToUnitChange(e.target.value)}
                className="w-full bg-white/70  border border-slate-300  text-slate-800  px-4 py-3 rounded-[24px] font-bold text-sm mb-6 focus:ring-4 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-all outline-none shadow-sm  z-10 overflow-hidden"
              >
                {" "}
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
              )}
              
              {isBatchMode ? (
                <div className="w-full bg-white/50  border border-slate-300  rounded-[20px] p-4 text-center font-mono text-sm min-h-[120px] max-h-[200px] overflow-y-auto custom-scrollbar shadow-sm  z-10 flex flex-col gap-1 overflow-hidden">
                   {batchResults.length === 0 ? (
                     <div className="text-slate-500 italic my-auto">Results will appear here</div>
                   ) : (
                     batchResults.map((res, i) => (
                       <div key={i} className="flex justify-between items-center text-slate-700  border-b border-slate-200  pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">
                         <span className="opacity-70">{res.in} <span className="text-[10px] uppercase">{fromUnit}</span></span>
                         <span className="font-bold text-fuchsia-600">{res.out} <span className="text-[10px] uppercase text-fuchsia-600/70">{toUnit}</span></span>
                       </div>
                     ))
                   )}
                </div>
              ) : isCompareMode ? (
                <div className="w-full bg-white/50 border border-slate-300 rounded-[20px] p-4 text-center font-mono text-sm min-h-[120px] max-h-[300px] overflow-y-auto custom-scrollbar shadow-sm z-10 flex flex-col gap-2 overflow-hidden">
                   {currentUnits.filter(u => u.id !== fromUnit).map((u, i) => (
                     <div key={i} className="w-full flex justify-between items-center text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                       <span className="font-bold text-fuchsia-600 text-lg truncate mr-3">{convertValue(fromValue, fromUnit, u.id, activeCategory)}</span>
                       <span className="text-xs uppercase font-bold text-slate-600 text-right shrink-0">{u.id} <br/><span className="font-normal opacity-70 text-[10px]">{u.label.split(' (')[0]}</span></span>
                     </div>
                   ))}
                </div>
              ) : (
                <div
                  className="w-full overflow-hidden text-center text-[clamp(1.75rem,5vw,2.5rem)] font-bold tabular-nums tracking-tight text-slate-900  py-2 drop-shadow-sm  z-10 flex items-center justify-center"
                  style={{ minHeight: "60px" }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={toValue || "0"}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {toValue || "0"}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>{" "}
          </div>{" "}
          
          {/* Industry Standard Presets */}
          {presets[activeCategory] && presets[activeCategory]!.length > 0 && !isBatchMode && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3 text-center sm:text-left">
                Industry Standard Presets
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {presets[activeCategory]!.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFromUnit(preset.unit);
                      setFromValue(preset.value);
                      setToValue(convertValue(preset.value, preset.unit, toUnit, activeCategory));
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-full transition-colors border border-slate-200 hover:border-slate-300 shadow-sm active:scale-95 hover:-translate-y-0.5"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Conversion specific feedback */}
          {conversionRate !== "" && !isBatchMode && !isCompareMode && (
             <div className="mt-8 pt-6 border-t border-slate-200  flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
                <p className="text-sm font-semibold text-slate-500  uppercase tracking-widest mb-3">
                  Conversion Rate & Reference
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-fuchsia-50  rounded-full border border-fuchsia-200  text-fuchsia-700  font-medium sm:text-lg text-sm flex-wrap justify-center mb-8">
                  <span>1 {fromUnitLabel.split(' (')[0]}</span>
                  <span className="text-fuchsia-500  font-normal">=</span>
                  <span className="font-bold">{conversionRate} {toUnitLabel.split(' (')[0]}</span>
                </div>
                
                {/* Reference Chart */}
                <div className="w-full h-48 md:h-64 mt-2 px-2 pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                        dataKey="from" 
                        stroke="#94a3b8" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#e879f9' }}
                        formatter={(value: any) => [value.toLocaleString(undefined, { maximumFractionDigits: 3 }) + ' ' + toUnit, 'Result']}
                        labelFormatter={(label) => `${label} ${fromUnit}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="to" 
                        stroke="#d946ef" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#d946ef', strokeWidth: 2, stroke: '#1e293b' }}
                        activeDot={{ r: 6, fill: '#f0abfc' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>
          )}
        </div>{" "}
        {" "}
          </div>
          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-fuchsia-500" />
                <h3 className="text-lg font-bold text-slate-900">Recent Conversions</h3>
              </div>
              
              <div className="space-y-3">
                {recentConversions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-6">No recent conversions.</p>
                ) : (
                  recentConversions.map((conv, i) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveCategory(conv.category);
                        setFromUnit(conv.fromUnit);
                        setToUnit(conv.toUnit);
                        setFromValue(conv.fromValue);
                      }}
                      className="w-full text-left bg-white hover:bg-fuchsia-50/50 border border-slate-100 hover:border-fuchsia-100 p-3 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{conv.category}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {conv.fromValue} <span className="text-xs text-slate-500">{conv.fromUnit}</span>
                          </p>
                        </div>
                        <ArrowRightLeft className="w-3 h-3 text-slate-300 group-hover:text-fuchsia-400 shrink-0" />
                        <div className="min-w-0 text-right">
                          <p className="font-bold text-fuchsia-600 truncate">
                            {conv.toValue} <span className="text-xs text-fuchsia-400">{conv.toUnit}</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      <CalculationHistory
        calculatorId="unit_converter_v1"
        currentInputs={{ activeCategory, fromUnit, toUnit, fromValue }}
        currentResults={{ toValue: toValue || "0" }}
        summaryGeneration={(inputs, results) => `${inputs.fromValue} ${inputs.fromUnit} to ${results.toValue} ${inputs.toUnit}`}
        onRestore={(inputs) => {
          if (inputs.activeCategory) setActiveCategory(inputs.activeCategory);
          if (inputs.fromUnit) setFromUnit(inputs.fromUnit);
          if (inputs.toUnit) setToUnit(inputs.toUnit);
          if (inputs.fromValue !== undefined) setFromValue(inputs.fromValue);
        }}
      />
    </div>
  );
}
