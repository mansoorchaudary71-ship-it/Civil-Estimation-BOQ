import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VisualizerProps {
  title: string;
}

export function FormulaVisualizer({ title }: VisualizerProps) {
  const [sliderValue, setSliderValue] = useState(50);

  // Determine graph relationship based on title keywords
  const type = useMemo(() => {
    const t = title.toLowerCase();
    if (
      t.includes("volume") ||
      t.includes("earthwork") ||
      t.includes("concrete") ||
      t.includes("tank")
    )
      return "Cubic";
    if (
      t.includes("area") ||
      t.includes("slab") ||
      t.includes("flooring") ||
      t.includes("paint") ||
      t.includes("plaster")
    )
      return "Quadratic";
    if (t.includes("stair") || t.includes("spacing")) return "Inverse";
    return "Linear";
  }, [title]);

  const xLabel =
    type === "Cubic"
      ? "Dimension (Depth/Length)"
      : type === "Quadratic"
        ? "Span/Length"
        : type === "Inverse"
          ? "Spacing/Riser"
          : "Primary Input";
  const yLabel = type === "Inverse" ? "Count / Quantity" : "Result Output";

  const chartData = useMemo(() => {
    const points = [];
    for (let i = 1; i <= 100; i += 5) {
      // Scale multiplier based on slider
      const multiplier = sliderValue / 50;
      let y = 0;

      if (type === "Cubic") y = i * i * i * 0.01 * multiplier;
      else if (type === "Quadratic") y = i * i * multiplier;
      else if (type === "Inverse") y = i > 0 ? (10000 / i) * multiplier : 0;
      else y = i * 10 * multiplier; // Linear

      points.push({ x: i, y });
    }
    return points;
  }, [type, sliderValue]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Interactive Relationship
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing {type.toLowerCase()} growth pattern. Use slider to apply
            multiplier.
          </p>
        </div>
        <div className="flex flex-col items-start w-full sm:w-1/3">
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">
            Variable Multiplier: {sliderValue}%
          </label>
          <><label htmlFor="a11y-input-583" className="sr-only">Input</label>
<input id="a11y-input-583"
            type="range"
            min="10"
            max="150"
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full accent-indigo-500"
          /></>
        </div>
      </div>

      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#334155"
              opacity={0.2}
            />
            <XAxis
              dataKey="x"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#64748b"
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              stroke="#64748b"
              tickFormatter={(v) =>
                v >= 1000 ? (v / 1000).toFixed(1) + "k" : Math.round(v).toString()
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#818cf8", fontWeight: "bold" }}
              labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
              formatter={(value: any) => [
                Math.round(value).toLocaleString(),
                yLabel,
              ]}
              labelFormatter={(label) => `${xLabel}: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                fill: "#818cf8",
                stroke: "#1e293b",
                strokeWidth: 2,
              }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 mt-2">
        <span>{xLabel} (Low)</span>
        <span>{xLabel} (High)</span>
      </div>
    </div>
  );
}
