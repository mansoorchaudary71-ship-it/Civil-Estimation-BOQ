import { useState, useEffect } from 'react';

export interface RecentTool {
  id: string;
  timestamp: number;
  lastInputs?: Record<string, any>;
}

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cep_recent_tools');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const addRecentTool = (id: string, inputs?: Record<string, any>) => {
    setRecentTools(prev => {
      const filtered = prev.filter(t => t.id !== id);
      const newTool = { id, timestamp: Date.now(), lastInputs: inputs };
      const updated = [newTool, ...filtered].slice(0, 5);
      localStorage.setItem('cep_recent_tools', JSON.stringify(updated));
      return updated;
    });
  };

  return { recentTools, addRecentTool };
}
