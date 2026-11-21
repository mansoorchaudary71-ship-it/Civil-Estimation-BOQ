/** Solar water heater tests — run with: npx tsx --test src/lib/__tests__/solarWaterHeaterCalc.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcSolarWaterHeater } from "../solarWaterHeaterCalc";

test("worked example §4.4: 4 people x 50 L, ΔT 45, 5.0 radiation, 50% eff, 0.6 solar fraction", () => {
  const r = calcSolarWaterHeater({
    people: 4, usePerPersonL: 50, targetTempC: 60, inletTempC: 15,
    radiationKwhPerM2PerDay: 5, efficiencyPct: 50, solarFraction: 0.6,
    energyCostPerKwh: 50,
  });
  assert.equal(r.demandLPerDay, 200);
  assert.ok(Math.abs(r.energyKwhPerDay - 10.46) < 0.02, `Q ${r.energyKwhPerDay}`);
  assert.ok(Math.abs(r.collectorAreaM2 - 6.97) < 0.05, `area ${r.collectorAreaM2}`);
  assert.equal(r.panels, 4);
  assert.equal(r.installedAreaM2, 8);
  assert.ok(Math.abs(r.tankUnroundedL - 418) < 2, `tank raw ${r.tankUnroundedL}`);
  assert.equal(r.tankL, 500);
  assert.ok(Math.abs(r.annualSavings - 114519) < 200, `savings ${r.annualSavings}`);
  // Collector is costed on the INSTALLED 8.00 m² (4 x 2 m² panels), not the
  // theoretical 6.97 m²: collector Rs 360,000 + tank Rs 400,000, +10%
  // installation = Rs 836,000 (the old Rs 785,000 costed 6.97 m²).
  assert.ok(Math.abs(r.systemCost - 836000) < 2000, `cost ${r.systemCost}`);
  assert.ok(r.paybackYears != null && Math.abs(r.paybackYears - 7.3) < 0.2);
});

test("demand uses 50 L/person (the old 40 is retired)", () => {
  const r = calcSolarWaterHeater({ people: 4 });
  assert.equal(r.demandLPerDay, 200);
});

test("evacuated tube needs less area than flat plate", () => {
  const flat = calcSolarWaterHeater({ people: 4, collectorType: "flatPlate" });
  const tube = calcSolarWaterHeater({ people: 4, collectorType: "evacuatedTube" });
  assert.ok(tube.collectorAreaM2 < flat.collectorAreaM2);
});

test("validation: target must exceed inlet; efficiency 0 rejected", () => {
  assert.throws(() => calcSolarWaterHeater({ people: 4, targetTempC: 15, inletTempC: 20 }), /Target temperature must exceed/);
  assert.throws(() => calcSolarWaterHeater({ people: 4, efficiencyPct: 0 }), /efficiency/);
  assert.throws(() => calcSolarWaterHeater({ people: 4, solarFraction: 0.95 }), /Solar fraction/);
});
