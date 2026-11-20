import React from "react";
import FinishesEstimator from "../calculators/FinishesEstimator";
import MasterFinishesContent from "../calculators/MasterFinishesContent";

/**
 * Master Finishes Workspace — thin host over the ONE canonical finishes
 * engine (src/lib/finishesCalc.ts, rendered by FinishesEstimator).
 *
 * History: this file used to contain a third, divergent brick/plaster/
 * paint implementation (masonry overcounted bricks by ~24% and used a
 * flat 25% mortar percentage; countertop slab thickness was collected
 * and never used; carpentry divided fixed panelling by a formwork reuse
 * factor). All of that maths now lives in finishesCalc.ts, shared with
 * the interiors-finishes calculator, so the two tools can no longer
 * disagree. The masonry tab is the default tab.
 */
export default function MasterFinishesWorkspace() {
  return (
    <div className="space-y-6">
      <p className="text-base text-txt-secondary leading-relaxed">One room, seven trades. Enter the room and its openings once, and get masonry, plaster, paint, flooring, countertops, carpentry and carpet — with IS 1200 opening deductions, pattern wastage and editable PKR, INR and AED rates.</p>
      <FinishesEstimator />
      <MasterFinishesContent />
    </div>
  );
}
