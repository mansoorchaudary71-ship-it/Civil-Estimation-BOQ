import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMarketRates } from '../../context/MarketRatesContext';

export function MarketRatesTrendChart() {
  const { region, setRegion, trendData } = useMarketRates();

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-4 sm:p-4 sm:p-4 sm:p-8 w-full mt-8 overflow-hidden">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">6-Month Price Trends</h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Historical fluctuations for key materials</p>
        </div>
        <div>
          <select 
            className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/20"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="PK">Pakistan (PKR)</option>
            <option value="IN">India (INR)</option>
            <option value="UAE">UAE (AED)</option>
          </select>
        </div>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
            />
            
            <Line type="monotone" dataKey="cement" name="Cement (Bag)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="steel" name="Steel (kg)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="bricks" name="Bricks" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="sand" name="Sand (cft)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="crush" name="Crush (cft)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
