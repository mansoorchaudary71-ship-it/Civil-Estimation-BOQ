import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { SEO } from "../SEO";
import { Hammer, Weight, Circle, Droplets, Download, Box } from "lucide-react";
import { useEstimateProcessing } from "../../hooks/useEstimateProcessing";
import { ProcessingSkeleton } from "../ui/ProcessingSkeleton";
import { CalculationHistory } from "../ui/CalculationHistory";

export default function AggregateTestsCalculator() {
  const { isProcessing, hasData, processEstimate, resetEstimate } = useEstimateProcessing();
  const [activeTab, setActiveTab] = useState<"impact" | "crushing" | "abrasion" | "water-absorption">("impact");
  
  // States for Impact Value
  const [aivW1, setAivW1] = useState("");
  const [aivW2, setAivW2] = useState("");
  const [aivW3, setAivW3] = useState("");

  // States for Crushing Value
  const [acvW1, setAcvW1] = useState("");
  const [acvW2, setAcvW2] = useState("");
  const [acvW3, setAcvW3] = useState("");

  // States for Abrasion Value
  const [laW1, setLaW1] = useState("");
  const [laW2, setLaW2] = useState("");

  // States for Water Absorption
  const [waW1, setWaW1] = useState(""); // SSD weight
  const [waW2, setWaW2] = useState(""); // Weight in water
  const [waW3, setWaW3] = useState(""); // Oven dry weight
  
  let currentExportData: Record<string, string> = {};
  
  const parseNum = (val: string) => Math.max(0, parseFloat(val) || 0);

  if (activeTab === "impact") {
    const W1 = parseNum(aivW1);
    const W2 = parseNum(aivW2);
    const W3 = parseNum(aivW3);
    const totalW = W2 - W1;
    
    let aiv = 0;
    if (totalW > 0) {
      aiv = (W3 / totalW) * 100;
    }
    
      let suitability = "-";
      if (aiv > 0) {
        if (aiv <= 10) suitability = "Exceptionally Strong";
        else if (aiv <= 20) suitability = "Strong";
        else if (aiv <= 30) suitability = "Satisfactory for road surfacing";
        else if (aiv <= 45) suitability = "Satisfactory for concrete (Non-wearing)";
        else suitability = "UNSUITABLE FOR CONCRETE (>45%)";
      }

      currentExportData = {
        "Test Type": "Aggregate Impact Value",
        "Total Sample Weight (W2-W1)": `${totalW.toFixed(2)} g`,
        "Weight Passing 2.36mm (W3)": `${W3.toFixed(2)} g`,
        "Impact Value": totalW > 0 ? `${aiv.toFixed(2)}%` : "-",
        "Suitability": suitability,
      };
  } else if (activeTab === "crushing") {
    const W1 = parseNum(acvW1);
    const W2 = parseNum(acvW2);
    const W3 = parseNum(acvW3);
    const totalW = W2 - W1;
    
    let acv = 0;
    if (totalW > 0) {
      acv = (W3 / totalW) * 100;
    }
    
      let suitability = "-";
      if (acv > 0) {
        if (acv <= 30) suitability = "Suitable for surface wearing course (<30%)";
        else if (acv <= 45) suitability = "Suitable for base course (<45%)";
        else suitability = "UNSUITABLE (>45%)";
      }

      currentExportData = {
        "Test Type": "Aggregate Crushing Value",
        "Total Sample Weight (W2-W1)": `${totalW.toFixed(2)} g`,
        "Weight Passing 2.36mm (W3)": `${W3.toFixed(2)} g`,
        "Crushing Value": totalW > 0 ? `${acv.toFixed(2)}%` : "-",
        "Suitability": suitability,
      };
  } else if (activeTab === "abrasion") {
    const W1 = parseNum(laW1);
    const W2 = parseNum(laW2);
    
    let la = 0;
    if (W1 > 0) {
      la = (W2 / W1) * 100;
    }
    
      let suitability = "-";
      if (la > 0) {
        if (la <= 30) suitability = "Suitable for wearing course (<30%)";
        else if (la <= 50) suitability = "Suitable for base course (<50%)";
        else suitability = "UNSUITABLE (>50%)";
      }

      currentExportData = {
        "Test Type": "Los Angeles Abrasion Value",
        "Original Weight (W1)": `${W1.toFixed(2)} g`,
        "Passing 1.7mm (W2)": `${W2.toFixed(2)} g`,
        "Abrasion Value": W1 > 0 ? `${la.toFixed(2)}%` : "-",
        "Suitability": suitability,
      };
  } else if (activeTab === "water-absorption") {
    const W1 = parseNum(waW1); // SSD
    const W2 = parseNum(waW2); // in water
    const W3 = parseNum(waW3); // oven dry
    
    let wa = 0;
    let sgApparent = 0;
    let sgBulkData = 0;
    
    if (W3 > 0) {
      wa = ((W1 - W3) / W3) * 100;
    }
    
    if (W1 - W2 > 0) {
      sgApparent = W3 / (W3 - W2);
      sgBulkData = W3 / (W1 - W2);
    }
    
      let suitability = "-";
      if (wa > 0) {
        if (wa <= 2) suitability = "Good quality aggregate (≤2%)";
        else if (wa <= 5) suitability = "Acceptable limits; slight caution";
        else suitability = "HIGH POROSITY - Flagged (>5%)";
      }

      currentExportData = {
        "Test Type": "Water Absorption & Specific Gravity",
        "Water Absorption": W3 > 0 ? `${wa.toFixed(2)}%` : "-",
        "Bulk Specific Gravity": sgBulkData > 0 ? `${sgBulkData.toFixed(3)}` : "-",
        "Apparent Specific Gravity": sgApparent > 0 ? `${sgApparent.toFixed(3)}` : "-",
        "Suitability Flag": suitability,
      };
  }

  const tabs = [
    { id: "impact", label: "Impact Value", icon: Hammer },
    { id: "crushing", label: "Crushing Value", icon: Weight },
    { id: "abrasion", label: "Abrasion Value", icon: Circle },
    { id: "water-absorption", label: "Water Absorption", icon: Droplets },
  ] as const;

  return (
    <div className="w-full h-full bg-transparent text-slate-900 p-6 md:p-8">
      <SEO 
        title="Aggregate Tests Calculator" 
        description="Calculate aggregate impact value, crushing value, abrasion, and water absorption." 
      />
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-0">

        {/* Tab Navigation */}
        <UniversalTabs 
          tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon ? <t.icon className="w-5 h-5" /> : undefined }))} 
          activeTab={activeTab} 
          onTabChange={(id) => { setActiveTab(id as any); resetEstimate(); }} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-start">
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

            {activeTab === "impact" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight of empty container (W1) in g</label>
                  <><label htmlFor="a11y-input-40" className="sr-only">Input</label>
<input id="a11y-input-40" type="number" inputMode="decimal" min="0" value={aivW1} onChange={e => setAivW1(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight of container + aggregate (W2) in g</label>
                  <><label htmlFor="a11y-input-41" className="sr-only">Input</label>
<input id="a11y-input-41" type="number" inputMode="decimal" min="0" value={aivW2} onChange={e => setAivW2(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight passing 2.36mm sieve (W3) in g</label>
                  <><label htmlFor="a11y-input-42" className="sr-only">Input</label>
<input id="a11y-input-42" type="number" inputMode="decimal" min="0" value={aivW3} onChange={e => setAivW3(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "crushing" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight of empty container (W1) in g</label>
                  <><label htmlFor="a11y-input-43" className="sr-only">Input</label>
<input id="a11y-input-43" type="number" inputMode="decimal" min="0" value={acvW1} onChange={e => setAcvW1(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight of container + aggregate (W2) in g</label>
                  <><label htmlFor="a11y-input-44" className="sr-only">Input</label>
<input id="a11y-input-44" type="number" inputMode="decimal" min="0" value={acvW2} onChange={e => setAcvW2(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight passing 2.36mm sieve limit (W3) in g</label>
                  <><label htmlFor="a11y-input-45" className="sr-only">Input</label>
<input id="a11y-input-45" type="number" inputMode="decimal" min="0" value={acvW3} onChange={e => setAcvW3(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "abrasion" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Original Weight of sample (W1) in g</label>
                  <><label htmlFor="a11y-input-46" className="sr-only">Input</label>
<input id="a11y-input-46" type="number" inputMode="decimal" min="0" value={laW1} onChange={e => setLaW1(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight passing 1.7mm sieve (W2) in g</label>
                  <><label htmlFor="a11y-input-47" className="sr-only">Input</label>
<input id="a11y-input-47" type="number" inputMode="decimal" min="0" value={laW2} onChange={e => setLaW2(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
              </div>
            )}

            {activeTab === "water-absorption" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight of SSD aggregate in air (W1) in g</label>
                  <><label htmlFor="a11y-input-48" className="sr-only">Input</label>
<input id="a11y-input-48" type="number" inputMode="decimal" min="0" value={waW1} onChange={e => setWaW1(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Weight of aggregate in water (W2) in g</label>
                  <><label htmlFor="a11y-input-49" className="sr-only">Input</label>
<input id="a11y-input-49" type="number" inputMode="decimal" min="0" value={waW2} onChange={e => setWaW2(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
                </div>
                <div>
                  <label className="uppercase text-sm font-medium text-slate-700 mb-1 block">Oven dry weight in air (W3) in g</label>
                  <><label htmlFor="a11y-input-50" className="sr-only">Input</label>
<input id="a11y-input-50" type="number" inputMode="decimal" min="0" value={waW3} onChange={e => setWaW3(e.target.value)} className="mt-1 w-full bg-white border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50" /></>
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

          <div className="flex flex-col gap-6">
            {isProcessing ? (
              <div className="w-full">
                <ProcessingSkeleton count={3} />
              </div>
            ) : hasData ? (
              <div className="bg-white border border-slate-200 border-l-[4px] border-l-[#6B46C1] p-4 sm:p-6 md:p-4 sm:p-8 rounded-[24px] shadow-sm w-full transition-all overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="uppercase st text-lg font-medium text-slate-800 mb-4">
                    Lab Report Summary
                  </h3>
                  <Download className="w-5 h-5 text-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors" />
                </div>
                <div className="space-y-4">
                  {Object.entries(currentExportData).map(([key, val]) => {
                    const valStr = String(val);
                    const isUnsuitable = valStr.includes("UNSUITABLE") || valStr.includes("HIGH POROSITY") || valStr.includes("Flagged");
                    return (
                      <div key={key} className="flex justify-between border-b border-slate-100 pb-3 items-center">
                        <span className="text-slate-500 font-semibold text-sm w-1/2">{key}</span>
                        <span className={`text-right font-mono font-bold py-1 px-3 rounded-[16px] text-sm ${isUnsuitable ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-800 border border-slate-200'}`}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-4 sm:p-8 md:p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center h-full min-h-[300px] w-full overflow-hidden">
                <Box className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-4">Waiting for Input</h3>
                <p className="mt-2 max-w-sm text-base font-normal text-slate-600 leading-relaxed">
                  Enter your test values on the left and generate a summarized lab report.
                </p>
              </div>
            )}
            
            <CalculationHistory
              calculatorId="aggregate_tests_v1"
              currentInputs={{ 
                activeTab,
                aivW1, aivW2, aivW3,
                acvW1, acvW2, acvW3,
                laW1, laW2,
                waW1, waW2, waW3
              }}
              currentResults={currentExportData}
              summaryGeneration={(ins, res) => `Aggregate Test: ${res["Test Type"]}`}
              onRestore={(ins) => {
                if (ins.activeTab) setActiveTab(ins.activeTab);
                if (ins.aivW1) setAivW1(ins.aivW1);
                if (ins.aivW2) setAivW2(ins.aivW2);
                if (ins.aivW3) setAivW3(ins.aivW3);
                if (ins.acvW1) setAcvW1(ins.acvW1);
                if (ins.acvW2) setAcvW2(ins.acvW2);
                if (ins.acvW3) setAcvW3(ins.acvW3);
                if (ins.laW1) setLaW1(ins.laW1);
                if (ins.laW2) setLaW2(ins.laW2);
                if (ins.waW1) setWaW1(ins.waW1);
                if (ins.waW2) setWaW2(ins.waW2);
                if (ins.waW3) setWaW3(ins.waW3);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
