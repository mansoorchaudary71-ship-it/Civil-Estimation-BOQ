import React, { lazy, Suspense, useEffect, useState } from "react";
import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { lazyWithRetry } from "../../lib/lazyWithRetry";

// Lazily loaded: the charts pull in recharts (~376 kB). The summary
// header + data extraction stay eager; the charts download only when
// this tool page has numeric data to chart.
// Wrapped in lazyWithRetry (Round 4 WS1): stale-chunk retry + one guarded reload.
const ModuleSummaryCharts = lazy(() =>
  lazyWithRetry(() => import("./ModuleSummaryCharts")).then((m) => ({ default: m.ModuleSummaryCharts }))
);

export default function ModuleSummaryDashboard({ moduleId }: { moduleId: string }) {
  const [data, setData] = useState<{ inputs: any[]; outputs: any[] }>({ inputs: [], outputs: [] });
  const [previousData, setPreviousData] = useState<{ sumInputs: number, sumOutputs: number } | null>(null);
  const [varianceData, setVarianceData] = useState<any[]>([]);

  useEffect(() => {
    // A simple heuristic to extract numeric data from the module for visualization
    const extractData = () => {
      const inputsList: any[] = [];
      const outputsList: any[] = [];

      // Find inputs
      const inputs = document.querySelectorAll('.global-form-card-wrapper input');
      inputs.forEach((input) => {
        const val = parseFloat((input as HTMLInputElement).value);
        if (!isNaN(val) && val > 0) {
          // try to find label
          let name = `Input ${inputsList.length + 1}`;
          const id = input.id;
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label && label.textContent) {
              name = label.textContent.trim().replace(/[:\*]/g, '');
            } else {
              name = id.replace(/[-_]/g, ' ');
            }
          }
          // Cap string length
          if (name.length > 15) name = name.substring(0, 15) + '...';
          inputsList.push({ name, value: val, rawId: id });
        }
      });

      // Find possible outputs (looking for text containing numbers inside elements usually used for results)
      const possibleOutputs = document.querySelectorAll('.global-form-card-wrapper .text-xl, .global-form-card-wrapper .text-2xl, .global-form-card-wrapper .font-bold.text-ui-successText, .global-form-card-wrapper .font-bold.text-accent-800');
      
      const seenValues = new Set<number>();
      possibleOutputs.forEach((el) => {
        const text = el.textContent || '';
        // Extract first number
        const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/);
        if (match) {
          const val = parseFloat(match[0]);
          if (!isNaN(val) && val > 0 && !seenValues.has(val)) {
             seenValues.add(val);
             let name = `Result ${outputsList.length + 1}`;
             // Try to find previous sibling or parent text to use as label
             const parentText = el.parentElement?.textContent?.replace(text, '').trim();
             if (parentText && parentText.length > 3 && parentText.length < 30) {
                name = parentText;
             }
             if (name.length > 15) name = name.substring(0, 15) + '...';
             outputsList.push({ name, value: val });
          }
        }
      });

      // Limit items
      setData({ 
        inputs: inputsList.slice(-8), 
        outputs: outputsList.slice(-8) 
      });
    };

    // Extract initially and set up observer to re-extract on DOM changes
    setTimeout(extractData, 1000);
    const observer = new MutationObserver(() => {
      // Debounce slightly
      setTimeout(extractData, 300);
    });
    
    const wrapper = document.querySelector('.global-form-card-wrapper');
    if (wrapper) {
      observer.observe(wrapper, { childList: true, subtree: true, characterData: true });
    }
    
    return () => observer.disconnect();
  }, [moduleId]);

  useEffect(() => {
    // Fetch previous estimate from localStorage to compare trends
    try {
      const saved = localStorage.getItem(`calc_history_${moduleId}`);
      if (saved) {
        const history = JSON.parse(saved);
        if (history && history.length > 0) {
          const mostRecent = history[0];
          let sumIn = 0;
          if (mostRecent.inputs) {
            Object.values(mostRecent.inputs).forEach((v: any) => {
              if (typeof v === 'number' && !isNaN(v)) sumIn += v;
              if (typeof v === 'string') {
                const parsed = parseFloat(v);
                if (!isNaN(parsed)) sumIn += parsed;
              }
            });
          }
          let sumOut = 0;
          if (mostRecent.results) {
            Object.values(mostRecent.results).forEach((v: any) => {
              if (typeof v === 'number' && !isNaN(v)) sumOut += v;
              if (typeof v === 'string') {
                const parsed = parseFloat(v.replace(/,/g, ''));
                if (!isNaN(parsed)) sumOut += parsed;
              }
            });
          }
          if (sumIn > 0 || sumOut > 0) {
            setPreviousData({ sumInputs: sumIn, sumOutputs: sumOut });
          }

          if (mostRecent.inputs && data.inputs.length > 0) {
            const vData: any[] = [];
            data.inputs.forEach((input: any) => {
              let prevValue = 0;
              if (input.rawId && mostRecent.inputs[input.rawId] !== undefined) {
                 const v = mostRecent.inputs[input.rawId];
                 prevValue = typeof v === 'number' ? v : parseFloat(v);
              } else {
                 const v = mostRecent.inputs[input.name];
                 if (v !== undefined) {
                     prevValue = typeof v === 'number' ? v : parseFloat(v);
                 } else {
                    const matchedKey = Object.keys(mostRecent.inputs).find(k => k.toLowerCase().includes(input.name.toLowerCase().replace('...', '')) || input.name.toLowerCase().includes(k.toLowerCase()));
                    if (matchedKey) {
                        const mv = mostRecent.inputs[matchedKey];
                        prevValue = typeof mv === 'number' ? mv : parseFloat(mv);
                    }
                 }
              }
              if (isNaN(prevValue)) prevValue = 0;
              
              if (prevValue > 0 && input.value !== prevValue) {
                  vData.push({
                      name: input.name,
                      current: input.value,
                      previous: prevValue,
                      diff: input.value - prevValue,
                  });
              }
            });
            setVarianceData(vData);
          }
        }
      }
    } catch(e) {
      console.error("Failed to parse previous module history for trend data", e);
    }
  }, [moduleId, data.inputs]);

  if (data.inputs.length === 0 && data.outputs.length === 0) return null;

  const currentSumInputs = data.inputs.reduce((acc, item) => acc + item.value, 0);
  const currentSumOutputs = data.outputs.reduce((acc, item) => acc + item.value, 0);

  const renderTrend = (current: number, previous: number) => {
    if (!previous || previous === 0 || current === 0) return null;
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    
    if (Math.abs(percent) < 1) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-hover text-txt-secondary dark:bg-ink dark:text-txt-tertiary ml-2">
          Stable
        </span>
      );
    }
    
    const isUp = percent > 0;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 ${isUp ? 'bg-ui-success text-ui-successText dark:bg-ui-successText/10 dark:text-ui-successText' : 'bg-ui-error text-ui-errorText dark:bg-ui-errorText/10 dark:text-ui-errorText'}`}>
        {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(percent).toFixed(1)}% vs last save
      </span>
    );
  };

  return (
    <div className="w-full bg-surface-default dark:bg-ink border border-ui-borderSubtle dark:border-ink rounded-2xl p-6 sm:p-8 shadow-brand-sm print:hidden mt-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-50 dark:bg-accent-900/20 text-accent-800 dark:text-accent-400 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-txt-primary dark:text-white">Data Distribution Summary</h3>
            <p className="text-sm text-txt-tertiary dark:text-txt-tertiary">Live visualization of current parameters vs computed outputs</p>
          </div>
        </div>
      </div>
            <Suspense fallback={<div className="h-[250px] w-full rounded-2xl border border-border-color bg-surface-hover/50 animate-pulse" role="status" aria-label="Loading summary charts" />}>
        <ModuleSummaryCharts
          data={data}
          varianceData={varianceData}
          previousData={previousData}
          currentSumInputs={currentSumInputs}
          currentSumOutputs={currentSumOutputs}
          renderTrend={renderTrend}
        />
      </Suspense>
    </div>
  );
}
