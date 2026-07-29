const fs = require('fs');

const content = `import { Button } from "./ui/Button";
import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, Search, User, Building2, X, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
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

  const currentPath = location.pathname;

  return (
    <>
      <header 
        className={\`fixed top-0 left-0 right-0 z-[120] w-full transition-all duration-300 \${
          isScrolled 
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm py-3" 
            : "bg-transparent border-b border-transparent py-5"
        }\`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo and Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => handleNavigation("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fa5c5c] to-[#f58145] flex items-center justify-center shadow-md shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-orange-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-[18px] text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-orange-500 transition-colors">
                Civil Estimation
              </span>
              <span className="text-[12px] font-bold text-orange-500 tracking-wider leading-none mt-1 uppercase">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/');
              return (
                <div key={item.name} className="relative group">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={\`text-[15px] font-semibold transition-colors duration-200 py-2 \${
                      isActive 
                        ? "text-slate-900 dark:text-white" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }\`}
                  >
                    {item.name}
                  </button>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-t-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
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
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="font-semibold text-[15px] hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))}>
                  Log in
                </Button>
                <Button variant="premium" size="sm" className="font-semibold text-[15px] shadow-sm" onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start for Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Search & Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => window.dispatchEvent(new CustomEvent("open-global-search"))}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[85%] sm:max-w-sm bg-white dark:bg-slate-900 z-[115] shadow-2xl md:hidden overflow-y-auto border-l border-slate-100 dark:border-slate-800"
            >
              <div className="flex flex-col h-full pt-24 pb-8 px-6">
                <div className="flex flex-col gap-1 flex-1">
                  {navItems.map((item, idx) => {
                    const isActive = currentPath === item.path || (currentPath === '/' && item.path === '/');
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        key={item.name}
                      >
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={\`w-full flex items-center py-4 px-4 rounded-xl text-[17px] font-semibold transition-colors \${
                            isActive 
                              ? "bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white" 
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                          }\`}
                        >
                          {item.name}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
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
                      <User className="w-5 h-5 mr-2" />
                      My Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" fullWidth size="lg" className="bg-white dark:bg-slate-900" onClick={() => { setIsMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); else window.dispatchEvent(new CustomEvent("open-login-modal")); }}>
                        Log in
                      </Button>
                      <Button variant="premium" fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => { setIsMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); else window.dispatchEvent(new CustomEvent("open-login-modal")); }}>
                        Start for Free
                      </Button>
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
