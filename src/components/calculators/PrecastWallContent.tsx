import React from "react";

export const PRECAST_WALL_CONTENT_LAST_UPDATED = "2026-11-12";


export default function PrecastWallContent() {
  return (
    <article className="prose prose-lg max-w-none text-txt-secondary space-y-6 mt-10">
      <section>
        <h2 className="text-2xl font-bold text-txt-primary">What a precast boundary wall is</h2>
        <p>
          A precast boundary wall is built from concrete parts made in a factory and assembled on site. The system has
          three parts: posts, panels and footings. The posts are vertical columns, usually with a groove or rebate on
          each side. The panels are thin concrete slabs that slide into the grooves and stack to the wall height. The
          footings hold the posts upright — usually an isolated pad under each post, sometimes a strip footing under
          the whole wall. Because the panels are cast in moulds, every panel is the same size and the same finish, and
          the site work is mostly assembly: set the posts, pour the footings, let them cure, then stack the panels.
          A 30 m wall can be erected in a day or two once the footings are ready, where the same wall in brick would
          take a week of laying, plastering and curing.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Posts, spans and panels</h2>
        <p>
          The first calculation is the number of spans: the effective wall length divided by the panel width, rounded
          up. A 30 m wall with 2 m panels has 15 spans. For an open run, posts are spans plus one — one post at each
          end and one between every pair of spans — so 16 posts. For a closed loop, such as the boundary of a
          rectangular plot, posts equal spans, because the last post closes the loop and is also the first; a 140 m
          perimeter has 70 spans and 70 posts. Getting this wrong by one post is the most common error in precast
          estimates, and it is exactly the error this calculator is built to avoid.
        </p>
        <p>
          Panels per span are the wall height divided by the panel height, rounded up. A 2.4 m wall with 0.3 m panels
          needs 8 panels per span, so the 30 m wall needs 120 panels, and 126 to order at 5% wastage. If the height
          is not a multiple of the panel height, the top panel is cut to fit — the calculator warns you, because a cut
          panel wastes material and leaves a weaker edge. Choosing a panel height that divides the wall height exactly
          is one of the cheapest design decisions you can make.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Footings and concrete</h2>
        <p>
          Each post sits in a footing. An isolated pad — say 0.45 × 0.45 m in plan and 0.6 m deep — is the usual
          choice for a residential wall on firm ground. A strip footing runs the full length of the wall and is used
          where the soil is poor, the wall is tall, or the ground is filled. A PCC bed is a thin blinding layer under
          the pads, taken as the pad volume as an allowance. The footing concrete is worked out as wet volume, then
          converted to dry volume by multiplying by 1.54, and split by the mix — 1:2:4 is the usual precast footing
          mix — into cement, sand and aggregate. Cement is dry volume divided by 7, sand is two sevenths, aggregate
          is four sevenths, and cement bags are the cement volume divided by 0.0347, rounded up. For the 30 m example
          wall, the footings need 1.944 m³ of wet concrete, 2.994 m³ dry, 13 bags of cement, 0.855 m³ of sand and
          1.711 m³ of aggregate.
        </p>
        <p>
          The calculator also checks the panel concrete: the volume of the panels you order, at the panel thickness,
          should be close to the wall volume. A large mismatch means the panel size or the thickness has been entered
          wrong, and the check catches it before you order.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Gates, corners and height limits</h2>
        <p>
          Deduct the gate width from the wall length before calculating spans. A 3 m gate on a 30 m wall leaves 27 m
          of wall — 14 spans instead of 15 — and one fewer post. Forgetting the gate is the second most common error,
          and it over-orders panels by a full span. Corners need care too: a corner post is shared by two runs, so a
          rectangular plot needs one post per span, not one per span plus one. The calculator handles both layouts
          with a single toggle.
        </p>
        <p>
          Height matters more than it looks. Most residential precast walls are 1.8 to 2.4 m high. Above 3 m the wind
          load on the panels grows, the footings need to be bigger, and the posts need a structural check. The
          calculator warns you above 3 m rather than silently producing a number for a wall that should be designed
          by an engineer.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-txt-primary">Cost — and what the rates mean</h2>
        <p>
          The cost is posts times the post rate, plus order panels times the panel rate, plus footing concrete times
          the concrete rate, plus labour per running metre, plus transport. For the 30 m × 2.4 m example, at
          indicative rates of Rs 1,500 per post, Rs 800 per panel and Rs 12,000 per m³ of concrete, with labour at
          Rs 150 per metre, the total is about Rs 152,628 — Rs 5,088 per running metre and Rs 2,120 per square metre.
          The rates in the calculator are indicative and labelled as such, because published precast rates disagree
          with each other and vary by city and supplier. Confirm the post, panel and labour rates with a local
          supplier before you commit; the quantities are the reliable part, and the rates are the part to verify.
        </p>
        <p>
          Precast is usually cheaper and much faster than brick for long, straight runs, because it replaces
          bricklaying, plastering and curing with assembly. Brick is more flexible for short runs, curves, walls with
          many gates, and walls on sloping ground, and it is easier to repair in small sections. The honest way to
          choose is to price both for the same length and height, and to weigh the speed of precast against the
          flexibility of brick for your particular plot.
        </p>
      </section>

    </article>
  );
}
