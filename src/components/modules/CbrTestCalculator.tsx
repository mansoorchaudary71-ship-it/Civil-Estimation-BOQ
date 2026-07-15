import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Calculator, ArrowRight, Save, Printer, Share2, Plus, Trash2, Clock, HelpCircle, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from "recharts";
import { useEstimateProcessing } from "../../hooks/useEstimateProcessing";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ProcessingSkeleton } from "../ui/ProcessingSkeleton";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SoilReportHeader } from "../ui/SoilReportHeader";
import { SoilReportDetails, generateGeotechReportPDF } from "../../utils/soilReports";
import { GlobalFAQ } from "../ui/GlobalFAQ";

export default function CbrTestCalculator() {
  const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing();

  const [minSpec, setMinSpec] = useState("15");
  const [reportDetails, setReportDetails] = useState<SoilReportDetails>({
    projectName: "Highway Rehabilitation Phase 2",
    clientName: "Department of Transportation",
    labName: "Central Soils Laboratory",
    sampleId: "S-54/CBR",
    depth: "1.5m",
    testedBy: "Senior Tech",
    date: new Date().toLocaleDateString(),
  });

  const handleReportChange = (field: keyof SoilReportDetails, value: string) => {
    setReportDetails(prev => ({ ...prev, [field]: value }));
  };

  const defaultData = [
    { penetration: 0.0, load: 0 },
    { penetration: 0.5, load: 15 },
    { penetration: 1.0, load: 45 },
    { penetration: 1.5, load: 90 },
    { penetration: 2.0, load: 140 },
    { penetration: 2.5, load: 180 },
    { penetration: 3.0, load: 210 },
    { penetration: 4.0, load: 260 },
    { penetration: 5.0, load: 300 },
    { penetration: 7.5, load: 380 },
    { penetration: 10.0, load: 450 },
    { penetration: 12.5, load: 500 },
  ];

  const [testData, setTestData] = useState<{ penetration: number; load: number }[]>(defaultData);

  const handleDataChange = (index: number, field: "load" | "penetration", value: string) => {
    const updatedData = [...testData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: parseFloat(value) || 0,
    };
    setTestData(updatedData);
    if (hasData) resetEstimate();
  };

  const addRow = () => {
    setTestData([...testData, { penetration: 0, load: 0 }]);
  };

  const removeRow = (index: number) => {
    const updatedData = testData.filter((_, i) => i !== index);
    setTestData(updatedData);
    if (hasData) resetEstimate();
  };

  const estimateData = useMemo(() => {
    if (!hasData) return null;

    // Sort to be safe
    const sortedData = [...testData].sort((a, b) => a.penetration - b.penetration);

    // Identify correction for concave initial curve
    let maxSlope = 0;
    let tangentPoint = sortedData[0];
    
    for (let i = 0; i < sortedData.length - 1; i++) {
      const p1 = sortedData[i];
      const p2 = sortedData[i + 1];
      if (p2.penetration === p1.penetration) continue;
      const slope = (p2.load - p1.load) / (p2.penetration - p1.penetration);
      if (slope > maxSlope) {
        maxSlope = slope;
        tangentPoint = p1;
      }
    }

    let originOffset = 0;
    if (maxSlope > 0) {
      const xIntercept = tangentPoint.penetration - (tangentPoint.load / maxSlope);
      // Generally origin shift is only considered valid if it's small (e.g. < 2.0 mm)
      // and positive. A negative x-intercept implies convex upwards normally initially.
      if (xIntercept > 0) {
        originOffset = xIntercept;
      }
    }

    // Identify loads at exactly 2.5 and 5.0 (after correction) using linear interpolation if missing
    const getLoadAtPenetration = (pen: number) => {
      const exactMatch = sortedData.find(d => Math.abs(d.penetration - pen) < 0.01);
      if (exactMatch) return exactMatch.load;
      
      const lower = sortedData.filter(d => d.penetration < pen).pop();
      const higher = sortedData.find(d => d.penetration > pen);
      
      if (lower && higher) {
        return lower.load + ((higher.load - lower.load) / (higher.penetration - lower.penetration)) * (pen - lower.penetration);
      }
      return 0;
    };

    const targetPen25 = 2.5 + originOffset;
    const targetPen50 = 5.0 + originOffset;

    const load25 = getLoadAtPenetration(targetPen25);
    const load50 = getLoadAtPenetration(targetPen50);

    const cbr25 = (load25 / 1370) * 100;
    const cbr50 = (load50 / 2055) * 100;
    const finalCbr = Math.max(cbr25, cbr50);
    const requiredMin = parseFloat(minSpec) || 0;

    let soilClass = "Poor";
    if (finalCbr >= 80) soilClass = "Excellent (Base Course)";
    else if (finalCbr >= 50) soilClass = "Good (Base/Subbase)";
    else if (finalCbr >= 20) soilClass = "Fair (Subbase)";
    else if (finalCbr >= 10) soilClass = "Poor (Subgrade)";
    else soilClass = "Very Poor (Unsuitable)";

    return {
      cbr25,
      cbr50,
      finalCbr,
      soilClass,
      passed: finalCbr >= requiredMin,
      load25,
      load50,
      requiredMin,
      originOffset
    };
  }, [hasData, testData, minSpec]);

  const handlePrint = () => window.dispatchEvent(new CustomEvent('global-print-action'));
  const handleSave = async () => {
    if (!estimateData) return;
    
    // Auto-generated interpretation
    const interpretationText = `Design CBR = ${estimateData.finalCbr.toFixed(1)}% — Per IRC:37-2018, recommended subgrade CBR for traffic > 10 MSA requires minimum 5%.\nStatus: [${estimateData.passed ? 'PASS' : 'FAIL'}] — Quality: ${estimateData.soilClass}`;
    
    const results = [
      { label: "CBR at 2.5 mm", value: `${estimateData.cbr25.toFixed(2)} %` },
      { label: "CBR at 5.0 mm", value: `${estimateData.cbr50.toFixed(2)} %` },
      { label: "Design CBR", value: `${estimateData.finalCbr.toFixed(2)} %` },
      { label: "Quality classification", value: estimateData.soilClass },
      { label: "Specification minimum", value: `${estimateData.requiredMin} %` },
      { label: "Test Result Status", value: estimateData.passed ? "PASSED" : "FAILED" }
    ];

    await generateGeotechReportPDF("California Bearing Ratio (CBR)", reportDetails, results, interpretationText);
  };

  return (
    <div className="w-full h-full bg-transparent text-slate-900 pb-[120px]">
      <Helmet>
        <title>California Bearing Ratio (CBR) Test Calculator</title>
        <meta name="description" content="Free CBR test calculator for Geotechnical engineering labs." />
      </Helmet>
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-8 pt-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 tracking-tight mb-4">
              <Activity className="w-8 h-8 text-indigo-600" />
              CBR Test Calculator
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-base font-medium tracking-wide uppercase ml-2 border border-blue-200">
              Lab Suite
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-base font-medium tracking-wide flex items-center gap-1 border border-slate-200">
              <Clock className="w-3.5 h-3.5" /> 5 MIN
            </span>
          </div>
          <p className="max-w-2xl text-base font-normal text-slate-600 leading-relaxed">
            Record Load vs. Penetration data to calculate the California Bearing Ratio (CBR) for evaluating the mechanical strength of road subgrades and base courses.
          </p>
        </div>

        <SoilReportHeader 
          details={reportDetails}
          onChange={handleReportChange}
          onGenerateReport={handleSave}
          isGenerating={!hasData}
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Input Panel */}
          <div className="w-full md:w-[45%] flex flex-col gap-6">
            <div className="w-full bg-white p-4 sm:p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Test Readings</h3>
                <button onClick={addRow}
                  className="flex items-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors border border-indigo-100 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              <div className="mb-6 z-10 relative">
                <div className="grid grid-cols-12 gap-2 mb-2 px-1 text-base font-medium uppercase tracking-wider">
                  <div className="col-span-5">Penetration (mm)</div>
                  <div className="col-span-5">Load (kg)</div>
                  <div className="col-span-2 text-right">#</div>
                </div>
                
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {testData.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 relative group">
                        <><label htmlFor="a11y-input-173" className="sr-only">Input</label>
<input id="a11y-input-173"
                          type="number" inputMode="decimal"
                          step="0.5"
                          value={row.penetration}
                          onChange={(e) => handleDataChange(idx, "penetration", e.target.value)}
                          className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all font-semibold"
                        /></>
                      </div>
                      <div className="col-span-5 relative">
                        <><label htmlFor="a11y-input-174" className="sr-only">Input</label>
<input id="a11y-input-174"
                          type="number" inputMode="decimal"
                          value={row.load}
                          onChange={(e) => handleDataChange(idx, "load", e.target.value)}
                          className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all font-semibold"
                        /></>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button aria-label="Delete"
                          onClick={() => removeRow(idx)}
                          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                 <label className="uppercase block mb-2 text-sm font-medium text-slate-700 mb-1">
                    Minimum Required CBR (%) for Spec Pass
                 </label>
                 <div className="relative">
                   <><label htmlFor="a11y-input-175" className="sr-only">Input</label>
<input id="a11y-input-175"
                     type="number" inputMode="decimal"
                     value={minSpec}
                     onChange={(e) => setMinSpec(e.target.value)}
                     className="w-full max-w-[200px] bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 font-bold"
                   /></>
                   <span className="absolute left-[170px] top-1/2 -translate-y-1/2 text-slate-600 text-base font-medium">%</span>
                 </div>
              </div>

              <button
                onClick={() => processEstimate(() => {})}
                disabled={isProcessing}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-full shadow-md shadow-indigo-200 transition-all flex justify-center items-center gap-2 group border border-indigo-500 active:scale-95 hover:-translate-y-0.5"
              >
                {isProcessing ? "Processing Curve..." : "Calculate CBR Result"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="p-5 rounded-[24px] border border-indigo-200 bg-indigo-50/50 shadow-sm overflow-hidden">
              <h4 className="text-indigo-900 mb-3 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                <Calculator className="w-4 h-4" /> Math Logic & Formulas
              </h4>
              <ul className="text-sm text-indigo-800/80 space-y-2 list-disc list-inside leading-relaxed uppercase tracking-wider font-semibold">
                <li>CBR <span className="lowercase">at</span> 2.5<span className="lowercase">mm</span> = (Measured Load / 1370 <span className="lowercase">kg</span>) × 100</li>
                <li>CBR <span className="lowercase">at</span> 5.0<span className="lowercase">mm</span> = (Measured Load / 2055 <span className="lowercase">kg</span>) × 100</li>
                <li>Design CBR = <span className="lowercase">max(</span>CBR 2.5, CBR 5.0<span className="lowercase">)</span></li>
              </ul>
              <div className="mt-3 p-3 bg-white/60 rounded-[24px] border border-indigo-100 text-sm text-indigo-900 font-medium overflow-hidden">
                Standard loads assume a standard 50mm diameter plunger.
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-[55%]">
            {isProcessing ? (
              <ProcessingSkeleton count={5} />
            ) : hasData && estimateData ? (
              <div className="space-y-6">
                <div className={`p-6 md:p-8 rounded-[2rem] border shadow-lg relative overflow-hidden transition-all duration-500 ${estimateData.passed ? 'bg-gradient-to-br from-emerald-50 to-teal-50/30 border-emerald-200   ' : 'bg-gradient-to-br from-rose-50 to-red-50/30 border-rose-200   '}`}>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-300/5 pb-6 mb-6">
                    <div>
                      <span className="text-base font-medium uppercase tracking-widest text-slate-500 mb-1 block">Final Design CBR</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight tracking-tight ${estimateData.passed ? 'text-emerald-700 ' : 'text-rose-700 '}`}>
                          {estimateData.finalCbr.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      <span className={`px-4 py-2 rounded-[24px] text-base font-medium shadow-sm uppercase tracking-wider border ${estimateData.passed ? 'bg-emerald-500 text-slate-900 border-emerald-600' : 'bg-rose-500 text-slate-900 border-rose-600'}`}>
                        {estimateData.passed ? "✓ Spec Passed" : "✗ Spec Failed"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="w-full bg-white/60 p-4 rounded-[24px] border border-slate-300/5 shadow-sm overflow-hidden">
                      <span className="text-slate-500 text-base font-medium uppercase tracking-widest block mb-1">CBR @ 2.5mm</span>
                      <div className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-800">{estimateData.cbr25.toFixed(1)}%</div>
                      <span className="text-sm text-slate-600 font-mono mt-1 block">Load: {estimateData.load25.toFixed(1)} kg</span>
                    </div>
                    <div className="w-full bg-white/60 p-4 rounded-[24px] border border-slate-300/5 shadow-sm overflow-hidden">
                      <span className="text-slate-500 text-base font-medium uppercase tracking-widest block mb-1">CBR @ 5.0mm</span>
                      <div className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-800">{estimateData.cbr50.toFixed(1)}%</div>
                      <span className="text-sm text-slate-600 font-mono mt-1 block">Load: {estimateData.load50.toFixed(1)} kg</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white rounded-[24px] border border-slate-300/5 shadow-sm p-5 flex items-center justify-between mb-8 overflow-hidden">
                     <div>
                       <span className="block text-base font-medium uppercase tracking-widest text-slate-500">Soil Quality Index</span>
                       <span className="text-lg font-semibold tabular-nums tracking-tight text-slate-800">{estimateData.soilClass}</span>
                     </div>
                     <Activity className="w-8 h-8 text-slate-700" />
                  </div>

                  {/* Chart section */}
                  <div className="bg-white p-5 rounded-[24px] border border-slate-300/5 shadow-sm h-[300px] w-full pt-6 overflow-hidden">
                     <h3 className="text-sm uppercase st mb-4 text-lg font-medium text-slate-800">Load vs. Penetration Curve</h3>
                     <ResponsiveContainer width="100%" height="85%">
                       <AreaChart data={[...testData].sort((a, b) => a.penetration - b.penetration)}>
                         <defs>
                           <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis 
                           dataKey="penetration" 
                           type="number" 
                           domain={[0, 'dataMax']} 
                           tickCount={10}
                           tick={{fontSize: 10, fontWeight: 500}} 
                           tickLine={false} 
                           axisLine={false} 
                           tickMargin={10}
                         />
                         <YAxis 
                           tick={{fontSize: 10, fontWeight: 500}} 
                           tickLine={false} 
                           axisLine={false} 
                           tickFormatter={(varLoad) => `${varLoad}kg`}
                           tickMargin={5}
                           domain={[0, 'dataMax']}
                         />
                         <RechartsTooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                           labelFormatter={(label) => `Penetration: ${label}mm`}
                           formatter={(value) => [`${value} kg`, 'Load']}
                         />
                         {estimateData.originOffset > 0 && (
                             <ReferenceLine x={estimateData.originOffset} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: "insideTopLeft", value: "Origin Shift", fill: "#f59e0b", fontSize: 10 }} />
                         )}
                         <ReferenceLine x={2.5 + estimateData.originOffset} stroke="#10b981" strokeDasharray="3 3" />
                         <ReferenceLine x={5.0 + estimateData.originOffset} stroke="#10b981" strokeDasharray="3 3" />
                         <ReferenceDot x={2.5 + estimateData.originOffset} y={estimateData.load25} r={4} fill="#10b981" stroke="white" />
                         <ReferenceDot x={5.0 + estimateData.originOffset} y={estimateData.load50} r={4} fill="#10b981" stroke="white" />
                         <Area 
                           type="monotone" 
                           dataKey="load" 
                           stroke="#6366f1" 
                           strokeWidth={3} 
                           fillOpacity={1} 
                           fill="url(#colorLoad)" 
                           animationDuration={1500}
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 p-4 sm:p-8 md:p-8 text-center bg-graph-pattern opacity-80 mix-blend-multiply overflow-hidden">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-highlight">
                  <Activity className="w-10 h-10 text-indigo-600 opacity-80" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-slate-800 mb-4">Ready to Plot Load-Penetration</h3>
                <p className="max-w-sm mb-6 text-base font-normal text-slate-600 leading-relaxed">
                  Input your lab dial readings in the left panel. The interactive CBR curve and corrected values will appear here automatically.
                </p>
                <div className="w-full flex gap-3 text-base font-medium text-indigo-500 uppercase tracking-widest bg-white px-4 py-2 rounded-[24px] shadow-sm border border-indigo-100 overflow-hidden">
                   <span>2.5mm</span>
                   <span className="w-1 h-1 rounded-full bg-slate-300 self-center"></span>
                   <span>5.0mm</span>
                </div>
              </div>
            )}
            
            <CalculationHistory
              calculatorId="cbr_test_calculator"
              currentInputs={{ minSpec, ...Object.fromEntries(testData.map((d) => [`Penetration ${d.penetration}mm`, `${d.load} kg`])) }}
              currentResults={estimateData ? {
                "CBR @ 2.5mm": `${estimateData.cbr25.toFixed(1)}%`,
                "CBR @ 5.0mm": `${estimateData.cbr50.toFixed(1)}%`,
                "Final CBR": `${estimateData.finalCbr.toFixed(1)}%`,
                "Status": estimateData.passed ? "PASSED" : "FAILED"
              } : undefined}
              estimationName="CBR Test Result"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
