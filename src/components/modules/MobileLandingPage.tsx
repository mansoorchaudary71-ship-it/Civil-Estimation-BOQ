import { Button } from '../ui/Button';
import React from 'react';
import { Play, ArrowRight, Search, CheckCircle, Star, ArrowUp, Menu } from 'lucide-react';
import { MobileTypographyWrapper } from '../ui/MobileTypographyWrapper';


export default function MobileLandingPage() {
  return (
    <div className="min-h-screen bg-surface-hover flex items-center justify-center p-4 sm:p-8 font-sans">
      {/* 
        Container Card with Soft Rounded Corners 
        This is the "distinct, light-colored virtual card element"
      */}
      <div className="relative w-full max-w-md bg-surface-default rounded-2xl shadow-2xl overflow-hidden ring-1 ring-border-color">
        
        {/* 
          Ambient Glow Implementation 
          Using multiple absolute divs with extreme blur for the glowing fog effect
        */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          {/* Light Lavender-Purple */}
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[50%] bg-[#E7E4DE] rounded-full mix-blend-multiply filter blur-[80px]" />
          {/* Misty Coral-Pink */}
          <div className="absolute top-[20%] right-[-20%] w-[70%] h-[60%] bg-[#F2A413] rounded-full mix-blend-multiply filter blur-[80px]" />
          {/* Soft Peach */}
          <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[50%] bg-[#B07006] rounded-full mix-blend-multiply filter blur-[80px]" />
        </div>

        {/* Content Layer */}
        <MobileTypographyWrapper className="relative z-10 flex flex-col h-full w-full">
          
          {/* Simulated Mobile Status Bar & Browser Bar */}
          <div className="w-full px-6 pt-4 pb-2 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-medium text-txt-primary">
              <span>11:06</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 bg-ink rounded-sm" /> {/* Battery icon placeholder */}
                <span>93%</span>
              </div>
            </div>
            <div className="w-full bg-surface-default/50 backdrop-blur-md rounded-full px-4 py-2 flex items-center justify-center border border-white/40 shadow-brand-sm text-xs font-medium text-txt-secondary overflow-hidden">
              <span className="opacity-50">🔒</span> <span className="ml-1">y71-ship-it.github.io</span>
            </div>
          </div>

          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between">
            <div className="font-bold text-txt-primary text-lg tracking-tight">
              Civil Est. Pro
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Search className="w-5 h-5 text-txt-secondary" />
              <Button className="text-base font-medium hidden sm:block rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm">Login</Button>
              <Menu className="w-6 h-6 text-txt-primary sm:hidden" />
            </div>
          </header>

          {/* Main Hero Section */}
          <main className="flex-1 px-6 pt-6 pb-24 flex flex-col items-center text-center">
            
            {/* Badge */}
            <div className="w-full inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-default/60 backdrop-blur-md border border-white/50 shadow-brand-sm mb-6 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
              <span className="text-base font-medium tracking-wide uppercase">NEW: AI-Powered Estimations</span>
            </div>

            {/* Headlines */}
            <h1 className="text-2xl md:text-xl font-semibold text-txt-primary mb-4 leading-[1.1]">
              <span className="text-txt-tertiary block mb-1">Build Smarter.</span>
              <span className="text-txt-primary">Estimate <span className="text-accent-800">Faster.</span></span>
            </h1>

            {/* Description Text */}
            <p className="text-[15px] leading-relaxed text-txt-secondary mb-8 max-w-[320px]">
              The all-in-one calculation platform for modern civil engineers, architects, and quantity surveyors. Accurate structural and building estimates in seconds.
            </p>

            {/* Buttons */}
            <div className="flex flex-col w-full gap-3 mb-12">
              <Button className="w-full flex items-center justify-center gap-2 bg-ink hover:bg-ink-700 text-white py-3.5 px-6 rounded-full font-semibold shadow-[0_8px_20px_rgb(249,115,22,0.3)] transition-transform active:scale-[0.98] transition-all duration-300 active:scale-95 hover:-translate-y-0.5">
                Start Estimating Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button className="w-full flex items-center justify-center gap-2 bg-surface-default/40 hover:bg-surface-default/60 border border-ui-borderSubtle/60 backdrop-blur-sm text-txt-primary py-3.5 px-6 rounded-full font-semibold transition-transform active:scale-[0.98] transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-brand-lg shadow-brand-sm overflow-hidden">
                <Play className="w-4 h-4 fill-slate-800" />
                Watch Demo
              </Button>
            </div>

            {/* Main Graphic Mockup */}
            <div className="relative w-full aspect-[4/3] bg-ink rounded-2xl p-4 shadow-2xl border border-ink/50 flex flex-col gap-4 overflow-hidden mt-4">
              {/* Fake UI inside Graphic */}
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 bg-ink rounded-md" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent-500/20" />
                  <div className="w-8 h-8 rounded-full bg-ui-successText/20" />
                </div>
              </div>
              <div className="flex-1 flex gap-4 flex-wrap">
                <div className="flex-1 bg-ink rounded-xl p-3 flex items-end gap-2">
                   {/* Fake Bar Chart */}
                   <div className="w-full bg-ink/80 rounded-t-sm h-[40%]" />
                   <div className="w-full bg-ink/50 rounded-t-sm h-[70%]" />
                   <div className="w-full bg-ink/90 rounded-t-sm h-[90%]" />
                   <div className="w-full bg-ink/60 rounded-t-sm h-[50%]" />
                </div>
                <div className="w-[40%] bg-ink rounded-xl p-3 flex flex-col gap-3">
                   {/* Fake Doughnut */}
                   <div className="w-12 h-12 rounded-full border-4 border-ink/80 mx-auto mt-2" />
                   <div className="space-y-2 mt-auto">
                     <div className="w-full h-2 bg-ink-600 rounded-full" />
                     <div className="w-2/3 h-2 bg-ink-600 rounded-full" />
                   </div>
                </div>
              </div>
            </div>

          </main>

          {/* Floating Social Proof Card 1 */}
          <div className="w-full absolute top-[35%] -left-8 bg-surface-default/80 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white flex flex-col gap-2 max-w-[140px] animate-float-slow overflow-hidden">
             <div className="flex items-center gap-1.5">
               <CheckCircle className="w-4 h-4 text-ui-successText" />
               <span className="text-xs font-bold text-txt-primary leading-tight">30+ Professional<br/>Tools</span>
             </div>
             <div className="flex -space-x-2">
               <div className="w-6 h-6 rounded-full bg-accent-100 border-2 border-white" />
               <div className="w-6 h-6 rounded-full bg-accent-100 border-2 border-white" />
               <div className="w-6 h-6 rounded-full bg-accent-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">+</div>
             </div>
             <span className="text-xs font-medium text-txt-tertiary">10k+ Trust Us</span>
          </div>

          {/* Floating Social Proof Card 2 */}
          <div className="w-full absolute bottom-[20%] -right-6 bg-surface-default/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white flex flex-col gap-2 max-w-[180px] animate-float-delayed overflow-hidden">
             <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-orange-400 text-accent-400" />)}
             </div>
             <p className="text-xs leading-snug text-txt-secondary italic">
               "Zero calculation errors and saves hours of manual Excel entries."
             </p>
             <div className="flex items-center gap-2 mt-1">
               <div className="w-6 h-6 rounded-full bg-surface-active" />
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-txt-primary">Michael R.</span>
                 <span className="text-[8px] text-txt-tertiary">Civil Engineer</span>
               </div>
             </div>
          </div>

          {/* Back to top button */}
          <Button aria-label="ArrowUp" className="absolute bottom-6 right-6 w-12 h-12 bg-ink text-white rounded-full flex items-center justify-center shadow-brand-lg hover:bg-ink-700 transition-colors z-20 active:scale-95 hover:-translate-y-0.5">
            <ArrowUp className="w-5 h-5" />
          </Button>

        </MobileTypographyWrapper>
      </div>
    </div>
  );
}
