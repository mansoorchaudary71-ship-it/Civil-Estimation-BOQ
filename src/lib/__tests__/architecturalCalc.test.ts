/**
 * Architectural engine tests — run with:
 *   npx tsx --test src/lib/__tests__/architecturalCalc.test.ts
 * (plain node:test + node:assert via tsx; no npm script added — package.json
 * is a hard boundary for this wave.)
 *
 * Asserts every worked example in the G8 spec §1/§5/§8. Tolerances:
 * lengths/areas ±0.01, angles ±0.05° (wider where the spec itself rounds
 * to 1 dp, e.g. the imperial roof area 1983.1 sq ft).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ARCHITECTURAL_DISCLAIMER,
  FT_TO_M,
  KANAL_M2,
  MARLA_M2,
  calcFar,
  calcRoof,
  calcRoofCost,
  calcSetback,
  convertAreaM2,
  findPresetForPlot,
  formatLength,
  getRegionPresets,
  validatePositive,
  type RoofMaterialRates,
} from "../architecturalCalc";

function approx(actual: number, expected: number, tol = 0.01, msg?: string) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    msg ?? `expected ${actual} to be ${expected} ± ${tol}`,
  );
}

// ---------------------------------------------------------------- setback ---
test("1. Setback defaults 15x20 m residential -> F3.0/R2.0/S1.5, buildable 180.00 m²", () => {
  const r = calcSetback({
    region: "PK",
    presetId: "general-planning",
    frontageM: 15,
    depthM: 20,
    buildingType: "residential",
  });
  assert.deepEqual(r.errors, []);
  assert.equal(r.frontM, 3.0);
  assert.equal(r.rearM, 2.0);
  assert.equal(r.sideM, 1.5);
  approx(r.buildableFrontageM as number, 12.0);
  approx(r.buildableDepthM as number, 15.0);
  approx(r.buildableAreaM2 as number, 180.0);
  approx(r.setbackFootprintPct as number, 60.0);
  // No regulatory cap on the general guide: footprint IS the setback footprint.
  assert.equal(r.coverageCapM2, null);
  approx(r.buildableFootprintM2 as number, 180.0);
  assert.equal(r.binding, "setbacks");
});

test("2. Setback LDA 10-marla preset, 30x60 ft -> buildable 99.9 m², cap 117.1 m², binding setbacks", () => {
  const frontageM = 30 * FT_TO_M; // 9.144
  const depthM = 60 * FT_TO_M; // 18.288
  const r = calcSetback({
    region: "PK",
    presetId: "pk-lda-10marla",
    frontageM,
    depthM,
    buildingType: "residential",
  });
  assert.deepEqual(r.errors, []);
  approx(r.frontM as number, 10 * FT_TO_M);
  approx(r.rearM as number, 7 * FT_TO_M);
  approx(r.sideM as number, 5 * FT_TO_M);
  assert.equal(r.sideBoth, false); // 5 ft on one side only
  approx(r.buildableFrontageM as number, 7.62);
  approx(r.buildableDepthM as number, 13.11);
  approx(r.buildableAreaM2 as number, 99.9, 0.05);
  approx(r.coverageCapM2 as number, 117.1, 0.05);
  assert.equal(r.coverageCapPct, 70);
  approx(r.buildableFootprintM2 as number, 99.9, 0.05);
  assert.equal(r.binding, "setbacks");
  // The preset is SECONDARY — the maths is tested, not the regulation.
  assert.equal(r.preset?.verified, false);
});

test("3. Setback corner plot adds cornerExtraM; commercial road >18 m raises front to >=6.0 m", () => {
  const corner = calcSetback({
    region: "PK",
    presetId: "general-planning",
    frontageM: 15,
    depthM: 20,
    cornerPlot: true,
    cornerExtraM: 1.5,
    buildingType: "residential",
  });
  assert.deepEqual(corner.errors, []);
  approx(corner.buildableFrontageM as number, 10.5); // 12.0 - 1.5
  approx(corner.buildableAreaM2 as number, 157.5);

  const commercial = calcSetback({
    region: "PK",
    presetId: "general-planning",
    frontageM: 15,
    depthM: 20,
    buildingType: "commercial",
    roadWidthM: 19,
  });
  assert.deepEqual(commercial.errors, []);
  assert.equal(commercial.frontM, 6.0);
  approx(commercial.buildableDepthM as number, 12.0); // 20 - 6 - 2
  approx(commercial.buildableAreaM2 as number, 144.0);

  const commercialNarrow = calcSetback({
    region: "PK",
    presetId: "general-planning",
    frontageM: 15,
    depthM: 20,
    buildingType: "commercial",
    roadWidthM: 9,
  });
  assert.equal(commercialNarrow.frontM, 4.5);
});

test("setback: coverage cap binds when it is smaller than the setback footprint", () => {
  const r = calcSetback({
    region: "AE",
    presetId: "ae-dbc-villa",
    frontageM: 20,
    depthM: 30,
    buildingType: "residential",
  });
  assert.deepEqual(r.errors, []);
  // Setback footprint: (20-6) x (30-6) = 336 m²; cap: 40% of 600 = 240 m².
  approx(r.buildableAreaM2 as number, 336.0);
  approx(r.coverageCapM2 as number, 240.0);
  approx(r.buildableFootprintM2 as number, 240.0);
  assert.equal(r.binding, "coverage");
});

test("setback: unsourced preset values stay blank (never invented)", () => {
  const r = calcSetback({
    region: "IN",
    presetId: "in-mbbl-1000",
    frontageM: 20,
    depthM: 25,
    buildingType: "residential",
  });
  assert.equal(r.frontM, null);
  assert.equal(r.buildableAreaM2, null);
  assert.ok(r.warnings.length > 0);
  // ...but the sourced coverage/FAR still come through for the FAR tool.
  assert.equal(r.preset?.maxCoveragePct, 65);
  assert.equal(r.preset?.maxFar, 2.25);
});

// -------------------------------------------------------------------- FAR ---
test("4. FAR defaults 500 m² / 2.0 / 50% -> 1000 m², 250 m², 4 floors, binding far", () => {
  const r = calcFar({ region: "PK", plotAreaM2: 500, far: 2.0, coveragePct: 50 });
  assert.deepEqual(r.errors, []);
  approx(r.maxBuiltUpM2, 1000);
  approx(r.maxFootprintM2, 250);
  assert.equal(r.floorsByFar, 4);
  assert.equal(r.maxFloors, 4);
  assert.equal(r.binding, "far");
});

test("5. FAR LDA 10 marla 167.23 m² / 2.8 / 70% -> 468.2 m², 117.1 m², 4 floors", () => {
  const r = calcFar({ region: "PK", plotAreaM2: 167.23, far: 2.8, coveragePct: 70 });
  assert.deepEqual(r.errors, []);
  approx(r.maxBuiltUpM2, 468.2, 0.05);
  approx(r.maxFootprintM2, 117.1, 0.05);
  assert.equal(r.floorsByFar, 4);
  assert.equal(r.maxFloors, 4);
});

test("6. FAR FSI 0.4 / coverage 50% -> 0 floors + warning; coverage 0 / 101 -> validation error, never Infinity", () => {
  const zero = calcFar({ region: "PK", plotAreaM2: 500, far: 0.4, coveragePct: 50 });
  assert.deepEqual(zero.errors, []);
  assert.equal(zero.maxFloors, 0);
  assert.ok(zero.warnings.some((w) => w.includes("no full floor")));

  const cov0 = calcFar({ region: "PK", plotAreaM2: 500, far: 2.0, coveragePct: 0 });
  assert.ok(cov0.errors.length > 0);
  assert.ok(Number.isFinite(cov0.maxFloors));
  assert.notEqual(cov0.maxFloors, Infinity);

  const cov101 = calcFar({ region: "PK", plotAreaM2: 500, far: 2.0, coveragePct: 101 });
  assert.ok(cov101.errors.length > 0);
  assert.ok(Number.isFinite(cov101.maxFloors));
});

test("FAR: height and storey caps bind when they are the smallest constraint", () => {
  const byHeight = calcFar({
    region: "PK",
    plotAreaM2: 500,
    far: 2.0,
    coveragePct: 50,
    maxHeightM: 9.15, // 30 ft -> floor(9.15 / 3.05) = 3 storeys
  });
  assert.equal(byHeight.floorsByHeight, 3);
  assert.equal(byHeight.maxFloors, 3);
  assert.equal(byHeight.binding, "height");

  const byStoreys = calcFar({
    region: "PK",
    plotAreaM2: 500,
    far: 2.0,
    coveragePct: 50,
    maxHeightM: 45,
    maxStoreys: 2,
  });
  assert.equal(byStoreys.maxFloors, 2);
  assert.equal(byStoreys.binding, "storeys");
});

test("FAR: preset fills FAR/coverage/height/storeys; GFA note differs by region", () => {
  const r = calcFar({ region: "PK", presetId: "pk-lda-10marla", plotAreaM2: 167.23 });
  assert.deepEqual(r.errors, []);
  approx(r.maxBuiltUpM2, 468.2, 0.05);
  assert.equal(r.maxFloors, 4);
  assert.ok(r.gfaNote.includes("basements count toward FAR"));
  assert.ok(calcFar({ region: "IN", plotAreaM2: 500, far: 2, coveragePct: 50 }).gfaNote.includes("Model Bye-Laws"));
  assert.ok(calcFar({ region: "AE", plotAreaM2: 500, far: 0.6, coveragePct: 40 }).gfaNote.includes("Affection Plan"));
});

// ------------------------------------------------------------------- roof ---
test("7. Roof metric defaults -> run 5, 30.96°, rafter 6.414 m, area 192.42 m² (the §1.3 fix)", () => {
  const r = calcRoof({
    spanM: 10,
    riseM: 3,
    overhangHM: 0.5,
    lengthM: 15,
    roofType: "gable",
  });
  assert.deepEqual(r.errors, []);
  approx(r.runM, 5);
  approx(r.angleDeg, 30.96, 0.05);
  approx(r.hypotenuseM, 5.831);
  // Old (buggy) code gave 6.331 m / 189.93 m² — the horizontal overhang must
  // be divided by cos θ before it is added to the sloped rafter.
  approx(r.rafterM, 6.414);
  approx(r.roofAreaM2, 192.42);
  approx(r.pitchX12, 7.2);
  approx(r.pitchPct, 60);
  approx(r.multiplier, 1.166);
  assert.equal(r.pitchBand, "Conventional");
  assert.notEqual(r.rafterM, 6.331);
  assert.notEqual(r.roofAreaM2, 189.93);
});

test("8. Roof imperial defaults -> rafter 19.831 ft, area 1983.1 sq ft; waste 10% -> 22 squares, 66 bundles", () => {
  const r = calcRoof({
    spanM: 30 * FT_TO_M,
    riseM: 10 * FT_TO_M,
    overhangHM: 1.5 * FT_TO_M,
    lengthM: 50 * FT_TO_M,
    roofType: "gable",
    wastePct: 10,
  });
  assert.deepEqual(r.errors, []);
  approx(r.rafterM / FT_TO_M, 19.831);
  approx((r.roofAreaM2 / 0.092903), 1983.1, 0.1); // spec rounds to 1 dp
  assert.equal(r.squares, 22);
  assert.equal(r.bundles, 66);
  assert.equal(r.felt15Rolls, 5); // ceil(184.23 / 40.13)
  assert.equal(r.felt30Rolls, 10); // ceil(184.23 / 20.07)
  assert.equal(r.ridgeCapBundles, 2); // ceil(15.24 / 9.14)
  assert.equal(r.rafterCount, 80); // (ceil(15.24 / 0.4) + 1) x 2 slopes = 40 x 2
});

test("9. Roof Omni cross-check: rise 1.5, run 6 -> rafter 6.18 m", () => {
  const r = calcRoof({
    spanM: 12,
    riseM: 1.5,
    overhangHM: 0,
    lengthM: 10,
    roofType: "gable",
  });
  assert.deepEqual(r.errors, []);
  approx(r.rafterM, 6.18);
});

test("10. Roof pitch-input equivalence: pitchX12 6 -> 26.57°, 50%; angleDeg 45 -> 12:12, 100%", () => {
  const byX12 = calcRoof({
    spanM: 10,
    pitchX12: 6,
    overhangHM: 0,
    lengthM: 10,
    roofType: "gable",
  });
  assert.deepEqual(byX12.errors, []);
  approx(byX12.angleDeg, 26.57, 0.05);
  approx(byX12.pitchPct, 50);
  approx(byX12.riseM, 2.5);

  const byAngle = calcRoof({
    spanM: 10,
    angleDeg: 45,
    overhangHM: 0,
    lengthM: 10,
    roofType: "gable",
  });
  assert.deepEqual(byAngle.errors, []);
  approx(byAngle.pitchX12, 12);
  approx(byAngle.pitchPct, 100);
  approx(byAngle.riseM, 5);

  const byPct = calcRoof({
    spanM: 10,
    pitchPct: 25,
    overhangHM: 0,
    lengthM: 10,
    roofType: "gable",
  });
  approx(byPct.pitchX12, 3);
  approx(byPct.angleDeg, 14.04, 0.05);
});

test("roof: hip and mono shapes, and cost stays blank without rates", () => {
  const hip = calcRoof({
    spanM: 10,
    riseM: 3,
    overhangHM: 0.5,
    lengthM: 15,
    roofType: "hip",
  });
  assert.deepEqual(hip.errors, []);
  assert.ok((hip.hipRafterM as number) > 0);
  approx(hip.hipRafterM as number, 7.5); // 1.5 x run (stated approximation)
  approx(hip.ridgeM, 5); // length - span
  assert.ok(hip.warnings.some((w) => w.includes("approximation")));

  const mono = calcRoof({
    spanM: 10,
    riseM: 3,
    overhangHM: 0.5,
    lengthM: 15,
    roofType: "mono",
  });
  approx(mono.roofAreaM2, 6.414 * 15, 0.05); // single slope
  assert.equal(mono.ridgeM, 0);

  // No PK/IN/UAE shingle price was found: with no rates the cost is null,
  // never an invented price — and the quantities are still complete.
  const noRates: RoofMaterialRates = {
    shinglePerSquare: null,
    felt15PerRoll: null,
    felt30PerRoll: null,
    ridgeCapPerBundle: null,
    dripEdgePerM: null,
    rafterPerM: null,
  };
  const cost = calcRoofCost(
    calcRoof({ spanM: 10, riseM: 3, overhangHM: 0.5, lengthM: 15, roofType: "gable" }),
    noRates,
  );
  assert.equal(cost.totalCost, null);
  assert.equal(cost.costComplete, false);
  assert.equal(cost.lines[0].quantity, 23); // squares at 10% waste, metric area

  const withRate: RoofMaterialRates = { ...noRates, shinglePerSquare: 10000 };
  const cost2 = calcRoofCost(
    calcRoof({ spanM: 10, riseM: 3, overhangHM: 0.5, lengthM: 15, roofType: "gable" }),
    withRate,
  );
  assert.equal(cost2.totalCost, 23 * 10000);
  assert.equal(cost2.costComplete, false); // other lines still unpriced
});

// ------------------------------------------------------------------ units ---
test("11. Units: 1 marla = 20.903 m²; 1 kanal = 418.06 m²; 10 ft = 3.048 m; ft->m->ft round-trips", () => {
  assert.equal(MARLA_M2, 20.903);
  assert.equal(KANAL_M2, 418.06);
  approx(10 * FT_TO_M, 3.048);
  const ft = 10;
  const roundTripped = (ft * FT_TO_M) / FT_TO_M;
  approx(roundTripped, ft, 0.01);
  assert.equal(convertAreaM2(20.903, "marla"), 1);
  approx(convertAreaM2(418.06, "kanal"), 1);
  approx(convertAreaM2(100, "sqft"), 1076.39, 0.01);
  assert.equal(formatLength(3.048, "m"), "3.05 m");
  assert.equal(formatLength(3.048, "ft"), "10.00 ft");
  assert.equal(formatLength(3.048, "ft-in"), "10' 0.0\"");
  assert.equal(validatePositive(0, "Plot area"), "Plot area must be greater than 0.");
  assert.equal(validatePositive(5, "Plot area"), null);
  assert.equal(validatePositive(NaN, "Plot area"), "Plot area must be a number.");
});

test("11b. Validation: span 0, rise <0, plot 0 all return errors, never NaN", () => {
  const span0 = calcRoof({ spanM: 0, riseM: 3, overhangHM: 0.5, lengthM: 15, roofType: "gable" });
  assert.ok(span0.errors.length > 0);
  assert.ok(Object.values(span0).every((v) => typeof v !== "number" || isFinite(v)));

  const negRise = calcRoof({ spanM: 10, riseM: -1, overhangHM: 0.5, lengthM: 15, roofType: "gable" });
  assert.ok(negRise.errors.length > 0);
  assert.ok(!Number.isNaN(negRise.rafterM));

  const plot0 = calcSetback({ region: "PK", presetId: "general-planning", frontageM: 0, depthM: 20 });
  assert.ok(plot0.errors.length > 0);
  assert.ok(plot0.setbackFootprintPct == null || isFinite(plot0.setbackFootprintPct));

  const far0 = calcFar({ region: "PK", plotAreaM2: 0, far: 2, coveragePct: 50 });
  assert.ok(far0.errors.length > 0);
  assert.ok(Number.isFinite(far0.maxFloors));
});

// ---------------------------------------------------------- presets (12) ----
test("12. Presets: region tables, SECONDARY flags, and plot-band lookup", () => {
  const pk = getRegionPresets("PK");
  assert.ok(pk.length >= 7);
  assert.ok(pk.every((p) => p.verified === false));
  assert.ok(pk.some((p) => p.id === "pk-lda-10marla"));
  assert.ok(getRegionPresets("IN").some((p) => p.id === "in-mbbl-1000"));
  assert.ok(getRegionPresets("AE").some((p) => p.id === "ae-dbc-villa"));

  // Plot-band lookup: 300 m² in PK is the 10 marla–<1 kanal band.
  assert.equal(findPresetForPlot("PK", 300)?.id, "pk-lda-10marla");
  assert.equal(findPresetForPlot("PK", 100)?.id, "pk-lda-lt5marla");
  assert.equal(findPresetForPlot("PK", 900)?.id, "pk-lda-2kanal");
  assert.equal(findPresetForPlot("IN", 500)?.id, "in-mbbl-1000");
  assert.equal(findPresetForPlot("IN", 5000), null); // above the last band

  // The liability disclaimer is the AGENTS.md wording, exported for panels.
  assert.ok(ARCHITECTURAL_DISCLAIMER.includes("should not be used as a substitute for a professional BOQ"));
});
