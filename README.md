# PulseAI

AI-powered multi-tenant feedback SaaS platform built with Next.js, Supabase, and OpenAI.

## 🏗️ Architecture

This is a PNPM monorepo powered by Turborepo with the following structure:

```
ai-feedback-saas/
├── apps/
│   └── web/              # Next.js 15+ web application (App Router)
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── widget/           # Embeddable feedback widget
│   └── worker/           # OpenAI-powered feedback analyzer
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml   # PNPM workspaces configuration
```

## 🚀 Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (Auth + Database)
- **AI**: OpenAI API (GPT-4 for feedback analysis)
- **Build System**: PNPM Workspaces + Turborepo
- **Deployment**: Vercel (Dashboard deployment)

## 📦 Packages

### @pulseai/web
Main Next.js application with dashboard, API routes, and admin interface.

### @pulseai/shared
Shared TypeScript types and utility functions used across all packages. Includes:
- Core domain types (`Org`, `Project`, `Flow`, `Feedback`)
- Payload types (`FeedbackPayload`, `CreateOrgPayload`)
- AI/Analysis types (`AIResult`, `FeedbackAnalysis`)
- API response types (`ApiResponse<T>`, `PaginatedResponse<T>`)
- Utility types (`Sentiment`, `Role`, `UUID`)

### @pulseai/widget
Lightweight embeddable JavaScript SDK for collecting feedback on any website. Exposes a global `window.PulseAI` object with simple API methods for capturing user feedback.

### @pulseai/worker
Background worker package for AI-powered feedback analysis using OpenAI.

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- PNPM 8+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd ai-feedback-saas
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_APP_URL`: Your app URL (default: http://localhost:3000)

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL migrations (coming soon)
   - Configure authentication settings

### Development

Run all packages in development mode:
```bash
pnpm dev
```

This will start:
- Next.js dev server on `http://localhost:3000`
- TypeScript watch mode for all packages

### Build

Build all packages:
```bash
pnpm build
```

### Project Structure

```
apps/web/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── lib/                 # Utilities and helpers
└── public/              # Static assets

packages/shared/
└── src/
    ├── types.ts         # Shared TypeScript types
    └── utils.ts         # Utility functions

packages/widget/
└── src/
    └── index.ts         # Widget implementation

packages/worker/
└── src/
    ├── analyzer.ts      # AI feedback analyzer
    └── types.ts         # Worker types
```

## 🔧 Key Features

- **Multi-Tenancy**: Isolated data and configurations per organization
- **AI Analysis**: Automatic sentiment analysis and categorization using OpenAI GPT-4o-mini
- **Easy Integration**: Single-line widget embed
- **Real-time**: Instant feedback collection and processing
- **Type-Safe**: Full TypeScript support across all packages
- **Secure**: Row Level Security (RLS) policies for data isolation
- **Authentication**: Email/password auth with Supabase

## 🎯 API Routes

### `/api/ai/summarize` (POST)
Summarize feedback text using OpenAI GPT-4o-mini. Returns a concise summary and sentiment analysis.

**Request:**
```json
{
  "feedback": "Customer feedback text to analyze"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Concise summary of the feedback",
    "sentiment": "positive" | "negative" | "neutral"
  }
}
```

### `/api/orgs` (GET/POST)
Manage organizations where the current user is a member. Uses RLS-safe queries.

### `/api/feedback` (GET/POST)
**POST** - Submit feedback from the embedded widget. Public endpoint that accepts feedback data.

**Request:**
```json
{
  "projectId": "uuid",
  "type": "text",
  "content": "Feedback content",
  "rating": 5,
  "metadata": {}
}
```

**GET** - Retrieve feedback for a project (requires authentication).

## 🎯 Widget SDK

The PulseAI widget SDK allows you to collect feedback from any website with just a few lines of code.

### Quick Start

```html
<script src="https://your-app.com/widget.js"></script>
<script>
  PulseAI.init({ projectId: "your-project-id" });
  PulseAI.capture({ type: "text", value: "Great feature!" });
</script>
```

### API Methods

- `PulseAI.init(config)` - Initialize with project ID
- `PulseAI.capture(payload)` - Capture and send feedback
- `PulseAI.isInitialized()` - Check initialization status

### Example Usage

```javascript
// Initialize the SDK
PulseAI.init({
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  apiUrl: "https://your-app.com", // optional
  debug: true // optional
});

// Capture feedback with rating
await PulseAI.capture({
  type: "text",
  value: "Love the new design!",
  rating: 5,
  metadata: {
    page: window.location.pathname,
    feature: "dashboard"
  }
});

// Listen to events
window.addEventListener('pulseai:captured', (event) => {
  console.log('Feedback sent:', event.detail);
});
```

See `packages/widget/README.md` for full documentation.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
