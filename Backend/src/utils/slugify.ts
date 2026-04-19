/**
 * Converts a string to a URL-friendly slug.
 * e.g. "My Battle Title!" → "my-battle-title"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric (keep spaces and hyphens)
    .replace(/[\s]+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Generates a slug from a title, appended with the first 8 chars of the id
 * to guarantee uniqueness across records with similar titles.
 * e.g. title="React Quiz", id="a1b2c3d4-..." → "react-quiz-a1b2c3d4"
 */
export function generateBattleSlug(title: string, id: string): string {
  const base = slugify(title);
  const suffix = id.replace(/-/g, '').slice(0, 8);
  return base ? `${base}-${suffix}` : suffix;
}

/**
 * Detects whether a string is a UUID v4.
 */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Roadmap slug: title is @unique so no suffix needed.
 * e.g. "Full Stack Web Dev" → "full-stack-web-dev"
 * Also used for MainConcept (name is @unique — same logic).
 */
export function generateRoadmapSlug(title: string): string {
  return slugify(title);
}

/** MainConcept slug — same rule as Roadmap: name is @unique, so plain slugify. */
export const generateMainConceptSlug = generateRoadmapSlug;

/**
 * Topic slug: title is NOT unique → append first 8 chars of UUID.
 * e.g. title="Introduction", id="a1b2c3d4-..." → "introduction-a1b2c3d4"
 */
export function generateTopicSlug(title: string, id: string): string {
  const base = slugify(title);
  const suffix = id.replace(/-/g, '').slice(0, 8);
  return base ? `${base}-${suffix}` : suffix;
}
