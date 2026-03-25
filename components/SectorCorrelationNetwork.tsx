
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NewsEvent, ImpactAnalysis } from '../types';

interface SectorCorrelationNetworkProps {
  events: NewsEvent[];
  analysis: ImpactAnalysis | null;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  sentiment: number;
  radius?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

export const SectorCorrelationNetwork: React.FC<SectorCorrelationNetworkProps> = ({ events, analysis }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Prepare data
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Extract unique sectors from events and analysis
    const sectorMap = new Map<string, number>(); // sector -> sentiment sum
    const sectorCount = new Map<string, number>(); // sector -> count
    const connections = new Map<string, number>(); // sector -> connection count

    events.forEach(event => {
      const sector = event.category;
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + event.sentiment);
      sectorCount.set(sector, (sectorCount.get(sector) || 0) + 1);
    });

    if (analysis) {
      analysis.affectedSectors.forEach(sector => {
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, 0);
          sectorCount.set(sector, 0);
        }
      });

      // Create links from ripple chain
      analysis.rippleChain.forEach((step, i) => {
        if (i > 0) {
          const source = analysis.rippleChain[i-1].targetSector;
          const target = step.targetSector;
          links.push({
            source,
            target,
            value: step.impactLevel === 'High' ? 3 : step.impactLevel === 'Medium' ? 2 : 1
          });
          connections.set(source, (connections.get(source) || 0) + 1);
          connections.set(target, (connections.get(target) || 0) + 1);
        }
      });
    }

    sectorMap.forEach((sentiment, sector) => {
      const avgSentiment = sectorCount.get(sector) ? sentiment / sectorCount.get(sector)! : 0;
      const connCount = connections.get(sector) || 0;
      nodes.push({
        id: sector,
        group: 'sector',
        sentiment: avgSentiment,
        radius: 10 + (connCount * 2) + (Math.abs(avgSentiment) * 5)
      });
    });

    // Ensure all link endpoints exist as nodes
    links.forEach(link => {
      const sourceId = link.source as string;
      const targetId = link.target as string;
      if (!nodes.find(n => n.id === sourceId)) nodes.push({ id: sourceId, group: 'sector', sentiment: 0 });
      if (!nodes.find(n => n.id === targetId)) nodes.push({ id: targetId, group: 'sector', sentiment: 0 });
    });

    const width = svgRef.current.clientWidth || 800;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("style", "max-width: 100%; height: auto;");

    // Add glow filters
    const defs = svg.append("defs");
    
    const createGlow = (id: string, color: string) => {
      const filter = defs.append("filter").attr("id", id).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
      filter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
      filter.append("feFlood").attr("flood-color", color).attr("flood-opacity", "0.3").attr("result", "color");
      filter.append("feComposite").attr("in", "color").attr("in2", "blur").attr("operator", "in").attr("result", "glow");
      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "glow");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    };

    createGlow("glow-bullish", "#10b981");
    createGlow("glow-bearish", "#f43f5e");
    createGlow("glow-neutral", "#3b82f6");

    // Add arrow marker
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#3f3f46");

    // Calculate static circular positions
    const centerX = width / 2;
    const centerY = height / 2;
    const layoutRadius = Math.min(width, height) / 2 - 60;

    const nodePositions = new Map<string, {x: number, y: number}>();
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + layoutRadius * Math.cos(angle);
      const y = centerY + layoutRadius * Math.sin(angle);
      nodePositions.set(node.id, {x, y});
      (node as any).x = x;
      (node as any).y = y;
    });

    // Draw links as curved paths
    const linkGroup = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#27272a")
      .attr("stroke-opacity", 0.3);

    links.forEach(l => {
      const source = nodePositions.get(l.source as string)!;
      const target = nodePositions.get(l.target as string)!;
      
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      
      const offsetX = -dy * 0.2;
      const offsetY = dx * 0.2;

      linkGroup.append("path")
        .attr("d", `M${source.x},${source.y} Q${midX + offsetX},${midY + offsetY} ${target.x},${target.y}`)
        .attr("stroke-width", l.value * 1.5)
        .attr("marker-end", "url(#arrowhead)");
    });

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    nodeGroup.append("circle")
      .attr("r", d => d.radius || 12)
      .attr("fill", d => {
        if (d.sentiment > 0.1) return "#10b981";
        if (d.sentiment < -0.1) return "#f43f5e";
        return "#3b82f6";
      })
      .attr("filter", d => {
        if (d.sentiment > 0.1) return "url(#glow-bullish)";
        if (d.sentiment < -0.1) return "url(#glow-bearish)";
        return "url(#glow-neutral)";
      })
      .attr("stroke", "#09090b")
      .attr("stroke-width", 2);

    nodeGroup.append("text")
      .attr("dy", d => (d.radius || 12) + 14)
      .attr("text-anchor", "middle")
      .text(d => d.id)
      .attr("fill", "#e4e4e7")
      .attr("font-size", "9px")
      .attr("font-weight", "800")
      .attr("class", "uppercase tracking-widest")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.9)");

    // Add Beginner-Friendly Legend
    const legend = svg.append("g")
      .attr("transform", `translate(20, ${height - 60})`);

    const legendItems = [
      { color: "#3f3f46", text: "Line: Impact Direction", type: "line" },
      { color: "#10b981", text: "Green: Positive Growth", type: "node" },
      { color: "#f43f5e", text: "Red: Potential Risk", type: "node" },
      { color: "#3b82f6", text: "Blue: Neutral/Stable", type: "node" }
    ];

    legendItems.forEach((item, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 14})`);
      if (item.type === "node") {
        g.append("circle").attr("r", 4).attr("fill", item.color);
      } else {
        g.append("line").attr("x1", -4).attr("x2", 4).attr("y1", 0).attr("y2", 0).attr("stroke", item.color).attr("stroke-width", 2);
      }
      g.append("text").attr("x", 10).attr("y", 4).attr("font-size", "8px").attr("fill", "#71717a").attr("font-weight", "bold").text(item.text.toUpperCase());
    });

    return () => {};
  }, [events, analysis]);

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <i className="fa-solid fa-diagram-project text-blue-500"></i> Sector Correlation Network
          </h3>
          <p className="text-[10px] text-zinc-600 mt-1">Live mapping of cross-sector causality and sentiment flow</p>
        </div>
        <div className="flex gap-4 text-[9px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-zinc-500 uppercase">BULLISH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span className="text-zinc-500 uppercase">BEARISH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="text-zinc-500 uppercase">NEUTRAL</span>
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <div className="absolute bottom-4 right-6 text-[9px] text-zinc-700 mono uppercase tracking-widest">
        Static Correlation Map
      </div>
    </div>
  );
};
