import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { getServerSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabase();
  
  // Check if user has any memberships (redirect to onboarding if not)
  const { data: memberships } = await supabase.from("memberships").select("org_id").limit(1);
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
