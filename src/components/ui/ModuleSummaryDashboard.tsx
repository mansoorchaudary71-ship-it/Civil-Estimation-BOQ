import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, BarChart2, TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

export default function ModuleSummaryDashboard({ moduleId }: { moduleId: string }) {
  const [data, setData] = useState<{ inputs: any[]; outputs: any[] }>({ inputs: [], outputs: [] });
  const [previousData, setPreviousData] = useState<{ sumInputs: number, sumOutputs: number } | null>(null);
  const [varianceData, setVarianceData] = useState<any[]>([]);

  useEffect(() => {
    // A simple heuristic to extract numeric data from the module for visualization
    const extractData = () => {
      const inputsList: any[] = [];
      const outputsList: any[] = [];

      // Find inputs
      const inputs = document.querySelectorAll('.global-form-card-wrapper input');
      inputs.forEach((input) => {
        const val = parseFloat((input as HTMLInputElement).value);
        if (!isNaN(val) && val > 0) {
          // try to find label
          let name = `Input ${inputsList.length + 1}`;
          const id = input.id;
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label && label.textContent) {
              name = label.textContent.trim().replace(/[:\*]/g, '');
            } else {
              name = id.replace(/[-_]/g, ' ');
            }
          }
          // Cap string length
          if (name.length > 15) name = name.substring(0, 15) + '...';
          inputsList.push({ name, value: val, rawId: id });
        }
      });

      // Find possible outputs (looking for text containing numbers inside elements usually used for results)
      const possibleOutputs = document.querySelectorAll('.global-form-card-wrapper .text-xl, .global-form-card-wrapper .text-2xl, .global-form-card-wrapper .font-bold.text-emerald-600, .global-form-card-wrapper .font-bold.text-blue-600');
      
      const seenValues = new Set<number>();
      possibleOutputs.forEach((el) => {
        const text = el.textContent || '';
        // Extract first number
        const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/);
        if (match) {
          const val = parseFloat(match[0]);
          if (!isNaN(val) && val > 0 && !seenValues.has(val)) {
             seenValues.add(val);
             let name = `Result ${outputsList.length + 1}`;
             // Try to find previous sibling or parent text to use as label
             const parentText = el.parentElement?.textContent?.replace(text, '').trim();
             if (parentText && parentText.length > 3 && parentText.length < 30) {
                name = parentText;
             }
             if (name.length > 15) name = name.substring(0, 15) + '...';
             outputsList.push({ name, value: val });
          }
        }
      });

      // Limit items
      setData({ 
        inputs: inputsList.slice(-8), 
        outputs: outputsList.slice(-8) 
      });
    };

    // Extract initially and set up observer to re-extract on DOM changes
    setTimeout(extractData, 1000);
    const observer = new MutationObserver(() => {
      // Debounce slightly
      setTimeout(extractData, 300);
    });
    
    const wrapper = document.querySelector('.global-form-card-wrapper');
    if (wrapper) {
      observer.observe(wrapper, { childList: true, subtree: true, characterData: true });
    }
    
    return () => observer.disconnect();
  }, [moduleId]);

  useEffect(() => {
    // Fetch previous estimate from localStorage to compare trends
    try {
      const saved = localStorage.getItem(`calc_history_${moduleId}`);
      if (saved) {
        const history = JSON.parse(saved);
        if (history && history.length > 0) {
          const mostRecent = history[0];
          let sumIn = 0;
          if (mostRecent.inputs) {
            Object.values(mostRecent.inputs).forEach((v: any) => {
              if (typeof v === 'number' && !isNaN(v)) sumIn += v;
              if (typeof v === 'string') {
                const parsed = parseFloat(v);
                if (!isNaN(parsed)) sumIn += parsed;
              }
            });
          }
          let sumOut = 0;
          if (mostRecent.results) {
            Object.values(mostRecent.results).forEach((v: any) => {
              if (typeof v === 'number' && !isNaN(v)) sumOut += v;
              if (typeof v === 'string') {
                const parsed = parseFloat(v.replace(/,/g, ''));
                if (!isNaN(parsed)) sumOut += parsed;
              }
            });
          }
          if (sumIn > 0 || sumOut > 0) {
            setPreviousData({ sumInputs: sumIn, sumOutputs: sumOut });
          }

          if (mostRecent.inputs && data.inputs.length > 0) {
            const vData: any[] = [];
            data.inputs.forEach((input: any) => {
              let prevValue = 0;
              if (input.rawId && mostRecent.inputs[input.rawId] !== undefined) {
                 const v = mostRecent.inputs[input.rawId];
                 prevValue = typeof v === 'number' ? v : parseFloat(v);
              } else {
                 const v = mostRecent.inputs[input.name];
                 if (v !== undefined) {
                     prevValue = typeof v === 'number' ? v : parseFloat(v);
                 } else {
                    const matchedKey = Object.keys(mostRecent.inputs).find(k => k.toLowerCase().includes(input.name.toLowerCase().replace('...', '')) || input.name.toLowerCase().includes(k.toLowerCase()));
                    if (matchedKey) {
                        const mv = mostRecent.inputs[matchedKey];
                        prevValue = typeof mv === 'number' ? mv : parseFloat(mv);
                    }
                 }
              }
              if (isNaN(prevValue)) prevValue = 0;
              
              if (prevValue > 0 && input.value !== prevValue) {
                  vData.push({
                      name: input.name,
                      current: input.value,
                      previous: prevValue,
                      diff: input.value - prevValue,
                  });
              }
            });
            setVarianceData(vData);
          }
        }
      }
    } catch(e) {
      console.error("Failed to parse previous module history for trend data", e);
    }
  }, [moduleId, data.inputs]);

  if (data.inputs.length === 0 && data.outputs.length === 0) return null;

  const currentSumInputs = data.inputs.reduce((acc, item) => acc + item.value, 0);
  const currentSumOutputs = data.outputs.reduce((acc, item) => acc + item.value, 0);

  const renderTrend = (current: number, previous: number) => {
    if (!previous || previous === 0 || current === 0) return null;
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    
    if (Math.abs(percent) < 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ml-2">
          Stable
        </span>
      );
    }
    
    const isUp = percent > 0;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ml-2 ${isUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
        {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(percent).toFixed(1)}% vs last save
      </span>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm print:hidden mt-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Distribution Summary</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Live visualization of current parameters vs computed outputs</p>
          </div>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 ${varianceData.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
        {data.inputs.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Input Parameter Distribution
              </h4>
              {previousData && renderTrend(currentSumInputs, previousData.sumInputs)}
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.inputs}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.inputs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [new Intl.NumberFormat().format(Number(value)), "Value"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {varianceData.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Input Variance vs Last
              </h4>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varianceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={10}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => {
                      if (Math.abs(val) >= 1000) return `${(val/1000).toFixed(1)}k`;
                      return val.toString();
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: any, name: any) => [new Intl.NumberFormat().format(Number(value)), name === "diff" ? "Difference" : name]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="diff" radius={[4, 4, 4, 4]}>
                    {varianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.diff > 0 ? '#10b981' : entry.diff < 0 ? '#f43f5e' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {data.outputs.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                Computed Outputs (Log Scale)
              </h4>
              {previousData && renderTrend(currentSumOutputs, previousData.sumOutputs)}
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.outputs} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    dy={10}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis 
                    scale="log" 
                    domain={['auto', 'auto']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val/1000000).toFixed(1)}M`;
                      if (val >= 1000) return `${(val/1000).toFixed(1)}k`;
                      return val.toString();
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value) => [new Intl.NumberFormat().format(Number(value)), "Result"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {data.outputs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
