/**
 * Types for legacy-redirects.mjs. The source is plain JavaScript so that
 * next.config.mjs can import it without a build step (allowJs is off in this
 * project), and this declaration lets the vitest suite import it under
 * `tsc --noEmit`.
 */
export interface LegacyRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export const legacyRedirects: LegacyRedirect[];
