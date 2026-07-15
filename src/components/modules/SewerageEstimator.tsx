import React, { useState, useEffect } from "react";
import {
  Waves,
  Ruler,
  CircleDashed,
  ArrowDownRight,
  AlignVerticalJustifyStart,
  ArrowRight,
  ChevronDown,
  Plus,
  Droplet,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { useTakeoff } from "../../context/TakeoffContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";

import ManholeModule, { ManholeResults } from "./ManholeModule";
export default function SewerageEstimator() {
  const { boqItems, addBoqItem, updateBoqItem } = useTakeoff();
  const [openSection, setOpenSection] = useState<string>("manhole");
  const [mhResults, setMhResults] = useState<ManholeResults | null>(null);
  /* Trench State */ const [trenchLength, setTrenchLength] =
    useState<string>("100");
  const [trenchWidth, setTrenchWidth] = useState<string>("1.5");
  const [trenchDepth, setTrenchDepth] = useState<string>("2.5");
  const [trenchProfile, setTrenchProfile] = useState<"vertical" | "sloped">(
    "vertical",
  );
  const [trenchSlopeRatio, setTrenchSlopeRatio] = useState<string>("0.5");
  /* Horizontal : 1 Vertical // Backfill Calculation State */ const [
    pipeOuterDiameter,
    setPipeOuterDiameter,
  ] = useState<string>("0.4");
  /* m */ const [beddingDepth, setBeddingDepth] = useState<string>("0.2");
  /* m // Invert Level State */ const [startIL, setStartIL] =
    useState<string>("100");
  /* m */ const [ilLength, setIlLength] = useState<string>("50");
  /* m */ const [ilGradient, setIlGradient] = useState<string>("200");
  /* 1 in 200 // Pipe Sections State */ const [pipeLength, setPipeLength] =
    useState<string>("100");
  const [pipeSectionLen, setPipeSectionLen] = useState<string>("2.5");
  /* standard 2.5m RCC pipe // Hydraulic Flow State */ const [
    flowDia,
    setFlowDia,
  ] = useState<string>("0.3");
  /* m */ const [flowGradient, setFlowGradient] = useState<string>("200");
  /* 1 in X */ const [flowMaterial, setFlowMaterial] = useState<
    "pvc" | "concrete" | "cast_iron" | "clay"
  >("concrete");
  /* Pipe Bedding State */ const [beddingCalcLength, setBeddingCalcLength] =
    useState<string>("100");
  const [beddingCalcWidth, setBeddingCalcWidth] = useState<string>("1.5");
  const [beddingCalcPipeOD, setBeddingCalcPipeOD] = useState<string>("0.4");
  const [beddingType, setBeddingType] = useState<
    "classA" | "classB" | "classC"
  >("classB");
  const [beddingUnderPipe, setBeddingUnderPipe] = useState<string>("0.15");
  const [beddingHaunchHeight, setBeddingHaunchHeight] = useState<string>("0.2");
  /* Septic System State */ const [septicUsers, setSepticUsers] =
    useState<string>("5");
  const [septicDemand, setSepticDemand] = useState<string>("120");
  const [septicPercolation, setSepticPercolation] = useState<string>("30");
  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? "" : id);
  };
  /* Calculations */ const tL = parseFloat(trenchLength) || 0;
  const tW = parseFloat(trenchWidth) || 0;
  const tD = parseFloat(trenchDepth) || 0;
  const tSlope = parseFloat(trenchSlopeRatio) || 0;
  const pipeOD = parseFloat(pipeOuterDiameter) || 0;
  const bedD = parseFloat(beddingDepth) || 0;
  /* Trench Excavation */ let topWidth = tW;
  if (trenchProfile === "sloped") {
    topWidth = tW + 2 * (tSlope * tD);
  }
  const trenchVol = ((tW + topWidth) / 2) * tD * tL;
  /* Pipe Displacement Volume */ const pipeVol =
    Math.PI * Math.pow(pipeOD / 2, 2) * tL;
  /* Bedding Volume */ let topBeddingWidth = tW;
  if (trenchProfile === "sloped") {
    topBeddingWidth = tW + 2 * (tSlope * bedD);
  }
  const beddingVol = ((tW + topBeddingWidth) / 2) * bedD * tL;
  /* Net Backfill Volume */ const netBackfillVol = Math.max(
    0,
    trenchVol - pipeVol - beddingVol,
  );
  const sIL = parseFloat(startIL) || 0;
  const iL = parseFloat(ilLength) || 0;
  const iG = parseFloat(ilGradient) || 1;
  /* prevent divide by zero */ const drop = iG > 0 ? iL / iG : 0;
  const endIL = sIL - drop;
  const pL = parseFloat(pipeLength) || 0;
  const pS = parseFloat(pipeSectionLen) || 1;
  const pipeCount = pS > 0 ? Math.ceil(pL / pS) : 0;
  /* Hydraulic Flow Calculations */ const fD = parseFloat(flowDia) || 0;
  const fG = parseFloat(flowGradient) || 1;
  let n = 0.013;
  /* default concrete */ if (flowMaterial === "pvc") n = 0.009;
  else if (flowMaterial === "cast_iron") n = 0.014;
  else if (flowMaterial === "clay") n = 0.015;
  const hydraulicRadius = fD > 0 ? fD / 4 : 0;
  const slope = fG > 0 ? 1 / fG : 0;
  const flowVelocity =
    n > 0 && fD > 0 && fG > 0
      ? (1 / n) * Math.pow(hydraulicRadius, 2 / 3) * Math.pow(slope, 1 / 2)
      : 0;
  const flowArea = Math.PI * Math.pow(fD / 2, 2);
  const dischargeCapacityM3 = flowArea * flowVelocity;
  /* m3/s */ const dischargeCapacityL = dischargeCapacityM3 * 1000;
  /* L/s // Structural Pipe Bedding Calculations */ const calcBedLength =
    parseFloat(beddingCalcLength) || 0;
  const calcBedWidth = parseFloat(beddingCalcWidth) || 0;
  const calcBedPipeOD = parseFloat(beddingCalcPipeOD) || 0;
  const calcBedUnder = parseFloat(beddingUnderPipe) || 0;
  const calcBedHaunch = parseFloat(beddingHaunchHeight) || 0;
  let bedPipeDisplaced = 0;
  if (calcBedPipeOD > 0) {
    const R = calcBedPipeOD / 2;
    const h = Math.min(Math.max(calcBedHaunch, 0), calcBedPipeOD);
    /* clamp haunch height */ if (h >= calcBedPipeOD) {
      bedPipeDisplaced = Math.PI * R * R;
    } else if (h > 0) {
      const d = Math.abs(R - h);
      const theta = 2 * Math.acos(d / R);
      const segmentArea = ((R * R) / 2) * (theta - Math.sin(theta));
      if (h <= R) {
        bedPipeDisplaced = segmentArea;
      } else {
        bedPipeDisplaced = Math.PI * R * R - segmentArea;
      }
    }
  }
  /* Cross-sectional area = Trench Width * Total Depth - Pipe DisplacedArea */ const totalBedDepth =
    calcBedUnder + Math.min(calcBedPipeOD, Math.max(0, calcBedHaunch));
  const bedCrossSection = Math.max(
    0,
    calcBedWidth * totalBedDepth - bedPipeDisplaced,
  );
  const beddingCalculatedVol = bedCrossSection * calcBedLength;
  const beddingWeightTons =
    beddingType === "classB" || beddingType === "classC"
      ? beddingCalculatedVol * 1.6
      : 0;
  /* 1600 kg/m3 = 1.6 t/m3 // Septic System Calculations */ const sUsers =
    parseFloat(septicUsers) || 0;
  const sDemand = parseFloat(septicDemand) || 0;
  const sPerc = parseFloat(septicPercolation) || 1;
  /* L/m2/day */ const dailyFlowLiters = sUsers * sDemand;
  const dailyFlowM3 = dailyFlowLiters / 1000;
  /* Volume: 24h retention + sludge (assume ~40L per user per year for 2 years = 80L/user) */ const sludgeVolLiters =
    sUsers * 80;
  const septicTotalVolM3 = (dailyFlowLiters + sludgeVolLiters) / 1000;
  /* Dimensions (L = 2W) => 2W^2 * D = V -> W = sqrt(V / 2D) */ const septicDepth =
    Math.max(1, Math.min(2.5, Math.pow(septicTotalVolM3, 1 / 3)));
  /* dynamic depth between 1m and 2.5m */ const septicWidth =
    septicTotalVolM3 > 0 ? Math.sqrt(septicTotalVolM3 / (2 * septicDepth)) : 0;
  const septicLength = septicWidth * 2;
  const soakageAreaRequired = dailyFlowLiters / (sPerc > 0 ? sPerc : 1);
  const soakageDepth = Math.max(1.5, septicDepth + 0.5);
  /* soakage pit slightly deeper than tank */ const soakageDia =
    soakageAreaRequired > 0
      ? soakageAreaRequired / (Math.PI * soakageDepth)
      : 0;
  const handleAddPipesToBOQ = () => {
    if (pipeCount <= 0) return;
    const descStr = `Sewerage RCC Pipe (${pipeSectionLen}m sections)`;
    const existing = boqItems.find((item) => item.desc === descStr);
    if (existing) {
      if (existing.qtyOverride !== pipeCount) {
        updateBoqItem(existing.id, { qtyOverride: pipeCount });
      }
    } else {
      /* Also clean up any other length so they don't stack up */ const otherExisting =
        boqItems.find((item) => item.desc.startsWith("Sewerage RCC Pipe"));
      if (otherExisting) {
        updateBoqItem(otherExisting.id, {
          qtyOverride: pipeCount,
          desc: descStr,
        });
      } else {
        addBoqItem({
          desc: descStr,
          unit: "nos",
          rate: 2500,
          qtyOverride: pipeCount,
        });
      }
    }
  };
  useEffect(() => {
    if (pipeCount > 0) {
      const timeout = setTimeout(() => {
        handleAddPipesToBOQ();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [pipeCount, pipeSectionLen]);
  return (
    <div className="w-full text-slate-900 font-sans md:p-4">
      <div className="w-full md:max-w-7xl md:mx-auto space-y-8 px-4 md:px-0">
        <div className="space-y-4">
          {/* Manhole Material Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection("manhole")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-[24px] overflow-hidden">
                  <CircleDashed className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Manhole Calculator
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "manhole" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "manhole" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="border-t border-gray-50 bg-gray-50 flex">
                <ManholeModule onStateChange={setMhResults} />
              </div>
            </div>
          </div>
          {/* Trench Excavation Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection("trench")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-[24px] overflow-hidden">
                  <AlignVerticalJustifyStart className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Trench Excavation
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "trench" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "trench" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="grid grid-cols-2 gap-4 h-fit">
                    <div className="col-span-2">
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Length (m)
                      </label>
                      <><label htmlFor="a11y-input-469" className="sr-only">Input</label>
<input id="a11y-input-469" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500/50 min-h-[44px]"
                        value={trenchLength}
                        onChange={(e) => setTrenchLength(e.target.value)}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Bottom Width (m)
                      </label>
                      <><label htmlFor="a11y-input-470" className="sr-only">Input</label>
<input id="a11y-input-470" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500/50 min-h-[44px]"
                        value={trenchWidth}
                        onChange={(e) => setTrenchWidth(e.target.value)}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Depth (m)
                      </label>
                      <><label htmlFor="a11y-input-471" className="sr-only">Input</label>
<input id="a11y-input-471" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500/50 min-h-[44px]"
                        value={trenchDepth}
                        onChange={(e) => setTrenchDepth(e.target.value)}
                      /></>
                    </div>
                    <div className="col-span-2 mt-2 border-t border-gray-100 pt-4">
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Trench Profile
                      </label>
                      <div className="flex bg-gray-100 p-1 rounded-[24px] mb-4 overflow-hidden">
                        <button
                          className={`flex-1 py-2 text-base font-medium rounded-[24px] transition-all ${trenchProfile === "vertical" ? "bg-white text-slate-800 shadow-sm" : "text-slate-700  hover:text-slate-700"}`}
                          onClick={() => setTrenchProfile("vertical")}
                        >
                          Vertical
                        </button>
                        <button
                          className={`flex-1 py-2 text-base font-medium rounded-[24px] transition-all ${trenchProfile === "sloped" ? "bg-white text-slate-800 shadow-sm" : "text-slate-700  hover:text-slate-700"}`}
                          onClick={() => setTrenchProfile("sloped")}
                        >
                          Sloped/Trapezoidal
                        </button>
                      </div>
                    </div>
                    {trenchProfile === "sloped" && (
                      <div className="col-span-2 -mt-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Side Slope (1 Vertical : X Horizontal)
                        </label>
                        <div className="flex items-center gap-3 w-full bg-gray-50/50 border border-gray-200 rounded-[24px] px-4 py-3 focus-within:ring-2 focus-within:ring-amber-500/50 transition-shadow overflow-hidden">
                          <span className="text-slate-700 font-semibold text-sm whitespace-nowrap">1 V :</span>
                          <><label htmlFor="a11y-input-472" className="sr-only">e.g. 0.5</label>
<input id="a11y-input-472" type="number" inputMode="decimal"
                            step="0.1"
                            className="w-full bg-transparent text-slate-800 focus:outline-none -ml-1 text-sm md:text-base font-semibold min-h-[44px] rounded-full"
                            placeholder="e.g. 0.5"
                            value={trenchSlopeRatio}
                            onChange={(e) => setTrenchSlopeRatio(e.target.value)}
                          /></>
                          <span className="text-slate-700 font-semibold text-sm whitespace-nowrap">H</span>
                        </div>
                      </div>
                    )}
                    <div className="col-span-2 mt-2 border-t border-gray-100 pt-4">
                      <h3 className="text-base font-medium mb-3">
                        Backfill Parameters
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                            Pipe Outer Dia (m)
                          </label>
                          <><label htmlFor="a11y-input-473" className="sr-only">Input</label>
<input id="a11y-input-473" type="number" inputMode="decimal"
                            className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500/50 min-h-[44px]"
                            value={pipeOuterDiameter}
                            onChange={(e) =>
                              setPipeOuterDiameter(e.target.value)
                            }
                          /></>
                        </div>
                        <div>
                          <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                            Bedding Depth (m)
                          </label>
                          <><label htmlFor="a11y-input-474" className="sr-only">Input</label>
<input id="a11y-input-474" type="number" inputMode="decimal"
                            className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500/50 min-h-[44px]"
                            value={beddingDepth}
                            onChange={(e) => setBeddingDepth(e.target.value)}
                          /></>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md[0_8px_30px_rgba(15,23,42,0.2)] w-full overflow-hidden group">
                    <h3 className="text-amber-800 font-bold border-b border-amber-200 pb-2">
                      Excavation & Backfill
                    </h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-700 font-medium">
                        Total Excavation Vol
                      </span>
                      <span className="text-amber-900 font-bold text-xl">
                        {trenchVol.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-700 font-medium">
                        Pipe Displacement Vol
                      </span>
                      <span className="text-amber-900 font-bold">
                        {pipeVol.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-700 font-medium">
                        Bedding Volume
                      </span>
                      <span className="text-amber-900 font-bold">
                        {beddingVol.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-amber-200 pt-3 mt-2">
                      <span className="text-amber-800 font-bold text-base">
                        Net Backfill Volume
                      </span>
                      <span className="text-amber-900 font-bold tabular-nums tracking-tight text-2xl whitespace-nowrap">
                        {netBackfillVol.toFixed(2)} m³
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trench Cross-Section Diagram */}
                <div className="w-full mt-8 bg-white border border-gray-100 rounded-[1.5rem] p-4 sm:p-6 flex flex-col items-center shadow-sm overflow-hidden">
                  <h3 className="text-base font-medium uppercase tracking-wider mb-6 flex items-center gap-2">
                    <AlignVerticalJustifyStart className="w-4 h-4" />
                    Trench Cross Section Profile
                  </h3>
                  
                  <div className="w-full max-w-lg relative">
                    <svg viewBox="0 0 500 300" className="w-full h-auto drop-shadow-md">
                      <defs>
                        <pattern id="soil" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="1" fill="#d4af37" opacity="0.3" />
                          <circle cx="10" cy="10" r="1.5" fill="#8b4513" opacity="0.2" />
                          <circle cx="18" cy="4" r="0.8" fill="#a0522d" opacity="0.4" />
                        </pattern>
                        <pattern id="bedding" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="1" fill="#9ca3af" />
                          <circle cx="8" cy="6" r="1.5" fill="#6b7280" />
                          <circle cx="4" cy="8" r="0.8" fill="#4b5563" />
                        </pattern>
                        <pattern id="backfill" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="0" x2="16" y2="16" stroke="#d97706" strokeWidth="1" opacity="0.2" />
                          <line x1="16" y1="0" x2="0" y2="16" stroke="#d97706" strokeWidth="1" opacity="0.2" />
                        </pattern>
                      </defs>

                      {/* Ground level line */}
                      <line x1="20" y1="40" x2="480" y2="40" stroke="#84cc16" strokeWidth="4" strokeLinecap="round" />
                      <line x1="20" y1="44" x2="480" y2="44" stroke="#4d7c0f" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                      
                      {(() => {
                        const isSloped = trenchProfile === "sloped";
                        const wBot = parseFloat(trenchWidth) || 1.5;
                        const d = parseFloat(trenchDepth) || 2.5;
                        const s = parseFloat(trenchSlopeRatio) || 0.5;
                        const wTop = isSloped ? wBot + 2 * (d * s) : wBot;
                        const pipeD = parseFloat(pipeOuterDiameter) || 0.5;
                        const bedD = parseFloat(beddingDepth) || 0.15;

                        // Diagram scaling bounds
                        const svgWidth = 500;
                        const svgHeight = 300;
                        const yTop = 40;
                        const yBot = 260; // diagram trench bottom
                        const h = yBot - yTop;

                        const maxWDraw = 360;
                        const wRatio = wTop > 0 ? maxWDraw / wTop : 1;
                        
                        const drawTopW = maxWDraw;
                        const drawBotW = wBot * wRatio;

                        const x1 = (svgWidth - drawTopW) / 2; // Top Left
                        const x2 = x1 + drawTopW; // Top Right
                        const x4 = (svgWidth - drawBotW) / 2; // Bottom Left
                        const x3 = x4 + drawBotW; // Bottom Right

                        // Pipe scaling
                        const depthRatio = h / d;
                        const pDiaDraw = pipeD * depthRatio;
                        const bDiaDraw = bedD * depthRatio;
                        
                        // Pipe center X and Y
                        const pCX = svgWidth / 2;
                        const pCY = yBot - bDiaDraw - (pDiaDraw / 2);

                        return (
                          <>
                            {/* The Trench Hole (Backfill color) */}
                            <polygon 
                              points={`${x1},${yTop} ${x2},${yTop} ${x3},${yBot} ${x4},${yBot}`}
                              fill="url(#backfill)"
                              stroke="#b45309"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />

                            {/* Bedding Material */}
                            <polygon 
                              points={`
                                ${(x4 + (yBot - (yBot - bDiaDraw)) * ((x1 - x4)/h))},${yBot - bDiaDraw}
                                ${(x3 + (yBot - (yBot - bDiaDraw)) * ((x2 - x3)/h))},${yBot - bDiaDraw}
                                ${x3},${yBot}
                                ${x4},${yBot}
                              `}
                              fill="url(#bedding)"
                              opacity="0.8"
                            />

                            {/* The Pipe */}
                            <circle 
                              cx={pCX} 
                              cy={pCY} 
                              r={pDiaDraw / 2} 
                              fill="#f3f4f6" 
                              stroke="#64748b" 
                              strokeWidth="4" 
                            />
                            {/* Pipe inner hole */}
                            <circle 
                              cx={pCX} 
                              cy={pCY} 
                              r={(pDiaDraw / 2) * 0.8} 
                              fill="#1e293b" 
                            />

                            {/* Annotations */}
                            {/* Total depth line */}
                            <line x1={x1 - 20} y1={yTop} x2={x1 - 20} y2={yBot} stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3"/>
                            <text x={x1 - 25} y={yTop + h/2} fill="#475569" fontSize="12" fontWeight="bold" textAnchor="end" transform={`rotate(-90, ${x1 - 25}, ${yTop + h/2})`}>{d}m Depth</text>

                            {/* Top width line */}
                            <line x1={x1} y1={yTop - 15} x2={x2} y2={yTop - 15} stroke="#64748b" strokeWidth="1.5" />
                            <polygon points={`${x1},${yTop - 15} ${x1+5},${yTop - 18} ${x1+5},${yTop - 12}`} fill="#64748b" />
                            <polygon points={`${x2},${yTop - 15} ${x2-5},${yTop - 18} ${x2-5},${yTop - 12}`} fill="#64748b" />
                            <text x={svgWidth/2} y={yTop - 22} fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">{wTop.toFixed(2)}m Top Width</text>

                            {/* Bottom width line */}
                            <line x1={x4} y1={yBot + 15} x2={x3} y2={yBot + 15} stroke="#64748b" strokeWidth="1.5" />
                            <polygon points={`${x4},${yBot + 15} ${x4+5},${yBot + 18} ${x4+5},${yBot + 12}`} fill="#64748b" />
                            <polygon points={`${x3},${yBot + 15} ${x3-5},${yBot + 18} ${x3-5},${yBot + 12}`} fill="#64748b" />
                            <text x={svgWidth/2} y={yBot + 30} fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle">{wBot}m Bottom W</text>

                            {/* Pipe and Bedding labels */}
                            <line x1={pCX + pDiaDraw/2 + 5} y1={pCY} x2={x2 + 20} y2={pCY} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                            <text x={x2 + 25} y={pCY + 4} fill="#64748b" fontSize="11" fontWeight="600">Pipe ∅{pipeD}m</text>

                            <line x1={pCX + pDiaDraw/2} y1={yBot - bDiaDraw/2} x2={x2 + 20} y2={yBot - bDiaDraw/2} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                            <text x={x2 + 25} y={yBot - bDiaDraw/2 + 4} fill="#64748b" fontSize="11" fontWeight="600">{bedD}m Bedding</text>
                            
                            {/* Slope ratio text if sloped */}
                            {isSloped && (
                              <text x={x1 + 10} y={yTop + 30} fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="start">
                                1V : {s}H
                              </text>
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Invert Level Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection("il")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Invert Level (IL) Calculator
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "il" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "il" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Starting IL (m)
                      </label>
                      <><label htmlFor="a11y-input-475" className="sr-only">Input</label>
<input id="a11y-input-475" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px]"
                        value={startIL}
                        onChange={(e) => setStartIL(e.target.value)}
                      /></>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Length (m)
                        </label>
                        <><label htmlFor="a11y-input-476" className="sr-only">Input</label>
<input id="a11y-input-476" type="number" inputMode="decimal"
                          className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 min-h-[44px]"
                          value={ilLength}
                          onChange={(e) => setIlLength(e.target.value)}
                        /></>
                      </div>
                      <div>
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Gradient (1 in X)
                        </label>
                        <div className="flex items-center bg-gray-50/50 border border-gray-200 rounded-[24px] focus-within:ring-2 focus-within:ring-blue-500/50 overflow-hidden">
                          <div className="px-3 text-sm text-slate-700 font-medium">
                            1 :
                          </div>
                          <><label htmlFor="a11y-input-477" className="sr-only">Input</label>
<input id="a11y-input-477" type="number" inputMode="decimal"
                            className="w-full flex-1 bg-transparent text-slate-800 py-3 pr-4 focus:outline-none min-h-[44px] rounded-full"
                            value={ilGradient}
                            onChange={(e) => setIlGradient(e.target.value)}
                          /></>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md[0_8px_30px_rgba(15,23,42,0.2)] w-full overflow-hidden group">
                    <div className="text-blue-800 text-base font-medium mb-1">
                      Ending Invert Level
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight text-indigo-600 tracking-tighter whitespace-nowrap">
                        {endIL.toFixed(3)}
                      </span>
                      <span className="text-xl font-medium text-blue-500 mb-1">
                        m
                      </span>
                    </div>
                    <div className="text-indigo-600/70 text-sm mt-3 font-medium">
                      Drop:
                      <strong className="text-blue-700">
                        {drop.toFixed(3)} m
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Pipe Sections Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection("pipe")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-[24px] overflow-hidden">
                  <Waves className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Pipe Count Calculator
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "pipe" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "pipe" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 h-fit">
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Total Run Length (m)
                      </label>
                      <><label htmlFor="a11y-input-478" className="sr-only">Input</label>
<input id="a11y-input-478" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 min-h-[44px]"
                        value={pipeLength}
                        onChange={(e) => setPipeLength(e.target.value)}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        One Pipe Section Length (m)
                      </label>
                      <><label htmlFor="a11y-input-479" className="sr-only">Input</label>
<input id="a11y-input-479" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 min-h-[44px]"
                        value={pipeSectionLen}
                        onChange={(e) => setPipeSectionLen(e.target.value)}
                      /></>
                    </div>
                  </div>
                  <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md[0_8px_30px_rgba(15,23,42,0.2)] w-full overflow-hidden group">
                    <div className="text-indigo-800 text-base font-medium mb-1">
                      Required Pipes
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-baseline gap-2 flex-wrap relative z-10">
                        <span className="text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight text-indigo-600 tracking-tighter leading-none">
                          {pipeCount}
                        </span>
                        <span className="text-lg font-medium text-indigo-600">
                          sections
                        </span>
                      </div>
                      <button onClick={handleAddPipesToBOQ}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 hover:-translate-y-0.5"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">Add to BOQ</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Pipe Bedding Calculator Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden mb-8">
            <button
              onClick={() => toggleSection("bedding")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-[24px] overflow-hidden">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Pipe Bedding Calculator
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "bedding" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "bedding" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 h-fit">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Trench Length (m)
                        </label>
                        <><label htmlFor="a11y-input-480" className="sr-only">Input</label>
<input id="a11y-input-480" type="number" inputMode="decimal"
                          className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500/50 min-h-[44px]"
                          value={beddingCalcLength}
                          onChange={(e) => setBeddingCalcLength(e.target.value)}
                        /></>
                      </div>
                      <div>
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Trench Width (m)
                        </label>
                        <><label htmlFor="a11y-input-481" className="sr-only">Input</label>
<input id="a11y-input-481" type="number" inputMode="decimal"
                          className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500/50 min-h-[44px]"
                          value={beddingCalcWidth}
                          onChange={(e) => setBeddingCalcWidth(e.target.value)}
                        /></>
                      </div>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Pipe Outer Dia (m)
                      </label>
                      <><label htmlFor="a11y-input-482" className="sr-only">Input</label>
<input id="a11y-input-482" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500/50 min-h-[44px]"
                        value={beddingCalcPipeOD}
                        onChange={(e) => setBeddingCalcPipeOD(e.target.value)}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Bedding Type / Class
                      </label>
                      <select
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-[24px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500/50 appearance-none overflow-hidden"
                        value={beddingType}
                        onChange={(e) => setBeddingType(e.target.value as any)}
                      >
                        <option value="classA">
                          Class A (Concrete Cradle/Arch)
                        </option>
                        <option value="classB">
                          Class B (Granular Bedding)
                        </option>
                        <option value="classC">
                          Class C (Granular Shaped Bottom)
                        </option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div>
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Depth Under Pipe (m)
                        </label>
                        <><label htmlFor="a11y-input-483" className="sr-only">Input</label>
<input id="a11y-input-483" type="number" inputMode="decimal"
                          className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500/50 min-h-[44px]"
                          value={beddingUnderPipe}
                          onChange={(e) => setBeddingUnderPipe(e.target.value)}
                        /></>
                      </div>
                      <div>
                        <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                          Haunching HT (m)
                        </label>
                        <><label htmlFor="a11y-input-484" className="sr-only">Input</label>
<input id="a11y-input-484" type="number" inputMode="decimal"
                          className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500/50 min-h-[44px]"
                          value={beddingHaunchHeight}
                          onChange={(e) =>
                            setBeddingHaunchHeight(e.target.value)
                          }
                        /></>
                      </div>
                    </div>
                  </div>
                  <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md[0_8px_30px_rgba(15,23,42,0.2)] w-full overflow-hidden group">
                    <h3 className="text-purple-800 font-bold border-b border-purple-200 pb-2">
                      Material Requirements
                    </h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-purple-700 font-medium">
                        Cross-Sectional Area
                      </span>
                      <div className="text-right">
                        <span className="text-purple-900 font-bold">
                          {bedCrossSection.toFixed(4)}
                        </span>
                        <span className="text-purple-600 font-medium text-sm">
                          m²
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-purple-700 font-medium">
                        Total Volume
                      </span>
                      <div className="text-right">
                        <span className="text-purple-900 font-bold text-xl">
                          {beddingCalculatedVol.toFixed(2)}
                        </span>
                        <span className="text-purple-600 font-medium text-sm">
                          m³
                        </span>
                      </div>
                    </div>
                    {(beddingType === "classB" || beddingType === "classC") &&
                      beddingWeightTons > 0 && (
                        <div className="flex justify-between items-center text-sm border-t border-purple-200 pt-3 mt-1">
                          <div className="flex flex-col">
                            <span className="text-purple-700 font-medium">
                              Estimated Weight
                            </span>
                            <span className="text-purple-500 text-[10px]">
                              @ 1600 kg/m³ density
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-purple-900 font-bold tabular-nums tracking-tight text-2xl whitespace-nowrap">
                              {beddingWeightTons.toFixed(2)}
                            </span>
                            <span className="text-purple-600 font-bold">
                              tons
                            </span>
                          </div>
                        </div>
                      )}
                    {beddingType === "classA" && (
                      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 p-3 rounded-[24px] mt-1 overflow-hidden">
                        <p className="text-sm font-medium text-indigo-700">
                          For Class A (Concrete), you typically use low-strength
                          concrete (e.g., M10 or M15).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Hydraulic Flow Calculator Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleSection("flow")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-[24px] overflow-hidden">
                  <Droplet className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Hydraulic Flow Calculator
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "flow" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "flow" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 h-fit">
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Pipe Inner Diameter (m)
                      </label>
                      <><label htmlFor="a11y-input-485" className="sr-only">Input</label>
<input id="a11y-input-485" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-cyan-500/50 min-h-[44px]"
                        value={flowDia}
                        onChange={(e) => setFlowDia(e.target.value)}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Gradient (1 in X)
                      </label>
                      <><label htmlFor="a11y-input-486" className="sr-only">Input</label>
<input id="a11y-input-486" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-cyan-500/50 min-h-[44px]"
                        value={flowGradient}
                        onChange={(e) => setFlowGradient(e.target.value)}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Pipe Material
                      </label>
                      <select
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-[24px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-cyan-500/50 appearance-none overflow-hidden"
                        value={flowMaterial}
                        onChange={(e) => setFlowMaterial(e.target.value as any)}
                      >
                        <option value="pvc">
                          PVC / Plastic (n=0.009)
                        </option>
                        <option value="concrete">Concrete (n=0.013)</option>
                        <option value="cast_iron">Cast Iron (n=0.014)</option>
                        <option value="clay">
                          Clay / Ceramic (n=0.015)
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md[0_8px_30px_rgba(15,23,42,0.2)] w-full overflow-hidden group">
                    <h3 className="text-cyan-800 font-bold border-b border-cyan-200 pb-2">
                      Full-Bore Flow Characteristics
                    </h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cyan-700 font-medium">
                        Flow Velocity
                      </span>
                      <div className="text-right">
                        <span className="text-cyan-900 font-bold text-xl">
                          {flowVelocity.toFixed(3)}
                        </span>
                        <span className="text-cyan-600 font-medium text-sm">
                          m/s
                        </span>
                      </div>
                    </div>
                    {flowVelocity > 0 && flowVelocity < 0.6 && (
                      <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-[24px] mt-1 overflow-hidden">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                        <p className="text-sm font-medium">
                          Warning: Calculated velocity is below the typical
                          self-cleansing velocity of 0.6 m/s. Siltation may
                          occur.
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-cyan-700 font-medium">
                        Discharge Capacity
                      </span>
                      <div className="text-right">
                        <span className="text-cyan-900 font-bold text-lg">
                          {dischargeCapacityM3.toFixed(4)}
                        </span>
                        <span className="text-cyan-600 font-medium text-sm">
                          m³/s
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-cyan-200 pt-3 mt-1">
                      <span className="text-cyan-700 font-medium">
                        Discharge (Liters/sec)
                      </span>
                      <div className="text-right">
                        <span className="text-cyan-900 font-bold tabular-nums tracking-tight text-2xl whitespace-nowrap">
                          {dischargeCapacityL.toFixed(2)}
                        </span>
                        <span className="text-cyan-600 font-bold">
                          L/s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Septic System Sizing Calculator Accordion */}
          <div className="w-full bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden mb-8">
            <button
              onClick={() => toggleSection("septic")}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-[24px] overflow-hidden">
                  <Waves className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Septic System Sizing Calculator
                </h2>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-700  transition-transform duration-300 ${openSection === "septic" ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`transition-all duration-500 ease-in-out ${openSection === "septic" ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
            >
              <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 h-fit">
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Number of Users
                      </label>
                      <><label htmlFor="a11y-input-487" className="sr-only">Input</label>
<input id="a11y-input-487" type="number" inputMode="decimal"
                        min="0"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px]"
                        value={septicUsers}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val < 0) return;
                          setSepticUsers(e.target.value);
                        }}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Per Capita Water Demand (L/day)
                      </label>
                      <><label htmlFor="a11y-input-488" className="sr-only">Input</label>
<input id="a11y-input-488" type="number" inputMode="decimal"
                        min="0"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px]"
                        value={septicDemand}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val < 0) return;
                          setSepticDemand(e.target.value);
                        }}
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium uppercase tracking-wider mb-1.5 ml-1">
                        Soil Percolation Rate (L/m²/day)
                      </label>
                      <><label htmlFor="a11y-input-489" className="sr-only">Input</label>
<input id="a11y-input-489" type="number" inputMode="decimal"
                        min="0"
                        step="any"
                        className="w-full bg-gray-50/50 border border-gray-200 text-slate-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-emerald-500/50 min-h-[44px]"
                        value={septicPercolation}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val < 0) return;
                          setSepticPercolation(e.target.value);
                        }}
                      /></>
                    </div>
                  </div>
                  <div className="flex flex-col h-full">
                    <MaterialSummary
                      title="Septic Tank Dimensions"
                      totalLabel="Calculated Volume (24h retention + sludge)"
                      totalValue={septicTotalVolM3.toFixed(2)}
                      totalUnit="m³"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <ResultCard
                          title="Length"
                          value={septicLength.toFixed(2)}
                          unit="m"
                          variant="neutral"
                        />
                        <ResultCard
                          title="Width"
                          value={septicWidth.toFixed(2)}
                          unit="m"
                          variant="neutral"
                        />
                        <ResultCard
                          title="Liquid Depth"
                          value={septicDepth.toFixed(2)}
                          unit="m"
                          variant="neutral"
                        />
                      </div>
                      
                      <h4 className="font-bold text-slate-900 dark:text-white mt-6 mb-4 flex items-center gap-2">
                        Soakage Pit Dimensions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ResultCard
                          title="Req. Sidewall Area"
                          value={soakageAreaRequired.toFixed(2)}
                          unit="m²"
                          variant="primary"
                        />
                        <ResultCard
                          title="Diameter"
                          value={soakageDia.toFixed(2)}
                          unit="m"
                          variant="neutral"
                        />
                        <ResultCard
                          title="Depth"
                          value={soakageDepth.toFixed(2)}
                          unit="m"
                          variant="neutral"
                        />
                      </div>
                    </MaterialSummary>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CalculationHistory
        calculatorId="sewerage_v1"
        estimationName="Sewerage Calculation"
        currentInputs={{
          openSection, trenchLength, trenchWidth, trenchDepth, pipeOuterDiameter, beddingDepth
        }}
        currentResults={{
          dischargeCapacityL: dischargeCapacityL.toFixed(2),
          septicTotalVolM3: septicTotalVolM3.toFixed(2),
          soakageAreaRequired: soakageAreaRequired.toFixed(2)
        }}
        summaryGeneration={(inputs, res) => `Flow: ${res.dischargeCapacityL} L/s`}
        onRestore={(inputs) => {
          if (inputs.openSection) setOpenSection(inputs.openSection);
          if (inputs.trenchLength) setTrenchLength(inputs.trenchLength);
          if (inputs.trenchWidth) setTrenchWidth(inputs.trenchWidth);
          if (inputs.trenchDepth) setTrenchDepth(inputs.trenchDepth);
          if (inputs.pipeOuterDiameter) setPipeOuterDiameter(inputs.pipeOuterDiameter);
          if (inputs.beddingDepth) setBeddingDepth(inputs.beddingDepth);
        }}
      />
    </div>
  );
}
