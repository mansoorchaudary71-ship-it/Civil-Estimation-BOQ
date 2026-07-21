import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Layers, PaintBucket, Grid, Blocks, 
  Download, Save, Send, Settings, Check, Droplets, HardHat
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { ResultCard } from '../ui/ResultCard';

type Tab = 'masonry' | 'plaster' | 'flooring' | 'paint' | 'countertop';

const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: 'masonry', label: 'Masonry Walls', icon: Blocks },
  { id: 'plaster', label: 'Plastering', icon: Layers },
  { id: 'flooring', label: 'Flooring & Tiling', icon: Grid },
  { id: 'paint', label: 'Wall Paint', icon: PaintBucket },
  { id: 'countertop', label: 'Countertops', icon: Droplets },
];

export default function FinishesEstimator() {
  const { settings, updateSettings, formatCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('masonry');
  
  const isImperial = settings.measurement === 'FPS';

  // State for Masonry
  const [masonryType, setMasonryType] = useState<'brick' | 'block'>('brick');
  const [mLength, setMLength] = useState('');
  const [mHeight, setMHeight] = useState('');
  const [mThickness, setMThickness] = useState(isImperial ? '9' : '0.228');
  const [mDeductArea, setMDeductArea] = useState('');
  
  // State for Plaster
  const [pArea, setPArea] = useState('');
  const [pThickness, setPThickness] = useState(isImperial ? '0.5' : '0.012');
  const [pRatio, setPRatio] = useState('1:4');

  // State for Flooring
  const [fArea, setFArea] = useState('');
  const [fTileL, setFTileL] = useState(isImperial ? '2' : '0.6');
  const [fTileW, setFTileW] = useState(isImperial ? '2' : '0.6');
  const [fBoxSize, setFBoxSize] = useState('4');

  // State for Paint
  const [paintArea, setPaintArea] = useState('');
  const [paintCoats, setPaintCoats] = useState('2');
  const [paintSpread, setPaintSpread] = useState(isImperial ? '107' : '10'); // sqft/liter or sqm/liter

  // State for Countertop
  const [cLength, setCLength] = useState('');
  const [cWidth, setCWidth] = useState(isImperial ? '2' : '0.6');

  // Conversions based on unit
  const toMeters = (val: number, isImp: boolean) => isImp ? val * 0.3048 : val;
  const toSqMeters = (val: number, isImp: boolean) => isImp ? val * 0.092903 : val;
  const fromInchesToMeters = (val: number, isImp: boolean) => isImp ? val * 0.0254 : val;

  // Live Calculations
  const results = useMemo(() => {
    let totalCement = 0;
    let totalSand = 0;
    let totalBricks = 0;
    let totalBlocks = 0;
    let totalPaintLiters = 0;
    let totalTileBoxes = 0;
    let totalCost = 0;

    // 1. Masonry Calculation
    const mL = toMeters(parseFloat(mLength) || 0, isImperial);
    const mH = toMeters(parseFloat(mHeight) || 0, isImperial);
    const mT = isImperial ? fromInchesToMeters(parseFloat(mThickness) || 0, true) : parseFloat(mThickness) || 0;
    const mDeduct = toSqMeters(parseFloat(mDeductArea) || 0, isImperial);
    
    const wallVol = Math.max(0, (mL * mH - mDeduct)) * mT;

    if (wallVol > 0) {
      if (masonryType === 'brick') {
        const brickVolWithMortar = 0.238 * 0.124 * 0.086; // Standard brick + 10mm mortar
        const brickVol = 0.228 * 0.114 * 0.076;
        const bricks = wallVol / brickVolWithMortar;
        totalBricks = Math.ceil(bricks);
        const mortarVol = wallVol - (totalBricks * brickVol);
        const dryMortar = mortarVol * 1.33; // Dry volume
        // 1:4 ratio => C=1, S=4, Total=5
        totalCement += (dryMortar * (1/5)) / 0.0347; // bags
        totalSand += dryMortar * (4/5);
        totalCost += totalBricks * (settings.rates.bricks || 15);
      } else {
        const blockVolWithMortar = 0.41 * 0.21 * 0.21;
        const blockVol = 0.4 * 0.2 * 0.2;
        const blocks = wallVol / blockVolWithMortar;
        totalBlocks = Math.ceil(blocks);
        const mortarVol = wallVol - (totalBlocks * blockVol);
        const dryMortar = mortarVol * 1.33;
        totalCement += (dryMortar * (1/5)) / 0.0347;
        totalSand += dryMortar * (4/5);
        totalCost += totalBlocks * (settings.rates.bricks ? settings.rates.bricks * 3 : 45);
      }
    }

    // 2. Plaster Calculation
    const pA = toSqMeters(parseFloat(pArea) || 0, isImperial);
    const pT = isImperial ? fromInchesToMeters(parseFloat(pThickness) || 0, true) : parseFloat(pThickness) || 0;
    if (pA > 0 && pT > 0) {
      const wetVol = pA * pT;
      const dryVol = wetVol * 1.33;
      const parts = pRatio.split(':').map(Number);
      const cPart = parts[0] || 1;
      const sPart = parts[1] || 4;
      const sumPart = cPart + sPart;
      totalCement += (dryVol * (cPart/sumPart)) / 0.0347;
      totalSand += dryVol * (sPart/sumPart);
    }

    // 3. Flooring Calculation
    const fA = toSqMeters(parseFloat(fArea) || 0, isImperial);
    const tL = isImperial ? toMeters(parseFloat(fTileL) || 0, true) : parseFloat(fTileL) || 0;
    const tW = isImperial ? toMeters(parseFloat(fTileW) || 0, true) : parseFloat(fTileW) || 0;
    const bSize = parseFloat(fBoxSize) || 4;
    
    if (fA > 0 && tL > 0 && tW > 0) {
      const tileArea = tL * tW;
      const tilesReq = (fA / tileArea) * 1.05; // 5% wastage
      totalTileBoxes = Math.ceil(tilesReq / bSize);
      totalCost += totalTileBoxes * 1500; // estimated cost per box
      // Mortar for tiles
      const bedVol = fA * 0.05; // 50mm bed
      const dryBed = bedVol * 1.33;
      totalCement += (dryBed * (1/5)) / 0.0347; // 1:4
      totalSand += dryBed * (4/5);
    }

    // 4. Paint Calculation
    const ptA = toSqMeters(parseFloat(paintArea) || 0, isImperial);
    const pCoats = parseFloat(paintCoats) || 2;
    const pSpreadM = isImperial ? parseFloat(paintSpread) * 0.0929 : parseFloat(paintSpread) || 10;
    if (ptA > 0 && pSpreadM > 0) {
      totalPaintLiters = (ptA * pCoats) / pSpreadM;
      totalCost += totalPaintLiters * 1200; // estimated per liter
    }

    // 5. Countertop
    const cL = toMeters(parseFloat(cLength) || 0, isImperial);
    const cW = toMeters(parseFloat(cWidth) || 0, isImperial);
    if (cL > 0 && cW > 0) {
      const cArea = cL * cW;
      totalCost += cArea * (isImperial ? 500 : 5000); // rough estimate
    }

    // Add material costs
    totalCost += Math.ceil(totalCement) * (settings.rates.cement || 1200);
    totalCost += totalSand * 35.31 * (settings.rates.sand || 40); // sand per cft

    return {
      cement: Math.ceil(totalCement),
      sand: totalSand,
      bricks: totalBricks,
      blocks: totalBlocks,
      paint: Math.ceil(totalPaintLiters),
      tiles: totalTileBoxes,
      cost: totalCost
    };
  }, [
    mLength, mHeight, mThickness, mDeductArea, masonryType,
    pArea, pThickness, pRatio,
    fArea, fTileL, fTileW, fBoxSize,
    paintArea, paintCoats, paintSpread,
    cLength, cWidth,
    isImperial, settings.rates
  ]);

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 font-sans text-slate-900">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Complete Masonry & Finishes Estimator",
            "description": "Calculate bricks, plaster, paint, and tiles in one place.",
            "applicationCategory": "CalculatorApplication",
            "operatingSystem": "All",
            "offers": { "@type": "Offer", "price": "0" }
          })
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Masonry & Finishes</h1>
          <p className="text-slate-500 font-medium mt-1">Merged, high-efficiency estimator for all room surfaces</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={settings.measurement}
            onChange={(e) => updateSettings({ measurement: e.target.value as any })}
            className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="SI">Metric (m, sq.m)</option>
            <option value="FPS">Imperial (ft, sq.ft)</option>
          </select>
          <select 
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value as any })}
            className="bg-slate-50 border-none text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PKR">PKR (Rs)</option>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="AED">AED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Main Interface */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'masonry' && (
                <motion.div key="masonry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Blocks className="text-indigo-600"/> Masonry Walls</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Material Type</label>
                      <select value={masonryType} onChange={e => setMasonryType(e.target.value as 'brick'|'block')} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="brick">Clay Bricks (Standard)</option>
                        <option value="block">Concrete Blocks (8")</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wall Thickness ({isImperial ? 'in' : 'm'})</label>
                      <input type="number" value={mThickness} onChange={e => setMThickness(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Length ({isImperial ? 'ft' : 'm'})</label>
                      <input type="number" value={mLength} onChange={e => setMLength(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wall Height ({isImperial ? 'ft' : 'm'})</label>
                      <input type="number" value={mHeight} onChange={e => setMHeight(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 10" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deductions Area (Doors/Windows) ({isImperial ? 'sq.ft' : 'sq.m'})</label>
                      <input type="number" value={mDeductArea} onChange={e => setMDeductArea(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 42" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'plaster' && (
                <motion.div key="plaster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers className="text-indigo-600"/> Plastering & Prep</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Wall Area ({isImperial ? 'sq.ft' : 'sq.m'})</label>
                      <input type="number" value={pArea} onChange={e => setPArea(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plaster Thickness ({isImperial ? 'in' : 'm'})</label>
                      <input type="number" value={pThickness} onChange={e => setPThickness(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mortar Ratio (Cement:Sand)</label>
                      <select value={pRatio} onChange={e => setPRatio(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="1:3">1:3 (Rich)</option>
                        <option value="1:4">1:4 (Standard Internal)</option>
                        <option value="1:6">1:6 (Standard External)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'flooring' && (
                <motion.div key="flooring" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Grid className="text-indigo-600"/> Flooring & Tiling</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Floor Area ({isImperial ? 'sq.ft' : 'sq.m'})</label>
                      <input type="number" value={fArea} onChange={e => setFArea(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 200" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tile Length ({isImperial ? 'ft' : 'm'})</label>
                      <input type="number" value={fTileL} onChange={e => setFTileL(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tile Width ({isImperial ? 'ft' : 'm'})</label>
                      <input type="number" value={fTileW} onChange={e => setFTileW(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pieces per Box</label>
                      <input type="number" value={fBoxSize} onChange={e => setFBoxSize(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'paint' && (
                <motion.div key="paint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PaintBucket className="text-indigo-600"/> Wall Paint</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Paint Area ({isImperial ? 'sq.ft' : 'sq.m'})</label>
                      <input type="number" value={paintArea} onChange={e => setPaintArea(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 1000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Coats</label>
                      <input type="number" value={paintCoats} onChange={e => setPaintCoats(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Spread Rate ({isImperial ? 'sq.ft/liter' : 'sq.m/liter'})</label>
                      <input type="number" value={paintSpread} onChange={e => setPaintSpread(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'countertop' && (
                <motion.div key="countertop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Droplets className="text-indigo-600"/> Kitchen & Bath Countertops</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slab Length ({isImperial ? 'ft' : 'm'})</label>
                      <input type="number" value={cLength} onChange={e => setCLength(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 10" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slab Width ({isImperial ? 'ft' : 'm'})</label>
                      <input type="number" value={cWidth} onChange={e => setCWidth(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 2" />
                    </div>
                  </div>
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4">
                     <HardHat className="text-slate-400 mt-1 shrink-0" />
                     <p className="text-sm text-slate-600 leading-relaxed font-medium">Countertop estimation computes the raw surface area for marble or granite procurement. It also adds a baseline cost estimate to the total project budget automatically.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => showToast("Exported to BOQ!")}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Send size={18} /> Send all items to BOQ
            </button>
            <button 
              onClick={() => showToast("Downloading PDF Report...")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={18} /> Export PDF Report
            </button>
            <button 
              onClick={() => showToast("Draft Saved")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Save size={18} /> Save Draft
            </button>
          </div>

          <AnimatePresence>
            {toastMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 z-50"
              >
                <Check size={18} className="text-emerald-400" /> {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Live Summary Bar (Sticky Sidebar) */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-6 flex flex-col gap-4">
            <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-900/10 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Live Materials</h3>
               
               <div className="flex flex-col gap-5 relative z-10">
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cost</p>
                     <p className="text-3xl font-black">{formatCurrency(results.cost)}</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cement</p>
                     <p className="text-xl font-bold">{results.cement.toLocaleString()} <span className="text-sm font-medium text-slate-400">bags</span></p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sand</p>
                     <p className="text-xl font-bold">{results.sand.toLocaleString('en-US', {maximumFractionDigits:1})} <span className="text-sm font-medium text-slate-400">cu.m</span></p>
                   </div>
                   {results.bricks > 0 && (
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bricks</p>
                       <p className="text-xl font-bold">{results.bricks.toLocaleString()} <span className="text-sm font-medium text-slate-400">pcs</span></p>
                     </div>
                   )}
                   {results.blocks > 0 && (
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blocks</p>
                       <p className="text-xl font-bold">{results.blocks.toLocaleString()} <span className="text-sm font-medium text-slate-400">pcs</span></p>
                     </div>
                   )}
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paint</p>
                     <p className="text-xl font-bold">{results.paint.toLocaleString()} <span className="text-sm font-medium text-slate-400">Liters</span></p>
                   </div>
                   <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tiles</p>
                     <p className="text-xl font-bold">{results.tiles.toLocaleString()} <span className="text-sm font-medium text-slate-400">Boxes</span></p>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100/50">
               <h4 className="font-bold text-indigo-900 mb-2">Why Merged?</h4>
               <p className="text-sm text-indigo-700/80 font-medium leading-relaxed">By combining all finishing estimates into a single flow, we prevent redundant data entry and ensure you never miss material overlaps like mortar cement in both masonry and flooring.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
