import React from "react";
import { motion } from "framer-motion";

/**
 * PRODUCTION-READY MASTER LAYOUT TEMPLATE
 * Standard blueprint for all responsive tool pages
 * UI/UX Standard: One UI 8.5 Minimalist
 */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full py-4 sm:py-8">
      {/* <!-- Main Tool Workspace Wrapper --> */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden transition-all duration-500">
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col lg:grid lg:grid-cols-12 gap-8 xl:gap-12">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ToolLayoutInputs({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:col-span-4 space-y-6 sm:space-y-8">
      {/* <!-- Input Parameters Column (col-span-4) --> */}
      {children}
    </div>
  );
}

export function ToolLayoutResults({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:col-span-8 space-y-8 flex flex-col">
      {/* <!-- Universal Results & Visualization Grid (col-span-8) --> */}
      {children}
    </div>
  );
}

export function ToolSection({ 
  title, 
  number, 
  color = "blue", 
  children 
}: { 
  title: React.ReactNode, 
  number?: number | string, 
  color?: "blue" | "indigo" | "violet" | "emerald" | "amber", 
  children: React.ReactNode 
}) {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  };
    
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-50/50 dark:bg-slate-800/10 p-6 sm:p-7 rounded-[20px] sm:rounded-[24px] border border-slate-100 dark:border-slate-800/60 overflow-hidden hover:bg-white dark:hover:bg-slate-800/20 transition-all duration-300 group"
    >
      <h3 className="font-bold text-base sm:text-lg mb-6 text-slate-900 dark:text-white flex items-center gap-3">
        {number && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            {number}
          </div>
        )}
        <span className="uppercase text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-black tracking-[0.2em]">
          {title}
        </span>
      </h3>
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </motion.div>
  );
}

