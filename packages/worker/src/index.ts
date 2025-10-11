// Load environment variables for local development
// In production (Vercel), env vars are injected automatically
import { config } from 'dotenv';
config();

export * from './analyzer';
export * from './types';

/**
 * Helper to get OpenAI API key from environment
 * Validates that the key is present
 */
export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'Please add it to your .env.local file or Vercel environment variables.'
    );
  }

  return apiKey;
}
