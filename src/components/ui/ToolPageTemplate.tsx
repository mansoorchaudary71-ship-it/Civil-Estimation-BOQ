/**
 * ToolPageTemplate — the ONE canonical template for every tool page (Step 4).
 *
 * Every tool renders through this composition (directly, or via ModuleWrapper
 * in App.tsx which composes these pieces, or via the four standalone pages
 * which import ToolActionsBar / ToolFormulaSection / ToolBreadcrumb):
 *
 *   (1) Breadcrumb, H1, one-line description, standards/code badge,
 *       unit + currency selectors  (ToolHeader owns H1/description/toggles;
 *       ToolBreadcrumb + ToolStandardsBadge supply the rest)
 *   (2) Inputs card, then a sticky Results card on desktop and a stacked
 *       results card on mobile (ToolInputsCard / ToolResultsCard slots;
 *       ToolLayoutInputs/ToolLayoutResults re-exported for existing callers)
 *   (3) Step-by-step formula / methodology (ToolFormulaSection — renders
 *       TOOL_FORMULAS[toolId] verbatim; tools with no verified formula
 *       render nothing and are logged for step 5 instead of inventing one)
 *   (4) Actions row, always in this order, same components everywhere:
 *       Copy, Print, PDF, Excel, Add to BOQ, Share (ToolActionsBar).
 *       An action a tool genuinely cannot support stays visible but
 *       disabled with a reason — it is never silently dropped.
 *   (5) Related calculators, FAQ and the SEO article below — rendered by
 *       ModuleWrapper from the existing central components
 *       (RelatedCalculators, GlobalFAQ, ToolArticleWidget), which already
 *       cover 75/75 tools; this file does not duplicate them.
 *
 * Actions wiring (existing mechanisms only, no new export engines):
 * - Copy / Print / PDF / Share reuse the ToolHeader implementations
 *   (DOM-scraped summary, `global-print-action`, html2pdf on `.tool-card`,
 *   navigator.share with clipboard fallback).
 * - Excel / Add to BOQ delegate to the tool's OWN export button when the
 *   tool has one (GenericExportButtons renders an "Excel" button;
 *   StructuralExportBar / useBOQ tools render a "Send to BOQ" /
 *   "Generate BOQ" button). The registries below were built by grepping
 *   every tool module for the real wiring (see STEP4_MIGRATION_LOG.md).
 *   Step 5 fallbacks for tools with no native wiring: Excel exports a
 *   faithful .xlsx of the on-screen inputs + results (nothing invented);
 *   Add to BOQ sends one UNPRICED summary line to the shared inbox
 *   (lib/boq — the BOQ workspace shows unpriced lines for the QS to
 *   price or delete). Only tools with genuinely nothing to add/export
 *   keep the button disabled, with the reason in BOQ_DISABLED_REASONS /
 *   EXCEL_DISABLED_TOOL_IDS.
 */
import React, { useState } from "react";
import {
  Copy,
  Printer,
  FileText,
  FileSpreadsheet,
  ListPlus,
  Share2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "../Breadcrumb";
import { CodeComplianceBadge } from "./CodeComplianceBadge";
import { TOOL_FORMULAS } from "./toolFormulas";
import { TOOL_REFERENCES } from "./CodeReferences";
import { sendToBoq, readBoqInbox, type BoqInboxLine } from "../../lib/boq";
import { Button } from "./Button";
import {
  ToolLayout,
  ToolLayoutInputs,
  ToolLayoutResults,
  ToolSection,
} from "./ToolLayout";

export { ToolLayout, ToolLayoutInputs, ToolLayoutResults, ToolSection };

/** Tools whose module calls useBOQ().addItem, dispatches `fill-boq`, calls
 *  exportBOQToPDF or sendToBoq (localStorage BOQ inbox), or publishes
 *  __currentRoadBOQItems — i.e. a real Add-to-BOQ path exists. `boq` /
 *  `boq-templates` are excluded: they ARE the BOQ workspace, so "add to
 *  BOQ" there would be circular.
 *  Step 5 additions (verified, not assumed): the 7 StructuralExportBar
 *  tools (beam-design, column-design, pile-foundation,
 *  prestressed-concrete, raft-foundation, staircase-calculator,
 *  water-tank-design — the bar's "Send to BOQ" dispatches fill-boq),
 *  master-finishes (renders FinishesEstimator's "Export BOQ" button)
 *  and qs-workflow (new "Send to BOQ" button writing the shared inbox).
 *  Tools NOT in this set get the generic unpriced-summary fallback in
 *  ToolActionsBar, unless they are in BOQ_DISABLED_REASONS below. */
export const BOQ_CAPABLE_TOOL_IDS: ReadonlySet<string> = new Set([
  "anti-termite",
  "area-space-calculator",
  "bbs-generator",
  "beam-design",
  "building-setback-calculator",
  "chainage",
  "column-design",
  "cost-summary",
  "far-fsi-calculator",
  "formwork",
  "infra-mep-engine",
  "interiors-finishes",
  "isolated-footing",
  "master-finishes",
  "master-rcc",
  "material-takeoff",
  "measurement-sheet",
  "mep-calculator",
  "metal-weight",
  "pile-foundation",
  "plywood-estimator",
  "precast-wall",
  "prestressed-concrete",
  "qs-workflow",
  "raft-foundation",
  "rainwater-harvesting",
  "reinforcement",
  "retaining-wall",
  "road-pavement",
  "roof-calculator",
  "solar-roof",
  "solar-water-heater",
  "staircase-calculator",
  "universal-structural-geometry",
  "volume-estimator",
  "water-tank-design",
]);

/** Tools where Add to BOQ stays disabled, with the reason shown on the
 *  button. These pages produce no BOQ quantity at all: the BOQ workspace
 *  itself, reference pages, pure hubs, workspaces, pure converters and
 *  the progress tracker. Every other tool either has native BOQ wiring
 *  (BOQ_CAPABLE_TOOL_IDS) or the generic unpriced-summary fallback. */
export const BOQ_DISABLED_REASONS: Readonly<Record<string, string>> = {
  "boq": "This is the BOQ workspace itself",
  "boq-templates": "This is the BOQ workspace itself",
  "ai": "The AI assistant produces advice, not a quantity to price",
  "projects": "Project workspace — no calculation result to add",
  "earthworks": "Hub page — the linked earthwork tools add their own quantities",
  "soil-mechanics-lab": "Hub page — the linked lab tools add their own results",
  "is-codes-reference": "Reference page — nothing to add to a BOQ",
  "morth-irc-specs": "Reference page — nothing to add to a BOQ",
  "pakistan-building-codes": "Reference page — nothing to add to a BOQ",
  "uae-construction-standards": "Reference page — nothing to add to a BOQ",
  "staircase-design-reference": "Reference page — nothing to add to a BOQ",
  "unit-converter": "A conversion is not a BOQ item",
  "marla-converter": "A conversion is not a BOQ item",
  "tracker": "Progress tracking produces no BOQ quantity",
};

/** Tools with a real spreadsheet export: GenericExportButtons ("Excel"
 *  button), XLSX.writeFile, generateBOQExcel or generateExcelReport.
 *  StructuralExportBar-only tools are NOT in this set — that bar has
 *  Copy/Print/PDF/Send-to-BOQ but no Excel button.
 *  Step 5: tools NOT in this set get the generic Excel fallback in
 *  ToolActionsBar (a faithful .xlsx of the on-screen inputs + results),
 *  unless they are in EXCEL_DISABLED_TOOL_IDS below. */
export const EXCEL_CAPABLE_TOOL_IDS: ReadonlySet<string> = new Set([
  "bbs-generator",
  "boq",
  "boq-templates",
  "brick-calculator",
  "cost-summary",
  "house",
  "marla-converter",
  "measurement-sheet",
  "mix-design",
  "pakistan-cost-calculator",
  "takeoff",
  "unit-converter",
]);

/** Tools where Excel stays disabled: reference pages with no calculation
 *  to export. Every other tool either has a native spreadsheet export
 *  (EXCEL_CAPABLE_TOOL_IDS) or the generic fallback. */
export const EXCEL_DISABLED_TOOL_IDS: ReadonlySet<string> = new Set([
  "is-codes-reference",
  "morth-irc-specs",
  "pakistan-building-codes",
  "uae-construction-standards",
  "staircase-design-reference",
]);

/** Tools with no verified formula text in toolFormulas.ts — the formula
 *  section is omitted for these (never invented). All seven are reference
 *  pages, hubs or workspace pages, not calculators: `ai` (chat assistant),
 *  `calculators` (material hub), `projects` (project workspace), and the
 *  four standards reference pages. Step 5 added the two real calculators
 *  that were missing formulas (`tracker` EVM, `qs-workflow` IS 1200). */
export const TOOLS_WITHOUT_FORMULA: readonly string[] = [
  "ai",
  "calculators",
  "is-codes-reference",
  "morth-irc-specs",
  "pakistan-building-codes",
  "projects",
  "uae-construction-standards",
];

/* ------------------------------------------------------------------ */
/* (1) Breadcrumb + standards badge                                   */
/* ------------------------------------------------------------------ */

export function ToolBreadcrumb({
  toolId,
  title,
  category,
  onNavigate,
}: {
  toolId: string;
  title: string;
  category: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="pt-4 print:hidden">
      <Breadcrumb
        items={[
          { label: "Home", isHome: true, onClick: () => onNavigate("home") },
          {
            label: "Calculators",
            onClick: () => onNavigate("calculators"),
          },
          ...(category && category !== "General"
            ? [{ label: category, onClick: () => onNavigate("calculators") }]
            : []),
          { label: title || toolId },
        ]}
      />
    </div>
  );
}

/**
 * Standards / code badge. Uses the tool's first verified code reference
 * when one exists (TOOL_REFERENCES, 12 tool ids); otherwise the site-wide
 * standards list already shown in every ToolPageFooter — reused, not
 * invented per tool.
 */
export function ToolStandardsBadge({ toolId }: { toolId: string }) {
  const refs = TOOL_REFERENCES[toolId];
  const standard = refs?.[0]
    ? `${refs[0].code}${refs[0].clause ? ` · ${refs[0].clause}` : ""}`
    : "IS Codes · NBC · ACI · BS · MORTH";
  return (
    <div className="print:hidden">
      <CodeComplianceBadge
        standard={standard}
        title={refs?.[0] ? "Standard Compliant" : "Standards Applied"}
        description={
          refs?.[0]?.description ??
          "Estimates follow standard civil engineering codes and regional guidelines."
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* (2) Inputs / results slots                                          */
/* ------------------------------------------------------------------ */

/**
 * Inputs card — identical spacing, radius, border and padding on every
 * tool. Wrap the tool's input controls in this.
 */
export function ToolInputsCard({
  title,
  children,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={typeof title === "string" ? title : "Inputs"}
      className="rounded-card border border-border-color bg-surface-default p-6 shadow-brand-sm sm:p-8"
    >
      {title ? (
        <h2 className="mb-6 text-base font-bold text-txt-primary sm:text-lg">
          {title}
        </h2>
      ) : null}
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </section>
  );
}

/**
 * Results card — sticky on desktop (lg:sticky lg:top-24), stacked below
 * the inputs on mobile. Wrap the tool's result panel in this.
 */
export function ToolResultsCard({
  title,
  children,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={typeof title === "string" ? title : "Results"}
      className="rounded-card border border-border-color bg-surface-default p-6 shadow-brand-sm sm:p-8 lg:sticky lg:top-24 lg:self-start"
    >
      {title ? (
        <h2 className="mb-6 text-base font-bold text-txt-primary sm:text-lg">
          {title}
        </h2>
      ) : null}
      <div className="space-y-4 sm:space-y-6">{children}</div>
    </section>
  );
}

/** Empty state shown before a tool has anything to calculate. */
export function ToolEmptyState({
  title = "Enter your inputs to see results",
  description = "Fill in the values above — the estimate updates as you type. Nothing is calculated until the required inputs are present.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-default bg-surface-hover px-6 py-10 text-center">
      <CheckCircle2 className="h-8 w-8 text-txt-tertiary" aria-hidden="true" />
      <p className="text-sm font-semibold text-txt-primary">{title}</p>
      <p className="max-w-sm text-sm text-txt-secondary">{description}</p>
    </div>
  );
}

/** Loading skeleton for a tool page (matches ToolLoadingFallback in App). */
export function ToolSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading calculator"
      className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12"
    >
      <div className="space-y-4 lg:col-span-4">
        <div className="h-44 animate-pulse rounded-card bg-surface-hover" />
        <div className="h-32 animate-pulse rounded-card bg-surface-hover" />
      </div>
      <div className="space-y-4 lg:col-span-8">
        <div className="h-64 animate-pulse rounded-card bg-surface-hover" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* (3) Formula / methodology — verified text only, never invented      */
/* ------------------------------------------------------------------ */

export function ToolFormulaSection({ toolId }: { toolId: string }) {
  const formulaText = TOOL_FORMULAS[toolId];
  if (!formulaText) return null;
  return (
    <section
      aria-label="Formula and methodology"
      className="rounded-card border border-border-color bg-surface-default p-6 shadow-brand-sm sm:p-8 print:hidden"
    >
      <h2 className="mb-3 text-base font-bold text-txt-primary sm:text-lg">
        Formula &amp; methodology
      </h2>
      <p className="mb-4 text-sm text-txt-secondary">
        Step-by-step method used by this calculator, from the verified
        engineering references for this tool.
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-txt-primary">
        {formulaText}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* (4) Actions row — Copy, Print, PDF, Excel, Add to BOQ, Share       */
/* ------------------------------------------------------------------ */

function buildSummary(toolName: string): string {
  let summary = `Estimation Report: ${toolName}\n`;
  summary += `---------------------------------\n`;
  const inputs = document.querySelectorAll(
    'input[type="number"], input[type="text"]',
  );
  if (inputs.length > 0) {
    summary += `Inputs:\n`;
    inputs.forEach((input) => {
      const el = input as HTMLInputElement;
      const label =
        input.previousElementSibling?.textContent ||
        input.getAttribute("aria-label") ||
        input.id;
      if (label && el.value) {
        summary += `- ${label.trim()}: ${el.value}\n`;
      }
    });
    summary += `\n`;
  }
  summary += `URL: ${typeof window !== "undefined" ? window.location.href : ""}\n`;
  summary += `Generated via Civil Estimation Pro`;
  return summary;
}

/** Click the tool's own button matching `label` inside the tool content.
 *  Returns false when the tool renders no such button. Prefers a real
 *  "Send to BOQ" / "Export BOQ" button over any button that merely
 *  mentions BOQ (Step 5: the QS Workflow's "Copy BOQ (TSV)" matches
 *  /boq/i and must never be triggered by Add to BOQ). */
function clickToolButton(label: RegExp): boolean {
  const scope = toolContentScope();
  const btns = Array.from(scope.querySelectorAll("button")).filter(
    (b) => !b.closest("[data-tool-actions-bar]"),
  );
  const btn = btns.find((b) => label.test(b.textContent ?? ""));
  if (btn) {
    (btn as HTMLButtonElement).click();
    return true;
  }
  return false;
}

/** The tool's own content area (ModuleWrapper wraps it in
 *  .global-form-card-wrapper; standalone pages use .tool-page-standalone).
 *  The actions bar itself sits outside it, so scraping it never picks up
 *  the bar's own buttons. */
function toolContentScope(): HTMLElement {
  return (document.querySelector(".global-form-card-wrapper") ??
    document.querySelector(".tool-page-standalone") ??
    document.body) as HTMLElement;
}

/** Rows for the generic Excel fallback: the tool title, the current
 *  inputs (label + value, same scrape as Copy) and the visible result
 *  text, one line per row, "Label: value" lines split into two columns.
 *  Nothing is invented — it is exactly what the page shows. */
function buildExportRows(toolName: string): string[][] {
  const rows: string[][] = [
    [`Civil Estimation Pro — ${toolName}`],
    [`Exported ${new Date().toLocaleDateString("en-GB")}`],
    [],
    ["Item", "Value"],
  ];
  const inputs = document.querySelectorAll(
    'input[type="number"], input[type="text"]',
  );
  let sawInputs = false;
  inputs.forEach((input) => {
    const el = input as HTMLInputElement;
    const label = (
      input.previousElementSibling?.textContent ||
      input.getAttribute("aria-label") ||
      input.id ||
      ""
    ).trim();
    if (label && el.value) {
      rows.push([label, el.value]);
      sawInputs = true;
    }
  });
  if (sawInputs) rows.push([]);
  const lines = (toolContentScope().innerText ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  for (const line of lines.slice(0, 300)) {
    if (seen.has(line)) continue;
    seen.add(line);
    const splitAt = line.indexOf(": ");
    if (splitAt > 0 && splitAt < 60)
      rows.push([line.slice(0, splitAt), line.slice(splitAt + 2)]);
    else rows.push([line, ""]);
  }
  rows.push([]);
  rows.push([
    `URL: ${typeof window !== "undefined" ? window.location.href : ""}`,
    "",
  ]);
  return rows;
}

/** One unpriced summary line for the generic Add-to-BOQ fallback: the
 *  first on-screen line that reads like a result (has a number and a
 *  value/unit marker), else the tool name alone. Quantity 1, unit "lot",
 *  rate null = unpriced by design (lib/boq isUnpriced — the BOQ workspace
 *  shows unpriced lines for the QS to price or delete). */
function buildGenericBoqLine(toolName: string): BoqInboxLine | null {
  const lines = (toolContentScope().innerText ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const headline = lines.find(
    (l) =>
      l.length > 3 &&
      l.length < 140 &&
      /\d/.test(l) &&
      /[:=%]|Rs\b|kg|m³|m²|bags|nos|kN|MPa|litres?/i.test(l) &&
      !/^(enter|type|select|upload|click|try|load|add|remove|delete)\b/i.test(l),
  );
  if (!headline && lines.length === 0) return null;
  return {
    description: headline
      ? `${toolName} — ${headline}`
      : `${toolName} — result summary (see the tool page)`,
    unit: "lot",
    quantity: 1,
    rate: null,
    source: toolName,
  };
}

export function ToolActionsBar({
  toolId,
  toolName,
}: {
  toolId: string;
  toolName: string;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  // Native structured export / BOQ wiring (registries above). Anything
  // not native and not disabled gets the Step 5 generic fallback.
  const excelNative = EXCEL_CAPABLE_TOOL_IDS.has(toolId);
  const excelDisabled = EXCEL_DISABLED_TOOL_IDS.has(toolId);
  const boqNative = BOQ_CAPABLE_TOOL_IDS.has(toolId);
  const boqReason = BOQ_DISABLED_REASONS[toolId];
  const excelReason = excelDisabled
    ? "Reference page — no calculation to export"
    : undefined;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary(toolName));
      toast.success("Copied calculation summary to clipboard", {
        position: "bottom-center",
      });
    } catch {
      toast.error("Copy failed — select the results text manually.", {
        position: "bottom-center",
      });
    }
  };

  const handlePrint = () => {
    window.dispatchEvent(new Event("global-print-action"));
  };

  const handlePdf = async () => {
    setIsProcessing(true);
    toast.loading("Generating PDF...", {
      id: "tool-pdf-toast",
      position: "bottom-center",
    });
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = (document.querySelector(".tool-card") ||
        document.body) as HTMLElement;
      const opt = {
        margin: 10,
        filename: `${toolName.replace(/\s+/g, "_")}_Estimate.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
      };
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF saved successfully!", {
        id: "tool-pdf-toast",
        position: "bottom-center",
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF", {
        id: "tool-pdf-toast",
        position: "bottom-center",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExcel = async () => {
    if (excelDisabled) return;
    // Native structured export first (the tool's own Excel button).
    if (excelNative && clickToolButton(/excel|xlsx/i)) return;
    // Generic fallback (Step 5): a faithful .xlsx of the inputs +
    // results exactly as shown on screen — no invented rows. The dynamic
    // import keeps xlsx out of the entry chunk.
    toast.loading("Preparing Excel file…", {
      id: "tool-excel-toast",
      position: "bottom-center",
    });
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(buildExportRows(toolName)),
        "Estimate",
      );
      XLSX.writeFile(wb, `${toolName.replace(/\s+/g, "_")}_Estimate.xlsx`);
      toast.success("Excel file downloaded", {
        id: "tool-excel-toast",
        position: "bottom-center",
      });
    } catch (e) {
      console.error(e);
      toast.error("Excel export failed", {
        id: "tool-excel-toast",
        position: "bottom-center",
      });
    }
  };

  const handleAddToBoq = () => {
    if (boqReason) return;
    // Native wiring first — prefer a real "Send to BOQ" / "Export BOQ"
    // button over any other button that merely mentions BOQ.
    if (
      boqNative &&
      (clickToolButton(/send to boq|export boq/i) || clickToolButton(/boq/i))
    )
      return;
    if (boqNative) {
      toast.error(
        "Add to BOQ is wired for this tool but its BOQ button could not be found on the page.",
        { position: "bottom-center" },
      );
      return;
    }
    // Generic fallback (Step 5): one UNPRICED summary line in the shared
    // BOQ inbox — the BOQ workspace supports unpriced lines and shows
    // them for the QS to price or delete. The toast says so explicitly;
    // this is a record of the result, not a quantity.
    const line = buildGenericBoqLine(toolName);
    if (!line) {
      toast.error(
        "Nothing on this page looks like a result to add to the BOQ.",
        { position: "bottom-center" },
      );
      return;
    }
    sendToBoq([...readBoqInbox(), line]);
    toast.success(
      "Added to the BOQ as an unpriced summary line — open the BOQ tool, load the inbox lines and set the rate.",
      { position: "bottom-center" },
    );
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: toolName,
          text: `Check out this civil engineering calculation tool: ${toolName}`,
          url,
        });
        return;
      } catch {
        /* share cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard", {
        position: "bottom-center",
      });
    } catch {
      toast.error("Sharing is not available in this browser.", {
        position: "bottom-center",
      });
    }
  };

  const btnClass =
    "flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-ui-borderStrong px-2 text-txt-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45 sm:gap-2 sm:px-4";
  const labelClass = "whitespace-nowrap text-xs font-medium sm:text-sm";

  return (
    <div
      data-tool-actions-bar
      aria-label="Result actions"
      className="grid grid-cols-2 gap-2 border-b border-border-color pb-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6 lg:gap-4 print:hidden"
    >
      <Button onClick={handleCopy} className={btnClass}>
        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className={labelClass}>Copy</span>
      </Button>
      <Button onClick={handlePrint} className={btnClass}>
        <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className={labelClass}>Print</span>
      </Button>
      <Button onClick={handlePdf} disabled={isProcessing} className={btnClass}>
        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className={labelClass}>PDF</span>
      </Button>
      <Button
        onClick={handleExcel}
        disabled={excelDisabled}
        title={excelReason}
        aria-disabled={excelDisabled}
        className={btnClass}
      >
        <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className={labelClass}>Excel</span>
      </Button>
      <Button
        onClick={handleAddToBoq}
        disabled={!!boqReason}
        title={boqReason}
        aria-disabled={!!boqReason}
        className={btnClass}
      >
        <ListPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className={labelClass}>Add to BOQ</span>
      </Button>
      <Button onClick={handleShare} className={btnClass}>
        <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className={labelClass}>Share</span>
      </Button>
    </div>
  );
}
