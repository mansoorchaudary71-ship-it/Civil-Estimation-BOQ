const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export default function NewsletterSignupCard() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const controls = useAnimation();

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) return "Please enter a valid email address";
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

    // Honeypot check - silently ignore bots
    if (honeypot) {
      return;
    }

    const validationError = validateEmail(email);
    if (validationError) {
      setIsTouched(true);
      setError(validationError);
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      return;
    }
    
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(\`Subscribed successfully with \${email}\`, {
        style: {
          borderRadius: "12px",
          background: "#1e293b",
          color: "#fff",
          fontSize: "14px",
          padding: "12px 16px",
        },
        iconTheme: {
          primary: "#10b981",
          secondary: "#fff",
        },
      });
      setEmail("");
      setIsTouched(false);
      setError("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden flex flex-col items-center justify-center bg-white dark:bg-[#121212] px-6 py-14 md:py-20 rounded-[32px] md:rounded-[40px] border border-gray-100 dark:border-white/5 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] w-full max-w-3xl mx-auto"
    >
      {/* Decorative background envelopes */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden flex items-center justify-center">
        <div className="grid grid-cols-6 md:grid-cols-8 gap-8 md:gap-12 transform -rotate-12 scale-150">
          {Array.from({ length: 48 }).map((_, i) => (
             <Mail key={i} className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1} />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        {/* Main Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fa5c5c] to-[#f58145] rounded-[24px] shadow-lg shadow-[#ff5722]/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <Mail className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3 uppercase">
          Subscribe
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-[15px] md:text-base leading-relaxed max-w-md mb-8 md:mb-10">
          Subscribe to our newsletter & stay updated
        </p>
        
        {/* Form */}
        <form onSubmit={handleSubscribe} className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-3 md:gap-4 relative">
          {/* Honeypot field - visually hidden to catch bots */}
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

          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <Mail className={\`w-5 h-5 \${error ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}\`} strokeWidth={2} />
            </div>
            <motion.input 
              animate={controls}
              type="email" 
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              className={\`w-full h-14 md:h-14 pl-12 pr-5 rounded-full bg-gray-100 dark:bg-white/5 border-2 \${error ? 'border-red-500 focus:border-red-500 focus:bg-white' : 'border-transparent focus:border-gray-200 focus:bg-white dark:focus:bg-white/10 dark:focus:border-white/20'} text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner relative z-0\`}
            />
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-red-500 font-medium whitespace-nowrap"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            type="submit"
            disabled={isSubscribing}
            className="w-full sm:w-[140px] h-14 md:h-14 rounded-full bg-gradient-to-r from-[#fa5c5c] to-[#f58145] hover:from-[#f54e4e] hover:to-[#ee7535] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#f58145]/30 shrink-0 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubscribing ? "Wait..." : "Submit"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
`;

fs.writeFileSync('src/components/NewsletterSignupCard.tsx', code);
