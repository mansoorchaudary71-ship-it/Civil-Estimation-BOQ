/**
 * BBS engine tests — run with:
 *   npx tsx --test src/lib/__tests__/bbsCalc.test.ts
 * (plain node:test + node:assert, same pattern as toolRoutes.test.ts)
 *
 * Every worked example is from the G3 audit spec. Rounding note: the
 * spec's printed weights use the 3-dp table unit weight (0.394 kg/m for
 * Ø8), while this engine uses the precise d^2/162.28 value (0.39438);
 * the two differ by at most 0.02 kg on these examples, so weight
 * assertions use a ±0.05 kg tolerance and length/count assertions are
 * exact.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcBbsRow,
  calcBbsTotals,
  cutLengthMm,
  validateBbsRow,
  bbsWorkedExample,
  spiralLengthMm,
  helixTurnLengthMm,
  type BbsRowInput,
  type BbsRowResult,
} from "../bbsCalc";
import { STOCK_BAR_M } from "../steelCalc";

const approx = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected} (±${tol}), got ${actual}`);

const row = (r: BbsRowResult | { errors: string[] }): BbsRowResult => {
  assert.ok(!("errors" in r), `expected a row, got errors: ${JSON.stringify(r)}`);
  return r as BbsRowResult;
};

const base: BbsRowInput = {
  member: "B1",
  shape: "rect-stirrup",
  diaMm: 8,
  members: 1,
  barsPerMember: 1,
  coverMm: 40,
  hookStandard: "IS 2502",
  lapX: 50,
  widthMm: 300,
  depthMm: 450,
};

test("rectangular stirrup demo: W300 x D450, cover 40, dia 8 -> 1,244 mm / 0.49 kg", () => {
  const r = row(calcBbsRow(base));
  assert.equal(r.cutLengthMm, 1244);
  assert.equal(r.cutLengthM, 1.244);
  approx(r.weightKg, 0.49, 0.01);
  assert.ok(r.fieldApproxNote?.includes("1.372"), "field shortcut note must quote 1.372 m");
  assert.ok(r.fieldApproxNote?.includes("10.3%"), "field shortcut note must quote 10.3%");
  assert.equal(r.barsToOrderCount, 1);
});

test("worked example: 25 stirrups -> 31.10 m, 12.27 kg net, 12.88 kg @5%, Rs 3,478", () => {
  const r = row(calcBbsRow(bbsWorkedExample()));
  assert.equal(r.cutLengthMm, 1244);
  approx(r.totalLengthM, 31.1, 1e-9);
  approx(r.weightKg, 12.27, 0.05);
  assert.equal(r.barsToOrderCount, 3);
  const totals = calcBbsTotals([r], 5, 270, STOCK_BAR_M);
  approx(totals.netWeightKg, 12.27, 0.05);
  approx(totals.orderWeightKg, 12.88, 0.05);
  assert.equal(Math.round(totals.cost ?? 0), 3478);
  assert.equal(totals.perDia.length, 1);
  assert.equal(totals.perDia[0].diaMm, 8);
  assert.equal(totals.totalBarsToOrder, 3);
});

test("other shapes spot-check (G3 spec §1)", () => {
  // Straight Ø12, 3000 mm -> 2.66 kg
  const straight = row(calcBbsRow({ ...base, shape: "straight", diaMm: 12, spanMm: 3000 }));
  assert.equal(straight.cutLengthMm, 3000);
  approx(straight.weightKg, 2.66, 0.05);
  // U-hook Ø12 -> 3000+240-96 = 3144 mm, 2.79 kg
  const uhook = row(calcBbsRow({ ...base, shape: "u-hook", diaMm: 12, spanMm: 3000 }));
  assert.equal(uhook.cutLengthMm, 3144);
  approx(uhook.weightKg, 2.79, 0.05);
  // L-hook Ø12 -> 3000+240-48 = 3192 mm, 2.83 kg
  const lhook = row(calcBbsRow({ ...base, shape: "l-hook", diaMm: 12, spanMm: 3000 }));
  assert.equal(lhook.cutLengthMm, 3192);
  approx(lhook.weightKg, 2.83, 0.05);
  // Cranked: S=3000, T=150, cover 40, Ø8, 2 cranks -> 3148.08 mm
  const cranked = row(
    calcBbsRow({ ...base, shape: "cranked", spanMm: 3000, slabThicknessMm: 150, cranks: 2 }),
  );
  approx(cranked.cutLengthMm, 3148.08, 0.01);
  // U-stirrup: A=220, B=370 -> 220+740+160-32 = 1088 mm
  const ustir = row(calcBbsRow({ ...base, shape: "u-stirrup" }));
  assert.equal(ustir.cutLengthMm, 1088);
});

test("spiral: col Ø300, pitch 150, H=3000, cover 40, Ø8 -> 21 turns, 14.497 m, 5.72 kg", () => {
  const r = row(
    calcBbsRow({ ...base, shape: "spiral", colDiaMm: 300, pitchMm: 150, heightMm: 3000 }),
  );
  approx(r.cutLengthM, 14.497, 0.01);
  approx(r.weightKg, 5.72, 0.05);
  // Shared helix: turn length sqrt((pi*212)^2 + 150^2) = 682.7 mm
  approx(helixTurnLengthMm(212, 150), 682.7, 0.5);
  const s = spiralLengthMm(212, 150, 3000, 2 * 10 * 8);
  assert.equal(s.turns, 21);
});

test("circular ring: dia 300, cover 40, Ø8 -> pi*212 + 160 = 826 mm", () => {
  const r = row(calcBbsRow({ ...base, shape: "circular-ring", colDiaMm: 300 }));
  approx(r.cutLengthMm, Math.PI * 212 + 160, 0.01);
  approx(r.weightKg, 0.33, 0.01);
});

test("laps: a bar longer than one 12 m stock bar gets 50d laps", () => {
  const r = row(calcBbsRow({ ...base, shape: "straight", diaMm: 12, spanMm: 25000 }));
  // cut 25 m -> 3 stock bars -> 2 laps of 50*12 = 600 mm each; total 26.2 m
  assert.equal(r.lapsPerBar, 2);
  assert.equal(r.lapLengthPerBarMm, 1200);
  approx(r.totalLengthM, 26.2, 1e-9);
  assert.equal(r.barsToOrderCount, 3);
});

test("validation: blank member, bad dia, non-integer counts, cover exceeding section", () => {
  assert.ok(validateBbsRow({ ...base, member: " " }).some((e) => e.includes("Member")));
  assert.ok(validateBbsRow({ ...base, diaMm: 14 }).some((e) => e.includes("diameter")));
  assert.ok(validateBbsRow({ ...base, members: 1.5 }).some((e) => e.includes("whole number")));
  assert.ok(validateBbsRow({ ...base, barsPerMember: 0 }).some((e) => e.includes("whole number")));
  assert.ok(validateBbsRow({ ...base, widthMm: 80 }).some((e) => e.includes("Cover + bar dia exceeds")));
  assert.ok(validateBbsRow({ ...base, coverMm: 5 }).some((e) => e.includes("Cover must be")));
  assert.ok(validateBbsRow({ ...base, pitchMm: 10, shape: "spiral", colDiaMm: 300, heightMm: 3000 }).some((e) => e.includes("Pitch")));
  assert.deepEqual(validateBbsRow(base), []);
  const bad = calcBbsRow({ ...base, member: "" });
  assert.ok("errors" in bad && bad.errors.length > 0, "invalid row must return errors, never a 0 kg row");
});

test("cutLengthMm rejects degenerate inputs (L <= 0 is never added)", () => {
  const { lengthMm } = cutLengthMm({ ...base, shape: "straight", spanMm: 0 });
  assert.equal(lengthMm, 0);
});

test("totals: per-dia subtotals, tonnes, maunds, null rate -> null cost", () => {
  const r1 = row(calcBbsRow(bbsWorkedExample()));
  const r2 = row(calcBbsRow({ ...base, shape: "straight", diaMm: 20, spanMm: 12000, members: 2, barsPerMember: 1 }));
  const t = calcBbsTotals([r1, r2], 5, null);
  assert.equal(t.cost, null);
  assert.equal(t.costComplete, false);
  assert.equal(t.perDia.length, 2);
  approx(t.tonnes, t.orderWeightKg / 1000, 1e-9);
  approx(t.maunds, t.orderWeightKg / 40, 1e-9);
  // 2 x 12 m of Ø20 = 24 m -> 2 stock bars for that dia
  assert.equal(t.perDia.find((p) => p.diaMm === 20)?.bars, 2);
});
