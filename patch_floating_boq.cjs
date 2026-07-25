const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingBOQButton({ onClick }: { onClick: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
          ) - window.innerHeight;
          
          const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
          setScrollProgress(Math.min(Math.max(progress, 0), 1));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to get initial position after render
    setTimeout(handleScroll, 150);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const size = 76;
  const strokeWidth = 2.5;
  const radius = 33; // 28 (button half) + 5 (gap)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;
  const isComplete = scrollProgress >= 0.99;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[60] flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={\`relative flex items-center justify-center transition-transform duration-300 ease-out \${isHovered ? 'scale-[1.08]' : 'scale-100'}\`}
      >
        {/* Completion Pulse */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-cyan-400 blur-sm pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}
        </AnimatePresence>

        {/* SVG Ring Container */}
        <svg
          className="absolute pointer-events-none"
          style={{ width: size, height: size, transform: 'rotate(-90deg)' }}
          viewBox={\`0 0 \${size} \${size}\`}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" /> {/* Violet */}
              <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan */}
            </linearGradient>
            
            <filter id="glow-normal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="glow-hover" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subtle Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-300/40 dark:text-white/15 transition-colors"
            strokeWidth={strokeWidth}
          />
          
          {/* Active Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ 
              transition: 'stroke-dashoffset 0.15s ease-out',
              filter: isHovered ? 'url(#glow-hover)' : 'url(#glow-normal)'
            }}
          />
        </svg>
        
        {/* Inner Button */}
        <button
          onClick={onClick}
          className="relative w-[56px] h-[56px] rounded-full backdrop-blur-xl bg-gradient-to-br from-indigo-500/95 via-violet-600/95 to-fuchsia-500/95 border border-white/20 text-white flex items-center justify-center focus:outline-none overflow-hidden"
          style={{ 
            boxShadow: isHovered 
              ? '0 15px 35px -5px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)' 
              : '0 10px 25px -5px rgba(139, 92, 246, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)', 
            transition: 'box-shadow 0.3s ease' 
          }}
          aria-label="Open Master BOQ"
        >
          {/* Glassmorphism subtle inner glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          
          <FileText 
            size={24} 
            className={\`transition-transform duration-300 ease-out \${isHovered ? '-translate-y-0.5 rotate-[-8deg]' : 'translate-y-0 rotate-0'}\`} 
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/ui/FloatingBOQButton.tsx', code);
