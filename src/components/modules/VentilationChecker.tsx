import React, { useMemo, useState } from "react";
import { Wind, Sun, AlertTriangle, CheckCircle2, Copy, Printer, Download, Check } from "lucide-react";
import { ResultCard } from "../ui/ResultCard";
import { NumberInput } from "../ui/NumberInput";
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from "../ui/MaterialSummary";
import { CodeTooltip } from "../ui/CodeTooltip";
import { FormulaAccordion } from "../ui/FormulaAccordion";
import { Button } from "../ui/Button";
import {
  VENTILATION_ROOM_LABELS,
  calcVentilation,
  validateVentilationInputs,
  type VentClimateZone,
  type VentRoomType,
} from "../../lib/ventilationCalc";


type RoomTypeUI = VentRoomType;

export default function VentilationChecker() {
  const [roomType, setRoomType] = useState<RoomTypeUI>("bedroom");
  const [climate, setClimate] = useState<VentClimateZone>("Intermediate");
  const [lengthM, setLengthM] = useState<number | "">(4);
  const [widthM, setWidthM] = useState<number | "">(5);
  const [heightM, setHeightM] = useState<number | "">(3);
  const [occupants, setOccupants] = useState<number | "">(2);
  const [windowArea, setWindowArea] = useState<number | "">(3);
  const [openableFraction, setOpenableFraction] = useState<number | "">(50);
  const [existingAirflow, setExistingAirflow] = useState<number | "">("");
  const [copied, setCopied] = useState(false);

  const { result, errors } = useMemo(() => {
    try {
      const inp = {
        roomType,
        climateZone: climate,
        lengthM: Number(lengthM),
        widthM: Number(widthM),
        heightM: Number(heightM),
        occupants: Number(occupants) || 0,
        windowAreaM2: Number(windowArea) || 0,
        openableFractionPct: Number(openableFraction) || 0,
        existingAirflowM3h: existingAirflow === "" ? undefined : Number(existingAirflow),
      };
      const errs = validateVentilationInputs(inp);
      if (errs.length > 0) return { result: null, errors: errs };
      return { result: calcVentilation(inp), errors: [] as string[] };
    } catch (e) {
      return { result: null, errors: [(e as Error).message] };
    }
  }, [roomType, climate, lengthM, widthM, heightM, occupants, windowArea, openableFraction, existingAirflow]);

  const summaryText = result
    ? `Ventilation — ${VENTILATION_ROOM_LABELS[roomType]}, ${result.floorAreaM2.toFixed(1)} m², ${result.volumeM3.toFixed(1)} m³\nGlazing required ${result.requiredGlazingM2.toFixed(2)} m² (provided ${result.actualGlazingM2.toFixed(2)} m²) — ${result.glazingPass ? "PASS" : "FAIL"}\nOpenable required ${result.requiredOpenableM2.toFixed(2)} m² (provided ${result.actualOpenableM2.toFixed(2)} m²) — ${result.ventilationPass ? "PASS" : "FAIL"}\nACH target ${result.targetAch}: required airflow ${result.requiredAirflowM3h.toFixed(0)} m³/h (${result.requiredAirflowCfm.toFixed(0)} CFM)\nASHRAE 62.1 outdoor air ${result.ashraeVbzLs.toFixed(1)} L/s = ${result.ashraeVozM3h.toFixed(1)} m³/h\n${result.exhaustFanCfm ? `Recommended exhaust fan ${result.exhaustFanCfm} CFM\n` : ""}Windows: ${result.windowSizeLabel}`
    : "";

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };
  const handleExport = () => {
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ventilation-results.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full bg-surface-default rounded-2xl p-4 sm:p-6 shadow-brand-sm border border-ui-borderSubtle overflow-hidden">
        <h2 className="text-xl font-bold mb-2 text-txt-primary flex items-center gap-2">
          <Wind className="text-accent-700" /> Ventilation &amp; Lighting Checker (NBC / ASHRAE 62.1)
        </h2>
        <p className="text-sm text-txt-secondary mb-6">
          Glazing and openable-area check, plus air changes per hour (ACH) and ASHRAE 62.1 outdoor-air sizing. The old tool only checked glazing; the old IS 875 Part 3 (wind loads) citation for ventilation ratios was wrong and has been removed.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy results"}
          </Button>
          <Button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-txt-secondary bg-surface-default border border-ui-borderSubtle rounded-lg hover:bg-surface-hover">
            <Printer size={16} /> Print
          </Button>
          <Button onClick={handleExport} disabled={!result} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-ink border border-ink rounded-lg hover:bg-ink-700">
            <Download size={16} /> Export
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
              <h3 className="text-sm font-bold text-txt-primary mb-3 border-b border-border-color pb-2">Room Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1.5 ml-1">Room Type</label>
                  <select value={roomType} onChange={(e) => setRoomType(e.target.value as RoomTypeUI)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    {(Object.keys(VENTILATION_ROOM_LABELS) as RoomTypeUI[]).map((k) => <option key={k} value={k}>{VENTILATION_ROOM_LABELS[k]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-txt-secondary uppercase tracking-wider mb-1.5 ml-1">Climate Zone</label>
                  <select value={climate} onChange={(e) => setClimate(e.target.value as VentClimateZone)} className="w-full h-11 bg-surface-hover border border-ui-borderSubtle rounded-2xl px-4 text-sm font-medium focus:outline-none">
                    <option value="Dry Hot">Dry &amp; Hot (1/10)</option>
                    <option value="Intermediate">Intermediate (1/8)</option>
                    <option value="Wet Hot">Wet &amp; Hot (1/6)</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <NumberInput label="Length" unit="m" value={lengthM} onChange={setLengthM} requirePositive />
                  <NumberInput label="Width" unit="m" value={widthM} onChange={setWidthM} requirePositive />
                  <NumberInput label="Height" unit="m" value={heightM} onChange={setHeightM} requirePositive error={errors.find((e) => e.includes("height"))} />
                </div>
                <NumberInput label="Occupants" value={occupants} onChange={setOccupants} />
                <NumberInput label="Existing Mechanical Airflow (optional)" unit="m³/h" value={existingAirflow} onChange={setExistingAirflow} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-txt-primary mb-3 border-b border-border-color pb-2">Glazing &amp; Openings</h3>
              <div className="space-y-4">
                <NumberInput
                  label={<span className="flex items-center gap-1">Total Window Area <CodeTooltip standard="NBC" code="2016 Part 8 (as applicable)" description="Glazing-area ratios 1/10, 1/8 and 1/6 by climate zone. The exact clause number is still to be verified — do not treat this as a quoted clause." /></span>}
                  unit="m²" value={windowArea} onChange={setWindowArea}
                />
                <NumberInput label="Openable Fraction" unit="%" value={openableFraction} onChange={setOpenableFraction} error={errors.find((e) => e.includes("Openable"))} />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[min(100%,380px)] w-full flex flex-col gap-6">
            {result ? (
              <>
                <MaterialSummary title="Compliance Verification" totalLabel="Required Window Area" totalValue={result.requiredGlazingM2.toFixed(2)} totalUnit="m²" relatedToolIds={[]}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <ResultCard title="Floor Area" value={result.floorAreaM2.toFixed(1)} unit="m²" variant="neutral" />
                    <ResultCard title="Room Volume" value={result.volumeM3.toFixed(1)} unit="m³" variant="neutral" />
                    <ResultCard title="Required Ratio" value={`1/${result.ratio}`} unit="of Floor" variant="neutral" />
                    <ResultCard title="Openable Area" value={result.actualOpenableM2.toFixed(2)} unit="m²" variant="neutral" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ResultCard title="ACH Airflow Required" value={result.requiredAirflowM3h.toFixed(0)} unit="m³/h" secondaryValue={`${result.requiredAirflowCfm.toFixed(0)} CFM`} variant="primary" />
                    <ResultCard title="ASHRAE Outdoor Air" value={result.ashraeVozM3h.toFixed(1)} unit="m³/h" secondaryValue={`${result.ashraeVbzLs.toFixed(1)} L/s`} variant="info" />
                    {result.actualAch != null && <ResultCard title="Actual ACH" value={result.actualAch.toFixed(1)} unit="ACH" variant={result.actualAch >= result.targetAch ? "success" : "warning"} />}
                    {result.exhaustFanCfm != null && <ResultCard title="Exhaust Fan Size" value={result.exhaustFanCfm} unit="CFM" variant="primary" />}
                  </div>
                  <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between border ${result.glazingPass && result.ventilationPass ? "bg-accent-50 border-accent-200" : "bg-ui-error border-ui-errorBorder"}`}>
                    <div className="flex items-center gap-3">
                      {result.glazingPass && result.ventilationPass ? <CheckCircle2 className="text-ui-successText w-6 h-6" /> : <AlertTriangle className="text-ui-errorText w-6 h-6" />}
                      <div>
                        <h4 className={`font-bold ${result.glazingPass && result.ventilationPass ? "text-ui-successText" : "text-ui-errorText"}`}>
                          {result.glazingPass && result.ventilationPass ? "Compliant with NBC glazing rule" : "Fails NBC glazing rule"}
                        </h4>
                        <p className={`text-sm ${result.glazingPass && result.ventilationPass ? "text-ui-successText" : "text-ui-errorText"}`}>
                          {result.glazingPass ? `Minimum required window area is ${result.requiredGlazingM2.toFixed(2)} m².` : `Increase total window area by ${result.glazingShortfallM2.toFixed(2)} m².`} Recommended: {result.windowSizeLabel}.
                        </p>
                      </div>
                    </div>
                  </div>
                  {result.warnings.map((w) => (
                    <p key={w.slice(0, 40)} className="mt-3 flex gap-2 text-xs leading-relaxed bg-accent-50 border border-accent-200 rounded-xl p-3 text-txt-secondary">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-accent-800" /> {w}
                    </p>
                  ))}
                </MaterialSummary>
                <FormulaAccordion steps={result.steps.map((s, i) => ({ id: i + 1, label: `Step ${i + 1}`, theoretical: "NBC glazing / ACH / ASHRAE 62.1", applied: s }))} />
              </>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-default border border-ui-borderSubtle text-txt-tertiary text-sm">Enter valid room dimensions to see the ventilation check.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 text-sm text-txt-secondary">
        Planning estimate only — not a substitute for a licensed mechanical engineer. Glazing ratios are labelled as applicable guidance; verify the exact NBC / Pakistan Building Code clause before relying on them for approval.
      </div>

      <CalculationHistory calculatorId="ventilation_checker" currentInputs={{ roomType, climate, floorArea: result?.floorAreaM2, windowArea, openableFraction }} currentResults={result ? { requiredGlazingM2: result.requiredGlazingM2, requiredAirflowM3h: result.requiredAirflowM3h } : {}} />
    </div>
  );
}
