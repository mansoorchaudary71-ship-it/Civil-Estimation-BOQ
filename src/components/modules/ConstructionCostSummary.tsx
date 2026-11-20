import { Button } from '../ui/Button';
import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, PieChart as PieChartIcon, DollarSign, Settings2, Home, List, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CalculationHistory } from '../ui/CalculationHistory';
import { useSettings } from '../../context/SettingsContext';
import { CurrencySelector } from '../ui/CurrencySelector';
import { useAutoSave } from "../../hooks/useAutoSave";
import { costSummary, type CostLine } from "../../lib/costSummary";
import { CostBreakdownChart } from "./CostBreakdownChart";
import { GenericExportButtons } from "../ui/GenericExportButtons";


// Line items are qty x rate rows (engine: src/lib/costSummary). The defaults
// below are EXAMPLE figures, labelled as such — they are not computed
// quantities. Replace them with your own quantities/rates, or import
// quantities from the Material Takeoff / BOQ tools.
interface CostItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  rate: number;
}
const itemAmount = (item: CostItem) => item.qty * item.rate;

const COLORS = ["#F2A413", "#F2A413", "#1F1D1A", "#0F766E", "#B07006", "#1F1D1A"];

const ConstructionCostSummary: React.FC = () => {
  const [totalArea, setTotalArea] = useState<number>(2000);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  
  // Grey Structure Items
  const [greyStructure, setGreyStructure] = useState<CostItem[]>([
    { id: "gs1", name: "Foundation & Earthworks (example)", qty: 1, unit: "LS", rate: 450000 },
    { id: "gs2", name: "Columns & Beams (example)", qty: 1, unit: "LS", rate: 800000 },
    { id: "gs3", name: "RCC Slabs (example)", qty: 1, unit: "LS", rate: 1200000 },
    { id: "gs4", name: "Brick Masonry (example)", qty: 1, unit: "LS", rate: 600000 },
  ]);

  // Finishing Items
  const [finishing, setFinishing] = useState<CostItem[]>([
    { id: "f1", name: "Floor & Wall Tiles (example)", qty: 1, unit: "LS", rate: 500000 },
    { id: "f2", name: "Paint Work (example)", qty: 1, unit: "LS", rate: 250000 },
    { id: "f3", name: "Doors & Windows (example)", qty: 1, unit: "LS", rate: 400000 },
    { id: "f4", name: "Plastering (example)", qty: 1, unit: "LS", rate: 300000 },
  ]);

  // Labour Items
  const [labour, setLabour] = useState<CostItem[]>([
    { id: "l1", name: "Skilled Labour (example)", qty: 1, unit: "LS", rate: 800000 },
    { id: "l2", name: "Unskilled Labour (example)", qty: 1, unit: "LS", rate: 400000 },
  ]);

  // Percentages
  const [overheadProfitPct, setOverheadProfitPct] = useState<number>(15);
  const [contingencyPct, setContingencyPct] = useState<number>(5);
  // GST/VAT: explicit, default 0 — never silently omitted or added.
  // Label by region: Sales Tax (PK) 18% standard, GST (IN) 18%, VAT (UAE) 5%.
  const [taxPct, setTaxPct] = useState<number>(0);
  const [taxLabel, setTaxLabel] = useState<string>("Sales Tax (PK)");

  const { formatCurrency, convertAmount, convertAmountToRaw, settings } = useSettings();

  const updateItem = (category: "grey" | "finish" | "labour", id: string, field: "qty" | "rate", value: string) => {
    const parsed = parseFloat(value);
    const num = isNaN(parsed) ? 0 : Math.max(0, convertAmountToRaw(parsed));
    const apply = (list: CostItem[]) => list.map((item) => (item.id === id ? { ...item, [field]: num } : item));
    if (category === "grey") setGreyStructure(apply);
    else if (category === "finish") setFinishing(apply);
    else setLabour(apply);
  };

  useAutoSave("cost-summary", { totalArea, greyStructure, finishing, labour, overheadProfitPct, contingencyPct, taxPct, taxLabel },
    { totalArea: setTotalArea, greyStructure: setGreyStructure, finishing: setFinishing, labour: setLabour, overheadProfitPct: setOverheadProfitPct, contingencyPct: setContingencyPct, taxPct: setTaxPct, taxLabel: setTaxLabel });

  const toEngineLines = (list: CostItem[], category: CostLine["category"]): CostLine[] =>
    list.map((i) => ({ id: i.id, category, label: i.name, qty: i.qty, unit: i.unit, rate: i.rate }));
  const summary = costSummary({
    areaSqft: totalArea,
    lines: [...toEngineLines(greyStructure, "grey"), ...toEngineLines(finishing, "finish"), ...toEngineLines(labour, "labour")],
    overheadPct: overheadProfitPct, contingencyPct, taxPct, taxLabel,
  });
  const greyTotal = summary.greyTotal;
  const finishTotal = summary.finishTotal;
  const labourTotal = summary.labourTotal;
  const subTotal = summary.subtotal;
  const overheadProfitAmount = summary.overhead;
  const contingencyAmount = summary.contingency;
  const taxAmount = summary.tax;
  const grandTotal = summary.grandTotal;
  const costPerSqFt = summary.costPerSqft;

  const materialTotal = greyTotal + finishTotal;
  const otherTotal = overheadProfitAmount + contingencyAmount;

  const chartData = [
    { name: "Material Costs", value: convertAmount(materialTotal) },
    { name: "Labor Costs", value: convertAmount(labourTotal) },
    { name: "Overheads & Contingency", value: convertAmount(otherTotal) },
  ].filter(d => d.value > 0);

  const exportToPDF = () => {
    const doc = new (jsPDF as any)();
    
    doc.setFontSize(20);
    doc.setTextColor(31, 29, 26); // ink (Dribbble-amber system — was legacy purple)
    doc.text("Construction Cost Summary", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Total Built-up Area: ${totalArea.toLocaleString()} sq ft`, 14, 32);
    doc.text(`Cost per sq ft: ${costPerSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 14, 40);

    let currentY = 50;

    const generateTable = (title: string, data: CostItem[], total: number) => {
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text(title, 14, currentY);
      
      const tableData = data.map(item => [item.name, `${item.qty} ${item.unit} x ${formatCurrency(item.rate, false)}`, formatCurrency(itemAmount(item), false)]);
      tableData.push(["Subtotal", formatCurrency(total, false)]);

      (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Item Description', 'Qty x Rate', 'Cost']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [242, 164, 19] }, // amber #F2A413
        columnStyles: { 1: { halign: 'right' } },
        didParseCell: (data: any) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [31, 29, 26];
          }
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    };

    generateTable("1. Grey Structure Cost", greyStructure, greyTotal);
    generateTable("2. Finishing Cost", finishing, finishTotal);
    generateTable("3. Labour Cost", labour, labourTotal);

    // Final Summary Box
    doc.setFillColor(255, 251, 235); // amber-50
    doc.rect(14, currentY, 182, 50, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(31, 29, 26);
    doc.text("Final Cost Summary", 20, currentY + 10);
    
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`Base Subtotal: ${formatCurrency(subTotal, false)}`, 20, currentY + 22);
    doc.text(`Overhead & Profit (${overheadProfitPct}%): ${formatCurrency(overheadProfitAmount, false)}`, 20, currentY + 30);
    doc.text(`Contingency (${contingencyPct}%): ${formatCurrency(contingencyAmount, false)}`, 20, currentY + 38);
    doc.text(`${taxLabel} (${taxPct}%): ${formatCurrency(taxAmount, false)}`, 20, currentY + 46);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ${formatCurrency(grandTotal, false)}`, 20, currentY + 56);

    doc.save("construction-cost-summary.pdf");
  };

  const renderCardView = () => (
    <div className="space-y-8">
      {/* Grey Structure */}
      <div className="bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink rounded-2xl p-6 shadow-brand-sm">
        <h3 className="mb-4 border-b border-ui-borderSubtle dark:border-ink pb-2 text-lg font-medium text-txt-primary dark:text-txt-primary">
          1. Grey Structure Cost
        </h3>
        <div className="space-y-3">
          {greyStructure.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">{item.name}</label>
                            <div className="flex items-center gap-2">
                <input type="number" inputMode="decimal" min={0} value={item.qty} onChange={(e) => updateItem("grey", item.id, "qty", e.target.value)} className="w-20 bg-surface-default border border-ui-borderDefault rounded-xl py-2 px-3 text-right focus:border-ink outline-none" title="Quantity" />
                <span className="text-xs text-txt-tertiary">{item.unit} ×</span>
                <input type="number" inputMode="decimal" min={0} value={convertAmount(item.rate) === 0 ? '' : Number(convertAmount(item.rate).toFixed(2))} onChange={(e) => updateItem("grey", item.id, "rate", e.target.value)} className="w-40 bg-surface-default border border-ui-borderDefault rounded-xl py-2 px-3 text-right focus:border-ink outline-none" title="Rate" />
                <span className="font-semibold text-txt-primary w-28 text-right">{formatCurrency(itemAmount(item))}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-border-color dark:border-ink font-semibold text-txt-primary dark:text-txt-primary">
            <span>Subtotal:</span>
            <span>{formatCurrency(greyTotal)}</span>
          </div>
        </div>
      </div>
      {/* Finishing */}
      <div className="bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink rounded-2xl p-6 shadow-brand-sm">
        <h3 className="mb-4 border-b border-ui-borderSubtle dark:border-ink pb-2 text-lg font-medium text-txt-primary dark:text-txt-primary">
          2. Finishing Cost
        </h3>
        <div className="space-y-3">
          {finishing.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">{item.name}</label>
                            <div className="flex items-center gap-2">
                <input type="number" inputMode="decimal" min={0} value={item.qty} onChange={(e) => updateItem("finish", item.id, "qty", e.target.value)} className="w-20 bg-surface-default border border-ui-borderDefault rounded-xl py-2 px-3 text-right focus:border-ink outline-none" title="Quantity" />
                <span className="text-xs text-txt-tertiary">{item.unit} ×</span>
                <input type="number" inputMode="decimal" min={0} value={convertAmount(item.rate) === 0 ? '' : Number(convertAmount(item.rate).toFixed(2))} onChange={(e) => updateItem("finish", item.id, "rate", e.target.value)} className="w-40 bg-surface-default border border-ui-borderDefault rounded-xl py-2 px-3 text-right focus:border-ink outline-none" title="Rate" />
                <span className="font-semibold text-txt-primary w-28 text-right">{formatCurrency(itemAmount(item))}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-border-color dark:border-ink font-semibold text-txt-primary dark:text-txt-primary">
            <span>Subtotal:</span>
            <span>{formatCurrency(finishTotal)}</span>
          </div>
        </div>
      </div>
      {/* Labour */}
      <div className="bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink rounded-2xl p-6 shadow-brand-sm">
        <h3 className="mb-4 border-b border-ui-borderSubtle dark:border-ink pb-2 text-lg font-medium text-txt-primary dark:text-txt-primary">
          3. Labour Cost
        </h3>
        <div className="space-y-3">
          {labour.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">{item.name}</label>
                            <div className="flex items-center gap-2">
                <input type="number" inputMode="decimal" min={0} value={item.qty} onChange={(e) => updateItem("labour", item.id, "qty", e.target.value)} className="w-20 bg-surface-default border border-ui-borderDefault rounded-xl py-2 px-3 text-right focus:border-ink outline-none" title="Quantity" />
                <span className="text-xs text-txt-tertiary">{item.unit} ×</span>
                <input type="number" inputMode="decimal" min={0} value={convertAmount(item.rate) === 0 ? '' : Number(convertAmount(item.rate).toFixed(2))} onChange={(e) => updateItem("labour", item.id, "rate", e.target.value)} className="w-40 bg-surface-default border border-ui-borderDefault rounded-xl py-2 px-3 text-right focus:border-ink outline-none" title="Rate" />
                <span className="font-semibold text-txt-primary w-28 text-right">{formatCurrency(itemAmount(item))}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-border-color dark:border-ink font-semibold text-txt-primary dark:text-txt-primary">
            <span>Subtotal:</span>
            <span>{formatCurrency(labourTotal)}</span>
          </div>
        </div>
      </div>
      
      {/* O&P / Contingency */}
      <div className="bg-accent-50/50 dark:bg-accent-900/10 p-6 rounded-2xl border border-accent-100 dark:border-ink/50 shadow-brand-sm">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-medium text-txt-primary dark:text-txt-primary">
          <Settings2 className="w-5 h-5 text-accent-800" />
          Additional Factors
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">Overhead & Profit (%)</label>
              <span className="bg-surface-default dark:bg-ink px-3 py-1 rounded-lg text-accent-800 dark:text-accent-400 font-bold border border-ui-borderSubtle dark:border-ink-600">{overheadProfitPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={overheadProfitPct}
              onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-active rounded-full appearance-none cursor-pointer accent-accent-600"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">Contingency (%)</label>
              <span className="bg-surface-default dark:bg-ink px-3 py-1 rounded-lg text-accent-800 dark:text-accent-400 font-bold border border-ui-borderSubtle dark:border-ink-600">{contingencyPct}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={contingencyPct}
              onChange={(e) => setContingencyPct(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-active rounded-full appearance-none cursor-pointer accent-accent-600"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">{taxLabel} (%)</label>
              <span className="bg-surface-default dark:bg-ink px-3 py-1 rounded-lg text-accent-800 dark:text-accent-400 font-bold border border-ui-borderSubtle dark:border-ink-600">{taxPct}%</span>
            </div>
            <input type="range" min="0" max="25" step="1" value={taxPct} onChange={(e) => setTaxPct(parseInt(e.target.value))} className="w-full h-2 bg-surface-active rounded-full appearance-none cursor-pointer accent-accent-600" />
            <div className="flex gap-2 mt-2">
              {["Sales Tax (PK)", "GST (IN)", "VAT (UAE)"].map((l) => (
                <button key={l} onClick={() => { setTaxLabel(l); setTaxPct(l === "VAT (UAE)" ? 5 : 18); }} className={`px-2 py-1 rounded-full text-xs font-bold ${taxLabel === l ? 'bg-ink text-white' : 'bg-surface-hover text-txt-secondary'}`}>{l}</button>
              ))}
            </div>
            <p className="text-xs text-txt-tertiary mt-1">PK sales tax is 18% standard, IN GST 18%, UAE VAT 5% — the rate is labelled by region, never presented as universal.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink rounded-2xl shadow-brand-sm overflow-hidden">
      
<div className="flex justify-end mb-4"><GenericExportButtons tableId="cost-summary-table" filename="Cost_Summary" /></div>
<div className="overflow-x-auto">
        <table id="cost-summary-table"  className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover dark:bg-ink/50 text-txt-secondary dark:text-txt-tertiary text-sm border-b border-ui-borderSubtle dark:border-ink-600">
              <th className="py-4 px-6 font-semibold w-1/3">Category</th>
              <th className="py-4 px-6 font-semibold w-1/2">Item Description</th>
              <th className="py-4 px-6 font-semibold text-right">Estimated Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color dark:divide-ink text-sm">
            {greyStructure.map((item, index) => (
              <tr key={item.id} className="hover:bg-surface-hover/50 dark:hover:bg-ink/30 transition-colors">
                {index === 0 && (
                  <td rowSpan={greyStructure.length} className="py-3 px-6 font-medium text-txt-primary dark:text-txt-primary align-top border-r border-ui-borderSubtle dark:border-ink">
                    Grey Structure
                    <div className="mt-2 text-xs text-txt-tertiary font-normal">Subtotal: {formatCurrency(greyTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-txt-secondary dark:text-txt-tertiary">{item.name}</td>
                <td className="py-3 px-6 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                    <input type="number" inputMode="decimal" min={0} value={item.qty} onChange={(e) => updateItem("grey", item.id, "qty", e.target.value)} className="w-16 border rounded-lg py-1.5 px-2 text-right" title="Quantity" />
                    <span className="text-xs text-txt-tertiary">×</span>
                    <input type="number" inputMode="decimal" min={0} value={convertAmount(item.rate) === 0 ? '' : Number(convertAmount(item.rate).toFixed(2))} onChange={(e) => updateItem("grey", item.id, "rate", e.target.value)} className="w-28 border rounded-lg py-1.5 px-2 text-right" title="Rate" />
                    <span className="font-semibold w-24 text-right">{formatCurrency(itemAmount(item))}</span>
                  </div>
                </td>
              </tr>
            ))}
            {finishing.map((item, index) => (
              <tr key={item.id} className="hover:bg-surface-hover/50 dark:hover:bg-ink/30 transition-colors border-t border-ui-borderSubtle dark:border-ink">
                {index === 0 && (
                  <td rowSpan={finishing.length} className="py-3 px-6 font-medium text-txt-primary dark:text-txt-primary align-top border-r border-ui-borderSubtle dark:border-ink">
                    Finishing Cost
                    <div className="mt-2 text-xs text-txt-tertiary font-normal">Subtotal: {formatCurrency(finishTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-txt-secondary dark:text-txt-tertiary">{item.name}</td>
                <td className="py-3 px-6 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                    <input type="number" inputMode="decimal" min={0} value={item.qty} onChange={(e) => updateItem("finish", item.id, "qty", e.target.value)} className="w-16 border rounded-lg py-1.5 px-2 text-right" title="Quantity" />
                    <span className="text-xs text-txt-tertiary">×</span>
                    <input type="number" inputMode="decimal" min={0} value={convertAmount(item.rate) === 0 ? '' : Number(convertAmount(item.rate).toFixed(2))} onChange={(e) => updateItem("finish", item.id, "rate", e.target.value)} className="w-28 border rounded-lg py-1.5 px-2 text-right" title="Rate" />
                    <span className="font-semibold w-24 text-right">{formatCurrency(itemAmount(item))}</span>
                  </div>
                </td>
              </tr>
            ))}
            {labour.map((item, index) => (
              <tr key={item.id} className="hover:bg-surface-hover/50 dark:hover:bg-ink/30 transition-colors border-t border-ui-borderSubtle dark:border-ink">
                {index === 0 && (
                  <td rowSpan={labour.length} className="py-3 px-6 font-medium text-txt-primary dark:text-txt-primary align-top border-r border-ui-borderSubtle dark:border-ink">
                    Labour Cost
                    <div className="mt-2 text-xs text-txt-tertiary font-normal">Subtotal: {formatCurrency(labourTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-txt-secondary dark:text-txt-tertiary">{item.name}</td>
                <td className="py-3 px-6 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                    <input type="number" inputMode="decimal" min={0} value={item.qty} onChange={(e) => updateItem("labour", item.id, "qty", e.target.value)} className="w-16 border rounded-lg py-1.5 px-2 text-right" title="Quantity" />
                    <span className="text-xs text-txt-tertiary">×</span>
                    <input type="number" inputMode="decimal" min={0} value={convertAmount(item.rate) === 0 ? '' : Number(convertAmount(item.rate).toFixed(2))} onChange={(e) => updateItem("labour", item.id, "rate", e.target.value)} className="w-28 border rounded-lg py-1.5 px-2 text-right" title="Rate" />
                    <span className="font-semibold w-24 text-right">{formatCurrency(itemAmount(item))}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* O&P / Contingency inline below table */}
      <div className="bg-accent-50/50 dark:bg-accent-900/10 p-6 border-t border-accent-100 dark:border-ink/50 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">Overhead & Profit (%)</label>
            <span className="bg-surface-default dark:bg-ink px-3 py-1 rounded-lg text-accent-800 dark:text-accent-400 font-bold border border-ui-borderSubtle dark:border-ink-600">{overheadProfitPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={overheadProfitPct}
            onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-active rounded-full appearance-none cursor-pointer accent-accent-600"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary mb-1 block">Contingency (%)</label>
            <span className="bg-surface-default dark:bg-ink px-3 py-1 rounded-lg text-accent-800 dark:text-accent-400 font-bold border border-ui-borderSubtle dark:border-ink-600">{contingencyPct}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={contingencyPct}
            onChange={(e) => setContingencyPct(parseInt(e.target.value))}
            className="w-full h-2 bg-surface-active rounded-full appearance-none cursor-pointer accent-accent-600"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 relative">
      <div className="flex justify-between items-end gap-4 flex-wrap mb-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary dark:text-white mb-2">Construction Cost Summary</h1>
          <p className="text-txt-tertiary dark:text-txt-tertiary">Each line is quantity × rate. The pre-filled lines are <strong>example figures</strong> — replace them with your quantities from the Material Takeoff or BOQ tools.</p>
          {(!isFinite(totalArea) || totalArea <= 0) && <p className="text-sm font-semibold text-red-600 mt-1">Area must be greater than 0.</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <Button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-ink dark:bg-surface-default text-white dark:text-txt-primary rounded-lg hover:bg-ink dark:hover:bg-surface-hover transition-colors shadow-brand-sm"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Parameters */}
      <div className="bg-surface-default dark:bg-ink rounded-2xl p-6 md:p-8 border border-ui-borderSubtle dark:border-ink shadow-brand-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="text-xl font-bold text-txt-primary dark:text-txt-primary mb-1 flex items-center gap-2">
              <Home className="w-6 h-6 text-accent-800" />
              Project Total Area
            </h3>
            <p className="text-sm text-txt-tertiary dark:text-txt-tertiary">Total covered area in sq ft</p>
          </div>
          <div className="relative w-full md:w-64">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-tertiary font-medium text-sm pointer-events-none">SQ FT</span>
            <input
              type="number" inputMode="decimal"
              value={totalArea}
              onChange={(e) => setTotalArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-default dark:bg-ink border border-ui-borderDefault dark:border-ink-600 rounded-full px-4 py-2.5 pr-14 text-txt-primary dark:text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
        {/* Left Column: Inputs */}
        <div className="w-full">
          {isTableView ? renderTableView() : renderCardView()}
        </div>

        {/* Right Column: Visualization & Summary */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-surface-default rounded-2xl border border-ui-borderSubtle dark:border-ink shadow-brand-sm p-4 sm:p-6 flex flex-col min-h-[450px] mb-2 overflow-hidden"
          >
            <h3 className="text-center text-lg font-semibold text-txt-primary dark:text-txt-primary mb-1">Project Summary Dashboard</h3>
            <p className="text-center text-sm font-medium text-txt-tertiary mb-4">Material vs. Labor Distribution</p>
            <div className="flex-1 w-full pt-4 pb-2">
              <CostBreakdownChart data={chartData} formatCurrency={formatCurrency} />
            </div>
          </motion.div>

          <div className="bg-gradient-to-br from-ink to-ink rounded-2xl p-6 md:p-8 text-white shadow-xl overflow-hidden">
            <h3 className="text-accent-200 uppercase tracking-wider mb-6 text-lg font-semibold">Final Cost Summary</h3>
            
            <div className="space-y-4 mb-8 text-txt-inverse">
              <div className="flex justify-between items-center border-b border-ink/50 pb-3">
                <span className="text-accent-200 font-medium">Base Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-ink/50 pb-3">
                <span className="text-accent-200 font-medium">Overhead & Profit ({overheadProfitPct}%)</span>
                <span className="font-semibold text-white">{formatCurrency(overheadProfitAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-ink/50 pb-3">
                <span className="text-accent-200 font-medium">Contingency ({contingencyPct}%)</span>
                <span className="font-semibold text-white">{formatCurrency(contingencyAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-ink/50 pb-3">
                <span className="text-accent-200 font-medium">{taxLabel} ({taxPct}%)</span>
                <span className="font-semibold text-white">{formatCurrency(taxAmount)}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-accent-200 font-medium text-sm mb-2">Grand Total Estimation</div>
              <div className="text-3xl md:text-[clamp(2rem,5vw,3rem)] break-all font-bold tracking-tight text-white mb-6">
                {formatCurrency(grandTotal)}
              </div>
              
              <div className="w-full bg-surface-default dark:bg-ink rounded-2xl shadow-brand-sm p-5 flex items-center justify-between overflow-hidden">
                <div>
                  <div className="text-txt-secondary dark:text-txt-tertiary text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1">Cost Per Sq Ft</div>
                  <div className="text-xl sm:text-2xl font-bold text-txt-primary dark:text-white">{formatCurrency(costPerSqFt)}</div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-surface-hover dark:bg-ink-600 flex items-center justify-center">
                  <PieChartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-txt-secondary dark:text-txt-tertiary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-txt-tertiary">Cost trend is not shown: the history this chart read was always empty (no real past calculations were saved). Use the per-line quantities above and the BOQ Generator for comparable estimates.</p>
      
      <CalculationHistory calculatorId="constructioncostsummary_tool" currentInputs={{ totalArea, overheadProfitPct, contingencyPct, taxPct }} currentResults={{ grandTotal, costPerSqFt }} />

      {/* View Toggle Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsTableView(!isTableView)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-ink text-white rounded-full shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] hover:bg-ink-700 transition-colors"
        title={isTableView ? "Switch to Card View" : "Switch to Table View"}
      >
        {isTableView ? <LayoutGrid className="w-6 h-6" /> : <List className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default ConstructionCostSummary;
