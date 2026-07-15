import React, { useState, useEffect } from "react";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import {
  Calculator,
  Box,
  Layers,
  Columns,
  PaintBucket,
  Truck,
  ArrowRightLeft,
  Ruler,
  Square,
  Container,
  ClipboardList,
  Pickaxe,
  Map,
  Waves,
  Droplet,
  Zap,
  Maximize2,
  Shovel,
  Link as LinkIcon,
} from "lucide-react";

import { saveEstimate } from "../../lib/estimates";
import { useAuth } from "../../contexts/AuthContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { StyledChart } from "../ui/EstimateVisualizer";
import Brickwork9InchModule from "./Brickwork9InchModule";
import CountertopModule from "./CountertopModule";
import { SEO } from "../SEO";
import { useSettings } from "../../context/SettingsContext";

import { calculatorsList, CalcItem } from "../../lib/masterCalculators";

export default function MasterQuantityEstimator({
  isEmbedded = false,
}: {
  isEmbedded?: boolean;
}) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const isSI = settings.measurement === "SI";
  const unitL = isSI ? "m" : "ft";
  const unitA = isSI ? "m²" : "sq.ft";
  const unitV = isSI ? "m³" : "cu.ft";

  const [activeCalc, setActiveCalc] = useState<string>("excavation");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Earthworks");
  
  // State Engine: Dict of standard inputs per calculator
  const [calcInputs, setCalcInputs] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    calculatorsList.forEach(c => {
      init[c.id] = {};
      c.inputs.forEach(inp => {
        init[c.id][inp.id] = inp.defaultVal;
      });
    });
    return init;
  });

  // State Engine: Shared Variables (Outputs that feed into other calculators)
  const [sharedState, setSharedState] = useState<Record<string, number>>({});

  const handleInputChange = (calcId: string, inputId: string, value: string) => {
    setCalcInputs(prev => ({
      ...prev,
      [calcId]: {
        ...prev[calcId],
        [inputId]: value
      }
    }));
  };

  const activeCalculator = calculatorsList.find(c => c.id === activeCalc);

  // Compute Active Results
  let parsedInputs: Record<string, number> = {};
  let currentResults: Record<string, string | number> = {};
  
  if (activeCalculator) {
    const rawInputs = calcInputs[activeCalc] || {};
    Object.keys(rawInputs).forEach(k => {
      parsedInputs[k] = isNaN(parseFloat(rawInputs[k])) ? 0 : parseFloat(rawInputs[k]);
    });
    
    const computed = activeCalculator.compute(parsedInputs, sharedState, isSI);
    currentResults = computed.results;
    
    // Automatically update shared state if this calculator produces shared outputs
    // We use a useEffect-like approach but inside the event handler to avoid loops.
    // Actually, setting state during render is bad, we should trigger it via a button or hook.
  }
  
  // Run computations independently for shared states
  useEffect(() => {
    let newShared = { ...sharedState };
    let changed = false;
    
    // Re-run all calculators to gather their shared outputs
    calculatorsList.forEach(calc => {
      const raw = calcInputs[calc.id] || {};
      const parsed: Record<string, number> = {};
      Object.keys(raw).forEach(k => {
        parsed[k] = isNaN(parseFloat(raw[k])) ? 0 : parseFloat(raw[k]);
      });
      
      const computed = calc.compute(parsed, newShared, isSI);
      if (computed.sharedOutputs) {
        Object.entries(computed.sharedOutputs).forEach(([k, v]) => {
          if (newShared[k] !== v) {
            newShared[k] = v;
            changed = true;
          }
        });
      }
    });
    
    if (changed) {
      setSharedState(newShared);
    }
  }, [calcInputs, isSI]);

  const groups = Array.from(new Set(calculatorsList.map((c) => c.group)));

  return (
    <div
      className={
        isEmbedded
          ? "w-full"
          : "w-full h-full bg-transparent text-slate-900 dark:text-white p-6 md:p-8"
      }
    >
      {!isEmbedded && (
        <SEO 
          title="Master Quantity Estimator" 
          description="Comprehensive construction quantity estimator. Unified state across models." 
          canonicalUrl="https://civilestimationpro.com/master-quantity" 
        />
      )}
      <div className={isEmbedded ? "w-full" : "max-w-7xl mx-auto"}>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tool Selection Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="relative">
              <><label htmlFor="a11y-input-329" className="sr-only">Search tools...</label>
<input id="a11y-input-329"
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 font-medium outline-none placeholder:text-slate-500 overflow-hidden"
              /></>
            </div>

            <div className="xl:h-[600px] xl:overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {groups.map((group) => {
                const groupTools = calculatorsList.filter(
                  (c) => c.group === group && c.label.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (groupTools.length === 0) return null;
                
                const isExpanded = expandedGroup === group || searchTerm !== "";
                return (
                  <div key={group} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.02)]">
                    <button
                      onClick={() => setExpandedGroup(isExpanded && searchTerm === "" ? null : group)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                    >
                      <span className="uppercase text-[11px] tracking-widest">{group}</span>
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="grid grid-cols-1 gap-1 p-2 border-t border-slate-100 dark:border-slate-700/50">
                        {groupTools.map((calc) => {
                          const Icon = calc.icon;
                          const isActive = activeCalc === calc.id;
                          return (
                            <button
                              key={calc.id}
                              onClick={() => setActiveCalc(calc.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] transition-all text-left ${
                                isActive 
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
                              }`}
                            >
                              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                              <span className="text-sm truncate rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">{calc.label}</span>
                              {calc.sharedDependencies && calc.sharedDependencies.length > 0 && (
                                <span title="Uses Shared Data" className="ml-auto flex items-center">
                                  <LinkIcon className="w-3 h-3 text-amber-500 opacity-60" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Calculator Content */}
          <div className="flex-1">
            {activeCalculator ? (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                 <div className="w-full lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] px-6 py-6 shadow-[0_4px_24px_rgba(15,23,42,0.02)] overflow-hidden">
                   <h3 className="font-bold mb-6 text-base text-slate-800 dark:text-white flex items-center justify-between">
                     <span>Input Parameters</span>
                     {activeCalculator.sharedDependencies && activeCalculator.sharedDependencies.length > 0 && (
                        <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          <LinkIcon className="w-3 h-3" /> Linked Data
                        </span>
                     )}
                   </h3>
                   <div className="space-y-5">
                      {activeCalculator.inputs.length === 0 ? (
                        <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-[16px]">
                          This module calculates automatically using shared data from preceding stages. Navigate through the other tabs to set values.
                        </div>
                      ) : (
                        activeCalculator.inputs.map(inp => {
                          const val = calcInputs[activeCalc]?.[inp.id] ?? "";
                          return (
                             <div key={inp.id}>
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                 {inp.label} {inp.unit && `(${inp.unit === 'L' ? unitL : inp.unit === 'A' ? unitA : inp.unit === 'V' ? unitV : inp.unit})`}
                               </label>
                               <><label htmlFor="a11y-input-330" className="sr-only">Input</label>
<input id="a11y-input-330"
                                 type="text"
                                 value={val}
                                 onChange={(e) => handleInputChange(activeCalc, inp.id, e.target.value)}
                                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 rounded-full mt-1.5 font-bold text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none transition-all"
                               /></>
                             </div>
                          );
                        })
                      )}
                      
                      {activeCalculator.sharedDependencies && activeCalculator.sharedDependencies.length > 0 && (
                         <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 mt-4">
                           <p className="text-base font-medium uppercase tracking-wider mb-3 ml-1">Linked State Inputs</p>
                           <div className="bg-slate-50/70 p-1 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-[20px] overflow-hidden shadow-sm">
                             {activeCalculator.sharedDependencies.map((dep, idx) => (
                               <div key={dep} className={`flex justify-between items-center px-4 py-3.5 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50 ${idx !== 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                    <span className="font-mono text-[13px] font-medium text-slate-600 dark:text-slate-400">{dep}</span>
                                  </div>
                                  <span className="font-bold text-[14px] tracking-tight text-indigo-700 dark:text-indigo-400">{(sharedState[dep] || 0).toFixed(2)}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                      )}
                   </div>
                 </div>
                 
                 <div className="lg:col-span-8 flex flex-col h-full space-y-4">
                    <MaterialSummary
                      title={activeCalculator.label}
                      totalLabel="Calculation Ready"
                      totalValue=""
                      totalUnit=""
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {Object.entries(currentResults).map(([key, val]) => (
                          <ResultCard
                            key={key}
                            title={key}
                            value={val}
                            variant="neutral"
                          />
                        ))}
                      </div>
                    </MaterialSummary>
                 </div>
               </div>
            ) : (
               <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
