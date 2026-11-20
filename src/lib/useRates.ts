/**
 * useRates — small React hook over src/lib/rates.ts.
 * Gives tool pages the region's rate table with the user's saved
 * overrides applied, plus a setter that persists to localStorage
 * (`cep-rates-v1:<region>`). Dependency-free apart from React itself.
 */
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_REGION,
  getRates,
  loadSavedRates,
  saveRates,
  type RateOverrides,
  type RateTable,
  type Region,
  type RegionRates,
} from "./rates";

export interface UseRates {
  region: Region;
  table: RateTable;
  /** Effective rates: table defaults + saved user overrides. */
  rates: RegionRates;
  /** Set one rate (persists to localStorage). Pass null to clear the override. */
  setRate: (key: keyof RegionRates, value: number | null) => void;
  /** Clear all saved overrides for this region. */
  resetRates: () => void;
  /** True when the user has overridden this rate. */
  isOverridden: (key: keyof RegionRates) => boolean;
}

export function useRates(region: Region = DEFAULT_REGION): UseRates {
  const [overrides, setOverrides] = useState<RateOverrides>(() => loadSavedRates(region));

  useEffect(() => {
    setOverrides(loadSavedRates(region));
  }, [region]);

  const table = getRates(region);
  const rates: RegionRates = { ...table.rates, ...overrides };

  const setRate = useCallback(
    (key: keyof RegionRates, value: number | null) => {
      setOverrides((prev) => {
        const next = { ...prev };
        if (value == null || !isFinite(value)) delete next[key];
        else next[key] = value;
        saveRates(region, next);
        return next;
      });
    },
    [region],
  );

  const resetRates = useCallback(() => {
    setOverrides({});
    saveRates(region, {});
  }, [region]);

  const isOverridden = useCallback(
    (key: keyof RegionRates) => overrides[key] !== undefined,
    [overrides],
  );

  return { region, table, rates, setRate, resetRates, isOverridden };
}
