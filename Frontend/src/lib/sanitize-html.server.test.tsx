// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { sanitizeContent, useSanitizedHtml } from './sanitize-html';

const PAYLOAD = '<p>ok</p><img src=x onerror="alert(1)">';

function Probe({ html }: { html: string }) {
  const safe = useSanitizedHtml(html);
  return <div dangerouslySetInnerHTML={{ __html: safe }} />;
}

describe('sanitize-html without a DOM (the SSR pass)', () => {
  it('never returns the raw input', () => {
    expect(sanitizeContent(PAYLOAD)).toBe('');
  });

  it('server-rendered markup carries no unsanitised HTML', () => {
    const html = renderToString(<Probe html={PAYLOAD} />);
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<img');
  });
});
