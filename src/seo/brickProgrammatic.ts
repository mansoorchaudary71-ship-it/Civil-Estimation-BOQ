/**
 * Programmatic SEO data for the brick calculator.
 * Every rate is an INDICATIVE default (Nov 2026) with its source. Rates are
 * editable in the calculator UI. Nothing here is a live quote.
 *
 * Rate sources (checked 2026-11-10):
 *  PK brick/1000: Pakistan Bureau of Statistics, August 2026 city survey
 *    (first-class bricks), via ChakorVentures summary; kiln ranges via checkprice.pk.
 *  PK cement: PKR 1,500–1,650/bag retail, Nov 2026 (checkprice.pk, propertydealer.pk).
 *  PK sand: Ravi PKR 45–60/cft, Chenab PKR 60–75/cft (gharhub.com, 2026).
 *  IN brick: red clay ₹6–12/pc, metro ₹8–12 (houseyog.com); Delhi clay ₹11–13/pc
 *    (todaypricerates.com, Nov 2026); fly ash ₹4–8/pc (jkcement.com).
 *  IN cement: Delhi ₹340–395/bag, Mumbai ₹320–370/bag (todaypricerates.com, Nov 2026);
 *    OPC 53 Delhi ₹428–471, Mumbai ₹435–465 (infralens.in, Oct 2026).
 *  IN sand: Delhi river sand ₹78–90/cft, Mumbai ₹74–86/cft (todaypricerates.com).
 *  AE cement: OPC 43 AED 22–28/bag, OPC 53 AED 26–32/bag (yellowpages-uae.com).
 *  AE blocks: hollow block 4" AED 1.50–2.50, 6" AED 2.00–3.50, 8" AED 2.80–4.50;
 *    AAC AED 3.50–5.50 (fyind.com, woodenboxtrading.com, 2026).
 *  AE clay-brick per-1,000 price: NOT found in any source — UAE pages leave the
 *  brick price blank with a prompt, and show block rates as context.
 *  UK brick: facing bricks £400–900/1,000 (bestbuilders.co.uk Q3 2026;
 *    arcbuildingsupplies.com 2026); cement 25 kg £7.50–8.14/bag
 *    (Travis Perkins Blue Circle, Nov 2026); labour £400–700/1,000 laid.
 *  US brick: standard clay $350–850/1,000, avg $550 (Angi, Jul 2026;
 *    designestimation.com, Oct 2026); mason labour $1,500–2,000/1,000.
 *  UK sand (per m³) and US cement/sand prices: NOT verified — left blank.
 */
import type { Currency } from "../lib/brickCalc";

export interface CityVariant {
  slug: string;
  name: string;
  country: "Pakistan" | "India" | "UAE" | "UK" | "US";
  currency: Currency;
  brickPresetId: string;
  /** indicative price per 1,000 bricks; null = not verified, user enters it */
  brickPer1000: number | null;
  cementPerBag: number | null;
  /** per cft (PK/IN/US) or per m3 (AE/UK); null = not verified */
  sandPerUnit: number | null;
  /** standard cement bag size on this market (kg); null = calculator default */
  cementBagKg?: number | null;
  rateSource: string;
  rateDate: string;
  /** unique intro paragraph for this city's page */
  intro: string;
  /** unique local note */
  localNote: string;
  title: string;
  description: string;
}

export const CITY_VARIANTS: CityVariant[] = [
  {
    slug: "lahore",
    name: "Lahore",
    country: "Pakistan",
    currency: "PKR",
    brickPresetId: "pk-awwal",
    brickPer1000: 23355,
    cementPerBag: 1610,
    sandPerUnit: 50,
    rateSource:
      "Pakistan Bureau of Statistics, August 2026 city survey (first-class bricks); cement and sand from Lahore retail guides, November 2026.",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Lahore, first-class bricks run about PKR 23,355 per 1,000 (November 2026). Lahore has some of the lowest brick rates in Pakistan because Punjab has the most kilns. Kilns cluster around Raiwind, Manga Mandi and Multan Road, so transport is short and competition keeps prices down. The calculator below is pre-set with Lahore's indicative rates — enter your wall sizes and your kiln's actual rate to get a firm estimate.",
    localNote:
      "Most Lahore houses are built with Awwal bricks in 9-inch external walls and 4½-inch internal walls. A 5 marla plot in Lahore is 1,125 sq ft (25 × 45 ft) and a 10 marla plot is 2,250 sq ft — the plot-size table on this page uses those sizes.",
    title: "Brick Calculator Lahore — PKR Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for Lahore. Calculate bricks, cement bags, sand and total cost in PKR — with Lahore's indicative November 2026 rates (PBS survey).",
  },
  {
    slug: "karachi",
    name: "Karachi",
    country: "Pakistan",
    currency: "PKR",
    brickPresetId: "pk-awwal",
    brickPer1000: 22000,
    cementPerBag: 1640,
    sandPerUnit: 60,
    rateSource:
      "Pakistan Bureau of Statistics, August 2026 city survey (first-class bricks); cement and sand from Karachi retail guides, November 2026.",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Karachi, first-class bricks run about PKR 22,000 per 1,000 (November 2026). Karachi's brick rates run higher than Lahore's because bricks travel in from interior Sindh and Hub, and fuel and intra-city transport add to the price. Concrete blocks are also common for masonry in Karachi. The calculator below is pre-set with Karachi's indicative rates — replace them with your supplier's quote for an exact figure.",
    localNote:
      "In Karachi, check whether your supplier quotes per 1,000 bricks delivered or ex-kiln — delivery inside the city can add a meaningful amount. Blocks (4\"–8\" hollow) are a genuine alternative here and are priced per piece, not per 1,000.",
    title: "Brick Calculator Karachi — PKR Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for Karachi. Calculate bricks, cement bags, sand and total cost in PKR — with Karachi's indicative November 2026 rates (PBS survey).",
  },
  {
    slug: "islamabad",
    name: "Islamabad",
    country: "Pakistan",
    currency: "PKR",
    brickPresetId: "pk-awwal",
    brickPer1000: 27016,
    cementPerBag: 1620,
    sandPerUnit: 65,
    rateSource:
      "Pakistan Bureau of Statistics, August 2026 city survey (first-class bricks); cement and sand from Islamabad/Rawalpindi retail guides, November 2026.",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Islamabad, first-class bricks run about PKR 27,016 per 1,000 (November 2026). Islamabad records the highest first-class brick rates in the Pakistan Bureau of Statistics city survey — bricks come from kilns around Taxila and Gujar Khan, and demand from DHA, Bahria Town and Gulberg keeps prices firm. The calculator below is pre-set with Islamabad's indicative rates.",
    localNote:
      "Islamabad houses often use Awwal bricks for external 9-inch walls and Doam for internal work to save money. If your quote looks much lower than the survey figure, check the brick class — Awwal and Doam prices differ by several thousand rupees per 1,000.",
    title: "Brick Calculator Islamabad — PKR | Civil Estimation Pro",
    description:
      "Free brick calculator for Islamabad. Calculate bricks, cement bags, sand and total cost in PKR — with Islamabad's indicative November 2026 rates (PBS survey).",
  },
  {
    slug: "rawalpindi",
    name: "Rawalpindi",
    country: "Pakistan",
    currency: "PKR",
    brickPresetId: "pk-awwal",
    brickPer1000: 26694,
    cementPerBag: 1620,
    sandPerUnit: 60,
    rateSource:
      "Pakistan Bureau of Statistics, August 2026 city survey (first-class bricks); cement and sand from Rawalpindi retail guides, November 2026.",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Rawalpindi, first-class bricks run about PKR 26,694 per 1,000 (November 2026). Rawalpindi's brick market runs on the same Taxila and Gujar Khan kilns as Islamabad, so rates track Islamabad closely — the PBS survey puts first-class bricks only slightly below Islamabad's figure. The calculator below is pre-set with Rawalpindi's indicative rates.",
    localNote:
      "Rawalpindi's older city areas often have smaller plots and shared walls, which changes the wall area — measure each wall separately rather than using a plot-size thumb rule.",
    title: "Brick Calculator Rawalpindi — PKR | Civil Estimation Pro",
    description:
      "Free brick calculator for Rawalpindi. Calculate bricks, cement bags, sand and total cost in PKR — with Rawalpindi's indicative November 2026 rates (PBS survey).",
  },
  {
    slug: "delhi",
    name: "Delhi",
    country: "India",
    currency: "INR",
    brickPresetId: "in-nonmodular",
    brickPer1000: 11000,
    cementPerBag: 400,
    sandPerUnit: 84,
    rateSource:
      "Brick ₹11/pc and cement ₹340–395/bag, sand ₹78–90/cft (todaypricerates.com Delhi list, November 2026); OPC 53 ₹428–471 (infralens.in, October 2026).",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Delhi, red clay bricks run about ₹11,000 per 1,000 (November 2026). Delhi builds mostly with red clay bricks (230 × 110 × 70 mm non-modular) and increasingly with fly ash bricks, which are cheaper at ₹4–8 per piece. Note that red-brick kilns face restrictions in the NCR green zones, so fly ash and modular bricks are worth pricing too. The calculator below is pre-set with Delhi's indicative rates in rupees.",
    localNote:
      "Delhi sand is sold per cubic foot — river sand runs about ₹78–90 per cft and M-sand about ₹55–64. GST at 12% applies to most bricks; check whether your quote includes it.",
    title: "Brick Calculator Delhi — INR Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for Delhi. Calculate bricks, cement bags, sand and total cost in INR — with Delhi's indicative November 2026 rates and sizes.",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    country: "India",
    currency: "INR",
    brickPresetId: "in-nonmodular",
    brickPer1000: 10000,
    cementPerBag: 410,
    sandPerUnit: 80,
    rateSource:
      "Brick ₹10/pc (metro red-clay range ₹8–12, houseyog.com); cement ₹320–370/bag, sand ₹74–86/cft (todaypricerates.com Mumbai list, November 2026); OPC 53 ₹435–465 (infralens.in, October 2026).",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Mumbai, red clay bricks run about ₹10,000 per 1,000 (November 2026). Mumbai's brick prices sit at the top of the Indian range — longer transport from kilns, higher labour and unloading costs, and constant demand. Fly ash bricks (₹4–8) and AAC blocks are common alternatives in the city. The calculator below is pre-set with Mumbai's indicative rates in rupees.",
    localNote:
      "In Mumbai, river sand is scarce and expensive — most sites use M-sand (about ₹55–64 per cft) or crushed sand. Confirm which sand your quote uses before comparing prices.",
    title: "Brick Calculator Mumbai — INR Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for Mumbai. Calculate bricks, cement bags, sand and total cost in INR — with Mumbai's indicative November 2026 rates and sizes.",
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "UAE",
    currency: "AED",
    brickPresetId: "uae-clay",
    brickPer1000: null,
    cementPerBag: 25,
    sandPerUnit: null,
    rateSource:
      "Cement OPC 43 AED 22–28/bag (yellowpages-uae.com); hollow blocks 4\" AED 1.50–2.50, 6\" AED 2.00–3.50, 8\" AED 2.80–4.50 (fyind.com); AAC AED 3.50–5.50 (woodenboxtrading.com). No verified clay-brick per-1,000 price — enter your supplier's rate.",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Dubai, clay bricks are imported, so enter your supplier's rate for the cost. Dubai builds mostly with concrete blocks, not clay bricks — the standard walling unit is a hollow concrete block, and clay bricks are largely imported, so their price depends on origin and order size. This calculator uses the UAE clay brick size (215 × 102.5 × 65 mm) for quantities; enter your supplier's brick rate to see the cost, or price the job in blocks using the rates below.",
    localNote:
      "Dubai Municipality and ESMA regulate cement and block quality — ask for the supplier's test certificate. A 4-inch hollow block runs about AED 1.50–2.50, a 6-inch block AED 2.00–3.50 and an 8-inch block AED 2.80–4.50 (2026).",
    title: "Brick Calculator Dubai — AED Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for Dubai. Calculate bricks, cement bags and sand in AED — quantities for the UAE clay brick size, with 2026 cement and block rates.",
  },
  {
    slug: "abu-dhabi",
    name: "Abu Dhabi",
    country: "UAE",
    currency: "AED",
    brickPresetId: "uae-clay",
    brickPer1000: null,
    cementPerBag: 25,
    sandPerUnit: null,
    rateSource:
      "Cement OPC 43 AED 22–28/bag (yellowpages-uae.com); hollow blocks 4\" AED 1.50–2.50, 6\" AED 2.00–3.50, 8\" AED 2.80–4.50 (fyind.com); AAC AED 3.50–5.50 (woodenboxtrading.com). No verified clay-brick per-1,000 price — enter your supplier's rate.",
    rateDate: "November 2026",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — in Abu Dhabi, clay bricks are imported, so enter your supplier's rate for the cost. Abu Dhabi follows the same pattern as Dubai: concrete blocks are the standard walling unit and clay bricks are imported. Cement is slightly dearer here than in Dubai in some quotes, but the difference is small. This calculator gives you exact quantities for the UAE clay brick size — enter your supplier's rate for the cost.",
    localNote:
      "For villas in Abu Dhabi, thermal (insulated) blocks are common for external walls — about AED 4.40 per block (2026). They cost more per unit than a standard hollow block but reduce cooling load.",
    title: "Brick Calculator Abu Dhabi — AED | Civil Estimation Pro",
    description:
      "Free brick calculator for Abu Dhabi. Calculate bricks, cement bags and sand in AED — quantities for the UAE clay brick size, with 2026 cement and block rates.",
  },
  {
    slug: "london",
    name: "London",
    country: "UK",
    currency: "GBP",
    brickPresetId: "uk-clay",
    brickPer1000: 650,
    cementPerBag: 8,
    sandPerUnit: null,
    cementBagKg: 25,
    rateSource:
      "Facing bricks £400–900 per 1,000 (bestbuilders.co.uk Q3 2026 bricklaying guide; arcbuildingsupplies.com 2026 guide); Blue Circle general-purpose cement 25 kg £8.14 inc VAT (Travis Perkins, Nov 2026). UK sand is sold per tonne / bulk bag — no verified per-m³ rate, so enter your merchant's rate.",
    rateDate: "November 2026",
    intro:
      "A single-leaf UK wall needs about 60 bricks per square metre of face — in London, facing bricks run about £650 per 1,000 (November 2026). London brickwork is priced very differently from South Asia: the standard brick is 215 × 102.5 × 65 mm (BS EN 771-1), a single leaf needs about 60 bricks per square metre of face, bricks arrive in packs of about 400–520, and cement comes in 25 kg bags. London and the South-East also pay 20–30% more than the UK average for both bricks and labour. The calculator below is pre-set with London's indicative rates in pounds — replace them with your merchant's quote for an exact figure.",
    localNote:
      "London Stock bricks (warm red-brown) run about £0.65–0.85 each; engineering bricks for below-DPC work run about £1.00–1.40 each. A bricklayer in London costs about £300–380 a day (Q3 2026), and laying 1,000 bricks costs roughly £550–900 in labour. A cavity wall is two leaves — calculate each leaf separately.",
    title: "Brick Calculator London — GBP Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for London. Calculate UK bricks, 25 kg cement bags, packs and cost in GBP — with London's indicative November 2026 rates.",
  },
  {
    slug: "new-york",
    name: "New York",
    country: "US",
    currency: "USD",
    brickPresetId: "us-standard",
    brickPer1000: 550,
    cementPerBag: null,
    sandPerUnit: null,
    cementBagKg: 42.6,
    rateSource:
      "Standard clay bricks $350–850 per 1,000, averaging $550 (Angi, Jul 2026; designestimation.com, Oct 2026). No verified US cement-bag or sand price was found — enter your yard's rates.",
    rateDate: "November 2026",
    intro:
      "A single-leaf US face-brick wall needs about 6.9 bricks per square foot — in New York, standard bricks average about $550 per 1,000 (November 2026). New York builds mostly with face-brick veneer over a framed or block backup wall, not with solid 9-inch brickwork — the US standard brick is 7½″ × 3½″ × 2¼″ and a single-leaf face needs about 6.6–6.9 bricks per square foot with a 3/8-inch joint. Bricks are sold by the pallet (usually 500–525) or by the thousand, and cement comes in 94 lb (42.6 kg) bags. The calculator below is pre-set with the US indicative brick rate in dollars — enter your yard's cement and sand rates to complete the cost.",
    localNote:
      "New York prices run above the US average — standard bricks average about $550 per 1,000 nationally, and a mason charges about $1,500–2,000 in labour per 1,000 bricks laid (2026 guides). For a veneer wall, use the 4½-inch-equivalent thickness and the single-leaf face rate, not a solid-wall volume.",
    title: "Brick Calculator New York — USD Cost | Civil Estimation Pro",
    description:
      "Free brick calculator for New York. Calculate US bricks, packs and cost in USD — with the indicative November 2026 standard-brick rate.",
  },
];

export interface BrickTypeVariant {
  slug: string;
  name: string;
  presetId: string;
  /** indicative price per 1,000 (PKR, Pakistan market) */
  pricePer1000Range: string;
  intro: string;
  bestFor: string;
  watchOut: string;
  title: string;
  description: string;
}

export const BRICK_TYPE_VARIANTS: BrickTypeVariant[] = [
  {
    slug: "awwal-bricks",
    name: "Awwal (First-Class) Bricks",
    presetId: "pk-awwal",
    pricePer1000Range: "PKR 16,500–23,000 per 1,000 (Nov 2026, city-dependent)",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — Awwal (First-Class) Bricks run PKR 16,500–23,000 per 1,000 (Nov 2026, city-dependent). Awwal bricks are first-class, well-burnt clay bricks — uniform in size and colour, sharp-edged, with a clear ringing sound when struck together and water absorption under 20%. They are the right choice for load-bearing walls, foundations and external walls.",
    bestFor: "Load-bearing walls, foundations, columns, external walls.",
    watchOut:
      "The most faked grade — ask for a kiln sample and measure it. A brick that is soft, under-burnt or irregular is not Awwal whatever the seller calls it.",
    title: "Awwal Brick Calculator — Qty & Cost | Civil Estimation Pro",
    description:
      "Calculate Awwal (first-class) bricks, cement and sand for any wall, with cost in PKR, INR or AED. Includes Awwal rates and what to check before ordering.",
  },
  {
    slug: "doam-bricks",
    name: "Doam (Second-Class) Bricks",
    presetId: "pk-awwal",
    pricePer1000Range: "PKR 12,000–17,000 per 1,000 (Nov 2026, city-dependent)",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — Doam (Second-Class) Bricks run PKR 12,000–17,000 per 1,000 (Nov 2026, city-dependent). Doam bricks are second-class bricks — slightly under-burnt or irregular, cheaper than Awwal by several thousand rupees per 1,000. They are acceptable for internal, non-load-bearing walls but should not carry structural loads.",
    bestFor: "Internal partition walls, non-load-bearing work, temporary structures.",
    watchOut:
      "Doam absorbs more water and breaks more easily, so add 10% wastage instead of 5%. Never use Doam for foundations or external load-bearing walls.",
    title: "Doam Brick Calculator — Qty & Cost | Civil Estimation Pro",
    description:
      "Calculate Doam (second-class) bricks, cement and sand for any wall, with cost in PKR, INR or AED. Includes Doam rates and where it is safe to use.",
  },
  {
    slug: "machine-made-bricks",
    name: "Machine-Made Bricks",
    presetId: "pk-awwal",
    pricePer1000Range: "PKR 24,000–26,500 per 1,000 (Nov 2026, retail)",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — Machine-Made Bricks run PKR 24,000–26,500 per 1,000 (Nov 2026, retail). Machine-made bricks are pressed, not hand-moulded, so they are far more uniform in size and shape than kiln bricks. That uniformity means tighter joints, less mortar and less wastage — often 5% is enough. They cost more per brick but can save on mortar and labour.",
    bestFor: "Exposed brickwork, precision work, projects where uniform size matters.",
    watchOut:
      "Machine-made bricks are denser and heavier — check that your design accounts for the extra dead load, and confirm the crushing strength certificate.",
    title: "Machine-Made Brick Calculator — Cost | Civil Estimation Pro",
    description:
      "Calculate machine-made bricks, cement and sand for any wall, with cost in PKR, INR or AED. Includes machine-made rates and wastage guidance.",
  },
  {
    slug: "fly-ash-bricks",
    name: "Fly Ash Bricks",
    presetId: "in-modular",
    pricePer1000Range: "PKR 14,000–22,000 per 1,000 (Pakistan, Nov 2026); India ₹4–8 per piece",
    intro:
      "About 8.7 bricks per sq ft for a 9-inch wall — Fly Ash Bricks run PKR 14,000–22,000 per 1,000 (Pakistan, Nov 2026); India ₹4–8 per piece. Fly ash bricks are made from fly ash, cement and sand instead of fired clay. They are uniform, strong (IS 12894 classes 3.5–20 N/mm²) and need less mortar than kiln bricks. In India they are the standard low-cost option at ₹4–8 per piece; in Pakistan they are available but less common.",
    bestFor: "Residential walls up to G+2/G+3 (Class 10+), budget projects, India NCR where kiln bricks are restricted.",
    watchOut:
      "Fly ash bricks need proper curing and a good plaster bond — use a richer mortar (1:4) and hack or key the surface before plastering if the manufacturer recommends it.",
    title: "Fly Ash Brick Calculator — Cost | Civil Estimation Pro",
    description:
      "Calculate fly ash bricks, cement and sand for any wall, with cost in PKR, INR or AED. Includes fly ash rates, sizes (IS 12894) and uses, for your wall.",
  },
];

export interface HouseSizeVariant {
  slug: string;
  name: string;
  marla: number;
  plotSqFt: number;
  /** method note shown on the page */
  method: string;
  externalBricks: number;
  internalBricks: number;
  boundaryBricks: number;
  /** total including 5% wastage */
  totalBricks: number;
  intro: string;
  title: string;
  description: string;
}

/**
 * House-size brick counts, computed (not copied) with this stated method:
 * double-storey house, covered area 70% of plot per floor; external walls 9"
 * at 9 bricks/sq ft; internal walls 4.5" at 4.5 bricks/sq ft; boundary wall
 * 7 ft high at 9 bricks/sq ft; parapet included in external figure; +5% wastage.
 * Cross-check: the 5 marla total lands in the same band as published Lahore
 * contractor guides; the method is shown on the page so readers can adjust it.
 */
export const HOUSE_SIZE_VARIANTS: HouseSizeVariant[] = [
  {
    slug: "5-marla-house",
    name: "5 Marla House",
    marla: 5,
    plotSqFt: 1125,
    method:
      "Double-storey, 70% covered area per floor (787 sq ft), external 9\" walls, internal 4½\" walls, 7 ft boundary wall, parapet included, +5% wastage.",
    externalBricks: 23200,
    internalBricks: 5400,
    boundaryBricks: 8800,
    totalBricks: 39300,
    intro:
      "A 5 Marla House needs about 39,300 bricks including the boundary wall and 5% wastage. A 5 marla house (1,125 sq ft plot, 25 × 45 ft) is the most common house size in Lahore, Islamabad and Rawalpindi. The table below breaks the brick count into external walls, internal walls and the boundary wall, so you can see where the bricks go — and the calculator is pre-set for a typical 5 marla external wall if you want to adjust it.",
    title: "Bricks for a 5 Marla House — Cost | Civil Estimation Pro",
    description:
      "How many bricks for a 5 marla house? About 39,300 bricks including boundary wall and 5% wastage. Calculate your exact number with the free brick calculator.",
  },
  {
    slug: "7-marla-house",
    name: "7 Marla House",
    marla: 7,
    plotSqFt: 1575,
    method:
      "Double-storey, 70% covered area per floor (1,100 sq ft), external 9\" walls, internal 4½\" walls, 7 ft boundary wall, parapet included, +5% wastage.",
    externalBricks: 27400,
    internalBricks: 7200,
    boundaryBricks: 10400,
    totalBricks: 47300,
    intro:
      "A 7 Marla House needs about 47,300 bricks including the boundary wall and 5% wastage. A 7 marla house (1,575 sq ft plot) sits between the compact 5 marla and the spacious 10 marla. The brick count below assumes a double-storey house with a 7 ft boundary wall — adjust the wall areas in the calculator if your design differs.",
    title: "Bricks for a 7 Marla House — Cost | Civil Estimation Pro",
    description:
      "How many bricks for a 7 marla house? About 47,300 bricks including boundary wall and 5% wastage. Calculate your exact number with the free brick calculator.",
  },
  {
    slug: "10-marla-house",
    name: "10 Marla House",
    marla: 10,
    plotSqFt: 2250,
    method:
      "Double-storey, 70% covered area per floor (1,575 sq ft), external 9\" walls, internal 4½\" walls, 7 ft boundary wall, parapet included, +5% wastage.",
    externalBricks: 33100,
    internalBricks: 9900,
    boundaryBricks: 12500,
    totalBricks: 58300,
    intro:
      "A 10 Marla House needs about 58,300 bricks including the boundary wall and 5% wastage. A 10 marla house (2,250 sq ft plot, 35 × 64 ft) is the standard family house in most Pakistani housing societies. The table below shows the brick count split by external walls, internal walls and boundary wall, all with 5% wastage included.",
    title: "Bricks for a 10 Marla House — Cost | Civil Estimation Pro",
    description:
      "How many bricks for a 10 marla house? About 58,300 bricks including boundary wall and 5% wastage. Calculate your exact number with the free brick calculator.",
  },
  {
    slug: "1-kanal-house",
    name: "1 Kanal House",
    marla: 20,
    plotSqFt: 4500,
    method:
      "Double-storey, 70% covered area per floor (3,150 sq ft), external 9\" walls, internal 4½\" walls, 7 ft boundary wall, parapet included, +5% wastage.",
    externalBricks: 46400,
    internalBricks: 14400,
    boundaryBricks: 17600,
    totalBricks: 82300,
    intro:
      "A 1 Kanal House needs about 82,300 bricks including the boundary wall and 5% wastage. A 1 kanal house (4,500 sq ft plot, 50 × 90 ft) is the largest standard residential plot in Pakistan. Brick counts vary widely with the design — a kanal house with a basement or a third floor needs far more — so treat the table below as a starting point and calculate from your drawings.",
    title: "Bricks for a 1 Kanal House — Cost | Civil Estimation Pro",
    description:
      "How many bricks for a 1 kanal house? About 82,300 bricks including boundary wall and 5% wastage. Calculate your exact number with the free brick calculator.",
  },
];

export type BrickVariant =
  | { kind: "main" }
  | { kind: "city"; data: CityVariant }
  | { kind: "type"; data: BrickTypeVariant }
  | { kind: "size"; data: HouseSizeVariant };

/** Parse /brick-calculator/<slug> into a variant. Unknown slugs return main. */
export function parseBrickVariant(pathname: string): BrickVariant {
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (parts[0] !== "brick-calculator") return { kind: "main" };
  const slug = parts[1];
  if (!slug) return { kind: "main" };
  const city = CITY_VARIANTS.find((c) => c.slug === slug);
  if (city) return { kind: "city", data: city };
  const type = BRICK_TYPE_VARIANTS.find((t) => t.slug === slug);
  if (type) return { kind: "type", data: type };
  const size = HOUSE_SIZE_VARIANTS.find((s) => s.slug === slug);
  if (size) return { kind: "size", data: size };
  return { kind: "main" };
}

/** All programmatic brick URLs (for the sitemap). */
export function allBrickProgrammaticUrls(base: string): string[] {
  const urls = [
    ...CITY_VARIANTS.map((c) => `${base}/brick-calculator/${c.slug}`),
    ...BRICK_TYPE_VARIANTS.map((t) => `${base}/brick-calculator/${t.slug}`),
    ...HOUSE_SIZE_VARIANTS.map((s) => `${base}/brick-calculator/${s.slug}`),
  ];
  return urls;
}
