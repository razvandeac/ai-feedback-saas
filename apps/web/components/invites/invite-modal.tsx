"use client";
import { useState, useTransition } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function InviteModal({ orgSlug }: { orgSlug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [pending, start] = useTransition();

  async function submit() {
    toast.loading("Sending invite…", { id: "invite" });
    const resp = await fetch(`/api/orgs/${orgSlug}/invites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role })
    });
    if (!resp.ok) {
      toast.error((await resp.text()) || "Failed", { id: "invite" });
      return;
    }
    const data = await resp.json();
    toast.success("Invite created", { id: "invite" });
    // broadcast so table updates
    window.dispatchEvent(new CustomEvent("vamoot:invite-created", { detail: data }));
    setOpen(false);
    setEmail("");
    setRole("member");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Invite</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader title="Invite teammate" desc="They'll get a link to join this org." />
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="teammate@acme.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select className="border rounded-2xl h-10 px-3 w-full" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="member">Member (view)</option>
              <option value="admin">Admin (manage)</option>
              <option value="owner">Owner (full)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={()=>start(submit)} disabled={!email}>Send invite</Button>
          </div>
          <p className="text-xs text-neutral-500">For now, copy the generated link from the Invites list.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
