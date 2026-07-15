import React, { useState } from 'react';
import { Ruler, Layout, RefreshCw } from 'lucide-react';
import { MaterialSummary } from '../ui/MaterialSummary';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function RoomAreaCalculator() {
  const [length, setLength] = useState<number>(4);
  const [width, setWidth] = useState<number>(3);
  const [wallThickness, setWallThickness] = useState<number>(0.2); // 200mm wall
  const [roomType, setRoomType] = useState<string>('bedroom');

  const minRequirements: Record<string, number> = {
    bedroom: 9.5,
    living: 15.0,
    kitchen: 5.0,
    bathroom: 1.8,
    dining: 7.5
  };

  const carpetArea = length * width; // inside clear dimensions
  const grossLength = length + (2 * wallThickness);
  const grossWidth = width + (2 * wallThickness);
  const builtUpArea = grossLength * grossWidth;

  const reqArea = minRequirements[roomType] || 0;
  const isCompliant = carpetArea >= reqArea;

  const results = [
    {
      division: "Area Measurements",
      description: `Carpet Area (Net)`,
      unit: "m²",
      quantity: carpetArea,
      rate: 0
    },
    {
      division: "Area Measurements",
      description: `Built-up Area (Gross)`,
      unit: "m²",
      quantity: builtUpArea,
      rate: 0
    }
  ];

  return (
    <div className="w-full md:max-w-4xl md:mx-auto space-y-6 px-4 md:px-0">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm overflow-hidden">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Layout className="w-6 h-6 text-indigo-500" />
          Room Area Calculator (NBC/RERA)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500"
            >
              <option value="bedroom">Bedroom</option>
              <option value="living">Living Room</option>
              <option value="kitchen">Kitchen</option>
              <option value="bathroom">Bathroom</option>
              <option value="dining">Dining Room</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Wall Thickness (m)</label>
            <><label htmlFor="a11y-input-460" className="sr-only">Input</label>
<input id="a11y-input-460"
              type="number" inputMode="decimal"
              value={wallThickness || ''}
              onChange={(e) => setWallThickness(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500"
            /></>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Internal Length (m)</label>
            <><label htmlFor="a11y-input-461" className="sr-only">Input</label>
<input id="a11y-input-461"
              type="number" inputMode="decimal"
              value={length || ''}
              onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500"
            /></>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Internal Width (m)</label>
            <><label htmlFor="a11y-input-462" className="sr-only">Input</label>
<input id="a11y-input-462"
              type="number" inputMode="decimal"
              value={width || ''}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500"
            /></>
          </div>
        </div>

        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-4 \${isCompliant ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'}`}>
          <div className="flex-1">
             <p className="font-bold mb-1 text-slate-800 dark:text-slate-900 dark:text-white">NBC 2016 Compliance Check</p>
             <p className="text-sm text-slate-600 dark:text-slate-400">
               Required min. area: <strong>{reqArea} m²</strong>. Provided: <strong>{carpetArea.toFixed(2)} m²</strong>
             </p>
          </div>
          <div className="font-bold tabular-nums tracking-tight text-xl">
             {isCompliant ? <span className="text-emerald-500">PASS</span> : <span className="text-rose-500">FAIL</span>}
          </div>
        </div>

        <MaterialSummary
            items={results}
            onUpdateRate={() => {}}
            showRates={false}
            totalValue={0}
        />
      </div>
    
      <CalculationHistory calculatorId="roomareacalculator_tool" currentInputs={{}} />
</div>
  );
}
