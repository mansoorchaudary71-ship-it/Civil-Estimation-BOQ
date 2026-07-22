const fs = require('fs');
let code = fs.readFileSync('src/components/boq/MasterBOQDrawer.tsx', 'utf8');

// add useGlobalSettings
if (!code.includes('useGlobalSettings')) {
  code = code.replace(
    "import { useSettings } from '../../context/SettingsContext';",
    "import { useSettings, useGlobalSettings } from '../../context/SettingsContext';"
  );
}

// inject functions and currency selector
if (!code.includes('exportCSV')) {
  const exportCsvFn = `
  const { currentCurrency, setCurrentCurrency } = useGlobalSettings();
  const currencies = ['PKR', 'INR', 'USD', 'AED', 'GBP', 'EUR'];

  const exportCSV = () => {
    const headers = "Item Name,Category,Quantity,Unit,Rate,Amount\\n";
    const rows = items.map(item => \`"\${item.name}","\${item.category}",\${item.quantity},"\${item.unit}",\${item.rate},\${item.amount}\`).join("\\n");
    const summary = \`\\nSubtotal,,,,,\${subtotal}\\nContingency (\${contingency}%),,,,,\${contingencyAmount}\\nOverhead/Profit (\${overheadProfit}%),,,,,\${overheadAmount}\\nTax (\${tax}%),,,,,\${taxAmount}\\nGrand Total,,,,,\${grandTotal}\`;
    
    const blob = new Blob([headers + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Master_BOQ.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportPDF = () => {
    window.print();
  };
  `;
  
  code = code.replace(
    "const grandTotal = taxableAmount + taxAmount;",
    "const grandTotal = taxableAmount + taxAmount;\n" + exportCsvFn
  );
}

if (!code.includes('Currency:')) {
  const currencySelector = `
    <div className="px-6 py-3 border-b border-slate-100 bg-white flex justify-between items-center">
      <span className="text-sm font-semibold text-slate-600">Regional Rate Sync (Live):</span>
      <select 
        value={currentCurrency} 
        onChange={(e) => setCurrentCurrency(e.target.value as any)}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-bold text-indigo-700 outline-none"
      >
        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  `;
  
  code = code.replace(
    '</button>\n            </div>',
    '</button>\n            </div>' + currencySelector
  );
}

if (code.includes("alert('Exporting to PDF...')")) {
  code = code.replace(
    "onClick={() => alert('Exporting to PDF...')}",
    "onClick={exportPDF}"
  );
}

if (code.includes("alert('Exporting to CSV...')")) {
  code = code.replace(
    "onClick={() => alert('Exporting to CSV...')}",
    "onClick={exportCSV}"
  );
  
  // Also add Excel button
  const excelBtn = `
    <button
      className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 flex justify-center items-center gap-2 shadow-sm shadow-emerald-200"
      onClick={exportCSV}
    >
      <Download size={18} /> Excel
    </button>
  `;
  
  code = code.replace(
    '<Download size={18} /> CSV\n                </button>',
    '<Download size={18} /> CSV\n                </button>\n' + excelBtn
  );
}


fs.writeFileSync('src/components/boq/MasterBOQDrawer.tsx', code);
