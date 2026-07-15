import React, { useState, useMemo } from "react";
import { Download, Save, Printer, Plus, Trash2, FileSpreadsheet, Building, Calculator, ChevronRight, FileText, Settings2, DollarSign } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useMarketRates } from "../../context/MarketRatesContext";
import { generateBOQExcel, generateBOQPDF } from "../../utils/boq-reports";
import { CalculationHistory } from '../ui/CalculationHistory';
import D3PieChart from '../ui/D3PieChart';

type TradeScope = "Excavation" | "PCC" | "RCC" | "Masonry" | "Plaster" | "Tiles" | "Paint" | "Steel";

type MeasurementRow = {
  id: string;
  description: string;
  nos: number;
  length: number;
  width: number;
  depth: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
};

const QUICK_TEMPLATES = [
  { label: "1:2:4 RCC Concrete", scope: "RCC" as TradeScope, description: "1:2:4 RCC Concrete", length: 1, width: 1, depth: 1 },
  { label: "Grade 60 Steel Rebar", scope: "Steel" as TradeScope, description: "Grade 60 Steel Rebar", length: 1, width: 1, depth: 1 },
  { label: "A-Class Bricks (9\")", scope: "Masonry" as TradeScope, description: "9\" A-class brickwork", length: 1, width: 1, depth: 1 },
  { label: "1:4 Cement Sand Plaster", scope: "Plaster" as TradeScope, description: "1:4 internal plaster 12mm", length: 1, width: 1, depth: 0 },
  { label: "River Sand Filling", scope: "Excavation" as TradeScope, description: "River sand filling in plinth", length: 1, width: 1, depth: 1 },
  { label: "OPC Cement (PCC 1:4:8)", scope: "PCC" as TradeScope, description: "PCC 1:4:8 base", length: 1, width: 1, depth: 1 }
];

const TRADE_UNITS: Record<TradeScope, string> = {
  Excavation: "cu.m",
  PCC: "cu.m",
  RCC: "cu.m",
  Masonry: "sq.m",
  Plaster: "sq.m",
  Tiles: "sq.m",
  Paint: "sq.m",
  Steel: "kg"
};

const TRADE_RATES_MAP: Record<TradeScope, keyof ReturnType<typeof useMarketRates>['rates']> = {
  Excavation: "laborGrey", // mapping for typescript
  PCC: "cement", // approximate mapping
  RCC: "cement",
  Masonry: "bricks",
  Plaster: "cement",
  Tiles: "tiles",
  Paint: "paint",
  Steel: "steel"
};


export default function AdvancedBoqGenerator() {
  const { settings, formatCurrency } = useSettings();
  const { rates } = useMarketRates();
  
  const [step, setStep] = useState<number>(1);
  
  // Step 1: Detail
  const [projectData, setProjectData] = useState({
    name: "New Residential Project",
    client: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    engineer: "",
    plotSize: "",
    coveredArea: "",
    floors: "1"
  });
  
  const [scopes, setScopes] = useState<TradeScope[]>(["Excavation", "PCC"]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const toggleScope = (scope: TradeScope) => {
    setScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
  };
  
  // Step 2 & 3: Measurements
  const [measurements, setMeasurements] = useState<Record<TradeScope, MeasurementRow[]>>({
    Excavation: [], PCC: [], RCC: [], Masonry: [], Plaster: [], Tiles: [], Paint: [], Steel: []
  });

  // Markups
  const [markups, setMarkups] = useState({
    contingency: 5,
    profit: 10,
    overhead: 5
  });

  const getAutoRate = (scope: TradeScope) => {
    const key = TRADE_RATES_MAP[scope];
    return (rates as any)[key] || 0;
  };

  const addRow = (scope: TradeScope) => {
    const newRow: MeasurementRow = {
      id: Math.random().toString(36).substr(2, 9),
      description: "",
      nos: 1, length: 0, width: 0, depth: 0, quantity: 0,
      unit: TRADE_UNITS[scope],
      rate: getAutoRate(scope),
      amount: 0
    };
    setMeasurements(prev => ({ ...prev, [scope]: [...prev[scope], newRow] }));
  };

  const addQuickTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    const newRow: MeasurementRow = {
      id: Math.random().toString(36).substr(2, 9),
      description: template.description,
      nos: 1, length: template.length, width: template.width, depth: template.depth, quantity: 0,
      unit: TRADE_UNITS[template.scope],
      rate: getAutoRate(template.scope),
      amount: 0
    };
    setMeasurements(prev => ({ ...prev, [template.scope]: [...prev[template.scope], newRow] }));
    if (!scopes.includes(template.scope)) {
      setScopes(prev => [...prev, template.scope]);
    }
  };

  const updateRow = (scope: TradeScope, id: string, field: keyof MeasurementRow, value: any) => {
    setMeasurements(prev => {
      const scopeRows = prev[scope].map(row => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          // Auto calculate logic
          if (["nos", "length", "width", "depth"].includes(field)) {
            // Simplified calculation mapping: n * L * W * D. If 0, assume 1 except NOS.
            const l = updated.length || 1;
            const w = updated.width || 1;
            const d = updated.depth || 1; // Sometimes depth is not used, so if it's 0 we should ignore it rather than multiply by 0
            
            // To be accurate: 
            let qty = Number(updated.nos) || 0;
            if (updated.length) qty *= Number(updated.length);
            if (updated.width) qty *= Number(updated.width);
            if (updated.depth) qty *= Number(updated.depth);
            
            updated.quantity = qty;
          }
          updated.amount = updated.quantity * updated.rate;
          return updated;
        }
        return row;
      });
      return { ...prev, [scope]: scopeRows };
    });
  };

  const deleteRow = (scope: TradeScope, id: string) => {
    setMeasurements(prev => ({
      ...prev,
      [scope]: prev[scope].filter(r => r.id !== id)
    }));
  };

  // Calculations
  const subtotals = useMemo(() => {
    const subs: Record<TradeScope, number> = {} as any;
    scopes.forEach(scope => {
      subs[scope] = measurements[scope].reduce((sum, row) => sum + row.amount, 0);
    });
    return subs;
  }, [measurements, scopes]);

  const baseSubtotal = useMemo(() => {
    return Object.values(subtotals).reduce((sum, val) => sum + (val || 0), 0);
  }, [subtotals]);

  const contingencyAmt = (baseSubtotal * markups.contingency) / 100;
  const overheadAmt = (baseSubtotal * markups.overhead) / 100;
  const profitAmt = (baseSubtotal * markups.profit) / 100;

  const grandTotal = baseSubtotal + contingencyAmt + overheadAmt + profitAmt;

  const costBreakdownData = useMemo(() => {
    let laborTotal = 0;
    let materialTotal = 0;

    scopes.forEach(scope => {
      const amt = subtotals[scope] || 0;
      // In this basic auto-generator, Excavation is considered Labor, the rest as Material
      if (scope === 'Excavation') {
        laborTotal += amt;
      } else {
        materialTotal += amt;
      }
    });

    return [
      { name: 'Material Costs', value: materialTotal },
      { name: 'Labor Costs', value: laborTotal }
    ].filter(d => d.value > 0);
  }, [subtotals, scopes]);
  const CHART_COLORS = ['#8b5cf6', '#10b981']; // purple for material, emerald for labor

  // Exports
  const handleExportPDF = () => {
    const allItems: any[] = [];
    scopes.forEach(scope => {
      measurements[scope].forEach(row => {
        allItems.push({
          id: row.id,
          division: scope,
          description: row.description,
          unit: row.unit,
          quantity: row.quantity,
          rate: row.rate
        });
      });
    });
    generateBOQPDF(allItems, projectData.name || "Project", baseSubtotal, contingencyAmt, profitAmt, overheadAmt, grandTotal, settings.currency);
  };

  const handleExportExcel = () => {
     const allItems: any[] = [];
    scopes.forEach(scope => {
      measurements[scope].forEach(row => {
        allItems.push({
          id: row.id,
          division: scope,
          description: row.description,
          unit: row.unit,
          quantity: row.quantity,
          rate: row.rate
        });
      });
    });
    generateBOQExcel(allItems, projectData.name || "Project", baseSubtotal, contingencyAmt, profitAmt, overheadAmt, grandTotal, settings.currency);
  };

  const StepIndicator = ({ num, title }: { num: number, title: string }) => (
    <div className={`flex items-center gap-2 ${step === num ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === num ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-200  text-slate-500'}`}>
        {num}
      </div>
      <span className={`font-semibold hidden md:block ${step === num ? 'text-slate-800  ' : 'text-slate-500'}`}>{title}</span>
    </div>
  );

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6 px-4 md:px-0">
      <div className="w-full bg-white p-4 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 tracking-tight mb-4">
            <Building className="w-7 h-7 text-purple-600" />
            Professional BOQ Auto-Generator
          </h2>
          <p className="mt-2 text-base font-normal text-slate-600 leading-relaxed">Comprehensive 4-step wizard to generate highly accurate construction BOQs.</p>
        </div>
        
        {/* Stepper Navigation */}
        <div className="flex items-center gap-2 md:gap-4 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-2 rounded-[24px] border border-slate-100 overflow-hidden flex-wrap">
          <StepIndicator num={1} title="Setup" />
          <div className="w-4 md:w-8 h-[2px] bg-slate-200"></div>
          <StepIndicator num={2} title="Measure" />
          <div className="w-4 md:w-8 h-[2px] bg-slate-200"></div>
          <StepIndicator num={3} title="Rates" />
          <div className="w-4 md:w-8 h-[2px] bg-slate-200"></div>
          <StepIndicator num={4} title="Output" />
        </div>
      </div>

      <div className="w-full bg-white p-4 sm:p-6 md:p-4 sm:p-8 rounded-[24px] border border-slate-200 shadow-sm print:shadow-none print:border-none overflow-hidden">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-purple-900 border-b border-purple-100 pb-2 text-lg font-medium text-slate-800 mb-4">Project Information</h3>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">Project Name</label>
                  <><label htmlFor="a11y-input-16" className="sr-only">Input</label>
<input id="a11y-input-16" type="text" value={projectData.name} onChange={e => setProjectData({...projectData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">Client Name</label>
                    <><label htmlFor="a11y-input-17" className="sr-only">Input</label>
<input id="a11y-input-17" type="text" value={projectData.client} onChange={e => setProjectData({...projectData, client: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">Date</label>
                    <><label htmlFor="a11y-input-18" className="sr-only">Input</label>
<input id="a11y-input-18" type="date" value={projectData.date} onChange={e => setProjectData({...projectData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">Location</label>
                    <><label htmlFor="a11y-input-19" className="sr-only">Input</label>
<input id="a11y-input-19" type="text" value={projectData.location} onChange={e => setProjectData({...projectData, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">Engineer</label>
                    <><label htmlFor="a11y-input-20" className="sr-only">Input</label>
<input id="a11y-input-20" type="text" value={projectData.engineer} onChange={e => setProjectData({...projectData, engineer: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-purple-900 border-b border-purple-100 pb-2 text-lg font-medium text-slate-800 mb-4">Site Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">Plot Size</label>
                    <><label htmlFor="a11y-input-21" className="sr-only">e.g. 50x90</label>
<input id="a11y-input-21" type="text" placeholder="e.g. 50x90" value={projectData.plotSize} onChange={e => setProjectData({...projectData, plotSize: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">Floors</label>
                    <><label htmlFor="a11y-input-22" className="sr-only">Input</label>
<input id="a11y-input-22" type="number" inputMode="decimal" min="1" value={projectData.floors} onChange={e => setProjectData({...projectData, floors: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500" /></>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-purple-900 border-b border-purple-100 pb-2 text-lg font-medium text-slate-800 mb-4">Select Trade Scope</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(TRADE_UNITS) as TradeScope[]).map(scope => (
                  <label key={scope} className={`flex items-center gap-3 p-4 rounded-[24px] border-2 cursor-pointer transition-all ${scopes.includes(scope) ? 'border-purple-600 bg-purple-50 ' : 'border-slate-200 hover:border-purple-300'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${scopes.includes(scope) ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'}`}>
                      {scopes.includes(scope) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="font-semibold text-slate-700">{scope}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button disabled={scopes.length===0} onClick={() => setStep(2)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-purple-500/30 active:scale-95 hover:-translate-y-0.5">
                Continue Setup <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-end border-b-2 border-purple-500 pb-2">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Measurement Input</h3>
              
              <div className="relative">
                <button 
                  onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                  className="flex items-center gap-1.5 text-base font-medium bg-purple-100 text-purple-700 px-4 py-2 mt-2 md:mt-0 rounded-full shadow-sm hover:bg-purple-200 transition-colors active:scale-95 hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" /> Quick Add Template
                </button>
                {isQuickAddOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsQuickAddOpen(false)} />
                    <div className="w-full absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-[16px] shadow-xl z-20 overflow-hidden flex flex-col py-1">
                      {QUICK_TEMPLATES.map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            addQuickTemplate(template);
                            setIsQuickAddOpen(false);
                          }}
                          className="text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm text-slate-700 flex flex-col items-start border-b border-slate-100 last:border-0 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          <span className="font-semibold text-slate-900">{template.label}</span>
                          <span className="text-sm text-purple-600 font-bold uppercase tracking-wider">{template.scope}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {scopes.map(scope => (
              <div key={scope} className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[24px] border border-slate-200 overflow-hidden">
                <div className="bg-purple-100 p-4 border-b border-purple-200 flex justify-between items-center">
                  <h4 className="text-purple-900 text-lg font-medium text-slate-800 mb-4">{scope} Measurements</h4>
                  <button onClick={() => addRow(scope)} className="w-full flex items-center gap-1.5 text-base font-medium bg-white text-purple-700 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden">
                    <Plus className="w-4 h-4" /> Add Row
                  </button>
                </div>
                
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-sm text-slate-500">
                        <th className="pb-3 pr-4 font-semibold w-[35%]">Description</th>
                        <th className="pb-3 pr-4 font-semibold w-16">Nos</th>
                        <th className="pb-3 pr-4 font-semibold w-24">Length</th>
                        <th className="pb-3 pr-4 font-semibold w-24">Width</th>
                        <th className="pb-3 pr-4 font-semibold w-24">Depth</th>
                        <th className="pb-3 pr-4 font-semibold w-24 text-right">Quantity</th>
                        <th className="pb-3 font-semibold text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {measurements[scope].length === 0 && (
                        <tr><td colSpan={7} className="text-center py-6 text-slate-600 italic">No measurements added.</td></tr>
                      )}
                      {measurements[scope].map((row) => (
                        <tr key={row.id}>
                          <td className="py-2 pr-4">
                            <><label htmlFor="a11y-input-23" className="sr-only">Item spec...</label>
<input id="a11y-input-23" type="text" placeholder="Item spec..." value={row.description} onChange={(e) => updateRow(scope, row.id, 'description', e.target.value)} className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-sm outline-none focus:border-purple-500" /></>
                          </td>
                          <td className="py-2 pr-4">
                            <><label htmlFor="a11y-input-24" className="sr-only">Input</label>
<input id="a11y-input-24" type="number" inputMode="decimal" value={row.nos || ""} onChange={(e) => updateRow(scope, row.id, 'nos', e.target.value)} className="w-full bg-white border border-slate-200 rounded-full px-2 py-2 text-sm text-center outline-none focus:border-purple-500" /></>
                          </td>
                          <td className="py-2 pr-4">
                            <><label htmlFor="a11y-input-25" className="sr-only">L</label>
<input id="a11y-input-25" type="number" inputMode="decimal" placeholder="L" value={row.length || ""} onChange={(e) => updateRow(scope, row.id, 'length', e.target.value)} className="w-full bg-white border border-slate-200 rounded-full px-2 py-2 text-sm text-center outline-none focus:border-purple-500" /></>
                          </td>
                          <td className="py-2 pr-4">
                            <><label htmlFor="a11y-input-26" className="sr-only">W</label>
<input id="a11y-input-26" type="number" inputMode="decimal" placeholder="W" value={row.width || ""} onChange={(e) => updateRow(scope, row.id, 'width', e.target.value)} className="w-full bg-white border border-slate-200 rounded-full px-2 py-2 text-sm text-center outline-none focus:border-purple-500" /></>
                          </td>
                          <td className="py-2 pr-4">
                            <><label htmlFor="a11y-input-27" className="sr-only">D/H</label>
<input id="a11y-input-27" type="number" inputMode="decimal" placeholder="D/H" value={row.depth || ""} onChange={(e) => updateRow(scope, row.id, 'depth', e.target.value)} className="w-full bg-white border border-slate-200 rounded-full px-2 py-2 text-sm text-center outline-none focus:border-purple-500" /></>
                          </td>
                          <td className="py-2 pr-4 text-right">
                            <div className="bg-slate-200 px-3 py-2 rounded-[16px] font-bold text-slate-800 flex justify-between items-center">
                              <span className="text-sm text-slate-600 font-normal">{row.unit}</span>
                              {row.quantity.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-2 text-center">
                            <button aria-label="Delete" onClick={() => deleteRow(scope, row.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-full font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Back</button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-purple-500/30 active:scale-95 hover:-translate-y-0.5">
                Continue to Rates <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h3 className="border-b-2 border-purple-500 pb-2 text-lg font-medium text-slate-800 mb-4">Rate Entry & Overrides</h3>
            <p className="bg-blue-50 p-4 rounded-[24px] border border-blue-100 text-base font-normal text-slate-600 leading-relaxed overflow-hidden">
              Base rates have been auto-populated from Live DB. Review and override if necessary before generating final BOQ.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {scopes.map(scope => {
                if (measurements[scope].length === 0) return null;
                return (
                  <div key={scope} className="calc-input overflow-hidden shadow-sm">
                    <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 overflow-hidden">
                      {scope}
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm">
                        <tbody>
                          {measurements[scope].map(row => (
                            <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                              <td className="p-4 w-1/2">{row.description || <span className="text-slate-600 italic">Unnamed item</span>}</td>
                              <td className="p-4 w-1/6 font-semibold text-slate-600 text-right">{row.quantity.toFixed(2)} {row.unit}</td>
                              <td className="p-4 w-1/6">
                                <div className="relative">
                                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                  <><label htmlFor="a11y-input-28" className="sr-only">Input</label>
<input id="a11y-input-28" type="number" inputMode="decimal" value={row.rate} onChange={(e) => updateRow(scope, row.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-300 rounded-full py-2 pl-8 pr-2 outline-none focus:border-purple-500" /></>
                                </div>
                              </td>
                              <td className="p-4 w-1/6 text-right font-bold text-purple-700">
                                {formatCurrency(row.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>

            <h3 className="border-b-2 border-purple-500 pb-2 mt-8 text-lg font-medium text-slate-800 mb-4">Markups & Adjustments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                  <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Contingency (%)</label>
                  <><label htmlFor="a11y-input-29" className="sr-only">Input</label>
<input id="a11y-input-29" type="number" inputMode="decimal" min="0" value={markups.contingency} onChange={(e) => setMarkups({...markups, contingency: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 outline-none focus:border-purple-500 font-bold" /></>
                </div>
                <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                  <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Overheads (%)</label>
                  <><label htmlFor="a11y-input-30" className="sr-only">Input</label>
<input id="a11y-input-30" type="number" inputMode="decimal" min="0" value={markups.overhead} onChange={(e) => setMarkups({...markups, overhead: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 outline-none focus:border-purple-500 font-bold" /></>
                </div>
                <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                  <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">Contractor Profit (%)</label>
                  <><label htmlFor="a11y-input-31" className="sr-only">Input</label>
<input id="a11y-input-31" type="number" inputMode="decimal" min="0" value={markups.profit} onChange={(e) => setMarkups({...markups, profit: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 outline-none focus:border-purple-500 font-bold" /></>
                </div>
              </div>

              {costBreakdownData.length > 0 && (
                <div className="w-full bg-white p-4 sm:p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center justify-center overflow-hidden">
                  <div className="h-48 w-full mb-4">
                    <D3PieChart 
                      data={costBreakdownData} 
                      colors={CHART_COLORS} 
                      currency={settings.currency}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Real-time Subtotal</div>
                    <div className="text-xl font-semibold text-slate-800 text-purple-700">
                      {settings.currency} {baseSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-full font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Back</button>
              <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-purple-500/30 active:scale-95 hover:-translate-y-0.5">
                Generate BOQ <FileText className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500 relative">
            
            {/* Header Actions */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 p-4 rounded-[24px] border border-slate-200 print:hidden overflow-hidden">
              <button onClick={() => setStep(3)} className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Edit Rates</button>
              <div className="flex items-center gap-3">
                <button onClick={() => window.dispatchEvent(new CustomEvent('global-print-action'))} className="w-full flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5 overflow-hidden">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-slate-900 px-4 py-2 rounded-full transition-colors shadow-sm text-base font-semibold active:scale-95 hover:-translate-y-0.5">
                  <FileSpreadsheet className="w-4 h-4" /> Excel
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full transition-colors shadow-sm text-base font-semibold active:scale-95 hover:-translate-y-0.5">
                  <Download className="w-4 h-4" /> PDF Report
                </button>
              </div>
            </div>

            {/* Print Output View */}
            <div className="bg-white text-slate-900 border border-slate-200 p-4 sm:p-12 rounded-[16px] shadow-[0_0_40px_rgba(15,23,42,0.05)] print:shadow-none print:border-none print:m-0 print:p-0 w-full md:max-w-5xl md:mx-auto font-sans overflow-hidden">
              
              <div className="border-b-4 border-purple-800 pb-6 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="tabular-nums text-purple-900 uppercase mb-2 text-xl font-semibold text-slate-800 tracking-tight mb-6">Bill of Quantities</h1>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">{projectData.name}</h2>
                </div>
                <div className="text-right text-sm text-slate-500 space-y-1">
                  <div><span className="font-semibold text-slate-700">Date:</span> {projectData.date}</div>
                  <div><span className="font-semibold text-slate-700">Client:</span> {projectData.client}</div>
                  <div><span className="font-semibold text-slate-700">Ref:</span> BOQ-{new Date().getFullYear()}-{Math.floor(Math.random()*1000)}</div>
                </div>
              </div>

              <div className="flex gap-12 mb-10 text-sm">
                <div className="space-y-2 flex-1">
                  <div className="flex border-b border-slate-100 pb-1"><div className="w-32 font-bold text-slate-700">Location</div><div>{projectData.location}</div></div>
                  <div className="flex border-b border-slate-100 pb-1"><div className="w-32 font-bold text-slate-700">Plot Size</div><div>{projectData.plotSize}</div></div>
                  <div className="flex border-b border-slate-100 pb-1"><div className="w-32 font-bold text-slate-700">Floors</div><div>{projectData.floors}</div></div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex border-b border-slate-100 pb-1"><div className="w-32 font-bold text-slate-700">Prepared By</div><div>{projectData.engineer}</div></div>
                  <div className="flex border-b border-slate-100 pb-1"><div className="w-32 font-bold text-slate-700">Currency</div><div>{settings.currency}</div></div>
                  <div className="flex border-b border-slate-100 pb-1"><div className="w-32 font-bold text-slate-700">Standard</div><div>Civil Estimation Pro</div></div>
                </div>
              </div>

              {costBreakdownData.length > 0 && (
                <div className="w-full mb-12 border border-slate-200 rounded-[24px] p-4 sm:p-6 bg-white shadow-sm flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                  <div className="h-64 w-full md:w-1/2">
                    <D3PieChart 
                      data={costBreakdownData} 
                      colors={CHART_COLORS} 
                      currency={settings.currency}
                    />
                  </div>
                  <div className="md:w-1/2 space-y-4">
                    <h3 className="border-b border-slate-100 pb-2 text-lg font-medium text-slate-800 mb-4">Cost Breakdown</h3>
                    {costBreakdownData.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                          <span className="font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-bold tabular-nums text-slate-800">
                          {settings.currency} {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100 mt-2">
                      <span className="font-bold text-purple-900">Base Subtotal</span>
                      <span className="font-bold tabular-nums text-purple-700">
                        {settings.currency} {baseSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <table className="w-full text-left text-sm mb-12 empty-cells-show">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 uppercase tracking-wider text-sm border-b-2 border-slate-200">
                    <th className="py-3 px-4 font-bold w-12 text-center">No.</th>
                    <th className="py-3 px-4 font-bold">Description</th>
                    <th className="py-3 px-4 font-bold w-16 text-center">Unit</th>
                    <th className="py-3 px-4 font-bold w-24 text-right">Quantity</th>
                    <th className="py-3 px-4 font-bold w-28 text-right">Rate</th>
                    <th className="py-3 px-4 font-bold w-36 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scopes.map((scope, scopeIdx) => {
                    const rows = measurements[scope];
                    if (rows.length === 0) return null;
                    const sub = subtotals[scope];

                    return (
                      <React.Fragment key={scope}>
                        {/* Section Header */}
                        <tr className="bg-slate-50">
                          <td className="py-3 px-4 font-bold text-purple-900 text-center">{scopeIdx + 1}.0</td>
                          <td colSpan={5} className="py-3 px-4 font-bold text-purple-900 uppercase tracking-wide">{scope} Works</td>
                        </tr>
                        {/* Items */}
                        {rows.map((row, rowIdx) => (
                          <tr key={row.id}>
                            <td className="py-2.5 px-4 text-center text-slate-500">{scopeIdx + 1}.{rowIdx + 1}</td>
                            <td className="py-2.5 px-4 text-slate-800 font-medium">{row.description}</td>
                            <td className="py-2.5 px-4 text-center text-slate-600">{row.unit}</td>
                            <td className="py-2.5 px-4 text-right font-semibold">{row.quantity.toFixed(2)}</td>
                            <td className="py-2.5 px-4 text-right text-slate-600">{row.rate.toFixed(2)}</td>
                            <td className="py-2.5 px-4 text-right font-bold tabular-nums">{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                        {/* Subtotal Row */}
                        <tr className="bg-white">
                          <td colSpan={4}></td>
                          <td className="py-3 px-4 text-right font-bold text-slate-700 bg-slate-50 italic">Subtotal</td>
                          <td className="py-3 px-4 text-right font-bold text-purple-800 bg-slate-50 tabular-nums">
                            {sub.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>

              <div className="flex justify-end pt-8 border-t-2 border-slate-200">
                <div className="w-96 text-sm">
                  <div className="flex justify-between items-center mb-2 text-slate-600">
                    <span className="font-semibold">Subtotal</span>
                    <span className="tabular-nums font-semibold">{baseSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {markups.contingency > 0 && (
                    <div className="flex justify-between items-center mb-2 text-slate-600">
                      <span>Contingency ({markups.contingency}%)</span>
                      <span className="tabular-nums">{contingencyAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {markups.overhead > 0 && (
                    <div className="flex justify-between items-center mb-2 text-slate-600">
                      <span>Overheads ({markups.overhead}%)</span>
                      <span className="tabular-nums">{overheadAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {markups.profit > 0 && (
                    <div className="flex justify-between items-center mb-4 text-slate-600">
                      <span>Contractor Profit ({markups.profit}%)</span>
                      <span className="tabular-nums">{profitAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 mt-2 mb-4"></div>

                  <div className="flex justify-between items-center mb-2 text-slate-600">
                    <span className="font-bold uppercase tracking-wider text-sm">Grand Total Amount</span>
                  </div>
                  <div className="text-xl break-all font-bold tabular-nums tracking-tight text-purple-900 tabular-nums flex justify-between items-center bg-purple-50 p-4 rounded-[24px] border border-purple-200 overflow-hidden">
                    <span className="text-xl text-purple-600">{settings.currency}</span>
                    {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-slate-600 mt-3 italic text-right">Errors and Omissions Excepted. Validate rates before executing works.</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    
      <CalculationHistory calculatorId="advancedboqgenerator_tool" currentInputs={{}} />
</div>
  );
}
