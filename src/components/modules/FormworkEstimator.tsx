import React, { useState, useMemo, useCallback, memo } from "react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useSettings } from "../../context/SettingsContext";
import {
  Hammer,
  Grid,
  Plus,
  Trash2,
  RefreshCw,
  LayoutTemplate,
  SquareStack,
  ChevronDown
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
import { ListInput } from "../ui/ListInput";

interface FormworkElement {
  id: string;
  name: string;
  type: "column" | "beam" | "slab";
  length: string;
  width: string;
  height: string;
  count: string;
}

const MemoizedFormworkRow = memo(({ 
  el, 
  index, 
  updateElement, 
  removeElement, 
  unitStr 
}: { 
  el: FormworkElement, 
  index: number, 
  updateElement: (index: number, updates: Partial<FormworkElement>) => void, 
  removeElement: (index: number) => void,
  unitStr: string 
}) => {
  return (
    <div className="w-full group bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-amber-200 p-5 rounded-[2rem] transition-all shadow-sm hover:shadow-md relative overflow-hidden flex flex-col md:flex-row gap-4 md:items-center">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-300 group-hover:bg-amber-400 transition-colors" />
      <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 items-end pl-0 md:pl-2">
        <div className="col-span-2 md:col-span-2 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-slate-700 mb-1 truncate">
            Type & Name
          </label>
          <div className="flex gap-2">
            <select
              className="bg-gray-100 border border-slate-200 rounded-[24px] px-3 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] text-base font-normal overflow-hidden truncate"
              value={el.type}
              onChange={(e) => updateElement(index, { type: e.target.value as any })}
            >
              <option value="column">Col</option>
              <option value="beam">Beam</option>
              <option value="slab">Slab</option>
            </select>
            <><label htmlFor="a11y-input-231" className="sr-only">Input</label>
<input id="a11y-input-231" type="text"
              className="bg-white border border-gray-200 rounded-full px-3 py-2.5 text-slate-800 w-full outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
              value={el.name}
              onChange={(e) => updateElement(index, { name: e.target.value })}
            /></>
          </div>
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-slate-700 mb-1 truncate">
            L ({unitStr})
          </label>
          <><label htmlFor="a11y-input-232" className="sr-only">Input</label>
<input id="a11y-input-232" type="number" inputMode="decimal" min="0" step="0.1"
            className="bg-white border border-gray-200 rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.length}
            onChange={(e) => updateElement(index, { length: e.target.value })}
          /></>
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-slate-700 mb-1 truncate">
            W ({unitStr})
          </label>
          <><label htmlFor="a11y-input-233" className="sr-only">Input</label>
<input id="a11y-input-233" type="number" inputMode="decimal" min="0" step="0.1"
            className="bg-white border border-gray-200 rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.width}
            onChange={(e) => updateElement(index, { width: e.target.value })}
          /></>
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-slate-700 mb-1 truncate">
            H/D ({unitStr})
          </label>
          <><label htmlFor="a11y-input-234" className="sr-only">Input</label>
<input id="a11y-input-234" type="number" inputMode="decimal" min="0" step="0.1"
            className="bg-white border border-gray-200 rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.height}
            onChange={(e) => updateElement(index, { height: e.target.value })}
          /></>
        </div>
        <div className="col-span-1 md:col-span-1 space-y-1">
          <label className="uppercase tracking-widest block text-sm font-medium text-slate-700 mb-1 truncate">
            Qty
          </label>
          <><label htmlFor="a11y-input-235" className="sr-only">Input</label>
<input id="a11y-input-235" type="number" inputMode="decimal" min="0"
            className="bg-white border border-gray-200 rounded-full px-3 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] text-base font-normal truncate"
            value={el.count}
            onChange={(e) => updateElement(index, { count: e.target.value })}
          /></>
        </div>
      </div>
      <button
        aria-label="Delete"
        onClick={() => removeElement(index)}
        className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-full transition-colors ml-auto md:ml-0 self-end md:self-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
});

export default function FormworkEstimator() {
  const { settings } = useSettings();
  const isMetric = settings.measurement === "SI";
  const unitStr = isMetric ? "m" : "ft";
  const areaUnitStr = isMetric ? "m²" : "sq.ft";

  const [elements, setElements] = useState<FormworkElement[]>([
    {
      id: "1",
      name: "Column C1",
      type: "column",
      length: isMetric ? "0.3" : "1",
      width: isMetric ? "0.4" : "1.3",
      height: isMetric ? "3.0" : "10.0",
      count: "10",
    },
    {
      id: "2",
      name: "Slab Roof",
      type: "slab",
      length: isMetric ? "12.0" : "40",
      width: isMetric ? "10.0" : "33",
      height: isMetric ? "0.15" : "0.5",
      count: "1",
    },
  ]);
  const [repetitionFactor, setRepetitionFactor] = useState<number>(4);
  const [wastagePct, setWastagePct] = useState<number>(5);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleAddElement = useCallback(() => {
    setElements((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: "New Item",
        type: "beam",
        length: isMetric ? "4.0" : "13.0",
        width: isMetric ? "0.3" : "1.0",
        height: isMetric ? "0.45" : "1.5",
        count: "1",
      },
    ]);
  }, [isMetric]);

  const renderItem = useCallback((
    el: FormworkElement, 
    index: number, 
    updateElement: (idx: number, updates: Partial<FormworkElement>) => void, 
    removeElement: (idx: number) => void
  ) => {
    return (
      <MemoizedFormworkRow 
        key={el.id} 
        el={el} 
        index={index} 
        updateElement={updateElement} 
        removeElement={removeElement} 
        unitStr={unitStr} 
      />
    );
  }, [unitStr]);
  const removeElement = (id: string) => {
    setElements(elements.filter((e) => e.id !== id));
  };
  const updateElement = (
    id: string,
    field: keyof FormworkElement,
    value: string,
  ) => {
    if (["length", "width", "height", "count"].includes(field)) {
      if (value !== "" && Number(value) < 0) {
        value = Math.abs(Number(value)).toString();
      }
    }
    setElements(
      elements.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };
  const results = useMemo(() => {
    let totalArea = 0;
    let colArea = 0;
    let beamArea = 0;
    let slabArea = 0;
    elements.forEach((item) => {
      const l = parseFloat(item.length) || 0;
      const w = parseFloat(item.width) || 0;
      const h = parseFloat(item.height) || 0;
      const c = parseFloat(item.count) || 0;
      let area = 0;
      if (item.type === "column") {
        area = (2 * w * h + 2 * l * h) * c;
        colArea += area;
      } else if (item.type === "beam") {
        area = (l * w + 2 * l * h) * c;
        beamArea += area;
      } else if (item.type === "slab") {
        area = (l * w + 2 * (l + w) * h) * c;
        slabArea += area;
      }
      totalArea += area;
    });

    const totalAreaSqm = isMetric ? totalArea : totalArea / 10.7639;
    const totalAreaSqft = isMetric ? totalArea * 10.7639 : totalArea;

    const effectiveAreaSqft =
      (totalAreaSqft / repetitionFactor) * (1 + wastagePct / 100);
    const effectiveAreaSqm =
      (totalAreaSqm / repetitionFactor) * (1 + wastagePct / 100);

    const plywoodSheets = Math.ceil(effectiveAreaSqft / 32);
    const battensRft = Math.ceil(effectiveAreaSqft * 2.5);
    const steelProps = Math.ceil(effectiveAreaSqm * 1.5);

    return {
      totalArea,
      totalAreaSqm,
      totalAreaSqft,
      effectiveAreaSqft,
      plywoodSheets,
      battensRft,
      steelProps,
      breakdown: { colArea, beamArea, slabArea },
    };
  }, [elements, repetitionFactor, wastagePct, isMetric]);
  const breakdownData = useMemo(() => {
    return [
      { name: "Columns", value: results.breakdown.colArea, color: "#f59e0b" },
      {
        name: "Slabs",
        value: results.breakdown.slabArea,
        color: "#f43f5e",
      },
      {
        name: "Beams",
        value: results.breakdown.beamArea,
        color: "#6366f1",
      },
    ].filter((d: any) => d.value > 0);
  }, [results]);
  return (
    <div className="w-full h-full bg-transparent text-slate-900 font-sans p-6 md:p-8">
      {" "}
      <div className="w-full md:max-w-6xl md:mx-auto space-y-8 pb-24 px-4 md:px-0">
        {" "}
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {" "}
          {/* Elements Config Section */}{" "}
          <section className="lg:col-span-8 space-y-6">
            {" "}
            <div className="w-full bg-white/90 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(15,23,42,0.06)] border border-gray-100 backdrop-blur-xl overflow-hidden">
              {" "}
              <div className="flex items-center justify-between mb-8">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="p-3 bg-amber-50 rounded-[24px] overflow-hidden">
                    {" "}
                    <Grid className="w-6 h-6 text-amber-600" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight mb-4">
                      Shuttering Elements
                    </h2>{" "}
                    <p className="text-base font-normal text-slate-600 leading-relaxed">
                      Add columns, beams, or slabs
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <ListInput
                items={elements}
                onChange={setElements}
                onAdd={handleAddElement}
                renderItem={renderItem}
                addLabel="Add Item"
                emptyMessage="No formwork elements added."
              />
            </div>{" "}
            
            <div className="w-full bg-white/90 p-4 sm:p-6 md:p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(15,23,42,0.06)] border border-gray-100 backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex items-center justify-between gap-3 relative z-10 text-left focus:outline-none min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-medium text-slate-800">
                    Settings & Repetition
                  </h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSettingsOpen && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-6 sm:items-center animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="flex-1">
                    <p className="text-base font-normal text-slate-600 leading-relaxed">
                      How many times will the shuttering be reused? This drastically
                      reduces material required.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 4, 6].map((factor) => (
                      <button
                        key={factor}
                        onClick={() => setRepetitionFactor(factor)}
                        className={`w-12 h-12 min-h-[44px] min-w-[44px] rounded-[24px] font-semibold tabular-nums tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${repetitionFactor === factor ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110" : "bg-gray-100 text-slate-700 hover:bg-gray-200"}`}
                      >
                        x{factor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>{" "}
          </section>{" "}
          {/* Results Summary Interface */}{" "}
          <section className="lg:col-span-4 space-y-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <MaterialSummary
              title="Material Summary"
              totalLabel="Total Formwork Area"
              totalValue={results.totalArea.toFixed(1)}
              totalUnit={areaUnitStr}
              subtitle={isMetric ? `(${results.totalAreaSqft.toFixed(1)} sq.ft)` : `(${results.totalAreaSqm.toFixed(1)} m²)`}
              icon={<SquareStack className="w-5 h-5 flex-shrink-0" />}
            >
              <ResultCard
                title="Plywood Sheets"
                value={results.plywoodSheets}
                badge="4'x8' standard"
                variant="warning"
              />
              <div className="grid grid-cols-2 gap-4">
                <ResultCard
                  title="Wooden Battens"
                  value={results.battensRft}
                  unit="Rft"
                  variant="success"
                />
                <ResultCard
                  title="Steel Props / Scaffold"
                  value={results.steelProps}
                  unit="Pcs"
                  variant="primary"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/50">
                  <div className="mb-4 text-sm sm:text-base font-medium tracking-tight text-slate-500 uppercase tracking-[0.15em]">
                    Area Breakdown
                  </div>{" "}
                  <div className="h-48 w-full relative">
                    {" "}
                    <ResponsiveContainer width="100%" height="100%">
                      {" "}
                      <PieChart>
                        {" "}
                        <Pie
                          data={breakdownData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {" "}
                          {breakdownData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="transparent"
                            />
                          ))}{" "}
                        </Pie>{" "}
                        <Tooltip
                          formatter={(value: any) =>
                            `${value.toFixed(1)} ${areaUnitStr}`
                          }
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            borderColor: "#374151",
                            color: "#f3f4f6",
                            borderRadius: "12px",
                          }}
                          itemStyle={{ color: "#f3f4f6" }}
                        />{" "}
                      </PieChart>{" "}
                    </ResponsiveContainer>{" "}
                  </div>{" "}
                  <div className="flex justify-center gap-4 mt-2 text-base font-medium uppercase tracking-wider flex-wrap">
                    {" "}
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{" "}
                      Columns
                    </span>{" "}
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />{" "}
                      Slabs
                    </span>{" "}
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />{" "}
                      Beams
                    </span>{" "}
                  </div>
                </div>
            </MaterialSummary>
          </section>{" "}
        </div>{" "}
      </div>{" "}
      <CalculationHistory
        calculatorId="formwork_estimator_v1"
        estimationName="Formwork Calculation"
        currentInputs={{
          elements, repetitionFactor, wastagePct
        }}
        currentResults={{
          totalArea: results.totalArea.toFixed(2),
          plywoodSheets: results.plywoodSheets,
          battensRft: results.battensRft,
          steelProps: results.steelProps
        }}
        summaryGeneration={(inputs, res) => `Area: ${res.totalArea}${areaUnitStr} | Plywood: ${res.plywoodSheets} sheets`}
        onRestore={(inputs) => {
          if (inputs.elements && Array.isArray(inputs.elements)) setElements(inputs.elements);
          if (inputs.repetitionFactor !== undefined) setRepetitionFactor(inputs.repetitionFactor);
          if (inputs.wastagePct !== undefined) setWastagePct(inputs.wastagePct);
        }}
      />
    </div>
  );
}
