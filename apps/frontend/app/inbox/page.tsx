import { supabase } from "../../lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { data, error } = await supabase
    .from("feedback")
    .select("id,text,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Inbox</h1>
        <div className="text-red-600">Error loading feedback: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      <div className="space-y-4">
        {data?.map((feedback) => (
          <div key={feedback.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="text-sm text-gray-500 mb-2">
              {new Date(feedback.created_at).toLocaleString()}
            </div>
            <div className="text-gray-900 mb-2">{feedback.text}</div>
            <div className="text-xs text-gray-600">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(feedback.metadata, null, 2)}
              </pre>
            </div>
          </div>
        ))}
        {data?.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No feedback entries found.
          </div>
        )}
      </div>
    </div>
  );
}
