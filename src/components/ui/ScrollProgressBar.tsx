import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const scaleX = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    scaleX.set(progress);
  }, [progress, scaleX]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      let activeScrollProgress = 0;
      
      // Check window scroll
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (windowHeight > 0) {
        const windowProgress = (window.scrollY || document.documentElement.scrollTop) / windowHeight;
        activeScrollProgress = Math.max(activeScrollProgress, windowProgress);
      }

      // Check active internal scroll containers
      const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div, #main-content');
      for (let i = 0; i < scrollableContainers.length; i++) {
        const el = scrollableContainers[i] as HTMLElement;
        if (el.clientHeight >= window.innerHeight * 0.5) {
          const scrollHeight = el.scrollHeight - el.clientHeight;
          if (scrollHeight > 0) {
             const elProgress = el.scrollTop / scrollHeight;
             activeScrollProgress = Math.max(activeScrollProgress, elProgress);
          }
        }
      }

      setProgress(Math.min(1, Math.max(0, activeScrollProgress)));
    };

    window.addEventListener("scroll", handleScroll, true);
    
    // Initial check
    handleScroll(new Event('scroll'));

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-indigo-600 origin-left z-[200] shadow-[0_0_10px_rgba(79,70,229,0.7)]"
      style={{ scaleX }}
      initial={{ opacity: 0 }}
      animate={{ opacity: progress > 0.01 ? 1 : 0 }}
      transition={{ opacity: { duration: 0.2 } }}
    />
  );
}
