import { useDebounce } from "../../hooks/useDebounce";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { HelpCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import { useSettings } from "../../context/SettingsContext";

export interface ResultCardProps {
  title: string;
  value: string | number;
  unit?: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "neutral"
    | "dark"
    | "info"
    | "purple"
    | "cyan"
    | "pink"
    | "yellow";
  className?: string;
  delay?: number;
  status?: "normal" | "high" | "exceeds";
  comparisonText?: string;
  explanation?: string;
  secondaryUnit?: string;
  secondaryValue?: string | number;
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

import { getImperialConversion } from "../../utils/autoConverter";

function parseAndFormat(
  strValue: string | number,
  title: string = "",
  unitNode: React.ReactNode = "",
  isImperial: boolean = false,
) {
  const str = String(strValue);
  const numericMatch = str.match(/-?[\d,.]+/);
  if (!numericMatch)
    return {
      num: 0,
      prefix: str,
      suffix: "",
      decimals: 0,
      isNumeric: false,
      displayUnit: typeof unitNode === "string" ? unitNode : "",
    };

  const numStr = numericMatch[0].replace(/,/g, "");
  let num = parseFloat(numStr);

  let unitText = typeof unitNode === "string" ? unitNode : "";
  const conversion = getImperialConversion(unitText);
  let displayUnit = unitText;

  if (isImperial && conversion) {
    num = num * conversion.multiplyBy;
    displayUnit = conversion.targetUnit;
  }

  const index = str.indexOf(numericMatch[0]);
  let prefix = str.substring(0, index);
  let suffix = str.substring(index + numericMatch[0].length);

  // Decide decimal places based on context (from title or suffix/unit)
  const titleLower = title.toLowerCase();
  const unitLower = displayUnit.toLowerCase() || suffix.toLowerCase();
  const origDecimalsMatch = numStr.match(/\.(\d+)/);
  let decimals = origDecimalsMatch ? origDecimalsMatch[1].length : 2;

  if (
    unitLower.includes("bag") ||
    unitLower.includes("nos") ||
    titleLower.includes("count") ||
    titleLower.includes("bricks") ||
    titleLower.includes("panels") ||
    displayUnit.toLowerCase().includes("nos")
  ) {
    decimals = 0;
  } else if (
    unitLower.includes("m³") ||
    unitLower.includes("cu.m") ||
    unitLower.includes("cft") ||
    unitLower.includes("cu.ft") ||
    unitLower.includes("sq.m") ||
    unitLower.includes("sft") ||
    unitLower.includes("sq.ft") ||
    unitLower.includes("ton")
  ) {
    decimals = 2;
  } else if (
    unitLower.includes("rs") ||
    unitLower.includes("pkr") ||
    titleLower.includes("cost") ||
    titleLower.includes("price") ||
    titleLower.includes("rate") ||
    prefix.includes("$") ||
    prefix.includes("Rs") ||
    suffix.includes("Rs")
  ) {
    if (
      titleLower.includes("pkr") ||
      prefix.toLowerCase().includes("rs") ||
      suffix.toLowerCase().includes("rs") ||
      unitLower.includes("rs")
    ) {
      decimals = 0; // Spec: "All currency in PKR must show: Rs 1,115,500" - 0 decimals
      if (
        !prefix.toLowerCase().includes("rs") &&
        !suffix.toLowerCase().includes("rs") &&
        !unitLower.includes("rs")
      ) {
        prefix = "Rs "; // Force prefix if it's missing but context is PKR
      }
    } else {
      decimals = 2; // "2 for costs" generally
    }
  } else if (Number.isInteger(num)) {
    decimals = 0;
  }

  return { num, prefix, suffix, decimals, isNumeric: !isNaN(num), displayUnit };
}

export function ResultCard({
  title,
  value,
  unit,
  icon,
  badge,
  description,
  variant = "neutral",
  className = "",
  delay = 0,
  status,
  comparisonText,
  explanation,
  secondaryUnit,
  secondaryValue,
}: ResultCardProps) {
  const { settings, formatCurrency } = useSettings();
  const isImperial = settings.measurement === "FPS";

  const controls = useAnimation();
  const [hasMounted, setHasMounted] = useState(false);
  const debouncedValue = useDebounce(value, 600);

  useEffect(() => {
    if (!hasMounted) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }
      });
      setHasMounted(true);
    } else {
      controls.set({ opacity: 0, y: 15, scale: 0.98 });
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      });
    }
  }, [debouncedValue, controls, delay]);

  // Parsing & Animation
  const parsed = parseAndFormat(value, title, unit, isImperial);
  const animatedRaw = useCountUp(parsed.num, 800);

  // Derive the active unit for display
  const activeUnit = typeof unit === "string" ? parsed.displayUnit : unit;

  // Conditionally animate if it is actually a number
  let displayValue = parsed.isNumeric
    ? `${parsed.prefix}${animatedRaw.toLocaleString("en-US", { minimumFractionDigits: parsed.prefix.trim() === "Rs" ? 0 : parsed.decimals, maximumFractionDigits: parsed.prefix.trim() === "Rs" ? 0 : parsed.decimals })}${parsed.suffix}`
    : value;

  // Some overrides for exactly matching user's string example
  const isCurrency =
    parsed.isNumeric &&
    Object.keys(parsed).length > 0 &&
    (title.toLowerCase().includes("cost") ||
      title.toLowerCase().includes("price") ||
      title.toLowerCase().includes("budget") ||
      title.toLowerCase().includes("savings") ||
      parsed.prefix.includes("Rs") ||
      parsed.prefix.includes("$") ||
      parsed.suffix.includes("Rs"));
  if (isCurrency && !unit?.toString().toLowerCase().includes("bag")) {
    const cleanSuffix = parsed.suffix
      .replace(/rs\.?/i, "")
      .replace(/\$/i, "")
      .trim();
    displayValue = `${formatCurrency(animatedRaw, false)}${cleanSuffix ? " " + cleanSuffix : ""}`;
  }

  const [expanded, setExpanded] = useState(false);
  const palette = [
    "text-indigo-700 dark:text-indigo-400",
    "text-emerald-700 dark:text-emerald-400",
    "text-amber-700 dark:text-amber-400",
    "text-rose-700 dark:text-rose-400",
  ];
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return palette[hash % 4];
  };
  const valueColor = getColor(title);
  const statusDetails = status ? statusConfig[status] : null;
  const StatusIcon = statusDetails ? statusDetails.icon : null;

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`relative p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] sm:rounded-[32px] shadow-sm hover:shadow-md flex flex-col justify-between gap-4 transition-all duration-500 w-full h-full overflow-hidden group ${className}`}
    >
      <div className="flex items-start justify-between gap-4 w-full relative z-10">
        <div className="flex flex-col max-w-[80%]">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex-shrink-0 border border-slate-100 dark:border-slate-700/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
            )}
            <h4 className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] truncate flex items-center gap-2">
              {title}
              {explanation && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="opacity-60 hover:opacity-100 transition-opacity p-0.5 text-slate-400 dark:text-slate-500"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </h4>
          </div>


          {comparisonText && (
            <div className="flex items-center gap-1.5 mt-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-end gap-[3px] h-3.5 opacity-70">
                <div className="w-1 bg-current h-1/3 rounded-full" />
                <div className="w-1 bg-current h-2/3 rounded-full" />
                <div className="w-1 bg-current h-full rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-black opacity-80 uppercase tracking-wider">
                {comparisonText}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {badge && (
            <div className="flex-shrink-0 flex items-center bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {badge}
            </div>
          )}
          {statusDetails && StatusIcon && (
            <div
              className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${statusDetails.className}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusDetails.label}
            </div>
          )}
        </div>
      </div>

      <div
        className="flex flex-col w-full relative z-10 mt-1 overflow-hidden"
        role="alert"
        aria-live="polite"
      >
        <span className="sr-only">
          Calculation updated: {title} is {displayValue} {activeUnit}
        </span>
        <div
          className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 overflow-hidden"
          aria-hidden="true"
        >
          <span
            className={`text-[clamp(1.25rem,5vw,2.5rem)] leading-none font-black tracking-tighter break-words max-w-full ${valueColor}`}
          >
            {displayValue}
          </span>
          {activeUnit && (
            <span className="text-[13px] sm:text-sm font-bold ml-1 shrink-0 text-slate-600 dark:text-slate-400">
              {activeUnit}
            </span>
          )}
        </div>

        {secondaryValue !== undefined && secondaryUnit && (
          <div className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">
            ={" "}
            {typeof secondaryValue === "number"
              ? secondaryValue.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })
              : secondaryValue}{" "}
            {secondaryUnit}
          </div>
        )}

        {description && !secondaryValue && (
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed max-w-full break-words mt-1">
            {description}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden relative z-10"
          >
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-2 text-slate-600">
                <Info className="w-4 h-4 mt-0.5 opacity-80 text-[#6B46C1]" />
                <p className="text-[11px] sm:text-xs opacity-90 leading-relaxed font-medium">
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
