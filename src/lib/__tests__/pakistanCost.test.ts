/**
 * pakistanCost tests — Step 5 (pakistan-cost-calculator engine; the
 * retired cost-guide-pakistan alias rendered this same engine).
 * Pins the 0.75-coverage floor multiplier and the marla toggle that
 * moves the answer ~21% between society (225) and revenue (272.25).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  floorMultiplier,
  plotToSqft,
  pakistanCost,
  pakistanCostBothStandards,
} from "../pakistanCost";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test("5 marla, Lahore, standard, G+1: covered 1,687.5 sqft, Rs 64.1–75.9 lakh", () => {
  const r = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 2,
  });
  assert.equal(r.plotSqft, 1125);
  assert.equal(r.coveredSqft, 1687.5);
  assert.equal(r.rateMin, 3800);
  assert.equal(r.rateMax, 4500);
  assert.equal(r.costMin, 6412500);
  assert.equal(r.costMax, 7593750);
  assert.equal(r.costAvg, 7003125);
  assert.equal(r.error, undefined);
});

test("floor multiplier = 0.75 coverage x floors; basement adds a floor", () => {
  assert.equal(floorMultiplier(1), 0.75);
  assert.equal(floorMultiplier(2), 1.5);
  const base = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 1,
  });
  const withBasement = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 1, basement: true,
  });
  assert.equal(base.coveredSqft, 843.75);
  assert.equal(withBasement.coveredSqft, 1687.5);
});

test("marla toggle: revenue marla costs ~21% more than society marla", () => {
  const both = pakistanCostBothStandards({
    plotArea: 5, plotUnit: "marla", city: "lahore", tier: "standard", floors: 2,
  });
  assert.equal(both.society225.plotSqft, 1125);
  assert.equal(both.revenue272.plotSqft, 1361.25);
  assert.equal(both.revenue272.coveredSqft, 2041.875);
  assert.equal(both.revenue272.costMin, 7759125);
  approx(both.revenue272.costMin / both.society225.costMin, 272.25 / 225, 0.001);
});

test("plot conversions: kanal = 20 marla, sqyd = 9 sqft", () => {
  assert.equal(plotToSqft(1, "kanal", "society225"), 4500);
  assert.equal(plotToSqft(1, "kanal", "revenue272"), 5445);
  assert.equal(plotToSqft(100, "sqyd", "society225"), 900);
  assert.equal(plotToSqft(1000, "sqft", "society225"), 1000);
});

test("grey tier is 100% grey (no finishing split); turnkey splits 55/45", () => {
  const grey = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "grey", floors: 1,
  });
  assert.equal(grey.finishCostMin, 0);
  assert.equal(grey.greyCostMin, grey.costMin);
  const std = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 1,
  });
  approx(std.greyCostMin + std.finishCostMin, std.costMin, 0.01);
});

test("thumb-rule materials on covered area", () => {
  const r = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 2,
  });
  assert.equal(r.materials.cementBags, 675); // 1687.5 x 0.4
  assert.equal(r.materials.bricks, 16875); // 1687.5 x 10
  assert.equal(r.materials.steelKg, 5906); // 1687.5 x 3.5, rounded
});

test("validation: area > 0, floors 1-5", () => {
  const bad = pakistanCost({
    plotArea: 0, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 2,
  });
  assert.equal(bad.error, "Plot area must be greater than 0.");
  const many = pakistanCost({
    plotArea: 5, plotUnit: "marla", marla: "society225",
    city: "lahore", tier: "standard", floors: 6,
  });
  assert.equal(many.error, "Floors must be between 1 (ground) and 5 (G+4).");
});
