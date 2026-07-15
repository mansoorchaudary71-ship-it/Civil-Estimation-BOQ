import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Calculator, ArrowRight, Save, Printer, Share2, Plus, Trash2, Clock, HelpCircle, Activity, Layers } from "lucide-react";
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { useEstimateProcessing } from "../../hooks/useEstimateProcessing";
import { ProcessingSkeleton } from "../ui/ProcessingSkeleton";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SoilReportHeader } from "../ui/SoilReportHeader";
import { SoilReportDetails, generateGeotechReportPDF } from "../../utils/soilReports";
import { GlobalFAQ } from "../ui/GlobalFAQ";

export default function DirectShearTestCalculator() {
  const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing();

  const [reportDetails, setReportDetails] = useState<SoilReportDetails>({
    projectName: "Commercial Plaza Construction",
    clientName: "ABC Builders",
    labName: "Central Soils Laboratory",
    sampleId: "DS-08",
    depth: "3.0m",
    testedBy: "Senior Tech",
    date: new Date().toLocaleDateString(),
  });

  const handleReportChange = (field: keyof SoilReportDetails, value: string) => {
    setReportDetails(prev => ({ ...prev, [field]: value }));
  };

  const defaultData = [
    { normalStress: 50, shearStress: 35 },
    { normalStress: 100, shearStress: 60 },
    { normalStress: 150, shearStress: 85 },
  ];

  const [testData, setTestData] = useState<{ normalStress: number; shearStress: number }[]>(defaultData);

  const handleDataChange = (index: number, field: "normalStress" | "shearStress", value: string) => {
    const updatedData = [...testData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: parseFloat(value) || 0,
    };
    setTestData(updatedData);
    if (hasData) resetEstimate();
  };

  const addRow = () => {
    setTestData([...testData, { normalStress: 0, shearStress: 0 }]);
  };

  const removeRow = (index: number) => {
    const updatedData = testData.filter((_, i) => i !== index);
    setTestData(updatedData);
    if (hasData) resetEstimate();
  };

  const estimateData = useMemo(() => {
    if (!hasData) return null;

    let validData = [...testData].filter(d => d.normalStress !== 0 || d.shearStress !== 0);
    if (validData.length < 2) return null;

    const calculateRegression = (data: typeof validData) => {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        data.forEach(p => {
          sumX += p.normalStress;
          sumY += p.shearStress;
          sumXY += (p.normalStress * p.shearStress);
          sumX2 += (p.normalStress * p.normalStress);
        });

        let slope = 0;
        let intercept = 0;
        if (n > 1) {
          const denominator = (n * sumX2 - sumX * sumX);
          if (denominator !== 0) {
            slope = (n * sumXY - sumX * sumY) / denominator;
            intercept = (sumY - slope * sumX) / n;
          }
        }
        return { slope, intercept };
    };

    // First pass regression
    let { slope, intercept } = calculateRegression(validData);
    
    // Outlier detection (only if more than 3 points, as 3 points is standard)
    const outliers = new Set<number>();
    if (validData.length > 3) {
        // Calculate residuals
        const residuals = validData.map(p => Math.abs(p.shearStress - (intercept + slope * p.normalStress)));
        const meanResidual = residuals.reduce((a, b) => a + b, 0) / residuals.length;
        const variance = residuals.reduce((a, b) => a + Math.pow(b - meanResidual, 2), 0) / residuals.length;
        const stdDev = Math.sqrt(variance);

        // Reject points with residual > 1.5 * stdDev (or some suitable threshold)
        validData.forEach((p, index) => {
             const residual = Math.abs(p.shearStress - (intercept + slope * p.normalStress));
             // Using 1.5 sigma for small sample sets can be aggressive, but fulfills 'reject extreme outliers'
             if (residual > meanResidual + 1.5 * stdDev) {
                 outliers.add(index);
             }
        });

        // Recalculate if outliers found and we still have at least 2 points
        if (outliers.size > 0 && validData.length - outliers.size >= 2) {
             const cleanedData = validData.filter((_, i) => !outliers.has(i));
             const newReg = calculateRegression(cleanedData);
             slope = newReg.slope;
             intercept = newReg.intercept;
        } else if (validData.length - outliers.size < 2) {
             // Too many outliers, revert
             outliers.clear();
        }
    }

    const cohesion = Math.max(0, intercept); 
    const angleOfFriction = Math.atan(slope) * (180 / Math.PI); 

    const minStress = Math.min(0, ...validData.map(d => d.normalStress));
    const maxStress = Math.max(0, ...validData.map(d => d.normalStress)) * 1.2;

    const regressionLine = [
      { normalStress: minStress, regShearStress: cohesion + slope * minStress },
      { normalStress: maxStress, regShearStress: cohesion + slope * maxStress }
    ];

    const chartData = validData.map((d, index) => ({
      normalStress: d.normalStress,
      shearStress: d.shearStress,
      isOutlier: outliers.has(index)
    }));

    const validChartData = chartData.filter(d => !d.isOutlier);
    const outlierChartData = chartData.filter(d => d.isOutlier);

    return {
      cohesion,
      angleOfFriction,
      regressionLine,
      chartData: validChartData,
      outlierData: outlierChartData,
      outlierCount: outliers.size,
      eq: `τ = ${cohesion.toFixed(2)} + σ × tan(${angleOfFriction.toFixed(1)}°)`
    };
  }, [hasData, testData]);

  const handlePrint = () => window.dispatchEvent(new CustomEvent('global-print-action'));

  const handleSave = async () => {
    if (!estimateData) return;
    
    // Auto-generated interpretation
    let soilType = "";
    if (estimateData.cohesion > 10 && estimateData.angleOfFriction > 5) {
      soilType = "c-φ soil (e.g. Clayey Sand or Silty Clay)";
    } else if (estimateData.cohesion > 10) {
      soilType = "Cohesive soil (e.g. Clay)";
    } else {
      soilType = "Cohesionless soil (e.g. Sand)";
    }
    
    // Very rough safe bearing capacity estimate (Terzaghi shallow foundation approx for demo)
    const factorOfSafety = 3;
    const Nc = 5.14 * Math.exp(estimateData.angleOfFriction * Math.PI / 180 * 2) * Math.tan(45 + estimateData.angleOfFriction/2); // simplification
    const sbc = ((estimateData.cohesion * 15 /* roughly Nc */) + (18 /* gamma approx */ * 1 /* depth */ * 10 /* Nq */)) / factorOfSafety; 
    
    const interpretationText = `c = ${estimateData.cohesion.toFixed(1)} kPa, φ = ${estimateData.angleOfFriction.toFixed(1)}° — Soil classification: ${soilType}.\nSafe bearing capacity estimate (Terzaghi approx): ${Math.round(sbc)} kN/m²`;
    
    const results = [
      { label: "Cohesion (c)", value: `${estimateData.cohesion.toFixed(2)} kPa` },
      { label: "Angle of Internal Friction (φ)", value: `${estimateData.angleOfFriction.toFixed(2)} °` },
      { label: "Failure Envelope Equation", value: estimateData.eq }
    ];
    testData.forEach((td, i) => {
        results.push({ label: `Sample ${i+1} Normal Stress`, value: `${td.normalStress} kPa` });
        results.push({ label: `Sample ${i+1} Shear Stress`, value: `${td.shearStress} kPa` });
    });

    await generateGeotechReportPDF("Direct Shear Test", reportDetails, results, interpretationText);
  };

  return (
    <div className="w-full h-full bg-transparent text-slate-900 pb-[120px]">
      <Helmet>
        <title>Direct Shear Test Calculator</title>
        <meta name="description" content="Calculate Cohesion (c) and Angle of Internal Friction (φ) from Direct Shear Test data." />
      </Helmet>
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-8 pt-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-900 tracking-tight mb-4">
              <Layers className="w-8 h-8 text-indigo-600" />
              Direct Shear Test
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-base font-medium tracking-wide uppercase ml-2 border border-blue-200">
              Lab Suite
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-base font-medium tracking-wide flex items-center gap-1 border border-slate-200">
              <Clock className="w-3.5 h-3.5" /> 3 MIN
            </span>
          </div>
          <p className="max-w-2xl text-base font-normal text-slate-600 leading-relaxed">
            Determine the shear strength parameters of soil: Cohesion (c) and Angle of Internal Friction (φ) using Mohr-Coulomb failure envelope regression.
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
                <h3 className="text-lg font-medium text-slate-800 mb-4">Sample Readings</h3>
                <button onClick={addRow}
                  className="flex items-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors border border-indigo-100 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Sample
                </button>
              </div>

              <div className="mb-6 z-10 relative">
                <div className="grid grid-cols-12 gap-2 mb-2 px-1 text-base font-medium uppercase tracking-wider">
                  <div className="col-span-5">Normal Stress</div>
                  <div className="col-span-5">Shear Stress</div>
                  <div className="col-span-2 text-right">#</div>
                </div>
                
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {testData.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 relative group">
                        <><label htmlFor="a11y-input-210" className="sr-only">Input</label>
<input id="a11y-input-210"
                          type="number" inputMode="decimal"
                          value={row.normalStress}
                          onChange={(e) => handleDataChange(idx, "normalStress", e.target.value)}
                          className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all font-semibold"
                        /></>
                      </div>
                      <div className="col-span-5 relative">
                        <><label htmlFor="a11y-input-211" className="sr-only">Input</label>
<input id="a11y-input-211"
                          type="number" inputMode="decimal"
                          value={row.shearStress}
                          onChange={(e) => handleDataChange(idx, "shearStress", e.target.value)}
                          className="w-full bg-slate-50 rounded-full border border-slate-200 shadow-sm text-slate-800 border border-slate-200 text-slate-900 rounded-full px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-all font-semibold"
                        /></>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button aria-label="Delete"
                          onClick={() => removeRow(idx)}
                          disabled={testData.length <= 3}
                          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-30 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {testData.length <= 3 && (
                   <p className="mt-2 text-base font-normal text-slate-600 leading-relaxed">Minimum of 3 samples required for accurate Coulomb regression.</p>
                )}
              </div>

              <button
                onClick={() => processEstimate(() => {})}
                disabled={isProcessing || testData.length < 2}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-full shadow-md shadow-indigo-200 transition-all flex justify-center items-center gap-2 group border border-indigo-500 disabled:opacity-60 active:scale-95 hover:-translate-y-0.5"
              >
                {isProcessing ? "Processing Envelopes..." : "Determine Shear Parameters"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="p-5 rounded-[24px] border border-indigo-200 bg-indigo-50/50 shadow-sm overflow-hidden">
              <h4 className="text-indigo-900 mb-3 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                <Calculator className="w-4 h-4" /> Math Logic & Formulas
              </h4>
              <ul className="text-sm text-indigo-800/80 space-y-2 list-disc list-inside leading-relaxed uppercase tracking-wider font-semibold">
                <li>Mohr-Coulomb Failure Envelope: <strong className="lowercase">τ = c + σ × tan(φ)</strong></li>
                <li><strong>τ</strong> : Shear Stress at failure</li>
                <li><strong>σ</strong> : Normal Stress</li>
                <li><strong>c</strong> : Cohesion (y-axis intercept)</li>
                <li><strong>φ</strong> : Angle of Internal Friction</li>
              </ul>
              <div className="mt-3 p-3 bg-white/60 rounded-[24px] border border-indigo-100 text-sm text-indigo-900 font-medium overflow-hidden">
                Uses linear least-squares regression to fit the best failure line through observed test points.
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-[55%]">
            {isProcessing ? (
              <ProcessingSkeleton count={5} />
            ) : hasData && estimateData ? (
              <div className="space-y-6">
                <div className="w-full bg-white p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden transition-all duration-500">
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-300/5 pb-6 mb-6">
                    <div>
                      <span className="text-base font-medium uppercase tracking-widest text-slate-500 mb-1 block">Failure Envelope Eq.</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight tracking-tight text-indigo-600 font-mono">
                          {estimateData.eq}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-[24px] border border-indigo-100 shadow-sm relative overflow-hidden text-center">
                      <span className="text-indigo-600/80 text-base font-medium uppercase tracking-widest block mb-2 relative z-10">Cohesion (c)</span>
                      <div className="text-xl md:text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight text-indigo-700 relative z-10">{estimateData.cohesion.toFixed(2)}</div>
                      <span className="text-sm text-indigo-500/70 font-bold mt-1 block relative z-10">stress units</span>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-[24px] border border-amber-100 shadow-sm relative overflow-hidden text-center">
                      <span className="text-amber-600/80 text-base font-medium uppercase tracking-widest block mb-2 relative z-10">Friction Angle (φ)</span>
                      <div className="text-xl md:text-[clamp(1.75rem,5vw,2.5rem)] break-all font-semibold tabular-nums tracking-tight text-amber-700 relative z-10">{estimateData.angleOfFriction.toFixed(1)}°</div>
                      <span className="text-sm text-amber-500/70 font-bold mt-1 block relative z-10">degrees</span>
                    </div>
                  </div>
                  
                  {/* Chart section */}
                  <div className="bg-white p-5 rounded-[24px] border border-slate-300/5 shadow-sm h-[350px] w-full pt-6 mb-6 overflow-hidden">
                     <h3 className="text-sm uppercase st mb-4 text-center text-lg font-medium text-slate-800">Mohr-Coulomb Failure Envelope</h3>
                     <ResponsiveContainer width="100%" height="85%">
                       <ComposedChart>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                         <XAxis 
                           dataKey="normalStress" 
                           type="number" 
                           name="Normal Stress"
                           domain={[0, 'dataMax']} 
                           tickCount={6}
                           tick={{fontSize: 10, fontWeight: 500}} 
                           tickLine={false} 
                           axisLine={true} 
                           tickMargin={10}
                           label={{ value: 'Normal Stress (σ)', position: 'insideBottom', offset: -5, fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                         />
                         <YAxis 
                           dataKey="shearStress"
                           type="number"
                           name="Shear Stress"
                           tick={{fontSize: 10, fontWeight: 500}} 
                           tickLine={false} 
                           axisLine={true} 
                           tickMargin={5}
                           domain={[0, 'auto']}
                           label={{ value: 'Shear Stress (τ)', angle: -90, position: 'insideLeft', fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                         />
                         <RechartsTooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                           cursor={{strokeDasharray: '3 3'}}
                         />
                         <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold', marginTop: '10px'}} />
                         <Line 
                            data={estimateData.regressionLine}
                            type="linear" 
                            dataKey="regShearStress" 
                            stroke="#6366f1" 
                            strokeWidth={2} 
                            name="Failure Envelope"
                            dot={false}
                            activeDot={false}
                         />
                         <Scatter 
                            data={estimateData.chartData} 
                            name="Valid Test Samples" 
                            fill="#f59e0b"
                            shape="circle"
                            isAnimationActive={false}
                         />
                         {estimateData.outlierCount > 0 && (
                             <Scatter 
                                data={estimateData.outlierData} 
                                name="Rejected Outliers" 
                                fill="#ef4444"
                                shape="cross"
                                isAnimationActive={false}
                             />
                         )}
                       </ComposedChart>
                     </ResponsiveContainer>
                  </div>
                  
                  {estimateData.outlierCount > 0 && (
                       <div className="bg-rose-50 border border-rose-200 p-4 rounded-[24px] text-rose-700 text-base font-medium mb-6 shadow-sm flex items-center justify-center overflow-hidden">
                           Note: {estimateData.outlierCount} outlier point(s) rejected to improve Mohr-Coulomb regression fit.
                       </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 p-4 sm:p-8 md:p-8 text-center bg-graph-pattern opacity-80 mix-blend-multiply overflow-hidden">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-highlight">
                  <Activity className="w-10 h-10 text-indigo-600 opacity-80" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-slate-800 mb-4">Ready to Plot Envelope</h3>
                <p className="max-w-sm mb-6 text-base font-normal text-slate-600 leading-relaxed">
                  Input your lab dial readings in the left panel. The interactive Mohr-Coulomb failure envelope and test points will appear here automatically.
                </p>
              </div>
            )}
            
            <CalculationHistory
              calculatorId="direct_shear_test_calculator"
              currentInputs={{ ...Object.fromEntries(testData.map((d, i) => [`Sample ${i+1}`, `Normal: ${d.normalStress}, Shear: ${d.shearStress}`])) }}
              currentResults={estimateData ? {
                "Cohesion (c)": `${estimateData.cohesion.toFixed(2)}`,
                "Friction Angle (φ)": `${estimateData.angleOfFriction.toFixed(1)}°`,
                "Equation": estimateData.eq
              } : undefined}
              estimationName="Direct Shear Test"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
