import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, Lock, ShieldCheck, Star, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export default function NewsletterSignupCard() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const controls = useAnimation();

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
    return "";
  };

  useEffect(() => {
    if (isTouched) {
      setError(validateEmail(email));
    }
  }, [email, isTouched]);

  const handleBlur = () => {
    setIsTouched(true);
    setError(validateEmail(email));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (honeypot) return;

    const validationError = validateEmail(email);
    if (validationError) {
      setIsTouched(true);
      setError(validationError);
      controls.start({
        x: [0, -8, 8, -8, 8, 0],
        transition: { duration: 0.4 }
      });
      return;
    }
    
    setIsSubscribing(true);

    setTimeout(() => {
      setIsSubscribing(false);
      setIsSuccess(true);
      setEmail("");
      setIsTouched(false);
      setError("");
    }, 1500);
  };

  const features = [
    "Weekly BOQ Templates",
    "Quantity Takeoff Tips",
    "Cost Estimation Guides",
    "Industry Insights",
    "Product Updates",
    "Free Resources"
  ];

  return (
    <div className="relative w-full max-w-6xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      {/* Subtle blurred background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-3/4 bg-[#f58145]/10 dark:bg-[#fa5c5c]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-slate-200/40 dark:shadow-none rounded-[24px] w-full p-8 md:p-16 lg:p-20"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.03] overflow-hidden flex items-center justify-center">
          <div className="grid grid-cols-12 gap-8 transform -rotate-12 scale-150">
            {Array.from({ length: 96 }).map((_, i) => (
               <Mail key={i} className="w-12 h-12 text-slate-500" strokeWidth={1} />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
            Trusted by Civil Engineers Worldwide
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Stay Ahead in <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#fa5c5c] to-[#f58145]">Civil Estimation</span>
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
            Get weekly BOQ templates, quantity takeoff techniques, cost estimation insights, industry news, product updates and exclusive engineering resources delivered directly to your inbox.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 px-4 py-2 rounded-full shadow-sm">
                <Check className="w-4 h-4 text-[#10b981]" strokeWidth={3} />
                {feature}
              </div>
            ))}
          </div>

          <div className="w-full max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl"
                >
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">🎉 You're subscribed!</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-base">
                    Check your inbox for confirmation and your first exclusive resource.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-sm font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Subscribe another email
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubscribe} 
                  className="w-full flex flex-col gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input 
                    type="text"
                    name="customer_company"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Desktop inline, Mobile stacked */}
                  <div className="flex flex-col md:flex-row gap-4 items-start w-full">
                    <div className="flex flex-col gap-1.5 w-full flex-1">
                      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                      <div className="relative group w-full">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10 transition-colors group-focus-within:text-orange-500">
                          <Mail className={`w-5 h-5 ${error ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500 group-focus-within:text-orange-500'}`} strokeWidth={2} />
                        </div>
                        <motion.input 
                          id="newsletter-email"
                          animate={controls}
                          type="email" 
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleBlur}
                          className={`w-full h-16 pl-14 pr-5 rounded-[16px] bg-white dark:bg-slate-950/50 border-2 ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-orange-500/20'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all shadow-sm relative z-0 text-base`}
                          aria-invalid={error ? "true" : "false"}
                          aria-describedby={error ? "email-error" : undefined}
                        />
                      </div>
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            id="email-error"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="flex items-center gap-1.5 text-sm text-rose-500 font-medium overflow-hidden text-left pl-2"
                          >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={isSubscribing}
                      className="w-full md:w-auto h-16 px-10 rounded-[16px] bg-gradient-to-r from-[#fa5c5c] to-[#f58145] hover:from-[#f54e4e] hover:to-[#ee7535] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(245,129,69,0.3)] hover:shadow-[0_12px_24px_rgba(245,129,69,0.4)] transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden shrink-0 group"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      
                      {isSubscribing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Wait...
                        </>
                      ) : (
                        "Get Free Updates"
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>No Spam</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>Weekly Emails Only</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Privacy Protected</span>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
