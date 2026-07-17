import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Layers, FolderPlus, CheckCircle, ChevronDown, RefreshCw, Sparkles, ArrowRight, PieChart as PieChartIcon, BarChart2 as BarChartIcon } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { useCountUp } from '../../hooks/useCountUp';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ALL_MODULES } from '../Dashboard';

export interface MaterialSummaryProps {
  title?: string;
  subtitle?: string;
  totalValue: string | number;
  totalUnit?: string;
  totalLabel?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  items?: any[];
  onUpdateRate?: () => void;
  showRates?: boolean;
  onRecalculate?: () => void;
  relatedToolIds?: string[];
}

import { useSettings } from '../../context/SettingsContext';
import { getImperialConversion } from '../../utils/autoConverter';

const COLORS = ['#6B46C1', '#F97316', '#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6'];

function extractNumeric(str: string | number) {
  const s = String(str).replace(/,/g, '');
  const match = s.match(/-?[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function MaterialSummary({
  title = "MATERIAL SUMMARY",
  subtitle,
  totalValue,
  totalUnit,
  totalLabel,
  icon,
  children,
  className = "",
  items = [],
  onRecalculate,
  relatedToolIds = [],
}: MaterialSummaryProps) {
  const { projects, activeProjectId, addEstimateToProject, canEditProject } = useProjects();
  const { settings } = useSettings();
  const isImperial = settings.measurement === 'FPS';
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const activeProj = projects.find(p => p.id === activeProjectId);
  const editableProjects = projects.filter(p => canEditProject(p.id));
  const canEditActive = activeProj ? canEditProject(activeProj.id) : false;
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const conversion = getImperialConversion(totalUnit);
  const applyConversion = isImperial && conversion;
  const displayUnit = applyConversion ? conversion.targetUnit : totalUnit;

  // Animate totalValue
  let rawTotalValue = extractNumeric(totalValue);
  if (applyConversion && conversion) {
     rawTotalValue = rawTotalValue * conversion.multiplyBy;
  }
  const totalValueStr = String(totalValue);
  const prefix = totalValueStr.includes('Rs') ? 'Rs ' : totalValueStr.includes('$') ? '$' : '';
  const animatedTotal = useCountUp(rawTotalValue, 1000);
  
  const handleRecalculate = () => {
    setIsRecalculating(true);
    if (onRecalculate) onRecalculate();
    setTimeout(() => setIsRecalculating(false), 800);
  };

  const controls = useAnimation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Initial mount animation is handled by framer motion initial/animate props
    // We only want to trigger this when calculation updates after mount
    if (hasMounted) {
      controls.start({
        opacity: [0.6, 1],
        y: [10, 0],
        transition: { duration: 0.4, ease: "easeOut" }
      });
    } else {
      setHasMounted(true);
    }
  }, [totalValue, items, controls, hasMounted]);

  const { extractedMaterials, chartData } = useMemo(() => {
    const materials: Record<string, { quantity: number; unit: string }> = {};
    const chart: { name: string; value: any }[] = [];
    
    // Quick helper to recursively parse React children
    const parseChildren = (node: React.ReactNode) => {
        React.Children.forEach(node, child => {
          if (!React.isValidElement(child)) return;
          
          if (typeof child.type === 'function' || typeof child.type === 'object') {
             const props: any = child.props;
             if (props && props.title && props.value !== undefined) {
                // Determine unit
                let unit = props.unit || 'units';
                if (!unit && props.title.toLowerCase().includes('cost')) unit = '$';
                
                const valStr = String(props.value).replace(/,/g, '').replace(/[a-zA-Z]/g, '');
                let num = parseFloat(valStr) || 0;
                
                const unitConversion = getImperialConversion(unit);
                if (isImperial && unitConversion) {
                   num = num * unitConversion.multiplyBy;
                   unit = unitConversion.targetUnit;
                }

                materials[props.title] = { quantity: num, unit };
                
                // Only add to chart if it's substantial and not a sum/total string
                if (num > 0 && !props.title.toLowerCase().includes('total')) {
                   chart.push({ name: props.title, value: num });
                }
             }
             if (props.children) parseChildren(props.children);
          } else if (child.props && (child.props as any).children) {
             parseChildren((child.props as any).children);
          }
       });
    };
    
    parseChildren(children);
    return { extractedMaterials: materials, chartData: chart };
  }, [children, isImperial]);

  const handleSave = (projectId: string) => {
    let parsedCost = 0;
    const costStr = String(totalValue).replace(/,/g, '').replace(/[^\d.-]/g, '');
    parsedCost = parseFloat(costStr) || 0;

    addEstimateToProject(projectId, {
       toolId: window.location.pathname,
       name: title,
       cost: parsedCost,
       materials: extractedMaterials,
       category: 'Estimate'
    });
    
    setSaveStatus('saved');
    setShowProjectSelect(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // Find related tools
  const relatedModules = ALL_MODULES.filter(m => relatedToolIds.includes(m.id)).slice(0, 3);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`w-[calc(100%+1.5rem)] -ml-3 md:w-full md:ml-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-[4px] border-l-[#6B46C1] rounded-[24px] md:rounded-[32px] p-4 sm:p-6 md:p-8 overflow-visible relative shadow-sm ${className}`}
    >
      {/* Header section with Save button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-[#6B46C1] dark:text-[#8b5cf6] rounded-xl shadow-sm border border-purple-100 dark:border-purple-800/50">
            {icon || <Layers className="w-4 h-4 flex-shrink-0" />}
          </div>
          <h3 className="uppercase text-[11px] sm:text-xs font-black tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
            {title}
          </h3>
        </div>

        {/* Global Save to Project Button */}
        {editableProjects.length > 0 && (
          <div className="relative">
            {saveStatus === 'saved' ? (
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all">
                 <CheckCircle className="w-4 h-4" /> Saved to Project
              </span>
            ) : canEditActive && !showProjectSelect ? (
              <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-sm hover:shadow transition-shadow">
                 <button onClick={() => handleSave(activeProj!.id)} className="flex items-center gap-2 text-[#6B46C1] dark:text-[#8b5cf6] font-bold text-xs sm:text-sm px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                    <FolderPlus className="w-4 h-4" /> Save to: {activeProj!.name}
                 </button>
                 <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 my-auto mx-1"></div>
                 <button aria-label="Move Down" onClick={() => setShowProjectSelect(true)} className="px-2 text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                 </button>
              </div>
            ) : (
               <div className="absolute right-0 top-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl w-64 p-2 z-50">
                 <div className="flex justify-between items-center mb-2 px-2 pt-1">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Project</span>
                   <button aria-label="Move Down" onClick={() => setShowProjectSelect(false)} className="text-slate-400 hover:text-gray-600"><ChevronDown className="w-4 h-4 rotate-180" /></button>
                 </div>
                 {editableProjects.map(p => (
                    <button key={p.id} onClick={() => handleSave(p.id)} className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-[#6B46C1] dark:hover:text-[#8b5cf6] rounded-lg transition-colors mb-1 truncate">
                       {p.name}
                    </button>
                 ))}
               </div>
            )}
          </div>
        )}
      </div>

      {/* Animated Results Area */}
      <motion.div animate={controls}>
        {/* Hero Total Section */}
        <div className="mb-10 relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            {totalLabel && (
              <p className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">{totalLabel}</p>
            )}
            <div className="flex flex-row items-baseline flex-wrap gap-x-2 gap-y-1 max-w-full overflow-hidden">
              <span className="text-[clamp(2.5rem,8vw,4.5rem)] leading-none font-black tracking-tighter bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent break-words max-w-full">
                {prefix}{animatedTotal.toLocaleString('en-US', { minimumFractionDigits: prefix === 'Rs ' ? 0 : 2, maximumFractionDigits: prefix === 'Rs ' ? 0 : 2 })}
              </span>
              <div className="flex flex-col text-left shrink-0">
                {displayUnit && (
                  <span className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300">{displayUnit}</span>
                )}
                {subtitle && (
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{subtitle}</span>
                )}
              </div>
            </div>
          </div>

          {onRecalculate && (
            <button 
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-300 rounded-xl transition-all disabled:opacity-50 text-base font-semibold"
            >
              <RefreshCw className={`w-5 h-5 ${isRecalculating ? 'animate-spin' : ''}`} />
              Recalculate Values
              <span className="ml-1 text-[10px] font-medium opacity-70 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded px-1.5 py-0.5 hidden sm:inline-block pointer-events-none">Ctrl+Enter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {children}
          </div>
          
          {/* Visual Summary Column */}
          {(chartData.length > 0 || relatedModules.length > 0) && (
            <div className="flex flex-col gap-6">
              {chartData.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                    <h4 className="uppercase text-[11px] sm:text-xs font-black text-slate-500 dark:text-slate-400 tracking-[0.2em]">
                      Visual Breakdown
                    </h4>
                    <div className="flex items-center bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-lg">
                      <button
                        onClick={() => setChartType('donut')}
                        className={`p-1.5 rounded-md transition-all ${chartType === 'donut' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        title="Donut Chart"
                      >
                        <PieChartIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setChartType('bar')}
                        className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                        title="Bar Chart"
                      >
                        <BarChartIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'donut' ? (
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: any) => value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend 
                            layout="vertical"
                            verticalAlign="bottom"
                            wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                          />
                        </PieChart>
                      ) : (
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(value) => {
                              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                              if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                              return value;
                            }}
                          />
                          <RechartsTooltip 
                            formatter={(value: any) => value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f1f5f9' }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                </div>
              )}

              {relatedModules.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 sm:p-6 border border-indigo-100 dark:border-indigo-800/50 overflow-hidden">
                  <h4 className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100 uppercase mb-5 text-[11px] font-black tracking-[0.2em]">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Similar Tools
                  </h4>
                  <div className="flex flex-col gap-3">
                    {relatedModules.map(mod => (
                      <button 
                        key={mod.id}
                        onClick={() => window.location.href = `/?tool=${mod.id}`}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl border border-indigo-100 dark:border-indigo-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                            <mod.icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{mod.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px] mt-0.5">{mod.desc}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
