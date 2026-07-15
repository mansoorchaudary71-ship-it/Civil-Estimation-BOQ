import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Download, Section } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CalculationHistory } from '../ui/CalculationHistory';

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
  result: number;
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

const MeasurementSheetCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("excavation");
  
  const generateEmptyRow = (): MeasurementRow => ({
    id: Math.random().toString(36).substring(7),
    itemNo: "",
    description: "",
    length: "",
    width: "",
    heightDepth: "",
    nos: "1",
    result: 0,
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
    if (["length", "width", "heightDepth", "nos"].includes(field as string)) {
      if (value !== "" && isNaN(Number(value))) return;
      if (field === "nos" && value !== "" && Number(value) < 0) return;
    }

    setSheets(prev => {
      const newTabState = prev[tab].map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          
          // Auto-calculate result
          const l = parseFloat(updatedRow.length) || 1; // If empty, we can treat it as 1 for multiplication if other values exist, but it's better to treat as 0 if we want strict. Let's do strict but allow empty length to not fail if we only need area vs volume.
          // Wait, actually, if length is empty, should we treat it as 0? Standard M-Sheet: L * W * D * N. If a dimension is empty, it shouldn't nullify if it's not applicable (like area calculation has no depth).
          // Usually: Nos * (L || 1) * (W || 1) * (D || 1) but if all are empty it's 0.
          const lVal = parseFloat(updatedRow.length);
          const wVal = parseFloat(updatedRow.width);
          const dVal = parseFloat(updatedRow.heightDepth);
          const nVal = parseFloat(updatedRow.nos) || 1;

          let res = nVal;
          let hasInputs = false;
          if (!isNaN(lVal)) { res *= lVal; hasInputs = true; }
          if (!isNaN(wVal)) { res *= wVal; hasInputs = true; }
          if (!isNaN(dVal)) { res *= dVal; hasInputs = true; }
          
          updatedRow.result = hasInputs ? res : 0;
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
    return sheets[tab].reduce((sum, row) => sum + (row.result || 0), 0);
  };

  const exportPDF = () => {
    const doc = new jsPDF() as jsPDFCustom;
    doc.setFontSize(18);
    doc.text("Measurement Sheet Report", 14, 22);
    
    let currentY = 30;

    Object.keys(TAB_TITLES).forEach((tabKey) => {
      const t = tabKey as TabType;
      const rows = sheets[t];
      
      // Skip empty tabs (with result 0)
      const subtotal = getSubtotal(t);
      if (subtotal === 0 && rows.length === 1 && !rows[0].description) return;

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
        r.result.toFixed(2)
      ]);
      
      tableData.push(["", "SUBTOTAL", "", "", "", "", subtotal.toFixed(2)]);

      doc.autoTable({
        startY: currentY,
        head: [["Item No", "Description", "Nos", "L", "W", "H/D", "Qty/Area"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [88, 28, 135] }, // Purple-900 
      });

      currentY = doc.lastAutoTable.finalY + 15;
    });

    doc.save("Measurement_Sheet.pdf");
  };

  return (
    <div className="tool-card p-4 md:p-8 flex flex-col w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Section className="w-6 h-6 text-purple-600" />
            Measurement Sheet
          </h2>
          <p className="text-slate-500 mt-1">
            Calculate quantities dynamically for various construction items.
          </p>
        </div>
        <button onClick={exportPDF}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors whitespace-nowrap active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4 no-scrollbar border-b border-slate-200">
        {(Object.keys(TAB_TITLES) as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-[24px] font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? "bg-purple-100  text-purple-700 "
                : "text-slate-600  hover:bg-slate-100"
            }`}
          >
            {TAB_TITLES[tab]}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto w-full rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 text-orange-800">
              <th className="p-3 font-semibold rounded-tl-xl w-24">Item No</th>
              <th className="p-3 font-semibold min-w-[200px]">Description</th>
              <th className="p-3 font-semibold w-20">Nos</th>
              <th className="p-3 font-semibold w-24">L</th>
              <th className="p-3 font-semibold w-24">W</th>
              <th className="p-3 font-semibold w-24">H/D</th>
              <th className="p-3 font-semibold w-32 border-l border-blue-200">Total</th>
              <th className="p-3 font-semibold rounded-tr-xl w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sheets[activeTab].map((row, idx) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 overflow-hidden">
                <td className="p-2">
                  <><label htmlFor="a11y-input-343" className="sr-only">Input</label>
<input id="a11y-input-343"
                    type="text"
                    value={row.itemNo}
                    onChange={(e) => handleRowChange(activeTab, row.id, "itemNo", e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 px-1 text-slate-800 rounded-full"
                    placeholder={`${idx + 1}`}
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-344" className="sr-only">Enter description...</label>
<input id="a11y-input-344"
                    type="text"
                    value={row.description}
                    onChange={(e) => handleRowChange(activeTab, row.id, "description", e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-full px-3 py-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-slate-800"
                    placeholder="Enter description..."
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-345" className="sr-only">Input</label>
<input id="a11y-input-345"
                    type="number" inputMode="decimal"
                    value={row.nos}
                    onChange={(e) => handleRowChange(activeTab, row.id, "nos", e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-full px-2 py-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-center text-slate-800"
                    min="0"
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-346" className="sr-only">Input</label>
<input id="a11y-input-346"
                    type="number" inputMode="decimal"
                    value={row.length}
                    onChange={(e) => handleRowChange(activeTab, row.id, "length", e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-full px-2 py-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-center text-slate-800"
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-347" className="sr-only">Input</label>
<input id="a11y-input-347"
                    type="number" inputMode="decimal"
                    value={row.width}
                    onChange={(e) => handleRowChange(activeTab, row.id, "width", e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-full px-2 py-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-center text-slate-800"
                  /></>
                </td>
                <td className="p-2">
                  <><label htmlFor="a11y-input-348" className="sr-only">Input</label>
<input id="a11y-input-348"
                    type="number" inputMode="decimal"
                    value={row.heightDepth}
                    onChange={(e) => handleRowChange(activeTab, row.id, "heightDepth", e.target.value)}
                    className="w-full bg-transparent border border-slate-200 rounded-full px-2 py-1.5 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-center text-slate-800"
                  /></>
                </td>
                <td className="p-2 border-l border-slate-100 bg-slate-50 border-b-0 font-medium text-slate-900">
                  <div className="w-full text-right px-2">
                    {row.result > 0 ? row.result.toFixed(2) : "-"}
                  </div>
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteRow(activeTab, row.id)}
                    className="text-slate-600 hover:text-red-500 transition-colors p-1 rounded-full"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-blue-200">
              <td colSpan={6} className="p-4 text-right font-bold text-slate-700">
                SUBTOTAL
              </td>
              <td className="p-4 text-right font-bold text-purple-700 bg-purple-50">
                {getSubtotal(activeTab).toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex justify-start">
        <button
          onClick={() => addRow(activeTab)}
          className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-full font-medium transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

    
      <CalculationHistory calculatorId="measurementsheetcalculator_tool" currentInputs={{}} />
</div>
  );
};

export default MeasurementSheetCalculator;
