import React from "react";
import { HelpCircle } from "lucide-react";

interface FieldTooltipProps {
  content: React.ReactNode;
}

export function FieldTooltip({ content }: FieldTooltipProps) {
  return (
    <div className="group relative inline-flex items-center ml-1.5 align-middle cursor-help">
      <HelpCircle className="w-3.5 h-3.5 text-txt-tertiary dark:text-txt-tertiary hover:text-accent-800 dark:hover:text-accent-400 transition-colors" />
      
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[130%] min-w-[240px] w-max max-w-sm p-3 bg-ink text-white text-xs font-medium rounded-lg shadow-brand-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none before:absolute before:content-[''] before:bottom-[-5px] before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-t-slate-800">
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
