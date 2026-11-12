import { Button } from './/Button';
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
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-surface-default dark:bg-ink rounded-2xl shadow-2xl z-[201] overflow-hidden border border-border-color dark:border-ink"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight text-txt-primary dark:text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-accent-800" />
                  Share Tool
                </h3>
                <Button
                  onClick={onClose}
                  className="p-2 -mr-2 text-txt-tertiary hover:text-txt-secondary dark:hover:text-txt-primary transition-colors rounded-full hover:bg-surface-hover"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-surface-default p-3 rounded-2xl shadow-brand-sm border border-border-color mb-6 w-fit overflow-hidden">
                  <canvas ref={canvasRef} className="rounded-lg w-full max-w-[200px]" />
                </div>
                <p className="text-sm font-medium text-txt-secondary dark:text-txt-tertiary text-center mb-6 leading-relaxed">
                  Scan this QR code with your mobile device to open the calculator directly on-site.
                </p>

                <div className="w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <><label htmlFor="a11y-input-589" className="sr-only">Input</label>
<input id="a11y-input-589"
                      type="text"
                      readOnly
                      value={url}
                      className="w-full pl-4 pr-12 py-3 bg-surface-default/50 border border-ui-borderSubtle dark:border-ink-600 rounded-xl text-sm font-medium  text-txt-primary dark:text-white  dark:text-txt-tertiary outline-none truncate"
                    /></>
                    <Button
                      onClick={handleCopy}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-txt-tertiary hover:text-txt-secondary dark:hover:text-txt-primary hover:bg-surface-hover rounded-md transition-colors"
                      title="Copy Link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-ui-successText" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={handleShare}
                    className="p-3 bg-accent-50 dark:bg-accent-500/10 text-accent-800 dark:text-accent-400 border border-accent-100 dark:border-accent-800/20 rounded-xl hover:bg-accent-100 dark:hover:bg-ink-700/20 transition-colors flex items-center justify-center shrink-0"
                    title="System Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
