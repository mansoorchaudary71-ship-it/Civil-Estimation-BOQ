import React, { useState, useMemo } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { Layers, Cuboid, Paintbrush, Square, Ruler, Grid2X2, Settings2, Save, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterFinishesWorkspace() {
  const { addItem } = useBOQ();
  const [activeTab, setActiveTab] = useState('carpet');

  // Shared Room / Built-up State
  const [roomL, setRoomL] = useState(5);
  const [roomW, setRoomW] = useState(4);
  const [roomH, setRoomH] = useState(3);
  const [openingArea, setOpeningArea] = useState(2); // total doors/windows area to deduct

  // 1. Carpet & Built-Up
  const [wallAreaDeductPct, setWallAreaDeductPct] = useState(15);
  const [superBuiltUpAddPct, setSuperBuiltUpAddPct] = useState(20);
  
  // 2. Masonry
  const [masonryType, setMasonryType] = useState('brick'); // brick, aac, hollow
  const [mortarRatio, setMortarRatio] = useState(4); // 1:4
  const [masonryWastage, setMasonryWastage] = useState(5);
  
  // 3. Plaster
  const [plasterIntThick, setPlasterIntThick] = useState(12); // mm
  const [plasterExtThick, setPlasterExtThick] = useState(20); // mm
  const [plasterRatio, setPlasterRatio] = useState(4); // 1:4
  
  // 4. Paint
  const [paintCoverage, setPaintCoverage] = useState(10); // m2/liter per coat
  const [paintCoats, setPaintCoats] = useState(2);
  const [primerCoverage, setPrimerCoverage] = useState(12); // m2/liter
  
  // 5. Flooring
  const [tileSizeL, setTileSizeL] = useState(0.6); // m
  const [tileSizeW, setTileSizeW] = useState(0.6); // m
  const [tilesPerBox, setTilesPerBox] = useState(4);
  const [skirtingHeight, setSkirtingHeight] = useState(0.1); // m
  const [mortarBedThick, setMortarBedThick] = useState(50); // mm

  // 6. Countertops
  const [counterL, setCounterL] = useState(3);
  const [counterW, setCounterW] = useState(0.6);
  const [cutouts, setCutouts] = useState(1);
  const [cutoutArea, setCutoutArea] = useState(0.3); // m2 per cutout

  // 7. Carpentry
  const [studSpacing, setStudSpacing] = useState(0.4); // m
  const [plywoodReUse, setPlywoodReUse] = useState(4);

  // --- Calculations ---

  // Basic Geometrics
  const grossWallArea = 2 * (roomL + roomW) * roomH;
  const netWallArea = Math.max(0, grossWallArea - openingArea);
  const floorArea = roomL * roomW;
  const perimeter = 2 * (roomL + roomW);

  // 1. Carpet Area Results
  const totalBuiltUp = floorArea * (1 / (1 - wallAreaDeductPct / 100)); // Rough estimation
  const carpetArea = floorArea;
  const superBuiltUp = totalBuiltUp * (1 + superBuiltUpAddPct / 100);

  // 2. Masonry Results
  // block volumes in m3
  const brickVol = 0.228 * 0.114 * 0.076; // standard 9x4.5x3 inch approx with mortar
  const aacVol = 0.6 * 0.2 * 0.15;
  const hollowVol = 0.4 * 0.2 * 0.2;
  const wallVol = netWallArea * (masonryType === 'brick' ? 0.23 : masonryType === 'aac' ? 0.15 : 0.2); // approx thickness
  const blockVol = masonryType === 'brick' ? brickVol : masonryType === 'aac' ? aacVol : hollowVol;
  const totalBlocks = Math.ceil((wallVol / blockVol) * (1 + masonryWastage / 100));
  const totalMortarVol = wallVol * (masonryType === 'brick' ? 0.25 : 0.1); // brick takes more mortar

  // 3. Plaster Results
  const plasterIntVol = (netWallArea + floorArea) * (plasterIntThick / 1000); // walls + ceiling
  const plasterExtVol = grossWallArea * (plasterExtThick / 1000); // assume external is gross for simplicity
  const totalPlasterVolDry = (plasterIntVol + plasterExtVol) * 1.33; // Dry volume
  const plasterCement = totalPlasterVolDry / (1 + plasterRatio); // m3
  const plasterSand = plasterCement * plasterRatio; // m3
  const plasterCementBags = Math.ceil(plasterCement / 0.0347);

  // 4. Paint Results
  const paintArea = netWallArea + floorArea; // walls + ceiling
  const primerLiters = Math.ceil(paintArea / primerCoverage);
  const paintLiters = Math.ceil((paintArea * paintCoats) / paintCoverage);

  // 5. Flooring Results
  const tileArea = tileSizeL * tileSizeW;
  const skirtingArea = perimeter * skirtingHeight;
  const totalFloorAreaReq = floorArea + skirtingArea;
  const totalTiles = Math.ceil((totalFloorAreaReq / tileArea) * 1.05); // 5% waste
  const totalTileBoxes = Math.ceil(totalTiles / tilesPerBox);
  const floorMortarVolDry = (floorArea * (mortarBedThick / 1000)) * 1.33;
  const floorCementBags = Math.ceil((floorMortarVolDry / (1 + 4)) / 0.0347); // assume 1:4 mortar

  // 6. Countertops Results
  const counterGrossArea = counterL * counterW;
  const totalCutoutArea = cutouts * cutoutArea;
  const counterNetArea = Math.max(0, counterGrossArea - totalCutoutArea);
  const edgePolishing = counterL + 2 * counterW; // one long edge, two short edges
  const counterSupportVol = counterL * 0.1 * 0.7; // arbitrary support wall

  // 7. Carpentry Results
  const studsCount = Math.ceil(perimeter / studSpacing) + 1; // wall studs
  const plyAreaSqM = netWallArea; // assume covering walls
  const plySheetArea = 1.22 * 2.44; // 4x8 ft approx in m
  const plySheetsReq = Math.ceil(plyAreaSqM / plySheetArea / plywoodReUse);

  // --- BOQ Sync ---
  const syncToBOQ = () => {
    // Masonry
    addItem({ name: `${masonryType.toUpperCase()} Blocks/Bricks`, quantity: totalBlocks, unit: 'Nos', rate: masonryType === 'brick' ? 15 : 100, category: 'Masonry' });
    
    // Plaster
    addItem({ name: 'Plaster Cement', quantity: plasterCementBags, unit: 'Bags', rate: 1200, category: 'Finishes' });
    addItem({ name: 'Plaster Sand', quantity: plasterSand, unit: 'm³', rate: 1000, category: 'Finishes' });
    
    // Paint
    addItem({ name: 'Primer Coat', quantity: primerLiters, unit: 'Liters', rate: 300, category: 'Finishes' });
    addItem({ name: 'Interior/Exterior Paint', quantity: paintLiters, unit: 'Liters', rate: 800, category: 'Finishes' });
    
    // Flooring
    addItem({ name: 'Floor Tiles', quantity: totalTileBoxes, unit: 'Boxes', rate: 2500, category: 'Finishes' });
    addItem({ name: 'Flooring Cement', quantity: floorCementBags, unit: 'Bags', rate: 1200, category: 'Finishes' });
    
    // Countertop
    addItem({ name: 'Granite/Marble Countertop', quantity: counterNetArea, unit: 'm²', rate: 4000, category: 'Finishes' });
    addItem({ name: 'Edge Polishing', quantity: edgePolishing, unit: 'm', rate: 200, category: 'Finishes' });
    
    // Carpentry
    addItem({ name: 'Wood Framing Studs', quantity: studsCount, unit: 'Nos', rate: 500, category: 'Woodwork' });
    addItem({ name: 'Plywood Sheets (4x8)', quantity: plySheetsReq, unit: 'Nos', rate: 1500, category: 'Woodwork' });
  };

  const tabs = [
    { id: 'carpet', name: 'Carpet Area', icon: <Ruler size={16} /> },
    { id: 'masonry', name: 'Masonry', icon: <Cuboid size={16} /> },
    { id: 'plaster', name: 'Plaster', icon: <Layers size={16} /> },
    { id: 'paint', name: 'Paint', icon: <Paintbrush size={16} /> },
    { id: 'flooring', name: 'Flooring', icon: <Grid2X2 size={16} /> },
    { id: 'counter', name: 'Countertops', icon: <Square size={16} /> },
    { id: 'carpentry', name: 'Carpentry', icon: <Scissors size={16} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Complete Finishes & Surfaces Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Masonry, Plaster, Paint, Flooring, Carpentry, and Area computations in one suite.</p>
        </div>
      </div>

      {/* Shared Room State */}
      <div className="bg-slate-900 rounded-2xl p-5 mb-6 text-white shadow-lg flex flex-wrap gap-4 items-end">
        <h3 className="w-full text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Global Room Dimensions</h3>
        <InputGroupDark label="Room Length (m)" value={roomL} onChange={(e: any) => setRoomL(parseFloat(e.target.value) || 0)} />
        <InputGroupDark label="Room Width (m)" value={roomW} onChange={(e: any) => setRoomW(parseFloat(e.target.value) || 0)} />
        <InputGroupDark label="Room Height (m)" value={roomH} onChange={(e: any) => setRoomH(parseFloat(e.target.value) || 0)} />
        <InputGroupDark label="Deductions: Openings Area (m²)" value={openingArea} onChange={(e: any) => setOpeningArea(parseFloat(e.target.value) || 0)} />
        <div className="flex-1 min-w-[200px] bg-slate-800 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Net Wall Area</span>
          <span className="text-2xl font-bold text-indigo-400">{netWallArea.toFixed(2)} <span className="text-sm">m²</span></span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            {t.icon} <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            
            {activeTab === 'carpet' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Carpet & Built-up Factors</h3>
                  <InputGroup label="Wall Area Deduction (%)" value={wallAreaDeductPct} onChange={(e: any) => setWallAreaDeductPct(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Super Built-up Addition (%)" value={superBuiltUpAddPct} onChange={(e: any) => setSuperBuiltUpAddPct(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Area Breakdown</h3>
                  <ResultRow label="RERA Carpet Area (Net)" value={carpetArea} unit="m²" />
                  <ResultRow label="Estimated Built-up Area" value={totalBuiltUp} unit="m²" />
                  <ResultRow label="Super Built-up Area" value={superBuiltUp} unit="m²" />
                </div>
              </>
            )}

            {activeTab === 'masonry' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Block Specifications</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Masonry Type</label>
                    <select
                      value={masonryType}
                      onChange={(e: any) => setMasonryType(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="brick">Red Bricks (9"x4.5"x3")</option>
                      <option value="aac">AAC Blocks (600x200x150)</option>
                      <option value="hollow">Hollow Concrete Blocks (400x200x200)</option>
                    </select>
                  </div>
                  <InputGroup label="Mortar Mix Ratio (1:X)" value={mortarRatio} onChange={(e: any) => setMortarRatio(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Wastage (%)" value={masonryWastage} onChange={(e: any) => setMasonryWastage(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Masonry Takeoff</h3>
                  <ResultRow label="Total Volume" value={wallVol} unit="m³" />
                  <ResultRow label="Required Blocks/Bricks" value={totalBlocks} unit="Nos" digits={0} />
                  <ResultRow label="Mortar Volume" value={totalMortarVol} unit="m³" />
                </div>
              </>
            )}

            {activeTab === 'plaster' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Plaster Configuration</h3>
                  <InputGroup label="Internal Thickness (mm)" value={plasterIntThick} onChange={(e: any) => setPlasterIntThick(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="External Thickness (mm)" value={plasterExtThick} onChange={(e: any) => setPlasterExtThick(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Mix Ratio (1:X)" value={plasterRatio} onChange={(e: any) => setPlasterRatio(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Plaster Material</h3>
                  <ResultRow label="Dry Mortar Volume" value={totalPlasterVolDry} unit="m³" />
                  <ResultRow label="Cement Required" value={plasterCementBags} unit="Bags (50kg)" digits={0} />
                  <ResultRow label="Sand Required" value={plasterSand} unit="m³" />
                </div>
              </>
            )}

            {activeTab === 'paint' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Paint Properties</h3>
                  <InputGroup label="Paint Coverage (m²/L per coat)" value={paintCoverage} onChange={(e: any) => setPaintCoverage(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Number of Coats" value={paintCoats} onChange={(e: any) => setPaintCoats(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Primer Coverage (m²/L)" value={primerCoverage} onChange={(e: any) => setPrimerCoverage(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Paint Estimates</h3>
                  <ResultRow label="Total Paint Area" value={paintArea} unit="m²" />
                  <ResultRow label="Primer Required" value={primerLiters} unit="Liters" digits={0} />
                  <ResultRow label="Paint Required" value={paintLiters} unit="Liters" digits={0} />
                </div>
              </>
            )}

            {activeTab === 'flooring' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Tile & Skirting</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Tile Length (m)" value={tileSizeL} onChange={(e: any) => setTileSizeL(parseFloat(e.target.value) || 0)} />
                    <InputGroup label="Tile Width (m)" value={tileSizeW} onChange={(e: any) => setTileSizeW(parseFloat(e.target.value) || 0)} />
                  </div>
                  <InputGroup label="Tiles per Box" value={tilesPerBox} onChange={(e: any) => setTilesPerBox(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Skirting Height (m)" value={skirtingHeight} onChange={(e: any) => setSkirtingHeight(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Mortar Bed Thickness (mm)" value={mortarBedThick} onChange={(e: any) => setMortarBedThick(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Flooring BOQ</h3>
                  <ResultRow label="Total Area (inc. skirting)" value={totalFloorAreaReq} unit="m²" />
                  <ResultRow label="Tiles Needed" value={totalTiles} unit="Nos" digits={0} />
                  <ResultRow label="Tile Boxes Needed" value={totalTileBoxes} unit="Boxes" digits={0} />
                  <ResultRow label="Mortar Cement (1:4)" value={floorCementBags} unit="Bags" digits={0} />
                </div>
              </>
            )}

            {activeTab === 'counter' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Slab Dimensions</h3>
                  <InputGroup label="Counter Length (m)" value={counterL} onChange={(e: any) => setCounterL(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Counter Width (m)" value={counterW} onChange={(e: any) => setCounterW(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Number of Cutouts (Sink/Hob)" value={cutouts} onChange={(e: any) => setCutouts(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Area per Cutout (m²)" value={cutoutArea} onChange={(e: any) => setCutoutArea(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Stone & Polish</h3>
                  <ResultRow label="Net Granite/Marble Area" value={counterNetArea} unit="m²" />
                  <ResultRow label="Edge Polishing Length" value={edgePolishing} unit="m" />
                  <ResultRow label="Support Wall Volume" value={counterSupportVol} unit="m³" />
                </div>
              </>
            )}

            {activeTab === 'carpentry' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b pb-2 mb-4 dark:border-slate-700">Wood Framing & Panels</h3>
                  <InputGroup label="Stud Spacing (m)" value={studSpacing} onChange={(e: any) => setStudSpacing(parseFloat(e.target.value) || 0)} />
                  <InputGroup label="Plywood Re-use Factor" value={plywoodReUse} onChange={(e: any) => setPlywoodReUse(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Carpentry Estimates</h3>
                  <ResultRow label="Vertical Studs" value={studsCount} unit="Nos" digits={0} />
                  <ResultRow label="Wall Covering Area" value={plyAreaSqM} unit="m²" />
                  <ResultRow label="Plywood Sheets (4x8 ft)" value={plySheetsReq} unit="Nos" digits={0} />
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 overflow-x-auto w-full md:w-auto hide-scrollbar pb-2 md:pb-0">
            <SummaryPill label="Bricks/Blocks" value={totalBlocks} />
            <SummaryPill label="Cement (Bags)" value={plasterCementBags + floorCementBags} />
            <SummaryPill label="Paint (L)" value={paintLiters} />
            <SummaryPill label="Tile Boxes" value={totalTileBoxes} />
          </div>
          <button 
            onClick={syncToBOQ}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <Save size={18} /> Sync All to Master BOQ
          </button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }: { label: string, value: number, onChange: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={0}
        step="any"
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
      />
    </div>
  );
}

function InputGroupDark({ label, value, onChange }: { label: string, value: number, onChange: any }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={0}
        step="any"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-mono"
      />
    </div>
  );
}

function ResultRow({ label, value, unit, digits = 2 }: { label: string, value: number, unit: string, digits?: number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 dark:border-slate-800 last:border-0">
      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</span>
      <div className="text-right flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {isNaN(value) || !isFinite(value) ? "0" : value.toFixed(digits)}
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">{unit}</span>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col shrink-0">
      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{label}</span>
      <span className="text-lg font-black text-slate-800 dark:text-white leading-none mt-1">
        {isNaN(value) || !isFinite(value) ? "0" : value.toLocaleString()}
      </span>
    </div>
  );
}
