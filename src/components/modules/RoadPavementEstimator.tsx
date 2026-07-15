import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { CalculationHistory } from "../ui/CalculationHistory";
import { Route, Layers, Droplet, Waves, Send, Settings2 } from "lucide-react";
import { SEO } from "../SEO";
import RoadEstimator from "./RoadEstimator";
import RigidPavementEstimator from "./RigidPavementEstimator";
import AsphaltPavingCalculator from "./AsphaltPavingCalculator";
import SewerageEstimator from "./SewerageEstimator";

type Tab = "flexible" | "rigid" | "asphalt" | "sewerage";

export default function RoadPavementEstimator({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("flexible");
  const [designStandard, setDesignStandard] = useState("IRC:37-2018 (Flexible)");

  const handleUseInBOQ = () => {
    const activeItems = (window as any).__currentRoadBOQItems || [];
    if (activeItems.length > 0) {
      const event = new CustomEvent('fill-boq', { detail: activeItems });
      window.dispatchEvent(event);
      if (onNavigate) {
        onNavigate("boq");
      }
    } else {
      alert("Please calculate quantities first to pre-fill the BOQ.");
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "flexible", label: "Flexible Pavement", icon: Route },
    { id: "rigid", label: "Rigid Pavement", icon: Layers },
    { id: "asphalt", label: "Asphalt & Paving", icon: Droplet },
    { id: "sewerage", label: "Drainage & Sewerage", icon: Waves },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <SEO 
        title="Road & Pavement Estimator | EstiPro"
        description="Comprehensive tool for flexible, rigid, and asphalt pavement calculations."
      />
      
      <div className="mb-6 md:mb-8 px-4 md:px-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        <div className="flex flex-col gap-3 sm:flex-row items-center">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <select
              value={designStandard}
              onChange={(e) => setDesignStandard(e.target.value)}
              className="text-sm font-semibold bg-transparent border-none outline-none focus:ring-0 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="IRC:37-2018 (Flexible)">IRC:37-2018 (Flexible)</option>
              <option value="IRC:58-2015 (Rigid)">IRC:58-2015 (Rigid)</option>
              <option value="AASHTO 1993">AASHTO 1993</option>
            </select>
          </div>
          <button onClick={handleUseInBOQ}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-slate-900 dark:text-white font-bold rounded-full shadow-sm hover:shadow-md transition-all text-sm w-full sm:w-auto justify-center active:scale-95 hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
            Use these quantities in BOQ Generator
          </button>
        </div>
      </div>

      <UniversalTabs 
          tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon ? <t.icon className="w-5 h-5" /> : undefined }))} 
          activeTab={activeTab} 
          onTabChange={(id) => setActiveTab(id as any)} 
        />

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mt-2">
          {activeTab === "flexible" && <RoadEstimator />}
          {activeTab === "rigid" && <RigidPavementEstimator />}
          {activeTab === "asphalt" && <AsphaltPavingCalculator />}
          {activeTab === "sewerage" && <SewerageEstimator />}
        </div>
      </div>
    
      <CalculationHistory
        calculatorId="roadpavementestimator"
        currentInputs={{}}
        currentResults={{}}
        estimationName="Road Pavement Estimator"
      />
</div>
  );
}
