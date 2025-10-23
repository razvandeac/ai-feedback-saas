"use client";
import React from "react";

export function ValidationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">{count} errors</span>;
}
