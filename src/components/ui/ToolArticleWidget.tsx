import React from 'react';

export function ToolArticleWidget({ toolName }: { toolName: string }) {
  return (
    <div className="w-full bg-white rounded-[32px] p-4 sm:p-4 sm:p-4 sm:p-6 md:p-4 sm:p-4 sm:p-4 sm:p-8 border border-slate-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-6">How to use the {toolName}</h2>
        <ol className="list-decimal list-inside space-y-3 text-base text-slate-600 leading-relaxed">
          <li>Select your preferred units of measurement</li>
          <li>Input the primary dimensions and parameters</li>
          <li>Review any standard constants and adjust if necessary</li>
          <li>Check the real-time generated results and summaries</li>
          <li>Export the calculation to PDF or save it for later</li>
        </ol>
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-6">{toolName.replace(/ Calculator$| Estimator$/, '')} Details</h2>
        <p className="text-base text-slate-600 leading-relaxed mb-4">
          This tool is specifically designed for civil engineers, contractors, and students to calculate requirements with unparalleled speed and accuracy. Our implementation seamlessly integrates the latest engineering guidelines to ensure you receive a robust estimation process directly in your browser.
        </p>
      </div>
    </div>
    </div>
  );
}
