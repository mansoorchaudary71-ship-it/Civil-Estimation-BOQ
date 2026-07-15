import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const TIPS_DATABASE: Record<string, string[]> = {
  'quick-rough': [
    'For rapid estimates, always add a 10-15% contingency for unforeseen variations in site conditions.',
    'Built-up area is typically 1.2 to 1.3 times the carpet area, depending on the wall thickness and design.'
  ],
  'house': [
    'When estimating house construction, rule of thumb for steel is usually 3.5-4.5 kg per sq.ft of built-up area.',
    'Standard concrete consumption is roughly 0.035 to 0.040 cubic meters per sq.ft of built-up area.'
  ],
  'advanced-boq': [
    'Always align your BOQ heads with standard civil divisions (Substructure, Superstructure, Finishes) for clarity.',
    'Ensure clear segregation between material supply rates and labor installation rates.'
  ],
  'takeoff': [
    'Deduct openings like doors and windows accurately; small openings < 0.5 sq.m are usually ignored by standard codes.',
    'Keep your takeoff scale consistent and always verify it with a known dimension on the drawing.'
  ],
  'materials-master': [
    'Wastage for tiles/marble is typically 5%, while for paints it can be around 2-3%. Factor this into your final quantity.',
    'Cement consumption for standard blockwork (1:6 mix) is approximately 0.2 bags per sq.m.'
  ],
  'slab-estimator': [
    'The effective depth of a slab is the total thickness minus the clear cover and half the diameter of the main bar.',
    'Check for two-way vs one-way slab conditions, as it drastically changes reinforcement detailing.'
  ],
  'beam-calculator': [
    'Provide top extra reinforcement over supports (columns) to resist negative bending moments.',
    'Shear stirrups should be spaced closer near the supports where shear force is maximum.'
  ],
  'column-estimator': [
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
  'staircase-reference': [
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
  'concrete-mix': [
    'Bulking of sand due to moisture can increase its volume by up to 30%, which must be adjusted in nominal mixes.',
    'Ensure water-cement ratio is strictly maintained for achieving targeted strength and durability.'
  ],
  'brickwork': [
    'Add 10mm to the nominal size of the brick to account for the mortar joint when calculating numbers.',
    'Dry volume of mortar is approximately 33% more than wet volume.'
  ],
  'formwork': [
    'Formwork for vertical structures (columns, walls) can usually be stripped earlier (16-24 hrs) than for slabs or beams.',
    'Use standard multipliers depending on the surface area to estimate centering materials.'
  ],
  'earthworks': [
    'Account for the "swell factor" (typically 15-20%) when estimating the volume of excavated soil for hauling.',
    'For filling, use the "shrinkage factor" to ensure adequate material is ordered.'
  ],
  'road-pavement': [
    'Subgrade CBR (California Bearing Ratio) critically influences the total thickness of the pavement crust.',
    'Ensure proper camber (cross-slope) of 2-3% for effective surface drainage.'
  ],
  'rigid-pavement': [
    'Dowel bars are used for load transfer at transverse expansion or contraction joints.',
    'Provide a separation membrane (like thick polythene) between the dry lean concrete (DLC) and pavement quality concrete (PQC).'
  ],
  'asphalt-paving': [
    'Maintain laying temperatures strictly; cold mixtures cause rapid deterioration and poor compaction.',
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
  'sieve-analysis': [
    'Fineness modulus gives an idea of the average particle size; higher FM indicates coarser aggregates.',
    'A well-graded soil has a smooth, concave upward gradation curve.'
  ],
  'soil-lab-suite': [
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
  'rate-analysis': [
    'Add contractor’s profit and overheads (usually 15-20%) after computing the total cost of materials and labor.',
    'Consider local material availability and transport leads when fixing unit rates.'
  ],
  'construction-cost': [
    'Break down costs into Substructure, Superstructure, and Finishes to monitor budget health during project life.',
    'Track material escalations regularly and maintain a 5-10% contingency buffer.'
  ]
};

const DEFAULT_TIPS = [
  'Always cross-verify estimations with local supplier codes and conditions.',
  'Accurate site measurements are the foundation of any reliable estimation.',
  'Ensure adequate waste factors (usually 2-5%) are applied to materials.'
];

export function ProTipsWidget({ moduleId }: { moduleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const tips = TIPS_DATABASE[moduleId] || DEFAULT_TIPS;

  return (
    <div className="w-full overflow-hidden bg-white rounded-[32px] border border-slate-100 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
            style={{ color: 'var(--tool-theme-color, #4f46e5)' }}
          >
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 leading-none mb-1">Engineering Pro Tips</h3>
            <p className="text-sm text-slate-500 font-medium">Best practices & principles for this calculation</p>
          </div>
        </div>
        <div className="text-slate-400 shrink-0 ml-4">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
          <ul className="space-y-4">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex gap-3 text-slate-700 text-sm">
                <span 
                  className="shrink-0 w-6 h-6 rounded-full bg-slate-200/60 flex items-center justify-center font-bold text-xs mt-0.5"
                  style={{ color: 'var(--tool-theme-color, #4f46e5)' }}
                >
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
