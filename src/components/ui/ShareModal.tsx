import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ShareModal({ 
  isOpen, 
  onClose, 
  url, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  url: string; 
  title: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error('Error generating QR code', error);
      });
    }
  }, [isOpen, url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this civil engineering calculation tool: ${title}`,
          url
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[201] overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-500" />
                  Share Tool
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6 w-fit overflow-hidden">
                  <canvas ref={canvasRef} className="rounded-lg w-full max-w-[200px]" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed">
                  Scan this QR code with your mobile device to open the calculator directly on-site.
                </p>

                <div className="w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <><label htmlFor="a11y-input-589" className="sr-only">Input</label>
<input id="a11y-input-589"
                      type="text"
                      readOnly
                      value={url}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium  text-slate-900 dark:text-white  dark:text-slate-300 outline-none truncate"
                    /></>
                    <button
                      onClick={handleCopy}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      title="Copy Link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center shrink-0"
                    title="System Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
