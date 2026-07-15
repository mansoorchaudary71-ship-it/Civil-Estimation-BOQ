import React, { useState, useEffect } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";

import { saveEstimate } from "../../lib/estimates";
import { useAuth } from "../../contexts/AuthContext";
import { Save } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import {
  CircleDashed,
  Square,
  ArrowDownRight,
  Droplets,
  Layers,
  Construction,
} from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
export interface ManholeResults {
  excavationVol: number;
  wallVol: number;
  baseVol: number;
  topSlabVol: number;
  totalWetConcrete: number;
  totalDryConcrete: number;
  materials: { cementBags: number; sandCft: number; aggCft: number };
  brickCount?: number;
}
interface ManholeModuleProps {
  onStateChange?: (results: ManholeResults) => void;
}
const mixRatios: Record<string, { c: number; s: number; a: number }> = {
  "M10 (1:3:6)": { c: 1, s: 3, a: 6 },
  "M15 (1:2:4)": { c: 1, s: 2, a: 4 },
  "M20 (1:1.5:3)": { c: 1, s: 1.5, a: 3 },
  "M25 (1:1:2)": { c: 1, s: 1, a: 2 },
};
export default function ManholeModule({ onStateChange }: ManholeModuleProps) {
  const [mhType, setMhType] = useState<"circular" | "rectangular">("circular");
  const [mhDepth, setMhDepth] = useState<string>("3");
  /* Used for circular diameter or rectangular length input */ const [
    mhInnerLen,
    setMhInnerLen,
  ] = useState<string>("1.2");
  /* Used only for rectangular width */ const [mhInnerWid, setMhInnerWid] =
    useState<string>("1.2");
  const [mhWallThick, setMhWallThick] = useState<string>("0.23");
  const [mhBaseThick, setMhBaseThick] = useState<string>("0.15");
  const [mhTopThick, setMhTopThick] = useState<string>("0.15");
  const [concreteMix, setConcreteMix] = useState<string>("M15 (1:2:4)");
  useEffect(() => {
    const depth = parseFloat(mhDepth) || 0;
    const len = parseFloat(mhInnerLen) || 0;
    const wid = mhType === "rectangular" ? parseFloat(mhInnerWid) || 0 : len;
    const wallThick = parseFloat(mhWallThick) || 0;
    const baseThick = parseFloat(mhBaseThick) || 0;
    const topThick = parseFloat(mhTopThick) || 0;
    let excVol = 0;
    let wallVol = 0;
    let baseVol = 0;
    let topSlabVol = 0;
    let brickCount = 0;
    if (mhType === "circular") {
      const outerD = len + 2 * wallThick;
      const baseD = outerD + 0.3;
      /* 150mm offset */ const excD = baseD + 0.6;
      /* 300mm working space */ wallVol =
        Math.PI * Math.pow(outerD / 2, 2) * depth -
        Math.PI * Math.pow(len / 2, 2) * depth;
      excVol = Math.PI * Math.pow(excD / 2, 2) * (depth + baseThick);
      baseVol = Math.PI * Math.pow(baseD / 2, 2) * baseThick;
      topSlabVol = Math.PI * Math.pow(outerD / 2, 2) * topThick;
    } else {
      const outerL = len + 2 * wallThick;
      const outerW = wid + 2 * wallThick;
      const baseL = outerL + 0.3;
      const baseW = outerW + 0.3;
      const excL = baseL + 0.6;
      const excW = baseW + 0.6;
      wallVol = (outerL * outerW - len * wid) * depth;
      excVol = excL * excW * (depth + baseThick);
      baseVol = baseL * baseW * baseThick;
      topSlabVol = outerL * outerW * topThick;
      /* Standard brick metric 190x90x90 with mortar ~ 200x100x100 = 0.002m³ */ brickCount =
        Math.ceil(wallVol / 0.002);
    }
    /* Concrete is used in base and top slab. Walls could be brick or concrete. Since we want concrete calculations, let's assume if circular -> concrete rings or cast-in-place; if rectangular -> either RCC or Brick. Let's calculate total concrete for Base + Top Slab + optionally wall if circular). Let's assume the user wants concrete details for base & top slab. */ const totalWetConcrete =
      baseVol + topSlabVol + (mhType === "circular" ? wallVol : 0);
    const totalDryConcrete = totalWetConcrete * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
    const ratio = mixRatios[concreteMix];
    const totalRatio = ratio.c + ratio.s + ratio.a;
    /* cement volume in m3 */ const cementM3 =
      (totalDryConcrete * ratio.c) / totalRatio;
    const cementBags = Math.ceil(cementM3 / 0.0347);
    /* 50kg bag, sand in cft (1 m3 = 35.3147 cft) */ const sandCft =
      ((totalDryConcrete * ratio.s) / totalRatio) * 35.3147;
    /* agg in cft */ const aggCft =
      ((totalDryConcrete * ratio.a) / totalRatio) * 35.3147;
    const results = {
      excavationVol: excVol,
      wallVol,
      baseVol,
      topSlabVol,
      totalWetConcrete,
      totalDryConcrete,
      materials: { cementBags, sandCft, aggCft },
      brickCount: mhType === "rectangular" ? brickCount : undefined,
    };
    if (onStateChange) {
      onStateChange(results);
    }
  }, [
    mhType,
    mhDepth,
    mhInnerLen,
    mhInnerWid,
    mhWallThick,
    mhBaseThick,
    mhTopThick,
    concreteMix,
    onStateChange,
  ]);
  const ratio = mixRatios[concreteMix];
  const totalRatio = ratio.c + ratio.s + ratio.a;
  const depth = parseFloat(mhDepth) || 0;
  const len = parseFloat(mhInnerLen) || 0;
  const wid = mhType === "rectangular" ? parseFloat(mhInnerWid) || 0 : len;
  const wallThick = parseFloat(mhWallThick) || 0;
  const baseThick = parseFloat(mhBaseThick) || 0;
  const topThick = parseFloat(mhTopThick) || 0;
  
  let excVol = 0;
  let wallVol = 0;
  let baseVol = 0;
  let topSlabVol = 0;

  if (mhType === "circular") {
    const outerD = len + 2 * wallThick;
    const baseD = outerD + 0.3;
    const excD = baseD + 0.6;
    wallVol = Math.PI * Math.pow(outerD / 2, 2) * depth - Math.PI * Math.pow(len / 2, 2) * depth;
    excVol = Math.PI * Math.pow(excD / 2, 2) * (depth + baseThick);
    baseVol = Math.PI * Math.pow(baseD / 2, 2) * baseThick;
    topSlabVol = Math.PI * Math.pow(outerD / 2, 2) * topThick;
  } else {
    const outerL = len + 2 * wallThick;
    const outerW = wid + 2 * wallThick;
    const baseL = outerL + 0.3;
    const baseW = outerW + 0.3;
    const excL = baseL + 0.6;
    const excW = baseW + 0.6;
    wallVol = (outerL * outerW - len * wid) * depth;
    excVol = excL * excW * (depth + baseThick);
    baseVol = baseL * baseW * baseThick;
    topSlabVol = outerL * outerW * topThick;
  }

  /* Let's recreate calculations for display */ const totalWetConcrete =
    mhType === "circular"
      ? Math.PI * Math.pow((len + 2 * wallThick) / 2, 2) * depth -
        Math.PI * Math.pow(len / 2, 2) * depth +
        Math.PI * Math.pow((len + 2 * wallThick + 0.3) / 2, 2) * baseThick +
        Math.PI * Math.pow((len + 2 * wallThick) / 2, 2) * topThick
      : (len + 2 * wallThick + 0.3) * (wid + 2 * wallThick + 0.3) * baseThick +
        (len + 2 * wallThick) * (wid + 2 * wallThick) * topThick;
  const totalDryConcrete = totalWetConcrete * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR;
  const cementM3 = (totalDryConcrete * ratio.c) / totalRatio;
  const cementBags = Math.ceil(cementM3 / CIVIL_CONSTANTS.CEMENT_BAG_VOLUME_M3);
  const sandCft = ((totalDryConcrete * ratio.s) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;
  const aggCft = ((totalDryConcrete * ratio.a) / totalRatio) * CIVIL_CONSTANTS.M3_TO_CFT;
  return (
    <div className="w-full h-full">
      {" "}
      <div className="px-2 py-4 sm:px-6 sm:py-6 bg-transparent border-b border-gray-100 rounded-t-2xl">
        {" "}
        <div className="flex flex-col mb-6">
          {" "}
          <label className="text-base font-medium uppercase tracking-wider mb-2 ml-1">
            Shape
          </label>{" "}
          <div className="flex overflow-x-auto pb-4 gap-2 mb-2 p-1 w-full max-w-sm">
            {" "}
            <UniversalTabs tabs={[{id: "circular", label: "Circular", icon: <CircleDashed className="w-4 h-4" />}]} activeTab={mhType === "circular" ? "circular" : ""} onTabChange={() => setMhType("circular")} />
            <UniversalTabs tabs={[{id: "rectangular", label: "Rectangular", icon: <Square className="w-4 h-4" />}]} activeTab={mhType === "rectangular" ? "rectangular" : ""} onTabChange={() => setMhType("rectangular")} />
          </div>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {" "}
          <div>
            {" "}
            <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
              Depth (m)
            </label>{" "}
            <><label htmlFor="a11y-input-323" className="sr-only">Input</label>
<input id="a11y-input-323" type="number" inputMode="decimal"
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm min-h-[44px] overflow-hidden"
              value={mhDepth}
              onChange={(e) => setMhDepth(e.target.value)}
            /></>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
              {mhType === "circular" ? "Inner Diameter" : "Inner Length"} (m)
            </label>{" "}
            <><label htmlFor="a11y-input-324" className="sr-only">Input</label>
<input id="a11y-input-324" type="number" inputMode="decimal"
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm min-h-[44px] overflow-hidden"
              value={mhInnerLen}
              onChange={(e) => setMhInnerLen(e.target.value)}
            /></>{" "}
          </div>{" "}
          {mhType === "rectangular" && (
            <div>
              {" "}
              <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                Inner Width (m)
              </label>{" "}
              <><label htmlFor="a11y-input-325" className="sr-only">Input</label>
<input id="a11y-input-325" type="number" inputMode="decimal"
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm min-h-[44px] overflow-hidden"
                value={mhInnerWid}
                onChange={(e) => setMhInnerWid(e.target.value)}
              /></>{" "}
            </div>
          )}{" "}
          <div>
            {" "}
            <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
              Wall Thickness (m)
            </label>{" "}
            <><label htmlFor="a11y-input-326" className="sr-only">Input</label>
<input id="a11y-input-326" type="number" inputMode="decimal"
              step="0.01"
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm min-h-[44px] overflow-hidden"
              value={mhWallThick}
              onChange={(e) => setMhWallThick(e.target.value)}
            /></>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
              Base Thick (m)
            </label>{" "}
            <><label htmlFor="a11y-input-327" className="sr-only">Input</label>
<input id="a11y-input-327" type="number" inputMode="decimal"
              step="0.01"
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm min-h-[44px] overflow-hidden"
              value={mhBaseThick}
              onChange={(e) => setMhBaseThick(e.target.value)}
            /></>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
              Top Slab Thick (m)
            </label>{" "}
            <><label htmlFor="a11y-input-328" className="sr-only">Input</label>
<input id="a11y-input-328" type="number" inputMode="decimal"
              step="0.01"
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm min-h-[44px] overflow-hidden"
              value={mhTopThick}
              onChange={(e) => setMhTopThick(e.target.value)}
            /></>{" "}
          </div>{" "}
          <div className="lg:col-span-2">
            {" "}
            <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
              Concrete Mix Grade
            </label>{" "}
            <select
              className="w-full bg-white border border-gray-200 text-slate-800 rounded-[24px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500/50 transition-all shadow-sm appearance-none overflow-hidden"
              value={concreteMix}
              onChange={(e) => setConcreteMix(e.target.value)}
            >
              {" "}
              {Object.keys(mixRatios).map((mix) => (
                <option key={mix} value={mix}>
                  {mix}
                </option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="px-6 py-8">
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {" "}
          <div className="lg:col-span-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-transparent border border-slate-100 rounded-[24px] overflow-hidden">
            {" "}
            {/* Visual Icon representation based on shape */}{" "}
            <div
              className="w-32 h-32 relative flex items-center justify-center text-teal-200 border-[8px] mb-4 shadow-inner"
              style={{
                borderRadius: mhType === "circular" ? "50%" : "1rem",
                borderColor: "currentColor",
              }}
            >
              {" "}
              <span className="text-base font-medium text-teal-700 absolute">
                {" "}
                {mhType === "circular" ? `Ø ${len}m` : `${len}×${wid}m`}{" "}
              </span>{" "}
            </div>{" "}
            <div className="text-center">
              {" "}
              <h4 className="font-bold text-slate-800 mb-1">
                {mhType === "circular" ? "Circular" : "Rectangular"} Manhole
              </h4>{" "}
              <p className="text-sm text-slate-700 font-medium">
                Depth: {depth}m
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="lg:col-span-2 flex flex-col h-full">
            <MaterialSummary
              title="Estimate Results"
              totalLabel="Total Dry Concrete"
              totalValue={totalDryConcrete.toFixed(2)}
              totalUnit="m³"
              subtitle="Wet factor used: × 1.54"
            >
              <div className="grid grid-cols-1 gap-4 mt-6">
                <ResultCard
                  title="Wet Concrete Volume"
                  value={totalWetConcrete.toFixed(2)}
                  unit="m³"
                  icon={<Droplets className="w-4 h-4 text-slate-900" />}
                  description="Base + Wall + Slab"
                  variant="primary"
                />
                
                <h4 className="text-base font-medium mb-2 mt-4 flex items-center gap-2">
                  <Construction className="w-4 h-4 text-slate-600" /> Material Breakdown ({concreteMix})
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ResultCard
                    title="Cement"
                    value={cementBags}
                    unit="bags"
                    variant="neutral"
                  />
                  <ResultCard
                    title="Sand"
                    value={sandCft.toFixed(1)}
                    unit="cft"
                    variant="neutral"
                  />
                  <ResultCard
                    title="Aggregate"
                    value={aggCft.toFixed(1)}
                    unit="cft"
                    variant="neutral"
                  />
                </div>
              </div>
            </MaterialSummary>
          </div>{" "}
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            
          </div>
        </div>{" "}
      </div>{" "}
      <CalculationHistory
        calculatorId="manhole_v1"
        currentInputs={{ mhType, mhDepth, mhInnerLen, mhInnerWid, mhWallThick, mhBaseThick, mhTopThick, concreteMix }}
        currentResults={{ excVol, totalWetConcrete, cementBags, sandCft, aggCft }}
        summaryGeneration={(inputs, res) => `Manhole ${inputs.mhType} - Depth: ${inputs.mhDepth}m`}
        onRestore={(inputs) => {
          if (inputs.mhType) setMhType(inputs.mhType);
          if (inputs.mhDepth !== undefined) setMhDepth(inputs.mhDepth);
          if (inputs.mhInnerLen !== undefined) setMhInnerLen(inputs.mhInnerLen);
          if (inputs.mhInnerWid !== undefined) setMhInnerWid(inputs.mhInnerWid);
          if (inputs.mhWallThick !== undefined) setMhWallThick(inputs.mhWallThick);
          if (inputs.mhBaseThick !== undefined) setMhBaseThick(inputs.mhBaseThick);
          if (inputs.mhTopThick !== undefined) setMhTopThick(inputs.mhTopThick);
          if (inputs.concreteMix !== undefined) setConcreteMix(inputs.concreteMix);
        }}
      />
    </div>
  );
}
