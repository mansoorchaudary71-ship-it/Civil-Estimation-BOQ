import React, { useState } from "react";
import { CIVIL_CONSTANTS } from "../../utils/unitConverter";
import {
  Copy,
  Droplet,
  Box,
  Hammer,
  Columns,
  Container,
  Spline,
  Calculator,
  Save,
  Clock,
  HelpCircle,
  Layers,
  PaintBucket,
  Scaling,
} from "lucide-react";
import { useGlobalSettings } from "../../context/SettingsContext";
import { useEstimateProcessing } from "../../hooks/useEstimateProcessing";
import { BatchInputMode, BatchColumn } from "../ui/BatchInputMode";
import {
  ConcreteMortarCalculator,
  BrickworkCalculator,
  PlasterCalculator,
  SteelCalculator,
} from "../../utils/calculators";

import UnitToggleGroup from "../ui/UnitToggleGroup";
import MasterQuantityEstimator from "./MasterQuantityEstimator";
import { useAuth } from "../../contexts/AuthContext";
import Brickwork9InchModule from "./Brickwork9InchModule";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { SEO } from "../SEO";

export default function ConstructionMaterialEstimator({ forcedTab, hideHeader }: { forcedTab?: "master" | "concrete" | "bricks" | "blocks" | "plaster" | "bricks-blocks" | "steel"; hideHeader?: boolean } = {}) {
  const { formatCurrency, currentUnit, setCurrentUnit, currentCurrency } = useGlobalSettings();
  const { user } = useAuth();
  const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing();
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Construction Material Estimator",
    "applicationCategory": "BusinessApplication",
    "description": "Calculate exact material requirements like cement, sand, and aggregate for brickwork, plaster, and concrete.",
    "operatingSystem": "All"
  };
  
  const isSI = currentUnit === "Metric";
  const unitFt = isSI ? "m" : "ft";
  const unitIn = isSI ? "cm" : "in";
  const unitVol = isSI ? "m³" : "ft³";
  const unitArea = isSI ? "m²" : "sq.ft";
  const tabs = [
    { id: "master", label: "Master Quantities", icon: Calculator },
    { id: "concrete", label: "Concrete", icon: Box },
    { id: "bricks", label: "Bricks", icon: Columns },
    { id: "blocks", label: "Blocks", icon: Container },
    { id: "plaster", label: "Finishes", icon: PaintBucket },
    { id: "steel", label: "Steel", icon: Layers },
    { id: "water", label: "Water", icon: Droplet },
  ] as const;
  const [showCost, setShowCost] = useState(false);
  const [rates, setRates] = useState({
    cement: 1200,
    sand: 60,
    aggregate: 80,
    water: 1,
    steel: 260,
    bricks: 15,
    blocks: 50,
  });
  const fullTabs = [
    ...tabs,
    { id: "cement", label: "Cement", icon: Box },
    { id: "sand", label: "Sand", icon: Scaling },
  ] as const;
  type TabId = (typeof fullTabs)[number]["id"] | "bricks-blocks";
  const [activeTab, setActiveTab] = useState<TabId>(forcedTab || "master");
  const [concreteType, setConcreteType] = useState<"slab" | "column" | "staircase">("slab");
  const [finishesType, setFinishesType] = useState<"plaster" | "paint" | "antitermite">("plaster");
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  /* Project Cart state */ interface CartItem {
    id: string;
    name: string;
    type: string;
    cementBags: number;
    sandVol: number;
    aggregateVol: number;
    waterLiters: number;
    steelKg?: number;
    bricksCount?: number;
    blocksCount?: number;
    unitVol: string;
    rawExport: Record<string, any>;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [elementName, setElementName] = useState<string>("");
  /* Global inputs */ const [wastage, setWastage] = useState("5");
  /* Concrete - Slab */ const [cLength, setCLength] = useState("10");
  const [cWidth, setCWidth] = useState("10");
  const [cDepth, setCDepth] = useState(isSI ? "0.15" : "0.5");
  /* Concrete - Column */ const [cColDia, setCColDia] = useState(isSI ? "0.3" : "1");
  const [cColHeight, setCColHeight] = useState(isSI ? "3" : "10");
  /* Concrete - Staircase */ const [cStairSteps, setCStairSteps] = useState("15");
  const [cStairTread, setCStairTread] = useState(isSI ? "0.25" : "0.82");
  const [cStairRiser, setCStairRiser] = useState(isSI ? "0.15" : "0.5");
  const [cStairWidth, setCStairWidth] = useState(isSI ? "1.2" : "4");
  const [cStairWaist, setCStairWaist] = useState(isSI ? "0.15" : "0.5");
  const [cMix, setCMix] = useState("1:2:4");
  const [cWcRatio, setCWcRatio] = useState("0.5");
  /* Bricks */ const [bWallL, setBWallL] = useState("20");
  const [bWallH, setBWallH] = useState("10");
  const [bWallT, setBWallT] = useState(isSI ? "22" : "9");
  /* cm or inches */ interface Opening {
    id: string;
    type: "Door" | "Window" | "Ventilator";
    quantity: number;
    length: number;
    height: number;
  }
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [newOpening, setNewOpening] = useState<Omit<Opening, "id">>({
    type: "Door",
    quantity: 1,
    length: 0,
    height: 0,
  });
  const [brickL, setBrickL] = useState(isSI ? "22.8" : "9");
  /* cm or inches */ const [brickW, setBrickW] = useState(
    isSI ? "11.4" : "4.5",
  );
  const [brickH, setBrickH] = useState(isSI ? "7.6" : "3");
  const [bJoint, setBJoint] = useState(isSI ? "1" : "0.39");
  /* cm or inches */ const [bMix, setBMix] = useState("1:4");
  /* Blocks */ const [blockL, setBlockL] = useState(isSI ? "40" : "16");
  /* cm or inches */ const [blockW, setBlockW] = useState(isSI ? "20" : "8");
  const [blockH, setBlockH] = useState(isSI ? "20" : "8");
  const [blockJoint, setBlockJoint] = useState(isSI ? "1" : "0.39");
  /* Plaster */ const [pArea, setPArea] = useState("200");
  const [pThick, setPThick] = useState(isSI ? "1.2" : "0.5");
  /* cm or in */ const [pMix, setPMix] = useState("1:4");
  const [pLocation, setPLocation] = useState<"Internal" | "External">("Internal");
  /* Paint */ const [paintArea, setPaintArea] = useState("500");
  const [paintCoats, setPaintCoats] = useState("2");
  /* Anti-Termite */ const [termiteArea, setTermiteArea] = useState("1000");
  /* Steel */ const [sDia, setSDia] = useState("12");
  /* mm */ const [sSpan, setSSpan] = useState("10");
  /* m or ft */ const [sSpace, setSSpace] = useState("150");
  /* mm or inches */ const [sBarL, setSBarL] = useState(isSI ? "12" : "40");
  /* m or ft */ const [sOverlap, setSOverlap] = useState("50");
  /* Water */ const [wCementKg, setWCementKg] = useState("50");
  const [wWcRatio, setWWcRatio] = useState("0.5");
  React.useEffect(() => {
    if (currentUnit === "Metric") {
      setCDepth("0.15");
      setBWallT("22");
      setBWallL("5");
      setBWallH("3");
      setBrickL("22.8");
      setBrickW("11.4");
      setBrickH("7.6");
      setBJoint("1");
      setBlockL("40");
      setBlockW("20");
      setBlockH("20");
      setBlockJoint("1");
      setPThick("1.2");
      setSBarL("12");
      setSDia("12");
      setSSpace("150");
    } else {
      setCDepth("0.5");
      setBWallT("9");
      setBWallL("20");
      setBWallH("10");
      setBrickL("9");
      setBrickW("4.5");
      setBrickH("3");
      setBJoint("0.39");
      setBlockL("16");
      setBlockW("8");
      setBlockH("8");
      setBlockJoint("0.39");
      setPThick("0.5");
      setSBarL("40");
      setSDia("4");
      setSSpace("6");
    }
  }, [currentUnit]);
  const parseNum = (val: string) => parseFloat(val) || 0;
  let content = null;
  let currentExportData: Record<string, any> = {};
  let currentExportInputs: Record<string, any> = {};
  let currentCartItem: Omit<CartItem, "id" | "name"> | null = null;
  if (activeTab === "concrete") {
    let volume = 0;
    
    if (concreteType === "slab") {
      volume = parseNum(cLength) * parseNum(cWidth) * parseNum(cDepth);
    } else if (concreteType === "column") {
      const r = parseNum(cColDia) / 2;
      volume = Math.PI * r * r * parseNum(cColHeight);
    } else if (concreteType === "staircase") {
      const steps = parseNum(cStairSteps);
      const tread = parseNum(cStairTread);
      const riser = parseNum(cStairRiser);
      const width = parseNum(cStairWidth);
      const waist = parseNum(cStairWaist);
      
      const stepVol = steps * (0.5 * tread * riser * width);
      const flightLen = steps * Math.sqrt(tread * tread + riser * riser);
      const waistVol = flightLen * waist * width;
      volume = stepVol + waistVol;
    }
    
    // Fake L=volume, W=1, D=1 to reuse the calculator
    const calc = new ConcreteMortarCalculator(
      volume,
      1,
      1,
      cMix,
      parseNum(wastage),
      parseNum(cWcRatio),
      isSI,
    );
    const res = calc.calculate();

    const titlePrefix = concreteType === "column" ? "Round Column" : concreteType === "staircase" ? "Stair Case" : "Standard Slab";

    currentExportInputs = {
      Type: titlePrefix,
      "Mix Ratio": cMix,
      "W/C Ratio": cWcRatio,
      "Wastage Allowed": `${wastage}%`,
      ...(concreteType === "slab" ? {
        Dimensions: `Length: ${cLength} ${unitFt} | Width: ${cWidth} ${unitFt} | Depth: ${cDepth} ${unitFt}`,
      } : concreteType === "column" ? {
        Dimensions: `Diameter: ${cColDia} ${unitFt} | Height: ${cColHeight} ${unitFt}`
      } : {
        Dimensions: `Steps: ${cStairSteps} | Width: ${cStairWidth} ${unitFt} | Tread: ${cStairTread} ${unitFt} | Riser: ${cStairRiser} ${unitFt} | Waist: ${cStairWaist} ${unitFt}`
      })
    };
    currentExportData = {
      "Type": titlePrefix,
      "Concrete Mixed Volume": `${res.totalWetVolume.toFixed(2)} ${unitVol}`,
      [`Dry Volume (+${wastage}% waste)`]: `${(res.totalWetVolume * CIVIL_CONSTANTS.DRY_CONCRETE_FACTOR * (1 + parseNum(wastage) / 100)).toFixed(2)} ${unitVol}`,
      "Cement Required": `${res.cementBags.toFixed(2)} Bags`,
      "Sand Required": `${res.sandVol.toFixed(2)} ${unitVol}`,
      "Aggregate Required": `${res.aggregateVol.toFixed(2)} ${unitVol}`,
      "Water Required": isSI ? `${res.waterLiters.toFixed(1)} Liters` : `${(res.waterLiters / 3.78541).toFixed(1)} Gallons`,
    };
    currentCartItem = {
      type: "Concrete",
      cementBags: res.cementBags,
      sandVol: res.sandVol,
      aggregateVol: res.aggregateVol,
      waterLiters: res.waterLiters,
      unitVol,
      rawExport: currentExportData,
    };
    content = (
      <div className="space-y-6 bg-transparent/50 px-4 py-3 rounded-[24px] border w-full relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h3 className="text-slate-900 dark:text-white text-lg font-medium text-slate-800 mb-4">
              Concrete Estimator
            </h3>
            <UnitToggleGroup
              units={[
                { id: "Metric", label: "Metric (m³, L)" },
                { id: "Imperial", label: "Imperial (ft³, gal)" },
              ]}
              activeUnit={currentUnit || "Metric"}
              onChange={(u) => setCurrentUnit(u as "Metric" | "Imperial")}
              size="sm"
              colorTheme="blue"
            />
          </div>
          <div className="flex bg-white p-1 rounded-[24px] w-full sm:w-auto overflow-hidden">
            {(["slab", "column", "staircase"] as const).map((type) => (
              <button
                key={type}
                onClick={() => { 
                  setConcreteType(type); 
                  if(hasData) resetEstimate(); 
                  
                  // Suggest standard concrete grades based on structural member
                  if (type === "slab") setCMix("1:1.5:3"); // M20 is standard for slabs
                  else if (type === "column") setCMix("1:1.5:3"); // M20+ is standard for columns
                  else if (type === "staircase") setCMix("1:2:4"); // M15/M20 can be used
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-[24px] text-base font-medium transition-all ${
                  concreteType === type 
                    ? "bg-white  shadow-sm text-indigo-600 " 
                    : "text-slate-500 hover:text-slate-700 "
                }`}
              >
                {type === "slab" ? "Slab" : type === "column" ? "Round Column" : "Staircase"}
              </button>
            ))}
          </div>
        </div>

        {concreteType === "slab" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Length ({unitFt})
              </label>
              <><label htmlFor="a11y-input-138" className="sr-only">Input</label>
<input id="a11y-input-138"
                type="number" inputMode="decimal"
                value={cLength}
                onChange={(e) => setCLength(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Width ({unitFt})
              </label>
              <><label htmlFor="a11y-input-139" className="sr-only">Input</label>
<input id="a11y-input-139"
                type="number" inputMode="decimal"
                value={cWidth}
                onChange={(e) => setCWidth(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Depth ({unitFt})
              </label>
              <><label htmlFor="a11y-input-140" className="sr-only">Input</label>
<input id="a11y-input-140"
                type="number" inputMode="decimal"
                value={cDepth}
                onChange={(e) => setCDepth(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
        )}

        {concreteType === "column" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Diameter ({unitFt})
              </label>
              <><label htmlFor="a11y-input-141" className="sr-only">Input</label>
<input id="a11y-input-141"
                type="number" inputMode="decimal"
                value={cColDia}
                onChange={(e) => setCColDia(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Height ({unitFt})
              </label>
              <><label htmlFor="a11y-input-142" className="sr-only">Input</label>
<input id="a11y-input-142"
                type="number" inputMode="decimal"
                value={cColHeight}
                onChange={(e) => setCColHeight(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
        )}

        {concreteType === "staircase" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Number of Steps
              </label>
              <><label htmlFor="a11y-input-143" className="sr-only">Input</label>
<input id="a11y-input-143"
                type="number" inputMode="decimal"
                value={cStairSteps}
                onChange={(e) => setCStairSteps(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Stair Width ({unitFt})
              </label>
              <><label htmlFor="a11y-input-144" className="sr-only">Input</label>
<input id="a11y-input-144"
                type="number" inputMode="decimal"
                value={cStairWidth}
                onChange={(e) => setCStairWidth(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Tread Length ({unitFt})
              </label>
              <><label htmlFor="a11y-input-145" className="sr-only">Input</label>
<input id="a11y-input-145"
                type="number" inputMode="decimal"
                value={cStairTread}
                onChange={(e) => setCStairTread(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Riser Height ({unitFt})
              </label>
              <><label htmlFor="a11y-input-146" className="sr-only">Input</label>
<input id="a11y-input-146"
                type="number" inputMode="decimal"
                value={cStairRiser}
                onChange={(e) => setCStairRiser(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Waist Slab Thick ({unitFt})
              </label>
              <><label htmlFor="a11y-input-147" className="sr-only">Input</label>
<input id="a11y-input-147"
                type="number" inputMode="decimal"
                value={cStairWaist}
                onChange={(e) => setCStairWaist(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
        )}
        <div className="bg-blue-50/50 rounded-[24px] px-4 py-3 border border-blue-100 flex items-center justify-center min-h-[8rem] relative text-base font-medium text-blue-500/80 overflow-hidden">
          <svg
            viewBox="0 0 120 80"
            className="w-full h-full absolute inset-0 opacity-20 pointer-events-none"
          >
            <path d="M30,50 L90,50 L105,30 L45,30 Z" fill="currentColor" />
            <path
              d="M30,50 L30,60 L90,60 L90,50 M90,60 L105,40 L105,30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 bg-blue-50">
            L {cLength}
          </span>
          <span className="absolute right-10 top-6 px-2 bg-blue-50">
            W {cWidth}
          </span>
          <span className="absolute left-8 bottom-6 px-2 bg-blue-50">
            D {cDepth}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center">
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Mix Ratio
              </label>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Standard: {concreteType === 'slab' || concreteType === 'column' ? 'M20' : 'M15/M20'}
              </span>
            </div>
            <select
              value={cMix}
              onChange={(e) => setCMix(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-[24px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm overflow-hidden"
            >
              <option value="1:5:10">1:5:10 (M5)</option>
              <option value="1:4:8">1:4:8 (M7.5)</option>
              <option value="1:3:6">1:3:6 (M10)</option>
              <option value="1:2:4">1:2:4 (M15)</option>
              <option value="1:1.5:3">1:1.5:3 (M20)</option>
              <option value="1:1:2">1:1:2 (M25)</option>
            </select>
          </div>
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              W/C Ratio (0.45-0.6)
            </label>
            <><label htmlFor="a11y-input-148" className="sr-only">Input</label>
<input id="a11y-input-148"
              type="number" inputMode="decimal"
              step="0.01"
              value={cWcRatio}
              onChange={(e) => setCWcRatio(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
        </div>
      </div>
    );
  } else if (activeTab === "bricks" || activeTab === "blocks") {
    const l = activeTab === "bricks" ? brickL : blockL;
    const w = activeTab === "bricks" ? brickW : blockW;
    const h = activeTab === "bricks" ? brickH : blockH;
    const j = activeTab === "bricks" ? bJoint : blockJoint;
    /* Convert cm/inches to appropriate units in calculator */ /* The calculator expects base units for wall (like meters or feet) but the brick dimensions are in cm or inches. Our calculator code expects everything mathematically scaled? Wait, let's normalize everything to the base unit (Meters or Feet). */ const conv =
      isSI ? 100 : 12;
    /* cm to m, or inches to feet */ const totalDeductionArea = openings.reduce(
      (acc, op) => acc + op.quantity * op.length * op.height,
      0,
    );
    const calc = new BrickworkCalculator(
      parseNum(bWallL),
      parseNum(bWallH),
      parseNum(bWallT) / conv,
      totalDeductionArea,
      parseNum(l) / conv,
      parseNum(w) / conv,
      parseNum(h) / conv,
      parseNum(j) / conv,
      bMix,
      parseNum(wastage),
      isSI,
    );
    const res = calc.calculate();
    const setL = activeTab === "bricks" ? setBrickL : setBlockL;
    const setW = activeTab === "bricks" ? setBrickW : setBlockW;
    const setH = activeTab === "bricks" ? setBrickH : setBlockH;
    const setJ = activeTab === "bricks" ? setBJoint : setBlockJoint;
    currentExportInputs = {
      "Wall Dimensions": `L: ${bWallL} ${unitFt} | H: ${bWallH} ${unitFt} | T: ${bWallT} ${unitIn}`,
      "Deductions Area": `${totalDeductionArea.toFixed(2)} ${unitArea}`,
      "Unit Dimensions": `L: ${l} ${unitIn} | W: ${w} ${unitIn} | H: ${h} ${unitIn}`,
      "Mortar Joint": `${j} ${unitIn}`,
      "Mix Ratio": bMix,
      "Wastage Allowed": `${wastage}%`,
    };
    currentExportData = {
      "Net Wall Volume": `${res.netWallVol.toFixed(2)} ${unitVol}`,
      "Total Units Required": `${res.numBricks} nos`,
      "Mortar Volume": `${res.mortarWetVol.toFixed(2)} ${unitVol}`,
      "Cement Required": `${res.cementBags.toFixed(2)} Bags`,
      "Sand Required": `${res.sandVol.toFixed(2)} ${unitVol}`,
    };
    currentCartItem = {
      type: activeTab === "bricks" ? "Bricks" : "Blocks",
      cementBags: res.cementBags,
      sandVol: res.sandVol,
      aggregateVol: 0,
      waterLiters: 0,
      bricksCount: activeTab === "bricks" ? res.numBricks : undefined,
      blocksCount: activeTab === "blocks" ? res.numBricks : undefined,
      unitVol,
      rawExport: currentExportData,
    } as any;
    content =
      activeTab === "bricks" ? (
        <Brickwork9InchModule hideHistory={true} />
      ) : (
        <div className="space-y-6 bg-transparent/50 px-4 py-3 rounded-[24px] border w-full overflow-hidden">
          <h3 className="border-b pb-2 uppercase st text-lg font-medium text-slate-800 mb-4">
            {activeTab} Wall
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Wall Length ({unitFt})
              </label>
              <><label htmlFor="a11y-input-149" className="sr-only">Input</label>
<input id="a11y-input-149"
                type="number" inputMode="decimal"
                value={bWallL}
                onChange={(e) => setBWallL(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Wall Height ({unitFt})
              </label>
              <><label htmlFor="a11y-input-150" className="sr-only">Input</label>
<input id="a11y-input-150"
                type="number" inputMode="decimal"
                value={bWallH}
                onChange={(e) => setBWallH(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Wall Thick ({unitIn})
              </label>
              <><label htmlFor="a11y-input-151" className="sr-only">Input</label>
<input id="a11y-input-151"
                type="number" inputMode="decimal"
                value={bWallT}
                onChange={(e) => setBWallT(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
          <div className="bg-amber-50/50 rounded-[24px] px-4 py-3 border border-amber-100 flex items-center justify-center min-h-[8rem] relative text-base font-medium text-amber-600/80 overflow-hidden">
            <svg
              viewBox="0 0 120 80"
              className="w-full h-full absolute inset-0 opacity-20 pointer-events-none"
            >
              <path
                d="M20,60 L80,60 L80,20 L20,20 Z"
                fill="currentColor"
              />
              <path
                d="M80,60 L95,45 L95,5 L80,20 M20,20 L35,5 L95,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 bg-amber-50">
              L {bWallL}
            </span>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 px-2 bg-amber-50">
              H {bWallH}
            </span>
            <span className="absolute right-10 bottom-6 px-2 bg-amber-50">
              T {bWallT}
            </span>
          </div>
          <div className="bg-white px-4 py-3 rounded-[24px] border overflow-hidden">
            <h4 className="text-sm uppercase flex justify-between items-center mb-4 text-lg font-medium text-slate-800">
              Add Deductions
              <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-sm">
                Total:
                {openings
                  .reduce(
                    (acc, op) => acc + op.quantity * op.length * op.height,
                    0,
                  )
                  .toFixed(2)}
                {unitArea}
              </span>
            </h4>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-2">
                <select
                  className="bg-transparent border p-2 rounded-[16px] text-base font-normal"
                  value={newOpening.type}
                  onChange={(e) =>
                    setNewOpening({
                      ...newOpening,
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="Door">Door</option>
                  <option value="Window">Window</option>
                  <option value="Ventilator">Ventilator</option>
                </select>
                <div>
                  <><label htmlFor="a11y-input-152" className="sr-only">Qty</label>
<input id="a11y-input-152"
                    type="number" inputMode="decimal"
                    placeholder="Qty"
                    value={newOpening.quantity || ""}
                    onChange={(e) =>
                      setNewOpening({
                        ...newOpening,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
                  /></>
                </div>
                <div>
                  <><label htmlFor="a11y-input-153" className="sr-only">Input</label>
<input id="a11y-input-153"
                    type="number" inputMode="decimal"
                    placeholder={`L (${unitFt})`}
                    value={newOpening.length || ""}
                    onChange={(e) =>
                      setNewOpening({
                        ...newOpening,
                        length: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
                  /></>
                </div>
                <div>
                  <><label htmlFor="a11y-input-154" className="sr-only">Input</label>
<input id="a11y-input-154"
                    type="number" inputMode="decimal"
                    placeholder={`H (${unitFt})`}
                    value={newOpening.height || ""}
                    onChange={(e) =>
                      setNewOpening({
                        ...newOpening,
                        height: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
                  /></>
                </div>
              </div>
              <button
                onClick={() => {
                  if (
                    newOpening.quantity &&
                    newOpening.length &&
                    newOpening.height
                  ) {
                    setOpenings([
                      ...openings,
                      {
                        ...newOpening,
                        id: Math.random().toString(36).substr(2, 9),
                      } as Opening,
                    ]);
                    setNewOpening({
                      type: "Door",
                      quantity: 1,
                      length: 0,
                      height: 0,
                    });
                  }
                }}
                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-full text-base font-medium hover:bg-indigo-50 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                disabled={
                  !newOpening.quantity ||
                  !newOpening.length ||
                  !newOpening.height
                }
              >
                + Add Opening
              </button>
            </div>
            {openings.length > 0 && (
              <div className="mt-4 space-y-2">
                {openings.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between bg-transparent p-2 rounded text-sm"
                  >
                    <span className="font-semibold text-slate-600">
                      {op.quantity}x {op.type}
                    </span>
                    <span className="text-slate-700">
                      {op.length}×{op.height} {unitFt}
                    </span>
                    <span className="font-bold text-slate-700">
                      {(op.quantity * op.length * op.height).toFixed(2)}
                      {unitArea}
                    </span>
                    <button
                      onClick={() =>
                        setOpenings(openings.filter((o) => o.id !== op.id))
                      }
                      className="text-red-400 hover:text-red-600 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <h3 className="border-b pb-2 pt-4 uppercase st text-lg font-medium text-slate-800 mb-4">
            Unit Dimensions ({unitIn})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Length
              </label>
              <><label htmlFor="a11y-input-155" className="sr-only">Input</label>
<input id="a11y-input-155"
                type="number" inputMode="decimal"
                value={l}
                onChange={(e) => setL(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Width
              </label>
              <><label htmlFor="a11y-input-156" className="sr-only">Input</label>
<input id="a11y-input-156"
                type="number" inputMode="decimal"
                value={w}
                onChange={(e) => setW(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Height
              </label>
              <><label htmlFor="a11y-input-157" className="sr-only">Input</label>
<input id="a11y-input-157"
                type="number" inputMode="decimal"
                value={h}
                onChange={(e) => setH(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Joint Thick ({unitIn})
              </label>
              <><label htmlFor="a11y-input-158" className="sr-only">Input</label>
<input id="a11y-input-158"
                type="number" inputMode="decimal"
                value={j}
                onChange={(e) => setJ(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Mortar Mix
              </label>
              <select
                value={bMix}
                onChange={(e) => setBMix(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-[24px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm overflow-hidden"
              >
                <option value="1:3">1:3</option>
                <option value="1:4">1:4</option>
                <option value="1:5">1:5</option>
                <option value="1:6">1:6</option>
              </select>
            </div>
          </div>
        </div>
      );
  } else if (activeTab === "steel") {
    const calc = new SteelCalculator(
      parseNum(sDia),
      parseNum(sSpan),
      parseNum(sSpace),
      parseNum(sBarL),
      parseNum(sOverlap),
      1,
      parseNum(wastage),
      isSI,
    );
    const res = calc.calculate();
    currentExportInputs = {
      "Bar Diameter": `${sDia} mm/in#`,
      "Span/Length": `${sSpan} ${unitFt}`,
      Spacing: `${sSpace} mm/in`,
      "Standard Bar Length": `${sBarL} ${unitFt}`,
      "Overlap Factor": `${sOverlap}xD`,
      "Wastage Allowed": `${wastage}%`,
    };
    currentExportData = {
      "Total Bars Needed": `${res.numBars} nos`,
      "Weight per Unit": `${res.weightPerUnitLength.toFixed(3)} kg`,
      "Total Cut Length": `${res.totalLengthAllBars.toFixed(2)} ${unitFt}`,
      "Total Weight": `${res.totalWeightKg.toFixed(1)} kg`,
    };
    currentCartItem = {
      type: "Steel",
      cementBags: 0,
      sandVol: 0,
      aggregateVol: 0,
      waterLiters: 0,
      steelKg: res.totalWeightKg,
      unitVol,
      rawExport: currentExportData,
    };
    content = (
      <div className="space-y-6 bg-transparent/50 px-4 py-3 rounded-[24px] border w-full overflow-hidden">
        <h3 className="border-b pb-2 uppercase st text-lg font-medium text-slate-800 mb-4">
          Steel Reinforcement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              Bar Dia (mm/in#)
            </label>
            <><label htmlFor="a11y-input-159" className="sr-only">Input</label>
<input id="a11y-input-159"
              type="number" inputMode="decimal"
              value={sDia}
              onChange={(e) => setSDia(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              Span Length ({unitFt})
            </label>
            <><label htmlFor="a11y-input-160" className="sr-only">Input</label>
<input id="a11y-input-160"
              type="number" inputMode="decimal"
              value={sSpan}
              onChange={(e) => setSSpan(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
          <div>
            <label
              className="uppercase text-sm font-medium text-slate-700 mb-1 block"
              title="Center-to-center spacing"
            >
              Spacing c/c ({isSI ? "mm" : "inch"})
            </label>
            <><label htmlFor="a11y-input-161" className="sr-only">Input</label>
<input id="a11y-input-161"
              type="number" inputMode="decimal"
              value={sSpace}
              onChange={(e) => setSSpace(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              Standard Bar Length ({unitFt})
            </label>
            <><label htmlFor="a11y-input-162" className="sr-only">Input</label>
<input id="a11y-input-162"
              type="number" inputMode="decimal"
              value={sBarL}
              onChange={(e) => setSBarL(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              Overlap Factor (xD)
            </label>
            <><label htmlFor="a11y-input-163" className="sr-only">Input</label>
<input id="a11y-input-163"
              type="number" inputMode="decimal"
              value={sOverlap}
              onChange={(e) => setSOverlap(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
        </div>
      </div>
    );
  } else if (activeTab === "plaster") {
    if (finishesType === "plaster") {
      const conv = isSI ? 100 : 12;
      const calc = new PlasterCalculator(
        parseNum(pArea),
        parseNum(pThick) / conv,
        pMix,
        parseNum(wastage),
        isSI,
      );
      const res = calc.calculate();
      currentExportInputs = {
        Type: "Plastering",
        "Location": pLocation,
        "Surface Area": `${pArea} ${unitArea}`,
        Thickness: `${pThick} ${unitIn}`,
        "Mix Ratio": pMix,
        "Wastage Allowed": `${wastage}%`,
      };
      currentExportData = {
        "Type": "Plaster",
        "Total Wet Volume": `${res.totalWetVolume.toFixed(2)} ${unitVol}`,
        "Cement Required": `${res.cementBags.toFixed(2)} Bags`,
        "Sand Required": `${res.sandVol.toFixed(2)} ${unitVol}`,
        "Water Required": `${res.waterLiters.toFixed(1)} L`,
      };
      currentCartItem = {
        type: "Plaster",
        cementBags: res.cementBags,
        sandVol: res.sandVol,
        aggregateVol: 0,
        waterLiters: res.waterLiters,
        unitVol,
        rawExport: currentExportData,
      };
    } else if (finishesType === "paint") {
      const area = parseNum(paintArea);
      const coats = parseNum(paintCoats);
      // Rough industry averages
      const paintCovSqM = 10;
      const primerCovSqM = 12;
      const paintCovSqFt = 107.6;
      const primerCovSqFt = 129.1;

      const paintLiters = isSI 
        ? (area * coats) / paintCovSqM
        : (area * coats) / paintCovSqFt;

      const primerLiters = isSI
        ? area / primerCovSqM
        : area / primerCovSqFt;

      currentExportInputs = {
        Type: "Paint Work",
        "Wall Area": `${paintArea} ${unitArea}`,
        "Number of Coats": paintCoats,
      };
      currentExportData = {
        "Type": "Paint",
        "Paint Required": `${paintLiters.toFixed(2)} Liters`,
        "Primer Required": `${primerLiters.toFixed(2)} Liters`,
      };
      currentCartItem = {
        type: "Paint",
        cementBags: 0,
        sandVol: 0,
        aggregateVol: 0,
        waterLiters: 0,
        unitVol,
        rawExport: currentExportData,
        // For custom inputs, we omit them from the cart standard cement/sand etc. 
      };
    } else if (finishesType === "antitermite") {
      const area = parseNum(termiteArea);
      // IS 6313 / BS standard approximations for pre-construction soil treatment
      const chemLiters = isSI 
        ? area * 5 
        : area * 0.4645; // 5L per 10.76 sqft
      currentExportInputs = {
        Type: "Anti-Termite Treatment",
        "Plinth Area": `${termiteArea} ${unitArea}`,
      };
      currentExportData = {
        "Type": "Anti-Termite",
        "Chemical Emulsion Required": `${chemLiters.toFixed(2)} Liters`,
      };
      currentCartItem = {
        type: "Anti-Termite",
        cementBags: 0,
        sandVol: 0,
        aggregateVol: 0,
        waterLiters: 0,
        unitVol,
        rawExport: currentExportData,
      };
    }

    content = (
      <div className="space-y-6 bg-transparent/50 px-4 py-3 rounded-[24px] border w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4 gap-4">
          <h3 className="text-slate-900 dark:text-white flex flex-wrap items-center gap-2 text-lg font-medium text-slate-800 mb-4">
            Finishes Estimator
            {finishesType === "plaster" && (
              <>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-base font-medium tracking-wide uppercase">
                  Beginner
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-base font-medium tracking-wide uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  2 MIN
                </span>
              </>
            )}
          </h3>
          <div className="flex bg-white p-1 rounded-[24px] w-full sm:w-auto overflow-hidden">
            {(["plaster", "paint", "antitermite"] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setFinishesType(type); if(hasData) resetEstimate(); }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-[24px] text-base font-medium transition-all ${
                  finishesType === type 
                    ? "bg-white  shadow-sm text-indigo-600 " 
                    : "text-slate-500 hover:text-slate-700 "
                }`}
              >
                {type === "plaster" ? "Plastering" : type === "paint" ? "Paint Work" : "Anti-Termite"}
              </button>
            ))}
          </div>
        </div>

        {finishesType === "plaster" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <div className="sm:col-span-2">
              <label className="uppercase mb-2 block text-sm font-medium text-slate-700 mb-1">
                Plaster Location
              </label>
              <div className="flex bg-slate-100 p-1 rounded-[24px] w-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setPLocation("Internal");
                    setPThick(isSI ? "1.2" : "0.5");
                    setPMix("1:4");
                  }}
                  className={`flex-1 px-4 py-2 rounded-[24px] text-base font-medium transition-all ${
                    pLocation === "Internal" 
                      ? "bg-white  shadow-sm text-indigo-600 " 
                      : "text-slate-500 hover:text-slate-700 "
                  }`}
                >
                  Internal (12mm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPLocation("External");
                    setPThick(isSI ? "2.0" : "0.75");
                    setPMix("1:6");
                  }}
                  className={`flex-1 px-4 py-2 rounded-[24px] text-base font-medium transition-all ${
                    pLocation === "External" 
                      ? "bg-white  shadow-sm text-indigo-600 " 
                      : "text-slate-500 hover:text-slate-700 "
                  }`}
                >
                  External (20mm)
                </button>
              </div>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                Wall Area ({unitArea})
              </label>
              <><label htmlFor="a11y-input-164" className="sr-only">Input</label>
<input id="a11y-input-164"
                type="number" inputMode="decimal"
                value={pArea}
                onChange={(e) => setPArea(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Thickness ({unitIn})
              </label>
              <><label htmlFor="a11y-input-165" className="sr-only">Input</label>
<input id="a11y-input-165"
                type="number" inputMode="decimal"
                value={pThick}
                onChange={(e) => setPThick(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Mix Ratio (Cement:Sand)
              </label>
              <select
                value={pMix}
                onChange={(e) => setPMix(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-[24px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm overflow-hidden"
              >
                <option value="1:3">1:3 (Ceiling/Rich mix)</option>
                <option value="1:4">1:4 (Internal walls)</option>
                <option value="1:5">1:5 (Standard)</option>
                <option value="1:6">1:6 (External/Rough)</option>
              </select>
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-3 bg-slate-50 border border-slate-200 rounded-[24px] border border-slate-100 overflow-hidden">
              <div>
                <label className="uppercase flex items-center justify-between text-sm font-medium text-slate-700 mb-1 block">
                  Cement Density (kg/m³)
                  <HelpCircle className="w-3 h-3 text-slate-600" />
                </label>
                <><label htmlFor="a11y-input-166" className="sr-only">Input</label>
<input id="a11y-input-166" type="number" inputMode="decimal"
                  defaultValue="1440"
                  className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 transition-all min-h-[44px] text-base font-normal"
                /></>
              </div>
              <div>
                <label className="uppercase flex items-center justify-between text-sm font-medium text-slate-700 mb-1 block">
                  Sand Density (kg/m³)
                  <HelpCircle className="w-3 h-3 text-slate-600" />
                </label>
                <><label htmlFor="a11y-input-167" className="sr-only">Input</label>
<input id="a11y-input-167" type="number" inputMode="decimal"
                  defaultValue="1600"
                  className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 transition-all min-h-[44px] text-base font-normal"
                /></>
              </div>
            </div>
            
            <div className="sm:col-span-2 mt-4 p-4 rounded-[24px] border border-indigo-200 bg-indigo-50/50 overflow-hidden">
              <h4 className="text-indigo-900 mb-2 text-lg font-medium text-slate-800 mb-4">Math Logic & Formulas (Built-in)</h4>
              <ul className="text-sm text-indigo-800 space-y-1.5 list-disc list-inside">
                <li><strong>Wet Volume (V_wet):</strong> Area × (Thickness / 100)</li>
                <li><strong>Dry Volume (V_dry):</strong> V_wet × 1.33 (for voids) + wastage = <strong>V_dry</strong></li>
                <li><strong>Cement Bags:</strong> [V_dry × (Cement Ratio / Total Ratio)] / 0.0347</li>
              </ul>
            </div>

            <div className="sm:col-span-2 mt-6">
              <h4 className="mb-3 text-lg font-medium text-slate-800 mb-4">Related Tools</h4>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('concrete')} className="px-3 py-2 text-base font-medium rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Concrete Calculator</button>
                <button onClick={() => setActiveTab('bricks')} className="px-3 py-2 text-base font-medium rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Brickwork Estimator</button>
              </div>
            </div>
          </div>
        )}

        {finishesType === "paint" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Wall Area ({unitArea})
              </label>
              <><label htmlFor="a11y-input-168" className="sr-only">Input</label>
<input id="a11y-input-168"
                type="number" inputMode="decimal"
                value={paintArea}
                onChange={(e) => setPaintArea(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Number of Coats
              </label>
              <><label htmlFor="a11y-input-169" className="sr-only">Input</label>
<input id="a11y-input-169"
                type="number" inputMode="decimal"
                value={paintCoats}
                onChange={(e) => setPaintCoats(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
        )}

        {finishesType === "antitermite" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
                Plinth Area ({unitArea})
              </label>
              <><label htmlFor="a11y-input-170" className="sr-only">Input</label>
<input id="a11y-input-170"
                type="number" inputMode="decimal"
                value={termiteArea}
                onChange={(e) => setTermiteArea(e.target.value)}
                className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
              /></>
            </div>
          </div>
        )}
      </div>
    );
  } else if (activeTab === "water") {
    /* Basic Water Calculator based on cement weight */ const waterCalc =
      parseNum(wCementKg) * parseNum(wWcRatio);
    currentExportInputs = {
      "Weight of Cement": `${wCementKg} kg`,
      "W/C Ratio": `${wWcRatio}`,
    };
    currentExportData = {
      "Weight of Cement": `${wCementKg} kg`,
      "W/C Ratio": `${wWcRatio}`,
      "Required Water": `${waterCalc.toFixed(1)} L (${(waterCalc / 3.785).toFixed(2)} Gallons)`,
    };
    currentCartItem = {
      type: "Water",
      cementBags: 0,
      sandVol: 0,
      aggregateVol: 0,
      waterLiters: waterCalc,
      unitVol,
      rawExport: currentExportData,
    };
    content = (
      <div className="space-y-6 bg-transparent/50 px-4 py-3 rounded-[24px] border w-full overflow-hidden">
        <h3 className="border-b pb-2 uppercase st text-lg font-medium text-slate-800 mb-4">
          Water Requirements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              Weight of Cement (kg)
            </label>
            <><label htmlFor="a11y-input-171" className="sr-only">Input</label>
<input id="a11y-input-171"
              type="number" inputMode="decimal"
              value={wCementKg}
              onChange={(e) => setWCementKg(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
          <div>
            <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">
              W/C Ratio (0.45-0.6)
            </label>
            <><label htmlFor="a11y-input-172" className="sr-only">Input</label>
<input id="a11y-input-172"
              type="number" inputMode="decimal"
              step="0.01"
              value={wWcRatio}
              onChange={(e) => setWWcRatio(e.target.value)}
              className="mt-1 w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm transition-all shadow-sm"
            /></>
          </div>
        </div>
      </div>
    );
  } else if (activeTab === "master") {
    content = (
      <div className="w-full relative col-span-1 lg:col-span-2 space-y-4">
        <MasterQuantityEstimator isEmbedded={true} />
      </div>
    );
  } else if (activeTab === "cement" || activeTab === "sand") {
    content = (
      <div className="w-full bg-transparent border p-5 sm:p-8 md:p-12 rounded-[24px] text-center text-slate-700 md:max-w-xl md:mx-auto mt-8 overflow-hidden">
        <Layers className="w-12 h-12 mx-auto text-slate-700 mb-4" />
        <h3 className="mb-2 text-lg font-medium text-slate-800 mb-4">
          Use Standard Modules
        </h3>
        <p>
          For standalone {activeTab} estimations, please rely on the Concrete,
          Plaster, or Block modules which accurately calculate the constituent
          cement/sand ratios from overall dimensions.
        </p>
      </div>
    );
  }
  const addToCart = () => {
    if (!currentCartItem) return;
    const item: CartItem = {
      ...currentCartItem,
      id: Math.random().toString(36).substr(2, 9),
      name: elementName || `${currentCartItem.type} Element`,
    };
    setCart([...cart, item]);
    setElementName("");
  };
  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };
  const totalCement = cart.reduce((acc, item) => acc + item.cementBags, 0);
  const totalSand = cart.reduce((acc, item) => acc + item.sandVol, 0);
  const totalAgg = cart.reduce((acc, item) => acc + item.aggregateVol, 0);
  const totalWater = cart.reduce((acc, item) => acc + item.waterLiters, 0);

  let explanationOpts: any = {
    hasInputs: false,
    genericFormula: [],
    activeBreakdown: [],
    notes: []
  };

  const hasConcreteInputs = !!(parseNum(cLength) || parseNum(cWidth) || parseNum(cDepth) || parseNum(cColDia) || parseNum(cStairSteps));
  const hasBrickInputs = !!(parseNum(bWallL) || parseNum(bWallH));
  
  if (activeTab === "concrete") {
    explanationOpts.hasInputs = hasConcreteInputs;
    explanationOpts.genericFormula = [
      { label: "Wet Volume", formula: "Length × Width × Depth" },
      { label: "Dry Volume", formula: "Wet Volume × 1.54 × (1 + Wastage)" },
      { label: "Cement", formula: "(Ratio of Cement / Sum of Ratios) × Dry Volume" }
    ];
    if (hasConcreteInputs && currentExportData["Concrete Mixed Volume"]) {
      explanationOpts.activeBreakdown = [
        { label: "Dry Volume", formula: `${parseFloat(currentExportData["Concrete Mixed Volume"])} × 1.54 × (1 + ${wastage || 0}%)`, result: currentExportData[`Dry Volume (+${wastage}% waste)`] },
        { label: "Cement", formula: `Dry Volume × Ratio`, result: currentExportData["Cement Required"] },
      ];
    }
    explanationOpts.notes = ["1 bag of cement = 50 kg", "Dry volume coefficient for concrete is 1.54"];
  }

  const renderBatchModeFor = (tab: string) => {
    let columns: BatchColumn[] = [];
    let calcLogic: (rows: any[]) => void = () => {};
    let title = "Batch Input Mode";

    if (tab === "concrete") {
      title = "Concrete Batch Estimator";
      columns = [
        { id: "ref", label: "Reference", type: "text" },
        { id: "len", label: `Length (${unitFt})`, type: "number", defaultValue: 10 },
        { id: "wid", label: `Width (${unitFt})`, type: "number", defaultValue: 10 },
        { id: "dep", label: `Depth (${unitFt})`, type: "number", defaultValue: isSI ? 0.15 : 0.5 },
      ];
      calcLogic = (rows: any[]) => {
        let tBags = 0, tSand = 0, tAgg = 0, tWater = 0;
        let tVol = 0;
        rows.forEach(r => {
           let v = parseNum(r.len?.toString()||"0") * parseNum(r.wid?.toString()||"0") * parseNum(r.dep?.toString()||"0");
           tVol += v;
           if (v > 0) {
             const calc = new ConcreteMortarCalculator(v, 1, 1, cMix, parseNum(wastage), parseNum(cWcRatio), isSI);
             const res = calc.calculate();
             tBags += res.cementBags;
             tSand += res.sandVol;
             tAgg += res.aggregateVol;
             tWater += res.waterLiters;
           }
        });
        setBatchResults([{ type: "Total Concrete", cementBags: tBags, sandVol: tSand, aggregateVol: tAgg, waterLiters: tWater, volume: tVol }]);
      };
    } else if (tab === "bricks") {
      title = "Brickwork Batch Estimator";
      columns = [
        { id: "ref", label: "Wall ID", type: "text" },
        { id: "len", label: `Length (${unitFt})`, type: "number", defaultValue: 20 },
        { id: "hei", label: `Height (${unitFt})`, type: "number", defaultValue: 10 },
        { id: "thi", label: `Thickness (${unitIn})`, type: "number", defaultValue: isSI ? 22 : 9 },
      ];
      calcLogic = (rows: any[]) => {
         let tBags = 0, tSand = 0, tBricks = 0, tVol = 0;
         rows.forEach(r => {
           const calc = new BrickworkCalculator(
             parseNum(r.len?.toString()||"0"), parseNum(r.hei?.toString()||"0"), parseNum(r.thi?.toString()||"0"),
             0,
             parseNum(brickL.toString()), parseNum(brickW.toString()), parseNum(brickH.toString()),
             parseNum(bJoint), bMix, parseNum(wastage), isSI
           );
           const res = calc.calculate();
           tBags += res.cementBags;
           tSand += res.sandVol;
           tBricks += res.numBricks;
           tVol += (parseNum(r.len?.toString()||"0") * parseNum(r.hei?.toString()||"0") * (parseNum(r.thi?.toString()||"0")/(isSI?100:12)));
         });
         setBatchResults([{ type: "Total Brickwork", cementBags: tBags, sandVol: tSand, count: tBricks, volume: tVol }]);
      };
    } else if (tab === "blocks") {
      title = "Blockwork Batch Estimator";
      columns = [
        { id: "ref", label: "Wall ID", type: "text" },
        { id: "len", label: `Length (${unitFt})`, type: "number", defaultValue: 20 },
        { id: "hei", label: `Height (${unitFt})`, type: "number", defaultValue: 10 },
      ];
      calcLogic = (rows: any[]) => {
         let tBags = 0, tSand = 0, tBlocks = 0, tVol = 0;
         rows.forEach(r => {
           const calc = new BrickworkCalculator(
             parseNum(r.len?.toString()||"0"), parseNum(r.hei?.toString()||"0"), parseNum(blockW.toString()),
             0,
             parseNum(blockL.toString()), parseNum(blockW.toString()), parseNum(blockH.toString()),
             parseNum(blockJoint), bMix, parseNum(wastage), isSI
           );
           const res = calc.calculate();
           tBags += res.cementBags;
           tSand += res.sandVol;
           tBlocks += res.numBricks;
         });
         setBatchResults([{ type: "Total Blockwork", cementBags: tBags, sandVol: tSand, count: tBlocks }]);
      };
    } else if (tab === "plaster") {
      title = "Plaster Batch Estimator";
      columns = [
        { id: "ref", label: "Wall ID", type: "text" },
        { id: "area", label: `Area (${unitArea})`, type: "number", defaultValue: 200 },
        { id: "thi", label: `Thickness (${unitIn})`, type: "number", defaultValue: isSI ? 1.2 : 0.5 },
      ];
      calcLogic = (rows) => {
         let tBags = 0, tSand = 0;
         rows.forEach(r => {
           const calc = new PlasterCalculator(parseNum(r.area?.toString()||"0"), parseNum(r.thi?.toString()||"0"), pMix, parseNum(wastage), isSI);
           const res = calc.calculate();
           tBags += res.cementBags;
           tSand += res.sandVol;
         });
         setBatchResults([{ type: "Total Plaster", cementBags: tBags, sandVol: tSand }]);
      }
    } else {
       return null;
    }

    return (
      <div className="space-y-6 w-full animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-medium text-slate-800 mb-4">{title}</h3>
           <button onClick={() => setIsBatchMode(false)} className="px-4 py-2 text-base font-medium bg-slate-100 rounded-full hover:bg-slate-200 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              Exit Batch Mode
           </button>
        </div>
        <BatchInputMode columns={columns} onCalculateTotal={calcLogic} title={title} />
        {batchResults.map((br, idx) => (
           <div key={idx} className="bg-emerald-50 border border-emerald-200 p-4 sm:p-6 rounded-[24px] overflow-hidden">
             <h4 className="text-emerald-800 mb-4 text-lg font-medium text-slate-800">{br.type} Results</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {br.volume !== undefined && (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                    <p className="uppercase text-emerald-600 mb-1 text-base font-normal text-slate-600 leading-relaxed">Total Volume</p>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">{br.volume.toFixed(2)} <span className="text-sm font-medium text-slate-500">{unitVol}</span></p>
                  </div>
                )}
                {br.cementBags !== undefined && (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                    <p className="uppercase text-emerald-600 mb-1 text-base font-normal text-slate-600 leading-relaxed">Cement Required</p>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">{br.cementBags.toFixed(2)} <span className="text-sm font-medium text-slate-500">Bags</span></p>
                  </div>
                )}
                {br.sandVol !== undefined && (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                    <p className="uppercase text-emerald-600 mb-1 text-base font-normal text-slate-600 leading-relaxed">Sand Required</p>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">{br.sandVol.toFixed(2)} <span className="text-sm font-medium text-slate-500">{unitVol}</span></p>
                  </div>
                )}
                {br.aggregateVol !== undefined && (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                    <p className="uppercase text-emerald-600 mb-1 text-base font-normal text-slate-600 leading-relaxed">Aggregate</p>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">{br.aggregateVol.toFixed(2)} <span className="text-sm font-medium text-slate-500">{unitVol}</span></p>
                  </div>
                )}
                {br.waterLiters !== undefined && (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                    <p className="uppercase text-emerald-600 mb-1 text-base font-normal text-slate-600 leading-relaxed">Water Required</p>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">{isSI ? br.waterLiters.toFixed(0) : (br.waterLiters/3.785).toFixed(0)} <span className="text-sm font-medium text-slate-500">{isSI ? 'Liters' : 'Gallons'}</span></p>
                  </div>
                )}
                {br.count !== undefined && (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                    <p className="uppercase text-emerald-600 mb-1 text-base font-normal text-slate-600 leading-relaxed">Total Pieces</p>
                    <p className="text-base font-normal text-slate-600 leading-relaxed">{br.count.toLocaleString()} <span className="text-sm font-medium text-slate-500">Nos</span></p>
                  </div>
                )}
             </div>
           </div>
        ))}
      </div>
    );
  };

  const isBatchSupported = ["concrete", "bricks", "blocks", "plaster"].includes(activeTab);

  return (
  <div className={hideHeader ? "w-full" : "w-full h-full bg-transparent text-slate-900 p-6 md:p-8"}>
    <div className={hideHeader ? "w-full" : "max-w-7xl mx-auto"}>
       {isBatchSupported && !isBatchMode && (
          <div className="flex justify-end mb-4">
             <button onClick={() => { setIsBatchMode(true); setBatchResults([]); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-base font-medium rounded-full hover:bg-indigo-100 transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5">
                <Layers className="w-4 h-4" /> Enable Batch Mode
             </button>
          </div>
       )}
       {isBatchMode && isBatchSupported ? renderBatchModeFor(activeTab) : content}
    </div>
  </div>
  );
}