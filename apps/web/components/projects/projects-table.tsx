"use client";
import React, { useState } from "react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Copy } from "lucide-react";

type Row = { id: string; name: string; key: string; created_at: string };

export default function ProjectsTable({ 
  initial, 
  orgSlug
}: { 
  initial: Row[]; 
  orgSlug: string;
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  
  // Sync with parent state changes
  React.useEffect(() => {
    setRows(initial);
  }, [initial]);

  async function rotate(id: string) {
    const idx = rows.findIndex(r => r.id === id);
    if (idx < 0) return;
    toast.loading("Rotating key…", { id: `rot-${id}` });
    // optimistic: show placeholder key
    const old = rows[idx];
    const optimistic = [...rows];
    optimistic[idx] = { ...old, key: "••••••••••••••" };
    setRows(optimistic);

    const resp = await fetch(`/api/projects/${id}/rotate-key`, { method: "POST" });
    if (!resp.ok) {
      toast.error("Failed to rotate key", { id: `rot-${id}` });
      setRows(rows); // revert
      return;
    }
    const data = await resp.json();
    toast.success("Key rotated", { id: `rot-${id}` });
    const next = [...optimistic];
    next[idx] = { ...old, key: data.key };
    setRows(next);
  }

  async function del(id: string) {
    toast.loading("Deleting…", { id: `del-${id}` });
    const prev = rows;
    setRows(prev.filter(r => r.id !== id)); // optimistic remove
    const resp = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      toast.error("Failed to delete", { id: `del-${id}` });
      setRows(prev); // revert
      return;
    }
    toast.success("Deleted", { id: `del-${id}` });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied"),
      () => toast.error("Copy failed")
    );
  }

  return (
    <div className="rounded-3xl border bg-white">
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Key</TH>
            <TH>Created</TH>
            <TH className="w-[240px]">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map(r => (
            <TR key={r.id}>
              <TD className="font-medium">{r.name}</TD>
              <TD>
                <div className="flex items-center gap-2">
                  <code className="text-xs">{r.key}</code>
                  <button 
                    onClick={()=>copy(r.key)} 
                    className="p-1 hover:bg-neutral-100 rounded transition-colors"
                    title="Copy key"
                  >
                    <Copy size={14} className="text-neutral-500" />
                  </button>
                </div>
              </TD>
              <TD>{format(new Date(r.created_at), "MMM d, yyyy")}</TD>
              <TD className="flex gap-2">
                <Button variant="outline" size="sm" onClick={()=>rotate(r.id)}>Rotate key</Button>
                <Button variant="ghost" size="sm" onClick={()=>del(r.id)}>Delete</Button>
              </TD>
            </TR>
          ))}
          {rows.length === 0 && (
            <TR>
              <TD colSpan={4} className="p-6 text-center text-sm text-neutral-500">
                No projects yet. Use <span className="font-medium">New project</span> to create one.
              </TD>
            </TR>
          )}
        </TBody>
      </Table>
    </div>
  );
}

