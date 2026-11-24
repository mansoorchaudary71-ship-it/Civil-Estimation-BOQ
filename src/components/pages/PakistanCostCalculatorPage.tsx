import { Button } from '../ui/Button';
import React, { useState, useMemo } from 'react';
import {
  Building,
  MapPin,
  Calculator,
  Layers,
  Grid,
  ShieldCheck,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Hammer,
  ClipboardList,
  Save,
  History
} from 'lucide-react';
import ToolPageFooter from '../ToolPageFooter';
import { CalculationHistory } from '../ui/CalculationHistory';
import { GenericExportButtons } from '../ui/GenericExportButtons';
import { pakistanCost, pakistanCostBothStandards, PAK_RATES, RATES_LAST_UPDATED, RATE_SOURCE, type PakCity, type PakTier } from '../../lib/pakistanCost';
import { MARLA_SQFT, type MarlaStandard } from '../../lib/quickEstimate';
import { GlobalFAQ, getCombinedFaqs, type FAQItem } from '../ui/GlobalFAQ';
import { SEO, SITE_WEB_APP } from "../SEO";
import { getSiteUrl } from "../../seo/siteConfig";
import { TOOL_GUIDES } from "../../seo/toolGuides";
import { ToolArticleWidget } from "../ui/ToolArticleWidget";

/**
 * Page-supplied FAQs, hoisted so the visible GlobalFAQ accordion and the
 * FAQPage JSON-LD below are built from the same list (via
 * getCombinedFaqs, which appends this tool's SPECIFIC_FAQS — generic
 * template questions are excluded from both). This page serves both /pakistan-cost-calculator
 * and its alias /cost-guide-pakistan, so the one FAQPage covers both.
 */
const PAK_COST_FAQS: FAQItem[] = [
  { question: "What is the construction cost per sqft in Lahore in 2026?", answer: "Grey structure Rs 2,800–3,400/sqft, standard finish Rs 3,800–4,500/sqft, premium Rs 5,700–6,400/sqft and luxury turnkey Rs 7,000–8,500/sqft (Nov 2026, indicative)." },
  { question: "What does a 5 marla house cost in Lahore?", answer: "On the 272.25-sqft revenue marla, a 5-marla G+1 standard house is about PKR 7,759,125–9,188,438 (covered 2,041.88 sqft). On the 225-sqft society marla it is PKR 6,412,500–7,593,750." },
  { question: "Grey vs turnkey — what is included?", answer: "Grey is the structure only. Turnkey adds finishing, fixtures, MEP and boundary works. The grey share of a turnkey total is about 55%." },
  { question: "Marla 225 vs 272.25 — which one applies?", answer: "Societies (DHA, Bahria, LDA schemes) use 225 sqft per marla; Punjab revenue records use 272.25 sqft. Use the toggle and check your plot papers — the same plot differs by ~17%." },
];


const TIER_LABELS: Record<PakTier, string> = {
  grey: "Grey Structure",
  standard: "Standard Finish",
  premium: "Premium Finish",
  luxury: "Luxury",
};
const TIER_KEYS = Object.keys(TIER_LABELS) as PakTier[];
const CITY_KEYS = Object.keys(PAK_RATES) as PakCity[];
const CITY_LABELS: Record<PakCity, string> = {
  lahore: "Lahore", islamabad: "Islamabad", karachi: "Karachi",
  faisalabad: "Faisalabad", multan: "Multan", other: "Other",
};

// Option lists only — the engine (pakistanCost.ts) does the conversion.
// (The old unitMultipliers/floorModifiers objects carried numeric values
// that were never read; "Marla": 272.25 also hardcoded one marla standard
// while the page has a 225/272.25 toggle.)
const UNIT_OPTIONS = ["Sq.Ft", "Sq.Yards", "Marla", "Kanal"] as const;
const FLOOR_OPTIONS = ["G", "G+1", "G+2", "G+3", "G+4+"] as const;

export default function PakistanCostCalculatorPage() {
  const [area, setArea] = useState<number>(5);
  const [unit, setUnit] = useState<(typeof UNIT_OPTIONS)[number]>("Marla");
  const [marlaStandard, setMarlaStandard] = useState<MarlaStandard>("revenue272");
  const [city, setCity] = useState<PakCity>("lahore");
  const [constructionType, setConstructionType] = useState<PakTier>("standard");
  const [floors, setFloors] = useState<(typeof FLOOR_OPTIONS)[number]>("G+1");
  const [hasBasement, setHasBasement] = useState(false);

  // Engine (src/lib/pakistanCost): 2026 dated rates. Floor multipliers are
  // 0.75 coverage x floors (G+1 = 1.5). Marla toggle is mandatory: the same
  // plot costs ~17% less on the 225-sqft society marla than on 272.25.
  const floorCount = floors === "G" ? 1 : floors === "G+1" ? 2 : floors === "G+2" ? 3 : floors === "G+3" ? 4 : 5;
  const plotUnit = unit === "Marla" ? "marla" : unit === "Kanal" ? "kanal" : unit === "Sq.Yards" ? "sqyd" : "sqft";
  const result = useMemo(() => pakistanCost({
    plotArea: area, plotUnit: plotUnit as "sqft" | "sqyd" | "marla" | "kanal",
    marla: marlaStandard, city, tier: constructionType, floors: floorCount, basement: hasBasement,
  }), [area, plotUnit, marlaStandard, city, constructionType, floorCount, hasBasement]);
  const bothStandards = useMemo(() => (unit === "Marla" || unit === "Kanal")
    ? pakistanCostBothStandards({ plotArea: area, plotUnit: plotUnit as "marla" | "kanal", city, tier: constructionType, floors: floorCount, basement: hasBasement })
    : null, [area, plotUnit, unit, city, constructionType, floorCount, hasBasement]);
  const totalCoveredArea = result.coveredSqft;
  const rates: [number, number] = [result.rateMin, result.rateMax];
  const minCost = result.costMin;
  const maxCost = result.costMax;
  const avgCost = Math.round(result.costAvg);
  const marlaSqft = MARLA_SQFT[marlaStandard];

  // Per-tool HowTo steps, SEOHead pattern: the worked-example steps
  // from this page's own verified guide (canonical toolId
  // "pakistan-cost-calculator" — the alias /cost-guide-pakistan renders
  // this same component, so its separate guide is NOT also rendered).
  const guideSteps: string[] = TOOL_GUIDES["pakistan-cost-calculator"]?.workedExample?.steps ?? [];

  const formatLakhCrore = (num: number) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + " Crore";
    } else if (num >= 100000) {
      return (num / 100000).toFixed(2) + " Lac";
    }
    return num.toLocaleString();
  };

  const formatPKR = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  const getBreakdown = (type: string) => {
    if (type === "Grey Structure") {
      return [
        { label: "Cement & Bricks", percentage: 35 },
        { label: "Steel & Rebar", percentage: 25 },
        { label: "Labour & Formwork", percentage: 20 },
        { label: "Plumbing & Electrical (Base)", percentage: 10 },
        { label: "Sand, Crush & Misc", percentage: 10 },
      ];
    }
    return [
      { label: "Grey Structure Materials", percentage: 35 },
      { label: "Finishing Materials (Tiles, Paint)", percentage: 25 },
      { label: "Steel Reinforcement", percentage: 15 },
      { label: "Labour Costs", percentage: 15 },
      { label: "Sanitary, Plumbing & Electrical", percentage: 10 },
    ];
  };

  return (
    <div className="min-h-screen bg-surface-default font-sans pb-12">
      {/*
        One shared title for both routes this page serves
        (/pakistan-cost-calculator and /cost-guide-pakistan — App renders
        this same component for both, with no prop to tell them apart).
        Canonical consolidates the alias (/cost-guide-pakistan) onto the
        primary route.
      */}
      <SEO
        title="Pakistan House Cost Calculator 2026"
        description="Estimate house construction cost in PKR with 2026 city rates for Lahore, Karachi, Islamabad, Faisalabad and Multan — grey structure to luxury finish."
        canonicalUrl={`${getSiteUrl()}/pakistan-cost-calculator`}
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            SITE_WEB_APP,
            ...(guideSteps.length > 0
              ? [
                  {
                    "@type": "HowTo",
                    "name": "How to use Pakistan House Cost Calculator 2026",
                    "step": guideSteps.map((text) => ({ "@type": "HowToStep", "text": text })),
                  },
                ]
              : []),
            {
              "@type": "FAQPage",
              "mainEntity": getCombinedFaqs("pakistan-cost-calculator", PAK_COST_FAQS, { includeGeneric: false }).map((f) => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": { "@type": "Answer", "text": f.answer },
              })),
            },
          ],
        }}
      />
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-20 pb-16">
        
        {/* Section 1: H1 SEO Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 md:py-1 bg-accent-500/10 border border-accent-500/20 text-accent-700 rounded-full text-xs uppercase tracking-wider font-bold shadow-brand-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 2026 Rates
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-surface-default border border-ui-borderSubtle rounded-full text-xs uppercase tracking-wider font-bold text-txt-secondary shadow-brand-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Pakistan
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-surface-default border border-ui-borderSubtle rounded-full text-xs uppercase tracking-wider font-bold text-txt-secondary shadow-brand-sm flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Local Units (Marla/Kanal)
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-txt-primary tracking-tight mb-6">
            House Construction Cost <br className="hidden md:block"/>
            <span className="text-accent-700">Calculator Pakistan 2026</span>
          </h1>
          <p className="text-txt-secondary text-lg max-w-3xl leading-relaxed">
            Estimate house construction costs in PKR using dated 2026 rates for Lahore, Karachi, Islamabad, Faisalabad and Multan. 
            Supports Marla, Kanal, and direct Sq.Ft layouts with options for Grey Structure to Luxury finishes.
          </p>
        </div>

        {/* Calculator Body - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          
          {/* Section 2: Inputs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-6 md:p-8 shadow-brand-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-lg bg-accent-500/10 text-accent-700 flex items-center justify-center font-bold">1</div>
                 <h2 className="text-xl font-bold text-txt-primary">Project Dimensions & Location</h2>
              </div>

              {/* Area & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-2">Plot Area</label>
                  <><label htmlFor="a11y-input-577" className="sr-only">Input</label>
<input id="a11y-input-577" 
                    type="number" inputMode="decimal" 
                    value={area} 
                    onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-default border border-ui-borderSubtle rounded-xl px-4 py-3 text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all font-semibold"
                  /></>
                </div>
                <div>
                  <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-2">Measurement Unit</label>
                  <div className="flex bg-surface-default p-1 rounded-xl border border-ui-borderSubtle">
                     {UNIT_OPTIONS.map((u) => (
                       <Button
                         key={u}
                         onClick={() => setUnit(u)}
                         className={`flex-1 text-xs py-2.5 rounded-lg font-bold transition-colors ${unit === u ? 'bg-accent-500 text-txt-primary' : 'text-txt-secondary hover:text-txt-primary'}`}
                       >
                         {u}
                       </Button>
                     ))}
                  </div>
                  {(unit === "Marla" || unit === "Kanal") && (
                    <div className="mt-2 flex gap-2">
                      <Button onClick={() => setMarlaStandard("society225")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${marlaStandard === "society225" ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>225 sqft — society / DHA / Bahria</Button>
                      <Button onClick={() => setMarlaStandard("revenue272")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${marlaStandard === "revenue272" ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>272.25 sqft — Punjab revenue</Button>
                    </div>
                  )}
                  {unit === "Marla" && <p className="text-xs text-accent-700 mt-2 font-medium">*1 Marla = {marlaSqft} Sq.Ft ({marlaStandard === "society225" ? "society standard" : "Punjab revenue standard"}). The other standard changes this estimate by ~17%.</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                 <div>
                    <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-2">City</label>
                    <select 
                       value={city}
                       onChange={(e) => setCity(e.target.value as PakCity)}
                       className="w-full bg-surface-default border border-ui-borderSubtle rounded-xl px-4 py-3.5 text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:outline-none focus:ring-accent-500 transition-all appearance-none font-semibold cursor-pointer"
                    >
                      {CITY_KEYS.map(c => <option key={c} value={c}>{CITY_LABELS[c]}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-2">Floors</label>
                    <div className="flex gap-2">
                       {FLOOR_OPTIONS.map(f => (
                          <Button
                            key={f}
                            onClick={() => setFloors(f)}
                            className={`flex-1 text-sm py-2.5 rounded-xl border font-bold transition-all ${floors === f ? 'bg-surface-default border-accent-500 text-accent-700' : 'bg-surface-default border-ui-borderSubtle text-txt-secondary hover:border-ui-borderStrong hover:text-txt-primary'}`}
                          >
                            {f}
                          </Button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Basement Toggle */}
              <Button 
                onClick={() => setHasBasement(!hasBasement)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${hasBasement ? 'bg-accent-500/5 border-accent-500/40 text-accent-700' : 'bg-surface-default border-ui-borderSubtle text-txt-secondary hover:border-ink-600 hover:text-txt-primary'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${hasBasement ? 'border-accent-500' : 'border-ui-borderStrong'}`}>
                    {hasBasement && <div className="w-2 h-2 bg-accent-500 rounded-full" />}
                  </div>
                  <span className="font-bold">Include Basement</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-surface-hover/20 rounded-md">+75% base area</span>
              </Button>

            </div>

            <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-6 md:p-8 shadow-brand-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-lg bg-accent-500/10 text-accent-700 flex items-center justify-center font-bold">2</div>
                 <h2 className="text-xl font-bold text-txt-primary">Construction Quality</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TIER_KEYS.map(type => {
                  const r = PAK_RATES[city][type];
                  const label = TIER_LABELS[type];
                  return (
                    <Button
                      key={type}
                      onClick={() => setConstructionType(type)}
                      className={`text-left p-5 rounded-xl border transition-all ${constructionType === type ? 'bg-accent-50 border-accent-500 shadow-[0_0_15px_rgba(242,164,19,0.05)]' : 'bg-surface-default border-border-color hover:border-ui-borderStrong'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold ${constructionType === type ? 'text-accent-800' : 'text-txt-primary'}`}>{label}</span>
                        {constructionType === type && <CheckCircle2 className="w-4 h-4 text-accent-800" />}
                      </div>
                      <span className="text-sm font-mono text-txt-secondary block mt-1">PKR {r[0].toLocaleString()} - {r[1].toLocaleString()} <span className="text-xs text-txt-tertiary">/sqft</span></span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Results Panel */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-gradient-to-b from-ink to-surface-default border border-accent-500/20 rounded-2xl p-4 sm:p-8 md:p-8 sticky top-28 shadow-brand-lg flex flex-col h-full overflow-hidden">
              
              <div className="mb-8">
                <p className="text-accent-700 font-bold text-xs uppercase tracking-widest mb-3">Estimated Total Cost</p>
                {result.error ? (
                  <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{result.error}</p>
                ) : (
                  <h3 className="text-4xl lg:text-5xl font-black text-txt-primary tracking-tighter mb-2">
                     PKR {formatLakhCrore(minCost)} <span className="text-txt-tertiary font-medium text-2xl">to</span> <br className="hidden md:block"/> {formatLakhCrore(maxCost)}
                  </h3>
                )}
                <p className="text-txt-secondary mt-4 text-sm font-medium flex justify-between items-center bg-surface-default/50 rounded-lg py-2 px-3">
                  <span>Covered Area:</span>
                  <span className="text-txt-primary font-bold">{formatPKR(totalCoveredArea)} Sq.Ft</span>
                </p>
                <p className="text-txt-secondary mt-2 text-sm font-medium flex justify-between items-center bg-surface-default/50 rounded-lg py-2 px-3">
                  <span>Applied Rate:</span>
                  <span className="text-accent-700 font-bold font-mono">PKR {rates[0].toLocaleString()} - {rates[1].toLocaleString()} /sqft</span>
                </p>
                {bothStandards && (
                  <p className="text-txt-secondary mt-2 text-sm font-medium bg-surface-default/50 rounded-lg py-2 px-3">
                    Same plot on the other marla standard: {marlaStandard === "revenue272" ? "225 sqft/marla" : "272.25 sqft/marla"} → PKR {formatLakhCrore(marlaStandard === "revenue272" ? bothStandards.society225.costMin : bothStandards.revenue272.costMin)} to {formatLakhCrore(marlaStandard === "revenue272" ? bothStandards.society225.costMax : bothStandards.revenue272.costMax)} — a ~17% swing from the marla definition alone.
                  </p>
                )}
                <p className="text-txt-secondary mt-2 text-sm font-medium bg-surface-default/50 rounded-lg py-2 px-3">
                  Derived materials (thumb rules on covered area): {result.materials.cementBags.toLocaleString()} bags cement · {result.materials.steelKg.toLocaleString()} kg steel · {result.materials.bricks.toLocaleString()} bricks · {result.materials.sandCft.toLocaleString()} cft sand · {result.materials.aggregateCft.toLocaleString()} cft aggregate.
                </p>
                <p className="text-txt-tertiary mt-2 text-xs">Rates {RATES_LAST_UPDATED} — {RATE_SOURCE} Floor multipliers: 0.75 coverage × floors (G+1 = 1.5× plot). Basement adds one 75%-coverage floor.</p>
              </div>

              <div className="h-px w-full bg-surface-default/80 mb-6"></div>

              {/* Breakdown Table */}
              <div className="flex-1 mb-8">
                 <h4 className="text-sm font-bold text-txt-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                   <Grid className="w-4 h-4 text-accent-700" /> Cost Breakdown ({TIER_LABELS[constructionType]})
                 </h4>
                 <div className="space-y-3">
                    {getBreakdown(TIER_LABELS[constructionType]).map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                         <div className="flex justify-between items-end text-sm">
                            <span className="text-txt-secondary font-medium">{item.label}</span>
                            <span className="text-xs font-mono font-bold text-accent-400 text-right">PKR {formatLakhCrore(avgCost * (item.percentage/100))}</span>
                         </div>
                         <div className="w-full bg-surface-default h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-accent-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-surface-default border border-accent-200 rounded-xl p-4 flex gap-3 items-start shrink-0">
                <AlertTriangle className="w-4 h-4 text-accent-700 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-txt-secondary">
                  Disclaimer: This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save & export — standalone page has no ToolHeader, so the save /
            history buttons live here next to the export buttons. They fire
            the same window events CalculationHistory listens for. */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <GenericExportButtons
              filename="pakistan-cost-calculator"
              data={{
                headers: ["Cost item", "Amount (PKR)"],
                rows: result.error ? [
                  ["Plot", `${area} ${unit} (${marlaStandard === "revenue272" ? "272.25" : "225"} sqft/marla)`],
                  ["City", CITY_LABELS[city]],
                  ["Error", result.error],
                ] : [
                  ["Plot", `${area} ${unit} (${marlaStandard === "revenue272" ? "272.25" : "225"} sqft/marla)`],
                  ["City", CITY_LABELS[city]],
                  ["Finish", TIER_LABELS[constructionType]],
                  ["Floors", floors],
                  ["Basement", hasBasement ? "Yes" : "No"],
                  ["Covered area (sq ft)", String(Math.round(totalCoveredArea))],
                  ["Rate min (PKR/sqft)", String(rates[0])],
                  ["Rate max (PKR/sqft)", String(rates[1])],
                  ["Estimated cost min (PKR)", String(Math.round(minCost))],
                  ["Estimated cost max (PKR)", String(Math.round(maxCost))],
                  ["Estimated cost avg (PKR)", String(avgCost)],
                  ["Cement bags", String(result.materials.cementBags)],
                  ["Steel (kg)", String(result.materials.steelKg)],
                  ["Bricks", String(result.materials.bricks)],
                  ["Sand (cft)", String(result.materials.sandCft)],
                  ["Aggregate (cft)", String(result.materials.aggregateCft)],
                  ...getBreakdown(TIER_LABELS[constructionType]).map((item) => [
                    `${item.label} (${item.percentage}%)`,
                    String(Math.round(avgCost * (item.percentage / 100))),
                  ]),
                ],
              }}
            />
            <Button
              onClick={() => window.dispatchEvent(new Event("trigger-global-save"))}
              className="flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink-700 transition-colors active:scale-95"
            >
              <Save className="w-4 h-4" /> Save calculation
            </Button>
            <Button
              onClick={() => window.dispatchEvent(new Event("trigger-global-history"))}
              className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-semibold border border-ui-borderSubtle hover:bg-surface-active transition-colors active:scale-95"
            >
              <History className="w-4 h-4" /> Saved calculations
            </Button>
          </div>
          <CalculationHistory
            calculatorId="pakistan-cost-calculator"
            estimationName="Pakistan Cost Calculator"
            currentInputs={{ area, unit, marlaStandard, city, constructionType, floors, hasBasement }}
            currentResults={result.error ? { error: result.error } : {
              coveredSqft: totalCoveredArea,
              rateMin: rates[0],
              rateMax: rates[1],
              costMin: minCost,
              costMax: maxCost,
              costAvg: avgCost,
              cementBags: result.materials.cementBags,
              steelKg: result.materials.steelKg,
              bricks: result.materials.bricks,
              sandCft: result.materials.sandCft,
              aggregateCft: result.materials.aggregateCft,
            }}
            summaryGeneration={(inputs, res) =>
              `${String(inputs.area ?? "")} ${String(inputs.unit ?? "")} in ${CITY_LABELS[(inputs.city as PakCity) ?? "lahore"] ?? inputs.city}, ${TIER_LABELS[(inputs.constructionType as PakTier) ?? "standard"] ?? inputs.constructionType} — PKR ${Number(res.costMin ?? 0).toLocaleString()} to PKR ${Number(res.costMax ?? 0).toLocaleString()}`
            }
            onRestore={(savedInputs) => {
              if (savedInputs.area != null) setArea(Number(savedInputs.area));
              if (typeof savedInputs.unit === "string" && (UNIT_OPTIONS as readonly string[]).includes(savedInputs.unit)) setUnit(savedInputs.unit as (typeof UNIT_OPTIONS)[number]);
              if (savedInputs.marlaStandard === "revenue272" || savedInputs.marlaStandard === "society225") setMarlaStandard(savedInputs.marlaStandard);
              if (typeof savedInputs.city === "string" && (CITY_KEYS as readonly string[]).includes(savedInputs.city)) setCity(savedInputs.city as PakCity);
              if (typeof savedInputs.constructionType === "string" && (TIER_KEYS as readonly string[]).includes(savedInputs.constructionType)) setConstructionType(savedInputs.constructionType as PakTier);
              if (typeof savedInputs.floors === "string" && (FLOOR_OPTIONS as readonly string[]).includes(savedInputs.floors)) setFloors(savedInputs.floors as (typeof FLOOR_OPTIONS)[number]);
              if (typeof savedInputs.hasBasement === "boolean") setHasBasement(savedInputs.hasBasement);
            }}
          />
        </div>

        {/* Section 4: Static SEO Content */}
        <div className="mb-20">
           <h2 className="text-2xl md:text-3xl font-bold text-txt-primary mb-8 border-b border-ui-borderSubtle pb-4">
             Construction Cost Breakdown Pakistan (2026 Rates)
           </h2>
           <p className="text-txt-secondary mb-8 max-w-4xl leading-relaxed">
             Material inflation and labor rates change frequently across provinces. For 2026, 
             the base rate for a standard finish house largely hovers around PKR 3,800 to PKR 4,500 per sq.ft across major hubs. 
             Grey structure materials (bricks, cement, steel) account for approximately 45-50% of the total budget, while finishing touches and labor make up the rest. 
             Refer to the precise square foot ranges by city below:
           </p>

           <div className="overflow-x-auto rounded-xl border border-ui-borderSubtle bg-surface-default shadow-brand-lg">
              <table className="w-full text-left text-sm text-txt-secondary">
                <thead className="bg-surface-default text-txt-secondary uppercase font-bold text-xs tracking-wider border-b border-ui-borderSubtle">
                  <tr>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Grey Structure (PKR/sqft)</th>
                    <th className="px-6 py-4">Standard Finish (PKR/sqft)</th>
                    <th className="px-6 py-4">Premium Finish (PKR/sqft)</th>
                    <th className="px-6 py-4">Luxury Finish (PKR/sqft)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/60">
                  {/* Rendered from PAK_RATES (src/lib/pakistanCost.ts) — the
                      same table the calculator uses, so the two can never
                      disagree again. */}
                  {CITY_KEYS.map((c, idx) => {
                    const r = PAK_RATES[c];
                    const fmt = (t: PakTier) => `${r[t][0].toLocaleString()} – ${r[t][1].toLocaleString()}`;
                    return (
                      <tr key={c} className={`hover:bg-surface-default/30 transition-colors ${idx % 2 === 1 ? "bg-surface-default/30" : ""}`}>
                        <td className="px-6 py-4 font-bold text-txt-primary">{c === "other" ? "Other Cities (Avg)" : CITY_LABELS[c]}</td>
                        <td className="px-6 py-4">{fmt("grey")}</td>
                        <td className="px-6 py-4">{fmt("standard")}</td>
                        <td className="px-6 py-4">{fmt("premium")}</td>
                        <td className="px-6 py-4 text-accent-700 font-semibold">{fmt("luxury")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>

        {/* Section 5: Related Tools */}
        <div className="mb-20">
           <h3 className="text-xl font-bold text-txt-primary mb-6">Explore Professional Evaluation Tools</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { title: "BOQ Generator", desc: "Instantly create detailed Bills of Quantities.", icon: ClipboardList, target: "/boq" },
                { title: "Material Takeoff", desc: "Systematic quantity extraction workflows.", icon: Hammer, target: "/material-takeoff" },
                { title: "Concrete Mix Design", desc: "IS 10262:2019 compliant mix calculations.", icon: Layers, target: "/mix-design" },
                { title: "Steel Weight Estimator", desc: "Calculate precise rebar weights & lengths.", icon: Grid, target: "/metal-weight" }
              ].map((tool, idx) => (
                 <a key={idx} href={tool.target} className="bg-surface-default border border-ui-borderSubtle hover:border-accent-500/40 rounded-2xl p-5 group transition-all overflow-hidden">
                    <div className="bg-surface-hover/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-500/10 transition-colors">
                      <tool.icon className="w-5 h-5 text-txt-secondary group-hover:text-accent-700 transition-colors" />
                    </div>
                    <h4 className="text-txt-primary font-bold mb-1 group-hover:text-accent-50 transition-colors">{tool.title}</h4>
                    <p className="text-xs text-txt-secondary leading-relaxed">{tool.desc}</p>
                 </a>
              ))}
           </div>
        </div>

        {/* Guide article — same position as ModuleWrapper (App.tsx):
            below the main content, above the FAQ. Canonical toolId only;
            the /cost-guide-pakistan alias renders this same page, so its
            separate guide is not rendered as well (one guide per page). */}
        <ToolArticleWidget toolId="pakistan-cost-calculator" toolName="Pakistan House Construction Cost Calculator" />

        <GlobalFAQ
          moduleId="pakistan-cost-calculator"
          faqs={PAK_COST_FAQS}
        />

        {/* Section 6: Standard Footer */}
        <ToolPageFooter 
           toolName="House Construction Cost Calculator Pakistan 2026"
           standards={["BCP-2021 (Building Code of Pakistan)", "PEC Standard Formatting", "Punjab By-laws"]}
           formulaDescription="Covered Area = Plot Area × Floor Multiplier. Cost = Covered Area × Regional Standard Finish Rate/Sqft. Breakdown applies probabilistic averages for Material/Logistics scaling in Pakistani markets."
           difficulty="Beginner"
           lastUpdated="November 2026"
           category="Quantity Estimation"
        />

      </div>
    </div>
  );
}
