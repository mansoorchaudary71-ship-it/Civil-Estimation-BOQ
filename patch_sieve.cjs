const fs = require('fs');

let file = fs.readFileSync('src/components/calculators/PavementMixGradation.tsx', 'utf-8');

file = file.replace(
  "import { Layers, Activity, AlertTriangle, CheckCircle, SlidersHorizontal, Download, Printer } from 'lucide-react';",
  "import { Layers, Activity, AlertTriangle, CheckCircle, SlidersHorizontal, Download, Printer, Plus } from 'lucide-react';"
);

// We need to inject new state vars:
const stateInjection = `  const [dynamicSieves, setDynamicSieves] = useState<number[]>([...sieveSizes]);
  const [dynamicSpecs, setDynamicSpecs] = useState<any>(JSON.parse(JSON.stringify(specifications)));
  const [newSieve, setNewSieve] = useState<string>('');

  const handleAddSieve = () => {
    const val = parseFloat(newSieve);
    if (!isNaN(val) && val > 0 && !dynamicSieves.includes(val)) {
      setDynamicSieves([...dynamicSieves, val]);
      
      // Add default 100% passing for new sieve
      setAggA([...aggA, 100]);
      setAggB([...aggB, 100]);
      setAggC([...aggC, 100]);
      
      // Add default null specs
      const newSpecs = { ...dynamicSpecs };
      Object.keys(newSpecs).forEach(p => {
        newSpecs[p as MixPreset] = [...newSpecs[p as MixPreset], { sieve: val, min: null, max: null }];
      });
      setDynamicSpecs(newSpecs);
      setNewSieve('');
    }
  };`;

file = file.replace(
  "  const [aggA, setAggA] = useState<number[]>([...initialAggregates.aggA]);",
  stateInjection + "\n\n  const [aggA, setAggA] = useState<number[]>([...initialAggregates.aggA]);"
);

// Replace `specifications[preset]` with `dynamicSpecs[preset]`
file = file.replace(
  "const specs = specifications[preset];",
  "const specs = dynamicSpecs[preset];"
);

// Replace `sieveSizes.map` with `dynamicSieves.map`
file = file.replace(
  "const chartData = sieveSizes.map((sieve, index) => {",
  "const chartData = dynamicSieves.map((sieve, index) => {"
);
file = file.replace(
  "const spec = specifications[preset][index];",
  "const spec = dynamicSpecs[preset][index];"
);

// Add the custom sieve form UI
const uiInjection = `            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex items-end gap-3 max-w-sm">
               <div className="flex-1">
                 <label className="block text-xs font-medium text-slate-400 mb-1">Add Custom Sieve (mm)</label>
                 <input 
                   type="number"
                   value={newSieve}
                   onChange={(e) => setNewSieve(e.target.value)}
                   placeholder="e.g. 12.5"
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
               </div>
               <button 
                 onClick={handleAddSieve}
                 className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors h-[38px]"
               >
                 <Plus size={16} /> Add Sieve
               </button>
            </div>`;

file = file.replace(
  `              </table>
            </div>
          </div>`,
  `              </table>
            </div>${uiInjection}
          </div>`
);

fs.writeFileSync('src/components/calculators/PavementMixGradation.tsx', file);
console.log("Patched sieves!");
