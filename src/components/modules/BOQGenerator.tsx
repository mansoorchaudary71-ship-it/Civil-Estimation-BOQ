import React, { useState, useMemo, useEffect } from "react";
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
  division: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

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

const STANDARD_TEMPLATES: Record<string, BOQItem[]> = {
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

export default function BOQGenerator() {
  const { formatCurrency, settings } = useSettings();
  const { rates } = useMarketRates();
  const [items, setItems] = useState<BOQItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [contingencyPct, setContingencyPct] = useState(5);
  const [gstPct, setGstPct] = useState(18);
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

  const syncRates = () => {
    setItems(items.map(item => {
      let newRate = item.rate;
      const lowerDesc = item.description.toLowerCase();
      if (lowerDesc.includes("cement")) newRate = rates.cement;
      if (lowerDesc.includes("steel") || lowerDesc.includes("rebar")) newRate = rates.steel;
      if (lowerDesc.includes("sand")) newRate = rates.sand;
      if (lowerDesc.includes("crush") || lowerDesc.includes("aggregate")) newRate = rates.crush;
      if (lowerDesc.includes("brick")) newRate = rates.bricks;
      if (lowerDesc.includes("tile")) newRate = rates.tiles;
      if (lowerDesc.includes("paint")) newRate = rates.paint;
      
      return { ...item, rate: newRate };
    }));
  };

  const handleAddItem = () => {
    const newItem: BOQItem = {
      id: Math.random().toString(36).substr(2, 9),
      division: DEFAULT_DIVISIONS[0],
      description: "",
      unit: "m³",
      quantity: 0,
      rate: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof BOQItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const contingencyAmount = subtotal * (contingencyPct / 100);
  const taxableAmount = subtotal + contingencyAmount;
  const gstAmount = taxableAmount * (gstPct / 100);
  const grandTotal = taxableAmount + gstAmount;

  const exportCSV = () => {
    let csv = "Division,Description,Unit,Quantity,Rate,Amount\n";
    items.forEach((item) => {
      csv += `"${item.division}","${item.description.replace(/"/g, '""')}","${item.unit}",${item.quantity.toFixed(decimals)},${item.rate.toFixed(2)},${(item.quantity * item.rate).toFixed(2)}\n`;
    });
    csv += `\nSubtotal,,,,,${subtotal.toFixed(2)}\n`;
    csv += `Contingency (${contingencyPct}%),,,,,${contingencyAmount.toFixed(2)}\n`;
    csv += `GST (${gstPct}%),,,,,${gstAmount.toFixed(2)}\n`;
    csv += `Grand Total,,,,,${grandTotal.toFixed(2)}\n`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${projectName.replace(/\s+/g, "_")}_BOQ.csv`;
    link.href = url;
    link.click();
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
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[24px] overflow-hidden">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <><label htmlFor="a11y-input-90" className="sr-only">Input</label>
<input id="a11y-input-90"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-slate-800 bg-transparent border-none outline-none hover:bg-slate-50 rounded-full px-2 py-1 -ml-2 transition-colors w-full max-w-md"
            /></>
            <p className="ml-1 text-base font-normal text-slate-600 leading-relaxed">
              Professional Bill of Quantities Generator
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium uppercase tracking-widest hidden sm:block">Round Qty:</span>
              <div className="flex items-center bg-slate-100 rounded-[16px] p-0.5 border border-slate-200">
                <button
                  onClick={() => setDecimals(2)}
                  className={`px-3 py-1.5 font-bold text-sm rounded-[14px] transition-colors ${decimals === 2 ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  .00
                </button>
                <button
                  onClick={() => setDecimals(3)}
                  className={`px-3 py-1.5 font-bold text-sm rounded-[14px] transition-colors ${decimals === 3 ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  .000
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
              <span className="text-base font-medium uppercase tracking-widest hidden sm:block">Standard:</span>
              <select
                value={measurementStandard}
                onChange={(e) => setMeasurementStandard(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-medium rounded-[16px] outline-none transition-colors border border-slate-200"
              >
                {MEASUREMENT_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) loadTemplate(e.target.value);
                e.target.value = "";
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-[24px] outline-none transition-colors border border-slate-200 overflow-hidden"
            >
              <option value="">Load Template...</option>
              {Object.keys(STANDARD_TEMPLATES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button onClick={syncRates}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors border border-indigo-200 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Sync DB Rates
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-200 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </button>
            <button onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full transition-colors border border-green-200 text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            {selectedItemIds.size > 0 && (
              <button
                onClick={() => triggerExportModal("selected")}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-slate-900 font-bold rounded-full transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5"
              >
                <FileOutput className="w-4 h-4" /> Export Selected ({selectedItemIds.size})
              </button>
            )}
            <button
              onClick={() => triggerExportModal("all")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5"
            >
              <FileOutput className="w-4 h-4" /> PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="w-full bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
              <h3 className="flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                <FileText className="w-5 h-5 text-indigo-500" /> BOQ Items
              </h3>
              <button onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 text-slate-500 text-sm uppercase tracking-wider font-bold overflow-hidden">
                    <th className="p-4 w-12 text-center">
                      <><label htmlFor="a11y-input-91" className="sr-only">Input</label>
<input id="a11y-input-91" 
                        type="checkbox" 
                        checked={items.length > 0 && selectedItemIds.size === items.length}
                        onChange={() => handleSelectAll()}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
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
                        className="p-5 sm:p-8 md:p-12 text-center text-slate-600 font-medium border-t border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden"
                      >
                        No items added yet. Click "Add Item" or load a template.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedItems).map(([division, divItems]) => (
                      <React.Fragment key={division}>
                        <tr className="bg-slate-50/80 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border-y border-slate-200 overflow-hidden">
                          <td
                            colSpan={8}
                            className="px-4 py-2.5 font-bold text-indigo-700 text-sm"
                          >
                           <div className="flex items-center gap-2">
                             <><label htmlFor="a11y-input-92" className="sr-only">Input</label>
<input id="a11y-input-92" 
                                type="checkbox" 
                                checked={divItems.length > 0 && divItems.every(i => selectedItemIds.has(i.id))}
                                onChange={() => handleSelectAll(divItems)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                             /></>
                             {division}
                           </div>
                          </td>
                        </tr>
                        {divItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden"
                            style={{ animationFillMode: 'both', animationDelay: `${idx * 50}ms` }}
                          >
                            <td className="p-2 align-top text-center">
                              <><label htmlFor="a11y-input-93" className="sr-only">Input</label>
<input id="a11y-input-93" 
                                type="checkbox" 
                                checked={selectedItemIds.has(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-2"
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
                                className="w-full p-2 bg-transparent text-base font-medium rounded outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all truncate"
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
                                className="w-full p-2 bg-transparent text-sm font-medium rounded outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all resize-none min-h-[40px]"
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
                                className="w-full p-2 bg-transparent text-sm rounded outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all rounded-full"
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
                                  className="w-full p-2 bg-transparent text-sm text-right font-bold rounded outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all rounded-full"
                                /></>
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-[200px] px-2 py-1 bg-white text-slate-900 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                                  Qty = L × W × D 
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                                </span>
                              </div>
                            </td>
                            <td className="p-2 align-top text-right">
                              <div className="flex items-center group relative">
                                <span className="text-slate-600 ml-2">$</span>
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
                                  className="w-full p-2 bg-transparent text-sm text-right font-bold text-emerald-600 rounded outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition-all rounded-full"
                                /></>
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-[200px] px-2 py-1 bg-white text-slate-900 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                                  R = Mat + Lab + Eqp + OHP
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-top text-right font-semibold tabular-nums tracking-tight text-slate-800 tabular-nums">
                              <div className="group relative inline-block">
                                {(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-max max-w-[200px] px-2 py-1 bg-white text-slate-900 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                                  Value = Qty × Rate
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                                </span>
                              </div>
                            </td>
                            <td className="p-2 align-top text-center">
                              <button aria-label="Delete"
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
          <div className="w-full bg-white border border-slate-200 border-l-[4px] border-l-[#6B46C1] p-4 sm:p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-5 text-slate-800"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            ></div>

            <h3 className="mb-6 flex items-center gap-2 relative z-10 text-lg font-medium text-slate-800 mb-4">
              <Settings2 className="w-5 h-5 text-[#6B46C1]" /> Financial
              Summary
            </h3>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
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
                      className="w-12 px-1 py-0.5 bg-slate-50 border border-slate-200 text-slate-800 rounded text-right text-sm focus:outline-none focus:border-indigo-300 rounded-full"
                    /></>
                    <span className="font-bold tabular-nums text-blue-500">
                      +$
                      {contingencyAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-max max-w-[250px] px-2 py-1 bg-white text-slate-900 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                      Risk = Subtotal × Factor
                      <span className="absolute top-full right-8 border-4 border-transparent border-t-slate-800"></span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Taxable Amount</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    ${taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-1">
                    GST/VAT <Percent className="w-3 h-3" />
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
                      className="w-12 px-1 py-0.5 bg-slate-50 border border-slate-200 text-slate-800 rounded text-right text-sm focus:outline-none focus:border-indigo-300 rounded-full"
                    /></>
                    <span className="font-bold tabular-nums text-rose-500">
                      +$
                      {gstAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-max max-w-[250px] px-2 py-1 bg-white text-slate-900 text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center font-normal whitespace-nowrap shadow-xl overflow-hidden">
                      Tax = Taxable Amount × Tax %
                      <span className="absolute top-full right-8 border-4 border-transparent border-t-slate-800"></span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200">
                <span className="text-slate-500 text-sm uppercase tracking-widest font-bold">
                  Grand Total
                </span>
                <p className="text-xl tabular-nums tracking-tight bg-gradient-to-r from-[#6B46C1] to-orange-500 bg-clip-text text-transparent mt-1 text-base font-normal text-slate-600 leading-relaxed">
                  $
                  {grandTotal.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
              <div className="bg-white p-4 rounded-[24px] border border-slate-100 overflow-hidden">
                <div className="text-base font-medium uppercase text-slate-500 mb-1">
                  Divisions
                </div>
                <div className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-indigo-600">
                  {Object.keys(groupedItems).length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-[24px] border border-slate-100 overflow-hidden">
                <div className="text-base font-medium uppercase text-slate-500 mb-1">
                  Total QTY
                </div>
                <div className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-emerald-600">
                  {items
                    .reduce((s, i) => s + i.quantity, 0)
                    .toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                </div>
              </div>
            </div>
          </MaterialSummary>
        </div>
      </div>
    
      <CalculationHistory
        calculatorId="boqgenerator"
        currentInputs={{}}
        currentResults={{}}
        estimationName="B O Q Generator"
      />

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-50/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <FileOutput className="w-5 h-5 text-indigo-600" />
                Configure PDF Report
              </h2>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="w-full text-slate-600 hover:text-slate-600 bg-white hover:bg-slate-100 p-1.5 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Project Name</label>
                <><label htmlFor="a11y-input-99" className="sr-only">Input</label>
<input id="a11y-input-99" 
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                /></>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Client Name (Optional)</label>
                <><label htmlFor="a11y-input-100" className="sr-only">e.g. Acme Corp</label>
<input id="a11y-input-100" 
                  type="text"
                  value={exportClientName}
                  onChange={(e) => setExportClientName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                /></>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Engineer / Surveyor Name (Optional)</label>
                <><label htmlFor="a11y-input-101" className="sr-only">e.g. John Doe</label>
<input id="a11y-input-101" 
                  type="text"
                  value={exportEngineerName}
                  onChange={(e) => setExportEngineerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-medium"
                /></>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                Cancel
              </button>
              <button onClick={confirmPDFExport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-colors flex items-center gap-2 text-base font-semibold active:scale-95 hover:-translate-y-0.5"
              >
                <FileOutput className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
