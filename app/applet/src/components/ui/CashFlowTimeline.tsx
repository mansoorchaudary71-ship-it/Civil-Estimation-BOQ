import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CashFlowTimelineProps {
  totalCost: number;
  monthlyPercentages?: number[];
}

const DEFAULT_PERCENTAGES = [21.9, 19.4, 11.1, 16.9, 17.6, 13.1];

export function CashFlowTimeline({ 
  totalCost, 
  monthlyPercentages = DEFAULT_PERCENTAGES 
}: CashFlowTimelineProps) {
  
  const data = monthlyPercentages.map((percent, index) => {
    const amount = (totalCost * percent) / 100;
    return {
      name: `Month ${index + 1}`,
      percent: percent,
      amount: amount
    };
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `Rs ${(value / 1000).toFixed(0)}K`;
    return `Rs ${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl shadow-slate-200/20 dark:shadow-none">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">Cash Required:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                Rs {data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">Distribution:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data.percent}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Construction Cash Flow Timeline</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">6-Month financial requirement projection</p>
      </div>
      
      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Bar 
              dataKey="amount" 
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={\`cell-\${index}\`} 
                  className="fill-indigo-500 hover:fill-indigo-600 dark:fill-indigo-500 dark:hover:fill-indigo-400 transition-colors duration-300 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
