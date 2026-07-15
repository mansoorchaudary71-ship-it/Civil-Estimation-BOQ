"use client";
import React from "react";

export function ConcreteCalculator({ initialData }: { initialData: any }) {
  return (
    <div className="p-6 tool-card">
      <h2 className="mb-4 text-xl font-semibold text-slate-900 tracking-tight">{initialData.target_keyword}</h2>
      <pre className="bg-slate-50 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(initialData, null, 2)}
      </pre>
      <div className="mt-4 p-4 bg-blue-50 text-orange-900 rounded">
        <strong>Cement Bags Required:</strong> {initialData.cement_bags_required} bags
      </div>
    </div>
  );
}
