import { Button } from "./ui/Button";
import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, Lock, ShieldCheck, Check, Loader2, ArrowRight } from 'lucide-react';
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
    }, 1200);
  };

  const features = [
    "Weekly BOQ Templates",
    "Cost Trends & Market Rates",
    "Expert Estimation Techniques"
  ];

  return (
    <div className="w-full relative py-12 md:py-16">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-[#0B0F19] rounded-2xl border border-ui-borderSubtle/60 dark:border-slate-800/60 overflow-hidden">
         {/* Subtle glowing orbs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-12"
      >
        {/* Left Content Area */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Join 15,000+ Engineers
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-txt-primary dark:text-white mb-4 leading-tight">
            Smarter estimation, <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa5c5c] to-[#f58145]">delivered weekly.</span>
          </h2>
          
          <p className="text-txt-tertiary dark:text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 font-medium">
            Get exclusive access to pre-built BOQ templates, live material rate updates, and expert strategies to win more bids.
          </p>

          <div className="flex flex-col gap-3 mb-8 md:mb-0 hidden md:flex">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-txt-secondary dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Area */}
        <div className="w-full max-w-md">
          <div className="bg-surface-default/80 dark:bg-slate-900/80 backdrop-blur-xl border border-ui-borderSubtle/80 dark:border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-xl font-bold text-txt-primary dark:text-white mb-2">You're on the list!</h4>
                  <p className="text-txt-tertiary dark:text-slate-400 text-sm mb-6">
                    Check your inbox for confirmation and your first exclusive resource.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setIsSuccess(false)}>Subscribe another email</Button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubscribe} 
                  className="w-full flex flex-col gap-4"
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
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="newsletter-email" className="text-sm font-bold text-txt-secondary dark:text-slate-300 ml-1">Email address</label>
                    <div className="relative group w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-colors">
                        <Mail className={`w-5 h-5 ${error ? 'text-rose-500' : 'text-slate-400 dark:text-txt-tertiary group-focus-within:text-orange-500'}`} strokeWidth={2.5} />
                      </div>
                      <motion.input 
                        id="newsletter-email"
                        animate={controls}
                        type="email" 
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={handleBlur}
                        className={`w-full h-14 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border-2 ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-ui-borderSubtle dark:border-slate-800 focus:border-[#fa5c5c] focus:ring-[#fa5c5c]/20'} text-txt-primary dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 transition-all relative z-0 text-base`}
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
                          className="flex items-center gap-1.5 text-sm text-rose-500 font-bold pl-1"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Button
  type="submit"
  variant="premium"
  size="lg"
  fullWidth
  isLoading={isSubscribing}
  loadingText="Subscribing..."
  rightIcon={<ArrowRight className="w-4 h-4" />}
  className="mt-2"
>
  Subscribe Now
</Button>

                  <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold text-slate-400 dark:text-txt-tertiary uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>No Spam</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Unsubscribe anytime</span>
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
