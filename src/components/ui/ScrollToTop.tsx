import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop({ isHome = true }: { isHome?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target;
      let scrollTop = 0;

      if (target === document) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      } else if (target instanceof HTMLElement) {
        // Only track scroll for large containers (likely the main page content)
        if (target.clientHeight >= window.innerHeight * 0.5) {
          scrollTop = target.scrollTop;
        } else {
          return; // Ignore small scrolling elements like sidebars or dropdowns
        }
      }

      if (scrollTop > 400) {
        setIsVisible(true);
      } else if (scrollTop < 100) {
        setIsVisible(false);
      }
    };

    // Use capture phase to catch scroll events from all elements
    window.addEventListener("scroll", handleScroll, true);
    
    // Safety check: hide button if the active container is scrolled to top (handles navigation)
    const interval = setInterval(() => {
        let activeScrollTop = 0;
        const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div');
        for (let i = 0; i < scrollableContainers.length; i++) {
            const el = scrollableContainers[i] as HTMLElement;
            if (el.clientHeight >= window.innerHeight * 0.5 && el.scrollTop > 0) {
                activeScrollTop = Math.max(activeScrollTop, el.scrollTop);
            }
        }
        if (activeScrollTop < 100 && (window.scrollY || document.documentElement.scrollTop) < 100) {
            setIsVisible(false);
        }
    }, 1000);
    
    return () => {
        window.removeEventListener("scroll", handleScroll, true);
        clearInterval(interval);
    };
  }, []);

  const scrollToTop = () => {
    let activeContainer: HTMLElement | Window = window;
    let maxScroll = window.scrollY || document.documentElement.scrollTop;

    // Find the container that is currently scrolled
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div');
    for (let i = 0; i < scrollableContainers.length; i++) {
        const el = scrollableContainers[i] as HTMLElement;
        if (el.clientHeight >= window.innerHeight * 0.5 && el.scrollTop > maxScroll) {
            maxScroll = el.scrollTop;
            activeContainer = el;
        }
    }

    const toolHeader = document.getElementById("tool-header-top");
    const dashboardHero = document.getElementById("dashboard-hero") || document.querySelector('.hero-section');
    
    if (activeContainer instanceof HTMLElement) {
      if (toolHeader && activeContainer.contains(toolHeader)) {
        const y = toolHeader.offsetTop - 80;
        activeContainer.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      } else if (dashboardHero && activeContainer.contains(dashboardHero)) {
        const y = (dashboardHero as HTMLElement).offsetTop - 80;
        activeContainer.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      } else {
        activeContainer.scrollTo({ top: 0, behavior: "auto" });
      }
    } else {
      if (toolHeader) {
        const y = toolHeader.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      } else if (dashboardHero) {
        const y = dashboardHero.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className={`group fixed ${isHome ? 'bottom-6 md:bottom-8' : 'bottom-[5.5rem] md:bottom-[6.5rem]'} right-6 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] backdrop-blur-xl z-[90] transition-all duration-200 ease-out border border-white/20 hover:scale-110 hover:shadow-[0_12px_25px_-4px_rgba(99,102,241,0.7)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mix-blend-overlay rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-y-full group-hover:-translate-y-full transition-transform duration-500 ease-in-out" />
          <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-200 ease-out group-hover:-translate-y-1" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
