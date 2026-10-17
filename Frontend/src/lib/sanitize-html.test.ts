import { describe, it, expect } from 'vitest';
import { sanitizeContent } from './sanitize-html';

describe('sanitizeContent in the browser', () => {
  it('strips handlers and keeps markup', () => {
    const out = sanitizeContent('<p>ok</p><img src=x onerror="alert(1)">');
    expect(out).toContain('<p>ok</p>');
    expect(out).not.toContain('onerror');
  });
});
