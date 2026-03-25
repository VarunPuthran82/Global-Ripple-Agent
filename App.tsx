
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GeminiMacroService } from './services/geminiService';
import { NewsEvent, ImpactAnalysis, DashboardState } from './types';
import { NewsCard } from './components/NewsCard';
import { RippleAnalysis } from './components/RippleAnalysis';
import { SectorCorrelationNetwork } from './components/SectorCorrelationNetwork';
import { GeographicalImpactMap } from './components/GeographicalImpactMap';

const MOCK_TOPICS = [
  "US Fed Interest Rate Decisions & Impact on Indian FPI Flows",
  "Global Crude Oil Price Volatility & India's Trade Deficit",
  "US-China Trade War & Opportunities for India's Manufacturing",
  "Global Semiconductor Supply Chain & India's Electronics Mission",
  "Middle East Geopolitical Tensions & India's Energy Security",
  "Global Tech Layoffs & Indian IT Services Outlook"
];

const App: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    events: [],
    analysis: null,
    loading: true,
    error: null,
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [targetSector, setTargetSector] = useState('Nifty 50');
  
  const serviceRef = useRef(new GeminiMacroService());

  const fetchMarkets = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await serviceRef.current.monitorGlobalMarkets(MOCK_TOPICS);
      setState(prev => ({ ...prev, events: data, loading: false }));
      if (data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: `Market Analysis Error: ${err.message || "Failed to fetch market data. Check your connection or API grounding limits."}`, 
        loading: false 
      }));
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const analyzeSelection = async (event: NewsEvent) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await serviceRef.current.analyzeRippleEffect(event, targetSector);
      setState(prev => ({ ...prev, analysis: result, loading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: `Ripple Engine Error: ${err.message || "Analysis failed. The model may be blocked or grounding is unavailable."}`, 
        loading: false 
      }));
    }
  };

  const selectedEvent = state.events.find(e => e.id === selectedEventId);

  useEffect(() => {
    if (selectedEvent) {
      analyzeSelection(selectedEvent);
    }
  }, [selectedEventId, targetSector]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <i className="fa-solid fa-earth-americas text-white"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Global Ripple <span className="text-blue-500">Macro Agent</span></h1>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Cross-Border Market Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-400 font-medium">Market Pulse: Active</span>
            </div>
            <button 
              onClick={() => fetchMarkets()}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <i className="fa-solid fa-rotate"></i> REFRESH FEED
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Sidebar: Translator Agent Feed */}
        <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <i className="fa-solid fa-language text-blue-400"></i> Multilingual Stream
            </h2>
            <div className="text-[10px] text-zinc-600 mono">LATEST SIGNALS</div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {state.loading && state.events.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800/50"></div>
              ))
            ) : (
              state.events.map(event => (
                <NewsCard 
                  key={event.id}
                  event={event}
                  isActive={selectedEventId === event.id}
                  onClick={() => setSelectedEventId(event.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Center: Impact Agent Dashboard */}
        <section className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          
          {/* Geographical Impact Map */}
          <GeographicalImpactMap events={state.events} />

          {/* Quota Warning Banner */}
          {(state.events.some(e => e.isFallback) || state.analysis?.isFallback) && (
            <div className="bg-amber-900/20 border border-amber-500/50 p-3 rounded-xl text-amber-200 text-[10px] flex items-center gap-3 animate-pulse">
              <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
              <div className="flex-1">
                <span className="font-bold uppercase tracking-wider">Search Grounding Quota Exceeded:</span>
                <span className="ml-2 opacity-80">The system is currently using AI synthesis based on internal knowledge. Real-time web data may be slightly delayed.</span>
              </div>
            </div>
          )}

          {/* Sector Correlation Network */}
          <SectorCorrelationNetwork events={state.events} analysis={state.analysis} />

          {/* Controls */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Target Sector Analysis</label>
              </div>
              <select 
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-zinc-200"
              >
                <option>Nifty 50 (Benchmark)</option>
                <option>Indian IT Services</option>
                <option>Banking & Financials (HDFC/ICICI)</option>
                <option>Energy & Infrastructure</option>
                <option>Consumer Goods & FMCG</option>
              </select>
            </div>
            <div className="flex-none pt-5">
              <div className="text-[9px] text-zinc-500 mono bg-zinc-800/50 px-3 py-1 rounded border border-zinc-800">
                AUTO-REFRESHING ON CHANGE
              </div>
            </div>
          </div>

          {state.error && (
             <div className="bg-rose-900/20 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation"></i>
              {state.error}
            </div>
          )}

          {state.loading && state.events.length > 0 && (
             <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <i className="fa-solid fa-microchip animate-pulse text-4xl mb-4 text-blue-500/30"></i>
                <p className="text-sm font-medium">Synthesizing Ripple Analysis...</p>
                <p className="text-[10px] mt-1 text-zinc-600 tracking-widest">GEMINI PRO 3.1 AGENT ACTIVE</p>
             </div>
          )}

          {!state.loading && state.analysis && (
            <RippleAnalysis analysis={state.analysis} />
          )}

          {!state.loading && !state.analysis && !state.error && (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
              <i className="fa-solid fa-magnifying-glass-chart text-3xl mb-3"></i>
              <p className="text-sm">Select an event from the feed to initiate impact modeling</p>
            </div>
          )}
        </section>
      </main>

      {/* Persistent Status Bar */}
      <footer className="bg-zinc-950 border-t border-zinc-900 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">SOURCES:</span>
            <span className="text-blue-500 uppercase">Search Grounding + Sector Mapping</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">SENTIMENT:</span>
            <span className="text-emerald-500 uppercase">Active (NLP Engine)</span>
          </div>
        </div>
        <div className="text-[10px] mono text-zinc-700">
          SYSTEM_VERSION: 2.0.0-ENHANCED
        </div>
      </footer>
    </div>
  );
};

export default App;
