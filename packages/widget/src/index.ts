import { WidgetConfig, Feedback } from '@pulseai/shared';

export interface PulseAIWidget {
  init: (config: WidgetConfig & { tenantId: string; apiUrl: string }) => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
}

class FeedbackWidget implements PulseAIWidget {
  private config: WidgetConfig & { tenantId: string; apiUrl: string } | null = null;
  private container: HTMLElement | null = null;
  private isVisible: boolean = false;

  init(config: WidgetConfig & { tenantId: string; apiUrl: string }): void {
    this.config = config;
    this.createWidget();
  }

  private createWidget(): void {
    if (!this.config) return;

    // Create widget container
    this.container = document.createElement('div');
    this.container.id = 'pulseai-widget';
    this.container.style.cssText = `
      position: fixed;
      ${this.getPositionStyles()}
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    // Create trigger button
    const button = document.createElement('button');
    button.innerHTML = '💬 Feedback';
    button.style.cssText = `
      background: ${this.config.primaryColor || '#3b82f6'};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    `;
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    button.addEventListener('click', () => this.toggleForm());

    this.container.appendChild(button);
    document.body.appendChild(this.container);
  }

  private getPositionStyles(): string {
    const position = this.config?.position || 'bottom-right';
    const positions: Record<string, string> = {
      'bottom-right': 'bottom: 24px; right: 24px;',
      'bottom-left': 'bottom: 24px; left: 24px;',
      'top-right': 'top: 24px; right: 24px;',
      'top-left': 'top: 24px; left: 24px;',
    };
    return positions[position] || positions['bottom-right'];
  }

  private toggleForm(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    if (!this.container || !this.config) return;

    // Create feedback form if not exists
    let form = document.getElementById('pulseai-form');
    if (!form) {
      form = this.createForm();
      this.container.appendChild(form);
    }

    form.style.display = 'block';
    this.isVisible = true;
  }

  hide(): void {
    const form = document.getElementById('pulseai-form');
    if (form) {
      form.style.display = 'none';
    }
    this.isVisible = false;
  }

  private createForm(): HTMLElement {
    const form = document.createElement('div');
    form.id = 'pulseai-form';
    form.style.cssText = `
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 320px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      padding: 20px;
      display: none;
    `;

    const title = document.createElement('h3');
    title.textContent = this.config?.title || 'Send us your feedback';
    title.style.cssText = 'margin: 0 0 16px 0; font-size: 18px; color: #1f2937;';

    const textarea = document.createElement('textarea');
    textarea.placeholder = this.config?.placeholder || 'Tell us what you think...';
    textarea.style.cssText = `
      width: 100%;
      min-height: 100px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      box-sizing: border-box;
      font-family: inherit;
    `;

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.cssText = `
      width: 100%;
      margin-top: 12px;
      background: ${this.config?.primaryColor || '#3b82f6'};
      color: white;
      border: none;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    `;
    submitButton.addEventListener('click', () => this.submitFeedback(textarea.value));

    form.appendChild(title);
    form.appendChild(textarea);
    form.appendChild(submitButton);

    return form;
  }

  private async submitFeedback(content: string): Promise<void> {
    if (!content.trim() || !this.config) return;

    try {
      const response = await fetch(`${this.config.apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: this.config.tenantId,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        alert('Thank you for your feedback!');
        this.hide();
        // Reset form
        const textarea = document.querySelector('#pulseai-form textarea') as HTMLTextAreaElement;
        if (textarea) textarea.value = '';
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.config = null;
    this.isVisible = false;
  }
}

// Export a singleton instance
export const pulseAI: PulseAIWidget = new FeedbackWidget();

// Auto-initialize if config is provided via data attributes
if (typeof window !== 'undefined') {
  const script = document.currentScript as HTMLScriptElement;
  if (script) {
    const tenantId = script.dataset.tenantId;
    const apiUrl = script.dataset.apiUrl;
    if (tenantId && apiUrl) {
      pulseAI.init({
        tenantId,
        apiUrl,
        theme: (script.dataset.theme as any) || 'light',
        position: (script.dataset.position as any) || 'bottom-right',
        primaryColor: script.dataset.primaryColor,
      });
    }
  }
}


