import { Button } from '../ui/Button';
import { motion } from "framer-motion";
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Settings, Ruler, Box, Grid2X2, 
  Layers, Map, Sun, Droplet, Paintbrush, FileText, PieChart, Printer, 
  ClipboardList, Activity, Construction, DollarSign, Building, Shovel, Percent
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CalculationHistory } from '../ui/CalculationHistory';
import { useSettings } from '../../context/SettingsContext';
import { useRates } from '../../lib/useRates';
import { useAutoSave } from '../../hooks/useAutoSave';
import { footingConcrete, volumeFromRows } from '../../lib/qsWorkflow';
import { taxLabelForRegion } from '../../lib/boq';
import toast from 'react-hot-toast';


type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export default function QSWorkflow() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const { settings } = useSettings();
  const { rates: pkRates, table: rateTable } = useRates("PK");

  // -- Step 1: Project Setup (fields start empty — no fictional defaults) --
  const [projectData, setProjectData] = useState({
    name: '',
    location: '',
    client: '',
    type: 'Residential',
  });

  // -- Step 2: Drawings --
  const [drawingsLoaded, setDrawingsLoaded] = useState(false);
  const [drawingFileName, setDrawingFileName] = useState("");
  const [totalPlinthArea, setTotalPlinthArea] = useState(1500); // sq.ft
  // Footing dimension helper (Nos x L x W x D) — quantities derived, not typed.
  const [footingDims, setFootingDims] = useState({ nos: 10, length: 1.5, width: 1.5, depth: 0.5 });

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

  // BOQ rates — EXAMPLE defaults, editable in Step 7 (the header copy
  // says so; the old code rendered them as plain text). These are NOT from
  // a live database (the old "Rates populated from Live DB" badge was
  // false). Dated material rates from the CEP rate table are shown
  // alongside: cement Rs {pkRates.cementPerBag}/bag, steel Rs
  // {pkRates.steelPerKg}/kg ({rateTable.lastUpdated}). Concrete line rates
  // below are per-m3 norms.
  // Rainwater Rs 15/litre is an EXAMPLE rate inherited from the legacy
  // "Paint / misc" line — confirm with your vendor.
  const [rates, setRates] = useState({
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
    rainwater: 15,     // per liter (example — see note above)
    solar: 50000,      // per kW
  });

  const boqItems = useMemo(() => {
    return [
      { section: 'Substructure', rateKey: 'excavation', item: 'Earthwork in Excavation', qty: substructure.excavation, unit: 'm³', rate: rates.excavation, amount: substructure.excavation * rates.excavation },
      { section: 'Substructure', rateKey: 'footingConc', item: 'PCC/RCC for Footing', qty: substructure.footingConc, unit: 'm³', rate: rates.footingConc, amount: substructure.footingConc * rates.footingConc },
      { section: 'Substructure', rateKey: 'plinthBeam', item: 'RCC for Plinth Beam', qty: substructure.plinthBeam, unit: 'm³', rate: rates.plinthBeam, amount: substructure.plinthBeam * rates.plinthBeam },
      
      { section: 'Superstructure', rateKey: 'columns', item: 'RCC for Columns', qty: superstructure.columns, unit: 'm³', rate: rates.columns, amount: superstructure.columns * rates.columns },
      { section: 'Superstructure', rateKey: 'beams', item: 'RCC for Beams', qty: superstructure.beams, unit: 'm³', rate: rates.beams, amount: superstructure.beams * rates.beams },
      { section: 'Superstructure', rateKey: 'slabs', item: 'RCC for Slab', qty: superstructure.slabs, unit: 'm³', rate: rates.slabs, amount: superstructure.slabs * rates.slabs },
      { section: 'Superstructure', rateKey: 'staircase', item: 'RCC for Staircase', qty: superstructure.staircase, unit: 'm³', rate: rates.staircase, amount: superstructure.staircase * rates.staircase },

      { section: 'Masonry & Finishes', rateKey: 'brickwork', item: 'Brickwork (1:6 / 1:4)', qty: masonry.brickwork, unit: 'm³', rate: rates.brickwork, amount: masonry.brickwork * rates.brickwork },
      { section: 'Masonry & Finishes', rateKey: 'plaster', item: 'Plastering (Int/Ext)', qty: masonry.plaster, unit: 'm²', rate: rates.plaster, amount: masonry.plaster * rates.plaster },
      { section: 'Masonry & Finishes', rateKey: 'flooring', item: 'Flooring / Tiling', qty: masonry.flooring, unit: 'm²', rate: rates.flooring, amount: masonry.flooring * rates.flooring },
      { section: 'Masonry & Finishes', rateKey: 'painting', item: 'Painting & Primer', qty: masonry.painting, unit: 'm²', rate: rates.painting, amount: masonry.painting * rates.painting },

      { section: 'Services', rateKey: 'plumbing', item: 'Plumbing Works', qty: services.plumbingPoints, unit: 'Pts', rate: rates.plumbing, amount: services.plumbingPoints * rates.plumbing },
      { section: 'Services', rateKey: 'electrical', item: 'Electrical Works', qty: services.electricalPoints, unit: 'Pts', rate: rates.electrical, amount: services.electricalPoints * rates.electrical },
      { section: 'Services', rateKey: 'rainwater', item: 'Rainwater Harvesting', qty: services.rainwaterCapacity, unit: 'L', rate: rates.rainwater, amount: services.rainwaterCapacity * rates.rainwater },
      { section: 'Services', rateKey: 'solar', item: 'Solar PV System', qty: services.solarSize, unit: 'kW', rate: rates.solar, amount: services.solarSize * rates.solar },
    ];
  }, [substructure, superstructure, masonry, services, rates]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    boqItems.forEach(item => {
      totals[item.section] = (totals[item.section] || 0) + item.amount;
    });
    return totals;
  }, [boqItems]);

  const totalCost = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Tax line — same handling as the BOQ Generator (src/lib/boq.ts):
  // taxable = subtotal + contingency (this workflow has no contingency
  // line, so taxable = subtotal); tax = taxable x tax %; grand total =
  // taxable + tax. Region pills switch the label + default % exactly
  // like BOQGenerator (PK Sales Tax 18%, IN GST 18%, AE VAT 5%); the %
  // stays editable afterwards.
  const [taxRegion, setTaxRegion] = useState<"PK" | "IN" | "AE">("PK");
  const [gstPct, setGstPct] = useState(taxLabelForRegion("PK").defaultPct);
  const taxInfo = taxLabelForRegion(taxRegion);
  const taxAmount = Math.round(totalCost * (gstPct / 100) * 100) / 100;
  const grandTotal = Math.round((totalCost + taxAmount) * 100) / 100;

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#F2A413', '#1F1D1A', '#B07006', '#6B6862', '#0F766E'];

  useAutoSave('qs-workflow', { projectData, totalPlinthArea, substructure, superstructure, masonry, services, currentStep, rates, taxRegion, gstPct },
    { projectData: setProjectData, totalPlinthArea: setTotalPlinthArea, substructure: setSubstructure, superstructure: setSuperstructure, masonry: setMasonry, services: setServices, currentStep: (v: Step) => setCurrentStep(v), rates: setRates, taxRegion: setTaxRegion, gstPct: setGstPct });

  const handleNext = () => setCurrentStep(prev => (prev < 8 ? prev + 1 : prev) as Step);
  const handlePrev = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev) as Step);

  const exportBoqCsv = () => {
    const rows = [["Section", "Item", "Qty", "Unit", "Rate", "Amount"]];
    boqItems.forEach((i) => rows.push([i.section, i.item, String(i.qty), i.unit, String(i.rate), String(i.amount)]));
    rows.push(["", "Subtotal", "", "", "", String(totalCost)]);
    rows.push(["", "Taxable Amount", "", "", "", String(totalCost)]);
    rows.push(["", `${taxInfo.label} (${gstPct}%)`, "", "", "", String(taxAmount)]);
    rows.push(["", "Grand Total", "", "", "", String(grandTotal)]);
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qs-workflow-boq.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("BOQ CSV downloaded");
  };
  const copyBoq = () => {
    const tsv = boqItems.map((i) => [i.section, i.item, i.qty, i.unit, i.rate, i.amount].join("\t")).join("\n");
    navigator.clipboard.writeText(tsv).then(() => toast.success("BOQ copied as TSV")).catch(() => toast.error("Copy failed"));
  };

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
      <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 md:p-4 sm:p-8 rounded-2xl shadow-brand-sm mb-6 flex justify-between items-center no-print overflow-hidden">
         <div>
           <h2 className="text-xl font-semibold tabular-nums tracking-tight text-txt-primary tracking-tight flex items-center gap-3">
             <div className="p-3 bg-accent-50 text-accent-800 rounded-2xl overflow-hidden">
               <Activity className="w-8 h-8" />
             </div>
             Guided QS Workflow</h2>
             <p className="text-sm text-txt-tertiary mt-1">Quantity takeoff &amp; BOQ wizard (IS 1200). Quantities come from dimensions; rates are example defaults — edit them in Step 7. Dated material rates: cement Rs {pkRates.cementPerBag ?? "—"}/bag, steel Rs {pkRates.steelPerKg ?? "—"}/kg ({rateTable.lastUpdated}).</p>
           </div>
           <p className="text-txt-tertiary mt-2 font-medium">
             Complete end-to-end quantity take-off following IS 1200 sequences.
           </p>
         </div>
         {currentStep === 8 && (
           <Button onClick={() => window.dispatchEvent(new CustomEvent('global-print-action'))} className="px-5 py-2.5 bg-ink hover:bg-ink-700 text-white font-bold rounded-full flex items-center gap-2 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
              <Printer className="w-4 h-4" /> Export PDF
           </Button>
         )}

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
                     isActive ? 'bg-ink text-white shadow-brand-lg ring-4 ring-accent-500/20' : 
                     isCompleted ? 'bg-ui-successText text-white' : 'bg-surface-hover  text-txt-tertiary'
                   }`}>
                     {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                   </div>
                   <span className={`text-base font-medium mt-2 whitespace-nowrap \${isActive ? 'text-accent-800 ' : 'text-txt-tertiary'}`}>
                     Step {num}: {step.title}
                   </span>
                </div>
                {num !== 8 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full \${isCompleted ? 'bg-ui-successText' : 'bg-surface-active '}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* WIZARD CONTENT BOX */}
      <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm p-4 sm:p-6 md:p-4 sm:p-10 no-print overflow-hidden">
         
         {/* -- STEP 1 -- */}
         {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-txt-primary mb-6">1. Project Setup</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 responsive-tool-grid">
                 <div><label className="block text-base font-medium mb-2">Project Name</label><><label htmlFor="a11y-input-385" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-385" type="text" value={projectData.name} onChange={e=>setProjectData({...projectData, name: e.target.value})} className="w-full px-4 py-3 bg-surface-hover border rounded-full" /></></div>
                 <div><label className="block text-base font-medium mb-2">Location</label><><label htmlFor="a11y-input-386" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-386" type="text" value={projectData.location} onChange={e=>setProjectData({...projectData, location: e.target.value})} className="w-full px-4 py-3 bg-surface-hover border rounded-full" /></></div>
                 <div><label className="block text-base font-medium mb-2">Client</label><><label htmlFor="a11y-input-387" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-387" type="text" value={projectData.client} onChange={e=>setProjectData({...projectData, client: e.target.value})} className="w-full px-4 py-3 bg-surface-hover border rounded-full" /></></div>
                 <div>
                   <label className="block text-base font-medium mb-2">Structure Type</label>
                   <motion.select initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} value={projectData.type} onChange={e=>setProjectData({...projectData, type: e.target.value})} className="w-full px-4 py-3 bg-surface-hover border rounded-2xl overflow-hidden">
                     <option>Residential</option>
                     <option>Commercial</option>
                     <option>Industrial</option>
                   </motion.select>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 2 -- */}
         {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-txt-primary mb-6">2. Drawings & Plan Measure</h3>
               <div className={`p-10 border-2 border-dashed rounded-2xl text-center mb-6 \${drawingsLoaded ? 'border-ui-successText bg-ui-success/50' : 'border-ui-borderDefault'}`}>
                  {drawingsLoaded ? (
                     <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-ui-successText mb-3" />
                        <h4 className="font-bold text-lg text-ui-successText">Drawing attached: {drawingFileName || "file"}</h4>
                        <p className="text-ui-successText text-sm">Reference only — measure quantities from the drawing in Steps 3–6.</p>
                        <Button onClick={() => setDrawingsLoaded(false)} className="mt-4 text-base font-medium underline text-txt-tertiary rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Remove</Button>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                        <Map className="w-12 h-12 text-txt-tertiary mb-3" />
                        <h4 className="font-bold text-lg">Upload Architectural / Structural Drawings</h4>
                        <p className="text-txt-tertiary text-sm mb-4">PDF, DWG or Image formats</p>
                        <label className="w-full px-6 py-2 bg-surface-default text-txt-primary rounded-full font-bold border border-ui-borderSubtle shadow-brand-sm cursor-pointer inline-block text-center">
                          Attach drawing file
                          <input type="file" accept=".pdf,.dwg,.png,.jpg,.jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDrawingFileName(f.name); setDrawingsLoaded(true); } }} />
                        </label>
                        <p className="text-xs text-txt-tertiary mt-2">Reference drawing attached — quantities are still entered manually from it. Nothing is parsed automatically.</p>
                     </div>
                  )}
               </div>

               <div>
                 <label className="block text-base font-medium mb-2">Estimated Total Plinth Area (sq.ft)</label>
                 {(!isFinite(totalPlinthArea) || totalPlinthArea <= 0) && <p className="text-sm font-semibold text-red-600 mb-2">Plinth area must be greater than 0.</p>}
                 <><label htmlFor="a11y-input-388" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-388" type="number" inputMode="decimal" value={totalPlinthArea} onChange={e=>setTotalPlinthArea(Math.max(0, +e.target.value))} className="w-full md:w-1/2 px-4 py-3 bg-surface-hover border rounded-full" /></>
               </div>
            </div>
         )}

         {/* -- STEP 3 -- */}
         {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-txt-primary mb-4 flex items-center gap-2"><Shovel className="w-6 h-6 text-accent-800" /> 3. Substructure Quantities</h3>
               <p className="text-txt-tertiary mb-6 font-medium">Extract quantities for below-ground works as per IS 1200 Part 1 & 2.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-accent-50/50 p-5 rounded-2xl border border-accent-100 overflow-hidden">
                    <label className="block text-base font-medium mb-2">Earthwork (Excavation) - m³</label>
                    <><label htmlFor="a11y-input-389" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-389" type="number" inputMode="decimal" value={substructure.excavation} onChange={e=>setSubstructure({...substructure, excavation: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-default border-accent-200 rounded-full font-bold" /></>
                 </div>
                 <div className="bg-accent-50/50 p-5 rounded-2xl border border-accent-100 overflow-hidden">
                    <label className="block text-base font-medium mb-2">Footing PCC/RCC - m³</label>
                    <><label htmlFor="a11y-input-390" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-390" type="number" inputMode="decimal" value={substructure.footingConc} onChange={e=>setSubstructure({...substructure, footingConc: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-default border-accent-200 rounded-full font-bold" /></>
                 </div>
                 <div className="bg-accent-50/50 p-5 rounded-2xl border border-accent-100 overflow-hidden">
                    <label className="block text-base font-medium mb-2">Plinth Beam RCC - m³</label>

                    <><label htmlFor="a11y-input-391" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-391" type="number" inputMode="decimal" value={substructure.plinthBeam} onChange={e=>setSubstructure({...substructure, plinthBeam: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-default border-accent-200 rounded-full font-bold" /></>
                 </div>
               </div>
               <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 mt-6">
                 <p className="font-bold mb-2">Footing dimensions → concrete (Nos × L × W × D, metres)</p>
                 <div className="flex flex-wrap gap-3 items-end">
                   {(["nos", "length", "width", "depth"] as const).map((k) => (
                     <label key={k} className="text-sm font-medium">{k}
                       <input type="number" min={0} step="any" value={footingDims[k]} onChange={(e) => setFootingDims({ ...footingDims, [k]: Math.max(0, +e.target.value) })} className="ml-2 w-24 px-3 py-2 border rounded-full font-bold" />
                     </label>
                   ))}
                   <Button onClick={() => {
                     const vol = volumeFromRows([{ nos: footingDims.nos, length: footingDims.length, width: footingDims.width, depth: footingDims.depth }]);
                     const fc = footingConcrete(vol);
                     setSubstructure({ ...substructure, footingConc: Math.round(vol * 100) / 100 });
                     toast.success(`Footing concrete ${vol.toFixed(2)} m³ wet → dry ${fc.dry} m³ → ${fc.cementBags} bags cement (1:2:4)`);
                   }} className="px-4 py-2 rounded-full bg-ink text-white text-sm font-bold">Apply dimensions to footing concrete</Button>
                 </div>
                 <p className="text-xs text-txt-tertiary mt-2">V = Nos × L × W × D = {footingDims.nos} × {footingDims.length} × {footingDims.width} × {footingDims.depth} m. Dry volume ×1.54; cement bags = ⌈dry/7/0.0347⌉.</p>
               </div>
            </div>
         )}

         {/* -- STEP 4 -- */}
         {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-txt-primary mb-4 flex items-center gap-2"><Building className="w-6 h-6 text-accent-800" /> 4. Superstructure Quantities</h3>
               <p className="text-txt-tertiary mb-6 font-medium">Extract lengths and volumes for structural frame above plinth level.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 responsive-tool-grid">
                 <div>
                    <label className="block text-base font-medium mb-2">Columns RCC - m³</label>
                    <><label htmlFor="a11y-input-392" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-392" type="number" inputMode="decimal" value={superstructure.columns} onChange={e=>setSuperstructure({...superstructure, columns: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Beams RCC - m³</label>
                    <><label htmlFor="a11y-input-393" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-393" type="number" inputMode="decimal" value={superstructure.beams} onChange={e=>setSuperstructure({...superstructure, beams: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Slabs RCC - m³</label>
                    <><label htmlFor="a11y-input-394" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-394" type="number" inputMode="decimal" value={superstructure.slabs} onChange={e=>setSuperstructure({...superstructure, slabs: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Staircase RCC - m³</label>
                    <><label htmlFor="a11y-input-395" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-395" type="number" inputMode="decimal" value={superstructure.staircase} onChange={e=>setSuperstructure({...superstructure, staircase: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 5 -- */}
         {currentStep === 5 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-txt-primary mb-4 flex items-center gap-2"><Paintbrush className="w-6 h-6 text-ui-errorText" /> 5. Masonry & Finishes</h3>
               <p className="text-txt-tertiary mb-6 font-medium">Blockwork, plastering, floor finishes, and painting.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 responsive-tool-grid">
                 <div>
                    <label className="block text-base font-medium mb-2">Brickwork/Blockwork - m³</label>
                    <><label htmlFor="a11y-input-396" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-396" type="number" inputMode="decimal" value={masonry.brickwork} onChange={e=>setMasonry({...masonry, brickwork: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Plastering (Int & Ext) - m²</label>
                    <><label htmlFor="a11y-input-397" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-397" type="number" inputMode="decimal" value={masonry.plaster} onChange={e=>setMasonry({...masonry, plaster: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Flooring/Tiling - m²</label>
                    <><label htmlFor="a11y-input-398" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-398" type="number" inputMode="decimal" value={masonry.flooring} onChange={e=>setMasonry({...masonry, flooring: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Painting & Finishes - m²</label>
                    <><label htmlFor="a11y-input-399" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-399" type="number" inputMode="decimal" value={masonry.painting} onChange={e=>setMasonry({...masonry, painting: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 6 -- */}
         {currentStep === 6 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-semibold text-txt-primary mb-4 flex items-center gap-2"><ZapIcon className="w-6 h-6 text-accent-700" /> 6. MEP & Services</h3>
               <p className="text-txt-tertiary mb-6 font-medium">Plumbing, electrical, and special infrastructure calculations.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 responsive-tool-grid">
                 <div>
                    <label className="block text-base font-medium mb-2">Plumbing (No. of Output Points)</label>
                    <><label htmlFor="a11y-input-400" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-400" type="number" inputMode="decimal" value={services.plumbingPoints} onChange={e=>setServices({...services, plumbingPoints: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Electrical (No. of Output Points)</label>
                    <><label htmlFor="a11y-input-401" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-401" type="number" inputMode="decimal" value={services.electricalPoints} onChange={e=>setServices({...services, electricalPoints: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Rainwater Harvesting Capacity (L)</label>
                    <><label htmlFor="a11y-input-402" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-402" type="number" inputMode="decimal" value={services.rainwaterCapacity} onChange={e=>setServices({...services, rainwaterCapacity: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
                 <div>
                    <label className="block text-base font-medium mb-2">Solar Generation (kW)</label>
                    <><label htmlFor="a11y-input-403" className="sr-only">Input</label>
<motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} id="a11y-input-403" type="number" inputMode="decimal" value={services.solarSize} onChange={e=>setServices({...services, solarSize: Math.max(0, +e.target.value)})} className="w-full px-4 py-3 bg-surface-hover border rounded-full font-bold" /></>
                 </div>
               </div>
            </div>
         )}

         {/* -- STEP 7 -- */}
         {currentStep === 7 && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-txt-primary flex items-center gap-2"><ClipboardList className="w-6 h-6 text-ui-successText" /> 7. Expected BOQ Compiler</h3>
                  <p className="font-medium text-accent-800 bg-accent-50 px-4 py-1.5 rounded-full">Example rates — edit per your market (not a live database)</p>
               </div>
               <p className="text-txt-tertiary mb-6 font-medium">Verify standard item descriptions and auto-calculated final quantities.</p>
               
               <div className="overflow-x-auto rounded-2xl border border-ui-borderSubtle">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-surface-hover text-txt-secondary">
                       <tr>
                          <th className="p-4 font-bold">Category</th>
                          <th className="p-4 font-bold">CPWD Standard Item Description</th>
                          <th className="p-4 font-bold text-right">Quantity</th>
                          <th className="p-4 font-bold text-right">Rate ({settings.currency})</th>
                          <th className="p-4 font-bold text-right">Total ({settings.currency})</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border-color">
                       {boqItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                             <td className="p-4 text-txt-tertiary">{item.section}</td>
                             <td className="p-4 font-semibold">{item.item}</td>
                             <td className="p-4 text-right">{item.qty} {item.unit}</td>
                             <td className="p-4 text-right"><span className="text-txt-tertiary text-xs mr-1">{settings.currency}</span><input type="number" inputMode="decimal" min={0} value={item.rate} onChange={(e) => setRates((r) => ({ ...r, [item.rateKey]: Math.max(0, +e.target.value || 0) }))} className="w-28 border rounded-lg py-1.5 px-2 text-right" title="Rate — edit per your market" /></td>
                             <td className="p-4 text-right font-bold text-accent-800">{settings.currency} {item.amount.toLocaleString()}</td>
                          </tr>
                       ))}
                     </tbody>
                     <tfoot>
                        <tr className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                           <td colSpan={4} className="p-4 text-right font-semibold tabular-nums tracking-tight uppercase tracking-wider">Subtotal</td>
                           <td className="p-4 text-right font-semibold tabular-nums tracking-tight text-xl">{settings.currency} {totalCost.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-surface-hover text-txt-primary">
                           <td colSpan={4} className="p-4 text-right font-medium text-txt-tertiary">Taxable Amount <span className="text-xs">(no contingency line in this workflow)</span></td>
                           <td className="p-4 text-right font-bold tabular-nums">{settings.currency} {totalCost.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-surface-hover text-txt-primary">
                           <td colSpan={4} className="p-4 text-right">
                              <span className="inline-flex flex-wrap items-center justify-end gap-2">
                                <span className="font-medium text-txt-tertiary flex items-center gap-1">{taxInfo.label} <Percent className="w-3 h-3" /></span>
                                <span className="inline-flex gap-1">
                                  {(["PK", "IN", "AE"] as const).map((r) => (
                                    <button key={r} type="button" onClick={() => { setTaxRegion(r); setGstPct(taxLabelForRegion(r).defaultPct); }} className={`px-2.5 py-1 rounded-full text-xs font-bold ${taxRegion === r ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>{r}</button>
                                  ))}
                                </span>
                                <input type="number" inputMode="decimal" min={0} step="any" value={gstPct === 0 ? "" : gstPct} onChange={(e) => { const v = parseFloat(e.target.value); setGstPct(!isNaN(v) ? Math.max(0, v) : 0); }} className="w-16 px-2 py-1 bg-surface-default border border-ui-borderSubtle rounded-full text-right text-sm font-bold" title="Tax % — edit per your contract" />
                                <span className="font-bold">%</span>
                              </span>
                              <span className="block text-xs font-normal text-txt-tertiary mt-1">Tax = Taxable Amount × Tax % — {taxInfo.note}</span>
                           </td>
                           <td className="p-4 text-right font-bold tabular-nums text-ui-errorText">+{settings.currency} {taxAmount.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                           <td colSpan={4} className="p-4 text-right font-semibold tabular-nums tracking-tight uppercase tracking-wider">Grand Total</td>
                           <td className="p-4 text-right font-semibold tabular-nums tracking-tight text-xl text-ui-successText">{settings.currency} {grandTotal.toLocaleString()}</td>
                        </tr>
                     </tfoot>
                  </table>
               </div>
               <div className="flex flex-wrap gap-3 mt-4">
                 <Button onClick={exportBoqCsv} className="px-4 py-2 rounded-full bg-ink text-white text-sm font-bold">Download CSV</Button>
                 <Button onClick={copyBoq} className="px-4 py-2 rounded-full bg-surface-hover text-sm font-bold">Copy BOQ (TSV)</Button>
               </div>
               <p className="text-xs text-txt-tertiary mt-2">Quantities are derived from the dimensions you entered; the pie in Step 8 sums the same category totals — no double-counting. Rainwater harvesting at Rs 15/litre is an example rate carried over from the legacy template — confirm with your vendor.</p>
            </div>
         )}


         {/* SUB NAVIGATION BUTTONS */}
         {currentStep < 8 && (
           <div className="mt-8 pt-6 border-t border-ui-borderSubtle flex justify-between">
              <Button 
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 \${currentStep === 1 ? 'opacity-0' : 'bg-surface-hover hover:bg-surface-active'}`}
              >
                 <ArrowLeft className="w-4 h-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm" /> Previous
              </Button>
              <Button onClick={handleNext}
                className="px-6 py-3 bg-ink hover:bg-ink-700 text-white rounded-full font-bold flex items-center gap-2 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
              >
                 {currentStep === 7 ? 'Generate Report' : 'Next Step'} <ArrowRight className="w-4 h-4" />
              </Button>
           </div>
         )}
      </div>

      {/* -- STEP 8 (FINAL REPORT) -- */}
      {currentStep === 8 && (
         <div className="mt-6 print-container animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-full bg-surface-default text-txt-primary p-4 sm:p-10 shadow-xl border rounded-2xl border-ui-borderSubtle min-h-[1056px] relative overflow-hidden">
               
               <div className="absolute top-0 left-0 w-full h-4 bg-ink rounded-t-[2rem]"></div>

               {/* Report Header */}
               <div className="flex justify-between items-start pt-6 border-b-2 border-ink pb-6 mb-8">
                  
                  <div className="text-right">
                    <p className="font-bold text-txt-tertiary text-sm">CLIENT</p>
                    <p className="font-bold text-lg">{projectData.client}</p>
                    <p className="mt-2 text-sm text-txt-tertiary">Report Generated: {new Date().toLocaleDateString()}</p>
                  </div>
               </div>

               {/* Summary Cards */}
               <div className="grid grid-cols-3 gap-6 mb-10">
                  <div className="p-4 sm:p-6 bg-surface-hover border border-ui-borderSubtle rounded-2xl overflow-hidden">
                     <p className="text-base font-medium mb-2 uppercase tracking-widest">Total Estimated Cost</p>
                     <p className="text-xl font-semibold tabular-nums tracking-tight text-accent-800">{settings.currency} {grandTotal.toLocaleString()}</p>
                     <p className="text-xs text-txt-tertiary mt-1">Subtotal {settings.currency} {totalCost.toLocaleString()} + {taxInfo.label} {gstPct}% ({settings.currency} {taxAmount.toLocaleString()})</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-surface-hover border border-ui-borderSubtle rounded-2xl overflow-hidden">
                     <p className="text-base font-medium mb-2 uppercase tracking-widest">Plinth Area</p>
                     <p className="text-xl font-semibold tabular-nums tracking-tight">{totalPlinthArea.toLocaleString()} <span className="text-lg text-txt-tertiary">sq.ft</span></p>
                  </div>
                  <div className="p-4 sm:p-6 bg-surface-hover border border-ui-borderSubtle rounded-2xl overflow-hidden">
                     <p className="text-base font-medium mb-2 uppercase tracking-widest">Cost Per Sq.Ft</p>
                     <p className="text-xl font-semibold tabular-nums tracking-tight">{settings.currency} {totalPlinthArea > 0 ? Math.round(grandTotal / totalPlinthArea).toLocaleString() : "—"}</p>
                  </div>
               </div>

               {/* Details Grid */}
               <div className="grid grid-cols-2 gap-10 mb-10">
                  
                  {/* Pie Chart */}
                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-widest border-b border-ui-borderDefault pb-2 mb-4">Cost Distribution</h3>
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
                            <Tooltip formatter={(value: any) => `${settings.currency} ${value.toLocaleString()}`} />
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
                             <span>{settings.currency} {data.value.toLocaleString()} ({totalCost > 0 ? (data.value / totalCost * 100).toFixed(1) : "0.0"}%)</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>

                  {/* Specification Notes */}
                  <div>
                     <h3 className="font-bold text-xl uppercase tracking-widest border-b border-ui-borderDefault pb-2 mb-4">Design Specifications</h3>
                     <ul className="space-y-3">
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-accent-800 shrink-0" />
                           <span className="font-medium">Substructure works comply with IS 1200 Part 1 (Earthworks) and Part 2 (Concrete).</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-accent-800 shrink-0" />
                           <span className="font-medium">Mix design assumed at nominal M25 for columns/beams unless specialized.</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-accent-800 shrink-0" />
                           <span className="font-medium">Finish line items include 12mm internal plaster and 20mm external plaster.</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-accent-800 shrink-0" />
                           <span className="font-medium">MEP services approximated using CPWD schedule of rates norms.</span>
                        </li>
                        <li className="flex gap-2">
                           <CheckCircle className="w-5 h-5 text-accent-800 shrink-0" />
                           <span className="font-medium">Material rates from the dated CEP rate table ({rateTable.lastUpdated}); BOQ line rates are editable example defaults.</span>
                        </li>
                     </ul>
                  </div>
               </div>

               {/* Footer Signatures */}
               <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                  <div className="text-center w-64">
                    <div className="border-t-2 border-ink pt-2 font-bold uppercase tracking-widest">Prepared By QS</div>
                  </div>
                  <div className="text-center w-64">
                    <div className="border-t-2 border-ink pt-2 font-bold uppercase tracking-widest">Client Approval</div>
                  </div>
               </div>
            </div>

            <div className="flex justify-center mt-6 no-print">
               <Button onClick={() => setCurrentStep(7)} className="font-bold text-txt-tertiary hover:text-txt-primary underline rounded-full">
                 &larr; Back to Editor
               </Button>
            </div>
         </div>
      )}

      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
            background: transparent;
            color: #1F1D1A;
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
    
      <CalculationHistory calculatorId="qsworkflow_tool" currentInputs={{ projectData, totalPlinthArea, substructure, superstructure, masonry, services, taxRegion, gstPct }} currentResults={{ totalCost, taxAmount, grandTotal }} />
</div>
  );
}

function ZapIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
