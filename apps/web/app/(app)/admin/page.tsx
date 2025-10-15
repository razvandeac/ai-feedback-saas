export const revalidate = 0;

import { supabaseServer } from "@/lib/supabase-server";
import { isPlatformAdmin } from "@/lib/is-platform-admin";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { ok } = await isPlatformAdmin();
  if (!ok) {
    return <div className="p-8 text-sm text-red-600">Access denied</div>;
  }

  const search = await searchParams;
  const sb = await supabaseServer();
  const qSource = (typeof search?.source === "string" ? search.source : "") as string;
  const qStatus = (typeof search?.status === "string" ? search.status : "") as string;
  const qRating = Number(typeof search?.rating === "string" ? search.rating : 0);

  let query = sb.from("platform_feedback")
    .select("id, source, rating, comment, email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (qSource) query = query.eq("source", qSource);
  if (qStatus) query = query.eq("status", qStatus);
  if (qRating) query = query.eq("rating", qRating);

  const { data } = await query;

  type FeedbackRow = {
    id: string;
    source: string | null;
    rating: number | null;
    comment: string | null;
    email: string | null;
    status: string;
    created_at: string;
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Vamoot Platform Feedback</h1>

      {/* filters */}
      <form className="flex flex-wrap gap-2 text-sm">
        <input name="source" placeholder="source (app/docs/landing)" defaultValue={qSource} className="border rounded-xl px-3 py-1" />
        <input name="status" placeholder="status (new/triaged/closed)" defaultValue={qStatus} className="border rounded-xl px-3 py-1" />
        <input name="rating" type="number" min={0} max={5} placeholder="rating" defaultValue={qRating || ""} className="border rounded-xl px-3 py-1 w-24" />
        <button className="border rounded-xl px-3 py-1">Filter</button>
      </form>

      <div className="rounded-3xl border bg-white overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-neutral-50 text-left">
              <th className="p-2">Date</th>
              <th className="p-2">Source</th>
              <th className="p-2">Rating</th>
              <th className="p-2">Comment</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data as FeedbackRow[] ?? []).map((f) => (
              <tr key={f.id} className="border-b align-top">
                <td className="p-2 whitespace-nowrap">{new Date(f.created_at).toLocaleString()}</td>
                <td className="p-2">{f.source || "—"}</td>
                <td className="p-2">{f.rating ?? "—"}</td>
                <td className="p-2 max-w-md">{f.comment || "—"}</td>
                <td className="p-2">{f.email || "—"}</td>
                <td className="p-2">{f.status}</td>
                <td className="p-2">
                  <form action={`/api/admin/vamoot/feedback/${f.id}/status`} method="POST" className="flex gap-2">
                    <input type="hidden" name="status" value={f.status === "new" ? "triaged" : f.status === "triaged" ? "closed" : "new"} />
                    <button className="text-xs underline">Mark {f.status === "new" ? "triaged" : f.status === "triaged" ? "closed" : "new"}</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={7} className="p-6 text-center text-neutral-500">No feedback yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

