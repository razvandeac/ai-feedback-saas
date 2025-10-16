export function displayName(user?: { full_name?: string | null; email?: string | null; id?: string } | null) {
  if (!user) return "Unknown";
  return user.full_name?.trim() || user.email || user.id || "Unknown";
}

