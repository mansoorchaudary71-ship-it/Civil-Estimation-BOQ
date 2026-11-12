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
      <div className="absolute inset-0 bg-gradient-to-br from-surface-hover to-surface-default dark:from-ink-800 dark:to-ink rounded-2xl border border-ui-borderSubtle/60 dark:border-ink/60 overflow-hidden">
         {/* Subtle glowing orbs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400/10 dark:bg-accent-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/20 text-accent-700 dark:text-accent-400 text-xs font-bold uppercase tracking-wider mb-6">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
            </span>
            Join 15,000+ Engineers
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-txt-primary dark:text-white mb-4 leading-tight">
            Stop Guessing Costs. <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-600">Start Winning Bids.</span>
          </h2>
          
          <p className="text-txt-secondary dark:text-txt-tertiary text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 font-medium">
            Join 15,000+ contractors getting free weekly insights on live material rates, professional takeoff strategies, and plug-and-play BOQ templates.
          </p>

          <div className="flex flex-col gap-3 mb-8 md:mb-0 hidden md:flex">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-txt-secondary dark:text-txt-tertiary">
                <div className="w-5 h-5 rounded-full bg-ui-success dark:bg-ui-successText/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-ui-successText dark:text-ui-successText" strokeWidth={3} />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Area */}
        <div className="w-full max-w-md">
          <div className="bg-surface-default/80 dark:bg-ink/80 backdrop-blur-xl border border-ui-borderSubtle/80 dark:border-ink-600/50 p-6 md:p-8 rounded-2xl shadow-brand-lg shadow-border-color/40 dark:shadow-none">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="w-16 h-16 bg-ui-success dark:bg-ui-successText/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-ui-successText dark:text-ui-successText" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-2xl font-bold text-txt-primary dark:text-white mb-2">You're on the list!</h4>
                  <p className="text-txt-secondary text-base font-medium mb-6">
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
                    <label htmlFor="newsletter-email" className="text-sm font-bold text-txt-primary ml-1">Work Email Address <span className="text-ui-errorText" aria-hidden="true">*</span></label>
                    <div className="relative group w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 transition-colors">
                        <Mail className={`w-5 h-5 ${error ? 'text-ui-errorText' : 'text-txt-tertiary dark:text-txt-tertiary group-focus-within:text-accent-700'}`} strokeWidth={2.5} />
                      </div>
                      <motion.input 
                        id="newsletter-email"
                        animate={controls}
                        type="email" 
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={handleBlur}
                        className={`w-full h-14 pl-12 pr-4 rounded-xl bg-surface-hover dark:bg-ink-900/50 border-2 ${error ? 'border-ui-errorText focus:border-ui-errorText focus:ring-ui-errorText/20' : 'border-ui-borderSubtle dark:border-ink focus:border-accent-500 focus:ring-accent-500/20'} text-txt-primary dark:text-white placeholder:text-txt-tertiary font-medium focus:outline-none focus:ring-4 transition-all relative z-0 text-base`}
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
                          className="flex items-center gap-1.5 text-sm text-ui-errorText font-bold pl-1"
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
  Get Free Weekly Insights
</Button>

                  <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold text-txt-tertiary dark:text-txt-tertiary uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>No Spam</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-secondary-300 dark:bg-ink-600" />
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
