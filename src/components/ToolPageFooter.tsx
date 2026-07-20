import React from "react";
import { AlertTriangle, ShieldCheck, Calendar, Globe, Code } from "lucide-react";

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
    <div className="w-full bg-[#0A2540] rounded-[32px] p-4 sm:p-6 md:p-4 sm:p-8 border border-blue-400/30 shadow-sm space-y-3 overflow-hidden">
      {/* Formula Transparency Box */}
      <div className="bg-white/10 border border-blue-400/30 rounded-xl p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-4">
          <Code className="w-5 h-5 text-[#F59E0B]" />
          Methodology & Standards
        </h3>
        <div className="bg-white/10 rounded-lg p-4 mb-4 border border-blue-400/30">
          <p className="font-mono whitespace-pre-wrap text-base font-normal text-blue-100 leading-relaxed">
            {formulaDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {standards.length > 0 ? (
            standards.map((standard, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-[#0A2540]/50 border border-blue-400/30 text-white px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                {standard}
              </div>
            ))
          ) : (
            <div className="text-sm font-normal text-blue-100">Standard general practice formulas applied</div>
          )}
        </div>
      </div>

      {/* Professional Disclaimer */}
      <div className="bg-white/10 border border-amber-200 rounded-xl p-5 flex gap-4 items-start flex-wrap">
        <div className="bg-amber-500/10 p-2 rounded-lg shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div>
          <h4 className="text-lg font-medium text-amber-700 mb-1">
            Professional Liability Disclaimer
          </h4>
          <p className="text-base font-normal text-blue-100 leading-relaxed">
            This tool is provided for educational and preliminary estimation purposes only. All calculations must be verified by a licensed professional engineer before being used in actual construction, design, or structural detailing. The creators assume no liability for direct, indirect, or consequential damages resulting from the use of this software.
          </p>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/10 border border-blue-400/30 rounded-lg p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-100" />
          <div>
            <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Last Reviewed</p>
            <p className="mt-0.5 text-base font-medium text-white">{lastUpdated}</p>
          </div>
        </div>
        <div className="bg-white/10 border border-blue-400/30 rounded-lg p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-100" />
          <div>
            <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Complexity</p>
            <p className="mt-0.5 text-base font-medium text-white">{difficulty}</p>
          </div>
        </div>
        <div className="bg-white/10 border border-blue-400/30 rounded-lg p-4 flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-100" />
          <div>
            <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Platform Category</p>
            <p className="mt-0.5 text-base font-medium text-white">{category}</p>
          </div>
        </div>
      </div>

      {/* Related Standards Links */}
      {standards.length > 0 && (
        <div className="border border-blue-400/30 rounded-xl p-5 bg-white/10/50">
          <h4 className="text-lg font-medium text-white mb-3">Official Standards References</h4>
          <ul className="space-y-2">
            {standards.slice(0, 3).map((standard, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(standard + " code civil engineering pdf")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-[#F59E0B] transition-colors"
                >
                  Search Reference Documentation for {standard} &rarr;
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
