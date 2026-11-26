import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import { formatNumber } from "../../lib/currencyFormat";

const COLORS = ["rgb(0, 136, 254)", "rgb(0, 196, 159)", "rgb(255, 187, 40)", "rgb(255, 128, 66)", "rgb(139, 92, 246)", "rgb(236, 72, 153)", "rgb(20, 184, 166)", "rgb(244, 63, 94)"];

/**
 * ModuleSummaryCharts — the recharts half of ModuleSummaryDashboard,
 * split out so recharts (~376 kB) is NOT in the eager graph: this file
 * is React.lazy-loaded by ModuleSummaryDashboard and only downloads when
 * a tool page actually renders the summary (i.e. when the tool has
 * numeric inputs/outputs to chart).
 */
export function ModuleSummaryCharts({
  data,
  varianceData,
  previousData,
  currentSumInputs,
  currentSumOutputs,
  renderTrend,
}: {
  data: { inputs: any[]; outputs: any[] };
  varianceData: any[];
  previousData: { sumInputs: number; sumOutputs: number } | null;
  currentSumInputs: number;
  currentSumOutputs: number;
  renderTrend: (current: number, previous: number) => React.ReactNode;
}) {
  return (
      <div className={`grid grid-cols-1 ${varianceData.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
        {data.inputs.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-txt-secondary dark:text-txt-tertiary flex items-center gap-2">
                <Activity className="w-4 h-4 text-txt-tertiary" />
                Input Parameter Distribution
              </h4>
              {previousData && renderTrend(currentSumInputs, previousData.sumInputs)}
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.inputs}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.inputs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatNumber(Number(value), 0), "Value"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={84} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {varianceData.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-txt-secondary dark:text-txt-tertiary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-txt-tertiary" />
                Input Variance vs Last
              </h4>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varianceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(226, 232, 240)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'rgb(100, 116, 139)' }} 
                    dy={10}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'rgb(100, 116, 139)' }}
                    tickFormatter={(val) => {
                      if (Math.abs(val) >= 1000) return `${(val/1000).toFixed(1)}k`;
                      return val.toString();
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: any, name: any) => [formatNumber(Number(value), 0), name === "diff" ? "Difference" : name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="diff" radius={[4, 4, 4, 4]}>
                    {varianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.diff > 0 ? 'rgb(16, 185, 129)' : entry.diff < 0 ? 'rgb(244, 63, 94)' : 'rgb(203, 213, 225)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {data.outputs.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-txt-secondary dark:text-txt-tertiary flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-txt-tertiary" />
                Computed Outputs (Log Scale)
              </h4>
              {previousData && renderTrend(currentSumOutputs, previousData.sumOutputs)}
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.outputs} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(226, 232, 240)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }} 
                    dy={10}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis 
                    scale="log" 
                    domain={['auto', 'auto']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'rgb(100, 116, 139)' }}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val/1000000).toFixed(1)}M`;
                      if (val >= 1000) return `${(val/1000).toFixed(1)}k`;
                      return val.toString();
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value) => [formatNumber(Number(value), 0), "Result"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="value" fill="rgb(59, 130, 246)" radius={[4, 4, 0, 0]}>
                    {data.outputs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
  );
}
