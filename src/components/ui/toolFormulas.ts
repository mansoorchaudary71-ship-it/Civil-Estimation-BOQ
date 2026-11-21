/**
 * toolFormulas — per-tool methodology text for the ToolHeader "Formulas"
 * modal. Every entry is transcribed from a verified source: the repo's
 * house rules (AGENTS.md), the Phase B brick engine, the tool's own
 * FAQ constants (src/lib/*_FAQS), or the tool engine's own text.
 * No entry is invented. Tools with no verified formula text have NO
 * key here, and ToolHeader hides the Formulas button for them.
 */

export const TOOL_FORMULAS: Record<string, string> = {
  "brick-calculator": `Brick count  N = V_wall / V_brick_with_mortar
  (brick 9" x 4.5" x 3" + 10 mm mortar joint)
Mortar dry volume  V_dry = V_wet x 1.33
Cement bags  = V_cement / 0.0347  (one 50 kg bag = 0.0347 m3)
Order quantity = N x (1 + wastage %)`,

  "bbs-generator": `Cutting length = clear span + 2 x development length - bend deductions
  (2d per 90-degree bend; hook length 10d)
Stirrup length  L = 2(A + B) + 24φ   (A, B = inner dimensions, 135-degree hooks)
Steel weight  W = d^2 / 162.28 kg/m   (d = bar diameter in mm)`,

  "beam-design": `Effective depth  d = D - (clear cover + φ/2)
Flexure  Mu = 0.87 x fy x Ast x d x (1 - Ast x fy / (b x d x fck))
Shear stirrups are spaced closer near the supports, where shear is maximum`,

  "column-design": `Minimum longitudinal steel = 0.8% of gross cross-sectional area
Lateral ties spacing <= least lateral dimension, or 16 x main bar diameter`,

  "isolated-footing": `Base area  A = column load / safe bearing capacity
Clear cover 50-75 mm (direct soil contact)
Checks: one-way shear AND two-way (punching) shear`,

  "raft-foundation": `Bearing pressure  q = total load / raft area  (must be <= SBC)
Use a raft when SBC is low or column loads are heavy
Continuous reinforcement, no splicing at high-stress zones`,

  "pile-foundation": `Pile capacity = end bearing + skin friction
Pile spacing >= 2.5 x pile diameter`,

  "retaining-wall": `Base width  B = 0.4 to 0.6 x total height H
Weep holes at regular intervals relieve water pressure
Checks: overturning, sliding, bearing pressure`,

  "prestressed-concrete": `Minimum M40 concrete + high-tensile steel (to absorb prestress losses)
Tendon profile follows the bending moment diagram`,

  "metal-weight": `Steel weight  W = d^2 / 162.28 kg/m   (d = bar diameter in mm)
Total weight = unit weight x length`,

  "master-rcc": `Effective depth  d = D - (clear cover + φ/2)
Concrete dry volume  V_dry = V_wet x 1.54
Check one-way vs two-way slab action before detailing reinforcement`,

  "universal-structural-geometry": `Stirrup length  L = 2(A + B) + 24φ
Number of bars/stirrups  N = (L / S) + 1   (L = clear span, S = spacing)`,

  "staircase-calculator": `Comfort rule  2R + T = 600 to 640 mm   (R = riser, T = tread)
Minimum clear width 900 mm (residential)`,

  "staircase-design-reference": `Comfort rule  2R + T = 600 to 640 mm   (R = riser, T = tread)
Minimum clear width 900 mm (residential)`,

  "water-tank-design": `Cylindrical volume  V = π x r^2 x h
Rectangular volume  V = L x B x H
Capacity is sized from daily demand (litres per person per day)`,

  "labour-calculator": `Days = quantity / daily output   (IS 7272 Pt 1, 8-hour day)
Daily outputs: brickwork 1.25 m3/mason, excavation 3.0 m3/labourer,
plastering 10 m2/mason, concreting 4.0 m3/gang, steel 150 kg/bender,
formwork 8 m2/carpenter, painting 40 m2/painter
Daily burn = key workers x mason wage + helpers x helper wage`,

  "building-setback-calculator": `Buildable footprint = plot area - (front + rear + side setbacks)
Real buildable area = smaller of (setback footprint, ground-coverage cap)
LDA example: 10 marla plot, 70% ground coverage cap`,

  "far-fsi-calculator": `FAR = gross floor area / plot area   (FAR = FSI; FSI 2.0 = FAR 200%)
Floors ≈ FAR / ground coverage  (0 floors when FAR < coverage)
GFA rules differ by authority: LDA 2019 counts basements; India Model
Bye-Laws 2016 and Dubai DBC Table A.3 list their own inclusions/exclusions`,

  "roof-calculator": `Pitch  X:12  ->  angle = arctan(X/12),  percent = X/12 x 100
(6:12 = 26.6 degrees = 50%)
1 roofing square = 100 sq ft = 3 bundles
Felt: #15 roll = 432 sq ft, #30 roll = 216 sq ft
Hip roof area = horizontal projection (incl. overhangs) / cos(pitch angle)`,

  "permeability-test": `Constant head (ASTM D2434)  k = Q x L / (A x h x t)
Falling head (ASTM D5084)  k = 2.303 x (a x L) / (A x t) x log10(h1/h2)
Temperature correction to 20 C: 10 C 1.301, 15 C 1.135, 20 C 1.000,
25 C 0.890, 30 C 0.797 (linearly interpolated)
Hazen estimate (clean sands only)  k ≈ 0.01 x D10^2 cm/s
k (cm/s) x 864 = m/day`,

  "mix-design": `Absolute volume method: volumes of cement, water, aggregates and
air sum to 1 m3. Water-cement ratio is fixed by target strength and
durability; sand bulking (up to 30% by moisture) is adjusted in
nominal mixes. Nominal reference: 1:2:4 (M15).`,

  "formwork": `Formwork area = contact area of the element (sides + soffit)
Stripping: vertical members (columns, walls) 16-24 hrs;
slabs and beams later, per code and span`,

  "earthworks": `Excavated volume x swell factor (typically 15-20%) = haul volume
Fill volume x shrinkage factor = ordered volume
Cut/fill by trapezoidal or Simpson's rule between cross-sections`,

  "road-pavement": `Subgrade CBR drives the total pavement crust thickness (IRC)
Camber (cross-slope) 2-3% for surface drainage
Dowel bars transfer load at transverse joints`,

  "volume-estimator": `Trapezoidal rule and Simpson's rule for volumes from irregular
cross-sections. Convert all dimensions to one unit (metres) first.`,

  "unit-converter": `1 m3 = 35.3147 ft3;  1 m = 3.28084 ft
Areas use the squared length factor: 1 sq.m = 10.7639 sq.ft
1 marla = 272.25 sq ft;  1 kanal = 20 marla`,

  "marla-converter": `1 marla = 272.25 sq ft;  1 kanal = 20 marla = 5,445 sq ft
1 sq yd = 9 sq ft;  1 acre = 8 kanal`,

  "cbr-test": `CBR = (test load / standard load) x 100, at 2.5 mm or 5.0 mm
penetration (2.5 mm value is conventionally the higher one)
Sample soaked 4 days to simulate worst-case subgrade moisture`,

  "direct-shear": `Shear strength  τ = c + σ x tan φ
(c = cohesion, φ = angle of internal friction)
The failure plane is forced horizontal, which may not match the field`,

  "master-sieve": `Fineness modulus  FM = Σ cumulative % retained / 100
A well-graded soil has a smooth, concave-upward gradation curve`,

  "aggregate-tests": `Fineness modulus  FM = Σ cumulative % retained / 100
Sieve analysis follows the standard sieve series; FM describes
the average particle size (higher FM = coarser aggregate)`,

  "soil-mechanics-lab": `Moisture content  w = (wet weight - dry weight) / dry weight x 100
Atterberg limits (liquid + plastic) define the consistency of
cohesive soils and drive soil classification`,

  "house": `Steel  3.5-4.5 kg per sq ft of built-up area
Concrete  0.035-0.040 m3 per sq ft of built-up area
Total = grey structure + finishes + add-ons`,

  "quick-estimation": `Built-up area ≈ 1.2 to 1.3 x carpet area
Contingency 10-15% for site-condition variation`,

  "boq": `BOQ heads follow standard civil divisions:
Substructure, Superstructure, Finishes (material supply rates
kept separate from labour installation rates)`,

  "takeoff": `Deduct openings (doors, windows) from wall areas;
openings < 0.5 sq m are usually ignored by standard codes
Plaster area  A = (L x H) - A_openings`,

  "material-takeoff": `Deduct openings (doors, windows) from wall areas;
openings < 0.5 sq m are usually ignored by standard codes
Tile/marble wastage 5%, paint 2-3%; cement for 1:6 blockwork
≈ 0.2 bags per sq m`,

  "master-quantity": `Quantity = length x breadth x height (per item)
Deduct openings (doors, windows); openings < 0.5 sq m ignored
Plaster area  A = (L x H) - A_openings`,

  "measurement-sheet": `Quantity = length x breadth x height for each measured item
Rates applied per item; totals summed by BOQ division`,

  "rates": `Rate = material cost + labour cost + overheads/profit (15-20%)
Rates follow local material availability and transport lead`,

  "cost-summary": `Total = Substructure + Superstructure + Finishes
Contingency buffer 5-10% on top of the summed cost`,

  "pakistan-cost-calculator": `Total cost = built-up area x rate per sq ft (by city and finish level)
Grey structure + finishes are priced separately`,

  "area-space-calculator": `Area = length x width (per room/space)
Total area = sum of room areas, less deductions for openings`,

  "room-area-calculator": `Area = length x width (per room)
Total area = sum of room areas, less deductions for openings`,

  "door-window-schedule": `Opening area = length x width (per door/window)
Total opening area = sum of all scheduled openings`,

  "plywood-estimator": `Sheets = area to cover / area per sheet, rounded up
Wastage added for cutting around openings and edges`,

  "topsoil-estimator": `Volume = area x depth (topsoil layer)
Order volume allows for compaction/settlement`,

  "master-finishes": `Tile/marble wastage 5%, paint 2-3%
Mortar dry volume  V_dry = V_wet x 1.33
Plaster area  A = (L x H) - A_openings`,

  "interiors-finishes": `Tile/marble wastage 5%, paint 2-3%
Mortar dry volume  V_dry = V_wet x 1.33
Plaster area  A = (L x H) - A_openings`,

  "chainage": `Volume between chainages by average end area / trapezoidal rule:
V = (A1 + A2) / 2 x distance between chainages`,

  "gradient-calculator": `Gradient = rise / run x 100 (%)
Slope angle = arctan(rise / run)`,

  "reinforcement": `Steel weight  W = d^2 / 162.28 kg/m   (d = bar diameter in mm)
Lap length and development length per code; stirrups closer
near supports where shear is maximum`,
};
