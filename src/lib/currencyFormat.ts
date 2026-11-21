/**
 * currencyFormat — the ONE shared currency/number formatter for shared
 * components (X8). Pure functions: no localStorage reads, no React
 * context, no exchange-rate conversion.
 *
 * - `formatCurrency` renders an amount in a named currency with the
 *   site's symbols (PKR 'Rs', INR '₹', AED 'AED', USD '$', EUR '€',
 *   GBP '£', SAR 'SAR') — PKR with 0 decimals, everything else with 2,
 *   matching SettingsContext.formatCurrency's display rules.
 * - `formatNumber` renders a plain grouped number (chart tooltips,
 *   quantities) with no currency symbol.
 *
 * NOTE (adoption gap): SettingsContext.formatCurrency (rate-converting,
 * context-bound) and src/utils/mathHelpers.formatCost (dead code, zero
 * importers) still exist, and the 70+ tool files format amounts inline.
 * New shared-component code must use this module; rewiring the tools is
 * a later pass and is intentionally NOT done here.
 */

export type CurrencyCode = "PKR" | "INR" | "AED" | "USD" | "EUR" | "GBP" | "SAR";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PKR: "Rs",
  INR: "₹",
  AED: "AED",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "SAR",
};

export function formatNumber(value: number, decimals = 2): string {
  if (!isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "PKR",
  opts?: { decimals?: number }
): string {
  if (!isFinite(amount)) return "—";
  const symbol = CURRENCY_SYMBOLS[currency] ?? "Rs";
  const decimals = opts?.decimals ?? (currency === "PKR" ? 0 : 2);
  return `${symbol} ${formatNumber(amount, decimals)}`;
}
