export function getInitials(
  fullName?: string | null,
  username?: string | null,
): string {
  const value = (fullName || username || '').trim();
  if (!value) return 'U';

  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
}
