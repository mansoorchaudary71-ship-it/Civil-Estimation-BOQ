import { Button } from './ui/Button';
import { CheckCircle2 } from "lucide-react";


interface AIEstimatorBannerProps {
  onOpenChat: () => void;
}

export default function AIEstimatorBanner({ onOpenChat }: AIEstimatorBannerProps) {
  return (
    <div className="w-full relative group rounded-2xl bg-gradient-to-br from-[#e8e3ff] to-[#cce5ff] dark:from-slate-800 dark:to-slate-900 border border-white/50 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col items-center text-center p-8 sm:p-10 lg:p-14 transition-all duration-300">
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none dark:opacity-20"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
      ></div>

      <p className="text-txt-tertiary dark:text-slate-400 text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-6 relative z-10">
        Your Civil Engineering Copilot
      </p>
      
      <h2 className="text-[36px] sm:text-[44px] md:text-[52px] leading-[1.05] font-extrabold text-[#0a0f25] dark:text-white tracking-tight mb-6 relative z-10 max-w-2xl mx-auto animate-float">
        Meet Your AI Estimator
      </h2>
      
      <p className="text-txt-secondary dark:text-slate-300 text-base sm:text-lg lg:text-[19px] mb-10 leading-relaxed font-medium max-w-[420px] mx-auto relative z-10">
        Describe your project naturally to instantly generate accurate material takeoffs and cost estimations.
      </p>

      <Button
        onClick={onOpenChat}
        variant="premium"
        size="lg"
        className="mb-10 w-full sm:w-auto px-12 z-10 group"
      >
        Start Chatting Now
        <svg className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Button>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[11px] sm:text-xs text-txt-tertiary dark:text-slate-400 font-medium tracking-wide uppercase relative z-10">
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
