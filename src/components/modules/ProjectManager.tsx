import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects, Project } from '../../context/ProjectContext';
import { auth } from '../../lib/firebase';
import { Plus, FolderOpen, Calendar, MapPin, Building, Share2, Printer, ChevronRight, BarChart3, AlertCircle, Upload, Play, FileText, ArrowRight, Home, Route, Save, X, Check } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { CalculationHistory } from '../ui/CalculationHistory';

export default function ProjectManager() {
  const { projects, activeProjectId, setActiveProjectId, addProject, deleteProject } = useProjects();
  const [view, setView] = useState<'list' | 'detail' | 'compare'>('list');
  const [viewedProjectId, setViewedProjectId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '', type: 'Residential', startDate: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;
    addProject({
       name: newProject.name,
       location: newProject.location || 'Unknown',
       type: newProject.type,
       startDate: newProject.startDate || new Date().toISOString().split('T')[0]
    });
    setIsCreating(false);
    setNewProject({ name: '', location: '', type: 'Residential', startDate: '' });
  };

  const handleView = (id: string) => {
    setViewedProjectId(id);
    setView('detail');
  };

  const toggleCompareSelect = (id: string) => {
    if (compareIds[0] === id) setCompareIds([null, compareIds[1]]);
    else if (compareIds[1] === id) setCompareIds([compareIds[0], null]);
    else if (!compareIds[0]) setCompareIds([id, compareIds[1]]);
    else if (!compareIds[1]) setCompareIds([compareIds[0], id]);
  };

  if (view === 'detail' && viewedProjectId) {
    const project = projects.find(p => p.id === viewedProjectId);
    if (!project) return <div className="p-8">Project not found</div>;
    return <ProjectDetail project={project} onBack={() => setView('list')} />;
  }

  if (view === 'compare' && compareIds[0] && compareIds[1]) {
    const p1 = projects.find(p => p.id === compareIds[0]);
    const p2 = projects.find(p => p.id === compareIds[1]);
    if (p1 && p2) return <ProjectCompare p1={p1} p2={p2} onBack={() => setView('list')} />;
  }

  const globalTotals = projects.reduce((acc, proj) => {
    let projCost = 0;
    proj.estimates.forEach(est => {
      projCost += Number(est.cost) || 0;
      if (est.materials) {
        Object.entries(est.materials).forEach(([matName, { quantity, unit }]) => {
          const key = `${matName.toLowerCase()}_${unit.toLowerCase()}`;
          if (!acc.materials[key]) acc.materials[key] = { name: matName, unit, quantity: 0 };
          acc.materials[key].quantity += quantity;
        });
      }
    });
    acc.totalCost += projCost;
    acc.projectCosts.push({ name: proj.name, cost: projCost });
    return acc;
  }, { totalCost: 0, materials: {} as Record<string, { name: string, unit: string, quantity: number }>, projectCosts: [] as { name: string, cost: number }[] });

  const topGlobalMaterials = Object.values(globalTotals.materials)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 md:p-4 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

        <div>
          <h2 className="tabular-nums flex items-center gap-3 text-xl font-semibold text-gray-900 tracking-tight mb-4">
             <div className="p-3 bg-indigo-500 text-white rounded-[24px] shadow-[0_4px_14px_rgba(99,102,241,0.39)] overflow-hidden">
               <FolderOpen className="w-8 h-8" />
             </div>
             Project Manager
          </h2>
          <p className="mt-2 text-base font-normal text-gray-600 leading-relaxed">Manage and group your calculations by project.</p>
        </div>
        <div className="flex gap-2">
           {compareIds[0] && compareIds[1] && (
             <button onClick={() => setView('compare')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-[0_4px_14px_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all animate-pulse active:scale-95 hover:-translate-y-0.5">
                Compare Selected
             </button>
           )}
           <button 
             onClick={() => setIsCreating(!isCreating)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-[0_4px_14px_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] transition-all flex items-center gap-2 active:scale-95 hover:-translate-y-0.5"
           >
             <Plus className="w-5 h-5" /> New Project
           </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform transition-all overflow-hidden">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-800">
            <Plus className="text-indigo-500" /> Create New Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <><label htmlFor="a11y-input-378" className="sr-only">e.g. Al-Hamra Tower</label>
<input id="a11y-input-378" type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full px-4 py-2.5 rounded-full border border-white/60 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none backdrop-blur-sm" required placeholder="e.g. Al-Hamra Tower" /></>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 mb-1">Location</label>
              <><label htmlFor="a11y-input-379" className="sr-only">City, Area</label>
<input id="a11y-input-379" type="text" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="w-full px-4 py-2.5 rounded-full border border-white/60 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none backdrop-blur-sm" placeholder="City, Area" /></>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} className="w-full px-4 py-2.5 rounded-[24px] border border-white/60 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none backdrop-blur-sm overflow-hidden">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Infrastructure</option>
                <option>Industrial</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <><label htmlFor="a11y-input-380" className="sr-only">Input</label>
<input id="a11y-input-380" type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full px-4 py-2.5 rounded-full border border-white/60 bg-white/50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 outline-none backdrop-blur-sm" /></>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5">Save Project</button>
            <button type="button" onClick={() => setIsCreating(false)} className="w-full px-6 py-2.5 bg-white/50 border border-white/60 text-gray-600 font-bold rounded-full hover:bg-white/80 transition shadow-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden">Cancel</button>
          </div>
        </form>
      )}

      {projects.length === 0 && !isCreating ? (
        <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 px-4 md:px-0">
          <div className="text-center space-y-4">
            {/* Animated Workflow Illustration */}
            <div className="flex justify-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-[24px] bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform transition duration-500 hover:scale-110 overflow-hidden">
                     <Building className="w-7 h-7 text-gray-900" />
                  </div>
                  <div className="flex flex-col gap-1 w-10">
                     <div className="h-1.5 bg-indigo-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-full animate-[translateX_2s_ease-in-out_infinite]" style={{ animationName: 'progress' }}></div>
                     </div>
                  </div>
                  <div className="w-16 h-16 rounded-[24px] bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 transform transition duration-500 hover:scale-110 animation-delay-200 overflow-hidden">
                     <BarChart3 className="w-7 h-7 text-gray-900" />
                  </div>
                  <div className="flex flex-col gap-1 w-10">
                     <div className="h-1.5 bg-emerald-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full animate-[translateX_2s_ease-in-out_infinite]" style={{ animationName: 'progress', animationDelay: '0.4s' }}></div>
                     </div>
                  </div>
                  <div className="w-16 h-16 rounded-[24px] bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 transform transition duration-500 hover:scale-110 animation-delay-400 overflow-hidden">
                     <FileText className="w-7 h-7 text-gray-900" />
                  </div>
               </div>
               <style>{`
                  @keyframes progress {
                     0% { transform: translateX(-100%); }
                     50% { transform: translateX(0%); }
                     100% { transform: translateX(100%); }
                  }
               `}</style>
            </div>
             
             <h3 className="tabular-nums text-lg font-medium text-gray-800 mb-4">Welcome to Project Manager</h3>
             <p className="w-full md:max-w-2xl md:mx-auto text-base font-normal text-gray-600 leading-relaxed px-4 md:px-0">
               Group your estimates, track material quantities, and manage multi-stage construction projects in one centralized dashboard.
             </p>
          </div>

          {/* 3-Step Workflow Onboarding Card */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0 relative bg-white border border-slate-200 rounded-[2rem] shadow-sm divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden mt-2">
             {[
               { icon: Plus, title: "1. Create Project", desc: "Set up a workspace for your site" },
               { icon: Play, title: "2. Run Calculations", desc: "Use estimators & save results" },
               { icon: FileText, title: "3. View Reports", desc: "Track aggregated materials & costs" }
             ].map((step, i) => (
                <div key={i} className="p-4 sm:p-8 md:p-8 flex flex-col items-center text-center bg-slate-50/30 rounded-[24px] border border-slate-200 shadow-sm text-gray-800 hover:bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-gray-800 transition cursor-default overflow-hidden">
                   <div className="w-full w-12 h-12 rounded-full border-2 border-indigo-100 flex items-center justify-center mb-4 bg-white text-indigo-600 shadow-sm overflow-hidden">
                      <step.icon className="w-5 h-5" />
                   </div>
                   <h4 className="mb-2 text-lg font-medium text-gray-800 mb-4">{step.title}</h4>
                   <p className="text-base font-normal text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
             ))}
          </div>

          {/* Setup Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 responsive-tool-grid">
             <div className="w-full bg-white border border-indigo-100 p-4 sm:p-8 rounded-[2rem] shadow-sm flex flex-col justify-center overflow-hidden">
                <h4 className="mb-1 text-lg font-medium text-gray-800 mb-4">Quick Start Templates</h4>
                <p className="mb-5 text-base font-normal text-gray-600 leading-relaxed">Begin with a predefined project framework.</p>
                <div className="space-y-3">
                   <button 
                     onClick={() => {
                        setNewProject({ name: 'My House Project', location: '', type: 'Residential', startDate: new Date().toISOString().split('T')[0] });
                        setIsCreating(true);
                     }}
                     className="w-full flex items-center justify-between p-4 group bg-slate-50 hover:bg-indigo-50 rounded-full border border-slate-100 hover:border-indigo-200 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                   >
                      <div className="flex items-center gap-4 flex-wrap">
                         <div className="w-full bg-white p-3 rounded-[24px] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform overflow-hidden">
                            <Home className="w-5 h-5 text-indigo-500" />
                         </div>
                         <div className="text-left">
                            <h5 className="font-bold text-gray-700 group-hover:text-indigo-600 transition">Start Residential Project</h5>
                            <p className="mt-0.5 text-base font-normal text-gray-600 leading-relaxed">Houses, apartments, buildings</p>
                         </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition -translate-x-2 group-hover:translate-x-0" />
                   </button>

                   <button 
                     onClick={() => {
                        setNewProject({ name: 'Highway Expansion', location: '', type: 'Infrastructure', startDate: new Date().toISOString().split('T')[0] });
                        setIsCreating(true);
                     }}
                     className="w-full flex items-center justify-between p-4 group bg-slate-50 hover:bg-emerald-50 rounded-full border border-slate-100 hover:border-emerald-200 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                   >
                      <div className="flex items-center gap-4 flex-wrap">
                         <div className="w-full bg-white p-3 rounded-[24px] shadow-sm border border-slate-100 group-hover:scale-110 transition-transform overflow-hidden">
                            <Route className="w-5 h-5 text-emerald-500" />
                         </div>
                         <div className="text-left">
                            <h5 className="font-bold text-gray-700 group-hover:text-emerald-600 transition">Start Road Project</h5>
                            <p className="mt-0.5 text-base font-normal text-gray-600 leading-relaxed">Highways, pavements, bridges</p>
                         </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition -translate-x-2 group-hover:translate-x-0" />
                   </button>
                </div>
             </div>

             <div className="w-full bg-white border p-4 sm:p-8 rounded-[2rem] shadow-lg flex flex-col justify-center text-center text-gray-900 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                   <Upload className="w-40 h-40" />
                </div>
                <div className="relative z-10 w-full">
                   <div className="w-12 h-12 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm text-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 group-hover:scale-110 transition-transform overflow-hidden">
                      <FileText className="w-6 h-6 text-slate-300" />
                   </div>
                   <h4 className="mb-2 text-lg font-medium text-gray-800 mb-4">Import Existing Data</h4>
                   <p className="mb-8 px-4 text-base font-normal text-gray-600 leading-relaxed">Restore a previously saved project from a JSON or CSV file to continue your work without losing history.</p>
                   
                   <label className="cursor-pointer inline-flex w-[80%] items-center justify-center gap-2 px-6 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-[24px] transition shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] text-sm font-medium text-gray-700 mb-1 block overflow-hidden">
                      <Upload className="w-5 h-5" /> Select File to Import
                      <><label htmlFor="a11y-input-381" className="sr-only">Input</label>
<input id="a11y-input-381" type="file" className="hidden text-base font-normal rounded-full" accept=".json,.csv" onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                            alert("Import functionality would process: " + e.target.files[0].name + " here. (Feature coming soon)");
                         }
                      }} /></>
                   </label>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <h3 className="mb-6 text-lg font-medium text-gray-800 mb-4">Portfolio Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
              <div>
                <h4 className="uppercase r mb-4 text-lg font-medium text-gray-800">Total Cost per Project</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={globalTotals.projectCosts}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} width={60} />
                      <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                      <Bar dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="uppercase r mb-4 text-lg font-medium text-gray-800">Top Material Consumption Across Portfolio</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topGlobalMaterials} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={80} />
                      <Tooltip formatter={(val: any, name: any, props: any) => [`${val.toLocaleString()} ${props.payload.unit}`, 'Quantity']} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                      <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 responsive-tool-grid">
            {projects.map((proj, idx) => {
               const isCompare = compareIds[0] === proj.id || compareIds[1] === proj.id;
             return (
            <motion.div 
              key={proj.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
              className={`group bg-white  border ${activeProjectId === proj.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 '} p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden`}
            >
              
              {isCompare && (
                 <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10">
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white pointer-events-none"></div>
                 </div>
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div>
                   <h3 className="leading-tight text-lg font-medium text-gray-800 mb-4">{proj.name}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <span className="px-2.5 py-1 bg-slate-100 text-gray-600 text-base font-medium rounded-full">{proj.type}</span>
                     {activeProjectId === proj.id && (
                       <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-base font-medium rounded-full">Active</span>
                     )}
                     {proj.memberIds.length > 1 && (
                       <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-base font-medium rounded-full">Shared</span>
                     )}
                   </div>
                 </div>
              </div>
              
              <div className="space-y-2 mb-6">
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" /> {proj.location}
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" /> Started {proj.startDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(proj.startDate)) : 'N/A'}
                 </div>
                 <div className="flex items-center gap-2 text-base font-medium">
                    <BarChart3 className="w-4 h-4" /> {proj.estimates.length} calculations saved
                 </div>
              </div>
              
              <div className="mt-auto flex flex-col gap-2">
                 <div className="flex gap-2">
                   <button onClick={() => handleView(proj.id)} className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-full transition flex justify-center items-center gap-1 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                      View Details <ChevronRight className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setActiveProjectId(activeProjectId === proj.id ? null : proj.id)} 
                     className={`px-4 py-2.5 font-bold rounded-[24px] transition ${activeProjectId === proj.id ? 'bg-slate-100 text-gray-500  ' : 'border border-indigo-200 text-indigo-600 hover:bg-indigo-50  '}`}
                     title={activeProjectId === proj.id ? "Deactivate" : "Set as Active Project"}
                   >
                     {activeProjectId === proj.id ? "Disable" : "Set Active"}
                   </button>
                 </div>
                 
                 <button 
                   onClick={() => toggleCompareSelect(proj.id)}
                   className={`w-full py-2 text-base font-medium rounded-[24px] transition-colors border ${isCompare ? 'bg-emerald-50 text-emerald-700 border-emerald-200   ' : 'bg-transparent text-slate-400 border-slate-200 hover:border-slate-300  :'}`}
                 >
                   {isCompare ? "Selected for Compare" : "Select to Compare"}
                 </button>
              </div>
            </motion.div>
             );
          })}
        </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PROJECT COMPARE VIEW
// -------------------------------------------------------------
function ProjectCompare({ p1, p2, onBack }: { p1: Project, p2: Project, onBack: () => void }) {
  const getTotals = (proj: Project) => {
     let cost = 0;
     let matCount = 0;
     const materials: Record<string, number> = {};
     proj.estimates.forEach(est => {
        cost += Number(est.cost) || 0;
        if (est.materials) {
           Object.entries(est.materials).forEach(([m, d]) => {
              if (!materials[m]) { materials[m] = 0; matCount++; }
              materials[m] += d.quantity;
           });
        }
     });
     return { cost, matCount, materials };
  };

  const t1 = getTotals(p1);
  const t2 = getTotals(p2);
  
  const allMaterialKeys = Array.from(new Set([...Object.keys(t1.materials), ...Object.keys(t2.materials)])).sort();

  return (
    <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-500 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm px-4 md:px-0">
       <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition text-base font-semibold rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
          <ChevronRight className="w-5 h-5 rotate-180" /> Back to Projects
       </button>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start responsive-tool-grid">
         
          {[p1, p2].map((proj, i) => {
            const totals = i === 0 ? t1 : t2;
            return (
         <motion.div 
           key={proj.id} 
           initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 + (i * 0.1), ease: [0.23, 1, 0.32, 1] }}
           className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
         >
            <h1 className="tabular-nums mb-6 flex items-center gap-2 text-xl font-semibold text-slate-800 tracking-tight">
               <span className="w-6 h-6 rounded-full bg-indigo-500 text-white shadow-md flex items-center justify-center text-sm">{i+1}</span>
               {proj.name}
            </h1>
            
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50/50 backdrop-blur-md rounded-[24px] border border-emerald-100/50 shadow-sm text-gray-800 rounded-[24px] overflow-hidden">
                 <p className="text-emerald-700 uppercase tracking-wider mb-1 text-base font-normal text-gray-600 leading-relaxed">Total Cost estimate</p>
                 <p className="text-xl tabular-nums tracking-tight text-emerald-600 text-base font-normal text-gray-600 leading-relaxed">${totals.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 {i === 1 && t1.cost !== 0 && (
                    <p className={`text-base font-medium ${t2.cost > t1.cost ? 'text-rose-500' : 'text-emerald-500'} mt-1`}>
                       {Math.abs(t2.cost - t1.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} difference
                    </p>
                 )}
              </div>
              
              <div className="w-full bg-white/50 border border-white/60 p-5 rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.02)] overflow-hidden">
                 <h4 className="mb-3 border-b border-slate-200/50 pb-2 text-lg font-medium text-gray-800 mb-4">Material Comparison</h4>
                 <div className="space-y-3">
                    {allMaterialKeys.map(m => {
                       const v1 = t1.materials[m] || 0;
                       const v2 = t2.materials[m] || 0;
                       const v = i === 0 ? v1 : v2;
                       const higher = (i === 0 && v1 > v2) || (i === 1 && v2 > v1);
                       return (
                          <div key={m} className="flex justify-between items-center text-sm py-1 border-b border-slate-100/50 last:border-0">
                            <span className="font-semibold text-gray-600">{m}</span>
                            <span className={`font-semibold tabular-nums tracking-tight ${higher ? 'text-indigo-600 ' : 'text-gray-700 '}`}>
                               {v > 0 ? v.toFixed(1) : '-'}
                            </span>
                          </div>
                       )
                    })}
                 </div>
              </div>
            </div>
         </motion.div>
            )})}
            
       </div>
    </div>
  );
}
function ProjectDetail({ project, onBack }: { project: Project, onBack: () => void }) {
  const { deleteEstimate, updateProject, addMember, removeMember, saveVersion } = useProjects();
  const [inflationRate, setInflationRate] = useState<number>(0);
  const [wasteFactor, setWasteFactor] = useState<number>(0);
  const [budget, setBudget] = useState<number>(project.budget || 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSaveVersion = async () => {
    const versionName = prompt("Enter a name for this version snapshot (e.g., 'Option A', 'v2'):", `${project.name} - Version`);
    if (versionName) {
      await saveVersion(project.id, versionName);
      alert(`Version '${versionName}' saved successfully. You can now compare it in the main project list.`);
    }
  };

  const uid = auth.currentUser?.uid;
  const userRole = uid ? project.roles[uid] : 'viewer';
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const canManageMembers = userRole === 'owner';

  const costMultiplier = 1 + (inflationRate / 100);
  const qtyMultiplier = 1 + (wasteFactor / 100);
  
  // Aggregate total cost
  const totalCost = project.estimates.reduce((sum, est) => sum + (Number(est.cost) || 0), 0) * costMultiplier;
  
  // Aggregate Materials
  const aggregatedMaterials: Record<string, { quantity: number; unit: string; count: number }> = {};
  project.estimates.forEach(est => {
    if (est.materials) {
      Object.entries(est.materials).forEach(([matName, { quantity, unit }]) => {
         const key = `${matName.toLowerCase()}_${unit.toLowerCase()}`;
         if (!aggregatedMaterials[key]) {
           aggregatedMaterials[key] = { quantity: 0, unit, count: 0 };
         }
         aggregatedMaterials[key].quantity += quantity * qtyMultiplier;
         aggregatedMaterials[key].count += 1;
      });
    }
  });

  // Prepare Pie Chart Data based on estimate cost categories
  const categoryCosts = project.estimates.reduce((acc, est) => {
     const cat = est.category || 'Other';
     acc[cat] = (acc[cat] || 0) + ((Number(est.cost) || 0) * costMultiplier);
     return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoryCosts).map(key => ({
     name: key,
     value: categoryCosts[key]
  }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const handleExportPDF = () => {
    alert("Exporting full project PDF...");
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteStatus("sending");
    try {
      const url = `${window.location.origin}/project?id=${project.id}&share=true`;
      const res = await fetch("/api/project/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          projectName: project.name,
          inviteLink: url
        })
      });

      if (!res.ok) throw new Error("Failed to send");
      
      setInviteStatus("success");
      setTimeout(() => {
        setIsShareModalOpen(false);
        setInviteStatus("idle");
        setInviteEmail("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setInviteStatus("error");
      setTimeout(() => setInviteStatus("idle"), 3000);
    }
  };

  const timelineData = [...project.estimates]
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(est => ({
      name: est.name,
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(est.date)),
      cost: (Number(est.cost) || 0) * costMultiplier
    }));

  const cumulativeTimelineData = timelineData.map((d, i) => ({
    ...d,
    cumulativeCost: timelineData.slice(0, i + 1).reduce((sum, item) => sum + item.cost, 0)
  }));

  const topMaterialKeys = Object.entries(aggregatedMaterials)
    .sort((a,b) => b[1].quantity - a[1].quantity)
    .slice(0, 3)
    .map(e => e[0]);

  const materialTrendData = [...project.estimates]
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(est => {
      const dataPoint: any = { 
        name: est.name,
        date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(est.date))
      };
      if (est.materials) {
        topMaterialKeys.forEach(matKey => {
           const [matName, unit] = matKey.split('_');
           let qty = 0;
           const entry = Object.entries(est.materials).find(([k,v]) => `${k.toLowerCase()}_${v.unit.toLowerCase()}` === matKey);
           if(entry) qty = entry[1].quantity * qtyMultiplier;
           dataPoint[matName.charAt(0).toUpperCase() + matName.slice(1)] = qty;
        });
      } else {
        topMaterialKeys.forEach(matKey => {
           const [matName, unit] = matKey.split('_');
           dataPoint[matName.charAt(0).toUpperCase() + matName.slice(1)] = 0;
        });
      }
      return dataPoint;
  });
  
  const chartColors = ['#6366f1', '#10b981', '#f59e0b'];

  return (
    <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-500 px-4 md:px-0">
       <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition text-base font-semibold rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
          <ChevronRight className="w-5 h-5 rotate-180" /> Back to Projects
       </button>
       
       <div className="flex flex-col lg:flex-row gap-6">
         {/* Main Summary Panel */}
         <div className="flex-1 space-y-6">
           <div className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Building className="w-48 h-48" />
             </div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="w-full px-3 py-1 bg-white/60 shadow-sm text-indigo-600 font-bold rounded-full text-xs uppercase tracking-wider mb-3 inline-block backdrop-blur-md overflow-hidden">
                         {project.type}
                      </span>
                      <h1 className="md:text-[clamp(1.75rem,5vw,2.5rem)] break-all tabular-nums mb-2 text-xl font-semibold text-slate-800 tracking-tight mb-6">{project.name}</h1>
                      <div className="flex items-center gap-4 text-gray-500 font-medium flex-wrap">
                         <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {project.location}</span>
                         <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Started {project.startDate ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(project.startDate)) : 'N/A'}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={handleSaveVersion} className="p-3 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-600 rounded-full transition shadow-[0_4px_14px_rgba(15,23,42,0.03)] backdrop-blur-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5" title="Save Version Snapshot">
                         <Save className="w-5 h-5" />
                      </button>
                      <button onClick={handleShare} className="w-full p-3 bg-white/50 hover:bg-white/80 text-gray-600 rounded-full transition shadow-[0_4px_14px_rgba(15,23,42,0.03)] backdrop-blur-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden" title="Share Project">
                         <Share2 className="w-5 h-5" />
                      </button>
                      <button onClick={handleExportPDF} className="p-3 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-600 rounded-full transition shadow-[0_4px_14px_rgba(15,23,42,0.03)] backdrop-blur-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5" title="Export PDF">
                         <Printer className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="bg-emerald-50/50 backdrop-blur-md p-5 rounded-[24px] border border-emerald-100/50 overflow-hidden">
                     <p className="text-emerald-700 uppercase tracking-wider mb-1 text-base font-normal text-gray-600 leading-relaxed">Total Estimated Cost</p>
                     <p className="text-xl tabular-nums tracking-tight text-emerald-600 text-base font-normal text-gray-600 leading-relaxed">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                   </div>
                   <div className="bg-rose-50/50 backdrop-blur-md p-5 rounded-[24px] border border-rose-100/50 overflow-hidden">
                     <p className="text-rose-700 uppercase tracking-wider mb-1 text-base font-normal text-gray-600 leading-relaxed">Total Budget</p>
                     {canEdit ? (
                       <><label htmlFor="a11y-input-382" className="sr-only">0.00</label>
<input id="a11y-input-382" 
                          type="number" inputMode="decimal" 
                          value={budget || ''} 
                          onChange={(e) => { const v = Number(e.target.value); setBudget(v); updateProject(project.id, { budget: v }); }}
                          className="w-full text-xl font-semibold tabular-nums tracking-tight text-rose-600 bg-transparent outline-none rounded-full"
                          placeholder="0.00"
                       /></>
                     ) : (
                       <p className="text-xl font-semibold tabular-nums tracking-tight text-rose-600 bg-transparent">${budget.toLocaleString()}</p>
                     )}
                   </div>
                   <div className="bg-indigo-50/50 backdrop-blur-md p-5 rounded-[24px] border border-indigo-100/50 overflow-hidden">
                     <p className="text-indigo-700 uppercase tracking-wider mb-1 text-base font-normal text-gray-600 leading-relaxed">Calculations Run</p>
                     <p className="text-xl tabular-nums tracking-tight text-indigo-600 text-base font-normal text-gray-600 leading-relaxed">{project.estimates.length}</p>
                   </div>
                   <div className="bg-amber-50/50 backdrop-blur-md p-5 rounded-[24px] border border-amber-100/50 overflow-hidden">
                     <p className="text-amber-700 uppercase tracking-wider mb-1 text-base font-normal text-gray-600 leading-relaxed">Total Materials</p>
                     <p className="text-xl tabular-nums tracking-tight text-amber-600 text-base font-normal text-gray-600 leading-relaxed">{Object.keys(aggregatedMaterials).length}</p>
                   </div>
                </div>

                {budget > 0 && (
                  <div className="w-full mt-6 bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-sm overflow-hidden">
                      <div className="flex justify-between mb-2">
                        <p className="text-base font-normal text-gray-600 leading-relaxed">Remaining Budget: <span className={totalCost > budget ? "text-rose-500" : "text-emerald-500"}>${(budget - totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                        <p className="text-base font-normal text-gray-600 leading-relaxed">{((totalCost / budget) * 100).toFixed(1)}% Spent</p>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div className={`h-full transition-all duration-700 ease-in-out ${totalCost > budget ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${Math.min((totalCost / budget) * 100, 100)}%` }}></div>
                      </div>
                  </div>
                )}

                {project.estimates.length > 0 && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200/50 responsive-tool-grid">
                   <div>
                      <h3 className="mb-6 text-lg font-medium text-gray-800 mb-4">Cumulative Cost Trend</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cumulativeTimelineData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} width={60} />
                               <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                               <Line type="monotone" dataKey="cumulativeCost" name="Cumulative Cost" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   
                   <div>
                      <h3 className="mb-6 text-lg font-medium text-gray-800 mb-4">Key Materials Consumption</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={materialTrendData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={40} />
                               <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                               <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                               {topMaterialKeys.map((key, i) => {
                                  const [matName] = key.split('_');
                                  const name = matName.charAt(0).toUpperCase() + matName.slice(1);
                                  return <Bar key={key} dataKey={name} fill={chartColors[i % chartColors.length]} radius={[4, 4, 0, 0]} maxBarSize={40} />;
                               })}
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
                )}
             </div>
           </div>

           {/* Global Adjustments / Executive Variables */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
             className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
           >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 tracking-tight">
                 Global Macro Adjustments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 mb-1">Cost Inflation / Contingency: <span className="text-indigo-600">{inflationRate}%</span></label>
                    <><label htmlFor="a11y-input-383" className="sr-only">Input</label>
<input id="a11y-input-383" type="range" min="0" max="30" step="1" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} className="w-full accent-indigo-600 rounded-full" /></>
                    <p className="mt-1 text-base font-normal text-gray-600 leading-relaxed">Applies an automatic price hike to all historical estimates.</p>
                 </div>
                 <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 mb-1">Material Waste Factor: <span className="text-amber-600">{wasteFactor}%</span></label>
                    <><label htmlFor="a11y-input-384" className="sr-only">Input</label>
<input id="a11y-input-384" type="range" min="0" max="25" step="1" value={wasteFactor} onChange={e => setWasteFactor(Number(e.target.value))} className="w-full accent-amber-600 rounded-full" /></>
                    <p className="mt-1 text-base font-normal text-gray-600 leading-relaxed">Uniformly bumps all BOQ material quantities.</p>
                 </div>
              </div>
           </motion.div>

           {/* Timeline & Operations */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
             className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
           >
              <h2 className="mb-6 text-xl font-semibold text-gray-900 tracking-tight mb-4">Calculation Timeline</h2>
              {project.estimates.length === 0 ? (
                 <div className="text-center py-10 text-slate-400 font-medium bg-slate-50/50 rounded-[24px] shadow-sm text-gray-800 rounded-[24px] border border-dashed border-slate-200/60 overflow-hidden">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No calculation results saved to this project yet.
                 </div>
              ) : (
                <div className="space-y-4">
                  {project.estimates.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((est, idx) => (
                    <div key={est.id} className="w-full flex items-start gap-4 p-4 rounded-[24px] hover:bg-white/60 transition group border border-transparent hover:border-white/80 shadow-[0_4px_14px_rgba(15,23,42,0.02)] overflow-hidden flex-wrap">
                       <div className="flex flex-col items-center mt-1">
                         <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                         {idx !== project.estimates.length - 1 && <div className="w-0.5 h-full bg-slate-200/60 my-1"></div>}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-lg font-medium text-gray-800 mb-4">{est.name}</h4>
                            <span className="text-base font-medium text-indigo-600">${((Number(est.cost) || 0) * costMultiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <p className="mb-2 text-base font-normal text-gray-600 leading-relaxed">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(est.date))} • {est.category}</p>
                          
                          {/* Mini material preview */}
                          {est.materials && Object.keys(est.materials).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                               {Object.entries(est.materials).slice(0, 4).map(([mat, data]) => (
                                 <span key={mat} className="w-full px-2 py-1 bg-white/60 border border-white/80 text-gray-600 rounded text-base font-medium shadow-[0_2px_8px_rgba(15,23,42,0.02)] overflow-hidden">
                                   {mat}: {(data.quantity * qtyMultiplier).toFixed(1)} {data.unit}
                                 </span>
                               ))}
                               {Object.keys(est.materials).length > 4 && (
                                 <span className="w-full px-2 py-1 bg-white/60 border border-white/80 text-gray-500 rounded text-base font-medium shadow-[0_2px_8px_rgba(15,23,42,0.02)] overflow-hidden">
                                   +{Object.keys(est.materials).length - 4} more
                                 </span>
                               )}
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </motion.div>

           {/* Resource Allocation Timeline */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
             className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
           >
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">Resource Allocation Timeline</h2>
              <p className="text-base font-normal text-gray-600 leading-relaxed mb-6">Visualize when materials and labour are needed on site based on your saved calculations.</p>
              
              {project.estimates.length === 0 ? (
                 <div className="text-center py-10 text-slate-400 font-medium bg-slate-50/50 rounded-[24px] shadow-sm text-gray-800 border border-dashed border-slate-200/60 overflow-hidden">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No calculation results saved to generate a timeline.
                 </div>
              ) : (
                <div className="overflow-x-auto hide-scrollbar pb-4 relative">
                   <div className="absolute top-[28px] left-0 w-full h-1 bg-slate-200/60 rounded-full z-0"></div>
                   <div className="min-w-[800px] flex gap-6 relative z-10 flex-wrap">
                     {project.estimates.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((est, idx) => (
                       <div key={est.id} className="flex-1 min-w-[280px]">
                         <div className="flex flex-col items-center mb-4">
                           <div className="w-5 h-5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] border-4 border-white mb-2 z-10"></div>
                           <div className="text-base font-medium text-indigo-600">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(est.date))}</div>
                         </div>
                         <div className="w-full bg-white border border-slate-200 rounded-[24px] p-5 shadow-[0_4px_14px_rgba(15,23,42,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden">
                           <h4 className="font-semibold text-gray-800 mb-1 truncate" title={est.name}>{est.name}</h4>
                           <p className="text-xs text-gray-500 mb-4">{est.category || 'General Task'}</p>
                           
                           <div className="space-y-3">
                             <div>
                               <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Key Materials Needed</div>
                               {est.materials && Object.keys(est.materials).length > 0 ? (
                                 <div className="space-y-2">
                                   {Object.entries(est.materials).slice(0, 3).map(([mat, data]) => (
                                     <div key={mat} className="flex justify-between items-center text-sm">
                                       <span className="text-gray-600 truncate max-w-[120px]">{mat}</span>
                                       <span className="font-semibold text-gray-800">{(data.quantity * qtyMultiplier).toFixed(1)} <span className="text-xs text-gray-500">{data.unit}</span></span>
                                     </div>
                                   ))}
                                   {Object.keys(est.materials).length > 3 && (
                                     <div className="text-xs text-indigo-500 font-medium pt-1">
                                       +{Object.keys(est.materials).length - 3} more items
                                     </div>
                                   )}
                                 </div>
                               ) : (
                                 <div className="text-sm text-gray-400 italic">No materials specified</div>
                               )}
                             </div>
                             
                             <div className="pt-3 border-t border-slate-100">
                               <div className="flex justify-between items-center">
                                 <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Est. Task Cost</span>
                                 <span className="text-base font-medium text-emerald-600">${((Number(est.cost) || 0) * costMultiplier).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
           </motion.div>
         </div>

         {/* Sidebar Summary */}
         <div className="w-full lg:w-80 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
            >
               <h3 className="mb-4 text-lg font-medium text-gray-800">Cost Breakdown</h3>
               {pieData.length > 0 ? (
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic border border-dashed rounded-[24px] border-slate-200/60 bg-white/30 overflow-hidden">No data</div>
               )}
               
               <div className="space-y-3 mt-4">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                         <span className="font-medium text-gray-600">{d.name}</span>
                       </div>
                       <span className="font-bold text-gray-800">${d.value.toLocaleString('en-US')}</span>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
            >
               <h3 className="mb-4 text-lg font-medium text-gray-800">Workspace Members</h3>
               <div className="space-y-3 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                 {project.memberIds.map(memberUid => (
                   <div key={memberUid} className="flex justify-between items-center py-2 border-b border-slate-100/50 last:border-0">
                     <div className="flex flex-col">
                       <span className="font-bold text-sm text-gray-700 truncate max-w-[150px]">{project.memberEmails?.[memberUid] || 'User'}</span>
                       <span className="text-xs text-gray-500 capitalize">{project.roles[memberUid]}</span>
                     </div>
                     {canManageMembers && project.roles[memberUid] !== 'owner' && (
                       <button onClick={() => {
                         if (window.confirm('Remove this member?')) {
                           removeMember(project.id, memberUid).catch(e => alert(e.message));
                         }
                       }} className="text-rose-500 hover:text-rose-600 text-base font-medium px-2 py-1 bg-rose-50 rounded rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Remove</button>
                     )}
                   </div>
                 ))}
               </div>
               {canManageMembers && (
                 <div className="mt-4 pt-4 border-t border-slate-200/50">
                   <button onClick={() => {
                     const email = window.prompt("Enter member's email address:");
                     if (email) {
                       const role = window.prompt("Enter role (editor or viewer):", "editor");
                       if (role === 'editor' || role === 'viewer') {
                         addMember(project.id, email, role as 'editor'|'viewer').catch(e => alert(e.message));
                       } else {
                         alert("Invalid role. Must be 'editor' or 'viewer'.");
                       }
                     }
                   }} className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-bold text-sm transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
                     <Plus className="w-4 h-4" /> Add Member
                   </button>
                 </div>
               )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className="w-full bg-white/40 backdrop-blur-xl border border-white/60 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
            >
               <h3 className="mb-4 text-lg font-medium text-gray-800">Aggregated Materials</h3>
               <div className="space-y-3 max-h-80 overflow-y-auto pr-2 hide-scrollbar">
                  {Object.entries(aggregatedMaterials).length === 0 ? (
                     <p className="text-base font-normal text-gray-600 leading-relaxed">No materials calculated.</p>
                  ) : (
                     Object.entries(aggregatedMaterials).map(([key, data]) => {
                        const [name, _] = key.split('_');
                        return (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100/50 last:border-0">
                             <div className="flex flex-col">
                               <span className="font-bold text-sm text-gray-700 capitalize">{name}</span>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="font-semibold tabular-nums tracking-tight text-indigo-600">{data.quantity.toFixed(1)} {data.unit}</span>
                             </div>
                          </div>
                        )
                     })
                  )}
               </div>
            </motion.div>
         </div>
       </div>
    
      <CalculationHistory
        calculatorId="project_manager"
        estimationName="Project Summary"
        currentInputs={{}}
      />

      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-[2rem] p-4 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Share Project</h2>
                  <p className="text-sm text-slate-500">Invite collaborators via email</p>
                </div>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    disabled={inviteStatus === "sending" || inviteStatus === "success"}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={inviteStatus === "sending" || inviteStatus === "success"}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {inviteStatus === "sending" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Invite...
                    </span>
                  ) : inviteStatus === "success" ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-5 h-5" /> Sent Successfully
                    </span>
                  ) : inviteStatus === "error" ? (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Failed to Send
                    </span>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  );
}
