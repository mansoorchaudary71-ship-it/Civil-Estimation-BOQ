import { Button } from './ui/Button';
import React from "react";
import { AnimatedCounter } from "./ui/AnimatedCounter";
import { ArrowRight, CheckCircle2, User, Sparkles, Building, Globe, ShieldCheck } from "lucide-react";


export default function PremiumHero() {
  return (
    <div className="w-full bg-slate-50 pt-16 pb-12 px-6 lg:px-12 flex flex-col items-center">
      {/* --- HERO SECTION --- */}
      <div className="w-full md:max-w-[1200px] md:mx-auto text-center flex flex-col items-center justify-center px-4 md:px-0">
        
        {/* Headline */}
        <h1 className="md: lg: leading-[1.1] mb-6 text-xl font-semibold text-txt-primary tracking-tight">
          Free Civil Engineering <br className="hidden md:block" />
          <span className="text-purple-600">Estimation</span> Platform
        </h1>

        {/* Subheadline & Social Proof */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <p className="md: max-w-2xl text-center text-base font-normal text-txt-secondary leading-relaxed">
            The ultimate suite of construction calculators. Generate pixel-perfect BOQs, takeoff sheets, and material estimates instantly.
          </p>
          <div className="w-full flex items-center gap-3 bg-surface-default px-4 py-2 rounded-full border border-ui-borderSubtle shadow-sm mt-2 overflow-hidden">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-txt-secondary" />
                </div>
              ))}
            </div>
            <p className="text-base font-normal text-txt-secondary leading-relaxed">
              <AnimatedCounter end={10000} suffix="+" duration={2.5} className="inline-block" /> Engineers Trust Us
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Button variant="premium" size="lg" className="w-full sm:w-auto px-8 group" rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}>Start Estimating for Free</Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">Explore Tools</Button>
        </div>
      </div>

      {/* --- TRUST BADGES & STATS (4-COLUMN GRID) --- */}
      <div className="w-full md:max-w-[1200px] md:mx-auto mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
        {[
          { val: "40+", lab: "Professional Tools", icon: Building },
          { val: "100%", lab: "Free Forever", icon: ShieldCheck },
          { val: "15+", lab: "Countries Trusted", icon: Globe },
          { val: "AI", lab: "Powered Estimates", icon: Sparkles }
        ].map((stat, i) => (
          <div key={i} className="w-full flex flex-col items-center p-4 sm:p-6 bg-surface-default rounded-2xl border border-ui-borderSubtle shadow-sm hover:shadow-md hover:-translate-y-1 transform-gpu transition-all duration-300 ease-out text-center overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 text-purple-600">
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="tabular-nums mb-1 text-lg font-medium text-txt-primary mb-4">
              {stat.val === "40+" ? <AnimatedCounter end={40} suffix="+" duration={2} /> :
               stat.val === "100%" ? <AnimatedCounter end={100} suffix="%" duration={2} /> :
               stat.val === "15+" ? <AnimatedCounter end={15} suffix="+" duration={2} /> :
               stat.val}
            </h3>
            <p className="uppercase tracking-widest text-base font-normal text-txt-secondary leading-relaxed">{stat.lab}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
