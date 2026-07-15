import React from "react";
import { useInView } from "react-intersection-observer";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Michael R.",
    title: "Civil Engineer",
    quote:
      "Civil Estimation Pro has completely transformed how I handle BOQ preparations. What used to take hours of manual Excel entries now takes minutes, with zero calculation errors.",
    rating: 5.0,
    initials: "MR"
  },
  {
    name: "Sarah K.",
    title: "Quantity Surveyor",
    quote:
      "The concrete mix design and structural estimators are incredibly accurate. It perfectly handles complex slab and footing calculations while adhering to standard codes.",
    rating: 5.0,
    initials: "SK"
  },
  {
    name: "David T.",
    title: "Contractor",
    quote:
      "For residential projects, the quick rough estimation tool gives me an accurate baseline for client quotes in under 5 minutes. I've won more bids since using this.",
    rating: 5.0,
    initials: "DT"
  }
];

const ShimmerStar = () => (
  <div className="relative">
    <Star className="w-5 h-5 fill-orange-500 text-blue-500" />
    <motion.div
      className="absolute inset-0 bg-white/50 rounded-full blur-[2px]"
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: Math.random() * 2 }}
    />
  </div>
);

export default function SocialProofSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="w-full py-16 md:py-20 relative overflow-hidden bg-transparent mb-8">
      {/* Subtle purple radial glow at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full md:max-w-7xl md:mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="md: lg: text-xl font-semibold text-slate-900 tracking-tight mb-4">
            Trusted by <span className="text-blue-500">10,000+</span> Engineers
          </h2>
        </div>

        <div ref={ref} className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:max-w-6xl md:mx-auto px-4 md:px-0">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
              className="w-full group bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="flex items-center gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <ShimmerStar key={i} />
                ))}
              </div>
              
              <p className="mb-6 flex-1 text-base font-normal text-slate-600 leading-relaxed">
                "{t.quote}"
              </p>
              
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-base shadow-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-base">{t.name}</div>
                  <div className="text-sm text-blue-500 font-medium tracking-wide">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}