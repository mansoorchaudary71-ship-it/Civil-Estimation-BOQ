import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { CalculationHistory } from '../ui/CalculationHistory';
import { NumberInput } from '../ui/NumberInput';
import { ResultCard } from '../ui/ResultCard';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CodeTooltip } from "../ui/CodeTooltip";
import { useRates } from '../../lib/useRates';
import { designPrestress, defaultPrestressInputs, type PrestressType, type SectionKind  } from '../../lib/prestressCalc';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';
import { formatRate } from '../../lib/rates';

export default function PrestressedConcreteEstimator() {
  const { rates, setRate, table } = useRates();
  const [type, setType] = useState<PrestressType>("post");
  const [sectionKind, setSectionKind] = useState<SectionKind>("rectangular");
  const [b, setB] = useState<number | "">(300);
  const [d, setD] = useState<number | "">(800);
  const [flangeB, setFlangeB] = useState<number | "">(600);
  const [flangeD, setFlangeD] = useState<number | "">(150);
  const [spanL, setSpanL] = useState<number | "">(20);
  const [eccentricity, setEccentricity] = useState<number | "">(120);
  const [ptForce, setPtForce] = useState<number | "">(1000);
  const [areaSteel, setAreaSteel] = useState<number | "">(800);
  const [fpu, setFpu] = useState<number | "">(1860);
  const [fck, setFck] = useState<number | "">(30);
  const [es, setEs] = useState<number | "">(210000);
  const [slip, setSlip] = useState<number | "">(2);
  const [mu, setMu] = useState<number | "">(0.3);
  const [k, setK] = useState<number | "">(0.0015);
  const [creep, setCreep] = useState<number | "">(1.6);
  const [shrinkage, setShrinkage] = useState<number | "">(0.0002);
  const [relaxationPct, setRelaxationPct] = useState<number | "">(3);
  const [serviceM, setServiceM] = useState<number | "">(300);
  const [transferM, setTransferM] = useState<number | "">(50);
  const [pClass, setPClass] = useState<1 | 2>(1);
  const [wastage, setWastage] = useState<number | "">(5);

  const results = useMemo(() => designPrestress({
    type, sectionKind, bMm: Number(b) || 0, dMm: Number(d) || 0,
    flangeBmm: Number(flangeB) || 0, flangeDMm: Number(flangeD) || 0,
    spanM: Number(spanL) || 0, eccentricityMm: Number(eccentricity) || 0,
    p0KN: Number(ptForce) || 0, apMm2: Number(areaSteel) || 0, fpuMpa: Number(fpu) || 0,
    fck: Number(fck) || 0, esMpa: Number(es) || 0,
    slipMm: Number(slip) || 0, mu: Number(mu) || 0, kPerM: Number(k) || 0,
    creepCoeff: Number(creep) || 0, shrinkageStrain: Number(shrinkage) || 0,
    relaxationPct: Number(relaxationPct) || 0,
    serviceMomentKNm: Number(serviceM) || 0, transferMomentKNm: Number(transferM) || 0,
    prestressClass: pClass, wastagePct: Number(wastage) || 0,
    cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg,
    sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft,
  }), [type, sectionKind, b, d, flangeB, flangeD, spanL, eccentricity, ptForce, areaSteel, fpu, fck, es, slip, mu, k, creep, shrinkage, relaxationPct, serviceM, transferM, pClass, wastage, rates]);

  const summary = `Prestressed ${type === "post" ? "post" : "pre"}-tensioned: initial stress ${results.initialStressMpa} MPa (jacking limit ${results.jackingLimitMpa} MPa — ${results.jackingOk ? "OK" : "EXCEEDED"}); total loss ${results.totalLossMpa} MPa = ${results.pctLoss}% (typical 15–25%); effective stress ${results.finalStressMpa} MPa; service stresses top ${results.stressTopServiceMpa} / bottom ${results.stressBottomServiceMpa} MPa — ${results.serviceOk ? "within Class " + pClass + " limits" : "TENSION EXCEEDS LIMIT"}; Mu ≈ ${results.muKNm} kNm; tendon ${results.tendonKg} kg.`;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 px-4 md:px-0">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="text-xl font-semibold mb-6 text-txt-primary flex items-center gap-2">
          <Layers className="text-accent-700" /> Pre-stressed Concrete Estimator (IS 1343)
        </h2>
        <p className="text-sm text-txt-secondary leading-relaxed mt-4">Prestressed concrete to IS 1343:2012 — pre-tensioned and post-tensioned members, rectangular and T-sections, with every loss itemised (elastic shortening, creep, shrinkage, relaxation, friction and anchorage slip). Total loss should sit in the 15–25% band; the tool warns outside it and checks the jacking stress against the 0.8·fpu limit, service stresses and ultimate moment.</p>
        <EngineNotices errors={results.errors} warnings={results.warnings} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 responsive-tool-grid mt-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Section Builder</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Section</label>
                  <select value={sectionKind} onChange={(e) => setSectionKind(e.target.value as SectionKind)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="rectangular">Rectangular</option>
                    <option value="tee">T-section</option>
                  </select>
                </div>
                <NumberInput label="Span Length" unit="m" value={spanL} onChange={setSpanL} requirePositive />
                <NumberInput label="Web width (b)" unit="mm" value={b} onChange={setB} requirePositive />
                <NumberInput label="Total depth (D)" unit="mm" value={d} onChange={setD} requirePositive />
                {sectionKind === "tee" && (<>
                  <NumberInput label="Flange width" unit="mm" value={flangeB} onChange={setFlangeB} requirePositive />
                  <NumberInput label="Flange depth" unit="mm" value={flangeD} onChange={setFlangeD} requirePositive />
                </>)}
                <NumberInput label="Eccentricity (mid)" unit="mm" value={eccentricity} onChange={setEccentricity} />
                <NumberInput label="Concrete (fck)" unit="MPa" value={fck} onChange={setFck} requirePositive />
              </div>
              <p className="text-xs text-txt-tertiary mt-2">A = {results.areaMm2.toLocaleString()} mm² · I = {(results.inertiaMm4 / 1e9).toFixed(2)}×10⁹ mm⁴ · Ec = 5000√fck = {results.ecMpa} MPa (auto) · m = {results.modularRatio}.</p>
            </div>
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Tendon &amp; Force</h3>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Jacking Force (P0)" unit="kN" value={ptForce} onChange={setPtForce} requirePositive />
                <NumberInput label="Tendon Area (Ap)" unit="mm²" value={areaSteel} onChange={setAreaSteel} requirePositive />
                <NumberInput label={<span className="flex items-center gap-1">Ultimate strength (fpu) <CodeTooltip standard="IS" code="1343:2012" description="Code of practice for prestressed concrete." /></span>} unit="MPa" value={fpu} onChange={setFpu} requirePositive />
                <NumberInput label="Steel Modulus (Es)" unit="MPa" value={es} onChange={setEs} requirePositive />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-txt-primary mb-4 pb-2 border-b border-border-color">Loss Parameters</h3>
              <div className="mb-4">
                <label className="text-base font-medium uppercase tracking-wider mb-2 block">System Type</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                    <input type="radio" checked={type === "pre"} onChange={() => setType("pre")} className="w-4 h-4 text-accent-700" /> Pre-tensioned
                  </label>
                  <label className="flex items-center gap-2 text-base font-medium cursor-pointer">
                    <input type="radio" checked={type === "post"} onChange={() => setType("post")} className="w-4 h-4 text-accent-700" /> Post-tensioned
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {type === "post" && (<>
                  <NumberInput label="Anchorage Slip" unit="mm" value={slip} onChange={setSlip} />
                  <NumberInput label={<span className="flex items-center gap-1">Friction Coeff (μ) <CodeTooltip standard="IS" code="1343:2012" description="Friction between tendon and duct — IS 1343, not IS 1904 (foundations)." /></span>} unit="/rad" value={mu} onChange={setMu} />
                  <NumberInput label="Wobble (K)" unit="/m" value={k} onChange={setK} />
                </>)}
                <NumberInput label="Creep Coeff (φ)" value={creep} onChange={setCreep} />
                <NumberInput label="Shrinkage Strain" value={shrinkage} onChange={setShrinkage} />
                <NumberInput label="Relaxation" unit="%" value={relaxationPct} onChange={setRelaxationPct} />
                <NumberInput label="Service Moment" unit="kNm" value={serviceM} onChange={setServiceM} />
                <NumberInput label="Transfer Moment" unit="kNm" value={transferM} onChange={setTransferM} />
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1.5 ml-1">Prestress Class</label>
                  <select value={pClass} onChange={(e) => setPClass(Number(e.target.value) as 1 | 2)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value={1}>Type 1 — no tension</option>
                    <option value={2}>Type 2 — tension ≤ 3 N/mm²</option>
                  </select>
                </div>
                <NumberInput label="Wastage" unit="%" value={wastage} onChange={setWastage} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <NumberInput label="Cement" unit={table.currency + "/bag"} value={rates.cementPerBag ?? ""} onChange={(v) => setRate("cementPerBag", v === "" ? null : Number(v))} />
                <NumberInput label="Steel" unit={table.currency + "/kg"} value={rates.steelPerKg ?? ""} onChange={(v) => setRate("steelPerKg", v === "" ? null : Number(v))} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <MaterialSummary title="Prestress Loss Estimation" totalLabel="Total Prestress Loss" totalValue={results.totalLossMpa.toFixed(1)} totalUnit="MPa" relatedToolIds={[]}>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-hover border border-border-color rounded-2xl overflow-hidden">
                  <p className="text-base font-medium mb-1">Initial Stress</p>
                  <p className="text-xl font-bold text-txt-primary">{results.initialStressMpa.toFixed(1)} MPa</p>
                  <p className="text-xs text-txt-tertiary mt-1">Jacking limit 0.8·fpu = {results.jackingLimitMpa} MPa — {results.jackingOk ? "OK" : "EXCEEDED"}</p>
                </div>
                <div className="p-4 bg-accent-50 border border-accent-200 rounded-2xl overflow-hidden">
                  <p className="text-base font-medium text-accent-800 mb-1">Final Effective Stress</p>
                  <p className="text-xl font-bold text-accent-800">{results.finalStressMpa.toFixed(1)} MPa</p>
                  <p className="text-xs text-accent-700 mt-1">{results.pctLoss.toFixed(1)}% loss (typical 15–25%) — {results.lossBandOk ? "in band" : "outside band"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-txt-primary border-b border-border-color pb-2">Losses Breakdown</h4>
                {type === "post" && (<>
                  <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Friction Loss</span><span className="font-mono font-bold text-txt-primary">{results.lossFrictionMpa.toFixed(2)} MPa</span></div>
                  <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Anchorage Slip (uniform)</span><span className="font-mono font-bold text-txt-primary">{results.lossSlipMpa.toFixed(2)} MPa</span></div>
                  <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Anchorage Slip (affected length, l_set {results.slipAffectedLengthM} m)</span><span className="font-mono font-bold text-txt-primary">{results.lossSlipAffectedMpa.toFixed(2)} MPa</span></div>
                </>)}
                <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Elastic Shortening (fc {results.fcMpa} MPa)</span><span className="font-mono font-bold text-txt-primary">{results.lossElasticMpa.toFixed(2)} MPa</span></div>
                <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Creep (Concrete)</span><span className="font-mono font-bold text-txt-primary">{results.lossCreepMpa.toFixed(2)} MPa</span></div>
                <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Shrinkage (Concrete)</span><span className="font-mono font-bold text-txt-primary">{results.lossShrinkageMpa.toFixed(2)} MPa</span></div>
                <div className="flex justify-between items-center text-sm border-b border-border-color pb-2"><span className="text-txt-secondary">Steel Relaxation</span><span className="font-mono font-bold text-txt-primary">{results.lossRelaxationMpa.toFixed(2)} MPa</span></div>
              </div>
            </MaterialSummary>
            <MaterialSummary title="Service Stresses & Ultimate" totalLabel="Ultimate Moment (Mu)" totalValue={results.muKNm.toFixed(0)} totalUnit="kNm" relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Top @ transfer" value={results.stressTopTransferMpa.toFixed(2)} unit="MPa" variant="neutral" />
                <ResultCard title="Bottom @ transfer" value={results.stressBottomTransferMpa.toFixed(2)} unit="MPa" variant="neutral" />
                <ResultCard title="Top @ service" value={results.stressTopServiceMpa.toFixed(2)} unit="MPa" variant={results.serviceOk ? "neutral" : "warning"} />
                <ResultCard title="Bottom @ service" value={results.stressBottomServiceMpa.toFixed(2)} unit="MPa" variant={results.serviceOk ? "neutral" : "warning"} />
              </div>
              <p className="text-sm text-txt-secondary mt-3">Class {pClass} tension limit {pClass === 1 ? "0" : "3"} N/mm² — {results.serviceOk ? "PASS" : "FAIL"}. Compression is positive; negative values are tension.</p>
              <div className="mt-4">
                <h4 className="font-bold text-sm text-txt-primary mb-2">Loss vs distance from jacking end</h4>
                <div className="space-y-1 text-sm">
                  {results.lossVsDistance.map((row) => (
                    <div key={row.distanceM} className="flex justify-between border-b border-border-color pb-1"><span className="text-txt-secondary">At {row.distanceM} m</span><span className="font-mono">friction {row.frictionLossMpa} MPa · total {row.totalLossMpa} MPa · σ {row.stressMpa} MPa</span></div>
                  ))}
                </div>
              </div>
            </MaterialSummary>
            <MaterialSummary title="Quantities & Cost" totalLabel="Total cost" totalValue={results.totalCost == null ? "—" : results.totalCost.toLocaleString("en-US")} totalUnit={table.currency} relatedToolIds={[]}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <ResultCard title="Tendon steel" value={results.tendonKg.toFixed(1)} unit="kg" variant="neutral" />
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
            <StructuralExportBar title="Prestressed Concrete (IS 1343)" summaryText={summary}
              boqItems={[
                { description: "Cement for prestressed member", quantity: results.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
                { description: "Sand for prestressed concrete", quantity: results.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
                { description: "Aggregate for prestressed concrete", quantity: results.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
                { description: "Prestressing tendon steel", quantity: results.tendonKg, unit: "kg", rate: rates.steelPerKg ?? 0 },
              ]}
              totalAmount={results.totalCost} />
            <CalcSteps steps={results.steps} />
          </div>
        </div>
      </div>
      <CalculationHistory calculatorId="prestressed_concrete" currentInputs={{ type, sectionKind, b, d, flangeB, flangeD, spanL, eccentricity, ptForce, areaSteel, fpu, fck, es, slip, mu, k, creep, shrinkage, relaxationPct, serviceM, transferM, pClass, wastage }} />
    </div>
  );
}
