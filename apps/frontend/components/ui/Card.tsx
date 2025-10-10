import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div style={{padding:12,border:"1px solid #eee",borderRadius:8,background:"#fff"}}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <div style={{fontWeight:600,marginBottom:8}}>{children}</div>;
}
