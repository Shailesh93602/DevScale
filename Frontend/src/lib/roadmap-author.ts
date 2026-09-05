/**
 * How a roadmap's author is named on cards and lists.
 *
 * The public catalogue is seeded under the platform account —
 * `admin@eduscale.io`, username `admin`, display name "Admin User" in
 * `Backend/prisma/seeders/user.seeder.ts` — so every card on /career-roadmap
 * used to say it was written by "Admin User", which is neither a person nor
 * the platform. Those roadmaps are system-authored and carry the platform's
 * name instead.
 *
 * The account is recognised by username because that is the only stable
 * identifier the roadmap endpoints expose (they select id, username,
 * first_name, last_name and avatar_url — not email or role). The test beside
 * this file reads the seeder and fails if the two drift apart.
 */
export const PLATFORM_AUTHOR_NAME = 'EduScale';
export const SYSTEM_AUTHOR_USERNAME = 'admin';

export interface RoadmapAuthorFields {
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export function isSystemAuthor(
  user: RoadmapAuthorFields | null | undefined,
): boolean {
  return user?.username === SYSTEM_AUTHOR_USERNAME;
}

/**
 * Display name for a roadmap author: the platform name for system-authored
 * roadmaps, otherwise "First Last", then first name, then username, then
 * `fallback`. The precedence is the one the cards already used.
 */
export function roadmapAuthorName(
  user: RoadmapAuthorFields | null | undefined,
  fallback = '',
): string {
  if (!user) return fallback;
  if (isSystemAuthor(user)) return PLATFORM_AUTHOR_NAME;
  if (user.first_name && user.last_name)
    return `${user.first_name} ${user.last_name}`;
  return user.first_name || user.username || fallback;
}

/** One-letter avatar fallback, derived from the same name the card shows. */
export function roadmapAuthorInitial(
  user: RoadmapAuthorFields | null | undefined,
): string {
  return roadmapAuthorName(user, 'U').charAt(0).toUpperCase();
}
