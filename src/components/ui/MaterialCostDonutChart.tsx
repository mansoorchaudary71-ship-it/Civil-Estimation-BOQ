import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector
} from 'recharts';

export interface MaterialCostData {
  name: string;
  value: number;
  percentage: number;
}

interface MaterialCostDonutChartProps {
  data?: MaterialCostData[];
}

const CIVIL_COLORS = [
  '#64748B', // Slate (Cement)
  '#D4A373', // Sand/Earth (Sand)
  '#9CA3AF', // Gray (Aggregate)
  '#374151', // Dark Gray (Steel)
  '#3B82F6', // Blue (Fittings/Plumbing)
  '#10B981', // Emerald (Finishers/Glass)
];

const DEFAULT_DATA: MaterialCostData[] = [
  { name: 'Cement', value: 1027500, percentage: 15.0 },
  { name: 'Sand', value: 342500, percentage: 5.0 },
  { name: 'Aggregate', value: 685000, percentage: 10.0 },
  { name: 'Steel', value: 1712500, percentage: 25.0 },
  { name: 'Finishers', value: 2055000, percentage: 30.0 },
  { name: 'Fittings', value: 1027500, percentage: 15.0 }
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

export function MaterialCostDonutChart({ data = DEFAULT_DATA }: MaterialCostDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalCost = data.reduce((acc, curr) => acc + curr.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-3 rounded-xl shadow-lg">
          <p className="font-semibold text-slate-800 mb-1">{pData.name}</p>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">
              Cost: <span className="font-medium text-slate-900">Rs {pData.value.toLocaleString()}</span>
            </span>
            <span className="text-sm text-slate-600">
              Share: <span className="font-medium text-blue-600">{pData.percentage.toFixed(1)}%</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8 w-full">
      <div className="relative w-full md:w-1/2 h-64 md:h-80 flex justify-center items-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
           <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Cost</span>
           <span className="text-2xl lg:text-3xl font-bold text-slate-900">
             Rs {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
           </span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="none"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CIVIL_COLORS[index % CIVIL_COLORS.length]} 
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                  style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.4 }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Material Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((item, index) => {
            const color = CIVIL_COLORS[index % CIVIL_COLORS.length];
            const isActive = activeIndex === index;
            
            return (
              <div 
                key={item.name}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-slate-50/80 border-slate-200 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-slate-50/50'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
