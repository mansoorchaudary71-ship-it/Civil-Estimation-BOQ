import { Button } from '../ui/Button';
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
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 md:p-4 sm:p-8 rounded-2xl shadow-brand-sm overflow-hidden">

        <div>
          <h2 className="tabular-nums flex items-center gap-3 text-xl font-semibold text-txt-primary tracking-tight mb-4">
             <div className="p-3 bg-ink text-white rounded-2xl shadow-brand-sm overflow-hidden">
               <FolderOpen className="w-8 h-8" />
             </div>
             Project Manager
          </h2>
          <p className="mt-2 text-base font-normal text-txt-secondary leading-relaxed">Manage and group your calculations by project.</p>
        </div>
        <div className="flex gap-2">
           {compareIds[0] && compareIds[1] && (
             <Button onClick={() => setView('compare')} className="bg-ui-successText hover:bg-ui-successText text-white px-6 py-3 rounded-full font-bold shadow-brand-sm hover:shadow-brand-sm transition-all animate-pulse active:scale-95 hover:-translate-y-0.5">
                Compare Selected
             </Button>
           )}
           <Button 
             onClick={() => setIsCreating(!isCreating)}
             className="bg-ink hover:bg-ink-700 text-white px-6 py-3 rounded-full font-bold shadow-brand-sm hover:shadow-brand-sm transition-all flex items-center gap-2 active:scale-95 hover:-translate-y-0.5"
           >
             <Plus className="w-5 h-5" /> New Project
           </Button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm transform transition-all overflow-hidden">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-txt-primary">
            <Plus className="text-accent-800" /> Create New Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-name" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary ml-1">Project Name <span className="text-ui-errorText" aria-hidden="true">*</span></label>
              <input id="proj-name" type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-ink focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium text-txt-primary placeholder:text-txt-tertiary" required placeholder="e.g. Al-Hamra Tower" />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-location" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary ml-1">Location <span className="text-ui-errorText" aria-hidden="true">*</span></label>
              <input id="proj-location" type="text" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-ink focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium text-txt-primary placeholder:text-txt-tertiary" required placeholder="City, Area" />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-type" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary ml-1">Type <span className="text-ui-errorText" aria-hidden="true">*</span></label>
              <select id="proj-type" value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-ink focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium text-txt-primary">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Infrastructure</option>
                <option>Industrial</option>
              </select>
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-date" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary ml-1">Start Date <span className="text-ui-errorText" aria-hidden="true">*</span></label>
              <input id="proj-date" type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-ink focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium text-txt-primary" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="px-6 py-2.5 bg-ink text-white rounded-full hover:bg-ink-700 transition shadow-brand-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5">Save Project</Button>
            <Button type="button" onClick={() => setIsCreating(false)} className="w-full px-6 py-2.5 bg-surface-default/50 border border-ui-borderSubtle text-txt-secondary font-bold rounded-full hover:bg-surface-default/80 transition shadow-brand-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden">Cancel</Button>
          </div>
        </form>
      )}

      {projects.length === 0 && !isCreating ? (
        <div className="flex flex-col gap-8 w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 px-4 md:px-0">
          <div className="text-center space-y-4">
            {/* Animated Workflow Illustration */}
            <div className="flex justify-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center shadow-brand-lg shadow-accent-500/20 transform transition duration-500 hover:scale-110 overflow-hidden">
                     <Building className="w-7 h-7 text-txt-primary" />
                  </div>
                  <div className="flex flex-col gap-1 w-10">
                     <div className="h-1.5 bg-accent-500/30 rounded-full overflow-hidden">
                        <div className="h-full bg-ink w-full animate-[translateX_2s_ease-in-out_infinite]" style={{ animationName: 'progress' }}></div>
                     </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-ui-successText flex items-center justify-center shadow-brand-lg shadow-ui-successText/20 transform transition duration-500 hover:scale-110 animation-delay-200 overflow-hidden">
                     <BarChart3 className="w-7 h-7 text-txt-primary" />
                  </div>
                  <div className="flex flex-col gap-1 w-10">
                     <div className="h-1.5 bg-ui-successText/30 rounded-full overflow-hidden">
                        <div className="h-full bg-ui-successText w-full animate-[translateX_2s_ease-in-out_infinite]" style={{ animationName: 'progress', animationDelay: '0.4s' }}></div>
                     </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center shadow-brand-lg shadow-accent-500/20 transform transition duration-500 hover:scale-110 animation-delay-400 overflow-hidden">
                     <FileText className="w-7 h-7 text-txt-primary" />
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
             
             <h3 className="tabular-nums text-lg font-medium text-txt-primary mb-4">Welcome to Project Manager</h3>
             <p className="w-full md:max-w-2xl md:mx-auto text-base font-normal text-txt-secondary leading-relaxed px-4 md:px-0">
               Group your estimates, track material quantities, and manage multi-stage construction projects in one centralized dashboard.
             </p>
          </div>

          {/* 3-Step Workflow Onboarding Card */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0 relative bg-surface-default border border-ui-borderSubtle rounded-2xl shadow-brand-sm divide-y md:divide-y-0 md:divide-x divide-border-color overflow-hidden mt-2">
             {[
               { icon: Plus, title: "1. Create Project", desc: "Set up a workspace for your site" },
               { icon: Play, title: "2. Run Calculations", desc: "Use estimators & save results" },
               { icon: FileText, title: "3. View Reports", desc: "Track aggregated materials & costs" }
             ].map((step, i) => (
                <div key={i} className="p-4 sm:p-8 md:p-8 flex flex-col items-center text-center bg-surface-hover/30 rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary hover:bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary transition cursor-default overflow-hidden">
                   <div className="w-full w-12 h-12 rounded-full border-2 border-accent-100 flex items-center justify-center mb-4 bg-surface-default text-accent-800 shadow-brand-sm overflow-hidden">
                      <step.icon className="w-5 h-5" />
                   </div>
                   <h4 className="mb-2 text-lg font-medium text-txt-primary mb-4">{step.title}</h4>
                   <p className="text-base font-normal text-txt-secondary leading-relaxed">{step.desc}</p>
                </div>
             ))}
          </div>

          {/* Setup Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 responsive-tool-grid">
             <div className="w-full bg-surface-default border border-accent-100 p-4 sm:p-8 rounded-2xl shadow-brand-sm flex flex-col justify-center overflow-hidden">
                <h4 className="mb-1 text-lg font-medium text-txt-primary mb-4">Quick Start Templates</h4>
                <p className="mb-5 text-base font-normal text-txt-secondary leading-relaxed">Begin with a predefined project framework.</p>
                <div className="space-y-3">
                   <Button 
                     onClick={() => {
                        setNewProject({ name: 'My House Project', location: '', type: 'Residential', startDate: new Date().toISOString().split('T')[0] });
                        setIsCreating(true);
                     }}
                     className="w-full flex items-center justify-between p-4 group bg-surface-hover hover:bg-accent-50 rounded-full border border-border-color hover:border-accent-200 transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                   >
                      <div className="flex items-center gap-4 flex-wrap">
                         <div className="w-full bg-surface-default p-3 rounded-2xl shadow-brand-sm border border-border-color group-hover:scale-110 transition-transform overflow-hidden">
                            <Home className="w-5 h-5 text-accent-800" />
                         </div>
                         <div className="text-left">
                            <h5 className="font-bold text-txt-secondary group-hover:text-accent-800 transition">Start Residential Project</h5>
                            <p className="mt-0.5 text-base font-normal text-txt-secondary leading-relaxed">Houses, apartments, buildings</p>
                         </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-txt-tertiary group-hover:text-accent-800 transition -translate-x-2 group-hover:translate-x-0" />
                   </Button>

                   <Button 
                     onClick={() => {
                        setNewProject({ name: 'Highway Expansion', location: '', type: 'Infrastructure', startDate: new Date().toISOString().split('T')[0] });
                        setIsCreating(true);
                     }}
                     className="w-full flex items-center justify-between p-4 group bg-surface-hover hover:bg-ui-success rounded-full border border-border-color hover:border-ui-successBorder transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm"
                   >
                      <div className="flex items-center gap-4 flex-wrap">
                         <div className="w-full bg-surface-default p-3 rounded-2xl shadow-brand-sm border border-border-color group-hover:scale-110 transition-transform overflow-hidden">
                            <Route className="w-5 h-5 text-ui-successText" />
                         </div>
                         <div className="text-left">
                            <h5 className="font-bold text-txt-secondary group-hover:text-ui-successText transition">Start Road Project</h5>
                            <p className="mt-0.5 text-base font-normal text-txt-secondary leading-relaxed">Highways, pavements, bridges</p>
                         </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-txt-tertiary group-hover:text-ui-successText transition -translate-x-2 group-hover:translate-x-0" />
                   </Button>
                </div>
             </div>

             <div className="w-full bg-surface-default border p-4 sm:p-8 rounded-2xl shadow-brand-lg flex flex-col justify-center text-center text-txt-primary relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                   <Upload className="w-40 h-40" />
                </div>
                <div className="relative z-10 w-full">
                   <div className="w-12 h-12 bg-surface-hover rounded-2xl border border-ui-borderSubtle shadow-brand-sm text-txt-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color group-hover:scale-110 transition-transform overflow-hidden">
                      <FileText className="w-6 h-6 text-txt-tertiary" />
                   </div>
                   <h4 className="mb-2 text-lg font-medium text-txt-primary mb-4">Import Existing Data</h4>
                   <p className="mb-8 px-4 text-base font-normal text-txt-secondary leading-relaxed">Restore a previously saved project from a JSON or CSV file to continue your work without losing history.</p>
                   
                   <label className="cursor-pointer inline-flex w-[80%] items-center justify-center gap-2 px-6 py-4 bg-ink hover:bg-accent-400 text-white rounded-2xl transition shadow-brand-sm hover:shadow-brand-sm text-sm font-medium text-txt-secondary mb-1 block overflow-hidden">
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
          <div className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden">
            <h3 className="mb-6 text-lg font-medium text-txt-primary mb-4">Portfolio Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 responsive-tool-grid">
              <div>
                <h4 className="uppercase r mb-4 text-lg font-medium text-txt-primary">Total Cost per Project</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={globalTotals.projectCosts}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E4DE" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} width={60} />
                      <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} contentStyle={{ borderRadius: '16px', border: '1px solid #E7E4DE', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F4F2EE', opacity: 0.5 }} />
                      <Bar dataKey="cost" fill="#F2A413" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="uppercase r mb-4 text-lg font-medium text-txt-primary">Top Material Consumption Across Portfolio</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topGlobalMaterials} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E4DE" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} width={80} />
                      <Tooltip formatter={(val: any, name: any, props: any) => [`${val.toLocaleString()} ${props.payload.unit}`, 'Quantity']} contentStyle={{ borderRadius: '16px', border: '1px solid #E7E4DE', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F4F2EE', opacity: 0.5 }} />
                      <Bar dataKey="quantity" fill="#1F1D1A" radius={[0, 4, 4, 0]} maxBarSize={30} />
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
              className={`group bg-surface-default  border ${activeProjectId === proj.id ? 'border-ink ring-1 ring-accent-500' : 'border-ui-borderSubtle '} p-6 rounded-2xl shadow-brand-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden`}
            >
              
              {isCompare && (
                 <div className="absolute top-0 right-0 w-16 h-16 bg-ui-successText/10">
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-ui-successText flex items-center justify-center border-2 border-white pointer-events-none"></div>
                 </div>
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div>
                   <h3 className="leading-tight text-lg font-medium text-txt-primary mb-4">{proj.name}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <span className="px-2.5 py-1 bg-surface-hover text-txt-secondary text-base font-medium rounded-full">{proj.type}</span>
                     {activeProjectId === proj.id && (
                       <span className="px-2.5 py-1 bg-accent-100 text-accent-800 text-base font-medium rounded-full">Active</span>
                     )}
                     {proj.memberIds.length > 1 && (
                       <span className="px-2.5 py-1 bg-accent-100 text-accent-800 text-base font-medium rounded-full">Shared</span>
                     )}
                   </div>
                 </div>
              </div>
              
              <div className="space-y-2 mb-6">
                 <div className="flex items-center gap-2 text-sm text-txt-tertiary">
                    <MapPin className="w-4 h-4" /> {proj.location}
                 </div>
                 <div className="flex items-center gap-2 text-sm text-txt-tertiary">
                    <Calendar className="w-4 h-4" /> Started {proj.startDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(proj.startDate)) : 'N/A'}
                 </div>
                 <div className="flex items-center gap-2 text-base font-medium">
                    <BarChart3 className="w-4 h-4" /> {proj.estimates.length} calculations saved
                 </div>
              </div>
              
              <div className="mt-auto flex flex-col gap-2">
                 <div className="flex gap-2">
                   <Button onClick={() => handleView(proj.id)} className="flex-1 py-2.5 bg-accent-50 text-accent-800 hover:bg-accent-100 font-bold rounded-full transition flex justify-center items-center gap-1 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
                      View Details <ChevronRight className="w-4 h-4" />
                   </Button>
                   <Button 
                     onClick={() => setActiveProjectId(activeProjectId === proj.id ? null : proj.id)} 
                     className={`px-4 py-2.5 font-bold rounded-2xl transition ${activeProjectId === proj.id ? 'bg-surface-hover text-txt-tertiary  ' : 'border border-accent-200 text-accent-800 hover:bg-accent-50  '}`}
                     title={activeProjectId === proj.id ? "Deactivate" : "Set as Active Project"}
                   >
                     {activeProjectId === proj.id ? "Disable" : "Set Active"}
                   </Button>
                 </div>
                 
                 <Button 
                   onClick={() => toggleCompareSelect(proj.id)}
                   className={`w-full py-2 text-base font-medium rounded-2xl transition-colors border ${isCompare ? 'bg-ui-success text-ui-successText border-ui-successBorder   ' : 'bg-transparent text-txt-tertiary border-ui-borderSubtle hover:border-ui-borderDefault  :'}`}
                 >
                   {isCompare ? "Selected for Compare" : "Select to Compare"}
                 </Button>
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
    <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-500 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm px-4 md:px-0">
       <Button onClick={onBack} className="flex items-center gap-2 text-txt-tertiary hover:text-accent-800 transition text-base font-semibold rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
          <ChevronRight className="w-5 h-5 rotate-180" /> Back to Projects
       </Button>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start responsive-tool-grid">
         
          {[p1, p2].map((proj, i) => {
            const totals = i === 0 ? t1 : t2;
            return (
         <motion.div 
           key={proj.id} 
           initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 + (i * 0.1), ease: [0.23, 1, 0.32, 1] }}
           className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-8 rounded-2xl shadow-brand-sm overflow-hidden"
         >
            <h1 className="tabular-nums mb-6 flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight">
               <span className="w-6 h-6 rounded-full bg-ink text-white shadow-brand-md flex items-center justify-center text-sm">{i+1}</span>
               {proj.name}
            </h1>
            
            <div className="space-y-6">
              <div className="p-4 bg-ui-success/50 backdrop-blur-md rounded-2xl border border-ui-successBorder/50 shadow-brand-sm text-txt-primary rounded-2xl overflow-hidden">
                 <p className="text-ui-successText uppercase tracking-wider mb-1 text-base font-normal text-txt-secondary leading-relaxed">Total Cost estimate</p>
                 <p className="text-xl tabular-nums tracking-tight text-ui-successText text-base font-normal text-txt-secondary leading-relaxed">${totals.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                 {i === 1 && t1.cost !== 0 && (
                    <p className={`text-base font-medium ${t2.cost > t1.cost ? 'text-ui-errorText' : 'text-ui-successText'} mt-1`}>
                       {Math.abs(t2.cost - t1.cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} difference
                    </p>
                 )}
              </div>
              
              <div className="w-full bg-surface-default/50 border border-ui-borderSubtle p-5 rounded-2xl shadow-brand-sm overflow-hidden">
                 <h4 className="mb-3 border-b border-ui-borderSubtle/50 pb-2 text-lg font-medium text-txt-primary mb-4">Material Comparison</h4>
                 <div className="space-y-3">
                    {allMaterialKeys.map(m => {
                       const v1 = t1.materials[m] || 0;
                       const v2 = t2.materials[m] || 0;
                       const v = i === 0 ? v1 : v2;
                       const higher = (i === 0 && v1 > v2) || (i === 1 && v2 > v1);
                       return (
                          <div key={m} className="flex justify-between items-center text-sm py-1 border-b border-border-color/50 last:border-0">
                            <span className="font-semibold text-txt-secondary">{m}</span>
                            <span className={`font-semibold tabular-nums tracking-tight ${higher ? 'text-accent-800 ' : 'text-txt-secondary '}`}>
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
  const COLORS = ['#F2A413', '#1F1D1A', '#B07006', '#6B6862', '#0F766E', '#F2A413'];

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
  
  const chartColors = ['#F2A413', '#1F1D1A', '#B07006'];

  return (
    <div className="w-full max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-500 px-4 md:px-0">
       <Button onClick={onBack} className="flex items-center gap-2 text-txt-tertiary hover:text-accent-800 transition text-base font-semibold rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
          <ChevronRight className="w-5 h-5 rotate-180" /> Back to Projects
       </Button>
       
       <div className="flex flex-col lg:flex-row gap-6">
         {/* Main Summary Panel */}
         <div className="flex-1 space-y-6">
           <div className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-8 rounded-2xl shadow-brand-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Building className="w-48 h-48" />
             </div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                   <div>
                      <span className="w-full px-3 py-1 bg-surface-default/60 shadow-brand-sm text-accent-800 font-bold rounded-full text-xs uppercase tracking-wider mb-3 inline-block backdrop-blur-md overflow-hidden">
                         {project.type}
                      </span>
                      <h1 className="md:text-[clamp(1.75rem,5vw,2.5rem)] break-all tabular-nums mb-2 text-xl font-semibold text-txt-primary tracking-tight mb-6">{project.name}</h1>
                      <div className="flex items-center gap-4 text-txt-tertiary font-medium flex-wrap">
                         <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {project.location}</span>
                         <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Started {project.startDate ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(project.startDate)) : 'N/A'}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button onClick={handleSaveVersion} className="p-3 bg-ui-success/50 hover:bg-ui-success/60 text-ui-successText rounded-full transition shadow-brand-sm backdrop-blur-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5" title="Save Version Snapshot">
                         <Save className="w-5 h-5" />
                      </Button>
                      <Button onClick={handleShare} className="w-full p-3 bg-surface-default/50 hover:bg-surface-default/80 text-txt-secondary rounded-full transition shadow-brand-sm backdrop-blur-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5 overflow-hidden" title="Share Project">
                         <Share2 className="w-5 h-5" />
                      </Button>
                      <Button onClick={handleExportPDF} className="p-3 bg-accent-50/50 hover:bg-accent-100/60 text-accent-800 rounded-full transition shadow-brand-sm backdrop-blur-md text-base font-semibold transition-all duration-300 active:scale-95 hover:-translate-y-0.5" title="Export PDF">
                         <Printer className="w-5 h-5" />
                      </Button>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="bg-ui-success/50 backdrop-blur-md p-5 rounded-2xl border border-ui-successBorder/50 overflow-hidden">
                     <p className="text-ui-successText uppercase tracking-wider mb-1 text-base font-normal text-txt-secondary leading-relaxed">Total Estimated Cost</p>
                     <p className="text-xl tabular-nums tracking-tight text-ui-successText text-base font-normal text-txt-secondary leading-relaxed">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                   </div>
                   <div className="bg-ui-error/50 backdrop-blur-md p-5 rounded-2xl border border-ui-errorBorder/50 overflow-hidden">
                     <p className="text-ui-errorText uppercase tracking-wider mb-1 text-base font-normal text-txt-secondary leading-relaxed">Total Budget</p>
                     {canEdit ? (
                       <><label htmlFor="a11y-input-382" className="sr-only">0.00</label>
<input id="a11y-input-382" 
                          type="number" inputMode="decimal" 
                          value={budget || ''} 
                          onChange={(e) => { const v = Number(e.target.value); setBudget(v); updateProject(project.id, { budget: v }); }}
                          className="w-full text-xl font-semibold tabular-nums tracking-tight text-ui-errorText bg-transparent outline-none rounded-full"
                          placeholder="0.00"
                       /></>
                     ) : (
                       <p className="text-xl font-semibold tabular-nums tracking-tight text-ui-errorText bg-transparent">${budget.toLocaleString()}</p>
                     )}
                   </div>
                   <div className="bg-accent-50/50 backdrop-blur-md p-5 rounded-2xl border border-accent-100/50 overflow-hidden">
                     <p className="text-accent-800 uppercase tracking-wider mb-1 text-base font-normal text-txt-secondary leading-relaxed">Calculations Run</p>
                     <p className="text-xl tabular-nums tracking-tight text-accent-800 text-base font-normal text-txt-secondary leading-relaxed">{project.estimates.length}</p>
                   </div>
                   <div className="bg-accent-50/50 backdrop-blur-md p-5 rounded-2xl border border-accent-100/50 overflow-hidden">
                     <p className="text-accent-800 uppercase tracking-wider mb-1 text-base font-normal text-txt-secondary leading-relaxed">Total Materials</p>
                     <p className="text-xl tabular-nums tracking-tight text-accent-800 text-base font-normal text-txt-secondary leading-relaxed">{Object.keys(aggregatedMaterials).length}</p>
                   </div>
                </div>

                {budget > 0 && (
                  <div className="w-full mt-6 bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden">
                      <div className="flex justify-between mb-2">
                        <p className="text-base font-normal text-txt-secondary leading-relaxed">Remaining Budget: <span className={totalCost > budget ? "text-ui-errorText" : "text-ui-successText"}>${(budget - totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                        <p className="text-base font-normal text-txt-secondary leading-relaxed">{((totalCost / budget) * 100).toFixed(1)}% Spent</p>
                      </div>
                      <div className="w-full bg-surface-hover rounded-full h-4 overflow-hidden">
                        <div className={`h-full transition-all duration-700 ease-in-out ${totalCost > budget ? "bg-ui-errorText" : "bg-ui-successText"}`} style={{ width: `${Math.min((totalCost / budget) * 100, 100)}%` }}></div>
                      </div>
                  </div>
                )}

                {project.estimates.length > 0 && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-ui-borderSubtle/50 responsive-tool-grid">
                   <div>
                      <h3 className="mb-6 text-lg font-medium text-txt-primary mb-4">Cumulative Cost Trend</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cumulativeTimelineData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E4DE" />
                               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} width={60} />
                               <Tooltip formatter={(val: any) => `$${val.toLocaleString()}`} contentStyle={{ borderRadius: '16px', border: '1px solid #E7E4DE', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                               <Line type="monotone" dataKey="cumulativeCost" name="Cumulative Cost" stroke="#F2A413" strokeWidth={3} dot={{ r: 4, fill: '#F2A413', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   
                   <div>
                      <h3 className="mb-6 text-lg font-medium text-txt-primary mb-4">Key Materials Consumption</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={materialTrendData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E4DE" />
                               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} dy={10} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6862' }} width={40} />
                               <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E7E4DE', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F4F2EE', opacity: 0.5 }} />
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
             className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden"
           >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-txt-primary tracking-tight">
                 Global Macro Adjustments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Cost Inflation / Contingency: <span className="text-accent-800">{inflationRate}%</span></label>
                    <><label htmlFor="a11y-input-383" className="sr-only">Input</label>
<input id="a11y-input-383" type="range" min="0" max="30" step="1" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} className="w-full accent-accent-600 rounded-full" /></>
                    <p className="mt-1 text-base font-normal text-txt-secondary leading-relaxed">Applies an automatic price hike to all historical estimates.</p>
                 </div>
                 <div>
                    <label className="block mb-2 text-sm font-medium text-txt-secondary mb-1">Material Waste Factor: <span className="text-accent-800">{wasteFactor}%</span></label>
                    <><label htmlFor="a11y-input-384" className="sr-only">Input</label>
<input id="a11y-input-384" type="range" min="0" max="25" step="1" value={wasteFactor} onChange={e => setWasteFactor(Number(e.target.value))} className="w-full accent-accent-600 rounded-full" /></>
                    <p className="mt-1 text-base font-normal text-txt-secondary leading-relaxed">Uniformly bumps all BOQ material quantities.</p>
                 </div>
              </div>
           </motion.div>

           {/* Timeline & Operations */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
             className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-8 rounded-2xl shadow-brand-sm overflow-hidden"
           >
              <h2 className="mb-6 text-xl font-semibold text-txt-primary tracking-tight mb-4">Calculation Timeline</h2>
              {project.estimates.length === 0 ? (
                 <div className="text-center py-10 text-txt-tertiary font-medium bg-surface-hover/50 rounded-2xl shadow-brand-sm text-txt-primary rounded-2xl border border-dashed border-ui-borderSubtle/60 overflow-hidden">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No calculation results saved to this project yet.
                 </div>
              ) : (
                <div className="space-y-4">
                  {project.estimates.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((est, idx) => (
                    <div key={est.id} className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-surface-default/60 transition group border border-transparent hover:border-white/80 shadow-brand-sm overflow-hidden flex-wrap">
                       <div className="flex flex-col items-center mt-1">
                         <div className="w-3 h-3 rounded-full bg-ink shadow-brand-sm"></div>
                         {idx !== project.estimates.length - 1 && <div className="w-0.5 h-full bg-surface-active/60 my-1"></div>}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-lg font-medium text-txt-primary mb-4">{est.name}</h4>
                            <span className="text-base font-medium text-accent-800">${((Number(est.cost) || 0) * costMultiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <p className="mb-2 text-base font-normal text-txt-secondary leading-relaxed">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(est.date))} • {est.category}</p>
                          
                          {/* Mini material preview */}
                          {est.materials && Object.keys(est.materials).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                               {Object.entries(est.materials).slice(0, 4).map(([mat, data]) => (
                                 <span key={mat} className="w-full px-2 py-1 bg-surface-default/60 border border-white/80 text-txt-secondary rounded text-base font-medium shadow-brand-sm overflow-hidden">
                                   {mat}: {(data.quantity * qtyMultiplier).toFixed(1)} {data.unit}
                                 </span>
                               ))}
                               {Object.keys(est.materials).length > 4 && (
                                 <span className="w-full px-2 py-1 bg-surface-default/60 border border-white/80 text-txt-tertiary rounded text-base font-medium shadow-brand-sm overflow-hidden">
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
             className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-8 rounded-2xl shadow-brand-sm overflow-hidden"
           >
              <h2 className="text-xl font-semibold text-txt-primary tracking-tight mb-6">Resource Allocation Timeline</h2>
              <p className="text-base font-normal text-txt-secondary leading-relaxed mb-6">Visualize when materials and labour are needed on site based on your saved calculations.</p>
              
              {project.estimates.length === 0 ? (
                 <div className="text-center py-10 text-txt-tertiary font-medium bg-surface-hover/50 rounded-2xl shadow-brand-sm text-txt-primary border border-dashed border-ui-borderSubtle/60 overflow-hidden">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    No calculation results saved to generate a timeline.
                 </div>
              ) : (
                <div className="overflow-x-auto hide-scrollbar pb-4 relative">
                   <div className="absolute top-[28px] left-0 w-full h-1 bg-surface-active/60 rounded-full z-0"></div>
                   <div className="min-w-[800px] flex gap-6 relative z-10 flex-wrap">
                     {project.estimates.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((est, idx) => (
                       <div key={est.id} className="flex-1 min-w-[280px]">
                         <div className="flex flex-col items-center mb-4">
                           <div className="w-5 h-5 rounded-full bg-ink shadow-brand-sm border-4 border-white mb-2 z-10"></div>
                           <div className="text-base font-medium text-accent-800">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(est.date))}</div>
                         </div>
                         <div className="w-full bg-surface-default border border-ui-borderSubtle rounded-2xl p-5 shadow-brand-sm hover:shadow-brand-lg hover:-translate-y-1 transition-all overflow-hidden">
                           <h4 className="font-semibold text-txt-primary mb-1 truncate" title={est.name}>{est.name}</h4>
                           <p className="text-xs text-txt-tertiary mb-4">{est.category || 'General Task'}</p>
                           
                           <div className="space-y-3">
                             <div>
                               <div className="text-xs uppercase tracking-wider font-bold text-txt-tertiary mb-2">Key Materials Needed</div>
                               {est.materials && Object.keys(est.materials).length > 0 ? (
                                 <div className="space-y-2">
                                   {Object.entries(est.materials).slice(0, 3).map(([mat, data]) => (
                                     <div key={mat} className="flex justify-between items-center text-sm">
                                       <span className="text-txt-secondary truncate max-w-[120px]">{mat}</span>
                                       <span className="font-semibold text-txt-primary">{(data.quantity * qtyMultiplier).toFixed(1)} <span className="text-xs text-txt-tertiary">{data.unit}</span></span>
                                     </div>
                                   ))}
                                   {Object.keys(est.materials).length > 3 && (
                                     <div className="text-xs text-accent-800 font-medium pt-1">
                                       +{Object.keys(est.materials).length - 3} more items
                                     </div>
                                   )}
                                 </div>
                               ) : (
                                 <div className="text-sm text-txt-tertiary italic">No materials specified</div>
                               )}
                             </div>
                             
                             <div className="pt-3 border-t border-border-color">
                               <div className="flex justify-between items-center">
                                 <span className="text-xs uppercase tracking-wider font-bold text-txt-tertiary">Est. Task Cost</span>
                                 <span className="text-base font-medium text-ui-successText">${((Number(est.cost) || 0) * costMultiplier).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
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
              className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden"
            >
               <h3 className="mb-4 text-lg font-medium text-txt-primary">Cost Breakdown</h3>
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
                 <div className="h-48 flex items-center justify-center text-txt-tertiary text-sm italic border border-dashed rounded-2xl border-ui-borderSubtle/60 bg-surface-default/30 overflow-hidden">No data</div>
               )}
               
               <div className="space-y-3 mt-4">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex justify-between items-center text-sm">
                       <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                         <span className="font-medium text-txt-secondary">{d.name}</span>
                       </div>
                       <span className="font-bold text-txt-primary">${d.value.toLocaleString('en-US')}</span>
                    </div>
                  ))}
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden"
            >
               <h3 className="mb-4 text-lg font-medium text-txt-primary">Workspace Members</h3>
               <div className="space-y-3 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                 {project.memberIds.map(memberUid => (
                   <div key={memberUid} className="flex justify-between items-center py-2 border-b border-border-color/50 last:border-0">
                     <div className="flex flex-col">
                       <span className="font-bold text-sm text-txt-secondary truncate max-w-[150px]">{project.memberEmails?.[memberUid] || 'User'}</span>
                       <span className="text-xs text-txt-tertiary capitalize">{project.roles[memberUid]}</span>
                     </div>
                     {canManageMembers && project.roles[memberUid] !== 'owner' && (
                       <Button onClick={() => {
                         if (window.confirm('Remove this member?')) {
                           removeMember(project.id, memberUid).catch(e => alert(e.message));
                         }
                       }} className="text-ui-errorText hover:text-ui-errorText text-base font-medium px-2 py-1 bg-ui-error rounded rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Remove</Button>
                     )}
                   </div>
                 ))}
               </div>
               {canManageMembers && (
                 <div className="mt-4 pt-4 border-t border-ui-borderSubtle/50">
                   <Button onClick={() => {
                     const email = window.prompt("Enter member's email address:");
                     if (email) {
                       const role = window.prompt("Enter role (editor or viewer):", "editor");
                       if (role === 'editor' || role === 'viewer') {
                         addMember(project.id, email, role as 'editor'|'viewer').catch(e => alert(e.message));
                       } else {
                         alert("Invalid role. Must be 'editor' or 'viewer'.");
                       }
                     }
                   }} className="w-full flex items-center justify-center gap-2 py-2 bg-accent-50 text-accent-800 hover:bg-accent-100 rounded-full font-bold text-sm transition transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">
                     <Plus className="w-4 h-4" /> Add Member
                   </Button>
                 </div>
               )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
              className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-brand-sm overflow-hidden"
            >
               <h3 className="mb-4 text-lg font-medium text-txt-primary">Aggregated Materials</h3>
               <div className="space-y-3 max-h-80 overflow-y-auto pr-2 hide-scrollbar">
                  {Object.entries(aggregatedMaterials).length === 0 ? (
                     <p className="text-base font-normal text-txt-secondary leading-relaxed">No materials calculated.</p>
                  ) : (
                     Object.entries(aggregatedMaterials).map(([key, data]) => {
                        const [name, _] = key.split('_');
                        return (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-border-color/50 last:border-0">
                             <div className="flex flex-col">
                               <span className="font-bold text-sm text-txt-secondary capitalize">{name}</span>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="font-semibold tabular-nums tracking-tight text-accent-800">{data.quantity.toFixed(1)} {data.unit}</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-surface-default rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <Button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-hover text-txt-tertiary transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent-50 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-accent-800" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-txt-primary">Share Project</h2>
                  <p className="text-sm text-txt-tertiary">Invite collaborators via email</p>
                </div>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="invite-email" className="text-sm font-bold text-txt-primary dark:text-txt-tertiary ml-1">
                    Email Address <span className="text-ui-errorText" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="email"
                    id="invite-email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface-default border-2 border-ui-borderSubtle dark:border-ink-600 focus:border-ink focus:ring-4 focus:ring-accent-500/10 outline-none transition-all font-medium text-txt-primary placeholder:text-txt-tertiary"
                    disabled={inviteStatus === "sending" || inviteStatus === "success"}
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={inviteStatus === "sending" || inviteStatus === "success"}
                  isLoading={inviteStatus === "sending"}
                  loadingText="Sending Invite..."
                  className="w-full py-3 px-4 bg-ink hover:bg-ink-700 text-white font-semibold rounded-xl shadow-brand-lg shadow-accent-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {inviteStatus === "success" ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Invite Sent
                    </span>
                  ) : (
                    'Send Invitation'
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  );
}
