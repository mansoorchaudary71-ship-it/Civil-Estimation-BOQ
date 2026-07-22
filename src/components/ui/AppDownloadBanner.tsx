import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppDownloadBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if not dismissed previously
    const dismissed = sessionStorage.getItem('app-banner-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('app-banner-dismissed', 'true');
  };

  const handleInstall = () => {
    // In a real PWA, you would trigger the install prompt here
    alert("This would trigger the PWA install prompt or open Play Store.");
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96 shadow-lg shadow-indigo-500/10 rounded-xl overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30"
        >
          <div className="p-4 flex items-start gap-4">
            <div className="bg-indigo-500/20 p-2.5 rounded-lg shrink-0">
              <Smartphone className="text-indigo-400" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm">Download Civil Estimation Pro</h4>
              <p className="text-indigo-200 text-xs mt-1 leading-relaxed">
                Get the offline Android APK or install the web app for field calculations on the go.
              </p>
              <div className="flex gap-3 mt-3">
                <button 
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded flex-1 justify-center transition-colors"
                >
                  <Download size={14} /> Install Now
                </button>
                <button 
                  onClick={handleDismiss}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded flex-1 justify-center transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-slate-400 hover:text-white shrink-0 p-1">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
