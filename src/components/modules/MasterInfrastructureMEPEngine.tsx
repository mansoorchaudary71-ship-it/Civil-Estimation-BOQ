import React, { useState } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shovel, Map, Zap, Save, Sun, CloudRain, ThermometerSnowflake, Route, Bug, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '../seo/SEOHead';
import { CodeComplianceBadge, ApparatusHelperBox } from '../ui/CodeComplianceBadge';

export default function MasterInfrastructureMEPEngine() {
  const [activeTab, setActiveTab] = useState('earthworks');
  const { addItem } = useBOQ();

  const tabs = [
    { id: 'earthworks', name: 'Earthworks & Site', icon: <Shovel size={18} /> },
    { id: 'infrastructure', name: 'Roads & Infra', icon: <Map size={18} /> },
    { id: 'mep', name: 'MEP & Green Energy', icon: <Zap size={18} /> }
  ];

  return (
    <SEOHead 
      title="Master Infrastructure & MEP Engine | Earthworks, Roads, Solar & HVAC Calculator" 
      description="Comprehensive estimation tool for earthworks, pavements, solar energy, rainwater harvesting, and HVAC sizing. Generate BOQs and ROI graphs." 
      toolName="Master Infrastructure & MEP Engine" 
      divisionName="Infrastructure & MEP"
    >
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Master Infrastructure & MEP Engine</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">Earthworks, Pavements, HVAC, and Green Energy integration portal.</p>
            <div className="flex gap-4">
              <CodeComplianceBadge standard="AASHTO / IRC:37" title="Highway Design Standard" description="Flexible pavement and structural numbers compliance." />
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
            {activeTab === 'earthworks' && <EarthworksModule addItem={addItem} />}
            {activeTab === 'infrastructure' && <InfrastructureModule addItem={addItem} />}
            {activeTab === 'mep' && <MEPModule addItem={addItem} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </SEOHead>
  );
}

// --------------------------------------------------------------------------------------
// 1. EARTHWORKS, SITE PREP & LANDSCAPING
// --------------------------------------------------------------------------------------
function EarthworksModule({ addItem }: { addItem: any }) {
  // Top Soil
  const [tsArea, setTsArea] = useState(150); // m2
  const [tsDepth, setTsDepth] = useState(0.15); // m
  const [tsShrink, setTsShrink] = useState(1.25); // Compaction shrinkage factor
  
  const tsNetVol = tsArea * tsDepth;
  const tsLooseVol = tsNetVol * tsShrink; // loose volume ordering
  const tsTonnage = tsLooseVol * 1.6; // approx 1.6 tons per m3 for loose topsoil
  const tsBag40lb = (tsTonnage * 1000) / 18.14; // 1 ton = 1000kg, 40lb = 18.14kg
  
  // Excavation & Backfill
  const [exL, setExL] = useState(10);
  const [exW, setExW] = useState(8);
  const [exD, setExD] = useState(1.5);
  const [exBulking, setExBulking] = useState(1.3); // swell factor
  const [exStructureVol, setExStructureVol] = useState(40); // concrete volume displacing soil
  
  const pitVol = exL * exW * exD;
  const exLooseVol = pitVol * exBulking;
  const netBackfill = pitVol - exStructureVol;
  
  // Anti-Termite Chemical Engine
  const [atArea, setAtArea] = useState(100); // Floor slab area
  const [atPerimeter, setAtPerimeter] = useState(40); // Perimeter trench length
  const [atRatio, setAtRatio] = useState(19); // Water dilution ratio 1:19
  
  // Standard: 5 Liters of diluted emulsion per m2 for slab, 7.5 Liters per linear meter for trench
  const dilutedSlab = atArea * 5; 
  const dilutedTrench = atPerimeter * 7.5;
  const totalDiluted = dilutedSlab + dilutedTrench;
  const chemConcentrate = totalDiluted / (1 + atRatio);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Top Soil Calculator">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="Area (m²)" value={tsArea} onChange={(e: any) => setTsArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Depth (m)" value={tsDepth} onChange={(e: any) => setTsDepth(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Shrinkage Factor" value={tsShrink} onChange={(e: any) => setTsShrink(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Net Compacted Volume" value={tsNetVol} unit="m³" />
          <ResultRow label="Loose Volume Ordering" value={tsLooseVol} unit="m³" />
          <ResultRow label="Estimated Tonnage" value={tsTonnage} unit="Tons" />
          <ResultRow label="40 lb Bags Count" value={Math.ceil(tsBag40lb)} unit="Bags" />
          <BoqBtn onClick={() => {
            addItem({ name: 'Top Soil (Loose)', quantity: tsLooseVol, unit: 'm³', rate: 45, category: 'Landscaping' });
          }} />
        </Card>

        <Card title="Anti-Termite Chemical Engine">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputGroup label="Slab Area (m²)" value={atArea} onChange={(e: any) => setAtArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Perimeter (m)" value={atPerimeter} onChange={(e: any) => setAtPerimeter(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Dilution Ratio (1:x)" value={atRatio} onChange={(e: any) => setAtRatio(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Slab Emulsion Required" value={dilutedSlab} unit="Liters" />
          <ResultRow label="Trench Emulsion Required" value={dilutedTrench} unit="Liters" />
          <ResultRow label="Total Diluted Volume" value={totalDiluted} unit="Liters" />
          <ResultRow label="Chemical Concentrate Required" value={chemConcentrate} unit="Liters" />
          <BoqBtn onClick={() => {
            addItem({ name: 'Termite Chemical Concentrate', quantity: chemConcentrate, unit: 'Liters', rate: 1200, category: 'Site Prep' });
          }} />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Excavation & Backfill">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Pit Length (m)" value={exL} onChange={(e: any) => setExL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Pit Width (m)" value={exW} onChange={(e: any) => setExW(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Pit Depth (m)" value={exD} onChange={(e: any) => setExD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Swelling Factor" value={exBulking} onChange={(e: any) => setExBulking(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sub-Structure Vol (m³)" value={exStructureVol} onChange={(e: any) => setExStructureVol(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Foundation Pit Volume" value={pitVol} unit="m³" />
          <ResultRow label="Loose Excavated Volume" value={exLooseVol} unit="m³" />
          <ResultRow label="Net Backfill Volume" value={Math.max(0, netBackfill)} unit="m³" />
          <ResultRow label="Surplus Spoil for Disposal" value={Math.max(0, pitVol - netBackfill) * exBulking} unit="m³" />
          <BoqBtn onClick={() => {
            addItem({ name: 'Excavation (Pit)', quantity: pitVol, unit: 'm³', rate: 350, category: 'Earthworks' });
            addItem({ name: 'Backfilling', quantity: Math.max(0, netBackfill), unit: 'm³', rate: 150, category: 'Earthworks' });
            addItem({ name: 'Soil Disposal', quantity: Math.max(0, pitVol - netBackfill) * exBulking, unit: 'm³', rate: 450, category: 'Earthworks' });
          }} />
        </Card>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// 2. INFRASTRUCTURE & ROAD PAVEMENTS
// --------------------------------------------------------------------------------------
function InfrastructureModule({ addItem }: { addItem: any }) {
  // Pavement
  const [pavL, setPavL] = useState(1000); // m
  const [pavW, setPavW] = useState(7); // m
  const [thBC, setThBC] = useState(0.04); // m
  const [thDBM, setThDBM] = useState(0.05); // m
  const [thWMM, setThWMM] = useState(0.25); // m
  const [thGSB, setThGSB] = useState(0.20); // m
  
  const pavArea = pavL * pavW;
  
  const volBC = pavArea * thBC;
  const volDBM = pavArea * thDBM;
  const volWMM = pavArea * thWMM;
  const volGSB = pavArea * thGSB;
  
  // Tonnage = volume * density (Approx 2.4t/m3 for asphalt, 2.2t/m3 for aggregates)
  const tonBC = volBC * 2.4;
  const tonDBM = volDBM * 2.4;
  const tonWMM = volWMM * 2.2;
  const tonGSB = volGSB * 2.1;
  
  // Prime & Tack Coat
  const primeCoat = pavArea * 0.9; // approx 0.9 kg/m2 on WMM
  const tackCoat = pavArea * 0.25; // approx 0.25 kg/m2 between DBM and BC

  // Mass Haul & Gradient
  const [chain1, setChain1] = useState(0);
  const [elev1, setElev1] = useState(100);
  const [chain2, setChain2] = useState(100);
  const [elev2, setElev2] = useState(102);
  const [cutArea, setCutArea] = useState(5);
  const [fillArea, setFillArea] = useState(2);
  
  const dist = chain2 - chain1;
  const grad = dist !== 0 ? ((elev2 - elev1) / dist) * 100 : 0;
  const cutVol = cutArea * dist;
  const fillVol = fillArea * dist;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Flexible Asphalt Pavement">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Road Length (m)" value={pavL} onChange={(e: any) => setPavL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Road Width (m)" value={pavW} onChange={(e: any) => setPavW(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <InputGroup label="BC Thk (m)" value={thBC} onChange={(e: any) => setThBC(parseFloat(e.target.value) || 0)} />
            <InputGroup label="DBM Thk (m)" value={thDBM} onChange={(e: any) => setThDBM(parseFloat(e.target.value) || 0)} />
            <InputGroup label="WMM Thk (m)" value={thWMM} onChange={(e: any) => setThWMM(parseFloat(e.target.value) || 0)} />
            <InputGroup label="GSB Thk (m)" value={thGSB} onChange={(e: any) => setThGSB(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Bituminous Concrete (BC)" value={tonBC} unit="Tons" />
          <ResultRow label="Dense Bitumen Macadam (DBM)" value={tonDBM} unit="Tons" />
          <ResultRow label="Wet Mix Macadam (WMM)" value={tonWMM} unit="Tons" />
          <ResultRow label="Granular Sub-Base (GSB)" value={tonGSB} unit="Tons" />
          <ResultRow label="Prime Coat" value={primeCoat} unit="kg" />
          <ResultRow label="Tack Coat" value={tackCoat} unit="kg" />
          <BoqBtn onClick={() => {
            addItem({ name: 'Bituminous Concrete', quantity: tonBC, unit: 'Tons', rate: 4500, category: 'Pavement' });
            addItem({ name: 'Dense Bitumen Macadam', quantity: tonDBM, unit: 'Tons', rate: 4000, category: 'Pavement' });
            addItem({ name: 'Wet Mix Macadam', quantity: tonWMM, unit: 'Tons', rate: 1200, category: 'Pavement' });
            addItem({ name: 'Granular Sub-Base', quantity: tonGSB, unit: 'Tons', rate: 800, category: 'Pavement' });
            addItem({ name: 'Prime & Tack Coat', quantity: primeCoat + tackCoat, unit: 'kg', rate: 60, category: 'Pavement' });
          }} />
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card title="Chainage Mass-Haul & Gradient">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Station 1 Chainage (m)" value={chain1} onChange={(e: any) => setChain1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Station 1 Elevation (m)" value={elev1} onChange={(e: any) => setElev1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Station 2 Chainage (m)" value={chain2} onChange={(e: any) => setChain2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Station 2 Elevation (m)" value={elev2} onChange={(e: any) => setElev2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Avg Cut Area (m²)" value={cutArea} onChange={(e: any) => setCutArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Avg Fill Area (m²)" value={fillArea} onChange={(e: any) => setFillArea(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Gradient" value={grad} unit="%" />
          <ResultRow label="Cut Volume" value={cutVol} unit="m³" />
          <ResultRow label="Fill Volume" value={fillVol} unit="m³" />
          <ResultRow label="Net (Cut - Fill)" value={cutVol - fillVol} unit="m³" />
        </Card>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// 3. SMART MEP, HVAC & GREEN ENERGY
// --------------------------------------------------------------------------------------
function MEPModule({ addItem }: { addItem: any }) {
  // Solar
  const [solUnits, setSolUnits] = useState(500); // kWh/month
  const [solHours, setSolHours] = useState(4.5); // Peak sun hours
  const solDaily = solUnits / 30;
  const solSize = solDaily / solHours; // kWp
  const invCap = solSize * 1.25; // 25% margin
  const batReq = solDaily * 1.5; // 1.5 days autonomy approx
  
  const roiData = Array.from({length: 11}, (_, i) => ({
    year: i,
    cost: (solSize * 1000) - (i * solUnits * 12 * 0.15) // Example $0.15 per unit, $1000 per kW install
  }));

  // AC
  const [acL, setAcL] = useState(5);
  const [acW, setAcW] = useState(4);
  const [acOccupants, setAcOccupants] = useState(2);
  const [acSun, setAcSun] = useState(1.1); // 1 normal, 1.1 sunny
  const acArea = acL * acW;
  const btu = (acArea * 337 + acOccupants * 400) * acSun; // rough BTU approx
  const tonAc = btu / 12000;

  // Solar Water Heater
  const [swhOcc, setSwhOcc] = useState(4);
  const swhLPD = swhOcc * 50; // 50L per person
  const swhArea = swhLPD / 50; // approx 1 m2 per 50L capacity

  // Rainwater Harvesting
  const [rwArea, setRwArea] = useState(150);
  const [rwRain, setRwRain] = useState(800); // mm/year
  const [rwCoeff, setRwCoeff] = useState(0.85); // roof coefficient
  const rwYield = rwArea * rwRain * rwCoeff; // Liters/year
  const rwTank = rwYield * 0.05; // 5% of annual yield for tank sizing

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Solar Rooftop Sizing & ROI">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Monthly Bill Units (kWh)" value={solUnits} onChange={(e: any) => setSolUnits(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Peak Sun Hours" value={solHours} onChange={(e: any) => setSolHours(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Required System Size" value={solSize} unit="kWp" />
          <ResultRow label="Inverter Capacity" value={invCap} unit="kW" />
          <ResultRow label="Battery Bank (Off-grid)" value={batReq} unit="kWh" />
          
          <div className="h-[220px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiData} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" tick={{fontSize: 10}} label={{ value: 'Years', position: 'bottom', offset: -5 }} />
                <YAxis tick={{fontSize: 10}} label={{ value: 'Net Cost ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} name="Cumulative Net Cost" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <BoqBtn onClick={() => {
              addItem({ name: 'Solar PV System', quantity: solSize, unit: 'kWp', rate: 1000, category: 'Green Energy' });
              addItem({ name: 'Solar Inverter', quantity: invCap, unit: 'kW', rate: 200, category: 'Green Energy' });
              addItem({ name: 'Battery Bank', quantity: batReq, unit: 'kWh', rate: 150, category: 'Green Energy' });
            }} />
          </div>
        </Card>
        
        <Card title="Solar Water Heater">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <InputGroup label="Occupant Count" value={swhOcc} onChange={(e: any) => setSwhOcc(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Daily Hot Water Demand" value={swhLPD} unit="LPD" />
          <ResultRow label="Collector Area Req." value={swhArea} unit="m²" />
          <BoqBtn onClick={() => {
              addItem({ name: 'Solar Water Heater', quantity: swhLPD, unit: 'Liters', rate: 5, category: 'Green Energy' });
          }} />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="AC / HVAC Sizing">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Room Length (m)" value={acL} onChange={(e: any) => setAcL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Room Width (m)" value={acW} onChange={(e: any) => setAcW(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Occupants" value={acOccupants} onChange={(e: any) => setAcOccupants(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sun Exposure Factor" value={acSun} onChange={(e: any) => setAcSun(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Cooling Load" value={btu} unit="BTU/hr" />
          <ResultRow label="Required AC Capacity" value={tonAc} unit="Tons" />
          <BoqBtn onClick={() => {
              addItem({ name: 'Air Conditioner Unit', quantity: Math.ceil(tonAc), unit: 'Tons', rate: 600, category: 'HVAC' });
          }} />
        </Card>
        
        <Card title="Rainwater Harvesting">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Catchment Area (m²)" value={rwArea} onChange={(e: any) => setRwArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Annual Rainfall (mm)" value={rwRain} onChange={(e: any) => setRwRain(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Runoff Coefficient" value={rwCoeff} onChange={(e: any) => setRwCoeff(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Annual Yield" value={rwYield} unit="Liters/yr" />
          <ResultRow label="Rec. Tank Capacity" value={rwTank} unit="Liters" />
          <BoqBtn onClick={() => {
              addItem({ name: 'Rainwater Storage Tank', quantity: rwTank, unit: 'Liters', rate: 0.1, category: 'Plumbing' });
          }} />
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
      <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
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

function BoqBtn({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="mt-6 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
    >
      <Save size={16} /> Add to Master BOQ
    </button>
  );
}
