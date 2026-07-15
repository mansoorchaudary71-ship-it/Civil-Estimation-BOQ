import React, { useState } from 'react';
import PricingBackgroundWrapper from '../PricingBackgroundWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Building2, Zap, ArrowRight, ShieldCheck, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import { GlobalFAQ } from '../ui/GlobalFAQ';
import { cn } from "../../lib/utils";

// Mock logos for trusted strip
const LOGOS = [
  { name: "Acme Corp", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", width: 80 },
  { name: "Stark Ind", url: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg", width: 120 },
  { name: "Globex", url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", width: 80 },
  { name: "Wayne Ent", url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", width: 80 },
  { name: "Initech", url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", width: 100 },
];

const FAQS = [
  {
    question: "Do I need a credit card to start the trial?",
    answer: "No! You can start your 14-day free trial immediately without entering any payment information. We only ask for payment details when you're ready to upgrade."
  },
  {
    question: "What happens when my free trial ends?",
    answer: "Your account will automatically downgrade to the Free plan. You won't lose your data, but premium features like PDF exports and cloud saving will become inaccessible until you upgrade."
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time. Prorated refunds are applied automatically if you switch in the middle of a billing cycle."
  },
  {
    question: "Do you offer custom enterprise pricing?",
    answer: "Yes, for teams larger than 20 people, we offer custom enterprise pricing with dedicated support and onboarding. Contact our sales team for details."
  }
];

const ROI_DATA = {
  hoursPerBOQ: 4.5,
  hourlyRate: 45, // equivalent value of an engineer's time
};

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [boqCount, setBoqCount] = useState(10);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  
  const hoursSaved = Math.round(boqCount * ROI_DATA.hoursPerBOQ);
  const moneySaved = Math.round(hoursSaved * ROI_DATA.hourlyRate);
  
  const handleToggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <PricingBackgroundWrapper>
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans pb-24 overflow-x-hidden">
      
      {/* 14-day Free Trial Banner */}
      <div className="bg-indigo-600 dark:bg-indigo-500 text-white text-center text-sm font-medium py-2 px-4 shadow-sm">
        Start your 14-day free trial today. <span className="font-bold">No credit card required.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-xl font-semibold text-slate-800 dark:text-white"
          >
            Pricing that scales with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-amber-500">engineering needs</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 font-medium"
          >
            From solo estimators to enterprise teams, we have a plan to streamline your workflow and save you countless hours.
          </motion.p>
        </div>

        {/* Toggle Billing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center mb-16"
        >
          <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <button 
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2 rounded-full text-base font-medium transition-all z-10 w-32",
                !isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-6 py-2 rounded-full text-base font-medium transition-all z-10 w-32",
                isAnnual ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
            >
              Annual
            </button>
            <div 
              className={cn(
                "absolute top-2 bottom-2 w-32 bg-slate-100 dark:bg-slate-700 rounded-full transition-transform duration-300 z-0",
                isAnnual ? "translate-x-[136px]" : "translate-x-0"
              )}
            />
            {/* Save Badge */}
            <div className="absolute -top-3 -right-2 md:-right-8 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md transform rotate-12">
              Save 40%
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24 items-center">
          
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full mt-4 md:mt-0"
          >
            <div className="p-4 sm:p-8 md:p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm h-10">Essential tools for students and hobbyists.</p>
              <div className="my-6">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
              </div>
              <button className="w-full py-3 px-4 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-slate-700 dark:text-slate-300">
                Get Started
              </button>
            </div>
            <div className="p-8 flex-1 flex flex-col gap-4 text-sm font-medium">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-emerald-500 shrink-0"/> Basic Calculators</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-emerald-500 shrink-0"/> Web Access</div>
              <div className="flex items-center gap-3 text-slate-400"><X className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0"/> PDF Exports</div>
              <div className="flex items-center gap-3 text-slate-400"><X className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0"/> Cloud Saving</div>
              <div className="flex items-center gap-3 text-slate-400"><X className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0"/> AI Assistant</div>
              <div className="flex items-center gap-3 text-slate-400"><X className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0"/> Premium Support</div>
            </div>
          </motion.div>

          {/* Pro Tier (Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-amber-400/50 dark:border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)] md:-my-6 relative overflow-hidden flex flex-col z-10"
          >
            <div className="absolute top-0 left-0 right-0 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-center text-base font-medium tracking-widest uppercase">
              Most Popular
            </div>
            <div className="p-4 sm:p-8 md:p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-800/80 dark:to-slate-900 pt-12">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-2">
                Pro <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm h-10">Advanced features for professional estimators.</p>
              <div className="my-6">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  ${isAnnual ? '39' : '65'}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
                {isAnnual && <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Billed $468 yearly</div>}
              </div>
              <button className="w-full py-3.5 px-4 rounded-xl font-bold bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-slate-900 dark:text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                Start 14-Day Free Trial
              </button>
            </div>
            <div className="p-8 flex-1 flex flex-col gap-4 text-sm font-medium">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-amber-500 shrink-0"/> All Free Features</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-amber-500 shrink-0"/> PDF & Excel Exports</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-amber-500 shrink-0"/> Unlimited Cloud Saving</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-amber-500 shrink-0"/> Advanced BOQ Generator</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-amber-500 shrink-0"/> Cost Database Integration</div>
            </div>
          </motion.div>

          {/* Team Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full mt-4 md:mt-0"
          >
            <div className="p-4 sm:p-8 md:p-8 pb-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Team</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm h-10">Collaboration and admin controls for agencies.</p>
              <div className="my-6">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  ${isAnnual ? '89' : '149'}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">/mo</span>
                {isAnnual && <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Billed $1,068 yearly</div>}
              </div>
              <button className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                Contact Sales
              </button>
            </div>
            <div className="p-8 flex-1 flex flex-col gap-4 text-sm font-medium">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0"/> All Pro Features</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0"/> 5 User Seats Included</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0"/> Shared Team Database</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0"/> Analytics Dashboard</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0"/> Priority Support</div>
            </div>
          </motion.div>
        </div>
        
        {/* Trusted By Strip */}
        <div className="border-y border-slate-200 dark:border-slate-800/50 py-12 mb-24">
          <p className="text-center text-base font-medium uppercase tracking-widest mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {LOGOS.map((logo, idx) => (
              <img 
                key={idx} 
                src={logo.url} 
                alt={logo.name} 
                width={logo.width} 
                className="h-8 object-contain dark:invert"
              />
            ))}
          </div>
        </div>

        {/* ROI Calculator Widget */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-24 flex flex-col md:flex-row">
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">How much time will you save?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Drag the slider to see how Civil AI pays for itself.</p>
            
            <label className="text-base font-medium dark:text-slate-300 block mb-4 flex justify-between">
              <span>BOQs created per month</span>
              <span className="text-indigo-600 dark:text-indigo-400">{boqCount}</span>
            </label>
            <><label htmlFor="a11y-input-578" className="sr-only">Input</label>
<input id="a11y-input-578" 
              type="range" 
              min="1" 
              max="50" 
              value={boqCount} 
              onChange={(e) => setBoqCount(parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            /></>
          </div>
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center gap-8 bg-indigo-600 dark:bg-indigo-900 text-white">
            <div>
              <p className="text-indigo-200 font-medium mb-1 text-sm uppercase tracking-wider">Hours Saved</p>
              <div className="text-2xl font-black">{hoursSaved}<span className="text-2xl font-medium text-indigo-300"> hrs</span></div>
            </div>
            <div className="h-px bg-indigo-500/50 w-full" />
            <div>
              <p className="text-indigo-200 font-medium mb-1 text-sm uppercase tracking-wider">Money Saved</p>
              <div className="text-2xl font-black">${moneySaved}<span className="text-2xl font-medium text-indigo-300"> /mo</span></div>
              <p className="text-indigo-300 text-sm mt-2">*Based on typical industry estimating time and avg hourly rate.</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <GlobalFAQ faqs={FAQS} />

      </div>
    </div>
    </PricingBackgroundWrapper>
  );
}
