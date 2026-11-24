import React from 'react';

export function FooterDisclaimer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full max-w-6xl mx-auto px-4 py-8 mt-12 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl"
      role="contentinfo"
    >
      <div className="text-center space-y-4">
        <div className="bg-[#FFFBEB] border border-accent-400/60 rounded-2xl px-5 py-4 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            <strong className="font-semibold text-[#111827]">Disclaimer:</strong> This estimate is algorithmically generated based on benchmark rates and standard assumptions. It should not be used as a substitute for a professional BOQ certified by a licensed structural engineer or quantity surveyor.
          </p>
        </div>
        <p className="text-xs text-[#475569]">
          &copy; {currentYear} Civil Estimation Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
