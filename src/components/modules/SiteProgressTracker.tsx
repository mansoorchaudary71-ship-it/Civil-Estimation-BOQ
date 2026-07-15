import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from '../ui/MaterialSummary';
import { Calendar, CheckCircle, Image as ImageIcon, Link, BarChart as BarChartIcon, Upload, Trash2, Edit2, ChevronRight, FileOutput, Share2, Bell, Download, DownloadCloud, Mail } from 'lucide-react';
import { generateProgressPDF, exportToMSProject, exportToCSV } from "../../utils/projectReports";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  actualCost: number;
  workersPlanned: number;
  workersActual: number;
  photos: string[];
}

const DEFAULT_PHASES: Phase[] = [
  { id: '1', name: 'Foundation', startDate: '2024-06-01', endDate: '2024-06-15', progress: 100, budget: 15000, actualCost: 14500, workersPlanned: 10, workersActual: 10, photos: [] },
  { id: '2', name: 'Structure', startDate: '2024-06-16', endDate: '2024-07-20', progress: 60, budget: 35000, actualCost: 22000, workersPlanned: 20, workersActual: 18, photos: [] },
  { id: '3', name: 'Roof', startDate: '2024-07-21', endDate: '2024-08-05', progress: 0, budget: 12000, actualCost: 0, workersPlanned: 8, workersActual: 0, photos: [] },
  { id: '4', name: 'Brickwork', startDate: '2024-08-06', endDate: '2024-08-25', progress: 0, budget: 18000, actualCost: 0, workersPlanned: 15, workersActual: 0, photos: [] },
  { id: '5', name: 'Plastering', startDate: '2024-08-26', endDate: '2024-09-10', progress: 0, budget: 8000, actualCost: 0, workersPlanned: 12, workersActual: 0, photos: [] },
  { id: '6', name: 'Flooring', startDate: '2024-09-11', endDate: '2024-09-25', progress: 0, budget: 15000, actualCost: 0, workersPlanned: 10, workersActual: 0, photos: [] },
  { id: '7', name: 'Paint', startDate: '2024-09-26', endDate: '2024-10-10', progress: 0, budget: 6000, actualCost: 0, workersPlanned: 6, workersActual: 0, photos: [] },
  { id: '8', name: 'Finishing', startDate: '2024-10-11', endDate: '2024-10-20', progress: 0, budget: 10000, actualCost: 0, workersPlanned: 5, workersActual: 0, photos: [] },
];

import html2canvas from 'html2canvas';

export default function SiteProgressTracker() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [isClientDemo, setIsClientDemo] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { workspaceToken } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('site_progress_data');
    if (saved) {
      try {
         setPhases(JSON.parse(saved));
      } catch (e) {
         setPhases(DEFAULT_PHASES);
      }
    } else {
      // Setup some dynamic dates relative to today for demo
      const today = new Date();
      const demoPhases = DEFAULT_PHASES.map((p, i) => {
         const start = new Date(today);
         start.setDate(today.getDate() + (i * 15) - 30); // start 30 days ago
         const end = new Date(start);
         end.setDate(start.getDate() + 14);
         return { ...p, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
      });
      setPhases(demoPhases);
    }
  }, []);

  useEffect(() => {
    if (phases.length > 0) {
      localStorage.setItem('site_progress_data', JSON.stringify(phases));
    }
  }, [phases]);

  const handleExportPDF = async () => {
    let sCurveImg;
    let histogramImg;
    try {
      const el1 = document.getElementById('s-curve-chart');
      if (el1) {
         const canvas = await html2canvas(el1);
         sCurveImg = canvas.toDataURL('image/png');
      }
      const el2 = document.getElementById('resource-histogram');
      if (el2) {
         const canvas = await html2canvas(el2);
         histogramImg = canvas.toDataURL('image/png');
      }
    } catch(e) {
      console.error(e);
    }
    await generateProgressPDF(phases, metrics, sCurveImg, histogramImg);
  };

  // Calculations
  const metrics = useMemo(() => {
    if (phases.length === 0) return { overallProgress: 0, totalBudget: 0, totalCost: 0, daysAheadBehind: 0, SPI: 1, CPI: 1, expectedProgress: 0 };
    
    let totalBudget = 0;
    let totalCost = 0;
    let EV = 0; // Earned Value (totalProgressWeight)
    let PV = 0; // Planned Value (expectedWeight)
    
    const today = new Date().getTime();

    phases.forEach(p => {
      totalBudget += p.budget;
      totalCost += p.actualCost;
      EV += (p.progress / 100) * p.budget;
      
      const s = new Date(p.startDate).getTime();
      const e = new Date(p.endDate).getTime();
      
      let expectedPct = 0;
      if (today >= e) expectedPct = 100;
      else if (today > s && e > s) {
         expectedPct = ((today - s) / (e - s)) * 100;
      }
      PV += (expectedPct / 100) * p.budget;
    });

    const overallProgress = totalBudget > 0 ? (EV / totalBudget) * 100 : 0;
    const expectedProgress = totalBudget > 0 ? (PV / totalBudget) * 100 : 0;
    const SPI = PV > 0 ? (EV / PV) : 1;
    const CPI = totalCost > 0 ? (EV / totalCost) : 1;
    const CV = EV - totalCost;
    const SV = EV - PV;
    
    // Simple days estimation (1% progress = ~X days). Hacky but visually effective.
    const progressDiff = overallProgress - expectedProgress;
    const projectDuration = phases.length > 0 ? (new Date(phases[phases.length-1].endDate).getTime() - new Date(phases[0].startDate).getTime()) / (1000*60*60*24) : 0;
    const daysAheadBehind = Math.round((progressDiff / 100) * projectDuration);

    return { overallProgress, expectedProgress, totalBudget, totalCost, daysAheadBehind, SPI, CPI, EV, PV, AC: totalCost, CV, SV };
  }, [phases]);

  const chartData = useMemo(() => {
    if (phases.length === 0) return [];
    
    // For a simplified S-Curve, we'll plot cumulatively by phase sequence instead of strict daily timeline interpolation
    // to give a clear view.
    let cumPV = 0;
    let cumEV = 0;
    let cumAC = 0;
    
    return phases.map((p, i) => {
        const pv = p.budget;
        const ev = (p.progress / 100) * p.budget;
        const ac = p.actualCost;
        
        cumPV += pv;
        cumEV += ev;
        cumAC += ac;
        
        return {
           name: p.name,
           PlannedValue: Math.round(cumPV),
           EarnedValue: Math.round(cumEV),
           ActualCost: Math.round(cumAC),
           WorkersPlanned: p.workersPlanned || 0,
           WorkersActual: p.workersActual || 0
        };
    });
  }, [phases]);

  const notifications = useMemo(() => {
     let notifs: string[] = [];
     const today = new Date().getTime();
     phases.forEach(p => {
         const tEnd = new Date(p.endDate).getTime();
         const daysToDeadline = (tEnd - today) / (1000 * 3600 * 24);
         
         if (p.progress < 100 && daysToDeadline > 0 && daysToDeadline <= 7) {
            notifs.push(`Phase "${p.name}" is 7 days from deadline!`);
         }
         
         const tStart = new Date(p.startDate).getTime();
         let expPct = 0;
         if (today > tEnd) expPct = 100;
         else if (today > tStart) expPct = ((today - tStart) / (tEnd - tStart)) * 100;
         
         if (p.progress < expPct - 10 && expPct > 0) { // arbitrary threshold: 10% behind
            notifs.push(`Phase "${p.name}" is lagging behind expectations.`);
         }
     });
     return notifs;
  }, [phases]);

  const handleSendEmailAlert = async () => {
    if (!workspaceToken) {
      alert("You need to sign in with Google to send emails. Please re-authenticate and allow the Gmail permissions.");
      return;
    }
    
    const email = window.prompt("Enter Project Manager Email for alerts:");
    if (!email) return;

    setIsSendingEmail(true);
    try {
      const body = `
        <h2>Critical Project Alerts</h2>
        <p>The following milestones are approaching or lagging:</p>
        <ul>
          ${notifications.map(n => `<li>${n}</li>`).join('')}
        </ul>
        <br/>
        <p>Generated by Site Progress Tracker.</p>
      `;

      const response = await fetch('/api/workspace/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${workspaceToken}`
        },
        body: JSON.stringify({
          to: email,
          subject: 'Action Required: Site Progress Alerts',
          body: body
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      alert("Email alert sent successfully!");
    } catch (error: any) {
      console.error(error);
      alert(`Failed to send email: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Gantt Chart Logic
  const ganttScale = useMemo(() => {
     if (phases.length === 0) return { start: new Date().getTime(), end: new Date().getTime(), days: 1 };
     let minDate = new Date(phases[0].startDate).getTime();
     let maxDate = new Date(phases[0].endDate).getTime();
     phases.forEach(p => {
       const s = new Date(p.startDate).getTime();
       const e = new Date(p.endDate).getTime();
       if (s < minDate) minDate = s;
       if (e > maxDate) maxDate = e;
     });
     
     // Add padding
     minDate -= (1000 * 60 * 60 * 24 * 7); // 1 week before
     maxDate += (1000 * 60 * 60 * 24 * 7); // 1 week after
     
     return {
        start: minDate,
        end: maxDate,
        days: (maxDate - minDate) / (1000 * 60 * 60 * 24)
     };
  }, [phases]);

  const handleUpdatePhase = (id: string, field: keyof Phase, value: any) => {
     setPhases(phases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedPhase) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
       const b64 = reader.result as string;
       setPhases(phases.map(p => {
         if (p.id === selectedPhase) {
           return { ...p, photos: [...p.photos, b64] };
         }
         return p;
       }));
    };
    reader.readAsDataURL(file);
  };

  const handleShare = () => {
     setIsClientDemo(true);
     setTimeout(() => setIsClientDemo(false), 5000); // Reset after 5s just for demo
     alert('Shareable link copied to clipboard! (Demo feature)');
  };

  const activePhase = phases.find(p => p.id === selectedPhase);

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6 animate-in fade-in duration-500 pb-[120px] px-4 md:px-0">
       <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] shadow-sm overflow-hidden">
         <div>
           <h2 className="tabular-nums flex items-center gap-3 text-xl font-semibold text-gray-900 tracking-tight mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[24px] overflow-hidden">
                <BarChartIcon className="w-8 h-8" />
              </div>
              Site Progress Tracker
           </h2>
           <p className="mt-2 text-base font-normal text-gray-600 leading-relaxed">Track timelines, budgets, and visual progress.</p>
         </div>
         <div className="flex flex-wrap gap-2">
            <button onClick={() => exportToCSV(phases)} className="w-full bg-white hover:bg-slate-50 text-gray-700 border border-slate-200 px-4 py-2.5 rounded-full font-bold transition flex items-center gap-2 text-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden">
               <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => exportToMSProject(phases)} className="w-full bg-white hover:bg-slate-50 text-gray-700 border border-slate-200 px-4 py-2.5 rounded-full font-bold transition flex items-center gap-2 text-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden">
               <DownloadCloud className="w-4 h-4" /> XML
            </button>
            <button onClick={handleShare} className="w-full bg-white hover:bg-slate-50 text-gray-700 border border-slate-200 px-4 py-2.5 rounded-full transition flex items-center gap-2 text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden">
               <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={handleExportPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full transition flex items-center gap-2 text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
               <FileOutput className="w-4 h-4" /> Report
            </button>
         </div>
       </div>

       {isClientDemo && (
          <div className="bg-indigo-600 text-white p-3 text-center rounded-[24px] font-bold text-sm mb-4 animate-pulse overflow-hidden">
             Client View Active - Read Only Mode
          </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          
          <div className="lg:col-span-3 space-y-6">
             {/* Scorecards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                   <p className="uppercase tracking-wider mb-2 relative z-10 text-base font-normal text-gray-600 leading-relaxed">Overall Progress</p>
                   <div className="flex items-end gap-2 relative z-10">
                     <h3 className="md:text-[clamp(1.75rem,5vw,2.5rem)] break-all tabular-nums leading-none text-lg font-medium text-gray-800 mb-4">{metrics.overallProgress.toFixed(1)}<span className="text-2xl text-slate-400">%</span></h3>
                   </div>
                   <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden relative z-10 border border-slate-200">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${metrics.overallProgress}%` }}></div>
                   </div>
                </div>

                <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-center">
                   <p className="uppercase tracking-wider mb-2 relative z-10 text-base font-normal text-gray-600 leading-relaxed">Cost & Burn <span className="text-indigo-500 ml-1 font-bold">(CPI: {metrics.CPI.toFixed(2)})</span></p>
                   <div className="flex items-end gap-2 relative z-10 w-full justify-between">
                     <div className="flex items-end gap-2">
                       <h3 className="tabular-nums leading-none text-lg font-medium text-gray-800 mb-4">${(metrics.totalCost / 1000).toFixed(1)}k</h3>
                       <span className="text-sm font-bold text-gray-500 mb-1">Earned: ${( (metrics.EV || 0) / 1000).toFixed(1)}k</span>
                     </div>
                   </div>
                   <div className="w-full mt-3 relative z-10 flex items-center justify-between">
                     <p className={`text-xs font-bold ${(metrics.CV || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(metrics.CV || 0) >= 0 ? `Cost Variance: +$${(metrics.CV || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `Cost Variance: -$${(Math.abs(metrics.CV || 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                     </p>
                   </div>
                </div>

                <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-center">
                   <p className="uppercase tracking-wider mb-2 relative z-10 text-base font-normal text-gray-600 leading-relaxed">Schedule Status <span className="text-indigo-500 ml-1 font-bold">(SPI: {metrics.SPI.toFixed(2)})</span></p>
                   <div className="flex justify-between items-end">
                      {metrics.daysAheadBehind > 0 ? (
                         <h3 className="tabular-nums text-emerald-500 leading-none text-lg font-medium text-gray-800 mb-4">{metrics.daysAheadBehind} <span className="text-lg text-emerald-600/50">Days Ahead</span></h3>
                      ) : metrics.daysAheadBehind < 0 ? (
                         <h3 className={`text-3xl font-bold tabular-nums tracking-tight ${Math.abs(metrics.daysAheadBehind) <= 7 ? 'text-amber-500' : 'text-rose-500'} leading-none`}>{Math.abs(metrics.daysAheadBehind)} <span className="text-lg opacity-50">Days Behind</span></h3>
                      ) : (
                         <h3 className="tabular-nums leading-none text-lg font-medium text-gray-800 mb-4">On Track</h3>
                      )}
                   </div>
                   <p className={`text-xs font-bold mt-3 relative z-10 ${(metrics.SV || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {(metrics.SV || 0) >= 0 ? `Schedule Variance: +$${(metrics.SV || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `Schedule Variance: -$${(Math.abs(metrics.SV || 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                   </p>
                </div>
             </div>

             {notifications.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl relative overflow-hidden flex flex-col gap-2 shadow-sm mb-6 mt-6">
                   <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                      <Bell className="w-5 h-5 flex-shrink-0" /> Project Alerts & Milestones
                   </div>
                   {notifications.map((n, idx) => (
                      <div key={idx} className="text-sm font-medium text-amber-700 flex items-start gap-2">
                         <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span> {n}
                      </div>
                   ))}
                   <button onClick={handleSendEmailAlert} 
                     disabled={isSendingEmail}
                     className="mt-3 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-full transition self-start flex items-center gap-2 disabled:opacity-50 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                      <Mail className="w-4 h-4" />
                      {isSendingEmail ? 'Sending...' : 'Send Email Alert to PM'}
                   </button>
                </div>
             )}

             {/* S-Curve & Histograms Grid */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="w-full bg-white border border-slate-200 rounded-[2rem] shadow-sm p-4 sm:p-6 overflow-hidden">
                   <h3 className="mb-6 text-lg font-medium text-gray-800 mb-4">S-Curve (Planned vs Actual Value)</h3>
                   <div className="h-64 w-full" id="s-curve-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEV" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAC" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v/1000}k`} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Area type="monotone" dataKey="PlannedValue" name="Planned Value (PV)" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorPV)" />
                          <Area type="monotone" dataKey="EarnedValue" name="Earned Value (EV)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEV)" />
                          <Area type="monotone" dataKey="ActualCost" name="Actual Cost (AC)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorAC)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="w-full bg-white border border-slate-200 rounded-[2rem] shadow-sm p-4 sm:p-6 overflow-hidden">
                   <h3 className="mb-6 text-lg font-medium text-gray-800 mb-4">Resource Allocation</h3>
                   <div className="h-64 w-full" id="resource-histogram">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar dataKey="WorkersPlanned" name="Planned Workers" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="WorkersActual" name="Actual Workers" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>

             {/* Dynamic CSS Gantt Chart */}
             <div className="w-full bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden p-4 sm:p-6">
                <h3 className="mb-6 text-lg font-medium text-gray-800 mb-4">Execution Timeline</h3>
                
                <div className="relative">
                   {/* Grid lines */}
                   <div className="absolute inset-0 flex justify-between px-32 ml-4">
                      {Array.from({length: 6}).map((_, i) => (
                         <div key={i} className="w-px h-full bg-slate-100 rounded-[24px] border border-slate-200 shadow-sm text-gray-800 overflow-hidden"></div>
                      ))}
                   </div>

                   {/* Phases */}
                   <div className="space-y-4 relative z-10">
                      {phases.map((phase) => {
                         const startTs = new Date(phase.startDate).getTime();
                         const endTs = new Date(phase.endDate).getTime();
                         const leftPct = ((startTs - ganttScale.start) / (ganttScale.end - ganttScale.start)) * 100;
                         const widthPct = ((endTs - startTs) / (ganttScale.end - ganttScale.start)) * 100;
                         
                         const isSelected = selectedPhase === phase.id;

                         return (
                            <div key={phase.id} className="flex items-center gap-4 group cursor-pointer flex-wrap" onClick={() => setSelectedPhase(phase.id)}>
                               <div className={`w-32 truncate text-sm font-bold text-right transition-colors ${isSelected ? 'text-emerald-600 ' : 'text-gray-600  group-hover:text-gray-900 '}`}>
                                  {phase.name}
                               </div>
                               <div className="flex-1 h-10 relative bg-slate-50/50 rounded-[24px] border border-slate-200 shadow-sm text-gray-800 rounded-[24px] border border-transparent group-hover:border-slate-200 : transition">
                                  <div 
                                     className={`absolute h-6 top-2 rounded-[24px] shadow-sm overflow-hidden border border-slate-300/5 transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-emerald-500 ring-offset-white ' : ''}`}
                                     style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: '#e2e8f0' }}
                                  >
                                     <div 
                                        className={`h-full transition-all ${phase.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${phase.progress}%` }}
                                     ></div>
                                  </div>
                               </div>
                               <div className="w-12 text-sm font-bold text-gray-500 text-right">
                                  {phase.progress}%
                               </div>
                            </div>
                         );
                      })}
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             {/* Detail Panel */}
             {activePhase ? (
                <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 rounded-[2rem] shadow-sm sticky top-6 overflow-hidden">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">{activePhase.name}</h3>
                      <button aria-label="Next" onClick={() => setSelectedPhase(null)} className="text-slate-400 hover:text-gray-600 rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                   </div>
                   
                   <div className="space-y-5">
                      <div>
                         <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                         <><label htmlFor="a11y-input-490" className="sr-only">Input</label>
<input id="a11y-input-490" 
                            type="range" 
                            min="0" max="100" 
                            value={activePhase.progress} 
                            onChange={(e) => handleUpdatePhase(activePhase.id, 'progress', parseInt(e.target.value))}
                            className="w-full accent-indigo-600 rounded-full"
                            disabled={isClientDemo}
                         /></>
                         <div className="text-right mt-1 font-bold tabular-nums tracking-tight text-indigo-600">{activePhase.progress}%</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <><label htmlFor="a11y-input-491" className="sr-only">Input</label>
<input id="a11y-input-491" 
                               type="date" 
                               value={activePhase.startDate} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'startDate', e.target.value)}
                               className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <><label htmlFor="a11y-input-492" className="sr-only">Input</label>
<input id="a11y-input-492" 
                               type="date" 
                               value={activePhase.endDate} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'endDate', e.target.value)}
                               className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-gray-700 mb-1">Budget</label>
                            <div className="flex items-center">
                               <span className="bg-slate-100 px-2 py-2 border border-r-0 border-slate-200 rounded-l-lg text-sm text-gray-500">$</span>
                               <><label htmlFor="a11y-input-493" className="sr-only">Input</label>
<input id="a11y-input-493" 
                                  type="number" inputMode="decimal" 
                                  value={activePhase.budget} 
                                  onChange={(e) => handleUpdatePhase(activePhase.id, 'budget', parseFloat(e.target.value)||0)}
                                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-r-lg text-sm font-semibold outline-none"
                                  disabled={isClientDemo}
                               /></>
                            </div>
                         </div>
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-gray-700 mb-1">Actual Cost</label>
                            <div className="flex items-center">
                               <span className="bg-slate-100 px-2 py-2 border border-r-0 border-slate-200 rounded-l-lg text-sm text-gray-500">$</span>
                               <><label htmlFor="a11y-input-494" className="sr-only">Input</label>
<input id="a11y-input-494" 
                                  type="number" inputMode="decimal" 
                                  value={activePhase.actualCost} 
                                  onChange={(e) => handleUpdatePhase(activePhase.id, 'actualCost', parseFloat(e.target.value)||0)}
                                  className={`w-full px-2 py-2 bg-slate-50  border border-slate-200 rounded-r-lg text-sm font-bold outline-none ${activePhase.actualCost > activePhase.budget ? 'text-rose-600' : 'text-emerald-600'}`}
                                  disabled={isClientDemo}
                               /></>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-full">
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-gray-700 mb-1">Planned Workers</label>
                            <><label htmlFor="a11y-input-495" className="sr-only">Input</label>
<input id="a11y-input-495" 
                               type="number" inputMode="decimal" 
                               value={activePhase.workersPlanned || 0} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'workersPlanned', parseInt(e.target.value)||0)}
                               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-gray-700 mb-1">Actual Workers</label>
                            <><label htmlFor="a11y-input-496" className="sr-only">Input</label>
<input id="a11y-input-496" 
                               type="number" inputMode="decimal" 
                               value={activePhase.workersActual || 0} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'workersActual', parseInt(e.target.value)||0)}
                               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                         <div className="flex justify-between items-center mb-3">
                            <label className="block uppercase tracking-widest text-sm font-medium text-gray-700 mb-1">Site Photos ({activePhase.photos.length})</label>
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 rounded-full">
                               <Upload className="w-3 h-3" /> Upload
                            </button>
                            <><label htmlFor="a11y-input-497" className="sr-only">Input</label>
<input id="a11y-input-497" type="file" accept="image/*" className="hidden text-base font-normal rounded-full" ref={fileInputRef} onChange={handlePhotoUpload} /></>
                         </div>
                         
                         {activePhase.photos.length === 0 ? (
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-[24px] flex items-center justify-center text-slate-400">
                               <ImageIcon className="w-6 h-6 opacity-50" />
                            </div>
                         ) : (
                            <div className="grid grid-cols-2 gap-2">
                               {activePhase.photos.map((p, idx) => (
                                  <div key={idx} className="aspect-square rounded-[24px] bg-slate-100 overflow-hidden relative group">
                                     <img src={p} alt={`Site Progress Photo ${idx}`} title={`Progress Photo ${idx}`} loading="lazy" className="w-full h-full object-cover" />
                                     <button aria-label="Delete" 
                                        onClick={() => {
                                           const newPhotos = [...activePhase.photos];
                                           newPhotos.splice(idx, 1);
                                           handleUpdatePhase(activePhase.id, 'photos', newPhotos);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-slate-900/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                                     >
                                        <Trash2 className="w-3 h-3" />
                                     </button>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             ) : (
                <div className="bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-gray-800 border-2 border-dashed border-slate-200 p-4 sm:p-8 md:p-8 rounded-[2rem] text-center flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
                   <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                   <h3 className="mb-1 text-lg font-medium text-gray-800 mb-4">Select a Phase</h3>
                   <p className="text-base font-normal text-gray-600 leading-relaxed">Click on any phase in the timeline to edit progress, budgets, and upload photos.</p>
                </div>
             )}
          </div>
       </div>
    
      <CalculationHistory
        calculatorId="siteprogresstracker"
        currentInputs={{}}
        currentResults={{}}
        estimationName="Site Progress Tracker"
      />
</div>
  );
}
