import React from 'react';
import { Compass, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PremiumToolCard() {
  return (
    <div className="relative w-full md:max-w-3xl md:mx-auto p-6 md:p-8 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.08)] overflow-hidden">
      {/* Topographic Background Pattern Overlay - Simulated */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 30%, #FFFFFF 1px, transparent 1px), radial-gradient(circle at 80% 70%, #FFFFFF 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
      ></div>
      
      {/* Top-left fading white border highlight */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[32px]" 
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 0) 50%)',
          padding: '14px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} 
      />
      
      {/* Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner flex items-center justify-center border border-slate-200/60 shrink-0">
            <Compass className="w-7 h-7 text-slate-700" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Civil Estimation Pro</h2>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Project Overview Dashboard</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-emerald-100/50 shadow-[0_2px_10px_rgba(16,185,129,0.1)] w-max">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Status Active
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Stats & Status Ring */}
        <div className="flex flex-col gap-6">
          {/* Status Ring Card */}
          <div className="w-full p-6 md:p-8 rounded-[24px] bg-white/80 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex items-center gap-6 group hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all overflow-hidden">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-sm">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray="75, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-black text-slate-900">75<span className="text-sm">%</span></span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Completion Rate</h3>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">On Track</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 sm:p-6 rounded-[24px] bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <AlertCircle className="w-6 h-6 text-amber-500 mb-4" strokeWidth={2} />
              <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">2</p>
              <p className="text-xs font-bold text-amber-700/80 uppercase tracking-wider">Critical Alerts</p>
            </div>
            <div className="p-4 sm:p-6 rounded-[24px] bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-4" strokeWidth={2} />
              <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">14</p>
              <p className="text-xs font-bold text-emerald-700/80 uppercase tracking-wider">Cleared Tasks</p>
            </div>
          </div>
        </div>

        {/* Right Column: Bar Chart */}
        <div className="w-full p-6 md:p-8 rounded-[24px] bg-white/80 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col drop-shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Budget Allocation</h3>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <BarChart3 className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          
          <div className="grow flex items-end justify-between gap-3 h-40 pt-4">
            {[
              { val: 45, lbl: 'Conc' }, 
              { val: 80, lbl: 'Steel' }, 
              { val: 55, lbl: 'Mas' }, 
              { val: 95, lbl: 'Labor' }, 
              { val: 30, lbl: 'Eqp' }, 
              { val: 65, lbl: 'Ohdr' }
            ].map((item, i) => (
              <div key={i} className="relative w-full group h-full flex flex-col justify-end">
                <div className="absolute bottom-[calc(100%+8px)] w-full text-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs text-slate-900 translate-y-2 group-hover:translate-y-0 ease-out">{item.val}%</div>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    i === 3 
                      ? 'bg-gradient-to-t from-amber-400 to-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.3)]' 
                      : 'bg-slate-100 group-hover:bg-slate-200 border-x border-t border-slate-200/50'
                  }`} 
                  style={{ height: `${item.val}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 mx-1">
            {['Conc', 'Steel', 'Mas', 'Labor', 'Eqp', 'Ohdr'].map((lbl, i) => (
              <div key={i} className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate max-w-[40px] text-center">{lbl}</div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
