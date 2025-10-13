"use client";
export default function ThemeDebug() {
  return (
    <div className="p-6 space-y-4">
      <div className="rounded-2xl p-4 bg-brand text-white">bg-brand (should be blue)</div>
      <div className="rounded-2xl p-4 bg-brand/5 text-brand border border-brand/20">
        text-brand + bg-brand/5 + border-brand/20 (should be blue-tinted)
      </div>
      <button className="rounded-2xl px-4 py-2 bg-brand hover:bg-brand-hover text-white">
        Brand Button
      </button>
    </div>
  );
}

