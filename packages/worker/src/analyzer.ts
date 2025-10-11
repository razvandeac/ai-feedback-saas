import OpenAI from 'openai';
import type { Feedback, AIResult } from '@pulseai/shared';
import { AnalysisResult, AnalyzerConfig, SummarizeResult } from './types';

export class FeedbackAnalyzer {
  private openai: OpenAI;
  private model: string;

  constructor(config: AnalyzerConfig) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'gpt-4o-mini';
  }

  async analyzeFeedback(feedback: Feedback): Promise<AnalysisResult> {
    try {
      const content = feedback.content || '';
      const prompt = this.buildAnalysisPrompt(content);

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing customer feedback. Provide structured analysis in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = completion.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(result);
      return this.normalizeAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(feedback.content || '');
    }
  }

  private buildAnalysisPrompt(content: string): string {
    return `Analyze the following customer feedback and provide a structured analysis in JSON format:

Feedback: "${content}"

Please provide:
1. sentiment: "positive", "negative", or "neutral"
2. category: a single word category (e.g., "feature", "bug", "usability", "performance", "pricing", "support")
3. keywords: array of 3-5 key terms from the feedback
4. summary: a brief 1-sentence summary
5. score: sentiment score from -1 (very negative) to 1 (very positive)

Return only valid JSON with these exact keys.`;
  }

  private normalizeAnalysis(analysis: any): AnalysisResult {
    return {
      sentiment: this.normalizeSentiment(analysis.sentiment),
      category: analysis.category || 'general',
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords.slice(0, 5) : [],
      summary: analysis.summary || 'No summary available',
      score: typeof analysis.score === 'number' ? analysis.score : 0,
    };
  }

  private normalizeSentiment(sentiment: string): 'positive' | 'negative' | 'neutral' {
    const s = sentiment?.toLowerCase();
    if (s === 'positive' || s === 'negative' || s === 'neutral') {
      return s;
    }
    return 'neutral';
  }

  private getFallbackAnalysis(content: string): AnalysisResult {
    // Simple fallback analysis based on basic heuristics
    const lowerContent = content.toLowerCase();
    const positiveWords = ['great', 'good', 'excellent', 'love', 'awesome', 'amazing'];
    const negativeWords = ['bad', 'poor', 'hate', 'terrible', 'awful', 'broken'];

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0;

    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = 0.5;
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = -0.5;
    }

    return {
      sentiment,
      category: 'general',
      keywords: content.split(' ').slice(0, 5),
      summary: content.substring(0, 100),
      score,
    };
  }

  async analyzeBatch(feedbacks: Feedback[]): Promise<Map<string, AnalysisResult>> {
    const results = new Map<string, AnalysisResult>();

    // Process in parallel with concurrency limit
    const concurrency = 5;
    for (let i = 0; i < feedbacks.length; i += concurrency) {
      const batch = feedbacks.slice(i, i + concurrency);
      const promises = batch.map(async (feedback) => {
        const analysis = await this.analyzeFeedback(feedback);
        return { id: feedback.id, analysis };
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ id, analysis }) => {
        results.set(id, analysis);
      });
    }

    return results;
  }
}

/**
 * Standalone function to summarize feedback using OpenAI GPT-4o-mini
 * Returns a concise summary and sentiment analysis
 * 
 * @param feedback - The feedback text to analyze
 * @param apiKey - OpenAI API key
 * @returns Promise with summary and sentiment
 */
export async function summarizeFeedback(
  feedback: string,
  apiKey: string
): Promise<SummarizeResult> {
  if (!feedback || feedback.trim().length === 0) {
    throw new Error('Feedback text is required');
  }

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing customer feedback. Provide concise summaries and accurate sentiment analysis. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: `Analyze this customer feedback and provide:
1. A concise summary (1-2 sentences)
2. The overall sentiment (positive, negative, or neutral)

Feedback: "${feedback}"

Respond in JSON format with keys "summary" and "sentiment".`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 200,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(result);
    
    // Validate and normalize the response
    const sentiment = normalizeSentiment(parsed.sentiment);
    const summary = typeof parsed.summary === 'string' ? parsed.summary : feedback.substring(0, 100);

    return {
      summary,
      sentiment,
    };
  } catch (error: any) {
    console.error('Error summarizing feedback with OpenAI:', error);
    
    // If OpenAI fails, return a fallback analysis
    return getFallbackSummary(feedback);
  }
}

/**
 * Normalize sentiment value to one of the three valid options
 */
function normalizeSentiment(sentiment: any): 'positive' | 'negative' | 'neutral' {
  const s = String(sentiment || '').toLowerCase();
  if (s === 'positive' || s === 'negative' || s === 'neutral') {
    return s as 'positive' | 'negative' | 'neutral';
  }
  return 'neutral';
}

/**
 * Fallback summary using basic heuristics when OpenAI is unavailable
 */
function getFallbackSummary(feedback: string): SummarizeResult {
  const lowerContent = feedback.toLowerCase();
  const positiveWords = ['great', 'good', 'excellent', 'love', 'awesome', 'amazing', 'helpful', 'perfect'];
  const negativeWords = ['bad', 'poor', 'hate', 'terrible', 'awful', 'broken', 'disappointed', 'frustrating'];

  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }

  // Create a simple summary (first sentence or first 100 chars)
  const firstSentence = feedback.split(/[.!?]/)[0]?.trim();
  const summary = firstSentence && firstSentence.length > 10 
    ? firstSentence + '.'
    : feedback.substring(0, 100) + (feedback.length > 100 ? '...' : '');

  return {
    summary,
    sentiment,
  };
}


