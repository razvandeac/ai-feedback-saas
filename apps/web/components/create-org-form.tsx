"use client";
import { useState, useTransition } from "react";

export default function CreateOrgForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const toSlug = (s:string) => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    console.log("Submitting org creation:", { name, slug: slug || toSlug(name) });
    
    const resp = await fetch("/api/orgs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include", // Ensure cookies are sent
      body: JSON.stringify({ name, slug: slug || toSlug(name) })
    });
    
    console.log("Response status:", resp.status);
    
    if (resp.ok) {
      const data = await resp.json();
      console.log("Org created:", data);
      window.location.href = `/org/${data.slug}`;
    } else {
      const errorText = await resp.text();
      console.error("Error response:", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        setError(errorJson.error || errorText);
      } catch {
        setError(errorText);
      }
    }
  }

  return (
    <form onSubmit={(e)=>start(()=>submit(e))} className="space-y-4">
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm mb-1">Organization name</label>
        <input 
          className="w-full border rounded p-2" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Slug (optional)</label>
        <input 
          className="w-full border rounded p-2" 
          value={slug} 
          onChange={e=>setSlug(e.target.value)} 
          placeholder="acme" 
        />
      </div>
      <button 
        className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50" 
        disabled={pending}
      >
        {pending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
