import { Button } from '../ui/Button';
import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Download, Section } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CalculationHistory } from '../ui/CalculationHistory';
import { measureRow, type MeasureKind } from "../../lib/measurementSheet";
import { sendToBoq } from "../../lib/boq";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useRates } from "../../lib/useRates";
import toast from "react-hot-toast";
import { GenericExportButtons } from "../ui/GenericExportButtons";


// We use an extended jsPDF type to include autoTable
interface jsPDFCustom extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: { finalY: number };
}

type MeasurementRow = {
  id: string;
  itemNo: string;
  description: string;
  length: string;
  width: string;
  heightDepth: string;
  nos: string;
  rate: string;
  /** null = incomplete row (missing dimensions) — never a computed number */
  result: number | null;
  hint: string | null;
};

type TabType = 
  | "excavation"
  | "pcc"
  | "rcc"
  | "masonry"
  | "plaster"
  | "tiles";

const TAB_TITLES: Record<TabType, string> = {
  excavation: "Excavation Measurement",
  pcc: "PCC Measurement",
  rcc: "RCC Measurement",
  masonry: "Masonry Measurement",
  plaster: "Plaster & Paint Measurement",
  tiles: "Floor & Wall Tiles",
};

const TAB_KIND: Record<TabType, MeasureKind> = {
  excavation: "volume", pcc: "volume", rcc: "volume", masonry: "volume",
  plaster: "area", tiles: "area",
};
// Unit label follows the toggle: quantities are computed in the entered
// unit (ft mode -> cu.ft/sqft), so the header and the BOQ unit must say so.
const unitLabelFor = (kind: MeasureKind, unit: "m" | "ft"): string =>
  kind === "volume" ? (unit === "m" ? "m³" : "cu.ft")
  : kind === "area" ? (unit === "m" ? "m²" : "sqft")
  : unit;

const MeasurementSheetCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("excavation");
  const [unit, setUnit] = useState<"m" | "ft">("m");
  const { rates: pkRates, table: rateTable } = useRates("PK");
  
  const generateEmptyRow = (): MeasurementRow => ({
    id: Math.random().toString(36).substring(7),
    itemNo: "",
    description: "",
    length: "",
    width: "",
    heightDepth: "",
    nos: "1",
    rate: "",
    result: null,
    hint: null,
  });

  const [sheets, setSheets] = useState<Record<TabType, MeasurementRow[]>>({
    excavation: [generateEmptyRow()],
    pcc: [generateEmptyRow()],
    rcc: [generateEmptyRow()],
    masonry: [generateEmptyRow()],
    plaster: [generateEmptyRow()],
    tiles: [generateEmptyRow()],
  });

  const handleRowChange = (tab: TabType, id: string, field: keyof MeasurementRow, value: string) => {
    if (["length", "width", "heightDepth", "nos", "rate"].includes(field as string)) {
      if (value !== "" && isNaN(Number(value))) return;
      if ((field === "nos" || field === "rate") && value !== "" && Number(value) < 0) return;
    }

    setSheets(prev => {
      const newTabState = prev[tab].map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          // Engine (src/lib/measurementSheet): a row is INCOMPLETE until it
          // has enough dimensions (3 for volume, 2 for area). The old code
          // treated a missing dimension as 1, so L-only = 10 was "computed".
          const num = (v: string) => (v === "" ? null : Number(v));
          const r = measureRow(
            { nos: num(updatedRow.nos), length: num(updatedRow.length), width: num(updatedRow.width), depth: num(updatedRow.heightDepth), rate: num(updatedRow.rate) },
            TAB_KIND[tab],
            unit,
          );
          updatedRow.result = r.qty;
          updatedRow.hint = r.hint;
          return updatedRow;
        }
        return row;
      });
      return { ...prev, [tab]: newTabState };
    });
  };

  const addRow = (tab: TabType) => {
    setSheets(prev => ({
      ...prev,
      [tab]: [...prev[tab], generateEmptyRow()]
    }));
  };

  const deleteRow = (tab: TabType, id: string) => {
    setSheets(prev => ({
      ...prev,
      [tab]: prev[tab].filter(row => row.id !== id)
    }));
  };

  const getSubtotal = (tab: TabType) => {
    return sheets[tab].reduce((sum, row) => sum + (row.result ?? 0), 0);
  };
  const getAmountTotal = (tab: TabType) => {
    return sheets[tab].reduce((sum, row) => {
      const rate = row.rate === "" ? null : Number(row.rate);
      return sum + ((row.result ?? 0) * (rate ?? 0));
    }, 0);
  };
  const incompleteCount = (tab: TabType) => sheets[tab].filter((r) => r.hint).length;

  useAutoSave("measurement-sheet", { sheets, activeTab, unit },
    { sheets: setSheets, activeTab: setActiveTab, unit: setUnit });

  const sendActiveTabToBoq = () => {
    const rows = sheets[activeTab].filter((r) => r.result != null && r.description.trim() !== "");
    if (rows.length === 0) { toast.error("No complete rows to send — finish the dimensions first."); return; }
    sendToBoq(rows.map((r) => ({
      description: r.description, unit: unitLabelFor(TAB_KIND[activeTab], unit),
      quantity: r.result as number, rate: r.rate === "" ? null : Number(r.rate),
      source: `Measurement Sheet (${TAB_TITLES[activeTab]})`,
    })));
    toast.success(`${rows.length} row(s) sent to the BOQ Generator — open BOQ to load them.`);
  };

  const exportCsv = () => {
    const lines = [["Tab", "Item No", "Description", "Nos", "L", "W", "H/D", "Qty", "Unit", "Rate", "Amount"]];
    (Object.keys(TAB_TITLES) as TabType[]).forEach((t) => {
      sheets[t].forEach((r) => {
        const rate = r.rate === "" ? 0 : Number(r.rate);
        lines.push([TAB_TITLES[t], r.itemNo, r.description, r.nos, r.length, r.width, r.heightDepth, r.result == null ? "incomplete" : String(r.result), unitLabelFor(TAB_KIND[t], unit), String(rate), String((r.result ?? 0) * rate)]);
      });
    });
    const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const aEl = document.createElement("a");
    aEl.href = URL.createObjectURL(blob);
    aEl.download = "measurement-sheet.csv";
    aEl.click();
    URL.revokeObjectURL(aEl.href);
    toast.success("Measurement sheet CSV downloaded");
  };

  const exportPDF = () => {
    const doc = new jsPDF() as jsPDFCustom;
    doc.setFontSize(18);
    doc.text("Measurement Sheet Report", 14, 22);
    
    let currentY = 30;

    Object.keys(TAB_TITLES).forEach((tabKey) => {
      const t = tabKey as TabType;
      const rows = sheets[t];
      
      // Skip empty tabs (no complete rows)
      const subtotal = getSubtotal(t);
      if (rows.every((r) => r.result == null) && rows.length === 1 && !rows[0].description) return;

      doc.setFontSize(14);
      doc.text(TAB_TITLES[t], 14, currentY);
      currentY += 5;

      const tableData = rows.map(r => [
        r.itemNo,
        r.description,
        r.nos,
        r.length,
        r.width,
        r.heightDepth,
        r.result == null ? "— incomplete" : r.result.toFixed(2),
        r.rate,
        r.result == null || r.rate === "" ? "—" : ((r.result * Number(r.rate)).toFixed(2)),
      ]);

      tableData.push(["", "SUBTOTAL", "", "", "", "", subtotal.toFixed(2), "", getAmountTotal(t).toFixed(2)]);

      doc.autoTable({
        startY: currentY,
        head: [["Item No", "Description", "Nos", "L", "W", "H/D", "Qty/Area", "Rate", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [242, 164, 19] }, // amber #F2A413 (was legacy purple) 
      });

      currentY = doc.lastAutoTable.finalY + 15;
    });

    doc.save("Measurement_Sheet.pdf");
  };

  return (
    <div className="tool-card p-4 md:p-8 flex flex-col w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-txt-primary flex items-center gap-2">
            <Section className="w-6 h-6 text-accent-800" />
            Measurement Sheet
          </h2>
          <p className="text-txt-tertiary mt-1">
            Nos × L × W × D quantities per IS 1200. A row with missing dimensions is flagged incomplete — never silently computed. For plaster, enter the net area per row after applying the IS 1200 opening deductions yourself (under 0.5 m² none, 0.5–3 m² one face, over 3 m² both faces).
          </p>
          <div className="flex gap-2 mt-3">
            <span className="text-sm font-semibold text-txt-secondary self-center">Units:</span>
            {(["m", "ft"] as const).map((u) => (
              <Button key={u} onClick={() => setUnit(u)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${unit === u ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>{u === "m" ? "Metres (m / m² / m³)" : "Feet (ft / sqft / cu.ft)"}</Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportPDF} className="flex items-center gap-2 bg-ink hover:bg-ink-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors whitespace-nowrap">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
          <Button onClick={exportCsv} className="flex items-center gap-2 bg-surface-hover px-5 py-2.5 rounded-full font-medium transition-colors whitespace-nowrap">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={sendActiveTabToBoq} className="flex items-center gap-2 bg-accent-500 text-ink px-5 py-2.5 rounded-full font-bold transition-colors whitespace-nowrap">
            Send to BOQ
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4 no-scrollbar border-b border-ui-borderSubtle">
        {(Object.keys(TAB_TITLES) as TabType[]).map(tab => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? "bg-accent-100  text-accent-800 "
                : "text-txt-secondary  hover:bg-surface-hover"
            }`}
          >
            {TAB_TITLES[tab]}
          </Button>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto w-full rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-accent-50 text-accent-800">
              <th className="p-3 font-semibold rounded-tl-xl w-24">Item No</th>
              <th className="p-3 font-semibold min-w-[200px]">Description</th>
              <th className="p-3 font-semibold w-20">Nos</th>
              <th className="p-3 font-semibold w-24">L</th>
              <th className="p-3 font-semibold w-24">W</th>
              <th className="p-3 font-semibold w-24">H/D</th>
              <th className="p-3 font-semibold w-32 border-l border-accent-200">Total ({unitLabelFor(TAB_KIND[activeTab], unit)})</th>
              <th className="p-3 font-semibold w-24">Rate</th>
              <th className="p-3 font-semibold w-28">Amount</th>
              <th className="p-3 font-semibold rounded-tr-xl w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sheets[activeTab].map((row, idx) => (
              <tr key={row.id} className="border-b border-border-color hover:bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden">
                <td className="p-2">
                  <><label htmlFor="a11y-input-343" className="sr-only">Input</label>
<input id="a11y-input-343"
                    type="text"
                    value={row.itemNo}
                    onChange={(e) => handleRowChange(activeTab, row.id, "itemNo", e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 px-1 text-txt-primary rounded-full"
                    placeholder={`${idx + 1}`}
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-344" className="sr-only">Enter description...</label>
<input id="a11y-input-344"
                    type="text"
                    value={row.description}
                    onChange={(e) => handleRowChange(activeTab, row.id, "description", e.target.value)}
                    className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-3 py-1.5 focus:border-ink focus:ring-1 focus:ring-accent-500 outline-none text-txt-primary"
                    placeholder="Enter description..."
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-345" className="sr-only">Input</label>
<input id="a11y-input-345"
                    type="number" inputMode="decimal"
                    value={row.nos}
                    onChange={(e) => handleRowChange(activeTab, row.id, "nos", e.target.value)}
                    className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-2 py-1.5 focus:border-ink focus:ring-1 focus:ring-accent-500 outline-none text-center text-txt-primary"
                    min="0"
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-346" className="sr-only">Input</label>
<input id="a11y-input-346"
                    type="number" inputMode="decimal"
                    value={row.length}
                    onChange={(e) => handleRowChange(activeTab, row.id, "length", e.target.value)}
                    className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-2 py-1.5 focus:border-ink focus:ring-1 focus:ring-accent-500 outline-none text-center text-txt-primary"
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-347" className="sr-only">Input</label>
<input id="a11y-input-347"
                    type="number" inputMode="decimal"
                    value={row.width}
                    onChange={(e) => handleRowChange(activeTab, row.id, "width", e.target.value)}
                    className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-2 py-1.5 focus:border-ink focus:ring-1 focus:ring-accent-500 outline-none text-center text-txt-primary"
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-348" className="sr-only">Input</label>
<input id="a11y-input-348"
                    type="number" inputMode="decimal"
                    value={row.heightDepth}
                    onChange={(e) => handleRowChange(activeTab, row.id, "heightDepth", e.target.value)}
                    className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-2 py-1.5 focus:border-ink focus:ring-1 focus:ring-accent-500 outline-none text-center text-txt-primary"
                  /></>
                </td>
                <td className="p-2 border-l border-border-color bg-surface-hover border-b-0 font-medium text-txt-primary">
                  <div className="w-full text-right px-2" title={row.hint ?? undefined}>
                    {row.result == null ? <span className="text-accent-800 font-bold">— incomplete</span> : row.result.toFixed(2)}
                  </div>
                  {row.hint && <div className="text-xs text-accent-800 px-2">{row.hint}</div>}
                </td>
                <td className="p-2">
                  <input type="number" inputMode="decimal" value={row.rate} onChange={(e) => handleRowChange(activeTab, row.id, "rate", e.target.value)} className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-2 py-1.5 focus:border-ink outline-none text-center" placeholder="—" />
                </td>
                <td className="p-2 text-right font-semibold">
                  {row.result == null || row.rate === "" ? "—" : (row.result * Number(row.rate)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-center">
                  <Button
                    onClick={() => deleteRow(activeTab, row.id)}
                    className="text-txt-secondary hover:text-ui-errorText transition-colors p-1 rounded-full"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-accent-200">
              <td colSpan={6} className="p-4 text-right font-bold text-txt-secondary">
                SUBTOTAL {incompleteCount(activeTab) > 0 ? `(${incompleteCount(activeTab)} incomplete row(s) excluded)` : ""}
              </td>
              <td className="p-4 text-right font-bold text-accent-800 bg-accent-50">
                {getSubtotal(activeTab).toFixed(2)}
              </td>
              <td></td>
              <td className="p-4 text-right font-bold text-accent-800 bg-accent-50">
                {getAmountTotal(activeTab).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {activeTab === "plaster" && (
        <p className="mt-4 text-sm text-txt-tertiary">Plaster opening deductions (IS 1200): openings under 0.5 m² — no deduction; 0.5–3 m² — deduct one face; over 3 m² — deduct both faces and add jambs, soffits and sills. Enter the net area per row after applying the rule.</p>
      )}
      <div className="mt-4 flex justify-start">
        <Button
          onClick={() => addRow(activeTab)}
          className="flex items-center gap-2 text-accent-800 hover:bg-accent-50 px-4 py-2 rounded-full font-medium transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </Button>
      </div>

    
      <CalculationHistory calculatorId="measurementsheetcalculator_tool" currentInputs={{ activeTab, unit }} currentResults={{ subtotal: getSubtotal(activeTab) }}
        onRestore={(ins) => {
          if (ins.activeTab != null) setActiveTab(ins.activeTab as typeof activeTab);
          if (ins.unit != null) setUnit(ins.unit as typeof unit);
        }}
      />
</div>
  );
};

export default MeasurementSheetCalculator;
