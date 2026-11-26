import { Button } from '../ui/Button';
import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { useGlobalSettings } from "../../context/SettingsContext";
import { Droplet, Layers, Beaker, ArrowDownToLine, Flame, Download } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { SoilReportHeader } from "../ui/SoilReportHeader";
import { SoilReportDetails, generateGeotechReportPDF } from "../../utils/soilReports";
import { cbrFromLoads } from "../../lib/geotechCalc";


// Sub-components for each Geotechnical test
export default function GeotechnicalCalculator() {
  const { currentUnit } = useGlobalSettings();
  const [activeTab, setActiveTab] = useState<"water-content" | "specific-gravity" | "sieve" | "liquid-limit" | "cbr">("water-content");
  
  // Step 5 ungating: every tab ships with a realistic lab example as its
  // defaults, so a correct result renders on load and updates live as you
  // type. The old "Generate Lab Report" gate (fake 500 ms delay, results
  // hidden until the button) is removed; the button is now a PDF download.
  // Defaults (worked examples, IS 2720): water content 25/135/118 g ->
  // w 18.28%; pycnometer 600/800/1624.5/1500 g -> Gs 2.65; sieve
  // 1000 g (250 gravel / 600 sand / 150 fines); LL 25 blows at 42% ->
  // 42.0%; CBR 200 kg @ 2.5 mm / 280 kg @ 5.0 mm -> 14.60%.
  // States for Water Content
  const [wcW1, setWcW1] = useState("25");
  const [wcW2, setWcW2] = useState("135");
  const [wcW3, setWcW3] = useState("118");

  // States for Specific Gravity
  const [sgW1, setSgW1] = useState("600");
  const [sgW2, setSgW2] = useState("800");
  const [sgW3, setSgW3] = useState("1624.5");
  const [sgW4, setSgW4] = useState("1500");

  // States for Sieve Analysis (Simplified - % passing)
  const [sieveTotal, setSieveTotal] = useState("1000");
  const [sieveRetainedGravel, setSieveRetainedGravel] = useState("250"); // Retained on 4.75mm
  const [sieveRetainedSand, setSieveRetainedSand] = useState("600"); // Retained on 75 microns (Sand)
  // Passing 75 microns goes to Silt/Clay implicitly

  // States for Liquid Limit
  const [llBlows, setLlBlows] = useState("25");
  const [llWaterContent, setLlWaterContent] = useState("42");

  // States for CBR
  const [cbrLoad25, setCbrLoad25] = useState("200");
  const [cbrLoad50, setCbrLoad50] = useState("280");

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
    
    // Plasticity CANNOT be labelled from water content alone (IS 1498) —
    // it needs LL and PL (PI = LL − PL). Show the water content only.
    const classification = "Plasticity needs LL/PL — see Atterberg tab (PI = LL − PL)";
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
    // Design CBR is the 2.5 mm value (IS 2720 Part 16): if CBR at 5.0 mm
    // is higher, the test is repeated — the old code took max(2.5, 5.0),
    // e.g. loads 180/300 kg gave 14.60% instead of 13.14% + a repeat flag.
    const cbr = cbrFromLoads(parseNum(cbrLoad25), parseNum(cbrLoad50));
    const CBR25 = cbr.cbr25;
    const CBR50 = cbr.cbr50;
    const CBR_Final = cbr.reported;

    currentExportData = {
      "Test Type": "California Bearing Ratio (CBR)",
      "CBR @ 2.5mm Penetration": `${CBR25.toFixed(2)}%`,
      "CBR @ 5.0mm Penetration": `${CBR50.toFixed(2)}%`,
      "Final CBR Value (design = 2.5mm)": `${CBR_Final.toFixed(2)}%`,
      ...(cbr.repeatTest ? { "Repeat Test": "Yes — CBR @ 5.0mm exceeds CBR @ 2.5mm (IS 2720 Pt 16)" } : {}),
    };
    const cbrStatus = CBR_Final >= 5 ? "PASS" : "FAIL";
    interpretationText = `Design CBR = ${CBR_Final.toFixed(1)}% (2.5 mm value, IS 2720 Pt 16) — Per IRC:37-2018, recommended subgrade CBR for traffic > 10 MSA requires minimum 5%.\nResult: [${cbrStatus}]${cbr.repeatTest ? "\n⚠ CBR @ 5.0mm exceeds CBR @ 2.5mm — repeat the test; do not use the higher value." : ""}`;
  }

  const handleSave = async () => {
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
    <div className="w-full h-full bg-transparent text-txt-primary p-6 md:p-8">
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-0">
        <p className="text-base font-normal text-txt-secondary leading-relaxed mb-6">Free soil test calculator: water content, specific gravity, sieve analysis, one-point liquid limit and CBR per IS 2720 — with worked formulas and PDF report. (Plastic limit and Proctor OMC are not in this tool — use the Soil Lab Suite.)</p>

        {/* Tab Navigation */}
        <UniversalTabs 
          tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon ? <t.icon className="w-5 h-5" /> : undefined }))} 
          activeTab={activeTab} 
          onTabChange={(id) => { setActiveTab(id as any); }} 
        />
        
        <SoilReportHeader 
          details={reportDetails}
          onChange={handleReportChange}
          onGenerateReport={handleSave}
        />

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-start responsive-tool-grid">
          
          {/* Inputs Section */}
          <div 
            className="bg-bg-card p-6 md:p-8 rounded-2xl shadow-brand-md border border-ui-borderSubtle dark:border-ink-600 flex flex-col gap-6 overflow-hidden"
          >
            <h3 className="border-b border-ui-borderSubtle dark:border-ink-600 pb-3 text-txt-primary dark:text-white text-lg font-medium text-txt-primary mb-4">
              Laboratory Data Inputs
            </h3>

            {activeTab === "water-content" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight of empty container (W1) in g</label>
                  <><label htmlFor="a11y-input-236" className="sr-only">Input</label>
<input id="a11y-input-236" type="number" inputMode="decimal" min="0" value={wcW1} onChange={e => setWcW1(e.target.value)} className="mt-1 w-full bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight of container + wet soil (W2) in g</label>
                  <><label htmlFor="a11y-input-237" className="sr-only">Input</label>
<input id="a11y-input-237" type="number" inputMode="decimal" min="0" value={wcW2} onChange={e => setWcW2(e.target.value)} className="mt-1 w-full bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight of container + dry soil (W3) in g</label>
                  <><label htmlFor="a11y-input-238" className="sr-only">Input</label>
<input id="a11y-input-238" type="number" inputMode="decimal" min="0" value={wcW3} onChange={e => setWcW3(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
              </div>
            )}

            {activeTab === "specific-gravity" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Empty weight of Pycnometer (W1) in g</label>
                  <><label htmlFor="a11y-input-239" className="sr-only">Input</label>
<input id="a11y-input-239" type="number" inputMode="decimal" min="0" value={sgW1} onChange={e => setSgW1(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight of Pycnometer + Soil (W2) in g</label>
                  <><label htmlFor="a11y-input-240" className="sr-only">Input</label>
<input id="a11y-input-240" type="number" inputMode="decimal" min="0" value={sgW2} onChange={e => setSgW2(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight of Pycnometer + Soil + Water (W3) in g</label>
                  <><label htmlFor="a11y-input-241" className="sr-only">Input</label>
<input id="a11y-input-241" type="number" inputMode="decimal" min="0" value={sgW3} onChange={e => setSgW3(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight of Pycnometer + Water (W4) in g</label>
                  <><label htmlFor="a11y-input-242" className="sr-only">Input</label>
<input id="a11y-input-242" type="number" inputMode="decimal" min="0" value={sgW4} onChange={e => setSgW4(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
              </div>
            )}

            {activeTab === "sieve" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Total Weight of Sample (g)</label>
                  <><label htmlFor="a11y-input-243" className="sr-only">Input</label>
<input id="a11y-input-243" type="number" inputMode="decimal" min="0" value={sieveTotal} onChange={e => setSieveTotal(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight Retained on 4.75mm Sieve (g)</label>
                  <><label htmlFor="a11y-input-244" className="sr-only">Input</label>
<input id="a11y-input-244" type="number" inputMode="decimal" min="0" max={sieveTotal} value={sieveRetainedGravel} onChange={e => setSieveRetainedGravel(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Weight Retained on 75μm Sieve (g)</label>
                  <><label htmlFor="a11y-input-245" className="sr-only">Input</label>
<input id="a11y-input-245" type="number" inputMode="decimal" min="0" max={sieveTotal} value={sieveRetainedSand} onChange={e => setSieveRetainedSand(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                {parseNum(sieveTotal) > 0 && (parseNum(sieveRetainedGravel) + parseNum(sieveRetainedSand)) > parseNum(sieveTotal) && (
                  <p className="text-sm font-medium p-3 rounded-xl bg-accent-50 border border-accent-100 text-accent-900">⚠ Retained weights ({(parseNum(sieveRetainedGravel) + parseNum(sieveRetainedSand)).toFixed(0)} g) exceed the total sample ({parseNum(sieveTotal).toFixed(0)} g) — check the weights; fines would come out negative.</p>
                )}
              </div>
            )}

            {activeTab === "liquid-limit" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Number of Blows (N)</label>
                  <><label htmlFor="a11y-input-246" className="sr-only">Input</label>
<input id="a11y-input-246" type="number" inputMode="decimal" min="1" value={llBlows} onChange={e => setLlBlows(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Water Content (%)</label>
                  <><label htmlFor="a11y-input-247" className="sr-only">Input</label>
<input id="a11y-input-247" type="number" inputMode="decimal" min="0" value={llWaterContent} onChange={e => setLlWaterContent(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                {parseNum(llBlows) > 0 && (parseNum(llBlows) < 15 || parseNum(llBlows) > 35) && (
                  <p className="text-sm font-medium p-3 rounded-xl bg-accent-50 border border-accent-100 text-accent-900">⚠ The one-point method is only valid for N = 15–35 blows (IS 2720 Pt 5); outside that range the LL is unreliable — repeat with a blow count inside 15–35.</p>
                )}
              </div>
            )}

            {activeTab === "cbr" && (
              <div className="grid gap-4">
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Load at 2.5mm Penetration (kg)</label>
                  <><label htmlFor="a11y-input-248" className="sr-only">Input</label>
<input id="a11y-input-248" type="number" inputMode="decimal" min="0" value={cbrLoad25} onChange={e => setCbrLoad25(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                <div>
                  <label className="uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1 block">Load at 5.0mm Penetration (kg)</label>
                  <><label htmlFor="a11y-input-249" className="sr-only">Input</label>
<input id="a11y-input-249" type="number" inputMode="decimal" min="0" value={cbrLoad50} onChange={e => setCbrLoad50(e.target.value)} className="mt-1 w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 text-txt-primary dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500" /></>
                </div>
                {parseNum(cbrLoad25) > 0 && parseNum(cbrLoad50) > 0 && (parseNum(cbrLoad50) / 2055) > (parseNum(cbrLoad25) / 1370) && (
                  <p className="text-sm font-medium p-3 rounded-xl bg-accent-50 border border-accent-100 text-accent-900">⚠ CBR @ 5.0 mm exceeds CBR @ 2.5 mm — repeat the test per IS 2720 Part 16; the design CBR is the 2.5 mm value, not the higher one.</p>
                )}
              </div>
            )}

            {/* Results are live from the defaults above — no gate, no fake
                delay (Step 5). This button downloads the same lab report
                as a PDF instead of unlocking the results. */}
            <Button
              onClick={handleSave}
              className="w-full bg-ink hover:bg-ink-700 text-white font-bold py-4 px-6 rounded-full shadow-brand-md transition-all mt-2 active:scale-95 hover:-translate-y-0.5"
            >
              Download Lab Report (PDF)
            </Button>
          </div>

          {/* Results Section — live from the defaults; no gate (Step 5). */}
          {(
            <div className="bg-surface-default border border-ui-borderSubtle border-l-[4px] border-l-accent-500 p-4 sm:p-6 md:p-4 sm:p-8 rounded-2xl shadow-brand-sm sticky top-6 z-10 w-full transition-all overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="uppercase st text-lg font-medium text-txt-primary mb-4">
                  Lab Report Summary
                </h3>
                <Download 
                  className="w-5 h-5 text-accent-800 cursor-pointer hover:text-accent-800 transition-colors" 
                  onClick={handleSave} 
                />
              </div>
              <div className="space-y-4">
                {Object.entries(currentExportData).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-border-color pb-3 items-center">
                    <span className="text-txt-tertiary font-semibold">{key}</span>
                    <span className="font-mono font-bold bg-gradient-to-br from-accent-500 to-accent-700 bg-clip-text text-transparent bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary py-1 px-3 rounded-2xl overflow-hidden">{val}</span>
                  </div>
                ))}
              </div>
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
