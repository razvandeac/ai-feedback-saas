// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  org_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  api_key: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Flow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
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

// ============================================================================
// PAYLOAD TYPES (for API requests)
// ============================================================================

/**
 * Payload for submitting feedback via the widget SDK
 */
export interface FeedbackPayload {
  projectId: string;
  type: string;
  content: string;
  rating?: number;
  metadata?: Record<string, any>;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

/**
 * Payload for creating a new project
 */
export interface CreateProjectPayload {
  org_id: string;
  name: string;
  description?: string;
  settings?: Record<string, any>;
}

/**
 * Payload for creating a new flow
 */
export interface CreateFlowPayload {
  project_id: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}

/**
 * Payload for creating a new organization
 */
export interface CreateOrgPayload {
  name: string;
  slug?: string;
  settings?: Record<string, any>;
}

// ============================================================================
// AI / ANALYSIS TYPES
// ============================================================================

/**
 * Result from AI feedback analysis
 */
export interface AIResult {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  category?: string;
  keywords?: string[];
}

/**
 * Detailed feedback analysis result
 */
export interface FeedbackAnalysis {
  id: string;
  feedback_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  keywords: string[];
  summary: string;
  score: number;
  created_at: string;
}

// ============================================================================
// WIDGET TYPES
// ============================================================================

export interface Widget {
  id: string;
  project_id: string;
  name: string;
  config: WidgetConfig;
  created_at: string;
  updated_at: string;
}

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  title?: string;
  placeholder?: string;
  collectEmail?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
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

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Sentiment values
 */
export type Sentiment = 'positive' | 'negative' | 'neutral';

/**
 * User roles in an organization
 */
export type Role = 'owner' | 'admin' | 'member';

/**
 * Database timestamp format
 */
export type Timestamp = string;

/**
 * UUID format
 */
export type UUID = string;
