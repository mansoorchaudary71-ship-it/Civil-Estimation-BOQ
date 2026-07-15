import { motion } from 'framer-motion';
import { ArrowRight, Play, Calculator, Layers, FileText, CheckCircle } from 'lucide-react';

// Configuration for easy theme swapping
const themeConfig = {
  colors: {
    primary: '#0A0F1E', // Navy
    accent1: '#F59E0B', // Amber
    accent2: '#8B5CF6', // Purple
    accent3: '#06B6D4', // Cyan
  },
  typography: {
    headline: '"Syne", sans-serif',
    body: '"DM Sans", sans-serif',
  }
};

export default function MintroHero() {
  return (
    <div 
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: themeConfig.colors.primary,
        fontFamily: themeConfig.typography.body,
        color: '#ffffff'
      }}
    >
      {/* Animated Ambient Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[100px]"
          style={{ backgroundColor: themeConfig.colors.accent2 }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[120px]"
          style={{ backgroundColor: themeConfig.colors.accent3 }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full mix-blend-screen filter blur-[90px]"
          style={{ backgroundColor: themeConfig.colors.accent1 }}
        />
      </div>

      <div className="relative z-10 w-full md:max-w-7xl md:mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8 mt-12 lg:mt-0 px-4 md:px-0">
        
        {/* Left Content Column */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Glassmorphic Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: themeConfig.colors.accent3 }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: themeConfig.colors.accent3 }}></span>
            </span>
            <span className="text-sm font-medium tracking-wide text-white/80">New: Real-time BOQ Generation v2.0</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{ fontFamily: themeConfig.typography.headline }}
          >
            Build Smarter.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${themeConfig.colors.accent1}, ${themeConfig.colors.accent2})` }}>
              Estimate Faster.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl font-light"
          >
            AI-powered calculations for civil engineers. Transform your blueprints into accurate material estimates and project costs in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group shadow-xl hover:-translate-y-0.5"
              style={{ 
                backgroundColor: themeConfig.colors.primary, 
                color: themeConfig.colors.accent1,
                border: `1px solid ${themeConfig.colors.accent1}40`,
                boxShadow: `0 0 20px ${themeConfig.colors.accent1}20`
              }}
            >
              Start Estimating Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-medium transition-all hover:bg-white/10 flex items-center justify-center gap-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Demo
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex items-center gap-4 text-sm text-white/50 flex-wrap"
          >
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border border-[#0A0F1E]" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img className="w-8 h-8 rounded-full border border-[#0A0F1E]" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img className="w-8 h-8 rounded-full border border-[#0A0F1E]" src="https://i.pravatar.cc/100?img=3" alt="User" />
            </div>
            <p>Trusted by 10,000+ engineers worldwide</p>
          </motion.div>
        </div>

        {/* Right Content / Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="flex-1 w-full max-w-xl lg:max-w-none relative mt-16 lg:mt-0"
        >
          {/* Glassmorphic Wrapper Card */}
          <div className="relative rounded-3xl p-1 overflow-hidden group">
            {/* Gradient Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100 duration-500" 
                 style={{ backgroundImage: `linear-gradient(to bottom right, ${themeConfig.colors.accent2}, ${themeConfig.colors.accent3}, ${themeConfig.colors.accent1})` }}></div>
            
            {/* Inner Card Content */}
            <div className="relative rounded-[23px] bg-[#0A0F1E]/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
              
              {/* Mockup Top Bar */}
              <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="mx-auto px-4 py-1 rounded-md bg-white/5 text-[10px] font-mono text-white/40 tracking-wider">civil-estimation-pro.ai</div>
              </div>
              
              {/* Mockup Body Content */}
              <div className="flex-1 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-3xl rounded-full"></div>
                
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="space-y-4">
                    <div className="h-24 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
                       <div className="flex items-center gap-2 text-white/60 text-xs font-medium"><Calculator className="w-4 h-4"/> Concrete Volume</div>
                       <div className="text-xl font-semibold text-slate-800 text-white">450 <span className="text-sm font-normal text-white/40">cu.m</span></div>
                    </div>
                    <div className="h-32 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-purple-500"></div>
                       <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2"><Layers className="w-4 h-4 text-amber-400"/> Cost Breakdown</div>
                       <div className="space-y-2 mt-4">
                         <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-400 w-[60%]"></div></div>
                         <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-purple-500 w-[30%]"></div></div>
                         <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-cyan-400 w-[10%]"></div></div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-8">
                    <div className="h-32 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col relative overflow-hidden">
                       <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/20 blur-xl rounded-full"></div>
                       <div className="flex items-center gap-2 text-white/60 text-xs font-medium"><FileText className="w-4 h-4"/> Live BOQ</div>
                       <div className="mt-auto space-y-1.5">
                          <div className="h-2 w-full rounded bg-white/10"></div>
                          <div className="h-2 w-4/5 rounded bg-white/10"></div>
                          <div className="h-2 w-5/6 rounded bg-white/10"></div>
                       </div>
                    </div>
                    <div className="h-20 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between backdrop-blur-md relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
                       <div>
                         <div className="text-white/60 text-xs font-medium">Status</div>
                         <div className="text-emerald-400 text-base font-medium flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3"/> Approved</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements Over Mockup */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-6 top-12 p-3 rounded-2xl bg-[#0A0F1E]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-3 z-20 overflow-hidden"
            >
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                 <span className="font-bold text-white text-lg">AI</span>
               </div>
               <div>
                 <div className="text-xs text-white/50">Accuracy</div>
                 <div className="text-base font-medium">99.8%</div>
               </div>
            </motion.div>
            
          </div>
        </motion.div>
      </div>

      {/* Client Logos Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="w-full md:max-w-7xl md:mx-auto mt-20 pt-10 border-t border-white/10 px-4 md:px-0"
      >
        <p className="text-center text-sm font-medium text-white/40 mb-8 uppercase tracking-widest" style={{ fontFamily: themeConfig.typography.headline }}>
          Powering the world's leading construction firms
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Logo placeholders using SVGs */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded bg-white/20 group-hover:bg-white/40 transition-colors"></div>
              <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: themeConfig.typography.headline }}>Partner {i}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
