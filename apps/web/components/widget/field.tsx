"use client";
export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1">{children}</label>;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--vamoot-primary)] ${props.className ?? ""}`} />;
}
export function Button({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} className={`rounded-2xl border px-4 py-2 text-sm font-medium transition
    bg-[var(--vamoot-primary)] text-white border-[var(--vamoot-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  ${rest.className ?? ""}`}>{children}</button>;
}

