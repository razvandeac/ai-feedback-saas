# Vamoot Widget

Embeddable feedback widget for Vamoot.

## Installation

Include the widget script in your HTML:

```html
<script type="module" src="https://your-domain.com/widget.es.js"></script>
```

## Usage

### Option 1: Custom Element (Recommended)

```html
<script type="module">
  import { registerVamootElement } from 'https://your-domain.com/widget.es.js';
  registerVamootElement();
</script>

<vamoot-widget 
  project="YOUR_PROJECT_ID"
  host="https://your-vamoot-instance.com"
  height="420">
</vamoot-widget>
```

### Option 2: JavaScript API

```html
<div id="vamoot-container"></div>

<script type="module">
  import { mountVamootIframe } from 'https://your-domain.com/widget.es.js';
  
  mountVamootIframe({
    selector: '#vamoot-container',
    project: 'YOUR_PROJECT_ID',
    host: 'https://your-vamoot-instance.com',
    height: 420
  });
</script>
```

## Development

```bash
pnpm install
pnpm dev    # Start development server
pnpm build  # Build for production
```

## Attributes

- `project` (required): Your project ID
- `host` (optional): Vamoot instance URL (defaults to current origin)
- `height` (optional): Widget height in pixels (default: 420)

