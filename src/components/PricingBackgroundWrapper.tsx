import React from 'react';

export default function PricingBackgroundWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Background Mesh Gradient Elements */}
      
      {/* Pale Mint Green */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/30 blur-[120px] mix-blend-multiply pointer-events-none" />
      
      {/* Soft Silver-Indigo */}
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/20 blur-[140px] mix-blend-multiply pointer-events-none" />
      
      {/* Subtle Pearl/Mint Blend */}
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-100/40 blur-[120px] mix-blend-multiply pointer-events-none" />
      
      {/* Content wrapper with relative z-index so it sits cleanly above the gradient */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}