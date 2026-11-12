import { Button } from './/Button';
import React from "react";


export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

export function UniversalTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}) {
  const COLOR_PALETTE = [
    {
      text: "text-ui-errorText dark:text-ui-errorText",
      border: "border-red-600 dark:border-red-400",
    },
    {
      text: "text-accent-800 dark:text-accent-400",
      border: "border-accent-800 dark:border-accent-800",
    },
    {
      text: "text-ui-successText dark:text-ui-successText",
      border: "border-emerald-600 dark:border-emerald-400",
    },
    {
      text: "text-accent-700 dark:text-accent-400",
      border: "border-purple-600 dark:border-purple-400",
    },
    {
      text: "text-accent-800 dark:text-accent-400",
      border: "border-accent-800 dark:border-orange-400",
    },
    {
      text: "text-teal-700 dark:text-teal-400",
      border: "border-teal-700 dark:border-teal-400",
    },
  ];

  return (
    <div
      className={`w-full overflow-x-auto pb-3 md:pb-4 scroll-smooth ${className}`}
    >
      <div className="flex px-1 min-w-max border-b border-ui-borderSubtle dark:border-ink">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const colorTheme = COLOR_PALETTE[index % COLOR_PALETTE.length];

          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-2.5 sm:px-5 md:px-6 sm:py-3 text-xs sm:text-xs md:text-sm font-bold transition-all whitespace-nowrap
                rounded-t-xl rounded-b-none
                ${
                  isActive
                    ? `bg-surface-default dark:bg-[#151821] shadow-[0_-4px_12px_rgba(31,29,26,0.03)] dark:shadow-ink/20 z-20 ${colorTheme.text}`
                    : "bg-transparent hover:bg-surface-hover/50 text-txt-tertiary dark:text-txt-tertiary z-10"
                }
              `}
            >
              {tab.icon && (
                <span
                  className={`[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 inline-flex items-center justify-center ${isActive ? colorTheme.text : "text-txt-tertiary dark:text-txt-tertiary"}`}
                >
                  {tab.icon}
                </span>
              )}
              <span className="truncate">{tab.label}</span>
              {/* Active / Inactive Border Indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 border-b-[4px] md:border-b-[5px] ${
                  isActive ? colorTheme.border : "border-transparent"
                }`}
                style={{ marginBottom: "-1px" }} // cover the container's bottom border
              />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
