import React, { useState, useMemo } from 'react';
import { Grid2X2 } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from '../../lib/useRates';
import { designRaft, defaultRaftInputs  } from '../../lib/raftCalc';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';
import { formatRate } from '../../lib/rates';

export default function RaftFoundationDesigner() {
  const { rates, setRate, table } = useRates();
  const [length, setLength] = useState<number | "">(defaultRaftInputs.lengthM);
  const [width, setWidth] = useState<number | "">(defaultRaftInputs.widthM);
  const [thickness, setThickness] = useState<number | "">(defaultRaftInputs.thicknessM);
  const [totalLoad, setTotalLoad] = useState<number | "">(defaultRaftInputs.totalLoadKN);
  const [ex, setEx] = useState<number | "">(defaultRaftInputs.exM);
  const [ey, setEy] = useState<number | "">(defaultRaftInputs.eyM);
  const [sbc, setSbc] = useState<number | "">(defaultRaftInputs.sbcKNm2);
  const [es, setEs] = useState<number | "">(defaultRaftInputs.soilModulusMPa);
  const [cc, setCc] = useState<number | "">(defaultRaftInputs.cc);
  const [clayH, setClayH] = useState<number | "">(defaultRaftInputs.clayThicknessM);
  const [e0, setE0] = useState<number | "">(defaultRaftInputs.e0);
  const [sigV0, setSigV0] = useState<number | "">(defaultRaftInputs.sigmaV0KPa);
  const [fck, setFck] = useState<number | "">(defaultRaftInputs.fck);
  const [fy, setFy] = useState<number | "">(defaultRaftInputs.fy);
  const [colSize, setColSize] = useState<number | "">(defaultRaftInputs.colSizeMm);
  const [colLoad, setColLoad] = useState<number | "">(defaultRaftInputs.colLoadKN);
  const [cover, setCover] = useState<number | "">(defaultRaftInputs.coverMm);
  const [wastage, setWastage] = useState<number | "">(5);

  const results = useMemo(() => designRaft({
    lengthM: Number(length) || 0, widthM: Number(width) || 0, thicknessM: Number(thickness) || 0,
    totalLoadKN: Number(totalLoad) || 0, exM: Number(ex) || 0, eyM: Number(ey) || 0,
    sbcKNm2: Number(sbc) || 0, soilModulusMPa: Number(es) || 0, cc: Number(cc) || 0,
    clayThicknessM: Number(clayH) || 0, e0: Number(e0) || 0, sigmaV0KPa: Number(sigV0) || 0,
    fck: Number(fck) || 0, fy: Number(fy) || 0, colSizeMm: Number(colSize) || 0,
    colLoadKN: Number(colLoad) || 0, coverMm: Number(cover) || 0, wastagePct: Number(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  }), [length, width, thickness, totalLoad, ex, ey, sbc, es, cc, clayH, e0, sigV0, fck, fy, colSize, colLoad, cover, wastage, rates]);

  const summary = `Raft ${length}×${width}×${thickness} m; q_avg ${results.qAvgKPa} kPa, qmax ${results.qMaxKPa}, qmin ${results.qMinKPa} (SBC ${sbc}); settlement ${results.settlementTotalMm} mm (immediate ${results.settlementImmediateMm} + consolidation ${results.settlementConsolidationMm}); punching utilisation ${(results.punchingUtil * 100).toFixed(0)}%; Ast ${results.astTopMm2PerM} mm²/m top+bottom each way; concrete ${results.concreteVolM3} m³; steel ${results.steelKg} kg; cost ${results.totalCost == null ? "—" : `Rs ${results.totalCost.toLocaleString()}`}.`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 px-4 md:px-0">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="text-xl font-bold mb-6 text-txt-primary flex items-center gap-2">
          <Grid2X2 className="text-accent-700" /> Raft Foundation Design (IS 2950)
        </h2>
        <p className="text-sm text-txt-secondary leading-relaxed mt-4">Raft (mat) foundation design to IS 2950 / IS 456 — bearing pressures with eccentricity and the kern check, immediate and consolidation settlement, punching shear under columns, and strip flexure with steel. Enter the column grid and loads; the tool checks that the resultant stays inside the middle third and that settlement stays within limits.</p>
        <EngineNotices errors={results.errors} warnings={results.warnings} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Raft &amp; Load</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Raft Length (L)" unit="m" value={length} onChange={setLength} requirePositive />
                <NumberInput label="Raft Width (B)" unit="m" value={width} onChange={setWidth} requirePositive />
                <NumberInput label="Thickness (D)" unit="m" value={thickness} onChange={setThickness} requirePositive />
                <NumberInput label="Total Service Load (P)" unit="kN" value={totalLoad} onChange={setTotalLoad} requirePositive />
                <NumberInput label="Eccentricity ex" unit="m" value={ex} onChange={setEx} />
                <NumberInput label="Eccentricity ey" unit="m" value={ey} onChange={setEy} />
                <NumberInput label={<span className="flex items-center gap-1">Soil Bearing Capacity <CodeTooltip standard="IS" code="1904:1986" description="Design and construction of foundations in soils: General requirements." /></span>} unit="kN/m²" value={sbc} onChange={setSbc} requirePositive />
                <NumberInput label="Soil Modulus (Es)" unit="MPa" value={es} onChange={setEs} requirePositive />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Clay Layer (consolidation — 0 skips it)</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Compression Index (Cc)" value={cc} onChange={setCc} />
                <NumberInput label="Clay Thickness (Hc)" unit="m" value={clayH} onChange={setClayH} />
                <NumberInput label="Initial Void Ratio (e0)" value={e0} onChange={setE0} />
                <NumberInput label="σ′v0" unit="kPa" value={sigV0} onChange={setSigV0} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Column &amp; Materials</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Column Size" unit="mm" value={colSize} onChange={setColSize} requirePositive />
                <NumberInput label="Column Load" unit="kN" value={colLoad} onChange={setColLoad} requirePositive />
                <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} requirePositive />
                <NumberInput label="Steel (fy)" unit="MPa" value={fy} onChange={setFy} requirePositive />
                <NumberInput label="Cover" unit="mm" value={cover} onChange={setCover} requirePositive />
                <NumberInput label="Wastage" unit="%" value={wastage} onChange={setWastage} />
                <NumberInput label="Cement" unit={table.currency + "/bag"} value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                <NumberInput label="Steel" unit={table.currency + "/kg"} value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <MaterialSummary title="Bearing Pressure" totalLabel="Max Pressure (qmax)" totalValue={results.qMaxKPa.toFixed(0)} totalUnit="kPa" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="q_avg" value={results.qAvgKPa.toFixed(0)} unit="kPa" variant="neutral" />
                <ResultCard title="qmax" value={results.qMaxKPa.toFixed(0)} unit="kPa" variant={results.bearingOk ? "neutral" : "warning"} />
                <ResultCard title="qmin" value={results.qMinKPa.toFixed(0)} unit="kPa" variant="neutral" />
                <ResultCard title="Kern check" value={results.kernOk ? "Inside" : "Outside"} unit="middle third" variant={results.kernOk ? "primary" : "warning"} />
              </div>
            </MaterialSummary>
            <MaterialSummary title="Settlement" totalLabel="Total Settlement" totalValue={results.settlementTotalMm.toFixed(0)} totalUnit="mm" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <ResultCard title="Immediate" value={results.settlementImmediateMm.toFixed(1)} unit="mm" variant="neutral" />
                <ResultCard title="Consolidation" value={results.settlementConsolidationMm.toFixed(1)} unit="mm" variant="neutral" />
                <ResultCard title="Limit 50 mm" value={results.settlementOk ? "PASS" : "FAIL"} unit="" variant={results.settlementOk ? "primary" : "warning"} />
              </div>
            </MaterialSummary>
            <MaterialSummary title="Punching & Flexure" totalLabel="Steel (each way, top + bottom)" totalValue={results.astTopMm2PerM.toFixed(0)} totalUnit="mm²/m" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Punching τv" value={results.punchingTauVMpa.toFixed(2)} unit="MPa" variant={results.punchingOk ? "neutral" : "warning"} />
                <ResultCard title="Allowable" value={results.punchingAllowMpa.toFixed(2)} unit="MPa" variant="neutral" />
                <ResultCard title="Utilisation" value={(results.punchingUtil * 100).toFixed(0)} unit="%" variant={results.punchingOk ? "neutral" : "warning"} />
                <ResultCard title="Strip Mu" value={results.muStripKNmPerM.toFixed(1)} unit="kNm/m" variant="neutral" />
              </div>
            </MaterialSummary>
            <MaterialSummary title="Quantities & Cost" totalLabel="Total cost" totalValue={results.totalCost == null ? "—" : results.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Concrete" value={results.concreteVolM3.toFixed(1)} unit="m³" variant="neutral" />
                <ResultCard title="Steel" value={results.steelKg.toFixed(0)} unit="kg" variant="neutral" />
                <ResultCard title="Cement" value={String(results.materials.cementBags)} unit="bags" variant="neutral" />
                <ResultCard title="Formwork" value={results.formworkM2.toFixed(1)} unit="m²" variant="neutral" />
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {results.costLines.map((l) => (
                  <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                ))}
              </div>
            </MaterialSummary>
            <StructuralExportBar title="Raft Foundation (IS 2950)" summaryText={summary}
              boqItems={[
                { description: `Cement for raft ${length}×${width} m`, quantity: results.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for raft concrete", quantity: results.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for raft concrete", quantity: results.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Steel reinforcement for raft", quantity: results.steelKg, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={results.totalCost} />
            <CalcSteps steps={results.steps} />
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="raftfoundationdesigner_tool" currentInputs={{ length, width, thickness, totalLoad, ex, ey, sbc, es, cc, clayH, e0, sigV0, fck, fy, colSize, colLoad, cover, wastage }} />
    </div>
  );
}
