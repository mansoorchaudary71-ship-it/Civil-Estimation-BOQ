import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartProps {
  data: any[];
}

export default function AggregateChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(107, 104, 98)" opacity={0.2} />
        <XAxis 
          dataKey="logSize" 
          scale="log" 
          domain={['auto', 'auto']} 
          type="number"
          tickFormatter={(val) => val === 0.001 ? "Pan" : val.toString()}
          stroke="rgb(107, 104, 98)"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 100]} 
          stroke="rgb(107, 104, 98)"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: "rgb(31, 29, 26)", borderColor: "rgb(58, 54, 48)", borderRadius: "8px", color: "rgb(245, 242, 236)" }}
          itemStyle={{ color: "rgb(245, 242, 236)" }}
          labelFormatter={(val) => val === 0.001 ? "Pan" : `Sieve: ${val}mm`}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        
        <Line type="stepAfter" dataKey="Max" stroke="rgb(176, 112, 6)" strokeWidth={2} strokeDasharray="5 5" name="Upper Limit" dot={false} />
        <Line type="stepAfter" dataKey="Min" stroke="rgb(31, 29, 26)" strokeWidth={2} strokeDasharray="5 5" name="Lower Limit" dot={false} />
        <Line type="monotone" dataKey="Power45" stroke="rgb(107, 114, 128)" strokeWidth={1.5} strokeDasharray="3 3" name="0.45-power line" dot={false} />
        <Line type="monotone" dataKey="Blend" stroke="rgb(242, 164, 19)" strokeWidth={3} name="Blended %" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}