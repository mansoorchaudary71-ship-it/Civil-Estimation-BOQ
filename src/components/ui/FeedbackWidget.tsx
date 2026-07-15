import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';

export function FeedbackWidget({ toolName }: { toolName: string }) {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);

  const handleRating = (value: 'up' | 'down') => {
    setRating(value);
    setSubmitted(true);
    // Real implementation would log this feedback to analytics/db
  };

  return (
    <div className="no-print w-full bg-white rounded-[32px] p-4 sm:p-4 sm:p-4 sm:p-6 md:p-4 sm:p-4 sm:p-4 sm:p-8 border border-slate-100 shadow-sm overflow-hidden">
      {!submitted ? (
        <div className="flex flex-col items-center justify-center text-center">
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-2">Was this {toolName} helpful?</h3>
          <p className="text-base text-slate-600 leading-relaxed mb-6">Help us improve by providing quick feedback.</p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => handleRating('up')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium text-slate-700 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <ThumbsUp className="w-5 h-5" />
              Yes, it was
            </button>
            <button 
              onClick={() => handleRating('down')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors font-medium text-slate-700 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              <ThumbsDown className="w-5 h-5" />
              No, needs work
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Thanks for your feedback!</h3>
          <p className="text-sm text-slate-500">Your opinion helps us make Civil Estimation Pro better.</p>
        </div>
      )}
    </div>
  );
}
