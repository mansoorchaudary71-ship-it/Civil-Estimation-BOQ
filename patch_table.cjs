const fs = require('fs');

let file = fs.readFileSync('src/components/calculators/PavementMixGradation.tsx', 'utf-8');

file = file.replace(
  '<th className="pb-3 px-2 font-medium">Spec Range</th>\n                    <th className="pb-3 px-2 font-medium">Blended %</th>',
  '<th className="pb-3 px-2 font-medium">Lower Bound</th>\n                    <th className="pb-3 px-2 font-medium">Combined Mix</th>\n                    <th className="pb-3 px-2 font-medium">Upper Bound</th>'
);

file = file.replace(
  `<td className="py-3 px-2 text-slate-400">
                        {row.min !== null || row.max !== null 
                          ? \`\${row.min ?? 0} - \${row.max ?? 100}\` 
                          : '-'}
                      </td>
                      <td className="py-3 px-2 font-bold text-purple-300">{row.blended.toFixed(1)}%</td>`,
  `<td className="py-3 px-2 text-slate-400">
                        {row.min !== null ? row.min : '-'}
                      </td>
                      <td className="py-3 px-2 font-bold text-purple-300">{row.blended.toFixed(1)}%</td>
                      <td className="py-3 px-2 text-slate-400">
                        {row.max !== null ? row.max : '-'}
                      </td>`
);

fs.writeFileSync('src/components/calculators/PavementMixGradation.tsx', file);
console.log("Patched table");
