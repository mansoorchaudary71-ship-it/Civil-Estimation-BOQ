"use client";
import React from "react";

export function MetalWeightCalculator({ initialData }: { initialData: any }) {
  return (
    <div className="p-6 tool-card">
      <h2 className="mb-4 text-xl font-semibold text-slate-900 tracking-tight">{initialData.target_keyword}</h2>
      <pre className="bg-slate-50 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(initialData, null, 2)}
      </pre>
      {/* Real interactive logic would go here */}
      <div className="mt-4 p-4 bg-indigo-50 text-indigo-900 rounded">
        <strong>Initial Weight:</strong> {initialData.weight_kg} kg
      </div>
    </div>
  );
}
