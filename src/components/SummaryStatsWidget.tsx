import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, FolderOpen, TrendingUp, Activity } from 'lucide-react';

const MOCK_DATA = [
  { name: 'Jan', cost: 400000, projects: 4 },
  { name: 'Feb', cost: 300000, projects: 3 },
  { name: 'Mar', cost: 500000, projects: 5 },
  { name: 'Apr', cost: 450000, projects: 4 },
  { name: 'May', cost: 600000, projects: 6 },
  { name: 'Jun', cost: 800000, projects: 8 },
  { name: 'Jul', cost: 750000, projects: 7 },
];

export default function SummaryStatsWidget() {
  const totalCost = useMemo(() => MOCK_DATA.reduce((acc, curr) => acc + curr.cost, 0), []);
  const activeProjects = useMemo(() => MOCK_DATA[MOCK_DATA.length - 1].projects, []);
  
  return (
    <div className="w-full bg-[#F0F4F8] rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.4),-8px_-8px_16px_rgba(255,255,255,0.8)] mb-8 print-only">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-500" />
          Dashboard Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats Cards */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Estimated Cost</p>
              <h3 className="text-2xl font-bold text-slate-800">
                Rs {(totalCost / 1000000).toFixed(1)}M
              </h3>
              <p className="text-xs text-emerald-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +12.5% this month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Projects</p>
              <h3 className="text-2xl font-bold text-slate-800">{activeProjects}</h3>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +2 new this month
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column: Area Chart (Costs) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Cost Trends</h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rs ${value.toLocaleString()}`, 'Cost']}
                />
                <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Bar Chart (Projects) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Project Activity</h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="projects" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
