import React, { useState } from "react";
import { UniversalTabs } from "../ui/UniversalTabs";
import { Building2, Grid2X2, Columns, FileSpreadsheet, Layers, AlignVerticalSpaceAround, LayoutDashboard, ArrowUp, Calculator } from "lucide-react";
import { SEO } from "../SEO";

import MasterRccCore from "./MasterRccCore";
import SlabEstimator from "./SlabEstimator";
import ColumnEstimator from "./ColumnEstimator";
import BeamCalculator from "./BeamCalculator";
import BarBendingSchedule from "./BarBendingSchedule";
import StaircaseCalculator from "./StaircaseCalculator";
import { CalculationHistory } from '../ui/CalculationHistory';

type RccTab = "master" | "slab" | "column" | "beam" | "staircase" | "bbs";

interface MasterRccProps {
  isEmbedded?: boolean;
  onNavigate?: (module: string) => void;
}

export default function MasterRccStructure({ isEmbedded = false, onNavigate }: MasterRccProps) {
  const [activeTab, setActiveTab] = useState<RccTab>("master");

  const tabs: { id: RccTab; label: string; icon: any }[] = [
    { id: "master", label: "Master Engine", icon: LayoutDashboard },
    { id: "slab", label: "Slab Estimator", icon: Grid2X2 },
    { id: "column", label: "Column Estimator", icon: Columns },
    { id: "beam", label: "Beam Calculator", icon: AlignVerticalSpaceAround },
    { id: "staircase", label: "Staircase Calculator", icon: Layers },
    { id: "bbs", label: "BBS Generator", icon: FileSpreadsheet },
  ];

  return (
    <div className={isEmbedded ? "w-full" : "max-w-7xl mx-auto pb-20"}>
      {!isEmbedded && (
        <>
          <SEO 
            title="Master RCC Estimator | EstiPro"
            description="Unified hub for all concrete and steel calculations, including slabs, columns, beams, staircases, and Bar Bending Schedules."
          />
          
          
        </>
      )}

      <div className="flex flex-col gap-4 px-1 md:px-0">
        <UniversalTabs 
          tabs={tabs.map(t => ({ id: t.id, label: t.label, icon: t.icon ? <t.icon className="w-5 h-5" /> : undefined }))} 
          activeTab={activeTab} 
          onTabChange={(id) => setActiveTab(id as any)} 
        />

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          {activeTab === "master" && <MasterRccCore />}
          {activeTab === "slab" && <SlabEstimator />}
          {activeTab === "column" && <ColumnEstimator />}
          {activeTab === "beam" && <BeamCalculator />}
          {activeTab === "staircase" && <StaircaseCalculator />}
          {activeTab === "bbs" && <BarBendingSchedule />}
        </div>
      </div>
    
      
      <CalculationHistory calculatorId="masterrccstructure_tool" currentInputs={{}} />
</div>
  );
}
