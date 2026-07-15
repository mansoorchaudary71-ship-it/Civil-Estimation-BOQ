import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Save,
  Trash2,
  ChevronRight,
  X,
  CloudUpload,
  Home,
  Share2,
  Printer,
  User,
  Scale,
  ChevronDown,
  Calculator
} from "lucide-react";
import { saveEstimate, getToolEstimates } from "../../lib/estimates";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import ShareButtonWithPopup from "../modules/ShareMenu";
import {
  CalculationExplanation,
  CalculationExplanationOptions,
} from "./CalculationExplanation";

interface HistoryItem {
  id: string;
  name: string;
  date: number;
  inputs: Record<string, any>;
  results: Record<string, any>;
  summary: string;
}

interface CalculationHistoryProps {
  calculatorId: string;
  currentInputs: Record<string, any>;
  currentResults?: Record<string, any>;
  summaryGeneration?: (
    inputs: Record<string, any>,
    results: Record<string, any>,
  ) => string;
  onRestore?: (inputs: Record<string, any>) => void;
  savePayload?: any;
  estimationName?: string;
  explanation?: CalculationExplanationOptions;
}

function getDefaultExplanation(
  calculatorId: string,
  currentInputs: any,
  currentResults: any,
): CalculationExplanationOptions | undefined {
  const hasInputs =
    currentInputs &&
    Object.values(currentInputs).some((v: any) => v && v !== "0" && v !== 0);

  // Return generic formulas based on calculatorId if hasInputs is false
  if (!hasInputs) {
    let genericFormula: { label: string; formula: string }[] = [];
    let notes: string[] = [];

    switch (true) {
      case calculatorId.includes("area_calculator"):
        genericFormula = [
          { label: "Rectangular Area", formula: "Length × Width" },
          { label: "Circular Area", formula: "π × Radius²" },
          { label: "Triangular Area", formula: "0.5 × Base × Height" },
        ];
        break;
      case calculatorId.includes("takeoff"):
        genericFormula = [
          { label: "BOQ Line Item Amount", formula: "Quantity × Unit Rate" },
        ];
        break;
      case calculatorId.includes("volume_estimator"):
        return undefined; // Handled manually
      case calculatorId.includes("metal_weight"):
        genericFormula = [
          {
            label: "Steel Weight",
            formula: "(D² / 162.28) × Length × No. of bars",
          },
        ];
        notes = [
          "D = Diameter of Bar in mm",
          "L = Total Length of Bar in m",
          "Formula is derived from the density of steel (7850 kg/m³)",
        ];
        break;
      case calculatorId.includes("slab_estimator"):
        genericFormula = [
          { label: "Concrete Volume", formula: "Length × Width × Thickness" },
          {
            label: "Steel Weight",
            formula: "(D² / 162.28) × Total Length × No. of Bars",
          },
        ];
        notes = ["Dry Concrete Volume = Wet Volume × 1.54"];
        break;
      case calculatorId.includes("column"):
        genericFormula = [
          { label: "Concrete Volume", formula: "Length × Width × Depth" },
          {
            label: "Main Steel Weight",
            formula: "(D² / 162.28) × Length × No. of Main Bars",
          },
          { label: "Number of Ties", formula: "(Length / Spacing) + 1" },
          { label: "Tie Cut Length", formula: "2 × (A + B) + Hook Lengths" },
        ];
        notes = [
          "Dry Concrete Volume = Wet Volume × 1.54",
          "A & B are inner dimensions after subtracting Clear Cover",
        ];
        break;
      case calculatorId.includes("beam"):
        genericFormula = [
          { label: "Concrete Volume", formula: "Length × Width × Depth" },
          {
            label: "Main Steel Weight",
            formula: "(D² / 162.28) × Length × Total Bars",
          },
          { label: "Stirrup Cut Length", formula: "2 × (A + B) + 24D" },
          { label: "Number of Stirrups", formula: "(Length / Spacing) + 1" },
        ];
        break;
      case calculatorId.includes("brickwork"):
        genericFormula = [
          { label: "Volume of Wall", formula: "Length × Height × Thickness" },
          {
            label: "No. of Bricks",
            formula: "Volume of Wall / Volume of 1 Brick with Mortar",
          },
          { label: "Dry Mortar", formula: "Total Mortar Volume × 1.33" },
        ];
        notes = [
          "1.33 is the dry volume conversion factor for mortar",
          "Standard Mortar Joint is typically 10mm",
        ];
        break;
      case calculatorId.includes("staircase"):
        genericFormula = [
          {
            label: "Volume of Steps",
            formula: "0.5 × Tread × Riser × Width × Number of Steps",
          },
          {
            label: "Waist Slab Volume",
            formula: "Length of Waist × Thickness × Width",
          },
        ];
        break;
      case calculatorId.includes("house_estimator") ||
        calculatorId.includes("rate_analysis"):
        genericFormula = [
          {
            label: "Total Cost",
            formula:
              "Σ (Material Cost + Labor Cost + Equipment) * (1 + Profit Margin)",
          },
        ];
        break;
      case calculatorId.includes("formwork"):
        genericFormula = [
          {
            label: "Formwork Area",
            formula: "Perimeter of Section × Height/Depth",
          },
        ];
        notes = ["Consider surface area exposed to concrete casting"];
        break;
      case calculatorId.includes("manhole"):
        genericFormula = [
          {
            label: "Cylindrical Excavation Volume",
            formula: "π × Radius² × Depth",
          },
          { label: "Rectangular Volume", formula: "Length × Width × Depth" },
        ];
        break;
      case calculatorId.includes("sewerage"):
        genericFormula = [
          {
            label: "Trench Excavation",
            formula: "Trench Width × Trench Depth × Trench Length",
          },
          { label: "Pipe Volume", formula: "π × ((OD² - ID²) / 4) × Length" },
        ];
        break;
      case calculatorId.includes("trench_excavation"):
        genericFormula = [
          {
            label: "Rectangular Trench Volume",
            formula: "Length × Width × Depth",
          },
          {
            label: "Trapezoidal Trench Volume",
            formula: "L × (Top Width + Bottom Width) / 2 × Depth",
          },
        ];
        break;
      case calculatorId.includes("asphalt") ||
        calculatorId.includes("rigid_pavement"):
        genericFormula = [
          { label: "Pavement Volume", formula: "Length × Width × Thickness" },
          {
            label: "Tonnage (Asphalt)",
            formula: "Volume × Density (e.g., 2.33 t/m³)",
          },
        ];
        break;
      case calculatorId.includes("coat_calc"):
        genericFormula = [
          {
            label: "Emulsion Requirement",
            formula: "Total Area × Application Rate",
          },
        ];
        break;
      case calculatorId.includes("property_area"):
        genericFormula = [
          {
            label: "Carpet Area",
            formula: "Σ (Inner dimensions of all rooms)",
          },
          {
            label: "Built-up Area",
            formula: "Carpet Area + Wall Area + Balcony Area",
          },
          {
            label: "Super Built-up Area",
            formula: "Built-up Area + Proportionate Common Area",
          },
        ];
        break;
      case calculatorId.includes("energy") || calculatorId.includes("mep"):
        genericFormula = [
          {
            label: "Total Load (Wh)",
            formula: "Σ (Power rating × Quantity × Usage Hours)",
          },
        ];
        break;
      case calculatorId.includes("sieve") || calculatorId.includes("aggregate"):
        genericFormula = [
          {
            label: "Percentage Retained",
            formula: "(Weight of Sieve / Total Weight) × 100",
          },
          {
            label: "Cumulative % Passing",
            formula: "100 - Cumulative % Retained",
          },
        ];
        break;
      case calculatorId.includes("earthworks") ||
        calculatorId.includes("chainage") ||
        calculatorId.includes("grid_earthwork"):
        genericFormula = [
          {
            label: "Grid Volume Method",
            formula: "(Area of single grid / 4) × (Σh1 + 2Σh2 + 3Σh3 + 4Σh4)",
          },
          {
            label: "Trapezoidal Method",
            formula: "Length × (Area1 + Area2) / 2",
          },
          {
            label: "Prismoidal Method",
            formula: "(Length / 6) × (A1 + 4*Am + A2)",
          },
        ];
        break;
      case calculatorId.includes("unit_converter"):
        genericFormula = [
          {
            label: "Unit Conversion",
            formula: "Input Value × Conversion Factor",
          },
        ];
        break;
      case calculatorId.includes("gradient"):
        genericFormula = [
          { label: "Gradient (%)", formula: "(Rise / Run) × 100" },
          { label: "Slope Angle", formula: "arctan(Rise / Run)" },
        ];
        break;
      case calculatorId.includes("solar_roof"):
        genericFormula = [
          {
            label: "Number of Panels",
            formula: "Usable Roof Area / Area per Panel",
          },
          {
            label: "System Capacity (kW)",
            formula: "Number of Panels × Panel Wattage",
          },
        ];
        break;
      case calculatorId.includes("tiles"):
        genericFormula = [
          { label: "Total Area", formula: "Length × Width" },
          {
            label: "Number of Tiles",
            formula: "(Total Area / Area of 1 Tile) × (1 + Wastage %)",
          },
        ];
        break;
      case calculatorId.includes("paint"):
        genericFormula = [
          {
            label: "Paintable Area",
            formula: "Total Wall Area - Area of Openings (Doors/Windows)",
          },
          {
            label: "Paint Estimation",
            formula:
              "(Paintable Area / Paint Coverage per Litre) × Double Coat Factor",
          },
        ];
        break;
      case calculatorId.includes("bbs"):
        genericFormula = [
          {
            label: "Cutting Length",
            formula: "Clear Span + Development Lengths - Bend Deductions",
          },
          {
            label: "Total Steel Weight",
            formula: "(D² / 162.28) × Total Cutting Length",
          },
        ];
        break;
      default:
        genericFormula = [
          {
            label: "Calculation",
            formula: "Main Input(s) × Relevant Formula Factor",
          },
        ];
        break;
    }

    return { hasInputs: false, genericFormula, notes };
  }

  // If hasInputs is true, we fallback to a generic breakdown,
  // or preferably let the component pass `explanation` directly
  // since active breakdown varies heavily by specific input values.
  const breakdowns = [];
  if (currentResults && Object.keys(currentResults).length > 0) {
    for (const [key, value] of Object.entries(currentResults)) {
      if (typeof value === "string" || typeof value === "number") {
        breakdowns.push({
          label: key,
          formula: "Derived from calculation",
          result: String(value),
        });
      }
    }
  }

  return { hasInputs, activeBreakdown: breakdowns };
}

export function CalculationHistory({
  calculatorId,
  currentInputs,
  currentResults,
  summaryGeneration,
  onRestore,
  savePayload,
  estimationName = "Estimate",
  explanation,
}: CalculationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveType, setSaveType] = useState("General");
  const [compareItem, setCompareItem] = useState<HistoryItem | null>(null);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const { user } = useAuth();

  const finalExplanationOpts =
    explanation ||
    getDefaultExplanation(calculatorId, currentInputs, currentResults);

  useEffect(() => {
    const handleUpdate = () => {
      window.dispatchEvent(
        new CustomEvent("update-calc-data", {
          detail: {
            calculatorId,
            estimationName,
            currentInputs,
            currentResults,
            savePayload,
            historyLength: history.length,
            isSavingLocal,
            isSavingCloud,
          },
        }),
      );
    };
    handleUpdate();
    return () => {
      window.dispatchEvent(new CustomEvent("clear-calc-data"));
    };
  }, [
    calculatorId,
    estimationName,
    currentInputs,
    currentResults,
    savePayload,
    history.length,
    isSavingLocal,
    isSavingCloud,
  ]);

  const saveHistory = useCallback(() => {
    if (!currentInputs || Object.keys(currentInputs).length === 0) return;

    setIsSavingLocal(true);
    let summary = "Calculation";
    if (summaryGeneration && currentResults) {
      summary = summaryGeneration(currentInputs, currentResults);
    } else {
      summary = `${Object.values(currentInputs)[0] || "Unknown"} - ${new Date().toLocaleDateString()}`;
    }

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      name: `Local Save ${new Date().toLocaleTimeString()}`,
      date: Date.now(),
      inputs: { ...currentInputs },
      results: { ...(currentResults || {}) },
      summary,
    };

    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem(
      `calc_history_${calculatorId}`,
      JSON.stringify(newHistory),
    );
    toast.success("Saved to local history");

    setTimeout(() => {
      setIsSavingLocal(false);
    }, 500);
  }, [calculatorId, currentInputs, currentResults, history, summaryGeneration]);

  const handleCloudSave = useCallback(async () => {
    if (!user) {
      toast.error("Please login to save to cloud");
      return;
    }
    setSaveName(`My ${estimationName}`);
    setSaveType("General");
    setIsSaveModalOpen(true);
  }, [user, estimationName]);

  useEffect(() => {
    const handleGlobalSave = () => {
      if (!currentInputs || Object.keys(currentInputs).length === 0) {
        toast.error("Nothing to save yet");
        return;
      }
      saveHistory();
      if (user) {
        handleCloudSave();
      }
    };
    const handleGlobalHistory = () => setIsOpen(true);
    
    const handleSaveDraft = () => {
      if (!currentInputs || Object.keys(currentInputs).length === 0) {
        toast.error("Nothing to save as draft");
        return;
      }
      localStorage.setItem(`draft_${calculatorId}`, JSON.stringify(currentInputs));
      toast.success("Draft saved successfully! You can restore it later.", { icon: "📥" });
    };

    const handleLoadDraft = () => {
      const draft = localStorage.getItem(`draft_${calculatorId}`);
      if (draft && onRestore) {
        try {
          onRestore(JSON.parse(draft));
          toast.success("Draft loaded successfully!", { icon: "📤" });
        } catch (e) {
          toast.error("Failed to load draft data.");
        }
      } else if (!onRestore) {
         toast.error("This tool doesn't support restoring drafts yet.");
      } else {
         toast.error("No draft found for this tool.");
      }
    };

    window.addEventListener("trigger-global-save", handleGlobalSave);
    window.addEventListener("trigger-global-history", handleGlobalHistory);
    window.addEventListener("action-save-draft", handleSaveDraft);
    window.addEventListener("action-load-draft", handleLoadDraft);

    return () => {
      window.removeEventListener("trigger-global-save", handleGlobalSave);
      window.removeEventListener("trigger-global-history", handleGlobalHistory);
      window.removeEventListener("action-save-draft", handleSaveDraft);
      window.removeEventListener("action-load-draft", handleLoadDraft);
    };
  }, [currentInputs, user, saveHistory, handleCloudSave, calculatorId, onRestore]);

  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        try {
          const cloudEstimates = await getToolEstimates(calculatorId, 50);
          if (cloudEstimates && cloudEstimates.length > 0) {
            const mapped = cloudEstimates.map((est: any) => ({
              id: est.id,
              name: est.name,
              date: est.createdAt,
              inputs: est.payload?.inputs || est.payload,
              results: est.payload?.results || est.payload?.breakdown || {},
              summary: est.name,
            }));
            setHistory(mapped);
            return; // Use cloud history
          }
        } catch (err) {
          console.error("Failed to load cloud history:", err);
        }
      }

      const saved = localStorage.getItem(`calc_history_${calculatorId}`);
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      } else {
        setHistory([]);
      }
    }
    fetchHistory();
  }, [calculatorId, user, isOpen]);

  const confirmCloudSave = async () => {
    if (!saveName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const payloadToSave = savePayload || {
      inputs: currentInputs,
      breakdown: currentResults || {},
    };

    // Add calculatorId to payload so we can retrieve it
    payloadToSave.calculatorId = calculatorId;

    setIsSavingCloud(true);
    try {
      await saveEstimate(saveName, payloadToSave, saveType);
      toast.success("Saved to cloud Profile successfully!");
      setIsSaveModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save to cloud.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  const deleteItem = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this calculation?",
      )
    ) {
      const newHistory = history.filter((h) => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem(
        `calc_history_${calculatorId}`,
        JSON.stringify(newHistory),
      );
    }
  };

  const handleGoHome = () => {
    window.dispatchEvent(new CustomEvent("go-home"));
  };

  const baseBtnClass =
    "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 group focus:outline-none";
  const iconWrapperClass =
    "w-[42px] h-[42px] rounded-2xl flex items-center justify-center transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";

  return (
    <>
      {finalExplanationOpts && (
        <div className="w-[calc(100%+1.5rem)] -ml-3 md:w-full md:ml-0 mt-2 mb-4 bg-slate-50 dark:bg-slate-900/60 rounded-[20px] md:rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
          <button
            onClick={() => setIsExplanationOpen(!isExplanationOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 relative z-10 text-left focus:outline-none min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 overflow-hidden">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg sm:text-xl tracking-tight">
                {finalExplanationOpts.hasInputs ? "Calculation Breakdown" : "Formulas Used"}
              </h3>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExplanationOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${isExplanationOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-0">
              <CalculationExplanation {...finalExplanationOpts} />
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-bg-card shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Calculation History
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-white hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-700 dark:text-slate-700">
                  <History className="w-12 h-12 mb-3 opacity-20" />
                  <p>No history saved yet.</p>
                  <p className="text-sm mt-1">
                    Save a calculation to see it here.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-700 dark:text-slate-700">
                          {new Date(item.date).toLocaleString("en-US")}
                        </p>
                      </div>
                      <button aria-label="Delete"
                        onClick={() => deleteItem(item.id)}
                        className="text-slate-700 hover:text-red-500 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 bg-bg-card p-2 rounded border border-slate-200 dark:border-slate-700/50 line-clamp-2">
                      {item.summary}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (onRestore) onRestore(item.inputs);
                          setIsOpen(false);
                        }}
                        className="flex-1 py-2 bg-bg-card border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center justify-center gap-1"
                      >
                        Restore <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCompareItem(item)}
                        className="flex-1 py-2 bg-bg-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1"
                      >
                        Compare <Scale className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
                <button
                  onClick={() => {
                    if (
                      window.confirm("Clear all history for this calculator?")
                    ) {
                      setHistory([]);
                      localStorage.removeItem(`calc_history_${calculatorId}`);
                    }
                  }}
                  className="w-full py-2.5 text-slate-700 hover:text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Clear All History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {compareItem && (
        <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center font-sans p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCompareItem(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out animate-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Scale className="w-6 h-6 text-indigo-600" />
                Compare Results
              </h2>
              <button
                onClick={() => setCompareItem(null)}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                    Current Calculation
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="text-base font-medium uppercase tracking-wider mb-3">Inputs</h4>
                    <div className="space-y-2">
                      {Object.entries(currentInputs || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-base font-medium dark:text-slate-200">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-medium uppercase tracking-wider mb-3">Results</h4>
                    <div className="space-y-2">
                      {Object.entries(currentResults || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                          <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-base font-medium text-indigo-900 dark:text-indigo-200">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* History Item */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                    {compareItem.name} <span className="text-sm font-normal text-slate-500 ml-2">{new Date(compareItem.date).toLocaleString()}</span>
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="text-base font-medium uppercase tracking-wider mb-3">Inputs</h4>
                    <div className="space-y-2">
                      {Object.entries(compareItem.inputs || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-base font-medium dark:text-slate-200">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-medium uppercase tracking-wider mb-3">Results</h4>
                    <div className="space-y-2">
                      {Object.entries(compareItem.results || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center bg-slate-200 dark:bg-slate-700 p-2.5 rounded-lg border border-slate-300 dark:border-slate-600">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-base font-medium dark:text-slate-200">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center font-sans px-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSaveModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-bg-card shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out p-4 sm:p-6 pt-7 animate-in zoom-in-95">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                <CloudUpload className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Save Estimate
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Save to your cloud profile
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-base font-medium dark:text-slate-300 mb-1.5 ml-0.5">
                  Project Name
                </label>
                <><label htmlFor="a11y-input-582" className="sr-only">e.g. Dream House Ground Floor</label>
<input id="a11y-input-582"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  placeholder="e.g. Dream House Ground Floor"
                  autoFocus
                /></>
              </div>

              <div>
                <label className="block text-base font-medium dark:text-slate-300 mb-1.5 ml-0.5">
                  Estimate Type
                </label>
                <div className="relative">
                  <select
                    value={saveType}
                    onChange={(e) => setSaveType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium appearance-none"
                  >
                    <option value="General">General</option>
                    <option value="House">House</option>
                    <option value="Slab">Slab</option>
                    <option value="Beam">Beam</option>
                    <option value="Column">Column</option>
                    <option value="Blockwork">Block/Brickwork</option>
                    <option value="Plastering">Plastering</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-white dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                disabled={isSavingCloud}
              >
                Cancel
              </button>
              <button
                onClick={confirmCloudSave}
                disabled={isSavingCloud || !saveName.trim()}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCloud ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Estimate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
