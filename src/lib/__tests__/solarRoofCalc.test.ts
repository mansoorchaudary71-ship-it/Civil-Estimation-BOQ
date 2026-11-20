/** Solar roof tests — run with: npx tsx --test src/lib/__tests__/solarRoofCalc.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcSolarRoof, defaultSolarRoofInputs } from "../solarRoofCalc";

/** Old defaults from the audited tool (PSH 4.8, battery PKR 80,000/kWh),
 *  so the audited totals can be pinned exactly. */
const OLD_DEFAULTS = {
  ...defaultSolarRoofInputs("Lahore"),
  psh: 4.8,
  batteryCostPerKwh: 80000,
  exportRatePct: 20,
};

test("worked example §2/§4.3 at old defaults: 600 kWh/mo Lahore -> 4.91 kWp, 9 panels, 6 kVA, 28.8 kWh battery, PKR 3,536,812", () => {
  const r = calcSolarRoof(OLD_DEFAULTS);
  assert.equal(r.panels, 9);
  assert.ok(Math.abs(r.actualKw - 4.905) < 0.001);
  assert.equal(r.inverterKva, 6);
  assert.ok(Math.abs(r.batteryRequiredKwh - 24.67) < 0.05, `batt req ${r.batteryRequiredKwh}`);
  assert.equal(r.batteryModules, 3);
  assert.ok(Math.abs(r.batteryActualKwh - 28.8) < 0.01);
  assert.ok(Math.abs(r.totalCost - 3536812) < 5, `total ${r.totalCost}`);
  assert.ok(Math.abs(r.costPerKwp - 3536812 / 4.905) < 5);
  // Battery module rounding oversizes by ~17% — reported, not hidden.
  assert.ok(r.batteryOversizePct > 15 && r.batteryOversizePct < 18);
});

test("export credit 20% (canonical) vs 100% (old, overstated): year-1 savings", () => {
  const at20 = calcSolarRoof(OLD_DEFAULTS);
  const at100 = calcSolarRoof({ ...OLD_DEFAULTS, exportRatePct: 100 });
  assert.ok(Math.abs(at20.annualSavingsYear1 - 361900) < 10, `20% savings ${at20.annualSavingsYear1}`);
  assert.ok(Math.abs(at100.annualSavingsYear1 - 369523) < 10, `100% savings ${at100.annualSavingsYear1}`);
  assert.ok(at100.annualSavingsYear1 > at20.annualSavingsYear1);
});

test("canonical defaults use Lahore PSH 5.0 and 20% export credit", () => {
  const d = defaultSolarRoofInputs("Lahore");
  assert.equal(d.psh, 5.0);
  assert.equal(d.exportRatePct, 20);
  const r = calcSolarRoof(d);
  assert.ok(r.totalCost > 0 && r.annualGenerationKwh > 0);
});

test("financials: NPV / IRR / LCOE are present and sane", () => {
  const r = calcSolarRoof(OLD_DEFAULTS);
  assert.equal(r.cashFlows.length, 25);
  assert.equal(r.cashFlows[11].inverterReplacement, r.inverterCost); // year 12
  assert.ok(r.simplePaybackYears != null && r.simplePaybackYears > 0 && r.simplePaybackYears < 25);
  assert.ok(r.lcoePerKwh > 0 && r.lcoePerKwh < 50);
  assert.ok(r.irrPct != null && r.irrPct > 0);
  assert.ok(isFinite(r.npv));
});

test("validation: PSH 0 and losses 100% never produce Infinity", () => {
  assert.throws(() => calcSolarRoof({ ...OLD_DEFAULTS, psh: 0 }), /Peak sun hours/);
  assert.throws(() => calcSolarRoof({ ...OLD_DEFAULTS, systemLossesPct: 100 }), /System losses/);
  assert.throws(() => calcSolarRoof({ ...OLD_DEFAULTS, exportRatePct: 1000 }), /Export rate/);
});

test("monthly bill cross-check warns when bill and units disagree by >20%", () => {
  const r = calcSolarRoof({ ...OLD_DEFAULTS, monthlyBill: 100000 });
  assert.ok(r.billCrossCheckWarning != null);
  const ok = calcSolarRoof({ ...OLD_DEFAULTS, monthlyBill: 30000 });
  assert.equal(ok.billCrossCheckWarning, null);
  assert.equal(ok.impliedUnitsFromBill, 600);
});

test("loan mode produces a monthly instalment", () => {
  const r = calcSolarRoof({ ...OLD_DEFAULTS, loanEnabled: true, loanPctOfCost: 70, loanInterestPctPerYear: 18, loanTenureYears: 5 });
  assert.ok(r.loanMonthlyInstalment != null && r.loanMonthlyInstalment > 0);
  assert.ok(r.loanTotalInterest != null && r.loanTotalInterest > 0);
});

test("off-grid has no battery-free net-metering fee and no export", () => {
  const r = calcSolarRoof({ ...OLD_DEFAULTS, gridType: "Off-Grid" });
  assert.equal(r.netMeteringFee, 0);
  assert.ok(r.hasBattery);
});
