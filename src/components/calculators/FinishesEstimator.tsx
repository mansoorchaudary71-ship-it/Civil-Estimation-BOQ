import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Layers, PaintBucket, Grid, Blocks, 
  Download, Save, Send, Settings, Check, Droplets, HardHat, LayoutDashboard, Hammer
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useBOQ } from '../../context/BOQContext';
import SEOHead from '../seo/SEOHead';

type Tab = 'area' | 'masonry' | 'plaster' | 'paint' | 'flooring' | 'countertop' | 'woodwork';

const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: 'area', label: 'Carpet Area Engine', icon: LayoutDashboard },
  { id: 'masonry', label: 'Masonry & Blocks', icon: Blocks },
  { id: 'plaster', label: 'Plaster & Prep', icon: Layers },
  { id: 'paint', label: 'Wall Paint', icon: PaintBucket },
  { id: 'flooring', label: 'Flooring & Skirting', icon: Grid },
  { id: 'countertop', label: 'Countertops', icon: Droplets },
  { id: 'woodwork', label: 'Carpentry', icon: Hammer },
];

export default function FinishesEstimator() {
  const { settings, updateSettings, formatCurrency } = useSettings();
  const { addItem } = useBOQ();
  const [activeTab, setActiveTab] = useState<Tab>('area');
  
  const isImperial = settings.measurement === 'FPS';

  // Shared State
  const [sLength, setSLength] = useState('');
  const [sWidth, setSWidth] = useState('');
  const [sHeight, setSHeight] = useState('');
  const [sDeductArea, setSDeductArea] = useState('');

  // 1. Carpet Area
  const [wallAreaDeductPct, setWallAreaDeductPct] = useState('10');
  const [superBuiltUpAddPct, setSuperBuiltUpAddPct] = useState('20');

  // 2. Masonry & Blocks
  const [masonryType, setMasonryType] = useState<'brick' | 'aac' | 'hollow'>('brick');
  const [mThickness, setMThickness] = useState(isImperial ? '9' : '0.228');
  const [mMortarRatio, setMMortarRatio] = useState('1:4');
  const [mWastage, setMWastage] = useState('5');

  // 3. Plaster & Prep
  const [plasterType, setPlasterType] = useState<'internal' | 'external'>('internal');
  const [pThickness, setPThickness] = useState(isImperial ? '0.5' : '0.012'); // 12mm internal
  const [pRatio, setPRatio] = useState('1:4');
  const [pFaces, setPFaces] = useState('1'); // 1 face or 2 faces

  // 4. Wall Finishes & Paint
  const [paintCoats, setPaintCoats] = useState('2');
  const [primerCoats, setPrimerCoats] = useState('1');
  const [paintSpread, setPaintSpread] = useState(isImperial ? '107' : '10'); // sqft/liter or sqm/liter

  // 5. Flooring & Skirting
  const [fTileL, setFTileL] = useState(isImperial ? '2' : '0.6');
  const [fTileW, setFTileW] = useState(isImperial ? '2' : '0.6');
  const [fBoxSize, setFBoxSize] = useState('4');
  const [skirtingHeight, setSkirtingHeight] = useState(isImperial ? '4' : '0.1'); // 4 inches or 10cm
  const [skirtingMortarBed, setSkirtingMortarBed] = useState('0.05'); // 50mm

  // 6. Countertop
  const [cLength, setCLength] = useState('');
  const [cWidth, setCWidth] = useState(isImperial ? '2' : '0.6');
  const [cCutouts, setCCutouts] = useState('1'); // sink/hob
  const [cEdgePolishingLength, setCEdgePolishingLength] = useState('');
  const [cSupportBaseThickness, setCSupportBaseThickness] = useState(isImperial ? '2' : '0.05');

  // 7. Carpentry
  const [woodStudSpacing, setWoodStudSpacing] = useState(isImperial ? '16' : '0.4'); // 16 inches or 400mm
  const [plywoodThickness, setPlywoodThickness] = useState('18'); // 18mm
  const [plywoodReuseFactor, setPlywoodReuseFactor] = useState('1');
  const [doorWindowFrames, setDoorWindowFrames] = useState('2');

  const toMeters = (val: number, isImp: boolean) => isImp ? val * 0.3048 : val;
  const toSqMeters = (val: number, isImp: boolean) => isImp ? val * 0.092903 : val;
  const fromInchesToMeters = (val: number, isImp: boolean) => isImp ? val * 0.0254 : val;

  const results = useMemo(() => {
    let totalCement = 0;
    let totalSand = 0;
    let totalCost = 0;
    
    // Parsed Shared Dimensions
    const L = toMeters(parseFloat(sLength) || 0, isImperial);
    const W = toMeters(parseFloat(sWidth) || 0, isImperial);
    const H = toMeters(parseFloat(sHeight) || 0, isImperial);
    const deductM = toSqMeters(parseFloat(sDeductArea) || 0, isImperial);

    // 1. Carpet Area Results
    const totalPlotAreaM2 = L * W;
    const wallDeductFactor = parseFloat(wallAreaDeductPct) / 100 || 0;
    const carpetAreaM2 = totalPlotAreaM2 * (1 - wallDeductFactor);
    const superBuiltUpAddFactor = parseFloat(superBuiltUpAddPct) / 100 || 0;
    const superBuiltUpAreaM2 = totalPlotAreaM2 * (1 + superBuiltUpAddFactor);

    // 2. Masonry Results
    let masonryPieces = 0;
    const mT = isImperial ? fromInchesToMeters(parseFloat(mThickness) || 0, true) : parseFloat(mThickness) || 0;
    const wallPerimeter = 2 * (L + W);
    const grossWallArea = wallPerimeter * H;
    const netWallArea = Math.max(0, grossWallArea - deductM);
    const wallVol = netWallArea * mT;
    const wasteFactor = 1 + (parseFloat(mWastage) / 100 || 0);

    if (wallVol > 0) {
      const parts = mMortarRatio.split(':').map(Number);
      const cPart = parts[0] || 1;
      const sPart = parts[1] || 4;
      const sumPart = cPart + sPart;
      
      let unitVolWithMortar = 0;
      let unitVol = 0;

      if (masonryType === 'brick') {
        unitVolWithMortar = 0.238 * 0.124 * 0.086; // 9x4.5x3 + 10mm
        unitVol = 0.228 * 0.114 * 0.076;
      } else if (masonryType === 'aac') {
        unitVolWithMortar = 0.61 * 0.21 * 0.16; // 600x200x150 + 10mm
        unitVol = 0.6 * 0.2 * 0.15;
      } else { // hollow
        unitVolWithMortar = 0.41 * 0.21 * 0.21; // 400x200x200 + 10mm
        unitVol = 0.4 * 0.2 * 0.2;
      }

      masonryPieces = Math.ceil((wallVol / unitVolWithMortar) * wasteFactor);
      const mortarVol = wallVol - (masonryPieces * unitVol / wasteFactor); // without waste factor for mortar approximation
      const dryMortar = mortarVol * 1.33;
      totalCement += (dryMortar * (cPart/sumPart)) / 0.0347;
      totalSand += dryMortar * (sPart/sumPart);
    }

    // 3. Plaster Results
    let pCementBags = 0;
    let pSandVol = 0;
    const pT = isImperial ? fromInchesToMeters(parseFloat(pThickness) || 0, true) : parseFloat(pThickness) || 0;
    const numFaces = parseFloat(pFaces) || 1;
    const plasterArea = netWallArea * numFaces;
    
    if (plasterArea > 0 && pT > 0) {
      const wetVol = plasterArea * pT;
      const dryVol = wetVol * 1.33;
      const parts = pRatio.split(':').map(Number);
      const cPart = parts[0] || 1;
      const sPart = parts[1] || 4;
      const sumPart = cPart + sPart;
      pCementBags = (dryVol * (cPart/sumPart)) / 0.0347;
      pSandVol = dryVol * (sPart/sumPart);
      totalCement += pCementBags;
      totalSand += pSandVol;
    }

    // 4. Paint Results
    const ptA = netWallArea * numFaces; // Paint area based on plastered faces
    const pCoats = parseFloat(paintCoats) || 2;
    const prCoats = parseFloat(primerCoats) || 1;
    const pSpreadM = isImperial ? parseFloat(paintSpread) * 0.0929 : parseFloat(paintSpread) || 10;
    let paintLiters = 0;
    let primerLiters = 0;

    if (ptA > 0 && pSpreadM > 0) {
      paintLiters = (ptA * pCoats) / pSpreadM;
      primerLiters = (ptA * prCoats) / (pSpreadM * 1.2); // Primer spreads ~20% more
    }

    // 5. Flooring & Skirting Results
    const floorArea = L * W;
    const tL = isImperial ? toMeters(parseFloat(fTileL) || 0, true) : parseFloat(fTileL) || 0;
    const tW = isImperial ? toMeters(parseFloat(fTileW) || 0, true) : parseFloat(fTileW) || 0;
    const bSize = parseFloat(fBoxSize) || 4;
    let tileBoxes = 0;
    
    if (floorArea > 0 && tL > 0 && tW > 0) {
      const tileArea = tL * tW;
      
      // Skirting Area
      const skirtH = isImperial ? fromInchesToMeters(parseFloat(skirtingHeight)||0, true) : parseFloat(skirtingHeight)||0;
      const skirtingArea = wallPerimeter * skirtH;
      const totalTileArea = floorArea + skirtingArea;

      const tilesReq = (totalTileArea / tileArea) * 1.05; // 5% wastage
      tileBoxes = Math.ceil(tilesReq / bSize);
      
      // Mortar for floor bed
      const fBed = parseFloat(skirtingMortarBed) || 0.05; // default 50mm bed
      const bedVol = floorArea * fBed;
      const dryBed = bedVol * 1.33;
      totalCement += (dryBed * (1/5)) / 0.0347; // 1:4 assumed for floor bed
      totalSand += dryBed * (4/5);
    }

    // 6. Countertop Results
    const cntL = toMeters(parseFloat(cLength) || 0, isImperial);
    const cntW = toMeters(parseFloat(cWidth) || 0, isImperial);
    const numCutouts = parseFloat(cCutouts) || 0;
    const cutoutArea = numCutouts * (0.6 * 0.4); // approx 600x400mm per cutout
    const countertopArea = Math.max(0, (cntL * cntW) - cutoutArea);
    const supportBaseThick = isImperial ? fromInchesToMeters(parseFloat(cSupportBaseThickness)||0, true) : parseFloat(cSupportBaseThickness)||0;
    const supportBaseVol = countertopArea * supportBaseThick;
    // concrete support base
    if (supportBaseVol > 0) {
      const dryVol = supportBaseVol * 1.54;
      totalCement += (dryVol * (1/7)) / 0.0347; // 1:2:4 ratio assumed
      totalSand += dryVol * (2/7);
    }

    // 7. Carpentry
    const wStud = isImperial ? fromInchesToMeters(parseFloat(woodStudSpacing)||0, true) : parseFloat(woodStudSpacing)||0;
    let studCount = 0;
    let plywoodSheets = 0;
    if (floorArea > 0) {
       const sheetArea = 1.22 * 2.44; // 4x8 ft in meters
       const reuse = parseFloat(plywoodReuseFactor) || 1;
       plywoodSheets = Math.ceil((floorArea / sheetArea * 1.1) / reuse); // 10% wastage
       
       if (wStud > 0) {
         studCount = Math.ceil(wallPerimeter / wStud) + 4; // Add corners
       }
       
       const frames = parseFloat(doorWindowFrames) || 0;
       studCount += frames * 2; // extra studs for frames
    }

    // Calculate Costs
    totalCost += Math.ceil(totalCement) * (settings.rates.cement || 1200);
    totalCost += totalSand * 35.31 * (settings.rates.sand || 40);
    totalCost += masonryPieces * (settings.rates.bricks || 15);
    totalCost += paintLiters * 1200;
    totalCost += tileBoxes * 1500;
    totalCost += countertopArea * (isImperial ? 500 : 5000); // placeholder rates
    totalCost += plywoodSheets * 4500; // placeholder rate

    return {
      carpetArea: isImperial ? carpetAreaM2 / 0.0929 : carpetAreaM2,
      superBuiltUpArea: isImperial ? superBuiltUpAreaM2 / 0.0929 : superBuiltUpAreaM2,
      cement: Math.ceil(totalCement),
      sand: totalSand,
      masonryPieces,
      masonryType,
      paintLiters: Math.ceil(paintLiters),
      primerLiters: Math.ceil(primerLiters),
      tileBoxes,
      countertopArea: isImperial ? countertopArea / 0.0929 : countertopArea,
      plywoodSheets,
      studCount,
      cEdgePolishingLength: parseFloat(cEdgePolishingLength) || 0,
      cost: totalCost
    };
  }, [
    sLength, sWidth, sHeight, sDeductArea,
    wallAreaDeductPct, superBuiltUpAddPct,
    masonryType, mThickness, mMortarRatio, mWastage,
    plasterType, pThickness, pRatio, pFaces,
    paintCoats, primerCoats, paintSpread,
    fTileL, fTileW, fBoxSize, skirtingHeight, skirtingMortarBed,
    cLength, cWidth,
    woodStudSpacing, plywoodThickness,
    isImperial, settings.rates
  ]);

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleExportToBOQ = () => {
    if (results.cement > 0) addItem({ name: 'Cement (Finishes)', quantity: results.cement, unit: 'bags', rate: settings.rates.cement || 1200, category: 'Masonry & Finishes' });
    if (results.sand > 0) addItem({ name: 'Sand (Finishes)', quantity: results.sand * (isImperial ? 35.31 : 1), unit: isImperial ? 'cft' : 'cu.m', rate: settings.rates.sand || 40, category: 'Masonry & Finishes' });
    if (results.masonryPieces > 0) addItem({ name: `${results.masonryType.toUpperCase()} Blocks/Bricks`, quantity: results.masonryPieces, unit: 'pcs', rate: settings.rates.bricks || 15, category: 'Masonry & Finishes' });
    if (results.paintLiters > 0) addItem({ name: 'Wall Paint', quantity: results.paintLiters, unit: 'Liters', rate: 1200, category: 'Masonry & Finishes' });
    if (results.primerLiters > 0) addItem({ name: 'Wall Primer', quantity: results.primerLiters, unit: 'Liters', rate: 800, category: 'Masonry & Finishes' });
    if (results.tileBoxes > 0) addItem({ name: 'Tiles', quantity: results.tileBoxes, unit: 'Boxes', rate: 1500, category: 'Masonry & Finishes' });
    if (results.countertopArea > 0) addItem({ name: 'Countertop Slab', quantity: results.countertopArea, unit: isImperial ? 'sqft' : 'sqm', rate: isImperial ? 500 : 5000, category: 'Masonry & Finishes' });
    if (results.plywoodSheets > 0) addItem({ name: 'Plywood (4x8)', quantity: results.plywoodSheets, unit: 'Sheets', rate: 4500, category: 'Masonry & Finishes' });
    if (results.cEdgePolishingLength > 0) addItem({ name: 'Countertop Edge Polishing', quantity: results.cEdgePolishingLength, unit: isImperial ? 'ft' : 'm', rate: 100, category: 'Masonry & Finishes' });
    showToast("Exported to BOQ!");
  };

  return (
    <SEOHead 
      title="Complete Finishes, Surfaces & Carpet Area Estimator | Civil Estimation Pro" 
      description="Merge bricks, plaster, paint, flooring, countertops, woodwork, and carpet area in one seamless multi-tab interface."
      divisionName="Masonry, Surfaces & Finishes" 
      toolName="Complete Finishes Estimator"
    >
      <div className="w-full max-w-7xl mx-auto py-8 px-4 font-sans text-slate-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Complete Finishes & Surfaces</h1>
            <p className="text-slate-500 font-medium mt-1">Unified workspace for area engine, masonry, plaster, paint, flooring, and woodwork.</p>
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
          </div>
        </div>

        {/* Global Shared Dimensions */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10" />
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4">Global Room / Zone Dimensions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Length ({isImperial ? 'ft' : 'm'})</label>
              <input type="number" value={sLength} onChange={e => setSLength(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 15" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Width ({isImperial ? 'ft' : 'm'})</label>
              <input type="number" value={sWidth} onChange={e => setSWidth(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 12" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Height ({isImperial ? 'ft' : 'm'})</label>
              <input type="number" value={sHeight} onChange={e => setSHeight(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deductions ({isImperial ? 'sq.ft' : 'sq.m'})</label>
              <input type="number" value={sDeductArea} onChange={e => setSDeductArea(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 42" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
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

            <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeTab === 'area' && (
                  <motion.div key="area" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="text-indigo-600"/> Carpet & Built-Up Area Engine</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wall Area Deduction (%)</label>
                        <input type="number" value={wallAreaDeductPct} onChange={e => setWallAreaDeductPct(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Default 10%" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Super Built-up Addition (%)</label>
                        <input type="number" value={superBuiltUpAddPct} onChange={e => setSuperBuiltUpAddPct(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Default 20%" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'masonry' && (
                  <motion.div key="masonry" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Blocks className="text-indigo-600"/> Masonry & Blocks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Material Type</label>
                        <select value={masonryType} onChange={e => setMasonryType(e.target.value as any)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="brick">Red Bricks (Standard)</option>
                          <option value="aac">AAC Blocks</option>
                          <option value="hollow">Hollow Concrete Blocks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wall Thickness ({isImperial ? 'in' : 'm'})</label>
                        <input type="number" value={mThickness} onChange={e => setMThickness(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mortar Mix Ratio</label>
                        <select value={mMortarRatio} onChange={e => setMMortarRatio(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="1:4">1:4 (Internal walls)</option>
                          <option value="1:6">1:6 (External/Thick walls)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wastage (%)</label>
                        <input type="number" value={mWastage} onChange={e => setMWastage(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'plaster' && (
                  <motion.div key="plaster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers className="text-indigo-600"/> Plaster & Prep</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plaster Location</label>
                        <select value={plasterType} onChange={e => {
                          setPlasterType(e.target.value as any);
                          setPThickness(isImperial ? (e.target.value === 'internal' ? '0.5' : '0.8') : (e.target.value === 'internal' ? '0.012' : '0.020'));
                        }} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="internal">Internal (12mm typical)</option>
                          <option value="external">External (20mm typical)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thickness ({isImperial ? 'in' : 'm'})</label>
                        <input type="number" value={pThickness} onChange={e => setPThickness(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Faces</label>
                        <select value={pFaces} onChange={e => setPFaces(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="1">1 Face</option>
                          <option value="2">2 Faces (Both sides of wall)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mortar Ratio (Cement:Sand)</label>
                        <select value={pRatio} onChange={e => setPRatio(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="1:3">1:3</option>
                          <option value="1:4">1:4</option>
                          <option value="1:6">1:6</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'paint' && (
                  <motion.div key="paint" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PaintBucket className="text-indigo-600"/> Wall Finishes & Paint</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paint Coats</label>
                        <input type="number" value={paintCoats} onChange={e => setPaintCoats(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primer Coats</label>
                        <input type="number" value={primerCoats} onChange={e => setPrimerCoats(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paint Spread Rate ({isImperial ? 'sq.ft/liter' : 'sq.m/liter'})</label>
                        <input type="number" value={paintSpread} onChange={e => setPaintSpread(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'flooring' && (
                  <motion.div key="flooring" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Grid className="text-indigo-600"/> Flooring & Skirting</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tile Length ({isImperial ? 'ft' : 'm'})</label>
                        <input type="number" value={fTileL} onChange={e => setFTileL(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tile Width ({isImperial ? 'ft' : 'm'})</label>
                        <input type="number" value={fTileW} onChange={e => setFTileW(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pieces per Box</label>
                        <input type="number" value={fBoxSize} onChange={e => setFBoxSize(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skirting Height ({isImperial ? 'in' : 'm'})</label>
                        <input type="number" value={skirtingHeight} onChange={e => setSkirtingHeight(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'countertop' && (
                  <motion.div key="countertop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Droplets className="text-indigo-600"/> Kitchen / Bath Countertops</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slab Length ({isImperial ? 'ft' : 'm'})</label>
                        <input type="number" value={cLength} onChange={e => setCLength(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slab Width ({isImperial ? 'ft' : 'm'})</label>
                        <input type="number" value={cWidth} onChange={e => setCWidth(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sink/Hob Cutouts</label>
                        <input type="number" value={cCutouts} onChange={e => setCCutouts(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Edge Polishing Length ({isImperial ? 'ft' : 'm'})</label>
                        <input type="number" value={cEdgePolishingLength} onChange={e => setCEdgePolishingLength(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Concrete Base Thickness ({isImperial ? 'in' : 'm'})</label>
                        <input type="number" value={cSupportBaseThickness} onChange={e => setCSupportBaseThickness(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'woodwork' && (
                  <motion.div key="woodwork" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Hammer className="text-indigo-600"/> Carpentry & Woodwork</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wood Stud Spacing ({isImperial ? 'in' : 'm'})</label>
                        <input type="number" value={woodStudSpacing} onChange={e => setWoodStudSpacing(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plywood Thickness (mm)</label>
                        <input type="number" value={plywoodThickness} onChange={e => setPlywoodThickness(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plywood Re-use Factor</label>
                        <input type="number" value={plywoodReuseFactor} onChange={e => setPlywoodReuseFactor(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 2 for 2 times" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Door/Window Frame Count</label>
                        <input type="number" value={doorWindowFrames} onChange={e => setDoorWindowFrames(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={handleExportToBOQ}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Send size={18} /> Sync All to Master BOQ
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

          <div className="xl:col-span-4 relative">
            <div className="sticky top-6 flex flex-col gap-4">
              <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-slate-900/10 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Live Materials Summary</h3>
                 
                 <div className="flex flex-col gap-5 relative z-10">
                   <div className="flex justify-between items-end border-b border-white/10 pb-4">
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Total Cost</p>
                       <p className="text-3xl font-black">{formatCurrency(results.cost)}</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2">
                       <div className="flex justify-between items-center mb-2">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carpet Area</p>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Built-up</p>
                       </div>
                       <div className="flex justify-between items-center">
                         <p className="text-xl font-bold">{results.carpetArea.toFixed(1)} <span className="text-sm font-medium text-slate-400">{isImperial ? 'sqft' : 'sqm'}</span></p>
                         <p className="text-xl font-bold">{results.superBuiltUpArea.toFixed(1)} <span className="text-sm font-medium text-slate-400">{isImperial ? 'sqft' : 'sqm'}</span></p>
                       </div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cement</p>
                       <p className="text-xl font-bold">{results.cement.toLocaleString()} <span className="text-sm font-medium text-slate-400">bags</span></p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sand</p>
                       <p className="text-xl font-bold">{(results.sand * (isImperial?35.31:1)).toLocaleString('en-US', {maximumFractionDigits:1})} <span className="text-sm font-medium text-slate-400">{isImperial?'cft':'cu.m'}</span></p>
                     </div>
                     {results.masonryPieces > 0 && (
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Masonry ({results.masonryType})</p>
                         <p className="text-xl font-bold">{results.masonryPieces.toLocaleString()} <span className="text-sm font-medium text-slate-400">pcs</span></p>
                       </div>
                     )}
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Paint</p>
                       <p className="text-xl font-bold">{results.paintLiters.toLocaleString()} <span className="text-sm font-medium text-slate-400">L</span></p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Primer</p>
                       <p className="text-xl font-bold">{results.primerLiters.toLocaleString()} <span className="text-sm font-medium text-slate-400">L</span></p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tiles</p>
                       <p className="text-xl font-bold">{results.tileBoxes.toLocaleString()} <span className="text-sm font-medium text-slate-400">Boxes</span></p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Countertop</p>
                       <p className="text-xl font-bold">{results.countertopArea.toFixed(1)} <span className="text-sm font-medium text-slate-400">{isImperial?'sqft':'sqm'}</span></p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plywood</p>
                       <p className="text-xl font-bold">{results.plywoodSheets.toLocaleString()} <span className="text-sm font-medium text-slate-400">Sheets</span></p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Studs</p>
                       <p className="text-xl font-bold">{results.studCount.toLocaleString()} <span className="text-sm font-medium text-slate-400">pcs</span></p>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </SEOHead>
  );
}
