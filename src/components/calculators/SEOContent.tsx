import React from 'react';

interface SEOContentProps {
  category: 'metal' | 'concrete' | 'house' | 'earthworks';
  data: any;
}

export function SEOContent({ category, data }: SEOContentProps) {
  const renderMetalContent = () => (
    <>
      <h2 className="mt-8 mb-4 text-xl font-semibold text-slate-900 tracking-tight">How to Calculate Weight for {data.diameter_mm}mm {data.profile}</h2>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        Accurate material calculation is critical for structural integrity, precise cost control, and preventing catastrophic load failures in reinforced concrete projects. When determining the mass of a <strong>{data.diameter_mm}mm</strong> {data.profile.toLowerCase()} spanning <strong>{data.length_m} meters</strong>, structural engineers and quantity surveyors rely on the universally accepted specific gravity of steel, which is standardized at 7850 kg/m³. This exact density ensures that our theoretical estimates closely match empirical weigh-bridge data upon material delivery from the steel rolling mills. Discrepancies between calculated theoretical weight and actual scale weight often indicate non-compliant or sub-standard rebars, making this programmatic calculation an essential quality control checkpoint on the construction site.
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        {data.profile === 'Round Bar' ? (
          <>The theoretical weight for circular rebars is derived essentially from the volumetric evaluation of a cylinder (Volume = π × r² × L). However, iterating through pi and radius conversions is time-consuming on the field. In practice, structural engineers use the simplified derivation <code>W = D² / 162.28</code> (often rounded to 162) for metric meters, or <code>W = D² / 533</code> for imperial lengths in feet. By substituting {data.diameter_mm}mm into this formula, we can quickly determine the unit weight per meter. Using this established standard alongside your specified <strong>{data.length_m} meters</strong> length, we deduce that the gross theoretical mass for your specified {data.diameter_mm}mm round bar is accurately projected at <strong>{data.weight_kg} kg</strong>. This metric allows estimating the exact tonnage required for a reinforced concrete design based on bending schedules.</>
        ) : data.profile === 'Square Bar' ? (
          <>For solid square sections, commonly used in heavy machinery, gates, and specific structural applications, the volumetric footprint is determined by multiplying the cross-sectional area (side × side) by the total length. Unlike round rebars, there is no circular constant reduction. By translating the <strong>{data.diameter_mm}mm</strong> dimension to meters (giving {(data.diameter_mm / 1000).toFixed(4)}m) and applying the constant 7850 kg/m³ density, we evaluate the dense material configuration. Thus, we arrive at the heavy-duty projection of <strong>{data.weight_kg} kg</strong>. Because of their continuous solid geometry, square bars inherently carry higher mass per meter compared to equivalent round bars, leading to different structural moment capacities.</>
        ) : (
          <>Hollow structural sections like the <strong>{data.diameter_mm}mm</strong> steel pipe require a more intricate derivation, calculating the total volume of the outer cylinder minus the inner empty core volume. Considering the exact wall thickness of <strong>{data.wall_thickness_mm}mm</strong>, the structural pipe balances high torsional stiffness with significantly less weight than a solid equivalent. The specific mass of the tubular geometry is calculated by finding the annular cross-sectional area and multiplying by the 7850 kg/m³ standard. Applying this, the total solid mass of steel evaluates to <strong>{data.weight_kg} kg</strong>. This is pivotal for scaffolding, railing, and hollow-section truss calculations where dead load minimization without compromising tensile strength is paramount.</>
        )}
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        Implementing these specific formulaic estimations systematically across a Bill of Quantities (BOQ) prevents under-ordering, which stalls project timelines, and over-ordering, which ties up critical working capital on site.
      </p>
    </>
  );

  const renderConcreteContent = () => (
    <>
      <h2 className="mt-8 mb-4 text-xl font-semibold text-slate-900 tracking-tight">How to Calculate Material for {data.volume_cft} CFT</h2>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        When pouring a <strong>{data.volume_cft} CFT</strong> structural element using an engineered <strong>{data.mix_ratio}</strong> nominal mix, absolute precision in your material takeoff is non-negotiable. Whether you are executing a monolithic raft foundation, a suspended RCC slab, or load-bearing columns, concrete mixture components must be batched with exact volumetric or weight-based proportions to attain the targeted compressive strength. Fresh concrete contains entrapped air and moisture. Therefore, the initial calculated wet volume must always be significantly escalated to a dry volumetric state before isolating individual solid ingredients.
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        In rigorous civil engineering practices, we apply the universally recognized dry volume multiplication factor of <strong>1.54</strong>. This factor accounts for the fact that dry materials—such as cement powder, fine river sand, and crushed stone aggregate—contain substantial void ratios (around 54% void space). When mixed with water, these materials consolidate, chemically hydrate, and shrink in bulk. This dictates that to yield a perfectly settled {data.volume_cft} CFT of wet concrete, you must procure a larger {(data.volume_cft * 1.54).toFixed(2)} CFT of un-mixed dry raw materials. 
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        Using the standardized ratio matrix for the specified {data.mix_ratio} mix, we dynamically derive the exact fractional requirement for ordinary portland cement, fine aggregates, and coarse aggregates. The final isolated cement volume is subsequently divided by 1.226 CFT (the typical volumetric footprint of a standard 50kg bag of cement), pinpointing your requirement at exactly <strong>{data.cement_bags_required} bags</strong>. This ensures that you have precisely quantified the binding core of the concrete matrix. Correspondingly, you will need exactly <strong>{data.sand_cft_required} CFT of fine sand</strong> and <strong>{data.aggregate_cft_required} CFT of coarse aggregate</strong> to achieve the optimal water-cement ratio and slump requirement on-site.
      </p>
    </>
  );

  const renderHouseContent = () => (
    <>
      <h2 className="mt-8 mb-4 text-xl font-semibold text-slate-900 tracking-tight">How to Calculate Grey Structure Cost for {data.plot_designation}</h2>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        When undertaking the construction of a <strong>{data.stories.toLowerCase()}-story {data.plot_designation}</strong> residential unit, establishing a resilient and highly accurate baseline financial projection for the grey structure is the most critical phase of project planning. The 'grey structure' entails the core structural perimeter and internal skeletal framework of the building. This includes deep excavations, foundation concrete, load-bearing masonry brickwork, steel reinforced columns, RCC suspended slabs, internal base plastering, and essential concealed electrical and plumbing conduits. It explicitly excludes cosmetic finishings like paint, tile work, light fixtures, and cabinetry.
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        The estimation model strictly utilizes the exact architectural covered area footprint of <strong>{data.covered_area_sqft} sq ft</strong>. By applying current labor wages alongside localized South Asian material tariffs—such as first-class kiln bricks, premium ordinary portland cement, graded river sand, and grade-60 deformed reinforcement steel—we mathematically synthesize a robust per-square-foot baseline rate of Rs. {data.grey_structure_rate_per_sqft}.
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        Multiplying the cumulative covered area by this standard index provides a robust financial projection tailored specifically for standard finish parameters. For your {data.plot_designation} {data.stories.toLowerCase()}-story residence covering {data.covered_area_sqft} sq ft, this programmatic financial buffer shields your working capital from unprecedented market inflations and supply chain delays, assuring that the superstructure is erected securely without sudden budget depletion.
      </p>
    </>
  );

  const renderEarthworksContent = () => (
    <>
      <h2 className="mt-8 mb-4 text-xl font-semibold text-slate-900 tracking-tight">How to Calculate Excavation Hauling using {data.calculation_method}</h2>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        Heavy earthmoving and trench excavation operations for a <strong>{data.length_ft}ft</strong> long foundational trench involve analyzing complex volumetric expansions and soil mechanics. Before excavation begins, the soil in the ground exists in a highly compressed and naturally consolidated state known as the 'bank volume'. Once mechanical excavators systematically break the soil matrix, it undergoes immediate decompression and significant aeration, drastically increasing its total bulk footprint—a critical geotechnical phenomenon measured by the specific swell factor.
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        Depending on the stratification and density of the earth, soil profiles like clay or gravel demand unique calculations. Here, we calculate the undisturbed bank volume via the mathematically rigorous <strong>{data.calculation_method}</strong> ({data.bank_volume_cft} CFT). We then strictly apply the designated <strong>{((data.swell_factor - 1) * 100).toFixed(0)}% swell factor</strong>. This operation proves that the original bank volume aggressively expands into a significantly larger loose volume metric of <strong>{data.loose_volume_cft.toFixed(2)} CFT</strong> once disturbed. 
      </p>
      <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
        To properly resource logistics and dispatch heavy machinery, we must divide this aerated loose volume by the standard regional dump truck capacity designated for this route (<strong>{data.truck_capacity_cft} CFT</strong> per dumper). As a direct result, site engineers and logistical coordinators must firmly lock in a total of <strong>{data.total_hauling_trips} hauling trips</strong> to completely clear the staging site. Accurate earthwork estimation prevents exorbitant machine idle times, controls fuel expenditure, and maintains rapid construction momentum across the critical path schedule.
      </p>
    </>
  );

  return (
    <article className="prose prose-indigo max-w-none text-slate-600 mt-8 font-sans">
      <h1 className="capitalize mb-2 border-b pb-4 text-xl font-semibold text-slate-800 tracking-tight mb-6">
        {data.target_keyword}
      </h1>
      
      {category === 'metal' && renderMetalContent()}
      {category === 'concrete' && renderConcreteContent()}
      {category === 'house' && renderHouseContent()}
      {category === 'earthworks' && renderEarthworksContent()}

      <h3 className="mt-8 mb-3 text-lg font-medium text-slate-800 mb-4">Standard Allowances and Wastage Factors</h3>
      <p>
        Regardless of the theoretical precision inherent in these mathematical models, practical site deployment always introduces uncontrollable environmental and operational variables. Cutting overlaps, transit spills, handling damages, and dimensional tolerances at the batching plant necessitate contingency buffers.
      </p>
      <p>
        It is a globally recognized protocol among Quantity Surveyors (QS) and project management professionals to introduce a blanket <strong>5% wastage factor</strong> to all raw material aggregates prior to submitting official procurement orders. This mandatory empirical allowance guarantees that your labor force will not encounter mid-pour material shortages, ultimately safeguarding the structural integrity of your elements from unwanted cold joints and logistical standstills.
      </p>
    </article>
  );
}
