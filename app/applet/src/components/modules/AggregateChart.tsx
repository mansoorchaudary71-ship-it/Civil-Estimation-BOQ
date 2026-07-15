import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartProps {
  data: any[];
}

export default function AggregateChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
        <XAxis 
          dataKey="logSize" 
          scale="log" 
          domain={['auto', 'auto']} 
          type="number"
          tickFormatter={(val) => val === 0.001 ? "Pan" : val.toString()}
          stroke="#64748b"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 100]} 
          stroke="#64748b"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc" }}
          itemStyle={{ color: "#f8fafc" }}
          labelFormatter={(val) => val === 0.001 ? "Pan" : `Sieve: ${val}mm`}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        
        <Line type="stepAfter" dataKey="Max" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" name="Upper Limit" dot={false} />
        <Line type="stepAfter" dataKey="Min" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Lower Limit" dot={false} />
        <Line type="monotone" dataKey="Blend" stroke="#10b981" strokeWidth={3} name="Blended %" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
