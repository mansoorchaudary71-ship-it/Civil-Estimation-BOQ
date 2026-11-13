/**
 * Shared export bar for the G7 structural tools: copy results, print,
 * download PDF (jsPDF via pdfExport.ts) and Send to BOQ with real rates
 * (never 0). Pure UI — the numbers come from the caller.
 */
import React from "react";
import { Button } from "./Button";
import { exportBOQToPDF, type BOQData } from "../../lib/pdfExport";
import { DISCLAIMER } from "../../lib/structuralShared";

export interface ExportBarProps {
  title: string;
  summaryText: string;
  boqItems: { description: string; quantity: number; unit: string; rate: number }[];
  totalAmount: number | null;
}

export function StructuralExportBar({ title, summaryText, boqItems, totalAmount }: ExportBarProps) {
  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${summaryText}\n\n${DISCLAIMER}`);
      alert("Results copied to clipboard.");
    } catch {
      alert("Copy failed — select the results text manually.");
    }
  };
  const downloadPdf = () => {
    const data: BOQData = {
      projectName: title,
      date: new Date().toLocaleDateString(),
      items: boqItems.map((b) => ({ ...b, amount: b.quantity * b.rate })),
      totalAmount: totalAmount ?? boqItems.reduce((s, b) => s + b.quantity * b.rate, 0),
    };
    exportBOQToPDF(data);
  };
  const sendToBoq = () => {
    const items = boqItems.map((b) => ({
      id: Math.random().toString(36).slice(2, 9),
      division: "03 - Concrete",
      description: b.description,
      unit: b.unit,
      quantity: b.quantity,
      rate: b.rate,
    }));
    window.dispatchEvent(new CustomEvent("fill-boq", { detail: items }));
    alert("Sent to BOQ Generator!");
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={copyResults} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-medium border border-ui-borderSubtle active:scale-95">Copy results</Button>
      <Button onClick={() => window.print()} className="px-4 py-2 bg-surface-hover text-txt-primary rounded-full text-sm font-medium border border-ui-borderSubtle active:scale-95">Print</Button>
      <Button onClick={downloadPdf} className="px-4 py-2 bg-ink text-white rounded-full text-sm font-medium active:scale-95">Download PDF</Button>
      <Button onClick={sendToBoq} className="px-4 py-2 bg-ui-success text-ui-successText rounded-full text-sm font-medium border border-ui-successBorder active:scale-95">Send to BOQ</Button>
    </div>
  );
}

/** Renders engine validation errors / warnings as banners. */
export function EngineNotices({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  if (errors.length === 0 && warnings.length === 0) return null;
  return (
    <div className="space-y-2">
      {errors.map((e, i) => (
        <div key={`e${i}`} className="p-3 rounded-2xl bg-ui-error border border-ui-errorBorder text-ui-errorText text-sm font-medium">{e}</div>
      ))}
      {warnings.map((w, i) => (
        <div key={`w${i}`} className="p-3 rounded-2xl bg-accent-50 border border-accent-200 text-accent-800 text-sm">{w}</div>
      ))}
    </div>
  );
}

/** Small "how it is calculated" step list (engine `steps`). */
export function CalcSteps({ steps }: { steps: { label: string; text: string }[] }) {
  return (
    <div className="bg-surface-hover border border-border-color rounded-2xl p-4 sm:p-6">
      <h3 className="font-bold text-txt-primary mb-3">How it is calculated</h3>
      <ol className="space-y-2 text-sm text-txt-secondary list-decimal list-inside">
        {steps.map((s, i) => (
          <li key={i}><span className="font-semibold text-txt-primary">{s.label}:</span> {s.text}</li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-txt-tertiary">{DISCLAIMER}</p>
    </div>
  );
}
