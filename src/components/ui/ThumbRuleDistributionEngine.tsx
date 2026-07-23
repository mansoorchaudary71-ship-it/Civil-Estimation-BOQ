import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie, Cell as PieCell } from 'recharts';

interface ThumbRuleDistributionEngineProps {
  totalCost: number;
}

export default function ThumbRuleDistributionEngine({ totalCost }: ThumbRuleDistributionEngineProps) {
  const [activeTab, setActiveTab] = useState<'cashflow' | 'material'>('cashflow');

  const cashflowData = [
    { month: 'Month 1', percentage: 21.9, amount: totalCost * 0.219 },
    { month: 'Month 2', percentage: 18.4, amount: totalCost * 0.184 },
    { month: 'Month 3', percentage: 11.1, amount: totalCost * 0.111 },
    { month: 'Month 4', percentage: 16.9, amount: totalCost * 0.169 },
    { month: 'Month 5', percentage: 17.8, amount: totalCost * 0.178 },
    { month: 'Month 6', percentage: 13.9, amount: totalCost * 0.139 },
  ];

  const materialData = [
    { name: 'Cement', percentage: 16.4, amount: totalCost * 0.164, color: '#94a3b8' },
    { name: 'Sand', percentage: 12.3, amount: totalCost * 0.123, color: '#fcd34d' },
    { name: 'Aggregate', percentage: 7.4, amount: totalCost * 0.074, color: '#64748b' },
    { name: 'Steel', percentage: 24.6, amount: totalCost * 0.246, color: '#3b82f6' },
    { name: 'Finishes', percentage: 16.5, amount: totalCost * 0.165, color: '#10b981', details: 'Paint 4.1% + Tiles 8.0% + Bricks 4.4%' },
    { name: 'Fittings', percentage: 22.8, amount: totalCost * 0.228, color: '#f43f5e', details: 'Windows 3.0% + Doors 3.4% + Plumbing 5.5% + Electrical 6.8% + Sanitary 4.1%' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-8">
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'cashflow' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          6-Month Cashflow Timeline
        </button>
        <button
          onClick={() => setActiveTab('material')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'material' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Material Cost Breakdown
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'cashflow' ? (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Estimated 6-Month Expenditure Timeline</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Standard thumb-rule cashflow allocation for a typical 6-month residential project.</p>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${(val/1000)}k`} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    formatter={(value: any, name: any, props: any) => [formatCurrency(value), `${props.payload.percentage}%`]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {cashflowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 || index === 4 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Thumb-Rule Material Distribution</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Standard percentage allocation for materials and fittings.</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {materialData.map((entry, index) => (
                        <PieCell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any, name: any, props: any) => [formatCurrency(value), `${props.payload.percentage}%`]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-3">
              {materialData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{item.name} <span className="text-slate-500 font-normal">({item.percentage}%)</span></div>
                      {item.details && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.details}</div>}
                    </div>
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
