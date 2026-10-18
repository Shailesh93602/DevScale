/**
 * A list card's plain-text preview of a challenge's markdown description.
 *
 * Rendering the markdown in a card showed the description's own `# Title`
 * heading under the card title, and its fenced examples set the grid
 * column's min-content width, so the page was 807px wide on a 390px phone
 * (live smoke 2026-10-18). Headings, fences and rules are dropped; inline
 * syntax is unwrapped to its text.
 */
export function challengePreview(markdown: string, maxLength = 240): string {
  const text = markdown
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s.*$/gm, ' ')
    .replace(/^\s*([-*_])(\s*\1){2,}\s*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/^\s*(?:[-*+]|\d+\.|>)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : maxLength)}…`;
}
