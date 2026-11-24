import React, { useState, useMemo } from 'react';
import { Columns, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Scatter, ResponsiveContainer, Legend } from 'recharts';
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from '../../lib/useRates';
import { designColumn, defaultColumnInputs, type EndCondition  } from '../../lib/columnDesign';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';
import { formatRate } from '../../lib/rates';

const END_CONDITIONS: Record<EndCondition, { label: string }> = {
  "fixed-fixed": { label: "Both Ends Fixed (0.65L)" },
  "fixed-pinned": { label: "One Fixed, One Pinned (0.8L)" },
  "pinned-pinned": { label: "Both Ends Pinned (1.0L)" },
  "fixed-free": { label: "One Fixed, One Free (2.0L)" },
};

export default function ColumnDesignTool() {
  const { settings } = useSettings();
  const { rates, setRate, table } = useRates();
  const [workingLoad, setWorkingLoad] = useState<number | "">(defaultColumnInputs.workingLoadKN);
  const [safetyFactor, setSafetyFactor] = useState<number | "">(defaultColumnInputs.safetyFactor);
  const [workingMoment, setWorkingMoment] = useState<number | "">(defaultColumnInputs.workingMomentKNm);
  const [workingMomentY, setWorkingMomentY] = useState<number | "">(0);
  const [length, setLength] = useState<number | "">(defaultColumnInputs.lengthM);
  const [endCondition, setEndCondition] = useState<EndCondition>("fixed-fixed");
  const [width, setWidth] = useState<number | "">(defaultColumnInputs.widthMm);
  const [depth, setDepth] = useState<number | "">(defaultColumnInputs.depthMm);
  const [fck, setFck] = useState<number | "">(defaultColumnInputs.fck);
  const [fy, setFy] = useState<number | "">(defaultColumnInputs.fy);
  const [rebarDia, setRebarDia] = useState<number | "">(defaultColumnInputs.barDiaMm);
  const [rebarCount, setRebarCount] = useState<number | "">(defaultColumnInputs.barCount);
  const [stirrupDia, setStirrupDia] = useState<number | "">(defaultColumnInputs.stirrupDiaMm);
  const [cover, setCover] = useState<number | "">(defaultColumnInputs.coverMm);
  const [shape, setShape] = useState<"rectangular" | "circular">("rectangular");
  const [wastage, setWastage] = useState<number | "">(5);

  const results = useMemo(() => designColumn({
    workingLoadKN: Number(workingLoad) || 0, workingMomentKNm: Number(workingMoment) || 0,
    workingMomentYKNm: Number(workingMomentY) || 0, safetyFactor: Number(safetyFactor) || 1.5,
    lengthM: Number(length) || 0, endCondition, widthMm: Number(width) || 0,
    depthMm: Number(depth) || 0, fck: Number(fck) || 0, fy: Number(fy) || 0,
    barDiaMm: Number(rebarDia) || 0, barCount: Number(rebarCount) || 0,
    stirrupDiaMm: Number(stirrupDia) || 0, coverMm: Number(cover) || 0,
    shape, wastagePct: Number(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  }), [workingLoad, workingMoment, workingMomentY, safetyFactor, length, endCondition, width, depth, fck, fy, rebarDia, rebarCount, stirrupDia, cover, shape, wastage, rates]);

  const handleSuggestSafetyFactor = () => {
    setSafetyFactor(settings.projectType === 'Commercial' || settings.projectType === 'Industrial' ? 1.6 : 1.5);
  };

  const summary = `Pu ${results.puKN} kN, Mu ${results.designMomentKNm} kNm (capacity ${results.capacityMKNm}); le ${results.leM} m, le/D ${results.leOverD} ${results.slenderD ? "slender" : "short"}; Asc ${results.ascMm2} mm² (${results.steelPct}%); Puz ${results.puzKN} kN; ties ${results.tieDiaMm} mm @ ${results.tieSpacingMm} mm (${results.tieCount} nos); steel ${results.totalSteelKg} kg; concrete ${results.concreteVolM3} m³; ${results.isSafe ? "SAFE" : "FAILS"}.`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in px-4 md:px-0">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight mb-4">
          <Columns className="text-ui-errorText" /> Column Design &amp; P-M Interaction
        </h2>
        <p className="text-sm text-txt-secondary leading-relaxed mt-4">Column design to IS 456:2000 — axial load plus uniaxial or biaxial bending (Cl. 39.6), with the real bar layout (bars are NOT assumed split half top / half bottom), slenderness about both axes, tie spacing and diameter to Cl. 26.5.3.2, and the 0.8–6% steel limits enforced as a pass/fail, not just a colour. Effective depth d = D − cover − φ/2.</p>
        <EngineNotices errors={results.errors} warnings={results.warnings} />
        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start mt-4">
          <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Loads &amp; Boundary</h3>
              <div className="space-y-4">
                <NumberInput label="Working Load (P)" unit="kN" value={workingLoad} onChange={setWorkingLoad} requirePositive />
                <NumberInput label="Working Moment (Mx)" unit="kNm" value={workingMoment} onChange={setWorkingMoment} />
                <NumberInput label="Working Moment (My) — biaxial, 0 = uniaxial" unit="kNm" value={workingMomentY} onChange={setWorkingMomentY} />
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <NumberInput label="Safety Factor (γf)" value={safetyFactor} onChange={setSafetyFactor} requirePositive />
                  </div>
                  <Button onClick={handleSuggestSafetyFactor} className="h-11 px-4 bg-accent-50 hover:bg-accent-100 text-accent-800 rounded-full flex items-center justify-center transition-colors shadow-brand-sm text-base font-semibold active:scale-95 hover:-translate-y-0.5" title="Suggested safety factor by project type (a lookup, not AI)">
                    <Sparkles className="w-4 h-4 mr-1.5" /> Suggest by project type
                  </Button>
                </div>
                <NumberInput label="Unsupported Length (L)" unit="m" value={length} onChange={setLength} requirePositive />
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary mb-1">End Condition</label>
                  <select value={endCondition} onChange={(e) => setEndCondition(e.target.value as EndCondition)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    {Object.entries(END_CONDITIONS).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary mb-1">Section Shape</label>
                  <select value={shape} onChange={(e) => setShape(e.target.value as "rectangular" | "circular")} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="rectangular">Rectangular</option>
                    <option value="circular">Circular</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Section &amp; Materials</h3>
              <div className="grid grid-cols-2 gap-4">
                {shape === "rectangular" && (
                  <NumberInput label="Width (B)" unit="mm" value={width} onChange={setWidth} requirePositive />
                )}
                <NumberInput label={shape === "circular" ? "Diameter (D)" : "Depth (D)"} unit="mm" value={depth} onChange={setDepth} requirePositive />
                <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} requirePositive />
                <NumberInput label={<span className="flex items-center gap-1">Steel (fy) <CodeTooltip standard="IS" code="1786:2008" description="High strength deformed steel bars and wires for concrete reinforcement." /></span>} unit="MPa" value={fy} onChange={setFy} requirePositive />
              </div>
            </div>
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Reinforcement</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Bar Dia" unit="mm" value={rebarDia} onChange={setRebarDia} requirePositive />
                <NumberInput label="No. of Bars" value={rebarCount} onChange={setRebarCount} requirePositive />
                <NumberInput label="Tie / Stirrup Dia" unit="mm" value={stirrupDia} onChange={setStirrupDia} requirePositive />
                <NumberInput label="Wastage" unit="%" value={wastage} onChange={setWastage} />
                <div className="col-span-2">
                  <NumberInput label={<span className="flex items-center">Clear Cover <CodeTooltip standard="IS" code="456:2000" description="Nominal cover to meet durability requirements (Table 16)." /></span>} unit="mm" value={cover} onChange={setCover} requirePositive />
                </div>
              </div>
              <p className="text-xs text-txt-tertiary mt-2">Bars are laid out explicitly (2 top + 2 bottom + the rest on the side faces) and the P–M curve sums each bar at its own depth — not a half/half split. Effective depth d = D − cover − φ/2 = {results.dMm} mm.</p>
            </div>
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary mb-4">Rates ({table.currency} — {table.lastUpdated})</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Cement" unit={table.currency + "/bag"} value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                <NumberInput label="Steel" unit={table.currency + "/kg"} value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
                <NumberInput label="Sand" unit={table.currency + "/cft"} value={rates.sandPerCft ?? ""} onChange={(v) => setRate("sandPerCft", v === "" ? null : Number(v))} />
                <NumberInput label="Aggregate" unit={table.currency + "/cft"} value={rates.crushPerCft ?? ""} onChange={(v) => setRate("crushPerCft", v === "" ? null : Number(v))} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col flex flex-col gap-6">
            <MaterialSummary title="Capacity & Verification" totalLabel="Reinforcement Area" totalValue={results.ascMm2.toFixed(0)} totalUnit="mm²" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Effective Length" value={results.leM.toFixed(2)} unit="m" variant="neutral" />
                <ResultCard title="Ratio (le/D)" value={results.leOverD.toFixed(1)} unit={results.slenderD ? "Slender" : "Short"} variant={results.slenderD ? "primary" : "neutral"} />
                <ResultCard title="Ratio (le/B)" value={results.leOverB.toFixed(1)} unit={results.slenderB ? "Slender" : "Short"} variant={results.slenderB ? "primary" : "neutral"} />
                <ResultCard title="Steel %" value={results.steelPct.toFixed(2)} unit="%" variant={results.steelLimitsOk ? "neutral" : "warning"} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Design Moment" value={results.designMomentKNm.toFixed(1)} unit="kNm" variant="neutral" />
                <ResultCard title="Capacity M" value={results.capacityMKNm.toFixed(1)} unit="kNm" variant="neutral" />
                <ResultCard title="Puz" value={results.puzKN.toFixed(0)} unit="kN" variant="neutral" />
                <ResultCard title="Linear check" value={results.linearCheck.toFixed(2)} unit="Pu/Puz+Mu/Muz ≤ 1" variant={results.linearOk ? "neutral" : "warning"} />
              </div>
              {results.biaxialRatio != null && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ResultCard title="Biaxial (Cl. 39.6)" value={results.biaxialRatio.toFixed(2)} unit="≤ 1" variant={results.biaxialOk ? "neutral" : "warning"} />
                  <ResultCard title="α (Pu/Puz)" value={String(results.alphaBiaxial)} unit="" variant="neutral" />
                </div>
              )}
              <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between border ${results.isSafe ? "bg-ui-success border-ui-successBorder" : "bg-ui-error border-ui-errorBorder"}`}>
                <div className="flex items-center gap-3">
                  {results.isSafe ? <CheckCircle2 className="text-ui-successText w-6 h-6" /> : <AlertTriangle className="text-ui-errorText w-6 h-6" />}
                  <div>
                    <h4 className={`font-bold ${results.isSafe ? "text-ui-successText" : "text-ui-errorText"}`}>{results.isSafe ? "Section is Safe" : "Section Fails"}</h4>
                    <p className={`text-sm ${results.isSafe ? "text-ui-successText" : "text-ui-errorText"}`}>Applied M: {results.designMomentKNm.toFixed(1)} kNm | Capacity M: {results.capacityMKNm.toFixed(1)} kNm</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ResultCard title="Tie dia" value={String(results.tieDiaMm)} unit="mm" variant="neutral" />
                <ResultCard title="Tie spacing" value={String(results.tieSpacingMm)} unit="mm" variant="neutral" />
                <ResultCard title="Ties" value={String(results.tieCount)} unit="nos" variant="neutral" />
                <ResultCard title="e_min" value={String(results.eMinMm)} unit="mm" variant="neutral" />
              </div>
            </MaterialSummary>

            <div className="bg-surface-hover border border-border-color rounded-2xl p-4 sm:p-6 flex-1 min-h-[400px] overflow-hidden">
              <h3 className="mb-4 text-lg font-medium text-txt-primary">P-M Interaction Diagram (IS 456)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E4DE" />
                  <XAxis type="number" dataKey="M" name="Moment" label={{ value: 'Moment (kNm)', position: 'insideBottom', offset: -10 }} />
                  <YAxis type="number" dataKey="P" name="Axial Load" label={{ value: 'Axial Load (kN)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => Number(value).toFixed(1)} />
                  <Legend verticalAlign="top" height={36} />
                  <Line data={results.curve} type="monotone" dataKey="P" stroke="#B91C1C" strokeWidth={3} dot={false} name="Capacity Envelope" isAnimationActive={false} />
                  <Scatter name="Applied Load (Pu, Mu)" data={[{ M: results.designMomentKNm, P: results.puKN }]} fill={results.isSafe ? "#16A34A" : "#B91C1C"} shape="circle" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <MaterialSummary title="Quantities & Cost" totalLabel="Total cost" totalValue={results.totalCost == null ? "—" : results.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Long. steel" value={results.longSteelKg.toFixed(1)} unit="kg" variant="neutral" />
                <ResultCard title="Tie steel" value={results.tieSteelKg.toFixed(1)} unit="kg" variant="neutral" />
                <ResultCard title="Concrete" value={results.concreteVolM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Cement" value={String(results.materials.cementBags)} unit="bags" variant="neutral" />
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {results.costLines.map((l) => (
                  <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                ))}
              </div>
            </MaterialSummary>
            <StructuralExportBar title="Column Design (IS 456)" summaryText={summary}
              boqItems={[
                { description: `Cement for RCC column ${width}×${depth} mm`, quantity: results.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for column concrete", quantity: results.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for column concrete", quantity: results.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Steel reinforcement for column", quantity: results.totalSteelKg, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={results.totalCost} />
            <CalcSteps steps={results.steps} />
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="column_interaction" currentInputs={{ workingLoad, workingMoment, workingMomentY, safetyFactor, length, endCondition, width, depth, fck, fy, rebarDia, rebarCount, stirrupDia, cover, shape, wastage }}
        onRestore={(ins) => {
          if (ins.workingLoad != null) setWorkingLoad(ins.workingLoad as typeof workingLoad);
          if (ins.safetyFactor != null) setSafetyFactor(ins.safetyFactor as typeof safetyFactor);
          if (ins.workingMoment != null) setWorkingMoment(ins.workingMoment as typeof workingMoment);
          if (ins.workingMomentY != null) setWorkingMomentY(ins.workingMomentY as typeof workingMomentY);
          if (ins.length != null) setLength(ins.length as typeof length);
          if (ins.endCondition != null) setEndCondition(ins.endCondition as typeof endCondition);
          if (ins.width != null) setWidth(ins.width as typeof width);
          if (ins.depth != null) setDepth(ins.depth as typeof depth);
          if (ins.fck != null) setFck(ins.fck as typeof fck);
          if (ins.fy != null) setFy(ins.fy as typeof fy);
          if (ins.rebarDia != null) setRebarDia(ins.rebarDia as typeof rebarDia);
          if (ins.rebarCount != null) setRebarCount(ins.rebarCount as typeof rebarCount);
          if (ins.stirrupDia != null) setStirrupDia(ins.stirrupDia as typeof stirrupDia);
          if (ins.cover != null) setCover(ins.cover as typeof cover);
          if (ins.shape != null) setShape(ins.shape as typeof shape);
          if (ins.wastage != null) setWastage(ins.wastage as typeof wastage);
        }}
      />
    </div>
  );
}
