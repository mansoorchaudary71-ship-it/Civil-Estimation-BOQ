import React, { useState, useEffect, useMemo } from "react";
import AggregateChart from "./AggregateChart";
import { RefreshCw, Calculator, Layers, AlertCircle, ArrowRightLeft, Wand2, LineChart as LineChartIcon } from "lucide-react";
import toast from "react-hot-toast";



// Custom hook for debouncing values (e.g. for slider interactions)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface BinData {
  size: number;
  minPassing: number;
  maxPassing: number;
  binA: number | "";
  binB: number | "";
  binC: number | "";
  binD: number | "";
}

import { CalculationHistory } from "../ui/CalculationHistory";
import { FieldTooltip } from "../ui/FieldTooltip";

import { Category, sieveSpecData } from "../../data/sieveSpecs";

export default function AggregateBlendingCalculator() {
  const [categories, setCategories] = useState<Category[]>(sieveSpecData.categories);
  const [selectedCategory, setSelectedCategory] = useState<string>(sieveSpecData.categories[0]?.name || "");
  const [selectedGrading, setSelectedGrading] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [sieveData, setSieveData] = useState<BinData[]>([]);
  
  // Proportions for Bin A, B, C, D
  const [proportions, setProportions] = useState<[number, number, number, number]>([25, 25, 25, 25]);
  const [binNames, setBinNames] = useState<[string, string, string, string]>(["20mm Agg", "10mm Agg", "Stone Dust", "Sand"]);

  useEffect(() => {
    // Initial setup if needed, handled by initial state
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((c) => c.name === selectedCategory);
      if (category && category.gradings.length > 0) {
        setSelectedGrading(category.gradings[0].name);
      } else {
        setSelectedGrading("");
      }
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedCategory && selectedGrading) {
      const category = categories.find((c) => c.name === selectedCategory);
      const grading = category?.gradings.find((g) => g.name === selectedGrading);
      
      if (grading) {
        setSieveData(
          grading.sieves.map((s) => ({
            size: s.size,
            minPassing: s.minPassing,
            maxPassing: s.maxPassing,
            binA: 100, // Default to 100 to show something on the graph initially
            binB: 100,
            binC: 100,
            binD: 100,
          }))
        );
      }
    }
  }, [selectedCategory, selectedGrading, categories]);

  const handleProportionChange = (index: number, valStr: string) => {
    let newValue = parseFloat(valStr);
    if (isNaN(newValue)) newValue = 0;
    if (newValue < 0) newValue = 0;
    if (newValue > 100) newValue = 100;

    const diff = newValue - proportions[index];
    const others = proportions.map((p, i) => i !== index ? p : 0);
    const sumOthers = others.reduce((a, b) => a + b, 0);

    let newProportions: [number, number, number, number] = [...proportions] as [number, number, number, number];
    newProportions[index] = newValue;

    if (sumOthers > 0) {
      for (let i = 0; i < 4; i++) {
        if (i !== index) {
          newProportions[i] -= diff * (proportions[i] / sumOthers);
          if (newProportions[i] < 0) newProportions[i] = 0; // Clamp and renormalize later if needed
        }
      }
    } else {
      const amt = -diff / 3;
      for (let i = 0; i < 4; i++) {
        if (i !== index) newProportions[i] = Math.max(0, amt);
      }
    }

    // Force strict 100% normalization to avoid float issues
    const finalSum = newProportions.reduce((a, b) => a + b, 0);
    if (finalSum > 0 && Math.abs(finalSum - 100) > 0.01) {
       for (let i = 0; i < 4; i++) {
           newProportions[i] = (newProportions[i] / finalSum) * 100;
       }
    }
    
    setProportions(newProportions);
  };

  const handleBinDataChange = (sieveIndex: number, bin: 'binA'|'binB'|'binC'|'binD', val: string) => {
    const newData = [...sieveData];
    newData[sieveIndex][bin] = val === "" ? "" : parseFloat(val);
    setSieveData(newData);
  };

  const handleBinNameChange = (index: number, val: string) => {
    const newNames = [...binNames] as [string, string, string, string];
    newNames[index] = val;
    setBinNames(newNames);
  };

  const getBlendedValue = (row: BinData): number | null => {
    const a = row.binA === "" ? 0 : row.binA;
    const b = row.binB === "" ? 0 : row.binB;
    const c = row.binC === "" ? 0 : row.binC;
    const d = row.binD === "" ? 0 : row.binD;
    
    // Only calculate if we have some data
    if (row.binA === "" && row.binB === "" && row.binC === "" && row.binD === "") return null;

    return (a * proportions[0] / 100) + 
           (b * proportions[1] / 100) + 
           (c * proportions[2] / 100) + 
           (d * proportions[3] / 100);
  };

  const optimizeBlend = () => {
    const binActive = [
      sieveData.some((row) => row.binA !== ""),
      sieveData.some((row) => row.binB !== ""),
      sieveData.some((row) => row.binC !== ""),
      sieveData.some((row) => row.binD !== "")
    ];
    
    if (binActive.every(a => !a)) {
        toast.error("No data available in stockpiles.");
        return;
    }

    let bestError = Infinity;
    let bestProps: [number, number, number, number] = [...proportions];
    const step = 1;

    for (let p0 = 0; p0 <= 100; p0 += step) {
      if (!binActive[0] && p0 > 0) continue;
      for (let p1 = 0; p1 <= 100 - p0; p1 += step) {
        if (!binActive[1] && p1 > 0) continue;
        for (let p2 = 0; p2 <= 100 - p0 - p1; p2 += step) {
          if (!binActive[2] && p2 > 0) continue;

          const p3 = 100 - p0 - p1 - p2;
          if (!binActive[3] && p3 > 0) continue; 

          let error = 0;
          for (const row of sieveData) {
            const target = (row.minPassing + row.maxPassing) / 2;
            const a = row.binA === "" ? 0 : row.binA;
            const b = row.binB === "" ? 0 : row.binB;
            const c = row.binC === "" ? 0 : row.binC;
            const d = row.binD === "" ? 0 : row.binD;
            const blend = (a * p0 + b * p1 + c * p2 + d * p3) / 100;
            // Weigh errors slightly higher if they fall completely outside limits, though optimizing for midpoint usually keeps it in bounds
            const penalty = (blend < row.minPassing || blend > row.maxPassing) ? 5 : 1; 
            error += Math.pow(blend - target, 2) * penalty;
          }

          if (error < bestError) {
            bestError = error;
            bestProps = [p0, p1, p2, p3];
          }
        }
      }
    }

    setProportions(bestProps);
    toast.success("Optimized proportions for best fit!");
  };

  // Debounce the proportions to prevent chart lag during slider drag
  const debouncedProportions = useDebounce(proportions, 100);

  const chartData = useMemo(() => {
    return sieveData.map(row => {
      const a = row.binA === "" ? 0 : row.binA;
      const b = row.binB === "" ? 0 : row.binB;
      const c = row.binC === "" ? 0 : row.binC;
      const d = row.binD === "" ? 0 : row.binD;
      
      let blendValue = null;
      if (row.binA !== "" || row.binB !== "" || row.binC !== "" || row.binD !== "") {
        blendValue = (a * debouncedProportions[0] / 100) + 
                     (b * debouncedProportions[1] / 100) + 
                     (c * debouncedProportions[2] / 100) + 
                     (d * debouncedProportions[3] / 100);
      }

      return {
        size: row.size,
        logSize: row.size === 0 ? 0.001 : row.size,
        Blend: blendValue !== null ? parseFloat(blendValue.toFixed(2)) : null,
        Min: row.minPassing,
        Max: row.maxPassing
      };
    }).sort((a, b) => a.size - b.size);
  }, [sieveData, debouncedProportions]);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 md:max-w-7xl md:mx-auto pb-20 px-4 md:px-0">
      
      {/* Header */}
      <div className="w-full bg-white [#151821] rounded-[24px] p-4 sm:p-6 md:p-4 sm:p-8 mb-6 shadow-sm border border-slate-200 overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[16px] bg-[var(--accent-vibrant)]/10 border border-[var(--accent-vibrant)]/20 mb-3">
           <ArrowRightLeft className="w-4 h-4 text-[var(--accent-vibrant)]" />
           <span className="text-base font-medium text-[var(--accent-vibrant)] uppercase tracking-wider">Mix Design Toolkit</span>
        </div>
        <h2 className="md: font-heading tabular-nums text-slate-900 dark:text-white mb-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">Aggregate Blending Calculator</h2>
        <p className="max-w-3xl text-base font-normal text-slate-600 leading-relaxed">
          Blend 2 to 4 different aggregate stockpiles to meet target grading specifications. Use the interactive sliders to adjust proportions and instantly preview the blended gradation envelope.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Top/Left Section: Inputs & Spec Selection */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-bg-card/80 backdrop-blur-md rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">
                  Target Category
                  <FieldTooltip content="The classification or standard specifying the required aggregate mix properties." />
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-[24px] bg-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[var(--accent-vibrant)] outline-none text-slate-700 transition-all text-base font-normal overflow-hidden"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">
                  Target Specification
                  <FieldTooltip content="The specific grading limits (min and max percent passing) required for the blended aggregate." />
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-[24px] bg-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[var(--accent-vibrant)] outline-none text-slate-700 transition-all text-base font-normal overflow-hidden"
                  value={selectedGrading}
                  onChange={(e) => setSelectedGrading(e.target.value)}
                >
                  {categories.find(c => c.name === selectedCategory)?.gradings.map(g => (
                    <option key={g.name} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-bg-card/80 backdrop-blur-md rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
              <Layers className="w-5 h-5 text-[var(--accent-vibrant)]" /> Stockpile Percent Passing
            </h3>
            
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="py-2 px-2 text-base font-medium uppercase tracking-wider w-24">IS Sieve</th>
                  {[0, 1, 2, 3].map(i => (
                    <th key={i} className="py-2 px-2">
                      <><label htmlFor="a11y-input-34" className="sr-only">Input</label>
<input id="a11y-input-34" 
                        type="text"
                        value={binNames[i]}
                        onChange={(e) => handleBinNameChange(i, e.target.value)}
                        className="w-full text-base font-medium bg-transparent border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-[var(--accent-vibrant)] outline-none pb-1 uppercase tracking-wider rounded-full"
                      /></>
                    </th>
                  ))}
                  <th className="py-2 px-2 text-base font-medium uppercase tracking-wider text-right w-24">Blended %</th>
                  <th className="py-2 px-2 text-base font-medium uppercase tracking-wider text-right w-24">Limits</th>
                </tr>
              </thead>
              <tbody>
                {sieveData.map((row, idx) => {
                  const blend = getBlendedValue(row);
                  const isPassing = blend !== null && blend >= row.minPassing && blend <= row.maxPassing;
                  
                  return (
                    <tr key={row.size} className="border-t border-slate-200 dark:border-slate-700/50">
                      <td className="py-2 px-2 font-mono text-sm text-slate-800 font-medium">
                        {row.size} mm
                      </td>
                      <td className="py-2 px-2">
                        <><label htmlFor="a11y-input-35" className="sr-only">Input</label>
<input id="a11y-input-35" type="number" inputMode="decimal"
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-[var(--accent-vibrant)] outline-none min-h-[44px] text-base font-normal rounded-full"
                          value={row.binA}
                          onChange={(e) => handleBinDataChange(idx, 'binA', e.target.value)}
                        /></>
                      </td>
                      <td className="py-2 px-2">
                        <><label htmlFor="a11y-input-36" className="sr-only">Input</label>
<input id="a11y-input-36" type="number" inputMode="decimal"
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-[var(--accent-vibrant)] outline-none min-h-[44px] text-base font-normal rounded-full"
                          value={row.binB}
                          onChange={(e) => handleBinDataChange(idx, 'binB', e.target.value)}
                        /></>
                      </td>
                      <td className="py-2 px-2">
                        <><label htmlFor="a11y-input-37" className="sr-only">Input</label>
<input id="a11y-input-37" type="number" inputMode="decimal"
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-[var(--accent-vibrant)] outline-none min-h-[44px] text-base font-normal rounded-full"
                          value={row.binC}
                          onChange={(e) => handleBinDataChange(idx, 'binC', e.target.value)}
                        /></>
                      </td>
                      <td className="py-2 px-2">
                        <><label htmlFor="a11y-input-38" className="sr-only">Input</label>
<input id="a11y-input-38" type="number" inputMode="decimal"
                          className="w-full px-2 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-[var(--accent-vibrant)] outline-none min-h-[44px] text-base font-normal rounded-full"
                          value={row.binD}
                          onChange={(e) => handleBinDataChange(idx, 'binD', e.target.value)}
                        /></>
                      </td>
                      <td className="py-2 px-2 text-right">
                        {blend !== null ? (
                           <span className={`inline-block px-2 py-1 rounded text-base font-medium ${isPassing ? 'text-emerald-700 bg-emerald-100  ' : 'text-red-700 bg-red-100  '}`}>
                             {blend.toFixed(1)}%
                           </span>
                        ) : '-'}
                      </td>
                      <td className="py-2 px-2 text-sm font-medium text-slate-500 text-right whitespace-nowrap">
                        {row.minPassing} - {row.maxPassing}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Section: Sliders & Graph */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="bg-bg-card/80 backdrop-blur-md rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-slate-900 dark:text-white flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                <Calculator className="w-5 h-5 text-[var(--accent-vibrant)]" /> Trial Blending
              </h3>
              <div className="px-3 py-1 rounded bg-white text-base font-medium">
                Sum: {proportions.reduce((a,b) => a+b, 0).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700">{binNames[i]}</span>
                    <span className="font-mono font-bold text-[var(--accent-vibrant)]">{proportions[i].toFixed(1)}%</span>
                  </div>
                  <><label htmlFor="a11y-input-39" className="sr-only">Input</label>
<input id="a11y-input-39" 
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={proportions[i]}
                    onChange={(e) => handleProportionChange(i, e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[var(--accent-vibrant)]"
                  /></>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-[24px] bg-blue-50 border border-blue-200 text-sm text-orange-800 flex items-start gap-2 overflow-hidden">
               <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
               <p>Moving a slider will automatically adjust the remaining materials to ensure the blend always equals 100%.</p>
            </div>

            <button onClick={optimizeBlend}
                className="mt-6 w-full bg-[#FFFFFF] text-slate-900 py-3.5 rounded-full shadow-sm flex items-center justify-center gap-2 hover:bg-white transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 overflow-hidden"
            >
                <Wand2 className="w-5 h-5" /> Auto-Optimize Blend (Least Squares)
            </button>
          </div>

          <div className="bg-bg-card/80 backdrop-blur-md rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 h-[400px] flex flex-col overflow-hidden">
            <h3 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
              <LineChartIcon className="w-5 h-5 text-[var(--accent-vibrant)]" /> Blended Gradation Curve
            </h3>
            <div className="flex-1 w-full relative min-h-0">
               <AggregateChart data={chartData} />
            </div>
          </div>

        </div>
        
        <CalculationHistory
          calculatorId="aggregate_blending_v1"
          currentInputs={{ proportions, binNames, selectedCategory, selectedGrading }}
          onRestore={(ins) => {
            if (ins.proportions) setProportions(ins.proportions);
            if (ins.binNames) setBinNames(ins.binNames);
            if (ins.selectedCategory) setSelectedCategory(ins.selectedCategory);
            if (ins.selectedGrading) setSelectedGrading(ins.selectedGrading);
          }}
        />

      </div>
    </div>
  );
}
