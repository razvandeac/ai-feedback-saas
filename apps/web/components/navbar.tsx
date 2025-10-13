"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Menu } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const crumbs = pathname.split("/").filter(Boolean);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
      <div className="h-16">
        <div className="container-xl h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-neutral-100 sm:hidden"><Menu size={20} /></button>
            <Link href="/" className="text-2xl font-bold text-brand tracking-tight">Vamoot</Link>
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600">
              {crumbs.length ? <span className="text-neutral-400">/</span> : null}
              {crumbs.map((c, i) => (
                <span key={i} className="capitalize font-medium">{c}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Mail className="mr-2 h-4 w-4" />Feedback
            </Button>
            <form action="/login" method="get">
              <Button variant="outline" size="sm"><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
