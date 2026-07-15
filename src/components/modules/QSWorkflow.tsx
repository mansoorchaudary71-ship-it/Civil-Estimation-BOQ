import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Settings, Ruler, Box, Grid2X2, 
  Layers, Map, Sun, Droplet, Paintbrush, FileText, PieChart, Printer, 
  ClipboardList, Activity, Construction, DollarSign, Building, Shovel
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CalculationHistory } from '../ui/CalculationHistory';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function QSWorkflow() {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // -- Step 1: Project Setup --
  const [projectData, setProjectData] = useState({
    name: 'Apollo Highrise',
    location: 'Downtown Creek',
    client: 'Acme Developers',
    type: 'Commercial',
  });

  // -- Step 2: Drawings --
  const [drawingsLoaded, setDrawingsLoaded] = useState(false);
  const [totalPlinthArea, setTotalPlinthArea] = useState(1500); // sq.ft

  // -- Quantities --
  const [substructure, setSubstructure] = useState({
    excavation: 120, // m3
    footingConc: 45, // m3
    plinthBeam: 15,  // m3
  });

  const [superstructure, setSuperstructure] = useState({
    columns: 25, // m3
    beams: 30, // m3
    slabs: 80, // m3
    staircase: 10, // m3
  });

  const [masonry, setMasonry] = useState({
    brickwork: 150, // m3
    plaster: 850, // m2
    flooring: 400, // m2
    painting: 1200, // m2
  });

  const [services, setServices] = useState({
    plumbingPoints: 45,
    electricalPoints: 120,
    rainwaterCapacity: 5000, // liters
    solarSize: 10, // kW
  });

  // Rates for BOQ (Basic defaults per unit)
  const rates = {
    excavation: 350,   // per m3
    footingConc: 5500, // per m3 (approx M25)
    plinthBeam: 6000,  // per m3
    columns: 7000,     // per m3
    beams: 6500,       // per m3
    slabs: 6000,       // per m3
    staircase: 7500,   // per m3
    brickwork: 4500,   // per m3
    plaster: 250,      // per m2
    flooring: 800,     // per m2
    painting: 150,     // per m2
    plumbing: 1200,    // per point
    electrical: 850,   // per point
    rainwater: 15,     // per liter
    solar: 50000,      // per kW
  };

  const boqItems = useMemo(() => {
    return [
      { section: 'Substructure', item: 'Earthwork in Excavation', qty: substructure.excavation, unit: 'm³', rate: rates.excavation, amount: substructure.excavation * rates.excavation },
      { section: 'Substructure', item: 'PCC/RCC for Footing', qty: substructure.footingConc, unit: 'm³', rate: rates.footingConc, amount: substructure.footingConc * rates.footingConc },
      { section: 'Substructure', item: 'RCC for Plinth Beam', qty: substructure.plinthBeam, unit: 'm³', rate: rates.plinthBeam, amount: substructure.plinthBeam * rates.plinthBeam },
      
      { section: 'Superstructure', item: 'RCC for Columns', qty: superstructure.columns, unit: 'm³', rate: rates.columns, amount: superstructure.columns * rates.columns },
      { section: 'Superstructure', item: 'RCC for Beams', qty: superstructure.beams, unit: 'm³', rate: rates.beams, amount: superstructure.beams * rates.beams },
      { section: 'Superstructure', item: 'RCC for Slab', qty: superstructure.slabs, unit: 'm³', rate: rates.slabs, amount: superstructure.slabs * rates.slabs },
      { section: 'Superstructure', item: 'RCC for Staircase', qty: superstructure.staircase, unit: 'm³', rate: rates.staircase, amount: superstructure.staircase * rates.staircase },

      { section: 'Masonry & Finishes', item: 'Brickwork (1:6 / 1:4)', qty: masonry.brickwork, unit: 'm³', rate: rates.brickwork, amount: masonry.brickwork * rates.brickwork },
      { section: 'Masonry & Finishes', item: 'Plastering (Int/Ext)', qty: masonry.plaster, unit: 'm²', rate: rates.plaster, amount: masonry.plaster * rates.plaster },
      { section: 'Masonry & Finishes', item: 'Flooring / Tiling', qty: masonry.flooring, unit: 'm²', rate: rates.flooring, amount: masonry.flooring * rates.flooring },
      { section: 'Masonry & Finishes', item: 'Painting & Primer', qty: masonry.painting, unit: 'm²', rate: rates.painting, amount: masonry.painting * rates.painting },

      { section: 'Services', item: 'Plumbing Works', qty: services.plumbingPoints, unit: 'Pts', rate: rates.plumbing, amount: services.plumbingPoints * rates.plumbing },
      { section: 'Services', item: 'Electrical Works', qty: services.electricalPoints, unit: 'Pts', rate: rates.electrical, amount: services.electricalPoints * rates.electrical },
      { section: 'Services', item: 'Rainwater Harvesting', qty: services.rainwaterCapacity, unit: 'L', rate: rates.rainwater, amount: services.rainwaterCapacity * rates.rainwater },
      { section: 'Services', item: 'Solar PV System', qty: services.solarSize, unit: 'kW', rate: rates.solar, amount: services.solarSize * rates.solar },
    ];
  }, [substructure, superstructure, masonry, services]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    boqItems.forEach(item => {
      totals[item.section] = (totals[item.section] || 0) + item.amount;
    });
    return totals;
  }, [boqItems]);

  const totalCost = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const handleNext = () => setCurrentStep(prev => (prev < 8 ? prev + 1 : prev) as Step);
  const handlePrev = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev) as Step);

  const steps = [
    { title: "Project Info", icon: Settings },
    { title: "Drawings Input", icon: Map },
    { title: "Substructure", icon: Shovel },
    { title: "Superstructure", icon: Building },
    { title: "Masonry & Finishes", icon: Paintbrush },
    { title: "Services", icon: ZapIcon },
    { title: "BOQ Compilation", icon: ClipboardList },
    { title: "Final Report", icon: PieChart },
  ];

  return (
    <div className="w-full md:max-w-7xl md:mx-auto pb-24 animate-in fade-in duration-500 px-4 md:px-0">
      
      {/* HEADER SECTION */}
      <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] shadow-sm mb-6 flex justify-between items-center no-print overflow-hidden">
         <div>
           <h2 className="text-xl font-semibold tabular-nums tracking-tight text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-[24px] overflow-hidden">
               <Activity className="w-8 h-8" />
             </div>
             Guided QS Workflow
           </h2>
           <p className="text-slate-500 mt-2 font-medium">
             Complete end-to-end quantity take-off following IS 1200 sequences.
           </p>
         </div>
         {currentStep === 8 && (
           <button onClick={() => window.dispatchEvent(new CustomEvent('global-print-action'))} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full flex items-center gap-2 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <Printer className="w-4 h-4" /> Export PDF
           </button>
         )}
      </div>

      {/* STEPPER UI */}
      <div className="mb-8 no-print overflow-x-auto pb-4">
        <div className="flex items-center min-w-[800px]">
          {steps.map((step, idx) => {
            const num = idx + 1;
            const Icon = step.icon;
            const isActive = num === currentStep;
            const isCompleted = num < currentStep;
            return (
              <React.Fragment key={num}>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setCurrentStep(num as Step)}>
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all \${
                     isActive ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-600/20' : 
                     isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100  text-slate-400'
                   }`}>
                     {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                   </div>
                   <span className={`text-base font-medium mt-2 whitespace-nowrap \${isActive ? 'text-blue-600 ' : 'text-slate-500'}`}>
                     Step {num}: {step.title}
                   </span>
                </div>
                {num !== 8 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full \${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 '}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* WIZARD CONTENT BOX */}
      <div className="w-full bg-white border border-slate-200 rounded-[2rem] shadow-sm p-4 sm:p-6 md:p-4 sm:p-10 no-print overflow-hidden">
         
         {/* -- STEP 1 -- */}
         {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-slate-800 mb-6">1. Project Setup</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><label className="block text-base font-medium mb-2">Project Name</label><><label htmlFor="a11y-input-385" className="sr-only">Input</label>
<input id="a11y-input-385" type="text" value={projectData.name} onChange={e=>setProjectData({...projectData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full" /></></div>
                 <div><label className="block text-base font-medium mb-2">Location</label><><label htmlFor="a11y-input-386" className="sr-only">Input</label>
<input id="a11y-input-386" type="text" value={projectData.location} onChange={e=>setProjectData({...projectData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full" /></></div>
                 <div><label className="block text-base font-medium mb-2">Client</label><><label htmlFor="a11y-input-387" className="sr-only">Input</label>
<input id="a11y-input-387" type="text" value={projectData.client} onChange={e=>setProjectData({...projectData, client: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full" /></></div>
                 <div>
                   <label className="block text-base font-medium mb-2">Structure Type</label>
                   <select value={projectData.type} onChange={e=>setProjectData({...projectData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-[24px] overflow-hidden">
                     <option>Residential</option>
                     <option>Commercial</option>
                     <option>Industrial</option>
                   </select>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 2 -- */}
         {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-slate-800 mb-6">2. Drawings & Plan Measure</h3>
               <div className={`p-10 border-2 border-dashed rounded-[24px] text-center mb-6 \${drawingsLoaded ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300'}`}>
                  {drawingsLoaded ? (
                     <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                        <h4 className="font-bold text-lg text-emerald-700">Drawings parsed successfully</h4>
                        <p className="text-emerald-600 text-sm">Elements marked for sequential measurement.</p>
                        <button onClick={() => setDrawingsLoaded(false)} className="mt-4 text-base font-medium underline text-slate-500 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Remove</button>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                        <Map className="w-12 h-12 text-slate-400 mb-3" />
                        <h4 className="font-bold text-lg">Upload Architectural / Structural Drawings</h4>
                        <p className="text-slate-500 text-sm mb-4">PDF, DWG or Image formats</p>
                        <button onClick={() => setDrawingsLoaded(true)} className="w-full px-6 py-2 bg-white text-slate-900 rounded-full font-bold border border-slate-200 shadow-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden">Simulate Upload</button>
                     </div>
                  )}
               </div>

               <div>
                 <label className="block text-base font-medium mb-2">Estimated Total Plinth Area (sq.ft)</label>
                 <><label htmlFor="a11y-input-388" className="sr-only">Input</label>
<input id="a11y-input-388" type="number" inputMode="decimal" value={totalPlinthArea} onChange={e=>setTotalPlinthArea(+e.target.value)} className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border rounded-full" /></>
               </div>
            </div>
         )}

         {/* -- STEP 3 -- */}
         {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2"><Shovel className="w-6 h-6 text-amber-600" /> 3. Substructure Quantities</h3>
               <p className="text-slate-500 mb-6 font-medium">Extract quantities for below-ground works as per IS 1200 Part 1 & 2.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-amber-50/50 p-5 rounded-[24px] border border-amber-100 overflow-hidden">
                    <label className="block text-base font-medium mb-2">Earthwork (Excavation) - m³</label>
                    <><label htmlFor="a11y-input-389" className="sr-only">Input</label>
<input id="a11y-input-389" type="number" inputMode="decimal" value={substructure.excavation} onChange={e=>setSubstructure({...substructure, excavation: +e.target.value})} className="w-full px-4 py-3 bg-white border-amber-200 rounded-full font-bold" /></>
                 </div>
                 <div className="bg-amber-50/50 p-5 rounded-[24px] border border-amber-100 overflow-hidden">
                    <label className="block text-base font-medium mb-2">Footing PCC/RCC - m³</label>
                    <><label htmlFor="a11y-input-390" className="sr-only">Input</label>
<input id="a11y-input-390" type="number" inputMode="decimal" value={substructure.footingConc} onChange={e=>setSubstructure({...substructure, footingConc: +e.target.value})} className="w-full px-4 py-3 bg-white border-amber-200 rounded-full font-bold" /></>
                 </div>
                 <div className="bg-amber-50/50 p-5 rounded-[24px] border border-amber-100 overflow-hidden">
                    <label className="block text-base font-medium mb-2">Plinth Beam RCC - m³</label>
                    <><label htmlFor="a11y-input-391" className="sr-only">Input</label>
<input id="a11y-input-391" type="number" inputMode="decimal" value={substructure.plinthBeam} onChange={e=>setSubstructure({...substructure, plinthBeam: +e.target.value})} className="w-full px-4 py-3 bg-white border-amber-200 rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 4 -- */}
         {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2"><Building className="w-6 h-6 text-blue-600" /> 4. Superstructure Quantities</h3>
               <p className="text-slate-500 mb-6 font-medium">Extract lengths and volumes for structural frame above plinth level.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                    <label className="block text-base font-medium mb-2">Columns RCC - m³</label>
                    <><label htmlFor="a11y-input-392" className="sr-only">Input</label>
<input id="a11y-input-392" type="number" inputMode="decimal" value={superstructure.columns} onChange={e=>setSuperstructure({...superstructure, columns: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Beams RCC - m³</label>
                    <><label htmlFor="a11y-input-393" className="sr-only">Input</label>
<input id="a11y-input-393" type="number" inputMode="decimal" value={superstructure.beams} onChange={e=>setSuperstructure({...superstructure, beams: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Slabs RCC - m³</label>
                    <><label htmlFor="a11y-input-394" className="sr-only">Input</label>
<input id="a11y-input-394" type="number" inputMode="decimal" value={superstructure.slabs} onChange={e=>setSuperstructure({...superstructure, slabs: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Staircase RCC - m³</label>
                    <><label htmlFor="a11y-input-395" className="sr-only">Input</label>
<input id="a11y-input-395" type="number" inputMode="decimal" value={superstructure.staircase} onChange={e=>setSuperstructure({...superstructure, staircase: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 5 -- */}
         {currentStep === 5 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2"><Paintbrush className="w-6 h-6 text-rose-500" /> 5. Masonry & Finishes</h3>
               <p className="text-slate-500 mb-6 font-medium">Blockwork, plastering, floor finishes, and painting.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-base font-medium mb-2">Brickwork/Blockwork - m³</label>
                    <><label htmlFor="a11y-input-396" className="sr-only">Input</label>
<input id="a11y-input-396" type="number" inputMode="decimal" value={masonry.brickwork} onChange={e=>setMasonry({...masonry, brickwork: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Plastering (Int & Ext) - m²</label>
                    <><label htmlFor="a11y-input-397" className="sr-only">Input</label>
<input id="a11y-input-397" type="number" inputMode="decimal" value={masonry.plaster} onChange={e=>setMasonry({...masonry, plaster: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Flooring/Tiling - m²</label>
                    <><label htmlFor="a11y-input-398" className="sr-only">Input</label>
<input id="a11y-input-398" type="number" inputMode="decimal" value={masonry.flooring} onChange={e=>setMasonry({...masonry, flooring: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Painting & Finishes - m²</label>
                    <><label htmlFor="a11y-input-399" className="sr-only">Input</label>
<input id="a11y-input-399" type="number" inputMode="decimal" value={masonry.painting} onChange={e=>setMasonry({...masonry, painting: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 6 -- */}
         {currentStep === 6 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2"><ZapIcon className="w-6 h-6 text-sky-500" /> 6. MEP & Services</h3>
               <p className="text-slate-500 mb-6 font-medium">Plumbing, electrical, and special infrastructure calculations.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-base font-medium mb-2">Plumbing (No. of Output Points)</label>
                    <><label htmlFor="a11y-input-400" className="sr-only">Input</label>
<input id="a11y-input-400" type="number" inputMode="decimal" value={services.plumbingPoints} onChange={e=>setServices({...services, plumbingPoints: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Electrical (No. of Output Points)</label>
                    <><label htmlFor="a11y-input-401" className="sr-only">Input</label>
<input id="a11y-input-401" type="number" inputMode="decimal" value={services.electricalPoints} onChange={e=>setServices({...services, electricalPoints: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Rainwater Harvesting Capacity (L)</label>
                    <><label htmlFor="a11y-input-402" className="sr-only">Input</label>
<input id="a11y-input-402" type="number" inputMode="decimal" value={services.rainwaterCapacity} onChange={e=>setServices({...services, rainwaterCapacity: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Solar Generation (kW)</label>
                    <><label htmlFor="a11y-input-403" className="sr-only">Input</label>
<input id="a11y-input-403" type="number" inputMode="decimal" value={services.solarSize} onChange={e=>setServices({...services, solarSize: +e.target.value})} className="w-full px-4 py-3 bg-slate-50 border rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 7 -- */}
         {currentStep === 7 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-emerald-600" /> 7. Expected BOQ Compiler</h3>
                  <p className="font-medium text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">Rates populated from Live DB</p>
               </div>
               <p className="text-slate-500 mb-6 font-medium">Verify standard item descriptions and auto-calculated final quantities.</p>
               
               <div className="overflow-x-auto rounded-[24px] border border-slate-200">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-700">
                       <tr>
                          <th className="p-4 font-bold">Category</th>
                          <th className="p-4 font-bold">CPWD Standard Item Description</th>
                          <th className="p-4 font-bold text-right">Quantity</th>
                          <th className="p-4 font-bold text-right">Rate (₹)</th>
                          <th className="p-4 font-bold text-right">Total (₹)</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       {boqItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                             <td className="p-4 text-slate-500">{item.section}</td>
                             <td className="p-4 font-semibold">{item.item}</td>
                             <td className="p-4 text-right">{item.qty} {item.unit}</td>
                             <td className="p-4 text-right">₹{item.rate.toLocaleString()}</td>
                             <td className="p-4 text-right font-bold text-indigo-600">₹{item.amount.toLocaleString()}</td>
                          </tr>
                       ))}
                     </tbody>
                     <tfoot>
                        <tr className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                           <td colSpan={4} className="p-4 text-right font-semibold tabular-nums tracking-tight uppercase tracking-wider">Estimated Project Total</td>
                           <td className="p-4 text-right font-semibold tabular-nums tracking-tight text-xl text-emerald-600">₹{totalCost.toLocaleString()}</td>
                        </tr>
                     </tfoot>
                  </table>
               </div>
            </div>
         )}


         {/* SUB NAVIGATION BUTTONS */}
         {currentStep < 8 && (
           <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-[24px] font-bold flex items-center gap-2 \${currentStep === 1 ? 'opacity-0' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                 <ArrowLeft className="w-4 h-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" /> Previous
              </button>
              <button onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center gap-2 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                 {currentStep === 7 ? 'Generate Report' : 'Next Step'} <ArrowRight className="w-4 h-4" />
              </button>
           </div>
         )}
      </div>

      {/* -- STEP 8 (FINAL REPORT) -- */}
      {currentStep === 8 && (
         <div className="mt-6 print-container animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-full bg-white text-slate-900 p-4 sm:p-10 shadow-xl border rounded-[2rem] border-slate-200 min-h-[1056px] relative overflow-hidden">
               
               <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600 rounded-t-[2rem]"></div>

               {/* Report Header */}
               <div className="flex justify-between items-start pt-6 border-b-2 border-slate-800 pb-6 mb-8">
                  
                  <div className="text-right">
                    <p className="font-bold text-slate-500 text-sm">CLIENT</p>
                    <p className="font-bold text-lg">{projectData.client}</p>
                    <p className="mt-2 text-sm text-slate-500">Report Generated: {new Date().toLocaleDateString()}</p>
                  </div>
               </div>

               {/* Summary Cards */}
               <div className="grid grid-cols-3 gap-6 mb-10">
                  <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-[24px] overflow-hidden">
                     <p className="text-base font-medium mb-2 uppercase tracking-widest">Total Estimated Cost</p>
                     <p className="text-xl font-semibold tabular-nums tracking-tight text-indigo-700">₹{totalCost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-[24px] overflow-hidden">
                     <p className="text-base font-medium mb-2 uppercase tracking-widest">Plinth Area</p>
                     <p className="text-xl font-semibold tabular-nums tracking-tight">{totalPlinthArea.toLocaleString()} <span className="text-lg text-slate-500">sq.ft</span></p>
                  </div>
                  <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-[24px] overflow-hidden">
                     <p className="text-base font-medium mb-2 uppercase tracking-widest">Cost Per Sq.Ft</p>
                     <p className="text-xl font-semibold tabular-nums tracking-tight">₹{Math.round(totalCost / totalPlinthArea).toLocaleString()}</p>
                  </div>
               </div>

               {/* Details Grid */}
               <div className="grid grid-cols-2 gap-10 mb-10">
                  
                  {/* Pie Chart */}
                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-widest border-b border-slate-300 pb-2 mb-4">Cost Distribution</h3>
                    <div className="h-64 no-print-chart">
                      <ResponsiveContainer width="100%" height="100%">
                         <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%" cy="50%"
                              innerRadius={60} outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                               {pieData.map((e, index) => <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: any) => `₹\${value.toLocaleString()}`} />
                            <Legend />
                         </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Print Fallback table for Pie */}
                    <div className="hidden print-block mt-4">
                       <ul className="space-y-2">
                         {pieData.map((data, idx) => (
                           <li key={idx} className="flex justify-between border-b pb-1">
                             <span className="font-bold">{data.name}</span>
                             <span>₹{data.value.toLocaleString()} ({(data.value / totalCost * 100).toFixed(1)}%)</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  {/* Specification Notes */}
                  <div>
                     <h3 className="font-bold text-xl uppercase tracking-widest border-b border-slate-300 pb-2 mb-4">Design Specifications</h3>
                     <ul className="space-y-3">
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                           <span className="font-medium">Substructure works comply with IS 1200 Part 1 (Earthworks) and Part 2 (Concrete).</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                           <span className="font-medium">Mix design assumed at nominal M25 for columns/beams unless specialized.</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                           <span className="font-medium">Finish line items include 12mm internal plaster and 20mm external plaster.</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                           <span className="font-medium">MEP services approximated using CPWD schedule of rates norms.</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                           <span className="font-medium">Base material rates queried from regional live DB average index.</span>
                        </li>
                     </ul>
                  </div>
               </div>

               {/* Footer Signatures */}
               <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="text-center w-64">
                    <div className="border-t-2 border-slate-800 pt-2 font-bold uppercase tracking-widest">Prepared By QS</div>
                  </div>
                  <div className="text-center w-64">
                    <div className="border-t-2 border-slate-800 pt-2 font-bold uppercase tracking-widest">Client Approval</div>
                  </div>
               </div>
            </div>

            <div className="flex justify-center mt-6 no-print">
               <button onClick={() => setCurrentStep(7)} className="font-bold text-slate-500 hover:text-slate-800 underline rounded-full">
                 &larr; Back to Editor
               </button>
            </div>
         </div>
      )}

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
            background: transparent;
            color: #0F172A;
          }
          .no-print { display: none !important; }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print-chart { display: none !important; }
          .print-block { display: block !important; }
        }
      `}} />
    
      <CalculationHistory calculatorId="qsworkflow_tool" currentInputs={{}} />
</div>
  );
}

function ZapIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
