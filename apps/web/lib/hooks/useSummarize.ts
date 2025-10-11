import { useState } from 'react';

export interface SummarizeResult {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface UseSummarizeResult {
  summarize: (feedback: string) => Promise<SummarizeResult>;
  loading: boolean;
  error: string | null;
  result: SummarizeResult | null;
  reset: () => void;
}

/**
 * Hook to summarize feedback using the AI API
 * Uses OpenAI GPT-4o-mini via /api/ai/summarize endpoint
 */
export function useSummarize(): UseSummarizeResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeResult | null>(null);

  const summarize = async (feedback: string): Promise<SummarizeResult> => {
    if (!feedback || feedback.trim().length === 0) {
      const err = 'Feedback text is required';
      setError(err);
      throw new Error(err);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to summarize feedback');
      }

      setResult(data.data);
      return data.data;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  return {
    summarize,
    loading,
    error,
    result,
    reset,
  };
}

