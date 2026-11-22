import React, { useState, useMemo } from 'react';
import { Pickaxe } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from '../../lib/useRates';
import { designPile, defaultPileInputs, type PileType, type SoilType  } from '../../lib/pileCalc';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';
import { formatRate } from '../../lib/rates';
import { useSettings } from '../../context/SettingsContext';

export default function PileFoundationCalculator() {
  const { rates, setRate, table } = useRates();
  const { formatCurrency } = useSettings();
  const [pileType, setPileType] = useState<PileType>("bored");
  const [soilType, setSoilType] = useState<SoilType>("sand");
  const [diameter, setDiameter] = useState<number | "">(0.5);
  const [length, setLength] = useState<number | "">(15);
  const [gamma, setGamma] = useState<number | "">(18);
  const [cu, setCu] = useState<number | "">(50);
  const [phi, setPhi] = useState<number | "">(32);
  const [fos, setFos] = useState<number | "">(2.5);
  const [totalLoad, setTotalLoad] = useState<number | "">(5000);
  const [rows, setRows] = useState<number | "">(2);
  const [cols, setCols] = useState<number | "">(3);
  const [spacing, setSpacing] = useState<number | "">(1.5);
  const [capL, setCapL] = useState<number | "">(3.5);
  const [capW, setCapW] = useState<number | "">(2.0);
  const [capD, setCapD] = useState<number | "">(0.8);
  const [fck, setFck] = useState<number | "">(25);
  const [wastage, setWastage] = useState<number | "">(5);

  const results = useMemo(() => designPile({
    pileType, soilType, diameterM: Number(diameter) || 0, lengthM: Number(length) || 0,
    layers: [{ thicknessM: Number(length) || 0, gammaKNm3: Number(gamma) || 0, cuKPa: Number(cu) || 0, phiDeg: Number(phi) || 0 }],
    fos: Number(fos) || 2.5, totalLoadKN: Number(totalLoad) || 0,
    groupRows: Number(rows) || 1, groupCols: Number(cols) || 1, spacingM: Number(spacing) || 0,
    capLengthM: Number(capL) || 0, capWidthM: Number(capW) || 0, capDepthM: Number(capD) || 0,
    fck: Number(fck) || 0, wastagePct: Number(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  }), [pileType, soilType, diameter, length, gamma, cu, phi, fos, totalLoad, rows, cols, spacing, capL, capW, capD, fck, wastage, rates]);

  const summary = `Pile ${pileType} ${soilType} D=${diameter} m L=${length} m: Qb ${results.qbKN} kN, Qs ${results.qsKN} kN, Qu ${results.quKN} kN, Qall ${results.qallKN} kN; piles required ${results.requiredPiles}; group η ${results.groupEta}, group ultimate ${results.groupUltimateKN} kN, group allowable ${results.groupCapacityKN} kN vs load ${totalLoad} kN (${results.groupCapacityKN >= (Number(totalLoad) || 0) ? "PASS" : "FAIL"}) (${results.groupGoverns}); settlement ≈ ${results.settlementMm} mm; concrete ${results.concreteVolM3} m³; steel ${results.totalSteelKg} kg; cost ${results.totalCost == null ? "—" : formatCurrency(results.totalCost)}.`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 px-4 md:px-0">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 text-txt-primary flex items-center gap-2">
          <Pickaxe className="text-accent-700" /> Pile Foundation (IS 2911)
        </h2>
        <p className="text-sm text-txt-secondary leading-relaxed mt-4">Pile capacity to IS 2911 — bored and driven piles in clay (α-method) and sand (β-method), layered soils, group efficiency by Converse–Labarre, block failure in clay, and the number of piles needed for the column load. End bearing and skin friction are shown separately so you can see which one governs.</p>
        <EngineNotices errors={results.errors} warnings={results.warnings} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Pile &amp; Soil</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Pile type</label>
                  <select value={pileType} onChange={(e) => setPileType(e.target.value as PileType)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="bored">Bored</option>
                    <option value="driven">Driven</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Soil type</label>
                  <select value={soilType} onChange={(e) => setSoilType(e.target.value as SoilType)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="sand">Sand (β-method)</option>
                    <option value="clay">Clay (α-method)</option>
                  </select>
                </div>
                <NumberInput label="Pile diameter (D)" unit="m" value={diameter} onChange={setDiameter} requirePositive />
                <NumberInput label="Pile length (L)" unit="m" value={length} onChange={setLength} requirePositive />
                <NumberInput label="Soil unit weight (γ)" unit="kN/m³" value={gamma} onChange={setGamma} requirePositive />
                {soilType === "clay"
                  ? <NumberInput label={<span className="flex items-center gap-1">Undrained cohesion (cu) <CodeTooltip standard="IS" code="2911" description="Design and construction of pile foundations." /></span>} unit="kPa" value={cu} onChange={setCu} requirePositive />
                  : <NumberInput label="Friction angle (φ)" unit="°" value={phi} onChange={setPhi} requirePositive />}
                <NumberInput label="Factor of safety" value={fos} onChange={setFos} requirePositive />
                <NumberInput label="Total column load (P)" unit="kN" value={totalLoad} onChange={setTotalLoad} requirePositive />
              </div>
              <p className="text-xs text-txt-tertiary mt-2">Single uniform soil layer is used here. For layered soils, split the length into layers in the engine (layers array) — the α/β methods sum each layer separately. Sand β defaults to 0.35, a conservative bored-pile value (β = tan(φ − 5°) ≈ 0.51 at φ = 32°); bored piles lose shaft friction to borehole softening, so the lower value is deliberate.</p>
            </div>
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Group &amp; Cap</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Group rows (m)" value={rows} onChange={setRows} requirePositive />
                <NumberInput label="Group columns (n)" value={cols} onChange={setCols} requirePositive />
                <NumberInput label="Spacing (s)" unit="m" value={spacing} onChange={setSpacing} requirePositive />
                <NumberInput label="Cap length" unit="m" value={capL} onChange={setCapL} requirePositive />
                <NumberInput label="Cap width" unit="m" value={capW} onChange={setCapW} requirePositive />
                <NumberInput label="Cap depth" unit="m" value={capD} onChange={setCapD} requirePositive />
                <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} requirePositive />
                <NumberInput label="Wastage" unit="%" value={wastage} onChange={setWastage} />
                <NumberInput label="Cement" unit={table.currency + "/bag"} value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                <NumberInput label="Steel" unit={table.currency + "/kg"} value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <MaterialSummary title="Single Pile Capacity" totalLabel="Allowable capacity (Qall)" totalValue={results.qallKN.toFixed(0)} totalUnit="kN" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="End bearing (Qb)" value={results.qbKN.toFixed(0)} unit="kN" variant="neutral" />
                <ResultCard title="Skin friction (Qs)" value={results.qsKN.toFixed(0)} unit="kN" variant="neutral" />
                <ResultCard title="Ultimate (Qu)" value={results.quKN.toFixed(0)} unit="kN" variant="neutral" />
                <ResultCard title="Piles required" value={String(results.requiredPiles)} unit="nos" variant={results.requiredPiles <= (Number(rows) || 1) * (Number(cols) || 1) ? "neutral" : "warning"} />
                <ResultCard title="Piles installed (m × n)" value={String((Number(rows) || 1) * (Number(cols) || 1))} unit="nos" variant="neutral" />
              </div>
            </MaterialSummary>
            <MaterialSummary title="Group Capacity" totalLabel="Group allowable capacity" totalValue={results.groupCapacityKN.toFixed(0)} totalUnit="kN" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Efficiency η" value={results.groupEta.toFixed(2)} unit="" variant="neutral" />
                <ResultCard title="Governs" value={results.groupGoverns === "block failure" ? "Block" : "Group"} unit="" variant={results.groupGoverns === "block failure" ? "warning" : "neutral"} />
                <ResultCard title="Allowable per pile" value={results.groupCapacityPerPileKN.toFixed(0)} unit="kN" variant="neutral" />
                <ResultCard title="Settlement ≈" value={results.settlementMm.toFixed(1)} unit="mm" variant="neutral" />
              </div>
              <p className="text-sm text-txt-secondary mt-3">Group ultimate {results.groupUltimateKN.toFixed(0)} kN · allowable {results.groupCapacityKN.toFixed(0)} kN vs load {Number(totalLoad) || 0} kN — <strong>{results.groupCapacityKN >= (Number(totalLoad) || 0) ? "PASS" : "FAIL"}</strong>. Concrete and steel below are costed on the {(Number(rows) || 1) * (Number(cols) || 1)} installed piles, not the {results.requiredPiles} required — the cap is sized for the installed group.</p>
              {results.blockCapacityKN != null && <p className="text-sm text-txt-secondary mt-3">Block failure capacity: {results.blockCapacityKN.toFixed(0)} kN.</p>}
            </MaterialSummary>
            <MaterialSummary title="Quantities & Cost" totalLabel="Total cost" totalValue={results.totalCost == null ? "—" : results.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Pile concrete" value={results.pileConcreteM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Cap concrete" value={results.capConcreteM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Pile steel" value={results.pileSteelKg.toFixed(1)} unit="kg" variant="neutral" />
                <ResultCard title="Cap steel" value={results.capSteelKg.toFixed(1)} unit="kg" variant="neutral" />
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {results.costLines.map((l) => (
                  <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                ))}
              </div>
            </MaterialSummary>
            <StructuralExportBar title="Pile Foundation (IS 2911)" summaryText={summary}
              boqItems={[
                { description: `Cement for ${(Number(rows) || 1) * (Number(cols) || 1)} installed piles + cap`, quantity: results.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for pile + cap concrete", quantity: results.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for pile + cap concrete", quantity: results.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Steel reinforcement for piles + cap", quantity: results.totalSteelKg, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={results.totalCost} />
            <CalcSteps steps={results.steps} />
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="pilefoundationcalculator_tool" currentInputs={{ pileType, soilType, diameter, length, gamma, cu, phi, fos, totalLoad, rows, cols, spacing, capL, capW, capD, fck, wastage }} />
    </div>
  );
}
