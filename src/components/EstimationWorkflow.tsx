import React from "react";
import { ArrowRight, Ruler, FileSpreadsheet, Box, ClipboardList, Zap } from "lucide-react";
import { ModuleId } from "./Dashboard";

interface EstimationWorkflowProps {
  onSelectModule: (id: ModuleId) => void;
}

export default function EstimationWorkflow({ onSelectModule }: EstimationWorkflowProps) {
  const steps = [
    {
      id: "measurement-sheet",
      number: "01",
      title: "Enter Measurements",
      description: "Log your dimensions securely",
      icon: Ruler,
      color: "bg-purple-100 text-purple-600  ",
      border: "border-purple-200 "
    },
    {
      id: "boq",
      number: "02",
      title: "Auto-Generate BOQ",
      description: "One-click rate formatting",
      icon: FileSpreadsheet,
      color: "bg-blue-100 text-blue-600  ",
      border: "border-blue-200 "
    },
    {
      id: "material-takeoff",
      number: "03",
      title: "Calculate Material",
      description: "Exact cement & steel qty",
      icon: Box,
      color: "bg-blue-100 text-blue-600  ",
      border: "border-blue-200 "
    },
    {
      id: "cost-summary",
      number: "04",
      title: "Export Cost Summary",
      description: "Final client-ready document",
      icon: ClipboardList,
      color: "bg-emerald-100 text-emerald-600  ",
      border: "border-emerald-200 "
    }
  ];

  return (
    <div className="w-full md:max-w-[1400px] md:mx-auto px-4 lg:px-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <div className="w-full bg-white rounded-[2.5rem] p-4 sm:p-8 md:p-5 sm:p-12 border border-slate-200 shadow-xl overflow-hidden relative">
        {/* Background Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Zap className="w-48 h-48" />
        </div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full relative z-10 text-center md:max-w-2xl md:mx-auto mb-12 px-4 md:px-0">
          <h2 className="md: tabular-nums mb-4 text-xl font-semibold text-slate-900 tracking-tight">
            Complete Estimation Workflow
          </h2>
          <p className="text-base font-normal text-slate-600 leading-relaxed">
            No Engineer Needed. Complete BOQ in Minutes.
          </p>
        </div>

        <div className="relative z-10">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-[4rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-purple-200 via-orange-200 to-emerald-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group cursor-pointer" onClick={() => onSelectModule(step.id as ModuleId)}>
                <div className="flex flex-col items-center text-center">
                  {/* Step Item Box */}
                  <div className={`w-28 h-28 lg:w-32 lg:h-32 rounded-[24px] bg-white  border-2 ${step.border} shadow-lg flex flex-col items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl relative mb-6 z-10`}>
                    <div className={`w-12 h-12 rounded-[24px] flex items-center justify-center ${step.color} mb-2`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    {/* Number Badge */}
                    <div className="w-full absolute -top-4 -right-4 w-9 h-9 bg-white text-slate-900 font-semibold tabular-nums tracking-tight rounded-full flex items-center justify-center shadow-md text-sm border-4 border-white overflow-hidden">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="mb-2 group-hover:text-purple-600 transition-colors text-lg font-medium text-slate-800 mb-4">
                    {step.title}
                  </h3>
                  <p className="px-4 text-base font-normal text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connectors for mobile/tablet */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden w-1 h-8 bg-slate-200 mt-6 my-2 rounded-full"></div>
                  )}
                </div>

                {/* Arrow Connector for Desktop over the generic line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-[calc(4rem-0.75rem)] -right-6 w-12 h-6 items-center justify-center z-20 text-slate-700 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <button 
            onClick={() => onSelectModule(steps[0].id as ModuleId)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-lg shadow-[0_8px_30px_rgba(147,51,234,0.3)] hover:shadow-[0_8px_40px_rgba(147,51,234,0.4)] transition-all hover:-translate-y-1 active:scale-95"
          >
            Start Here <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
