"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: (slug:string)=>`/org/${slug}`, label: "Overview" },
  { href: (slug:string)=>`/org/${slug}/projects`, label: "Projects" },
  { href: (slug:string)=>`/org/${slug}/feedback`, label: "Feedback" },
  { href: (slug:string)=>`/org/${slug}/settings`, label: "Settings" },
];

export default function Sidebar({ slug }: { slug?: string }) {
  const pathname = usePathname();
  const s = slug || pathname.split("/")[2] || "";
  return (
    <nav className="p-3 space-y-1">
      {items.map(i=>(
        <Link key={i.label} href={i.href(s)} className={clsx(
          "block rounded px-3 py-2 hover:bg-neutral-100",
          pathname === i.href(s) && "bg-neutral-100 font-medium"
        )}>{i.label}</Link>
      ))}
    </nav>
  );
}

