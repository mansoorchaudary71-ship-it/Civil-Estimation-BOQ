import { useState, useEffect } from 'react';

export interface RecentTool {
  id: string;
  timestamp: number;
  lastInputs?: Record<string, any>;
}

/** Guarded read of `cep_recent_tools`: corrupt or non-array stored values
 *  fall back to [] instead of throwing during render (this hook runs at App
 *  top level, outside any error boundary). Matches the guarded pattern used
 *  in TakeoffContext / rates.ts / boq.ts. */
function readRecentTools(): RecentTool[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('cep_recent_tools');
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(() => readRecentTools());

  const addRecentTool = (id: string, inputs?: Record<string, any>) => {
    setRecentTools(prev => {
      const filtered = prev.filter(t => t.id !== id);
      const newTool = { id, timestamp: Date.now(), lastInputs: inputs };
      const updated = [newTool, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('cep_recent_tools', JSON.stringify(updated));
      } catch {
        // Storage full / unavailable (private mode): keep the in-memory list.
      }
      return updated;
    });
  };

  return { recentTools, addRecentTool };
}
