import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { SEO } from "../SEO";
import { useGlobalSettings } from "../../context/SettingsContext";
import { Droplet, Layers, Beaker, ArrowDownToLine, Flame, Download } from "lucide-react";
import { useEstimateProcessing } from "../../hooks/useEstimateProcessing";
import { ProcessingSkeleton } from "../ui/ProcessingSkeleton";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SoilReportHeader } from "../ui/SoilReportHeader";
import { SoilReportDetails, generateGeotechReportPDF } from "../../utils/soilReports";

// Sub-components for each Geotechnical test
export default function GeotechnicalCalculator() {
  const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing();
  const { currentUnit } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState<"water-content" | "specific-gravity" | "sieve" | "liquid-limit" | "cbr">("water-content");
  
  // States for Water Content
  const [wcW1, setWcW1] = useState("");
  const [wcW2, setWcW2] = useState("");
  const [wcW3, setWcW3] = useState("");

  // States for Specific Gravity
  const [sgW1, setSgW1] = useState("");
  const [sgW2, setSgW2] = useState("");
  const [sgW3, setSgW3] = useState("");
  const [sgW4, setSgW4] = useState("");

  // States for Sieve Analysis (Simplified - % passing)
  const [sieveTotal, setSieveTotal] = useState("");
  const [sieveRetainedGravel, setSieveRetainedGravel] = useState(""); // Retained on 4.75mm
  const [sieveRetainedSand, setSieveRetainedSand] = useState(""); // Retained on 75 microns (Sand)
  // Passing 75 microns goes to Silt/Clay implicitly

  // States for Liquid Limit
  const [llBlows, setLlBlows] = useState("");
  const [llWaterContent, setLlWaterContent] = useState("");

  // States for CBR
  const [cbrLoad25, setCbrLoad25] = useState("");
  const [cbrLoad50, setCbrLoad50] = useState("");

  const [reportDetails, setReportDetails] = useState<SoilReportDetails>({
    projectName: "Foundation Reconnaissance",
    clientName: "City Constructors",
    labName: "Central Soils Laboratory",
    sampleId: "BH-1",
    depth: "2.0m",
    testedBy: "Lab Tech",
    date: new Date().toLocaleDateString(),
  });

  const handleReportChange = (field: keyof SoilReportDetails, value: string) => {
    setReportDetails(prev => ({ ...prev, [field]: value }));
  };

  let currentExportData: Record<string, string> = {};
  let interpretationText = "";
  
  const parseNum = (val: string) => Math.max(0, parseFloat(val) || 0);

  // Math Logic Processing
  if (activeTab === "water-content") {
    const W1 = parseNum(wcW1);
    const W2 = parseNum(wcW2);
    const W3 = parseNum(wcW3);
    
    let w = 0;
    if (W3 - W1 > 0 && W2 >= W3) {
      w = ((W2 - W3) / (W3 - W1)) * 100;
    }
    
    currentExportData = {
      "Test Type": "Water Content",
      "Weight of Dry Soil": `${(W3 - W1).toFixed(2)} g`,
      "Weight of Water": `${(W2 - W3).toFixed(2)} g`,
      "Water Content (w)": `${w.toFixed(2)}%`,
    };
    
    const classification = w > 50 ? "High Plasticity" : w > 35 ? "Medium Plasticity" : "Low Plasticity";
    interpretationText = `Result: ${w.toFixed(1)}% — Classification per IS 1498: [${classification}] soil (assumptive correlation).`;
    
  } else if (activeTab === "specific-gravity") {
    const W1 = parseNum(sgW1);
    const W2 = parseNum(sgW2);
    const W3 = parseNum(sgW3);
    const W4 = parseNum(sgW4);
    
    let G = 0;
    const Ws = W2 - W1;
    const denom = (W2 - W1) - (W3 - W4);
    if (denom > 0 && Ws > 0) {
      G = Ws / denom;
    }

    currentExportData = {
      "Test Type": "Specific Gravity",
      "Weight of Soil Solids": `${Ws.toFixed(2)} g`,
      "Specific Gravity (G)": G > 0 && G < 5 ? `${G.toFixed(3)}` : "Invalid Input (G typically 2.5 - 2.8)",
    };
  } else if (activeTab === "sieve") {
    const total = parseNum(sieveTotal);
    const gravel = parseNum(sieveRetainedGravel);
    const sand = parseNum(sieveRetainedSand);
    const fines = Math.max(0, total - (gravel + sand));

    let gravelPct = 0, sandPct = 0, finesPct = 0;
    if (total > 0) {
      gravelPct = (gravel / total) * 100;
      sandPct = (sand / total) * 100;
      finesPct = (fines / total) * 100;
    }

    currentExportData = {
      "Test Type": "Simplified Sieve Analysis",
      "Gravel Content (>4.75mm)": `${gravelPct.toFixed(1)}%`,
      "Sand Content (0.075-4.75mm)": `${sandPct.toFixed(1)}%`,
      "Fines Content (<0.075mm)": `${finesPct.toFixed(1)}%`,
    };
  } else if (activeTab === "liquid-limit") {
    const N = parseNum(llBlows);
    const w = parseNum(llWaterContent);
    let LL = 0;
    if (N > 0 && w > 0) {
      LL = w * Math.pow(N / 25, 0.121);
    }

    currentExportData = {
      "Test Type": "Liquid Limit (One-Point)",
      "Number of Blows (N)": `${N}`,
      "Calculated Liquid Limit (LL)": `${LL.toFixed(2)}%`,
    };
  } else if (activeTab === "cbr") {
    const L25 = parseNum(cbrLoad25);
    const L50 = parseNum(cbrLoad50);
    let CBR25 = (L25 / 1370) * 100;
    let CBR50 = (L50 / 2055) * 100;
    let CBR_Final = Math.max(CBR25, CBR50);

    currentExportData = {
      "Test Type": "California Bearing Ratio (CBR)",
      "CBR @ 2.5mm Penetration": `${CBR25.toFixed(2)}%`,
      "CBR @ 5.0mm Penetration": `${CBR50.toFixed(2)}%`,
      "Final CBR Value": `${CBR_Final.toFixed(2)}%`,
    };
    const cbrStatus = CBR_Final >= 5 ? "PASS" : "FAIL";
    interpretationText = `Design CBR = ${CBR_Final.toFixed(1)}% — Per IRC:37-2018, recommended subgrade CBR for traffic > 10 MSA requires minimum 5%.\nResult: [${cbrStatus}]`;
  }

  const handleSave = async () => {
     if (!hasData) return;
     const results = Object.entries(currentExportData).map(([k, v]) => ({ label: k, value: v }));
     let title = activeTab.split("-").map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(" ");
     await generateGeotechReportPDF(title, reportDetails, results, interpretationText);
  };

  const tabs = [
    { id: "water-content", label: "Water Content", icon: Droplet },
    { id: "specific-gravity", label: "Specific Gravity", icon: Beaker },
    { id: "sieve", label: "Sieve Analysis", icon: Layers },
    { id: "liquid-limit", label: "Liquid Limit", icon: Flame },
    { id: "cbr", label: "CBR Test", icon: ArrowDownToLine },
  ] as const;

  return (
    <div className="w-full h-full bg-transparent text-slate-900 p-6 md:p-8">
      <SEO 
        title="Geotechnical & Soil Test Calculators" 
        description="Calculate soil mechanics properties like water content, specific gravity, sieve analysis, liquid limit, and CBR." 
      />
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-0">

        {/* Tab Navigation */}
        <UniversalTabs 
          tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon ? <t.icon className="w-5 h-5" /> : undefined }))} 
          activeTab={activeTab} 
          onTabChange={(id) => { setActiveTab(id as any); resetEstimate(); }} 
        />
        
        <SoilReportHeader 
          details={reportDetails}
          onChange={handleReportChange}
          onGenerateReport={handleSave}
          isGenerating={!hasData}
        />

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-start">
          
          {/* Inputs Section */}
          <div 
            className="bg-bg-card p-6 md:p-8 rounded-[24px] shadow-md border border-slate-200 dark:border-slate-700 flex flex-col gap-6 overflow-hidden"
            onChange={(e) => {
              if ((e.target as HTMLElement).tagName === 'INPUT') {
                if (hasData) resetEstimate();
              }
            }}
          >
            <h3 className="border-b border-slate-200 dark:border-slate-700 pb-3 text-slate-900 dark:text-white text-lg font-medium text-slate-800 mb-4">
              Laboratory Data Inputs
            </h3>

            {activeTab === "water-content" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight of empty container (W1) in g</label>
                  <><label htmlFor="a11y-input-236" className="sr-only">Input</label>
<input id="a11y-input-236" type="number" inputMode="decimal" min="0" value={wcW1} onChange={e => setWcW1(e.target.value)} className="mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight of container + wet soil (W2) in g</label>
                  <><label htmlFor="a11y-input-237" className="sr-only">Input</label>
<input id="a11y-input-237" type="number" inputMode="decimal" min="0" value={wcW2} onChange={e => setWcW2(e.target.value)} className="mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight of container + dry soil (W3) in g</label>
                  <><label htmlFor="a11y-input-238" className="sr-only">Input</label>
<input id="a11y-input-238" type="number" inputMode="decimal" min="0" value={wcW3} onChange={e => setWcW3(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "specific-gravity" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Empty weight of Pycnometer (W1) in g</label>
                  <><label htmlFor="a11y-input-239" className="sr-only">Input</label>
<input id="a11y-input-239" type="number" inputMode="decimal" min="0" value={sgW1} onChange={e => setSgW1(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight of Pycnometer + Soil (W2) in g</label>
                  <><label htmlFor="a11y-input-240" className="sr-only">Input</label>
<input id="a11y-input-240" type="number" inputMode="decimal" min="0" value={sgW2} onChange={e => setSgW2(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight of Pycnometer + Soil + Water (W3) in g</label>
                  <><label htmlFor="a11y-input-241" className="sr-only">Input</label>
<input id="a11y-input-241" type="number" inputMode="decimal" min="0" value={sgW3} onChange={e => setSgW3(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight of Pycnometer + Water (W4) in g</label>
                  <><label htmlFor="a11y-input-242" className="sr-only">Input</label>
<input id="a11y-input-242" type="number" inputMode="decimal" min="0" value={sgW4} onChange={e => setSgW4(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "sieve" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Total Weight of Sample (g)</label>
                  <><label htmlFor="a11y-input-243" className="sr-only">Input</label>
<input id="a11y-input-243" type="number" inputMode="decimal" min="0" value={sieveTotal} onChange={e => setSieveTotal(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight Retained on 4.75mm Sieve (g)</label>
                  <><label htmlFor="a11y-input-244" className="sr-only">Input</label>
<input id="a11y-input-244" type="number" inputMode="decimal" min="0" max={sieveTotal} value={sieveRetainedGravel} onChange={e => setSieveRetainedGravel(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Weight Retained on 75μm Sieve (g)</label>
                  <><label htmlFor="a11y-input-245" className="sr-only">Input</label>
<input id="a11y-input-245" type="number" inputMode="decimal" min="0" max={sieveTotal} value={sieveRetainedSand} onChange={e => setSieveRetainedSand(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "liquid-limit" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Number of Blows (N)</label>
                  <><label htmlFor="a11y-input-246" className="sr-only">Input</label>
<input id="a11y-input-246" type="number" inputMode="decimal" min="1" value={llBlows} onChange={e => setLlBlows(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Water Content (%)</label>
                  <><label htmlFor="a11y-input-247" className="sr-only">Input</label>
<input id="a11y-input-247" type="number" inputMode="decimal" min="0" value={llWaterContent} onChange={e => setLlWaterContent(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "cbr" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Load at 2.5mm Penetration (kg)</label>
                  <><label htmlFor="a11y-input-248" className="sr-only">Input</label>
<input id="a11y-input-248" type="number" inputMode="decimal" min="0" value={cbrLoad25} onChange={e => setCbrLoad25(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-slate-700 mb-1 block">Load at 5.0mm Penetration (kg)</label>
                  <><label htmlFor="a11y-input-249" className="sr-only">Input</label>
<input id="a11y-input-249" type="number" inputMode="decimal" min="0" value={cbrLoad50} onChange={e => setCbrLoad50(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            <button
              onClick={() => processEstimate(() => {})}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-full shadow-md transition-all mt-2 active:scale-95 hover:-translate-y-0.5"
            >
              {isProcessing ? "Generating Report..." : "Generate Lab Report"}
            </button>
          </div>

          {/* Results Section */}
          {isProcessing ? (
            <div className="w-full">
              <ProcessingSkeleton count={4} />
            </div>
          ) : hasData ? (
            <div className="bg-white border border-slate-200 border-l-[4px] border-l-[#6B46C1] p-4 sm:p-6 md:p-4 sm:p-8 rounded-[24px] shadow-sm sticky top-6 z-10 w-full transition-all overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="uppercase st text-lg font-medium text-slate-800 mb-4">
                  Lab Report Summary
                </h3>
                <Download 
                  className="w-5 h-5 text-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors" 
                  onClick={handleSave} 
                />
              </div>
              <div className="space-y-4">
                {Object.entries(currentExportData).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-slate-100 pb-3 items-center">
                    <span className="text-slate-500 font-semibold">{key}</span>
                    <span className="font-mono font-bold bg-gradient-to-br from-[#6B46C1] to-orange-500 bg-clip-text text-transparent bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 py-1 px-3 rounded-[16px] overflow-hidden">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] p-4 sm:p-8 md:p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center sticky top-6 self-start h-full min-h-[300px] w-full overflow-hidden">
              <Beaker className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-4">Waiting for Input</h3>
              <p className="mt-2 max-w-sm text-base font-normal text-slate-600 leading-relaxed">
                Enter your test values on the left and generate a summarized lab report.
              </p>
            </div>
          )}
          
          <CalculationHistory
            calculatorId="geotechnical_v1"
            currentInputs={{ 
              activeTab,
              wcW1, wcW2, wcW3,
              sgW1, sgW2, sgW3, sgW4,
              sieveTotal, sieveRetainedGravel, sieveRetainedSand,
              llBlows, llWaterContent,
              cbrLoad25, cbrLoad50
            }}
            onRestore={(ins) => {
              if (ins.activeTab) setActiveTab(ins.activeTab);
              if (ins.wcW1) setWcW1(ins.wcW1);
              if (ins.wcW2) setWcW2(ins.wcW2);
              if (ins.wcW3) setWcW3(ins.wcW3);
              if (ins.sgW1) setSgW1(ins.sgW1);
              if (ins.sgW2) setSgW2(ins.sgW2);
              if (ins.sgW3) setSgW3(ins.sgW3);
              if (ins.sgW4) setSgW4(ins.sgW4);
              if (ins.sieveTotal) setSieveTotal(ins.sieveTotal);
              if (ins.sieveRetainedGravel) setSieveRetainedGravel(ins.sieveRetainedGravel);
              if (ins.sieveRetainedSand) setSieveRetainedSand(ins.sieveRetainedSand);
              if (ins.llBlows) setLlBlows(ins.llBlows);
              if (ins.llWaterContent) setLlWaterContent(ins.llWaterContent);
              if (ins.cbrLoad25) setCbrLoad25(ins.cbrLoad25);
              if (ins.cbrLoad50) setCbrLoad50(ins.cbrLoad50);
            }}
          />
          
        </div>
      </div>
    </div>
  );
}
