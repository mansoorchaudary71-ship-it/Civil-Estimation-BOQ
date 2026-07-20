const fs = require('fs');
const file = '/app/applet/src/components/ui/PrintPreviewModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('includeCharts')) {
  // Add settings to the top
  content = content.replace(
    "const [author, setAuthor] = useState('');",
    "const [author, setAuthor] = useState('');\n  const [includeCharts, setIncludeCharts] = useState(true);\n  const [includeBreakdowns, setIncludeBreakdowns] = useState(true);\n  const [includeLogo, setIncludeLogo] = useState(true);"
  );

  // Add dependencies to useEffect
  content = content.replace(
    "[isOpen, pdfTheme, orientation, watermark, showVersionStamp, revision, author]",
    "[isOpen, pdfTheme, orientation, watermark, showVersionStamp, revision, author, includeCharts, includeBreakdowns, includeLogo]"
  );

  // Add display logic to CSS
  const cssInjection = `
                /* Visibility Toggles */
                \${!includeCharts ? \`
                .recharts-wrapper, .chart-container, [class*="recharts"], canvas, .echarts-for-react, svg.recharts-surface {
                  display: none !important;
                }
                \` : ''}
                \${!includeBreakdowns ? \`
                table, .boq-table-print-breaks, .itemized-breakdown {
                  display: none !important;
                }
                \` : ''}
                \${!includeLogo ? \`
                img[alt*="logo"], .company-logo {
                  display: none !important;
                }
                \` : ''}
                
                \${themeStyles}
  `;
  content = content.replace("${themeStyles}", cssInjection);

  // Wrap Content area with flex container and sidebar
  const sidebarCode = `
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-6 overflow-y-auto flex-shrink-0 flex flex-col gap-6 hidden md:flex">
            <div>
               <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Print Settings</h3>
               <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-slate-700 font-medium">Include Charts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeBreakdowns} onChange={e => setIncludeBreakdowns(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-slate-700 font-medium">Itemized Breakdowns</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={includeLogo} onChange={e => setIncludeLogo(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-slate-700 font-medium">Company Logo</span>
                  </label>
               </div>
            </div>
          </div>
  `;

  content = content.replace('{/* Content (Paper simulation) */}', sidebarCode + '\n{/* Content (Paper simulation) */}');

  // Close the flex container at the end
  const endTag = '</div>\n      </div>\n    </div>,\n    document.body\n  );';
  content = content.replace('</div>\n      </div>\n    </div>,\n    document.body\n  );', '</div>\n' + endTag);

  fs.writeFileSync(file, content);
  console.log('Updated PrintPreviewModal.tsx');
}
