import { NextResponse } from 'next/server';
import { summarizeFeedback } from '@pulseai/worker';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { ApiResponse, AIResult } from '@pulseai/shared';

/**
 * POST /api/ai/summarize
 * Summarizes feedback text using OpenAI GPT-4o-mini
 * Requires authentication
 * 
 * Request body:
 * {
 *   "feedback": "Customer feedback text to summarize"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "summary": "Concise summary of the feedback",
 *     "sentiment": "positive" | "negative" | "neutral"
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to use this feature' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { feedback } = body;

    // Validate input
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json(
        { error: 'Validation error', message: 'Feedback text is required' },
        { status: 400 }
      );
    }

    if (feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Feedback text cannot be empty' },
        { status: 400 }
      );
    }

    if (feedback.length > 5000) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Feedback text is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Configuration error', message: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // Call the summarizeFeedback function from worker package
    const result = await summarizeFeedback(feedback, openaiApiKey);

    return NextResponse.json<ApiResponse<AIResult>>({
      success: true,
      data: result,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in /api/ai/summarize:', err);

    // Handle specific error cases
    if (err.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Configuration error', message: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    if (err.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit', message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: err.message || 'Failed to summarize feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/summarize
 * Returns information about the summarize endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/summarize',
    method: 'POST',
    description: 'Summarizes feedback text using OpenAI GPT-4o-mini',
    authentication: 'Required',
    requestBody: {
      feedback: 'string (required, max 5000 characters)',
    },
    response: {
      summary: 'string - Concise summary of the feedback',
      sentiment: '"positive" | "negative" | "neutral"',
    },
    example: {
      request: {
        feedback: 'The product is amazing! It solved all my problems and the support team was very helpful.',
      },
      response: {
        success: true,
        data: {
          summary: 'Customer is very satisfied with the product and found the support team helpful.',
          sentiment: 'positive',
        },
      },
    },
  });
}

