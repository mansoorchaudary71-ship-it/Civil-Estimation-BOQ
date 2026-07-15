import React from "react";
import { FileText, Download } from "lucide-react";
import { SoilReportDetails } from "../../utils/soilReports";

interface Props {
  details: SoilReportDetails;
  onChange: (field: keyof SoilReportDetails, value: string) => void;
  onGenerateReport: () => void;
  isGenerating?: boolean;
}

export const SoilReportHeader: React.FC<Props> = ({ details, onChange, onGenerateReport, isGenerating }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          Test Report Information
        </h4>
        <button
          onClick={onGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-base font-medium transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate PDF Report"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Project Name</label>
          <><label htmlFor="a11y-input-590" className="sr-only">Input</label>
<input id="a11y-input-590"
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark: text-slate-900 dark:text-white  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500"
            value={details.projectName}
            onChange={(e) => onChange("projectName", e.target.value)}
          /></>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Client Name</label>
          <><label htmlFor="a11y-input-591" className="sr-only">Input</label>
<input id="a11y-input-591"
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark: text-slate-900 dark:text-white  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500"
            value={details.clientName}
            onChange={(e) => onChange("clientName", e.target.value)}
          /></>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lab Name</label>
          <><label htmlFor="a11y-input-592" className="sr-only">Central Soils Laboratory</label>
<input id="a11y-input-592"
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark: text-slate-900 dark:text-white  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500"
            value={details.labName}
            onChange={(e) => onChange("labName", e.target.value)}
            placeholder="Central Soils Laboratory"
          /></>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sample ID</label>
          <><label htmlFor="a11y-input-593" className="sr-only">Input</label>
<input id="a11y-input-593"
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark: text-slate-900 dark:text-white  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500"
            value={details.sampleId}
            onChange={(e) => onChange("sampleId", e.target.value)}
          /></>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Depth (m/ft)</label>
          <><label htmlFor="a11y-input-594" className="sr-only">Input</label>
<input id="a11y-input-594"
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark: text-slate-900 dark:text-white  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500"
            value={details.depth}
            onChange={(e) => onChange("depth", e.target.value)}
          /></>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tested By</label>
          <><label htmlFor="a11y-input-595" className="sr-only">Input</label>
<input id="a11y-input-595"
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark: text-slate-900 dark:text-white  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-teal-500"
            value={details.testedBy}
            onChange={(e) => onChange("testedBy", e.target.value)}
          /></>
        </div>
      </div>
    </div>
  );
}
