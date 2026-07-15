import React, { useState, useRef, useMemo } from "react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import {
  X,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Laptop,
  User,
  Ruler,
  Palette,
  Camera,
  LineChart,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wand2,
  Clock,
  Eye,
} from "lucide-react";
import {
  useSettings,
  Currency,
  MeasurementSystem,
  Theme,
} from "../../context/SettingsContext";
import { useMarketRates, MarketRates } from "../../context/MarketRatesContext";
import { toast } from "react-hot-toast";

const RATE_LABELS: Record<keyof MarketRates, string> = {
  cement: "Cement (per bag)",
  steel: "Steel (per kg)",
  bricks: "Bricks (per piece)",
  sand: "Sand (per cft)",
  crush: "Crush (per cft)",
  tiles: "Tiles (per box)",
  paint: "Paint (per liter)",
  laborGrey: "Labor Grey (per sq.ft)",
  laborFinish: "Labor Finish (per sq.ft)",
  overheadMarkup: "Overhead Markup (%)",
};

type Tab = "account" | "measurements" | "appearance" | "rates";
export default function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { settings, updateSettings } = useSettings();
  const { companyRates, setCompanyRate } = useMarketRates();
  const [activeTab, setActiveTab] = useState<Tab>("account");
  /* We add this dummy state for account details to provide the visual ly complete mockup */ const [
    name,
    setName,
  ] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface ImportRecord {
    id: string;
    timestamp: string;
    fileName: string;
    status: 'success' | 'failed';
    message: string;
    count?: number;
  }

  const [importHistory, setImportHistory] = useState<ImportRecord[]>(() => {
    try {
      const saved = localStorage.getItem("company_rates_import_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addHistory = (record: Omit<ImportRecord, "id" | "timestamp">) => {
    const newRecord: ImportRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setImportHistory(prev => {
      const updated = [newRecord, ...prev].slice(0, 5); // Keep last 5
      localStorage.setItem("company_rates_import_history", JSON.stringify(updated));
      return updated;
    });
  };

  const [mappingStep, setMappingStep] = useState<{
    headers: string[];
    rows: string[][];
    fileName: string;
  } | null>(null);
  const [columnMap, setColumnMap] = useState<{ material: string; rate: string }>({ material: "", rate: "" });

  const [savedMapping, setSavedMapping] = useState<{ material: string; rate: string } | null>(() => {
    try {
      const saved = localStorage.getItem("company_rates_mapping_preset");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveMapping = () => {
    if (columnMap.material && columnMap.rate) {
      localStorage.setItem("company_rates_mapping_preset", JSON.stringify(columnMap));
      setSavedMapping(columnMap);
      toast.success("Mapping preset saved successfully!");
    } else {
      toast.error("Please select both columns before saving.");
    }
  };

  const isMaterialValid = useMemo(() => {
    if (!mappingStep || !columnMap.material) return false;
    const matIdx = mappingStep.headers.indexOf(columnMap.material);
    if (matIdx === -1) return false;
    // Check if at least one row has a non-empty string in this column
    return mappingStep.rows.some(row => row[matIdx]?.trim().length > 0);
  }, [mappingStep, columnMap.material]);

  const isRateValid = useMemo(() => {
    if (!mappingStep || !columnMap.rate) return false;
    const rateIdx = mappingStep.headers.indexOf(columnMap.rate);
    if (rateIdx === -1) return false;
    // Check if at least one row has a parseable number in this column
    return mappingStep.rows.some(row => !isNaN(parseFloat(row[rateIdx]?.replace(/[^0-9.-]/g, ""))));
  }, [mappingStep, columnMap.rate]);

  const keyMapping: Record<string, keyof MarketRates> = {
    cement: "cement",
    steel: "steel",
    bricks: "bricks",
    brick: "bricks",
    sand: "sand",
    crush: "crush",
    gravel: "crush",
    tiles: "tiles",
    tile: "tiles",
    paint: "paint",
    laborgrey: "laborGrey",
    "labor grey": "laborGrey",
    labor_grey: "laborGrey",
    laborfinish: "laborFinish",
    "labor finish": "laborFinish",
    labor_finish: "laborFinish",
    overhead: "overheadMarkup",
    overheadmarkup: "overheadMarkup",
    "overhead markup": "overheadMarkup",
    overhead_markup: "overheadMarkup",
  };

  const normalizeKey = (key: string): keyof MarketRates | null => {
    const clean = key.toLowerCase()
      .replace(/[\(\[\{\)\]\}]/g, '')
      .replace(/[^a-z0-9\s_]/g, '')
      .trim();
    if (keyMapping[clean]) return keyMapping[clean];
    for (const [k, v] of Object.entries(keyMapping)) {
      if (clean.includes(k) || k.includes(clean)) {
        return v;
      }
    }
    return null;
  };

  const handleCSVUpload = (text: string, fileName: string) => {
    try {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        toast.error("CSV needs at least a header row and one data row.");
        addHistory({ fileName, status: "failed", message: "Needs at least a header row and one data row." });
        return;
      }

      let rows = lines.map(line => line.split(",").map(c => c.trim()));

      // Auto-detect if user transposed the CSV (materials as columns)
      if (rows.length === 2 && rows[0].length > 2 && isNaN(parseFloat(rows[0][1]))) {
        const transposed = [];
        for (let i = 0; i < rows[0].length; i++) {
          transposed.push([rows[0][i], rows[1][i]]);
        }
        rows = [["Material Name", "Rate"], ...transposed];
      }

      const headers = rows[0].map((h, i) => h || `Column ${i + 1}`);
      const dataRows = rows.slice(1);

      setMappingStep({ headers, rows: dataRows, fileName });

      // Auto-guess headers
      let m = headers.find(h => h.toLowerCase().includes("material") || h.toLowerCase().includes("item") || h.toLowerCase().includes("name"));
      let r = headers.find(h => h.toLowerCase().includes("rate") || h.toLowerCase().includes("price") || h.toLowerCase().includes("cost"));

      let appliedSaved = false;
      // We need to access savedMapping at the top level or via state, wait, savedMapping is a state variable thus accessible here.
      const savedStr = localStorage.getItem("company_rates_mapping_preset");
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          if (headers.includes(parsed.material) && headers.includes(parsed.rate)) {
            m = parsed.material;
            r = parsed.rate;
            appliedSaved = true;
          }
        } catch { } // ignore
      }

      setColumnMap({
        material: m || headers[0] || "",
        rate: r || headers[1] || ""
      });

      if (appliedSaved) {
        toast.success("Applied saved mapping preset.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to parse CSV file.");
      addHistory({ fileName, status: "failed", message: "Failed to parse CSV file." });
    }
  };

  const handleAutoMatch = () => {
    if (!mappingStep) return;
    const m = mappingStep.headers.find(h => h.toLowerCase().includes("material") || h.toLowerCase().includes("item") || h.toLowerCase().includes("name"));
    const r = mappingStep.headers.find(h => h.toLowerCase().includes("rate") || h.toLowerCase().includes("price") || h.toLowerCase().includes("cost"));

    setColumnMap({
      material: m || mappingStep.headers[0] || "",
      rate: r || mappingStep.headers[1] || ""
    });
    toast.success("Headers auto-matched!");
  };

  const confirmMapping = () => {
    if (!mappingStep) return;
    const { headers, rows } = mappingStep;
    const matIdx = headers.indexOf(columnMap.material);
    const rateIdx = headers.indexOf(columnMap.rate);

    if (matIdx === -1 || rateIdx === -1) {
      toast.error("Please select columns for both Material Name and Rate.");
      return;
    }

    let importCount = 0;
    rows.forEach(row => {
      const matName = row[matIdx];
      const rateValStr = row[rateIdx];
      const rateVal = parseFloat(rateValStr?.replace(/[^0-9.-]/g, ""));

      if (matName && !isNaN(rateVal)) {
        const key = normalizeKey(matName);
        if (key) {
          setCompanyRate(key, rateVal);
          importCount++;
        }
      }
    });

    if (importCount > 0) {
      toast.success(`Successfully imported ${importCount} rates from CSV!`);
      addHistory({ fileName: mappingStep.fileName, status: "success", count: importCount, message: `Imported ${importCount} rates.` });
      setMappingStep(null);
    } else {
      toast.error("No valid rates could be imported. Check your column mapping.");
      addHistory({ fileName: mappingStep.fileName, status: "failed", message: "No valid rates could be imported." });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleCSVUpload(event.target.result as string, file.name);
          }
        };
        reader.readAsText(file);
      } else {
        toast.error("Please upload a .csv file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleCSVUpload(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Material,Rate\n"
      + "Cement (per bag),1500\n"
      + "Steel (per kg),290\n"
      + "Bricks (per piece),20\n"
      + "Sand (per cft),95\n"
      + "Crush (per cft),260\n"
      + "Tiles (per box),1250\n"
      + "Paint (per liter),320\n"
      + "Labor Grey (per sq.ft),520\n"
      + "Labor Finish (per sq.ft),620\n"
      + "Overhead Markup (%),15\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "company_material_rates_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearCompanyRates = () => {
    if (window.confirm("Are you sure you want to completely clear all custom Company Material Rates? This will revert back to Market Rates.")) {
      Object.keys(RATE_LABELS).forEach((key) => {
        setCompanyRate(key as keyof MarketRates, null);
      });
      toast.success("Successfully cleared all Company rates.");
    }
  };

  if (!isOpen) return null;
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "account", label: "Account Details", icon: User },
    { id: "measurements", label: "Measurement Units", icon: Ruler },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "rates", label: "Company Rates", icon: LineChart },
  ];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/50 backdrop-blur-sm p-4">
      <div
        className="bg-bg-card/90 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] sm:h-[650px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Close Button */}
        <button onClick={onClose}
          className="w-full md:hidden absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-700 hover:text-slate-800 transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm overflow-hidden"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-transparent/50 border-r border-slate-200/50 p-4 sm:p-6 flex flex-col shrink-0 overflow-y-auto">
          <div className="flex items-center gap-3 mb-10 pt-2">
            <div className="w-10 h-10 bg-gradient-to-tr rounded-[24px] flex items-center justify-center shadow-md shadow-blue-500/20 overflow-hidden">
              <SettingsIcon className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Preferences
              </h2>
            </div>
          </div>
          <div className="flex-1 space-y-2 flex flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-[24px] font-semibold transition-all ${isActive ? "bg-bg-card text-indigo-600  shadow-sm border border-slate-200 dark:border-slate-700/50" : "text-slate-700  hover:bg-slate-100/50  rounded-[24px] border border-slate-200 shadow-sm text-slate-800  hover:text-slate-900 border border-transparent"}`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-indigo-600 " : "text-slate-700   "}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="hidden md:block mt-auto pb-2 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm">
            <p className="text-sm text-slate-700 font-medium px-4">
              Civil Estimation Pro Settings
              <br />
              Version 1.0.4
            </p>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-transparent">
          <div className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white capitalize">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <button onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-card hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
            <div className="w-full md:max-w-xl md:mx-auto md:mx-0 px-4 md:px-0">
              {/* Mobile Header */}
              <h3 className="md:hidden text-xl font-semibold text-slate-900 dark:text-white capitalize mb-6">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h3>
              {activeTab === "account" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 flex items-center justify-center text-xl font-bold text-slate-900 shadow-lg overflow-hidden relative">
                        <span className="relative z-10 w-full h-full flex items-center justify-center">
                          {name.charAt(0)}
                        </span>
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                          <Camera className="w-6 h-6 text-slate-900" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">
                        Profile Picture
                      </h4>
                      <p className="text-sm text-slate-700 mb-3">
                        Visible to other team members.
                      </p>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-bg-card border border-slate-200 dark:border-slate-700 rounded-full text-base font-medium hover:bg-transparent transition-colors shadow-sm active:scale-95 hover:-translate-y-0.5">
                          Upload New
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-medium mb-2">
                        Full Name
                      </label>
                      <><label htmlFor="a11y-input-463" className="sr-only">Input</label>
<input id="a11y-input-463"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-bg-card border border-slate-200 dark:border-slate-700 rounded-full px-4 py-3.5 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                      /></>
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-2">
                        Email Address
                      </label>
                      <><label htmlFor="a11y-input-464" className="sr-only">Input</label>
<input id="a11y-input-464"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-bg-card border border-slate-200 dark:border-slate-700 rounded-full px-4 py-3.5 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                      /></>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "measurements" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-blue-50 border border-blue-100 rounded-[24px] p-5 mb-6 overflow-hidden">
                    <p className="text-sm font-medium text-blue-700">
                      This preference affects all calculation modules globally.
                      Some legacy fields may still expect native inputs.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                      <label
                        className={`relative flex items-center justify-between p-5 rounded-[24px] border-2 cursor-pointer transition-all ${settings.measurement === "SI" ? "border-blue-500 bg-blue-50/50 " : "border-slate-200 dark:border-slate-700 hover:border-slate-300 : bg-bg-card"}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            Metric (SI)
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            Meters, Sq.Meters, Cu.Meters
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${settings.measurement === "SI" ? "border-blue-500 bg-blue-500" : "border-slate-200 dark:border-slate-700"}`}
                        >
                          {settings.measurement === "SI" && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                        <><label htmlFor="a11y-input-465" className="sr-only">measurement</label>
<input id="a11y-input-465"
                          type="radio"
                          name="measurement"
                          className="hidden"
                          checked={settings.measurement === "SI"}
                          onChange={() => updateSettings({ measurement: "SI" })}
                        /></>
                      </label>
                      <label
                        className={`relative flex items-center justify-between p-5 rounded-[24px] border-2 cursor-pointer transition-all ${settings.measurement === "FPS" ? "border-blue-500 bg-blue-50/50 " : "border-slate-200 dark:border-slate-700 hover:border-slate-300 : bg-bg-card"}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            Imperial (FPS)
                          </span>
                          <span className="text-sm font-medium text-slate-700">
                            Feet, Inches, Sq.Ft, Cu.Ft
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${settings.measurement === "FPS" ? "border-blue-500 bg-blue-500" : "border-slate-200 dark:border-slate-700"}`}
                        >
                          {settings.measurement === "FPS" && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>
                        <><label htmlFor="a11y-input-466" className="sr-only">measurement</label>
<input id="a11y-input-466"
                          type="radio"
                          name="measurement"
                          className="hidden"
                          checked={settings.measurement === "FPS"}
                          onChange={() =>
                            updateSettings({ measurement: "FPS" })
                          }
                        /></>
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "appearance" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 mb-4">
                      Color Theme
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "system", label: "System", icon: Laptop },
                        { id: "high-contrast", label: "High Contrast", icon: Eye },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isActive = settings.theme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() =>
                              updateSettings({ theme: t.id as Theme })
                            }
                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[24px] border-2 transition-all ${isActive ? "border-blue-500 bg-blue-50/50 " : "border-slate-200 dark:border-slate-700 hover:border-slate-300 : bg-bg-card"}`}
                          >
                            <div
                              className={`p-3 rounded-full ${isActive ? "bg-blue-100  text-indigo-600 " : "bg-white dark:bg-slate-800 text-slate-700 "}`}
                            >
                              <Icon className="w-6 h-6 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" />
                            </div>
                            <span
                              className={`font-bold ${isActive ? "text-blue-700 " : "text-slate-700  "}`}
                            >
                              {t.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "rates" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Company Material Rates</h4>
                      <p className="text-sm text-slate-600">Set custom rates that will override market defaults across all calculators.</p>
                    </div>
                    <button onClick={handleClearCompanyRates}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-base font-medium rounded-full transition-all self-start sm:self-center active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Clear Rates
                    </button>
                  </div>

                  {/* CSV Bulk Import Dropzone or Column Mapping UI */}
                  {mappingStep ? (
                    <div className="w-full bg-white border text-left border-slate-200 rounded-[24px] p-4 sm:p-6 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-indigo-500" />
                          <h5 className="font-bold text-slate-800">Map Columns</h5>
                        </div>
                        <button onClick={handleAutoMatch}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          Auto-match
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Please match your CSV columns to the required fields.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-base font-medium">Material Name Column</label>
                            {columnMap.material && (
                              isMaterialValid ? 
                                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md"><CheckCircle className="w-3 h-3" /> Valid format</span> : 
                                <span className="flex items-center gap-1 text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded-md"><XCircle className="w-3 h-3" /> Invalid</span>
                            )}
                          </div>
                          <select 
                            value={columnMap.material} 
                            onChange={e => setColumnMap(p => ({ ...p, material: e.target.value }))}
                            className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-colors ${columnMap.material ? (isMaterialValid ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30') : 'border-slate-200 focus:border-indigo-500'}`}
                          >
                            <option value="">-- Select --</option>
                            {mappingStep.headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-base font-medium">Rate Column</label>
                            {columnMap.rate && (
                              isRateValid ? 
                                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md"><CheckCircle className="w-3 h-3" /> Valid numbers found</span> : 
                                <span className="flex items-center gap-1 text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded-md"><XCircle className="w-3 h-3" /> No valid numbers</span>
                            )}
                          </div>
                          <select 
                            value={columnMap.rate} 
                            onChange={e => setColumnMap(p => ({ ...p, rate: e.target.value }))}
                            className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 transition-colors ${columnMap.rate ? (isRateValid ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30') : 'border-slate-200 focus:border-indigo-500'}`}
                          >
                            <option value="">-- Select --</option>
                            {mappingStep.headers.map((h, i) => <option key={i} value={h}>{h}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end mt-4">
                        <button 
                          onClick={() => setMappingStep(null)}
                          className="px-4 py-2 text-base font-medium hover:bg-slate-100 rounded-full transition-colors min-w-[80px] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          Cancel
                        </button>
                        <button onClick={saveMapping}
                          className="px-4 py-2 bg-slate-100 text-slate-700 text-base font-medium rounded-full hover:bg-slate-200 transition-colors border border-slate-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                        >
                          Save Preset
                        </button>
                        <button 
                          onClick={confirmMapping}
                          disabled={!isMaterialValid || !isRateValid}
                          className={`px-4 py-2 text-white text-base font-medium rounded-xl transition-colors ${!isMaterialValid || !isRateValid ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          Confirm & Import
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${dragActive ? "border-indigo-500 bg-indigo-50/80 scale-[1.02]" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"}`}
                    >
                      <><label htmlFor="a11y-input-467" className="sr-only">Input</label>
<input id="a11y-input-467" ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                      /></>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-4 transition-all duration-300 ${dragActive ? "bg-indigo-600 shadow-indigo-200 animate-bounce" : "bg-white border border-slate-100"}`}>
                        <Upload className={`w-6 h-6 transition-colors duration-300 ${dragActive ? "text-white" : "text-indigo-500"}`} />
                      </div>
                      
                      {dragActive ? (
                        <h4 className="text-lg font-bold text-indigo-700 mb-2 animate-pulse">
                          Drop CSV file here...
                        </h4>
                      ) : (
                        <>
                          <h4 className="text-base font-bold text-slate-800 mb-1">
                            Upload your CSV
                          </h4>
                          <p className="text-base font-medium mb-1">
                            Drag & drop your file here, or{" "}
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold transition-colors select-none rounded-full"
                            >
                              browse
                            </button>
                          </p>
                        </>
                      )}
                      
                      <p className={`text-sm text-slate-500 max-w-[280px] mt-2 mb-4 transition-opacity duration-300 ${dragActive ? "opacity-0" : "opacity-100"}`}>
                        Supports comma-separated rows or columns with material names.
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className={`flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hover:shadow transition-all font-semibold select-none ${dragActive ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500 rounded-full transition-all duration-300 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm" /> Download Template CSV
                      </button>
                    </div>
                  )}

                  {/* Manual forms */}
                  <div className="grid gap-4 max-h-[250px] overflow-y-auto pr-2">
                    {Object.keys(RATE_LABELS).map((key) => {
                      const k = key as keyof MarketRates;
                      return (
                        <div key={k} className="flex items-center justify-between gap-4 p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl transition-colors flex-wrap">
                          <label className="text-sm font-medium text-slate-700">{RATE_LABELS[k]}</label>
                          <><label htmlFor="a11y-input-468" className="sr-only">Default</label>
<input id="a11y-input-468"
                            type="number" inputMode="decimal"
                            value={companyRates[k] ?? ""}
                            placeholder="Default"
                            onChange={(e) => setCompanyRate(k, parseFloat(e.target.value))}
                            className="w-32 bg-white border border-slate-200 rounded-full px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 outline-none"
                          /></>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Imports History */}
                  {importHistory.length > 0 && (
                    <div className="w-full bg-white border border-slate-200 rounded-[24px] p-4 sm:p-6 shadow-sm border-t mt-4 overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-800 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-500" /> Recent Imports
                        </h5>
                        <button
                          onClick={() => {
                            setImportHistory([]);
                            localStorage.removeItem("company_rates_import_history");
                          }}
                          className="text-base font-medium hover:text-slate-800 transition-colors rounded-full"
                        >
                          Clear History
                        </button>
                      </div>
                      <div className="space-y-3">
                        {importHistory.map(record => (
                          <div key={record.id} className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${record.status === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex flex-col">
                              <span className={`text-base font-medium ${record.status === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                                {record.fileName} <span className="text-sm font-medium opacity-70 ml-2">{new Date(record.timestamp).toLocaleTimeString()}</span>
                              </span>
                              <span className={`text-sm ${record.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {record.message}
                              </span>
                            </div>
                            <div className="shrink-0">
                              {record.status === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="w-full mt-12 md:max-w-xl md:mx-auto md:mx-0 flex justify-end px-4 md:px-0">
              <button onClick={onClose}
                className="px-8 py-3.5 bg-gradient-to-r hover:from-blue-700 hover: text-slate-900 font-bold rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
