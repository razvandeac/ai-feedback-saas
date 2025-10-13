"use client";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreateOrgForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, start] = useTransition();
  const toSlug = (s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.loading("Creating organization…", { id: "create-org" });
    const resp = await fetch("/api/orgs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug: slug || toSlug(name) })
    });
    if (resp.ok) {
      const { slug } = await resp.json();
      toast.success("Organization created", { id: "create-org" });
      window.location.href = `/org/${slug}`;
    } else {
      const t = await resp.text();
      toast.error(t || "Failed to create org", { id: "create-org" });
    }
  }

  return (
    <form onSubmit={(e)=>start(()=>submit(e))} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Organization name</label>
        <Input value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Slug (optional)</label>
        <Input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="acme" />
      </div>
      <Button disabled={pending}>Create</Button>
    </form>
  );
}
