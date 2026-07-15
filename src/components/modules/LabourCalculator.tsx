import React, { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle,
  TrendingDown,
  Download,
  CalendarClock,
  HardHat,
  Hammer
} from "lucide-react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { useGlobalPrint } from "../../hooks/useGlobalPrint";
import { generateProfessionalPDF } from "../../utils/pdfGenerator";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

interface LabourTask {
  id: string;
  name: string;
  qty: number;
  unit: string;
  skilledRole: string;
  skilledCount: number;
  skilledWage: number;
  unskilledRole: string;
  unskilledCount: number;
  unskilledWage: number;
  outputPerWorker: number;
  isUnskilledDriven: boolean;
}

const commonTasks = [
  { name: "Excavation", unit: "m³", skilledRole: "None", unskilledRole: "Laborer", outputPerWorker: 3.0, isUnskilledDriven: true, defaultSkilled: 0, defaultUnskilled: 4 },
  { name: "Brickwork", unit: "m³", skilledRole: "Mason", unskilledRole: "Helper", outputPerWorker: 1.25, isUnskilledDriven: false, defaultSkilled: 2, defaultUnskilled: 3 },
  { name: "Plastering", unit: "sqm", skilledRole: "Mason", unskilledRole: "Helper", outputPerWorker: 10.0, isUnskilledDriven: false, defaultSkilled: 2, defaultUnskilled: 2 },
  { name: "Painting", unit: "sqm", skilledRole: "Painter", unskilledRole: "Helper", outputPerWorker: 40.0, isUnskilledDriven: false, defaultSkilled: 2, defaultUnskilled: 1 },
  { name: "Concreting", unit: "m³", skilledRole: "Mason", unskilledRole: "Laborer", outputPerWorker: 4.0, isUnskilledDriven: false, defaultSkilled: 1, defaultUnskilled: 5 },
  { name: "Steel Binding", unit: "kg", skilledRole: "Fitter", unskilledRole: "Helper", outputPerWorker: 150.0, isUnskilledDriven: false, defaultSkilled: 2, defaultUnskilled: 3 },
  { name: "Formwork", unit: "sqm", skilledRole: "Carpenter", unskilledRole: "Helper", outputPerWorker: 8.0, isUnskilledDriven: false, defaultSkilled: 2, defaultUnskilled: 2 },
  { name: "Custom", unit: "units", skilledRole: "Skilled", unskilledRole: "Unskilled", outputPerWorker: 10.0, isUnskilledDriven: false, defaultSkilled: 1, defaultUnskilled: 1 },
];

export default function LabourCalculator() {
  const { settings, formatCurrency } = useSettings();
  const [tasks, setTasks] = useState<LabourTask[]>([
    { 
      id: uuidv4(), 
      name: "Brickwork", 
      qty: 100, 
      unit: "m³", 
      skilledRole: "Mason",
      skilledCount: 2,
      skilledWage: 1200,
      unskilledRole: "Helper",
      unskilledCount: 3,
      unskilledWage: 600,
      outputPerWorker: 1.25,
      isUnskilledDriven: false
    }
  ]);

  const handleAddTask = () => {
    setTasks([...tasks, { 
      id: uuidv4(), 
      name: "Custom", 
      qty: 0, 
      unit: "units", 
      skilledRole: "Skilled",
      skilledCount: 1,
      skilledWage: 1000,
      unskilledRole: "Unskilled",
      unskilledCount: 1,
      unskilledWage: 500,
      outputPerWorker: 10.0,
      isUnskilledDriven: false
    }]);
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: string, field: keyof LabourTask, value: any) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        if (field === "name") {
          const preset = commonTasks.find(pt => pt.name === value);
          if (preset) {
            updated.unit = preset.unit;
            updated.skilledRole = preset.skilledRole;
            updated.unskilledRole = preset.unskilledRole;
            updated.skilledCount = preset.defaultSkilled;
            updated.unskilledCount = preset.defaultUnskilled;
            updated.outputPerWorker = preset.outputPerWorker;
            updated.isUnskilledDriven = preset.isUnskilledDriven;
          }
        }
        return updated;
      }
      return t;
    }));
  };

  const calculateTaskCost = (t: LabourTask) => {
    const keyWorkers = t.isUnskilledDriven ? t.unskilledCount : t.skilledCount;
    const dailyOutput = keyWorkers * t.outputPerWorker;
    const daysRequired = dailyOutput > 0 ? Math.ceil((t.qty / dailyOutput) * 10) / 10 : 0;
    const dailyBurnRate = (t.skilledCount * t.skilledWage) + (t.unskilledCount * t.unskilledWage);
    return { days: daysRequired, burn: dailyBurnRate, total: daysRequired * dailyBurnRate };
  };

  const calculateTotalProjectCost = () => {
    return tasks.reduce((sum, t) => sum + calculateTaskCost(t).total, 0);
  };

  const calculateMaxEstimatedDays = () => {
    return Math.max(0, ...tasks.map(t => calculateTaskCost(t).days));
  };

  const calculateSumActualDays = () => {
    return tasks.reduce((sum, t) => sum + calculateTaskCost(t).days, 0);
  };

  const totalCost = calculateTotalProjectCost();
  const sequentialDays = calculateSumActualDays();
  const overallBurnRate = sequentialDays > 0 ? totalCost / sequentialDays : 0;

  const getPrintData = () => {
    const tableData = tasks.map(t => {
      const calculation = calculateTaskCost(t);
      return [
        t.name,
        `${t.qty} ${t.unit} (${calculation.days} Days)`,
        t.unit,
        formatCurrency(calculation.total).replace(/[^0-9.,]/g, '')
      ];
    });

    const chartData = tasks.map(t => ({
      label: t.name,
      value: calculateTaskCost(t).total,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));

    return {
      title: "Labour & Resource Allocator",
      toolId: "labour-calculator",
      filename: "Labour_Resource_Allocator.pdf",
      inputs: {
        "Total Tasks": tasks.length,
        "Total Duration": `${sequentialDays} Days`,
        "Total Workers (Max)": tasks.reduce((sum, t) => sum + t.skilledCount + t.unskilledCount, 0)
      },
      tableData,
      chartData,
      grandTotal: totalCost
    };
  };

  useGlobalPrint(getPrintData);

  const handleExportPDF = async () => {
    try {
      const doc = await generateProfessionalPDF(getPrintData());
      doc.save("Labour_Cost_Estimate.pdf");
      toast.success("PDF Downloaded Successfully");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="w-full h-full bg-transparent text-slate-900 dark:text-white p-6 md:p-8">
      <div className="w-full md:max-w-6xl md:mx-auto space-y-6 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex gap-4 items-center flex-wrap">
            <button onClick={handleExportPDF}
              className="w-full flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-slate-200 text-slate-900 rounded-full shadow hover:bg-slate-700 transition-colors active:scale-95 hover:-translate-y-0.5 overflow-hidden"
            >
              <Download className="w-4 h-4" /> Export Bill
            </button>
            <GlobalSettingsToggle align="left" showCurrency={true} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Workspace */}
          <div className="lg:col-span-3 bg-bg-card rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-lg text-slate-800">Work Items</h3>
                <button onClick={handleAddTask}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-100 transition-colors text-sm active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              <div className="space-y-4">
                {tasks.map((task, index) => {
                  const calculation = calculateTaskCost(task);

                  return (
                    <div key={task.id} className="p-5 calc-input shadow-sm space-y-4 transition-all duration-300 hover:border-indigo-300 relative">
                      {tasks.length > 1 && (
                        <button 
                          onClick={() => handleRemoveTask(task.id)}
                          className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 transition-colors p-1 rounded-full"
                          title="Remove Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="flex items-center gap-3 pr-10 border-b border-slate-100 pb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                          {index + 1}
                        </div>
                        <select 
                          value={task.name}
                          onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                          className="flex-1 bg-transparent border-none text-lg font-bold text-slate-800 focus:ring-0 p-0 cursor-pointer"
                        >
                          {commonTasks.map(ct => (
                            <option key={ct.name} value={ct.name}>{ct.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-base font-medium uppercase tracking-wider flex items-center gap-1"><Hammer className="w-3 h-3"/> Quantity required</label>
                          <div className="flex gap-2">
                            <><label htmlFor="a11y-input-310" className="sr-only">Input</label>
<input id="a11y-input-310" 
                              type="number" inputMode="decimal" 
                              value={task.qty} 
                              onChange={(e) => updateTask(task.id, 'qty', parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-200 shadow-sm text-slate-800 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 min-w-0"
                            /></>
                            <><label htmlFor="a11y-input-311" className="sr-only">Input</label>
<input id="a11y-input-311" 
                              type="text" 
                              value={task.unit} 
                              onChange={(e) => updateTask(task.id, 'unit', e.target.value)}
                              className="w-[80px] bg-slate-50 border border-slate-200 shadow-sm text-slate-800 rounded-full px-2 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50 text-center text-sm"
                            /></>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-base font-medium uppercase tracking-wider flex items-center gap-1"><HardHat className="w-3 h-3 text-amber-500"/> Skilled ({task.skilledRole})</label>
                          <div className="flex gap-2 items-center">
                            <><label htmlFor="a11y-input-312" className="sr-only">Qty</label>
<input id="a11y-input-312" 
                              type="number" inputMode="decimal" 
                              value={task.skilledCount} 
                              onChange={(e) => updateTask(task.id, 'skilledCount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-slate-50 border border-slate-200 shadow-sm text-slate-800 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50"
                              placeholder="Qty"
                            /></>
                            <span className="text-base font-medium">×</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-slate-600 text-sm">
                                    {settings.currency.substring(0,2)}
                                </span>
                                <><label htmlFor="a11y-input-313" className="sr-only">Wage</label>
<input id="a11y-input-313" 
                                  type="number" inputMode="decimal" 
                                  value={task.skilledWage} 
                                  onChange={(e) => updateTask(task.id, 'skilledWage', parseFloat(e.target.value) || 0)}
                                  className="w-full bg-slate-50 border border-slate-200 shadow-sm text-slate-800 rounded-full pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50"
                                  placeholder="Wage"
                                /></>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-base font-medium uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3 text-sky-500"/> Unskilled ({task.unskilledRole})</label>
                          <div className="flex gap-2 items-center">
                            <><label htmlFor="a11y-input-314" className="sr-only">Qty</label>
<input id="a11y-input-314" 
                              type="number" inputMode="decimal" 
                              value={task.unskilledCount} 
                              onChange={(e) => updateTask(task.id, 'unskilledCount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-slate-50 border border-slate-200 shadow-sm text-slate-800 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50"
                              placeholder="Qty"
                            /></>
                            <span className="text-base font-medium">×</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-slate-600 text-sm">
                                    {settings.currency.substring(0,2)}
                                </span>
                                <><label htmlFor="a11y-input-315" className="sr-only">Wage</label>
<input id="a11y-input-315" 
                                  type="number" inputMode="decimal" 
                                  value={task.unskilledWage} 
                                  onChange={(e) => updateTask(task.id, 'unskilledWage', parseFloat(e.target.value) || 0)}
                                  className="w-full bg-slate-50 border border-slate-200 shadow-sm text-slate-800 rounded-full pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500/50"
                                  placeholder="Wage"
                                /></>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-end lg:items-end">
                           <div className="text-base font-medium uppercase tracking-wider mb-2 lg:hidden">Task Total Cost</div>
                           <div className="text-xl font-semibold text-slate-800 tabular-nums tracking-tight text-indigo-600">
                             {formatCurrency(calculation.total)}
                           </div>
                        </div>
                      </div>
                      
                      {/* Sub-analytics for the item */}
                      <div className="pt-2 flex flex-wrap gap-4 text-sm font-medium text-slate-500 bg-slate-50 p-4 rounded-[24px] border border-slate-100 mt-2 overflow-hidden">
                         <div className="flex items-center gap-1.5 w-full md:w-auto">
                            <CalendarClock className="w-4 h-4 text-emerald-500" />
                            Est. Timeline: <span className="font-bold text-emerald-700 max-w-full text-base">{calculation.days} Days</span>
                         </div>
                         <div className="flex items-center gap-1.5 w-full md:w-auto">
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                            Daily Gang Cost (Burn): <span className="font-bold text-rose-700">{formatCurrency(calculation.burn)}</span>
                         </div>
                         <div className="w-full md:w-auto flex flex-1 lg:justify-end gap-2 items-center">
                            <span className="text-slate-600 hidden lg:inline">Efficiency Constant:</span>
                            <><label htmlFor="a11y-input-316" className="sr-only">Input</label>
<input id="a11y-input-316" type="number" inputMode="decimal" 
                                  value={task.outputPerWorker} 
                                  onChange={(e) => updateTask(task.id, 'outputPerWorker', parseFloat(e.target.value) || 0)}
                                  className="w-16 bg-white border border-slate-200 text-center text-slate-700 rounded-full py-1 outline-none text-sm" /></>
                            <span className="text-slate-500">{task.unit} per {task.isUnskilledDriven ? task.unskilledRole : task.skilledRole} / day</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="w-full bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
              <h3 className="font-bold text-slate-500 uppercase tracking-wider text-sm mb-4">Overall Project Labour</h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-xl font-semibold tabular-nums tracking-tight text-slate-900">{formatCurrency(totalCost)}</p>
                  <p className="text-sm text-slate-500 mt-1">Total Labour Estimate</p>
                </div>
                
                <div className="w-full h-px bg-slate-100"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-bold text-rose-400 w-full truncate">{formatCurrency(overallBurnRate)}</p>
                    <p className="text-sm text-slate-600 mt-0.5">Average Daily Burn</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                      {sequentialDays} <span className="text-sm">Days</span>
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">Total Duration</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-[#F5F5F7]"></div>

                <div>
                   <p className="text-lg font-bold text-sky-400 flex items-center gap-1">
                      {tasks.reduce((sum, t) => sum + t.skilledCount + t.unskilledCount, 0)} <span className="text-sm">Workers</span>
                   </p>
                   <p className="text-sm text-slate-600 mt-0.5">Max Workforce Required</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-[24px] p-4 sm:p-6 gap-3 overflow-hidden">
              <h3 className="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Labour Allocation Logic
              </h3>
              <p className="text-sm text-indigo-700 leading-relaxed mb-3">
                Calculations are built on standard labor efficiency constants indicating standard output given a standard gang configuration.
              </p>
              <p className="text-sm text-indigo-700 leading-relaxed font-semibold">
                Daily Burn Rate = Skilled Wages + Unskilled Wages
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CalculationHistory
        calculatorId="labour_workforce"
        estimationName="Labour & Workforce Estimate"
        currentInputs={{ tasks: tasks.length }}
        currentResults={{ total: totalCost, burn: overallBurnRate }}
        summaryGeneration={(inputs, res) => `Total: Rs ${res.total} - Tasks: ${inputs.tasks}`}
        onRestore={(savedInputs) => {}}
      />
    </div>
  );
}
