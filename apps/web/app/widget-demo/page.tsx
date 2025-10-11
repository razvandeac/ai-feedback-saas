'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Force dynamic rendering (no static pre-rendering)
export const dynamic = 'force-dynamic';

export default function WidgetDemoPage() {
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Initialize the widget SDK when the page loads
    // In a real scenario, this would be loaded from a CDN
    console.log('Widget demo page loaded');
  }, []);

  const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 5000);
  };

  // Simulate widget SDK calls
  const sendPositiveFeedback = async () => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: '00000000-0000-0000-0000-000000000001', // Example project ID
          type: 'text',
          content: 'This is amazing! The product works perfectly and I love the user experience.',
          rating: 5,
          metadata: {
            source: 'widget-demo',
            feature: 'demo-button',
          },
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (response.ok) {
        showStatus('✅ Positive feedback sent successfully!', 'success');
      } else {
        const error = await response.json();
        showStatus(`❌ Error: ${error.error}`, 'error');
      }
    } catch (error) {
      const err = error as Error;
      showStatus(`❌ Error: ${err.message}`, 'error');
    }
  };

  const sendNegativeFeedback = async () => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: '00000000-0000-0000-0000-000000000001',
          type: 'bug-report',
          content: 'I found a bug that prevents me from completing my task. The button does not respond when clicked.',
          rating: 2,
          metadata: {
            source: 'widget-demo',
            severity: 'high',
          },
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (response.ok) {
        showStatus('✅ Negative feedback sent successfully!', 'success');
      } else {
        const error = await response.json();
        showStatus(`❌ Error: ${error.error}`, 'error');
      }
    } catch (error) {
      const err = error as Error;
      showStatus(`❌ Error: ${err.message}`, 'error');
    }
  };

  const sendCustomFeedback = async () => {
    const userInput = prompt('Enter your feedback:');
    if (!userInput?.trim()) {
      showStatus('❌ Feedback cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: '00000000-0000-0000-0000-000000000001',
          type: 'custom',
          content: userInput,
          metadata: {
            source: 'widget-demo',
            customInput: true,
          },
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (response.ok) {
        showStatus('✅ Custom feedback sent successfully!', 'success');
      } else {
        const error = await response.json();
        showStatus(`❌ Error: ${error.error}`, 'error');
      }
    } catch (error) {
      const err = error as Error;
      showStatus(`❌ Error: ${err.message}`, 'error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🚀 PulseAI Widget SDK Demo
          </h1>
          <p className="text-gray-600 mb-8">
            This page demonstrates the PulseAI embeddable feedback widget SDK.
          </p>

          {/* Quick Start */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`<!-- Add the widget script -->
<script src="https://your-app.com/widget.js"></script>

<!-- Initialize and use -->
<script>
  PulseAI.init({ projectId: "your-project-id" });
  
  PulseAI.capture({
    type: "text",
    value: "Great feature!",
    rating: 5
  });
</script>`}
              </pre>
            </div>
          </div>

          {/* Try It Out */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Try It Out</h2>
            <p className="text-gray-600 mb-4">
              Click the buttons below to send feedback using the SDK:
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={sendPositiveFeedback}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
              >
                😊 Send Positive Feedback
              </button>
              <button
                onClick={sendNegativeFeedback}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
              >
                😞 Send Negative Feedback
              </button>
              <button
                onClick={sendCustomFeedback}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
              >
                ✏️ Send Custom Feedback
              </button>
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {status.message}
              </div>
            )}
          </div>

          {/* What's Happening */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What&apos;s Happening?</h2>
            <p className="text-gray-600">
              When you click a button above, the widget SDK sends feedback to the PulseAI API endpoint at{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">/api/feedback</code>. The feedback
              is validated, stored in the database, and can be viewed in your dashboard.
            </p>
          </div>

          {/* SDK Methods */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SDK Methods</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  <code className="text-blue-600">PulseAI.init(config)</code>
                </h3>
                <p className="text-gray-600 text-sm">
                  Initialize the SDK with your project ID and optional configuration
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  <code className="text-blue-600">PulseAI.capture(payload)</code>
                </h3>
                <p className="text-gray-600 text-sm">
                  Capture and send feedback with type, value, rating, and metadata
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  <code className="text-blue-600">PulseAI.isInitialized()</code>
                </h3>
                <p className="text-gray-600 text-sm">Check if the SDK has been initialized</p>
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Events</h2>
            <p className="text-gray-600 mb-4">The SDK dispatches custom events:</p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">pulseai:captured</code>
                  <span className="text-gray-600 ml-2">- Fired when feedback is successfully captured</span>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">pulseai:error</code>
                  <span className="text-gray-600 ml-2">- Fired when an error occurs</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
            >
              View Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

