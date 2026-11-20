/**
 * Mix design engine tests — run with:
 *   npx tsx --test src/lib/__tests__/mixDesignCalc.test.ts
 * (plain node:test + node:assert, same pattern as steelCalc.test.ts)
 *
 * Every worked example is from the G2 spec §5.7, hand-verified there.
 * IS 10262 Table 5 CA-fraction values should be verified against a BIS
 * controlled copy before release (see mixDesignCalc.ts header).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcMixDesign,
  defaultMixDesignInputs,
  sdForGrade,
  roundUpHalf,
  wcFromStrengthIS,
  wcFromStrengthACI,
  caFractionIS,
  validateMixDesign,
  type MixDesignInputs,
} from "../mixDesignCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} (±${tol}), got ${actual}`,
  );

test("SD table: M10/M15 3.5, M20/M25 4.0, M30+ 5.0; f'ck rounds up to 0.5", () => {
  assert.equal(sdForGrade(10), 3.5);
  assert.equal(sdForGrade(15), 3.5);
  assert.equal(sdForGrade(20), 4.0);
  assert.equal(sdForGrade(25), 4.0);
  assert.equal(sdForGrade(30), 5.0);
  assert.equal(sdForGrade(60), 5.0);
  assert.equal(roundUpHalf(38.25), 38.5);
  assert.equal(roundUpHalf(31.6), 32.0);
});

test("IS worked example M25 (spec §5.7) — exact values", () => {
  const r = calcMixDesign(defaultMixDesignInputs());
  // 1. f'ck = 25 + 1.65 x 4.0
  assert.equal(r.targetStrength, 31.6);
  assert.equal(r.targetStrengthDisplay, 32.0);
  // 2. W = 186 L (Table 4, 20 mm angular, 25-50 mm slump)
  assert.equal(r.waterKg, 186);
  // 3. governing w/c 0.50 (strength 0.50, durability Moderate 0.50)
  assert.equal(r.wcStrength, 0.5);
  assert.equal(r.wcDurability, 0.5);
  assert.equal(r.wcGoverning, 0.5);
  assert.equal(r.wcActual, 0.5);
  assert.equal(r.governedBy, "strength");
  // 4. C = 186/0.50 = 372; bags exact 7.44 -> order 8
  assert.equal(r.cementKg, 372);
  assert.equal(r.cementBagsExact, 7.44);
  assert.equal(r.cementBagsOrder, 8);
  assert.equal(r.cementRaisedToMinimum, false);
  // 5. absolute volumes
  assert.equal(r.vCem.toFixed(4), "0.1181");
  assert.equal(r.vWater.toFixed(4), "0.1860");
  assert.equal(r.vAir.toFixed(4), "0.0150");
  assert.equal(r.vAgg.toFixed(4), "0.6809");
  // 6. CA fraction 0.62 -> FA 686, CA 1140
  assert.equal(r.caFraction, 0.62);
  assert.equal(r.faKg, 686);
  assert.equal(r.caKg, 1140);
  // 7. ratio 1:1.84:3.06:0.50; density 2384
  assert.equal(r.ratioFA.toFixed(2), "1.84");
  assert.equal(r.ratioCA.toFixed(2), "3.06");
  assert.equal(r.densityKgM3, 2384);
  assert.equal(r.densityOk, true);
  // 8. batch 0.5 m3: cement 186 kg (4 bags), water 93 L, FA 343, CA 570
  assert.equal(r.batchHalf.cementKg, 186);
  assert.equal(r.batchHalf.cementBagsOrder, 4);
  assert.equal(r.batchHalf.waterL, 93);
  assert.equal(r.batchHalf.faKg, 343);
  assert.equal(r.batchHalf.caKg, 570);
  // batch 1 m3
  assert.equal(r.batch.cementKg, 372);
  assert.equal(r.batch.cementBagsOrder, 8);
  assert.equal(r.batch.waterL, 186);
  assert.equal(r.batch.faKg, 686);
  assert.equal(r.batch.caKg, 1140);
  assert.deepEqual(r.errors, []);
});

test("IS slump-75 mm preset (spec §5.7)", () => {
  const inp: MixDesignInputs = { ...defaultMixDesignInputs(), slumpMm: 75 };
  const r = calcMixDesign(inp);
  // W = 186 x 1.03 = 191.58 -> 192 L; C = 192/0.50 = 384 (7.68 -> 8 bags)
  assert.equal(r.waterKg, 192);
  assert.equal(r.cementKg, 384);
  assert.equal(r.cementBagsExact.toFixed(2), "7.68");
  assert.equal(r.cementBagsOrder, 8);
  assert.equal(r.vAgg.toFixed(4), "0.6711");
  assert.equal(r.faKg, 676);
  // NOTE: the spec prints CA 1,124 kg, but its own V_agg (0.6711) gives
  // 0.6711 x 0.62 x 2700 = 1,123.4 -> 1,123 kg. The engine uses the
  // self-consistent 1,123 (ratio 2.92, not 2.93).
  assert.equal(r.caKg, 1123);
  assert.equal(r.ratioFA.toFixed(2), "1.76");
  assert.equal(r.ratioCA.toFixed(2), "2.92");
});

test("ACI cross-check M25 (spec §5.7) — w/c keyed to f'cr, not f'c", () => {
  const inp: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    method: "ACI",
    slumpMm: 75,
  };
  const r = calcMixDesign(inp);
  // f'cr = 25 + 8.3 = 33.3; W = 205 (19 mm, 75-100 mm slump); air 2.0%
  assert.equal(r.targetStrength, 33.3);
  assert.equal(r.waterKg, 205);
  assert.equal(r.vAir.toFixed(3), "0.020");
  // w/c for 33.3 MPa = 0.49 (NOT 0.61, which is what entering f'c 25 gives)
  assert.equal(r.wcStrength, 0.49);
  assert.equal(r.wcGoverning, 0.49);
  // C = 205/0.49 = 418; CA = 0.64 x 1600 = 1024
  assert.equal(r.cementKg, 418);
  assert.equal(r.caKg, 1024);
  assert.equal(r.vCem.toFixed(4), "0.1327");
  assert.equal(r.vWater.toFixed(3), "0.205");
  assert.equal(r.vCA.toFixed(4), "0.3793");
  assert.equal(r.vFA.toFixed(4), "0.2630");
  assert.equal(r.faKg, 697);
  assert.equal(r.ratioFA.toFixed(2), "1.67");
  assert.equal(r.ratioCA.toFixed(2), "2.45");
  assert.equal(r.densityKgM3, 2344);
});

test("ACI with plant SD uses max(f'c+1.34s, f'c+2.33s-3.45)", () => {
  const inp: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    method: "ACI",
    sdMode: "custom",
    sdCustom: 4,
  };
  const r = calcMixDesign(inp);
  // max(25+5.36, 25+9.32-3.45) = max(30.36, 30.87) = 30.87
  approx(r.targetStrength, 30.87);
  // w/c for 30.87 interp 30->0.54 / 35->0.47 = 0.528 -> 0.53
  assert.equal(r.wcStrength, 0.53);
});

test("M30 reference vector (spec §5.7): fm 38.25 -> 38.5, W 197, PCE 167", () => {
  const inp: MixDesignInputs = { ...defaultMixDesignInputs(), fck: 30, slumpMm: 100 };
  const r = calcMixDesign(inp);
  assert.equal(r.targetStrength, 38.25);
  assert.equal(r.targetStrengthDisplay, 38.5);
  assert.equal(r.waterKg.toFixed(0), "197");
  assert.ok(r.cementKg <= 450, `cement ${r.cementKg} must be <= 450`);
  assert.ok(r.cementKg >= 300, `cement ${r.cementKg} must be >= Cmin 300`);
  const pce: MixDesignInputs = { ...inp, pceReductionPct: 15 };
  const rp = calcMixDesign(pce);
  assert.equal(rp.waterKg.toFixed(0), "167");
});

test("Cmin override: low water raises cement, actual w/c drops", () => {
  // M20, Mild, 40 mm angular: W = 165, w/c strength for fm 26.6 = 0.55,
  // C = 165/0.55 = 300 = Cmin exactly; use rounded aggregate to force below.
  const inp: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    fck: 20,
    maxAggMm: 40,
    aggType: "rounded",
    exposure: "Severe", // Cmin 320, max w/c 0.45
  };
  const r = calcMixDesign(inp);
  // W = 150, w/c strength (fm 26.6) = 0.55, durability 0.45 governs -> C = 150/0.45 = 333
  assert.equal(r.wcGoverning, 0.45);
  assert.equal(r.cementKg, 333);
  assert.equal(r.cementRaisedToMinimum, false);

  // Force a Cmin raise: small water, high w/c. M10 Mild, 40 mm rounded, slump 25:
  // W = 150 x 0.97 = 145.5; w/c strength (fm 15.775, below table) = 0.55; C = 264.5 < 300.
  const inp2: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    fck: 10,
    maxAggMm: 40,
    aggType: "rounded",
    slumpMm: 25,
    exposure: "Mild",
  };
  const r2 = calcMixDesign(inp2);
  assert.equal(r2.cementKg, 300);
  assert.equal(r2.cementRaisedToMinimum, true);
  assert.equal(r2.wcActual, 0.49); // 145.5/300 = 0.485 -> 0.49
  assert.equal(r2.governedBy, "cement-minimum");
});

test("cement above 450 kg/m3 is an error in IS mode, a warning in ACI", () => {
  // IS: M60, 10 mm angular, slump 175 -> W = 208 x 1.15 = 239.2; w/c 0.40 -> C = 598
  const inp: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    fck: 60,
    maxAggMm: 10,
    slumpMm: 175,
    exposure: "Mild",
  };
  const r = calcMixDesign(inp);
  assert.ok(r.cementKg > 450, `cement ${r.cementKg} should exceed 450`);
  assert.ok(r.errors.some((e) => e.includes("450")), `errors: ${r.errors.join("; ")}`);

  const aci: MixDesignInputs = { ...inp, method: "ACI" };
  const ra = calcMixDesign(aci);
  assert.deepEqual(ra.errors.filter((e) => e.includes("450")), []);
  assert.ok(ra.warnings.some((w) => w.includes("450")));
});

test("durability table: Moderate 300/0.50/M25 governs over strength when lower", () => {
  // M25, Severe exposure: durability max 0.45 < strength 0.50
  const inp: MixDesignInputs = { ...defaultMixDesignInputs(), exposure: "Severe" };
  const r = calcMixDesign(inp);
  assert.equal(r.wcDurability, 0.45);
  assert.equal(r.wcGoverning, 0.45);
  assert.equal(r.governedBy, "durability");
  assert.equal(r.cementKg, 413); // 186/0.45 = 413.3 -> 413 kg (whole kg)
});

test("manual w/c above the durability max is an error", () => {
  const inp: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    wcMode: "manual",
    wcManual: 0.6,
    exposure: "Moderate",
  };
  const r = calcMixDesign(inp);
  assert.ok(r.errors.some((e) => e.includes("exceeds the durability maximum")));
});

test("SSD moisture correction: batch weights, water floored at 80%", () => {
  const inp: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    moistureFA: 0.05,
    moistureCA: 0.02,
  };
  const r = calcMixDesign(inp);
  // FA batch = 686 x 1.05 = 720.3; CA batch = 1140 x 1.02 = 1162.8
  assert.equal(r.batch.faKg.toFixed(1), "720.3");
  assert.equal(r.batch.caKg.toFixed(1), "1162.8");
  // Raw W batch = 186 - 686x0.05 - 1140x0.02 = 128.9, below the 0.8xW
  // floor (148.8 L) — so the floor applies, with a warning.
  assert.equal(r.batch.waterL, 0.8 * 186);
  assert.equal(r.waterFloorApplied, true);
  assert.equal(r.moistureCorrected, true);

  // Small moisture stays above the floor: 186 - 686x0.02 - 1140x0.01 = 160.9
  const mild: MixDesignInputs = {
    ...defaultMixDesignInputs(),
    moistureFA: 0.02,
    moistureCA: 0.01,
  };
  const rm = calcMixDesign(mild);
  assert.equal(rm.batch.waterL.toFixed(1), "160.9");
  assert.equal(rm.waterFloorApplied, false);

  // Extreme moisture floors the water at 80% of design water.
  const wet: MixDesignInputs = { ...inp, moistureFA: 0.1, moistureCA: 0.1 };
  const rw = calcMixDesign(wet);
  assert.equal(rw.batch.waterL, 0.8 * 186);
  assert.equal(rw.waterFloorApplied, true);
});

test("CA fraction: Table 5 values, w/c adjustment, pumped -10%", () => {
  assert.equal(caFractionIS(20, "II", 0.5, false), 0.62);
  assert.equal(caFractionIS(20, "II", 0.45, false), 0.63);
  assert.equal(caFractionIS(20, "II", 0.55, false), 0.61);
  assert.equal(caFractionIS(20, "II", 0.5, true), 0.558);
  assert.equal(caFractionIS(10, "I", 0.5, false), 0.44);
  assert.equal(caFractionIS(40, "IV", 0.5, false), 0.74);
});

test("IS water table is 186 for 20 mm angular — not multicalci's 175", () => {
  const r = calcMixDesign(defaultMixDesignInputs());
  assert.equal(r.waterBaseKg, 186);
  const rounded = calcMixDesign({
    ...defaultMixDesignInputs(),
    aggType: "rounded",
  });
  assert.equal(rounded.waterBaseKg, 170);
});

test("validation catches out-of-range inputs", () => {
  const bad = validateMixDesign({ ...defaultMixDesignInputs(), slumpMm: 200 });
  assert.ok(bad.some((e) => e.includes("Slump")));
  const bad2 = validateMixDesign({ ...defaultMixDesignInputs(), sgFA: 3.0 });
  assert.ok(bad2.some((e) => e.includes("Fine aggregate SG")));
  assert.deepEqual(validateMixDesign(defaultMixDesignInputs()), []);
});

test("w/c strength curve interpolates and clamps flat outside the table", () => {
  assert.equal(wcFromStrengthIS(31.6).wc, 0.5);
  approx(wcFromStrengthIS(35).wc, 0.5 + ((35 - 31.6) / (38.3 - 31.6)) * (0.45 - 0.5));
  assert.equal(wcFromStrengthIS(20).clamped, true);
  assert.equal(wcFromStrengthIS(20).wc, 0.55);
  assert.equal(wcFromStrengthIS(60).clamped, true);
  assert.equal(wcFromStrengthIS(60).wc, 0.4);
  assert.equal(wcFromStrengthACI(33.3).wc.toFixed(2), "0.49");
});
