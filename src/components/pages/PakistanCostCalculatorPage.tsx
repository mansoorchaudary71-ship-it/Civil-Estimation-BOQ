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
  ClipboardList
} from 'lucide-react';
import ToolPageFooter from '../ToolPageFooter';

const cityRates = {
  "Lahore": {
    "Grey Structure": [2800, 3200],
    "Standard Finish": [3800, 4500],
    "Premium Finish": [4800, 5500],
    "Luxury": [6000, 7500]
  },
  "Islamabad": {
    "Grey Structure": [3000, 3500],
    "Standard Finish": [4200, 5000],
    "Premium Finish": [5500, 6500],
    "Luxury": [7000, 9000]
  },
  "Karachi": {
    "Grey Structure": [2600, 3000],
    "Standard Finish": [3600, 4200],
    "Premium Finish": [4500, 5200],
    "Luxury": [5500, 7000]
  },
  "Faisalabad": {
    "Grey Structure": [2700, 3100],
    "Standard Finish": [3700, 4300],
    "Premium Finish": [4500, 5200],
    "Luxury": [5800, 7000]
  },
  "Multan": {
    "Grey Structure": [2700, 3100],
    "Standard Finish": [3700, 4300],
    "Premium Finish": [4500, 5200],
    "Luxury": [5800, 7000]
  },
  "Other": {
    "Grey Structure": [2700, 3100],
    "Standard Finish": [3700, 4300],
    "Premium Finish": [4500, 5200],
    "Luxury": [5800, 7000]
  }
};

const unitMultipliers = {
  "Sq.Ft": 1,
  "Sq.Yards": 9,
  "Marla": 272.25,
  "Kanal": 5445
};

const floorModifiers = {
  "G": 0.75,
  "G+1": 1.5,
  "G+2": 2.25,
  "G+3": 3.0,
  "G+4+": 3.75
};

export default function PakistanCostCalculatorPage() {
  const [area, setArea] = useState<number>(5);
  const [unit, setUnit] = useState<keyof typeof unitMultipliers>("Marla");
  const [city, setCity] = useState("Lahore");
  const [constructionType, setConstructionType] = useState("Standard Finish");
  const [floors, setFloors] = useState<keyof typeof floorModifiers>("G+1");
  const [hasBasement, setHasBasement] = useState(false);

  // Compute total covered area
  const baseAreaSqft = area * unitMultipliers[unit];
  const coverageRatio = floorModifiers[floors] + (hasBasement ? 0.75 : 0);
  const totalCoveredArea = baseAreaSqft * coverageRatio;

  // Compute costs
  const rates = cityRates[city as keyof typeof cityRates][constructionType as keyof typeof cityRates["Lahore"]];
  const minCost = totalCoveredArea * rates[0];
  const maxCost = totalCoveredArea * rates[1];
  const avgCost = Math.round((minCost + maxCost) / 2);

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
    <div className="min-h-screen bg-[#FFFFFF] font-sans pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-12 md:pt-20 pb-16">
        
        {/* Section 1: H1 SEO Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1.5 md:py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 2025 Rates
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-white border border-slate-200 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Pakistan
            </span>
            <span className="px-3 py-1.5 md:py-1 bg-white border border-slate-200 rounded-full text-[10px] uppercase tracking-wider font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Local Units (Marla/Kanal)
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
            House Construction Cost <br className="hidden md:block"/>
            <span className="text-amber-500">Calculator Pakistan 2025</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Estimate accurate building costs in PKR using live 2025 rates for Lahore, Karachi, and Islamabad. 
            Supports Marla, Kanal, and direct Sq.Ft layouts with options for Grey Structure to Luxury finishes.
          </p>
        </div>

        {/* Calculator Body - Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          
          {/* Section 2: Inputs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">1</div>
                 <h2 className="text-xl font-bold text-slate-900">Project Dimensions & Location</h2>
              </div>

              {/* Area & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Plot Area</label>
                  <><label htmlFor="a11y-input-577" className="sr-only">Input</label>
<input id="a11y-input-577" 
                    type="number" inputMode="decimal" 
                    value={area} 
                    onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#FFFFFF] border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all font-semibold"
                  /></>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Measurement Unit</label>
                  <div className="flex bg-[#FFFFFF] p-1 rounded-xl border border-slate-200">
                     {Object.keys(unitMultipliers).map((u) => (
                       <button
                         key={u}
                         onClick={() => setUnit(u as keyof typeof unitMultipliers)}
                         className={`flex-1 text-xs py-2.5 rounded-lg font-bold transition-colors ${unit === u ? 'bg-amber-500 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                       >
                         {u}
                       </button>
                     ))}
                  </div>
                  {unit === "Marla" && <p className="text-[10px] text-amber-500 mt-2 font-medium">*Using Punjab std: 1 Marla = 272.25 Sq.Ft</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                 <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">City</label>
                    <select 
                       value={city}
                       onChange={(e) => setCity(e.target.value)}
                       className="w-full bg-[#FFFFFF] border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 transition-all appearance-none font-semibold cursor-pointer"
                    >
                      {Object.keys(cityRates).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Floors</label>
                    <div className="flex gap-2">
                       {Object.keys(floorModifiers).map(f => (
                          <button
                            key={f}
                            onClick={() => setFloors(f as keyof typeof floorModifiers)}
                            className={`flex-1 text-sm py-2.5 rounded-xl border font-bold transition-all ${floors === f ? 'bg-[#FFFFFF] border-amber-500 text-amber-500' : 'bg-[#FFFFFF] border-slate-200 text-slate-600 hover:border-slate-500 hover:text-slate-900'}`}
                          >
                            {f}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Basement Toggle */}
              <button 
                onClick={() => setHasBasement(!hasBasement)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${hasBasement ? 'bg-amber-500/5 border-amber-500/40 text-amber-500' : 'bg-[#FFFFFF] border-slate-200 text-slate-600 hover:border-slate-600 hover:text-slate-900'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${hasBasement ? 'border-amber-500' : 'border-slate-500'}`}>
                    {hasBasement && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                  </div>
                  <span className="font-bold">Include Basement</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-50/20 rounded-md">+75% base area</span>
              </button>

            </div>

            <div className="bg-[#FFFFFF] border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">2</div>
                 <h2 className="text-xl font-bold text-slate-900">Construction Quality</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(cityRates["Lahore"]).map(type => {
                  const r = cityRates[city as keyof typeof cityRates][type as keyof typeof cityRates["Lahore"]];
                  return (
                    <button
                      key={type}
                      onClick={() => setConstructionType(type)}
                      className={`text-left p-5 rounded-xl border transition-all ${constructionType === type ? 'bg-amber-500/5 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-[#FFFFFF] border-slate-200 hover:border-slate-500'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold ${constructionType === type ? 'text-amber-500' : 'text-slate-200'}`}>{type}</span>
                        {constructionType === type && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                      </div>
                      <span className="text-sm font-mono text-slate-600 block mt-1">PKR {r[0].toLocaleString()} - {r[1].toLocaleString()} <span className="text-xs text-slate-500">/sqft</span></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Results Panel */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-gradient-to-b from-[#152136] to-[#FFFFFF] border border-amber-500/20 rounded-3xl p-4 sm:p-8 md:p-8 sticky top-28 shadow-xl flex flex-col h-full overflow-hidden">
              
              <div className="mb-8">
                <p className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-3">Estimated Total Cost</p>
                <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">
                   PKR {formatLakhCrore(minCost)} <span className="text-slate-500 font-medium text-2xl">to</span> <br className="hidden md:block"/> {formatLakhCrore(maxCost)}
                </h3>
                <p className="text-slate-600 mt-4 text-sm font-medium flex justify-between items-center bg-[#FFFFFF]/50 rounded-lg py-2 px-3">
                  <span>Covered Area:</span>
                  <span className="text-slate-900 font-bold">{formatPKR(totalCoveredArea)} Sq.Ft</span>
                </p>
                <p className="text-slate-600 mt-2 text-sm font-medium flex justify-between items-center bg-[#FFFFFF]/50 rounded-lg py-2 px-3">
                  <span>Applied Rate:</span>
                  <span className="text-amber-500 font-bold font-mono">PKR {rates[0].toLocaleString()} - {rates[1].toLocaleString()} /sqft</span>
                </p>
              </div>

              <div className="h-px w-full bg-white/80 mb-6"></div>

              {/* Breakdown Table */}
              <div className="flex-1 mb-8">
                 <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                   <Grid className="w-4 h-4 text-amber-500" /> Cost Breakdown ({constructionType})
                 </h4>
                 <div className="space-y-3">
                    {getBreakdown(constructionType).map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                         <div className="flex justify-between items-end text-sm">
                            <span className="text-slate-700 font-medium">{item.label}</span>
                            <span className="text-xs font-mono font-bold text-amber-400 text-right">PKR {formatLakhCrore(avgCost * (item.percentage/100))}</span>
                         </div>
                         <div className="w-full bg-[#FFFFFF] h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-[#FFFFFF] border border-amber-200 rounded-xl p-4 flex gap-3 items-start shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-600">
                  <strong className="text-slate-700">Disclaimer:</strong> These are 2025 standard market rates. Exact costs vary based on design complexity, material inflation, transportation, and plot conditions. It does not include boundary wall, architect fee, or external utility connections.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Static SEO Content */}
        <div className="mb-20">
           <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">
             Construction Cost Breakdown Pakistan (2025 Rates)
           </h2>
           <p className="text-slate-600 mb-8 max-w-4xl leading-relaxed">
             Material inflation and labor rates change frequently across provinces. For 2025, 
             the base rate for a standard finish house largely hovers around PKR 3,800 to PKR 4,500 per sq.ft across major hubs. 
             Grey structure materials (bricks, cement, steel) account for approximately 45-50% of the total budget, while finishing touches and labor make up the rest. 
             Refer to the precise square foot ranges by city below:
           </p>

           <div className="overflow-x-auto rounded-xl border border-slate-200 bg-[#FFFFFF] shadow-xl">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#FFFFFF] text-slate-600 uppercase font-bold text-xs tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Grey Structure (PKR/sqft)</th>
                    <th className="px-6 py-4">Standard Finish (PKR/sqft)</th>
                    <th className="px-6 py-4">Premium Finish (PKR/sqft)</th>
                    <th className="px-6 py-4">Luxury Finish (PKR/sqft)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">Lahore</td>
                    <td className="px-6 py-4">2,800 – 3,200</td>
                    <td className="px-6 py-4">3,800 – 4,500</td>
                    <td className="px-6 py-4">4,800 – 5,500</td>
                    <td className="px-6 py-4 text-amber-500 font-semibold">6,000 – 7,500</td>
                  </tr>
                  <tr className="hover:bg-white/30 transition-colors bg-[#FFFFFF]/30">
                    <td className="px-6 py-4 font-bold text-slate-900">Islamabad</td>
                    <td className="px-6 py-4">3,000 – 3,500</td>
                    <td className="px-6 py-4">4,200 – 5,000</td>
                    <td className="px-6 py-4">5,500 – 6,500</td>
                    <td className="px-6 py-4 text-amber-500 font-semibold">7,000 – 9,000</td>
                  </tr>
                  <tr className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">Karachi</td>
                    <td className="px-6 py-4">2,600 – 3,000</td>
                    <td className="px-6 py-4">3,600 – 4,200</td>
                    <td className="px-6 py-4">4,500 – 5,200</td>
                    <td className="px-6 py-4 text-amber-500 font-semibold">5,500 – 7,000</td>
                  </tr>
                  <tr className="hover:bg-white/30 transition-colors bg-[#FFFFFF]/30">
                    <td className="px-6 py-4 font-bold text-slate-900">Other Cities (Avg)</td>
                    <td className="px-6 py-4">2,700 – 3,100</td>
                    <td className="px-6 py-4">3,700 – 4,300</td>
                    <td className="px-6 py-4">4,500 – 5,200</td>
                    <td className="px-6 py-4 text-amber-500 font-semibold">5,800 – 7,000</td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>

        {/* Section 5: Related Tools */}
        <div className="mb-20">
           <h3 className="text-xl font-bold text-slate-900 mb-6">Explore Professional Evaluation Tools</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { title: "BOQ Generator", desc: "Instantly create detailed Bills of Quantities.", icon: ClipboardList, target: "#" },
                { title: "Material Takeoff", desc: "Systematic quantity extraction workflows.", icon: Hammer, target: "#" },
                { title: "Concrete Mix Design", desc: "IS 10262:2019 compliant mix calculations.", icon: Layers, target: "#" },
                { title: "Steel Weight Estimator", desc: "Calculate precise rebar weights & lengths.", icon: Grid, target: "#" }
              ].map((tool, idx) => (
                 <a key={idx} href={tool.target} className="bg-[#FFFFFF] border border-slate-200 hover:border-amber-500/40 rounded-2xl p-5 group transition-all overflow-hidden">
                    <div className="bg-slate-50/50 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500/10 transition-colors">
                      <tool.icon className="w-5 h-5 text-slate-600 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-1 group-hover:text-amber-50 transition-colors">{tool.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{tool.desc}</p>
                 </a>
              ))}
           </div>
        </div>

        {/* Section 6: Standard Footer */}
        <ToolPageFooter 
           toolName="House Construction Cost Calculator Pakistan 2025"
           standards={["BCP-2021 (Building Code of Pakistan)", "PEC Standard Formatting", "Punjab By-laws"]}
           formulaDescription="Covered Area = Plot Area × Floor Multiplier. Cost = Covered Area × Regional Standard Finish Rate/Sqft. Breakdown applies probabilistic averages for Material/Logistics scaling in Pakistani markets."
           difficulty="Beginner"
           lastUpdated="February 2025"
           category="Quantity Estimation"
        />

      </div>
    </div>
  );
}
