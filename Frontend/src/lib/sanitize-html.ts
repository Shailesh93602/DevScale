import DOMPurify from 'dompurify';

// DOMPurify needs a DOM: on the server `sanitize` is not a function and threw, forcing client-only render.
// Content is already sanitised server-side on every write (Backend/src/utils/sanitize.ts); this is
// browser-side defence in depth, so it is skipped when there is no DOM.
export function sanitizeContent(content: string): string {
  if (typeof window === 'undefined') return content;
  return DOMPurify.sanitize(content);
}
