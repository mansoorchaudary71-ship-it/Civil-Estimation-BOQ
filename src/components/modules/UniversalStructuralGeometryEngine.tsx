import React, { useState, useEffect } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { Save, RefreshCw, Calculator, Layers, Shapes, Maximize, Layout, Columns } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SVGs ---
const RectangularSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500">
    <rect x="25" y="20" width="50" height="60" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <circle cx="35" cy="30" r="3" fill="currentColor" />
    <circle cx="65" cy="30" r="3" fill="currentColor" />
    <circle cx="35" cy="70" r="3" fill="currentColor" />
    <circle cx="65" cy="70" r="3" fill="currentColor" />
    <rect x="30" y="25" width="40" height="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
  </svg>
);

const CircularSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
    <circle cx="50" cy="50" r="35" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="25" r="3" fill="currentColor" />
    <circle cx="70" cy="35" r="3" fill="currentColor" />
    <circle cx="75" cy="50" r="3" fill="currentColor" />
    <circle cx="70" cy="65" r="3" fill="currentColor" />
    <circle cx="50" cy="75" r="3" fill="currentColor" />
    <circle cx="30" cy="65" r="3" fill="currentColor" />
    <circle cx="25" cy="50" r="3" fill="currentColor" />
    <circle cx="30" cy="35" r="3" fill="currentColor" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
  </svg>
);

const HollowTubeSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-500">
    <circle cx="50" cy="50" r="40" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="50" r="25" fill="white" stroke="currentColor" strokeWidth="2" />
    <line x1="50" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
  </svg>
);

const StaircaseSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500">
    <path d="M 20 80 L 40 80 L 40 60 L 60 60 L 60 40 L 80 40 L 80 20 L 90 20 L 90 90 L 20 90 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="90" x2="80" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
  </svg>
);

const PrecastWallSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500">
    <rect x="20" y="30" width="10" height="60" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
    <rect x="70" y="30" width="10" height="60" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
    <rect x="30" y="40" width="40" height="15" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
    <rect x="30" y="60" width="40" height="15" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
    <rect x="15" y="80" width="20" height="10" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    <rect x="65" y="80" width="20" height="10" fill="currentColor" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const RoofPitchSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500">
    <path d="M 10 70 L 50 30 L 90 70 L 80 70 L 50 40 L 20 70 Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
    <line x1="50" y1="30" x2="50" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
    <line x1="10" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default function UniversalStructuralGeometryEngine() {
  const { addItem } = useBOQ();
  const [activeTab, setActiveTab] = useState('rectangular');
  
  // Inputs
  const [inputs, setInputs] = useState({
    // Rectangular
    rectL: 3, rectW: 0.3, rectD: 0.45, rectRebarCount: 4, rectRebarDia: 16, rectStirrupDia: 8, rectStirrupSpacing: 0.15,
    // Circular
    circD: 0.5, circH: 3, circRebarCount: 6, circRebarDia: 16, circSpiralDia: 8, circSpiralPitch: 0.1,
    // Hollow Tube
    tubeOD: 1.0, tubeID: 0.8, tubeL: 2.5,
    // Precast Wall
    wallL: 30, panelH: 0.3, panelThick: 0.05, postSpacing: 2, wallTotalH: 1.8,
    // Staircase
    stairRise: 0.15, stairGoing: 0.3, stairWidth: 1.2, stairWaist: 0.15, stairSteps: 12,
    // Roof Pitch
    roofSpan: 8, roofRise: 2, roofRun: 10
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
  };

  const calculateRectangular = () => {
    const vol = inputs.rectL * inputs.rectW * inputs.rectD;
    const formwork = 2 * (inputs.rectW + inputs.rectD) * inputs.rectL;
    // Rebar weight: D^2 / 162.28 kg/m
    const longWeight = inputs.rectRebarCount * inputs.rectL * (Math.pow(inputs.rectRebarDia, 2) / 162.28);
    const stirrupLength = 2 * (inputs.rectW + inputs.rectD) - 0.16 + 0.15; // approx deduct cover, add hooks
    const stirrupCount = Math.ceil(inputs.rectL / inputs.rectStirrupSpacing) + 1;
    const stirrupWeight = stirrupCount * stirrupLength * (Math.pow(inputs.rectStirrupDia, 2) / 162.28);
    return { vol, formwork, longWeight, stirrupWeight, totalSteel: longWeight + stirrupWeight };
  };

  const calculateCircular = () => {
    const vol = Math.PI * Math.pow(inputs.circD / 2, 2) * inputs.circH;
    const formwork = Math.PI * inputs.circD * inputs.circH;
    const longWeight = inputs.circRebarCount * inputs.circH * (Math.pow(inputs.circRebarDia, 2) / 162.28);
    const spiralLength = (inputs.circH / inputs.circSpiralPitch) * Math.PI * (inputs.circD - 0.08); // approx core dia
    const spiralWeight = spiralLength * (Math.pow(inputs.circSpiralDia, 2) / 162.28);
    return { vol, formwork, longWeight, spiralWeight, totalSteel: longWeight + spiralWeight };
  };

  const calculateTube = () => {
    const vol = Math.PI * (Math.pow(inputs.tubeOD / 2, 2) - Math.pow(inputs.tubeID / 2, 2)) * inputs.tubeL;
    const weight = vol * 2400;
    const formwork = Math.PI * inputs.tubeOD * inputs.tubeL + Math.PI * inputs.tubeID * inputs.tubeL;
    return { vol, weight, formwork };
  };

  const calculatePrecast = () => {
    const postCount = Math.ceil(inputs.wallL / inputs.postSpacing) + 1;
    const panelsPerBay = Math.ceil(inputs.wallTotalH / inputs.panelH);
    const totalPanels = (postCount - 1) * panelsPerBay;
    const panelVol = inputs.postSpacing * inputs.panelH * inputs.panelThick * totalPanels;
    const postVol = postCount * (0.15 * 0.15 * (inputs.wallTotalH + 0.6)); // embedded 0.6m
    const footingVol = postCount * (0.4 * 0.4 * 0.4);
    return { postCount, totalPanels, panelVol, postVol, footingVol, totalVol: panelVol + postVol + footingVol };
  };

  const calculateStaircase = () => {
    const flightLength = inputs.stairSteps * inputs.stairGoing;
    const flightHeight = inputs.stairSteps * inputs.stairRise;
    const inclinedLength = Math.sqrt(Math.pow(flightLength, 2) + Math.pow(flightHeight, 2));
    const waistVol = inclinedLength * inputs.stairWidth * inputs.stairWaist;
    const stepVol = inputs.stairSteps * 0.5 * inputs.stairRise * inputs.stairGoing * inputs.stairWidth;
    const vol = waistVol + stepVol;
    // rule of thumb steel ~ 120kg/m3
    const steel = vol * 120;
    const formwork = inclinedLength * inputs.stairWidth + 2 * (stepVol / inputs.stairWidth) + inputs.stairSteps * inputs.stairRise * inputs.stairWidth;
    return { vol, steel, formwork };
  };

  const calculateRoof = () => {
    const rafterLength = Math.sqrt(Math.pow(inputs.roofSpan / 2, 2) + Math.pow(inputs.roofRise, 2));
    const angleRad = Math.atan(inputs.roofRise / (inputs.roofSpan / 2));
    const angleDeg = angleRad * (180 / Math.PI);
    const area = 2 * (rafterLength * inputs.roofRun); // both sides
    const pitchRatio = (inputs.roofRise / (inputs.roofSpan / 2)) * 12;
    return { rafterLength, angleDeg, area, pitchRatio };
  };

  const sendToBOQ = () => {
    let name = "";
    let vol = 0;
    
    if (activeTab === 'rectangular') {
      const res = calculateRectangular();
      addItem({ name: 'Rectangular Element Concrete', quantity: res.vol, unit: 'm³', rate: 15000, category: 'Concrete' });
      addItem({ name: 'Formwork', quantity: res.formwork, unit: 'm²', rate: 800, category: 'Formwork' });
      addItem({ name: 'Reinforcement Steel', quantity: res.totalSteel, unit: 'kg', rate: 260, category: 'Steel' });
      return;
    }
    if (activeTab === 'circular') {
      const res = calculateCircular();
      addItem({ name: 'Circular Element Concrete', quantity: res.vol, unit: 'm³', rate: 16000, category: 'Concrete' });
      addItem({ name: 'Circular Formwork', quantity: res.formwork, unit: 'm²', rate: 1200, category: 'Formwork' });
      addItem({ name: 'Reinforcement Steel', quantity: res.totalSteel, unit: 'kg', rate: 260, category: 'Steel' });
      return;
    }
    if (activeTab === 'tube') {
      const res = calculateTube();
      addItem({ name: 'Hollow Tube Concrete', quantity: res.vol, unit: 'm³', rate: 15000, category: 'Concrete' });
      addItem({ name: 'Tube Formwork (Inner+Outer)', quantity: res.formwork, unit: 'm²', rate: 900, category: 'Formwork' });
      return;
    }
    if (activeTab === 'precast') {
      const res = calculatePrecast();
      addItem({ name: 'Precast Panels', quantity: res.totalPanels, unit: 'Nos', rate: 2000, category: 'Concrete' });
      addItem({ name: 'Precast Posts', quantity: res.postCount, unit: 'Nos', rate: 3500, category: 'Concrete' });
      addItem({ name: 'Footing Concrete', quantity: res.footingVol, unit: 'm³', rate: 14000, category: 'Concrete' });
      return;
    }
    if (activeTab === 'staircase') {
      const res = calculateStaircase();
      addItem({ name: 'Staircase Concrete', quantity: res.vol, unit: 'm³', rate: 15000, category: 'Concrete' });
      addItem({ name: 'Staircase Formwork', quantity: res.formwork, unit: 'm²', rate: 1000, category: 'Formwork' });
      addItem({ name: 'Staircase Reinforcement', quantity: res.steel, unit: 'kg', rate: 260, category: 'Steel' });
      return;
    }
    if (activeTab === 'roof') {
      const res = calculateRoof();
      addItem({ name: 'Sloped Roof Area', quantity: res.area, unit: 'm²', rate: 3500, category: 'Finishes' });
      return;
    }
  };

  const tabs = [
    { id: 'rectangular', name: 'Rectangular', icon: <Maximize size={16} /> },
    { id: 'circular', name: 'Circular', icon: <Shapes size={16} /> },
    { id: 'tube', name: 'Hollow Tube', icon: <Columns size={16} /> },
    { id: 'precast', name: 'Precast Wall', icon: <Layout size={16} /> },
    { id: 'staircase', name: 'Staircase', icon: <Layers size={16} /> },
    { id: 'roof', name: 'Roof Pitch', icon: <Calculator size={16} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Universal Structural Geometry Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Multi-shape volumetric & material calculator</p>
        </div>
        <button 
          onClick={sendToBOQ}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
        >
          <Save size={18} /> Send to BOQ
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
          >
            {t.icon} <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
              Geometry Parameters
            </h2>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {activeTab === 'rectangular' && (
                  <>
                    <InputGroup label="Length (L) [m]" name="rectL" value={inputs.rectL} onChange={handleInput} />
                    <InputGroup label="Width (W) [m]" name="rectW" value={inputs.rectW} onChange={handleInput} />
                    <InputGroup label="Depth (D) [m]" name="rectD" value={inputs.rectD} onChange={handleInput} />
                    <InputGroup label="Main Rebar Count" name="rectRebarCount" value={inputs.rectRebarCount} onChange={handleInput} />
                    <InputGroup label="Main Rebar Dia [mm]" name="rectRebarDia" value={inputs.rectRebarDia} onChange={handleInput} />
                    <InputGroup label="Stirrup Dia [mm]" name="rectStirrupDia" value={inputs.rectStirrupDia} onChange={handleInput} />
                    <InputGroup label="Stirrup Spacing [m]" name="rectStirrupSpacing" value={inputs.rectStirrupSpacing} onChange={handleInput} />
                  </>
                )}

                {activeTab === 'circular' && (
                  <>
                    <InputGroup label="Diameter (D) [m]" name="circD" value={inputs.circD} onChange={handleInput} />
                    <InputGroup label="Height (H) [m]" name="circH" value={inputs.circH} onChange={handleInput} />
                    <InputGroup label="Vertical Rebar Count" name="circRebarCount" value={inputs.circRebarCount} onChange={handleInput} />
                    <InputGroup label="Vertical Rebar Dia [mm]" name="circRebarDia" value={inputs.circRebarDia} onChange={handleInput} />
                    <InputGroup label="Spiral Tie Dia [mm]" name="circSpiralDia" value={inputs.circSpiralDia} onChange={handleInput} />
                    <InputGroup label="Spiral Pitch [m]" name="circSpiralPitch" value={inputs.circSpiralPitch} onChange={handleInput} />
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
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
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
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 w-full text-left">Cross Section</h3>
            <div className="w-48 h-48">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {activeTab === 'rectangular' && <RectangularSVG />}
                  {activeTab === 'circular' && <CircularSVG />}
                  {activeTab === 'tube' && <HollowTubeSVG />}
                  {activeTab === 'precast' && <PrecastWallSVG />}
                  {activeTab === 'staircase' && <StaircaseSVG />}
                  {activeTab === 'roof' && <RoofPitchSVG />}
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
          {isNaN(value) ? "0.00" : (value % 1 === 0 && unit === 'Nos' ? value : value.toFixed(2))}
        </span>
        <span className="text-indigo-300 ml-1.5 text-sm">{unit}</span>
      </div>
    </div>
  );
}
