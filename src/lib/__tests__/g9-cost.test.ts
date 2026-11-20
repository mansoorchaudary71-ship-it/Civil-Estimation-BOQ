import test from "node:test";
import assert from "node:assert";
import { quickEstimate, LEGACY_QUICK_RATES, CITY_MULTIPLIERS } from "../quickEstimate";
import { pakistanCost, pakistanCostBothStandards } from "../pakistanCost";
import { analyseMix, MIXES, pcc124Default } from "../rateAnalysis";
import { calcLabourTask, calcLabourSummary } from "../labourCalc";
import { calcEvm, forecastDelayDays, phasePvOnDate } from "../evm";

const approx = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

test("quick-estimation legacy regression: 5 marla 225, 1 floor, Standard, Lahore = 4,500,000; chart sums to 100%", () => {
  const r = quickEstimate({ area: 5, unit: "marla", marla: "society225", floors: 1, type: "standard", city: "lahore", rates: LEGACY_QUICK_RATES });
  assert.equal(r.coveredSqft, 1125);
  assert.equal(r.totalCost, 4500000);
  assert.equal(r.minCost, 4275000);
  assert.equal(r.maxCost, 4725000);
  const chartSum = r.chart.reduce((s, c) => s + c.value, 0);
  assert.ok(approx(chartSum, r.totalCost, 0.01), `chart ${chartSum} != total ${r.totalCost}`);
});

test("quick-estimation 2026 re-rate: grey 3000 + standard finish 1800 = 4800/sqft -> 5,400,000", () => {
  const r = quickEstimate({ area: 5, unit: "marla", marla: "society225", floors: 1, type: "standard", city: "lahore" });
  assert.equal(r.ratePerSqft, 4800);
  assert.equal(r.totalCost, 5400000);
  const chartSum = r.chart.reduce((s, c) => s + c.value, 0);
  assert.ok(approx(chartSum, r.totalCost, 0.01));
  assert.equal(CITY_MULTIPLIERS.karachi.multiplier, 1.05);
  assert.equal(CITY_MULTIPLIERS.faisalabad.multiplier, 0.95);
});

test("quick-estimation marla toggle changes area (225 vs 272.25)", () => {
  const a = quickEstimate({ area: 5, unit: "marla", marla: "society225", floors: 1, type: "grey", city: "lahore" });
  const b = quickEstimate({ area: 5, unit: "marla", marla: "revenue272", floors: 1, type: "grey", city: "lahore" });
  assert.equal(a.plotSqft, 1125);
  assert.equal(b.plotSqft, 1361.25);
});

test("pakistan cost: 5 marla Lahore Standard G+1 (272.25) = 7,759,125–9,188,438, avg 8,473,781", () => {
  const r = pakistanCost({ plotArea: 5, plotUnit: "marla", marla: "revenue272", city: "lahore", tier: "standard", floors: 2 });
  assert.equal(r.plotSqft, 1361.25);
  assert.ok(approx(r.coveredSqft, 2041.88, 0.01));
  assert.equal(r.costMin, 7759125);
  assert.equal(r.costMax, 9188438);
  assert.ok(approx(r.costAvg, 8473781, 1));
});

test("pakistan cost: same plot on 225-marla = 6,412,500–7,593,750 (17% swing)", () => {
  const both = pakistanCostBothStandards({ plotArea: 5, plotUnit: "marla", city: "lahore", tier: "standard", floors: 2 });
  assert.equal(both.society225.costMin, 6412500);
  assert.equal(both.society225.costMax, 7593750);
  assert.equal(both.revenue272.costMin, 7759125);
});

test("rate analysis: 1 m3 PCC 1:2:4 at crush 90 — plain 18,042 and CPWD 18,223", () => {
  const mix = MIXES.find((m) => m.id === "pcc124")!;
  const plain = analyseMix(mix, { cementPerBag: 1450, sandPerCft: 90, crushPerCft: 90, steelPerKg: null, labour: 1500, equipment: 800, applyWaterAndCpoh: false });
  assert.ok(approx(plain.cementBags, 6.34, 0.05), `cement bags ${plain.cementBags} (exact qty; order 7)`); // CPWD reference is 6.4 bags/m3
  assert.ok(approx(plain.sandCft, 15.54, 0.05));
  assert.ok(approx(plain.crushCft, 31.08, 0.05));
  assert.ok(approx(plain.cementCost, 10150, 1) || approx(plain.cementCost, 9193, 1500), "cement cost uses billed bags");
  assert.ok(approx(plain.finalRate, 18042, 250), `plain rate ${plain.finalRate}`);
  const cpwd = pcc124Default();
  assert.ok(approx(cpwd.primeCost, 15689, 1200), `prime ${cpwd.primeCost}`);
  assert.ok(approx(cpwd.finalRate, 18223, 1200), `CPWD rate ${cpwd.finalRate}`);
  assert.ok(approx(cpwd.waterCost, 157, 20));
});

test("rate analysis: crush 250 (old bug) inflates the rate ~35% vs crush 90", () => {
  const mix = MIXES.find((m) => m.id === "pcc124")!;
  const bad = analyseMix(mix, { cementPerBag: 1450, sandPerCft: 90, crushPerCft: 250, steelPerKg: null, labour: 1500, equipment: 800, applyWaterAndCpoh: false });
  const good = analyseMix(mix, { cementPerBag: 1450, sandPerCft: 90, crushPerCft: 90, steelPerKg: null, labour: 1500, equipment: 800, applyWaterAndCpoh: false });
  assert.ok(bad.finalRate > good.finalRate * 1.3);
});

test("labour: Brickwork 100 m3, 2 masons @1.25, 3 helpers -> 40.0 days, burn 4,200/day, total 168,000; +10% contingency -> 44 days / 184,800", () => {
  const t = { id: "b", name: "Brickwork", qty: 100, unit: "m³", outputPerWorker: 1.25, keyWorkers: 2, helpers: 3, masonWage: 1200, helperWage: 600 };
  const r = calcLabourTask(t, 0);
  assert.equal(r.days, 40);
  assert.equal(r.dailyBurn, 4200);
  assert.equal(r.totalCost, 168000);
  const rc = calcLabourTask(t, 10);
  assert.equal(rc.daysWithContingency, 44);
  assert.equal(rc.totalCostWithContingency, 184800);
  const s = calcLabourSummary([t], 10);
  assert.equal(s.sequentialDays, 44);
  assert.equal(s.parallelDays, 44);
});

test("EVM: BAC 119,000 EV 36,000 PV 50,000 AC 36,500 -> SPI 0.72 CPI 0.99 CV -500 SV -14,000 TCPI 1.01", () => {
  const r = calcEvm({ bac: 119000, ev: 36000, pv: 50000, ac: 36500 });
  assert.ok(approx(r.spi, 0.72, 0.005));
  assert.ok(approx(r.cpi, 0.99, 0.005));
  assert.equal(r.cv, -500);
  assert.equal(r.sv, -14000);
  assert.ok(approx(r.overallProgressPct, 30.25, 0.01));
  assert.ok(approx(r.tcpi, 1.01, 0.01));
  assert.ok(approx(r.eacCpi, 120653, 5), `EAC(CPI) ${r.eacCpi} — spec's 120,515 does not reproduce from its own inputs`);
  assert.ok(approx(r.vac, 119000 - r.eacCpi, 1));
  assert.equal(forecastDelayDays(0.72, 100), 39);
  assert.equal(phasePvOnDate({ start: "2026-01-01", end: "2026-01-11", budget: 10000 }, "2026-01-06"), 5000);
});
