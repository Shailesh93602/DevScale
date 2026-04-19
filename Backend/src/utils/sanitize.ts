import sanitizeHtml from 'sanitize-html';

/**
 * Strip all HTML tags — use for plain-text fields (usernames, titles, etc.)
 */
export const sanitizeText = (input: string): string =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });

/**
 * Allow a safe subset of HTML tags — use for rich-text fields (articles, forum posts).
 * Strips scripts, iframes, event handlers, and all inline styles.
 */
export const sanitizeRichText = (input: string): string =>
  sanitizeHtml(input, {
    allowedTags: [
      'p',
      'br',
      'b',
      'i',
      'em',
      'strong',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'a',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'width', 'height'],
      code: ['class'], // for syntax highlighting class names
    },
    allowedSchemes: ['https', 'mailto'],
    allowedSchemesByTag: {
      img: ['https'], // no data: URIs
    },
  });
