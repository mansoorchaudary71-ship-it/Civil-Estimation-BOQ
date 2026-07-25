const fs = require('fs');

let content = fs.readFileSync('src/components/boq/MasterBOQDrawer.tsx', 'utf8');

const importRegex = /const \[searchQuery, setSearchQuery\] = useState\(''\);/;
const importReplacement = `const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);`;

content = content.replace(importRegex, importReplacement);

const listRegex = /<div key=\{item\.id\} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

const listReplacement = `<div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm hover:shadow" onClick={() => setEditingItem({...item})}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{item.name}</h4>
                          <p className="text-xs font-semibold text-indigo-600 uppercase">{item.category}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="text-red-400 hover:text-red-600 p-1 bg-white rounded-full shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-4">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-400 uppercase">Qty</span>
                          <p className="font-semibold text-slate-800 mt-1">{item.quantity} {item.unit || ''}</p>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-400 uppercase">Rate</span>
                          <p className="font-semibold text-slate-800 mt-1">{formatCurrency(item.rate)}</p>
                        </div>
                        <div className="flex-1 text-right">
                          <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
                          <p className="font-bold text-indigo-600 mt-1">{formatCurrency(item.amount)}</p>
                        </div>
                      </div>
                    </div>`;

content = content.replace(listRegex, listReplacement);

const endRegex = /<\/AnimatePresence>\s*\);\s*\}/;

const editDialog = `
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingItem(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Edit BOQ Item</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{editingItem.name}</h4>
                <p className="text-xs font-semibold text-indigo-600 uppercase mt-1">{editingItem.category}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Quantity {editingItem.unit ? \`(\${editingItem.unit})\` : ''}</label>
                  <input
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0, amount: (parseFloat(e.target.value) || 0) * editingItem.rate })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Unit Rate</label>
                  <input
                    type="number"
                    value={editingItem.rate}
                    onChange={(e) => setEditingItem({ ...editingItem, rate: parseFloat(e.target.value) || 0, amount: editingItem.quantity * (parseFloat(e.target.value) || 0) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditingItem(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateItem(editingItem.id, { quantity: editingItem.quantity, rate: editingItem.rate });
                  setEditingItem(null);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}`;

content = content.replace(endRegex, editDialog);

fs.writeFileSync('src/components/boq/MasterBOQDrawer.tsx', content);
console.log("Successfully patched MasterBOQDrawer with edit dialog.");

