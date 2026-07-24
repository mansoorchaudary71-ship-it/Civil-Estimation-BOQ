const fs = require('fs');
let code = fs.readFileSync('src/components/boq/MasterBOQDrawer.tsx', 'utf-8');

// 1. Add Search icon import
code = code.replace(/import { X, FileText, Download, Trash2 } from 'lucide-react';/, "import { X, FileText, Download, Trash2, Search } from 'lucide-react';");

// 2. Add searchQuery state inside the component
code = code.replace(/const { items, removeItem/, "const [searchQuery, setSearchQuery] = useState('');\n  const { items, removeItem");

// 3. Filter items based on searchQuery
code = code.replace(/const subtotal = items\.reduce/, "const filteredItems = items.filter(item => \n    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || \n    (item.unit && item.unit.toLowerCase().includes(searchQuery.toLowerCase())) || \n    item.category.toLowerCase().includes(searchQuery.toLowerCase())\n  );\n\n  const subtotal = items.reduce");

// 4. Update the map to use filteredItems
code = code.replace(/\{items\.map\(\(item\) => \(/, "{filteredItems.length === 0 && searchQuery ? (\n                    <div className=\"text-center py-8 text-slate-500\">No matching items found.</div>\n                  ) : filteredItems.map((item) => (");

// 5. Add Search Input UI
const searchUI = `    <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-600">Regional Rate Sync (Live):</span>
        <select 
          value={currentCurrency} 
          onChange={(e) => setCurrentCurrency(e.target.value as any)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-bold text-indigo-700 outline-none"
        >
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search by description or unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
        />
      </div>
    </div>`;

const targetUI = `<div className="px-6 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
      <span className="text-sm font-semibold text-slate-600">Regional Rate Sync (Live):</span>
      <select 
        value={currentCurrency} 
        onChange={(e) => setCurrentCurrency(e.target.value as any)}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-bold text-indigo-700 outline-none"
      >
        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>`;

code = code.replace(targetUI, searchUI);

fs.writeFileSync('src/components/boq/MasterBOQDrawer.tsx', code);
