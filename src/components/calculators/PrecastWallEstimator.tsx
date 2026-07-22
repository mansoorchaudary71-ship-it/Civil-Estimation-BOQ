import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Calculator, Ruler, Hash, Box, DollarSign, Layers, Printer, Download, Save } from 'lucide-react';
import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';
import { SmartSuggestionBadge } from '../ui/SmartSuggestionBadge';

type UnitSystem = 'metric' | 'imperial';

interface CalculationResult {
  postsCount: number;
  panelsCount: number;
  footingVolume: number;
  postCost: number;
  panelCost: number;
  footingCost: number;
  totalCost: number;
}

export function PrecastWallEstimator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  
  // Inputs
  const [wallLength, setWallLength] = useState<number>(30); // m or ft
  const [wallHeight, setWallHeight] = useState<number>(2.4); // m or ft
  
  const [panelWidth, setPanelWidth] = useState<number>(2.0); // m or ft
  const [panelHeight, setPanelHeight] = useState<number>(0.3); // m or ft
  
  const [footingLength, setFootingLength] = useState<number>(0.45); // m or ft
  const [footingWidth, setFootingWidth] = useState<number>(0.45); // m or ft
  const [footingDepth, setFootingDepth] = useState<number>(0.6); // m or ft
  
  // Costs
  const [unitPostCost, setUnitPostCost] = useState<number>(1500); // per post
  const [unitPanelCost, setUnitPanelCost] = useState<number>(800); // per panel
  const [unitConcreteCost, setUnitConcreteCost] = useState<number>(12000); // per m3 or ft3

  const [result, setResult] = useState<CalculationResult>({
    postsCount: 0,
    panelsCount: 0,
    footingVolume: 0,
    postCost: 0,
    panelCost: 0,
    footingCost: 0,
    totalCost: 0
  });

  // Handle unit conversion when switching
  useEffect(() => {
    if (unitSystem === 'metric') {
      setWallLength(30);
      setWallHeight(2.4);
      setPanelWidth(2.0);
      setPanelHeight(0.3);
      setFootingLength(0.45);
      setFootingWidth(0.45);
      setFootingDepth(0.6);
      setUnitConcreteCost(12000); // per m3
    } else {
      setWallLength(100);
      setWallHeight(8);
      setPanelWidth(6);
      setPanelHeight(1);
      setFootingLength(1.5);
      setFootingWidth(1.5);
      setFootingDepth(2.0);
      setUnitConcreteCost(340); // per ft3
    }
  }, [unitSystem]);

  useEffect(() => {
    // Math
    const spans = Math.ceil(wallLength / panelWidth);
    const postsCount = spans + 1;
    const panelsPerSpan = Math.ceil(wallHeight / panelHeight);
    const panelsCount = spans * panelsPerSpan;
    
    const singleFootingVolume = footingLength * footingWidth * footingDepth;
    const totalFootingVolume = postsCount * singleFootingVolume;
    
    const postCost = postsCount * unitPostCost;
    const panelCost = panelsCount * unitPanelCost;
    const footingCost = totalFootingVolume * unitConcreteCost;
    
    const totalCost = postCost + panelCost + footingCost;

    setResult({
      postsCount,
      panelsCount,
      footingVolume: totalFootingVolume,
      postCost,
      panelCost,
      footingCost,
      totalCost
    });
  }, [wallLength, wallHeight, panelWidth, panelHeight, footingLength, footingWidth, footingDepth, unitPostCost, unitPanelCost, unitConcreteCost]);

  const unitL = unitSystem === 'metric' ? 'm' : 'ft';
  const unitV = unitSystem === 'metric' ? 'm³' : 'ft³';
  const currency = 'Rs';

  const formulaSteps: FormulaStep[] = [
    {
      id: 1,
      label: "1. Total Precast Posts",
      theoretical: "Spans = ceil(Wall Length / Panel Width)\nPosts = Spans + 1",
      applied: `Spans = ceil(${wallLength} / ${panelWidth}) = ${Math.ceil(wallLength / panelWidth)}\nPosts = ${Math.ceil(wallLength / panelWidth)} + 1 = ${result.postsCount} posts`
    },
    {
      id: 2,
      label: "2. Total Precast Panels",
      theoretical: "Panels per Span = ceil(Wall Height / Panel Height)\nTotal Panels = Spans × Panels per Span",
      applied: `Panels per Span = ceil(${wallHeight} / ${panelHeight}) = ${Math.ceil(wallHeight / panelHeight)}\nTotal Panels = ${Math.ceil(wallLength / panelWidth)} × ${Math.ceil(wallHeight / panelHeight)} = ${result.panelsCount} panels`
    },
    {
      id: 3,
      label: "3. Footing Concrete Volume",
      theoretical: "Volume per Footing = L × W × D\nTotal Volume = Posts × Volume per Footing",
      applied: `Volume per Footing = ${footingLength} × ${footingWidth} × ${footingDepth} = ${(footingLength * footingWidth * footingDepth).toFixed(3)} ${unitV}\nTotal Volume = ${result.postsCount} × ${(footingLength * footingWidth * footingDepth).toFixed(3)} = ${result.footingVolume.toFixed(2)} ${unitV}`
    },
    {
      id: 4,
      label: "4. Total Cost Calculation",
      theoretical: "Cost = (Posts × Post Rate) + (Panels × Panel Rate) + (Volume × Concrete Rate)",
      applied: `Posts Cost = ${result.postsCount} × ${unitPostCost} = ${result.postCost.toLocaleString()}\nPanels Cost = ${result.panelsCount} × ${unitPanelCost} = ${result.panelCost.toLocaleString()}\nConcrete Cost = ${result.footingVolume.toFixed(2)} × ${unitConcreteCost} = ${result.footingCost.toLocaleString()}\nTotal = ${result.totalCost.toLocaleString()}`
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Precast Compound Wall</h1>
              <p className="text-slate-600 text-sm">Calculate panels, posts, concrete, and total cost.</p>
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
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Download size={16} /> Export BOQ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Ruler size={20} className="text-indigo-500" />
              Dimensions & Specs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wall Dimensions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Total Wall Length ({unitL})</label>
                <input
                  type="number"
                  min="1"
                  value={wallLength}
                  onChange={(e) => setWallLength(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Wall Height ({unitL})</label>
                <input
                  type="number"
                  min="0.1"
                  value={wallHeight}
                  onChange={(e) => setWallHeight(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Panel Dimensions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Panel Width (Spacing) ({unitL})</label>
                <input
                  type="number"
                  min="0.1"
                  value={panelWidth}
                  onChange={(e) => setPanelWidth(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Panel Height ({unitL})</label>
                <input
                  type="number"
                  min="0.1"
                  value={panelHeight}
                  onChange={(e) => setPanelHeight(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Post Footing Size ({unitL})</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Length</label>
                  <input type="number" value={footingLength} onChange={e => setFootingLength(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Width</label>
                  <input type="number" value={footingWidth} onChange={e => setFootingWidth(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Depth</label>
                  <input type="number" value={footingDepth} onChange={e => setFootingDepth(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-emerald-500" />
              Unit Rates ({currency})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cost per Post</label>
                <input type="number" value={unitPostCost} onChange={e => setUnitPostCost(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cost per Panel</label>
                <input type="number" value={unitPanelCost} onChange={e => setUnitPanelCost(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Concrete ({unitV})</label>
                <input type="number" value={unitConcreteCost} onChange={e => setUnitConcreteCost(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Box size={120} />
            </div>
            
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Calculator size={24} className="text-indigo-400" />
              Material Quantities
            </h2>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="text-indigo-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Hash size={14}/> Posts</div>
                <div className="text-3xl font-bold">{result.postsCount}</div>
                <div className="text-xs text-slate-400 mt-1">Total columns</div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <div className="text-indigo-200 text-sm font-medium mb-1 flex items-center gap-1.5"><Layers size={14}/> Panels</div>
                <div className="text-3xl font-bold">{result.panelsCount}</div>
                <div className="text-xs text-slate-400 mt-1">Horizontal slabs</div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md col-span-2">
                <div className="text-indigo-200 text-sm font-medium mb-1 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5"><Box size={14}/> Footing Concrete</div>
                  <SmartSuggestionBadge label="Calculate Materials" to="calculators" className="!bg-white/20 !text-white hover:!bg-white hover:!text-indigo-900 border-white/30" />
                </div>
                <div className="text-3xl font-bold">{result.footingVolume.toFixed(2)} <span className="text-lg font-normal text-slate-300">{unitV}</span></div>
                <div className="text-xs text-slate-400 mt-1">Total volume for all {result.postsCount} posts</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Cost Breakdown</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Posts ({result.postsCount} @ {unitPostCost})</span>
                <span className="font-medium text-slate-900">{currency} {result.postCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Panels ({result.panelsCount} @ {unitPanelCost})</span>
                <span className="font-medium text-slate-900">{currency} {result.panelCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Footing Concrete ({result.footingVolume.toFixed(2)} {unitV} @ {unitConcreteCost})</span>
                <span className="font-medium text-slate-900">{currency} {result.footingCost.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">Total Estimate</span>
              <span className="text-2xl font-bold text-indigo-600">{currency} {result.totalCost.toLocaleString()}</span>
            </div>
          </div>

          <FormulaAccordion steps={formulaSteps} />
        </div>
      </div>
    </div>
  );
}
