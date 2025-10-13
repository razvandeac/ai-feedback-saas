export default function EmbedDocsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Embed Widget</h1>
          <p className="text-neutral-600">
            Add the Vamoot feedback widget to your website in minutes.
          </p>
        </div>

        <section className="bg-white rounded-3xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Quick Start (iframe)</h2>
          <p className="text-sm text-neutral-600">
            Copy and paste this code snippet into your HTML. Replace <code className="bg-neutral-100 px-1 rounded">YOUR_DOMAIN</code> and{" "}
            <code className="bg-neutral-100 px-1 rounded">PROJECT_KEY</code> with your actual values.
          </p>
          
          <div className="bg-neutral-50 rounded-2xl p-4 border">
            <pre className="text-xs overflow-x-auto">
{`<!-- Replace YOUR_DOMAIN and PROJECT_KEY -->
<iframe
  src="https://YOUR_DOMAIN/embed?key=PROJECT_KEY"
  style="width:100%;max-width:420px;height:340px;border:0;border-radius:16px;overflow:hidden"
  loading="lazy"
></iframe>`}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="text-sm font-medium text-blue-900 mb-1">💡 Where to find your Project Key</div>
            <p className="text-xs text-blue-800">
              Navigate to your project in the dashboard, then go to the <strong>Widget</strong> settings.
              Your project key is displayed at the top of the configuration page.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Customize Widget Appearance</h2>
          <p className="text-sm text-neutral-600">
            Configure your widget&apos;s theme, colors, and fields in the project settings:
          </p>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span><strong>Theme:</strong> Light or dark mode</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span><strong>Primary Color:</strong> Matches your brand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span><strong>Title:</strong> Custom heading text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span><strong>Fields:</strong> Toggle rating and comment fields</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand font-bold">•</span>
              <span><strong>Logo:</strong> Optional logo URL</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-3xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Coming Soon: Script-based Widget</h2>
          <p className="text-sm text-neutral-600">
            We&apos;re working on a lightweight JavaScript widget that will give you more control:
          </p>
          
          <div className="bg-neutral-50 rounded-2xl p-4 border opacity-60">
            <pre className="text-xs overflow-x-auto">
{`<!-- Coming in Week 3.3 -->
<script src="https://YOUR_DOMAIN/widget.js"></script>
<script>
  VamootWidget.init({
    key: 'PROJECT_KEY',
    position: 'bottom-right'
  });
</script>`}
            </pre>
          </div>

          <p className="text-xs text-neutral-500">
            The script-based widget will include features like:
            floating button, modal display, custom positioning, and more customization options.
          </p>
        </section>

        <section className="bg-white rounded-3xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Test your widget configuration below (requires a valid project key):
          </p>
          
          <div className="border rounded-2xl p-4 bg-neutral-50">
            <div className="text-xs text-neutral-500 mb-2">
              Add ?key=YOUR_PROJECT_KEY to the URL to see your widget
            </div>
            <div className="flex justify-center">
              <div className="text-sm text-neutral-400">
                Widget preview will load here when you add a key parameter
              </div>
            </div>
          </div>
        </section>

        <div className="text-center pt-4">
          <a href="/" className="text-sm text-brand hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

