import { Button } from '../ui/Button';
import React, { useState } from 'react';
import { useBOQ } from '../../context/BOQContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Circle, CircleDashed, AlignJustify, Baseline, Triangle, Save , AlertTriangle} from 'lucide-react';
import { useRates } from '../../lib/useRates';
import { formatRate } from '../../lib/rates';
import { calcRectangular, calcCircular, calcTube, calcPrecast, calcRoof, calcTrapFooting, calcStaircaseTab } from '../../lib/geometryCalc';
import { CalcSteps, EngineNotices, StructuralExportBar } from '../ui/StructuralExportBar';


export default function UniversalStructuralGeometryEngine() {
  const { addItem } = useBOQ();
  const { rates, setRate, table } = useRates();
  const [activeTab, setActiveTab] = useState('rectangular');
  const [formedOnGround, setFormedOnGround] = useState(true);
  const [fck, setFck] = useState(25);
  const [wastage, setWastage] = useState(5);

  const [inputs, setInputs] = useState({
    // Rectangular
    rectL: 3, rectW: 0.3, rectD: 0.4, rectRebarCount: 4, rectStirrupSpacing: 0.15,
    rectMainDia: 12, rectStirrupDia: 8, rectCover: 25,
    // Circular
    circDia: 0.4, circH: 3, circRebarCount: 6, circTiePitch: 0.15,
    circMainDia: 12, circTieDia: 8, circCover: 25,
    // Tube
    tubeOD: 1, tubeID: 0.8, tubeL: 5,
    // Precast
    wallL: 30, wallTotalH: 2.4, panelH: 0.3, panelThick: 0.05, postSpacing: 3,
    postSize: 0.15, footingSize: 0.45, footingDepth: 0.6,
    // Staircase
    stairSteps: 10, stairRise: 0.17, stairGoing: 0.28, stairWidth: 1.2, stairWaist: 0.15,
    stairMainDia: 12, stairMainSpacing: 150, stairDistDia: 10, stairDistSpacing: 200, stairCover: 20,
    // Roof
    roofSpan: 8, roofRise: 2, roofRun: 12, roofPurlinSpacing: 1.2, roofBattenSpacing: 0.6, roofSheetWidth: 1.0,
    // Trapezoidal footing
    trapL: 2.2, trapW: 2.2, trapD1: 0.2, trapL2: 0.6, trapW2: 0.6, trapD2: 0.3
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const calcPlywood = (area: number) => Math.ceil(area / 2.97); // 1.22 x 2.44 plywood sheet is approx 2.97 sqm
  const calcBattens = (area: number) => Math.ceil(area * 3.5); // Approx 3.5m of batten per sqm


  const getValidations = () => {
    const warnings = [];
    if (activeTab === 'rectangular') {
      if (inputs.rectL <= 0 || inputs.rectW <= 0 || inputs.rectD <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.rectD > inputs.rectW * 5) warnings.push("Unusual aspect ratio: depth is more than 5x the width.");
      if (inputs.rectW > inputs.rectD * 5) warnings.push("Unusual aspect ratio: width is more than 5x the depth.");
      if (inputs.rectStirrupSpacing >= inputs.rectL) warnings.push("Stirrup spacing is larger than or equal to total length.");
      if (inputs.rectStirrupSpacing <= 0) warnings.push("Stirrup spacing must be greater than zero.");
    } else if (activeTab === 'circular') {
      if (inputs.circDia <= 0 || inputs.circH <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.circH > inputs.circDia * 20) warnings.push("Unusual slenderness: height is more than 20x the diameter.");
      if (inputs.circTiePitch <= 0) warnings.push("Tie pitch must be greater than zero.");
    } else if (activeTab === 'tube') {
      if (inputs.tubeOD <= 0 || inputs.tubeID <= 0 || inputs.tubeL <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.tubeID >= inputs.tubeOD) warnings.push("Inner diameter cannot be greater than or equal to outer diameter.");
      if (inputs.tubeOD > 0 && inputs.tubeID > 0 && (inputs.tubeOD - inputs.tubeID) < 0.05) warnings.push("Wall thickness is critically thin (< 50mm).");
    } else if (activeTab === 'precast') {
      if (inputs.wallL <= 0 || inputs.wallTotalH <= 0 || inputs.panelH <= 0 || inputs.panelThick <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.panelH >= inputs.wallTotalH) warnings.push("Panel height is greater than or equal to total wall height.");
      if (inputs.wallTotalH > inputs.panelThick * 40) warnings.push("High slenderness ratio: consider thicker panels or intermediate supports.");
      if (inputs.postSpacing <= 0) warnings.push("Post spacing must be greater than zero.");
    } else if (activeTab === 'staircase') {
      if (inputs.stairRise <= 0 || inputs.stairGoing <= 0 || inputs.stairSteps <= 0 || inputs.stairWidth <= 0 || inputs.stairWaist <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.stairRise > 0.25) warnings.push("Stair rise exceeds typical maximum (250mm).");
      if (inputs.stairGoing < 0.20) warnings.push("Stair going is below typical minimum (200mm).");
    } else if (activeTab === 'roof') {
      if (inputs.roofSpan <= 0 || inputs.roofRise <= 0 || inputs.roofRun <= 0) warnings.push("Dimensions must be greater than zero.");
      if (inputs.roofRise > inputs.roofSpan) warnings.push("Roof rise is unusually steep relative to span.");
    }
    return warnings;
  };
  const currentWarnings = getValidations();


  // Calculations — all delegated to src/lib/geometryCalc.ts (pure functions).
  // Bar sizes are inputs now (the old code hardcoded 12 mm main / 8 mm stirrups,
  // 0.888 / 0.395 kg/m); stirrup length uses stirrupLengthDetailed (IS 2502) as canonical.
  const geoRates = { cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg, sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft };
  const calculateRectangular = () => {
    const r = calcRectangular({ lengthM: inputs.rectL, widthM: inputs.rectW, depthM: inputs.rectD, mainDiaMm: inputs.rectMainDia, mainBarCount: inputs.rectRebarCount, stirrupDiaMm: inputs.rectStirrupDia, stirrupSpacingM: inputs.rectStirrupSpacing, coverMm: inputs.rectCover, formedOnGround, fck, wastagePct: wastage }, geoRates);
    return { vol: r.volM3, formwork: r.formworkM2, formworkAll: r.formworkAllSidesM2, totalSteel: r.totalSteelKg, mainSteel: r.mainSteelKg, stirrupSteel: r.stirrupSteelKg, plywood: calcPlywood(r.formworkM2), battens: calcBattens(r.formworkM2), materials: r.materials, costLines: r.costLines, totalCost: r.totalCost, steps: r.steps, errors: r.errors, warnings: r.warnings };
  };

  const calculateCircular = () => {
    const r = calcCircular({ diaM: inputs.circDia, heightM: inputs.circH, mainDiaMm: inputs.circMainDia, mainBarCount: inputs.circRebarCount, tieDiaMm: inputs.circTieDia, tiePitchM: inputs.circTiePitch, coverMm: inputs.circCover, fck, wastagePct: wastage }, geoRates);
    return { vol: r.volM3, formwork: r.formworkM2, totalSteel: r.totalSteelKg, mainSteel: r.mainSteelKg, stirrupSteel: r.stirrupSteelKg, plywood: calcPlywood(r.formworkM2), battens: calcBattens(r.formworkM2), materials: r.materials, costLines: r.costLines, totalCost: r.totalCost, steps: r.steps, errors: r.errors, warnings: r.warnings };
  };

  const calculateTube = () => {
    const r = calcTube({ odM: inputs.tubeOD, idM: inputs.tubeID, lengthM: inputs.tubeL, fck, wastagePct: wastage }, geoRates);
    return { vol: r.volM3, weight: r.weightKg ?? 0, formwork: r.formworkM2, plywood: calcPlywood(r.formworkM2), battens: calcBattens(r.formworkM2), materials: r.materials, costLines: r.costLines, totalCost: r.totalCost, steps: r.steps, errors: r.errors, warnings: r.warnings };
  };

  const calculatePrecast = () => {
    const r = calcPrecast({ wallLengthM: inputs.wallL, wallHeightM: inputs.wallTotalH, panelHeightM: inputs.panelH, panelThickM: inputs.panelThick, postSpacingM: inputs.postSpacing, postSizeM: inputs.postSize, footingSizeM: inputs.footingSize, footingDepthM: inputs.footingDepth, fck, wastagePct: wastage }, geoRates);
    return { totalPanels: r.extra?.totalPanels ?? 0, postCount: r.extra?.postCount ?? 0, totalVol: r.volM3, footingVol: r.extra?.footingVol ?? 0, materials: r.materials, costLines: r.costLines, totalCost: r.totalCost, steps: r.steps, errors: r.errors, warnings: r.warnings };
  };

  const calculateStaircase = () => {
    // Delegates to the staircase engine: DESIGNED steel (IS 456 Cl. 33).
    // Resolves the old inconsistency — this tab used a flat 120 kg/m³ while the
    // Staircase Calculator used 1% (= 78.5 kg/m³); same flight gave two answers.
    // Designed steel is now the single value in both places; the 1% rule is a cross-check.
    const r = calcStaircaseTab({ shape: "straight", steps: inputs.stairSteps, riseM: inputs.stairRise, treadM: inputs.stairGoing, widthM: inputs.stairWidth, waistM: inputs.stairWaist, mainDiaMm: inputs.stairMainDia, mainSpacingMm: inputs.stairMainSpacing, distDiaMm: inputs.stairDistDia, distSpacingMm: inputs.stairDistSpacing, coverMm: inputs.stairCover, fck, wastagePct: wastage, cementPerBag: rates.cementPerBag, steelPerKg: rates.steelPerKg, sandPerCft: rates.sandPerCft, crushPerCft: rates.crushPerCft });
    return { vol: r.wetVolM3, formwork: r.formworkM2, steel: r.designedSteelKg, onePctKg: r.onePctRuleKg, mainBars: r.mainBars, distBars: r.distBars, plywood: calcPlywood(r.formworkM2), battens: calcBattens(r.formworkM2), materials: r.materials, costLines: r.costLines, totalCost: r.totalCost, steps: r.steps, errors: r.errors, warnings: r.warnings };
  };

  const calculateRoof = () => {
    const r = calcRoof({ spanM: inputs.roofSpan, riseM: inputs.roofRise, runM: inputs.roofRun, purlinSpacingM: inputs.roofPurlinSpacing, battenSpacingM: inputs.roofBattenSpacing, sheetWidthM: inputs.roofSheetWidth });
    return { rafterLength: r.rafterM, angleDeg: r.pitchDeg, pitchRatio: (inputs.roofRise / (inputs.roofSpan / 2)) * 12, area: r.areaM2, purlinsM: r.purlinsM, battensM: r.battensM, sheets: r.sheets, plywood: r.sheets, battens: Math.ceil(r.battensM), errors: r.errors };
  };

  const calculateTrapFooting = () => {
    const r = calcTrapFooting({ baseLengthM: inputs.trapL, baseWidthM: inputs.trapW, baseDepthM: inputs.trapD1, topLengthM: inputs.trapL2, topWidthM: inputs.trapW2, slopeDepthM: inputs.trapD2, fck, wastagePct: wastage }, geoRates);
    return { vol: r.volM3, formwork: r.formworkM2, materials: r.materials, costLines: r.costLines, totalCost: r.totalCost, steps: r.steps, errors: r.errors, warnings: r.warnings };
  };

  // Active-tab result (for cost / export / steps display below the grid).
  const activeResult: any = activeTab === 'rectangular' ? calculateRectangular()
    : activeTab === 'circular' ? calculateCircular()
    : activeTab === 'tube' ? calculateTube()
    : activeTab === 'precast' ? calculatePrecast()
    : activeTab === 'staircase' ? calculateStaircase()
    : activeTab === 'roof' ? calculateRoof()
    : calculateTrapFooting();

  const syncToBOQ = () => {
    // Real PK rates from useRates — the old hardcoded rates (12000/m³, 260/kg…) are gone.
    const res: any = activeResult;
    if (res.materials) {
      addItem({ name: 'Cement', quantity: res.materials.cementBags, unit: 'bags', rate: rates.cementPerBag ?? 0, category: 'Concrete' });
      addItem({ name: 'Sand', quantity: res.materials.sandCft, unit: 'cft', rate: rates.sandPerCft ?? 0, category: 'Concrete' });
      addItem({ name: 'Aggregate', quantity: res.materials.aggCft, unit: 'cft', rate: rates.crushPerCft ?? 0, category: 'Concrete' });
    }
    const steelKg = res.totalSteel ?? res.steel;
    if (steelKg) addItem({ name: 'Steel Reinforcement', quantity: steelKg, unit: 'kg', rate: rates.steelPerKg ?? 0, category: 'Steel' });
    if (res.formwork) addItem({ name: 'Formwork Area', quantity: res.formwork, unit: 'm²', rate: 0, category: 'Formwork' });
    if (activeTab === 'precast') {
      addItem({ name: 'Precast Panels', quantity: res.totalPanels, unit: 'Nos', rate: 0, category: 'Concrete' });
      addItem({ name: 'Precast Posts', quantity: res.postCount, unit: 'Nos', rate: 0, category: 'Concrete' });
    }
    if (activeTab === 'roof') {
      addItem({ name: 'Sloped Roofing Surface', quantity: res.area, unit: 'm²', rate: 0, category: 'Finishes' });
      addItem({ name: 'Roofing Sheets', quantity: res.sheets, unit: 'Nos', rate: 0, category: 'Finishes' });
    }
  };

  const tabs = [
    { id: 'rectangular', name: 'Rectangular', icon: <Square size={16} /> },
    { id: 'circular', name: 'Circular', icon: <Circle size={16} /> },
    { id: 'tube', name: 'Concrete Tube', icon: <CircleDashed size={16} /> },
    { id: 'precast', name: 'Precast Wall', icon: <AlignJustify size={16} /> },
    { id: 'staircase', name: 'Staircase', icon: <Baseline size={16} /> },
    { id: 'roof', name: 'Roof Pitch', icon: <Triangle size={16} /> },
    { id: 'trapfooting', name: 'Trap. Footing', icon: <Square size={16} /> }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-txt-primary dark:text-white tracking-tight">Universal Structural Geometry</h2>
          <p className="text-txt-tertiary dark:text-txt-tertiary mt-1">Unified engine for complex shapes, formwork, steel, and concrete volumes.</p>
          <p className="text-sm text-txt-secondary mt-2 max-w-3xl">Volumes, formwork, bar schedules and material cost for beams, columns, tubes, precast walls, stairs, roofs and trapezoidal footings. Bar sizes are inputs (no more hardcoded 12/8 mm); stirrup length follows IS 2502 (detailed); formwork for a ground beam is the two sides plus the two ends, 2·D·(L+W) — the bottom is formed on the ground — while a suspended beam also needs the soffit. Staircase steel is designed (IS 456 Cl. 33), not the old flat 120 kg/m³.</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={formedOnGround} onChange={(e) => setFormedOnGround(e.target.checked)} className="w-4 h-4 rounded border-ui-borderDefault text-accent-800 focus:ring-accent-500" /> Beam formed on ground (no bottom formwork)</label>
            <label className="flex items-center gap-2 font-medium">fck <select value={fck} onChange={(e) => setFck(Number(e.target.value))} className="bg-surface-default border border-ui-borderSubtle rounded-lg px-2 py-1">{[20, 25, 30, 35, 40].map((g) => (<option key={g} value={g}>M{g}</option>))}</select></label>
            <label className="flex items-center gap-2 font-medium">Wastage <input type="number" value={wastage} onChange={(e) => setWastage(Number(e.target.value) || 0)} className="w-16 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 py-1" /> %</label>
            <label className="flex items-center gap-2 font-medium">Cement ({table.currency}/bag) <input type="number" value={rates.cementPerBag ?? ""} onChange={(e) => setRate("cementPerBag", e.target.value === "" ? null : Number(e.target.value))} className="w-20 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 py-1" /></label>
            <label className="flex items-center gap-2 font-medium">Steel ({table.currency}/kg) <input type="number" value={rates.steelPerKg ?? ""} onChange={(e) => setRate("steelPerKg", e.target.value === "" ? null : Number(e.target.value))} className="w-20 bg-surface-default border border-ui-borderSubtle rounded-lg px-2 py-1" /></label>
          </div>
          <EngineNotices errors={activeResult.errors ?? []} warnings={[...(activeResult.warnings ?? []), ...currentWarnings]} />
        </div>
        <Button 
          onClick={syncToBOQ}
          className="bg-ink hover:bg-ink-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-brand-lg shadow-accent-500/30 transition-all shrink-0"
        >
          <Save size={18} /> Sync to BOQ
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 bg-surface-default dark:bg-ink p-2 rounded-xl shadow-brand-sm border border-ui-borderSubtle dark:border-ink-600">
        {tabs.map(t => (
          <Button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-accent-50 dark:bg-accent-500/20 text-accent-800 dark:text-accent-400 shadow-brand-sm' : 'text-txt-secondary dark:text-txt-tertiary hover:bg-surface-hover dark:hover:bg-ink-600/50'}`}
          >
            {t.icon} <span className="hidden sm:inline">{t.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Input Panel */}
        <div className="lg:col-span-7 bg-surface-default dark:bg-ink rounded-2xl shadow-brand-sm border border-ui-borderSubtle dark:border-ink-600 p-6">
          <h2 className="text-xl font-bold mb-6 text-txt-primary dark:text-white border-b border-ui-borderSubtle dark:border-ink-600 pb-4">
            Geometry Parameters
          </h2>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {activeTab === 'rectangular' && (
                <>
                  <InputGroup label="Length [m]" name="rectL" value={inputs.rectL} onChange={handleInput} />
                  <InputGroup label="Width [m]" name="rectW" value={inputs.rectW} onChange={handleInput} />
                  <InputGroup label="Depth [m]" name="rectD" value={inputs.rectD} onChange={handleInput} />
                  <InputGroup label="Main Rebar Count" name="rectRebarCount" value={inputs.rectRebarCount} onChange={handleInput} />
                  <InputGroup label="Stirrup Spacing c/c [m]" name="rectStirrupSpacing" value={inputs.rectStirrupSpacing} onChange={handleInput} />
                  <InputGroup label="Main Bar Dia [mm]" name="rectMainDia" value={inputs.rectMainDia} onChange={handleInput} />
                  <InputGroup label="Stirrup Dia [mm]" name="rectStirrupDia" value={inputs.rectStirrupDia} onChange={handleInput} />
                  <InputGroup label="Clear Cover [mm]" name="rectCover" value={inputs.rectCover} onChange={handleInput} />
                </>
              )}

              {activeTab === 'circular' && (
                <>
                  <InputGroup label="Diameter [m]" name="circDia" value={inputs.circDia} onChange={handleInput} />
                  <InputGroup label="Height / Length [m]" name="circH" value={inputs.circH} onChange={handleInput} />
                  <InputGroup label="Main Rebar Count" name="circRebarCount" value={inputs.circRebarCount} onChange={handleInput} />
                  <InputGroup label="Spiral Tie Pitch [m]" name="circTiePitch" value={inputs.circTiePitch} onChange={handleInput} />
                  <InputGroup label="Main Bar Dia [mm]" name="circMainDia" value={inputs.circMainDia} onChange={handleInput} />
                  <InputGroup label="Tie Dia [mm]" name="circTieDia" value={inputs.circTieDia} onChange={handleInput} />
                  <InputGroup label="Clear Cover [mm]" name="circCover" value={inputs.circCover} onChange={handleInput} />
                </>
              )}

              {activeTab === 'tube' && (
                <>
                  <InputGroup label="Outer Diameter (OD) [m]" name="tubeOD" value={inputs.tubeOD} onChange={handleInput} />
                  <InputGroup label="Inner Diameter (ID) [m]" name="tubeID" value={inputs.tubeID} onChange={handleInput} />
                  <InputGroup label="Tube Length (L) [m]" name="tubeL" value={inputs.tubeL} onChange={handleInput} />
                </>
              )}

              {activeTab === 'precast' && (
                <>
                  <InputGroup label="Total Wall Length [m]" name="wallL" value={inputs.wallL} onChange={handleInput} />
                  <InputGroup label="Total Wall Height [m]" name="wallTotalH" value={inputs.wallTotalH} onChange={handleInput} />
                  <InputGroup label="Panel Height [m]" name="panelH" value={inputs.panelH} onChange={handleInput} />
                  <InputGroup label="Panel Thickness [m]" name="panelThick" value={inputs.panelThick} onChange={handleInput} />
                  <InputGroup label="Post Spacing c/c [m]" name="postSpacing" value={inputs.postSpacing} onChange={handleInput} />
                  <InputGroup label="Post Size [m]" name="postSize" value={inputs.postSize} onChange={handleInput} />
                  <InputGroup label="Footing Size [m]" name="footingSize" value={inputs.footingSize} onChange={handleInput} />
                  <InputGroup label="Footing Depth [m]" name="footingDepth" value={inputs.footingDepth} onChange={handleInput} />
                </>
              )}

              {activeTab === 'staircase' && (
                <>
                  <InputGroup label="Number of Steps" name="stairSteps" value={inputs.stairSteps} onChange={handleInput} />
                  <InputGroup label="Step Rise [m]" name="stairRise" value={inputs.stairRise} onChange={handleInput} />
                  <InputGroup label="Step Going [m]" name="stairGoing" value={inputs.stairGoing} onChange={handleInput} />
                  <InputGroup label="Stair Width [m]" name="stairWidth" value={inputs.stairWidth} onChange={handleInput} />
                  <InputGroup label="Waist Slab Thick [m]" name="stairWaist" value={inputs.stairWaist} onChange={handleInput} />
                  <InputGroup label="Main Bar Dia [mm]" name="stairMainDia" value={inputs.stairMainDia} onChange={handleInput} />
                  <InputGroup label="Main Spacing [mm]" name="stairMainSpacing" value={inputs.stairMainSpacing} onChange={handleInput} />
                  <InputGroup label="Dist. Bar Dia [mm]" name="stairDistDia" value={inputs.stairDistDia} onChange={handleInput} />
                  <InputGroup label="Dist. Spacing [mm]" name="stairDistSpacing" value={inputs.stairDistSpacing} onChange={handleInput} />
                  <InputGroup label="Clear Cover [mm]" name="stairCover" value={inputs.stairCover} onChange={handleInput} />
                </>
              )}

              {activeTab === 'trapfooting' && (
                <>
                  <InputGroup label="Base Length [m]" name="trapL" value={inputs.trapL} onChange={handleInput} />
                  <InputGroup label="Base Width [m]" name="trapW" value={inputs.trapW} onChange={handleInput} />
                  <InputGroup label="Base Depth [m]" name="trapD1" value={inputs.trapD1} onChange={handleInput} />
                  <InputGroup label="Top Length [m]" name="trapL2" value={inputs.trapL2} onChange={handleInput} />
                  <InputGroup label="Top Width [m]" name="trapW2" value={inputs.trapW2} onChange={handleInput} />
                  <InputGroup label="Slope Depth [m]" name="trapD2" value={inputs.trapD2} onChange={handleInput} />
                </>
              )}

              {activeTab === 'roof' && (
                <>
                  <InputGroup label="Total Span [m]" name="roofSpan" value={inputs.roofSpan} onChange={handleInput} />
                  <InputGroup label="Roof Rise [m]" name="roofRise" value={inputs.roofRise} onChange={handleInput} />
                  <InputGroup label="Roof Run (Building Length) [m]" name="roofRun" value={inputs.roofRun} onChange={handleInput} />
                  <InputGroup label="Purlin Spacing [m]" name="roofPurlinSpacing" value={inputs.roofPurlinSpacing} onChange={handleInput} />
                  <InputGroup label="Batten Spacing [m]" name="roofBattenSpacing" value={inputs.roofBattenSpacing} onChange={handleInput} />
                  <InputGroup label="Sheet Width [m]" name="roofSheetWidth" value={inputs.roofSheetWidth} onChange={handleInput} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
          {currentWarnings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex flex-col gap-2"
            >
              {currentWarnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-3 bg-accent-50 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 p-4 rounded-xl border border-accent-200 dark:border-accent-800/50">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{warn}</p>
                </div>
              ))}
            </motion.div>
          )}

        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ink text-white rounded-2xl shadow-brand-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-bl-full pointer-events-none" />
            <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">
              Analysis Results
            </h2>
            
            <div className="space-y-4 relative z-10">
              {activeTab === 'rectangular' && (() => {
                const res = calculateRectangular();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Formwork Plywood" value={res.plywood} unit="Nos" />
                    <ResultRow label="Total Steel Weight" value={res.totalSteel} unit="kg" />
                  </>
                );
              })()}
              {activeTab === 'circular' && (() => {
                const res = calculateCircular();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Formwork Plywood" value={res.plywood} unit="Nos" />
                    <ResultRow label="Total Steel Weight" value={res.totalSteel} unit="kg" />
                  </>
                );
              })()}
              {activeTab === 'tube' && (() => {
                const res = calculateTube();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Tube Weight" value={res.weight} unit="kg" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                  </>
                );
              })()}
              {activeTab === 'precast' && (() => {
                const res = calculatePrecast();
                return (
                  <>
                    <ResultRow label="Precast Panels" value={res.totalPanels} unit="Nos" />
                    <ResultRow label="Precast Posts" value={res.postCount} unit="Nos" />
                    <ResultRow label="Total Concrete Vol" value={res.totalVol} unit="m³" />
                    <ResultRow label="Footing Concrete" value={res.footingVol} unit="m³" />
                  </>
                );
              })()}
              {activeTab === 'staircase' && (() => {
                const res = calculateStaircase();
                return (
                  <>
                    <ResultRow label="Total Concrete Vol" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Designed Steel" value={res.steel} unit="kg" />
                    <ResultRow label="1% rule (cross-check)" value={res.onePctKg} unit="kg" />
                    <ResultRow label="Main / Dist. Bars" value={res.mainBars} unit={`+ ${res.distBars} dist.`} />
                  </>
                );
              })()}
              {activeTab === 'roof' && (() => {
                const res = calculateRoof();
                return (
                  <>
                    <ResultRow label="Rafter Length" value={res.rafterLength} unit="m" />
                    <ResultRow label="Pitch Angle" value={res.angleDeg} unit="°" />
                    <ResultRow label="Pitch Ratio" value={res.pitchRatio} unit=":12" />
                    <ResultRow label="Sloped Area" value={res.area} unit="m²" />
                    <ResultRow label="Purlins" value={res.purlinsM} unit="m" />
                    <ResultRow label="Battens" value={res.battensM} unit="m" />
                    <ResultRow label="Roofing Sheets" value={res.sheets} unit="Nos" />
                  </>
                );
              })()}
              {activeTab === 'trapfooting' && (() => {
                const res = calculateTrapFooting();
                return (
                  <>
                    <ResultRow label="Concrete Volume" value={res.vol} unit="m³" />
                    <ResultRow label="Formwork Area" value={res.formwork} unit="m²" />
                    <ResultRow label="Cement" value={res.materials.cementBags} unit="bags" />
                  </>
                );
              })()}
              {activeResult.costLines && (
                <>
                  <ResultRow label="Cement" value={activeResult.materials?.cementBags ?? 0} unit="bags" />
                  <ResultRow label="Sand / Aggregate" value={activeResult.materials?.sandCft ?? 0} unit={`cft / ${(activeResult.materials?.aggCft ?? 0).toFixed(0)} cft`} />
                  <ResultRow label="Total Cost" value={activeResult.totalCost ?? 0} unit={table.currency} />
                </>
              )}
            </div>
          </div>

          <div className="bg-surface-default dark:bg-ink rounded-2xl shadow-brand-sm border border-ui-borderSubtle dark:border-ink-600 p-6 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-txt-tertiary uppercase tracking-wider mb-4 w-full text-left">Cross Section</h3>
            <div className="w-full max-w-[200px] aspect-square flex items-center justify-center bg-surface-default rounded-xl border border-ui-borderSubtle dark:border-ink-600 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {activeTab === 'rectangular' && <RectangularSVG w={inputs.rectW} d={inputs.rectD} />}
                  {activeTab === 'circular' && <CircularSVG d={inputs.circDia} />}
                  {activeTab === 'tube' && <HollowTubeSVG od={inputs.tubeOD} id={inputs.tubeID} />}
                  {activeTab === 'precast' && <PrecastWallSVG totalH={inputs.wallTotalH} panelH={inputs.panelH} />}
                  {activeTab === 'staircase' && <StaircaseSVG rise={inputs.stairRise} going={inputs.stairGoing} />}
                  {activeTab === 'roof' && <RoofPitchSVG rise={inputs.roofRise} span={inputs.roofSpan} />}
                  {activeTab === 'trapfooting' && <RectangularSVG w={inputs.trapW} d={inputs.trapD1 + inputs.trapD2} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16 space-y-6">
        {activeResult.costLines && (
          <div className="bg-surface-default rounded-2xl border border-ui-borderSubtle p-6">
            <h3 className="font-bold text-txt-primary mb-3">Materials &amp; Cost</h3>
            <div className="space-y-1 text-sm">
              {activeResult.costLines.map((l: any) => (
                <div key={l.label} className="flex justify-between"><span className="text-txt-secondary">{l.label}</span><span className="font-mono">{l.amount == null ? "—" : `${formatRate(l.rate, table.currency)} × ${l.qty.toFixed(1)} = ${l.amount.toLocaleString("en-US")}`}</span></div>
              ))}
            </div>
          </div>
        )}
        {/* The roof tab has no materials or cost — its export is the "Sync
            to BOQ" button above, so the materials export bar is hidden here
            rather than shown empty. */}
        {activeTab !== 'roof' && (
        <StructuralExportBar title={`Universal Structural Geometry — ${activeTab}`} summaryText={`Universal geometry (${activeTab}): volume ${activeResult.vol?.toFixed?.(2) ?? activeResult.totalVol?.toFixed?.(2) ?? "—"} m³, formwork ${activeResult.formwork?.toFixed?.(2) ?? "—"} m², steel ${activeResult.totalSteel?.toFixed?.(1) ?? activeResult.steel?.toFixed?.(1) ?? "—"} kg, cost ${activeResult.totalCost == null ? "—" : activeResult.totalCost.toLocaleString("en-US")} ${table.currency}.`}
          boqItems={activeResult.materials ? [
            { description: "Cement", quantity: activeResult.materials.cementBags, unit: "bags", rate: rates.cementPerBag ?? 0 },
            { description: "Sand", quantity: activeResult.materials.sandCft, unit: "cft", rate: rates.sandPerCft ?? 0 },
            { description: "Aggregate", quantity: activeResult.materials.aggCft, unit: "cft", rate: rates.crushPerCft ?? 0 },
            ...(activeResult.totalSteel || activeResult.steel ? [{ description: "Steel reinforcement", quantity: activeResult.totalSteel ?? activeResult.steel, unit: "kg", rate: rates.steelPerKg ?? 0 }] : []),
          ] : []}
          totalAmount={activeResult.totalCost ?? null} />
        )}
        {activeResult.steps && <CalcSteps steps={activeResult.steps} />}
      </div>
    </div>
  );
}

function InputGroup({ label, name, value, onChange }: { label: string, name: string, value: number, onChange: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={0}
        step={0.01}
        className="w-full bg-surface-default border border-ui-borderSubtle dark:border-ink-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-accent-500 focus:border-accent-800 outline-none transition-all text-txt-primary dark:text-white font-mono"
      />
    </div>
  );
}

function ResultRow({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
      <span className="text-white/70 text-sm font-medium">{label}</span>
      <div className="text-right">
        <span className="text-xl font-bold text-white">
          {isNaN(value) || !isFinite(value) ? "—" : (value % 1 === 0 && unit === 'Nos' ? value : value.toFixed(2))}
        </span>
        <span className="text-accent-400 ml-1.5 text-sm">{unit}</span>
      </div>
    </div>
  );
}

// --- SVG PREVIEWS ---
// --- SVG PREVIEWS ---
const SvgDefs = () => (
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
      <path d="M 0 0 L 6 3 L 0 6 z" fill="currentColor" />
    </marker>
  </defs>
);

const RectangularSVG = ({ w, d }: { w: number, d: number }) => {
  const maxDim = Math.max(w, d) || 1;
  const scale = 50 / maxDim;
  const sw = Math.max(w * scale, 10);
  const sd = Math.max(d * scale, 10);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-accent-800 drop-shadow-md">
      <SvgDefs />
      <motion.rect 
        initial={false}
        animate={{ x: 50 - sw / 2, y: 50 - sd / 2, width: sw, height: sd }}
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.rect 
        initial={false}
        animate={{ x: 50 - sw / 2 + (sw > 16 ? 8 : 2), y: 50 - sd / 2 + (sd > 16 ? 8 : 2), width: Math.max(1, sw - (sw > 16 ? 16 : 4)), height: Math.max(1, sd - (sd > 16 ? 16 : 4)) }}
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <motion.circle initial={false} animate={{ cx: 50 - sw/2 + (sw > 16 ? 10 : 3), cy: 50 - sd/2 + (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 + sw/2 - (sw > 16 ? 10 : 3), cy: 50 - sd/2 + (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 - sw/2 + (sw > 16 ? 10 : 3), cy: 50 + sd/2 - (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ cx: 50 + sw/2 - (sw > 16 ? 10 : 3), cy: 50 + sd/2 - (sd > 16 ? 10 : 3), r: 2.5 }} fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      
      <motion.line initial={false} animate={{ x1: 50 - sw / 2, y1: 50 + sd / 2 + 10, x2: 50 + sw / 2, y2: 50 + sd / 2 + 10 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50, y: 50 + sd / 2 + 18 }} textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{w}m</motion.text>
      
      <motion.line initial={false} animate={{ x1: 50 + sw / 2 + 10, y1: 50 - sd / 2, x2: 50 + sw / 2 + 10, y2: 50 + sd / 2 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50 + sw / 2 + 15, y: 50 }} textAnchor="start" alignmentBaseline="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{d}m</motion.text>
    </svg>
  );
};

const CircularSVG = ({ d }: { d: number }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-accent-800 drop-shadow-md">
    <SvgDefs />
    <motion.circle initial={false} animate={{ r: 35 }} cx="50" cy="50" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.circle initial={false} animate={{ r: 28 }} cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    {[0, 60, 120, 180, 240, 300].map(angle => {
      const rad = (angle * Math.PI) / 180;
      return <motion.circle key={angle} cx={50 + 28 * Math.cos(rad)} cy={50 + 28 * Math.sin(rad)} r="3" fill="currentColor" transition={{ type: "spring", stiffness: 300, damping: 30 }} />;
    })}
    <motion.line initial={false} animate={{ x1: 15, y1: 50, x2: 85, y2: 50 }} stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.line initial={false} animate={{ x1: 15, y1: 90, x2: 85, y2: 90 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
    <motion.text initial={false} animate={{ x: 50, y: 98 }} textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Ø {d}m</motion.text>
  </svg>
);

const HollowTubeSVG = ({ od, id }: { od: number, id: number }) => {
  const maxDim = Math.max(od, 0.001);
  const scale = 35 / maxDim;
  const rOD = od * scale;
  const rID = Math.max(id * scale, 0);
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-accent-800 drop-shadow-md">
      <SvgDefs />
      <motion.circle initial={false} animate={{ r: rOD }} cx="50" cy="50" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ r: rID }} cx="50" cy="50" fill="white" stroke="currentColor" strokeWidth="3" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.circle initial={false} animate={{ r: (rOD + rID) / 2 }} cx="50" cy="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      
      <motion.line initial={false} animate={{ x1: 50, y1: 50, x2: 50 + rOD, y2: 50 }} stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 50 + rOD / 2, y: 48 }} textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>OD {od}m</motion.text>

      <motion.line initial={false} animate={{ x1: 50, y1: 50, x2: 50, y2: 50 + rID }} stroke="currentColor" strokeWidth="1" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 48, y: 50 + rID / 2 }} textAnchor="end" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>ID {id}m</motion.text>
    </svg>
  );
};

const PrecastWallSVG = ({ totalH, panelH }: { totalH: number, panelH: number }) => {
  const numPanels = Math.max(1, Math.min(6, Math.floor(totalH / (panelH || 1))));
  const panelHeightVisual = 60 / numPanels;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-accent-800 drop-shadow-md">
      <SvgDefs />
      <motion.rect initial={false} animate={{ x: 20, y: 10, width: 10, height: 75 }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.rect initial={false} animate={{ x: 70, y: 10, width: 10, height: 75 }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      {Array.from({length: numPanels}).map((_, i) => (
        <motion.rect key={i} initial={false} animate={{ x: 30, y: 85 - (i + 1) * panelHeightVisual, width: 40, height: panelHeightVisual - 2 }} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      ))}

      <motion.line initial={false} animate={{ x1: 85, y1: 10, x2: 85, y2: 85 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 88, y: 47.5 }} textAnchor="start" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>H {totalH}m</motion.text>
    </svg>
  );
};

const StaircaseSVG = ({ rise, going }: { rise: number, going: number }) => {
  const steps = 3;
  const ratio = (going || 1) / (rise || 1);
  const stepW = 60 / steps;
  const stepH = stepW / ratio;
  
  const pathData = `M 20,80 L 80,80 L 80,${80 - stepH} L ${80 - stepW},${80 - stepH} L ${80 - stepW},${80 - 2 * stepH} L ${80 - 2 * stepW},${80 - 2 * stepH} L ${80 - 2 * stepW},${80 - 3 * stepH} L 20,${80 - 3 * stepH} Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-accent-800 drop-shadow-md">
      <SvgDefs />
      <motion.path 
        initial={false} 
        animate={{ d: pathData }} 
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      />
      <motion.path 
        initial={false} 
        animate={{ d: `M 25,75 L 80,${75 - Math.min(60, 3 * stepH)}` }} 
        fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" 
        transition={{ type: "spring", stiffness: 300, damping: 30 }} 
      />

      <motion.line initial={false} animate={{ x1: 80 - stepW, y1: 80 - stepH - 5, x2: 80, y2: 80 - stepH - 5 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 80 - stepW / 2, y: 80 - stepH - 8 }} textAnchor="middle" fontSize="4" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{going}m (G)</motion.text>

      <motion.line initial={false} animate={{ x1: 85, y1: 80 - stepH, x2: 85, y2: 80 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: 88, y: 80 - stepH / 2 }} textAnchor="start" alignmentBaseline="middle" fontSize="4" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>{rise}m (R)</motion.text>
    </svg>
  );
};

const RoofPitchSVG = ({ rise, span }: { rise: number, span: number }) => {
  const maxDim = Math.max(span, rise * 2, 1);
  const scale = 60 / maxDim;
  const w = span * scale;
  const h = rise * scale;
  
  const cx = 50;
  const by = 80; // base y
  const pathData = `M ${cx},${by - h} L ${cx - w/2},${by} L ${cx + w/2},${by} Z`;
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full text-accent-800 drop-shadow-md">
      <SvgDefs />
      <motion.path initial={false} animate={{ d: pathData }} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.path initial={false} animate={{ d: `M ${cx},${by - h} L ${cx},${by}` }} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.rect initial={false} animate={{ x: cx - w/2, y: by, width: w, height: 5 }} fill="none" stroke="currentColor" strokeWidth="2" transition={{ type: "spring", stiffness: 300, damping: 30 }} />

      <motion.line initial={false} animate={{ x1: cx - w/2, y1: by + 10, x2: cx + w/2, y2: by + 10 }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: cx, y: by + 18 }} textAnchor="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Span {span}m</motion.text>

      <motion.line initial={false} animate={{ x1: cx + w/2 + 5, y1: by - h, x2: cx + w/2 + 5, y2: by }} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow)" markerEnd="url(#arrow)" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
      <motion.text initial={false} animate={{ x: cx + w/2 + 8, y: by - h/2 }} textAnchor="start" alignmentBaseline="middle" fontSize="5" fill="currentColor" fontWeight="bold" transition={{ type: "spring", stiffness: 300, damping: 30 }}>Rise {rise}m</motion.text>
    </svg>
  );
};
