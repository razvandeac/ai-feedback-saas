"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { toast } from "sonner";
import { displayName } from "@/lib/display-name";

type UserLite = { id: string; email?: string | null; full_name?: string | null };
type Row = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  token?: string;
  acceptUrl?: string;
  inviter?: UserLite | null;
};

export default function InvitesTable({ initial, orgSlug }: { initial: Row[]; orgSlug: string }) {
  const [rows, setRows] = useState<Row[]>(initial);

  useEffect(() => {
    function onCreated(e: Event) {
      const ev = e as CustomEvent<Row>;
      setRows(prev => [ev.detail, ...prev]);
    }
    window.addEventListener("vamoot:invite-created", onCreated as EventListener);
    return () => window.removeEventListener("vamoot:invite-created", onCreated as EventListener);
  }, []);

  async function revoke(id: string) {
    toast.loading("Revoking…", { id });
    const resp = await fetch(`/api/invites/revoke`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (!resp.ok) return toast.error("Failed", { id });
    toast.success("Revoked", { id });
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: "revoked" } : r));
  }

  async function resend(id: string) {
    const tid = `resend-${id}`;
    toast.loading("Resending…", { id: tid });
    const resp = await fetch(`/api/invites/resend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (resp.ok) toast.success("Email sent", { id: tid });
    else toast.error(await resp.text(), { id: tid });
  }

  async function copyLink(id: string) {
    const tid = `copy-link-${id}`;
    toast.loading("Fetching link…", { id: tid });
    const r = await fetch(`/api/orgs/${orgSlug}/invites/${id}/link`);
    const j = await r.json().catch(()=>({}));
    if (!r.ok || !j.acceptUrl) {
      toast.error(j?.error || "Failed to fetch link", { id: tid });
      return;
    }
    try {
      await navigator.clipboard.writeText(j.acceptUrl);
      toast.success("Accept link copied", { id: tid });
    } catch {
      toast.success(`Link ready: ${j.acceptUrl}`, { id: tid });
    }
  }

  return (
    <div className="rounded-3xl border bg-white">
      <div className="p-3 border-b text-sm font-medium">Pending invites</div>
      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Invited by</TH>
            <TH>Status</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map(r => (
            <TR key={r.id}>
              <TD>{r.email}</TD>
              <TD className="capitalize">{r.role}</TD>
              <TD>{r.inviter ? displayName(r.inviter) : "—"}</TD>
              <TD className="capitalize">{r.status}</TD>
              <TD className="flex gap-2">
                <Button variant="outline" size="sm" onClick={()=>copyLink(r.id)} disabled={r.status!=="pending"}>Copy link</Button>
                <Button variant="outline" size="sm" onClick={()=>resend(r.id)} disabled={r.status!=="pending"}>Resend</Button>
                <Button variant="ghost" size="sm" onClick={()=>revoke(r.id)} disabled={r.status!=="pending"}>Revoke</Button>
              </TD>
            </TR>
          ))}
          {rows.length === 0 && (
            <TR><TD colSpan={5} className="p-6 text-center text-sm text-neutral-500">No invites yet.</TD></TR>
          )}
        </TBody>
      </Table>
    </div>
  );
}
