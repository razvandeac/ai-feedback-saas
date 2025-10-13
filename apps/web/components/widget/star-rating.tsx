"use client";
import { useState } from "react";

export default function StarRating({
  value,
  onChange,
  disabled = false,
  max = 5
}: { value: number | null; onChange: (v: number) => void; disabled?: boolean; max?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {stars.map((n) => {
        const active = (hover ?? value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            aria-checked={value === n}
            role="radio"
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded-full grid place-items-center border transition
              ${active ? "bg-[var(--vamoot-primary)] text-white border-[var(--vamoot-primary)]" : "border-gray-300 text-gray-500"}`}
            title={`${n} star${n === 1 ? "" : "s"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

