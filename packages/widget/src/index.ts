/**
 * PulseAI Widget SDK
 * Lightweight embeddable feedback collection widget
 * 
 * Usage:
 *   <script src="https://your-app.com/widget.js"></script>
 *   <script>
 *     PulseAI.init({ projectId: "your-project-id" });
 *     PulseAI.capture({ type: "text", value: "Great feature!" });
 *   </script>
 */

import type { FeedbackPayload } from '@pulseai/shared';

export interface PulseAIConfig {
  projectId: string;
  apiUrl?: string;
  debug?: boolean;
}

export interface CapturePayload {
  type: string;
  value: string;
  metadata?: Record<string, any>;
  rating?: number;
}

interface PulseAISDK {
  init(config: PulseAIConfig): void;
  capture(payload: CapturePayload): Promise<void>;
  isInitialized(): boolean;
}

class PulseAI implements PulseAISDK {
  private config: PulseAIConfig | null = null;
  private defaultApiUrl = 'https://pulseai.app'; // Change this to your production URL

  /**
   * Initialize the PulseAI SDK
   * @param config Configuration object with projectId and optional apiUrl
   */
  init(config: PulseAIConfig): void {
    if (!config.projectId) {
      console.error('[PulseAI] Error: projectId is required');
      return;
    }

    this.config = {
      projectId: config.projectId,
      apiUrl: config.apiUrl || this.defaultApiUrl,
      debug: config.debug || false,
    };

    if (this.config.debug) {
      console.log('[PulseAI] Initialized with config:', this.config);
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.config !== null;
  }

  /**
   * Capture and send feedback to the API
   * @param payload Feedback data including type and value
   */
  async capture(payload: CapturePayload): Promise<void> {
    if (!this.config) {
      console.error('[PulseAI] Error: SDK not initialized. Call PulseAI.init() first');
      return;
    }

    // Validate payload
    if (!payload.type) {
      console.error('[PulseAI] Error: payload.type is required');
      return;
    }

    if (!payload.value || typeof payload.value !== 'string' || payload.value.trim().length === 0) {
      console.error('[PulseAI] Error: payload.value must be a non-empty string');
      return;
    }

    if (this.config.debug) {
      console.log('[PulseAI] Capturing feedback:', payload);
    }

    try {
      // Prepare the feedback data
      const feedbackData: FeedbackPayload = {
        projectId: this.config.projectId,
        type: payload.type,
        content: payload.value,
        rating: payload.rating,
        metadata: payload.metadata || {},
        // Add client-side context
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      // Send to API
      const response = await fetch(`${this.config.apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
        // Use keepalive to ensure request completes even if page is closing
        keepalive: true,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (this.config.debug) {
        console.log('[PulseAI] Feedback captured successfully:', result);
      }

      // Dispatch custom event for tracking
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('pulseai:captured', {
            detail: { payload, result },
          })
        );
      }
    } catch (error) {
      console.error('[PulseAI] Error capturing feedback:', error);
      
      // Dispatch error event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('pulseai:error', {
            detail: { error, payload },
          })
        );
      }

      throw error;
    }
  }
}

// Create singleton instance
const pulseAIInstance = new PulseAI();

// Export for module systems
export default pulseAIInstance;
export { PulseAI };
export type { PulseAISDK };

// Re-export types from shared for convenience
export type { FeedbackPayload } from '@pulseai/shared';

// Attach to window for global access
if (typeof window !== 'undefined') {
  (window as any).PulseAI = pulseAIInstance;
}
