// Core domain types

export interface User {
  id: string;
  email: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  tenantId: string;
  userId?: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAnalysis {
  id: string;
  feedbackId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  keywords: string[];
  summary: string;
  score: number;
  createdAt: string;
}

export interface Widget {
  id: string;
  tenantId: string;
  name: string;
  config: WidgetConfig;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  title?: string;
  placeholder?: string;
  collectEmail?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}


