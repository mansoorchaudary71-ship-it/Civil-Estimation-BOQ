import { Button } from '../ui/Button';
import { useState } from "react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { CalculationHistory } from "../ui/CalculationHistory";
import {
  Download,
  Plus,
  Search,
  Filter,
  Link as LinkIcon,
  Unlink,
  FileText,
  FileSpreadsheet,
  Loader2,
  Save,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useTakeoff } from "../../context/TakeoffContext";
import {
  calculateLength,
  calculateArea,
  convertLength,
  convertArea,
} from "../../utils/measurements";
import { generatePDFReport, generateExcelReport } from "../../utils/reports";

import { saveEstimate } from "../../lib/estimates";
import { useAuth } from "../../contexts/AuthContext";
import { GenericExportButtons } from "../ui/GenericExportButtons";

function cleanUnit(u: string) {
  return u.replace(/[²³]/g, "").replace(/sq\.?/g, "").trim().toLowerCase();
}
const COMMON_UNITS = [
  "m³",
  "m²",
  "m",
  "sq.ft",
  "sq.yd",
  "cu.ft",
  "ft",
  "in",
  "cm",
  "mm",
  "MT",
  "count",
];
function BOQRow({
  row,
  measurements,
  getQty,
  updateBoqItem,
  scalePxPerUnit,
  unitName,
  formatCurrency,
  settings,
}: any) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const qty = getQty(row);
  const amount = qty * row.rate;
  const isLinked =
    row.linkedMeasurementIds && row.linkedMeasurementIds.length > 0;
  const useManual = isLinked ? !!row.isManualOverride : true;
  return (
    <tr className="hover:bg-transparent transition-colors group">
      <td className="py-2 px-3 font-mono text-blue-400 text-[10px]">
        {row.id}
      </td>
      <td className="py-2 px-3 text-txt-primary">{row.desc}</td>
      <td className="py-2 px-3 text-txt-tertiary">
        <select
          value={row.unit}
          onChange={(e) => updateBoqItem(row.id, { unit: e.target.value })}
          className="bg-transparent appearance-none rounded focus:ring-1 focus:ring-blue-500 py-0.5 outline-none cursor-pointer max-w-[4rem] border border-transparent hover:border-ui-borderSubtle"
        >
          {COMMON_UNITS.map((u) => (
            <option key={u} value={u} className="bg-surface-default">
              {u}
            </option>
          ))}
          {!COMMON_UNITS.includes(row.unit) && (
            <option value={row.unit} className="bg-surface-default">
              {row.unit}
            </option>
          )}
        </select>
      </td>
      <td className="py-2 px-3 text-right">
        <div className="flex items-center justify-end gap-2 text-sm">
          {isLinked && (
            <Button
              onClick={() =>
                updateBoqItem(row.id, {
                  isManualOverride: !row.isManualOverride,
                })
              }
              className={`p-1 rounded ${row.isManualOverride ? "text-txt-tertiary  hover:text-txt-primary" : "text-blue-400 bg-blue-400/10"}`}
              title={
                row.isManualOverride
                  ? "Using manual override. Click to use linked."
                  : "Using linked data. Click to override manually."
              }
            >
              {row.isManualOverride ? (
                <Unlink className="w-3 h-3 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
              ) : (
                <LinkIcon className="w-3 h-3" />
              )}
            </Button>
          )}
          <div className="relative">
            {useManual ? (
              <><label htmlFor="a11y-input-317" className="sr-only">Input</label>
<input id="a11y-input-317" type="number" inputMode="decimal"
                className="w-16 bg-transparent border border-ui-borderSubtle rounded px-1.5 py-0.5 text-right focus:outline-none focus:border-blue-500 text-txt-primary font-mono min-h-[44px] rounded-full"
                value={row.qtyOverride || 0}
                onChange={(e) =>
                  updateBoqItem(row.id, {
                    qtyOverride: parseFloat(e.target.value) || 0,
                  })
                }
              /></>
            ) : (
              <span className="font-mono text-blue-400 px-1.5 py-0.5 inline-block min-w-[4rem] text-right">
                {qty.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-2 px-3 text-right relative">
        <div
          className="bg-transparent border border-ui-borderSubtle rounded px-2 py-1 text-[10px] text-txt-primary w-full cursor-pointer flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="truncate flex-1 text-left w-20">
            {isLinked
              ? `${row.linkedMeasurementIds?.length} linked`
              : "-- No Link --"}
          </span>
          <span className="text-[8px]">▼</span>
        </div>
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="w-full absolute right-3 top-8 w-44 bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-xl z-20 py-2 flex flex-col gap-1 max-h-48 overflow-y-auto overflow-hidden">
              <div className="px-2 pb-1 border-b border-ui-borderSubtle mb-1">
                <span className="text-[10px] text-txt-secondary font-semibold uppercase">
                  Measurements
                </span>
              </div>
              {measurements.map((m: any) => {
                const isSelected = row.linkedMeasurementIds?.includes(m.id);
                let valStr = "";
                let typeIcon = "";
                const fromBase = cleanUnit(unitName);
                const toBase = cleanUnit(row.unit);
                if (m.type === "line") {
                  let val = calculateLength(m.points, scalePxPerUnit);
                  val = convertLength(val, fromBase, toBase);
                  valStr = `${val.toFixed(2)} ${toBase}`;
                  typeIcon = "📏";
                } else if (m.type === "area") {
                  let val = calculateArea(m.points, scalePxPerUnit);
                  val = convertArea(val, fromBase, toBase);
                  valStr = `${val.toFixed(2)} ${toBase}²`;
                  typeIcon = "📐";
                } else if (m.type === "assembly") {
                  valStr = `1 count`;
                  typeIcon = "📦";
                }
                return (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-transparent cursor-pointer text-sm text-txt-primary"
                  >
                    <><label htmlFor="a11y-input-318" className="sr-only">Input</label>
<input id="a11y-input-318"
                      type="checkbox"
                      className="accent-blue-500 rounded bg-transparent border-ui-borderSubtle shrink-0"
                      checked={isSelected}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...(row.linkedMeasurementIds || []), m.id]
                          : (row.linkedMeasurementIds || []).filter(
                              (id: string) => id !== m.id,
                            );
                        updateBoqItem(row.id, { linkedMeasurementIds: newIds });
                      }}
                    /></>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate flex-1" title={m.name}>
                        {m.name}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] text-txt-secondary mt-0.5">
                        <span>{typeIcon}</span>
                        <span className="font-mono">{valStr}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
              {measurements.length === 0 && (
                <div className="px-3 py-2 text-sm text-txt-secondary">
                  No measurements
                </div>
              )}
            </div>
          </>
        )}
      </td>
      <td className="py-2 px-3 font-mono text-right text-txt-secondary">
        {formatCurrency(row.rate)}
      </td>
      <td className="py-2 px-3 font-mono text-right font-medium">
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}
export default function LiveBOQ() {
  const { formatCurrency, settings } = useSettings();
  const {
    boqItems,
    updateBoqItem,
    addBoqItem,
    measurements,
    scalePxPerUnit,
    unitName,
  } = useTakeoff();
  const { user } = useAuth();
  
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [exportData, setExportData] = useState({
    projectName: "Project Alpha",
    projectId: "ID-4921-X",
    clientName: "Acme Corp",
    siteLocation: "New York, NY",
  });
  const getQty = (item: any) => {
    if (item.isManualOverride) return item.qtyOverride || 0;
    if (item.linkedMeasurementIds && item.linkedMeasurementIds.length > 0) {
      let totalVal = 0;
      let hasNormalMeasurement = false;
      const fromBase = cleanUnit(unitName);
      const toBase = cleanUnit(item.unit);
      item.linkedMeasurementIds.forEach((mId: string) => {
        const m = measurements.find((m: any) => m.id === mId);
        if (m) {
          let val = 0;
          if (m.type === "line") {
            val = calculateLength(m.points, scalePxPerUnit);
            val = convertLength(val, fromBase, toBase);
            hasNormalMeasurement = true;
          } else if (m.type === "area") {
            val = calculateArea(m.points, scalePxPerUnit);
            val = convertArea(val, fromBase, toBase);
            hasNormalMeasurement = true;
          } else if (m.type === "assembly") {
            hasNormalMeasurement = false;
          }
          totalVal += val;
        }
      });
      if (!hasNormalMeasurement) return item.qtyOverride || 0;
      return totalVal;
    }
    return item.qtyOverride || 0;
  };
  const totalCost = boqItems.reduce(
    (acc, row) => acc + getQty(row) * row.rate,
    0,
  );
  const handleExport = async (type: "pdf" | "excel") => {
    const details = { ...exportData, date: new Date().toLocaleDateString() };
    if (type === "pdf") {
      setIsPdfLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
      try {
        await generatePDFReport(
          boqItems,
          measurements,
          scalePxPerUnit,
          unitName,
          details,
          settings.currency,
        );
      } catch (error) {
        console.error("Failed to generate PDF", error);
      } finally {
        setIsPdfLoading(false);
        setShowExportModal(false);
      }
    } else {
      setIsExcelLoading(true);
      try {
        await generateExcelReport(
          boqItems,
          measurements,
          scalePxPerUnit,
          unitName,
          details,
          settings.currency,
        );
      } catch (error) {
        console.error("Failed to generate Excel", error);
      } finally {
        setIsExcelLoading(false);
        setShowExportModal(false);
      }
    }
  };
  return (
    <div className="flex flex-col h-full text-txt-primary p-8 relative">
      <div className="flex-1 calc-input flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ui-borderSubtle flex items-center justify-between shrink-0 flex-wrap gap-4">
          <div>
            <h2 className="text-base font-medium uppercase tracking-wider text-txt-secondary">
              Live Bill of Quantities (BOQ)
            </h2>
            <span className="text-sm font-mono text-green-500 mt-1 block">
              Project: {exportData.projectName} • {exportData.projectId}
            </span>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <GlobalSettingsToggle align="left" showCurrency={true} />
            <Button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 text-sm bg-transparent border border-ui-borderSubtle rounded hover:bg-slate-200 transition-colors flex items-center gap-1.5 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <Download className="w-[14px] h-[14px]" /> Export Report
            </Button>
            <Button className="px-3 py-1.5 text-sm bg-indigo-600 font-medium text-white rounded hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm rounded-full active:scale-95 hover:-translate-y-0.5">
              <Plus className="w-[14px] h-[14px]" /> Add Item
            </Button>
          </div>
        </div>
        {/* Search */}
        <div className="px-6 py-4 border-b border-ui-borderSubtle bg-transparent/20 flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-[14px] h-[14px] absolute left-3 top-2.5 text-txt-secondary" />
            <><label htmlFor="a11y-input-319" className="sr-only">Search items...</label>
<input id="a11y-input-319" type="text"
              placeholder="Search items..."
              className="w-full bg-transparent border border-ui-borderSubtle rounded-full px-3 pl-8 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-txt-primary min-h-[44px]"
            /></>
          </div>
          <Button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-ui-borderSubtle rounded text-sm hover:bg-slate-200 transition-colors text-txt-secondary rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <Filter className="w-[14px] h-[14px]" /> Filters
          </Button>
          <div className="ml-auto">
            <GenericExportButtons tableId="live-boq-table" filename="Live_BOQ_Report" />
          </div>
        </div>
        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <table id="live-boq-table" className="boq-table-print-breaks w-full text-left text-sm">
            <thead className="text-txt-secondary border-b border-ui-borderSubtle">
              <tr>
                <th className="py-2 px-3 font-normal w-20">Item</th>
                <th className="py-2 px-3 font-normal">Description</th>
                <th className="py-2 px-3 font-normal w-20">Unit</th>
                <th className="py-2 px-3 font-normal text-right w-32">Qty</th>
                <th className="py-2 px-3 font-normal text-right w-24">Link</th>
                <th className="py-2 px-3 font-normal text-right w-24">
                  Rate ({settings.currency})
                </th>
                <th className="py-2 px-3 font-normal text-right w-32">
                  Amount ({settings.currency})
                </th>
              </tr>
            </thead>
            <tbody className="text-txt-secondary divide-y divide-slate-200">
              {boqItems.map((row) => (
                <BOQRow
                  key={row.id}
                  row={row}
                  measurements={measurements}
                  getQty={getQty}
                  updateBoqItem={updateBoqItem}
                  scalePxPerUnit={scalePxPerUnit}
                  unitName={unitName}
                  formatCurrency={formatCurrency}
                  settings={settings}
                />
              ))}
            </tbody>
            <tfoot className="border-t border-ui-borderSubtle">
              <tr>
                <th
                  colSpan={6}
                  className="py-3 px-3 text-right text-[10px] text-txt-secondary uppercase font-semibold"
                >
                  Total Estimated Cost
                </th>
                <th className="py-3 px-3 font-mono text-right text-sm text-txt-primary font-semibold tabular-nums tracking-tight bg-slate-100 rounded-br-lg">
                  {formatCurrency(totalCost)}
                </th>
              </tr>
            </tfoot>
          </table>
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            
            
            
          </div>
        </div>
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div className="absolute inset-0 bg-slate-50/60 flex items-center justify-center z-50">
          <div className="bg-surface-default border border-ui-borderSubtle rounded-2xl p-4 sm:p-6 max-w-sm w-full shadow-2xl overflow-hidden">
            <h3 className="text-base font-medium mb-4 text-txt-primary flex items-center gap-2">
              <Download className="w-[16px] h-[16px] text-blue-400" /> Generate
              Professional Report
            </h3>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-txt-secondary mb-1.5">
                  Project Name
                </label>
                <><label htmlFor="a11y-input-320" className="sr-only">Input</label>
<input id="a11y-input-320"
                  type="text"
                  value={exportData.projectName}
                  onChange={(e) =>
                    setExportData((prev) => ({
                      ...prev,
                      projectName: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent border border-ui-borderSubtle rounded p-2 text-sm text-txt-primary focus:outline-none focus:border-blue-500 rounded-full"
                /></>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-txt-secondary mb-1.5">
                  Client Name
                </label>
                <><label htmlFor="a11y-input-321" className="sr-only">Input</label>
<input id="a11y-input-321"
                  type="text"
                  value={exportData.clientName}
                  onChange={(e) =>
                    setExportData((prev) => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent border border-ui-borderSubtle rounded p-2 text-sm text-txt-primary focus:outline-none focus:border-blue-500 rounded-full"
                /></>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-txt-secondary mb-1.5">
                  Site Location
                </label>
                <><label htmlFor="a11y-input-322" className="sr-only">Input</label>
<input id="a11y-input-322"
                  type="text"
                  value={exportData.siteLocation}
                  onChange={(e) =>
                    setExportData((prev) => ({
                      ...prev,
                      siteLocation: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent border border-ui-borderSubtle rounded p-2 text-sm text-txt-primary focus:outline-none focus:border-blue-500 rounded-full"
                /></>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => handleExport("pdf")}
                disabled={isPdfLoading || isExcelLoading}
                className="flex flex-col items-center justify-center p-3 bg-transparent border border-ui-borderSubtle rounded hover:border-red-500/50 hover:bg-red-500/10 transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                {isPdfLoading ? (
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                ) : (
                  <FileText className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-sm font-medium text-txt-primary">
                  {isPdfLoading ? "Generating..." : "Export PDF"}
                </span>
              </Button>
              <Button
                onClick={() => handleExport("excel")}
                disabled={isPdfLoading || isExcelLoading}
                className="flex flex-col items-center justify-center p-3 bg-transparent border border-ui-borderSubtle rounded hover:border-green-500/50 hover:bg-green-500/10 transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                {isExcelLoading ? (
                  <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-sm font-medium text-txt-primary">
                  {isExcelLoading ? "Generating..." : "Export Excel"}
                </span>
              </Button>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowExportModal(false)}
                disabled={isPdfLoading || isExcelLoading}
                className="px-4 py-2 text-sm text-txt-secondary hover:text-txt-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <CalculationHistory
        calculatorId="live_boq"
        estimationName="Live BOQ Viewer"
        currentInputs={{}}
      />
    </div>
  );
}
