import React from 'react';
import { ArrowRight, Play, Star, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative w-full bg-transparent overflow-hidden pt-24 md:pt-32 pb-16 flex flex-col items-center font-sans">
      {/* Background Mesh Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[75%] z-0 pointer-events-none hero-mesh-gradient">
      </div>

      <div className="md:max-w-[1200px] md:mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* Top Typography Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center w-full md:max-w-4xl md:mx-auto px-4 md:px-0"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
              New
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-800 pr-3">
              AI-Powered Estimations
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl leading-[1.1] mb-6 font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
            Build Smarter. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-300% animate-gradient">Estimate Faster.</span>
          </h1>

          {/* Subheadline */}
          <p className="md:max-w-2xl px-4 mb-10 text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
            The all-in-one calculation platform for modern civil engineers, architects, and quantity surveyors. Accurate structural and building estimates in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 mb-16">
            <button onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none text-base font-semibold"
            >
              Start Estimating Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full text-slate-700 bg-white/70 backdrop-blur-md hover:bg-white/90 border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow active:scale-95 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:outline-none text-base font-semibold overflow-hidden"
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Play className="w-3 h-3 fill-current text-slate-700" />
              </div>
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Central Visual & Floating Cards */}
        <div className="relative w-full md:max-w-5xl md:mx-auto mt-4 mb-20 flex flex-col lg:block items-center px-4 md:px-0">
          
          {/* Main Visual: CSS Tablet/Laptop Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full md:max-w-3xl md:mx-auto scale-[0.85] sm:scale-100 origin-top mb-6 sm:mb-10 px-4 md:px-0"
          >
            {/* Tablet Frame */}
            <div className="relative bg-gray-900 rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-4 shadow-2xl shadow-gray-200/50 border border-gray-800 ring-1 ring-white/10 mx-2 sm:mx-0">
              {/* Screen Content */}
              <div className="relative rounded-[1.5rem] sm:rounded-[2.25rem] overflow-hidden bg-gray-50 aspect-[16/10] border border-gray-700/50 flex flex-col">
                {/* Mock UI Header */}
                <div className="h-10 sm:h-14 border-b border-gray-200 bg-white flex items-center px-4 sm:px-6 gap-4 flex-wrap">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-200"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-200"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="h-4 w-32 bg-gray-100 rounded-full mx-auto"></div>
                </div>
                {/* Mock UI Body */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 bg-gray-50/50">
                  {/* Sidebar */}
                  <div className="hidden sm:flex w-48 flex-col gap-3">
                    <div className="h-6 w-full bg-white rounded-md border border-gray-200"></div>
                    <div className="h-6 w-3/4 bg-gray-200/50 rounded-md"></div>
                    <div className="h-6 w-5/6 bg-gray-200/50 rounded-md"></div>
                    <div className="h-6 w-full bg-gray-200/50 rounded-md"></div>
                  </div>
                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* QS/Estimation Chart Area */}
                    <div className="flex gap-4 h-32 sm:h-40 flex-wrap">
                      <div className="w-full flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2 overflow-hidden relative">
                         <div className="flex justify-between items-center mb-1">
                            <div className="text-[10px] font-bold text-slate-800 uppercase">Material Cost</div>
                            <div className="h-4 w-12 bg-blue-100 rounded-full"></div>
                         </div>
                         {/* Material Cost Breakdown Bars */}
                         <div className="flex-1 flex flex-col justify-end gap-2 pb-1">
                           <div className="w-full flex items-center gap-2">
                             <div className="w-9 text-[9px] font-bold text-slate-400 tracking-wider">STEEL</div>
                             <div className="h-3 bg-slate-800 rounded-full w-[70%]"></div>
                             <div className="text-[9px] font-bold text-slate-700">$45k</div>
                           </div>
                           <div className="w-full flex items-center gap-2">
                             <div className="w-9 text-[9px] font-bold text-slate-400 tracking-wider">CONC.</div>
                             <div className="h-3 bg-slate-400 rounded-full w-[50%]"></div>
                             <div className="text-[9px] font-bold text-slate-700">$32k</div>
                           </div>
                           <div className="w-full flex items-center gap-2">
                             <div className="w-9 text-[9px] font-bold text-slate-400 tracking-wider">BRICK</div>
                             <div className="h-3 bg-[#D97757] rounded-full w-[40%]"></div>
                             <div className="text-[9px] font-bold text-slate-700">$21k</div>
                           </div>
                           <div className="w-full flex items-center gap-2">
                             <div className="w-9 text-[9px] font-bold text-slate-400 tracking-wider">LABOR</div>
                             <div className="h-3 bg-blue-500 rounded-full w-[60%]"></div>
                             <div className="text-[9px] font-bold text-slate-700">$38k</div>
                           </div>
                         </div>
                      </div>
                      <div className="w-full hidden sm:flex w-36 bg-slate-900 rounded-xl border border-gray-800 shadow-sm p-4 flex-col justify-between overflow-hidden relative">
                         <div className="text-[10px] font-bold text-slate-400">TOTAL EST. COST</div>
                         <div className="text-xl font-black text-white">$136,000</div>
                         <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                           <TrendingUp className="w-3.5 h-3.5" />
                           <span>+2.4% vs Budget</span>
                         </div>
                         {/* decorative graph line */}
                         <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
                            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5">
                               <path d="M0 40 Q 20 20, 40 30 T 80 10 T 100 20" />
                            </svg>
                         </div>
                      </div>
                    </div>
                    {/* BOQ Data Table */}
                    <div className="w-full flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2 overflow-hidden">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <div className="text-[9px] font-bold text-slate-400 w-1/3">ITEM DESCRIPTION</div>
                        <div className="text-[9px] font-bold text-slate-400 w-12 text-center">QTY</div>
                        <div className="text-[9px] font-bold text-slate-400 w-12 text-center">UNIT</div>
                        <div className="text-[9px] font-bold text-slate-400 w-16 text-right">AMOUNT</div>
                      </div>
                      {[
                        { name: "M25 Grade Concrete", qty: "145", unit: "Cu.m", amt: "$12,450" },
                        { name: "Grade 60 Rebar", qty: "12,400", unit: "Kg", amt: "$14,880" },
                        { name: "First Class Bricks", qty: "45,000", unit: "Nos", amt: "$5,400" }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 pt-1 last:border-0 last:pb-0">
                          <div className="text-[10px] font-semibold text-slate-700 w-1/3 truncate pr-2">{item.name}</div>
                          <div className="text-[10px] font-medium text-slate-500 w-12 text-center">{item.qty}</div>
                          <div className="text-[10px] font-medium text-slate-500 w-12 text-center">{item.unit}</div>
                          <div className="text-[10px] font-bold text-slate-900 w-16 text-right">{item.amt}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Soft Shadow under tablet */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gray-900/10 blur-xl rounded-[100%]"></div>
          </motion.div>

          {/* Left Floating Card: 30+ Tools */}
          <motion.div 
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:absolute left-0 top-[45%] lg:top-[75%] z-20 mt-6 lg:mt-0 lg:-ml-12 w-full max-w-[300px] lg:max-w-[280px] bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl shadow-gray-200/50 hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-default rounded-3xl lg:rounded-[2rem] p-4 sm:p-5 flex flex-col text-left overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="leading-tight text-lg font-medium text-slate-800 mb-4">30+ Professional Tools</h4>
                <p className="text-base font-normal text-slate-600 leading-relaxed">Verified to global standards</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-base font-medium">10k+ Trust Us</span>
            </div>
          </motion.div>

          {/* Right Floating Card: 5-Star Review */}
          <motion.div 
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:absolute right-0 top-[40%] z-20 mt-4 lg:mt-0 lg:-mr-12 w-full max-w-[300px] bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl shadow-gray-200/50 hover:shadow-[0_12px_40px_rgba(37,99,235,0.15)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-default rounded-3xl lg:rounded-[2rem] p-4 sm:p-5 flex flex-col text-left overflow-hidden"
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-blue-600 text-blue-600" />
              ))}
            </div>
            <p className="mb-4 text-base font-normal text-slate-600 leading-relaxed">
              "Zero calculation errors and saves hours of manual Excel entries."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=33" alt="Michael R." className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-base font-normal text-slate-600 leading-relaxed">Michael R.</p>
                <p className="text-base font-normal text-slate-600 leading-relaxed">Civil Engineer</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Footer (Logo Cloud) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full mt-16 pt-16 pb-20 bg-pink-100/50 relative"
        >
          {/* Pill-shaped Tab */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-white rounded-full px-10 py-3.5 shadow-md ring-1 ring-black/5 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                Trusted by global practitioners and firms
              </span>
            </div>
          </div>
          
          <div className="relative w-full overflow-hidden flex">
            {/* Gradient masks for smooth fade on edges */}
            <div className="absolute top-0 left-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-pink-100/50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-pink-100/50 to-transparent z-10 pointer-events-none"></div>
            
            {/* The infinite scrolling marquee container */}
            <div className="flex animate-marquee min-w-max hover:[animation-play-state:paused]">
              {[1, 2].map((group) => (
                <div key={group} className="flex items-center gap-16 md:gap-24 px-8 md:px-12">
                  <div className="text-xl font-bold tracking-tighter text-slate-800 flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded bg-blue-600"></div> BuildCorp
                  </div>
                  <div className="text-xl font-black tracking-widest text-slate-800 flex items-center gap-1 shrink-0">
                    <div className="w-5 h-8 bg-emerald-600 -skew-x-12"></div>
                    <div className="w-5 h-8 bg-emerald-600 -skew-x-12"></div>
                    NEXUS
                  </div>
                  <div className="text-xl font-bold font-serif italic text-slate-800 flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full border-[5px] border-purple-600"></div> Architechs
                  </div>
                  <div className="text-xl font-extrabold uppercase text-slate-800 flex items-center gap-1 shrink-0">
                    <div className="w-4 h-8 bg-orange-500"></div>
                    <div className="w-4 h-8 bg-orange-500"></div>
                    <div className="w-4 h-8 bg-orange-500"></div>
                    STRUCT
                  </div>
                  <div className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2 shrink-0">
                     <div className="w-8 h-8 rounded-tl-xl rounded-br-xl bg-teal-600"></div> Civis
                  </div>
                  <div className="text-xl font-black text-slate-800 flex items-center gap-2 shrink-0">
                    <div className="w-6 h-6 rotate-45 bg-rose-600"></div> Apex
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}

