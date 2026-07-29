import { Button } from './ui/Button';
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkCheck, ArrowRight, Box, Target, Clock, Zap, X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";


const CAT_COLORS: Record<string, { c: string, glow: string }> = {
  "ROAD PAVEMENT":       { c: "#EA580C", glow: "rgba(249,115,22,0.15)" }, // Vibrant orange
  "QUANTITY ESTIMATION": { c: "#2563EB", glow: "rgba(59,130,246,0.15)" },
  "CONCRETE":            { c: "#7C3AED", glow: "rgba(139,92,246,0.15)" }, // Deep purple
  "MEP":                 { c: "#059669", glow: "rgba(16,185,129,0.15)" },
  "DEFAULT":             { c: "#6366F1", glow: "rgba(99,102,241,0.15)" }, 
};

export const getCategorySpec = (category: string) => {
  const cat = (category || "").toUpperCase();
  if (cat.includes("ROAD") || cat.includes("PAVEMENT") || cat.includes("HIGHWAY")) return CAT_COLORS["ROAD PAVEMENT"];
  if (cat.includes("QUANTITY") || cat.includes("ESTIMATION") || cat.includes("ANALYSIS")) return CAT_COLORS["QUANTITY ESTIMATION"];
  if (cat.includes("CONCRETE") || cat.includes("STRUCTURE") || cat.includes("MASONRY") || cat.includes("DESIGN")) return CAT_COLORS["CONCRETE"];
  if (cat.includes("MEP") || cat.includes("ENERGY") || cat.includes("WATER") || cat.includes("PLUMBING")) return CAT_COLORS["MEP"];
  return CAT_COLORS["DEFAULT"];
};

const LEVEL_MAP: Record<number, string> = { 1: "Basic", 2: "Moderate", 3: "Advanced" };

function Dots({ level, color }: { level: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3].map(i => (
        <span key={i} 
          className="block w-[5px] h-[5px] rounded-full"
          style={{ background: i <= level ? color : "rgba(156,163,175,0.4)" }} 
        />
      ))}
    </span>
  );
}

export default function ToolCard({
  mod,
  onSelect,
  categoryColor,
  layoutId,
}: {
  mod: any;
  onSelect: (id: string, layoutId?: string) => void;
  layoutId?: string;
  categoryColor?: string;
}) {
  const { settings, updateSettings } = useSettings();
  const [hov, setHov] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  if (!mod) return null;

  const cfg = getCategorySpec(mod.category);
  const colorToUse = categoryColor || cfg.glow;
  const favoriteTools = settings?.favoriteTools || [];
  const saved = favoriteTools.includes(mod.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      updateSettings({ favoriteTools: favoriteTools.filter((id) => id !== mod.id) });
    } else {
      updateSettings({ favoriteTools: [...favoriteTools, mod.id] });
    }
  };

  const IconComponent = mod.icon || Box;
  const level = mod.level || ((mod.id.length % 3) + 1);

  return (
    <motion.div
      layoutId={layoutId || `module-${mod.id}`}
      onClick={() => onSelect(mod.id, layoutId || `module-${mod.id}`)}
      onMouseEnter={() => {
        setHov(true);
        hoverTimeout.current = setTimeout(() => {
          setShowQuickView(true);
        }, 500);
      }}
      onMouseLeave={() => {
        setHov(false);
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      }}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        opacity: { duration: 0.3 }
      }}
      className={cn(
        "w-full h-full flex flex-col font-sans cursor-pointer transition-all duration-300",
        "bg-surface-default relative overflow-hidden rounded-2xl border border-ui-borderSubtle shadow-sm",
        hov ? "shadow-lg border-ui-borderDefault -translate-y-1" : ""
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 0% 0%, ${colorToUse === '#F4F1EA' ? '#EAE0CC' : colorToUse === '#F0F5FF' ? '#E0E7FF' : colorToUse === '#D9E6DD' ? '#C4D6C9' : colorToUse} 0%, ${colorToUse} 25%, rgba(255,255,255,0) 75%)`
      }}
    >
      {/* Top-left fading white border highlight */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-[1.5rem]" 
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 0) 50%)',
          padding: '14px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} 
      />
      <div className="relative z-10 flex flex-col h-full p-8 sm:p-10">
        <div className="flex items-start justify-between min-h-[40px]">
          <motion.div 
            layoutId={`icon-${mod.id}`}
            animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-4"
          >
            <IconComponent size={40} className="text-txt-primary" strokeWidth={2.5} />
          </motion.div>
          
          <div className="flex items-center gap-3">
            {mod.isNew && (
              <span 
                className={cn(
                  "text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-xl shrink-0",
                  colorToUse === '#F4F1EA' ? "bg-[#EBE4D5] text-[#6B6353]" :
                  colorToUse === '#F0F5FF' ? "bg-[#E0E7FF] text-[#4F46E5]" :
                  colorToUse === '#D9E6DD' ? "bg-[#D1FAE5] text-[#059669]" :
                  "bg-blue-50 text-blue-600"
                )}
              >
                NEW
              </span>
            )}
            <button onClick={toggleFavorite} className="flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors active:scale-95" aria-label={saved ? "Remove from favorites" : "Add to favorites"}>
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="p-1">
                {saved ? <BookmarkCheck size={20} color={cfg.c} /> : <Bookmark size={20} className="text-txt-tertiary" strokeWidth={1.5} />}
              </motion.div>
            </button>
          </div>
        </div>

        <div className="flex flex-col mt-2">
          <motion.h3 layoutId={`title-${mod.id}`} className="text-xl font-semibold text-txt-primary leading-tight line-clamp-2 min-h-[3.5rem]">
            {mod.title}
          </motion.h3>
          <p className="text-txt-secondary text-sm mt-3 leading-relaxed line-clamp-2">
            {mod.desc || "No description available."}
          </p>
        </div>

        <div className="mt-auto pt-6 flex items-end justify-between">
          <div className="flex flex-col items-start gap-1">
            <Dots level={level} color={cfg.c} />
            <span className="text-[10px] tracking-widest font-semibold text-txt-tertiary mt-1 uppercase">
              {LEVEL_MAP[level] || "Moderate"}
            </span>
          </div>
          <Button 
            className={cn(
              "text-txt-primary rounded-full px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-95",
              colorToUse === '#F4F1EA' ? "bg-[#E5DFD3] hover:bg-[#D5CDBF]" :
              colorToUse === '#F0F5FF' ? "bg-[#D9DDF0] hover:bg-[#C4C9E6]" :
              colorToUse === '#D9E6DD' ? "bg-[#D9E6DD] hover:bg-[#C4D6C9]" :
              "bg-[#E2E8F4] hover:bg-[#D4DDF0]"
            )}
          >
            OPEN
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {showQuickView && createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickView(false);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-surface-default rounded-2xl shadow-xl overflow-hidden border border-ui-borderSubtle"
            >
              <div 
                className="h-32 p-6 flex justify-between items-start"
                style={{
                  backgroundImage: `radial-gradient(circle at top right, ${colorToUse} 0%, rgba(255,255,255,0) 70%)`,
                  backgroundColor: '#f8fafc'
                }}
              >
                <div className="w-16 h-16 rounded-2xl bg-surface-default shadow-sm border border-slate-100 flex items-center justify-center">
                  <IconComponent size={32} className="text-txt-primary" />
                </div>
                <button onClick={(e) => { e.stopPropagation(); setShowQuickView(false); }} className="p-2 bg-surface-default/50 hover:bg-surface-default rounded-full transition-colors">
                  <X size={20} className="text-txt-tertiary" />
                </button>
              </div>

              <div className="p-6 -mt-4 relative bg-surface-default rounded-t-3xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold tracking-wider uppercase" style={{ color: cfg.c }}>
                    {mod.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Dots level={level} color={cfg.c} />
                    <span className="text-[10px] font-semibold text-txt-tertiary uppercase">
                      {LEVEL_MAP[level]}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-txt-primary mb-3">{mod.title}</h2>
                <p className="text-txt-secondary text-sm leading-relaxed mb-6">
                  {mod.desc || "No description available for this tool."}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100/50 text-indigo-600">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-txt-tertiary font-semibold">Accuracy</p>
                      <p className="text-sm font-bold text-txt-secondary">98.5%</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100/50 text-emerald-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-txt-tertiary font-semibold">Time Saved</p>
                      <p className="text-sm font-bold text-txt-secondary">~15 mins</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100/50 text-amber-600">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-txt-tertiary font-semibold">Usage</p>
                      <p className="text-sm font-bold text-txt-secondary">High</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100/50 text-blue-600">
                      <Bookmark size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-txt-tertiary font-semibold">Saves</p>
                      <p className="text-sm font-bold text-txt-secondary">1.2k+</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQuickView(false);
                      onSelect(mod.id);
                    }}
                    className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    Open Tool
                  </Button>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(e); }} className="p-3 rounded-xl border border-ui-borderSubtle hover:bg-slate-50 transition-colors flex items-center justify-center text-txt-secondary">
                    {saved ? <BookmarkCheck size={20} color={cfg.c} /> : <Bookmark size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </motion.div>
  );
}

