/**
 * toolGuides.ts — per-tool guide content for the 75 tools rendered inside
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

/* ------------------------------------------------------------------ */
/* Round 3 Batch D support: engine-computed worked-example numbers    */
/* (moved verbatim from toolGuidesR3D.ts — its guide entries          */
/* interpolate these consts in template literals).                    */
/* ------------------------------------------------------------------ */

import { blendPassing, blendedGs, power45Line, BLEND_EXAMPLE } from "../lib/blendCalc";
import { directShearFit, terzaghiSbc, terzaghiFactors, DIRECT_SHEAR_WORKED } from "../lib/directShearCalc";
import { waterContent, specificGravity, onePointLiquidLimit, atterberg, phaseRelations, freeSwell, cbrFromLoads } from "../lib/geotechCalc";
import { analyseSieve, SIEVE_WORKED_ROWS } from "../lib/sieveCalc";
import { constantHeadK, fallingHeadK, temperatureCorrectionFactor, hazenK, kToMetresPerDay } from "../lib/permeabilityCalc";
import { proctorFit, coreCutter, PROCTOR_MOULD_CM3, PROCTOR_WORKED } from "../lib/proctorCalc";
import { ucs, vaneShear } from "../lib/ucsVaneCalc";
import { calcRainwater } from "../lib/rainwaterCalc";
import { calcSolarWaterHeater } from "../lib/solarWaterHeaterCalc";
import { calcSolarRoof, defaultSolarRoofInputs } from "../lib/solarRoofCalc";
import { calcElectricalLoad, DEFAULT_APPLIANCES } from "../lib/electricalLoad";
import { calcAcSizing } from "../lib/acSizing";
import { calcPlumbing } from "../lib/plumbingFixture";
import { calcManning, calcDesignFlow, selectSewerPipe, calcSeptic } from "../lib/sewerageCalc";
import { calcBod, calcCod, calcEffluentScreen } from "../lib/wastewaterLabCalc";
import { calcAntiTermite, ANTITERMITE_CHEMICALS } from "../lib/antiTermiteCalc";
import { stationAreas, trapezoidalVolumes, chainageBalance } from "../lib/chainageCalc";
import { verticalCurve, curveHighLowPoint, stationElevations } from "../lib/gradientCalc";
import { blend, checkAgainstSpec, calcMixQuantities, solveProportions, DEFAULT_STOCKPILES, DEFAULT_PROPORTIONS } from "../lib/pavementMixCalc";
import { layerQuantities, coatQuantity, ROAD_WORKED_LAYERS } from "../lib/roadCalc";
import { topsoilCalc, TOPSOIL_WORKED } from "../lib/topsoilCalc";

/* ------------------------------------------------------------------ */
/* Engine-computed worked-example numbers (module load)               */
/* ------------------------------------------------------------------ */

// Aggregate blending — BLEND_EXAMPLE: 40/35/25 on 20 mm / 10 mm / dust.
const BLEND_PASS = blendPassing(BLEND_EXAMPLE.stockpiles, BLEND_EXAMPLE.proportions);
const BLEND_GS = blendedGs(BLEND_EXAMPLE.stockpiles, BLEND_EXAMPLE.proportions);

// Direct shear — DIRECT_SHEAR_WORKED points (50,35) (100,60) (150,85).
const SHEAR_FIT = directShearFit(DIRECT_SHEAR_WORKED);
const TERZ = terzaghiSbc(10, 30, 18, 1, 1.5);
const TERZ_0 = terzaghiFactors(0);
const TERZ_20 = terzaghiFactors(20);
const TERZ_40 = terzaghiFactors(40);

// Geotechnical index tests.
const GEO_WC = waterContent(20, 120, 100);
const GEO_GS = specificGravity(650, 900, 1650, 1500);
const GEO_LL1 = onePointLiquidLimit(38, 20);
const GEO_ATT = atterberg(45, 22, 30, 20);
const GEO_PHASE = phaseRelations(25, 2.667, 1.8);
const GEO_SWELL = freeSwell(10, 15);
const GEO_CBR = cbrFromLoads(180, 300);

// Sieve analysis — SIEVE_WORKED_ROWS, 1,000 g sample + 20 g pan.
const SIEVE = analyseSieve(SIEVE_WORKED_ROWS, 1000, 20);

// Permeability — constant head Q 120 cm³, L 10 cm, A 78.5 cm², h 20 cm, t 60 s;
// falling head a 1.77 cm², L 10 cm, A 78.5 cm², t 120 s, h1 90 cm, h2 60 cm.
const PERM_CONST = constantHeadK(120, 10, 78.5, 20, 60);
const PERM_FALL = fallingHeadK(1.77, 10, 78.5, 120, 90, 60);
const PERM_TCF22 = temperatureCorrectionFactor(22);
const PERM_HAZEN = hazenK(0.15);

// Soil mechanics lab — Proctor (PROCTOR_WORKED, 943.3 cm³ mould),
// core cutter Ø 10 cm × 12.7 cm, 1,800 g wet, w 12%; UCS 38 mm / 250 N / 15%;
// vane 15 N·m, 50 × 100 mm.
const PROCTOR = proctorFit(PROCTOR_WORKED, PROCTOR_MOULD_CM3);
const CORE = coreCutter(10, 12.7, 1800, 12, PROCTOR.mddGCc);
const UCS = ucs(38, 250, 15);
const VANE = vaneShear(15, 50, 100);

// Rainwater — 100 m² concrete-tile roof, Lahore (628 mm), 4 people.
const RAIN = calcRainwater({ roofAreaM2: 100, city: "Lahore", people: 4 });
// Solar water heater — 4 people, flat-plate defaults.
const SWH = calcSolarWaterHeater({ people: 4 });
// Solar roof — Lahore defaults (600 units/month, hybrid).
const SOLAR = calcSolarRoof(defaultSolarRoofInputs("Lahore"));
// MEP — electrical defaults, AC 12 × 15 ft room, plumbing 2 WC + 2 basins + 2 showers.
const ELEC = calcElectricalLoad({ appliances: DEFAULT_APPLIANCES, phase: "single", cableLengthM: 20 });
const AC_EX = calcAcSizing({ areaSqFt: 180, ceilingHeightFt: 10, occupants: 4, sun: "sunny", tariffPerKwh: 50 });
const PLUMB = calcPlumbing({ fixtures: [{ kind: "wcTank", count: 2 }, { kind: "basin", count: 2 }, { kind: "bathShower", count: 2 }] });

// Wastewater — BOD₅ defaults (DO 8.5 → 3.2 mg/L, 10 mL in 300 mL);
// COD defaults (blank 25.0 mL, sample 12.5 mL, 0.1 N, 50 mL sample).
const BOD = calcBod({ initialDoMgL: 8.5, finalDoMgL: 3.2, sampleVolumeMl: 10, bottleVolumeMl: 300 });
const COD = calcCod({ blankTitrantMl: 25.0, sampleTitrantMl: 12.5, normality: 0.1, sampleVolumeMl: 50 });
const EFFLUENT = calcEffluentScreen({
  bod: { initialDoMgL: 8.5, finalDoMgL: 3.2, sampleVolumeMl: 10, bottleVolumeMl: 300 },
  cod: { blankTitrantMl: 25.0, sampleTitrantMl: 12.5, normality: 0.1, sampleVolumeMl: 50 },
});
const MANNING = calcManning({ diameterM: 0.2, gradient1InX: 200, material: "pvc" });
const DESIGN_FLOW = calcDesignFlow({ population: 50 });
const PIPE_SEL = selectSewerPipe({ population: 50, gradient1InX: 200, material: "pvc" });
const SEPTIC = calcSeptic({ users: 10 });

// Anti-termite — 100 m² floor, 40 m trench, Bifenthrin 2.5% EC (1:19).
const TERMITE = calcAntiTermite({ floorAreaM2: 100, trenchLengthM: 40, chemical: ANTITERMITE_CHEMICALS[0] });

// Chainage — 4 stations, 7 m formation, 1.5:1 slopes both sides.
const CHAIN_AREAS = stationAreas(
  [
    { chainage: 0, ngl: 100, formationLevel: 100 },
    { chainage: 30, ngl: 102, formationLevel: 100 },
    { chainage: 60, ngl: 98, formationLevel: 100 },
    { chainage: 90, ngl: 99, formationLevel: 100 },
  ],
  7, 1.5, 1.5,
);
const CHAIN_VOL = trapezoidalVolumes(CHAIN_AREAS);
const CHAIN_BAL = chainageBalance(CHAIN_VOL.cutM3, CHAIN_VOL.fillM3);

// Gradient — crest +2% → −3% and sag −2% → +3%, both at 80 km/h (SSD 120 m).
const GRAD_CREST = verticalCurve(2, -3, 80);
const GRAD_SAG = verticalCurve(-2, 3, 80);
const GRAD_HL = curveHighLowPoint(2, -3, GRAD_CREST.lengthM);
const GRAD_ELEV = stationElevations(0, 100, 2, -3, GRAD_CREST.lengthM, 20);

// Pavement mix — BC-1: default 40/30/30 proportions vs the solver's best.
const PAV_DEFAULT_BLEND = blend(DEFAULT_PROPORTIONS, DEFAULT_STOCKPILES);
const PAV_DEFAULT_CHECK = checkAgainstSpec(PAV_DEFAULT_BLEND, "bc-1");
const PAV_SOLVED = solveProportions(DEFAULT_STOCKPILES, "bc-1");
const PAV_SOLVED_BLEND = blend(PAV_SOLVED.proportions, DEFAULT_STOCKPILES);
const PAV_SOLVED_CHECK = checkAgainstSpec(PAV_SOLVED_BLEND, "bc-1");
const PAV_QTY = calcMixQuantities(1000, 40, 5.2, PAV_SOLVED.proportions);

// Road pavement — 1 km of the worked crust (BC/DBM/WMM/GSB/subgrade).
const ROAD_Q = ROAD_WORKED_LAYERS.map((l) => ({ name: l.name, ...layerQuantities(1000, l) }));
const ROAD_VOL_TOTAL = ROAD_Q.reduce((a, q) => a + q.volumeM3, 0);
const ROAD_TON_TOTAL = ROAD_Q.reduce((a, q) => a + q.tonnageT, 0);
const COAT_PRIME = coatQuantity(7000, 0.75);

// Topsoil — 50 m² × 0.15 m topsoil.
const TOPSOIL = topsoilCalc(TOPSOIL_WORKED);

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
  "aggregate-tests": {
    id: "aggregate-tests",
    intro:
      "Aggregate tests decide whether the stone going into your concrete is strong enough, hard enough and clean enough — before a single cubic metre is poured. The four tests in this calculator all come from IS 2386: the Aggregate Impact Value (AIV) and Aggregate Crushing Value (ACV) measure strength under sudden and gradual load (Part IV), the Los Angeles abrasion value measures wear (Part IV), and water absorption plus specific gravity measure porosity (Part III). IS 383 sets the acceptance limits. IS 2386 requires the MEAN of two trials to be reported, not the better one — a single good result never overrules a bad twin.",
    formulas: [
      {
        formula: "AIV = W3 ÷ (W2 − W1) × 100",
        variables:
          "W1 = empty container weight; W2 = container + aggregate; W3 = weight passing the 2.36 mm sieve after 15 blows of the impact hammer. Sample is about 350 g of aggregate passing 12.5 mm and retained on 10 mm (IS 2386 Pt IV).",
        note: "Same form for ACV — only the loading differs (a steadily applied 40-tonne load instead of blows).",
      },
      {
        formula: "LA abrasion = loss ÷ original × 100",
        variables:
          "Loss = weight passing the 1.70 mm sieve after the Los Angeles drum, OR original − retained weight. Both entries are accepted — entering retained weight as 'passing' used to give a silent 76% 'UNSUITABLE'.",
        note: "Sample is usually 5,000 g total, grading A–G by size (IS 2386 Pt IV Table 2).",
      },
      {
        formula: "Water absorption = (SSD − oven-dry) ÷ oven-dry × 100",
        variables:
          "SSD = saturated surface-dry weight in air; oven-dry = weight after drying at 100–110 °C. Sample about 2 kg, soaked 24 hours (IS 2386 Pt III).",
        note: "Absorption above 2% (IS 383) means porous aggregate that steals mixing water and weakens the concrete.",
      },
      {
        formula: "Bulk SG = oven-dry ÷ (SSD − in-water);   Apparent SG = oven-dry ÷ (oven-dry − in-water)",
        variables:
          "In-water = weight of the sample suspended in water. Bulk SG includes the permeable pores; apparent SG excludes them, so apparent SG is always the higher number.",
      },
    ],
    tables: [
      {
        title: "Acceptance limits (IS 383 / IS 2386 / MoRTH / IRC)",
        headers: ["Test", "Wearing course", "Base course", "Unsuitable"],
        rows: [
          ["Impact value (AIV)", "≤ 30%", "≤ 45% (non-wearing concrete)", "> 45%"],
          ["Crushing value (ACV)", "≤ 30%", "≤ 45%", "> 45%"],
          ["LA abrasion", "≤ 30% (MoRTH)", "≤ 50% (MoRTH)", "> 50%"],
          ["Water absorption", "≤ 2% (IS 383)", "2–5% only with engineer approval", "> 5% high porosity"],
        ],
      },
      {
        title: "Reading the impact value",
        headers: ["AIV (%)", "Verdict"],
        rows: [
          ["≤ 10", "Exceptionally strong"],
          ["10–20", "Strong — wearing course, base course, concrete"],
          ["20–30", "Satisfactory for road surfacing"],
          ["30–45", "Satisfactory for non-wearing concrete only"],
          ["> 45", "UNSUITABLE for concrete"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one sample through all four tests",
      inputs:
        "Impact: W1 100 g, W2 450 g, W3 70 g. Crushing: same weights, W3 105 g. LA: 5,000 g sample, 1,400 g passing 1.70 mm. Absorption: SSD 1,015 g, in water 650 g, oven-dry 1,000 g. A second impact trial gives 22%.",
      steps: [
        "Impact: sample = 450 − 100 = 350 g; AIV = 70 ÷ 350 × 100 = 20% — 'Strong', suitable for wearing course.",
        "Crushing: ACV = 105 ÷ 350 × 100 = 30% — exactly at the wearing-course limit, suitable for wearing and base course.",
        "LA abrasion = 1,400 ÷ 5,000 × 100 = 28% — inside the MoRTH 30% wearing-course limit.",
        "Water absorption = (1,015 − 1,000) ÷ 1,000 × 100 = 1.5% — good quality (≤ 2%, IS 383). Bulk SG = 1,000 ÷ (1,015 − 650) = 2.74; apparent SG = 1,000 ÷ (1,000 − 650) = 2.86 — both inside the normal 2.5–3.0 range.",
        "IS 2386 reports the mean of two trials: (20 + 22) ÷ 2 = 21% impact value, still 'Strong'.",
      ],
      result:
        "AIV 20%, ACV 30%, LA 28%, water absorption 1.5% with SG 2.74 — this aggregate passes every wearing-course limit. One failing test is enough to reject a source: re-test a fresh sample before accepting the delivery.",
    },
    related: [
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "aggregate-blending", title: "Aggregate Blending Calculator", desc: "Blend two or three aggregate fractions to hit a target gradation curve." },
      { id: "master-sieve", title: "Master Sieve Analysis Calculator", desc: "Sieve analysis, fineness modulus and gradation curves checked against MoRTH and IS envelopes." },
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve, with origin correction and resilient modulus." },
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, Atterberg limits, Proctor compaction and CBR from lab data." },
    ],
  },

  "beam-design": {
    id: "beam-design",
    intro:
      "Beam design by the IS 456:2000 limit state method is a chain of five checks, not one number: the factored moment against the limiting moment, the steel area against its minimum and maximum, deflection (span-to-depth), shear, and development length. The effective depth is d = D − cover − φ/2 — the stirrup diameter belongs in d′ (the compression-steel depth), not in d. A continuous beam is designed at two moments (support wL²/10, span wL²/12), not the simply-supported wL²/8, and its interior-support shear is 0.625·wL, not wL/2. When the moment exceeds Mu,lim the section is doubly reinforced and the compression-steel stress comes from SP-16 Table F by d′/d and steel grade — for Fe500 it is well below 0.87·fy, so assuming 0.87·fy would under-design the compression steel.",
    formulas: [
      {
        formula: "d = D − cover − φ/2;   d′ = cover + stirrup dia + φ/2",
        variables:
          "d = effective depth; D = overall depth; φ = main bar diameter. Self-weight w_sw = 25·b·D ÷ 10⁶ kN/m (25 kN/m³ concrete), added to the working load before factoring.",
        note: "Factored load W = (working load + self-weight) × safety factor (1.5 default).",
      },
      {
        formula: "Mu = wL²/8 (simply supported);  wL²/10 support & wL²/12 span (continuous);  wL²/2 (cantilever)",
        variables:
          "w = factored load kN/m; L = span m. Vu = wL/2 (simply supported), 0.625·wL (continuous interior support), wL (cantilever).",
      },
      {
        formula: "Mu,lim = 0.36·fck·(xu,max/d)·(1 − 0.416·xu,max/d)·b·d²",
        variables:
          "xu,max/d = 0.53 (Fe250), 0.48 (Fe415), 0.46 (Fe500), 0.44 (Fe550) — IS 456 Cl. G.2.2.1. Mu > Mu,lim means doubly reinforced.",
        note: "Ast = (0.5·fck/fy)·(1 − √(1 − 4.6·Mu/(fck·b·d²)))·b·d (singly reinforced, exact LSM quadratic).",
      },
      {
        formula: "Ast,min = 0.85·b·d ÷ fy;   Ast,max = 0.04·b·D;   Ld = 0.87·fy·φ ÷ (4·τbd)",
        variables:
          "Ast limits IS 456 Cl. 26.5.1.1. τbd is the design bond stress, IS 456 Table 26 (×1.6 for deformed bars): 1.4 MPa for M25, so Ld ≈ 777 mm for a 16 mm Fe500 bar in M25.",
        note: "Deflection: L/d ≤ basic ratio (20 simply supported, 26 continuous, 7 cantilever) × modification factor kt from the steel stress and percentage. Shear: τv = Vu/(b·d) ≤ τc (Table 19) with stirrups, and never above τc,max (Table 20).",
      },
    ],
    tables: [
      {
        title: "Limiting moment and steel limits by grade",
        headers: ["Steel", "xu,max/d", "Ast,min (per m of b·d)", "Ast,max"],
        rows: [
          ["Fe250", "0.53", "0.85·b·d/250", "0.04·b·D"],
          ["Fe415", "0.48", "0.85·b·d/415", "0.04·b·D"],
          ["Fe500", "0.46", "0.85·b·d/500", "0.04·b·D"],
          ["Fe550", "0.44", "0.85·b·d/550", "0.04·b·D"],
        ],
      },
      {
        title: "Stirrup spacing caps (IS 456)",
        headers: ["Rule", "Limit"],
        rows: [
          ["Maximum spacing", "Smaller of 0.75·d and 300 mm"],
          ["Minimum-steel spacing", "0.87·fy·Asv ÷ (0.4·b)"],
          ["Design spacing (shear)", "0.87·fy·Asv·d ÷ Vus, where Vus = Vu − τc·b·d"],
          ["Nominal stirrups (τv ≤ τc)", "Minimum-steel spacing governs"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 5 m simply-supported beam (the calculator's defaults)",
      inputs:
        "Span 5 m, working load 16.67 kN/m, safety factor 1.5, section 250 × 450 mm, cover 40 mm, M25, Fe500, Ø16 main bars, Ø8 two-legged stirrups, self-weight on, 5% wastage.",
      steps: [
        "Effective depth d = 450 − 40 − 16/2 = 402 mm; d′ = 40 + 8 + 8 = 56 mm.",
        "Self-weight = 25 × 250 × 450 ÷ 10⁶ = 2.81 kN/m. Factored load W = (16.67 + 2.81) × 1.5 = 29.22 kN/m.",
        "Mu = 29.22 × 5² ÷ 8 = 91.3 kNm; Vu = 29.22 × 5 ÷ 2 = 73.1 kN. Mu,lim = 135.3 kNm, so the section is singly reinforced.",
        "Ast = 592 mm² (Ast,min 171 mm², Ast,max 4,500 mm²) → 3 × Ø16 mm bars = 603 mm² provided (pt 0.60%).",
        "Deflection: L/d = 12.44 ≤ 20.05 allowable — safe. Shear: τv = 0.73 MPa vs τc = 0.53 MPa and τc,max = 3.1 MPa — stirrups required: 2-legged Ø8 @ 300 mm c/c (capped by 0.75d / 300 mm).",
        "Development length Ld = 777 mm. One stirrup (IS 2502 detailed) = 1,112 mm. Steel: main 23.66 kg + stirrups 7.89 kg = 31.56 kg; concrete 0.563 m³ (7 bags cement, 8.0 cft sand, 16.1 cft aggregate at M25 1:1:2 with 5% wastage).",
      ],
      result:
        "250 × 450 mm beam, 3 × Ø16 mm bottom bars with Ø8 stirrups @ 300 mm c/c — singly reinforced, deflection and shear both safe, 31.56 kg of steel and 0.563 m³ of concrete for the 5 m beam. Cost PKR 20,838 at the engine's default PKR rates (indicative, Nov 2026).",
    },
    related: [
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths, bar weights and laps for beams, columns, slabs and stirrups." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "reinforcement", title: "Reinforcement Detailing Visualizer", desc: "Interactive 2D rebar detailing for beams, columns and slabs with IS 456 checks." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
    ],
  },

  calculators: {
    id: "calculators",
    intro:
      "The Construction Material Calculator is the everyday hub for site quantities: one place for concrete, brickwork, blockwork, plaster and steel, with the same house rules everywhere — dry concrete volume is wet volume × 1.54, dry mortar is wet × 1.33, one 50 kg cement bag is 0.0347 m³, and steel weighs d² ÷ 162.28 kg/m. Concrete is priced from nominal mixes (IS 456 Table 9, up to M20 — M25 and above need a design mix), brickwork from the wall volume divided by the brick-with-mortar volume, and plaster from the wall area less openings (IS 1200: no deduction under 0.5 m², one face for 0.5–3 m², both faces above 3 m²). It is a quantity hub, not a design tool: it never checks whether a section is strong enough — that is the beam, column and footing designers' job.",
    formulas: [
      {
        formula: "V_dry concrete = V_wet × 1.54;   V_dry mortar = V_wet × 1.33",
        variables:
          "Dry ingredients contain voids that water fills, so dry volume is always larger than wet. Wastage is applied to the dry volume.",
        note: "Cement bags = V_cement ÷ 0.0347 m³ per 50 kg bag, rounded up. 1 m³ = 35.31 cft.",
      },
      {
        formula: "Cement : sand : aggregate by mix — M15 1:2:4, M20 1:1.5:3, M25 1:1:2, M30 1:0.75:1.5",
        variables:
          "Each part's volume = V_dry × parts ÷ total parts. M15 and M20 are nominal mixes (IS 456 Table 9); M25 and M30 here are the hub's nominal ratios — for structural M25+ use the design-mix calculator.",
      },
      {
        formula: "Bricks N = V_wall ÷ V_brick+mortar",
        variables:
          "V_brick+mortar uses the brick plus one 10 mm joint on each face (Pakistani brick 9 × 4½ × 3 in). Openings are deducted from the wall area first; wastage is added last.",
      },
      {
        formula: "Steel W = d² ÷ 162.28 (kg/m);   total kg = W × length × bars",
        variables:
          "d = bar diameter in mm. A 12 mm bar is 0.887 kg/m, 16 mm is 1.578 kg/m, 20 mm is 2.465 kg/m.",
      },
    ],
    tables: [
      {
        title: "Nominal mixes (IS 456 Table 9 — permitted only up to M20)",
        headers: ["Grade", "Cement : sand : aggregate", "Max w/c (typical)"],
        rows: [
          ["M10", "1 : 3 : 6", "0.60"],
          ["M15", "1 : 2 : 4", "0.50"],
          ["M20", "1 : 1.5 : 3", "0.50"],
          ["M25 and above", "Design mix required (IS 10262)", "By durability exposure"],
        ],
      },
      {
        title: "What each tab of the hub calculates",
        headers: ["Tab", "Outputs"],
        rows: [
          ["Concrete", "Wet/dry volume, cement bags, sand and aggregate, steel by thumb %"],
          ["Bricks", "Brick count, mortar, cement and sand for the wall"],
          ["Blocks", "Block count and mortar for blockwork walls"],
          ["Plaster", "Plaster area (less openings), cement and sand by mix"],
          ["Steel", "Bar weight by diameter and length, stock bars to order"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 1 m³ of M15 concrete (1:2:4)",
      inputs:
        "Wet volume 1 m³, mix 1:2:4, 5% wastage, 50 kg cement bags.",
      steps: [
        "Dry volume = 1 × 1.05 (wastage) × 1.54 = 1.617 m³.",
        "Cement = 1.617 × 1⁄7 = 0.231 m³ ÷ 0.0347 = 6.66 → 7 bags.",
        "Sand = 1.617 × 2⁄7 = 0.462 m³ × 35.31 = 16.3 cft.",
        "Aggregate = 1.617 × 4⁄7 = 0.924 m³ × 35.31 = 32.6 cft.",
      ],
      result:
        "1 m³ of M15 (1:2:4) needs 7 bags of cement, 16.3 cft of sand and 32.6 cft of aggregate, wastage included. The same 1.54 / 1.33 / 0.0347 rules run every tab of the hub.",
    },
    related: [
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall in PKR, INR or AED." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project, not just one element." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
    ],
  },

  "column-design": {
    id: "column-design",
    intro:
      "A column is checked on its P–M interaction diagram: every combination of axial load P and bending moment M the section can resist, built by strain compatibility — for each neutral-axis depth, the concrete compression block and every bar's stress (from its strain at its own depth) are summed to one (M, P) point. A point inside the curve is safe; outside it fails. Before that, two gates: slenderness (effective length le = k·L, slender when le/D or le/B exceeds 12, with an additional moment from IS 456 Cl. 39.7.1) and steel limits (0.8%–6% of the gross section, IS 456 Cl. 26.5.3.1 — above 4% is impractical to place). Biaxial moments are checked by IS 456 Cl. 39.6, (Mux/Mux1)^α + (Muy/Muy1)^α ≤ 1, with α from Pu/Puz. Ties follow Cl. 26.5.3.2: diameter at least φ/4 or 6 mm, spacing at most the least lateral dimension, 16φ or 300 mm.",
    formulas: [
      {
        formula: "Pu = working load × 1.5;   Mu = working moment × 1.5;   e_min = max(L/500 + D/30, 20 mm)",
        variables:
          "Design moment = max(Mu, Pu·e_min). The Y-axis minimum eccentricity uses the WIDTH (B/30), not the depth — a common error.",
        note: "d = D − cover − φ/2 for the bending axis (the engine's convention); d′ = cover + stirrup dia + φ/2.",
      },
      {
        formula: "le = k·L;   k = 0.65 (fixed–fixed), 0.8 (fixed–pinned), 1.0 (pinned–pinned), 2.0 (fixed–free)",
        variables:
          "Slender when le/D > 12 or le/B > 12, checked about BOTH axes. Additional eccentricity e_add = le² ÷ (2000·D) (IS 456 Cl. 39.7.1) is added on the governing axis.",
      },
      {
        formula: "Puz = 0.45·fck·(Ag − Asc) + 0.75·fy·Asc",
        variables:
          "Puz = pure axial capacity (top point of the interaction diagram, zero moment). Ag = gross section area; Asc = longitudinal steel area.",
        note: "Steel limits: 0.8% ≤ Asc/Ag ≤ 6% (IS 456 Cl. 26.5.3.1); warn above 4%.",
      },
      {
        formula: "(Mux/Mux1)^α + (Muy/Muy1)^α ≤ 1;   α = 1 at Pu/Puz ≤ 0.2, 2 at ≥ 0.8, interpolated between",
        variables:
          "Mux1, Muy1 = uniaxial moment capacities at the same Pu (IS 456 Cl. 39.6). Ties: dia ≥ max(φ/4, 6 mm); spacing ≤ min(least dimension, 16φ, 300 mm).",
      },
    ],
    tables: [
      {
        title: "Effective-length factor k by end condition",
        headers: ["Ends", "k"],
        rows: [
          ["Fixed – fixed", "0.65"],
          ["Fixed – pinned", "0.80"],
          ["Pinned – pinned", "1.00"],
          ["Fixed – free", "2.00"],
        ],
      },
      {
        title: "Column steel and tie rules (IS 456)",
        headers: ["Rule", "Limit"],
        rows: [
          ["Longitudinal steel", "0.8% – 6% of Ag (warn above 4%)"],
          ["Minimum bars, rectangular", "4 (6 for circular)"],
          ["Tie diameter", "≥ max(φ/4, 6 mm)"],
          ["Tie spacing", "≤ min(least lateral dimension, 16φ, 300 mm)"],
          ["Slenderness limit", "le/D or le/B ≤ 12 for a short column"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 300 × 450 mm column, 3 m storey (the calculator's defaults)",
      inputs:
        "Working load 1,000 kN, working moment 66.67 kNm, safety factor 1.5, length 3.0 m, fixed–fixed ends, 300 × 450 mm, M25, Fe500, 8 × Ø20 mm bars, Ø8 ties, cover 40 mm.",
      steps: [
        "Factored loads: Pu = 1,500 kN; Mu = 100 kNm. Effective depth d = 450 − 40 − 10 = 400 mm.",
        "Steel: Asc = 8 × 314 = 2,513 mm² = 1.86% of Ag — inside the 0.8–6% limits.",
        "Slenderness: le = 0.65 × 3.0 = 1.95 m; le/D = 4.33, le/B = 6.50 — a short column on both axes, no additional moment.",
        "Minimum eccentricity e_min = max(3,000/500 + 450/30, 20) = 21 mm; Pu·e_min = 31.5 kNm < 100 kNm, so the design moment stays 100 kNm.",
        "Capacity: Puz = 2,433 kN; moment capacity at Pu = 132.5 kNm, above the 100 kNm design moment — SAFE.",
        "Ties: diameter ≥ max(20/4, 6) = 6 mm; spacing ≤ min(300, 16 × 20, 300) = 300 mm; 11 ties. Steel: longitudinal 59.16 kg + ties 5.26 kg = 64.41 kg; concrete 0.405 m³.",
      ],
      result:
        "300 × 450 mm column with 8 × Ø20 mm bars is safe at Pu 1,500 kN and Mu 100 kNm (capacity 132.5 kNm), a short column with Ø8 ties @ 300 mm c/c, 64.41 kg of steel and 0.405 m³ of concrete.",
    },
    related: [
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "isolated-footing", title: "Isolated Footing Design Calculator — IS 456", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths, bar weights and laps for beams, columns, slabs and stirrups." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "reinforcement", title: "Reinforcement Detailing Visualizer", desc: "Interactive 2D rebar detailing for beams, columns and slabs with IS 456 checks." },
    ],
  },

  formwork: {
    id: "formwork",
    intro:
      "Formwork (shuttering) is measured by contact area — the area of concrete surface the plywood actually touches — and the rules differ by element (IS 1200 / CPWD measurement): a column is 2 × (l + w) × h, a beam is (2h + w) × L (two sides plus soffit), a slab is L × W plus its edges 2 × (L + W) × t, and a footing is 2 × (L + W) × depth. The stock to buy is the effective area — total area divided by the number of reuses, plus wastage — because the same plywood serves several pours. Battens, props, nails, binding wire and shuttering oil are all priced off the same areas, so the main calculation and the thumb-rule cross-check can never contradict each other. The prop rate (1.5 per m²) and the consumable rates are labelled thumb rules in the tool, not code values — edit them to match your shuttering system.",
    formulas: [
      {
        formula: "Column: A = 2(l + w)·h;   Beam: A = (2h + w)·L;   Slab: A = L·W + 2(L + W)·t;   Footing: A = 2(L + W)·d",
        variables:
          "All areas in m². Slab edges are included — the old slab rule omitted them and understated shuttering by the edge area.",
        note: "Effective area = total area ÷ repetitions × (1 + wastage%). Wastage default 5%, range 0–15%.",
      },
      {
        formula: "Plywood sheets = ⌈effective area (sq ft) ÷ 32⌉",
        variables:
          "One sheet is 4 × 8 ft = 32 sq ft = 2.9768 m². Consumables are priced on the TOTAL contact area, not the effective area — every reuse consumes fresh nails and oil.",
      },
      {
        formula: "Battens = effective area (sq ft) × 0.24 Rft/sq ft;   Props = ⌈effective area (m²) × 1.5⌉",
        variables:
          "Batten rate is the top of the cited competitor range (0.79 Rmt/m² ≈ 0.24 Rft/sq ft). Props at 1.5/m² is an unsourced thumb rule — editable in the tool.",
        note: "Nails 0.075 kg/m², binding wire 0.075 kg/m², shuttering oil 0.065 L/m² (thumb-rule constants). Beam bottom planks 1 Rft per Rft of beam; ballies 0.16 nos per sq ft of slab area; centering plates 1 per 4 ft of slab/footing perimeter.",
      },
    ],
    tables: [
      {
        title: "Contact-area rules (IS 1200 / CPWD)",
        headers: ["Element", "Contact area"],
        rows: [
          ["Column", "2 × (length + width) × height"],
          ["Beam", "(2 × depth + width) × length"],
          ["Slab", "Length × width + 2 × (length + width) × thickness"],
          ["Footing", "2 × (length + width) × depth"],
        ],
      },
      {
        title: "Material rates used by the engine (editable assumptions)",
        headers: ["Item", "Rate"],
        rows: [
          ["Plywood sheet", "4 × 8 ft = 32 sq ft (2.9768 m²)"],
          ["Battens", "0.24 Rft per sq ft of effective area"],
          ["Steel props", "1.5 per m² of effective area (thumb rule)"],
          ["Nails / binding wire", "0.075 kg/m² each"],
          ["Shuttering oil", "0.065 L/m²"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 4 columns, 2 beams, 1 slab",
      inputs:
        "Columns 4 × 0.3 × 0.3 × 3.0 m; beams 2 × 4.0 m, 0.23 × 0.45 m; slab 4.0 × 3.0 m, 0.15 m thick; 1 repetition, 5% wastage.",
      steps: [
        "Columns: 2 × (0.3 + 0.3) × 3.0 × 4 = 14.40 m². Beams: (2 × 0.45 + 0.23) × 4.0 × 2 = 9.04 m². Slab: 4 × 3 + 2 × (4 + 3) × 0.15 = 14.10 m².",
        "Total contact area = 37.54 m² (404.1 sq ft). Effective area = 37.54 ÷ 1 × 1.05 = 39.42 m² (424.3 sq ft).",
        "Plywood = ⌈424.3 ÷ 32⌉ = 14 sheets. Battens = ⌈424.3 × 0.24⌉ = 102 Rft. Props = ⌈39.42 × 1.5⌉ = 60 nos.",
        "Nails = 37.54 × 0.075 = 2.82 kg; binding wire 2.82 kg; shuttering oil = 37.54 × 0.065 = 2.44 L — all on the total area, not the effective area.",
        "Beam bottom planks = 8 m × 3.281 = 26.2 Rft. Centering plates: slab edge perimeter 2 × (4 + 3) × 3.281 = 45.9 ft ÷ 4 = 12 plates.",
      ],
      result:
        "37.54 m² of shuttering needs 14 plywood sheets, 102 Rft of battens, 60 props, 2.82 kg of nails and 2.44 L of shuttering oil. Raise the repetitions to 3 and the sheets drop to 5 — reuse is the biggest lever on shuttering cost.",
    },
    related: [
      { id: "plywood-estimator", title: "Plywood & Formwork Estimator", desc: "Plywood sheet quantity, area and volume for formwork and panelling — sheets to buy with wastage and reuse." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "calculators", title: "Construction Material Calculator", desc: "Concrete, bricks, steel, blocks and mortar in one hub — the material calculator for everyday site quantities." },
      { id: "staircase-calculator", title: "Concrete & Steel Staircase Tool", desc: "Concrete and steel for stairs — waist slab, steps, landing and reinforcement quantities." },
      { id: "isolated-footing", title: "Isolated Footing Design Calculator — IS 456", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
    ],
  },
  "is-codes-reference": {
    id: "is-codes-reference",
    intro:
      "The Indian Standards reference is a searchable library of the BIS codes behind the calculators on this site — not a design tool itself, but the place to check which code governs a decision and what it actually says. IS 456:2000 is the primary code for plain and reinforced concrete; IS 10262:2019 governs mix proportioning; IS 800:2007 governs structural steel; IS 1893 (Part 1):2016 and IS 13920:2016 govern earthquake-resistant design and ductile detailing; IS 3370 governs liquid-retaining structures; IS 1343:2012 governs prestressed concrete; IS 2386 (eight parts) governs aggregate testing; IS 1200 governs measurement — including the plaster deductions (none under 0.5 m², one face for 0.5–3 m², both faces above 3 m²). Every entry carries its publishing body, edition year where verified, and the calculators it applies to; only the Building Code of Pakistan PDF is hosted on the site, the rest are references to the BIS publications.",
    formulas: [
      {
        formula: "Ast,min = 0.85·b·d ÷ fy (IS 456 Cl. 26.5.1.1)",
        variables:
          "Minimum tension steel in a beam, so it does not fail suddenly in tension. Maximum is Ast,max = 0.04·b·D.",
      },
      {
        formula: "Mu,lim = 0.36·fck·(xu,max/d)·(1 − 0.416·xu,max/d)·b·d² (IS 456 Cl. G.2.2.1)",
        variables:
          "Limiting moment of resistance; xu,max/d = 0.53 (Fe250), 0.48 (Fe415), 0.46 (Fe500). Above Mu,lim the section must be doubly reinforced.",
      },
      {
        formula: "Ld = 0.87·fy·φ ÷ (4·τbd) (IS 456 Cl. 26.2.1)",
        variables:
          "Development length; τbd from IS 456 Table 26 (×1.6 for deformed bars) — 1.4 MPa for M25, so a 16 mm Fe500 bar needs about 777 mm.",
      },
      {
        formula: "Nominal cover (IS 456 Cl. 26.4): slab 20 mm, beam 25 mm, column 40 mm, footing 50 mm, concrete cast against soil 75 mm",
        variables:
          "Cover is measured from the concrete face to the outside of the stirrup or link. Too little lets moisture reach the steel; too much reduces the effective depth.",
      },
    ],
    tables: [
      {
        title: "The codes this site's calculators rest on",
        headers: ["Code", "Title", "Used by"],
        rows: [
          ["IS 456:2000", "Plain and Reinforced Concrete", "Mix design, beam, column, footing, house"],
          ["IS 10262:2019", "Concrete Mix Proportioning", "Mix design"],
          ["IS 800:2007", "General Construction in Steel", "Metal weight, house"],
          ["IS 1893 (Part 1):2016", "Earthquake Resistant Design", "House, mix design"],
          ["IS 13920:2016", "Ductile Design and Detailing of RC Structures", "House, mix design"],
          ["IS 3370", "Concrete Structures for Storage of Liquids", "Water tank, house"],
          ["IS 1343:2012", "Prestressed Concrete — Code of Practice", "Prestressed concrete"],
          ["IS 2386", "Methods of Test for Aggregates (8 parts)", "Aggregate tests, mix design"],
          ["IS 2502:1963", "Bending and Fixing of Bars", "BBS, reinforcement, beam, column"],
          ["IS 1200", "Method of Measurement", "House, BOQ"],
        ],
      },
      {
        title: "Cement grades (BIS)",
        headers: ["Code", "Grade"],
        rows: [
          ["IS 269:2015", "Ordinary Portland Cement, 33 grade"],
          ["IS 8112:2013", "Ordinary Portland Cement, 43 grade"],
          ["IS 12269:2013", "Ordinary Portland Cement, 53 grade — most common in RCC work"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — which code governs an RCC beam?",
      inputs:
        "Question: a 250 × 450 mm beam, M25, Fe500 — which code, which clauses, which calculator?",
      steps: [
        "Search the reference for '456': IS 456:2000, Plain and Reinforced Concrete (BIS, 2000) — the primary code for general structural use of plain and reinforced concrete.",
        "Flexure is Cl. G.2 (limit state), shear is Cl. 40, deflection is Cl. 23.2, cover is Cl. 26.4, development length is Cl. 26.2.1 — all inside IS 456:2000.",
        "The linked calculators are the Concrete Mix Design Calculator and the House Estimator; the beam itself is designed in the RCC Beam Design Tool (IS 456), which applies exactly these clauses.",
        "For the mix, cross-check IS 10262:2019 (proportioning) and IS 383:2016 (aggregates); for the bars, IS 1786:2008 (TMT) and IS 2502:1963 (bending and fixing).",
      ],
      result:
        "IS 456:2000 governs the beam; its flexure, shear, deflection, cover and development-length clauses are the ones the Beam Design tool applies. The reference page links each code to the calculators that use it, so you can move from the clause to the calculation in one click.",
    },
    related: [
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "aggregate-tests", title: "Aggregate Lab Tests Calculator", desc: "Impact, crushing and abrasion values and water absorption for aggregates to IS 2386 methods." },
      { id: "prestressed-concrete", title: "Pre-stressed Concrete Estimator", desc: "Tendon layout and prestress losses per IS 1343:2012." },
    ],
  },

  "isolated-footing": {
    id: "isolated-footing",
    intro:
      "An isolated footing spreads one column's load over enough soil that the bearing pressure stays under the safe bearing capacity — and then it must pass three structural checks of its own: punching (two-way) shear, one-way (beam) shear, and bending. The size comes from the soil (area = 1.1·P/SBC, the 1.1 allowing about 10% for the footing's own weight); the depth is usually governed by punching shear, checked on a perimeter at d/2 from the column face (IS 456 Cl. 31.6); the steel comes from bending, Mu = qu·B·a²/2 per direction, with a 0.12% minimum (IS 456 Cl. 26.5.2.1) and spacing capped at 3d or 300 mm. The trapezoidal (sloped) portion uses the exact frustum volume h/3·(A1 + A2 + √(A1·A2)). Bearing passes only if the area is enough AND the peak pressure with moments stays under SBC — the old check ignored the peak pressure. When isolated footings would cover more than about half the footprint, switch to a raft.",
    formulas: [
      {
        formula: "A_req = 1.1·Pu ÷ SBC;   qu = Pu ÷ A;   q_max = qu + M·1.5/Zx + M·1.5/Zy",
        variables:
          "Pu = factored column load; SBC = safe bearing capacity; Z = section modulus (B·L²/6). Bearing passes only when A ≥ A_req AND q_max ≤ SBC.",
        note: "Auto-size mode solves L = B = √(1.1·P/SBC), then grows D in 50 mm steps until both shear checks pass.",
      },
      {
        formula: "Punching: τv = Vpunch ÷ (b0·d) ≤ ks·0.25·√fck;   b0 = 2[(a+d) + (b+d)];   ks = min(1, 0.5 + βc)",
        variables:
          "Critical perimeter at d/2 from the column face (IS 456 Cl. 31.6); βc = short/long side of the column; Vpunch = Pu − qu·(a+d)(b+d).",
        note: "Punching usually governs footing depth. At the defaults it runs at 46% utilisation.",
      },
      {
        formula: "One-way: τv = Vu ÷ (B·d) ≤ k·τc;   k = 1 (d ≤ 300 mm), falling to 0.7",
        variables:
          "Critical section at distance d from the column face; τc from IS 456 Table 19 at the ACTUAL provided steel ratio — the first pass at pt ≈ 0.5% overstated the allowance, so the verdict is re-checked after flexure.",
      },
      {
        formula: "Mu = qu·B·a² ÷ 2;   Ast,min = 0.12% of total area;   spacing ≤ min(3d, 300 mm)",
        variables:
          "a = projection from the column face; Ast by the beam LSM formula. Y-direction minimum steel uses the footing LENGTH, not the width. Bars: N = ⌈(B − 2·cover)/spacing⌉ + 1.",
        note: "Sloped volume: V = L·B·D1 + (h/3)(A1 + A2 + √(A1·A2)). Development length Ld = 0.87·fy·φ/(4·τbd).",
      },
    ],
    tables: [
      {
        title: "Footing types in the tool",
        headers: ["Type", "Volume"],
        rows: [
          ["Rectangular", "L × B × D"],
          ["Sloped (trapezoidal)", "L·B·D1 + (h/3)(A1 + A2 + √(A1·A2))"],
          ["Stepped", "L·B·D1 + top L × top W × (D − D1)"],
        ],
      },
      {
        title: "Design limits (IS 456)",
        headers: ["Check", "Limit"],
        rows: [
          ["Punching shear", "τv ≤ ks·0.25√fck (Cl. 31.6)"],
          ["One-way shear", "τv ≤ k·τc (Cl. 34.2.4, Table 19)"],
          ["Minimum steel", "0.12% of total area (Cl. 26.5.2.1, Fe415)"],
          ["Bar spacing", "≤ min(3d, 300 mm)"],
          ["Cover", "50 mm (75 mm against soil)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 2.2 × 2.2 m sloped footing (the calculator's defaults)",
      inputs:
        "Footing 2.2 × 2.2 × 0.5 m sloped (0.2 m base, 0.6 × 0.6 m top), column 0.4 × 0.4 m, working load 666.67 kN, safety factor 1.5, SBC 250 kN/m², M25, Fe500, cover 50 mm, Ø12 bars, mix 1:1.5:3, excavation 1.5 m deep with 0.3 m working space.",
      steps: [
        "Pu = 666.67 × 1.5 = 1,000 kN. Required area = 1.1 × 1,000 ÷ 250 = 4.40 m² vs 4.84 m² provided; qu = 1,000 ÷ 4.84 = 206.6 kN/m² — bearing passes.",
        "Effective depth d = 500 − 50 − 6 = 444 mm. Punching: b0 = 2 × [(400 + 444) + (400 + 444)] = 3,376 mm; Vpunch = 1,000 − 206.6 × 0.844 × 0.844 = 852.8 kN; τv = 0.57 MPa ≤ 1.25 MPa (46%) — PASS.",
        "One-way shear: Vu = 207.3 kN; τv = 0.21 MPa ≤ k·τc = 0.25 MPa at the actual provided steel ratio — PASS.",
        "Flexure: Mu = 206.6 × 2.2 × 0.9² ÷ 2 = 184.1 kNm per direction. Ast required = 1,320 mm² — the 0.12% minimum governs. Provide Ø12 @ 180 mm c/c: 13 bars each way, 1,470 mm², cut length 2.30 m.",
        "Concrete (sloped) = 1.62 m³; steel 53.1 kg; excavation = (2.2 + 0.6) × (2.2 + 0.6) × 1.5 = 11.76 m³. Development length Ld = 583 mm.",
      ],
      result:
        "2.2 × 2.2 × 0.5 m sloped footing with Ø12 @ 180 mm c/c both ways passes bearing, punching (46%) and one-way shear, with 1.62 m³ of concrete, 53.1 kg of steel and 11.76 m³ of excavation. The worked vector in the engine notes the LSM steel for this moment is about 1,470 mm² with Fe500 — the older 1,830 mm² figure came from a lever-arm approximation with Fe415.",
    },
    related: [
      { id: "raft-foundation", title: "Raft Foundation Design Calculator", desc: "Raft thickness, reinforcement and settlement per IS 2950 — for when isolated footings cover half the footprint." },
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Earth pressure, stability checks and material quantities for retaining walls on the same soil." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation and backfill volumes, swell and shrinkage, truck trips and trench backfill." },
    ],
  },

  "master-rcc": {
    id: "master-rcc",
    intro:
      "The Master RCC Estimator is the quantity takeoff for reinforced concrete: slabs, beams, columns, round columns, staircases and footings, each with concrete volume, shuttering area, steel by the thumb percentage or by your own bar schedule, and a bar bending schedule. The thumb steel percentages are planning rules — slab 1.0% (≈ 78 kg/m³), beam 1.5% (≈ 118 kg/m³), column 2.0% (≈ 157 kg/m³), staircase 1.0%, footing 0.8% (≈ 63 kg/m³) of wet volume — and the tool says so wherever a design exists instead. Concrete follows the house rules (dry = wet × 1.54, cement bag 0.0347 m³), mixes are the nominal IS 456 Table 9 ratios up to M20, stirrups use the IS 2502 detailed length, cranked slab bars add 0.42 × rise − 2φ per crank on alternate bars only, and shuttering follows IS 1200 measurement (slab soffit plus edges). For M25 and above the tool links to the design-mix calculator instead of a nominal mix.",
    formulas: [
      {
        formula: "V_dry = V_wet × 1.54;   cement bags = (V_dry × cement parts ÷ total parts) ÷ 0.0347",
        variables:
          "V_wet is the element volume (slab L×W×t, beam L×b×D, column b×D×h, round column πD²/4×h). 1 m³ = 35.31 cft for sand and aggregate.",
      },
      {
        formula: "Steel (thumb) = V_wet × thumb% × 7,850 kg/m³",
        variables:
          "Thumb %: slab 1.0, beam 1.5, column 2.0, staircase 1.0, footing 0.8. So a slab carries about 78.5 kg of steel per m³ of concrete.",
        note: "By bar schedule instead: steel = Σ (bars × length × d²/162.28). The thumb rule is a budget figure, never a design.",
      },
      {
        formula: "Stirrup L = 2(A+B) + 2×10φ − (3×2φ + 2×3φ) = 2(A+B) + 8φ (IS 2502 detailed)",
        variables:
          "A, B = inner dimensions (section − 2×cover − φ). The field rule 2(A+B) + 24φ reads about 10% high and is shown only as a labelled approximation.",
      },
      {
        formula: "Cranked bar: cut = span − 2×cover + 0.42×rise − 2φ (alternate bars only)",
        variables:
          "The 0.42 × rise is the IS 2502 crank allowance (0.42 × the bent-up rise), less one bar diameter per 45° bend. Slab bars: N = ⌈(span − 2×cover)/spacing⌉ + 1.",
        note: "Shuttering: slab = soffit L×W + edges 2(L+W)×t; beam = (2D + b)×L; column = 2(b+D)×h; footing = sides + sloped faces.",
      },
    ],
    tables: [
      {
        title: "Thumb steel percentages (planning only)",
        headers: ["Element", "Steel % of wet volume", "kg per m³"],
        rows: [
          ["Slab", "1.0%", "78.5"],
          ["Beam", "1.5%", "117.8"],
          ["Column", "2.0%", "157.0"],
          ["Staircase", "1.0%", "78.5"],
          ["Footing", "0.8%", "62.8"],
        ],
      },
      {
        title: "Nominal mixes (IS 456 Table 9 — up to M20 only)",
        headers: ["Grade", "Ratio", "w/c"],
        rows: [
          ["M10", "1 : 3 : 6", "0.60"],
          ["M15", "1 : 2 : 4", "0.50"],
          ["M20", "1 : 1.5 : 3", "0.50"],
          ["M25+", "Design mix (IS 10262)", "By exposure"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one slab, beam, column and footing (the tool's defaults)",
      inputs:
        "Slab 4 × 3 m, 150 mm thick; beam 4 m, 230 × 450 mm; column 300 × 300 mm, 3 m high; footing 1.5 × 1.5 × 0.3 m base with 0.6 × 0.6 × 0.3 m top. Thumb steel mode throughout.",
      steps: [
        "Slab: wet volume = 4 × 3 × 0.15 = 1.80 m³; shuttering = 12 + 2 × 7 × 0.15 = 14.10 m²; steel = 1.80 × 1.0% × 7,850 = 141.3 kg.",
        "Beam: wet volume = 4 × 0.23 × 0.45 = 0.414 m³; shuttering = 4.52 m²; steel = 0.414 × 1.5% × 7,850 = 48.7 kg.",
        "Column: wet volume = 0.3 × 0.3 × 3 = 0.27 m³; shuttering = 3.60 m²; steel = 0.27 × 2.0% × 7,850 = 42.4 kg.",
        "Footing: wet volume = 1.026 m³ (base + top); shuttering = 4.07 m²; steel = 1.026 × 0.8% × 7,850 = 64.4 kg.",
      ],
      result:
        "Slab 1.80 m³ / 141.3 kg, beam 0.414 m³ / 48.7 kg, column 0.27 m³ / 42.4 kg, footing 1.026 m³ / 64.4 kg — 3.51 m³ of concrete and 296.8 kg of steel by the thumb percentages. Replace the thumb steel with the bar schedule (BBS) before ordering: the percentages are for budgeting, not for the bar bender.",
    },
    related: [
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths, bar weights and laps for beams, columns, slabs and stirrups." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
      { id: "reinforcement", title: "Reinforcement Detailing Visualizer", desc: "Interactive 2D rebar detailing for beams, columns and slabs with IS 456 checks." },
    ],
  },

  "morth-irc-specs": {
    id: "morth-irc-specs",
    intro:
      "MoRTH and IRC are the two bodies behind Indian road work: the Ministry of Road Transport & Highways publishes the Specifications for Road and Bridge Works (5th Revision, 2013) — the construction specification for earthwork, granular and bituminous layers and bridges — and the Indian Roads Congress publishes the design codes, above all IRC:37 for flexible pavements, IRC:58 for rigid pavements, IRC:6 for bridge loads and IRC:112 for concrete road bridges. This page shows only the nine MoRTH/IRC entries (never the IS codes): the granular clauses (Cl. 401 GSB, Cl. 406 WMM), the bituminous gradation tables (500-10 DBM, 500-17 bituminous concrete, Cl. 515 SMA) with their minimum bitumen contents, and the geometric standard IRC:66 for vertical curves. Flexible pavement thickness comes from subgrade CBR and traffic in millions of standard axles (MSA) under IRC:37-2018; rigid pavement is designed by cumulative fatigue damage (CFD ≤ 1.0) under IRC:58-2015.",
    formulas: [
      {
        formula: "Mr (Heukelom) = 17.6 × CBR^0.64 (MPa)",
        variables:
          "Resilient modulus of the subgrade from its CBR — the correlation IRC:37-era practice uses for CBR below about 20%. AASHTO's is Mr ≈ 10 × CBR MPa.",
        note: "IRC:37-2018 sizes the crust (GSB, WMM, DBM, BC) from this modulus and the design traffic in MSA.",
      },
      {
        formula: "Minimum bitumen content (MoRTH): DBM 4.5%, SMA 5.8%, bituminous concrete 5.0%",
        variables:
          "By mass of the total mix. Gradations: DBM Grades 1–2 Table 500-10, bituminous concrete Grades 1–2 Table 500-17, SMA Clause 515, GSB Grade I Table 400-1.",
      },
      {
        formula: "Sag-curve length L ≥ A·V² ÷ 46.5 (IRC:66 comfort check)",
        variables:
          "L = curve length (m); A = algebraic grade difference (%); V = design speed (km/h). Cited by the gradient engine for the sag-curve comfort check.",
        note: "Granular layers: GSB MoRTH Cl. 401, WMM Cl. 406 — the gradation envelopes the sieve tool checks against.",
      },
    ],
    tables: [
      {
        title: "The nine MoRTH/IRC specifications on this page",
        headers: ["Code", "Title", "What it governs"],
        rows: [
          ["MoRTH Specs (5th Rev., 2013)", "Specifications for Road & Bridge Works", "Highway construction: earthwork, pavements, bridges"],
          ["IRC:37-2018", "Flexible Pavement Design", "Crust thickness from CBR and traffic (MSA)"],
          ["IRC:58-2015", "Rigid Pavement Design", "Plain jointed concrete pavements, CFD ≤ 1.0"],
          ["IRC:6-2017", "Road Bridges — Loads", "Loads, forces and load combinations for bridges"],
          ["IRC:112-2020", "Concrete Road Bridges", "Limit state design of bridge super/substructures"],
          ["IRC:SP:20-2002", "Rural Roads Manual", "Planning, design, construction of rural roads"],
          ["IRC:66", "Geometric Design — Vertical Curves", "Vertical curves and gradients"],
          ["MoRTH Cl. 401 / 406", "GSB & Wet Mix Macadam", "Granular sub-base and WMM gradations"],
          ["MoRTH Tables 500-10 / 500-17 · Cl. 515", "Bituminous Mix Gradations", "DBM, BC and SMA envelopes and bitumen content"],
        ],
      },
      {
        title: "IRC:37 vs IRC:58 — which pavement?",
        headers: ["", "IRC:37-2018", "IRC:58-2015"],
        rows: [
          ["Pavement", "Flexible (bituminous)", "Rigid (concrete)"],
          ["Design input", "Subgrade CBR + traffic (MSA)", "Traffic + concrete strength, CFD ≤ 1.0"],
          ["Layers", "GSB, WMM, DBM, BC", "DLC, PQC slab with joints"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — which code designs a flexible pavement?",
      inputs:
        "Question: a rural road on a subgrade with CBR 8% — which specification designs the crust, and which clauses supply the layers?",
      steps: [
        "Open the MoRTH/IRC page: IRC:37-2018, Guidelines for the Design of Flexible Pavements, is the design code — it sets the crust from subgrade CBR and traffic in MSA.",
        "The layers come from the MoRTH Specifications (5th Rev., 2013): granular sub-base Cl. 401, wet mix macadam Cl. 406, DBM Table 500-10 (minimum bitumen 4.5%), bituminous concrete Table 500-17 (minimum bitumen 5.0%).",
        "The CBR itself is measured by IS 2720 Part 16 (or ASTM D1883) and converted to resilient modulus — Heukelom Mr = 17.6 × 8^0.64 ≈ 66 MPa for this subgrade.",
        "Run the numbers in the CBR calculator, the sieve tool (which checks gradations against the Cl. 401/406 envelopes) and the pavement-mix tool (which checks the bituminous gradations and bitumen contents).",
      ],
      result:
        "IRC:37-2018 designs the crust; MoRTH Cl. 401/406 and Tables 500-10/500-17 supply the layer specifications. The three linked calculators (CBR, sieve, pavement mix) each check one piece of that chain — none of them designs the pavement on its own.",
    },
    related: [
      { id: "road-pavement", title: "Road Pavement Estimator", desc: "Pavement layer quantities and thicknesses from CBR and traffic, per IRC:37 / MoRTH practice." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Prismoidal and average-end-area volumes, swell and shrinkage, truck trips and trench backfill." },
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve, with origin correction and resilient modulus." },
      { id: "aggregate-tests", title: "Aggregate Lab Tests Calculator", desc: "Impact, crushing and abrasion values and water absorption for aggregates to IS 2386 methods." },
      { id: "pavement-mix", title: "Pavement Mix Calculator", desc: "Bituminous mix quantities and gradation checks against MoRTH Tables 500-10 / 500-17." },
    ],
  },

  "pakistan-building-codes": {
    id: "pakistan-building-codes",
    intro:
      "Building in Pakistan is governed at two levels: the national Building Code of Pakistan (BCP-2021, formulated by the Pakistan Engineering Council), which sets the seismic provisions and general requirements for structural, fire and life safety, and the local bylaws of the authority that approves your drawings — the Lahore Development Authority's Building & Zoning Regulations for Lahore, the Defence Housing Authority's Building Control Bye-Laws inside DHA schemes, and the National Highway Authority's specifications where the work touches a highway. The PEC also publishes the Standard Bidding Documents used for procurement and BOQ formulation. The BCP-2021 PDF is the one standard actually hosted on this site; the other entries are references to the issuing authority's publication. The house estimator on this site already assumes the BCP-2021 defaults — NBC Pakistan 2021 design standard, RCC framed structure, seismic Zone 2B — but the local bylaws (coverage, setbacks, height limits, approval procedure) vary by authority and must be checked against the authority for your plot.",
    formulas: [
      {
        formula: "A_req = 1.1·Pu ÷ SBC (footing area from the load and the soil)",
        variables:
          "The 1.1 allows about 10% for the footing's own weight. SBC comes from the geotechnical investigation for your plot — never assume it.",
        note: "Bearing is only the first check: punching shear, one-way shear and bending (IS 456 Cl. 31.6 / 34) govern the depth and steel — see the isolated-footing guide.",
      },
      {
        formula: "Design standard (house estimator defaults): BCP-2021 · RCC frame · seismic Zone 2B",
        variables:
          "Zone 2B is the seismic zone the estimator applies to its steel multiplier (×1.05). Confirm the zone for your district from BCP-2021 — it is not the same everywhere in Pakistan.",
      },
      {
        formula: "Local bylaws govern: plot coverage, setbacks, height limits, approval procedure",
        variables:
          "These are set by LDA (Lahore), DHA (inside DHA schemes) or your local development authority — they are bylaws, not national code, and they change by scheme.",
      },
    ],
    tables: [
      {
        title: "Pakistan codes and bylaws on this page",
        headers: ["Code", "Title", "Issued by"],
        rows: [
          ["BCP-2021", "Building Code of Pakistan", "Pakistan Engineering Council (PEC) — PDF hosted on this site"],
          ["NHA Specs", "NHA General Specifications", "National Highway Authority — road and bridge works"],
          ["PEC Documents", "Standard Bidding Documents", "Pakistan Engineering Council — procurement and BOQs"],
          ["LDA Regulations", "LDA Building & Zoning Regulations", "Lahore Development Authority — Lahore only"],
          ["DHA Bye-Laws", "DHA Building Control Bye-Laws", "Defence Housing Authority — inside DHA schemes"],
        ],
      },
      {
        title: "National code vs local bylaw",
        headers: ["", "BCP-2021", "LDA / DHA bylaws"],
        rows: [
          ["Scope", "Whole of Pakistan", "One city or housing scheme"],
          ["Covers", "Seismic, structural, fire, life safety", "Coverage, setbacks, height, approvals"],
          ["Who enforces", "PEC / building control authorities", "LDA / DHA building control"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — what governs a house in Lahore?",
      inputs:
        "Question: a double-storey house on a 5 marla plot in Lahore — which documents apply, and in what order?",
      steps: [
        "Start with BCP-2021 (PEC, 2021) on the Pakistan codes page — the PDF is hosted here. It sets the seismic provisions (Zone 2B for the estimator's defaults) and the general structural, fire and life-safety requirements.",
        "Then read the LDA Building & Zoning Regulations: they set the plot coverage, setbacks, height limit and the approval procedure for Lahore — BCP-2021 does not.",
        "If the plot is inside a DHA scheme, the DHA Building Control Bye-Laws apply instead of (or in addition to) the LDA regulations — check the scheme's own rules.",
        "Cost the house with the House Estimator (which already uses the BCP-2021 / Zone 2B defaults) and the Pakistan cost calculator for the city rate; design the footings from the plot's SBC, not from an assumed value.",
      ],
      result:
        "BCP-2021 governs safety and structure; LDA (or DHA) bylaws govern what you may build on the plot and how it is approved. Both must be satisfied — the national code never overrides a stricter local bylaw on coverage or setbacks.",
    },
    related: [
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier — grey, standard, premium or luxury." },
      { id: "staircase-calculator", title: "Concrete & Steel Staircase Tool", desc: "Concrete and steel for stairs — waist slab, steps, landing and reinforcement quantities." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "is-codes-reference", title: "Indian Standards Codes Reference", desc: "IS 456, IS 800, IS 10262 and more, with clauses and scope, searchable by code." },
    ],
  },
  "pile-foundation": {
    id: "pile-foundation",
    intro:
      "A pile carries load two ways at once: end bearing on the soil at its tip (Qb) and skin friction along its shaft (Qs), and the safe capacity is their sum divided by a factor of safety (2.5 default, IS 2911). In sand, end bearing uses the Berezantsev bearing factor Nq by friction angle and skin friction uses β = K·tan δ (δ ≈ φ − 5°; K ≈ 1.0 bored, 1.5 driven — bored piles lose shaft friction to borehole softening, so the default β = 0.35 for a φ = 32° layer is deliberately conservative against the theoretical 0.51). In clay, skin friction uses α·cu, with α falling as the undrained strength rises (0.9 at cu ≤ 25 kPa, 0.5 to 100, 0.4 to 175, 0.3 above). Piles in a group are less efficient than one pile alone — the Converse–Labarre efficiency η — and the group can also fail as a block; the smaller of the two governs. Spacing must be at least 2.5 diameters (IS 2911).",
    formulas: [
      {
        formula: "Qu = Qb + Qs;   Qall = Qu ÷ FoS;   Qb = Ab·σ′v,tip·Nq (sand) or Ab·9·cu (clay)",
        variables:
          "Ab = pile tip area (πD²/4); σ′v,tip = effective vertical stress at the tip; Nq from the Berezantsev table by φ (26 at 32°, 35 at 35°, 60 at 40°). FoS default 2.5.",
      },
      {
        formula: "Qs = Σ (perimeter × layer thickness × fs);   fs = β·σ′v,mid (sand) or α·cu (clay)",
        variables:
          "σ′v,mid = effective stress at the layer midpoint. β = K·tan(φ − 5°); α = 0.9 / 0.5 / 0.4 / 0.3 by cu band (IS 2911).",
      },
      {
        formula: "Group: η = 1 − (θ/90)·[(n−1)m + (m−1)n] ÷ (m·n);   θ = arctan(D/s) in degrees",
        variables:
          "m, n = rows and columns; s = spacing; D = diameter. Group ultimate = η·m·n·Qu. Block capacity is checked separately from the block's perimeter and base — the smaller of group and block governs.",
        note: "Required piles = ⌈total load ÷ Qall⌉ is only the single-pile check. The group check can demand more — see the worked example.",
      },
      {
        formula: "Settlement ≈ elastic shortening + soil settlement;   Ec = 5,000·√fck",
        variables:
          "Elastic shortening = (load per pile × L) ÷ (Ap·Ec). The engine's soil term is 0.01·D·(Qall/Qu)·2 — an indicative estimate, not a consolidation analysis.",
      },
    ],
    tables: [
      {
        title: "Nq by friction angle (IS 2911 / Berezantsev)",
        headers: ["φ", "20°", "25°", "30°", "32°", "35°", "40°", "45°"],
        rows: [["Nq", "8", "12", "20", "26", "35", "60", "100"]],
      },
      {
        title: "α for clay skin friction (by undrained strength cu)",
        headers: ["cu (kPa)", "≤ 25", "25–100", "100–175", "> 175"],
        rows: [["α", "0.9", "0.5", "0.4", "0.3"]],
      },
    ],
    workedExample: {
      title: "Worked example — bored pile in sand (the calculator's defaults)",
      inputs:
        "Bored pile Ø0.5 m × 15 m, one sand layer γ 18 kN/m³, φ 32°, β 0.35, FoS 2.5, total load 5,000 kN, group 2 × 3 @ 1.5 m spacing, pile cap 3.5 × 2.0 × 0.8 m, M25.",
      steps: [
        "Tip area Ab = π × 0.5² ÷ 4 = 0.196 m²; perimeter = 1.57 m. Nq at φ 32° = 26.",
        "End bearing Qb = 1,378 kN; skin friction Qs = 1,113 kN; ultimate Qu = 2,492 kN; safe Qall = 2,492 ÷ 2.5 = 997 kN per pile.",
        "Single-pile check: required piles = ⌈5,000 ÷ 997⌉ = 6 — exactly the 2 × 3 group entered.",
        "Group check: η = 0.761 (Converse–Labarre); group allowable = 4,551 kN — LESS than the 5,000 kN load. The group governs: 6 piles are not enough as a group. Add piles or enlarge the diameter and re-check.",
        "Spacing 1.5 m = 3.0D ≥ 2.5D minimum — passes. Settlement ≈ 6.5 mm. Concrete: piles 17.67 m³ + cap 5.60 m³ = 23.27 m³; steel 1,726 kg (spiral: one turn every 150 mm).",
      ],
      result:
        "One Ø0.5 m bored pile safely carries 997 kN, but the 2 × 3 group only carries 4,551 kN against a 5,000 kN load — the group efficiency, not the single pile, governs this design. That is the check most hand calculations skip.",
    },
    related: [
      { id: "raft-foundation", title: "Raft Foundation Design Calculator", desc: "Raft thickness, reinforcement and settlement per IS 2950 — the alternative when piles are not needed." },
      { id: "isolated-footing", title: "Isolated Footing Design Calculator — IS 456", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, Atterberg limits, Proctor compaction and CBR — the soil parameters piles depend on." },
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
    ],
  },

  "plywood-estimator": {
    id: "plywood-estimator",
    intro:
      "Plywood for formwork is a sheet-count problem: the contact area of the element, less openings, plus wastage, divided by the area of one sheet — then divided again by the reuse factor, because the same sheets serve several pours. The contact area depends on the element: a slab is L × W, a wall is L × W × faces (one or two), a beam is (2 × depth + width) × length (two sides plus soffit), a column is 2 × (side 1 + side 2) × height. An opening in a two-face wall is deducted once per face — deducting it once understates the deduction by half. Sheet sizes are the standard 2.44 × 1.22 m (8 × 4 ft, 2.9768 m²) and 1.83 × 0.91 m (6 × 3 ft). For a slab the tool also works out the supporting beams: secondary beams at your spacing across the width, primary beams at theirs across the length. Reuse is capped at 8 cycles — shuttering plywood does not survive more.",
    formulas: [
      {
        formula: "Sheets to buy = ⌈(net area × (1 + wastage%)) ÷ sheet area ÷ reuse⌉",
        variables:
          "Net area = contact area − openings (× faces for a 2-face wall). Wastage 0–30%; reuse 1–8 (formwork only — 'general' panelling is always bought once).",
        note: "Sheet volume (one sheet) = sheet area × thickness; total order volume = sheets to buy × one-sheet volume.",
      },
      {
        formula: "Slab: A = L × W;   Wall: A = L × W × faces;   Beam: A = (2·depth + width) × L;   Column: A = 2 × (side1 + side2) × height",
        variables:
          "All areas in m². Openings are deducted from the contact area before wastage is applied.",
      },
      {
        formula: "Secondary beams = (L ÷ spacing + 1) × W;   Primary beams = (W ÷ spacing + 1) × L",
        variables:
          "Slab formwork only. Defaults: secondary spacing 0.4 m, primary spacing 1.2 m. Lengths are in running metres of beam.",
      },
    ],
    tables: [
      {
        title: "Standard plywood sheets",
        headers: ["Size", "Area", "Common use"],
        rows: [
          ["2.44 × 1.22 m (8 × 4 ft)", "2.9768 m²", "Standard shuttering and panelling sheet"],
          ["1.83 × 0.91 m (6 × 3 ft)", "1.6653 m²", "Smaller panels, repairs, tight sites"],
        ],
      },
      {
        title: "Grades in the tool",
        headers: ["Grade", "Use"],
        rows: [
          ["Commercial", "General panelling and furniture"],
          ["BWR (boiling-water resistant)", "Moisture-prone panelling"],
          ["Marine", "Wet areas, boats — fully waterproof bond"],
          ["Shuttering", "Formwork — film-faced, reused across pours"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — shuttering plywood for a 4 × 3 m slab",
      inputs:
        "Slab 4 × 3 m, sheet 2.44 × 1.22 m, 18 mm shuttering grade, 5% wastage, reuse factor 3, secondary beams @ 0.4 m, primary beams @ 1.2 m.",
      steps: [
        "Contact area = 4 × 3 = 12.00 m²; no openings. Gross area = 12 × 1.05 = 12.60 m².",
        "One sheet = 2.44 × 1.22 = 2.9768 m². Exact sheets = 12.60 ÷ 2.9768 = 4.23 sheets.",
        "Sheets to buy = ⌈4.23 ÷ 3⌉ = 2 sheets — the same stock serves three pours. One sheet's volume = 2.9768 × 0.018 = 0.0536 m³; order volume = 2 × 0.0536 = 0.107 m³.",
        "Secondary beams = (4 ÷ 0.4 + 1) × 3 = 33 m. Primary beams = (3 ÷ 1.2 + 1) × 4 = 14 m.",
      ],
      result:
        "Buy 2 sheets of 18 mm shuttering plywood (4.23 sheets needed across three pours), with 33 m of secondary beams and 14 m of primary beams. At reuse 1 the same slab needs 5 sheets — reuse is the whole saving.",
    },
    related: [
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "staircase-calculator", title: "Concrete & Steel Staircase Tool", desc: "Concrete and steel for stairs — waist slab, steps, landing and reinforcement quantities." },
      { id: "calculators", title: "Construction Material Calculator", desc: "Concrete, bricks, steel, blocks and mortar in one hub — the material calculator for everyday site quantities." },
      { id: "precast-wall", title: "Precast Compound Wall Estimator", desc: "Precast wall panels, posts and concrete for boundary walls — panel counts, post spacing and footing quantities." },
    ],
  },

  "precast-wall": {
    id: "precast-wall",
    intro:
      "A precast compound wall is counted in spans, not metres: the effective length (wall length less gates and returns) divided by the panel width gives the spans; each span takes one post more than an open run (spans + 1 posts) or exactly one per span on a closed rectangle; each span stacks wall height ÷ panel height panels. Panels and posts are ordered with wastage, and the footing concrete follows the house rules (dry = wet × 1.54, cement bag 0.0347 m³) on the 1:2:4 mix. Three footing options are priced: an isolated pad under each post, a continuous strip footing along the wall, or a PCC bed counted as a blinding allowance at the pad volume. The rates in the tool (post, panel, concrete, labour, transport) are indicative November 2026 defaults, unverified — edit them to your supplier's prices before quoting. Above 3 m the tool warns: wind load and structural design govern, and quantities alone are not enough.",
    formulas: [
      {
        formula: "Spans = ⌈effective length ÷ panel width⌉;   Posts = spans + 1 (open) or spans (closed)",
        variables:
          "Effective length = wall length − gate deduction. Panels per span = ⌈wall height ÷ panel height⌉; total panels = spans × panels per span.",
        note: "Order quantities add wastage: order = ⌈exact × (1 + wastage%)⌉ — posts and panels are both costed at the to-order quantity.",
      },
      {
        formula: "Footing wet = posts × pad L × pad W × pad D (isolated) or effective length × strip width × depth (strip)",
        variables:
          "Dry footing volume = wet × 1.54; cement bags = ⌈(dry × cement parts ÷ total parts) ÷ 0.0347⌉; sand and aggregate by the mix parts.",
      },
      {
        formula: "Panel concrete = panels × panel width × panel height × thickness",
        variables:
          "Volume of concrete cast into the panels themselves — separate from the footing concrete. Covered length = spans × panel width; overrun = covered − effective length (the last panel is cut).",
      },
    ],
    tables: [
      {
        title: "Footing options",
        headers: ["Type", "Concrete volume"],
        rows: [
          ["Isolated pads", "One pad per post (pad L × W × D)"],
          ["Strip footing", "Effective length × strip width × depth"],
          ["PCC bed", "Same pad volume, counted as a blinding allowance"],
        ],
      },
      {
        title: "Typical panel geometry (tool defaults are inputs, not standards)",
        headers: ["Item", "Worked example"],
        rows: [
          ["Panel width (= post spacing)", "3.0 m"],
          ["Panel height", "0.3 m"],
          ["Panel thickness", "50 mm"],
          ["Pad footing", "0.45 × 0.45 × 0.6 m"],
          ["Wall height warning", "Above 3 m — check wind load and design"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 30 m open compound wall, 2.4 m high",
      inputs:
        "Wall 30 m, height 2.4 m, open layout, no gates, panel 3.0 m wide × 0.3 m high × 50 mm thick, isolated pads 0.45 × 0.45 × 0.6 m, mix 1:2:4, 5% wastage.",
      steps: [
        "Effective length = 30 m. Spans = ⌈30 ÷ 3⌉ = 10; posts = 10 + 1 = 11 (open run).",
        "Panels per span = ⌈2.4 ÷ 0.3⌉ = 8; total panels = 10 × 8 = 80. To order: panels ⌈80 × 1.05⌉ = 84, posts ⌈11 × 1.05⌉ = 12.",
        "Footing wet = 11 × 0.45 × 0.45 × 0.6 = 1.34 m³; dry = 1.34 × 1.54 = 2.06 m³.",
        "Cement = 2.06 × 1⁄7 = 0.294 m³ ÷ 0.0347 = 8.47 → 9 bags. Sand = 2.06 × 2⁄7 = 0.59 m³; aggregate = 2.06 × 4⁄7 = 1.18 m³.",
        "Panel concrete = 80 × 3 × 0.3 × 0.05 = 3.60 m³. Covered length = 10 × 3 = 30 m — no overrun on this wall.",
      ],
      result:
        "Order 84 panels and 12 posts for the 30 m wall, with 9 bags of cement, 0.59 m³ of sand and 1.18 m³ of aggregate for the pad footings, plus 3.60 m³ of concrete in the panels themselves. No price is shown — the tool's rates are indicative defaults, so enter your supplier's post and panel prices before costing.",
    },
    related: [
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall in PKR, INR or AED." },
      { id: "calculators", title: "Construction Material Calculator", desc: "Concrete, bricks, steel, blocks and mortar in one hub — the material calculator for everyday site quantities." },
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
    ],
  },

  "prestressed-concrete": {
    id: "prestressed-concrete",
    intro:
      "Prestressing puts the concrete into compression before the loads arrive, so a beam that would crack in tension under service loads stays uncracked — the reason prestressed beams span further and shallower than ordinary RCC. The design is IS 1343:2012: a tendon is jacked to an initial stress (at most 0.8·fpu), then loses stress in six ways — friction along the duct, anchorage slip, elastic shortening, creep, shrinkage and relaxation — typically 15–25% in total, leaving the effective prestress. Service stresses are then checked at transfer (compression ≤ 0.5·fck) and in service (compression ≤ 0.33·fck, tension 0 for Class 1, ≤ 3 N/mm² for Class 2). The section properties come from a rectangular or T-section builder (A, I, Z), with Ec = 5,000·√fck. A total loss outside 15–25% is a warning, not a pass: too little loss usually means a modelling error, too much means the tendon is undersized.",
    formulas: [
      {
        formula: "σ0 = P0 ÷ Ap ≤ 0.8·fpu (jacking, IS 1343 Cl. 19.5);   σ_final ≤ 0.7·fpu (service guidance)",
        variables:
          "P0 = jacking force; Ap = tendon area; fpu = characteristic tendon strength (1,860 MPa default for strand).",
      },
      {
        formula: "Px = P0·e^(−(μ·α + k·x)) (friction loss, IS 1343)",
        variables:
          "μ = friction coefficient (0.3 default); α = total change of angle of a parabolic tendon = 8e/L; k = wobble coefficient (0.0015/m default); x = distance from the jack.",
        note: "Anchorage slip loss = 2·slip·Es ÷ slip-affected length; it is highest near the anchorage (67.5 MPa at the jack in the worked example) and fades with distance.",
      },
      {
        formula: "Losses: elastic = m·fc (pre) or 0.5·m·fc (post); creep = φ·m·fc; shrinkage = εsh·Es; relaxation = % × σ0",
        variables:
          "m = Es/Ec modular ratio; fc = concrete stress at tendon level; φ = creep coefficient (1.6 default); εsh = 0.0003 pre-tension, 0.0002 post-tension (IS 1343 Cl. 19.4).",
        note: "Total loss ÷ σ0 is typically 15–25%. The engine's worked vector: 22.3% pre-tension, 21.8% post-tension on its reference section.",
      },
      {
        formula: "Stress at a fibre = P/A ± P·e·y/I ∓ M/Z",
        variables:
          "Checked at transfer (Pi after immediate losses, transfer moment) and in service (Pe after all losses, service moment). Limits: compression 0.5·fck at transfer, 0.33·fck in service (IS 1343 Cl. 22.7); tension 0 (Class 1) or ≤ 3 N/mm² (Class 2).",
      },
    ],
    tables: [
      {
        title: "Prestress loss components (typical band)",
        headers: ["Loss", "Depends on"],
        rows: [
          ["Friction", "μ, tendon angle α, wobble k, length"],
          ["Anchorage slip", "Slip (2 mm default), Es, affected length"],
          ["Elastic shortening", "Modular ratio m, concrete stress fc"],
          ["Creep", "Creep coefficient φ (1.6), m, fc"],
          ["Shrinkage", "εsh: 0.0003 pre, 0.0002 post"],
          ["Relaxation", "3% of initial stress (default)"],
        ],
      },
      {
        title: "Stress limits (IS 1343 Cl. 22.7)",
        headers: ["Stage", "Compression limit", "Tension limit"],
        rows: [
          ["Transfer", "0.5·fck", "Class 1: 0 · Class 2: ≤ 3 N/mm²"],
          ["Service", "0.33·fck", "Class 1: 0 · Class 2: ≤ 3 N/mm²"],
          ["Jacking", "—", "σ0 ≤ 0.8·fpu"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — post-tensioned 300 × 800 mm beam, 20 m span (the calculator's defaults)",
      inputs:
        "Post-tensioned, rectangular 300 × 800 mm, span 20 m, eccentricity 120 mm, P0 1,000 kN, Ap 800 mm², fpu 1,860 MPa, M30, Es 210,000 MPa, slip 2 mm, μ 0.3, k 0.0015/m, creep 1.6, εsh 0.0002, relaxation 3%, service moment 300 kNm, transfer moment 50 kNm, Class 1.",
      steps: [
        "Section: A = 240,000 mm²; I = 12.8 × 10⁹ mm⁴; Z = 32 × 10⁶ mm³. Ec = 5,000·√30 = 27,386 MPa; modular ratio m = 7.67.",
        "Initial stress σ0 = 1,000,000 ÷ 800 = 1,250 MPa ≤ 0.8 × 1,860 = 1,488 MPa — jacking passes.",
        "Losses (MPa): friction 54.3, slip 21.0, elastic 19.1, creep 61.0, shrinkage 42.0, relaxation 37.5. Total = 234.9 MPa = 18.8% — inside the 15–25% band. Effective stress = 1,015.1 MPa ≤ 0.7 × 1,860 = 1,302 MPa.",
        "Transfer stresses: top +1.95 MPa, bottom +5.88 MPa compression — both under 0.5 × 30 = 15 MPa. Service: top +9.71 MPa, bottom −2.95 MPa — tension of 2.95 MPa.",
        "Class 1 allows no tension, so Class 1 FAILS by a hair. As Class 2 (limit 3 MPa) it passes: 2.95 ≤ 3. Either reclassify as Class 2 or add prestress / eccentricity.",
      ],
      result:
        "Post-tensioned 300 × 800 mm beam: 18.8% total loss, effective stress 1,015 MPa, transfer safe — but Class 1 fails on 2.95 MPa of service tension. Reclassify as Class 2 or increase the prestress. Tendon 125.6 kg, concrete 4.8 m³ for the 20 m beam.",
    },
    related: [
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "is-codes-reference", title: "Indian Standards Codes Reference", desc: "IS 456, IS 800, IS 10262 and more, with clauses and scope, searchable by code." },
    ],
  },

  "raft-foundation": {
    id: "raft-foundation",
    intro:
      "A raft (mat) foundation spreads the whole building's load over the entire footprint, so it is the answer when isolated footings would cover more than about half the plan, or when the soil is too weak for the area an isolated footing needs. The checks are the same ideas at a bigger scale: bearing pressure with biaxial eccentricity (the resultant must stay in the kern — |ex|/(B/6) + |ey|/(L/6) ≤ 1 — and q_min ≥ 0 so no corner lifts), settlement (immediate plus consolidation, limit 50 mm in this tool), punching shear at each column (IS 456 Cl. 31.6, τv ≤ ks·0.25√fck), and flexure on a strip (Mu = qu·L²/8 per metre, steel at least 0.12% of the section, IS 456 Cl. 26.5.2.1). IS 2950 is the raft code; the SBC you enter is checked as entered — apply any code increase for rafts to that input and note it, rather than hiding it in the maths. Settlement, not bearing, is usually what fails a raft on soft clay — as the defaults below show.",
    formulas: [
      {
        formula: "q_avg = P ÷ A;   q_max/min = q_avg·(1 ± 6·ex/B ± 6·ey/L);   kern: |ex|/(B/6) + |ey|/(L/6) ≤ 1",
        variables:
          "P = total load; A = raft area; ex, ey = eccentricities. Bearing passes only when q_max ≤ SBC and q_min ≥ 0.",
      },
      {
        formula: "Immediate: si = q·B·(1 − ν²)·If ÷ Es;   Consolidation: sc = (Cc·H ÷ (1 + e0))·log10((σ′v0 + Δσ) ÷ σ′v0)",
        variables:
          "If ≈ 1.0 (flexible raft, average); Es = soil modulus; Cc = compression index; H = clay thickness; e0 = initial void ratio; Δσ = stress increase ratio × q_avg. Total settlement limit 50 mm.",
      },
      {
        formula: "Punching: τv = Vpunch ÷ (b0·d) ≤ ks·0.25·√fck;   b0 = 2[(c+d) + (c+d)]",
        variables:
          "V = 1.5 × column load − factored soil pressure inside the punching perimeter; d = thickness − cover − φ/2 (IS 456 Cl. 31.6.3).",
      },
      {
        formula: "Strip Mu = qu·span² ÷ 8 (per m);   Ast ≥ max(Ast from Mu, 0.12% of section)",
        variables:
          "Strip span = shorter side ÷ 4; qu = factored average pressure. Steel is provided top and bottom, both directions; excavation = (L + 0.6)(W + 0.6) × depth.",
      },
    ],
    tables: [
      {
        title: "When to choose a raft over isolated footings",
        headers: ["Situation", "Choice"],
        rows: [
          ["Footings would cover > ~50% of the footprint", "Raft"],
          ["Soil too weak for the required footing area", "Raft (or piles)"],
          ["Heavy column loads close together", "Raft"],
          ["Good soil, well-spaced columns", "Isolated footings"],
          ["Very weak / deep soft soil", "Piles, not a raft"],
        ],
      },
      {
        title: "Acceptance limits in the tool",
        headers: ["Check", "Limit"],
        rows: [
          ["Bearing", "q_max ≤ SBC, q_min ≥ 0"],
          ["Kern (resultant)", "|ex|/(B/6) + |ey|/(L/6) ≤ 1"],
          ["Total settlement", "≤ 50 mm"],
          ["Punching shear", "τv ≤ ks·0.25√fck"],
          ["Minimum steel", "0.12% of section, top and bottom, both ways"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 12 × 20 m raft, 24,000 kN (the calculator's defaults)",
      inputs:
        "Raft 12 × 20 × 0.6 m, total load 24,000 kN, ex 0.6 m, ey 0.4 m, SBC 150 kN/m², Es 25 MPa, ν 0.3, Cc 0.25, clay 4 m, e0 0.9, σ′v0 80 kPa, Δσ ratio 0.6, M30, Fe500, column 400 mm, column load 1,500 kN, cover 75 mm, Ø20 bars, depth 1.5 m.",
      steps: [
        "Area = 240 m²; q_avg = 100 kPa; q_max = 138 kPa, q_min = 62 kPa — bearing passes (138 ≤ 150, 62 ≥ 0). Kern: 0.6/3.33 + 0.4/2 = 0.38 ≤ 1 — the resultant is inside the middle third.",
        "Settlement: immediate 72.8 mm + consolidation 127.9 mm = 200.7 mm — far above the 50 mm limit. The raft FAILS on settlement at these defaults (soft clay, Cc 0.25 over 4 m). Bearing passing means nothing if the building settles 200 mm.",
        "Punching at one interior column: d = 600 − 75 − 10 = 515 mm; τv = 1.13 MPa ≤ 1.37 MPa (82%) — passes. Thickening the raft helps punching, not settlement.",
        "Flexure: strip Mu = 168.8 kNm/m → Ast 773 mm²/m each way, top and bottom (minimum 720 mm²/m). Concrete 144 m³, steel 5,825 kg, formwork 38.4 m², excavation 389.34 m³.",
      ],
      result:
        "Bearing and punching pass, but the raft settles 200.7 mm against a 50 mm limit — on this soft clay the design needs ground improvement, preloading, or piles instead of a thicker raft. A raft that passes bearing and fails settlement is the classic raft mistake, and this is why the tool checks both.",
    },
    related: [
      { id: "isolated-footing", title: "Isolated Footing Design Calculator — IS 456", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
      { id: "pile-foundation", title: "Pile Foundation Calculator", desc: "Friction and end bearing pile capacity with group efficiency per IS 2911." },
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, Atterberg limits, Proctor compaction and CBR — the soil parameters a raft depends on." },
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
    ],
  },
  reinforcement: {
    id: "reinforcement",
    intro:
      "The Reinforcement Detailing Visualizer is a quantity takeoff from the bars you enter — it does not design the member. Give it the section, the top and bottom bars (beam/column) or the two-way grid (slab), the cover, the stirrup diameter and spacing, and it works out the effective depth, the steel areas and ratios, the cutting lengths, the bar counts, the weight and the stock bars to order. The canonical rules are the house rules: effective depth d = D − (cover + φ/2); steel area As = n·π·φ²/4; stirrup length by the IS 2502 detailed form on inner dimensions (section − 2×cover − φ); stirrup count N = ⌈L/S⌉ + 1; steel weight d² ÷ 162.28 kg/m. Cover is checked against the IS 456 minima (slab 20, beam 25, column 40 mm) and spacing against 0.75d / 300 mm. The steel-ratio notes (beams 0.8–1.5%, columns 0.8–4%, slabs 0.15–0.5%) are rules of thumb for planning, not design limits — the exact steel comes from the structural design.",
    formulas: [
      {
        formula: "d = D − (cover + φ/2);   As = n·π·φ² ÷ 4;   ρ = As ÷ (b·d)",
        variables:
          "d = effective depth; As = steel area; ρ = steel ratio. Beam example: 3 × Ø20 mm bottom bars = 942 mm²; ρ = 942 ÷ (300 × 415) = 0.76%.",
      },
      {
        formula: "Stirrup L (IS 2502 detailed) = 2(A+B) + 2×10φ − (3×2φ + 2×3φ) = 2(A+B) + 8φ",
        variables:
          "A, B = inner dimensions (section − 2×cover − φ). The field rule 2(A+B) + 24φ reads about 10% high — it counts the full hook allowance without deducting bend shortening.",
        note: "Headline weight always uses the detailed length; the field-rule length is shown only for comparison, from the same inner A/B.",
      },
      {
        formula: "Stirrups N = ⌈L ÷ S⌉ + 1;   Slab bars per direction = ⌊grid ÷ spacing⌋ + 1",
        variables:
          "One stirrup at each end plus one per spacing interval. Slab main bars run one way, distribution bars the other; the grid remainder is flagged when the spacing does not divide the grid evenly.",
      },
      {
        formula: "W = d² ÷ 162.28 (kg/m);   bars to order = ⌈total cut length ÷ 12 m⌉",
        variables:
          "Stock bars are 12 m (or 40 ft = 12.192 m). Wastage is applied to the net weight to give the order weight.",
      },
    ],
    tables: [
      {
        title: "Nominal cover (IS 456)",
        headers: ["Member", "Minimum cover"],
        rows: [
          ["Slab", "20 mm"],
          ["Beam", "25 mm"],
          ["Column", "40 mm"],
          ["Footing", "50 mm"],
          ["Concrete cast against soil", "75 mm"],
        ],
      },
      {
        title: "Steel-ratio rules of thumb (planning only, not design)",
        headers: ["Member", "Typical ρ"],
        rows: [
          ["Beam", "0.8–1.5%"],
          ["Column", "0.8–4% (code limit 6%)"],
          ["Slab", "0.15–0.5%"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 300 × 450 mm beam, 3 m (the tool's default)",
      inputs:
        "Beam 300 × 450 mm, length 3 m, cover 25 mm, top 2 × Ø16 mm, bottom 3 × Ø20 mm, Ø8 stirrups @ 150 mm, 5% wastage, steel PKR 270/kg (indicative).",
      steps: [
        "Effective depth d = 450 − (25 + 20/2) = 415 mm. Bottom steel As = 3 × 314 = 942 mm² (ρ 0.76%); top steel = 2 × 201 = 402 mm². Cover 25 mm meets the IS 456 beam minimum.",
        "Stirrup inner dimensions: A = 300 − 2×25 − 8 = 242 mm; B = 450 − 2×25 − 8 = 392 mm. Detailed length = 2(242 + 392) + 8×8 = 1,332 mm. The field rule gives 1,460 mm — 9.6% high.",
        "Stirrup count = ⌈3,000 ÷ 150⌉ + 1 = 21 stirrups; total stirrup length 27.97 m; stirrup weight 11.03 kg.",
        "Main steel weight = 31.65 kg. Total net = 42.68 kg; with 5% wastage, order 44.81 kg — 4 stock bars of 12 m.",
      ],
      result:
        "300 × 450 mm beam, 3 m: 42.68 kg net (44.81 kg to order) — 31.65 kg of main steel and 11.03 kg of stirrups at the IS 2502 detailed length. Using the field-rule stirrup length would have ordered about 1 kg of steel that was never needed.",
    },
    related: [
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths, bar weights and laps for beams, columns, slabs and stirrups." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "column-design", title: "RCC Column Design Calculator", desc: "Short and slender column check with axial plus biaxial bending capacity per IS 456 and IS 13920." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "metal-weight", title: "Metal Weight Calculator", desc: "Weight of steel plates, bars, pipes and sections from dimensions." },
    ],
  },

  "roof-calculator": {
    id: "roof-calculator",
    intro:
      "A pitched roof is one right-angled triangle, repeated: the run is half the span (gable or hip — a mono-pitch runs the full span), the rise is whatever the drawings give, and the rafter is the hypotenuse, plus the sloped overhang. The pitch can be entered any of four ways — rise, X:12, degrees or percent — and the calculator keeps them live-synced, because 6:12, 26.6° and 50% are the same slope. The roof area is the sloped area, not the footprint: footprint × 1/cos θ. From the area come the covering quantities — roofing squares (100 sq ft each), shingle bundles (3 per square), felt rolls (#15 about 432 sq ft, #30 about 216 sq ft), ridge-cap bundles, drip edge in 3.05 m pieces, and the rafter count at your spacing. Hip roofs slope on all four sides, so their area is the whole plan (with overhangs) × the pitch multiplier, and the hip rafter is approximated at 1.5 × the common run — the tool says so, because the exact length depends on the hip geometry. Most houses in Pakistan have a flat RCC slab roof: a pitch of 0 gives a flat result on purpose, and for a flat roof you should use the slab tools instead.",
    formulas: [
      {
        formula: "θ = arctan(rise ÷ run);   pitch X:12 = (rise ÷ run) × 12;   pitch % = (rise ÷ run) × 100",
        variables:
          "Run = span ÷ 2 (gable/hip) or span (mono-pitch). Multiplier = 1 ÷ cos θ = √(1 + (rise/run)²).",
        note: "6:12 means 6 units of rise per 12 of run = arctan(0.5) = 26.6° = 50%.",
      },
      {
        formula: "Rafter = √(rise² + run²) + overhang ÷ cos θ",
        variables:
          "The overhang is HORIZONTAL, so the sloped length it adds is overhang × multiplier. Adding it directly to the sloped rafter understates the rafter by about 1.3%.",
      },
      {
        formula: "Gable area = 2 × rafter × length;   Hip area = plan with overhangs × multiplier;   Mono area = rafter × length",
        variables:
          "Length includes the rake (gable-end) overhangs on both ends. Hip rafter ≈ 1.5 × common run (stated approximation); ridge = length − span for a hip (0 if the roof is square).",
      },
      {
        formula: "Squares = ⌈area with waste ÷ 9.2903 m²⌉;   Bundles = squares × 3;   Felt rolls = ⌈area ÷ roll coverage⌉",
        variables:
          "One roofing square = 100 sq ft = 9.2903 m². #15 felt ≈ 40.13 m²/roll (432 sq ft); #30 felt ≈ 20.07 m²/roll (216 sq ft). Ridge-cap bundle ≈ 9.14 m; drip edge in 3.05 m pieces.",
      },
    ],
    tables: [
      {
        title: "Pitch bands used by the tool",
        headers: ["Pitch (X:12)", "Band"],
        rows: [
          ["< 2", "Flat"],
          ["2 – 4", "Low slope"],
          ["4 – 9", "Conventional"],
          ["9 – 12", "Steep"],
          ["> 12", "Very steep — specialist fixing and access"],
        ],
      },
      {
        title: "Covering quantities per unit",
        headers: ["Item", "Coverage"],
        rows: [
          ["Roofing square", "100 sq ft (9.29 m²)"],
          ["Shingle bundle", "≈ 33 sq ft — 3 bundles per square"],
          ["#15 felt roll", "≈ 432 sq ft (40.13 m²)"],
          ["#30 felt roll", "≈ 216 sq ft (20.07 m²)"],
          ["Ridge-cap bundle", "≈ 9.14 m of ridge"],
          ["Drip edge piece", "3.05 m (10 ft)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — gable roof, 10 m span, 3 m rise, 12 m long",
      inputs:
        "Span 10 m, rise 3 m, building length 12 m, eave overhang 0.5 m, no rake overhang, gable, 10% wastage, rafters @ 0.4 m.",
      steps: [
        "Run = 10 ÷ 2 = 5 m. θ = arctan(3 ÷ 5) = 31.0°; pitch = 7.2:12 = 60% — Conventional band. Multiplier = 1 ÷ cos 31.0° = 1.166.",
        "Hypotenuse = √(3² + 5²) = 5.83 m. Sloped overhang = 0.5 × 1.166 = 0.58 m. Total rafter = 5.83 + 0.58 = 6.41 m.",
        "Roof area = 2 × 6.41 × 12 = 153.94 m² (footprint 120 m² × 1.166, plus the overhang). Ridge = 12 m; eaves 24 m; rakes 25.66 m.",
        "Squares = ⌈153.94 × 1.10 ÷ 9.2903⌉ = 19 squares; bundles = 19 × 3 = 57. #15 felt = ⌈153.94 ÷ 40.13⌉ = 4 rolls; #30 felt = 8 rolls. Ridge-cap = ⌈12 ÷ 9.14⌉ = 2 bundles. Drip edge = 24 + 25.66 = 49.66 m = 17 pieces. Rafters = (⌈12 ÷ 0.4⌉ + 1) × 2 = 62.",
      ],
      result:
        "10 × 12 m gable at 7.2:12 needs 19 squares (57 bundles), 4 rolls of #15 felt, 2 ridge-cap bundles, 49.66 m of drip edge and 62 rafters of 6.41 m each. For a hip roof on the same plan, the area is the whole plan with overhangs × 1.166 — and the hip rafters are an approximation, so confirm them against your drawings.",
    },
    related: [
      { id: "solar-roof", title: "Solar Roof Calculator — Panels, Battery & Payback", desc: "Size the solar system for the roof and price it — panels, inverter, battery and payback." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases — including flat RCC roofs." },
      { id: "universal-structural-geometry", title: "Universal Structural Geometry Engine", desc: "Rectangular and round columns, tubes, staircases, precast walls and roof pitch in one shape selector." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
    ],
  },

  "staircase-calculator": {
    id: "staircase-calculator",
    intro:
      "A staircase is three things at once: a comfortable climb, a concrete volume, and a waist slab designed as an inclined beam. Comfort is the rule 2R + T = 600–650 mm (rise twice plus tread) — the defaults here, R 170 mm and T 280 mm, give exactly 620 mm. The concrete is the steps (½·R·T·width per step) plus the waist slab (inclined length × width × waist thickness) plus any landings. The waist slab is designed per IS 456 Cl. 33 as a slab spanning the flight: self-weight on the slope (25 × (waist/cos θ + R/2) kN/m² of plan) plus finishes (1.0 kN/m²) plus live load (3.0 kN/m²), factored by 1.5, Mu = wL²/8 per metre width, effective depth d = waist − cover − φ/2, steel at least 0.12% (distribution steel the same 0.12%), spacing at most 3d or 300 mm. Straight, L-shaped and dog-legged (U-shaped) flights are all supported; the stairwell size is worked out from the flight geometry, not guessed.",
    formulas: [
      {
        formula: "2R + T = 600–650 mm (comfort rule)",
        variables:
          "R = riser (rise per step), T = tread (going per step). Defaults R 170 mm, T 280 mm → 620 mm. Total rise = steps × R; total run = (steps − 1) × T.",
        note: "Steps for a floor = ⌈floor height ÷ R⌉, split into flights (dog-legged: half per flight, plus a landing).",
      },
      {
        formula: "Inclined length = √(((steps−1)·T)² + (steps·R)²);   V_steps = ½·R·T·W × steps;   V_waist = inclined length × W × waist",
        variables:
          "W = stair width. Landing volume = landings × length × width × waist. Formwork = inclined length × W + steps × R × W (+ landing area).",
      },
      {
        formula: "w = 25·(waist/cos θ + R/2) + finishes + live;   Mu = 1.5·w·L² ÷ 8 (per m width)",
        variables:
          "cos θ = T ÷ √(R² + T²); L = effective span (going + half the landing for dog-legged). Finishes 1.0 kN/m², live 3.0 kN/m² defaults.",
        note: "d = waist − cover − φ/2. Ast by the beam LSM formula; Ast,min = 0.12% of the waist section; spacing ≤ min(3d, 300 mm). Main bars: N = ⌈(W − 2·cover)/spacing⌉ + 1, cut length = inclined length + 0.3 m anchorage.",
      },
    ],
    tables: [
      {
        title: "Comfort and geometry (tool defaults)",
        headers: ["Item", "Default"],
        rows: [
          ["Riser R", "170 mm"],
          ["Tread T", "280 mm"],
          ["2R + T", "620 mm (rule 600–650)"],
          ["Stair width", "1.2 m"],
          ["Waist thickness", "150 mm"],
          ["Cover", "20 mm"],
        ],
      },
      {
        title: "Waist-slab design loads (per m² of plan)",
        headers: ["Load", "Default"],
        rows: [
          ["Self-weight (waist + steps, on slope)", "≈ 6.51 kN/m² at defaults"],
          ["Finishes", "1.0 kN/m²"],
          ["Live load", "3.0 kN/m²"],
          ["Factored design load w", "1.5 × total"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — straight flight, 10 steps (the calculator's defaults)",
      inputs:
        "Straight flight, 10 steps, R 170 mm, T 280 mm, width 1.2 m, waist 150 mm, no landing, M25, Fe500, Ø12 main @ 150 mm, Ø10 distribution @ 200 mm, cover 20 mm, mix 1:1.5:3, 5% wastage.",
      steps: [
        "Total rise = 10 × 0.17 = 1.70 m; total run = 9 × 0.28 = 2.52 m. Comfort: 2 × 170 + 280 = 620 mm — inside 600–650.",
        "Inclined length = √(2.52² + 1.70²) = 3.04 m. Step volume = ½ × 0.17 × 0.28 × 1.2 × 10 = 0.286 m³; waist volume = 3.04 × 1.2 × 0.15 = 0.547 m³; wet concrete = 0.833 m³.",
        "Waist design: cos θ = 0.28 ÷ √(0.17² + 0.28²) = 0.854; self-weight = 25 × (0.15 ÷ 0.854 + 0.085) = 6.51 kN/m²; total load = 6.51 + 1.0 + 3.0 = 10.51 kN/m²; Mu = 1.5 × 10.51 × 2.52² ÷ 8 = 12.52 kNm/m.",
        "d = 150 − 20 − 6 = 124 mm; Ast required = 242 mm²/m (minimum 180 mm²/m). Provided Ø12 @ 150 = 754 mm²/m — 9 main bars, 26.7 kg; distribution Ø10 @ 200 = 17 bars, 12.6 kg. Designed steel 39.2 kg vs the 1% thumb rule's 65.4 kg — the thumb rule overstates this stair by two-thirds.",
        "Formwork = 5.69 m² (2 plywood sheets, 20 m of battens at the tool's rates).",
      ],
      result:
        "10-step straight flight (1.70 m rise): 0.833 m³ of concrete and 39.2 kg of designed steel — Ø12 @ 150 mm main, Ø10 @ 200 mm distribution. The 1% thumb rule would have ordered 65.4 kg; the design is the number to order.",
    },
    related: [
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "reinforcement", title: "Reinforcement Detailing Visualizer", desc: "Interactive 2D rebar detailing for beams, columns and slabs with IS 456 checks." },
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "universal-structural-geometry", title: "Universal Structural Geometry Engine", desc: "Rectangular and round columns, tubes, staircases, precast walls and roof pitch in one shape selector." },
    ],
  },

  "uae-construction-standards": {
    id: "uae-construction-standards",
    intro:
      "Construction in the UAE is governed emirate by emirate, and this page collects the three documents that matter most: the Dubai Building Code (DBC), which unifies building design across Dubai around structural stability, safety, sustainability and accessibility (Dubai Municipality); the Abu Dhabi International Building Code (ADIBC), which is the International Building Code (IBC) with amendments tailored for the Emirate of Abu Dhabi (Department of Municipalities and Transport); and the UAE Fire and Life Safety Code of Practice 2018 (UAE FLSC 2018), the mandatory Civil Defence requirements for fire protection systems, egress and facade safety across all Emirates (Ministry of Interior). There are only three UAE entries on this page — it is a short, focused list, not a full code library — and each entry names its issuing authority so you can go to the source for the current edition. The calculators that use these standards are the house estimator and the beam designer (the DBC entry links both).",
    formulas: [
      {
        formula: "Dubai: Dubai Building Code (DBC) — Dubai Municipality",
        variables:
          "Unifies building design across Dubai: structural stability, safety, sustainability, accessibility. Linked calculators: House Estimator, RCC Beam Design Tool.",
      },
      {
        formula: "Abu Dhabi: ADIBC = International Building Code (IBC) + Abu Dhabi amendments",
        variables:
          "Issued by the Department of Municipalities and Transport, Abu Dhabi. Linked calculator: House Estimator.",
      },
      {
        formula: "All Emirates: UAE Fire and Life Safety Code of Practice 2018 (UAE FLSC 2018)",
        variables:
          "Mandatory Civil Defence requirements: fire protection systems, egress strategies, facade safety. Linked calculator: BOQ Generator (fire provisions in the bill).",
      },
    ],
    tables: [
      {
        title: "UAE construction standards on this page",
        headers: ["Code", "Title", "Issued by"],
        rows: [
          ["DBC", "Dubai Building Code", "Dubai Municipality"],
          ["ADIBC", "Abu Dhabi International Building Code", "Department of Municipalities and Transport, Abu Dhabi"],
          ["UAE FLSC 2018", "UAE Fire and Life Safety Code", "UAE Civil Defence (Ministry of Interior), 2018"],
        ],
      },
      {
        title: "Which code for which emirate?",
        headers: ["Emirate", "Building code", "Fire code"],
        rows: [
          ["Dubai", "Dubai Building Code", "UAE FLSC 2018"],
          ["Abu Dhabi", "ADIBC (IBC + amendments)", "UAE FLSC 2018"],
          ["Other Emirates", "Local municipality code", "UAE FLSC 2018"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — what governs a villa in Dubai?",
      inputs:
        "Question: a villa in Dubai — which standards apply, and which calculators on this site use them?",
      steps: [
        "Open the UAE page: the Dubai Building Code (Dubai Municipality) governs the building design — structure, safety, sustainability and accessibility in one unified code.",
        "Fire safety is separate and mandatory across all Emirates: the UAE Fire and Life Safety Code of Practice 2018 (Civil Defence) covers fire protection systems, egress and facade safety.",
        "For quantities, the DBC entry links the House Estimator and the RCC Beam Design Tool — the beam designer applies IS 456 limit-state design, which is the calculation method; the DBC is the code that requires the design to be done and approved.",
        "If the same villa were in Abu Dhabi, the building code would be the ADIBC (IBC with Abu Dhabi amendments) instead — same fire code, different building code.",
      ],
      result:
        "Dubai villa: Dubai Building Code for the building, UAE FLSC 2018 for fire safety. Abu Dhabi villa: ADIBC for the building, the same UAE FLSC 2018 for fire. The page is a three-entry reference — for the full text of any code, go to the issuing authority.",
    },
    related: [
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "is-codes-reference", title: "Indian Standards Codes Reference", desc: "IS 456, IS 800, IS 10262 and more, with clauses and scope, searchable by code." },
      { id: "pakistan-building-codes", title: "Pakistan Building Codes Reference", desc: "Building Code of Pakistan (BCP) requirements and guidelines — seismic provisions, bylaws and approval rules." },
      { id: "morth-irc-specs", title: "MoRTH & IRC Specifications Guide", desc: "MoRTH and IRC specifications — road, bridge and pavement standards in one reference." },
    ],
  },

  "universal-structural-geometry": {
    id: "universal-structural-geometry",
    intro:
      "The Universal Structural Geometry Engine is six shape calculators in one selector: rectangular beams/columns, circular (round) columns, concrete tubes and pipes, staircases, precast compound walls, and roof pitch. Every tab works the same way — enter the shape, get the volume, the formwork area, the steel by your bar sizes and spacing, and the material split (dry concrete × 1.54, cement bag 0.0347 m³) with cost at the editable rates. The rectangular tab uses the canonical IS 2502 detailed stirrup length on inner dimensions; the circular tab uses spiral ties (one turn = √((π(D − 2c − φ))² + pitch²)); the tube tab is the annulus volume π(R² − r²)·L with formwork on both faces; the trapezoidal-footing tab is the exact frustum volume (and it says to use the Isolated Footing tool for the structural design — this tab is quantities only); the roof tab is the rafter/pitch/area triangle. Precast post and footing sizes are inputs here, not hard-coded.",
    formulas: [
      {
        formula: "Rectangular: V = L·W·D;   Circular: V = π·r²·h;   Tube: V = π·(R² − r²)·L",
        variables:
          "Formwork: rectangular sides 2·D·(L+W); circular π·D·h; tube π·(OD+ID)·L (outer + inner faces). Materials: dry = wet × 1.54 (+ wastage), cement bags = dry cement volume ÷ 0.0347.",
      },
      {
        formula: "Stirrup L = 2(A+B) + 2×10φ − (3×2φ + 2×3φ);   N = ⌈L ÷ S⌉ + 1;   W = d² ÷ 162.28 kg/m",
        variables:
          "A, B = inner dimensions (section − 2×cover − φ). Spiral tie: one turn = √((π(D − 2c − φ))² + pitch²).",
      },
      {
        formula: "Trapezoidal footing: V = L·B·D1 + (h/3)·(A1 + A2 + √(A1·A2))",
        variables:
          "Base volume plus the sloped frustum (A1 = base area, A2 = top area, h = sloped depth). Same formula as the isolated-footing engine — the two tools agree on this volume.",
      },
      {
        formula: "Roof: rafter = √(run² + rise²);   pitch θ = arctan(rise ÷ run);   area = 2 × rafter × run-length",
        variables:
          "Run = span ÷ 2. Purlins: (⌈rafter ÷ spacing⌉ + 1) × 2 × run-length; battens: ⌈2 × rafter ÷ spacing⌉ × run-length; sheets: ⌈area ÷ (sheet width × 2.44)⌉.",
      },
    ],
    tables: [
      {
        title: "The six tabs and what each returns",
        headers: ["Tab", "Returns"],
        rows: [
          ["Rectangular", "Volume, formwork, main + stirrup steel, materials, cost"],
          ["Circular", "Volume, formwork, main + spiral-tie steel, materials, cost"],
          ["Tube / pipe", "Annulus volume, formwork both faces, weight, materials"],
          ["Staircase", "Full stair design — see the staircase guide"],
          ["Precast wall", "Panels, posts, footings, materials"],
          ["Roof", "Rafter, pitch, area, purlins, battens, sheets"],
        ],
      },
      {
        title: "Thumb steel (planning only, where no design exists)",
        headers: ["Element", "Steel per m³ of concrete"],
        rows: [
          ["Slab", "≈ 78 kg/m³ (1.0%)"],
          ["Beam", "≈ 118 kg/m³ (1.5%)"],
          ["Column", "≈ 157 kg/m³ (2.0%)"],
          ["Footing", "≈ 63 kg/m³ (0.8%)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — rectangular beam, round column, tube and roof (the tool's defaults)",
      inputs:
        "Rectangular 3 × 0.3 × 0.4 m, 4 × Ø12 mm main, Ø8 stirrups @ 150 mm, cover 25 mm. Circular Ø0.4 m × 3 m, 6 × Ø12 mm, Ø8 ties @ 150 mm. Tube OD 1.0 m, ID 0.8 m, 5 m long. Roof span 8 m, rise 2 m, run 12 m, purlins @ 1.2 m, battens @ 0.6 m, sheets 1.0 m wide.",
      steps: [
        "Rectangular: V = 3 × 0.3 × 0.4 = 0.36 m³; formwork (sides) = 2 × 0.4 × (3 + 0.3) = 2.64 m². Main steel = 4 × 12 mm × 3 m × 0.887 = 10.65 kg. Stirrups: A = 242 mm, B = 342 mm, L = 1,232 mm, 21 nos = 10.2 kg. Total steel 20.85 kg; materials 5 bags cement, 5.1 cft sand, 10.3 cft aggregate; cost PKR 14,268 at the default rates.",
        "Circular: V = π × 0.2² × 3 = 0.377 m³; formwork = π × 0.4 × 3 = 3.77 m²; steel 24.53 kg (main 15.97 kg + spiral ties 8.56 kg over 21.7 m).",
        "Tube: V = π × (0.5² − 0.4²) × 5 = 1.414 m³; formwork = π × (1.0 + 0.8) × 5 = 28.27 m²; weight = 1.414 × 2,400 = 3,392.9 kg.",
        "Roof: rafter = √(4² + 2²) = 4.47 m; pitch = arctan(2 ÷ 4) = 26.6°; area = 2 × 4.47 × 12 = 107.33 m²; purlins 120 m; battens 180 m; sheets 44.",
        "Trapezoidal footing (defaults 2.2 × 2.2 × 0.2 m base, 0.6 × 0.6 m top, 0.3 m slope): V = 1.62 m³ — the same 1.62 m³ the isolated-footing engine gives for the same geometry, so the two tools agree.",
      ],
      result:
        "One engine, six shapes: beam 0.36 m³ / 20.85 kg steel, round column 0.377 m³ / 24.53 kg, tube 1.414 m³ / 3,393 kg, roof 107.33 m² at 26.6° — all from the same volume, formwork and steel rules. The trapezoidal-footing tab is quantities only; for punching shear and bending use the Isolated Footing designer.",
    },
    related: [
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "roof-calculator", title: "Roof Pitch & Area Calculator", desc: "Roof slope, rafter length and total roof surface area — pitch, span and covering quantities." },
      { id: "precast-wall", title: "Precast Compound Wall Estimator", desc: "Precast wall panels, posts and concrete for boundary walls — panel counts, post spacing and footing quantities." },
      { id: "staircase-calculator", title: "Concrete & Steel Staircase Tool", desc: "Concrete and steel for stairs — waist slab, steps, landing and reinforcement quantities." },
      { id: "isolated-footing", title: "Isolated Footing Design Calculator — IS 456", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
    ],
  },

  "water-tank-design": {
    id: "water-tank-design",
    intro:
      "A water tank is a liquid-retaining structure, and it is designed to a different code and a different limit from an ordinary RCC member: IS 3370:2009, with crack width limited to 0.2 mm, because a tank that cracks leaks. That is why the steel is governed by a minimum (0.217% of the section, IS 3370 Part 2 Cl. 7.1) far more often than by the bending moment, and why the steel stress is capped low — 150 MPa in flexure, 130 MPa in direct tension for deformed bars (IS 3370 Part 2 Table 2) — instead of the 0.87·fy used in IS 456. The demand side is simple: occupants × litres per capita per day (135 lpcd default) × days of reserve. The walls are checked with the IS 3370 Part 4 Table 3 moment coefficients (sagging 0.027·γw·H³, hogging 0.017·γw·H³ per metre run, tabulated for L/H ≈ 2.25); a circular tank adds hoop tension T = γw·H·D/2. IS 3370 recommends minimum M30 concrete for severe exposure (overhead tanks) — M25 is shown for resting and underground use, and the tool warns when an overhead tank is set below M30.",
    formulas: [
      {
        formula: "Demand = occupants × lpcd × days of reserve;   Capacity = L × W × water depth (rectangular) or π·D²/4 × depth (circular)",
        variables:
          "Capacity must cover demand; 1 m³ = 1,000 L. Water load = capacity × 9.81 kN; max pressure p = 9.81 × water depth kN/m².",
      },
      {
        formula: "Mu,long = 0.027·γw·H³;   Mu,short = 0.017·γw·H³ (kNm/m, IS 3370 Part 4 Table 3, L/H ≈ 2.25)",
        variables:
          "γw = 9.81 kN/m³; H = water depth. Ast from moment = Mu ÷ (σst·j·d), j ≈ 0.87, σst = 150 MPa flexure.",
        note: "If L/H is far from 2.25 the coefficients do not strictly apply — the tool warns and the wall steel is indicative only.",
      },
      {
        formula: "Ast,min = 0.217% × 1,000 × wall thickness (IS 3370 Part 2 Cl. 7.1);   hoop T = γw·H·D ÷ 2 (circular)",
        variables:
          "Ast,hoop = T ÷ σst,hoop (130 MPa deformed bars, direct tension). Crack width ≤ 0.2 mm is taken as satisfied when Ast ≥ Ast,min and spacing ≤ 200 mm.",
        note: "d = wall thickness − cover − φ/2. Staging load (overhead) = 1.5 × (water + wall + base concrete weights).",
      },
    ],
    tables: [
      {
        title: "Permissible steel stress σst (IS 3370 Part 2 Table 2)",
        headers: ["Stress type", "Deformed bars", "Plain bars"],
        rows: [
          ["Direct tension (hoop)", "130 MPa", "150 MPa"],
          ["Flexure (bending in walls)", "150 MPa", "150 MPa"],
        ],
      },
      {
        title: "Design limits (IS 3370)",
        headers: ["Rule", "Value"],
        rows: [
          ["Minimum steel", "0.217% of section"],
          ["Crack width", "≤ 0.2 mm"],
          ["Minimum concrete, overhead (severe exposure)", "M30"],
          ["Water demand default", "135 lpcd"],
          ["Freeboard", "0.3 m (range 0.15–0.5 m)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — rectangular overhead tank (the calculator's defaults)",
      inputs:
        "Rectangular overhead tank 4.5 × 2.15 m, water depth 2.0 m, freeboard 0.3 m, walls 200 mm, base 200 mm, 5 occupants, 135 lpcd, 2 days reserve, M25, deformed bars, cover 40 mm, Ø10 bars, 5% wastage.",
      steps: [
        "Demand = 5 × 135 × 2 = 1,350 L. Capacity = 4.5 × 2.15 × 2.0 = 19.35 m³ = 19,350 L — about 14 days of demand, comfortably covered. Water load = 19.35 × 9.81 = 189.8 kN; max pressure = 9.81 × 2 = 19.6 kN/m².",
        "L/H = 4.5 ÷ 2.0 = 2.25 — exactly the ratio the Table 3 coefficients are tabulated for. Mu,long = 0.027 × 9.81 × 2³ = 2.12 kNm/m; Mu,short = 0.017 × 9.81 × 8 = 1.33 kNm/m.",
        "d = 200 − 40 − 5 = 155 mm. Ast from moment = 2.12 × 10⁶ ÷ (150 × 0.87 × 155) ≈ 105 mm²/m — but Ast,min = 0.217% × 1,000 × 200 = 434 mm²/m GOVERNS. Provide Ø10 @ 180 mm = 436 mm²/m; crack width ≤ 0.2 mm satisfied.",
        "Concrete: walls 6.12 m³ + base 1.93 m³ = 8.05 m³; steel 241.4 kg; waterproofing 40.3 m²; staging load 586.7 kN (factored 1.5). Note: this overhead tank is set to M25 — IS 3370 recommends M30 minimum for severe exposure, so upgrade the grade before building.",
      ],
      result:
        "4.5 × 2.15 × 2.0 m overhead tank holds 19,350 L against a 1,350 L two-day demand, with Ø10 @ 180 mm walls governed by the 0.217% minimum steel, 8.05 m³ of concrete and 241.4 kg of steel. The one change to make before building is M25 → M30 for an overhead tank.",
    },
    related: [
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "reinforcement", title: "Reinforcement Detailing Visualizer", desc: "Interactive 2D rebar detailing for beams, columns and slabs with IS 456 checks." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Harvestable rainwater from roof area and rainfall, with tank and recharge sizing." },
    ],
  },
  ai: {
    id: "ai",
    intro:
      "The AI Assistant is a rule-based estimator, not an AI model: it reads the dimensions out of a plain sentence — plot size in marla or sq ft, floors (including G+1), city and finish — and runs them through the same thumb-rule quantity and cost engines the rest of the site uses. There is no model call and no API key involved (an earlier Gemini-backed version could never work in the browser, because the key is undefined in a Vite bundle). It answers one kind of question well — \"what will my house roughly cost?\" — and it is honest about what it cannot do: it cannot read a drawing, it cannot price a real BOQ, and its answer is a first-pass budget, not a quotation. One trap to know: when you type marla, this tool converts at the society standard of 225 sq ft per marla, while the Pakistan cost page defaults to the revenue standard of 272.25 — the same \"5 marla\" gives a smaller covered area here, so check which standard your plot uses before comparing the two answers.",
    formulas: [
      {
        formula: "Covered area = plot sq ft × floors",
        variables:
          "Plot sq ft = marla × 225 (society standard) when you type marla, or the sq ft you type directly. Floors defaults to 1; \"G+1\" is read as 2 floors, capped at 10.",
        note: "No 0.75 coverage factor is applied here — unlike the Pakistan cost page, which multiplies by 0.75 per floor. The two tools deliberately answer slightly different questions.",
      },
      {
        formula: "Total cost = covered area × (grey rate + finish rate) × city multiplier",
        variables:
          "Lahore base rates (PKR/sq ft, Nov 2026, indicative): grey 3,000 + 0; standard 3,000 + 1,800; premium 3,200 + 3,000; luxury 3,500 + 4,500.",
        note: "City multipliers: Lahore 1.00, Karachi 1.05, Islamabad 1.10, Faisalabad 0.95, Multan 0.95, Rawalpindi 1.05, other 1.00. A city you do not name defaults to Lahore.",
      },
      {
        formula: "Cost range = total × 0.95 to total × 1.05",
        variables:
          "The ±5% band is the tool's own uncertainty band on the thumb-rule total — it is not a measured tolerance.",
      },
      {
        formula: "Cement 0.4–0.5 bags/sq ft; steel 3.5–4.0 kg/sq ft; bricks 8–10/sq ft; sand 1.2–1.8 cft/sq ft; aggregate 1.35 cft/sq ft",
        variables:
          "Thumb-rule material ranges per sq ft of covered area (the same ranges the quick estimator uses). The headline material figures use the low end of each range.",
        note: "Finish keywords recognised: \"luxury\", \"premium\", \"grey\"/\"gray\" — anything else is read as standard.",
      },
    ],
    tables: [
      {
        title: "Cost per sq ft by finish (Lahore base, PKR, Nov 2026 — indicative)",
        headers: ["Finish", "Grey", "Finishing", "Total / sq ft"],
        rows: [
          ["Grey structure only", "3,000", "0", "3,000"],
          ["Standard", "3,000", "1,800", "4,800"],
          ["Premium", "3,200", "3,000", "6,200"],
          ["Luxury", "3,500", "4,500", "8,000"],
        ],
      },
      {
        title: "What the assistant understands in your sentence",
        headers: ["It reads", "Example", "If missing"],
        rows: [
          ["Plot size", "\"5 marla\" or \"1,125 sq ft\"", "It asks for a size — no estimate without one"],
          ["Floors", "\"G+1\", \"2 floors\"", "Assumes 1 floor"],
          ["City", "Lahore, Karachi, Islamabad, Faisalabad, Multan, Rawalpindi", "Assumes Lahore"],
          ["Finish", "\"luxury\", \"premium\", \"grey\"", "Assumes standard"],
          ["Rooms", "\"3 bedrooms\"", "Noted only — rooms do not change the cost"],
        ],
      },
      {
        title: "How the total splits (standard finish)",
        headers: ["Part", "Share of total"],
        rows: [
          ["Grey structure", "55%"],
          ["Finishing", "30%"],
          ["Labour", "15%"],
          ["Grey-only job", "85% grey / 15% labour"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — \"5 marla house in Lahore, G+1, standard finish\"",
      inputs:
        "The sentence as typed: 5 marla, Lahore, G+1 (2 floors), standard finish. Parsed: 5 marla × 225 = 1,125 sq ft plot, Lahore multiplier 1.00, standard rate 4,800 PKR/sq ft.",
      steps: [
        "Covered area = 1,125 sq ft × 2 floors = 2,250 sq ft.",
        "Total cost = 2,250 × 4,800 × 1.00 = PKR 10,800,000.",
        "Range = 10,800,000 × 0.95 to × 1.05 = PKR 10,260,000 to PKR 11,340,000.",
        "Materials (low end of the ranges): cement 2,250 × 0.4 = 900 bags; steel 2,250 × 3.5 = 7,875 kg; bricks 2,250 × 10 = 22,500.",
        "Split: grey 55% = PKR 5,940,000; finishing 30% = PKR 3,240,000; labour 15% = PKR 1,620,000.",
      ],
      result:
        "PKR 10,800,000 (range 10.26–11.34 million) for a 2,250 sq ft covered area — 900 bags of cement, 7,875 kg of steel and 22,500 bricks. Remember the marla here is the 225 sq ft society marla: the same plot under the 272.25 revenue marla would price higher on the Pakistan cost page.",
    },
    related: [
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Cost Calculator", desc: "City-wise house construction cost in PKR by finish level — Lahore, Karachi, Islamabad, Faisalabad and Multan." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "Cement, sand, aggregate, bricks, steel, tiles and paint per sq ft of built-up area, with wastage and PK rates." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities — excavation, PCC, footings, brickwork, plaster — instead of thumb rules." },
      { id: "quick-estimation", title: "Quick Rough Cost Estimation", desc: "A first-pass budget and timeline from a few inputs — the same engine the assistant runs, with the sliders." },
    ],
  },

  "area-space-calculator": {
    id: "area-space-calculator",
    intro:
      "Area is the one number every other estimate stands on — the room area that sizes the tiles, the plot area that sizes the house, the carpet area that sizes the price. This tool does five jobs in one place: the area and perimeter of eight shapes (rectangle, square, circle, triangle, trapezoid, L-shape, T-shape and any polygon from its corner coordinates), the area of an irregular four-sided plot split by its diagonal, the property-area chain from carpet area up to super built-up area (RERA method), IS 1200 plaster deductions for doors and windows, and true roof area from pitch and overhang. Everything is computed in metric internally and converted for display — 1 m² = 10.7639 sq ft — and the plot and property tools use the revenue marla of 272.25 sq ft, not the 225 society marla, so check which standard your deed uses before you quote the marla figure.",
    formulas: [
      {
        formula: "Rectangle A = L × W, P = 2(L + W); circle A = πr², P = 2πr; square A = L², P = 4L",
        variables: "A = area, P = perimeter. All lengths in metres internally.",
      },
      {
        formula: "Triangle (Heron): s = (a + b + c) ÷ 2; A = √(s(s − a)(s − b)(s − c))",
        variables:
          "a, b, c = the three side lengths. Returns nothing (an error) unless each side is shorter than the sum of the other two — the triangle inequality.",
        note: "The same Heron formula splits an irregular plot: two triangles on either side of one measured diagonal, added together.",
      },
      {
        formula: "Trapezoid A = (a + b) ÷ 2 × h; L-shape A = overall length × arm 1 + (overall width − arm 1) × arm 2",
        variables:
          "a, b = the two parallel sides, h = height between them. An L-shape is two rectangles; its perimeter equals the perimeter of its bounding rectangle.",
        note: "Polygon (shoelace): A = |Σ(xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)| ÷ 2, with the perimeter the sum of the side lengths.",
      },
      {
        formula: "RERA carpet → plinth → built-up → super built-up",
        variables:
          "RERA carpet = carpet × (1 + internal-walls %); plinth = RERA carpet + carpet × external-walls %; built-up = plinth + balcony; super built-up = built-up × (1 + common-area %). Loading factor = (super built-up − built-up) ÷ built-up × 100.",
        note: "RERA carpet area counts the internal walls; the traditional carpet area does not. The two are different numbers for the same flat.",
      },
      {
        formula: "Net plaster = gross − deductions + jambs; gross = length × height × faces",
        variables:
          "IS 1200 deduction per opening: under 0.5 m² no deduction; 0.5–3 m² deduct one face; over 3 m² deduct both faces and add the jambs, soffits and sills ((2h + w) × jamb depth). Thresholds are converted to the active unit — 0.5 m² = 5.38 sq ft, 3 m² = 32.29 sq ft.",
        note: "A single-face 0.5–3 m² opening deducts the FULL opening area once — deducting only half was a bug this engine fixed.",
      },
      {
        formula: "True roof area = horizontal area × 1 ÷ cos(pitch); horizontal area = floor area + perimeter × overhang",
        variables:
          "Pitch in degrees (0–89°); the pitch multiplier 1 ÷ cos θ is 1.155 at 30°. Rise:run is shown as rise per 12 in of run (tan θ × 12).",
      },
    ],
    tables: [
      {
        title: "Shape formulas at a glance",
        headers: ["Shape", "Area", "Perimeter"],
        rows: [
          ["Rectangle", "L × W", "2(L + W)"],
          ["Circle", "πr²", "2πr"],
          ["Triangle", "Heron (three sides)", "a + b + c"],
          ["Trapezoid", "(a + b) ÷ 2 × h", "a + b + 2 × leg"],
          ["L-shape", "Two rectangles added", "Perimeter of bounding rectangle"],
          ["T-shape", "Top + leg rectangles", "2 × top width + 2 × total height"],
          ["Polygon", "Shoelace from corners", "Sum of side lengths"],
        ],
      },
      {
        title: "Plaster opening deductions (IS 1200)",
        headers: ["Opening area", "Deduction"],
        rows: [
          ["Under 0.5 m² (5.38 sq ft)", "None"],
          ["0.5–3 m² (5.38–32.29 sq ft)", "One face only — full area, once"],
          ["Over 3 m² (32.29 sq ft)", "Both faces, plus jambs/soffits/sills"],
        ],
      },
      {
        title: "Area conversions used here",
        headers: ["Conversion", "Value"],
        rows: [
          ["1 m²", "10.7639 sq ft"],
          ["1 sq yd", "9 sq ft"],
          ["1 marla (revenue, this tool)", "272.25 sq ft"],
          ["1 kanal", "20 marla = 5,445 sq ft"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — a 12 m × 9 m room, its roof and its plaster",
      inputs:
        "Room 12 m × 9 m (perimeter 42 m); roof pitch 30°, overhang 0.6 m; one wall 12 m × 3 m plastered both faces, with one door 1.0 × 2.1 m and two windows 1.5 × 1.2 m; jamb depth 0.23 m.",
      steps: [
        "Room area = 12 × 9 = 108 m² (1,162.50 sq ft); perimeter = 2 × (12 + 9) = 42 m.",
        "Roof horizontal area = 108 + 42 × 0.6 = 133.2 m². Pitch multiplier = 1 ÷ cos 30° = 1.155, so true roof area = 133.2 × 1.155 = 153.81 m² (pitch 6.9:12).",
        "Plaster gross = 12 × 3 × 2 faces = 72 m². Door 2.1 m² and each window 1.8 m² are all in the 0.5–3 m² band, so each deducts one face: 2.1 + 2 × 1.8 = 5.7 m². Net plaster = 72 − 5.7 = 66.3 m² (no jambs — jambs are added only above 3 m²).",
        "The same room as a property check: 100 m² carpet, 10% internal walls, 5% external walls, 8 m² balcony, 20% common area → RERA carpet 110 m², plinth 115 m², built-up 123 m², super built-up 147.6 m², loading factor 20%.",
        "And as a plot check: a 30 m × 20 m four-sided plot with a 36.06 m diagonal splits into two 300 m² triangles — 600 m² total.",
      ],
      result:
        "108 m² of floor, 153.81 m² of true roof at 30° pitch, and 66.3 m² of net plaster for the one wall. The property chain and the diagonal plot split use the same numbers the tool shows — the loading factor and the plot area are computed, never typed in.",
    },
    related: [
      { id: "marla-converter", title: "Marla / Kanal Area Converter", desc: "Convert the plot area between marla, kanal, sq ft, sq yd, m², acres and murabba, Punjab and KPK standards." },
      { id: "room-area-calculator", title: "Room Area & Compliance Calculator", desc: "Net versus gross room area and NBC / RERA minimum room-size compliance, room by room." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Take the areas into measured quantities — excavation, PCC, footings, brickwork and plaster." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "Materials per sq ft of built-up area — cement, sand, aggregate, bricks, steel, tiles and paint." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
    ],
  },

  boq: {
    id: "boq",
    intro:
      "A Bill of Quantities (BOQ) is the priced list of everything a project needs — each item described, measured, rated and totalled, so a contractor can price it and a client can compare tenders line by line. This generator builds that list properly: items grouped under MasterFormat-style divisions (01 General Requirements through 16 Electrical), quantities measured in Nos × Length × Width × Depth columns the way a quantity surveyor measures them, per-line wastage, item codes in CPWD DSR style, and unpriced lines flagged instead of silently priced at zero. The money is a fixed chain — subtotal, then contingency, then tax on the two together, then the grand total — with the tax labelled by region (Sales Tax 18% in Pakistan, GST 18% in India, VAT 5% in the UAE). Quantities can also arrive from the other tools: Material Takeoff and the Measurement Sheet can send their lines straight into this BOQ. One honest label: the measurement-standard selector (IS 1200 / CESMM4 / NRM2 / POMI) is cosmetic — it records which standard you measured to, it does not change the maths.",
    formulas: [
      {
        formula: "Quantity = Nos × Length × Width × Depth",
        variables:
          "Only dimensions actually given are multiplied (a missing dimension is not treated as 1). Quantity is rounded to 2 decimals.",
        note: "For an area item give L × W; for a length item give L only; for a lump-sum item give the quantity directly.",
      },
      {
        formula: "Billable quantity = quantity × (1 + wastage %)",
        variables: "Wastage is set per line, so cut brickwork can carry 5% while a lump-sum item carries none.",
      },
      {
        formula: "Line amount = billable quantity × rate",
        variables:
          "A line with no rate (null) or a rate of 0 is unpriced: its amount is shown as unpriced and it is counted, never priced at zero.",
      },
      {
        formula: "Subtotal = Σ line amounts; contingency = subtotal × contingency %; taxable = subtotal + contingency; tax = taxable × tax %; grand total = taxable + tax",
        variables:
          "Contingency defaults to 5%, tax defaults to 18% (Pakistan Sales Tax). Tax is charged on subtotal + contingency — the same base the Cost Summary uses.",
      },
      {
        formula: "Tax by region: PK Sales Tax 18%, IN GST 18%, AE VAT 5%",
        variables:
          "Defaults only — the rate is editable per contract. Pakistan's standard sales-tax rate is 18% but it is not universal to every item.",
      },
    ],
    tables: [
      {
        title: "The money chain, in order",
        headers: ["Step", "How it is computed"],
        rows: [
          ["Subtotal", "Sum of all priced line amounts"],
          ["Contingency", "Subtotal × contingency % (default 5%)"],
          ["Taxable", "Subtotal + contingency"],
          ["Tax", "Taxable × tax % (default 18%)"],
          ["Grand total", "Taxable + tax"],
          ["Unpriced lines", "Counted and flagged — never priced at zero"],
        ],
      },
      {
        title: "Tax label and default by region",
        headers: ["Region", "Label", "Default rate"],
        rows: [
          ["Pakistan (PK)", "Sales Tax (PK)", "18%"],
          ["India (IN)", "GST (IN)", "18%"],
          ["UAE (AE)", "VAT (UAE)", "5%"],
        ],
      },
      {
        title: "Divisions used in the BOQ",
        headers: ["Division", "Covers"],
        rows: [
          ["01 – General Requirements", "Preliminaries, site setup"],
          ["02 – Site Work & Earthwork", "Excavation, backfill, drainage"],
          ["03 – Concrete", "PCC, RCC, formwork"],
          ["04 – Masonry", "Brickwork and blockwork"],
          ["05 – Metals", "Steel reinforcement and sections"],
          ["06 – Wood & Plastics", "Joinery and carpentry"],
          ["07 – Thermal & Moisture", "Waterproofing, insulation"],
          ["08 – Doors & Windows", "Frames, shutters, glazing"],
          ["09 – Finishes", "Plaster, flooring, paint"],
          ["15 – Mechanical / Plumbing", "Pipes, fixtures, sanitary"],
          ["16 – Electrical", "Wiring, DB, fixtures"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — a four-line BOQ, 5% contingency, 18% tax",
      inputs:
        "Excavation 10 × 5 × 1.5 m @ PKR 450/m³; PCC 1:4:8, 4.5 m³ @ PKR 14,500/m³; RCC 1:2:4, 38 m³ @ PKR 28,500/m³ with 5% wastage; brickwork 9 in, 52 m³ @ PKR 24,500/m³. Rates are the dated PK table (2026-11-12).",
      steps: [
        "Excavation quantity = 1 × 10 × 5 × 1.5 = 75 m³; amount = 75 × 450 = PKR 33,750.",
        "PCC amount = 4.5 × 14,500 = PKR 65,250.",
        "RCC billable quantity = 38 × 1.05 = 39.9 m³; amount = 39.9 × 28,500 = PKR 1,137,150.",
        "Brickwork amount = 52 × 24,500 = PKR 1,274,000.",
        "Subtotal = 33,750 + 65,250 + 1,137,150 + 1,274,000 = PKR 2,510,150.",
        "Contingency 5% = PKR 125,507.50; taxable = PKR 2,635,657.50; tax 18% = PKR 474,418.35.",
      ],
      result:
        "Grand total PKR 3,110,075.85 on a PKR 2,510,150 subtotal. The same chain prices the built-in Residential template: subtotal 37,275 → +5% contingency 39,138.75 → +18% tax 46,183.73 (demo rates — see the BOQ Templates guide before tendering on those).",
    },
    related: [
      { id: "boq-templates", title: "BOQ Templates & Excel Downloads", desc: "Start from a ready template — 5-marla house, boundary wall, residential, road, retaining or drainage — then re-price it." },
      { id: "measurement-sheet", title: "Measurement Sheet Calculator", desc: "Nos × L × W × D measurement rows that feed straight into this BOQ." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "Material quantities per sq ft that can be sent to the BOQ as priced lines." },
      { id: "cost-summary", title: "Construction Cost Summary Sheet", desc: "The same subtotal → contingency → tax chain, summarised by grey, finishing and labour." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities — excavation, PCC, footings, brickwork, plaster — to price in the BOQ." },
    ],
  },

  "boq-templates": {
    id: "boq-templates",
    intro:
      "The Template Gallery is the fast start inside the BOQ Generator: six ready-made bills you load in one tap and then edit, re-price and total like any BOQ you built by hand. Two of them are priced from the dated Pakistan rate table (2026-11-12) — the 5-Marla House (PK) and the Boundary Wall — and the other four are legacy templates that still carry placeholder demo rates from an older version: PCC at Rs 85/m³, RCC at Rs 150/m³ and brickwork at Rs 110/m³, roughly a hundred times below market. The gallery labels those four \"Legacy demo rates — not market rates\" for exactly that reason. A template is a starting point, never a tender price: load it, replace every rate with your supplier's rate or the current PK table, check the quantities against your drawings, then run the BOQ's own contingency and tax chain on it.",
    formulas: [
      {
        formula: "Template sample total = Σ (quantity × rate) over its lines",
        variables:
          "The total shown on each template card is the plain sum of its lines, before contingency and tax — the BOQ adds those after you load it.",
        note: "Loading a template fills the BOQ Items view with its lines; nothing is locked — every description, quantity and rate stays editable.",
      },
      {
        formula: "Grand total = (sample total + contingency) × (1 + tax %) — via the BOQ chain",
        variables:
          "Contingency defaults to 5% and tax to 18% (Pakistan Sales Tax) once the template is loaded. The chain is subtotal → contingency → taxable → tax → grand total.",
      },
      {
        formula: "PK template rates (dated 2026-11-12, indicative): excavation PKR 450/m³; PCC 1:4:8 PKR 14,500/m³; RCC 1:2:4 PKR 28,500/m³; steel PKR 270/kg; brickwork 9 in PKR 24,500/m³; plaster 12 mm PKR 320/m²; paint PKR 180/m²",
        variables:
          "Steel at PKR 270/kg is the midpoint of the verified Oct–Nov 2026 branded Grade 60 range (255–277/kg). Confirm every rate with your supplier before tendering.",
        note: "Legacy templates use none of these — their rates are placeholders (PCC 85, RCC 150, brickwork 110) and must be replaced line by line.",
      },
    ],
    tables: [
      {
        title: "The six templates",
        headers: ["Template", "Lines", "Rates"],
        rows: [
          ["5-Marla House (PK)", "6", "Dated PK table (2026-11-12)"],
          ["Boundary Wall", "5", "Dated PK table (2026-11-12)"],
          ["Residential Building", "8", "Legacy demo rates — re-price"],
          ["Road Project", "7", "Legacy demo rates — re-price"],
          ["Retaining Structure", "5", "Legacy demo rates — re-price"],
          ["Drainage / Sewer Project", "5", "Legacy demo rates — re-price"],
        ],
      },
      {
        title: "5-Marla House (PK) template — the six lines",
        headers: ["Item", "Qty", "Rate (PKR)"],
        rows: [
          ["Excavation in foundation trenches", "42 m³", "450 / m³"],
          ["PCC 1:4:8 in foundation", "4.5 m³", "14,500 / m³"],
          ["RCC 1:2:4 in foundations, beams and slab", "38 m³", "28,500 / m³"],
          ["Steel reinforcement, deformed bars", "3,800 kg", "270 / kg"],
          ["Brickwork 9 in, cement mortar 1:4", "52 m³", "24,500 / m³"],
          ["Plaster 12 mm, cement mortar 1:6", "620 m²", "320 / m²"],
        ],
      },
      {
        title: "Legacy demo rates vs market (why the label matters)",
        headers: ["Item", "Legacy template rate", "PK table rate"],
        rows: [
          ["PCC", "Rs 85 / m³", "PKR 14,500 / m³"],
          ["RCC", "Rs 150 / m³", "PKR 28,500 / m³"],
          ["Brickwork", "Rs 110 / m³", "PKR 24,500 / m³"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — load the 5-Marla House (PK) template, then total it",
      inputs:
        "Template lines as in the table above (PK rates, 2026-11-12). After loading, contingency 5% and tax 18% (the BOQ defaults).",
      steps: [
        "Sample total = 42 × 450 + 4.5 × 14,500 + 38 × 28,500 + 3,800 × 270 + 52 × 24,500 + 620 × 320 = 18,900 + 65,250 + 1,083,000 + 1,026,000 + 1,274,000 + 198,400 = PKR 3,665,550.",
        "Contingency 5% = PKR 183,277.50; taxable = PKR 3,848,827.50.",
        "Tax 18% = PKR 692,788.95; grand total = PKR 4,541,616.45.",
        "For comparison, the legacy Residential Building template totals only 37,275 in its own demo-rate units → 39,138.75 with 5% contingency → 46,183.73 with 18% tax. The number looks small because its rates are placeholders, not because the building is cheap — that is the trap the \"legacy\" label warns about.",
      ],
      result:
        "The 5-Marla House (PK) template prices at PKR 3,665,550 before contingency and tax, PKR 4,541,616.45 after 5% contingency and 18% tax — at dated PK rates. Re-price every line from the current table or your supplier before you tender on it, and never tender on a legacy template without replacing its rates.",
    },
    related: [
      { id: "boq", title: "Professional BOQ Generator Tool", desc: "The BOQ builder the templates load into — divisions, Nos × L × W × D measurement, wastage, contingency and tax." },
      { id: "measurement-sheet", title: "Measurement Sheet Calculator", desc: "Nos × L × W × D measurement rows that feed straight into the BOQ." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "Material quantities per sq ft that can be sent to the BOQ as priced lines." },
      { id: "cost-summary", title: "Construction Cost Summary Sheet", desc: "The same subtotal → contingency → tax chain, summarised by grey, finishing and labour." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
    ],
  },

  "cost-guide-pakistan": {
    id: "cost-guide-pakistan",
    intro:
      "This is the cost guide for building a house in Pakistan: city-wise rate bands per square foot of covered area, by finish level, from which any plot size and floor count can be priced. The rates are 2026 PKR/sq ft bands dated 2026-11-12, labelled indicative — they come from builder-published 2026 market ranges for Lahore, Islamabad and Karachi, not from a quotation, and they must be confirmed with your contractor before you budget on them. Two choices move the answer more than the city does: the marla standard (the revenue marla of 272.25 sq ft versus the society marla of 225 sq ft changes the same 5-marla plot by about 21%) and the number of floors (each floor adds 75% of the plot area to the covered area). The page opens on its defaults — 5 marla, revenue marla, Lahore, standard finish, G+1 — and the guide below is built on those defaults so you can check the arithmetic yourself.",
    formulas: [
      {
        formula: "Plot sq ft = plot area × marla standard (272.25 revenue / 225 society); 1 kanal = 20 marla; 1 sq yd = 9 sq ft",
        variables:
          "The marla toggle is the single biggest lever on the page: 5 marla is 1,361.25 sq ft under the revenue standard and 1,125 sq ft under the society standard.",
        note: "The same toggle exists on the Marla Converter — use it there first if your deed is written in kanal–marla–sarsai.",
      },
      {
        formula: "Covered area = plot sq ft × 0.75 × floors (+ plot sq ft × 0.75 if basement)",
        variables:
          "0.75 is the coverage factor — a floor covers 75% of the plot, the rest being setbacks and open space. Floors: 1 = ground only, 2 = G+1, up to 5 (G+4).",
        note: "The basement adds one more 75%-coverage floor. The quick estimator and the AI assistant do NOT apply the 0.75 factor, so their totals for the same plot will differ — that is by design, not an error.",
      },
      {
        formula: "Cost = covered area × rate band (min–max); average = (min + max) ÷ 2",
        variables:
          "Rate bands are PKR per sq ft of covered area, by city and tier. Grey is the structure alone; standard, premium and luxury are turnkey totals.",
      },
      {
        formula: "Grey ≈ 55% and finishing ≈ 45% of a turnkey total (grey tier = 100% grey)",
        variables:
          "A labelled split, not a measured one — it tells you roughly how much of the total is structure and how much is finishing.",
        note: "Derived materials on covered area (thumb rules): cement 0.4 bags/sq ft, steel 3.5 kg/sq ft, bricks 10/sq ft, sand 1.5 cft/sq ft, aggregate 1.35 cft/sq ft.",
      },
    ],
    tables: [
      {
        title: "Rate bands, PKR per sq ft of covered area (2026, indicative — dated 2026-11-12)",
        headers: ["City", "Grey", "Standard", "Premium", "Luxury"],
        rows: [
          ["Lahore", "2,800–3,400", "3,800–4,500", "5,700–6,400", "7,000–8,500"],
          ["Islamabad", "3,000–3,600", "4,200–4,900", "6,000–6,800", "7,400–8,800"],
          ["Karachi", "2,900–3,500", "4,000–4,700", "5,800–6,600", "7,200–8,600"],
          ["Faisalabad", "2,500–3,000", "3,500–4,100", "5,200–5,900", "6,500–7,800"],
          ["Multan", "2,500–3,000", "3,500–4,100", "5,200–5,900", "6,500–7,800"],
          ["Other", "2,500–3,000", "3,500–4,100", "5,200–5,900", "6,500–7,800"],
        ],
      },
      {
        title: "What each tier means",
        headers: ["Tier", "Includes"],
        rows: [
          ["Grey", "Structure only — foundation, brickwork, RCC, plaster. No finishing."],
          ["Standard", "Grey + basic finishing — tiles, paint, standard fittings."],
          ["Premium", "Grey + better finishing — porcelain, woodwork, better fittings."],
          ["Luxury", "Grey + high-end finishing — imported fittings, full turnkey."],
        ],
      },
      {
        title: "The marla toggle — same plot, two answers",
        headers: ["Standard", "5 marla plot", "Covered (G+1)", "Standard cost, Lahore"],
        rows: [
          ["Society (225 sq ft)", "1,125 sq ft", "1,687.50 sq ft", "PKR 6,412,500 – 7,593,750"],
          ["Revenue (272.25 sq ft)", "1,361.25 sq ft", "2,041.88 sq ft", "PKR 7,759,125 – 9,188,438"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — the page defaults: 5 marla, revenue standard, Lahore, standard, G+1",
      inputs:
        "5 marla × 272.25 = 1,361.25 sq ft plot; Lahore standard band PKR 3,800–4,500/sq ft; 2 floors (G+1), no basement.",
      steps: [
        "Covered area = 1,361.25 × 0.75 × 2 = 2,041.88 sq ft.",
        "Cost = 2,041.88 × 3,800 to 2,041.88 × 4,500 = PKR 7,759,125 to PKR 9,188,438 (average PKR 8,473,782).",
        "Grey share 55% = PKR 4,267,519 to PKR 5,053,641; finishing 45% = PKR 3,491,606 to PKR 4,134,797.",
        "Thumb-rule materials on the same covered area: cement 2,041.88 × 0.4 = 817 bags; steel 2,041.88 × 3.5 = 7,147 kg; bricks 2,041.88 × 10 = 20,419; sand 3,063 cft; aggregate 2,757 cft.",
        "Under the society marla the same choices give 1,687.50 sq ft covered and PKR 6,412,500–7,593,750 — about 21% less, because the plot itself is 21% smaller.",
      ],
      result:
        "PKR 7,759,125–9,188,438 for a 5-marla (revenue) G+1 standard house in Lahore, at 2026 indicative rates. The rate bands are the guide — your contractor's rate for your street is the price.",
    },
    related: [
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "marla-converter", title: "Marla / Kanal Area Converter", desc: "Convert the plot between marla, kanal, sq ft, sq yd, m², acres and murabba, Punjab and KPK standards." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "Materials per sq ft of built-up area — the same thumb rules, priced line by line at PK rates." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities from your drawings instead of the 0.75 coverage thumb rule." },
      { id: "quick-estimation", title: "Quick Rough Cost Estimation", desc: "A first-pass budget and timeline from a few inputs — note it does not apply the 0.75 coverage factor." },
    ],
  },

  "cost-summary": {
    id: "cost-summary",
    intro:
      "The Cost Summary is the one-page version of a project budget: every cost entered as quantity × rate lines in three buckets — grey structure, finishing and labour — then rolled up through overhead, contingency and tax to a grand total and a cost per square foot. It is the sheet you hand a client who wants the headline number and the three buckets that make it, without the hundred-line BOQ behind it. Three rules matter. First, the tax base is subtotal + contingency, not the subtotal alone and not the total with overhead — the same base the BOQ uses, so the two tools agree on the same 18%. Second, tax defaults to 0 and is never silently added: you set the rate and the label (Sales Tax PK, GST IN, VAT UAE) yourself. Third, the example lines the sheet opens with are labelled examples — lump-sum figures, not measured quantities — so replace them with your own measured lines before you quote the total.",
    formulas: [
      {
        formula: "Line amount = quantity × rate; bucket total = Σ line amounts in that bucket",
        variables:
          "Buckets: grey, finish, labour. A line is one cost — \"Foundation\", \"Flooring\", \"Skilled labour\" — with its own qty, unit and rate.",
      },
      {
        formula: "Subtotal = grey + finish + labour",
        variables: "The sum of the three buckets, before any markup.",
      },
      {
        formula: "Overhead = subtotal × overhead % (default 15%, usual range 5–25%); contingency = subtotal × contingency % (default 5%, usual range 2–10%)",
        variables:
          "Overhead covers profit, site office and supervision. Both percentages are editable; the sheet rejects overhead outside 0–50% and contingency outside 0–25%.",
      },
      {
        formula: "Tax = (subtotal + contingency) × tax %; grand total = subtotal + overhead + contingency + tax",
        variables:
          "Tax defaults to 0% — set it explicitly. Note the tax base excludes overhead: on the worked example below, 18% tax is PKR 1,077,300, not 18% of the whole subtotal-plus-overhead.",
      },
      {
        formula: "Cost per sq ft = grand total ÷ area (sq ft)",
        variables: "Area must be greater than 0. The same total on a bigger area is a smaller rate — always quote the two together.",
      },
    ],
    tables: [
      {
        title: "The example lines the sheet opens with (labelled examples — replace them)",
        headers: ["Bucket", "Line", "Amount (PKR)"],
        rows: [
          ["Grey", "Foundation", "450,000"],
          ["Grey", "Brickwork / walls", "800,000"],
          ["Grey", "RCC slabs", "1,200,000"],
          ["Grey", "Roof / misc grey", "600,000"],
          ["Finish", "Flooring", "500,000"],
          ["Finish", "Plaster / paint", "250,000"],
          ["Finish", "Doors / windows", "400,000"],
          ["Finish", "Fixtures", "300,000"],
          ["Labour", "Skilled labour", "800,000"],
          ["Labour", "Unskilled labour", "400,000"],
        ],
      },
      {
        title: "Defaults and allowed ranges",
        headers: ["Item", "Default", "Usual range", "Hard limit"],
        rows: [
          ["Overhead & profit", "15%", "5–25%", "0–50%"],
          ["Contingency", "5%", "2–10%", "0–25%"],
          ["Tax", "0% (set it yourself)", "Per contract", "0–50%"],
        ],
      },
      {
        title: "Where tax is charged",
        headers: ["Base", "Charged on"],
        rows: [
          ["Overhead", "Subtotal"],
          ["Contingency", "Subtotal"],
          ["Tax", "Subtotal + contingency (not overhead)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — the example lines on a 2,250 sq ft house",
      inputs:
        "The ten example lines above, area 2,250 sq ft, overhead 15%, contingency 5%, tax 0% first, then 18% (Sales Tax PK).",
      steps: [
        "Grey = 450,000 + 800,000 + 1,200,000 + 600,000 = PKR 3,050,000. Finish = 500,000 + 250,000 + 400,000 + 300,000 = PKR 1,450,000. Labour = 800,000 + 400,000 = PKR 1,200,000.",
        "Subtotal = 3,050,000 + 1,450,000 + 1,200,000 = PKR 5,700,000.",
        "Overhead 15% = PKR 855,000. Contingency 5% = PKR 285,000.",
        "Tax 0% → grand total = 5,700,000 + 855,000 + 285,000 = PKR 6,840,000; cost per sq ft = 6,840,000 ÷ 2,250 = PKR 3,040.",
        "Tax 18% on (5,700,000 + 285,000) = PKR 1,077,300 → grand total = PKR 7,917,300; cost per sq ft = PKR 3,518.80.",
      ],
      result:
        "PKR 6,840,000 without tax (PKR 3,040/sq ft) or PKR 7,917,300 with 18% tax (PKR 3,518.80/sq ft) — on the example lines. Replace the example lump sums with your measured lines and the same chain gives your project's number.",
    },
    related: [
      { id: "boq", title: "Professional BOQ Generator Tool", desc: "The full priced bill behind the summary — itemised rates and amounts you can export, print and share." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "Material quantities per sq ft that become the grey and finish lines of the summary." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities from your drawings to price into the summary lines." },
      { id: "labour-calculator", title: "Labour & Workforce Calculator", desc: "Labour days and daily burn from IS 7272 outputs — the labour bucket, worked out instead of guessed." },
    ],
  },

  "labour-calculator": {
    id: "labour-calculator",
    intro:
      "Labour is priced the same way materials are: an output rate per worker per day, a gang size, and a wage — and the standard that fixes the output rates is IS 7272 Part 1, which tabulates how much one worker produces in an 8-hour day for each trade. This calculator turns those constants into a programme: how many days each task takes, what the gang costs per day (the daily burn), what the task costs in total, and how long the whole job takes if the tasks run one after another (sequential) or all at once (parallel). Two details keep the numbers honest. First, costs are computed from the same rounded days that are displayed — the old code priced unrounded days, so displayed days × burn did not equal the displayed total. Second, unskilled-driven tasks such as excavation have no key worker, so the helpers are the workers whose output counts. Wages come from the dated rate table: a mason PKR 1,200/day and a helper PKR 600/day in Pakistan (indicative, Nov 2026) — edit them to your site's actual wages before you budget.",
    formulas: [
      {
        formula: "Daily output = key workers × output per key worker per day",
        variables:
          "Output per worker is the IS 7272 Pt 1 constant for the trade, per 8-hour day. For excavation (0 key workers) the helpers count instead: daily output = helpers × output per helper.",
        note: "A gang of 2 masons laying 1.25 m³ each produces 2.5 m³ a day — doubling the gang halves the days, but the daily burn doubles too.",
      },
      {
        formula: "Days = quantity ÷ daily output (rounded to 0.1 day)",
        variables: "Quantity in the task's unit (m³, m² or kg). Days are rounded to one decimal before any cost is computed.",
      },
      {
        formula: "Daily burn = key workers × mason wage + helpers × helper wage",
        variables:
          "PK wages (indicative, Nov 2026): mason PKR 1,200/day, helper PKR 600/day. Both are editable.",
        note: "Total cost = rounded days × daily burn. Cost with contingency = days with contingency × daily burn.",
      },
      {
        formula: "Days with contingency = days × (1 + contingency %)",
        variables:
          "Contingency is applied to the duration, and the cost follows the longer duration — it is not a separate percentage added to the money.",
      },
      {
        formula: "Sequential days = Σ days with contingency; parallel days = longest single task (with contingency)",
        variables:
          "Sequential is the honest total when one gang does everything in turn; parallel is the floor when every task has its own gang. Your real programme sits between the two.",
      },
    ],
    tables: [
      {
        title: "Output constants — IS 7272 Part 1 (per key worker, 8-hour day)",
        headers: ["Task", "Unit", "Output / worker / day", "Gang (key + helpers)"],
        rows: [
          ["Brickwork", "m³", "1.25", "2 masons + 3 helpers"],
          ["Excavation", "m³", "3.0", "0 + 4 helpers (helpers drive it)"],
          ["Plastering", "m²", "10", "1 mason + 1 helper"],
          ["Concreting", "m³", "4.0", "2 masons + 4 helpers"],
          ["Steel binding", "kg", "150", "1 bar bender + 1 helper"],
          ["Formwork", "m²", "8", "1 carpenter + 1 helper"],
          ["Painting", "m²", "40", "1 painter + 0 helpers"],
        ],
      },
      {
        title: "Wages used (PK, indicative — Nov 2026)",
        headers: ["Worker", "Wage / day"],
        rows: [
          ["Mason / skilled (key worker)", "PKR 1,200"],
          ["Helper / unskilled", "PKR 600"],
        ],
      },
      {
        title: "Reading the two totals",
        headers: ["Total", "Meaning"],
        rows: [
          ["Sequential days", "One gang, tasks in turn — the programme if you cannot run tasks together"],
          ["Parallel days", "Every task with its own gang — the shortest possible programme"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 50 m³ of brickwork plus 600 m² of plastering, 10% contingency",
      inputs:
        "Brickwork 50 m³ (2 masons + 3 helpers, 1.25 m³/mason-day); plastering 600 m² (1 mason + 1 helper, 10 m²/mason-day); mason PKR 1,200/day, helper PKR 600/day; contingency 10%.",
      steps: [
        "Brickwork: daily output = 2 × 1.25 = 2.5 m³/day. Days = 50 ÷ 2.5 = 20.0 days. Daily burn = 2 × 1,200 + 3 × 600 = PKR 4,200. Total = 20 × 4,200 = PKR 84,000.",
        "Plastering: daily output = 1 × 10 = 10 m²/day. Days = 600 ÷ 10 = 60.0 days. Daily burn = 1 × 1,200 + 1 × 600 = PKR 1,800. Total = 60 × 1,800 = PKR 108,000.",
        "With 10% contingency: brickwork 22.0 days (PKR 92,400), plastering 66.0 days (PKR 118,800).",
        "Sequential = 22 + 66 = 88 days; parallel = the longer task = 66 days. Total cost = 84,000 + 108,000 = PKR 192,000, or PKR 211,200 with contingency.",
      ],
      result:
        "88 days back-to-back (66 days if both gangs work at once) and PKR 192,000 of labour — PKR 211,200 with 10% contingency. The plastering, not the brickwork, sets the programme: it takes three times as long.",
    },
    related: [
      { id: "cost-summary", title: "Construction Cost Summary Sheet", desc: "The labour bucket of the project budget — put the total cost from here into the summary." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "The measured quantities (m³ of brickwork, m² of plaster) that the labour gangs work from." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "boq", title: "Professional BOQ Generator Tool", desc: "Price the labour as BOQ lines — quantity, rate and amount — alongside the materials." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "The materials the gangs will use, per sq ft of built-up area." },
    ],
  },

  "marla-converter": {
    id: "marla-converter",
    intro:
      "In Pakistan, India and Bangladesh, land is still bought and sold in marla and kanal — but a marla is not one fixed size. Under the Punjab revenue standard it is 272.25 sq ft; under the society standard used by most housing societies (DHA, Bahria, Islamabad, KPK) it is 225 sq ft. The same \"5 marla\" plot is 1,361.25 sq ft on one standard and 1,125 sq ft on the other — a 21% difference that has caused more disputes than any other number in a property deal. This converter switches between the two standards and converts between all seven units — sq ft, sq yd, m², marla, kanal, acre and murabba — from a single input. It also takes a plot's length × width in feet, and a fard reading written as Kanal – Marla – Sarsai (1 marla = 9 sarsai). Before you convert, ask which standard the deed or the society uses: the converter cannot know, and guessing wrong moves every downstream cost with it.",
    formulas: [
      {
        formula: "1 marla = 272.25 sq ft (Punjab revenue) or 225 sq ft (KPK / society)",
        variables:
          "The toggle on the page switches the whole conversion. 1 marla = 30.25 sq yd (Punjab) or 25 sq yd (society); ≈ 25.29 m² (Punjab) or ≈ 20.90 m² (society).",
        note: "Punjab Land Revenue Act 1887 fixes the revenue marla at 272.25 sq ft (1 karam = 5.5 ft; 1 marla = 9 sarsai). The 225 sq ft marla is a society convention, not a revenue one.",
      },
      {
        formula: "1 kanal = 20 marla; 1 acre = 43,560 sq ft; 1 murabba = 25 acres = 1,089,000 sq ft",
        variables:
          "1 kanal = 5,445 sq ft (Punjab) or 4,500 sq ft (society). 1 acre = 8 kanal (Punjab) or 9.68 kanal (society) — the acre itself never changes, only the kanal does.",
      },
      {
        formula: "Area (sq ft) = length (ft) × width (ft); marla = sq ft ÷ sq ft per marla",
        variables: "The plot-dimension box does exactly this: enter L × W in feet and it fills the converter with the sq ft.",
      },
      {
        formula: "Fard to sq ft = (kanal × 20 + marla) × sq ft per marla + sarsai × (sq ft per marla ÷ 9)",
        variables:
          "1 sarsai = 1⁄9 marla = 30.25 sq ft (Punjab) or 25 sq ft (society). A fard reading of 1 Kanal 2 Marla 3 Sarsai (Punjab) is 6,080.25 sq ft.",
      },
      {
        formula: "1 m² = 10.7639 sq ft; 1 sq yd = 9 sq ft",
        variables: "The metric and imperial bridges — the same 10.7639 the area tools use.",
      },
    ],
    tables: [
      {
        title: "One unit in every other unit — Punjab standard (272.25 sq ft / marla)",
        headers: ["Unit", "Sq ft", "Sq yd", "m²", "Marla", "Kanal"],
        rows: [
          ["1 Marla", "272.25", "30.25", "25.29", "1", "0.05"],
          ["1 Kanal (20 marla)", "5,445", "605", "505.85", "20", "1"],
          ["1 Acre (8 kanal)", "43,560", "4,840", "4,046.86", "160", "8"],
          ["1 Murabba (25 acres)", "1,089,000", "121,000", "101,171.4", "4,000", "200"],
        ],
      },
      {
        title: "Common plot sizes — both standards",
        headers: ["Plot", "Punjab (sq ft)", "Society (sq ft)"],
        rows: [
          ["3 Marla", "816.75", "675"],
          ["5 Marla", "1,361.25", "1,125"],
          ["7 Marla", "1,905.75", "1,575"],
          ["10 Marla", "2,722.50", "2,250"],
          ["1 Kanal", "5,445", "4,500"],
          ["2 Kanal", "10,890", "9,000"],
        ],
      },
      {
        title: "The fard units",
        headers: ["Unit", "Of a marla", "Punjab (sq ft)", "Society (sq ft)"],
        rows: [
          ["1 Sarsai", "1⁄9", "30.25", "25"],
          ["1 Marla", "1", "272.25", "225"],
          ["1 Kanal", "20 marla", "5,445", "4,500"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 5 marla, and a fard reading",
      inputs:
        "Input 5 Marla, Punjab standard first, then society standard; then a fard reading of 1 Kanal, 2 Marla, 3 Sarsai (Punjab).",
      steps: [
        "5 marla (Punjab) = 5 × 272.25 = 1,361.25 sq ft = 1,361.25 ÷ 9 = 151.25 sq yd = 1,361.25 ÷ 10.7639 = 126.46 m²; kanal = 5 ÷ 20 = 0.25.",
        "5 marla (society) = 5 × 225 = 1,125 sq ft = 125 sq yd = 104.52 m² — 236.25 sq ft smaller than the same plot on the Punjab standard.",
        "Fard 1 Kanal 2 Marla 3 Sarsai (Punjab) = (1 × 20 + 2) × 272.25 + 3 × (272.25 ÷ 9) = 22 × 272.25 + 3 × 30.25 = 5,989.50 + 90.75 = 6,080.25 sq ft.",
        "The same fard on the society standard would be 22 × 225 + 3 × 25 = 5,025 sq ft — over 1,000 sq ft less, which is why the standard must be agreed before the price is.",
      ],
      result:
        "5 marla is 1,361.25 sq ft (Punjab) or 1,125 sq ft (society); a 1 Kanal 2 Marla 3 Sarsai fard is 6,080.25 sq ft (Punjab). Always state the standard with the number — \"5 marla\" alone is ambiguous by 21%.",
    },
    related: [
      { id: "area-space-calculator", title: "Plot & Property Area Calculator", desc: "Area and perimeter of shapes, irregular plots by diagonal, and the RERA property-area chain." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Price the house once you know the plot — grey structure and finishing cost in PKR." },
      { id: "cost-guide-pakistan", title: "Pakistan Construction Cost Guide — City Rates & Tiers", desc: "City-wise cost per sq ft by finish level — and the marla toggle that moves the answer 21%." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Cost Calculator", desc: "City-wise house construction cost in PKR by finish level — Lahore, Karachi, Islamabad, Faisalabad and Multan." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Take the plot into measured quantities — excavation, PCC, footings, brickwork and plaster." },
    ],
  },

  "master-quantity": {
    id: "master-quantity",
    intro:
      "The Master Quantity Estimator is the measured takeoff for a whole project — not thumb rules per square foot, but volumes and areas worked out from the dimensions you enter: excavation, PCC, trapezoidal footings, brickwork, slab effective depth and plaster, each with its material split. All computation happens in metric internally; imperial inputs are converted on entry (feet × 0.3048, sq ft × 0.092903, cu ft × 0.0283168), because the old version only changed the labels and multiplied square feet by metres. The house formulas apply throughout: wet concrete × 1.54 to dry volume, wet mortar × 1.33 to dry volume, one 50 kg cement bag = 0.0347 m³ (bags rounded up), bricks = wall volume ÷ brick-with-mortar volume, and the slab's effective depth d = D − (cover + φ/2). Plaster follows IS 1200: openings under 0.5 m² are not deducted, 0.5–3 m² deduct one face, over 3 m² deduct both faces plus jambs.",
    formulas: [
      {
        formula: "Excavation: bank volume = L × W × D; loose volume = bank × (1 + swell %)",
        variables:
          "Swell defaults to 20% — dug soil bulks up, so the loose volume the trucks carry is bigger than the hole. Shrinkage on re-compaction is the reverse correction (see Earthworks).",
      },
      {
        formula: "PCC 1:2:4: wet = L × W × D; dry = wet × 1.54; cement bags = ⌈dry × 1⁄7 ÷ 0.0347⌉",
        variables:
          "1:2:4 has 7 parts, so cement is 1⁄7 of the dry volume. Bags are always rounded UP — you cannot buy part of a bag.",
      },
      {
        formula: "Trapezoidal footing: V = L × W × D (rectangular base) + h⁄3 × (A₁ + A₂ + √(A₁ × A₂)) (sloped frustum)",
        variables:
          "A₁ = base area, A₂ = top area, h = height of the sloped part. The frustum formula is exact for a truncated pyramid.",
        note: "The rectangular base and the sloped part are computed separately and added — the same rule the footing guide states.",
      },
      {
        formula: "Brickwork: N = V_wall ÷ (0.24 × 0.12 × 0.085); with wastage N × (1 + wastage %)",
        variables:
          "V_wall = length × height × thickness. One brick with its 10 mm joint is 0.24 × 0.12 × 0.085 m = 0.002448 m³. Wastage defaults to 5%.",
      },
      {
        formula: "Slab effective depth: d = D − (cover + φ/2), all in mm",
        variables:
          "D = total slab thickness, cover = clear cover, φ = diameter of the main bar. A 150 mm slab with 25 mm cover and 12 mm bars has d = 119 mm.",
        note: "Effective depth is what the steel actually works with — it is the lever arm of the section, not the slab thickness.",
      },
      {
        formula: "Plaster: net = gross − Σ(opening area × faces); wet = net × thickness; dry = wet × 1.33; cement bags = ⌈dry × cement parts ÷ total parts ÷ 0.0347⌉",
        variables:
          "Faces per opening follow IS 1200: 0 below 0.5 m², 1 face at 0.5–3 m², 2 faces above 3 m². Sand = dry × sand parts ÷ total parts.",
      },
    ],
    tables: [
      {
        title: "Unit conversions on entry (imperial → metric)",
        headers: ["From", "Multiply by", "To"],
        rows: [
          ["Feet", "0.3048", "Metres"],
          ["Sq ft", "0.092903", "m²"],
          ["Cu ft", "0.0283168", "m³"],
        ],
      },
      {
        title: "The dry-volume factors",
        headers: ["Material", "Factor", "Why"],
        rows: [
          ["Concrete", "Wet × 1.54", "Dry ingredients contain voids that water fills"],
          ["Mortar / plaster", "Wet × 1.33", "Same voids, smaller aggregate"],
          ["Cement bag (50 kg)", "0.0347 m³", "Bag volume — divide cement volume by it, round up"],
        ],
      },
      {
        title: "Plaster opening deductions (IS 1200)",
        headers: ["Opening area", "Faces deducted"],
        rows: [
          ["Under 0.5 m²", "0 — no deduction"],
          ["0.5–3 m²", "1 face"],
          ["Over 3 m²", "2 faces + jambs, soffits and sills"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one footing bay, one wall and its plaster",
      inputs:
        "Excavation 10 × 5 × 1.5 m (swell 20%); PCC 10 × 5 × 0.1 m; 4 footings 1.5 × 1.5 × 0.3 m base, 0.6 × 0.6 m top, 0.3 m slope; wall 10 × 3 × 0.23 m (5% wastage); slab 150 mm, cover 25 mm, 12 mm bars; plaster 100 m² gross with two 10 m² openings at one face, 12 mm thick, 1:4 mix.",
      steps: [
        "Excavation: bank = 10 × 5 × 1.5 = 75 m³; loose = 75 × 1.20 = 90 m³.",
        "PCC: wet = 10 × 5 × 0.1 = 5 m³; dry = 5 × 1.54 = 7.7 m³; cement = 7.7 × 1⁄7 = 1.1 m³ ÷ 0.0347 = 31.7 → 32 bags.",
        "One footing: rectangular base 1.5 × 1.5 × 0.3 = 0.675 m³; frustum 0.3 ÷ 3 × (2.25 + 0.36 + √2.25 × 0.36 = 0.9) = 0.351 m³; single = 1.026 m³. Four footings: wet 4.10 m³, dry 6.32 m³.",
        "Brickwork: wall volume = 10 × 3 × 0.23 = 6.9 m³; bricks = 6.9 ÷ 0.002448 = 2,819; with 5% wastage 2,960 bricks.",
        "Slab effective depth: d = 150 − (25 + 12 ÷ 2) = 119 mm.",
        "Plaster: deduction = 2 × 10 × 1 face = 20 m²; net = 80 m²; wet = 80 × 0.012 = 0.96 m³; dry = 0.96 × 1.33 = 1.28 m³; cement = 1.28 × 1⁄5 = 0.26 m³ ÷ 0.0347 = 7.4 → 8 bags; sand = 1.28 × 4⁄5 = 1.02 m³.",
      ],
      result:
        "75 m³ bank (90 m³ loose) excavation, 32 bags of cement for the PCC, 4.10 m³ wet concrete for four footings, 2,960 bricks for the wall, a 119 mm effective depth in the slab, and 8 bags of cement with 1.02 m³ of sand for 80 m² of net plaster — every figure from the engine, not a thumb rule.",
    },
    related: [
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "The same materials by thumb rule per sq ft — use it when you have an area but no drawings." },
      { id: "measurement-sheet", title: "Measurement Sheet Calculator", desc: "Nos × L × W × D measurement rows for the same items, in IS 1200 style." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall — with openings, wastage and city rates." },
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths and bar weights for the steel in the footings and slab." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
    ],
  },

  "material-takeoff": {
    id: "material-takeoff",
    intro:
      "A material takeoff turns a built-up area into a shopping list: how many bags of cement, how much sand and aggregate, how many bricks, how many kilos of steel, how many boxes of tiles and how many litres of paint — each with wastage added and priced at the dated rate table. The quantities are thumb rules per square foot of built-up area, and the guide states the assumption behind each one, because a thumb rule is only safe when you know what it assumes: the brick rule (10 per sq ft) assumes 9-inch outer walls with 4½-inch inner walls and a 230 × 110 × 75 mm brick with a 10 mm joint; the steel rule (3.5 kg/sq ft) is the low end of the 3.5–4.0 range; the sand total (1.5 cft/sq ft) splits 0.5 RCC / 0.15 PCC / 0.85 plaster. Rates come from the dated PK table (2026-11-12) and are never hardcoded in the tool: cement PKR 1,450/bag, steel PKR 270/kg, bricks PKR 23,355 per 1,000 (PBS Aug 2026, Lahore), sand and crush PKR 90/cft, tiles PKR 1,200/box, paint PKR 300/L. If a rate is unknown for your region, the cost shows as unknown — never zero.",
    formulas: [
      {
        formula: "Cement: RCC 0.25 + PCC 0.05 + plaster 0.10 = 0.40 bags per sq ft",
        variables: "Three separate lines, because the three concretes and mortars are ordered and checked separately.",
      },
      {
        formula: "Sand: RCC 0.5 + PCC 0.15 + plaster 0.85 = 1.5 cft per sq ft; aggregate: RCC 1.05 + PCC 0.3 = 1.35 cft per sq ft",
        variables:
          "The sand default was corrected from 1.15 cft/sq ft, which sat below the published 1.2–1.8 range — the split now totals 1.5.",
      },
      {
        formula: "Bricks = built-up area × 10 per sq ft; steel = built-up area × 3.5 kg per sq ft (range 3.5–4.0)",
        variables:
          "The brick rule assumes 9 in outer + 4½ in inner walls. Premium finish multiplies steel and bricks by 1.0 (structure unchanged); luxury multiplies them by 1.1.",
      },
      {
        formula: "Tiles: boxes = ⌈built-up area × 1.1 × finish multiplier ÷ 15.5 sq ft per box⌉",
        variables:
          "One box is four 600 × 600 mm tiles covering 15.5 sq ft. The 1.1× already includes 10% cutting wastage — the wastage column is 0 for tiles, because applying it again would double-count it.",
        note: "Finish multipliers: standard 1.0, premium 1.2, luxury 1.5. The old code multiplied sq ft by the per-box rate — a 2,000 sq ft house priced at nearly PKR 2.9 million of tiles; the box conversion fixes that.",
      },
      {
        formula: "Paint = built-up area × 0.17 L per sq ft (0.12 primer + 0.05 finish) × finish multiplier",
        variables: "Wastage is added per material on top of the base quantity — see the table.",
      },
      {
        formula: "Quantity to order = quantity × (1 + wastage %); cost = quantity to order × rate",
        variables: "A null rate gives a null cost (shown as —), never 0.",
      },
    ],
    tables: [
      {
        title: "Thumb rules per sq ft of built-up area (standard finish)",
        headers: ["Material", "Rule", "Unit"],
        rows: [
          ["Cement — RCC", "0.25", "bags / sq ft"],
          ["Cement — PCC", "0.05", "bags / sq ft"],
          ["Cement — Plaster", "0.10", "bags / sq ft"],
          ["Sand — RCC / PCC / Plaster", "0.5 / 0.15 / 0.85", "cft / sq ft"],
          ["Aggregate — RCC / PCC", "1.05 / 0.3", "cft / sq ft"],
          ["Bricks", "10", "nos / sq ft"],
          ["Steel / Rebar", "3.5 (range 3.5–4.0)", "kg / sq ft"],
          ["Floor tiles", "1.1× area ÷ 15.5", "boxes"],
          ["Paint", "0.17 (0.12 primer + 0.05 finish)", "L / sq ft"],
        ],
      },
      {
        title: "Wastage added per material",
        headers: ["Material", "Wastage"],
        rows: [
          ["Cement", "2%"],
          ["Steel", "3%"],
          ["Bricks", "5%"],
          ["Tiles", "10% — already inside the 1.1×, not added again"],
          ["Paint", "5%"],
          ["Sand", "3%"],
          ["Aggregate", "3%"],
        ],
      },
      {
        title: "PK rates priced from (dated 2026-11-12, indicative)",
        headers: ["Material", "Rate"],
        rows: [
          ["Cement", "PKR 1,450 / bag"],
          ["Steel", "PKR 270 / kg"],
          ["Bricks", "PKR 23,355 / 1,000 (PBS Aug 2026, Lahore)"],
          ["Sand", "PKR 90 / cft"],
          ["Crush (aggregate)", "PKR 90 / cft"],
          ["Tiles", "PKR 1,200 / box"],
          ["Paint", "PKR 300 / L"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 2,250 sq ft built-up area, standard finish, PK rates",
      inputs:
        "Built-up area 2,250 sq ft, 2 floors, standard finish, PK rate table (2026-11-12). Quantities below are before wastage; costs include wastage.",
      steps: [
        "Cement: RCC 2,250 × 0.25 = 562.5 bags; PCC 112.5; plaster 225 — total 900 bags (918 with 2% wastage).",
        "Sand: RCC 1,125 cft; PCC 337.5; plaster 1,912.5 — total 3,375 cft. Aggregate: RCC 2,362.5 cft; PCC 675 — total 3,037.5 cft.",
        "Bricks: 2,250 × 10 = 22,500 (23,625 with 5% wastage). Steel: 2,250 × 3.5 = 7,875 kg (8,111.25 kg with 3% wastage).",
        "Tiles: ⌈2,250 × 1.1 ÷ 15.5⌉ = ⌈159.68⌉ = 160 boxes. Paint: 2,250 × 0.17 = 382.5 L.",
        "Priced at PK rates (with wastage): cement PKR 1,331,101; sand PKR 312,863; aggregate PKR 281,577; bricks PKR 551,762; steel PKR 2,190,038; tiles PKR 192,000; paint PKR 120,488.",
      ],
      result:
        "900 bags of cement, 7,875 kg of steel, 22,500 bricks, 3,375 cft of sand and 3,038 cft of aggregate — PKR 4,979,829 in total at dated PK rates, wastage included. These are thumb-rule quantities: measure from drawings (Master Quantity) when the order is real.",
    },
    related: [
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities from your drawings instead of per-sq-ft thumb rules." },
      { id: "measurement-sheet", title: "Measurement Sheet Calculator", desc: "Nos × L × W × D measurement rows for the same items, in IS 1200 style." },
      { id: "boq", title: "Professional BOQ Generator Tool", desc: "Send the takeoff lines into a priced BOQ — the tool's own \"Send to BOQ\" handoff." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR, from plot size and finish quality." },
      { id: "metal-weight", title: "Steel & Metal Weight Calculator", desc: "Weight of the steel itself — bars, pipes, plates and sections — from dimensions and density." },
    ],
  },

  "measurement-sheet": {
    id: "measurement-sheet",
    intro:
      "A measurement sheet is where quantities are measured before they are priced: rows of Nos × Length × Width × Depth, one row per item, in the IS 1200 tradition that the BOQ and the rate analysis then build on. Each row knows what kind of quantity it is — volume needs three dimensions, area needs two, length needs one — and the sheet refuses to invent the rest: a row with only a length given for a volume returns no quantity at all and is flagged incomplete, because the old code treated a missing dimension as 1 and a 10 m length silently became 10 m³. The unit follows the kind (m³ or cu ft for volume, m² or sq ft for area) and the amount is quantity × rate, with a missing rate leaving the amount blank rather than zero. The sheet is also the feeder for the BOQ: measured rows can be sent across as BOQ lines. Plaster rows use the same IS 1200 opening rule as the Master Quantity tool — under 0.5 m² no deduction, 0.5–3 m² one face, over 3 m² both faces plus jambs.",
    formulas: [
      {
        formula: "Volume quantity = Nos × L × W × D; area quantity = Nos × L × W; length quantity = Nos × L",
        variables:
          "Nos defaults to 1 when not given. Only dimensions actually entered are multiplied; a dimension left blank is missing, not 1.",
        note: "Quantities are rounded to 2 decimals. A row is incomplete until it has enough dimensions: 3 for volume, 2 for area, 1 for length.",
      },
      {
        formula: "Amount = quantity × rate",
        variables:
          "A null rate gives a null amount — the row is unpriced, not free. Rates are per the row's unit (per m³, per m², per m).",
      },
      {
        formula: "Plaster deduction faces (IS 1200): under 0.5 m² → 0; 0.5–3 m² → 1 face; over 3 m² → 2 faces + jambs",
        variables:
          "The same rule the Master Quantity and Area tools apply — the deduction is per opening, by its own area.",
        note: "A row with a negative dimension or any value over 10,000 is rejected with an error, not computed.",
      },
    ],
    tables: [
      {
        title: "Dimensions needed by measurement kind",
        headers: ["Kind", "Dimensions needed", "Unit (metric / imperial)"],
        rows: [
          ["Volume", "3 — L, W and D", "m³ / cu ft"],
          ["Area", "2 — L and W", "m² / sq ft"],
          ["Length", "1 — L", "m / ft"],
        ],
      },
      {
        title: "What an incomplete row does",
        headers: ["Situation", "Result"],
        rows: [
          ["Volume row, only L given", "Quantity null, flagged: \"Incomplete — 3 dimension(s) needed for volume, only 1 given.\""],
          ["Area row, only L given", "Quantity null, flagged incomplete"],
          ["Any row, rate missing", "Quantity computed, amount blank (unpriced)"],
          ["Any row, negative or > 10,000", "Rejected with an error"],
        ],
      },
      {
        title: "Typical rows and their units",
        headers: ["Item", "Kind", "Example row"],
        rows: [
          ["Footing concrete", "Volume", "4 nos × 1.5 × 1.5 × 0.3 m = 2.7 m³"],
          ["Plaster", "Area", "1 × 12 × 3 m = 36 m²"],
          ["Pipe / conduit", "Length", "1 × 25 m = 25 m"],
          ["Excavation", "Volume", "Nos × L × W × D in m³"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — footing concrete, plaster, and one incomplete row",
      inputs:
        "Footing row: 4 nos, 1.5 × 1.5 × 0.3 m, rate PKR 28,500/m³. Plaster row: 12 × 3 m, rate PKR 320/m². A third row with only L = 10 m, asked as a volume.",
      steps: [
        "Footing quantity = 4 × 1.5 × 1.5 × 0.3 = 2.7 m³. Amount = 2.7 × 28,500 = PKR 76,950.",
        "Plaster quantity = 1 × 12 × 3 = 36 m². Amount = 36 × 320 = PKR 11,520.",
        "The L-only volume row has 1 of the 3 dimensions it needs, so its quantity is null and it is flagged incomplete — it contributes nothing to any total until the width and depth are entered.",
      ],
      result:
        "Two priced rows — 2.7 m³ of footing concrete at PKR 76,950 and 36 m² of plaster at PKR 11,520 — and one row honestly left blank. A sheet that invents quantities is worse than a sheet that leaves them out.",
    },
    related: [
      { id: "boq", title: "Professional BOQ Generator Tool", desc: "The priced bill the measured rows feed into — send a row across as a BOQ line." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities — excavation, PCC, footings, brickwork, plaster — from your dimensions." },
      { id: "material-takeoff", title: "Material Takeoff Sheet Calculator", desc: "The same items by thumb rule per sq ft, when you have an area but no drawings." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation volumes by prismoidal and average-end-area rules, with swell, shrinkage and truck trips." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall — measure the wall here, price the bricks there." },
    ],
  },

  "metal-weight": {
    id: "metal-weight",
    intro:
      "Every steel order starts from one equation — weight = cross-sectional area × length × density — and this tool applies it to thirteen profiles: round, square, pipe, hex, square tube, rectangular tube, tee, I-beam, channel, angle, flat, sheet and rebar. The densities are fixed: mild steel 7,850 kg/m³, stainless 304 and 316 both 8,000, aluminium 2,700, copper 8,960, brass 8,500 — or your own custom density. Two shortcuts are built in because they are used on every site: rebar weighs d² ÷ 162.28 kg/m, and a pipe weighs (OD − wall thickness) × thickness × 0.02466 kg/m. One warning the tool states plainly: the rectangle maths for rolled sections (I-beams and channels) ignores fillets and root radii, so for priced work use the IS 808 tabulated kg/m from the standard-size picker instead — ISMB 200 at 25.4 kg/m, ISMC 100 at 9.56 kg/m and ISA 50 × 50 × 6 at 4.5 kg/m, all labelled approximate and to be confirmed with the supplier. Wastage is 0–15% (5% default) and the default rate is PKR 270/kg for Pakistan (indicative, Nov 2026); rates for India, the UAE and USD are left blank because no verified rate was available.",
    formulas: [
      {
        formula: "W = A × L × ρ; weight per metre = A (mm²) ÷ 1,000,000 × ρ (kg/m³)",
        variables:
          "A = cross-sectional area from the profile formula; L = piece length in metres; ρ = density. Total = weight per piece × quantity; order weight = total × (1 + wastage %).",
        note: "Cost = order weight × rate per kg. A null rate leaves the cost blank — never zero.",
      },
      {
        formula: "Rebar: W = d² ÷ 162.28 kg/m",
        variables:
          "d = bar diameter in mm. Derived from (πd²/4) × 7,850 kg/m³ — the same formula the BBS generator uses, so the two tools agree.",
        note: "A 12 m stock bar of 12 mm steel weighs 10.65 kg; a 40 ft (12.192 m) bar weighs 10.82 kg.",
      },
      {
        formula: "Pipe: W = (OD − t) × t × 0.02466 kg/m",
        variables:
          "OD = outer diameter, t = wall thickness, both in mm. The shortcut is the area formula π/4 × (OD² − ID²) × density with steel's density already folded in — a Ø100 × 5 mm pipe is 11.71 kg/m either way.",
      },
      {
        formula: "Plate: 1 mm of steel = 7.85 kg/m², so plate weight = thickness (mm) × 7.85 kg/m²",
        variables:
          "A 10 mm plate weighs 78.5 kg/m²; a standard 2.5 × 1.25 m sheet (3.125 m²) of 10 mm plate weighs 245.31 kg.",
      },
      {
        formula: "Round A = πd²/4; square A = w²; hex A = (√3/2)s²; angle A = (leg1 + leg2 − t) × t; tube A = outer − inner",
        variables:
          "Square tube: w² − (w − 2t)². Rectangular tube: 2t × (w + h − 2t). Tee: w × t + (h − t) × t. Beam/channel (rectangle approximation): 2(w × tf) + (h − 2tf) × tw.",
        note: "The beam/channel rectangle formula ignores fillets — for priced work use the IS 808 tabulated kg/m, not this value.",
      },
      {
        formula: "kg/m → lb/ft: multiply by 0.6719689",
        variables: "Shown alongside kg/m for imperial takeoffs. Piece length is 0.1–12.5 m; over 12 m a bar needs a joint or lap.",
      },
    ],
    tables: [
      {
        title: "Densities used",
        headers: ["Material", "Density (kg/m³)"],
        rows: [
          ["Mild steel", "7,850"],
          ["Stainless steel 304", "8,000"],
          ["Stainless steel 316", "8,000"],
          ["Aluminium", "2,700"],
          ["Copper", "8,960"],
          ["Brass", "8,500"],
        ],
      },
      {
        title: "Rebar weight (d² ÷ 162.28) — kg/m and per 12 m bar",
        headers: ["Bar dia (mm)", "6", "8", "10", "12", "16", "20", "25", "28", "32"],
        rows: [
          ["kg/m", "0.22", "0.39", "0.62", "0.89", "1.58", "2.47", "3.85", "4.83", "6.31"],
          ["kg per 12 m bar", "2.66", "4.73", "7.39", "10.65", "18.93", "29.58", "46.22", "57.97", "75.72"],
        ],
      },
      {
        title: "IS 808 tabulated sections (approx. — confirm with supplier)",
        headers: ["Section", "kg/m"],
        rows: [
          ["ISMB 200", "25.4"],
          ["ISMC 100", "9.56"],
          ["ISA 50 × 50 × 6", "4.5"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 100 bars of Ø12 rebar, 12 m each, plus a pipe and a plate check",
      inputs:
        "Rebar Ø12 mm, 12 m pieces, 100 pieces, 5% wastage, PKR 270/kg. Checks: Ø100 × 5 mm pipe, 6 m × 10 pieces; 10 mm plate sheet 2.5 × 1.25 m.",
      steps: [
        "Rebar: W = 12² ÷ 162.28 = 0.887 kg/m. One 12 m bar = 0.887 × 12 = 10.65 kg. 100 bars = 1,065 kg; with 5% wastage 1,118.25 kg to order (1.118 tonnes). Cost = 1,118.25 × 270 = PKR 301,927.50.",
        "Pipe: (100 − 5) × 5 × 0.02466 = 11.714 kg/m; the area formula gives the same — A = π/4 × (100² − 90²) = 1,492.26 mm², × 7,850 = 11.714 kg/m. Ten 6 m pieces = 702.9 kg, 738.05 kg with wastage, PKR 199,273.50.",
        "Plate: 10 mm × 7.85 = 78.5 kg/m²; the 3.125 m² sheet weighs 245.31 kg (257.58 kg with wastage).",
        "Rolled-section check: ten 12 m ISMB 200 beams at the tabulated 25.4 kg/m weigh 3,048 kg (3,200.4 kg with wastage). The rectangle maths on the same dims gives 29.13 kg/m — about 15% higher — which is why the tabulated value governs priced work.",
      ],
      result:
        "1,118.25 kg of Ø12 rebar to order for PKR 301,927.50 at the indicative PKR 270/kg. The pipe shortcut and the area formula agree to three decimals, and the plate and beam checks show when to trust the shortcut and when to use the tabulated section weight.",
    },
    related: [
      { id: "bbs-generator", title: "Bar Bending Schedule Generator — Cutting Length & Steel Weight", desc: "Cutting lengths, bar weights and laps for beams, columns, slabs and stirrups — same d²/162.28." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "beam-design", title: "Beam Design Calculator — IS 456", desc: "Flexure and shear design of singly and doubly reinforced beams." },
      { id: "column-design", title: "Column Design Calculator — IS 456", desc: "Axial and biaxial column design with reinforcement and ties." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Measured quantities — the steel tonnage here starts from the quantities there." },
    ],
  },
  "pakistan-cost-calculator": {
    id: "pakistan-cost-calculator",
    intro:
      "The Pakistan Cost Calculator prices a house from its plot, not from a bill of quantities: the covered area is estimated from the plot size and the number of floors, then multiplied by a per-square-foot rate band for the city and finish tier. The rates are 2026 PKR/sq ft bands dated 2026-11-12, labelled indicative — Lahore grey structure PKR 2,800–3,400, standard complete PKR 3,800–4,500, premium PKR 5,700–6,400 and luxury turnkey PKR 7,000–8,500 — so the answer is a planning range, not a quotation. Two details move the answer more than any rate: the marla standard (Punjab revenue marla 272.25 sq ft vs society / DHA / Bahria marla 225 sq ft — the same 5-marla plot swings about 17% in cost) and the 75% coverage assumption, i.e. each floor is taken as 75% of the plot. Confirm quantities from drawings and rates from your contractor before ordering.",
    formulas: [
      {
        formula: "Covered area = plot (sq ft) × 0.75 × floors (+ 0.75 × plot if basement)",
        variables:
          "0.75 is the coverage factor — each floor, including a basement, is taken as 75% of the plot area. Floors 1 = ground only, up to 5 (G+4).",
        note: "This is the Pakistan page's rule. The Quick Rough Estimation tool uses a different rule (covered = plot × floors, no coverage factor) — do not mix the two.",
      },
      {
        formula: "Cost = covered area × rate band (min–max) for the city and tier",
        variables:
          "Rate bands are PKR per sq ft of covered area, by city (Lahore, Islamabad, Karachi, Faisalabad, Multan, Other) and tier (grey, standard, premium, luxury).",
        note: "Average cost = (min + max) ÷ 2. The grey/finishing split of a turnkey total is a labelled 55% grey / 45% finishing split, not a measured one.",
      },
      {
        formula: "Plot (sq ft) = marla × 225 (society) or × 272.25 (revenue); kanal = 20 × marla; sq yd × 9",
        variables:
          "Pick the marla standard your plot actually uses — a DHA/Bahria 5-marla plot is 1,125 sq ft; the same 5 marla on revenue record is 1,361.25 sq ft.",
      },
      {
        formula: "Thumb-rule materials per sq ft of covered area: cement 0.4 bags, steel 3.5 kg, bricks 10, sand 1.5 cft, aggregate 1.35 cft",
        variables:
          "Planning quantities only — the same thumb rules the Quick Estimator uses (cement 0.4–0.5, steel 3.5–4.0, bricks 8–10, sand 1.2–1.8 cft per sq ft).",
      },
    ],
    tables: [
      {
        title: "Rate bands, PKR per sq ft of covered area (2026-11-12, indicative)",
        headers: ["City", "Grey", "Standard", "Premium", "Luxury"],
        rows: [
          ["Lahore", "2,800–3,400", "3,800–4,500", "5,700–6,400", "7,000–8,500"],
          ["Islamabad", "3,000–3,600", "4,200–4,900", "6,000–6,800", "7,400–8,800"],
          ["Karachi", "2,900–3,500", "4,000–4,700", "5,800–6,600", "7,200–8,600"],
          ["Faisalabad / Multan / Other", "2,500–3,000", "3,500–4,100", "5,200–5,900", "6,500–7,800"],
        ],
      },
      {
        title: "The marla toggle — same plot, different area",
        headers: ["Standard", "1 marla (sq ft)", "5 marla (sq ft)", "1 kanal (sq ft)"],
        rows: [
          ["Society / DHA / Bahria", "225", "1,125", "4,500"],
          ["Punjab revenue", "272.25", "1,361.25", "5,445"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 5 marla, Lahore, standard finish, G+1 (the calculator's defaults)",
      inputs:
        "5 marla plot, society marla (225 sq ft), Lahore, standard tier, 2 floors (G+1), no basement. Rates: standard Lahore PKR 3,800–4,500/sq ft.",
      steps: [
        "Plot = 5 × 225 = 1,125 sq ft. Covered area = 1,125 × 0.75 × 2 = 1,687.5 sq ft.",
        "Cost = 1,687.5 × 3,800 = PKR 6,412,500 (min) and 1,687.5 × 4,500 = PKR 7,593,750 (max); average PKR 7,003,125.",
        "Grey structure (55%) = PKR 3,526,875–4,176,563; finishing (45%) = PKR 2,885,625–3,417,188.",
        "Thumb-rule materials: cement 1,687.5 × 0.4 = 675 bags; steel 1,687.5 × 3.5 = 5,906 kg; bricks 1,687.5 × 10 = 16,875; sand 1,687.5 × 1.5 = 2,531 cft; aggregate 1,687.5 × 1.35 = 2,278 cft.",
        "Same plot on the revenue marla: plot 1,361.25 sq ft, covered 2,041.88 sq ft, cost PKR 7,759,125–9,188,438 — about 21% more, from the marla definition alone.",
      ],
      result:
        "A 5-marla society plot in Lahore, standard finish, G+1: 1,687.5 sq ft covered, PKR 6,412,500–7,593,750 (average PKR 7,003,125), 675 bags of cement and 5,906 kg of steel by thumb rule. Rates are indicative Nov 2026 bands — confirm with your contractor.",
    },
    related: [
      { id: "quick-estimation", title: "Quick Rough Estimation — House Cost in Minutes", desc: "The same house priced the other way: covered = plot × floors, with a grey/finish/labour split and a build timeline." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Full house estimate from thumb-rule quantities — bricks, cement, steel, sand and crush — split into grey, finishing and add-ons." },
      { id: "rates", title: "Live Rates Calculator — Material & Labour Rates", desc: "The dated, sourced rate table behind every cost on this site: cement, steel, bricks, sand, crush and labour." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall — measure your own walls instead of the thumb rule." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project from measured dimensions, instead of per-square-foot rates." },
    ],
  },

  "quick-estimation": {
    id: "quick-estimation",
    intro:
      "Quick Rough Estimation is the fastest house budget on the site: enter the plot, the number of floors, the finish type and the city, and it returns a total cost, a grey/finishing/labour split, a build timeline and thumb-rule material ranges — in seconds, with no dimensions to measure. It prices per square foot of covered area from the 2026 rate table (Lahore base: grey PKR 3,000, standard PKR 4,800, premium PKR 6,200, luxury PKR 8,000 per sq ft), adjusted by a city multiplier (Islamabad 1.10, Karachi and Rawalpindi 1.05, Faisalabad and Multan 0.95). Two things to know before trusting the number: covered area here is plot × floors with NO 75% coverage factor (the Pakistan Cost Calculator applies 0.75 per floor, so the two tools deliberately give different covered areas for the same plot), and the cost split always sums to exactly 100% — grey, finishing and labour shares of the headline total.",
    formulas: [
      {
        formula: "Covered area = plot (sq ft) × floors (+ plot if basement)",
        variables:
          "The input area is the per-floor built-up area, so a 5-marla (1,125 sq ft) plot with 1 floor gives 1,125 sq ft covered. A basement adds one full plot area.",
        note: "No 0.75 coverage factor here — that is the Pakistan Cost Calculator's rule, not this one.",
      },
      {
        formula: "Rate per sq ft = (grey rate + finish rate) × city multiplier;  Total = covered × rate",
        variables:
          "Lahore base rates: grey 3,000 / standard 3,000+1,800 / premium 3,200+3,000 / luxury 3,500+4,500 PKR per sq ft. City multipliers: Lahore 1.00, Islamabad 1.10, Karachi 1.05, Rawalpindi 1.05, Faisalabad 0.95, Multan 0.95.",
        note: "The old 2,200/sq ft grey rate was retired as stale/low — Lahore grey alone is about PKR 2,800–3,200 in 2026.",
      },
      {
        formula: "Cost split (of the total): grey 55% / finish 30% / labour 15% (standard); grey-only 85% / labour 15%",
        variables:
          "Premium: 50% / 35% / 15%. Luxury: 45% / 40% / 15%. Labour is a share of the total, not an addition on top — the three shares always sum to 100%.",
      },
      {
        formula: "Timeline: ≤ 2,000 sq ft 4–6 months; 2,000–4,000 sq ft 5–8; 4,000–8,000 sq ft 7–12; > 8,000 sq ft 10–18; +1 month per extra floor",
        variables:
          "A planning band, not a schedule — site conditions, approvals and material supply move it both ways.",
      },
      {
        formula: "Materials per sq ft of covered area: cement 0.4–0.5 bags, steel 3.5–4.0 kg, bricks 8–10, sand 1.2–1.8 cft, aggregate 1.35 cft",
        variables:
          "Ranges, not single values — the low end is a tight, well-managed site; the high end allows for wastage and cut work.",
      },
    ],
    tables: [
      {
        title: "Per-square-foot rates, Lahore base (PKR, Nov 2026, indicative)",
        headers: ["Type", "Grey", "Finish", "Total"],
        rows: [
          ["Grey only", "3,000", "0", "3,000"],
          ["Standard", "3,000", "1,800", "4,800"],
          ["Premium", "3,200", "3,000", "6,200"],
          ["Luxury", "3,500", "4,500", "8,000"],
        ],
      },
      {
        title: "City multipliers",
        headers: ["City", "Multiplier"],
        rows: [
          ["Lahore", "1.00"],
          ["Islamabad", "1.10"],
          ["Karachi", "1.05"],
          ["Rawalpindi", "1.05"],
          ["Faisalabad", "0.95"],
          ["Multan", "0.95"],
          ["Other", "1.00"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 5 marla, Lahore, standard, G+1",
      inputs:
        "5 marla plot (society marla, 225 sq ft), 2 floors, standard type, Lahore. Rate PKR 4,800/sq ft.",
      steps: [
        "Plot = 5 × 225 = 1,125 sq ft. Covered area = 1,125 × 2 = 2,250 sq ft (no coverage factor).",
        "Total = 2,250 × 4,800 = PKR 10,800,000. The ±5% band is PKR 10,260,000–11,340,000.",
        "Split: grey 55% = PKR 5,940,000; finishing 30% = PKR 3,240,000; labour 15% = PKR 1,620,000 — summing to exactly PKR 10,800,000.",
        "Timeline: 2,250 sq ft is in the 5–8 month band, +1 month for the second floor = 6–9 months.",
        "Materials: cement 900–1,125 bags; steel 7,875–9,000 kg; bricks 18,000–22,500; sand 2,700–4,050 cft; aggregate 3,038 cft.",
      ],
      result:
        "PKR 10,800,000 (PKR 10,260,000–11,340,000) for a 5-marla, G+1, standard house in Lahore — 6–9 months to build, 900–1,125 bags of cement by thumb rule. The Pakistan Cost Calculator gives a lower total for the same plot because it applies the 0.75 coverage factor; use one tool consistently when comparing options.",
    },
    related: [
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier, with the marla-standard toggle and the 75% coverage rule." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Full house estimate from thumb-rule quantities, split into grey structure, finishing and add-ons." },
      { id: "rates", title: "Live Rates Calculator — Material & Labour Rates", desc: "The dated, sourced rate table behind every cost on this site." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project from measured dimensions." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall." },
    ],
  },

  projects: {
    id: "projects",
    intro:
      "Project Manager is the site's filing cabinet: it keeps every estimate you save, grouped under named projects, on your own device — there is no account, no server and no sync. Each project holds a name, client, location, type (Residential, Commercial, Infrastructure or Industrial), start date and budget, plus its estimates and named versions. A version is a dated snapshot of the project's estimates at that moment, so you can compare today's price with last month's without losing either. Projects are stored in the browser under the key cep_projects_v1; you can export a project as JSON and import it back, which is also how you move a project to another device. Because storage is local, clearing browser data deletes the projects — export anything that matters.",
    formulas: [
      {
        formula: "Project total cost = Σ cost of its saved estimates",
        variables:
          "Every estimate saved to the project adds its cost; an estimate with no cost contributes 0.",
      },
      {
        formula: "Top materials = Σ quantity per (material name + unit), ranked, top 5 shown",
        variables:
          "Quantities are added only when both the name and the unit match — 675 bags of cement and 200 bags of cement add to 875 bags, but bags and kg never mix.",
      },
      {
        formula: "Version = snapshot of the estimates list at save time",
        variables:
          "Saving a version copies the estimates as they are then; later edits do not change the snapshot.",
      },
    ],
    tables: [
      {
        title: "What a project stores",
        headers: ["Field", "Use"],
        rows: [
          ["Name, client, location", "Identify the job"],
          ["Type", "Residential / Commercial / Infrastructure / Industrial"],
          ["Start date, budget", "Track the job against its budget"],
          ["Estimates", "Saved calculations from any tool, each with a cost and materials"],
          ["Versions", "Named, dated snapshots of the estimates list"],
        ],
      },
      {
        title: "Moving projects between devices",
        headers: ["Action", "What happens"],
        rows: [
          ["Export JSON", "Downloads the whole project — estimates, versions and all"],
          ["Import JSON", "Adds it as a new project (a fresh id, so it never overwrites)"],
          ["Delete", "Removes the project and its versions permanently"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one house project, two estimates",
      inputs:
        "Project “5 Marla House — DHA Lahore”, budget PKR 12,000,000. Estimate 1: grey structure PKR 6,500,000 with 675 bags of cement. Estimate 2: finishing PKR 4,200,000 with 200 bags of cement.",
      steps: [
        "Project total = 6,500,000 + 4,200,000 = PKR 10,700,000 — PKR 1,300,000 under the PKR 12,000,000 budget.",
        "Top materials: cement adds across both estimates, 675 + 200 = 875 bags, and is the top material.",
        "Save a version named “After grey structure priced” — it snapshots both estimates; a later finishing revision will not change it.",
        "Export the project as JSON to keep a copy outside the browser before clearing site data.",
      ],
      result:
        "Total PKR 10,700,000 against a PKR 12,000,000 budget, top material 875 bags of cement, with a versioned snapshot for the record. The tracker tool then watches the same numbers against time; this tool only files them.",
    },
    related: [
      { id: "tracker", title: "Site Progress Tracker — Earned Value & S-Curve", desc: "Watch the project's phases against budget and schedule with SPI, CPI and a forecast finish date." },
      { id: "qs-workflow", title: "Guided QS Workflow — BOQ from Dimensions", desc: "Build the bill of quantities that feeds a project's estimates, from Nos × L × W × D dimensions." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project from measured dimensions." },
      { id: "cost-summary", title: "Construction Cost Summary Generator", desc: "Summarise a project's costs into a single client-ready summary." },
      { id: "boq", title: "BOQ Generator — Bill of Quantities", desc: "Turn quantities and rates into a priced bill of quantities." },
    ],
  },

  "qs-workflow": {
    id: "qs-workflow",
    intro:
      "The Guided QS Workflow is the quantity surveyor's route through a project: it takes you step by step from dimensions to a priced bill of quantities. Quantities are always derived from dimensions (Nos × length × width × depth), never typed in as totals — that is the one rule that keeps a BOQ auditable. Footing concrete is worked out on the 1:2:4 mix (wet volume × 1.54 dry factor, cement bags from the dry volume), plaster areas use the IS 1200 opening deductions, and the BOQ totals add a contingency percentage and then tax on the subtotal-plus-contingency. Rates come from the site's shared rate table (rates.ts); the workflow carries no rate table of its own and no pre-filled project — every rate you see is one you entered or one from the shared table.",
    formulas: [
      {
        formula: "Quantity = Nos × L × W × D (volume) or Nos × L × W (area)",
        variables:
          "Each dimension row is one measured item; the quantity is the product, so a wrong dimension shows up as a wrong quantity, not a hidden total.",
        note: "Every row is validated: each value must be above 0 and no larger than 10,000.",
      },
      {
        formula: "Footing concrete (1:2:4): V_dry = V_wet × 1.54;  bags = ⌈V_dry × (1⁄7) ÷ 0.0347⌉",
        variables:
          "1:2:4 gives cement 1⁄7 of the dry volume; 0.0347 m³ is the volume of one 50 kg bag. Bags are always rounded up.",
      },
      {
        formula: "Plaster net area = gross − Σ deductions;  opening < 0.5 m²: none; 0.5–3 m²: one face; > 3 m²: both faces",
        variables:
          "IS 1200 plastering deductions. The same rule is used by the finishes tools, with jambs added back for openings over 3 m².",
      },
      {
        formula: "Amount = qty × rate;  Subtotal = Σ amounts;  Contingency = subtotal × %;  Tax = (subtotal + contingency) × %;  Grand = subtotal + contingency + tax",
        variables:
          "Tax is charged on the subtotal plus contingency, not on the subtotal alone. Amounts are rounded to 2 decimals per line.",
      },
    ],
    tables: [
      {
        title: "IS 1200 plaster opening deductions",
        headers: ["Opening area", "Deduction"],
        rows: [
          ["Under 0.5 m²", "No deduction"],
          ["0.5 – 3 m²", "Deduct for one face only"],
          ["Over 3 m²", "Deduct for both faces, add jambs / soffits / sills back"],
        ],
      },
      {
        title: "BOQ sections in the worked example",
        headers: ["Section", "Amount (PKR)"],
        rows: [
          ["Earthwork", "42,000"],
          ["Concrete", "1,262,500"],
          ["Masonry", "675,000"],
          ["Finishes", "712,500"],
          ["Services", "731,000"],
          ["Subtotal", "3,423,000"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — a 15-item BOQ (the engine's legacy regression items)",
      inputs:
        "Excavation 120 m³ @ PKR 350; footing concrete 45 m³ @ PKR 5,500; PCC 15 m³ @ PKR 6,000; columns 25 m³ @ PKR 7,000; beams 30 m³ @ PKR 6,500; slabs 80 m³ @ PKR 6,000; staircase 10 m³ @ PKR 7,500; brickwork 150 m³ @ PKR 4,500; plaster 850 m² @ PKR 250; flooring 400 m² @ PKR 800; painting 1,200 m² @ PKR 150; plumbing 45 points @ PKR 1,200; electrical 120 points @ PKR 850; paint/misc 5,000 sq ft @ PKR 15; solar 10 kW @ PKR 50,000. Contingency 5%, tax 0%.",
      steps: [
        "Each line is qty × rate: footing concrete 45 × 5,500 = PKR 247,500; slabs 80 × 6,000 = PKR 480,000; brickwork 150 × 4,500 = PKR 675,000; solar 10 × 50,000 = PKR 500,000 — and so on for all 15 lines.",
        "Subtotal = PKR 3,423,000 (concrete alone is PKR 1,262,500).",
        "Contingency = 3,423,000 × 5% = PKR 171,150. Tax = (3,423,000 + 171,150) × 0% = 0.",
        "Grand total = 3,423,000 + 171,150 + 0 = PKR 3,594,150.",
        "Two cross-checks from the same engine: 45 m³ of footing concrete needs dry volume 45 × 1.54 = 69.3 m³, i.e. ⌈69.3 × (1⁄7) ÷ 0.0347⌉ = 286 bags of cement; and 850 m² of plaster with openings of 2.1, 1.44 and 4.5 m² deducts 2.1 + 1.44 + 9.0 = 12.54 m², leaving 837.46 m² net.",
      ],
      result:
        "Subtotal PKR 3,423,000, +5% contingency PKR 171,150, grand total PKR 3,594,150 at 0% tax. Replace the legacy rates with your own from the rates table before pricing a real job — the workflow prices only what you enter.",
    },
    related: [
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project from measured dimensions." },
      { id: "boq", title: "BOQ Generator — Bill of Quantities", desc: "Turn quantities and rates into a priced, printable bill of quantities." },
      { id: "takeoff", title: "Plan Takeoff — Measure from the Drawing", desc: "Trace lengths and areas on the plan and convert them into footing, slab, wall and road quantities." },
      { id: "rates", title: "Live Rates Calculator — Material & Labour Rates", desc: "The dated, sourced rate table this workflow prices from." },
      { id: "measurement-sheet", title: "Measurement Sheet Calculator", desc: "The measurement sheet behind the BOQ — Nos, lengths, widths and depths, item by item." },
    ],
  },

  rates: {
    id: "rates",
    intro:
      "The Live Rates Calculator is the one dated, sourced rate table every tool on this site prices from — no component is allowed to hardcode a material rate of its own. The Pakistan table was compiled 2026-11-12 from the Pakistan Bureau of Statistics (bricks, Lahore, August 2026) and a CEP market check of November 2026, and every line carries its provenance so you can see what is sourced and what is only indicative. The rule that matters most: a rate the audit could not source is shown as null — “unknown, enter your own” — never priced at zero. That is why the India and UAE tables are entirely null: no verified IN/AE rate was in the audit specs, so nothing is published for them. Your own edits are saved in the browser as overrides for that region, on top of the table defaults.",
    formulas: [
      {
        formula: "Cost = quantity × rate (per bag / per kg / per 1,000 bricks / per cft / per day)",
        variables:
          "Match the unit to the rate: bricks are priced per 1,000, so 10,000 bricks cost 10 × the per-1,000 rate — never multiply pieces by the per-1,000 rate.",
        note: "The old interiors-finishes code made exactly that mistake and overstated brick cost 1,000×. A null rate means the cost is shown as “—”, never 0.",
      },
      {
        formula: "Total with overhead = Σ (qty × rate) × (1 + overhead %)",
        variables:
          "Overhead + profit is 15% in the Pakistan table (a MarketRatesContext default, undated). Apply it once, on the summed cost, not per line.",
      },
      {
        formula: "Effective rate = table default, replaced by your saved override when one exists",
        variables:
          "Overrides are stored per region under the key cep-rates-v1:<region> in localStorage and survive between visits on the same browser.",
      },
    ],
    tables: [
      {
        title: "Pakistan rate table (PKR, last updated 2026-11-12)",
        headers: ["Item", "Rate", "Source"],
        rows: [
          ["Cement, 50 kg bag", "1,450", "CEP market check Nov 2026 — indicative"],
          ["Steel, per kg", "270", "Verified Oct–Nov 2026 branded Grade 60 range 255–277/kg — indicative"],
          ["Bricks, per 1,000", "23,355", "Pakistan Bureau of Statistics, Aug 2026, Lahore"],
          ["Sand, per cft", "90", "MarketRatesContext default (undated) — indicative"],
          ["Crush, per cft", "90", "G9 spec worked value (PK crush ~65–110/cft)"],
          ["Tiles, per box", "1,200", "MarketRatesContext default (undated) — indicative"],
          ["Paint, per litre", "300", "MarketRatesContext default (undated) — indicative"],
          ["Mason, per day", "1,200", "Labour calculator preset (unsourced) — indicative"],
          ["Helper, per day", "600", "Labour calculator preset (unsourced) — indicative"],
          ["Grey labour, per sq ft", "500", "MarketRatesContext default (undated) — indicative"],
          ["Finishing labour, per sq ft", "600", "MarketRatesContext default (undated) — indicative"],
          ["Overhead + profit", "15%", "MarketRatesContext default (undated)"],
        ],
      },
      {
        title: "India and UAE tables",
        headers: ["Region", "Status"],
        rows: [
          ["India (INR)", "All rates null — no verified IN rate in the audit specs; enter your own"],
          ["UAE (AED)", "All rates null — no verified AE rate in the audit specs; enter your own"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — pricing a small materials list from the Pakistan table",
      inputs:
        "Cement 100 bags, steel 1,000 kg, bricks 10,000, sand 100 cft, crush 100 cft, mason 5 days, helper 5 days. All rates from the Pakistan table above.",
      steps: [
        "Cement: 100 × 1,450 = PKR 145,000. Steel: 1,000 × 270 = PKR 270,000.",
        "Bricks: 10,000 ÷ 1,000 × 23,355 = 10 × 23,355 = PKR 233,550.",
        "Sand: 100 × 90 = PKR 9,000. Crush: 100 × 90 = PKR 9,000.",
        "Labour: mason 5 × 1,200 = PKR 6,000; helper 5 × 600 = PKR 3,000.",
        "Subtotal = 145,000 + 270,000 + 233,550 + 9,000 + 9,000 + 6,000 + 3,000 = PKR 675,550.",
        "With 15% overhead and profit: 675,550 × 1.15 = PKR 776,883 (rounded).",
      ],
      result:
        "PKR 675,550 before overhead, PKR 776,883 with the 15% overhead and profit — priced entirely from the dated Pakistan table. Note the old crush default of PKR 250/cft was a proven ~3× error and is not in this table.",
    },
    related: [
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier — the rates behind it are this table." },
      { id: "quick-estimation", title: "Quick Rough Estimation — House Cost in Minutes", desc: "Per-square-foot house pricing from the same 2026 rate bands." },
      { id: "qs-workflow", title: "Guided QS Workflow — BOQ from Dimensions", desc: "The BOQ workflow prices its quantities from this table." },
      { id: "boq", title: "BOQ Generator — Bill of Quantities", desc: "A priced bill of quantities is only as good as the rates in it." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project — price it from this table." },
    ],
  },

  takeoff: {
    id: "takeoff",
    intro:
      "Plan Takeoff turns a drawing into quantities: trace a length or an area on the plan, calibrate the scale from a known dimension, and the tool converts the traced geometry into footing, slab, wall and road quantities. Areas use the shoelace formula (the surveyor's polygon-area rule), lengths are summed polyline segments divided by the scale, and the five assemblies are documented formulas — not black boxes. The footing assembly is the one to read carefully: its concrete is measured as length × (width − 0.2 m) × (depth − 0.15 m), because 0.2 m is the column width already counted in the column and 0.15 m is the PCC bed measured separately. Measure either and you double-count. Rates come from the shared rate table; the old hardcoded, unsourced assembly rates are not reproduced here.",
    formulas: [
      {
        formula: "Shoelace area = |Σ (x_i·y_{i+1} − x_{i+1}·y_i)| ÷ 2 ÷ scale²",
        variables:
          "The sum runs around the traced polygon, closing back to the first point; scale is pixels per unit length. The area is in square units of the drawing's unit.",
        note: "Calibrate the scale first — trace a known length (e.g. a 10 m wall) and set pixels-per-unit from it. An uncalibrated scale is the commonest takeoff error.",
      },
      {
        formula: "Polyline length = Σ √(Δx² + Δy²) ÷ scale",
        variables:
          "Each segment is the straight-line distance between two traced points; the sum divided by the scale gives the real length.",
      },
      {
        formula: "Footing: excavation = L × W × D;  PCC = L × W × 0.15;  RCC = L × (W − 0.2) × (D − 0.15)",
        variables:
          "0.2 m is the column width allowance and 0.15 m is the PCC bed thickness, both already measured separately. Inputs are validated: W must exceed 0.2 m and D must exceed 0.15 m.",
      },
      {
        formula: "RCC slab: volume = area × thickness;  steel = volume × 100 kg/m³ (editable, range 80–120);  formwork = area",
        variables:
          "100 kg/m³ is the default steel density for a slab; adjust it for heavily reinforced slabs.",
      },
      {
        formula: "Brick wall: volume = L × H × thickness;  bricks = ⌈volume ÷ (0.24 × 0.12 × 0.085)⌉;  plaster area = L × H × sides",
        variables:
          "One brick with a 10 mm joint is 240 × 120 × 85 mm = 0.002448 m³. Plaster is counted on both faces by default (sides = 2).",
      },
      {
        formula: "Road: asphalt volume = area × thickness (default 0.05 m) — a volume in m³, never m²",
        variables:
          "Asphalt is ordered by volume; quoting it as an area understates the order by the thickness factor.",
      },
    ],
    tables: [
      {
        title: "The five assemblies",
        headers: ["Assembly", "What it returns"],
        rows: [
          ["Foundation strip", "Excavation, PCC and RCC volumes (m³)"],
          ["RCC slab", "Concrete volume, steel weight, formwork area"],
          ["Brick wall", "Wall volume, brick count, plaster area"],
          ["Road section", "Asphalt volume in m³"],
          ["Traced polygon / polyline", "Area (shoelace) or length from the drawing"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one strip footing, one slab, one wall, one traced room",
      inputs:
        "Strip footing 10 m long, 1.2 m wide, 1.5 m deep. Slab 100 m², 0.15 m thick. Wall 10 m long, 3 m high, 0.23 m thick, plaster both sides. Traced room 10 m × 10 m at scale 1 px per unit.",
      steps: [
        "Footing: excavation = 10 × 1.2 × 1.5 = 18 m³; PCC = 10 × 1.2 × 0.15 = 1.8 m³; RCC = 10 × (1.2 − 0.2) × (1.5 − 0.15) = 10 × 1.0 × 1.35 = 13.5 m³.",
        "Slab: volume = 100 × 0.15 = 15 m³; steel = 15 × 100 = 1,500 kg; formwork = 100 m².",
        "Wall: volume = 10 × 3 × 0.23 = 6.9 m³; bricks = ⌈6.9 ÷ 0.002448⌉ = 2,819; plaster = 10 × 3 × 2 = 60 m².",
        "Traced room: shoelace area of a 10 × 10 square = 100 m².",
      ],
      result:
        "Footing 18 m³ excavated, 1.8 m³ PCC, 13.5 m³ RCC; slab 15 m³ concrete with 1,500 kg steel; wall 2,819 bricks with 60 m² of plaster; traced room 100 m². Price each line from the rates table — the takeoff gives quantities, not costs.",
    },
    related: [
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project from measured dimensions." },
      { id: "qs-workflow", title: "Guided QS Workflow — BOQ from Dimensions", desc: "Turn the takeoff quantities into a priced bill of quantities." },
      { id: "measurement-sheet", title: "Measurement Sheet Calculator", desc: "The measurement sheet behind the BOQ — Nos, lengths, widths and depths." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation and backfill volumes, swell and shrinkage, and truck trips." },
    ],
  },

  tracker: {
    id: "tracker",
    intro:
      "The Site Progress Tracker answers the two questions every site engineer asks each week: are we ahead or behind schedule, and are we over or under budget? It does it with earned value management (EVM, the PMI method): each phase has a budget, a planned value, an earned value from its percentage complete, and an actual cost. From those four numbers come the schedule and cost indices (SPI, CPI), the variances, the estimate at completion under four different assumptions, and a forecast finish date. Phases are stored in the browser, a baseline can be frozen for comparison, and the S-curve is drawn by daily interpolation of every phase — so the curve moves smoothly day by day instead of jumping at phase boundaries. The sample project shown on first load is labelled SAMPLE: replace it with your own phases.",
    formulas: [
      {
        formula: "PV = planned value to date;  EV = Σ (phase progress % × phase budget);  AC = Σ actual cost",
        variables:
          "PV is what the plan said should be done by the status date; EV is the budgeted value of what actually is done; AC is what was actually spent.",
        note: "EV is the only one of the three that needs a progress percentage — a phase 60% complete has earned 60% of its budget, whatever it cost.",
      },
      {
        formula: "SPI = EV ÷ PV;   CPI = EV ÷ AC;   SV = EV − PV;   CV = EV − AC",
        variables:
          "SPI > 1 is ahead of schedule, CPI > 1 is under budget. SV and CV are the same facts in money: negative means behind / over.",
      },
      {
        formula: "EAC (CPI method) = BAC ÷ CPI;   EAC (atypical) = AC + (BAC − EV);   EAC (CPI×SPI) = AC + (BAC − EV) ÷ (CPI × SPI);   EAC (bottom-up) = AC + ETC",
        variables:
          "BAC is the total budget. Four methods because the future is uncertain: the CPI method assumes today's cost performance continues; the atypical method assumes the overrun was a one-off; the CPI×SPI method assumes both cost and schedule pressure continue; bottom-up uses a fresh estimate to complete.",
        note: "ETC = EAC(CPI) − AC; VAC = BAC − EAC(CPI); TCPI = (BAC − EV) ÷ (BAC − AC) — the efficiency the remaining work must achieve to finish on budget.",
      },
      {
        formula: "Forecast delay (days) = (1 ÷ SPI − 1) × remaining planned days",
        variables:
          "A negative result means ahead of schedule. SPI 0.72 with 60 planned days left forecasts 23 days late.",
      },
    ],
    tables: [
      {
        title: "Reading SPI and CPI",
        headers: ["Index", "Value", "Meaning"],
        rows: [
          ["SPI", "> 1", "Ahead of schedule"],
          ["SPI", "= 1", "On schedule"],
          ["SPI", "< 1", "Behind schedule"],
          ["CPI", "> 1", "Under budget"],
          ["CPI", "= 1", "On budget"],
          ["CPI", "< 1", "Over budget"],
        ],
      },
      {
        title: "The four EAC methods — when to use which",
        headers: ["Method", "Assumes"],
        rows: [
          ["BAC ÷ CPI", "Current cost performance continues to the end"],
          ["AC + (BAC − EV)", "The overrun was a one-off; the rest goes to plan"],
          ["AC + (BAC − EV) ÷ (CPI × SPI)", "Both cost and schedule pressure continue"],
          ["AC + bottom-up ETC", "You have re-estimated the remaining work directly"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — the engine's reference project (BAC 119,000)",
      inputs:
        "Budget at completion (BAC) 119,000; earned value (EV) 36,000; planned value (PV) 50,000; actual cost (AC) 36,500; 60 planned days remaining.",
      steps: [
        "SPI = 36,000 ÷ 50,000 = 0.72 — behind schedule. CPI = 36,000 ÷ 36,500 = 0.99 — slightly over budget.",
        "SV = 36,000 − 50,000 = −14,000. CV = 36,000 − 36,500 = −500. Overall progress = 36,000 ÷ 119,000 = 30.25%.",
        "EAC by the CPI method = 119,000 ÷ 0.9863 = 120,653. EAC atypical = 36,500 + (119,000 − 36,000) = 119,500. EAC CPI×SPI = 36,500 + 83,000 ÷ (0.9863 × 0.72) = 153,379.",
        "ETC = 120,653 − 36,500 = 84,153. VAC = 119,000 − 120,653 = −1,653 (a forecast overrun). TCPI = 83,000 ÷ 82,500 = 1.01 — the remaining work must run 1% more efficiently than planned to finish on budget.",
        "Forecast delay = (1 ÷ 0.72 − 1) × 60 = 23 days late.",
      ],
      result:
        "Over budget and behind schedule: SPI 0.72, CPI 0.99, forecast final cost PKR 120,653 (CPI method) against a 119,000 budget, finishing about 23 days late. The CPI×SPI forecast of 153,379 is the warning case — it assumes the schedule slip keeps costing money too.",
    },
    related: [
      { id: "projects", title: "Project Manager — Estimates, Versions & Budgets", desc: "The project file the tracker watches: estimates, versions and the budget the BAC comes from." },
      { id: "qs-workflow", title: "Guided QS Workflow — BOQ from Dimensions", desc: "The bill of quantities behind the phase budgets." },
      { id: "labour-calculator", title: "Labour & Workforce Estimator", desc: "Planned vs actual workers per phase — the labour side of the same overrun." },
      { id: "cost-summary", title: "Construction Cost Summary Generator", desc: "Summarise the project's costs into a single client-ready summary." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project." },
    ],
  },

  "unit-converter": {
    id: "unit-converter",
    intro:
      "The Unit Converter converts between the units a site actually uses — metres and feet, square metres and marla, cubic metres and cubic feet, kilograms and pounds, MPa and psi — across 15 categories: Length, Area, Volume, Mass, Density, Force, Pressure & Stress, Torque & Moment, Velocity, Angle, Temperature, Energy & Work, Power, Volumetric Flow and Dynamic Viscosity. Every category except temperature converts by a single factor to its base unit (base value = input × factor, then divide by the target's factor), so a conversion is exact to the factors given. Temperature is the exception: it is an offset scale, so Celsius, Fahrenheit and Kelvin convert through Celsius, not by a factor. The Area category carries the society marla (225 sq ft) only — the 272.25 sq ft revenue marla is not a separate unit here; use the Marla Converter page toggle for it.",
    formulas: [
      {
        formula: "Converted value = (input × from-factor) ÷ to-factor",
        variables:
          "Each unit carries a factor to its category's base unit (metre, m², m³, kg, N, Pa, N·m, m/s, degree, J, W, m³/s, Pa·s). Multiply into the base, divide out of it.",
        note: "The result is shown to 6 decimals; values below 0.000001 or above 10,000,000 are shown in scientific notation.",
      },
      {
        formula: "°F = °C × 9⁄5 + 32;   °C = (°F − 32) × 5⁄9;   K = °C + 273.15",
        variables:
          "Temperature converts through Celsius because Fahrenheit and Kelvin are offset scales — a factor alone would give the wrong answer.",
      },
      {
        formula: "1 marla (society) = 225 sq ft = 20.903184 m²;   1 kanal = 20 marla = 4,500 sq ft",
        variables:
          "The converter's marla is the society standard. A revenue marla (272.25 sq ft = 25.293 m²) is a different unit — do not convert with this one.",
      },
    ],
    tables: [
      {
        title: "Base factors the converter uses (to the base unit)",
        headers: ["Conversion", "Factor"],
        rows: [
          ["1 ft → m", "0.3048"],
          ["1 in → m", "0.0254"],
          ["1 mile → m", "1,609.344"],
          ["1 sq ft → m²", "0.09290304"],
          ["1 acre → m²", "4,046.8564224"],
          ["1 hectare → m²", "10,000"],
          ["1 US gallon → m³", "0.00378541"],
          ["1 cu ft → m³", "0.0283168"],
          ["1 lb → kg", "0.45359237"],
          ["1 psi → Pa", "6,894.7572932"],
          ["1 MPa → Pa", "1,000,000"],
          ["1 atm → Pa", "101,325"],
        ],
      },
      {
        title: "Site presets built into the converter",
        headers: ["Preset", "Value"],
        rows: [
          ["Standard rebar", "12 m / 40 ft"],
          ["Door height", "2.1 m"],
          ["Storey height", "3 m"],
          ["1 marla (society)", "225 sq ft"],
          ["1 marla (revenue)", "272.25 sq ft"],
          ["Concrete mixer truck", "6 m³"],
          ["Standard cement bag", "1.226 cu ft"],
          ["Concrete M20", "20 MPa"],
          ["Steel Fe500", "500 MPa"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — six conversions the converter runs",
      inputs:
        "12 m to feet; 1 marla (society) to sq ft; 20 MPa to psi; 25 °C to °F; 1 m³ to cu ft; 50 kg to lb.",
      steps: [
        "12 m × (1 ÷ 0.3048) = 39.370079 ft — the standard 12 m rebar bar.",
        "1 marla (society) = 20.903184 m² ÷ 0.09290304 = 225 sq ft.",
        "20 MPa = 20,000,000 Pa ÷ 6,894.7572932 = 2,900.75 psi.",
        "25 °C × 9⁄5 + 32 = 77 °F.",
        "1 m³ ÷ 0.0283168 = 35.314725 cu ft.",
        "50 kg ÷ 0.45359237 = 110.231131 lb — one cement bag.",
      ],
      result:
        "12 m = 39.370079 ft; 1 marla = 225 sq ft; 20 MPa = 2,900.75 psi; 25 °C = 77 °F; 1 m³ = 35.314725 cu ft; 50 kg = 110.231131 lb. For the revenue marla, use the Marla Converter — this tool's marla is the 225 sq ft society standard.",
    },
    related: [
      { id: "marla-converter", title: "Marla / Kanal Area Converter", desc: "Plot areas in marla, kanal, sq ft, sq yd and sq m — with the 225 vs 272.25 marla toggle." },
      { id: "volume-estimator", title: "Volume & Tank Capacity Calculator", desc: "Volumes, surface areas and tank capacities in m³, litres, cu ft and gallons." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas in m², sq ft, sq yd, marla and kanal, checked against NBC 2016 minima." },
      { id: "metal-weight", title: "Metal Weight Calculator", desc: "Weight of steel plates, bars, pipes and sections from dimensions." },
      { id: "area-space-calculator", title: "Area & Space Calculator", desc: "Floor areas and space planning from room dimensions." },
    ],
  },

  "volume-estimator": {
    id: "volume-estimator",
    intro:
      "The Volume Estimator gives the volume, surface area and weight of 14 shapes — rectangular prism, cube, cylinder, sphere, half-sphere, cone, frustum (truncated cone), parabolic cone (paraboloid), triangular prism, trapezoidal prism, hollow cylinder, general prism, rectangular tank and commercial tank — plus a family tank-size helper. Everything is metric internally: volumes in m³, converted to litres, cubic feet, US gallons and imperial gallons, and weight from the density you enter (water 1,000, concrete 2,400, steel 7,850, dry sand 1,600, soil 1,800 kg/m³). Tanks are the special case: a commercial tank's usable volume is its gross volume minus freeboard and dead storage, and the tool warns when the usable share falls outside the normal 75–95% band. The old component's parabolic-cone branch swallowed the triangular-prism code, so one returned the other's answer; both are fixed in this engine.",
    formulas: [
      {
        formula: "Rectangular prism V = L × W × H;  cylinder V = πr²H;  sphere V = ⁴⁄₃πr³;  cone V = ⅓πr²H;  paraboloid V = ½πr²H",
        variables:
          "The paraboloid holds exactly half the volume of the cylinder with the same radius and height — a useful check.",
      },
      {
        formula: "Frustum V = (H ÷ 3) × (A₁ + A₂ + √(A₁ × A₂));  cone frustum V = ⅓πH(R² + Rr + r²)",
        variables:
          "The same frustum formula the trapezoidal-footing rule uses — it is exact for any frustum, not an approximation.",
      },
      {
        formula: "Hollow cylinder V = (π ÷ 4) × (D_outer² − D_inner²) × L",
        variables:
          "The wall material of a pipe or a well ring — outer diameter must exceed inner diameter.",
      },
      {
        formula: "Tank: usable = gross − freeboard volume − dead-storage volume;  fill level scales the usable volume",
        variables:
          "Defaults: freeboard 0.2 m, dead storage 0.15 m. A sloped-base tank adds a frustum volume under the main body. Usable share is normally 75–95% of gross.",
      },
      {
        formula: "Conversions: 1 m³ = 1,000 L = 35.3147 cu ft;  1 L = 0.264172 US gal = 0.219969 imp gal;  weight = volume × density",
        variables:
          "1 cu ft = 28.3168 L = 7.48052 US gal = 6.22884 imp gal.",
      },
      {
        formula: "Family tank: required litres = persons × litres/person/day × days;  next standard size up from 500 / 750 / 1,000 / 1,500 / 2,000 / 5,000 L",
        variables:
          "Standard tank sizes are the ones sold off the shelf — always round up to the next size, never down.",
      },
    ],
    tables: [
      {
        title: "Volume formulas at a glance",
        headers: ["Shape", "Volume"],
        rows: [
          ["Rectangular prism / tank", "L × W × H"],
          ["Cube", "side³"],
          ["Cylinder", "πr²H"],
          ["Sphere", "⁴⁄₃πr³"],
          ["Half-sphere", "⅔πr³"],
          ["Cone", "⅓πr²H"],
          ["Frustum cone", "⅓πH(R² + Rr + r²)"],
          ["Parabolic cone", "½πr²H"],
          ["Triangular prism", "½ × base × height × length"],
          ["Trapezoidal prism", "½ × (top + bottom) × depth × length"],
          ["Hollow cylinder", "(π/4)(D² − d²)L"],
          ["General prism", "base area × height"],
        ],
      },
      {
        title: "Density presets (kg/m³)",
        headers: ["Material", "Density"],
        rows: [
          ["Water", "1,000"],
          ["Concrete", "2,400"],
          ["Steel", "7,850"],
          ["Sand (dry)", "1,600"],
          ["Soil", "1,800"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — a cylindrical tank, a rectangular tank, and a family size",
      inputs:
        "Cylinder radius 1.5 m, height 3 m, water (1,000 kg/m³). Rectangular tank 4 m × 3 m × 2.5 m. Family of 6, 135 L/person/day, 1 day of storage.",
      steps: [
        "Cylinder: V = π × 1.5² × 3 = 21.21 m³ = 21,206 L = 748.87 cu ft = 5,602 US gal (4,665 imp gal). Surface area 42.41 m² (lateral 28.27 m²). Weight of water = 21,206 kg.",
        "Rectangular tank: V = 4 × 3 × 2.5 = 30 m³ = 30,000 L = 1,059.44 cu ft = 7,925 US gal. Surface area 59 m².",
        "Family: required = 6 × 135 × 1 = 810 L → next standard size up is 1,000 L.",
      ],
      result:
        "The cylinder holds 21,206 L (21.21 m³) and the rectangular tank 30,000 L (30 m³); a 6-person house at 135 L/person/day needs a 1,000 L tank for one day. For a commercial tank, remember the usable volume is less than the gross — freeboard and dead storage come off first.",
    },
    related: [
      { id: "water-tank-design", title: "Water Tank Design Calculator", desc: "Size an overhead or underground water tank from demand, with structural checks." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete volumes for slabs, beams, columns and staircases." },
      { id: "unit-converter", title: "Unit Converter — Length, Area, Volume & More", desc: "Convert m³, litres, cu ft and gallons between each other." },
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Harvestable rainwater volume from roof area and rainfall, and the tank it needs." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation volumes and truck trips from the same volume arithmetic." },
    ],
  },

  "interiors-finishes": {
    id: "interiors-finishes",
    intro:
      "The Interiors & Finishes Estimator prices one room across seven trades — masonry, plaster, paint, flooring, countertops, carpentry and carpet — from a single set of room dimensions and openings. Enter the room once (length, width, height, doors and windows) and every trade works from the same net wall area, so the plaster, paint and tile quantities can never disagree about how big the room is. The quantities follow the site's house rules throughout: brick count is wall volume divided by brick-with-mortar volume, dry mortar is wet × 1.33, a 50 kg cement bag is 0.0347 m³, and plaster opening deductions follow IS 1200 (under 0.5 m² no deduction, 0.5–3 m² one face, over 3 m² both faces plus jambs). Costs are priced from the shared rate table; a rate the table does not know is shown as “—”, never priced at zero — and a rate quoted per 1,000 bricks is divided by 1,000, the mistake that once overstated brick cost 1,000×.",
    formulas: [
      {
        formula: "Gross wall = 2 × (L + W) × H × faces;  net wall = gross − deductions + jambs",
        variables:
          "Faces is 1 or 2 (one or both sides of the wall). Deductions follow IS 1200; jambs are (2h + w) × jamb depth (default 0.23 m) for openings over 3 m².",
      },
      {
        formula: "Plaster: wet = area × thickness;  dry = wet × 1.33 × (1 + wastage %);  cement = dry × c⁄(c+s);  bags = ⌈cement ÷ 0.0347⌉",
        variables:
          "Defaults: internal 12 mm, external 20 mm, 1:4 mix, uneven-surface factor 1.10, wastage 5%. Ceiling plaster is added at the internal thickness when included.",
      },
      {
        formula: "Paint: litres = paintable area × coats ÷ coverage × (1 + wastage %);  primer = area × primer coats ÷ primer coverage",
        variables:
          "Defaults: coverage 11 m²/L, primer 7 m²/L, 2 coats, 1 primer coat, putty 1.1 m²/kg over 2 coats, wastage 10%. Paintable area is net wall + ceiling (if included) + door faces − skirting. Packs are split largest-first: 20 L, 10 L, 4 L, 1 L.",
      },
      {
        formula: "Tiles = ⌈floor area ÷ ((tile L + grout) × (tile W + grout)) × (1 + wastage %)⌉;  boxes = ⌈total tiles ÷ tiles per box⌉",
        variables:
          "Pattern wastage: straight 7%, brick-bond 10%, diagonal 14%, herringbone 16%. Skirting tiles are counted separately as cut strips, never folded into the floor area.",
      },
      {
        formula: "Mortar bed: dry = floor area × bed thickness × 1.33;  cement = dry × c⁄(c+s);  sand = dry × s⁄(c+s)",
        variables:
          "Default bed 50 mm, 1:4 mix. Grout is 0.3 kg/m² of tiled area (labelled assumption).",
      },
      {
        formula: "Countertop: L-shape gross = A×d + (B−d)×d;  net = gross − sink − hob cutouts;  order = (gross + skirting) × (1 + wastage %)",
        variables:
          "Skirting length for an L-shape is A + B + d; edge polish for an L-shape is A + B. Slab volume = gross area × slab thickness — the thickness is always used.",
      },
      {
        formula: "Carpentry: studs = ⌈perimeter ÷ spacing⌉ (+1 only for an open run);  sheets = ⌈wall area × (1 + wastage %) ÷ sheet area ÷ reuse⌉",
        variables:
          "A closed room needs no +1 stud — the old +1 double-counted a corner. Reuse divides only formwork/shuttering; fixed panelling is divided by 1.",
      },
      {
        formula: "Carpet area = floor area;  built-up = carpet ÷ (1 − wall deduction %);  super built-up = built-up × (1 + loading %)",
        variables:
          "The deduction % is a labelled assumption (share of floor area taken by internal walls). The parts-based alternative adds internal-wall and common areas directly.",
      },
    ],
    tables: [
      {
        title: "IS 1200 plaster opening deductions",
        headers: ["Opening area", "Deduction"],
        rows: [
          ["Under 0.5 m²", "No deduction"],
          ["0.5 – 3 m²", "Deduct for one face only"],
          ["Over 3 m²", "Deduct for both faces, add jambs back"],
        ],
      },
      {
        title: "Tile pattern wastage",
        headers: ["Pattern", "Wastage"],
        rows: [
          ["Straight", "7%"],
          ["Brick-bond", "10%"],
          ["Diagonal", "14%"],
          ["Herringbone", "16%"],
        ],
      },
      {
        title: "Defaults the estimator starts from",
        headers: ["Item", "Default"],
        rows: [
          ["Room", "5 m × 4 m × 3 m, one face"],
          ["Plaster", "12 mm internal / 20 mm external, 1:4, uneven 1.10, wastage 5%"],
          ["Paint", "11 m²/L, primer 7 m²/L, 2 coats, putty 1.1 m²/kg × 2 coats"],
          ["Tiles", "600 × 600 mm, 3 mm grout, 4 per box, bed 50 mm 1:4"],
          ["Countertop", "20 mm slab, sink + hob cutouts, wastage 5%"],
          ["Stud spacing", "0.4 m"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one room, 5 m × 4 m × 3 m (the estimator's defaults)",
      inputs:
        "Room 5 × 4 × 3 m, one face, jamb depth 0.23 m; one door 0.9 × 2.1 m, one window 1.2 × 1.2 m. Plaster 12/20 mm, 1:4, uneven 1.10, wastage 5%, ceiling included. Paint 11 m²/L, primer 7 m²/L, 2 coats, 1 primer coat, putty 1.1 m²/kg × 2 coats, wastage 10%, skirting 0.1 m deducted. Tiles 600 × 600 mm, 3 mm grout, straight pattern, 4 per box, skirting 0.1 m, door width 0.9 m, bed 50 mm 1:4.",
      steps: [
        "Gross wall = 2 × (5 + 4) × 3 = 54 m². Openings: door 1.89 m² and window 1.44 m² are both in the 0.5–3 m² band, so each deducts one face: 3.33 m². Net wall = 50.67 m². Floor = 20 m², perimeter = 18 m.",
        "Plaster: internal wet (50.67 + 20 ceiling) × 0.012 = 0.85 m³; external wet 54 × 0.02 = 1.08 m³; wet total (0.85 + 1.08) × 1.10 = 2.12 m³; dry = 2.12 × 1.33 × 1.05 = 2.96 m³. Cement = 2.96 ÷ 5 = 0.59 m³ → ⌈0.59 ÷ 0.0347⌉ = 18 bags. Sand = 2.37 m³ = 83.67 cft.",
        "Paint: paintable = 50.67 + 20 − 18 × 0.1 = 68.87 m². Primer = ⌈68.87 ÷ 7⌉ = 10 L. Paint = ⌈68.87 × 2 ÷ 11 × 1.10⌉ = 14 L (1 × 10 L + 1 × 4 L). Putty = ⌈68.87 × 2 ÷ 1.1⌉ = 126 kg.",
        "Flooring: effective tile area (0.6 + 0.003)² = 0.3636 m². Floor tiles = ⌈20 ÷ 0.3636 × 1.07⌉ = 59. Skirting area (18 − 0.9) × 0.1 = 1.71 m² → 6 tiles. Total 65 tiles = 17 boxes (3 spares). Grout 0.3 × 21.71 = 6.51 kg. Bed dry = 20 × 0.05 × 1.33 = 1.33 m³ → 8 bags of cement, 1.06 m³ (37.57 cft) of sand.",
        "Countertop (L-shape 3 × 2 m, 0.6 m deep, 20 mm slab, sink 0.8 × 0.45 m, hob 0.6 × 0.5 m): gross 2.64 m², net 1.98 m², order area 3.36 m², slab volume 0.053 m³. Carpet: built-up = 20 ÷ (1 − 0.10) = 22.22 m², super built-up = 22.22 × 1.15 = 25.56 m².",
      ],
      result:
        "One 5 × 4 m room needs 18 bags of cement and 83.67 cft of sand for plaster, 14 L of paint (+ 10 L primer, 126 kg putty), 65 tiles in 17 boxes, and 8 more bags of cement for the tile bed. Every trade shares the same 50.67 m² net wall — change an opening and all seven update together.",
    },
    related: [
      { id: "master-finishes", title: "Complete Finishes Workspace — Seven Trades, One Room", desc: "The same seven trades in the multi-tab workspace, with editable PKR, INR and AED rates." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas in m², sq ft, sq yd, marla and kanal, checked against NBC 2016 minima." },
      { id: "door-window-schedule", title: "Door & Window Schedule Generator", desc: "Frame lengths, glass areas and lintel volumes for every door and window in the room." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project." },
    ],
  },

  "building-setback-calculator": {
    id: "building-setback-calculator",
    intro:
      "A setback is the strip of your plot you are not allowed to build on — the distance the building must sit back from the front, rear and side boundaries. Setbacks, ground coverage and FAR are three separate controls that all limit the same building, and the binding one is whichever leaves the smallest footprint: the setback rectangle, or the coverage cap. This tool works from region presets (LDA Lahore 2019, India Model Building Bye-Laws 2016, Dubai DBC) or from figures you enter yourself — and it is blunt about the presets: they are secondary, unverified summaries (a blog summary for LDA, example bands for MBBL, one Al Barari community for Dubai), not regulation text, and several bands have no sourced setback figures at all, in which case the tool leaves the field for you to fill from your authority. Never build on a preset without confirming it with LDA or your local authority; this tool is not a building permission.",
    formulas: [
      {
        formula: "Buildable frontage = frontage − side setback × (2 if both sides, else 1) − corner extra",
        variables:
          "Side setback applies to both sides where the preset says so, one side only otherwise. A corner plot adds an extra setback on the road-facing side — no sourced value exists, so you enter it.",
      },
      {
        formula: "Buildable depth = depth − front setback − rear setback;  buildable area = frontage × depth",
        variables:
          "The setback rectangle. If either dimension hits zero, the setbacks consume the whole plot and nothing can be built at these setbacks.",
      },
      {
        formula: "Setback footprint % = buildable area ÷ plot area × 100 — NOT the regulatory coverage",
        variables:
          "A common confusion: the setback percentage is geometry, the coverage % is a regulation. They are compared, not equated.",
      },
      {
        formula: "Coverage cap = plot area × max coverage %;  buildable footprint = min(buildable area, coverage cap)",
        variables:
          "Whichever is smaller binds: if the coverage cap is smaller, coverage binds; otherwise the setbacks bind.",
      },
      {
        formula: "Commercial front setback: at least 4.5 m, at least 6.0 m where the approach road is wider than 18 m",
        variables:
          "A planning rule carried in the engine (not a regulation citation) — the tool raises a smaller entered front setback to these floors for commercial buildings.",
      },
    ],
    tables: [
      {
        title: "LDA Lahore presets (2019 — secondary blog summary, unverified; setbacks are society-practice figures)",
        headers: ["Plot band", "Front / Rear / Side", "Max coverage", "Max FAR", "Storeys", "Max height"],
        rows: [
          ["Under 5 marla", "5 ft / 5 ft / none", "80%", "2.4", "3", "38 ft"],
          ["5 – under 10 marla", "Not sourced", "75%", "2.3", "3", "38 ft"],
          ["10 marla – under 1 kanal", "10 ft / 7 ft / 5 ft one side", "70%", "2.8", "4", "45 ft"],
          ["1 – 30 marla", "Not sourced / 5 ft each side", "65%", "2.6", "4", "45 ft"],
          ["Over 30 marla – under 2 kanal", "Not sourced / 5 ft each side", "60%", "2.4", "4", "45 ft"],
          ["2 kanal and above", "Not sourced / 5 ft each side", "55%", "2.2", "4", "45 ft"],
        ],
      },
      {
        title: "Other presets (secondary / example only — verify against the regulation text)",
        headers: ["Preset", "Max coverage", "Max FAR"],
        rows: [
          ["MBBL 2016 — up to 360 m²", "75%", "1.75"],
          ["MBBL 2016 — 361–1,000 m²", "65%", "2.25"],
          ["MBBL 2016 — 1,001–2,000 m²", "60%", "2.5"],
          ["MBBL 2016 — 2,001–4,000 m²", "55%", "3.0"],
          ["Dubai DBC — villa (Al Barari example only)", "40%", "0.60"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 30 ft × 60 ft plot, LDA 10-marla preset",
      inputs:
        "Plot frontage 9.14 m (30 ft) × depth 18.29 m (60 ft) = 167.17 m². LDA 10 marla – under 1 kanal preset: front 10 ft (3.048 m), rear 7 ft (2.134 m), side 5 ft (1.524 m) on one side, max coverage 70%.",
      steps: [
        "Buildable frontage = 9.14 − 1.524 = 7.616 m (one side only).",
        "Buildable depth = 18.29 − 3.048 − 2.134 = 13.108 m.",
        "Buildable area = 7.616 × 13.108 = 99.83 m² — 59.7% of the plot.",
        "Coverage cap = 167.17 × 70% = 117.02 m². The setback rectangle (99.83 m²) is smaller, so the setbacks bind and the buildable footprint is 99.83 m².",
      ],
      result:
        "On a 30 × 60 ft plot under the LDA 10-marla preset, the setbacks leave a 7.62 m × 13.11 m rectangle (99.83 m², 59.7% of the plot) — the setbacks bind, not the 70% coverage cap. All preset figures are unverified secondary summaries: confirm the setbacks with LDA before designing on them.",
    },
    related: [
      { id: "far-fsi-calculator", title: "FAR / FSI Calculator — Built-Up Area & Storeys", desc: "The other half of the same question: how much total floor area the FAR allows on this plot." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas and NBC 2016 minima for the rooms inside the footprint." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Price the house that fits inside the buildable footprint." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project." },
    ],
  },

  "door-window-schedule": {
    id: "door-window-schedule",
    intro:
      "A door and window schedule is the joinery list for a building: every opening marked (D1, D2, W1…), with its room, leaf size, frame material, shutter type, glass, sill height and quantity — and from those, the frame length, glass area, lintel length and volume, clear passage width and cost. The geometry follows the frame, not the leaf: the frame-outer size is the leaf plus one frame section on each side, the wall opening is the frame-outer size plus 10 mm clearance, and the lintel is the opening plus 150 mm bearing on each side. A door frame is two jambs plus a head — no sill member — so its length is 2H + W, not the full perimeter; the old code used the full perimeter for doors and overstated a 1.2 × 2.1 m door frame by 7.20 m against the true 5.80 m. Leaf sizes are labelled typical — confirm every one on the drawing.",
    formulas: [
      {
        formula: "Frame-outer W = leaf W + 2 × section;  frame-outer H = leaf H + section (door) or + 2 × section (window)",
        variables:
          "Section is the frame section width (default 100 mm). A door frame has a head but no bottom sill, so it adds one section in height; a window adds two.",
      },
      {
        formula: "Opening W = frame-outer W + 20 mm;  opening H = frame-outer H + 10 mm (door) or + 20 mm (window)",
        variables:
          "10 mm clearance per side. A door opening sits on the floor, so it gets clearance at the head only; a window gets it top and bottom.",
      },
      {
        formula: "Clear passage W = leaf W − 2 × 25 mm",
        variables:
          "The 25 mm per side is the door-stop allowance — the width a person (or a sofa) actually gets through.",
      },
      {
        formula: "Door frame length = 2 × frame-outer H + frame-outer W;  window frame length = 2 × (frame-outer H + frame-outer W)",
        variables:
          "Doors have no sill member; windows and ventilators have one, so they take the full perimeter.",
      },
      {
        formula: "Glass area = (leaf W − 2 × section) × (leaf H − section − 50 mm)",
        variables:
          "The 50 mm is a labelled assumption for the sill rail. Glazed shutters only — a solid door has zero glass area.",
      },
      {
        formula: "Lintel length = opening W + 2 × 0.15 m;  lintel volume = length × 0.15 m × wall thickness",
        variables:
          "150 mm bearing each side; the lintel section is 0.15 m deep × the wall thickness (default 0.23 m).",
      },
    ],
    tables: [
      {
        title: "Preset leaf sizes (typical — confirm on the drawing)",
        headers: ["Mark", "Type", "Room", "Leaf (m)", "Sill (m)"],
        rows: [
          ["D1", "Door, solid timber", "Entrance", "1.067 × 2.134", "0"],
          ["D2", "Door, flush timber", "Bedroom", "0.914 × 2.134", "0"],
          ["D3", "Door, flush UPVC, frosted", "Bathroom", "0.686 × 2.134", "0"],
          ["D4", "Door, panelled timber", "Entrance", "1.524 × 2.134", "0"],
          ["W1", "Window, sliding UPVC, clear 5 mm", "Bedroom", "1.219 × 1.219", "0.9"],
          ["W2", "Window, sliding UPVC, clear 5 mm", "Living", "1.524 × 1.219", "0.75"],
          ["W3", "Window, sliding aluminium, clear 5 mm", "Kitchen", "1.219 × 0.914", "1.05"],
          ["W4", "Window, fixed UPVC, frosted", "Bathroom", "0.61 × 0.457", "1.5"],
          ["V1", "Ventilator, louvred steel", "Bathroom", "0.6 × 0.45", "1.8"],
        ],
      },
      {
        title: "Validation limits",
        headers: ["Input", "Limit"],
        rows: [
          ["Quantity", "1–99, whole number"],
          ["Sill height", "0–1.8 m"],
          ["Frame section", "1–200 mm"],
          ["Door height warning", "Above 2.6 m — confirm on the drawing"],
          ["Single leaf width warning", "Above 2.4 m — consider a double door"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — the tool's default schedule (D1, D2 × 3, W1 × 2)",
      inputs:
        "D1 entrance door: leaf 1.2 × 2.1 m, timber, solid, no glass, 100 mm frame, qty 1. D2 bedroom door: 0.9 × 2.1 m, qty 3. W1 living window: 1.5 × 1.2 m, UPVC, sliding, clear 5 mm glass, sill 0.9 m, qty 2. Wall thickness 0.23 m.",
      steps: [
        "D1: leaf area 1.2 × 2.1 = 2.52 m². Frame-outer 1.4 × 2.2 m. Opening 1.42 × 2.21 m. Clear width 1.2 − 0.05 = 1.15 m. Frame length 2 × 2.2 + 1.4 = 5.80 m. Lintel 1.42 + 0.30 = 1.72 m, volume 1.72 × 0.15 × 0.23 = 0.059 m³.",
        "D2 (each): leaf 1.89 m², frame-outer 1.1 × 2.2 m, opening 1.12 × 2.21 m, clear 0.85 m, frame 5.50 m, lintel 1.42 m / 0.049 m³.",
        "W1 (each): leaf 1.8 m², frame-outer 1.7 × 1.4 m, opening 1.72 × 1.42 m, clear 1.45 m, frame 2 × (1.4 + 1.7) = 6.20 m, glass (1.5 − 0.2) × (1.2 − 0.1 − 0.05) = 1.365 m², lintel 2.02 m / 0.070 m³.",
        "Schedule totals: leaf area 11.79 m², frame length 34.7 running metres, glass 2.73 m², lintel concrete 0.346 m³, hardware 6 sets.",
      ],
      result:
        "Three marks, six openings: 11.79 m² of leaves, 34.7 r.m of frame, 2.73 m² of glass and 0.346 m³ of lintel concrete. No cost is shown until frame, leaf and hardware rates are entered — a null rate means “—”, never zero.",
    },
    related: [
      { id: "interiors-finishes", title: "Interiors & Finishes Estimator — Seven Trades, One Room", desc: "Plaster, paint and flooring for the same rooms, with IS 1200 opening deductions." },
      { id: "master-finishes", title: "Complete Finishes Workspace — Seven Trades, One Room", desc: "The same seven trades in the multi-tab workspace." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks and mortar for the walls the openings sit in." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas and NBC 2016 minima for the rooms the schedule serves." },
      { id: "ventilation-checker", title: "Ventilation Checker — Glazing, ACH & ASHRAE 62.1", desc: "Whether the windows in the schedule give the room enough glazing and openable area." },
    ],
  },

  "far-fsi-calculator": {
    id: "far-fsi-calculator",
    intro:
      "FAR (floor area ratio, called FSI — floor space index — in India) is the planning control that caps how much floor area you may build on a plot: total built-up area divided by plot area. A FAR of 2.8 on a 209 m² plot allows 585 m² of floors in total. Three limits compete for the number of storeys — the FAR itself, the height limit divided by the floor-to-floor height, and the maximum storeys — and the smallest of the three binds (ties keep the earliest: FAR, then height, then storeys). The same honesty rule as the setback tool applies: the LDA, MBBL and Dubai presets are secondary, unverified summaries, not regulation text. LDA counts basements toward FAR, India exempts stilt parking, balconies within limits and service areas, and Dubai lists explicit GFA inclusions and exclusions in DBC Table A.3 — check what counts before sizing floors.",
    formulas: [
      {
        formula: "FAR / FSI = total built-up area (GFA) ÷ plot area",
        variables:
          "FAR 1.0 means the total floor area equals the plot area; FAR 2.8 means 2.8 times the plot. Dubai allows 12 and above on some plots.",
        note: "FAR is a ratio, not a percentage — FAR 2.8 is 280% of the plot area in floors.",
      },
      {
        formula: "Max built-up = plot × FAR;  max footprint = plot × coverage %",
        variables:
          "Coverage caps one floor; FAR caps all floors together. Both must be satisfied.",
      },
      {
        formula: "Floors by FAR = ⌊max built-up ÷ max footprint⌋;  floors by height = ⌊max height ÷ floor-to-floor height⌋",
        variables:
          "Floor-to-floor height defaults to 3.05 m (10 ft). Floors are whole numbers — a fraction of a floor cannot be built, so both are rounded down.",
        note: "If floors by FAR is 0, the FSI is below the coverage — no full floor is possible at that coverage. Raise the FAR or lower the coverage.",
      },
      {
        formula: "Max floors = min(floors by FAR, floors by height, max storeys)",
        variables:
          "The binding constraint is whichever is smallest. A tie keeps the earliest: FAR first, then height, then storeys.",
      },
    ],
    tables: [
      {
        title: "LDA Lahore presets (2019 — secondary blog summary, unverified)",
        headers: ["Plot band", "Max coverage", "Max FAR", "Storeys", "Max height"],
        rows: [
          ["Under 5 marla", "80%", "2.4", "3", "38 ft"],
          ["5 – under 10 marla", "75%", "2.3", "3", "38 ft"],
          ["10 marla – under 1 kanal", "70%", "2.8", "4", "45 ft"],
          ["1 – 30 marla", "65%", "2.6", "4", "45 ft"],
          ["Over 30 marla – under 2 kanal", "60%", "2.4", "4", "45 ft"],
          ["2 kanal and above", "55%", "2.2", "4", "45 ft"],
        ],
      },
      {
        title: "What counts toward the built-up area (GFA)",
        headers: ["Region", "Rule"],
        rows: [
          ["LDA Lahore", "Basements count toward FAR — check whether your basement is counted before sizing floors"],
          ["India (MBBL 2016)", "Covered area on all floors, excluding stilt parking, balconies within limits and service areas"],
          ["Dubai (DBC)", "Table A.3 lists explicit GFA inclusions and exclusions — confirm against the plot's Affection Plan"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 10 marla plot, LDA preset (FAR 2.8, coverage 70%)",
      inputs:
        "Plot 209.03 m² (10 marla, society standard). LDA 10 marla – under 1 kanal preset: FAR 2.8, coverage 70%, max height 45 ft (13.716 m), max 4 storeys, floor-to-floor 3.05 m.",
      steps: [
        "Max built-up = 209.03 × 2.8 = 585.28 m². Max footprint = 209.03 × 70% = 146.32 m².",
        "Floors by FAR = ⌊585.28 ÷ 146.32⌋ = 4 floors.",
        "Floors by height = ⌊13.716 ÷ 3.05⌋ = 4 floors.",
        "Max storeys = 4. The smallest is 4, and the FAR constraint wins the tie — the binding constraint is FAR.",
      ],
      result:
        "585.28 m² of total built-up area on a 209.03 m² plot, in 4 floors of up to 146.32 m² each — binding constraint FAR. Remember the preset is an unverified secondary summary: confirm the FAR with LDA before designing on it, and check whether your basement counts.",
    },
    related: [
      { id: "building-setback-calculator", title: "Building Setback Calculator — Buildable Footprint", desc: "The other half of the same question: how far back from each boundary the building must sit." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Price the house that the FAR allows on this plot." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Construction Cost Calculator", desc: "Cost per sq ft by city and finish tier." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas and NBC 2016 minima for the rooms inside the allowed floors." },
      { id: "master-quantity", title: "Master Quantity Estimator — Full Project Takeoff", desc: "Quantity takeoff for the whole project." },
    ],
  },

  "master-finishes": {
    id: "master-finishes",
    intro:
      "The Complete Finishes Workspace is the finishes estimator with the whole room in one place: enter the room and its openings once, and get masonry, plaster, paint, flooring, countertops, carpentry and carpet in seven tabs — with quantities and costs worked out per room and rates editable in PKR, INR and AED. It runs the same single finishes engine as the Interiors & Finishes Estimator (one engine, one truth), so the two tools can never disagree about a room; the workspace is the fuller presentation, with the cost lines shown trade by trade. The same house rules apply throughout: brick count is wall volume divided by brick-with-mortar volume, dry mortar is wet × 1.33, a 50 kg cement bag is 0.0347 m³, and plaster opening deductions follow IS 1200. A rate quoted per 1,000 bricks is divided by 1,000, and an unknown rate shows “—”, never zero.",
    formulas: [
      {
        formula: "Gross wall = 2 × (L + W) × H × faces;  net wall = gross − deductions + jambs",
        variables:
          "IS 1200 deductions: under 0.5 m² none, 0.5–3 m² one face, over 3 m² both faces plus jambs (2h + w) × jamb depth (default 0.23 m).",
      },
      {
        formula: "Masonry: N = V_wall ÷ V_brick+mortar;  mortar dry = (V_wall − N × V_brick) × 1.15 × 1.33 × (1 + wastage %)",
        variables:
          "The 1.15 factor covers mortar pressed into the brick frogs; 1.33 converts wet mortar to dry volume. Cement bags = V_cement ÷ 0.0347, rounded up.",
      },
      {
        formula: "Plaster: wet = area × thickness;  dry = wet × 1.33 × (1 + wastage %);  bags = ⌈dry × c⁄(c+s) ÷ 0.0347⌉",
        variables:
          "Defaults: internal 12 mm, external 20 mm, 1:4 mix, uneven-surface factor 1.10, wastage 5%. Ceiling plaster is added at the internal thickness when included.",
      },
      {
        formula: "Paint: litres = paintable area × coats ÷ coverage × (1 + wastage %);  primer = area × primer coats ÷ primer coverage",
        variables:
          "Defaults: coverage 11 m²/L, primer 7 m²/L, 2 coats, 1 primer coat, putty 1.1 m²/kg over 2 coats, wastage 10%. Packs split largest-first: 20 L, 10 L, 4 L, 1 L.",
      },
      {
        formula: "Tiles = ⌈floor area ÷ ((tile L + grout) × (tile W + grout)) × (1 + wastage %)⌉;  pattern wastage straight 7% / brick-bond 10% / diagonal 14% / herringbone 16%",
        variables:
          "Skirting tiles are counted separately as cut strips, never folded into the floor area. Mortar bed dry = floor area × bed thickness × 1.33.",
      },
      {
        formula: "Countertop (L-shape): gross = A×d + (B−d)×d;  order = (gross + skirting) × (1 + wastage %);  slab volume = gross × thickness",
        variables:
          "Net area deducts sink and hob cutouts. Edge polish for an L-shape is A + B; skirting length is A + B + d.",
      },
      {
        formula: "Carpentry: studs = ⌈perimeter ÷ spacing⌉ (+1 only for an open run);  sheets = ⌈wall area × (1 + wastage %) ÷ sheet area ÷ reuse⌉",
        variables:
          "Reuse divides only formwork/shuttering; fixed panelling is divided by 1. A closed room needs no +1 stud.",
      },
      {
        formula: "Carpet area = floor area;  built-up = carpet ÷ (1 − wall deduction %);  super built-up = built-up × (1 + loading %)",
        variables:
          "The deduction % is a labelled assumption. The parts-based alternative adds internal-wall and common areas directly.",
      },
    ],
    tables: [
      {
        title: "The seven trades in the workspace",
        headers: ["Trade", "What it returns"],
        rows: [
          ["Masonry", "Brick count, mortar, cement bags, sand"],
          ["Plaster", "Wet and dry mortar, cement bags, sand (internal + external + ceiling)"],
          ["Paint", "Paintable area, primer, paint, putty, pack split"],
          ["Flooring", "Tiles, boxes, spares, skirting tiles, grout, mortar bed"],
          ["Countertops", "Gross/net/order area, edge polish, slab volume"],
          ["Carpentry", "Studs and sheets"],
          ["Carpet / built-up", "Carpet, built-up and super built-up area"],
        ],
      },
      {
        title: "Defaults the workspace starts from",
        headers: ["Item", "Default"],
        rows: [
          ["Room", "5 m × 4 m × 3 m, one face, door 0.9 × 2.1 m + window 1.2 × 1.2 m"],
          ["Brick", "Pakistani Awwal 230 × 110 × 75 mm, 10 mm joint, 230 mm wall, 1:4, wastage 5%"],
          ["Plaster", "12 mm internal / 20 mm external, 1:4, uneven 1.10, wastage 5%"],
          ["Paint", "11 m²/L, primer 7 m²/L, 2 coats, putty 1.1 m²/kg × 2 coats"],
          ["Tiles", "600 × 600 mm, 3 mm grout, 4 per box, bed 50 mm 1:4"],
          ["Countertop", "20 mm slab, sink + hob cutouts, wastage 5%"],
          ["Stud spacing", "0.4 m"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one room, 6 m × 5 m × 3.2 m, all seven trades",
      inputs:
        "Room 6 × 5 × 3.2 m, one face, jamb depth 0.23 m; one door 0.9 × 2.1 m, two windows 1.5 × 1.2 m. Plaster 12/20 mm, 1:4, uneven 1.10, wastage 5%, ceiling included. Paint 11 m²/L, primer 7 m²/L, 2 coats, 1 primer coat, putty 1.1 m²/kg × 2 coats, wastage 10%, skirting 0.1 m deducted. Tiles 600 × 600 mm, 3 mm grout, straight, 4 per box, skirting 0.1 m, door width 0.9 m, bed 50 mm 1:4. Countertop L-shape 3 × 2 m, 0.6 m deep, 20 mm slab, sink + hob. Carpet deduction 10%, loading 15%.",
      steps: [
        "Gross wall = 2 × (6 + 5) × 3.2 = 70.4 m². Openings: door 1.89 m² and two windows of 1.8 m² each are all in the 0.5–3 m² band, so each deducts one face: 5.49 m². Net wall = 64.91 m². Floor = 30 m², perimeter = 22 m.",
        "Plaster: internal wet (64.91 + 30) × 0.012 = 1.14 m³; external wet 70.4 × 0.02 = 1.41 m³; wet total × 1.10 = 2.80 m³; dry = 2.80 × 1.33 × 1.05 = 3.91 m³. Cement = 3.91 ÷ 5 = 0.78 m³ → 23 bags. Sand = 3.13 m³ = 110.53 cft.",
        "Paint: paintable = 64.91 + 30 − 22 × 0.1 = 92.71 m². Primer = ⌈92.71 ÷ 7⌉ = 14 L. Paint = ⌈92.71 × 2 ÷ 11 × 1.10⌉ = 19 L (1 × 10 L + 2 × 4 L + 1 × 1 L). Putty = ⌈92.71 × 2 ÷ 1.1⌉ = 169 kg.",
        "Flooring: effective tile (0.603)² = 0.3636 m². Floor tiles = ⌈30 ÷ 0.3636 × 1.07⌉ = 89. Skirting (22 − 0.9) × 0.1 = 2.11 m² → 7 tiles. Total 96 tiles = 24 boxes, 0 spares. Grout 9.63 kg. Bed dry = 30 × 0.05 × 1.33 = 2.00 m³ → 12 bags of cement, 1.60 m³ (56.36 cft) of sand.",
        "Countertop (L-shape): gross 2.64 m², net 1.98 m² after sink and hob cutouts, order area 3.36 m², slab volume 0.053 m³. Carpet: built-up = 30 ÷ (1 − 0.10) = 33.33 m², super built-up = 33.33 × 1.15 = 38.33 m².",
      ],
      result:
        "One 6 × 5 m room: plaster 23 bags + 110.53 cft sand; paint 19 L + 14 L primer + 169 kg putty; flooring 96 tiles in 24 boxes with 12 bags of cement for the bed; countertop order 3.36 m²; super built-up 38.33 m². Change a window and all seven trades update from the same net wall area.",
    },
    related: [
      { id: "interiors-finishes", title: "Interiors & Finishes Estimator — Seven Trades, One Room", desc: "The same engine in the single-room estimator — identical quantities, different presentation." },
      { id: "brick-calculator", title: "Brick Calculator Pakistan, India, UAE", desc: "Bricks, cement bags, sand and total cost for any wall." },
      { id: "door-window-schedule", title: "Door & Window Schedule Generator", desc: "Frame lengths, glass areas and lintel volumes for every door and window in the room." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas and NBC 2016 minima for the rooms the workspace serves." },
      { id: "rates", title: "Live Rates Calculator — Material & Labour Rates", desc: "The dated, sourced rate table the workspace prices from." },
    ],
  },

  "room-area-calculator": {
    id: "room-area-calculator",
    intro:
      "A room has three areas, and they are not the same number: the carpet area you can stand on, the built-up area including the walls, and the super built-up area including a share of the common spaces. This tool computes all three from the room's length, width and wall thickness, converts them into m², sq ft, sq yd, marla and kanal, and checks the room against the NBC 2016 Part 3 minima for its type — a bedroom must be at least 9.5 m² and 2.4 m wide, a kitchen 5.0 m² and 1.8 m wide, a bathroom with WC 2.8 m² and 1.2 m wide, a WC alone 1.1 m² and 0.9 m wide. One warning the tool itself carries: BIS replaced NBC 2016 with NBCS 2026 (SP 7:2026) on 30 April 2026, and the NBCS 2026 minima have not been verified against SP 7:2026 — confirm the current code before relying on this check.",
    formulas: [
      {
        formula: "Carpet area = L × W",
        variables:
          "The clear floor area inside the walls — the area you furnish.",
      },
      {
        formula: "Built-up area = (L + 2t) × (W + 2t)",
        variables:
          "t = wall thickness (0.05–0.5 m). The walls are added on both sides of each dimension, so the built-up area includes the wall footprint.",
      },
      {
        formula: "Super built-up area = built-up × (1 + loading factor %)",
        variables:
          "The loading factor is the share of common areas (lobbies, stairs, lifts) added to the flat's built-up area. The reverse mode recovers the carpet area from a super built-up area by solving the same relation backwards.",
      },
      {
        formula: "Room volume = carpet area × ceiling height",
        variables:
          "Ceiling height is optional (2.4–6 m when given) — the volume is what the ventilation checker needs.",
      },
      {
        formula: "Conversions: 1 m² = 10.7639 sq ft;  1 marla = 272.25 sq ft = 25.293 m²;  1 kanal = 20 marla = 5,445 sq ft",
        variables:
          "Note the marla here is the revenue marla (272.25 sq ft), not the 225 sq ft society marla used elsewhere on the site — check which one your document means.",
      },
    ],
    tables: [
      {
        title: "NBC 2016 Part 3 minima (NBCS 2026 not yet verified — confirm the current code)",
        headers: ["Room", "Min area (m²)", "Min width (m)"],
        rows: [
          ["Bedroom / living (first habitable room)", "9.5", "2.4"],
          ["Dining / study (second habitable room)", "7.5", "2.1"],
          ["Kitchen", "5.0", "1.8"],
          ["Bathroom + WC", "2.8", "1.2"],
          ["WC alone", "1.1", "0.9"],
        ],
      },
      {
        title: "Area conversions",
        headers: ["Unit", "1 m² equals"],
        rows: [
          ["Square feet", "10.7639 sq ft"],
          ["Square yards", "1.19599 sq yd"],
          ["Marla (revenue, 272.25 sq ft)", "0.0395 marla"],
          ["Kanal (5,445 sq ft)", "0.00198 kanal"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — a bedroom 4 m × 3.6 m, walls 0.23 m, ceiling 3 m",
      inputs:
        "Bedroom, length 4 m, width 3.6 m, wall thickness 0.23 m, ceiling height 3 m, loading factor 15%.",
      steps: [
        "Carpet area = 4 × 3.6 = 14.4 m² = 155.00 sq ft = 17.22 sq yd = 0.57 marla.",
        "Built-up area = (4 + 0.46) × (3.6 + 0.46) = 4.46 × 4.06 = 18.11 m² = 194.91 sq ft.",
        "Super built-up = 18.11 × 1.15 = 20.82 m² = 224.14 sq ft.",
        "Volume = 14.4 × 3 = 43.2 m³.",
        "Compliance: 14.4 m² ≥ 9.5 m² and width 3.6 m ≥ 2.4 m — the room PASSES the NBC 2016 bedroom minima.",
        "Contrast: a 3 m × 2.5 m bedroom is 7.5 m² — it fails by 2.0 m² (width 2.5 m passes), so it cannot be called a bedroom under NBC 2016.",
      ],
      result:
        "A 4 × 3.6 m bedroom is 14.4 m² carpet, 18.11 m² built-up, 20.82 m² super built-up and 43.2 m³ in volume — and it passes the NBC 2016 minima. A 3 × 2.5 m room at 7.5 m² fails the same check by 2 m².",
    },
    related: [
      { id: "building-setback-calculator", title: "Building Setback Calculator — Buildable Footprint", desc: "How much of the plot the building may occupy in the first place." },
      { id: "far-fsi-calculator", title: "FAR / FSI Calculator — Built-Up Area & Storeys", desc: "How much total floor area the FAR allows on the plot." },
      { id: "interiors-finishes", title: "Interiors & Finishes Estimator — Seven Trades, One Room", desc: "Plaster, paint and flooring for the same room, from the same dimensions." },
      { id: "ventilation-checker", title: "Ventilation Checker — Glazing, ACH & ASHRAE 62.1", desc: "Whether this room's windows and airflow meet the standard — it needs the room volume." },
      { id: "area-space-calculator", title: "Area & Space Calculator", desc: "Floor areas and space planning from room dimensions." },
    ],
  },

  "staircase-design-reference": {
    id: "staircase-design-reference",
    intro:
      "The Staircase Design Reference is a code-compliance checker, not a quantity calculator: give it the floor-to-floor height, a target riser and going, the width, headroom, landing depth, occupancy and handrail height, and it tells you whether the stair passes NBC 2016 Part 3 (stair widths, risers and goings) and Part 4 (flights, handrails, headroom) — every check, not just one. It works out the riser count from the height, the true riser (the height divided by the count, which is what you actually build), the comfort rule 2R + T, the run, the flight split, and the stairwell size for both a straight and a dog-legged stair. It calculates no cost and no concrete: for quantities and the IS 456 waist-slab design, use the Staircase Calculator. The residential minimum width used here (1.0 m) is stricter than NBC's 0.9 m, and the going is measured clear of the 25 mm nosing projection.",
    formulas: [
      {
        formula: "Risers = ⌈total height ÷ target riser⌉;  actual riser = total height ÷ risers;  treads = risers − 1",
        variables:
          "Rounding up guarantees the actual riser never exceeds the target. A stair with n risers has n − 1 goings — the top riser meets the landing, which is itself the last tread.",
        note: "The old staircase engine used n × tread for the run (one tread too long); this tool and the fixed engine both use (n − 1) × tread.",
      },
      {
        formula: "2R + T = 600–650 mm (Blondel's comfort rule, NBC)",
        variables:
          "R = actual riser, T = going (tread). A 170 mm riser with a 280 mm tread gives 620 mm — comfortable. The component also notes the 600–640 mm variant in its FAQ.",
        note: "The engine's pass band is 600–650 mm; a stair outside it fails the ergonomics check even if every other check passes.",
      },
      {
        formula: "Run = treads × going;  flights = ⌈risers ÷ max risers per flight⌉;  risers per flight = ⌈risers ÷ flights⌉",
        variables:
          "NBC 2016 Part 4: maximum 12 risers per flight for residential stairs, 15 for commercial (and other occupancies here).",
      },
      {
        formula: "Straight stairwell = run + landing depth;  dog-legged width = 2 × W + 0.1 m;  dog-legged length = (risers per flight − 1) × going + landing depth",
        variables:
          "The dog-legged length uses the longest flight's run, not half the total run — with an uneven split the longer flight sets the length. The 0.1 m is the gap between the two flights.",
      },
      {
        formula: "PASS requires every check: width ≥ minimum, riser ≤ maximum, going ≥ minimum, headroom ≥ 2.1 m, landing depth ≥ width, handrail 800–900 mm, 2R + T in 600–650 mm",
        variables:
          "One failed check fails the stair. The old version left handrail height and the 2R + T band out of the PASS test, so a stair with a 700 mm handrail or a 500 mm 2R + T still showed PASS.",
      },
    ],
    tables: [
      {
        title: "NBC 2016 Part 3 occupancy specs (as used by the tool)",
        headers: ["Occupancy", "Min width (m)", "Max riser (mm)", "Min going (mm)", "Max risers / flight"],
        rows: [
          ["Residential", "1.0", "190", "250", "12"],
          ["Commercial", "1.5", "150", "300", "15"],
          ["Educational", "1.5", "150", "300", "15"],
          ["Assembly", "2.0", "150", "300", "15"],
          ["Hospital", "2.0", "150", "300", "15"],
        ],
      },
      {
        title: "The seven compliance checks",
        headers: ["Check", "Pass when"],
        rows: [
          ["Width", "≥ occupancy minimum"],
          ["Riser", "Actual riser ≤ occupancy maximum"],
          ["Going", "≥ occupancy minimum"],
          ["Headroom", "≥ 2.1 m"],
          ["Landing", "Depth ≥ stair width"],
          ["Handrail", "800–900 mm"],
          ["Ergonomics", "2R + T between 600 and 650 mm"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — commercial stair, 3.0 m floor (the tool's defaults)",
      inputs:
        "Total height 3.0 m, target riser 150 mm, going 300 mm, width 1.5 m, headroom 2.2 m, landing depth 1.5 m, commercial occupancy, handrail 900 mm.",
      steps: [
        "Risers = ⌈3,000 ÷ 150⌉ = 20. Actual riser = 3,000 ÷ 20 = 150 mm. Treads = 19.",
        "2R + T = 2 × 150 + 300 = 600 mm — inside the 600–650 mm band.",
        "Run = 19 × 0.3 = 5.7 m. Max 15 risers per flight (commercial), so flights = ⌈20 ÷ 15⌉ = 2, with 10 risers per flight.",
        "Straight stairwell = 5.7 + 1.5 = 7.2 m long. Dog-legged stairwell = 2 × 1.5 + 0.1 = 3.1 m wide × (10 − 1) × 0.3 + 1.5 = 4.2 m long.",
        "Checks: width 1.5 ≥ 1.5 ✓; riser 150 ≤ 150 ✓; going 300 ≥ 300 ✓; headroom 2.2 ≥ 2.1 ✓; landing 1.5 ≥ 1.5 ✓; handrail 900 in 800–900 ✓; 2R + T 600 in band ✓ — all seven pass.",
      ],
      result:
        "A 3.0 m commercial floor needs 20 risers in 2 flights of 10, a 5.7 m run, and a dog-legged stairwell 3.1 m × 4.2 m — and it passes all seven NBC checks. The same inputs can be sent to the Staircase Calculator for the concrete, steel and formwork quantities.",
    },
    related: [
      { id: "staircase-calculator", title: "Staircase Calculator — IS 456 Waist-Slab Design & Quantities", desc: "Concrete, designed steel and formwork for the same stair, with the IS 456 Cl. 33 waist-slab check." },
      { id: "master-rcc", title: "Master RCC Estimator — Concrete, Steel & Formwork", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room areas and NBC 2016 minima for the rooms the stair serves." },
      { id: "building-setback-calculator", title: "Building Setback Calculator — Buildable Footprint", desc: "How much of the plot the building — and its stairwell — may occupy." },
      { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for the stair soffit and risers." },
    ],
  },

  "ventilation-checker": {
    id: "ventilation-checker",
    intro:
      "The Ventilation Checker tests a room three ways and keeps the three answers separate: the glazing rule (enough window area, and enough of it openable), the air-changes-per-hour rule (enough total supply air), and the ASHRAE 62.1 rule (enough outdoor air). The last two are not the same quantity — ASHRAE gives outdoor air, ACH gives total supply air — and the tool warns you not to compare them directly. The glazing ratios come from the Pakistan Building Code / NBC 2016 Part 8 as applicable (Dry Hot 1/10, Intermediate 1/8, Wet Hot 1/6 of floor area, with at least 50% of it openable); the clause number is not asserted in the engine, so verify it before publishing. Exhaust fans are sized on the ASHRAE 62.2 exhaust rate for the room (kitchen 100 CFM, bathroom 50 CFM intermittent), not on the whole-room ACH airflow — sizing a kitchen fan from volume × ACH once specified a 600 CFM commercial hood for a 90 m³ kitchen.",
    formulas: [
      {
        formula: "Required glazing = floor area ÷ ratio;  required openable = 50% × required glazing",
        variables:
          "Ratio: Dry Hot 10, Intermediate 8, Wet Hot 6. Minimums override the ratio: kitchen at least 1.0 m², bathroom at least 0.3 m².",
        note: "Actual openable = window area × openable fraction %. Both the glazing and the openable checks must pass.",
      },
      {
        formula: "Required airflow = room volume × target ACH;  one air change every 60 ÷ ACH minutes",
        variables:
          "Volume = floor area × height. Convert m³/h to CFM with × 0.5886.",
      },
      {
        formula: "ASHRAE 62.1: Vbz = Rp × Pz + Ra × Az;  Voz = Vbz ÷ Ez",
        variables:
          "Vbz = breathing-zone outdoor airflow (L/s); Rp = outdoor air per person, Ra = per m² of floor; Pz = occupants, Az = floor area; Ez = zone air-distribution effectiveness (default 1.0). Convert L/s to m³/h with × 3.6, to CFM with × 2.119.",
      },
      {
        formula: "Exhaust fan = next standard size ≥ ASHRAE 62.2 intermittent rate (kitchen 100 CFM, bathroom 50 CFM)",
        variables:
          "Standard sizes: 50, 100, 150, 200, 250, 300, 400, 600 CFM. Continuous rates are 25 CFM (kitchen) / 20 CFM (bathroom); the intermittent rates are the default sizing basis.",
      },
    ],
    tables: [
      {
        title: "Glazing ratios by climate (Pakistan Building Code / NBC 2016 Part 8 as applicable)",
        headers: ["Climate", "Glazing ratio", "Openable"],
        rows: [
          ["Dry Hot", "1/10 of floor area", "50% of glazing"],
          ["Intermediate", "1/8 of floor area", "50% of glazing"],
          ["Wet Hot", "1/6 of floor area", "50% of glazing"],
        ],
      },
      {
        title: "Target air changes per hour (ACH)",
        headers: ["Room", "Target ACH"],
        rows: [
          ["Bedroom", "4"],
          ["Living room", "4"],
          ["Kitchen", "10"],
          ["Bathroom", "8"],
          ["Office", "6"],
          ["Classroom", "6"],
        ],
      },
      {
        title: "ASHRAE 62.1 planning defaults (Rp L/s per person / Ra L/s per m²)",
        headers: ["Room", "Rp", "Ra"],
        rows: [
          ["Bedroom / living / office", "2.5", "0.3"],
          ["Kitchen / bathroom", "5", "0.3"],
          ["Classroom", "5", "0.6"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — a bedroom 4 m × 3.6 m × 3 m, Intermediate climate",
      inputs:
        "Bedroom, 4 × 3.6 × 3 m, Intermediate climate, 2 occupants, window area 2.4 m², 50% openable. No existing mechanical airflow.",
      steps: [
        "Floor area = 4 × 3.6 = 14.4 m²; volume = 14.4 × 3 = 43.2 m³.",
        "Glazing: required = 14.4 ÷ 8 = 1.80 m²; required openable = 0.90 m². Actual glazing 2.4 m² and actual openable 2.4 × 50% = 1.2 m² — both pass. Recommended windows: ⌈0.90 ÷ 1.8⌉ = 1 window of 1.2 m × 1.5 m.",
        "ACH: required airflow = 43.2 × 4 = 172.8 m³/h = 101.7 CFM; one air change every 15 minutes.",
        "ASHRAE 62.1: Vbz = 2.5 × 2 + 0.3 × 14.4 = 9.32 L/s; Voz = 9.32 ÷ 1.0 = 33.55 m³/h (19.75 CFM) of outdoor air — a different quantity from the 172.8 m³/h total supply air, so do not compare them.",
        "Contrast — a 3 × 3 × 3 m kitchen (Intermediate, 2 occupants, 1.5 m² windows): required glazing max(9 ÷ 8, 1.0) = 1.13 m²; ACH 10 gives 270 m³/h = 158.9 CFM; ASHRAE Vbz = 5 × 2 + 0.3 × 9 = 12.7 L/s → 45.72 m³/h outdoor air; exhaust fan = 100 CFM (ASHRAE 62.2 intermittent rate, next standard size) — not the 159 CFM ACH airflow.",
      ],
      result:
        "The bedroom passes on glazing (2.4 m² vs 1.80 m² required, 1.2 m² openable vs 0.90 m²) and needs 172.8 m³/h of total supply air (4 ACH) but only 33.55 m³/h of outdoor air by ASHRAE 62.1. A kitchen the same size needs a 100 CFM exhaust fan — sized on the exhaust rate, not on its 159 CFM ACH airflow.",
    },
    related: [
      { id: "room-area-calculator", title: "Room Area Calculator — Carpet, Built-Up & Super Built-Up", desc: "Room area and volume — the inputs this checker starts from — with NBC 2016 minima." },
      { id: "door-window-schedule", title: "Door & Window Schedule Generator", desc: "The windows in the schedule: frame lengths, glass areas and sill heights." },
      { id: "mep-calculator", title: "MEP Calculator — Energy, Loads & Services", desc: "Electrical loads and mechanical services for the same rooms." },
      { id: "house", title: "House Construction Cost Calculator in Pakistan", desc: "Grey structure and finishing cost for a full house in PKR." },
      { id: "interiors-finishes", title: "Interiors & Finishes Estimator — Seven Trades, One Room", desc: "Plaster, paint and flooring for the same room." },
    ],
  },
  "aggregate-blending": {
    id: "aggregate-blending",
    intro:
      "No single stockpile ever matches a grading envelope, so a mix is blended from two to four stockpiles and the blend is checked sieve by sieve. The blended percentage passing at each sieve is the proportion-weighted average of the stockpiles — a straight weighted mean, not a trial-and-error guess — and the blended specific gravity is the harmonic-style mean ΣP ÷ Σ(Pᵢ ÷ Gᵢ), because specific gravity combines by volume, not by mass. The 0.45-power maximum-density line (Fuller curve) is the target shape: a blend that follows it packs tightest. Proportions need not sum to 100 in this tool — they are normalised by their own total — but every stockpile's passing percentages must fall, never rise, as the sieve gets finer.",
    formulas: [
      {
        formula: "P_blend = Σ (Pᵢ × propᵢ) ÷ Σ propᵢ",
        variables:
          "P_blend = blended % passing at one sieve; Pᵢ = stockpile i's % passing at that sieve; propᵢ = its proportion. Proportions are normalised, so 40/35/25 and 80/70/50 give the same blend.",
      },
      {
        formula: "G_blend = ΣP ÷ Σ (Pᵢ ÷ Gᵢ)",
        variables:
          "G_blend = blended specific gravity; Pᵢ = proportion of stockpile i; Gᵢ = its specific gravity. The numerator is the actual sum of the proportions — the old 100 ÷ Σ(Pᵢ/Gᵢ) read 3.555 for a 50/25 split on Gs 2.65/2.70, which is physically impossible for aggregate.",
        note: "Specific gravity is a volume property, so the blend is a harmonic mean, not an arithmetic one.",
      },
      {
        formula: "P_0.45 = 100 × (size ÷ max size)^0.45",
        variables:
          "The Fuller / 0.45-power maximum-density line: the % passing that gives the densest packing for a given maximum aggregate size.",
        note: "A blend hugging this line needs the least binder for a given workability; a blend far above it is over-sanded, far below it is gap-graded.",
      },
      {
        formula: "Batch kgᵢ = total batch kg × propᵢ ÷ Σ prop;  Batch cost = Σ (batch kgᵢ ÷ 1000 × cost per tonneᵢ)",
        variables:
          "Batch quantities follow the same proportions as the blend; cost is shown only when every stockpile has a cost per tonne.",
      },
    ],
    tables: [
      {
        title: "Worked blend — % passing of the three stockpiles (engine defaults)",
        headers: ["Stockpile", "Gs", "20 mm", "10 mm", "4.75 mm"],
        rows: [
          ["20 mm aggregate", "2.65", "100", "55", "5"],
          ["10 mm aggregate", "2.70", "100", "95", "25"],
          ["Crusher dust", "2.60", "100", "100", "90"],
        ],
      },
      {
        title: "0.45-power maximum-density line (20 mm maximum size)",
        headers: ["Sieve (mm)", "20", "10", "4.75", "2.36", "0.075"],
        rows: [
          [
            "% passing",
            "100",
            power45Line(10, 20).toFixed(1),
            power45Line(4.75, 20).toFixed(1),
            power45Line(2.36, 20).toFixed(1),
            power45Line(0.075, 20).toFixed(1),
          ],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — blending 40 / 35 / 25 (the calculator's defaults)",
      inputs:
        "20 mm aggregate (Gs 2.65), 10 mm aggregate (Gs 2.70) and crusher dust (Gs 2.60) at 40%, 35% and 25%. Passing values are the table above.",
      steps: [
        `Blended % passing at 10 mm = (55 × 0.40) + (95 × 0.35) + (100 × 0.25) = ${BLEND_PASS[10].toFixed(2)}%. At 4.75 mm = (5 × 0.40) + (25 × 0.35) + (90 × 0.25) = ${BLEND_PASS[4.75].toFixed(2)}%. At 20 mm every stockpile passes 100%, so the blend is ${BLEND_PASS[20].toFixed(0)}%.`,
        `Blended Gs = 100 ÷ (40 ÷ 2.65 + 35 ÷ 2.70 + 25 ÷ 2.60) = ${BLEND_GS.toFixed(3)}. (The old formula's 100 ÷ Σ(Pᵢ/Gᵢ) with the wrong numerator gave 3.555 for a two-stockpile split — above the Gs of either stockpile, which cannot happen.)`,
        `0.45-power line for 20 mm maximum: at 10 mm the target is ${power45Line(10, 20).toFixed(1)}% passing and at 4.75 mm ${power45Line(4.75, 20).toFixed(1)}% — this blend is coarser than the line at 10 mm (${BLEND_PASS[10].toFixed(1)}%) and finer at 4.75 mm (${BLEND_PASS[4.75].toFixed(1)}%), so it is slightly gap-graded around the middle sieves.`,
        "A 1,000 kg trial batch at the same proportions is 400 kg of 20 mm aggregate, 350 kg of 10 mm aggregate and 250 kg of crusher dust.",
      ],
      result: `Blended grading 100% / ${BLEND_PASS[10].toFixed(1)}% / ${BLEND_PASS[4.75].toFixed(1)}% passing 20 / 10 / 4.75 mm, blended Gs ${BLEND_GS.toFixed(3)}. Check the blend against the target envelope sieve by sieve — a blend that looks right at one sieve can fail at the next.`,
    },
    related: [
      { id: "master-sieve", title: "Master Sieve Analysis Calculator", desc: "Gradation curve, D10/D30/D60, Cu/Cc, fineness modulus and USCS classification from sieve data." },
      { id: "pavement-mix", title: "Pavement Mix & Gradation Calculator", desc: "Blend aggregates to MoRTH GSB, DBM and SMA gradation envelopes and check every sieve." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
      { id: "aggregate-tests", title: "Aggregate Lab Tests Calculator", desc: "Impact, crushing, abrasion, water absorption and specific gravity (IS 2386)." },
      { id: "road-pavement", title: "Road & Pavement Estimator Tool", desc: "Material quantities for flexible and rigid pavement layers, layer by layer." },
    ],
  },

  "direct-shear": {
    id: "direct-shear",
    intro:
      "The direct shear test (ASTM D3080 / IS 2720 Part 13) is the quickest way to get a soil's shear-strength parameters: a square specimen is sheared under three or more normal stresses, and the peak shear stress at each one is plotted against its normal stress. The Mohr–Coulomb envelope through those points is a straight line — its intercept is the cohesion c and its slope is tan φ, the angle of internal friction. This calculator fits that line by least squares and reports R² and the residuals, so a bad point shows up instead of being hidden. The bearing-capacity figure it prints is a labelled Terzaghi estimate from those c and φ values, not a design bearing capacity — a footing design still needs the full Terzaghi/Meyerhof check with the real footing shape and depth.",
    formulas: [
      {
        formula: "τ = c + σ × tan φ",
        variables:
          "τ = shear strength; c = cohesion (kPa); σ = normal stress (kPa); φ = angle of internal friction. The envelope is fitted by least-squares regression through the (σ, τ) points.",
        note: "A negative fitted cohesion is physically impossible — the tool reports it and tells you to report c = 0 and repeat the test, not silently clamp it.",
      },
      {
        formula: "R² = (Σxy)² ÷ (Σxx × Σyy) on the centred points",
        variables:
          "R² measures how straight the envelope is. Below 0.95 the tool warns that the envelope is not reliable and the test should be repeated.",
      },
      {
        formula: "Nq = e^((3π/2 − φ)·tan φ) ÷ (2·cos²(45° + φ/2));  Nc = (Nq − 1) ÷ tan φ (5.7 at φ = 0);  Nγ = (Nq − 1)·tan(1.4φ)",
        variables:
          "Terzaghi (1943) bearing-capacity factors for general shear failure, φ in radians in the formula. These are Terzaghi's factors, not the Prandtl/Reissner (Vesic) factors the old code used under this name.",
        note: "At φ = 30°: Nq 22.5, Nc 37.2, Nγ 19.3 (tabulated 22.5 / 37.2 / 19.7). The old Vesic factors gave Nq 18.4 / Nc 30.1 at φ = 30°, understating the labelled SBC by about 13%.",
      },
      {
        formula: "qu = c·Nc + γ·Df·Nq + ½·γ·B·Nγ;   SBC = qu ÷ FoS (FoS = 3)",
        variables:
          "qu = ultimate bearing capacity; γ = soil unit weight; Df = footing depth; B = footing width. Labelled Terzaghi estimate only.",
      },
    ],
    tables: [
      {
        title: "Terzaghi bearing-capacity factors (general shear)",
        headers: ["φ", "0°", "20°", "30°", "40°"],
        rows: [
          ["Nc", TERZ_0.nc.toFixed(1), TERZ_20.nc.toFixed(1), terzaghiFactors(30).nc.toFixed(1), TERZ_40.nc.toFixed(1)],
          ["Nq", TERZ_0.nq.toFixed(1), TERZ_20.nq.toFixed(1), terzaghiFactors(30).nq.toFixed(1), TERZ_40.nq.toFixed(1)],
          ["Nγ", TERZ_0.ngamma.toFixed(1), TERZ_20.ngamma.toFixed(1), terzaghiFactors(30).ngamma.toFixed(1), TERZ_40.ngamma.toFixed(1)],
        ],
      },
      {
        title: "When the fit warns you (engine rules)",
        headers: ["Condition", "What the tool says"],
        rows: [
          ["R² < 0.95", "Repeat the test — the envelope is not reliable"],
          ["Fitted c < 0", "Physically impossible — report c = 0 and repeat the test"],
          ["Fitted φ < 0", "Check the data — repeat the test"],
          ["Fewer than 3 points", "The fit refuses to run — at least 3 points are required"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — three shear points (the calculator's defaults)",
      inputs:
        "Normal stress / peak shear stress (kPa): (50, 35), (100, 60), (150, 85). For the Terzaghi estimate: c = 10 kPa, φ = 30°, γ = 18 kN/m³, footing depth 1.0 m, width 1.5 m, factor of safety 3.",
      steps: [
        `Least-squares fit through the three points: slope = 0.50, so φ = arctan(0.50) = ${SHEAR_FIT.phiDeg.toFixed(1)}°, and intercept c = ${SHEAR_FIT.cohesionKpa.toFixed(1)} kPa. R² = ${SHEAR_FIT.r2.toFixed(2)} — the points sit exactly on the line, so every residual is 0.`,
        `Terzaghi factors at φ = 30°: Nc = ${TERZ.factors.nc.toFixed(1)}, Nq = ${TERZ.factors.nq.toFixed(1)}, Nγ = ${TERZ.factors.ngamma.toFixed(1)}.`,
        `qu = 10 × ${TERZ.factors.nc.toFixed(1)} + 18 × 1.0 × ${TERZ.factors.nq.toFixed(1)} + 0.5 × 18 × 1.5 × ${TERZ.factors.ngamma.toFixed(1)} = ${TERZ.quKpa.toFixed(1)} kPa.`,
        `Safe bearing capacity = ${TERZ.quKpa.toFixed(1)} ÷ 3 = ${TERZ.sbcKpa.toFixed(1)} kPa.`,
      ],
      result: `c = ${SHEAR_FIT.cohesionKpa.toFixed(0)} kPa, φ = ${SHEAR_FIT.phiDeg.toFixed(1)}° (R² ${SHEAR_FIT.r2.toFixed(2)}). Labelled Terzaghi SBC ${TERZ.sbcKpa.toFixed(1)} kPa for a 1.5 m wide footing at 1.0 m depth — an estimate for comparison, not a design value.`,
    },
    related: [
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, liquid limit, plastic limit, Proctor compaction and CBR — soil test results in one place." },
      { id: "soil-mechanics-lab", title: "Soil Mechanics Lab Test Suite", desc: "Field density, UCS, vane shear, phase relations and free swell, with IS 2720 methods." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Earth pressure, stability checks and material quantities — it needs the φ and γ this test measures." },
      { id: "isolated-footing", title: "Isolated Footing Calculator", desc: "Footing size, depth and reinforcement from column load and safe bearing capacity." },
      { id: "pile-foundation", title: "Pile Foundation Calculator", desc: "Pile capacity and settlement from soil parameters." },
    ],
  },

  geotechnical: {
    id: "geotechnical",
    intro:
      "The Geotechnical calculator is the index-test bench: the five lab tests that describe a soil before any design starts — water content (IS 2720 Part 2), specific gravity (Part 3), the liquid limit by the Casagrande cup (Part 5), and the CBR (Part 16) — plus the phase relations that tie them together and the free-swell test that flags expansive clay. The Atterberg limits are the soil's fingerprint: liquid limit minus plastic limit is the plasticity index, and where the natural water content sits between them (liquidity index) tells you whether the clay is stiff, soft or liquid. CBR is reported the IS 2720 way: the 2.5 mm value, and if the 5.0 mm value comes out higher you repeat the test instead of silently taking the larger number.",
    formulas: [
      {
        formula: "w = (W2 − W3) ÷ (W3 − W1) × 100",
        variables:
          "w = water content %; W1 = container weight; W2 = container + wet soil; W3 = container + oven-dry soil (IS 2720 Part 2, oven-dried at 105–110 °C).",
      },
      {
        formula: "Gs = (W2 − W1) ÷ [(W2 − W1) − (W3 − W4)]",
        variables:
          "Gs = specific gravity of solids (pycnometer, IS 2720 Part 3); W1 = empty pycnometer, W2 = pycnometer + dry soil, W3 = pycnometer + soil + water, W4 = pycnometer + water only.",
      },
      {
        formula: "LL (one-point) = w × (N ÷ 25)^0.121   (15 ≤ N ≤ 35)",
        variables:
          "One-point liquid limit from a single Casagrande blow count N at water content w — a fallback only. The full method regresses log₁₀(N) against w over at least 3 points and reads w at N = 25.",
        note: "Outside 15–35 blows the one-point formula is not valid — run the full flow curve.",
      },
      {
        formula: "PI = LL − PL;   LI = (w − PL) ÷ PI;   CI = (LL − w) ÷ PI;   Activity = PI ÷ % clay",
        variables:
          "PI = plasticity index; LI = liquidity index; CI = consistency index; activity (Skempton) = PI per percent clay fraction.",
        note: "Plasticity is labelled from PI: ≤ 7 low, 7–17 medium, > 17 high — never from water content alone.",
      },
      {
        formula: "γd = γb ÷ (1 + w);   e = Gs ÷ γd − 1;   S = (w × Gs ÷ e) × 100",
        variables:
          "γd = dry density; γb = bulk density; e = void ratio; S = degree of saturation %; w as a decimal. S above 100% is physically impossible — check the inputs.",
      },
      {
        formula: "CBR = (test load ÷ standard load) × 100;  standard loads 1,370 kg @ 2.5 mm, 2,055 kg @ 5.0 mm",
        variables:
          "Report the 2.5 mm CBR. If CBR at 5.0 mm exceeds CBR at 2.5 mm, repeat the test; only if the repeat also gives 5.0 mm higher may the 5.0 mm value be reported (IS 2720 Part 16).",
      },
      {
        formula: "Free swell % = (V_final − V_initial) ÷ V_initial × 100",
        variables:
          "IS 1498 bands: < 50% low expansiveness, 50–100% moderate, > 100% high.",
      },
    ],
    tables: [
      {
        title: "Plasticity from the plasticity index (engine labels)",
        headers: ["PI", "Plasticity"],
        rows: [
          ["≤ 7", "Low plasticity"],
          ["7–17", "Medium plasticity"],
          ["> 17", "High plasticity"],
        ],
      },
      {
        title: "Free-swell expansiveness (IS 1498)",
        headers: ["Free swell", "Band"],
        rows: [
          ["< 50%", "Low expansiveness"],
          ["50–100%", "Moderate expansiveness"],
          ["> 100%", "High expansiveness"],
        ],
      },
      {
        title: "CBR standard loads (IS 2720 Part 16)",
        headers: ["Penetration", "Standard load (kg)"],
        rows: [
          ["2.5 mm", "1,370"],
          ["5.0 mm", "2,055"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one soil, five index tests",
      inputs:
        "Water content: W1 20 g, W2 120 g, W3 100 g. Pycnometer: W1 650 g, W2 900 g, W3 1,650 g, W4 1,500 g. One-point LL: w 38% at N = 20 blows. Atterberg: LL 45%, PL 22%, natural w 30%, clay 20%. Phase: w 25%, Gs 2.667, bulk density 1.8 g/cc. Free swell: 10 mL → 15 mL. CBR loads: 180 kg @ 2.5 mm, 300 kg @ 5.0 mm.",
      steps: [
        `Water content = (120 − 100) ÷ (100 − 20) × 100 = ${GEO_WC.toFixed(1)}%.`,
        `Specific gravity = 250 ÷ (250 − 150) = ${GEO_GS.toFixed(3)}.`,
        `One-point liquid limit = 38 × (20 ÷ 25)^0.121 = ${GEO_LL1.toFixed(1)}%.`,
        `PI = 45 − 22 = ${GEO_ATT.pi.toFixed(0)}% — ${GEO_ATT.plasticity.toLowerCase()}. LI = (30 − 22) ÷ 23 = ${GEO_ATT.li.toFixed(2)}, CI = (45 − 30) ÷ 23 = ${GEO_ATT.ci.toFixed(2)}, activity = 23 ÷ 20 = ${GEO_ATT.activity?.toFixed(2)}.`,
        `Phase relations: dry density = 1.8 ÷ 1.25 = ${GEO_PHASE.dryDensity.toFixed(2)} g/cc; void ratio = 2.667 ÷ 1.44 − 1 = ${GEO_PHASE.voidRatio.toFixed(3)}; saturation = (0.25 × 2.667 ÷ 0.852) × 100 = ${GEO_PHASE.saturationPct.toFixed(1)}%.`,
        `Free swell = (15 − 10) ÷ 10 × 100 = ${GEO_SWELL.swellPct.toFixed(0)}% — ${GEO_SWELL.band.toLowerCase()}.`,
        `CBR at 2.5 mm = 180 ÷ 1,370 × 100 = ${GEO_CBR.cbr25.toFixed(1)}%; at 5.0 mm = 300 ÷ 2,055 × 100 = ${GEO_CBR.cbr50.toFixed(1)}%. The 5.0 mm value is higher, so the test must be repeated — the reported CBR stays ${GEO_CBR.reported.toFixed(1)}% until the repeat confirms otherwise.`,
      ],
      result: `w ${GEO_WC.toFixed(0)}%, Gs ${GEO_GS.toFixed(2)}, LL ≈ ${GEO_LL1.toFixed(0)}% (one-point), PI ${GEO_ATT.pi.toFixed(0)}% (${GEO_ATT.plasticity.toLowerCase()}), saturation ${GEO_PHASE.saturationPct.toFixed(0)}%, free swell ${GEO_SWELL.swellPct.toFixed(0)}% (${GEO_SWELL.band.toLowerCase()}), reported CBR ${GEO_CBR.reported.toFixed(1)}% with a repeat test required.`,
    },
    related: [
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve, with origin correction and resilient modulus." },
      { id: "soil-mechanics-lab", title: "Soil Mechanics Lab Test Suite", desc: "Proctor compaction curve, field density, UCS, vane shear and phase relations from lab data." },
      { id: "master-sieve", title: "Master Sieve Analysis Calculator", desc: "Gradation curve, D10/D30/D60, Cu/Cc, fineness modulus and USCS classification." },
      { id: "direct-shear", title: "Direct Shear Test Calculator", desc: "Cohesion and friction angle from direct shear data using Mohr–Coulomb regression." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Prismoidal and average-end-area volumes, swell and shrinkage, truck trips and trench backfill." },
    ],
  },

  "master-sieve": {
    id: "master-sieve",
    intro:
      "Sieve analysis (IS 2720 Part 4 / ASTM D6913) turns a pile of sieved soil into a gradation curve: the percentage of the sample passing each sieve, plotted against sieve size on a log scale. Three points on that curve — D10, D30 and D60, the sizes at which 10%, 30% and 60% of the sample passes — describe the whole soil: their ratios give the uniformity coefficient Cu and the coefficient of curvature Cc, which decide the USCS symbol (GW, GP, SW, SP and the rest), and the cumulative retained percentages give the fineness modulus used in concrete mix design. D-values are log-interpolated between bracketing sieves and never extrapolated — if the curve does not reach 10% passing, D10 is reported as unknown, not guessed.",
    formulas: [
      {
        formula: "% passing = 100 − cumulative % retained",
        variables:
          "Cumulative % retained at a sieve = (sum of all weights retained on that sieve and coarser ones ÷ total sample weight) × 100. Retained + pan must total 100% within 2%, or the tool warns you to check the weights.",
      },
      {
        formula: "D10, D30, D60 by log-interpolation between the two bracketing sieves",
        variables:
          "D10 = size at 10% passing, D30 at 30%, D60 at 60%. Interpolation is on log₁₀(size) versus % passing.",
        note: "Never extrapolated: a curve that never reaches 10% passing has no D10.",
      },
      {
        formula: "Cu = D60 ÷ D10;   Cc = D30² ÷ (D10 × D60)",
        variables:
          "Cu = coefficient of uniformity; Cc = coefficient of curvature. Well graded needs Cu ≥ 4 (gravel) or ≥ 6 (sand) AND 1 ≤ Cc ≤ 3.",
        note: "Gravel versus sand is decided FIRST — by whether more than half of the coarse fraction is retained on the 4.75 mm sieve — then the Cu/Cc test is applied. That order is what makes SW reachable.",
      },
      {
        formula: "FM = Σ (cumulative % retained on 4.75, 2.36, 1.18, 0.6, 0.3, 0.15 mm) ÷ 100",
        variables:
          "FM = fineness modulus of a fine aggregate. Coarser sand has a higher FM (typical Zone II sand is about 2.6–2.9).",
      },
    ],
    tables: [
      {
        title: "IS 383 fine aggregate — Zone II (% passing)",
        headers: ["Sieve (mm)", "10", "4.75", "2.36", "1.18", "0.6", "0.3", "0.15"],
        rows: [["Zone II", "100", "90–100", "75–100", "55–90", "35–59", "8–30", "0–10"]],
      },
      {
        title: "USCS well-graded test (clean soils, < 5% fines)",
        headers: ["Soil", "Well graded if", "Otherwise"],
        rows: [
          ["Gravel (GW/GP)", "Cu ≥ 4 and 1 ≤ Cc ≤ 3", "GP — poorly graded gravel"],
          ["Sand (SW/SP)", "Cu ≥ 6 and 1 ≤ Cc ≤ 3", "SP — poorly graded sand"],
          ["5–12% fines", "Dual symbol (e.g. SW-SM) — needs Atterberg limits to split", "—"],
          ["> 12% fines", "GM/GC or SM/SC — classify by the A-line (needs LL/PL)", "—"],
        ],
      },
      {
        title: "AASHTO M145 group estimate (engine, simplified)",
        headers: ["Fines", "Group"],
        rows: [
          ["≤ 15%", "A-1 / A-3 (granular)"],
          ["15–25%", "A-2 (granular with fines)"],
          ["> 25%, LL ≤ 40, PI ≤ 10", "A-4 (silty soil)"],
          ["> 25%, LL ≤ 40, PI > 11", "A-6 (clayey soil)"],
          ["> 25%, LL > 40", "A-7 (clayey soil)"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 1,000 g sand sample (the calculator's defaults)",
      inputs:
        "Total weight 1,000 g, pan 20 g. Retained: 4.75 mm 100 g, 2.36 mm 200 g, 1.18 mm 250 g, 0.6 mm 200 g, 0.3 mm 150 g, 0.15 mm 80 g.",
      steps: [
        `Retained + pan = 980 + 20 = 1,000 g — 100% of the total, so the weights check out. % passing: 4.75 mm → 90%, 2.36 mm → 70%, 1.18 mm → 45%, 0.6 mm → 25%, 0.3 mm → 10%, 0.15 mm → 2%.`,
        `Log-interpolation gives D10 = ${SIEVE.d10?.toFixed(2)} mm, D30 = ${SIEVE.d30?.toFixed(2)} mm, D60 = ${SIEVE.d60?.toFixed(2)} mm.`,
        `Cu = ${SIEVE.d60?.toFixed(2)} ÷ ${SIEVE.d10?.toFixed(2)} = ${SIEVE.cu?.toFixed(2)}; Cc = ${SIEVE.d30?.toFixed(2)}² ÷ (${SIEVE.d10?.toFixed(2)} × ${SIEVE.d60?.toFixed(2)}) = ${SIEVE.cc?.toFixed(2)}.`,
        `Fineness modulus = (10 + 30 + 55 + 75 + 90 + 98) ÷ 100 = ${SIEVE.fm.toFixed(2)}. Fines (passing 0.15 mm) = ${SIEVE.finesPct.toFixed(0)}%.`,
        `Cu ${SIEVE.cu?.toFixed(2)} is below 6 and Cc ${SIEVE.cc?.toFixed(2)} is below 1, so the sand is poorly graded — and with only ${SIEVE.finesPct.toFixed(0)}% fines it is clean.`,
      ],
      result: `D10 ${SIEVE.d10?.toFixed(2)} mm, D30 ${SIEVE.d30?.toFixed(2)} mm, D60 ${SIEVE.d60?.toFixed(2)} mm, Cu ${SIEVE.cu?.toFixed(2)}, Cc ${SIEVE.cc?.toFixed(2)}, FM ${SIEVE.fm.toFixed(2)} — USCS ${SIEVE.uscs}.`,
    },
    related: [
      { id: "aggregate-blending", title: "Aggregate Blending Calculator", desc: "Blend two to four aggregate stockpiles to meet target grading specifications." },
      { id: "aggregate-tests", title: "Aggregate Lab Tests Calculator", desc: "Impact, crushing, abrasion, water absorption and specific gravity (IS 2386)." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60 — it needs the fineness modulus and zone this test gives." },
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, Atterberg limits and CBR — the other half of soil classification." },
      { id: "pavement-mix", title: "Pavement Mix & Gradation Calculator", desc: "Blend aggregates to MoRTH GSB, DBM and SMA gradation envelopes and check every sieve." },
    ],
  },

  "permeability-test": {
    id: "permeability-test",
    intro:
      "Permeability k is how fast water flows through a soil, and it decides whether a soil drains, how fast a cofferdam leaks, and how quickly a clay consolidates. It is measured two ways: the constant-head test (ASTM D2434) for sands and gravels, where a steady head drives a measured volume through the specimen, and the falling-head test (ASTM D5084) for silts and clays, where the head in a standpipe drops over time. Both come from Darcy's law, q = k·i·A. Because water gets thinner as it warms, every result is corrected to 20 °C with the ASTM viscosity-ratio table — a test run at 10 °C reads about 30% low if you skip the correction.",
    formulas: [
      {
        formula: "k = (Q × L) ÷ (A × h × t)   (constant head)",
        variables:
          "k = coefficient of permeability (cm/s); Q = volume collected (cm³); L = specimen length (cm); A = cross-sectional area (cm²); h = head difference (cm); t = time (s). For coarse soils (ASTM D2434).",
      },
      {
        formula: "k = 2.303 × (a × L) ÷ (A × t) × log₁₀(h1 ÷ h2)   (falling head)",
        variables:
          "a = standpipe area (cm²); h1, h2 = heads at the start and end of the timed interval; the rest as above. For fine soils (ASTM D5084).",
      },
      {
        formula: "k₂₀ = k_T × R_T",
        variables:
          "Temperature correction to 20 °C: R_T is the viscosity ratio from the ASTM table, linearly interpolated between the tabulated temperatures (10 °C 1.301, 15 °C 1.135, 20 °C 1.000, 25 °C 0.890, 30 °C 0.797). Outside 10–30 °C the end value is used.",
        note: "The old polynomial correction was about 4% low at 10 °C — the table is the ASTM method.",
      },
      {
        formula: "k (Hazen, screening only) ≈ 1.0 × D10²;   k (m/day) = k (cm/s) × 864",
        variables:
          "Hazen: k = C·D10² with C ≈ 100 and D10 in cm — with D10 in mm that is k ≈ 1.0·D10² cm/s. A screening estimate for clean sands only, never a substitute for the lab test.",
        note: "The old 0.01 coefficient was 100× too low — a clean sand read as silt.",
      },
    ],
    tables: [
      {
        title: "ASTM viscosity-ratio table (temperature correction R_T)",
        headers: ["Temperature", "10 °C", "15 °C", "20 °C", "25 °C", "30 °C"],
        rows: [["R_T", "1.301", "1.135", "1.000", "0.890", "0.797"]],
      },
      {
        title: "What the k value means (engine classes)",
        headers: ["k (cm/s)", "Class"],
        rows: [
          ["> 10⁻¹", "Very high — clean gravel"],
          ["10⁻² – 10⁻¹", "High — clean sand"],
          ["10⁻³ – 10⁻²", "Medium — fine sand / silty sand"],
          ["10⁻⁵ – 10⁻³", "Low — silt"],
          ["< 10⁻⁵", "Very low — clay"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — constant head and falling head on the same sand",
      inputs:
        "Constant head: Q 120 cm³, L 10 cm, A 78.5 cm², h 20 cm, t 60 s, test at 22 °C. Falling head: standpipe area 1.77 cm², L 10 cm, A 78.5 cm², t 120 s, h1 90 cm → h2 60 cm. Hazen D10 0.15 mm.",
      steps: [
        `Constant head: k = (120 × 10) ÷ (78.5 × 20 × 60) = ${PERM_CONST.toExponential(2)} cm/s — high, a clean sand.`,
        `Temperature correction at 22 °C: R_T = ${PERM_TCF22.toFixed(3)}, so k₂₀ = ${PERM_CONST.toExponential(2)} × ${PERM_TCF22.toFixed(3)} = ${(PERM_CONST * PERM_TCF22).toExponential(2)} cm/s, or ${kToMetresPerDay(PERM_CONST * PERM_TCF22).toFixed(1)} m/day.`,
        `Falling head: k = 2.303 × (1.77 × 10) ÷ (78.5 × 120) × log₁₀(90 ÷ 60) = ${PERM_FALL.toExponential(2)} cm/s — about 17× lower than the constant-head result on the same nominal soil, which is why the two methods are not interchangeable: falling head suits finer soils and longer test times.`,
        `Hazen screening estimate from D10 = 0.15 mm: k ≈ 1.0 × 0.15² = ${PERM_HAZEN.toFixed(4)} cm/s — the same order as the constant-head test, as expected for a clean sand, but still only a screening estimate.`,
      ],
      result: `Constant-head k₂₀ ${(PERM_CONST * PERM_TCF22).toExponential(2)} cm/s (${kToMetresPerDay(PERM_CONST * PERM_TCF22).toFixed(1)} m/day) — high permeability, clean sand. Report the temperature-corrected value and the method used; an uncorrected k from a cold lab is not comparable with one from a warm lab.`,
    },
    related: [
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, Atterberg limits and CBR — the index tests that go with permeability." },
      { id: "soil-mechanics-lab", title: "Soil Mechanics Lab Test Suite", desc: "Proctor compaction, field density, UCS and phase relations from lab data." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation and backfill volumes — dewatering depends on how fast the soil drains." },
      { id: "wastewater-calculator", title: "Wastewater BOD & COD Calculator", desc: "BOD₅/COD lab testing, Manning sewer design, septic tanks and soak pits." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Earth pressure and stability — drainage behind the wall depends on the backfill's permeability." },
    ],
  },

  "soil-mechanics-lab": {
    id: "soil-mechanics-lab",
    intro:
      "The Soil Mechanics Lab is the portal for the tests that do not fit in the single-test calculators: the Proctor compaction curve (IS 2720 Part 7/8) that gives the optimum moisture content and maximum dry density every earthworks specification is written against, the core-cutter field density check that proves the fill on site actually reached that density, the unconfined compressive strength and vane shear tests (Parts 10 and 30) that give a clay's undrained strength, and the phase relations and free-swell test. The Proctor curve is fitted as a quadratic through the measured dry densities — the vertex is the OMC/MDD — and the zero-air-voids line is drawn alongside so you can see at a glance whether any point claims the impossible.",
    formulas: [
      {
        formula: "γd = (wet mass ÷ mould volume) ÷ (1 + w)",
        variables:
          "γd = dry density (g/cc); mould volume is 943.3 cm³ for the standard Proctor mould; w = water content as a decimal.",
      },
      {
        formula: "Proctor curve: γd = a·w² + b·w + c (least-squares fit);  OMC = −b ÷ (2a);  MDD = c − b² ÷ (4a)",
        variables:
          "The vertex of the fitted quadratic is the optimum moisture content and maximum dry density. At least 3 points are needed, on both sides of the optimum.",
        note: "If the fit has no maximum (a ≥ 0) the tool says so instead of inventing an OMC — add points on both sides of the optimum.",
      },
      {
        formula: "Zero-air-voids line: γd = Gs·γw ÷ (1 + w·Gs)",
        variables:
          "The theoretical maximum dry density at zero air voids (γw = 1 g/cc). No measured point may lie above this line.",
      },
      {
        formula: "Relative compaction = γd(field) ÷ MDD × 100;  core-cutter volume = π × (d ÷ 2)² × h",
        variables:
          "Field dry density from the core cutter divided by the lab MDD. MoRTH Clause 305 acceptance is typically 95% for embankment and 97% for subgrade — confirm against the project specification.",
      },
      {
        formula: "UCS: Ac = A₀ ÷ (1 − ε);  qu = P ÷ Ac;  cu = qu ÷ 2",
        variables:
          "qu = unconfined compressive strength (IS 2720 Part 10); Ac = area corrected for axial strain ε; cu = undrained shear strength, half of qu for a saturated clay.",
      },
      {
        formula: "Vane shear: cu = T ÷ [π·D²·(H ÷ 2 + D ÷ 6)]",
        variables:
          "cu from the vane test (IS 2720 Part 30); T = torque, D = vane diameter, H = vane height.",
      },
    ],
    tables: [
      {
        title: "UCS consistency of clay (engine bands, qu in kPa)",
        headers: ["qu", "< 25", "25–50", "50–100", "100–200", "200–400", "> 400"],
        rows: [["Consistency", "Very soft", "Soft", "Medium", "Stiff", "Very stiff", "Hard"]],
      },
      {
        title: "Relative compaction — typical acceptance (MoRTH Clause 305)",
        headers: ["Layer", "Minimum relative compaction"],
        rows: [
          ["Embankment", "95% of MDD"],
          ["Subgrade", "97% of MDD"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — Proctor curve, field check, UCS and vane (the calculator's defaults)",
      inputs:
        "Proctor points (w %, wet mass g): (8, 1,650), (10, 1,750), (12, 1,820), (14, 1,800), (16, 1,720); mould 943.3 cm³. Core cutter: Ø 10 cm × 12.7 cm, wet mass 1,800 g, w 12%. UCS: 38 mm dia, 250 N failure load, 15% strain. Vane: 15 N·m torque, 50 mm dia × 100 mm high.",
      steps: [
        `Dry densities: at w 8% → 1.620 g/cc; 10% → 1.687; 12% → 1.723; 14% → 1.674; 16% → 1.572. The quadratic fit through them peaks at OMC ${PROCTOR.omcPct.toFixed(2)}% and MDD ${PROCTOR.mddGCc.toFixed(3)} g/cc.`,
        `Core cutter: volume = π × 5² × 12.7 = ${CORE.volumeCm3.toFixed(1)} cm³; bulk density = 1,800 ÷ ${CORE.volumeCm3.toFixed(1)} = ${CORE.bulkDensity.toFixed(3)} g/cc; dry density = ${CORE.bulkDensity.toFixed(3)} ÷ 1.12 = ${CORE.dryDensity.toFixed(3)} g/cc; relative compaction = ${CORE.dryDensity.toFixed(3)} ÷ ${PROCTOR.mddGCc.toFixed(3)} × 100 = ${CORE.relativeCompactionPct.toFixed(1)}% — below the 95% embankment minimum, so this layer needs more compaction.`,
        `UCS: A₀ = π × 0.038² ÷ 4 = ${UCS.area0M2.toFixed(6)} m²; Ac = A₀ ÷ (1 − 0.15) = ${UCS.correctedAreaM2.toFixed(6)} m²; qu = 250 ÷ ${UCS.correctedAreaM2.toFixed(6)} = ${UCS.quKpa.toFixed(1)} kPa; cu = qu ÷ 2 = ${UCS.cuKpa.toFixed(1)} kPa — "Stiff" clay.`,
        `Vane shear: cu = 15 ÷ [π × 0.05² × (0.05 + 0.05 ÷ 6)] = ${VANE.cuKpa.toFixed(1)} kPa — lower than the UCS value, as vane results often are on the same clay; report both and note the method.`,
      ],
      result: `OMC ${PROCTOR.omcPct.toFixed(1)}%, MDD ${PROCTOR.mddGCc.toFixed(3)} g/cc; field relative compaction ${CORE.relativeCompactionPct.toFixed(1)}% (re-compact — below 95%); UCS qu ${UCS.quKpa.toFixed(1)} kPa (stiff), vane cu ${VANE.cuKpa.toFixed(1)} kPa.`,
    },
    related: [
      { id: "geotechnical", title: "Geotechnical & Soil Test Calculators", desc: "Water content, specific gravity, Atterberg limits and CBR — the index tests that go with the lab suite." },
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve, with origin correction and resilient modulus." },
      { id: "master-sieve", title: "Master Sieve Analysis Calculator", desc: "Gradation curve, D10/D30/D60, Cu/Cc, fineness modulus and USCS classification." },
      { id: "direct-shear", title: "Direct Shear Test Calculator", desc: "Cohesion and friction angle from direct shear data using Mohr–Coulomb regression." },
      { id: "permeability-test", title: "Soil Permeability Calculator (k)", desc: "Constant-head and falling-head permeability with ASTM temperature correction." },
    ],
  },

  "infra-mep-engine": {
    id: "infra-mep-engine",
    intro:
      "The Master Infrastructure & MEP Engine is the consolidated dashboard for a project's services: solar rooftop, solar water heating, AC sizing and rainwater harvesting on one page, each running on the same shared engine as its standalone calculator, with BOQ export. It is MEP-only now — the earthworks and roads tabs that duplicated other tools were removed — so the page is for cross-checking the four systems against each other on the same building: the solar array against the roof the rainwater tank sits under, the water heater against the same household the AC cools. Every constant is shared with the standalone tools (peak sun hours, 50 L/person hot-water demand, the 5% rainwater tank rule), so the dashboard and the single-purpose calculators can never disagree.",
    formulas: [
      {
        formula: "Required kWp = (monthly units ÷ 30.4 ÷ PSH) ÷ (1 − losses %)",
        variables:
          "PSH = peak sun hours for the city (Lahore 5.0, Karachi 5.6, Quetta 5.8, Dubai 6.2); losses default 14%. Panels = ⌈required kWp × 1000 ÷ panel wattage⌉; inverter kVA = ⌈max(installed kWp, peak load kW) ÷ 0.97⌉.",
        note: "Exported units are credited at about 20% of the import tariff (NEPRA buyback roughly PKR 9–11/kWh against a ~PKR 50 import tariff) — the old 100% export credit overstated savings on exported units by about 2×.",
      },
      {
        formula: "Q = demand (L) × 4.184 × ΔT ÷ 3600  (kWh/day);  Collector area = Q ÷ (radiation × efficiency × solar fraction)",
        variables:
          "Demand is 50 L/person/day; ΔT = target − inlet temperature (60 − 15 = 45 °C by default); radiation defaults to 5.0 kWh/m²/day; flat-plate efficiency 50%, evacuated tube 65%; solar fraction default 0.6.",
      },
      {
        formula: "AC required BTU/h = ENERGY STAR base (room area) × (ceiling ft ÷ 8) × sun factor + 600 × max(0, occupants − 2) + 4,000 if kitchen",
        variables:
          "Base from the ENERGY STAR room-size chart; sun factor 0.9 shaded / 1.0 normal / 1.1 sunny; 1 ton = 12,000 BTU/h. Round UP to the nearest standard size.",
      },
      {
        formula: "Rainwater yield (L/yr) = roof area (m²) × rainfall (mm) × runoff coefficient × filter efficiency (0.9)",
        variables:
          "Tank (BS 8515) = 5% of the LESSER of annual yield and annual demand, or the dry-spell need (daily use × dry days) — whichever is larger, rounded up to a standard size.",
      },
    ],
    tables: [
      {
        title: "Peak sun hours by city (shared MEP constant)",
        headers: ["City", "Lahore", "Karachi", "Islamabad", "Multan", "Quetta", "Dubai", "Mumbai", "Delhi"],
        rows: [["PSH", "5.0", "5.6", "5.0", "5.5", "5.8", "6.2", "5.1", "5.2"]],
      },
      {
        title: "Battery depth of discharge (shared MEP constant)",
        headers: ["Chemistry", "Usable depth of discharge"],
        rows: [
          ["LiFePO4", "80%"],
          ["Lead-acid", "50%"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — one Lahore house through all four systems",
      inputs:
        "600 units/month, 100 m² roof, 4 people, hybrid solar with 1 day of autonomy, flat-plate water heater, 12 × 15 ft sunny bedroom (10 ft ceiling, 4 occupants), concrete-tile roof.",
      steps: [
        `Solar: daily demand 600 ÷ 30.4 = ${SOLAR.dailyDemandKwh.toFixed(2)} kWh/day; required ${SOLAR.requiredKw.toFixed(2)} kWp → ${SOLAR.panels} × 545 W panels = ${SOLAR.actualKw.toFixed(2)} kWp installed; ${SOLAR.inverterKva} kVA inverter; battery ${SOLAR.batteryActualKwh.toFixed(1)} kWh; total PKR ${Math.round(SOLAR.totalCost).toLocaleString("en-US")} at indicative Nov 2026 rates; simple payback ${SOLAR.simplePaybackYears?.toFixed(1)} years.`,
        `Solar water heater: demand ${SWH.demandLPerDay} L/day; heat needed ${SWH.energyKwhPerDay.toFixed(2)} kWh/day; collector ${SWH.collectorAreaM2.toFixed(2)} m² → ${SWH.panels} panels (${SWH.installedAreaM2} m² installed); tank ${SWH.tankL} L; system PKR ${Math.round(SWH.systemCost).toLocaleString("en-US")}; payback ${SWH.paybackYears?.toFixed(1)} years.`,
        `Rainwater: annual yield ${RAIN.yieldLPerYear.toFixed(0)} L against demand ${RAIN.demandLPerYear.toLocaleString("en-US")} L — ${RAIN.coveragePct.toFixed(0)}% coverage; tank ${RAIN.tankL.toLocaleString("en-US")} L (${RAIN.daysOfSupply.toFixed(0)} days of supply); system PKR ${Math.round(RAIN.systemCost).toLocaleString("en-US")}.`,
        `AC for the bedroom: ENERGY STAR base 6,000 BTU/h × 1.25 ceiling × 1.1 sun + 1,200 for two extra occupants = ${AC_EX.requiredBtuPerHour.toLocaleString("en-US")} BTU/h → nearest standard ${AC_EX.standardBtuPerHour.toLocaleString("en-US")} BTU/h (${AC_EX.standardTons.toFixed(2)} tons).`,
      ],
      result: `One house, four systems, one set of constants: ${SOLAR.actualKw.toFixed(2)} kWp solar (payback ${SOLAR.simplePaybackYears?.toFixed(1)} yr), ${SWH.collectorAreaM2.toFixed(2)} m² water-heater collector with a ${SWH.tankL} L tank, a ${RAIN.tankL.toLocaleString("en-US")} L rainwater tank covering ${RAIN.coveragePct.toFixed(0)}% of non-potable demand, and a ${AC_EX.standardBtuPerHour.toLocaleString("en-US")} BTU/h AC. For the full detail of any one system, open its standalone calculator.`,
    },
    related: [
      { id: "mep-calculator", title: "Energy & MEP Calculator Suite", desc: "Solar, water heating, AC, electrical load and plumbing in one MEP hub." },
      { id: "solar-roof", title: "Solar Roof System Calculator", desc: "Panels, battery and payback in full detail — loan, tilt and cash flow." },
      { id: "solar-water-heater", title: "Solar Water Heater Sizing Tool", desc: "Collector area and tank capacity from daily hot-water demand, location and sunshine." },
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Collectible rainwater volume from roof area and rainfall, and tank sizes for storage and reuse." },
      { id: "wastewater-calculator", title: "Wastewater BOD & COD Calculator", desc: "BOD₅/COD lab testing, Manning sewer design, septic tanks and soak pits." },
    ],
  },

  "mep-calculator": {
    id: "mep-calculator",
    intro:
      "The Energy & MEP Calculator Suite is the house-level MEP hub: five tabs — solar rooftop, solar water heater, AC sizing, electrical load, and plumbing — covering the services a house estimate needs before the specialist designs arrive. The solar and water-heater tabs are simplified modes of the standalone calculators (same engines, city defaults); the electrical tab is the one the suite adds that the others do not have: connected load, demand load with diversity, current, breaker and copper cable sized to IEC 60364-5-52 ampacity with voltage-drop check. The plumbing tab sizes cold-water mains from fixture units by Hunter's method. All of it is planning-level sizing — a licensed electrician and plumber still sign off the installation.",
    formulas: [
      {
        formula: "Demand kW = Σ (W × qty × diversity) ÷ 1000;  kVA = kW ÷ pf",
        variables:
          "Diversity is the share of each load expected on at once (AC 0.7, lights and fans 0.8, pump and geyser 0.5 in the defaults). Power factor defaults to 0.9.",
      },
      {
        formula: "I = P ÷ (V × pf)  (single-phase);  I = P ÷ (√3 × V × pf)  (three-phase);  Design current Id = I × 1.25",
        variables:
          "P = demand watts; V = 230 V single-phase or 400 V three-phase. The breaker is the next standard size ≥ Id (6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250 A).",
      },
      {
        formula: "Vd (1-ph) = 2 × I × L × (R·cos φ + X·sin φ) ÷ 1000;  Vd (3-ph) = √3 × I × L × (R·cos φ + X·sin φ) ÷ 1000",
        variables:
          "Voltage drop in volts; L = one-way cable length (m); R, X = cable resistance/reactance per km from the IEC 60364-5-52 copper table. The cable is the smallest size whose derated ampacity covers the breaker AND whose drop is within the limit (3% branch, 5% total).",
        note: "Ampacity is at 40 °C (the PK/IN reference temperature); above 40 °C it derates — 0.91 at 45 °C, 0.82 at 50 °C, 0.71 at 55 °C, 0.61 at 60 °C.",
      },
      {
        formula: "AC required BTU/h = ENERGY STAR base × (ceiling ft ÷ 8) × sun factor + 600 × max(0, occupants − 2) + 4,000 if kitchen;  1 ton = 12,000 BTU/h",
        variables:
          "Base from the ENERGY STAR room-size chart; sun factor 0.9 shaded / 1.0 normal / 1.1 sunny. Running watts = required BTU/h ÷ SEER2 (default 15).",
      },
      {
        formula: "Q = 0.25 × √WSFU  (L/s);  D = √(4Q ÷ (π × 2 m/s)) → next standard pipe size",
        variables:
          "WSFU = water supply fixture units (Hunter's method, cold water): WC flush tank 3, WC flush valve 10, basin 1, bath/shower 2, kitchen sink 2, washing machine 3, dishwasher 2. Pipe is sized at a maximum velocity of 2 m/s. Pump power = ρ·g·Q·H ÷ η; head = (static + friction) × 1.1.",
      },
    ],
    tables: [
      {
        title: "ENERGY STAR base cooling (room area → BTU/h)",
        headers: ["Room (sq ft)", "≤ 150", "≤ 250", "≤ 350", "≤ 450", "≤ 550", "≤ 700", "≤ 1,000", "≤ 1,500"],
        rows: [["Base BTU/h", "5,000", "6,000", "8,000", "10,000", "12,000", "14,000", "18,000", "24,000"]],
      },
      {
        title: "Copper cable ampacity, PVC, Method C at 40 °C (IEC 60364-5-52, planning values)",
        headers: ["mm²", "1.5", "2.5", "4", "6", "10", "16", "25"],
        rows: [["Iz (A)", "17", "24", "32", "41", "57", "76", "101"]],
      },
      {
        title: "Water supply fixture units (Hunter's method, cold water)",
        headers: ["Fixture", "WC tank", "WC valve", "Basin", "Bath/shower", "Kitchen sink", "Washing machine", "Dishwasher"],
        rows: [["WSFU", "3", "10", "1", "2", "2", "3", "2"]],
      },
    ],
    workedExample: {
      title: "Worked example — electrical, AC and plumbing for one house (the calculator's defaults)",
      inputs:
        "Electrical defaults: 12 LED lights (15 W, 0.8), 5 fans (75 W, 0.8), 2 split ACs 1.5 ton (1,800 W, 0.7), fridge (200 W, 0.8), 1 HP pump (750 W, 0.5), washing machine (500 W, 0.5), geyser (2,000 W, 0.5); single-phase 230 V, pf 0.9, 20 m cable run, 40 °C. AC: 12 × 15 ft room, 10 ft ceiling, 4 occupants, sunny, PKR 50/kWh, 8 h/day. Plumbing: 2 WC tanks, 2 basins, 2 bath/showers.",
      steps: [
        `Electrical: connected load = ${ELEC.connectedKw.toFixed(2)} kW; demand load = ${ELEC.demandKw.toFixed(2)} kW (${ELEC.demandKva.toFixed(2)} kVA at pf 0.9). Current = ${ELEC.currentA.toFixed(1)} A; design current = ${ELEC.currentA.toFixed(1)} × 1.25 = ${ELEC.designCurrentA.toFixed(1)} A → ${ELEC.breakerA} A breaker. Smallest cable passing ampacity (Iz 32 A ≥ 32 A breaker) and voltage drop: ${ELEC.cableMm2} mm² copper, drop ${ELEC.voltageDropV.toFixed(2)} V = ${ELEC.voltageDropPct.toFixed(2)}% (limit 3%).`,
        `AC: ENERGY STAR base for 180 sq ft is 6,000 BTU/h; × 1.25 ceiling × 1.1 sun + 1,200 for two extra occupants = ${AC_EX.requiredBtuPerHour.toLocaleString("en-US")} BTU/h (${AC_EX.tons.toFixed(2)} tons) → nearest standard ${AC_EX.standardBtuPerHour.toLocaleString("en-US")} BTU/h. Running watts = 9,450 ÷ 15 = ${AC_EX.runningWatts.toFixed(0)} W; monthly running cost at PKR 50/kWh, 8 h/day = PKR ${Math.round(AC_EX.monthlyRunningCost ?? 0).toLocaleString("en-US")}.`,
        `Plumbing: total fixture units = 2 × 3 + 2 × 1 + 2 × 2 = ${PLUMB.totalWsfu} WSFU; design flow = 0.25 × √12 = ${PLUMB.designFlowLs.toFixed(2)} L/s (${PLUMB.designFlowM3PerH.toFixed(2)} m³/h); cold-water main ${PLUMB.mainDiameterMm} mm, branch ${PLUMB.branchDiameterMm} mm; tank ${PLUMB.tankLitres.toLocaleString("en-US")} L (1,000 Imperial gallons, the Pakistan standard); pump head (10 m static + 5 m friction) × 1.1 = ${PLUMB.pumpHeadM.toFixed(1)} m, power ${PLUMB.pumpKw.toFixed(2)} kW (${PLUMB.pumpHp.toFixed(2)} HP) at 60% efficiency.`,
      ],
      result: `Demand ${ELEC.demandKw.toFixed(2)} kW (${ELEC.demandKva.toFixed(2)} kVA) on a ${ELEC.breakerA} A breaker with ${ELEC.cableMm2} mm² copper; AC ${AC_EX.standardBtuPerHour.toLocaleString("en-US")} BTU/h; plumbing ${PLUMB.designFlowLs.toFixed(2)} L/s on a ${PLUMB.mainDiameterMm} mm main with a ${PLUMB.tankLitres.toLocaleString("en-US")} L tank. Confirm cable and breaker sizes with a licensed electrician — the ampacity table is planning values from IEC 60364-5-52, not a cable maker's datasheet.`,
    },
    related: [
      { id: "infra-mep-engine", title: "Master Infrastructure & MEP Engine", desc: "Solar, water heating, AC and rainwater sizing for infrastructure projects, with BOQ export." },
      { id: "solar-roof", title: "Solar Roof System Calculator", desc: "Panels, battery and payback in full detail — loan, tilt and cash flow." },
      { id: "solar-water-heater", title: "Solar Water Heater Sizing Tool", desc: "Collector area and tank capacity from daily hot-water demand, location and sunshine." },
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Collectible rainwater volume from roof area and rainfall, and tank sizes for storage and reuse." },
      { id: "wastewater-calculator", title: "Wastewater BOD & COD Calculator", desc: "BOD₅/COD lab testing, Manning sewer design, septic tanks and soak pits." },
    ],
  },

  "rainwater-harvesting": {
    id: "rainwater-harvesting",
    intro:
      "Rainwater harvesting turns the roof into a water source: every millimetre of rain on a square metre is a litre of water, and the roof area, the city's rainfall, the roof's runoff coefficient and the filter's efficiency decide how much of it you can actually collect. The tank is sized the BS 8515 / BS EN 16941-1 way — 5% of the lesser of annual yield and annual demand — and then checked against the dry-spell need, because a tank that holds 5% of the annual figure but runs dry three weeks into the dry season is useless. In Pakistan the payback on water savings alone is usually decades; the system pays as water security and groundwater recharge, not as a financial return. Harvested rainwater is not drinking water without treatment and testing.",
    formulas: [
      {
        formula: "Yield (L/yr) = roof area (m²) × rainfall (mm) × runoff coefficient × filter efficiency (0.9)",
        variables:
          "1 mm of rain on 1 m² = 1 L. Runoff coefficient depends on the roof: metal 0.9, concrete/tiles 0.85, asphalt 0.8, gravel 0.6, green roof 0.2.",
        note: "First-flush diversion is an optional deduction: 0.5 L/m² per event (60 events a year is typical).",
      },
      {
        formula: "Demand (L/yr) = people × non-potable use (L/person/day, default 50) × 365",
        variables:
          "Non-potable uses are flushing, washing, gardening and cleaning — not drinking.",
      },
      {
        formula: "Tank = max(5% × min(yield, demand), daily use × dry days) → next standard size",
        variables:
          "BS 8515: 5% of the LESSER of yield and demand. Dry-spell need defaults to 21 days (range 7–45). Standard tank sizes: 500, 1,000, 2,000, 3,000, 5,000, 10,000 L.",
        note: "The old 8%-of-yield rule with no demand input is retired — a tank sized from yield alone is oversized when demand is the smaller number.",
      },
      {
        formula: "Coverage % = min(yield, demand) ÷ demand × 100;  Days of supply = tank ÷ daily use",
        variables:
          "Coverage is the share of non-potable demand the roof can meet. Annual saving = min(yield, demand) ÷ 1000 × water cost per m³.",
      },
      {
        formula: "Tank dimensions (rectangular cistern, L:W = 2:1): width = √(volume ÷ depth ÷ 2);  Downpipes = ⌈roof area ÷ 75⌉",
        variables:
          "Tank depth defaults to 1.75 m. Gutter size by roof area: ≤ 50 m² → 75 mm, ≤ 100 m² → 100 mm, ≤ 200 m² → 110 mm, above that 150 mm.",
      },
    ],
    tables: [
      {
        title: "Long-term average annual rainfall by city (mm)",
        headers: ["City", "Lahore", "Karachi", "Islamabad", "Multan", "Quetta", "Dubai", "Mumbai", "Delhi"],
        rows: [["Rainfall (mm)", "628", "174", "1,143", "186", "244", "94", "2,213", "797"]],
      },
      {
        title: "Runoff coefficient by roof type",
        headers: ["Roof", "Metal", "Concrete / tiles", "Asphalt", "Gravel", "Green roof"],
        rows: [["Coefficient", "0.9", "0.85", "0.8", "0.6", "0.2"]],
      },
    ],
    workedExample: {
      title: "Worked example — 100 m² concrete-tile roof in Lahore, 4 people (the calculator's defaults)",
      inputs:
        "Roof 100 m², Lahore rainfall 628 mm, concrete/tiles (runoff 0.85), filter efficiency 0.9, no first-flush deduction, 4 people × 50 L/day non-potable use, 21 dry days, water PKR 150/m³, tank PKR 35/L, fixed system cost PKR 75,000.",
      steps: [
        `Annual yield = 100 × 628 × 0.85 × 0.9 = ${RAIN.yieldLPerYear.toFixed(0)} L/year.`,
        `Annual demand = 4 × 50 × 365 = ${RAIN.demandLPerYear.toLocaleString("en-US")} L/year; daily use ${RAIN.dailyUseL} L/day.`,
        `BS 8515 5% rule = 5% × min(${RAIN.yieldLPerYear.toFixed(0)}, ${RAIN.demandLPerYear.toLocaleString("en-US")}) = ${RAIN.tankBy5PctRuleL.toFixed(0)} L. Dry-spell need = ${RAIN.dailyUseL} × 21 = ${RAIN.tankByDrySpellL.toFixed(0)} L — the dry spell governs.`,
        `Tank required ${RAIN.tankRequiredL.toFixed(0)} L → ${RAIN.tankL.toLocaleString("en-US")} L standard size (${RAIN.tankLengthM.toFixed(2)} m × ${RAIN.tankWidthM.toFixed(2)} m × ${RAIN.tankDepthM} m deep). Coverage = ${RAIN.yieldLPerYear.toFixed(0)} ÷ ${RAIN.demandLPerYear.toLocaleString("en-US")} = ${RAIN.coveragePct.toFixed(0)}%; days of supply = 5,000 ÷ 200 = ${RAIN.daysOfSupply.toFixed(0)} days. Downpipes: ${RAIN.downpipes}; gutter ${RAIN.gutterSizeMm} mm.`,
        `Annual saving = ${RAIN.yieldLPerYear.toFixed(0)} ÷ 1,000 × 150 = PKR ${Math.round(RAIN.annualSavings).toLocaleString("en-US")}; system cost = 5,000 × 35 + 75,000 = PKR ${Math.round(RAIN.systemCost).toLocaleString("en-US")}; payback = ${RAIN.paybackYears?.toFixed(1)} years.`,
      ],
      result: `A ${RAIN.tankL.toLocaleString("en-US")} L tank covers ${RAIN.coveragePct.toFixed(0)}% of the household's non-potable demand with ${RAIN.daysOfSupply.toFixed(0)} days of dry-spell supply — but at a ${RAIN.paybackYears?.toFixed(1)}-year payback on water savings alone, size it for water security, not for return. Monthly rainfall is spread evenly in this tool (labelled assumption) — replace it with monthly PMD/IMD data for a real design.`,
    },
    related: [
      { id: "solar-water-heater", title: "Solar Water Heater Sizing Tool", desc: "Collector area and tank capacity from daily hot-water demand, location and sunshine." },
      { id: "wastewater-calculator", title: "Wastewater BOD & COD Calculator", desc: "BOD₅/COD lab testing, Manning sewer design, septic tanks and soak pits." },
      { id: "house", title: "House Construction Cost Estimator", desc: "Grey structure and finishing cost for a full house in PKR, including rainwater add-ons." },
      { id: "mep-calculator", title: "Energy & MEP Calculator Suite", desc: "Solar, water heating, AC, electrical load and plumbing in one MEP hub." },
      { id: "infra-mep-engine", title: "Master Infrastructure & MEP Engine", desc: "Solar, water heating, AC and rainwater sizing for infrastructure projects, with BOQ export." },
    ],
  },

  "solar-water-heater": {
    id: "solar-water-heater",
    intro:
      "A solar water heater is sized from the heat the household needs, not from the roof: daily hot-water demand in litres, times the specific heat of water, times the temperature rise, gives the kilowatt-hours per day, and the collector area is that energy divided by the sunshine, the collector efficiency and the solar fraction — the share of the year's hot water the sun is expected to supply. The tank is the larger of 1.5 days of demand and 60 litres per square metre of collector, rounded up to a standard size. The canonical demand is 50 litres per person per day (the old 40 L/person value is retired); the backup heater covers the remaining 40% of the energy when the solar fraction is 0.6.",
    formulas: [
      {
        formula: "Q = demand (L) × 4.184 × ΔT ÷ 3600  (kWh/day)",
        variables:
          "4.184 kJ/kg·°C is the specific heat of water; ΔT = target − inlet temperature (60 − 15 = 45 °C by default); 3,600 converts kJ to kWh.",
      },
      {
        formula: "Collector area (m²) = Q ÷ (radiation × efficiency × solar fraction)",
        variables:
          "Radiation defaults to 5.0 kWh/m²/day; flat-plate efficiency 50%, evacuated-tube 65%; solar fraction default 0.6 (range 0.3–0.9).",
      },
      {
        formula: "Panels = ⌈area ÷ 2⌉  (2 m² standard modules);  Installed area = panels × 2",
        variables:
          "You buy whole panels, not fractions — the cost is charged on the installed area, not the theoretical area. The old code cost the theoretical 6.97 m² while 4 panels are actually 8.00 m² (~13% light).",
      },
      {
        formula: "Tank = max(demand × 1.5, area × 60 L/m²) → next standard size (100, 150, 200, 300, 500 L)",
        variables:
          "The tank must hold a day and a half of demand AND at least 60 L per m² of collector, so the collector cannot overheat the tank on a sunny day.",
      },
      {
        formula: "Annual saving = Q × solar fraction × 365 × energy cost per kWh;  Payback = system cost ÷ annual saving",
        variables:
          "Backup energy = Q × (1 − solar fraction) kWh/day, supplied by the existing geyser or heater. Energy cost defaults to PKR 50/kWh (grid tariff) — enter your own rate for INR/AED.",
      },
    ],
    tables: [
      {
        title: "Collector types (indicative rates — confirm with a supplier)",
        headers: ["Type", "Efficiency", "Indicative rate"],
        rows: [
          ["Flat-plate (selective)", "50%", "PKR 45,000/m²"],
          ["Evacuated tube", "65%", "PKR 60,000/m²"],
        ],
      },
      {
        title: "Standard tank sizes (L)",
        headers: ["Sizes", "100", "150", "200", "300", "500"],
        rows: [["—", "✓", "✓", "✓", "✓", "✓"]],
      },
    ],
    workedExample: {
      title: "Worked example — 4 people, flat-plate collector (the calculator's defaults)",
      inputs:
        "4 people × 50 L/day, target 60 °C, inlet 15 °C, radiation 5.0 kWh/m²/day, flat-plate (50%), solar fraction 0.6, energy PKR 50/kWh, collector PKR 45,000/m², tank PKR 800/L, installation 10%.",
      steps: [
        `Daily demand = 4 × 50 = ${SWH.demandLPerDay} L/day; ΔT = 60 − 15 = ${SWH.deltaT} °C.`,
        `Heat needed Q = 200 × 4.184 × 45 ÷ 3600 = ${SWH.energyKwhPerDay.toFixed(2)} kWh/day.`,
        `Collector area = ${SWH.energyKwhPerDay.toFixed(2)} ÷ (5.0 × 0.50 × 0.6) = ${SWH.collectorAreaM2.toFixed(2)} m² → ${SWH.panels} panels (${SWH.installedAreaM2} m² installed).`,
        `Tank = max(200 × 1.5 = 300 L, ${SWH.collectorAreaM2.toFixed(2)} × 60 = ${(SWH.collectorAreaM2 * 60).toFixed(0)} L) = ${SWH.tankUnroundedL.toFixed(0)} L → ${SWH.tankL} L standard size. Backup = ${SWH.energyKwhPerDay.toFixed(2)} × 0.4 = ${SWH.backupKwhPerDay.toFixed(2)} kWh/day.`,
        `Annual solar energy = ${SWH.energyKwhPerDay.toFixed(2)} × 0.6 × 365 = ${SWH.annualSolarKwh.toFixed(0)} kWh; annual saving = ${SWH.annualSolarKwh.toFixed(0)} × 50 = PKR ${Math.round(SWH.annualSavings).toLocaleString("en-US")}. Cost: collector 8 × 45,000 = PKR ${Math.round(SWH.collectorCost).toLocaleString("en-US")}; tank 500 × 800 = PKR ${Math.round(SWH.tankCost).toLocaleString("en-US")}; installation 10% = PKR ${Math.round(SWH.installationCost).toLocaleString("en-US")}; total PKR ${Math.round(SWH.systemCost).toLocaleString("en-US")}; payback ${SWH.paybackYears?.toFixed(1)} years.`,
      ],
      result: `${SWH.panels} flat-plate panels (${SWH.installedAreaM2} m²) and a ${SWH.tankL} L tank for a 4-person household — PKR ${Math.round(SWH.systemCost).toLocaleString("en-US")} at indicative rates, paying back in ${SWH.paybackYears?.toFixed(1)} years at PKR 50/kWh. An evacuated-tube collector (65%) would need about a quarter less area for the same heat.`,
    },
    related: [
      { id: "solar-roof", title: "Solar Roof System Calculator", desc: "Size the solar PV system for the same house — panels, battery and payback." },
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Collectible rainwater volume from roof area and rainfall, and tank sizes for storage and reuse." },
      { id: "mep-calculator", title: "Energy & MEP Calculator Suite", desc: "Solar, water heating, AC, electrical load and plumbing in one MEP hub." },
      { id: "infra-mep-engine", title: "Master Infrastructure & MEP Engine", desc: "Solar, water heating, AC and rainwater sizing for infrastructure projects, with BOQ export." },
      { id: "house", title: "House Construction Cost Estimator", desc: "Grey structure and finishing cost for a full house in PKR." },
    ],
  },

  "wastewater-calculator": {
    id: "wastewater-calculator",
    intro:
      "The Wastewater Calculator has two halves that belong together: the lab half (BOD₅ and COD from titration data, checked against the Punjab EPA / PEQS discharge limits) and the design half (Manning sewer-pipe sizing, septic tank and soak-pit design). BOD₅ (APHA 5210B) measures the oxygen microbes consume in five days — the biodegradable load — while COD (APHA 5220D) measures everything dichromate can oxidise; their ratio tells you whether biological treatment will work at all. The sewerage half starts from the design flow, not the pipe capacity: population × per-capita flow × peak factor, then the smallest standard pipe that carries it at self-cleansing velocity. The septic tank follows IS 2470 with CPHEEO sludge rates, and every IS 2470 minimum is enforced — liquid volume, width, depth and freeboard.",
    formulas: [
      {
        formula: "BOD₅ = ΔDO ÷ P;  P = sample volume ÷ bottle volume;  ΔDO = initial DO − final DO",
        variables:
          "APHA 5210B. P is the dilution factor; a 10 mL sample in a 300 mL bottle has P = 0.0333. Validity: final DO ≥ 1.0 mg/L, DO depletion ≥ 2.0 mg/L, blank depletion ≤ 0.2 mg/L — otherwise the test is invalid and the sample volume must change.",
      },
      {
        formula: "COD = (V_blank − V_sample) × N × 8000 ÷ sample volume (mL)",
        variables:
          "APHA 5220D (dichromate reflux). 8,000 is the milliequivalent weight of oxygen in mg/L. N = normality of the ferrous ammonium sulphate titrant.",
      },
      {
        formula: "Manning (full bore): R = D ÷ 4;  V = (1 ÷ n) × R^(2/3) × S^(1/2);  Q = A × V",
        variables:
          "R = hydraulic radius; n = Manning's roughness (PVC/uPVC/HDPE 0.009, concrete 0.013, cast iron 0.014, clay 0.015); S = gradient. Self-cleansing needs V ≥ 0.6 m/s; design velocity is capped at 2.5 m/s.",
      },
      {
        formula: "Minimum slope for self-cleansing: S_min = [0.6 × n ÷ R^(2/3)]²",
        variables:
          "The flattest gradient that still gives 0.6 m/s at full bore. Flatter than this, solids settle and the sewer blocks.",
      },
      {
        formula: "Q_design = population × q × peak factor;  peak = 3.0 below 1,000 people, 2.5 above",
        variables:
          "q = wastewater per person per day (default 120 L). Average flow = P × q ÷ 86,400 L/s. Pipe selection: smallest standard diameter (100–600 mm) whose full-bore capacity ≥ Q_design at 0.6–2.5 m/s.",
      },
      {
        formula: "Septic volume V = P × q × T + P × S × N;  Soak area = daily flow ÷ soil loading rate",
        variables:
          "P = users; q = 120 L/person/day; T = retention (default 1 day, minimum 1); S = sludge 30 L/person/year (CPHEEO); N = desludging interval (default 2 years). IS 2470 minimums: liquid volume ≥ 1,000 L, width ≥ 0.75 m, liquid depth ≥ 1.0 m, + 0.3 m freeboard, L:W 2:1. Soak-pit diameter is fixed at 1.5 m (1.2–2.0 m editable); if one pit would be deeper than 4 m, split it into several.",
      },
    ],
    tables: [
      {
        title: "PEQS / NEQS effluent limits (mg/L)",
        headers: ["Parameter", "Inland discharge", "To sewer"],
        rows: [
          ["BOD", "80", "250"],
          ["COD", "150", "400"],
          ["TSS", "200", "400"],
        ],
      },
      {
        title: "COD/BOD ratio — what it says about treatability (engine bands)",
        headers: ["Ratio", "Reading"],
        rows: [
          ["< 1.5", "Unusually low — check dilution, seeding or measurement"],
          ["1.5–3.0", "Biodegradable — biological treatment is suitable"],
          ["3.0–3.5", "Partly biodegradable — long retention or pre-treatment may be needed"],
          ["> 3.5", "Largely non-biodegradable — chemical / physico-chemical treatment likely needed"],
        ],
      },
      {
        title: "Manning's n by pipe material",
        headers: ["Material", "PVC / uPVC / HDPE", "Concrete", "Cast iron", "Clay"],
        rows: [["n", "0.009", "0.013", "0.014", "0.015"]],
      },
    ],
    workedExample: {
      title: "Worked example — lab screen plus sewer and septic for 50 people (the calculator's defaults)",
      inputs:
        "BOD₅: initial DO 8.5 mg/L, final DO 3.2 mg/L, 10 mL sample in a 300 mL bottle. COD: blank titrant 25.0 mL, sample titrant 12.5 mL, 0.1 N, 50 mL sample. Sewer: 50 people, 120 L/person/day, PVC pipe at 1:200. Septic: 10 users, 1 day retention, 2-year desludging, liquid depth 1.2 m, soil loading 30 L/m²/day.",
      steps: [
        `BOD₅: P = 10 ÷ 300 = ${BOD.dilutionFactorP.toFixed(4)}; ΔDO = 8.5 − 3.2 = ${BOD.doDepletionMgL.toFixed(2)} mg/L; BOD₅ = ${BOD.doDepletionMgL.toFixed(2)} ÷ ${BOD.dilutionFactorP.toFixed(4)} = ${BOD.bodMgL.toFixed(1)} mg/L — above the 80 mg/L inland limit but within the 250 mg/L sewer limit (${BOD.status === "meets-sewer-only" ? "meets PEQS for discharge to sewer only" : BOD.status}). Valid: final DO 3.2 ≥ 1.0 and depletion 5.3 ≥ 2.0.`,
        `COD: titrant difference = 25.0 − 12.5 = ${COD.titrantDiffMl.toFixed(2)} mL; COD = (12.5 × 0.1 × 8000) ÷ 50 = ${COD.codMgL.toFixed(1)} mg/L — also sewer-only (inland limit 150 mg/L).`,
        `COD/BOD ratio = ${COD.codMgL.toFixed(0)} ÷ ${BOD.bodMgL.toFixed(0)} = ${EFFLUENT.codBodRatio.toFixed(2)} — ${EFFLUENT.codBodInterpretation}`,
        `Manning, 200 mm PVC at 1:200: R = 0.2 ÷ 4 = ${MANNING.hydraulicRadiusM.toFixed(4)} m; V = (1 ÷ 0.009) × 0.05^(2/3) × 0.005^(1/2) = ${MANNING.velocityMs.toFixed(3)} m/s (self-cleansing: yes); Q = ${MANNING.dischargeLPerS.toFixed(1)} L/s. Minimum slope for self-cleansing = 1 in ${MANNING.minSlopeForSelfCleansing1InX.toFixed(0)}.`,
        `Design flow for 50 people = ${DESIGN_FLOW.averageFlowLPerS.toFixed(3)} L/s average × peak ${DESIGN_FLOW.peakFactor} = ${DESIGN_FLOW.designFlowLPerS.toFixed(2)} L/s. Smallest adequate pipe: ${PIPE_SEL.selectedDiameterMm} mm (capacity ${PIPE_SEL.capacityLPerS?.toFixed(2)} L/s at ${PIPE_SEL.velocityMs?.toFixed(2)} m/s).`,
        `Septic for 10 users: daily flow ${SEPTIC.dailyFlowL} L/day; V = 1,200 (retention) + 600 (sludge) = ${SEPTIC.calculatedVolumeL.toFixed(0)} L; tank ${SEPTIC.lengthM.toFixed(2)} m × ${SEPTIC.widthM.toFixed(2)} m, liquid depth ${SEPTIC.liquidDepthM} m + 0.3 m freeboard = ${SEPTIC.totalDepthM.toFixed(2)} m total. Soak area = 1,200 ÷ 30 = ${SEPTIC.soakAreaM2.toFixed(0)} m² → ${SEPTIC.soakPits} pits of ${SEPTIC.soakPitDiameterM} m dia × ${SEPTIC.soakPitDepthPerPitM.toFixed(2)} m deep (one pit would need ${(SEPTIC.soakAreaM2 / (Math.PI * SEPTIC.soakPitDiameterM)).toFixed(2)} m — over the 4 m limit). Alternative: a dispersion trench about ${SEPTIC.dispersionTrenchLengthM.toFixed(1)} m long.`,
      ],
      result: `BOD₅ ${BOD.bodMgL.toFixed(0)} mg/L and COD ${COD.codMgL.toFixed(0)} mg/L — both sewer-only under PEQS, with a COD/BOD ratio of ${EFFLUENT.codBodRatio.toFixed(2)}. A 50-person scheme needs only a ${PIPE_SEL.selectedDiameterMm} mm sewer at 1:200, and a 10-user septic tank of ${SEPTIC.calculatedVolumeL.toFixed(0)} L with ${SEPTIC.soakPits} soak pits.`,
    },
    related: [
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Collectible rainwater volume from roof area and rainfall, and tank sizes for storage and reuse." },
      { id: "mep-calculator", title: "Energy & MEP Calculator Suite", desc: "Solar, water heating, AC, electrical load and plumbing in one MEP hub." },
      { id: "infra-mep-engine", title: "Master Infrastructure & MEP Engine", desc: "Solar, water heating, AC and rainwater sizing for infrastructure projects, with BOQ export." },
      { id: "house", title: "House Construction Cost Estimator", desc: "Grey structure and finishing cost for a full house in PKR." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Trench excavation and backfill volumes for the sewer line." },
    ],
  },

  "anti-termite": {
    id: "anti-termite",
    intro:
      "Pre-construction anti-termite treatment (IS 6313-2:2022) is a soil barrier, not a spray-and-hope: diluted termiticide emulsion is applied to the trench bottom and sides, to the soil under the floor slab, and to any RCC surface in contact with soil, before the concrete goes in — once the slab is cast, the barrier cannot be fixed. The doses are per linear metre and per square metre, and the one that matters most is the trench-sides dose: 7.5 litres of diluted emulsion per linear metre of trench, to 30 cm depth. The old tool multiplied perimeter × depth × 7.5, which under-dosed by 50% at the defaults — a safety-critical error, because an under-dosed barrier is a barrier that fails silently years later. This calculator does not recommend a chemical: use only a product registered for soil treatment in your province or state, and follow its label.",
    formulas: [
      {
        formula: "Trench bottom = trench length × trench width × 5 L/m²",
        variables:
          "The bottom of the foundation trench, dosed at 5 L per m² (IS 6313-2:2022). Trench width defaults to 0.6 m.",
      },
      {
        formula: "Trench sides = trench length × 7.5 L per linear metre",
        variables:
          "The sides of the trench, to 30 cm depth — 7.5 L PER LINEAR METRE, not per square metre of wall area. Depth beyond 30 cm does not increase the dose.",
        note: "The retired formula (perimeter × depth × 7.5) gave 150 L where the correct dose is 300 L at the defaults — a 50% under-dose. Never reproduce it.",
      },
      {
        formula: "Floor / plinth soil = floor area × 5 L/m²",
        variables:
          "The soil under the ground-floor slab and plinth, dosed at 5 L per m².",
      },
      {
        formula: "External periphery apron (optional) = perimeter × 7.5 L/m;  RCC vertical surfaces = area × 7.5 L/m²",
        variables:
          "The apron around the building's external periphery and any RCC face in contact with soil. The apron is off by default because it can overlap the trench-sides stage on some sites.",
      },
      {
        formula: "Concentrate = total emulsion ÷ (1 + water parts);  Packs = ⌈concentrate ÷ pack size⌉",
        variables:
          "Dilution is 1:X (1 part concentrate to X parts water): Bifenthrin 2.5% EC is 1:19, Imidacloprid 30.5% SC is about 1:475 (2.1 mL/L). Wastage defaults to 5%.",
      },
    ],
    tables: [
      {
        title: "IS 6313-2:2022 doses (diluted emulsion)",
        headers: ["Stage", "Dose"],
        rows: [
          ["Trench bottom", "5 L/m²"],
          ["Trench sides (to 30 cm depth)", "7.5 L per linear metre"],
          ["Floor / plinth soil", "5 L/m²"],
          ["External periphery apron", "7.5 L per linear metre"],
          ["RCC vertical surfaces in contact with soil", "7.5 L/m²"],
        ],
      },
      {
        title: "Chemicals in the tool (check local registration and follow the label)",
        headers: ["Chemical", "Dilution", "Note"],
        rows: [
          ["Bifenthrin 2.5% EC (default)", "1:19", "Common soil-treatment termiticide"],
          ["Imidacloprid 30.5% SC", "1:475", "About 2.1 mL/L"],
          ["Chlorpyrifos 20% EC", "1:19", "REGULATORY WARNING — restricted or banned in several jurisdictions; registration for soil treatment in Punjab, Pakistan is unverified. Do not use as a default."],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 100 m² floor, 40 m trench, Bifenthrin (the calculator's defaults)",
      inputs:
        "Floor area 100 m², trench length 40 m, trench width 0.6 m, Bifenthrin 2.5% EC at 1:19, 5% wastage, 5 L packs. No external apron, no vertical RCC area.",
      steps: [
        `Trench bottom: 40 × 0.6 × 5 = ${TERMITE.trenchBottomL.toFixed(1)} L.`,
        `Trench sides: 40 × 7.5 = ${TERMITE.trenchSidesL.toFixed(1)} L (IS 6313-2:2022 — NOT perimeter × depth × 7.5, which would give only 150 L).`,
        `Floor / plinth soil: 100 × 5 = ${TERMITE.floorL.toFixed(1)} L.`,
        `Subtotal = ${TERMITE.subtotalL.toFixed(1)} L; + 5% wastage (${TERMITE.wastageL.toFixed(1)} L) = ${TERMITE.totalEmulsionL.toFixed(1)} L of emulsion to prepare.`,
        `Concentrate (1:19) = ${TERMITE.totalEmulsionL.toFixed(1)} ÷ 20 = ${TERMITE.concentrateL.toFixed(1)} L; water = ${TERMITE.waterL.toFixed(1)} L.`,
        `Packs: ${TERMITE.concentrateL.toFixed(1)} L ÷ 5 L = ${TERMITE.packs} packs (${TERMITE.packsVolumeL} L).`,
      ],
      result: `${TERMITE.totalEmulsionL.toFixed(0)} L of diluted emulsion (${TERMITE.concentrateL.toFixed(1)} L concentrate + ${TERMITE.waterL.toFixed(0)} L water) — buy ${TERMITE.packs} × 5 L packs. The trench sides alone are ${TERMITE.trenchSidesL.toFixed(0)} L, nearly a third of the job: get that dose right and the barrier works; halve it and it fails years later, out of sight.`,
    },
    related: [
      { id: "house", title: "House Construction Cost Estimator", desc: "Grey structure and finishing cost for a full house in PKR — termite proofing is a standard substructure item." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation volumes for the foundation trenches this treatment goes into." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Retaining walls in contact with soil also need their vertical faces treated." },
      { id: "master-quantity", title: "Master Quantity & Estimation", desc: "Quantity takeoff for the whole project, including substructure treatment." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Cost Calculator", desc: "Cost per sq ft by city and finish tier — grey, standard, premium or luxury." },
    ],
  },

  chainage: {
    id: "chainage",
    intro:
      "Chainage volume is how a road's cut and fill are measured: cross-sections are taken at stations along the alignment — written as chainages like 1+200, meaning 1 km + 200 m — and the volume between two stations is the average of their end areas times the distance between them. At each station the depth is the natural ground level minus the formation level: positive is cut, negative is fill, and the section is a trapezoid (formation width plus side slopes). The trapezoidal rule is the workhorse; Simpson's 1/3 rule is more exact but is blocked unless the stations are equally spaced and odd in number, because the old tool silently used it on unequal spacing. Cut and fill are then balanced with swell and shrinkage, because dug soil bulks up and compacted fill shrinks.",
    formulas: [
      {
        formula: "Chainage 1+200 = 1 × 1000 + 200 = 1,200 m",
        variables:
          "km+m notation: the number before + is kilometres, after + is metres. Plain metres are accepted too; anything else is rejected, not silently turned into NaN.",
      },
      {
        formula: "Section area A = B × d + s × d²",
        variables:
          "B = formation width (m); d = depth (m), NGL − formation level; s = side slope (horizontal per vertical). Positive d is cut, negative d is fill — each station gives one cut area and one fill area, and one of them is zero.",
      },
      {
        formula: "V = L × (A1 + A2) ÷ 2   (trapezoidal / average-end-area)",
        variables:
          "L = distance between stations; A1, A2 = end areas. Used even when one end area is zero — the section tapers in depth only, because the formation width remains, so the pyramid V = A·L/3 does not apply to a road prism.",
      },
      {
        formula: "Simpson's rule: V = h ÷ 3 × (A1 + 4·A2 + A3) per pair of intervals",
        variables:
          "h = station spacing. Allowed ONLY with an odd number of stations (≥ 3) and equal spacing — the tool throws an error otherwise.",
      },
      {
        formula: "Bulked cut = cut × (1 + swell %);  Shrunken fill = fill × (1 − shrinkage %);  Net = bulked cut − shrunken fill",
        variables:
          "Defaults: swell 15%, shrinkage 10%. Net > 0 is a surplus to haul away; net < 0 is a deficit to import; net = 0 is balanced.",
      },
    ],
    tables: [
      {
        title: "Worked stations — 7 m formation, 1.5:1 slopes",
        headers: ["Chainage", "NGL (m)", "Formation (m)", "Depth (m)", "Cut area (m²)", "Fill area (m²)"],
        rows: CHAIN_AREAS.map((a) => [
          a.chainage.toString(),
          a.chainage === 0 ? "100" : a.chainage === 30 ? "102" : a.chainage === 60 ? "98" : "99",
          "100",
          a.chainage === 0 ? "0" : a.chainage === 30 ? "+2.0" : a.chainage === 60 ? "−2.0" : "−1.0",
          a.cutM2.toFixed(1),
          a.fillM2.toFixed(1),
        ]),
      },
      {
        title: "Simpson's rule — when it is allowed",
        headers: ["Condition", "Required"],
        rows: [
          ["Number of stations", "Odd (≥ 3)"],
          ["Spacing", "Equal between every pair"],
          ["Otherwise", "Use the trapezoidal rule"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 90 m of road, four stations (the calculator's defaults)",
      inputs:
        "Stations at chainages 0, 30, 60, 90 m; formation level 100 m; NGL 100, 102, 98, 99 m; formation width 7 m; cut and fill slopes 1.5:1; swell 15%, shrinkage 10%.",
      steps: [
        `Section areas: at 0 m depth 0 → cut 0, fill 0. At 30 m depth +2.0 m → cut = 7 × 2 + 1.5 × 2² = ${CHAIN_AREAS[1].cutM2.toFixed(1)} m². At 60 m depth −2.0 m → fill ${CHAIN_AREAS[2].fillM2.toFixed(1)} m². At 90 m depth −1.0 m → fill = 7 × 1 + 1.5 × 1² = ${CHAIN_AREAS[3].fillM2.toFixed(1)} m².`,
        `Trapezoidal volumes by segment: 0–30 m cut ${(CHAIN_VOL.segments[0].cutM3).toFixed(0)} m³; 30–60 m cut ${(CHAIN_VOL.segments[1].cutM3).toFixed(0)} m³ and fill ${(CHAIN_VOL.segments[1].fillM3).toFixed(0)} m³; 60–90 m fill ${(CHAIN_VOL.segments[2].fillM3).toFixed(1)} m³. Totals: cut ${CHAIN_VOL.cutM3.toFixed(0)} m³, fill ${CHAIN_VOL.fillM3.toFixed(1)} m³.`,
        `Simpson's rule is blocked here — 4 stations is an even count. Add a fifth station (or drop to three) with equal 30 m spacing to use it.`,
        `Balance: bulked cut = 600 × 1.15 = ${CHAIN_BAL.bulkedCutM3.toFixed(0)} m³; shrunken fill = 727.5 × 0.90 = ${CHAIN_BAL.shrunkenFillM3.toFixed(2)} m³; net = ${CHAIN_BAL.netM3.toFixed(2)} m³ — ${CHAIN_BAL.balance.toLowerCase()}.`,
      ],
      result: `Cut ${CHAIN_VOL.cutM3.toFixed(0)} m³, fill ${CHAIN_VOL.fillM3.toFixed(1)} m³, net ${CHAIN_BAL.netM3.toFixed(2)} m³ surplus after swell and shrinkage — a small surplus to haul away. Cost is cut × cut rate + fill × fill rate + haul (m³·km) × haul rate, all entered as rates.`,
    },
    related: [
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Prismoidal and average-end-area volumes, swell and shrinkage, truck trips and trench backfill." },
      { id: "gradient-calculator", title: "Road Gradient & Slope Calculator", desc: "Longitudinal gradients, cambers and vertical curves — the levels this volume work starts from." },
      { id: "road-pavement", title: "Road & Pavement Estimator Tool", desc: "Material quantities for flexible and rigid pavement layers, layer by layer." },
      { id: "master-quantity", title: "Master Quantity & Estimation", desc: "Quantity takeoff for the whole project, including earthworks." },
      { id: "retaining-wall", title: "Cantilever Retaining Wall Estimator", desc: "Earth pressure, stability checks and material quantities for retaining walls on the same alignment." },
    ],
  },

  "gradient-calculator": {
    id: "gradient-calculator",
    intro:
      "Road gradients are three things at once: the longitudinal grade that climbs and falls (rise over length, written as a percentage or a 1-in-X ratio), the crossfall or camber that sheds water sideways, and the vertical curve that joins two grades without a kink. The vertical curve is a parabola whose length comes from the stopping sight distance: on a crest the driver must see over the hill, so the length depends on sight distance squared; in a sag the headlights must light the road ahead at night, so the length depends on sight distance and the headlight beam. This calculator uses the correct AASHTO metric forms with both branches — the old K = V²/280 and V²/180 formulas were invented and are gone.",
    formulas: [
      {
        formula: "Rise = length × gradient % ÷ 100;  Ratio = 1 : (100 ÷ gradient %)",
        variables:
          "A 2% grade over 200 m rises 4 m; written as 1:50. Flat is 0% — no ratio.",
      },
      {
        formula: "Crest: L = A·S² ÷ 658  (S ≤ L);  L = 2S − 658 ÷ A  (S > L)",
        variables:
          "A = |g1 − g2| in percent (the algebraic grade change); S = stopping sight distance (m); L = curve length (m). The S > L branch matters: at 80 km/h, S = 120 m and A = 5% gives a primary L of 109.4 m, which is shorter than S, so the second branch applies and L = 108.4 m.",
      },
      {
        formula: "Sag: L = A·S² ÷ (120 + 3.5·S)  (S ≤ L);  L = 2S − (120 + 3.5·S) ÷ A  (S > L)",
        variables:
          "Same symbols. The sag form comes from headlight sight distance, not crest sight distance — the two curves are different physics and must not share a formula.",
      },
      {
        formula: "K = L ÷ A;  High/low point x = −g1 × L ÷ (g2 − g1) from the PVC;  E = A × L ÷ 800",
        variables:
          "K = rate of vertical curvature (metres of curve per 1% of grade change). E = the offset between the curve and the grade intersection at the PVI. The high/low point is where the grade is zero — the crest of a crest curve or the low point of a sag.",
      },
      {
        formula: "Station elevation: y = PVC elevation + (g1 ÷ 100)·x + (a·x²) ÷ (2·L),  a = (g2 − g1) ÷ 100",
        variables:
          "The parabolic curve equation, x measured from the PVC. Grades are capped at ±12% and design speed at 20–120 km/h.",
      },
    ],
    tables: [
      {
        title: "Stopping sight distance by design speed (IRC / AASHTO)",
        headers: ["Speed (km/h)", "20", "30", "40", "50", "65", "80", "100", "120"],
        rows: [["SSD (m)", "20", "30", "45", "60", "80", "120", "180", "240"]],
      },
      {
        title: "Sag comfort check (labelled — verify against IRC:66 before design use)",
        headers: ["Check", "Rule"],
        rows: [
          ["Minimum length (comfort)", "L ≥ A·V² ÷ 46.5 (sag curves only)"],
          ["Drainage flag", "Raised when K > 51 — a very flat curve can pond water"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — crest and sag at 80 km/h (SSD 120 m)",
      inputs:
        "Crest: +2% → −3% (A = 5%), design speed 80 km/h, SSD 120 m, PVC at chainage 0, elevation 100 m. Sag: −2% → +3% (A = 5%), same speed.",
      steps: [
        `Crest: primary L = 5 × 120² ÷ 658 = 109.4 m. Since S (120 m) > L (109.4 m), the S > L branch applies: L = 2 × 120 − 658 ÷ 5 = ${GRAD_CREST.lengthM.toFixed(1)} m. K = ${GRAD_CREST.lengthM.toFixed(1)} ÷ 5 = ${GRAD_CREST.k.toFixed(2)} m per 1%.`,
        `High point: x = −2 × ${GRAD_CREST.lengthM.toFixed(1)} ÷ (−3 − 2) = ${GRAD_HL.xFromPvcM?.toFixed(2)} m from the PVC; offset E = 5 × ${GRAD_CREST.lengthM.toFixed(1)} ÷ 800 = ${GRAD_HL.eM.toFixed(2)} m.`,
        `Elevations on the crest curve: chainage 0 → 100.00 m; 20 m → ${GRAD_ELEV[1].elevationM.toFixed(2)} m; 40 m → ${GRAD_ELEV[2].elevationM.toFixed(2)} m (near the high point); 60 m → ${GRAD_ELEV[3].elevationM.toFixed(2)} m; 100 m → ${GRAD_ELEV[5].elevationM.toFixed(2)} m.`,
        `Sag: L = 5 × 120² ÷ (120 + 3.5 × 120) = ${GRAD_SAG.lengthM.toFixed(1)} m (S ≤ L branch); K = ${GRAD_SAG.k.toFixed(2)}. The sag comfort check is a labelled IRC:66 rule — verify it against IRC:66 before using it for design.`,
      ],
      result: `Crest curve ${GRAD_CREST.lengthM.toFixed(1)} m long (K ${GRAD_CREST.k.toFixed(1)}), high point ${GRAD_HL.xFromPvcM?.toFixed(1)} m past the PVC; sag curve ${GRAD_SAG.lengthM.toFixed(1)} m long (K ${GRAD_SAG.k.toFixed(1)}). Always check which branch applies — using the primary form when S > L gives the wrong length.`,
    },
    related: [
      { id: "chainage", title: "Road Chainage Volume Calculator", desc: "Volumes between chainages from cross-sections along the road alignment." },
      { id: "road-pavement", title: "Road & Pavement Estimator Tool", desc: "Material quantities for flexible and rigid pavement layers, layer by layer." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Prismoidal and average-end-area volumes, swell and shrinkage, truck trips." },
      { id: "master-quantity", title: "Master Quantity & Estimation", desc: "Quantity takeoff for the whole project, including roadworks." },
      { id: "morth-irc-specs", title: "MoRTH & IRC Specifications Guide", desc: "The MoRTH and IRC clauses behind the pavement and gradient rules." },
    ],
  },

  "pavement-mix": {
    id: "pavement-mix",
    intro:
      "A pavement mix is a blended aggregate checked against a specification envelope — GSB, DBM, SMA or bituminous concrete, each with its own MoRTH table — and the check is sieve by sieve, not on average: one sieve outside its band fails the mix, however good the rest look. The tool blends up to four stockpiles (coarse, intermediate, fine/dust and mineral filler), checks every sieve against the chosen envelope, and can auto-solve the proportions by grid search, minimising the RMSE against the middle of each band. Bitumen content is a minimum by mix type, and the job-mix formula (JMF) tolerances are the MoRTH allowances for production variation around the approved gradation. Everything is computed client-side — the old component fetched a server endpoint that does not exist on static GitHub Pages, so its chart was always 0% while the table still said PASS.",
    formulas: [
      {
        formula: "Blended % passing = Σ (proportion × stockpile % passing)",
        variables:
          "Per sieve, over the four stockpiles; proportions sum to 100%. A stockpile's passing percentages must fall, never rise, as the sieve gets finer.",
      },
      {
        formula: "Status per sieve: pass if band min ≤ blended ≤ band max, else fail;  no band = no verdict",
        variables:
          "Sieves with no specification in the MoRTH table (e.g. 19 mm and 9.5 mm in DBM-1) are shown as no-band, not as a pass and not as a fail. The mix passes only if no banded sieve fails.",
      },
      {
        formula: "RMSE = √[ Σ (blended − band mid)² ÷ n ] over the banded sieves",
        variables:
          "How far the blended curve sits from the middle of each spec band. The auto-blend solver grid-searches proportions in 5% steps (filler fixed) to minimise it.",
      },
      {
        formula: "Total mix (t) = area (m²) × thickness (m) × density (2.35 t/m³ compacted);  Bitumen (kg) = total × bitumen % ÷ 100 × 1000",
        variables:
          "Aggregate tonnes follow the same proportions as the blend; filler kg = total × filler % ÷ 100 × 1000.",
      },
    ],
    tables: [
      {
        title: "Bituminous Concrete Grading 1 — MoRTH Table 500-17 (% passing)",
        headers: ["Sieve (mm)", "19", "9.5", "4.75", "2.36", "0.3", "0.075"],
        rows: [["BC-1", "100", "70–88", "53–71", "42–58", "18–28", "4–10"]],
      },
      {
        title: "Minimum bitumen content by mix (MoRTH)",
        headers: ["Mix", "GSB-I", "DBM-1", "DBM-2", "SMA", "BC-1", "BC-2"],
        rows: [
          ["Min bitumen %", "0 (unbound)", "4.0", "4.5", "5.8", "5.0", "5.0"],
          ["Typical %", "0", "4.5", "4.5", "5.8", "5.2", "5.4"],
        ],
      },
      {
        title: "JMF tolerances (MoRTH, percentage points)",
        headers: ["Sieve (mm)", "26.5", "19", "9.5", "4.75", "2.36", "0.3", "0.075"],
        rows: [["Tolerance (±)", "8", "7", "6", "5", "4", "2", "2"]],
      },
    ],
    workedExample: {
      title: "Worked example — BC-1 with the default stockpiles, then the solver's best blend",
      inputs:
        "Default stockpiles (% passing at 75 / 53 / 26.5 / 19 / 9.5 / 4.75 / 2.36 / 0.3 / 0.075 mm): coarse A [100, 100, 100, 85, 30, 5, 0, 0, 0], intermediate B [100, 100, 100, 100, 95, 45, 10, 0, 0], fine C [100, 100, 100, 100, 100, 100, 95, 45, 15], filler [100, 100, 100, 100, 100, 100, 100, 100, 90]. Default proportions 40 / 30 / 30 / 0. Quantities for 1,000 m² × 40 mm at 5.2% bitumen.",
      steps: [
        `Default 40/30/30 blend: 19 mm ${PAV_DEFAULT_BLEND[3].toFixed(1)}% (BC-1 needs 100 — FAIL), 9.5 mm ${PAV_DEFAULT_BLEND[4].toFixed(1)}% (70–88 — pass), 4.75 mm ${PAV_DEFAULT_BLEND[5].toFixed(1)}% (53–71 — FAIL), 2.36 mm ${PAV_DEFAULT_BLEND[6].toFixed(1)}% (42–58 — FAIL), 0.3 mm ${PAV_DEFAULT_BLEND[7].toFixed(1)}% (18–28 — FAIL), 0.075 mm ${PAV_DEFAULT_BLEND[8].toFixed(1)}% (4–10 — pass). Four sieves fail: the default blend does not meet BC-1.`,
        `The solver's best blend is ${PAV_SOLVED.proportions.aggA}/${PAV_SOLVED.proportions.aggB}/${PAV_SOLVED.proportions.aggC}/${PAV_SOLVED.proportions.filler} (RMSE ${PAV_SOLVED.rmse.toFixed(2)}): 9.5 mm ${PAV_SOLVED_BLEND[4].toFixed(1)}%, 4.75 mm ${PAV_SOLVED_BLEND[5].toFixed(1)}%, 2.36 mm ${PAV_SOLVED_BLEND[6].toFixed(1)}%, 0.3 mm ${PAV_SOLVED_BLEND[7].toFixed(1)}%, 0.075 mm ${PAV_SOLVED_BLEND[8].toFixed(1)}% — all pass. But 19 mm is ${PAV_SOLVED_BLEND[3].toFixed(1)}% against a required 100%, so even the best blend FAILS BC-1 on that one sieve.`,
        `Why: stockpile A passes only 85% at 19 mm, so no blend of these four stockpiles can reach 100% at 19 mm. Fix it by adding (or substituting) a stockpile that is 100% passing 19 mm — the solver can only optimise what it is given.`,
        `Quantities for 1,000 m² × 40 mm at 5.2% bitumen with the solved proportions: total mix = 1,000 × 0.04 × 2.35 = ${PAV_QTY.totalTonnes.toFixed(0)} t; bitumen = ${PAV_QTY.bitumenKg.toFixed(0)} kg; aggregates A ${PAV_QTY.aggTonnes.aggA.toFixed(1)} t, B ${PAV_QTY.aggTonnes.aggB.toFixed(1)} t, C ${PAV_QTY.aggTonnes.aggC.toFixed(1)} t; filler ${PAV_QTY.fillerKg.toFixed(0)} kg.`,
      ],
      result: `The default blend fails BC-1 on four sieves; the solver's best 25/25/50 blend passes five of six banded sieves and fails only 19 mm (${PAV_SOLVED_BLEND[3].toFixed(1)}% vs 100% required) — a stockpile problem, not a proportion problem. For 1,000 m² of 40 mm BC-1, order ${PAV_QTY.totalTonnes.toFixed(0)} t of mix including ${PAV_QTY.bitumenKg.toFixed(0)} kg of bitumen.`,
    },
    related: [
      { id: "aggregate-blending", title: "Aggregate Blending Calculator", desc: "Blend two to four aggregate stockpiles to meet target grading specifications." },
      { id: "road-pavement", title: "Road & Pavement Estimator Tool", desc: "Material quantities for flexible and rigid pavement layers, layer by layer." },
      { id: "master-sieve", title: "Master Sieve Analysis Calculator", desc: "Gradation curve, D10/D30/D60, Cu/Cc, fineness modulus and USCS classification." },
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve — the CBR the crust design starts from." },
      { id: "mix-design", title: "Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1", desc: "Design mix for M10–M60: target strength, w/c ratio, cement, sand and aggregate per m³." },
    ],
  },

  "road-pavement": {
    id: "road-pavement",
    intro:
      "A flexible pavement is a stack of layers, each wider than the one above it, and the estimator works layer by layer: the volume of each layer is its length times its average width times its thickness, the tonnage is the volume times the compacted density, and the bitumen is a percentage of the mix mass. The crust in the worked example is the IRC:37 pattern — bituminous concrete over dense bituminous macadam over wet-mix macadam over granular sub-base over prepared subgrade — with a continuous 2:1 side slope so each layer's top width is the layer above's bottom width, with no gaps. The IRC:37 thickness table in the tool is guidance only, never a design: a real crust is designed from the subgrade CBR and the traffic in million standard axles (MSA) by a pavement engineer.",
    formulas: [
      {
        formula: "V = L × (w_top + w_bottom) ÷ 2 × t",
        variables:
          "Layer volume (m³): L = length, w = top and bottom widths (m), t = thickness (m). The average width is the trapezoidal section — the layer widens down the 2:1 side slope.",
      },
      {
        formula: "Tonnage (t) = V × density (t/m³);  To order = tonnage × (1 + wastage %)",
        variables:
          "Densities: BC 2.4, DBM 2.35, WMM 2.25, GSB 2.1, subgrade 1.8 t/m³. Wastage defaults to 5% for granular layers and 3% for bituminous layers (editable).",
      },
      {
        formula: "Bitumen (t) = tonnage × bitumen % ÷ 100",
        variables:
          "Bitumen content is a percentage of the mix mass (BC-1 minimum 5.0% per MoRTH). Only bituminous layers carry bitumen.",
      },
      {
        formula: "Prime / tack coat: litres = area × rate (L/m²);  tonnes ≈ litres × 0.00101;  drums = ⌈litres ÷ 200⌉",
        variables:
          "Bitumen is about 1.01 kg/L. Prime coat is typically about 0.75 L/m², tack coat about 0.3 L/m² — both are rates you enter, not fixed constants.",
      },
    ],
    tables: [
      {
        title: "Worked crust — 1 km, 7.0 m carriageway, 2:1 side slopes",
        headers: ["Layer", "Thickness (mm)", "Top width (m)", "Bottom width (m)", "Density (t/m³)"],
        rows: ROAD_WORKED_LAYERS.map((l) => [l.name, l.thicknessMm.toString(), l.topWidthM.toFixed(2), l.bottomWidthM.toFixed(2), l.densityTM3.toFixed(2)]),
      },
      {
        title: "IRC:37 thickness guidance (labelled — not a design)",
        headers: ["Condition", "Guidance"],
        rows: [
          ["CBR < 5%", "Subgrade improvement / capping layer needed before crust selection — get a pavement design"],
          ["≤ 5 MSA", "Light traffic: granular base + thin bituminous surfacing"],
          ["5–30 MSA", "Medium traffic: GSB + WMM + DBM + BC"],
          ["> 30 MSA", "Heavy traffic: full IRC:37 crust with DBM + BC — design by a pavement engineer"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 1 km of the worked crust (the calculator's defaults)",
      inputs:
        "Length 1,000 m; layers as in the table above (BC 40 mm, DBM 90 mm, WMM 250 mm, GSB 200 mm, subgrade 500 mm); prime coat over the 7,000 m² carriageway at 0.75 L/m².",
      steps: [
        `BC: V = 1,000 × (7.00 + 7.16) ÷ 2 × 0.04 = ${ROAD_Q[0].volumeM3.toFixed(1)} m³; tonnage = ${ROAD_Q[0].volumeM3.toFixed(1)} × 2.4 = ${ROAD_Q[0].tonnageT.toFixed(1)} t.`,
        `DBM: V = 1,000 × (7.16 + 7.52) ÷ 2 × 0.09 = ${ROAD_Q[1].volumeM3.toFixed(1)} m³; tonnage ${ROAD_Q[1].tonnageT.toFixed(1)} t.`,
        `WMM: V = 1,000 × (7.52 + 8.52) ÷ 2 × 0.25 = ${ROAD_Q[2].volumeM3.toFixed(0)} m³; tonnage ${ROAD_Q[2].tonnageT.toFixed(1)} t.`,
        `GSB: V = 1,000 × (8.52 + 9.32) ÷ 2 × 0.20 = ${ROAD_Q[3].volumeM3.toFixed(0)} m³; tonnage ${ROAD_Q[3].tonnageT.toFixed(1)} t.`,
        `Subgrade: V = 1,000 × (9.32 + 11.32) ÷ 2 × 0.50 = ${ROAD_Q[4].volumeM3.toFixed(0)} m³; tonnage ${ROAD_Q[4].tonnageT.toFixed(0)} t.`,
        `Prime coat: 7,000 × 0.75 = ${COAT_PRIME.litres.toFixed(0)} L = ${COAT_PRIME.tonnes.toFixed(2)} t = ${COAT_PRIME.drums200L} drums of 200 L.`,
      ],
      result: `1 km of crust: ${ROAD_VOL_TOTAL.toLocaleString("en-US")} m³ in total, ${ROAD_TON_TOTAL.toLocaleString("en-US")} t — BC ${ROAD_Q[0].tonnageT.toFixed(0)} t, DBM ${ROAD_Q[1].tonnageT.toFixed(0)} t, WMM ${ROAD_Q[2].tonnageT.toFixed(0)} t, GSB ${ROAD_Q[3].tonnageT.toFixed(0)} t, subgrade ${ROAD_Q[4].tonnageT.toFixed(0)} t — plus ${COAT_PRIME.litres.toFixed(0)} L of prime coat. Enter your own rates per tonne: without rates the tool reports quantities, not cost.`,
    },
    related: [
      { id: "pavement-mix", title: "Pavement Mix & Gradation Calculator", desc: "Blend aggregates to MoRTH GSB, DBM and SMA gradation envelopes and check every sieve." },
      { id: "cbr-test", title: "CBR Test Calculator — IS 2720 Part 16 / ASTM D1883", desc: "Subgrade strength from the load–penetration curve — the CBR the crust design starts from." },
      { id: "chainage", title: "Road Chainage Volume Calculator", desc: "Volumes between chainages from cross-sections along the road alignment." },
      { id: "gradient-calculator", title: "Road Gradient & Slope Calculator", desc: "Longitudinal gradients, cambers and vertical curves for the same road." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Prismoidal and average-end-area volumes, swell and shrinkage, truck trips." },
    ],
  },

  "topsoil-estimator": {
    id: "topsoil-estimator",
    intro:
      "Topsoil is ordered loose and settles compacted, so the volume you order is bigger than the volume the bed ends up at: order volume is the net volume times the material's swell factor — 1.25 for topsoil, meaning a quarter extra to allow for settlement. The same rule covers compost, sand, gravel and clay fill, each with its own density and swell factor. The tool compares bulk against bagged supply on cost, and tells you which is cheaper — but only when you enter rates for both; with no rates it reports quantities, never a cost of zero.",
    formulas: [
      {
        formula: "Net volume = area × depth;  Order volume = net × swell factor",
        variables:
          "Depth must be 0–1 m. The loose volume delivered settles to the compacted (net) volume — the swell factor is the single source of truth; there is no separate compaction-allowance input.",
      },
      {
        formula: "Weight = order volume × density;  Bags = ⌈weight ÷ bag weight⌉ (default 25 kg);  Trucks = ⌈order volume ÷ truck capacity⌉ (default 10 m³)",
        variables:
          "Bags and trucks are always rounded up — you cannot order part of a bag or part of a truck.",
      },
      {
        formula: "Volume: yd³ = m³ × 1.30795;  ft³ = m³ × 35.3147;  litres = m³ × 1000",
        variables:
          "Unit conversions for the order volume, for suppliers who quote in cubic yards or cubic feet.",
      },
    ],
    tables: [
      {
        title: "Materials — density and swell factor",
        headers: ["Material", "Density (kg/m³)", "Swell factor"],
        rows: [
          ["Topsoil", "1,200", "1.25"],
          ["Compost", "600", "1.20"],
          ["Sand", "1,600", "1.15"],
          ["Gravel", "1,700", "1.12"],
          ["Clay fill", "1,600", "1.40"],
        ],
      },
    ],
    workedExample: {
      title: "Worked example — 50 m² lawn at 150 mm topsoil (the calculator's defaults)",
      inputs:
        "Area 50 m², depth 0.15 m, topsoil (density 1,200 kg/m³, swell factor 1.25), 25 kg bags, 10 m³ truck.",
      steps: [
        `Net volume = 50 × 0.15 = ${TOPSOIL.netM3.toFixed(2)} m³.`,
        `Order volume = ${TOPSOIL.netM3.toFixed(2)} × 1.25 = ${TOPSOIL.orderM3.toFixed(3)} m³ — the extra ${TOPSOIL.orderM3 - TOPSOIL.netM3 > 0 ? (TOPSOIL.orderM3 - TOPSOIL.netM3).toFixed(3) : ""} m³ is what settles out.`,
        `Weight = ${TOPSOIL.orderM3.toFixed(3)} × 1,200 = ${TOPSOIL.weightKg.toLocaleString("en-US")} kg (${TOPSOIL.weightTonnes.toFixed(2)} t).`,
        `Bags = ⌈${TOPSOIL.weightKg.toLocaleString("en-US")} ÷ 25⌉ = ${TOPSOIL.bags} bags. Trucks = ⌈${TOPSOIL.orderM3.toFixed(3)} ÷ 10⌉ = ${TOPSOIL.trucks} truck.`,
        `In imperial units the order is ${TOPSOIL.volumeYd3.toFixed(2)} yd³ (${TOPSOIL.volumeFt3.toFixed(1)} ft³, ${TOPSOIL.volumeLitres.toLocaleString("en-US")} L).`,
      ],
      result: `Order ${TOPSOIL.orderM3.toFixed(3)} m³ of topsoil (${TOPSOIL.weightTonnes.toFixed(2)} t, ${TOPSOIL.bags} bags or ${TOPSOIL.trucks} truckload) for a 50 m² bed at 150 mm — not 7.5 m³. Ordering the net volume leaves the bed a quarter short once it settles.`,
    },
    related: [
      { id: "house", title: "House Construction Cost Estimator", desc: "Grey structure and finishing cost for a full house in PKR, including landscaping add-ons." },
      { id: "earthworks", title: "Earthworks Calculator — Cut, Fill, Trucks & Trench Backfill", desc: "Excavation and backfill volumes for site grading and levelling." },
      { id: "rainwater-harvesting", title: "Rainwater Harvesting Calculator", desc: "Collectible rainwater volume from roof area and rainfall — the lawn this topsoil feeds." },
      { id: "master-quantity", title: "Master Quantity & Estimation", desc: "Quantity takeoff for the whole project, including landscaping." },
      { id: "pakistan-cost-calculator", title: "Pakistan House Cost Calculator", desc: "Cost per sq ft by city and finish tier — grey, standard, premium or luxury." },
    ],
  },
};

/** Look up the guide for a tool id, or undefined when the tool keeps the generic boilerplate. */
export function getToolGuide(toolId: string): ToolGuide | undefined {
  return TOOL_GUIDES[toolId];
}
