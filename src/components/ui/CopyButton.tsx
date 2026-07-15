import React, { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
}

export function CopyButton({ textToCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy text. Please select and copy manually.');
    });
  };

  return (
    <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-lg shadow-sm w-full max-w-md border border-slate-200">
      <div 
        className="font-mono bg-slate-100 p-2.5 rounded border border-slate-300 text-slate-800 flex-1 truncate text-sm"
        title={textToCopy}
      >
        {textToCopy}
      </div>
      <button 
        onClick={handleCopy}
        className={`relative px-4 py-2.5 rounded font-bold text-white transition-all transform active:scale-95 text-sm ${
          copied ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {copied ? '✓' : 'Copy'}
        {/* Tooltip */}
        <div 
          className={`absolute bottom-[130%] left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-all duration-300 pointer-events-none ${
            copied ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          Copied!
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></div>
        </div>
      </button>
    </div>
  );
}
