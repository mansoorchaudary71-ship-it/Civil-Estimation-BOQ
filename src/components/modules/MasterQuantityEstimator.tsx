import { Button } from '../ui/Button';
import React, { useState, useEffect } from "react";
import { useAutoSave } from "../../hooks/useAutoSave";
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
  Search,
  ChevronDown
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
import { ToolLayout, ToolLayoutInputs, ToolLayoutResults, ToolSection } from "../ui/ToolLayout";
import { NumberInput } from "../ui/NumberInput";

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

  useAutoSave('master-quantity', 
    { activeCalc, calcInputs, sharedState }, 
    { activeCalc: setActiveCalc, calcInputs: setCalcInputs, sharedState: setSharedState }
  );

  const handleInputChange = (calcId: string, inputId: string, value: number | "") => {
    setCalcInputs(prev => ({
      ...prev,
      [calcId]: {
        ...prev[calcId],
        [inputId]: value.toString()
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
    <div className="w-full">
      {!isEmbedded && (
        <SEO 
          title="Master Quantity Estimator" 
          description="Comprehensive construction quantity estimator. Unified state across models." 
          canonicalUrl="https://civilestimationpro.com/master-quantity" 
        />
      )}
      
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* Tool Selector Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary group-focus-within:text-accent-800 transition-colors" />
            <input 
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-default dark:bg-ink border border-border-color dark:border-ink-600 pl-11 pr-4 py-3.5 rounded-2xl shadow-brand-sm focus:ring-4 focus:ring-accent-500/10 focus:border-ink transition-all font-medium outline-none placeholder:text-txt-tertiary"
            />
          </div>

          <div className="lg:h-[600px] lg:overflow-y-auto pr-1 space-y-3 hide-scrollbar">
            {groups.map((group) => {
              const groupTools = calculatorsList.filter(
                (c) => c.group === group && c.label.toLowerCase().includes(searchTerm.toLowerCase())
              );
              if (groupTools.length === 0) return null;
              
              const isExpanded = expandedGroup === group || searchTerm !== "";
              return (
                <div key={group} className="bg-surface-default/50 dark:bg-ink/30 rounded-2xl border border-border-color dark:border-ink/50 overflow-hidden">
                  <Button
                    onClick={() => setExpandedGroup(isExpanded && searchTerm === "" ? null : group)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-default dark:hover:bg-ink transition-all group/group-btn"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-txt-secondary dark:text-txt-tertiary">{group}</span>
                    <ChevronDown className={`w-4 h-4 text-txt-tertiary group-hover:text-accent-800 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                  {isExpanded && (
                    <div className="p-2 pt-0 space-y-1">
                      {groupTools.map((calc) => {
                        const Icon = calc.icon;
                        const isActive = activeCalc === calc.id;
                        return (
                          <Button
                            key={calc.id}
                            onClick={() => setActiveCalc(calc.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                              isActive 
                              ? 'bg-ink text-white shadow-brand-lg shadow-accent-500/25 font-bold' 
                              : 'text-txt-secondary dark:text-txt-tertiary hover:bg-surface-default dark:hover:bg-ink/80 font-bold'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-txt-tertiary group-hover:text-accent-800"}`} />
                            <span className="text-sm truncate">{calc.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tool Content using ToolLayout Standard */}
        <div className="flex-1">
          <ToolLayout>
            {activeCalculator ? (
              <>
                {/* <!-- Tool Parameter Section --> */}
                <ToolLayoutInputs>
                  <ToolSection title="Input Parameters" color="indigo" number="01">
                    <div className="space-y-6">
                      {activeCalculator.inputs.length === 0 ? (
                        <div className="text-sm text-txt-tertiary p-6 bg-surface-hover/50 dark:bg-ink/30 rounded-2xl border border-border-color dark:border-ink-600/50 italic">
                          This module calculates automatically using shared data from preceding stages.
                        </div>
                      ) : (
                        activeCalculator.inputs.map(inp => (
                          <NumberInput
                            key={inp.id}
                            label={inp.label}
                            unit={inp.unit === 'L' ? unitL : inp.unit === 'A' ? unitA : inp.unit === 'V' ? unitV : inp.unit}
                            value={calcInputs[activeCalc]?.[inp.id] ?? ""}
                            onChange={(val) => handleInputChange(activeCalc, inp.id, val)}
                          />
                        ))
                      )}

                      {activeCalculator.sharedDependencies && activeCalculator.sharedDependencies.length > 0 && (
                         <div className="pt-6 border-t border-border-color dark:border-ink/50 mt-4">
                           <p className="text-xs font-black uppercase tracking-[0.2em] text-txt-secondary dark:text-txt-tertiary mb-4 ml-1">Linked State Inputs</p>
                           <div className="bg-surface-hover/50 dark:bg-ink/30 rounded-2xl border border-border-color dark:border-ink/50 overflow-hidden">
                             {activeCalculator.sharedDependencies.map((dep, idx) => (
                               <div key={dep} className={`flex justify-between items-center px-4 py-3.5 ${idx !== 0 ? 'border-t border-border-color dark:border-ink/30' : ''}`}>
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ink/80 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                    <span className="font-mono text-xs font-black text-txt-primary dark:text-txt-primary uppercase tracking-wider">{dep}</span>
                                  </div>
                                  <span className="font-black text-sm tracking-tight text-accent-800 dark:text-accent-400">{(sharedState[dep] || 0).toFixed(2)}</span>
                               </div>
                             ))}
                           </div>
                         </div>
                      )}
                    </div>
                  </ToolSection>
                </ToolLayoutInputs>

                {/* <!-- Tool Results Section --> */}
                <ToolLayoutResults>
                  <ToolSection title="Estimate Results" color="emerald" number="02">
                    <MaterialSummary
                      title={activeCalculator.label}
                      totalLabel="Status"
                      totalValue="Complete"
                      totalUnit=""
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
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
                  </ToolSection>
                </ToolLayoutResults>
              </>
            ) : (
              <div className="lg:col-span-12 p-20 text-center text-txt-tertiary font-medium italic">
                Select a tool from the sidebar to begin.
              </div>
            )}
          </ToolLayout>
        </div>
      </div>
    </div>
  );
}

