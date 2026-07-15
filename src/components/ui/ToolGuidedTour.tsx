import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TourStep {
  targetSelector: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface ToolGuidedTourProps {
  steps: TourStep[];
  tourId: string;
  onComplete?: () => void;
}

export function ToolGuidedTour({ steps, tourId, onComplete }: ToolGuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(`tour_seen_${tourId}`);
    if (seen === 'true') {
      setHasSeen(true);
    }
  }, [tourId]);

  useEffect(() => {
    if (hasSeen || steps.length === 0) return;

    // Small delay to allow module animations to finish
    const tm = setTimeout(() => {
      calculatePosition();
    }, 1500);

    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(tm);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [currentStep, hasSeen, steps]);

  const calculatePosition = () => {
    if (currentStep >= steps.length) return;
    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector) as HTMLElement;
    
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If target not found, retry after a short delay or nullify
      setTimeout(() => {
        const retryEl = document.querySelector(step.targetSelector) as HTMLElement;
        if (retryEl) {
          setTargetRect(retryEl.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem(`tour_seen_${tourId}`, 'true');
    setHasSeen(true);
    if (onComplete) onComplete();
  };

  if (hasSeen || steps.length === 0) return null;

  let popupStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
  };

  if (targetRect) {
    const step = steps[currentStep];
    const margin = 16;
    if (step.placement === 'bottom') {
      popupStyle = {
        position: 'fixed',
        top: targetRect.bottom + margin,
        left: Math.max(10, targetRect.left + (targetRect.width / 2) - 150),
        zIndex: 9999,
      };
    } else if (step.placement === 'top') {
      popupStyle = {
        position: 'fixed',
        top: Math.max(10, targetRect.top - margin - 200),
        left: Math.max(10, targetRect.left + (targetRect.width / 2) - 150),
        zIndex: 9999,
      };
    } else if (step.placement === 'right') {
      popupStyle = {
        position: 'fixed',
        top: targetRect.top + (targetRect.height / 2) - 100,
        left: targetRect.right + margin,
        zIndex: 9999,
      };
    } else if (step.placement === 'left') {
      popupStyle = {
        position: 'fixed',
        top: targetRect.top + (targetRect.height / 2) - 100,
        left: Math.max(10, targetRect.left - margin - 300),
        zIndex: 9999,
      };
    }
    
    if (typeof popupStyle.left === 'number' && popupStyle.left > window.innerWidth - 320) {
      popupStyle.left = window.innerWidth - 320;
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-[9998] pointer-events-none transition-opacity duration-300" />
      
      {targetRect && (
        <div 
          className="fixed border-2 border-[#FF5F15] rounded-xl z-[9998] pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.4)]"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={popupStyle}
          className="w-full max-w-[300px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans"
        >
          <div className="p-5 relative">
            <button 
              onClick={handleClose} 
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">
              Guided Tour • Step {currentStep + 1} of {steps.length}
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">{steps[currentStep].title}</h4>
            <p className="text-sm text-slate-500">{steps[currentStep].content}</p>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-slate-400 disabled:opacity-0 hover:text-slate-700 flex items-center text-sm font-medium transition-colors outline-none"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm outline-none"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
