"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [projectId, setProjectId] = useState("");
  const [text, setText] = useState("");
  const [metadata, setMetadata] = useState("{}");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    try {
      const body = { 
        project_id: projectId, 
        text, 
        metadata: JSON.parse(metadata || "{}") 
      };
      
      const res = await fetch("/api/feedback/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.text();
      setResponse(`${res.status}: ${data}`);
      
      // Track successful submission
      if (res.status === 200) {
        const mod = await import("../../lib/posthog.client");
        const ph = await mod.initPosthog();
        ph?.capture?.("feedback_submitted");
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Feedback</h1>
      
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Dev-only:</strong> signature may be bypassed in non-prod.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
            Project ID
          </label>
          <input
            type="text"
            id="project_id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project ID"
          />
        </div>

        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback Text
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your feedback"
          />
        </div>

        <div>
          <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-1">
            Metadata (JSON)
          </label>
          <textarea
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder='{"key": "value"}'
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>

      {response && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Response:</h3>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
