import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { getServerSupabase } from "@/lib/supabaseServer";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  const adminSupabase = getSupabaseAdmin();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  // Check if user has any memberships using admin client to bypass RLS
  const { data: memberships } = await (adminSupabase as any).from("org_members") // eslint-disable-line @typescript-eslint/no-explicit-any
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1);
  if (!memberships || memberships.length === 0) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-[256px_1fr] h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="p-8 bg-neutral-50 overflow-y-auto">
          <div className="container-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
