import React from "react";

export const PLYWOOD_CONTENT_LAST_UPDATED = "2026-11-12";


export default function PlywoodContent() {
  return (
    <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
      <section>
        <h2 className="text-2xl font-bold text-txt-primary">What plywood quantity depends on</h2>
        <p>
          Plywood is sold by the sheet, so the quantity is a count, not an area — but the count depends on the
          contact area, the sheet size, the wastage and, for formwork, the reuse. The contact area is the surface the
          plywood actually covers: for a general surface it is length × width; for a slab it is the soffit plus the
          beam sides; for a wall it is length × height × the number of faces; for a beam it is (2 × depth + width) ×
          length; for a column it is the perimeter × height. Openings are deducted from the contact area before
          anything else, because a window opening does not need plywood.
        </p>
        <p>
          The gross area is the net area times one plus the wastage percentage. The exact sheet count is the gross
          area divided by one sheet&rsquo;s area, and the sheets to buy are that number rounded up — or, for
          formwork, the exact count divided by the reuse factor and then rounded up. A standard 8 × 4 ft sheet
          (2.44 × 1.22 m) covers 2.98 m², a 6 × 3 ft sheet covers 1.67 m², and a 7 × 4 ft sheet covers about 2.61 m².
          The calculator converts imperial labels to metric dimensions before calculating, so an 8 × 4 ft sheet is
          never mistaken for 8 × 4 metres.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Worked examples</h2>
        <p>
          A general surface of 10 × 5 m at 5% wastage has a net area of 50 m² and a gross area of 52.5 m². Divided by
          2.98 m² per sheet, that is 17.64 sheets — 18 to buy, with 2.5 m² of waste. The same surface used as formwork
          with a reuse factor of 4 needs only 5 sheets to buy, because each sheet is used four times. A 10 × 3 m wall,
          both faces, at 10% wastage has a contact area of 60 m² and a gross area of 66 m², which is 22.17 sheets —
          23 to buy. The reuse division applies to formwork only: a fixed surface with a reuse of 4 still needs 18
          sheets, because a sheet that stays in the building cannot be reused.
        </p>
        <p>
          For a slab, the beam sides matter as much as the soffit. The secondary beam length is (length ÷ spacing + 1)
          × width, and the primary beam length is (width ÷ spacing + 1) × length. With 3 m spacing on a 10 × 5 m slab,
          the secondary beams total about 20 m and the primary beams about 15 m, and each beam contributes
          (2 × depth + width) × length of contact area. Missing the beams understates the plywood by a fifth or more,
          which is why the calculator works them out from the spacing rather than asking you to measure them.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Sheet sizes, grades and thickness</h2>
        <p>
          The standard sheet is 8 × 4 ft, but 6 × 3 ft and 7 × 4 ft sheets are common, and the right size depends on
          the job: a 6 × 3 ft sheet wastes less on small pieces, while an 8 × 4 ft sheet is faster on large flat
          areas. Thickness is usually 12 mm for formwork and panelling, 18 mm for shuttering and heavy work, and 6 mm
          or 9 mm for light panelling and ceilings. One sheet&rsquo;s volume is its area times its thickness divided
          by 1,000 — a standard sheet at 12 mm is 0.036 m³ — and the total order volume is the sheets to buy times
          one sheet&rsquo;s volume. Volume matters when you pay by the cubic foot or arrange transport.
        </p>
        <p>
          Grades are about moisture, not size. MR (moisture resistant) is interior grade for furniture and dry areas.
          BWR (boiling water resistant) is for kitchens, bathrooms and semi-exposed work. BWP (boiling water proof,
          marine grade) is for exterior and wet work. For formwork, film-faced shuttering ply is the usual choice:
          the phenolic film gives a smooth concrete finish and survives repeated stripping. The grade changes the
          price per sheet and the realistic reuse count, not the sheet area, so the calculator lets you set both.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Wastage, reuse and cost</h2>
        <p>
          Wastage covers cutting, joints, damaged corners and pieces too small to reuse. Typical allowances are 5%
          for large flat areas, 10% for walls and beams, and up to 15% for columns and small irregular pieces. The
          calculator suggests a preset for each element type and lets you override it; wastage from 0% to 30% is
          accepted, and anything above that usually means the sheet size does not suit the job. Reuse is the other
          lever: film-faced shuttering ply is typically reused 4 to 8 times, commercial ply fewer. Dividing the sheet
          count by the reuse factor gives the sheets to buy for formwork — but only for formwork, and only when the
          sheets are actually recovered and re-oiled between uses.
        </p>
        <p>
          Cost is sheets to buy times the rate per sheet, plus labour if you enter it. The sheet rate in the
          calculator is an unverified placeholder — Pakistani plywood rates vary by grade, thickness, brand and city,
          and no single published rate is reliable — so confirm the rate with your supplier. The quantities, the
          sheet count and the volume are the reliable part. Before you order, check the sheet size your supplier
          actually stocks, because a 6 × 3 ft sheet changes the count even though the area is the same, and check the
          thickness, because an 18 mm sheet costs more and weighs more than a 12 mm sheet of the same size.
        </p>
      </section>

    </article>
  );
}
