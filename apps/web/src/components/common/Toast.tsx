"use client";
import React from "react";

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-16 right-4 rounded bg-black text-white text-sm px-3 py-2 shadow">
      {message}
    </div>
  );
}
