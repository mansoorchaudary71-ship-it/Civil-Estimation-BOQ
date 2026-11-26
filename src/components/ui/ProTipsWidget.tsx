import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { ALL_MODULES } from '../Dashboard';

// Per-tool tips. Every key MUST be a live module id from ALL_MODULES
// (Dashboard.tsx) — dead keys from the old table (quick-rough,
// advanced-boq, materials-master, beam-calculator, column-estimator,
// staircase-reference, concrete-mix, brickwork, sieve-analysis,
// soil-lab-suite, rate-analysis, construction-cost, slab-estimator,
// rigid-pavement, asphalt-paving) were renamed to their live ids or
// folded into a live key (slab tips → master-rcc; rigid/asphalt
// pavement tips → road-pavement).
const TIPS_DATABASE: Record<string, string[]> = {
  'quick-estimation': [
    'For rapid estimates, always add a 10-15% contingency for unforeseen variations in site conditions.',
    'Built-up area is typically 1.2 to 1.3 times the carpet area, depending on the wall thickness and design.'
  ],
  'house': [
    'When estimating house construction, rule of thumb for steel is usually 3.5-4.5 kg per sq.ft of built-up area.',
    'Standard concrete consumption is roughly 0.035 to 0.040 cubic meters per sq.ft of built-up area.'
  ],
  'boq': [
    'Always align your BOQ heads with standard civil divisions (Substructure, Superstructure, Finishes) for clarity.',
    'Ensure clear segregation between material supply rates and labor installation rates.'
  ],
  'takeoff': [
    'Deduct openings like doors and windows accurately; small openings < 0.5 sq.m are usually ignored by standard codes.',
    'Keep your takeoff scale consistent and always verify it with a known dimension on the drawing.'
  ],
  'material-takeoff': [
    'Wastage for tiles/marble is typically 5%, while for paints it can be around 2-3%. Factor this into your final quantity.',
    'Cement consumption for standard blockwork (1:6 mix) is approximately 0.2 bags per sq.m.'
  ],
  'master-rcc': [
    'The effective depth of a slab is the total thickness minus the clear cover and half the diameter of the main bar.',
    'Check for two-way vs one-way slab conditions, as it drastically changes reinforcement detailing.'
  ],
  'beam-design': [
    'Provide top extra reinforcement over supports (columns) to resist negative bending moments.',
    'Shear stirrups should be spaced closer near the supports where shear force is maximum.'
  ],
  'column-design': [
    'Minimum longitudinal steel in a column should not be less than 0.8% of the gross cross-sectional area.',
    'Lateral ties spacing should not exceed the least lateral dimension of the column or 16 times main bar diameter.'
  ],
  'isolated-footing': [
    'Clear cover for footing reinforcement is typically higher (50mm to 75mm) due to direct soil contact.',
    'Check both one-way shear and two-way (punching) shear for safe footing design.'
  ],
  'raft-foundation': [
    'Rafts are suitable when the allowable soil bearing capacity is low or column loads are heavy.',
    'Ensure continuous reinforcement without splicing at high stress zones.'
  ],
  'pile-foundation': [
    'Pile capacity derives from both end-bearing and skin friction; understand the soil profile to distribute these.',
    'Pile spacing should generally be at least 2.5 times the pile diameter.'
  ],
  'retaining-wall': [
    'Provide adequate weep holes at regular intervals to prevent water pressure buildup behind the wall.',
    'The base width is usually taken as 0.4 to 0.6 times the total height of the retaining wall.'
  ],
  'staircase-design-reference': [
    'The sum of one tread and two risers should ideally remain between 600mm and 640mm for standard ergonomics.',
    'Minimum clear width for residential stairs is generally 900mm.'
  ],
  'prestressed-concrete': [
    'High strength concrete (minimum M40) and high tensile steel are mandatory to account for prestress losses.',
    'Profile the tendons to mimic the bending moment diagram to optimally balance external loads.'
  ],
  'bbs-generator': [
    'Deduct for bends according to the code (e.g., 2d for 90-degree bend) to get accurate cutting lengths.',
    'Standard hook length for an open link or stirrup is usually taken as 10d.'
  ],
  'metal-weight': [
    'The standard weight of steel reinforcement is derived using the formula: (D^2 / 162.28) kg/m.',
    'Always verify the unit weight from manufacturer testing if using specialized alloys.'
  ],
  'mix-design': [
    'Bulking of sand due to moisture can increase its volume by up to 30%, which must be adjusted in nominal mixes.',
    'Ensure water-cement ratio is strictly maintained for achieving targeted strength and durability.'
  ],
  'brick-calculator': [
    'Add 10mm to the nominal size of the brick to account for the mortar joint when calculating numbers.',
    'Dry volume of mortar is approximately 33% more than wet volume.'
  ],
  'formwork': [
    'Formwork for vertical structures (columns, walls) can usually be stripped earlier (16-24 hrs) than for slabs or beams.',
    'Use standard multipliers depending on the surface area to estimate centering materials.'
  ],
  'plywood-estimator': [
    'Match the grade to the job: Commercial for dry indoor panelling, BWR (boiling-water resistant) for kitchens and bathrooms, Marine for constant wet exposure, and Shuttering / film-faced (HDO/MDO) for formwork. Grade labels the order only — it does not change the sheet count, so enter the rate for your grade.',
    'The standard sheet is 2.44 × 1.22 m (8 × 4 ft); the smaller 1.83 × 0.91 m (6 × 3 ft) sheet suits small panels. Thickness defaults to 18 mm (Standard). Start with 5% wastage for simple rectangular work and 10% for formwork, and raise it toward 15% for diagonal or complex cutting with many openings.',
    'For formwork, the reuse factor divides the sheets to buy — one set of sheets serves several pours (reuse 1–8). Check the face condition before each reuse; a damaged face means the sheet cannot be reused, whatever the factor says.'
  ],
  'earthworks': [
    'Account for the "swell factor" (typically 15-20%) when estimating the volume of excavated soil for hauling.',
    'For filling, use the "shrinkage factor" to ensure adequate material is ordered.'
  ],
  'road-pavement': [
    'Subgrade CBR (California Bearing Ratio) critically influences the total thickness of the pavement crust.',
    'Ensure proper camber (cross-slope) of 2-3% for effective surface drainage.',
    'Dowel bars are used for load transfer at transverse expansion or contraction joints.',
    'Tack coat application is essential between bituminous layers to ensure a monolithic bond.'
  ],
  'volume-estimator': [
    'Use the trapezoidal or Simpson’s rule for calculating volumes from irregular contours or cross-sections.',
    'Always convert all dimensions to a consistent unit (like meters) before multiplication.'
  ],
  'unit-converter': [
    'Remember that 1 cubic meter equals 35.3147 cubic feet; and 1 meter equals 3.28084 feet.',
    'When converting areas, square the conversion factor of lengths (e.g., 1 sq.m = 10.7639 sq.ft).'
  ],
  'master-sieve': [
    'Fineness modulus gives an idea of the average particle size; higher FM indicates coarser aggregates.',
    'A well-graded soil has a smooth, concave upward gradation curve.'
  ],
  'soil-mechanics-lab': [
    'Atterberg limits (Liquid and Plastic limits) define the consistency of cohesive soils and are critical for soil classification.',
    'Ensure undisturbed samples are used for determining natural moisture content and unit weight.'
  ],
  'cbr-test': [
    'CBR is typically evaluated at either 2.5mm or 5.0mm penetration; conventionally, the value at 2.5mm is higher.',
    'Soaking the sample for 4 days simulates the worst-case moisture condition of the subgrade.'
  ],
  'direct-shear': [
    'Cohesion (c) and angle of internal friction (phi) are the primary shear strength parameters derived from this test.',
    'The test limits the failure plane to horizontal, which might not mimic real-field failure.'
  ],
  'rates': [
    'Add contractor’s profit and overheads (usually 15-20%) after computing the total cost of materials and labor.',
    'Consider local material availability and transport leads when fixing unit rates.'
  ],
  'cost-summary': [
    'Break down costs into Substructure, Superstructure, and Finishes to monitor budget health during project life.',
    'Track material escalations regularly and maintain a 5-10% contingency buffer.'
  ]
};

// Per-category fallback: tools without a per-tool entry get tips for
// their Dashboard category instead of the same 3 generic lines.
const CATEGORY_TIPS: Record<string, string[]> = {
  'Structural & Concrete Geometry': [
    'Effective depth d = total thickness − (clear cover + bar diameter ÷ 2). Never size reinforcement from the gross thickness.',
    'Convert wet concrete volume to dry volume with the 1.54 factor before breaking it into cement, sand and aggregate.',
    'Steel weight is d² ÷ 162.28 kg per metre — verify bar diameters on site before ordering.'
  ],
  'Quantity Takeoff & Costing': [
    'Deduct openings from wall and plaster areas; openings under 0.5 sq.m are usually ignored by standard codes.',
    'Keep a 5-10% contingency on quantities for wastage, rework and site variation — and show it as its own line, not hidden in the rates.',
    'Cross-check every rate against a current supplier quote; a rate table is a snapshot, not a price.'
  ],
  'Masonry, Surfaces & Finishes': [
    'Add 10 mm to the nominal brick size for the mortar joint, and multiply wet mortar volume by 1.33 for dry volume.',
    'Allow about 5% wastage on tiles and marble and 2-3% on paint; cut pieces around openings are where the waste happens.',
    'Measure finishes room by room and deduct door and window openings before ordering.'
  ],
  'Infrastructure & Highway Engineering': [
    'Subgrade CBR drives the pavement crust thickness — a weak subgrade needs a thicker crust, not a stronger wearing course.',
    'Keep a 2-3% camber for surface drainage and check it after every layer, not only at the top.',
    'Compaction is what makes the design thickness real: verify density layer by layer.'
  ],
  'MEP, Energy & Landscaping': [
    'Size water tanks and solar systems from actual daily demand, not from rule-of-thumb per-room figures.',
    'Keep a record of the design inputs (loads, heads, flow rates) — a service estimate without its inputs cannot be checked.',
    'Allow for access and maintenance clearances around plant and tanks; a system you cannot reach cannot be serviced.'
  ],
  'Geotechnical & Soil Lab Suite': [
    'Test undisturbed samples for moisture content and unit weight — remoulded samples give different answers.',
    'Report Atterberg limits with the test method; the same soil can read differently under different standards.',
    'Soak CBR samples for 4 days to simulate the worst-case moisture condition of the subgrade.'
  ]
};

const DEFAULT_TIPS = [
  'Always cross-verify estimations with local supplier codes and conditions.',
  'Accurate site measurements are the foundation of any reliable estimation.',
  'Ensure adequate waste factors (usually 2-5%) are applied to materials.'
];

export function ProTipsWidget({ moduleId }: { moduleId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Resolution: per-tool tips → per-category tips → generic defaults.
  // Previously 60 of 76 tools fell through to the same 3 DEFAULT_TIPS.
  const moduleDef = ALL_MODULES.find((m) => m.id === moduleId);
  const tips =
    TIPS_DATABASE[moduleId] ||
    (moduleDef ? CATEGORY_TIPS[moduleDef.category] : undefined) ||
    DEFAULT_TIPS;

  return (
    <div className="w-full overflow-hidden bg-accent-50 rounded-[16px] border border-accent-200 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-surface-hover/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-[10px] bg-accent-500 flex items-center justify-center shrink-0" aria-hidden="true">
            <Lightbulb className="w-5 h-5 text-white" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-[15px] text-txt-primary leading-tight">Engineering Pro Tips</span>
            <span className="block text-sm text-accent-800 font-medium mt-0.5">Best practices &amp; principles for this calculation</span>
          </span>
        </div>
        <ChevronDown className={`w-[18px] h-[18px] shrink-0 ml-4 text-txt-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-700' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-4 border-t border-accent-200">
          <ul className="space-y-4">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex gap-3 text-txt-primary text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-surface-default border border-accent-200 flex items-center justify-center font-bold text-xs mt-0.5 text-accent-800">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
