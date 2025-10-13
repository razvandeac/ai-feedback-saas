"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Menu } from "lucide-react";

const Breadcrumb = dynamic(() => import("@/components/nav/breadcrumb"), { ssr: false });

export default function Navbar() {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
      <div className="h-16">
        <div className="container-xl h-full flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button className="p-2 rounded-lg hover:bg-neutral-100 sm:hidden"><Menu size={20} /></button>
            {/* Logo / Brand */}
            <Link href="/" className="text-2xl font-bold text-brand tracking-tight shrink-0">Vamoot</Link>
            {/* Breadcrumb */}
            <div className="hidden sm:block min-w-0">
              <Breadcrumb />
            </div>
          </div>
          
          {/* Right side actions */}
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
