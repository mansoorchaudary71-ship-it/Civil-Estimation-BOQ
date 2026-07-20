import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Grid2X2, Zap, Hammer, ChevronRight } from "lucide-react";
import { GenericExportButtons } from "../ui/GenericExportButtons";

type RoomType = "Kitchen" | "Bedroom" | "Drawing Room" | "Washroom" | "Basement";

interface EstimatorResult {
  category: string;
  items: { name: string; unit: string; qty: number; rate?: number; total?: number }[];
}

export function DetailedRoomEstimators() {
  const [activeTab, setActiveTab] = useState<RoomType>("Kitchen");

  const tabs: RoomType[] = ["Kitchen", "Bedroom", "Drawing Room", "Washroom", "Basement"];

  return (
    <div className="w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-500 pb-16">
      <div className="w-full max-w-6xl">
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-[24px] w-fit mx-auto mb-8 shadow-sm border border-slate-200 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-x-auto max-w-full overflow-hidden">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-[24px] text-base font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 "
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-50 rounded-full shadow-xl border border-slate-200 p-6 md:p-8 transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
          >
            {activeTab === "Kitchen" && <KitchenEstimator />}
            {activeTab === "Bedroom" && <BedroomEstimator />}
            {activeTab === "Drawing Room" && <DrawingRoomEstimator />}
            {activeTab === "Washroom" && <WashroomEstimator />}
            {activeTab === "Basement" && <BasementEstimator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultTable({ title, icon: Icon, items, onRateChange }: { title: string, icon: any, items: any[], onRateChange: (name: string, rate: number) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-8 last:mb-0">
      <h4 className="uppercase st mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
        <Icon className="w-4 h-4 text-purple-500"/> {title}
      </h4>
      <div className="w-full bg-white shadow-sm border border-slate-200 rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-600">Item</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Unit</th>
                <th className="py-3 px-4 font-semibold text-right text-slate-600">Qty</th>
                <th className="py-3 px-4 font-semibold text-right text-slate-600 w-32">Rate</th>
                <th className="py-3 px-4 font-semibold text-right text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 text-slate-800">
                  <td className="py-3 px-4 font-medium text-slate-700">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500 text-base font-medium">{item.unit}</td>
                  <td className="py-3 px-4 text-right font-semibold tabular-nums tracking-tight text-purple-600 text-base">{item.qty.toLocaleString(undefined, {maximumFractionDigits: 1})}</td>
                  <td className="py-2 px-4 min-w-[100px]">
                    <><label htmlFor="a11y-input-208" className="sr-only">0.00</label>
<input id="a11y-input-208" type="number" inputMode="decimal"
                      min="0"
                      placeholder="0.00"
                      className="w-full bg-slate-100 border-none rounded-full px-2 py-1.5 text-right sm: focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 focus:outline-none text-slate-800 min-h-[44px] text-base font-normal"
                      onChange={(e) => onRateChange(item.name, parseFloat(e.target.value) || 0)}
                    /></>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {item.total ? (item.total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BaseEstimatorWrapper({ title, inputs, renderInputs, calculate }: { 
  title: string; 
  inputs: any; 
  renderInputs: () => React.ReactNode; 
  calculate: () => EstimatorResult[];
}) {
  const [rates, setRates] = useState<Record<string, number>>({});
  
  const results = useMemo(() => calculate(), [inputs]);

  const resultsWithRates = results.map(cat => ({
    ...cat,
    items: cat.items.map(item => ({
      ...item,
      rate: rates[item.name] || 0,
      total: (rates[item.name] || 0) * item.qty
    }))
  }));

  const grandTotal = resultsWithRates.reduce((acc, cat) => 
    acc + cat.items.reduce((sum, item) => sum + (item.total || 0), 0)
  , 0);

  const handleRateChange = (name: string, rate: number) => {
    setRates(prev => ({ ...prev, [name]: rate }));
  };

  return (
    <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
      <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
        <h3 className="text-lg font-medium text-slate-800 mb-4">{title} Estimator</h3>
        <div className="space-y-6">
          {renderInputs()}
        </div>
      </div>
      <div className="w-full flex-1 min-w-[min(100%,380px)] w-full flex flex-col bg-white p-4 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Calculation Results</h3>
          <div className="text-right">
            <span className="text-base font-medium uppercase tracking-wider block">Grand Total</span>
            <span className="text-xl font-semibold tabular-nums tracking-tight text-purple-600 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>
        <div className="space-y-2">
          {resultsWithRates.map((cat, idx) => (
             <ResultTable key={idx} title={cat.category} icon={cat.category === "Civil Works" ? Hammer : cat.category.includes("MEP") ? Zap : Grid2X2} items={cat.items} onRateChange={handleRateChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommonNumInput({ label, val, setVal, unit }: { label: string, val: string, setVal: (v:string)=>void, unit?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">{label}</label>
      <div className="relative">
        <><label htmlFor="a11y-input-209" className="sr-only">Input</label>
<input id="a11y-input-209" 
          type="number" inputMode="decimal" 
          value={val} onChange={(e)=>setVal(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none transition-all text-slate-800"
        /></>
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-medium">{unit}</span>}
      </div>
    </div>
  );
}

// ============== ESTIMATORS ==============

function KitchenEstimator() {
  const [L, setL] = useState("12");
  const [W, setW] = useState("10");
  const [H, setH] = useState("10");
  const [doorSqft, setDoorSqft] = useState("21");
  const [winSqft, setWinSqft] = useState("16");
  const [counterL, setCounterL] = useState("15");
  const [counterW, setCounterW] = useState("2");
  const [upperCabL, setUpperCabL] = useState("10");
  const [lowerCabL, setLowerCabL] = useState("15");
  const [backsplashH, setBacksplashH] = useState("2");
  const [heavyPoints, setHeavyPoints] = useState("3");

  const cb = () => {
    const _L = parseFloat(L)||0; const _W = parseFloat(W)||0; const _H = parseFloat(H)||0;
    const peri = (_L+_W)*2;
    const grossWallArea = peri * _H;
    const ded = parseFloat(doorSqft) + parseFloat(winSqft);
    const netWallArea = Math.max(0, grossWallArea - ded);
    const floorArea = _L * _W;

    // Civil
    const paintArea = netWallArea + floorArea; // wall + ceiling
    const paintGals = paintArea / 350;
    // Tiling
    const floorTiles = floorArea * 1.05;
    const backsplashArea = (parseFloat(counterL)||0) * (parseFloat(backsplashH)||0) * 1.05;
    
    // Wood & Granite
    const graniteSF = (parseFloat(counterL)||0) * (parseFloat(counterW)||0);
    const mdfLower = (parseFloat(lowerCabL)||0); // linear
    const mdfUpper = (parseFloat(upperCabL)||0); // linear

    return [
      {
        category: "Civil & Finishes",
        items: [
          { name: "Paint / Primer", unit: "Gallons", qty: Math.ceil(paintGals) },
          { name: "Floor Tiling", unit: "Sq.Ft", qty: floorTiles },
          { name: "Backsplash Tiling", unit: "Sq.Ft", qty: backsplashArea },
        ]
      },
      {
        category: "Woodwork & Cabinetry",
        items: [
          { name: "Granite/Marble Countertop", unit: "Sq.Ft", qty: graniteSF },
          { name: "Lower Cabinets", unit: "Linear ft", qty: mdfLower },
          { name: "Upper Cabinets", unit: "Linear ft", qty: mdfUpper },
        ]
      },
      {
        category: "MEP & Appliances",
        items: [
          { name: "Kitchen Sink", unit: "Nos", qty: 1 },
          { name: "Plumbing Points", unit: "Points", qty: 2 },
          { name: "220V Heavy Outlets", unit: "Nos", qty: parseFloat(heavyPoints)||0 },
          { name: "General Lighting", unit: "Points", qty: 6 },
        ]
      }
    ];
  };

  return <BaseEstimatorWrapper title="Kitchen" inputs={null} calculate={cb} renderInputs={() => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 border-b border-slate-200 pb-2 mb-2"><h4 className="text-lg font-medium text-slate-800 mb-4">Room Dimensions</h4></div>
      <CommonNumInput label="Length" val={L} setVal={setL} unit="ft" />
      <CommonNumInput label="Width" val={W} setVal={setW} unit="ft" />
      <CommonNumInput label="Height" val={H} setVal={setH} unit="ft" />
      <CommonNumInput label="Deductions" val={doorSqft} setVal={setDoorSqft} unit="sqft" />
      
      <div className="col-span-2 border-b border-slate-200 pb-2 mt-4 mb-2"><h4 className="text-lg font-medium text-slate-800 mb-4">Kitchen Specifics</h4></div>
      <CommonNumInput label="Countertop Length" val={counterL} setVal={setCounterL} unit="ft" />
      <CommonNumInput label="Countertop Width" val={counterW} setVal={setCounterW} unit="ft" />
      <CommonNumInput label="Lower Cabinets" val={lowerCabL} setVal={setLowerCabL} unit="l.ft" />
      <CommonNumInput label="Upper Cabinets" val={upperCabL} setVal={setUpperCabL} unit="l.ft" />
      <CommonNumInput label="Backsplash Ht." val={backsplashH} setVal={setBacksplashH} unit="ft" />
      <CommonNumInput label="Heavy Outlets" val={heavyPoints} setVal={setHeavyPoints} unit="nos" />
    </div>
  )} />;
}

function BedroomEstimator() {
  const [L, setL] = useState("14");
  const [W, setW] = useState("12");
  const [H, setH] = useState("10");
  const [ded, setDed] = useState("45");
  const [wardrobeL, setWardrobeL] = useState("8");
  const [wardrobeH, setWardrobeH] = useState("9");
  const [acPipe, setAcPipe] = useState("25");

  const cb = () => {
    const _L = parseFloat(L)||0; const _W = parseFloat(W)||0; const _H = parseFloat(H)||0;
    const floorArea = _L * _W;
    const netWallArea = Math.max(0, ((_L+_W)*2*_H) - (parseFloat(ded)||0));
    return [
      {
        category: "Civil & Finishes",
        items: [
          { name: "Paint (Walls + Ceiling)", unit: "Gallons", qty: Math.ceil((netWallArea + floorArea)/350) },
          { name: "Flooring (Wood/Tile)", unit: "Sq.Ft", qty: floorArea * 1.05 },
          { name: "Gypsum False Ceiling", unit: "Sq.Ft", qty: floorArea },
        ]
      },
      {
        category: "Woodwork & Cabinetry",
        items: [
          { name: "Wardrobe / Closet", unit: "Sq.Ft Frontage", qty: (parseFloat(wardrobeL)||0) * (parseFloat(wardrobeH)||0) },
        ]
      },
      {
        category: "MEP",
        items: [
          { name: "AC Copper Piping", unit: "R.Ft", qty: parseFloat(acPipe)||0 },
          { name: "Wiring / Switches", unit: "Points", qty: 8 },
        ]
      }
    ];
  };

  return <BaseEstimatorWrapper title="Bedroom" inputs={null} calculate={cb} renderInputs={() => (
    <div className="grid grid-cols-2 gap-4">
      <CommonNumInput label="Length" val={L} setVal={setL} unit="ft" />
      <CommonNumInput label="Width" val={W} setVal={setW} unit="ft" />
      <CommonNumInput label="Height" val={H} setVal={setH} unit="ft" />
      <CommonNumInput label="Deduct (Doors/Win)" val={ded} setVal={setDed} unit="sqft" />
      <CommonNumInput label="Wardrobe Length" val={wardrobeL} setVal={setWardrobeL} unit="ft" />
      <CommonNumInput label="Wardrobe Height" val={wardrobeH} setVal={setWardrobeH} unit="ft" />
      <CommonNumInput label="AC Piping Length" val={acPipe} setVal={setAcPipe} unit="ft" />
    </div>
  )} />;
}

function DrawingRoomEstimator() {
  const [L, setL] = useState("20");
  const [W, setW] = useState("16");
  const [H, setH] = useState("11");
  const [ded, setDed] = useState("70");
  const [featWallArea, setFeatWallArea] = useState("120");
  const [chandelier, setChandelier] = useState("2");

  const cb = () => {
    const _L = parseFloat(L)||0; const _W = parseFloat(W)||0; const _H = parseFloat(H)||0;
    const floorArea = _L * _W;
    const netWallArea = Math.max(0, ((_L+_W)*2*_H) - (parseFloat(ded)||0) - (parseFloat(featWallArea)||0));
    return [
      {
        category: "Civil & Finishes",
        items: [
          { name: "Paint (Standard Walls + Ceiling)", unit: "Gallons", qty: Math.ceil((netWallArea + floorArea)/350) },
          { name: "Premium Flooring", unit: "Sq.Ft", qty: floorArea * 1.05 },
          { name: "Designer Gypsum Ceiling", unit: "Sq.Ft", qty: floorArea * 1.1 },
        ]
      },
      {
        category: "Feature & Woodwork",
        items: [
          { name: "Feature Wall Cladding", unit: "Sq.Ft", qty: parseFloat(featWallArea)||0 },
        ]
      },
      {
        category: "MEP",
        items: [
          { name: "Chandelier Points", unit: "Nos", qty: parseFloat(chandelier)||0 },
          { name: "Accent Lights (COB/Spot)", unit: "Nos", qty: 12 },
          { name: "General Wiring", unit: "Points", qty: 10 },
        ]
      }
    ];
  };

  return <BaseEstimatorWrapper title="Drawing Room" inputs={null} calculate={cb} renderInputs={() => (
    <div className="grid grid-cols-2 gap-4">
      <CommonNumInput label="Length" val={L} setVal={setL} unit="ft" />
      <CommonNumInput label="Width" val={W} setVal={setW} unit="ft" />
      <CommonNumInput label="Height" val={H} setVal={setH} unit="ft" />
      <CommonNumInput label="Deduct (Doors/Win)" val={ded} setVal={setDed} unit="sqft" />
      <CommonNumInput label="Feature Wall Area" val={featWallArea} setVal={setFeatWallArea} unit="sqft" />
      <CommonNumInput label="Chandelier Points" val={chandelier} setVal={setChandelier} unit="nos" />
    </div>
  )} />;
}

function WashroomEstimator() {
  const [L, setL] = useState("8");
  const [W, setW] = useState("6");
  const [H, setH] = useState("10");
  const [ded, setDed] = useState("20");
  const [commode, setCommode] = useState("1");
  const [vanity, setVanity] = useState("1");
  const [shower, setShower] = useState("1");

  const cb = () => {
    const _L = parseFloat(L)||0; const _W = parseFloat(W)||0; const _H = parseFloat(H)||0;
    const floorArea = _L * _W;
    const netWallArea = Math.max(0, ((_L+_W)*2*_H) - (parseFloat(ded)||0));
    return [
      {
        category: "Civil Works",
        items: [
          { name: "Brick Mortar / Blockwork", unit: "Cu.Ft", qty: netWallArea * 0.375 },
          { name: "Plastering / Render", unit: "Sq.Ft", qty: netWallArea },
          { name: "Waterproofing", unit: "Sq.Ft", qty: floorArea + (netWallArea*0.3) },
        ]
      },
      {
        category: "Finishes",
        items: [
          { name: "Floor Tiling (Anti-slip)", unit: "Sq.Ft", qty: floorArea * 1.05 },
          { name: "Wall Tiling", unit: "Sq.Ft", qty: netWallArea * 1.05 },
          { name: "PVC/Gypsum Ceiling", unit: "Sq.Ft", qty: floorArea },
        ]
      },
      {
        category: "MEP Fixtures",
        items: [
          { name: "Commode/WC", unit: "Nos", qty: parseFloat(commode)||0 },
          { name: "Wash Basin / Vanity", unit: "Nos", qty: parseFloat(vanity)||0 },
          { name: "Shower Setup", unit: "Nos", qty: parseFloat(shower)||0 },
          { name: "UPVC/PPR Running Pipe", unit: "R.Ft", qty: (_L+_W)*2 },
        ]
      }
    ];
  };

  return <BaseEstimatorWrapper title="Washroom" inputs={null} calculate={cb} renderInputs={() => (
    <div className="grid grid-cols-2 gap-4">
      <CommonNumInput label="Length" val={L} setVal={setL} unit="ft" />
      <CommonNumInput label="Width" val={W} setVal={setW} unit="ft" />
      <CommonNumInput label="Height" val={H} setVal={setH} unit="ft" />
      <CommonNumInput label="Deduct (Doors/Win)" val={ded} setVal={setDed} unit="sqft" />
      <CommonNumInput label="Commode/WC" val={commode} setVal={setCommode} unit="nos" />
      <CommonNumInput label="Wash Basin" val={vanity} setVal={setVanity} unit="nos" />
      <CommonNumInput label="Shower Setup" val={shower} setVal={setShower} unit="nos" />
    </div>
  )} />;
}

function BasementEstimator() {
  const [L, setL] = useState("40");
  const [W, setW] = useState("30");
  const [depth, setDepth] = useState("10"); // Excavation depth
  const [wallThick, setWallThick] = useState("0.75"); // 9 inches = 0.75 ft
  const [slabThick, setSlabThick] = useState("1"); // 12 inches
  const [bulkingF, setBulkingF] = useState("1.25");
  const [steelRatio, setSteelRatio] = useState("1.5"); // percent

  const cb = () => {
    const _L = parseFloat(L)||0; const _W = parseFloat(W)||0; const _D = parseFloat(depth)||0;
    const _wT = parseFloat(wallThick)||0; const _sT = parseFloat(slabThick)||0;
    
    // Excavation
    const excCuFt = _L * _W * _D;
    const bulkedExc = excCuFt * (parseFloat(bulkingF)||1.25);
    
    // RCC Base Slab
    const slabCuFt = _L * _W * _sT;
    
    // RCC Retaining Walls (perimeter * depth * thickness)
    const peri = (_L + _W) * 2;
    const wallCuFt = peri * _D * _wT;
    const totalRccCuFt = slabCuFt + wallCuFt;
    
    // Steel (Tons) 1.5% volumetric ratio roughly -> 1 cu.ft of concrete ~ 2.2 kg of steel at 1%
    // Let's use standard rule: Concrete volume (Cft) * (ratio/100) * 222.2 = KG
    const steelKg = totalRccCuFt * ((parseFloat(steelRatio)||1.5)/100) * 222.2;
    const steelTons = steelKg / 1000;

    // Waterproofing Area (Bottom + Outer walls)
    const wpArea = (_L*_W) + (peri * _D);

    return [
      {
        category: "Civil Works - Excavation",
        items: [
          { name: "Earthwork Excavation", unit: "Cu.Ft", qty: excCuFt },
          { name: "Disposal Vol (Bulked)", unit: "Cu.Ft", qty: bulkedExc },
          { name: "Soil Treatment (Termite)", unit: "Sq.Ft", qty: _L*_W },
        ]
      },
      {
        category: "Civil Works - RCC",
        items: [
          { name: "Raft Slab Concrete", unit: "Cu.Ft", qty: slabCuFt },
          { name: "Retaining Wall Concrete", unit: "Cu.Ft", qty: wallCuFt },
          { name: "Steel Reinforcement", unit: "Tons", qty: steelTons },
          { name: "Formwork (Shuttering)", unit: "Sq.Ft", qty: (peri * _D * 2) + (_L*_W) }, 
        ]
      },
      {
        category: "Waterproofing & MEP",
        items: [
          { name: "Membrane Waterproofing", unit: "Sq.Ft", qty: wpArea },
          { name: "Sump Pump Provision", unit: "Nos", qty: 1 },
        ]
      }
    ];
  };

  return <BaseEstimatorWrapper title="Basement" inputs={null} calculate={cb} renderInputs={() => (
    <div className="grid grid-cols-2 gap-4">
      <CommonNumInput label="Length" val={L} setVal={setL} unit="ft" />
      <CommonNumInput label="Width" val={W} setVal={setW} unit="ft" />
      <CommonNumInput label="Excavation Depth" val={depth} setVal={setDepth} unit="ft" />
      <div className="flex flex-col gap-1.5">
        <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Soil Bulking Factor</label>
        <select value={bulkingF} onChange={e=>setBulkingF(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-4 py-2.5 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none transition-all text-slate-800 overflow-hidden">
          <option value="1.15">Hard Soil (1.15)</option>
          <option value="1.25">Normal Soil (1.25)</option>
          <option value="1.35">Loose Soil (1.35)</option>
        </select>
      </div>
      <CommonNumInput label="Retaining Wall Th." val={wallThick} setVal={setWallThick} unit="ft" />
      <CommonNumInput label="Raft Slab Th." val={slabThick} setVal={setSlabThick} unit="ft" />
      <CommonNumInput label="Steel % (Raft+Wall)" val={steelRatio} setVal={setSteelRatio} unit="%" />
    </div>
  )} />;
}
