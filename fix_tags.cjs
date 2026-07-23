const fs = require('fs');
let file = fs.readFileSync('src/components/calculators/PavementMixGradation.tsx', 'utf-8');

file = file.replace(
  `              </table>
            </div>
            </div>
                        
            <div className="mt-6 pt-6 border-t border-white/10 flex items-end gap-3 max-w-sm">`,
  `              </table>
            </div>
                        
            <div className="mt-6 pt-6 border-t border-white/10 flex items-end gap-3 max-w-sm">`
);

fs.writeFileSync('src/components/calculators/PavementMixGradation.tsx', file);
console.log("Fixed tags");
