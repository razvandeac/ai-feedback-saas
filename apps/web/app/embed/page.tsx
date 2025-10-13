"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function EmbedPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const project = params.get("project") || "";
  const [comment, setComment] = useState("");

  const projectId = useMemo(() => project, [project]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.loading("Sending feedback…", { id: "send-fb" });
    const resp = await fetch("/api/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        type: "feedback.submit",
        payload: { comment }
      })
    });
    if (resp.ok) {
      setComment("");
      toast.success("Thanks for your feedback!", { id: "send-fb" });
    } else {
      const t = await resp.text();
      toast.error(t || "Could not send feedback", { id: "send-fb" });
    }
  }

  return (
    <div className="min-h-[320px] p-4 grid place-items-center bg-white">
      <form onSubmit={submit} className="w-full max-w-md space-y-3">
        <h2 className="text-lg font-semibold">Your feedback</h2>
        <textarea
          className="w-full border rounded-2xl p-2"
          rows={4}
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          placeholder="What's working? What's not?"
          required
        />
        <button className="border rounded-2xl px-4 py-2">Send</button>
      </form>
    </div>
  );
}

