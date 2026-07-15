import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

// Exact color mappings tailored to match the background hues of your tool cards
const themeStyles = {
  brown: {
    selectedBg: 'bg-[#f4ebe1]', // Matches the warm light brown/beige card fill
    selectedText: 'text-[#5c4d3c]',
    borderColor: 'border-gray-400',
    divideColor: 'divide-gray-400'
  },
  blue: {
    selectedBg: 'bg-[#e8f0fe]', // Matches the soft light blue card fill
    selectedText: 'text-[#1a73e8]',
    borderColor: 'border-gray-400',
    divideColor: 'divide-gray-400'
  },
  green: {
    selectedBg: 'bg-[#e6f4ea]', // Matches the soft environmental green card fill
    selectedText: 'text-[#137333]',
    borderColor: 'border-gray-400',
    divideColor: 'divide-gray-400'
  }
};

const categoryToTheme: Record<string, keyof typeof themeStyles> = {
  "Quantity Estimation": "brown",
  "Concrete": "blue",
  "Resources": "green",
  "Architectural": "brown",
  "Geotechnical": "blue",
  "MEP": "green",
  "Road Pavement": "brown",
  "Standards": "blue",
  "Structural Design": "green"
};

interface Option {
  value: string;
  label: string;
}

interface SegmentedToggleProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
  colorTheme?: keyof typeof themeStyles | string; // Accepts 'brown', 'blue', or 'green'
  activeToolName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SegmentedToggle = ({ 
  options, 
  selectedValue, 
  onChange, 
  colorTheme = 'brown',
  activeToolName,
  size = 'md'
}: SegmentedToggleProps) => {
  const [resolvedThemeKey, setResolvedThemeKey] = useState<keyof typeof themeStyles>(colorTheme as keyof typeof themeStyles);

  useEffect(() => {
    let isMounted = true;
    
    const resolveTheme = async () => {
      try {
        const { ALL_MODULES } = await import('../Dashboard');
        const activeModuleId = typeof window !== 'undefined' ? sessionStorage.getItem('activeModule') : null;
        
        let activeToolTitle = activeToolName;
        if (!activeToolTitle && activeModuleId) {
          const activeModule = ALL_MODULES.find((m: any) => m.id === activeModuleId);
          if (activeModule) {
            activeToolTitle = activeModule.title;
          }
        }
        
        if (!activeToolTitle) return;
        
        // Find the module to get its category
        const activeModule = ALL_MODULES.find((m: any) => m.title === activeToolTitle);
        
        // Some alias fallback cases just in case title mismatch
        let resolvedCategory = activeModule?.category;
        if (!resolvedCategory) {
          if (activeToolTitle === "Live DB Rates") resolvedCategory = "Quantity Estimation";
          if (activeToolTitle === "Plan Measure") resolvedCategory = "Quantity Estimation";
          if (activeToolTitle === "Cost Summary Sheet") resolvedCategory = "Quantity Estimation";
          if (activeToolTitle === "Professional BOQ Generator") resolvedCategory = "Resources";
          if (activeToolTitle === "Measurement Sheet Calculator") resolvedCategory = "Quantity Estimation";
          if (activeToolTitle === "Plot Area Calculator") resolvedCategory = "Architectural";
        }

        if (resolvedCategory && categoryToTheme[resolvedCategory]) {
          if (isMounted) setResolvedThemeKey(categoryToTheme[resolvedCategory]);
        }
      } catch (e) {
        console.error("Error loading modules for SegmentedToggle theme", e);
      }
    };
    
    resolveTheme();
    
    return () => { isMounted = false; };
  }, [activeToolName]);

  const currentTheme = themeStyles[resolvedThemeKey as keyof typeof themeStyles] || themeStyles.brown;

  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5'
  };

  return (
    <div className={`flex w-full overflow-hidden rounded-full border ${currentTheme.borderColor} divide-x ${currentTheme.divideColor} bg-transparent`}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex flex-1 items-center justify-center gap-2 ${sizeClasses[size]} font-medium transition-colors duration-200
              ${isSelected 
                ? `${currentTheme.selectedBg} ${currentTheme.selectedText}` 
                : 'bg-transparent text-gray-600 hover:bg-gray-50/50'
              }
            `}
          >
            {isSelected && <Check className="h-4 w-4 stroke-[2.5]" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedToggle;
