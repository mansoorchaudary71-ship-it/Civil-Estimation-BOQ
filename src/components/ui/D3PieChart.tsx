import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataItem {
  name: string;
  value: number;
}

interface D3PieChartProps {
  data: DataItem[];
  colors?: string[];
  currency?: string;
  width?: number;
  height?: number;
}

export default function D3PieChart({
  data,
  colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
  currency = '$',
  width = 300,
  height = 300
}: D3PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6; // Donut chart

    const g = svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal<string>().range(colors);

    const pie = d3.pie<DataItem>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.05);

    const arc = d3.arc<d3.PieArcDatum<DataItem>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #e2e8f0')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('font-size', '14px')
      .style('color', '#1e293b');

    arcs.append('path')
      .attr('d', arc as any)
      .attr('fill', (d, i) => color(i.toString()))
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s')
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 0.8);
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function(event, d) {
        const formattedValue = d.data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        tooltip
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">${d.data.name}</div>
            <div>${currency} ${formattedValue}</div>
          `)
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 1);
        tooltip.style('visibility', 'hidden');
      });

    return () => {
      tooltip.remove();
    };
  }, [data, colors, currency, width, height]);

  return <svg ref={svgRef} className="w-full h-full min-h-[200px]" />;
}
