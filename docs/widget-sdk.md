# PulseAI Widget SDK Documentation

Complete guide to implementing and using the PulseAI embeddable feedback widget SDK.

## Overview

The PulseAI Widget SDK is a lightweight JavaScript library that allows you to collect user feedback from any website. It exposes a global `window.PulseAI` object with a simple API.

## Features

- 🚀 **Lightweight** - Minimal footprint (~5KB minified), zero dependencies
- 🔒 **Secure** - HTTPS-only, validates all inputs
- 📊 **Flexible** - Support for text, ratings, and custom metadata
- 🎯 **Easy Integration** - Just 2 lines of code to get started
- 🔔 **Event System** - Custom events for tracking feedback capture
- 🐛 **Debug Mode** - Built-in logging for development
- 🌐 **Browser Support** - Works in all modern browsers
- 🎨 **Framework Agnostic** - Works with React, Vue, Angular, or vanilla JS

## Installation

### Option 1: CDN (Recommended)

```html
<script src="https://your-app.com/widget.js"></script>
```

### Option 2: NPM

```bash
npm install @pulseai/widget
# or
pnpm add @pulseai/widget
```

```javascript
import PulseAI from '@pulseai/widget';
```

## Quick Start

### 1. Get Your Project ID

1. Log in to your PulseAI dashboard at `https://your-app.com/dashboard`
2. Navigate to **Projects**
3. Create a new project or select an existing one
4. Copy the **Project ID** (UUID format)

### 2. Initialize the SDK

```html
<script src="https://your-app.com/widget.js"></script>
<script>
  PulseAI.init({
    projectId: "your-project-id-here"
  });
</script>
```

### 3. Capture Feedback

```javascript
PulseAI.capture({
  type: "text",
  value: "Great feature!"
});
```

That's it! Your feedback is now being collected and stored.

## API Reference

### PulseAI.init(config)

Initialize the SDK with your project configuration.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | Yes | Your project ID from the dashboard |
| `apiUrl` | string | No | Custom API URL (defaults to production) |
| `debug` | boolean | No | Enable debug logging (default: false) |

**Example:**

```javascript
PulseAI.init({
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  apiUrl: "https://custom-domain.com",
  debug: true
});
```

### PulseAI.capture(payload)

Capture and send feedback to the API.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Feedback type (e.g., "text", "bug-report") |
| `value` | string | Yes | The feedback content (1-10,000 chars) |
| `rating` | number | No | Rating from 1-5 |
| `metadata` | object | No | Additional custom data |

**Returns:** `Promise<void>`

**Examples:**

```javascript
// Simple text feedback
await PulseAI.capture({
  type: "text",
  value: "Love the new design!"
});

// With rating
await PulseAI.capture({
  type: "feature-request",
  value: "Please add dark mode",
  rating: 4
});

// With metadata
await PulseAI.capture({
  type: "bug-report",
  value: "Button doesn't work on mobile",
  rating: 2,
  metadata: {
    browser: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    page: window.location.pathname
  }
});
```

### PulseAI.isInitialized()

Check if the SDK has been initialized.

**Returns:** `boolean`

**Example:**

```javascript
if (!PulseAI.isInitialized()) {
  PulseAI.init({ projectId: "your-project-id" });
}
```

## Events

The SDK dispatches custom events that you can listen to.

### pulseai:captured

Fired when feedback is successfully captured and sent.

```javascript
window.addEventListener('pulseai:captured', (event) => {
  console.log('Success!', event.detail);
  // event.detail = { payload, result }
  
  // Show success message to user
  showToast('Thank you for your feedback!');
});
```

### pulseai:error

Fired when an error occurs during capture.

```javascript
window.addEventListener('pulseai:error', (event) => {
  console.error('Error:', event.detail);
  // event.detail = { error, payload }
  
  // Show error message to user
  showToast('Failed to send feedback. Please try again.');
});
```

## Usage Patterns

### Custom Feedback Form

```html
<form id="feedback-form">
  <label>
    Your Feedback:
    <textarea id="feedback-text" required></textarea>
  </label>
  
  <label>
    Rating:
    <select id="feedback-rating">
      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
      <option value="4">⭐⭐⭐⭐ Good</option>
      <option value="3">⭐⭐⭐ Average</option>
      <option value="2">⭐⭐ Poor</option>
      <option value="1">⭐ Very Poor</option>
    </select>
  </label>
  
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
          page: location.pathname,
          timestamp: new Date().toISOString()
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

### Track Button Clicks

```javascript
// Add data-feedback attribute to buttons you want to track
<button data-feedback="clicked-cta">Get Started</button>
<button data-feedback="clicked-pricing">View Pricing</button>

// Track all button clicks
document.querySelectorAll('[data-feedback]').forEach(button => {
  button.addEventListener('click', () => {
    PulseAI.capture({
      type: "interaction",
      value: `User clicked: ${button.dataset.feedback}`,
      metadata: {
        buttonId: button.id,
        buttonText: button.textContent,
        page: location.pathname
      }
    });
  });
});
```

### Capture Page Exit Feedback

```javascript
let sessionStart = Date.now();

window.addEventListener('beforeunload', () => {
  const timeOnPage = Date.now() - sessionStart;
  const scrollDepth = (window.scrollY / document.body.scrollHeight) * 100;
  
  PulseAI.capture({
    type: "session-end",
    value: "User session ended",
    metadata: {
      timeOnPage: Math.round(timeOnPage / 1000), // seconds
      scrollDepth: Math.round(scrollDepth),
      interactions: getUserInteractionCount()
    }
  });
});
```

### React Integration

```typescript
import { useEffect } from 'react';
import PulseAI from '@pulseai/widget';

function FeedbackButton() {
  useEffect(() => {
    PulseAI.init({ 
      projectId: process.env.NEXT_PUBLIC_PULSEAI_PROJECT_ID!
    });
  }, []);

  const handleFeedback = async () => {
    try {
      await PulseAI.capture({
        type: 'button-click',
        value: 'User clicked feedback button',
        rating: 5
      });
      console.log('Feedback sent!');
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  return <button onClick={handleFeedback}>Send Feedback</button>;
}
```

### Vue Integration

```vue
<template>
  <button @click="sendFeedback">Send Feedback</button>
</template>

<script>
import PulseAI from '@pulseai/widget';

export default {
  mounted() {
    PulseAI.init({ 
      projectId: import.meta.env.VITE_PULSEAI_PROJECT_ID
    });
  },
  methods: {
    async sendFeedback() {
      try {
        await PulseAI.capture({
          type: 'text',
          value: 'User feedback from Vue app'
        });
        this.$toast.success('Feedback sent!');
      } catch (error) {
        this.$toast.error('Failed to send feedback');
      }
    }
  }
}
</script>
```

## TypeScript Support

The SDK includes full TypeScript type definitions.

```typescript
import PulseAI, { 
  PulseAIConfig, 
  CapturePayload 
} from '@pulseai/widget';

const config: PulseAIConfig = {
  projectId: "123e4567-e89b-12d3-a456-426614174000",
  debug: true
};

PulseAI.init(config);

const payload: CapturePayload = {
  type: "text",
  value: "Typed feedback",
  rating: 5,
  metadata: {
    custom: "data"
  }
};

await PulseAI.capture(payload);
```

## Error Handling

The SDK provides clear error messages for common issues:

```javascript
try {
  await PulseAI.capture({
    type: "text",
    value: "" // Empty value
  });
} catch (error) {
  console.error(error.message);
  // Output: "payload.value must be a non-empty string"
}
```

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `SDK not initialized` | `init()` not called | Call `PulseAI.init()` first |
| `projectId is required` | Missing projectId | Add projectId to init config |
| `payload.type is required` | Missing type | Add type to capture payload |
| `payload.value must be a non-empty string` | Empty/invalid value | Provide valid string value |
| `Invalid projectId` | Project not found | Check projectId in dashboard |

## Best Practices

### 1. Initialize Early

```javascript
// Initialize as soon as the page loads
document.addEventListener('DOMContentLoaded', () => {
  PulseAI.init({ projectId: "your-project-id" });
});
```

### 2. Handle Errors Gracefully

```javascript
try {
  await PulseAI.capture({ type: "text", value: feedback });
} catch (error) {
  // Don't block user interaction on error
  console.error('Feedback error:', error);
  // Optionally log to your error tracking service
}
```

### 3. Include Context in Metadata

```javascript
await PulseAI.capture({
  type: "text",
  value: userFeedback,
  metadata: {
    page: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(), // if available
    sessionId: getSessionId()
  }
});
```

### 4. Use Meaningful Types

```javascript
// Good - descriptive types
PulseAI.capture({ type: "bug-report", value: "..." });
PulseAI.capture({ type: "feature-request", value: "..." });
PulseAI.capture({ type: "usability-issue", value: "..." });

// Bad - generic types
PulseAI.capture({ type: "feedback", value: "..." });
PulseAI.capture({ type: "text", value: "..." });
```

### 5. Avoid Sending PII

```javascript
// Don't send personally identifiable information
await PulseAI.capture({
  type: "text",
  value: feedback,
  metadata: {
    // ❌ Don't include email, phone, name, etc.
    userEmail: user.email,
    
    // ✅ Use anonymous IDs instead
    userId: hashUserId(user.id)
  }
});
```

## Testing

### Local Development

```javascript
PulseAI.init({
  projectId: "test-project-id",
  apiUrl: "http://localhost:3000",
  debug: true
});
```

### Staging/Production

```javascript
PulseAI.init({
  projectId: process.env.PULSEAI_PROJECT_ID,
  apiUrl: process.env.PULSEAI_API_URL || "https://pulseai.app"
});
```

## Performance

### Bundle Size

- Unminified: ~12KB
- Minified: ~5KB
- Gzipped: ~2KB

### Network Requests

- Single POST request per feedback
- Uses `keepalive` flag for reliable delivery
- No additional resources loaded

### Best Practices

```javascript
// Use keepalive for requests during page unload
window.addEventListener('beforeunload', () => {
  PulseAI.capture({ 
    type: "page-exit",
    value: "User left page"
  });
  // SDK automatically uses keepalive flag
});

// Debounce rapid captures
let captureTimeout;
function debouncedCapture(payload) {
  clearTimeout(captureTimeout);
  captureTimeout = setTimeout(() => {
    PulseAI.capture(payload);
  }, 500);
}
```

## Security

### HTTPS Only

All feedback is sent over HTTPS. HTTP connections are not supported.

### Input Validation

- Maximum content length: 10,000 characters
- Rating must be 1-5
- Project ID must be valid UUID

### CORS

The API endpoint supports CORS for cross-origin requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Supported |
| Firefox | Latest | ✅ Supported |
| Safari | Latest | ✅ Supported |
| Edge | Latest | ✅ Supported |
| Opera | Latest | ✅ Supported |
| IE 11 | - | ❌ Not supported |

## Troubleshooting

### Widget not working

1. Check browser console for errors
2. Verify projectId is correct
3. Enable debug mode: `PulseAI.init({ debug: true, ... })`
4. Check network tab for failed requests

### Feedback not appearing in dashboard

1. Verify you're looking at the correct project
2. Check that the project exists and has a default flow
3. Confirm feedback was sent successfully (check network tab)
4. RLS policies may be preventing access (check org membership)

### CORS errors

If you see CORS errors, ensure:
1. You're using the correct API URL
2. The API endpoint has CORS enabled
3. You're sending the correct Content-Type header

## Examples

### Full Example with UI

See `packages/widget/example.html` for a complete working example with:
- Initialization code
- Multiple feedback scenarios
- Event listeners
- Error handling
- Status messages

### Demo Page

Visit `/widget-demo` in the web app to see a live demonstration of the SDK.

## Support

- 📚 Documentation: This file
- 💬 Issues: File an issue in the repository
- 📧 Email: support@pulseai.app

## Changelog

### v1.0.0
- Initial release
- Basic feedback capture
- Event system
- TypeScript support
- Debug mode

## License

MIT © PulseAI

