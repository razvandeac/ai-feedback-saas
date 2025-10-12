import { supabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export default async function OrgHome({ params }: { params: { slug: string } }) {
  const sb = await supabaseServer();
  const { data: org } = await sb.from("organizations").select("*").eq("slug", params.slug).single();
  if (!org) notFound();
  return <div>Welcome to {org.name}</div>;
}
