/**
 * Pile engine tests — G7 spec §4.3 + Firgelli golden vector.
 * Run: npx tsx --test src/lib/__tests__/pileCalc.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designPile, defaultPileInputs, nqForPhi, alphaForCu } from "../pileCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

test("Firgelli golden vector: Qb=942, Qs=1178, Qu=2121, Qall=848 kN", () => {
  const r = designPile({ directSigmaVTipKPa: 120, directNq: 40, directFsKPa: 50, fos: 2.5 });
  approx(r.qbKN, 942, 2);
  approx(r.qsKN, 1178, 2);
  approx(r.quKN, 2121, 3);
  approx(r.qallKN, 848, 2);
  assert.equal(r.requiredPiles, 6); // ceil(5000/848)
});

test("Converse-Labarre group efficiency for 2x3 group at 1.5 m spacing", () => {
  const r = designPile({ directSigmaVTipKPa: 120, directNq: 40, directFsKPa: 50 });
  approx(r.groupEta, 0.761, 0.01);
  assert.ok(r.groupCapacityKN > 0);
});

test("clay alpha-method: Qs = sum alpha*cu*pi*D*L, Qb = 9*cu*Ab", () => {
  const r = designPile({
    soilType: "clay",
    layers: [{ thicknessM: 15, gammaKNm3: 18, cuKPa: 50 }],
  });
  approx(r.qsKN, 589, 3);
  approx(r.qbKN, 88, 2);
  assert.ok(r.blockCapacityKN != null);
  assert.equal(r.groupGoverns, "single-pile group");
});

test("spacing below 2.5D is an error", () => {
  const r = designPile({ spacingM: 1.0 });
  assert.ok(r.errors.some((e) => e.includes("2.5D")));
});

test("Nq and alpha tables are sane", () => {
  assert.equal(nqForPhi(30), 20);
  assert.ok(nqForPhi(40) > nqForPhi(30));
  assert.equal(alphaForCu(25), 0.9);
  assert.equal(alphaForCu(100), 0.5);
});
