import { Button } from '../ui/Button';
import React, { useState } from "react";
import { useAutoSave } from "../../hooks/useAutoSave";
import { Grid2X2, Settings2, Replace, ArrowUp, AlertTriangle } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { StyledChart } from "../ui/EstimateVisualizer";
import { ResultCard } from "../ui/ResultCard";
import { SmartSuggestionBadge } from "../ui/SmartSuggestionBadge";
import { MaterialSummary } from "../ui/MaterialSummary";
import { useGlobalSettings } from "../../context/SettingsContext";
import { useRates } from "../../lib/useRates";
import { calcSlab, calcRccMaterials } from "../../lib/rccCalc";

import { FieldTooltip } from "../ui/FieldTooltip";
import { NumberInput } from "../ui/NumberInput";
import { ToolGuidedTour, TourStep } from "../ui/ToolGuidedTour";
import { CodeTooltip } from "../ui/CodeTooltip";


const SLAB_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '#tour-slab-type',
    title: 'Slab Type',
    content: 'Toggle between One-Way and Two-Way slab calculations. This affects the reinforcement distribution formulas.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-slab-dimensions',
    title: 'Slab Dimensions',
    content: 'Enter the long span (ly) and short span (lx) of your slab in meters.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-slab-thickness',
    title: 'Slab Thickness',
    content: 'Enter the slab thickness in millimeters. This is used to compute the total concrete volume.',
    placement: 'bottom'
  }
];

export default function SlabEstimator() {
  const { formatCurrency, currentCurrency } = useGlobalSettings();
  const { rates: tableRates } = useRates();
  const [slabType, setSlabType] = useState<"one-way" | "two-way">("two-way");
  const [isPrecast, setIsPrecast] = useState(false);
  const [concreteDensity, setConcreteDensity] = useState("2400");
  const [riggingRadius, setRiggingRadius] = useState("5");
  const [wastage, setWastage] = useState("5");
  const [errors, setErrors] = useState<string[]>([]);
  
  const [ly, setLy] = useState("5"); // Long Span (meters)
  const [lx, setLx] = useState("4"); // Short Span (meters)
  const [thickness, setThickness] = useState("150"); // mm
  const [clearCover, setClearCover] = useState("20"); // mm
  
  const [mainDia, setMainDia] = useState("12"); // mm (Short Span/Main)
  const [distDia, setDistDia] = useState("10"); // mm (Long Span/Distribution)
  const [mainSpacing, setMainSpacing] = useState("150"); // mm
  const [distSpacing, setDistSpacing] = useState("150"); // mm

  useAutoSave('slab-estimator',
    { slabType, isPrecast, concreteDensity, riggingRadius, wastage, ly, lx, thickness, clearCover, mainDia, distDia, mainSpacing, distSpacing },
    {
      slabType: setSlabType,
      isPrecast: setIsPrecast,
      concreteDensity: setConcreteDensity,
      riggingRadius: setRiggingRadius,
      wastage: setWastage,
      ly: setLy,
      lx: setLx,
      thickness: setThickness,
      clearCover: setClearCover,
      mainDia: setMainDia,
      distDia: setDistDia,
      mainSpacing: setMainSpacing,
      distSpacing: setDistSpacing
    }
  );

  const [results, setResults] = useState<{
    type: "one-way" | "two-way";
    concreteVolumeWet: number;
    concreteVolumeDry: number;
    shortBarsCount: number;
    shortBarsTotalLength: number;
    longBarsCount: number;
    longBarsTotalLength: number;
    totalSteelWeight: number;
    totalSteelWeightWithWastage: number;
    elementWeightKg: number;
    craneCapacityTonnes: number;
    loadMomentTm: number;
    lyLxRatio: number;
    oneWayWarning: boolean;
    cementBagsOrder: number;
    sandM3: number;
    aggregateM3: number;
    waterLiters: number;
    steelCost: number | null;
    concreteCost: number | null;
  } | null>(null);

  // Shared engine (src/lib/rccCalc.ts) — the crank, crane and bar-count
  // maths live there, not in this component, so MasterRccCore and this
  // tool can never diverge again.
  const calculateSlab = () => {
    const l_y = parseFloat(ly);
    const l_x = parseFloat(lx);
    const t = parseFloat(thickness);
    const ds = parseFloat(mainDia);
    const dl = parseFloat(distDia);
    const ss = parseFloat(mainSpacing);
    const sl = parseFloat(distSpacing);
    const c = parseFloat(clearCover);
    const density = parseFloat(concreteDensity) || 2400;
    const radius = parseFloat(riggingRadius) || 5;
    const waste = parseFloat(wastage) || 0;

    const r = calcSlab({
      slabType,
      lyM: l_y,
      lxM: l_x,
      thicknessMm: t,
      coverMm: c,
      mainDiaMm: ds,
      distDiaMm: dl,
      mainSpacingMm: ss,
      distSpacingMm: sl,
      densityKgM3: density,
      riggingRadiusM: radius,
      wastagePct: waste,
    });
    // calcSlab returns NaN-heavy output on garbage input; surface the
    // field-level errors instead of silently keeping stale results.
    if (r.errors.length > 0 || !(l_y > 0) || !(l_x > 0) || !(t > 0)) {
      setErrors(r.errors.length > 0 ? r.errors : ["Long span, short span and thickness must all be greater than 0."]);
      setResults(null);
      return;
    }
    setErrors([]);

    // Material split (nominal M20 1:1.5:3 — for M25+ use /mix-design).
    const mat = calcRccMaterials(r.wetVolumeM3, "M20", waste);
    const steelRate = tableRates.steelPerKg;
    const cementRate = tableRates.cementPerBag;
    setResults({
      type: slabType,
      concreteVolumeWet: r.wetVolumeM3,
      concreteVolumeDry: r.dryVolumeM3,
      shortBarsCount: r.shortBarsCount,
      shortBarsTotalLength: r.shortBarsTotalLengthM,
      longBarsCount: r.longBarsCount,
      longBarsTotalLength: r.longBarsTotalLengthM,
      totalSteelWeight: r.totalSteelKg,
      totalSteelWeightWithWastage: r.totalSteelKgWithWastage,
      elementWeightKg: r.elementWeightKg,
      // Capacity = weight x 1.5 / 1000 (10.80 t for the defaults).
      // Load moment = capacity x radius (54.0 t·m) — a SEPARATE number,
      // not the capacity. The old code showed 54.0 as the capacity.
      craneCapacityTonnes: r.craneCapacityT,
      loadMomentTm: r.loadMomentTm,
      lyLxRatio: r.lyLxRatio,
      oneWayWarning: r.oneWayWarning,
      cementBagsOrder: mat.cementBagsOrder,
      sandM3: mat.sandM3,
      aggregateM3: mat.aggregateM3,
      waterLiters: mat.waterLiters,
      steelCost: steelRate != null ? r.totalSteelKgWithWastage * steelRate : null,
      concreteCost: cementRate != null ? mat.cementBagsOrder * cementRate : null,
    });
  };

  const loadExample = () => {
    setSlabType("two-way");
    setIsPrecast(false);
    setLy("5");
    setLx("4");
    setThickness("150");
    setClearCover("20");
    setMainDia("12");
    setDistDia("10");
    setMainSpacing("150");
    setDistSpacing("150");
  };

  const resetDefault = () => {
    if (!window.confirm("Are you sure you want to reset all inputs? This action cannot be undone.")) return;
    setLy("");
    setLx("");
    setThickness("");
    setClearCover("");
    setMainDia("12");
    setDistDia("12");
    setMainSpacing("150");
    setDistSpacing("150");
    setResults(null);
  };

  const sendToBOQ = () => {
    if (!results) return;
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `RCC Slab ${isPrecast ? '(Precast)' : ''} (Thickness: ${thickness}mm)`,
        unit: "m³",
        quantity: results.concreteVolumeWet,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "05 - Metals",
        description: `Steel Reinforcement for Slab`,
        unit: "kg",
        quantity: results.totalSteelWeight,
        rate: 0
      }
    ];
    window.dispatchEvent(new CustomEvent('fill-boq', { detail: items }));
    alert("Sent to BOQ Generator!");
  };

  return (
    <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 px-4 md:px-0">
      <ToolGuidedTour steps={SLAB_TOUR_STEPS} tourId="slab-estimator" />
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        
        <div className="flex gap-2">
          {results && (
            <Button onClick={sendToBOQ} className="text-xs font-bold px-3 py-2 bg-ui-success text-ui-successText rounded-full hover:bg-ui-success transition-colors border border-ui-successBorder active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
              Send to BOQ
            </Button>
          )}
          <Button onClick={loadExample} className="text-xs font-bold px-3 py-2 bg-accent-50 text-accent-800 rounded-full hover:bg-accent-100 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
            Load Example
          </Button>
          <Button onClick={resetDefault} className="text-xs font-bold px-3 py-2 bg-surface-hover text-txt-tertiary rounded-full hover:bg-surface-active transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 responsive-tool-grid">
        <div className="w-full bg-surface-default rounded-2xl shadow-brand-sm border border-ui-borderSubtle p-4 sm:p-6 md:p-4 sm:p-8 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div id="tour-slab-type" className="p-1 bg-surface-hover rounded-2xl flex gap-1 w-full sm:w-auto flex-1 overflow-hidden">
              <Button
                onClick={() => setSlabType("one-way")}
                className={`flex-1 py-2 px-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${slabType === "one-way" ? "bg-surface-default shadow-brand-sm text-accent-800" : "text-txt-tertiary hover:text-txt-secondary hover:bg-surface-active/50"}`}
              >
                One-Way Slab
              </Button>
              <Button
                onClick={() => setSlabType("two-way")}
                className={`flex-1 py-2 px-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${slabType === "two-way" ? "bg-surface-default shadow-brand-sm text-accent-800" : "text-txt-tertiary hover:text-txt-secondary hover:bg-surface-active/50"}`}
              >
                Two-Way Slab
              </Button>
            </div>
            
            <div className="flex items-center gap-3 bg-surface-hover rounded-full border border-ui-borderSubtle shadow-brand-sm text-txt-primary p-2 rounded-full border border-ui-borderSubtle w-full sm:w-auto min-w-max transition-all duration-300 active:scale-95 hover:-translate-y-0.5">
               <span className="text-sm font-bold text-txt-secondary">Precast Mode</span>
               <Button 
                onClick={() => setIsPrecast(!isPrecast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPrecast ? 'bg-ink' : 'bg-secondary-300 '}`}
               >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-surface-default transition-transform ${isPrecast ? 'translate-x-6' : 'translate-x-1'}`} />
               </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
            <Settings2 className="w-5 h-5 text-accent-800" />
            <h2 className="text-lg font-bold text-txt-primary">Slab Dimensions</h2>
          </div>

          <div className="space-y-4">
            <div id="tour-slab-dimensions" className="grid grid-cols-2 gap-4">
              <InputGroup label="Long Span (ly) (m)">
                <NumberInput 
                  value={ly} 
                  onChange={(v) => setLy(v.toString())} 
                  unit="m" 
                  className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden" 
                />
              </InputGroup>
              <InputGroup label="Short Span (lx) (m)">
                <NumberInput 
                  value={lx} 
                  onChange={(v) => setLx(v.toString())} 
                  unit="m" 
                  className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden" 
                />
              </InputGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Thickness (mm)">
                <div id="tour-slab-thickness">
                  <NumberInput 
                    value={thickness} 
                    onChange={(v) => setThickness(v.toString())} 
                    unit="mm" 
                    className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden" 
                  />
                </div>
              </InputGroup>
              <InputGroup label={
                <span className="flex items-center">
                  Clear Cover (mm)
                  <FieldTooltip content="Minimum concrete cover to protect reinforcement from corrosion. IS 456:2000 Table 16: Mild exposure = 20mm, Moderate = 30mm, Severe = 45mm, Very Severe = 50mm" />
                </span>
              }>
                <NumberInput 
                  value={clearCover} 
                  onChange={(v) => setClearCover(v.toString())} 
                  unit="mm" 
                  className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden" 
                />
              </InputGroup>
            </div>

            {errors.length > 0 && (
              <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4" role="alert">
                <p className="font-bold text-ui-errorText">Check your inputs</p>
                <ul className="list-disc pl-5 mt-2 text-sm text-ui-errorText space-y-1">
                  {errors.map((e, i) => (<li key={i}>{e}</li>))}
                </ul>
              </div>
            )}

            {results?.oneWayWarning && (
              <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4">
                <p className="text-sm text-accent-800">ly/lx = {results.lyLxRatio.toFixed(2)} — above 2, so this slab behaves as a one-way slab. Switch the type to One-Way, or shorten the long span.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Wastage % (0–15)">
                <NumberInput
                  value={wastage}
                  onChange={(v) => setWastage(v.toString())}
                  unit="%"
                  className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden"
                />
              </InputGroup>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-txt-secondary">Material split</label>
                <p className="text-xs text-txt-tertiary leading-relaxed">Nominal M20 (1:1.5:3) with {wastage}% wastage. For M25+ use the <a href="/mix-design" className="text-accent-800 underline">mix-design calculator</a>.</p>
              </div>
            </div>

            {isPrecast && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ui-success/50 p-4 rounded-2xl border border-ui-successBorder mt-4 overflow-hidden">
                <InputGroup label="Concrete Density (kg/m³)">
                  <NumberInput 
                    value={concreteDensity} 
                    onChange={(v) => setConcreteDensity(v.toString())} 
                    unit="kg/m³"
                    className="w-full bg-surface-default rounded-2xl border shadow-brand-sm text-txt-primary border-ui-successBorder overflow-hidden" 
                  />
                </InputGroup>
                <InputGroup label="Lifting Radius (m)">
                  <NumberInput 
                    value={riggingRadius} 
                    onChange={(v) => setRiggingRadius(v.toString())} 
                    unit="m"
                    className="w-full bg-surface-default rounded-2xl border shadow-brand-sm text-txt-primary border-ui-successBorder overflow-hidden" 
                  />
                </InputGroup>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6 mt-8">
            <Grid2X2 className="w-5 h-5 text-accent-800" />
            <h2 className="text-lg font-bold text-txt-primary">Reinforcement Details</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-surface-hover rounded-2xl border border-border-color overflow-hidden">
              <h3 className="text-sm font-bold text-txt-secondary uppercase tracking-wider mb-3">
                {slabType === "one-way" ? "Main Bars (Short Span)" : "Short Span Bars (Main)"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label={<span className="flex items-center gap-1">Diameter (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                  <select
                    value={mainDia}
                    onChange={(e) => setMainDia(e.target.value)}
                    className="w-full h-11 bg-surface-default border border-ui-borderSubtle rounded-2xl px-4 text-txt-primary font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 outline-none transition-all overflow-hidden"
                  >
                    {[8, 10, 12, 16, 20, 25].map(d => (
                      <option key={d} value={d}>{d} mm</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label={<span className="flex items-center gap-1">Spacing (c/c) (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span>}>
                  <NumberInput 
                    value={mainSpacing} 
                    onChange={(v) => setMainSpacing(v.toString())} 
                    unit="mm" 
                    className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden" 
                  />
                </InputGroup>
              </div>
            </div>

            <div className="p-4 bg-surface-hover rounded-2xl border border-border-color overflow-hidden">
              <h3 className="text-sm font-bold text-txt-secondary uppercase tracking-wider mb-3">
                {slabType === "one-way" ? "Distribution Bars (Long Span)" : "Long Span Bars"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label={<span className="flex items-center gap-1">Diameter (mm) <CodeTooltip standard="IS" code="1786:2008" description="Standard diameters for high strength deformed steel bars." /></span>}>
                  <select
                    value={distDia}
                    onChange={(e) => setDistDia(e.target.value)}
                    className="w-full h-11 bg-surface-default border border-ui-borderSubtle rounded-2xl px-4 text-txt-primary font-bold focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 outline-none transition-all overflow-hidden"
                  >
                    {[8, 10, 12, 16, 20, 25].map(d => (
                      <option key={d} value={d}>{d} mm</option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label={<span className="flex items-center gap-1">Spacing (c/c) (mm) <CodeTooltip standard="IS" code="456:2000" description="Maximum spacing of shear reinforcement in beams and columns." /></span>}>
                  <NumberInput 
                    value={distSpacing} 
                    onChange={(v) => setDistSpacing(v.toString())} 
                    unit="mm" 
                    className="w-full bg-surface-hover border border-ui-borderSubtle rounded-2xl shadow-brand-sm transition-all text-txt-primary overflow-hidden" 
                  />
                </InputGroup>
              </div>
            </div>
          </div>

          <Button onClick={calculateSlab}
            className="w-full mt-6 bg-ink hover:bg-ink-700 text-white font-bold py-4 rounded-full transition-colors mt-8 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
          >
            Calculate Slab Quantities
          </Button>
        </div>

        <div className="flex-1 flex flex-col">
          {results ? (
            <div className="flex flex-col h-full w-full">
              {isPrecast && (
                <div className="mb-6 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-ui-success to-ui-success border border-ui-successBorder shadow-brand-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                    <ArrowUp className="w-32 h-32 text-ui-successText" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-ui-successText mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Precast Safety & Lifting
                      </h4>
                      <p className="text-txt-secondary text-sm mb-4 leading-relaxed">
                        Based on {riggingRadius}m rig radius and 1.5x dynamic multi.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-default/60 p-4 rounded-2xl border border-ui-successBorder overflow-hidden">
                          <span className="text-xs sm:text-xs font-bold text-txt-tertiary uppercase tracking-wider block mb-1">Single Element Wt</span>
                          <span className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-txt-primary">{(results.elementWeightKg / 1000).toFixed(2)}<span className="text-sm font-medium ml-1 text-txt-tertiary">Tons</span></span>
                        </div>
                        <div className="w-full bg-surface-default/80 p-4 rounded-2xl border border-ui-successBorder shadow-brand-sm overflow-hidden">
                          <span className="text-xs sm:text-xs font-bold text-txt-tertiary uppercase tracking-wider block mb-1">Min. Crane Capacity</span>
                          <span className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-ui-successText">{results.craneCapacityTonnes.toFixed(2)}<span className="text-sm font-medium ml-1 text-ui-successText/80">Tons</span></span>
                        </div>
                        <div className="w-full bg-surface-default/60 p-4 rounded-2xl border border-ui-successBorder overflow-hidden col-span-2">
                          <span className="text-xs sm:text-xs font-bold text-txt-tertiary uppercase tracking-wider block mb-1">Load Moment (separate from capacity)</span>
                          <span className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-txt-primary">{results.loadMomentTm.toFixed(1)}<span className="text-sm font-medium ml-1 text-txt-tertiary">t·m</span></span>
                          <span className="block text-xs text-txt-tertiary mt-1">Capacity {results.craneCapacityTonnes.toFixed(2)} t × {riggingRadius} m radius. The old tool showed this 54.0 t·m figure as the crane capacity — it is the moment, not the capacity.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <MaterialSummary
                title="Material Summary"
              totalLabel="Total Concrete Dry Volume"
              totalValue={results.concreteVolumeDry.toFixed(2)}
              totalUnit="m³"
              subtitle={`Wet Volume: ${results.concreteVolumeWet.toFixed(2)} m³`}
              relatedToolIds={['concrete-mix', 'beam-calc']}
              onRecalculate={() => {}}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard
                  title="Total Steel Weight"
                  value={results.totalSteelWeight.toFixed(2)}
                  unit="kg"
                  variant="primary"
                  description={<div className="mt-2"><SmartSuggestionBadge label="Calculate Steel Weight" to="metal-weight" className="bg-accent-100" /></div>}
                  badge={results.type === "one-way" ? "One-Way Slab" : "Two-Way Slab"}
                />
                <ResultCard
                  title="Steel (with wastage)"
                  value={results.totalSteelWeightWithWastage.toFixed(2)}
                  unit="kg"
                  variant="neutral"
                  description={`Includes ${wastage}% wastage${results.steelCost != null ? ` · ${formatCurrency(results.steelCost, false)}` : ""}`}
                />
                <ResultCard
                  title={results.type === "one-way" ? "Main Bars" : "Short Span Bars"}
                  value={results.shortBarsCount}
                  unit="bars"
                  description={`${results.shortBarsTotalLength.toFixed(1)}m total length`}
                  variant="neutral"
                />
                <ResultCard
                  title={results.type === "one-way" ? "Dist Bars" : "Long Span Bars"}
                  value={results.longBarsCount}
                  unit="bars"
                  description={`${results.longBarsTotalLength.toFixed(1)}m total length`}
                  variant="neutral"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-ui-borderSubtle/50">
                <div className="mb-4 text-xs sm:text-xs font-bold tracking-tight text-txt-tertiary uppercase tracking-[0.15em]">
                  Material Split — M20 (1:1.5:3), {wastage}% wastage
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ResultCard title="Cement" value={String(results.cementBagsOrder)} unit="bags" variant="neutral" description={results.concreteCost != null ? formatCurrency(results.concreteCost, false) : "Rate not entered"} />
                  <ResultCard title="Sand" value={results.sandM3.toFixed(2)} unit="m³" variant="neutral" />
                  <ResultCard title="Aggregate" value={results.aggregateM3.toFixed(2)} unit="m³" variant="neutral" />
                  <ResultCard title="Water" value={results.waterLiters.toFixed(0)} unit="L" variant="neutral" description="From unrounded cement mass × w/c" />
                </div>
                <p className="text-xs text-txt-tertiary mt-3">Rates: PK defaults from the shared rate table ({currentCurrency}); IN/AE show “—” until you enter a rate. For M25 and above, use the <a href="/mix-design" className="text-accent-800 underline">mix-design calculator</a> — nominal mixes are only allowed up to M20.</p>
              </div>

              <div className="mt-8 pt-6 border-t border-ui-borderSubtle/50">
                <div className="mb-4 text-xs sm:text-xs font-bold tracking-tight text-txt-tertiary uppercase tracking-[0.15em]">
                  Rebar Breakdown
                </div>
                <div className="w-full bg-surface-default/50 rounded-2xl p-4 shadow-brand-sm text-txt-primary border border-ui-borderSubtle/50 backdrop-blur-md overflow-hidden">
                  <StyledChart 
                    data={[
                      { name: results.type === "one-way" ? "Main Bars" : "Short Span", value: Math.round(results.shortBarsTotalLength), fill: '#F2A413' },
                      { name: results.type === "one-way" ? "Dist Bars" : "Long Span", value: Math.round(results.longBarsTotalLength), fill: '#0F766E' }
                    ]}
                    type="bar"
                    title="Length Breakdown"
                    valueFormatter={(val) => `${val} m`}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-accent-500/10 border border-accent-500/20 rounded-2xl overflow-hidden">
                 <p className="text-xs flex gap-2">
                    <span className="text-accent-800 font-bold">ℹ</span>
                    <span className="text-txt-secondary leading-relaxed">
                      {results.type === "two-way"
                        ? "Cranked (bent-up) bars are every OTHER bar only, with a 0.42 × d allowance, where d = D − (cover + φ/2) is the effective depth — not the full thickness. The old version added 0.42 × (t − 2 × cover) to every bar and overstated the steel."
                        : "Main bars span across the shorter dimension (lx). Distribution bars span across the longer dimension (ly)."}
                    </span>
                 </p>
              </div>
            </MaterialSummary>
            </div>
          ) : (
            <div className="bg-surface-hover border border-ui-borderSubtle border-dashed rounded-2xl p-4 sm:p-6 lg:p-12 text-center flex items-center justify-center h-full shadow-brand-sm overflow-hidden">
              <span className="text-txt-tertiary font-medium tracking-wide">Enter dimensions to calculate</span>
            </div>
          )}
        </div>
      </div>
      
      <CalculationHistory
        calculatorId="slab_estimator"
        currentInputs={{ type: slabType, ly, lx, thickness, clearCover, mainDia, distDia, mainSpacing, distSpacing, wastage }}
        currentResults={results ? {
          "Concrete Dry Vol": `${results.concreteVolumeDry.toFixed(2)} m³`,
          "Total Steel Wt": `${results.totalSteelWeight.toFixed(2)} kg`
        } : undefined}
        onRestore={(inputs) => {
          setSlabType(inputs.type || "two-way");
          setLy(inputs.ly || "5");
          setLx(inputs.lx || "4");
          setThickness(inputs.thickness || "150");
          setClearCover(inputs.clearCover || "20");
          setMainDia(inputs.mainDia || "12");
          setDistDia(inputs.distDia || "10");
          setMainSpacing(inputs.mainSpacing || "150");
          setDistSpacing(inputs.distSpacing || "150");
          if (inputs.wastage) setWastage(inputs.wastage);
        }}
        estimationName="Slab"
      />
    </div>
  );
}

function InputGroup({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-txt-secondary">{label}</label>
      {children}
    </div>
  );
}
