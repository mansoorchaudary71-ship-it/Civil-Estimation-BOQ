import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { X, Check, Database, Ruler, Palette } from "lucide-react";
import { useMarketRates } from "../../context/MarketRatesContext";
import { useSettings, ModulePreferences } from "../../context/SettingsContext";
interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
type Tab = "rates" | "prefs";
export default function GlobalSettingsModal({
  isOpen,
  onClose,
}: GlobalSettingsModalProps) {
  const { rates, updateRate } = useMarketRates();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("rates");
  /* Local state for edits */ const [localRates, setLocalRates] =
    React.useState({
      cement: rates.cement,
      steel: rates.steel * 1000,
      /* stored per kg in context, per ton in modal */ bricks:
        rates.bricks * 1000,
      /* stored per piece in context, per 1000 in modal */ sand: rates.sand,
      crush: rates.crush,
    });
  /* */ const defaultPrefs: ModulePreferences = {
    units: { finishing: "m", roads: "km", earthworks: "m" },
    themes: { finishing: "blue", roads: "slate", earthworks: "amber" },
  };
  const [localPrefs, setLocalPrefs] = React.useState<ModulePreferences>(
    settings.modulePreferences || defaultPrefs,
  );
  React.useEffect(() => {
    if (isOpen) {
      setLocalRates({
        cement: rates.cement,
        steel: rates.steel * 1000,
        bricks: rates.bricks * 1000,
        sand: rates.sand,
        crush: rates.crush,
      });
      setLocalPrefs(settings.modulePreferences || defaultPrefs);
    }
  }, [isOpen, rates, settings.modulePreferences]);
  if (!isOpen) return null;
  const handleChange = (key: keyof typeof localRates, value: string) => {
    const num = parseFloat(value);
    setLocalRates((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };
  const handlePrefChange = (
    category: "units" | "themes",
    module: keyof ModulePreferences["units"],
    value: string,
  ) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [category]: { ...prev[category], [module]: value },
    }));
  };
  const handleSave = () => {
    updateRate("cement", localRates.cement);
    updateRate("steel", localRates.steel / 1000);
    updateRate("bricks", localRates.bricks / 1000);
    updateRate("sand", localRates.sand);
    updateRate("crush", localRates.crush);
    updateSettings({ modulePreferences: localPrefs });
    onClose();
  };
  const currencySymbol =
    settings.currency === "PKR"
      ? "Rs"
      : settings.currency === "USD"
        ? "$"
        : settings.currency;
  const InputRow = ({
    label,
    unit,
    value,
    onChangeKey,
  }: {
    label: string;
    unit: string;
    value: number;
    onChangeKey: keyof typeof localRates;
  }) => (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-[24px] bg-white/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 hover:bg-white/80 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 transition-colors border border-transparent hover:border-slate-200 : overflow-hidden">
      {" "}
      <div className="flex flex-col">
        {" "}
        <span className="font-semibold text-slate-800">
          {label}
        </span>{" "}
        <span className="text-sm text-slate-500">
          per {unit}
        </span>{" "}
      </div>{" "}
      <div className="relative flex flex-col w-full sm:w-48">
        {" "}
        <div className="relative flex items-center w-full">
          {" "}
          <span className="absolute left-3 text-slate-700 font-medium text-sm">
            {currencySymbol}
          </span>{" "}
          <><label htmlFor="a11y-input-250" className="sr-only">Input</label>
<input id="a11y-input-250"
            type="number" inputMode="decimal"
            min="0"
            step="any"
            value={value || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val < 0) return;
              handleChange(onChangeKey, e.target.value);
            }}
            className="w-full pl-9 pr-4 py-2 bg-bg-card border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 text-slate-900 dark:text-white font-medium transition-shadow"
          /></>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {" "}
      <div
        className="absolute inset-0 bg-[#F5F5F7] backdrop-blur-sm"
        onClick={onClose}
      ></div>{" "}
      <div className="relative bg-transparent/90 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 backdrop-blur-xl border border-slate-200/50 rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {" "}
        {/* Header */}{" "}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/50 shrink-0">
          {" "}
          <div>
            {" "}
            <h3 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-lg font-medium text-slate-800 mb-4">
              {" "}
              Global Settings{" "}
            </h3>{" "}
            <p className="mt-1 text-base font-normal text-slate-600 leading-relaxed">
              {" "}
              Configure parameters & market rates.{" "}
            </p>{" "}
          </div>{" "}
          <button onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-slate-200/50 rounded-full border border-slate-200 shadow-sm text-slate-800 text-slate-700 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Tabs */}{" "}
        <div className="flex overflow-x-auto px-6 py-4 border-b border-slate-200/50 shrink-0 gap-2 p-1">
          {" "}
          <UniversalTabs tabs={[{id: "rates", label: "Market Rates", icon: <Database className="w-4 h-4" />}]} activeTab={activeTab === "rates" ? "rates" : ""} onTabChange={() => setActiveTab("rates")} />
          <UniversalTabs tabs={[{id: "prefs", label: "Module Preferences", icon: <Ruler className="w-4 h-4" />}]} activeTab={activeTab === "prefs" ? "prefs" : ""} onTabChange={() => setActiveTab("prefs")} />
        </div>{" "}
        {/* Content */}{" "}
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          {" "}
          {activeTab === "rates" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {" "}
              <InputRow
                label="Cement"
                unit="50kg Bag"
                value={localRates.cement}
                onChangeKey="cement"
              />{" "}
              <InputRow
                label="Steel"
                unit="Ton"
                value={localRates.steel}
                onChangeKey="steel"
              />{" "}
              <InputRow
                label="Bricks"
                unit="1000 Bricks"
                value={localRates.bricks}
                onChangeKey="bricks"
              />{" "}
              <InputRow
                label="Sand"
                unit="CFT"
                value={localRates.sand}
                onChangeKey="sand"
              />{" "}
              <InputRow
                label="Crush"
                unit="CFT"
                value={localRates.crush}
                onChangeKey="crush"
              />{" "}
            </div>
          )}{" "}
          {activeTab === "prefs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {" "}
              {/* Preferred Units */}{" "}
              <div>
                {" "}
                <h4 className="mb-3 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                  {" "}
                  <Ruler className="w-4 h-4 text-slate-700" /> Preferred
                  Units{" "}
                </h4>{" "}
                <div className="w-full space-y-3 bg-white/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 px-4 py-3 rounded-[24px] border border-slate-200/50 overflow-hidden">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-sm sm:text-base font-medium">
                      Finishing
                    </span>{" "}
                    <select
                      value={localPrefs.units.finishing}
                      onChange={(e) =>
                        handlePrefChange("units", "finishing", e.target.value)
                      }
                      className="bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-800 rounded-[16px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 text-sm font-medium"
                    >
                      {" "}
                      <option value="mm">Millimeters (mm)</option>{" "}
                      <option value="m">Meters (m)</option>{" "}
                      <option value="in">Inches (in)</option>{" "}
                      <option value="ft">Feet (ft)</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-sm sm:text-base font-medium">
                      Roads
                    </span>{" "}
                    <select
                      value={localPrefs.units.roads}
                      onChange={(e) =>
                        handlePrefChange("units", "roads", e.target.value)
                      }
                      className="bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-800 rounded-[16px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 text-sm font-medium"
                    >
                      {" "}
                      <option value="m">Meters (m)</option>{" "}
                      <option value="km">Kilometers (km)</option>{" "}
                      <option value="ft">Feet (ft)</option>{" "}
                      <option value="mi">Miles (mi)</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-sm sm:text-base font-medium">
                      Earthworks
                    </span>{" "}
                    <select
                      value={localPrefs.units.earthworks}
                      onChange={(e) =>
                        handlePrefChange("units", "earthworks", e.target.value)
                      }
                      className="bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-800 rounded-[16px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 text-sm font-medium"
                    >
                      {" "}
                      <option value="m">Meters (m)</option>{" "}
                      <option value="ft">Feet (ft)</option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Default Colors */}{" "}
              <div>
                {" "}
                <h4 className="mb-3 flex items-center gap-2 text-lg font-medium text-slate-800 mb-4">
                  {" "}
                  <Palette className="w-4 h-4 text-slate-700" /> Default Color
                  Themes{" "}
                </h4>{" "}
                <div className="w-full space-y-3 bg-white/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 px-4 py-3 rounded-[24px] border border-slate-200/50 overflow-hidden">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-sm sm:text-base font-medium">
                      Finishing
                    </span>{" "}
                    <select
                      value={localPrefs.themes.finishing}
                      onChange={(e) =>
                        handlePrefChange("themes", "finishing", e.target.value)
                      }
                      className="bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-800 rounded-[16px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 text-sm font-medium"
                    >
                      {" "}
                      <option value="blue">Ocean Blue</option>{" "}
                      <option value="indigo">Deep Indigo</option>{" "}
                      <option value="emerald">Emerald Green</option>{" "}
                      <option value="rose">Rose Red</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-sm sm:text-base font-medium">
                      Roads
                    </span>{" "}
                    <select
                      value={localPrefs.themes.roads}
                      onChange={(e) =>
                        handlePrefChange("themes", "roads", e.target.value)
                      }
                      className="bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-800 rounded-[16px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 text-sm font-medium"
                    >
                      {" "}
                      <option value="slate">Industrial Slate</option>{" "}
                      <option value="amber">Warning Amber</option>{" "}
                      <option value="orange">Construction Orange</option>{" "}
                    </select>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-sm sm:text-base font-medium">
                      Earthworks
                    </span>{" "}
                    <select
                      value={localPrefs.themes.earthworks}
                      onChange={(e) =>
                        handlePrefChange("themes", "earthworks", e.target.value)
                      }
                      className="bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-800 rounded-[16px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 text-sm font-medium"
                    >
                      {" "}
                      <option value="amber">Dirt Amber</option>{" "}
                      <option value="orange">Clay Orange</option>{" "}
                      <option value="stone">Stone Gray</option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* Footer */}{" "}
        <div className="p-4 sm:p-6 border-t border-slate-200/50 shrink-0 bg-slate-100/50 rounded-[24px] border border-slate-200 shadow-sm text-slate-800 flex justify-end gap-3 overflow-hidden">
          {" "}
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-full text-slate-600 hover:bg-slate-200/50 border border-slate-200 shadow-sm text-slate-800 transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5"
          >
            {" "}
            Cancel{" "}
          </button>{" "}
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 text-base font-semibold hover:-translate-y-0.5"
          >
            {" "}
            <Check className="w-4 h-4" /> Save Settings{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    
      </div>
  );
}
