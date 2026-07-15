import React, { useState } from "react";
import {
  Truck,
  Calculator,
  Ruler,
  Layers,
  DollarSign,
} from "lucide-react";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { FieldTooltip } from "../ui/FieldTooltip";
import { ToolGuidedTour, TourStep } from "../ui/ToolGuidedTour";

import { useSettings } from "../../context/SettingsContext";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { CalculationHistory } from "../ui/CalculationHistory";

const EARTHWORKS_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '#tour-earthworks-method',
    title: 'Calculation Method',
    content: 'Choose between the Prismoidal Formula (more accurate) or Average End Area method based on your project requirements.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-earthworks-length',
    title: 'Section Length',
    content: 'Define the total distance between the two end cross-sections.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-earthworks-areas',
    title: 'End Areas',
    content: 'Input the measured cross-sectional areas for both ends. If using Prismoidal, you can also define the middle area.',
    placement: 'bottom'
  }
];

export default function StandardEarthworks() {
  const { settings, formatCurrency, convertAmount, convertAmountToRaw } = useSettings();
  const isMetric = settings.measurement === "SI";
  const unitL = isMetric ? "m" : "ft";
  const unitA = isMetric ? "m²" : "ft²";
  const unitV = isMetric ? "m³" : "ft³";
  const [length, setLength] = useState<string>("100");
  const [area1, setArea1] = useState<string>("50");
  const [area2, setArea2] = useState<string>("40");
  const [areaM, setAreaM] = useState<string>("47");
  const [calcMethod, setCalcMethod] = useState<"prismoidal" | "averageEnd">("prismoidal");
  const [autoCalcAm, setAutoCalcAm] = useState<boolean>(false);
  const [bulkingFactor, setBulkingFactor] = useState<string>("15");
  const [shrinkageFactor, setShrinkageFactor] = useState<string>("10");
  const [truckCapacity, setTruckCapacity] = useState<string>("800");
  const [excavationRate, setExcavationRate] = useState<string>("150");
  const [compactionRate, setCompactionRate] = useState<string>("100");
  const [haulingRate, setHaulingRate] = useState<string>("500");
  
  const l = parseFloat(length) || 0;
  const a1 = parseFloat(area1) || 0;
  const a2 = parseFloat(area2) || 0;
  const inputAm = parseFloat(areaM) || 0;
  
  const am = calcMethod === "prismoidal" && autoCalcAm
      ? Math.pow((Math.sqrt(a1) + Math.sqrt(a2)) / 2, 2)
      : inputAm;
      
  const solidVolume = calcMethod === "averageEnd"
      ? l * ((a1 + a2) / 2)
      : (l / 6) * (a1 + 4 * am + a2);
      
  const bulkPct = parseFloat(bulkingFactor) || 0;
  const shrinkPct = parseFloat(shrinkageFactor) || 0;
  const tCap = parseFloat(truckCapacity) || 0;
  
  const looseVolume = solidVolume * (1 + bulkPct / 100);
  const compactedVolume = solidVolume * (1 - shrinkPct / 100);
  
  const truckTrips = tCap > 0 ? Math.ceil(looseVolume / tCap) : 0;
  
  const excRateParsed = convertAmountToRaw(parseFloat(excavationRate) || 0);
  const compRateParsed = convertAmountToRaw(parseFloat(compactionRate) || 0);
  const haulRateParsed = convertAmountToRaw(parseFloat(haulingRate) || 0);
  
  const totalCostRaw = solidVolume * excRateParsed + compactedVolume * compRateParsed + truckTrips * haulRateParsed;
  const totalCostConverted = convertAmount(totalCostRaw);

  return (
    <div className="w-full bg-transparent text-slate-900 font-sans">
      <ToolGuidedTour steps={EARTHWORKS_TOUR_STEPS} tourId="earthworks-base" />
      <div className="space-y-8 mt-4">
        <div className="mb-4">
           <h2 className="bg-gradient-to-r bg-clip-text text-transparent pb-1 text-xl font-semibold text-slate-900 tracking-tight mb-4">
             Standard Area/Depth Method
           </h2>
           <GlobalSettingsToggle align="left" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <section className="space-y-6">
            <div className="w-full bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                <div className="p-2.5 bg-blue-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <Ruler className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                  Volume Calculation
                </h2>
              </div>
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block uppercase tracking-wider mb-2 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Calculation Method
                  </label>
                  <div id="tour-earthworks-method" className="flex bg-gray-100/80 p-1 rounded-[24px] overflow-hidden">
                    <button
                      onClick={() => setCalcMethod("prismoidal")}
                      className={`flex-1 py-1.5 text-base font-medium rounded-[24px] transition-all ${calcMethod === "prismoidal" ? "bg-white shadow-[0_2px_10px_rgb(0,0,0,0.05)] text-indigo-600" : "text-slate-700  hover:text-slate-700"}`}
                    >
                      Prismoidal Formula
                    </button>
                    <button
                      onClick={() => setCalcMethod("averageEnd")}
                      className={`flex-1 py-1.5 text-base font-medium rounded-[24px] transition-all ${calcMethod === "averageEnd" ? "bg-white shadow-[0_2px_10px_rgb(0,0,0,0.05)] text-indigo-600" : "text-slate-700  hover:text-slate-700"}`}
                    >
                      Average End Area
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                    Length (L) [{unitL}]
                  </label>
                  <label htmlFor="tour-earthworks-length" className="sr-only">Input</label>
<input id="tour-earthworks-length"
                    type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 transition-shadow min-h-[44px] text-base font-normal"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder={`Enter length in ${unitL}...`}
                  />
                </div>
                <div id="tour-earthworks-areas" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                      End Area 1 (A₁) [{unitA}]
                    </label>
                    <><label htmlFor="a11y-input-217" className="sr-only">Input</label>
<input id="a11y-input-217" type="number" inputMode="decimal"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={area1}
                      onChange={(e) => setArea1(e.target.value)}
                    /></>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                      End Area 2 (A₂) [{unitA}]
                    </label>
                    <><label htmlFor="a11y-input-218" className="sr-only">Input</label>
<input id="a11y-input-218" type="number" inputMode="decimal"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={area2}
                      onChange={(e) => setArea2(e.target.value)}
                    /></>
                  </div>
                </div>
                {calcMethod === "prismoidal" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block uppercase tracking-wider ml-1 text-sm font-medium text-slate-700 mb-1">
                        Middle Area (Aₘ) [{unitA}]
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer pr-1 text-sm font-medium text-slate-700 mb-1 block">
                        <><label htmlFor="a11y-input-219" className="sr-only">Input</label>
<input id="a11y-input-219"
                          type="checkbox"
                          checked={autoCalcAm}
                          onChange={(e) => setAutoCalcAm(e.target.checked)}
                          className="w-3.5 h-3.5 text-indigo-600 rounded border-gray-300 focus:ring-blue-500"
                        /></>
                        <span className="text-sm font-medium text-slate-700">
                          Calculate Aₘ Automatically
                        </span>
                      </label>
                    </div>
                    {!autoCalcAm ? (
                      <><label htmlFor="a11y-input-220" className="sr-only">Input</label>
<input id="a11y-input-220" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 transition-shadow min-h-[44px] text-base font-normal"
                        value={areaM}
                        onChange={(e) => setAreaM(e.target.value)}
                      /></>
                    ) : (
                      <div className="w-full bg-gray-50 border border-gray-200 text-slate-700 rounded-[24px] px-4 py-3 cursor-not-allowed font-medium overflow-hidden">
                        {am.toFixed(2)}
                        <span className="text-slate-700 text-sm ml-1 font-normal">
                          (approximated)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <Truck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                  Factors & Hauling
                </h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5 ml-1 flex items-center text-sm font-medium text-slate-700 mb-1">
                      Swell Factor (%)
                      <FieldTooltip content="Volume increase when soil is excavated. Loose sandy soil = 10-15%, Clay = 20-30%, Rock = 25-50%" />
                    </label>
                    <><label htmlFor="a11y-input-221" className="sr-only">Input</label>
<input id="a11y-input-221" type="number" inputMode="decimal"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={bulkingFactor}
                      onChange={(e) => setBulkingFactor(e.target.value)}
                    /></>
                  </div>
                  <div>
                    <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                      Shrink Factor (%)
                    </label>
                    <><label htmlFor="a11y-input-222" className="sr-only">Input</label>
<input id="a11y-input-222" type="number" inputMode="decimal"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={shrinkageFactor}
                      onChange={(e) => setShrinkageFactor(e.target.value)}
                    /></>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Truck Capacity ({unitV})
                  </label>
                  <><label htmlFor="a11y-input-223" className="sr-only">Input</label>
<input id="a11y-input-223" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow min-h-[44px] text-base font-normal"
                    value={truckCapacity}
                    onChange={(e) => setTruckCapacity(e.target.value)}
                  /></>
                </div>
              </div>
            </div>
            {/* Cost Estimation */}
            <div className="w-full bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] mt-6 overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-[24px] overflow-hidden">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                  Cost Estimation
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Excavation Rate (per Bank {unitV})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">
                      {settings.currency}
                    </span>
                    <><label htmlFor="a11y-input-224" className="sr-only">Input</label>
<input id="a11y-input-224" type="number" inputMode="decimal"
                      min="0"
                      step="any"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={excavationRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val < 0) return;
                        setExcavationRate(e.target.value);
                      }}
                    /></>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Compaction Rate (per Compacted {unitV})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">
                      {settings.currency}
                    </span>
                    <><label htmlFor="a11y-input-225" className="sr-only">Input</label>
<input id="a11y-input-225" type="number" inputMode="decimal"
                      min="0"
                      step="any"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={compactionRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val < 0) return;
                        setCompactionRate(e.target.value);
                      }}
                    /></>
                  </div>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-slate-700 mb-1">
                    Hauling Rate (per Truck Trip)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">
                      {settings.currency}
                    </span>
                    <><label htmlFor="a11y-input-226" className="sr-only">Input</label>
<input id="a11y-input-226" type="number" inputMode="decimal"
                      min="0"
                      step="any"
                      className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 focus:border-emerald-500 transition-shadow min-h-[44px] text-base font-normal"
                      value={haulingRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val < 0) return;
                        setHaulingRate(e.target.value);
                      }}
                    /></>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Results Section */}
          <section className="space-y-6 flex-1 flex flex-col mt-6">
            <MaterialSummary
               title="Calculation Results"
               totalLabel="Total Project Cost"
               totalValue={formatCurrency(totalCostConverted)}
               totalUnit=""
               subtitle="Excavation + Compaction + Hauling"
             >
               {totalCostConverted === 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-[24px] mt-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚠</span>
                    <p className="text-amber-800 text-base font-normal text-slate-600 leading-relaxed">
                      Material rates not set. Fill in the rates above or go to Live DB Rates to set current market prices first.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('navigate-module', { detail: { moduleId: 'rates' } });
                      window.dispatchEvent(event);
                    }}
                    className="shrink-0 text-base font-medium px-4 py-2 bg-amber-600 hover:bg-amber-700 text-slate-900 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                  >
                    Set Live DB Rates
                  </button>
                </div>
               )}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                 <ResultCard
                   title="Solid Volume"
                   value={solidVolume.toFixed(2)}
                   unit={unitV}
                   description="Bank Measure"
                   variant="neutral"
                 />
                 <ResultCard
                   title="Loose Volume"
                   value={looseVolume.toFixed(2)}
                   unit={unitV}
                   description="Excavated Measure"
                   variant="neutral"
                 />
                 <ResultCard
                   title="Compacted Volume"
                   value={compactedVolume.toFixed(2)}
                   unit={unitV}
                   variant="neutral"
                 />
                 <ResultCard
                   title="Total Truck Trips"
                   value={truckTrips}
                   unit="trips"
                   description="Based on loose vol & capacity"
                   variant="neutral"
                 />
               </div>
             </MaterialSummary>
          </section>

        </div>
        {/* Analytics Table */}
        <div className="w-full bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gray-50 text-slate-600 rounded-[24px] overflow-hidden">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Earthwork Volume Data Table
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-base font-medium uppercase tracking-wider border-b border-gray-100">
                    Parameter
                  </th>
                  <th className="px-6 py-4 text-base font-medium uppercase tracking-wider border-b border-gray-100">
                    Value
                  </th>
                  <th className="px-6 py-4 text-base font-medium uppercase tracking-wider border-b border-gray-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium text-slate-700">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">Length</td>
                  <td className="px-6 py-4 font-mono text-indigo-600">
                    {l.toFixed(2)} {unitL}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    Distance between end sections
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">End Areas</td>
                  <td className="px-6 py-4 font-mono text-indigo-600">
                    {a1.toFixed(2)} / {a2.toFixed(2)} {unitA}
                  </td>
                  <td className="px-6 py-4 text-slate-700">A1 and A2</td>
                </tr>
                {calcMethod === "prismoidal" && (
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">Middle Area</td>
                    <td className="px-6 py-4 font-mono text-indigo-600">
                      {am.toFixed(2)} {unitA}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      Am (used in Prismoidal formula)
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 border-l-2 border-blue-500">
                    Solid Volume
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    {solidVolume.toFixed(2)} {unitV}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    Bank measure before swell
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 border-l-2 border-indigo-500">
                    Hauling Trips
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {truckTrips} trips
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    @ {tCap.toFixed(2)} {unitV} capacity
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <CalculationHistory
          calculatorId="earthworks_v1"
          estimationName="Earthworks Estimate"
          currentInputs={{ length, area1, area2, areaM, calcMethod, autoCalcAm, bulkingFactor, shrinkageFactor, truckCapacity, excavationRate, compactionRate, haulingRate }}
          currentResults={{ solidVolume: solidVolume.toFixed(2), looseVolume: looseVolume.toFixed(2), truckTrips, totalCost: totalCostConverted }}
          summaryGeneration={(inputs, res) => `Vol: ${res.solidVolume} ${unitV} - Cost: ${res.totalCost}`}
          onRestore={(inputs) => {
            setLength(inputs.length || "");
            setArea1(inputs.area1 || "");
            setArea2(inputs.area2 || "");
            setAreaM(inputs.areaM || "");
            setCalcMethod(inputs.calcMethod || "prismoidal");
            setAutoCalcAm(inputs.autoCalcAm || false);
            setBulkingFactor(inputs.bulkingFactor || "");
            setShrinkageFactor(inputs.shrinkageFactor || "");
            setTruckCapacity(inputs.truckCapacity || "");
            setExcavationRate(inputs.excavationRate || "");
            setCompactionRate(inputs.compactionRate || "");
            setHaulingRate(inputs.haulingRate || "");
          }}
        />
      </div>
    </div>
  );
}
