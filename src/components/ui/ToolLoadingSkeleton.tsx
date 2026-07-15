import React from "react";

export function ToolLoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative w-full h-full p-4 sm:p-8 animate-pulse">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden" />
          <div className="space-y-3 flex-1">
            <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden" />
            <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden" />
            <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden" />
          </div>
          <div className="space-y-6">
            <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden" />
            <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
