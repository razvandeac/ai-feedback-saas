"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Project = { id: string; name: string };

export default function FeedbackFilterBar({ projects }: { projects: Project[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();

  const [project, setProject] = useState(params.get("project") || "");
  const [rating, setRating] = useState(params.get("rating") || "");
  const [q, setQ] = useState(params.get("q") || "");
  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");

  useEffect(() => {
    setProject(params.get("project") || "");
    setRating(params.get("rating") || "");
    setQ(params.get("q") || "");
    setFrom(params.get("from") || "");
    setTo(params.get("to") || "");
  }, [params]);

  function apply(nextPage?: number) {
    const sp = new URLSearchParams(Array.from(params.entries()));
    function setOrDel(k: string, v?: string) { if (v) sp.set(k, v); else sp.delete(k); }
    setOrDel("project", project || undefined);
    setOrDel("rating", rating || undefined);
    setOrDel("q", q || undefined);
    setOrDel("from", from || undefined);
    setOrDel("to", to || undefined);
    setOrDel("page", nextPage ? String(nextPage) : undefined);
    start(() => router.replace(`${pathname}?${sp.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs mb-1">Project</label>
        <select className="border rounded-2xl h-10 px-3" value={project} onChange={(e)=>setProject(e.target.value)}>
          <option value="">All</option>
          {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1">Rating</label>
        <select className="border rounded-2xl h-10 px-3" value={rating} onChange={(e)=>setRating(e.target.value)}>
          <option value="">All</option>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
          <option value="null">No rating</option>
        </select>
      </div>
      <div>
        <label className="block text-xs mb-1">From</label>
        <input type="date" className="border rounded-2xl h-10 px-3" value={from} onChange={(e)=>setFrom(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs mb-1">To</label>
        <input type="date" className="border rounded-2xl h-10 px-3" value={to} onChange={(e)=>setTo(e.target.value)} />
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs mb-1">Search</label>
        <Input placeholder="Search comments…" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <Button onClick={()=>apply(1)}>Apply</Button>
      <Button variant="subtle" onClick={()=>{ setProject(""); setRating(""); setQ(""); setFrom(""); setTo(""); apply(1); }}>Reset</Button>
    </div>
  );
}

