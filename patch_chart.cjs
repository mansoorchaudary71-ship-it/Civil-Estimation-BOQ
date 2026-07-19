const fs = require('fs');
let file = fs.readFileSync('src/components/modules/ConstructionCostSummary.tsx', 'utf8');

const importTarget = `import { CostTrendChart } from "./CostTrendChart";`;
const importReplacement = `import { CostTrendChart } from "./CostTrendChart";
import { CostBreakdownChart } from "./CostBreakdownChart";`;

file = file.replace(importTarget, importReplacement);

const jsxTarget = `              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatCurrency(value, false)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    content={(props: any) => {
                      const { payload } = props;
                      return (
                        <ul className="flex flex-wrap justify-center gap-4 mt-8 mb-2">
                          {payload.map((entry: any, index: number) => (
                            <li key={\`item-\${index}\`} className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                              <span className="text-slate-800 font-medium text-sm">{entry.value}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>`;

const jsxReplacement = `              <CostBreakdownChart data={chartData} formatCurrency={formatCurrency} />`;

if (file.includes(jsxTarget)) {
  file = file.replace(jsxTarget, jsxReplacement);
  fs.writeFileSync('src/components/modules/ConstructionCostSummary.tsx', file);
  console.log("Patched successfully");
} else {
  console.log("Could not find JSX block. Look at it:");
  console.log(file.substring(file.indexOf('<ResponsiveContainer'), file.indexOf('</ResponsiveContainer>') + 22));
}
