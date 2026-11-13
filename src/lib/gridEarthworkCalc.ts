/** gridEarthworkCalc.ts — multi-cell grid (borrow-pit) earthworks engine.
 * Cut and fill are summed SEPARATELY — the old single-cell tool averaged
 * corner depths, cancelling cut against fill when corners straddled zero.
 * Per cell (d × d): V = d² · mean depth of its 4 corners, split by sign.
 * Borrow-pit weighted total: V = (d²/4)·(Σh1 + 2Σh2 + 4Σh4). */
export function gridCellVolumes(existing: number[][], proposed: number[][], spacingM: number): { cutM3: number; fillM3: number; netM3: number; cells: { row: number; col: number; avgDepthM: number; cutM3: number; fillM3: number }[] } {
  const rows = existing.length, cols = existing[0]?.length ?? 0;
  if (rows < 2 || cols < 2) throw new Error("Grid needs at least 2×2 elevations.");
  if (spacingM <= 0) throw new Error("Grid spacing must be > 0.");
  let cutM3 = 0, fillM3 = 0;
  const cells: { row: number; col: number; avgDepthM: number; cutM3: number; fillM3: number }[] = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const depths = [
        existing[r][c] - proposed[r][c], existing[r][c + 1] - proposed[r][c + 1],
        existing[r + 1][c] - proposed[r + 1][c], existing[r + 1][c + 1] - proposed[r + 1][c + 1],
      ];
      const avg = depths.reduce((a, b) => a + b, 0) / 4;
      const vol = Math.abs(avg) * spacingM * spacingM;
      const cell = { row: r, col: c, avgDepthM: avg, cutM3: avg > 0 ? vol : 0, fillM3: avg < 0 ? vol : 0 };
      cells.push(cell); cutM3 += cell.cutM3; fillM3 += cell.fillM3;
    }
  }
  return { cutM3, fillM3, netM3: cutM3 - fillM3, cells };
}
/** Borrow-pit weighted volume from a depth grid h (existing − proposed). */
export function borrowPitVolume(depths: number[][], spacingM: number): number {
  const rows = depths.length, cols = depths[0]?.length ?? 0;
  if (rows < 2 || cols < 2) throw new Error("Grid needs at least 2×2 depths.");
  let h1 = 0, h2 = 0, h4 = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isCorner = (r === 0 || r === rows - 1) && (c === 0 || c === cols - 1);
      const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (isCorner) h1 += depths[r][c];
      else if (isEdge) h2 += depths[r][c];
      else h4 += depths[r][c];
    }
  }
  return (spacingM * spacingM / 4) * (h1 + 2 * h2 + 4 * h4);
}
export function gridCost(cutM3: number, fillM3: number, swellPct: number, shrinkPct: number, truckCapacityM3: number, excRate: number, fillRate: number, haulRatePerTrip: number): { looseM3: number; compactedFillM3: number; trips: number; cost: number } {
  const looseM3 = cutM3 * (1 + swellPct / 100);
  const compactedFillM3 = fillM3 * (1 - shrinkPct / 100);
  const trips = truckCapacityM3 > 0 ? Math.ceil(looseM3 / truckCapacityM3) : 0;
  return { looseM3, compactedFillM3, trips, cost: cutM3 * excRate + fillM3 * fillRate + trips * haulRatePerTrip };
}
export const GRID_WORKED = { spacingM: 10, existing: [[100.5, 100.8], [100.2, 100.4]], proposed: [[100.0, 100.0], [100.0, 100.0]] };
