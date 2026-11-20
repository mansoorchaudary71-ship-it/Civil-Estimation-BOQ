import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcVolume, horizontalCylinderFillVolume, familyTankSize, validateVolume,
  DEFAULT_VOLUME_DIMS, type VolumeDims,
} from "../volumeCalc";

const approx = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} ≈ ${b} (±${tol})`);

const dims = (over: Partial<VolumeDims>): VolumeDims => ({ ...DEFAULT_VOLUME_DIMS, ...over });

test("triangular dumper 4x3x5 -> V 30.00, SA 68.06 (was 0 / 0 — the broken shape)", () => {
  const r = calcVolume("triangular-prism", dims({ baseM: 4, heightM: 3, lengthM: 5 }));
  approx(r.volumeM3, 30);
  approx(r.surfaceAreaM2, 68.06, 0.01);
});

test("parabolic cone r=2 h=3 -> V 18.85, SA ~41.08 (old code ran triangular-prism SA)", () => {
  const r = calcVolume("parabolic-cone", dims({ radiusM: 2, heightM: 3 }));
  approx(r.volumeM3, 18.85);
  approx(r.surfaceAreaM2, 41.08, 0.05);
});

test("cylinder r=1 h=3 -> 9.42 m3 = 9,425 L = 2,490 US gal", () => {
  const r = calcVolume("cylinder", dims({ radiusM: 1, heightM: 3 }));
  approx(r.volumeM3, 9.42, 0.01);
  approx(r.litres, 9424.78, 1);
  approx(r.usGallons, 2489.9, 1);
  approx(r.impGallons, 2072.9, 1);
});

test("rect tank 3x2x2, freeboard 0.2 m, dead 0.2 m -> gross 12.00, usable 9.60 m3 = 9,600 L", () => {
  const r = calcVolume("commercial-tank", dims({
    lengthM: 3, widthM: 2, heightM: 2, tankBase: "rect",
    slopedBase: false, freeboardM: 0.2, deadStorageM: 0.2,
  }));
  approx(r.grossVolumeM3!, 12);
  approx(r.usableVolumeM3!, 9.6);
  approx(r.usablePct!, 80);
  approx(r.litres, 9600);
});

test("commercial tank with sloped base uses the frustum formula h/3 x (A1+A2+sqrt(A1 A2))", () => {
  const r = calcVolume("commercial-tank", dims({
    lengthM: 3, widthM: 2, heightM: 2, tankBase: "rect",
    slopedBase: true, slopedHeightM: 0.5, freeboardM: 0.2, deadStorageM: 0.2, outletAreaM2: 0.04,
  }));
  // Sloped frustum: top 2x1=2 m2, base 6 m2 -> 0.5/3 x (6+2+sqrt12) = 1.910 m3
  approx(r.grossVolumeM3!, 12 + 1.910, 0.01);
});

test("family sizing: 6 persons x 100 L x 2 days = 1,200 L -> next standard size 1,500 L", () => {
  const { requiredLitres, nextSizeL } = familyTankSize(6, 100, 2);
  assert.equal(requiredLitres, 1200);
  assert.equal(nextSizeL, 1500);
});

test("hollow cylinder: OD 0.5, ID 0.3, L 2 -> V 0.251 m3; weight uses density for every shape", () => {
  const r = calcVolume("hollow-cylinder", dims({
    outerDiameterM: 0.5, innerDiameterM: 0.3, lengthM: 2, densityKgM3: 7850,
  }));
  approx(r.volumeM3, 0.2513, 0.001);
  approx(r.weightKg, 0.2513 * 7850, 1);
  const water = calcVolume("rect-prism", dims({ lengthM: 1, widthM: 1, heightM: 1, densityKgM3: 1000 }));
  assert.equal(water.weightKg, 1000);
});

test("horizontal cylinder fill: 100% = full cylinder, 50% = half", () => {
  approx(horizontalCylinderFillVolume(1, 3, 100), Math.PI * 3, 0.01);
  approx(horizontalCylinderFillVolume(1, 3, 50), (Math.PI * 3) / 2, 0.01);
  assert.equal(horizontalCylinderFillVolume(1, 3, 0), 0);
});

test("validation: OD must exceed ID; freeboard + dead < height", () => {
  assert.ok(
    validateVolume("hollow-cylinder", dims({ outerDiameterM: 0.3, innerDiameterM: 0.5, lengthM: 2 })).length > 0,
  );
  assert.ok(
    validateVolume("commercial-tank", dims({ lengthM: 3, widthM: 2, heightM: 2, freeboardM: 1.5, deadStorageM: 1 })).length > 0,
  );
  assert.deepEqual(validateVolume("cube", dims({ sideM: 2 })), []);
});
