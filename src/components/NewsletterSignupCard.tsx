import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSignupCard() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success(`Subscribed successfully with ${email}`, {
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
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between bg-white dark:bg-[#121212] p-8 md:p-12 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] gap-8 md:gap-12 w-full max-w-6xl mx-auto">
      
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
          <input 
            type="email" 
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 md:h-14 px-5 rounded-[16px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all"
            required
          />
          <button 
            type="submit"
            disabled={isSubscribing}
            className="w-full h-12 md:h-14 rounded-[16px] bg-[#ff5722] hover:bg-[#f4511e] text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#ff5722]/20"
          >
            {isSubscribing ? "Subscribing..." : "Subscribe"}
            {!isSubscribing && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
        
        {/* Microcopy */}
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-4 text-center px-2">
          We care about your data in our <a href="#" className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">privacy policy</a>.
        </p>
      </div>

    </div>
  );
}
