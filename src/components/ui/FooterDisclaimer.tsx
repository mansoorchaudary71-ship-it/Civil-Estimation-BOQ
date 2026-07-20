import React from 'react';

export function FooterDisclaimer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-blue-400/30 dark:border-slate-800"
      role="contentinfo"
    >
      <div className="text-center space-y-4">
        <p className="text-xs sm:text-sm text-blue-100 dark:text-blue-100 max-w-3xl mx-auto leading-relaxed">
          <strong className="font-semibold text-white dark:text-slate-300">Disclaimer:</strong> This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.
        </p>
        <p className="text-xs text-blue-100 dark:text-blue-100">
          &copy; {currentYear} Civil Estimation Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
