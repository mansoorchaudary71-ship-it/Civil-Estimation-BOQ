import React, { useState, useMemo } from "react";
import { X, Droplets, Ruler, Square, Grid2X2, Hammer, Zap, Badge } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculationHistory } from '../ui/CalculationHistory';
import { CodeTooltip } from "../ui/CodeTooltip";

export default function WashroomEstimator({ onClose }: { onClose?: () => void }) {
  const [unit, setUnit] = useState<"ft" | "m">("ft");
  
  // Dimensions
  const [length, setLength] = useState("8");
  const [width, setWidth] = useState("6");
  const [height, setHeight] = useState("10");

  // Deductions
  const [doorH, setDoorH] = useState("7");
  const [doorW, setDoorW] = useState("2.5");
  const [winH, setWinH] = useState("2");
  const [winW, setWinW] = useState("2");
  const [wallThickness, setWallThickness] = useState<"4.5" | "9">("4.5");

  // Finishes
  const [floorTileArea, setFloorTileArea] = useState("4"); // sqft per tile (2x2)
  const [wallTileArea, setWallTileArea] = useState("2"); // sqft per tile (1x2)
  const [tileHeight, setTileHeight] = useState("7");
  const [ceilingType, setCeilingType] = useState<"None" | "Gypsum" | "PVC" | "Plaster">("PVC");

  // MEP
  const [commode, setCommode] = useState("1");
  const [washBasin, setWashBasin] = useState("1");
  const [showerMixer, setShowerMixer] = useState("1");
  const [muslimShower, setMuslimShower] = useState("1");
  const [floorTrap, setFloorTrap] = useState("1");
  const [lightBulbs, setLightBulbs] = useState("2");
  const [exhaustFan, setExhaustFan] = useState("1");
  const [geyserPoint, setGeyserPoint] = useState("1");
  const [shaverSocket, setShaverSocket] = useState("1");

  // Unit converter to feet if unit is meters
  const toFt = (val: string) => unit === "ft" ? parseFloat(val) || 0 : (parseFloat(val) || 0) * 3.28084;
  const toSqFt = (val: string) => unit === "ft" ? parseFloat(val) || 0 : (parseFloat(val) || 0) * 10.7639;

  const results = useMemo(() => {
    const L = toFt(length);
    const W = toFt(width);
    const H = toFt(height);

    const dH = toFt(doorH);
    const dW = toFt(doorW);
    const wH = toFt(winH);
    const wW = toFt(winW);

    const tH = toFt(tileHeight);

    // Areas
    const floorArea = L * W;
    const ceilingArea = floorArea;
    const perimeter = 2 * (L + W);
    const totalWallArea = perimeter * H;
    const doorArea = dH * dW;
    const winArea = wH * wW;
    const deductions = doorArea + winArea;

    const netWallArea = Math.max(0, totalWallArea - deductions);
    
    // Civil
    const wThickFt = wallThickness === "4.5" ? 4.5 / 12 : 9 / 12;
    const wallVolCft = netWallArea * wThickFt;
    // 13.5 bricks per cft
    const bricksCount = Math.ceil(wallVolCft * 13.5);
    const brickMortarDryVol = wallVolCft * 0.3; // 30% mortar
    // 1:4 ratio => 1/5 cement
    const bwCementBags = Math.ceil((brickMortarDryVol * (1/5)) / 1.226);
    const bwSandCft = Math.ceil(brickMortarDryVol * (4/5));

    // Plastering - assuming 0.5 inch (0.0416 ft)
    const plasterVol = netWallArea * 0.0416 * 1.27; // dry vol
    const plCementBags = Math.ceil((plasterVol * (1/5)) / 1.226);
    const plSandCft = Math.ceil(plasterVol * (4/5));

    // Tiles
    const tiledWallArea = Math.max(0, (perimeter * tH) - deductions);
    const fTileA = toSqFt(floorTileArea);
    const wTileA = toSqFt(wallTileArea);
    
    const floorTilesNos = Math.ceil((floorArea * 1.05) / (fTileA || 1));
    const wallTilesNos = Math.ceil((tiledWallArea * 1.05) / (wTileA || 1));
    
    const totalTiledArea = floorArea + tiledWallArea;
    // Approx 1 bag of 20kg bond covers 30-40 sqft
    const bondBags = Math.ceil(totalTiledArea / 35);
    // Grout: 1 kg covers approx 100 sqft
    const groutKg = Math.ceil(totalTiledArea / 100);

    // Ceiling
    let ceilingMat = "None";
    let ceilingQty = 0;
    if (ceilingType === "Gypsum" || ceilingType === "PVC") {
      ceilingMat = `${ceilingType} Panels (sq.ft)`;
      ceilingQty = Math.ceil(ceilingArea * 1.05); // 5% waste
    } else if (ceilingType === "Plaster") {
      ceilingMat = "Plaster Cement (bags)";
      ceilingQty = Math.ceil(((ceilingArea * 0.0416 * 1.27) * (1/5)) / 1.226);
    }

    // MEP running lengths (approximate based on perimeter)
    const pipeLength = Math.ceil(perimeter * 1.5);
    const wireLength = Math.ceil(perimeter * 3);

    return {
      civil: [
        { name: `Bricks (${wallThickness}")`, unit: "Nos", qty: bricksCount },
        { name: "Cement (Bricks)", unit: "Bags", qty: bwCementBags },
        { name: "Sand (Bricks)", unit: "Cu.ft", qty: bwSandCft },
        { name: "Cement (Plaster)", unit: "Bags", qty: plCementBags },
        { name: "Sand (Plaster)", unit: "Cu.ft", qty: plSandCft },
      ],
      finishes: [
        { name: "Floor Tiles", unit: "Nos", qty: floorTilesNos },
        { name: "Wall Tiles", unit: "Nos", qty: wallTilesNos },
        { name: "Tile Bond", unit: "Bags (20kg)", qty: bondBags },
        { name: "Tile Grout", unit: "Kg", qty: groutKg },
        ...(ceilingQty > 0 ? [{ name: ceilingMat, unit: ceilingType === "Plaster" ? "Bags" : "Sq.ft", qty: ceilingQty }] : []),
      ],
      mep: [
        { name: "UPVC/PPR Pipes", unit: "R.ft", qty: pipeLength },
        { name: "Electrical Wiring", unit: "R.ft", qty: wireLength },
        { name: "Commode/WC", unit: "Nos", qty: parseInt(commode) || 0 },
        { name: "Wash Basin", unit: "Nos", qty: parseInt(washBasin) || 0 },
        { name: "Shower Mixer", unit: "Nos", qty: parseInt(showerMixer) || 0 },
        { name: "Muslim Shower", unit: "Nos", qty: parseInt(muslimShower) || 0 },
        { name: "Floor Trap", unit: "Nos", qty: parseInt(floorTrap) || 0 },
        { name: "Light Bulbs", unit: "Nos", qty: parseInt(lightBulbs) || 0 },
        { name: "Exhaust Fan", unit: "Nos", qty: parseInt(exhaustFan) || 0 },
        { name: "Geyser Point", unit: "Nos", qty: parseInt(geyserPoint) || 0 },
        { name: "Shaver Socket", unit: "Nos", qty: parseInt(shaverSocket) || 0 },
      ].filter(x => x.qty > 0)
    };
  }, [length, width, height, doorH, doorW, winH, winW, wallThickness, floorTileArea, wallTileArea, tileHeight, ceilingType, commode, washBasin, showerMixer, muslimShower, floorTrap, lightBulbs, exhaustFan, geyserPoint, shaverSocket, unit]);

  const renderInput = (label: string, val: string, setVal: (v:string)=>void, placeholder="0", suffix="") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-base font-medium uppercase tracking-wider">{label}</label>
      <div className="relative">
        <><label htmlFor="a11y-input-568" className="sr-only">Input</label>
<input id="a11y-input-568" 
          type="number" inputMode="decimal" 
          value={val} 
          onChange={(e)=>setVal(e.target.value)} 
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:dark:border-slate-700 rounded-full px-4 py-2.5 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none transition-all"
        /></>
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-base font-medium">{suffix}</span>}
      </div>
    
      <CalculationHistory calculatorId="washroomestimator_tool" currentInputs={{}} />
</div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] px-4 md:px-0"
    >
      <div className="bg-gradient-to-r from-[var(--accent-purple)] to-indigo-600 p-6 sm:p-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center overflow-hidden">
            <Droplets className="w-6 h-6 text-slate-900 dark:text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Washroom Estimator</h2>
              <span className="bg-blue-500 text-white text-[10px] font-bold tabular-nums tracking-tight uppercase px-2.5 py-1 rounded-full tracking-widest shadow-lg">PRO</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Complete material takeoff for bathrooms</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 bg-slate-900/10 hover:bg-slate-900/20 rounded-full transition-colors text-slate-900 dark:text-white active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Form Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Unit Toggle */}
          <div className="flex bg-slate-200/50 dark:bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:dark:border-slate-700 shadow-sm text-slate-900 dark:text-white p-1 rounded-[24px] w-fit overflow-hidden">
            <button onClick={()=>setUnit("ft")} className={`px-5 py-2 rounded-[24px] text-base font-medium transition-all ${unit === "ft" ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400" : "text-slate-500 hover:text-slate-700"}`}>Feet</button>
            <button onClick={()=>setUnit("m")} className={`px-5 py-2 rounded-[24px] text-base font-medium transition-all ${unit === "m" ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400" : "text-slate-500 hover:text-slate-700"}`}>Meters</button>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <Ruler className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-900 dark:text-white">Dimensions</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {renderInput("Length", length, setLength, "0", unit)}
              {renderInput("Width", width, setWidth, "0", unit)}
              {renderInput("Height", height, setHeight, "0", unit)}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-medium uppercase tracking-wider">Door (H x W)</label>
                <div className="flex gap-2">
                  <><label htmlFor="a11y-input-569" className="sr-only">H</label>
<input id="a11y-input-569" type="number" inputMode="decimal" value={doorH} onChange={e=>setDoorH(e.target.value)} className="w-full bg-white dark:bg-slate-800 border box-border border-slate-200 dark:dark:border-slate-700 rounded-full px-3 py-2.5 text-sm" placeholder="H" /></>
                  <><label htmlFor="a11y-input-570" className="sr-only">W</label>
<input id="a11y-input-570" type="number" inputMode="decimal" value={doorW} onChange={e=>setDoorW(e.target.value)} className="w-full bg-white dark:bg-slate-800 border box-border border-slate-200 dark:dark:border-slate-700 rounded-full px-3 py-2.5 text-sm" placeholder="W" /></>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-medium uppercase tracking-wider"><span className="flex items-center gap-1">Window (H x W) <CodeTooltip standard="IS" code="875 (Part 3)" description="Basic wind speed map for structural design." /></span></label>
                <div className="flex gap-2">
                  <><label htmlFor="a11y-input-571" className="sr-only">H</label>
<input id="a11y-input-571" type="number" inputMode="decimal" value={winH} onChange={e=>setWinH(e.target.value)} className="w-full bg-white dark:bg-slate-800 border box-border border-slate-200 dark:dark:border-slate-700 rounded-full px-3 py-2.5 text-sm" placeholder="H" /></>
                  <><label htmlFor="a11y-input-572" className="sr-only">W</label>
<input id="a11y-input-572" type="number" inputMode="decimal" value={winW} onChange={e=>setWinW(e.target.value)} className="w-full bg-white dark:bg-slate-800 border box-border border-slate-200 dark:dark:border-slate-700 rounded-full px-3 py-2.5 text-sm" placeholder="W" /></>
                </div>
              </div>
            </div>
            <div className="mt-4">
                <label className="text-base font-medium uppercase tracking-wider block mb-2">Wall Thickness</label>
                <div className="flex gap-3">
                  <button onClick={() => setWallThickness("4.5")} className={`flex-1 py-2.5 rounded-[24px] border text-base font-medium transition-colors ${wallThickness === "4.5" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>4.5 inch</button>
                  <button onClick={() => setWallThickness("9")} className={`flex-1 py-2.5 rounded-[24px] border text-base font-medium transition-colors ${wallThickness === "9" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>9 inch</button>
                </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <Grid2X2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-900 dark:text-white">Finishes & Ceiling</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderInput("Floor Tile Area", floorTileArea, setFloorTileArea, "0", `sq${unit}`)}
              {renderInput("Wall Tile Area", wallTileArea, setWallTileArea, "0", `sq${unit}`)}
              {renderInput("Tile Height", tileHeight, setTileHeight, "0", unit)}
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-medium uppercase tracking-wider">Ceiling Type</label>
                <select value={ceilingType} onChange={e=>setCeilingType(e.target.value as any)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:dark:border-slate-700 rounded-[24px] px-3 py-2.5 text-base font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 overflow-hidden">
                  <option value="None">None</option>
                  <option value="Gypsum">Gypsum Board</option>
                  <option value="PVC">PVC Panels</option>
                  <option value="Plaster">Plaster</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-900 dark:text-white">Plumbing & Electrical</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-3">
              {renderInput("Commode/WC", commode, setCommode, "0", "nos")}
              {renderInput("Wash Basin", washBasin, setWashBasin, "0", "nos")}
              {renderInput("Shower Mixer", showerMixer, setShowerMixer, "0", "nos")}
              {renderInput("Muslim Shower", muslimShower, setMuslimShower, "0", "nos")}
              {renderInput("Floor Trap", floorTrap, setFloorTrap, "0", "nos")}
              {renderInput("Exhaust Fan", exhaustFan, setExhaustFan, "0", "nos")}
              {renderInput("Light Bulbs", lightBulbs, setLightBulbs, "0", "nos")}
              {renderInput("Geyser Point", geyserPoint, setGeyserPoint, "0", "nos")}
              {renderInput("Shaver Socket", shaverSocket, setShaverSocket, "0", "nos")}
            </div>
          </section>

        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <div className="w-full bg-white dark:bg-slate-800 rounded-[24px] p-4 sm:p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-4 sm:p-4 sm:p-8 shadow-sm flex-1 border border-slate-200 dark:dark:border-slate-700 overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-white mb-6">Bill of Quantities</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              
              <div>
                <h4 className="text-base font-medium uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Hammer className="w-4 h-4"/> Civil Works</h4>
                <div className="bg-slate-50 dark:bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:dark:border-slate-700 shadow-sm text-slate-900 dark:text-white rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8fafc] dark:bg-slate-800 text-slate-500">
                      <tr>
                        <th className="py-3 px-4 font-semibold uppercase text-sm tracking-wider">Item Name</th>
                        <th className="py-3 px-4 font-semibold text-right uppercase text-sm tracking-wider">Qty</th>
                        <th className="py-3 px-4 font-semibold uppercase text-sm tracking-wider">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {results.civil.map((item, i) => (
                        <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.name}</td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums tracking-tight text-purple-600 dark:text-purple-400 text-base">{item.qty}</td>
                          <td className="py-3 px-4 text-slate-500 text-base font-medium">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                 <h4 className="text-base font-medium uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Grid2X2 className="w-4 h-4"/> Tiles & Finishes</h4>
                 <div className="bg-slate-50 dark:bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:dark:border-slate-700 shadow-sm text-slate-900 dark:text-white rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-[#f8fafc] dark:bg-slate-800 text-slate-500">
                       <tr>
                         <th className="py-3 px-4 font-semibold uppercase text-sm tracking-wider">Item Name</th>
                         <th className="py-3 px-4 font-semibold text-right uppercase text-sm tracking-wider">Qty</th>
                         <th className="py-3 px-4 font-semibold uppercase text-sm tracking-wider">Unit</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {results.finishes.map((item, i) => (
                         <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                           <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.name}</td>
                           <td className="py-3 px-4 text-right font-bold tabular-nums tracking-tight text-purple-600 dark:text-purple-400 text-base">{item.qty}</td>
                           <td className="py-3 px-4 text-slate-500 text-base font-medium">{item.unit}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>

              <div>
                 <h4 className="text-base font-medium uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Zap className="w-4 h-4"/> Plumbing & Electrical</h4>
                 <div className="bg-slate-50 dark:bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-200 dark:dark:border-slate-700 shadow-sm text-slate-900 dark:text-white rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-[#f8fafc] dark:bg-slate-800 text-slate-500">
                       <tr>
                         <th className="py-3 px-4 font-semibold uppercase text-sm tracking-wider">Item Name</th>
                         <th className="py-3 px-4 font-semibold text-right uppercase text-sm tracking-wider">Qty</th>
                         <th className="py-3 px-4 font-semibold uppercase text-sm tracking-wider">Unit</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {results.mep.map((item, i) => (
                         <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                           <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.name}</td>
                           <td className="py-3 px-4 text-right font-bold tabular-nums tracking-tight text-purple-600 dark:text-purple-400 text-base">{item.qty}</td>
                           <td className="py-3 px-4 text-slate-500 text-base font-medium">{item.unit}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
