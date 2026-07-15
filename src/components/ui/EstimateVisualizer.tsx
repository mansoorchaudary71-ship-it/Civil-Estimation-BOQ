import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ChartProps {
  data: { name: string; value: number; fill: string; percentage?: number }[];
  type: 'pie' | 'bar';
  title: string;
  valueFormatter?: (value: number) => string;
}

export function StyledChart({ data, type, title, valueFormatter }: ChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const enrichedData = data.map(item => ({
    ...item,
    percentage: Math.round((item.value / total) * 100)
  }));

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-3 transform transition-all overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.fill }} />
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{data.name}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
              {valueFormatter ? valueFormatter(data.value) : data.value}
            </span>
            {data.percentage !== undefined && (
              <span className="text-indigo-500 dark:text-indigo-400 text-base font-medium bg-indigo-50 dark:bg-indigo-500/10 inline-block px-1.5 py-0.5 rounded-md w-fit">
                {data.percentage}% of total
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-800/30 rounded-[24px] px-4 py-3 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden backdrop-blur-sm transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
      
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      
      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center justify-between relative z-10">
        {title}
        {type === 'pie' && <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">Breakdown</span>}
        {type === 'bar' && <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">Comparison</span>}
      </h4>

      <div className="h-56 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={enrichedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                cornerRadius={6}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {enrichedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    className="transition-all duration-300 outline-none"
                    style={{
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center center',
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.6
                    }}
                  />
                ))}
              </Pie>
              <RechartsTooltip content={renderTooltip} cursor={false} />
            </PieChart>
          ) : (
            <BarChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-5 text-slate-400" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }}
                tickFormatter={(value) => {
                  if (value >= 1000) return (value / 1000) + 'k';
                  return value;
                }}
              />
              <RechartsTooltip content={renderTooltip} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 6, 6]}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {enrichedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    className="transition-all duration-300"
                    style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.6 }}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {type === 'pie' && (
        <div className="flex flex-wrap justify-center gap-3 mt-6 relative z-10">
          {enrichedData.map((entry, idx) => (
            <div 
              key={entry.name} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-bg-card shadow-sm transition-all duration-200 cursor-default
                ${activeIndex === idx ? 'ring-2 ring-offset-1 dark:ring-offset-slate-900 shadow-md scale-105' : 'opacity-80 hover:opacity-100 hover:scale-105'}
              `}
              style={{ '--tw-ring-color': entry.fill } as React.CSSProperties}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-base font-medium dark:text-slate-200">{entry.name}</span>
              <span className="text-[10px] font-black opacity-60 text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                {entry.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
