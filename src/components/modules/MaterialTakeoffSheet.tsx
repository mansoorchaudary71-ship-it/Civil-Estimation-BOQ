import React, { useState, useEffect } from "react";
import { Calculator, ClipboardCopy, Building, Layers, Settings, ChevronRight } from "lucide-react";
import { CalculationHistory } from '../ui/CalculationHistory';

type QualityType = "standard" | "premium" | "luxury";

interface TakeoffRow {
  id: string;
  category: string;
  name: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

const THUMB_RULES = {
  rccCement: 0.25, // bags per sqft
  pccCement: 0.05, // bags per sqft
  plasterCement: 0.10, // bags per sqft
  rccSand: 0.50, // cft per sqft
  pccSand: 0.15, // cft per sqft
  plasterSand: 0.50, // cft per sqft
  rccAggregate: 1.00, // cft per sqft
  pccAggregate: 0.30, // cft per sqft
  steel: 3.5, // kg per sqft
  bricks: 10, // nos per sqft
  floorTiles: 1.1, // sqft
  wallTiles: 0.4, // sqft
  intPaint: 0.12, // liters per sqft
  extPaint: 0.05, // liters per sqft
};

const MaterialTakeoffSheet: React.FC = () => {
  const [area, setArea] = useState<number>(1000);
  const [floors, setFloors] = useState<number>(1);
  const [quality, setQuality] = useState<QualityType>("standard");

  const [items, setItems] = useState<TakeoffRow[]>([
    { id: "cm_rcc", category: "Cement", name: "Cement (RCC Structure)", unit: "Bags", quantity: 0, rate: 1250, amount: 0 },
    { id: "cm_pcc", category: "Cement", name: "Cement (PCC Works)", unit: "Bags", quantity: 0, rate: 1250, amount: 0 },
    { id: "cm_pls", category: "Cement", name: "Cement (Plaster & Masonry)", unit: "Bags", quantity: 0, rate: 1250, amount: 0 },
    { id: "sn_rcc", category: "Sand", name: "Sand (RCC Structure)", unit: "Cft", quantity: 0, rate: 45, amount: 0 },
    { id: "sn_pcc", category: "Sand", name: "Sand (PCC Works)", unit: "Cft", quantity: 0, rate: 45, amount: 0 },
    { id: "sn_pls", category: "Sand", name: "Sand (Plaster & Masonry)", unit: "Cft", quantity: 0, rate: 45, amount: 0 },
    { id: "ag_rcc", category: "Aggregate", name: "Aggregate/Crush (RCC)", unit: "Cft", quantity: 0, rate: 65, amount: 0 },
    { id: "ag_pcc", category: "Aggregate", name: "Aggregate/Crush (PCC)", unit: "Cft", quantity: 0, rate: 65, amount: 0 },
    { id: "br_blk", category: "Masonry", name: "Bricks / Blocks", unit: "Nos", quantity: 0, rate: 14, amount: 0 },
    { id: "st_reb", category: "Steel", name: "Steel Reinforcement", unit: "Kg", quantity: 0, rate: 260, amount: 0 },
    { id: "tl_flr", category: "Finishes", name: "Floor Tiles", unit: "Sq.ft", quantity: 0, rate: 120, amount: 0 },
    { id: "tl_wal", category: "Finishes", name: "Wall Tiles", unit: "Sq.ft", quantity: 0, rate: 100, amount: 0 },
    { id: "pt_int", category: "Finishes", name: "Interior Paint", unit: "Liters", quantity: 0, rate: 650, amount: 0 },
    { id: "pt_ext", category: "Finishes", name: "Exterior Paint", unit: "Liters", quantity: 0, rate: 550, amount: 0 },
  ]);

  const [grandTotal, setGrandTotal] = useState<number>(0);

  useEffect(() => {
    calculateTakeoff();
  }, [area, floors, quality]);

  const calculateTakeoff = () => {
    const totalArea = area * floors;
    
    // Quality multipliers 
    const finishMult = quality === "premium" ? 1.2 : quality === "luxury" ? 1.5 : 1.0;
    const structureMult = quality === "luxury" ? 1.1 : 1.0; // slightly beefier structure for luxury maybe

    setItems(prevItems => {
      const updated = prevItems.map(item => {
        let qty = 0;
        switch (item.id) {
          case "cm_rcc": qty = totalArea * THUMB_RULES.rccCement * structureMult; break;
          case "cm_pcc": qty = totalArea * THUMB_RULES.pccCement * structureMult; break;
          case "cm_pls": qty = totalArea * THUMB_RULES.plasterCement * finishMult; break;
          case "sn_rcc": qty = totalArea * THUMB_RULES.rccSand * structureMult; break;
          case "sn_pcc": qty = totalArea * THUMB_RULES.pccSand * structureMult; break;
          case "sn_pls": qty = totalArea * THUMB_RULES.plasterSand * finishMult; break;
          case "ag_rcc": qty = totalArea * THUMB_RULES.rccAggregate * structureMult; break;
          case "ag_pcc": qty = totalArea * THUMB_RULES.pccAggregate * structureMult; break;
          case "st_reb": qty = totalArea * THUMB_RULES.steel * structureMult; break;
          case "br_blk": qty = totalArea * THUMB_RULES.bricks; break;
          case "tl_flr": qty = totalArea * THUMB_RULES.floorTiles * finishMult; break;
          case "tl_wal": qty = totalArea * THUMB_RULES.wallTiles * finishMult; break;
          case "pt_int": qty = totalArea * THUMB_RULES.intPaint * finishMult; break;
          case "pt_ext": qty = totalArea * THUMB_RULES.extPaint * finishMult; break;
        }
        
        // Round appropriately
        if (item.unit === "Nos") qty = Math.ceil(qty);
        else qty = parseFloat(qty.toFixed(2));

        return {
          ...item,
          quantity: qty,
          amount: qty * item.rate
        };
      });

      const total = updated.reduce((sum, item) => sum + item.amount, 0);
      setGrandTotal(total);

      return updated;
    });
  };

  const handleRateChange = (id: string, newRate: string) => {
    const rateVal = parseFloat(newRate) || 0;
    setItems(prevItems => {
      const updated = prevItems.map(item => {
        if (item.id === id) {
          return {
            ...item,
            rate: rateVal,
            amount: item.quantity * rateVal
          };
        }
        return item;
      });
      setGrandTotal(updated.reduce((sum, item) => sum + item.amount, 0));
      return updated;
    });
  };

  const copyToBOQ = () => {
    // In a real app, this would use a global state or export to a CSV/clipboard that the BOQ Generator can read.
    // For now we'll simulate it with a clipboard copy of tab-separated values.
    const textData = items.map(i => `${i.name}\t${i.quantity}\t${i.unit}\t${i.rate}\t${i.amount}`).join("\n");
    const header = `Material Name\tQuantity\tUnit\tRate\tAmount\n`;
    navigator.clipboard.writeText(header + textData);
    alert("Takeoff data copied to clipboard! You can paste this directly into Excel or the BOQ Generator.");
  };

  return (
    <div className="tool-card p-4 md:p-8 flex flex-col w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-500" />
            Material Takeoff Sheet
          </h2>
          <p className="text-slate-500 mt-1">
            Auto-calculate building material quantities based on area, floors, and finishes.
          </p>
        </div>
        <button onClick={copyToBOQ}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors whitespace-nowrap active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
        >
          <ClipboardCopy className="w-4 h-4" />
          Copy to BOQ
        </button>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-purple-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 p-4 sm:p-6 rounded-[24px] border border-purple-100 overflow-hidden">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Built-Up Area (per floor)
          </label>
          <div className="relative">
            <><label htmlFor="a11y-input-340" className="sr-only">Input</label>
<input id="a11y-input-340"
              type="number" inputMode="decimal"
              value={area}
              onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none pr-12"
            /></>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">sq ft</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Number of Floors
          </label>
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <><label htmlFor="a11y-input-341" className="sr-only">Input</label>
<input id="a11y-input-341"
              type="number" inputMode="decimal"
              value={floors}
              onChange={(e) => setFloors(parseFloat(e.target.value) || 1)}
              className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none pl-10"
              min="1"
            /></>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Finish Quality
          </label>
          <div className="relative">
            <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as QualityType)}
              className="w-full bg-white border border-slate-300 rounded-[24px] px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-purple-500 outline-none pl-10 appearance-none overflow-hidden"
            >
              <option value="standard">Standard (Economy)</option>
              <option value="premium">Premium (Mid-Range)</option>
              <option value="luxury">Luxury (High-End)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Table */}
      <div className="overflow-x-auto w-full border border-slate-200 rounded-[24px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-blue-50 text-orange-800">
              <th className="p-4 font-semibold w-1/3">Material Name</th>
              <th className="p-4 font-semibold w-1/6">Unit</th>
              <th className="p-4 font-semibold w-1/6">Quantity</th>
              <th className="p-4 font-semibold w-1/6">Rate (Edit)</th>
              <th className="p-4 font-semibold w-1/6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 transition-colors overflow-hidden">
                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                <td className="p-4 text-slate-600">{item.unit}</td>
                <td className="p-4 font-semibold text-purple-700">{item.quantity.toLocaleString()}</td>
                <td className="p-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{/* currency symbol placeholder if needed */}</span>
                    <><label htmlFor="a11y-input-342" className="sr-only">Input</label>
<input id="a11y-input-342"
                      type="number" inputMode="decimal"
                      value={item.rate}
                      onChange={(e) => handleRateChange(item.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-full px-2 py-1.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    /></>
                  </div>
                </td>
                <td className="p-4 text-right font-semibold text-slate-800">
                  {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 border-t border-slate-300 overflow-hidden">
              <td colSpan={4} className="p-5 text-right font-bold text-slate-800 text-lg">
                Grand Total Material Cost
              </td>
              <td className="p-5 text-right font-bold text-blue-600 text-xl">
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    
      <CalculationHistory calculatorId="materialtakeoffsheet_tool" currentInputs={{}} />
</div>
  );
};

export default MaterialTakeoffSheet;
