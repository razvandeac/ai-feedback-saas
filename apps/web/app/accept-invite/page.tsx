"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Lookup = {
  org: { name: string; slug: string } | null;
  inviter: { full_name?: string | null; email?: string | null } | null;
  invite: { role: string; status: "pending" | "accepted" | "revoked" | "expired"; email_hint: string; created_at: string };
};

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Lookup | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErr("Missing token");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/invites/lookup?token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Lookup failed");
        setData(json);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Lookup failed");
      }
    })();
  }, [token]);

  async function accept() {
    if (!token) return;
    setBusy(true);
    toast.loading("Accepting invite…", { id: "acc" });
    const resp = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token })
    });
    if (resp.ok) {
      toast.success("Joined organization", { id: "acc" });
      router.push("/");
    } else {
      toast.error(await resp.text(), { id: "acc" });
      setBusy(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(`/accept-invite?token=${token}`)}`;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Accept invite</h1>

      {err && <p className="text-sm text-red-600">{err}</p>}

      {data && (
        <div className="rounded-2xl border p-4 bg-white space-y-2">
          <div className="text-sm text-neutral-600">Organization</div>
          <div className="font-medium">{data.org?.name ?? "Unknown org"}</div>

          <div className="text-sm text-neutral-600 mt-3">Invited by</div>
          <div className="font-medium">
            {data.inviter?.full_name || data.inviter?.email || "Unknown"}
            {data.inviter?.email ? <span className="text-neutral-500"> ({data.inviter.email})</span> : null}
          </div>

          <div className="text-sm text-neutral-600 mt-3">Role</div>
          <div className="font-medium capitalize">{data.invite.role}</div>

          <div className="text-sm text-neutral-600 mt-3">Invitee</div>
          <div className="font-medium">{data.invite.email_hint}</div>

          <div className="text-sm text-neutral-600 mt-3">Status</div>
          <div className="font-medium capitalize">{data.invite.status}</div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <a href={loginHref} className="underline text-sm">Sign in (or switch) to continue</a>
      </div>

      <div className="pt-2">
        <Button
          onClick={accept}
          disabled={!token || !data || data.invite.status !== "pending" || busy}
        >
          {busy ? "Accepting…" : "Accept invite"}
        </Button>
        {data?.invite.status !== "pending" && (
          <p className="text-xs text-neutral-500 mt-2">
            This invite is <span className="capitalize">{data?.invite.status}</span>. Ask the inviter to send a new one if needed.
          </p>
        )}
      </div>
    </div>
  );
}
