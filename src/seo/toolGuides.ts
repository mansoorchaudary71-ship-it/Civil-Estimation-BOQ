/**
 * toolGuides.ts — per-tool guide content for the 71 tools rendered inside
 * App.tsx ModuleWrapper (via ToolArticleWidget) and for the standalone pages
 * that want the same content.
 *
 * Every formula, code limit, standard size and ratio below was verified
 * against the tool's own engine in src/lib (or against the engine's FAQ
 * constants) before it was written here. Worked examples were run through
 * the real engines with tsx and the numbers below are the engines' own
 * outputs — see the verification run in the task report. Nothing here is
 * a guess: where a value is an indicative market rate it is labelled so.
 *
 * Shape: `related` reuses CalculatorPageShell's RelatedCalculatorLink
 * ({ id, title, desc }); the widget links each one to `/${id}`.
 */
import type { RelatedCalculatorLink } from "./CalculatorPageShell";

export interface ToolGuideFormula {
  /** The formula as written, e.g. "N = V_wall ÷ V_brick+mortar". */
  formula: string;
  /** What each symbol means. */
  variables: string;
  /** Optional: the standard it comes from, or a caveat. */
  note?: string;
}

export interface ToolGuideTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ToolGuideExample {
  title: string;
  /** Inputs the reader enters (or the defaults). */
  inputs: string;
  steps: string[];
  result: string;
}

export interface ToolGuide {
  id: string;
  /** Canonical definition of the concept the tool calculates. */
  intro: string;
  formulas: ToolGuideFormula[];
  tables: ToolGuideTable[];
  workedExample: ToolGuideExample;
  related: RelatedCalculatorLink[];
}

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  "brick-calculator": {
    id: "brick-calculator",
    intro:
      "Brickwork quantity is a volume division: the volume of the wall divided by the volume of one brick including its mortar joint. A brick on its own is not the unit — the brick plus one 10 mm joint on each face is, because the joints are part of the wall. The standard brick in Pakistan is 9 in × 4½ in × 3 in (nominally 230 × 115 × 75 mm); India also uses the IS 1077 modular size 190 × 90 × 90 mm, and the UAE the BS EN 771-1 clay brick 215 × 102.5 × 65 mm. Openings for doors and windows are deducted from the wall area first, wastage is added last, and the mortar is worked out from the same wall volume — wet mortar, converted to dry volume, then split by the mix ratio into cement and sand.",
    formulas: [
      {
        formula: "N = V_wall ÷ V_brick+mortar",
        variables:
          "N = number of bricks; V_wall = length × height × thickness; V_brick+mortar = (brick length + joint) × (brick width + joint) × (brick height + joint).",
        note: "Joint is 10 mm on each face. Equivalent per-face form: bricks per sq ft = 1 ÷ (face area of one brick with joint).",
      },
      {
        formula: "V_dry mortar = (V_wall − N × V_brick) × 1.15 × 1.33 × (1 + wastage %)",
        variables:
          "The 1.15 factor covers mortar pressed into the brick frogs; 1.33 converts wet mortar to dry volume; wastage is applied to the dry volume too.",
        note: "Dry volume is always larger than wet volume — dry ingredients contain voids that water fills.",
      },
      {
        formula: "Cement bags = V_cement ÷ 0.0347 m³ per 50 kg bag (round up)",
        variables:
          "V_cement = V_dry mortar × cement parts ÷ total parts (e.g. 1 ÷ 5 for a 1:4 mix).",
        note: "0.0347 m³ is the volume of one 50 kg bag of cement. For a different bag size, scale it: volume = bag kg × 0.0347 ÷ 50.",
      },
      {
        formula: "Bricks to order = N × (1 + wastage %)",
        variables: "N = bricks before wastage; wastage is 5% for good machine-made bricks, 10% for kiln bricks or cut work.",
      },
    ],
    tables: [
      {
        title: "Bricks per square foot of wall face (230 × 110 × 75 mm brick, 10 mm joint)",
        headers: ["Wall thickness", "Exact (per sq ft)", "Thumb rule", "Per m²"],
        rows: [
          ["4½ in (115 mm)", "4.4", "4.5", "47"],
          ["9 in (230 mm)", "8.7", "9", "94"],
          ["13½ in (345 mm)", "13.1", "13.5", "141"],
          ["18 in (460 mm)", "17.3", "18", "186"],
        ],
      },
      {
        title: "Mortar mix — which ratio, and where",
        headers: ["Mix (cement : sand)", "Use", "Cement per cft of brickwork*"],
        rows: [
          ["1:3", "Load-bearing walls and foundations", "≈ 0.07 bags (50 kg)"],
          ["1:4", "General brickwork (default)", "≈ 0.06 bags (50 kg)"],
          ["1:6", "Partition and non-load-bearing walls", "≈ 0.05 bags (50 kg)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one 10 ft × 10 ft wall, 9 in thick",
      inputs:
        "Wall 10 ft × 10 ft (100 sq ft), thickness 230 mm (9 in), Pakistani Awwal brick 230 × 110 × 75 mm, 10 mm joint, no openings, 1:4 mix, 5% wastage, 50 kg cement bags. These are the calculator's defaults.",
      steps: [
        "Wall volume = 3.048 m × 3.048 m × 0.23 m = 2.14 m³.",
        "One brick with mortar = 240 × 120 × 85 mm = 0.002448 m³. Bricks before wastage = 2.14 ÷ 0.002448 = 873 bricks (8.7 per sq ft).",
        "To order = 873 × 1.05 = 917 bricks.",
        "Wet mortar = wall volume − brick volume = 2.14 − (873 × 0.00190) = 0.48 m³, × 1.15 frog allowance = 0.55 m³; dry mortar = 0.55 × 1.33 × 1.05 (wastage) ≈ 0.77 m³.",
        "Cement = 0.77 × 1⁄5 = 0.154 m³ ÷ 0.0347 = 4.4 → 5 bags (250 kg). Sand = 0.77 × 4⁄5 = 0.62 m³ = 21.8 cft.",
      ],
      result:
        "917 bricks, 5 bags of cement and 21.8 cft of sand for a 10 ft × 10 ft, 9-inch wall. *Cement per cft in the table is the engine's rule of thumb including 5% wastage.",
    },
    related: [
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project, not just one wall." },
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths, bar weights and laps for beams, columns, slabs and stirrups." },
    ],
  },

  "mix-design": {
    id: "mix-design",
    intro:
      "A design mix is not a recipe copied from another site — it is a calculation that starts from the strength you must achieve and works backwards to the quantities of cement, water, fine aggregate and coarse aggregate that will achieve it, under the durability rules for the exposure the concrete will face. The Indian standard is IS 10262:2019 and the American method is ACI 211.1; both use the absolute volume method (the volumes of cement, water, air, admixture and aggregates add up to exactly 1 m³) and this calculator runs both from one engine so they can be compared directly. A nominal mix such as 1:2:4 is a fixed proportion by volume from IS 456 Table 9, permitted only up to grade M20 — for M25 and above, or for Severe exposure and worse, a design mix is required.",
    formulas: [
      {
        formula: "f′ck = fck + 1.65 × SD",
        variables:
          "f′ck = target mean strength; fck = specified grade strength; SD = standard deviation of the plant (IS 10262 Cl 5.2).",
        note: "The 1.65 factor covers 5% defectives: only one test in twenty may fall below the grade.",
      },
      {
        formula: "Cement = water ÷ w/c (governed by the lower of strength w/c and durability max w/c)",
        variables:
          "Water is read from IS 10262 Table 4 for the aggregate size and type, corrected +3% per 25 mm of slump above 50 mm.",
        note: "If cement falls below the IS 456 Table 5 minimum, it is raised to the minimum and the actual w/c drops.",
      },
      {
        formula: "V_agg = 1 − (V_cem + V_water + V_air + V_admix); V = mass ÷ (SG × 1000)",
        variables:
          "V_agg is split between fine and coarse aggregate by IS 10262 Table 5 (coarse fraction by size, zone and w/c).",
        note: "Absolute volumes must sum to exactly 1.000 m³ — that is the check that the design closes.",
      },
      {
        formula: "Bags per m³ = cement (kg/m³) ÷ 50 (round up to order)",
        variables: "Cement is capped at 450 kg/m³ (IS 456, excluding fly ash / GGBS).",
      },
    ],
    tables: [
      {
        title: "Standard deviation (IS 10262 Table 2 / IS 456 Table 8)",
        headers: ["Grade", "SD (MPa)"],
        rows: [
          ["M10, M15", "3.5"],
          ["M20, M25", "4.0"],
          ["M30 and above", "5.0"],
        ],
      },
      {
        title: "Durability limits (IS 456 Table 5)",
        headers: ["Exposure", "Min cement (kg/m³)", "Max w/c", "Min grade"],
        rows: [
          ["Mild", "300", "0.55", "M20"],
          ["Moderate", "300", "0.50", "M25"],
          ["Severe", "320", "0.45", "M30"],
          ["Very severe", "340", "0.45", "M35"],
          ["Extreme", "360", "0.40", "M40"],
        ],
      },
      {
        title: "Water content, 25–50 mm slump (IS 10262 Table 4, kg/m³)",
        headers: ["Aggregate", "10 mm", "20 mm", "40 mm"],
        rows: [
          ["Angular crushed", "208", "186", "165"],
          ["Rounded gravel", "190", "170", "150"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — M25, Moderate exposure (the calculator's default)",
      inputs:
        "M25, SD 4.0 MPa, Moderate exposure, 20 mm angular crushed aggregate, 50 mm slump, OPC (SG 3.15), fine aggregate SG 2.65 Zone II, coarse aggregate SG 2.70, no admixture, no moisture.",
      steps: [
        "Target strength f′ck = 25 + 1.65 × 4.0 = 31.6 MPa.",
        "Water = 186 L/m³ (Table 4, 20 mm angular, 25–50 mm slump; no slump correction at 50 mm).",
        "Strength w/c for 31.6 MPa = 0.50; durability max (Moderate) = 0.50, so the governing w/c is 0.50.",
        "Cement = 186 ÷ 0.50 = 372 kg/m³ — above the 300 kg/m³ minimum and below the 450 kg/m³ maximum. Bags exact = 372 ÷ 50 = 7.44, so order 8 bags/m³.",
        "Absolute volumes: V_cem = 372 ÷ 3150 = 0.1181 m³; V_water = 0.1860 m³; V_air = 0.0150 m³; V_agg = 1 − 0.1181 − 0.1860 − 0.0150 = 0.6809 m³.",
        "Table 5, 20 mm Zone II at w/c 0.50: coarse fraction 0.62, fine 0.38. Fine aggregate = 0.6809 × 0.38 × 2650 = 686 kg/m³; coarse aggregate = 0.6809 × 0.62 × 2700 = 1,140 kg/m³.",
        "Ratio by mass = 1 : 1.84 : 3.06 : 0.50. Fresh density = 372 + 186 + 686 + 1,140 = 2,384 kg/m³, inside the normal 2,300–2,500 band.",
        "Batch 0.5 m³: cement 186 kg (4 bags), water 93 L, fine aggregate 343 kg, coarse aggregate 570 kg.",
      ],
      result:
        "M25 design mix 1 : 1.84 : 3.06 : 0.50 by mass — 372 kg cement, 186 L water, 686 kg sand and 1,140 kg coarse aggregate per m³. Confirm with three trial batches of at least 0.5 m³, tested at 7 and 28 days (IS 10262 Cl 5.8).",
    },
    related: [
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall in PKR, INR or AED." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "aggregate-tests", title: "Aggregate Tests Calculator — IS 2386", desc: "Impact, crushing, abrasion, water absorption and specific gravity." },
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR." },
    ],
  },

  "cbr-test": {
    id: "cbr-test",
    intro:
      "The California Bearing Ratio (CBR) measures how strong a subgrade soil is by pushing a standard plunger into it and comparing the load needed against the load needed for a standard crushed stone. It is the number pavement design starts from: IRC:37 sizes flexible pavements from the subgrade CBR, and AASHTO converts CBR into a resilient modulus for the same purpose. The test follows IS 2720 Part 16 (or ASTM D1883): the specimen is soaked, loaded at 1.25 mm/min, and the load is recorded at penetrations up to 12.5 mm. The CBR is normally reported at 2.5 mm penetration; the 5.0 mm value is used only if a repeat test confirms it is higher.",
    formulas: [
      {
        formula: "CBR = (test load ÷ standard load) × 100",
        variables:
          "Standard loads: 1,370 kg at 2.5 mm penetration and 2,055 kg at 5.0 mm penetration (the load for standard crushed stone).",
        note: "Compute CBR at both penetrations. Report the 2.5 mm value unless the 5.0 mm value is higher on a repeat test (IS 2720 Pt 16).",
      },
      {
        formula: "Origin correction: shift the load–penetration curve so its steepest early tangent passes through zero",
        variables:
          "Surface irregularities make the first part of the curve concave upward; the tangent at the point of greatest slope is extended to the penetration axis and all readings are shifted by that intercept (capped at 2.0 mm — a larger intercept means re-seat the specimen).",
        note: "Without the correction, loads read at the wrong penetration and the CBR is understated.",
      },
      {
        formula: "Mr (Heukelom) = 17.6 × CBR^0.64  (MPa)",
        variables: "Mr = resilient modulus of the subgrade, from the reported CBR.",
        note: "Heukelom's correlation is the one IRC:37-era practice uses for CBR below about 20%.",
      },
      {
        formula: "Mr (AASHTO) ≈ 10 × CBR  (MPa)",
        variables: "AASHTO 1993 correlation, Mr (psi) = 1,500 × CBR, converted to MPa.",
        note: "The two correlations disagree — Heukelom is the conservative one at low CBR. The calculator shows both so you can see the spread.",
      },
    ],
    tables: [
      {
        title: "Minimum CBR this calculator checks against",
        headers: ["Layer", "Min CBR (%)"],
        rows: [
          ["Subgrade (low traffic)", "5"],
          ["Subgrade (default)", "8"],
          ["Sub-base", "20"],
          ["Base course", "80"],
        ],
      },
      {
        title: "What the numbers mean (typical ranges)",
        headers: ["CBR (%)", "Reading"],
        rows: [
          ["Below 3", "Very poor subgrade — stabilisation or replacement is usually needed"],
          ["3–7", "Poor to fair — thick pavement or a capping layer"],
          ["7–20", "Fair to good subgrade for most roads"],
          ["Above 20", "Good — sub-base / base-course territory, not subgrade"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — soaked specimen, loads recorded every 0.5–2.5 mm",
      inputs:
        "Load–penetration points (kg): 0.5 mm → 15, 1.0 → 45, 1.5 → 90, 2.0 → 130, 2.5 → 180, 3.0 → 215, 4.0 → 270, 5.0 → 300, 7.5 → 380, 10.0 → 430, 12.5 → 470.",
      steps: [
        "Origin correction: the steepest early slope is between 1.0 and 1.5 mm (90 kg/mm). Its tangent meets the penetration axis at 1.0 − 45 ÷ 90 = 0.5 mm, so every reading shifts by 0.5 mm.",
        "Load at 2.5 mm corrected (= 3.0 mm on the raw curve) = 215 kg. CBR at 2.5 mm = 215 ÷ 1,370 × 100 = 15.7%.",
        "Load at 5.0 mm corrected (= 5.5 mm raw) = 300 + (0.5 ÷ 2.5) × 80 = 316 kg. CBR at 5.0 mm = 316 ÷ 2,055 × 100 = 15.4%.",
        "The 5.0 mm value (15.4%) is lower than the 2.5 mm value (15.7%), so no repeat test is needed and the reported CBR is 15.7%.",
        "Resilient modulus: Heukelom Mr = 17.6 × 15.7^0.64 = 102.5 MPa; AASHTO Mr = 10 × 15.7 = 156.9 MPa.",
      ],
      result:
        "Reported CBR 15.7% — a good subgrade, comfortably above the 8% default minimum. Note how the 0.5 mm origin correction changed the answer: without it the 2.5 mm load would read 180 kg and the CBR only 13.1%.",
    },
    related: [
      { id: "geotechnical", title: "Soil Mechanics Lab Calculator — Water Content, Proctor & Atterberg", desc: "Water content, specific gravity, liquid and plastic limits, Proctor compaction (OMC/MDD) and CBR in one place." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Prismoidal and average-end-area volumes, swell and shrinkage, truck trips and trench backfill." },
      { id: "soil-mechanics-lab", title: "Soil Mechanics Lab — Proctor, Density & Classification", desc: "Proctor compaction curve, field density and soil classification from lab data." },
      { id: "pavement-mix", title: "Pavement Mix Calculator", desc: "Bituminous mix quantities and pavement layer volumes from the CBR-designed thickness." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Earth pressure, stability checks and material quantities for retaining walls on the same soil." },
    ],
  },

  "bbs-generator": {
    id: "bbs-generator",
    intro:
      "A Bar Bending Schedule (BBS) is the cutting list for reinforcement: every bar in a beam, column, slab or footing, with its shape, diameter, cutting length, number of bars and weight. It is what the bar bender works from and what the quantity surveyor prices. The cutting length is the straight length of bar needed before bending — the straight portions, plus the hook allowance, minus the shortening at each bend. This calculator follows IS 2502 for hooks and bends (ACI 315 and BS 8666 are offered as alternatives), weighs bars at d² ÷ 162.28 kg/m, and orders against 12 m stock bars (or 40 ft = 12.192 m).",
    formulas: [
      {
        formula: "W = d² ÷ 162.28  (kg/m)",
        variables:
          "W = weight of one metre of bar; d = bar diameter in mm. Derived from the volume of a 1 m bar (πd²/4) times the density of steel, 7,850 kg/m³.",
        note: "So a 12 mm bar is 0.887 kg/m, a 16 mm bar 1.578 kg/m and a 20 mm bar 2.465 kg/m.",
      },
      {
        formula: "Rectangular stirrup (IS 2502 detailed): L = 2(A+B) + 2×10d − (3×2d + 2×3d)",
        variables:
          "A, B = inner dimensions = section − 2×cover − d; d = bar diameter. The 2×10d is the two 135° hooks; the deductions are 2d per 90° bend (×3) and 3d per 135° bend (×2).",
        note: "Simplifies to L = 2(A+B) + 8d. The field shortcut 2(A+B) + 24d reads about 10% high — it counts the full hook allowance without deducting bend shortening, so it is shown only as a labelled approximation.",
      },
      {
        formula: "Bars to order = ⌈total cut length ÷ stock length⌉",
        variables: "Stock length is 12 m (or 12.192 m for 40 ft bars, which are 1.6% longer).",
        note: "The last bar's offcut is shown so you can see what is left over.",
      },
      {
        formula: "Lap length = 50d",
        variables:
          "The overlap where two bars are joined because one stock bar is not long enough — 600 mm for a 12 mm bar, 1,000 mm for a 20 mm bar.",
        note: "Laps are added automatically whenever a single bar's cutting length exceeds one stock bar.",
      },
    ],
    tables: [
      {
        title: "Unit weight of reinforcement (kg/m)",
        headers: ["Bar dia (mm)", "6", "8", "10", "12", "16", "20", "25", "28", "32"],
        rows: [["kg/m", "0.22", "0.39", "0.62", "0.89", "1.58", "2.47", "3.85", "4.83", "6.31"]],
      },
      {
        title: "Nominal cover (IS 456, guide)",
        headers: ["Member", "Cover (mm)"],
        rows: [
          ["Slab", "20"],
          ["Beam", "25"],
          ["Column", "40"],
          ["Footing", "50"],
          ["Concrete cast against soil", "75"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — rectangular stirrups for a 300 × 450 mm beam",
      inputs:
        "Beam 300 × 450 mm, 40 mm cover, Ø8 stirrups, IS 2502, 25 stirrups, 5% wastage.",
      steps: [
        "Inner dimensions: A = 300 − 2×40 − 8 = 212 mm; B = 450 − 2×40 − 8 = 362 mm.",
        "Cutting length L = 2(212 + 362) + 2×10×8 − (3×2×8 + 2×3×8) = 1,148 + 160 − 96 = 1,212 mm = 1.212 m.",
        "Total length = 25 × 1.212 = 30.30 m. Weight = 30.30 × 0.394 = 11.95 kg net.",
        "With 5% wastage: 11.95 × 1.05 = 12.55 kg to order.",
        "Bars to order = ⌈30.30 ÷ 12⌉ = 3 stock bars of 12 m.",
      ],
      result:
        "One stirrup is 1.212 m long; 25 stirrups need 30.30 m of Ø8 bar (11.95 kg net, 12.55 kg with wastage) — 3 stock bars. The field shortcut would give 1.340 m per stirrup, 10.6% high.",
    },
    related: [
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "column-design", title: "Column Design Calculator — IS 456", desc: "Axial and biaxial column design with reinforcement and ties." },
      { id: "metal-weight", title: "Metal Weight Calculator", desc: "Weight of steel plates, bars, pipes and sections from dimensions." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR." },
    ],
  },

  "retaining-wall": {
    id: "retaining-wall",
    intro:
      "A cantilever retaining wall holds back soil with its own weight and the weight of the soil sitting on its heel. The soil pushes the wall over and slides it forward; the wall resists with its weight, the friction under its base, and the soil on the heel. Design is three checks, not one: sliding, overturning and bearing pressure — plus the stem itself designed as a cantilever in flexure (IS 456). The earth pressure comes from Rankine's theory for level backfill (a Coulomb-style correction for sloped backfill), and the acceptance criteria are the standard ones: sliding factor of safety ≥ 1.5, overturning ≥ 2.0, and the resultant inside the middle third so no tension appears under the base.",
    formulas: [
      {
        formula: "Ka = (1 − sin φ) ÷ (1 + sin φ)  (Rankine, level backfill)",
        variables:
          "Ka = active earth-pressure coefficient; φ = angle of internal friction of the backfill.",
        note: "φ = 30° gives Ka = 0.333. Sloped backfill uses the Coulomb form and gives a larger Ka — a sloped backfill pushes harder.",
      },
      {
        formula: "Pa,soil = ½ × Ka × γ × H²;  Pa,sur = Ka × q × H",
        variables:
          "Pa = total active thrust per metre run; γ = unit weight of backfill; H = total wall height (stem + base); q = surcharge on the backfill.",
        note: "The soil thrust acts at H/3 above the base; the surcharge thrust acts at H/2.",
      },
      {
        formula: "FS_sliding = (ΣW × μ) ÷ Pa;   FS_overturning = ΣM_resisting ÷ ΣM_overturning",
        variables:
          "ΣW = total vertical weight (wall + soil on heel); μ = base friction, which cannot exceed tan φ of the foundation soil.",
        note: "Required: FS_sliding ≥ 1.5 and FS_overturning ≥ 2.0. A shear key or passive pressure in front of the toe is added only if sliding fails.",
      },
      {
        formula: "e = B/2 − x̄;   q_max/min = (ΣW ÷ B) × (1 ± 6e/B)",
        variables:
          "e = eccentricity of the resultant; x̄ = distance of the resultant from the toe; B = base width; q = bearing pressure under the base.",
        note: "Accept only if e ≤ B/6 (resultant in the middle third, so q_min ≥ 0) and q_max ≤ the safe bearing capacity.",
      },
    ],
    tables: [
      {
        title: "Rankine Ka by friction angle (level backfill)",
        headers: ["φ", "25°", "30°", "35°"],
        rows: [["Ka", "0.41", "0.33", "0.27"]],
      },
      {
        title: "Acceptance criteria",
        headers: ["Check", "Required"],
        rows: [
          ["Sliding factor of safety", "≥ 1.5"],
          ["Overturning factor of safety", "≥ 2.0"],
          ["Resultant eccentricity", "e ≤ B/6 (middle third)"],
          ["Bearing pressure", "q_max ≤ SBC, q_min ≥ 0"],
          ["Base-width rule of thumb", "0.5H – 0.7H (the stability checks govern, not the rule)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 3.0 m stem on a 3.0 m base (the calculator's defaults)",
      inputs:
        "Stem height 3.0 m, base 3.0 m wide × 0.4 m deep (total height 3.4 m), toe 0.9 m, stem 0.2 m at top / 0.4 m at bottom, γ = 18 kN/m³, φ = 30°, surcharge 10 kN/m², μ = 0.5, SBC 200 kN/m², M25 concrete, Fe 500 steel.",
      steps: [
        "Ka = (1 − sin 30°) ÷ (1 + sin 30°) = 0.333.",
        "Soil thrust Pa,soil = ½ × 0.333 × 18 × 3.4² = 34.7 kN/m. Surcharge thrust Pa,sur = 0.333 × 10 × 3.4 = 11.3 kN/m. Total driving force = 46.0 kN/m.",
        "Sliding: resisting friction from the wall and heel soil gives FS_sliding = 1.75 — above the 1.5 minimum.",
        "Overturning: FS_overturning = 5.20 — well above the 2.0 minimum.",
        "Bearing: eccentricity e = 0.03 m (limit B/6 = 0.50 m), so the resultant is comfortably inside the middle third; q_max = 56.5 kPa and q_min = 51.0 kPa, both below the 200 kPa SBC.",
        "The solver also reports the minimum base width that passes all three checks: 2.6 m for this soil and height.",
      ],
      result:
        "The 3.0 m base passes all three checks (sliding 1.75, overturning 5.20, bearing 56.5 kPa max) and could be narrowed to 2.6 m. Stem steel is 480 mm²/m vertical — check it against the IS 456 minimum before ordering.",
    },
    related: [
      { id: "isolated-footing", title: "Isolated Footing Design Calculator — IS 456", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation and backfill volumes for the wall and its drainage trench." },
      { id: "geotechnical", title: "Soil Mechanics Lab Calculator — Water Content, Proctor & Atterberg", desc: "The soil parameters (φ, γ, SBC) this wall design depends on, from lab data." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for the stem, base and any shear key." },
    ],
  },

  earthworks: {
    id: "earthworks",
    intro:
      "Earthworks is volume arithmetic with two corrections: soil bulks up when it is dug (swell) and shrinks when it is compacted (shrinkage), so the volume in the ground, the volume in the truck and the volume in the fill are three different numbers. Between two cross-sections the volume is found by the average-end-area rule or, more exactly, by the prismoidal rule — the difference is the prismoidal correction, and it is only real if the mid-section area is actually measured at mid-length rather than averaged. The same ideas size trenches (trapezoidal section, pipe and bedding deducted for backfill) and balance cut against fill along a road or canal (IS 1200 Part 27).",
    formulas: [
      {
        formula: "V_prismoidal = L ÷ 6 × (A1 + 4Am + A2)",
        variables:
          "L = length between sections; A1, A2 = end areas; Am = mid-section area, MEASURED at mid-length.",
        note: "Exact for a prismoid. If Am is just the mean of the ends, the correction is zero and the warning in the calculator tells you to measure it.",
      },
      {
        formula: "V_average-end-area = L × (A1 + A2) ÷ 2",
        variables: "Same symbols as above. Simple and approximate — it overstates volume when the ground is convex.",
        note: "Prismoidal correction = V_prismoidal − V_average-end-area. On the worked example below it is +133 m³ on 4,500 m³.",
      },
      {
        formula: "V_loose = V × (1 + swell %);   V_compacted = V × (1 − shrinkage %)",
        variables:
          "Defaults: swell 15%, shrinkage 10%. Loose volume is what the trucks carry; compacted volume is what the fill becomes.",
        note: "Truck trips = ⌈V_loose ÷ truck capacity⌉, with an 8 m³ truck as the default.",
      },
      {
        formula: "Backfill = excavation − pipe volume − bedding volume;  Spoil (loose) = excavation × (1 + swell %)",
        variables:
          "Trench section area = (bottom width + top width) ÷ 2 × depth; top width = bottom width + 2 × side slope × depth.",
        note: "Pipe volume = π × (dia/2)² × length. Spoil is what must be carted away or stockpiled.",
      },
    ],
    tables: [
      {
        title: "Volume corrections (calculator defaults)",
        headers: ["Correction", "Default"],
        rows: [
          ["Swell (excavated soil bulks up)", "15%"],
          ["Shrinkage (compacted fill)", "10%"],
          ["Truck capacity", "8 m³"],
        ],
      },
      {
        title: "Trench side slopes (OSHA maximum allowable, H:V)",
        headers: ["Soil type", "Slope (H per V)"],
        rows: [
          ["Type A — stable rock / stiff clay", "0.75 : 1"],
          ["Type B — most soils", "1 : 1"],
          ["Type C — loose / submerged", "1.5 : 1"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 100 m of road cutting",
      inputs:
        "Length 100 m, end areas 50 m² and 40 m², measured mid area 47 m², swell 15%, shrinkage 10%, 8 m³ trucks, excavation PKR 150/m³, compaction PKR 100/m³, haul PKR 500/trip.",
      steps: [
        "Average-end-area volume = 100 × (50 + 40) ÷ 2 = 4,500 m³.",
        "Prismoidal volume = 100 ÷ 6 × (50 + 4×47 + 40) = 4,633.33 m³ — a correction of +133.33 m³.",
        "Loose volume = 4,633.33 × 1.15 = 5,328.33 m³. Compacted volume = 4,633.33 × 0.90 = 4,170 m³.",
        "Truck trips = ⌈5,328.33 ÷ 8⌉ = 667 trips.",
        "Cost = 4,633.33 × 150 + 4,170 × 100 + 667 × 500 = PKR 1,445,500.",
      ],
      result:
        "4,633 m³ in the ground becomes 5,328 m³ loose (667 truckloads) and 4,170 m³ compacted, at PKR 1,445,500. A trench check on the same job — 50 m long, 1.0 m bottom, 1:0.5 sides, 1.5 m deep, 300 mm pipe — excavates 131.25 m³, backfills 123.72 m³ and spoils 150.94 m³ loose.",
    },
    related: [
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve, with origin correction and resilient modulus." },
      { id: "geotechnical", title: "Soil Mechanics Lab Calculator — Water Content, Proctor & Atterberg", desc: "Proctor compaction (OMC/MDD), field density and soil classification from lab data." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Earth pressure, stability checks and material quantities for retaining walls." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project, including excavation and backfill." },
    ],
  },

  "solar-roof": {
    id: "solar-roof",
    intro:
      "A rooftop solar system is sized from the electricity bill, not from the roof: monthly units give daily demand, daily demand divided by peak sun hours gives the kilowatts needed, and the kilowatts divided by the panel wattage gives the panel count. Everything else follows — the roof area the panels need (with spacing for access and shading), the inverter size (the larger of the array and the peak load), and, for a hybrid system, the battery (daily demand times the days of autonomy, divided by the usable depth of discharge). The financial case turns on net metering: in Pakistan exported units are credited at only about 20% of the import tariff (NEPRA buyback roughly PKR 9–11/kWh against a ~PKR 50 import tariff), so a system pays back fastest when you use most of what you generate.",
    formulas: [
      {
        formula: "Daily demand = monthly units ÷ 30.4",
        variables: "Monthly units are kWh from the bill; 30.4 is the average days per month.",
      },
      {
        formula: "Required kWp = (daily demand ÷ PSH) ÷ derate",
        variables:
          "PSH = peak sun hours for the city (Lahore 5.0); derate = 1 − system losses (14% default, so 0.86).",
        note: "Panels = ⌈required kWp × 1000 ÷ panel wattage⌉. Installed kWp is always a little above required, because panels come in whole units.",
      },
      {
        formula: "Roof needed = panels × panel area × 1.3",
        variables:
          "Panel area is about 2.58 m² for a 545 W panel; the 1.3 factor is 30% spacing for access and shading.",
        note: "The calculator also reports the maximum system that fits the roof you have.",
      },
      {
        formula: "Inverter kVA = ⌈max(installed kWp, peak load kW) ÷ inverter efficiency⌉",
        variables: "Inverter efficiency defaults to 97%. Peak load is the largest load the house draws at once.",
      },
      {
        formula: "Battery kWh = daily demand × autonomy days ÷ DoD",
        variables:
          "DoD = depth of discharge (LiFePO4 80%). Batteries are sold in 200 Ah × 48 V modules (9.6 kWh each), so the installed battery is rounded UP to whole modules and the oversizing is reported.",
        note: "On-grid systems have no battery; hybrid and off-grid do.",
      },
      {
        formula: "Year-1 savings = self-used kWh × tariff + exported kWh × tariff × 20%",
        variables:
          "Self-used is the smaller of generation and usage; exported is the rest. Export credit is 20% of the import tariff.",
        note: "The old 100% export credit overstated savings on exported units by about 2×. Simple payback = total cost ÷ net annual savings.",
      },
    ],
    tables: [
      {
        title: "Peak sun hours by city",
        headers: ["City", "PSH"],
        rows: [
          ["Lahore", "5.0"],
          ["Karachi", "5.6"],
          ["Islamabad", "5.0"],
          ["Multan", "5.5"],
          ["Quetta", "5.8"],
          ["Dubai", "6.2"],
          ["Mumbai", "5.1"],
          ["Delhi", "5.2"],
        ],
      },
      {
        title: "System types",
        headers: ["Type", "Battery?", "Behaviour in a power cut"],
        rows: [
          ["On-grid", "No", "Stops — cheapest, fastest payback"],
          ["Hybrid", "Yes", "Keeps running on battery — costs the most"],
          ["Off-grid", "Yes", "For sites with no grid connection at all"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 600 units a month in Lahore, hybrid (the calculator's defaults)",
      inputs:
        "600 units/month, Lahore (PSH 5.0), 14% system losses, 545 W panels (2.58 m² each), 100 m² roof, 4.5 kW peak load, hybrid with 1 day of autonomy, LiFePO4 battery, PKR 50/kWh tariff, 20% export credit. Indicative Nov 2026 rates: panels PKR 90/W, inverter PKR 25,000/kVA, battery PKR 65,000/kWh.",
      steps: [
        "Daily demand = 600 ÷ 30.4 = 19.74 kWh/day.",
        "Required kWp = (19.74 ÷ 5.0) ÷ 0.86 = 4.59 kW. Panels = ⌈4.59 × 1000 ÷ 545⌉ = 9 panels = 4.91 kWp installed.",
        "Roof needed = 9 × 2.58 × 1.3 = 30.2 m² (the 100 m² roof fits 29 panels / 15.80 kWp).",
        "Inverter = ⌈max(4.91, 4.5) ÷ 0.97⌉ = 6 kVA.",
        "Battery = 19.74 × 1 ÷ 0.80 = 24.67 kWh → 3 × 200 Ah × 48 V modules = 28.8 kWh (+16.7% oversize from module rounding).",
        "Cost: panels PKR 441,450 + inverter PKR 150,000 + battery PKR 1,872,000 + mounting, wiring, labour, net-metering fee and contingency = PKR 3,037,852 total. The battery is about two-thirds of it.",
        "Year-1 generation 7,698 kWh against 7,200 kWh used; 498 kWh exported at PKR 10/kWh. Year-1 savings PKR 364,984; simple payback 8.68 years.",
      ],
      result:
        "9 × 545 W panels (4.91 kWp), 6 kVA inverter and a 28.8 kWh battery cost PKR 3,037,852 at indicative Nov 2026 rates and pay back in 8.7 years. An on-grid system without the battery costs far less and pays back much faster — confirm every rate with your supplier.",
    },
    related: [
      { id: "solar-water-heater", title: "Solar Water Heater Sizing Tool", desc: "Collector area and tank capacity from daily hot-water demand, location and sunshine." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, including solar add-ons." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier — grey, standard, premium or luxury." },
    ],
  },

  house: {
    id: "house",
    intro:
      "The House Estimator builds a whole-house budget from the plot, not from a bill of quantities: thumb-rule quantities are derived from the covered area, priced from an editable rate table, and split into grey structure, finishing and value-added add-ons (solar, smart home, landscaping). The quantities are deliberately simple — wall length is taken as 15% of the covered area, brickwork at 13.5 bricks per cubic foot, concrete by the 1:2:4 nominal mix — so the result is a planning budget, not a BOQ: the design standard is NBC Pakistan 2021, the structural system is an RCC frame, the seismic zone is 2B, and every rate is labelled indicative. Confirm quantities from drawings and rates from your contractor before ordering. The estimate must not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.",
    formulas: [
      {
        formula: "Wall length = 0.15 × covered area (ft);  Total height = room height × stories + foundation depth",
        variables:
          "Covered area in sq ft; room height typically 10.5 ft; foundation depth 3 ft in the defaults.",
        note: "A thumb rule — it assumes a typical room layout. An unusual plan needs its wall lengths measured from the drawing.",
      },
      {
        formula: "Brickwork volume = wall length × total height × 0.75 ft × 0.85 (opening deduction)",
        variables:
          "0.75 ft is the wall thickness (9 in); 0.85 deducts 15% for doors and windows. Bricks = volume × 13.5 per cft.",
        note: "Brickwork mortar is 30% of the brickwork volume, split 1:4 — cement 1⁄5, sand 4⁄5.",
      },
      {
        formula: "RCC: wet volume = slab volume × 1.25;  dry volume = wet × 1.54;  cement = dry ÷ 7 (1:2:4)",
        variables:
          "Slab volume = covered area × 0.5 ft × stories. Dry 1.54 converts wet concrete to dry ingredients; 1:2:4 gives cement 1⁄7, sand 2⁄7, crush 4⁄7.",
        note: "Plaster uses the same idea with the dry-mortar factor 1.33 and a 1:4 split; plaster area is both faces of the walls.",
      },
      {
        formula: "Cement bags = cement (cft) ÷ 1.25 cft per bag",
        variables:
          "The component convention is 1.25 cft per 50 kg bag (exact 1.226 cft — documented as acceptable rounding).",
        note: "Bag counts are rounded UP per part (brickwork, RCC, plaster) and then added.",
      },
      {
        formula: "Steel (kg) = slab volume × 1.25 × 0.015 × 222.2 × seismic × structure × foundation multipliers",
        variables:
          "0.015 is the steel ratio; 222.2 is the volume-to-weight conversion; Zone 2B seismic multiplier is 1.05.",
        note: "A thumb rule for budgeting. Real steel comes from the structural design — beam, column and slab schedules.",
      },
      {
        formula: "Finishing = base finishing rate × quality multiplier (Standard 1.0, Premium 1.6, Luxury 2.5)",
        variables:
          "Finishing covers tiles (35%), paint (20%), woodwork and MEP; MEP is priced as a share of the finishing rate, rising 5% per extra washroom or kitchen.",
        note: "Total cost = grey structure + finishing + add-ons. Add-ons (solar, smart home, landscaping) are priced separately and itemised.",
      },
    ],
    tables: [
      {
        title: "What a 5 marla house uses (spec example — see worked example)",
        headers: ["Item", "Quantity"],
        rows: [
          ["Bricks", "34,856"],
          ["Cement (brickwork + RCC + plaster)", "426 bags"],
          ["Steel", "4,922 kg"],
          ["Sand", "1,506 cft"],
          ["Crush (aggregate)", "1,238 cft"],
          ["Plaster area", "6,024 sq ft"],
        ],
      },
      {
        title: "Finish quality multipliers",
        headers: ["Finish", "Multiplier on finishing rate"],
        rows: [
          ["Standard", "1.0×"],
          ["Premium", "1.6×"],
          ["Luxury", "2.5×"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 5 marla plot, G+1, 1,125 sq ft covered area",
      inputs:
        "Covered area 1,125 sq ft, 2 stories, room height 10.5 ft, foundation depth 3 ft, seismic Zone 2B (steel ×1.05), standard multipliers (structure, foundation ×1.0).",
      steps: [
        "Wall length = 0.15 × 1,125 = 168.75 ft. Total height = 10.5 × 2 + 3 = 24 ft.",
        "Brickwork volume = 168.75 × 24 × 0.75 × 0.85 = 2,581.88 cft. Bricks = 2,581.88 × 13.5 = 34,856.",
        "Brickwork mortar = 2,581.88 × 0.30 = 774.56 cft dry; cement = 774.56 ÷ 5 = 154.91 cft ÷ 1.25 = 124 bags.",
        "Slab volume = 1,125 × 0.5 × 2 = 1,125 cft. RCC wet = 1,125 × 1.25 = 1,406.25 cft; dry = 1,406.25 × 1.54 = 2,165.63 cft; cement = 2,165.63 ÷ 7 = 309.38 cft ÷ 1.25 = 248 bags.",
        "Steel = 1,125 × 1.25 × 0.015 × 222.2 × 1.05 = 4,922 kg.",
        "Plaster area = 168.75 × 21 × 2 × 0.85 = 6,024 sq ft. Wet plaster = 6,024 × (0.5 ÷ 12) = 251.02 cft; dry = 251.02 × 1.33 = 333.85 cft; cement = 333.85 ÷ 5 = 66.77 cft ÷ 1.25 = 54 bags.",
      ],
      result:
        "34,856 bricks, 426 bags of cement (124 brickwork + 248 RCC + 54 plaster), 4,922 kg of steel, 1,506 cft of sand and 1,238 cft of crush for the grey structure of a double-storey 5 marla house. Finishing and add-ons are priced on top of this by the finish multiplier you choose.",
    },
    related: [
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier — grey, standard, premium or luxury, with the marla-standard toggle." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall — measure your own walls instead of the thumb rule." },
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths and bar weights for the beams, columns and slabs in the estimate." },
      { id: "solar-roof", title: "Solar Roof Calculator — Panels, Battery & Payback", desc: "Size the solar system for the house and price it as an add-on." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project from measured dimensions." },
    ],
  },
};

/** Look up the guide for a tool id, or undefined when the tool keeps the generic boilerplate. */
export function getToolGuide(toolId: string): ToolGuide | undefined {
  return TOOL_GUIDES[toolId];
}
