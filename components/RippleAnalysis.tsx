
import React from 'react';
import { ImpactAnalysis } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface RippleAnalysisProps {
  analysis: ImpactAnalysis;
}

export const RippleAnalysis: React.FC<RippleAnalysisProps> = ({ analysis }) => {
  const getImpactColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-rose-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  const chartData = analysis.rippleChain.map((step, idx) => ({
    name: `Step ${idx + 1}`,
    value: step.impactLevel === 'High' ? 100 : step.impactLevel === 'Medium' ? 60 : 30,
    label: step.stage
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {analysis.isFallback && (
        <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
            <i className="fa-solid fa-microchip animate-pulse"></i>
          </div>
          <div>
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">AI Synthesized Analysis</h3>
            <p className="text-[10px] text-amber-200/60 mt-0.5">This analysis is generated using internal knowledge models due to real-time search grounding limits. Market reactions are estimated based on historical patterns.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Score Header */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Global Impact Score</h2>
            <div className="text-4xl font-bold text-white mono">{analysis.overallRiskScore}<span className="text-zinc-600 text-xl">/100</span></div>
          </div>
          <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center text-xs font-black ${
            analysis.overallRiskScore > 70 ? 'border-rose-500 text-rose-500' : analysis.overallRiskScore > 40 ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-500'
          }`}>
            {analysis.overallRiskScore > 70 ? 'CRITICAL' : analysis.overallRiskScore > 40 ? 'WARNED' : 'STABLE'}
          </div>
        </div>

        {/* Correlation Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">Market Correlation</h2>
          <p className="text-sm text-zinc-300 leading-relaxed italic">
            "{analysis.marketCorrelation}"
          </p>
        </div>
      </div>

      {/* Real-time Market Reaction Section */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-emerald-500"></i> Active Market Reaction
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-800">
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Symbol</th>
                <th className="pb-3 pr-4">Estimated Impact</th>
                <th className="pb-3">Analysis</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {analysis.marketReaction.map((react, i) => (
                <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                  <td className="py-4 pr-4 font-semibold text-zinc-200">{react.companyName}</td>
                  <td className="py-4 pr-4"><span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">${react.symbol}</span></td>
                  <td className="py-4 pr-4">
                    <span className={`font-bold ${react.estimatedImpact >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {react.estimatedImpact >= 0 ? '+' : ''}{react.estimatedImpact.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 text-xs text-zinc-400 max-w-xs">{react.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ripple Chain Visualization */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <i className="fa-solid fa-wind text-blue-500"></i> Causality Propagation Chain
        </h2>
        
        <div className="relative space-y-8">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-800"></div>
          {analysis.rippleChain.map((step, idx) => (
            <div key={idx} className="relative pl-10">
              <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-zinc-400">{idx + 1}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <h4 className="text-sm font-bold text-zinc-100">{step.stage}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded bg-zinc-800 border border-zinc-700 ${getImpactColor(step.impactLevel)}`}>
                    {step.impactLevel.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">
                    {step.targetSector}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Magnitude Chart */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Transmission Magnitude</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px'}}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#f43f5e' : entry.value > 50 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
