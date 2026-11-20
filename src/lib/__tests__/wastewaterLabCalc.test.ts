/** Wastewater lab tests — run with: npx tsx --test src/lib/__tests__/wastewaterLabCalc.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcBod, calcCod, calcEffluentScreen } from "../wastewaterLabCalc";

const BOD_DEFAULTS = { initialDoMgL: 8.5, finalDoMgL: 3.2, sampleVolumeMl: 10, bottleVolumeMl: 300 };
const COD_DEFAULTS = { blankTitrantMl: 25, sampleTitrantMl: 12.5, normality: 0.1, sampleVolumeMl: 50 };

test("worked example §2: defaults -> BOD 159 mg/L, COD 200 mg/L, ratio 1.26", () => {
  const bod = calcBod(BOD_DEFAULTS);
  assert.ok(Math.abs(bod.bodMgL - 159) < 0.01, `BOD ${bod.bodMgL}`);
  assert.ok(Math.abs(bod.dilutionFactorP - 0.0333) < 0.0001);
  const cod = calcCod(COD_DEFAULTS);
  assert.ok(Math.abs(cod.codMgL - 200) < 0.01, `COD ${cod.codMgL}`);
  const screen = calcEffluentScreen({ bod: BOD_DEFAULTS, cod: COD_DEFAULTS });
  assert.ok(Math.abs(screen.codBodRatio - 1.26) < 0.02, `ratio ${screen.codBodRatio}`);
  assert.ok(/unusually low/i.test(screen.codBodInterpretation));
});

test("PEQS thresholds: BOD 159 / COD 200 meet the sewer limits only, not inland", () => {
  const screen = calcEffluentScreen({ bod: BOD_DEFAULTS, cod: COD_DEFAULTS });
  assert.equal(screen.bod.status, "meets-sewer-only");
  assert.equal(screen.cod.status, "meets-sewer-only");
  // The old bands (<30 BOD / <250 COD "Safe") were wrong: 159 is NOT safe inland.
  assert.notEqual(screen.bod.status, "meets-inland");
});

test("clean sample meets inland limits", () => {
  const bod = calcBod({ initialDoMgL: 8, finalDoMgL: 6, sampleVolumeMl: 100, bottleVolumeMl: 300 });
  assert.ok(Math.abs(bod.bodMgL - 6) < 0.01);
  assert.equal(bod.status, "meets-inland");
  const cod = calcCod({ blankTitrantMl: 25, sampleTitrantMl: 22, normality: 0.1, sampleVolumeMl: 50 });
  assert.ok(Math.abs(cod.codMgL - 48) < 0.01);
  assert.equal(cod.status, "meets-inland");
});

test("APHA validity checks are named, not generic", () => {
  const lowFinal = calcBod({ initialDoMgL: 8.5, finalDoMgL: 0.5, sampleVolumeMl: 10, bottleVolumeMl: 300 });
  assert.ok(lowFinal.validityErrors.some((e) => /below 1\.0/.test(e)));
  const lowDepletion = calcBod({ initialDoMgL: 8.5, finalDoMgL: 7.5, sampleVolumeMl: 10, bottleVolumeMl: 300 });
  assert.ok(lowDepletion.validityErrors.some((e) => /under 2\.0/.test(e)));
});

test("validation rejects impossible inputs", () => {
  assert.throws(() => calcBod({ ...BOD_DEFAULTS, sampleVolumeMl: 400 }), /cannot exceed the bottle/);
  assert.throws(() => calcBod({ ...BOD_DEFAULTS, finalDoMgL: 9 }), /lower than initial/);
  assert.throws(() => calcCod({ ...COD_DEFAULTS, sampleTitrantMl: 30 }), /cannot exceed the blank/);
});

test("TSS screen uses the 200 mg/L PEQS limit", () => {
  const screen = calcEffluentScreen({ bod: BOD_DEFAULTS, cod: COD_DEFAULTS, tssMgL: 250 });
  assert.equal(screen.tssStatus, "exceeds");
  const ok = calcEffluentScreen({ bod: BOD_DEFAULTS, cod: COD_DEFAULTS, tssMgL: 100 });
  assert.equal(ok.tssStatus, "meets-inland");
});
