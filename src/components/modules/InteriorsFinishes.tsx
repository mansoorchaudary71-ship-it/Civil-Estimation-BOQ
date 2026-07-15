import React, { useState } from "react";
import { Paintbrush, Hammer, LayoutGrid, Bug, AppWindow, PaintBucket, ChevronDown, ChevronUp, Trees } from "lucide-react";
import { cn } from "../../lib/utils";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { DetailedCalculationDisplay } from "../ui/DetailedCalculationDisplay";

export default function InteriorsFinishesEstimator() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tiles: true,
    paint: false,
    doorsWindows: false,
    wood: false,
    termite: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const AccordionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: any }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors focus:outline-none rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-[16px]">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800">{title}</h3>
      </div>
      {openSections[id] ? (
        <ChevronUp className="w-5 h-5 text-slate-600" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );

  return (
    <div className="w-full pb-20 mt-4">
      <div className="w-full md:max-w-4xl md:mx-auto space-y-8 px-4 md:px-0">
        

        <div className="space-y-4">
          <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.02)] border border-slate-200 overflow-hidden transition-all">
            <AccordionHeader id="tiles" title="Tiles & Flooring Calculator" icon={LayoutGrid} />
            {openSections["tiles"] && (
               <div className="p-6 md:p-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <TilesCalculator />
               </div>
            )}
          </div>
          
          <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.02)] border border-slate-200 overflow-hidden transition-all">
            <AccordionHeader id="paint" title="Paint Calculator" icon={Paintbrush} />
            {openSections["paint"] && (
               <div className="p-6 md:p-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <PaintCalculator />
               </div>
            )}
          </div>

          <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.02)] border border-slate-200 overflow-hidden transition-all">
            <AccordionHeader id="doorsWindows" title="Doors & Windows Deductions" icon={AppWindow} />
            {openSections["doorsWindows"] && (
               <div className="p-6 md:p-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <DoorsWindowsCalculator />
               </div>
            )}
          </div>

          <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.02)] border border-slate-200 overflow-hidden transition-all">
            <AccordionHeader id="wood" title="Wood Framing & Carpentry" icon={Trees} />
            {openSections["wood"] && (
               <div className="p-6 md:p-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <WoodFramingCalculator />
               </div>
            )}
          </div>

          <div className="w-full bg-white rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.02)] border border-slate-200 overflow-hidden transition-all">
            <AccordionHeader id="termite" title="Termite Treatment Estimator" icon={Bug} />
            {openSections["termite"] && (
               <div className="p-6 md:p-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <TermiteTreatmentCalculator />
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Calculators ---

function TilesCalculator() {
  const { settings } = useSettings();
  const isSI = settings.measurement === "SI";
  const uArea = isSI ? "m²" : "sq.ft";
  const uLen = isSI ? "m" : "ft";
  
  const [area, setArea] = useState<number | "">("");
  const [perimeter, setPerimeter] = useState<number | "">("");
  const [skirtingHeight, setSkirtingHeight] = useState<number | "">(isSI ? 100 : 4);
  const [doorOpenings, setDoorOpenings] = useState<number | "">(0);
  const [doorWidth, setDoorWidth] = useState<number | "">(isSI ? 0.9 : 3);
  
  const [tileWidth, setTileWidth] = useState<number | "">(isSI ? 600 : 24);
  const [tileLength, setTileLength] = useState<number | "">(isSI ? 600 : 24);
  const [tilesPerBox, setTilesPerBox] = useState<number | "">(4);

  const calculateTiles = () => {
    if (!area || !tileWidth || !tileLength) return null;

    let floorArea = Number(area);
    let perim = Number(perimeter) || 0;
    const sH = Number(skirtingHeight) || 0;
    const sH_m = isSI ? sH / 1000 : sH / 12; // convert to m or ft
    const doors = Number(doorOpenings) || 0;
    const dW = Number(doorWidth) || 0;

    let tW = Number(tileWidth);
    let tL = Number(tileLength);
    let tpb = Number(tilesPerBox) || 1;

    let tileArea = tW * tL;
    if (isSI) {
      tileArea = tileArea / 1000000;
    } else {
      tileArea = tileArea / 144;
    }

    let skirtingLength = perim > 0 ? Math.max(0, perim - (doors * dW)) : 0;
    let skirtingArea = skirtingLength * sH_m;
    
    let totalNetArea = floorArea + skirtingArea;
    const totalTileAreaReq = totalNetArea * 1.05; // 5% wastage
    
    const numTiles = tileArea > 0 ? totalTileAreaReq / tileArea : 0;
    const boxesReq = tpb > 0 ? Math.ceil(numTiles / tpb) : 0;

    const steps = [
      {
        stepName: "1. Skirting Deductions",
        equation: "L_skirt = Perimeter - (Doors × Door_Width)",
        variables: [{name: "Perimeter", value: perim, unit: uLen}, {name: "Doors", value: doors, unit: "qty"}],
        substitution: `L_skirt = ${perim} - (${doors} × ${dW}) = ${skirtingLength.toFixed(2)}`,
        result: parseFloat(skirtingLength.toFixed(2)),
        resultUnit: uLen,
        resultColor: "slate"
      },
      {
        stepName: "2. Total Skirting Area",
        equation: "A_skirt = L_skirt × Skirting_Height",
        variables: [{name: "L_skirt", value: skirtingLength.toFixed(2), unit: uLen}, {name: "Height", value: sH_m.toFixed(3), unit: uLen}],
        substitution: `A_skirt = ${skirtingLength.toFixed(2)} × ${sH_m.toFixed(3)} = ${skirtingArea.toFixed(2)}`,
        result: parseFloat(skirtingArea.toFixed(2)),
        resultUnit: uArea,
        resultColor: "slate"
      },
      {
        stepName: "3. Total Gross Area (+ 5% Wastage)",
        equation: "A_gross = (Floor_Area + A_skirt) × 1.05",
        variables: [{name: "Floor Area", value: floorArea, unit: uArea}],
        substitution: `A_gross = (${floorArea} + ${skirtingArea.toFixed(2)}) × 1.05`,
        result: parseFloat(totalTileAreaReq.toFixed(2)),
        resultUnit: uArea,
        resultColor: "slate"
      },
      {
        stepName: "4. Total Tiles",
        equation: "Tiles = A_gross / Area_per_Tile",
        variables: [{name: "Tile Area", value: tileArea.toFixed(4), unit: uArea}],
        substitution: `Tiles = ${totalTileAreaReq.toFixed(2)} / ${tileArea.toFixed(4)}`,
        result: Math.ceil(numTiles),
        resultUnit: "tiles",
        resultColor: "indigo"
      }
    ];

    return {
      numTiles: Math.ceil(numTiles),
      boxesReq,
      floorArea,
      skirtingArea,
      totalNetArea,
      totalTileAreaReq,
      steps
    };
  };

  const results = calculateTiles();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`Floor Area (${uArea})`}>
            <><label htmlFor="a11y-input-284" className="sr-only">Input</label>
<input id="a11y-input-284" type="number" inputMode="decimal" min="0" value={area} onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
          <InputGroup label={`Perimeter (${uLen})`}>
            <><label htmlFor="a11y-input-285" className="sr-only">Input</label>
<input id="a11y-input-285" type="number" inputMode="decimal" min="0" value={perimeter} onChange={(e) => setPerimeter(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`Skirting Ht (${isSI ? 'mm' : 'in'})`}>
            <><label htmlFor="a11y-input-286" className="sr-only">Input</label>
<input id="a11y-input-286" type="number" inputMode="decimal" min="0" value={skirtingHeight} onChange={(e) => setSkirtingHeight(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
          <InputGroup label={`Doors Qty`}>
            <><label htmlFor="a11y-input-287" className="sr-only">Input</label>
<input id="a11y-input-287" type="number" inputMode="decimal" min="0" value={doorOpenings} onChange={(e) => setDoorOpenings(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <InputGroup label={`Tile Width (${isSI ? 'mm' : 'in'})`}>
            <><label htmlFor="a11y-input-288" className="sr-only">Input</label>
<input id="a11y-input-288" type="number" inputMode="decimal" min="1" value={tileWidth} onChange={(e) => setTileWidth(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
          <InputGroup label={`Tile Length (${isSI ? 'mm' : 'in'})`}>
            <><label htmlFor="a11y-input-289" className="sr-only">Input</label>
<input id="a11y-input-289" type="number" inputMode="decimal" min="1" value={tileLength} onChange={(e) => setTileLength(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>

        <InputGroup label="Tiles per Box">
            <><label htmlFor="a11y-input-290" className="sr-only">Input</label>
<input id="a11y-input-290" type="number" inputMode="decimal" min="1" value={tilesPerBox} onChange={(e) => setTilesPerBox(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
        </InputGroup>
      </div>

      <div className="lg:col-span-8 flex flex-col h-full space-y-4">
        {results ? (
          <>
            <MaterialSummary title="Estimate Results" totalLabel="Boxes Required" totalValue={results.boxesReq.toString()} totalUnit="boxes">
               <div className="grid grid-cols-2 gap-4 mt-6">
                 <ResultCard title="Required Tiles" value={results.numTiles} unit="tiles" variant="neutral" />
                 <ResultCard title="Incl. Wastage" value={results.totalTileAreaReq.toFixed(2)} unit={uArea} variant="warning" />
               </div>
            </MaterialSummary>
            <div className="mt-4">
               <DetailedCalculationDisplay steps={results.steps as any} />
            </div>
          </>
        ) : (
          <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 w-full overflow-hidden group">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-400 bg-clip-text text-transparent">Estimate Results</h3>
            <div className="text-center text-slate-500 py-8">Enter area and tile size to calculate.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaintCalculator() {
  const { settings } = useSettings();
  const isSI = settings.measurement === "SI";
  const uArea = isSI ? "m²" : "sq.ft";
  const [area, setArea] = useState<number | "">("");
  const [coats, setCoats] = useState<number | "">(2);
  const [volumeSolids, setVolumeSolids] = useState<number | "">(40); // 40% typical for interior masonry paint
  const [dft, setDft] = useState<number | "">(35); // DFT per coat in microns
  const [wastage, setWastage] = useState<number | "">(10); 

  const calculatePaint = () => {
    if (!area || !coats || !volumeSolids || !dft) return null;

    let areaSqm = Number(area);
    if (!isSI) {
      areaSqm = areaSqm / 10.764; // convert sq ft to sq m
    }

    const vs = Number(volumeSolids);
    const targetDft = Number(dft);
    const nCoats = Number(coats);
    const w = Number(wastage) || 0;

    // Wet Film Thickness (WFT) in microns
    const wft = (targetDft * 100) / vs;

    // Theoretical Spread Rate (Coverage) m2/L
    // Spread Rate = (VS% × 10) / DFT
    const spreadRate = (vs * 10) / targetDft;

    const unadjustedLiters = (areaSqm / spreadRate) * nCoats;
    const wasteFactor = 1 + w / 100;
    const totalLiters = unadjustedLiters * wasteFactor;

    const gallons = totalLiters / 3.78541;

    const steps = [
      {
        stepName: "1. Wet Film Thickness (WFT)",
        equation: "WFT = (DFT × 100) / Volume_Solids",
        variables: [{name: "DFT", value: targetDft, unit: "µm"}, {name: "VS%", value: vs, unit: "%"}],
        substitution: `WFT = (${targetDft} × 100) / ${vs}`,
        result: parseFloat(wft.toFixed(2)),
        resultUnit: "µm",
        resultColor: "slate"
      },
      {
        stepName: "2. Theoretical Spread Rate",
        equation: "Coverage = (Volume_Solids × 10) / DFT",
        variables: [{name: "VS%", value: vs, unit: "%"}, {name: "DFT", value: targetDft, unit: "µm"}],
        substitution: `Coverage = (${vs} × 10) / ${targetDft}`,
        result: parseFloat(spreadRate.toFixed(2)),
        resultUnit: "m²/L",
        resultColor: "slate"
      },
      {
        stepName: "3. Ideal Paint Volume",
        equation: "V_ideal = (Area / Coverage) × Coats",
        variables: [{name: "Area", value: areaSqm.toFixed(2), unit: "m²"}, {name: "Coats", value: nCoats, unit: "qty"}],
        substitution: `V_ideal = (${areaSqm.toFixed(2)} / ${spreadRate.toFixed(2)}) × ${nCoats}`,
        result: parseFloat(unadjustedLiters.toFixed(2)),
        resultUnit: "Liters",
        resultColor: "slate"
      },
      {
        stepName: "4. Total Required (+ Wastage)",
        equation: "Total = V_ideal × (1 + Wastage%)",
        variables: [{name: "V_ideal", value: unadjustedLiters.toFixed(2), unit: "L"}, {name: "Wastage", value: w, unit: "%"}],
        substitution: `Total = ${unadjustedLiters.toFixed(2)} × ${wasteFactor.toFixed(2)}`,
        result: parseFloat(totalLiters.toFixed(2)),
        resultUnit: "Liters",
        resultColor: "indigo"
      }
    ];

    return {
      liters: totalLiters.toFixed(2),
      gallons: gallons.toFixed(2),
      wft: wft.toFixed(1),
      spreadRate: spreadRate.toFixed(2),
      steps
    };
  };

  const results = calculatePaint();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`Total Area (${uArea})`}>
            <><label htmlFor="a11y-input-291" className="sr-only">Input</label>
<input id="a11y-input-291" type="number" inputMode="decimal" min="0" value={area} onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
          <InputGroup label="Number of Coats">
            <><label htmlFor="a11y-input-292" className="sr-only">Input</label>
<input id="a11y-input-292" type="number" inputMode="decimal" min="1" value={coats} onChange={(e) => setCoats(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Volume Solids (%)">
            <><label htmlFor="a11y-input-293" className="sr-only">Input</label>
<input id="a11y-input-293" type="number" inputMode="decimal" min="1" max="100" value={volumeSolids} onChange={(e) => setVolumeSolids(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
           <InputGroup label="Target DFT (µm/coat)">
            <><label htmlFor="a11y-input-294" className="sr-only">Input</label>
<input id="a11y-input-294" type="number" inputMode="decimal" min="1" value={dft} onChange={(e) => setDft(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>
        
         <InputGroup label="Wastage (%)">
            <><label htmlFor="a11y-input-295" className="sr-only">Input</label>
<input id="a11y-input-295" type="number" inputMode="decimal" min="0" value={wastage} onChange={(e) => setWastage(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>

      </div>

      <div className="lg:col-span-8 flex flex-col h-full space-y-4">
        {results ? (
            <>
              <MaterialSummary title="Estimate Results" totalLabel="Required Paint" totalValue={results.liters} totalUnit="Liters">
                 <div className="grid grid-cols-2 gap-4 mt-6">
                   <ResultCard title="Coverage" value={results.spreadRate} unit="m²/L" variant="neutral" />
                   <ResultCard title="Required WFT" value={results.wft} unit="µm" variant="warning" />
                 </div>
              </MaterialSummary>
              <div className="mt-4">
                 <DetailedCalculationDisplay steps={results.steps as any} />
              </div>
            </>
        ) : (
          <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 w-full overflow-hidden group">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Estimate Results</h3>
            <div className="text-center text-slate-500 py-8">Enter wall/ceiling area and coats to calculate.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DoorsWindowsCalculator() {
  const { settings } = useSettings();
  const isSI = settings.measurement === "SI";
  const uLen = isSI ? "m" : "ft";
  const uArea = isSI ? "m²" : "sq.ft";

  const [wallLength, setWallLength] = useState<number | "">(isSI ? 5 : 16);
  const [wallHeight, setWallHeight] = useState<number | "">(isSI ? 3 : 10);
  const [deductions, setDeductions] = useState<{name: string, w: number, h: number, qty: number}[]>([
    { name: "Door", w: isSI ? 0.9 : 3, h: isSI ? 2.1 : 7, qty: 1 }
  ]);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...deductions];
    (newItems[index] as any)[field] = value ? Number(value) : "";
    setDeductions(newItems);
  };

  const addItem = () => setDeductions([...deductions, { name: "Window", w: isSI ? 1 : 3, h: isSI ? 1.2 : 4, qty: 1 }]);
  const removeItem = (index: number) => setDeductions(deductions.filter((_, i) => i !== index));

  const grossArea = Number(wallLength) * Number(wallHeight);
  const totalDeduction = deductions.reduce((sum, item) => sum + (item.w * item.h * item.qty), 0);
  const netArea = grossArea - totalDeduction;

  const renderPreview = () => {
    if (!wallLength || !wallHeight) return null;
    const wl = Number(wallLength);
    const wh = Number(wallHeight);
    if (wl <= 0 || wh <= 0) return null;

    const displayRatio = Math.min(Math.max(wl / wh, 0.5), 5); // Constrain for UI sanity

    let currentX = 0; // Simple auto-layout from left to right

    return (
      <div className="mt-8 p-5 bg-slate-50/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border border-slate-200 rounded-[24px] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium">Proportional Preview</h4>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-bg-card shadow-sm px-2 py-1 rounded-[16px]">
            {wl}{uLen} × {wh}{uLen}
          </span>
        </div>
        
        <div 
          className="relative w-full mx-auto bg-white [#1A1C24] border-2 border-indigo-200 overflow-hidden rounded-[16px] shadow-sm" 
          style={{ aspectRatio: displayRatio }}
        >
          {/* Wall Grid Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #6366f1 1px, transparent 1px), linear-gradient(180deg, #6366f1 1px, transparent 1px)', backgroundSize: 'min(5%, 20px) min(5%, 20px)' }}></div>
          
          {deductions.flatMap((op, oIdx) => {
            return Array.from({ length: Number(op.qty) || 0 }).map((_, qIdx) => {
               const isDoor = op.name.toLowerCase().includes("door");
               const opW = Number(op.w) || 0;
               const opH = Number(op.h) || 0;
               
               const maxW = Math.min(opW, wl);
               const maxH = Math.min(opH, wh);

               if (maxW <= 0 || maxH <= 0) return null;

               const pctW = (maxW / wl) * 100;
               const pctH = (maxH / wh) * 100;
               
               // Next position
               const xPos = currentX;
               currentX += maxW + (wl * 0.05); // add 5% gap
               if (currentX > wl - maxW) currentX = 0; // wrap to beginning if it exceeds

               const leftPct = (xPos / wl) * 100;

               return (
                 <div
                   key={`${oIdx}-${qIdx}`}
                   className="absolute bg-rose-500/10 backdrop-blur-md border-2 border-rose-400 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                   style={{
                     width: `${pctW}%`,
                     height: `${pctH}%`,
                     left: `${leftPct}%`,
                     bottom: isDoor ? '0' : `calc(50% - ${pctH / 2}%)`,
                   }}
                 >
                   <div className="w-full bg-white/90 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 rounded px-1.5 py-0.5 overflow-hidden">
                     <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 truncate whitespace-nowrap">
                       {op.name}
                     </span>
                   </div>
                 </div>
               );
            });
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`Wall Length (${uLen})`}>
            <><label htmlFor="a11y-input-296" className="sr-only">e.g. 5</label>
<input id="a11y-input-296"
              type="number" inputMode="decimal"
              min="0"
              value={wallLength}
              onChange={(e) => setWallLength(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              placeholder="e.g. 5"
            /></>
          </InputGroup>
          <InputGroup label={`Wall Height (${uLen})`}>
            <><label htmlFor="a11y-input-297" className="sr-only">e.g. 3</label>
<input id="a11y-input-297"
              type="number" inputMode="decimal"
              min="0"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              placeholder="e.g. 3"
            /></>
          </InputGroup>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="text-base font-medium">Openings / Deductions</label>
          <div className="space-y-2">
            {deductions.map((item, index) => (
              <div key={index} className="flex gap-2 items-center bg-white border border-slate-200 dark:border-slate-700 p-2 rounded-[24px] overflow-hidden">
                <><label htmlFor="a11y-input-298" className="sr-only">Input</label>
<input id="a11y-input-298" 
                  type="text" 
                  value={item.name} 
                  onChange={(e) => {
                    const newItems = [...deductions];
                    newItems[index].name = e.target.value;
                    setDeductions(newItems);
                  }}
                  className="w-24 px-2 py-1.5 text-sm bg-bg-card border border-slate-200 rounded outline-none font-medium text-slate-700 rounded-full" 
                /></>
                <><label htmlFor="a11y-input-299" className="sr-only">W</label>
<input id="a11y-input-299" type="number" inputMode="decimal" placeholder="W" value={item.w || ""} onChange={(e) => updateItem(index, 'w', e.target.value)} className="w-16 px-2 py-1.5 text-sm bg-bg-card border border-slate-200 rounded outline-none font-medium text-slate-700 rounded-full" /></>
                <><label htmlFor="a11y-input-300" className="sr-only">H</label>
<input id="a11y-input-300" type="number" inputMode="decimal" placeholder="H" value={item.h || ""} onChange={(e) => updateItem(index, 'h', e.target.value)} className="w-16 px-2 py-1.5 text-sm bg-bg-card border border-slate-200 rounded outline-none font-medium text-slate-700 rounded-full" /></>
                <><label htmlFor="a11y-input-301" className="sr-only">Qty</label>
<input id="a11y-input-301" type="number" inputMode="decimal" placeholder="Qty" value={item.qty || ""} onChange={(e) => updateItem(index, 'qty', e.target.value)} className="w-16 px-2 py-1.5 text-sm bg-bg-card border border-slate-200 rounded outline-none font-medium text-slate-700 rounded-full" /></>
                <button onClick={() => removeItem(index)} className="p-1.5 px-2.5 text-rose-500 hover:bg-rose-50 rounded transition-colors ml-auto mr-1 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"><span className="font-bold">X</span></button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="text-base font-medium text-amber-600 hover:text-amber-700 mt-2 inline-flex items-center gap-1 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">+ Add Opening</button>
        </div>
      </div>

      <div className="flex flex-col h-full">
        {grossArea > 0 ? (
          <>
            <MaterialSummary
               title="Estimate Results"
               totalLabel="Net Printable / Plaster Area"
               totalValue={netArea > 0 ? netArea.toFixed(2) : "0"}
               totalUnit={uArea}
             >
               <div className="grid grid-cols-1 gap-4 mt-6">
                 <ResultCard title="Total Deductions" value={totalDeduction.toFixed(2)} unit={uArea} variant="warning" />
                 <ResultCard title="Gross Wall Area (No Deductions)" value={grossArea.toFixed(2)} unit={uArea} variant="neutral" />
               </div>
             </MaterialSummary>
             
             {/* 2D Canvas Preview */}
             {renderPreview()}
          </>
        ) : (
          <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 w-full overflow-hidden group h-full justify-center">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-2 text-center bg-gradient-to-r from-blue-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Estimate Results</h3>
            <div className="text-center text-slate-500 py-8">
              Enter wall dimensions to calculate net area and see the proportional preview.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WoodFramingCalculator() {
  const { settings } = useSettings();
  const isSI = settings.measurement === "SI";
  const uLen = isSI ? "m" : "ft";
  
  const [frameLength, setFrameLength] = useState<number | "">("");
  const [frameWidth, setFrameWidth] = useState<number | "">(isSI ? 150 : 6);
  const [frameThick, setFrameThick] = useState<number | "">(isSI ? 38 : 1.5);
  const [quantity, setQuantity] = useState<number | "">(1);

  const calculateWood = () => {
    if (!frameLength || !frameWidth || !frameThick || !quantity) return null;
    
    let L = Number(frameLength);
    let W = Number(frameWidth); // mm or inches
    let T = Number(frameThick); // mm or inches
    let Q = Number(quantity);
    
    // convert W and T to m or ft
    let w_m = isSI ? W / 1000 : W / 12;
    let t_m = isSI ? T / 1000 : T / 12;
    
    let volumeSingle = L * w_m * t_m;
    let volumeTotal = volumeSingle * Q;
    // adding standard typical 10% wastage for wood
    let volumeWastage = volumeTotal * 1.10;

    const steps = [
      {
        stepName: "1. Cross-Sectional Area",
        equation: "Area = Width × Thickness",
        variables: [{name: "Width", value: w_m.toFixed(3), unit: uLen}, {name: "Thick", value: t_m.toFixed(3), unit: uLen}],
        substitution: `Area = ${w_m.toFixed(3)} × ${t_m.toFixed(3)}`,
        result: parseFloat((w_m * t_m).toFixed(5)),
        resultUnit: isSI ? "m²" : "sq.ft",
        resultColor: "slate"
      },
      {
        stepName: "2. Volume (Single Wood Member)",
        equation: "Vol_1 = Area × Length",
        variables: [{name: "Length", value: L, unit: uLen}],
        substitution: `Vol_1 = ${(w_m * t_m).toFixed(5)} × ${L}`,
        result: parseFloat(volumeSingle.toFixed(4)),
        resultUnit: isSI ? "m³" : "cu.ft",
        resultColor: "slate"
      },
      {
        stepName: "3. Total Volume (+10% Wastage)",
        equation: "Total = (Vol_1 × Qty) × 1.10",
        variables: [{name: "Qty", value: Q, unit: "pcs"}],
        substitution: `Total = (${volumeSingle.toFixed(4)} × ${Q}) × 1.10`,
        result: parseFloat(volumeWastage.toFixed(4)),
        resultUnit: isSI ? "m³" : "cu.ft",
        resultColor: "indigo"
      }
    ];

    return {
      volumeTotal: volumeTotal.toFixed(4),
      volumeWastage: volumeWastage.toFixed(4),
      steps
    };
  };

  const results = calculateWood();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <InputGroup label={`Length per Member (${uLen})`}>
          <><label htmlFor="a11y-input-302" className="sr-only">Input</label>
<input id="a11y-input-302" type="number" inputMode="decimal" min="0" value={frameLength} onChange={(e) => setFrameLength(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
        </InputGroup>
        
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label={`Width (${isSI ? 'mm' : 'in'})`}>
            <><label htmlFor="a11y-input-303" className="sr-only">Input</label>
<input id="a11y-input-303" type="number" inputMode="decimal" min="0" value={frameWidth} onChange={(e) => setFrameWidth(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
          <InputGroup label={`Thickness (${isSI ? 'mm' : 'in'})`}>
            <><label htmlFor="a11y-input-304" className="sr-only">Input</label>
<input id="a11y-input-304" type="number" inputMode="decimal" min="0" value={frameThick} onChange={(e) => setFrameThick(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>

        <InputGroup label="Quantity (Pieces)">
          <><label htmlFor="a11y-input-305" className="sr-only">Input</label>
<input id="a11y-input-305" type="number" inputMode="decimal" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
        </InputGroup>
      </div>

      <div className="lg:col-span-8 flex flex-col h-full space-y-4">
        {results ? (
          <>
            <MaterialSummary title="Estimate Results" totalLabel="Req. Wood Volume" totalValue={results.volumeWastage} totalUnit={isSI ? "m³" : "cu.ft"}>
               <div className="grid grid-cols-2 gap-4 mt-6">
                 <ResultCard title="Net Volume (No Waste)" value={results.volumeTotal} unit={isSI ? "m³" : "cu.ft"} variant="neutral" />
               </div>
            </MaterialSummary>
            <div className="mt-4">
               <DetailedCalculationDisplay steps={results.steps as any} />
            </div>
          </>
        ) : (
          <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 w-full overflow-hidden group">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Estimate Results</h3>
            <div className="text-center text-slate-500 py-8">Enter member dimensions and quantity to calculate wood volume.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TermiteTreatmentCalculator() {
  const { settings } = useSettings();
  const isSI = settings.measurement === "SI";
  const uArea = isSI ? "m²" : "sq.ft";
  const uLen = isSI ? "m" : "ft";
  
  const [area, setArea] = useState<number | "">("");
  const [perimeter, setPerimeter] = useState<number | "">(isSI ? 30 : 100);
  const [type, setType] = useState<"pre" | "post">("pre");
  
  const [concentrationRatio, setConcentrationRatio] = useState<number | "">(49); // e.g. 1 part chemical to 49 parts water (50 total)
  
  const calculateTermite = () => {
    if (!area || !perimeter) return null;
    
    let a = Number(area);
    let p = Number(perimeter);
    let ratio = Number(concentrationRatio) || 49;
    
    // Standard Application Rate: Emulsion
    // Pre-construction: Floor = 5 L/m², Trench = 5 L/linear.m (simplification)
    // Post-construction: Holes drilled = 2.5 L/linear.m or floor area based... let's just differentiate lightly
    let floorRateSqm = type === "pre" ? 5 : 2; 
    let trenchRateM = type === "pre" ? 7.5 : 2.5;
    
    let area_sqm = isSI ? a : a / 10.764;
    let perimeter_m = isSI ? p : p / 3.28084;
    
    let floorEmulsion = area_sqm * floorRateSqm;
    let trenchEmulsion = perimeter_m * trenchRateM;
    let totalEmulsion_L = floorEmulsion + trenchEmulsion;
    
    // Total Chemical Concentrate = Total Emulsion / (1 + ratio)
    let chemReserve = totalEmulsion_L / (1 + ratio);

    const steps = [
      {
        stepName: "1. Floor Area Emulsion",
        equation: "E_floor = Area × Application_Rate",
        variables: [{name: "Area", value: area_sqm.toFixed(2), unit: "m²"}, {name: "Rate", value: floorRateSqm, unit: "L/m²"}],
        substitution: `E_floor = ${area_sqm.toFixed(2)} × ${floorRateSqm}`,
        result: parseFloat(floorEmulsion.toFixed(2)),
        resultUnit: "Liters",
        resultColor: "slate"
      },
      {
        stepName: "2. Perimeter Trench Emulsion",
        equation: "E_trench = Perimeter × Trench_Rate",
        variables: [{name: "Perimeter", value: perimeter_m.toFixed(2), unit: "m"}, {name: "Rate", value: trenchRateM, unit: "L/m"}],
        substitution: `E_trench = ${perimeter_m.toFixed(2)} × ${trenchRateM}`,
        result: parseFloat(trenchEmulsion.toFixed(2)),
        resultUnit: "Liters",
        resultColor: "slate"
      },
      {
        stepName: "3. Total Emulsion Required",
        equation: "E_total = E_floor + E_trench",
        variables: [{name: "E_floor", value: floorEmulsion.toFixed(2)}, {name: "E_trench", value: trenchEmulsion.toFixed(2)}],
        substitution: `E_total = ${floorEmulsion.toFixed(2)} + ${trenchEmulsion.toFixed(2)}`,
        result: parseFloat(totalEmulsion_L.toFixed(2)),
        resultUnit: "Liters",
        resultColor: "slate"
      },
      {
        stepName: "4. Chemical Concentrate",
        equation: "Conc = E_total / (1 + Dilution_Ratio)",
        variables: [{name: "Ratio", value: `1:${ratio}`, unit: ""}],
        substitution: `Conc = ${totalEmulsion_L.toFixed(2)} / (1 + ${ratio})`,
        result: parseFloat(chemReserve.toFixed(2)),
        resultUnit: "Liters",
        resultColor: "indigo"
      }
    ];

    return {
      totalEmulsion: totalEmulsion_L.toFixed(1),
      chemReserve: chemReserve.toFixed(2),
      steps
    };
  };

  const results = calculateTermite();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="flex bg-slate-100 p-1 rounded-[16px]">
            <button
              onClick={() => setType("pre")}
              className={`flex-1 py-1.5 text-base font-medium rounded-[12px] transition-colors ${type === "pre" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Pre-Construction
            </button>
            <button
              onClick={() => setType("post")}
              className={`flex-1 py-1.5 text-base font-medium rounded-[12px] transition-colors ${type === "post" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Post-Construction
            </button>
          </div>
          
        <div className="grid grid-cols-2 gap-4 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
          <InputGroup label={`Plinth Area (${uArea})`}>
            <><label htmlFor="a11y-input-306" className="sr-only">Input</label>
<input id="a11y-input-306" type="number" inputMode="decimal" min="0" value={area} onChange={(e) => setArea(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
          <InputGroup label={`Perimeter (${uLen})`}>
            <><label htmlFor="a11y-input-307" className="sr-only">Input</label>
<input id="a11y-input-307" type="number" inputMode="decimal" min="0" value={perimeter} onChange={(e) => setPerimeter(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" /></>
          </InputGroup>
        </div>

        <InputGroup label="Dilution Ratio (Parts Water to 1 Part Chem)">
          <><label htmlFor="a11y-input-308" className="sr-only">e.g. 49</label>
<input id="a11y-input-308" type="number" inputMode="decimal" min="1" value={concentrationRatio} onChange={(e) => setConcentrationRatio(e.target.value ? Number(e.target.value) : "")} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-full px-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-amber-500 outline-none transition-all" placeholder="e.g. 49" /></>
        </InputGroup>
      </div>

      <div className="lg:col-span-8 flex flex-col h-full space-y-4">
        {results ? (
          <>
            <MaterialSummary title="Estimate Results" totalLabel="Chemical Concentrate" totalValue={results.chemReserve} totalUnit="Liters">
               <div className="grid grid-cols-2 gap-4 mt-6">
                 <ResultCard title="Total Emulsion (Mixed)" value={results.totalEmulsion} unit="Liters" variant="neutral" />
               </div>
            </MaterialSummary>
            <div className="mt-4">
               <DetailedCalculationDisplay steps={results.steps as any} />
            </div>
          </>
        ) : (
          <div className="relative p-5 sm:p-6 rounded-[24px] bg-white/80 [#252834]/90 backdrop-blur-md border border-slate-200/60 shadow-sm [0_4px_20px_rgba(15,23,42,0.15)] flex flex-col gap-3 transition-all duration-300 w-full overflow-hidden group">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Estimate Results</h3>
            <div className="text-center text-slate-500 py-8">Enter area and perimeter to verify chemical requirements.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
