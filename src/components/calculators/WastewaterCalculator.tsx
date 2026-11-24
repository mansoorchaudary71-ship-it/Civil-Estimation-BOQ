import { Button } from '../ui/Button';
import React, { useMemo, useState } from 'react';
import { Droplets, Beaker, TestTube, Download, Printer, AlertTriangle, CheckCircle, Waves, Copy, Check } from 'lucide-react';
import { FormulaAccordion } from '../ui/FormulaAccordion';
import { CalculationHistory } from '../ui/CalculationHistory';
import SewerageEstimator from '../modules/SewerageEstimator';
import {
  PEQS_STATUS_LABEL,
  calcBod,
  calcCod,
  calcEffluentScreen,
  validateBodInputs,
  validateCodInputs,
} from '../../lib/wastewaterLabCalc';
import { PEQS_LIMITS_MG_L } from '../../lib/mepConstants';


type Tab = 'bod' | 'cod' | 'sewerage';

export function WastewaterCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('bod');

  const [initialDO, setInitialDO] = useState<number>(8.5);
  const [finalDO, setFinalDO] = useState<number>(3.2);
  const [bodSampleVol, setBodSampleVol] = useState<number>(10);
  const [bottleVol, setBottleVol] = useState<number>(300);
  const [blankInitialDO, setBlankInitialDO] = useState<number | "">("");
  const [blankFinalDO, setBlankFinalDO] = useState<number | "">("");

  const [vBlank, setVBlank] = useState<number>(25.0);
  const [vSample, setVSample] = useState<number>(12.5);
  const [normality, setNormality] = useState<number>(0.1);
  const [codSampleVol, setCodSampleVol] = useState<number>(50);
  const [tss, setTss] = useState<number | "">("");
  const [copied, setCopied] = useState(false);

  // All maths is client-side (pure functions in wastewaterLabCalc.ts).
  // The old /api fetches are deleted: those endpoints exist only in the
  // dev server and every production load failed.
  const bod = useMemo(() => {
    try {
      const inp = {
        initialDoMgL: initialDO, finalDoMgL: finalDO,
        sampleVolumeMl: bodSampleVol, bottleVolumeMl: bottleVol,
        blankInitialDoMgL: blankInitialDO === "" ? undefined : Number(blankInitialDO),
        blankFinalDoMgL: blankFinalDO === "" ? undefined : Number(blankFinalDO),
      };
      const errs = validateBodInputs(inp);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcBod(inp), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [initialDO, finalDO, bodSampleVol, bottleVol, blankInitialDO, blankFinalDO]);

  const cod = useMemo(() => {
    try {
      const inp = { blankTitrantMl: vBlank, sampleTitrantMl: vSample, normality, sampleVolumeMl: codSampleVol };
      const errs = validateCodInputs(inp);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcCod(inp), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [vBlank, vSample, normality, codSampleVol]);

  const screen = useMemo(() => {
    if (!bod.result || !cod.result) return null;
    try {
      return calcEffluentScreen({
        bod: { initialDoMgL: initialDO, finalDoMgL: finalDO, sampleVolumeMl: bodSampleVol, bottleVolumeMl: bottleVol },
        cod: { blankTitrantMl: vBlank, sampleTitrantMl: vSample, normality, sampleVolumeMl: codSampleVol },
        tssMgL: tss === "" ? undefined : Number(tss),
      });
    } catch {
      return null;
    }
  }, [bod.result, cod.result, initialDO, finalDO, bodSampleVol, bottleVol, vBlank, vSample, normality, codSampleVol, tss]);

  const activeResult = activeTab === 'bod' ? bod.result : cod.result;
  const activeErrors = activeTab === 'bod' ? bod.errors : cod.errors;
  const activeValue = activeTab === 'bod' ? bod.result?.bodMgL : cod.result?.codMgL;
  const activeStatus = activeTab === 'bod' ? bod.result?.status : cod.result?.status;

  const summaryText = `Wastewater testing (PEQS limits: BOD ${PEQS_LIMITS_MG_L.bodInland} mg/L inland / ${PEQS_LIMITS_MG_L.bodToSewer} to sewer; COD ${PEQS_LIMITS_MG_L.codInland} / ${PEQS_LIMITS_MG_L.codToSewer})\nBOD5 ${bod.result ? `${bod.result.bodMgL.toFixed(1)} mg/L — ${PEQS_STATUS_LABEL[bod.result.status]}` : "—"}\nCOD ${cod.result ? `${cod.result.codMgL.toFixed(1)} mg/L — ${PEQS_STATUS_LABEL[cod.result.status]}` : "—"}\n${screen ? `COD/BOD ratio ${screen.codBodRatio.toFixed(2)} — ${screen.codBodInterpretation}` : ""}${screen?.tssMgL != null ? `\nTSS ${screen.tssMgL} mg/L (limit ${PEQS_LIMITS_MG_L.tss} mg/L)` : ""}`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handleExport = () => {
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wastewater-results.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const numField = (label: string, value: number | "", onChange: (v: number) => void, step = "any", min?: number) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-txt-secondary">{label}</label>
      <input type="number" min={min} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-surface-hover border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
    </div>
  );

  const bodSteps = bod.result ? [
    { id: 1, label: "1. Dilution Factor (P)", theoretical: "P = Sample Volume / Total Bottle Volume", applied: `P = ${bodSampleVol} mL / ${bottleVol} mL = ${bod.result.dilutionFactorP.toFixed(4)}` },
    { id: 2, label: "2. DO Depletion", theoretical: "ΔDO = Initial DO - Final DO", applied: `ΔDO = ${initialDO} - ${finalDO} = ${bod.result.doDepletionMgL.toFixed(2)} mg/L` },
    { id: 3, label: "3. BOD₅ Calculation", theoretical: "BOD₅ = ΔDO / P", applied: `BOD₅ = ${bod.result.doDepletionMgL.toFixed(2)} / ${bod.result.dilutionFactorP.toFixed(4)} = ${bod.result.bodMgL.toFixed(2)} mg/L` },
  ] : [];
  const codSteps = cod.result ? [
    { id: 1, label: "1. Titrant Volume Difference", theoretical: "ΔV = Volume (Blank) - Volume (Sample)", applied: `ΔV = ${vBlank} - ${vSample} = ${cod.result.titrantDiffMl.toFixed(2)} mL` },
    { id: 2, label: "2. COD Calculation", theoretical: "COD = (ΔV × N × 8000) / Sample Volume\nWhere 8000 is the milliequivalent weight of oxygen in mg/L.", applied: `COD = (${cod.result.titrantDiffMl.toFixed(2)} × ${normality} × 8000) / ${codSampleVol} = ${cod.result.codMgL.toFixed(2)} mg/L` },
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-100 text-accent-800">
              <Droplets size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-txt-primary">Wastewater Testing Engine</h2>
              <p className="text-txt-secondary text-sm">Calculate BOD₅ and COD concentrations with standard procedures — all maths runs in your browser. PEQS limits: BOD {PEQS_LIMITS_MG_L.bodInland} mg/L inland / {PEQS_LIMITS_MG_L.bodToSewer} to sewer; COD {PEQS_LIMITS_MG_L.codInland} / {PEQS_LIMITS_MG_L.codToSewer}.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-surface-hover p-1 rounded-xl">
              <Button onClick={() => setActiveTab('bod')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bod' ? 'bg-surface-default text-txt-primary shadow-brand-sm' : 'text-txt-secondary hover:text-txt-primary'}`}>BOD₅ Test</Button>
              <Button onClick={() => setActiveTab('cod')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cod' ? 'bg-surface-default text-txt-primary shadow-brand-sm' : 'text-txt-secondary hover:text-txt-primary'}`}>COD Test</Button>
              <Button onClick={() => setActiveTab('sewerage')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sewerage' ? 'bg-surface-default text-txt-primary shadow-brand-sm' : 'text-txt-secondary hover:text-txt-primary'}`}><Waves size={16} className="inline mr-1" />Sewerage Design</Button>
            </div>
            <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover transition-colors">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover transition-colors">
              <Printer size={16} /> Print
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700 transition-colors shadow-brand-sm">
              <Download size={16} /> Export
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'sewerage' ? (
        <SewerageEstimator />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {activeTab === 'bod' ? (
              <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
                <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2 mb-4"><Beaker size={20} className="text-accent-600" /> BOD₅ Parameters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {numField("Initial DO (mg/L)", initialDO, setInitialDO, "0.1", 0)}
                  {numField("Final DO after 5 days (mg/L)", finalDO, setFinalDO, "0.1", 0)}
                  {numField("Sample Volume (mL)", bodSampleVol, setBodSampleVol, "1", 1)}
                  {numField("Total Bottle Volume (mL)", bottleVol, setBottleVol, "1", 1)}
                  {numField("Blank Initial DO (mg/L) — optional", blankInitialDO, (v) => setBlankInitialDO(v), "0.1", 0)}
                  {numField("Blank Final DO (mg/L) — optional", blankFinalDO, (v) => setBlankFinalDO(v), "0.1", 0)}
                </div>
                {bod.result?.validityErrors.map((e) => (
                  <p key={e} className="flex gap-2 text-sm text-accent-800 bg-accent-50 border border-accent-200 rounded-xl p-3"><AlertTriangle size={16} className="shrink-0 mt-0.5" /> {e}</p>
                ))}
              </div>
            ) : (
              <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-6">
                <h2 className="text-lg font-bold text-txt-primary flex items-center gap-2 mb-4"><TestTube size={20} className="text-accent-600" /> COD Titration Parameters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {numField("Titrant Vol for Blank (mL)", vBlank, setVBlank, "0.1", 0)}
                  {numField("Titrant Vol for Sample (mL)", vSample, setVSample, "0.1", 0)}
                  {numField("Normality of FAS (N)", normality, setNormality, "0.01", 0.001)}
                  {numField("Sample Volume (mL)", codSampleVol, setCodSampleVol, "1", 1)}
                </div>
              </div>
            )}
            <div className="bg-surface-default/80 backdrop-blur-xl rounded-2xl border border-ui-borderSubtle p-6 shadow-brand-sm space-y-4">
              <h2 className="text-lg font-bold text-txt-primary">Complete Effluent Screen</h2>
              {numField("Total Suspended Solids — TSS (mg/L, optional)", tss, (v) => setTss(v), "1", 0)}
              {screen && (
                <div className="text-sm text-txt-secondary space-y-1">
                  <p><strong className="text-txt-primary">COD/BOD ratio:</strong> {screen.codBodRatio.toFixed(2)} — {screen.codBodInterpretation}</p>
                  {screen.tssMgL != null && <p><strong className="text-txt-primary">TSS:</strong> {screen.tssMgL} mg/L — {screen.tssStatus === "meets-inland" ? `meets the PEQS limit of ${PEQS_LIMITS_MG_L.tss} mg/L` : `exceeds the PEQS limit of ${PEQS_LIMITS_MG_L.tss} mg/L`}</p>}
                  <p className="text-xs text-txt-tertiary">For a certified result, send the sample to an EPA-certified laboratory.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-ink rounded-2xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Droplets size={120} /></div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 relative z-10">
                <Beaker size={24} className="text-accent-400" />
                {activeTab === 'bod' ? 'BOD₅ Results' : 'COD Results'}
              </h2>
              {activeResult && activeValue != null && activeStatus ? (
                <div className="space-y-4 relative z-10">
                  <div className="bg-surface-default/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <div className="text-accent-200 text-sm font-medium mb-1">Calculated {activeTab === 'bod' ? 'BOD₅' : 'COD'}</div>
                    <div className="text-4xl font-black text-white">{activeValue.toFixed(2)} <span className="text-lg font-medium text-accent-200">mg/L</span></div>
                  </div>
                  <div className="rounded-2xl p-4 flex items-center gap-3 bg-surface-default/10 border border-white/20">
                    {activeStatus === "meets-inland" ? <CheckCircle className="text-ui-successText" size={24} /> : <AlertTriangle className="text-accent-400" size={24} />}
                    <div>
                      <div className="text-sm font-bold text-white">Environmental Status</div>
                      <div className="text-xs text-white/80">{PEQS_STATUS_LABEL[activeStatus]}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-ui-error border border-ui-errorBorder rounded-2xl p-4 flex items-center gap-3 text-ui-errorText relative z-10">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-medium">{activeErrors.length > 0 ? activeErrors.join(" ") : "Enter valid parameters."}</span>
                </div>
              )}
            </div>
            {activeTab === 'bod' && bod.result && <FormulaAccordion steps={bodSteps} />}
            {activeTab === 'cod' && cod.result && <FormulaAccordion steps={codSteps} />}
          </div>
        </div>
      )}

      <CalculationHistory calculatorId="wastewater_calculator" currentInputs={{ activeTab, initialDO, finalDO, bodSampleVol, bottleVol, blankInitialDO, blankFinalDO, vBlank, vSample, normality, codSampleVol, tss }} currentResults={bod.result || cod.result ? { bodMgL: bod.result?.bodMgL, codMgL: cod.result?.codMgL } : {}} onRestore={(ins) => {
          if (ins.activeTab != null) setActiveTab(ins.activeTab as typeof activeTab);
          if (ins.initialDO != null) setInitialDO(ins.initialDO as typeof initialDO);
          if (ins.finalDO != null) setFinalDO(ins.finalDO as typeof finalDO);
          if (ins.bodSampleVol != null) setBodSampleVol(ins.bodSampleVol as typeof bodSampleVol);
          if (ins.bottleVol != null) setBottleVol(ins.bottleVol as typeof bottleVol);
          if (ins.blankInitialDO != null) setBlankInitialDO(ins.blankInitialDO as typeof blankInitialDO);
          if (ins.blankFinalDO != null) setBlankFinalDO(ins.blankFinalDO as typeof blankFinalDO);
          if (ins.vBlank != null) setVBlank(ins.vBlank as typeof vBlank);
          if (ins.vSample != null) setVSample(ins.vSample as typeof vSample);
          if (ins.normality != null) setNormality(ins.normality as typeof normality);
          if (ins.codSampleVol != null) setCodSampleVol(ins.codSampleVol as typeof codSampleVol);
          if (ins.tss != null) setTss(ins.tss as typeof tss);
        }} />
    </div>
  );
}
