
export type EventCategory = 
  | 'Geopolitical Risk' 
  | 'Economic Policy Change' 
  | 'Supply Chain Disruption' 
  | 'Technological Advancement' 
  | 'Environmental Regulation';

export interface NewsEvent {
  id: string;
  translatedTitle: string;
  source: string;
  country: string;
  language: string;
  category: EventCategory;
  sentiment: number; // -1 to 1
  timestamp: string;
  summary: string;
  relatedTickers?: string[];
  isFallback?: boolean;
}

export interface RippleStep {
  stage: string;
  description: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  targetSector: string;
}

export interface MarketTickerImpact {
  symbol: string;
  companyName: string;
  estimatedImpact: number; // percentage or magnitude
  reasoning: string;
}

export interface ImpactAnalysis {
  eventName: string;
  affectedSectors: string[];
  rippleChain: RippleStep[];
  overallRiskScore: number;
  marketCorrelation: string;
  marketReaction: MarketTickerImpact[];
  isFallback?: boolean;
}

export interface DashboardState {
  events: NewsEvent[];
  analysis: ImpactAnalysis | null;
  loading: boolean;
  error: string | null;
}
