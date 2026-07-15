import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="logo-slate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" /> {/* slate-600 */}
          <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
        </linearGradient>
        <linearGradient id="logo-slate-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" /> {/* slate-400 */}
          <stop offset="100%" stopColor="#334155" /> {/* slate-700 */}
        </linearGradient>
        <linearGradient id="logo-orange" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" /> {/* orange-600 */}
          <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
        </linearGradient>
        <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
      </defs>
      
      {/* Background shape - represents foundation & structural grid */}
      <rect x="15" y="15" width="70" height="70" rx="20" fill="url(#logo-slate)" opacity="0.1" />
      
      <g filter="url(#logo-shadow)">
        {/* The Structure / Building representation forming the left stem of the Sigma/Formula */}
        <path d="M 30,20 L 30,80 L 42,80 L 42,60 L 52,60 L 52,80 L 64,80 L 64,50 L 74,50 L 74,80 L 82,80 L 82,20 Z" fill="url(#logo-slate)" opacity="0.15" />
        <path d="M 28,18 L 45,18 L 45,82 L 28,82 Z" fill="url(#logo-slate)" />
        <path d="M 45,45 L 60,45 L 60,82 L 45,82 Z" fill="url(#logo-slate-light)" opacity="0.9" />
        <path d="M 60,60 L 72,60 L 72,82 L 60,82 Z" fill="url(#logo-slate)" opacity="0.8" />
        
        {/* The Estimation Formula (Sigma / Summation) intersecting the buildings */}
        <path 
          d="M 75,25 L 35,25 L 55,50 L 35,75 L 75,75" 
          stroke="url(#logo-orange)" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none"
        />
        
        {/* An accent point to represent data / analytics */}
        <circle cx="75" cy="50" r="6" fill="url(#logo-orange)" />
      </g>
    </svg>
  );
}
