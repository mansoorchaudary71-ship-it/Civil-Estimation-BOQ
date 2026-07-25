const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsletterSignupCard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

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
    const validationError = validateEmail(email);
    if (validationError) {
      setIsTouched(true);
      setError(validationError);
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

  const isValid = !validateEmail(email);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col md:flex-row justify-between bg-white dark:bg-[#121212] p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] gap-8 md:gap-12 w-full max-w-6xl mx-auto"
    >
      
      {/* Text Section */}
      <div className="flex-1 max-w-lg">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
          Stay updated
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
          Get the latest updates on civil engineering standards, new tools, and platform features delivered directly to your inbox.
        </p>
        <p className="text-sm text-[#ff5722] font-semibold mt-4">
          Join 1,250+ other professionals
        </p>
      </div>
      
      {/* Form Section */}
      <div className="w-full md:w-[400px]">
        <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
          <div className="relative">
            <input 
              type="email" 
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              className={\`w-full h-12 md:h-14 px-5 rounded-[16px] bg-gray-50 dark:bg-white/5 border \${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 dark:border-white/10 focus:ring-[#ff5722]/20 focus:border-[#ff5722]'} text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all\`}
            />
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute -bottom-6 left-2 flex items-center gap-1.5 text-xs text-red-500 font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            type="submit"
            disabled={isSubscribing || (isTouched && !isValid) || !email}
            className="w-full h-12 md:h-14 mt-1 rounded-[16px] bg-[#ff5722] hover:bg-[#f4511e] text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#ff5722]/20"
          >
            {isSubscribing ? "Subscribing..." : "Subscribe"}
            {!isSubscribing && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
        
        {/* Microcopy */}
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-5 text-center px-2">
          We care about your data in our <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">privacy policy</a>.
        </p>
      </div>

    </motion.div>
  );
}
`;

fs.writeFileSync('src/components/NewsletterSignupCard.tsx', code);
