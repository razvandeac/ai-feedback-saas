import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships } = await sb.from("memberships").select("org_id").limit(1);
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
