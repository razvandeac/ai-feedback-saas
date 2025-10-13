"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Folder, MessageSquare, Settings } from "lucide-react";

const nav = [
  { href: (slug:string)=>`/org/${slug}`, label: "Overview", icon: LayoutDashboard },
  { href: (slug:string)=>`/org/${slug}/projects`, label: "Projects", icon: Folder },
  { href: (slug:string)=>`/org/${slug}/feedback`, label: "Feedback", icon: MessageSquare },
  { href: (slug:string)=>`/org/${slug}/settings`, label: "Settings", icon: Settings },
];

export default function Sidebar({ slug }: { slug?: string }) {
  const pathname = usePathname();
  const s = slug || pathname.split("/")[2] || "";
  return (
    <aside className="h-full w-64 border-r border-neutral-200 bg-neutral-50 hidden sm:block">
      <div className="p-4">
        {nav.map(({href,label,icon:Icon})=>{
          const url = href(s);
          // Overview: exact match only to avoid matching all pages
          // Others: exact match OR startsWith for sub-routes
          const isOverview = label === "Overview";
          const active = isOverview 
            ? pathname === url 
            : pathname === url || pathname.startsWith(url + "/");
          return (
            <Link
              key={label}
              href={url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all mb-1",
                active 
                  ? "bg-brand text-white shadow-veriff" 
                  : "text-neutral-700 hover:bg-brand hover:text-white hover:shadow-veriff"
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
