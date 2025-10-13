import EmptyState from "@/components/empty-state";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Settings</h1>
      <EmptyState
        title="Nothing to configure (yet)"
        description="Organization settings will appear here as we add features."
      />
    </div>
  );
}
