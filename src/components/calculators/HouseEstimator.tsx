"use client";
import React from "react";

export function HouseEstimator({ initialData }: { initialData: any }) {
  return (
    <div className="p-6 tool-card">
      <h2 className="mb-4 text-xl font-semibold text-slate-900 tracking-tight">{initialData.target_keyword}</h2>
      <pre className="bg-slate-50 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(initialData, null, 2)}
      </pre>
      <div className="mt-4 p-4 bg-teal-50 text-teal-900 rounded">
        <strong>Grey Structure Estimated Cost:</strong> Rs. {(initialData.covered_area_sqft * initialData.grey_structure_rate_per_sqft).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
      </div>
    </div>
  );
}
