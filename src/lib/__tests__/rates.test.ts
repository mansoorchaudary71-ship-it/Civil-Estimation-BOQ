/**
 * Rates table tests — run with:
 *   npx tsx --test src/lib/__tests__/rates.test.ts
 * Pins the corrected defaults: crush 90 (not the old 250), brick 23,355
 * (PBS Aug 2026 Lahore), steel 270/kg PK, and nulls for unverified IN/AE.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_REGION,
  formatRate,
  getEffectiveRates,
  getRates,
  loadSavedRates,
} from "../rates";

test("PK table: corrected, sourced values", () => {
  const pk = getRates("PK");
  assert.equal(pk.currency, "PKR");
  assert.equal(pk.rates.cementPerBag, 1450);
  assert.equal(pk.rates.steelPerKg, 270);
  assert.equal(pk.rates.bricksPer1000, 23355);
  assert.equal(pk.rates.sandPerCft, 90);
  // The old 250/cft crush default was a ~3x error — must never come back.
  assert.equal(pk.rates.crushPerCft, 90);
  assert.notEqual(pk.rates.crushPerCft, 250);
  assert.equal(pk.rates.tilesPerBox, 1200);
  assert.equal(pk.rates.paintPerL, 300);
  assert.equal(pk.rates.labourMasonPerDay, 1200);
  assert.equal(pk.rates.labourHelperPerDay, 600);
  assert.equal(DEFAULT_REGION, "PK");
});

test("IN and AE tables: all null (unverified — never invent a rate)", () => {
  for (const region of ["IN", "AE"] as const) {
    const t = getRates(region);
    for (const [key, value] of Object.entries(t.rates)) {
      assert.equal(value, null, `${region}.${key} must be null`);
    }
  }
});

test("formatRate and effective rates", () => {
  assert.equal(formatRate(1450, "PKR", "bag"), "Rs 1,450 / bag");
  assert.equal(formatRate(null, "PKR", "bag"), "—");
  assert.equal(formatRate(270, "PKR", "kg"), "Rs 270 / kg");
  // No localStorage in node: effective rates equal the table defaults.
  assert.equal(loadSavedRates("PK").cementPerBag, undefined);
  assert.equal(getEffectiveRates("PK").crushPerCft, 90);
});
