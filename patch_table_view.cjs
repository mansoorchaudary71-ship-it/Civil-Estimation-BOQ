const fs = require('fs');
let file = fs.readFileSync('src/components/modules/ConstructionCostSummary.tsx', 'utf8');

// 1. Add List, LayoutGrid imports
const importTarget = `import { Download, PieChart as PieChartIcon, DollarSign, Settings2, Home } from "lucide-react";`;
const importReplacement = `import { Download, PieChart as PieChartIcon, DollarSign, Settings2, Home, List, LayoutGrid } from "lucide-react";`;
file = file.replace(importTarget, importReplacement);

// 2. Add state for isTableView
const stateTarget = `const [totalArea, setTotalArea] = useState<number>(2000);`;
const stateReplacement = `const [totalArea, setTotalArea] = useState<number>(2000);
  const [isTableView, setIsTableView] = useState<boolean>(false);`;
file = file.replace(stateTarget, stateReplacement);

// 3. Define render inputs block
const renderInputsBlock = `
  const renderCardView = () => (
    <div className="space-y-8">
      {/* Grey Structure */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          1. Grey Structure Cost
        </h3>
        <div className="space-y-3">
          {greyStructure.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{item.name}</label>
              <div className="relative w-40">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number" inputMode="decimal"
                  value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                  onChange={(e) => updateItem("grey", item.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
            <span>Subtotal:</span>
            <span>{formatCurrency(greyTotal)}</span>
          </div>
        </div>
      </div>
      {/* Finishing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          2. Finishing Cost
        </h3>
        <div className="space-y-3">
          {finishing.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{item.name}</label>
              <div className="relative w-40">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number" inputMode="decimal"
                  value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                  onChange={(e) => updateItem("finish", item.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
            <span>Subtotal:</span>
            <span>{formatCurrency(finishTotal)}</span>
          </div>
        </div>
      </div>
      {/* Labour */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          3. Labour Cost
        </h3>
        <div className="space-y-3">
          {labour.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap">
              <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{item.name}</label>
              <div className="relative w-40">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number" inputMode="decimal"
                  value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                  onChange={(e) => updateItem("labour", item.id, e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
            <span>Subtotal:</span>
            <span>{formatCurrency(labourTotal)}</span>
          </div>
        </div>
      </div>
      
      {/* O&P / Contingency */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-medium text-slate-800 dark:text-slate-200">
          <Settings2 className="w-5 h-5 text-blue-500" />
          Additional Factors
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Overhead & Profit (%)</label>
              <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{overheadProfitPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={overheadProfitPct}
              onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contingency (%)</label>
              <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{contingencyPct}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={contingencyPct}
              onChange={(e) => setContingencyPct(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="py-4 px-6 font-semibold w-1/3">Category</th>
              <th className="py-4 px-6 font-semibold w-1/2">Item Description</th>
              <th className="py-4 px-6 font-semibold text-right">Estimated Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {greyStructure.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                {index === 0 && (
                  <td rowSpan={greyStructure.length} className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 align-top border-r border-slate-200 dark:border-slate-800">
                    Grey Structure
                    <div className="mt-2 text-xs text-slate-500 font-normal">Subtotal: {formatCurrency(greyTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{item.name}</td>
                <td className="py-3 px-6 text-right">
                  <div className="relative inline-block w-32">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("grey", item.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {finishing.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-t border-slate-200 dark:border-slate-800">
                {index === 0 && (
                  <td rowSpan={finishing.length} className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 align-top border-r border-slate-200 dark:border-slate-800">
                    Finishing Cost
                    <div className="mt-2 text-xs text-slate-500 font-normal">Subtotal: {formatCurrency(finishTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{item.name}</td>
                <td className="py-3 px-6 text-right">
                  <div className="relative inline-block w-32">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("finish", item.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {labour.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-t border-slate-200 dark:border-slate-800">
                {index === 0 && (
                  <td rowSpan={labour.length} className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 align-top border-r border-slate-200 dark:border-slate-800">
                    Labour Cost
                    <div className="mt-2 text-xs text-slate-500 font-normal">Subtotal: {formatCurrency(labourTotal)}</div>
                  </td>
                )}
                <td className="py-3 px-6 text-slate-600 dark:text-slate-400">{item.name}</td>
                <td className="py-3 px-6 text-right">
                  <div className="relative inline-block w-32">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number" inputMode="decimal"
                      value={convertAmount(item.amount) === 0 ? '' : Number(convertAmount(item.amount).toFixed(2))}
                      onChange={(e) => updateItem("labour", item.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* O&P / Contingency inline below table */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 border-t border-blue-100 dark:border-blue-900/50 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Overhead & Profit (%)</label>
            <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{overheadProfitPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={overheadProfitPct}
            onChange={(e) => setOverheadProfitPct(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contingency (%)</label>
            <span className="bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700">{contingencyPct}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={contingencyPct}
            onChange={(e) => setContingencyPct(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
`;

const replaceIndex = file.indexOf('const exportToPDF = () => {');
file = file.slice(0, replaceIndex) + renderInputsBlock + '\n  ' + file.slice(replaceIndex);

// 4. Replace the old Left Column with a call to the active view renderer
const leftColumnTargetStart = `<div className="space-y-8">`;
const leftColumnTargetEnd = `        {/* Right Column: Visualization & Summary */}`;

const startIndex = file.indexOf(leftColumnTargetStart);
let endIndex = file.indexOf(leftColumnTargetEnd);

if (startIndex !== -1 && endIndex !== -1) {
  // We need to make sure we grab the right end index for the Left Column div
  // The left column div starts at `<div className="space-y-8">` and ends right before `{/* Right Column`
  file = file.slice(0, startIndex) + `{isTableView ? renderTableView() : renderCardView()}\n\n` + file.slice(endIndex);
}

// 5. Add floating action button before closing div
const closingDivTarget = `          <CalculationHistory calculatorId="constructioncostsummary_tool" currentInputs={{}} />
</div>`;
const closingDivReplacement = `          <CalculationHistory calculatorId="constructioncostsummary_tool" currentInputs={{}} />

      {/* View Toggle Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsTableView(!isTableView)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] hover:bg-blue-700 transition-colors"
        title={isTableView ? "Switch to Card View" : "Switch to Table View"}
      >
        {isTableView ? <LayoutGrid className="w-6 h-6" /> : <List className="w-6 h-6" />}
      </motion.button>
</div>`;
file = file.replace(closingDivTarget, closingDivReplacement);

fs.writeFileSync('src/components/modules/ConstructionCostSummary.tsx', file);
console.log("Done updating table view");
