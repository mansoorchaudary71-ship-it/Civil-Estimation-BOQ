import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function ReadingTimeIndicator({ activeModule }: { activeModule: string }) {
  const [readingTime, setReadingTime] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const calculateTime = () => {
      const mainContent = document.getElementById("main-content");
      if (!mainContent) return;
      
      const text = mainContent.innerText || mainContent.textContent || "";
      const words = text.trim().split(/\s+/);
      const wordCount = words.filter(word => word.length > 0).length;
      
      // Average reading speed is ~225 words per minute
      const wordsPerMinute = 225; 
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      
      setReadingTime(minutes);
      
      // Show for pages that have some content
      if (minutes > 0 && wordCount > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Calculate initially with a small delay to allow for render
    timeoutId = setTimeout(calculateTime, 500);

    let mutTimeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(mutTimeout);
      mutTimeout = setTimeout(calculateTime, 500);
    });
    
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      observer.observe(mainContent, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(mutTimeout);
      observer.disconnect();
    };
  }, [activeModule]);

  if (!isVisible) return null;

  return (
    <div className="w-full flex justify-end px-4 md:px-8 py-2 relative z-20 pointer-events-none absolute top-0 right-0">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm pointer-events-auto transition-all animate-in fade-in slide-in-from-top-2">
        <Clock className="w-3.5 h-3.5 text-indigo-500" strokeWidth={2.5} />
        <span>{readingTime} min read</span>
      </div>
    </div>
  );
}
