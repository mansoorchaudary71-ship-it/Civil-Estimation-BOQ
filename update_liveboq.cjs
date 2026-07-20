const fs = require('fs');
let file = '/app/applet/src/components/modules/LiveBOQ.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
if (!content.includes('GenericExportButtons')) {
  content = content.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport { GenericExportButtons } from "../ui/GenericExportButtons";'
  );
}

// Add id to table
content = content.replace(
  '<table className="boq-table-print-breaks w-full text-left text-sm">',
  '<table id="live-boq-table" className="boq-table-print-breaks w-full text-left text-sm">'
);

// Add component
content = content.replace(
  '<button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-slate-200 rounded text-sm hover:bg-slate-200 transition-colors text-slate-700 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">\n            <Filter className="w-[14px] h-[14px]" /> Filters\n          </button>',
  '<button className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-slate-200 rounded text-sm hover:bg-slate-200 transition-colors text-slate-700 rounded-full active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">\n            <Filter className="w-[14px] h-[14px]" /> Filters\n          </button>\n          <div className="ml-auto">\n            <GenericExportButtons tableId="live-boq-table" filename="Live_BOQ_Report" />\n          </div>'
);

fs.writeFileSync(file, content);
