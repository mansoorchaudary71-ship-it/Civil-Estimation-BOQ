import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import { useSettings } from "../../context/SettingsContext";

export interface ResultItemProps {
  label: string;
  value: number;
  unit: string;
  category?:
    | "concrete"
    | "road"
    | "soil"
    | "mep"
    | "quantity"
    | "tools"
    | "default";
  status?: "normal" | "high" | "exceeds";
  comparisonText?: string;
  explanation?: string;
  secondaryUnit?: string;
  secondaryValue?: number;
}

const statusConfig = {
  normal: {
    icon: CheckCircle,
    className: "text-emerald-500 bg-emerald-500/10",
    label: "Normal",
  },
  high: {
    icon: AlertTriangle,
    className: "text-amber-500 bg-amber-500/10",
    label: "High",
  },
  exceeds: {
    icon: AlertTriangle,
    className: "text-rose-500 bg-rose-500/10",
    label: "Exceeds limits",
  },
};

export function ResultItem({
  label,
  value,
  unit,
  category = "default",
  status = "normal",
  comparisonText,
  explanation,
  secondaryUnit,
  secondaryValue,
}: ResultItemProps) {
  const { formatCurrency } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const animatedValue = useCountUp(value, 800);

  // Format based on rules
  let displayValueStr = "";
  let decimals = 2; // Default

  const unitLower = unit.toLowerCase();
  const labelLower = label.toLowerCase();

  const isCurrency =
    unitLower.includes("rs") ||
    unitLower.includes("pkr") ||
    labelLower.includes("cost") ||
    labelLower.includes("price");

  // 1. Bag Counts (0 decimals)
  if (
    unitLower.includes("bag") ||
    unitLower.includes("nos") ||
    labelLower.includes("count") ||
    labelLower.includes("bricks") ||
    (isCurrency && unitLower.includes("bag"))
  ) {
    decimals = 0;
  }
  // 2. Volumes / Areas (2 decimals)
  else if (
    unitLower.includes("m³") ||
    unitLower.includes("cu.m") ||
    unitLower.includes("cft") ||
    unitLower.includes("sq.m") ||
    unitLower.includes("sft")
  ) {
    decimals = 2;
  }
  // Generic whole numbers
  else if (Number.isInteger(value)) {
    decimals = 0;
  }

  if (isCurrency && !unitLower.includes("bag")) {
    // Exclude Rs from unit display if we are going to use formatCurrency (which adds its own symbol)
    displayValueStr = formatCurrency(animatedValue, false);
  } else {
    displayValueStr = animatedValue.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // To omit the `Rs` or `PKR` from the end since we've prefixed it
  let displayUnit = unit;
  if (
    isCurrency &&
    (unitLower === "rs" || unitLower === "pkr" || unitLower === "$")
  ) {
    displayUnit = ""; // The symbol is already in displayValueStr
  }

  const statusDetails = statusConfig[status];
  const StatusIcon = statusDetails.icon;

  const palette = [
    "text-purple-600",
    "text-sky-500",
    "text-amber-500",
    "text-teal-600",
  ];
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return palette[hash % 4];
  };
  const valueColor = getColor(label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`p-4 rounded-[24px] bg-white  border border-slate-200   shadow-sm hover:shadow-md transition-all duration-300 w-full mb-3`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10 w-full">
        {/* Left side labels */}
        <div className="flex flex-col flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm tracking-tight text-slate-700">
              {label}
            </span>
            {explanation && (
              <button aria-label="HelpCircle"
                onClick={() => setExpanded(!expanded)}
                className="opacity-70 hover:opacity-100 transition-opacity text-slate-500"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {comparisonText && (
            <div className="flex items-center gap-1.5 mt-1.5 text-slate-500">
              {/* Mini sparkline visualization */}
              <div className="flex items-end gap-0.5 h-3 opacity-70">
                <div className="w-1 bg-current h-1/3 rounded-full" />
                <div className="w-1 bg-current h-2/3 rounded-full" />
                <div className="w-1 bg-current h-full rounded-full" />
              </div>
              <span className="text-[10px] font-semibold opacity-80 uppercase tracking-widest">
                {comparisonText}
              </span>
            </div>
          )}
        </div>

        {/* Right side values */}
        <div className="flex flex-col sm:items-end justify-center min-w-[30%]">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[clamp(1.75rem,5vw,2.5rem)] font-black tracking-tighter tabular-nums ${valueColor} break-all`}
            >
              {displayValueStr}
            </span>
            <span className="text-sm font-bold opacity-80 text-slate-600">
              {displayUnit}
            </span>
          </div>

          {/* Secondary unit conversion */}
          {secondaryValue !== undefined && secondaryUnit && (
            <div className="text-[11px] font-bold text-slate-500 tabular-nums">
              ={" "}
              {typeof secondaryValue === "number"
                ? secondaryValue.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })
                : secondaryValue}{" "}
              {secondaryUnit}
            </div>
          )}

          <div
            className={`mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusDetails.className} w-fit`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusDetails.label}
          </div>
        </div>
      </div>

      {/* Expandable Explanation */}
      <AnimatePresence>
        {expanded && explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2 text-slate-600">
                <Info className="w-4 h-4 mt-0.5 opacity-80 text-[#6B46C1]" />
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                  {explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
