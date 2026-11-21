import { Button } from '../ui/Button';
import React, { useMemo, useState, useEffect } from "react";
import { qtyFromDimensions, billableQty, lineAmount, isUnpriced, boqTotals, taxLabelForRegion, readBoqInbox, clearBoqInbox, type BoqLine } from "../../lib/boq";
import { getRates } from "../../lib/rates";
import { useAutoSave } from "../../hooks/useAutoSave";
import toast from "react-hot-toast";
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from "../ui/MaterialSummary";
import { useMarketRates } from "../../context/MarketRatesContext";
import { generateBOQExcel, generateBOQPDF } from "../../utils/boq-reports";
import {
  FileDown,
  FileText,
  Plus,
  Trash2,
  Save,
  Download,
  Settings2,
  FileSpreadsheet,
  Percent,
  Calculator,
  FileOutput,
  RefreshCw,
  X,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";


interface BOQItem {
  id: string;
  code?: string;
  division: string;
  description: string;
  unit: string;
  /** Nos x L x W x D measurement (ported from AdvancedBoqGenerator) — when
   *  present and quantity is not manually overridden, quantity = product. */
  nos?: number | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  quantity: number;
  quantityManual?: boolean;
  rate: number;
  wastagePct?: number;
}

const toBoqLine = (i: BOQItem): BoqLine => ({
  id: i.id, code: i.code, division: i.division, description: i.description,
  unit: i.unit, nos: i.nos, length: i.length, width: i.width, depth: i.depth,
  quantity: i.quantity, quantityManual: i.quantityManual, rate: i.rate,
  wastagePct: i.wastagePct,
});

const MEASUREMENT_STANDARDS = [
  "IS 1200 (Indian)",
  "CESMM4 (UK Civil)",
  "NRM2 (UK Building)",
  "POMI (Plant & Equip)",
];

const DEFAULT_DIVISIONS = [
  "01 - General Requirements",
  "02 - Site Work & Earthwork",
  "03 - Concrete",
  "04 - Masonry",
  "05 - Metals",
  "06 - Wood & Plastics",
  "07 - Thermal & Moisture Protection",
  "08 - Doors & Windows",
  "09 - Finishes (Plaster, Flooring, Paint)",
  "15 - Mechanical / Plumbing",
  "16 - Electrical",
];

const PK_RATES = getRates("PK").rates;
const STANDARD_TEMPLATES: Record<string, BOQItem[]> = {
  "5-Marla House (PK)": [
    { id: "t5-1", code: "2.1", division: "Earthwork", description: "Excavation in foundation trenches, all soils", unit: "m³", quantity: 42, rate: 450 },
    { id: "t5-2", code: "4.1.3", division: "Concrete", description: "PCC 1:4:8 in foundation", unit: "m³", quantity: 4.5, rate: 14500 },
    { id: "t5-3", code: "5.1.2", division: "Concrete", description: "RCC 1:2:4 in foundations, beams and slab", unit: "m³", quantity: 38, rate: 28500 },
    { id: "t5-4", code: "5.3", division: "Concrete", description: "Steel reinforcement, deformed bars", unit: "kg", quantity: 3800, rate: PK_RATES.steelPerKg ?? 270 },
    { id: "t5-5", code: "6.1", division: "Masonry", description: "Brickwork 9 in, cement mortar 1:4", unit: "m³", quantity: 52, rate: 24500 },
    { id: "t5-6", code: "13.1", division: "Finishing", description: "Plaster 12 mm, cement mortar 1:6", unit: "m²", quantity: 620, rate: 320 },
  ],
  "Boundary Wall": [
    { id: "tw-1", code: "2.1", division: "Earthwork", description: "Excavation in foundation trenches", unit: "m³", quantity: 18, rate: 450 },
    { id: "tw-2", code: "4.1.3", division: "Concrete", description: "PCC 1:4:8 in foundation", unit: "m³", quantity: 3.2, rate: 14500 },
    { id: "tw-3", code: "6.1", division: "Masonry", description: "Brickwork 9 in, cement mortar 1:4", unit: "m³", quantity: 28, rate: 24500 },
    { id: "tw-4", code: "13.1", division: "Finishing", description: "Plaster 12 mm, cement mortar 1:6", unit: "m²", quantity: 260, rate: 320 },
    { id: "tw-5", code: "13.2", division: "Finishing", description: "Paint, 2 coats emulsion", unit: "m²", quantity: 260, rate: 180 },
  ],
  "Residential Building": [
    { id: "1", division: "02 - Site Work & Earthwork", description: "Excavation for foundation", unit: "m³", quantity: 120, rate: 15 },
    { id: "2", division: "03 - Concrete", description: "PCC (1:4:8) for foundation bed", unit: "m³", quantity: 15, rate: 85 },
    { id: "3", division: "03 - Concrete", description: "RCC (1:2:4) in columns, beams, slab", unit: "m³", quantity: 65, rate: 150 },
    { id: "4", division: "04 - Masonry", description: "First class brickwork in cement mortar (1:6)", unit: "m³", quantity: 85, rate: 110 },
    { id: "5", division: "09 - Finishes (Plaster, Flooring, Paint)", description: "Internal Plastering (1:4)", unit: "m²", quantity: 450, rate: 12 },
    { id: "6", division: "09 - Finishes (Plaster, Flooring, Paint)", description: "Vitrified Tile Flooring", unit: "m²", quantity: 120, rate: 35 },
    { id: "7", division: "15 - Mechanical / Plumbing", description: "Plumbing fixtures and piping", unit: "lump sum", quantity: 1, rate: 2500 },
    { id: "8", division: "16 - Electrical", description: "Wiring and DB fixtures", unit: "lump sum", quantity: 1, rate: 3000 },
  ],
  "Road Project": [
    { id: "1", division: "02 - Site Work & Earthwork", description: "Clearing and grubbing", unit: "m²", quantity: 15000, rate: 2 },
    { id: "2", division: "02 - Site Work & Earthwork", description: "Subgrade preparation", unit: "m³", quantity: 5000, rate: 8 },
    { id: "3", division: "03 - Concrete", description: "Granular Sub Base (GSB)", unit: "m³", quantity: 2500, rate: 25 },
    { id: "4", division: "03 - Concrete", description: "Wet Mix Macadam (WMM)", unit: "m³", quantity: 1500, rate: 35 },
    { id: "5", division: "09 - Finishes (Plaster, Flooring, Paint)", description: "Bituminous Macadam (BM)", unit: "m³", quantity: 700, rate: 120 },
    { id: "6", division: "09 - Finishes (Plaster, Flooring, Paint)", description: "Asphalt Concrete (AC)", unit: "m³", quantity: 400, rate: 150 },
    { id: "7", division: "02 - Site Work & Earthwork", description: "Roadside Drainage", unit: "m", quantity: 1000, rate: 45 },
  ],
  "Retaining Structure": [
    { id: "1", division: "02 - Site Work & Earthwork", description: "Trench excavation", unit: "m³", quantity: 45, rate: 12 },
    { id: "2", division: "03 - Concrete", description: "PCC Foundation base", unit: "m³", quantity: 10, rate: 80 },
    { id: "3", division: "03 - Concrete", description: "RCC Retaining Wall (1:1.5:3)", unit: "m³", quantity: 85, rate: 160 },
    { id: "4", division: "03 - Concrete", description: "Weep holes with gravel filter", unit: "count", quantity: 50, rate: 5 },
    { id: "5", division: "02 - Site Work & Earthwork", description: "Backfilling with selected earth", unit: "m³", quantity: 150, rate: 6 },
  ],
  "Drainage/Sewer Project": [
    { id: "1", division: "02 - Site Work & Earthwork", description: "Trench excavation for pipes", unit: "m³", quantity: 2500, rate: 15 },
    { id: "2", division: "02 - Site Work & Earthwork", description: "Bedding material for pipes", unit: "m³", quantity: 300, rate: 25 },
    { id: "3", division: "15 - Mechanical / Plumbing", description: "HDPE Sewer Pipes (DN 300)", unit: "m", quantity: 1500, rate: 45 },
    { id: "4", division: "03 - Concrete", description: "Precast Concrete Manholes", unit: "count", quantity: 35, rate: 400 },
    { id: "5", division: "02 - Site Work & Earthwork", description: "Trench backfilling and compaction", unit: "m³", quantity: 2200, rate: 8 },
  ],
};

// The four legacy templates below carry placeholder demo rates (PCC
// Rs 85/m³, RCC Rs 150/m³, brickwork Rs 110/m³ — roughly 100x below
// market). They are NOT sourced from the dated PK table, so the gallery
// and the Financial Summary must never claim they are.
const LEGACY_TEMPLATE_NAMES = new Set([
  "Residential Building",
  "Road Project",
  "Retaining Structure",
  "Drainage/Sewer Project",
]);

export default function BOQGenerator() {
  const { formatCurrency, settings } = useSettings();
  const { rates } = useMarketRates();
  const [items, setItems] = useState<BOQItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [contingencyPct, setContingencyPct] = useState(5);
  const [gstPct, setGstPct] = useState(18);
  const [taxRegion, setTaxRegion] = useState<"PK" | "IN" | "AE">("PK");
  const [view, setView] = useState<"boq" | "templates">("boq");
  const [inboxLines, setInboxLines] = useState<ReturnType<typeof readBoqInbox>>([]);
  const [projectName, setProjectName] = useState("Untitled Project BOQ");
  const [measurementStandard, setMeasurementStandard] = useState(MEASUREMENT_STANDARDS[0]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportClientName, setExportClientName] = useState("");
  const [exportEngineerName, setExportEngineerName] = useState("");
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [decimals, setDecimals] = useState<number>(2);

  const handleSelectItem = (id: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = (divisionItems?: BOQItem[]) => {
    if (divisionItems) {
      const divisionIds = divisionItems.map(i => i.id);
      const allSelected = divisionIds.every(id => selectedItemIds.has(id));
      setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        if (allSelected) {
          divisionIds.forEach(id => newSet.delete(id));
        } else {
          divisionIds.forEach(id => newSet.add(id));
        }
        return newSet;
      });
    } else {
      if (items.length > 0 && selectedItemIds.size === items.length) {
        setSelectedItemIds(new Set());
      } else {
        setSelectedItemIds(new Set(items.map(i => i.id)));
      }
    }
  };

  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map(item => ({
        ...item,
        quantity: Number(item.quantity.toFixed(decimals))
      }))
    );
  }, [decimals]);

  useAutoSave("boq", { items, projectName, contingencyPct, gstPct, measurementStandard, taxRegion },
    { items: setItems, projectName: setProjectName, contingencyPct: setContingencyPct, gstPct: setGstPct, measurementStandard: setMeasurementStandard, taxRegion: setTaxRegion });

  // BOQ inbox: lines sent from Material Takeoff / Measurement Sheet
  useEffect(() => {
    const lines = readBoqInbox();
    if (lines.length > 0) setInboxLines(lines);
  }, []);

  const loadInbox = () => {
    setItems((prev) => [...prev, ...inboxLines.map((l) => ({
      id: Math.random().toString(36).substr(2, 9),
      division: l.source?.includes("Takeoff") ? "Takeoff" : "Measurement",
      description: l.description, unit: l.unit, quantity: l.quantity,
      rate: l.rate ?? 0,
    }))]);
    clearBoqInbox();
    setInboxLines([]);
    toast.success(`${inboxLines.length} line(s) loaded from the BOQ inbox.`);
  };

  useEffect(() => {
    const handleFillBOQ = (e: CustomEvent<BOQItem[]>) => {
      setItems(prevItems => {
        const newItems = e.detail.map(item => ({
          ...item,
          quantity: Number(item.quantity.toFixed(decimals))
        }));
        return [...prevItems, ...newItems];
      });
      setProjectName("Imported BOQ");
    };
    window.addEventListener('fill-boq' as any, handleFillBOQ);
    return () => window.removeEventListener('fill-boq' as any, handleFillBOQ);
  }, [decimals]);

  // PK rate-table units: cement per bag, steel per kg, sand/crush per cft,
  // bricks per piece, tiles per box, paint per litre. A line is synced
  // ONLY when its unit matches the rate's unit — the old code matched on
  // the description alone, so a steel line in tonnes got the per-kg rate
  // (a 1000x understatement) and a concrete line in m³ got the per-bag
  // cement rate. Lines whose unit does not match are left untouched and
  // listed, never silently re-priced.
  const RATE_UNITS: { keys: string[]; units: string[]; rate: number }[] = [
    { keys: ["cement"], units: ["bag", "bags"], rate: rates.cement },
    { keys: ["steel", "rebar"], units: ["kg"], rate: rates.steel },
    { keys: ["sand"], units: ["cft", "ft3", "ft³"], rate: rates.sand },
    { keys: ["crush", "aggregate"], units: ["cft", "ft3", "ft³"], rate: rates.crush },
    { keys: ["brick"], units: ["nos", "no", "pc", "pcs", "piece", "pieces"], rate: rates.bricks },
    { keys: ["tile"], units: ["box", "boxes"], rate: rates.tiles },
    { keys: ["paint"], units: ["l", "litre", "litres", "liter", "liters", "ltr"], rate: rates.paint },
  ];

  const syncRates = () => {
    const skipped: string[] = [];
    let synced = 0;
    const next = items.map((item) => {
      const lowerDesc = item.description.toLowerCase();
      const unit = item.unit.trim().toLowerCase();
      const match = RATE_UNITS.find(
        (r) => r.keys.some((k) => lowerDesc.includes(k)) && r.units.includes(unit),
      );
      if (!match) {
        if (RATE_UNITS.some((r) => r.keys.some((k) => lowerDesc.includes(k)))) {
          skipped.push(`${item.description} (${item.unit})`);
        }
        return item;
      }
      synced += 1;
      return { ...item, rate: match.rate };
    });
    setItems(next);
    toast.success(
      skipped.length > 0
        ? `Synced ${synced} line(s) from the PK rate table. Skipped ${skipped.length}: ${skipped.join("; ")} — unit does not match the rate unit.`
        : `Synced ${synced} line(s) from the PK rate table.`,
    );
  };

  const handleAddItem = () => {
    const newItem: BOQItem = {
      id: Math.random().toString(36).substr(2, 9),
      code: "",
      division: DEFAULT_DIVISIONS[0],
      description: "",
      unit: "m³",
      nos: null, length: null, width: null, depth: null,
      quantity: 0,
      quantityManual: false,
      rate: 0,
      wastagePct: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof BOQItem,
    value: string | number | null,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [field]: value } as BOQItem;
        if (field === "quantity") next.quantityManual = true;
        if (["nos", "length", "width", "depth"].includes(field as string) && !next.quantityManual) {
          const q = qtyFromDimensions(next);
          if (q != null) next.quantity = q;
        }
        return next;
      }),
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const loadTemplate = (templateName: string) => {
    if (STANDARD_TEMPLATES[templateName]) {
      setItems(
        STANDARD_TEMPLATES[templateName].map((i) => ({
          ...i,
          id: Math.random().toString(36).substr(2, 9),
        })),
      );
      setProjectName(`${templateName} BOQ`);
      setSelectedItemIds(new Set());
    }
  };

  // Group items by division
  const groupedItems = useMemo(() => {
    const groups: Record<string, BOQItem[]> = {};
    items.forEach((item) => {
      if (!groups[item.division]) groups[item.division] = [];
      groups[item.division].push(item);
    });
    // Sort divisions
    return Object.keys(groups)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = groups[key];
          return acc;
        },
        {} as Record<string, BOQItem[]>,
      );
  }, [items]);

  const { subtotal, contingency: contingencyAmount, taxable: taxableAmount, tax: gstAmount, grandTotal, unpricedCount } = boqTotals(items.map(toBoqLine), contingencyPct, gstPct);
  const taxInfo = taxLabelForRegion(taxRegion);
  const pkTable = getRates("PK");

  const exportCSV = () => {
    let csv = "Code,Division,Description,Unit,Nos,L,W,D,Quantity,Rate,Amount\n";
    items.forEach((item) => {
      const amt = lineAmount(toBoqLine(item));
      csv += `"${item.code ?? ""}","${item.division}","${item.description.replace(/"/g, '""')}",${item.unit},${item.nos ?? ""},${item.length ?? ""},${item.width ?? ""},${item.depth ?? ""},${billableQty(toBoqLine(item)).toFixed(decimals)},${item.rate.toFixed(2)},${amt == null ? "UNPRICED" : amt.toFixed(2)}\n`;
    });
    csv += `\nSubtotal,,,,,,,,,${subtotal.toFixed(2)}\n`;
    csv += `Contingency (${contingencyPct}%),,,,,,,,,${contingencyAmount.toFixed(2)}\n`;
    csv += `${taxInfo.label} (${gstPct}%),,,,,,,,,${gstAmount.toFixed(2)}\n`;
    csv += `Grand Total,,,,,,,,,${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${projectName.replace(/\s+/g, "_")}_BOQ.csv`;
    link.href = url;
    link.click();
  };

  /** Rate-free tender export: quantities only, no rates — for pricing by bidders. */
  const exportTenderCSV = () => {
    let csv = "Code,Division,Description,Unit,Quantity\n";
    items.forEach((item) => {
      csv += `"${item.code ?? ""}","${item.division}","${item.description.replace(/"/g, '""')}",${item.unit},${billableQty(toBoqLine(item)).toFixed(decimals)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${projectName.replace(/\s+/g, "_")}_Tender_RateFree.csv`;
    link.href = url;
    link.click();
    toast.success("Rate-free tender CSV exported");
  };

  const triggerExportModal = (type: "all" | "selected") => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const confirmPDFExport = () => {
    if (exportType === "all") {
      generateBOQPDF(items, projectName, subtotal, contingencyAmount, 0, gstAmount, grandTotal, settings.currency, exportClientName, exportEngineerName);
    } else {
      if (selectedItemIds.size === 0) return;
      const selectedItems = items.filter(i => selectedItemIds.has(i.id));
      const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
      const selectedContingency = selectedSubtotal * (contingencyPct / 100);
      const selectedTaxable = selectedSubtotal + selectedContingency;
      const selectedGst = selectedTaxable * (gstPct / 100);
      const selectedGrandTotal = selectedTaxable + selectedGst;
      
      generateBOQPDF(selectedItems, `${projectName} (Selected Items)`, selectedSubtotal, selectedContingency, 0, selectedGst, selectedGrandTotal, settings.currency, exportClientName, exportEngineerName);
    }
    setIsExportModalOpen(false);
  };

  const exportExcel = () => {
    generateBOQExcel(items, projectName, subtotal, contingencyAmount, 0, gstAmount, grandTotal, settings.currency);
  };

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6 animate-in fade-in duration-500 px-4 md:px-0">
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-surface-default p-4 sm:p-8 rounded-2xl border border-ui-borderSubtle shadow-brand-sm overflow-hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-4 bg-accent-50 text-accent-800 rounded-2xl overflow-hidden">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <><label htmlFor="a11y-input-90" className="sr-only">Input</label>
<input id="a11y-input-90"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-xl font-semibold text-txt-primary tabular-nums tracking-tight text-txt-primary bg-transparent border-none outline-none hover:bg-surface-hover rounded-full px-2 py-1 -ml-2 transition-colors w-full max-w-md"
            /></>
            <p className="ml-1 text-base font-normal text-txt-secondary leading-relaxed">
              Professional Bill of Quantities Generator
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium uppercase tracking-widest hidden sm:block">Round Qty:</span>
              <div className="flex items-center bg-surface-hover rounded-2xl p-0.5 border border-ui-borderSubtle">
                <Button
                  onClick={() => setDecimals(2)}
                  className={`px-3 py-1.5 font-bold text-sm rounded-2xl transition-colors ${decimals === 2 ? 'bg-surface-default shadow-brand-sm text-txt-primary' : 'text-txt-tertiary hover:text-txt-secondary'}`}
                >
                  .00
                </Button>
                <Button
                  onClick={() => setDecimals(3)}
                  className={`px-3 py-1.5 font-bold text-sm rounded-2xl transition-colors ${decimals === 3 ? 'bg-surface-default shadow-brand-sm text-txt-primary' : 'text-txt-tertiary hover:text-txt-secondary'}`}
                >
                  .000
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
              <span className="text-base font-medium uppercase tracking-widest hidden sm:block">Standard:</span>
              <select
                value={measurementStandard}
                onChange={(e) => setMeasurementStandard(e.target.value)}
                className="px-3 py-1.5 bg-surface-hover hover:bg-surface-active text-txt-secondary text-base font-medium rounded-2xl outline-none transition-colors border border-ui-borderSubtle"
              >
                {MEASUREMENT_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-xs text-txt-tertiary">Label only — the standard does not change the math yet.</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) loadTemplate(e.target.value);
                e.target.value = "";
              }}
              className="px-4 py-2 bg-surface-hover hover:bg-surface-active text-txt-secondary font-bold rounded-2xl outline-none transition-colors border border-ui-borderSubtle overflow-hidden"
            >
              <option value="">Load Template...</option>
              {Object.keys(STANDARD_TEMPLATES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button onClick={syncRates}
              className="flex items-center gap-2 px-4 py-2 bg-accent-50 text-accent-800 hover:bg-accent-100 rounded-full transition-colors border border-accent-200 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
            >
              <RefreshCw className="w-4 h-4" /> Sync Rates (PK table {pkTable.lastUpdated})
            </Button>
            <Button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-ui-success text-ui-successText hover:bg-ui-success rounded-full transition-colors border border-ui-successBorder text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </Button>
            <Button onClick={exportTenderCSV}
              className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-txt-secondary hover:bg-surface-active rounded-full transition-colors border border-ui-borderSubtle text-base font-semibold"
            >
              <FileSpreadsheet className="w-4 h-4" /> Tender (rate-free)
            </Button>
            <Button onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-ui-success text-ui-successText hover:bg-ui-success rounded-full transition-colors border border-ui-successBorder text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
            {selectedItemIds.size > 0 && (
              <Button
                onClick={() => triggerExportModal("selected")}
                className="flex items-center gap-2 px-4 py-2 bg-ink hover:bg-ink-700 text-txt-primary font-bold rounded-full transition-colors shadow-brand-sm active:scale-95 hover:-translate-y-0.5"
              >
                <FileOutput className="w-4 h-4" /> Export Selected ({selectedItemIds.size})
              </Button>
            )}
            <Button
              onClick={() => triggerExportModal("all")}
              className="flex items-center gap-2 px-4 py-2 bg-ink hover:bg-ink-700 text-white font-bold rounded-full transition-colors shadow-brand-sm active:scale-95 hover:-translate-y-0.5"
            >
              <FileOutput className="w-4 h-4" /> PDF Report
            </Button>
          </div>
        </div>
      </div>

      {inboxLines.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-accent-50 border border-accent-200 rounded-2xl p-4">
          <span className="text-sm font-semibold text-accent-800">{inboxLines.length} line(s) waiting in the BOQ inbox (sent from Material Takeoff / Measurement Sheet).</span>
          <Button onClick={loadInbox} className="px-4 py-2 bg-ink text-white rounded-full text-sm font-bold">Load inbox lines</Button>
          <Button onClick={() => { clearBoqInbox(); setInboxLines([]); }} className="px-4 py-2 bg-surface-hover rounded-full text-sm font-semibold">Discard</Button>
        </div>
      )}
      <div className="flex gap-2">
        {(["boq", "templates"] as const).map((v) => (
          <Button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-full text-sm font-bold ${view === v ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>
            {v === "boq" ? "BOQ Items" : "Template Gallery"}
          </Button>
        ))}
      </div>
      {view === "templates" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(STANDARD_TEMPLATES).map(([name, tItems]) => {
            const total = tItems.reduce((sum, i) => sum + i.quantity * i.rate, 0);
            const legacy = LEGACY_TEMPLATE_NAMES.has(name);
            return (
              <div key={name} className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 shadow-brand-sm">
                <h3 className="text-lg font-semibold text-txt-primary">{name}</h3>
                {legacy && <p className="text-xs font-bold text-accent-800 bg-accent-50 border border-accent-200 rounded-full px-3 py-1 mt-2 inline-block">Legacy demo rates — not market rates</p>}
                <p className="text-sm text-txt-tertiary mt-1">{tItems.length} items · sample total {settings.currency} {total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-txt-tertiary mt-1">{legacy ? "Placeholder demo rates from an old template — re-price every line from the PK table or your supplier before tendering." : `Rates are example rates from the dated PK table (${pkTable.lastUpdated}) — edit per your market before tendering.`}</p>
                <Button onClick={() => { loadTemplate(name); setView("boq"); }} className="mt-4 px-4 py-2 bg-ink text-white rounded-full text-sm font-bold">Load this template</Button>
              </div>
            );
          })}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-ui-borderSubtle flex justify-between items-center bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
              <h3 className="flex items-center gap-2 text-lg font-medium text-txt-primary mb-4">
                <FileText className="w-5 h-5 text-accent-800" /> BOQ Items
              </h3>
              <Button onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white rounded-full hover:bg-ink-700 transition text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
              >
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="boq-table-print-breaks w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-hover/50 rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary text-txt-tertiary text-sm uppercase tracking-wider font-bold overflow-hidden">
                    <th className="p-4 w-12 text-center">
                      <><label htmlFor="a11y-input-91" className="sr-only">Input</label>
<input id="a11y-input-91" 
                        type="checkbox" 
                        checked={items.length > 0 && selectedItemIds.size === items.length}
                        onChange={() => handleSelectAll()}
                        className="w-4 h-4 rounded text-accent-800 focus:ring-accent-500"
                      /></>
                    </th>
                    <th className="p-4 w-48">Division</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 w-24">Unit</th>
                    <th className="p-4 w-28 text-right">Quantity</th>
                    <th className="p-4 w-32 text-right">Rate</th>
                    <th className="p-4 w-32 text-right">Amount</th>
                    <th className="p-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-5 sm:p-8 md:p-12 text-center text-txt-secondary font-medium border-t border-dashed border-ui-borderSubtle bg-surface-hover/50 rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden"
                      >
                        No items added yet. Click "Add Item" or load a template.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedItems).map(([division, divItems]) => (
                      <React.Fragment key={division}>
                        <tr className="bg-surface-hover/80 rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary border-y border-ui-borderSubtle overflow-hidden">
                          <td
                            colSpan={8}
                            className="px-4 py-2.5 font-bold text-accent-800 text-sm"
                          >
                           <div className="flex items-center gap-2">
                             <><label htmlFor="a11y-input-92" className="sr-only">Input</label>
<input id="a11y-input-92" 
                                type="checkbox" 
                                checked={divItems.length > 0 && divItems.every(i => selectedItemIds.has(i.id))}
                                onChange={() => handleSelectAll(divItems)}
                                className="w-4 h-4 rounded text-accent-800 focus:ring-accent-500"
                             /></>
                             {division}
                           </div>
                          </td>
                        </tr>
                        {divItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="border-b border-border-color last:border-0 hover:bg-surface-hover/50 rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden"
                            style={{ animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
                          >
                            <td className="p-2 align-top text-center">
                              <><label htmlFor="a11y-input-93" className="sr-only">Input</label>
<input id="a11y-input-93" 
                                type="checkbox" 
                                checked={selectedItemIds.has(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                className="w-4 h-4 rounded text-accent-800 focus:ring-accent-500 mt-2"
                              /></>
                            </td>
                            <td className="p-2 align-top">
                              <select
                                value={item.division}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "division",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2 bg-transparent text-base font-medium rounded outline-none border border-transparent focus:border-accent-300 focus:bg-surface-default transition-all truncate"
                              >
                                {DEFAULT_DIVISIONS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                                {!DEFAULT_DIVISIONS.includes(item.division) && (
                                  <option value={item.division}>
                                    {item.division}
                                  </option>
                                )}
                              </select>
                            </td>
                            <td className="p-2 align-top">
                              <input
                                type="text"
                                value={item.code ?? ""}
                                onChange={(e) => handleUpdateItem(item.id, "code", e.target.value)}
                                placeholder="Item code (e.g. 5.1.2)"
                                className="w-full p-1.5 mb-1 bg-transparent text-xs rounded outline-none border border-transparent focus:border-accent-300 focus:bg-surface-default transition-all"
                              />
                              <textarea
                                value={item.description}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Item description..."
                                className="w-full p-2 bg-transparent text-sm font-medium rounded outline-none border border-transparent focus:border-accent-300 focus:bg-surface-default transition-all resize-none min-h-[40px]"
                                rows={1}
                              />
                            </td>
                            <td className="p-2 align-top">
                              <><label htmlFor="a11y-input-94" className="sr-only">Input</label>
<input id="a11y-input-94"
                                type="text"
                                value={item.unit}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2 bg-transparent text-sm rounded outline-none border border-transparent focus:border-accent-300 focus:bg-surface-default transition-all rounded-full"
                              /></>
                            </td>
                            <td className="p-2 align-top">
                              <div className="group relative">
                                <><label htmlFor="a11y-input-95" className="sr-only">Input</label>
<input id="a11y-input-95"
                                  type="number" inputMode="decimal"
                                  min="0"
                                  step="any"
                                  value={item.quantity === 0 ? "" : item.quantity}
                                  onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    handleUpdateItem(
                                      item.id,
                                      "quantity",
                                      !isNaN(val) ? Math.max(0, val) : 0,
                                    );
                                  }}
                                  className="w-full p-2 bg-transparent text-sm text-right font-bold rounded outline-none border border-transparent focus:border-accent-300 focus:bg-surface-default transition-all rounded-full"
                                /></>
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-[200px] px-2 py-1 bg-surface-default text-txt-primary text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                                  Qty = Nos × L × W × D
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                                </span>
                              </div>
                              <div className="flex gap-1 mt-1">
                                {(["nos", "length", "width", "depth"] as const).map((f) => (
                                  <input key={f} type="number" inputMode="decimal" min="0" step="any"
                                    value={item[f] == null ? "" : item[f]}
                                    placeholder={f === "nos" ? "Nos" : f === "length" ? "L" : f === "width" ? "W" : "D"}
                                    onChange={(e) => { const v = parseFloat(e.target.value); handleUpdateItem(item.id, f, isNaN(v) ? null : Math.max(0, v)); }}
                                    className="w-1/4 min-w-0 p-1 bg-transparent text-xs text-center rounded outline-none border border-ui-borderSubtle focus:border-accent-300"
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs">
                                <span className="text-txt-tertiary">Wastage</span>
                                <input type="number" inputMode="decimal" min="0" step="any"
                                  value={item.wastagePct == null || item.wastagePct === 0 ? "" : item.wastagePct}
                                  placeholder="0"
                                  onChange={(e) => { const v = parseFloat(e.target.value); handleUpdateItem(item.id, "wastagePct", isNaN(v) ? 0 : Math.max(0, v)); }}
                                  className="w-14 p-1 bg-transparent text-xs text-center rounded outline-none border border-ui-borderSubtle focus:border-accent-300"
                                />
                                <span className="text-txt-tertiary">%{item.quantityManual ? " · manual qty" : ""}</span>
                              </div>
                            </td>
                            <td className="p-2 align-top text-right">
                              <div className="flex items-center group relative">
                                <span className="text-txt-secondary ml-2 text-xs">{settings.currency}</span>
                                <><label htmlFor="a11y-input-96" className="sr-only">Input</label>
<input id="a11y-input-96"
                                  type="number" inputMode="decimal"
                                  min="0"
                                  step="any"
                                  value={item.rate === 0 ? "" : item.rate}
                                  onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                      e.preventDefault();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    handleUpdateItem(
                                      item.id,
                                      "rate",
                                      !isNaN(val) ? Math.max(0, val) : 0,
                                    );
                                  }}
                                  className="w-full p-2 bg-transparent text-sm text-right font-bold text-ui-successText rounded outline-none border border-transparent focus:border-accent-300 focus:bg-surface-default transition-all rounded-full"
                                /></>
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-[200px] px-2 py-1 bg-surface-default text-txt-primary text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                                  R = Mat + Lab + Eqp + OHP
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-top text-right font-semibold tabular-nums tracking-tight text-txt-primary tabular-nums">
                              <div className="group relative inline-block">
                                {(() => { const amt = lineAmount(toBoqLine(item)); return amt == null ? <span className="text-accent-800 font-bold">— unpriced</span> : amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); })()}
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-[200px] px-2 py-1 bg-surface-default text-txt-primary text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                                  Value = Qty × Rate
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                                </span>
                              </div>
                            </td>
                            <td className="p-2 align-top text-center">
                              <Button aria-label="Delete"
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-txt-secondary hover:text-ui-errorText hover:bg-ui-error rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="w-full bg-surface-default border border-ui-borderSubtle border-l-[4px] border-l-accent-500 p-4 sm:p-6 rounded-2xl shadow-brand-sm relative overflow-hidden">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-5 text-txt-primary"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            ></div>

            <h3 className="mb-6 flex items-center gap-2 relative z-10 text-lg font-medium text-txt-primary mb-4">
              <Settings2 className="w-5 h-5 text-accent-800" /> Financial
              Summary
            </h3>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-txt-tertiary">Subtotal</span>
                <span className="font-bold text-txt-primary tabular-nums">
                  {formatCurrency(subtotal, false)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-txt-tertiary flex items-center gap-1">
                    Contingency <Percent className="w-3 h-3" />
                  </span>
                  <div className="flex items-center gap-2 group relative">
                    <><label htmlFor="a11y-input-97" className="sr-only">Input</label>
<input id="a11y-input-97"
                      type="number" inputMode="decimal"
                      min="0"
                      step="any"
                      value={contingencyPct === 0 ? "" : contingencyPct}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setContingencyPct(!isNaN(val) ? Math.max(0, val) : 0);
                      }}
                      className="w-12 px-1 py-0.5 bg-surface-hover border border-ui-borderSubtle text-txt-primary rounded text-right text-sm focus:outline-none focus:border-accent-300 rounded-full"
                    /></>
                    <span className="font-bold tabular-nums text-accent-800">
                      +{formatCurrency(contingencyAmount, false)}
                    </span>
                    <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-max max-w-[250px] px-2 py-1 bg-surface-default text-txt-primary text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                      Risk = Subtotal × Factor
                      <span className="absolute top-full right-8 border-4 border-transparent border-t-slate-800"></span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border-color space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-txt-tertiary">Taxable Amount</span>
                  <span className="font-bold text-txt-primary tabular-nums">
                    {formatCurrency(taxableAmount, false)}
                  </span>
                </div>
                <div className="flex gap-1 mb-2">
                  {(["PK", "IN", "AE"] as const).map((r) => (
                    <Button key={r} onClick={() => { setTaxRegion(r); setGstPct(taxLabelForRegion(r).defaultPct); }} className={`px-2.5 py-1 rounded-full text-xs font-bold ${taxRegion === r ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>{r}</Button>
                  ))}
                </div>
                {unpricedCount > 0 && (
                  <p className="text-xs font-bold text-accent-800 bg-accent-50 border border-accent-200 rounded-full px-3 py-1.5">{unpricedCount} unpriced line(s) — rate 0 is shown as a warning, never silently counted as 0.</p>
                )}
                <p className="text-xs text-txt-tertiary">PK-template rates are sourced from the dated PK table ({pkTable.lastUpdated}, {pkTable.source}). Legacy demo templates use placeholder rates, not market rates — re-price before tendering.</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-txt-tertiary flex items-center gap-1">
                    {taxInfo.label} <Percent className="w-3 h-3" />
                  </span>
                  <div className="flex items-center gap-2 group relative">
                    <><label htmlFor="a11y-input-98" className="sr-only">Input</label>
<input id="a11y-input-98"
                      type="number" inputMode="decimal"
                      min="0"
                      step="any"
                      value={gstPct === 0 ? "" : gstPct}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setGstPct(!isNaN(val) ? Math.max(0, val) : 0);
                      }}
                      className="w-12 px-1 py-0.5 bg-surface-hover border border-ui-borderSubtle text-txt-primary rounded text-right text-sm focus:outline-none focus:border-accent-300 rounded-full"
                    /></>
                    <span className="font-bold tabular-nums text-ui-errorText">
                      +{formatCurrency(gstAmount, false)}
                    </span>
                    <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-max max-w-[250px] px-2 py-1 bg-surface-default text-txt-primary text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                      Tax = Taxable Amount × Tax % — {taxInfo.note}
                      <span className="absolute top-full right-8 border-4 border-transparent border-t-slate-800"></span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-ui-borderSubtle">
                <span className="text-txt-tertiary text-sm uppercase tracking-widest font-bold">
                  Grand Total
                </span>
                <p className="text-xl tabular-nums tracking-tight bg-gradient-to-r from-accent-500 to-accent-700 bg-clip-text text-transparent mt-1 text-base font-normal text-txt-secondary leading-relaxed">
                  {formatCurrency(grandTotal, false)}
                </p>
              </div>
            </div>
          </div>

          <MaterialSummary
            title="Summary Stats"
            totalValue={items.length}
            totalUnit="Items"
          >
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-surface-default p-4 rounded-2xl border border-border-color overflow-hidden">
                <div className="text-base font-medium uppercase text-txt-tertiary mb-1">
                  Divisions
                </div>
                <div className="text-xl font-semibold text-txt-primary tabular-nums tracking-tight text-accent-800">
                  {Object.keys(groupedItems).length}
                </div>
              </div>
              <div className="bg-surface-default p-4 rounded-2xl border border-border-color overflow-hidden">
                <div className="text-base font-medium uppercase text-txt-tertiary mb-1">
                  Quantities by Unit
                </div>
                <div className="text-sm font-semibold text-txt-primary tabular-nums tracking-tight">
                  {/* A single "Total QTY" summed m³ + m² + kg + nos into one
                      meaningless number. Quantities are only summable
                      within the same unit. */}
                  {items.length === 0 ? (
                    <span className="text-txt-tertiary">—</span>
                  ) : (
                    Object.entries(
                      items.reduce<Record<string, number>>((acc, i) => {
                        acc[i.unit] = (acc[i.unit] ?? 0) + i.quantity;
                        return acc;
                      }, {}),
                    ).map(([unit, qty]) => (
                      <div key={unit} className="flex justify-between gap-2">
                        <span className="text-txt-tertiary">{unit}</span>
                        <span>{qty.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </MaterialSummary>
        </div>
      </div>
      )}
      <CalculationHistory
        calculatorId="boqgenerator"
        currentInputs={{ projectName, items: items.length, contingencyPct, gstPct, measurementStandard, taxRegion }}
        currentResults={{ subtotal, grandTotal, unpricedCount }}
        estimationName="B O Q Generator"
      />

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-surface-hover/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-default rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-border-color flex justify-between items-center bg-surface-hover">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight mb-4">
                <FileOutput className="w-5 h-5 text-accent-800" />
                Configure PDF Report
              </h2>
              <Button 
                onClick={() => setIsExportModalOpen(false)}
                className="w-full text-txt-secondary hover:text-txt-secondary bg-surface-default hover:bg-surface-hover p-1.5 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm overflow-hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-txt-secondary">Project Name</label>
                <><label htmlFor="a11y-input-99" className="sr-only">Input</label>
<input id="a11y-input-99" 
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full outline-none focus:ring-2 focus:ring-accent-500 focus:bg-surface-default transition-all text-txt-primary font-medium"
                /></>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-txt-secondary">Client Name (Optional)</label>
                <><label htmlFor="a11y-input-100" className="sr-only">e.g. Acme Corp</label>
<input id="a11y-input-100" 
                  type="text"
                  value={exportClientName}
                  onChange={(e) => setExportClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full outline-none focus:ring-2 focus:ring-accent-500 focus:bg-surface-default transition-all text-txt-primary font-medium"
                /></>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-txt-secondary">Engineer / Surveyor Name (Optional)</label>
                <><label htmlFor="a11y-input-101" className="sr-only">e.g. John Doe</label>
<input id="a11y-input-101" 
                  type="text"
                  value={exportEngineerName}
                  onChange={(e) => setExportEngineerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full outline-none focus:ring-2 focus:ring-accent-500 focus:bg-surface-default transition-all text-txt-primary font-medium"
                /></>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-border-color bg-surface-hover flex justify-end gap-3">
              <Button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2 text-txt-secondary font-bold hover:bg-surface-active rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
              >
                Cancel
              </Button>
              <Button onClick={confirmPDFExport}
                className="px-5 py-2 bg-ink hover:bg-ink-700 text-white rounded-full shadow-brand-sm transition-colors flex items-center gap-2 text-base font-semibold active:scale-95 hover:-translate-y-0.5"
              >
                <FileOutput className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
