import React from "react";

export function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col lg:grid lg:grid-cols-12 gap-8 xl:gap-12">
        {children}
      </div>
    </div>
  );
}

export function ToolLayoutInputs({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
      {children}
    </div>
  );
}

export function ToolLayoutResults({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:col-span-5 xl:col-span-4 space-y-6 flex flex-col">
      {children}
    </div>
  );
}

export function ToolSection({ title, number, color = "blue", children }: { title: React.ReactNode, number?: number | string, color?: "blue" | "indigo" | "violet" | "emerald" | "amber", children: React.ReactNode }) {
  const colorMap = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };
  
  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/20 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800/50 overflow-hidden">
      <h3 className="font-bold text-lg mb-5 text-slate-800 dark:text-slate-200 flex items-center gap-2">
        {number && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${colorMap[color]}`}>
            {number}
          </div>
        )}
        {title}
      </h3>
      {children}
    </div>
  );
}
