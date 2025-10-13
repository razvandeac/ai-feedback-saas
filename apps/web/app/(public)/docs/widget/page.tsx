"use client";
import { useEffect, useState } from "react";

export default function WidgetDocs() {
  const [origin, setOrigin] = useState("https://your-domain.com");
  
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-6 prose prose-neutral">
        <h1 className="text-3xl font-bold text-brand">Vamoot Widget</h1>
        <p className="text-lg text-neutral-700">
          Add a feedback widget to any page with either a web component or an iframe helper.
        </p>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-neutral-900">Web Component</h2>
          <p className="text-neutral-600">
            The easiest way to embed. Registers a custom <code className="text-brand bg-brand/5 px-1.5 py-0.5 rounded">&lt;vamoot-widget&gt;</code> element.
          </p>
          <pre className="p-4 border border-neutral-200 rounded-2xl bg-neutral-50 text-sm overflow-auto">
            <code>{`<script type="module">
  import { registerVamootElement } from "${origin}/widget.es.js";
  registerVamootElement();
</script>

<vamoot-widget 
  project="YOUR_PROJECT_ID" 
  host="${origin}" 
  height="420">
</vamoot-widget>`}</code>
          </pre>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-neutral-900">Iframe Helper</h2>
          <p className="text-neutral-600">
            Programmatic mounting with JavaScript. Useful for dynamic integration.
          </p>
          <pre className="p-4 border border-neutral-200 rounded-2xl bg-neutral-50 text-sm overflow-auto">
            <code>{`<div id="vamoot-slot"></div>

<script type="module">
  import { mountVamootIframe } from "${origin}/widget.es.js";
  
  mountVamootIframe({
    selector: "#vamoot-slot",
    project: "YOUR_PROJECT_ID",
    host: "${origin}",
    height: 420
  });
</script>`}</code>
          </pre>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-neutral-900">Parameters</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-700">
            <li><strong>project</strong> (required): Your project ID from the dashboard</li>
            <li><strong>host</strong> (optional): Vamoot instance URL (defaults to current origin)</li>
            <li><strong>height</strong> (optional): Widget height in pixels (default: 420)</li>
          </ul>
        </section>

        <section className="mt-8 p-4 border-l-4 border-brand bg-brand/5 rounded">
          <p className="text-sm text-neutral-700">
            <strong className="text-brand">Note:</strong> Replace <code className="bg-white px-1.5 py-0.5 rounded">YOUR_PROJECT_ID</code> with 
            your actual project ID from your Vamoot dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}

