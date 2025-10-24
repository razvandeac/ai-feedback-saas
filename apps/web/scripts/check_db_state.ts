import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function checkDatabaseState() {
  const adminSupabase = getSupabaseAdmin();
  console.log("🔍 Checking database state...");

  try {
    // 1. Check if studio_widgets table exists
    console.log("\n--- Checking studio_widgets table ---");
    const { data: widgets, error: widgetsError } = await adminSupabase
      .from("studio_widgets")
      .select("id")
      .limit(1);
    
    if (widgetsError) {
      console.error("❌ studio_widgets table error:", widgetsError.message);
    } else {
      console.log("✅ studio_widgets table exists, found", widgets?.length || 0, "widgets");
    }

    // 2. Check if projects.widget_id column exists
    console.log("\n--- Checking projects.widget_id column ---");
    const { data: projects, error: projectsError } = await adminSupabase
      .from("projects")
      .select("id, widget_id")
      .limit(1);
    
    if (projectsError) {
      console.error("❌ projects.widget_id column error:", projectsError.message);
    } else {
      console.log("✅ projects.widget_id column exists");
      console.log("Sample project:", projects?.[0]);
    }

    // 3. Check specific project
    console.log("\n--- Checking specific project ---");
    const projectId = "8f0cb218-8df3-4dbd-944a-0cd6a4be64c6";
    const { data: project, error: projectError } = await adminSupabase
      .from("projects")
      .select("id, name, org_id, widget_id")
      .eq("id", projectId)
      .single();
    
    if (projectError) {
      console.error("❌ Project fetch error:", projectError.message);
    } else {
      console.log("✅ Project found:", project);
    }

    // 4. Check demo organization
    console.log("\n--- Checking demo organization ---");
    const { data: org, error: orgError } = await adminSupabase
      .from("organizations")
      .select("id, slug")
      .eq("slug", "demo")
      .single();
    
    if (orgError) {
      console.error("❌ Demo org error:", orgError.message);
    } else {
      console.log("✅ Demo org found:", org);
    }

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

if (require.main === module) {
  checkDatabaseState().catch(console.error);
}

export { checkDatabaseState };
