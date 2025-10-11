# PulseAI Widget SDK

Lightweight embeddable JavaScript SDK for collecting user feedback on any website.

## Features

- 🚀 **Lightweight** - Minimal footprint, no dependencies
- 🔒 **Secure** - Feedback sent directly to your API
- 📊 **Flexible** - Support for text, ratings, and metadata
- 🎯 **Easy Integration** - Just a few lines of code
- 🔔 **Event System** - Listen to feedback capture events
- 🐛 **Debug Mode** - Built-in logging for development

## Installation

### CDN (Recommended for Quick Start)

```html
<script src="https://your-app.com/widget.js"></script>
```

### NPM (For Build Systems)

```bash
npm install @pulseai/widget
# or
pnpm add @pulseai/widget
```

## Quick Start

### 1. Initialize the SDK

```html
<script src="https://your-app.com/widget.js"></script>
<script>
  PulseAI.init({
    projectId: "your-project-id-here"
  });
</script>
```

### 2. Capture Feedback

```javascript
// Simple text feedback
PulseAI.capture({
  type: "text",
  value: "Great feature!"
});

// With rating
PulseAI.capture({
  type: "text",
  value: "Love the new design!",
  rating: 5
});

// With metadata
PulseAI.capture({
  type: "bug-report",
  value: "Button doesn't work on mobile",
  rating: 2,
  metadata: {
    browser: "Safari",
    device: "iPhone 13"
  }
});
```

## API Reference

### PulseAI.init(config)

Initialize the SDK with your project configuration.

**Parameters:**

- `config` (Object) - Configuration object
  - `projectId` (string, required) - Your project ID from the PulseAI dashboard
  - `apiUrl` (string, optional) - Custom API URL (defaults to production URL)
  - `debug` (boolean, optional) - Enable debug logging (default: false)

**Example:**

```javascript
PulseAI.init({
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  apiUrl: "https://your-custom-domain.com",
  debug: true
});
```

### PulseAI.capture(payload)

Capture and send feedback to the API.

**Parameters:**

- `payload` (Object) - Feedback data
  - `type` (string, required) - Feedback type (e.g., "text", "bug-report", "feature-request")
  - `value` (string, required) - The feedback content
  - `rating` (number, optional) - Rating from 1-5
  - `metadata` (object, optional) - Additional custom data

**Returns:** `Promise<void>`

**Example:**

```javascript
try {
  await PulseAI.capture({
    type: "feature-request",
    value: "Please add dark mode!",
    rating: 4,
    metadata: {
      urgency: "medium",
      category: "ui"
    }
  });
  console.log('Feedback sent!');
} catch (error) {
  console.error('Failed to send feedback:', error);
}
```

### PulseAI.isInitialized()

Check if the SDK has been initialized.

**Returns:** `boolean`

**Example:**

```javascript
if (PulseAI.isInitialized()) {
  // SDK is ready
  PulseAI.capture({ type: "text", value: "Hello!" });
}
```

## Events

The SDK dispatches custom events that you can listen to:

### pulseai:captured

Fired when feedback is successfully captured.

```javascript
window.addEventListener('pulseai:captured', (event) => {
  console.log('Feedback captured:', event.detail);
  // event.detail contains: { payload, result }
});
```

### pulseai:error

Fired when an error occurs during capture.

```javascript
window.addEventListener('pulseai:error', (event) => {
  console.error('Feedback error:', event.detail);
  // event.detail contains: { error, payload }
});
```

## Advanced Usage

### Custom Feedback Form

```html
<form id="feedback-form">
  <textarea id="feedback-text" placeholder="Your feedback..."></textarea>
  <select id="feedback-rating">
    <option value="5">⭐⭐⭐⭐⭐</option>
    <option value="4">⭐⭐⭐⭐</option>
    <option value="3">⭐⭐⭐</option>
    <option value="2">⭐⭐</option>
    <option value="1">⭐</option>
  </select>
  <button type="submit">Send Feedback</button>
</form>

<script>
  PulseAI.init({ projectId: "your-project-id" });

  document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = document.getElementById('feedback-text').value;
    const rating = parseInt(document.getElementById('feedback-rating').value);
    
    try {
      await PulseAI.capture({
        type: "general",
        value: text,
        rating: rating,
        metadata: {
          page: window.location.pathname
        }
      });
      
      alert('Thank you for your feedback!');
      e.target.reset();
    } catch (error) {
      alert('Failed to send feedback. Please try again.');
    }
  });
</script>
```

### Automatic Page Exit Feedback

```javascript
// Capture feedback when user is leaving the page
let hasProvidedFeedback = false;

window.addEventListener('beforeunload', (e) => {
  if (!hasProvidedFeedback) {
    PulseAI.capture({
      type: "page-exit",
      value: "User left without providing feedback",
      metadata: {
        timeOnPage: Date.now() - window.pageLoadTime,
        scrollDepth: (window.scrollY / document.body.scrollHeight) * 100
      }
    });
  }
});
```

### Track Button Clicks

```javascript
document.querySelectorAll('[data-feedback]').forEach(button => {
  button.addEventListener('click', () => {
    PulseAI.capture({
      type: "interaction",
      value: `User clicked: ${button.dataset.feedback}`,
      metadata: {
        buttonId: button.id,
        buttonText: button.textContent
      }
    });
  });
});
```

## TypeScript Support

The SDK is written in TypeScript and includes type definitions.

```typescript
import PulseAI, { PulseAIConfig, CapturePayload } from '@pulseai/widget';

const config: PulseAIConfig = {
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  debug: true
};

PulseAI.init(config);

const payload: CapturePayload = {
  type: "text",
  value: "Great product!",
  rating: 5
};

await PulseAI.capture(payload);
```

## Error Handling

The SDK provides detailed error messages:

```javascript
try {
  await PulseAI.capture({
    type: "text",
    value: "" // Empty value will fail
  });
} catch (error) {
  console.error(error.message);
  // Output: "payload.value must be a non-empty string"
}
```

Common errors:
- `"SDK not initialized. Call PulseAI.init() first"`
- `"projectId is required"`
- `"payload.type is required"`
- `"payload.value must be a non-empty string"`

## Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest
- IE11: ❌ Not supported

## Security

- All feedback is sent over HTTPS
- No sensitive data is logged by default
- API endpoints validate all input
- CORS-enabled for cross-origin requests

## Development

### Build the Widget

```bash
cd packages/widget
pnpm install
pnpm build
```

### Test Locally

1. Build the widget: `pnpm build`
2. Open `example.html` in your browser
3. Update the `projectId` in the example
4. Test the feedback capture functionality

### Debug Mode

Enable debug mode to see detailed logs:

```javascript
PulseAI.init({
  projectId: "your-project-id",
  debug: true
});

// Console output:
// [PulseAI] Initialized with config: {...}
// [PulseAI] Capturing feedback: {...}
// [PulseAI] Feedback captured successfully: {...}
```

## Getting Your Project ID

1. Log in to your PulseAI dashboard
2. Navigate to Projects
3. Create a new project or select an existing one
4. Copy the Project ID (UUID format)
5. Use it in your `PulseAI.init()` call

## Support

- 📚 Documentation: https://docs.pulseai.app
- 💬 Support: support@pulseai.app
- 🐛 Issues: https://github.com/your-repo/issues

## License

MIT © PulseAI

