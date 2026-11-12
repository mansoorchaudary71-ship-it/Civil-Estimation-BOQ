import { Button } from './/Button';
import React, { useState } from 'react';
import { ShieldCheck, TestTube, Settings2, Info } from 'lucide-react';


interface CodeComplianceBadgeProps {
  standard: string; // e.g., "IS 2720 / ASTM D1883"
  title?: string;
  description?: string;
}

export function CodeComplianceBadge({ standard, title = "Standard Compliant", description }: CodeComplianceBadgeProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-ui-success dark:bg-ui-success/20 border border-ui-successBorder dark:border-ui-successText/30 rounded-lg">
      <ShieldCheck className="text-ui-successText mt-0.5" size={18} />
      <div>
        <div className="text-xs font-bold text-ui-successText dark:text-ui-successText">{title}</div>
        <div className="text-sm font-semibold text-ui-successText dark:text-ui-successText">{standard}</div>
        {description && <div className="text-xs text-ui-successText dark:text-ui-successText mt-1">{description}</div>}
      </div>
    </div>
  );
}

interface ApparatusHelperBoxProps {
  items: string[];
}

export function ApparatusHelperBox({ items }: ApparatusHelperBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4 border border-ui-borderSubtle dark:border-ink-600 rounded-lg overflow-hidden bg-surface-default dark:bg-ink">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 text-sm font-semibold text-txt-secondary dark:text-txt-primary hover:bg-surface-hover dark:hover:bg-ink-700 transition-colors"
      >
        <TestTube size={16} className="text-accent-800" />
        Required Lab Apparatus & Scientific Equipment
        <Info size={14} className="ml-auto text-txt-tertiary" />
      </Button>
      {isOpen && (
        <div className="p-4 border-t border-ui-borderSubtle dark:border-ink-600 bg-surface-default">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-txt-secondary dark:text-txt-tertiary">
                <Settings2 size={14} className="text-txt-tertiary mt-1 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
