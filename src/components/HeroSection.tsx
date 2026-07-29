import { Button } from './ui/Button';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, BarChart3, ShieldCheck, Zap, Calculator, LayoutDashboard } from 'lucide-react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';


export default function HeroSection({ onStart }: { onStart: () => void }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative w-full bg-slate-50 dark:bg-[#0B0F19] overflow-hidden pt-32 md:pt-40 pb-20 flex flex-col items-center font-sans min-h-screen justify-center">
      
      {/* Premium Gradient Lighting Background */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#f58145]/20 via-[#fa5c5c]/5 to-transparent blur-[100px] rounded-full pointer-events-none z-0"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6IiBmaWxsPSIjZjFmNWY5IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-5 pointer-events-none z-0"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* Animated Feature Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-default/60 dark:bg-slate-800/60 backdrop-blur-md border border-ui-borderSubtle/50 dark:border-slate-700/50 shadow-sm mb-8 hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#fa5c5c] to-[#f58145] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3" /> New
          </span>
          <span className="text-sm font-medium text-txt-secondary dark:text-slate-300 pr-2 group-hover:text-txt-primary dark:group-hover:text-white transition-colors">
            AI-Powered Smart Estimations 2.0
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#f58145] group-hover:translate-x-0.5 transition-all" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-txt-primary dark:text-white tracking-tight leading-[1.1] md:leading-[1.15] max-w-4xl mx-auto mb-6"
        >
          Generate Accurate BOQs in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa5c5c] to-[#f58145]">Seconds, Not Days</span>
        </motion.h1>

        {/* Supporting Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-txt-secondary dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 font-medium"
        >
          The intelligent estimation engine for modern civil engineers. Instantly calculate quantities, automate pricing, and win more bids with zero manual errors.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto"
        >
          <Button
            onClick={onStart}
            variant="premium"
            size="xl"
            className="w-full sm:w-auto group"
            rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          >
            Start Estimating for Free
          </Button>
          
          <Button
            variant="outline"
            size="xl"
            className="w-full sm:w-auto group bg-white dark:bg-slate-900"
            leftIcon={<Play className="w-5 h-5 fill-slate-400 group-hover:fill-indigo-500 text-slate-400 group-hover:text-indigo-500 transition-colors" />}
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center gap-3 mb-16"
        >
          <div className="flex -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm">
                <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User Avatar" className="w-full h-full object-cover animate-fade-in" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#f58145] text-[#f58145]" />
              ))}
            </div>
            <p className="text-sm font-semibold text-txt-secondary dark:text-slate-400">
              Trusted by <span className="text-txt-primary dark:text-white font-bold">10,000+</span> professionals
            </p>
          </div>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 50, damping: 20 }}
          className="relative w-full max-w-5xl mx-auto perspective-[2000px]"
        >
          {/* Floating Element Left */}
          <motion.div 
            style={{ y: y1 }}
            className="hidden lg:flex absolute -left-12 top-24 z-20 bg-surface-default/90 dark:bg-slate-800/90 backdrop-blur-xl border border-ui-borderSubtle/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-txt-primary dark:text-white">99.9% Accuracy</p>
              <p className="text-xs text-txt-tertiary dark:text-slate-400">Verified by engineers</p>
            </div>
          </motion.div>

          {/* Floating Element Right */}
          <motion.div 
            style={{ y: y2 }}
            className="hidden lg:flex absolute -right-8 bottom-32 z-20 bg-surface-default/90 dark:bg-slate-800/90 backdrop-blur-xl border border-ui-borderSubtle/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-txt-primary dark:text-white">15+ Hours Saved</p>
              <p className="text-xs text-txt-tertiary dark:text-slate-400">Per project average</p>
            </div>
          </motion.div>

          <div className="relative rounded-2xl md:rounded-2xl border border-ui-borderSubtle/50 dark:border-slate-700/50 bg-surface-default/40 dark:bg-slate-900/40 backdrop-blur-sm p-2 md:p-4 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 transform-gpu rotate-x-[12deg] hover:rotate-x-[0deg] transition-all duration-700 ease-out origin-bottom">
            <div className="rounded-xl md:rounded-[1.5rem] overflow-hidden bg-surface-default dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-inner">
              
              {/* Dashboard Header Mockup */}
              <div className="h-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center px-4 md:px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="mx-auto bg-surface-default dark:bg-slate-800 border border-ui-borderSubtle dark:border-slate-700 rounded-md h-6 w-1/3 md:w-1/4 flex items-center justify-center opacity-70">
                  <div className="w-1/2 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                </div>
              </div>

              {/* Dashboard Body Mockup */}
              <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Sidebar Mock */}
                <div className="hidden md:flex flex-col gap-4 col-span-1">
                  <div className="h-8 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-4 w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center px-2 mt-4"><LayoutDashboard className="w-3 h-3 text-slate-400 mr-2" /></div>
                  <div className="h-4 w-3/4 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center px-2"><BarChart3 className="w-3 h-3 text-slate-400 mr-2" /></div>
                  <div className="h-4 w-2/3 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center px-2"><Calculator className="w-3 h-3 text-slate-400 mr-2" /></div>
                  
                  <div className="mt-8 bg-gradient-to-br from-[#fa5c5c]/10 to-[#f58145]/10 rounded-xl p-4 border border-[#fa5c5c]/20">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#fa5c5c] to-[#f58145] mb-2"></div>
                     <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                     <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>

                {/* Main Content Mock */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md mb-2"></div>
                      <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-gradient-to-r from-[#fa5c5c] to-[#f58145] rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                        <div className="h-6 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                            <div className="space-y-2">
                              <div className="h-3 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
                              <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                          </div>
                          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle reflection/shadow below mockup */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-24 bg-[#fa5c5c]/20 blur-[80px] rounded-[100%] pointer-events-none"></div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-semibold text-slate-400 dark:text-txt-tertiary uppercase tracking-widest">Scroll</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-ui-borderDefault dark:border-slate-600 flex justify-center p-1"
          >
            <div className="w-1 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
