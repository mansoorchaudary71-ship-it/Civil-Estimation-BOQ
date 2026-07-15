import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, PieChart as PieChartIcon, DollarSign, Settings2, Home } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CalculationHistory } from '../ui/CalculationHistory';
import { useSettings } from '../../context/SettingsContext';
import { CurrencySelector } from '../ui/CurrencySelector';

import { CostTrendChart } from "./CostTrendChart";

interface CostItem {
  id: string;
  name: string;
  amount: number;
}

const COLORS = ["#8b5cf6", "#f97316", "#3b82f6", "#10b981", "#ef4444", "#6366f1"];

const ConstructionCostSummary: React.FC = () => {
  const [totalArea, setTotalArea] = useState<number>(2000);
  
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
    doc.text(`Total Built-up Area: ${totalArea.toLocaleString()} sq ft`, 14, 32);
    doc.text(`Cost per sq ft: ${costPerSqFt.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 14, 40);

    let currentY = 50;

    const generateTable = (title: string, data: CostItem[], total: number) => {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(title, 14, currentY);
      
      const body = data.map(item => [item.name, item.amount.toLocaleString()]);
      body.push(["SUBTOTAL", total.toLocaleString()]);

      doc.autoTable({
        startY: currentY + 5,
        head: [["Description", "Amount"]],
        body: body,
        theme: "grid",
        headStyles: { fillColor: [249, 115, 22] }, // Orange 500
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 40, halign: 'right' }
        },
        willDrawCell: function(data: any) {
          if (data.row.index === body.length - 1 && data.section === 'body') {
            doc.setFont("helvetica", "bold");
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    };

    generateTable("1. Grey Structure Cost", greyStructure, greyTotal);
    generateTable("2. Finishing Cost", finishing, finishTotal);
    generateTable("3. Labour Cost", labour, labourTotal);

    // Final Summary Block
    // Check if new page needed
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.text("4. Additional Costs & Grand Total", 14, currentY);
    
    doc.autoTable({
      startY: currentY + 5,
      head: [["Item", "Percentage", "Amount"]],
      body: [
        ["Base Construction Subtotal", "-", subTotal.toLocaleString()],
        ["Overhead & Profit", `${overheadProfitPct}%`, overheadProfitAmount.toLocaleString()],
        ["Contingency", `${contingencyPct}%`, contingencyAmount.toLocaleString()],
        ["GRAND TOTAL", "-", grandTotal.toLocaleString()]
      ],
      theme: "grid",
      headStyles: { fillColor: [88, 28, 135] }, // Purple 900
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' }
      },
      willDrawCell: function(data: any) {
        if (data.row.index === 3 && data.section === 'body') {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(88, 28, 135);
        }
      }
    });

    doc.save("Construction_Cost_Summary.pdf");
  };

  return (
    <div className="tool-card p-4 md:p-8 flex flex-col w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
            <PieChartIcon className="w-6 h-6 text-purple-600" />
            Cost Summary Sheet
          </h2>
          <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
            Consolidate estimates into a master summary with overheads and cost per sq ft analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencySelector />
          <button onClick={exportToPDF}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-slate-900 px-5 py-2.5 rounded-full transition-colors whitespace-nowrap text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="mb-8 bg-purple-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-4 sm:p-6 rounded-[24px] border border-purple-100 overflow-hidden">
        <label className="block mb-2 text-sm font-medium text-slate-700 mb-1">
          Total Built-Up Area (sq ft)
        </label>
        <div className="relative max-w-sm">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <><label htmlFor="a11y-input-193" className="sr-only">Input</label>
<input id="a11y-input-193"
            type="number" inputMode="decimal"
            value={totalArea}
            onChange={(e) => setTotalArea(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 pl-10 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none"
          /></>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className="space-y-8">
          
          {/* Grey Structure */}
          <div>
            <h3 className="mb-4 border-b border-slate-200 pb-2 text-lg font-medium text-slate-800">
              1. Grey Structure Cost
            </h3>
            <div className="space-y-3">
              {greyStructure.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
                  <label className="flex-1 text-sm font-medium text-slate-700 mb-1 block">{item.name}</label>
                  <div className="relative w-40">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                    <><label htmlFor="a11y-input-194" className="sr-only">Input</label>
<input id="a11y-input-194"
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("grey", item.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-full py-1.5 pl-6 pr-2 text-right focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    /></>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold text-slate-800">
                <span>Subtotal:</span>
                <span>{formatCurrency(greyTotal)}</span>
              </div>
            </div>
          </div>

          {/* Finishing */}
          <div>
            <h3 className="mb-4 border-b border-slate-200 pb-2 text-lg font-medium text-slate-800">
              2. Finishing Cost
            </h3>
            <div className="space-y-3">
              {finishing.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
                  <label className="flex-1 text-sm font-medium text-slate-700 mb-1 block">{item.name}</label>
                  <div className="relative w-40">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                    <><label htmlFor="a11y-input-195" className="sr-only">Input</label>
<input id="a11y-input-195"
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("finish", item.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-full py-1.5 pl-6 pr-2 text-right focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    /></>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold text-slate-800">
                <span>Subtotal:</span>
                <span>{formatCurrency(finishTotal)}</span>
              </div>
            </div>
          </div>

          {/* Labour */}
          <div>
            <h3 className="mb-4 border-b border-slate-200 pb-2 text-lg font-medium text-slate-800">
              3. Labour Cost
            </h3>
            <div className="space-y-3">
              {labour.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
                  <label className="flex-1 text-sm font-medium text-slate-700 mb-1 block">{item.name}</label>
                  <div className="relative w-40">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                    <><label htmlFor="a11y-input-196" className="sr-only">Input</label>
<input id="a11y-input-196"
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("labour", item.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-full py-1.5 pl-6 pr-2 text-right focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    /></>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold text-slate-800">
                <span>Subtotal:</span>
                <span>{formatCurrency(labourTotal)}</span>
              </div>
            </div>
          </div>
          
          {/* O&P / Contingency */}
          <div className="bg-blue-50 p-5 rounded-[24px] border border-blue-100 overflow-hidden">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-800">
              <Settings2 className="w-5 h-5 text-blue-500" />
              Additional Factors
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Overhead & Profit (%)</label>
                  <span className="bg-white px-2 py-1 rounded text-blue-600 font-bold border border-slate-200">{overheadProfitPct}%</span>
                </div>
                <><label htmlFor="a11y-input-197" className="sr-only">Input</label>
<input id="a11y-input-197"
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={overheadProfitPct}
                  onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                /></>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Contingency (%)</label>
                  <span className="bg-white px-2 py-1 rounded text-blue-600 font-bold border border-slate-200">{contingencyPct}%</span>
                </div>
                <><label htmlFor="a11y-input-198" className="sr-only">Input</label>
<input id="a11y-input-198"
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={contingencyPct}
                  onChange={(e) => setContingencyPct(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                /></>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Summary */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-slate-50 rounded-[32px] border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col min-h-[450px] mb-2 overflow-hidden"
          >
            <h3 className="text-center text-lg font-semibold text-slate-800 mb-1">Project Summary Dashboard</h3>
            <p className="text-center text-sm font-medium text-slate-500 mb-4">Material vs. Labor Distribution</p>
            <div className="flex-1 w-full pt-4 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatCurrency(value, false)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    content={(props: any) => {
                      const { payload } = props;
                      return (
                        <ul className="flex flex-wrap justify-center gap-4 mt-8 mb-2">
                          {payload.map((entry: any, index: number) => (
                            <li key={`item-${index}`} className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                              <span className="text-slate-800 font-medium text-sm">{entry.value}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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
              
              <div className="w-full bg-white rounded-[24px] shadow-sm p-5 flex items-center justify-between overflow-hidden">
                <div>
                  <div className="text-slate-600 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1">Cost Per Sq Ft</div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">{formatCurrency(costPerSqFt)}</div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <PieChartIcon className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700" />
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
</div>
  );
};

export default ConstructionCostSummary;
