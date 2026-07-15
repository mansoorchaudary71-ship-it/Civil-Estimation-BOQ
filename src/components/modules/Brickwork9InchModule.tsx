import React, { useState, useMemo } from "react";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";

import { saveEstimate } from "../../lib/estimates";
import { useAuth } from "../../contexts/AuthContext";
import { Save } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { StyledChart } from "../ui/EstimateVisualizer";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import {
  Columns,
  Settings,
  MinusSquare,
  Box,
  Droplets,
  Layers,
  Construction,
} from "lucide-react";
import { useGlobalSettings } from "../../context/SettingsContext";

const STANDARD_BRICK = { l: 0.23, w: 0.11, h: 0.075 };
/* in m (9" x 4.3" x 3") */ const MODULAR_BRICK = { l: 0.19, w: 0.09, h: 0.09 };
/* in m */ const MORTAR_THICKNESS = 0.01;

export default function Brickwork9InchModule({ hideHistory = false }: { hideHistory?: boolean }) {
  const { currentUnit } = useGlobalSettings();
  const isSI = currentUnit === "Metric";

  const [brickType, setBrickType] = useState<"standard" | "modular">(
    "standard",
  );
  const [wallLength, setWallLength] = useState<string>("5");
  const [wallHeight, setWallHeight] = useState<string>("3");
  const [deductions, setDeductions] = useState<string>("0");
  const [mixRatioPreset, setMixRatioPreset] = useState<string>("1:4");
  const [cementRatio, setCementRatio] = useState<string>("1");
  const [sandRatio, setSandRatio] = useState<string>("4");
  const [includeWastage, setIncludeWastage] = useState<boolean>(true);

  React.useEffect(() => {
    if (isSI) {
      setWallLength("5");
      setWallHeight("3");
      setDeductions("0");
    } else {
      setWallLength("16");
      setWallHeight("10");
      setDeductions("0");
    }
  }, [isSI]);

  /* 9 inch is roughly 0.23m */ const THICKNESS = 0.23;

  const results = useMemo(() => {
    let l = parseFloat(wallLength) || 0;
    let h = parseFloat(wallHeight) || 0;
    let ded = parseFloat(deductions) || 0;

    // Convert from imperial if needed to metric for base calculations
    if (!isSI) {
      l = l * CIVIL_CONSTANTS.FT_TO_M; // ft to m
      h = h * CIVIL_CONSTANTS.FT_TO_M; // ft to m
      ded = ded * 0.092903; // sq.ft to m2
    }

    const grossArea = l * h;
    const netArea = Math.max(0, grossArea - ded);
    const netVolume = netArea * THICKNESS;
    const brick = brickType === "standard" ? STANDARD_BRICK : MODULAR_BRICK;
    /* Volume of 1 brick with mortar */ const brickVolWithMortar =
      (brick.l + MORTAR_THICKNESS) *
      (brick.w + MORTAR_THICKNESS) *
      (brick.h + MORTAR_THICKNESS);
    /* Volume of 1 brick without mortar */ const brickVolWithoutMortar =
      brick.l * brick.w * brick.h;
    /* Number of bricks */ let noOfBricks = netVolume / brickVolWithMortar;
    if (includeWastage) {
      noOfBricks = noOfBricks * 1.1; /* 10% wastage for bricks  */
    }
    noOfBricks = Math.ceil(noOfBricks);
    /* Total volume of bricks without mortar */ const volumeOfBricks =
      noOfBricks * brickVolWithoutMortar;
    /* Wet mortar volume */ let wetMortarVol = netVolume - volumeOfBricks;
    if (wetMortarVol < 0) wetMortarVol = 0;
    
    // Frog filling allowance (adds approx 15% extra mortar per brick)
    wetMortarVol = wetMortarVol * 1.15;

    /* fallback // Dry mortar volume (approx 33% more) */ let dryMortarVol =
      wetMortarVol * 1.33;
    if (includeWastage) {
      dryMortarVol = dryMortarVol * 1.1; /* 10% wastage for mortar */
    }
    const cRatio = parseFloat(cementRatio) || 1;
    const sRatio = parseFloat(sandRatio) || 4;
    const totalRatio = cRatio + sRatio;
    /* Cement in m3 */ const cementM3 = (dryMortarVol * cRatio) / (totalRatio || 1);
    /* 1 bag = 0.0347 m3 */ const cementBags = Math.ceil(cementM3 / 0.0347);
    /* Sand in m3 -> convert to cft */ const sandM3 =
      (dryMortarVol * sRatio) / (totalRatio || 1);
    const sandCft = sandM3 * 35.3147;

    return {
      netVolume: isSI ? netVolume : netVolume * 35.3147, // display unit volume
      netVolumeM3: netVolume,
      volumeOfBricksM3: volumeOfBricks,
      volumeOfBricksDisplay: isSI ? volumeOfBricks : volumeOfBricks * 35.3147,
      wetMortarVolM3: wetMortarVol,
      noOfBricks,
      wetMortarVol: isSI ? wetMortarVol : wetMortarVol * 35.3147,
      dryMortarVol: isSI ? dryMortarVol : dryMortarVol * 35.3147,
      cementBags,
      sandCft,
      sandM3,
      isSI
    };
  }, [wallLength, wallHeight, deductions, brickType, cementRatio, sandRatio, includeWastage, isSI]);
  const explanationOpts = useMemo(() => {
    let l = parseFloat(wallLength) || 0;
    let h = parseFloat(wallHeight) || 0;
    let ded = parseFloat(deductions) || 0;
    let hasInputs = !!(l || h);

    if (!hasInputs) {
      return {
        hasInputs: false,
        genericFormula: [
          { label: "Volume of Wall", formula: "Length × Height × Thickness" },
          { label: "No. of Bricks", formula: "Volume of Wall / Volume of 1 Brick with Mortar" },
          { label: "Dry Mortar", formula: "Total Mortar Volume × 1.33" }
        ],
        notes: ["1.33 is the dry volume conversion factor for mortar", "Standard Mortar Joint is 10mm"]
      };
    }

    return {
      hasInputs: true,
      activeBreakdown: [
        { label: "Gross Wall Area", formula: `${l} × ${h}`, result: `${(l * h).toFixed(2)} ${isSI ? "m²" : "sq.ft"}` },
        { label: "Net Volume", formula: `(Gross Area - Deductions) × ${isSI ? '0.23m' : '0.75ft'}`, result: `${results.netVolume.toFixed(2)} ${isSI ? "m³" : "cft"}` },
        { label: "Bricks", formula: `Net Volume / Brick Vol.`, result: `${results.noOfBricks.toLocaleString('en-US')} pcs` },
      ],
      notes: ["1.33 is the dry volume conversion factor for mortar"]
    };
  }, [wallLength, wallHeight, deductions, results, isSI]);

  return (
    <div className={`w-full ${hideHistory ? '' : 'bg-bg-card border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-md mt-4'}`}>
      {!hideHistory && (
        <div className="px-6 md:px-8 py-5 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between bg-transparent rounded-[24px] border border-slate-200 shadow-sm text-slate-800 gap-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-[24px] overflow-hidden">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-medium text-slate-800 mb-4">
                Brickwork Estimator
              </h3>
              <p className="text-base font-normal text-slate-600 leading-relaxed">
                Calculate bricks, cement, and sand for a 9-inch wall.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 text-base font-medium uppercase tracking-wider rounded-[16px] shadow-sm">
            Load Bearing (230mm)
          </span>
        </div>
      )}

      <div className={hideHistory ? "pt-2" : "p-6 md:p-8"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-start">
          {/* Inputs Column */}
          <div className="space-y-8">
            {/* Wall Dimensions Section */}
            <section>
              <h4 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Wall Dimensions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                    Length ({results.isSI ? 'm' : 'ft'})
                  </label>
                  <><label htmlFor="a11y-input-122" className="sr-only">e.g. 5</label>
<input id="a11y-input-122"
                    type="number" inputMode="decimal"
                    value={wallLength}
                    onChange={(e) => setWallLength(e.target.value)}
                    className="w-full bg-bg-card/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-5 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-600/50 hover:border-orange-300 shadow-sm transition-all"
                    placeholder="e.g. 5"
                  /></>
                </div>
                <div>
                  <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                    Height ({results.isSI ? 'm' : 'ft'})
                  </label>
                  <><label htmlFor="a11y-input-123" className="sr-only">e.g. 3</label>
<input id="a11y-input-123"
                    type="number" inputMode="decimal"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(e.target.value)}
                    className="w-full bg-bg-card/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-5 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-600/50 hover:border-orange-300 shadow-sm transition-all"
                    placeholder="e.g. 3"
                  /></>
                </div>
                <div>
                  <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                    Deductions ({results.isSI ? 'm²' : 'sq.ft'})
                  </label>
                  <><label htmlFor="a11y-input-124" className="sr-only">e.g. 1.5</label>
<input id="a11y-input-124"
                    type="number" inputMode="decimal"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-5 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-600/50 hover:border-orange-300 shadow-sm transition-all"
                    placeholder="e.g. 1.5"
                  /></>
                </div>
              </div>
            </section>

            {/* Specifications Section */}
            <section>
              <h4 className="text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Specifications
              </h4>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                    Brick Size
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={() => setBrickType("standard")}
                      className={`flex-1 flex flex-col items-start justify-center py-3.5 px-5 text-base font-medium rounded-[24px] transition-all border ${brickType === "standard" ? "bg-blue-50  border-blue-200  text-blue-700  shadow-[0_4px_20px_rgba(249,115,22,0.1)]" : "bg-bg-card border-slate-200 dark:border-slate-700 text-slate-700  hover:border-blue-200 hover:bg-blue-50/50"}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                        <div className={`w-4 h-4 rounded-full border-[3px] flex items-center justify-center shrink-0 ${brickType === "standard" ? "border-blue-600 bg-bg-card" : "border-slate-300"}`}>
                          {brickType === "standard" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="tracking-wide">Standard</span>
                      </div>
                      <span className={`text-sm font-medium ml-6 opacity-80 ${brickType === "standard" ? "text-blue-700 " : "text-slate-500 "}`}>
                        230 × 110 × 75 mm
                      </span>
                    </button>
                    <button
                      onClick={() => setBrickType("modular")}
                      className={`flex-1 flex flex-col items-start justify-center py-3.5 px-5 text-base font-medium rounded-[24px] transition-all border ${brickType === "modular" ? "bg-blue-50  border-blue-200  text-blue-700  shadow-[0_4px_20px_rgba(249,115,22,0.1)]" : "bg-bg-card border-slate-200 dark:border-slate-700 text-slate-700  hover:border-blue-200 hover:bg-blue-50/50"}`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                        <div className={`w-4 h-4 rounded-full border-[3px] flex items-center justify-center shrink-0 ${brickType === "modular" ? "border-blue-600 bg-bg-card" : "border-slate-300"}`}>
                          {brickType === "modular" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </div>
                        <span className="tracking-wide">Modular</span>
                      </div>
                      <span className={`text-sm font-medium ml-6 opacity-80 ${brickType === "modular" ? "text-blue-700 " : "text-slate-500 "}`}>
                        190 × 90 × 90 mm
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                      <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                        Mortar Mix Preset
                      </label>
                      <div className="relative">
                        <select
                          value={mixRatioPreset}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMixRatioPreset(val);
                            if (val !== "custom") {
                              const [c, s] = val.split(":");
                              setCementRatio(c);
                              setSandRatio(s);
                            }
                          }}
                          className="w-full appearance-none bg-bg-card/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[24px] px-5 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-600/50 hover:border-orange-300 shadow-sm transition-all cursor-pointer font-semibold overflow-hidden"
                        >
                          <option value="1:3">1:3 (Rich Mix)</option>
                          <option value="1:4">1:4 (Standard Mix)</option>
                          <option value="1:6">1:6 (Lean Mix)</option>
                          <option value="custom">Custom Mix</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
                          <Settings className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                          Cement Ratio
                        </label>
                        <><label htmlFor="a11y-input-125" className="sr-only">Input</label>
<input id="a11y-input-125"
                          type="number" inputMode="decimal"
                          value={cementRatio}
                          onChange={(e) => { setCementRatio(e.target.value); setMixRatioPreset("custom"); }}
                          className="w-full bg-bg-card/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-5 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-600/50 hover:border-orange-300 shadow-sm transition-all"
                        /></>
                      </div>
                      <div className="flex-1">
                        <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-slate-700 mb-1">
                          Sand Ratio
                        </label>
                        <><label htmlFor="a11y-input-126" className="sr-only">Input</label>
<input id="a11y-input-126"
                          type="number" inputMode="decimal"
                          value={sandRatio}
                          onChange={(e) => { setSandRatio(e.target.value); setMixRatioPreset("custom"); }}
                          className="w-full bg-bg-card/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-5 py-3.5 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-600/50 hover:border-orange-300 shadow-sm transition-all"
                        /></>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="mt-8 flex items-center gap-3">
                <label className="relative flex cursor-pointer items-center rounded-full p-1 hover:bg-blue-50 transition-colors text-sm font-medium text-slate-700 mb-1 block">
                  <><label htmlFor="a11y-input-127" className="sr-only">Input</label>
<input id="a11y-input-127"
                    type="checkbox"
                    className="peer cursor-pointer appearance-none rounded-[24px] border-2 border-slate-200 dark:border-slate-700 transition-all checked:border-blue-600 checked:bg-blue-500 w-6 h-6 ml-1 text-base font-normal overflow-hidden"
                    checked={includeWastage}
                    onChange={(e) => setIncludeWastage(e.target.checked)}
                  /></>
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-900 opacity-0 transition-opacity peer-checked:opacity-100 ml-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </label>
                <div className="flex flex-col cursor-pointer select-none" onClick={() => setIncludeWastage(!includeWastage)}>
                  <span className="text-base font-medium">
                    Include 10% Wastage
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    Adds extra margin for bricks & mortar
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Results Column */}
          <div className="relative flex flex-col h-full">
            <div className="sticky top-6 flex flex-col flex-1">
              <MaterialSummary
               title="Estimate Results"
               totalLabel="Total Bricks Estimated"
               totalValue={results.noOfBricks.toLocaleString('en-US')}
               totalUnit="pcs"
             >
               <div className="grid grid-cols-1 gap-4 mt-6">
                 <ResultCard
                   title="Net Wall Volume"
                   value={results.netVolume.toFixed(2)}
                   unit={results.isSI ? 'm³' : 'cft'}
                   variant="neutral"
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                   <ResultCard
                     title="Cement"
                     value={results.cementBags}
                     unit="bags"
                     variant="secondary"
                     icon={<Construction className="w-5 h-5 text-blue-500" />}
                   />
                   <ResultCard
                     title="Sand"
                     value={results.sandCft.toFixed(1)}
                     unit="cft"
                     variant="warning"
                     icon={<Layers className="w-5 h-5 text-amber-500" />}
                     description={`${((results.sandCft || 0) / 35.3147).toFixed(2)} m³`}
                   />
                 </div>
               </div>
              </MaterialSummary>

              <div className="px-4 py-3 bg-transparent rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-200 dark:border-slate-700 rounded-[24px] flex justify-center text-center mt-2 overflow-hidden">
                <span className="flex items-center gap-1.5 text-base font-medium">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  Dry Mortar: {results.dryMortarVol.toFixed(3)} {results.isSI ? 'm³' : 'cft'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            
          </div>
        </div>
      </div>
      {!hideHistory && (
        <CalculationHistory
          calculatorId="brickwork_9inch_v1"
          currentInputs={{ brickType, wallLength, wallHeight, deductions, mixRatioPreset, cementRatio, sandRatio, includeWastage }}
          currentResults={{ noOfBricks: results.noOfBricks, cementBags: results.cementBags, sandCft: results.sandCft }}
          summaryGeneration={(inputs, res) => `9in Brickwork Area ${inputs.wallLength}x${inputs.wallHeight}`}
          explanation={explanationOpts}
          onRestore={(inputs) => {
            if (inputs.brickType) setBrickType(inputs.brickType);
            if (inputs.wallLength !== undefined) setWallLength(inputs.wallLength);
            if (inputs.wallHeight !== undefined) setWallHeight(inputs.wallHeight);
            if (inputs.deductions !== undefined) setDeductions(inputs.deductions);
            if (inputs.mixRatioPreset !== undefined) setMixRatioPreset(inputs.mixRatioPreset);
            if (inputs.cementRatio !== undefined) setCementRatio(inputs.cementRatio);
            if (inputs.sandRatio !== undefined) setSandRatio(inputs.sandRatio);
            if (inputs.includeWastage !== undefined) setIncludeWastage(inputs.includeWastage);
          }}
        />
      )}
    </div>
  );
}
