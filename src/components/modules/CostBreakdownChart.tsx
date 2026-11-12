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

const COLORS = ["#F2A413", "#1F1D1A", "#B07006", "#6B6862", "#0F766E"];

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
            color: 'var(--tw-colors-slate-900, #1F1D1A)'
          }}
          itemStyle={{ color: 'var(--tw-colors-slate-700, #6B6862)', fontWeight: 500 }}
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
                    <span className="text-txt-primary dark:text-txt-primary font-medium text-sm">{entry.value}</span>
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
