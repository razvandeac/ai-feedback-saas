export function displayName(user?: { full_name?: string | null; email?: string | null; id?: string } | null) {
  if (!user) return "Unknown";
  
  // If we have a full name, use it
  if (user.full_name?.trim()) return user.full_name.trim();
  
  // If we have an email, use it
  if (user.email) return user.email;
  
  // If we only have an ID, show a shortened version
  if (user.id) return `User ${user.id.slice(0, 8)}...`;
  
  return "Unknown";
}

