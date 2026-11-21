/**
 * Prestressed concrete engine tests — G7 spec §4.10 + VTU golden test.
 * Run: npx tsx --test src/lib/__tests__/prestressCalc.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { designPrestress, defaultPrestressInputs } from "../prestressCalc";

const approx = (a: number, e: number, tol: number) =>
  assert.ok(Math.abs(a - e) <= tol, `expected ${e} (±${tol}), got ${a}`);

// VTU July 2021 (17CV82) worked example inputs that reproduce its table:
// sigma0 = 1000 MPa, m = 6 (Es 210000 / Ec 35000), fc = 7.11 MPa,
// creep phi = 1.6, relaxation 5%.
const vtuBase = {
  useSectionBuilder: false, areaMm2: 200000, inertiaMm4: 4.0e9,
  p0KN: 1000, apMm2: 1000, fpuMpa: 1860, fck: 30,
  esMpa: 210000, ecMpa: 35000, spanM: 20, eccentricityMm: 92,
  creepCoeff: 1.6, relaxationPct: 5,
};

test("VTU golden test, pre-tension: total 223.9 MPa (22.3%)", () => {
  const r = designPrestress({ ...vtuBase, type: "pre", shrinkageStrain: 0.0003 });
  approx(r.lossElasticMpa, 42.66, 1.5);
  approx(r.lossCreepMpa, 68.25, 2);
  approx(r.lossShrinkageMpa, 63, 1);
  approx(r.lossRelaxationMpa, 50, 1);
  approx(r.totalLossMpa, 223.9, 3);
  approx(r.pctLoss, 22.3, 0.4);
});

test("VTU golden test, post-tension: total 217.6 MPa (21.8%) within 3%", () => {
  const r = designPrestress({
    ...vtuBase, type: "post", shrinkageStrain: 0.0002, mu: 0.2, kPerM: 0.0005, slipMm: 2,
  });
  approx(r.totalLossMpa, 217.6, 7);
  approx(r.pctLoss, 21.8, 0.8);
});

test("defaults are sane: total loss inside the 15-25% band, jacking OK", () => {
  const r = designPrestress();
  assert.equal(r.errors.length, 0);
  assert.equal(r.lossBandOk, true);
  assert.ok(r.pctLoss >= 15 && r.pctLoss <= 25);
  assert.equal(r.jackingOk, true);
  assert.equal(r.initialStressMpa, 1250);
  // Ultimate moment uses the tendon depth d = D/2 + e = 400 + 120 = 520
  // mm (old code: D − 50 = 750 mm, Mu 783 kNm — 44% high).
  approx(r.muKNm, 543.1, 0.5);
  // Compression limits (IS 1343 Cl. 22.7): transfer 0.5·fck = 15 MPa,
  // service 0.33·fck = 9.9 MPa — defaults pass both (5.88 / 9.71 MPa).
  assert.ok(r.stressBottomTransferMpa <= 15);
  assert.ok(r.stressTopServiceMpa <= 9.9);
});

test("ultimate moment: T-section uses the flange width, rectangular uses b", () => {
  const rect = designPrestress();
  approx(rect.muKNm, 543.1, 0.5);
  const t = designPrestress({ sectionKind: "tee" });
  // xu capped by the flange width 600 mm: xu = 199.8 mm (not 239.2),
  // so Mu = 564.5 kNm — the old code used b = 300 mm for both.
  approx(t.muKNm, 564.5, 0.5);
  assert.ok(t.muKNm > rect.muKNm);
});

test("compression over the IS 1343 limit fails service, not just tension", () => {
  // P0 = 2600 kN on Ap = 2100 mm²: transfer bottom ≈ 15.3 MPa > 0.5·fck.
  const r = designPrestress({ p0KN: 2600, apMm2: 2100 });
  assert.equal(r.serviceOk, false);
  assert.ok(r.warnings.some((w) => w.includes("0.5·fck")), "must warn on the transfer compression limit");
});

test("pre-tensioned shrinkage defaults to 0.0003 when left at the post value", () => {
  // The defaults object carries 0.0002 (post-tension); a pre-tensioned
  // run that leaves the field untouched must use 0.0003 (IS 1343).
  const r = designPrestress({ type: "pre" });
  approx(r.lossShrinkageMpa, 63, 0.5); // 0.0003 x 210000
});

test("old defaults produced 42.6% loss and now warn", () => {
  const r = designPrestress({
    useSectionBuilder: false, areaMm2: 150000, inertiaMm4: 2.8e9,
    eccentricityMm: 250, p0KN: 1000, apMm2: 800,
    shrinkageStrain: 0.0003,
  });
  assert.ok(r.pctLoss > 25);
  assert.ok(r.warnings.some((w) => w.includes("15–25%")));
});

test("jacking limit: sigma0 above 0.8*fpu fails", () => {
  const r = designPrestress({ p0KN: 1400 });
  assert.equal(r.jackingOk, false);
  assert.ok(r.warnings.some((w) => w.includes("jacking")));
});

test("section builder: rectangular 300x800 gives A=240,000 mm2", () => {
  const r = designPrestress({ bMm: 300, dMm: 800 });
  assert.equal(r.areaMm2, 240000);
  assert.ok(r.inertiaMm4 > 0);
});

test("loss vs distance is non-increasing in stress from the jacking end", () => {
  const r = designPrestress();
  const rows = r.lossVsDistance;
  assert.equal(rows.length, 3);
  assert.ok(rows[0].stressMpa >= rows[2].stressMpa);
});
