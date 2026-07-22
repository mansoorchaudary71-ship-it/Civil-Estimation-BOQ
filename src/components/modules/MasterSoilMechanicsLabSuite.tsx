import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Beaker, MountainSnow, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeComplianceBadge, ApparatusHelperBox } from '../ui/CodeComplianceBadge';

export default function MasterSoilMechanicsLabSuite() {
  const [activeTab, setActiveTab] = useState('physical');

  const tabs = [
    { id: 'physical', name: 'Physical & Index Properties', icon: <Beaker size={18} /> },
    { id: 'field', name: 'Field Density & CBR', icon: <MountainSnow size={18} /> },
    { id: 'shear', name: 'Shear & Permeability', icon: <Droplets size={18} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Master Soil Mechanics & Geotech Lab Suite</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">Comprehensive portal for all major geotechnical laboratory testing and analysis.</p>
          <div className="flex gap-4">
            <CodeComplianceBadge standard="IS 2720 / ASTM D1883" title="Geotechnical Standard" description="Adheres to standardized soil mechanics parameters." />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id 
                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {t.icon} {t.name}
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

// --------------------------------------------------------------------------------------
// 1. PHYSICAL & INDEX PROPERTIES
// --------------------------------------------------------------------------------------
function PhysicalPropertiesModule() {
  // Water Content
  const [wcM1, setWcM1] = useState(25);
  const [wcM2, setWcM2] = useState(125);
  const [wcM3, setWcM3] = useState(105);
  const wcMassOfWater = wcM2 - wcM3;
  const wcMassOfDrySoil = wcM3 - wcM1;
  const waterContent = wcMassOfDrySoil > 0 ? (wcMassOfWater / wcMassOfDrySoil) * 100 : 0;

  // Specific Gravity
  const [sgM1, setSgM1] = useState(500);
  const [sgM2, setSgM2] = useState(700);
  const [sgM3, setSgM3] = useState(1600);
  const [sgM4, setSgM4] = useState(1475);
  const gsMassSoil = sgM2 - sgM1;
  const gs = (gsMassSoil > 0 && (sgM4 - sgM1 - (sgM3 - sgM2)) !== 0) ? (gsMassSoil / (sgM4 - sgM1 - (sgM3 - sgM2))) : 0;

  // Sieve Analysis
  const [sieveTotal, setSieveTotal] = useState(1000);
  const sieveData = [
    { size: 4.75, retained: 50 },
    { size: 2.00, retained: 150 },
    { size: 0.85, retained: 300 },
    { size: 0.425, retained: 200 },
    { size: 0.15, retained: 150 },
    { size: 0.075, retained: 100 },
    { size: 'Pan', retained: 50 }
  ];
  let cumulative = 0;
  const plotDataSieve = sieveData.filter(d => typeof d.size === 'number').map(d => {
    cumulative += d.retained;
    const passing = Math.max(0, 100 - (cumulative / sieveTotal) * 100);
    return { size: d.size, passing };
  }).reverse(); // Reverse for log scale appearance x-axis

  // Liquid Limit
  const llData = [
    { blows: 15, moisture: 45 },
    { blows: 22, moisture: 42 },
    { blows: 28, moisture: 39 },
    { blows: 35, moisture: 37 }
  ];
  // Simplistic LL approx at 25 blows
  const llInterpolated = 40.5; // Demo

  // Free Swell
  const [fsWater, setFsWater] = useState(15);
  const [fsKerosene, setFsKerosene] = useState(10);
  const freeSwell = fsKerosene > 0 ? ((fsWater - fsKerosene) / fsKerosene) * 100 : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Water Content (Oven Drying)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InputGroup label="M1: Empty Container (g)" value={wcM1} onChange={(e: any) => setWcM1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="M2: Container + Wet (g)" value={wcM2} onChange={(e: any) => setWcM2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="M3: Container + Dry (g)" value={wcM3} onChange={(e: any) => setWcM3(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Water Content (w)" value={waterContent} unit="%" />
        </Card>

        <Card title="Specific Gravity (Pycnometer)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="M1: Empty Pyc (g)" value={sgM1} onChange={(e: any) => setSgM1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="M2: Pyc + Dry Soil (g)" value={sgM2} onChange={(e: any) => setSgM2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="M3: Pyc + Soil + Water (g)" value={sgM3} onChange={(e: any) => setSgM3(parseFloat(e.target.value) || 0)} />
            <InputGroup label="M4: Pyc + Water (g)" value={sgM4} onChange={(e: any) => setSgM4(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Specific Gravity (G)" value={Math.abs(gs)} unit="" digits={3} />
        </Card>

        <Card title="Free Swell Index">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Vol in Water (ml)" value={fsWater} onChange={(e: any) => setFsWater(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Vol in Kerosene (ml)" value={fsKerosene} onChange={(e: any) => setFsKerosene(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Free Swell Index" value={freeSwell} unit="%" />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Master Sieve Analysis">
          <div className="flex gap-4 mb-4">
             <InputGroup label="Total Sample Mass (g)" value={sieveTotal} onChange={(e: any) => setSieveTotal(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plotDataSieve} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="size" reversed type="category" label={{ value: 'Particle Size (mm)', position: 'bottom' }} />
                <YAxis domain={[0, 100]} label={{ value: '% Passing', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="passing" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Liquid Limit (Flow Curve)">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={llData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="blows" type="number" domain={[10, 40]} label={{ value: 'Number of Blows (N)', position: 'bottom' }} />
                <YAxis domain={[30, 50]} label={{ value: 'Water Content (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <ReferenceLine x={25} stroke="#ef4444" strokeDasharray="3 3" label="N=25" />
                <Line type="monotone" dataKey="moisture" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <ResultRow label="Liquid Limit @ 25 blows" value={llInterpolated} unit="%" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// 2. FIELD DENSITY & CBR
// --------------------------------------------------------------------------------------
function FieldDensityModule() {
  // Core Cutter
  const [ccDia, setCcDia] = useState(10); // cm
  const [ccH, setCcH] = useState(13); // cm
  const [ccM1, setCcM1] = useState(1000); // g empty
  const [ccM2, setCcM2] = useState(3000); // g full
  const [ccWc, setCcWc] = useState(12); // % wc
  const [ccMDD, setCcMDD] = useState(1.95); // MDD g/cc

  const ccVol = Math.PI * Math.pow(ccDia / 2, 2) * ccH; // cm3
  const ccBulkDens = ccVol > 0 ? (ccM2 - ccM1) / ccVol : 0; // g/cc
  const ccDryDens = ccBulkDens / (1 + (ccWc / 100)); // g/cc
  const ccCompaction = ccMDD > 0 ? (ccDryDens / ccMDD) * 100 : 0;

  // CBR
  const cbrData = [
    { pen: 0.0, load: 0 },
    { pen: 0.5, load: 15 },
    { pen: 1.0, load: 30 },
    { pen: 1.5, load: 45 },
    { pen: 2.0, load: 58 },
    { pen: 2.5, load: 70 }, // Load at 2.5mm
    { pen: 3.0, load: 81 },
    { pen: 4.0, load: 95 },
    { pen: 5.0, load: 105 }, // Load at 5.0mm
    { pen: 7.5, load: 120 },
    { pen: 10.0, load: 130 },
    { pen: 12.5, load: 135 },
  ];
  
  const load25 = 70;
  const load50 = 105;
  const cbr25 = (load25 / 1370) * 100;
  const cbr50 = (load50 / 2055) * 100;
  const cbrReported = Math.max(cbr25, cbr50);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="In-Situ Density (Core Cutter)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Cutter Internal Dia (cm)" value={ccDia} onChange={(e: any) => setCcDia(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Cutter Height (cm)" value={ccH} onChange={(e: any) => setCcH(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Mass Empty Cutter (g)" value={ccM1} onChange={(e: any) => setCcM1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Mass Cutter + Soil (g)" value={ccM2} onChange={(e: any) => setCcM2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Field Moisture Content (%)" value={ccWc} onChange={(e: any) => setCcWc(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Proctor MDD (g/cc)" value={ccMDD} onChange={(e: any) => setCcMDD(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2 mt-6">
            <ResultRow label="Bulk Density" value={ccBulkDens} unit="g/cc" />
            <ResultRow label="Field Dry Density (FDD)" value={ccDryDens} unit="g/cc" />
            <ResultRow label="Relative Compaction" value={ccCompaction} unit="%" />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="California Bearing Ratio (CBR)">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">CBR @ 2.5mm</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{cbr25.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">CBR @ 5.0mm</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{cbr50.toFixed(2)}%</div>
            </div>
          </div>
          <ResultRow label="Reported CBR Value" value={cbrReported} unit="%" />
          
          <div className="h-[250px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cbrData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="pen" type="number" domain={[0, 13]} label={{ value: 'Penetration (mm)', position: 'bottom' }} />
                <YAxis label={{ value: 'Load (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <ReferenceLine x={2.5} stroke="#6366f1" strokeDasharray="3 3" />
                <ReferenceLine x={5.0} stroke="#6366f1" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// 3. SHEAR STRENGTH & PERMEABILITY
// --------------------------------------------------------------------------------------
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
  // Simple linear interpolation
  const phiRad = Math.atan((110 - 40) / (150 - 50));
  const phi = phiRad * (180 / Math.PI);
  const c = 40 - Math.tan(phiRad) * 50;

  // Permeability (Falling Head / Constant Head)
  const [permMode, setPermMode] = useState<'falling' | 'constant'>('falling');
  const [permA, setPermA] = useState(50); // cm2
  const [permL, setPermL] = useState(10); // cm
  
  // Falling head specifics
  const [perma, setPerma] = useState(1); // cm2
  const [permH1, setPermH1] = useState(100); // cm
  const [permH2, setPermH2] = useState(50); // cm
  
  // Constant head specifics
  const [permQ, setPermQ] = useState(100); // cm3
  const [permConstH, setPermConstH] = useState(50); // cm
  
  const [permT, setPermT] = useState(3600); // seconds

  let k = 0;
  if (permMode === 'falling') {
    k = (perma * permL) / (permA * permT) * Math.log(permH1 / permH2); // cm/sec
  } else {
    k = (permQ * permL) / (permA * permConstH * permT); // cm/sec
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Vane Shear Test">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="Torque (N-m)" value={vsTorque} onChange={(e: any) => setVsTorque(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Vane Dia (mm)" value={vsD} onChange={(e: any) => setVsD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Vane Height (mm)" value={vsH} onChange={(e: any) => setVsH(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Undrained Shear Strength (Cu)" value={cu} unit="kPa" />
        </Card>

        <Card title="Unconfined Compressive Strength (UCS)">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Sample Dia (mm)" value={ucsD} onChange={(e: any) => setUcsD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sample Height (mm)" value={ucsH} onChange={(e: any) => setUcsH(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Failure Load (N)" value={ucsLoad} onChange={(e: any) => setUcsLoad(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Failure Strain (%)" value={ucsStrain} onChange={(e: any) => setUcsStrain(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="space-y-2 mt-4">
            <ResultRow label="Compressive Strength (qu)" value={qu} unit="kPa" />
            <ResultRow label="Cohesion (Cu = qu/2)" value={cu_ucs} unit="kPa" />
          </div>
        </Card>

        <Card title="Permeability Coefficient">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setPermMode('falling')} className={`flex-1 py-1.5 text-sm rounded ${permMode === 'falling' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Falling Head</button>
            <button onClick={() => setPermMode('constant')} className={`flex-1 py-1.5 text-sm rounded ${permMode === 'constant' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>Constant Head</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="Sample Area A (cm²)" value={permA} onChange={(e: any) => setPermA(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sample Len L (cm)" value={permL} onChange={(e: any) => setPermL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Time (s)" value={permT} onChange={(e: any) => setPermT(parseFloat(e.target.value) || 0)} />
            
            {permMode === 'falling' ? (
              <>
                <InputGroup label="Pipe Area a (cm²)" value={perma} onChange={(e: any) => setPerma(parseFloat(e.target.value) || 0)} />
                <InputGroup label="Head 1 h1 (cm)" value={permH1} onChange={(e: any) => setPermH1(parseFloat(e.target.value) || 0)} />
                <InputGroup label="Head 2 h2 (cm)" value={permH2} onChange={(e: any) => setPermH2(parseFloat(e.target.value) || 0)} />
              </>
            ) : (
              <>
                <InputGroup label="Volume Q (cm³)" value={permQ} onChange={(e: any) => setPermQ(parseFloat(e.target.value) || 0)} />
                <InputGroup label="Constant Head (cm)" value={permConstH} onChange={(e: any) => setPermConstH(parseFloat(e.target.value) || 0)} />
              </>
            )}
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
                <Line type="monotone" dataKey="shear" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Failure Env" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// SHARED COMPONENTS
// --------------------------------------------------------------------------------------
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
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-tight">{label}</label>
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
    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
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
