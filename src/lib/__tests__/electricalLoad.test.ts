/** Electrical load tests — run with: npx tsx --test src/lib/__tests__/electricalLoad.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcElectricalLoad } from "../electricalLoad";

test("worked example §4.1: connected 8.5 kW, DF 0.7 -> demand 5.95 kW, I 28.7 A, Id 35.9 A, 40 A breaker, 6 mm2 cable", () => {
  const r = calcElectricalLoad({
    appliances: [{ name: "Whole-house load", watts: 8500, quantity: 1, diversity: 0.7 }],
    phase: "single", voltageV: 230, powerFactor: 0.9, cableLengthM: 20, ambientC: 40,
  });
  assert.equal(r.connectedKw, 8.5);
  assert.ok(Math.abs(r.demandKw - 5.95) < 0.01);
  assert.ok(Math.abs(r.demandKva - 6.61) < 0.02, `kVA ${r.demandKva}`);
  assert.ok(Math.abs(r.currentA - 28.7) < 0.2, `I ${r.currentA}`);
  assert.ok(Math.abs(r.designCurrentA - 35.9) < 0.2, `Id ${r.designCurrentA}`);
  assert.equal(r.breakerA, 40);
  assert.equal(r.cableMm2, 6);
  assert.ok(r.voltageDropOk);
  assert.ok(Math.abs(r.voltageDropPct - 1.4) < 0.3, `Vd% ${r.voltageDropPct}`);
  assert.equal(r.dbSchedule.length, 1);
});

test("three-phase current uses sqrt(3)", () => {
  const r = calcElectricalLoad({
    appliances: [{ name: "Load", watts: 10000, quantity: 1, diversity: 1 }],
    phase: "three", voltageV: 400, powerFactor: 0.9,
  });
  assert.ok(Math.abs(r.currentA - 16.04) < 0.05, `I ${r.currentA}`);
  assert.equal(r.breakerA, 25);
});

test("long run forces a larger cable on voltage drop", () => {
  const short = calcElectricalLoad({
    appliances: [{ name: "Load", watts: 8500, quantity: 1, diversity: 0.7 }],
    cableLengthM: 20,
  });
  const long = calcElectricalLoad({
    appliances: [{ name: "Load", watts: 8500, quantity: 1, diversity: 0.7 }],
    cableLengthM: 120,
  });
  assert.ok((long.cableMm2 ?? 0) > (short.cableMm2 ?? 0));
});

test("validation rejects bad inputs", () => {
  assert.throws(() => calcElectricalLoad({ appliances: [] }), /at least one appliance/);
  assert.throws(() => calcElectricalLoad({ appliances: [{ name: "X", watts: 100, quantity: 1, diversity: 1.5 }] }), /diversity/);
  assert.throws(() => calcElectricalLoad({ appliances: [{ name: "X", watts: 100, quantity: 1, diversity: 0.5 }], powerFactor: 1.5 }), /Power factor/);
});
