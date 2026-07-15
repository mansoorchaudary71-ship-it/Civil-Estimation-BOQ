import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, ChevronRight } from "lucide-react";
import { ALL_MODULES } from "./Dashboard";

export default function RecentSidebar({
  isOpen,
  onClose,
  onNavigate
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const [recentTools, setRecentTools] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecent = () => {
      try {
        const history = JSON.parse(localStorage.getItem("recent_calculators") || "[]");
        setRecentTools(history);
      } catch (e) {
        setRecentTools([]);
      }
    };
    if (isOpen) {
      fetchRecent();
    }
    window.addEventListener("recent_calculators_updated", fetchRecent);
    return () => window.removeEventListener("recent_calculators_updated", fetchRecent);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 w-80 max-w-[90vw] bg-white shadow-2xl z-[160] flex flex-col border-l border-slate-200"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 tracking-tight mb-4">
                <History className="w-5 h-5 text-indigo-600" />
                Recent Tools
              </h2>
              <button onClick={onClose}
                className="p-2 -mr-2 text-slate-600 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recentTools.length > 0 ? (
                recentTools.map((id, index) => {
                  const mod = ALL_MODULES.find((m) => m.id === id);
                  if (!mod) return null;
                  return (
                    <motion.button
                      key={id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onNavigate(id);
                        onClose();
                      }}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group flex items-center gap-4 overflow-hidden flex-wrap"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                        {mod.icon && <mod.icon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate group-hover:text-indigo-600 transition-colors text-lg font-medium text-slate-800 mb-4">
                          {mod.title}
                        </h3>
                        <p className="truncate mt-0.5 text-base font-normal text-slate-600 leading-relaxed">
                          {mod.category}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </motion.button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60 mt-10">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-slate-800 mb-4">No Recent Tools</h3>
                  <p className="text-base font-normal text-slate-600 leading-relaxed">
                    Tools you use will appear here for quick access.
                  </p>
                </div>
              )}
            </div>
            
            {recentTools.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-center uppercase tracking-wider text-base font-normal text-slate-600 leading-relaxed">Showing last 5 tools</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
