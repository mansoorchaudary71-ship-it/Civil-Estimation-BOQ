import React, { useMemo, useState } from "react";
import { Bug, Droplets, FlaskConical, AlertTriangle, Copy, Printer, Download, Check } from "lucide-react";
import { NumberInput } from "../ui/NumberInput";
import { ResultCard } from "../ui/ResultCard";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CalculationHistory } from "../ui/CalculationHistory";
import { FormulaAccordion } from "../ui/FormulaAccordion";
import { Button } from "../ui/Button";
import { exportBOQToPDF } from "../../lib/pdfExport";
import {
  ANTITERMITE_CHEMICALS,
  calcAntiTermite,
  validateAntiTermiteInputs,
} from "../../lib/antiTermiteCalc";


const CUR_SYMBOLS: Record<string, string> = { PKR: "Rs", INR: "₹", AED: "AED" };

export default function AntiTermiteCalculator() {
  const [floorArea, setFloorArea] = useState<number | "">(100);
  const [perimeter, setPerimeter] = useState<number | "">(40);
  const [trenchWidth, setTrenchWidth] = useState<number | "">(0.6);
  const [trenchDepth, setTrenchDepth] = useState<number | "">(0.3);
  const [chemicalId, setChemicalId] = useState("bifenthrin");
  const [customRatio, setCustomRatio] = useState<number | "">(19);
  const [wastagePct, setWastagePct] = useState<number | "">(5);
  const [packSize, setPackSize] = useState<number | "">(5);
  const [includePeriphery, setIncludePeriphery] = useState(false);
  const [verticalArea, setVerticalArea] = useState<number | "">(0);
  const [currency, setCurrency] = useState("PKR");
  const [ratePerLitre, setRatePerLitre] = useState<number | "">("");
  const [labourPerM2, setLabourPerM2] = useState<number | "">("");
  const [equipmentLumpSum, setEquipmentLumpSum] = useState<number | "">("");
  const [copied, setCopied] = useState(false);

  const chemical = ANTITERMITE_CHEMICALS.find((c) => c.id === chemicalId) ?? ANTITERMITE_CHEMICALS[0];

  const { result, errors } = useMemo(() => {
    try {
      const inp = {
        floorAreaM2: Number(floorArea),
        trenchLengthM: Number(perimeter),
        trenchWidthM: Number(trenchWidth),
        trenchDepthM: Number(trenchDepth),
        includeExternalPeriphery: includePeriphery,
        verticalAreaM2: Number(verticalArea) || 0,
        chemical,
        customWaterParts: Number(customRatio) || 19,
        wastagePct: Number(wastagePct) || 0,
        packSizeL: Number(packSize) || 5,
        ratePerLitreConcentrate: ratePerLitre === "" ? null : Number(ratePerLitre),
        labourPerM2: labourPerM2 === "" ? null : Number(labourPerM2),
        equipmentLumpSum: equipmentLumpSum === "" ? 0 : Number(equipmentLumpSum),
      };
      const errs = validateAntiTermiteInputs(inp);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcAntiTermite(inp), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [floorArea, perimeter, trenchWidth, trenchDepth, includePeriphery, verticalArea, chemical, customRatio, wastagePct, packSize, ratePerLitre, labourPerM2, equipmentLumpSum]);

  const sym = CUR_SYMBOLS[currency] ?? "Rs";
  const fmt = (v: number | null | undefined) =>
    v == null || !isFinite(v) ? "—" : `${sym} ${Math.round(v).toLocaleString("en-US")}`;

  const summaryText = result
    ? `Anti-termite treatment (IS 6313-2:2022)\nFloor ${floorArea} m², trench ${perimeter} m x ${trenchWidth} m\nTrench bottom ${result.trenchBottomL.toFixed(1)} L; trench sides ${result.trenchSidesL.toFixed(1)} L; floor ${result.floorL.toFixed(1)} L\nTotal emulsion ${result.totalEmulsionL.toFixed(1)} L (${chemical.name} 1:${result.waterParts})\nConcentrate ${result.concentrateL.toFixed(1)} L; water ${result.waterL.toFixed(1)} L\nPacks: ${result.packs} x ${packSize} L\n${result.totalCost != null ? `Total cost ${fmt(result.totalCost)}` : "Cost: enter a concentrate price to price this job."}`
    : "";

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handlePdf = () => {
    if (!result) return;
    const items = [
      { description: "Trench bottom emulsion", quantity: result.trenchBottomL, unit: "L", rate: 0, amount: 0 },
      { description: "Trench sides emulsion (7.5 L/m)", quantity: result.trenchSidesL, unit: "L", rate: 0, amount: 0 },
      { description: "Floor / plinth emulsion (5 L/m²)", quantity: result.floorL, unit: "L", rate: 0, amount: 0 },
      { description: `${chemical.name} concentrate`, quantity: result.concentrateL, unit: "L", rate: ratePerLitre === "" ? 0 : Number(ratePerLitre), amount: result.chemicalCost ?? 0 },
      // Labour and equipment were silently dropped from the PDF even
      // when priced — they are part of the total, so they are line items.
      ...(result.labourCost != null ? [{ description: "Labour (application)", quantity: Number(floorArea) || 0, unit: "m²", rate: labourPerM2 === "" ? 0 : Number(labourPerM2), amount: result.labourCost }] : []),
      ...(equipmentLumpSum !== "" && Number(equipmentLumpSum) > 0 ? [{ description: "Equipment hire (lump sum)", quantity: 1, unit: "lot", rate: Number(equipmentLumpSum), amount: Number(equipmentLumpSum) }] : []),
    ];
    exportBOQToPDF({ projectName: "Anti-Termite Treatment", date: new Date().toLocaleDateString(), items, totalAmount: result.totalCost ?? 0 });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden">
        <h2 className="flex items-center gap-2 mb-2 text-xl font-semibold text-txt-primary tracking-tight">
          <Bug className="w-6 h-6 text-accent-800" /> Anti-Termite Treatment &amp; Emulsion Engine
        </h2>
        <p className="text-sm text-txt-secondary mb-6">
          Quantities as per IS 6313-2:2022. Trench sides are dosed at 7.5 L <strong>per linear metre</strong> — the old perimeter × depth × 7.5 formula under-dosed by 50% and has been removed.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}
          </Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">
            <Printer size={16} /> Print
          </Button>
          <Button onClick={handlePdf} disabled={!result} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700">
            <Download size={16} /> Download PDF
          </Button>
        </div>

        {errors.length > 0 && (
          <div className="mb-6 bg-ui-error border border-ui-errorBorder rounded-2xl p-4 text-sm text-ui-errorText">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        )}

        <div className="flex flex-wrap gap-6 sm:gap-8 w-full items-start">
          <div className="flex-1 min-w-[min(100%,350px)] lg:max-w-[500px] w-full shrink-0 space-y-6">
            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary">Surface Dimensions</h3>
              <div className="space-y-4">
                <NumberInput label="Total Ground Floor Area" unit="m²" value={floorArea} onChange={setFloorArea} requirePositive error={errors.find((e) => e.includes("Floor area"))} />
                <NumberInput label="Trench / Outer Perimeter Length" unit="m" value={perimeter} onChange={setPerimeter} requirePositive />
                <NumberInput label="Trench Bottom Width" unit="m" value={trenchWidth} onChange={setTrenchWidth} error={errors.find((e) => e.includes("Trench width"))} />
                <NumberInput label="Trench Depth (informational — sides dose does not increase past 0.3 m)" unit="m" value={trenchDepth} onChange={setTrenchDepth} />
                <NumberInput label="RCC Vertical Area in Contact with Soil (optional)" unit="m²" value={verticalArea} onChange={setVerticalArea} />
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-txt-secondary">
                  <input type="checkbox" checked={includePeriphery} onChange={(e) => setIncludePeriphery(e.target.checked)} className="w-4 h-4 text-accent-800 rounded" />
                  Include external periphery apron (7.5 L/m) — off by default, it can overlap the trench-sides stage
                </label>
                <NumberInput label="Wastage / Spillage Allowance" unit="%" value={wastagePct} onChange={setWastagePct} />
                <NumberInput label="Concentrate Pack Size" unit="L" value={packSize} onChange={setPackSize} />
              </div>
            </div>

            <div>
              <h3 className="mb-3 border-b border-border-color pb-2 text-lg font-medium text-txt-primary">Chemical Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary">Treatment Chemical</label>
                  <select value={chemical.id} onChange={(e) => setChemicalId(e.target.value)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    {ANTITERMITE_CHEMICALS.map((c) => <option key={c.id} value={c.id}>{c.name} (1:{c.waterParts})</option>)}
                  </select>
                  <p className="text-xs text-txt-tertiary mt-2">{chemical.note}</p>
                </div>
                {chemical.id === "custom" && (
                  <NumberInput label="Water Parts (1:X)" unit="parts water" value={customRatio} onChange={setCustomRatio} />
                )}
                <div>
                  <label className="block uppercase tracking-wider mb-1.5 ml-1 text-sm font-medium text-txt-secondary">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="PKR">PKR — Pakistani Rupee</option>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="AED">AED — UAE Dirham</option>
                  </select>
                </div>
                <NumberInput label={`Concentrate Price per Litre (${sym}) — leave blank if unknown`} unit={sym} value={ratePerLitre} onChange={setRatePerLitre} />
                <NumberInput label={`Labour per m² of Floor (${sym}) — leave blank if unknown`} unit={sym} value={labourPerM2} onChange={setLabourPerM2} />
                <NumberInput label={`Equipment Hire, Lump Sum (${sym}) — leave blank if none`} unit={sym} value={equipmentLumpSum} onChange={setEquipmentLumpSum} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col gap-6">
            {result ? (
              <MaterialSummary title="Volume Analytics & Mixed Emulsion" totalLabel="Required Emulsion (Mixed Solution)" totalValue={result.totalEmulsionL.toFixed(1)} totalUnit="Liters" relatedToolIds={[]}>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ResultCard title="Trench Bottom (5 L/m²)" value={result.trenchBottomL.toFixed(1)} unit="Liters" variant="info" />
                  <ResultCard title="Trench Sides (7.5 L/m)" value={result.trenchSidesL.toFixed(1)} unit="Liters" variant="warning" />
                  <ResultCard title="Floor (5 L/m²)" value={result.floorL.toFixed(1)} unit="Liters" variant="neutral" />
                  <ResultCard title="Concentrate Needed" value={result.concentrateL.toFixed(1)} unit="Liters" variant="primary" />
                  <ResultCard title="Water Needed" value={result.waterL.toFixed(1)} unit="Liters" variant="neutral" />
                  <ResultCard title="Packs to Buy" value={`${result.packs} × ${packSize} L`} unit={`= ${result.packsVolumeL} L`} variant="primary" />
                </div>
                <div className="mt-4 bg-accent-50 border border-accent-200 p-4 rounded-2xl">
                  <div className="flex justify-between text-sm"><span className="text-txt-secondary">Subtotal (before wastage)</span><span className="font-mono font-bold">{result.subtotalL.toFixed(1)} L</span></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-txt-secondary">Wastage ({wastagePct}%)</span><span className="font-mono font-bold">{result.wastageL.toFixed(1)} L</span></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-txt-secondary">Dilution</span><span className="font-mono font-bold">1:{result.waterParts}</span></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-txt-secondary">Total cost</span><span className="font-mono font-bold">{fmt(result.totalCost)}</span></div>
                </div>
                <div className="mt-4 space-y-2">
                  {result.warnings.map((w) => (
                    <p key={w.slice(0, 40)} className="flex gap-2 text-xs leading-relaxed bg-accent-50 border border-accent-200 rounded-xl p-3 text-txt-secondary">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-accent-800" /> {w}
                    </p>
                  ))}
                </div>
              </MaterialSummary>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm">Enter valid dimensions to see the emulsion quantity.</div>
            )}
            {result && (
              <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Stage ${i + 1}`, theoretical: "IS 6313-2:2022", applied: s }))} />
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 text-sm text-txt-secondary">
        <p className="flex gap-2"><FlaskConical className="w-4 h-4 shrink-0 text-accent-800" /> Planning estimate only — not a substitute for a licensed pest-control operator or structural engineer. Always follow the product label; quantities assume the label dilution shown above.</p>
      </div>

      <CalculationHistory calculatorId="anti_termite_calculator" currentInputs={{ floorArea, perimeter, trenchDepth, Chemical: chemical.name, "Custom Ratio": customRatio }} currentResults={result ? { totalEmulsionL: result.totalEmulsionL, concentrateL: result.concentrateL } : {}} />
    </div>
  );
}
