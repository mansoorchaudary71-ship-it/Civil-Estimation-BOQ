import React, { useState, useRef, useEffect } from "react";
import { Settings, ChevronDown, Ruler, DollarSign, Moon, Sun, Monitor } from "lucide-react";
import { useSettings, MeasurementSystem, Currency, Theme } from "../../context/SettingsContext";
import SegmentedToggle from "./SegmentedToggle";

export function GlobalSettingsToggle({ align = "right", showCurrency = true, activeToolName }: { align?: "left" | "right", showCurrency?: boolean, activeToolName?: string }) {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignClass = align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right";

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] sm:text-sm font-bold text-slate-600  hover:text-amber-700  hover:bg-amber-100/50  transition-all duration-300 whitespace-nowrap"
        title={showCurrency ? "Regional & Unit Settings" : "Unit Settings"}
      >
        <span className="hidden sm:inline-block tracking-wide">
          {settings.measurement === "SI" ? "Metric" : "Imperial"} {showCurrency && `• ${settings.currency}`}
        </span>
        <span className="sm:hidden tracking-wide flex items-center gap-1">
          {settings.measurement === "SI" ? "SI" : "FPS"} {showCurrency && `• ${settings.currency}`}
        </span>
        <Settings className="w-4 h-4 ml-0.5 text-slate-700" />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 w-72 ${alignClass} bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-[24px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-slate-900/5 dark:ring-white/5`}>
          <div className="p-4">
            <div className="mb-3 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pl-1">
              <Ruler className="w-3.5 h-3.5"/> Unit System
            </div>
            <div className={`mb-6`}>
              <SegmentedToggle
                options={[
                  { value: "SI", label: "Metric" },
                  { value: "FPS", label: "Imperial" },
                ]}
                selectedValue={settings.measurement}
                onChange={(val) => {
                  updateSettings({ measurement: val as MeasurementSystem });
                  setIsOpen(false);
                  setTimeout(() => { window.location.reload(); }, 100);
                }}
                colorTheme="brown"
                activeToolName={activeToolName}
                size="sm"
              />
            </div>

            {showCurrency && (
              <>
                <div className="mb-3 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <DollarSign className="w-3.5 h-3.5"/> Currency
                </div>
                <div className="mb-6">
                  <SegmentedToggle
                    options={[
                      { value: "PKR", label: "PKR" },
                      { value: "USD", label: "USD" },
                      { value: "SAR", label: "SAR" },
                      { value: "INR", label: "INR" },
                    ]}
                    selectedValue={settings.currency}
                    onChange={(val) => {
                      updateSettings({ currency: val as Currency });
                      setIsOpen(false);
                    }}
                    colorTheme="brown"
                    activeToolName={activeToolName}
                    size="sm"
                  />
                </div>
              </>
            )}

            <div className="mb-3 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pl-1">
              <Moon className="w-3.5 h-3.5"/> Theme
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: "light", icon: <Sun className="w-4 h-4 mx-auto mb-1" />, label: "Light" },
                { val: "dark", icon: <Moon className="w-4 h-4 mx-auto mb-1" />, label: "Dark" },
                { val: "system", icon: <Monitor className="w-4 h-4 mx-auto mb-1" />, label: "Auto" }
              ].map(({ val, icon, label }) => {
                const isActive = settings.theme === val;
                return (
                  <button
                    key={val}
                    onClick={() => { updateSettings({ theme: val as Theme }); setIsOpen(false); }}
                    className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-colors flex flex-col items-center justify-center ${
                      isActive 
                         ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-600/20 dark:ring-amber-500/20" 
                         : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
