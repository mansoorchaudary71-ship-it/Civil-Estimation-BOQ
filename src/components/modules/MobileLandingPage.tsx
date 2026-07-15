import React from 'react';
import { Play, ArrowRight, Search, CheckCircle, Star, ArrowUp, Menu } from 'lucide-react';
import { MobileTypographyWrapper } from '../ui/MobileTypographyWrapper';

export default function MobileLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      {/* 
        Container Card with Soft Rounded Corners 
        This is the "distinct, light-colored virtual card element"
      */}
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden ring-1 ring-slate-200">
        
        {/* 
          Ambient Glow Implementation 
          Using multiple absolute divs with extreme blur for the glowing fog effect
        */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          {/* Light Lavender-Purple */}
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[50%] bg-[#E0C3FC] rounded-full mix-blend-multiply filter blur-[80px]" />
          {/* Misty Coral-Pink */}
          <div className="absolute top-[20%] right-[-20%] w-[70%] h-[60%] bg-[#FFC3A0] rounded-full mix-blend-multiply filter blur-[80px]" />
          {/* Soft Peach */}
          <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[50%] bg-[#FFD194] rounded-full mix-blend-multiply filter blur-[80px]" />
        </div>

        {/* Content Layer */}
        <MobileTypographyWrapper className="relative z-10 flex flex-col h-full w-full">
          
          {/* Simulated Mobile Status Bar & Browser Bar */}
          <div className="w-full px-6 pt-4 pb-2 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[11px] font-medium text-slate-800">
              <span>11:06</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 bg-slate-800 rounded-sm" /> {/* Battery icon placeholder */}
                <span>93%</span>
              </div>
            </div>
            <div className="w-full bg-white/50 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-center border border-white/40 shadow-sm text-xs font-medium text-slate-600 overflow-hidden">
              <span className="opacity-50">🔒</span> <span className="ml-1">y71-ship-it.github.io</span>
            </div>
          </div>

          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between">
            <div className="font-bold text-slate-900 text-lg tracking-tight">
              Civil Est. Pro
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Search className="w-5 h-5 text-slate-600" />
              <button className="text-base font-medium hidden sm:block rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">Login</button>
              <Menu className="w-6 h-6 text-slate-900 sm:hidden" />
            </div>
          </header>

          {/* Main Hero Section */}
          <main className="flex-1 px-6 pt-6 pb-24 flex flex-col items-center text-center">
            
            {/* Badge */}
            <div className="w-full inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm mb-6 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-base font-medium tracking-wide uppercase">NEW: AI-Powered Estimations</span>
            </div>

            {/* Headlines */}
            <h1 className="text-2xl md:text-xl font-semibold text-slate-800 mb-4 leading-[1.1]">
              <span className="text-slate-400 block mb-1">Build Smarter.</span>
              <span className="text-slate-900">Estimate <span className="text-blue-500">Faster.</span></span>
            </h1>

            {/* Description Text */}
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8 max-w-[320px]">
              The all-in-one calculation platform for modern civil engineers, architects, and quantity surveyors. Accurate structural and building estimates in seconds.
            </p>

            {/* Buttons */}
            <div className="flex flex-col w-full gap-3 mb-12">
              <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white py-3.5 px-6 rounded-full font-semibold shadow-[0_8px_20px_rgb(249,115,22,0.3)] transition-transform active:scale-[0.98] transition-all duration-300 active:scale-95 hover:-translate-y-0.5">
                Start Estimating Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white/40 hover:bg-white/60 border border-slate-200/60 backdrop-blur-sm text-slate-800 py-3.5 px-6 rounded-full font-semibold transition-transform active:scale-[0.98] transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden">
                <Play className="w-4 h-4 fill-slate-800" />
                Watch Demo
              </button>
            </div>

            {/* Main Graphic Mockup */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-800/50 flex flex-col gap-4 overflow-hidden mt-4">
              {/* Fake UI inside Graphic */}
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-slate-800 rounded-md" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20" />
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20" />
                </div>
              </div>
              <div className="flex-1 flex gap-4 flex-wrap">
                <div className="flex-1 bg-slate-800 rounded-xl p-3 flex items-end gap-2">
                   {/* Fake Bar Chart */}
                   <div className="w-full bg-indigo-500/80 rounded-t-sm h-[40%]" />
                   <div className="w-full bg-indigo-500/50 rounded-t-sm h-[70%]" />
                   <div className="w-full bg-indigo-500/90 rounded-t-sm h-[90%]" />
                   <div className="w-full bg-indigo-500/60 rounded-t-sm h-[50%]" />
                </div>
                <div className="w-[40%] bg-slate-800 rounded-xl p-3 flex flex-col gap-3">
                   {/* Fake Doughnut */}
                   <div className="w-12 h-12 rounded-full border-4 border-blue-600/80 mx-auto mt-2" />
                   <div className="space-y-2 mt-auto">
                     <div className="w-full h-2 bg-slate-700 rounded-full" />
                     <div className="w-2/3 h-2 bg-slate-700 rounded-full" />
                   </div>
                </div>
              </div>
            </div>

          </main>

          {/* Floating Social Proof Card 1 */}
          <div className="w-full absolute top-[35%] -left-8 bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white flex flex-col gap-2 max-w-[140px] animate-float-slow overflow-hidden">
             <div className="flex items-center gap-1.5">
               <CheckCircle className="w-4 h-4 text-emerald-500" />
               <span className="text-[10px] font-bold text-slate-800 leading-tight">30+ Professional<br/>Tools</span>
             </div>
             <div className="flex -space-x-2">
               <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white" />
               <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-white" />
               <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">+</div>
             </div>
             <span className="text-[9px] font-medium text-slate-500">10k+ Trust Us</span>
          </div>

          {/* Floating Social Proof Card 2 */}
          <div className="w-full absolute bottom-[20%] -right-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white flex flex-col gap-2 max-w-[180px] animate-float-delayed overflow-hidden">
             <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-orange-400 text-orange-400" />)}
             </div>
             <p className="text-[10px] leading-snug text-slate-700 italic">
               "Zero calculation errors and saves hours of manual Excel entries."
             </p>
             <div className="flex items-center gap-2 mt-1">
               <div className="w-6 h-6 rounded-full bg-slate-200" />
               <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-slate-900">Michael R.</span>
                 <span className="text-[8px] text-slate-500">Civil Engineer</span>
               </div>
             </div>
          </div>

          {/* Back to top button */}
          <button aria-label="ArrowUp" className="absolute bottom-6 right-6 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-20 active:scale-95 hover:-translate-y-0.5">
            <ArrowUp className="w-5 h-5" />
          </button>

        </MobileTypographyWrapper>
      </div>
    </div>
  );
}
