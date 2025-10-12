"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="h-14 flex items-center justify-between px-4 border-b bg-white/70 backdrop-blur">
      <Link href="/" className="font-semibold">Vamoot</Link>
      <div className="text-sm text-neutral-500">{pathname}</div>
    </div>
  );
}

