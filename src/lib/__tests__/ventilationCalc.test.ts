/** Ventilation tests — run with: npx tsx --test src/lib/__tests__/ventilationCalc.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcVentilation } from "../ventilationCalc";

test("worked example §4.7: bedroom 4x5 m, H 3 m -> glazing 2.5 m2, ACH airflow 240 m3/h = 141 CFM, ASHRAE 11 L/s = 39.6 m3/h", () => {
  const r = calcVentilation({
    roomType: "bedroom", climateZone: "Intermediate",
    lengthM: 4, widthM: 5, heightM: 3, occupants: 2,
    windowAreaM2: 3, openableFractionPct: 50,
  });
  assert.equal(r.floorAreaM2, 20);
  assert.equal(r.volumeM3, 60);
  assert.equal(r.requiredGlazingM2, 2.5);
  assert.equal(r.requiredOpenableM2, 1.25);
  assert.equal(r.actualOpenableM2, 1.5);
  assert.equal(r.glazingPass, true);
  assert.equal(r.ventilationPass, true);
  assert.equal(r.targetAch, 4);
  assert.equal(r.requiredAirflowM3h, 240);
  assert.ok(Math.abs(r.requiredAirflowCfm - 141) < 1, `CFM ${r.requiredAirflowCfm}`);
  assert.ok(Math.abs(r.ashraeVbzLs - 11) < 0.01, `Vbz ${r.ashraeVbzLs}`);
  assert.ok(Math.abs(r.ashraeVozM3h - 39.6) < 0.1, `Voz ${r.ashraeVozM3h}`);
  assert.equal(r.recommendedWindows, 1);
});

test("glazing fails when the window is too small", () => {
  const r = calcVentilation({ roomType: "bedroom", lengthM: 4, widthM: 5, heightM: 3, windowAreaM2: 1, openableFractionPct: 50 });
  assert.equal(r.glazingPass, false);
  assert.ok(Math.abs(r.glazingShortfallM2 - 1.5) < 0.01);
});

test("kitchen and bathroom minimums and exhaust fan sizing (ASHRAE 62.2 rates)", () => {
  const k = calcVentilation({ roomType: "kitchen", lengthM: 2, widthM: 2, heightM: 3, windowAreaM2: 1 });
  assert.equal(k.requiredGlazingM2, 1.0);
  assert.equal(k.targetAch, 10);
  // Exhaust fan is sized on the ASHRAE 62.2 intermittent rate (kitchen
  // 100 CFM), NOT on the whole-room ACH airflow (120 m³/h = 71 CFM here —
  // the old test asserted fan ≥ ACH airflow, which sized a 90 m³ kitchen
  // at 600 CFM, commercial-hood scale). Whole-room airflow is unchanged.
  assert.equal(k.exhaustFanCfm, 100);
  assert.ok(Math.abs(k.requiredAirflowCfm - 70.6) < 1, `ACH CFM ${k.requiredAirflowCfm}`);
  const b = calcVentilation({ roomType: "bathroom", lengthM: 1.5, widthM: 1.5, heightM: 3, windowAreaM2: 0.3 });
  assert.equal(b.requiredGlazingM2, 0.3);
  assert.equal(b.targetAch, 8);
  assert.equal(b.exhaustFanCfm, 50);
  // Large kitchen: 6×5×3 m, ACH 10 → 900 m³/h = 530 CFM whole-room air,
  // but the exhaust fan is still the 100 CFM ASHRAE 62.2 rate.
  const big = calcVentilation({ roomType: "kitchen", lengthM: 6, widthM: 5, heightM: 3, windowAreaM2: 3 });
  assert.ok(Math.abs(big.requiredAirflowCfm - 530) < 1, `ACH CFM ${big.requiredAirflowCfm}`);
  assert.equal(big.exhaustFanCfm, 100);
});

test("actual ACH is reported when existing airflow is given", () => {
  const r = calcVentilation({ roomType: "bedroom", lengthM: 4, widthM: 5, heightM: 3, existingAirflowM3h: 120 });
  assert.equal(r.actualAch, 2);
  assert.ok(r.warnings.some((w) => /below the 4 ACH/.test(w)));
});

test("validation: openable fraction over 100% and low ceiling rejected", () => {
  assert.throws(() => calcVentilation({ roomType: "bedroom", lengthM: 4, widthM: 5, heightM: 3, openableFractionPct: 120 }), /Openable fraction/);
  assert.throws(() => calcVentilation({ roomType: "bedroom", lengthM: 4, widthM: 5, heightM: 2 }), /Room height/);
});
