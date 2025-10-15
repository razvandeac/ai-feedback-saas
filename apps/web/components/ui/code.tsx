"use client";
import { useState } from "react";
export function CodeBlock({ code }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 1500); } catch {}
  }
  return (
    <div className="relative rounded-2xl border bg-white overflow-hidden">
      <pre className="p-4 text-xs overflow-x-auto"><code>{code}</code></pre>
      <button onClick={copy} className="absolute top-2 right-2 text-xs border rounded-xl px-2 py-1 bg-white">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

