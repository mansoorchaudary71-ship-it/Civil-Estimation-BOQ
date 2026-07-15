import React, { useState } from "react";
import {
  Route,
  Calculator,
  Layers,
  Settings2,
  BarChart3,
  Save,
} from "lucide-react";

import { saveEstimate } from "../../lib/estimates";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { CalculationHistory } from "../ui/CalculationHistory";
import { MaterialSummary } from "../ui/MaterialSummary";
import { ResultCard } from "../ui/ResultCard";
export default function RigidPavementEstimator() {
  const { user } = useAuth();
  const { settings, formatCurrency } = useSettings();
  const isPKR = settings.currency === "PKR";
  const [length, setLength] = useState<string>("1000");
  /* m */ const [laneWidth, setLaneWidth] = useState<string>("7.5");
  /* m */ const [dlcThickness, setDlcThickness] = useState<string>("150");
  /* mm */ const [pqcThickness, setPqcThickness] = useState<string>("250");
  /* mm */ const [dlcRatioC, setDlcRatioC] = useState<string>("1");
  const [dlcRatioS, setDlcRatioS] = useState<string>("3");
  const [dlcRatioA, setDlcRatioA] = useState<string>("6");
  const [dlcWcRatio, setDlcWcRatio] = useState<string>("0.5");
  const [pqcRatioC, setPqcRatioC] = useState<string>("1");
  const [pqcRatioS, setPqcRatioS] = useState<string>("1.5");
  const [pqcRatioA, setPqcRatioA] = useState<string>("3");
  const [pqcWcRatio, setPqcWcRatio] = useState<string>("0.45");
  const [transverseSpacing, setTransverseSpacing] = useState<string>("4.5");
  /* m */ const [longitudinalSpacing, setLongitudinalSpacing] =
    useState<string>("3.75");
  /* m */ const [dowelDiameter, setDowelDiameter] = useState<string>("32");
  /* mm */ const [dowelLength, setDowelLength] = useState<string>("500");
  /* mm */ const [dowelSpacing, setDowelSpacing] = useState<string>("300");
  /* mm */ const [tieDiameter, setTieDiameter] = useState<string>("12");
  /* mm */ const [tieLength, setTieLength] = useState<string>("600");
  /* mm */ const [tieSpacing, setTieSpacing] = useState<string>("600");
  /* mm */ const l = parseFloat(length) || 0;
  const w = parseFloat(laneWidth) || 0;
  const th_dlc = parseFloat(dlcThickness) || 0;
  const th_pqc = parseFloat(pqcThickness) || 0;
  const sp_trans = parseFloat(transverseSpacing) || 0;
  const sp_long = parseFloat(longitudinalSpacing) || 0;
  const d_dowel = parseFloat(dowelDiameter) || 0;
  const len_dowel = parseFloat(dowelLength) || 0;
  const sp_dowel = parseFloat(dowelSpacing) || 0;
  const d_tie = parseFloat(tieDiameter) || 0;
  const len_tie = parseFloat(tieLength) || 0;
  const sp_tie = parseFloat(tieSpacing) || 0;
  /* Concrete volumes */ const volDLC = l * w * (th_dlc / 1000);
  const volPQC = l * w * (th_pqc / 1000);
  const dlc_c = parseFloat(dlcRatioC) || 0;
  const dlc_s = parseFloat(dlcRatioS) || 0;
  const dlc_a = parseFloat(dlcRatioA) || 0;
  const dlc_wc = parseFloat(dlcWcRatio) || 0;
  const dlc_sum = dlc_c + dlc_s + dlc_a || 1;
  const pqc_c = parseFloat(pqcRatioC) || 0;
  const pqc_s = parseFloat(pqcRatioS) || 0;
  const pqc_a = parseFloat(pqcRatioA) || 0;
  const pqc_wc = parseFloat(pqcWcRatio) || 0;
  const pqc_sum = pqc_c + pqc_s + pqc_a || 1;
  const dlcDryVol = volDLC * 1.54;
  const dlcCementVol = dlcDryVol * (dlc_c / dlc_sum);
  const dlcCementKg = dlcCementVol * 1440;
  const dlcCementBags = Math.ceil(dlcCementKg / 50);
  const dlcSandVol = dlcDryVol * (dlc_s / dlc_sum);
  const dlcAggVol = dlcDryVol * (dlc_a / dlc_sum);
  const dlcWaterLiters = dlcCementKg * dlc_wc;
  const pqcDryVol = volPQC * 1.54;
  const pqcCementVol = pqcDryVol * (pqc_c / pqc_sum);
  const pqcCementKg = pqcCementVol * 1440;
  const pqcCementBags = Math.ceil(pqcCementKg / 50);
  const pqcSandVol = pqcDryVol * (pqc_s / pqc_sum);
  const pqcAggVol = pqcDryVol * (pqc_a / pqc_sum);
  const pqcWaterLiters = pqcCementKg * pqc_wc;
  /* Steel calculations */ const numTransverseJoints =
    sp_trans > 0 ? Math.floor(l / sp_trans) : 0;
  const dowelsPerJoint = sp_dowel > 0 ? Math.floor(w / (sp_dowel / 1000)) : 0;
  const totalDowels = numTransverseJoints * dowelsPerJoint;
  const dowelWtPerBar = ((d_dowel * d_dowel) / 162.28) * (len_dowel / 1000);
  const totalDowelWeight = totalDowels * dowelWtPerBar;
  /* kg Adjust longitudinal joint calculation to account for floating point errors */ const lanes =
    sp_long > 0 ? w / sp_long : 0;
  /* If lanes is close to an integer (e.g. 2.0), we subtract 1 because the edges don't get tie bars. Wait, if w=7.5, sp_long=3.5, w/sp=2.14 -> 2 inner joints? Let's use Math.floor(w / sp_long). If w / sp_long exactly integer, subtract 1. */ const isExactMultiple =
    Math.abs(lanes - Math.round(lanes)) < 0.01;
  const numLongitudinalJoints =
    sp_long > 0
      ? Math.max(0, Math.floor(lanes) - (isExactMultiple ? 1 : 0))
      : 0;
  const tiesPerJoint = sp_tie > 0 ? Math.floor(l / (sp_tie / 1000)) : 0;
  const totalTies = numLongitudinalJoints * tiesPerJoint;
  const tieWtPerBar = ((d_tie * d_tie) / 162.28) * (len_tie / 1000);
  const totalTieWeight = totalTies * tieWtPerBar;
  /* kg */ 
  
  React.useEffect(() => {
    (window as any).__currentRoadBOQItems = [
      {
        id: Math.random().toString(),
        division: "03 - Concrete",
        description: "Dry Lean Concrete (DLC)",
        unit: "m³",
        quantity: volDLC,
        rate: 0
      },
      {
        id: Math.random().toString(),
        division: "03 - Concrete",
        description: "Pavement Quality Concrete (PQC)",
        unit: "m³",
        quantity: volPQC,
        rate: 0
      },
      {
        id: Math.random().toString(),
        division: "05 - Metals",
        description: "Dowel Bars for Transverse Joints",
        unit: "kg",
        quantity: totalDowelWeight,
        rate: 0
      },
      {
        id: Math.random().toString(),
        division: "05 - Metals",
        description: "Tie Bars for Longitudinal Joints",
        unit: "kg",
        quantity: totalTieWeight,
        rate: 0
      }
    ];
  }, [volDLC, volPQC, totalDowelWeight, totalTieWeight]);

  return (
    <div className="w-full text-gray-900 font-sans md:p-4">
      {" "}
      <div className="max-w-7xl mx-auto space-y-6">
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {" "}
          {/* Inputs Section */}{" "}
          <section className="lg:col-span-8 space-y-6">
            {" "}
            {/* Base Geometry */}{" "}
            <div className="bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              {" "}
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                {" "}
                <div className="p-2.5 bg-blue-50 text-indigo-600 rounded-xl">
                  {" "}
                  <Layers className="w-5 h-5" />{" "}
                </div>{" "}
                <h2 className="text-xl font-bold tracking-tight text-gray-800">
                  Geometry & Thickness
                </h2>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {" "}
                <div>
                  {" "}
                  <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                    Length (m)
                  </label>{" "}
                  <><label htmlFor="a11y-input-436" className="sr-only">Input</label>
<input id="a11y-input-436" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 min-h-[44px]"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  /></>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                    Lane Width (m)
                  </label>{" "}
                  <><label htmlFor="a11y-input-437" className="sr-only">Input</label>
<input id="a11y-input-437" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 min-h-[44px]"
                    value={laneWidth}
                    onChange={(e) => setLaneWidth(e.target.value)}
                  /></>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                    DLC Thk (mm)
                  </label>{" "}
                  <><label htmlFor="a11y-input-438" className="sr-only">Input</label>
<input id="a11y-input-438" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 min-h-[44px]"
                    value={dlcThickness}
                    onChange={(e) => setDlcThickness(e.target.value)}
                  /></>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                    PQC Thk (mm)
                  </label>{" "}
                  <><label htmlFor="a11y-input-439" className="sr-only">Input</label>
<input id="a11y-input-439" type="number" inputMode="decimal"
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500 min-h-[44px]"
                    value={pqcThickness}
                    onChange={(e) => setPqcThickness(e.target.value)}
                  /></>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Concrete Mix Design */}{" "}
            <div className="bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              {" "}
              <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
                {" "}
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  {" "}
                  <Calculator className="w-5 h-5" />{" "}
                </div>{" "}
                <h2 className="text-xl font-bold tracking-tight text-gray-800">
                  Concrete Mix Design
                </h2>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {" "}
                <div className="space-y-4">
                  {" "}
                  <h3 className="font-semibold text-slate-700 bg-transparent px-3 py-2 rounded-lg inline-block">
                    DLC Configuration
                  </h3>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Cement
                      </label>{" "}
                      <><label htmlFor="a11y-input-440" className="sr-only">Input</label>
<input id="a11y-input-440" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={dlcRatioC}
                        onChange={(e) => setDlcRatioC(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Sand
                      </label>{" "}
                      <><label htmlFor="a11y-input-441" className="sr-only">Input</label>
<input id="a11y-input-441" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={dlcRatioS}
                        onChange={(e) => setDlcRatioS(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Aggr
                      </label>{" "}
                      <><label htmlFor="a11y-input-442" className="sr-only">Input</label>
<input id="a11y-input-442" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={dlcRatioA}
                        onChange={(e) => setDlcRatioA(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                      Water/Cement Ratio
                    </label>{" "}
                    <><label htmlFor="a11y-input-443" className="sr-only">Input</label>
<input id="a11y-input-443" type="number" inputMode="decimal"
                      step="0.05"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                      value={dlcWcRatio}
                      onChange={(e) => setDlcWcRatio(e.target.value)}
                    /></>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-4">
                  {" "}
                  <h3 className="font-semibold text-slate-700 bg-transparent px-3 py-2 rounded-lg inline-block">
                    PQC Configuration
                  </h3>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Cement
                      </label>{" "}
                      <><label htmlFor="a11y-input-444" className="sr-only">Input</label>
<input id="a11y-input-444" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={pqcRatioC}
                        onChange={(e) => setPqcRatioC(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Sand
                      </label>{" "}
                      <><label htmlFor="a11y-input-445" className="sr-only">Input</label>
<input id="a11y-input-445" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={pqcRatioS}
                        onChange={(e) => setPqcRatioS(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Aggr
                      </label>{" "}
                      <><label htmlFor="a11y-input-446" className="sr-only">Input</label>
<input id="a11y-input-446" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={pqcRatioA}
                        onChange={(e) => setPqcRatioA(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                      Water/Cement Ratio
                    </label>{" "}
                    <><label htmlFor="a11y-input-447" className="sr-only">Input</label>
<input id="a11y-input-447" type="number" inputMode="decimal"
                      step="0.05"
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                      value={pqcWcRatio}
                      onChange={(e) => setPqcWcRatio(e.target.value)}
                    /></>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Joints & Steel Parameters */}{" "}
            <div className="bg-white px-4 py-3 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              {" "}
              <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                    {" "}
                    <Settings2 className="w-5 h-5" />{" "}
                  </div>{" "}
                  <h2 className="text-xl font-bold tracking-tight text-gray-800">
                    Joints & Steel Specifications
                  </h2>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {" "}
                {/* Dowel Bars */}{" "}
                <div className="space-y-4">
                  {" "}
                  <h3 className="font-semibold text-slate-700 bg-transparent px-3 py-2 rounded-lg inline-block">
                    Transverse Joints / Dowel Bars
                  </h3>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {" "}
                    <div className="sm:col-span-2">
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Joint Spacing (m)
                      </label>{" "}
                      <><label htmlFor="a11y-input-448" className="sr-only">Input</label>
<input id="a11y-input-448" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={transverseSpacing}
                        onChange={(e) => setTransverseSpacing(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Diameter (mm)
                      </label>{" "}
                      <><label htmlFor="a11y-input-449" className="sr-only">Input</label>
<input id="a11y-input-449" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={dowelDiameter}
                        onChange={(e) => setDowelDiameter(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Length (mm)
                      </label>{" "}
                      <><label htmlFor="a11y-input-450" className="sr-only">Input</label>
<input id="a11y-input-450" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={dowelLength}
                        onChange={(e) => setDowelLength(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div className="sm:col-span-2">
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Bar Spacing (mm)
                      </label>{" "}
                      <><label htmlFor="a11y-input-451" className="sr-only">Input</label>
<input id="a11y-input-451" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={dowelSpacing}
                        onChange={(e) => setDowelSpacing(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Tie Bars */}{" "}
                <div className="space-y-4">
                  {" "}
                  <h3 className="font-semibold text-slate-700 bg-transparent px-3 py-2 rounded-lg inline-block">
                    Longitudinal Joints / Tie Bars
                  </h3>{" "}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {" "}
                    <div className="sm:col-span-2">
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Joint Spacing (m)
                      </label>{" "}
                      <><label htmlFor="a11y-input-452" className="sr-only">Input</label>
<input id="a11y-input-452" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={longitudinalSpacing}
                        onChange={(e) => setLongitudinalSpacing(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Diameter (mm)
                      </label>{" "}
                      <><label htmlFor="a11y-input-453" className="sr-only">Input</label>
<input id="a11y-input-453" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={tieDiameter}
                        onChange={(e) => setTieDiameter(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Length (mm)
                      </label>{" "}
                      <><label htmlFor="a11y-input-454" className="sr-only">Input</label>
<input id="a11y-input-454" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={tieLength}
                        onChange={(e) => setTieLength(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                    <div className="sm:col-span-2">
                      {" "}
                      <label className="block text-[10px] xl:text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 ml-1 truncate" title={""}>
                        Bar Spacing (mm)
                      </label>{" "}
                      <><label htmlFor="a11y-input-455" className="sr-only">Input</label>
<input id="a11y-input-455" type="number" inputMode="decimal"
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-slate-400 focus:outline-none min-h-[44px]"
                        value={tieSpacing}
                        onChange={(e) => setTieSpacing(e.target.value)}
                      /></>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
          {/* Results Sidebar */}
          <section className="lg:col-span-4 space-y-6 flex flex-col items-stretch h-full">
            <MaterialSummary
               title="Concrete Volumes"
               totalLabel="Total Concrete"
               totalValue={(volDLC + volPQC).toFixed(2)}
               totalUnit="m³"
               subtitle={`DLC: ${volDLC.toFixed(2)} m³ | PQC: ${volPQC.toFixed(2)} m³`}
             >
              <div className="space-y-4 font-mono text-sm mb-6 mt-6">
                <div className="bg-gray-50/5 p-3 rounded-xl border border-gray-100/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 font-sans font-medium">DLC Sub-base</span>
                    <span className="font-bold text-gray-200 text-lg">
                      {volDLC.toFixed(2)} <span className="text-sm font-normal text-gray-400">m³</span>
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400 border-t border-gray-100/10 pt-2">
                    <div className="flex justify-between"><span>Cement:</span><span className="font-medium text-gray-300">{dlcCementBags} bags</span></div>
                    <div className="flex justify-between"><span>Sand:</span><span className="font-medium text-gray-300">{dlcSandVol.toFixed(2)} m³</span></div>
                    <div className="flex justify-between"><span>Aggregates:</span><span className="font-medium text-gray-300">{dlcAggVol.toFixed(2)} m³</span></div>
                    <div className="flex justify-between"><span>Water:</span><span className="font-medium text-gray-300">{dlcWaterLiters.toFixed(0)} L</span></div>
                  </div>
                </div>
                <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-400 font-sans font-medium">PQC Surface</span>
                    <span className="font-bold text-indigo-300 text-lg">
                      {volPQC.toFixed(2)} <span className="text-sm font-normal text-indigo-400/60">m³</span>
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-indigo-400/80 border-t border-indigo-500/20 pt-2">
                    <div className="flex justify-between"><span>Cement:</span><span className="font-medium text-indigo-300">{pqcCementBags} bags</span></div>
                    <div className="flex justify-between"><span>Sand:</span><span className="font-medium text-indigo-300">{pqcSandVol.toFixed(2)} m³</span></div>
                    <div className="flex justify-between"><span>Aggregates:</span><span className="font-medium text-indigo-300">{pqcAggVol.toFixed(2)} m³</span></div>
                    <div className="flex justify-between"><span>Water:</span><span className="font-medium text-indigo-300">{pqcWaterLiters.toFixed(0)} L</span></div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-t border-slate-700/50 pt-6">
                Steel Requirements
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  title="Dowel Bars"
                  value={totalDowels}
                  unit="nos"
                  variant="neutral"
                />
                <ResultCard
                  title="Tie Bars"
                  value={totalTies}
                  unit="nos"
                  variant="neutral"
                />
                <ResultCard
                  title="Total Joint Steel"
                  value={((totalDowelWeight + totalTieWeight) / 1000).toFixed(3)}
                  unit="tons"
                  variant="primary"
                />
                <ResultCard
                  title="Steel Weight"
                  value={(totalDowelWeight + totalTieWeight).toFixed(1)}
                  unit="kg"
                  variant="primary"
                />
              </div>
             </MaterialSummary>
          </section>{" "}
        </div>{" "}
      </div>{" "}
      <CalculationHistory
        calculatorId="rigid_pavement_v1"
        estimationName="Rigid Pavement Calculation"
        currentInputs={{
          length,
          laneWidth,
          dlcThickness,
          pqcThickness,
          dlcRatioC,
          dlcRatioS,
          dlcRatioA,
          dlcWcRatio,
          pqcRatioC,
          pqcRatioS,
          pqcRatioA,
          pqcWcRatio,
          transverseSpacing,
          longitudinalSpacing,
          dowelDiameter,
          dowelLength,
          dowelSpacing,
          tieDiameter,
          tieLength,
          tieSpacing,
        }}
        currentResults={{
          volDLC: volDLC.toFixed(2),
          volPQC: volPQC.toFixed(2),
          totalDowelWeight: totalDowelWeight.toFixed(1),
          totalTieWeight: totalTieWeight.toFixed(1),
        }}
        summaryGeneration={(inputs, res) =>
          `DLC: ${res.volDLC}m³ | PQC: ${res.volPQC}m³`
        }
        onRestore={(inputs) => {
          if (inputs.length) setLength(inputs.length);
          if (inputs.laneWidth) setLaneWidth(inputs.laneWidth);
          if (inputs.dlcThickness) setDlcThickness(inputs.dlcThickness);
          if (inputs.pqcThickness) setPqcThickness(inputs.pqcThickness);
          if (inputs.dlcRatioC) setDlcRatioC(inputs.dlcRatioC);
          if (inputs.dlcRatioS) setDlcRatioS(inputs.dlcRatioS);
          if (inputs.dlcRatioA) setDlcRatioA(inputs.dlcRatioA);
          if (inputs.dlcWcRatio) setDlcWcRatio(inputs.dlcWcRatio);
          if (inputs.pqcRatioC) setPqcRatioC(inputs.pqcRatioC);
          if (inputs.pqcRatioS) setPqcRatioS(inputs.pqcRatioS);
          if (inputs.pqcRatioA) setPqcRatioA(inputs.pqcRatioA);
          if (inputs.pqcWcRatio) setPqcWcRatio(inputs.pqcWcRatio);
          if (inputs.transverseSpacing)
            setTransverseSpacing(inputs.transverseSpacing);
          if (inputs.longitudinalSpacing)
            setLongitudinalSpacing(inputs.longitudinalSpacing);
          if (inputs.dowelDiameter) setDowelDiameter(inputs.dowelDiameter);
          if (inputs.dowelLength) setDowelLength(inputs.dowelLength);
          if (inputs.dowelSpacing) setDowelSpacing(inputs.dowelSpacing);
          if (inputs.tieDiameter) setTieDiameter(inputs.tieDiameter);
          if (inputs.tieLength) setTieLength(inputs.tieLength);
          if (inputs.tieSpacing) setTieSpacing(inputs.tieSpacing);
        }}
      />{" "}
    </div>
  );
}
