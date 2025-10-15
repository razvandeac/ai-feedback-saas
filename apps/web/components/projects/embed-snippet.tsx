"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getClientBaseUrl } from "@/lib/baseUrl";

export default function EmbedSnippet({ projectKey }: { projectKey: string }) {
  const [copied, setCopied] = useState(false);
  
  const siteUrl = getClientBaseUrl();
  
  const snippet = `<!-- Vamoot Feedback Widget -->
<iframe
  src="${siteUrl}/embed?key=${projectKey}"
  style="width:100%;max-width:420px;height:340px;border:0;border-radius:16px;overflow:hidden"
  loading="lazy"
></iframe>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet).then(
      () => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error("Failed to copy")
    );
  };

  return (
    <div className="rounded-3xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Embed Code</div>
          <div className="text-xs text-neutral-500">Copy and paste this into your website</div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/embed?key=${projectKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand hover:underline flex items-center gap-1"
          >
            <ExternalLink size={12} />
            Preview
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={copySnippet}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-neutral-50 rounded-2xl p-3 border">
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
          <code>{snippet}</code>
        </pre>
      </div>

      <div className="flex items-start gap-2 text-xs text-neutral-600 bg-blue-50 border border-blue-200 rounded-2xl p-3">
        <span className="font-bold text-blue-900">💡</span>
        <div>
          <strong className="text-blue-900">Your Project Key:</strong>{" "}
          <code className="bg-blue-100 px-1 rounded">{projectKey}</code>
          <p className="mt-1 text-blue-800">
            Keep this key safe. Anyone with this key can submit feedback to your project.
          </p>
        </div>
      </div>
    </div>
  );
}

