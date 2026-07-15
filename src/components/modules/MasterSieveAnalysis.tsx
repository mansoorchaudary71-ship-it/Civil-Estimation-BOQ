import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Download, Calculator, FileSpreadsheet, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SoilReportHeader } from "../ui/SoilReportHeader";
import { SoilReportDetails, generateGeotechReportPDF } from "../../utils/soilReports";

interface SieveRow {
  size: number;
  minPassing: number;
  maxPassing: number;
  weightRetained: number | "";
  cumulativeWeightRetained: number;
  cumulativePercentRetained: number;
  percentPassing: number;
}

import { Category, sieveSpecData } from "../../data/sieveSpecs";

export default function MasterSieveAnalysis() {
  const [categories, setCategories] = useState<Category[]>(sieveSpecData.categories);
  const [selectedCategory, setSelectedCategory] = useState<string>(sieveSpecData.categories[0]?.name || "");
  const [selectedGrading, setSelectedGrading] = useState<string>("");
  const [totalWeight, setTotalWeight] = useState<number | "">("");
  const [sieveData, setSieveData] = useState<SieveRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [reportDetails, setReportDetails] = useState<SoilReportDetails>({
    projectName: "Site Development Works",
    clientName: "ABC Constructors",
    labName: "Central Soils Laboratory",
    sampleId: "SA-01 Base Course",
    depth: "0.5m",
    testedBy: "Senior Tech",
    date: new Date().toLocaleDateString(),
  });

  const handleReportChange = (field: keyof SoilReportDetails, value: string) => {
    setReportDetails(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((c) => c.name === selectedCategory);
      if (category && category.gradings.length > 0) {
        setSelectedGrading(category.gradings[0].name);
      } else {
        setSelectedGrading("");
      }
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedCategory && selectedGrading) {
      const category = categories.find((c) => c.name === selectedCategory);
      const grading = category?.gradings.find((g) => g.name === selectedGrading);
      
      if (grading) {
        // Initialize sieve data based on grading spec
        setSieveData(
          grading.sieves.map((s) => ({
            size: s.size,
            minPassing: s.minPassing,
            maxPassing: s.maxPassing,
            weightRetained: "",
            cumulativeWeightRetained: 0,
            cumulativePercentRetained: 0,
            percentPassing: 100,
          }))
        );
        setTotalWeight("");
      }
    }
  }, [selectedCategory, selectedGrading, categories]);

  const handleWeightChange = (index: number, val: string) => {
    const value = val === "" ? "" : parseFloat(val);
    const newData = [...sieveData];
    newData[index].weightRetained = value;
    setSieveData(newData);
    recalculate(newData, totalWeight);
  };

  const handleTotalWeightChange = (val: string) => {
    const tw = val === "" ? "" : parseFloat(val);
    setTotalWeight(tw);
    recalculate(sieveData, tw);
  };

  const recalculate = (data: SieveRow[], tw: number | "") => {
    if (tw === "" || tw <= 0) return;
    
    let cumWeight = 0;
    const newData = data.map((row) => {
      const w = row.weightRetained === "" ? 0 : row.weightRetained;
      cumWeight += w;
      const cumPercent = (cumWeight / tw) * 100;
      const percentPassing = 100 - cumPercent;
      
      return {
        ...row,
        cumulativeWeightRetained: parseFloat(cumWeight.toFixed(2)),
        cumulativePercentRetained: parseFloat(cumPercent.toFixed(2)),
        percentPassing: parseFloat(percentPassing.toFixed(2))
      };
    });
    setSieveData(newData);
  };

  const chartData = sieveData.map(row => ({
    size: row.size,
    logSize: row.size === 0 ? 0.001 : row.size, // for log scale handling
    Actual: (totalWeight !== "" && row.weightRetained !== "") ? row.percentPassing : null,
    Min: row.minPassing,
    Max: row.maxPassing
  })).sort((a, b) => a.size - b.size); // Recharts line charts typically expect sorted X-axis data

  const getDx = (targetPassing: number) => {
    const data = [...sieveData].sort((a, b) => a.size - b.size);
    for (let i = 0; i < data.length - 1; i++) {
        if (data[i].percentPassing <= targetPassing && data[i+1].percentPassing >= targetPassing) {
            // Linear interpolation on log scale for sieve size
            // x = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            // But log scale interpolation is better for grain size: log(x) = log(x1) + ...
            const y1 = data[i].percentPassing, y2 = data[i+1].percentPassing;
            const x1 = Math.log10(Math.max(0.001, data[i].size)), x2 = Math.log10(Math.max(0.001, data[i+1].size));
            if (y2 === y1) return data[i].size;
            const logX = x1 + (targetPassing - y1) * (x2 - x1) / (y2 - y1);
            return Math.pow(10, logX);
        }
    }
    return null;
  };

  const d10 = useMemo(() => getDx(10), [sieveData]);
  const d30 = useMemo(() => getDx(30), [sieveData]);
  const d60 = useMemo(() => getDx(60), [sieveData]);

  const cu = (d60 !== null && d10 !== null && d10 > 0) ? (d60 / d10) : null;
  const cc = (d60 !== null && d30 !== null && d10 !== null && d10 > 0) ? ((d30 * d30) / (d60 * d10)) : null;

  let uscs = "Unknown";
  if (sieveData.length > 0 && totalWeight !== "" && cu !== null && cc !== null) {
      if (cu >= 4 && cc >= 1 && cc <= 3) uscs = "GW (Well-graded gravel)";
      else if (cu >= 6 && cc >= 1 && cc <= 3) uscs = "SW (Well-graded sand)";
      else uscs = "GP/SP (Poorly graded soil)";
  }

  const handleSave = async () => {
    if (totalWeight === "" || sieveData.length === 0) return;
    
    // Auto-generated interpretation
    const interpretationText = `Coefficient of Uniformity (Cu) = ${cu ? cu.toFixed(2) : 'N/A'}\nCoefficient of Curvature (Cc) = ${cc ? cc.toFixed(2) : 'N/A'}\n\nUSCS / IS 1498 Classification Estimate: ${uscs}`;
    
    const results = [
      { label: "Total Sample Weight", value: `${totalWeight} gm` },
      { label: "Spec Category", value: selectedCategory },
      { label: "Grading Spec", value: selectedGrading },
      { label: "D10 (Effective Size)", value: d10 ? `${d10.toFixed(3)} mm` : 'N/A' },
      { label: "D30", value: d30 ? `${d30.toFixed(3)} mm` : 'N/A' },
      { label: "D60", value: d60 ? `${d60.toFixed(3)} mm` : 'N/A' },
      { label: "Cu", value: cu ? cu.toFixed(2) : 'N/A' },
      { label: "Cc", value: cc ? cc.toFixed(2) : 'N/A' },
      { label: "USCS Estimate", value: uscs }
    ];

    await generateGeotechReportPDF(`Sieve Analysis (${selectedGrading})`, reportDetails, results, interpretationText);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 md:max-w-6xl md:mx-auto pb-20 px-4 md:px-0">
      
      {/* Header */}
      <div className="w-full bg-white [#151821] rounded-[24px] p-4 sm:p-6 md:p-4 sm:p-8 mb-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[16px] bg-[#F26B1D]/10 border border-[#F26B1D]/20 mb-3">
             <FileSpreadsheet className="w-4 h-4 text-[#F26B1D]" />
             <span className="text-base font-medium text-[#F26B1D] uppercase tracking-wider">Geotechnical Lab</span>
          </div>
          <h2 className="text-2xl md:text-xl font-heading font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white mb-2">Master Sieve Analysis</h2>
          <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
            Dynamic gradation validator driven by specification databases. Select category, grading, and enter retained weights to validate against limits and generate custom gradation curves.
          </p>
        </div>
      </div>

      <SoilReportHeader 
        details={reportDetails}
        onChange={handleReportChange}
        onGenerateReport={handleSave}
        isGenerating={totalWeight === ""}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inputs & Data entry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full bg-white [#151821] rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#F26B1D]" /> Spec Selection & Input
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-base font-medium mb-2">Category</label>
                <select 
                  className="w-full px-4 py-3 rounded-[24px] bg-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#F26B1D] outline-none text-slate-700 font-medium transition-all overflow-hidden"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-base font-medium mb-2">Grading Spec</label>
                <select 
                  className="w-full px-4 py-3 rounded-[24px] bg-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#F26B1D] outline-none text-slate-700 font-medium transition-all overflow-hidden"
                  value={selectedGrading}
                  onChange={(e) => setSelectedGrading(e.target.value)}
                >
                  {categories.find(c => c.name === selectedCategory)?.gradings.map(g => (
                    <option key={g.name} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium mb-2">Total Sample Wt. (gm)</label>
                <><label htmlFor="a11y-input-338" className="sr-only">e.g. 5000</label>
<input id="a11y-input-338" type="number" inputMode="decimal"
                  min="0"
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#F26B1D] outline-none text-slate-700 font-medium transition-all min-h-[44px]"
                  value={totalWeight}
                  onChange={(e) => handleTotalWeightChange(e.target.value)}
                /></>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 text-base font-medium uppercase tracking-wider">IS Sieve (mm)</th>
                    <th className="py-3 px-4 text-base font-medium uppercase tracking-wider">Wt. Retained (gm)</th>
                    <th className="py-3 px-4 text-base font-medium uppercase tracking-wider">Cum. Wt. (gm)</th>
                    <th className="py-3 px-4 text-base font-medium uppercase tracking-wider">Limits (%)</th>
                    <th className="py-3 px-4 text-base font-medium uppercase tracking-wider">% Passing</th>
                  </tr>
                </thead>
                <tbody>
                  {sieveData.map((row, idx) => {
                    const isPassing = row.percentPassing >= row.minPassing && row.percentPassing <= row.maxPassing;
                    const hasInput = row.weightRetained !== "" || totalWeight !== "";
                    
                    return (
                      <tr key={row.size} className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 transition-colors overflow-hidden">
                        <td className="py-3 px-4 font-mono text-sm text-slate-800 font-medium">{row.size}</td>
                        <td className="py-2 px-4">
                          <><label htmlFor="a11y-input-339" className="sr-only">Input</label>
<input id="a11y-input-339" type="number" inputMode="decimal"
                            min="0"
                            className="w-24 px-3 py-1.5 rounded-full bg-bg-card border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-[#F26B1D] outline-none text-sm text-slate-700 font-medium transition-all min-h-[44px]"
                            value={row.weightRetained}
                            onChange={(e) => handleWeightChange(idx, e.target.value)}
                          /></>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">
                          {row.cumulativeWeightRetained}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-500">
                          {row.minPassing} - {row.maxPassing}
                        </td>
                        <td className={`py-3 px-4 text-base font-medium ${hasInput ? (isPassing ? 'text-emerald-600 ' : 'text-red-500 ') : 'text-slate-600 '}`}>
                          {hasInput ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${isPassing ? 'bg-emerald-50 ' : 'bg-red-50 '}`}>
                              {row.percentPassing.toFixed(1)}%
                              {!isPassing && <AlertCircle className="w-3.5 h-3.5" />}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="space-y-6">
          <div className="w-full bg-white [#151821] rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 h-[500px] flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-[#F26B1D]" /> Gradation Curve
            </h3>
            
            <div className="flex-1 w-full relative min-h-0">
               {totalWeight === "" ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded-[24px] border border-dashed border-slate-300 overflow-hidden">
                   <p className="text-slate-500 font-medium text-sm text-center px-4">
                     Enter Total Sample Weight and Sieve values to generate plot.
                   </p>
                 </div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                      <XAxis 
                        dataKey="logSize" 
                        scale="log" 
                        domain={['auto', 'auto']} 
                        type="number"
                        tickFormatter={(val) => val === 0.001 ? "Pan" : val.toString()}
                        stroke="#64748b"
                        label={{ value: "IS Sieve Size (mm)", position: "insideBottom", offset: -15, fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        stroke="#64748b"
                        label={{ value: "% Passing", angle: -90, position: 'insideLeft', fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc" }}
                        itemStyle={{ color: "#f8fafc" }}
                        labelFormatter={(val) => val === 0.001 ? "Pan" : `Sieve: ${val}mm`}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      
                      <Line type="stepAfter" dataKey="Max" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" name="Upper Limit" dot={false} />
                      <Line type="stepAfter" dataKey="Min" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Lower Limit" dot={false} />
                      <Line type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={3} name="Actual Gradation" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      
                      {d10 && <ReferenceLine x={d10} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: `D10: ${d10.toFixed(2)}`, fill: '#64748b', fontSize: 10 }} />}
                      {d30 && <ReferenceLine x={d30} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: `D30: ${d30.toFixed(2)}`, fill: '#64748b', fontSize: 10 }} />}
                      {d60 && <ReferenceLine x={d60} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: `D60: ${d60.toFixed(2)}`, fill: '#64748b', fontSize: 10 }} />}
                    </LineChart>
                  </ResponsiveContainer>
               )}
            </div>
            {totalWeight !== "" && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-3 rounded-[24px] overflow-hidden">
                <div><span className="text-sm text-slate-500 block uppercase font-bold">D10</span><strong className="text-sm">{d10 ? `${d10.toFixed(3)}mm` : 'N/A'}</strong></div>
                <div><span className="text-sm text-slate-500 block uppercase font-bold">D30</span><strong className="text-sm">{d30 ? `${d30.toFixed(3)}mm` : 'N/A'}</strong></div>
                <div><span className="text-sm text-slate-500 block uppercase font-bold">D60</span><strong className="text-sm">{d60 ? `${d60.toFixed(3)}mm` : 'N/A'}</strong></div>
                <div><span className="text-sm text-slate-500 block uppercase font-bold">Cu</span><strong className="text-sm">{cu ? cu.toFixed(2) : 'N/A'}</strong></div>
                <div><span className="text-sm text-slate-500 block uppercase font-bold">Cc</span><strong className="text-sm">{cc ? cc.toFixed(2) : 'N/A'}</strong></div>
                <div className="shrink-0 max-w-[200px] text-right">
                  <span className="text-sm text-slate-500 block uppercase font-bold">USCS Class</span>
                  <strong className="text-sm text-[#F26B1D] truncate block" title={uscs}>{uscs}</strong>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-[#F26B1D] text-slate-900 rounded-[24px] p-4 sm:p-6 shadow-[0_8px_30px_rgba(242,107,29,0.3)] border border-[#F26B1D]/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <h3 className="text-xl font-heading font-semibold tabular-nums tracking-tight mb-2 relative z-10">Instant Report</h3>
            <p className="text-orange-100 text-sm mb-6 relative z-10 font-medium">Generate a professional specification-compliant testing report instantly.</p>
            <button onClick={handleSave}
              disabled={totalWeight === ""}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#F26B1D] font-bold py-3 px-4 rounded-full shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1 relative z-10 disabled:opacity-75 disabled:cursor-not-allowed active:scale-95 overflow-hidden">
              <Download className="w-5 h-5" /> Export PDF
            </button>
          </div>
        </div>
        
        <div className="mt-8">
          <CalculationHistory
            calculatorId="master_sieve_v1"
            currentInputs={{ totalWeight, selectedCategory, selectedGrading, sieveData }}
            onRestore={(ins) => {
              if (ins.totalWeight) setTotalWeight(ins.totalWeight);
              if (ins.selectedCategory) setSelectedCategory(ins.selectedCategory);
              if (ins.selectedGrading) setSelectedGrading(ins.selectedGrading);
              if (ins.sieveData) setSieveData(ins.sieveData);
            }}
          />
        </div>

      </div>
    </div>
  );
}
