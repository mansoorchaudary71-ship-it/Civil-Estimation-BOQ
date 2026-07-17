const fs = require('fs');

let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

// Add BarChart imports
content = content.replace(
  "import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';",
  "import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';"
);

// Add icons
content = content.replace(
  "import { Layers, FolderPlus, CheckCircle, ChevronDown, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';",
  "import { Layers, FolderPlus, CheckCircle, ChevronDown, RefreshCw, Sparkles, ArrowRight, PieChart as PieChartIcon, BarChart2 as BarChartIcon } from 'lucide-react';"
);

// Add state
content = content.replace(
  "const [isRecalculating, setIsRecalculating] = useState(false);",
  "const [isRecalculating, setIsRecalculating] = useState(false);\n  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');"
);

// Replace visual breakdown header and chart
const chartJSX = `
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                    <h4 className="uppercase text-lg font-medium text-gray-800 dark:text-gray-100">
                      Visual Breakdown
                    </h4>
                    <div className="flex items-center bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-lg">
                      <button
                        onClick={() => setChartType('donut')}
                        className={\`p-1.5 rounded-md transition-all \${chartType === 'donut' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}\`}
                        title="Donut Chart"
                      >
                        <PieChartIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setChartType('bar')}
                        className={\`p-1.5 rounded-md transition-all \${chartType === 'bar' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}\`}
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
                              <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
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
                              <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
`;

// Replace from `<h4` to `</div>` (the closing of `h-[250px] w-full`)
content = content.replace(
  /<h4 className="border-b border-slate-200 dark:border-slate-700 dark: uppercase st pb-3 mb-4 text-lg font-medium text-gray-800">\s*Visual Breakdown\s*<\/h4>\s*<div className="h-\[250px\] w-full">[\s\S]*?<\/ResponsiveContainer>\s*<\/div>/,
  chartJSX
);

fs.writeFileSync('src/components/ui/MaterialSummary.tsx', content);
