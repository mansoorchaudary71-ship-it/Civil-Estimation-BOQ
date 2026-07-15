import React from "react";
import { motion } from "motion/react";
import { CheckSquare, Clock, ArrowRight, ArrowUpRight } from "lucide-react";

export const getCategoryThemeNew = (category: string) => {
  const cat = (category || "").toLowerCase();
  
  if (cat.includes('estimator') || cat.includes('mep') || cat.includes('analysis')) {
    return {
      glow: 'from-emerald-400/20 to-teal-500/20',
      text: 'text-emerald-600',
      bgSolid: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    };
  }
  if (cat.includes('concrete') || cat.includes('structure') || cat.includes('steel') || cat.includes('masonry')) {
    return {
      glow: 'from-sky-400/20 to-blue-500/20',
      text: 'text-sky-600',
      bgSolid: 'bg-gradient-to-br from-sky-400 to-blue-600',
    };
  }
  if (cat.includes('road') || cat.includes('pavement') || cat.includes('highway') || cat.includes('earthwork') || cat.includes('chainage') || cat.includes('site') || cat.includes('infrastructure')) {
    return {
      glow: 'from-teal-400/20 to-emerald-500/20',
      text: 'text-teal-600',
      bgSolid: 'bg-gradient-to-br from-teal-400 to-emerald-500',
    };
  }
  if (cat.includes('soil') || cat.includes('geotechnical') || cat.includes('foundation') || cat.includes('test')) {
    return {
      glow: 'from-orange-400/20 to-amber-500/20',
      text: 'text-orange-600',
      bgSolid: 'bg-gradient-to-br from-orange-400 to-amber-500',
    };
  }
  
  return {
    glow: 'from-indigo-400/20 to-purple-500/20',
    text: 'text-indigo-600',
    bgSolid: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  };
};

export default function ToolCard({
  tool: mod,
  onSelect,
  idx,
}: {
  tool: any; // Using tool for prop matching Dashboard
  mod?: any; // To support both usages if they vary
  onSelect: (id: string) => void;
  idx?: number;
}) {
  const toolData = mod || arguments[0].tool; // fallback to handle either naming
  const theme = getCategoryThemeNew(toolData.category);

  let diffDot = "bg-orange-400";
  let diffText = toolData.difficulty || "Intermediate";
  const diffUpper = (toolData.difficulty || "").toUpperCase();
  if (diffUpper.includes("ADVANCED")) {
    diffDot = "bg-rose-500";
    diffText = "Advanced";
  } else if (diffUpper.includes("BEGINNER")) {
    diffDot = "bg-emerald-400";
    diffText = "Beginner";
  }

  const estTime = toolData.estimatedTime || (diffText === "Beginner" ? "~2 mins" : diffText === "Advanced" ? "~15 mins" : "~5 mins");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: (idx || 0) * 0.05, ease: [0.23, 1, 0.32, 1] }}
      onClick={() => onSelect(toolData.id)}
      className="group relative flex h-full flex-col cursor-pointer transition-all duration-500 ease-out hover:-translate-y-2"
    >
      {/* Ambient Mesh Glow */}
      <div className={`absolute -inset-[2px] bg-gradient-to-br ${theme.glow} rounded-[36px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

      <div className="relative flex flex-col h-full bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[32px] p-6 md:p-8 lg:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] transition-shadow duration-500 overflow-hidden">
        
        {/* Decorative inner gradient orb */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${theme.glow} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none`} />

        {toolData.isNew && (
          <div className="absolute top-6 right-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full z-10 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            NEW
          </div>
        )}
        
        <div className="flex items-center gap-5 z-10">
          <div className={`w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-[20px] flex items-center justify-center shrink-0 shadow-lg ${theme.bgSolid}`}>
            {toolData.icon && <toolData.icon className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2} />}
          </div>
          
          <div className="flex-1 pt-1 min-w-0 flex flex-col justify-center">
            <h3 className="text-[20px] md:text-[22px] font-extrabold text-slate-800 leading-[1.2] mb-1.5 truncate whitespace-normal line-clamp-2 transition-colors duration-300">
              {toolData.title}
            </h3>
            <div className={`text-[12px] font-bold uppercase tracking-[0.15em] ${theme.text}`}>
              {toolData.category || "General"}
            </div>
          </div>
        </div>

        <p className="mt-6 mb-auto text-[15px] font-medium text-slate-500/90 leading-[1.7] line-clamp-2 md:line-clamp-3 relative z-10">
          {toolData.desc}
        </p>

        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-200/50 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full ${diffDot} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
              <span className="text-[11px] md:text-[12px] font-bold text-slate-700 uppercase tracking-wide">{diffText}</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white bg-white/60 shadow-sm backdrop-blur-md text-slate-600">
              <Clock className="w-[13px] h-[13px]" strokeWidth={2.5} />
              <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-wide">{estTime}</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 active:scale-95 group-hover:shadow-lg shrink-0 hover:-translate-y-0.5">
            <span className="text-[13px] font-bold tracking-wide">Open</span>
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
