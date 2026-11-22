import React, { useState, useMemo } from 'react';
import { Waves } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';
import { MaterialSummary } from '../ui/MaterialSummary';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { useRates } from '../../lib/useRates';
import { designWaterTank, defaultWaterTankInputs, type TankShape, type TankPlacement, type BarType  } from '../../lib/waterTankCalc';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';
import { formatRate } from '../../lib/rates';
import { useSettings } from '../../context/SettingsContext';

export default function WaterTankDesign() {
  const { rates, setRate, table } = useRates();
  const { formatCurrency } = useSettings();
  const [shape, setShape] = useState<TankShape>("rectangular");
  const [placement, setPlacement] = useState<TankPlacement>("overhead");
  const [occupants, setOccupants] = useState<number | "">(5);
  const [lpcd, setLpcd] = useState<number | "">(135);
  const [days, setDays] = useState<number | "">(2);
  const [length, setLength] = useState<number | "">(4.5);
  const [width, setWidth] = useState<number | "">(2.15);
  const [diameter, setDiameter] = useState<number | "">(3.0);
  const [depth, setDepth] = useState<number | "">(2.0);
  const [freeboard, setFreeboard] = useState<number | "">(0.3);
  const [wallT, setWallT] = useState<number | "">(200);
  const [baseT, setBaseT] = useState<number | "">(200);
  const [fck, setFck] = useState<number | "">(25);
  const [barType, setBarType] = useState<BarType>("deformed");
  const [cover, setCover] = useState<number | "">(40);
  const [mainDia, setMainDia] = useState<number | "">(10);
  const [wastage, setWastage] = useState<number | "">(5);

  const results = useMemo(() => designWaterTank({
    shape, placement, occupants: Number(occupants) || 0, lpcd: Number(lpcd) || 0,
    daysReserve: Number(days) || 0, lengthM: Number(length) || 0, widthM: Number(width) || 0,
    diameterM: Number(diameter) || 0, waterDepthM: Number(depth) || 0, freeboardM: Number(freeboard) || 0,
    wallThicknessMm: Number(wallT) || 0, baseThicknessMm: Number(baseT) || 0,
    fck: Number(fck) || 0, barType, coverMm: Number(cover) || 0,
    mainDiaMm: Number(mainDia) || 0, wastagePct: Number(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  }), [shape, placement, occupants, lpcd, days, length, width, diameter, depth, freeboard, wallT, baseT, fck, barType, cover, mainDia, wastage, rates]);

  const summary = `Water tank ${shape} ${placement}: capacity ${results.capacityLitres} L (${results.capacityM3} m³, ${results.capacityGallons} gal (Imperial)) vs demand ${results.demandLitres} L — ${results.demandOk ? "covers demand" : "SHORT"}; wall steel ${results.astProvidedMm2PerM} mm²/m (${mainDia} mm @ ${results.barSpacingMm} mm); crack width ${results.crackWidthOk ? "≤ 0.2 mm PASS" : "CHECK"}; concrete ${results.concreteVolM3} m³; steel ${results.steelKg} kg; cost ${results.totalCost == null ? "—" : formatCurrency(results.totalCost)}.`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 px-4 md:px-0">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="text-xl font-bold mb-6 text-txt-primary flex items-center gap-2">
          <Waves className="text-accent-700" /> Water Tank Design (IS 3370)
        </h2>
        <p className="text-sm text-txt-secondary leading-relaxed mt-4">Water tank design to IS 3370 — rectangular and circular tanks, above or below ground. Wall moments from IS 3370 Part 4 Table 3, hoop tension for circular tanks, minimum steel 0.217%, crack width kept to 0.2 mm, and a staging-load check for elevated tanks. Capacity is worked out first from the tank size, then checked against daily demand.</p>
        <EngineNotices errors={results.errors} warnings={results.warnings} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Shape, Placement &amp; Demand</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Shape</label>
                  <select value={shape} onChange={(e) => setShape(e.target.value as TankShape)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="rectangular">Rectangular</option>
                    <option value="circular">Circular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Placement</label>
                  <select value={placement} onChange={(e) => setPlacement(e.target.value as TankPlacement)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="overhead">Overhead</option>
                    <option value="underground">Underground</option>
                    <option value="resting">Resting on ground</option>
                  </select>
                </div>
                <NumberInput label="Occupants" value={occupants} onChange={setOccupants} requirePositive />
                <NumberInput label="Water per person" unit="lpcd" value={lpcd} onChange={setLpcd} requirePositive />
                <NumberInput label="Days of reserve" value={days} onChange={setDays} requirePositive />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Dimensions &amp; Materials</h3>
              <div className="grid grid-cols-2 gap-4">
                {shape === "rectangular" ? (<>
                  <NumberInput label="Length (L)" unit="m" value={length} onChange={setLength} requirePositive />
                  <NumberInput label="Width (B)" unit="m" value={width} onChange={setWidth} requirePositive />
                </>) : (
                  <NumberInput label="Diameter (D)" unit="m" value={diameter} onChange={setDiameter} requirePositive />
                )}
                <NumberInput label="Water depth (H)" unit="m" value={depth} onChange={setDepth} requirePositive />
                <NumberInput label="Freeboard" unit="m" value={freeboard} onChange={setFreeboard} requirePositive />
                <NumberInput label="Wall thickness" unit="mm" value={wallT} onChange={setWallT} requirePositive />
                <NumberInput label="Base slab thickness" unit="mm" value={baseT} onChange={setBaseT} requirePositive />
                <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} requirePositive />
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Bar type (σst per IS 3370 Table 2)</label>
                  <select value={barType} onChange={(e) => setBarType(e.target.value as BarType)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="deformed">Deformed (130 MPa in direct tension)</option>
                    <option value="plain">Plain (150 MPa in direct tension)</option>
                  </select>
                </div>
                <NumberInput label="Cover" unit="mm" value={cover} onChange={setCover} requirePositive />
                <NumberInput label="Main bar dia" unit="mm" value={mainDia} onChange={setMainDia} requirePositive />
                <NumberInput label="Wastage" unit="%" value={wastage} onChange={setWastage} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <NumberInput label="Cement" unit={table.currency + "/bag"} value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                <NumberInput label="Steel" unit={table.currency + "/kg"} value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <MaterialSummary title="Capacity" totalLabel="Capacity" totalValue={results.capacityLitres.toLocaleString("en-US")} totalUnit="litres" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Capacity" value={results.capacityM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Gallons" value={results.capacityGallons.toFixed(0)} unit="gal" variant="neutral" />
                <ResultCard title="Demand" value={results.demandLitres.toLocaleString("en-US")} unit="L" variant="neutral" />
                <ResultCard title="Demand check" value={results.demandOk ? "PASS" : "SHORT"} unit="" variant={results.demandOk ? "primary" : "warning"} />
              </div>
            </MaterialSummary>
            <MaterialSummary title="Wall Design" totalLabel="Steel provided" totalValue={results.astProvidedMm2PerM.toFixed(0)} totalUnit="mm²/m" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Max pressure" value={results.maxPressureKNm2.toFixed(1)} unit="kN/m²" variant="neutral" />
                {shape === "circular"
                  ? <ResultCard title="Hoop tension" value={results.hoopTensionKNPerM.toFixed(1)} unit="kN/m" variant="neutral" />
                  : <ResultCard title="Long-wall Mu" value={results.muLongKNmPerM.toFixed(2)} unit="kNm/m" variant="neutral" />}
                <ResultCard title="Min steel 0.217%" value={results.astMinMm2PerM.toFixed(0)} unit="mm²/m" variant="neutral" />
                <ResultCard title="Bar schedule" value={`${mainDia} mm @ ${results.barSpacingMm}`} unit="mm c/c" variant="neutral" />
              </div>
              <p className="text-sm text-txt-secondary mt-3">σst flexure {results.sigmaStFlexure} MPa, hoop {results.sigmaStHoop} MPa (IS 3370 Part 2 Table 2). Minimum steel {results.minSteelGoverns ? "governs" : "does not govern"}. Crack width ≤ 0.2 mm: {results.crackWidthOk ? "PASS" : "CHECK spacing"}.</p>
              {placement === "overhead" && <p className="text-sm text-txt-secondary mt-2">Staging design load (×1.5): <strong className="font-mono">{results.stagingLoadKN} kN</strong> — size columns and braces for this plus wind/seismic.</p>}
            </MaterialSummary>
            <MaterialSummary title="Quantities & Cost" totalLabel="Total cost" totalValue={results.totalCost == null ? "—" : results.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Wall concrete" value={results.wallConcreteM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Base concrete" value={results.baseConcreteM3.toFixed(2)} unit="m³" variant="neutral" />
                <ResultCard title="Steel" value={results.steelKg.toFixed(1)} unit="kg" variant="neutral" />
                <ResultCard title="Waterproofing" value={results.waterproofingM2.toFixed(1)} unit="m²" variant="neutral" />
              </div>
              <div className="mt-4 space-y-1 text-sm">
                {results.costLines.map((l) => (
                  <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
                ))}
              </div>
            </MaterialSummary>
            <StructuralExportBar title="Water Tank Design (IS 3370)" summaryText={summary}
              boqItems={[
                { description: `Cement for ${shape} water tank`, quantity: results.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for tank concrete", quantity: results.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for tank concrete", quantity: results.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Steel reinforcement for tank", quantity: results.steelKg, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={results.totalCost} />
            <CalcSteps steps={results.steps} />
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="watertankdesign_tool" currentInputs={{ shape, placement, occupants, lpcd, days, length, width, diameter, depth, freeboard, wallT, baseT, fck, barType, cover, mainDia, wastage }} />
    </div>
  );
}
