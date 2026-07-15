import React, { useState } from "react";
import BarBendingSchedule from "./BarBendingSchedule";
import MetalWeightCalculator from "./MetalWeightCalculator";
import ConstructionMaterialEstimator from "./Calculators";
import ReinforcementVisualizer from "./ReinforcementVisualizer";
import FormworkEstimator from "./FormworkEstimator";
import { Grid2X2, Package, Search, BarChart2, Layers, RotateCw, PenTool, LayoutDashboard } from "lucide-react";
import CageEstimator from "./CageEstimator"; // We will create this
import { CalculationHistory } from '../ui/CalculationHistory';

type HubTab = "bbs" | "section-weight" | "bar-estimation" | "cage-estimator" | "detailing" | "formwork";

export default function SteelReinforcementHub() {
  const [activeTab, setActiveTab] = useState<HubTab>("bbs");

  const tabs: { id: HubTab; label: string; icon: any }[] = [
    { id: "bbs", label: "BBS Generator", icon: LayoutDashboard },
    { id: "section-weight", label: "Section Weight", icon: Package },
    { id: "bar-estimation", label: "Bar Estimation", icon: BarChart2 },
    { id: "cage-estimator", label: "Cage Estimator", icon: RotateCw },
    { id: "detailing", label: "Detailing Visualizer", icon: Search },
    { id: "formwork", label: "Formwork", icon: Layers }
  ];

  const [designStandard, setDesignStandard] = useState("IS 1786:2008 (Deformed Steel)");

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar for Sub-Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col pt-6 px-4 gap-2">
        <h2 className="text-xl font-bold tabular-nums tracking-tight text-slate-800 px-2 mb-4">
          Steel Hub
        </h2>
        
        <div className="px-2 mb-4">
          <label className="text-xs font-bold text-slate-500 uppercase">Design Standard</label>
          <select 
            value={designStandard}
            onChange={(e) => setDesignStandard(e.target.value)}
            className="w-full mt-1 bg-slate-100 border-none p-2 rounded-[16px] text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="IS 1786:2008 (Deformed Steel)">IS 1786:2008 (Deformed Steel)</option>
            <option value="SP 34:1987 (Reinforcement Detailing)">SP 34:1987 (Reinforcement Detailing)</option>
            <option value="BS 4449:2005 (Carbon Steel Bars)">BS 4449:2005 (Carbon Steel Bars)</option>
          </select>
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[24px] font-bold transition-all text-sm ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white    shadow-md translate-x-1"
                : "text-slate-600  hover:bg-slate-100 hover:text-slate-900 "
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTab === "bbs" && <BarBendingSchedule />}
          {activeTab === "section-weight" && <MetalWeightCalculator />}
          {activeTab === "bar-estimation" && <ConstructionMaterialEstimator forcedTab="steel" hideHeader />}
          {activeTab === "cage-estimator" && <CageEstimator />}
          {activeTab === "detailing" && <ReinforcementVisualizer />}
          {activeTab === "formwork" && <FormworkEstimator />}
        </div>
      </div>
    
      <CalculationHistory calculatorId="steelreinforcementhub_tool" currentInputs={{}} />
</div>
  );
}
