const fs = require('fs');
// Let's create a simpler TopNavbar.tsx
const content = `
import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, Search, User, Building2, X, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";

const navItems = [
  { name: "Features", path: "/features" },
  { name: "Pricing", path: "/pricing" }
];

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
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path.replace('/', ''));
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[120] flex justify-center w-full px-4 sm:px-6 pointer-events-none pt-4 sm:pt-6 transition-all duration-300">
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className={\`pointer-events-auto flex items-center justify-between transition-all duration-300 ease-out w-full \${
            isScrolled 
              ? "h-[64px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] max-w-5xl" 
              : "h-[72px] bg-transparent border-transparent rounded-none px-0 max-w-7xl"
          }\`}
        >
          
          {/* Logo and Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => handleNavigation("/")}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#fa5c5c] to-[#f58145] flex items-center justify-center shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-orange-500/30">
              <Building2 className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-[18px] sm:text-[20px] text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-orange-500 transition-colors">
                Civil Estimation
              </span>
              <span className="text-[13px] font-semibold text-orange-500 leading-none mt-1">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button 
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className="px-4 py-2 rounded-lg text-[15px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {user ? (
              <button 
                onClick={() => onOpenProfile ? onOpenProfile() : null} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))}>Log in</Button>
                <Button variant="premium" size="sm" onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))} rightIcon={<ArrowRight className="w-4 h-4" />}>Sign up</Button>
              </>
            )}
          </div>

          {/* Mobile Search & Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </motion.div>
      </header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 z-[115] shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full pt-24 pb-8 px-6">
                <div className="flex flex-col gap-2 flex-1">
                  {navItems.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      key={item.name}
                    >
                      <button 
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center justify-between py-4 text-lg font-semibold border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white"
                      >
                        {item.name}
                      </button>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800"
                >
                  {user ? (
                    <Button 
                      variant="secondary"
                      size="lg"
                      fullWidth
                      onClick={() => {
                        onOpenProfile ? onOpenProfile() : null;
                        setIsMobileMenuOpen(false);
                      }} 
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" fullWidth size="lg" onClick={() => { setIsMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); else window.dispatchEvent(new CustomEvent("open-login-modal")); }}>Log in</Button>
                      <Button variant="premium" fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => { setIsMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); else window.dispatchEvent(new CustomEvent("open-login-modal")); }}>Sign up for free</Button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
`;
fs.writeFileSync('src/components/TopNavbar.tsx', content);
