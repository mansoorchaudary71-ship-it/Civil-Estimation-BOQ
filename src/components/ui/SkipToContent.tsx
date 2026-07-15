import React from 'react';

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 font-bold"
    >
      Skip to content
    </a>
  );
}
