
import React from 'react';
import { NewsEvent } from '../types';

interface NewsCardProps {
  event: NewsEvent;
  isActive: boolean;
  onClick: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ event, isActive, onClick }) => {
  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (score < -0.3) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Geopolitical Risk': return 'fa-shield-halved';
      case 'Economic Policy Change': return 'fa-building-columns';
      case 'Supply Chain Disruption': return 'fa-truck-fast';
      case 'Technological Advancement': return 'fa-microchip';
      case 'Environmental Regulation': return 'fa-leaf';
      default: return 'fa-newspaper';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
        isActive 
        ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
          {event.country} • {event.language}
        </span>
        <div className={`px-2 py-0.5 rounded border text-[9px] font-black tracking-widest ${getSentimentColor(event.sentiment)}`}>
          SENTIMENT: {event.sentiment > 0 ? '+' : ''}{event.sentiment.toFixed(2)}
        </div>
      </div>

      {event.isFallback && (
        <div className="mb-2 flex items-center gap-1.5 bg-amber-900/10 border border-amber-500/20 px-2 py-0.5 rounded-full w-fit">
          <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">AI Synthesized (Fallback)</span>
        </div>
      )}

      <h3 className="font-semibold text-zinc-100 text-sm mb-2 leading-tight">
        {event.translatedTitle}
      </h3>
      
      <div className="flex items-center gap-2 mb-2">
        <i className={`fa-solid ${getCategoryIcon(event.category)} text-blue-400 text-[10px]`}></i>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
          {event.category}
        </span>
      </div>

      <p className="text-xs text-zinc-300 line-clamp-2">
        {event.summary}
      </p>
      
      {event.relatedTickers && event.relatedTickers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {Array.from(new Set(event.relatedTickers)).map(t => (
            <span key={t} className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
              ${t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
