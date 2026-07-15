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
      text: "text-red-600 dark:text-red-400",
      border: "border-red-600 dark:border-red-400",
    },
    {
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-600 dark:border-blue-400",
    },
    {
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-600 dark:border-emerald-400",
    },
    {
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-600 dark:border-purple-400",
    },
    {
      text: "text-blue-600 dark:text-orange-400",
      border: "border-orange-600 dark:border-orange-400",
    },
    {
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-600 dark:border-teal-400",
    },
  ];

  return (
    <div
      className={`w-full overflow-x-auto pb-3 md:pb-4 scroll-smooth ${className}`}
    >
      <div className="flex px-1 min-w-max border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const colorTheme = COLOR_PALETTE[index % COLOR_PALETTE.length];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-2.5 sm:px-5 md:px-6 sm:py-3 text-[11px] sm:text-xs md:text-sm font-bold transition-all whitespace-nowrap
                rounded-t-xl rounded-b-none
                ${
                  isActive
                    ? `bg-white dark:bg-[#151821] shadow-[0_-4px_12px_rgba(15,23,42,0.03)] dark:shadow-slate-900/20 z-20 ${colorTheme.text}`
                    : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 z-10"
                }
              `}
            >
              {tab.icon && (
                <span
                  className={`[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4 md:[&>svg]:w-5 md:[&>svg]:h-5 inline-flex items-center justify-center ${isActive ? colorTheme.text : "text-slate-400 dark:text-slate-500"}`}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
