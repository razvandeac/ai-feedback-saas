import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
