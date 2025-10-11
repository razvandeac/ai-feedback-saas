# @pulseai/shared

Shared TypeScript types and utilities for the PulseAI platform.

## Overview

This package contains common types, interfaces, and utility functions used across all PulseAI packages (web, widget, worker). It ensures type consistency and reduces duplication across the codebase.

## Installation

This package is part of the PulseAI monorepo and is automatically available to other packages via workspace dependencies.

```json
{
  "dependencies": {
    "@pulseai/shared": "workspace:*"
  }
}
```

## Usage

```typescript
import type { 
  FeedbackPayload, 
  Project, 
  Flow, 
  AIResult,
  ApiResponse 
} from '@pulseai/shared';
```

## Core Domain Types

### Organizations & Members

```typescript
interface Org {
  id: string;
  name: string;
  slug: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Member {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}
```

### Projects & Flows

```typescript
interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  api_key: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Flow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Feedback

```typescript
interface Feedback {
  id: string;
  flow_id: string;
  content: string | null;
  rating: number | null;
  metadata: Record<string, any>;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}
```

## Payload Types

Types for API requests and widget SDK:

### FeedbackPayload

```typescript
interface FeedbackPayload {
  projectId: string;
  type: string;
  content: string;
  rating?: number;
  metadata?: Record<string, any>;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}
```

Used by the widget SDK to submit feedback:

```typescript
import type { FeedbackPayload } from '@pulseai/shared';

const payload: FeedbackPayload = {
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  type: "text",
  content: "Great feature!",
  rating: 5,
  metadata: { page: "/dashboard" }
};
```

### CreateOrgPayload

```typescript
interface CreateOrgPayload {
  name: string;
  slug?: string;
  settings?: Record<string, any>;
}
```

### CreateProjectPayload

```typescript
interface CreateProjectPayload {
  org_id: string;
  name: string;
  description?: string;
  settings?: Record<string, any>;
}
```

### CreateFlowPayload

```typescript
interface CreateFlowPayload {
  project_id: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}
```

## AI / Analysis Types

### AIResult

Result from AI feedback analysis:

```typescript
interface AIResult {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  category?: string;
  keywords?: string[];
}
```

Used by the AI summarization endpoint:

```typescript
import type { AIResult } from '@pulseai/shared';

const result: AIResult = {
  summary: "Customer is satisfied with the product.",
  sentiment: "positive"
};
```

### FeedbackAnalysis

Detailed analysis stored in database:

```typescript
interface FeedbackAnalysis {
  id: string;
  feedback_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  keywords: string[];
  summary: string;
  score: number;
  created_at: string;
}
```

## API Response Types

### ApiResponse

Standard API response wrapper:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Usage:

```typescript
import type { ApiResponse, Org } from '@pulseai/shared';

// Success response
const response: ApiResponse<Org> = {
  success: true,
  data: {
    id: "...",
    name: "Acme Corp",
    // ...
  }
};

// Error response
const errorResponse: ApiResponse = {
  success: false,
  error: "Organization not found"
};
```

### PaginatedResponse

Response with pagination metadata:

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

Usage:

```typescript
import type { PaginatedResponse, Feedback } from '@pulseai/shared';

const response: PaginatedResponse<Feedback> = {
  success: true,
  data: [/* feedback items */],
  pagination: {
    page: 1,
    pageSize: 10,
    total: 42,
    totalPages: 5,
    hasMore: true
  }
};
```

## Utility Types

### Type Aliases

```typescript
type Sentiment = 'positive' | 'negative' | 'neutral';
type Role = 'owner' | 'admin' | 'member';
type Timestamp = string;
type UUID = string;
```

Usage:

```typescript
import type { Sentiment, Role } from '@pulseai/shared';

function analyzeSentiment(text: string): Sentiment {
  // Returns 'positive', 'negative', or 'neutral'
  return 'positive';
}

function checkRole(role: Role): boolean {
  return role === 'owner' || role === 'admin';
}
```

## Widget Types

### Widget Configuration

```typescript
interface Widget {
  id: string;
  project_id: string;
  name: string;
  config: WidgetConfig;
  created_at: string;
  updated_at: string;
}

interface WidgetConfig {
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  title?: string;
  placeholder?: string;
  collectEmail?: boolean;
}
```

## Package Integration

### Using in Web App

```typescript
// apps/web/app/api/feedback/route.ts
import type { FeedbackPayload, ApiResponse } from '@pulseai/shared';

export async function POST(request: Request) {
  const body = await request.json() as FeedbackPayload;
  
  // Process feedback...
  
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { id: "..." }
  });
}
```

### Using in Worker Package

```typescript
// packages/worker/src/analyzer.ts
import type { Feedback, AIResult } from '@pulseai/shared';

async function analyzeFeedback(feedback: Feedback): Promise<AIResult> {
  // Analyze feedback...
  
  return {
    summary: "...",
    sentiment: "positive"
  };
}
```

### Using in Widget Package

```typescript
// packages/widget/src/index.ts
import type { FeedbackPayload } from '@pulseai/shared';

const payload: FeedbackPayload = {
  projectId: config.projectId,
  type: "text",
  content: "User feedback",
  rating: 5
};

await fetch('/api/feedback', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

## Type Safety Benefits

1. **Consistency** - All packages use the same types
2. **IntelliSense** - Full autocomplete in editors
3. **Type Checking** - Catch errors at compile time
4. **Refactoring** - Change types once, update everywhere
5. **Documentation** - Types serve as inline documentation

## Development

### Build

```bash
cd packages/shared
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

### Add New Types

1. Add type to `src/types.ts`
2. Export from `src/index.ts` (if not already)
3. Build package: `pnpm build`
4. Use in other packages: `import type { NewType } from '@pulseai/shared'`

## Naming Conventions

- **Interfaces**: PascalCase (e.g., `FeedbackPayload`, `AIResult`)
- **Types**: PascalCase (e.g., `Sentiment`, `Role`)
- **Database fields**: snake_case (e.g., `created_at`, `user_id`)
- **API fields**: camelCase (e.g., `projectId`, `userName`)

## Best Practices

1. **Use type imports**: `import type { ... }` for type-only imports
2. **Extend carefully**: Only extend types when logically related
3. **Document complex types**: Add JSDoc comments for clarity
4. **Keep database types accurate**: Match Supabase schema exactly
5. **Use utility types**: Leverage `Sentiment`, `Role`, etc. for consistency

## License

MIT © PulseAI

