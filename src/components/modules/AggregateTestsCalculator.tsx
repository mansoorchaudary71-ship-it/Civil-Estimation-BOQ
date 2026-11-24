import { Button } from '../ui/Button';
import React, { useState, useMemo } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { Hammer, Weight, Circle, Droplets, Download, Box, Copy, Printer, FileText, Check } from "lucide-react";
import { CalculationHistory } from "../ui/CalculationHistory";
import { jsPDF } from "jspdf";
import {
  calcAIV,
  calcACV,
  calcLA,
  calcWA,
  meanOfTrials,
  aivSuitability,
  acvSuitability,
  laSuitability,
  waSuitability,
  sgSuitability,
  SAMPLE_GUIDANCE,
  type LaInputMode,
} from "../../lib/aggregateTestsCalc";

// IS 2386 requires the MEAN of two trials to be reported. Results are
// computed live from the engine (src/lib/aggregateTestsCalc.ts) — there is
// no fake "Generate" delay any more; the report button exports a real PDF.

type TabId = "impact" | "crushing" | "abrasion" | "water-absorption";

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const filled = (...vs: string[]) => vs.some((v) => v.trim() !== "");

function TrialFields({
  trial,
  fields,
}: {
  trial: 1 | 2;
  fields: { label: string; value: string; onChange: (v: string) => void }[];
}) {
  return (
    <div className="border border-ui-borderSubtle rounded-2xl p-4 space-y-4">
      <h4 className="text-sm font-bold text-txt-secondary uppercase tracking-wider">
        Trial {trial}{trial === 2 ? " (optional — mean of both is reported)" : ""}
      </h4>
      <div className="grid gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="uppercase text-sm font-medium text-txt-secondary mb-1 block">{f.label}</label>
            <input
              type="number" inputMode="decimal" min="0"
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="mt-1 w-full bg-surface-default border border-ui-borderSubtle text-txt-primary rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AggregateTestsCalculator() {
  const [activeTab, setActiveTab] = useState<TabId>("impact");

  // Impact (W1 empty container, W2 container + aggregate, W3 passing 2.36 mm)
  const [aiv1, setAiv1] = useState<[string, string, string]>(["", "", ""]);
  const [aiv2, setAiv2] = useState<[string, string, string]>(["", "", ""]);
  // Crushing (same three weights)
  const [acv1, setAcv1] = useState<[string, string, string]>(["", "", ""]);
  const [acv2, setAcv2] = useState<[string, string, string]>(["", "", ""]);
  // LA abrasion (W1 original, W2 passing 1.70 mm OR retained — see radio)
  const [la1, setLa1] = useState<[string, string]>(["", ""]);
  const [la2, setLa2] = useState<[string, string]>(["", ""]);
  const [laMode, setLaMode] = useState<LaInputMode>("passing");
  // Water absorption (W1 SSD in air, W2 in water, W3 oven dry)
  const [wa1, setWa1] = useState<[string, string, string]>(["", "", ""]);
  const [wa2, setWa2] = useState<[string, string, string]>(["", "", ""]);

  const [copied, setCopied] = useState(false);

  const setTriple = (
    setter: React.Dispatch<React.SetStateAction<[string, string, string]>>,
    i: number,
  ) => (v: string) =>
    setter((prev) => {
      const next: [string, string, string] = [...prev];
      next[i] = v;
      return next;
    });
  const setPair = (
    setter: React.Dispatch<React.SetStateAction<[string, string]>>,
    i: number,
  ) => (v: string) =>
    setter((prev) => {
      const next: [string, string] = [...prev];
      next[i] = v;
      return next;
    });

  // ---- Live results from the engine ----
  const result = useMemo(() => {
    if (activeTab === "impact" || activeTab === "crushing") {
      const calc = activeTab === "impact" ? calcAIV : calcACV;
      const t1 = filled(...(activeTab === "impact" ? aiv1 : acv1))
        ? calc(num((activeTab === "impact" ? aiv1 : acv1)[0]), num((activeTab === "impact" ? aiv1 : acv1)[1]), num((activeTab === "impact" ? aiv1 : acv1)[2]))
        : null;
      const t2 = filled(...(activeTab === "impact" ? aiv2 : acv2))
        ? calc(num((activeTab === "impact" ? aiv2 : acv2)[0]), num((activeTab === "impact" ? aiv2 : acv2)[1]), num((activeTab === "impact" ? aiv2 : acv2)[2]))
        : null;
      const mean = meanOfTrials(t1?.valid ? t1.value : null, t2?.valid ? t2.value : null);
      const suit = mean != null ? (activeTab === "impact" ? aivSuitability(mean) : acvSuitability(mean)) : null;
      return {
        kind: activeTab, t1, t2, mean, suit,
        errors: [...(t1?.errors ?? []), ...(t2?.errors ?? [])],
        exportData: {
          "Test Type": activeTab === "impact" ? "Aggregate Impact Value (IS 2386 Pt IV)" : "Aggregate Crushing Value (IS 2386 Pt IV)",
          "Trial 1 value": t1?.valid ? `${t1.value.toFixed(2)}%` : "—",
          "Trial 2 value": t2?.valid ? `${t2.value.toFixed(2)}%` : "—",
          "Reported value (mean of trials)": mean != null ? `${mean.toFixed(2)}%` : "—",
          "Suitability": suit ? suit.verdict : "—",
          "Suitable for": suit ? (suit.suitableFor.join(", ") || "None") : "—",
        } as Record<string, string>,
      };
    }
    if (activeTab === "abrasion") {
      const t1 = filled(...la1) ? calcLA(num(la1[0]), num(la1[1]), laMode) : null;
      const t2 = filled(...la2) ? calcLA(num(la2[0]), num(la2[1]), laMode) : null;
      const mean = meanOfTrials(t1?.valid ? t1.value : null, t2?.valid ? t2.value : null);
      const suit = mean != null ? laSuitability(mean) : null;
      return {
        kind: activeTab, t1, t2, mean, suit,
        errors: [...(t1?.errors ?? []), ...(t2?.errors ?? [])],
        exportData: {
          "Test Type": "Los Angeles Abrasion Value (IS 2386 Pt IV)",
          "W2 entered as": laMode === "passing" ? "Weight passing 1.70 mm" : "Weight retained on 1.70 mm",
          "Trial 1 value": t1?.valid ? `${t1.value.toFixed(2)}%` : "—",
          "Trial 2 value": t2?.valid ? `${t2.value.toFixed(2)}%` : "—",
          "Reported value (mean of trials)": mean != null ? `${mean.toFixed(2)}%` : "—",
          "Suitability": suit ? suit.verdict : "—",
          "Suitable for": suit ? (suit.suitableFor.join(", ") || "None") : "—",
        } as Record<string, string>,
      };
    }
    // water-absorption
    const t1 = filled(...wa1) ? calcWA(num(wa1[0]), num(wa1[1]), num(wa1[2])) : null;
    const t2 = filled(...wa2) ? calcWA(num(wa2[0]), num(wa2[1]), num(wa2[2])) : null;
    const meanWa = meanOfTrials(t1?.valid ? t1.value : null, t2?.valid ? t2.value : null);
    const meanBulk = meanOfTrials(t1?.valid ? t1.bulkSg : null, t2?.valid ? t2.bulkSg : null);
    const meanApp = meanOfTrials(t1?.valid ? t1.apparentSg : null, t2?.valid ? t2.apparentSg : null);
    const suit = meanWa != null ? waSuitability(meanWa) : null;
    const sgSuit = meanBulk != null ? sgSuitability(meanBulk) : null;
    return {
      kind: activeTab, t1, t2, mean: meanWa, suit,
      errors: [...(t1?.errors ?? []), ...(t2?.errors ?? [])],
      exportData: {
        "Test Type": "Water Absorption & Specific Gravity (IS 2386 Pt III)",
        "Trial 1 water absorption": t1?.valid ? `${t1.waterAbsorptionPct.toFixed(2)}%` : "—",
        "Trial 2 water absorption": t2?.valid ? `${t2.waterAbsorptionPct.toFixed(2)}%` : "—",
        "Reported water absorption (mean)": meanWa != null ? `${meanWa.toFixed(2)}%` : "—",
        "Bulk specific gravity (mean)": meanBulk != null ? meanBulk.toFixed(3) : "—",
        "Apparent specific gravity (mean)": meanApp != null ? meanApp.toFixed(3) : "—",
        "Suitability": suit ? suit.verdict : "—",
        "Specific gravity": sgSuit ? sgSuit.verdict : "—",
      } as Record<string, string>,
    };
  }, [activeTab, aiv1, aiv2, acv1, acv2, la1, la2, laMode, wa1, wa2]);

  const hasResult = result.mean != null;
  const exportText = () => Object.entries(result.exportData).map(([k, v]) => `${k}: ${v}`).join("\n");
  const copyResults = async () => {
    try { await navigator.clipboard.writeText(exportText()); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const downloadCsv = () => {
    const csv = Object.entries(result.exportData).map(([k, v]) => `"${k}","${v.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aggregate-test-${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Aggregate Test — Lab Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Calculated ${new Date().toLocaleDateString("en-GB")} · Civil Estimation Pro`, 14, 26);
    let y = 38;
    doc.setFontSize(11);
    for (const line of exportText().split("\n")) {
      doc.text(line, 14, y, { maxWidth: 180 });
      y += 8;
    }
    doc.setFontSize(9);
    doc.text("Disclaimer: lab results depend on correct sampling and sieving — confirm with your materials engineer.", 14, y + 8, { maxWidth: 180 });
    doc.save(`aggregate-test-${activeTab}.pdf`);
  };

  const tabs = [
    { id: "impact", label: "Impact Value", icon: Hammer },
    { id: "crushing", label: "Crushing Value", icon: Weight },
    { id: "abrasion", label: "Abrasion Value", icon: Circle },
    { id: "water-absorption", label: "Water Absorption", icon: Droplets },
  ] as const;

  const formulaText: Record<TabId, string> = {
    impact: "AIV = W3 ÷ (W2 − W1) × 100, where W3 is the weight passing the 2.36 mm sieve after 15 blows in the impact machine (IS 2386 Pt IV).",
    crushing: "ACV = W3 ÷ (W2 − W1) × 100, where W3 is the weight passing the 2.36 mm sieve after a 40-tonne crushing load (IS 2386 Pt IV).",
    abrasion: "LA = loss ÷ original × 100. Loss is either the weight passing 1.70 mm, or original − retained — pick the right mode above, or a retained weight silently reads as ~76% loss (IS 2386 Pt IV).",
    "water-absorption": "WA = (SSD − oven dry) ÷ oven dry × 100. Bulk SG = dry ÷ (SSD − in water); apparent SG = dry ÷ (dry − in water) (IS 2386 Pt III).",
  };

  return (
    <div className="w-full h-full bg-transparent text-txt-primary p-6 md:p-8">
      {/* No per-component SEO here on purpose — ModuleWrapper's central
          SEOHead owns this route's title/description/canonical and its
          JSON-LD. The <SEO> block that used to live here emitted a
          second bare WebApplication script on top of the central one. */}

      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-0">

        {/* Tab Navigation */}
        <UniversalTabs
          tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon ? <t.icon className="w-5 h-5" /> : undefined }))}
          activeTab={activeTab}
          onTabChange={(id) => { setActiveTab(id as TabId); }}
        />

        <p className="text-base text-txt-secondary leading-relaxed max-w-3xl mb-6">
          Laboratory calculations for aggregate quality: impact value, crushing value, Los Angeles abrasion, and water absorption with specific gravity — all per IS 2386, with the mean of two trials reported and a suitability verdict for each result (wearing course, base course, or non-wearing concrete). Enter your sieve weights and the results update live.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-start responsive-tool-grid">
          <div
            className="bg-bg-card p-6 md:p-8 rounded-2xl shadow-brand-md border border-ui-borderSubtle dark:border-ink-600 flex flex-col gap-6 overflow-hidden"
          >
            <h3 className="border-b border-ui-borderSubtle dark:border-ink-600 pb-3 text-txt-primary dark:text-white text-lg font-medium text-txt-primary mb-4">
              Laboratory Data Inputs
            </h3>

            <p className="text-sm text-txt-secondary -mt-2">{SAMPLE_GUIDANCE[activeTab]}</p>

            {(activeTab === "impact" || activeTab === "crushing") && (
              <>
                <TrialFields
                  trial={1}
                  fields={[
                    { label: "Weight of empty container (W1) in g", value: (activeTab === "impact" ? aiv1 : acv1)[0], onChange: setTriple(activeTab === "impact" ? setAiv1 : setAcv1, 0) },
                    { label: "Weight of container + aggregate (W2) in g", value: (activeTab === "impact" ? aiv1 : acv1)[1], onChange: setTriple(activeTab === "impact" ? setAiv1 : setAcv1, 1) },
                    { label: activeTab === "impact" ? "Weight passing 2.36 mm sieve (W3) in g" : "Weight passing 2.36 mm sieve limit (W3) in g", value: (activeTab === "impact" ? aiv1 : acv1)[2], onChange: setTriple(activeTab === "impact" ? setAiv1 : setAcv1, 2) },
                  ]}
                />
                <TrialFields
                  trial={2}
                  fields={[
                    { label: "Weight of empty container (W1) in g", value: (activeTab === "impact" ? aiv2 : acv2)[0], onChange: setTriple(activeTab === "impact" ? setAiv2 : setAcv2, 0) },
                    { label: "Weight of container + aggregate (W2) in g", value: (activeTab === "impact" ? aiv2 : acv2)[1], onChange: setTriple(activeTab === "impact" ? setAiv2 : setAcv2, 1) },
                    { label: "Weight passing 2.36 mm sieve (W3) in g", value: (activeTab === "impact" ? aiv2 : acv2)[2], onChange: setTriple(activeTab === "impact" ? setAiv2 : setAcv2, 2) },
                  ]}
                />
              </>
            )}

            {activeTab === "abrasion" && (
              <>
                <div className="border border-ui-borderSubtle rounded-2xl p-4">
                  <p className="text-sm font-bold text-txt-secondary mb-2">What is W2?</p>
                  <label className="flex items-center gap-2 text-sm text-txt-primary py-1">
                    <input type="radio" name="la-mode" checked={laMode === "passing"} onChange={() => setLaMode("passing")} />
                    Weight passing 1.70 mm sieve (loss)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-txt-primary py-1">
                    <input type="radio" name="la-mode" checked={laMode === "retained"} onChange={() => setLaMode("retained")} />
                    Weight retained on 1.70 mm sieve (loss = original − retained)
                  </label>
                </div>
                <TrialFields
                  trial={1}
                  fields={[
                    { label: "Original weight of sample (W1) in g", value: la1[0], onChange: setPair(setLa1, 0) },
                    { label: laMode === "passing" ? "Weight passing 1.70 mm sieve (W2) in g" : "Weight retained on 1.70 mm sieve (W2) in g", value: la1[1], onChange: setPair(setLa1, 1) },
                  ]}
                />
                <TrialFields
                  trial={2}
                  fields={[
                    { label: "Original weight of sample (W1) in g", value: la2[0], onChange: setPair(setLa2, 0) },
                    { label: laMode === "passing" ? "Weight passing 1.70 mm sieve (W2) in g" : "Weight retained on 1.70 mm sieve (W2) in g", value: la2[1], onChange: setPair(setLa2, 1) },
                  ]}
                />
              </>
            )}

            {activeTab === "water-absorption" && (
              <>
                <TrialFields
                  trial={1}
                  fields={[
                    { label: "Weight of SSD aggregate in air (W1) in g", value: wa1[0], onChange: setTriple(setWa1, 0) },
                    { label: "Weight of aggregate in water (W2) in g", value: wa1[1], onChange: setTriple(setWa1, 1) },
                    { label: "Oven dry weight in air (W3) in g", value: wa1[2], onChange: setTriple(setWa1, 2) },
                  ]}
                />
                <TrialFields
                  trial={2}
                  fields={[
                    { label: "Weight of SSD aggregate in air (W1) in g", value: wa2[0], onChange: setTriple(setWa2, 0) },
                    { label: "Weight of aggregate in water (W2) in g", value: wa2[1], onChange: setTriple(setWa2, 1) },
                    { label: "Oven dry weight in air (W3) in g", value: wa2[2], onChange: setTriple(setWa2, 2) },
                  ]}
                />
              </>
            )}

            {result.errors.length > 0 && (
              <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4" role="alert">
                <p className="font-bold text-ui-errorText">Check your inputs</p>
                <ul className="list-disc pl-5 mt-2 text-sm text-ui-errorText space-y-1">
                  {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
                </ul>
              </div>
            )}

            <p className="text-sm text-txt-secondary">{formulaText[activeTab]}</p>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={downloadPdf}
                disabled={!hasResult}
                className="flex-1 bg-ink hover:bg-ink-700 text-white font-bold py-4 px-6 rounded-full shadow-brand-md transition-all mt-2 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50"
              >
                Generate Lab Report (PDF)
              </Button>
              <Button
                onClick={downloadCsv}
                disabled={!hasResult}
                className="px-5 py-4 bg-accent-50 text-accent-800 font-semibold rounded-full hover:bg-accent-100 mt-2 disabled:opacity-50"
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {hasResult ? (
              <div className="bg-surface-default border border-ui-borderSubtle border-l-[4px] border-l-accent-500 p-4 sm:p-6 md:p-4 sm:p-8 rounded-2xl shadow-brand-sm w-full transition-all overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="uppercase st text-lg font-medium text-txt-primary mb-4">
                    Lab Report Summary
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={copyResults} aria-label="Copy results" title="Copy results">
                      {copied ? <Check className="w-5 h-5 text-accent-800" /> : <Copy className="w-5 h-5 text-accent-800 cursor-pointer hover:text-accent-800 transition-colors" />}
                    </button>
                    <button onClick={() => window.print()} aria-label="Print" title="Print">
                      <Printer className="w-5 h-5 text-accent-800 cursor-pointer hover:text-accent-800 transition-colors" />
                    </button>
                    <button onClick={downloadCsv} aria-label="Download CSV" title="Download CSV">
                      <Download className="w-5 h-5 text-accent-800 cursor-pointer hover:text-accent-800 transition-colors" />
                    </button>
                    <button onClick={downloadPdf} aria-label="Download PDF" title="Download PDF">
                      <FileText className="w-5 h-5 text-accent-800 cursor-pointer hover:text-accent-800 transition-colors" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(result.exportData).map(([key, val]) => {
                    const valStr = String(val);
                    const isUnsuitable = valStr.includes("UNSUITABLE") || valStr.includes("HIGH POROSITY") || valStr.includes("Flagged") || valStr.includes("Outside the normal");
                    return (
                      <div key={key} className="flex justify-between border-b border-border-color pb-3 items-center">
                        <span className="text-txt-tertiary font-semibold text-sm w-1/2">{key}</span>
                        <span className={`text-right font-mono font-bold py-1 px-3 rounded-2xl text-sm ${isUnsuitable ? 'bg-ui-error text-ui-errorText border border-ui-errorBorder' : 'bg-surface-hover text-txt-primary border border-ui-borderSubtle'}`}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {result.t1 && result.t2 && result.t1.valid && result.t2.valid && (
                  <p className="text-xs text-txt-tertiary mt-4">
                    Trial 1: {result.t1.value.toFixed(2)}% · Trial 2: {result.t2.value.toFixed(2)}% · reported mean: {result.mean?.toFixed(2)}% (IS 2386).
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-surface-default rounded-2xl p-4 sm:p-8 md:p-8 border-2 border-dashed border-ui-borderSubtle dark:border-ink-600 flex flex-col items-center justify-center text-center h-full min-h-[300px] w-full overflow-hidden">
                <Box className="w-12 h-12 text-txt-secondary mb-4" />
                <h3 className="text-lg font-medium text-txt-primary mb-4">Waiting for Input</h3>
                <p className="mt-2 max-w-sm text-base font-normal text-txt-secondary leading-relaxed">
                  Enter your test values on the left — results update live, and the mean of two trials is reported per IS 2386.
                </p>
              </div>
            )}

            <CalculationHistory
              calculatorId="aggregate_tests_v1"
              currentInputs={{
                activeTab,
                aiv1, aiv2, acv1, acv2, la1, la2, laMode, wa1, wa2
              }}
              currentResults={result.exportData}
              summaryGeneration={(ins, res) => `Aggregate Test: ${res["Test Type"]}`}
              onRestore={(ins) => {
                if (ins.activeTab) setActiveTab(ins.activeTab);
                if (ins.aiv1) setAiv1(ins.aiv1);
                if (ins.aiv2) setAiv2(ins.aiv2);
                if (ins.acv1) setAcv1(ins.acv1);
                if (ins.acv2) setAcv2(ins.acv2);
                if (ins.la1) setLa1(ins.la1);
                if (ins.la2) setLa2(ins.la2);
                if (ins.laMode) setLaMode(ins.laMode);
                if (ins.wa1) setWa1(ins.wa1);
                if (ins.wa2) setWa2(ins.wa2);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
