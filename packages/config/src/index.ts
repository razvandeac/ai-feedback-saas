// Config package exports
export const version = "0.0.0";

// App configuration
export const config = {
  appName: "AI Feedback SaaS",
  version: "0.0.0",
  environment: process.env.NODE_ENV || "development",
};

// Database configuration
export const databaseConfig = {
  url: process.env.DATABASE_URL || "postgresql://localhost:5432/ai-feedback",
};

// API configuration
export const apiConfig = {
  baseUrl: process.env.API_BASE_URL || "http://localhost:3000/api",
  timeout: 5000,
};
