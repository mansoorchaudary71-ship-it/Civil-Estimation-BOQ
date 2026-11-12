import React from 'react';

export function FooterDisclaimer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-accent-800/30 dark:border-ink"
      role="contentinfo"
    >
      <div className="text-center space-y-4">
        <p className="text-xs sm:text-sm text-accent-100 dark:text-accent-100 max-w-3xl mx-auto leading-relaxed">
          <strong className="font-semibold text-white dark:text-txt-tertiary">Disclaimer:</strong> This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.
        </p>
        <p className="text-xs text-accent-100 dark:text-accent-100">
          &copy; {currentYear} Civil Estimation Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
