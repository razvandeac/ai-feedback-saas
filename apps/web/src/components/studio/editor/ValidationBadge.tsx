"use client";
import React from "react";
import { useEditorCtx } from "./EditorContext";

export function ValidationBadge({ issues }: { issues: { path: string; message: string }[] }) {
  const { selectedId } = useEditorCtx();
  const blockIssues = issues.filter(i => i.path.includes(selectedId ?? ""));
  const count = issues.length;

  if (count === 0) return null;
  return (
    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
      {blockIssues.length > 0 ? `${blockIssues.length} issue(s)` : `${count} total`}
    </span>
  );
}
