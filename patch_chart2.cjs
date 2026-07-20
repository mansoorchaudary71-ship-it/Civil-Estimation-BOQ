const fs = require('fs');

const fullSource = `import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, PieChart as PieChartIcon, DollarSign, Settings2, Home, List, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CalculationHistory } from '../ui/CalculationHistory';
import { useSettings } from '../../context/SettingsContext';
import { CurrencySelector } from '../ui/CurrencySelector';
import { CostTrendChart } from "./CostTrendChart";
import { CostBreakdownChart } from "./CostBreakdownChart";

interface CostItem {
  id: string;
  name: string;
  amount: number;
}

const COLORS = ["#8b5cf6", "#f97316", "#3b82f6", "#10b981", "#ef4444", "#6366f1"];

const ConstructionCostSummary: React.FC = () => {
  const [totalArea, setTotalArea] = useState<number>(2000);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  
  // Grey Structure Items
  const [greyStructure, setGreyStructure] = useState<CostItem[]>([
    { id: "gs1", name: "Foundation & Earthworks", amount: 450000 },
    { id: "gs2", name: "Columns & Beams", amount: 800000 },
    { id: "gs3", name: "RCC Slabs", amount: 1200000 },
    { id: "gs4", name: "Brick Masonry", amount: 600000 },
  ]);

  // Finishing Items
  const [finishing, setFinishing] = useState<CostItem[]>([
    { id: "f1", name: "Floor & Wall Tiles", amount: 500000 },
    { id: "f2", name: "Paint Work", amount: 250000 },
    { id: "f3", name: "Doors & Windows", amount: 400000 },
    { id: "f4", name: "Plastering", amount: 300000 },
  ]);

  // Labour Items
  const [labour, setLabour] = useState<CostItem[]>([
    { id: "l1", name: "Skilled Labour (Masons, Carpenters)", amount: 800000 },
    { id: "l2", name: "Unskilled Labour (Helpers)", amount: 400000 },
  ]);

  // Percentages
  const [overheadProfitPct, setOverheadProfitPct] = useState<number>(15);
  const [contingencyPct, setContingencyPct] = useState<number>(5);

  const { formatCurrency, convertAmount, convertAmountToRaw, settings } = useSettings();

  const updateItem = (category: "grey" | "finish" | "labour", id: string, amount: string) => {
    const value = parseFloat(amount);
    const baseValue = isNaN(value) ? 0 : convertAmountToRaw(value);
    
    if (category === "grey") {
      setGreyStructure(prev => prev.map(item => item.id === id ? { ...item, amount: baseValue } : item));
    } else if (category === "finish") {
      setFinishing(prev => prev.map(item => item.id === id ? { ...item, amount: baseValue } : item));
    } else if (category === "labour") {
      setLabour(prev => prev.map(item => item.id === id ? { ...item, amount: baseValue } : item));
    }
  };

  const greyTotal = greyStructure.reduce((sum, item) => sum + item.amount, 0);
  const finishTotal = finishing.reduce((sum, item) => sum + item.amount, 0);
  const labourTotal = labour.reduce((sum, item) => sum + item.amount, 0);
  
  const subTotal = greyTotal + finishTotal + labourTotal;
  const overheadProfitAmount = (subTotal * overheadProfitPct) / 100;
  const contingencyAmount = (subTotal * contingencyPct) / 100;
  
  const grandTotal = subTotal + overheadProfitAmount + contingencyAmount;
  const costPerSqFt = totalArea > 0 ? grandTotal / totalArea : 0;

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
    doc.setTextColor(88, 28, 135); // Purple 900
    doc.text("Construction Cost Summary", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(\`Total Built-up Area: \${totalArea.toLocaleString()} sq ft\`, 14, 32);
    doc.text(\`Cost per sq ft: \${costPerSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })}\`, 14, 40);

    let currentY = 50;

    const generateTable = (title: string, data: CostItem[], total: number) => {
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text(title, 14, currentY);
      
      const tableData = data.map(item => [item.name, formatCurrency(item.amount, false)]);
      tableData.push(["Subtotal", formatCurrency(total, false)]);

      (doc as any).autoTable({
        startY: currentY + 5,
        head: [['Item Description', 'Cost']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }, // Purple 500
        columnStyles: { 1: { halign: 'right' } },
        didParseCell: (data: any) => {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [88, 28, 135];
          }
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    };

    generateTable("1. Grey Structure Cost", greyStructure, greyTotal);
    generateTable("2. Finishing Cost", finishing, finishTotal);
    generateTable("3. Labour Cost", labour, labourTotal);

    // Final Summary Box
    doc.setFillColor(243, 232, 255); // Purple 50
    doc.rect(14, currentY, 182, 50, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(88, 28, 135);
    doc.text("Final Cost Summary", 20, currentY + 10);
    
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(\`Base Subtotal: \${formatCurrency(subTotal, false)}\`, 20, currentY + 22);
    doc.text(\`Overhead & Profit (\${overheadProfitPct}%): \${formatCurrency(overheadProfitAmount, false)}\`, 20, currentY + 30);
    doc.text(\`Contingency (\${contingencyPct}%): \${formatCurrency(contingencyAmount, false)}\`, 20, currentY + 38);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(\`Grand Total: \${formatCurrency(grandTotal, false)}\`, 20, currentY + 48);

    doc.save("construction-cost-summary.pdf");
  };

  const renderCardView = () => (
    <div className="space-y-8">
      {/* Grey Structure */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          1. Grey Structure Cost
        </h3>
        <div className="space-y-3">
          {greyStructure.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{item.name}</label>
              <div className="relative w-40">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number" inputMode="decimal"
                  value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                  onChange={(e) => updateItem("grey", item.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
            <span>Subtotal:</span>
            <span>{formatCurrency(greyTotal)}</span>
          </div>
        </div>
      </div>
      {/* Finishing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          2. Finishing Cost
        </h3>
        <div className="space-y-3">
          {finishing.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{item.name}</label>
              <div className="relative w-40">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number" inputMode="decimal"
                  value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                  onChange={(e) => updateItem("finish", item.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
            <span>Subtotal:</span>
            <span>{formatCurrency(finishTotal)}</span>
          </div>
        </div>
      </div>
      {/* Labour */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          3. Labour Cost
        </h3>
        <div className="space-y-3">
          {labour.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{item.name}</label>
              <div className="relative w-40">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number" inputMode="decimal"
                  value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                  onChange={(e) => updateItem("labour", item.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
            <span>Subtotal:</span>
            <span>{formatCurrency(labourTotal)}</span>
          </div>
        </div>
      </div>
      
      {/* O&P / Contingency */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          <Settings2 className="w-5 h-5 text-blue-500" />
          Additional Factors
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Overhead & Profit (%)</label>
              <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{overheadProfitPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={overheadProfitPct}
              onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contingency (%)</label>
              <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{contingencyPct}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={contingencyPct}
              onChange={(e) => setContingencyPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="py-4 px-6 font-semibold w-1/3">Category</th>
              <th className="py-4 px-6 font-semibold w-1/2">Item Description</th>
              <th className="py-4 px-6 font-semibold text-right">Estimated Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {greyStructure.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                {index === 0 && (
                  <td rowSpan={greyStructure.length} className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 align-top border-r border-slate-200 dark:border-slate-800">
                    Grey Structure
                    <div className="mt-2 text-xs text-slate-500 font-normal">Subtotal: {formatCurrency(greyTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{item.name}</td>
                <td className="py-3 px-6 text-right">
                  <div className="relative inline-block w-32">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("grey", item.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {finishing.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-t border-slate-200 dark:border-slate-800">
                {index === 0 && (
                  <td rowSpan={finishing.length} className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 align-top border-r border-slate-200 dark:border-slate-800">
                    Finishing Cost
                    <div className="mt-2 text-xs text-slate-500 font-normal">Subtotal: {formatCurrency(finishTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{item.name}</td>
                <td className="py-3 px-6 text-right">
                  <div className="relative inline-block w-32">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("finish", item.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {labour.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-t border-slate-200 dark:border-slate-800">
                {index === 0 && (
                  <td rowSpan={labour.length} className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 align-top border-r border-slate-200 dark:border-slate-800">
                    Labour Cost
                    <div className="mt-2 text-xs text-slate-500 font-normal">Subtotal: {formatCurrency(labourTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{item.name}</td>
                <td className="py-3 px-6 text-right">
                  <div className="relative inline-block w-32">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("labour", item.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* O&P / Contingency inline below table */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 border-t border-blue-100 dark:border-blue-900/50 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Overhead & Profit (%)</label>
            <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{overheadProfitPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={overheadProfitPct}
            onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contingency (%)</label>
            <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{contingencyPct}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={contingencyPct}
            onChange={(e) => setContingencyPct(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 relative">
      <div className="flex justify-between items-end gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Construction Cost Summary</h2>
          <p className="text-slate-500 dark:text-slate-400">Estimate total material and labor costs for your project.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-500" />
              Project Total Area
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total covered area in sq ft</p>
          </div>
          <div className="relative w-full md:w-64">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm pointer-events-none">SQ FT</span>
            <input
              type="number" inputMode="decimal"
              value={totalArea}
              onChange={(e) => setTotalArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2.5 pr-14 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col min-h-[450px] mb-2 overflow-hidden"
          >
            <h3 className="text-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Project Summary Dashboard</h3>
            <p className="text-center text-sm font-medium text-slate-500 mb-4">Material vs. Labor Distribution</p>
            <div className="flex-1 w-full pt-4 pb-2">
              <CostBreakdownChart data={chartData} formatCurrency={formatCurrency} />
            </div>
          </motion.div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[32px] p-6 md:p-8 text-white shadow-xl overflow-hidden">
            <h3 className="text-purple-200 uppercase tracking-wider mb-6 text-lg font-semibold">Final Cost Summary</h3>
            
            <div className="space-y-4 mb-8 text-slate-100">
              <div className="flex justify-between items-center border-b border-purple-700/50 pb-3">
                <span className="text-purple-200 font-medium">Base Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-purple-700/50 pb-3">
                <span className="text-purple-200 font-medium">Overhead & Profit ({overheadProfitPct}%)</span>
                <span className="font-semibold text-white">{formatCurrency(overheadProfitAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-purple-700/50 pb-3">
                <span className="text-purple-200 font-medium">Contingency ({contingencyPct}%)</span>
                <span className="font-semibold text-white">{formatCurrency(contingencyAmount)}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-purple-200 font-medium text-sm mb-2">Grand Total Estimation</div>
              <div className="text-3xl md:text-[clamp(2rem,5vw,3rem)] break-all font-bold tracking-tight text-white mb-6">
                {formatCurrency(grandTotal)}
              </div>
              
              <div className="w-full bg-white dark:bg-slate-800 rounded-[24px] shadow-sm p-5 flex items-center justify-between overflow-hidden">
                <div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1">Cost Per Sq Ft</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(costPerSqFt)}</div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <PieChartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <CostTrendChart />
      </div>
      
      <CalculationHistory calculatorId="constructioncostsummary_tool" currentInputs={{}} />

      {/* View Toggle Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsTableView(!isTableView)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] hover:bg-blue-700 transition-colors"
        title={isTableView ? "Switch to Card View" : "Switch to Table View"}
      >
        {isTableView ? <LayoutGrid className="w-6 h-6" /> : <List className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

export default ConstructionCostSummary;
`
fs.writeFileSync('src/components/modules/ConstructionCostSummary.tsx', fullSource);
console.log("Written successfully");
