import React from "react";
import { AlertTriangle, ShieldCheck, Calendar, Globe, Code, ArrowRight } from "lucide-react";

export interface ToolPageFooterProps {
  toolName: string;
  standards: string[];
  formulaDescription: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lastUpdated: string;
  category: string;
}

export default function ToolPageFooter({
  toolName,
  standards,
  formulaDescription,
  difficulty,
  lastUpdated,
  category,
}: ToolPageFooterProps) {
  return (
    <div className="w-full bg-surface-hover dark:bg-ink-900 rounded-2xl p-6 sm:p-8 space-y-6 overflow-hidden text-txt-primary dark:text-txt-primary font-sans border border-border-color dark:border-ink-600">

      {/* Methodology & Standards Section */}
      <div className="bg-surface-default dark:bg-ink rounded-2xl p-6 sm:p-8 border border-border-color dark:border-ink-600">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-txt-primary dark:text-txt-primary mb-6">
          <Code className="w-5 h-5 text-accent-700 dark:text-accent-400" />
          Methodology & Standards
        </h3>
        <div className="mb-6">
          <p className="text-[15px] leading-relaxed text-txt-secondary dark:text-txt-secondary font-sans">
            {formulaDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {standards.length > 0 ? (
            standards.map((standard, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-accent-50 dark:bg-ink-600 text-txt-primary dark:text-txt-primary px-4 py-2 rounded-full text-sm font-medium border border-border-color dark:border-ink-600"
              >
                <ShieldCheck className="w-4 h-4 text-accent-700 dark:text-accent-400" />
                {standard}
              </div>
            ))
          ) : (
            <div className="text-sm font-medium text-txt-secondary dark:text-txt-secondary">Standard general practice formulas applied</div>
          )}
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-accent-50 dark:bg-ink rounded-2xl p-6 sm:p-8 flex gap-5 items-start border border-accent-400/60 dark:border-accent-500/40">
        <div className="shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6 text-accent-700 dark:text-accent-400" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-txt-primary dark:text-txt-primary mb-2 tracking-wide">
            Professional Liability Disclaimer
          </h4>
          <p className="text-[15px] font-normal text-txt-secondary dark:text-txt-secondary leading-relaxed">
            This tool is provided for educational and preliminary estimation purposes only. All calculations must be verified by a licensed professional engineer before being used in actual construction, design, or structural detailing. The creators assume no liability for direct, indirect, or consequential damages resulting from the use of this software.
          </p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-default dark:bg-ink rounded-2xl p-6 flex items-start gap-4 border border-border-color dark:border-ink-600">
          <Calendar className="w-5 h-5 text-txt-secondary dark:text-txt-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-txt-secondary dark:text-txt-tertiary uppercase tracking-widest mb-1.5">Last Reviewed</p>
            <p className="text-base font-semibold text-txt-primary dark:text-txt-primary">{lastUpdated}</p>
          </div>
        </div>

        <div className="bg-surface-default dark:bg-ink rounded-2xl p-6 flex items-start gap-4 border border-border-color dark:border-ink-600">
          <ShieldCheck className="w-5 h-5 text-txt-secondary dark:text-txt-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-txt-secondary dark:text-txt-tertiary uppercase tracking-widest mb-1.5">Complexity</p>
            <p className="text-base font-semibold text-txt-primary dark:text-txt-primary">{difficulty}</p>
          </div>
        </div>

        <div className="bg-surface-default dark:bg-ink rounded-2xl p-6 flex items-start gap-4 border border-border-color dark:border-ink-600">
          <Globe className="w-5 h-5 text-txt-secondary dark:text-txt-tertiary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-txt-secondary dark:text-txt-tertiary uppercase tracking-widest mb-1.5">Platform Category</p>
            <p className="text-base font-semibold text-txt-primary dark:text-txt-primary">{category}</p>
          </div>
        </div>
      </div>

      {/* Related Standards Links */}
      {standards.length > 0 && (
        <div className="bg-surface-default dark:bg-ink rounded-2xl p-6 sm:p-8 border border-border-color dark:border-ink-600">
          <h4 className="text-sm font-semibold text-txt-secondary dark:text-txt-tertiary uppercase tracking-widest mb-6">Official Standards References</h4>
          <div className="space-y-3">
            {standards.slice(0, 3).map((standard, idx) => (
              <a
                key={idx}
                href={`https://www.google.com/search?q=${encodeURIComponent(standard + " code civil engineering pdf")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-surface-hover dark:bg-ink-600 hover:bg-accent-50 dark:hover:bg-ink-700 p-4 rounded-xl transition-all duration-200 border border-border-color dark:border-ink-600 hover:border-accent-400"
              >
                <span className="text-[15px] font-medium text-txt-secondary group-hover:text-txt-primary dark:text-txt-secondary dark:group-hover:text-txt-primary transition-colors">
                  Reference Documentation for {standard}
                </span>
                <ArrowRight className="w-4 h-4 text-txt-secondary group-hover:text-accent-700 dark:text-txt-tertiary dark:group-hover:text-accent-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
