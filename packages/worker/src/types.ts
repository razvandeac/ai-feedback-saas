import type { AIResult, Sentiment } from '@pulseai/shared';

/**
 * Extended analysis result with additional fields
 * Compatible with AIResult from shared types
 */
export interface AnalysisResult extends AIResult {
  category: string;
  keywords: string[];
  score: number;
}

export interface AnalyzerConfig {
  apiKey: string;
  model?: string;
}

/**
 * Result from summarization function
 * Compatible with AIResult from shared types
 */
export interface SummarizeResult {
  summary: string;
  sentiment: Sentiment;
}

// Re-export shared types for convenience
export type { AIResult, Sentiment } from '@pulseai/shared';
