import React, { useState, useMemo } from "react";
import { useSettings } from "../../context/SettingsContext";
import { Route, Layers, Droplets, Calculator, MoveRight, Send } from "lucide-react";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { SEO } from "../SEO";

export default function RoadEstimator() {
  const { settings } = useSettings();

  // Geometry
  const [length, setLength] = useState<number | "">(1000); // m
  const [width, setWidth] = useState<number | "">(7.0); // m
  const [camber, setCamber] = useState<number | "">(2.5); // %
  const [shoulderWidth, setShoulderWidth] = useState<number | "">(1.5); // m
  const [shoulderFall, setShoulderFall] = useState<number | "">(3.0); // %
  const [sideSlope, setSideSlope] = useState<number | "">(2.0); // H:1V

  // Thicknesses (mm)
  const [sgT, setSgT] = useState<number | "">(500); // Subgrade
  const [gsbT, setGsbT] = useState<number | "">(200); // GSB
  const [wmmT, setWmmT] = useState<number | "">(250); // WMM
  const [dbmT, setDbmT] = useState<number | "">(90); // DBM
  const [bcT, setBcT] = useState<number | "">(40); // BC

  // Compacted Densities (t/m³)
  const [sgD, setSgD] = useState<number | "">(1.8);
  const [gsbD, setGsbD] = useState<number | "">(2.1);
  const [wmmD, setWmmD] = useState<number | "">(2.25);
  const [dbmD, setDbmD] = useState<number | "">(2.35);
  const [bcD, setBcD] = useState<number | "">(2.4);

  // Bitumen Coats
  const [primeRate, setPrimeRate] = useState<number | "">(1.0); // L/m2
  const [tackRate, setTackRate] = useState<number | "">(0.25); // L/m2
  const [bitumenSG, setBitumenSG] = useState<number | "">(1.01); 

  const results = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    const c = Number(camber) || 0;
    const shW = Number(shoulderWidth) || 0;
    const shF = Number(shoulderFall) || 0;
    const s = Number(sideSlope) || 0;

    const tSG = (Number(sgT) || 0) / 1000;
    const tGSB = (Number(gsbT) || 0) / 1000;
    const tWMM = (Number(wmmT) || 0) / 1000;
    const tDBM = (Number(dbmT) || 0) / 1000;
    const tBC = (Number(bcT) || 0) / 1000;

    // Cross-slope camber calculations
    const halfCarriage = w / 2;
    const riseAtCenter = halfCarriage * (c / 100);
    const slantCarriage = Math.sqrt(halfCarriage * halfCarriage + riseAtCenter * riseAtCenter);
    const dropAtShoulder = shW * (shF / 100);
    const slantShoulder = Math.sqrt(shW * shW + dropAtShoulder * dropAtShoulder);
    const actualSurfaceWidth = (slantCarriage + slantShoulder) * 2;

    // Layer widths (Top and Bottom for trapezoid)
    // BC (topmost) includes shoulders? Usually BC/DBM might be just on carriageway, but let's assume it spans carriageway.
    // Wait, typical Indian standard (IRC): Carriageway + paved shoulders if any. For simplicity modeling them as spanning W+2*shW
    // Actually, let's assume BC and DBM span the paved width (Carriageway). 
    // GSB and WMM span Carriageway + Shoulders.
    // Let's use standard full width for base layers:
    
    // Top width of BC
    const wBcTop = w;
    const wBcBot = wBcTop + 2 * s * tBC;
    
    // Top width of DBM
    const wDbmTop = wBcBot; // DBM extends below BC
    const wDbmBot = wDbmTop + 2 * s * tDBM;

    // Top width of WMM (WMM supports DBM + Shoulders). 
    // So WMM top width = wDbmBot + 2*shW
    const wWmmTop = wDbmBot + 2 * shW;
    const wWmmBot = wWmmTop + 2 * s * tWMM;

    // Top width of GSB
    const wGsbTop = wWmmBot; 
    const wGsbBot = wGsbTop + 2 * s * tGSB;

    // Top width of SG
    const wSgTop = wGsbBot;
    const wSgBot = wSgTop + 2 * s * tSG;

    // Areas
    const areaBC = ((wBcTop + wBcBot) / 2) * tBC;
    const areaDBM = ((wDbmTop + wDbmBot) / 2) * tDBM;
    const areaWMM = ((wWmmTop + wWmmBot) / 2) * tWMM;
    const areaGSB = ((wGsbTop + wGsbBot) / 2) * tGSB;
    const areaSG = ((wSgTop + wSgBot) / 2) * tSG;

    // Volumes
    const volBC = areaBC * l;
    const volDBM = areaDBM * l;
    const volWMM = areaWMM * l;
    const volGSB = areaGSB * l;
    const volSG = areaSG * l;

    // Tonnages based on exact compacted densities
    const tonBC = volBC * (Number(bcD) || 0);
    const tonDBM = volDBM * (Number(dbmD) || 0);
    const tonWMM = volWMM * (Number(wmmD) || 0);
    const tonGSB = volGSB * (Number(gsbD) || 0);
    const tonSG = volSG * (Number(sgD) || 0);

    // Bitumen Coats
    // Prime Coat is usually applied on top of WMM
    const primeArea = wWmmTop * l;
    const primeLiters = primeArea * (Number(primeRate) || 0);
    
    // Tack Coat is usually applied between bituminous layers (WMM->DBM and DBM->BC)
    const tackArea1 = wDbmTop * l; // between WMM/DBM (sometimes prime is enough here, but let's say tack is on DBM for BC)
    const tackArea2 = wBcTop * l; // between DBM and BC
    const tackLiters = (tackArea1 + tackArea2) * (Number(tackRate) || 0);

    const primeTons = (primeLiters * (Number(bitumenSG) || 0)) / 1000;
    const tackTons = (tackLiters * (Number(bitumenSG) || 0)) / 1000;

    return {
      tBC, tDBM, tWMM, tGSB, tSG,
      wBcTop, wBcBot, wDbmTop, wDbmBot, wWmmTop, wWmmBot, wGsbTop, wGsbBot, wSgTop, wSgBot,
      volBC, volDBM, volWMM, volGSB, volSG,
      tonBC, tonDBM, tonWMM, tonGSB, tonSG,
      primeLiters, tackLiters, primeTons, tackTons,
      riseAtCenter
    };
  }, [length, width, camber, shoulderWidth, shoulderFall, sideSlope, sgT, gsbT, wmmT, dbmT, bcT, sgD, gsbD, wmmD, dbmD, bcD, primeRate, tackRate, bitumenSG]);

  const sendToBOQ = () => {
    const items = [
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "02 - Site Work & Earthwork",
        description: `Subgrade Preparation (Compacted to ${sgD} t/m³)`,
        unit: "m³",
        quantity: results.volSG,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "02 - Site Work & Earthwork",
        description: `Granular Sub-Base (GSB)`,
        unit: "Tons",
        quantity: results.tonGSB,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "03 - Concrete",
        description: `Wet Mix Macadam (WMM)`,
        unit: "Tons",
        quantity: results.tonWMM,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "09 - Finishes",
        description: `Dense Bituminous Macadam (DBM)`,
        unit: "Tons",
        quantity: results.tonDBM,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "09 - Finishes",
        description: `Bituminous Concrete (BC)`,
        unit: "Tons",
        quantity: results.tonBC,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "09 - Finishes",
        description: `Prime Coat on Granular Base`,
        unit: "Tons",
        quantity: results.primeTons,
        rate: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        division: "09 - Finishes",
        description: `Tack Coat on Bituminous Layers`,
        unit: "Tons",
        quantity: results.tackTons,
        rate: 0
      }
    ];
    window.dispatchEvent(new CustomEvent('fill-boq', { detail: items }));
    alert("Material schedule sent to BOQ Generator!");
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in">
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-[24px] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Route className="w-6 h-6 text-emerald-600" />
                    Flexible Pavement Design Engine
                </h2>
                <button onClick={sendToBOQ} className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                    <Send className="w-4 h-4" /> Send to BOQ
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Road Geometry</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Total Length" unit="m" value={length} onChange={setLength} />
                            <NumberInput label="Carriageway W" unit="m" value={width} onChange={setWidth} />
                            <NumberInput label="Shoulder W (1 Side)" unit="m" value={shoulderWidth} onChange={setShoulderWidth} />
                            <NumberInput label="Side Slope (H:1V)" unit="H" value={sideSlope} onChange={setSideSlope} />
                            <NumberInput label="Crown Camber" unit="%" value={camber} onChange={setCamber} />
                            <NumberInput label="Shoulder Fall" unit="%" value={shoulderFall} onChange={setShoulderFall} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 bg-slate-50 p-2 rounded flex justify-between">
                            <span>Layer Thicknesses</span>
                            <span className="text-slate-500 font-normal">mm</span>
                        </h3>
                        <div className="space-y-3">
                            <NumberInput label="Bituminous Concrete (BC)" unit="mm" value={bcT} onChange={setBcT} />
                            <NumberInput label="Dense Bitumen Macadam (DBM)" unit="mm" value={dbmT} onChange={setDbmT} />
                            <NumberInput label="Wet Mix Macadam (WMM)" unit="mm" value={wmmT} onChange={setWmmT} />
                            <NumberInput label="Granular Sub-Base (GSB)" unit="mm" value={gsbT} onChange={setGsbT} />
                            <NumberInput label="Compacted Sub-grade" unit="mm" value={sgT} onChange={setSgT} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                    <MaterialSummary 
                        title="Mass-Haul Estimations"
                        totalLabel="Total Hot Mix Asphalt (BC + DBM)"
                        totalValue={(results.tonBC + results.tonDBM).toFixed(1)}
                        totalUnit="Tons"
                        relatedToolIds={[]}
                        className="mb-0"
                    >
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                                    <span>Pavement Structure Volumes</span>
                                </h4>
                                <div className="space-y-2 text-sm font-mono">
                                    <div className="flex justify-between"><span>BC Volume:</span> <span className="font-bold">{results.volBC.toFixed(1)} m³</span></div>
                                    <div className="flex justify-between"><span>DBM Volume:</span> <span className="font-bold">{results.volDBM.toFixed(1)} m³</span></div>
                                    <div className="flex justify-between"><span>WMM Volume:</span> <span className="font-bold">{results.volWMM.toFixed(1)} m³</span></div>
                                    <div className="flex justify-between"><span>GSB Volume:</span> <span className="font-bold">{results.volGSB.toFixed(1)} m³</span></div>
                                    <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200 mt-2"><span>Subgrade Fill:</span> <span>{results.volSG.toFixed(1)} m³</span></div>
                                </div>
                            </div>
                            
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                                    <span>Compacted Tonnage Outputs</span>
                                </h4>
                                <div className="space-y-2 text-sm font-mono text-emerald-900">
                                    <div className="flex justify-between"><span>BC Tonnage:</span> <span className="font-bold">{results.tonBC.toFixed(1)} T</span></div>
                                    <div className="flex justify-between"><span>DBM Tonnage:</span> <span className="font-bold">{results.tonDBM.toFixed(1)} T</span></div>
                                    <div className="flex justify-between"><span>WMM Tonnage:</span> <span className="font-bold">{results.tonWMM.toFixed(1)} T</span></div>
                                    <div className="flex justify-between"><span>GSB Tonnage:</span> <span className="font-bold">{results.tonGSB.toFixed(1)} T</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Prime Coat</p>
                                    <div className="flex items-end justify-between font-mono text-sm">
                                        <span className="text-blue-600">@ {Number(primeRate)} L/m²</span>
                                        <span className="font-bold text-blue-900">{results.primeTons.toFixed(2)} Tons</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Tack Coat</p>
                                    <div className="flex items-end justify-between font-mono text-sm">
                                        <span className="text-blue-600">@ {Number(tackRate)} L/m²</span>
                                        <span className="font-bold text-blue-900">{results.tackTons.toFixed(2)} Tons</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MaterialSummary>

                    {/* Compacted Densities Config */}
                    <div className="p-5 border border-slate-200 rounded-3xl bg-slate-50 overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-500" />
                            Compacted Densities (t/m³)
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">BC</label>
                                <><label htmlFor="a11y-input-456" className="sr-only">Input</label>
<input id="a11y-input-456" type="number" inputMode="decimal" step="0.05" value={bcD} onChange={(e) => setBcD(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-sm font-semibold focus:outline-none" /></>
                            </div>
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">DBM</label>
                                <><label htmlFor="a11y-input-457" className="sr-only">Input</label>
<input id="a11y-input-457" type="number" inputMode="decimal" step="0.05" value={dbmD} onChange={(e) => setDbmD(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-sm font-semibold focus:outline-none" /></>
                            </div>
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">WMM</label>
                                <><label htmlFor="a11y-input-458" className="sr-only">Input</label>
<input id="a11y-input-458" type="number" inputMode="decimal" step="0.05" value={wmmD} onChange={(e) => setWmmD(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-sm font-semibold focus:outline-none" /></>
                            </div>
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">GSB</label>
                                <><label htmlFor="a11y-input-459" className="sr-only">Input</label>
<input id="a11y-input-459" type="number" inputMode="decimal" step="0.05" value={gsbD} onChange={(e) => setGsbD(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-sm font-semibold focus:outline-none" /></>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
