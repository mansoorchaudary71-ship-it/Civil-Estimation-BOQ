import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BRICK_FAQS, formatInt } from "../../lib/brickCalc";
import {
  CITY_VARIANTS,
  HOUSE_SIZE_VARIANTS,
  type BrickVariant,
} from "../../seo/brickProgrammatic";
import { REVIEWER } from "../../seo/siteConfig";
import { ChevronDown } from "lucide-react";

export const BRICK_CONTENT_LAST_UPDATED = "10 November 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-12">
      <h2 id={`${id}-heading`} className="text-2xl font-bold text-txt-primary dark:text-white mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-relaxed text-txt-secondary dark:text-txt-tertiary">
        {children}
      </div>
    </section>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ui-borderSubtle dark:divide-ink-600 border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden bg-bg-card">
      {BRICK_FAQS.map((faq, i) => (
        <div key={faq.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-colors"
          >
            <span className="font-semibold text-txt-primary dark:text-white">{faq.q}</span>
            <ChevronDown
              className={`w-5 h-5 shrink-0 text-txt-tertiary transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-base leading-relaxed text-txt-secondary dark:text-txt-tertiary">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function BrickCalculatorContent({ variant }: { variant: BrickVariant }) {
  const isMain = variant.kind === "main";
  return (
    <div className="mt-14">
      <Section id="how-it-works" title="How the brick calculator works">
        <p>
          Enter the length and height of your wall, pick its thickness, and add any doors and
          windows. The calculator deducts the openings, works out the volume of brickwork, and
          divides it by the volume of one brick including its mortar joint. That gives the number
          of bricks before wastage; wastage is then added, and the mortar left over is split into
          cement bags and sand by your chosen mix ratio. Everything updates instantly as you type
          — there is no calculate button to press.
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong className="text-txt-primary dark:text-white">Measure the wall.</strong>{" "}
            Length × height gives the gross area. A 10 ft × 10 ft wall is 100 sq ft.
          </li>
          <li>
            <strong className="text-txt-primary dark:text-white">Deduct openings.</strong>{" "}
            Every door and window is subtracted — a 3 × 7 ft door removes 21 sq ft of brickwork.
          </li>
          <li>
            <strong className="text-txt-primary dark:text-white">Pick the brick and joint.</strong>{" "}
            A Pakistani Awwal brick is 9″ × 4½″ × 3″ with a 10 mm joint; Indian modular is
            190 × 90 × 90 mm; UAE clay brick is 215 × 102.5 × 65 mm.
          </li>
          <li>
            <strong className="text-txt-primary dark:text-white">Add wastage and read the cost.</strong>{" "}
            5% covers a normal rectangular wall; 10% covers kiln bricks or cut work. Enter your
            supplier's rates to see the material cost in PKR, INR or AED.
          </li>
        </ol>
        <p>
          The single most common mistake is estimating with the bare brick size instead of the
          nominal size — the brick plus one mortar joint. Using the bare size over-orders by
          roughly 15–20%. This calculator always uses the nominal (with-mortar) size.
        </p>
      </Section>

      <Section id="formula" title="Brick calculation formula">
        <p>
          The method below is the standard quantity-surveying method used by estimators in
          Pakistan, India and the Gulf. It is the same method behind the thumb rules quoted by
          every contractor — 9 bricks per square foot for a 9-inch wall, 13.5 bricks per cubic
          foot — except here every step is shown, so you can check it.
        </p>
        <div className="bg-surface-default border border-ui-borderSubtle dark:border-ink-600 rounded-2xl p-5 space-y-2 font-mono text-sm overflow-x-auto">
          <p>Wall volume = length × height × thickness</p>
          <p>Net wall area = gross area − openings area</p>
          <p>Brick with mortar = (length + joint) × (width + joint) × (height + joint)</p>
          <p>Bricks = wall volume ÷ brick-with-mortar volume</p>
          <p>Bricks to order = bricks × (1 + wastage %)</p>
          <p>Wet mortar = wall volume − (bricks × bare brick volume), × 1.15 for frog filling</p>
          <p>Dry mortar = wet mortar × 1.33</p>
          <p>Cement bags = (dry mortar × cement share) ÷ 0.0347 m³ per 50 kg bag</p>
          <p>Sand = dry mortar × sand share</p>
        </div>
        <p>
          The 1.33 factor converts wet mortar to dry volume — dry materials contain voids that
          shrink when water is added. The 1.15 frog allowance covers the mortar pressed into the
          frog (the dent on top of a brick). One 50 kg cement bag occupies 0.0347 cubic metres.
          Bags are always rounded up: you cannot buy part of a bag.
        </p>
      </Section>

      <Section id="worked-example" title="Worked example: a 10 ft × 10 ft wall">
        <p>
          Take a 10 ft × 10 ft external wall, 9 inches thick (230 mm), built with Pakistani
          Awwal bricks (230 × 110 × 75 mm), a 10 mm mortar joint, a 1:4 mix and 5% wastage. The
          wall face is 100 sq ft and the volume is 2.14 m³ (75.5 cubic feet). One brick with its
          joint occupies 0.00245 m³ (0.086 cubic feet), so the wall needs 2.14 ÷ 0.00245 ≈ 873
          bricks before wastage, and 873 × 1.05 ≈ 917 bricks to order. The wet mortar is about
          19.5 cubic feet; at a 1:4 mix that becomes 5 bags of cement and 21.8 cubic feet of
          sand, and at a 1:6 mix it is 4 bags of cement and 23.4 cubic feet of sand. Try it above
          — the calculator is pre-loaded with exactly this wall, and the numbers match.
        </p>
        <p>
          Now add a door. A standard 3 × 7 ft door removes 21 sq ft, leaving 79 sq ft of
          brickwork: about 690 bricks before wastage, or 725 to order. That one door saves
          roughly 190 bricks — which is why openings must be deducted instead of guessed.
        </p>
      </Section>

      <Section id="brick-sizes" title="Brick sizes and standards">
        <p>
          Brick sizes differ by country, and a calculator that assumes one size gives wrong
          answers everywhere else. These are the sizes this calculator uses, with their governing
          standards.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-surface-default text-left">
                <th className="px-4 py-3 font-semibold">Brick</th>
                <th className="px-4 py-3 font-semibold">Size (mm)</th>
                <th className="px-4 py-3 font-semibold">Standard</th>
                <th className="px-4 py-3 font-semibold">Used in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-borderSubtle dark:divide-ink-600">
              <tr>
                <td className="px-4 py-3">Pakistani Awwal</td>
                <td className="px-4 py-3">230 × 110 × 75</td>
                <td className="px-4 py-3">Pakistan kiln standard (nominal 9″ × 4½″ × 3″)</td>
                <td className="px-4 py-3">Pakistan</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Pakistani 2¾″ variant</td>
                <td className="px-4 py-3">230 × 114 × 70</td>
                <td className="px-4 py-3">FPS nominal 23 × 11.5 × 7.5 cm</td>
                <td className="px-4 py-3">Pakistan</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Indian modular</td>
                <td className="px-4 py-3">190 × 90 × 90</td>
                <td className="px-4 py-3">IS 1077</td>
                <td className="px-4 py-3">India</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Indian non-modular</td>
                <td className="px-4 py-3">230 × 110 × 70</td>
                <td className="px-4 py-3">IS 1077</td>
                <td className="px-4 py-3">India</td>
              </tr>
              <tr>
                <td className="px-4 py-3">UAE clay brick</td>
                <td className="px-4 py-3">215 × 102.5 × 65</td>
                <td className="px-4 py-3">BS EN 771-1</td>
                <td className="px-4 py-3">UAE, Gulf</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Kiln bricks vary — a "9-inch" brick from one kiln can be 5 mm shorter than the same
          brick from another. If your bricks measure differently, use the custom size option and
          enter the real dimensions; the difference over a whole house is thousands of bricks.
        </p>
      </Section>

      <Section id="mortar-mix" title="Mortar mix and wall thickness">
        <p>
          The right mix depends on what the wall carries. Use 1:3 (one part cement to three
          parts sand) for load-bearing walls and foundations, 1:4 for general brickwork — the
          standard for most house walls — and 1:6 for partition walls and other non-load-bearing
          work. A richer mix is stronger but costs more and shrinks more; a leaner mix than 1:6
          is too weak for structural brickwork.
        </p>
        <p>
          Thickness follows the same logic. A 4½-inch (115 mm) single-brick wall suits internal
          partitions. A 9-inch (230 mm) double-brick wall is the standard for external and
          load-bearing walls. A 13½-inch (345 mm) wall is used for foundations and heavy
          load-bearing work. With the standard 230 × 110 × 75 mm brick and a 10 mm joint, the
          exact figures are about 4.4 bricks per square foot for a 4½-inch wall, 8.7 per square
          foot for a 9-inch wall and about 13.1 per square foot for a 13½-inch wall, before
          wastage. The commonly quoted rules — 4.5, 9 and 13.6 — round those up slightly, which
          is safe; the calculator uses the exact figure for your brick size.
        </p>
      </Section>

      <Section id="brick-types" title="Brick types compared">
        <p>
          Not all bricks are equal, and the cheapest brick per piece is not always the cheapest
          wall. Awwal bricks are uniform and strong, so they lay faster with less mortar and less
          breakage. Doam bricks are cheaper but irregular, so they need more mortar and a higher
          wastage allowance. Machine-made bricks are the most uniform of all. Fly ash bricks are
          uniform, strong and cheap where they are made — and in Delhi NCR they are often the
          only practical choice, because red-brick kilns are restricted in green zones.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-surface-default text-left">
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Indicative price / 1,000</th>
                <th className="px-4 py-3 font-semibold">Best for</th>
                <th className="px-4 py-3 font-semibold">Wastage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-borderSubtle dark:divide-ink-600">
              <tr>
                <td className="px-4 py-3 font-semibold">Awwal (first-class)</td>
                <td className="px-4 py-3">PKR 16,500–23,000</td>
                <td className="px-4 py-3">Load-bearing, external, foundations</td>
                <td className="px-4 py-3">5%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Doam (second-class)</td>
                <td className="px-4 py-3">PKR 12,000–17,000</td>
                <td className="px-4 py-3">Internal partitions only</td>
                <td className="px-4 py-3">10%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Machine-made</td>
                <td className="px-4 py-3">PKR 24,000–26,500</td>
                <td className="px-4 py-3">Exposed and precision work</td>
                <td className="px-4 py-3">5%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Fly ash</td>
                <td className="px-4 py-3">PKR 14,000–22,000 · India ₹4–8/pc</td>
                <td className="px-4 py-3">Budget houses, India NCR</td>
                <td className="px-4 py-3">5%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          Prices are indicative November 2026 ranges, not quotes. See the city pages for
          city-wise rates.
        </p>
      </Section>

      {(isMain || variant.kind === "city") && (
        <Section id="city-rates" title="Brick rates by city (November 2026)">
          <p>
            Brick rates are local: they depend on the nearest kilns, transport, season and order
            size. The figures below are indicative — the Pakistan figures are the Pakistan Bureau
            of Statistics August 2026 city survey for first-class bricks, and the India and UAE
            figures are published market guides from November 2026. Always confirm with your
            supplier before ordering; the calculator lets you overwrite any rate.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-surface-default text-left">
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Awwal / red clay (per 1,000)</th>
                  <th className="px-4 py-3 font-semibold">Cement (50 kg bag)</th>
                  <th className="px-4 py-3 font-semibold">Sand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-borderSubtle dark:divide-ink-600">
                {CITY_VARIANTS.map((c) => (
                  <tr key={c.slug}>
                    <td className="px-4 py-3 font-semibold">
                      <Link to={`/brick-calculator/${c.slug}`} className="text-accent-800 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {c.brickPer1000 != null
                        ? `${c.currency === "PKR" ? "PKR" : c.currency === "INR" ? "₹" : "AED"} ${c.brickPer1000.toLocaleString("en-US")}`
                        : "Enter your supplier's rate"}
                    </td>
                    <td className="px-4 py-3">
                      {c.cementPerBag != null
                        ? `${c.currency === "PKR" ? "PKR" : c.currency === "INR" ? "₹" : "AED"} ${c.cementPerBag.toLocaleString("en-US")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.sandPerUnit != null
                        ? `${c.currency === "AED" ? "AED" : c.currency === "INR" ? "₹" : "PKR"} ${c.sandPerUnit} / ${c.currency === "AED" ? "m³" : "cft"}`
                        : "Enter your rate"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {variant.kind === "city" && (
            <>
              <p>
                <strong className="text-txt-primary dark:text-white">{variant.data.name} in detail. </strong>
                {variant.data.localNote}
              </p>
              <p className="text-sm">Rate source: {variant.data.rateSource}</p>
            </>
          )}
        </Section>
      )}

      {(isMain || variant.kind === "size") && (
        <Section id="house-sizes" title="Bricks by house size">
          <p>
            The table below is calculated with a stated method — double-storey house, 70%
            covered area per floor, external 9″ walls, internal 4½″ walls, a 7 ft boundary wall,
            parapet included, plus 5% wastage — so you can see exactly where the number comes
            from. Your design will differ; use the calculator with your own wall lengths for the
            final figure.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-ui-borderSubtle dark:border-ink-600 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-surface-default text-left">
                  <th className="px-4 py-3 font-semibold">House</th>
                  <th className="px-4 py-3 font-semibold">Plot</th>
                  <th className="px-4 py-3 font-semibold">External walls</th>
                  <th className="px-4 py-3 font-semibold">Internal walls</th>
                  <th className="px-4 py-3 font-semibold">Boundary wall</th>
                  <th className="px-4 py-3 font-semibold">Total (incl. 5%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-borderSubtle dark:divide-ink-600">
                {HOUSE_SIZE_VARIANTS.map((s) => (
                  <tr
                    key={s.slug}
                    className={
                      variant.kind === "size" && variant.data.slug === s.slug
                        ? "bg-accent-50 dark:bg-accent-900/20"
                        : undefined
                    }
                  >
                    <td className="px-4 py-3 font-semibold">
                      <Link to={`/brick-calculator/${s.slug}`} className="text-accent-800 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatInt(s.plotSqFt)} sq ft</td>
                    <td className="px-4 py-3">{formatInt(s.externalBricks)}</td>
                    <td className="px-4 py-3">{formatInt(s.internalBricks)}</td>
                    <td className="px-4 py-3">{formatInt(s.boundaryBricks)}</td>
                    <td className="px-4 py-3 font-semibold">{formatInt(s.totalBricks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {variant.kind === "size" && (
            <p>
              <strong className="text-txt-primary dark:text-white">Method for {variant.data.name}. </strong>
              {variant.data.method}
            </p>
          )}
        </Section>
      )}

      <Section id="glossary" title="Glossary">
        <dl className="space-y-3">
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">Awwal brick</dt>
            <dd>First-class burnt clay brick — uniform, well-burnt, low water absorption.</dd>
          </div>
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">Doam brick</dt>
            <dd>Second-class brick — slightly under-burnt or irregular; for non-load-bearing work.</dd>
          </div>
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">Nominal size</dt>
            <dd>The brick size plus one mortar joint — the size drawings and estimates use.</dd>
          </div>
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">Frog</dt>
            <dd>The dent pressed into the top face of a brick; it holds extra mortar and keys the courses together.</dd>
          </div>
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">English bond</dt>
            <dd>Courses alternating between stretchers (long face out) and headers (short face out) — the strongest common bond for 9-inch walls.</dd>
          </div>
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">Marla / Kanal</dt>
            <dd>Plot units in Pakistan: 1 marla = 225 sq ft (in Lahore/DHA convention), 1 kanal = 20 marla = 4,500 sq ft.</dd>
          </div>
          <div>
            <dt className="font-semibold text-txt-primary dark:text-white">Dry volume</dt>
            <dd>The volume of dry ingredients before water is added. Dry mortar volume is about 1.33× the wet volume.</dd>
          </div>
        </dl>
      </Section>

      <Section id="faq" title="Frequently asked questions">
        <FaqAccordion />
      </Section>

      <section aria-label="Sources and review" className="mt-12 border-t border-ui-borderSubtle dark:border-ink-600 pt-6 text-sm text-txt-tertiary space-y-2">
        <p>
          <strong className="text-txt-primary dark:text-white">Reviewed by:</strong>{" "}
          {REVIEWER.name} — {REVIEWER.role}. {REVIEWER.note}
        </p>
        <p>Last updated: {BRICK_CONTENT_LAST_UPDATED}.</p>
        <p>
          Sources: IS 1077 (Common Burnt Clay Building Bricks); BS EN 771-1; Pakistan Bureau of
          Statistics August 2026 city survey for first-class bricks; published November 2026
          market guides for cement, sand and brick rates in Pakistan, India and the UAE (see city
          pages for per-city sources). Rates are indicative and change frequently — confirm with
          your supplier.
        </p>
        <p>
          Disclaimer: this is a planning estimate based on the sizes and rates you enter. It is
          not a substitute for a professional BOQ certified by a licensed structural engineer or
          quantity surveyor.
        </p>
      </section>
    </div>
  );
}
