import { test } from "node:test";
import assert from "node:assert/strict";
import { parseChainage, stationAreas, trapezoidalVolumes, simpsonVolumes, chainageBalance, CHAINAGE_WORKED } from "../chainageCalc";
const approx = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
test("worked: trapezoidal cut 780 / fill 1020 m³, bulked 897, shrunken 918, net −21 m³ import", () => {
  const areas = stationAreas(CHAINAGE_WORKED, 10, 1.5, 2.0);
  assert.deepEqual(areas.map((a) => [a.cutM2, a.fillM2]), [[0, 0], [26, 0], [0, 28], [0, 12]]);
  const v = trapezoidalVolumes(areas);
  approx(v.cutM3, 780); approx(v.fillM3, 1020);
  const b = chainageBalance(v.cutM3, v.fillM3, 15, 10);
  approx(b.bulkedCutM3, 897); approx(b.shrunkenFillM3, 918); approx(b.netM3, -21);
  assert.equal(b.balance, "Deficit — import material");
});
test("chainage notation 1+200 parses to 1200 m", () => {
  assert.equal(parseChainage("1+200"), 1200); assert.equal(parseChainage("0+030"), 30); assert.equal(parseChainage(450), 450);
});
test("Simpson requires equal spacing + odd count — blocked otherwise", () => {
  const areas = stationAreas(CHAINAGE_WORKED, 10, 1.5, 2.0);
  assert.throws(() => simpsonVolumes(areas), /odd/); // 4 stations
  const odd = stationAreas(CHAINAGE_WORKED.slice(0, 3), 10, 1.5, 2.0);
  const s = simpsonVolumes(odd);
  approx(s.cutM3, (30 / 3) * (0 + 4 * 26 + 0), 0.01); // 1040 m³ — larger than trapezoidal here
  const unequal = [{ chainage: 0, cutM2: 0, fillM2: 0 }, { chainage: 20, cutM2: 26, fillM2: 0 }, { chainage: 60, cutM2: 0, fillM2: 28 }];
  assert.throws(() => simpsonVolumes(unequal), /equal station spacing/);
});
