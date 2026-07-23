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
    <div className="w-full bg-[#0a0a0a] rounded-[24px] p-6 sm:p-8 space-y-6 overflow-hidden text-white font-sans border border-white/5">
      
      {/* Methodology & Standards Section */}
      <div className="bg-[#141414] rounded-2xl p-6 sm:p-8">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-white mb-6">
          <Code className="w-5 h-5 text-indigo-400" />
          Methodology & Standards
        </h3>
        <div className="mb-6">
          <p className="text-[15px] leading-relaxed text-gray-300 font-sans">
            {formulaDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {standards.length > 0 ? (
            standards.map((standard, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-white/5 text-gray-200 px-4 py-2 rounded-full text-sm font-medium border border-white/5"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                {standard}
              </div>
            ))
          ) : (
            <div className="text-sm font-medium text-gray-400">Standard general practice formulas applied</div>
          )}
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-[#1f1a0d] rounded-2xl p-6 sm:p-8 flex gap-5 items-start">
        <div className="shrink-0 mt-0.5">
          <AlertTriangle className="w-6 h-6 text-amber-300/80" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-amber-300/90 mb-2 tracking-wide">
            Professional Liability Disclaimer
          </h4>
          <p className="text-[15px] font-normal text-amber-100/70 leading-relaxed">
            This tool is provided for educational and preliminary estimation purposes only. All calculations must be verified by a licensed professional engineer before being used in actual construction, design, or structural detailing. The creators assume no liability for direct, indirect, or consequential damages resulting from the use of this software.
          </p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141414] rounded-2xl p-6 flex items-start gap-4">
          <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Last Reviewed</p>
            <p className="text-base font-semibold text-gray-100">{lastUpdated}</p>
          </div>
        </div>
        
        <div className="bg-[#141414] rounded-2xl p-6 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Complexity</p>
            <p className="text-base font-semibold text-gray-100">{difficulty}</p>
          </div>
        </div>

        <div className="bg-[#141414] rounded-2xl p-6 flex items-start gap-4">
          <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Platform Category</p>
            <p className="text-base font-semibold text-gray-100">{category}</p>
          </div>
        </div>
      </div>

      {/* Related Standards Links */}
      {standards.length > 0 && (
        <div className="bg-[#141414] rounded-2xl p-6 sm:p-8">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Official Standards References</h4>
          <div className="space-y-3">
            {standards.slice(0, 3).map((standard, idx) => (
              <a
                key={idx}
                href={`https://www.google.com/search?q=${encodeURIComponent(standard + " code civil engineering pdf")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-white/5"
              >
                <span className="text-[15px] font-medium text-gray-300 group-hover:text-white transition-colors">
                  Reference Documentation for {standard}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
