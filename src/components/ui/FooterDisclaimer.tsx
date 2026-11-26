import React from 'react';

export function FooterDisclaimer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-border-color bg-surface-hover rounded-2xl"
      role="contentinfo"
    >
      <div className="text-center space-y-4">
        <div className="bg-accent-50 border border-accent-400/60 rounded-2xl px-5 py-4 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
            <strong className="font-semibold text-txt-primary">Disclaimer:</strong> This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.
          </p>
        </div>
        <p className="text-xs text-txt-secondary">
          &copy; {currentYear} Civil Estimation Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
