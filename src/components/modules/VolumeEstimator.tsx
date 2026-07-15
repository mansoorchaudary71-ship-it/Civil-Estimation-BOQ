import React, { useState, useMemo } from "react";
import { useConvertedState } from "../../hooks/useUnitChange";
import { UniversalTabs } from "../ui/UniversalTabs";
import {
  Box,
  Cylinder,
  Database,
  Cuboid,
  Cone,
  Triangle,
  Square,
  Circle,
  Calculator,
  Droplets,
  Maximize,
  Share2,
  Container,
  Hexagon,
  Save,
} from "lucide-react";

import { saveEstimate } from "../../lib/estimates";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { useAuth } from "../../contexts/AuthContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { DetailedCalculationDisplay } from "../ui/DetailedCalculationDisplay";
import { SVGShapeVisualizer } from "./ShapeVisualizer";
type Shape =
  | "Rectangular Prism"
  | "Cube"
  | "Cylinder"
  | "Sphere"
  | "Half Sphere"
  | "Cone"
  | "Frustum Cone"
  | "Parabolic Cone"
  | "Triangular Dumper"
  | "Trapezoidal Dumper"
  | "Rectangle Tank"
  | "Concentric Cylinder"
  | "Prism"
  | "Commercial Tank";
type System = "Metric" | "Imperial";
import { useGlobalSettings } from "../../context/SettingsContext";
export default function VolumeEstimator() {
  const { user } = useAuth();
  const { currentUnit, setCurrentUnit } = useGlobalSettings();
  
  
  const [activeShape, setActiveShape] = useState<Shape>("Rectangular Prism");
  const system = currentUnit;
  /* Input states */ const [length, setLength] = useConvertedState("", "length");
  const [width, setWidth] = useConvertedState("", "length");
  const [height, setHeight] = useConvertedState("", "length");
  const [side, setSide] = useConvertedState("", "length");
  const [radius, setRadius] = useConvertedState("", "length");
  const [topRadius, setTopRadius] = useConvertedState("", "length");
  const [bottomRadius, setBottomRadius] = useConvertedState("", "length");
  const [base, setBase] = useConvertedState("", "length");
  const [topWidth, setTopWidth] = useConvertedState("", "length");
  const [bottomWidth, setBottomWidth] = useConvertedState("", "length");
  const [depth, setDepth] = useConvertedState("", "length");
  const [baseArea, setBaseArea] = useConvertedState("", "area");
  const [basePerimeter, setBasePerimeter] = useConvertedState("", "length");
  const [outerDiameter, setOuterDiameter] = useConvertedState("", "length");
  const [innerDiameter, setInnerDiameter] = useConvertedState("", "length");
  const [density, setDensity] = useState("2400"); // default, we'll let user change it
  
  // Commercial Tank advanced states
  const [tankBaseShape, setTankBaseShape] = useState<"Rectangular" | "Cylindrical">("Rectangular");
  const [hasSlopedBase, setHasSlopedBase] = useState(false);
  const [slopedHeight, setSlopedHeight] = useConvertedState("", "length");
  const [freeboardPercent, setFreeboardPercent] = useState("10");
  const [deadStorageDepth, setDeadStorageDepth] = useConvertedState("", "length");
  const [outletLength, setOutletLength] = useConvertedState("", "length");
  const [outletWidth, setOutletWidth] = useConvertedState("", "length");
  const [tankSteps, setTankSteps] = useState<any[]>([]);
  
  React.useEffect(() => {
    if (system === "Metric" && density === "150") {
      setDensity("2400");
    } else if (system === "Imperial" && density === "2400") {
      setDensity("150");
    }
  }, [system]);

  const shapes: { id: Shape; label: string; icon: any; color: string }[] = [
    {
      id: "Rectangular Prism",
      label: "Rect Prism",
      icon: Cuboid,
      color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20",
    },
    {
      id: "Cube",
      label: "Cube",
      icon: Box,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-500/20",
    },
    {
      id: "Cylinder",
      label: "Cylinder",
      icon: Cylinder,
      color: "text-purple-500 bg-purple-100 dark:bg-purple-500/20",
    },
    {
      id: "Sphere",
      label: "Sphere",
      icon: Circle,
      color: "text-rose-500 bg-rose-100 dark:bg-rose-500/20",
    },
    {
      id: "Half Sphere",
      label: "Half Sphere",
      icon: Circle,
      color: "text-pink-500 bg-pink-100 dark:bg-pink-500/20",
    },
    {
      id: "Cone",
      label: "Cone",
      icon: Cone,
      color: "text-amber-500 bg-amber-100 dark:bg-amber-500/20",
    },
    {
      id: "Frustum Cone",
      label: "Frustum Cone",
      icon: Database,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-500/20",
    },
    {
      id: "Parabolic Cone",
      label: "Parabolic Cone",
      icon: Cone,
      color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20",
    },
    {
      id: "Triangular Dumper",
      label: "Tri Dumper",
      icon: Triangle,
      color: "text-teal-500 bg-teal-100 dark:bg-teal-500/20",
    },
    {
      id: "Trapezoidal Dumper",
      label: "Trap Dumper",
      icon: Square,
      color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-500/20",
    },
    {
      id: "Rectangle Tank",
      label: "Rect Tank",
      icon: Container,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20",
    },
    {
      id: "Concentric Cylinder",
      label: "Tube / Pipe",
      icon: Cylinder,
      color: "text-slate-600 bg-slate-100 dark:bg-slate-500/20",
    },
    {
      id: "Commercial Tank",
      label: "Commercial Tank",
      icon: Container,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/20",
    },
    {
      id: "Prism",
      label: "Prism",
      icon: Hexagon,
      color: "text-lime-500 bg-lime-100 dark:bg-lime-500/20",
    },
  ];
  const volUnit = system === "Metric" ? "m³" : "cu.ft";
  const areaUnit = system === "Metric" ? "m²" : "sq.ft";

  const calculate = () => {
    let volume = 0;
    let surfaceArea = 0;
    let totalWeight = 0;
    let inputs: Record<string, string> = {};
    const parse = (val: string) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    };
    const l = parse(length);
    const w = parse(width);
    const h = parse(height);
    const s = parse(side);
    const r = parse(radius);
    const tr = parse(topRadius);
    const br = parse(bottomRadius);
    const b = parse(base);
    const tw = parse(topWidth);
    const bw = parse(bottomWidth);
    const d = parse(depth);
    const ba = parse(baseArea);
    const bp = parse(basePerimeter);
    const od = parse(outerDiameter);
    const id = parse(innerDiameter);
    const den = parse(density);
    const unit = system === "Metric" ? "m" : "ft";
    const sqUnit = system === "Metric" ? "m²" : "sq.ft";
    
    let explanationOpts: any = {
      hasInputs: false,
      genericFormula: [],
      activeBreakdown: [],
      notes: [
        system === "Metric" ? "1 cubic meter = 1000 Litres" : "1 cubic foot = 7.48 Gallons"
      ]
    };

    if (activeShape === "Rectangular Prism") {
      volume = l * w * h;
      surfaceArea = 2 * (l * w + l * h + w * h);
      inputs = {
        Length: `${l} ${unit}`,
        Width: `${w} ${unit}`,
        Height: `${h} ${unit}`,
      };
      explanationOpts.genericFormula = [
        { label: "Volume", formula: "Length × Width × Height" },
        { label: "Surface Area", formula: "2 × (Length×Width + Length×Height + Width×Height)" }
      ];
      if (l || w || h) {
        explanationOpts.hasInputs = true;
        explanationOpts.activeBreakdown = [
          { label: "Volume", formula: `${l} × ${w} × ${h}`, result: `${volume.toFixed(2)} ${unit}³` },
        ];
      }
    } else if (activeShape === "Cube") {
      volume = s * s * s;
      surfaceArea = 6 * s * s;
      inputs = { Side: `${s} ${unit}` };
    } else if (activeShape === "Cylinder") {
      volume = Math.PI * r * r * h;
      surfaceArea = 2 * Math.PI * r * h + 2 * Math.PI * r * r;
      inputs = { Radius: `${r} ${unit}`, Height: `${h} ${unit}` };
    } else if (activeShape === "Sphere") {
      volume = (4 / 3) * Math.PI * Math.pow(r, 3);
      surfaceArea = 4 * Math.PI * r * r;
      inputs = { Radius: `${r} ${unit}` };
    } else if (activeShape === "Half Sphere") {
      volume = (2 / 3) * Math.PI * Math.pow(r, 3);
      surfaceArea = 3 * Math.PI * r * r;
      /* Base + curved */ inputs = { Radius: `${r} ${unit}` };
    } else if (activeShape === "Cone") {
      volume = (1 / 3) * Math.PI * r * r * h;
      const slant = Math.sqrt(r * r + h * h);
      surfaceArea = Math.PI * r * slant + Math.PI * r * r;
      inputs = { Radius: `${r} ${unit}`, Height: `${h} ${unit}` };
    } else if (activeShape === "Frustum Cone") {
      volume = (1 / 3) * Math.PI * h * (tr * tr + tr * br + br * br);
      const slant = Math.sqrt(Math.pow(tr - br, 2) + h * h);
      surfaceArea =
        Math.PI * (tr + br) * slant + Math.PI * tr * tr + Math.PI * br * br;
      inputs = {
        "Top Radius": `${tr} ${unit}`,
        "Bottom Radius": `${br} ${unit}`,
        Height: `${h} ${unit}`,
      };
    } else if (activeShape === "Parabolic Cone") {
      volume = 0.5 * Math.PI * r * r * h;
      /* Approximate surface area formula surfaceArea = (Math.PI * r / (6 * h * h || 1)) * (Math.pow(r * r + 4 * h * h, 1.5) - Math.pow(r, 3)); inputs = { Radius: `${r} ${unit}`, Height: `${h} ${unit}` }; } else if (activeShape === "Triangular Dumper") { /* Isosceles prism volume = 0.5 * b * h * l; */ const slant =
        Math.sqrt(Math.pow(b / 2, 2) + h * h);
      surfaceArea = b * h + l * b + 2 * l * slant;
      inputs = {
        Base: `${b} ${unit}`,
        Height: `${h} ${unit}`,
        Length: `${l} ${unit}`,
      };
    } else if (activeShape === "Trapezoidal Dumper") {
      /* Isosceles trapezoidal prism volume = 0.5 * (tw + bw) * d * l; */ const slant =
        Math.sqrt(Math.pow((tw - bw) / 2, 2) + d * d);
      surfaceArea = (tw + bw) * d + l * tw + l * bw + 2 * l * slant;
      inputs = {
        "Top Width": `${tw} ${unit}`,
        "Bottom Width": `${bw} ${unit}`,
        Depth: `${d} ${unit}`,
        Length: `${l} ${unit}`,
      };
    } else if (activeShape === "Rectangle Tank") {
      volume = l * w * h;
      surfaceArea = 2 * (l * w + l * h + w * h);
      inputs = {
        Length: `${l} ${unit}`,
        Width: `${w} ${unit}`,
        Height: `${h} ${unit}`,
      };
    } else if (activeShape === "Concentric Cylinder") {
      volume = (Math.PI / 4) * (od * od - id * id) * l;
      surfaceArea = Math.PI * od * l + Math.PI * id * l + (Math.PI / 2) * (od * od - id * id);
      totalWeight = volume * den;
      inputs = {
        "Outer Diameter": `${od} ${unit}`,
        "Inner Diameter": `${id} ${unit}`,
        Length: `${l} ${unit}`,
        Density: `${den} ${system === "Metric" ? "kg/m³" : "lb/ft³"}`
      };
      explanationOpts.genericFormula = [
        { label: "Volume", formula: "(π ÷ 4) × (OuterDia² - InnerDia²) × Length" },
        { label: "Total Weight", formula: "Volume × Density" }
      ];
      if (od || id || l) {
        explanationOpts.hasInputs = true;
        explanationOpts.activeBreakdown = [
          { label: "Volume", formula: `(π/4) × (${od}² - ${id}²) × ${l}`, result: `${volume.toFixed(2)} ${unit}³` },
          { label: "Weight", formula: `${volume.toFixed(2)} × ${den}`, result: `${totalWeight.toFixed(2)} ${system === "Metric" ? "kg" : "lbs"}` },
        ];
      }
    } else if (activeShape === "Prism") {
      volume = ba * h;
      surfaceArea = 2 * ba + bp * h;
      inputs = {
        "Base Area": `${ba} ${sqUnit}`,
        "Base Perimeter": `${bp} ${unit}`,
        Height: `${h} ${unit}`,
      };
    } else if (activeShape === "Commercial Tank") {
      const sh = parse(slopedHeight);
      const fb = parse(freeboardPercent) / 100;
      const ds = parse(deadStorageDepth);
      let grossVolume = 0;
      let steps: any[] = [];
      let baseAreaVal = 0;
      
      if (tankBaseShape === "Rectangular") {
        baseAreaVal = l * w;
        let mainVol = baseAreaVal * h;
        steps.push({
          stepName: "1. Main Rectangular Section Volume",
          equation: "V_main = Length × Width × Height",
          variables: [{name: "L", value: l, unit}, {name: "W", value: w, unit}, {name: "H", value: h, unit}],
          substitution: `V_main = ${l} × ${w} × ${h}`,
          result: parseFloat(mainVol.toFixed(3)),
          resultUnit: volUnit,
          resultColor: "slate"
        });
        
        let slopedVol = 0;
        if (hasSlopedBase) {
          const oL = parse(outletLength);
          const oW = parse(outletWidth);
          const bottomArea = oL * oW;
          slopedVol = (sh / 3) * (baseAreaVal + bottomArea + Math.sqrt(baseAreaVal * bottomArea));
          steps.push({
             stepName: "2. Sloped Base (Frustum) Volume",
             equation: "V_slope = (h/3) × (A1 + A2 + √(A1×A2))",
             variables: [{name: "sh", value: sh, unit}, {name: "A1", value: baseAreaVal, unit: sqUnit}, {name: "A2", value: bottomArea, unit: sqUnit}],
             substitution: `V_slope = (${sh}/3) × (${baseAreaVal} + ${bottomArea} + √(${baseAreaVal}×${bottomArea}))`,
             result: parseFloat(slopedVol.toFixed(3)),
             resultUnit: volUnit,
             resultColor: "slate"
          });
        }
        
        grossVolume = mainVol + slopedVol;
        surfaceArea = 2 * (l * w + l * h + w * h); // approximate for simple case
        
      } else {
        // Cylindrical
        baseAreaVal = Math.PI * r * r;
        let mainVol = baseAreaVal * h;
        steps.push({
          stepName: "1. Main Cylindrical Section Volume",
          equation: "V_main = π × r² × Height",
          variables: [{name: "r", value: r, unit}, {name: "H", value: h, unit}],
          substitution: `V_main = π × ${r}² × ${h}`,
          result: parseFloat(mainVol.toFixed(3)),
          resultUnit: volUnit,
          resultColor: "slate"
        });
        
        let slopedVol = 0;
        if (hasSlopedBase) {
          const oR = parse(outletLength); // reuse outletLength as outletRadius
          const bottomArea = Math.PI * oR * oR;
          slopedVol = (sh / 3) * (baseAreaVal + bottomArea + Math.sqrt(baseAreaVal * bottomArea));
          steps.push({
             stepName: "2. Cone Frustum Base Volume",
             equation: "V_slope = (h/3) × (A1 + A2 + √(A1×A2))",
             variables: [{name: "sh", value: sh, unit}, {name: "A1 (Top)", value: baseAreaVal.toFixed(2), unit: sqUnit}, {name: "A2 (Bot)", value: bottomArea.toFixed(2), unit: sqUnit}],
             substitution: `V_slope = (${sh}/3) × (${baseAreaVal.toFixed(2)} + ${bottomArea.toFixed(2)} + √(...))`,
             result: parseFloat(slopedVol.toFixed(3)),
             resultUnit: volUnit,
             resultColor: "slate"
          });
        }
        grossVolume = mainVol + slopedVol;
        surfaceArea = 2 * Math.PI * r * h + 2 * Math.PI * r * r;
      }
      
      const freeboardVol = baseAreaVal * (h * fb); // Top part loss
      steps.push({
         stepName: "3. Freeboard Deduction",
         equation: "V_fb = Base_Area × (Height × FB%)",
         variables: [{name: "Base Area", value: baseAreaVal.toFixed(2), unit: sqUnit}, {name: "FB Height", value: (h*fb).toFixed(2), unit}],
         substitution: `V_fb = ${baseAreaVal.toFixed(2)} × ${parseFloat((h*fb).toFixed(2))}`,
         result: parseFloat(freeboardVol.toFixed(3)),
         resultUnit: volUnit,
         resultColor: "rose"
      });
      
      let deadVol = 0;
      if (ds > 0 && hasSlopedBase) {
        // approximate dead storage as small frustum or simple box
        if (tankBaseShape === "Rectangular") {
          const oL = parse(outletLength);
          const oW = parse(outletWidth);
          // simple approximation: assume vertical or slightly sloped dead storage walls
          deadVol = oL * oW * ds; 
        } else {
          const oR = parse(outletLength);
          deadVol = Math.PI * oR * oR * ds;
        }
        steps.push({
           stepName: "4. Dead Storage Deduction",
           equation: "V_dead = Outlet_Area × ds_Depth  (approx)",
           variables: [{name: "ds_Depth", value: ds, unit}],
           substitution: `V_dead = ... × ${ds}`,
           result: parseFloat(deadVol.toFixed(3)),
           resultUnit: volUnit,
           resultColor: "rose"
        });
      } else if (ds > 0) {
        // Flat bottom dead storage
        deadVol = baseAreaVal * ds;
        steps.push({
           stepName: "4. Dead Storage Deduction",
           equation: "V_dead = Base_Area × ds_Depth",
           variables: [{name: "Base Area", value: baseAreaVal.toFixed(2), unit: sqUnit}, {name: "Depth", value: ds, unit}],
           substitution: `V_dead = ${baseAreaVal.toFixed(2)} × ${ds}`,
           result: parseFloat(deadVol.toFixed(3)),
           resultUnit: volUnit,
           resultColor: "rose"
        });
      }
      
      const netVolume = grossVolume - freeboardVol - deadVol;
      steps.push({
         stepName: "5. Net Usable Capacity",
         equation: "Net_Volume = Gross - V_fb - V_dead",
         variables: [{name: "Gross", value: grossVolume.toFixed(2), unit: volUnit}],
         substitution: `Net = ${grossVolume.toFixed(2)} - ${freeboardVol.toFixed(2)} - ${deadVol.toFixed(2)}`,
         result: parseFloat(netVolume.toFixed(3)),
         resultUnit: volUnit,
         resultColor: "emerald"
      });
      
      volume = netVolume;
      inputs = {
        "Shape": tankBaseShape,
        "Total Height": `${h} ${unit}`,
        "Freeboard": `${fb * 100}%`,
      };
      
      explanationOpts.hasInputs = true;
      explanationOpts.activeBreakdown = [];
      explanationOpts.steps = steps; // Store steps here to render later
    }
    return { volume, surfaceArea, totalWeight, inputs, explanationOpts };
  };
  const { volume, surfaceArea, totalWeight, inputs, explanationOpts } = useMemo(calculate, [
    activeShape,
    system,
    length,
    width,
    height,
    side,
    radius,
    topRadius,
    bottomRadius,
    base,
    topWidth,
    bottomWidth,
    depth,
    baseArea,
    basePerimeter,
    outerDiameter,
    innerDiameter,
    density,
    tankBaseShape,
    hasSlopedBase,
    slopedHeight,
    freeboardPercent,
    deadStorageDepth,
    outletLength,
    outletWidth
  ]);
  let liquidCapacity = 0;
  let capacityUnit = "";
  if (system === "Metric") {
    liquidCapacity = volume * 1000; 
    capacityUnit = "Liters";
  } else {
    liquidCapacity = volume * 7.48052; 
    capacityUnit = "Gallons";
  }
  const exportData = {
    Shape: activeShape,
    Volume: `${volume.toFixed(2)} ${volUnit}`,
    "Surface Area": `${surfaceArea.toFixed(2)} ${areaUnit}`,
    "Liquid Capacity": `${liquidCapacity.toFixed(2)} ${capacityUnit}`,
  };
  return (
    <div className="w-full h-full bg-transparent dark:bg-slate-950 text-slate-900 dark:text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        
        {/* Global Settings */}
        <div className="flex flex-wrap gap-4 mb-8 items-center bg-bg-card px-4 py-3 rounded-[24px] border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div>
            <label className="text-base font-medium dark:text-gray-400 uppercase block mb-1">
              Measurement System
            </label>
            <div className="flex bg-white dark:bg-slate-800 rounded-[16px] p-1 w-fit">
              <button
                onClick={() => setCurrentUnit("Metric")}
                className={`px-4 py-1.5 rounded-md text-base font-medium transition-all ${system === "Metric" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-700 dark:text-slate-300"}`}
              >
                Metric (m)
              </button>
              <button
                onClick={() => setCurrentUnit("Imperial")}
                className={`px-4 py-1.5 rounded-md text-base font-medium transition-all ${system === "Imperial" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-700 dark:text-slate-300"}`}
              >
                Imperial (ft)
              </button>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <UniversalTabs 
            tabs={shapes.map(s => ({ id: s.id, label: s.label, icon: <s.icon className="w-5 h-5" /> }))}
            activeTab={activeShape}
            onTabChange={(id) => setActiveShape(id as Shape)}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-bg-card p-4 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-[24px] flex items-center justify-center text-indigo-600 overflow-hidden">
                {(() => {
                  const ShapeIcon =
                    shapes.find((s) => s.id === activeShape)?.icon || Box;
                  return <ShapeIcon className="w-6 h-6" />;
                })()}
              </div>
              <h3 className="font-bold text-xl">{activeShape} Parameters</h3>
            </div>
            <div className="space-y-4">
              {activeShape === "Rectangular Prism" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Length ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-530" className="sr-only">Input</label>
<input id="a11y-input-530"
                      type="number" inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Width ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-531" className="sr-only">Input</label>
<input id="a11y-input-531"
                      type="number" inputMode="decimal"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Height ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-532" className="sr-only">Input</label>
<input id="a11y-input-532"
                      type="number" inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                </div>
              )}
              {activeShape === "Cube" && (
                <div>
                  <label className="text-base font-medium dark:text-gray-300 uppercase">
                    Side Length ({system === "Metric" ? "m" : "ft"})
                  </label>
                  <><label htmlFor="a11y-input-533" className="sr-only">Input</label>
<input id="a11y-input-533"
                    type="number" inputMode="decimal"
                    value={side}
                    onChange={(e) => setSide(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                  /></>
                </div>
              )}
              {["Cylinder", "Cone", "Parabolic Cone"].includes(activeShape) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Radius ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-534" className="sr-only">Input</label>
<input id="a11y-input-534"
                      type="number" inputMode="decimal"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Height ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-535" className="sr-only">Input</label>
<input id="a11y-input-535"
                      type="number" inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                </div>
              )}
              {["Sphere", "Half Sphere"].includes(activeShape) && (
                <div>
                  <label className="text-base font-medium dark:text-gray-300 uppercase">
                    Radius ({system === "Metric" ? "m" : "ft"})
                  </label>
                  <><label htmlFor="a11y-input-536" className="sr-only">Input</label>
<input id="a11y-input-536"
                    type="number" inputMode="decimal"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                  /></>
                </div>
              )}
              {activeShape === "Frustum Cone" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Top Radius ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-537" className="sr-only">Input</label>
<input id="a11y-input-537"
                      type="number" inputMode="decimal"
                      value={topRadius}
                      onChange={(e) => setTopRadius(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Bottom Radius ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-538" className="sr-only">Input</label>
<input id="a11y-input-538"
                      type="number" inputMode="decimal"
                      value={bottomRadius}
                      onChange={(e) => setBottomRadius(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Height ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-539" className="sr-only">Input</label>
<input id="a11y-input-539"
                      type="number" inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                </div>
              )}
              {activeShape === "Triangular Dumper" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Base Width ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-540" className="sr-only">Input</label>
<input id="a11y-input-540"
                      type="number" inputMode="decimal"
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Vertical / Triangle Height (
                      {system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-541" className="sr-only">Input</label>
<input id="a11y-input-541"
                      type="number" inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Length ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-542" className="sr-only">Input</label>
<input id="a11y-input-542"
                      type="number" inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                </div>
              )}
              {activeShape === "Trapezoidal Dumper" && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium dark:text-gray-300 uppercase">
                        Top Width ({system === "Metric" ? "m" : "ft"})
                      </label>
                      <><label htmlFor="a11y-input-543" className="sr-only">Input</label>
<input id="a11y-input-543"
                        type="number" inputMode="decimal"
                        value={topWidth}
                        onChange={(e) => setTopWidth(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                      /></>
                    </div>
                    <div>
                      <label className="text-base font-medium dark:text-gray-300 uppercase">
                        Bottom Width ({system === "Metric" ? "m" : "ft"})
                      </label>
                      <><label htmlFor="a11y-input-544" className="sr-only">Input</label>
<input id="a11y-input-544"
                        type="number" inputMode="decimal"
                        value={bottomWidth}
                        onChange={(e) => setBottomWidth(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                      /></>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium dark:text-gray-300 uppercase">
                        Depth / Height ({system === "Metric" ? "m" : "ft"})
                      </label>
                      <><label htmlFor="a11y-input-545" className="sr-only">Input</label>
<input id="a11y-input-545"
                        type="number" inputMode="decimal"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                      /></>
                    </div>
                    <div>
                      <label className="text-base font-medium dark:text-gray-300 uppercase">
                        Length ({system === "Metric" ? "m" : "ft"})
                      </label>
                      <><label htmlFor="a11y-input-546" className="sr-only">Input</label>
<input id="a11y-input-546"
                        type="number" inputMode="decimal"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                      /></>
                    </div>
                  </div>
                </div>
              )}
              {activeShape === "Commercial Tank" && (
                <div className="grid grid-cols-1 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700 rounded-[24px] overflow-hidden">
                  <div className="flex bg-white dark:bg-slate-900 p-1 rounded-[16px] w-fit shadow-sm border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setTankBaseShape("Rectangular")}
                      className={`px-4 py-1.5 rounded-[12px] text-base font-medium transition-all ${tankBaseShape === "Rectangular" ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Rectangular Tank
                    </button>
                    <button
                      onClick={() => setTankBaseShape("Cylindrical")}
                      className={`px-4 py-1.5 rounded-[12px] text-base font-medium transition-all ${tankBaseShape === "Cylindrical" ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Cylindrical Tank
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tankBaseShape === "Rectangular" ? (
                      <>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Length ({system === "Metric" ? "m" : "ft"})</label>
                          <><label htmlFor="a11y-input-547" className="sr-only">Input</label>
<input id="a11y-input-547" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Width ({system === "Metric" ? "m" : "ft"})</label>
                          <><label htmlFor="a11y-input-548" className="sr-only">Input</label>
<input id="a11y-input-548" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Radius ({system === "Metric" ? "m" : "ft"})</label>
                        <><label htmlFor="a11y-input-549" className="sr-only">Input</label>
<input id="a11y-input-549" type="number" inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Main Height ({system === "Metric" ? "m" : "ft"})</label>
                      <><label htmlFor="a11y-input-550" className="sr-only">Input</label>
<input id="a11y-input-550" type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Freeboard (%)</label>
                      <><label htmlFor="a11y-input-551" className="sr-only">Input</label>
<input id="a11y-input-551" type="number" inputMode="decimal" value={freeboardPercent} onChange={(e) => setFreeboardPercent(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dead Storage Depth ({system === "Metric" ? "m" : "ft"})</label>
                      <><label htmlFor="a11y-input-552" className="sr-only">Input</label>
<input id="a11y-input-552" type="number" inputMode="decimal" value={deadStorageDepth} onChange={(e) => setDeadStorageDepth(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-base font-medium dark:text-slate-300 mb-4 cursor-pointer">
                      <><label htmlFor="a11y-input-553" className="sr-only">Input</label>
<input id="a11y-input-553" type="checkbox" checked={hasSlopedBase} onChange={(e) => setHasSlopedBase(e.target.checked)} className="rounded text-indigo-500 focus:ring-indigo-500 bg-white" /></>
                      Include Sloped / Hopper Base
                    </label>
                    {hasSlopedBase && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hopper Depth ({system === "Metric" ? "m" : "ft"})</label>
                          <><label htmlFor="a11y-input-554" className="sr-only">Input</label>
<input id="a11y-input-554" type="number" inputMode="decimal" value={slopedHeight} onChange={(e) => setSlopedHeight(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                        </div>
                        {tankBaseShape === "Rectangular" ? (
                          <>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outlet Length</label>
                              <><label htmlFor="a11y-input-555" className="sr-only">Input</label>
<input id="a11y-input-555" type="number" inputMode="decimal" value={outletLength} onChange={(e) => setOutletLength(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outlet Width</label>
                              <><label htmlFor="a11y-input-556" className="sr-only">Input</label>
<input id="a11y-input-556" type="number" inputMode="decimal" value={outletWidth} onChange={(e) => setOutletWidth(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outlet Radius</label>
                            <><label htmlFor="a11y-input-557" className="sr-only">Input</label>
<input id="a11y-input-557" type="number" inputMode="decimal" value={outletLength} onChange={(e) => setOutletLength(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-[16px] mt-1 font-medium text-white dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all outline-none" /></>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeShape === "Rectangle Tank" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Length ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-558" className="sr-only">Input</label>
<input id="a11y-input-558"
                      type="number" inputMode="decimal"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Width ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-559" className="sr-only">Input</label>
<input id="a11y-input-559"
                      type="number" inputMode="decimal"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Height/Depth ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-560" className="sr-only">Input</label>
<input id="a11y-input-560"
                      type="number" inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                </div>
              )}
              {activeShape === "Concentric Cylinder" && (
                <div className="grid grid-cols-1 mt-2 mb-6 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden bg-slate-50 dark:bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:dark:border-slate-700 shadow-sm text-slate-900 dark:text-white">
                  <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-base font-medium dark:text-gray-300 uppercase">
                            Outer Diameter ({system === "Metric" ? "m" : "ft"})
                          </label>
                          <><label htmlFor="a11y-input-561" className="sr-only">Input</label>
<input id="a11y-input-561"
                            type="number" inputMode="decimal"
                            value={outerDiameter}
                            onChange={(e) => setOuterDiameter(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 transition-all placeholder:text-slate-500 overflow-hidden"
                          /></>
                        </div>
                        <div>
                          <label className="text-base font-medium dark:text-gray-300 uppercase">
                            Inner Diameter ({system === "Metric" ? "m" : "ft"})
                          </label>
                          <><label htmlFor="a11y-input-562" className="sr-only">Input</label>
<input id="a11y-input-562"
                            type="number" inputMode="decimal"
                            value={innerDiameter}
                            onChange={(e) => setInnerDiameter(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 transition-all placeholder:text-slate-500 overflow-hidden"
                          /></>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-base font-medium dark:text-gray-300 uppercase">
                            Length ({system === "Metric" ? "m" : "ft"})
                          </label>
                          <><label htmlFor="a11y-input-563" className="sr-only">Input</label>
<input id="a11y-input-563"
                            type="number" inputMode="decimal"
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 transition-all placeholder:text-slate-500 overflow-hidden"
                          /></>
                        </div>
                        <div>
                          <label className="text-base font-medium dark:text-gray-300 uppercase">
                            Concrete Density ({system === "Metric" ? "kg/m³" : "lb/ft³"})
                          </label>
                          <><label htmlFor="a11y-input-564" className="sr-only">Input</label>
<input id="a11y-input-564"
                            type="number" inputMode="decimal"
                            value={density}
                            onChange={(e) => setDensity(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 transition-all placeholder:text-slate-500 overflow-hidden"
                          /></>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:dark:border-slate-700 shadow-sm relative">
                      <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cross-Section Schematic</div>
                      <svg viewBox="0 0 200 200" className="w-[180px] h-[180px] opacity-90 drop-shadow-sm">
                        {/* Outer circle */}
                        <circle cx="100" cy="100" r="80" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" className="dark:fill-slate-700 dark:stroke-slate-500" />
                        {/* Inner circle (hole) */}
                        <circle cx="100" cy="100" r="50" fill="#ffffff" stroke="#94a3b8" strokeWidth="4" className="dark:fill-slate-900 dark:stroke-slate-500" />
                        {/* Outer diameter dimension line */}
                        <line x1="20" y1="185" x2="180" y2="185" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                        <line x1="20" y1="180" x2="20" y2="190" stroke="#ef4444" strokeWidth="2" />
                        <line x1="180" y1="180" x2="180" y2="190" stroke="#ef4444" strokeWidth="2" />
                        <text x="100" y="198" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Outer Dia.</text>
                        {/* Inner diameter dimension line */}
                        <line x1="50" y1="100" x2="150" y2="100" stroke="#3b82f6" strokeWidth="2" />
                        <circle cx="50" cy="100" r="3" fill="#3b82f6" />
                        <circle cx="150" cy="100" r="3" fill="#3b82f6" />
                        <text x="100" y="95" fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">Inner Dia.</text>
                        {/* Wall Thickness */}
                        <line x1="50" y1="50" x2="20" y2="50" stroke="#10b981" strokeWidth="2" />
                        <circle cx="65" cy="65" r="2" fill="#10b981" />
                        <path d="M 65 65 Q 40 50 20 50" fill="none" stroke="#10b981" strokeWidth="2" />
                        <text x="10" y="45" fill="#10b981" fontSize="10" fontWeight="bold">Wall Thick.</text>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {activeShape === "Prism" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Base Area ({system === "Metric" ? "m²" : "sq.ft"})
                    </label>
                    <><label htmlFor="a11y-input-565" className="sr-only">Input</label>
<input id="a11y-input-565"
                      type="number" inputMode="decimal"
                      value={baseArea}
                      onChange={(e) => setBaseArea(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Base Perimeter ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-566" className="sr-only">Input</label>
<input id="a11y-input-566"
                      type="number" inputMode="decimal"
                      value={basePerimeter}
                      onChange={(e) => setBasePerimeter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                  <div>
                    <label className="text-base font-medium dark:text-gray-300 uppercase">
                      Height ({system === "Metric" ? "m" : "ft"})
                    </label>
                    <><label htmlFor="a11y-input-567" className="sr-only">Input</label>
<input id="a11y-input-567"
                      type="number" inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-[24px] mt-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-700 dark:text-slate-300 overflow-hidden"
                    /></>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col items-stretch h-full">
            <MaterialSummary
               title="Calculated Results"
               totalLabel="Total Volume"
               totalValue={volume.toFixed(2)}
               totalUnit={volUnit || ""}
             >
             {["Trapezoidal Dumper", "Cylinder", "Rectangle Tank"].includes(activeShape) && (
               <SVGShapeVisualizer
                 shape={activeShape}
                 dimensions={{
                   topWidth: Number(topWidth),
                   bottomWidth: Number(bottomWidth),
                   depth: Number(depth),
                   length: Number(length),
                   width: Number(width),
                   height: Number(height),
                   radius: Number(radius)
                 }}
               />
             )}
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                 {activeShape === "Concentric Cylinder" ? (
                   <>
                     <ResultCard
                       title="Total Weight"
                       value={totalWeight.toFixed(2)}
                       unit={system === "Metric" ? "kg" : "lbs"}
                       variant="neutral"
                     />
                     <ResultCard
                       title="Surface Area"
                       value={surfaceArea.toFixed(2)}
                       unit={areaUnit || ""}
                       variant="neutral"
                     />
                   </>
                 ) : (
                   <>
                     <ResultCard
                       title="Surface Area"
                       value={surfaceArea.toFixed(2)}
                       unit={areaUnit || ""}
                       variant="neutral"
                     />
                     <ResultCard
                       title="Liquid Capacity"
                       value={liquidCapacity.toFixed(2)}
                       unit={capacityUnit || ""}
                       variant="neutral"
                     />
                   </>
                 )}
             </div>
                                       
             </MaterialSummary>
             
             {activeShape === "Commercial Tank" && explanationOpts.steps && (
               <div className="mt-4">
                  <DetailedCalculationDisplay steps={explanationOpts.steps} />
               </div>
             )}
          </div>
        </div>
      </div>
      <CalculationHistory
        calculatorId="volume_estimator_v1"
        currentInputs={{ activeShape, length, width, height, side, radius, topRadius, bottomRadius, base, topWidth, bottomWidth, depth, baseArea, basePerimeter }}
        currentResults={{ volVal: volume.toFixed(2), volUnit, surfaceArea: surfaceArea.toFixed(2), liquidCapacity: liquidCapacity.toFixed(2) }}
        summaryGeneration={(inputs, res) => `${inputs.activeShape} Volume: ${res.volVal} ${res.volUnit}`}
        explanation={explanationOpts}
        onRestore={(inputs) => {
          if (inputs.activeShape) setActiveShape(inputs.activeShape);
          if (inputs.length !== undefined) setLength(inputs.length);
          if (inputs.width !== undefined) setWidth(inputs.width);
          if (inputs.height !== undefined) setHeight(inputs.height);
          if (inputs.side !== undefined) setSide(inputs.side);
          if (inputs.radius !== undefined) setRadius(inputs.radius);
          if (inputs.topRadius !== undefined) setTopRadius(inputs.topRadius);
          if (inputs.bottomRadius !== undefined) setBottomRadius(inputs.bottomRadius);
          if (inputs.base !== undefined) setBase(inputs.base);
          if (inputs.topWidth !== undefined) setTopWidth(inputs.topWidth);
          if (inputs.bottomWidth !== undefined) setBottomWidth(inputs.bottomWidth);
          if (inputs.depth !== undefined) setDepth(inputs.depth);
          if (inputs.baseArea !== undefined) setBaseArea(inputs.baseArea);
          if (inputs.basePerimeter !== undefined) setBasePerimeter(inputs.basePerimeter);
        }}
      />
    </div>
  );
}
