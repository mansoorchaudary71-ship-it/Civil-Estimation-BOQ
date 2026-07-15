import { Sparkles, Bot, Zap, MessageSquare, Code2, Calculator } from "lucide-react";

interface AIEstimatorBannerProps {
  onOpenChat: () => void;
}

export default function AIEstimatorBanner({ onOpenChat }: AIEstimatorBannerProps) {
  return (
    <div className="w-full relative group rounded-3xl md:rounded-[40px] border border-slate-200/50 bg-white shadow-sm hover:shadow-xl overflow-hidden transition-all duration-700">
      
      {/* Animated Premium Backgrounds */}
      <div className="absolute top-0 -left-1/4 w-full h-full bg-gradient-to-r from-blue-100/50 via-indigo-100/30 to-purple-100/50 blur-3xl opacity-50 group-hover:translate-x-1/2 transition-transform duration-1000 ease-in-out pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] pointer-events-none"></div>
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4wMykiLz4KPC9zdmc+')] opacity-100 mix-blend-multiply pointer-events-none"></div>

      <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 h-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 w-full lg:w-auto">
          <div className="relative shrink-0 hidden sm:block">
            <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full group-hover:bg-blue-600/30 group-hover:scale-110 transition-all duration-700"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm transition-transform duration-700 group-hover:-rotate-6" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-3">
              <div className="sm:hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
                <Bot className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 group-hover:text-indigo-600 transition-colors duration-500">AI-Powered Copilot</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-blue-800 transition-all duration-500">
                  Meet Your AI Estimator
                </h3>
              </div>
            </div>
            
            <p className="text-slate-600 max-w-xl mb-7 text-[15px] sm:text-[17px] leading-relaxed font-medium">
              Describe your project naturally. We will instantly structure your entire BOQ, calculate material takeoffs, and reference building codes with extreme precision.
            </p>
            
            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "BOQ Generation", icon: <Code2 className="w-3.5 h-3.5" /> },
                { label: "Cost Estimation", icon: <Calculator className="w-3.5 h-3.5" /> },
                { label: "Material Takeoff", icon: <Sparkles className="w-3.5 h-3.5" /> }
              ].map((chip) => (
                <div key={chip.label} className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold px-3.5 py-2 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50 transition-all duration-300 cursor-default">
                  <div className="group-hover:animate-pulse">{chip.icon}</div>
                  {chip.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-center justify-center shrink-0 w-full lg:w-auto mt-4 lg:mt-0 pt-8 lg:pt-0 border-t border-slate-200/60 lg:border-t-0 lg:border-l lg:pl-10 relative">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

          <button onClick={onOpenChat} className="group/btn relative w-full lg:w-auto px-8 py-4 sm:py-5 bg-slate-900 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.5)] overflow-hidden flex items-center justify-center gap-3">
            
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover/btn:animate-[shimmer_2s_infinite]"></div>
            
            <span className="relative z-10 flex items-center justify-center gap-2 text-[15px] sm:text-base tracking-wide">
              Start Chatting
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 group-hover/btn:text-white transition-colors duration-300 group-hover/btn:scale-110 group-hover/btn:-rotate-12" />
            </span>
          </button>
          <div className="mt-5 flex items-center justify-center gap-2 tracking-wide text-[11px] sm:text-xs text-slate-500 font-semibold w-full">
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>FREE TO USE - NO SIGN-UP REQUIRED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
