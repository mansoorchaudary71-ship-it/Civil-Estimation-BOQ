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
    <div className="min-h-screen bg-[#FFFFFF] font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-20 pb-16">
        
        {/* Section 1: H1 SEO Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 md:py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5" /> Land Measurement
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-white border border-slate-200 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Pakistan / India
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-white border border-slate-200 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Real-time Converter
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Area Plot Converter: <br className="hidden md:block"/>
            <span className="text-amber-500">Marla & Kanal to Sq.Ft</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Instantly convert plot sizes between Marla, Kanal, Square Feet, and Acres. 
            Supports both Punjab (272.25 Sq.Ft) and KPK (225 Sq.Ft) regional Marla standards.
            Perfect for real estate professionals and civil engineers.
          </p>
        </div>

        {/* Section 2 & 3: Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Standard Toggle & Master Input */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#152136] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
               {/* Background Accent */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
               
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                   <Grid className="w-5 h-5 text-amber-500" /> Enter Plot Size
                 </h2>
                 <div className="bg-[#FFFFFF] p-1 rounded-xl border border-slate-200 flex text-sm">
                    <button 
                      onClick={() => setMarlaStandard("Punjab")}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${marlaStandard === "Punjab" ? "bg-amber-500 text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      Punjab (272.25 Sq.Ft)
                    </button>
                    <button 
                      onClick={() => setMarlaStandard("KPK")}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${marlaStandard === "KPK" ? "bg-amber-500 text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      KPK (225 Sq.Ft)
                    </button>
                 </div>
               </div>

               <div className="relative mb-6 z-10">
                 <><label htmlFor="a11y-input-576" className="sr-only">0</label>
<input id="a11y-input-576" 
                   type="number" inputMode="decimal"
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   className="w-full bg-[#FFFFFF]/80 border-2 border-slate-200 focus:border-amber-500 rounded-2xl px-6 py-6 text-4xl md:text-6xl font-black text-slate-900 focus:outline-none transition-all shadow-inner overflow-hidden"
                   placeholder="0"
                 /></>
               </div>

               {/* Source Unit Selector */}
               <div className="flex flex-wrap gap-2 relative z-10 mb-8">
                  {allUnits.map(u => (
                    <button 
                      key={u}
                      onClick={() => setSourceUnit(u)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${sourceUnit === u ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-[#FFFFFF] border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'}`}
                    >
                      {u}
                    </button>
                  ))}
               </div>

               <div className="border-t border-slate-200 pt-6 relative z-10">
                 <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-3">Quick Select</p>
                 <div className="flex flex-wrap gap-2">
                    {[
                      { val: "3", unit: "Marla" as keyof UnitMap, label: "3 Marla" },
                      { val: "5", unit: "Marla" as keyof UnitMap, label: "5 Marla" },
                      { val: "7", unit: "Marla" as keyof UnitMap, label: "7 Marla" },
                      { val: "10", unit: "Marla" as keyof UnitMap, label: "10 Marla" },
                      { val: "1", unit: "Kanal" as keyof UnitMap, label: "1 Kanal" },
                      { val: "2", unit: "Kanal" as keyof UnitMap, label: "2 Kanal" },
                    ].map(btn => (
                      <button 
                        key={btn.label}
                        onClick={() => handleQuickSelect(btn.val, btn.unit)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white/30 text-slate-700 text-xs font-semibold hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors"
                      >
                        {btn.label}
                      </button>
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
                     className={`flex flex-col justify-center p-5 rounded-2xl border transition-all ${isSource ? 'bg-amber-500/5 border-amber-500/60 shadow-lg' : 'bg-[#FFFFFF] border-slate-200'}`}
                   >
                     <span className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">{u}</span>
                     <span className={`text-xl md:text-2xl font-black ${isSource ? 'text-amber-500' : 'text-slate-900'}`}>
                       {formatValue(convertedValues[u])}
                     </span>
                   </div>
                 )
               })}
            </div>
          </div>
        </div>

        {/* Funnel CTA */}
        <a href="/calculators/quantity-estimation/house-construction-cost-calculator" className="block max-w-4xl mx-auto mb-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 md:p-8 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-1 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Know your plot size?</h3>
              <p className="text-slate-900/70 font-bold max-w-xl">Find out exactly how much it will cost to build your house in Pakistan using live 2025 rates for Lahore, Karachi, or Islamabad.</p>
            </div>
            <div className="w-14 h-14 bg-[#FFFFFF] rounded-full flex items-center justify-center shrink-0">
               <ArrowRight className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </a>

        {/* Section 4: Static SEO Content */}
        <div className="mb-20">
           <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">
             Understanding Marla and Kanal Land Measurements
           </h2>
           <p className="text-slate-600 mb-8 max-w-4xl leading-relaxed">
             In Pakistan, India, and Bangladesh, traditional land measurement units like Marla and Kanal are still predominant in real estate plot listings. 
             A critical detail often overlooked is that the exact dimension of a "Marla" differs by region. 
             In Punjab (Lahore, Faisalabad), the standardized standard Marla is <strong>272.25 Sq.Ft</strong>. 
             However, housing societies in Islamabad, Karachi, and KPK often utilize a localized <strong>225 Sq.Ft</strong> Marla.
           </p>

           <div className="overflow-x-auto rounded-xl border border-slate-200 bg-[#FFFFFF] shadow-xl">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#FFFFFF] text-slate-600 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Equivalent in Punjab Standard</th>
                    <th className="px-6 py-4">Equivalent in KPK/Islamabad Std</th>
                    <th className="px-6 py-4">Equivalent in metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">1 Marla</td>
                    <td className="px-6 py-4 text-amber-500 font-bold">272.25 Sq.Ft / 30.25 Sq.Yd</td>
                    <td className="px-6 py-4 text-amber-500 font-bold">225.00 Sq.Ft / 25.00 Sq.Yd</td>
                    <td className="px-6 py-4">~25.29 m²</td>
                  </tr>
                  <tr className="hover:bg-white/30 transition-colors bg-[#FFFFFF]/30">
                    <td className="px-6 py-4 font-bold text-slate-900">1 Kanal (20 Marlas)</td>
                    <td className="px-6 py-4">5,445 Sq.Ft / 605 Sq.Yd</td>
                    <td className="px-6 py-4">4,500 Sq.Ft / 500 Sq.Yd</td>
                    <td className="px-6 py-4">~505.85 m²</td>
                  </tr>
                  <tr className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">1 Acre (8 Kanals)</td>
                    <td className="px-6 py-4">43,560 Sq.Ft / 4,840 Sq.Yd</td>
                    <td className="px-6 py-4">36,000 Sq.Ft / 4,000 Sq.Yd</td>
                    <td className="px-6 py-4">~4046.86 m²</td>
                  </tr>
                  <tr className="hover:bg-white/30 transition-colors bg-[#FFFFFF]/30">
                    <td className="px-6 py-4 font-bold text-slate-900">1 Murabba (25 Acres)</td>
                    <td className="px-6 py-4">1,089,000 Sq.Ft / 121,000 Sq.Yd</td>
                    <td className="px-6 py-4">- </td>
                    <td className="px-6 py-4">~101,171.4 m²</td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>

        {/* Section 6: Standard Footer */}
        <ToolPageFooter 
           toolName="Area Plot Converter (Marla, Kanal, Sq.Ft)"
           standards={["Punjab Land Revenue Act 1887", "KPK Local Measurement Laws"]}
           formulaDescription="1 Karam = 5.5 Ft. 1 Marla (Punjab) = 1 Sirsai x 9 = 272.25 Sq.Ft. Metric Conversion: 1 m² = 10.7639 Sq.Ft."
           difficulty="Beginner"
           lastUpdated="February 2025"
           category="Quantity Estimation"
        />

      </div>
    </div>
  );
}
