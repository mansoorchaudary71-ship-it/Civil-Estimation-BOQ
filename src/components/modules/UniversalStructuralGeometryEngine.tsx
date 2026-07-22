import React, { useState } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Circle, CircleDashed, AlignJustify, Baseline, Triangle, Save , AlertTriangle} from 'lucide-react';

export default function UniversalStructuralGeometryEngine() {
  const { addItem } = useBOQ();
  const [activeTab, setActiveTab] = useState('rectangular');

  const [inputs, setInputs] = useState({
    // Rectangular
    rectL: 3, rectW: 0.3, rectD: 0.4, rectRebarCount: 4, rectStirrupSpacing: 0.15,
    // Circular
    circDia: 0.4, circH: 3, circRebarCount: 6, circTiePitch: 0.15,
    // Tube
    tubeOD: 1, tubeID: 0.8, tubeL: 5,
    // Precast
    wallL: 30, wallTotalH: 2.4, panelH: 0.3, panelThick: 0.05, postSpacing: 3,
    // Staircase
    stairSteps: 10, stairRise: 0.15, stairGoing: 0.25, stairWidth: 1.2, stairWaist: 0.15,
    // Roof
    roofSpan: 8, roofRise: 2, roofRun: 12
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const calcPlywood = (area: number) => Math.ceil(area / 2.97); // 1.22 x 2.44 plywood sheet is approx 2.97 sqm
  const calcBattens = (area: number) => Math.ceil(area * 3.5); // Approx 3.5m of batten per sqm


  const getValidations = () => {
    const warnings = [];
    if (activeTab === 'rectangular') {
      if (inputs.rectL <= 0 || inputs.rectW <= 0 || inputs.rectD <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.rectD > inputs.rectW * 5) warnings.push("Unusual aspect ratio: depth is more than 5x the width.");
      if (inputs.rectW > inputs.rectD * 5) warnings.push("Unusual aspect ratio: width is more than 5x the depth.");
      if (inputs.rectStirrupSpacing >= inputs.rectL) warnings.push("Stirrup spacing is larger than or equal to total length.");
      if (inputs.rectStirrupSpacing <= 0) warnings.push("Stirrup spacing must be greater than zero.");
    } else if (activeTab === 'circular') {
      if (inputs.circDia <= 0 || inputs.circH <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.circH > inputs.circDia * 20) warnings.push("Unusual slenderness: height is more than 20x the diameter.");
      if (inputs.circTiePitch <= 0) warnings.push("Tie pitch must be greater than zero.");
    } else if (activeTab === 'tube') {
      if (inputs.tubeOD <= 0 || inputs.tubeID <= 0 || inputs.tubeL <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.tubeID >= inputs.tubeOD) warnings.push("Inner diameter cannot be greater than or equal to outer diameter.");
      if (inputs.tubeOD > 0 && inputs.tubeID > 0 && (inputs.tubeOD - inputs.tubeID) < 0.05) warnings.push("Wall thickness is critically thin (< 50mm).");
    } else if (activeTab === 'precast') {
      if (inputs.wallL <= 0 || inputs.wallTotalH <= 0 || inputs.panelH <= 0 || inputs.panelThick <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.panelH >= inputs.wallTotalH) warnings.push("Panel height is greater than or equal to total wall height.");
      if (inputs.wallTotalH > inputs.panelThick * 40) warnings.push("High slenderness ratio: consider thicker panels or intermediate supports.");
      if (inputs.postSpacing <= 0) warnings.push("Post spacing must be greater than zero.");
    } else if (activeTab === 'staircase') {
      if (inputs.stairRise <= 0 || inputs.stairGoing <= 0 || inputs.stairSteps <= 0 || inputs.stairWidth <= 0 || inputs.stairWaist <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.stairRise > 0.25) warnings.push("Stair rise exceeds typical maximum (250mm).");
      if (inputs.stairGoing < 0.20) warnings.push("Stair going is below typical minimum (200mm).");
    } else if (activeTab === 'roof') {
      if (inputs.roofSpan <= 0 || inputs.roofRise <= 0 || inputs.roofRun <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.roofRise > inputs.roofSpan) warnings.push("Roof rise is unusually steep relative to span.");
    }
    return warnings;
  };
  const currentWarnings = getValidations();


  // Calculations
  const calculateRectangular = () => {
    const vol = inputs.rectL * inputs.rectW * inputs.rectD;
    const formwork = 2 * inputs.rectL * (inputs.rectW + inputs.rectD); // assuming 4 sides or standard
    const rebarLen = inputs.rectL * inputs.rectRebarCount;
    const mainSteel = rebarLen * 0.888; // assuming 12mm approx
    const stirrupCount = Math.ceil(inputs.rectL / inputs.rectStirrupSpacing) + 1;
    const stirrupLen = 2 * (inputs.rectW + inputs.rectD - 0.1) * stirrupCount;
    const stirrupSteel = stirrupLen * 0.395; // 8mm approx
    return { vol, formwork, totalSteel: mainSteel + stirrupSteel, plywood: calcPlywood(formwork), battens: calcBattens(formwork) };
  };

  const calculateCircular = () => {
    const radius = inputs.circDia / 2;
    const vol = Math.PI * radius * radius * inputs.circH;
    const formwork = Math.PI * inputs.circDia * inputs.circH;
    const mainSteel = inputs.circRebarCount * inputs.circH * 0.888; // 12mm
    const spiralLen = Math.sqrt(Math.pow(Math.PI * (inputs.circDia - 0.08), 2) + Math.pow(inputs.circTiePitch, 2)) * (inputs.circH / inputs.circTiePitch);
    const spiralSteel = spiralLen * 0.395; // 8mm
    return { vol, formwork, totalSteel: mainSteel + spiralSteel, plywood: calcPlywood(formwork), battens: calcBattens(formwork) };
  };

  const calculateTube = () => {
    const rO = inputs.tubeOD / 2;
    const rI = inputs.tubeID / 2;
    const vol = Math.PI * (rO * rO - rI * rI) * inputs.tubeL;
    const weight = vol * 2400; // standard concrete density
    const formwork = Math.PI * (inputs.tubeOD + inputs.tubeID) * inputs.tubeL;
    return { vol, weight, formwork, plywood: calcPlywood(formwork), battens: calcBattens(formwork) };
  };

  const calculatePrecast = () => {
    const postCount = Math.ceil(inputs.wallL / inputs.postSpacing) + 1;
    const panelsPerSpan = Math.ceil(inputs.wallTotalH / inputs.panelH);
    const totalPanels = panelsPerSpan * (postCount - 1);
    const panelVol = (inputs.postSpacing - 0.1) * inputs.panelH * inputs.panelThick * totalPanels;
    const postVol = postCount * 0.15 * 0.15 * (inputs.wallTotalH); // Post volume above ground
    const footingVol = postCount * 0.45 * 0.45 * 0.6; // 450x450x600mm footing for each post
    return { totalPanels, postCount, totalVol: panelVol + postVol + footingVol, footingVol };
  };

  const calculateStaircase = () => {
    const stepVol = 0.5 * inputs.stairRise * inputs.stairGoing * inputs.stairWidth * inputs.stairSteps;
    const waistLength = Math.sqrt(Math.pow(inputs.stairSteps * inputs.stairRise, 2) + Math.pow(inputs.stairSteps * inputs.stairGoing, 2));
    const waistVol = waistLength * inputs.stairWidth * inputs.stairWaist;
    const vol = stepVol + waistVol;
    const formwork = (inputs.stairSteps * inputs.stairGoing * inputs.stairWidth) + (inputs.stairSteps * inputs.stairRise * inputs.stairWidth) + (waistLength * inputs.stairWidth);
    const steel = vol * 120; // empirical 120kg/m3
    return { vol, formwork, steel, plywood: calcPlywood(formwork), battens: calcBattens(formwork) };
  };

  const calculateRoof = () => {
    const runHalf = inputs.roofSpan / 2;
    const rafterLength = Math.sqrt(Math.pow(runHalf, 2) + Math.pow(inputs.roofRise, 2));
    const angleDeg = Math.atan(inputs.roofRise / runHalf) * (180 / Math.PI);
    const pitchRatio = (inputs.roofRise / runHalf) * 12; // x in 12
    const area = 2 * rafterLength * inputs.roofRun; // both sides
    return { rafterLength, angleDeg, pitchRatio, area, plywood: calcPlywood(area), battens: calcBattens(area) };
  };

  const syncToBOQ = () => {
    if (activeTab === 'rectangular') {
      const res = calculateRectangular();
      addItem({ name: 'Rectangular Concrete', quantity: res.vol, unit: 'm³', rate: 12000, category: 'Concrete' });
      addItem({ name: 'Formwork Area', quantity: res.formwork, unit: 'm²', rate: 500, category: 'Formwork' });
      addItem({ name: 'Formwork Plywood', quantity: res.plywood, unit: 'Nos', rate: 3000, category: 'Formwork' });
      addItem({ name: 'Formwork Battens', quantity: res.battens, unit: 'm', rate: 150, category: 'Formwork' });
      addItem({ name: 'Steel Reinforcement', quantity: res.totalSteel, unit: 'kg', rate: 260, category: 'Steel' });
    } else if (activeTab === 'circular') {
      const res = calculateCircular();
      addItem({ name: 'Circular Concrete', quantity: res.vol, unit: 'm³', rate: 13000, category: 'Concrete' });
      addItem({ name: 'Formwork Area', quantity: res.formwork, unit: 'm²', rate: 600, category: 'Formwork' });
      addItem({ name: 'Formwork Plywood', quantity: res.plywood, unit: 'Nos', rate: 3000, category: 'Formwork' });
      addItem({ name: 'Formwork Battens', quantity: res.battens, unit: 'm', rate: 150, category: 'Formwork' });
      addItem({ name: 'Steel Reinforcement', quantity: res.totalSteel, unit: 'kg', rate: 260, category: 'Steel' });
    } else if (activeTab === 'tube') {
      const res = calculateTube();
      addItem({ name: 'Precast Concrete Tube', quantity: res.vol, unit: 'm³', rate: 15000, category: 'Concrete' });
      addItem({ name: 'Formwork Area', quantity: res.formwork, unit: 'm²', rate: 500, category: 'Formwork' });
    } else if (activeTab === 'precast') {
      const res = calculatePrecast();
      addItem({ name: 'Precast Panels', quantity: res.totalPanels, unit: 'Nos', rate: 2000, category: 'Concrete' });
      addItem({ name: 'Precast Posts', quantity: res.postCount, unit: 'Nos', rate: 3000, category: 'Concrete' });
      addItem({ name: 'Foundation Concrete', quantity: res.footingVol, unit: 'm³', rate: 11000, category: 'Concrete' });
    } else if (activeTab === 'staircase') {
      const res = calculateStaircase();
      addItem({ name: 'Staircase Concrete', quantity: res.vol, unit: 'm³', rate: 12500, category: 'Concrete' });
      addItem({ name: 'Staircase Steel', quantity: res.steel, unit: 'kg', rate: 260, category: 'Steel' });
      addItem({ name: 'Staircase Formwork', quantity: res.formwork, unit: 'm²', rate: 550, category: 'Formwork' });
      addItem({ name: 'Formwork Plywood', quantity: res.plywood, unit: 'Nos', rate: 3000, category: 'Formwork' });
      addItem({ name: 'Formwork Battens', quantity: res.battens, unit: 'm', rate: 150, category: 'Formwork' });
    } else if (activeTab === 'roof') {
      const res = calculateRoof();
      addItem({ name: 'Sloped Roofing Surface', quantity: res.area, unit: 'm²', rate: 1500, category: 'Finishes' });
      addItem({ name: 'Roofing Plywood', quantity: res.plywood, unit: 'Nos', rate: 3500, category: 'Finishes' });
      addItem({ name: 'Roofing Battens', quantity: res.battens, unit: 'm', rate: 200, category: 'Finishes' });
    }
  };

  const tabs = [
    { id: 'rectangular', name: 'Rectangular', icon: <Square size={16} /> },
    { id: 'circular', name: 'Circular', icon: <Circle size={16} /> },
    { id: 'tube', name: 'Concrete Tube', icon: <CircleDashed size={16} /> },
    { id: 'precast', name: 'Precast Wall', icon: <AlignJustify size={16} /> },
    { id: 'staircase', name: 'Staircase', icon: <Baseline size={16} /> },
    { id: 'roof', name: 'Roof Pitch', icon: <Triangle size={16} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Universal Structural Geometry</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Unified engine for complex shapes, formwork, steel, and concrete volumes.</p>
        </div>
        <button 
          onClick={syncToBOQ}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Save size={18} /> Sync to BOQ
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Input Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">
            Geometry Parameters
          </h2>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {activeTab === 'rectangular' && (
                <>
                  <InputGroup label="Length [m]" name="rectL" value={inputs.rectL} onChange={handleInput} />
                  <InputGroup label="Width [m]" name="rectW" value={inputs.rectW} onChange={handleInput} />
                  <InputGroup label="Depth [m]" name="rectD" value={inputs.rectD} onChange={handleInput} />
                  <InputGroup label="Main Rebar Count" name="rectRebarCount" value={inputs.rectRebarCount} onChange={handleInput} />
                  <InputGroup label="Stirrup Spacing c/c [m]" name="rectStirrupSpacing" value={inputs.rectStirrupSpacing} onChange={handleInput} />
                </>
              )}

              {activeTab === 'circular' && (
                <>
                  <InputGroup label="Diameter [m]" name="circDia" value={inputs.circDia} onChange={handleInput} />
                  <InputGroup label="Height / Length [m]" name="circH" value={inputs.circH} onChange={handleInput} />
                  <InputGroup label="Main Rebar Count" name="circRebarCount" value={inputs.circRebarCount} onChange={handleInput} />
                  <InputGroup label="Spiral Tie Pitch [m]" name="circTiePitch" value={inputs.circTiePitch} onChange={handleInput} />
                </>
              )}

              {activeTab === 'tube' && (
                <>
                  <InputGroup label="Outer Diameter (OD) [m]" name="tubeOD" value={inputs.tubeOD} onChange={handleInput} />
                  <InputGroup label="Inner Diameter (ID) [m]" name="tubeID" value={inputs.tubeID} onChange={handleInput} />
                  <InputGroup label="Tube Length (L) [m]" name="tubeL" value={inputs.tubeL} onChange={handleInput} />
                </>
              )}

              {activeTab === 'precast' && (
                <>
                  <InputGroup label="Total Wall Length [m]" name="wallL" value={inputs.wallL} onChange={handleInput} />
                  <InputGroup label="Total Wall Height [m]" name="wallTotalH" value={inputs.wallTotalH} onChange={handleInput} />
                  <InputGroup label="Panel Height [m]" name="panelH" value={inputs.panelH} onChange={handleInput} />
                  <InputGroup label="Panel Thickness [m]" name="panelThick" value={inputs.panelThick} onChange={handleInput} />
                  <InputGroup label="Post Spacing c/c [m]" name="postSpacing" value={inputs.postSpacing} onChange={handleInput} />
                </>
              )}

              {activeTab === 'staircase' && (
                <>
                  <InputGroup label="Number of Steps" name="stairSteps" value={inputs.stairSteps} onChange={handleInput} />
                  <InputGroup label="Step Rise [m]" name="stairRise" value={inputs.stairRise} onChange={handleInput} />
                  <InputGroup label="Step Going [m]" name="stairGoing" value={inputs.stairGoing} onChange={handleInput} />
                  <InputGroup label="Stair Width [m]" name="stairWidth" value={inputs.stairWidth} onChange={handleInput} />
                  <InputGroup label="Waist Slab Thick [m]" name="stairWaist" value={inputs.stairWaist} onChange={handleInput} />
                </>
              )}

              {activeTab === 'roof' && (
                <>
                  <InputGroup label="Total Span [m]" name="roofSpan" value={inputs.roofSpan} onChange={handleInput} />
                  <InputGroup label="Roof Rise [m]" name="roofRise" value={inputs.roofRise} onChange={handleInput} />
                  <InputGroup label="Roof Run (Building Length) [m]" name="roofRun" value={inputs.roofRun} onChange={handleInput} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
          {currentWarnings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex flex-col gap-2"
            >
              {currentWarnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{warn}</p>
                </div>
              ))}
            </motion.div>
          )}

        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
            <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">
              Analysis Results
            </h2>
            
            <div className="space-y-4 relative z-10">
              {activeTab === 'rectangular' && (() => {
                const res = calculateRectangular();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Formwork Plywood" value={res.plywood} unit="Nos" />
                    <ResultRow label="Total Steel Weight" value={res.totalSteel} unit="kg" />
                  </>
                );
              })()}
              {activeTab === 'circular' && (() => {
                const res = calculateCircular();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Formwork Plywood" value={res.plywood} unit="Nos" />
                    <ResultRow label="Total Steel Weight" value={res.totalSteel} unit="kg" />
                  </>
                );
              })()}
              {activeTab === 'tube' && (() => {
                const res = calculateTube();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Tube Weight" value={res.weight} unit="kg" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                  </>
                );
              })()}
              {activeTab === 'precast' && (() => {
                const res = calculatePrecast();
                return (
                  <>
                    <ResultRow label="Precast Panels" value={res.totalPanels} unit="Nos" />
                    <ResultRow label="Precast Posts" value={res.postCount} unit="Nos" />
                    <ResultRow label="Total Concrete Vol" value={res.totalVol} unit="m³" />
                    <ResultRow label="Footing Concrete" value={res.footingVol} unit="m³" />
                  </>
                );
              })()}
              {activeTab === 'staircase' && (() => {
                const res = calculateStaircase();
                return (
                  <>
                    <ResultRow label="Total Concrete Vol" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Estimated Steel" value={res.steel} unit="kg" />
                  </>
                );
              })()}
              {activeTab === 'roof' && (() => {
                const res = calculateRoof();
                return (
                  <>
                    <ResultRow label="Rafter Length" value={res.rafterLength} unit="m" />
                    <ResultRow label="Pitch Angle" value={res.angleDeg} unit="°" />
                    <ResultRow label="Pitch Ratio" value={res.pitchRatio} unit=":12" />
                    <ResultRow label="Sloped Area" value={res.area} unit="m²" />
                    <ResultRow label="Roofing Plywood" value={res.plywood} unit="Nos" />
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 w-full text-left">Cross Section</h3>
            <div className="w-full max-w-[200px] aspect-square flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {activeTab === 'rectangular' && <RectangularSVG w={inputs.rectW} d={inputs.rectD} />}
                  {activeTab === 'circular' && <CircularSVG d={inputs.circDia} />}
                  {activeTab === 'tube' && <HollowTubeSVG od={inputs.tubeOD} id={inputs.tubeID} />}
                  {activeTab === 'precast' && <PrecastWallSVG totalH={inputs.wallTotalH} panelH={inputs.panelH} />}
                  {activeTab === 'staircase' && <StaircaseSVG rise={inputs.stairRise} going={inputs.stairGoing} />}
                  {activeTab === 'roof' && <RoofPitchSVG rise={inputs.roofRise} span={inputs.roofSpan} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange }: { label: string, name: string, value: number, onChange: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={0}
        step={0.01}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
      />
    </div>
  );
}

function ResultRow({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
      <span className="text-white/70 text-sm font-medium">{label}</span>
      <div className="text-right">
        <span className="text-xl font-bold text-white">
          {isNaN(value) || !isFinite(value) ? "0.00" : (value % 1 === 0 && unit === 'Nos' ? value : value.toFixed(2))}
        </span>
        <span className="text-indigo-300 ml-1.5 text-sm">{unit}</span>
      </div>
    </div>
  );
}

// --- SVG PREVIEWS ---
// --- SVG PREVIEWS ---
const SvgDefs = () => (
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
      <path d="M 0 0 L 6 3 L 0 6 z" fill="currentColor" />
    </marker>
  </defs>
);

const RectangularSVG = ({ w, d }: { w: number, d: number }) => {
  const maxDim = Math.max(w, d) || 1;
  const scale = 50 / maxDim;
  const sw = Math.max(w * scale, 10);
  const sd = Math.max(d * scale, 10);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.rect 
        initial={false}
        animate={{ x: 50 - sw / 2, y: 50 - sd / 2, width: sw, height: sd }}
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.rect 
        initial={false}
        animate={{ x: 50 - sw / 2 + (sw > 16 ? 8 : 2), y: 50 - sd / 2 + (sd > 16 ? 8 : 2), width: Math.max(1, sw - (sw > 16 ? 16 : 4)), height: Math.max(1, sd - (sd > 16 ? 16 : 4)) }}
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.circle initial={false} animate={{ cx: 50 - sw/2 + (sw > 16 ? 10 : 3), cy: 50 - sd/2 + (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 + sw/2 - (sw > 16 ? 10 : 3), cy: 50 - sd/2 + (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 - sw/2 + (sw > 16 ? 10 : 3), cy: 50 + sd/2 - (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 + sw/2 - (sw > 16 ? 10 : 3), cy: 50 + sd/2 - (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      
      <motion.line initial={false} animate={{ x1: 50 - sw / 2, y1: 50 + sd / 2 + 10, x2: 50 + sw / 2, y2: 50 + sd / 2 + 10 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50, y: 50 + sd / 2 + 18 }} textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{w}m</motion.text>
      
      <motion.line initial={false} animate={{ x1: 50 + sw / 2 + 10, y1: 50 - sd / 2, x2: 50 + sw / 2 + 10, y2: 50 + sd / 2 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50 + sw / 2 + 15, y: 50 }} textAnchor="start" alignmentBaseline="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{d}m</motion.text>
    </svg>
  );
};

const CircularSVG = ({ d }: { d: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
    <SvgDefs />
    <motion.circle initial={false} animate={{ r: 35 }} cx="50" cy="50" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.circle initial={false} animate={{ r: 28 }} cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    {[0, 60, 120, 180, 240, 300].map(angle => {
      const rad = (angle * Math.PI) / 180;
      return <motion.circle key={angle} cx={50 + 28 * Math.cos(rad)} cy={50 + 28 * Math.sin(rad)} r="3" fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />;
    })}
    <motion.line initial={false} animate={{ x1: 15, y1: 50, x2: 85, y2: 50 }} stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.line initial={false} animate={{ x1: 15, y1: 90, x2: 85, y2: 90 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.text initial={false} animate={{ x: 50, y: 98 }} textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Ø {d}m</motion.text>
  </svg>
);

const HollowTubeSVG = ({ od, id }: { od: number, id: number }) => {
  const maxDim = Math.max(od, 0.001);
  const scale = 35 / maxDim;
  const rOD = od * scale;
  const rID = Math.max(id * scale, 0);
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.circle initial={false} animate={{ r: rOD }} cx="50" cy="50" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ r: rID }} cx="50" cy="50" fill="white" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ r: (rOD + rID) / 2 }} cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      
      <motion.line initial={false} animate={{ x1: 50, y1: 50, x2: 50 + rOD, y2: 50 }} stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50 + rOD / 2, y: 48 }} textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>OD {od}m</motion.text>

      <motion.line initial={false} animate={{ x1: 50, y1: 50, x2: 50, y2: 50 + rID }} stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 48, y: 50 + rID / 2 }} textAnchor="end" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>ID {id}m</motion.text>
    </svg>
  );
};

const PrecastWallSVG = ({ totalH, panelH }: { totalH: number, panelH: number }) => {
  const numPanels = Math.max(1, Math.min(6, Math.floor(totalH / (panelH || 1))));
  const panelHeightVisual = 60 / numPanels;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.rect initial={false} animate={{ x: 20, y: 10, width: 10, height: 75 }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.rect initial={false} animate={{ x: 70, y: 10, width: 10, height: 75 }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      {Array.from({length: numPanels}).map((_, i) => (
        <motion.rect key={i} initial={false} animate={{ x: 30, y: 85 - (i + 1) * panelHeightVisual, width: 40, height: panelHeightVisual - 2 }} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      ))}

      <motion.line initial={false} animate={{ x1: 85, y1: 10, x2: 85, y2: 85 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 88, y: 47.5 }} textAnchor="start" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>H {totalH}m</motion.text>
    </svg>
  );
};

const StaircaseSVG = ({ rise, going }: { rise: number, going: number }) => {
  const steps = 3;
  const ratio = (going || 1) / (rise || 1);
  const stepW = 60 / steps;
  const stepH = stepW / ratio;
  
  const pathData = `M 20,80 L 80,80 L 80,${80 - stepH} L ${80 - stepW},${80 - stepH} L ${80 - stepW},${80 - 2 * stepH} L ${80 - 2 * stepW},${80 - 2 * stepH} L ${80 - 2 * stepW},${80 - 3 * stepH} L 20,${80 - 3 * stepH} Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.path 
        initial={false} 
        animate={{ d: pathData }} 
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      />
      <motion.path 
        initial={false} 
        animate={{ d: `M 25,75 L 80,${75 - Math.min(60, 3 * stepH)}` }} 
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      />

      <motion.line initial={false} animate={{ x1: 80 - stepW, y1: 80 - stepH - 5, x2: 80, y2: 80 - stepH - 5 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 80 - stepW / 2, y: 80 - stepH - 8 }} textAnchor="middle" fontSize="4" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{going}m (G)</motion.text>

      <motion.line initial={false} animate={{ x1: 85, y1: 80 - stepH, x2: 85, y2: 80 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 88, y: 80 - stepH / 2 }} textAnchor="start" alignmentBaseline="middle" fontSize="4" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{rise}m (R)</motion.text>
    </svg>
  );
};

const RoofPitchSVG = ({ rise, span }: { rise: number, span: number }) => {
  const maxDim = Math.max(span, rise * 2, 1);
  const scale = 60 / maxDim;
  const w = span * scale;
  const h = rise * scale;
  
  const cx = 50;
  const by = 80; // base y
  const pathData = `M ${cx},${by - h} L ${cx - w/2},${by} L ${cx + w/2},${by} Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 drop-shadow-md">
      <SvgDefs />
      <motion.path initial={false} animate={{ d: pathData }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.path initial={false} animate={{ d: `M ${cx},${by - h} L ${cx},${by}` }} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.rect initial={false} animate={{ x: cx - w/2, y: by, width: w, height: 5 }} fill="none" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />

      <motion.line initial={false} animate={{ x1: cx - w/2, y1: by + 10, x2: cx + w/2, y2: by + 10 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: cx, y: by + 18 }} textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Span {span}m</motion.text>

      <motion.line initial={false} animate={{ x1: cx + w/2 + 5, y1: by - h, x2: cx + w/2 + 5, y2: by }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: cx + w/2 + 8, y: by - h/2 }} textAnchor="start" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Rise {rise}m</motion.text>
    </svg>
  );
};
