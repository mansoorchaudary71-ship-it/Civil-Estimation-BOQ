import React, { useState, useEffect } from 'react';
import { Triangle, Ruler, Home, Layers, Calculator, Download, Printer, Box } from 'lucide-react';
import { FormulaAccordion, FormulaStep } from '../ui/FormulaAccordion';

type UnitSystem = 'metric' | 'imperial';

interface RoofResult {
  run: number;
  angleDeg: number;
  rafterLength: number;
  pitchPercentage: number;
  totalArea: number;
  hypotenuse: number;
}

export function RoofPitchCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  
  const [span, setSpan] = useState<number>(10);
  const [rise, setRise] = useState<number>(3);
  const [overhang, setOverhang] = useState<number>(0.5);
  const [buildingLength, setBuildingLength] = useState<number>(15);

  const [result, setResult] = useState<RoofResult | null>(null);

  // When units change, set reasonable defaults
  useEffect(() => {
    if (unitSystem === 'metric') {
      setSpan(10);
      setRise(3);
      setOverhang(0.5);
      setBuildingLength(15);
    } else {
      setSpan(30);
      setRise(10);
      setOverhang(1.5);
      setBuildingLength(50);
    }
  }, [unitSystem]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/tools/roof-calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            span,
            rise,
            overhang,
            length: buildingLength
          })
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error("Calculation failed", err);
      }
    };
    fetchResults();
  }, [span, rise, overhang, buildingLength]);

  const unitL = unitSystem === 'metric' ? 'm' : 'ft';
  const unitA = unitSystem === 'metric' ? 'm²' : 'sq ft';

  // SVG Drawing Math
  const svgWidth = 600;
  const svgHeight = 250;
  const p = 40;
  const w = svgWidth - 2 * p;
  const h = svgHeight - 2 * p;
  
  const totalWidth = span + 2 * overhang;
  const safeTotalWidth = totalWidth > 0 ? totalWidth : 1;
  const safeRise = rise > 0 ? rise : 1;
  
  // We need to scale so both width and height fit comfortably
  const scaleX = w / safeTotalWidth;
  const scaleY = h / safeRise;
  const scale = Math.min(scaleX, scaleY);
  
  const scaledSpan = span * scale;
  const scaledRise = rise * scale;
  const scaledOverhang = overhang * scale;
  
  const cx = svgWidth / 2;
  const bottomY = svgHeight - p - 10;
  const topY = bottomY - scaledRise;
  
  const leftWall = cx - scaledSpan / 2;
  const rightWall = cx + scaledSpan / 2;
  
  const drop = span > 0 ? (rise / (span / 2)) * overhang * scale : 0;
  
  const leftEaveX = leftWall - scaledOverhang;
  const leftEaveY = bottomY + drop;
  
  const rightEaveX = rightWall + scaledOverhang;
  const rightEaveY = bottomY + drop;

  const formulaSteps: FormulaStep[] = result ? [
    {
      id: 1,
      label: "1. Run Calculation",
      theoretical: "Run = Span / 2",
      applied: `Run = ${span} / 2 = ${result.run.toFixed(2)} ${unitL}`
    },
    {
      id: 2,
      label: "2. Slope Angle (θ)",
      theoretical: "θ = arctan(Rise / Run)\nAngle in Degrees = θ × (180 / π)",
      applied: `θ = arctan(${rise} / ${result.run.toFixed(2)})\nAngle = ${result.angleDeg.toFixed(2)}°`
    },
    {
      id: 3,
      label: "3. Rafter Length",
      theoretical: "Hypotenuse = √(Rise² + Run²)\nTotal Rafter = Hypotenuse + Overhang",
      applied: `Hypotenuse = √(${rise}² + ${result.run.toFixed(2)}²) = ${result.hypotenuse.toFixed(2)} ${unitL}\nTotal Rafter = ${result.hypotenuse.toFixed(2)} + ${overhang} = ${result.rafterLength.toFixed(2)} ${unitL}`
    },
    {
      id: 4,
      label: "4. Total Roof Area",
      theoretical: "Area = 2 × (Rafter Length × Building Length)",
      applied: `Area = 2 × (${result.rafterLength.toFixed(2)} × ${buildingLength}) = ${result.totalArea.toFixed(2)} ${unitA}`
    }
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600">
              <Triangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Roof Pitch & Area Calculator</h1>
              <p className="text-slate-600 text-sm">Calculate slope, rafter length, and total roof surface area.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'metric' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Metric (m)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unitSystem === 'imperial' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Imperial (ft)
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 border border-orange-700 rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
              <Download size={16} /> Export BOQ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Ruler size={20} className="text-orange-500" />
              Dimensions
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Building Span ({unitL})</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={span}
                onChange={(e) => setSpan(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500">Total width of the building</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Roof Rise ({unitL})</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={rise}
                onChange={(e) => setRise(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500">Vertical height from base to ridge</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Overhang ({unitL})</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={overhang}
                onChange={(e) => setOverhang(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500">Horizontal eaves extension</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Building Length ({unitL})</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={buildingLength}
                onChange={(e) => setBuildingLength(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white space-y-6 relative overflow-hidden">
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Calculator size={24} className="text-orange-400" />
              Roof Geometry Results
            </h2>

            {/* SVG Visualizer */}
            <div className="w-full bg-white/5 rounded-2xl border border-white/10 p-4 mb-4 relative z-10">
              <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto drop-shadow-md">
                {/* Ceiling Joist / Span */}
                <line x1={leftWall} y1={bottomY} x2={rightWall} y2={bottomY} stroke="#94a3b8" strokeWidth="3" strokeDasharray="4,4" />
                
                {/* Walls */}
                <line x1={leftWall} y1={bottomY} x2={leftWall} y2={bottomY + 30} stroke="#475569" strokeWidth="6" />
                <line x1={rightWall} y1={bottomY} x2={rightWall} y2={bottomY + 30} stroke="#475569" strokeWidth="6" />

                {/* Overhang extensions */}
                <line x1={leftEaveX} y1={leftEaveY} x2={leftWall} y2={bottomY} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
                <line x1={rightEaveX} y1={rightEaveY} x2={rightWall} y2={bottomY} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />

                {/* Main Rafters */}
                <line x1={leftWall} y1={bottomY} x2={cx} y2={topY} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
                <line x1={rightWall} y1={bottomY} x2={cx} y2={topY} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
                
                {/* Rise / Center post */}
                <line x1={cx} y1={bottomY} x2={cx} y2={topY} stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" />
                
                {/* Angle Arc */}
                <path d={`M ${leftWall + 25} ${bottomY} A 25 25 0 0 0 ${leftWall + 20} ${bottomY - 12}`} fill="none" stroke="#fbbf24" strokeWidth="2" />
                <text x={leftWall + 35} y={bottomY - 8} fill="#fbbf24" fontSize="12" fontWeight="bold">{result?.angleDeg.toFixed(1)}°</text>

                {/* Labels */}
                <text x={cx} y={bottomY + 20} textAnchor="middle" fill="#cbd5e1" fontSize="14" fontWeight="bold">Span: {span} {unitL}</text>
                <text x={cx + 10} y={bottomY - scaledRise/2} fill="#38bdf8" fontSize="14" fontWeight="bold">Rise: {rise} {unitL}</text>
                <text x={leftWall - scaledOverhang/2} y={bottomY + 20} textAnchor="middle" fill="#f87171" fontSize="12">OH: {overhang}</text>
                <text x={cx - scaledSpan/4} y={bottomY - scaledRise/2 - 10} textAnchor="middle" fill="#f97316" fontSize="14" fontWeight="bold">Rafter</text>
              </svg>
            </div>

            {result && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="text-orange-200 text-xs font-medium mb-1">Slope Angle</div>
                  <div className="text-xl font-bold">{result.angleDeg.toFixed(2)}°</div>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="text-orange-200 text-xs font-medium mb-1">Pitch</div>
                  <div className="text-xl font-bold">{result.pitchPercentage.toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-300">{(result.pitchPercentage / 100 * 12).toFixed(1)}:12</div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                  <div className="text-orange-200 text-xs font-medium mb-1">Rafter Length</div>
                  <div className="text-xl font-bold">{result.rafterLength.toFixed(2)} <span className="text-xs">{unitL}</span></div>
                </div>
                
                <div className="bg-orange-500/20 rounded-2xl p-4 border border-orange-500/30 backdrop-blur-md">
                  <div className="text-orange-200 text-xs font-medium mb-1">Total Roof Area</div>
                  <div className="text-xl font-bold text-orange-400">{result.totalArea.toFixed(2)} <span className="text-xs">{unitA}</span></div>
                </div>
              </div>
            )}
          </div>

          {result && <FormulaAccordion steps={formulaSteps} />}
        </div>
      </div>
    </div>
  );
}
