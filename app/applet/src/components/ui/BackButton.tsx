import React from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackButton({ 
  isVisible = false, 
  onNavigate 
}: { 
  isVisible?: boolean;
  onNavigate: () => void;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={onNavigate}
          aria-label="Back to dashboard"
          title="Back to Dashboard"
          className="group fixed bottom-6 md:bottom-8 right-6 md:right-8 w-14 h-14 flex items-center justify-center rounded-full bg-indigo-700 text-white shadow-[0_8px_20px_-4px_rgba(67,56,202,0.5)] backdrop-blur-xl z-[90] transition-all duration-200 ease-out hover:scale-105 hover:bg-indigo-800 hover:shadow-[0_12px_25px_-4px_rgba(67,56,202,0.7)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 overflow-hidden print:hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mix-blend-overlay rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-y-full group-hover:-translate-y-full transition-transform duration-500 ease-in-out" />
          <ArrowLeft className="w-5 h-5 relative z-10 transition-transform duration-200 ease-out group-hover:-translate-x-1" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
