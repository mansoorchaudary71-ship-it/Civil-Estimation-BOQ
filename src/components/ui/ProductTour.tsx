import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const TOUR_STEPS = [
  {
    targetId: 'tools-section',
    title: 'Explore Tools',
    content: 'Browse our collection of 50+ professional civil engineering calculators and simulators.',
    placement: 'top',
  },
  {
    targetId: 'smart-search-input',
    title: 'Smart Search',
    content: 'Instantly find the tool you need. Try searching for "Earthworks" or "Concrete Mix".',
    placement: 'bottom',
  },
  {
    targetId: 'app-sidebar-trigger',
    title: 'Your Workspace',
    content: 'Access your favorite tools, saved projects, and recent estimates from the sidebar.',
    placement: 'right',
  }
];

export function ProductTour() {
  const { settings, updateSettings } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!settings.onboardingComplete || settings.hasSeenTour) return;

    // Wait a brief moment for the DOM to settle
    const tm = setTimeout(() => {
      calculatePosition();
    }, 1000);

    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(tm);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [currentStep, settings.onboardingComplete, settings.hasSeenTour]);

  const calculatePosition = () => {
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    // fallback to body if not found
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
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
    updateSettings({ hasSeenTour: true });
  };

  if (!settings.onboardingComplete || settings.hasSeenTour) return null;

  let popupStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
  };

  if (targetRect) {
    const step = TOUR_STEPS[currentStep];
    const margin = 16;
    if (step.placement === 'bottom') {
      popupStyle = {
        position: 'fixed',
        top: targetRect.bottom + margin,
        left: targetRect.left + (targetRect.width / 2) - 150,
        zIndex: 9999,
      };
    } else if (step.placement === 'top') {
      popupStyle = {
        position: 'fixed',
        top: Math.max(10, targetRect.top - margin - 200),
        left: targetRect.left + (targetRect.width / 2) - 150,
        zIndex: 9999,
      };
    } else if (step.placement === 'right') {
      popupStyle = {
        position: 'fixed',
        top: targetRect.top + (targetRect.height / 2) - 100,
        left: targetRect.right + margin,
        zIndex: 9999,
      };
    }
    
    // Bounds check to avoid rendering off-screen
    if (typeof popupStyle.left === 'number' && popupStyle.left < 10) popupStyle.left = 10;
  }

  return (
    <>
      {/* Dimmed Overlay */}
      <div className="fixed inset-0 bg-slate-900/40 z-[9998] pointer-events-none transition-opacity duration-300" />
      
      {/* Highlight Target Box */}
      {targetRect && (
        <div 
          className="fixed border-2 border-indigo-500 rounded-xl z-[9998] pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.4)',
          }}
        />
      )}

      {/* Popover */}
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
            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">
              Tip {currentStep + 1} of {TOUR_STEPS.length}
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">{TOUR_STEPS[currentStep].title}</h4>
            <p className="text-sm text-slate-500">{TOUR_STEPS[currentStep].content}</p>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm outline-none"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
