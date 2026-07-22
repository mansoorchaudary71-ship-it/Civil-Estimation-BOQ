import React, { useState, useEffect } from 'react';
import { Droplets, Beaker, TestTube, Download, Printer, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';

type Tab = 'bod' | 'cod';

export function WastewaterCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('bod');

  // BOD State
  const [initialDO, setInitialDO] = useState<number>(8.5);
  const [finalDO, setFinalDO] = useState<number>(3.2);
  const [bodSampleVol, setBodSampleVol] = useState<number>(10);
  const [bottleVol, setBottleVol] = useState<number>(300);
  const [bodResult, setBodResult] = useState<any>(null);
  const [bodError, setBodError] = useState<string>('');

  // COD State
  const [vBlank, setVBlank] = useState<number>(25.0);
  const [vSample, setVSample] = useState<number>(12.5);
  const [normality, setNormality] = useState<number>(0.1);
  const [codSampleVol, setCodSampleVol] = useState<number>(50);
  const [codResult, setCodResult] = useState<any>(null);
  const [codError, setCodError] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'bod') {
      const fetchBOD = async () => {
        try {
          const res = await fetch('/api/tools/wastewater-testing/bod', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initialDO, finalDO, sampleVolume: bodSampleVol, bottleVolume: bottleVol })
          });
          const data = await res.json();
          if (data.error) {
            setBodError(data.error);
            setBodResult(null);
          } else {
            setBodError('');
            setBodResult(data);
          }
        } catch (err) {
          setBodError("Failed to connect to API");
        }
      };
      fetchBOD();
    } else {
      const fetchCOD = async () => {
        try {
          const res = await fetch('/api/tools/wastewater-testing/cod', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vBlank, vSample, normality, sampleVolume: codSampleVol })
          });
          const data = await res.json();
          if (data.error) {
            setCodError(data.error);
            setCodResult(null);
          } else {
            setCodError('');
            setCodResult(data);
          }
        } catch (err) {
          setCodError("Failed to connect to API");
        }
      };
      fetchCOD();
    }
  }, [activeTab, initialDO, finalDO, bodSampleVol, bottleVol, vBlank, vSample, normality, codSampleVol]);

  const getBodStatus = (bod: number) => {
    if (bod < 30) return { label: 'Safe / Clean', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle };
    if (bod <= 100) return { label: 'Moderate Pollution', color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertTriangle };
    return { label: 'Severe / Industrial', color: 'text-rose-600', bg: 'bg-rose-100', icon: AlertTriangle };
  };

  const getCodStatus = (cod: number) => {
    if (cod < 250) return { label: 'Safe / Clean', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle };
    if (cod <= 500) return { label: 'Moderate Pollution', color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertTriangle };
    return { label: 'Severe / Industrial', color: 'text-rose-600', bg: 'bg-rose-100', icon: AlertTriangle };
  };

  const bodSteps: FormulaStep[] = bodResult ? [
    {
      id: 1,
      label: "1. Dilution Factor (P)",
      theoretical: "P = Sample Volume / Total Bottle Volume",
      applied: `P = ${bodSampleVol} mL / ${bottleVol} mL = ${bodResult.p.toFixed(4)}`
    },
    {
      id: 2,
      label: "2. DO Depletion",
      theoretical: "ΔDO = Initial DO - Final DO",
      applied: `ΔDO = ${initialDO} - ${finalDO} = ${bodResult.doDepletion.toFixed(2)} mg/L`
    },
    {
      id: 3,
      label: "3. BOD₅ Calculation",
      theoretical: "BOD₅ = ΔDO / P",
      applied: `BOD₅ = ${bodResult.doDepletion.toFixed(2)} / ${bodResult.p.toFixed(4)} = ${bodResult.bod.toFixed(2)} mg/L`
    }
  ] : [];

  const codSteps: FormulaStep[] = codResult ? [
    {
      id: 1,
      label: "1. Titrant Volume Difference",
      theoretical: "ΔV = Volume (Blank) - Volume (Sample)",
      applied: `ΔV = ${vBlank} - ${vSample} = ${codResult.diff.toFixed(2)} mL`
    },
    {
      id: 2,
      label: "2. COD Calculation",
      theoretical: "COD = (ΔV × N × 8000) / Sample Volume\nWhere 8000 is the milliequivalent weight of oxygen in mg/L.",
      applied: `COD = (${codResult.diff.toFixed(2)} × ${normality} × 8000) / ${codSampleVol} = ${codResult.cod.toFixed(2)} mg/L`
    }
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 text-teal-600">
              <Droplets size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Wastewater Testing Engine</h1>
              <p className="text-slate-600 text-sm">Calculate BOD₅ and COD concentrations with standard procedures.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('bod')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bod' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                BOD₅ Test
              </button>
              <button
                onClick={() => setActiveTab('cod')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cod' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                COD Test
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-teal-600 border border-teal-700 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'bod' ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Beaker size={20} className="text-teal-500" />
                BOD₅ Parameters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Initial DO (mg/L)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={initialDO}
                    onChange={(e) => setInitialDO(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Final DO after 5 days (mg/L)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={finalDO}
                    onChange={(e) => setFinalDO(Number(e.target.value))}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all ${bodError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-teal-500'}`}
                  />
                  {bodError && <p className="text-xs text-rose-500">{bodError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sample Volume (mL)</label>
                  <input
                    type="number"
                    min="1"
                    value={bodSampleVol}
                    onChange={(e) => setBodSampleVol(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Total Bottle Volume (mL)</label>
                  <input
                    type="number"
                    min="1"
                    value={bottleVol}
                    onChange={(e) => setBottleVol(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <TestTube size={20} className="text-teal-500" />
                COD Titration Parameters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Titrant Vol for Blank (mL)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={vBlank}
                    onChange={(e) => setVBlank(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Titrant Vol for Sample (mL)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={vSample}
                    onChange={(e) => setVSample(Number(e.target.value))}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all ${codError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-teal-500'}`}
                  />
                  {codError && <p className="text-xs text-rose-500">{codError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Normality of FAS (N)</label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.01"
                    value={normality}
                    onChange={(e) => setNormality(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sample Volume (mL)</label>
                  <input
                    type="number"
                    min="1"
                    value={codSampleVol}
                    onChange={(e) => setCodSampleVol(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Droplets size={120} />
            </div>
            
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Beaker size={24} className="text-teal-400" />
              {activeTab === 'bod' ? 'BOD₅ Results' : 'COD Results'}
            </h2>

            {activeTab === 'bod' && bodResult && !bodError && (() => {
              const status = getBodStatus(bodResult.bod);
              const StatusIcon = status.icon;
              return (
                <div className="space-y-4 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <div className="text-teal-200 text-sm font-medium mb-1">Calculated BOD₅</div>
                    <div className="text-4xl font-black text-white">{bodResult.bod.toFixed(2)} <span className="text-lg font-medium text-teal-200">mg/L</span></div>
                  </div>
                  
                  <div className={`rounded-2xl p-4 flex items-center gap-3 ${status.bg} border border-white/20`}>
                    <StatusIcon className={status.color} size={24} />
                    <div>
                      <div className={`text-sm font-bold ${status.color}`}>Environmental Status</div>
                      <div className={`text-xs ${status.color} opacity-80`}>{status.label}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === 'cod' && codResult && !codError && (() => {
              const status = getCodStatus(codResult.cod);
              const StatusIcon = status.icon;
              return (
                <div className="space-y-4 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <div className="text-teal-200 text-sm font-medium mb-1">Calculated COD</div>
                    <div className="text-4xl font-black text-white">{codResult.cod.toFixed(2)} <span className="text-lg font-medium text-teal-200">mg/L</span></div>
                  </div>
                  
                  <div className={`rounded-2xl p-4 flex items-center gap-3 ${status.bg} border border-white/20`}>
                    <StatusIcon className={status.color} size={24} />
                    <div>
                      <div className={`text-sm font-bold ${status.color}`}>Environmental Status</div>
                      <div className={`text-xs ${status.color} opacity-80`}>{status.label}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {(bodError && activeTab === 'bod') || (codError && activeTab === 'cod') ? (
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-2xl p-4 flex items-center gap-3 text-rose-200">
                <AlertTriangle size={20} />
                <span className="text-sm font-medium">Invalid input parameters. Please check your data.</span>
              </div>
            ) : null}
          </div>

          {activeTab === 'bod' && bodResult && !bodError && <FormulaAccordion steps={bodSteps} />}
          {activeTab === 'cod' && codResult && !codError && <FormulaAccordion steps={codSteps} />}
        </div>
      </div>
    </div>
  );
}
