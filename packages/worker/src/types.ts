export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  keywords: string[];
  summary: string;
  score: number;
}

export interface AnalyzerConfig {
  apiKey: string;
  model?: string;
}


