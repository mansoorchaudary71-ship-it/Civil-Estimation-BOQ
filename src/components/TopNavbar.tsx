import React, { useState, useEffect, useRef } from "react";
import { Menu, Search, Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopNavbar({
  onNavigate,
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
  onOpenRecent,
}: {
  onNavigate?: (id: string) => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenRecent?: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, toggleTheme } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="w-full sticky top-0 left-0 right-0 z-[120] bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/80 dark:border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
      {/* Subtle light reflection on top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-white/10 to-transparent opacity-100" />
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-8 h-[60px] flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 sm:gap-4 cursor-pointer group" 
          onClick={() => onNavigate ? onNavigate("home") : navigate("/")}
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex items-center justify-center font-black text-[15px] sm:text-[17px] text-white bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700 shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] overflow-hidden">
            {/* Glossy reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <span className="relative z-10 drop-shadow-md">CE</span>
          </div>
          <span className="font-extrabold text-[19px] sm:text-[24px] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white tracking-tight truncate drop-shadow-sm transition-all duration-300">
            Civil Estimation <span className="text-blue-600 dark:text-blue-400 font-black">Pro</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all duration-300 active:scale-95 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] shadow-sm group overflow-hidden"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/0 via-slate-100/50 dark:via-slate-700/50 to-slate-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {settings.theme === "dark" || (settings.theme === "system" && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:scale-110 group-hover:text-amber-500 transition-all duration-300" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300" />
            )}
          </button>

          <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all duration-300 active:scale-95 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] shadow-sm group overflow-hidden"
            aria-label="Search"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/0 via-slate-100/50 dark:via-slate-700/50 to-slate-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Search className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300" />
          </button>
          
          <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all duration-300 active:scale-95 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] shadow-sm group overflow-hidden"
            onClick={() => user ? (onOpenProfile ? onOpenProfile() : null) : (onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal")))}
            aria-label="User Profile"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/0 via-slate-100/50 dark:via-slate-700/50 to-slate-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <User className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300" />
          </button>
          <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all duration-300 active:scale-95 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] shadow-sm group overflow-hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/0 via-slate-100/50 dark:via-slate-700/50 to-slate-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
