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
      <div className="w-full bg-surface-default rounded-card shadow-brand-sm border border-border-color overflow-hidden transition-all duration-500">
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
    // Single Dribbble-amber system (Batch 2): the old per-section colours
    // (blue / indigo / violet / emerald / amber) collapse to one treatment.
    // The `color` prop is kept for API compatibility with existing callers.
    blue: "bg-accent-100 text-accent-900 border-accent-200",
    indigo: "bg-accent-100 text-accent-900 border-accent-200",
    violet: "bg-accent-100 text-accent-900 border-accent-200",
    emerald: "bg-accent-100 text-accent-900 border-accent-200",
    amber: "bg-accent-100 text-accent-900 border-accent-200",
  };
    
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-surface-hover p-6 sm:p-7 rounded-card border border-border-color overflow-hidden hover:bg-surface-default transition-all duration-300 group"
    >
      <h3 className="font-bold text-base sm:text-lg mb-6 text-txt-primary flex items-center gap-3">
        {number && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            {number}
          </div>
        )}
        <span className="uppercase text-xs sm:text-xs text-txt-secondary font-black tracking-[0.2em]">
          {title}
        </span>
      </h3>
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </motion.div>
  );
}

