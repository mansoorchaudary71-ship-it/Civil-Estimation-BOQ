import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook to automatically save and restore state to/from localStorage.
 * 
 * @param moduleId Unique identifier for the module (e.g. 'slab-estimator')
 * @param state Object containing all fields to be saved
 * @param setters Object containing setter functions for each field in 'state'
 */
export function useAutoSave<T>(
  moduleId: string, 
  state: T, 
  onRestore: ((state: T) => void) | Record<string, (val: any) => void>
) {
  const [isRestored, setIsRestored] = useState(false);
  const debouncedState = useDebounce(state, 1000);

  // Restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem(`autosave_${moduleId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof onRestore === 'function') {
          onRestore(parsed);
        } else {
          Object.entries(parsed).forEach(([key, value]) => {
            const setter = (onRestore as Record<string, (val: any) => void>)[key];
            if (setter && value !== undefined && value !== null) {
              setter(value);
            }
          });
        }
      } catch (e) {
        console.error(`[useAutoSave] Failed to restore state for ${moduleId}`, e);
      }
    }
    setIsRestored(true);
  }, [moduleId]);

  // Save state when it changes (debounced)
  useEffect(() => {
    if (!isRestored) return;
    localStorage.setItem(`autosave_${moduleId}`, JSON.stringify(debouncedState));
  }, [debouncedState, moduleId, isRestored]);
}

/**
 * Hook to clear autosaved data for a specific module
 */
export function useClearAutoSave() {
  return (moduleId: string) => localStorage.removeItem(`autosave_${moduleId}`);
}
