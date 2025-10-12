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
    <div className="h-screen w-full grid grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <div className="col-span-2">
        <Navbar />
      </div>
      <aside className="border-r bg-neutral-50">
        <Sidebar />
      </aside>
      <main className="overflow-auto p-6">{children}</main>
    </div>
  );
}
