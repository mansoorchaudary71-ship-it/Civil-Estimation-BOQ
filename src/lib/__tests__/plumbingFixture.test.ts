/** Plumbing fixture tests — run with: npx tsx --test src/lib/__tests__/plumbingFixture.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcPlumbing } from "../plumbingFixture";

test("worked example: 2 WC tank, 2 basin, 2 shower, 1 kitchen, 1 WM -> 17 WSFU, Q about 1.03 L/s, 32 mm main", () => {
  const r = calcPlumbing({
    fixtures: [
      { kind: "wcTank", count: 2 },
      { kind: "basin", count: 2 },
      { kind: "bathShower", count: 2 },
      { kind: "kitchenSink", count: 1 },
      { kind: "washingMachine", count: 1 },
    ],
  });
  assert.equal(r.totalWsfu, 17);
  assert.ok(Math.abs(r.designFlowLs - 1.03) < 0.02, `Q ${r.designFlowLs}`);
  assert.equal(r.mainDiameterMm, 32);
  assert.equal(r.tankLitres, 3785);
  assert.ok(Math.abs(r.tankGallons - 1000) < 1);
  assert.ok(r.pumpKw > 0 && r.pumpKw < 2);
});

test("flush-valve WC dominates: 10 WSFU each", () => {
  const r = calcPlumbing({ fixtures: [{ kind: "wcValve", count: 2 }, { kind: "basin", count: 2 }] });
  assert.equal(r.totalWsfu, 22);
  assert.ok(r.designFlowLs > 1.1);
});

test("validation rejects empty fixture list", () => {
  assert.throws(() => calcPlumbing({ fixtures: [] }), /at least one fixture/);
  assert.throws(() => calcPlumbing({ fixtures: [{ kind: "basin", count: 0 }] }), /greater than 0/);
});
