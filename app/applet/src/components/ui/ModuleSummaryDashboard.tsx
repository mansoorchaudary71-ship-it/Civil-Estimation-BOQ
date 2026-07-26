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
import { Activity, BarChart2 } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];

export default function ModuleSummaryDashboard({ moduleId }: { moduleId: string }) {
  const [data, setData] = useState<{ inputs: any[]; outputs: any[] }>({ inputs: [], outputs: [] });

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
          inputsList.push({ name, value: val });
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

  if (data.inputs.length === 0 && data.outputs.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Distribution Summary</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live visualization of current parameters vs computed outputs</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.inputs.length > 0 && (
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Input Parameter Distribution
            </h4>
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
                    formatter={(value: any) => [new Intl.NumberFormat().format(value), "Value"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {data.outputs.length > 0 && (
          <div className="flex flex-col">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              Computed Outputs (Log Scale)
            </h4>
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
                      return val;
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: any) => [new Intl.NumberFormat().format(value), "Result"]}
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
