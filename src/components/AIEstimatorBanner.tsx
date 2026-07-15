import { CheckCircle2 } from "lucide-react";

interface AIEstimatorBannerProps {
  onOpenChat: () => void;
}

export default function AIEstimatorBanner({ onOpenChat }: AIEstimatorBannerProps) {
  return (
    <div className="w-full relative group rounded-[36px] bg-gradient-to-br from-[#e8e3ff] to-[#cce5ff] dark:from-slate-800 dark:to-slate-900 border border-white/50 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col items-center text-center p-8 sm:p-10 lg:p-14 transition-all duration-300">
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none dark:opacity-20"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
      ></div>

      <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-6 relative z-10">
        Your Civil Engineering Copilot
      </p>
      
      <h2 className="text-[36px] sm:text-[44px] md:text-[52px] leading-[1.05] font-extrabold text-[#0a0f25] dark:text-white tracking-tight mb-6 relative z-10 max-w-2xl mx-auto">
        Meet Your AI Estimator
      </h2>
      
      <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg lg:text-[19px] mb-10 leading-relaxed font-medium max-w-[420px] mx-auto relative z-10">
        Describe your project naturally to instantly generate accurate material takeoffs and cost estimations.
      </p>

      <button onClick={onOpenChat} className="relative group/btn z-10 w-full sm:w-auto mb-10 bg-gradient-to-tr from-[#0a0f25] via-slate-800 to-[#0a0f25] dark:from-indigo-600 dark:via-blue-600 dark:to-indigo-600 text-white font-bold py-4 px-12 rounded-full text-[15px] sm:text-base whitespace-nowrap hover:shadow-[0_12px_30px_-6px_rgba(10,15,37,0.4)] dark:hover:shadow-[0_12px_30px_-6px_rgba(37,99,235,0.4)] transition-all duration-500 active:scale-95 overflow-hidden hover:-translate-y-0.5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-12"></div>
        <span className="relative z-10 flex items-center justify-center gap-2">
          Start Chatting
          <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase relative z-10">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          BOQ Generation
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Cost Estimation
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Material Takeoff
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Free to use
        </div>
      </div>
    </div>
  );
}
