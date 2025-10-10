import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="card p-4 md:p-5">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <div className="card-title mb-2">{children}</div>;
}
