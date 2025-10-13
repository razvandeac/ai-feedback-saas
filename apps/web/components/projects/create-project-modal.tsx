"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Project = { id: string; name: string; key: string; created_at: string };

export default function CreateProjectModal({ 
  orgSlug, 
  onProjectCreated 
}: { 
  orgSlug: string;
  onProjectCreated?: (project: Project) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function create() {
    toast.loading("Creating project…", { id: "proj" });
    const resp = await fetch(`/api/orgs/${orgSlug}/projects`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      toast.error(t || "Failed to create", { id: "proj" });
      return;
    }
    const newProject = await resp.json();
    toast.success("Project created", { id: "proj" });
    setName("");
    setOpen(false);
    
    // Optimistically add to table
    if (onProjectCreated) onProjectCreated(newProject);
    
    // Also refresh server data in background
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">New project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader title="Create project" desc="Give your project a name." />
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Main Website" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={()=>create()} disabled={pending || !name.trim()}>
              {pending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

