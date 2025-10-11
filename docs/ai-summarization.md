# AI Feedback Summarization

This document describes the AI-powered feedback summarization feature built with OpenAI GPT-4o-mini.

## Overview

The feedback summarization feature allows users to analyze customer feedback using AI to generate concise summaries and sentiment analysis.

## Components

### 1. Worker Package Function (`packages/worker/src/analyzer.ts`)

**Function:** `summarizeFeedback(feedback: string, apiKey: string): Promise<SummarizeResult>`

- Uses OpenAI GPT-4o-mini model
- Returns summary and sentiment (positive/negative/neutral)
- Includes fallback heuristic analysis if OpenAI API fails
- Validates input and handles errors gracefully

**Parameters:**
- `feedback` (string): The customer feedback text to analyze (required, max 5000 chars)
- `apiKey` (string): OpenAI API key (required)

**Returns:**
```typescript
{
  summary: string;      // Concise 1-2 sentence summary
  sentiment: 'positive' | 'negative' | 'neutral';
}
```

**Features:**
- JSON response format for structured output
- Temperature: 0.3 for consistent results
- Max tokens: 200 to keep responses concise
- Automatic sentiment normalization
- Fallback analysis using keyword matching

### 2. API Route (`apps/web/app/api/ai/summarize/route.ts`)

**Endpoint:** `POST /api/ai/summarize`

**Authentication:** Required (checks for authenticated user via Supabase)

**Request Body:**
```json
{
  "feedback": "Customer feedback text to analyze"
}
```

**Validation:**
- Feedback must be a non-empty string
- Maximum length: 5000 characters
- Requires authenticated user
- Requires `OPENAI_API_KEY` environment variable

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Concise summary of the feedback",
    "sentiment": "positive"
  }
}
```

**Error Handling:**
- 401: Unauthorized (not logged in)
- 400: Validation error (missing/invalid feedback)
- 429: Rate limit exceeded
- 500: Server error or missing API key

### 3. React Hook (`apps/web/lib/hooks/useSummarize.ts`)

**Hook:** `useSummarize()`

Provides a simple interface for using the summarization API in React components.

**Returns:**
```typescript
{
  summarize: (feedback: string) => Promise<SummarizeResult>;
  loading: boolean;
  error: string | null;
  result: SummarizeResult | null;
  reset: () => void;
}
```

**Usage Example:**
```typescript
import { useSummarize } from '@/lib/hooks/useSummarize';

function MyComponent() {
  const { summarize, loading, error, result } = useSummarize();

  const handleAnalyze = async () => {
    try {
      await summarize('Customer feedback text here');
      // result will be updated automatically
    } catch (err) {
      // error will be set automatically
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        Analyze
      </button>
      {result && <div>{result.summary}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### 4. UI Component (`apps/web/app/dashboard/page.tsx`)

**Component:** `AISummarizerDemo`

A full-featured demo component in the dashboard that showcases the AI summarization capabilities.

**Features:**
- Three example feedback texts for quick testing
- Textarea for custom feedback input
- Character counter (max 5000 characters)
- Loading states with spinner animation
- Error handling with user-friendly messages
- Results display with:
  - Sentiment badge with emoji and color coding
  - Summary text
  - Ability to analyze another feedback

**Sentiment Display:**
- Positive (😊): Green badge
- Negative (😞): Red badge
- Neutral (😐): Gray badge

## Setup

### 1. Environment Variables

Add to your `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Install Dependencies

The OpenAI package is already included in the worker package:

```bash
cd packages/worker
pnpm install
```

### 3. Build Worker Package

```bash
cd packages/worker
pnpm build
```

### 4. Start Development Server

```bash
cd apps/web
pnpm dev
```

## Testing

### Using the Dashboard UI

1. Navigate to `/dashboard` (requires authentication)
2. Scroll to the "AI Feedback Summarizer" section
3. Click one of the example buttons or enter custom feedback
4. Click "🤖 Summarize with AI"
5. View the AI-generated summary and sentiment

### Using cURL

```bash
# Get authentication token first (from browser cookies: pulseai-auth-token)

curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -H "Cookie: pulseai-auth-token=YOUR_TOKEN" \
  -d '{
    "feedback": "The product is amazing! It solved all my problems."
  }'
```

### Using the Function Directly

```typescript
import { summarizeFeedback } from '@pulseai/worker';

const result = await summarizeFeedback(
  'Customer feedback text here',
  process.env.OPENAI_API_KEY!
);

console.log(result);
// {
//   summary: "Customer is satisfied with the product.",
//   sentiment: "positive"
// }
```

## API Costs

Using OpenAI GPT-4o-mini:
- Cost: ~$0.00015 per request (for typical feedback length)
- Very cost-effective for production use
- Fallback mechanism if API quota is exceeded

## Error Handling

The system includes multiple layers of error handling:

1. **Input Validation**: Checks for empty/invalid feedback before API call
2. **API Error Handling**: Catches OpenAI API errors (rate limits, auth, etc.)
3. **Fallback Analysis**: Uses keyword-based sentiment analysis if OpenAI fails
4. **User-Friendly Messages**: Converts technical errors to readable messages

## Future Enhancements

Potential improvements:
- [ ] Batch processing for multiple feedback items
- [ ] Custom prompts for different industries
- [ ] Multi-language support
- [ ] Additional analysis fields (urgency, category, etc.)
- [ ] Caching frequent feedback patterns
- [ ] Rate limiting per user/organization
- [ ] Analytics dashboard for sentiment trends

## Security

- API endpoint requires authentication
- OpenAI API key stored securely in environment variables
- No sensitive data logged
- Input length limits prevent abuse
- User isolation via RLS policies

