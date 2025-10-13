"use client";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

type WidgetSettings = {
  theme?: string;
  primaryColor?: string;
  logoUrl?: string;
  showRating?: boolean;
  showComment?: boolean;
  title?: string;
};

export default function EmbedPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const project = params.get("project") || "";
  const projectId = useMemo(() => project, [project]);

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [settings, setSettings] = useState<WidgetSettings>({
    theme: "light",
    primaryColor: "#2563eb",
    logoUrl: "",
    showRating: true,
    showComment: true,
    title: "We value your feedback!"
  });
  const [loading, setLoading] = useState(true);

  // Fetch widget config on mount
  useEffect(() => {
    if (!projectId) return;
    
    async function loadConfig() {
      try {
        const res = await fetch(`/api/projects/${projectId}/config`);
        if (res.ok) {
          const { settings: fetchedSettings } = await res.json();
          setSettings({
            theme: fetchedSettings.theme || "light",
            primaryColor: fetchedSettings.primaryColor || "#2563eb",
            logoUrl: fetchedSettings.logoUrl || "",
            showRating: fetchedSettings.showRating ?? true,
            showComment: fetchedSettings.showComment ?? true,
            title: fetchedSettings.title || "We value your feedback!"
          });
        }
      } catch (e) {
        console.error("Failed to load widget config:", e);
      } finally {
        setLoading(false);
      }
    }
    
    loadConfig();
  }, [projectId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.loading("Sending feedback…", { id: "send-fb" });
    const resp = await fetch("/api/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        type: "feedback.submit",
        payload: { comment, rating }
      })
    });
    if (resp.ok) {
      setComment("");
      setRating(null);
      toast.success("Thanks for your feedback!", { id: "send-fb" });
    } else {
      const t = await resp.text();
      toast.error(t || "Could not send feedback", { id: "send-fb" });
    }
  }

  const bgColor = settings.theme === "dark" ? "#1a1a1a" : "#ffffff";
  const textColor = settings.theme === "dark" ? "#ffffff" : "#000000";

  if (loading) {
    return (
      <div className="min-h-[320px] p-4 grid place-items-center" style={{ backgroundColor: bgColor }}>
        <div className="text-sm" style={{ color: textColor }}>Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[320px] p-4 grid place-items-center"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <form onSubmit={submit} className="w-full max-w-md space-y-3">
        {settings.logoUrl && (
          <div className="flex justify-center mb-2">
            <img src={settings.logoUrl} alt="Logo" className="h-10 object-contain" />
          </div>
        )}
        <h2 className="text-lg font-semibold" style={{ color: textColor }}>
          {settings.title}
        </h2>
        
        {settings.showRating && (
          <div>
            <label className="block text-sm mb-2" style={{ color: textColor }}>
              How would you rate your experience?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="w-10 h-10 rounded-full border-2 transition-all"
                  style={{
                    borderColor: rating === n ? settings.primaryColor : "#d1d5db",
                    backgroundColor: rating === n ? settings.primaryColor : "transparent",
                    color: rating === n ? "#ffffff" : textColor
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {settings.showComment && (
          <textarea
            className="w-full border rounded-2xl p-2"
            style={{ 
              borderColor: "#d1d5db",
              backgroundColor: settings.theme === "dark" ? "#2a2a2a" : "#ffffff",
              color: textColor
            }}
            rows={4}
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
            placeholder="What's working? What's not?"
            required={!settings.showRating}
          />
        )}

        <button
          type="submit"
          className="rounded-2xl px-4 py-2 font-medium w-full transition-all"
          style={{
            backgroundColor: settings.primaryColor,
            color: "#ffffff",
            opacity: 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          Send
        </button>
      </form>
    </div>
  );
}

