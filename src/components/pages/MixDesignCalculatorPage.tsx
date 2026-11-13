/**
 * Concrete Mix Design page — CalculatorPageShell pattern (brick page).
 * H1, meta, FAQ JSON-LD, HowTo, BreadcrumbList, hreflang, 1,200+ words
 * of original content, worked M25 example, tables, trial-mix disclaimer.
 */
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import CalculatorPageShell from "../../seo/CalculatorPageShell";
import { SITE_URL, ORGANIZATION_JSON_LD } from "../../seo/siteConfig";
import MixDesignCalculator from "../calculators/MixDesignCalculator";
import { MIX_DESIGN_FAQS, DURABILITY, WATER_TABLE_IS, CA_FRACTION_IS } from "../../lib/mixDesignCalc";

const TITLE = "Concrete Mix Design Calculator (IS 10262:2019) | Civil Estimation Pro";
const DESCRIPTION =
  "Design concrete mixes to IS 10262:2019 and ACI 211.1. Target strength, w/c ratio, cement, sand, aggregate and water per m³, batch weights for 0.5 m³ and 1 m³, and cost in PKR, INR, AED or USD.";
const KEYWORDS = [
  "concrete mix design calculator",
  "IS 10262 mix design",
  "ACI 211 mix design",
  "target mean strength",
  "water cement ratio calculator",
  "M25 mix design",
  "cement bags per cubic metre",
  "concrete mix ratio",
];
const LAST_UPDATED = "November 2026";

const RELATED = [
  { id: "calculators", title: "Construction Material Calculator", desc: "Nominal-mix concrete, bricks, blocks, plaster and steel in one place." },
  { id: "master-rcc", title: "Master RCC Estimator", desc: "Concrete, steel and formwork for slabs, beams, columns and staircases." },
  { id: "aggregate-tests", title: "Aggregate Tests Calculator", desc: "Impact, crushing, abrasion, water absorption and specific gravity (IS 2386)." },
  { id: "formwork", title: "Formwork & Shuttering Calculator", desc: "Plywood, battens, props and shuttering area for columns, beams and slabs." },
];

function buildJsonLd() {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Concrete Mix Design Calculator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/mix-design`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "IS 10262:2019 and ACI 211.1 methods sharing one absolute-volume engine",
      "Target strength, water content, governing w/c and cement per m³",
      "Fine and coarse aggregate by absolute volume with Table 5 split",
      "Batch weights for 0.5 m³ and 1 m³ with SSD moisture correction",
      "Cost in PKR, INR, AED or USD with editable rates",
    ],
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: MIX_DESIGN_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to design a concrete mix (IS 10262:2019)",
    step: [
      { "@type": "HowToStep", name: "Target strength", text: "Calculate f'ck = fck + 1.65 x SD using the standard deviation for the grade." },
      { "@type": "HowToStep", name: "Water content", text: "Read the water content from IS 10262 Table 4 for the aggregate size and type, then correct for slump." },
      { "@type": "HowToStep", name: "Water-cement ratio", text: "Take the lower of the strength w/c (Fig. 1) and the durability maximum (IS 456 Table 5)." },
      { "@type": "HowToStep", name: "Cement content", text: "Cement = water / w/c; raise to the Table 5 minimum if lower, and never exceed 450 kg/m3." },
      { "@type": "HowToStep", name: "Aggregate split", text: "Find the aggregate volume by absolute volume, then split it by the IS 10262 Table 5 coarse-aggregate fraction." },
      { "@type": "HowToStep", name: "Batch weights", text: "Scale the per-m3 masses to the batch size and correct for aggregate moisture (SSD basis)." },
      { "@type": "HowToStep", name: "Trial mixes", text: "Confirm the design with three trial batches of at least 0.5 m3, tested at 7 and 28 days (IS 10262 Cl 5.8)." },
    ],
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Calculators", item: `${SITE_URL}/calculators` },
      { "@type": "ListItem", position: 3, name: "Concrete Mix Design Calculator" },
    ],
  };
  return [webApp, faqPage, howTo, breadcrumb, ORGANIZATION_JSON_LD];
}

const HREFLANG = [
  { lang: "en-PK", href: `${SITE_URL}/mix-design` },
  { lang: "en-IN", href: `${SITE_URL}/mix-design` },
  { lang: "en-AE", href: `${SITE_URL}/mix-design` },
  { lang: "x-default", href: `${SITE_URL}/mix-design` },
];

export default function MixDesignCalculatorPage() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <CalculatorPageShell
      title={TITLE}
      description={DESCRIPTION}
      canonical={`${SITE_URL}/mix-design`}
      keywords={KEYWORDS}
      hreflang={HREFLANG}
      jsonLd={buildJsonLd()}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calculators" },
        { label: "Concrete Mix Design Calculator" },
      ]}
      h1="Concrete Mix Design Calculator — IS 10262:2019 & ACI 211.1 (M10–M60)"
      intro="Design a concrete mix for a target strength instead of guessing a ratio. Pick a grade and exposure, and the calculator works out the target strength, the water content, the governing water-cement ratio, the cement, sand and aggregate per cubic metre, the mix ratio by mass, and the batch weights for 0.5 m³ and 1 m³ — with cost in PKR, INR, AED or USD."
      related={RELATED}
      lastUpdated={LAST_UPDATED}
    >
      <MixDesignCalculator />

      <div className="mt-14 space-y-10 text-txt-secondary leading-relaxed max-w-3xl">
        <section aria-labelledby="md-how">
          <h2 id="md-how" className="text-2xl font-bold text-txt-primary mb-3">How mix design works — five steps, with the clause for each</h2>
          <p className="mb-3">
            A design mix is not a recipe copied from another site. It is a calculation that starts from the strength you
            must achieve and works backwards to the quantities of cement, water, fine aggregate and coarse aggregate that
            will achieve it, under the durability rules for the exposure the concrete will face. The Indian standard for
            this is IS 10262:2019; the American method is ACI 211.1. Both use the same idea — the absolute volume method —
            and this calculator runs both from one engine, so you can compare them directly.
          </p>
          <p className="mb-3">
            <strong className="text-txt-primary">Step 1 — target strength.</strong> Concrete strength varies from batch
            to batch, so you do not design for the specified grade itself. You design for the target mean strength,
            f&prime;ck = fck + 1.65 × SD, where SD is the standard deviation of the plant (IS 10262 Cl 5.2). The 1.65
            factor covers 5% defectives: only one test in twenty may fall below the grade. For M25 with SD 4.0 MPa the
            target is 31.6 MPa.
          </p>
          <p className="mb-3">
            <strong className="text-txt-primary">Step 2 — water content.</strong> Water is read from IS 10262 Table 4
            for the maximum aggregate size and the aggregate type, for a 25–50 mm slump, then corrected by +3% for every
            25 mm of slump above 50 mm. A superplasticiser reduces the water further. Water is the most sensitive input
            in the whole design: every extra litre added on site to make the concrete easier to place lowers the strength.
          </p>
          <p className="mb-3">
            <strong className="text-txt-primary">Step 3 — water-cement ratio.</strong> Two limits are calculated and the
            lower one governs: the w/c that gives the target strength (IS 10262 Fig. 1) and the durability maximum for
            the exposure (IS 456 Table 5). For M25 in Moderate exposure both happen to be 0.50; in Severe exposure the
            durability limit of 0.45 governs instead.
          </p>
          <p className="mb-3">
            <strong className="text-txt-primary">Step 4 — cement and aggregates.</strong> Cement is water divided by
            w/c. If that is below the Table 5 minimum cement content, cement is raised to the minimum and the actual w/c
            drops — the calculator tells you when this happens. The aggregate volume is then whatever is left of one cubic
            metre after the cement, water, entrapped air and admixture volumes are subtracted, split between fine and
            coarse aggregate by IS 10262 Table 5.
          </p>
          <p>
            <strong className="text-txt-primary">Step 5 — batch weights and trial mixes.</strong> The per-cubic-metre
            masses are scaled to the batch size and corrected for the moisture in the aggregates (SSD basis). Then the mix
            must be confirmed by trial batches — IS 10262 Cl 5.8 requires three batches of at least 0.5 m³, tested at 7
            and 28 days — and production acceptance follows IS 456 Cl 16 / Table 11.
          </p>
        </section>

        <section aria-labelledby="md-tables">
          <h2 id="md-tables" className="text-2xl font-bold text-txt-primary mb-3">The tables the calculator uses</h2>
          <h3 className="text-lg font-bold text-txt-primary mt-4 mb-2">Standard deviation (IS 10262 Table 2 / IS 456 Table 8)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle rounded-2xl overflow-hidden">
              <thead><tr className="bg-surface-hover text-left"><th className="p-2">Grade</th><th className="p-2">SD (MPa)</th></tr></thead>
              <tbody>
                <tr className="border-t border-ui-borderSubtle"><td className="p-2">M10, M15</td><td className="p-2">3.5</td></tr>
                <tr className="border-t border-ui-borderSubtle"><td className="p-2">M20, M25</td><td className="p-2">4.0</td></tr>
                <tr className="border-t border-ui-borderSubtle"><td className="p-2">M30 and above</td><td className="p-2">5.0</td></tr>
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-bold text-txt-primary mt-4 mb-2">Water content (IS 10262 Table 4, 25–50 mm slump)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle rounded-2xl overflow-hidden">
              <thead><tr className="bg-surface-hover text-left"><th className="p-2">Aggregate</th><th className="p-2">10 mm</th><th className="p-2">20 mm</th><th className="p-2">40 mm</th></tr></thead>
              <tbody>
                <tr className="border-t border-ui-borderSubtle"><td className="p-2">Angular crushed</td><td className="p-2">{WATER_TABLE_IS.angular[10]} kg/m³</td><td className="p-2">{WATER_TABLE_IS.angular[20]} kg/m³</td><td className="p-2">{WATER_TABLE_IS.angular[40]} kg/m³</td></tr>
                <tr className="border-t border-ui-borderSubtle"><td className="p-2">Rounded gravel</td><td className="p-2">{WATER_TABLE_IS.rounded[10]} kg/m³</td><td className="p-2">{WATER_TABLE_IS.rounded[20]} kg/m³</td><td className="p-2">{WATER_TABLE_IS.rounded[40]} kg/m³</td></tr>
              </tbody>
            </table>
          </div>
          <h3 className="text-lg font-bold text-txt-primary mt-4 mb-2">Durability (IS 456 Table 5)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle rounded-2xl overflow-hidden">
              <thead><tr className="bg-surface-hover text-left"><th className="p-2">Exposure</th><th className="p-2">Min cement</th><th className="p-2">Max w/c</th><th className="p-2">Min grade</th></tr></thead>
              <tbody>
                {(Object.keys(DURABILITY) as Array<keyof typeof DURABILITY>).map((k) => (
                  <tr key={k} className="border-t border-ui-borderSubtle"><td className="p-2">{k}</td><td className="p-2">{DURABILITY[k].minCementKg} kg/m³</td><td className="p-2">{DURABILITY[k].maxWc.toFixed(2)}</td><td className="p-2">M{DURABILITY[k].minGrade}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-2">Maximum cement content is 450 kg/m³ (excluding fly ash / GGBS). The IS 10262 Table 5 coarse-aggregate fractions used here (20 mm Zone II = 0.62 at w/c 0.50) should be verified against a BIS controlled copy before release.</p>
          <h3 className="text-lg font-bold text-txt-primary mt-4 mb-2">Coarse-aggregate fraction of total aggregate (IS 10262 Table 5, w/c 0.50)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle rounded-2xl overflow-hidden">
              <thead><tr className="bg-surface-hover text-left"><th className="p-2">Size</th><th className="p-2">Zone I</th><th className="p-2">Zone II</th><th className="p-2">Zone III</th><th className="p-2">Zone IV</th></tr></thead>
              <tbody>
                {([10, 20, 40] as const).map((s) => (
                  <tr key={s} className="border-t border-ui-borderSubtle"><td className="p-2">{s} mm</td><td className="p-2">{CA_FRACTION_IS[s].I.toFixed(2)}</td><td className="p-2">{CA_FRACTION_IS[s].II.toFixed(2)}</td><td className="p-2">{CA_FRACTION_IS[s].III.toFixed(2)}</td><td className="p-2">{CA_FRACTION_IS[s].IV.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-2">Adjust +0.01 per 0.05 decrease in w/c, −0.01 per 0.05 increase; pumped concrete −10% relative.</p>
        </section>

        <section aria-labelledby="md-worked">
          <h2 id="md-worked" className="text-2xl font-bold text-txt-primary mb-3">Worked example — M25, Moderate exposure (the default above)</h2>
          <p className="mb-3">
            Inputs: M25, SD 4.0 MPa, Moderate exposure, 20 mm angular crushed aggregate, 50 mm slump, OPC (SG 3.15),
            fine aggregate SG 2.65 Zone II, coarse aggregate SG 2.70, no admixture, no moisture.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Target strength f&prime;ck = 25 + 1.65 × 4.0 = <strong className="text-txt-primary">31.6 MPa</strong>.</li>
            <li>Water = <strong className="text-txt-primary">186 L/m³</strong> (Table 4, 20 mm angular, 25–50 mm slump; no slump correction at 50 mm).</li>
            <li>Strength w/c for 31.6 MPa = 0.50; durability max (Moderate) = 0.50, so the governing w/c is <strong className="text-txt-primary">0.50</strong>.</li>
            <li>Cement = 186 ÷ 0.50 = <strong className="text-txt-primary">372 kg/m³</strong> — above the 300 kg/m³ minimum and below the 450 kg/m³ maximum. Bags exact = 372 ÷ 50 = 7.44, so order <strong className="text-txt-primary">8 bags/m³</strong>.</li>
            <li>Absolute volumes: V<sub>cem</sub> = 372 ÷ 3150 = 0.1181 m³; V<sub>water</sub> = 0.1860 m³; V<sub>air</sub> = 0.0150 m³; V<sub>agg</sub> = 1 − 0.1181 − 0.1860 − 0.0150 = <strong className="text-txt-primary">0.6809 m³</strong>.</li>
            <li>Table 5, 20 mm Zone II at w/c 0.50: coarse aggregate fraction 0.62, fine 0.38. Fine aggregate = 0.6809 × 0.38 × 2650 = <strong className="text-txt-primary">686 kg/m³</strong>; coarse aggregate = 0.6809 × 0.62 × 2700 = <strong className="text-txt-primary">1,140 kg/m³</strong>.</li>
            <li>Ratio by mass = <strong className="text-txt-primary">1 : 1.84 : 3.06 : 0.50</strong>. Fresh density = 372 + 186 + 686 + 1,140 = <strong className="text-txt-primary">2,384 kg/m³</strong>, inside the normal 2,300–2,500 band.</li>
            <li>Batch 0.5 m³: cement 186 kg (4 bags), water 93 L, fine aggregate 343 kg, coarse aggregate 570 kg.</li>
          </ol>
          <p className="mt-3">
            At 75 mm slump the water rises to 192 L (186 × 1.03), cement to 384 kg, fine aggregate to 676 kg and coarse
            aggregate to about 1,123 kg. The ACI cross-check for the same M25 (f&prime;c 25 MPa, no SD, slump 75–100 mm,
            19 mm aggregate) gives f&prime;cr = 33.3 MPa, water 205 L, w/c 0.49, cement 418 kg, coarse aggregate 1,024 kg
            and fine aggregate 697 kg — a ratio of 1 : 1.67 : 2.45 : 0.49.
          </p>
        </section>

        <section aria-labelledby="md-nominal">
          <h2 id="md-nominal" className="text-2xl font-bold text-txt-primary mb-3">Nominal mix vs design mix — why 1:2:4 is not 1:1.84:3.06</h2>
          <p className="mb-3">
            A nominal mix such as 1:2:4 (M15) or 1:1.5:3 (M20) is a fixed proportion by volume from IS 456 Table 9, and it
            is permitted only up to grade M20. A design mix ratio such as 1 : 1.84 : 3.06 : 0.50 is a proportion by mass,
            calculated for a specific target strength, aggregate and exposure. The two are not interchangeable: the same
            numbers mean different things, and a nominal mix gives no guarantee about the strength you will actually get.
            For M25 and above — or for Severe, Very severe or Extreme exposure — a design mix is required. The material
            calculator on this site labels its mixes as nominal and links here for higher grades.
          </p>
          <p>
            The practical difference shows up in the cement: a nominal M20 uses about 8.07 bags per cubic metre, while
            the design M25 above uses 7.44 bags exact — less cement, but placed with a controlled water content and a
            known aggregate split, so the strength is designed in rather than hoped for.
          </p>
        </section>

        <section aria-labelledby="md-mistakes">
          <h2 id="md-mistakes" className="text-2xl font-bold text-txt-primary mb-3">Common mistakes</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-txt-primary">Borrowing a mix from another site.</strong> A mix designed for one aggregate, one cement and one exposure does not transfer. Re-run the design for your materials.</li>
            <li><strong className="text-txt-primary">Adding water on site.</strong> Extra water for workability raises the w/c and lowers strength and durability. If the mix is stiff, use a superplasticiser or redesign the slump — do not add water.</li>
            <li><strong className="text-txt-primary">Ignoring aggregate moisture.</strong> Wet sand can carry 5% free water or more. Without the SSD correction the batch water is too high by tens of litres per cubic metre.</li>
            <li><strong className="text-txt-primary">Dosing admixture on the wrong basis.</strong> Superplasticiser dose is a percentage of cement mass, and its water reduction changes the batch water, not the w/c.</li>
            <li><strong className="text-txt-primary">Skipping trial mixes.</strong> The calculation is a starting point. Three trial batches of at least 0.5 m³, tested at 7 and 28 days, are what turn it into a mix you can pour.</li>
            <li><strong className="text-txt-primary">Using the wrong w/c table in ACI.</strong> The ACI w/c table is keyed to the required average strength f&prime;cr, not to the specified f&prime;c. Entering f&prime;c directly gives w/c 0.61 and 336 kg of cement for an M25 — about 80 kg short of the correct 418 kg.</li>
          </ul>
        </section>

        <section aria-labelledby="md-faq">
          <h2 id="md-faq" className="text-2xl font-bold text-txt-primary mb-3">Frequently asked questions</h2>
          <div className="space-y-4">
            {MIX_DESIGN_FAQS.map((f) => (
              <div key={f.q} className="border border-ui-borderSubtle rounded-2xl p-4 bg-surface-default">
                <h3 className="font-bold text-txt-primary mb-1">{f.q}</h3>
                <p className="text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CalculatorPageShell>
  );
}
