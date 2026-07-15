import React, { useState } from "react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { Sliders, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { CalculationHistory } from '../ui/CalculationHistory';
export type SpecsState = {
  // 1. Foundation & Substructure
  foundationDepth: string;
  termiteProofing: boolean;
  dpcLayers: string;
  backfillSand: string;
  excavationVolume: string; // New
  soilTreatment: string; // New
  
  // 2. Above-Ground Work (Civil & Superstructure)
  brickQuality: string;
  steelGrade: string;
  cementSandRatio: string;
  concreteMixRatio: string;
  slabThickness: string;
  lintelThickness: string;
  roofInsulation: string; // New added to civil
  boundaryWallSpecs: string; // New
  
  // 3. Finishing & Surfaces
  flooringType: string;
  internalWallFinish: string;
  exteriorFinish: string;
  ceilingType: string;
  plastering: string; // New
  waterproofing: string; // New
  
  // 4. Woodwork & Openings
  mainGate: string;
  windowFrames: string;
  windowGlass: string; // New
  mainDoor: string;
  internalDoors: string;
  includeWardrobes: boolean;
  wardrobeMaterial: string;
  kitchenWoodwork: string; // New
  
  // 5. MEP
  plumbingPipes: string;
  sanitaryFittings: string;
  electricalWiring: string;
  switchesBoards: string;
  acCopperPiping: string; // New
  generalLighting: string; // New
  waterTankCapacity: string; // New
  kitchenSinks: string; // New
  geyserPoints: string; // New
};

export const initialSpecs: SpecsState = {
  foundationDepth: "3",
  termiteProofing: true,
  dpcLayers: "Single",
  backfillSand: "Ravi",
  excavationVolume: "Standard (Auto-calculated)",
  soilTreatment: "Standard Chemical",
  brickQuality: "A-Class",
  steelGrade: "Grade 60",
  cementSandRatio: "1:4",
  concreteMixRatio: "1:2:4",
  slabThickness: "6",
  lintelThickness: "9",
  roofInsulation: "Standard (Bitumen + Poly)",
  boundaryWallSpecs: "Standard 9-inch",
  flooringType: "Porcelain Tiles",
  internalWallFinish: "Plastic Emulsion",
  exteriorFinish: "Weather Shield",
  ceilingType: "False Ceiling (Gypsum)",
  plastering: "1:4 Cement Sand",
  waterproofing: "Standard DP",
  mainGate: "16-gauge Steel",
  windowFrames: "Aluminum (1.2mm)",
  windowGlass: "5mm Clear",
  mainDoor: "Solid Ash Wood",
  internalDoors: "Flush Doors",
  includeWardrobes: true,
  wardrobeMaterial: "Lasani",
  kitchenWoodwork: "UV Sheets",
  plumbingPipes: "PPRC standard",
  sanitaryFittings: "Standard",
  electricalWiring: "3/0.29 & 7/0.29 Standard",
  switchesBoards: "Local Standard",
  acCopperPiping: "Standard 22 Gauge",
  generalLighting: "Standard SMD/LED",
  waterTankCapacity: "1000 Gallons",
  kitchenSinks: "Double Bowl Stainless",
  geyserPoints: "2 Points",
};
interface Props {
  specs: SpecsState;
  setSpecs: React.Dispatch<React.SetStateAction<SpecsState>>;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}
export default function AdvancedSpecs({
  specs,
  setSpecs,
  isOpen,
  setIsOpen,
}: Props) {
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const updateSpec = <K extends keyof SpecsState>(
    key: K,
    value: SpecsState[K],
  ) => {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  };
  const toggleCategory = (idx: number) => {
    setOpenCategory((prev) => (prev === idx ? null : idx));
  };
  const renderDropdown = (
    label: string,
    specKey: keyof SpecsState,
    options: string[],
    tooltip?: string
  ) => (
    <div className="space-y-2 col-span-2 relative">
      <div className="flex justify-between items-center">
        <label className="uppercase tracking-widest flex items-center gap-1 text-sm font-medium text-slate-700 mb-1 block">
          {label}
        </label>
        {tooltip && (
          <div className="relative group/tooltip flex items-center">
            <HelpCircle className="w-3.5 h-3.5 text-slate-600 cursor-help" />
            <div className="absolute z-[100] invisible opacity-0 group-hover/tooltip:visible group-hover/tooltip:opacity-100 transition-all duration-200 bottom-[calc(100%+8px)] right-0 w-max max-w-[220px] bg-white text-slate-900 text-sm p-2 rounded-lg shadow-xl pointer-events-none whitespace-normal text-center font-medium after:content-[''] after:absolute after:top-full after:right-2 after:border-4 after:border-transparent after:border-t-slate-800">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <select
          value={specs[specKey] as string}
          onChange={(e) => updateSpec(specKey, e.target.value)}
          className="w-full bg-transparent border border-slate-200 text-slate-800 rounded-[24px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium appearance-none text-sm cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
  const renderNumber = (
    label: string,
    specKey: keyof SpecsState,
    placeholder?: string,
  ) => (
    <div className="space-y-2 col-span-2 sm:col-span-1">
      <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">
        {label}
      </label>
      <><label htmlFor="a11y-input-32" className="sr-only">Input</label>
<input id="a11y-input-32"
        type="number" inputMode="decimal"
        value={specs[specKey] as string}
        onChange={(e) => updateSpec(specKey, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-slate-200 text-slate-800 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 font-medium text-sm"
      /></>
    </div>
  );
  const renderToggle = (label: string, specKey: keyof SpecsState) => (
    <div className="flex items-center justify-between col-span-2 bg-transparent border border-slate-200 rounded-[24px] px-4 py-2.5 overflow-hidden">
      <span className="text-base font-medium">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer text-sm font-medium text-slate-700 mb-1 block">
        <><label htmlFor="a11y-input-33" className="sr-only">Input</label>
<input id="a11y-input-33"
          type="checkbox"
          checked={specs[specKey] as boolean}
          onChange={(e) => updateSpec(specKey, e.target.checked)}
          className="sr-only peer"
        /></>
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );
  return (
    <div className="tool-card p-6 transition-all duration-300">
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-[24px] overflow-hidden">
            <Sliders className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
            Advanced Specifications
          </h2>
        </div>
        <div className="p-2 bg-transparent text-slate-700 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>
      {!isOpen && (
        <p className="text-base font-normal text-slate-600 leading-relaxed">
          Using standard smart defaults for accurate initial estimates.
        </p>
      )}
      {isOpen && (
        <div className="mt-6 space-y-3 animate-in fade-in zoom-in-95">
          {/* 1. Foundation & Substructure */}
          <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => toggleCategory(0)}
              className="w-full flex items-center justify-between p-4 bg-transparent/50 hover:bg-transparent text-left transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <span className="font-bold text-sm text-slate-800">
                1. Foundation & Substructure
              </span>
              {openCategory === 0 ? (
                <ChevronUp className="w-4 h-4 text-slate-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-700" />
              )}
            </button>
            {openCategory === 0 && (
              <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-100">
                {renderNumber("Foundation Depth (ft)", "foundationDepth")}
                {renderDropdown("DPC Layers", "dpcLayers", [
                  "Single",
                  "Double",
                ])}
                {renderToggle("Termite Proofing", "termiteProofing")}
                {renderDropdown("Backfill Sand Quality", "backfillSand", [
                  "Ravi",
                  "Chenab",
                  "Local",
                ])}
                {renderDropdown("Excavation Volume", "excavationVolume", [
                  "Standard (Auto-calculated)",
                  "Custom High",
                  "Custom Low",
                ])}
                {renderDropdown("Soil Treatment", "soilTreatment", [
                  "Standard Chemical",
                  "Premium Anti-Termite",
                  "None",
                ])}
              </div>
            )}
          </div>
          {/* 2. Superstructure (Grey Structure) */}
          <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => toggleCategory(1)}
              className="w-full flex items-center justify-between p-4 bg-transparent/50 hover:bg-transparent text-left transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <span className="font-bold text-sm text-slate-800">
                2. Above-Ground Work (Walls & Roof)
              </span>
              {openCategory === 1 ? (
                <ChevronUp className="w-4 h-4 text-slate-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-700" />
              )}
            </button>
            {openCategory === 1 && (
              <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-100">
                {renderDropdown("Brick Quality", "brickQuality", [
                  "A-Class",
                  "B-Class",
                  "Fly Ash",
                ])}
                {renderDropdown("Steel Grade", "steelGrade", [
                  "Grade 40",
                  "Grade 60",
                ])}
                {renderDropdown("Cement/Sand Mortar Ratio", "cementSandRatio", [
                  "1:3",
                  "1:4",
                  "1:5",
                ], "Proportion of Cement to Sand used for brick joining.")}
                {renderDropdown("Concrete Mix Ratio", "concreteMixRatio", [
                  "1:1.5:3",
                  "1:2:4",
                  "1:3:6",
                ], "Proportion of Cement to Sand to Crush. Defines structural strength.")}
                {renderNumber("Slab Thickness (in)", "slabThickness")}
                {renderNumber("Lintel Thickness (in)", "lintelThickness")}
                {renderDropdown("Roof Insulation", "roofInsulation", [
                  "Standard (Bitumen + Poly)",
                  "Premium (Jumbolon + PU)",
                  "Basic (Mud)",
                ])}
                {renderDropdown("Boundary Wall", "boundaryWallSpecs", [
                  "Standard 9-inch",
                  "Lightweight 4.5-inch",
                  "Precast Concrete",
                ])}
              </div>
            )}
          </div>
          {/* 3. Finishing & Surfaces */}
          <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => toggleCategory(2)}
              className="w-full flex items-center justify-between p-4 bg-transparent/50 hover:bg-transparent text-left transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <span className="font-bold text-sm text-slate-800">
                3. Finishing & Surfaces
              </span>
              {openCategory === 2 ? (
                <ChevronUp className="w-4 h-4 text-slate-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-700" />
              )}
            </button>
            {openCategory === 2 && (
              <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-100">
                {renderDropdown("Flooring Type", "flooringType", [
                  "Ceramic Tiles",
                  "Porcelain Tiles",
                  "Marble",
                  "Wooden",
                  "Terrazzo",
                ])}
                {renderDropdown("Internal Paint", "internalWallFinish", [
                  "Distemper",
                  "Matt Enamel",
                  "Plastic Emulsion",
                  "Wallpaper",
                ])}
                {renderDropdown("External Paint", "exteriorFinish", [
                  "Plaster & Paint",
                  "Rockwall",
                  "Weather Shield",
                  "Tiles",
                ])}
                {renderDropdown("Ceiling Type", "ceilingType", [
                  "Plaster",
                  "False Ceiling (Gypsum)",
                  "POP",
                ])}
                {renderDropdown("Plastering Quality", "plastering", [
                  "1:4 Cement Sand",
                  "1:6 Cement Sand",
                  "Premium Smooth",
                ])}
                {renderDropdown("Waterproofing", "waterproofing", [
                  "Standard DP",
                  "Chemical Coating",
                  "Membrane Sheet",
                ])}
              </div>
            )}
          </div>
          {/* 4. Woodwork & Openings (Doors/Windows) */}
          <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => toggleCategory(3)}
              className="w-full flex items-center justify-between p-4 bg-transparent/50 hover:bg-transparent text-left transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <span className="font-bold text-sm text-slate-800">
                4. Woodwork & Openings
              </span>
              {openCategory === 3 ? (
                <ChevronUp className="w-4 h-4 text-slate-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-700" />
              )}
            </button>
            {openCategory === 3 && (
              <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-100">
                {renderDropdown("Main Gate", "mainGate", [
                  "16-gauge Steel",
                  "14-gauge Steel",
                  "Wrought Iron",
                ])}
                {renderDropdown("Window Frames", "windowFrames", [
                  "Aluminum (1.2mm)",
                  "Aluminum (1.6mm)",
                  "UPVC",
                ])}
                {renderDropdown("Window Glass", "windowGlass", [
                  "5mm Clear",
                  "8mm Tempered",
                  "Double Glazed",
                ])}
                {renderDropdown("Main Door Material", "mainDoor", [
                  "Solid Ash Wood",
                  "Solid Diyar",
                  "MDF",
                ])}
                {renderDropdown("Internal Doors", "internalDoors", [
                  "Flush Doors",
                  "Semi-Solid",
                  "Lamination",
                ])}
                {renderToggle("Include Wardrobes/Cabinets", "includeWardrobes")}
                {specs.includeWardrobes &&
                  renderDropdown("Wardrobes Material", "wardrobeMaterial", [
                    "UV",
                    "Lasani",
                    "Solid Wood",
                  ])}
                {renderDropdown("Kitchen Woodwork", "kitchenWoodwork", [
                  "UV Sheets",
                  "Acrylic",
                  "Lasani",
                  "Solid Wood",
                ])}
              </div>
            )}
          </div>
          {/* 5. MEP (Mechanical, Electrical, Plumbing) */}
          <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => toggleCategory(4)}
              className="w-full flex items-center justify-between p-4 bg-transparent/50 hover:bg-transparent text-left transition-colors rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <span className="font-bold text-sm text-slate-800">
                5. MEP Services
              </span>
              {openCategory === 4 ? (
                <ChevronUp className="w-4 h-4 text-slate-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-700" />
              )}
            </button>
            {openCategory === 4 && (
              <div className="p-4 grid grid-cols-2 gap-4 border-t border-slate-100">
                {renderDropdown("Electrical Wiring", "electricalWiring", [
                  "3/0.29 & 7/0.29 Standard",
                  "Premium Brand",
                ])}
                {renderDropdown("Switches & Sockets", "switchesBoards", [
                  "Local Standard",
                  "Premium",
                  "Smart Switches",
                ])}
                {renderDropdown("AC Copper Piping", "acCopperPiping", [
                  "Standard 22 Gauge",
                  "Premium 20 Gauge",
                ])}
                {renderDropdown("General Lighting", "generalLighting", [
                  "Standard SMD/LED",
                  "Premium COB/Profile",
                  "Basic LED",
                ])}
                {renderDropdown("Plumbing Pipes", "plumbingPipes", [
                  "PPRC standard",
                  "PPRC Premium",
                  "UPVC",
                ])}
                {renderDropdown("Sanitary Ware Quality", "sanitaryFittings", [
                  "Standard", 
                  "Premium", 
                  "Luxury",
                ])}
                {renderDropdown("Water Tank", "waterTankCapacity", [
                  "500 Gallons",
                  "1000 Gallons",
                  "1500 Gallons",
                ])}
                {renderDropdown("Kitchen Sinks", "kitchenSinks", [
                  "Single Bowl",
                  "Double Bowl Stainless",
                  "Handmade Luxury",
                ])}
                {renderDropdown("Geyser Points", "geyserPoints", [
                  "1 Point",
                  "2 Points",
                  "3+ Points",
                ])}
              </div>
            )}
          </div>
        </div>
      )}
    
      
      <CalculationHistory calculatorId="advancedspecs_tool" currentInputs={{}} />
</div>
  );
}
