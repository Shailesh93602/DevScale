import { useSyncExternalStore } from 'react';
import DOMPurify from 'dompurify';

// Without a DOM there is nothing to sanitise with, so emit nothing: raw HTML in the SSR pass is stored XSS.
export function sanitizeContent(content: string): string {
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(content);
}

const noopSubscribe = () => () => {};

/** Sanitised HTML for `dangerouslySetInnerHTML`: empty on the server and during hydration, filled after. */
export function useSanitizedHtml(content: string): string {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return isClient ? sanitizeContent(content) : '';
}
