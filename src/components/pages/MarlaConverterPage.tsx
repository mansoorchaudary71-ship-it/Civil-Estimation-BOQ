import { Button } from '../ui/Button';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  MapPin, 
  Calculator, 
  Layers, 
  Grid, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Map
} from 'lucide-react';
import ToolPageFooter from '../ToolPageFooter';
import { GlobalFAQ } from '../ui/GlobalFAQ';
import toast from 'react-hot-toast';


type UnitMap = {
  "Sq.Ft": number;
  "Sq.Yd": number;
  "m²": number;
  "Marla": number;
  "Kanal": number;
  "Acre": number;
  "Murabba": number;
};

export default function MarlaConverterPage() {
  const [marlaStandard, setMarlaStandard] = useState<"Punjab" | "KPK">("Punjab");
  const [plotLength, setPlotLength] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [fardKanal, setFardKanal] = useState("");
  const [fardMarla, setFardMarla] = useState("");
  const [fardSarsai, setFardSarsai] = useState("");
  const [inputValue, setInputValue] = useState<string>("5");
  const [sourceUnit, setSourceUnit] = useState<keyof UnitMap>("Marla");
  const [convertedValues, setConvertedValues] = useState<UnitMap>({
    "Sq.Ft": 0, "Sq.Yd": 0, "m²": 0, "Marla": 0, "Kanal": 0, "Acre": 0, "Murabba": 0
  });

  // Base constants to Sq.Ft
  const sqftPerMarla = marlaStandard === "Punjab" ? 272.25 : 225;
  const sqftPerKanal = sqftPerMarla * 20;

  const unitToSqft: Record<keyof UnitMap, number> = useMemo(() => ({
    "Sq.Ft": 1,
    "Sq.Yd": 9,
    "m²": 10.7639104,
    "Marla": sqftPerMarla,
    "Kanal": sqftPerKanal,
    "Acre": 43560,
    "Murabba": 43560 * 25 // 1,089,000
  }), [sqftPerMarla, sqftPerKanal]);

  useEffect(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setConvertedValues({
        "Sq.Ft": 0, "Sq.Yd": 0, "m²": 0, "Marla": 0, "Kanal": 0, "Acre": 0, "Murabba": 0
      });
      return;
    }

    // Convert source unit to standard base (Sq.Ft)
    const baseSqft = val * unitToSqft[sourceUnit];

    // Convert base Sq.Ft to all other units
    setConvertedValues({
      "Sq.Ft": baseSqft / unitToSqft["Sq.Ft"],
      "Sq.Yd": baseSqft / unitToSqft["Sq.Yd"],
      "m²": baseSqft / unitToSqft["m²"],
      "Marla": baseSqft / unitToSqft["Marla"],
      "Kanal": baseSqft / unitToSqft["Kanal"],
      "Acre": baseSqft / unitToSqft["Acre"],
      "Murabba": baseSqft / unitToSqft["Murabba"]
    });
  }, [inputValue, sourceUnit, unitToSqft, marlaStandard]);

  const handleQuickSelect = (val: string, unit: keyof UnitMap) => {
    setInputValue(val);
    setSourceUnit(unit);
  };

  const formatValue = (num: number) => {
    return parseFloat(num.toFixed(2)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const allUnits: (keyof UnitMap)[] = ["Sq.Ft", "Sq.Yd", "m²", "Marla", "Kanal", "Acre", "Murabba"];

  return (
    <div className="min-h-screen bg-surface-default font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-20 pb-16">
        
        {/* Section 1: H1 SEO Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 md:py-1 bg-accent-500/10 border border-accent-500/20 text-accent-700 rounded-full text-xs uppercase tracking-wider font-bold shadow-brand-sm flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5" /> Land Measurement
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-surface-default border border-ui-borderSubtle rounded-full text-xs uppercase tracking-wider font-bold text-txt-secondary shadow-brand-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Pakistan / India
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-surface-default border border-ui-borderSubtle rounded-full text-xs uppercase tracking-wider font-bold text-txt-secondary shadow-brand-sm flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Real-time Converter
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-txt-primary tracking-tight mb-6">
            Area Plot Converter: <br className="hidden md:block"/>
            <span className="text-accent-700">Marla & Kanal to Sq.Ft</span>
          </h1>
          <p className="text-txt-secondary text-lg max-w-3xl leading-relaxed">
            Instantly convert plot sizes between Marla, Kanal, Square Feet, and Acres. 
            Supports both Punjab (272.25 Sq.Ft) and KPK (225 Sq.Ft) regional Marla standards.
            Perfect for real estate professionals and civil engineers.
          </p>
        </div>

        {/* Section 2 & 3: Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Standard Toggle & Master Input */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#152136] border border-ui-borderSubtle rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
               {/* Background Accent */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full blur-[80px] pointer-events-none"></div>
               
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                 <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
                   <Grid className="w-5 h-5 text-accent-700" /> Enter Plot Size
                 </h2>
                 <div className="bg-surface-default p-1 rounded-xl border border-ui-borderSubtle flex text-sm">
                    <Button 
                      onClick={() => setMarlaStandard("Punjab")}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${marlaStandard === "Punjab" ? "bg-accent-500 text-txt-primary shadow-brand-sm" : "text-txt-secondary hover:text-txt-primary"}`}
                    >
                      Punjab (272.25 Sq.Ft)
                    </Button>
                    <Button 
                      onClick={() => setMarlaStandard("KPK")}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${marlaStandard === "KPK" ? "bg-accent-500 text-txt-primary shadow-brand-sm" : "text-txt-secondary hover:text-txt-primary"}`}
                    >
                      KPK (225 Sq.Ft)
                    </Button>
                 </div>
               </div>

               <div className="relative mb-6 z-10">
                 <><label htmlFor="a11y-input-576" className="sr-only">0</label>
<input id="a11y-input-576" 
                   type="number" inputMode="decimal"
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   className="w-full bg-surface-default/80 border-2 border-ui-borderSubtle focus:border-accent-500 rounded-2xl px-6 py-6 text-4xl md:text-6xl font-black text-txt-primary focus:outline-none transition-all shadow-inner overflow-hidden"
                   placeholder="0"
                 /></>
               </div>

               {/* Source Unit Selector */}
               <div className="flex flex-wrap gap-2 relative z-10 mb-8">
                  {allUnits.map(u => (
                    <Button 
                      key={u}
                      onClick={() => setSourceUnit(u)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${sourceUnit === u ? 'bg-accent-500 text-txt-primary shadow-[0_0_15px_rgba(242,164,19,0.2)]' : 'bg-surface-default border border-ui-borderSubtle text-txt-secondary hover:bg-surface-default hover:text-txt-primary'}`}
                    >
                      {u}
                    </Button>
                  ))}
               </div>

               <div className="border-t border-ui-borderSubtle pt-6 relative z-10">
                 <p className="text-xs uppercase tracking-widest font-bold text-txt-tertiary mb-3">Plot dimensions (L × W, ft)</p>
                 <div className="flex flex-wrap gap-2 mb-3">
                   <input type="number" inputMode="decimal" min="0" value={plotLength} onChange={(e) => setPlotLength(e.target.value)} placeholder="Length (ft)" className="w-32 px-3 py-2 bg-surface-default border border-ui-borderSubtle rounded-xl text-sm font-semibold" />
                   <span className="self-center font-bold">×</span>
                   <input type="number" inputMode="decimal" min="0" value={plotWidth} onChange={(e) => setPlotWidth(e.target.value)} placeholder="Width (ft)" className="w-32 px-3 py-2 bg-surface-default border border-ui-borderSubtle rounded-xl text-sm font-semibold" />
                   <Button onClick={() => {
                     const l = parseFloat(plotLength), w = parseFloat(plotWidth);
                     if (!isFinite(l) || !isFinite(w) || l <= 0 || w <= 0) { toast.error("Enter a length and width over 0."); return; }
                     setInputValue(String(l * w)); setSourceUnit("Sq.Ft");
                     toast.success(`${l} × ${w} ft = ${(l * w).toLocaleString()} sq ft`);
                   }} className="px-4 py-2 bg-ink text-white rounded-xl text-sm font-bold">Use this plot</Button>
                 </div>
                 <p className="text-xs uppercase tracking-widest font-bold text-txt-tertiary mb-3">Fard (Kanal – Marla – Sarsai)</p>
                 <div className="flex flex-wrap gap-2 mb-3">
                   <input type="number" inputMode="decimal" min="0" value={fardKanal} onChange={(e) => setFardKanal(e.target.value)} placeholder="Kanal" className="w-24 px-3 py-2 bg-surface-default border border-ui-borderSubtle rounded-xl text-sm font-semibold" />
                   <input type="number" inputMode="decimal" min="0" value={fardMarla} onChange={(e) => setFardMarla(e.target.value)} placeholder="Marla" className="w-24 px-3 py-2 bg-surface-default border border-ui-borderSubtle rounded-xl text-sm font-semibold" />
                   <input type="number" inputMode="decimal" min="0" value={fardSarsai} onChange={(e) => setFardSarsai(e.target.value)} placeholder="Sarsai" className="w-24 px-3 py-2 bg-surface-default border border-ui-borderSubtle rounded-xl text-sm font-semibold" />
                   <Button onClick={() => {
                     const k = parseFloat(fardKanal) || 0, m = parseFloat(fardMarla) || 0, sr = parseFloat(fardSarsai) || 0;
                     if (k < 0 || m < 0 || sr < 0 || (k === 0 && m === 0 && sr === 0)) { toast.error("Enter at least one fard value."); return; }
                     const sqft = (k * 20 + m) * sqftPerMarla + sr * (sqftPerMarla / 9);
                     setInputValue(String(Math.round(sqft * 100) / 100)); setSourceUnit("Sq.Ft");
                     toast.success(`${k} Kanal ${m} Marla ${sr} Sarsai = ${sqft.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq ft (1 Marla = 9 Sarsai)`);
                   }} className="px-4 py-2 bg-ink text-white rounded-xl text-sm font-bold">Use fard size</Button>
                 </div>
                 <Button onClick={async () => {
                   const text = `${inputValue} ${sourceUnit} (${marlaStandard} standard) = ${formatValue(convertedValues["Sq.Ft"])} Sq.Ft · ${formatValue(convertedValues["Marla"])} Marla · ${formatValue(convertedValues["Kanal"])} Kanal · ${formatValue(convertedValues["m²"])} m²`;
                   try { await navigator.clipboard.writeText(text); toast.success("Conversion copied."); }
                   catch { toast.error("Clipboard blocked."); }
                 }} className="px-4 py-2 bg-surface-hover border border-ui-borderSubtle rounded-xl text-sm font-bold">Copy conversion</Button>
               </div>

               <div className="border-t border-ui-borderSubtle pt-6 relative z-10">
                 <p className="text-xs uppercase tracking-widest font-bold text-txt-tertiary mb-3">Quick Select</p>
                 <div className="flex flex-wrap gap-2">
                    {[
                      { val: "3", unit: "Marla" as keyof UnitMap, label: "3 Marla" },
                      { val: "5", unit: "Marla" as keyof UnitMap, label: "5 Marla" },
                      { val: "7", unit: "Marla" as keyof UnitMap, label: "7 Marla" },
                      { val: "10", unit: "Marla" as keyof UnitMap, label: "10 Marla" },
                      { val: "1", unit: "Kanal" as keyof UnitMap, label: "1 Kanal" },
                      { val: "2", unit: "Kanal" as keyof UnitMap, label: "2 Kanal" },
                    ].map(btn => (
                      <Button 
                        key={btn.label}
                        onClick={() => handleQuickSelect(btn.val, btn.unit)}
                        className="px-3 py-1.5 rounded-lg border border-ui-borderSubtle bg-surface-default/30 text-txt-secondary text-xs font-semibold hover:border-accent-500/50 hover:bg-accent-500/10 transition-colors"
                      >
                        {btn.label}
                      </Button>
                    ))}
                 </div>
               </div>

            </div>
          </div>

          <div className="lg:col-span-5 h-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 h-full">
               {allUnits.map(u => {
                 const isSource = sourceUnit === u;
                 return (
                   <div 
                     key={u} 
                     className={`flex flex-col justify-center p-5 rounded-2xl border transition-all ${isSource ? 'bg-accent-500/5 border-accent-500/60 shadow-brand-lg' : 'bg-surface-default border-ui-borderSubtle'}`}
                   >
                     <span className="text-xs uppercase tracking-widest font-bold text-txt-tertiary mb-1">{u}</span>
                     <span className={`text-xl md:text-2xl font-black ${isSource ? 'text-accent-700' : 'text-txt-primary'}`}>
                       {formatValue(convertedValues[u])}
                     </span>
                   </div>
                 )
               })}
            </div>
          </div>
        </div>

        {/* Funnel CTA */}
        <a href="/calculators/quantity-estimation/house-construction-cost-calculator" className="block max-w-4xl mx-auto mb-20 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl p-6 md:p-8 hover:shadow-[0_0_40px_rgba(242,164,19,0.3)] transition-all transform hover:-translate-y-1 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-txt-primary mb-2 tracking-tight">Know your plot size?</h3>
              <p className="text-txt-primary/70 font-bold max-w-xl">Find out exactly how much it will cost to build your house in Pakistan using 2026 rates for Lahore, Karachi, or Islamabad.</p>
            </div>
            <div className="w-14 h-14 bg-surface-default rounded-full flex items-center justify-center shrink-0">
               <ArrowRight className="w-6 h-6 text-accent-700" />
            </div>
          </div>
        </a>

        {/* Section 4: Static SEO Content */}
        <div className="mb-20">
           <h2 className="text-2xl md:text-3xl font-bold text-txt-primary mb-6 border-b border-ui-borderSubtle pb-4">
             Understanding Marla and Kanal Land Measurements
           </h2>
           <p className="text-txt-secondary mb-8 max-w-4xl leading-relaxed">
             In Pakistan, India, and Bangladesh, traditional land measurement units like Marla and Kanal are still predominant in real estate plot listings. 
             A critical detail often overlooked is that the exact dimension of a "Marla" differs by region. 
             In Punjab (Lahore, Faisalabad), the standardized standard Marla is <strong>272.25 Sq.Ft</strong>. 
             However, housing societies in Islamabad, Karachi, and KPK often utilize a localized <strong>225 Sq.Ft</strong> Marla.
           </p>

           <div className="overflow-x-auto rounded-xl border border-ui-borderSubtle bg-surface-default shadow-brand-lg">
              <table className="w-full text-left text-sm text-txt-secondary">
                <thead className="bg-surface-default text-txt-secondary uppercase font-bold text-xs tracking-wider border-b border-ui-borderSubtle">
                  <tr>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Equivalent in Punjab Standard</th>
                    <th className="px-6 py-4">Equivalent in KPK/Islamabad Std</th>
                    <th className="px-6 py-4">Equivalent in metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/60">
                  <tr className="hover:bg-surface-default/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-txt-primary">1 Marla</td>
                    <td className="px-6 py-4 text-accent-700 font-bold">272.25 Sq.Ft / 30.25 Sq.Yd</td>
                    <td className="px-6 py-4 text-accent-700 font-bold">225.00 Sq.Ft / 25.00 Sq.Yd</td>
                    <td className="px-6 py-4">~25.29 m²</td>
                  </tr>
                  <tr className="hover:bg-surface-default/30 transition-colors bg-surface-default/30">
                    <td className="px-6 py-4 font-bold text-txt-primary">1 Kanal (20 Marlas)</td>
                    <td className="px-6 py-4">5,445 Sq.Ft / 605 Sq.Yd</td>
                    <td className="px-6 py-4">4,500 Sq.Ft / 500 Sq.Yd</td>
                    <td className="px-6 py-4">~505.85 m²</td>
                  </tr>
                  <tr className="hover:bg-surface-default/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-txt-primary">1 Acre (8 Kanals)</td>
                    <td className="px-6 py-4">43,560 Sq.Ft / 4,840 Sq.Yd</td>
                    <td className="px-6 py-4">36,000 Sq.Ft / 4,000 Sq.Yd</td>
                    <td className="px-6 py-4">~4046.86 m²</td>
                  </tr>
                  <tr className="hover:bg-surface-default/30 transition-colors bg-surface-default/30">
                    <td className="px-6 py-4 font-bold text-txt-primary">1 Murabba (25 Acres)</td>
                    <td className="px-6 py-4">1,089,000 Sq.Ft / 121,000 Sq.Yd</td>
                    <td className="px-6 py-4">- </td>
                    <td className="px-6 py-4">~101,171.4 m²</td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>

        <GlobalFAQ
          moduleId="marla-converter"
          faqs={[
            { question: "How many square feet is 1 marla?", answer: "272.25 sq ft under the Punjab revenue standard, or 225 sq ft under the society standard used by most housing societies. Pick the standard above before converting — the same plot differs by about 17%." },
            { question: "How many marla is 1 kanal?", answer: "20 marla = 1 kanal, under both standards. 1 kanal is 5,445 sq ft (Punjab) or 4,500 sq ft (society)." },
            { question: "What is a sarsai?", answer: "A sarsai is 1/9 of a marla — 30.25 sq ft (Punjab) or 25 sq ft (society). Revenue records (fard) write land as Kanal – Marla – Sarsai." },
            { question: "How do I convert a plot's length and width to marla?", answer: "Multiply length × width in feet to get square feet, then divide by 272.25 (Punjab) or 225 (society). The plot-dimension box above does it for you." },
          ]}
        />

        {/* Section 6: Standard Footer */}
        <ToolPageFooter 
           toolName="Area Plot Converter (Marla, Kanal, Sq.Ft)"
           standards={["Punjab Land Revenue Act 1887", "KPK Local Measurement Laws"]}
           formulaDescription="1 Karam = 5.5 Ft. 1 Marla (Punjab) = 1 Sirsai x 9 = 272.25 Sq.Ft. Metric Conversion: 1 m² = 10.7639 Sq.Ft."
           difficulty="Beginner"
           lastUpdated="November 2026"
           category="Quantity Estimation"
        />

      </div>
    </div>
  );
}
