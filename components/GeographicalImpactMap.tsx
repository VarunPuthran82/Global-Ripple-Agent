
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { NewsEvent } from '../types';

interface GeographicalImpactMapProps {
  events: NewsEvent[];
}

export const GeographicalImpactMap: React.FC<GeographicalImpactMapProps> = ({ events }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<any>(null);

  useEffect(() => {
    // Fetch world map data
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(data => setWorldData(data))
      .catch(err => console.error("Failed to load world map:", err));
  }, []);

  useEffect(() => {
    if (!svgRef.current || !worldData) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    const projection = d3.geoEqualEarth()
      .scale(width / 5.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Aggregate sentiment by country
    const countrySentiment = new Map<string, number>();
    const countryCount = new Map<string, number>();

    events.forEach(event => {
      const country = event.country.trim();
      countrySentiment.set(country, (countrySentiment.get(country) || 0) + event.sentiment);
      countryCount.set(country, (countryCount.get(country) || 0) + 1);
    });

    const countries = topojson.feature(worldData, worldData.objects.countries) as any;

    // Color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(["#f43f5e", "#27272a", "#10b981"]); // Rose, Zinc-800, Emerald

    // Draw map
    svg.append("g")
      .selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d: any) => {
        const name = d.properties.name;
        // Simple name matching (could be improved with a dictionary)
        let sentiment = 0;
        let found = false;

        countrySentiment.forEach((val, key) => {
          if (key.toLowerCase() === name.toLowerCase() || 
              (key === "USA" && name === "United States of America") ||
              (key === "UK" && name === "United Kingdom")) {
            sentiment = val / countryCount.get(key)!;
            found = true;
          }
        });

        return found ? colorScale(sentiment) : "#18181b"; // zinc-900
      })
      .attr("stroke", "#09090b")
      .attr("stroke-width", 0.5)
      .append("title")
      .text((d: any) => {
        const name = d.properties.name;
        let info = name;
        countrySentiment.forEach((val, key) => {
          if (key.toLowerCase() === name.toLowerCase()) {
            const avg = val / countryCount.get(key)!;
            info += `\nSentiment: ${avg.toFixed(2)}`;
          }
        });
        return info;
      });

    // Add legend
    const legendWidth = 120;
    const legendHeight = 10;
    const legend = svg.append("g")
      .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

    const gradient = defs().append("linearGradient")
      .attr("id", "sentiment-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f43f5e");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#27272a");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981");

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#sentiment-gradient)")
      .attr("rx", 2);

    legend.append("text")
      .attr("y", -5)
      .attr("font-size", "8px")
      .attr("fill", "#71717a")
      .attr("font-weight", "bold")
      .text("NEGATIVE");

    legend.append("text")
      .attr("x", legendWidth)
      .attr("y", -5)
      .attr("text-anchor", "end")
      .attr("font-size", "8px")
      .attr("fill", "#71717a")
      .attr("font-weight", "bold")
      .text("POSITIVE");

    function defs() {
      let d = svg.select("defs");
      if (d.empty()) d = svg.append("defs");
      return d;
    }

  }, [events, worldData]);

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <i className="fa-solid fa-earth-americas text-emerald-500"></i> Geographical Impact Heatmap
          </h3>
          <p className="text-[10px] text-zinc-600 mt-1">Sentiment distribution based on news origin and focus</p>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <div className="absolute bottom-4 left-6 text-[9px] text-zinc-700 mono uppercase tracking-widest">
        Global Sentiment Distribution
      </div>
    </div>
  );
};
