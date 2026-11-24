import React, { useState, useMemo } from 'react';
import { Layers, ShieldCheck, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from '../../lib/useRates';
import { designBeam, defaultBeamInputs, type SupportCondition  } from '../../lib/beamDesign';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';
import { formatRate } from '../../lib/rates';

const SUPPORT_CONDITIONS: Record<SupportCondition, { label: string }> = {
  "simply-supported": { label: "Simply Supported" },
  "continuous": { label: "Continuous" },
  "cantilever": { label: "Cantilever" },
};

export default function BeamDesignTool() {
  const { settings, formatCurrency } = useSettings();
  const { rates, setRate, table } = useRates();
  const [span, setSpan] = useState<number | "">(defaultBeamInputs.spanM);
  const [workingLoad, setWorkingLoad] = useState<number | "">(defaultBeamInputs.workingLoadKNm);
  const [safetyFactor, setSafetyFactor] = useState<number | "">(defaultBeamInputs.safetyFactor);
  const [width, setWidth] = useState<number | "">(defaultBeamInputs.widthMm);
  const [depth, setDepth] = useState<number | "">(defaultBeamInputs.depthMm);
  const [cover, setCover] = useState<number | "">(defaultBeamInputs.coverMm);
  const [fck, setFck] = useState<number | "">(defaultBeamInputs.fck);
  const [fy, setFy] = useState<number | "">(defaultBeamInputs.fy);
  const [supportCondition, setSupportCondition] = useState<SupportCondition>("simply-supported");
  const [mainDia, setMainDia] = useState<number | "">(defaultBeamInputs.mainDiaMm);
  const [stirrupDia, setStirrupDia] = useState<number | "">(defaultBeamInputs.stirrupDiaMm);
  const [stirrupLegs, setStirrupLegs] = useState<number | "">(defaultBeamInputs.stirrupLegs);
  const [selfWeight, setSelfWeight] = useState(true);
  const [wastage, setWastage] = useState<number | "">(5);

  const results = useMemo(() => designBeam({
    spanM: Number(span) || 0, workingLoadKNm: Number(workingLoad) || 0,
    safetyFactor: Number(safetyFactor) || 1.5, widthMm: Number(width) || 0,
    depthMm: Number(depth) || 0, coverMm: Number(cover) || 0,
    fck: Number(fck) || 0, fy: Number(fy) || 0, support: supportCondition,
    mainDiaMm: Number(mainDia) || 0, stirrupDiaMm: Number(stirrupDia) || 0,
    stirrupLegs: Number(stirrupLegs) || 2, selfWeight, beamLengthM: Number(span) || 0,
    wastagePct: Number(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  }), [span, workingLoad, safetyFactor, width, depth, cover, fck, fy, supportCondition, mainDia, stirrupDia, stirrupLegs, selfWeight, wastage, rates]);

  const handleSuggestSafetyFactor = () => {
    setSafetyFactor(settings.projectType === 'Commercial' || settings.projectType === 'Industrial' ? 1.6 : 1.5);
  };

  const summary = `Span ${span} m, ${supportCondition}; factored load ${results.factoredLoadKNm} kN/m; Mu ${results.muGoverningKNm} kNm (Mu,lim ${results.muLimKNm}); Ast ${results.astReqMm2} mm² → ${results.barsRequired}×${mainDia} mm (${results.astProvidedMm2} mm²); shear τv ${results.tauVMpa} MPa; Ld ${results.ldMm} mm; steel ${results.totalSteelKg} kg; concrete ${results.concreteVolM3} m³; cost ${results.totalCost == null ? '—' : formatCurrency(results.totalCost)}.`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight mb-4">
          <Layers className="text-ui-errorText" /> Beam Design (Limit State - IS 456)
        </h2>
        <p className="text-sm text-txt-secondary leading-relaxed mt-4">Beam design to IS 456:2000 (limit state) — bending, shear and deflection for simply supported, continuous and cantilever beams. A continuous beam is NOT designed as simply supported: support moments use wL²/10 and span moments wL²/12, steel is capped at Ast,max = 0.04·b·D, and compression steel uses the SP-16 Table F stress (not 0.87·fy) so Fe500 is not over-counted. Self-weight, wastage and Pakistan market rates are included; India / UAE rates show as — until you enter them.</p>
        <EngineNotices errors={results.errors} warnings={results.warnings} />
        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start mt-4">
          <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Geometry &amp; Loading</h3>
              <div className="space-y-4">
                <NumberInput label="Effective Span (L)" unit="m" value={span} onChange={setSpan} requirePositive />
                <NumberInput label="Working Load (w)" unit="kN/m" value={workingLoad} onChange={setWorkingLoad} requirePositive />
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <NumberInput label="Safety Factor (γf)" value={safetyFactor} onChange={setSafetyFactor} requirePositive />
                  </div>
                  <Button onClick={handleSuggestSafetyFactor}
                    className="h-11 px-4 bg-accent-50 hover:bg-accent-100 text-accent-800 rounded-full flex items-center justify-center transition-colors shadow-brand-sm text-base font-semibold active:scale-95 hover:-translate-y-0.5"
                    title="Suggested safety factor by project type (a lookup, not AI)"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" /> Suggest by project type
                  </Button>
                </div>
                <NumberInput label="Width (b)" unit="mm" value={width} onChange={setWidth} requirePositive />
                <NumberInput label="Overall Depth (D)" unit="mm" value={depth} onChange={setDepth} requirePositive />
                <label className="flex items-center gap-2 text-sm font-medium text-txt-secondary cursor-pointer">
                  <input type="checkbox" checked={selfWeight} onChange={(e) => setSelfWeight(e.target.checked)} className="w-4 h-4 text-accent-700" />
                  Include self-weight (25·b·D = {results.selfWeightKNm} kN/m)
                </label>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary mb-1">Support Condition</label>
                  <select value={supportCondition} onChange={(e) => setSupportCondition(e.target.value as SupportCondition)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    {Object.entries(SUPPORT_CONDITIONS).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Materials &amp; Reinforcement</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} requirePositive />
                <NumberInput label={<span className="flex items-center gap-1">Steel (fy) <CodeTooltip standard="IS" code="1786:2008" description="High strength deformed steel bars and wires for concrete reinforcement." /></span>} unit="MPa" value={fy} onChange={setFy} requirePositive />
                <NumberInput label="Main Bar Dia" unit="mm" value={mainDia} onChange={setMainDia} requirePositive />
                <NumberInput label={<span className="flex items-center gap-1">Cover <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span>} unit="mm" value={cover} onChange={setCover} requirePositive />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <NumberInput label="Stirrup Dia" unit="mm" value={stirrupDia} onChange={setStirrupDia} requirePositive />
                <NumberInput label="Stirrup Legs" value={stirrupLegs} onChange={setStirrupLegs} requirePositive />
                <NumberInput label="Wastage" unit="%" value={wastage} onChange={setWastage} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Rates ({table.currency} — {table.lastUpdated})</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Cement" unit={table.currency + "/bag"} value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                <NumberInput label="Steel" unit={table.currency + "/kg"} value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
                <NumberInput label="Sand" unit={table.currency + "/cft"} value={rates.sandPerCft ?? ""} onChange={(v) => setRate("sandPerCft", v === "" ? null : Number(v))} />
                <NumberInput label="Aggregate" unit={table.currency + "/cft"} value={rates.crushPerCft ?? ""} onChange={(v) => setRate("crushPerCft", v === "" ? null : Number(v))} />
              </div>
              <p className="text-xs text-txt-tertiary mt-2">{table.source}. Enter a rate where the table shows — (unverified).</p>
            </div>
          </div>

          <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col flex flex-col gap-6">
            <MaterialSummary title="Design Forces & Flexure" totalLabel="Required Main Tension Steel (Ast)" totalValue={results.astReqMm2.toFixed(0)} totalUnit="mm²" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Design Moment" value={results.muGoverningKNm.toFixed(1)} unit="kNm" variant="neutral" />
                <ResultCard title="Limiting Moment" value={results.muLimKNm.toFixed(1)} unit="kNm" variant="neutral" />
                <ResultCard title="Design Shear" value={results.vuKN.toFixed(1)} unit="kN" variant="neutral" />
                <ResultCard title="Section Type" value={results.doublyReinforced ? "Doubly" : "Singly"} unit="Reinforced" variant={results.doublyReinforced ? "warning" : "primary"} />
              </div>
              {supportCondition === "continuous" && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ResultCard title="Support Ast (wL²/10)" value={results.astSupportMm2.toFixed(0)} unit="mm²" variant="neutral" />
                  <ResultCard title="Span Ast (wL²/12)" value={results.astSpanMm2.toFixed(0)} unit="mm²" variant="neutral" />
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Bars" value={`${results.barsRequired}×${mainDia} mm`} unit={`${results.astProvidedMm2} mm²`} variant="neutral" />
                <ResultCard title="Ast,min" value={results.astMinMm2.toFixed(0)} unit="mm²" variant="neutral" />
                <ResultCard title="Ast,max (0.04·b·D)" value={results.astMaxMm2.toFixed(0)} unit="mm²" variant={results.astMaxOk ? "neutral" : "warning"} />
                <ResultCard title="Compression steel" value={results.ascMm2.toFixed(0)} unit={`mm² · fsc ${results.fscMpa} MPa`} variant={results.ascMm2 > 0 ? "warning" : "neutral"} />
              </div>
              {results.doublyReinforced && (
                <div className="mt-4 p-4 bg-accent-50 border border-accent-200 rounded-2xl flex items-start gap-3 overflow-hidden">
                  <AlertTriangle className="w-5 h-5 text-accent-800 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-accent-900 mb-1 text-base font-normal text-txt-secondary leading-relaxed">Doubly Reinforced Section</p>
                    <p className="text-accent-800 text-base font-normal text-txt-secondary leading-relaxed">Moment exceeds limiting moment capacity. Compression steel (Asc) required: <strong className="font-mono">{results.ascMm2.toFixed(0)} mm²</strong> at fsc = {results.fscMpa} MPa (SP-16 Table F).</p>
                  </div>
                </div>
              )}
            </MaterialSummary>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 responsive-tool-grid">
              <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${results.deflectionSafe ? "bg-ui-success border-ui-successBorder" : "bg-ui-error border-ui-errorBorder"}`}>
                <div className="flex items-center gap-2">
                  {results.deflectionSafe ? <CheckCircle2 className="text-ui-successText w-5 h-5" /> : <AlertTriangle className="text-ui-errorText w-5 h-5" />}
                  <h3 className={`font-bold ${results.deflectionSafe ? "text-ui-successText" : "text-ui-errorText"}`}>Deflection Control</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center text-sm"><span>Actual (L/d)</span><span className="font-mono font-bold">{results.actualLdRatio.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center text-sm"><span>Allowable (L/d)</span><span className="font-mono font-bold">{results.allowableLdRatio.toFixed(2)}</span></div>
                </div>
              </div>
              <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${results.shearSafe ? "bg-surface-hover border-ui-borderSubtle" : "bg-ui-error border-ui-errorBorder"}`}>
                <div className="flex items-center gap-2">
                  {results.shearSafe ? <ShieldCheck className="text-txt-secondary w-5 h-5" /> : <AlertTriangle className="text-ui-errorText w-5 h-5" />}
                  <h3 className={`font-bold ${results.shearSafe ? "text-txt-primary" : "text-ui-errorText"}`}>Shear &amp; Anchorage</h3>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center text-sm"><span>Nominal Shear (τv)</span><span className="font-mono font-bold">{results.tauVMpa.toFixed(2)} MPa</span></div>
                  <div className="flex justify-between items-center text-sm"><span>Concrete Capacity (τc)</span><span className="font-mono font-bold">{results.tauCMpa.toFixed(2)} MPa</span></div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-ui-borderSubtle"><span className="font-medium">Stirrup Spacing</span><span className="text-sm font-mono font-bold px-2 py-1 rounded bg-surface-default border border-ui-borderSubtle">{results.stirrupDesc}</span></div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-ui-borderSubtle mt-2"><span className="font-medium">Dev. Length (Ld)</span><span className="text-sm font-mono font-bold">{Math.ceil(results.ldMm)} mm</span></div>
                  <div className="flex justify-between items-center text-sm"><span>Stirrup cut length</span><span className="font-mono font-bold">{results.stirrupLengthMm} mm (IS 2502 detailed)</span></div>
                </div>
              </div>
            </div>

            <MaterialSummary title="Quantities & Cost" totalLabel="Total cost" totalValue={results.totalCost == null ? "—" : results.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Steel" value={results.totalSteelKg.toFixed(1)} unit="kg" variant="neutral" />
                <ResultCard title="Concrete" value={results.concreteVolM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Cement" value={String(results.materials.cementBags)} unit="bags" variant="neutral" />
                <ResultCard title="Sand / Agg" value={`${results.materials.sandCft.toFixed(0)} / ${results.materials.aggCft.toFixed(0)}`} unit="cft" variant="neutral" />
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {results.costLines.map((l) => (
                  <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                ))}
              </div>
            </MaterialSummary>

            <StructuralExportBar title="Beam Design (IS 456)" summaryText={summary}
              boqItems={[
                { description: `Cement for RCC beam ${width}×${depth} mm, L=${span} m`, quantity: results.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for beam concrete", quantity: results.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for beam concrete", quantity: results.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Steel reinforcement for beam", quantity: results.totalSteelKg, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={results.totalCost} />
            <CalcSteps steps={results.steps} />
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="beam_design" currentInputs={{ span, workingLoad, safetyFactor, width, depth, cover, fck, fy, supportCondition, mainDia, stirrupDia, stirrupLegs, selfWeight, wastage }}
        onRestore={(ins) => {
          if (ins.span != null) setSpan(ins.span as typeof span);
          if (ins.workingLoad != null) setWorkingLoad(ins.workingLoad as typeof workingLoad);
          if (ins.safetyFactor != null) setSafetyFactor(ins.safetyFactor as typeof safetyFactor);
          if (ins.width != null) setWidth(ins.width as typeof width);
          if (ins.depth != null) setDepth(ins.depth as typeof depth);
          if (ins.cover != null) setCover(ins.cover as typeof cover);
          if (ins.fck != null) setFck(ins.fck as typeof fck);
          if (ins.fy != null) setFy(ins.fy as typeof fy);
          if (ins.supportCondition != null) setSupportCondition(ins.supportCondition as typeof supportCondition);
          if (ins.mainDia != null) setMainDia(ins.mainDia as typeof mainDia);
          if (ins.stirrupDia != null) setStirrupDia(ins.stirrupDia as typeof stirrupDia);
          if (ins.stirrupLegs != null) setStirrupLegs(ins.stirrupLegs as typeof stirrupLegs);
          if (ins.selfWeight != null) setSelfWeight(ins.selfWeight as typeof selfWeight);
          if (ins.wastage != null) setWastage(ins.wastage as typeof wastage);
        }}
      />
    </div>
  );
}
