import React from "react";

export const MASTER_FINISHES_CONTENT_LAST_UPDATED = "2026-11-12";


export default function MasterFinishesContent() {
  return (
    <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
      <section>
        <h2 className="text-2xl font-bold text-txt-primary">What the finishes workspace calculates</h2>
        <p>
          Finishing is where a house budget is most often wrong. Grey structure is priced from drawings, but plaster,
          paint, tiles, countertops and woodwork are usually estimated from rules of thumb — and the rules of thumb are
          where the money leaks. This workspace calculates all seven finishing trades from one room: masonry, plaster,
          paint, flooring, countertops, carpentry and carpet. You enter the room once, with its openings, and every tab
          works from the same geometry, so the plaster area, the paint area and the flooring area can never disagree
          with each other.
        </p>
        <p>
          Every quantity is worked out in metric units and converted for display, so feet and metres always agree.
          Rates are editable and region-aware: Pakistani rates are dated and sourced, while Indian and UAE rates are
          left blank rather than guessed. A blank rate shows as a dash, never as zero, so a missing rate can never make
          a cost look free.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Masonry — bricks, blocks and mortar</h2>
        <p>
          The brick count is the wall volume divided by the volume of one brick with its mortar joint. A standard
          9 × 4.5 × 3 inch brick (230 × 110 × 75 mm) with a 10 mm joint occupies 0.00245 m³, so a 10 × 10 ft wall, 230 mm thick, needs 873
          bricks before wastage and 917 to order at 5%. Mortar is the wall volume minus the brick volume, converted to
          dry mortar by multiplying by 1.33. For a 1:4 mix, cement is one fifth of the dry mortar and sand is four
          fifths; cement bags are the cement volume divided by 0.0347, rounded up. The dry mortar is ordered with the
          same wastage as the bricks — cut and broken bricks still need their mortar, so wastage is applied to the dry
          mortar as well as to the brick count.
        </p>
        <p>
          The same engine also handles AAC blocks (600 × 200 × 150 mm with a 3 mm joint) and hollow concrete blocks
          (400 × 200 × 200 mm with a 10 mm joint). AAC walls are 150 mm thick and hollow-block walls 200 mm thick, and
          the joint thickness changes the count, so the block type is a preset rather than a manual size.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Plaster — and the opening deductions that matter</h2>
        <p>
          Plaster is priced by area, and the area depends on the openings. Under IS 1200, an opening under 0.5 m² is
          not deducted at all; an opening from 0.5 to 3 m² is deducted on one face only, at the full opening area; and
          an opening over 3 m² is deducted on both faces, with the jambs, soffits and sills added back. A 5 × 4 × 3 m
          room with a 0.9 × 2.1 m door and a 1.2 × 1.2 m window — both in the middle band — has a net wall area of
          50.67 m². Getting the middle band wrong by deducting only half the opening, as many spreadsheets do,
          overstates the plaster by roughly a sixth.
        </p>
        <p>
          Wet plaster volume is the net area times the thickness — 12 mm inside, 20 mm outside. The ceiling, when
          included, is plastered at the same internal thickness as the walls; there is no separate ceiling thickness
          in the calculator.
          Uneven walls add 10% to the wet volume. Dry mortar is wet volume × 1.33, split by the mix ratio, and cement
          bags are rounded up. For the example room, internal plaster at 12 mm (ceiling included, uneven walls) plus
          external plaster at 20 mm, both in 1:4 with 5% wastage, needs 17 bags of cement and 2.29 m³ of sand;
          internal plaster alone needs 8 bags and 1.04 m³ of sand. External plaster is priced from the net area of
          one external face, with the same opening deductions — not from the gross wall area.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Paint — coverage, primer and putty</h2>
        <p>
          Paint quantity is the paintable area divided by the coverage per litre, times the number of coats, plus
          wastage. Coverage is not one number: economy emulsion covers about 9.5 m² per litre per coat, standard about
          11, premium about 12.5, and exterior weather-shield about 9. The calculator applies primer at roughly
          9 m² per litre and putty at about 1.1 m² per kg, and it deducts the skirting height from the wall area before
          painting, because the skirting is not painted. For the example room, two coats of standard emulsion at
          11 m² per litre with 10% wastage, ceiling included and one door face painted, need 15 litres — one 10-litre
          pack, one 4-litre pack and one 1-litre pack — plus 11 litres of
          primer and 129 kg of putty. Paint is sold in 20, 10, 4 and 1 litre packs, and the calculator breaks the
          quantity into packs so you can buy it.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Flooring — tiles, patterns and the bedding</h2>
        <p>
          Tile quantity starts with the effective tile area: tile length plus the grout joint, times tile width plus
          the grout joint. A 600 × 600 mm tile with a 3 mm joint covers 0.3636 m², not 0.36 m², and that small
          difference changes the count by a tile or two per room. Pattern wastage is then added: 7% straight, 10%
          brick-bond, 14% diagonal, 16% herringbone. Skirting tiles are counted separately as cut strips — a 600 mm
          tile cut into skirting gives four 150 mm strips, and the strips are never folded into the floor area. The
          bedding under the tiles is a dry mortar of 25 mm (or the thickness you enter), converted with the 1.33 dry
          factor and split by the mix ratio. For the example room, straight laying at 7% needs 59 floor tiles, 6
          skirting tiles and 17 boxes of 4, with 8 bags of cement in the bedding.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Countertops, carpentry and carpet</h2>
        <p>
          A countertop is measured by its gross area, minus the sink and hob cut-outs, plus skirting along the wall
          edge. The order area adds wastage, the edge-polish length follows the exposed perimeter, and the slab volume
          is the gross area times the thickness — a step that is easy to skip and expensive to miss, because a 30 mm
          slab uses half as much stone again as a 20 mm slab of the same area. A straight 3 × 0.6 m counter with a
          sink and a hob has a net area of 1.23 m², an order area of 2.33 m², 4.2 m of edge polish and a slab volume of
          0.036 m³ at 20 mm.
        </p>
        <p>
          Carpentry counts studs from the room perimeter: a closed room needs one stud per spacing interval, with no
          extra stud added, because the last stud closes the loop. An open run adds one. Panelling sheets are the
          panelling area divided by the sheet area, with no reuse division — reuse applies to formwork only, where
          dividing by the reuse factor gives the sheets to buy. Carpet area is the room length times width; built-up
          area adds the wall thickness on both sides; super built-up area adds the loading factor. All three are shown
          together, with the loading factor labelled as an assumption.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Cost, rates and what to check on site</h2>
        <p>
          Every tab shows a material breakdown and a cost, and the workspace totals the tabs you actually opened, at
          the rates you entered. Costs use the per-unit rate correctly: a brick rate quoted per 1,000 bricks is divided
          by 1,000 before it is multiplied by the brick count — the old interiors tool multiplied the full per-1,000
          rate by every brick, overstating the brick cost a thousand times. Before you order, check three things on
          site: measure the room and the openings rather than trusting the drawing, confirm the wall thickness (115 mm
          and 230 mm give very different brick counts), and confirm the rates with your supplier, because the
          calculator&rsquo;s rates are starting points, not quotations. The quantities are the part you can rely on;
          the rates are the part you should verify.
        </p>
      </section>

    </article>
  );
}
