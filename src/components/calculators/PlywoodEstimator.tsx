import React, { useState, useEffect } from 'react';
import { Layers, Calculator, Ruler, Settings, Download, Printer, Box, DollarSign } from 'lucide-react';
import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';

type UnitSystem = 'metric' | 'imperial';
type InputMode = 'area' | 'dimensions';

interface PlywoodResult {
  netArea: number;
  grossAreaRequired: number;
  sheetArea: number;
  totalSheets: number;
  wastageArea: number;
  totalCost: number;
  sheetVolume: number;
}

export function PlywoodEstimator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [inputMode, setInputMode] = useState<InputMode>('dimensions');

  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(5);
  const [totalArea, setTotalArea] = useState<number>(50);
  
  const [sheetSize, setSheetSize] = useState<string>('2.44x1.22'); // standard 8x4 ft in metric
  const [customSheetLength, setCustomSheetLength] = useState<number>(2.44);
  const [customSheetWidth, setCustomSheetWidth] = useState<number>(1.22);
  const [thickness, setThickness] = useState<number>(18); // mm
  const [wastagePercent, setWastagePercent] = useState<number>(5);
  const [costPerSheet, setCostPerSheet] = useState<number>(2500);

  const [result, setResult] = useState<PlywoodResult | null>(null);

  // Sync custom inputs with predefined selections
  useEffect(() => {
    if (sheetSize !== 'custom') {
      const [l, w] = sheetSize.split('x').map(Number);
      if (!isNaN(l) && !isNaN(w)) {
        setCustomSheetLength(l);
        setCustomSheetWidth(w);
      }
    }
  }, [sheetSize]);

  // Handle unit conversion when switching
  useEffect(() => {
    if (unitSystem === 'metric') {
      setLength(10);
      setWidth(5);
      setTotalArea(50);
      setSheetSize('2.44x1.22');
      setCustomSheetLength(2.44);
      setCustomSheetWidth(1.22);
      setCostPerSheet(2500);
    } else {
      setLength(32);
      setWidth(16);
      setTotalArea(512);
      setSheetSize('8x4');
      setCustomSheetLength(8);
      setCustomSheetWidth(4);
      setCostPerSheet(100); // just an example cost in USD/GBP etc if using imperial, or generic
    }
  }, [unitSystem]);

  useEffect(() => {
    // API Call to our backend logic for standard Plywood calculation
    const calculate = async () => {
      try {
        const response = await fetch('/api/tools/plywood-calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputMode,
            totalArea,
            length,
            width,
            sheetLength: customSheetLength,
            sheetWidth: customSheetWidth,
            thickness,
            wastagePercent,
            costPerSheet
          })
        });
        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error(err);
      }
    };
    calculate();
  }, [inputMode, totalArea, length, width, customSheetLength, customSheetWidth, thickness, wastagePercent, costPerSheet]);

  const unitL = unitSystem === 'metric' ? 'm' : 'ft';
  const unitA = unitSystem === 'metric' ? 'm²' : 'sq ft';
  const currency = 'Rs';

  const sheetOptions = unitSystem === 'metric' 
    ? [
        { value: '2.44x1.22', label: '2.44m x 1.22m (Standard)' },
        { value: '1.83x0.91', label: '1.83m x 0.91m (6x3 ft)' },
        { value: 'custom', label: 'Custom Size' }
      ]
    : [
        { value: '8x4', label: '8ft x 4ft (Standard)' },
        { value: '6x3', label: '6ft x 3ft' },
        { value: 'custom', label: 'Custom Size' }
      ];

  const formulaSteps: FormulaStep[] = result ? [
    {
      id: 1,
      label: "1. Net Surface Area",
      theoretical: inputMode === 'dimensions' ? "Net Area = Length × Width" : "Net Area = User Input",
      applied: inputMode === 'dimensions' 
        ? `Net Area = ${length} × ${width} = ${result.netArea.toFixed(2)} ${unitA}`
        : `Net Area = ${result.netArea.toFixed(2)} ${unitA}`
    },
    {
      id: 2,
      label: "2. Gross Area (Including Wastage)",
      theoretical: "Gross Area = Net Area × (1 + Wastage % / 100)",
      applied: `Gross Area = ${result.netArea.toFixed(2)} × (1 + ${wastagePercent}/100) = ${result.grossAreaRequired.toFixed(2)} ${unitA}`
    },
    {
      id: 3,
      label: "3. Total Plywood Sheets",
      theoretical: "Sheet Area = Sheet Length × Sheet Width\nTotal Sheets = Math.ceil(Gross Area / Sheet Area)",
      applied: `Sheet Area = ${customSheetLength} × ${customSheetWidth} = ${result.sheetArea.toFixed(2)} ${unitA}\nTotal Sheets = Math.ceil(${result.grossAreaRequired.toFixed(2)} / ${result.sheetArea.toFixed(2)}) = ${result.totalSheets} sheets`
    },
    {
      id: 4,
      label: "4. Total Cost Calculation",
      theoretical: "Total Cost = Total Sheets × Cost per Sheet",
      applied: `Total Cost = ${result.totalSheets} × ${costPerSheet} = ${result.totalCost.toLocaleString()}`
    }
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Formwork & Plywood Estimator</h1>
              <p className="text-slate-600 text-sm">Calculate shuttering sheets, wastage, and cost.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Metric (m)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Imperial (ft)
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 border border-orange-700 rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
              <Download size={16} /> Export BOQ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ruler size={20} className="text-orange-500" />
                Target Surface Area
              </h2>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('dimensions')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${inputMode === 'dimensions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Dimensions (L × W)
                </button>
                <button
                  onClick={() => setInputMode('area')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${inputMode === 'area' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Direct Area
                </button>
              </div>
            </div>

            {inputMode === 'dimensions' ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Length ({unitL})</label>
                  <input
                    type="number"
                    min="0.1"
                    value={length}
                    onChange={(e) => setLength(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Width/Height ({unitL})</label>
                  <input
                    type="number"
                    min="0.1"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Total Net Area ({unitA})</label>
                <input
                  type="number"
                  min="0.1"
                  value={totalArea}
                  onChange={(e) => setTotalArea(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Box size={20} className="text-orange-500" />
                Sheet Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Standard Sheet Size</label>
                  <select 
                    value={sheetSize}
                    onChange={(e) => setSheetSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  >
                    {sheetOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                {sheetSize === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Custom Length ({unitL})</label>
                      <input type="number" min="0.1" value={customSheetLength} onChange={(e) => setCustomSheetLength(Math.max(0.1, Number(e.target.value)))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-orange-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Custom Width ({unitL})</label>
                      <input type="number" min="0.1" value={customSheetWidth} onChange={(e) => setCustomSheetWidth(Math.max(0.1, Number(e.target.value)))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-orange-500 outline-none" />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thickness (mm)</label>
                  <select 
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  >
                    <option value={9}>9 mm</option>
                    <option value={12}>12 mm</option>
                    <option value={16}>16 mm</option>
                    <option value={18}>18 mm (Standard)</option>
                    <option value={21}>21 mm</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Wastage & Overlap (%)</label>
                  <input type="number" min="0" value={wastagePercent} onChange={(e) => setWastagePercent(Math.max(0, Number(e.target.value)))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-orange-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-emerald-500" />
              Economics
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cost per Plywood Sheet ({currency})</label>
              <input type="number" min="0" value={costPerSheet} onChange={(e) => setCostPerSheet(Math.max(0, Number(e.target.value)))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Layers size={120} />
            </div>
            
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Calculator size={24} className="text-orange-400" />
              Material Takeoff
            </h2>

            {result && (
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="text-orange-200 text-sm font-medium mb-1">Total Sheets</div>
                  <div className="text-4xl font-black">{result.totalSheets}</div>
                  <div className="text-xs text-slate-400 mt-1">Rounded up</div>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="text-orange-200 text-sm font-medium mb-1">Gross Area</div>
                  <div className="text-2xl font-bold">{result.grossAreaRequired.toFixed(2)} <span className="text-sm font-normal text-slate-300">{unitA}</span></div>
                  <div className="text-xs text-slate-400 mt-1">Inc. {wastagePercent}% waste</div>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md col-span-2">
                  <div className="text-orange-200 text-sm font-medium mb-2">Coverage Grid Visualization</div>
                  <div className="w-full h-24 bg-black/30 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-2">
                    {/* Visual representation of grid mapping */}
                    <div className="relative w-full h-full flex flex-wrap content-start gap-[1px]">
                      {Array.from({ length: Math.min(result.totalSheets, 200) }).map((_, i) => {
                        const isWaste = (i + 1) * result.sheetArea > result.netArea && (i * result.sheetArea < result.netArea);
                        const isPureWaste = (i * result.sheetArea) >= result.netArea;
                        return (
                          <div 
                            key={i} 
                            style={{ 
                              width: `${Math.max((customSheetLength / (inputMode === 'dimensions' ? Math.max(length, 0.1) : Math.sqrt(totalArea))) * 100, 2)}%`,
                              height: `${Math.max((customSheetWidth / (inputMode === 'dimensions' ? Math.max(width, 0.1) : Math.sqrt(totalArea))) * 100, 5)}%`,
                              minWidth: '4px',
                              minHeight: '4px',
                              flexGrow: 1,
                              maxWidth: '20%'
                            }}
                            className={`rounded-sm border border-black/40 ${isPureWaste ? 'bg-red-500/50' : isWaste ? 'bg-orange-400/80' : 'bg-orange-500/80'}`}
                            title={`Sheet ${i+1}`}
                          />
                        );
                      })}
                      {result.totalSheets > 200 && <div className="text-xs text-white/50 w-full text-center mt-1">...and {result.totalSheets - 200} more</div>}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-400 justify-center">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500/80 rounded-sm"></div> Net</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400/80 rounded-sm"></div> Cut/Waste</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500/50 rounded-sm"></div> Extra</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Cost Breakdown</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Plywood Sheets ({result.totalSheets} @ {costPerSheet})</span>
                  <span className="font-medium text-slate-900">{currency} {result.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Total Wastage Area</span>
                  <span className="font-medium text-rose-600">{result.wastageArea.toFixed(2)} {unitA}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-base font-bold text-slate-800">Total Estimate</span>
                <span className="text-2xl font-bold text-orange-600">{currency} {result.totalCost.toLocaleString()}</span>
              </div>
            </div>
          )}

          {result && <FormulaAccordion steps={formulaSteps} />}
        </div>
      </div>
    </div>
  );
}
