import React, { useState } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shovel, Map, Zap, Save, Sun, CloudRain, ThermometerSnowflake, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MasterInfrastructureMEPEngine() {
  const [activeTab, setActiveTab] = useState('earthworks');
  const { addItem } = useBOQ();

  const tabs = [
    { id: 'earthworks', name: 'Earthworks & Site', icon: <Shovel size={18} /> },
    { id: 'infrastructure', name: 'Roads & Infra', icon: <Map size={18} /> },
    { id: 'mep', name: 'MEP & Green Energy', icon: <Zap size={18} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Master Infrastructure & MEP Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Earthworks, Pavements, HVAC, and Green Energy integration</p>
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
          {activeTab === 'earthworks' && <EarthworksModule addItem={addItem} />}
          {activeTab === 'infrastructure' && <InfrastructureModule addItem={addItem} />}
          {activeTab === 'mep' && <MEPModule addItem={addItem} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EarthworksModule({ addItem }: { addItem: any }) {
  // Top Soil
  const [tsArea, setTsArea] = useState(500);
  const [tsDepth, setTsDepth] = useState(0.15);
  const [tsCompaction, setTsCompaction] = useState(1.2); // Shrinkage factor
  const tsNetVol = tsArea * tsDepth;
  const tsLooseVol = tsNetVol * tsCompaction;
  const tsTonnage = tsLooseVol * 1.6; // approx 1.6 t/m3
  const tsBags = Math.ceil(tsTonnage * 1000 / 18.14); // 40lb approx 18.14kg

  // Excavation
  const [excL, setExcL] = useState(10);
  const [excW, setExcW] = useState(10);
  const [excD, setExcD] = useState(1.5);
  const [excBulking, setExcBulking] = useState(1.25);
  const [excConcrete, setExcConcrete] = useState(15);
  
  const pitVol = excL * excW * excD;
  const looseExcVol = pitVol * excBulking;
  const backfillVol = pitVol - excConcrete;
  const looseBackfill = backfillVol * excBulking;

  // Anti-Termite
  const [atArea, setAtArea] = useState(100);
  const [atPerimeter, setAtPerimeter] = useState(40);
  const floorLiters = atArea * 5; // approx 5 L per m2 emulsion
  const perimeterLiters = atPerimeter * 7.5; // approx 7.5 L per linear meter
  const totalEmulsion = floorLiters + perimeterLiters;
  const chemicalConcentrate = totalEmulsion / 20; // 1:19 dilution (1 part chem + 19 water)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Top Soil Calculator">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Area [m²]" value={tsArea} onChange={e => setTsArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Depth [m]" value={tsDepth} onChange={e => setTsDepth(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Compaction Factor" value={tsCompaction} onChange={e => setTsCompaction(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Loose Volume to Order" value={tsLooseVol} unit="m³" />
          <ResultRow label="Top Soil Tonnage" value={tsTonnage} unit="Tons" />
          <ResultRow label="40 lb Bags Count" value={tsBags} unit="Bags" digits={0} />
          <BoqBtn onClick={() => addItem({ name: 'Top Soil', quantity: tsLooseVol, unit: 'm³', rate: 1200, category: 'Earthworks' })} />
        </Card>

        <Card title="Anti-Termite Treatment">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Floor Area [m²]" value={atArea} onChange={e => setAtArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Perimeter Length [m]" value={atPerimeter} onChange={e => setAtPerimeter(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Floor Treatment Emulsion" value={floorLiters} unit="Liters" />
          <ResultRow label="Perimeter Treatment" value={perimeterLiters} unit="Liters" />
          <ResultRow label="Chemical Concentrate (1:19)" value={chemicalConcentrate} unit="Liters" />
          <BoqBtn onClick={() => addItem({ name: 'Anti-Termite Chemical', quantity: chemicalConcentrate, unit: 'Liters', rate: 1500, category: 'Chemicals' })} />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Excavation & Backfill">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Pit Length [m]" value={excL} onChange={e => setExcL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Pit Width [m]" value={excW} onChange={e => setExcW(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Pit Depth [m]" value={excD} onChange={e => setExcD(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Bulking Factor" value={excBulking} onChange={e => setExcBulking(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Embedded Concrete Vol [m³]" value={excConcrete} onChange={e => setExcConcrete(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Foundation Pit Volume" value={pitVol} unit="m³" />
          <ResultRow label="Loose Excavated Vol" value={looseExcVol} unit="m³" />
          <ResultRow label="Net Backfill Volume" value={backfillVol} unit="m³" />
          <ResultRow label="Loose Backfill Req." value={looseBackfill} unit="m³" />
          <BoqBtn onClick={() => {
            addItem({ name: 'Excavation', quantity: pitVol, unit: 'm³', rate: 450, category: 'Earthworks' });
            addItem({ name: 'Backfilling', quantity: looseBackfill, unit: 'm³', rate: 250, category: 'Earthworks' });
          }} />
        </Card>
      </div>
    </div>
  );
}

function InfrastructureModule({ addItem }: { addItem: any }) {
  // Asphalt
  const [roadL, setRoadL] = useState(1000);
  const [roadW, setRoadW] = useState(7);
  const [thBC, setThBC] = useState(0.04);
  const [thDBM, setThDBM] = useState(0.05);
  const [thWMM, setThWMM] = useState(0.25);
  const [thGSB, setThGSB] = useState(0.2);

  const area = roadL * roadW;
  const volBC = area * thBC; const tonBC = volBC * 2.4;
  const volDBM = area * thDBM; const tonDBM = volDBM * 2.4;
  const volWMM = area * thWMM; const tonWMM = volWMM * 2.2;
  const volGSB = area * thGSB; const tonGSB = volGSB * 2.0;

  const primeCoat = area * 0.9; // 0.9 kg/m2
  const tackCoat = area * 0.25; // 0.25 kg/m2

  // Chainage Mass-Haul
  const [chain1, setChain1] = useState(0);
  const [elev1, setElev1] = useState(100);
  const [chain2, setChain2] = useState(100);
  const [elev2, setElev2] = useState(105);
  const [cutArea, setCutArea] = useState(15);
  const [fillArea, setFillArea] = useState(5);

  const dist = Math.abs(chain2 - chain1);
  const grad = dist ? ((elev2 - elev1) / dist) * 100 : 0;
  const cutVol = dist * cutArea; // simple average approximation
  const fillVol = dist * fillArea;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Flexible Asphalt Pavement">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Road Length [m]" value={roadL} onChange={e => setRoadL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Road Width [m]" value={roadW} onChange={e => setRoadW(parseFloat(e.target.value) || 0)} />
            <InputGroup label="BC Thick [m]" value={thBC} onChange={e => setThBC(parseFloat(e.target.value) || 0)} />
            <InputGroup label="DBM Thick [m]" value={thDBM} onChange={e => setThDBM(parseFloat(e.target.value) || 0)} />
            <InputGroup label="WMM Thick [m]" value={thWMM} onChange={e => setThWMM(parseFloat(e.target.value) || 0)} />
            <InputGroup label="GSB Thick [m]" value={thGSB} onChange={e => setThGSB(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="BC (Bituminous Concrete)" value={tonBC} unit="Tons" />
          <ResultRow label="DBM (Dense Bitumen Macadam)" value={tonDBM} unit="Tons" />
          <ResultRow label="WMM (Wet Mix Macadam)" value={tonWMM} unit="Tons" />
          <ResultRow label="GSB (Granular Sub-Base)" value={tonGSB} unit="Tons" />
          <ResultRow label="Prime Coat" value={primeCoat} unit="kg" />
          <ResultRow label="Tack Coat" value={tackCoat} unit="kg" />
          <BoqBtn onClick={() => {
            addItem({ name: 'BC Asphalt', quantity: tonBC, unit: 'Tons', rate: 5000, category: 'Roads' });
            addItem({ name: 'DBM Asphalt', quantity: tonDBM, unit: 'Tons', rate: 4500, category: 'Roads' });
            addItem({ name: 'WMM Base', quantity: tonWMM, unit: 'Tons', rate: 800, category: 'Roads' });
            addItem({ name: 'GSB Base', quantity: tonGSB, unit: 'Tons', rate: 600, category: 'Roads' });
          }} />
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card title="Chainage Gradient & Mass-Haul">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Chainage 1 [m]" value={chain1} onChange={e => setChain1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Elevation 1 [m]" value={elev1} onChange={e => setElev1(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Chainage 2 [m]" value={chain2} onChange={e => setChain2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Elevation 2 [m]" value={elev2} onChange={e => setElev2(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Avg Cut Area [m²]" value={cutArea} onChange={e => setCutArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Avg Fill Area [m²]" value={fillArea} onChange={e => setFillArea(parseFloat(e.target.value) || 0)} />
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
    cost: solSize * 1000 - (i * solUnits * 12 * 0.15) // Example $0.15 per unit, $1000 per kW install
  }));

  // AC
  const [acL, setAcL] = useState(5);
  const [acW, setAcW] = useState(4);
  const [acOccupants, setAcOccupants] = useState(2);
  const [acSun, setAcSun] = useState(1); // 1 normal, 1.1 sunny
  const acArea = acL * acW;
  const btu = (acArea * 337 + acOccupants * 400) * acSun;
  const tonAc = btu / 12000;

  // Solar Water Heater
  const [swhOcc, setSwhOcc] = useState(4);
  const swhLPD = swhOcc * 50; // 50L per person
  const swhArea = swhLPD / 50; // approx 1 m2 per 50L

  // Rainwater
  const [rwArea, setRwArea] = useState(150);
  const [rwRain, setRwRain] = useState(800); // mm/year
  const [rwCoeff, setRwCoeff] = useState(0.85); // roof
  const rwYield = rwArea * rwRain * rwCoeff; // Liters/year
  const rwTank = rwYield * 0.05; // 5% of annual yield for tank sizing

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Solar Rooftop Sizing & ROI">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Monthly Bill Units [kWh]" value={solUnits} onChange={e => setSolUnits(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Peak Sun Hours" value={solHours} onChange={e => setSolHours(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Required System Size" value={solSize} unit="kWp" />
          <ResultRow label="Inverter Capacity" value={invCap} unit="kW" />
          <ResultRow label="Battery Bank (Off-grid)" value={batReq} unit="kWh" />
          
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roiData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} name="Net Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <BoqBtn onClick={() => {
              addItem({ name: 'Solar PV System', quantity: solSize, unit: 'kWp', rate: 1000, category: 'Electrical' });
            }} />
          </div>
        </Card>
        
        <Card title="Solar Water Heater">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <InputGroup label="Occupant Count" value={swhOcc} onChange={e => setSwhOcc(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Daily Hot Water Demand" value={swhLPD} unit="LPD" />
          <ResultRow label="Collector Area Req." value={swhArea} unit="m²" />
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="AC / HVAC Sizing">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Room Length [m]" value={acL} onChange={e => setAcL(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Room Width [m]" value={acW} onChange={e => setAcW(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Occupants" value={acOccupants} onChange={e => setAcOccupants(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Sun Exposure Factor" value={acSun} onChange={e => setAcSun(parseFloat(e.target.value) || 0)} />
          </div>
          <ResultRow label="Cooling Load" value={btu} unit="BTU/hr" />
          <ResultRow label="Required AC Capacity" value={tonAc} unit="Tons" />
          <BoqBtn onClick={() => {
              addItem({ name: 'Air Conditioner Unit', quantity: Math.ceil(tonAc), unit: 'Tons', rate: 600, category: 'HVAC' });
          }} />
        </Card>

        <Card title="Rainwater Harvesting">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputGroup label="Catchment Area [m²]" value={rwArea} onChange={e => setRwArea(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Annual Rainfall [mm]" value={rwRain} onChange={e => setRwRain(parseFloat(e.target.value) || 0)} />
            <InputGroup label="Runoff Coefficient" value={rwCoeff} onChange={e => setRwCoeff(parseFloat(e.target.value) || 0)} />
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

function BoqBtn({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="mt-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
    >
      <Save size={16} /> Add to BOQ
    </button>
  );
}
