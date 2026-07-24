const fs = require('fs');

const newCode = `import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, Search, User, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TopNavbar({
  onNavigate,
  onOpenAuth,
  onOpenProfile,
}: {
  onNavigate?: (id: string) => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
}) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: "Services", hasDropdown: true },
    { name: "Industries", hasDropdown: true },
    { name: "Tools", hasDropdown: true },
    { name: "Templates", hasDropdown: false },
    { name: "Insights", hasDropdown: true },
    { name: "Company", hasDropdown: true },
  ];

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-[120] flex justify-center w-full px-4 pointer-events-none">
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="pointer-events-auto h-[60px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-full px-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{ width: isScrolled ? "auto" : "100%", maxWidth: isScrolled ? "max-content" : "80rem" }}
      >
        
        {/* Logo and Name */}
        <motion.div 
          layout
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          onClick={() => onNavigate ? onNavigate("home") : navigate("/")}
        >
          <motion.div layout className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] bg-[#ff5722] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {!isScrolled && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <span className="font-bold text-[16px] sm:text-[20px] text-slate-900 dark:text-white tracking-tight">
                  Civil Estimation <span className="text-[#ff5722]">Pro</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Desktop Navigation Capsule */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="hidden xl:flex items-center bg-slate-50/50 dark:bg-white/5 rounded-full px-1 border border-slate-100 dark:border-white/5 absolute left-1/2 -translate-x-1/2"
            >
              {navItems.map((item) => (
                <div 
                  key={item.name}
                  className="relative px-3 py-2 cursor-pointer group"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.name}
                    {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />}
                  </div>
                  
                  {/* Minimal Dropdown Simulation */}
                  <AnimatePresence>
                    {hoveredItem === item.name && item.hasDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-4 w-48 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-xl"
                      >
                        {['Option 1', 'Option 2', 'Option 3'].map((opt, i) => (
                          <div key={i} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                            {item.name} {opt}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* App Actions */}
        <motion.div layout className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <AnimatePresence>
            {!isScrolled && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex' }}
                className="items-center gap-1.5 sm:gap-2"
              >
                <button 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
                  onClick={() => user ? (onOpenProfile ? onOpenProfile() : null) : (onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal")))}
                  aria-label="User Profile"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last Button: Mobile Menu Toggle / Final button on far right */}
          <motion.button 
            layout
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 ml-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </motion.div>

      </motion.div>
    </header>
  );
}
`;
fs.writeFileSync('src/components/TopNavbar.tsx', newCode);
