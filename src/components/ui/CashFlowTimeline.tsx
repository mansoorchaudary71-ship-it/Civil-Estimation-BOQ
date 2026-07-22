import React, { useState } from 'react';
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
  distributions?: number[];
  totalCost?: number;
}

export function CashFlowTimeline({ 
  distributions = [21.9, 19.4, 11.1, 16.9, 17.6, 13.1],
  totalCost = 6850000 
}: CashFlowTimelineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = distributions.map((percentage, index) => {
    const value = (percentage / 100) * totalCost;
    return {
      name: `Month ${index + 1}`,
      percentage,
      value,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 p-4 rounded-xl shadow-xl">
          <p className="font-semibold text-slate-800 mb-1">{label}</p>
          <p className="text-slate-600 text-sm mb-2">
            Distribution: <span className="font-medium text-slate-800">{data.percentage}%</span>
          </p>
          <div className="text-xl font-bold text-blue-600">
            Rs {data.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Construction Cash Flow Timeline</h3>
        <p className="text-sm text-slate-500">6-Month Capital Requirement Distribution</p>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            onMouseMove={(e: any) => {
              if (e && e.activeTooltipIndex !== undefined) {
                setHoverIndex(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              dx={-10}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'transparent' }}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={hoverIndex === index ? '#2563EB' : '#3B82F6'} 
                  className="transition-colors duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
