"use client";

import React, { useState, useEffect } from "react";
import { ToolGuidedTour, TourStep } from "./ui/ToolGuidedTour";

const STEEL_TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '#tour-steel-length',
    title: 'Total Length',
    content: 'Enter the total length of the rebar. The calculator will instantly determine the exact weight.',
    placement: 'bottom'
  },
  {
    targetSelector: '#tour-steel-unit',
    title: 'Unit Selection',
    content: 'Switch between Meters (metric) and Feet (imperial). The underlying engineering formula adapts automatically.',
    placement: 'bottom'
  }
];

interface InteractiveSteelCalculatorProps {
  initialDiameter: number;
  initialLength: number;
  isMetric: boolean;
  initialWeightKg: number;
}

export default function InteractiveSteelCalculator({
  initialDiameter,
  initialLength,
  isMetric,
  initialWeightKg,
}: InteractiveSteelCalculatorProps) {
  const [length, setLength] = useState<number | string>(initialLength);
  const [unit, setUnit] = useState<"m" | "ft">(isMetric ? "m" : "ft");
  const [weight, setWeight] = useState<number>(initialWeightKg);

  useEffect(() => {
    const l = typeof length === "string" ? parseFloat(length) : length;
    if (isNaN(l) || l <= 0) {
      setWeight(0);
      return;
    }

    let w = 0;
    if (unit === "m") {
      w = ((initialDiameter * initialDiameter) / 162.28) * l;
    } else {
      w = ((initialDiameter * initialDiameter) / 533) * l;
    }
    setWeight(parseFloat(w.toFixed(3)));
  }, [length, unit, initialDiameter]);

  return (
    <main className="w-full bg-white rounded-[24px] shadow-xl overflow-hidden border border-slate-200">
      <ToolGuidedTour steps={STEEL_TOUR_STEPS} tourId={`steel-calc-${initialDiameter}`} />
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Calculator Settings UI */}
        <div className="p-6 sm:p-10 lg:col-span-3 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="flex items-center mb-8 pb-4 border-b border-slate-100">
            <div className="bg-indigo-50 p-3 rounded-[16px] mr-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                Bar Specifications
              </h2>
              <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
                Configure diameter and length parameters
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-slate-700 mb-1 block">
                Diameter
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-slate-100 text-slate-600">
                  Fixed
                </span>
              </label>
              <div className="relative group">
                <><label htmlFor="a11y-input-6" className="sr-only">Input</label>
<input id="a11y-input-6" type="number" inputMode="decimal"
                  readOnly
                  value={initialDiameter}
                  className="block w-full rounded-full border-slate-200 bg-slate-50 dark:bg-slate-800 py-4 pl-5 pr-16 text-xl text-slate-700 shadow-sm border focus:ring-0 focus:border-slate-300 transition-colors cursor-default min-h-[44px] text-base font-normal"
                /></>
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <span className="text-slate-600 font-semibold text-lg">
                    mm
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-slate-700 mb-1 block">
                Total Length
              </label>
              <div className="w-full relative focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 rounded-[24px] shadow-sm border border-slate-300 bg-white overflow-hidden flex transition-all">
                <label htmlFor="tour-steel-length" className="sr-only">Input</label>
<input
                  id="tour-steel-length"
                  type="number" inputMode="decimal"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  min="0"
                  step="0.01"
                  className="block w-full border-none py-4 pl-5 pr-4 text-xl font-semibold text-slate-900 focus:ring-0 bg-transparent rounded-full"
                />
                <div className="flex items-center bg-slate-50 border-l border-slate-200 px-2">
                  <select
                    id="tour-steel-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as "m" | "ft")}
                    className="h-full border-none bg-transparent py-0 pl-3 pr-8 text-slate-700 font-bold focus:ring-0 sm:text-lg cursor-pointer"
                  >
                    <option value="m">Meters (m)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>
              </div>
              <p className="mt-2 flex items-center text-base font-normal text-slate-600 leading-relaxed">
                <svg
                  className="w-4 h-4 mr-1.5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Adjust length to recalculate the weight interactively.
              </p>
            </div>
          </div>
        </div>

        {/* Results UI */}
        <div className="relative p-6 sm:p-8 lg:col-span-2 bg-slate-50 overflow-hidden flex flex-col justify-center">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-600 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/50 border border-slate-200 text-base font-medium uppercase tracking-widest text-indigo-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
              Calculated Output
            </div>

            <div className="mb-2 text-slate-600 font-medium text-sm lg:text-base">
              Total Estimated Weight
            </div>
            <div className="flex items-baseline gap-2 mb-10 text-wrap break-all">
              <span className="text-2xl sm:text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-900">
                {weight}
              </span>
              <span className="text-xl font-semibold text-slate-600 whitespace-nowrap">kg</span>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 overflow-hidden">
              <h4 className="text-sm uppercase r mb-4 flex items-center text-lg font-medium text-slate-800">
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
                Engineering Formulas employed
              </h4>
              <div className="space-y-3">
                <div
                  className={`flex justify-between items-center pb-3 border-b border-slate-200 transition-opacity ${
                    unit === "m" ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span className="text-sm text-slate-700">
                    Metric (per meter)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-medium text-indigo-300 bg-indigo-100 px-2 py-0.5 rounded">
                    D² / 162.28 × L
                  </span>
                </div>
                <div
                  className={`flex justify-between items-center transition-opacity ${
                    unit === "ft" ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span className="text-sm text-slate-700">
                    Imperial (per foot)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-medium text-indigo-300 bg-indigo-100 px-2 py-0.5 rounded">
                    D² / 533 × L
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
