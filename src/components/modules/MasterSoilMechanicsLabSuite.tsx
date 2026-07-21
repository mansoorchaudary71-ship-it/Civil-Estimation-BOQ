import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useBOQ } from '../../context/BOQContext';
import { Beaker, MountainSnow, Droplets, Save, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterSoilMechanicsLabSuite() {
  const [activeTab, setActiveTab] = useState('physical');
  const { addItem } = useBOQ();

  const tabs = [
    { id: 'physical', name: 'Physical & Index Properties', icon: <Beaker size={18} /> },
    { id: 'field', name: 'Field Density & CBR', icon: <MountainSnow size={18} /> },
    { id: 'shear', name: 'Shear & Permeability', icon: <Droplets size={18} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Master Soil Mechanics & Geotech Lab Suite</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Comprehensive laboratory testing and analysis portal</p>
        </div>
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'physical' && <PhysicalPropertiesModule />}
          {activeTab === 'field' && <FieldDensityModule />}
          {activeTab === 'shear' && <ShearPermeabilityModule />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PhysicalPropertiesModule() {
  // Water Content
  const [wcW1, setWcw1] = useState(50); // empty container
  const [wcW2, setWcw2] = useState(250); // container + wet soil
  const [wcW3, setWcw3] = useState(210); // container + dry soil
  
  const waterContent = wcW2 && wcW3 && wcW1 ? ((wcW2 - wcW3) / (wcW3 - wcW1)) * 100 : 0;

  // Specific Gravity
  const [sgW1, setSgw1] = useState(500); // empty pycnometer
  const [sgW2, setSgw2] = useState(900); // pycnometer + dry soil
  const [sgW3, setSgw3] = useState(1600); // pyc + soil + water
  const [sgW4, setSgw4] = useState(1350); // pyc + water

  const specificGravity = sgW2 && sgW1 && sgW3 && sgW4 ? (sgW2 - sgW1) / ((sgW2 - sgW1) - (sgW3 - sgW4)) : 0;

  // Sieve Analysis
  const [sieveData, setSieveData] = useState([
    { size: 4.75, retained: 50 },
    { size: 2.0, retained: 100 },
    { size: 0.85, retained: 150 },
    { size: 0.425, retained: 200 },
    { size: 0.15, retained: 250 },
    { size: 0.075, retained: 150 },
    { size: 0.01, retained: 100 },
  ]);
  
  const totalWeight = sieveData.reduce((acc, curr) => acc + curr.retained, 0);
  let cumulative = 0;
  const gradationData = sieveData.map(d => {
    cumulative += d.retained;
    const passing = 100 - (cumulative / totalWeight) * 100;
    return { size: d.size, passing: Math.max(0, passing) };
  }).reverse(); // Reverse for charting (log scale approx)

  // Liquid Limit
  const [llData, setLlData] = useState([
    { blows: 15, moisture: 45 },
    { blows: 22, moisture: 42 },
    { blows: 28, moisture: 39 },
    { blows: 35, moisture: 36 },
  ]);

  // Free Swell
  const [fsWater, setFsWater] = useState(20);
  const [fsKerosene, setFsKerosene] = useState(15);
  const freeSwell = fsKerosene ? ((fsWater - fsKerosene) / fsKerosene) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Water Content (Oven Drying)">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="W1 (Container) [g]" value={wcW1} onChange={e => setWcw1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W2 (Wet) [g]" value={wcW2} onChange={e => setWcw2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W3 (Dry) [g]" value={wcW3} onChange={e => setWcw3(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Water Content" value={waterContent} unit="%" />
        </Card>

        <Card title="Specific Gravity (Pycnometer)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="W1 (Empty Pyc) [g]" value={sgW1} onChange={e => setSgw1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W2 (Pyc + Soil) [g]" value={sgW2} onChange={e => setSgw2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W3 (Pyc + Soil + Water) [g]" value={sgW3} onChange={e => setSgw3(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W4 (Pyc + Water) [g]" value={sgW4} onChange={e => setSgw4(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Specific Gravity (G)" value={specificGravity} unit="" />
        </Card>

        <Card title="Free Swell Index">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Vol in Water [ml]" value={fsWater} onChange={e => setFsWater(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Vol in Kerosene [ml]" value={fsKerosene} onChange={e => setFsKerosene(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Free Swell Index" value={freeSwell} unit="%" />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Particle Size Distribution (Gradation)">
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradationData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="size" type="number" scale="log" domain={['auto', 'auto']} label={{ value: 'Particle Size (mm)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '% Passing', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="passing" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Liquid Limit (Casagrande)">
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="blows" type="number" scale="log" domain={[10, 100]} label={{ value: 'No. of Blows', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="moisture" type="number" domain={['auto', 'auto']} label={{ value: 'Moisture Content (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Tests" data={llData} fill="#ec4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FieldDensityModule() {
  // Core Cutter
  const [ccD, setCcD] = useState(10); // cm
  const [ccH, setCcH] = useState(13); // cm
  const [ccW1, setCcW1] = useState(1000); // core cutter empty (g)
  const [ccW2, setCcW2] = useState(3100); // core cutter + wet soil (g)
  const [ccWc, setCcWc] = useState(12); // water content %
  const [ccMDD, setCcMDD] = useState(1.85); // Maximum dry density (g/cc)

  const vol = Math.PI * Math.pow(ccD / 2, 2) * ccH;
  const wetMass = ccW2 - ccW1;
  const bulkDensity = vol ? wetMass / vol : 0;
  const dryDensity = bulkDensity / (1 + ccWc / 100);
  const compaction = ccMDD ? (dryDensity / ccMDD) * 100 : 0;

  // CBR
  const cbrData = [
    { pen: 0.5, load: 15 },
    { pen: 1.0, load: 30 },
    { pen: 1.5, load: 45 },
    { pen: 2.0, load: 60 },
    { pen: 2.5, load: 72 }, // standard load 1370 kg
    { pen: 3.0, load: 82 },
    { pen: 4.0, load: 95 },
    { pen: 5.0, load: 105 }, // standard load 2055 kg
    { pen: 7.5, load: 120 },
    { pen: 10.0, load: 130 },
  ];
  
  const load25 = 72;
  const load50 = 105;
  const cbr25 = (load25 / 1370) * 100;
  const cbr50 = (load50 / 2055) * 100;
  const cbrReported = Math.max(cbr25, cbr50);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="In-Situ Density (Core Cutter)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Cutter Diameter [cm]" value={ccD} onChange={e => setCcD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Cutter Height [cm]" value={ccH} onChange={e => setCcH(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W1 (Empty Cutter) [g]" value={ccW1} onChange={e => setCcW1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="W2 (Cutter + Wet Soil) [g]" value={ccW2} onChange={e => setCcW2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Water Content [%]" value={ccWc} onChange={e => setCcWc(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Lab MDD [g/cc]" value={ccMDD} onChange={e => setCcMDD(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2 mt-4">
            <ResultRow label="Bulk Density" value={bulkDensity} unit="g/cc" />
            <ResultRow label="Field Dry Density (FDD)" value={dryDensity} unit="g/cc" />
            <ResultRow label="Degree of Compaction" value={compaction} unit="%" />
            <div className={`mt-2 p-3 rounded-lg text-center font-bold ${compaction >= 95 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {compaction >= 95 ? 'PASS (≥95%)' : 'FAIL (<95%)'}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="California Bearing Ratio (CBR)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">CBR @ 2.5mm</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{cbr25.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">CBR @ 5.0mm</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{cbr50.toFixed(2)}%</div>
            </div>
          </div>
          <ResultRow label="Reported CBR Value" value={cbrReported} unit="%" />
          
          <div className="h-[250px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cbrData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="pen" type="number" domain={[0, 'auto']} label={{ value: 'Penetration (mm)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Load (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ShearPermeabilityModule() {
  // Vane Shear
  const [vsTorque, setVsTorque] = useState(15); // N-m
  const [vsD, setVsD] = useState(50); // mm
  const [vsH, setVsH] = useState(100); // mm
  const D_m = vsD / 1000;
  const H_m = vsH / 1000;
  const cu = vsTorque ? (vsTorque / (Math.PI * Math.pow(D_m, 2) * (H_m / 2 + D_m / 6))) / 1000 : 0; // kPa

  // UCS
  const [ucsD, setUcsD] = useState(38); // mm
  const [ucsH, setUcsH] = useState(76); // mm
  const [ucsLoad, setUcsLoad] = useState(250); // N
  const [ucsStrain, setUcsStrain] = useState(15); // %
  const A0 = Math.PI * Math.pow(ucsD / 1000, 2) / 4; // m2
  const Ac = A0 / (1 - ucsStrain / 100);
  const qu = Ac ? (ucsLoad / 1000) / Ac : 0; // kPa
  const cu_ucs = qu / 2;

  // Direct Shear (Mohr Coulomb)
  const shearData = [
    { normal: 50, shear: 40 },
    { normal: 100, shear: 75 },
    { normal: 150, shear: 110 },
  ];
  // slope approx
  const phi = Math.atan((110 - 40) / (150 - 50)) * (180 / Math.PI);
  const c = 40 - Math.tan(phi * Math.PI / 180) * 50;

  // Permeability (Falling Head)
  const [permA, setPermA] = useState(50); // cm2
  const [permL, setPermL] = useState(10); // cm
  const [perma, setPerma] = useState(1); // cm2 (standpipe)
  const [permH1, setPermH1] = useState(100); // cm
  const [permH2, setPermH2] = useState(50); // cm
  const [permT, setPermT] = useState(3600); // seconds
  const k = (perma * permL) / (permA * permT) * Math.log(permH1 / permH2); // cm/sec

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Vane Shear Test">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="Torque [N-m]" value={vsTorque} onChange={e => setVsTorque(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Vane D [mm]" value={vsD} onChange={e => setVsD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Vane H [mm]" value={vsH} onChange={e => setVsH(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Undrained Shear Strength (Cu)" value={cu} unit="kPa" />
        </Card>

        <Card title="Unconfined Compressive Strength (UCS)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Sample Dia [mm]" value={ucsD} onChange={e => setUcsD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sample Height [mm]" value={ucsH} onChange={e => setUcsH(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Failure Load [N]" value={ucsLoad} onChange={e => setUcsLoad(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Failure Strain [%]" value={ucsStrain} onChange={e => setUcsStrain(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2 mt-4">
            <ResultRow label="UCS (qu)" value={qu} unit="kPa" />
            <ResultRow label="Cohesion (Cu = qu/2)" value={cu_ucs} unit="kPa" />
          </div>
        </Card>

        <Card title="Permeability (Falling Head)">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="Sample Area A [cm²]" value={permA} onChange={e => setPermA(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sample Len L [cm]" value={permL} onChange={e => setPermL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Pipe Area a [cm²]" value={perma} onChange={e => setPerma(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Head 1 (h1) [cm]" value={permH1} onChange={e => setPermH1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Head 2 (h2) [cm]" value={permH2} onChange={e => setPermH2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Time (t) [s]" value={permT} onChange={e => setPermT(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Coefficient (k)" value={k} unit="cm/sec" digits={6} />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Direct Shear Test (Mohr-Coulomb)">
          <div className="space-y-2 mb-6">
            <ResultRow label="Cohesion (c)" value={c} unit="kPa" />
            <ResultRow label="Friction Angle (φ)" value={phi} unit="°" />
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={shearData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="normal" type="number" domain={[0, 200]} label={{ value: 'Normal Stress (kPa)', position: 'bottom' }} />
                <YAxis type="number" domain={[0, 150]} label={{ value: 'Shear Stress (kPa)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="shear" stroke="#10b981" strokeWidth={2} dot={{ r: 5 }} name="Failure Env" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InputGroup({ label, value, onChange }: { label: string, value: number, onChange: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={0}
        step="any"
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
      />
    </div>
  );
}

function ResultRow({ label, value, unit, digits = 2 }: { label: string, value: number, unit: string, digits?: number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{label}</span>
      <div className="text-right flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {isNaN(value) || !isFinite(value) ? "0.00" : value.toFixed(digits)}
        </span>
        <span className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold">{unit}</span>
      </div>
    </div>
  );
}
