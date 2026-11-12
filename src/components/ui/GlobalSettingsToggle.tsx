import { Button } from './/Button';
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
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] sm:text-sm font-bold text-txt-secondary  hover:text-accent-800  hover:bg-accent-100/50  transition-all duration-300 whitespace-nowrap"
        title={showCurrency ? "Regional & Unit Settings" : "Unit Settings"}
      >
        <span className="hidden sm:inline-block tracking-wide">
          {settings.measurement === "SI" ? "Metric" : "Imperial"} {showCurrency && `• ${settings.currency}`}
        </span>
        <span className="sm:hidden tracking-wide flex items-center gap-1">
          {settings.measurement === "SI" ? "SI" : "FPS"} {showCurrency && `• ${settings.currency}`}
        </span>
        <Settings className="w-4 h-4 ml-0.5 text-txt-secondary" />
      </Button>

      {isOpen && (
        <div className={`absolute top-full mt-2 w-72 ${alignClass} bg-surface-default/90 dark:bg-ink/90 backdrop-blur-xl border border-ui-borderSubtle/80 dark:border-ink-600/80 rounded-2xl shadow-brand-lg overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-ink/5 dark:ring-white/5`}>
          <div className="p-4">
            <div className="mb-3 text-xs font-black text-txt-secondary dark:text-txt-tertiary uppercase tracking-wider flex items-center gap-1.5 pl-1">
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
                <div className="mb-3 text-xs font-black text-txt-secondary dark:text-txt-tertiary uppercase tracking-wider flex items-center gap-1.5 pl-1">
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

            <div className="mb-3 text-xs font-black text-txt-secondary dark:text-txt-tertiary uppercase tracking-wider flex items-center gap-1.5 pl-1">
              <Moon className="w-3.5 h-3.5"/> Theme
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { val: "light", icon: <Sun className="w-4 h-4 mx-auto mb-1" />, label: "Light" },
                { val: "dark", icon: <Moon className="w-4 h-4 mx-auto mb-1" />, label: "Dark" },
                { val: "system", icon: <Monitor className="w-4 h-4 mx-auto mb-1" />, label: "Auto" }
              ].map(({ val, icon, label }) => {
                const isActive = settings.theme === val;
                return (
                  <Button
                    key={val}
                    onClick={() => { updateSettings({ theme: val as Theme }); setIsOpen(false); }}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-colors flex flex-col items-center justify-center ${
                      isActive 
                         ? "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400 ring-1 ring-accent-600/20 dark:ring-accent-500/20" 
                         : "text-txt-secondary dark:text-txt-tertiary hover:bg-surface-hover/50"
                    }`}
                  >
                    {icon}
                    {label}
                  </Button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: "modern", icon: <div className="w-4 h-4 mx-auto mb-1 rounded bg-surface-hover border border-border-color" />, label: "Modern" },
                { val: "engineering-blueprint", icon: <div className="w-4 h-4 mx-auto mb-1 rounded bg-ink border border-accent-800" />, label: "Blueprint" },
                { val: "high-contrast", icon: <div className="w-4 h-4 mx-auto mb-1 rounded bg-black border border-accent-400" />, label: "Contrast" }
              ].map(({ val, icon, label }) => {
                const isActive = settings.theme === val;
                return (
                  <Button
                    key={val}
                    onClick={() => { updateSettings({ theme: val as Theme }); setIsOpen(false); }}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-colors flex flex-col items-center justify-center ${
                      isActive
                          ? "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400 ring-1 ring-accent-600/20 dark:ring-accent-500/20"
                          : "text-txt-secondary dark:text-txt-tertiary hover:bg-surface-hover/50"
                    }`}
                  >
                    {icon}
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
