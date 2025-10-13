"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import StarRating from "@/components/widget/star-rating";
import { Label, Textarea, Button } from "@/components/widget/field";

type Config = {
  project: { id: string; name: string };
  settings: {
    theme?: "light" | "dark";
    primaryColor?: string;
    showRating?: boolean;
    showComment?: boolean;
    title?: string;
    logoUrl?: string | null;
  };
};

export default function EmbedPage() {
  const [key, setKey] = useState<string>("");
  const [cfg, setCfg] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  
  // track if user has started interacting
  const started = useRef(false);

  const primary = cfg?.settings?.primaryColor || "#2563eb";
  const showRating = cfg?.settings?.showRating ?? true;
  const showComment = cfg?.settings?.showComment ?? true;

  // Read key from URL after mount (client-side only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const k = params.get("key") || "";
    setKey(k);
  }, []);

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/projects/${key}/config`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load config");
        setCfg(json);

        // emit widget.opened
        await fetch("/api/public/ingest", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, type: "widget.opened", payload: { ts: Date.now() }})
        });
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || "Could not load widget");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (key) {
        fetch("/api/public/ingest", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, type: "widget.closed", payload: { ts: Date.now() }})
        }).catch(()=>{});
      }
    };
  }, [key]);

  async function submit() {
    if (!cfg) return;
    setBusy(true);
    toast.loading("Sending feedback…", { id: "fb" });
    try {
      const payload: any = {};
      if (showRating) payload.rating = rating;
      if (showComment) payload.comment = comment;
      const resp = await fetch("/api/public/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key,
          type: "feedback.submit",
          payload
        })
      });
      if (!resp.ok) throw new Error(await resp.text());
      setSent(true);
      toast.success("Thanks for your feedback!", { id: "fb" });
      setComment("");
      setRating(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to send feedback", { id: "fb" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-4 text-sm">Loading…</div>;
  if (!key) return <div className="p-4 text-sm">Missing project key.</div>;
  if (!cfg) return <div className="p-4 text-sm">Widget unavailable.</div>;

  // theming via CSS variable
  const style = { ["--vamoot-primary" as any]: primary } as React.CSSProperties;

  return (
    <div className="min-h-[340px] p-4 grid place-items-center" style={style}>
      <div className="w-full max-w-md space-y-4 border rounded-3xl p-5 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3">
          {cfg.settings.logoUrl ? <img src={cfg.settings.logoUrl} alt="" className="h-6 w-6 rounded-md object-cover" /> : null}
          <div className="text-base font-semibold">{cfg.settings.title || "We value your feedback!"}</div>
        </div>

        {!sent ? (
          <>
            {showRating && (
              <div>
                <Label>How would you rate your experience?</Label>
                <StarRating value={rating} onChange={(n)=>{
                  setRating(n);
                  if (!started.current) {
                    started.current = true;
                    fetch("/api/public/ingest", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ key, type: "feedback.started", payload: { via: "rating" } })
                    }).catch(()=>{});
                  }
                }} />
              </div>
            )}
            {showComment && (
              <div>
                <Label>Anything we can improve?</Label>
                <Textarea
                  placeholder="Share your thoughts…"
                  value={comment}
                  onChange={(e)=>{
                    if (!started.current) {
                      started.current = true;
                      fetch("/api/public/ingest", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ key, type: "feedback.started", payload: { via: "comment" } })
                      }).catch(()=>{});
                    }
                    setComment(e.target.value);
                  }}
                  rows={4}
                  maxLength={2000}
                />
                <div className="text-xs text-neutral-500 text-right">{comment.length}/2000</div>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                onClick={submit}
                disabled={busy || (!showRating && !showComment) || (showRating && !rating && !showComment ? true : false)}
              >
                {busy ? "Sending…" : "Send feedback"}
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border bg-green-50 text-green-800 p-4 text-sm">
            Thanks! Your feedback was submitted successfully.
          </div>
        )}

        {/* Footer / legal */}
        <div className="text-[11px] text-neutral-500 text-right">
          Powered by Vamoot
        </div>
      </div>
    </div>
  );
}

