import { Button } from './/Button';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  // Mirrors currentStep for use inside timers/listeners (avoids stale closures).
  const currentStepRef = useRef(0);
  // Which step index we already scrolled into view (scroll at most once per step).
  const scrolledStepRef = useRef(-1);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentStepRef.current = currentStep;
    // A new step may need its own one-time scroll.
    scrolledStepRef.current = -1;
  }, [currentStep]);

  const handleClose = useCallback(() => {
    localStorage.setItem(`tour_seen_${tourId}`, 'true');
    setHasSeen(true);
    if (onComplete) onComplete();
  }, [tourId, onComplete]);

  useEffect(() => {
    const seen = localStorage.getItem(`tour_seen_${tourId}`);
    if (seen === 'true') {
      setHasSeen(true);
    }
  }, [tourId]);

  // Recompute the highlight/popup position from the target's current rect.
  // Deliberately NEVER scrolls: scrolling from a scroll/resize listener
  // restarts the smooth scroll on every event and the page can never settle.
  const reposition = useCallback(() => {
    const idx = currentStepRef.current;
    if (idx >= steps.length) return;
    const el = document.querySelector(steps[idx].targetSelector) as HTMLElement | null;
    setTargetRect(el ? el.getBoundingClientRect() : null);
  }, [steps]);

  // Bring the target into view at most ONCE per step, and only when it is
  // actually outside the viewport. Instant (not smooth) so no animation
  // can be interrupted and re-triggered by the scroll events it causes.
  const ensureTargetVisible = useCallback(() => {
    const idx = currentStepRef.current;
    if (idx >= steps.length || scrolledStepRef.current === idx) return;
    const el = document.querySelector(steps[idx].targetSelector) as HTMLElement | null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const inView =
      r.top >= 0 &&
      r.bottom <= window.innerHeight &&
      r.left >= 0 &&
      r.right <= window.innerWidth;
    if (!inView) {
      scrolledStepRef.current = idx;
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      // The rect changes once the scroll lands; re-measure on the next frame.
      requestAnimationFrame(() => reposition());
    }
  }, [steps, reposition]);

  useEffect(() => {
    if (hasSeen || steps.length === 0) return;

    // Small delay to allow module animations to finish
    const tm = setTimeout(() => {
      const idx = currentStepRef.current;
      const step = steps[idx];
      if (!step) return;
      const el = document.querySelector(step.targetSelector) as HTMLElement | null;
      if (el) {
        ensureTargetVisible();
        reposition();
      } else {
        // Target not rendered yet (lazy chunk still loading): retry once.
        // If it never appears, move on instead of leaving a dimmed page
        // with a popup pointing at nothing and no way out.
        retryTimerRef.current = setTimeout(() => {
          const el2 = document.querySelector(step.targetSelector) as HTMLElement | null;
          if (el2) {
            ensureTargetVisible();
            reposition();
          } else if (idx < steps.length - 1) {
            setCurrentStep(idx + 1);
          } else {
            handleClose();
          }
        }, 500);
      }
    }, 1500);

    const handleReposition = () => reposition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      clearTimeout(tm);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [currentStep, hasSeen, steps, ensureTargetVisible, reposition, handleClose]);

  // Escape dismisses the tour. Capture phase + stopPropagation/preventDefault
  // so the app-level Escape handler (which navigates home) never sees it.
  useEffect(() => {
    if (hasSeen || steps.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [hasSeen, steps.length, handleClose]);

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

  if (hasSeen || steps.length === 0) return null;

  // Centred fallback (no target found yet, or the target never rendered).
  // NOTE: do NOT centre with transform: translate(-50%,-50%) — the popup is
  // a framer-motion div whose enter animation OWNS the transform, so the
  // translate is clobbered and the card sits at left:50% with its right
  // edge (Skip / close / Next) cut off the viewport on phones. Centre with
  // a computed pixel left instead; framer-motion never touches `left`.
  let popupStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: Math.max(8, (window.innerWidth - 300) / 2),
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
    // Never let the popup's top escape the viewport: even if the target sits
    // near the bottom edge, the card (and its close button) stays reachable.
    // The centred fallback uses a percentage top, so only clamp numeric tops.
    if (typeof popupStyle.top === 'number') {
      popupStyle.top = Math.max(8, Math.min(popupStyle.top, window.innerHeight - 300));
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-[9998] pointer-events-none transition-opacity duration-300" />
      
      {targetRect && (
        <div 
          className="fixed border-2 border-accent-500 rounded-xl z-[9998] pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(31,29,26,0.4)]"
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
          className="w-full max-w-[300px] bg-surface-default rounded-2xl shadow-2xl border border-ui-borderSubtle overflow-hidden font-sans"
        >
          <div className="p-5 relative">
            <Button 
              onClick={handleClose} 
              className="absolute top-3 right-3 text-txt-tertiary hover:text-txt-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-xs font-bold text-accent-800 uppercase tracking-wider mb-2">
              Guided Tour • Step {currentStep + 1} of {steps.length}
            </div>
            <h4 className="text-lg font-bold text-txt-primary mb-1">{steps[currentStep].title}</h4>
            <p className="text-sm text-txt-tertiary">{steps[currentStep].content}</p>
          </div>
          <div className="p-4 bg-surface-hover border-t border-border-color flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-txt-tertiary disabled:opacity-0 hover:text-txt-secondary flex items-center text-sm font-medium transition-colors outline-none"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleClose}
                className="text-txt-tertiary hover:text-txt-secondary text-sm font-medium px-2 py-2 transition-colors outline-none"
              >
                Skip tour
              </Button>
            </div>
            <Button
              onClick={handleNext}
              className="bg-ink hover:bg-ink-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shadow-brand-sm outline-none"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
