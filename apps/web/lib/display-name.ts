export function displayName(user?: { full_name?: string | null; email?: string | null } | null) {
  return user?.full_name?.trim() || user?.email || "Unknown";
}

