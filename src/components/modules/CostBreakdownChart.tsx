import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
}

interface CostBreakdownChartProps {
  data: ChartDataItem[];
  formatCurrency: (value: number, includeSymbol?: boolean) => string;
}

const COLORS = ["#3b82f6", "#f97316", "#8b5cf6", "#10b981", "#ef4444"];

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ data, formatCurrency }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip 
          formatter={(value: any) => formatCurrency(value, false)}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            backgroundColor: 'var(--tw-colors-white, #fff)',
            color: 'var(--tw-colors-slate-900, #0f172a)'
          }}
          itemStyle={{ color: 'var(--tw-colors-slate-700, #334155)', fontWeight: 500 }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          content={(props) => {
            const { payload } = props;
            return (
              <ul className="flex flex-wrap justify-center gap-4 mt-6">
                {payload?.map((entry, index) => (
                  <li key={`item-${index}`} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-800 dark:text-slate-200 font-medium text-sm">{entry.value}</span>
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
