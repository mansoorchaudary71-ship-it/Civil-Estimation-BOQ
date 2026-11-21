import { Button } from '../ui/Button';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from '../ui/MaterialSummary';
import { Calendar, CheckCircle, Image as ImageIcon, Link, BarChart as BarChartIcon, Upload, Trash2, Edit2, ChevronRight, FileOutput, Share2, Bell, Download, DownloadCloud, Mail } from 'lucide-react';
import { generateProgressPDF, exportToMSProject, exportToCSV } from "../../utils/projectReports";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart } from 'recharts';
import { calcEvm, forecastDelayDays, sCurvePoints } from "../../lib/evm";
import { useSettings } from "../../context/SettingsContext";
import toast from "react-hot-toast";

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

/** Sample project — loaded ONLY via the "Load sample project" button and labelled SAMPLE. Never seeded silently. */
const SAMPLE_PHASES: Phase[] = [
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
  const [statusDate, setStatusDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isSample, setIsSample] = useState(false);
  const [trendLog, setTrendLog] = useState<Array<{ date: string; cpi: number; spi: number }>>(() => {
    try { const raw = localStorage.getItem("site_progress_trend"); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const [baseline, setBaseline] = useState<{ at: string; points: Array<{ date: string; pv: number }> } | null>(() => {
    try { const raw = localStorage.getItem("site_progress_baseline"); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const { settings, formatCurrency } = useSettings();
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [isClientDemo, setIsClientDemo] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('site_progress_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPhases(Array.isArray(parsed) ? parsed : []);
        setIsSample(localStorage.getItem('site_progress_sample') === '1');
      } catch (e) {
        setPhases([]);
      }
    }
    // No saved data -> empty state. Nothing is seeded as if real.
  }, []);

  const loadSample = () => {
    const today = new Date();
    const sample = SAMPLE_PHASES.map((ph, i) => {
      const start = new Date(today);
      start.setDate(today.getDate() + (i * 15) - 30);
      const end = new Date(start);
      end.setDate(start.getDate() + 14);
      return { ...ph, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    });
    setPhases(sample);
    setIsSample(true);
    localStorage.setItem('site_progress_sample', '1');
    toast.success("Sample project loaded — labelled SAMPLE. Replace it with your own phases.");
  };

  const addPhase = () => {
    const start = new Date(statusDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 14);
    const np: Phase = {
      id: `ph_${Date.now().toString(36)}`, name: `Phase ${phases.length + 1}`,
      startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0],
      progress: 0, budget: 0, actualCost: 0, workersPlanned: 0, workersActual: 0, photos: [],
    };
    setPhases([...phases, np]);
    setIsSample(false);
    localStorage.removeItem('site_progress_sample');
  };

  const removePhase = (id: string) => {
    const p = phases.find((x) => x.id === id);
    if (!p) return;
    if (!window.confirm(`Delete phase "${p.name}"? This cannot be undone.`)) return;
    setPhases(phases.filter((x) => x.id !== id));
    if (selectedPhase === id) setSelectedPhase(null);
    toast.success(`Phase "${p.name}" deleted.`);
  };

  const freezeBaseline = () => {
    if (phases.length === 0) { toast.error("Add phases first — there is nothing to freeze."); return; }
    const pts = sCurvePoints(phases.map((ph) => ({ start: ph.startDate, end: ph.endDate, budget: ph.budget, progress: ph.progress, actualCost: ph.actualCost })), statusDate)
      .map((pt) => ({ date: pt.date, pv: pt.pv }));
    const b = { at: statusDate, points: pts };
    try { localStorage.setItem('site_progress_baseline', JSON.stringify(b)); } catch { /* noop */ }
    setBaseline(b);
    toast.success(`Baseline frozen at ${statusDate} — future S-curves compare against it.`);
  };

  useEffect(() => {
    if (phases.length > 0) {
      // Photos are stored as base64 and can exceed the ~5 MB quota — save
      // failures must surface instead of silently losing the project.
      try {
        localStorage.setItem('site_progress_data', JSON.stringify(phases));
      } catch {
        toast.error("Could not save — browser storage is full (photos are stored as base64). Remove some photos and try again.");
      }
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

  // Calculations — EVM engine (src/lib/evm), as of the status date (not "today").
  const metrics = useMemo(() => {
    const empty = { overallProgress: 0, totalBudget: 0, totalCost: 0, daysAheadBehind: 0, SPI: 1, CPI: 1, expectedProgress: 0, EV: 0, PV: 0, AC: 0, CV: 0, SV: 0, eacCpi: 0, eacAtypical: 0, eacCpiSpi: 0, etc: 0, vac: 0, tcpi: 0, status: "No phases yet" };
    if (phases.length === 0) return empty;

    let totalBudget = 0;
    let totalCost = 0;
    let EV = 0;
    let PV = 0;

    const at = new Date(statusDate).getTime();

    phases.forEach(p => {
      totalBudget += p.budget;
      totalCost += p.actualCost;
      EV += (p.progress / 100) * p.budget;

      const s = new Date(p.startDate).getTime();
      const e = new Date(p.endDate).getTime();

      let expectedPct = 0;
      if (at >= e) expectedPct = 100;
      else if (at > s && e > s) {
         expectedPct = ((at - s) / (e - s)) * 100;
      }
      PV += (expectedPct / 100) * p.budget;
    });

    const evm = calcEvm({ bac: totalBudget, ev: EV, pv: PV, ac: totalCost });
    const overallProgress = totalBudget > 0 ? (EV / totalBudget) * 100 : 0;
    const expectedProgress = totalBudget > 0 ? (PV / totalBudget) * 100 : 0;
    // Remaining planned days from the status date to the last phase end.
    const lastEnd = Math.max(...phases.map((p) => new Date(p.endDate).getTime()));
    const remainingDays = Math.max(0, Math.round((lastEnd - at) / (1000 * 60 * 60 * 24)));
    const daysAheadBehind = -forecastDelayDays(evm.spi, remainingDays); // negative delay = ahead

    return {
      overallProgress, expectedProgress, totalBudget, totalCost, daysAheadBehind,
      SPI: evm.spi, CPI: evm.cpi, EV, PV, AC: totalCost, CV: evm.cv, SV: evm.sv,
      eacCpi: evm.eacCpi, eacAtypical: evm.eacAtypical, eacCpiSpi: evm.eacCpiSpi,
      etc: evm.etc, vac: evm.vac, tcpi: evm.tcpi, status: evm.status,
    };
  }, [phases, statusDate]);

  // CPI / SPI trend log (one entry per status date, kept in localStorage).
  useEffect(() => {
    if (phases.length === 0) return;
    try {
      const raw = localStorage.getItem('site_progress_trend');
      const log: Array<{ date: string; cpi: number; spi: number }> = raw ? JSON.parse(raw) : [];
      const entry = { date: statusDate, cpi: Math.round(metrics.CPI * 100) / 100, spi: Math.round(metrics.SPI * 100) / 100 };
      const next = [...log.filter((e) => e.date !== statusDate), entry].slice(-30);
      localStorage.setItem('site_progress_trend', JSON.stringify(next));
      setTrendLog(next);
    } catch { /* noop */ }
  }, [phases, statusDate]);

  // S-curve by DAILY interpolation (src/lib/evm), not phase sequence.
  const chartData = useMemo(() => {
    if (phases.length === 0) return [];
    const baselineByDate = new Map((baseline?.points ?? []).map((pt) => [pt.date, pt.pv]));
    return sCurvePoints(
      phases.map((p) => ({ start: p.startDate, end: p.endDate, budget: p.budget, progress: p.progress, actualCost: p.actualCost })),
      statusDate,
    ).map((pt) => ({
      name: pt.date,
      PlannedValue: pt.pv,
      EarnedValue: pt.ev,
      ActualCost: pt.ac,
      BaselinePV: baselineByDate.get(pt.date),
    }));
  }, [phases, statusDate, baseline]);

  // Resource histogram: workers per PHASE (planned vs actual). The old
  // chart bound the S-curve data (PV/EV/AC/BaselinePV) to WorkersPlanned /
  // WorkersActual keys that do not exist there, so it was always empty.
  const workerChartData = useMemo(() => phases.map((p) => ({
    name: p.name,
    WorkersPlanned: p.workersPlanned,
    WorkersActual: p.workersActual,
  })), [phases]);

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

  // No email backend exists on static GitHub Pages (the old code POSTed
  // to /api/workspace/gmail/send, which does not exist there) — copy the
  // alert text so it can be pasted into any mail client instead.
  const handleSendEmailAlert = async () => {
    const email = window.prompt("Enter Project Manager Email for alerts:");
    if (!email) return;

    setIsSendingEmail(true);
    try {
      const text = `Action Required: Site Progress Alerts\nTo: ${email}\n\nThe following milestones are approaching or lagging:\n${notifications.map((n) => `- ${n}`).join("\n")}\n\nGenerated by Site Progress Tracker.`;
      await navigator.clipboard.writeText(text);
      toast.success("Alert copied to clipboard — paste it into your email to send it.");
    } catch {
      toast.error("Could not copy to clipboard — select the alerts above and copy them manually.");
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

  const handleShare = async () => {
     try {
       await navigator.clipboard.writeText(window.location.href);
       toast.success("Link copied to clipboard.");
     } catch {
       toast.error("Clipboard blocked — copy the address from your browser instead.");
     }
  };

  const activePhase = phases.find(p => p.id === selectedPhase);

  return (
    <div className="w-full md:max-w-7xl md:mx-auto space-y-6 animate-in fade-in duration-500 pb-[120px] px-4 md:px-0">
       <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 md:p-4 sm:p-8 rounded-2xl shadow-brand-sm overflow-hidden">
         <div>
           <h2 className="tabular-nums flex items-center gap-3 text-xl font-semibold text-txt-primary tracking-tight mb-4">
              <div className="p-3 bg-ui-success text-ui-successText rounded-2xl overflow-hidden">
                <BarChartIcon className="w-8 h-8" />
              </div>
              Site Progress Tracker
           </h2>
           <p className="mt-2 text-base font-normal text-txt-secondary leading-relaxed">Track timelines, budgets, and visual progress with Earned Value (EVM). All values are as of the status date below.</p>
           <div className="flex flex-wrap items-center gap-2 mt-3">
             <label className="text-sm font-bold text-txt-secondary">Status date:</label>
             <input type="date" value={statusDate} onChange={(e) => setStatusDate(e.target.value)} className="px-3 py-1.5 bg-surface-default border border-ui-borderSubtle rounded-full text-sm font-semibold" />
             <Button onClick={addPhase} className="px-3 py-1.5 bg-ink text-white rounded-full text-xs font-bold">Add phase</Button>
             <Button onClick={freezeBaseline} className="px-3 py-1.5 bg-surface-hover rounded-full text-xs font-bold">Freeze baseline</Button>
             {baseline && <span className="text-xs text-txt-tertiary">Baseline frozen at {baseline.at} — use Freeze baseline again to re-baseline.</span>}
           </div>
         </div>
         <div className="flex flex-wrap gap-2">
            <Button onClick={() => exportToCSV(phases)} className="w-full bg-surface-default hover:bg-surface-hover text-txt-secondary border border-ui-borderSubtle px-4 py-2.5 rounded-full font-bold transition flex items-center gap-2 text-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm overflow-hidden">
               <Download className="w-4 h-4" /> CSV
            </Button>
            <Button onClick={() => exportToMSProject(phases)} className="w-full bg-surface-default hover:bg-surface-hover text-txt-secondary border border-ui-borderSubtle px-4 py-2.5 rounded-full font-bold transition flex items-center gap-2 text-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm overflow-hidden">
               <DownloadCloud className="w-4 h-4" /> XML
            </Button>
            <Button onClick={handleShare} className="w-full bg-surface-default hover:bg-surface-hover text-txt-secondary border border-ui-borderSubtle px-4 py-2.5 rounded-full transition flex items-center gap-2 text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm overflow-hidden">
               <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button onClick={handleExportPDF} className="bg-ui-successText hover:bg-ui-successText text-white px-5 py-2.5 rounded-full transition flex items-center gap-2 text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
               <FileOutput className="w-4 h-4" /> Report
            </Button>
         </div>
       </div>

       {phases.length === 0 && (
          <div className="bg-surface-default border border-dashed border-ui-borderSubtle rounded-2xl p-4 sm:p-8 text-center">
            <h3 className="text-lg font-semibold text-txt-primary">No phases yet</h3>
            <p className="text-sm text-txt-secondary mt-1">Add your own phases, or load the labelled sample project to see how the tracker works. Nothing is pre-filled with invented budgets.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button onClick={loadSample} className="px-5 py-2.5 bg-ink text-white rounded-full text-sm font-bold">Load sample project</Button>
              <Button onClick={addPhase} className="px-5 py-2.5 bg-surface-hover rounded-full text-sm font-bold">Add your first phase</Button>
            </div>
          </div>
       )}
       {isSample && phases.length > 0 && (
          <div className="bg-accent-50 border border-accent-200 rounded-2xl p-3 text-sm font-bold text-accent-800">
            SAMPLE project — dates are relative to today and budgets are illustrative. Replace the phases with your own numbers.
          </div>
       )}
       {isClientDemo && (
          <div className="bg-ink text-white p-3 text-center rounded-2xl font-bold text-sm mb-4 animate-pulse overflow-hidden">
             Client View Active - Read Only Mode
          </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          
          <div className="lg:col-span-3 space-y-6">
             {/* Scorecards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-ui-success rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                   <p className="uppercase tracking-wider mb-2 relative z-10 text-base font-normal text-txt-secondary leading-relaxed">Overall Progress</p>
                   <div className="flex items-end gap-2 relative z-10">
                     <h3 className="md:text-[clamp(1.75rem,5vw,2.5rem)] break-all tabular-nums leading-none text-lg font-medium text-txt-primary mb-4">{metrics.overallProgress.toFixed(1)}<span className="text-2xl text-txt-tertiary">%</span></h3>
                   </div>
                   <div className="w-full h-2 bg-surface-hover rounded-full mt-4 overflow-hidden relative z-10 border border-ui-borderSubtle">
                      <div className="h-full bg-ui-successText rounded-full transition-all duration-1000" style={{ width: `${metrics.overallProgress}%` }}></div>
                   </div>
                </div>

                <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm relative overflow-hidden flex flex-col justify-center">
                   <p className="uppercase tracking-wider mb-2 relative z-10 text-base font-normal text-txt-secondary leading-relaxed">Cost & Burn <span className="text-accent-800 ml-1 font-bold">(CPI: {metrics.CPI.toFixed(2)})</span></p>
                   <div className="flex items-end gap-2 relative z-10 w-full justify-between">
                     <div className="flex items-end gap-2">
                       <h3 className="tabular-nums leading-none text-lg font-medium text-txt-primary mb-4">{formatCurrency(metrics.totalCost)}</h3>
                       <span className="text-sm font-bold text-txt-tertiary mb-1">Earned: {formatCurrency(metrics.EV || 0)}</span>
                     </div>
                   </div>
                   <div className="w-full mt-3 relative z-10 flex items-center justify-between">
                     <p className={`text-xs font-bold ${(metrics.CV || 0) >= 0 ? 'text-ui-successText' : 'text-ui-errorText'}`}>
                        {(metrics.CV || 0) >= 0 ? `Cost Variance: +${formatCurrency(metrics.CV || 0)}` : `Cost Variance: -${formatCurrency(Math.abs(metrics.CV || 0))}`}
                     </p>
                   </div>
                </div>

                <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm relative overflow-hidden flex flex-col justify-center">
                   <p className="uppercase tracking-wider mb-2 relative z-10 text-base font-normal text-txt-secondary leading-relaxed">Schedule Status <span className="text-accent-800 ml-1 font-bold">(SPI: {metrics.SPI.toFixed(2)})</span></p>
                   <div className="flex justify-between items-end">
                      {metrics.daysAheadBehind > 0 ? (
                         <h3 className="tabular-nums text-ui-successText leading-none text-lg font-medium text-txt-primary mb-4">{metrics.daysAheadBehind} <span className="text-lg text-ui-successText/50">Days Ahead</span></h3>
                      ) : metrics.daysAheadBehind < 0 ? (
                         <h3 className={`text-3xl font-bold tabular-nums tracking-tight ${Math.abs(metrics.daysAheadBehind) <= 7 ? 'text-accent-800' : 'text-ui-errorText'} leading-none`}>{Math.abs(metrics.daysAheadBehind)} <span className="text-lg opacity-50">Days Behind</span></h3>
                      ) : (
                         <h3 className="tabular-nums leading-none text-lg font-medium text-txt-primary mb-4">On Track</h3>
                      )}
                   </div>
                   <p className={`text-xs font-bold mt-3 relative z-10 ${(metrics.SV || 0) >= 0 ? 'text-ui-successText' : 'text-ui-errorText'}`}>
                      {(metrics.SV || 0) >= 0 ? `Schedule Variance: +${formatCurrency(metrics.SV || 0)}` : `Schedule Variance: -${formatCurrency(Math.abs(metrics.SV || 0))}`}
                   </p>
                </div>
             </div>

             <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm p-4 sm:p-6">
                <h3 className="text-lg font-medium text-txt-primary mb-1">Earned Value Forecast</h3>
                <p className="text-sm text-txt-secondary mb-4">{metrics.status} — as of {statusDate}.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">EAC (CPI method)</p><p className="font-bold text-txt-primary">{formatCurrency(metrics.eacCpi)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">EAC (atypical)</p><p className="font-bold text-txt-primary">{formatCurrency(metrics.eacAtypical)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">EAC (CPI × SPI)</p><p className="font-bold text-txt-primary">{formatCurrency(metrics.eacCpiSpi)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">ETC / VAC</p><p className="font-bold text-txt-primary">{formatCurrency(metrics.etc)} / {formatCurrency(metrics.vac)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">TCPI</p><p className="font-bold text-txt-primary">{metrics.tcpi.toFixed(2)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">BAC</p><p className="font-bold text-txt-primary">{formatCurrency(metrics.totalBudget)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">EV / PV / AC</p><p className="font-bold text-txt-primary">{formatCurrency(metrics.EV || 0)} / {formatCurrency(metrics.PV || 0)} / {formatCurrency(metrics.AC || 0)}</p></div>
                  <div><p className="text-txt-tertiary uppercase tracking-wider text-xs">Currency</p><p className="font-bold text-txt-primary">{settings.currency}</p></div>
                </div>
                {trendLog.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-txt-tertiary mb-1">CPI / SPI trend (latest {Math.min(trendLog.length, 10)})</p>
                    <div className="flex flex-wrap gap-2">
                      {trendLog.slice(-10).map((t) => (
                        <span key={t.date} className="text-xs font-mono bg-surface-hover border border-ui-borderSubtle rounded-full px-2.5 py-1">{t.date}: CPI {t.cpi.toFixed(2)} · SPI {t.spi.toFixed(2)}</span>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             {notifications.length > 0 && (
                <div className="bg-accent-50 border-l-4 border-ink p-4 rounded-r-xl relative overflow-hidden flex flex-col gap-2 shadow-brand-sm mb-6 mt-6">
                   <div className="flex items-center gap-2 text-accent-800 font-bold mb-1">
                      <Bell className="w-5 h-5 flex-shrink-0" /> Project Alerts & Milestones
                   </div>
                   {notifications.map((n, idx) => (
                      <div key={idx} className="text-sm font-medium text-accent-800 flex items-start gap-2">
                         <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-ink shrink-0"></span> {n}
                      </div>
                   ))}
                   <Button onClick={handleSendEmailAlert} 
                     disabled={isSendingEmail}
                     className="mt-3 bg-ink hover:bg-ink-700 text-white font-bold px-4 py-2 rounded-full transition self-start flex items-center gap-2 disabled:opacity-50 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
                      <Mail className="w-4 h-4" />
                      {isSendingEmail ? 'Sending...' : 'Send Email Alert to PM'}
                   </Button>
                </div>
             )}

             {/* S-Curve & Histograms Grid */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm p-4 sm:p-6 overflow-hidden">
                   <h3 className="mb-6 text-lg font-medium text-txt-primary mb-4">S-Curve (Planned vs Actual Value)</h3>
                   <div className="h-64 w-full" id="s-curve-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6B6862" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6B6862" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEV" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F2A413" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#F2A413" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAC" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#B07006" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#B07006" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E4DE" strokeOpacity={0.5} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B6862' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B6862' }} tickFormatter={(v) => `${settings.currency} ${(v/1000).toFixed(0)}k`} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Area type="monotone" dataKey="PlannedValue" name="Planned Value (PV)" stroke="#6B6862" strokeWidth={2} fillOpacity={1} fill="url(#colorPV)" />
                          {baseline && <Area type="monotone" dataKey="BaselinePV" name="Baseline PV" stroke="#1F1D1A" strokeWidth={2} strokeDasharray="6 4" fillOpacity={0} />}
                          <Area type="monotone" dataKey="EarnedValue" name="Earned Value (EV)" stroke="#F2A413" strokeWidth={3} fillOpacity={1} fill="url(#colorEV)" />
                          <Area type="monotone" dataKey="ActualCost" name="Actual Cost (AC)" stroke="#B07006" strokeWidth={2} fillOpacity={1} fill="url(#colorAC)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm p-4 sm:p-6 overflow-hidden">
                   <h3 className="mb-6 text-lg font-medium text-txt-primary mb-4">Resource Allocation</h3>
                   <div className="h-64 w-full" id="resource-histogram">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workerChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E4DE" strokeOpacity={0.5} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B6862' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B6862' }} />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Bar dataKey="WorkersPlanned" name="Planned Workers" fill="#6B6862" radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="WorkersActual" name="Actual Workers" fill="#F2A413" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>

             {/* Dynamic CSS Gantt Chart */}
             <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm overflow-hidden p-4 sm:p-6">
                <h3 className="mb-6 text-lg font-medium text-txt-primary mb-4">Execution Timeline</h3>
                
                <div className="relative">
                   {/* Grid lines */}
                   <div className="absolute inset-0 flex justify-between px-32 ml-4">
                      {Array.from({length: 6}).map((_, i) => (
                         <div key={i} className="w-px h-full bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary overflow-hidden"></div>
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
                               <div className={`w-32 truncate text-sm font-bold text-right transition-colors ${isSelected ? 'text-ui-successText ' : 'text-txt-secondary  group-hover:text-txt-primary '}`}>
                                  {phase.name}
                               </div>
                               <div className="flex-1 h-10 relative bg-surface-hover/50 rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary rounded-2xl border border-transparent group-hover:border-ui-borderSubtle : transition">
                                  <div 
                                     className={`absolute h-6 top-2 rounded-2xl shadow-brand-sm overflow-hidden border border-ui-borderDefault/5 transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-ui-successText ring-offset-white ' : ''}`}
                                     style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: '#E7E4DE' }}
                                  >
                                     <div 
                                        className={`h-full transition-all ${phase.progress === 100 ? 'bg-ui-successText' : 'bg-ink'}`}
                                        style={{ width: `${phase.progress}%` }}
                                     ></div>
                                  </div>
                               </div>
                               <div className="w-12 text-sm font-bold text-txt-tertiary text-right">
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
                <div className="w-full bg-surface-default border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm sticky top-6 overflow-hidden">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-txt-primary mb-4">{activePhase.name}</h3>
                      <div className="flex items-center gap-1">
                        <Button aria-label={`Delete phase ${activePhase.name}`} onClick={() => removePhase(activePhase.id)} className="text-ui-errorText hover:text-ui-errorText rounded-full" disabled={isClientDemo}>Delete</Button>
                        <Button aria-label="Next" onClick={() => setSelectedPhase(null)} className="text-txt-tertiary hover:text-txt-secondary rounded-full"><ChevronRight className="w-5 h-5 rotate-180" /></Button>
                      </div>
                   </div>
                   
                   <div className="space-y-5">
                      <div>
                         <label className="block uppercase tracking-widest mb-2 text-sm font-medium text-txt-secondary mb-1">Progress (%)</label>
                         <><label htmlFor="a11y-input-490" className="sr-only">Input</label>
<input id="a11y-input-490" 
                            type="range" 
                            min="0" max="100" 
                            value={activePhase.progress} 
                            onChange={(e) => handleUpdatePhase(activePhase.id, 'progress', parseInt(e.target.value))}
                            className="w-full accent-accent-600 rounded-full"
                            disabled={isClientDemo}
                         /></>
                         <div className="text-right mt-1 font-bold tabular-nums tracking-tight text-accent-800">{activePhase.progress}%</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-txt-secondary mb-1">Start Date</label>
                            <><label htmlFor="a11y-input-491" className="sr-only">Input</label>
<input id="a11y-input-491" 
                               type="date" 
                               value={activePhase.startDate} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'startDate', e.target.value)}
                               className="w-full px-2 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-txt-secondary mb-1">End Date</label>
                            <><label htmlFor="a11y-input-492" className="sr-only">Input</label>
<input id="a11y-input-492" 
                               type="date" 
                               value={activePhase.endDate} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'endDate', e.target.value)}
                               className="w-full px-2 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-txt-secondary mb-1">Budget</label>
                            <div className="flex items-center">
                               <span className="bg-surface-hover px-2 py-2 border border-r-0 border-ui-borderSubtle rounded-l-lg text-sm text-txt-tertiary">$</span>
                               <><label htmlFor="a11y-input-493" className="sr-only">Input</label>
<input id="a11y-input-493" 
                                  type="number" inputMode="decimal" 
                                  value={activePhase.budget} 
                                  onChange={(e) => handleUpdatePhase(activePhase.id, 'budget', parseFloat(e.target.value)||0)}
                                  className="w-full px-2 py-2 bg-surface-hover border border-ui-borderSubtle rounded-r-lg text-sm font-semibold outline-none"
                                  disabled={isClientDemo}
                               /></>
                            </div>
                         </div>
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-txt-secondary mb-1">Actual Cost</label>
                            <div className="flex items-center">
                               <span className="bg-surface-hover px-2 py-2 border border-r-0 border-ui-borderSubtle rounded-l-lg text-sm text-txt-tertiary">$</span>
                               <><label htmlFor="a11y-input-494" className="sr-only">Input</label>
<input id="a11y-input-494" 
                                  type="number" inputMode="decimal" 
                                  value={activePhase.actualCost} 
                                  onChange={(e) => handleUpdatePhase(activePhase.id, 'actualCost', parseFloat(e.target.value)||0)}
                                  className={`w-full px-2 py-2 bg-surface-hover  border border-ui-borderSubtle rounded-r-lg text-sm font-bold outline-none ${activePhase.actualCost > activePhase.budget ? 'text-ui-errorText' : 'text-ui-successText'}`}
                                  disabled={isClientDemo}
                               /></>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-full">
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-txt-secondary mb-1">Planned Workers</label>
                            <><label htmlFor="a11y-input-495" className="sr-only">Input</label>
<input id="a11y-input-495" 
                               type="number" inputMode="decimal" 
                               value={activePhase.workersPlanned || 0} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'workersPlanned', parseInt(e.target.value)||0)}
                               className="w-full px-3 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                         <div>
                            <label className="block uppercase tracking-widest mb-1.5 text-sm font-medium text-txt-secondary mb-1">Actual Workers</label>
                            <><label htmlFor="a11y-input-496" className="sr-only">Input</label>
<input id="a11y-input-496" 
                               type="number" inputMode="decimal" 
                               value={activePhase.workersActual || 0} 
                               onChange={(e) => handleUpdatePhase(activePhase.id, 'workersActual', parseInt(e.target.value)||0)}
                               className="w-full px-3 py-2 bg-surface-hover border border-ui-borderSubtle rounded-full text-sm font-semibold outline-none"
                               disabled={isClientDemo}
                            /></>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-border-color">
                         <div className="flex justify-between items-center mb-3">
                            <label className="block uppercase tracking-widest text-sm font-medium text-txt-secondary mb-1">Site Photos ({activePhase.photos.length})</label>
                            <Button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-accent-800 flex items-center gap-1 hover:text-accent-800 rounded-full">
                               <Upload className="w-3 h-3" /> Upload
                            </Button>
                            <><label htmlFor="a11y-input-497" className="sr-only">Input</label>
<input id="a11y-input-497" type="file" accept="image/*" className="hidden text-base font-normal rounded-full" ref={fileInputRef} onChange={handlePhotoUpload} /></>
                         </div>
                         
                         {activePhase.photos.length === 0 ? (
                            <div className="h-24 border-2 border-dashed border-ui-borderSubtle rounded-2xl flex items-center justify-center text-txt-tertiary">
                               <ImageIcon className="w-6 h-6 opacity-50" />
                            </div>
                         ) : (
                            <div className="grid grid-cols-2 gap-2">
                               {activePhase.photos.map((p, idx) => (
                                  <div key={idx} className="aspect-square rounded-2xl bg-surface-hover overflow-hidden relative group">
                                     <img src={p} alt={`Site Progress Photo ${idx}`} title={`Progress Photo ${idx}`} loading="lazy" className="w-full h-full object-cover" />
                                     <Button aria-label="Delete" 
                                        onClick={() => {
                                           const newPhotos = [...activePhase.photos];
                                           newPhotos.splice(idx, 1);
                                           handleUpdatePhase(activePhase.id, 'photos', newPhotos);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-ink/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                                     >
                                        <Trash2 className="w-3 h-3" />
                                     </Button>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             ) : (
                <div className="bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary border-2 border-dashed border-ui-borderSubtle p-4 sm:p-8 md:p-8 rounded-2xl text-center flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
                   <Calendar className="w-12 h-12 text-txt-tertiary mb-4" />
                   <h3 className="mb-1 text-lg font-medium text-txt-primary mb-4">Select a Phase</h3>
                   <p className="text-base font-normal text-txt-secondary leading-relaxed">Click on any phase in the timeline to edit progress, budgets, and upload photos.</p>
                </div>
             )}
          </div>
       </div>
    
      <CalculationHistory
        calculatorId="siteprogresstracker"
        currentInputs={{ phases: phases.length, statusDate }}
        currentResults={{ overallProgress: metrics.overallProgress, spi: metrics.SPI, cpi: metrics.CPI, eac: metrics.eacCpi }}
        estimationName="Site Progress Tracker"
      />
</div>
  );
}
