import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, Search, User, Building2, X, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: "Services", hasDropdown: true, path: "/services" },
    { name: "Industries", hasDropdown: true, path: "/industries" },
    { name: "Tools", hasDropdown: true, path: "/tools" },
    { name: "Templates", hasDropdown: false, path: "/templates" },
    { name: "Insights", hasDropdown: true, path: "/insights" },
    { name: "Company", hasDropdown: true, path: "/company" },
  ];

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
          className={`pointer-events-auto flex items-center justify-between transition-all duration-300 ease-out w-full ${
            isScrolled 
              ? "h-[64px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] max-w-5xl" 
              : "h-[72px] bg-transparent border-transparent rounded-none px-0 max-w-7xl"
          }`}
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
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <div 
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button 
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[15px] font-medium transition-all duration-200 ${
                      isActive 
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10" 
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${hoveredItem === item.name ? 'rotate-180' : ''}`} />}
                  </button>
                  
                  {/* Active Indicator Underline */}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {hoveredItem === item.name && item.hasDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none"
                      >
                        {['Overview', 'Features', 'Pricing'].map((opt, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleNavigation(`${item.path}/${opt.toLowerCase()}`)}
                            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors flex items-center justify-between group/item"
                          >
                            <span>{opt}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-orange-500" />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* App Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
                  <button 
                    onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))} 
                    className="text-[15px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 transition-colors"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))} 
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign up
                  </button>
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
          </div>

        </motion.div>
      </header>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 z-[115] shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full pt-24 pb-8 px-6">
                
                {/* Navigation Links */}
                <div className="flex flex-col gap-2 flex-1">
                  {navItems.map((item, idx) => {
                    const isActive = location.pathname.includes(item.path);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        key={item.name}
                      >
                        <button 
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full flex items-center justify-between py-4 text-lg font-semibold border-b border-slate-100 dark:border-slate-800 transition-colors ${
                            isActive ? 'text-orange-500' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.name}
                          {item.hasDropdown && <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Mobile Auth Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800"
                >
                  {user ? (
                    <button 
                      onClick={() => {
                        onOpenProfile ? onOpenProfile() : null;
                        setIsMobileMenuOpen(false);
                      }} 
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-xl font-semibold text-lg"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"));
                          setIsMobileMenuOpen(false);
                        }} 
                        className="w-full text-center py-4 rounded-xl font-semibold text-lg text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        Log in
                      </button>
                      <button 
                        onClick={() => {
                          onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"));
                          setIsMobileMenuOpen(false);
                        }} 
                        className="w-full text-center py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#fa5c5c] to-[#f58145] text-white shadow-lg shadow-orange-500/25"
                      >
                        Sign up for free
                      </button>
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
